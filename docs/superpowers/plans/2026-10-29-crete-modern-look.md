# Crete Modern Look Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the painted 3D "Modern" board (default) beside today's board, kept unchanged as "Classic", with a Look and a Walls setting, a turn-and-pan camera, a sprite mini map and on-demand drawing.

**Architecture:** Pure helpers (camera, gestures, screen-relative moves, ghost grade, scene diff, quality) live DOM-free in `src/modern/` and are unit-tested. The three.js board is a separate esm bundle `dist/modern.js`, loaded only when Modern is first shown, and draws from the same `frameOf(game, ms)` frame and `game.thread` Classic paints from. `main.ts` keeps today's every-frame loop for Classic and switches to on-demand frames for Modern.

**Tech Stack:** TypeScript 7 (strict), three.js (npm, exact pin), esbuild via `games/_kit/build/build.mjs`, preact views, `node:test`, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-10-29-crete-modern-look-design.md`. The approved live sample (about 1200 lines, described in the spec): its floor, wall, ghosting, paint filter, lighting, torch, loop, camera and mini-map code is the reference to port.

## Global Constraints

- All paths below are under `websites/www.cs/games/crete/` unless they start with `websites/` or `tests/` (the latter under `websites/www.cs/`).
- Classic must look and behave exactly as today: `src/board.ts`, `fit()`, `follow.ts` and the every-frame `loop` in `src/main.ts` stay byte-for-byte in behaviour while Classic is chosen.
- Camera: pitch fixed at 45°, default yaw 15°, zoom by wheel, pinch and buttons within limits, no tilt, no camera keys. Touch: one finger turns (0.35°/px horizontal; vertical does nothing), two fingers pan and twist turns (board follows fingers: clockwise twist on screen = yaw increases = board turns clockwise). Mouse: left-drag turns, right/middle-drag pans. Double-tap (≤320 ms, ≤40 px) / double-click resets. Camera input ignored while `layers.any()` except the `start` card, which a gesture closes.
- Walls setting `solid | ghosted | low`, default `solid`. Ghosted: wall material opacity `1 − 0.67·cover` (cover 0..1 = share of a figure/piece/key tile the wall hides, ray-sampled as in the sample), eased with a ~0.2 s time constant, no outlines. Low: walls at 0.38/1.25 of full height.
- Settings keys: `crete-look` (`modern`|`classic`, default `modern`), `crete-walls` (default `solid`).
- Nothing draws at rest in Modern. Tile loops at 12 fps, only while one is on screen, tab visible, board in view, and not reduced motion.
- Moves follow the screen: `screenToGrid(dir, yawDeg)`; identity for yaw in (−45°, 45°).
- The editor and `tiles-test.html` stay on Classic's `createBoard`.
- Node tests run only under `systemd-run --user --scope -q -p MemoryMax=3G -p MemorySwapMax=0 /usr/bin/timeout 300`, from `websites/www.cs/games`: `node --test crete/test/<f>.test.ts`. Rebuild with `node _kit/build/build.mjs crete` then `php crete/tools/install-files.php` (run php in the `php:8.4-cli` container if no local php); commit `dist/`, `sw.js`, `index.html`.
- Browser specs: at most two locally per task via `tests/e2e/run.sh <spec>`; CI runs the full suite.
- Docs describe current state only (no history, no dates in prose). Comments match the files' existing style.
- three.js: add `three` `0.160.0` (exact) to `games/package.json` `dependencies` (the sample's version; port its `RoundedBoxGeometry` and `RoomEnvironment` addons from `three/examples/jsm/`); import only what is used.
- The modern board redraws from the controller's existing `changed` hook (`GameDeps.changed` in `main.ts`) and turn animations; nothing in `src/puzzle/` or `src/game.ts` changes.

## Review Focus

1. WebGL missing or context lost → Classic shows, one toast, stored choice stays `modern`.
2. Switching looks mid-turn or mid-story-page pause → the turn still finishes (`game.finishAnim()` is called exactly once) and the page pause holds.
3. A big level (more than 12 cells) in Modern → no scrolling, camera follows Theseus, mini map fits its corner.
4. Rotating to yaw 180° then pressing Up → Theseus moves grid-down (south); the pad does the same.
5. Menu open over Modern → drags, twists, double-taps and mini-map taps change nothing.

---

### Task 1: Look and Walls settings, menu and title switch

**Files:**
- Modify: `src/settings.ts`, `src/ui/menu.tsx`, `src/ui/title.tsx`, `src/ui.ts`, `src/main.ts`, `src/help.ts`
- Modify tests: `test/settings.test.ts`, `test/views.test.ts`, `test/ui.test.ts`, `test/help.test.ts` (as their assertions require)
- Modify e2e: every `tests/e2e/crete-*.spec.ts` that reads `#stage` pixels or `data-cell`, plus `tests/e2e/screenshots.ts` stays as is for now

