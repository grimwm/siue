# Music Workroom Theme (PR 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the music workroom its own Studio Console look, dark and daylight, compiled with Tailwind v4 at build time, with constellations in the Story view and a built-in "How to read this" guide and a legend on every view, so PR 5 (answering) can be built straight on its components.

**Architecture:** The games kit's `build.mjs` learns one optional `css` entry per game: it runs the pinned Tailwind CLI on the game's `src/app.css`, writes `dist/<out>.css`, copies the game's woff2 fonts from a `fonts.json` manifest into `dist/fonts/` and adds their OFL texts to `THIRD_PARTY_LICENSES.txt`; `--check` covers all of it. The workroom defines its colour tokens once in `app.css` (`@theme static` for dark, `:root[data-theme="light"]` for light); a classic `dist/theme.js` in the page head sets `data-theme` before the first paint, and `main.ts` runs the live System/Dark/Light switch. New DOM-free modules (`tokens.ts`, `color.ts`, `theme.ts`, `constellation.ts`, `guide.ts`, `demo.ts`) carry every decision; thin Preact components (`src/ui/console/`) and the restyled views draw them. The PHP shells link the stylesheet and boot script from `games/workroom/dist/` and `music/music.css` goes away.

**Tech Stack:** Tailwind CSS 4.3.3 (`tailwindcss`, `@tailwindcss/cli`, dev-only), esbuild 0.28, TypeScript 7, Preact 11, `node:test` on Node 24, PHP 8.4 + PHPUnit 12 (`--testsuite site`), Playwright (local only, `make music-e2e`). Fonts: Barlow, Barlow Condensed, IBM Plex Mono (SIL OFL 1.1, latin woff2 from `@fontsource/*` 5.3.0, committed).

**Spec:** `docs/superpowers/specs/2026-10-17-workroom-theme-design.md` (owner-approved, binding). Design references in it: the directions canvas ("B + C · Console with constellations") and the reading guide, whose Story text Task 9 uses.

## Global Constraints

- **Branch:** `music/theme`, made from `docs/workroom-theme` (so the spec and this plan travel in the PR), in a worktree under `.claude/worktrees/`. The root checkout stays on `main`. All paths below are relative to the repository root unless a step says `cd`.
- **PR 3 (`music/answering`) merges first.** It edits `games/workroom/build.json` (`programs` gains `src/tsconfig.crypto.json`) and `games/workroom/tsconfig.json` (`files` gains `src/note.ts`). `music/theme` is made from `docs/workroom-theme` after PR 3 is in `main` (rebase `docs/workroom-theme` onto `main` first when PR 3 landed after the plan was written), so Task 3 starts from a `tsconfig.json` whose one-line `files` array already holds `src/note.ts`; every task here appends its files to that line and keeps `src/note.ts`. If a rebase still conflicts on that line, the answer is the union of both lists, then `node _kit/build/build.mjs workroom` rebuilds `dist/`. No task here touches PR 3's other files.
- **Tailwind:** `tailwindcss` and `@tailwindcss/cli`, both exactly `4.3.3`, in `games/package.json` `devDependencies` (exact pins, like the others). Build-time only; the compiled CSS keeps Tailwind's `/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */` banner.
- **No CDN, no inline styles.** The stylesheet is one static file, `games/workroom/dist/workroom.css`. No `style="…"` attribute in any PHP or HTML string and no `<style>` element; dynamic values go through Preact `style` props (CSSOM, not blocked by `style-src 'self'`) or SVG attributes. The CSP in `music/.htaccess` and `Music\Http::csp()` does not change.
- **Tokens, never colours.** Components name tokens (`bg-panel`, `text-dim`, `fill-amber`, …). `app.css` clears Tailwind's palette (`--color-*: initial`), so `bg-red-500` compiles to nothing. Colours from score data (`characters[].color`, `lanes[].color`, `sections[].color`) are passed through `readableOn()` (Task 3) before they mark or label anything. The only hex literals in `src/` are in `app.css`'s token blocks, `tokens.ts`, `color.ts` (white and black) and `pianoroll.ts`'s existing lane fallback.
- **Token values** are the spec's table plus two this plan adds (see Decisions): `--color-on-accent` (dark `#121519`, light `#ffffff`) and `--color-paper` (`#ffffff` in both).
- **Fonts:** Barlow 400/500/600, Barlow Condensed 600, IBM Plex Mono 400/500, latin subset woff2, committed under `games/workroom/fonts/` with their OFL texts and `fonts.json`; shipped from `dist/fonts/`. Fallbacks: `system-ui, -apple-system, "Segoe UI", sans-serif` and `ui-monospace, Menlo, monospace`. No Google Fonts request.
- **Storage keys** (localStorage, not secrets, shared origin so prefixed): `workroom-theme` = `system` | `dark` | `light`; `workroom-guide-<tab>` = `seen` for `story`, `roll`, `sound`, `sheet`. Blocked or missing storage never throws: theme falls back to System, the guide to "seen for this page view".
- **Layout:** one column below 1024 px (Tailwind `lg`), the notes sheet a bottom sheet; from 1024 px two columns (views left, notes right). Every HTML tap target is at least 44 × 44 px (`min-h-11 min-w-11`).
- **Escape is never bound** by workroom code (no `keydown` handler reacts to it), as in the games.
- **CI is not changed:** no edits to `.github/`, `tests/e2e/select.ts`, `compose.yaml`, or the Makefile's `test` and `e2e` targets. (`select.ts` maps changes to `games/package*.json`, `_kit/**` and `music/lib/*.php` to the full browser suite, so CI runs all of it on this PR; that is expected.) The browser check stays `tests/e2e/workroom.local.ts`, run only by `make music-e2e`. No `*.spec.ts` is added.
- **Ports and docker:** never bind 3000, 5173, 8000 or 8080. Docker only through `make music-e2e` (its own unique `-p music-e2e-<pid>` project, torn down with `down -v`). Never touch the `siue` project, never prune, never SSH/SFTP to www.cs.
- **Text:** comments and docs describe the current state, never history ("was", "now", "used to", "kept from"). Nothing secret is committed.
- **Tests:** unit tests are `*.test.ts` under `games/workroom/test/` or `games/_kit/build/`, run by `sh games/units.sh`; no `any`, `@ts-ignore` or `@ts-nocheck`; `as unknown as` only with a one-line reason. Components are tested with `importTsx` and `_kit/test/dom-stub.ts`.
- **Per-task gate** (from `websites/www.cs`): `(cd games && npm run --silent check)` and `sh games/units.sh`; tasks touching PHP also `vendor/bin/phpunit --testsuite site`.
- **Commits** end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
  ```

## Review Focus

1. **A remembered Light choice on a dark device paints light from the first frame** (and blocked storage gives System, never an exception). A module script at the end of `<body>` runs after the first paint, so the boot is a classic script in `<head>`. Pinned in Task 4 (`theme.test.ts`: `applyTheme` from stored, garbage, throwing and missing storage) and Task 8 (`MusicPagesTest`: `theme.js` is a plain `<script src>` in `<head>`, before the stylesheet, on every page shell and the error page).
2. **A score colour that vanishes on one theme**: navy `#2e4057` on the dark well and lane, gold `#d4a017` on the daylight well and lane, and the extremes `#000000` and `#ffffff`, as marks and as text. Pinned in Task 3 (`color.test.ts`: every fixture colour and both extremes reach 3:1 and 4.5:1 on both the well and the lane (where marks and labels are drawn) after `readableOn`, in both themes).
3. **Deploying the fonts:** a `case` pattern's `*` crosses `/`, so a `games/*/fonts/*` skip would also drop `games/workroom/dist/fonts/*`. Pinned in Task 8 (`MusicDeployTest`: the six `dist/fonts/*.woff2` ship, nothing under `games/workroom/fonts/` does, `music/music.css` is gone).
4. **The guide on a piece that lacks a part, or a zoomed view**: a sound effect has no notes and no characters, a music piece may have no motifs, and a zoomed view puts the first note off screen. Parts with nothing to show are left out, spots are clamped to the drawing, clips stay inside the piece and last at most 4 s. Pinned in Task 9 (`guide.test.ts`: both fixtures, a motif-less copy, and a zoomed view).
5. **Hear it while the piece is already playing**: a demo pauses the piece first; a piece clip plays from its start and stops at its end. Pinned in Task 10 (`workroom.test.ts`: playing, then a demo's Hear it, leaves the audio paused and calls the demo once).

## Decisions this plan makes (the spec leaves them open)

- **Theme boot is its own classic script.** The spec places it "at the top of `workroom.js`", but that bundle is a module loaded at the end of `<body>` and runs after the first paint, and the CSP forbids an inline script. `src/theme-boot.ts` is built as an `iife` entry `dist/theme.js` and linked as `<script src>` in `<head>` before the stylesheet; it only sets `data-theme`. `main.ts` starts the live switch (choice changes, device changes under System).
- **Two tokens beyond the spec's table:** `--color-on-accent` (text and icons on amber, green or red fills: `#121519` dark, `#ffffff` light, ≥ 4.5:1 on all three in both themes) and `--color-paper` (`#ffffff` both themes: the sheet-music paper, which OpenSheetMusicDisplay draws black on).
- **Score colours** are made readable against both the well and the lane, the surfaces marks and labels are drawn on (the lane is the harder one in both themes), so `readableOn` takes the worse of the two.
- **Contrast floors** (the test in Task 3): `ink` and `dim` ≥ 4.5:1 on `ground`, `panel`, `well`, `lane`; `amber` ≥ 4.5:1 on `ground`, `panel`, `well` (time readouts); `go` ≥ 4.5:1 on `panel`; `amber`, `go`, `record` ≥ 3:1 on `ground`, `panel`, `well`, `lane` (marks); `on-accent` ≥ 4.5:1 on `amber`, `go`, `record`. `record` is never body-size text on a panel (dark: 4.49:1).
- **`tokens.ts` mirrors the token values** for the code that computes contrast; `test/tokens.test.ts` parses `app.css` and fails when they differ. `app.css` stays the one place a component's colour comes from.
- **Fonts manifest:** `games/workroom/fonts/fonts.json` lists each family's `name`, `source` (`@fontsource/<pkg> 5.3.0`), `license` (`OFL-1.1`), `licenseFile` and `files`; `build.json` names the folder as `"css": { "in": "src/app.css", "out": "workroom", "fonts": "fonts" }`. The build refuses a woff2 not listed, a listed file that is not woff2, a missing licence, a `url(fonts/…)` the manifest lacks and a listed font the stylesheet never uses. `THIRD_PARTY_LICENSES.txt` gets the font notices after the package notices and its header becomes "Third-party code bundled into this game's scripts, and the fonts in fonts/." only when fonts ship, so crete, cylon and tankity stay byte-identical.
- **Server-rendered markup keeps its class names** (`crumb`, `waiting-total`, `project`, `pieces`, `piece`, `version`, `changes`, `empty`), which the PHP tests pin; `src/shell.css` styles them with `@apply` on tokens. Tailwind scans only `src/**/*.{ts,tsx}`.
- **Name clash:** the spec's bottom-sheet component is `Sheet` (`src/ui/console/Sheet.tsx`); the sheet-music view becomes `SheetMusic` (`src/ui/SheetMusic.tsx`).
- **The notes sheet in PR 4** holds the open glossary card, "Words in this piece" and Claude's changes; PR 5 adds the answer tools to it. On a phone it is a bottom sheet with a 44 px handle ("Notes" and the change count) that opens it to at most 75% of the screen; opening a word opens it.
- **Story lanes draw their notes as dimmed bars** (the spec says lanes "keep" them; the Story view draws none yet), each lane scaled to its own pitch range. Constellations scale to the motif span's own range.
- **Energy glow** is a filled, blurred band over the drawing's full height (`layout.glow`), the first thing the Timeline draws, behind everything (the spec); the section fills (40%) and the lane fills (80%) are translucent so it shows through them. `layout.energy` (the top strip) stays for hit testing.
- **Guide text:** the Story view's seven parts are the reading guide's text with its Crete-only comparisons made general (no character is built into the code); the other views' parts are written below and go to the owner with the screenshots. A part with nothing to show on this piece is left out. Every piece clip is at most 4 s; the ruler and the "higher / louder" parts use the three built-in demos (`clicks`, `updown`, `swell`).
- **Tabs** are a real tab list (`role="tablist"`/`"tab"`, `aria-selected`, roving tabindex, Left/Right/Home/End), so the browser check finds views with `getByRole('tab')`. The theme switch is a group of three toggle buttons (`aria-pressed`), reachable with Tab and Enter.
- **Screenshots** are written by the browser check itself when `MUSIC_E2E_SHOTS` names a folder; the final task points it outside the repository.

## File map

Kit (`websites/www.cs/games/`):
- `package.json`, `package-lock.json` — Tailwind pins.
- `_kit/build/build.mjs` — `css` entry, fonts, binary-safe outputs.
- `_kit/build/build.test.ts` — css and fonts tests.
- `_kit/README.md` — `css` key, fonts, build-time tools.

Workroom (`websites/www.cs/games/workroom/`):
- `build.json` — `css` entry, `theme` iife entry.
- `tsconfig.json`, `src/tsconfig.dom.json` — new files in their programs.
- `fonts/` — six woff2, three OFL texts, `fonts.json`.
- `src/app.css` — Tailwind entry, tokens, `@font-face`.
- `src/shell.css` — server-rendered markup and shared state classes (`error`, `empty`, `loading`).
- `src/tokens.ts` — token values and the `Theme` type (DOM-free).
- `src/color.ts` — contrast arithmetic, `readable`, `readableOn` (DOM-free).
- `src/theme.ts` — choice, resolve, apply, live handle (DOM-free).
- `src/browser.ts` — browser storage and theme ports (DOM).
- `src/theme-boot.ts` — the head script (DOM, entry `theme`).
- `src/constellation.ts` — stars per motif span (DOM-free).
- `src/guide.ts` — guide parts, spots, clips, seen flags (DOM-free).
- `src/demo.ts` — the three built-in demo sounds as data (DOM-free).
- `src/timeline.ts` — adds `pitchY`, lane `notes`, `glow`.
- `src/axis.ts`, `src/pianoroll.ts`, `src/spectro.ts`, `src/tabs.ts` — shared constants and legends.
- `src/ui/console/cx.ts`, `Button.tsx`, `Tabs.tsx`, `Chip.tsx`, `Panel.tsx`, `Sheet.tsx`, `Readout.tsx`, `Legend.tsx`, `GuideOverlay.tsx` — the components.
- `src/ui/theme-context.ts`, `src/ui/ThemeSwitch.tsx`, `src/ui/demo-player.ts` — theme context and switch, demo playback.
- `src/ui/Workroom.tsx`, `Player.tsx`, `ViewTabs.tsx`, `Glossary.tsx`, `PianoRoll.tsx`, `SoundPicture.tsx`, `Timeline.tsx`, `parts.tsx`, `SheetMusic.tsx` (from `Sheet.tsx`), `src/main.ts` — restyled and wired.
- `test/tokens.test.ts`, `color.test.ts`, `theme.test.ts`, `console.test.ts`, `constellation.test.ts`, `guide.test.ts`, `demo.test.ts`, `guide-overlay.test.ts`; existing `views.test.ts`, `workroom.test.ts`, `playback.test.ts`, `spectro.test.ts`, `timeline.test.ts` updated.

Site (`websites/www.cs/`):
- `music/lib/Pages.php`, `music/lib/bootstrap.php`, `deploy.sh`, `music/README.md`; delete `music/music.css`.
- `tests/php/MusicPagesTest.php`, `MusicBootstrapTest.php`, `MusicDeployTest.php`.
- `tests/e2e/workroom.local.ts`.

---

### Task 1: Tailwind in the kit: a game's `css` entry

**Files:**
- Modify: `websites/www.cs/games/package.json`, `websites/www.cs/games/package-lock.json`
- Modify: `websites/www.cs/games/_kit/build/build.mjs`
- Test: `websites/www.cs/games/_kit/build/build.test.ts`
- Modify: `websites/www.cs/games/_kit/README.md`

**Interfaces:**
- Consumes: nothing new.
- Produces: `build.json` key `css: { in: string; out: string; fonts?: string }` (Task 2 adds `fonts`); `export function compileCss(gameDir, css): string` in `build.mjs`; `dist/<css.out>.css` in the bundle's file map. A game without `css` builds exactly as before.

- [ ] **Step 1: Pin Tailwind**

```bash
cd websites/www.cs/games
npm install --save-dev --save-exact tailwindcss@4.3.3 @tailwindcss/cli@4.3.3
grep -n '"tailwindcss": "4.3.3"\|"@tailwindcss/cli": "4.3.3"' package.json
grep -c 'node_modules/@tailwindcss/oxide-linux-x64-gnu' package-lock.json
```

Expected: both pins print; the lockfile has the Linux oxide entry (CI is Linux). Also change the package `description` to: `"Build and test tooling for every game: TypeScript type checks, esbuild bundles and Tailwind stylesheets into each game's checked-in dist/."`

- [ ] **Step 2: Write the failing tests** — append to `_kit/build/build.test.ts`:

```ts
const withCss = (dir: string, css: unknown = { in: 'src/app.css', out: 'look' }, extra = ''): void => {
  writeFileSync(join(dir, 'src/app.css'), `@import "tailwindcss" source(none);\n@source "./classes.txt";\n@theme static { --color-*: initial; --color-ink: #123456; }\n${extra}`);
  writeFileSync(join(dir, 'src/classes.txt'), 'text-ink\n');
  const cfg = JSON.parse(readFileSync(join(dir, 'build.json'), 'utf8'));
  writeFileSync(join(dir, 'build.json'), JSON.stringify({ ...cfg, css }));
};

test('css: compiles the Tailwind entry to dist/<out>.css with only the classes the sources use', t => {
  const dir = scratch(t);
  withCss(dir);
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  const css = readFileSync(join(dir, 'dist/look.css'), 'utf8');
  assert.ok(css.startsWith('/*! tailwindcss v4.3.3 | MIT License'), 'keeps the licence banner');
  assert.match(css, /\.text-ink\{color:var\(--color-ink\)\}/);
  assert.match(css, /--color-ink:#123456/);
  assert.doesNotMatch(css, /bg-red-500|--color-red/, 'the default palette is cleared');
  assert.equal(run(dir, '--check').status, 0);
});

test('css: --check fails on a stale stylesheet, and a build brings it back', t => {
  const dir = scratch(t);
  withCss(dir);
  run(dir);
  writeFileSync(join(dir, 'src/classes.txt'), 'text-ink bg-ink\n');
  const r = run(dir, '--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /dist\/look\.css is stale/);
  assert.equal(run(dir).status, 0);
  assert.match(readFileSync(join(dir, 'dist/look.css'), 'utf8'), /\.bg-ink\{/);
  assert.equal(run(dir, '--check').status, 0);
});

test('css: deterministic and free of absolute paths', t => {
  const dir = scratch(t);
  withCss(dir);
  run(dir);
  const first = readFileSync(join(dir, 'dist/look.css'));
  rmSync(join(dir, 'dist'), { recursive: true });
  run(dir);
  assert.ok(first.equals(readFileSync(join(dir, 'dist/look.css'))));
  assert.doesNotMatch(first.toString('utf8'), /\/Users\/|\/home\/|[A-Z]:\\\\|file:\/\//);
});

test('css: a game without the key gets no stylesheet', t => {
  const dir = scratch(t);
  run(dir);
  assert.deepEqual(readdirSync(join(dir, 'dist')).filter(f => f.endsWith('.css')), []);
});

test('css: a bad css entry is refused with a reason', t => {
  const dir = scratch(t);
  withCss(dir, { in: 'src/none.css', out: 'look' });
  let r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /css `in` src\/none\.css does not exist/);
  withCss(dir, { in: 'src/app.css', out: '../look' });
  r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /css `out` \.\.\/look must match/);
  withCss(dir, 'src/app.css');
  assert.match(run(dir).stderr, /`css` must be/);
});

test('css: a Tailwind error fails the build, names the entry and writes nothing', t => {
  const dir = scratch(t);
  withCss(dir, undefined, '.x { @apply bg-nope; }\n');
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /src\/app\.css: tailwindcss failed/);
  assert.match(r.stderr, /bg-nope/);
  assert.ok(!existsSync(join(dir, 'dist')));
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `cd websites/www.cs/games && node --test _kit/build/build.test.ts`
Expected: the six `css:` tests FAIL (no `dist/look.css`; no refusal messages); every earlier test still passes.

- [ ] **Step 4: Implement** — in `_kit/build/build.mjs`:

Add beside `TSC`:

```js
const TAILWIND = join(GAMES, 'node_modules', '.bin', 'tailwindcss');
```

In `loadBuildJson`, before `return cfg;`:

```js
  if (cfg.css !== undefined) {
    const c = cfg.css;
    if (typeof c !== 'object' || c === null || Array.isArray(c)) throw new BuildError('build.json: `css` must be { in, out } with an optional `fonts` folder');
    if (typeof c.in !== 'string' || !existsSync(join(gameDir, c.in))) throw new BuildError(`build.json: css \`in\` ${c.in} does not exist`);
    if (typeof c.out !== 'string' || !OUT_RE.test(c.out)) throw new BuildError(`build.json: css \`out\` ${c.out} must match ${OUT_RE}`);
    if (c.out === 'kit' && cfg.kitCss === true) throw new BuildError('build.json: css `out` kit would overwrite the kit stylesheet');
  }
```

Add after `typecheck`:

```js
/** Compiles a game's Tailwind entry with the pinned CLI, minified; the entry's own @source lines say which files it scans. */
export function compileCss(gameDir, css) {
  const r = spawnSync(TAILWIND, ['--input', css.in, '--output', '-', '--minify'], { cwd: gameDir, encoding: 'utf8' });
  if (r.error) throw new BuildError(`tailwindcss did not run (${r.error.message}); run npm ci in games/`);
  if (r.status !== 0) throw new BuildError(`${css.in}: tailwindcss failed:\n${r.stderr}`);
  return r.stdout;
}
```

In `bundle`, right after the `kitCss` line:

```js
  if (cfg.css) files.set(`${cfg.css.out}.css`, compileCss(gameDir, cfg.css));
```

In the CLI's `--check` loop the existing message `is stale or missing` already names `dist/look.css`; the test's `/dist\/look\.css is stale/` matches it.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd websites/www.cs/games && node --test _kit/build/build.test.ts && npm run --silent check`
Expected: all PASS; `npm run check` exits 0 (crete, cylon, tankity and workroom unchanged, byte for byte).

- [ ] **Step 6: Document** — in `_kit/README.md`, under the `build.json` list after the `kitCss` bullet, add:

```markdown
- `css`: `{ in, out }` compiles a Tailwind v4 entry (`in`, a CSS file) with
  the pinned `@tailwindcss/cli` into `dist/<out>.css`, minified. The entry
  says what it scans (`@import "tailwindcss" source(none);` then `@source`
  lines), so only the classes a game's sources use are emitted. `--check`
  covers the stylesheet like a bundle.
```

and a new section after "The kit stylesheet":

```markdown
## Build-time tools

Run by the build, never shipped (only their output is): `esbuild` (MIT),
`typescript` (Apache-2.0), `@resvg/resvg-js` (MPL-2.0), `tailwindcss` and
`@tailwindcss/cli` (MIT; the compiled CSS carries Tailwind's own licence
banner), `lightningcss` (MPL-2.0; Tailwind's CSS minifier, a transitive
dependency of the CLI), `@types/node` (MIT). All but `lightningcss` are
exact pins in `games/package.json`.
```

- [ ] **Step 7: Commit**

```bash
git add websites/www.cs/games/package.json websites/www.cs/games/package-lock.json websites/www.cs/games/_kit/build/build.mjs websites/www.cs/games/_kit/build/build.test.ts websites/www.cs/games/_kit/README.md
git commit -m "Games kit: compile a game's Tailwind stylesheet at build time

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

---

### Task 2: Fonts beside the stylesheet, with their licences

**Files:**
- Modify: `websites/www.cs/games/_kit/build/build.mjs`
- Test: `websites/www.cs/games/_kit/build/build.test.ts`
- Modify: `websites/www.cs/games/_kit/README.md`

**Interfaces:**
- Consumes: Task 1's `css` key, `withCss(dir, css, extra)` test helper, `compileCss`.
- Produces: `css.fonts` (a folder holding `fonts.json`); `export function loadFonts(gameDir, folder): { files: Map<string, Buffer>; blocks: string[] }`; `dist/fonts/<file>.woff2`; font notices in `THIRD_PARTY_LICENSES.txt`. The bundle's file map now holds `string | Buffer` values and `build()` compares bytes.

`fonts.json` shape:

```json
{ "fonts": [ { "name": "Barlow", "source": "@fontsource/barlow 5.3.0", "license": "OFL-1.1", "licenseFile": "OFL-Barlow.txt", "files": ["barlow-latin-400-normal.woff2"] } ] }
```

- [ ] **Step 1: Write the failing tests** — append to `_kit/build/build.test.ts`:

```ts
const WOFF2_BYTES = Buffer.concat([Buffer.from('wOF2'), Buffer.from([0, 1, 2, 254, 255])]);
const FONT_FACE = '@font-face { font-family: "Test Sans"; src: url("fonts/test-sans-400.woff2") format("woff2"); }\n';
const withFonts = (dir: string, extraCss = FONT_FACE): void => {
  mkdirSync(join(dir, 'fonts'));
  writeFileSync(join(dir, 'fonts/test-sans-400.woff2'), WOFF2_BYTES);
  writeFileSync(join(dir, 'fonts/OFL.txt'), 'Copyright Test\r\nSIL OPEN FONT LICENSE Version 1.1\r\n');
  writeFileSync(join(dir, 'fonts/fonts.json'), JSON.stringify({ fonts: [{ name: 'Test Sans', source: 'test 1.0', license: 'OFL-1.1', licenseFile: 'OFL.txt', files: ['test-sans-400.woff2'] }] }));
  withCss(dir, { in: 'src/app.css', out: 'look', fonts: 'fonts' }, extraCss);
};

test('fonts: each listed woff2 is copied byte for byte to dist/fonts/', t => {
  const dir = scratch(t);
  withFonts(dir);
  const r = run(dir);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(readFileSync(join(dir, 'dist/fonts/test-sans-400.woff2')).equals(WOFF2_BYTES));
  assert.match(readFileSync(join(dir, 'dist/look.css'), 'utf8'), /url\(fonts\/test-sans-400\.woff2\)/);
  assert.equal(run(dir, '--check').status, 0);
});

test('fonts: their licences follow the package notices, under a header that names them', t => {
  const dir = scratch(t);
  withFonts(dir);
  run(dir);
  const text = readFileSync(join(dir, LICENSES), 'utf8');
  assert.ok(text.startsWith("Third-party code bundled into this game's scripts, and the fonts in fonts/.\n\n"));
  assert.ok(text.includes('Test Sans (test 1.0)\nLicense: OFL-1.1\n\nCopyright Test\nSIL OPEN FONT LICENSE Version 1.1\n'));
  assert.ok(!text.includes('\r'));
  assert.ok(text.indexOf(`preact ${preactVersion}`) < text.indexOf('Test Sans'));
});

test('fonts: a game without fonts keeps the plain header', t => {
  const dir = scratch(t);
  run(dir);
  assert.ok(readFileSync(join(dir, LICENSES), 'utf8').startsWith("Third-party code bundled into this game's scripts.\n\n"));
});

test('fonts: --check fails when a shipped font changes, and a build restores it', t => {
  const dir = scratch(t);
  withFonts(dir);
  run(dir);
  writeFileSync(join(dir, 'dist/fonts/test-sans-400.woff2'), Buffer.from('wOF2changed'));
  const r = run(dir, '--check');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /dist\/fonts\/test-sans-400\.woff2/);
  run(dir);
  assert.ok(readFileSync(join(dir, 'dist/fonts/test-sans-400.woff2')).equals(WOFF2_BYTES));
});

test('fonts: a listed file that is not woff2 is refused', t => {
  const dir = scratch(t);
  withFonts(dir);
  writeFileSync(join(dir, 'fonts/test-sans-400.woff2'), 'not a font');
  const r = run(dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /fonts\/test-sans-400\.woff2 is not a woff2 file/);
});

test('fonts: a woff2 the manifest does not list is refused', t => {
  const dir = scratch(t);
  withFonts(dir);
  writeFileSync(join(dir, 'fonts/stray.woff2'), WOFF2_BYTES);
  assert.match(run(dir).stderr, /stray\.woff2 is not listed in fonts\.json/);
});

test('fonts: a missing licence file is refused', t => {
  const dir = scratch(t);
  withFonts(dir);
  rmSync(join(dir, 'fonts/OFL.txt'));
  assert.match(run(dir).stderr, /Test Sans: licence file OFL\.txt does not exist/);
});

test('fonts: the stylesheet points only at fonts that ship, and every shipped font is used', t => {
  let dir = scratch(t);
  withFonts(dir, `${FONT_FACE}@font-face { font-family: "Gone"; src: url("fonts/gone.woff2"); }\n`);
  assert.match(run(dir).stderr, /fonts\/gone\.woff2 is not in fonts\/fonts\.json/);
  dir = scratch(t);
  withFonts(dir, '');
  assert.match(run(dir).stderr, /fonts\/test-sans-400\.woff2 is not used by src\/app\.css/);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd websites/www.cs/games && node --test _kit/build/build.test.ts`
Expected: the eight `fonts:` tests FAIL except "a game without fonts keeps the plain header", which passes already.

- [ ] **Step 3: Implement** — in `_kit/build/build.mjs`:

In `loadBuildJson`'s `css` block, after the `out` check:

```js
    if (c.fonts !== undefined && (typeof c.fonts !== 'string' || !existsSync(join(gameDir, c.fonts, 'fonts.json')))) {
      throw new BuildError('build.json: css `fonts` must be a folder holding fonts.json');
    }
```

Add after `compileCss`:

```js
const WOFF2_MAGIC = Buffer.from('wOF2');
const FONT_FILE_RE = /^[a-z0-9][a-z0-9-]*\.woff2$/;
// url(fonts/x.woff2), quoted or not, as Tailwind's minifier writes it.
const FONT_URL_RE = /url\(\s*["']?fonts\/([^"')\s]+)["']?\s*\)/g;

/** The fonts a stylesheet ships: fonts.json names each family, its source, licence and woff2 files. Returns dist path -> bytes, and one notice per family. */
export function loadFonts(gameDir, folder) {
  const dir = join(gameDir, folder);
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(dir, 'fonts.json'), 'utf8'));
  } catch (e) {
    throw new BuildError(`${folder}/fonts.json: ${e.message}`);
  }
  if (!Array.isArray(manifest.fonts) || manifest.fonts.length === 0) throw new BuildError(`${folder}/fonts.json: \`fonts\` must list at least one font`);
  const files = new Map();
  const blocks = [];
  for (const f of manifest.fonts) {
    for (const k of ['name', 'source', 'license', 'licenseFile']) {
      if (typeof f[k] !== 'string' || f[k] === '') throw new BuildError(`${folder}/fonts.json: every font needs a \`${k}\``);
    }
    if (!Array.isArray(f.files) || f.files.length === 0) throw new BuildError(`${folder}/fonts.json: ${f.name}: \`files\` must list its woff2 files`);
    if (!existsSync(join(dir, f.licenseFile))) throw new BuildError(`${folder}/fonts.json: ${f.name}: licence file ${f.licenseFile} does not exist`);
    for (const name of f.files) {
      if (typeof name !== 'string' || !FONT_FILE_RE.test(name)) throw new BuildError(`${folder}/fonts.json: ${f.name}: ${name} must match ${FONT_FILE_RE}`);
      if (!existsSync(join(dir, name))) throw new BuildError(`${folder}/fonts.json: ${name} does not exist`);
      const bytes = readFileSync(join(dir, name));
      if (!bytes.subarray(0, 4).equals(WOFF2_MAGIC)) throw new BuildError(`${folder}/${name} is not a woff2 file`);
      files.set(`fonts/${name}`, bytes);
    }
    const text = readFileSync(join(dir, f.licenseFile), 'utf8').replace(/\r\n?/g, '\n').trim();
    blocks.push({ name: f.name, text: `${f.name} (${f.source})\nLicense: ${f.license}\n\n${text}\n` });
  }
  const stray = readdirSync(dir).filter(n => n.endsWith('.woff2') && !files.has(`fonts/${n}`));
  if (stray.length) throw new BuildError(`${folder}: ${stray.join(', ')} is not listed in fonts.json`);
  blocks.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return { files, blocks: blocks.map(b => b.text) };
}
```

In `bundle`, replace the Task 1 line `if (cfg.css) files.set(...)` with:

```js
  const fonts = cfg.css?.fonts ? loadFonts(gameDir, cfg.css.fonts) : null;
  if (cfg.css) {
    const css = compileCss(gameDir, cfg.css);
    const shipped = fonts?.files ?? new Map();
    const used = new Set([...css.matchAll(FONT_URL_RE)].map(m => `fonts/${m[1]}`));
    const missing = [...used].filter(p => !shipped.has(p));
    if (missing.length) throw new BuildError(`${cfg.css.in}: ${missing.join(', ')} is not in ${cfg.css.fonts ?? 'fonts'}/fonts.json`);
    const unused = [...shipped.keys()].filter(p => !used.has(p));
    if (unused.length) throw new BuildError(`${cfg.css.fonts}/fonts.json: ${unused.join(', ')} is not used by ${cfg.css.in}`);
    files.set(`${cfg.css.out}.css`, css);
    for (const [p, bytes] of shipped) files.set(p, bytes);
  }
