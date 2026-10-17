# Crete Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put every control of The Island of Crete inside one game frame (status bar, maze, control strip, title card, menu on Q) with key tabs that share one look with Tankity's, and change no rule of today's game.

**Architecture:** The kit gains a `.kit-key-tab` rule and a `KeyChip variant="tab"`; Tankity adopts it first (its look unchanged). Crete gets small DOM-free modules (key table, layer stack, status text, cell fit, help text, settings) and Preact views (status, strip, menu, story, title) that are unit-tested on their own, then one integration task rewrites `index.html`, `game.css`, `ui.ts` and `main.ts` around them. `engine.ts`, `grid.ts` and `bots.ts` are not touched.

**Tech Stack:** TypeScript 7, Preact, esbuild through `_kit/build/build.mjs`, `node:test` with the kit's DOM stub, Playwright for the browser specs, PHP generators for versions and pages.

**Spec:** `docs/superpowers/specs/2026-10-16-crete-shell-design.md` (binding). Context only: `docs/superpowers/specs/2026-10-16-crete-redesign-vision.md`.

## Global Constraints

Every task's requirements include this section.

- Work in a worktree on a feature branch (`git worktree add .claude/worktrees/crete-shell -b feat/crete-shell docs/crete-redesign-spec`, or `origin/main` once the spec has merged). The root checkout stays on `main`. Never `git stash`; set work aside with a WIP commit.
- Esc is never bound and never exits full screen. Q is back/close (the kit's `isBackKey`, `_kit/keys.ts`). Keep the existing Esc and fullscreen regression tests (`tankity/test/fullscreen.test.ts`, `_kit/test/app.test.ts`, `tests/e2e/tankity-fullscreen-esc.spec.ts`) and the Esc test in `crete/test/keys.test.ts`.
- No hardcoded weapon or item groups in logic. Key labels come from the key table (`crete/src/keys.ts` for Crete, `ITEMS[kind].key` for the tools), never typed twice.
- Docs (READMEs, code comments) describe current state only, never history: no "now", "previously", "moved", "no longer", "used to".
- Generated files are rebuilt, never hand-edited. From `websites/www.cs/games`: `node _kit/build/build.mjs <game>`. In each touched game: `php tools/install-files.php`. From `websites/www.cs`: `php tools/site-versions.php` and `php tools/site-game-pages.php`. Commit `dist/`, `sw.js`, the index and play pages.
- Gates: `bash websites/www.cs/games/units.sh`; in `websites/www.cs`, `make test` with a unique `COMPOSE_PROJECT_NAME` and teardown through an explicit `docker compose -p <name> down -v` (never the `siue` project, never prune, never ports 3000, 5173, 8000 or 8080); at most 2 e2e specs locally per run via `make e2e E2E_ARGS="<spec>.ts"`; CI runs the rest.
- Never SSH to www.cs.siue.edu, never `make deploy`.
- No rule or engine changes: `crete/src/engine.ts`, `grid.ts` and `bots.ts` stay byte for byte as they are (`git diff origin/main -- websites/www.cs/games/crete/src/engine.ts websites/www.cs/games/crete/src/grid.ts websites/www.cs/games/crete/src/bots.ts` must print nothing at the end).
- Commit each task on the feature branch without asking; end every commit message with the attribution lines the session's system reminder gives. Do not push unless the operator asks. Every siue PR goes through `foundry:pr-fix-loop`.
- Run unit tests from `websites/www.cs/games`: `node --test crete/test/<file>.test.ts`. `node _kit/build/build.mjs crete` type-checks `src/` and the tests (three programs) and rebuilds `dist/`.

## Review Focus

Inputs and conditions the spec implies that a player is most likely to hit, most likely first. Each line names the task whose tests pin it.

1. **Q typed into the seed box is a letter**, not "open the menu" or "close the menu". The menu holds the only text field, so a player who types a seed with a `q` must not lose the menu. Pinned in Task 6 (`keys.test.ts`).
2. **Q under the title card does nothing, and Q on the ending card reveals the title card, never the menu.** The title card has nothing under it to go back to; a stack that popped it would drop the player into a finished maze. Pinned in Task 3 (`layers.test.ts`) and Task 6 (`keys.test.ts`).
3. **Tiny screens** (320 x 568 portrait, 568 x 320 landscape): no page scroll, every control inside the viewport, the maze at least 8 px per cell. Pinned in Task 7 (`crete-layout.spec.ts` lists both).
4. **Blocked or missing storage** (private window, storage refused): sound and fullscreen preferences degrade to the session and never throw; a stored word that is neither `on` nor `off` reads as the default. Pinned in Task 3 (`settings.test.ts`).
5. **Fullscreen unsupported or refused, and Esc pressed in full screen**: the menu says so in the toast instead of failing silently; Esc changes nothing and the Escape lock is taken. Pinned in Task 3 (`notes.test.ts`) and Task 7 (`crete-play.spec.ts`).

## Spec rulings (ambiguities the plan decides)

- **Class on Tankity's chips.** `tankity-layout.spec.ts`, `tankity-pickers.spec.ts` and 40 unit assertions select `.key` / `kbd.key`, and the spec requires `tankity-layout.spec.ts` unchanged. Tankity's elements therefore wear both classes, `kit-key-tab key`. The look moves to the kit's `--kit-key-tab-*` properties and `.kit-key-tab`; the `key` class stays as the game's own hook for its display rules (`.touch .key`, `#deck .key`, `.vol-toggle .key`).
- **`KeyChip` classes.** With `variant="chip"` (the default) a `class` replaces the kit class, as today. With `variant="tab"` a `class` is added after `kit-key-tab`, so the kit's properties keep driving the tab.
- **Tankity links the kit sheet.** It did not before; Task 2 sets `"kitCss": true`, links `dist/kit.css` and versions it.
- **Title card on a run's end.** "Shown ... when a run ends (under the ending card's Again)": the title card is opened under the ending card. Q closes the ending card and reveals the title card; Again (or N) starts a run.
- **The first Play.** The page opens on a run (the address's `?seed=`, else a random one) drawn dimly under the title card. The first Play starts that maze; every later Play (after Quit or an ending) is a random seed.
- **Key labels of the move pad** are the arrow glyphs `↑ ← ↓ →` (WASD also moves, and the help text names both).
- **Install bar.** The kit's `mountInstallBar` is mounted in the title card's `#title-install` slot. The bar draws nothing when the page is framed (`InstallView.off`), so the site's `/play/crete/` top bar stays the only bar there. A page opened with `?install` keeps the kit's corner bar, so the slot stays empty then.
- **Remembered fullscreen.** Browsers allow entering full screen only from a gesture, so the preference is applied at Play (a click). `fullscreenchange` is the single writer of the preference, so leaving by holding Esc, the toggle or Quit all record the real state.
- **Dialog Q.** No dialog passes `onDismiss`: Crete's key router is the one owner of Q (`_kit/ui/dialog.tsx` says a game whose router already handles Q should not pass it). Menu and Story have a Close/Back button for pointer and touch players.
- **Inventory panel.** `ui/inventory.tsx` (a side panel with descriptions) is replaced by the tools in `ui/strip.tsx`; each tool's description is its button's `title` and `aria-label`.

## File Structure

Create (all under `websites/www.cs/games/crete/` unless noted):

| File | Responsibility |
|---|---|
| `src/keys.ts` | DOM-free key table: `KEYS`, `Action`, `MOVE_DELTA`, `actionFor`, `itemFor` |
| `src/layers.ts` | DOM-free stack of open cards (`title`, `menu`, `story`, `end`) and the Q rule |
| `src/status.ts` | DOM-free text for the status bar |
| `src/fit.ts` | DOM-free whole-pixel maze cell size |
| `src/help.ts` | DOM-free "How to play" lines with key names from the table |
| `src/settings.ts` | DOM-free sound and fullscreen preferences on the kit's `pref` |
| `src/notes.ts` | Words for a fullscreen toggle's outcome |
| `src/install-slot.ts` | Mounts the kit's install bar into the title card |
| `src/ui/status.tsx`, `src/ui/strip.tsx`, `src/ui/menu.tsx`, `src/ui/story.tsx` | Preact views |
| `test/key-table.test.ts`, `layers.test.ts`, `status.test.ts`, `fit.test.ts`, `help.test.ts`, `settings.test.ts`, `notes.test.ts`, `views.test.ts` | their unit tests |
| `websites/www.cs/tests/e2e/crete-layout.spec.ts` | measures the frame on ten screens |

Modify: `_kit/kit.css`, `_kit/ui/key-chip.tsx`, `_kit/README.md`, `_kit/test/kit-css.test.ts`, `_kit/test/ui.test.ts`, `_kit/ui/dialog.tsx` (one comment); Tankity (`build.json`, `index.html`, `game.css`, `tools/install-files.php`, `src/ui/chrome.tsx`, `src/ui/hud.tsx`, `test/title.test.ts`, `README.md`); Crete (`index.html`, `game.css`, `src/ui.ts`, `src/main.ts`, `src/ui/title.tsx`, `src/ui/end.tsx`, `src/tsconfig.dom.json`, `tsconfig.json`, `test/keys.test.ts`, `test/ui.test.ts`, `test/smoke.test.ts`, `README.md`); e2e (`crete-play.spec.ts`, `games-pwa.spec.ts`, `games-install.spec.ts`, `select.ts`, `select-test.ts`). Delete: `src/ui/inventory.tsx`.

---

### Task 1: Kit key tab

**Files:**
- Modify: `websites/www.cs/games/_kit/kit.css`
- Modify: `websites/www.cs/games/_kit/ui/key-chip.tsx`
- Modify: `websites/www.cs/games/_kit/ui/dialog.tsx` (one comment)
- Test: `websites/www.cs/games/_kit/test/kit-css.test.ts`, `websites/www.cs/games/_kit/test/ui.test.ts`
- Modify: `websites/www.cs/games/_kit/README.md`

**Interfaces:**
- Produces: `KeyChipProps.variant?: 'chip' | 'tab'`; the CSS class `kit-key-tab`; custom properties `--kit-key-tab-position`, `-top`, `-right`, `-height`, `-padding`, `-size`, `-font`, `-color`, `-bg`, `-border`, `-edge`, `-radius`, `-shine`. Tasks 2, 4 and 6 consume the class and the variant.

- [ ] **Step 1: Write the failing tests**

Append to `_kit/test/kit-css.test.ts`:

```ts
test('the key tab is a zero-specificity :where() rule driven by --kit-key-tab-* properties', () => {
  assert.match(css, /:where\(\.kit-key-tab\)\s*\{/);
  for (const name of ['position', 'top', 'right', 'height', 'padding', 'size', 'font', 'color', 'bg', 'border', 'edge', 'radius', 'shine']) {
    assert.ok(css.includes(`var(--kit-key-tab-${name}`), name);
  }
});

test('tabs hide on touch screens, in a game frame under 760px wide, and when empty', () => {
  assert.match(css, /@media \(hover: none\), \(pointer: coarse\)\s*\{\s*:where\(\.kit-key-tab\)\s*\{\s*display:\s*none/);
  assert.match(css, /@container \(max-width: 760px\)\s*\{\s*:where\(\.kit-key-tab\)\s*\{\s*display:\s*none/);
  assert.match(css, /:where\(\.kit-key-tab\):empty\s*\{\s*display:\s*none/);
});
```

Append to `_kit/test/ui.test.ts` after the `'a chip can name its key-table slot ...'` test:

```ts
test('a tab is a key chip with the tab class; a class given is added after it', () => {
  const root = mount();
  render(h('p', null, h(KeyChip, { label: 'H', variant: 'tab' }), h(KeyChip, { label: 'Q', variant: 'tab', class: 'key', at: 'global:back', decorative: true })), root);
  const [a, b] = chips(root);
  assert.ok(a && b);
  assert.deepEqual([a.className, a.textContent, b.className, b.textContent], ['kit-key-tab', 'H', 'kit-key-tab key', 'Q']);
  assert.equal(b.getAttribute('data-keyhint'), 'global:back');
  assert.equal(b.getAttribute('aria-hidden'), 'true');
});

test('the chip variant, named or not, keeps the chip class and a class given replaces it', () => {
  const root = mount();
  render(h('p', null, h(KeyChip, { label: 'A', variant: 'chip' }), h(KeyChip, { label: 'B', variant: 'chip', class: 'cap' })), root);
  const [a, b] = chips(root);
  assert.ok(a && b);
  assert.deepEqual([a.className, b.className], ['kit-key-chip', 'cap']);
});
```

- [ ] **Step 2: Run to verify failure**

Run (from `websites/www.cs/games`): `node --test _kit/test/kit-css.test.ts _kit/test/ui.test.ts`
Expected: the four new tests FAIL (no `.kit-key-tab` rule; variant ignored).

- [ ] **Step 3: Implement**

Append to `_kit/kit.css`:

```css

/* A key as a small label pinned to a button's top corner (ui/key-chip.tsx,
   variant 'tab'). The button must be positioned (position: relative). Zero
   specificity, like the chip: any rule of a game's own wins. Hidden where no
   keyboard is at hand (touch screens), in a game frame under 760px wide
   (an ancestor with container-type: size), and when empty. */
:where(.kit-key-tab) {
  position: var(--kit-key-tab-position, absolute);
  top: var(--kit-key-tab-top, -7px);
  right: var(--kit-key-tab-right, -5px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: var(--kit-key-tab-height, 15px);
  padding: var(--kit-key-tab-padding, 1px 5px 0);
  font: 700 var(--kit-key-tab-size, 9px)/1 var(--kit-key-tab-font, system-ui, -apple-system, "Segoe UI", sans-serif);
  letter-spacing: 0.02em;
  color: var(--kit-key-tab-color, #eef0ff);
  background: var(--kit-key-tab-bg, #14183a);
  border: 1px solid var(--kit-key-tab-border, #3a3f78);
  border-bottom: 2px solid var(--kit-key-tab-edge, #000);
  border-radius: var(--kit-key-tab-radius, 4px);
  box-shadow: 0 1px 0 var(--kit-key-tab-shine, rgba(255, 255, 255, 0.15));
  white-space: nowrap;
  flex: none;
}
:where(.kit-key-tab):empty {
  display: none;
}
@media (hover: none), (pointer: coarse) {
  :where(.kit-key-tab) {
    display: none;
  }
}
@container (max-width: 760px) {
  :where(.kit-key-tab) {
    display: none;
  }
}
```

Replace `_kit/ui/key-chip.tsx` with:

```tsx
// One key, as the player presses it. The kit styles .kit-key-chip and .kit-key-tab (_kit/kit.css, opt-in) and the
// game passes the label from its key table, so a chip can never disagree with the binding.
export interface KeyChipProps {
  label: string;
  /** A chip's class replaces the kit's; a tab's is added after the kit's, so the kit's properties still drive it. */
  class?: string;
  /** The key-table slot it shows ("global:new"), written as data-keyhint. */
  at?: string;
  /** Beside words that already name the action: hidden from screen readers. */
  decorative?: boolean;
  /** 'chip' (default): an inline keycap. 'tab': a small label pinned to the top corner of its button, which must be positioned. */
  variant?: 'chip' | 'tab';
}

export function KeyChip({ label, class: cls, at, decorative, variant }: KeyChipProps) {
  const className = variant === 'tab' ? (cls ? `kit-key-tab ${cls}` : 'kit-key-tab') : (cls ?? 'kit-key-chip');
  return <kbd class={className} data-keyhint={at} aria-hidden={decorative ? 'true' : undefined}>{label}</kbd>;
}
```

In `_kit/ui/dialog.tsx` change the comment `(Crete's Q is Quit)` to `(Crete's Q opens its menu)`.

In `_kit/README.md`, in the table of "The kit stylesheet" add two rows after the `--kit-key-bg` row:

```
| `.kit-key-tab` | a `KeyChip variant="tab"`: a small bold label in a dark rounded box pinned to a positioned button's top corner; hidden on touch screens (`hover: none` or `pointer: coarse`), in a frame under 760px wide (`@container`), and when empty |
| `--kit-key-tab-position`, `-top`, `-right`, `-height`, `-padding`, `-size`, `-font`, `-color`, `-bg`, `-border`, `-edge`, `-radius`, `-shine` | its placement and look; the defaults are Tankity's key caps |
```

and after the paragraph that starts "`:where()` gives `.kit-key-chip` zero specificity" add: "`.kit-key-tab` has zero specificity too. A game that wants a tab in flow sets `--kit-key-tab-position: static` on it; a tab's `class` is added after the kit class (a chip's replaces it)."

- [ ] **Step 4: Run to verify pass**

Run: `node --test _kit/test/kit-css.test.ts _kit/test/ui.test.ts`
Expected: PASS (all tests, including the existing chip tests).

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/_kit
git commit -m "Games kit: a key tab for buttons (KeyChip variant, .kit-key-tab)"
```

---

### Task 2: Tankity wears the kit's key tab

**Files:**
- Modify: `websites/www.cs/games/tankity/build.json`, `index.html`, `game.css`, `tools/install-files.php`, `src/ui/chrome.tsx`, `src/ui/hud.tsx`, `test/title.test.ts`, `README.md`
- Rebuild: `tankity/dist/*`, `tankity/sw.js`, `tankity/index.html` versions
- No change to `tests/e2e/tankity-layout.spec.ts`

**Interfaces:**
- Consumes: Task 1's `KeyChip variant="tab"` and `.kit-key-tab`.
- Produces: every Tankity key label wears `kit-key-tab key`; `dist/kit.css` is linked.

- [ ] **Step 1: Update the one unit assertion that pins the class string**

`tankity/test/title.test.ts` line 59: change `assert.equal(chip.className, 'key');` to `assert.equal(chip.className, 'kit-key-tab key');`. Run `node --test tankity/test/title.test.ts` (from `games`). Expected: FAIL (still `key`).

- [ ] **Step 2: Switch the producers**

`tankity/src/ui/chrome.tsx` line 29: `if (bare) return <KeyChip label={cap} class="key" variant="tab" at={at} decorative />;`

`tankity/src/ui/chrome.tsx` line 66 and `tankity/src/ui/leave.tsx` line 34: `cls="key"` becomes `cls="kit-key-tab key"` (these are `<span>` caps made by `Key`, not `KeyChip`).

`tankity/src/ui/hud.tsx` line 87: `<KeyChip label={p.menuKey} class="key" variant="tab" at="global:back" decorative />`.

`tankity/index.html`: replace every `class="key"` on a `<kbd>` with `class="kit-key-tab key"` (13 places; verify with `grep -c 'class="kit-key-tab key"' tankity/index.html` printing 13 and `grep -c 'class="key"' tankity/index.html` printing 0).

Also find any other producer so none is missed: `grep -rnE "(class|className|cls)[=:]\s*[\"'\`{][^\"'\`]*\bkey\b" tankity/src tankity/index.html` must list only `kit-key-tab key` forms.

- [ ] **Step 3: Reduce Tankity's `.key` rule to display logic and link the sheet**

In `tankity/game.css` replace the whole block from the comment `/* Key chips: one dark keycap ...` through `.key:empty { display: none; }` (lines 105-129) with:

```css
/* Key tabs: the look is the kit's .kit-key-tab (a dark keycap, 15px tall,
   label centred). Tankity keeps them in flow inside their buttons, and only a
   mouse or trackpad means a keyboard is at hand, so only then do they show. */
.key {
  --kit-key-tab-position: static;
  display: none;
}
@media (hover: hover) and (pointer: fine) {
  .key { display: inline-flex; }
}
.key:empty { display: none; }
```

Change `#deck .key { position: absolute; left: 50%; bottom: 3px; transform: translateX(-50%); }` (line ~767) to:

```css
#deck .key { --kit-key-tab-position: absolute; --kit-key-tab-top: auto; --kit-key-tab-right: auto; left: 50%; bottom: 3px; transform: translateX(-50%); }
```

`tankity/build.json`: add `"kitCss": true` after `"entries"` (keep valid JSON: add a comma after the entries array).

`tankity/index.html` line 19: insert before it `<link rel="stylesheet" href="dist/kit.css?v=0000000000">` (the generator rewrites the version).

`tankity/tools/install-files.php`: `'versioned' => ['dist/main.js', 'dist/fx.js', 'dist/install.js', 'dist/kit.css', 'game.css'],`.

`tankity/README.md`: in the "## Layout" paragraph change "at 760 px the key chips go" to "at 760 px the key tabs (the kit's `.kit-key-tab`, worn together with the game's own `key` class) go". Add to the files/build list that the page links `dist/kit.css`.

- [ ] **Step 4: Rebuild and run the unit tests**

```bash
cd websites/www.cs/games
node _kit/build/build.mjs tankity
(cd tankity && php tools/install-files.php)
node --test tankity/test/ui.test.ts tankity/test/title.test.ts tankity/test/fullscreen.test.ts _kit/test/kit-css.test.ts
```

Expected: build prints no type errors; all tests PASS (the 40 `hasClass(..., 'key')` assertions still hold because `key` is still a class).

- [ ] **Step 5: Prove the look did not move**

From `websites/www.cs`, with the local site up (`make up`; it picks an ephemeral port):

```bash
make e2e E2E_ARGS="tankity-layout.spec.ts tankity-pickers.spec.ts"
```

Expected: both PASS with `tankity-layout.spec.ts` unmodified (`git diff --stat -- tests/e2e/tankity-layout.spec.ts` prints nothing). `tankity-pickers.spec.ts` asserts `.key` is visible and hidden on touch. If a chip's centre spread fails, compare the computed style of one `.key` against a page served from an `origin/main` worktree (`git worktree add`, never stash) and diff `getComputedStyle` of `#btn-menu .key` (height 15px, padding, font, border, shadow must match).

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/games/tankity
git commit -m "Tankity: key chips wear the kit's key tab"
```

---

### Task 3: Crete's DOM-free modules

**Files:**
- Create: `crete/src/keys.ts`, `layers.ts`, `status.ts`, `fit.ts`, `help.ts`, `settings.ts`, `notes.ts`
- Create tests: `crete/test/key-table.test.ts`, `layers.test.ts`, `status.test.ts`, `fit.test.ts`, `help.test.ts`, `settings.test.ts`, `notes.test.ts`
- Modify: `crete/tsconfig.json` (DOM-free program), `crete/src/tsconfig.dom.json`

**Interfaces (all later tasks rely on these exact names):**

```ts
// keys.ts
export type MoveAction = 'up' | 'down' | 'left' | 'right';
export type Action = MoveAction | 'hint' | 'route' | 'auto' | 'bash' | 'mute' | 'new' | 'menu';
export interface KeyDef { label: string; keys: readonly string[] }
export const KEYS: Record<Action, KeyDef>;
export const MOVE_DELTA: Record<MoveAction, readonly [number, number]>;
export function actionFor(key: string): Action | null;
export function isMove(a: Action | null): a is MoveAction;
export function itemFor<K extends string>(key: string, items: Record<K, { key: string }>): K | null;

// layers.ts
export type LayerName = 'title' | 'menu' | 'story' | 'end';
export type BackResult = 'closed' | 'opened' | 'kept';
export interface Layers { top(): LayerName | null; isOpen(n: LayerName): boolean; has(n: LayerName): boolean; any(): boolean;
  open(n: LayerName): void; close(n: LayerName): void; clear(): void; pressBack(): BackResult }
export function createLayers(onChange: () => void): Layers;

// status.ts
export interface StatusInput { hp: number; maxHp: number; turns: number; pages: number; totalPages: number; score: number;
  fuses: number; bashCd: number; frozen: number; inSafe: boolean; foeDist: number }
export interface StatusView { hp: string; turns: string; pages: string; score: string; fuses: string; bash: string; foe: string; foeNote: string }
export function statusView(i: StatusInput): StatusView;

// fit.ts
export function fitCell(width: number, height: number, cols: number, rows: number, gap: number): number;

// help.ts
export type Seg = string | { strong: string };
export function helpLines(keys: Record<Action, KeyDef>, itemKeys: readonly string[]): Seg[][];

// settings.ts
export type OnOff = 'on' | 'off';
export const SOUND_KEY = 'crete-sound'; export const FULLSCREEN_KEY = 'crete-fullscreen';
export interface Settings { sound: Pref<OnOff>; fullscreen: Pref<OnOff> }
export function createSettings(storage: StorageLike | null): Settings;

// notes.ts
export function fullscreenNote(outcome: FullscreenToggle): string | null;
```

- [ ] **Step 1: Write the failing tests**

`crete/test/key-table.test.ts`:

```ts
// Crete's key table: one place says which keys do what and what a button's tab prints.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ITEMS } from '../src/engine.ts';
import { KEYS, MOVE_DELTA, actionFor, isMove, itemFor } from '../src/keys.ts';
import type { Action } from '../src/keys.ts';

const ACTIONS = Object.keys(KEYS) as Action[];

test('no key does two things', () => {
  const seen = new Map<string, Action>();
  for (const a of ACTIONS) {
    for (const k of KEYS[a].keys) {
      assert.equal(seen.get(k), undefined, `${k} is on both ${seen.get(k)} and ${a}`);
      seen.set(k, a);
    }
  }
});

test('every label is a short printed word or glyph, and none names Esc', () => {
  for (const a of ACTIONS) {
    const { label } = KEYS[a];
    assert.ok(label.length > 0 && label === label.trim(), a);
    assert.doesNotMatch(label, /esc/i, a);
  }
});

test('presses map to their action whatever the case; Escape maps to nothing', () => {
  assert.equal(actionFor('ArrowUp'), 'up');
  assert.equal(actionFor('W'), 'up');
  assert.equal(actionFor(' '), 'bash');
  assert.equal(actionFor('H'), 'hint');
  assert.equal(actionFor('Escape'), null);
  assert.equal(actionFor('q'), null, 'Q is the kit back key, read with isBackKey');
});

test('the four moves are unit steps and isMove tells them from the rest', () => {
  assert.deepEqual(MOVE_DELTA, { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] });
  assert.equal(isMove('left'), true);
  assert.equal(isMove('hint'), false);
  assert.equal(isMove(null), false);
});

test('a tool is found by the key its definition prints, and no tool key is in the table', () => {
  for (const kind of Object.keys(ITEMS) as (keyof typeof ITEMS)[]) {
    const printed = ITEMS[kind].key;
    assert.equal(itemFor(printed, ITEMS), kind);
    assert.equal(itemFor(printed.toLowerCase(), ITEMS), kind);
    assert.equal(actionFor(printed), null, `${printed} is a tool key and an action key`);
  }
  assert.equal(itemFor('q', ITEMS), null);
});

// Escape is never bound: no source file of the page names it outside a comment.
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const sources = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? sources(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []);
test('no source of the page binds Escape', () => {
  for (const f of sources(join(import.meta.dirname, '..', 'src'))) {
    assert.doesNotMatch(strip(readFileSync(f, 'utf8')), /Escape|['"]esc['"]/i, f);
  }
});
```

`crete/test/layers.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLayers } from '../src/layers.ts';

const make = () => {
  let changes = 0;
  const layers = createLayers(() => { changes++; });
  return { layers, changes: () => changes };
};

test('Q with nothing open opens the menu; the next Q closes it', () => {
  const { layers } = make();
  assert.equal(layers.pressBack(), 'opened');
  assert.equal(layers.top(), 'menu');
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.top(), null);
});

test('Q under the title card does nothing: it has nothing to go back to', () => {
  const { layers, changes } = make();
  layers.open('title');
  const before = changes();
  assert.equal(layers.pressBack(), 'kept');
  assert.equal(layers.top(), 'title');
  assert.equal(changes(), before, 'a kept press changes nothing');
});

test('Settings and Story open over the title card; Q returns to it', () => {
  const { layers } = make();
  layers.open('title');
  layers.open('menu');
  assert.equal(layers.isOpen('menu'), true);
  assert.equal(layers.isOpen('title'), false, 'only the top layer is open');
  assert.equal(layers.has('title'), true);
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.isOpen('title'), true);
  layers.open('story');
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.top(), 'title');
});