**Interfaces:**
- Produces: `export type Look = 'modern' | 'classic'; export type WallMode = 'solid' | 'ghosted' | 'low'; export const LOOK_KEY = 'crete-look'; export const WALLS_KEY = 'crete-walls';` and `Settings.look: Pref<Look>`, `Settings.walls: Pref<WallMode>` in `src/settings.ts`.
- Produces: `Ui.setLook(look: Look, walls: WallMode): void`; `bindControls` gains `setLook: (l: Look) => void` and `setWalls: (w: WallMode) => void` callbacks wired to the menu's Look and Walls controls and the title card's Look switch.
- Produces in `main.ts`: `applyLook(look: Look): void` — in this task it only stores the setting, updates the UI and leaves Classic drawing (Task 7 makes Modern draw).

- [ ] **Step 1:** Write failing tests: `createSettings(null).look.get() === 'modern'`, `.walls.get() === 'solid'`; a stored `crete-look=classic` reads back `classic`; an unknown stored value reads the default. Menu view renders a Look group with Modern/Classic (`aria-pressed`) and, when look is modern, a Walls group with Solid/Ghosted/Low; title card renders a Look switch (`#title-look`).
- [ ] **Step 2:** Run them; expect FAIL.
- [ ] **Step 3:** Implement settings, views, ui wiring, main wiring (`start()` restores both), help text line for the Look setting and the camera gestures.
- [ ] **Step 4:** Run the crete unit tests; expect PASS.
- [ ] **Step 5:** In each Crete e2e spec that reads the 2D canvas or `data-cell`, add `await page.addInitScript(() => localStorage.setItem('crete-look', 'classic'))` before navigation (one shared helper if the specs already share one). Run `tests/e2e/run.sh crete-play.spec.ts`; expect PASS.
- [ ] **Step 6:** Rebuild dist, install-files, commit.

### Task 2: Pure camera, gesture, move, ghost, diff and quality helpers