```

Replace the licence block (from `if (packages.size || (cfg.inlined ?? []).length) {` to its closing `}`) with:

```js
  let blocks = [];
  if (packages.size || (cfg.inlined ?? []).length) {
    const lockFile = join(GAMES, 'package-lock.json');
    const lock = existsSync(lockFile) ? JSON.parse(readFileSync(lockFile, 'utf8')) : { packages: {} };
    const roots = [...packages.keys()].map(dir => relative(GAMES, dir).split(sep).join('/'));
    const unlocked = [];
    for (const name of cfg.inlined ?? []) {
      const dir = join(GAMES, 'node_modules', ...name.split('/'));
      if (!existsSync(join(dir, 'package.json'))) throw new BuildError(`build.json: inlined package ${name} is not installed in games/node_modules`);
      packages.set(dir, name);
      const key = `node_modules/${name}`;
      if (lock.packages?.[key]) roots.push(key);
      else unlocked.push(name);
    }
    for (const [key, name] of runtimeClosure(lock, roots, cfg.notInlined)) packages.set(join(GAMES, ...key.split('/')), name);
    blocks = [...packages].sort(([da, a], [db, b]) => (a < b ? -1 : a > b ? 1 : da < db ? -1 : da > db ? 1 : 0)).map(([dir, name]) => licenseBlock(name, dir));
    // Without a lockfile root its dependencies' notices cannot be collected: fail rather than write an incomplete file.
    if (unlocked.length) throw new BuildError(`build.json: inlined package ${unlocked.join(', ')} has no entry in games/package-lock.json, so its dependencies' notices cannot be collected`);
  }
  if (blocks.length || fonts) {
    const header = fonts ? "Third-party code bundled into this game's scripts, and the fonts in fonts/." : "Third-party code bundled into this game's scripts.";
    files.set(LICENSES_FILE, `${header}\n\n${[...blocks, ...(fonts?.blocks ?? [])].join('\n---\n\n')}`);
  }
```

Make `build()` byte-safe: replace its `stale` computation with

```js
  const bytesOf = v => (typeof v === 'string' ? Buffer.from(v, 'utf8') : v);
  const stale = [...files].filter(([p, v]) => {
    const f = join(dist, p);
    return !existsSync(f) || !readFileSync(f).equals(bytesOf(v));
  }).map(([p]) => p);
```

(`writeFileSync` already accepts a string or a Buffer.) Update the `bundle` doc comment to "dist-relative path -> file text, or bytes for a font".

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd websites/www.cs/games && node --test _kit/build/build.test.ts && npm run --silent check`
Expected: all PASS; `npm run check` exits 0 (no game has fonts yet, so every licences file is unchanged).

- [ ] **Step 5: Document** — in `_kit/README.md`, after the `css` bullet:

```markdown
- `css.fonts`: a folder (in the game, not shipped) with the stylesheet's
  woff2 files and `fonts.json`: `{ "fonts": [{ name, source, license,
  licenseFile, files }] }`. Each listed file is copied to `dist/fonts/` and
  each family's licence text joins `THIRD_PARTY_LICENSES.txt` after the
  package notices. The build refuses a woff2 the manifest does not list, a
  listed file that is not woff2, a missing licence file, a `url(fonts/…)`
  the manifest lacks and a listed font the stylesheet never uses. Reference
  fonts from the CSS as `url("fonts/<file>.woff2")`.
```

and in the same README's licences paragraph, replace the sentence "A game with no npm packages gets neither." with: "A game with fonts (`css.fonts`) also gets its licences file, with the font notices after the package notices and the header \"Third-party code bundled into this game's scripts, and the fonts in fonts/.\"; a game with no npm packages and no fonts gets neither."

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/games/_kit/build/build.mjs websites/www.cs/games/_kit/build/build.test.ts websites/www.cs/games/_kit/README.md
git commit -m "Games kit: ship a stylesheet's fonts with their licences

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

---

### Task 3: The workroom's tokens, fonts and stylesheet

**Files:**
- Create: `websites/www.cs/games/workroom/fonts/` (six `.woff2`, `OFL-Barlow.txt`, `OFL-BarlowCondensed.txt`, `OFL-IBMPlexMono.txt`, `fonts.json`)
- Create: `websites/www.cs/games/workroom/src/app.css`, `src/shell.css`, `src/tokens.ts`, `src/color.ts`
- Modify: `websites/www.cs/games/workroom/build.json`, `websites/www.cs/games/workroom/tsconfig.json`
- Test: `websites/www.cs/games/workroom/test/tokens.test.ts`, `test/color.test.ts`
- Regenerate: `websites/www.cs/games/workroom/dist/` (adds `workroom.css`, `fonts/*.woff2`; `THIRD_PARTY_LICENSES.txt` gains the fonts)

**Interfaces:**
- Consumes: Task 1–2 `css` entry with `fonts`.
- Produces:
  - `tokens.ts`: `export type Theme = 'dark' | 'light'`; `export const TOKEN_NAMES` (`'ground' | 'panel' | 'well' | 'lane' | 'rule' | 'ink' | 'dim' | 'amber' | 'go' | 'record' | 'on-accent' | 'paper'`); `export type Token`; `export const TOKENS: Readonly<Record<Theme, Readonly<Record<Token, string>>>>`.
  - `color.ts`: `MARK_MIN = 3`, `TEXT_MIN = 4.5`, `luminance(hex): number`, `contrast(a, b): number`, `mix(hex, toward, amount): string`, `readable(color, bg, min): string`, `readableOn(theme: Theme, color: string, use: 'mark' | 'text'): string` (readable against the theme's well and lane both).
  - Tailwind utilities from tokens: `bg-*`, `text-*`, `border-*`, `fill-*`, `stroke-*`, `ring-*`, `outline-*` for every token; `font-display`, `font-body`, `font-mono`.
  - `shell.css` classes for the PHP markup (`console-head`, `crumb`, `index-body`, `waiting-total`, `project`, `pieces`, `piece`, `version`, `waiting-count`, `changes`) and shared state classes `error`, `empty`, `loading`.

- [ ] **Step 1: Fetch the fonts** (outside the repository, then copy in)

```bash
work=$(mktemp -d "${TMPDIR:-/tmp}/workroom-fonts.XXXXXX")
(cd "$work" && npm pack --silent @fontsource/barlow@5.3.0 @fontsource/barlow-condensed@5.3.0 @fontsource/ibm-plex-mono@5.3.0)
for f in "$work"/*.tgz; do mkdir "${f%.tgz}"; tar xzf "$f" -C "${f%.tgz}"; done
F=websites/www.cs/games/workroom/fonts
mkdir -p "$F"
cp "$work"/fontsource-barlow-5.3.0/package/files/barlow-latin-{400,500,600}-normal.woff2 "$F"/
cp "$work"/fontsource-barlow-condensed-5.3.0/package/files/barlow-condensed-latin-600-normal.woff2 "$F"/
cp "$work"/fontsource-ibm-plex-mono-5.3.0/package/files/ibm-plex-mono-latin-{400,500}-normal.woff2 "$F"/
cp "$work"/fontsource-barlow-5.3.0/package/LICENSE "$F"/OFL-Barlow.txt
cp "$work"/fontsource-barlow-condensed-5.3.0/package/LICENSE "$F"/OFL-BarlowCondensed.txt
cp "$work"/fontsource-ibm-plex-mono-5.3.0/package/LICENSE "$F"/OFL-IBMPlexMono.txt
rm -rf "$work"
for f in "$F"/*.woff2; do head -c 4 "$f"; echo " $f"; done
```

Expected: six lines starting `wOF2`. Each licence file contains "SIL Open Font License, Version 1.1".

Create `fonts/fonts.json`:

```json
{
  "fonts": [
    { "name": "Barlow", "source": "@fontsource/barlow 5.3.0", "license": "OFL-1.1", "licenseFile": "OFL-Barlow.txt",
      "files": ["barlow-latin-400-normal.woff2", "barlow-latin-500-normal.woff2", "barlow-latin-600-normal.woff2"] },
    { "name": "Barlow Condensed", "source": "@fontsource/barlow-condensed 5.3.0", "license": "OFL-1.1", "licenseFile": "OFL-BarlowCondensed.txt",
      "files": ["barlow-condensed-latin-600-normal.woff2"] },
    { "name": "IBM Plex Mono", "source": "@fontsource/ibm-plex-mono 5.3.0", "license": "OFL-1.1", "licenseFile": "OFL-IBMPlexMono.txt",
      "files": ["ibm-plex-mono-latin-400-normal.woff2", "ibm-plex-mono-latin-500-normal.woff2"] }
  ]
}
```

- [ ] **Step 2: Write the failing tests**

`test/tokens.test.ts`:

```ts
// The colour tokens: app.css defines them once (dark in @theme, light under
// data-theme="light"), tokens.ts mirrors them for contrast arithmetic, every
// pair the page draws meets its floor in both themes, and no component names
// a colour of its own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TOKEN_NAMES, TOKENS } from '../src/tokens.ts';
import type { Theme, Token } from '../src/tokens.ts';
import { contrast } from '../src/color.ts';

const SRC = join(import.meta.dirname, '..', 'src');
const css = readFileSync(join(SRC, 'app.css'), 'utf8');
const block = (start: string): string => {
  const at = css.indexOf(start);
  assert.ok(at >= 0, `app.css has ${start}`);
  return css.slice(at, css.indexOf('}', at));
};
const colours = (text: string): Record<string, string> =>
  Object.fromEntries([...text.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6});/g)].map(m => [m[1]!, m[2]!]));

test('tokens.ts holds exactly the values app.css defines, in both themes', () => {
  assert.deepEqual(colours(block('@theme static {')), TOKENS.dark);
  assert.deepEqual(colours(block(':root[data-theme="light"] {')), TOKENS.light);
  for (const theme of ['dark', 'light'] as const) assert.deepEqual(Object.keys(TOKENS[theme]).sort(), [...TOKEN_NAMES].sort());
});

const FLOORS: readonly [Token, readonly Token[], number][] = [
  ['ink', ['ground', 'panel', 'well', 'lane'], 4.5],
  ['dim', ['ground', 'panel', 'well', 'lane'], 4.5],
  ['amber', ['ground', 'panel', 'well'], 4.5],
  ['go', ['panel'], 4.5],
  ['amber', ['ground', 'panel', 'well', 'lane'], 3],
  ['go', ['ground', 'panel', 'well', 'lane'], 3],
  ['record', ['ground', 'panel', 'well', 'lane'], 3],
  ['on-accent', ['amber', 'go', 'record'], 4.5],
];

test('every token pair the page draws meets its contrast floor in both themes', () => {
  for (const theme of ['dark', 'light'] as Theme[]) {
    for (const [fg, bgs, min] of FLOORS) {
      for (const bg of bgs) {
        const ratio = contrast(TOKENS[theme][fg], TOKENS[theme][bg]);
        assert.ok(ratio >= min, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, under ${min}:1`);
      }
    }
  }
});

const uiFiles = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? uiFiles(join(dir, e.name)) : e.name.endsWith('.tsx') ? [join(dir, e.name)] : []);