test('a run ending puts the ending over the title card; Q reveals the title card, never the menu', () => {
  const { layers } = make();
  layers.open('title');
  layers.open('end');
  assert.equal(layers.top(), 'end');
  assert.equal(layers.pressBack(), 'closed');
  assert.equal(layers.top(), 'title');
  assert.equal(layers.pressBack(), 'kept');
});

test('opening a layer that is already open lifts it to the top once', () => {
  const { layers } = make();
  layers.open('title');
  layers.open('menu');
  layers.open('title');
  assert.equal(layers.top(), 'title');
  layers.close('title');
  assert.equal(layers.top(), 'menu');
});

test('close and clear tell the page only when something changed', () => {
  const { layers, changes } = make();
  layers.close('menu');
  layers.clear();
  assert.equal(changes(), 0);
  layers.open('menu');
  layers.clear();
  assert.equal(layers.any(), false);
  assert.equal(changes(), 2);
});
```

`crete/test/status.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statusView } from '../src/status.ts';
import type { StatusInput } from '../src/status.ts';

const base: StatusInput = { hp: 7, maxHp: 10, turns: 12, pages: 1, totalPages: 3, score: 340, fuses: 2, bashCd: 0, frozen: 0, inSafe: false, foeDist: 6 };

test('plain numbers read as they are', () => {
  assert.deepEqual(statusView(base), {
    hp: '7/10', turns: '12', pages: '1/3', score: '340', fuses: '2', bash: 'ready', foe: '6',
    foeNote: '6 steps away — and it moves twice',
  });
});

test('a recharging bash shows its turns; one step away is singular', () => {
  assert.equal(statusView({ ...base, bashCd: 2 }).bash, '2');
  assert.equal(statusView({ ...base, foeDist: 1 }).foeNote, '1 step away — and it moves twice');
});

test('frozen, safe and lost each say so, in that order of precedence', () => {
  assert.deepEqual(pick(statusView({ ...base, frozen: 2, inSafe: true, foeDist: -1 })), ['❄ 2', 'frozen solid (2 turns)']);
  assert.deepEqual(pick(statusView({ ...base, frozen: 1 })), ['❄ 1', 'frozen solid (1 turn)']);
  assert.deepEqual(pick(statusView({ ...base, inSafe: true, foeDist: -1 })), ['safe', 'pacing outside your safe zone']);
  assert.deepEqual(pick(statusView({ ...base, foeDist: -1 })), ['?', 'lost in the static']);
});
const pick = (v: ReturnType<typeof statusView>) => [v.foe, v.foeNote];
```

`crete/test/fit.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitCell } from '../src/fit.ts';

test('the largest whole cell that fits both ways, gaps included', () => {
  assert.equal(fitCell(400, 400, 15, 15, 2), 24); // (400 - 14 * 2) / 15 = 24.8
  assert.equal(fitCell(800, 300, 15, 15, 2), 18); // the height binds: (300 - 28) / 15 = 18.1
  assert.equal(fitCell(300, 800, 15, 15, 2), 18); // the width binds
});

test('a space too small for the gaps gives 0, never a negative size', () => {
  assert.equal(fitCell(20, 20, 15, 15, 2), 0);
  assert.equal(fitCell(0, 0, 15, 15, 2), 0);
});

test('a drawn maze never exceeds the space', () => {
  for (let size = 60; size <= 900; size += 37) {
    const cell = fitCell(size, size, 15, 15, 2);
    assert.ok(cell * 15 + 28 <= size, String(size));
    assert.ok((cell + 1) * 15 + 28 > size || cell === 0, `${size}: one more px would still fit`);
  }
});
```

`crete/test/help.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEYS } from '../src/keys.ts';
import { helpLines } from '../src/help.ts';
import type { Seg } from '../src/help.ts';

const text = (lines: Seg[][]) => lines.map(l => l.map(s => (typeof s === 'string' ? s : s.strong)).join('')).join('\n');

test('the help names the keys the table prints', () => {
  const all = text(helpLines(KEYS, ['Z', 'X', 'C']));
  for (const a of ['hint', 'route', 'auto', 'bash', 'mute', 'new', 'menu'] as const) {
    assert.ok(all.includes(KEYS[a].label), a);
  }
  assert.ok(all.includes('Z / X / C'));
});

test('a changed table changes the help', () => {
  const keys = { ...KEYS, hint: { ...KEYS.hint, label: 'J' } };
  assert.match(text(helpLines(keys, ['Z'])), /Hint \(J\)/);
});

test('the help never mentions Esc', () => {
  assert.doesNotMatch(text(helpLines(KEYS, ['Z', 'X', 'C'])), /\bEsc/i);
});
```

`crete/test/settings.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { createSettings, FULLSCREEN_KEY, SOUND_KEY } from '../src/settings.ts';

test('defaults: sound on, fullscreen off', () => {
  const s = createSettings(memoryStorage());
  assert.deepEqual([s.sound.get(), s.fullscreen.get()], ['on', 'off']);
});

test('a choice survives a new page', () => {
  const storage = memoryStorage();
  const first = createSettings(storage);
  first.sound.set('off');
  first.fullscreen.set('on');
  assert.equal(storage.data.get(SOUND_KEY), 'off');
  assert.equal(storage.data.get(FULLSCREEN_KEY), 'on');
  const second = createSettings(storage);
  assert.deepEqual([second.sound.get(), second.fullscreen.get()], ['off', 'on']);
});

test('a stored word that is neither on nor off reads as the default', () => {
  const s = createSettings(memoryStorage({ [SOUND_KEY]: 'loud', [FULLSCREEN_KEY]: '1' }));
  assert.deepEqual([s.sound.get(), s.fullscreen.get()], ['on', 'off']);
});

test('storage that throws, or none at all, never throws back and still remembers for the session', () => {
  for (const storage of [throwingStorage(), null]) {
    const s = createSettings(storage);
    assert.equal(s.sound.get(), 'on');
    s.sound.set('off');
    assert.equal(s.sound.get(), 'off');
  }
});
```

`crete/test/notes.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fullscreenNote } from '../src/notes.ts';

