#!/usr/bin/env node
/**
 * Verifies every external URL in README.md resolves. Exists because the
 * activity-graph card returned 402 DEPLOYMENT_DISABLED for months and the
 * only symptom was a broken image nobody could see in a diff.
 *
 * Usage: node .github/scripts/check-links.mjs [path-to-readme]
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const README = process.argv[2] || "README.md";
const README_DIR = dirname(resolve(README));
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

// Local references (assets/*.svg) are just as invisible when broken: a renamed or
// deleted file renders as a blank gap in the profile with no error anywhere.
const localRefs = [
  ...new Set(
    [
      // HTML attributes. srcset holds "a.svg 1x, b.svg 2x"; split only on
      // comma+space so commas inside a query string survive.
      ...[...source.matchAll(/(?:src|srcset|href)="([^"]+)"/g)].flatMap((m) =>
        m[1].split(/,\s+/).map((part) => part.trim().split(/\s+/)[0])
      ),
      // Markdown images and links: ![alt](path) / [text](path)
      ...[...source.matchAll(/!?\[[^\]]*\]\(([^)\s]+)/g)].map((m) => m[1]),
    ]
      .filter((ref) => ref && !/^(?:https?:|#|mailto:|data:|\/)/.test(ref))
      .map((ref) => ref.replace(/^\.\//, ""))
  ),
].sort();

const missingLocal = localRefs.filter((ref) => !existsSync(resolve(README_DIR, ref)));
for (const ref of localRefs) {
  console.log(`${missingLocal.includes(ref) ? "FAIL" : "OK  "} local   ${ref}`);
}

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

const summary = `${urls.length} URLs checked · ${failures.length} failed · ${warnings.length} warnings`;
const localSummary = `${localRefs.length} local references · ${missingLocal.length} missing`;
console.log(`\n${summary}\n${localSummary}`);

if (failures.length > 0 || missingLocal.length > 0) {
  console.error("\nBroken references:");
  for (const ref of missingLocal) console.error(`  missing  ${ref}`);
  for (const f of failures) console.error(`  ${f.status || f.note}  ${f.url}`);
  process.exit(1);
}
