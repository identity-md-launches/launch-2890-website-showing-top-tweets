# The Pond

A dark green, Pepe-inspired website for discovering top IdentityMD tweets. Search by text or author, filter four topics, sort by captured likes or publication date, save posts in your browser, and copy original-post links.

The application includes **12 real, sourced posts from seven accounts**, captured on **2 November 2026**. It is a selected, dated collection rather than a live or exhaustive X feed. Every post links to its original. Engagement is read-only; bookmarks stay in the current browser. No account, wallet, backend, API key, or remote runtime asset is required.

## Install and develop

Tested with Node.js 24.21.0 and npm 11.19.0. Use Node.js 24 or newer.

```sh
npm ci
npm run dev
```

Open the local URL Vite prints. Source is React, TypeScript, and CSS; dependencies are pinned in `package-lock.json`.

## Preview the delivered export

The finished, complete production website is included in **`dist/`**. After installing dependencies:

```sh
npm run preview -- --port 4173
```

Alternatively, serve the already-built files without installing frontend packages:

```sh
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173/`. Serve it over HTTP rather than opening `index.html` as a `file:` URL. The app uses hash navigation and relative asset URLs (`base: './'`), so it also works below a static hosting subpath. The interaction check actually served it at `/pond/` without route rewriting. HTTPS or localhost enables automatic clipboard copying; other contexts get a selectable-link fallback.

## Typecheck and rebuild

```sh
npm run typecheck
npm run build
```

`build` regenerates `dist/index.html` and its complete local assets. Keep `dist/` with the source and lockfile: a static host can serve it directly. Do not include dependency or cache directories. The explicit submission allocations are in [PATH_BUDGET.md](PATH_BUDGET.md).

## Checks actually run

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed, exit 0 |
| `npm run build` | Passed, exit 0 |
| Production-export interaction suite | 22/22 passed in Chromium, including nested-path hosting |
| Pinned taste@1 review | 16/16 passed, offline, at 320/390/1440px |
| axe-core accessibility checks | No automated violations in mobile feed, desktop feed, saved-empty, or About |
| Additional responsive checks | No overflow at 320, 390, 580, 720, 840, 960, 1260, 1440, or 1920px |
| First screen at 390 × 844 | Product, browse action, search, filters, first tweet, and bookmark visible |
| Original post verification | 12/12 direct permalinks matched exact ID, author, timestamp, and displayed excerpt |

The checks exercised filtering, combined search, sorting, pagination, keyboard bookmark toggling, saved-state reload/history, malformed and blocked storage, clipboard success and denial, dialog focus containment and Escape, desktop topic shortcuts, reduced motion, RTL, and expanded text spacing. Console, script, local resource, and external runtime request error lists were empty.

WebKit could not launch because its host system libraries are missing, so Safari was **not tested**. A real screen reader, native browser zoom, and real mobile hardware were not tested. The About audit has four contrast items requiring manual review on the dimmed, inert background; it reported no violations. Automated checks do not certify accessibility. Full coverage, fixes, results, and screenshots: [artifacts/validation.md](artifacts/validation.md).

To rerun the durable interaction suite, install browser tooling outside this repository:

```sh
npm install --prefix /tmp/pond-checks playwright@1.64.1
PLAYWRIGHT_BROWSERS_PATH=/tmp/pond-browsers /tmp/pond-checks/node_modules/.bin/playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=/tmp/pond-browsers PLAYWRIGHT_MODULE=/tmp/pond-checks/node_modules/playwright/index.mjs node scripts/check-interactions.mjs
```

The script starts its own static server for `dist/` and writes its results to `test/scratch/interactions.json`. System browser libraries must be installed where required. Development and production builds do not depend on Playwright.

## Content and design maintenance

- `src/data/posts.json`: original post IDs and links, topic, excerpt, publication timestamp, snapshot engagement, and author/asset attribution. Replace or extend it with verified posts; keep the snapshot date in `capturedAt`, the visible feed date, and About copy consistent. Update `artifacts/source-verification.json` when capturing a new snapshot.
- `public/`: locally bundled media, avatars, the original field-agent illustration, favicon, font, and 1200 × 630 share card. Vite copies these into `dist/`.
- `src/styles.css`: final tokens, responsive rules, focus states, and motion.
- `scripts/create-share.mjs`: optional share-card regeneration using the same externally installed Playwright module and `PLAYWRIGHT_MODULE` setting. Rebuild after regenerating it.
- [DESIGN.md](DESIGN.md): implemented design system, component behavior, and responsive rules.
- [artifacts/ATTRIBUTION.md](artifacts/ATTRIBUTION.md): guidance attribution, licenses, content sources, and ranking limitations.

The static site makes no automatic feed refresh request. Updating the collection requires a new build. External X pages may require login or change after capture; the locally bundled excerpts remain readable.