test('entering and leaving say nothing; a browser that cannot, or will not, says so', () => {
  assert.equal(fullscreenNote('entered'), null);
  assert.equal(fullscreenNote('left'), null);
  assert.equal(fullscreenNote('unsupported'), 'Full screen is not supported in this browser.');
  assert.equal(fullscreenNote('refused'), 'Full screen is not available right now.');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test crete/test/key-table.test.ts crete/test/layers.test.ts crete/test/status.test.ts crete/test/fit.test.ts crete/test/help.test.ts crete/test/settings.test.ts crete/test/notes.test.ts`
Expected: FAIL with "Cannot find module" for each `../src/*.ts` it imports.

- [ ] **Step 3: Implement the modules**

`crete/src/keys.ts`:

```ts
/* The Island of Crete: the key table. One place says which keys do what and
 * what a button's key tab prints, so a tab can never disagree with its
 * binding. The tools' keys are not here: they come from the engine's ITEMS.
 * Q is the kit's back key (isBackKey) and Escape is not bound. DOM-free. */
import { BACK_KEY } from "../../_kit/keys.ts";

export type MoveAction = "up" | "down" | "left" | "right";
export type Action = MoveAction | "hint" | "route" | "auto" | "bash" | "mute" | "new" | "menu";

export interface KeyDef {
  /** What a button's key tab and the help text print. */
  label: string;
  /** `KeyboardEvent.key` lower-cased, for each press that does it. */
  keys: readonly string[];
}

export const KEYS: Record<Action, KeyDef> = {
  up: { label: "↑", keys: ["arrowup", "w"] },
  down: { label: "↓", keys: ["arrowdown", "s"] },
  left: { label: "←", keys: ["arrowleft", "a"] },
  right: { label: "→", keys: ["arrowright", "d"] },
  hint: { label: "H", keys: ["h"] },
  route: { label: "V", keys: ["v"] },
  auto: { label: "T", keys: ["t"] },
  bash: { label: "Space", keys: [" ", "spacebar"] },
  mute: { label: "M", keys: ["m"] },
  new: { label: "N", keys: ["n"] },
  // Q is read with isBackKey; this row only names it.
  menu: { label: BACK_KEY, keys: [] },
};

export const MOVE_DELTA: Record<MoveAction, readonly [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

const BY_KEY = new Map<string, Action>();
for (const action of Object.keys(KEYS) as Action[]) {
  for (const k of KEYS[action].keys) BY_KEY.set(k, action);
}

/** The action a key press does, or null. */
export function actionFor(key: string): Action | null {
  return BY_KEY.get(key.toLowerCase()) ?? null;
}

export function isMove(a: Action | null): a is MoveAction {
  return a === "up" || a === "down" || a === "left" || a === "right";
}

/** The tool whose printed key this press is, or null. */
export function itemFor<K extends string>(key: string, items: Record<K, { key: string }>): K | null {
  const k = key.toLowerCase();
  return (Object.keys(items) as K[]).find((kind) => items[kind].key.toLowerCase() === k) ?? null;
}
```

`crete/src/layers.ts`:

```ts
/* The Island of Crete: the cards that can be open over the maze, as a stack.
 * Only the top one is shown. Q takes the top one away; with nothing open it
 * opens the menu; the title card ignores it (nothing is under it to go back
 * to). DOM-free. */
export type LayerName = "title" | "menu" | "story" | "end";
/** What a Q press did: closed the top card, opened the menu, or left the title card be. */
export type BackResult = "closed" | "opened" | "kept";

export interface Layers {
  top(): LayerName | null;
  /** True when `name` is the top card: the one a dialog shows. */
  isOpen(name: LayerName): boolean;
  /** True when `name` is anywhere in the stack. */
  has(name: LayerName): boolean;
  any(): boolean;
  /** Puts `name` on top (once). */
  open(name: LayerName): void;
  close(name: LayerName): void;
  clear(): void;
  pressBack(): BackResult;
}

export function createLayers(onChange: () => void): Layers {
  let stack: LayerName[] = [];
  const set = (next: LayerName[]): void => {
    stack = next;
    onChange();
  };
  const top = (): LayerName | null => stack[stack.length - 1] ?? null;
  return {
    top,
    isOpen: (name) => top() === name,
    has: (name) => stack.includes(name),
    any: () => stack.length > 0,
    open: (name) => set([...stack.filter((n) => n !== name), name]),
    close: (name) => {
      if (stack.includes(name)) set(stack.filter((n) => n !== name));
    },
    clear: () => {
      if (stack.length > 0) set([]);
    },
    pressBack() {
      const current = top();
      if (current === "title") return "kept";
      if (current === null) {
        set(["menu"]);
        return "opened";
      }
      set(stack.slice(0, -1));
      return "closed";
    },
  };
}
```

`crete/src/status.ts`:

```ts
/* The Island of Crete: the words of the status bar, short enough for a phone.
 * The long form of the Minotaur's distance is `foeNote`, for a tooltip and a
 * screen reader. DOM-free. */
export interface StatusInput {
  hp: number;
  maxHp: number;
  turns: number;
  pages: number;
  totalPages: number;
  score: number;
  fuses: number;
  /** Turns until Bash is ready again; 0 when ready. */
  bashCd: number;
  /** Turns the creature stays frozen; 0 when it moves. */
  frozen: number;
  inSafe: boolean;
  /** Steps from the player to the creature; -1 when there is no way. */
  foeDist: number;
}

export interface StatusView {
  hp: string;
  turns: string;
  pages: string;
  score: string;
  fuses: string;
  bash: string;
  foe: string;
  foeNote: string;
}

export function statusView(i: StatusInput): StatusView {
  let foe: string;
  let foeNote: string;
  if (i.frozen > 0) {
    foe = `❄ ${i.frozen}`;
    foeNote = `frozen solid (${i.frozen} turn${i.frozen === 1 ? "" : "s"})`;
  } else if (i.inSafe) {
    foe = "safe";
    foeNote = "pacing outside your safe zone";
  } else if (i.foeDist < 0) {
    foe = "?";
    foeNote = "lost in the static";
  } else {
    foe = String(i.foeDist);
    foeNote = `${i.foeDist} step${i.foeDist === 1 ? "" : "s"} away — and it moves twice`;
  }
  return {
    hp: `${i.hp}/${i.maxHp}`,
    turns: String(i.turns),
    pages: `${i.pages}/${i.totalPages}`,
    score: String(i.score),
    fuses: String(i.fuses),
    bash: i.bashCd > 0 ? String(i.bashCd) : "ready",
    foe,
    foeNote,
  };
}
```

`crete/src/fit.ts`:

```ts
/* The Island of Crete: the largest whole-pixel cell for a maze of `cols` x
 * `rows` with `gap` px between cells, in a space of `width` x `height`. 0 when
 * not even the gaps fit. DOM-free. */
export function fitCell(width: number, height: number, cols: number, rows: number, gap: number): number {
  const byWidth = (width - (cols - 1) * gap) / cols;
  const byHeight = (height - (rows - 1) * gap) / rows;
  return Math.max(0, Math.floor(Math.min(byWidth, byHeight)));
}
```

`crete/src/help.ts`:

```ts
/* The Island of Crete: the "How to play" lines. Key names come from the key
 * table and the tools' own keys, so the text can never disagree with a
 * binding. DOM-free. */
import type { Action, KeyDef } from "./keys.ts";

/** A run of plain text, or one in bold. */
export type Seg = string | { strong: string };

export function helpLines(keys: Record<Action, KeyDef>, itemKeys: readonly string[]): Seg[][] {
  const k = (a: Action): string => keys[a].label;
  return [
    ["Reach the ", { strong: "exit 🚪" }, " alive. The Minotaur 👹 moves ", { strong: "twice" }, " per move you make."],
    [
      { strong: "Safe zones 🛡️" },
      " block the Minotaur. Catch your breath there — but lingering beside it still burns 2 HP a turn.",
    ],
    [
      { strong: "Barriers 🚧" },
      " block corridors. Grab a ",
      { strong: "🔌 fuse" },
      " and walk into one to blow it open (+40). Nothing ever pauses.",
    ],
    [
      { strong: `Bash (${k("bash")})` },
      " shoves the adjacent Minotaur backwards. It costs your turn and needs 3 turns to recharge.",
    ],
    [
      "Grab ",
      { strong: "tools 🔮🥣📻" },
      " and ",
      { strong: "script pages 📄" },
      `. Use a tool with ${itemKeys.join(" / ")}; it costs your turn, so the Minotaur still moves twice, unless a Mirror Shard freezes it. Three pages earn the True Ending.`,
    ],
    [
      "Move with the arrow keys or WASD; bumping a wall costs no turn. Stuck? ",
      { strong: `Hint (${k("hint")})` },
      " flashes one step. ",
      { strong: `Route (${k("route")})` },
      " reveals the whole route. ",
      { strong: `Auto (${k("auto")})` },
      " plays for you. ",
      { strong: k("mute") },
      " toggles sound, ",
      { strong: k("new") },
      " starts a new run, and ",
      { strong: k("menu") },
      " opens this menu and closes whatever is open.",
    ],
  ];
}
```

`crete/src/settings.ts`:

```ts
/* The Island of Crete: the settings a player keeps in this browser, on the
 * kit's prefs. Storage that is blocked or missing degrades to the session. */
import { pref, oneOf } from "../../_kit/prefs.ts";
import type { Pref } from "../../_kit/prefs.ts";
import type { StorageLike } from "../../_kit/ports.ts";

export type OnOff = "on" | "off";
export const SOUND_KEY = "crete-sound";
export const FULLSCREEN_KEY = "crete-fullscreen";

export interface Settings {
  sound: Pref<OnOff>;
  /** Whether the player was in full screen last; Play goes back there. */
  fullscreen: Pref<OnOff>;
}

export function createSettings(storage: StorageLike | null): Settings {
  return {
    sound: pref<OnOff>(SOUND_KEY, "on", oneOf<OnOff>(["on", "off"], "on"), storage),
    fullscreen: pref<OnOff>(FULLSCREEN_KEY, "off", oneOf<OnOff>(["on", "off"], "off"), storage),
  };
}
```

`crete/src/notes.ts`:

```ts
/* The Island of Crete: what to tell the player when the Fullscreen toggle
 * does not go full screen. DOM lib program (it names the kit's app types). */
import type { FullscreenToggle } from "../../_kit/app.ts";

export function fullscreenNote(outcome: FullscreenToggle): string | null {
  if (outcome === "unsupported") return "Full screen is not supported in this browser.";
  if (outcome === "refused") return "Full screen is not available right now.";
  return null;
}
```

`crete/tsconfig.json` files: `["src/engine.ts", "src/grid.ts", "src/bots.ts", "src/keys.ts", "src/layers.ts", "src/status.ts", "src/fit.ts", "src/help.ts", "src/settings.ts"]`.

`crete/src/tsconfig.dom.json` files (relative to `src/`): keep the existing list and add `"notes.ts"` (the rest are added in Tasks 4, 5 and 6 as the files appear).

- [ ] **Step 4: Run to verify pass**

Run: `node --test crete/test/key-table.test.ts crete/test/layers.test.ts crete/test/status.test.ts crete/test/fit.test.ts crete/test/help.test.ts crete/test/settings.test.ts crete/test/notes.test.ts` then `node _kit/build/build.mjs crete`.
Expected: all PASS; the build type-checks the DOM-free modules without page types.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/crete
git commit -m "Crete: key table, layer stack, status text, cell fit, help and settings modules"
```

---

### Task 4: Status bar, control strip and menu views

**Files:**
- Create: `crete/src/ui/status.tsx`, `crete/src/ui/strip.tsx`, `crete/src/ui/menu.tsx`
- Create: `crete/test/views.test.ts`
- Modify: `crete/src/tsconfig.dom.json` (add the three files)

**Interfaces:**
- Consumes: Task 1 `KeyChip variant="tab"`; Task 3 `KEYS`, `Action`, `MoveAction`, `StatusView`, `Seg`.
- Produces:

```ts
// ui/status.tsx
export interface StatusProps { view: StatusView; menuKey: string; onMenu: () => void }
export function renderStatus(root: Element, props: StatusProps): void;
// ui/strip.tsx
export interface ToolRow { kind: ItemKind; emoji: string; name: string; key: string; count: number; desc: string; disabled: boolean }
export interface StripProps { tools: ToolRow[]; auto: boolean; route: boolean; over: boolean;
  onMove(dir: MoveAction): void; onHint(): void; onRoute(): void; onAuto(): void; onBash(): void; onTool(kind: ItemKind): void }
export function renderStrip(root: Element, props: StripProps): void;
// ui/menu.tsx
export interface LogLine { text: string; tone?: LogTone }
export interface MenuProps { open: boolean; seed: string; runInfo: string; muted: boolean; fullscreen: boolean; log: LogLine[]; help: Seg[][];
  onSeed(text: string): void; onPlaySeed(): void; onRandom(): void; onSound(): void; onFullscreen(): void; onQuit(): void; onClose(): void }
export function renderMenu(root: Element, props: MenuProps): void;
```
Element ids the CSS and the browser specs use: `hud-hp`, `hud-turns`, `hud-pages`, `hud-score`, `hud-fuses`, `hud-bash`, `hud-dist`, `btn-menu`, `btn-hint`, `btn-route`, `btn-auto`, `btn-bash`, `tool-<kind>`, `menu-veil`, `menu-title`, `menu-close`, `seed-form`, `seed-input`, `seed-play`, `random-run`, `run-stats`, `mute`, `fullscreen`, `log`, `quit`. Menu sections carry `data-section` in the order `seed`, `audio`, `log`, `help`, `quit`.

- [ ] **Step 1: Write the failing tests**

`crete/test/views.test.ts`:

```ts
// Crete's frame views in the DOM stub: the ids the CSS and the browser specs use, the order of the menu, that
// every key tab prints what the key table says, and that each control calls back.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { render as preactRender } from 'preact';
import type { ComponentChildren } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { asElement, byId, click, document, fire, installDocument, makeEl, maybeById, renderTarget, submit, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { ITEMS } from '../src/engine.ts';
import { KEYS } from '../src/keys.ts';
import type { Action } from '../src/keys.ts';
import { statusView } from '../src/status.ts';
import { helpLines } from '../src/help.ts';
import type { StatusProps } from '../src/ui/status.tsx';
import type { StripProps, ToolRow } from '../src/ui/strip.tsx';
import type { MenuProps } from '../src/ui/menu.tsx';

installDocument();
const views = await importTsx<{
  status: typeof import('../src/ui/status.tsx');
  strip: typeof import('../src/ui/strip.tsx');
  menu: typeof import('../src/ui/menu.tsx');
}>(import.meta.dirname, { status: '../src/ui/status.tsx', strip: '../src/ui/strip.tsx', menu: '../src/ui/menu.tsx' });
const renderStatus = (root: StubElement, p: StatusProps): void => views.status.renderStatus(asElement(root), p);
const renderStrip = (root: StubElement, p: StripProps): void => views.strip.renderStrip(asElement(root), p);
const renderMenu = (root: StubElement, p: MenuProps): void => views.menu.renderMenu(asElement(root), p);
const render = (vnode: ComponentChildren, root: StubElement): void => preactRender(vnode, renderTarget(root));

const roots: StubElement[] = [];
const mount = () => { const root = makeEl('root'); roots.push(root); return root; };
afterEach(() => {
  for (const root of roots.splice(0)) render(null, root);
  document.activeElement = null;
  globalThis.__focused = null;
});
const noop = () => {};
const tabsOf = (el: StubElement) => walk(el).filter(n => n.localName === 'kbd');

// ---- status bar ----
const VIEW = statusView({ hp: 7, maxHp: 10, turns: 12, pages: 1, totalPages: 3, score: 340, fuses: 2, bashCd: 0, frozen: 0, inSafe: false, foeDist: 6 });

test('the status bar shows HP, Turns, Pages, Score, Fuses, Bash and the Minotaur, and a Menu button with its Q tab', () => {
  const root = mount();
  let opened = 0;
  renderStatus(root, { view: VIEW, menuKey: KEYS.menu.label, onMenu: () => { opened++; } });
  assert.deepEqual(['hud-hp', 'hud-turns', 'hud-pages', 'hud-score', 'hud-fuses', 'hud-bash', 'hud-dist'].map(id => byId(root, id).textContent),
    ['7/10', '12', '1/3', '340', '2', 'ready', '6']);
  const menu = byId(root, 'btn-menu');
  assert.equal(menu.className, 'menu-btn');
  const [tab] = tabsOf(menu);
  assert.ok(tab);
  assert.equal(tab.className, 'kit-key-tab');
  assert.equal(tab.textContent, KEYS.menu.label);
  assert.equal(tab.getAttribute('aria-hidden'), 'true');
  click(menu);
  assert.equal(opened, 1);
});

// ---- control strip ----
const TOOLS: ToolRow[] = (Object.keys(ITEMS) as (keyof typeof ITEMS)[]).map((kind, i) => ({
  kind, emoji: '·', name: ITEMS[kind].name, key: ITEMS[kind].key, count: i, desc: ITEMS[kind].desc, disabled: i === 0,
}));
function stripProps(over: Partial<StripProps> = {}): StripProps {
  return { tools: TOOLS, auto: false, route: false, over: false, onMove: noop, onHint: noop, onRoute: noop, onAuto: noop, onBash: noop, onTool: noop, ...over };
}

test('every strip button wears a tab that prints what the key table says', () => {
  const root = mount();
  renderStrip(root, stripProps());
  const expected: [string, string][] = [
    ['hint', KEYS.hint.label], ['route', KEYS.route.label], ['auto', KEYS.auto.label], ['bash', KEYS.bash.label],
  ];
  for (const [action, label] of expected) {
    const tab = tabsOf(byId(root, `btn-${action}`))[0];
    assert.ok(tab, action);
    assert.equal(tab.textContent, label, action);
    assert.equal(tab.getAttribute('data-keyhint'), action);
  }
  const pad = walk(root).filter(n => n.className.startsWith('mv mv-'));
  assert.deepEqual(pad.map(b => b.className), ['mv mv-up', 'mv mv-left', 'mv mv-down', 'mv mv-right']);
  const padActions: Action[] = ['up', 'left', 'down', 'right'];
  pad.forEach((b, i) => assert.equal(tabsOf(b)[0]?.textContent, KEYS[padActions[i]!].label));
  for (const row of TOOLS) assert.equal(tabsOf(byId(root, `tool-${row.kind}`))[0]?.textContent, row.key);
});

test('the pad, the actions and the tools call back', () => {
  const root = mount();
  const seen: string[] = [];
  renderStrip(root, stripProps({
    onMove: d => seen.push(`move:${d}`), onHint: () => seen.push('hint'), onRoute: () => seen.push('route'),
    onAuto: () => seen.push('auto'), onBash: () => seen.push('bash'), onTool: k => seen.push(`tool:${k}`),
  }));
  for (const b of walk(root).filter(n => n.className.startsWith('mv '))) click(b);
  for (const id of ['btn-hint', 'btn-route', 'btn-auto', 'btn-bash']) click(byId(root, id));
  click(byId(root, 'tool-snack'));
  assert.deepEqual(seen, ['move:up', 'move:left', 'move:down', 'move:right', 'hint', 'route', 'auto', 'bash', 'tool:snack']);
});

test('an unusable tool cannot be pressed, Route and Auto show when on, and moves stop with the run', () => {
  const root = mount();
  renderStrip(root, stripProps({ auto: true, route: true, over: true }));
  assert.equal(byId(root, 'tool-shard').disabled, true);
  assert.equal(byId(root, 'tool-snack').disabled, false);
  assert.equal(byId(root, 'btn-auto').getAttribute('aria-pressed'), 'true');
  assert.equal(byId(root, 'btn-route').getAttribute('aria-pressed'), 'true');
  assert.equal(byId(root, 'btn-bash').disabled, true);
  assert.equal(walk(root).filter(n => n.className.startsWith('mv ')).every(b => b.disabled), true);
});

test('a tool names itself, its count and what it does to a screen reader', () => {
  const root = mount();
  renderStrip(root, stripProps());
  const row = TOOLS[1]!;
  assert.equal(byId(root, `tool-${row.kind}`).getAttribute('aria-label'), `${row.name} × ${row.count}. ${row.desc}`);
  assert.equal(byId(root, `tool-${row.kind}`).getAttribute('title'), row.desc);
});

// ---- menu ----
function menuProps(over: Partial<MenuProps> = {}): MenuProps {
  return {
    open: true, seed: 'stefan-1984', runInfo: 'Seed stefan-1984 · optimal route 31 moves', muted: false, fullscreen: false,
    log: [{ text: 'Seed stefan-1984.', tone: 'info' }, { text: 'Picked up: Sugar Puffs.', tone: 'good' }],
    help: helpLines(KEYS, ['Z', 'X', 'C']),
    onSeed: noop, onPlaySeed: noop, onRandom: noop, onSound: noop, onFullscreen: noop, onQuit: noop, onClose: noop, ...over,
  };
}

test('the menu holds the seed box, sound and full screen, the story log, how to play and Quit, in that order', () => {
  const root = mount();
  renderMenu(root, menuProps());
  const veil = byId(root, 'menu-veil');
  assert.equal(veil.hidden, false);
  assert.equal(byId(root, 'menu-title').textContent, 'Menu');
  assert.deepEqual(walk(veil).map(n => n.getAttribute('data-section')).filter(Boolean), ['seed', 'audio', 'log', 'help', 'quit']);
});

test('the menu waits hidden until opened, and a first button takes focus so Q still closes it', () => {
  const root = mount();
  renderMenu(root, menuProps({ open: false }));
  assert.equal(byId(root, 'menu-veil').hidden, true);
  renderMenu(root, menuProps({ open: true }));
  assert.equal(globalThis.__focused?.id, 'menu-close', 'not the seed box: a letter typed there is only a letter');
});

test('the seed box shows the seed, reports typing, plays it on Enter or the button, and Random ignores it', () => {
  const root = mount();
  const seen: string[] = [];
  renderMenu(root, menuProps({ onSeed: t => seen.push(`seed:${t}`), onPlaySeed: () => seen.push('play'), onRandom: () => seen.push('random') }));
  const input = byId(root, 'seed-input');
  assert.equal(input.value, 'stefan-1984');
  input.value = 'abc';
  fire(input, 'input');
  submit(byId(root, 'seed-form'));
  click(byId(root, 'seed-play'));
  click(byId(root, 'random-run'));
  assert.deepEqual(seen, ['seed:abc', 'play', 'play', 'random']);
  assert.equal(byId(root, 'run-stats').textContent, 'Seed stefan-1984 · optimal route 31 moves');
});

test('Sound shows its state and key; Full screen, Quit and Close call back', () => {
  const root = mount();
  const seen: string[] = [];
  renderMenu(root, menuProps({ muted: true, onSound: () => seen.push('sound'), onFullscreen: () => seen.push('full'), onQuit: () => seen.push('quit'), onClose: () => seen.push('close') }));
  assert.match(byId(root, 'mute').textContent, /Muted/);
  assert.equal(tabsOf(byId(root, 'mute'))[0]?.textContent, KEYS.mute.label);
  assert.equal(tabsOf(byId(root, 'menu-close'))[0]?.textContent, KEYS.menu.label);
  for (const id of ['mute', 'fullscreen', 'quit', 'menu-close']) click(byId(root, id));
  assert.deepEqual(seen, ['sound', 'full', 'quit', 'close']);
  renderMenu(root, menuProps({ fullscreen: true }));
  assert.match(byId(root, 'fullscreen').textContent, /Leave full screen/);
});

test('the story log lists every line; how to play comes from the help lines', () => {
  const root = mount();
  renderMenu(root, menuProps());
  const lines = byId(root, 'log').children.map(c => (c as StubElement).textContent);
  assert.deepEqual(lines, ['Seed stefan-1984.', 'Picked up: Sugar Puffs.']);
  const help = walk(byId(root, 'menu-veil')).filter(n => n.className === 'help');
  assert.equal(help.length, 1);
  assert.equal(help[0]!.children.length, helpLines(KEYS, ['Z']).length);
  assert.equal(maybeById(root, 'inventory'), undefined);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test crete/test/views.test.ts`
Expected: FAIL (cannot find `../src/ui/status.tsx`).

- [ ] **Step 3: Implement the views**

`crete/src/ui/status.tsx`:

```tsx
// The Island of Crete: the status bar. src/ui.ts hands it finished words (src/status.ts); this draws them
// and reports a press of Menu.
import { render } from 'preact';
import { Button } from '../../../_kit/ui/button.tsx';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';
import type { StatusView } from '../status.ts';

export interface StatusProps {
  view: StatusView;
  /** The Menu button's key tab (the key table's Q). */
  menuKey: string;
  onMenu: () => void;
}

type Field = Exclude<keyof StatusView, 'foeNote'>;
const STATS: { id: string; field: Field; label: string }[] = [
  { id: 'hud-hp', field: 'hp', label: 'HP' },
  { id: 'hud-turns', field: 'turns', label: 'Turns' },
  { id: 'hud-pages', field: 'pages', label: 'Pages' },
  { id: 'hud-score', field: 'score', label: 'Score' },
  { id: 'hud-fuses', field: 'fuses', label: 'Fuses' },
  { id: 'hud-bash', field: 'bash', label: 'Bash' },
  { id: 'hud-dist', field: 'foe', label: 'Minotaur' },
];

export function Status(p: StatusProps) {
  return (
    <>
      <dl class="hud">
        {STATS.map(s => (
          <div class="stat" key={s.id} title={s.field === 'foe' ? p.view.foeNote : undefined}>
            <dt>{s.field === 'foe' ? <><span aria-hidden="true">👹</span><span class="sr">{s.label}</span></> : s.label}</dt>
            <dd id={s.id}>{p.view[s.field]}</dd>
          </div>
        ))}
      </dl>
      <Button id="btn-menu" class="menu-btn" onClick={p.onMenu}>
        Menu<KeyChip variant="tab" label={p.menuKey} at="menu" decorative />
      </Button>
    </>
  );
}

export function renderStatus(root: Element, props: StatusProps): void {
  render(<Status {...props} />, root);
}
```

`crete/src/ui/strip.tsx`:

```tsx
// The Island of Crete: the control strip. The move pad, Hint, Route, Auto, Bash and the three tools with their
// counts, each with a key tab printed from the key table (the tools' from their own definition). src/ui.ts
// builds the rows; this draws them and reports presses.
import { render } from 'preact';
import { Button } from '../../../_kit/ui/button.tsx';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';
import { KEYS } from '../keys.ts';
import type { Action, MoveAction } from '../keys.ts';
import type { ItemKind } from '../engine.ts';

export interface ToolRow {
  kind: ItemKind;
  emoji: string;
  name: string;
  /** The key the engine's definition prints. */
  key: string;
  count: number;
  desc: string;
  disabled: boolean;
}

export interface StripProps {
  tools: ToolRow[];
  /** The play-through is running. */
  auto: boolean;
  /** The whole route is drawn. */
  route: boolean;
  /** The run has ended: moves and Bash wait for a new one. */
  over: boolean;
  onMove: (dir: MoveAction) => void;
  onHint: () => void;
  onRoute: () => void;
  onAuto: () => void;
  onBash: () => void;
  onTool: (kind: ItemKind) => void;
}

const PAD: { dir: MoveAction; glyph: string; name: string }[] = [
  { dir: 'up', glyph: '▲', name: 'Move up' },
  { dir: 'left', glyph: '◀', name: 'Move left' },
  { dir: 'down', glyph: '▼', name: 'Move down' },
  { dir: 'right', glyph: '▶', name: 'Move right' },
];

function Tab({ action }: { action: Action }) {
  return <KeyChip variant="tab" label={KEYS[action].label} at={action} decorative />;
}

export function Strip(p: StripProps) {
  return (
    <>
      <div class="pad" role="group" aria-label="Movement">
        {PAD.map(m => (
          <Button key={m.dir} class={`mv mv-${m.dir}`} label={m.name} disabled={p.over} onClick={() => p.onMove(m.dir)}>
            {m.glyph}<Tab action={m.dir} />
          </Button>
        ))}
      </div>
      <div class="actions" role="group" aria-label="Actions">
        <Button id="btn-hint" title="Flash your next step" onClick={p.onHint}>Hint<Tab action="hint" /></Button>
        <Button id="btn-route" title="Show the whole route" pressed={p.route} onClick={p.onRoute}>Route<Tab action="route" /></Button>
        <Button id="btn-auto" title="Play for you" pressed={p.auto} onClick={p.onAuto}>Auto<Tab action="auto" /></Button>
        <Button id="btn-bash" title="Shove the adjacent Minotaur backwards" disabled={p.over} onClick={p.onBash}>Bash<Tab action="bash" /></Button>
        {p.tools.map(t => (
          <Button key={t.kind} id={`tool-${t.kind}`} class="tool" label={`${t.name} × ${t.count}. ${t.desc}`} title={t.desc}
            disabled={t.disabled} onClick={() => p.onTool(t.kind)}>
            <span aria-hidden="true">{t.emoji}</span><span class="n" aria-hidden="true">{t.count}</span>
            <KeyChip variant="tab" label={t.key} at={`item:${t.kind}`} decorative />
          </Button>
        ))}
      </div>
    </>
  );
}

export function renderStrip(root: Element, props: StripProps): void {
  render(<Strip {...props} />, root);
}
```

`crete/src/ui/menu.tsx`:

```tsx
// The Island of Crete: the menu. In order: the seed box, sound and full screen, the story log, how to play, Quit.
// Q (the kit's back key) is handled by src/ui.ts, which owns every card, so the dialog is given no onDismiss;
// the Close button is for a pointer or a finger.
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';
import type { Seg } from '../help.ts';
import type { LogTone } from '../engine.ts';

export interface LogLine {
  text: string;
  tone?: LogTone;
}

export interface MenuProps {
  open: boolean;
  /** The seed box's text. */
  seed: string;
  /** The run's facts under the seed box. */
  runInfo: string;
  muted: boolean;
  fullscreen: boolean;
  log: LogLine[];
  help: Seg[][];
  onSeed: (text: string) => void;
  onPlaySeed: () => void;
  onRandom: () => void;
  onSound: () => void;
  onFullscreen: () => void;
  onQuit: () => void;
  onClose: () => void;
}

const segs = (line: Seg[]) => line.map(s => (typeof s === 'string' ? s : <strong>{s.strong}</strong>));

export function Menu(p: MenuProps) {
  const list = useRef<HTMLOListElement>(null);
  // Newest line in view whenever the menu opens or a line arrives.
  useLayoutEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [p.open, p.log.length]);
  return (
    <Dialog open={p.open} id="menu-veil" veilClass="veil" panelClass="card menu" kicker="The Island of Crete" kickerClass="kicker"
      titleId="menu-title" title="Menu">
      <Button id="menu-close" class="close" label="Close menu" keyLabel={KEYS.menu.label} onClick={p.onClose}>✕</Button>
      <form id="seed-form" class="menu-sec seedbox" data-section="seed" action="#"
        onSubmit={ev => { ev.preventDefault(); p.onPlaySeed(); }}>
        <label for="seed-input">Seed</label>
        <input id="seed-input" name="seed" type="text" inputMode="text" autocomplete="off" spellcheck={false}
          placeholder="e.g. stefan-1984" value={p.seed} onInput={ev => p.onSeed(ev.currentTarget.value)} />
        <Button id="seed-play" onClick={p.onPlaySeed}>Play this seed</Button>
        <Button id="random-run" title="Ignore the seed box and start on a fresh random seed" onClick={p.onRandom}>🎲 Random seed</Button>
        <p id="run-stats" class="runstats">{p.runInfo}</p>
      </form>
      <div class="menu-sec" data-section="audio">
        <Button id="mute" keyLabel={KEYS.mute.label} onClick={p.onSound}>{p.muted ? '🔇 Muted' : '🔊 Sound'}</Button>
        <Button id="fullscreen" onClick={p.onFullscreen}>{p.fullscreen ? 'Leave full screen' : 'Full screen'}</Button>
      </div>
      <section class="menu-sec" data-section="log">
        <h3>Story log</h3>
        <ol id="log" class="log" aria-live="polite" ref={list}>
          {p.log.map((l, i) => <li key={i} class={l.tone}>{l.text}</li>)}
        </ol>
      </section>
      <section class="menu-sec" data-section="help">
        <h3>How to play</h3>
        <ul class="help">
          {p.help.map((line, i) => <li key={i}>{segs(line)}</li>)}
        </ul>
      </section>
      <div class="menu-sec" data-section="quit">
        <Button id="quit" title="End this run and leave the game" onClick={p.onQuit}>⏻ Quit</Button>
      </div>
    </Dialog>
  );
}

export function renderMenu(root: Element, props: MenuProps): void {
  render(<Menu {...props} />, root);
}
```

`crete/src/tsconfig.dom.json` files: add `"ui/status.tsx"`, `"ui/strip.tsx"`, `"ui/menu.tsx"`.

- [ ] **Step 4: Run to verify pass**

Run: `node --test crete/test/views.test.ts` then `node _kit/build/build.mjs crete`.
Expected: PASS. If the stub does not deliver `fire(input, 'input')` to Preact's `onInput` listener, the listener name is `input`; check `walk` output and fix the test's event name, not the view.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/crete
git commit -m "Crete: status bar, control strip and menu views"
```

---

### Task 5: Title card with Story and Settings, the story card, the install slot

**Files:**
- Modify: `crete/src/ui/title.tsx`, `crete/src/ui/end.tsx`
- Create: `crete/src/ui/story.tsx`, `crete/src/install-slot.ts`
- Modify: `crete/test/ui.test.ts` (title and end tests), `crete/test/views.test.ts` (story test), `crete/src/tsconfig.dom.json`

**Interfaces:**
- Consumes: Task 3 `KEYS`; Task 4 `Button`/`Dialog` patterns; `_kit/ui/install-bar.tsx` `mountInstallBar`, `_kit/install.ts` `asksInstall`, `browserInstallEnv`.
- Produces:

```ts
// ui/title.tsx
export interface TitleCardProps { open: boolean; hint: boolean; onPlay: () => void; onStory?: () => void; onSettings?: () => void }
// Story and Settings buttons (#title-story, #title-settings) render only when their callback is given.
// The card holds <div id="title-install"> for the kit's install bar.
// ui/story.tsx
export interface StoryProps { open: boolean; onClose: () => void }
export const STORY: readonly string[];
export function renderStoryCard(root: Element, props: StoryProps): void;
// install-slot.ts
export function mountTitleInstall(win: Window, slot: Element | null): void;
```

- [ ] **Step 1: Write the failing tests**

In `crete/test/ui.test.ts`, change the three title-card calls and add tests. Replace the two title tests at the end of the file with:

```ts
test('the title card names the game and focuses Play; Play calls back', () => {
  const root = makeEl('title-root');
  let played = 0;
  renderTitleCard(root, { open: false, hint: false, onPlay: () => { played++; } });
  assert.equal(byId(root, 'title-veil').hidden, true);
  renderTitleCard(root, { open: true, hint: false, onPlay: () => { played++; } });
  assert.equal(byId(root, 'title-veil').hidden, false);
  assert.equal(byId(root, 'title-name').textContent, 'The Island of Crete');
  assert.equal(maybeById(root, 'title-hint'), undefined);
  assert.equal(globalThis.__focused?.id, 'title-play');
  assert.equal(byId(root, 'title-play').textContent, `▶ Play (${KEYS.new.label})`);
  click(byId(root, 'title-play'));
  assert.equal(played, 1);
});

test('Story and Settings appear when the page gives them, and call back', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: false, onPlay() {} });
  assert.equal(maybeById(root, 'title-story'), undefined);
  assert.equal(maybeById(root, 'title-settings'), undefined);
  const seen: string[] = [];
  renderTitleCard(root, { open: true, hint: false, onPlay() {}, onStory: () => seen.push('story'), onSettings: () => seen.push('settings') });
  assert.equal(byId(root, 'title-story').textContent, 'Story');
  assert.equal(byId(root, 'title-settings').textContent, 'Settings');
  click(byId(root, 'title-story'));
  click(byId(root, 'title-settings'));
  assert.deepEqual(seen, ['story', 'settings']);
});

