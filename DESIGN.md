# The Pond design system

## Overview

The Pond is an independent reader for sourced IdentityMD tweets. The requested direction, “dark green with a theme of pepes armed with AI,” is implemented as a forest green field station: restrained interface chrome, lime actions, and an original illustrated frog wearing a headset and carrying an AI processor. Original post media gives the feed its community character.

The reusable hierarchy is navigation → product title and browse action → search and topic controls → posts. Desktop has a navigation rail, a compact two-column feed, and a community rail. Mobile puts the product, browse action, search, filters, and first post before supplementary content. The hero is specific to the feed; saved tweets use a smaller functional heading.

Source of truth: [src/styles.css](src/styles.css), [src/App.tsx](src/App.tsx), and [src/data.ts](src/data.ts). Rendered evidence is in [artifacts/validation.md](artifacts/validation.md).

## Colors

Canonical values use hexadecimal sRGB. Primitives are defined in `:root`; components use the semantic aliases below.

| Semantic token | Value | Role |
| --- | --- | --- |
| `--color-bg` | `#0a160f` | Page background |
| `--color-bg-subtle` | `#0d1c13` | Navigation and unselected filters |
| `--color-surface` | `#112218` | Tweet cards, dialogs, search |
| `--color-hover` | `#182d1f` | Neutral hover state |
| `--color-selected` | `#203b29` | Active navigation and topic controls |
| `--color-border` | `#2b4834` | Structural borders and dividers |
| `--color-control-border` | `#617d61` | Search, sort, and copy-link input boundaries |
| `--color-text` | `#eaf0e4` | Primary text |
| `--color-muted` | `#9cae9c` | Secondary text, dates, icons, metrics |
| `--color-accent`, `--color-focus` | `#b7f56b` | Primary action, focus, selected bookmark, title accent |
| `--color-accent-hover` | `#c9ff8d` | Primary action hover |
| `--color-on-accent` | `#0a160f` | Primary button and notification text |

The feed hero uses `#1b3424` with secondary text `#c5d2be`. Mentions use `#c6e1a9`; the four static topic labels use muted greens from their `.topic-*` rules. These are display treatments, not additional status systems. Post claims are quoted content, never UI status.

Measured pairs: primary text on card 14.29:1; muted text on card 7.07:1; primary button text on lime 14.36:1; field boundary against card 3.65:1 and page 4.07:1. These are identified sRGB pairs, not a claim that every image has a measured contrast ratio. Review details and automated contrast coverage are in the validation report.

## Typography

One family: **Manrope**, with `sans-serif` fallback. The local variable WOFF2 is `public/fonts/manrope-latin.woff2`; it supplies the used upright weights 400, 600, and 700. `font-display: swap` and an HTML preload make loading explicit. No remote font request is needed. The browser confirmed the intended font loaded.

| Token | Size | Role |
| --- | ---: | --- |
| `--text-caption` | 12px | Dates, handles, post metrics, topic filters, notes |
| `--text-ui` | 14px | Navigation, buttons, author names, supporting copy |
| `--text-body` | 16px | Tweet text and mobile form controls |
| `--text-title` | 20px | Section titles and wordmark |
| `--text-heading` | 32px | Mobile hero, saved heading, desktop dialog heading |
| `--text-display` | 48px | Desktop hero |

Body defaults to line-height 1.5. Tweets use 1.65 and dialog paragraphs 1.75. Headings use 1.2; the short hero uses 1.1 (1.12 on phones). Hero tracking is −0.045em on desktop and −0.04em on phones; section titles use −0.025em. Body copy uses natural tracking. Headings balance; descriptions use `text-wrap: pretty`. Handles and quotes wrap rather than truncate. Counts use tabular numerals. Source tweets preserve their authors’ spelling and glyphs.

## Layout

The declared spacing scale is 4, 8, 12, 16, 20, 24, 32, and 40px (`--space-*`). The stylesheet uses these increments throughout, with component-specific 18, 22, 28, 30, 36, and 48px optical/density adjustments. Cards use 18px inset, 16px column gaps, and at least 16px vertical separation. Mobile page margins are 20px, reduced to 16px at 360px and below.

The shell has a 218px navigation column and a flexible page. The page is capped at 1490px including inline padding. Above 1260px, `.content-layout` reserves 264px for the community rail with a 28px gap. Tweet cards form two columns with 8px grid tracks; `PostCard` observes its intrinsic height and spans the required tracks. This closes empty grid gaps without clipping content or reordering the DOM.

| Breakpoint | Behavior |
| --- | --- |
| Above 1640px | Page insets increase to 48px; hero art occupies 46% |
| At 1260px and below | Community rail disappears; the feed gets the available width |
| At 960px and below | Navigation becomes a 76px icon rail; accessible names remain explicit |
| At 720px and below | Feed becomes a single normal-flow column; hero title becomes 32px |
| At 580px and below | Navigation becomes a top bar; secondary header disappears; search and sort remain side by side; art moves below the headline on the right |
| At 360px and below | Page margins and filter gaps tighten; topic controls wrap when needed |

