#!/usr/bin/env node
/**
 * Generates assets/contributions-{dark,light}.svg from the real GitHub
 * contribution calendar. Deterministic output: identical data produces
 * byte-identical files, which is what makes the workflow's diff guard work.
 *
 * Requires GH_TOKEN with read:user (a classic PAT owned by the profile user).
 * GITHUB_TOKEN alone only sees public activity and would understate the total.
 *
 * Usage: GH_TOKEN=$(gh auth token) GH_LOGIN=abhijithwrrr node generate-contributions.mjs
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const LOGIN = process.env.GH_LOGIN || "abhijithwrrr";
const TOKEN = process.env.GH_TOKEN;
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../assets");

if (!TOKEN) {
  console.error("GH_TOKEN is required (needs read:user scope).");
  process.exit(1);
}

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              weekday
            }
          }
        }
      }
    }
  }
`;

const PALETTES = {
  dark: {
    empty: "#221F1B",
    levels: ["#221F1B", "#4A2418", "#7A2E17", "#B04A26", "#D86A45"],
    text: "#E8E4DA",
    muted: "#8A8378",
  },
  light: {
    empty: "#E6E0D4",
    levels: ["#E6E0D4", "#F2C9B8", "#E8A184", "#D86A45", "#9B3A1C"],
    text: "#2A2825",
    muted: "#6B655C",
  },
};

const CELL = 11;
const PITCH = 13;
const X0 = 40;
const Y0 = 30;
const WEEKS = 53;
const WIDTH = X0 + WEEKS * PITCH - (PITCH - CELL) + 40;
const HEIGHT = Y0 + 7 * PITCH + 30;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Bucket by observed distribution (p50=1, p75=3, p90=11), not linear quartiles. */
function level(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 6) return 2;
  if (count <= 14) return 3;
  return 4;
}