test('the title card keeps a slot for the kit install bar', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: false, onPlay() {} });
  assert.equal(byId(root, 'title-install').className, 'title-install');
});

test('an installed app that could not close says how to', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: true, onPlay() {} });
  assert.equal(byId(root, 'title-hint').textContent, 'Swipe the app away to close it.');
});
```

and add `import { KEYS } from '../src/keys.ts';` to its imports. The existing end-card test already asserts `'Play again (N)'`; leave it (the label now comes from `KEYS.new.label`, which is `N`).

Append to `crete/test/views.test.ts`:

```ts
// ---- story ----
test('the story card tells the myth, closes with a button, and waits hidden until opened', async () => {
  const story = await importTsx<{ s: typeof import('../src/ui/story.tsx') }>(import.meta.dirname, { s: '../src/ui/story.tsx' });
  const root = mount();
  let closed = 0;
  story.s.renderStoryCard(asElement(root), { open: false, onClose: () => { closed++; } });
  assert.equal(byId(root, 'story-veil').hidden, true);
  story.s.renderStoryCard(asElement(root), { open: true, onClose: () => { closed++; } });
  assert.equal(byId(root, 'story-veil').hidden, false);
  assert.equal(byId(root, 'story-title').textContent, 'The Labyrinth');
  const text = walk(byId(root, 'story-veil')).filter(n => n.className === 'story-text').map(n => n.textContent).join(' ');
  for (const word of ['Minos', 'Labyrinth', 'ship']) assert.ok(text.includes(word), word);
  assert.equal(globalThis.__focused?.id, 'story-close');
  click(byId(root, 'story-close'));
  assert.equal(closed, 1);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test crete/test/ui.test.ts crete/test/views.test.ts`
Expected: FAIL (`title-story` missing, `story.tsx` missing, title label lacks the key table).

- [ ] **Step 3: Implement**

Replace `crete/src/ui/title.tsx` with:

```tsx
// The Island of Crete: the title card. Shown when the page opens, after Quit, and under the ending card. Play
// starts a run; Story and Settings open the story card and the menu when the page gives them; the kit's install
// bar mounts into #title-install (src/install-slot.ts).
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { EXIT_HINT } from '../../../_kit/app.ts';
import { KEYS } from '../keys.ts';

export interface TitleCardProps {
  open: boolean;
  /** An installed app that could not close itself: say how to. */
  hint: boolean;
  onPlay: () => void;
  onStory?: () => void;
  onSettings?: () => void;
}

export function TitleCard(p: TitleCardProps) {
  return (
    <Dialog open={p.open} id="title-veil" veilClass="veil" panelClass="card" kicker="Minotaur chase" kickerClass="kicker"
      titleId="title-name" title="The Island of Crete" focusId="title-play">
      <p>A text-based chase. Theseus (you) moves once. The Minotaur moves twice. Reach the exit alive.</p>
      {p.hint && <p id="title-hint" class="runstats" role="status">{EXIT_HINT}.</p>}
      <div class="title-actions">
        <Button id="title-play" onClick={p.onPlay}>{`▶ Play (${KEYS.new.label})`}</Button>
        {p.onStory && <Button id="title-story" onClick={p.onStory}>Story</Button>}
        {p.onSettings && <Button id="title-settings" onClick={p.onSettings}>Settings</Button>}
      </div>
      <div id="title-install" class="title-install" />
    </Dialog>
  );
}

export function renderTitleCard(root: Element, props: TitleCardProps): void {
  render(<TitleCard {...props} />, root);
}
```

In `crete/src/ui/end.tsx` add `import { KEYS } from '../keys.ts';` and change the button to `<Button id="again" onClick={p.onAgain}>{`Play again (${KEYS.new.label})`}</Button>`.

`crete/src/ui/story.tsx`:

```tsx
// The Island of Crete: the story card, the title card's short intro in the myth's voice.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';

export interface StoryProps {
  open: boolean;
  onClose: () => void;
}

export const STORY: readonly string[] = [
  'Crete, long ago. King Minos keeps the Labyrinth beneath his palace, and in the Labyrinth he keeps the Minotaur: half bull, all appetite, quicker than anything that has tried to cross it.',
  'Every ninth year a tribute ship comes in from Athens, and what it carries does not leave the island. This year Theseus walks down the gangway himself, and he does not mean to stay.',
  'The walls turn. The creature takes two steps for each of yours. There are pages scattered in the dark, a door somewhere, and nobody to ask the way. Run.',
];

export function StoryCard(p: StoryProps) {
  return (
    <Dialog open={p.open} id="story-veil" veilClass="veil" panelClass="card" kicker="Story" kickerClass="kicker"
      titleId="story-title" title="The Labyrinth" focusId="story-close">
      {STORY.map((t, i) => <p key={i} class="story-text">{t}</p>)}
      <Button id="story-close" keyLabel={KEYS.menu.label} onClick={p.onClose}>Back</Button>
    </Dialog>
  );
}

export function renderStoryCard(root: Element, props: StoryProps): void {
  render(<StoryCard {...props} />, root);
}
```

`crete/src/install-slot.ts`:

```ts
/* The Island of Crete: the kit's Install and Share bar, mounted into the title card. On the site's /play/ page the
 * game runs in a frame, where the bar draws nothing (the page's own top bar is the bar); on a page opened with
 * ?install the kit's corner bar is the one, so the slot stays empty. DOM lib program. */
import { mountInstallBar } from "../../_kit/ui/install-bar.tsx";
import { asksInstall, browserInstallEnv } from "../../_kit/install.ts";

export function mountTitleInstall(win: Window, slot: Element | null): void {
  if (!slot || asksInstall(win.location.search)) return;
  // games/<id>/ is shared as its site page, ../../play/<id>/.
  const folder = new URL("./", win.location.href);
  const id = folder.pathname.split("/").filter(Boolean).pop() ?? "";
  mountInstallBar(slot, {
    title: win.document.title,
    shareUrl: new URL(`../../play/${id}/`, folder).href,
    installPage: null,
    promptsHere: true,
    asked: false,
  }, browserInstallEnv());
}
```

`crete/src/tsconfig.dom.json` files: add `"ui/story.tsx"`, `"install-slot.ts"`.

- [ ] **Step 4: Run to verify pass**

Run: `node --test crete/test/ui.test.ts crete/test/views.test.ts` then `node _kit/build/build.mjs crete`.
Expected: PASS and a clean type-check. `ui.ts` still compiles (the new title props are optional).

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/crete
git commit -m "Crete: title card gains Story and Settings; story card; install slot"
```

---

### Task 6: The frame: markup, styles, ui.ts and main.ts

This is the one task that changes the page. Everything it wires is already tested.

**Files:**
- Replace: `crete/index.html`, `crete/game.css`, `crete/src/ui.ts`
- Modify: `crete/src/main.ts`, `crete/src/tsconfig.dom.json`
- Delete: `crete/src/ui/inventory.tsx`
- Modify tests: `crete/test/keys.test.ts` (rewrite), `crete/test/ui.test.ts` (remove inventory tests), `crete/test/smoke.test.ts` (add)

**Interfaces:**
- Consumes: everything from Tasks 3 to 5.
- Produces:

```ts
export interface Controls { game: Game; restart(seed: string): void; toggleMute(): void; toggleFullscreen(): void; wake(): void; quit(): void; play(): void }
export interface Ui {
  say(text: string, tone?: LogTone): void; render(game: Game): void; showEnd(game: Game, won: boolean): void;
  clearLog(): void; showSeed(seed: string): void; setMuted(muted: boolean): void; setFullscreen(on: boolean): void;
  bindControls(controls: Controls): void; showTitle(hint: boolean): void; closeLayers(): void; top(): LayerName | null;
}
```
(`hideEnd`, `hideTitle` and `setMuteLabel` are gone; `closeLayers` replaces the first two, `setMuted` the third.)

- [ ] **Step 1: Write the failing tests**

Replace `crete/test/keys.test.ts` with:

```ts
// Crete's keyboard: Q is the kit's back key (it opens the menu, closes what is open, and the title card keeps it),
// a letter typed into the seed box is only a letter, game keys wait while a card is up, and Escape is never bound.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { fireDocument, installDocument } from '../../_kit/test/dom-stub.ts';
import { ITEMS } from '../src/engine.ts';
import type { Game } from '../src/engine.ts';
import type { Controls, UiDeps } from '../src/ui.ts';

installDocument();
const { ui } = await importTsx<{ ui: typeof import('../src/ui.ts') }>(import.meta.dirname, { ui: '../src/ui.ts' });

const calls: string[] = [];
const note = (name: string) => () => { calls.push(name); };
// Only the members the key handler touches; the cast says so.
const game = {
  G: { over: false, auto: false },
  toggleAuto: note('auto'), toggleAnswer: note('route'), hint: note('hint'), bash: note('bash'),
  tryMove: note('move'), useItem: note('item'), stopAuto: note('stop'),
} as unknown as Game;
const controls: Controls = {
  game, restart: note('restart'), toggleMute: note('mute'), toggleFullscreen: note('fullscreen'),
  wake: note('wake'), quit: note('quit'), play: note('play'),
};
// createUi keeps these for drawing; the key handler reads only ITEMS.
const deps = { ROWS: 1, COLS: 1, MAX_HP: 1, TOTAL_PAGES: 1, ITEMS, key: () => '', heart: () => {} } as unknown as UiDeps;
const page = ui.createUi(deps);
page.bindControls(controls);

beforeEach(() => { page.closeLayers(); });

const press = (key: string, extra: Record<string, unknown> = {}) => {
  calls.length = 0;
  const ev = fireDocument('keydown', { key, target: { tagName: 'DIV' }, ...extra });
  return { ev, calls: calls.filter(c => c !== 'wake' && c !== 'stop') };
};

test('Q opens the menu, the next Q closes it, and neither quits the game', () => {
  for (const key of ['q', 'Q']) {
    const first = press(key);
    assert.equal(page.top(), 'menu', key);
    assert.deepEqual(first.calls, [], key);
    assert.equal(first.ev.prevented, true);
    press(key);
    assert.equal(page.top(), null, key);
  }
});

test('Q under the title card does nothing; N and M still reach the game', () => {
  page.showTitle(false);
  assert.deepEqual(press('q').calls, []);
  assert.equal(page.top(), 'title');
  assert.deepEqual(press('n').calls, ['restart']);
  assert.deepEqual(press('m').calls, ['mute']);
});

test('a held Q acts once, and a chord with Ctrl, Cmd or Alt is the browser\'s', () => {
  assert.deepEqual(press('q', { repeat: true }).calls, []);
  assert.equal(page.top(), null);
  for (const chord of ['ctrlKey', 'metaKey', 'altKey']) {
    press('q', { [chord]: true });
    assert.equal(page.top(), null, chord);
  }
  press('q', { isComposing: true });
  assert.equal(page.top(), null);
});

test('keys typed into the seed box, or a textarea, do nothing, Q included', () => {
  for (const tagName of ['INPUT', 'TEXTAREA']) {
    for (const key of ['q', 'n', 'm', 'h', ' ', 'ArrowUp']) {
      const { ev, calls } = press(key, { target: { tagName, type: tagName === 'INPUT' ? 'text' : undefined } });
      assert.deepEqual(calls, [], `${tagName} ${key}`);
      assert.equal(ev.prevented, false);
      assert.equal(page.top(), null, `${tagName} ${key} opened a card`);
    }
  }
});

test('Escape does nothing, with nothing open and with the menu open', () => {
  for (const open of [false, true]) {
    if (open) press('q');
    const { ev, calls } = press('Escape');
    assert.deepEqual(calls, []);
    assert.equal(ev.prevented, false);
    assert.equal(page.top(), open ? 'menu' : null);
  }
});

test('game keys wait while a card is up; Q, N and M do not', () => {
  press('q');
  for (const key of ['h', 'v', 't', ' ', 'ArrowUp']) assert.deepEqual(press(key).calls, [], key);
  assert.deepEqual(press(ITEMS.shard.key.toLowerCase()).calls, []);
  assert.deepEqual(press('m').calls, ['mute']);
  assert.deepEqual(press('n').calls, ['restart']);
});

test('with nothing open, the other keys reach the game, and a tool key uses its tool', () => {
  assert.deepEqual(press('m').calls, ['mute']);
  assert.deepEqual(press('h').calls, ['hint']);
  assert.deepEqual(press('v').calls, ['route']);
  assert.deepEqual(press('t').calls, ['auto']);
  assert.deepEqual(press('ArrowUp').calls, ['move']);
  assert.deepEqual(press('s').calls, ['move']);
  assert.deepEqual(press(' ').calls, ['bash']);
  for (const kind of Object.keys(ITEMS) as (keyof typeof ITEMS)[]) assert.deepEqual(press(ITEMS[kind].key).calls, ['item'], kind);
});
```

In `crete/test/ui.test.ts` delete the inventory tests (`ROWS`, `'the inventory is a panel ...'`, `'an empty or unusable item ...'`, `'closing the ending card after a Use click ...'`), the `renderInventory` helper, the `InventoryRow`/`InventoryProps` type imports, `inventory` from the `importTsx` map, and the now-unused `mock`, `childEl` or `elementOf` imports the compiler flags (`found` stays only if still used; delete it if not). The strip tests in `views.test.ts` replace them.

Append to `crete/test/smoke.test.ts`:

```ts
test('the page is one frame: no header, side panels or seed form outside the menu, and the cards are inside it', () => {
  const html = read('index.html');
  for (const gone of ['class="topbar"', 'class="side"', 'id="seed-form"', 'id="hud-hp"', 'id="inventory-root"', '<h1']) {
    assert.ok(!html.includes(gone), gone);
  }
  const frame = html.slice(html.indexOf('<div id="frame"'), html.indexOf('<script type="module"'));
  assert.ok(frame.length > 0, 'a #frame');
  for (const id of ['status-root', 'board', 'stage', 'toast', 'strip-root', 'title-root', 'menu-root', 'story-root', 'end-root']) {
    assert.ok(frame.includes(`id="${id}"`), `${id} inside #frame`);
  }
});

