#!/usr/bin/env node
/**
 * Verifies every external URL in README.md resolves. Exists because the
 * activity-graph card returned 402 DEPLOYMENT_DISABLED for months and the
 * only symptom was a broken image nobody could see in a diff.
 *
 * Usage: node .github/scripts/check-links.mjs [path-to-readme]
 */

import { readFileSync } from "node:fs";

const README = process.argv[2] || "README.md";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

// LinkedIn answers 999 to non-browser clients; it is not a real failure.
const BOT_BLOCKED = new Set([999]);
// Shields and similar CDNs rate-limit CI; warn but do not fail the build.
const SOFT = new Set([429]);

const source = readFileSync(README, "utf8");
const urls = [
  ...new Set(
    (source.match(/https?:\/\/[^\s"'<>)\]]+/g) || []).map((u) => u.replace(/[.,;]+$/, ""))
  ),
].sort();

if (urls.length === 0) {
  console.error("No external URLs found — has the README changed shape?");
  process.exit(1);
}

const failures = [];
const warnings = [];

for (const url of urls) {
  let status = 0;
  let note = "";
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: "*/*" },
    });
    clearTimeout(timer);
    status = res.status;
  } catch (error) {
    note = error.name === "AbortError" ? "timeout" : error.message;
  }

  const ok = status >= 200 && status < 400;
  const blocked = BOT_BLOCKED.has(status);
  const soft = SOFT.has(status);

  const label = ok ? "OK  " : blocked ? "SKIP" : soft ? "WARN" : "FAIL";
  console.log(`${label} ${String(status || note).padEnd(7)} ${url}`);

  if (!ok && !blocked && !soft) failures.push({ url, status, note });
  else if (soft) warnings.push({ url, status });
}

console.log(`\n${urls.length} URLs checked · ${failures.length} failed · ${warnings.length} warnings`);

if (failures.length > 0) {
  console.error("\nBroken references:");
  for (const f of failures) console.error(`  ${f.status || f.note}  ${f.url}`);
  process.exit(1);
}
