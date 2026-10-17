# Music workroom: its own look (Console with constellations)

The music workroom is its own application inside the site, with its own visual identity, built with Tailwind so it reads equally well on a phone and a desktop. The owner chose the **Studio Console** frame with each character's tune drawn as a **constellation** in the Story view. The owner is not a musician, so every view also explains itself: a built-in "How to read this" guide and a legend on every view.

Design references (owner-reviewed): the directions canvas, screen "B + C · Console with constellations" (https://claude.ai/artifact/5EBhrq1SEtTLyxLtLntE2S), and the reading guide (https://claude.ai/artifact/1aTpnqZzbdYNTT4VUV5mKs).

## What the owner gets

- **A dark studio console.** A graphite page, panels a step lighter, amber for time and the active control, green for "good / send / energy", red for recording and the Minotaur. Condensed uppercase labels, a monospace time readout, and plain body text.
- **The same screens, restyled:** the pieces list, the piece page (player, four view tabs, the views, the words in this piece, the change list), the glossary card, the sheet-music view and every error and empty state.
- **Constellations in the Story view.** Each motif is drawn as stars over the instrument lanes: one star per note of that motif, left to right in time, higher for a higher pitch, a bigger star for a louder note, the stars joined by a line in the character's colour, the character's name beside the first star. The energy curve becomes a soft glowing band behind everything. Lanes keep their note bars, dimmed, so the constellations read first.
- **"How to read this".** A button on every view opens a guided overlay of that view: numbered spots, one part lit at a time, a plain explanation, an everyday comparison and **Hear it**. Hear it plays a short clip cut from the piece's own audio at that part (the glossary's existing clip mechanism); where a part has no natural clip (for example "bar numbers") it plays a short built-in demo (Web Audio: counted clicks, a rising and a falling pair of notes, soft-to-loud). The guide opens by itself the first time each view is opened in this browser (a "seen" flag in localStorage, not a secret), and never again unless asked.
- **A legend on every view.** One compact row under each view: Story ("star = a note · higher = higher note · bigger = louder · glow = energy"), Piano roll ("bar = a note · higher = higher note · longer = held longer · colour = instrument"), Sound picture ("bottom = low sounds · top = high · brighter = louder"), Sheet music ("each line is a staff; notes higher on it are higher").
- **Phone and desktop.** At phone width everything stacks in one column with the answer panel as a bottom sheet. From 1024 px wide the piece page uses two columns: the views on the left, the notes and answers panel on the right, both visible at once. Every tap target is at least 44 px.
- **Nods to the site.** The site's red appears only as the record colour; the "All pieces" link leads back; the admin sign-in is unchanged. Nothing else is shared with the site's Bootstrap look.

## Approaches considered

- **Tailwind with our own tokens (chosen).** Tailwind v4 compiles at build time into one static stylesheet with only the classes the page uses. It fits the strict content security policy (`style-src 'self'`), works with Preact, and gives the workroom its own identity.
- **Stay on Bootstrap 5.** No new tooling, but it looks like a generic admin panel and like the rest of the site, which the owner wants to move away from.
- **Material Design 3.** Polished phone patterns, but an Android look, and in Preact it means adding Google's web components or imitating them by hand.
- **Ionic.** The most native feel on an iPhone, but a whole app framework (its own router and component set) for one page.

## How it is built

### Tailwind in the games kit