test('the frame is a size container, so the kit key tabs and the phone layouts can ask its size', () => {
  assert.match(read('game.css'), /#frame\s*\{[^}]*container:\s*frame\s*\/\s*size/);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test crete/test/keys.test.ts crete/test/smoke.test.ts`
Expected: FAIL (`closeLayers` is not a function; `index.html` still has `class="topbar"`).

- [ ] **Step 3: Replace the markup**

`crete/index.html`, keep the `<head>` exactly as it is (the app-tags block, the manifest and the two `?v=` links stay) and replace everything from `<body>` through `</body>` with:

```html
  <body>
    <div id="frame">
      <header id="status-root" class="status" aria-label="Status"></header>
      <main id="board" class="board" aria-label="Maze">
        <div
          id="stage"
          class="stage"
          role="img"
          aria-label="Maze grid. Your position, the Minotaur, the exit, safe zones, barriers and items are announced in the log and status bar."
        ></div>
        <p id="toast" class="toast" role="status" aria-live="polite"></p>
      </main>
      <div id="strip-root" class="strip"></div>
      <div id="title-root"></div>
      <div id="menu-root"></div>
      <div id="story-root"></div>
      <div id="end-root"></div>
    </div>

    <script type="module" src="dist/main.js?v=fe857973ac"></script>
    <script src="dist/install.js?v=3534d0bdd2" defer></script>
  </body>
```

- [ ] **Step 4: Replace the stylesheet**

`crete/game.css`:

```css
:root {
  --bg: #0d1117;
  --panel: #161b22;
  --ink: #e6edf3;
  --dim: #9aa4b2;
  --line: #30363d;
  --accent: #f0b429;
  --good: #3fb950;
  --bad: #f85149;
  --safe: #58a6ff;
  --player: #ffd700;
}

* { box-sizing: border-box; }

html, body { height: 100%; margin: 0; overflow: hidden; overscroll-behavior: none; }

body {
  background: var(--bg);
  color: var(--ink);
  font: 16px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

button {
  background: var(--accent);
  color: #1a1a1a;
  border: none;
  border-radius: 6px;
  padding: 0.45rem 0.8rem;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
button:hover { filter: brightness(1.08); }
button:focus-visible, input:focus-visible { outline: 3px solid var(--safe); outline-offset: 2px; }
button:disabled { opacity: 0.45; cursor: default; }

input[type="text"] {
  background: var(--bg);
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  font: inherit;
}

/* The frame fills the window: status bar, maze, control strip. It is a size
   container, which the kit's key tabs and the phone layouts below ask. */
#frame {
  position: fixed;
  inset: 0;
  container: frame / size;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  background: var(--bg);
  overflow: hidden;
}
#title-root, #menu-root, #story-root, #end-root { display: contents; }

/* ---- status bar ---- */
.status {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 6px 10px;
  border-bottom: 1px solid var(--line);
}
.hud { display: flex; flex: 1 1 auto; flex-wrap: wrap; gap: 2px 14px; min-width: 0; margin: 0; }
.stat { display: flex; gap: 0.35rem; align-items: baseline; white-space: nowrap; }
.stat dt { color: var(--dim); font-size: 0.8rem; }
.stat dd { margin: 0; font-weight: 700; font-variant-numeric: tabular-nums; }

/* Buttons that carry a key tab are positioned, so the tab pins to their corner. */
.menu-btn, .strip button {
  position: relative;
  background: var(--panel);
  color: var(--ink);
  border: 1px solid var(--line);
}
.menu-btn:hover, .strip button:hover { border-color: var(--accent); filter: none; }
.menu-btn { flex: none; min-height: 36px; margin-right: 6px; }
.strip button[aria-pressed="true"] { border-color: var(--accent); color: var(--accent); }

/* ---- maze ---- */
.board {
  position: relative;
  min-width: 0;
  min-height: 0;
  display: grid;
  place-items: center;
  padding: 6px;
  overflow: hidden;
}
/* src/ui.ts sets --cell to the largest whole pixel size that fits the board. */
.stage {
  --gap: 2px;
  display: grid;
  grid-auto-rows: var(--cell, 16px);
  gap: var(--gap);
  background: #010409;
  border-radius: 6px;
  user-select: none;
  font-size: calc(var(--cell, 16px) * 0.7);
  line-height: 1;
}
.stage .cell {
  width: var(--cell, 16px);
  height: var(--cell, 16px);
  display: grid;
  place-items: center;
  background: #0a0e14;
  border-radius: 3px;
  overflow: hidden;
}
.stage .p { background: #3a2f00; }
.stage .c { background: #3d0a0a; }
.stage .e { background: #3a2c00; }
.stage .s { background: #0a2540; }
.stage .g { background: #241a38; }
.stage .i { background: #0c2b18; }
.stage .hm { outline: 3px solid var(--accent); outline-offset: -3px; }
.stage .rt { box-shadow: inset 0 0 0 2px var(--good); }

.toast {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  max-width: min(92%, 34rem);
  margin: 0;
  padding: 0.3rem 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
  background: rgba(1, 4, 9, 0.9);
  border: 1px solid var(--line);
  border-radius: 999px;
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.toast.show { opacity: 1; }
.toast.good { border-color: var(--good); }
.toast.bad { border-color: var(--bad); }
.toast.info { border-color: var(--safe); }

/* ---- control strip ---- */
.strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px 10px;
  border-top: 1px solid var(--line);
}
.strip button { min-width: 44px; min-height: 44px; padding: 0 0.8rem; }
.pad {
  display: grid;
  grid-template-columns: repeat(3, 44px);
  grid-template-areas: ". up ." "left down right";
  gap: 6px;
  flex: none;
}
.pad button { padding: 0; }
.mv-up { grid-area: up; }
.mv-left { grid-area: left; }
.mv-down { grid-area: down; }
.mv-right { grid-area: right; }
.actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px 10px; }
.tool .n { margin-left: 0.3rem; font-weight: 700; }

/* ---- cards: title, menu, story, ending ---- */
.veil {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(1, 4, 9, 0.78);
}
.veil[hidden] { display: none; }
.card {
  position: relative;
  width: 100%;
  max-width: 34rem;
  max-height: 100%;
  overflow-y: auto;
  padding: 1.25rem 1.4rem;
  background: var(--panel);
  border: 1px solid var(--accent);
  border-radius: 12px;
}
.card h2 { margin: 0.2rem 0 0.5rem; }
.kicker { margin: 0; color: var(--accent); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.8rem; }
.runstats { color: var(--dim); font-size: 0.9rem; }
.title-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.8rem; }
.title-install { margin-top: 0.8rem; }
.story-text { margin: 0 0 0.7rem; }
.card .close { float: right; margin: -0.3rem -0.3rem 0 0.5rem; }

.menu h3 { margin: 0 0 0.3rem; font-size: 1rem; color: var(--accent); }
.menu-sec { margin: 0.9rem 0 0; }
.menu-sec > button { margin-right: 0.4rem; }
.seedbox { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.seedbox label { color: var(--dim); }
.seedbox input { flex: 1 1 8rem; min-width: 0; max-width: 100%; }
.seedbox .runstats { flex: 1 1 100%; margin: 0; overflow-wrap: anywhere; }
.help { margin: 0; padding-left: 1.1rem; }
.help li { margin-bottom: 0.35rem; }
.log { list-style: none; margin: 0; padding: 0; max-height: 12rem; overflow-y: auto; display: grid; gap: 0.35rem; }
.log li { border-left: 3px solid var(--line); padding-left: 0.55rem; }
.log li.good { border-color: var(--good); }
.log li.bad { border-color: var(--bad); }
.log li.info { border-color: var(--safe); }

/* ---- phones ---- */
/* Portrait: the status bar in two rows, the strip under the maze. */
@container frame (max-width: 760px) and (orientation: portrait) {
  .status { align-items: flex-start; }
  .hud { display: grid; grid-template-columns: repeat(4, minmax(0, auto)); gap: 2px 10px; }
  .stat { flex-direction: column; align-items: flex-start; gap: 0; }
  .strip { flex-wrap: wrap; justify-content: center; gap: 8px 12px; padding: 12px 10px 10px; }
  .actions { flex: 1 1 10rem; justify-content: center; gap: 8px; }
}

/* Landscape: the pad and the actions float over the maze's lower corners. */
@container frame (orientation: landscape) and (max-height: 500px) {
  .status { padding: 2px 8px; }
  .hud { display: flex; flex-wrap: nowrap; gap: 0 10px; }
  .stat { flex-direction: row; align-items: baseline; gap: 0.3rem; }
  .stat dt { font-size: 0.7rem; }
  .stat dd { font-size: 0.85rem; }
  .menu-btn { min-height: 30px; padding: 0 0.6rem; }
  .board { padding: 4px; }
  .strip {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    align-items: flex-end;
    flex-wrap: nowrap;
    padding: 0 8px 8px;
    border: 0;
    pointer-events: none;
  }
  .strip button { pointer-events: auto; min-width: 40px; min-height: 40px; padding: 0 0.4rem; background: rgba(22, 27, 34, 0.92); }
  .pad { grid-template-columns: repeat(3, 40px); gap: 4px; }
  .actions { display: grid; grid-template-columns: repeat(3, auto); justify-content: end; gap: 4px; }
}

@media (prefers-reduced-motion: reduce) {
  .toast { transition: none; }
}
```

- [ ] **Step 5: Replace `ui.ts`**

`crete/src/ui.ts`:

```ts
/* The Island of Crete: the page. Draws the board, the status bar, the strip,
 * the toast and the cards, and turns keys and clicks into game actions. It
 * reads the engine's state and calls its actions; it holds no rules. Only the
 * engine's types are imported; `createUi` takes the values it borrows as
 * arguments. Needs the DOM lib, so it is in the second program
 * (src/tsconfig.dom.json).
 */
import { isBackKey, typesText } from "../../_kit/keys.ts";
import type { Game, ItemDef, ItemKind, LogTone } from "./engine.ts";
import { KEYS, MOVE_DELTA, actionFor, isMove, itemFor } from "./keys.ts";
import { createLayers } from "./layers.ts";
import type { LayerName } from "./layers.ts";
import { statusView } from "./status.ts";
import { fitCell } from "./fit.ts";
import { helpLines } from "./help.ts";
import { renderEndCard } from "./ui/end.tsx";
import type { EndView } from "./ui/end.tsx";
import { renderMenu } from "./ui/menu.tsx";
import type { LogLine } from "./ui/menu.tsx";
import { renderStatus } from "./ui/status.tsx";
import { renderStoryCard } from "./ui/story.tsx";
import { renderStrip } from "./ui/strip.tsx";
import type { ToolRow } from "./ui/strip.tsx";
import { renderTitleCard } from "./ui/title.tsx";

/** What the page borrows from the engine at run time. */
export interface UiDeps {
  ROWS: number;
  COLS: number;
  MAX_HP: number;
  TOTAL_PAGES: number;
  ITEMS: Record<ItemKind, ItemDef>;
  /** The key a cell goes by in the engine's sets. */
  key(r: number, c: number): string;
  /** The heartbeat sound for a creature close by. */
  heart(): void;
}

/** What a key press or click asks of the page. */
export interface Controls {
  game: Game;
  /** A new run on this seed ("" for a fresh random one). */
  restart(seed: string): void;
  toggleMute(): void;
  toggleFullscreen(): void;
  /** Wake the speakers: any gesture does. */
  wake(): void;
  /** Leave the game (the menu's Quit). */
  quit(): void;
  /** Play on the title card. */
  play(): void;
}

export interface Ui {
  /** A line for the toast and the story log. */
  say(text: string, tone?: LogTone): void;
  render(game: Game): void;
  /** The ending card, over the title card. */
  showEnd(game: Game, won: boolean): void;
  clearLog(): void;
  /** Put the run's seed in the seed box and in the address. */
  showSeed(seed: string): void;
  setMuted(muted: boolean): void;
  setFullscreen(on: boolean): void;
  bindControls(controls: Controls): void;
  /** The title card, alone; `hint` adds how to close an installed app. */
  showTitle(hint: boolean): void;
  /** Closes every card. */
  closeLayers(): void;
  /** The card showing now, if any. */
  top(): LayerName | null;
}

const LOOT_EMOJI: Record<string, string> = {
  shard: "🔮",
  snack: "🥣",
  jammer: "📻",
  page: "📄",
  fuse: "🔌",
};

const LOG_LIMIT = 80;
const TOAST_MS = 4000;

const $ = (id: string): HTMLElement => document.getElementById(id)!;

export function createUi(deps: UiDeps): Ui {
  const { ROWS, COLS, MAX_HP, TOTAL_PAGES, ITEMS, key } = deps;
  const itemKinds = Object.keys(ITEMS) as ItemKind[];
  const itemKeys = itemKinds.map((k) => ITEMS[k].key);

  const log: LogLine[] = [];
  let seedText = "";
  let runInfo = "";
  let muted = false;
  let full = false;
  let toastTimer = 0;
  let controls: Controls | null = null;
  let game: Game | null = null;
  let end: EndView = { open: false, kicker: "", title: "", text: "", score: "" };
  let titleHint = false;

  const layers = createLayers(() => {
    if (layers.any()) game?.stopAuto();
    drawLayers();
  });

  function drawLayers(): void {
    renderTitleCard($("title-root"), {
      open: layers.isOpen("title"),
      hint: titleHint,
      onPlay: () => controls?.play(),
      onStory: () => layers.open("story"),
      onSettings: () => layers.open("menu"),
    });
    renderEndCard($("end-root"), {
      ...end,
      open: layers.isOpen("end"),
      onAgain: () => controls?.restart(seedText),
    });
    renderStoryCard($("story-root"), { open: layers.isOpen("story"), onClose: () => layers.close("story") });
    renderMenu($("menu-root"), {
      open: layers.isOpen("menu"),
      seed: seedText,
      runInfo,
      muted,
      fullscreen: full,
      log,
      help: helpLines(KEYS, itemKeys),
      onSeed: (text) => {
        seedText = text;
        drawLayers();
      },
      onPlaySeed: () => controls?.restart(seedText),
      onRandom: () => {
        controls?.wake();
        controls?.restart("");
      },
      onSound: () => {
        controls?.wake();
        controls?.toggleMute();
      },
      onFullscreen: () => controls?.toggleFullscreen(),
      onQuit: () => {
        controls?.wake();
        controls?.quit();
      },
      onClose: () => layers.close("menu"),
    });
  }

  function say(text: string, tone?: LogTone): void {
    log.push(tone ? { text, tone } : { text });
    while (log.length > LOG_LIMIT) log.shift();
    const toast = $("toast");
    toast.textContent = text;
    toast.className = tone ? `toast show ${tone}` : "toast show";
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), TOAST_MS);
    if (layers.isOpen("menu")) drawLayers();
  }

  /** The cell size: the largest whole pixel count that fits the space the board has left. */
  function fit(): void {
    const board = $("board");
    const stage = $("stage");
    const bs = getComputedStyle(board);
    const w = board.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight);
    const h = board.clientHeight - parseFloat(bs.paddingTop) - parseFloat(bs.paddingBottom);
    const gap = parseFloat(getComputedStyle(stage).columnGap) || 0;
    stage.style.setProperty("--cell", `${Math.max(1, fitCell(w, h, COLS, ROWS, gap))}px`);
  }

  function toolRows(g: Game): ToolRow[] {
    const G = g.G;
    return itemKinds.map((kind) => {
      const def = ITEMS[kind];
      const useNote = kind === "shard" ? " Move right after." : " Using it costs your turn.";
      return {
        kind,
        emoji: LOOT_EMOJI[kind] ?? "🎁",
        name: def.name,
        key: def.key,
        count: G.inv[kind],
        desc: (kind === "snack" ? `Heal ${G.snackHeal} HP.` : def.desc) + useNote,
        disabled: G.over || G.inv[kind] <= 0,
      };
    });
  }

  function render(g: Game): void {
    game = g;
    const G = g.G;
    const { walls, safe, barriers, pickups, player, foe, exit } = G;
    const stage = $("stage");
    stage.style.gridTemplateColumns = `repeat(${COLS}, var(--cell, 16px))`;
    const route = new Set(G.showRoute ? g.goalPath().map((p) => key(p.r, p.c)) : []);
    let html = "";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const k = key(r, c);
        let ch = walls[r]![c] ? "⬛" : "";
        let cls = "cell";
        if (!walls[r]![c] && r === exit.r && c === exit.c) {
          ch = "🚪";
          cls += " e";
        }
        if (safe.has(k)) {
          ch = "🛡️";
          cls += " s";
        }
        if (pickups.has(k)) {
          ch = LOOT_EMOJI[pickups.get(k)!] || "🎁";
          cls += " i";
        }
        if (barriers.has(k)) {
          ch = "🚧";
          cls += " g";
        }
        if (r === foe.r && c === foe.c && !(r === player.r && c === player.c)) {
          ch = G.frozen > 0 ? "🥶" : "👹";
          cls += " c";
        }
        if (r === player.r && c === player.c) {
          ch = "🧑‍💻";
          cls += " p";
        }
        if (route.has(k)) cls += " rt";
        if (G.hint === k) cls += " hm";
        html += `<span class="${cls}">${ch}</span>`;
      }
    }
    stage.innerHTML = html;
    fit();

    const d = g.foeDistance();
    if (!G.over && G.turns > 0 && d >= 0 && d <= 4) deps.heart();
    renderStatus($("status-root"), {
      view: statusView({
        hp: G.hp,
        maxHp: MAX_HP,
        turns: G.turns,
        pages: G.pages,
        totalPages: TOTAL_PAGES,
        score: G.score,
        fuses: G.fuses,
        bashCd: G.bashCd,
        frozen: G.frozen,
        inSafe: safe.has(key(player.r, player.c)),
        foeDist: d,
      }),
      menuKey: KEYS.menu.label,
      onMenu: () => layers.open("menu"),
    });

    const act = (fn: () => void) => (): void => {
      controls?.wake();
      fn();
    };
    renderStrip($("strip-root"), {
      tools: toolRows(g),
      auto: G.auto,
      route: G.showRoute,
      over: G.over,
      onMove: (dir) => {
        controls?.wake();
        if (G.auto || layers.any()) return;
        const [dr, dc] = MOVE_DELTA[dir];
        g.tryMove(dr, dc);
      },
      onHint: act(() => g.hint()),
      onRoute: act(() => g.toggleAnswer()),
      onAuto: act(() => g.toggleAuto()),
      onBash: act(() => g.bash()),
      onTool: (kind) => act(() => g.useItem(kind))(),
    });

    runInfo =
      `Seed ${G.seed} · optimal route ${G.optimal} moves ` +
      `· Sugar Puffs heal ${G.snackHeal} · creature pace 2/turn, spawned ${G.foeSpawnDist} away`;
    if (layers.isOpen("menu")) drawLayers();
  }

  /* ---------- endings: the title card waits under the ending card ---------- */
  function showEnd(g: Game, won: boolean): void {
    const G = g.G;
    let title: string, text: string;
    if (won && G.pages >= TOTAL_PAGES) {
      title = "True Ending: Shut Down the Maze";
      text =
        "Every page recovered, every choice owned. Theseus ships the game, " +
        "and the creature starves outside the safe zones. Five stars in Whitehead’s review.";
    } else if (won && G.pages > 0) {
      title = "Lesser Escape: Out, But Thin";
      text =
        `You reached the exit with ${G.pages}/${TOTAL_PAGES} pages. The game ships with bugs, ` +
        "and something still rustles in the code. It works — barely.";
    } else if (won) {
      title = "Bare Survival: The Hallway Ending";
      text =
        "You escaped with no pages and no proof. Nobody believes the maze was real. " +
        "The creature waits for your sequel.";
    } else {
      title = "Taken: The PAX Ending";
      text = G.deathCause || "The creature reached you.";
    }
    end = {
      open: true,
      kicker: won ? "You escaped" : "Run over — permadeath, no continues",
      title,
      text,
      score:
        `Score ${G.score} · ${G.turns} turns · pages ${G.pages}/${TOTAL_PAGES} · ` +
        `barriers opened ${G.opened} · seed ${G.seed}`,
    };
    titleHint = false;
    layers.open("title");
    layers.open("end");
    render(g);
  }

  function showTitle(hint: boolean): void {
    titleHint = hint;
    layers.clear();
    layers.open("title");
  }

  function showSeed(seed: string): void {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("seed", seed);
      window.history.replaceState(null, "", url);
    } catch (_) {
      /* file:// or sandbox: the seed box still shows it */
    }
    seedText = seed;
    drawLayers();
  }

  /* ---------- input: moves, tools, bash, and guides never share a key ---------- */
  function bindControls(c: Controls): void {
    controls = c;
    game = c.game;
    const G = c.game.G;
    document.addEventListener("keydown", (ev) => {
      if (typesText(ev.target)) return;
      const tag = (ev.target as HTMLElement | null)?.tagName;
      c.wake();
      if (isBackKey(ev)) {
        ev.preventDefault();
        if (!ev.repeat) layers.pressBack();
        return;
      }
      const k = ev.key.toLowerCase();
      const action = actionFor(k);
      if (action === "new") {
        ev.preventDefault();
        c.restart(seedText);
        return;
      }
      if (action === "mute") {
        c.toggleMute();
        return;
      }
      // A card is up: only Q, N and M reach the game.
      if (layers.any()) return;
      if (action === "auto") {
        ev.preventDefault();
        c.game.toggleAuto();
        return;
      }
      if (action === "route") {
        c.game.toggleAnswer();
        return;
      }
      if (action === "hint") {
        c.game.hint();
        return;
      }
      if (G.over || G.auto) return;
      if (action === "bash") {
        if (tag === "BUTTON") return;
        ev.preventDefault();
        c.game.bash();
        return;
      }
      if (isMove(action)) {
        ev.preventDefault();
        const [dr, dc] = MOVE_DELTA[action];
        c.game.tryMove(dr, dc);
        return;
      }
      const item = itemFor(k, ITEMS);
      if (item) {
        ev.preventDefault();
        c.game.useItem(item);
      }
    });

    document.addEventListener("pointerdown", c.wake);

    if (typeof ResizeObserver === "function") new ResizeObserver(fit).observe($("board"));
    if (typeof window !== "undefined") window.addEventListener("resize", fit);
  }

  drawLayers();
  return {
    say,
    render,
    showEnd,
    showSeed,
    bindControls,
    showTitle,
    closeLayers: () => layers.clear(),
    top: () => layers.top(),
    setMuted: (m) => {
      muted = m;
      drawLayers();
    },
    setFullscreen: (on) => {
      full = on;
      drawLayers();
    },
    clearLog: () => {
      log.length = 0;
      $("toast").className = "toast";
      if (layers.isOpen("menu")) drawLayers();
    },
  };
}
```

- [ ] **Step 6: Update `main.ts`**

Replace `crete/src/main.ts` from the imports through `start()` with the following (the test hook block at the bottom is unchanged):

```ts
/* Entry: wires engine, audio and UI, starts a run, and exposes window.__mazeTest
 * for the browser specs. */
import {
  createGame, bfsDist, bfsPath, key, ROWS, COLS, MAX_HP, TOTAL_PAGES, ITEMS,
} from './engine.ts';
import { createAudio } from './audio.ts';
import { createUi } from './ui.ts';
import { createSettings } from './settings.ts';
import { fullscreenNote } from './notes.ts';
import { mountTitleInstall } from './install-slot.ts';
import { browserStorage, browserTimers } from '../../_kit/ports.browser.ts';
import { exitApp, toggleFullscreen as toggleKitFullscreen, browserAppEnv, holdEscape, topKeyLock } from '../../_kit/app.ts';
import { followPage } from '../../_kit/page-life.ts';

declare global {
  interface Window {
    __mazeTest?: Record<string, unknown>;
  }
}

const audio = createAudio();
const settings = createSettings(browserStorage());
const appEnv = browserAppEnv();
const ui = createUi({
  ROWS, COLS, MAX_HP, TOTAL_PAGES, ITEMS, key,
  heart: () => audio.sfx('heart'),
});
const game = createGame({
  say: ui.say,
  sfx: audio.sfx,
  render: () => ui.render(game),
  showEnd: won => ui.showEnd(game, won),
  timers: browserTimers,
});
const G = game.G;
const frame = (): HTMLElement => document.getElementById('frame') ?? document.documentElement;

/* The maze behind the title card: the first Play starts it, so a link with ?seed= replays its maze;
   every later Play is a random seed. */
let openSeed = '';

function toggleMute(): void {
  const muted = audio.toggleMute();
  ui.setMuted(muted);
  settings.sound.set(muted ? 'off' : 'on');
  ui.say(muted ? 'Sound off.' : 'Sound on.', 'info');
}

function toggleFullscreen(): void {
  void toggleKitFullscreen(appEnv, frame()).then(outcome => {
    const note = fullscreenNote(outcome);
    if (note) ui.say(note, 'info');
  });
}

/* The one writer of the fullscreen setting, and the Esc lock: in full screen the browser takes Esc to leave it.
   No key of the game is Esc (Q is back), but a player may press it from habit; where Keyboard Lock exists,
   a tap then does nothing and only holding Esc leaves (_kit/app.ts holdEscape). */
function onFullscreenChange(): void {
  const on = !!appEnv.fullscreenElement();
  ui.setFullscreen(on);
  settings.fullscreen.set(on ? 'on' : 'off');
  void holdEscape(on, topKeyLock(window), msg => console.warn(msg));
}
document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('webkitfullscreenchange', onFullscreenChange);

function restart(seedStr: string): void {
  ui.closeLayers();
  game.stopAuto();
  game.clearHint();
  game.newRun(seedStr);
  ui.clearLog();
  ui.say(`Seed ${G.seed}. Theseus boots the maze. The exit 🚪 glows in the dark.`, 'info');
  ui.say(`Shortest escape is ${G.optimal} moves. It will find you on the way: plan for the meeting.`, 'info');
  ui.say('Two 🛡️ safe zones wait on the escape route. The 👹 already moves twice to your once.', 'info');
  ui.showSeed(G.seed);
  ui.render(game);
}

/* Play on the title card. A click is the gesture that lets a remembered full screen return. */
function play(): void {
  if (settings.fullscreen.get() === 'on' && !appEnv.fullscreenElement()) toggleFullscreen();
  const seed = openSeed;
  openSeed = '';
  restart(seed);
}

/* Quit (the menu's): the run ends; an installed app closes where it may, and otherwise
   (always in a browser tab) the title card shows. */
async function quit(): Promise<void> {
  ui.closeLayers();
  game.quit();
  const outcome = await exitApp(appEnv);
  // A new run started inside the close wait: the card would cover it.
  if (outcome !== 'closed' && game.G.over) ui.showTitle(outcome === 'title-with-hint');
}

function start(): void {
  ui.bindControls({
    game, restart, toggleMute, toggleFullscreen, wake: audio.ensure, quit: () => { void quit(); }, play,
  });
  let seed = '';
  try {
    seed = new URL(window.location.href).searchParams.get('seed') || '';
  } catch (_) {
    /* ignore */
  }
  if (settings.sound.get() === 'off') {
    audio.toggleMute();
    ui.setMuted(true);
  }
  restart(seed);
  openSeed = G.seed;
  ui.showTitle(false);
  mountTitleInstall(window, document.getElementById('title-install'));
}
// A hidden tab runs no play-through step and no hint fade; showing it again picks them up.
followPage({ doc: document, win: window }, { hide: game.pause, show: game.resume });
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
```

(The block from `/* Test hook for automated checks` to the end stays as it is.)

- [ ] **Step 7: Wire the build**

`crete/src/tsconfig.dom.json` files: `["audio.ts", "ui.ts", "ui/end.tsx", "ui/menu.tsx", "ui/status.tsx", "ui/story.tsx", "ui/strip.tsx", "ui/title.tsx", "notes.ts", "install-slot.ts", "main.ts"]`.

Delete `crete/src/ui/inventory.tsx`: `git rm websites/www.cs/games/crete/src/ui/inventory.tsx`.

- [ ] **Step 8: Run to verify pass**

```bash
cd websites/www.cs/games
node _kit/build/build.mjs crete
bash units.sh
```

Expected: the build type-checks all three programs and writes `crete/dist/*`; `units.sh` PASS, including the new `keys.test.ts` and `smoke.test.ts` tests. Then confirm no rule changed: `git diff origin/main -- crete/src/engine.ts crete/src/grid.ts crete/src/bots.ts` prints nothing.

- [ ] **Step 9: Commit**

```bash
git add websites/www.cs/games/crete
git commit -m "Crete: one game frame (status bar, maze, strip, toast, cards) with Q layering and kept settings"
```

---

### Task 7: Browser specs

**Files:**
- Create: `websites/www.cs/tests/e2e/crete-layout.spec.ts`
- Modify: `websites/www.cs/tests/e2e/crete-play.spec.ts`, `games-pwa.spec.ts`, `games-install.spec.ts`, `select.ts`, `select-test.ts`

**Interfaces:**
- Consumes: Task 6's ids (`#title-play`, `#btn-menu`, `#menu-veil`, `#mute`, `#fullscreen`, `#quit`, `#toast`, `#btn-hint`, `#tool-<kind>`, `.mv-right`, `#hud-*`, `#stage .cell`).

- [ ] **Step 1: Write `crete-layout.spec.ts`**

```ts
// The Island of Crete on ten screens: the frame fills the window, nothing scrolls, every control is on screen
// and not clipped, no control covers the maze, the maze keeps at least 8 px per cell, and key tabs show only
// where a keyboard is at hand (a mouse, and a frame at least 760 px wide).
import { test, expect } from '@playwright/test';
import type { Browser } from '@playwright/test';

type Device = [name: string, width: number, height: number, touch: boolean];
const DEVICES: Device[] = [
  ['Desktop', 1280, 720, false], ['Laptop, small window', 1024, 640, false],
  ['Tablet, landscape', 1180, 820, true], ['Tablet, portrait', 820, 1180, true],
  ['iPhone 15, portrait', 393, 852, true], ['Small Android, portrait', 360, 740, true],
  ['iPhone SE, portrait', 320, 568, true],
  ['iPhone 15, landscape', 852, 393, true], ['Small Android, landscape', 740, 360, true],
  ['iPhone SE, landscape', 568, 320, true],
];
const CONTROLS = 12; // Menu, four pad buttons, Hint, Route, Auto, Bash, three tools

async function open(browser: Browser, [, width, height, touch]: Device) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('games/crete/?seed=play-1');
  await page.waitForSelector('#stage .cell');
  return { ctx, page, errors };
}

/** The widest values the status bar can show. */
function setWorst() {
  const put = (id: string, v: string) => { document.getElementById(id)!.textContent = v; };
  put('hud-hp', '100/100'); put('hud-turns', '99999'); put('hud-pages', '3/3'); put('hud-score', '-98760');
  put('hud-fuses', '99'); put('hud-bash', 'ready'); put('hud-dist', '❄ 9');
}

function measure() {
  const probs: string[] = [];
  const doc = document.documentElement;
  if (doc.scrollHeight > innerHeight + 0.5) probs.push(`page taller than the screen by ${doc.scrollHeight - innerHeight}px`);
  if (doc.scrollWidth > innerWidth + 0.5) probs.push(`page wider than the screen by ${doc.scrollWidth - innerWidth}px`);
  const inside = (r: DOMRect) => r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5;
  const shown = (el: Element) => el.getClientRects().length > 0;
  const stage = document.getElementById('stage')!.getBoundingClientRect();
  if (!inside(stage)) probs.push('the maze is off screen');
  const cell = document.querySelector('#stage .cell')!.getBoundingClientRect();
  if (cell.width < 8) probs.push(`cells are ${cell.width}px`);
  const controls = [...document.querySelectorAll<HTMLElement>('#status-root button, #strip-root button')];
  if (controls.length !== 12) probs.push(`${controls.length} controls`);
  for (const el of controls) {
    const name = el.id || el.className;
    if (!shown(el)) { probs.push(`${name} hidden`); continue; }
    const r = el.getBoundingClientRect();
    if (!inside(r)) probs.push(`${name} off screen`);
    if (el.scrollWidth > el.clientWidth + 0.5) probs.push(`${name} clipped`);
    const overlaps = r.left < stage.right - 0.5 && r.right > stage.left + 0.5 && r.top < stage.bottom - 0.5 && r.bottom > stage.top + 0.5;
    if (overlaps) probs.push(`${name} covers the maze`);
  }
  for (const stat of document.querySelectorAll<HTMLElement>('#status-root .stat')) {
    if (!inside(stat.getBoundingClientRect())) probs.push(`${stat.querySelector('dd')!.id} off screen`);
    if (stat.scrollWidth > stat.clientWidth + 0.5) probs.push(`${stat.querySelector('dd')!.id} clipped`);
  }
  return probs;
}

const tabsShown = () => [...document.querySelectorAll('.kit-key-tab')].filter(el => el.getClientRects().length > 0).length;
const cardFits = (sel: string) => {
  const card = document.querySelector(sel)!.getBoundingClientRect();
  return card.left >= -0.5 && card.top >= -0.5 && card.right <= innerWidth + 0.5 && card.bottom <= innerHeight + 0.5;
};

for (const device of DEVICES) {
  const [name, width, , touch] = device;
  test(`${name}: the frame fits, the maze keeps 8 px cells, tabs follow the keyboard`, async ({ browser }) => {
    const { ctx, page, errors } = await open(browser, device);
    // The title card first: its card and its buttons are on screen.
    await expect(page.locator('#title-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#title-veil .card'), 'title card on screen').toBe(true);
    for (const id of ['title-play', 'title-story', 'title-settings']) await expect(page.locator(`#${id}`)).toBeVisible();
    await page.locator('#title-play').click();
    await expect(page.locator('#title-veil')).toBeHidden();

    await page.evaluate(setWorst);
    expect(await page.evaluate(measure)).toEqual([]);
    const tabs = await page.evaluate(tabsShown);
    if (touch || width < 760) expect(tabs, 'no key tabs without a keyboard or under 760 px').toBe(0);
    else expect(tabs).toBe(CONTROLS);

    // The menu is a card that fits and scrolls inside itself, never the page.
    await page.locator('#btn-menu').click();
    await expect(page.locator('#menu-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#menu-veil .card'), 'menu on screen').toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 0.5)).toBe(true);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}