test('no component names a colour: no hex literal, no Tailwind palette class', () => {
  for (const f of [...uiFiles(join(SRC, 'ui')), join(SRC, 'main.ts')]) {
    const text = readFileSync(f, 'utf8');
    assert.doesNotMatch(text, /#[0-9a-fA-F]{3,8}\b/, f);
    // bg-amber is a token; bg-amber-500, text-white and the like are Tailwind's palette.
    assert.doesNotMatch(text, /\b(?:bg|text|border|fill|stroke|ring|outline)-(?:(?:red|blue|green|gray|slate|zinc|neutral|amber|yellow)-\d{2,3}|white|black)\b/, f);
  }
});
```

`test/color.test.ts`:

```ts
// Contrast arithmetic and the nudge that keeps a score's colours readable on
// either theme's drawing surface.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrast, luminance, MARK_MIN, mix, readable, readableOn, TEXT_MIN } from '../src/color.ts';
import { TOKENS } from '../src/tokens.ts';
import type { Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;
const near = (a: number, b: number, eps = 0.01) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);

test('contrast: black on white is 21:1, a colour on itself 1:1, either order', () => {
  near(contrast('#000000', '#ffffff'), 21);
  near(contrast('#ffffff', '#000000'), 21);
  near(contrast('#7a9cc6', '#7a9cc6'), 1);
  near(luminance('#ffffff'), 1);
  near(luminance('#000000'), 0);
});

test('mix moves a colour toward another by the given share', () => {
  assert.equal(mix('#000000', '#ffffff', 0), '#000000');
  assert.equal(mix('#000000', '#ffffff', 1), '#ffffff');
  assert.equal(mix('#000000', '#ffffff', 0.5), '#808080');
});

test('readable leaves a colour that already reaches the floor alone', () => {
  assert.equal(readable('#d4a017', TOKENS.dark.well, MARK_MIN), '#d4a017');
  assert.equal(readable('#2e4057', TOKENS.light.well, TEXT_MIN), '#2e4057');
});

test('readable lightens on the dark well and darkens on the light one until the floor is met', () => {
  const navy = readable('#2e4057', TOKENS.dark.well, MARK_MIN);
  assert.notEqual(navy, '#2e4057');
  assert.ok(luminance(navy) > luminance('#2e4057'));
  assert.ok(contrast(navy, TOKENS.dark.well) >= MARK_MIN);
  const gold = readable('#d4a017', TOKENS.light.well, TEXT_MIN);
  assert.ok(luminance(gold) < luminance('#d4a017'));
  assert.ok(contrast(gold, TOKENS.light.well) >= TEXT_MIN);
});

test('every fixture colour and both extremes reach both floors on the well and the lane, in both themes', () => {
  const scores = [read('score-v1.json'), read('score-sound-v1.json')];
  const all = [...scores.flatMap(s => [...s.characters, ...s.lanes, ...s.sections].map(x => x.color)), '#000000', '#ffffff'];
  for (const theme of ['dark', 'light'] as const) {
    for (const c of all) {
      for (const surface of ['well', 'lane'] as const) {
        assert.ok(contrast(readableOn(theme, c, 'mark'), TOKENS[theme][surface]) >= MARK_MIN, `${theme} mark ${c} on ${surface}`);
        assert.ok(contrast(readableOn(theme, c, 'text'), TOKENS[theme][surface]) >= TEXT_MIN, `${theme} text ${c} on ${surface}`);
      }
    }
  }
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `cd websites/www.cs/games && node --test workroom/test/tokens.test.ts workroom/test/color.test.ts`
Expected: FAIL (`Cannot find module '../src/tokens.ts'`).

- [ ] **Step 4: Write `src/tokens.ts`**

```ts
// The colour tokens' values as src/app.css defines them, for the code that
// computes with colours (contrast). test/tokens.test.ts fails when the two
// differ. DOM-free.
export type Theme = 'dark' | 'light';
export const TOKEN_NAMES = ['ground', 'panel', 'well', 'lane', 'rule', 'ink', 'dim', 'amber', 'go', 'record', 'on-accent', 'paper'] as const;
export type Token = (typeof TOKEN_NAMES)[number];

export const TOKENS: Readonly<Record<Theme, Readonly<Record<Token, string>>>> = {
  dark: {
    ground: '#121519', panel: '#1b1f25', well: '#0d0f12', lane: '#161a20', rule: '#2a3039', ink: '#e8eaee',
    dim: '#9aa3b0', amber: '#f5b942', go: '#3ddc84', record: '#e2574c', 'on-accent': '#121519', paper: '#ffffff',
  },
  light: {
    ground: '#eef0f3', panel: '#ffffff', well: '#f7f8fa', lane: '#e8ebef', rule: '#cfd5dd', ink: '#15191f',
    dim: '#55606d', amber: '#8f5d00', go: '#1a7f47', record: '#b8322a', 'on-accent': '#ffffff', paper: '#ffffff',
  },
};
```

- [ ] **Step 5: Write `src/color.ts`**

```ts
// Colour arithmetic for contrast (WCAG 2 relative luminance and contrast
// ratio) and the nudge that keeps a score's own colours readable on the
// current theme's drawing surface. DOM-free.
import { TOKENS } from './tokens.ts';
import type { Theme } from './tokens.ts';

/** The floor for a mark (a note, a star, a line): 3:1. */
export const MARK_MIN = 3;
/** The floor for text: 4.5:1. */
export const TEXT_MIN = 4.5;

const channels = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lin = (c: number): number => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export function luminance(hex: string): number {
  const [r, g, b] = channels(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** hex moved toward `toward` by `amount` (0 keeps it, 1 is `toward`), each channel rounded. */
export function mix(hex: string, toward: string, amount: number): string {
  const a = channels(hex);
  const b = channels(toward);
  return `#${a.map((c, i) => Math.round(c + (b[i]! - c) * amount).toString(16).padStart(2, '0')).join('')}`;
}

/** color unchanged when it reaches `min` against bg; otherwise mixed in 5% steps toward white or black (whichever stands out more from bg) until it does. */
export function readable(color: string, bg: string, min: number): string {
  if (contrast(color, bg) >= min) return color;
  const toward = contrast('#ffffff', bg) >= contrast('#000000', bg) ? '#ffffff' : '#000000';
  for (let step = 1; step <= 20; step++) {
    const c = mix(color, toward, step / 20);
    if (contrast(c, bg) >= min) return c;
  }
  return toward;
}

/**
 * A score colour made readable on this theme's drawing surfaces: 3:1 for a
 * mark, 4.5:1 for text, against the well and against the lane (where marks and
 * labels are drawn; the lane is the harder of the two). Both surfaces sit on
 * the same side of the colour, so the second nudge goes the same way as the
 * first and keeps what the first achieved.
 */
export function readableOn(theme: Theme, color: string, use: 'mark' | 'text'): string {
  const min = use === 'mark' ? MARK_MIN : TEXT_MIN;
  return readable(readable(color, TOKENS[theme].well, min), TOKENS[theme].lane, min);
}
```

Add `"src/tokens.ts", "src/color.ts"` to `tsconfig.json`'s `files`.

- [ ] **Step 6: Write `src/app.css`**

```css
/* The workroom's look. Tailwind v4 compiles this at build time
   (node _kit/build/build.mjs workroom) into dist/workroom.css with only the
   classes src/ uses. Colours are tokens with a dark value (@theme) and a light
   value (data-theme="light" on <html>, set by src/theme.ts); components name
   tokens, never colours. src/tokens.ts mirrors the values for contrast
   arithmetic and test/tokens.test.ts keeps the two equal. */
@import "tailwindcss" source(none);
@import "./shell.css";
@source "./**/*.{ts,tsx}";

@theme static {
  --color-*: initial;
  --font-*: initial;
  --color-ground: #121519;
  --color-panel: #1b1f25;
  --color-well: #0d0f12;
  --color-lane: #161a20;
  --color-rule: #2a3039;
  --color-ink: #e8eaee;
  --color-dim: #9aa3b0;
  --color-amber: #f5b942;
  --color-go: #3ddc84;
  --color-record: #e2574c;
  --color-on-accent: #121519;
  --color-paper: #ffffff;
  --font-display: "Barlow Condensed", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-body: "Barlow", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;
  --default-font-family: var(--font-body);
  --default-mono-font-family: var(--font-mono);
}

:root { color-scheme: dark; }
:root[data-theme="light"] {
  color-scheme: light;
  --color-ground: #eef0f3;
  --color-panel: #ffffff;
  --color-well: #f7f8fa;
  --color-lane: #e8ebef;
  --color-rule: #cfd5dd;
  --color-ink: #15191f;
  --color-dim: #55606d;
  --color-amber: #8f5d00;
  --color-go: #1a7f47;
  --color-record: #b8322a;
  --color-on-accent: #ffffff;
  --color-paper: #ffffff;
}

@font-face { font-family: "Barlow"; font-style: normal; font-weight: 400; font-display: swap; src: url("fonts/barlow-latin-400-normal.woff2") format("woff2"); }
@font-face { font-family: "Barlow"; font-style: normal; font-weight: 500; font-display: swap; src: url("fonts/barlow-latin-500-normal.woff2") format("woff2"); }
@font-face { font-family: "Barlow"; font-style: normal; font-weight: 600; font-display: swap; src: url("fonts/barlow-latin-600-normal.woff2") format("woff2"); }
@font-face { font-family: "Barlow Condensed"; font-style: normal; font-weight: 600; font-display: swap; src: url("fonts/barlow-condensed-latin-600-normal.woff2") format("woff2"); }
@font-face { font-family: "IBM Plex Mono"; font-style: normal; font-weight: 400; font-display: swap; src: url("fonts/ibm-plex-mono-latin-400-normal.woff2") format("woff2"); }
@font-face { font-family: "IBM Plex Mono"; font-style: normal; font-weight: 500; font-display: swap; src: url("fonts/ibm-plex-mono-latin-500-normal.woff2") format("woff2"); }
```

- [ ] **Step 7: Write `src/shell.css`**

```css
/* The server-rendered parts of the workroom pages (music/lib/Pages.php: the
   header, the pieces list, the error page) keep their own class names; this
   file gives them the console look from the tokens. error, empty and loading
   are shared with the page script. */
@layer base {
  body { @apply min-h-dvh bg-ground font-body text-ink antialiased; }
  a { @apply text-amber underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber; }
}

@layer components {
  .console-head { @apply mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-b border-rule px-4 py-2; }
  .console-head h1 { @apply font-display text-2xl font-semibold tracking-wide uppercase; }
  .crumb a { @apply inline-flex min-h-11 items-center font-display text-sm font-semibold tracking-widest uppercase; }
  .index-body { @apply mx-auto grid max-w-7xl gap-6 px-4 py-6; }
  .waiting-total { @apply font-mono text-sm text-dim; }
  h2.project { @apply border-b border-rule pb-1 font-display text-lg font-semibold tracking-widest uppercase text-dim; }
  ul.pieces { @apply mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3; }
  li.piece { @apply rounded-lg border border-rule bg-panel p-4; }
  li.piece > a { @apply flex min-h-11 items-center font-display text-xl font-semibold break-words text-ink uppercase; }
  li.piece .version { @apply font-mono text-xs text-dim; }
  li.piece .waiting-count { @apply mr-2 font-mono text-xs text-amber; }
  li.piece ul.changes { @apply mt-2 list-disc pl-5 text-sm text-dim; }
  .error { @apply rounded-lg border border-record bg-panel p-4 text-ink; }
  .empty { @apply text-dim; }
  .loading { @apply font-mono text-sm text-dim; }
  #workroom { @apply mx-auto block max-w-7xl px-4 pt-4 pb-24 lg:pb-6; }
  #workroom:empty { display: none; }
}
```

- [ ] **Step 8: Add the css entry and build**

`build.json` gains (after `entries`):

```json
  "css": { "in": "src/app.css", "out": "workroom", "fonts": "fonts" },
```

```bash
cd websites/www.cs/games && node _kit/build/build.mjs workroom && ls workroom/dist workroom/dist/fonts
head -c 3 workroom/dist/THIRD_PARTY_LICENSES.txt; grep -c 'License: OFL-1.1' workroom/dist/THIRD_PARTY_LICENSES.txt
```

Expected: `workroom.css` and six fonts in `dist/`; three OFL notices.

- [ ] **Step 9: Run the tests to verify they pass**

Run: `cd websites/www.cs/games && node --test workroom/test/tokens.test.ts workroom/test/color.test.ts && npm run --silent check`
Expected: PASS; check exits 0.

- [ ] **Step 10: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: console tokens in both themes, self-hosted fonts and the stylesheet

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

---

### Task 4: Choosing dark or light

**Files:**
- Create: `websites/www.cs/games/workroom/src/theme.ts`, `src/browser.ts`, `src/theme-boot.ts`, `src/ui/theme-context.ts`, `src/ui/ThemeSwitch.tsx`, `src/ui/console/cx.ts`
- Modify: `websites/www.cs/games/workroom/src/main.ts`, `build.json`, `tsconfig.json`, `src/tsconfig.dom.json`
- Test: `websites/www.cs/games/workroom/test/theme.test.ts`
- Regenerate: `dist/` (adds `theme.js`, `theme.js.map`)

**Interfaces:**
- Consumes: `Theme` from `tokens.ts`; `pref`, `oneOf`, `Pref` from `../../_kit/prefs.ts`; `StorageLike` from `../../_kit/ports.ts`; test doubles `memoryStorage`, `throwingStorage` from `../../_kit/test/record.ts`.
- Produces:
  - `theme.ts`: `type ThemeChoice = 'system' | 'dark' | 'light'`; `THEME_CHOICES`; `THEME_LABELS: Record<ThemeChoice, string>` (`System`, `Dark`, `Light`); `THEME_KEY = 'workroom-theme'`; `interface DarkQuery { readonly matches: boolean; addEventListener(type: 'change', fn: () => void): void; removeEventListener(type: 'change', fn: () => void): void }`; `interface ThemePorts { storage: StorageLike | null; root: { setAttribute(name: string, value: string): void }; dark: DarkQuery | null }`; `themePref(storage)`; `resolveTheme(choice, deviceDark): Theme`; `applyTheme(ports): Theme`; `interface ThemeHandle { choice(): ThemeChoice; choose(c: ThemeChoice): void; theme(): Theme; subscribe(fn: (t: Theme, c: ThemeChoice) => void): () => void; stop(): void }`; `startTheme(ports): ThemeHandle`.
  - `browser.ts`: `browserStorage(): StorageLike | null`, `browserThemePorts(): ThemePorts`.
  - `ui/theme-context.ts`: `ThemeContext` (default `'dark'`), `useTheme(): Theme`.
  - `ui/ThemeSwitch.tsx`: `ThemeSwitch({ handle })` (a `role="group"` named "Theme" of three buttons with `aria-pressed`, `data-theme-switch`), `ThemeRoot({ handle, children })` (provides `ThemeContext`, re-renders on change).
  - `dist/theme.js` (iife).

- [ ] **Step 1: Write the failing tests** — `test/theme.test.ts`:

```ts
// The theme: System follows the device, Dark and Light override it, the
// choice is remembered, and blocked, missing or garbage storage falls back to
// System without throwing. The switch and the context follow the handle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { applyTheme, resolveTheme, startTheme, THEME_KEY } from '../src/theme.ts';
import type { DarkQuery, ThemePorts } from '../src/theme.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { fire, installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';

installDocument();
const ui = await importTsx<{ sw: typeof import('../src/ui/ThemeSwitch.tsx'); ctx: typeof import('../src/ui/theme-context.ts') }>(
  import.meta.dirname, { sw: '../src/ui/ThemeSwitch.tsx', ctx: '../src/ui/theme-context.ts' });

const device = (dark: boolean): DarkQuery & { flip(d: boolean): void; listeners: Set<() => void> } => {
  const listeners = new Set<() => void>();
  const q = {
    matches: dark,
    listeners,
    addEventListener: (_t: 'change', fn: () => void) => { listeners.add(fn); },
    removeEventListener: (_t: 'change', fn: () => void) => { listeners.delete(fn); },
    flip(d: boolean) { q.matches = d; for (const fn of listeners) fn(); },
  };
  return q;
};
const rootEl = () => { const attrs: Record<string, string> = {}; return { attrs, setAttribute: (n: string, v: string) => { attrs[n] = v; } }; };
const ports = (over: Partial<ThemePorts> = {}) => {
  const root = rootEl();
  return { root, ports: { storage: memoryStorage(), root, dark: device(true), ...over } };
};

test('resolveTheme: System follows the device, Dark and Light do not', () => {
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
});

test('applyTheme sets data-theme once from the remembered choice and listens to nothing', () => {
  const q = device(true);
  const { root, ports: p } = ports({ storage: memoryStorage({ [THEME_KEY]: 'light' }), dark: q });
  assert.equal(applyTheme(p), 'light');
  assert.equal(root.attrs['data-theme'], 'light');
  assert.equal(q.listeners.size, 0);
});

test('stored garbage, throwing storage, no storage: System', () => {
  for (const storage of [memoryStorage({ [THEME_KEY]: 'purple' }), throwingStorage(), null]) {
    const { root, ports: p } = ports({ storage, dark: device(false) });
    assert.equal(applyTheme(p), 'light');
    assert.equal(root.attrs['data-theme'], 'light');
  }
});

test('no colour-scheme query: dark', () => {
  const { ports: p } = ports({ dark: null });
  assert.equal(applyTheme(p), 'dark');
});

test('under System the page follows the device live; under Dark or Light it does not', () => {
  const q = device(true);
  const { root, ports: p } = ports({ dark: q });
  const handle = startTheme(p);
  assert.equal(root.attrs['data-theme'], 'dark');
  q.flip(false);
  assert.equal(root.attrs['data-theme'], 'light');
  handle.choose('dark');
  assert.equal(root.attrs['data-theme'], 'dark');
  q.flip(true); q.flip(false);
  assert.equal(root.attrs['data-theme'], 'dark');
  handle.stop();
  assert.equal(q.listeners.size, 0);
});

test('the choice is remembered in storage and read back by the next page', () => {
  const storage = memoryStorage();
  const first = startTheme(ports({ storage }).ports);
  first.choose('light');
  assert.equal(storage.data.get(THEME_KEY), 'light');
  const { root, ports: p } = ports({ storage });
  assert.equal(startTheme(p).choice(), 'light');
  assert.equal(root.attrs['data-theme'], 'light');
});

test('with throwing storage a choice still holds for this page', () => {
  const { root, ports: p } = ports({ storage: throwingStorage() });
  const handle = startTheme(p);
  handle.choose('light');
  assert.equal(handle.choice(), 'light');
  assert.equal(root.attrs['data-theme'], 'light');
});

test('subscribers hear the theme and the choice', () => {
  const handle = startTheme(ports().ports);
  const heard: string[] = [];
  const off = handle.subscribe((t, c) => heard.push(`${t}/${c}`));
  handle.choose('light');
  off();
  handle.choose('dark');
  assert.deepEqual(heard, ['light/light']);
});

test('the switch shows three buttons, marks the choice, and a press changes the page', async () => {
  const { root: html, ports: p } = ports();
  const handle = startTheme(p);
  const root = makeEl('root');
  await act(() => { render(h(ui.sw.ThemeSwitch, { handle }), renderTarget(root)); });
  const buttons = walk(root).filter(e => e.localName === 'button');
  assert.deepEqual(buttons.map(b => b.textContent), ['System', 'Dark', 'Light']);
  assert.deepEqual(buttons.map(b => b._attrs['aria-pressed']), ['true', 'false', 'false']);
  await act(() => { fire(buttons[2]!, 'click'); });
  assert.equal(html.attrs['data-theme'], 'light');
  assert.deepEqual(buttons.map(b => b._attrs['aria-pressed']), ['false', 'false', 'true']);
});

test('ThemeRoot hands the live theme to what it wraps', async () => {
  const handle = startTheme(ports().ports);
  const seen: string[] = [];
  function Probe() { seen.push(ui.ctx.useTheme()); return null; }
  const root = makeEl('root');
  await act(() => { render(h(ui.sw.ThemeRoot, { handle }, h(Probe, {})), renderTarget(root)); });
  await act(() => { handle.choose('light'); });
  assert.deepEqual(seen.slice(-1), ['light']);
  assert.equal(seen[0], 'dark');
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd websites/www.cs/games && node --test workroom/test/theme.test.ts`
Expected: FAIL (`Cannot find module '../src/theme.ts'`).

- [ ] **Step 3: Write `src/theme.ts`**

```ts
// Dark or light: the owner's choice (System, Dark or Light), remembered in
// this browser, and the theme it gives on this device, written to <html> as
// data-theme. DOM-free: the page passes the storage, the root element and the
// device's colour-scheme query in.
import { oneOf, pref } from '../../_kit/prefs.ts';
import type { Pref } from '../../_kit/prefs.ts';
import type { StorageLike } from '../../_kit/ports.ts';
import type { Theme } from './tokens.ts';

export type ThemeChoice = 'system' | 'dark' | 'light';
export const THEME_CHOICES: readonly ThemeChoice[] = ['system', 'dark', 'light'];
export const THEME_LABELS: Readonly<Record<ThemeChoice, string>> = { system: 'System', dark: 'Dark', light: 'Light' };
export const THEME_KEY = 'workroom-theme';

/** The device's prefers-color-scheme: dark query. */
export interface DarkQuery {
  readonly matches: boolean;
  addEventListener(type: 'change', fn: () => void): void;
  removeEventListener(type: 'change', fn: () => void): void;
}
export interface ThemePorts { storage: StorageLike | null; root: { setAttribute(name: string, value: string): void }; dark: DarkQuery | null }

export const themePref = (storage: StorageLike | null): Pref<ThemeChoice> => pref(THEME_KEY, 'system', oneOf(THEME_CHOICES, 'system'), storage);

/** System follows the device; Dark and Light override it. */
export function resolveTheme(choice: ThemeChoice, deviceDark: boolean): Theme {
  return choice === 'system' ? (deviceDark ? 'dark' : 'light') : choice;
}

/** Sets data-theme once from the remembered choice (a device without the query counts as dark). The page head's boot script runs this before the first paint. */
export function applyTheme(ports: ThemePorts): Theme {
  const theme = resolveTheme(themePref(ports.storage).get(), ports.dark?.matches ?? true);
  ports.root.setAttribute('data-theme', theme);
  return theme;
}

export interface ThemeHandle {
  choice(): ThemeChoice;
  choose(c: ThemeChoice): void;
  theme(): Theme;
  subscribe(fn: (t: Theme, c: ThemeChoice) => void): () => void;
  stop(): void;
}

/** The live theme: applied at once, again on every choice and, under System, whenever the device setting changes. */
export function startTheme(ports: ThemePorts): ThemeHandle {
  const choice = themePref(ports.storage);
  const subscribers = new Set<(t: Theme, c: ThemeChoice) => void>();
  let current = applyTheme(ports);
  const update = (): void => {
    const c = choice.get();
    current = resolveTheme(c, ports.dark?.matches ?? true);
    ports.root.setAttribute('data-theme', current);
    for (const fn of subscribers) fn(current, c);
  };
  const unChoice = choice.subscribe(update);
  ports.dark?.addEventListener('change', update);
  return {
    choice: () => choice.get(),
    choose: c => choice.set(c),
    theme: () => current,
    subscribe(fn) { subscribers.add(fn); return () => { subscribers.delete(fn); }; },
    stop() { unChoice(); ports.dark?.removeEventListener('change', update); subscribers.clear(); },
  };
}
```

Note `applyTheme` inside `startTheme` reads through its own `pref`; with throwing storage both read the fallback, and after a `choose` only the handle's `pref` holds the session copy, which `update` reads.

- [ ] **Step 4: Write `src/browser.ts`, `src/theme-boot.ts`, `src/ui/theme-context.ts`, `src/ui/ThemeSwitch.tsx`**

```ts
// src/browser.ts
// The browser adapters the page hands its DOM-free modules.
import type { StorageLike } from '../../_kit/ports.ts';
import type { ThemePorts } from './theme.ts';

/** localStorage, or null where touching it throws (blocked site data, some private windows). */
export function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function browserThemePorts(): ThemePorts {
  const q = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  return {
    storage: browserStorage(),
    root: document.documentElement,
    dark: q && {
      get matches() { return q.matches; },
      addEventListener: (type, fn) => q.addEventListener(type, fn),
      removeEventListener: (type, fn) => q.removeEventListener(type, fn),
    },
  };
}
```

```ts
// src/theme-boot.ts
// dist/theme.js, the first script in the page head (a classic script, so it
// runs before the first paint): sets data-theme from the remembered choice.
// main.ts runs the live switch.
import { browserThemePorts } from './browser.ts';
import { applyTheme } from './theme.ts';

applyTheme(browserThemePorts());
```

```ts
// src/ui/theme-context.ts
// The theme the views draw for, so score colours can be made readable on it.
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { Theme } from '../tokens.ts';

export const ThemeContext = createContext<Theme>('dark');
export const useTheme = (): Theme => useContext(ThemeContext);
```

```tsx
// src/ui/ThemeSwitch.tsx
// The header's System / Dark / Light switch, and the root that hands the live
// theme to the views.
import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { THEME_CHOICES, THEME_LABELS } from '../theme.ts';
import type { ThemeHandle } from '../theme.ts';
import { cx } from './console/cx.ts';
import { ThemeContext } from './theme-context.ts';

export function ThemeSwitch(p: { handle: ThemeHandle }) {
  const [choice, setChoice] = useState(p.handle.choice());
  useEffect(() => p.handle.subscribe((_t, c) => setChoice(c)), [p.handle]);
  return (
    <div role="group" aria-label="Theme" data-theme-switch="" class="inline-flex rounded-md border border-rule bg-panel p-0.5">
      {THEME_CHOICES.map(c => (
        <button type="button" aria-pressed={c === choice} onClick={() => p.handle.choose(c)}
          class={cx('min-h-11 min-w-11 rounded px-3 font-display text-xs font-semibold tracking-widest uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber',
            c === choice ? 'bg-amber text-on-accent' : 'text-dim hover:text-ink')}>{THEME_LABELS[c]}</button>
      ))}
    </div>
  );
}

export function ThemeRoot(p: { handle: ThemeHandle; children?: ComponentChildren }) {
  const [theme, setTheme] = useState(p.handle.theme());
  useEffect(() => p.handle.subscribe(t => setTheme(t)), [p.handle]);
  return <ThemeContext.Provider value={theme}>{p.children}</ThemeContext.Provider>;
}
```

`cx` joins class names for every console component (Task 5 imports it); create it here:

```ts
// src/ui/console/cx.ts
// Joins class names, skipping the empty ones.
export const cx = (...parts: (string | false | null | undefined)[]): string => parts.filter(Boolean).join(' ');
```

- [ ] **Step 5: Wire it** — `build.json` `entries` gains `{ "in": "src/theme-boot.ts", "out": "theme", "format": "iife" }`; `tsconfig.json` `files` gains `"src/theme.ts"`; `src/tsconfig.dom.json` `files` gains `"browser.ts", "theme-boot.ts", "ui/theme-context.ts", "ui/ThemeSwitch.tsx", "ui/console/cx.ts"`.

`src/main.ts` becomes:

```ts
// The workroom page: starts the theme switch, reads which view and piece the
// server rendered, loads the draft over the session and draws it. The index
// view has nothing to draw.
import { h, render } from 'preact';
import { browserThemePorts } from './browser.ts';
import { draftUrl, loadDraft } from './load.ts';
import { startTheme } from './theme.ts';
import { ThemeRoot, ThemeSwitch } from './ui/ThemeSwitch.tsx';
import { Workroom } from './ui/Workroom.tsx';

const theme = startTheme(browserThemePorts());
const switchHost = document.getElementById('theme-switch');
if (switchHost) render(h(ThemeSwitch, { handle: theme }), switchHost);

const root = document.getElementById('workroom')!;
const { view, piece, version } = document.body.dataset;

function say(text: string, className: 'error' | 'loading', role: 'alert' | 'status'): void {
  const p = document.createElement('p');
  p.className = className;
  p.setAttribute('role', role);
  p.textContent = text;
  root.replaceChildren(p);
}

if (view === 'piece' && piece) {
  say('Loading…', 'loading', 'status');
  const wanted = version && /^\d+$/.test(version) ? Number(version) : null;
  const loaded = await loadDraft(window.fetch.bind(window), piece, wanted);
  if (!loaded.ok) say(loaded.error, 'error', 'alert');
  else {
    root.textContent = '';
    render(h(ThemeRoot, { handle: theme }, h(Workroom, {
      score: loaded.score,
      version: loaded.version,
      versions: loaded.versions,
      audioSrc: file => draftUrl(piece, loaded.version, file),
      onVersion: v => { location.search = `?id=${encodeURIComponent(piece)}&v=${v}`; },
    })), root);
  }
} else {
  root.textContent = '';
}
```

- [ ] **Step 6: Build and run the tests**

Run: `cd websites/www.cs/games && node _kit/build/build.mjs workroom && node --test workroom/test/theme.test.ts && sh units.sh && npm run --silent check`
Expected: PASS; `dist/theme.js` exists and holds no `import`.

- [ ] **Step 7: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: System, Dark and Light, remembered and applied before the first paint

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

---

### Task 5: The console components

**Files:**
- Create: `websites/www.cs/games/workroom/src/ui/console/Button.tsx`, `Tabs.tsx`, `Chip.tsx`, `Panel.tsx`, `Sheet.tsx`, `Readout.tsx`, `Legend.tsx`
- Modify: `websites/www.cs/games/workroom/src/tabs.ts` (adds `LEGENDS`), `src/tsconfig.dom.json`
- Test: `websites/www.cs/games/workroom/test/console.test.ts`

**Interfaces:**
- Consumes: `cx` (Task 4); `formatSeconds` from `axis.ts`; `Tab` from `tabs.ts`.
- Produces (PR 5 builds on these exact props):
  - `Button({ variant?: 'primary' | 'secondary' | 'ghost' | 'record'; onClick?(): void; disabled?; pressed?; label?; class?; buttonRef?: Ref<HTMLButtonElement>; data?: Record<\`data-${string}\`, string>; children })` — `type="button"`, at least 44 × 44.
  - `Tabs<T extends string>({ label; idPrefix; items: readonly { id: T; label: string }[]; value: T; onChange(id: T): void })`, plus `tabId(prefix, id)` and `panelId(prefix)`.
  - `Chip({ onClick(): void; pressed?: boolean; term?: string; children })` — a glossary word (`term` set: `data-term`, dashed amber) or a toggle (`aria-pressed`).
  - `Panel({ title?; accent?: boolean; class?; role?: 'dialog' | 'region' | 'group'; label?; tabIndex?; panelRef?: Ref<HTMLElement>; data?; children })` — a `<section>`.
  - `Sheet({ title; count?: number; open: boolean; onToggle(open: boolean): void; children })` — `data-sheet`; a bottom sheet below 1024 px, a side panel from 1024 px.
  - `Readout({ time: number; bar: number | null })` — `data-readout`, `data-clock`, `data-bar`.
  - `Legend({ items: readonly string[] })` — `<p data-legend>`, items joined by ` · `.
  - `tabs.ts`: `LEGENDS: Readonly<Record<Tab, readonly string[]>>`.

- [ ] **Step 1: Write the failing tests** — `test/console.test.ts`:

```ts
// The console components: what they render, what they report, and the
// keyboard: tabs move with the arrows, Home and End; nothing answers Escape.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import type { ComponentChild } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { LEGENDS } from '../src/tabs.ts';

installDocument();
const c = await importTsx<{
  button: typeof import('../src/ui/console/Button.tsx');
  tabs: typeof import('../src/ui/console/Tabs.tsx');
  chip: typeof import('../src/ui/console/Chip.tsx');
  panel: typeof import('../src/ui/console/Panel.tsx');
  sheet: typeof import('../src/ui/console/Sheet.tsx');
  readout: typeof import('../src/ui/console/Readout.tsx');
  legend: typeof import('../src/ui/console/Legend.tsx');
}>(import.meta.dirname, {
  button: '../src/ui/console/Button.tsx', tabs: '../src/ui/console/Tabs.tsx', chip: '../src/ui/console/Chip.tsx', panel: '../src/ui/console/Panel.tsx',
  sheet: '../src/ui/console/Sheet.tsx', readout: '../src/ui/console/Readout.tsx', legend: '../src/ui/console/Legend.tsx',
});
const mount = async (vnode: ComponentChild): Promise<StubElement> => {
  const root = makeEl('root');
  await act(() => { render(vnode, renderTarget(root)); });
  return root;
};
const classes = (e: StubElement): string[] => (e._attrs['class'] ?? e.className ?? '').split(/\s+/);

test('Button: a 44 px button of its variant that reports clicks and its pressed state', async () => {
  let n = 0;
  const root = await mount(h(c.button.Button, { variant: 'record', pressed: true, onClick: () => { n++; }, data: { 'data-x': '1' } }, 'Hum'));
  const b = walk(root).find(e => e.localName === 'button')!;
  assert.equal(b._attrs['type'], 'button');
  assert.ok(classes(b).includes('min-h-11') && classes(b).includes('min-w-11'));
  assert.ok(classes(b).includes('bg-record') && classes(b).includes('text-on-accent'));
  assert.equal(b._attrs['aria-pressed'], 'true');
  assert.equal(b._attrs['data-x'], '1');
  fire(b, 'click');
  assert.equal(n, 1);
});

test('Tabs: a tab list with one selected, roving focus, arrows, Home and End; Escape does nothing', async () => {
  const picked: string[] = [];
  const items = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }] as const;
  const root = await mount(h(c.tabs.Tabs, { label: 'Views', idPrefix: 'v', items, value: 'b', onChange: (id: string) => picked.push(id) }));
  const list = walk(root).find(e => e._attrs['role'] === 'tablist')!;
  assert.equal(list._attrs['aria-label'], 'Views');
  const tabs = walk(root).filter(e => e._attrs['role'] === 'tab');
  assert.deepEqual(tabs.map(t => t._attrs['aria-selected']), ['false', 'true', 'false']);
  assert.deepEqual(tabs.map(t => t._attrs['tabindex']), ['-1', '0', '-1']);
  assert.equal(tabs[1]!.id, c.tabs.tabId('v', 'b'));
  assert.equal(tabs[1]!._attrs['aria-controls'], c.tabs.panelId('v'));
  fire(tabs[1]!, 'keydown', { key: 'ArrowRight' });
  fire(tabs[1]!, 'keydown', { key: 'ArrowLeft' });
  fire(tabs[1]!, 'keydown', { key: 'Home' });
  fire(tabs[1]!, 'keydown', { key: 'End' });
  fire(tabs[1]!, 'keydown', { key: 'Escape' });
  fire(tabs[0]!, 'click');
  assert.deepEqual(picked, ['c', 'a', 'a', 'c', 'a']);
});

test('Tabs: the arrows wrap around the ends', async () => {
  const picked: string[] = [];
  const items = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }];
  const root = await mount(h(c.tabs.Tabs, { label: 'T', idPrefix: 't', items, value: 'b', onChange: (id: string) => picked.push(id) }));
  const tabs = walk(root).filter(e => e._attrs['role'] === 'tab');
  fire(tabs[1]!, 'keydown', { key: 'ArrowRight' });
  assert.deepEqual(picked, ['a']);
});

test('Chip: a glossary word carries its term; a toggle carries aria-pressed', async () => {
  let n = 0;
  const word = await mount(h(c.chip.Chip, { term: 'ostinato', onClick: () => { n++; } }, 'ostinato'));
  const w = walk(word).find(e => e.localName === 'button')!;
  assert.equal(w._attrs['data-term'], 'ostinato');
  assert.equal(w._attrs['aria-pressed'], undefined);
  fire(w, 'click');
  const toggle = await mount(h(c.chip.Chip, { pressed: false, onClick: () => {} }, 'Brass'));
  const t = walk(toggle).find(e => e.localName === 'button')!;
  assert.equal(t._attrs['aria-pressed'], 'false');
  assert.ok(classes(t).includes('min-h-11'));
  assert.equal(n, 1);
});

test('Panel: a section with an optional heading', async () => {
  const root = await mount(h(c.panel.Panel, { title: 'Words', data: { 'data-card': '' } }, 'body'));
  const s = walk(root).find(e => e.localName === 'section')!;
  assert.equal(s._attrs['data-card'], '');
  assert.equal(walk(root).find(e => e.localName === 'h2')!.textContent, 'Words');
});

test('Sheet: the phone handle says what it holds and opens or closes it', async () => {
  const toggles: boolean[] = [];
  const root = await mount(h(c.sheet.Sheet, { title: 'Notes', count: 3, open: false, onToggle: (o: boolean) => toggles.push(o) }, 'inside'));
  const handle = walk(root).find(e => e.localName === 'button' && e._attrs['aria-expanded'] !== undefined)!;
  assert.equal(handle._attrs['aria-expanded'], 'false');
  assert.match(handle.textContent, /Notes.*3/);
  const body = walk(root).find(e => e._attrs['data-sheet-body'] !== undefined)!;
  assert.ok(classes(body).includes('hidden') && classes(body).includes('lg:grid'), 'closed on a phone, always shown from 1024 px');
  fire(handle, 'click');
  assert.deepEqual(toggles, [true]);
});

test('Readout: time always, the bar only on a music piece', async () => {
  const music = await mount(h(c.readout.Readout, { time: 1.5, bar: 3 }));
  assert.equal(walk(music).find(e => e._attrs['data-clock'] !== undefined)!.textContent, '1.5 s');
  assert.equal(walk(music).find(e => e._attrs['data-bar'] !== undefined)!.textContent, 'bar 3');
  const sound = await mount(h(c.readout.Readout, { time: 0.05, bar: null }));
  assert.equal(walk(sound).filter(e => e._attrs['data-bar'] !== undefined).length, 0);
});

test('Legend: the spec’s line for every view', async () => {
  assert.deepEqual(LEGENDS, {
    story: ['star = a note', 'higher = higher note', 'bigger = louder', 'glow = energy'],
    roll: ['bar = a note', 'higher = higher note', 'longer = held longer', 'colour = instrument'],
    sound: ['bottom = low sounds', 'top = high', 'brighter = louder'],
    sheet: ['each line is a staff; notes higher on it are higher'],
  });
  const root = await mount(h(c.legend.Legend, { items: LEGENDS.story }));
  assert.equal(walk(root).find(e => e._attrs['data-legend'] !== undefined)!.textContent, 'star = a note · higher = higher note · bigger = louder · glow = energy');
});
```

(If the stub stores `class` as `className` rather than in `_attrs`, `classes()` reads either.)

- [ ] **Step 2: Run them to verify they fail**

Run: `cd websites/www.cs/games && node --test workroom/test/console.test.ts`
Expected: FAIL (modules missing).

- [ ] **Step 3: Write the components**

```tsx
// src/ui/console/Button.tsx
// The console's button: primary (amber), secondary, ghost and record (red);
// at least 44 px square.
import type { ComponentChildren, Ref } from 'preact';
import { cx } from './cx.ts';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'record';
const VARIANTS: Readonly<Record<ButtonVariant, string>> = {
  primary: 'border-amber bg-amber text-on-accent hover:brightness-110',
  secondary: 'border-rule bg-panel text-ink hover:border-dim',
  ghost: 'border-transparent bg-transparent text-ink hover:bg-lane',
  record: 'border-record bg-record text-on-accent hover:brightness-110',
};
const BASE = 'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border px-4 font-display text-sm font-semibold tracking-wider uppercase select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-not-allowed disabled:opacity-50';

export interface ButtonProps {
  variant?: ButtonVariant;
  onClick?(): void;
  disabled?: boolean;
  /** aria-pressed, for a toggle. */
  pressed?: boolean;
  /** The accessible name, for a button whose text is a symbol. */
  label?: string;
  class?: string;
  buttonRef?: Ref<HTMLButtonElement>;
  data?: Record<`data-${string}`, string>;
  children?: ComponentChildren;
}

export function Button(p: ButtonProps) {
  return (
    <button type="button" ref={p.buttonRef} class={cx(BASE, VARIANTS[p.variant ?? 'secondary'], p.class)} disabled={p.disabled}
      aria-pressed={p.pressed} aria-label={p.label} onClick={() => p.onClick?.()} {...p.data}>{p.children}</button>
  );
}
```

```tsx
// src/ui/console/Tabs.tsx
// A tab list: one tab selected, the only one in the Tab order; Left and Right
// move (wrapping), Home and End jump. The panel it controls is panelId(prefix).
import { useRef } from 'preact/hooks';
import { cx } from './cx.ts';

export interface TabItem<T extends string> { id: T; label: string }
export interface TabsProps<T extends string> { label: string; idPrefix: string; items: readonly TabItem<T>[]; value: T; onChange(id: T): void }

export const tabId = (prefix: string, id: string): string => `${prefix}-tab-${id}`;
export const panelId = (prefix: string): string => `${prefix}-panel`;

export function Tabs<T extends string>(p: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const at = Math.max(0, p.items.findIndex(t => t.id === p.value));
  const move = (i: number): void => {
    const n = p.items.length;
    const k = ((i % n) + n) % n;
    p.onChange(p.items[k]!.id);
    refs.current[k]?.focus();
  };
  return (
    <div role="tablist" aria-label={p.label} class="flex gap-1 overflow-x-auto border-b border-rule">
      {p.items.map((t, i) => {
        const on = t.id === p.value;
        return (
          <button type="button" role="tab" id={tabId(p.idPrefix, t.id)} aria-selected={on} aria-controls={panelId(p.idPrefix)} tabindex={on ? 0 : -1}
            ref={el => { refs.current[i] = el; }}
            class={cx('min-h-11 shrink-0 border-b-2 px-3 font-display text-sm font-semibold tracking-wider uppercase focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber',
              on ? 'border-amber text-amber' : 'border-transparent text-dim hover:text-ink')}
            onClick={() => p.onChange(t.id)}
            onKeyDown={e => {
              const go = e.key === 'ArrowRight' ? at + 1 : e.key === 'ArrowLeft' ? at - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? p.items.length - 1 : null;
              if (go === null) return;
              e.preventDefault();
              move(go);
            }}>{t.label}</button>
        );
      })}
    </div>
  );
}
```

```tsx
// src/ui/console/Chip.tsx
// A small rounded button: a glossary word (term set: dashed amber, opens its
// card) or a toggle (aria-pressed, filled amber when on).
import type { ComponentChildren } from 'preact';
import { cx } from './cx.ts';

export interface ChipProps { onClick(): void; pressed?: boolean; term?: string; children?: ComponentChildren }

export function Chip(p: ChipProps) {
  const word = p.term !== undefined;
  return (
    <button type="button" data-term={p.term} aria-pressed={word ? undefined : (p.pressed ?? false)} onClick={() => p.onClick()}
      class={cx('inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber',
        word ? 'border-dashed border-amber text-ink hover:bg-lane' : p.pressed ? 'border-amber bg-amber text-on-accent' : 'border-rule bg-panel text-dim hover:text-ink')}>{p.children}</button>
  );
}
```

```tsx
// src/ui/console/Panel.tsx
// A card on the console: a section with an optional small-caps heading;
// accent outlines it in amber (an open glossary card).
import type { ComponentChildren, Ref } from 'preact';
import { cx } from './cx.ts';

export interface PanelProps {
  title?: string;
  accent?: boolean;
  class?: string;
  role?: 'dialog' | 'region' | 'group';
  label?: string;
  tabIndex?: number;
  panelRef?: Ref<HTMLElement>;
  data?: Record<`data-${string}`, string>;
  children?: ComponentChildren;
}

export function Panel(p: PanelProps) {
  return (
    <section ref={p.panelRef} role={p.role} aria-label={p.label} tabindex={p.tabIndex} {...p.data}
      class={cx('rounded-lg border bg-panel p-4 text-ink focus:outline-none', p.accent ? 'border-amber' : 'border-rule', p.class)}>
      {p.title ? <h2 class="mb-2 font-display text-sm font-semibold tracking-widest uppercase text-dim">{p.title}</h2> : null}
      {p.children}
    </section>
  );
}
```

```tsx
// src/ui/console/Sheet.tsx
// The notes panel: below 1024 px a bottom sheet whose 44 px handle opens it to
// at most three quarters of the screen; from 1024 px a side column, always open.
import type { ComponentChildren } from 'preact';
import { cx } from './cx.ts';

export interface SheetProps { title: string; count?: number; open: boolean; onToggle(open: boolean): void; children?: ComponentChildren }

export function Sheet(p: SheetProps) {
  const count = p.count !== undefined ? <span class="ml-2 font-mono text-amber">{p.count}</span> : null;
  return (
    <aside data-sheet="" aria-label={p.title}
      class="fixed inset-x-0 bottom-0 z-20 max-h-[75dvh] overflow-y-auto rounded-t-xl border-t border-rule bg-panel shadow-lg lg:static lg:z-auto lg:max-h-none lg:overflow-visible lg:rounded-lg lg:border">
      <button type="button" aria-expanded={p.open} onClick={() => p.onToggle(!p.open)}
        class="flex min-h-11 w-full items-center justify-between gap-2 px-4 font-display text-sm font-semibold tracking-widest uppercase focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber lg:hidden">
        <span>{p.title}{count}</span>
        <span aria-hidden="true">{p.open ? '▾' : '▴'}</span>
      </button>
      <h2 class="hidden px-4 pt-4 font-display text-sm font-semibold tracking-widest uppercase lg:block">{p.title}{count}</h2>
      <div data-sheet-body="" class={cx('gap-4 px-4 pb-4 lg:pt-3', p.open ? 'grid' : 'hidden lg:grid')}>{p.children}</div>
    </aside>
  );
}
```

```tsx
// src/ui/console/Readout.tsx
// The time readout: the playing time, and the bar on a music piece.
import { formatSeconds } from '../../axis.ts';

export function Readout(p: { time: number; bar: number | null }) {
  return (
    <span data-readout="" class="inline-flex min-h-11 items-center gap-3 rounded-md bg-well px-3 font-mono text-amber tabular-nums">
      <span data-clock="">{formatSeconds(p.time)}</span>
      {p.bar !== null ? <span data-bar="" class="text-dim">bar {p.bar}</span> : null}
    </span>
  );
}
```

```tsx
// src/ui/console/Legend.tsx
// One line under a view saying how to read it.
export function Legend(p: { items: readonly string[] }) {
  return <p data-legend="" class="font-mono text-xs text-dim">{p.items.join(' · ')}</p>;
}
```

Append to `src/tabs.ts`:

```ts
/** The one-line legend under each view. */
export const LEGENDS: Readonly<Record<Tab, readonly string[]>> = {
  story: ['star = a note', 'higher = higher note', 'bigger = louder', 'glow = energy'],
  roll: ['bar = a note', 'higher = higher note', 'longer = held longer', 'colour = instrument'],
  sound: ['bottom = low sounds', 'top = high', 'brighter = louder'],
  sheet: ['each line is a staff; notes higher on it are higher'],
};
```

Add the seven files to `src/tsconfig.dom.json` `files` (`"ui/console/Button.tsx"`, … `"ui/console/Legend.tsx"`).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd websites/www.cs/games && node --test workroom/test/console.test.ts && node _kit/build/build.mjs workroom && sh units.sh && npm run --silent check`
Expected: PASS (the components are not yet imported by the page, so `dist/workroom.js` is unchanged; `workroom.css` is unchanged too until a scanned file uses them, and the rebuild picks up their classes).

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: console components (button, tabs, chip, panel, sheet, readout, legend)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

---

### Task 6: The piece page in the new look

**Files:**
- Modify: `websites/www.cs/games/workroom/src/ui/Workroom.tsx`, `Player.tsx`, `ViewTabs.tsx`, `Glossary.tsx`, `PianoRoll.tsx`, `SoundPicture.tsx`, `parts.tsx`
- Move: `src/ui/Sheet.tsx` → `src/ui/SheetMusic.tsx` (`git mv`), export `SheetMusic`, props type `SheetMusicProps`
- Modify: `src/axis.ts` (adds `AXIS_H`), `src/pianoroll.ts` (adds `ROLL_H`), `src/spectro.ts` (adds `PICTURE_H`, removes `BRIGHTNESS_LEGEND`), `src/tsconfig.dom.json`
- Test: `test/views.test.ts`, `test/workroom.test.ts`, `test/playback.test.ts`, `test/spectro.test.ts`

**Interfaces:**
- Consumes: Task 5 components and `LEGENDS`; `useTheme` (Task 4); `readableOn` (Task 3).
- Produces: `AXIS_H = 20` (axis.ts, re-exported by parts.tsx), `ROLL_H = 280` (pianoroll.ts), `PICTURE_H = 200` (spectro.ts); `SheetMusic` with the old `Sheet` props; the Workroom's view stage `data-guide="view"` (the drawing at its top-left, no padding or border box), roll lane picker `data-guide="lane-picker"`, sheet-music host `#sheet[data-guide="sheet"]`; glossary card `[data-card]`; change buttons `[data-where]`; roll pitch labels `[data-pitch-name]`; `Player` keeps `seekRef` and `clipRef` and renders a `Readout`.

These classes keep a view working and must be on the elements whatever else changes (they were in `music/music.css`, which Task 8 deletes):
- every drawing surface (`[data-timeline]`, `[data-roll]`, `[data-picture]`): `block max-w-full touch-none select-none`;
- labels and icons inside a drawing (lane icon, lane name, section name, tick labels, pitch names, frequency labels, pin numbers, the playhead): `pointer-events-none`; a glossary word inside a section name: `pointer-events-auto cursor-pointer`;
- sound picture: the picture box `relative overflow-hidden`; its `<img>` `pointer-events-none absolute top-0 max-w-none [image-rendering:pixelated]`; its marks svg `pointer-events-none absolute top-0 left-0`;
- `#sheet`: `overflow-x-auto rounded-md bg-paper p-2`.

- [ ] **Step 1: Update the tests first**

In `test/views.test.ts` add `ctx: typeof import('../src/ui/theme-context.ts')` to the `importTsx` type and `ctx: '../src/ui/theme-context.ts'` to its module map, so the test's `ThemeContext` is the same instance the views read (one `importTsx` call is one bundle; a second call would make a second context).

In `test/workroom.test.ts` replace `e.className === 'card'` (two places) with `e._attrs['data-card'] !== undefined`, and `e.className === 'where'` with `e._attrs['data-where'] !== undefined`. In `test/views.test.ts` replace `e.className === 'pitch-name'` with `e._attrs['data-pitch-name'] !== undefined`. In `test/playback.test.ts` change the import to `sheet: typeof import('../src/ui/SheetMusic.tsx')` / `'../src/ui/SheetMusic.tsx'` and every `ui.sheet.Sheet` to `ui.sheet.SheetMusic`. In `test/spectro.test.ts` drop `BRIGHTNESS_LEGEND` from the import and delete its assertion line.

Append to `test/views.test.ts`:

```ts
test('the view tabs are a tab list, the chosen one selected', () => {
  const root = makeEl('root');
  render(h(ui.tabs.ViewTabs, { tabs: tabsFor(score), tab: 'roll', onTab: () => {} }), renderTarget(root));
  const tabs = walk(root).filter(e => e._attrs['role'] === 'tab');
  assert.deepEqual(tabs.map(t => t.textContent), ['Story', 'Piano roll', 'Sound picture', 'Sheet music']);
  assert.deepEqual(tabs.map(t => t._attrs['aria-selected']), ['false', 'true', 'false', 'false']);
});

test('a roll note is drawn in a colour readable on the light well', () => {
  const root = makeEl('root');
  const gold = { ...score, characters: score.characters.map(c => ({ ...c, color: '#ffe680' })) };
  render(h(ui.ctx.ThemeContext.Provider, { value: 'light' }, h(ui.roll.PianoRoll, { score: gold, tempo: tempoMap(gold), view: fitView(16, 800), time: 0, onSeek: () => {}, onView: () => {} })), renderTarget(root));
  const fills = withAttr(root, 'data-note').filter(e => e._attrs['data-lane'] === 'brass').map(e => e._attrs['fill']);
  assert.ok(fills.length > 0 && fills.every(f => f !== '#ffe680'), 'pale gold is darkened on daylight');
});
```

Append to `test/workroom.test.ts`:

```ts
test('the piece page: two columns from 1024 px, the notes in a sheet, a legend under the view', async () => {
  const root = await mount();
  const page = walk(root).find(e => (e._attrs['class'] ?? e.className ?? '').includes('lg:grid-cols-['))!;
  assert.ok(page, 'a grid that becomes two columns at lg');
  const sheet = named(root, 'data-sheet');
  assert.ok(walk(sheet).some(e => e._attrs['data-change'] !== undefined), 'the change list is in the sheet');
  assert.equal(named(root, 'data-legend').textContent, 'star = a note · higher = higher note · bigger = louder · glow = energy');
  assert.ok(named(root, 'data-guide'), 'the view stage is marked for the guide');
  unmount(root);
});

test('opening a word opens the notes sheet on a phone', async () => {
  const root = await mount();
  const handle = walk(named(root, 'data-sheet')).find(e => e._attrs['aria-expanded'] !== undefined)!;
  assert.equal(handle._attrs['aria-expanded'], 'false');
  await openWord(root, 'ostinato');
  assert.equal(handle._attrs['aria-expanded'], 'true');
  unmount(root);
});

test('a change that names one bar still has a 44 px tap target', async () => {
  const short = { ...score, changes: [{ ...score.changes[0]!, from_bar: 3, to_bar: 3 }] };
  const root = makeEl('root');
  await act(() => { render(h(ui.room.Workroom, { score: short, version: 1, versions: [1], audioSrc: (f: string) => f, onVersion: () => {} }), renderTarget(root)); });
  const where = walk(root).find(e => e._attrs['data-where'] !== undefined)!;
  assert.equal(where.textContent, 'Bar 3');
  const cls = (where._attrs['class'] ?? where.className ?? '').split(/\s+/);
  assert.ok(cls.includes('min-h-11') && cls.includes('min-w-11'), 'tall and wide enough for a thumb, whatever the label');
  unmount(root);
});
```

test('the drawing is measured again when the stage changes width without a window resize', async () => {
  const observed: { fire: () => void; observed: StubElement[]; disconnected: boolean }[] = [];
  class StubObserver {
    readonly entry = { fire: () => {}, observed: [] as StubElement[], disconnected: false };
    constructor(cb: () => void) { this.entry.fire = cb; observed.push(this.entry); }
    observe(el: StubElement): void { this.entry.observed.push(el); }
    disconnect(): void { this.entry.disconnected = true; }
  }
  Object.assign(globalThis, { ResizeObserver: StubObserver });
  try {
    const root = await mount();
    const stage = walk(root).find(e => e._attrs['data-guide'] === 'view')!;
    assert.equal(observed.length, 1, 'one observer');
    assert.deepEqual(observed[0]!.observed, [stage], 'it watches the stage');
    const drawing = (): number => Number(named(root, 'data-timeline')._attrs['width']);
    assert.equal(drawing(), 720);
    stage.getBoundingClientRect = () => ({ width: 600, height: 460 });
    await act(() => { observed[0]!.fire(); });
    assert.equal(drawing(), 600, 'the drawing follows the stage');
    unmount(root);
    assert.equal(observed[0]!.disconnected, true, 'leaving the page stops watching');
  } finally {
    delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
  }
});

(`openWord`, `named`, `mount`, `unmount` are the file's existing helpers; the last two tests render the same component with their own score or observer.)

- [ ] **Step 2: Run them to verify they fail**

Run: `cd websites/www.cs/games && node --test workroom/test/views.test.ts workroom/test/workroom.test.ts workroom/test/playback.test.ts workroom/test/spectro.test.ts`
Expected: FAIL (no `data-card`, no `role="tab"`, no `SheetMusic.tsx`, no `data-sheet`).

- [ ] **Step 3: Move the shared constants**

- `src/axis.ts`: add `/** The height of the time axis under a drawing. */ export const AXIS_H = 20;`
- `src/ui/parts.tsx`: replace `export const AXIS_H = 20;` with `import { AXIS_H } from '../axis.ts';` at the top and `export { AXIS_H };`.
- `src/pianoroll.ts`: add `/** The piano roll's drawing height. */ export const ROLL_H = 280;`; `PianoRoll.tsx` drops `ROLL_HEIGHT` and uses `ROLL_H`.
- `src/spectro.ts`: delete `BRIGHTNESS_LEGEND`; add `/** The sound picture's drawing height. */ export const PICTURE_H = 200;`; `SoundPicture.tsx` drops `PICTURE_HEIGHT` and uses `PICTURE_H`.

- [ ] **Step 4: Restyle the shared parts** — `src/ui/parts.tsx` element classes become:

```tsx
  return <line class="playhead pointer-events-none stroke-amber" stroke-width={2} data-playhead="" x1={x} x2={x} y1={0} y2={p.height} />;
```

```tsx
    <svg class="lane-icon pointer-events-none" data-icon={p.family} role="img" aria-label={`${p.family} instruments`} x={p.x} y={p.y} width={LANE_ICON_SIZE} height={LANE_ICON_SIZE} viewBox="0 0 16 16">
```

```tsx
    <g class="axis">
      {ticks.map(t => <line class="tick stroke-rule" stroke-width={1} x1={t.x} x2={t.x} y1={0} y2={p.height} />)}
      {ticks.map(t => <text class="tick-label pointer-events-none fill-dim font-mono text-[11px]" data-tick="" x={t.x + 3} y={p.height + 14}>{t.label}</text>)}
    </g>
```

- [ ] **Step 5: Player, ViewTabs, Glossary, SheetMusic**

`src/ui/Player.tsx`: import `Button` and `Readout`; the returned JSX becomes

```tsx
    <div class="player flex flex-wrap items-center gap-3 rounded-lg bg-panel p-3 ring-1 ring-rule">
      {source ? (
        <audio ref={audio} preload="metadata" src={p.audioSrc(source.file)}
          onError={() => setProblem("This draft's audio could not play. Reload the page, or open another draft.")}
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
          onTimeUpdate={() => { if (audio.current) p.onTime(audio.current.currentTime); }} />
      ) : <p class="error w-full" role="alert">This browser cannot play this draft's audio.</p>}
      {problem ? <p class="error w-full" role="alert">{problem}</p> : null}
      <Button variant="primary" class="min-w-24" disabled={!source} onClick={toggle}>{playing ? 'Pause' : 'Play'}</Button>
      <Readout time={p.time} bar={p.bar} />
    </div>
```

`src/ui/ViewTabs.tsx`:

```tsx
// The views a piece offers, as a tab list; the view under it is panelId('view').
import { TAB_LABELS } from '../tabs.ts';
import type { Tab } from '../tabs.ts';
import { Tabs } from './console/Tabs.tsx';

export interface ViewTabsProps { tabs: Tab[]; tab: Tab; onTab(t: Tab): void }

export function ViewTabs(p: ViewTabsProps) {
  return <Tabs label="Views" idPrefix="view" items={p.tabs.map(t => ({ id: t, label: TAB_LABELS[t] }))} value={p.tab} onChange={p.onTab} />;
}
```

`src/ui/Glossary.tsx`:

```tsx
// A glossary word is a chip that opens a two-line card; the card can play the
// moment of the piece where the word is heard.
import type { Ref } from 'preact';
import type { Term } from '../glossary.ts';
import type { Clip } from '../player.ts';
import { Button } from './console/Button.tsx';
import { Chip } from './console/Chip.tsx';
import { Panel } from './console/Panel.tsx';

export function Word(p: { term: Term; text: string; onOpen(id: string): void }) {
  return <Chip term={p.term.id} onClick={() => p.onOpen(p.term.id)}>{p.text}</Chip>;
}

export function Card(p: { cardRef?: Ref<HTMLElement>; term: Term; clip: Clip | null; onHear(c: Clip): void; onClose(): void }) {
  const clip = p.clip;
  return (
    <Panel role="dialog" label={p.term.word} tabIndex={-1} panelRef={p.cardRef} accent data={{ 'data-card': '' }}>
      <h3 class="font-display text-xl font-semibold uppercase">{p.term.word}</h3>
      <p class="mt-1">{p.term.lines[0]}</p>
      <p class="mt-1 text-dim">{p.term.lines[1]}</p>
      <div class="mt-3 flex flex-wrap gap-2">
        {clip ? <Button variant="primary" onClick={() => p.onHear(clip)}>Hear it</Button> : null}
        <Button variant="ghost" onClick={p.onClose}>Close</Button>
      </div>
    </Panel>
  );
}
```

`git mv src/ui/Sheet.tsx src/ui/SheetMusic.tsx`; rename `SheetProps` → `SheetMusicProps`, `Sheet` → `SheetMusic`; first comment line "Sheet music: a lane picker and the notation of the chosen lane."; its JSX becomes:

```tsx
    <div class="sheet-view grid gap-2 p-2">
      <div class="lane-picker flex flex-wrap gap-2" role="group" aria-label="Instrument" data-guide="lane-picker">
        {p.lanes.map(l => <Chip pressed={l.id === p.laneId} onClick={() => p.onLane(l.id)}>{l.name}</Chip>)}
      </div>
      {status === 'loading' ? <p class="loading" role="status">Loading sheet music…</p> : null}
      {status === 'error' ? <p class="error" role="alert">{error}</p> : null}
      <div id="sheet" data-guide="sheet" class="overflow-x-auto rounded-md bg-paper p-2" ref={host} />
    </div>
```

(import `Chip` from `./console/Chip.tsx`).

- [ ] **Step 6: PianoRoll and SoundPicture**

`src/ui/PianoRoll.tsx` body after the hooks:

```tsx
  const theme = useTheme();
  const height = roll.height + AXIS_H;
  if (roll.notes.length === 0) return <p class="empty p-4">No notes to show in the chosen lanes.</p>;
  return (
    <svg class="roll block max-w-full touch-none select-none" data-roll="" width={view.width} height={height} viewBox={`0 0 ${view.width} ${height}`} role="img" aria-label="Piano roll" {...surface}>
      {roll.rows.map(r => <rect class={r.black ? 'row black fill-well' : 'row fill-lane'} x={0} y={r.y} width={view.width} height={roll.rowH} />)}
      {labelRows(roll).map(r => <text class="pitch-name pointer-events-none fill-dim font-mono text-[10px]" data-pitch-name="" x={4} y={r.y + roll.rowH - 1}>{r.name}</text>)}
      {roll.notes.map(n => <rect class="note" data-note={n.index} data-lane={n.lane} x={n.rect.x} y={n.rect.y} width={Math.max(1, n.rect.w)} height={n.rect.h} rx={1} fill={readableOn(theme, n.color, 'mark')} />)}
      <Axis ticks={axisTicks(score, tempo, view)} height={roll.height} />
      <Playhead view={view} time={p.time} height={roll.height} />
    </svg>
  );
```

(imports: `useTheme` from `./theme-context.ts`, `readableOn` from `../color.ts`, `ROLL_H` from `../pianoroll.ts`; `layoutRoll(score, view, ROLL_H, p.lanes)`.)

`src/ui/SoundPicture.tsx` returns:

```tsx
    <div class="sound-picture">
      <div class="picture relative block max-w-full touch-none select-none overflow-hidden" data-picture="" style={{ width: `${view.width}px`, height: `${height}px` }} {...surface}>
        <img data-spectrogram="" alt="Spectrogram: time across, pitch up, brighter is louder" src={p.imageSrc} draggable={false}
          class="pointer-events-none absolute top-0 max-w-none [image-rendering:pixelated]"
          style={{ left: `${-view.start * view.pxPerSec}px`, width: `${score.duration * view.pxPerSec}px`, height: `${PICTURE_H}px` }} />
        <svg class="picture-marks pointer-events-none absolute top-0 left-0" width={view.width} height={height} viewBox={`0 0 ${view.width} ${height}`} aria-hidden="true">
          {spectroAxis(score.spectrogram, PICTURE_H).map(a => <text class="freq fill-ink stroke-well font-mono text-[11px] [paint-order:stroke] [stroke-width:3px]" data-freq={a.text} x={4} y={Math.min(PICTURE_H - 4, Math.max(12, a.y))}>{a.text}</text>)}
          <Axis ticks={axisTicks(score, tempoMap(score), view)} height={PICTURE_H} />
          <Playhead view={view} time={p.time} height={PICTURE_H} />
        </svg>
      </div>
    </div>
```

(The picture box is as tall as the picture plus the axis, so the axis labels show; the legend moves to the Workroom.)

- [ ] **Step 7: The Workroom** — replace `src/ui/Workroom.tsx` with:

```tsx
// The workroom: one piece, one playhead, the views the piece offers, the
// glossary and Claude's change list. It owns what the views share (the view of
// the time axis, the playing time, the tab, the lane filter, the open word, the
// notes sheet) and holds no logic the DOM-free modules can hold. From 1024 px
// the views and the notes sheet sit side by side; narrower, the sheet is a
// bottom sheet.
import type { ComponentChildren } from 'preact';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { formatSeconds } from '../axis.ts';
import { splitTerms, term, termsIn } from '../glossary.ts';
import { follow } from '../player.ts';
import type { Clip } from '../player.ts';
import type { Change, Score } from '../score.ts';
import { LEGENDS, pickTab, tabsFor } from '../tabs.ts';
import type { Tab } from '../tabs.ts';
import { changeTimes, tempoMap } from '../tempo.ts';
import { boundsFor, clampView, fitView, timeToX } from '../zoom.ts';
import type { View } from '../zoom.ts';
import { Chip } from './console/Chip.tsx';
import { Legend } from './console/Legend.tsx';
import { Sheet } from './console/Sheet.tsx';
import { panelId, tabId } from './console/Tabs.tsx';
import { Card, Word } from './Glossary.tsx';
import { PianoRoll } from './PianoRoll.tsx';
import { Player } from './Player.tsx';
import { SheetMusic } from './SheetMusic.tsx';
import { SoundPicture } from './SoundPicture.tsx';
import { Timeline } from './Timeline.tsx';
import { ViewTabs } from './ViewTabs.tsx';

export interface WorkroomProps { score: Score; version: number; versions: number[]; audioSrc: (file: string) => string; onVersion(v: number): void; children?: ComponentChildren }

const FALLBACK_WIDTH = 720;

/** Where a change sits, in the words the piece is counted in: its bars on a music piece, its seconds on a sound piece. */
export function changeLabel(c: Change): string {
  if (c.from_bar !== undefined && c.to_bar !== undefined) return c.from_bar === c.to_bar ? `Bar ${c.from_bar}` : `Bars ${c.from_bar}–${c.to_bar}`;
  return `${formatSeconds(c.from ?? 0)} – ${formatSeconds(c.to ?? 0)}`;
}

const SMALL_CAPS = 'font-display text-xs font-semibold tracking-widest uppercase text-dim';

export function Workroom(p: WorkroomProps) {
  const { score } = p;
  const tempo = useMemo(() => tempoMap(score), [score]);
  const tabs = useMemo(() => tabsFor(score), [score]);
  const uses = useMemo(() => termsIn(score), [score]);
  const stage = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(FALLBACK_WIDTH);
  const [view, setView] = useState<View>(() => fitView(score.duration, FALLBACK_WIDTH));
  const [time, setTime] = useState(0);
  const [wanted, setWanted] = useState<Tab>('story');
  const [lanes, setLanes] = useState<ReadonlySet<string> | undefined>(undefined);
  const [sheetLane, setSheetLane] = useState(score.lanes[0]!.id);
  const [open, setOpen] = useState<string | null>(null);
  const [clip, setClip] = useState<Clip | null>(null);
  const [holding, setHolding] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const seekAudio = useRef<((t: number) => void) | null>(null);
  const playClip = useRef<((c: Clip) => void) | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const opener = useRef<Element | null>(null);
  const tab = pickTab(tabs, wanted);
  const bounds = useMemo(() => boundsFor(score.duration, width), [score.duration, width]);

  // The views are as wide as the stage: measured on mount and whenever the stage changes width (a window resize, a scrollbar appearing, the sheet opening). A browser without ResizeObserver falls back to the window's resize.
  useLayoutEffect(() => {
    const el = stage.current;
    const measure = (): void => setWidth(Math.floor(el?.getBoundingClientRect().width || FALLBACK_WIDTH));
    measure();
    if (el && typeof ResizeObserver !== 'undefined') {
      const watch = new ResizeObserver(measure);
      watch.observe(el);
      return () => watch.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  // A new piece or width: the whole piece fits at first; a zoomed view stays where it is.
  const fitted = useRef<{ score: Score; width: number } | null>(null);
  useLayoutEffect(() => {
    const was = fitted.current;
    fitted.current = { score, width };
    setView(v => (!was || was.score !== score ? fitView(score.duration, width) : clampView({ ...v, width }, boundsFor(score.duration, width))));
  }, [score, width]);
  // While playing, the playhead stays on screen, a page at a time, except while a finger or the mouse is on a view (a pan is not undone every frame). A paused view stays where the owner put it.
  useEffect(() => { if (playing && !holding) setView(v => follow(v, time, bounds)); }, [time, bounds, holding, playing]);

  // The audio moves first, in this call, so the next frame reports the new time. A jump the owner asked for (a change, a clip) brings its time on screen even while paused.
  const seek = (t: number): void => { seekAudio.current?.(t); setClip(null); setTime(t); setView(v => follow(v, t, bounds)); };
  // Hear it plays inside the tap itself: iOS refuses sound started later.
  const hear = (c: Clip): void => { playClip.current?.(c); setClip(c); setTime(c.from); setView(v => follow(v, c.from, bounds)); };
  const openTerm = open === null ? undefined : term(open);
  const openClip = openTerm ? uses.find(u => u.term.id === openTerm.id) : undefined;
  const seen = [...new Map(uses.map(u => [u.term.id, u.term])).values()];
  useEffect(() => { document.title = `${score.piece.title} – ${score.project.name}`; }, [score]);
  // Focus moves into an opened card so a keyboard user lands on it; closing returns focus to the word that opened it.
  useEffect(() => { if (openTerm) { cardRef.current?.scrollIntoView({ block: 'nearest' }); cardRef.current?.focus({ preventScroll: true }); } }, [openTerm?.id]);
  const openCard = (id: string): void => { if (open === null) opener.current = document.activeElement; setOpen(id); setSheetOpen(true); };
  const closeCard = (): void => { setOpen(null); const o = opener.current as HTMLElement | null; opener.current = null; o?.focus(); };
  const toggleLane = (id: string): void => {
    const all = lanes ?? new Set(score.lanes.map(l => l.id));
    const next = new Set(all);
    if (next.has(id)) next.delete(id); else next.add(id);
    setLanes(next.size === score.lanes.length ? undefined : next);
  };

  const pins = score.changes.map((c, i) => {
    const t = changeTimes(c, tempo, score.duration);
    return (
      <g class="pin cursor-pointer" data-change={i} onPointerDown={e => e.stopPropagation()} onClick={() => seek(t.from)}>
        <rect class="fill-amber" x={timeToX(view, t.from)} y={0} width={Math.max(4, (t.to - t.from) * view.pxPerSec)} height={8} />
        <text class="pointer-events-none fill-on-accent font-mono text-[8px]" x={timeToX(view, t.from) + 2} y={7}>{i + 1}</text>
      </g>
    );
  });

  return (
    <div class="workroom grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div class="grid min-w-0 gap-3">
        <header class="piece-head flex flex-wrap items-end justify-between gap-3">
          <div class="min-w-0">
            <h1 class="font-display text-3xl font-semibold tracking-wide break-words uppercase">{score.piece.title}</h1>
            <p class="project-name font-mono text-xs tracking-widest uppercase text-dim">{score.project.name}</p>
          </div>
          <label class="draft-picker flex items-center gap-2 font-mono text-xs uppercase text-dim">Draft
            <select class="min-h-11 rounded-md border border-rule bg-panel px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-amber" value={String(p.version)} onChange={e => p.onVersion(Number(e.currentTarget.value))}>
              {p.versions.map(v => <option value={String(v)}>{v === p.versions[0] ? `${v} (latest)` : String(v)}</option>)}
            </select>
          </label>
        </header>
        <Player src={score.audio} audioSrc={p.audioSrc} time={time} bar={tempo.barAt(time)} onTime={setTime} clip={clip} onClipDone={() => setClip(null)} seekRef={seekAudio} clipRef={playClip} onPlaying={setPlaying} />
        <ViewTabs tabs={tabs} tab={tab} onTab={setWanted} />
        <div role="tabpanel" id={panelId('view')} aria-labelledby={tabId('view', tab)} class="grid gap-2">
          {tab === 'roll' ? (
            <div class="lane-picker flex flex-wrap gap-2" role="group" aria-label="Lanes shown" data-guide="lane-picker">
              {score.lanes.map(l => <Chip pressed={!lanes || lanes.has(l.id)} onClick={() => toggleLane(l.id)}>{l.name}</Chip>)}
            </div>
          ) : null}
          <div ref={stage} data-guide="view" class="overflow-hidden rounded-lg bg-well ring-1 ring-rule">
            {tab === 'story' ? <Timeline score={score} tempo={tempo} view={view} time={time} onSeek={seek} onView={setView} onHold={setHolding} onTerm={openCard} overlay={pins} /> : null}
            {tab === 'roll' ? <PianoRoll score={score} tempo={tempo} view={view} time={time} lanes={lanes} onSeek={seek} onView={setView} onHold={setHolding} /> : null}
            {tab === 'sound' ? <SoundPicture score={score} view={view} time={time} imageSrc={p.audioSrc(score.spectrogram.file)} onSeek={seek} onView={setView} onHold={setHolding} /> : null}
            {tab === 'sheet' ? <SheetMusic musicxmlSrc={p.audioSrc('score.musicxml')} laneId={sheetLane} lanes={score.lanes} onLane={setSheetLane} /> : null}
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2"><Legend items={LEGENDS[tab]} /></div>
        </div>
      </div>
      <Sheet title="Notes" count={score.changes.length} open={sheetOpen} onToggle={setSheetOpen}>
        {openTerm ? <Card cardRef={cardRef} term={openTerm} clip={openClip ? { from: openClip.from, to: openClip.to } : null} onHear={hear} onClose={closeCard} /> : null}
        {seen.length > 0 ? (
          <div class="words grid gap-2" aria-label="Words in this piece">
            <span class={SMALL_CAPS}>Words in this piece</span>
            <div class="flex flex-wrap gap-2">{seen.map(t => <Word term={t} text={t.word} onOpen={openCard} />)}</div>
          </div>
        ) : null}
        {score.changes.length > 0 ? (
          <div class="grid gap-2">
            <span class={SMALL_CAPS}>Claude's changes</span>
            <ol class="changes grid list-decimal gap-2 pl-5 text-sm marker:font-mono marker:text-dim" aria-label="Claude's changes">
              {score.changes.map((c, i) => (
                <li data-change={i}>
                  <button type="button" data-where="" class="where mr-1 inline-flex min-h-11 min-w-11 items-center font-mono text-amber underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-amber" onClick={() => seek(changeTimes(c, tempo, score.duration).from)}>{changeLabel(c)}</button>{' '}
                  {splitTerms(c.text).map(part => 'term' in part ? <Word term={part.term} text={part.text} onOpen={openCard} /> : part.text)}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        {p.children}
      </Sheet>
    </div>
  );
}
```

`src/tsconfig.dom.json`: replace `"ui/Sheet.tsx"` with `"ui/SheetMusic.tsx"`.

- [ ] **Step 8: Run the tests and build**

Run: `cd websites/www.cs/games && node _kit/build/build.mjs workroom && sh units.sh && npm run --silent check`
Expected: all PASS, including the existing focus, scroll, follow and Hear it tests.

- [ ] **Step 9: Commit**

```bash
git add -A websites/www.cs/games/workroom
git commit -m "Music workroom: the piece page in the console look, notes in a sheet, a legend per view

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

---

### Task 7: Constellations, lane notes and the energy glow

**Files:**
- Modify: `websites/www.cs/games/workroom/src/timeline.ts`
- Create: `websites/www.cs/games/workroom/src/constellation.ts`
- Modify: `websites/www.cs/games/workroom/src/ui/Timeline.tsx`, `tsconfig.json`
- Test: `websites/www.cs/games/workroom/test/timeline.test.ts`, `test/constellation.test.ts` (create), `test/views.test.ts`

**Interfaces:**
- Consumes: `layoutTimeline`, `TIMELINE`, `Rect`, `timeToX`, `motifColor`; `useTheme`, `readableOn`.
- Produces:
  - `timeline.ts`: `TIMELINE` gains `notePad: 6`, `noteH: 3`; `export function pitchY(pitch, lo, hi, top, h): number`; `TimelineLayout` gains `notes: { index: number; lane: string; color: string; rect: Rect }[]` (every note, in its lane, scaled to that lane's pitch range) and `glow: [number, number][]` (a closed polygon over the full drawing height).
  - `constellation.ts`: `STAR_R = [2.5, 3.5, 5] as const`; `type StarSize = 0 | 1 | 2`; `starSize(velocity): StarSize`; `interface Star { note: number; x: number; y: number; size: StarSize }`; `interface Constellation { motif: string; character: string; name: string; color: string; lane: string; from: number; to: number; stars: Star[]; ribbon: Rect | null }`; `layoutConstellations(score, layout, view): Constellation[]`.

- [ ] **Step 1: Write the failing tests**

Append to `test/timeline.test.ts`:

```ts
test('lane notes sit in their lane, scaled to that lane’s pitch range', () => {
  const l = layoutTimeline(score, tempo, fitView(16, 800));
  const n = l.notes;
  assert.deepEqual(n.map(x => [x.index, x.lane, x.color]), [
    [0, 'strings-low', '#7a9cc6'], [1, 'strings-low', '#7a9cc6'], [2, 'strings-low', '#7a9cc6'],
    [3, 'brass', '#c98b3a'], [4, 'brass', '#c98b3a'], [5, 'brass', '#c98b3a'],
  ]);
  // strings-low: lane y 76, band 82..106 for pitches 36..41; brass: lane y 112, band 118..142 for 62..69.
  close(n[0]!.rect.y, 82 + (1 - 2 / 5) * 24 - 1.5); close(n[1]!.rect.y, 82 - 1.5); close(n[2]!.rect.y, 106 - 1.5);
  close(n[3]!.rect.y, 142 - 1.5); close(n[5]!.rect.y, 118 - 1.5);
  assert.deepEqual(n.map(x => [x.rect.x, x.rect.w, x.rect.h]), [[0, 100, 3], [100, 100, 3], [200, 200, 3], [400, 100, 3], [500, 100, 3], [600, 200, 3]]);
});

test('the energy glow spans the whole drawing height', () => {
  const l = layoutTimeline(score, tempo, fitView(16, 800));
  const want: [number, number][] = [[0, 118.4], [400, 74], [800, 14.8], [800, 148], [0, 148]];
  assert.equal(l.glow.length, want.length);
  l.glow.forEach(([x, y], i) => { close(x, want[i]![0]); close(y, want[i]![1]); });
});

test('pitchY: higher pitch higher, the middle when the range is one note', () => {
  assert.equal(pitchY(60, 60, 72, 10, 24), 34);
  assert.equal(pitchY(72, 60, 72, 10, 24), 10);
  assert.equal(pitchY(64, 64, 64, 10, 24), 22);
});

test('a sound effect without notes has no lane notes', () => {
  assert.deepEqual(layoutTimeline(sound, tempoMap(sound), fitView(sound.duration, 800)).notes, []);
});
```

(add `pitchY` to that file's import from `../src/timeline.ts`).

Create `test/constellation.test.ts`:

```ts
// Constellations: each motif span's notes as stars over its lane, placed by
// time and pitch, sized by velocity, joined in time order; a span with no
// notes in its lane keeps its ribbon.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { layoutConstellations, starSize } from '../src/constellation.ts';
import { layoutTimeline, TIMELINE } from '../src/timeline.ts';
import { tempoMap } from '../src/tempo.ts';
import { fitView } from '../src/zoom.ts';
import type { Score } from '../src/score.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;
const crete = read('score-v1.json');
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`);
const at = (s: Score) => {
  const view = fitView(s.duration, 800);
  return layoutConstellations(s, layoutTimeline(s, tempoMap(s), view), view);
};

test("Ariadne's motif in Crete: three stars over the brass lane, rising, the last one loudest", () => {
  const [c, ...rest] = at(crete);
  assert.equal(rest.length, 0);
  assert.deepEqual([c!.motif, c!.character, c!.name, c!.color, c!.lane, c!.ribbon], ['ariadne', 'ariadne', 'Ariadne', '#d4a017', 'brass', null]);
  assert.deepEqual(c!.stars.map(s => [s.note, s.x, s.size]), [[3, 400, 1], [4, 500, 1], [5, 600, 2]]);
  // brass lane y 112; band 118..142; motif range 62..69.
  close(c!.stars[0]!.y, 142);
  close(c!.stars[1]!.y, 118 + (1 - 3 / 7) * 24);
  close(c!.stars[2]!.y, 118);
});

test('a span with no notes in its lane keeps its ribbon', () => {
  const s: Score = { ...crete, motifs: [{ id: 'ariadne', character: 'ariadne', spans: [{ lane: 'strings-low', from: 8, to: 16 }] }] };
  const [c] = at(s);
  assert.deepEqual(c!.stars, []);
  assert.deepEqual(c!.ribbon, { x: 400, y: 76 + TIMELINE.laneH - TIMELINE.ribbonH, w: 400, h: TIMELINE.ribbonH });
});

test("a single note sits in the middle of its lane's band", () => {
  const s: Score = { ...crete, motifs: [{ id: 'ariadne', character: 'ariadne', spans: [{ lane: 'brass', from: 12, to: 16 }] }] };
  const [c] = at(s);
  assert.deepEqual(c!.stars.map(x => x.note), [5]);
  close(c!.stars[0]!.y, 118 + 12);
});

test("another lane's notes inside the span's time are not stars", () => {
  const s: Score = { ...crete, motifs: [{ id: 'ariadne', character: 'ariadne', spans: [{ lane: 'brass', from: 0, to: 16 }] }] };
  assert.deepEqual(at(s)[0]!.stars.map(x => x.note), [3, 4, 5]);
});

test('star sizes by velocity: under 64 small, under 96 middle, else big', () => {
  assert.deepEqual([0, 63, 64, 95, 96, 127].map(starSize), [0, 0, 1, 1, 2, 2]);
});

test('a sound effect with no characters has no constellations', () => {
  assert.deepEqual(at(read('score-sound-v1.json')), []);
});
```

Append to `test/views.test.ts`:

```ts
test('the story draws stars joined by a line, the character named, lane notes dimmed, and a glow', () => {
  const root = makeEl('root');
  render(h(ui.tl.Timeline, { score, tempo: tempoMap(score), view: fitView(16, 800), time: 0, onSeek: () => {}, onView: () => {}, onTerm: () => {} }), renderTarget(root));
  assert.equal(withAttr(root, 'data-star').length, 3);
  assert.equal(withAttr(root, 'data-constellation-line').length, 1);
  assert.equal(withAttr(root, 'data-character-name')[0]!.textContent, 'Ariadne');
  assert.equal(withAttr(root, 'data-lane-note').length, 6);
  assert.equal(withAttr(root, 'data-glow').length, 1);
  assert.equal(withAttr(root, 'data-ribbon').length, 0, 'a span with stars draws no ribbon');
});

test('the glow is painted first, behind the sections, the lanes, the lane notes and the stars', () => {
  const root = makeEl('root');
  render(h(ui.tl.Timeline, { score, tempo: tempoMap(score), view: fitView(16, 800), time: 0, onSeek: () => {}, onView: () => {}, onTerm: () => {} }), renderTarget(root));
  const all = walk(root);
  const glow = all.findIndex(e => e._attrs['data-glow'] !== undefined);
  assert.ok(glow >= 0, 'there is a glow');
  for (const attr of ['data-section', 'data-lane', 'data-lane-note', 'data-star']) {
    const first = all.findIndex(e => e._attrs[attr] !== undefined);
    assert.ok(first > glow, `${attr} is drawn after (on top of) the glow`);
  }
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd websites/www.cs/games && node --test workroom/test/timeline.test.ts workroom/test/constellation.test.ts workroom/test/views.test.ts`
Expected: FAIL (`pitchY` / `layoutConstellations` missing; no `data-star`).

- [ ] **Step 3: Implement the layout**

In `src/timeline.ts`:

```ts
export const TIMELINE = { energyH: 48, sectionH: 28, laneH: 36, ribbonH: 6, notePad: 6, noteH: 3 } as const;

/** The y of a pitch inside a band from top to top + h, scaled to lo..hi (a higher pitch is higher); the band's middle when lo === hi. */
export function pitchY(pitch: number, lo: number, hi: number, top: number, h: number): number {
  return hi === lo ? top + h / 2 : top + (1 - (pitch - lo) / (hi - lo)) * h;
}
```

`TimelineLayout` gains:

```ts
  notes: { index: number; lane: string; color: string; rect: Rect }[];   // every note in its lane, scaled to that lane's pitch range; color = the lane's colour
  glow: [number, number][];                                             // the energy as a closed polygon over the full drawing height
```

In `layoutTimeline`, before the `return`:

```ts
  const { notePad, noteH } = TIMELINE;
  const height = lanesTop + lanes.length * laneH;
  const notes = lanes.flatMap(lane => {
    const mine = score.notes.map((n, index) => ({ n, index })).filter(x => x.n.lane === lane.id);
    if (mine.length === 0) return [];
    const lo = Math.min(...mine.map(x => x.n.pitch));
    const hi = Math.max(...mine.map(x => x.n.pitch));
    return mine.map(({ n, index }) => ({
      index, lane: lane.id, color: lane.color,
      rect: { ...span(n.start, n.start + n.length), y: pitchY(n.pitch, lo, hi, lane.rect.y + notePad, laneH - 2 * notePad) - noteH / 2, h: noteH },
    }));
  });
  const curve = score.energy.map(([t, v]): [number, number] => [timeToX(view, t), height * (1 - v)]);
  const glow: [number, number][] = curve.length ? [...curve, [curve[curve.length - 1]![0], height], [curve[0]![0], height]] : [];
```

and use `height` for the returned `height`, adding `notes` (sorted by `index` — `lanes.flatMap` already yields lane order, which for the fixture equals index order; sort with `.sort((a, b) => a.index - b.index)` to make it independent of lane order) and `glow`.

Create `src/constellation.ts`:

```ts
// Each character's tune drawn as stars over its lane: one star per note of a
// motif span (the notes of that lane between the span's from and to), left
// to right in time, higher for a higher pitch (scaled to the span's own
// range, so a small tune still has shape), bigger for a louder note, joined
// in time order. A span with no notes in its lane keeps its ribbon. DOM-free.
import { motifColor } from './score.ts';
import type { Score } from './score.ts';
import { pitchY, TIMELINE } from './timeline.ts';
import type { Rect, TimelineLayout } from './timeline.ts';
import { timeToX } from './zoom.ts';
import type { View } from './zoom.ts';

/** Star radii in pixels: small, middle, big. */
export const STAR_R = [2.5, 3.5, 5] as const;
export type StarSize = 0 | 1 | 2;

/** Velocity under 64 is a small star, under 96 a middle one, else a big one. */
export function starSize(velocity: number): StarSize {
  return velocity < 64 ? 0 : velocity < 96 ? 1 : 2;
}

export interface Star { note: number; x: number; y: number; size: StarSize }   // note: index into score.notes
export interface Constellation { motif: string; character: string; name: string; color: string; lane: string; from: number; to: number; stars: Star[]; ribbon: Rect | null }

export function layoutConstellations(score: Score, layout: TimelineLayout, view: View): Constellation[] {
  const { laneH, notePad, ribbonH } = TIMELINE;
  return score.motifs.flatMap(m => {
    const color = motifColor(score, m);
    const name = score.characters.find(c => c.id === m.character)?.name ?? m.character;
    return m.spans.flatMap((s): Constellation[] => {
      const lane = layout.lanes.find(l => l.id === s.lane);
      if (!lane) return [];
      const base = { motif: m.id, character: m.character, name, color, lane: s.lane, from: s.from, to: s.to };
      const notes = score.notes.map((n, i) => ({ n, i }))
        .filter(({ n }) => n.lane === s.lane && n.start >= s.from && n.start < s.to)
        .sort((a, b) => a.n.start - b.n.start || a.i - b.i);
      if (notes.length === 0) {
        return [{ ...base, stars: [], ribbon: { x: timeToX(view, s.from), y: lane.rect.y + laneH - ribbonH, w: (s.to - s.from) * view.pxPerSec, h: ribbonH } }];
      }
      const lo = Math.min(...notes.map(x => x.n.pitch));
      const hi = Math.max(...notes.map(x => x.n.pitch));
      const stars = notes.map(({ n, i }): Star => ({ note: i, x: timeToX(view, n.start), y: pitchY(n.pitch, lo, hi, lane.rect.y + notePad, laneH - 2 * notePad), size: starSize(n.velocity) }));
      return [{ ...base, stars, ribbon: null }];
    });
  });
}
```

Add `"src/constellation.ts"` to `tsconfig.json` `files`.

- [ ] **Step 4: Draw it** — replace the `Timeline` function in `src/ui/Timeline.tsx` (keep `SectionName`, but give its glossary `tspan` the classes `word pointer-events-auto cursor-pointer fill-amber underline`):

```tsx
export function Timeline(p: TimelineProps) {
  const { score, tempo, view } = p;
  const theme = useTheme();
  const layout = layoutTimeline(score, tempo, view);
  const stars = layoutConstellations(score, layout, view);
  const surface = useSurface({ view, bounds: boundsFor(score.duration, view.width), duration: score.duration, onSeek: p.onSeek, onView: p.onView, onHold: p.onHold });
  const height = layout.height + AXIS_H;
  return (
    <svg class="tl block max-w-full touch-none select-none" data-timeline="" width={view.width} height={height} viewBox={`0 0 ${view.width} ${height}`} role="group" aria-label="Story timeline" {...surface}>
      <defs><filter id="tl-glow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="8" /></filter></defs>
      <polygon class="pointer-events-none fill-go opacity-25" data-glow="" filter="url(#tl-glow)" points={layout.glow.map(([x, y]) => `${x},${y}`).join(' ')} />
      {layout.sections.map(s => (
        <svg x={s.rect.x} y={s.rect.y} width={Math.max(0, s.rect.w)} height={s.rect.h}>
          <rect class="section opacity-40" data-section={s.id} width={Math.max(0, s.rect.w)} height={s.rect.h} fill={s.color} />
          <text class="section-name pointer-events-none fill-ink font-display text-[12px] font-semibold tracking-wider uppercase" x={6} y={TIMELINE.sectionH - 10}><SectionName name={s.name} onTerm={p.onTerm} /></text>
        </svg>
      ))}
      {layout.lanes.map(l => (
        <g>
          <rect class="lane fill-lane/80 stroke-rule" data-lane={l.id} x={l.rect.x} y={l.rect.y} width={l.rect.w} height={l.rect.h} />
          <LaneIcon family={l.icon} color={readableOn(theme, l.color, 'mark')} x={6} y={l.rect.y + 4} />
          <text class="lane-name pointer-events-none font-display text-[11px] font-semibold tracking-wider uppercase" x={8 + LANE_ICON_SIZE + 4} y={l.rect.y + 15} fill={readableOn(theme, l.color, 'text')}>{l.name}</text>
        </g>
      ))}
      {layout.notes.map(n => <rect class="pointer-events-none opacity-35" data-lane-note={n.index} x={n.rect.x} y={n.rect.y} width={Math.max(1, n.rect.w)} height={n.rect.h} rx={1} fill={readableOn(theme, n.color, 'mark')} />)}
      {stars.map(c => {
        const mark = readableOn(theme, c.color, 'mark');
        const first = c.stars[0];
        return (
          <g class="pointer-events-none" data-motif={c.motif} data-character={c.character}>
            {c.ribbon ? <rect data-ribbon="" x={c.ribbon.x} y={c.ribbon.y} width={Math.max(0, c.ribbon.w)} height={c.ribbon.h} fill={mark} /> : null}
            {c.stars.length > 1 ? <polyline data-constellation-line="" fill="none" stroke={mark} stroke-width={1.5} stroke-opacity={0.85} stroke-linejoin="round" points={c.stars.map(s => `${s.x},${s.y}`).join(' ')} /> : null}
            {c.stars.map(s => <circle data-star={s.note} cx={s.x} cy={s.y} r={STAR_R[s.size]} fill={mark} />)}
            {first ? <text data-character-name="" class="font-display text-[11px] font-semibold tracking-wider uppercase" x={first.x + 7} y={Math.max(first.y - 6, layout.lanes[0]?.rect.y ?? 0) + 2} fill={readableOn(theme, c.color, 'text')}>{c.name}</text> : null}
          </g>
        );
      })}
      {p.overlay}
      <Axis ticks={axisTicks(score, tempo, view)} height={layout.height} />
      <Playhead view={view} time={p.time} height={layout.height} />
    </svg>
  );
}
```

(imports: `layoutConstellations`, `STAR_R` from `../constellation.ts`; `readableOn` from `../color.ts`; `useTheme` from `./theme-context.ts`. The first test in `views.test.ts`, "the timeline draws sections, lanes and the motif ribbon", still finds exactly one `data-motif` element: the constellation group.)

- [ ] **Step 5: Run the tests and build**

Run: `cd websites/www.cs/games && node _kit/build/build.mjs workroom && sh units.sh && npm run --silent check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: each character's tune as a constellation, lane notes dimmed, the energy as a glow

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

---

### Task 8: The server shell: stylesheet, boot script, header, error page, deploy

**Files:**
- Modify: `websites/www.cs/music/lib/Pages.php`, `websites/www.cs/music/lib/bootstrap.php`, `websites/www.cs/deploy.sh`, `websites/www.cs/music/README.md`
- Delete: `websites/www.cs/music/music.css`
- Test: `websites/www.cs/tests/php/MusicPagesTest.php`, `MusicBootstrapTest.php`, `MusicDeployTest.php`

**Interfaces:**
- Consumes: `dist/workroom.css`, `dist/theme.js`, `dist/fonts/*` (Tasks 3–4); `#theme-switch` mount (Task 4's `main.ts`).
- Produces: every page shell and the error page carry, in `<head>`, `<meta name="color-scheme" content="dark light">` then `<script src="../games/workroom/dist/theme.js?v=V"></script><link rel="stylesheet" href="../games/workroom/dist/workroom.css?v=V">`; a `<header class="console-head">` holding the crumb (piece, error) or the `<h1>` (index) and `<div id="theme-switch"></div>`; the index body in `<div class="index-body">`. `music_asset_version()` hashes `workroom.js`, `sheet.js`, `theme.js`, `workroom.css`.

- [ ] **Step 1: Write the failing tests**

In `tests/php/MusicPagesTest.php` add a helper and tests:

```php
    private const HEAD_ASSETS = '<script src="../games/workroom/dist/theme.js?v=0123456789"></script>'
        . '<link rel="stylesheet" href="../games/workroom/dist/workroom.css?v=0123456789">';

    private static function assertConsoleShell(string $html): void
    {
        $head = substr($html, 0, (int) strpos($html, '</head>'));
        self::assertStringContainsString('<meta name="color-scheme" content="dark light">', $head);
        self::assertStringContainsString(self::HEAD_ASSETS, $head, 'the theme boot runs before the stylesheet, as a plain script in the head');
        self::assertStringNotContainsString('music.css', $html);
        self::assertStringNotContainsString('style="', $html, 'no inline style attribute (the CSP blocks them)');
        self::assertMatchesRegularExpression('~<header class="console-head">.*<div id="theme-switch"></div></header>~s', $html);
    }

    public function testEveryShellLinksTheConsoleStylesheetAndTheThemeBoot(): void
    {
        $piece = $this->pages->piece(music_signed_in($this->sessions, ['query' => ['id' => 'ch1-labyrinth']]));
        self::assertConsoleShell($piece->body);
        self::assertStringContainsString('<header class="console-head"><p class="crumb"><a href="./">All pieces</a></p><div id="theme-switch"></div></header>', $piece->body);
        $index = $this->pages->index(music_signed_in($this->sessions));
        self::assertConsoleShell($index->body);
        self::assertStringContainsString('<header class="console-head"><h1>Music workroom</h1><div id="theme-switch"></div></header>', $index->body);
        self::assertStringContainsString('<div class="index-body"><p class="waiting-total">', $index->body);
    }

    public function testTheErrorPageWearsTheConsoleToo(): void
    {
        $res = $this->pages->piece(music_signed_in($this->sessions, ['query' => ['id' => '<script>']]));
        self::assertSame(400, $res->status);
        $head = substr($res->body, 0, (int) strpos($res->body, '</head>'));
        self::assertStringContainsString(self::HEAD_ASSETS, $head);
        self::assertStringContainsString('<p class="error" role="alert">No such piece.</p>', $res->body);
        self::assertStringContainsString('<a href="./">All pieces</a>', $res->body);
    }
```

The existing `testTheNoSuchPiecePageMountsNothing` asserts the error page holds neither "workroom" nor `<script`, which the styled error page now contradicts (it links `workroom.css` and `theme.js`). Replace it: the error page may carry the stylesheet and the theme boot, and still mounts nothing.

```php
    public function testTheNoSuchPiecePageMountsNothing(): void
    {
        $res = $this->pages->piece(music_signed_in($this->sessions, ['query' => ['id' => '<script>']]));
        self::assertSame(400, $res->status);
        self::assertStringContainsString('No such piece.', $res->body);
        preg_match_all('~<script\b[^>]*>~', $res->body, $scripts);
        self::assertSame(['<script src="../games/workroom/dist/theme.js?v=0123456789">'], $scripts[0], 'the only script is the theme boot');
        foreach (['workroom.js', 'sheet.js', 'type="module"', 'data-view', 'data-piece', '<main id="workroom">'] as $mount) {
            self::assertStringNotContainsString($mount, $res->body, "the error page does not mount the workroom: $mount");
        }
    }
```

(The existing assertion `<p class="crumb"><a href="./">All pieces</a></p>` in `testPieceShellLoadsTheBundleAndCarriesAToken` keeps passing.)

In `tests/php/MusicBootstrapTest.php` replace `testTheAssetVersionStampsBothScripts` with:

```php
    public function testTheAssetVersionStampsEveryBuiltAsset(): void
    {
        $files = ['workroom.js', 'sheet.js', 'theme.js', 'workroom.css'];
        $dir = sys_get_temp_dir() . '/music-assets-' . bin2hex(random_bytes(4));
        mkdir($dir);
        try {
            foreach ($files as $f) {
                self::assertSame('', music_asset_version($dir), "no version while $f is missing");
                file_put_contents("$dir/$f", $f);
            }
            $all = music_asset_version($dir);
            self::assertMatchesRegularExpression('/^[0-9a-f]{10}$/', $all);
            foreach ($files as $f) {
                file_put_contents("$dir/$f", "$f, changed");
                self::assertNotSame($all, music_asset_version($dir), "a change to $f alone changes the version");
                file_put_contents("$dir/$f", $f);
            }
            self::assertSame($all, music_asset_version($dir));
            self::assertMatchesRegularExpression('/^[0-9a-f]{10}$/', music_asset_version(), 'the shipped files');
        } finally {
            array_map('unlink', glob("$dir/*") ?: []);
            rmdir($dir);
        }
    }
```

In `tests/php/MusicDeployTest.php`: remove `'music/music.css'` from `testShipsThePagesApiAndLibrary`'s list, and replace `testShipsTheBuiltWorkroomAndNeverItsSources` with:

```php
    public function testShipsTheBuiltWorkroomAndNeverItsSources(): void
    {
        $list = self::shipped();
        $built = ['workroom.js', 'sheet.js', 'theme.js', 'workroom.css', 'THIRD_PARTY_LICENSES.txt',
            'fonts/barlow-latin-400-normal.woff2', 'fonts/barlow-latin-500-normal.woff2', 'fonts/barlow-latin-600-normal.woff2',
            'fonts/barlow-condensed-latin-600-normal.woff2', 'fonts/ibm-plex-mono-latin-400-normal.woff2', 'fonts/ibm-plex-mono-latin-500-normal.woff2'];
        foreach ($built as $f) {
            self::assertContains("games/workroom/dist/$f", $list, $f);
        }
        foreach ($list as $f) {
            self::assertDoesNotMatchRegularExpression('~^games/workroom/(src|test|tools|fonts)/~', $f, $f);
        }
        self::assertNotContains('music/music.css', $list, 'the workroom stylesheet ships from games/workroom/dist/');
    }
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite site --filter 'Music(Pages|Bootstrap|Deploy)Test'`
Expected: FAIL (no `theme.js` in the head, version ignores `theme.js`, `games/workroom/fonts/` ships, `dist/fonts` maybe not listed).

- [ ] **Step 3: Implement**

`music/lib/bootstrap.php`:

```php
/**
 * First 10 hex of one SHA-256 over the workroom's built assets in games/workroom/dist: the page script, the
 * sheet-music script it loads with the same ?v=, the theme boot script and the stylesheet. A change to any busts
 * them all; '' while any is missing.
 */
function music_asset_version(?string $dist = null): string
{
    $dist ??= __DIR__ . '/../../games/workroom/dist';
    $hash = hash_init('sha256');
    foreach (['workroom.js', 'sheet.js', 'theme.js', 'workroom.css'] as $file) {
        $bytes = @file_get_contents("$dist/$file");
        if ($bytes === false) {
            return '';
        }
        hash_update($hash, hash('sha256', $bytes, true));
    }
    return substr(hash_final($hash), 0, 10);
}
```

`music/lib/Pages.php`: update the constructor doc to "`$assetVersion`: 10 hex over games/workroom/dist's workroom.js, sheet.js, theme.js and workroom.css (the ?v= on each; the script passes it on to sheet.js)". Add:

```php
    /** The head's assets: the theme boot first (a plain script, so data-theme is set before the first paint), then the stylesheet. */
    private function assets(): string
    {
        $v = Html::e($this->assetVersion);
        return '<script src="../games/workroom/dist/theme.js?v=' . $v . '"></script>'
            . '<link rel="stylesheet" href="../games/workroom/dist/workroom.css?v=' . $v . '">';
    }
```

Replace `errorPage` with:

```php
    private function errorPage(int $status, string $message): \Admin\Response
    {
        $html = '<!doctype html>' . "\n"
            . '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<meta name="robots" content="noindex, nofollow"><meta name="color-scheme" content="dark light">'
            . '<title>' . Html::e($message) . '</title>' . $this->assets() . '</head>'
            . '<body><header class="console-head"><p class="crumb"><a href="./">All pieces</a></p></header>'
            . '<main class="index-body"><p class="error" role="alert">' . Html::e($message) . '</p></main></body></html>';
        return Http::finish(new \Admin\Response($status, ['Content-Type' => 'text/html; charset=utf-8'], $html));
    }
```

Replace `shell` with:

```php
    private function shell(int $status, string $title, string $view, string $piece, string $version, string $body, \Admin\Request $r): \Admin\Response
    {
        $v = Html::e($this->assetVersion);
        $heading = $view === 'piece' ? '<p class="crumb"><a href="./">All pieces</a></p>' : '<h1>' . Html::e($title) . '</h1>';
        $html = '<!doctype html>' . "\n"
            . '<html lang="en"><head><meta charset="utf-8">'
            . '<meta name="viewport" content="width=device-width, initial-scale=1">'
            . '<meta name="robots" content="noindex, nofollow">'
            . '<meta name="color-scheme" content="dark light">'
            . '<meta name="csrf" content="' . Html::e($this->sessions->csrf($r)) . '">'
            . '<title>' . Html::e($title) . '</title>'
            . $this->assets()
            . '</head><body data-view="' . Html::e($view) . '" data-piece="' . Html::e($piece) . '" data-version="' . Html::e($version) . '">'
            . '<header class="console-head">' . $heading . '<div id="theme-switch"></div></header>'
            . ($body === '' ? '' : '<div class="index-body">' . $body . '</div>')
            . '<main id="workroom"></main>'
            . '<script type="module" src="../games/workroom/dist/workroom.js?v=' . $v . '"></script>'
            . '</body></html>';
        return Http::finish(new \Admin\Response($status, ['Content-Type' => 'text/html; charset=utf-8'], $html));
    }
```

`deploy.sh`: in the development-files arm (the long `games/*-test.* | …` line) append ` | games/workroom/fonts/*`, and add to the comment above it: "the workroom's font sources (games/workroom/fonts/: the build copies them into dist/fonts/, which ships; named exactly, because a pattern's * crosses slashes and games/*/fonts/* would also match dist/fonts/)". In the music arm change `music/*.php | music/.htaccess | music/music.css) ;;` to `music/*.php | music/.htaccess) ;;` and the comment above it from "its pages, API, library, styles and the public key" to "its pages, API, library and the public key (its stylesheet, scripts and fonts ship from games/workroom/dist/)".

`git rm websites/www.cs/music/music.css`.

`music/README.md`: the `deploy.sh` sentence becomes "`deploy.sh` ships the pages, `api/`, `lib/` and `keys/public.json` only; the page's script, stylesheet, theme boot and fonts ship from `games/workroom/dist/`." Add a section after "Routes":

```markdown
## The look

The workroom has its own Studio Console look, dark or light ("daylight"),
compiled with Tailwind at build time from `games/workroom/src/app.css` into
`games/workroom/dist/workroom.css`, with self-hosted OFL fonts in
`dist/fonts/`. The header's switch (System, Dark, Light) is remembered in this
browser (`workroom-theme` in localStorage); `dist/theme.js`, the first script
in the head, applies it before the first paint. Colours are tokens in
`app.css`; a score's own colours are nudged to stay readable on either theme.
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite site && LIST=1 ./deploy.sh | grep -E 'workroom/(dist/fonts|fonts)|music\.css'`
Expected: PHPUnit green; the listing shows six `games/workroom/dist/fonts/*.woff2` lines and nothing else.

- [ ] **Step 5: Commit**

```bash
git add -A websites/www.cs/music websites/www.cs/deploy.sh websites/www.cs/tests/php
git commit -m "Music workroom: pages link the console stylesheet and theme boot; music.css goes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

---

### Task 9: What the guide says, and its built-in sounds

**Files:**
- Create: `websites/www.cs/games/workroom/src/guide.ts`, `src/demo.ts`
- Modify: `websites/www.cs/games/workroom/tsconfig.json`
- Test: `websites/www.cs/games/workroom/test/guide.test.ts`, `test/demo.test.ts`

**Interfaces:**
- Consumes: `layoutTimeline`, `TIMELINE`, `Rect` (timeline.ts); `layoutConstellations` (Task 7); `layoutRoll`, `ROLL_H` (pianoroll.ts); `PICTURE_H` (spectro.ts); `AXIS_H` (axis.ts); `sectionTimes`, `TempoMap` (tempo.ts); `timeToX`, `View` (zoom.ts); `Tab` (tabs.ts); `pref`, `text` (`../../_kit/prefs.ts`); `StorageLike`.
- Produces:
  - `demo.ts`: `type DemoId = 'clicks' | 'updown' | 'swell'`; `interface DemoTone { at: number; freq: number; dur: number; vol: number; wave: 'sine' | 'triangle' | 'square' }`; `DEMOS: Readonly<Record<DemoId, readonly DemoTone[]>>`; `demoLength(id): number`.
  - `guide.ts`: `CLIP_MAX = 4`; `type GuideClip = { kind: 'piece'; from: number; to: number } | { kind: 'demo'; id: DemoId }`; `type GuideAnchor = 'view' | 'lane-picker' | 'sheet'`; `interface GuideSpot { anchor: GuideAnchor; rect: Rect | null }` (rect in the anchor element's own pixels); `interface GuidePart { id: string; title: string; what: string; like: string; spot: GuideSpot; clip: GuideClip }`; `interface GuideInput { tab: Tab; score: Score; tempo: TempoMap; view: View; time: number; lanes?: ReadonlySet<string> }`; `guideParts(input): GuidePart[]`; `pieceClip(from, to, duration): GuideClip`; `clipLength(clip): number`; `interface GuideStore { seen(tab: Tab): boolean; markSeen(tab: Tab): void }`; `GUIDE_KEY_PREFIX = 'workroom-guide-'`; `guideStore(storage): GuideStore`; `ALWAYS_SEEN: GuideStore`.

Parts by view (ids in order; a part is left out when the piece has nothing to show for it):

| View | Parts | Clip |
| --- | --- | --- |
| Story | `sections`, `lanes`, `notes` (if notes), `stars` (if a constellation has stars), `energy`, `playhead`, `ruler` | piece, piece, piece, piece, piece, piece, demo `clicks` |
| Piano roll | `note`, `pitch`, `length`, `colour`, `ruler` | piece, demo `updown`, piece, piece, demo `clicks` |
| Sound picture | `height`, `brightness`, `playhead`, `ruler` | demo `updown`, demo `swell`, piece, demo `clicks` |
| Sheet music | `pick`, `staff`, `higher`, `bars` | piece, piece, demo `updown`, demo `clicks` |

- [ ] **Step 1: Write the failing tests**

`test/demo.test.ts`:

```ts
// The guide's built-in sounds: counted clicks with a stronger first beat, a
// pair of notes up then down, one note from soft to loud; short and quiet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEMOS, demoLength } from '../src/demo.ts';

test('clicks: two bars of four, the first beat of each higher and louder', () => {
  const c = DEMOS.clicks;
  assert.equal(c.length, 8);
  for (const [i, t] of c.entries()) {
    const strong = i % 4 === 0;
    assert.equal(t.freq > 1200, strong, `click ${i}`);
    assert.equal(t.vol > 0.2, strong, `click ${i}`);
  }
});

test('updown: up a step, then down again', () => {
  const [a, b, c, d] = DEMOS.updown;
  assert.ok(b!.freq > a!.freq && d!.freq < c!.freq);
});

test('swell: the same note, louder each time', () => {
  const s = DEMOS.swell;
  assert.ok(s.every(t => t.freq === s[0]!.freq));
  for (let i = 1; i < s.length; i++) assert.ok(s[i]!.vol > s[i - 1]!.vol);
});

test('every demo is short, in time order and never loud', () => {
  for (const id of ['clicks', 'updown', 'swell'] as const) {
    assert.ok(demoLength(id) <= 4.5, id);
    assert.ok(DEMOS[id].every(t => t.vol <= 0.3), id);
    assert.ok(DEMOS[id].every((t, i, all) => i === 0 || t.at >= all[i - 1]!.at), id);
  }
});
```

`test/guide.test.ts`:

```ts
// The guide's parts for every view of both fixtures: their text, a spot on
// the drawing (clamped to it), a clip inside the piece at most 4 s long or a
// built-in demo; parts with nothing to show are left out; the seen flags.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ALWAYS_SEEN, CLIP_MAX, GUIDE_KEY_PREFIX, guideParts, guideStore, pieceClip } from '../src/guide.ts';
import type { GuideInput, GuidePart } from '../src/guide.ts';
import { AXIS_H } from '../src/axis.ts';
import { layoutTimeline } from '../src/timeline.ts';
import { ROLL_H } from '../src/pianoroll.ts';
import { PICTURE_H } from '../src/spectro.ts';
import { tabsFor } from '../src/tabs.ts';
import { tempoMap } from '../src/tempo.ts';
import { boundsFor, fitView, zoomAt } from '../src/zoom.ts';
import type { Score } from '../src/score.ts';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';

const read = (name: string): Score => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')) as Score;
const crete = read('score-v1.json');
const sound = read('score-sound-v1.json');
const input = (score: Score, tab: GuideInput['tab'], view = fitView(score.duration, 800)): GuideInput => ({ tab, score, tempo: tempoMap(score), view, time: 0 });
const ids = (parts: GuidePart[]) => parts.map(p => p.id);

const drawingHeight = (i: GuideInput): number =>
  i.tab === 'story' ? layoutTimeline(i.score, i.tempo, i.view).height + AXIS_H : i.tab === 'roll' ? ROLL_H + AXIS_H : PICTURE_H + AXIS_H;

const checkParts = (i: GuideInput): void => {
  const parts = guideParts(i);
  assert.ok(parts.length > 0, i.tab);
  for (const p of parts) {
    const at = `${i.score.piece.id} ${i.tab} ${p.id}`;
    assert.ok(p.title && p.what && p.like, `${at}: text`);
    assert.ok(['view', 'lane-picker', 'sheet'].includes(p.spot.anchor), at);
    if (p.spot.rect) {
      const r = p.spot.rect;
      assert.ok(r.w > 0 && r.h > 0, `${at}: a spot with size`);
      assert.ok(r.x >= 0 && r.y >= 0 && r.x + r.w <= i.view.width + 1e-9 && r.y + r.h <= drawingHeight(i) + 1e-9, `${at}: on the drawing ${JSON.stringify(r)}`);
    }
    if (p.clip.kind === 'piece') {
      assert.ok(p.clip.from >= 0 && p.clip.to <= i.score.duration && p.clip.to > p.clip.from, `${at}: inside the piece`);
      assert.ok(p.clip.to - p.clip.from <= CLIP_MAX + 1e-9, `${at}: short`);
    } else assert.ok(['clicks', 'updown', 'swell'].includes(p.clip.id), at);
  }
};

test('every part of every view of both fixtures has text, an on-screen spot and a playable clip', () => {
  for (const s of [crete, sound]) for (const tab of tabsFor(s)) checkParts(input(s, tab));
});

test('the parts, in order, for a music piece', () => {
  assert.deepEqual(ids(guideParts(input(crete, 'story'))), ['sections', 'lanes', 'notes', 'stars', 'energy', 'playhead', 'ruler']);
  assert.deepEqual(ids(guideParts(input(crete, 'roll'))), ['note', 'pitch', 'length', 'colour', 'ruler']);
  assert.deepEqual(ids(guideParts(input(crete, 'sound'))), ['height', 'brightness', 'playhead', 'ruler']);
  assert.deepEqual(ids(guideParts(input(crete, 'sheet'))), ['pick', 'staff', 'higher', 'bars']);
});

test('a sound effect: moments, layers and seconds; no notes, no stars', () => {
  const parts = guideParts(input(sound, 'story'));
  assert.deepEqual(ids(parts), ['sections', 'lanes', 'energy', 'playhead', 'ruler']);
  assert.deepEqual(parts.map(p => p.title).filter(t => /Moments|Layers|Seconds/.test(t)), ['Moments', 'Layers', 'Seconds']);
});

test('a music piece with no motifs has no stars part', () => {
  assert.ok(!ids(guideParts(input({ ...crete, motifs: [] }, 'story'))).includes('stars'));
});

test('a zoomed view keeps every spot on the drawing', () => {
  const view = zoomAt(fitView(16, 800), 700, 8, boundsFor(16, 800));
  checkParts(input(crete, 'story', view));
  checkParts(input(crete, 'roll', view));
});

test('the Story text is the reading guide’s, with no character built in', () => {
  const story = guideParts(input(crete, 'story'));
  assert.equal(story[0]!.what, 'The coloured blocks across the top split the piece into chapters, the way a film has scenes. Each one has a plain name for what is happening in the story.');
  assert.equal(story[6]!.title, 'Bar numbers');
  for (const p of story) assert.doesNotMatch(`${p.what} ${p.like}`, /Ariadne|Minotaur|Daedalus|Athens/);
});

test('pieceClip keeps a clip inside the piece and at most 4 s', () => {
  assert.deepEqual(pieceClip(2, 20, 16), { kind: 'piece', from: 2, to: 6 });
  assert.deepEqual(pieceClip(15, 15, 16), { kind: 'piece', from: 12, to: 16 });
  assert.deepEqual(pieceClip(-1, 0.1, 0.4), { kind: 'piece', from: 0, to: 0.1 });
  assert.deepEqual(pieceClip(0.4, 0.4, 0.4), { kind: 'piece', from: 0, to: 0.4 });
});

test('the seen flags: per view, remembered, and safe with broken storage', () => {
  const storage = memoryStorage();
  const g = guideStore(storage);
  assert.equal(g.seen('story'), false);
  g.markSeen('story');
  assert.equal(g.seen('story'), true);
  assert.equal(g.seen('roll'), false);
  assert.equal(storage.data.get(`${GUIDE_KEY_PREFIX}story`), 'seen');
  assert.equal(guideStore(storage).seen('story'), true, 'the next page view remembers');
  const broken = guideStore(throwingStorage());
  assert.equal(broken.seen('sound'), false);
  broken.markSeen('sound');
  assert.equal(broken.seen('sound'), true, 'held for this page view');
  assert.equal(guideStore(null).seen('sheet'), false);
  assert.equal(ALWAYS_SEEN.seen('story'), true);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd websites/www.cs/games && node --test workroom/test/guide.test.ts workroom/test/demo.test.ts`
Expected: FAIL (modules missing).

- [ ] **Step 3: Write `src/demo.ts`**

```ts
// The guide's built-in sounds, for the parts the piece's own audio cannot
// show: counted clicks (two bars of four, the first beat stronger), a pair of
// notes going up then the same pair going down, and one note from soft to
// loud. Data only; ui/demo-player.ts plays them. DOM-free.
export type DemoId = 'clicks' | 'updown' | 'swell';
export interface DemoTone { at: number; freq: number; dur: number; vol: number; wave: 'sine' | 'triangle' | 'square' }

const midi = (n: number): number => 440 * 2 ** ((n - 69) / 12);

export const DEMOS: Readonly<Record<DemoId, readonly DemoTone[]>> = {
  clicks: Array.from({ length: 8 }, (_, k): DemoTone => ({ at: k * 0.5, freq: k % 4 === 0 ? 1600 : 1000, dur: 0.06, vol: k % 4 === 0 ? 0.25 : 0.12, wave: 'square' })),
  updown: [
    { at: 0, freq: midi(60), dur: 0.5, vol: 0.2, wave: 'triangle' },
    { at: 0.6, freq: midi(67), dur: 0.5, vol: 0.2, wave: 'triangle' },
    { at: 1.5, freq: midi(67), dur: 0.5, vol: 0.2, wave: 'triangle' },
    { at: 2.1, freq: midi(60), dur: 0.5, vol: 0.2, wave: 'triangle' },
  ],
  swell: Array.from({ length: 10 }, (_, k): DemoTone => ({ at: k * 0.35, freq: midi(57), dur: 0.3, vol: 0.02 + k * 0.025, wave: 'triangle' })),
};

/** Seconds from the first tone's start to the last tone's end. */
export function demoLength(id: DemoId): number {
  return Math.max(...DEMOS[id].map(t => t.at + t.dur));
}
```

- [ ] **Step 4: Write `src/guide.ts`**

```ts
// "How to read this": for each view, the numbered parts the guide walks
// through: where each sits on the view (a spot in the drawing's own pixels, or
// a control), a plain explanation, an everyday comparison and what Hear it
// plays (a short clip of the piece at that part, or a built-in demo). Parts
// with nothing to show on this piece are left out. Also the per-view "seen"
// flags that open the guide by itself on a first visit. DOM-free.
import { pref, text } from '../../_kit/prefs.ts';
import type { Pref } from '../../_kit/prefs.ts';
import type { StorageLike } from '../../_kit/ports.ts';
import { AXIS_H } from './axis.ts';
import { layoutConstellations } from './constellation.ts';
import type { DemoId } from './demo.ts';
import { demoLength } from './demo.ts';
import { layoutRoll, ROLL_H } from './pianoroll.ts';
import type { Score } from './score.ts';
import { PICTURE_H } from './spectro.ts';
import type { Tab } from './tabs.ts';
import { sectionTimes } from './tempo.ts';
import type { TempoMap } from './tempo.ts';
import { layoutTimeline } from './timeline.ts';
import type { Rect } from './timeline.ts';
import { timeToX } from './zoom.ts';
import type { View } from './zoom.ts';

/** The longest piece clip, in seconds. */
export const CLIP_MAX = 4;
export type GuideClip = { kind: 'piece'; from: number; to: number } | { kind: 'demo'; id: DemoId };
export type GuideAnchor = 'view' | 'lane-picker' | 'sheet';
/** rect is in the anchor element's own pixels (the drawing's, for 'view'); null lights the whole element. */
export interface GuideSpot { anchor: GuideAnchor; rect: Rect | null }
export interface GuidePart { id: string; title: string; what: string; like: string; spot: GuideSpot; clip: GuideClip }
export interface GuideInput { tab: Tab; score: Score; tempo: TempoMap; view: View; time: number; lanes?: ReadonlySet<string> }

/** A clip of the piece from `from`, at most CLIP_MAX long, inside 0..duration; an empty one becomes the CLIP_MAX (or less) before the end. */
export function pieceClip(from: number, to: number, duration: number): GuideClip {
  let a = Math.min(Math.max(0, from), duration);
  let b = Math.min(to, a + CLIP_MAX, duration);
  if (b <= a) { b = duration; a = Math.max(0, duration - CLIP_MAX); }
  return { kind: 'piece', from: a, to: b };
}

export function clipLength(clip: GuideClip): number {
  return clip.kind === 'piece' ? clip.to - clip.from : demoLength(clip.id);
}

const PAD = 6;
/** r grown by PAD and clamped to 0..w by 0..h; null when nothing of it is left. */
function onDrawing(r: Rect, w: number, h: number): Rect | null {
  const x = Math.max(0, r.x - PAD);
  const y = Math.max(0, r.y - PAD);
  const x2 = Math.min(w, r.x + r.w + PAD);
  const y2 = Math.min(h, r.y + r.h + PAD);
  return x2 > x && y2 > y ? { x, y, w: x2 - x, h: y2 - y } : null;
}
const view = (rect: Rect | null): GuideSpot => ({ anchor: 'view', rect });

function ruler(score: Score, width: number, top: number): GuidePart {
  return score.kind === 'music'
    ? { id: 'ruler', title: 'Bar numbers', what: 'The numbers along the bottom are the music’s ruler. A bar is a short group of counted beats, often four: one, two, three, four. Musicians say “bar 13” the way you would say “page 13”. Your notes can point at bars.', like: 'Like page numbers, so we can both point at the same moment.', spot: view({ x: 0, y: top, w: width, h: AXIS_H }), clip: { kind: 'demo', id: 'clicks' } }
    : { id: 'ruler', title: 'Seconds', what: 'The numbers along the bottom are the sound’s ruler, in seconds, or thousandths of a second (ms) for a very short sound. Your notes can point at a time.', like: 'Like the timer on a stopwatch.', spot: view({ x: 0, y: top, w: width, h: AXIS_H }), clip: { kind: 'demo', id: 'clicks' } };
}

function playhead(i: GuideInput, height: number): GuidePart {
  const x = Math.min(Math.max(0, timeToX(i.view, i.time)), i.view.width);
  const word = i.score.kind === 'music' ? 'music' : 'sound';
  return {
    id: 'playhead', title: 'The playhead',
    what: `The amber line is where the ${word} is right now. It moves as the ${word} plays. Tap anywhere on the view to jump there.`,
    like: 'Like the cursor in a video player.',
    spot: view(onDrawing({ x, y: 0, w: 0, h: height }, i.view.width, height)),
    clip: pieceClip(i.time, i.time + CLIP_MAX, i.score.duration),
  };
}

function story(i: GuideInput): GuidePart[] {
  const { score, view: v } = i;
  const music = score.kind === 'music';
  const layout = layoutTimeline(score, i.tempo, v);
  const w = v.width;
  const h = layout.height;
  const parts: GuidePart[] = [];
  const firstSection = score.sections[0];
  const sectionRect = layout.sections.map(s => onDrawing(s.rect, w, h)).find(r => r !== null);
  if (firstSection && sectionRect) {
    const t = sectionTimes(firstSection, i.tempo, score.duration);
    parts.push(music
      ? { id: 'sections', title: 'Sections', what: 'The coloured blocks across the top split the piece into chapters, the way a film has scenes. Each one has a plain name for what is happening in the story.', like: 'Like chapter titles in a book.', spot: view(sectionRect), clip: pieceClip(t.from, t.to, score.duration) }
      : { id: 'sections', title: 'Moments', what: 'The coloured blocks across the top name the moments of the sound, such as the hit and the echo after it.', like: 'Like the steps of a recipe, in order.', spot: view(sectionRect), clip: pieceClip(t.from, t.to, score.duration) });
  }
  const lane = layout.lanes[0];
  if (lane) {
    const firstNote = score.notes.filter(n => n.lane === lane.id).sort((a, b) => a.start - b.start)[0];
    const clip = pieceClip(firstNote?.start ?? 0, (firstNote?.start ?? 0) + CLIP_MAX, score.duration);
    parts.push(music
      ? { id: 'lanes', title: 'Instrument lanes', what: 'Each dark row belongs to one group of instruments. Anything drawn inside a row is that group playing. An empty stretch means those instruments are silent.', like: 'Like tracks on a recording, one per musician.', spot: view(onDrawing(lane.rect, w, h)), clip }
      : { id: 'lanes', title: 'Layers', what: 'Each dark row is one layer of the sound, such as the boom or the air around it. Anything drawn inside a row is that layer sounding.', like: 'Like the layers of a cake, each with its own taste.', spot: view(onDrawing(lane.rect, w, h)), clip });
  }
  const shownNote = layout.notes.map(n => ({ n, r: onDrawing(n.rect, w, h) })).find(x => x.r !== null);
  if (shownNote) {
    const note = score.notes[shownNote.n.index]!;
    parts.push({ id: 'notes', title: 'Note bars', what: 'Each small bar is one note. Left to right is when it plays. A longer bar is a note held longer. A bar drawn a little higher in its row is a higher note.', like: 'Like the holes in a music-box roll: where each one sits says when it sounds and how high.', spot: view(shownNote.r), clip: pieceClip(note.start, note.start + CLIP_MAX, score.duration) });
  }
  const tune = layoutConstellations(score, layout, v).find(c => c.stars.length > 0);
  if (tune) {
    const xs = tune.stars.map(s => s.x);
    const ys = tune.stars.map(s => s.y);
    const box = onDrawing({ x: Math.min(...xs), y: Math.min(...ys) - 10, w: Math.max(...xs) - Math.min(...xs) + 60, h: Math.max(...ys) - Math.min(...ys) + 14 }, w, h);
    if (box) parts.push({ id: 'stars', title: "A character's tune as stars", what: 'The joined stars are one character’s tune. Each star is a note. Higher on the screen is a higher note, and a bigger star is louder. The line shows the shape of the tune at a glance.', like: 'A line that climbs sounds hopeful; one that stays low and lurches sounds menacing.', spot: view(box), clip: pieceClip(tune.from, tune.to, score.duration) });
  }
  const peak = score.energy.reduce((best, e) => (e[1] > best[1] ? e : best), score.energy[0] ?? [0, 0]);
  parts.push({ id: 'energy', title: 'The energy glow', what: `The soft green band shows how intense the ${music ? 'music' : 'sound'} feels. Low and thin is calm; high is tense or exciting.`, like: 'Like the volume and pace of a scene building to its climax.', spot: view({ x: 0, y: 0, w, h }), clip: pieceClip(peak[0] - CLIP_MAX, peak[0], score.duration) });
  parts.push(playhead(i, h));
  parts.push(ruler(score, w, h));
  return parts;
}

function roll(i: GuideInput): GuidePart[] {
  const { score, view: v } = i;
  const r = layoutRoll(score, v, ROLL_H, i.lanes);
  const w = v.width;
  const h = r.height;
  const shown = r.notes.map(n => ({ n, rect: onDrawing(n.rect, w, h) })).filter((x): x is { n: (typeof r.notes)[number]; rect: Rect } => x.rect !== null);
  const first = shown[0];
  if (!first) return [ruler(score, w, h)];
  const longest = shown.reduce((a, b) => (b.n.rect.w > a.n.rect.w ? b : a));
  const at = (k: number) => score.notes[k]!;
  return [
    { id: 'note', title: 'A note', what: 'Each bar is one note. Left to right is when it plays.', like: 'Like one key pressed on a piano.', spot: view(first.rect), clip: pieceClip(at(first.n.index).start, at(first.n.index).start + CLIP_MAX, score.duration) },
    { id: 'pitch', title: 'Higher is higher', what: 'A bar higher up is a higher note. The names at the left, such as C3 and C4, mark the notes called C, from low to high.', like: 'Like the keys of a piano stood on end: the low keys at the bottom.', spot: view({ x: 0, y: 0, w: Math.min(w, 32), h }), clip: { kind: 'demo', id: 'updown' } },
    { id: 'length', title: 'Longer is held longer', what: 'A longer bar is a note held for longer.', like: 'Like holding a key down instead of tapping it.', spot: view(longest.rect), clip: pieceClip(at(longest.n.index).start, at(longest.n.index).start + at(longest.n.index).length, score.duration) },
    { id: 'colour', title: 'Colour is the instrument', what: 'Each colour is one instrument group, or the character whose tune it is. The buttons above the roll show or hide each group.', like: 'Like coloured pens, one per musician.', spot: { anchor: 'lane-picker', rect: null }, clip: pieceClip(at(first.n.index).start, at(first.n.index).start + CLIP_MAX, score.duration) },
    ruler(score, w, h),
  ];
}

function soundPicture(i: GuideInput): GuidePart[] {
  const w = i.view.width;
  return [
    { id: 'height', title: 'Low and high', what: 'Low sounds sit at the bottom of the picture and high sounds at the top. The labels at the left give the pitch in hertz (Hz).', like: 'Like a building: the rumble lives on the ground floor, the hiss on the top floor.', spot: view({ x: 0, y: 0, w: Math.min(w, 60), h: PICTURE_H }), clip: { kind: 'demo', id: 'updown' } },
    { id: 'brightness', title: 'Brighter is louder', what: 'The brighter a spot, the louder that sound is at that moment. Dark means quiet.', like: 'Like a heat map, where the hot spots are the loud parts.', spot: view({ x: 0, y: 0, w, h: PICTURE_H }), clip: { kind: 'demo', id: 'swell' } },
    playhead(i, PICTURE_H),
    ruler(i.score, w, PICTURE_H),
  ];
}

function sheetMusic(i: GuideInput): GuidePart[] {
  const start = pieceClip(0, CLIP_MAX, i.score.duration);
  return [
    { id: 'pick', title: 'Pick an instrument', what: 'Sheet music shows one instrument group at a time. Pick it here.', like: 'Like choosing one singer’s part from a choir book.', spot: { anchor: 'lane-picker', rect: null }, clip: start },
    { id: 'staff', title: 'Each line is a staff', what: 'Each set of five lines is a staff. Notes sit on the lines or in the gaps between them, and you read them left to right.', like: 'Like lines of text on a page.', spot: { anchor: 'sheet', rect: null }, clip: start },
    { id: 'higher', title: 'Higher on the staff is higher', what: 'A note drawn higher on the staff is a higher note.', like: 'Like a ladder: each step up is a higher note.', spot: { anchor: 'sheet', rect: null }, clip: { kind: 'demo', id: 'updown' } },
    { id: 'bars', title: 'Bar numbers', what: 'The small number at the start of a line is the bar it begins with. A bar is a short group of counted beats.', like: 'Like page numbers in a book.', spot: { anchor: 'sheet', rect: null }, clip: { kind: 'demo', id: 'clicks' } },
  ];
}

export function guideParts(i: GuideInput): GuidePart[] {
  switch (i.tab) {
    case 'story': return story(i);
    case 'roll': return roll(i);
    case 'sound': return soundPicture(i);
    case 'sheet': return sheetMusic(i);
  }
}

export interface GuideStore { seen(tab: Tab): boolean; markSeen(tab: Tab): void }
export const GUIDE_KEY_PREFIX = 'workroom-guide-';

/** Whether this browser has seen each view's guide (localStorage `workroom-guide-<tab>` = `seen`); broken storage holds the flag for this page view. */
export function guideStore(storage: StorageLike | null): GuideStore {
  const flags = new Map<Tab, Pref<string>>();
  const flag = (tab: Tab) => {
    let f = flags.get(tab);
    if (!f) { f = pref(`${GUIDE_KEY_PREFIX}${tab}`, '', text, storage); flags.set(tab, f); }
    return f;
  };
  return { seen: tab => flag(tab).get() === 'seen', markSeen: tab => flag(tab).set('seen') };
}

/** A store for which every guide is already seen: nothing opens by itself. */
export const ALWAYS_SEEN: GuideStore = { seen: () => true, markSeen: () => {} };
```

Add `"src/demo.ts", "src/guide.ts"` to `tsconfig.json` `files`.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd websites/www.cs/games && node --test workroom/test/guide.test.ts workroom/test/demo.test.ts && node _kit/build/build.mjs workroom && npm run --silent check`
Expected: PASS. If the `pieceClip(15, 15, 16)` case or a zoomed spot fails, fix `pieceClip`/`onDrawing`, not the test.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/games/workroom
git commit -m "Music workroom: the guide's parts for every view, and its built-in demo sounds

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

---

### Task 10: "How to read this": the overlay and its wiring

**Files:**
- Create: `websites/www.cs/games/workroom/src/ui/console/GuideOverlay.tsx`, `src/ui/demo-player.ts`
- Modify: `websites/www.cs/games/workroom/src/ui/Workroom.tsx`, `src/ui/Player.tsx`, `src/main.ts`, `src/tsconfig.dom.json`, `websites/www.cs/music/README.md`
- Test: `websites/www.cs/games/workroom/test/guide-overlay.test.ts` (create), `test/workroom.test.ts`

**Interfaces:**
- Consumes: `GuidePart`, `GuideClip`, `GuideSpot`, `GuideStore`, `ALWAYS_SEEN`, `guideParts`, `guideStore`, `clipLength` (Task 9); `DEMOS`, `DemoId` (Task 9); `createAudioCore`, `AudioCore` (`../../../_kit/audio/core.ts`); `Button` (Task 5); `browserStorage` (Task 4).
- Produces:
  - `GuideOverlay({ parts: readonly GuidePart[]; onHear(clip: GuideClip): void; onClose(): void; locate?(spot: GuideSpot): { left: number; top: number; width: number; height: number } | null })` — `[data-guide-overlay]`, the lit spot `[data-guide-spot]`, the card `section[role="dialog"][data-guide-card]` with "Part n of N", Back, Next, Hear it ("Playing…" while it plays), Close; Tab cycles inside the card; no Escape handler.
  - `demoPlayer(core: AudioCore): (id: DemoId) => void`.
  - `Player` prop `pauseRef?: { current: (() => void) | null }`.
  - `WorkroomProps` gains `guide?: GuideStore` (default `ALWAYS_SEEN`) and `playDemo?(id: DemoId): void`; each view shows a ghost Button "How to read this" (`data-guide-open`).

- [ ] **Step 1: Write the failing tests**

`test/guide-overlay.test.ts`:

```ts
// The guide overlay: one part at a time, Back and Next, Hear it hands over the
// part's clip, focus starts on the card and Tab stays in it, Escape does
// nothing, Close is the only way out. And the demo player's tones.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, document as stubDocument, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { asAudioContext, fakeAudioContext, nodesOf } from '../../_kit/test/audio.ts';
import { createAudioCore } from '../../_kit/audio/core.ts';
import { DEMOS } from '../src/demo.ts';
import type { GuideClip, GuidePart } from '../src/guide.ts';

installDocument();
// Every key listener the overlay (or anything it mounts) puts on the window or the document, so the Escape test can press Escape at each.
const keyListeners: unknown[] = [];
const listen = (type: string, f: unknown): void => { if (type.startsWith('key')) keyListeners.push(f); };
Object.assign(globalThis, { window: { addEventListener: listen, removeEventListener() {} } });
const addToDocument = stubDocument.addEventListener;
stubDocument.addEventListener = (type, f) => { listen(type, f); addToDocument(type, f); };
const ui = await importTsx<{ g: typeof import('../src/ui/console/GuideOverlay.tsx'); d: typeof import('../src/ui/demo-player.ts') }>(
  import.meta.dirname, { g: '../src/ui/console/GuideOverlay.tsx', d: '../src/ui/demo-player.ts' });

const part = (id: string, clip: GuideClip): GuidePart => ({ id, title: `T ${id}`, what: `W ${id}`, like: `L ${id}`, spot: { anchor: 'view', rect: { x: 1, y: 2, w: 30, h: 40 } }, clip });
const PARTS = [part('a', { kind: 'piece', from: 1, to: 3 }), part('b', { kind: 'demo', id: 'clicks' }), part('c', { kind: 'demo', id: 'swell' })];
const button = (root: StubElement, text: string) => walk(root).find(e => e.localName === 'button' && e.textContent === text)!;

const mount = async (onHear: (c: GuideClip) => void = () => {}, onClose: () => void = () => {}) => {
  const root = makeEl('root');
  await act(() => { render(h(ui.g.GuideOverlay, { parts: PARTS, onHear, onClose, locate: () => ({ left: 10, top: 20, width: 30, height: 40 }) }), renderTarget(root)); });
  return root;
};

test('one part at a time; Back and Next walk them and stop at the ends', async () => {
  const root = await mount();
  assert.match(root.textContent, /Part 1 of 3/);
  assert.match(root.textContent, /T a/);
  assert.equal(button(root, 'Back')._attrs['disabled'] !== undefined || button(root, 'Back').disabled, true);
  await act(() => { fire(button(root, 'Next'), 'click'); });
  await act(() => { fire(button(root, 'Next'), 'click'); });
  assert.match(root.textContent, /Part 3 of 3/);
  assert.ok(button(root, 'Next').disabled || button(root, 'Next')._attrs['disabled'] !== undefined);
  await act(() => { fire(button(root, 'Back'), 'click'); });
  assert.match(root.textContent, /Part 2 of 3/);
});

test('the lit spot sits where locate puts it', async () => {
  const root = await mount();
  const spot = walk(root).find(e => e._attrs['data-guide-spot'] !== undefined)!;
  assert.deepEqual([spot.style['left'], spot.style['top'], spot.style['width'], spot.style['height']], ['10px', '20px', '30px', '40px']);
});

test('Hear it hands over the part’s clip and says it is playing', async () => {
  const heard: GuideClip[] = [];
  const root = await mount(c => heard.push(c));
  await act(() => { fire(button(root, 'Hear it'), 'click'); });
  assert.deepEqual(heard, [{ kind: 'piece', from: 1, to: 3 }]);
  assert.ok(walk(root).some(e => e.localName === 'button' && e.textContent === 'Playing…'));
  render(null, renderTarget(root));
});

test('focus starts on the card; Escape does nothing, on the card or to any window or document key listener; Close calls onClose', async () => {
  let closed = 0;
  const root = await mount(() => {}, () => { closed++; });
  const card = walk(root).find(e => e._attrs['data-guide-card'] !== undefined)!;
  assert.equal(globalThis.__focused, card);
  fire(card, 'keydown', { key: 'Escape' });
  const pressed = keyListeners.map(f => {
    const ev = { type: 'keydown', key: 'Escape', prevented: false, stopped: false, preventDefault() { ev.prevented = true; }, stopPropagation() { ev.stopped = true; } };
    (f as (e: typeof ev) => void)(ev);
    return ev;
  });
  assert.ok(pressed.every(ev => !ev.prevented && !ev.stopped), 'no global key listener takes Escape');
  assert.equal(closed, 0);
  assert.ok(walk(root).some(e => e._attrs['data-guide-card'] !== undefined));
  await act(() => { fire(button(root, 'Close'), 'click'); });
  assert.equal(closed, 1);
});

test('the demo player plays every tone of a demo', () => {
  const ctx = fakeAudioContext();
  const play = ui.d.demoPlayer(createAudioCore({ createContext: () => asAudioContext(ctx) }));
  play('clicks');
  const oscs = nodesOf(ctx, 'osc');
  assert.equal(oscs.length, 1 + 8, 'the unlock blip, then eight clicks');
  assert.deepEqual(oscs.slice(1).map(o => o.frequency.calls[0]?.[1]), DEMOS.clicks.map(t => t.freq));
});
```

(A running fake context primes one oscillator on `unlock`, and each `tone` sets its frequency with `setValueAtTime`, recorded as `['set', freq, t]`.)

In `test/workroom.test.ts`, add `import { memoryStorage } from '../../_kit/test/record.ts';` and `import { guideStore } from '../src/guide.ts';` to the import block at the top of the file, and extend `mount` (the file has `mount`, `button`, `named`, `unmount`) to accept extra props: `const mount = async (extra: Record<string, unknown> = {}) => { …h(ui.room.Workroom, { score, version: 1, versions: [1], audioSrc: (f: string) => f, onVersion: () => {}, ...extra })… }`. Then append:

```ts
const overlay = (root: StubElement) => walk(root).find(e => e._attrs['data-guide-overlay'] !== undefined);

test('the guide opens by itself on a first visit, once, and Close gives focus to How to read this', async () => {
  const storage = memoryStorage();
  const root = await mount({ guide: guideStore(storage) });
  assert.ok(overlay(root), 'opened on the first visit');
  assert.equal(storage.data.get('workroom-guide-story'), 'seen');
  await act(() => { fire(button(root, 'Close'), 'click'); });
  assert.equal(overlay(root), undefined);
  assert.equal(globalThis.__focused?._attrs['data-guide-open'], '');
  unmount(root);
  const again = await mount({ guide: guideStore(storage) });
  assert.equal(overlay(again), undefined, 'never again by itself');
  await act(() => { fire(button(again, 'How to read this'), 'click'); });
  assert.ok(overlay(again), 'but on request');
  unmount(again);
});

test('without a guide store nothing opens by itself', async () => {
  const root = await mount();
  assert.equal(overlay(root), undefined);
  unmount(root);
});

test('each view has its own first visit', async () => {
  const storage = memoryStorage({ 'workroom-guide-story': 'seen' });
  const root = await mount({ guide: guideStore(storage) });
  assert.equal(overlay(root), undefined);
  const rollTab = walk(root).find(e => e._attrs['role'] === 'tab' && e.textContent === 'Piano roll')!;
  await act(() => { fire(rollTab, 'click'); });
  assert.ok(overlay(root));
  assert.match(root.textContent, /Part 1 of 5/);
  unmount(root);
});

test('a demo’s Hear it pauses the piece first and plays the demo once', async () => {
  const demos: string[] = [];
  const root = await mount({ playDemo: (id: string) => demos.push(id) });
  await act(() => { fire(button(root, 'Play'), 'click'); });
  const audio = audios[audios.length - 1]!;
  assert.equal(audio.paused, false);
  await act(() => { fire(button(root, 'How to read this'), 'click'); });
  for (let n = 1; n < 7; n++) await act(() => { fire(button(root, 'Next'), 'click'); });
  await act(() => { fire(button(root, 'Hear it'), 'click'); });
  assert.deepEqual(demos, ['clicks']);
  assert.equal(audio.paused, true);
  unmount(root);
});

test('a piece part’s Hear it plays the piece from the clip’s start', async () => {
  const root = await mount();
  await act(() => { fire(button(root, 'How to read this'), 'click'); });
  const audio = audios[audios.length - 1]!;
  const before = audio.played;
  await act(() => { fire(button(root, 'Hear it'), 'click'); });
  assert.equal(audio.played, before + 1);
  assert.equal(audio.currentTime, 0, 'the first section starts at 0');
  unmount(root);
});
```

(`audios`, `StubAudio`, `act`, `fire`, `walk`, `StubElement` are already in that file.)

- [ ] **Step 2: Run them to verify they fail**

Run: `cd websites/www.cs/games && node --test workroom/test/guide-overlay.test.ts workroom/test/workroom.test.ts`
Expected: FAIL (no overlay, no "How to read this").

- [ ] **Step 3: Write `src/ui/demo-player.ts`**

```ts
// Plays the guide's built-in demos through the kit's audio core, inside the
// tap that asked for them (iOS starts sound only there).
import type { AudioCore } from '../../../_kit/audio/core.ts';
import { DEMOS } from '../demo.ts';
import type { DemoId } from '../demo.ts';

export function demoPlayer(core: AudioCore): (id: DemoId) => void {
  return id => {
    core.unlock();
    for (const t of DEMOS[id]) core.tone({ freq: t.freq, dur: t.dur, vol: t.vol, type: t.wave, when: t.at, attack: 0.01 }, 'sfx');
  };
}
```

- [ ] **Step 4: Write `src/ui/console/GuideOverlay.tsx`**

```tsx
// "How to read this": everything dimmed but the part being explained, a
// numbered badge on it, and a card with the explanation, an everyday
// comparison, Hear it, Back, Next and Close. Focus moves to the card and Tab
// stays inside it; Close is the way out (Escape is never bound).
import { useEffect, useRef, useState } from 'preact/hooks';
import { clipLength } from '../../guide.ts';
import type { GuideClip, GuidePart, GuideSpot } from '../../guide.ts';
import { Button } from './Button.tsx';

export interface SpotBox { left: number; top: number; width: number; height: number }
export interface GuideOverlayProps { parts: readonly GuidePart[]; onHear(clip: GuideClip): void; onClose(): void; locate?(spot: GuideSpot): SpotBox | null }

const VEIL = 'shadow-[0_0_0_9999px_color-mix(in_oklab,var(--color-well)_80%,transparent)]';

/** The spot on screen: the anchor element's box, offset by the part's rect when it has one. */
export function locateSpot(spot: GuideSpot): SpotBox | null {
  const el = document.querySelectorAll(`[data-guide="${spot.anchor}"]`)[0];
  if (!el) return null;
  const box = el.getBoundingClientRect();
  return spot.rect
    ? { left: box.left + spot.rect.x, top: box.top + spot.rect.y, width: spot.rect.w, height: spot.rect.h }
    : { left: box.left, top: box.top, width: box.width, height: box.height };
}

export function GuideOverlay(p: GuideOverlayProps) {
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [, redraw] = useState(0);
  const card = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const part = p.parts[Math.min(at, p.parts.length - 1)]!;
  const box = (p.locate ?? locateSpot)(part.spot);

  useEffect(() => { card.current?.focus(); }, []);
  // The lit spot follows the page when it scrolls or resizes.
  useEffect(() => {
    const again = (): void => redraw(n => n + 1);
    window.addEventListener('resize', again);
    window.addEventListener('scroll', again, true);
    return () => { window.removeEventListener('resize', again); window.removeEventListener('scroll', again, true); };
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  // A new part brings its spot on screen.
  useEffect(() => { document.querySelectorAll(`[data-guide="${part.spot.anchor}"]`)[0]?.scrollIntoView?.({ block: 'nearest' }); }, [at]);

  const hear = (): void => {
    p.onHear(part.clip);
    setPlaying(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPlaying(false), clipLength(part.clip) * 1000);
  };
  const go = (n: number): void => { setAt(n); setPlaying(false); };
  // Tab and Shift+Tab stay among the card's enabled buttons.
  const keepFocus = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab' || !card.current) return;
    const buttons = [...card.current.querySelectorAll('button')].filter(b => !b.disabled);
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && (document.activeElement === first || document.activeElement === card.current)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div data-guide-overlay="" class="fixed inset-0 z-40">
      {box ? (
        <div aria-hidden="true" data-guide-spot="" class={`pointer-events-none fixed rounded-md ring-2 ring-amber ${VEIL}`}
          style={{ left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` }}>
          <span class="absolute -top-3 -left-3 grid size-7 place-items-center rounded-full bg-amber font-mono text-xs font-semibold text-on-accent">{at + 1}</span>
        </div>
      ) : <div aria-hidden="true" class="fixed inset-0 bg-well/80" />}
      <section ref={card} role="dialog" aria-modal="true" aria-labelledby="guide-title" tabindex={-1} data-guide-card="" onKeyDown={keepFocus}
        class="fixed inset-x-4 bottom-4 mx-auto grid max-w-md gap-3 rounded-lg border border-rule bg-panel p-4 text-ink shadow-lg focus:outline-none">
        <p class="font-mono text-xs tracking-widest uppercase text-dim">Part {at + 1} of {p.parts.length}</p>
        <h2 id="guide-title" class="font-display text-2xl font-semibold uppercase">{part.title}</h2>
        <p>{part.what}</p>
        <p class="text-dim">{part.like}</p>
        <div class="flex flex-wrap gap-2">
          <Button variant="primary" onClick={hear}>{playing ? 'Playing…' : 'Hear it'}</Button>
          <Button onClick={() => go(at - 1)} disabled={at === 0}>Back</Button>
          <Button onClick={() => go(at + 1)} disabled={at === p.parts.length - 1}>Next</Button>
          <Button variant="ghost" onClick={p.onClose}>Close</Button>
        </div>
      </section>
    </div>
  );
}
```

(If the stub's `section` lacks `querySelectorAll('button')`, `keepFocus` simply does nothing in Node; the browser check exercises it.)

- [ ] **Step 5: Player pause hook** — in `src/ui/Player.tsx` add `pauseRef?: { current: (() => void) | null }` to `PlayerProps` and:

```tsx
  // A demo in the guide pauses the piece first.
  useEffect(() => {
    const ref = p.pauseRef;
    if (!ref) return;
    ref.current = () => { audio.current?.pause(); };
    return () => { ref.current = null; };
  }, [p.pauseRef]);
```

- [ ] **Step 6: Wire the Workroom** — in `src/ui/Workroom.tsx`:

Imports: `import { ALWAYS_SEEN, guideParts } from '../guide.ts'; import type { GuideClip, GuideStore } from '../guide.ts'; import type { DemoId } from '../demo.ts'; import { Button } from './console/Button.tsx'; import { GuideOverlay } from './console/GuideOverlay.tsx';`

`WorkroomProps` gains `guide?: GuideStore; playDemo?(id: DemoId): void`.

State and handlers (after `const [sheetOpen, …]`):

```tsx
  const guide = p.guide ?? ALWAYS_SEEN;
  const [guideOpen, setGuideOpen] = useState(false);
  const howTo = useRef<HTMLButtonElement>(null);
  const pauseAudio = useRef<(() => void) | null>(null);
```

after `const tab = pickTab(…)`:

```tsx
  // A view's guide opens by itself the first time this browser shows that view.
  useEffect(() => {
    if (guide.seen(tab)) return;
    guide.markSeen(tab);
    setGuideOpen(true);
  }, [tab]);
  const openGuide = (): void => { guide.markSeen(tab); setGuideOpen(true); };
  const closeGuide = (): void => { setGuideOpen(false); howTo.current?.focus(); };
  const hearPart = (c: GuideClip): void => {
    if (c.kind === 'piece') hear({ from: c.from, to: c.to });
    else { pauseAudio.current?.(); p.playDemo?.(c.id); }
  };
```

`<Player … pauseRef={pauseAudio} />`; the legend row becomes:

```tsx
          <div class="flex flex-wrap items-center justify-between gap-2">
            <Legend items={LEGENDS[tab]} />
            <Button variant="ghost" buttonRef={howTo} data={{ 'data-guide-open': '' }} onClick={openGuide}>How to read this</Button>
          </div>
```

and just before the closing `</div>` of the outer grid:

```tsx
      {guideOpen ? <GuideOverlay parts={guideParts({ tab, score, tempo, view, time, lanes })} onHear={hearPart} onClose={closeGuide} /> : null}
```

`src/main.ts`: import `browserStorage` from `./browser.ts`, `guideStore` from `./guide.ts`, `demoPlayer` from `./ui/demo-player.ts`, `createAudioCore` from `../../_kit/audio/core.ts`, and pass to `Workroom`: `guide: guideStore(browserStorage()), playDemo: demoPlayer(createAudioCore()),`.

`src/tsconfig.dom.json` gains `"ui/console/GuideOverlay.tsx", "ui/demo-player.ts"`.

`music/README.md`, in "The look", add: "Every view has a legend line and a **How to read this** button: a guided walk through the view's parts, one lit at a time, each with Hear it (a clip of the piece, or a built-in demo). It opens by itself the first time each view is shown in a browser (`workroom-guide-<view>` in localStorage)."

- [ ] **Step 7: Run the tests and build**

Run: `cd websites/www.cs/games && node _kit/build/build.mjs workroom && sh units.sh && npm run --silent check`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add websites/www.cs/games/workroom websites/www.cs/music/README.md
git commit -m "Music workroom: How to read this, a guided walk through every view with Hear it

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

---

### Task 11: The browser check in the new look

**Files:**
- Modify: `websites/www.cs/tests/e2e/workroom.local.ts`

**Interfaces:**
- Consumes: every selector above: `role="tab"` names `Story`, `Piano roll`, `Sound picture`, `Sheet music`; the `Theme` group's `System`/`Dark`/`Light` buttons; `[data-guide-card]`, "How to read this"; `[data-sheet] > button[aria-expanded]`; `[data-card]`; `.error`; `li.piece`; storage keys `workroom-theme`, `workroom-guide-<tab>`.
- Produces: `signedInPage(browser, base, { guideSeen?: boolean })`; screenshots `<MUSIC_E2E_SHOTS>/<screen>-<width>-<theme>.png` when that variable is set.

- [ ] **Step 1: Seen guides by default** — in `workroom.local.ts` add `mkdirSync` to the `node:fs` import, and change `signedInPage`:

```ts
const VIEW_TABS = ['story', 'roll', 'sound', 'sheet'] as const;

/** A fresh browser context signed in as the owner. The first call signs in and keeps the session; later calls reuse it. Unless guideSeen is false, every view's guide counts as seen, so none opens over the page. */
export async function signedInPage(browser: Browser, base: string, opts: { guideSeen?: boolean } = {}): Promise<{ context: BrowserContext; page: Page }> {
  if (!session) {
    const first = await browser.newContext();
    await signIn(await first.newPage(), base);
    session = await first.storageState();
    await first.close();
  }
  const context = await browser.newContext({ storageState: session });
  if (opts.guideSeen ?? true) {
    await context.addInitScript((tabs: readonly string[]) => { for (const t of tabs) localStorage.setItem(`workroom-guide-${t}`, 'seen'); }, VIEW_TABS);
  }
  return { context, page: await context.newPage() };
}
```

- [ ] **Step 2: Tabs are tabs** — in both existing tests replace every `page.getByRole('button', { name: tab })` / `{ name: 'Sheet music' }` / `'Story'` / `'Piano roll'` / `'Sound picture'` with `page.getByRole('tab', { name: … })` (the `toHaveCount(0)` checks for a sound piece too). Update the file's header comment to also say: "the theme switch, the guide, and every screen at phone and desktop width in both themes".

- [ ] **Step 3: The theme test** — append:

```ts
test('the theme switch restyles the page without a reload, is remembered, and the fonts load', async ({ browser, request, baseURL }) => {
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
    await publishFixtureDraft(request, base, await createKey(page, base, 'e2e theme', ['drafts:publish']));
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`${base}music/piece.php?id=test-piece`);
    await expect(page.locator('[data-timeline]')).toBeVisible();
    const html = page.locator('html');
    const ground = (): Promise<string> => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await expect(html).toHaveAttribute('data-theme', 'dark');
    expect(await ground()).toBe('rgb(18, 21, 25)');
    await page.evaluate(() => { document.body.dataset.stayed = 'yes'; });
    const themes = page.getByRole('group', { name: 'Theme' });
    await themes.getByRole('button', { name: 'Light' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    expect(await ground()).toBe('rgb(238, 240, 243)');
    expect(await page.evaluate(() => document.body.dataset.stayed)).toBe('yes');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await themes.getByRole('button', { name: 'System' }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(html).toHaveAttribute('data-theme', 'light');
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, ''));
    });
    for (const family of ['Barlow', 'Barlow Condensed', 'IBM Plex Mono']) expect(loaded).toContain(family);
  } finally {
    await context.close();
  }
});
```

- [ ] **Step 4: The guide test** — append:

```ts
test('the guide opens on a first visit, walks every part, plays, ignores Escape and gives focus back', async ({ browser, request, baseURL }) => {
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base, { guideSeen: false });
  try {
    await publishFixtureDraft(request, base, await createKey(page, base, 'e2e guide', ['drafts:publish']));
    await page.goto(`${base}music/piece.php?id=test-piece`);
    const card = page.locator('[data-guide-card]');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Part 1 of 7');
    await card.getByRole('button', { name: 'Hear it' }).click();
    await expect.poll(() => page.locator('audio').evaluate(a => ((a as HTMLAudioElement).paused ? -1 : (a as HTMLAudioElement).currentTime))).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await expect(card).toBeVisible();
    for (let n = 2; n <= 7; n++) {
      await card.getByRole('button', { name: 'Next' }).click();
      await expect(card).toContainText(`Part ${n} of 7`);
    }
    await expect(card.getByRole('button', { name: 'Next' })).toBeDisabled();
    await card.getByRole('button', { name: 'Close' }).click();
    await expect(card).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'How to read this' })).toBeFocused();
    await page.reload();
    await expect(page.locator('[data-timeline]')).toBeVisible();
    await expect(card).toHaveCount(0);
    await page.getByRole('tab', { name: 'Piano roll' }).click();
    await expect(card).toContainText('Part 1 of 5');
  } finally {
    await context.close();
  }
});
```

- [ ] **Step 5: Every screen, both widths, both themes** — append:

```ts
const SHOTS = process.env.MUSIC_E2E_SHOTS ?? '';
interface Screen { name: string; path: string; ready(page: Page): Promise<void> }
const tab = (name: string, then: (p: Page) => Promise<void>) => async (p: Page) => { await p.getByRole('tab', { name }).click(); await then(p); };
const SCREENS: Screen[] = [
  { name: 'pieces', path: 'music/', ready: p => expect(p.locator('li.piece').first()).toBeVisible() },
  { name: 'story', path: 'music/piece.php?id=test-piece', ready: p => expect(p.locator('[data-timeline]')).toBeVisible() },
  { name: 'piano-roll', path: 'music/piece.php?id=test-piece', ready: tab('Piano roll', p => expect(p.locator('[data-roll]')).toBeVisible()) },
  { name: 'sound-picture', path: 'music/piece.php?id=test-piece', ready: tab('Sound picture', p => expect(p.locator('img[data-spectrogram]')).toBeVisible()) },
  { name: 'sheet-music', path: 'music/piece.php?id=test-piece', ready: tab('Sheet music', p => expect(p.locator('#sheet svg')).toBeVisible({ timeout: 15_000 })) },
  { name: 'word-card', path: 'music/piece.php?id=test-piece', ready: async p => {
    await expect(p.locator('[data-timeline]')).toBeVisible();
    const handle = p.locator('[data-sheet] > button[aria-expanded]');
    if (await handle.isVisible()) await handle.click();
    await p.locator('[data-sheet] button[data-term="ostinato"]').first().click();
    await expect(p.locator('[data-card]')).toBeVisible();
  } },
  { name: 'guide', path: 'music/piece.php?id=test-piece', ready: async p => {
    await p.getByRole('button', { name: 'How to read this' }).click();
    await expect(p.locator('[data-guide-card]')).toBeVisible();
  } },
  { name: 'sound-story', path: 'music/piece.php?id=cannon-fire', ready: p => expect(p.locator('[data-lane="boom"]')).toBeVisible() },
  { name: 'sound-sound-picture', path: 'music/piece.php?id=cannon-fire', ready: tab('Sound picture', p => expect(p.locator('img[data-spectrogram]')).toBeVisible()) },
  { name: 'missing-piece', path: 'music/piece.php?id=no-such-piece', ready: p => expect(p.locator('.error')).toBeVisible() },
  { name: 'bad-request', path: 'music/piece.php?id=%3Cscript%3E', ready: p => expect(p.locator('.error')).toBeVisible() },
];