- `tailwindcss` and `@tailwindcss/cli` (v4, exact versions pinned) join the games package's dev dependencies. Build-time only: nothing from them ships except the compiled CSS, so the bundle licence check is unaffected; their licences are recorded in the kit README's tooling list.
- A game opts in with `"css": { "in": "src/app.css", "out": "workroom" }` in its `build.json`. `build.mjs` runs the Tailwind CLI on that entry (content: the game's `src/**/*.{ts,tsx}`), writes `dist/<out>.css`, and `--check` fails when the committed CSS is stale, exactly as it does for JavaScript. Games without the key build as before.
- `music/lib/Pages.php` links `../games/workroom/dist/workroom.css?v=<hash>` in place of `music/music.css`, and `music_asset_version` hashes it with the two scripts. `music/music.css` is removed; `deploy.sh` ships `games/workroom/dist/workroom.css` with the other dist files.
- No inline `style="…"` attributes: the CSP blocks them. Dynamic values (positions on the timeline, colours from score data) are set through Preact `style` props, which set properties on the element and are not blocked, or as SVG attributes.

### Fonts

- Barlow (400, 500, 600), Barlow Condensed (600) and IBM Plex Mono (400, 500), all SIL Open Font License, as woff2 files committed under `games/workroom/fonts/` with their licence texts, copied to `dist/fonts/` by the build and listed in `THIRD_PARTY_LICENSES.txt`. The CSP's `default-src 'self'` allows them; no Google Fonts request is made.
- Fallbacks: `system-ui, -apple-system, "Segoe UI", sans-serif` and `ui-monospace, Menlo, monospace`.

### Tokens

Defined once in `src/app.css` with Tailwind's `@theme`, used everywhere by name:

| Token | Value | Use |
| --- | --- | --- |
| `--color-ground` | `#121519` | page |
| `--color-panel` | `#1b1f25` | cards, bars, the answer sheet |
| `--color-well` | `#0d0f12` | the drawing surface of a view |
| `--color-lane` | `#161a20` | one instrument lane |
| `--color-rule` | `#2a3039` | borders, grid lines |
| `--color-ink` | `#e8eaee` | body text |
| `--color-dim` | `#9aa3b0` | labels, secondary text (≥ 4.5:1 on panel) |
| `--color-amber` | `#f5b942` | time, playhead, active tab, selected |
| `--color-go` | `#3ddc84` | send, saved, energy |
| `--color-record` | `#e2574c` | record / hum |
| `--font-display` | Barlow Condensed | titles, tab labels (uppercase) |
| `--font-body` | Barlow | everything else |
| `--font-mono` | IBM Plex Mono | time, bar numbers, small caps labels |

Character and lane colours stay data (`score.json` `characters[].color`, `lanes[].color`); the page lightens or darkens a data colour only to reach 3:1 against `--color-well` for marks and 4.5:1 for its label text, with a unit test on that adjustment.

The workroom is dark only. A light mode is out of scope.

### Components

One small Preact component per recurring part, each styled only with tokens: `Button` (primary, secondary, ghost, record), `Tabs`, `Chip` (a glossary word), `Panel`, `Sheet` (the bottom sheet on a phone, the side panel on a desktop), `Readout` (time and bar), `Legend`, `GuideOverlay`. The existing views keep their logic and gain the new classes.

### Constellation drawing

A DOM-free module `src/constellation.ts` turns a score into stars: for each motif span, the notes in that lane between `from` and `to`, each placed at its time (x) and pitch (y within the lane's band, scaled to the motif's own pitch range so a small tune still has shape), sized by velocity (three sizes), joined in time order. A motif span with no notes in its lane draws its ribbon (today's look) instead. Unit tests cover the placement, the sizing and the empty-span fallback with the Crete fixture.

### "How to read this" guide

- `src/guide.ts` (DOM-free) holds, per view, the numbered parts: their spot on the view (from the layout: first section, first lane, a note bar, a motif's first star, the energy band, the playhead, the ruler), the text, the comparison and the clip (piece time span, or a built-in demo id).
- `GuideOverlay` dims everything but the lit part, shows the card (Back, Next, Hear it, Close) and moves focus to it; Close returns focus to the button that opened it. Keyboard: Tab and Enter work; no Escape handler (the games' rule that Escape is never bound holds here too).
- The text is the reading guide's, reviewed by the owner.

## Delivery

This changes the music workroom plan's delivery:

1. **PR 3** — the answering tools without UI: sealing in the browser, the owner's key tool (`keys-*`, `api-key-set`) and pickup (plan Tasks 10–13).
2. **PR 4** — this spec: Tailwind in the kit, fonts, tokens, components, the restyle of every existing screen, constellations, the guide and legends.
3. **PR 5** — answering in the page (plan Tasks 14–15: pinned notes, humming, reactions, the energy curve, history, the outbox), built directly in the new look.

## Testing

- Kit: the CSS entry builds, `--check` fails on stale CSS, a game without `css` is unchanged (crete, cylon, tankity byte-identical).
- Units: constellation placement and fallback; colour contrast adjustment; guide parts resolve to on-screen spots for both fixtures (music and sound); the "seen" flag.
- Browser (`make music-e2e`): every screen at 390 px and 1280 px; the guide opens on first visit, Next walks every part, Hear it starts playback, Close returns focus; no element overflows the viewport at 390 px; the CSP allows the stylesheet and fonts (no console CSP errors).
- Screenshots of every screen at both widths go to the owner before merge.

## Out of scope

A light mode; per-project themes; animation beyond the guide's highlight and the playhead; changing the admin login's own pages.