```

- [ ] **Step 2: Rewrite `crete-play.spec.ts`**

Keep the interface block, `WIN_SEED` and `PAGE`. Replace `open` and the four tests with:

```ts
async function open(page: Page, seed: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.clock.install();
  await page.goto(`${PAGE}?seed=${encodeURIComponent(seed)}`);
  await page.waitForFunction(() => !!window.__mazeTest && window.__mazeTest.G.seed !== '');
  // The page opens on the title card over the maze; Play starts that maze.
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.locator('#title-play').click();
  await expect(page.locator('#title-veil')).toBeHidden();
  return errors;
}

const gameState = (page: Page) => page.evaluate(() => ({ over: window.__mazeTest.G.over, won: window.__mazeTest.G.won }));

test('the play-through wins a pinned seed and shows the ending over the title card', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.keyboard.press('t');
  await page.clock.runFor(250_000);
  expect(await gameState(page)).toEqual({ over: true, won: true });
  await expect(page.locator('#end-veil')).toBeVisible();
  await expect(page.locator('#end-title')).not.toHaveText('');
  await expect(page.locator('#title-veil'), 'the title card waits under the ending').toBeHidden();
  // Q closes the ending and reveals the title card, not the menu.
  await page.keyboard.press('q');
  await expect(page.locator('#end-veil')).toBeHidden();
  await expect(page.locator('#title-veil')).toBeVisible();
  await expect(page.locator('#menu-veil')).toBeHidden();
  expect(errors).toEqual([]);
});

