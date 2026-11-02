# Attribution and source notes

## Design guidance

The six-domain design review applies Jakub Krehel’s **Better Interface**, MIT, pinned commit [`267330e1adfc66a718fb65fa6918c1f06d0a689e`](https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-interface).

The implementation-only design documentation method is adapted from Paul Bakaus’s **Impeccable**, Apache-2.0, pinned commit [`9d715cc4f5564a990ca8345abfdd5df6dc9b41c8`](https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/document.md). It has been adapted here to document this site’s final source and measured checks.

The supplied combined copyright and license notices are preserved verbatim in [DESIGN-GUIDANCE-LICENSES.txt](DESIGN-GUIDANCE-LICENSES.txt). The reference guides and the taste probe were assignment inputs, not application dependencies.

## Runtime dependencies and art

- React and React DOM: MIT. Lucide icons: ISC, with its included Feather attribution. Notices are in `public/third-party-notices.txt` and are copied into `dist/`.
- Manrope: Mikhail Sharanda and Mirko Velimirovic, SIL Open Font License 1.1. The full license is in `public/fonts/OFL.txt` and `dist/fonts/OFL.txt`. Font source: [Manrope](https://github.com/sharanda/manrope), distributed locally from Google Fonts.
- The field-agent frog illustration, favicon, and share-card composition were drawn for this website as SVG/HTML. The share PNG can be regenerated with `scripts/create-share.mjs`. No generated-image service or remote image URL is required at runtime.
- Tweet text and original media belong to their respective authors. The application shows short excerpts or short complete posts, attribution, and direct original-post links. Downloaded media and profile photos retain their source association. The site is independent of X and does not assert an official IdentityMD affiliation.

## Post provenance

Discovery used public web search and public X profiles; final verification fetched each of the twelve original X permalinks directly. Embedded public JSON was parsed as data without executing page scripts. Each exact post ID, author handle, publication timestamp, and displayed excerpt matched its original post object. Short `t.co` URLs are removed from display; the original post remains one action away. Long posts are capped at 24 words and labeled with a Read full tweet link.

The captures are dated **2 November 2026**. The seven included accounts are `surfcoderepeat`, `0xfinne`, `damian_et`, `IMD_IdentityMD`, `nightshiftimd`, `yadfarms`, and `changelog_imd`. Display names for `yadfarms` and `changelog_imd` are simplified for legibility. No account is labeled “official” or given an invented verification badge.

[source-verification.json](source-verification.json) records all original URLs, real post IDs, timestamps, captured engagement, and direct-fetch matching results. [src/data/posts.json](../src/data/posts.json) is the application’s static data source.

“Most liked” sorts only this selected collection, using captured likes, then reposts, then publication time. Selection reflects a mix of building, agents, community, and memes; it does not establish exhaustive coverage or a global X ranking. Authors’ project and financial claims are quoted statements, not verified investment claims or endorsements by this site.
