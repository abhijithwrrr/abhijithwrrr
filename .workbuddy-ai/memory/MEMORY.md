# Project memory — abhijithwrrr profile README

## Purpose
GitHub profile README repo (`abhijithwrrr/abhijithwrrr`). Not a code project: one
README plus generated SVG assets. Optimized for **peer developers**, not recruiters.

## Brand palette (use these, nothing else)
| Role | Dark | Light |
|---|---|---|
| Background | `#0E0D0B` | `#F2EFE8` |
| Text | `#E8E4DA` | `#2A2825` |
| Muted | `#8A8378` | `#6B655C` |
| Accent | `#D86A45` | `#9B3A1C` |
| Accent deep | `#5C2210` | `#5C2210` |

Do not reintroduce `#C5A55A` (old gold) or `#6C63FF` (old purple).

## Assets are generated, never hand-edited
`assets/contributions-{dark,light}.svg` and `assets/activity-{dark,light}.svg` come from
`.github/scripts/generate-contributions.mjs`:

```bash
GH_TOKEN=$(gh auth token) GH_LOGIN=abhijithwrrr node .github/scripts/generate-contributions.mjs
```

Output is deterministic (no timestamps), which is what makes the workflow's
`git diff --quiet` guard work. The script refuses to write if the token sees fewer
than 100 contributions, so a public-only token can't silently erase private activity.

## Facts that keep getting misstated
- **AuraSpend** is `auraspend/auraspend`, **AGPL-3.0** (not Apache 2.0), public.
- **Bolt** Play listing is dead (404). Never call it "Production" or link the store.
  It is a commercial/private build.
- **Hydra** is the only live listing: 4.9★, 1,000+ downloads, 60+ locales.
- **`abhijithwrrr/resume` is a placeholder template** (fake phone, `example.com`, fake
  US employers). Never link it; archive or replace it.
- `github-readme-activity-graph.vercel.app` is dead (402). Do not re-add.

## Repo conventions
- Default branch is literally named **`origin`** (rename to `main` is planned).
- Work happens on `dev`.
- No stats-card walls. Two self-hosted visuals maximum.
- Third-party widgets are allowed but every one must pass `check-links.mjs`, which
  runs weekly and fails the build on a broken URL.
- `check-links.mjs` also verifies local `assets/*.svg` references, so deleting or
  renaming a generated file fails CI instead of silently rendering a blank gap.

## Changed 2026-10-19 (second pass on `dev`)
- Header is now theme-aware (`<picture>`): dark uses `D86A45→5C2210`, light `9B3A1C→5C2210`.
- "Now" list became a table with status links; ZenTask was promoted from a one-liner
  to a full case study with its own `<sub>` metadata line and `<details>` notes.
- Added an in-page nav line under the badges (all anchors verified).
- Badge colors moved off `5C2210`/`D86A45` (too dark / too light on the light page)
  to `9B3A1C`, the documented light-mode accent.
- Fixed a generator bug: the calendar month-label pass skipped **Nov 2025** because
  the first label (Oct) was only 1 column wide and consumed the 3-week budget.
  Transitions are now collected first and a leading stub is dropped.
- `check-links.mjs` now checks local references (HTML `src`/`srcset`/`href` and
  Markdown links), and CI also runs on PRs touching the README or the script.