test('the creature catching you ends the run as a loss', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.evaluate(() => {
    const t = window.__mazeTest;
    const { G } = t;
    // Put the creature on an open cell next to the player, outside any safe zone.
    const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const spot = dirs.map(([dr, dc]) => ({ r: G.player.r + dr, c: G.player.c + dc }))
      .find(p => !G.walls[p.r]![p.c] && !G.safe.has(t.key(p.r, p.c)))!;
    G.foe.r = spot.r; G.foe.c = spot.c;
    t.creaturePhase(0);
  });
  expect(await gameState(page)).toEqual({ over: true, won: false });
  await expect(page.locator('#end-veil')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the strip drives a run: pad, Hint, a tool, and the toast shows the newest log line', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  const turns0 = await page.evaluate(() => window.__mazeTest.G.turns);
  // The pad moves or bumps; either way the page answers with a toast.
  for (const dir of ['right', 'down', 'left', 'up']) await page.locator(`.mv-${dir}`).click();
  await page.locator('#btn-hint').click();
  expect(await page.evaluate(() => window.__mazeTest.G.hint)).not.toBeNull();
  const shard0 = await page.evaluate(() => window.__mazeTest.G.inv.shard);
  await page.locator('#tool-shard').click();
  expect(await page.evaluate(() => window.__mazeTest.G.inv.shard)).toBe(shard0 - 1);
  await page.keyboard.press('Space');
  await expect(page.locator('#toast')).toHaveClass(/show/);
  const toast = await page.locator('#toast').textContent();
  expect(toast).not.toBe('');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await expect(page.locator('#log li').last()).toHaveText(toast ?? '');
  expect(await page.evaluate(() => window.__mazeTest.G.turns)).toBeGreaterThanOrEqual(turns0);
  expect(errors).toEqual([]);
});