**Files:**
- Create: `src/modern/camera.ts`, `src/modern/gestures.ts`, `src/modern/screen-move.ts`, `src/modern/ghost.ts`, `src/modern/diff.ts`, `src/modern/quality.ts` (all DOM-free; add to `tsconfig.json`'s file list)
- Test: `test/modern-camera.test.ts`, `test/modern-gestures.test.ts`, `test/modern-screen-move.test.ts`, `test/modern-ghost.test.ts`, `test/modern-diff.test.ts`, `test/modern-quality.test.ts`

**Interfaces (Produces):**
- `camera.ts`: `PITCH = 45; DEFAULT_YAW = 15; interface Cam { yaw: number; tx: number; tz: number }`; `easeCam(cur: Cam, goal: Cam, dtSec: number, snap: boolean): boolean` (true while still moving; `snap` = reduced motion); `clampCam(c: Cam, cols: number, rows: number): Cam` (target within the board ±1 cell, board centred at the origin, cell = 1 unit, x = c − (cols−1)/2, z = r − (rows−1)/2); `panCam(c: Cam, dxPx: number, dyPx: number, unitsPerPx: number): Cam` (screen drag → ground move, board follows the finger, foreshortening by sin 45°); `nearestYaw(target: number, current: number): number`; `viewRows(aspect: number): number` (visible ground height; the sample's `min(14, max(7.5, 7.5/aspect))`).
- `gestures.ts`: `type CamOp = { kind: 'turn'; deg: number } | { kind: 'pan'; dx: number; dy: number } | { kind: 'reset' }`; `createGestures(now: () => number): { down(p: Ptr): CamOp[]; move(p: Ptr): CamOp[]; up(p: Ptr): CamOp[]; cancel(id: number): void }` with `Ptr = { id: number; x: number; y: number; type: 'mouse' | 'touch' | 'pen'; button: number }`.
- `screen-move.ts`: `screenToGrid(dir: Dir, yawDeg: number): Dir` using quarter turns `q = ((round(yaw/90) % 4) + 4) % 4`; screen-up maps to `['up','left','down','right'][q]`, and the other directions rotate with it.
- `ghost.ts`: `ghostTarget(cover: number): number` = `1 − 0.67 * clamp01(cover)`; `easeOpacity(cur: number, target: number, dtSec: number): number` with time constant 0.2 s / 3 (settles in ~0.2 s), exact at |Δ| < 0.005.
- `diff.ts`: `changedCells(a: State, b: State): number[]` — indices whose terrain or object differs, ascending.
- `quality.ts`: `type Quality = 0 | 1 | 2 | 3` (3 = full: shadows, paint, DPR ≤ 2; 2 = no shadows; 1 = no paint filter; 0 = DPR 1); `nextQuality(q: Quality, recentFrameMs: readonly number[]): Quality` — drop one step when the median of the last 20 animating frames exceeds 40 ms; never rises within a visit.

- [ ] **Step 1:** Write the failing tests, including: `screenToGrid('up', 15) === 'up'`, `screenToGrid('up', 90) === 'left'`, `screenToGrid('right', 90) === 'up'`, `screenToGrid('up', 180) === 'down'`, `screenToGrid('up', -90) === 'right'`, `screenToGrid('up', 44) === 'up'`; one-finger horizontal drag of +100 px yields total turn −35°; vertical drag yields no op; two-finger parallel drag yields pans equal to the midpoint motion and no turn; a clockwise twist of +0.3 rad (screen coords, y down) yields turn +17.19°; two quick taps yield `reset`, two taps 500 ms apart do not; mouse button 2 drag yields pan, button 0 yields turn; `ghostTarget(1) ≈ 0.33`; `easeOpacity` reaches within 0.01 of target after 0.25 s of 1/60 steps; `changedCells` on a state and a copy with one door opened returns that index; `nextQuality(3, twenty 50s) === 2`, `nextQuality(0, …) === 0`; `clampCam` pulls a far target back; `panCam` with yaw 0 and a +10 px rightward drag moves the target −x (board follows finger).
- [ ] **Step 2:** Run; expect FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run; expect PASS. Commit.

### Task 3: The modern bundle and its loader

**Files:**
- Modify: `websites/www.cs/games/package.json`, `package-lock.json` (add `three`, exact pin; add `@types/three` to devDependencies at the matching version if three's own types are absent)
- Create: `src/modern/entry.ts` (the bundle's entry; DOM + three), `src/modern/board3d.ts` (skeleton `createModernBoard`), `src/modern-loader.ts` (DOM)
- Modify: `build.json` (entry `{ "in": "src/modern/entry.ts", "out": "modern", "format": "esm" }`, version `"MODERN_V": "dist/modern.js"`), `src/tsconfig.dom.json` (include the modern DOM files)
- Test: `test/modern-loader.test.ts`

**Interfaces:**
- Produces (`src/modern/board3d.ts`, exported from `entry.ts`):
```ts
export interface ModernHost {
  canvas: HTMLCanvasElement;          // the modern canvas, sized by CSS to the board region
  atlas: Atlas; image: HTMLImageElement; // for the mini map (Task 6)
  blocked(): boolean;                 // true while a layer other than `start` is open
  gesture(): void;                    // a camera gesture happened (closes the start card)
  reducedMotion(): boolean;
}
export interface ModernBoard {
  level(s: State): void;              // build the scene for a new level; camera resets to follow
  show(f: { state: State; figures: Figures }, thread: readonly Cell[] | null): void; // apply locally, draw once
  walls(m: WallMode): void;
  yaw(): number;                      // degrees, for screenToGrid
  reset(): void;
  resize(): void;
  setActive(on: boolean): void;       // hidden boards draw nothing and stop loops
  frames(): number;                   // frames drawn, for tests
  dispose(): void;
}
export function createModernBoard(host: ModernHost): ModernBoard;
```
- Produces (`src/modern-loader.ts`): `loadModern(): Promise<typeof import('./modern/entry.ts') | null>` — imports `dist/modern.js?v=${MODERN_V}` via a non-literal URL, returns `null` (never throws) when WebGL is unavailable (`canvas.getContext('webgl2') ?? getContext('webgl')` on a scratch canvas is null) or the import fails; memoised.
- The skeleton board clears to the background colour and counts frames; Tasks 4–6 fill it.

- [ ] **Step 1:** Failing test for the loader's pure part: a `webglAvailable(make: () => { getContext(k: string): unknown } )` helper returns false when both contexts are null, true otherwise.
- [ ] **Step 2:** Run; FAIL. **Step 3:** Implement; add the entry; build; confirm `dist/modern.js` exists, is not inlined into `dist/main.js` (grep `main.js` for `WebGLRenderer` → no match) and `dist/THIRD_PARTY_LICENSES.txt` lists three. **Step 4:** PASS; install-files (sw precaches `dist/modern.js`); commit.

### Task 4: The scene — floor, walls, terrain, light, paint, on-demand drawing

**Files:**
- Create: `src/modern/scene/floor.ts`, `src/modern/scene/walls.ts`, `src/modern/scene/terrain.ts`, `src/modern/scene/light.ts`, `src/modern/scene/paint.ts`, `src/modern/scene/textures.ts`; modify `src/modern/board3d.ts`

**Interfaces:**
- Consumes: Task 2 `camera.ts`, `ghost.ts`, `diff.ts`, `quality.ts`; Task 3 `ModernBoard`.
- Produces: `TERRAIN_MODELS: Record<string, (ctx) => THREE.Object3D>` keyed by every terrain sprite name in `fx/sprites/tiles.json` (floor, wall, exit, gate-closed, gate-open, water, fire, ice, force-*, dirt, gravel, safe, button, button-brown, button-red, toggle-open, toggle-closed, door-*, trap, popup, teleport, thief, bomb, clone-*). Fake and invisible walls draw as their Classic sprite does.

Port from the sample: one flagstone per cell (seams are the only grid); walls as merged outer faces with per-wall material for ghosting; solid/ghosted/low; torches on walls; procedural textures; ACES tone map; the Kuwahara paint pass with grade and grain; the render loop that draws only when invalidated, with `computeGhostTargets` re-run only when the camera or a figure moved; `show()` rebuilding only `changedCells` pieces. Each terrain model's colour and silhouette match its Classic sprite. The camera is orthographic at pitch 45°, `viewRows(aspect)` tall, following `game` figures' player position until panned.

- [ ] **Step 1:** Add a node test that every terrain sprite name in `fx/sprites/tiles.json` has a `TERRAIN_MODELS` entry (import the table's key list from a DOM-free `src/modern/model-names.ts` that both the test and the scene use).
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS; build; load `index.html` with a test page or the dev server, set Modern, screenshot Chapter 1 level 10 and Chapter 2 level 1 at 1280×800 and 390×844, and look at them. Commit.

### Task 5: Objects, hazards, figures and the thread

**Files:**
- Create: `src/modern/scene/pieces.ts`, `src/modern/scene/figures.ts`, `src/modern/scene/thread.ts`; modify `src/modern/model-names.ts`, `src/modern/board3d.ts`

**Interfaces:**
- Produces: `PIECE_MODELS` for every object and hazard sprite (relic, keys ×4, flippers, fire-boots, skates, suction, mirror, cake, cow, cow-standing, page, block, ball, glider, fireball) and the figures `theseus`, `minotaur`, `minotaur-stone`; clone machines show their template.
- `show()` places figures at `figures.player`, `figures.minotaur`, `figures.hazards[i].at`, `figures.blocks[i].at` (fractional cells, so turn animation is smooth), faces each figure along its last step, hides taken objects from `state`, and draws the thread as a thin red cord on the floor through cell centres when `thread` is non-null.

- [ ] **Step 1:** Extend the names test to every object, hazard and figure sprite. **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS; screenshot a level with keys, a block, water and the Minotaur; commit.

### Task 6: Camera controls, mini map, loops and quality

**Files:**
- Create: `src/modern/controls.ts` (pointer events → `createGestures` → camera goal), `src/modern/minimap.ts`; modify `src/modern/board3d.ts`, `index.html`, `game.css`

**Interfaces:**
- Consumes: `createGestures`, `CamOp`, `clampCam`, `panCam`, `nearestYaw`, `nextQuality`; Classic's `createBoard` and `drawList` for the mini map.
- Markup: inside `#board`, a `canvas#stage3d` (hidden unless Modern), `canvas#minimap` + `canvas#minimap-view` overlay in the bottom-left, and `.cam` buttons `#cam-left` ("Turn left"), `#cam-right` ("Turn right"), `#cam-reset` ("Reset view") at the top-right, shown on fine pointers or ≥700 px wide.
- Mini map: `createBoard(minimapCanvas, atlas, image)` sized to cells of 11 px (8 px under 520 px wide), painted with `drawList(state, restingFigures-or-figures, atlas, 0)` only when the state or camera changes; the overlay draws the camera's ground footprint (screen corners cast onto the floor) and a tick toward screen-up; pointerdown/move on it sets the camera target to that cell and stops following.
- Loops: water, fire, torch, force floor and teleport loops at 12 fps per the constraints; with quality steps from `nextQuality`.

- [ ] **Step 1:** Unit-test any new pure math (footprint corner → mini-map pixel) in `test/modern-camera.test.ts`. **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS; commit.

### Task 7: Wire Modern into the game

**Files:**
- Modify: `src/main.ts`, `src/ui.ts`, `game.css`, `index.html`
- Create e2e: `tests/e2e/crete-modern.spec.ts`
- Modify: `tests/e2e/playwright.config.ts` only if WebGL needs a launch flag (`--enable-unsafe-swiftshader`/`--use-angle=swiftshader`)

**Interfaces:**
- Consumes: `loadModern`, `ModernBoard`, `screenToGrid`, settings from Task 1.
- `applyLook('modern')`: load once; on `null` show Classic and toast "The modern look needs WebGL, which this browser does not have; showing Classic." once per visit. Modern active: `#stage` hidden, `#stage3d` shown, Classic's `loop` not running; a `game.changed` or level change calls `modern.level`/`modern.show(frameOf(...))`; while `game.anim` exists, a rAF loop calls `show(frameOf(game, game.animMs()))` and `game.finishAnim()` when done, then stops. Classic active: today's loop runs exactly as before.
- Moves: `ui.ts`'s keyboard move and the pad's `onMove` pass `dir` through `moveDir(dir)` = `screenToGrid(dir, modernActive ? modern.yaw() : 15)` before `g.press`.
- `blocked()` = a layer other than `start` is open; `gesture()` closes `start`.
- Expose `__creteTest.modern` (`frames()`, `yaw()`, `active`) for specs.

- [ ] **Step 1:** Write `crete-modern.spec.ts` (reduced motion on): default look is Modern and `#stage3d` is visible; the frame count is unchanged over 1.5 s at rest; dragging one finger/left mouse 200 px right changes `yaw` by about −70° and pressing Up then moves Theseus along the grid direction `screenToGrid('up', yaw)`; with the menu open a drag leaves `yaw` unchanged; Walls → Ghosted round-trips through reload; tapping the mini map moves the camera; switching to Classic shows `#stage` and the classic board paints, and back. **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** Run `crete-modern.spec.ts` and `crete-play.spec.ts`; PASS. Commit.

### Task 8: Share images, docs

**Files:**
- Modify: `tests/e2e/screenshots.ts` (Crete scene waits for the modern board's first frames), regenerate `og.png`, `screenshot.jpg`, `preview.webp`, `preview.mp4` with `make screenshots GAMES=crete`, and the play page via `php tools/site-game-pages.php`
- Modify: `README.md` (both looks, settings, camera, modules, on-demand drawing), `fx/CREDITS.md` (modern models built in code), `help.ts` if not already done

- [ ] **Step 1:** Regenerate and look at each image. **Step 2:** Update docs. **Step 3:** `make test` from `websites/www.cs`; PASS. Commit.
