# Submission path budget

The total submitted additions, including the complete production export, must remain below 8,388,608 bytes. Budgets are upper bounds, not targets.

| Path | Budget | Purpose |
| --- | ---: | --- |
| `.gitignore` | 512 bytes | Exclude dependency and cache directories at every nesting level, scratch evidence and TypeScript build caches. Do not exclude `dist/`. |
| `src/` | 700,000 bytes | React, TypeScript, styling, and sourced post data. |
| `public/` | 1,500,000 bytes | Local illustrations, avatars, font, favicon, and share image. |
| `dist/` | 2,500,000 bytes | Complete static production export, including runtime assets. |
| `scripts/` | 60,000 bytes | Optional data maintenance utilities. |
| Root configuration and lockfile | 300,000 bytes | Reproducible frontend build. |
| Root documentation and `artifacts/` | 1,000,000 bytes | Design, setup, validation, attribution, and selected evidence. |

Total allocated: 6,060,512 bytes. Dependency installations and package-manager caches are excluded from the submission. No vendored registry, dependency archives, or submodules are needed.