test('items, bash, mute and a new run answer their keys', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  const inv = () => page.evaluate(() => ({ ...window.__mazeTest.G.inv, frozen: window.__mazeTest.G.frozen }));
  const before = await inv();
  await page.keyboard.press('z'); // Mirror Shard: freezes the creature, no turn spent
  const afterShard = await inv();
  expect(afterShard.shard).toBe(before.shard - 1);
  expect(afterShard.frozen).toBe(1);

  const turns0 = await page.evaluate(() => window.__mazeTest.G.turns);
  await page.keyboard.press('Space'); // nothing adjacent: a message, no turn
  expect(await page.evaluate(() => window.__mazeTest.G.turns)).toBe(turns0);

  await page.keyboard.press('q'); // the menu holds the Sound button
  const muteText = await page.locator('#mute').textContent();
  await page.keyboard.press('m');
  await expect(page.locator('#mute')).not.toHaveText(muteText ?? '');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeHidden();

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('n');
  await expect.poll(() => page.evaluate(() => window.__mazeTest.G.turns)).toBe(0);
  expect(errors).toEqual([]);
});

test('Q layers: Q opens the menu and closes it; game keys wait under it; Esc does nothing', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  const turns0 = await page.evaluate(() => window.__mazeTest.G.turns);
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => window.__mazeTest.G.turns)).toBe(turns0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-veil')).toBeVisible();
  // A q typed into the seed box is a letter.
  await page.locator('#seed-input').fill('');
  await page.locator('#seed-input').press('q');
  await expect(page.locator('#seed-input')).toHaveValue('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await page.locator('#menu-close').click();
  await expect(page.locator('#menu-veil')).toBeHidden();
  expect(errors).toEqual([]);
});

test('Quit in the menu ends the run and shows the title card in a browser tab; Play starts a new run', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.keyboard.press('q');
  await page.locator('#quit').click();
  await expect(page.locator('#title-veil')).toBeVisible();
  await expect(page.locator('#menu-veil')).toBeHidden();
  await expect(page.locator('#title-hint')).toHaveCount(0);
  expect(await page.evaluate(() => window.__mazeTest.G.over)).toBe(true);
  await page.locator('#title-play').click();
  await expect(page.locator('#title-veil')).toBeHidden();
  expect(await page.evaluate(() => ({ over: window.__mazeTest.G.over, turns: window.__mazeTest.G.turns }))).toEqual({ over: false, turns: 0 });
  expect(errors).toEqual([]);
});

test('the title card opens Story and Settings, and Q returns to it', async ({ page }) => {
  await page.clock.install();
  await page.goto(`${PAGE}?seed=${WIN_SEED}`);
  await page.locator('#title-story').click();
  await expect(page.locator('#story-veil')).toBeVisible();
  await expect(page.locator('#title-veil')).toBeHidden();
  await page.keyboard.press('q');
  await expect(page.locator('#story-veil')).toBeHidden();
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.locator('#title-settings').click();
  await expect(page.locator('#menu-veil')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#title-veil')).toBeVisible();
  // Q under the title card does nothing.
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeHidden();
});

test('sound is remembered in this browser', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.keyboard.press('m');
  await page.keyboard.press('q');
  await expect(page.locator('#mute')).toContainText('Muted');
  await page.reload();
  await page.locator('#title-settings').click();
  await expect(page.locator('#mute')).toContainText('Muted');
  expect(errors).toEqual([]);
});

type LockCall = { keys?: string[]; outcome?: string; unlock?: boolean };
declare global {
  interface Window { __locks: LockCall[] }
}
/** Records Keyboard Lock calls and how each ended; a browser without Keyboard Lock gets a stand-in that grants. */
function lockRecorder() {
  window.__locks = [];
  const nav = navigator as any;
  if (!nav.keyboard || typeof nav.keyboard.lock !== 'function') {
    Object.defineProperty(navigator, 'keyboard', { configurable: true, value: { lock: async () => {}, unlock() {} } });
  }
  const kb = nav.keyboard;
  const lock = kb.lock.bind(kb), unlock = kb.unlock.bind(kb);
  kb.lock = (keys: string[]) => {
    const call: LockCall = { keys, outcome: 'pending' };
    window.__locks.push(call);
    const p = lock(keys);
    p.then(() => { call.outcome = 'granted'; }, (e: Error) => { call.outcome = `refused: ${e.message}`; });
    return p;
  };
  kb.unlock = () => { window.__locks.push({ unlock: true }); unlock(); };
}

test('Full screen from the menu takes the Esc lock; Esc changes nothing and the cards stay', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(lockRecorder);
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (/Keyboard Lock refused/.test(m.text())) errors.push(m.text()); });
  await page.goto(`${PAGE}?seed=${WIN_SEED}`);
  await page.locator('#title-play').click();
  await page.keyboard.press('q');
  await page.locator('#fullscreen').click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('frame');
  await expect(page.locator('#fullscreen')).toContainText('Leave full screen');
  await expect(page.locator('#menu-veil'), 'the cards are inside the full screen frame').toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__locks.filter(l => l.keys?.includes('Escape') && l.outcome === 'granted').length)).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-veil')).toBeVisible();
  expect(await page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('frame');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeHidden();
  expect(await page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('frame');
  expect(errors).toEqual([]);
  await ctx.close();
});
```

Add `import` of nothing new (`test, expect, Page` are already imported). The `MazeTest` interface gains `hint: string | null` on `G` and `inv: { shard: number }` stays: edit the interface block to `G: { ...; hint: string | null; inv: { shard: number } }`.

- [ ] **Step 3: Update the specs that name Crete's old page**

`games-pwa.spec.ts` line 8: `crete: 'h1'` becomes `crete: '#stage'`.

`games-install.spec.ts` line 96 comment: "Crete's own Q (Quit)" becomes "Crete's own Q (the menu)".

`select.ts` line 75: add `'crete-layout.spec.ts'` to the Crete list: `['games-hub.spec.ts', 'games-pwa.spec.ts', 'crete-play.spec.ts', 'crete-layout.spec.ts', 'games-install.spec.ts', 'play-nav.spec.ts']`.

`select-test.ts`: in the two `has('crete-sources-run-its-specs'...)` and `has('crete-bundle-runs-its-specs'...)` lines add `'crete-layout.spec.ts'` to the expected arrays.

- [ ] **Step 4: Run the specs (two at most)**

From `websites/www.cs`, with the local site up on its ephemeral port (`make up`):

```bash
node tests/e2e/select-test.ts
make e2e E2E_ARGS="crete-layout.spec.ts crete-play.spec.ts"
```

Expected: `select-test` prints no failures; all specs PASS. The layout spec is expected to fail the first time on one or two screens (a CSS value in Task 6 is a first guess); fix the CSS in `crete/game.css` (strip button sizes, `.hud` gaps, the landscape grid columns) until `measure()` returns `[]` on all ten screens, never by loosening the spec. If `hasTouch` + `isMobile` does not emulate `pointer: coarse`, the touch cases show tabs: switch those contexts to `...devices['Pixel 7']` viewport overrides and keep `hasTouch`.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/tests/e2e websites/www.cs/games/crete/game.css
git commit -m "Crete: browser specs for the frame (layout on ten screens, strip, Q layers, full screen)"
```

---

### Task 8: READMEs, regenerate, gates

**Files:**
- Modify: `crete/README.md`, `_kit/README.md` (the Q and Quit sentences), `tankity/README.md` (done in Task 2)
- Regenerate and commit: `crete/dist/*`, `crete/sw.js`, `crete/index.html` versions, `tankity/dist/*`, `tankity/sw.js`, `tankity/index.html`, the site's index and play pages

**Interfaces:** none new.

- [ ] **Step 1: Update `crete/README.md`**

Replace the first paragraph's control sentence with: "The page is one frame: a status bar (HP, Turns, Pages, Score, Fuses, Bash, the Minotaur's distance, Menu), the maze, and a control strip (the move pad, Hint, Route, Auto, Bash and the three tools with their counts), each button with a key tab. Arrows or WASD move, Space bashes, Z/X/C use tools, H hints, V shows the route, T plays itself, M mutes, N starts a new run, and Q opens the menu and closes whatever is open. Esc is never bound. The seed is in the address (`?seed=`), so a link replays a maze."

Replace the `index.html`/`game.css` bullet and the `src/` bullets in "## Files" with:

```
- `index.html`, `game.css`: the frame markup and its style (status bar, maze, strip, toast, cards, the phone layouts).
- `src/main.ts`: the entry. It wires the modules together, starts a run behind the title card, keeps the sound and full-screen settings, and exposes `window.__mazeTest` for the browser specs.
- `src/engine.ts`, `src/audio.ts`, `src/ui.ts`: the typed modules (below).
- `src/keys.ts`, `src/layers.ts`, `src/status.ts`, `src/fit.ts`, `src/help.ts`, `src/settings.ts`: the DOM-free page helpers (below). `src/notes.ts`, `src/install-slot.ts`: the words for a full-screen toggle that did not go, and the title card's install bar.
```

In the module table replace the `ui/end.tsx, ui/inventory.tsx, ui/title.tsx` row with:

```
| `keys`, `layers`, `status`, `fit`, `help`, `settings` | the key table (which keys do what, and what every key tab and help line prints), the stack of open cards and the Q rule, the status bar's words, the largest whole-pixel maze cell that fits, the "How to play" lines, the sound and full-screen preferences on the kit's `pref` | DOM-free |
| `ui/status.tsx`, `ui/strip.tsx`, `ui/menu.tsx`, `ui/story.tsx`, `ui/title.tsx`, `ui/end.tsx` | the status bar, the control strip, the menu, the story card, the title card and the ending card, drawn with the kit's `Dialog`, `Button` and `KeyChip`; `ui.ts` hands them a finished view | DOM lib |
```

Add after the table's explanatory paragraph a new section:

```
## Layout

The frame (`#frame`, a size container) fills the window and stacks the status bar (`#status-root`), the maze (`#board`, with a one-line toast over its foot that shows the newest log line and fades) and the control strip (`#strip-root`). `fit.ts` picks the largest whole-pixel cell that fits the board, and `ui.ts` sets it as `--cell` on every resize. The title, menu, story and ending cards are inside the frame, so full screen keeps them. A key tab is the kit's `.kit-key-tab`; it shows only with a mouse and a frame at least 760 px wide. A portrait phone stacks the status bar in two rows and puts the strip under the maze; a landscape phone floats the pad and the actions over the maze's lower corners. `crete-layout.spec.ts` measures ten screens: no page scroll, every control on screen, no control over the maze, at least 8 px per cell.

## Cards, Q and settings

The cards are a stack (`layers.ts`): title, menu, story, ending. Only the top one shows. Q (the kit's `isBackKey`) closes the top card; with nothing open it opens the menu; the title card ignores it. A run's end opens the ending card over the title card, so Q reveals the title card. While a card is up only Q, N and M reach the game. Q typed into the seed box is a letter. Esc is never bound and never leaves full screen: the full-screen toggle takes the Escape lock where the browser has Keyboard Lock (`_kit/app.ts`). The menu holds, in order, the seed box, Sound and Full screen, the story log, How to play and Quit. Sound and full screen are kept in this browser under `crete-sound` and `crete-fullscreen`; Play enters full screen again when it was last on.
```

In "## Tests" change the browser specs sentence to: "Browser specs: `crete-play`, `crete-layout`, `games-hub`, `games-install` and `games-pwa` in `../../tests/e2e`."

- [ ] **Step 2: Fix the kit README's Q sentences**

In `_kit/README.md` (line ~208) replace "Crete is the exception: with nothing open, Q is Quit there, and Q is back only for the install steps and the Share field. Crete's key router asks `isBackKey` for Q and `typesText` for the seed box;" with "Crete's key router owns Q: with nothing open it opens the menu, and it closes whatever card is open; the install steps and the Share field own Q while they are open. It asks `isBackKey` for Q and `typesText` for the seed box;". Line ~220 "Only the Fullscreen toggle and Quit may call" stays (still true). Run `grep -rn "Q is Quit\|Q (Quit)\|Crete's Q" websites/www.cs/games --include=*.md --include=*.ts --include=*.tsx | grep -v node_modules` and fix every hit to describe the menu.

- [ ] **Step 3: Regenerate everything**

```bash
cd websites/www.cs/games
node _kit/build/build.mjs crete
node _kit/build/build.mjs tankity
(cd crete && php tools/install-files.php)
(cd tankity && php tools/install-files.php)
cd ..
php tools/site-versions.php
php tools/site-game-pages.php
git status --short
```

Expected: only generated files and the sources above are modified; `node _kit/build/build.mjs crete --check`, `node _kit/build/build.mjs tankity --check` and both `php tools/install-files.php --check` print nothing and exit 0.

- [ ] **Step 4: Gates**

```bash
cd websites/www.cs/games && bash units.sh
cd .. 
export COMPOSE_PROJECT_NAME="crete-shell-$(date +%s)"
status=0
make test || status=$?
docker compose -p "$COMPOSE_PROJECT_NAME" down -v
echo "make test exit: $status"
git diff origin/main -- games/crete/src/engine.ts games/crete/src/grid.ts games/crete/src/bots.ts
```

Expected: `units.sh` PASS; `make test exit: 0`; the final diff prints nothing. (`make test` needs the stack; if `make up` was used earlier it ran under the same unique project name, never `siue`.) Then the two local browser runs, at most two specs each: `make e2e E2E_ARGS="crete-play.spec.ts crete-layout.spec.ts"` and `make e2e E2E_ARGS="tankity-layout.spec.ts tankity-pickers.spec.ts"`; CI runs the rest (`tankity-fullscreen-esc`, `games-pwa`, `games-install`, `games-hub`, `play-nav`).

- [ ] **Step 5: Commit**

```bash
git add -A websites/www.cs docs
git commit -m "Crete shell: READMEs, regenerated bundles and pages"
```

Then follow the repo's PR flow (`foundry:pr-fix-loop`); after merge, the deploy is automatic (`deploy.yml`), and the report gives the cache-busted `/play/crete/?v=<sha>` link. Never run `make deploy`.

---

## Self-Review

**Spec coverage.** Layout (frame, status bar items, maze at the largest whole cell, toast, strip with pad/Hint/Route/Auto/Bash/three tools and tabs): Tasks 3 (`fit.ts`, `status.ts`), 4 (views), 6 (markup, CSS, wiring). Removed header, panels, help and seed form: Task 6 (`smoke.test.ts` guards). Phones: Task 6 CSS, Task 7 measures. Title card (Play, Story, Settings, Install bar; shown at open, after Quit, at the end under Again): Tasks 5 and 6. Menu order, Q closes menu/story/ending, Esc never bound: Tasks 3 (`layers`, key-table Esc scan), 4, 6, 7. Sound and Fullscreen remembered through the kit's prefs, `toggleFullscreen`, New run (N) from anywhere, Quit through `_kit/app.ts`: Tasks 3 (`settings`), 6 (`main.ts`). Key tabs (`.kit-key-tab`, properties, `:where()`, `KeyChip variant`, Tankity switch with `tankity-layout.spec.ts` unchanged, hidden on touch and under 760 px): Tasks 1 and 2. Code list and tests list (unit, kit, browser, fullscreen regression kept): covered; out of scope respected (`engine.ts`, `grid.ts`, `bots.ts` guarded by a diff check in Tasks 6 and 8).

**Placeholder scan.** No TBD/TODO steps; every code step has the code. The one open-ended step is Task 7 Step 4's CSS tuning, which names the knobs and the rule (fix the CSS, not the spec); this is inherent to layout work, not a placeholder.

**Type consistency.** `Action`, `MoveAction`, `KEYS`, `KeyDef` (Task 3) are used verbatim by `strip.tsx`, `menu.tsx`, `help.ts`, `title.tsx`, `ui.ts`. `StatusView` fields (`hp, turns, pages, score, fuses, bash, foe, foeNote`) match `status.tsx` and the ids `hud-*`. `LayerName` and `Layers` methods (`top, isOpen, has, any, open, close, clear, pressBack`) match `ui.ts`. `Controls` gains `toggleFullscreen` and `play`; `main.ts` and `keys.test.ts` both pass them. `Ui` drops `hideEnd`, `hideTitle`, `setMuteLabel`; `main.ts` uses `closeLayers`, `setMuted`. `ToolRow.key` carries the engine's printed key, which the views test compares with `ITEMS`.

**Review Focus coverage.** Lines 1 to 5 each name the task that holds the test (seed-box Q: Task 6 `keys.test.ts` and Task 7 `crete-play.spec.ts`; title/ending Q: Task 3 and Task 6; tiny screens: Task 7 devices; storage: Task 3 `settings.test.ts`; fullscreen: Task 3 `notes.test.ts` and Task 7).