function render(calendar, palette) {
  const weeks = calendar.weeks;
  const total = calendar.totalContributions;
  const cells = [];

  weeks.forEach((week, wi) => {
    week.contributionDays.forEach((day) => {
      const x = X0 + wi * PITCH;
      const y = Y0 + day.weekday * PITCH;
      const fill = palette.levels[level(day.contributionCount)];
      cells.push(
        `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${fill}"/>`
      );
    });
  });

  // Month labels, only when at least 3 columns have passed since the last one.
  const monthLabels = [];
  let lastMonth = -1;
  let lastLabelWeek = -99;
  weeks.forEach((week, wi) => {
    const first = week.contributionDays[0];
    if (!first) return;
    const month = Number(first.date.slice(5, 7)) - 1;
    if (month !== lastMonth) {
      if (wi - lastLabelWeek >= 3) {
        monthLabels.push(
          `<text x="${X0 + wi * PITCH}" y="${Y0 - 12}" font-size="10" fill="${palette.muted}">${MONTHS[month]}</text>`
        );
        lastLabelWeek = wi;
      }
      lastMonth = month;
    }
  });

  // Weekday labels on Mon/Wed/Fri, the only rows with room to breathe.
  const weekdayLabels = [
    [1, "Mon"],
    [3, "Wed"],
    [5, "Fri"],
  ].map(
    ([wd, label]) =>
      `<text x="${X0 - 8}" y="${Y0 + wd * PITCH + 9}" font-size="10" text-anchor="end" fill="${palette.muted}">${label}</text>`
  );

  // Legend, aligned with the footer baseline and anchored to the right edge.
  const legendY = HEIGHT - 14;
  const moreX = WIDTH - 40 - 26;
  const lastSwatchX = moreX - 8 - CELL;
  const firstSwatchX = lastSwatchX - 4 * PITCH;
  const lessX = firstSwatchX - 8;
  const swatches = palette.levels
    .map(
      (fill, i) =>
        `<rect x="${firstSwatchX + i * PITCH}" y="${legendY - 9}" width="${CELL}" height="${CELL}" rx="2" fill="${fill}"/>`
    )
    .join("");

  const footer = `${total.toLocaleString("en-US")} contributions · last 12 months`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-labelledby="t d">
<title id="t">Contribution calendar</title>
<desc id="d">${footer}</desc>
<g font-family="ui-sans-serif, -apple-system, 'Segoe UI', sans-serif" shape-rendering="geometricPrecision">
${cells.join("\n")}
${monthLabels.join("\n")}
${weekdayLabels.join("\n")}
<text x="${X0}" y="${legendY}" font-size="10" fill="${palette.muted}">${footer}</text>
<text x="${lessX}" y="${legendY}" font-size="10" text-anchor="end" fill="${palette.muted}">Less</text>
${swatches}
<text x="${moreX}" y="${legendY}" font-size="10" fill="${palette.muted}">More</text>
</g>
</svg>
`;
}

/**
 * Monthly cadence chart. The 12-month window starts and ends mid-month, so the
 * edge bars are flagged partial — otherwise the first and last months read as
 * a productivity dip that never happened.
 */
function renderActivity(calendar, palette) {
  const days = calendar.weeks.flatMap((w) => w.contributionDays);
  const firstDate = days[0].date;
  const lastDate = days.at(-1).date;

  const buckets = new Map();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    if (!buckets.has(key)) buckets.set(key, { key, total: 0, partial: false });
    buckets.get(key).total += day.contributionCount;
  }

  const months = [...buckets.values()];
  const lastDayOf = (key) => {
    const [y, m] = key.split("-").map(Number);
    return String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0");
  };
  months.forEach((bucket) => {
    bucket.partial =
      firstDate > `${bucket.key}-01` || lastDate < `${bucket.key}-${lastDayOf(bucket.key)}`;
  });

  const W = 780;
  const H = 150;
  const LEFT = 40;
  const TOP = 44;
  const BASE = 112;
  const MAX_H = 64;
  const pitch = (W - LEFT * 2) / months.length;
  const barW = Math.min(40, pitch - 16);
  const peak = Math.max(...months.map((m) => m.total), 1);

  const bars = months.map((bucket, i) => {
    const h = Math.max(2, Math.round((bucket.total / peak) * MAX_H));
    const x = LEFT + i * pitch + (pitch - barW) / 2;
    const y = BASE - h;
    const fill = palette.levels[bucket.partial ? 3 : 4];
    const opacity = bucket.partial ? ' opacity="0.5"' : "";
    const label = MONTHS[Number(bucket.key.slice(5, 7)) - 1];
    return [
      `<rect x="${x.toFixed(1)}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${fill}"${opacity}/>`,
      `<text x="${(x + barW / 2).toFixed(1)}" y="${y - 6}" font-size="9" text-anchor="middle" fill="${palette.muted}">${bucket.total}</text>`,
      `<text x="${(x + barW / 2).toFixed(1)}" y="${BASE + 15}" font-size="10" text-anchor="middle" fill="${palette.muted}">${label}${bucket.partial ? "*" : ""}</text>`,
    ].join("\n");
  });

  const total = calendar.totalContributions.toLocaleString("en-US");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="at ad">
<title id="at">Contributions by month</title>
<desc id="ad">${total} contributions over the last 12 months, shown per month</desc>
<g font-family="ui-sans-serif, -apple-system, 'Segoe UI', sans-serif" shape-rendering="geometricPrecision">
<text x="${LEFT}" y="20" font-size="10" fill="${palette.muted}">Contributions by month</text>
${bars.join("\n")}
<line x1="${LEFT}" y1="${BASE + 0.5}" x2="${W - LEFT}" y2="${BASE + 0.5}" stroke="${palette.levels[0]}" stroke-width="1"/>
<text x="${W - LEFT}" y="${H - 6}" font-size="9" text-anchor="end" fill="${palette.muted}">* partial month</text>
</g>
</svg>
`;
}

const response = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: {
    Authorization: `bearer ${TOKEN}`,
    "Content-Type": "application/json",
    "User-Agent": "profile-assets",
  },
  body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
});

if (!response.ok) {
  console.error(`GitHub API returned ${response.status}: ${await response.text()}`);
  process.exit(1);
}

const payload = await response.json();
if (payload.errors) {
  console.error(JSON.stringify(payload.errors, null, 2));
  process.exit(1);
}

const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
if (!calendar) {
  console.error(`No contribution calendar for ${LOGIN}.`);
  process.exit(1);
}

// Guard: never overwrite good assets with a partial/unauthenticated result.
if (calendar.totalContributions < 100) {
  console.error(
    `Refusing to write: only ${calendar.totalContributions} contributions returned. ` +
      `This usually means the token cannot see private activity.`
  );
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, palette] of Object.entries(PALETTES)) {
  writeFileSync(resolve(OUT_DIR, `contributions-${name}.svg`), render(calendar, palette), "utf8");
  writeFileSync(resolve(OUT_DIR, `activity-${name}.svg`), renderActivity(calendar, palette), "utf8");
}

const days = calendar.weeks.flatMap((w) => w.contributionDays);
const max = Math.max(...days.map((d) => d.contributionCount));
const active = days.filter((d) => d.contributionCount > 0).length;
console.log(
  `Wrote contributions-{dark,light}.svg and activity-{dark,light}.svg · total=${calendar.totalContributions} ` +
    `days=${days.length} active=${active} max=${max} range=${days[0].date}..${days.at(-1).date}`
);