Navigation and filters wrap under expanded text spacing. Directional spacing uses logical properties; the notification uses physical `left: 50%` for geometric centering in both writing directions. Real browser checks covered 320–1920px, plus RTL and expanded text spacing. A 720px layout was checked as the CSS reflow equivalent of a 1440px desktop at 200% zoom; native browser zoom and translated locales were not tested.

## Elevation & Depth

The interface is flat: tonal surfaces and one-pixel structural borders, without drop shadows. The hero art has its own contained stacking context. Avatars and original media use a low-opacity white outline. Native modal dialogs get a dark translucent backdrop and browser-managed background inertness. Notifications sit above the page at z-index 30, inset from the safe area.

## Shapes

`--radius-small` is 6px for topic controls, media, and icon buttons. `--radius-control` is 8px for buttons and fields. `--radius-panel` is 12px for tweet cards, the hero, and the welcome panel. Dialogs use 16px, avatars are circles, and status dots are small circles. Text containers have no fixed height; images preserve their intrinsic proportions. The tall mechanical-Pepe image uses `object-fit: contain` within a 300px preview and links to the original.

## Components

- **Navigation** (`App`, `.main-nav`, `.nav-item`): real hash links for feed and saved views, a button for About. Active links expose `aria-current`; icon-only layouts keep explicit names. Saved count is computed from browser state.
- **Buttons** (`.button.primary`, `.button.secondary`, `.icon-button`): lime for the main browse/recovery action, outlined for secondary actions, established footer zones for card controls. Primary targets are at least 44px on mobile; compact topic and utility controls meet the probe’s 24px/spacing baseline.
- **Search and sort** (`.search-box`, `.sort-control`): a real labeled search input and native select. Search applies immediately across post text, topic, author, and handle; `@` and `#` prefixes are accepted. Clear search preserves focus. Mobile inputs and select use 16px type.
- **Topic filters** (`.filter-row`, `.filter`): native buttons with `aria-pressed`; selection has a border and background in addition to color. Filters combine with search and the saved view. Results announce through a polite live region.
- **`PostCard`** (`src/App.tsx`): takes `post`, `saved`, `onSave`, and `onCopy`. Shows source author, date, excerpt, optional original media, and snapshot engagement. Metrics are read-only. Original post/profile links open X. Bookmark is the only local preference toggle and exposes `aria-pressed`.
- **Saved state** (`loadSaved`, `toggleSaved`): `the-pond:saved:v1` in local storage. Invalid values recover safely. Storage denial retains in-memory saves and displays a persistent explanation. Removing a saved card moves focus to another bookmark or the empty-state action.
- **Dialogs** (`.dialog`, `containDialogFocus`): native `showModal`, labeled headings, explicit close buttons, Tab/Shift+Tab containment, Escape dismissal, and focus restoration. About explains sourcing and ranking. Clipboard denial opens a selectable link field.
- **Empty and end states** (`.empty-state`, `.feed-end`): saved-empty directs back to the feed; search-empty offers Clear filters; exhausted data says the snapshot is complete. There is no asynchronous feed request, fake loading state, or simulated engagement.
- **Notifications** (`.toast`): brief, non-actionable save/copy confirmation in a polite status region. Errors and storage limitations are persistent rather than disappearing in a toast.

Keyboard focus uses a 2px lime outline with offset. The search field draws its perimeter on the containing field using `:has(input:focus-visible)`. Forced colors use `Highlight`. Hover and press transitions are 150ms with `cubic-bezier(.2, 0, 0, 1)` and an exact 0.96 press scale; all are opt-in under `prefers-reduced-motion: no-preference`. There is no autonomous animation.

## Do’s and Don’ts

- Start a related page with `.app-shell`, `.page`, the existing navigation, and the same semantic tokens. Give it one `h1` and reuse the 20px section level.
- Use real links for destinations and buttons for state changes. Provide a text name even when a responsive layout hides the visible label.
- Reuse the flat card and focus treatments; keep tweet text selectable, wrapped, and in DOM ranking order.
- To add a source post, update `src/data/posts.json`, copy necessary media locally, record the original URL and actual capture counts, and rebuild. Update the displayed snapshot date and verification record together.
- Keep the independent snapshot description visible through About. Do not add invented counts, simulated live updates, local likes presented as X engagement, or a wallet flow.
- Keep the illustrated frog and lime accent as the visual signature. Do not add another typeface, glow system, gradient text, or competing promotional panels.

Design guidance attribution and licenses: [artifacts/ATTRIBUTION.md](artifacts/ATTRIBUTION.md).