test('every screen at 390 and 1280 px, dark and light: no sideways scroll, 44 px targets, no CSP errors', async ({ browser, request, baseURL }) => {
  test.setTimeout(240_000);
  const base = baseURL!;
  const { context, page } = await signedInPage(browser, base);
  try {
    const violations: string[] = [];
    page.on('console', m => { if (/Content Security Policy/i.test(m.text())) violations.push(m.text()); });
    const key = await createKey(page, base, 'e2e screens', ['drafts:publish']);
    await publishFixtureDraft(request, base, key);
    await publishFixtureDraft(request, base, key, 'draft-sound');
    if (SHOTS) mkdirSync(SHOTS, { recursive: true });
    for (const theme of ['dark', 'light'] as const) {
      for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
        for (const s of SCREENS) {
          await page.goto(`${base}music/`);
          await page.evaluate(t => localStorage.setItem('workroom-theme', t), theme);
          await page.goto(`${base}${s.path}`);
          await s.ready(page);
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
          const sideways = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
          expect(sideways, `${s.name} at ${width} px scrolls sideways`).toBeLessThanOrEqual(0);
          const small = await page.evaluate(() => [...document.querySelectorAll('button, a, select, [role="tab"]')]
            .filter(el => !el.closest('svg'))
            .map(el => ({ el, r: el.getBoundingClientRect() }))
            .filter(({ r }) => r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44))
            .map(({ el, r }) => `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`));
          expect(small, `${s.name} at ${width} px, ${theme}: tap targets under 44 px`).toEqual([]);
          if (SHOTS) await page.screenshot({ path: join(SHOTS, `${s.name}-${width}-${theme}.png`), fullPage: true });
        }
      }
    }
    expect(violations).toEqual([]);
  } finally {
    await context.close();
  }
});
```

- [ ] **Step 6: Type-check and run**

```bash
cd websites/www.cs/tests/e2e && npm ci --silent && node_modules/.bin/tsc -p tsconfig.json
cd websites/www.cs && make music-e2e
docker compose ls | grep music-e2e || echo "no music-e2e project left"
```

Expected: tsc clean; all five tests pass and `MUSIC-E2E-OK` prints; no `music-e2e-*` project remains. A failure in the screens test names the screen, width and theme: fix the page (layout, a missing `min-h-11`, a long word without `break-words`), not the check.

- [ ] **Step 7: Commit**

```bash
git add websites/www.cs/tests/e2e/workroom.local.ts
git commit -m "Music workroom: browser check for the theme, the guide and every screen at both widths

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb"
```

---

### Task 12: Screenshots for the owner, the gates, and PR 4

**Files:** none new (fixes only, if a gate fails).

**Interfaces:**
- Consumes: Task 11's `MUSIC_E2E_SHOTS`.
- Produces: 44 PNGs in a scratch folder outside the repository; the pushed branch `music/theme`; the open PR.

- [ ] **Step 1: Screenshots** (local docker only, its own throwaway project)

```bash
shots="${TMPDIR:-/tmp}/workroom-theme-shots"
rm -rf "$shots"
cd websites/www.cs && MUSIC_E2E_SHOTS="$shots" make music-e2e
ls "$shots" | wc -l
ls "$shots"
```

Expected: `MUSIC-E2E-OK`; 44 files: each of `pieces`, `story`, `piano-roll`, `sound-picture`, `sheet-music`, `word-card`, `guide`, `sound-story`, `sound-sound-picture`, `missing-piece`, `bad-request` × `390`, `1280` × `dark`, `light`. The folder is outside the repository; `git status` shows nothing new.

Open four of them (`story-390-dark.png`, `story-1280-light.png`, `guide-390-light.png`, `sheet-music-1280-dark.png`) with the Read tool and check by eye: constellations visible over the brass lane, the glow behind the lanes, the notes sheet as a bottom handle at 390 and a right column at 1280, daylight colours on the light shots, no clipped text. Fix and rerun if not.

- [ ] **Step 2: Gates** (from `websites/www.cs`)

```bash
vendor/bin/phpunit --testsuite site
(cd games && npm ci --silent && npm run --silent check)
sh games/units.sh
(cd tests/e2e && npm ci --silent && node_modules/.bin/tsc -p tsconfig.json)
node tests/e2e/select.ts --check
git diff --stat origin/main -- ../../.github tests/e2e/select.ts ../../compose.yaml
grep -rn 'style="' music/lib/Pages.php || echo "no inline style attributes"
```

Expected: all green; `select.ts --check` prints `E2E-SELECT-OK`; the `git diff --stat` for CI files prints nothing; no inline style attributes.

- [ ] **Step 3: Push**

```bash
git push -u origin music/theme
```

- [ ] **Step 4: Open PR 4** with the foundry `pr-fix-loop` skill. Title: "Music workroom: its own look (Studio Console, dark and daylight), constellations, How to read this". Body: a summary (Tailwind v4 in the kit with fonts and licences; tokens in both themes and the System/Dark/Light switch applied before the first paint; the console components PR 5 builds on; the restyled pages; constellations and the energy glow; the guide and legends), the spec and plan paths, the decisions list from this plan, the `make music-e2e` result, the screenshot folder path ("44 screenshots, every screen at 390 and 1280 px in dark and light, for the owner before merge"), the note that PR 3 merged first and this PR starts from `main` with it in (`games/workroom/build.json` and `tsconfig.json` carry both PRs' entries), and the PR attribution lines:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
```

Merging waits for the owner's look at the screenshots; report the PR URL and the screenshot folder.
