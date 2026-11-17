# Task 5 Report: Desolate world-ended look (fade-in)

## Status
**Complete**

## Commits
- `21b3a6a` — Fade the page into a desolate cracked look while the game is on.

## Changes
### `websites/www.cs/custom.css`
- Added `body.cylon-world-ended` with `--cylon-desolate-fade: 1.1s`.
- Scoped filter/grayscale wash to `main`, `#nav-main`, `#nav-contact`, and `.page-panel` (excludes `.site-header` / game chrome).
- Heading/body text crack styling and h1 repeating-gradient crack lines.
- `prefers-reduced-motion`: shorter filter transition, lighter desaturation.

### `websites/www.cs/main.js`
- `syncWorldEndedLook()` toggles `body.cylon-world-ended` from `settings.gameEnabled`.
- Called at end of `setGameEnabled` and in `endGame` (covers early return via `endGame('quit')`).

## Test summary
- `node --check websites/www.cs/main.js` — pass.
- Manual (recommended): Game On → main/contact panels fade to ashy look; header/HUD unchanged; Game Off / game over → class removed, filter fades out.

## Concerns
- `background-clip: text` on h1 may reduce legibility in some browsers/themes; monitor contrast.
- Filter on `main` affects all descendants visually but not separate fixed game layers outside `main`.

## HTML
No `index.html` change; existing `<main>` + `#nav-main` / `#nav-contact` wrappers suffice.

---

## Review fix (Important Task 5 follow-up)

### Status
**Complete**

### Commit
- `a2af69b` — Fix desolate look fade-out, avoid double filters, and RM crack styles.

### Fix notes
- Base `#nav-main`, `#nav-contact`, `.page-panel`, `main`: `filter: none` + shared transition (with `var(--cylon-desolate-fade, 1.1s)` fallback) so removing `body.cylon-world-ended` eases filter off.
- Grayscale wash only on `#nav-main` / `#nav-contact` (single layer; no stacked `main` + `.page-panel` filters).
- `prefers-reduced-motion`: light ashy filter on panels only; crack text-shadow, color-mix, and h1 gradient clip neutralized.
- `#nav-contact h1` included in crack gradient rules (desktop) for parity with main nav.

### Test summary
- `node --check websites/www.cs/main.js` — pass.
