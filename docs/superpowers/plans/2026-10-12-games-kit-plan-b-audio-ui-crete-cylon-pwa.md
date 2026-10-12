# Games Kit, Plan B: Shared Audio and UI, Crete and Cylon Overlays, Crete's Maze Rule, Installable Apps

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the games kit a shared Web Audio core and Preact UI components, move Crete's and Cylon's hand-built overlays onto them, make every Crete maze one that the creature reaches and a good player still wins, and make each game an installable full-screen app with its own icons, a way to quit, and Install and Share buttons on its site page.

**Architecture:** `games/_kit/audio/core.ts` is a facade over one `AudioContext` per game (lazy creation, gesture unlock, an sfx and a music bus, the tone and noise envelopes); each game keeps its own voices and music and calls the core. `games/_kit/ui/` holds four Preact components (`Dialog`, `Button`, `Panel`, `KeyChip`); a game's page keeps an empty mount point and its module renders the component with a finished view of its state. Crete's generator judges each candidate maze by playing it twice with the real `createGame` rules (a "dasher" bot and a "strategist" bot) from per-attempt random streams. `games/_kit/app.ts` owns installed-app detection, full screen and leaving; `games/_kit/build/icons.mjs` renders every icon from one SVG per game; `install-core.php` writes full-screen manifests and checks the icon set. `games/_kit/install.ts` decides when to offer Install (the browser's held-back prompt, iOS's Add to Home Screen steps, or nothing) and how Share falls back, with the browser behind ports; `ui/install-bar.tsx` draws it, and each page game ships it as `dist/install.js` for its site page and its own page.

**Tech Stack:** TypeScript 7.0.2, esbuild 0.28.2, Preact 11.0.1, `@resvg/resvg-js` 2.6.2 (dev only, icon rendering), Node 24 (`node --test`, native type stripping), PHP 8.4, PHPUnit ^12, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-12-games-kit-design.md`: sections 1 (`audio/core.ts`, `ui/`), 4 (Crete's maze), 5 (overlays), 11 (install and exit), and section 10 rows 6, 7, 8, 9 and 19. Plan A (`docs/superpowers/plans/2026-10-12-games-kit-plan-a-foundation.md`) built the kit this plan extends.

**Landing order across plans:** difficulty PR → B6 ∥ C10 → B7 → (B8 ∥ B9) ∥ (C11 → C12 → C13 → C13b) → B19 → D20 → D14 → D15 → D16 → E17 → row 18. (D20 is Plan D's storage PR, spec row 20.)

**Cross-plan dependencies:**
- PR 7 lands before Plan C's PR 11: Plan C renders Tankity's key chips with this plan's `KeyChip` (`at` and `decorative`, Task 6), builds its title card on `Dialog`, and loads its component tests with `importTsx` and the moved `dom-stub.mjs` (Task 5).
- PR 19 lands after Plan C's PR 10 and PR 13. Plan C's PR 10 (Task 1) adds `kit_php` copies to `install_sync` and two `InstallCoreTest` cases; Task 20 here is written to apply on top of that (rebase onto it, keep both). Task 24's Quit calls Plan C's `backToTitle()` and extends Plan C's `test/menu.test.mjs`.
- Tankity's `menu.tsx`, `menu.ts` and `test/menu.test.mjs` change in this order: the difficulty PR → Plan C Task 14 → Plan C Task 19 → Task 24 here (Quit) → Plan D Task 18 (Standings).
- Task 29 adds `dist/install.js` to the `versioned` list in `tankity/tools/install-files.php`, and a `dist/install.js` script tag to `tankity/index.html`; Plan D Task S2 later adds `kit_php` to the same config array (another line). Tankity's `src/` is untouched by the Install and Share work: the bar is a separate bundle, so Plan C's and Plan D's `main.ts` and menu edits do not meet it.
- Plan E (PR 17) rebases onto PR 6: its new audio tests use `fakeAudioContext` from `games/_kit/test/audio.ts` (Task 1).

## Global Constraints

- The host is the sftp-only PHP 8.4 server; nothing is built there. What ships is static files plus the existing runtime PHP. Every game's `dist/` is checked in.
- A built game folder needs nothing outside itself at run time; a game's source needs `games/_kit/` beside it.
- The kit exists (`websites/www.cs/games/_kit`): `build/build.mjs` (driven by each game's `build.json`: `programs`, `entries[{in,out,format}]`, `versions`), `php/install-core.php` (`install_run($dir, $config, $argv, $err, $out)`), `ports.ts` (`Timers`, `Clock`, `Rng`, `StorageLike`), `ports.browser.ts` (`browserTimers`, `browserClock`, `browserStorage`), `prefs.ts` (`pref`, `text`, `json`), `test/check.ts`, `test/clock.ts` (`manualClock`), `test/rng.ts` (`mulberry32`), `test/record.ts` (`recorder`, `memoryStorage`, `throwingStorage`), `php/testing/LegacyCheckCase.php`.
- Pinned versions (exact, in `websites/www.cs/games/package.json`): `typescript` `7.0.2`, `esbuild` `0.28.2`, `preact` `11.0.1`, `@types/node` `24.19.2`; this plan adds `@resvg/resvg-js` `2.6.2` (devDependency). `phpunit/phpunit` `^12` in `websites/www.cs/composer.json`.
- Unit tests are `*.test.mjs` under each game's `test/` (and `games/_kit/test/`, `games/_kit/build/`), run by `node --test`; spec row 18 turns them into `.test.ts`. New tests use `node:test` (`test()` + `assert`) directly. A test file a task substantially rewrites drops the `check()` bridge; a file that only gains or changes a few lines keeps its style. New UI tests never extend Tankity's `check()`-style `test/ui.test.mjs`: they go in a new `node:test` file (Tankity's menu tests live in Plan C's `test/menu.test.mjs`). PHP tests are real PHPUnit `TestCase` classes.
- Imports carry their `.ts`/`.tsx` extension. A `.tsx` file cannot run under Node directly: tests load components through the kit's `importTsx` helper (Task 5).
- Never bind a port someone may be using (3000, 5173, 8000, 8080). The docker site publishes an ephemeral port; specs get it from `make url`. Browser specs run only through `make e2e` / `tests/e2e/run.sh` (the e2e lock).
- Agents run `make test` (from `websites/www.cs`) plus at most two browser specs locally; CI runs the selected specs in four shards. Each task names its specs.
- Budgets: `make test` static checks ≤ 15 s, unit suites ≤ 45 s. A new browser spec targets ≤ 15 s and uses Playwright's `page.clock` where timers matter; it is registered in `tests/e2e/select.mjs` and in `shard.mjs`'s `WEIGHTS`.
- Generated files are never hand-merged. A PR that touches a game rewrites its `dist/` (bundles, maps, `THIRD_PARTY_LICENSES.txt`), `sw.js`, the page's `?v=` values and, for Tankity, `game.json`; after rebasing onto `main`, take either side of a conflict in them and rebuild: `cd websites/www.cs/games && npm run build && php tankity/tools/game-json.php && php tankity/tools/install-files.php && php cylon/tools/install-files.php && php crete/tools/install-files.php`, then `cd websites/www.cs && php tools/site-versions.php`, and commit what they wrote.
- After changing a game's `src/`, rebuild: `cd websites/www.cs/games && node _kit/build/build.mjs <game>`, then `php <game>/tools/install-files.php` (page `?v=` values and `sw.js`). After rebuilding Cylon, also run `php tools/site-versions.php` from `websites/www.cs` (the home page's `?v=` for Cylon's bundle). Commit `dist/` with the source.
- Comments say why, never what the next line does, and never history. File headers are one to five lines. Docs (`README.md`s) describe the current state only. Architecture lives in each game's `README.md` and `games/_kit/README.md`.
- One PR per spec row: rows 6, 7, 8, 9, 19, in that order (8 and 9 may run in parallel worktrees: they touch different games). Each PR: its own branch in its own worktree (the main checkout stays on `main`), CI green on the required checks, the pr-fix loop on review comments, then merge on green CI after pr-fix (William authorized merging on green; CodeRabbit rate-limit notices do not block), deploy, a light live check, and a report that ends with a cache-busted `/play/tankity/?v=<sha>` link.
- A live check runs one read-only spec per touched area against the deployed site: `cd websites/www.cs && make e2e E2E_BASE_URL=https://www.cs.siue.edu/~wgrim/ E2E_ARGS="<spec>"`. Never `cylon-play` live: it files a real score.
- Commit messages end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
  ```

## Review Focus

1. **A seed whose first 80 candidate mazes all fail the new rule.** Expected: generation still returns a maze the strategist wins (the closest-meeting one, or, if none of the 80 is winnable, the first winnable one after them), and never a maze the strategist loses. Pinned by `maze-rule.test.mjs` "falls back…" and "keeps drawing past 80…" (Task 17), with an injected judge.
2. **Play-through (T) started mid-run, after the player has wandered.** Expected: it plays on from where it stands and never spins: no route stops it with "Play-through is stuck", and waiting in a safe zone gives up after six turns in a row. Pinned by `bots.test.mjs` "stops waiting after six turns" (Task 16) and `maze-rule.test.mjs` "T stops when there is no route" (Task 17).
3. **High-score initials that are not plain letters** (a forged or legacy row such as `<b>`). Expected: shown as text; the board used to be built with `innerHTML`. Pinned by `cylon/test/ui.test.mjs` "rows show initials as text" (Task 9).
4. **An installed app whose `window.close()` is silently ignored** (phones, some desktop installs). Expected: within 150 ms the game falls back to its title card, leaves full screen and shows "Swipe the app away to close it"; never hangs waiting. Pinned by `_kit/test/app.test.mjs` "an installed app that cannot close…" (Task 21).
5. **No Web Audio, or a context that throws while being made** (old Safari, too many contexts). Expected: every sound call is silent and nothing throws; a muted bus never even creates the context. Pinned by `_kit/test/audio.test.mjs` (Task 1).
6. **Chrome fires `beforeinstallprompt` before the page's deferred `dist/install.js` has run.** Expected: the page's first script holds the event back (`INSTALL_PROMPT_STASH`) and the Install button appears as soon as the bar mounts; the prompt is never lost and Chrome's own mini-infobar never shows. Pinned by `install.test.mjs` "a prompt held back before the bar mounted shows Install" (Task 27) and `InstallCoreTest` / `site-game-pages` checks for the stash (Task 29).

---

## File Structure

```
websites/www.cs/
  index.html                                   # PR 8: settings panel becomes an empty mount point
  index.html                                   # PR 19: #cylon-install-root in the game bar
  tools/site-game-pages.php                    # PR 19: apple-touch-icon is the 180 px icon; the Install/Share mount, dist/install.js, the prompt stash; the forward keeps the query
  play/play.css                                # PR 19: the bar's place in .play-nav
  tests/php/checks/site-game-pages.php         # PR 19: the buttons' mount, script and stash
  tests/e2e/crete-play.spec.mjs                # PR 9 re-pin; PR 19 Quit test
  tests/e2e/cylon-help.spec.mjs                # PR 19 Game Off test
  tests/e2e/tankity-overlays.spec.mjs          # PR 19 Menu → Quit test
  tests/e2e/games-pwa.spec.mjs                 # PR 19 manifests, icons, display
  tests/e2e/games-install.spec.mjs             # PR 19 Install and Share (new; select.mjs, shard.mjs WEIGHTS)
  tests/php/checks/deploy-set.php              # PR 7, PR 8: Crete's and Cylon's THIRD_PARTY_LICENSES.txt ship
  games/
    package.json, package-lock.json            # PR 19: @resvg/resvg-js
    .gitignore                                 # PR 7: */test/.tmp-*/
    _kit/
      README.md                                # every PR: its section
      tsconfig.json                            # PR 6/7: include audio/*.ts, ui/*.tsx, app.ts
      audio/core.ts                            # PR 6 (Task 1)
      ui/dialog.tsx, button.tsx, panel.tsx, key-chip.tsx   # PR 7 (Task 6)
      app.ts                                   # PR 19 (Task 21)
      install.ts                               # PR 19 (Task 27)
      ui/install-bar.tsx, install-page.ts      # PR 19 (Task 28)
      build/icons.mjs, build/icons.test.mjs    # PR 19 (Task 19)
      php/install-core.php, php/tests/InstallCoreTest.php  # PR 19 (Tasks 20, 29)
      test/audio.ts, audio.test.mjs            # PR 6 (Task 1)
      test/dom-stub.mjs (moved from tankity), tsx.ts, tsx.test.mjs, fixture/hello.tsx  # PR 7 (Task 5)
      test/ui.test.mjs                         # PR 7 (Task 6)
      test/app.test.mjs                        # PR 19 (Task 21)
      test/install.test.mjs, install-bar.test.mjs  # PR 19 (Tasks 27, 28)
    crete/
      index.html, game.css                     # PR 7 mount points; PR 19 Quit button and dist/install.js
      src/audio.ts                             # PR 6
      src/ui.ts                                # PR 7, 9, 19
      src/ui/end.tsx, ui/inventory.tsx         # PR 7
      src/ui/title.tsx                         # PR 19
      src/grid.ts, src/bots.ts                 # PR 9
      src/engine.ts, src/main.ts               # PR 9, 19
      tools/icon.svg                           # PR 19
      build.json, tools/install-files.php      # PR 19: dist/install.js, built and versioned
      test/audio.test.mjs, ui.test.mjs, bots.test.mjs, maze-rule.test.mjs, maze-sweep.test.mjs
    cylon/
      mount.html                               # PR 8 mount points; PR 19 exit hint
      css/help.css                             # PR 19 exit hint style
      src/audio.ts                             # PR 6
      src/scores.ts                            # PR 8: rows as data
      src/ui/board.tsx, help.tsx, gameover.tsx, settings.tsx  # PR 8
      src/gameover.ts, chrome.ts, main.ts      # PR 8, 19 (main.ts: Install and Share in the game bar)
      tools/icon.svg                           # PR 19
      test/audio.test.mjs (rewritten), ui.test.mjs (new), scores.test.mjs, smoke.test.mjs
    tankity/
      src/audio.ts                             # PR 6
      src/menu.ts, src/ui/menu.tsx, src/main.ts  # PR 19 Quit (on Plan C's menu and backToTitle)
      tools/icon.svg                           # PR 19
      index.html, build.json, tools/install-files.php  # PR 19: dist/install.js, built and versioned
      test/audio.test.mjs (rewritten), ui.test.mjs, smoke.test.mjs (imports); menu.test.mjs (PR 19, Plan C's file)
```

Removed by the end: `games/tankity/test/dom-stub.mjs` (moved into the kit), Cylon's `formatHighScoreRows`, the help and game-over markup in `cylon/mount.html`, the settings-panel markup in `index.html`, Crete's `#end-veil` and inventory markup in `crete/index.html`, Crete's `MISTAKE_BUDGET`, `Layout.margin` and `State.budget`.

---

# PR 6: Kit `audio/core.ts`, adopted by all three games

Branch `games/kit-audio`. No gameplay changes; every game sounds as it did.

### Task 1: The kit's audio core and its fake context

**Files:**
- Create: `websites/www.cs/games/_kit/audio/core.ts`
- Create: `websites/www.cs/games/_kit/test/audio.ts`
- Create: `websites/www.cs/games/_kit/test/audio.test.mjs`
- Modify: `websites/www.cs/games/_kit/tsconfig.json`, `websites/www.cs/games/_kit/README.md`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `type BusName = 'sfx' | 'music'`
  - `interface ToneSpec { freq: number; dur: number; type?: OscillatorType; vol?: number; slideTo?: number | null; slideDur?: number; when?: number; attack?: number }`
  - `interface NoiseSpec { dur: number; vol: number; filterType?: BiquadFilterType; filterFreq?: number; slideTo?: number | null; when?: number; source?: 'loop' | 'fade' }`
  - `interface AudioCore { context(): AudioContext | null; peek(): AudioContext | null; bus(name: BusName): GainNode | null; setGain(name: BusName, gain: number): void; setMuted(name: BusName, muted: boolean): void; isMuted(name: BusName): boolean; unlock(onReady?: () => void): void; suspend(): void; tone(spec: ToneSpec, to?: BusName | AudioNode): void; noise(spec: NoiseSpec, to?: BusName | AudioNode): void }`
  - `createAudioCore(opts?: { createContext?: () => AudioContext | null }): AudioCore`
  - Test double `fakeAudioContext(state?: string): FakeContext` (in `_kit/test/audio.ts`): records `nodes` (each `{ kind: 'gain'|'osc'|'filter'|'source', to, started, stopped, gain?, frequency?, buffer?, loop? }`), each param's `calls` (`['set'|'exp'|'lin'|'cancel', value, time]`), `buffers`, `resumes`, `suspends`; `currentTime` is 10, `sampleRate` 8000; `decodeAudioData(bytes)` resolves to a 10 s buffer whose `file` is `bytes.file`.

- [ ] **Step 1: Write the fake context**

```ts
// websites/www.cs/games/_kit/test/audio.ts
// A recording stand-in for AudioContext, so audio code runs under Node: every
// node it makes, every call on a gain or frequency, and the context's state.
export type ParamCall = [kind: 'set' | 'exp' | 'lin' | 'cancel', value: number, time: number];

export interface FakeParam {
  value: number;
  calls: ParamCall[];
  setValueAtTime(v: number, t: number): void;
  exponentialRampToValueAtTime(v: number, t: number): void;
  linearRampToValueAtTime(v: number, t: number): void;
  cancelScheduledValues(t: number): void;
}

export interface FakeBuffer {
  file?: string;
  length: number;
  sampleRate: number;
  duration: number;
  getChannelData(ch: number): Float32Array;
}

export interface FakeNode {
  kind: 'gain' | 'osc' | 'filter' | 'source';
  to: unknown[];
  started: number | null;
  stopped: number | null;
  type?: string;
  gain?: FakeParam;
  frequency?: FakeParam;
  Q?: FakeParam;
  buffer?: FakeBuffer | null;
  loop?: boolean;
  onended?: (() => void) | null;
  connect(target: unknown): void;
  disconnect(): void;
  start(when?: number): void;
  stop(when?: number): void;
}

export interface FakeContext {
  state: string;
  currentTime: number;
  sampleRate: number;
  destination: { kind: 'destination' };
  nodes: FakeNode[];
  buffers: number;
  resumes: number;
  suspends: number;
  resume(): Promise<void>;
  suspend(): Promise<void>;
  createGain(): FakeNode;
  createOscillator(): FakeNode;
  createBiquadFilter(): FakeNode;
  createBufferSource(): FakeNode;
  createBuffer(channels: number, length: number, rate: number): FakeBuffer;
  decodeAudioData(bytes: { file?: string }): Promise<FakeBuffer>;
}

function param(value: number): FakeParam {
  return {
    value,
    calls: [],
    setValueAtTime(v, t) { this.value = v; this.calls.push(['set', v, t]); },
    exponentialRampToValueAtTime(v, t) { this.calls.push(['exp', v, t]); },
    linearRampToValueAtTime(v, t) { this.calls.push(['lin', v, t]); },
    cancelScheduledValues(t) { this.calls.push(['cancel', 0, t]); },
  };
}

export function fakeAudioContext(state = 'running'): FakeContext {
  const ctx: FakeContext = {
    state,
    currentTime: 10,
    sampleRate: 8000,
    destination: { kind: 'destination' },
    nodes: [],
    buffers: 0,
    resumes: 0,
    suspends: 0,
    resume() { ctx.resumes++; ctx.state = 'running'; return Promise.resolve(); },
    suspend() { ctx.suspends++; ctx.state = 'suspended'; return Promise.resolve(); },
    createGain: () => node('gain', { gain: param(1) }),
    createOscillator: () => node('osc', { type: 'sine', frequency: param(440) }),
    createBiquadFilter: () => node('filter', { type: 'lowpass', frequency: param(350), Q: param(1) }),
    createBufferSource: () => node('source', { buffer: null, loop: false }),
    createBuffer(_channels, length, rate) {
      ctx.buffers++;
      const data = new Float32Array(length);
      return { length, sampleRate: rate, duration: length / rate, getChannelData: () => data };
    },
    decodeAudioData(bytes) {
      const data = new Float32Array(1000).fill(0.5);
      return Promise.resolve({ file: bytes.file, length: 1000, sampleRate: 100, duration: 10, getChannelData: () => data });
    },
  };
  function node(kind: FakeNode['kind'], extra: Partial<FakeNode>): FakeNode {
    const n: FakeNode = {
      kind,
      to: [],
      started: null,
      stopped: null,
      onended: null,
      connect(target) { n.to.push(target); },
      disconnect() { n.to = []; },
      start(when) { n.started = when ?? ctx.currentTime; },
      stop(when) { n.stopped = when ?? ctx.currentTime; },
      ...extra,
    };
    ctx.nodes.push(n);
    return n;
  }
  return ctx;
}
```

- [ ] **Step 2: Write the failing tests**

```js
// websites/www.cs/games/_kit/test/audio.test.mjs
// The audio core against the recording fake context: lazy creation, the two
// buses, mute and gain, the gesture unlock, and the tone and noise envelopes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAudioCore } from '../audio/core.ts';
import { fakeAudioContext } from './audio.ts';

const rig = (state) => {
  const ctx = fakeAudioContext(state);
  return { ctx, core: createAudioCore({ createContext: () => ctx }) };
};
const gains = ctx => ctx.nodes.filter(n => n.kind === 'gain');
const round = calls => calls.map(([k, v, t]) => [k, +v.toFixed(6), +t.toFixed(6)]);
const tick = () => new Promise(r => setImmediate(r));

test('without Web Audio every call is silent and none throws', () => {
  const core = createAudioCore({ createContext: () => null });
  assert.doesNotThrow(() => {
    core.tone({ freq: 440, dur: 0.1 });
    core.noise({ dur: 0.1, vol: 0.1 });
    core.unlock(() => { throw new Error('never ready'); });
    core.setGain('music', 0.5);
    core.setMuted('sfx', true);
    core.suspend();
  });
  assert.equal(core.context(), null);
  assert.equal(core.bus('sfx'), null);
});

test('a context that throws while being made counts as none', () => {
  const core = createAudioCore({ createContext: () => { throw new Error('too many contexts'); } });
  assert.doesNotThrow(() => core.tone({ freq: 440, dur: 0.1 }));
  assert.equal(core.context(), null);
});

test('nothing is made before the first sound; then one context with the sfx and music buses', () => {
  let made = 0;
  const ctx = fakeAudioContext();
  const core = createAudioCore({ createContext: () => { made++; return ctx; } });
  assert.equal(made, 0);
  assert.equal(core.peek(), null);
  core.tone({ freq: 440, dur: 0.1 });
  core.tone({ freq: 220, dur: 0.1 });
  assert.equal(made, 1);
  const [sfx, music] = gains(ctx);
  assert.equal(core.bus('sfx'), sfx);
  assert.equal(core.bus('music'), music);
  assert.deepEqual(ctx.nodes.filter(n => n.to.includes(ctx.destination)), [sfx, music]);
});

test('a context that could not be made is asked for again next time', () => {
  let ready = false;
  const ctx = fakeAudioContext();
  const core = createAudioCore({ createContext: () => (ready ? ctx : null) });
  core.tone({ freq: 440, dur: 0.1 });
  ready = true;
  core.tone({ freq: 440, dur: 0.1 });
  assert.equal(core.peek(), ctx);
});

test('a muted bus makes nothing, not even the context', () => {
  let made = 0;
  const core = createAudioCore({ createContext: () => { made++; return fakeAudioContext(); } });
  core.setMuted('sfx', true);
  core.tone({ freq: 440, dur: 0.1 });
  core.noise({ dur: 0.1, vol: 0.1 });
  assert.equal(made, 0);
  assert.equal(core.isMuted('sfx'), true);
});

test('a muted bus has gain 0, and unmuting restores the gain set for it', () => {
  const { ctx, core } = rig();
  core.setGain('sfx', 0.7);
  core.context();
  const sfx = gains(ctx)[0];
  assert.equal(sfx.gain.value, 0.7);
  core.setMuted('sfx', true);
  assert.equal(sfx.gain.value, 0);
  core.setMuted('sfx', false);
  assert.equal(sfx.gain.value, 0.7);
});

test('setGain cancels any ramp and sets the value at once', () => {
  const { ctx, core } = rig();
  core.context();
  core.setGain('music', 0.25);
  const music = gains(ctx)[1];
  assert.deepEqual(round(music.gain.calls).slice(-2), [['cancel', 0, 10], ['set', 0.25, 10]]);
});

test('a tone without attack starts at its volume and falls to silence over its duration', () => {
  const { ctx, core } = rig();
  core.tone({ freq: 300, dur: 0.2, vol: 0.06, when: 0.1, slideTo: 100, type: 'sawtooth' });
  const osc = ctx.nodes.find(n => n.kind === 'osc');
  const env = osc.to[0];
  assert.equal(osc.type, 'sawtooth');
  assert.deepEqual(round(env.gain.calls), [['set', 0.06, 10.1], ['exp', 0.0001, 10.3]]);
  assert.deepEqual(round(osc.frequency.calls), [['set', 300, 10.1], ['exp', 100, 10.3]]);
  assert.equal(+osc.started.toFixed(6), 10.1);
  assert.equal(+osc.stopped.toFixed(6), 10.32);
  assert.equal(env.to[0], core.bus('sfx'));
});

test('a tone with attack rises from silence first; a slide can be shorter than the tone', () => {
  const { ctx, core } = rig();
  core.tone({ freq: 160, dur: 0.15, vol: 0.24, attack: 0.01, slideTo: 38, slideDur: 0.13 }, 'music');
  const osc = ctx.nodes.find(n => n.kind === 'osc');
  const env = osc.to[0];
  assert.deepEqual(round(env.gain.calls), [['set', 0.0001, 10], ['exp', 0.24, 10.01], ['exp', 0.0001, 10.15]]);
  assert.deepEqual(round(osc.frequency.calls), [['set', 160, 10], ['exp', 38, 10.13]]);
  assert.equal(env.to[0], core.bus('music'));
});

test('a tone defaults to a square wave at 0.05', () => {
  const { ctx, core } = rig();
  core.tone({ freq: 440, dur: 0.1 });
  const osc = ctx.nodes.find(n => n.kind === 'osc');
  assert.equal(osc.type, 'square');
  assert.equal(osc.to[0].gain.calls[0][1], 0.05);
});

test('a tone can go to any node, past both buses', () => {
  const { ctx, core } = rig();
  const target = ctx.createGain();
  core.tone({ freq: 440, dur: 0.1 }, target);
  const env = ctx.nodes.find(n => n.kind === 'osc').to[0];
  assert.equal(env.to[0], target);
});

test('looping noise shares one second of white noise; a fading burst gets its own buffer', () => {
  const { ctx, core } = rig();
  core.noise({ dur: 0.3, vol: 0.1, filterFreq: 900, slideTo: 4200 });
  core.noise({ dur: 0.3, vol: 0.1 });
  assert.equal(ctx.buffers, 1);
  const loops = ctx.nodes.filter(n => n.kind === 'source');
  assert.ok(loops.every(s => s.loop === true && s.buffer === loops[0].buffer));
  const filter = ctx.nodes.find(n => n.kind === 'filter');
  assert.equal(filter.type, 'lowpass');
  assert.deepEqual(round(filter.frequency.calls), [['set', 900, 10], ['exp', 4200, 10.3]]);
  core.noise({ dur: 0.2, vol: 0.1, source: 'fade', filterType: 'bandpass' });
  core.noise({ dur: 0.2, vol: 0.1, source: 'fade' });
  assert.equal(ctx.buffers, 3);
  const burst = ctx.nodes.filter(n => n.kind === 'source').at(-1);
  assert.equal(burst.loop, false);
  const data = burst.buffer.getChannelData(0);
  assert.ok(Math.abs(data[data.length - 1]) < 0.01, 'the burst fades to silence');
});

test('unlock resumes a suspended context, primes it once and reports ready once', async () => {
  const { ctx, core } = rig('suspended');
  let ready = 0;
  core.unlock(() => { ready++; });
  await tick();
  assert.equal(ctx.state, 'running');
  assert.ok(ctx.resumes >= 1);
  assert.equal(ready, 1);
  const oscs = ctx.nodes.filter(n => n.kind === 'osc').length;
  core.unlock(() => { ready++; });
  await tick();
  assert.equal(ready, 1);
  assert.equal(ctx.nodes.filter(n => n.kind === 'osc').length, oscs);
});

test('suspend suspends a context that exists and makes none that does not', () => {
  const { ctx, core } = rig();
  core.suspend();
  assert.equal(ctx.suspends, 0);
  core.context();
  core.suspend();
  assert.equal(ctx.suspends, 1);
});
```

- [ ] **Step 3: Run them to see them fail**

Run: `cd websites/www.cs/games && node --test _kit/test/audio.test.mjs`
Expected: FAIL, `Cannot find module '.../_kit/audio/core.ts'`.

- [ ] **Step 4: Write the core**

```ts
// websites/www.cs/games/_kit/audio/core.ts
// Each game's one Web Audio context behind a facade: made on first use,
// resumed and primed by a gesture, an sfx and a music bus whose gain and mute
// the game sets, and the two envelopes every voice is built from. Voices and
// music stay in the games. Without Web Audio it is silent and never throws.
export type BusName = 'sfx' | 'music';

export interface ToneSpec {
  freq: number;
  /** Seconds the gain takes to fall to silence. */
  dur: number;
  type?: OscillatorType;
  /** Peak gain. */
  vol?: number;
  /** An exponential pitch slide to this frequency over `slideDur` (default `dur`). */
  slideTo?: number | null;
  slideDur?: number;
  /** Seconds from now. */
  when?: number;
  /** Seconds of exponential rise from silence; without it the tone starts at full `vol`. */
  attack?: number;
}

export interface NoiseSpec {
  dur: number;
  vol: number;
  filterType?: BiquadFilterType;
  filterFreq?: number;
  /** An exponential filter sweep to this frequency over `dur`. */
  slideTo?: number | null;
  when?: number;
  /** 'loop': one shared second of white noise. 'fade': a fresh burst whose samples fade out. */
  source?: 'loop' | 'fade';
}

export interface AudioCore {
  /** The context, made on first call and resumed if suspended; null without Web Audio. */
  context(): AudioContext | null;
  /** The context if one was made, without making or resuming it. */
  peek(): AudioContext | null;
  bus(name: BusName): GainNode | null;
  /** Sets a bus's gain at once, cancelling any ramp; remembered for a bus not made yet. */
  setGain(name: BusName, gain: number): void;
  /** A muted bus is silent, and a tone or noise sent to it makes nothing, not even the context. */
  setMuted(name: BusName, muted: boolean): void;
  isMuted(name: BusName): boolean;
  /** For a gesture: makes and resumes the context; the first time it runs, a silent blip primes it and onReady is called. */
  unlock(onReady?: () => void): void;
  suspend(): void;
  tone(spec: ToneSpec, to?: BusName | AudioNode): void;
  noise(spec: NoiseSpec, to?: BusName | AudioNode): void;
}

export interface AudioCoreOptions {
  /** Makes the context; the default uses AudioContext, or webkitAudioContext. */
  createContext?: () => AudioContext | null;
}

/** An exponential ramp cannot reach 0, so silence is this. */
const SILENT = 0.0001;
const BUSES: readonly BusName[] = ['sfx', 'music'];

function defaultContext(): AudioContext | null {
  const g = globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Make = g.AudioContext || g.webkitAudioContext;
  return Make ? new Make() : null;
}

export function createAudioCore(opts: AudioCoreOptions = {}): AudioCore {
  const make = opts.createContext ?? defaultContext;
  let ctx: AudioContext | null = null;
  let primed = false;
  let loopNoise: AudioBuffer | null = null;
  const gains: Record<BusName, number> = { sfx: 1, music: 1 };
  const muted: Record<BusName, boolean> = { sfx: false, music: false };
  const buses: Partial<Record<BusName, GainNode>> = {};

  function applyGain(name: BusName): void {
    const node = buses[name];
    if (!node || !ctx) return;
    const v = muted[name] ? 0 : gains[name];
    try {
      // A hard set: a ramp still scheduled from before would override it.
      node.gain.cancelScheduledValues(ctx.currentTime);
      node.gain.setValueAtTime(v, ctx.currentTime);
    } catch {
      node.gain.value = v;
    }
  }

  function context(): AudioContext | null {
    if (!ctx) {
      // Asked again on every call: a page can gain Web Audio later (a test, a polyfill).
      try {
        ctx = make();
      } catch {
        ctx = null;
      }
      if (!ctx) return null;
      for (const name of BUSES) {
        const g = ctx.createGain();
        g.connect(ctx.destination);
        buses[name] = g;
        applyGain(name);
      }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function output(to: BusName | AudioNode | undefined): { c: AudioContext; node: AudioNode } | null {
    const name = to === undefined ? 'sfx' : typeof to === 'string' ? to : null;
    if (name && muted[name]) return null;
    const c = context();
    if (!c) return null;
    const node = name ? buses[name] : (to as AudioNode);
    return node ? { c, node } : null;
  }

  function tone(s: ToneSpec, to?: BusName | AudioNode): void {
    const out = output(to);
    if (!out) return;
    const { c, node } = out;
    try {
      const t = c.currentTime + (s.when ?? 0);
      const vol = s.vol ?? 0.05;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = s.type ?? 'square';
      o.frequency.setValueAtTime(s.freq, t);
      if (s.slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, s.slideTo), t + (s.slideDur ?? s.dur));
      if (s.attack) {
        g.gain.setValueAtTime(SILENT, t);
        g.gain.exponentialRampToValueAtTime(vol, t + s.attack);
      } else {
        g.gain.setValueAtTime(vol, t);
      }
      g.gain.exponentialRampToValueAtTime(SILENT, t + s.dur);
      o.connect(g);
      g.connect(node);
      o.start(t);
      o.stop(t + s.dur + 0.02);
    } catch {
      // A closed or broken context: this voice stays silent.
    }
  }

  function noise(s: NoiseSpec, to?: BusName | AudioNode): void {
    const out = output(to);
    if (!out) return;
    const { c, node } = out;
    try {
      const t = c.currentTime + (s.when ?? 0);
      const src = c.createBufferSource();
      if (s.source === 'fade') {
        const len = Math.max(1, Math.floor(c.sampleRate * s.dur));
        const buf = c.createBuffer(1, len, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        src.buffer = buf;
      } else {
        if (!loopNoise) {
          loopNoise = c.createBuffer(1, c.sampleRate, c.sampleRate);
          const data = loopNoise.getChannelData(0);
          for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        }
        src.buffer = loopNoise;
        src.loop = true;
      }
      const f = c.createBiquadFilter();
      f.type = s.filterType ?? 'lowpass';
      f.frequency.setValueAtTime(s.filterFreq ?? 1200, t);
      if (s.slideTo) f.frequency.exponentialRampToValueAtTime(Math.max(1, s.slideTo), t + s.dur);
      const g = c.createGain();
      g.gain.setValueAtTime(s.vol, t);
      g.gain.exponentialRampToValueAtTime(SILENT, t + s.dur);
      src.connect(f);
      f.connect(g);
      g.connect(node);
      src.start(t);
      src.stop(t + s.dur + 0.02);
    } catch {
      // As for tone.
    }
  }

  function unlock(onReady?: () => void): void {
    const c = context();
    if (!c || primed) return;
    const prime = (): void => {
      if (primed || c.state !== 'running') return;
      primed = true;
      try {
        const g = c.createGain();
        g.gain.value = SILENT;
        const o = c.createOscillator();
        o.connect(g);
        g.connect(c.destination);
        o.start();
        o.stop(c.currentTime + 0.01);
      } catch {
        // Priming is a courtesy for iOS; a context that refuses it still plays.
      }
      onReady?.();
    };
    if (c.state === 'running') prime();
    else c.resume().then(prime, () => {});
  }

  return {
    context,
    peek: () => ctx,
    bus: name => buses[name] ?? null,
    setGain(name, gain) { gains[name] = gain; applyGain(name); },
    setMuted(name, m) { muted[name] = m; applyGain(name); },
    isMuted: name => muted[name],
    unlock,
    suspend() { ctx?.suspend().catch(() => {}); },
    tone,
    noise,
  };
}
```

- [ ] **Step 5: Type-check it with the kit and run the tests**

In `websites/www.cs/games/_kit/tsconfig.json`, change `"include": ["*.ts", "test/*.ts"]` to `"include": ["*.ts", "audio/*.ts", "test/*.ts"]`.

Run: `cd websites/www.cs/games && node --test _kit/test/audio.test.mjs && node_modules/.bin/tsc -p _kit/tsconfig.json`
Expected: every test passes; tsc prints nothing.

- [ ] **Step 6: Document it**

Add to `websites/www.cs/games/_kit/README.md`, after the "Saved settings" section:

```markdown
## Sound (`audio/core.ts`)

`createAudioCore()` is a facade over the game's one `AudioContext`. It makes
the context on the first sound, resumes it when suspended, and gives it two
buses, `sfx` and `music`, each a gain node to the speakers. `setGain` and
`setMuted` set a bus at once (a muted bus is 0, and nothing sent to it is even
made); `unlock(onReady)` is for a gesture: it resumes the context and, the
first time it runs, primes it with a silent blip and calls `onReady`.
`tone(spec, bus)` and `noise(spec, bus)` are the two envelopes every voice is
built from: an oscillator or filtered noise whose gain falls exponentially to
silence, with an optional attack and pitch or filter slide. Voices, songs and
what each setting means stay in the game. Without Web Audio, or when making
the context throws, every call is silent. Tests use `fakeAudioContext()` from
`test/audio.ts`, which records every node and parameter call.
```

- [ ] **Step 7: Commit**

```bash
git add websites/www.cs/games/_kit/audio websites/www.cs/games/_kit/test/audio.ts websites/www.cs/games/_kit/test/audio.test.mjs websites/www.cs/games/_kit/tsconfig.json websites/www.cs/games/_kit/README.md
git commit -m "Games kit: audio core (one context, sfx and music buses, tone and noise envelopes)"
```

### Task 2: Crete's sound on the core

**Files:**
- Modify: `websites/www.cs/games/crete/src/audio.ts` (whole file)
- Create: `websites/www.cs/games/crete/test/audio.test.mjs`
- Rebuild: `websites/www.cs/games/crete/dist/`, `index.html` `?v=`, `sw.js`

**Interfaces:**
- Consumes: `createAudioCore`, `AudioCore` (Task 1); `fakeAudioContext` (Task 1).
- Produces: `createAudio(core?: AudioCore): Audio` with the same `Audio` interface `src/main.ts` uses today (`ensure()`, `sfx(name)`, `toggleMute(): boolean`). `main.ts` is unchanged: it still calls `createAudio()`.

- [ ] **Step 1: Write the failing test**

```js
// websites/www.cs/games/crete/test/audio.test.mjs
// Crete's synth on the kit's audio core: each event's notes, the mute switch,
// and the gesture that wakes the speakers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAudio } from '../src/audio.ts';
import { createAudioCore } from '../../_kit/audio/core.ts';
import { fakeAudioContext } from '../../_kit/test/audio.ts';

const EVENTS = ['move', 'bump', 'pickup', 'page', 'open', 'bash', 'hurt', 'win', 'lose', 'heart', 'hint', 'answerOn', 'answerOff'];
const rig = (state) => {
  const ctx = fakeAudioContext(state);
  return { ctx, audio: createAudio(createAudioCore({ createContext: () => ctx })) };
};
const oscs = ctx => ctx.nodes.filter(n => n.kind === 'osc');

test('every event is voiced through the sfx bus', () => {
  const { ctx, audio } = rig();
  for (const name of EVENTS) {
    const before = oscs(ctx).length;
    audio.sfx(name);
    assert.ok(oscs(ctx).length > before, name);
  }
  const sfxBus = ctx.nodes.filter(n => n.kind === 'gain')[0];
  assert.ok(oscs(ctx).every(o => o.to[0].to[0] === sfxBus));
});

test('the win is four rising square notes a tenth of a second apart', () => {
  const { ctx, audio } = rig();
  audio.sfx('win');
  const notes = oscs(ctx);
  assert.deepEqual(notes.map(o => o.frequency.calls[0][1]), [523, 659, 784, 1046]);
  assert.deepEqual(notes.map(o => +(o.started - 10).toFixed(6)), [0, 0.1, 0.2, 0.3]);
  assert.ok(notes.every(o => o.type === 'square'));
});

test('a note with no volume of its own plays at 0.04', () => {
  const { ctx, audio } = rig();
  audio.sfx('move');
  assert.equal(oscs(ctx)[0].to[0].gain.calls[0][1], 0.04);
});

test('muting silences every event; unmuting brings them back', () => {
  const { ctx, audio } = rig();
  assert.equal(audio.toggleMute(), true);
  for (const name of EVENTS) audio.sfx(name);
  assert.equal(oscs(ctx).length, 0);
  assert.equal(audio.toggleMute(), false);
  audio.sfx('move');
  assert.equal(oscs(ctx).length, 1);
});

test('ensure wakes a suspended context, but not while muted', async () => {
  const muted = rig('suspended');
  muted.audio.toggleMute();
  muted.audio.ensure();
  assert.equal(muted.ctx.resumes, 0);
  const { ctx, audio } = rig('suspended');
  audio.ensure();
  await new Promise(r => setImmediate(r));
  assert.equal(ctx.state, 'running');
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd websites/www.cs/games/crete && node --test test/audio.test.mjs`
Expected: FAIL: today's `createAudio` takes no core, reaches for `window` and throws `ReferenceError: window is not defined` on the first `sfx`.

- [ ] **Step 3: Replace `src/audio.ts`**

```ts
/* The Island of Crete: sound. A tiny synth on the kit's audio core, no
 * assets: the engine names an event (`sfx('hurt')`) and this module voices
 * it. A muted player, or a browser without Web Audio, hears nothing. DOM
 * program (src/tsconfig.dom.json). */
import { createAudioCore } from '../../_kit/audio/core.ts';
import type { AudioCore } from '../../_kit/audio/core.ts';
import type { SfxName } from './engine.ts';

export interface Audio {
  /** Wake the audio context; call from a user gesture. */
  ensure(): void;
  sfx(name: SfxName): void;
  /** Flip the mute switch; returns whether the sound is now muted. */
  toggleMute(): boolean;
}

type Voice = [freq: number, dur: number, type?: OscillatorType, vol?: number, when?: number];

/** Each event as the tones it plays, in order. */
const VOICES: Record<SfxName, Voice[]> = {
  move: [[220, 0.05]],
  bump: [[90, 0.09, "sine", 0.06]],
  pickup: [[660, 0.06], [880, 0.08, "square", 0.04, 0.06]],
  page: [[523, 0.08, "sine"], [659, 0.08, "sine", 0.04, 0.08], [784, 0.1, "sine", 0.04, 0.16]],
  open: [[330, 0.07], [495, 0.1, "square", 0.04, 0.07]],
  bash: [[140, 0.12, "sawtooth", 0.06], [90, 0.1, "sine", 0.06, 0.05]],
  hurt: [[300, 0.15, "sawtooth", 0.05], [190, 0.2, "sawtooth", 0.05, 0.1]],
  win: [523, 659, 784, 1046].map((f, i): Voice => [f, 0.12, "square", 0.04, i * 0.1]),
  lose: [[160, 0.4, "sawtooth", 0.06], [110, 0.55, "sawtooth", 0.06, 0.2]],
  heart: [[70, 0.1, "sine", 0.07]],
  hint: [[980, 0.07, "sine", 0.04]],
  answerOn: [[740, 0.08, "sine", 0.04]],
  answerOff: [[420, 0.08, "sine", 0.04]],
};

export function createAudio(core: AudioCore = createAudioCore()): Audio {
  return {
    ensure() {
      if (!core.isMuted("sfx")) core.unlock();
    },
    sfx(name) {
      for (const [freq, dur, type, vol, when] of VOICES[name]) {
        core.tone({ freq, dur, type: type ?? "square", vol: vol ?? 0.04, when: when ?? 0 });
      }
    },
    toggleMute() {
      const muted = !core.isMuted("sfx");
      core.setMuted("sfx", muted);
      if (!muted) core.unlock();
      return muted;
    },
  };
}
```

- [ ] **Step 4: Run the tests, rebuild, and check the page**

Run: `cd websites/www.cs/games/crete && node --test test/audio.test.mjs && cd .. && node _kit/build/build.mjs crete && php crete/tools/install-files.php && crete/test.sh`
Expected: all pass; the build writes `crete/dist/main.js` and `.map`; install-files rewrites `index.html` and `sw.js`.

- [ ] **Step 5: Commit**

```bash
git add -A websites/www.cs/games/crete
git commit -m "Crete: sound on the kit's audio core"
```

### Task 3: Cylon's sound on the core

**Files:**
- Modify: `websites/www.cs/games/cylon/src/audio.ts` (`createAudio`'s plumbing: lines 203–330 and the two envelope helpers at 508–551)
- Rewrite: `websites/www.cs/games/cylon/test/audio.test.mjs` (onto `node:test`, the kit fake)
- Rebuild: `cylon/dist/`, then `php tools/site-versions.php`

**Interfaces:**
- Consumes: `createAudioCore` (Task 1), `fakeAudioContext` (Task 1).
- Produces: the same `createAudio(deps: AudioDeps): CylonAudio` contract (`sfx`, `prime`, `unlock`, `syncMusic`, `settingChanged`). `AudioDeps.createContext` stays and is handed to the core.

- [ ] **Step 1: Rewrite the test onto `node:test` and the kit fake**

```js
// websites/www.cs/games/cylon/test/audio.test.mjs
// Cylon's sound against the kit's recording fake context: the effects go
// through the sfx bus, the buses follow the settings, the music bed follows
// the session, and a gesture primes the context once.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAudio } from '../src/audio.ts';
import { volumeToGain } from '../src/rules.ts';
import { fakeAudioContext } from '../../_kit/test/audio.ts';

// The music bed's scheduler is a real interval; unref it so a finished file does not wait on it.
const realSetInterval = globalThis.setInterval;
globalThis.setInterval = (...args) => realSetInterval(...args).unref();
const tick = () => new Promise(resolve => setImmediate(resolve));

const SFX = ['projectile', 'hit', 'heal', 'ko', 'nuke', 'raptor', 'grenadeArm', 'grenade', 'missile', 'trackerMissile', 'introLaunch', 'nukeLaunch'];
const oscs = ctx => ctx.nodes.filter(n => n.kind === 'osc').length;
// The core makes the sfx bus, then the music bus, as the context's first two gains.
const sfxBus = ctx => ctx.nodes.filter(n => n.kind === 'gain')[0];
const musicBus = ctx => ctx.nodes.filter(n => n.kind === 'gain')[1];

function rig({ ctx = fakeAudioContext(), settings = {}, session = true, noWebAudio = false } = {}) {
  const state = {
    settings: { soundEnabled: true, soundVolume: 50, musicEnabled: true, musicVolume: 50, ...settings },
    session,
  };
  const audio = createAudio({
    settings: () => state.settings,
    sessionActive: () => state.session,
    volumeToGain,
    createContext: noWebAudio ? () => null : () => ctx,
  });
  return { audio, ctx, state };
}

test('without Web Audio every entry point is a silent no-op', () => {
  const { audio } = rig({ noWebAudio: true });
  assert.doesNotThrow(() => {
    SFX.forEach(n => audio.sfx(n));
    audio.prime();
    audio.unlock();
    audio.syncMusic();
    audio.settingChanged('soundEnabled');
    audio.settingChanged('musicVolume');
  });
});

test('Node has no AudioContext, so the default context finder stays silent', () => {
  const audio = createAudio({
    settings: () => ({ soundEnabled: true, soundVolume: 50, musicEnabled: true, musicVolume: 50 }),
    sessionActive: () => true,
    volumeToGain,
  });
  assert.doesNotThrow(() => { audio.sfx('hit'); audio.unlock(); audio.syncMusic(); });
});

test('every effect is built behind the sfx bus; only the two buses reach the speakers', () => {
  const { audio, ctx } = rig({ session: false });
  audio.prime();
  const before = ctx.nodes.length;
  SFX.forEach(n => audio.sfx(n));
  assert.ok(ctx.nodes.length > before);
  const toSpeakers = ctx.nodes.filter(n => n.to.includes(ctx.destination));
  assert.deepEqual(toSpeakers, [sfxBus(ctx), musicBus(ctx)]);
  assert.ok(ctx.nodes.filter(n => n.to.includes(sfxBus(ctx))).length > SFX.length);
});

for (const [name, settings] of [['sound off', { soundEnabled: false }], ['volume 0', { soundVolume: 0 }]]) {
  test(`${name} makes no effect and no context`, () => {
    const { audio, ctx } = rig({ settings, session: false });
    SFX.forEach(n => audio.sfx(n));
    audio.prime();
    assert.equal(ctx.nodes.length, 0);
  });
}

test('the sfx bus follows the volume and the mute', () => {
  const { audio, ctx, state } = rig({ session: false });
  audio.prime();
  assert.equal(sfxBus(ctx).gain.value, volumeToGain(50, 'sfx'));
  state.settings.soundVolume = 100;
  audio.settingChanged('soundVolume');
  assert.equal(sfxBus(ctx).gain.value, volumeToGain(100, 'sfx'));
  state.settings.soundEnabled = false;
  audio.settingChanged('soundEnabled');
  assert.equal(sfxBus(ctx).gain.value, 0);
  const nodes = ctx.nodes.length;
  audio.sfx('raptor');
  assert.equal(ctx.nodes.length, nodes, 'muted: no new effect');
  state.settings.soundEnabled = true;
  audio.settingChanged('soundEnabled');
  assert.equal(sfxBus(ctx).gain.value, volumeToGain(100, 'sfx'));
});

test('turning both sound and music off suspends the context', () => {
  const { audio, ctx, state } = rig();
  audio.prime();
  state.settings.soundEnabled = false;
  state.settings.musicEnabled = false;
  audio.settingChanged('soundEnabled');
  assert.equal(ctx.suspends, 1);
});

test('the music bed starts with the session, follows its volume, and stops on mute or when the session ends', async () => {
  const { audio, ctx, state } = rig();
  audio.syncMusic();
  await tick();
  assert.ok(oscs(ctx) > 0);
  assert.equal(musicBus(ctx).gain.value, volumeToGain(50, 'music'));
  state.settings.musicVolume = 90;
  audio.settingChanged('musicVolume');
  assert.equal(musicBus(ctx).gain.value, volumeToGain(90, 'music'));
  state.settings.musicEnabled = false;
  audio.settingChanged('musicEnabled');
  assert.equal(musicBus(ctx).gain.value, 0);
  const stopped = oscs(ctx);
  audio.syncMusic();
  assert.equal(oscs(ctx), stopped);
  state.settings.musicEnabled = true;
  audio.settingChanged('musicEnabled');
  await tick();
  assert.equal(musicBus(ctx).gain.value, volumeToGain(90, 'music'));
  assert.ok(oscs(ctx) > stopped);
  state.session = false;
  audio.syncMusic();
  assert.equal(musicBus(ctx).gain.value, 0);
});

test('no music outside a session or at volume 0', async () => {
  const outside = rig({ session: false });
  outside.audio.syncMusic();
  await tick();
  assert.equal(outside.ctx.nodes.length, 0);
  const quiet = rig({ settings: { musicVolume: 0 } });
  quiet.audio.syncMusic();
  await tick();
  assert.equal(oscs(quiet.ctx), 0);
});

test('the first gesture resumes a suspended context and starts the bed once', async () => {
  const ctx = fakeAudioContext('suspended');
  const { audio } = rig({ ctx });
  audio.unlock();
  await tick();
  assert.equal(ctx.state, 'running');
  const after = oscs(ctx);
  assert.ok(after > 1, 'the priming blip and the bed');
  audio.unlock();
  await tick();
  assert.equal(oscs(ctx), after);
});

test('a gesture with sound and music both off opens nothing', () => {
  const { audio, ctx } = rig({ settings: { soundEnabled: false, musicEnabled: false } });
  audio.unlock();
  assert.equal(ctx.nodes.length, 0);
});

test('the settings are read live, even when the object is replaced', () => {
  const ctx = fakeAudioContext();
  let current = { soundEnabled: true, soundVolume: 50, musicEnabled: false, musicVolume: 50 };
  const audio = createAudio({ settings: () => current, sessionActive: () => true, volumeToGain, createContext: () => ctx });
  audio.prime();
  current = { ...current, soundVolume: 100 };
  audio.settingChanged('soundVolume');
  assert.equal(sfxBus(ctx).gain.value, volumeToGain(100, 'sfx'));
});
```

- [ ] **Step 2: Run it to see what fails**

Run: `cd websites/www.cs/games/cylon && node --test test/audio.test.mjs`
Expected: most pass already (the contract is unchanged); "sound off makes no effect and no context" may pass too. The suite must pass again after Step 3 with no test edited.

- [ ] **Step 3: Move `createAudio`'s plumbing onto the core**

At the top of `src/audio.ts`, after the header comment, add:

```ts
import { createAudioCore } from '../../_kit/audio/core.ts';
```

Replace the start of `createAudio` through the end of `unlock` (today lines 203–287, from `export function createAudio(deps: AudioDeps): CylonAudio {` through the closing `}` of `function unlock(): void {…}`) with:

```ts
export function createAudio(deps: AudioDeps): CylonAudio {
  const settings = deps.settings;
  const core = createAudioCore({ createContext: deps.createContext });

  let musicMaster: GainNode | null = null;
  let musicNodes: AudioNode[] = [];
  let musicTimer: ReturnType<typeof setInterval> | null = null;
  let musicPlaying = false;

  /** The buses follow the settings: effects are muted when off or at 0, and the
   *  bed is heard only while it plays in a live session. */
  function applyBusVolumes(): void {
    const s = settings();
    core.setMuted('sfx', !s.soundEnabled || s.soundVolume <= 0);
    core.setGain('sfx', deps.volumeToGain(s.soundVolume, 'sfx'));
    const on = s.musicEnabled && deps.sessionActive() && musicPlaying;
    core.setGain('music', on ? deps.volumeToGain(s.musicVolume, 'music') : 0);
  }

  function ensureAudioContext(): AudioContext | null {
    applyBusVolumes();
    return core.context();
  }

  /** The context for an effect: none while effects are off. */
  function ensureAudio(): AudioContext | null {
    applyBusVolumes();
    return core.isMuted('sfx') ? null : core.context();
  }

  function unlock(): void {
    const s = settings();
    if (!s.soundEnabled && !s.musicEnabled) return;
    applyBusVolumes();
    core.unlock(syncMusic);
  }
```

In `stopMusic`, replace `const ctx = audioCtx;` with `const ctx = core.peek();`.

In `startMusic`, replace

```ts
    const ctx = ensureAudioContext();
    if (!ctx || !musicBus) return;
    const bus = musicBus;
```

with

```ts
    const ctx = ensureAudioContext();
    const bus = core.bus('music');
    if (!ctx || !bus) return;
```

In the bed's scheduler inside `startMusic` (the function that begins `if (!musicPlaying || !audioCtx || !musicMaster) return;`), add `const ac = core.peek();` as its first line, change that guard to `if (!musicPlaying || !ac || !musicMaster) return;`, and rename every later `audioCtx` in that function to `ac` (the `currentTime` read and the `pulseTaiko`, `pulseRitualHit`, `playDarkHorn`, `playTensionStrand` calls). `rg -n audioCtx src/audio.ts` must then print nothing.

Replace the two envelope helpers (`function playTone(…)` and `function playNoiseBurst(…)`, today lines 508–551) with:

```ts
  function playTone({ freq = 440, freqEnd = null, type = 'square', duration = 0.12, gain = 0.08, delay = 0 }: ToneSpec): void {
    core.tone({ freq, dur: duration, type, vol: gain, slideTo: freqEnd, when: delay, attack: 0.01 });
  }

  function playNoiseBurst({ duration = 0.18, gain = 0.06, delay = 0, filterFreq = 900, filterType = 'bandpass' }: NoiseSpec = {}): void {
    core.noise({ dur: duration, vol: gain, when: delay, filterFreq, filterType, source: 'fade' });
  }
```

Replace the returned object (today `return { sfx(name) { voices[name](); }, prime() { ensureAudio(); }, unlock, syncMusic, settingChanged(key) {…} };`) with:

```ts
  return {
    sfx(name) {
      applyBusVolumes();
      voices[name]();
    },
    prime() { ensureAudio(); },
    unlock,
    syncMusic,
    settingChanged(key) {
      const s = settings();
      if (key === 'musicEnabled' || key === 'musicVolume') syncMusic();
      if (key === 'soundEnabled' || key === 'soundVolume') ensureAudioContext();
      if (key === 'soundEnabled' && !s.soundEnabled && !s.musicEnabled) core.suspend();
      if ((key === 'soundEnabled' || key === 'musicEnabled') && (s.soundEnabled || s.musicEnabled)) ensureAudioContext();
    },
  };
```

`defaultContext` at the top of the file is now unused: delete it (the core has its own). `playExplosion` keeps `if (!ensureAudio()) return;`.

- [ ] **Step 4: Run the tests and rebuild**

Run: `cd websites/www.cs/games/cylon && node --test test/audio.test.mjs && cd .. && node _kit/build/build.mjs cylon && php cylon/tools/install-files.php && cylon/test.sh && cd .. && php tools/site-versions.php`
Expected: all pass; `site-versions.php` rewrites the home page's `?v=` for `games/cylon/dist/main.js`.

- [ ] **Step 5: Commit**

```bash
git add -A websites/www.cs/games/cylon websites/www.cs/index.html
git commit -m "Cylon: sound on the kit's audio core; its audio test on node:test"
```

### Task 4: Tankity's sound on the core, and PR 6 ships

**Files:**
- Modify: `websites/www.cs/games/tankity/src/audio.ts` (lines 25–93, 115–206, 335–340, 481–506; the kick in `musicStep`)
- Rewrite: `websites/www.cs/games/tankity/test/audio.test.mjs` (onto `node:test`, the kit fake)
- Rebuild: `tankity/dist/`, `index.html`, `sw.js`

**Interfaces:**
- Consumes: `createAudioCore`, `BusName` (Task 1); `fakeAudioContext` (Task 1).
- Produces: unchanged exports (`sfx`, `music`, `initAudio`, `unlock`, `noteGesture`, `isSoundMuted`, `setSoundMuted`, `isMusicMuted`, `setMusicMuted`, `trimSilence`, `trackForLevel`, `SfxName`, `Track`, `AudioConfig`).

- [ ] **Step 1: Rewrite the test onto `node:test` and the kit fake**

```js
// websites/www.cs/games/tankity/test/audio.test.mjs
// Tankity's sound without a browser: the loop-point trim, which track a level
// plays, silence without Web Audio, and the track hand-off against the kit's
// fake context and a fetch whose loads land when the test says.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trimSilence, trackForLevel, sfx, music, initAudio, noteGesture, setSoundMuted } from '../src/audio.ts';
import { fakeAudioContext } from '../../_kit/test/audio.ts';

const near = (a, b) => Math.abs(a - b) < 1e-9;
// The module makes its one context the first time a sound needs it after
// AudioContext exists; every test after the hand-off shares this fake.
const ctx = fakeAudioContext();

test('trim keeps a track from its first sound to its last', () => {
  const loud = new Float32Array(100);
  loud.fill(0.5, 20, 80);
  loud[10] = 0.003; // under the floor: still silence
  const t = trimSilence({ sampleRate: 100, getChannelData: () => loud });
  assert.ok(near(t.start, 0.2) && near(t.end, 0.8), JSON.stringify(t));
});

test('trim of pure silence keeps the last sample; of no silence keeps all', () => {
  const quiet = trimSilence({ sampleRate: 100, getChannelData: () => new Float32Array(50) });
  assert.ok(near(quiet.start, 0.49) && near(quiet.end, 0.5), JSON.stringify(quiet));
  const whole = trimSilence({ sampleRate: 10, getChannelData: () => new Float32Array(10).fill(0.1) });
  assert.ok(near(whole.start, 0) && near(whole.end, 1), JSON.stringify(whole));
});

test('the demo plays the theme; rounds walk the other tracks and wrap', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(l => trackForLevel(l, 4)), [0, 1, 2, 3, 1, 2, 3]);
  assert.equal(trackForLevel(0, 1), 0);
  assert.equal(trackForLevel(5, 1), 0);
});

test('with no AudioContext (this is Node) nothing throws and nothing plays', () => {
  assert.doesNotThrow(() => { sfx.play('boom'); sfx.turnPing(); music.start(); music.stop(); });
});

test('a skipped or stopped track that is still loading never keeps playing', async () => {
  globalThis.AudioContext = function AudioContext() { return ctx; };
  const pending = {};
  globalThis.fetch = file => new Promise(res => {
    pending[file] = () => res({ ok: true, arrayBuffer: () => Promise.resolve({ file }) });
  });
  const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)); };
  const land = async file => { pending[file](); await settle(); };
  const heard = () => ctx.nodes.filter(n => n.kind === 'source' && n.started !== null && n.stopped === null && n.buffer?.file).map(n => n.buffer.file);

  initAudio({ sfx: {}, music: [{ file: 'a.mp3' }, { file: 'b.mp3' }, { file: 'c.mp3' }] });
  noteGesture(false); // starts the theme, a.mp3
  await land('a.mp3');
  assert.deepEqual(heard(), ['a.mp3']);
  music.next(); // b.mp3 starts loading...
  music.next(); // ...and is skipped for c.mp3 before it arrives
  await land('b.mp3');
  await land('c.mp3');
  assert.deepEqual(heard(), ['c.mp3']);
  music.next(); // a.mp3 again (cached), then stop while it settles
  music.stop();
  await settle();
  assert.deepEqual(heard(), []);
});

test('muting sound silences effects', () => {
  setSoundMuted(true);
  const before = ctx.nodes.length;
  sfx.play('boom');
  sfx.turnPing();
  assert.equal(ctx.nodes.length, before);
  setSoundMuted(false);
});
```

- [ ] **Step 2: Run it**

Run: `cd websites/www.cs/games/tankity && node --test test/audio.test.mjs`
Expected: all pass against today's module (the contract does not change); they must still pass after Step 3 with no test edited.

- [ ] **Step 3: Move the context and voices onto the core**

Add after the header comment:

```ts
import { createAudioCore } from '../../_kit/audio/core.ts';
import type { BusName } from '../../_kit/audio/core.ts';
```

Replace lines 25–93 (from `/* ---------- audio context and voices ---------- */` through the end of `function noise(…) {…}`) with:

```ts
/* ---------- audio context and voices: the kit's core ---------- */
const core = createAudioCore();
let musicMuted = false;
let musicOn = false;
let lastMusicTick = 0;
let musicTimer = 0;
let nextNoteT = 0;
let stepIdx = 0;

/** The context for an effect: none while sound is muted. */
function ctx(): AudioContext | null {
  return core.isMuted('sfx') ? null : core.context();
}
/** The context for music, which plays whatever the sound toggle says. */
function audioCtx(): AudioContext | null {
  return core.context();
}
function blip(freq: number, dur: number, type?: OscillatorType | null, vol?: number | null,
  slideTo?: number | null, when?: number | null, bus: BusName = 'sfx'): void {
  core.tone({ freq, dur, type: type || 'square', vol: vol || 0.05, slideTo: slideTo ? Math.max(20, slideTo) : null, when: when || 0 }, bus);
}
function noise(dur: number, vol: number, filterFreq?: number | null, slideTo?: number | null,
  when?: number | null, bus: BusName = 'sfx'): void {
  core.noise({ dur, vol: vol || 0.08, filterFreq: filterFreq || 1200, slideTo: slideTo ? Math.max(40, slideTo) : null, when: when || 0 }, bus);
}
```

In `musicStep`, the kick block today is:

```ts
        const t = ac.currentTime + at;
        const o = ac.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(160, t);
        o.frequency.exponentialRampToValueAtTime(38, t + 0.13);
        o.connect(envGain(ac, t, 0.24, 0.15));
        o.start(t); o.stop(t + 0.17);
        blip(1100, 0.02, 'square', 0.05, null, at, ac);
```

Replace it with:

```ts
        core.tone({ freq: 160, dur: 0.15, type: 'sine', vol: 0.24, slideTo: 38, slideDur: 0.13, when: at }, 'music');
        blip(1100, 0.02, 'square', 0.05, null, at, 'music');
```

and change every other `, ac)` that ends a `blip(` or `noise(` call in `musicStep` to `, 'music')` (crash, snare, hats, bass and lead: seven calls).

In `playSample`, change `if (!s || soundMuted) return false;` to `if (!s || core.isMuted('sfx')) return false;` and `g.connect(ac.destination);` to `g.connect(core.bus('sfx') ?? ac.destination);`. In `loadSfx`, change `if (!gestured || soundMuted) return;` to `if (!gestured || core.isMuted('sfx')) return;`.

Replace `sfx.turnPing` and `sfx.clockWarn` bodies with:

```ts
  turnPing(): void { blip(880, 0.12, 'sine', 0.08, null, 0); blip(1320, 0.18, 'sine', 0.07, null, 0.13); },
  clockWarn(): void { for (let i = 0; i < 3; i++) blip(988, 0.09, 'square', 0.07, null, i * 0.16); },
```

Replace `function bus(): GainNode | null {…}` (and delete `let musicBus: GainNode | null = null;` above it) with:

```ts
function bus(): GainNode | null {
  audioCtx();
  return core.bus('music');
}
```

Replace the gestures-and-mutes block (from `export function unlock(): void { ctx(); }` to the end of the file) with:

```ts
/** Wakes the audio context (a no-op while sound is muted). */
export function unlock(): void { ctx(); }
/* Any touch or keypress unlocks the speakers and (re)starts a non-muted
   song, so music never sits claiming to play while silent after a refresh.
   `musicToggle` is true when the gesture itself turns the music off: it must
   not fetch a track. Starting twice is a harmless no-op. */
export function noteGesture(musicToggle: boolean): void {
  gestured = true;
  ctx();
  if (musicMuted || musicToggle) return;
  if (!musicOn) startMusic();
  else if (trackMode()) playTrack(); // a play refused before the first gesture
}
export function isSoundMuted(): boolean { return core.isMuted('sfx'); }
export function setSoundMuted(muted: boolean): void {
  core.setMuted('sfx', muted);
  if (!muted) ctx();
}
export function isMusicMuted(): boolean { return musicMuted; }
export function setMusicMuted(muted: boolean): void {
  musicMuted = muted;
  if (musicMuted) stopMusic();
  else startMusic();
}
```

The music bus is never muted by the core here on purpose: muting music stops it with a 0.3 s fade (`stopMusic`), which a hard bus mute would cut short. `rg -n "soundMuted|envGain|noiseBuf|\bAC\b" src/audio.ts` must print nothing.

- [ ] **Step 4: Run Tankity's suite and rebuild**

Run: `cd websites/www.cs/games && node _kit/build/build.mjs tankity && php tankity/tools/install-files.php && tankity/test.sh`
Expected: green.

- [ ] **Step 5: Commit**

```bash
git add -A websites/www.cs/games/tankity
git commit -m "Tankity: sound on the kit's audio core; its audio test on node:test"
```

- [ ] **Step 6: Verify PR 6 and ship it**

Run: `cd websites/www.cs && make test && make e2e E2E_ARGS="tankity-audio.spec.mjs crete-play.spec.mjs"`
Expected: green. Push `games/kit-audio`, open the PR ("Games kit: shared audio core; Crete, Cylon and Tankity sound through it", spec row 6). CI selects every spec (`_kit/` changed). If `main` moved, rebase and rebuild the generated files (Global Constraints). Run the pr-fix loop on the review comments, then merge on green CI, deploy, live-check with `crete-play.spec.mjs`, and end the report with `/play/tankity/?v=<merge sha>`.

---

# PR 7: Kit `ui/`; Crete's overlays become Preact

Branch `games/kit-ui-crete`. Crete plays exactly as before; `crete-play` stays green unchanged.

### Task 5: Shared test helpers for Preact (`dom-stub.mjs`, `importTsx`)

**Files:**
- Move: `websites/www.cs/games/tankity/test/dom-stub.mjs` → `websites/www.cs/games/_kit/test/dom-stub.mjs` (`git mv`), then extend it
- Create: `websites/www.cs/games/_kit/test/tsx.ts`, `_kit/test/tsx.test.mjs`, `_kit/test/fixture/hello.tsx`
- Modify: `websites/www.cs/games/tankity/test/smoke.test.mjs` (import line), `tankity/test/ui.test.mjs` (header), `websites/www.cs/games/.gitignore`, `_kit/README.md`

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `importTsx(fromDir: string, modules: Record<string, string>): Promise<Record<string, Record<string, unknown>>>`: each named module's exports under its name.
  - `_kit/test/dom-stub.mjs` exports (unchanged names) `els`, `makeEl`, `makeText`, `makeCallable`, `click(el)`, `fire(el, type, extra)`, `submit(el)`, `document`; new: every element has `focus()` (sets `globalThis.__focused`) and `checked: false`; `querySelector('button')` matches a tag name; `document.activeElement` (settable, starts `null`); `document.addEventListener`/`removeEventListener` keep listeners; `fireDocument(type, extra)` calls them.

- [ ] **Step 1: Move the stub and extend it**

```bash
cd websites/www.cs/games && git mv tankity/test/dom-stub.mjs _kit/test/dom-stub.mjs
```

In `_kit/test/dom-stub.mjs`:

Replace the first two comment lines with:

```js
// A small DOM for Node tests that render Preact: a real tree, with parents,
// siblings, insert and remove, plus the handful of properties games read. Not
// a browser: no layout, no event bubbling; selectors are .class, #id or a tag.
```

In `makeEl`, add `checked: false,` after `disabled: false,`, and add after `blur: () => {},`:

```js
    focus() { globalThis.__focused = this; },
```

In `querySelector(sel)`, replace

```js
      const want = sel.startsWith('.') ? sel.slice(1) : null;
      const wid = sel.startsWith('#') ? sel.slice(1) : null;
```

with

```js
      const want = sel.startsWith('.') ? sel.slice(1) : null;
      const wid = sel.startsWith('#') ? sel.slice(1) : null;
      const tag = !want && !wid ? sel : null;
```

and the match line

```js
          if ((want && String(c.className || '').split(' ').includes(want)) || (wid && c.id === wid)) return c;
```

with

```js
          if ((want && String(c.className || '').split(' ').includes(want)) || (wid && c.id === wid) || (tag && c.localName === tag)) return c;
```

Replace the `document` export with:

```js
const docListeners = {};
export const document = {
  readyState: 'complete',
  activeElement: null,
  getElementById: id => (els[id] = els[id] || makeEl(id)),
  createElement: tag => makeEl(tag),
  createElementNS: (ns, tag) => makeRenderedEl(tag),
  createTextNode: t => makeText(t),
  querySelectorAll: () => [],
  addEventListener(t, f) { (docListeners[t] = docListeners[t] || []).push(f); },
  removeEventListener(t, f) { docListeners[t] = (docListeners[t] || []).filter(g => g !== f); },
};
/** Calls the document's listeners for an event type, as a key press would. */
export function fireDocument(type, extra = {}) {
  for (const f of docListeners[type] || []) f({ type, preventDefault: () => {}, ...extra });
}
```

- [ ] **Step 2: Point Tankity's tests at the moved stub**

In `tankity/test/smoke.test.mjs` change `from './dom-stub.mjs'` to `from '../../_kit/test/dom-stub.mjs'`, and in its header comment change `(test/dom-stub.mjs)` to `(games/_kit/test/dom-stub.mjs)`. Make the same comment and import change in `tankity/test/ui.test.mjs`.

Run: `cd websites/www.cs/games/tankity && node --test test/smoke.test.mjs test/ui.test.mjs`
Expected: PASS (the stub only gained features).

- [ ] **Step 3: Write the failing `importTsx` test and its fixture**

```tsx
// websites/www.cs/games/_kit/test/fixture/hello.tsx
export function Hello({ name }: { name: string }) {
  return <p id="hello" class="greet">Hello, {name}</p>;
}
```

```js
// websites/www.cs/games/_kit/test/tsx.test.mjs
// importTsx bundles .tsx for a test and shares Node's one preact with it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { importTsx } from './tsx.ts';
import { document, makeEl } from './dom-stub.mjs';

globalThis.document = document;
const { hello } = await importTsx(import.meta.dirname, { hello: './fixture/hello.tsx' });

test('a .tsx module loads and renders with the preact the test imported', () => {
  const root = makeEl('root');
  render(h(hello.Hello, { name: 'Crete' }), root);
  const p = root.children[0];
  assert.equal(p.localName, 'p');
  assert.equal(p.className, 'greet');
  assert.equal(p.textContent, 'Hello, Crete');
});
```

Run: `cd websites/www.cs/games && node --test _kit/test/tsx.test.mjs`
Expected: FAIL, `Cannot find module '.../_kit/test/tsx.ts'`.

- [ ] **Step 4: Write `importTsx`**

```ts
// websites/www.cs/games/_kit/test/tsx.ts
// Loads .tsx modules into a node:test file. Node strips types but cannot run
// JSX, so esbuild bundles them once, leaving preact external so the test and
// the components share Node's one copy (hooks and contexts break across two).
import * as esbuild from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** `modules` maps a name to a path relative to `fromDir`; the result holds each module's exports under its name. */
export async function importTsx(fromDir: string, modules: Record<string, string>): Promise<Record<string, Record<string, unknown>>> {
  // Inside the caller's folder, so the bundle's bare `preact` resolves to games/node_modules.
  const tmp = mkdtempSync(join(fromDir, '.tmp-'));
  process.on('exit', () => rmSync(tmp, { recursive: true, force: true }));
  const out = join(tmp, 'bundle.mjs');
  await esbuild.build({
    stdin: {
      contents: Object.entries(modules).map(([name, path]) => `export * as ${name} from ${JSON.stringify(path)};`).join('\n'),
      resolveDir: fromDir,
      loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    external: ['preact', 'preact/*'],
    jsx: 'automatic',
    jsxImportSource: 'preact',
    outfile: out,
    logLevel: 'silent',
  });
  return (await import(pathToFileURL(out).href)) as Record<string, Record<string, unknown>>;
}
```

- [ ] **Step 5: Let Tankity's UI test use it**

In `tankity/test/ui.test.mjs`, replace the block from `const UI = [` through `const ui = await import(pathToFileURL(out).href);` with:

```js
const UI = ['help', 'shop', 'lobby', 'menu', 'guns', 'scores', 'log', 'tutorial', 'hud', 'endveil', 'leave'];
const ui = await importTsx(import.meta.dirname, Object.fromEntries(UI.map(n => [n, `../src/ui/${n}.tsx`])));
```

add `import { importTsx } from '../../_kit/test/tsx.ts';` with the other imports, and delete the `esbuild`, `pathToFileURL` and `mkdtempSync, rmSync` imports if `rg -n "esbuild|pathToFileURL|mkdtempSync|rmSync" test/ui.test.mjs` shows no other use.

In `websites/www.cs/games/.gitignore`, replace the lines `_kit/test/.tmp-*/` and `tankity/test/.tmp-*/` with `*/test/.tmp-*/`.

- [ ] **Step 6: Run everything that uses the stub**

Run: `cd websites/www.cs/games && node --test _kit/test/tsx.test.mjs tankity/test/ui.test.mjs tankity/test/smoke.test.mjs && node_modules/.bin/tsc -p _kit/tsconfig.json`
Expected: PASS; tsc silent.

- [ ] **Step 7: Document and commit**

Append to the "Tests (`test/`)" section of `_kit/README.md`:

```markdown
Components are tested in Node: `importTsx(import.meta.dirname, { name: '../src/ui/x.tsx' })`
bundles `.tsx` with esbuild (preact left external, so the test and the
components share one copy), and `dom-stub.mjs` is a small DOM to render into:
`makeEl`, `click`, `fire(el, type, extra)`, `fireDocument(type, extra)`, and
`globalThis.__focused` for the element last focused.
```

```bash
git add -A websites/www.cs/games/_kit/test websites/www.cs/games/_kit/README.md websites/www.cs/games/tankity/test websites/www.cs/games/.gitignore
git commit -m "Games kit: the DOM stub and importTsx serve every game's component tests"
```

### Task 6: Kit UI components: `Dialog`, `Button`, `Panel`, `KeyChip`

**Files:**
- Create: `websites/www.cs/games/_kit/ui/dialog.tsx`, `ui/button.tsx`, `ui/panel.tsx`, `ui/key-chip.tsx`
- Create: `websites/www.cs/games/_kit/test/ui.test.mjs`
- Modify: `websites/www.cs/games/_kit/tsconfig.json` (`include` adds `"ui/*.tsx"`), `_kit/README.md`

**Interfaces:**
- Consumes: `importTsx`, `dom-stub.mjs` (Task 5).
- Produces:
  - `Dialog(props: DialogProps)`, `DialogProps = { open: boolean; id: string; veilClass: string; panelClass: string; role?: 'dialog' | 'alertdialog'; titleId: string; title: ComponentChildren; titleClass?: string; kicker?: ComponentChildren; kickerId?: string; kickerClass?: string; describedBy?: string; focusId?: string; onDismiss?: () => void; children?: ComponentChildren }`. Renders `<div id={id} class={veilClass} hidden={!open}>` around `<div class={panelClass} role aria-modal="true" aria-labelledby={titleId}>`, then the kicker `<p>`, the `<h2 id={titleId}>`, and the children. On opening it focuses `#focusId` (else the panel's first button); on closing it gives focus back to what had it. Escape, or a click on the veil itself, calls `onDismiss`.
  - `Button(props: ButtonProps)`, `ButtonProps = { onClick: () => void; id?: string; class?: string; disabled?: boolean; label?: string; title?: string; pressed?: boolean; keyLabel?: string; children?: ComponentChildren }`. Blurs itself, then calls `onClick`. `keyLabel` adds a `KeyChip` after the text.
  - `Panel(props: PanelProps)`, `PanelProps = { id?: string; class?: string; titleId: string; title: ComponentChildren; titleClass?: string; children?: ComponentChildren }`: `<section aria-labelledby={titleId}><h2 id={titleId}>…</h2>…</section>`.
  - `KeyChip({ label, class, at, decorative })`: `<kbd class={class ?? 'key-chip'}>{label}</kbd>`; `at` (the game's key-table slot, such as `global:new`) becomes `data-keyhint`, and `decorative` adds `aria-hidden="true"` for a chip beside words that already name the action. Plan C's Tankity chips use both (`<KeyChip label class="key" at decorative />`).

- [ ] **Step 1: Write the failing tests**

```js
// websites/www.cs/games/_kit/test/ui.test.mjs
// The kit's Preact components in the DOM stub: the dialog's structure, focus
// and dismissal; the button's blur, chip and click; the panel; the key chip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { importTsx } from './tsx.ts';
import { document, makeEl, click, fire, fireDocument } from './dom-stub.mjs';

globalThis.document = document;
const ui = await importTsx(import.meta.dirname, {
  dialog: '../ui/dialog.tsx', button: '../ui/button.tsx', panel: '../ui/panel.tsx', chip: '../ui/key-chip.tsx',
});
const { Dialog } = ui.dialog;
const { Button } = ui.button;
const { Panel } = ui.panel;
const { KeyChip } = ui.chip;

const walk = (el, out = []) => { for (const c of el.children) if (c.nodeType === 1) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const dialog = (props, children) => h(Dialog, {
  id: 'veil', veilClass: 'veil', panelClass: 'card', titleId: 'dlg-title', title: 'Ending', ...props,
}, children);

test('a closed dialog is in the page, hidden, and names itself by its title', () => {
  const root = makeEl('root');
  render(dialog({ open: false, kicker: 'Run over', kickerId: 'dlg-kicker', kickerClass: 'kicker' }), root);
  const veil = byId(root, 'veil');
  assert.equal(veil.hidden, true);
  assert.equal(veil.className, 'veil');
  const panel = veil.children[0];
  assert.equal(panel.className, 'card');
  assert.equal(panel.getAttribute('role'), 'dialog');
  assert.equal(panel.getAttribute('aria-modal'), 'true');
  assert.equal(panel.getAttribute('aria-labelledby'), 'dlg-title');
  assert.equal(byId(root, 'dlg-kicker').textContent, 'Run over');
  assert.equal(byId(root, 'dlg-title').localName, 'h2');
  assert.equal(byId(root, 'dlg-title').textContent, 'Ending');
});

test('opening focuses the named element; closing gives focus back', () => {
  const root = makeEl('root');
  const opener = makeEl('opener');
  document.activeElement = opener;
  const children = h(Button, { id: 'again', onClick() {} }, 'Again');
  render(dialog({ open: false, focusId: 'again' }, children), root);
  render(dialog({ open: true, focusId: 'again' }, children), root);
  assert.equal(byId(root, 'veil').hidden, false);
  assert.equal(globalThis.__focused?.id, 'again');
  render(dialog({ open: false, focusId: 'again' }, children), root);
  assert.equal(globalThis.__focused, opener);
  document.activeElement = null;
});

test('without a focus id, opening focuses the first button', () => {
  const root = makeEl('root');
  render(dialog({ open: true }, [h('p', null, 'text'), h(Button, { id: 'first', onClick() {} }, 'One'), h(Button, { id: 'second', onClick() {} }, 'Two')]), root);
  assert.equal(globalThis.__focused?.id, 'first');
});

test('Escape and a click on the veil dismiss; a click inside does not', () => {
  const root = makeEl('root');
  let dismissed = 0;
  render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
  fireDocument('keydown', { key: 'Escape' });
  assert.equal(dismissed, 1);
  fireDocument('keydown', { key: 'Enter' });
  assert.equal(dismissed, 1);
  const veil = byId(root, 'veil');
  fire(veil, 'click', { target: veil.children[0] });
  assert.equal(dismissed, 1);
  fire(veil, 'click');
  assert.equal(dismissed, 2);
});

test('a closed dialog ignores Escape', () => {
  const root = makeEl('root');
  let dismissed = 0;
  render(dialog({ open: false, onDismiss: () => { dismissed++; } }), root);
  fireDocument('keydown', { key: 'Escape' });
  assert.equal(dismissed, 0);
});

test('an alert dialog says so, and can point at its description', () => {
  const root = makeEl('root');
  render(dialog({ open: true, role: 'alertdialog', describedBy: 'why' }), root);
  const panel = byId(root, 'veil').children[0];
  assert.equal(panel.getAttribute('role'), 'alertdialog');
  assert.equal(panel.getAttribute('aria-describedby'), 'why');
});

test('a button blurs itself, then calls back; a key label becomes a chip', () => {
  const root = makeEl('root');
  let pressed = 0;
  render(h(Button, { id: 'b', class: 'go', title: 'Use it', keyLabel: 'Z', onClick: () => { pressed++; } }, 'Use'), root);
  const b = byId(root, 'b');
  assert.equal(b.localName, 'button');
  assert.equal(b.getAttribute('type'), 'button');
  assert.equal(b.className, 'go');
  assert.equal(b.title, 'Use it');
  click(b);
  assert.equal(pressed, 1);
  const chip = walk(b).find(n => n.localName === 'kbd');
  assert.equal(chip.className, 'key-chip');
  assert.equal(chip.textContent, 'Z');
});

test('a disabled button says so; a label names a symbol-only button', () => {
  const root = makeEl('root');
  render(h(Button, { id: 'x', disabled: true, label: 'Close', onClick() {} }, '×'), root);
  const b = byId(root, 'x');
  assert.equal(b.disabled, true);
  assert.equal(b.getAttribute('aria-label'), 'Close');
});

test('a panel is a section named by its heading', () => {
  const root = makeEl('root');
  render(h(Panel, { class: 'panel', titleId: 'inv-h', title: 'Inventory' }, h('ul', { id: 'list' })), root);
  const section = root.children[0];
  assert.equal(section.localName, 'section');
  assert.equal(section.className, 'panel');
  assert.equal(section.getAttribute('aria-labelledby'), 'inv-h');
  assert.equal(byId(root, 'inv-h').textContent, 'Inventory');
  assert.ok(byId(root, 'list'));
});

test('a key chip shows its key, with the default class or the given one', () => {
  const root = makeEl('root');
  render(h('p', null, h(KeyChip, { label: 'Space' }), h(KeyChip, { label: 'N', class: 'cap' })), root);
  const [a, b] = walk(root).filter(n => n.localName === 'kbd');
  assert.deepEqual([a.className, a.textContent, b.className, b.textContent], ['key-chip', 'Space', 'cap', 'N']);
  assert.equal(a.getAttribute('aria-hidden'), undefined);
  assert.equal(a.getAttribute('data-keyhint'), undefined);
});

test('a chip can name its key-table slot and stay out of the accessible name', () => {
  const root = makeEl('root');
  render(h(KeyChip, { label: 'N', class: 'key', at: 'global:new', decorative: true }), root);
  const chip = root.children[0];
  assert.equal(chip.className, 'key');
  assert.equal(chip.getAttribute('data-keyhint'), 'global:new');
  assert.equal(chip.getAttribute('aria-hidden'), 'true');
});
```

Run: `cd websites/www.cs/games && node --test _kit/test/ui.test.mjs`
Expected: FAIL, esbuild cannot resolve `../ui/dialog.tsx`.

- [ ] **Step 2: Write the components**

```tsx
// websites/www.cs/games/_kit/ui/key-chip.tsx
// One key, as the player presses it. The game styles .key-chip and passes the
// label from its key table, so a chip can never disagree with the binding.
export interface KeyChipProps {
  label: string;
  class?: string;
  /** The key-table slot it shows ("global:new"), written as data-keyhint. */
  at?: string;
  /** Beside words that already name the action: hidden from screen readers. */
  decorative?: boolean;
}

export function KeyChip({ label, class: cls, at, decorative }: KeyChipProps) {
  return <kbd class={cls ?? 'key-chip'} data-keyhint={at} aria-hidden={decorative ? 'true' : undefined}>{label}</kbd>;
}
```

```tsx
// websites/www.cs/games/_kit/ui/button.tsx
// A button that gives up focus when clicked, so the key that pressed it (Space,
// Enter) cannot press it again, with an optional key chip after its text.
import type { ComponentChildren } from 'preact';
import { KeyChip } from './key-chip.tsx';

export interface ButtonProps {
  onClick: () => void;
  id?: string;
  class?: string;
  disabled?: boolean;
  /** The accessible name, for a button whose text is a symbol. */
  label?: string;
  title?: string;
  /** aria-pressed, for a toggle. */
  pressed?: boolean;
  /** The key that does the same, shown as a chip after the text. */
  keyLabel?: string;
  children?: ComponentChildren;
}

export function Button(p: ButtonProps) {
  return (
    <button type="button" id={p.id} class={p.class} disabled={p.disabled} aria-label={p.label} title={p.title}
      aria-pressed={p.pressed} onClick={ev => { ev.currentTarget.blur(); p.onClick(); }}>
      {p.children}
      {p.keyLabel ? <> <KeyChip label={p.keyLabel} /></> : null}
    </button>
  );
}
```

```tsx
// websites/www.cs/games/_kit/ui/panel.tsx
// A titled section of a page; its heading is its accessible name.
import type { ComponentChildren } from 'preact';

export interface PanelProps {
  id?: string;
  class?: string;
  titleId: string;
  title: ComponentChildren;
  titleClass?: string;
  children?: ComponentChildren;
}

export function Panel(p: PanelProps) {
  return (
    <section id={p.id} class={p.class} aria-labelledby={p.titleId}>
      <h2 id={p.titleId} class={p.titleClass}>{p.title}</h2>
      {p.children}
    </section>
  );
}
```

```tsx
// websites/www.cs/games/_kit/ui/dialog.tsx
// A modal panel inside its veil. The game says whether it is open; the dialog
// moves focus in when it opens and back when it closes, and Escape or a click
// on the veil itself calls onDismiss when the game gives one.
import type { ComponentChildren } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

export interface DialogProps {
  open: boolean;
  /** The veil's id and class (the page's CSS styles both). */
  id: string;
  veilClass: string;
  panelClass: string;
  role?: 'dialog' | 'alertdialog';
  titleId: string;
  title: ComponentChildren;
  titleClass?: string;
  kicker?: ComponentChildren;
  kickerId?: string;
  kickerClass?: string;
  describedBy?: string;
  /** The element focused on opening; otherwise the panel's first button. */
  focusId?: string;
  onDismiss?: () => void;
  children?: ComponentChildren;
}

export function Dialog(p: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<Element | null>(null);
  const wasOpen = useRef(false);

  // Layout effects run as soon as the DOM is updated, so focus moves before
  // the player can press another key.
  useLayoutEffect(() => {
    if (p.open && !wasOpen.current) {
      returnTo.current = document.activeElement ?? null;
      const named = p.focusId ? document.getElementById(p.focusId) : null;
      const target = (named ?? panel.current?.querySelector('button') ?? null) as HTMLElement | null;
      target?.focus?.();
    } else if (!p.open && wasOpen.current) {
      (returnTo.current as HTMLElement | null)?.focus?.();
      returnTo.current = null;
    }
    wasOpen.current = p.open;
  }, [p.open]);

  useLayoutEffect(() => {
    const dismiss = p.onDismiss;
    if (!p.open || !dismiss) return undefined;
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key !== 'Escape') return;
      ev.preventDefault();
      dismiss();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [p.open, p.onDismiss]);

  return (
    <div id={p.id} class={p.veilClass} hidden={!p.open}
      onClick={ev => { if (ev.target === ev.currentTarget) p.onDismiss?.(); }}>
      <div class={p.panelClass} role={p.role ?? 'dialog'} aria-modal="true" aria-labelledby={p.titleId}
        aria-describedby={p.describedBy} ref={panel}>
        {p.kicker !== undefined && <p class={p.kickerClass} id={p.kickerId}>{p.kicker}</p>}
        <h2 id={p.titleId} class={p.titleClass}>{p.title}</h2>
        {p.children}
      </div>
    </div>
  );
}
```

In `_kit/tsconfig.json`, set `"include": ["*.ts", "audio/*.ts", "ui/*.tsx", "test/*.ts"]`.

- [ ] **Step 3: Run the tests and the type check**

Run: `cd websites/www.cs/games && node --test _kit/test/ui.test.mjs && node_modules/.bin/tsc -p _kit/tsconfig.json`
Expected: PASS; tsc silent.

- [ ] **Step 4: Document and commit**

Add to `_kit/README.md` after the Sound section:

```markdown
## Components (`ui/`)

Preact components every game draws its overlays with. A page keeps an empty
mount point; the game's module renders a component into it with a finished
view of its state and callbacks, and redraws when the state changes.

- `Dialog`: a modal panel in its veil. `open` shows it; on opening it focuses
  `focusId` (or its first button), on closing it gives focus back; Escape and
  a click on the veil call `onDismiss`. The game passes its own ids and
  classes, so its CSS and browser specs keep working.
- `Button`: blurs itself before calling `onClick`, so the key that pressed it
  cannot press it again; `keyLabel` adds a `KeyChip`.
- `Panel`: a section named by its `<h2>`.
- `KeyChip`: one key as a `<kbd class="key-chip">`; the game styles it and
  reads the label from its key table. `at` records the key-table slot as
  `data-keyhint`; `decorative` hides a chip that sits beside words already
  naming the action from screen readers.
```

```bash
git add websites/www.cs/games/_kit/ui websites/www.cs/games/_kit/test/ui.test.mjs websites/www.cs/games/_kit/tsconfig.json websites/www.cs/games/_kit/README.md
git commit -m "Games kit: Dialog, Button, Panel and KeyChip"
```

### Task 7: Crete's ending card on `Dialog`

**Files:**
- Create: `websites/www.cs/games/crete/src/ui/end.tsx`
- Create: `websites/www.cs/games/crete/test/ui.test.mjs`
- Modify: `websites/www.cs/games/crete/src/ui.ts` (`showEnd`, `hideEnd`, `bindControls`, the end of `createUi`), `crete/index.html` (the `#end-veil` block), `crete/src/tsconfig.dom.json`
- Modify: `websites/www.cs/tests/php/checks/deploy-set.php` (Crete's bundle licenses ship)
- Rebuild: `crete/dist/` (now with `THIRD_PARTY_LICENSES.txt`), `index.html` `?v=`, `sw.js`

**Interfaces:**
- Consumes: `Dialog`, `Button` (Task 6); `importTsx`, `dom-stub.mjs` (Task 5).
- Produces: `EndView = { open: boolean; kicker: string; title: string; text: string; score: string }`, `EndCardProps = EndView & { onAgain: () => void }`, `EndCard(props)`, `renderEndCard(root: Element, props: EndCardProps): void`. The DOM keeps the ids the browser specs use: `#end-veil`, `#end-kicker`, `#end-title`, `#end-text`, `#end-score`, `#again`.

- [ ] **Step 1: Write the failing test**

```js
// websites/www.cs/games/crete/test/ui.test.mjs
// Crete's Preact overlays in the DOM stub: the ids the page's CSS and the
// browser specs use, the text each shows, and that each button calls back.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { document, makeEl, click } from '../../_kit/test/dom-stub.mjs';

globalThis.document = document;
const ui = await importTsx(import.meta.dirname, { end: '../src/ui/end.tsx' });
const { renderEndCard } = ui.end;

const walk = (el, out = []) => { for (const c of el.children) if (c.nodeType === 1) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const END = { kicker: 'You escaped', title: 'True Ending: Shut Down the Maze', text: 'Every page recovered.', score: 'Score 340 · 31 turns' };

test('the ending card waits hidden until the run ends', () => {
  const root = makeEl('end-root');
  renderEndCard(root, { open: false, kicker: '', title: '', text: '', score: '', onAgain() {} });
  assert.equal(byId(root, 'end-veil').hidden, true);
  assert.equal(byId(root, 'end-veil').className, 'veil');
});

test('the ending card shows the result and focuses Play again', () => {
  const root = makeEl('end-root');
  renderEndCard(root, { open: false, ...END, onAgain() {} });
  renderEndCard(root, { open: true, ...END, onAgain() {} });
  assert.equal(byId(root, 'end-veil').hidden, false);
  const card = byId(root, 'end-veil').children[0];
  assert.equal(card.className, 'card');
  assert.equal(card.getAttribute('aria-labelledby'), 'end-title');
  assert.deepEqual(['end-kicker', 'end-title', 'end-text', 'end-score'].map(id => byId(root, id).textContent),
    [END.kicker, END.title, END.text, END.score]);
  assert.equal(byId(root, 'end-score').className, 'runstats');
  assert.equal(byId(root, 'again').textContent, 'Play again (N)');
  assert.equal(globalThis.__focused?.id, 'again');
});

test('Play again calls back', () => {
  const root = makeEl('end-root');
  let again = 0;
  renderEndCard(root, { open: true, ...END, onAgain: () => { again++; } });
  click(byId(root, 'again'));
  assert.equal(again, 1);
});
```

Run: `cd websites/www.cs/games/crete && node --test test/ui.test.mjs`
Expected: FAIL, esbuild cannot resolve `../src/ui/end.tsx`.

- [ ] **Step 2: Write the component**

```tsx
// websites/www.cs/games/crete/src/ui/end.tsx
// The Island of Crete: the ending card. src/ui.ts decides the words; this
// draws them and reports Play again.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';

export interface EndView {
  open: boolean;
  kicker: string;
  title: string;
  text: string;
  /** The score line under the text. */
  score: string;
}

export interface EndCardProps extends EndView {
  onAgain: () => void;
}

export function EndCard(p: EndCardProps) {
  return (
    <Dialog open={p.open} id="end-veil" veilClass="veil" panelClass="card"
      kicker={p.kicker} kickerId="end-kicker" kickerClass="kicker" titleId="end-title" title={p.title} focusId="again">
      <p id="end-text">{p.text}</p>
      <p id="end-score" class="runstats">{p.score}</p>
      <Button id="again" onClick={p.onAgain}>Play again (N)</Button>
    </Dialog>
  );
}

export function renderEndCard(root: Element, props: EndCardProps): void {
  render(<EndCard {...props} />, root);
}
```

- [ ] **Step 3: Draw the ending through it**

In `crete/index.html`, replace the whole block from `<div id="end-veil" class="veil" hidden>` through its closing `</div>` (the card and its `#again` button) with:

```html
    <div id="end-root"></div>
```

In `crete/src/tsconfig.dom.json`, set `"files": ["audio.ts", "ui.ts", "ui/end.tsx", "main.ts"]`.

In `crete/src/ui.ts`, add after the engine type import:

```ts
import { renderEndCard } from "./ui/end.tsx";
import type { EndView } from "./ui/end.tsx";
```

Replace the endings section (from `/* ---------- endings ---------- */` through the end of `function hideEnd(): void {…}`) with:

```ts
  /* ---------- endings ---------- */
  let end: EndView = { open: false, kicker: "", title: "", text: "", score: "" };
  let again = (): void => {};
  function drawEnd(): void {
    renderEndCard($("end-root"), { ...end, onAgain: () => again() });
  }

  function showEnd(game: Game, won: boolean): void {
    const G = game.G;
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
    drawEnd();
    render(game);
  }

  function hideEnd(): void {
    end = { ...end, open: false };
    drawEnd();
  }
```

In `bindControls`, replace `$("again").addEventListener("click", () => restart(seedBox().value));` with:

```ts
    again = () => restart(seedBox().value);
```

Just before `return {` at the end of `createUi`, add `drawEnd();` so the closed card is in the page from the start.

- [ ] **Step 4: Run the tests, rebuild, and check in a browser**

This is the first Preact in Crete's bundle, so the kit build (#76) now also writes `crete/dist/THIRD_PARTY_LICENSES.txt` (Preact's name, version and license) and starts `dist/main.js` with `/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */`. In `websites/www.cs/tests/php/checks/deploy-set.php`, after the Tankity line `$check('ships games/tankity/dist/THIRD_PARTY_LICENSES.txt', isset($set['games/tankity/dist/THIRD_PARTY_LICENSES.txt']));` add:

```php
$check('ships games/crete/dist/THIRD_PARTY_LICENSES.txt', isset($set['games/crete/dist/THIRD_PARTY_LICENSES.txt']));
```

Run: `cd websites/www.cs/games/crete && node --test test/ui.test.mjs && cd .. && node _kit/build/build.mjs crete && php crete/tools/install-files.php && crete/test.sh && cd .. && head -c 60 games/crete/dist/main.js && grep -c '^preact ' games/crete/dist/THIRD_PARTY_LICENSES.txt && make test && make e2e E2E_ARGS="crete-play.spec.mjs"`
Expected: green; `main.js` starts with the licenses banner, the licenses file names `preact` once, the deploy-set check passes, and `crete-play` unchanged and passing proves the ending still shows.

- [ ] **Step 5: Commit**

```bash
git add -A websites/www.cs/games/crete websites/www.cs/tests/php/checks/deploy-set.php
git commit -m "Crete: the ending card is the kit's Dialog"
```

### Task 8: Crete's inventory on `Panel`, `Button` and `KeyChip`, and PR 7 ships

**Files:**
- Create: `websites/www.cs/games/crete/src/ui/inventory.tsx`
- Modify: `crete/src/ui.ts` (the inventory block of `render`), `crete/index.html` (the inventory `<section>`), `crete/game.css`, `crete/src/tsconfig.dom.json`, `crete/test/ui.test.mjs`, `crete/README.md`
- Rebuild: `crete/dist/`, `index.html`, `sw.js`

**Interfaces:**
- Consumes: `Panel`, `Button`, `KeyChip` (Task 6); `ItemKind` (engine type).
- Produces: `InventoryRow = { kind: ItemKind; emoji: string; name: string; key: string; count: number; desc: string; disabled: boolean }`, `InventoryProps = { rows: InventoryRow[]; onUse: (kind: ItemKind) => void }`, `renderInventory(root: Element, props: InventoryProps): void`. DOM: `section.panel[aria-labelledby=inv-h]` > `h2#inv-h`, `ul#inventory.inv` > `li` per item, `p.hint`.

- [ ] **Step 1: Add the failing tests**

In `crete/test/ui.test.mjs`, change the `importTsx` call to:

```js
const ui = await importTsx(import.meta.dirname, { end: '../src/ui/end.tsx', inventory: '../src/ui/inventory.tsx' });
const { renderEndCard } = ui.end;
const { renderInventory } = ui.inventory;
```

and append:

```js
const ROWS = [
  { kind: 'shard', emoji: '🔮', name: 'Mirror Shard', key: 'Z', count: 1, desc: 'Freeze the creature for one full turn. Move right after.', disabled: false },
  { kind: 'snack', emoji: '🥣', name: 'Sugar Puffs', key: 'X', count: 0, desc: 'Heal 5 HP. Using it costs your turn.', disabled: true },
  { kind: 'jammer', emoji: '📻', name: 'Signal Jammer', key: 'C', count: 2, desc: 'Hurl the creature far away. Using it costs your turn.', disabled: false },
];

test('the inventory is a panel with one row per item: name, count, key and what it does', () => {
  const root = makeEl('inventory-root');
  renderInventory(root, { rows: ROWS, onUse() {} });
  const section = root.children[0];
  assert.equal(section.localName, 'section');
  assert.equal(section.className, 'panel');
  assert.equal(byId(root, 'inv-h').textContent, 'Inventory — use with Z / X / C');
  const list = byId(root, 'inventory');
  assert.equal(list.className, 'inv');
  const items = list.children;
  assert.equal(items.length, 3);
  assert.equal(walk(items[0]).find(n => n.className === 'name').textContent, '🔮 Mirror Shard × 1 Z');
  assert.equal(walk(items[0]).find(n => n.localName === 'kbd').textContent, 'Z');
  assert.equal(walk(items[1]).find(n => n.className === 'desc').textContent, 'Heal 5 HP. Using it costs your turn.');
  assert.deepEqual(items.map(li => walk(li).find(n => n.localName === 'button').textContent), ['Use (Z)', 'Use (X)', 'Use (C)']);
});

test('an empty or unusable item cannot be pressed; a usable one calls back with its kind', () => {
  const root = makeEl('inventory-root');
  const used = [];
  renderInventory(root, { rows: ROWS, onUse: kind => used.push(kind) });
  const buttons = byId(root, 'inventory').children.map(li => walk(li).find(n => n.localName === 'button'));
  assert.deepEqual(buttons.map(b => b.disabled), [false, true, false]);
  click(buttons[2]);
  assert.deepEqual(used, ['jammer']);
});
```

Run: `cd websites/www.cs/games/crete && node --test test/ui.test.mjs`
Expected: FAIL, cannot resolve `../src/ui/inventory.tsx`.

- [ ] **Step 2: Write the component**

```tsx
// websites/www.cs/games/crete/src/ui/inventory.tsx
// The Island of Crete: the inventory panel. src/ui.ts builds each row from the
// run's state; this draws the rows and reports which item to use.
import { render } from 'preact';
import { Panel } from '../../../_kit/ui/panel.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';
import type { ItemKind } from '../engine.ts';

export interface InventoryRow {
  kind: ItemKind;
  emoji: string;
  name: string;
  key: string;
  count: number;
  desc: string;
  disabled: boolean;
}

export interface InventoryProps {
  rows: InventoryRow[];
  onUse: (kind: ItemKind) => void;
}

export function Inventory(p: InventoryProps) {
  return (
    <Panel class="panel" titleId="inv-h" title="Inventory — use with Z / X / C">
      <ul id="inventory" class="inv">
        {p.rows.map(r => (
          <li key={r.kind}>
            <span>
              <span class="name">{`${r.emoji} ${r.name} × ${r.count} `}<KeyChip label={r.key} /></span>
              <span class="desc">{r.desc}</span>
            </span>
            <Button disabled={r.disabled} onClick={() => p.onUse(r.kind)}>{`Use (${r.key})`}</Button>
          </li>
        ))}
      </ul>
      <p class="hint">
        Using an item costs your turn: the Minotaur still moves twice, unless a Mirror Shard freezes it.
      </p>
    </Panel>
  );
}

export function renderInventory(root: Element, props: InventoryProps): void {
  render(<Inventory {...props} />, root);
}
```

- [ ] **Step 3: Draw the inventory through it**

In `crete/index.html`, replace the inventory `<section class="panel" aria-labelledby="inv-h">…</section>` with:

```html
        <div id="inventory-root"></div>
```

Append to `crete/game.css`:

```css
/* The inventory's mount point is not a box of its own: its panel is the grid item. */
#inventory-root { display: contents; }
```

In `crete/src/tsconfig.dom.json`, set `"files": ["audio.ts", "ui.ts", "ui/end.tsx", "ui/inventory.tsx", "main.ts"]`.

In `crete/src/ui.ts`, add `import { renderInventory } from "./ui/inventory.tsx";`, and replace the inventory block at the end of `render` (from `const inv = $("inventory");` through the end of its `for` loop) with:

```ts
    renderInventory($("inventory-root"), {
      rows: (Object.keys(ITEMS) as ItemKind[]).map((kind) => {
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
      }),
      onUse: (kind) => game.useItem(kind),
    });
```

In `crete/README.md`, add to the module table a row:

```markdown
| `ui/end.tsx`, `ui/inventory.tsx` | the ending card and the inventory panel, drawn with the kit's `Dialog`, `Panel`, `Button` and `KeyChip`; `ui.ts` hands them a finished view | DOM lib |
```

and change the `ui` row's text to "drawing the board, HUD and log, choosing what the ending and inventory say; keys and clicks".

- [ ] **Step 4: Verify and commit**

Run: `cd websites/www.cs/games/crete && node --test test/ui.test.mjs && cd .. && node _kit/build/build.mjs crete && php crete/tools/install-files.php && cd .. && make test && make e2e E2E_ARGS="crete-play.spec.mjs games-pwa.spec.mjs"`
Expected: green.

```bash
git add -A websites/www.cs/games/crete
git commit -m "Crete: the inventory is the kit's Panel, Button and KeyChip"
```

- [ ] **Step 5: Ship PR 7**

Push `games/kit-ui-crete`, open the PR ("Games kit: Preact UI components; Crete's ending and inventory on them", spec row 7). CI selects every spec (`_kit/` changed). If `main` moved, rebase and rebuild the generated files (Global Constraints). Run the pr-fix loop on the review comments, then merge on green CI, deploy, live-check with `crete-play.spec.mjs`, and end the report with `/play/tankity/?v=<merge sha>`.

---

# PR 8: Cylon's overlays become Preact

Branch `games/cylon-overlays`. Gameplay does not change: `cylon-play` and `cylon-help` stay green unchanged. The intro title (`intro.ts`) stays as it is: it is an animated sprite moved by inline styles, not an overlay built from markup.

### Task 9: High-score rows as data, and the board component

**Files:**
- Modify: `websites/www.cs/games/cylon/src/scores.ts` (add `HsRow`, `highScoreRows`)
- Create: `websites/www.cs/games/cylon/src/ui/board.tsx`
- Create: `websites/www.cs/games/cylon/test/ui.test.mjs`
- Modify: `websites/www.cs/games/cylon/test/scores.test.mjs` (the four checks that call `formatHighScoreRows`), `cylon/src/tsconfig.dom.json`

**Interfaces:**
- Consumes: `importTsx`, `dom-stub.mjs` (Task 5).
- Produces:
  - `interface HsRow { rank: number; initials: string; date: string; score: number }` and `highScoreRows(list: readonly ScoreEntry[]): HsRow[]` in `scores.ts` (rank from 1; initials cut to three and uppercased, `AAA` when missing; `date` the locale date or `''`).
  - `HsRows({ rows })` (a fragment of `<li>`s, or one `li.cylon-hs-empty` "No scores yet"), `HsList({ id, rows })` (`<ol class="cylon-high-scores" id={id}>`), `renderHsRows(list: Element, rows: readonly HsRow[]): void` in `ui/board.tsx`. Each row: `span.cylon-hs-rank` `#n`, `strong.cylon-hs-initials`, `span.cylon-hs-date`, `span.cylon-hs-score` `n KOs`.

- [ ] **Step 1: Write the failing tests**

In `cylon/test/scores.test.mjs`, change the import to `import { createScoresClient, highScoreRows, weeklyResetText } from '../src/scores.ts';` and replace the four checks from `check('empty-board-text', …` through `check('rows-show-a-date', …` with:

```js
check('empty-board-has-no-rows', highScoreRows([]).length === 0, '');
const rows = highScoreRows([{ initials: 'abcdef', score: 9, at: 'not a date' }, { score: 4 }]);
check('rows-rank-initials-score', rows[0].rank === 1 && rows[0].initials === 'ABC' && rows[0].score === 9 && rows[1].rank === 2, JSON.stringify(rows));
check('rows-default-initials-and-empty-date', rows[1].initials === 'AAA' && rows[0].date === '' && rows[1].date === '', JSON.stringify(rows));
check('rows-show-a-date', /^\w+ \d+, 2026$/.test(highScoreRows([{ initials: 'A', score: 1, at: '2026-10-05T12:00:00Z' }])[0].date), JSON.stringify(highScoreRows([{ initials: 'A', score: 1, at: '2026-10-05T12:00:00Z' }])));
```

Create the component test:

```js
// websites/www.cs/games/cylon/test/ui.test.mjs
// Cylon's Preact overlays in the DOM stub: the ids and classes css/*.css and
// the browser specs use, what each shows, and that every control calls back.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { document, makeEl } from '../../_kit/test/dom-stub.mjs';

globalThis.document = document;
const ui = await importTsx(import.meta.dirname, { board: '../src/ui/board.tsx' });
const { renderHsRows } = ui.board;

const walk = (el, out = []) => { for (const c of el.children) if (c.nodeType === 1) { out.push(c); walk(c, out); } return out; };
const byClass = (el, name) => walk(el).filter(n => String(n.className).split(' ').includes(name));
const ROWS = [
  { rank: 1, initials: 'WMG', date: 'Oct 5, 2026', score: 12 },
  { rank: 2, initials: 'AAA', date: '', score: 3 },
];

test('rows show rank, initials, date and score', () => {
  const list = makeEl('cylon-high-scores');
  renderHsRows(list, ROWS);
  assert.equal(list.children.length, 2);
  assert.deepEqual(byClass(list, 'cylon-hs-rank').map(n => n.textContent), ['#1', '#2']);
  assert.deepEqual(byClass(list, 'cylon-hs-initials').map(n => n.textContent), ['WMG', 'AAA']);
  assert.deepEqual(byClass(list, 'cylon-hs-date').map(n => n.textContent), ['Oct 5, 2026', '']);
  assert.deepEqual(byClass(list, 'cylon-hs-score').map(n => n.textContent), ['12 KOs', '3 KOs']);
});

test('an empty board says so', () => {
  const list = makeEl('cylon-high-scores');
  renderHsRows(list, []);
  assert.equal(list.children.length, 1);
  assert.equal(list.children[0].className, 'cylon-hs-empty');
  assert.equal(list.children[0].textContent, 'No scores yet');
});

test('rows show initials as text, never as markup', () => {
  const list = makeEl('cylon-high-scores');
  renderHsRows(list, [{ rank: 1, initials: '<B>', date: '', score: 1 }]);
  const cell = byClass(list, 'cylon-hs-initials')[0];
  assert.equal(cell.textContent, '<B>');
  assert.equal(walk(cell).length, 0);
});
```

Run: `cd websites/www.cs/games/cylon && node --test test/scores.test.mjs test/ui.test.mjs`
Expected: FAIL: `highScoreRows` is not exported; `../src/ui/board.tsx` cannot be resolved.

- [ ] **Step 2: Rows as data**

In `cylon/src/scores.ts`, add after `formatHighScoreRows` (which stays until Task 11 deletes it):

```ts
/** One board row, ready to draw. */
export interface HsRow {
  rank: number;
  initials: string;
  /** The day it was set, in the player's locale; '' when unknown. */
  date: string;
  score: number;
}

export function highScoreRows(list: readonly ScoreEntry[]): HsRow[] {
  return list.map((entry, i) => {
    const when = entry.at ? new Date(entry.at) : null;
    const date = when && !Number.isNaN(when.getTime())
      ? when.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : '';
    return { rank: i + 1, initials: (entry.initials || 'AAA').toString().slice(0, 3).toUpperCase(), date, score: entry.score };
  });
}
```

- [ ] **Step 3: The board component**

```tsx
// websites/www.cs/games/cylon/src/ui/board.tsx
// Cylon Defense: a high-score board's rows. Initials come from the server, so
// they are drawn as text, never as markup. The game-over and settings panels
// both use it.
import { render } from 'preact';
import type { HsRow } from '../scores.ts';

export function HsRows({ rows }: { rows: readonly HsRow[] }) {
  if (!rows.length) return <li class="cylon-hs-empty">No scores yet</li>;
  return (
    <>
      {rows.map(r => (
        <li key={r.rank}>
          <span class="cylon-hs-rank">#{r.rank}</span>
          <strong class="cylon-hs-initials">{r.initials}</strong>
          <span class="cylon-hs-date">{r.date}</span>
          <span class="cylon-hs-score">{r.score} KOs</span>
        </li>
      ))}
    </>
  );
}

export function HsList({ id, rows }: { id: string; rows: readonly HsRow[] }) {
  return <ol class="cylon-high-scores" id={id}><HsRows rows={rows} /></ol>;
}

/** Draws rows into a list element the page already has. */
export function renderHsRows(list: Element, rows: readonly HsRow[]): void {
  render(<HsRows rows={rows} />, list);
}
```

In `cylon/src/tsconfig.dom.json`, add `"ui/board.tsx"` to `files`.

- [ ] **Step 4: Run and commit**

Run: `cd websites/www.cs/games/cylon && node --test test/scores.test.mjs test/ui.test.mjs && cd .. && node _kit/build/build.mjs cylon --check`
Expected: tests pass; the check type-checks `ui/board.tsx` and finds `dist/` current (nothing imports the component yet).

```bash
git add -A websites/www.cs/games/cylon
git commit -m "Cylon: board rows as data, drawn by a Preact list"
```

### Task 10: How to Play on `Dialog`

**Files:**
- Create: `websites/www.cs/games/cylon/src/ui/help.tsx`
- Modify: `websites/www.cs/games/cylon/mount.html` (lines 41–76, the `#cylon-help` block), `cylon/src/main.ts` (lines 131–136, 640–709, 964–966; the import list), `cylon/src/tsconfig.dom.json`, `cylon/test/ui.test.mjs`
- Modify: `websites/www.cs/tests/php/checks/deploy-set.php` (Cylon's bundle licenses ship)
- Rebuild: `cylon/dist/` (now with `THIRD_PARTY_LICENSES.txt`), then `php tools/site-versions.php`

**Interfaces:**
- Consumes: `Dialog`, `Button`, `KeyChip` (Task 6).
- Produces: `HelpProps = { open: boolean; touch: boolean; onClose: () => void }`, `renderHelp(root: Element, props: HelpProps): void`. DOM ids kept: `#cylon-help` (veil, class `cylon-help`), `.cylon-help-panel`, `#cylon-help-title`, `#cylon-help-platform`, `#cylon-help-desktop` or `#cylon-help-mobile`, `#cylon-help-close`.

- [ ] **Step 1: Add the failing tests**

In `cylon/test/ui.test.mjs`, change the `importTsx` call to `{ board: '../src/ui/board.tsx', help: '../src/ui/help.tsx' }`, add `const { renderHelp } = ui.help;`, add `click, fire` to the dom-stub import, add `const byId = (el, id) => walk(el).find(n => n.id === id);`, and append:

```js
test('How to Play shows the mouse steps on a desktop', () => {
  const root = makeEl('cylon-help-root');
  renderHelp(root, { open: true, touch: false, onClose() {} });
  const veil = byId(root, 'cylon-help');
  assert.equal(veil.hidden, false);
  assert.equal(veil.className, 'cylon-help');
  assert.equal(veil.children[0].className, 'cylon-help-panel');
  assert.equal(byId(root, 'cylon-help-title').textContent, 'How to Play');
  assert.equal(byId(root, 'cylon-help-platform').textContent, 'Desktop controls');
  assert.ok(byId(root, 'cylon-help-desktop'));
  assert.equal(byId(root, 'cylon-help-mobile'), undefined);
  assert.equal(walk(byId(root, 'cylon-help-desktop')).filter(n => n.localName === 'li').length, 10);
  assert.equal(globalThis.__focused?.id, 'cylon-help-close');
});

test('How to Play shows the touch steps on a phone', () => {
  const root = makeEl('cylon-help-root');
  renderHelp(root, { open: true, touch: true, onClose() {} });
  assert.equal(byId(root, 'cylon-help-platform').textContent, 'Touch controls');
  assert.ok(byId(root, 'cylon-help-mobile'));
  assert.match(byId(root, 'cylon-help-mobile').textContent, /Drag the green reticle/);
});

test('Got it and a click on the veil close How to Play', () => {
  const root = makeEl('cylon-help-root');
  let closed = 0;
  renderHelp(root, { open: true, touch: false, onClose: () => { closed++; } });
  click(byId(root, 'cylon-help-close'));
  fire(byId(root, 'cylon-help'), 'click');
  assert.equal(closed, 2);
});
```

Run: `cd websites/www.cs/games/cylon && node --test test/ui.test.mjs`
Expected: FAIL, cannot resolve `../src/ui/help.tsx`.

- [ ] **Step 2: The component**

```tsx
// websites/www.cs/games/cylon/src/ui/help.tsx
// Cylon Defense: How to Play. The game opens and closes it (opening pauses the
// run); this draws the steps for a mouse or for touch.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';

export interface HelpProps {
  open: boolean;
  /** A coarse pointer: show the touch steps. */
  touch: boolean;
  onClose: () => void;
}

function SharedSteps() {
  return (
    <>
      <li>Over time, expect occasional <strong>nukes</strong> and smaller <strong>missiles</strong> (each missile costs <strong>2 HP</strong>).</li>
      <li><strong>Cyan/pink</strong> missiles chase you; <strong>orange</strong> ones aim where you just were.</li>
      <li>Go <strong>10 seconds</strong> without taking a hit to <strong>heal 1 HP</strong>.</li>
      <li>More <strong>drones</strong> appear as your KO count rises.</li>
    </>
  );
}

function DesktopSteps() {
  return (
    <div class="cylon-help-body" id="cylon-help-desktop">
      <ol>
        <li>Flip <strong>Game On</strong> in the top bar.</li>
        <li><strong>Move the mouse</strong> to dodge bolts and nukes — the eye and drones track your cursor.</li>
        <li><strong>Click drones</strong> to KO them and score.</li>
        <li><strong>Grenade</strong> (<KeyChip label="G" />): arm, then click where you want the blast.</li>
        <li><strong>Raptor</strong> (<KeyChip label="R" />): orbital strike that clears the field and dazes the eye.</li>
        <SharedSteps />
        <li>You start with <strong>30 HP</strong> — hit 0, or take a nuke, then enter 3 initials for the board.</li>
      </ol>
    </div>
  );
}

function TouchSteps() {
  return (
    <div class="cylon-help-body" id="cylon-help-mobile">
      <ol>
        <li>Flip <strong>Game On</strong> in the top bar.</li>
        <li><strong>Drag the green reticle</strong> with one finger to dodge. Drones and nukes aim at that reticle.</li>
        <li>With your <strong>other finger</strong>, tap drones to KO them, or tap Grenade / Raptor / menu controls.</li>
        <li><strong>Grenade</strong>: tap the button to arm, then tap the page to throw.</li>
        <li><strong>Raptor</strong>: tap for a strike that clears drones and dazes the eye.</li>
        <SharedSteps />
        <li>You start with <strong>30 HP</strong> — hit 0, or take a nuke, then scroll initials ▲▼ for the high-score board.</li>
      </ol>
    </div>
  );
}

export function Help(p: HelpProps) {
  return (
    <Dialog open={p.open} id="cylon-help" veilClass="cylon-help" panelClass="cylon-help-panel"
      kicker="Cylon defense" kickerClass="cylon-help-kicker" titleId="cylon-help-title" titleClass="cylon-help-title"
      title="How to Play" focusId="cylon-help-close" onDismiss={p.onClose}>
      <p class="cylon-help-platform" id="cylon-help-platform">{p.touch ? 'Touch controls' : 'Desktop controls'}</p>
      {p.touch ? <TouchSteps /> : <DesktopSteps />}
      <Button class="cylon-gameover-btn" id="cylon-help-close" onClick={p.onClose}>Got it</Button>
    </Dialog>
  );
}

export function renderHelp(root: Element, props: HelpProps): void {
  render(<Help {...props} />, root);
}
```

Add `"ui/help.tsx"` to `files` in `cylon/src/tsconfig.dom.json`.

- [ ] **Step 3: Mount it and wire the game to it**

In `cylon/mount.html`, replace the whole `<div class="cylon-help" id="cylon-help" hidden>…</div>` block (lines 41–76) with:

```html
<div id="cylon-help-root"></div>
```

In `cylon/src/main.ts`:

Add `import { renderHelp } from './ui/help.tsx';` after `import { createChrome } from './chrome.ts';`.

Replace lines 131–136:

```ts
    const helpBtn = document.getElementById('cylon-help-btn');
    const helpEl = document.getElementById('cylon-help');
    const helpPlatformEl = document.getElementById('cylon-help-platform');
    const helpDesktopEl = document.getElementById('cylon-help-desktop');
    const helpMobileEl = document.getElementById('cylon-help-mobile');
    const helpCloseBtn = document.getElementById('cylon-help-close');
```

with:

```ts
    const helpBtn = document.getElementById('cylon-help-btn');
    const helpRoot = document.getElementById('cylon-help-root');
    let helpOpen = false;
```

Replace `syncHelpContent`, `openHelp`, `closeHelp` and `bindHelp` (lines 640–709) with:

```ts
    function drawHelp() {
        if (helpRoot) renderHelp(helpRoot, { open: helpOpen, touch: coarsePointer, onClose: closeHelp });
    }

    function openHelp() {
        if (!helpRoot) return;
        if (!game.paused) {
            game.paused = true;
            game.pauseStartedAt = Date.now();
            clearTimeout(game.idleTimer ?? undefined);
            holes.pause();
            clearTimeout(missileTimer ?? undefined);
            clearTimeout(nukeTimer ?? undefined);
            clearTimeout(healTimer ?? undefined);
            missileTimer = null;
            nukeTimer = null;
            healTimer = null;
            setEyeTracking(false);
            audio.syncMusic();
            updateAbilityButtons();
        }
        helpOpen = true;
        drawHelp();
    }

    function closeHelp() {
        if (!helpOpen) return;
        helpOpen = false;
        drawHelp();
        if (game.paused) {
            const elapsed = Date.now() - game.pauseStartedAt;
            applyPauseTimeSkew(elapsed);
            game.paused = false;
            game.pauseStartedAt = 0;
            audio.syncMusic();
            updateAbilityButtons();
            syncReticleVisibility();
        }
    }

    function bindHelp() {
        drawHelp();
        if (helpBtn) {
            helpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                openHelp();
            });
        }
    }
```

(The dialog handles Escape, the veil click and giving focus back to the How to Play button.)

In `setGameEnabled`, replace

```ts
            if (helpEl && !helpEl.hidden) {
                helpEl.hidden = true;
            }
```

with

```ts
            if (helpOpen) {
                helpOpen = false;
                drawHelp();
            }
```

`rg -n "helpEl|helpCloseBtn|helpPlatformEl|syncHelpContent" src/` must print nothing.

- [ ] **Step 4: Run, rebuild, check in a browser, commit**

This is the first Preact in Cylon's bundle, so the kit build (#76) now also writes `cylon/dist/THIRD_PARTY_LICENSES.txt` and starts `dist/main.js` with `/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */`. In `websites/www.cs/tests/php/checks/deploy-set.php`, after the Cylon `foreach` that checks `games/cylon/dist/main.js` and its page pieces, add:

```php
$check('ships games/cylon/dist/THIRD_PARTY_LICENSES.txt', isset($set['games/cylon/dist/THIRD_PARTY_LICENSES.txt']));
```

Run: `cd websites/www.cs/games/cylon && node --test test/ui.test.mjs && cd .. && node _kit/build/build.mjs cylon && php cylon/tools/install-files.php && cylon/test.sh && cd .. && php tools/site-versions.php && head -c 60 games/cylon/dist/main.js && grep -c '^preact ' games/cylon/dist/THIRD_PARTY_LICENSES.txt && make test && make e2e E2E_ARGS="cylon-help.spec.mjs"`
Expected: green; `main.js` starts with the licenses banner, the licenses file names `preact` once, the deploy-set check passes, and `cylon-help` (open mid-nuke, paused, close resumes) passes unchanged.

```bash
git add -A websites/www.cs/games/cylon websites/www.cs/index.html websites/www.cs/tests/php/checks/deploy-set.php
git commit -m "Cylon: How to Play is the kit's Dialog"
```

### Task 11: The game-over panel on `Dialog`

**Files:**
- Create: `websites/www.cs/games/cylon/src/ui/gameover.tsx`
- Rewrite: `websites/www.cs/games/cylon/src/gameover.ts` (whole file)
- Modify: `cylon/mount.html` (the `#cylon-gameover` block), `cylon/src/main.ts` (element lookups at lines 108–122 and 137–138, the `createGameOver` call at 204–227, the `scores.ts` import, `bindGameOverUi();`), `cylon/src/scores.ts` (delete `formatHighScoreRows`), `cylon/src/tsconfig.dom.json`, `cylon/test/ui.test.mjs`
- Rebuild: `cylon/dist/`, `php tools/site-versions.php`

**Interfaces:**
- Consumes: `Dialog`, `Button` (Task 6); `HsList`, `renderHsRows` (Task 9); `highScoreRows`, `HsRow` (Task 9).
- Produces:
  - `type Board = 'week' | 'alltime'`; `GameOverProps = { open; reason: string; kos: number; hp: number; mode: 'entry' | 'board'; initials: readonly string[]; active: number; error: string; submitting: boolean; board: Board; rows: readonly HsRow[]; allTimeRank: number | null; resetText: string; quit: boolean; onSpin(idx: number, dir: 1 | -1): void; onPick(idx: number): void; onSubmit(): void; onSkip(): void; onTab(board: Board, focus: boolean): void; onDismiss(): void }`; `renderGameOver(root: Element, props: GameOverProps): void`.
  - `createGameOver(d: GameOverDeps): GameOver` with `GameOverDeps = { game; state; scores; weeklyResetText; currentHp; setGameEnabled; resetRunStats; root: HTMLElement | null; highScoresEl: HTMLElement | null }` and `GameOver = { renderHighScores(): void; fetchHighScores(): Promise<void>; hideGameOver(): void; showGameOver(reason: EndReason): Promise<void>; resetText(): string }`. (`bindGameOverUi` is gone: the component binds its own controls.)
  - DOM ids kept: `#cylon-gameover`, `.cylon-gameover-panel`, `#cylon-gameover-title`, `#cylon-gameover-reason`, `#cylon-gameover-kos`, `#cylon-gameover-hits`, `#cylon-gameover-entry`, `#cylon-initials`, `#cylon-initial-0..2`, `#cylon-initials-error`, `#cylon-score-submit`, `#cylon-score-skip`, `#cylon-gameover-board`, `#cylon-gameover-alltime`, tabs `#cylon-tab-week` / `#cylon-tab-alltime` (role `tab`, names "This week" / "All time"), `#cylon-gameover-panel` (tabpanel), `#cylon-gameover-scores`, `#cylon-gameover-reset`, `#cylon-play-again`.

- [ ] **Step 1: Add the failing component tests**

In `cylon/test/ui.test.mjs`, add `gameover: '../src/ui/gameover.tsx'` to the `importTsx` map, `const { renderGameOver } = ui.gameover;`, and append:

```js
function gameOver(over = {}) {
  const calls = [];
  const props = {
    open: true, reason: 'A nuke landed on you. Frak.', kos: 7, hp: 12, mode: 'entry',
    initials: ['W', 'A', 'A'], active: 0, error: '', submitting: false,
    board: 'week', rows: ROWS, allTimeRank: null, resetText: 'Play often — scores reset every Sunday at midnight Central.', quit: false,
    onSpin: (i, d) => calls.push(['spin', i, d]), onPick: i => calls.push(['pick', i]), onSubmit: () => calls.push(['submit']),
    onSkip: () => calls.push(['skip']), onTab: (b, f) => calls.push(['tab', b, f]), onDismiss: () => calls.push(['dismiss']),
    ...over,
  };
  const root = makeEl('cylon-gameover-root');
  renderGameOver(root, props);
  return { root, calls };
}

test('a qualifying run opens on the initials, with its reason and stats', () => {
  const { root } = gameOver();
  assert.equal(byId(root, 'cylon-gameover').hidden, false);
  assert.equal(byId(root, 'cylon-gameover-title').textContent, 'Game Over');
  assert.equal(byId(root, 'cylon-gameover-reason').textContent, 'A nuke landed on you. Frak.');
  assert.deepEqual([byId(root, 'cylon-gameover-kos').textContent, byId(root, 'cylon-gameover-hits').textContent], ['7', '12']);
  assert.equal(byId(root, 'cylon-gameover-entry').hidden, false);
  assert.equal(byId(root, 'cylon-gameover-board').hidden, true);
  assert.deepEqual([0, 1, 2].map(i => byId(root, `cylon-initial-${i}`).textContent), ['W', 'A', 'A']);
  assert.equal(byId(root, 'cylon-initial-0').className, 'cylon-initial is-active');
  assert.equal(byId(root, 'cylon-initials-error').hidden, true);
  assert.equal(globalThis.__focused?.id, 'cylon-initial-0');
});

test('the initials answer the spinners, the wheel and the keys', () => {
  const { root, calls } = gameOver();
  const spins = byClass(root, 'cylon-initial-spin');
  click(spins[0]);
  click(spins[3]);
  fire(byClass(root, 'cylon-initial-slot')[2], 'wheel', { deltaY: 40 });
  const letter = byId(root, 'cylon-initial-1');
  for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter']) fire(letter, 'keydown', { key });
  click(byId(root, 'cylon-initial-2'));
  assert.deepEqual(calls, [
    ['spin', 0, 1], ['spin', 1, -1], ['spin', 2, -1],
    ['spin', 1, 1], ['spin', 1, -1], ['pick', 0], ['pick', 2], ['submit'],
    ['pick', 2],
  ]);
});

test('an error shows; a submit in flight cannot be sent twice; Skip calls back', () => {
  const { root, calls } = gameOver({ error: "Those initials aren't valid — choose another.", submitting: true });
  assert.equal(byId(root, 'cylon-initials-error').hidden, false);
  assert.equal(byId(root, 'cylon-initials-error').textContent, "Those initials aren't valid — choose another.");
  assert.equal(byId(root, 'cylon-score-submit').disabled, true);
  click(byId(root, 'cylon-score-skip'));
  assert.deepEqual(calls, [['skip']]);
});

test('the board shows the chosen tab, its rows, the reset note, and a new all-time rank', () => {
  const { root, calls } = gameOver({ mode: 'board', board: 'alltime', allTimeRank: 3 });
  assert.equal(byId(root, 'cylon-gameover-entry').hidden, true);
  assert.equal(byId(root, 'cylon-gameover-board').hidden, false);
  assert.deepEqual(['cylon-tab-week', 'cylon-tab-alltime'].map(id => byId(root, id).getAttribute('aria-selected')), ['false', 'true']);
  assert.equal(byId(root, 'cylon-gameover-panel').getAttribute('aria-labelledby'), 'cylon-tab-alltime');
  assert.equal(byId(root, 'cylon-gameover-scores').children.length, 2);
  assert.equal(byId(root, 'cylon-gameover-alltime').hidden, false);
  assert.equal(byId(root, 'cylon-gameover-alltime').textContent, 'New all-time #3!');
  assert.equal(byId(root, 'cylon-gameover-reset').textContent, 'Play often — scores reset every Sunday at midnight Central.');
  assert.equal(byId(root, 'cylon-play-again').textContent, 'Play Again');
  click(byId(root, 'cylon-tab-week'));
  fire(byId(root, 'cylon-tab-week'), 'keydown', { key: 'ArrowRight' });
  fire(byId(root, 'cylon-tab-alltime'), 'keydown', { key: 'Home' });
  click(byId(root, 'cylon-play-again'));
  assert.deepEqual(calls, [['tab', 'week', false], ['tab', 'alltime', true], ['tab', 'week', true], ['dismiss']]);
});

test('after a quit, the dismiss button closes instead of starting a run', () => {
  const { root } = gameOver({ mode: 'board', quit: true });
  assert.equal(byId(root, 'cylon-play-again').textContent, 'Close');
  assert.equal(byId(root, 'cylon-gameover-alltime').hidden, true);
});
```

Add `const byId = …` if Task 10 has not, and `fire` to the dom-stub import.

Run: `cd websites/www.cs/games/cylon && node --test test/ui.test.mjs`
Expected: FAIL, cannot resolve `../src/ui/gameover.tsx`.

- [ ] **Step 2: The component**

```tsx
// websites/www.cs/games/cylon/src/ui/gameover.tsx
// Cylon Defense: the game-over panel. src/gameover.ts holds the state and
// hands in a finished view of it; this draws it and reports the player's
// choices. Ids and classes are the ones css/gameover.css and the specs use.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { HsList } from './board.tsx';
import type { HsRow } from '../scores.ts';

export type Board = 'week' | 'alltime';

export interface GameOverProps {
  open: boolean;
  reason: string;
  kos: number;
  hp: number;
  /** 'entry' while the run can still file initials; 'board' after. */
  mode: 'entry' | 'board';
  initials: readonly string[];
  active: number;
  error: string;
  submitting: boolean;
  board: Board;
  rows: readonly HsRow[];
  allTimeRank: number | null;
  resetText: string;
  /** The run was quit: the dismiss button closes the panel instead of starting a run. */
  quit: boolean;
  onSpin(idx: number, dir: 1 | -1): void;
  onPick(idx: number): void;
  onSubmit(): void;
  onSkip(): void;
  onTab(board: Board, focus: boolean): void;
  onDismiss(): void;
}

const TABS: { board: Board; id: string; label: string }[] = [
  { board: 'week', id: 'cylon-tab-week', label: 'This week' },
  { board: 'alltime', id: 'cylon-tab-alltime', label: 'All time' },
];

function Initials(p: GameOverProps) {
  const onKey = (idx: number) => (e: KeyboardEvent): void => {
    if (e.key === 'ArrowUp') p.onSpin(idx, 1);
    else if (e.key === 'ArrowDown') p.onSpin(idx, -1);
    else if (e.key === 'ArrowLeft') p.onPick(idx - 1);
    else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Spacebar') { if (idx < 2) p.onPick(idx + 1); }
    else if (e.key === 'Enter') p.onSubmit();
    else return;
    e.preventDefault();
  };
  return (
    <div class="cylon-initials" id="cylon-initials" role="group" aria-label="Arcade initials">
      {[0, 1, 2].map(i => (
        <div class="cylon-initial-slot" key={i}
          onWheel={e => { e.preventDefault(); p.onSpin(i, e.deltaY < 0 ? 1 : -1); }}>
          <button type="button" class="cylon-initial-spin" data-initial={i} data-dir="1"
            aria-label={`Scroll initial ${i + 1} up`} onClick={() => p.onSpin(i, 1)}>▲</button>
          <button type="button" class={i === p.active ? 'cylon-initial is-active' : 'cylon-initial'} id={`cylon-initial-${i}`}
            data-initial={i} aria-label={`Initial ${i + 1}, use up and down to change`}
            onClick={() => p.onPick(i)} onKeyDown={onKey(i)}>{p.initials[i]}</button>
          <button type="button" class="cylon-initial-spin" data-initial={i} data-dir="-1"
            aria-label={`Scroll initial ${i + 1} down`} onClick={() => p.onSpin(i, -1)}>▼</button>
        </div>
      ))}
    </div>
  );
}

function Tabs(p: GameOverProps) {
  return (
    <div class="cylon-hs-tabs" role="tablist" aria-label="High score board">
      {TABS.map((t, i) => (
        <button type="button" class="cylon-hs-tab" role="tab" id={t.id} key={t.id} data-board={t.board}
          aria-selected={p.board === t.board ? 'true' : 'false'} tabIndex={p.board === t.board ? 0 : -1}
          aria-controls="cylon-gameover-panel" onClick={() => p.onTab(t.board, false)}
          onKeyDown={e => {
            const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            const edge = e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : -1;
            const to = step ? (i + step + TABS.length) % TABS.length : edge;
            if (to < 0) return;
            e.preventDefault();
            p.onTab(TABS[to]!.board, true);
          }}>{t.label}</button>
      ))}
    </div>
  );
}

export function GameOverPanel(p: GameOverProps) {
  const tab = p.board === 'alltime' ? 'cylon-tab-alltime' : 'cylon-tab-week';
  return (
    <Dialog open={p.open} id="cylon-gameover" veilClass="cylon-gameover" panelClass="cylon-gameover-panel"
      kicker="Cylon defense" kickerClass="cylon-gameover-kicker" titleId="cylon-gameover-title"
      titleClass="cylon-gameover-title" title="Game Over" focusId={p.mode === 'entry' ? 'cylon-initial-0' : 'cylon-play-again'}>
      <p class="cylon-gameover-reason" id="cylon-gameover-reason">{p.reason}</p>
      <p class="cylon-gameover-stats">
        <span><em id="cylon-gameover-kos">{p.kos}</em> KOs</span>
        <span><em id="cylon-gameover-hits">{p.hp}</em> HP</span>
      </p>
      <div class="cylon-gameover-entry" id="cylon-gameover-entry" hidden={p.mode !== 'entry'}>
        <p class="cylon-gameover-entry-label">Enter your initials</p>
        <Initials {...p} />
        <p class="cylon-gameover-entry-hint">↑↓ change letter · ←→ next · Enter submit</p>
        <p class="cylon-gameover-entry-error" id="cylon-initials-error" role="alert" hidden={!p.error}>{p.error}</p>
        <div class="cylon-gameover-actions">
          <Button class="cylon-gameover-btn" id="cylon-score-submit" disabled={p.submitting} onClick={p.onSubmit}>Submit Score</Button>
          <Button class="cylon-gameover-btn is-ghost" id="cylon-score-skip" onClick={p.onSkip}>Skip</Button>
        </div>
      </div>
      <div class="cylon-gameover-board" id="cylon-gameover-board" hidden={p.mode !== 'board'}>
        <p class="cylon-gameover-entry-label">High scores</p>
        <p class="cylon-gameover-alltime" id="cylon-gameover-alltime" role="status" hidden={p.allTimeRank === null}>
          {p.allTimeRank === null ? '' : `New all-time #${p.allTimeRank}!`}
        </p>
        <Tabs {...p} />
        <div role="tabpanel" id="cylon-gameover-panel" aria-labelledby={tab} tabIndex={0}>
          <HsList id="cylon-gameover-scores" rows={p.rows} />
        </div>
        <p class="cylon-gameover-entry-hint" id="cylon-gameover-reset">{p.resetText}</p>
        <Button class="cylon-gameover-btn" id="cylon-play-again" onClick={p.onDismiss}>{p.quit ? 'Close' : 'Play Again'}</Button>
      </div>
    </Dialog>
  );
}

export function renderGameOver(root: Element, props: GameOverProps): void {
  render(<GameOverPanel {...props} />, root);
}
```

(The old dismiss button's `aria-label` said "Start a new run" while it read "Play Again"; it is dropped so the visible text is the name, WCAG 2.5.3.)

Add `"ui/gameover.tsx"` to `files` in `cylon/src/tsconfig.dom.json`.

- [ ] **Step 3: The game-over module holds state and draws the component**

Replace `cylon/src/gameover.ts` with:

```ts
/* Cylon Defense: the game-over panel and the high scores.
 *
 * When a run ends the panel opens: why it ended, the run's KOs and hull, and,
 * if the score earns a place on the board, three spinning initials to file it
 * (scores.ts talks to scores.php); otherwise the board, with This week and All
 * time tabs. This module holds the panel's state and draws it with
 * ui/gameover.tsx; the run's record, and starting or closing a run, stay the
 * game's. Browser-only: DOM program. */
import type { EndReason } from './state.ts';
import type { Game, StateApi } from './types.ts';
import type { ScoreConfig, ScoresClient } from './scores.ts';
import { highScoreRows } from './scores.ts';
import { renderGameOver } from './ui/gameover.tsx';
import type { Board } from './ui/gameover.tsx';
import { renderHsRows } from './ui/board.tsx';

export interface GameOverDeps {
  game: Game;
  state: StateApi;
  scores: ScoresClient;
  weeklyResetText: (config: ScoreConfig) => string;
  /** The hull points left (rules.currentHp of the record's hits). */
  currentHp: () => number;
  /** Play Again starts a new run. */
  setGameEnabled: (on: boolean) => void;
  /** Zeroes the score and the hull display. */
  resetRunStats: () => void;
  /** mount.html's #cylon-gameover-root, where the panel is drawn. */
  root: HTMLElement | null;
  /** The settings panel's weekly list. */
  highScoresEl: HTMLElement | null;
}

export interface GameOver {
  /** Redraws both boards from the scores client. */
  renderHighScores(): void;
  /** Fetches the board and the config, then redraws. */
  fetchHighScores(): Promise<void>;
  hideGameOver(): void;
  /** Opens the panel for a run that ended for `reason`. */
  showGameOver(reason: EndReason): Promise<void>;
  /** The weekly reset sentence, from the server's config once it has loaded. */
  resetText(): string;
}

const REASONS: Record<EndReason, (qualifies: boolean) => string> = {
  hits: () => 'You took too much fire. The eye cooked you.',
  nuke: () => 'A nuke landed on you. Frak.',
  quit: qualifies => (qualifies ? 'Run ended. Record your score?' : 'Run ended.'),
};

export function createGameOver(d: GameOverDeps): GameOver {
  const { game, state, scores } = d;
  let open = false;
  let reason = '';
  let kos = 0;
  let hp = 0;
  let mode: 'entry' | 'board' = 'entry';
  let initials = ['A', 'A', 'A'];
  let active = 0;
  let error = '';
  let submitting = false;
  let board: Board = 'week';
  let allTimeRank: number | null = null;
  let resetBlurb = 'Play often — scores reset every Sunday at midnight Central.';

  function draw(): void {
    if (!d.root) return;
    renderGameOver(d.root, {
      open, reason, kos, hp, mode, initials, active, error, submitting, board, allTimeRank,
      rows: highScoreRows(board === 'alltime' ? scores.alltime() : scores.board()),
      resetText: resetBlurb,
      quit: game.run.endReason === 'quit',
      onSpin: spin, onPick: pick, onSubmit: () => { void submit(); }, onSkip: skip, onTab: selectBoard, onDismiss: dismiss,
    });
  }

  const focus = (id: string): void => { document.getElementById(id)?.focus(); };

  function renderHighScores(): void {
    if (d.highScoresEl) renderHsRows(d.highScoresEl, highScoreRows(scores.board()));
    draw();
  }

  async function fetchHighScores(): Promise<void> {
    const config = await scores.load();
    if (config) {
      resetBlurb = d.weeklyResetText(config);
      const weekly = document.getElementById('cylon-weekly-reset');
      if (weekly) weekly.textContent = resetBlurb;
    }
    renderHighScores();
  }

  function selectBoard(next: Board, withFocus: boolean): void {
    board = next;
    draw();
    if (withFocus) focus(next === 'alltime' ? 'cylon-tab-alltime' : 'cylon-tab-week');
  }

  function pick(idx: number): void {
    active = Math.max(0, Math.min(2, idx));
    draw();
    focus(`cylon-initial-${active}`);
  }

  function spin(idx: number, dir: 1 | -1): void {
    const code = (initials[idx] ?? 'A').charCodeAt(0) - 65;
    const next = String.fromCharCode(65 + ((((code + dir) % 26) + 26) % 26));
    initials = initials.map((c, i) => (i === idx ? next : c));
    error = '';
    pick(idx);
  }

  function showBoard(): void {
    mode = 'board';
    draw();
    void fetchHighScores();
  }

  async function submit(): Promise<void> {
    if (submitting) return;
    const score = game.run.pendingScore ? game.run.pendingScore.score : game.run.koScore;
    const hits = game.run.pendingScore ? game.run.pendingScore.hits : game.run.hitsTaken;
    submitting = true;
    allTimeRank = null;
    draw();
    const result = await scores.submit(score, initials.join(''), hits);
    submitting = false;
    if (result.saved) {
      error = '';
      allTimeRank = result.allTimeRank;
      game.run = state.clearPendingScore(game.run);
      showBoard();
      return;
    }
    if (result.problem === 'invalid-initials') error = "Those initials aren't valid — choose another.";
    else if (result.problem === 'save-failed') error = 'Could not save that score. Refresh and play again.';
    renderHighScores();
  }

  function skip(): void {
    game.run = state.clearPendingScore(game.run);
    showBoard();
  }

  function hideGameOver(): void {
    open = false;
    mode = 'entry';
    allTimeRank = null;
    board = 'week';
    game.run = state.setEndReason(state.clearPendingScore(game.run), null);
    draw();
  }

  function dismiss(): void {
    if (game.run.endReason === 'quit') {
      hideGameOver();
      game.run = state.clearGameOver(game.run);
      d.resetRunStats();
      return;
    }
    d.setGameEnabled(true);
  }

  async function showGameOver(why: EndReason): Promise<void> {
    if (!d.root) return;
    game.run = state.setEndReason(game.run, why);
    await fetchHighScores();
    const qualifies = scores.qualifies(game.run.koScore);
    if (!qualifies) game.run = state.clearPendingScore(game.run);
    reason = REASONS[why](qualifies);
    kos = game.run.koScore;
    hp = d.currentHp();
    mode = qualifies ? 'entry' : 'board';
    initials = ['A', 'A', 'A'];
    active = 0;
    error = '';
    open = true;
    draw();
  }

  return { renderHighScores, fetchHighScores, hideGameOver, showGameOver, resetText: () => resetBlurb };
}
```

- [ ] **Step 4: Mount it and rewire main.ts**

In `cylon/mount.html`, replace the whole `<div class="cylon-gameover" id="cylon-gameover" hidden>…</div>` block with:

```html
<div id="cylon-gameover-root"></div>
```

In `cylon/src/main.ts`:
- Replace the import `import { createScoresClient, formatHighScoreRows, weeklyResetText } from './scores.ts';` with `import { createScoresClient, weeklyResetText } from './scores.ts';`.
- Delete the lookups of `gameOverEl`, `gameOverReasonEl`, `gameOverKosEl`, `gameOverHitsEl`, `gameOverEntryEl`, `gameOverBoardEl`, `gameOverScoresEl`, `gameOverAllTimeEl`, `scoreSubmitBtn`, `initialsErrorEl`, `playAgainBtn` (lines 108–118), `initialLetters` and `initialsRoot` (lines 137–138), and add in their place `const gameOverRoot = document.getElementById('cylon-gameover-root');`.
- Replace the `createGameOver({…})` call (lines 204–227) with:

```ts
    /** The game-over panel and the high scores (src/gameover.ts). */
    const { renderHighScores, fetchHighScores, hideGameOver, showGameOver } = createGameOver({
        game,
        state,
        scores,
        weeklyResetText,
        currentHp,
        setGameEnabled,
        resetRunStats,
        root: gameOverRoot,
        highScoresEl,
    });
```

- Delete the line `bindGameOverUi();` near the end of `initializeCylonEffects`.

In `cylon/src/scores.ts`, delete `formatHighScoreRows`. `rg -n "formatHighScoreRows|bindGameOverUi|gameOverEl\b|initialLetters" src/ test/` must print nothing.

- [ ] **Step 5: Run, rebuild, check in a browser, commit**

Run: `cd websites/www.cs/games/cylon && node --test test/ui.test.mjs && cd .. && node _kit/build/build.mjs cylon && php cylon/tools/install-files.php && cylon/test.sh && cd .. && php tools/site-versions.php && make e2e E2E_ARGS="cylon-play.spec.mjs"`
Expected: green; `cylon-play` files AAA, finds the row on both tabs and reads "New all-time #n!".

```bash
git add -A websites/www.cs/games/cylon websites/www.cs/index.html
git commit -m "Cylon: the game-over panel is the kit's Dialog, its board drawn as text"
```

### Task 12: The settings panel in Preact, and PR 8 ships

**Files:**
- Create: `websites/www.cs/games/cylon/src/ui/settings.tsx`
- Modify: `websites/www.cs/index.html` (the inside of `#cylon-settings-panel`), `cylon/src/chrome.ts`, `cylon/src/gameover.ts` (`highScoresEl` becomes `boardChanged`), `cylon/src/main.ts` (the two factory calls, the `cylon-high-scores` lookup), `cylon/src/tsconfig.dom.json`, `cylon/test/ui.test.mjs`, `cylon/test/smoke.test.mjs`, `cylon/README.md`
- Rebuild: `cylon/dist/`, `php tools/site-versions.php`

**Interfaces:**
- Consumes: `HsList` (Task 9), `highScoreRows` (Task 9), `GameOver.resetText` (Task 11).
- Produces: `type SettingKey = 'soundEnabled' | 'soundVolume' | 'musicEnabled' | 'musicVolume' | 'eyeEnabled'`; `SettingsProps = { soundEnabled: boolean; soundVolume: number; musicEnabled: boolean; musicVolume: number; eyeEnabled: boolean; rows: readonly HsRow[]; resetText: string; onSetting(key: SettingKey, value: boolean | number): void }`; `renderSettings(panel: Element, props: SettingsProps): void`. `ChromeDeps` drops `renderHighScores` and gains `settingsPanel: HTMLElement | null`, `boardRows: () => readonly HsRow[]`, `resetText: () => string`; `Chrome` gains `renderSettings(): void`. `GameOverDeps.highScoresEl` becomes `boardChanged: () => void`.

- [ ] **Step 1: Add the failing component test**

In `cylon/test/ui.test.mjs`, add `settings: '../src/ui/settings.tsx'` to the `importTsx` map, `const { renderSettings } = ui.settings;`, and append:

```js
test('the settings panel shows each setting, the weekly board and its reset note', () => {
  const panel = makeEl('cylon-settings-panel');
  renderSettings(panel, {
    soundEnabled: true, soundVolume: 70, musicEnabled: false, musicVolume: 20, eyeEnabled: true,
    rows: ROWS, resetText: 'Play often — scores reset every Sunday at midnight Central.', onSetting() {},
  });
  const inputs = walk(panel).filter(n => n.localName === 'input');
  assert.deepEqual(inputs.map(i => i.getAttribute('data-setting')), ['soundEnabled', 'soundVolume', 'musicEnabled', 'musicVolume', 'eyeEnabled']);
  assert.deepEqual([inputs[0].checked, inputs[2].checked, inputs[4].checked], [true, false, true]);
  assert.deepEqual([inputs[1].value, inputs[3].value], [70, 20]);
  assert.equal(inputs[1].getAttribute('aria-label'), 'Sound effects volume');
  assert.equal(byId(panel, 'cylon-weekly-reset').textContent, 'Play often — scores reset every Sunday at midnight Central.');
  assert.equal(byId(panel, 'cylon-high-scores').children.length, 2);
});

test('changing a setting reports its key and new value', () => {
  const panel = makeEl('cylon-settings-panel');
  const seen = [];
  renderSettings(panel, {
    soundEnabled: true, soundVolume: 50, musicEnabled: true, musicVolume: 50, eyeEnabled: true,
    rows: [], resetText: '', onSetting: (k, v) => seen.push([k, v]),
  });
  const inputs = walk(panel).filter(n => n.localName === 'input');
  inputs[0].checked = false;
  fire(inputs[0], 'change');
  inputs[3].value = '30';
  fire(inputs[3], 'input');
  assert.deepEqual(seen, [['soundEnabled', false], ['musicVolume', 30]]);
});
```

Run: `cd websites/www.cs/games/cylon && node --test test/ui.test.mjs`
Expected: FAIL, cannot resolve `../src/ui/settings.tsx`.

- [ ] **Step 2: The component**

```tsx
// websites/www.cs/games/cylon/src/ui/settings.tsx
// Cylon Defense: the settings panel under the nav's gear: sound, music, their
// volumes, the eye, and the weekly board. src/chrome.ts holds the settings and
// saves them; this draws them and reports each change.
import { render } from 'preact';
import { HsList } from './board.tsx';
import type { HsRow } from '../scores.ts';

export type SettingKey = 'soundEnabled' | 'soundVolume' | 'musicEnabled' | 'musicVolume' | 'eyeEnabled';

export interface SettingsProps {
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  eyeEnabled: boolean;
  rows: readonly HsRow[];
  resetText: string;
  onSetting(key: SettingKey, value: boolean | number): void;
}

export function SettingsPanel(p: SettingsProps) {
  const toggle = (key: SettingKey, on: boolean, label: string) => (
    <label class="cylon-setting">
      <input type="checkbox" data-setting={key} checked={on}
        onChange={e => p.onSetting(key, e.currentTarget.checked)} />
      <span>{label}</span>
    </label>
  );
  const slider = (key: SettingKey, value: number, label: string, name: string) => {
    const set = (e: Event): void => p.onSetting(key, Number((e.currentTarget as HTMLInputElement).value));
    return (
      <label class="cylon-setting cylon-setting-slider">
        <span>{label}</span>
        <input type="range" min="0" max="100" step="1" value={value} data-setting={key} aria-label={name}
          onInput={set} onChange={set} />
      </label>
    );
  };
  return (
    <>
      <p class="cylon-settings-title">Options</p>
      {toggle('soundEnabled', p.soundEnabled, 'Sound effects')}
      {slider('soundVolume', p.soundVolume, 'SFX volume', 'Sound effects volume')}
      {toggle('musicEnabled', p.musicEnabled, 'Music')}
      {slider('musicVolume', p.musicVolume, 'Music volume', 'Music volume')}
      {toggle('eyeEnabled', p.eyeEnabled, 'Eye tracking')}
      <p class="cylon-settings-title cylon-settings-scores-title">Weekly high scores</p>
      <p class="cylon-settings-hint" id="cylon-weekly-reset">{p.resetText}</p>
      <HsList id="cylon-high-scores" rows={p.rows} />
      <p class="cylon-settings-hint">Start with 30 HP — occasional nukes and small missiles (2 HP each). Last 10s without a hit to heal 1. Cyan/pink missiles chase you; orange locks where you just aimed. More drones as KOs rise. Drag the reticle to dodge · tap drones · Grenade / Raptor in the bar.</p>
    </>
  );
}

export function renderSettings(panel: Element, props: SettingsProps): void {
  render(<SettingsPanel {...props} />, panel);
}
```

Add `"ui/settings.tsx"` to `files` in `cylon/src/tsconfig.dom.json`.

- [ ] **Step 3: The page keeps an empty panel; chrome.ts draws into it**

In `websites/www.cs/index.html`, replace everything between `<div class="cylon-settings-panel" id="cylon-settings-panel" hidden>` and its closing `</div>` (the "Options" title through the long hint paragraph) with nothing, leaving:

```html
        <div class="cylon-settings-panel" id="cylon-settings-panel" hidden></div>
```

In `cylon/src/chrome.ts`:
- Change the header's second paragraph to: "The player's settings (sound, music, their volumes, the eye) persist in localStorage (one kit pref) and are drawn by ui/settings.tsx in the gear's panel; the Game On toggle sits beside it."
- Add imports:

```ts
import { renderSettings as drawSettings } from './ui/settings.tsx';
import type { SettingKey } from './ui/settings.tsx';
import type { HsRow } from './scores.ts';
```

- In `ChromeDeps`, replace

```ts
  /** The game-over module's board drawing and fetching. */
  renderHighScores: () => void;
  fetchHighScores: () => Promise<void>;
```

with

```ts
  /** The gear's panel, which the settings are drawn into. */
  settingsPanel: HTMLElement | null;
  /** The weekly board and its reset sentence (the game-over module keeps them). */
  boardRows: () => readonly HsRow[];
  resetText: () => string;
  fetchHighScores: () => Promise<void>;
```

- In `Chrome`, add `renderSettings(): void;`.
- In the destructuring at the top of `createChrome`, replace `renderHighScores` with `settingsPanel`.
- Replace `function syncSettingsUi() {…}` with:

```ts
  function renderSettings(): void {
    if (!settingsPanel) return;
    drawSettings(settingsPanel, {
      soundEnabled: settings.soundEnabled,
      soundVolume: settings.soundVolume,
      musicEnabled: settings.musicEnabled,
      musicVolume: settings.musicVolume,
      eyeEnabled: settings.eyeEnabled,
      rows: d.boardRows(),
      resetText: d.resetText(),
      onSetting: applySetting,
    });
  }

  function applySetting(key: SettingKey, value: boolean | number): void {
    settings[key] = typeof value === 'number' ? Math.max(0, Math.min(100, value || 0)) : value;
    saveSettings();
    if (key === 'eyeEnabled' && !settings.eyeEnabled) setEyeTracking(false);
    audio.settingChanged(key);
  }
```

- In `saveSettings`, change `syncSettingsUi();` to `renderSettings();`.
- Replace `function bindSettings() {…}` with:

```ts
  function bindSettings() {
    if (!settingsRoot) return;
    renderSettings();
    const toggleBtn = document.getElementById('cylon-settings-toggle');
    const panel = settingsPanel;
    if (!toggleBtn || !panel) return;
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = panel.hasAttribute('hidden');
      if (open) {
        fetchHighScores();
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (!settingsRoot.contains(e.target as Node | null)) {
        panel.setAttribute('hidden', '');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
```

- Add `renderSettings` to the returned object.

In `cylon/src/gameover.ts`:
- In `GameOverDeps`, replace `highScoresEl: HTMLElement | null;` (and its comment) with:

```ts
  /** The board changed: the settings panel redraws its weekly list. */
  boardChanged: () => void;
```

- In `renderHighScores`, replace `if (d.highScoresEl) renderHsRows(d.highScoresEl, highScoreRows(scores.board()));` with `d.boardChanged();`, and delete the `renderHsRows` import.
- In `fetchHighScores`, delete the two lines that look up `cylon-weekly-reset` and set its text (the settings panel reads `resetText()`).

In `cylon/src/main.ts`:
- Add `highScoreRows` to the `./scores.ts` import.
- Replace `const highScoresEl = document.getElementById('cylon-high-scores');` with `const settingsPanel = document.getElementById('cylon-settings-panel');`.
- In the `createGameOver` call, replace `highScoresEl,` with `boardChanged: () => renderSettings(),` and add `resetText` to its destructured result.
- In the `createChrome` call, replace `renderHighScores,` with `settingsPanel,`, `boardRows: () => highScoreRows(scores.board()),` and `resetText,`; add `renderSettings` to its destructured result.

(`boardChanged` reaches `renderSettings` through an arrow, so it resolves when called: nothing redraws a board before both modules exist.)

- [ ] **Step 4: The static checks follow the markup**

In `cylon/test/smoke.test.mjs`, make `gameCode()` read the components too:

```js
const gameCode = () => strip([
  ...readdirSync(join(GAME, 'src')).filter(f => f.endsWith('.ts')).map(f => read('src', f)),
  ...readdirSync(join(GAME, 'src', 'ui')).filter(f => f.endsWith('.tsx')).map(f => read('src', 'ui', f)),
].join('\n'));
```

and replace the body of `test('no Cylon file says Monday', …)` with:

```js
  const files = {
    'metadata.yaml': read('metadata.yaml'),
    'manifest.webmanifest': read('manifest.webmanifest'),
    'mount.html': read('mount.html'),
    'src/ui/settings.tsx': read('src', 'ui', 'settings.tsx'),
    'src/gameover.ts': read('src', 'gameover.ts'),
    'play/cylon/index.html': read('..', '..', 'play', 'cylon', 'index.html'),
  };
  const stale = Object.entries(files).filter(([, body]) => /\bMonday\b/.test(body)).map(([name]) => name);
  assert.deepEqual(stale, []);
```

Add one test:

```js
test('the site page keeps an empty settings panel for the game to draw into', () => {
  assert.match(read('..', '..', 'index.html'), /<div class="cylon-settings-panel" id="cylon-settings-panel" hidden><\/div>/);
});
```

In `cylon/README.md`'s "Files" list, add `src/ui/`: "the Preact overlays (How to Play, game over, settings, the board), drawn with the kit's components; `mount.html` and the site page keep empty mount points (`#cylon-help-root`, `#cylon-gameover-root`, `#cylon-settings-panel`)." Remove any sentence that says the overlays' markup lives in `mount.html`.

- [ ] **Step 5: Verify and commit**

Run: `cd websites/www.cs/games/cylon && node --test test/ui.test.mjs test/smoke.test.mjs && cd .. && node _kit/build/build.mjs cylon && php cylon/tools/install-files.php && cd .. && php tools/site-versions.php && make test && make e2e E2E_ARGS="cylon-play.spec.mjs cylon-help.spec.mjs"`
Expected: green.

```bash
git add -A websites/www.cs/games/cylon websites/www.cs/index.html
git commit -m "Cylon: the settings panel is drawn in Preact; the site page keeps an empty mount"
```

- [ ] **Step 6: Ship PR 8**

Push `games/cylon-overlays`, open the PR ("Cylon: How to Play, game over and settings on the kit's Preact components", spec row 8). If `main` moved, rebase and rebuild the generated files (Global Constraints). Run the pr-fix loop on the review comments, then merge on green CI, deploy, live-check with `cylon-help.spec.mjs` and `home-eye.spec.mjs` (both read-only), and end the report with `/play/tankity/?v=<merge sha>`.

---

# PR 9: Crete's maze must be met, and must be winnable

Branch `games/crete-maze-rule`. Spec section 4. `?seed=` links give new mazes after this PR; the HUD drops "mistake budget"; `engine.test.mjs` and `crete-play` re-pin.

The rule, as built here:

- Attempt *i* of a seed draws its layout from `mulberry32(hashSeed(seed + ":maze:" + i))` and its run from `mulberry32(hashSeed(seed + ":run:" + i))`, so a simulation starts from exactly the stream the real run uses.
- Each candidate is played twice through `createGame` with silent hooks: the **dasher** walks `goalPath()` and never bashes, uses items or waits; the **strategist** takes the first matching rule each turn (bash; shard; jammer; snack; wait in a safe zone; step). A play ends when the run ends, the bot has no move, or after 600 actions (a loss).
- A candidate passes when the dasher ends some turn beside the creature or is caught, and the strategist reaches the exit alive. The first passing attempt among 0–79 wins. Otherwise the strategist-won attempt whose dasher came closest (fewest steps, by Manhattan distance at the end of a turn; earliest on a tie) is used, flagged `fallback`. If the strategist won none of the 80, drawing continues from attempt 80 until it wins one (also `fallback`), up to attempt 399, after which generation throws: a maze the strategist loses is never returned.
- `goalPath()` now routes through closed barriers the player holds enough fuses for (it used to fetch fuses forever when every fuse was held and a barrier still blocked the exit, which left the play-through stuck).
- The strategist waits at most six turns in a row; a creature that paces on the route ahead without coming close would otherwise hold the play-through forever.

### Task 13: Board geometry moves into `grid.ts` (a pure move)

**Files:**
- Create: `websites/www.cs/games/crete/src/grid.ts`
- Modify: `websites/www.cs/games/crete/src/engine.ts` (remove lines 37–38, 92–95, 135–153, 191–230; add imports and re-exports), `crete/tsconfig.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `grid.ts` exports `ROWS`, `COLS`, `Cell`, `key(r, c)`, `unkey(k): [number, number]`, `inBounds(r, c)`, `DIRS`, `grid(value)`, `bfsDist(walls, t)`, `bfsPath(walls, from, to)`, `manhattan(a, b)`. `engine.ts` re-exports `ROWS`, `COLS`, `key`, `bfsDist`, `bfsPath`, `manhattan` and the type `Cell`, so `ui.ts`, `main.ts` and the tests import as before.

- [ ] **Step 1: Write `grid.ts`**

```ts
/* The Island of Crete: the board's geometry. Cells and their keys, bounds, and
 * the breadth-first searches the rules, the creature and the bots share. Pure:
 * in the DOM-free program (tsconfig.json). */
export const ROWS = 15;
export const COLS = 15;

export interface Cell {
  r: number;
  c: number;
}

export const key = (r: number, c: number): string => r + "," + c;
export const inBounds = (r: number, c: number): boolean => r >= 0 && r < ROWS && c >= 0 && c < COLS;
export const manhattan = (a: Cell, b: Cell): number => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

export const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/** A [row, column] pair from a cell key. */
export function unkey(k: string): [number, number] {
  const [r, c] = k.split(",").map(Number);
  return [r!, c!];
}

/** Every cell of a ROWS x COLS grid set to `value`. */
export function grid<T>(value: T): T[][] {
  return Array.from({ length: ROWS }, () => Array<T>(COLS).fill(value));
}
```

Then move, unchanged, `bfsDist` and `bfsPath` (engine.ts lines 191–230, with their doc comments) to the end of `grid.ts`.

- [ ] **Step 2: Point the engine at it**

In `engine.ts`, delete `export const ROWS = 15;` and `export const COLS = 15;` (lines 37–38), the `Cell` interface (lines 92–95), and lines 135–153 (`key`, `inBounds`, `DIRS`, `unkey`, `grid`) and 191–230 (`bfsDist`, `bfsPath`). After `import type { Timers } from '../../_kit/ports.ts';` add:

```ts
import { ROWS, COLS, DIRS, key, inBounds, unkey, grid, bfsDist, bfsPath, manhattan } from './grid.ts';
import type { Cell } from './grid.ts';
export { ROWS, COLS, key, bfsDist, bfsPath, manhattan };
export type { Cell };
```

In `crete/tsconfig.json`, set `"files": ["src/engine.ts", "src/grid.ts"]`.

- [ ] **Step 3: Prove nothing moved**

Run: `cd websites/www.cs/games && node _kit/build/build.mjs crete && crete/test.sh`
Expected: PASS, every engine check unchanged. `git diff --stat crete/dist` may show a changed bundle (module order); the behaviour is identical.

- [ ] **Step 4: Commit**

```bash
git add -A websites/www.cs/games/crete
git commit -m "Crete: board geometry in its own module"
```

### Task 14: The rules the bots need: routes through barriers, waiting, a jammer check

**Files:**
- Modify: `websites/www.cs/games/crete/src/engine.ts` (`State`, `blankState`, `newRun`'s state reset, `Game`, `tryMove`, `bash`, `useItem`, `farSpot`, `goalPath`; new `wait`, `canJam`)
- Create: `websites/www.cs/games/crete/test/rules.test.mjs`

**Interfaces:**
- Consumes: `grid.ts` (Task 13).
- Produces: `Game.wait(): void` (spends a turn in place; the creature moves); `Game.canJam(): boolean` (a cell ≥ 6 steps away exists, so the jammer would work; draws nothing from the rng); `State.stillTurns: number` (turns waited in a row; any other turn-spending action resets it to 0); `goalPath()` returns a route through closed barriers when the player holds at least as many fuses as the route crosses.

- [ ] **Step 1: Write the failing tests**

```js
// websites/www.cs/games/crete/test/rules.test.mjs
// The rules the bots lean on: waiting, the jammer's check, and a route that
// crosses barriers the player holds fuses for.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.ts';
import { manualClock } from '../../_kit/test/clock.ts';

function harness() {
  const log = [];
  const { timers } = manualClock();
  const game = E.createGame({ say: text => log.push(text), sfx() {}, render() {}, showEnd() {}, timers });
  game.newRun('rules');
  return { game, G: game.G, log };
}
/** Border walls only: no safe zones, barriers or loot. */
function arena(G, player, foe) {
  G.walls = Array.from({ length: E.ROWS }, (_, r) => Array.from({ length: E.COLS }, (_, c) => r === 0 || c === 0 || r === E.ROWS - 1 || c === E.COLS - 1));
  G.safe = new Set();
  G.barriers = new Set();
  G.pickups = new Map();
  G.player = { ...player };
  G.foe = { ...foe };
  G.fuses = 0;
}
const wallAcross = (G, c) => { for (let r = 1; r < E.ROWS - 1; r++) G.walls[r][c] = true; };

test('waiting spends a turn in place, the creature moves, and the run counts it', () => {
  const h = harness();
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 11 });
  h.game.wait();
  assert.deepEqual(h.G.player, { r: 5, c: 5 });
  assert.equal(h.G.turns, 1);
  assert.equal(E.manhattan(h.G.foe, h.G.player), 4);
  assert.equal(h.G.stillTurns, 1);
  h.game.wait();
  assert.equal(h.G.stillTurns, 2);
  h.game.tryMove(0, -1);
  assert.equal(h.G.stillTurns, 0);
});

test('waiting is refused once the run is over', () => {
  const h = harness();
  h.G.over = true;
  h.game.wait();
  assert.equal(h.G.turns, 0);
  assert.ok(h.log.some(t => /Run over/.test(t)));
});

test('the jammer check finds a far cell without drawing from the run', () => {
  const h = harness();
  arena(h.G, { r: 5, c: 5 }, { r: 13, c: 13 });
  const probe = E.mulberry32(1);
  h.G.rng = () => { throw new Error('drew'); };
  assert.equal(h.game.canJam(), true);
  h.G.walls = h.G.walls.map((row, r) => row.map((_, c) => !(r >= 4 && r <= 6 && c >= 4 && c <= 6)));
  assert.equal(h.game.canJam(), false);
  h.G.rng = probe;
});

test('the jammer is refused, at no cost, when nowhere is far enough', () => {
  const h = harness();
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 6 });
  h.G.walls = h.G.walls.map((row, r) => row.map((_, c) => !(r >= 4 && r <= 6 && c >= 4 && c <= 6)));
  h.game.useItem('jammer');
  assert.equal(h.G.inv.jammer, 1);
  assert.equal(h.G.turns, 0);
});

test('a route crosses a barrier the player holds a fuse for', () => {
  const h = harness();
  arena(h.G, { r: 7, c: 3 }, { r: 1, c: 1 });
  wallAcross(h.G, 7);
  h.G.walls[7][7] = true;
  h.G.barriers.add(E.key(7, 7));
  h.G.exit = { r: 7, c: 11 };
  assert.deepEqual(h.game.goalPath(), [], 'no fuse held and none to fetch: no route');
  h.G.fuses = 1;
  const route = h.game.goalPath();
  assert.deepEqual(route[0], { r: 7, c: 3 });
  assert.deepEqual(route.at(-1), { r: 7, c: 11 });
  assert.ok(route.some(p => p.r === 7 && p.c === 7), 'through the barrier');
});

test('without enough fuses the route goes to the nearest fuse first', () => {
  const h = harness();
  arena(h.G, { r: 7, c: 3 }, { r: 1, c: 1 });
  wallAcross(h.G, 7);
  h.G.walls[7][7] = true;
  h.G.barriers.add(E.key(7, 7));
  h.G.exit = { r: 7, c: 11 };
  h.G.pickups.set(E.key(2, 2), 'fuse');
  assert.deepEqual(h.game.goalPath().at(-1), { r: 2, c: 2 });
});

test('an open way to the exit is preferred to one through a barrier', () => {
  const h = harness();
  arena(h.G, { r: 7, c: 3 }, { r: 1, c: 1 });
  h.G.walls[7][7] = true;
  h.G.barriers.add(E.key(7, 7));
  h.G.exit = { r: 7, c: 11 };
  h.G.fuses = 1;
  assert.ok(!h.game.goalPath().some(p => p.r === 7 && p.c === 7));
});
```

Run: `cd websites/www.cs/games/crete && node --test test/rules.test.mjs`
Expected: FAIL: `h.game.wait is not a function`, `canJam is not a function`, the barrier routes empty.

- [ ] **Step 2: Implement**

In `State`, add after `bashCd: number;`:

```ts
  /** Turns waited in a row; any other turn the player spends resets it. */
  stillTurns: number;
```

Add `stillTurns: 0,` after `bashCd: 0,` in `blankState()` and in the `Object.assign(G, {…})` of `newRun`.

In `Game`, add after `useItem(kind: ItemKind): void;`:

```ts
  /** Spend a turn in place; the creature still moves. */
  wait(): void;
  /** Whether the jammer has somewhere far enough to throw the creature. */
  canJam(): boolean;
```

In `tryMove`, after `G.turns += 1;` add `G.stillTurns = 0;`. In `bash`, after `G.turns += 1;` add `G.stillTurns = 0;`. In `useItem`, after the `G.turns += 1;` that follows the shard branch, add `G.stillTurns = 0;`.

In `useItem`, replace `if (kind === "jammer" && !farSpot(6)) {` with `if (kind === "jammer" && !canJam()) {`.

Replace `function farSpot(minDist: number): Cell | null {…}` with:

```ts
  function farCells(minDist: number): Cell[] {
    const dist = bfsDist(G.walls, G.player);
    const cands: Cell[] = [];
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        if (!G.walls[r]![c] && !G.safe.has(key(r, c)) && dist[r]![c]! >= minDist) cands.push({ r, c });
      }
    }
    return cands;
  }

  function farSpot(minDist: number): Cell | null {
    const cands = farCells(minDist);
    if (!cands.length) return null;
    return cands[Math.floor(G.rng() * cands.length)]!;
  }

  function canJam(): boolean {
    return farCells(6).length > 0;
  }

  function wait(): void {
    if (blockedMsg()) return;
    G.turns += 1;
    G.stillTurns += 1;
    say("You hold still behind the blue lines and let it pace.", "info");
    creaturePhase(0);
    render();
  }
```

Replace the first two lines of `goalPath()`:

```ts
    const p = bfsPath(G.walls, G.player, G.exit);
    if (p.length) return p;
```

with:

```ts
    const open = bfsPath(G.walls, G.player, G.exit);
    if (open.length) return open;
    if (G.fuses > 0) {
      const unbarred = G.walls.map((row) => row.slice());
      for (const k of G.barriers) {
        const [br, bc] = unkey(k);
        unbarred[br]![bc] = false;
      }
      const through = bfsPath(unbarred, G.player, G.exit);
      const crossed = through.filter((c) => G.barriers.has(key(c.r, c.c))).length;
      if (through.length && crossed <= G.fuses) return through;
    }
```

Add `wait, canJam,` to the object `createGame` returns.

- [ ] **Step 3: Run the rules and the old engine suite**

Run: `cd websites/www.cs/games/crete && node --test test/rules.test.mjs test/engine.test.mjs`
Expected: PASS. (The jammer check no longer draws from the rng, so a jammer throw lands elsewhere than before; `jammer-hurls-the-creature-far` only asks for distance ≥ 4 and still passes.)

- [ ] **Step 4: Commit**

```bash
git add -A websites/www.cs/games/crete/src websites/www.cs/games/crete/test/rules.test.mjs
git commit -m "Crete: waiting, a jammer check, and routes through barriers the player can open"
```

### Task 15: A stream per attempt, and starting a run from one

**Files:**
- Modify: `websites/www.cs/games/crete/src/engine.ts` (new `mazeRng`, `runRng`, `layoutFor`; `newRun` split into `applyRun` + `startRun`; `Game`)
- Modify: `websites/www.cs/games/crete/test/rules.test.mjs` (append)

**Interfaces:**
- Consumes: Task 14's engine.
- Produces: `mazeRng(seed: string, attempt: number): Rng`, `runRng(seed: string, attempt: number): Rng`, `layoutFor(seed: string, attempt: number): Layout` (a fresh layout each call), `Game.startRun(seed: string, attempt: number): void` (a run on attempt `attempt`'s layout and run stream; the first thing it draws is the snack's potency).

- [ ] **Step 1: Append the failing tests**

```js
test('each attempt has its own maze stream and run stream, derived from the seed', () => {
  const a = E.mazeRng('stefan-1984', 3);
  const b = E.mulberry32(E.hashSeed('stefan-1984:maze:3'));
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
  const r = E.runRng('stefan-1984', 3);
  const s = E.mulberry32(E.hashSeed('stefan-1984:run:3'));
  assert.deepEqual([r(), r()], [s(), s()]);
});

test('an attempt always lays out the same maze, as a fresh copy', () => {
  const one = E.layoutFor('lay', 2);
  const two = E.layoutFor('lay', 2);
  assert.deepEqual(one.walls, two.walls);
  assert.notEqual(one.walls, two.walls);
  assert.notDeepEqual(E.layoutFor('lay', 3).walls, one.walls);
});

test('starting a run on an attempt plays that maze from that run stream', () => {
  const h = harness();
  h.game.startRun('lay', 2);
  assert.equal(h.G.seed, 'lay');
  assert.deepEqual(h.G.walls, E.layoutFor('lay', 2).walls);
  const stream = E.runRng('lay', 2);
  assert.equal(h.G.snackHeal, 4 + Math.floor(stream() * 3));
  assert.equal(h.G.rng(), stream());
  assert.deepEqual([h.G.turns, h.G.hp, h.G.over], [0, E.MAX_HP, false]);
});
```

Run: `cd websites/www.cs/games/crete && node --test test/rules.test.mjs`
Expected: FAIL: `E.mazeRng is not a function`.

- [ ] **Step 2: Implement**

After the `EXIT` constant in `engine.ts`, add:

```ts
/** Attempt `attempt`'s layout stream. */
export function mazeRng(seed: string, attempt: number): Rng {
  return mulberry32(hashSeed(`${seed}:maze:${attempt}`));
}

/** Attempt `attempt`'s run stream: the creature's tie-breaks, the jammer, the snack. */
export function runRng(seed: string, attempt: number): Rng {
  return mulberry32(hashSeed(`${seed}:run:${attempt}`));
}

/** Attempt `attempt`'s maze; a fresh copy each call, since a run changes it as it plays. */
export function layoutFor(seed: string, attempt: number): Layout {
  return buildMaze(mazeRng(seed, attempt), START, EXIT);
}
```

In `Game`, add `startRun(seed: string, attempt: number): void;` after `newRun`.

Replace `function newRun(seedStr: string): void {` and its first three lines

```ts
  function newRun(seedStr: string): void {
    const seed = chooseSeed(seedStr);
    const { rng, layout } = generateRun(seed);
    const { walls, safe, barriers, pickups, foe, foeDist, optimal, margin } = layout;
```

with

```ts
  function newRun(seedStr: string): void {
    const seed = chooseSeed(seedStr);
    const { rng, layout } = generateRun(seed);
    applyRun(seed, layout, rng);
  }

  function startRun(seed: string, attempt: number): void {
    applyRun(seed, layoutFor(seed, attempt), runRng(seed, attempt));
  }

  function applyRun(seed: string, layout: Layout, rng: Rng): void {
    const { walls, safe, barriers, pickups, foe, foeDist, optimal, margin } = layout;
```

(the `Object.assign(G, {…})` body that followed stays as `applyRun`'s body). Add `startRun,` to the returned object.

- [ ] **Step 3: Run and commit**

Run: `cd websites/www.cs/games/crete && node --test test/rules.test.mjs test/engine.test.mjs`
Expected: PASS (`newRun` still uses the old `generateRun`; nothing pinned moves yet).

```bash
git add -A websites/www.cs/games/crete/src websites/www.cs/games/crete/test/rules.test.mjs
git commit -m "Crete: a maze stream and a run stream per attempt; a run can start on an attempt"
```

### Task 16: The dasher and the strategist

**Files:**
- Create: `websites/www.cs/games/crete/src/bots.ts`
- Create: `websites/www.cs/games/crete/test/bots.test.mjs`
- Modify: `crete/tsconfig.json` (`files` adds `src/bots.ts`), `crete/test/smoke.test.mjs` (the "never names the page" test covers `grid.ts` and `bots.ts`)

**Interfaces:**
- Consumes: `Game` (`G`, `goalPath()`, `foeDistance()`, `canJam()`), `ItemKind` (types only); `key`, `manhattan`, `Cell` from `grid.ts`.
- Produces:
  - `type BotAction = { kind: 'bash' } | { kind: 'item'; item: ItemKind } | { kind: 'wait' } | { kind: 'move'; dr: number; dc: number } | { kind: 'stuck' }`
  - `type Bot = (game: Game) => BotAction`
  - `dasher: Bot`, `strategist: Bot`, `WAIT_LIMIT = 6`, `SNACK_AT_HP = 8`, `JAM_WITHIN = 2`.

- [ ] **Step 1: Write the failing tests**

```js
// websites/www.cs/games/crete/test/bots.test.mjs
// The two bots that judge a maze, rule by rule, on small hand-made boards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.ts';
import { dasher, strategist, WAIT_LIMIT } from '../src/bots.ts';
import { manualClock } from '../../_kit/test/clock.ts';

function board(player, foe, setup = () => {}) {
  const game = E.createGame({ say() {}, sfx() {}, render() {}, showEnd() {}, timers: manualClock().timers });
  game.newRun('bots');
  const G = game.G;
  G.walls = Array.from({ length: E.ROWS }, (_, r) => Array.from({ length: E.COLS }, (_, c) => r === 0 || c === 0 || r === E.ROWS - 1 || c === E.COLS - 1));
  G.safe = new Set();
  G.barriers = new Set();
  G.pickups = new Map();
  G.player = { ...player };
  G.foe = { ...foe };
  G.exit = { r: 5, c: 13 };
  G.fuses = 0;
  setup(G);
  return game;
}

test('the strategist bashes a creature beside it when bash is ready', () => {
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 5, c: 6 })), { kind: 'bash' });
});

test('beside it with bash recharging, the strategist raises a shard if it has one and the creature is not frozen', () => {
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 4, c: 5 }, G => { G.bashCd = 2; })), { kind: 'item', item: 'shard' });
  const frozen = strategist(board({ r: 5, c: 5 }, { r: 4, c: 5 }, G => { G.bashCd = 2; G.frozen = 1; }));
  assert.notDeepEqual(frozen, { kind: 'item', item: 'shard' });
  const none = strategist(board({ r: 5, c: 5 }, { r: 4, c: 5 }, G => { G.bashCd = 2; G.inv.shard = 0; }));
  assert.notDeepEqual(none, { kind: 'item', item: 'shard' });
});

test('the strategist throws the jammer at a creature two steps ahead on its route', () => {
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 5, c: 7 })), { kind: 'item', item: 'jammer' });
});

test('no jammer for a creature behind, or more than two steps ahead, or with no jammer left', () => {
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 5, c: 3 })), { kind: 'move', dr: 0, dc: 1 });
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 5, c: 8 })), { kind: 'move', dr: 0, dc: 1 });
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 5, c: 7 }, G => { G.inv.jammer = 0; })), { kind: 'move', dr: 0, dc: 1 });
});

test('the strategist eats a snack at 8 HP, not at 9', () => {
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 12, c: 2 }, G => { G.hp = 8; })), { kind: 'item', item: 'snack' });
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 12, c: 2 }, G => { G.hp = 9; })), { kind: 'move', dr: 0, dc: 1 });
});

test('in a safe zone with the creature ahead, the strategist waits, but not more than six turns in a row', () => {
  const safeAhead = G => { G.safe.add(E.key(5, 5)); G.inv.jammer = 0; };
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 5, c: 9 }, safeAhead)), { kind: 'wait' });
  assert.equal(WAIT_LIMIT, 6);
  const tired = strategist(board({ r: 5, c: 5 }, { r: 5, c: 9 }, G => { safeAhead(G); G.stillTurns = 6; }));
  assert.deepEqual(tired, { kind: 'move', dr: 0, dc: 1 });
});

test('otherwise the strategist steps along the route, and says so when there is none', () => {
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 12, c: 2 })), { kind: 'move', dr: 0, dc: 1 });
  const walled = board({ r: 5, c: 5 }, { r: 12, c: 2 }, G => { G.walls[5][13] = true; });
  assert.deepEqual(strategist(walled), { kind: 'stuck' });
});

test('the dasher only ever steps along the route, even beside the creature', () => {
  assert.deepEqual(dasher(board({ r: 5, c: 5 }, { r: 5, c: 6 })), { kind: 'move', dr: 0, dc: 1 });
  assert.deepEqual(dasher(board({ r: 5, c: 5 }, { r: 5, c: 7 }, G => { G.hp = 1; })), { kind: 'move', dr: 0, dc: 1 });
  assert.deepEqual(dasher(board({ r: 5, c: 5 }, { r: 12, c: 2 }, G => { G.walls[5][13] = true; })), { kind: 'stuck' });
});
```

(The board's creature at (5,6) beside a player at (5,5) whose route runs east: the dasher's "move east" is into the creature's cell, which `tryMove` allows; the creature then takes its two steps.)

Run: `cd websites/www.cs/games/crete && node --test test/bots.test.mjs`
Expected: FAIL, cannot find `../src/bots.ts`.

- [ ] **Step 2: Implement**

```ts
/* The Island of Crete: the two bots that judge a maze. The dasher runs the
 * route and never fights; the strategist plays well, and is what the
 * play-through (T) runs. Each looks at a game and names one action; the
 * engine carries it out. Pure: in the DOM-free program. */
import { key, manhattan } from "./grid.ts";
import type { Cell } from "./grid.ts";
import type { Game, ItemKind } from "./engine.ts";

export type BotAction =
  | { kind: "bash" }
  | { kind: "item"; item: ItemKind }
  | { kind: "wait" }
  | { kind: "move"; dr: number; dc: number }
  | { kind: "stuck" };

export type Bot = (game: Game) => BotAction;

/** Turns the strategist will wait in a row; a creature pacing just out of reach would otherwise hold it forever. */
export const WAIT_LIMIT = 6;
export const SNACK_AT_HP = 8;
/** Steps (by search) within which a creature on the route ahead gets the jammer. */
export const JAM_WITHIN = 2;

function stepAlong(from: Cell, path: Cell[]): BotAction {
  const next = path[1];
  return next ? { kind: "move", dr: next.r - from.r, dc: next.c - from.c } : { kind: "stuck" };
}

/** Walks goalPath() (which fetches fuses when a barrier blocks the way); never bashes, uses items or waits. */
export const dasher: Bot = (game) => stepAlong(game.G.player, game.goalPath());

/** The first rule that matches wins: bash, shard, jammer, snack, wait, step. */
export const strategist: Bot = (game) => {
  const G = game.G;
  const beside = manhattan(G.foe, G.player) === 1;
  if (beside && G.bashCd === 0) return { kind: "bash" };
  if (beside && G.inv.shard > 0 && G.frozen === 0) return { kind: "item", item: "shard" };
  const path = game.goalPath();
  const foeAhead = path.slice(1).some((c) => c.r === G.foe.r && c.c === G.foe.c);
  const d = game.foeDistance();
  if (foeAhead && G.inv.jammer > 0 && d >= 0 && d <= JAM_WITHIN && game.canJam()) return { kind: "item", item: "jammer" };
  if (G.hp <= SNACK_AT_HP && G.inv.snack > 0) return { kind: "item", item: "snack" };
  if (foeAhead && G.safe.has(key(G.player.r, G.player.c)) && G.stillTurns < WAIT_LIMIT) return { kind: "wait" };
  return stepAlong(G.player, path);
};
```

In `crete/tsconfig.json`, set `"files": ["src/engine.ts", "src/grid.ts", "src/bots.ts"]`.

In `crete/test/smoke.test.mjs`, replace the test `'the engine never names the page'` with:

```js
test('the rules never name the page', () => {
  for (const file of ['engine.ts', 'grid.ts', 'bots.ts']) {
    assert.doesNotMatch(strip(read('src', file)), /\b(document|window|navigator|localStorage|AudioContext)\b/, file);
  }
});
```

- [ ] **Step 3: Run and commit**

Run: `cd websites/www.cs/games/crete && node --test test/bots.test.mjs test/smoke.test.mjs && cd .. && node_modules/.bin/tsc -p crete/tsconfig.json`
Expected: PASS; tsc silent.

```bash
git add -A websites/www.cs/games/crete
git commit -m "Crete: the dasher and the strategist"
```

### Task 17: Judge every candidate; the play-through is the strategist

**Files:**
- Modify: `websites/www.cs/games/crete/src/engine.ts` (`MISTAKE_BUDGET`, `Layout.margin`, `buildMaze`'s return, `State.budget`, `generateRun`, `applyRun`, `autoStep`, `createGame`'s return; new `trial`, `perform`, `RunPick`, `Judge`, `MAX_ATTEMPTS`)
- Modify: `crete/src/ui.ts` (the run-stats line), `crete/src/main.ts` (the restart lines)
- Modify: `crete/test/engine.test.mjs` (re-pin; drop `margin`/`budget`; the play-through check)
- Create: `crete/test/maze-rule.test.mjs`
- Rebuild: `crete/dist/`, `index.html`, `sw.js`

**Interfaces:**
- Consumes: `dasher`, `strategist`, `Bot`, `BotAction` (Task 16); `startRun`, `layoutFor`, `runRng` (Task 15); `wait` (Task 14).
- Produces:
  - `interface Trial { won: boolean; met: boolean; closest: number }`; `trial(seed: string, attempt: number, bot: Bot): Trial`.
  - `perform(game: Game, action: BotAction): void`.
  - `type Judge = (seed: string, attempt: number, bot: Bot) => Trial`.
  - `interface RunPick { attempt: number; fallback: boolean; layout: Layout; rng: Rng }`; `generateRun(seed: string, judge?: Judge): RunPick` (throws `Error("Crete: no winnable maze for seed …")` past attempt 399).
  - `MAX_ATTEMPTS = 80`. `Layout` has no `margin`; `State` has no `budget`.

- [ ] **Step 1: Write the failing rule tests**

```js
// websites/www.cs/games/crete/test/maze-rule.test.mjs
// Spec section 4: a maze is kept only if a route-runner meets the creature and
// a careful player still escapes. Choice and fallback use an injected judge;
// the last tests play real mazes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.ts';
import { dasher, strategist } from '../src/bots.ts';
import { manualClock } from '../../_kit/test/clock.ts';

/** A judge that plays nothing: each attempt's verdict comes from `table(attempt)`. */
function judge(table) {
  return (seed, attempt, bot) => {
    const row = table(attempt);
    return bot === dasher ? { won: false, met: row.met, closest: row.closest } : { won: row.won, met: false, closest: 99 };
  };
}

function harness() {
  const log = [];
  const { timers, advance, pending } = manualClock();
  const game = E.createGame({ say: text => log.push(text), sfx() {}, render() {}, showEnd() {}, timers });
  return { game, G: game.G, log, advance, pending };
}

test('the first attempt the dasher meets and the strategist wins is the maze', () => {
  const pick = E.generateRun('s', judge(a => ({ met: a >= 2, closest: a >= 2 ? 1 : 5, won: a !== 2 })));
  assert.deepEqual([pick.attempt, pick.fallback], [3, false]);
});

test('with no passing attempt, it falls back to the winnable one whose dasher came closest, earliest on a tie', () => {
  const closest = { 4: 3, 9: 2, 12: 2, 30: 5 };
  const pick = E.generateRun('s', judge(a => ({ met: false, closest: closest[a] ?? 1, won: a in closest })));
  assert.deepEqual([pick.attempt, pick.fallback], [9, true]);
});

test('it keeps drawing past 80 until the strategist wins, and never returns a maze it loses', () => {
  const pick = E.generateRun('s', judge(a => ({ met: true, closest: 0, won: a === 85 })));
  assert.deepEqual([pick.attempt, pick.fallback], [85, true]);
  assert.equal(E.MAX_ATTEMPTS, 80);
});

test('a seed nothing wins by attempt 399 is an error, not a losing maze', () => {
  assert.throws(() => E.generateRun('s', judge(() => ({ met: true, closest: 0, won: false }))), /no winnable maze/);
});

test('the pick carries its attempt\'s layout and run stream', () => {
  const pick = E.generateRun('seed-x', judge(a => ({ met: true, closest: 1, won: a === 5 })));
  assert.deepEqual(pick.layout.walls, E.layoutFor('seed-x', 5).walls);
  assert.equal(pick.rng(), E.runRng('seed-x', 5)());
});

test('real mazes: the strategist wins each one, and the dasher meets the creature unless it fell back', () => {
  for (let i = 0; i < 40; i++) {
    const seed = `rule-${i}`;
    const pick = E.generateRun(seed);
    assert.ok(E.trial(seed, pick.attempt, strategist).won, `${seed}: strategist`);
    if (!pick.fallback) assert.ok(E.trial(seed, pick.attempt, dasher).met, `${seed}: dasher`);
  }
});

test('a new run plays the picked attempt', () => {
  const h = harness();
  h.game.newRun('stefan-1984');
  assert.deepEqual(h.G.walls, E.generateRun('stefan-1984').layout.walls);
});

test('the play-through (T) wins a fresh run', () => {
  for (const seed of ['t-1', 't-2', 't-3']) {
    const h = harness();
    h.game.newRun(seed);
    h.game.toggleAuto();
    h.advance(350 * 700);
    assert.equal(h.G.won, true, seed);
    assert.equal(h.pending(), 0, `${seed}: no timer left`);
  }
});

test('T stops when there is no route, instead of spinning', () => {
  const h = harness();
  h.game.newRun('x');
  h.G.walls = Array.from({ length: E.ROWS }, (_, r) => Array.from({ length: E.COLS }, (_, c) => r === 0 || c === 0 || r === E.ROWS - 1 || c === E.COLS - 1));
  h.G.safe = new Set();
  h.G.barriers = new Set();
  h.G.pickups = new Map();
  h.G.player = { r: 5, c: 5 };
  h.G.foe = { r: 12, c: 2 };
  h.G.walls[E.EXIT.r][E.EXIT.c] = true;
  h.game.toggleAuto();
  h.advance(350);
  assert.equal(h.G.auto, false);
  assert.equal(h.pending(), 0);
  assert.ok(h.log.some(t => /Play-through is stuck/.test(t)));
});
```

Run: `cd websites/www.cs/games/crete && node --test test/maze-rule.test.mjs`
Expected: FAIL: `E.trial is not a function`, and `generateRun` returns no `attempt`.

- [ ] **Step 2: The engine judges candidates**

At the top of `engine.ts`, add `import { dasher, strategist } from './bots.ts';` and `import type { Bot, BotAction } from './bots.ts';`.

Delete `const MISTAKE_BUDGET = 6;`. In `Layout`, delete `margin` and its comment. At the end of `buildMaze`, delete the comment lines about margin and `const margin = foeDist - optimal;`, and change the return to `return { walls, safe, barriers, pickups, foe, foeDist, optimal };`. Change the comment above the creature placement to "The creature starts far: farthest from you, never camping the exit."

In `State`, delete `budget` and its comment; delete `budget: 0,` from `blankState()`. In `applyRun`, change the destructuring to `const { walls, safe, barriers, pickups, foe, foeDist, optimal } = layout;` and delete `budget: margin,`.

Replace `generateRun` and its doc comment with:

```ts
/** Candidates a seed gets before falling back. */
export const MAX_ATTEMPTS = 80;
/** Past MAX_ATTEMPTS, draws continue only to find a maze the strategist wins; the sweep shows none ever needs to. */
const LAST_ATTEMPT = 399;

export interface Trial {
  won: boolean;
  /** The creature ended a turn beside the bot, or caught it. */
  met: boolean;
  /** The fewest steps (Manhattan) between them at the end of any turn. */
  closest: number;
}

export type Judge = (seed: string, attempt: number, bot: Bot) => Trial;

export interface RunPick {
  attempt: number;
  /** No candidate passed both checks; this is the best winnable one. */
  fallback: boolean;
  layout: Layout;
  rng: Rng;
}

function pick(seed: string, attempt: number, fallback: boolean): RunPick {
  return { attempt, fallback, layout: layoutFor(seed, attempt), rng: runRng(seed, attempt) };
}

/**
 * A run's maze for a seed: the same seed always gives the same maze. The first
 * attempt whose dasher meets the creature and whose strategist escapes is
 * kept (spec section 4); failing that, the strategist-won attempt whose dasher
 * came closest. A maze the strategist loses is never returned.
 */
export function generateRun(seed: string, judge: Judge = trial): RunPick {
  let best: { attempt: number; closest: number } | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const dash = judge(seed, attempt, dasher);
    // A non-meeting candidate can only matter as a closer fallback.
    if (!dash.met && best && dash.closest >= best.closest) continue;
    if (!judge(seed, attempt, strategist).won) continue;
    if (dash.met) return pick(seed, attempt, false);
    best = { attempt, closest: dash.closest };
  }
  if (best) return pick(seed, best.attempt, true);
  for (let attempt = MAX_ATTEMPTS; attempt <= LAST_ATTEMPT; attempt++) {
    if (judge(seed, attempt, strategist).won) return pick(seed, attempt, true);
  }
  throw new Error(`Crete: no winnable maze for seed ${seed}`);
}
```

After `createGame` (end of file), add:

```ts
/** Carries out a bot's choice through the same actions a player has. */
export function perform(game: Game, action: BotAction): void {
  switch (action.kind) {
    case "bash": game.bash(); break;
    case "item": game.useItem(action.item); break;
    case "wait": game.wait(); break;
    case "move": game.tryMove(action.dr, action.dc); break;
    case "stuck": break;
  }
}

const INERT_TIMERS: Timers = {
  setTimeout: () => 0,
  clearTimeout: () => {},
  setInterval: () => 0,
  clearInterval: () => {},
};
/** A bot that has not finished by then has lost. */
const TRIAL_ACTIONS = 600;

/** Plays attempt `attempt` of `seed` with `bot` under the real rules, from the stream the real run would use. */
export function trial(seed: string, attempt: number, bot: Bot): Trial {
  const game = createGame({ say() {}, sfx() {}, render() {}, showEnd() {}, timers: INERT_TIMERS });
  game.startRun(seed, attempt);
  const G = game.G;
  let closest = manhattan(G.player, G.foe);
  for (let i = 0; i < TRIAL_ACTIONS && !G.over; i++) {
    const action = bot(game);
    if (action.kind === "stuck") break;
    perform(game, action);
    closest = Math.min(closest, manhattan(G.player, G.foe));
  }
  return { won: G.won, met: closest <= 1, closest };
}
```

In `createGame`, `newRun` stays `const { rng, layout } = generateRun(seed); applyRun(seed, layout, rng);`.

Replace `autoStep`'s body inside its `try` (from `if (Math.abs(G.foe.r - G.player.r) …` through `tryMove(p[1]!.r - G.player.r, p[1]!.c - G.player.c);`) with:

```ts
      const action = strategist(game);
      if (action.kind === "stuck") {
        stopAuto("Play-through is stuck. Your move.");
        return;
      }
      perform(game, action);
```

Replace the final `return { G, newRun, …, foeDistance, };` of `createGame` with:

```ts
  const game: Game = {
    G, newRun, startRun, tryMove, bash, useItem, wait, canJam, hint, clearHint, toggleAnswer, toggleAuto,
    stopAuto, autoStep, goalPath, foeStep, creaturePhase, foeDistance,
  };
  return game;
```

(`autoStep` refers to `game` only when a timer fires, after `createGame` has returned it.)

- [ ] **Step 3: The page stops promising a budget**

In `crete/src/ui.ts`, replace the run-stats assignment with:

```ts
    $("run-stats").textContent =
      `Seed ${G.seed} · optimal route ${G.optimal} moves ` +
      `· Sugar Puffs heal ${G.snackHeal} · creature pace 2/turn, spawned ${G.foeSpawnDist} away`;
```

In `crete/src/main.ts`'s `restart`, replace

```ts
  ui.say(`Shortest escape is ${G.optimal} moves. You can afford ${G.budget} wrong turns — then it has you.`, 'info');
```

with

```ts
  ui.say(`Shortest escape is ${G.optimal} moves. It will find you on the way: plan for the meeting.`, 'info');
```

- [ ] **Step 4: Re-pin the engine checks**

Print the new pins:

```bash
cd websites/www.cs/games/crete && node --input-type=module -e "
import * as E from './src/engine.ts';
import crypto from 'node:crypto';
const l = E.generateRun('stefan-1984').layout;
const walls = crypto.createHash('sha256').update(l.walls.map(r => r.map(w => (w ? '#' : '.')).join('')).join('\n')).digest('hex').slice(0, 12);
console.log(JSON.stringify({ walls, optimal: l.optimal, foeDist: l.foeDist, foe: l.foe }));"
```

Expected: one line of JSON, e.g. `{"walls":"…12 hex…","optimal":24,"foeDist":30,"foe":{"r":3,"c":11}}` (your numbers come from the run).

In `crete/test/engine.test.mjs`:
- After the `wallsHash` helper, add `const PIN = <the printed JSON>; // generateRun('stefan-1984') under the maze rule (spec section 4)`.
- Replace the `maze-is-pinned-per-seed` check with:

```js
check('maze-is-pinned-per-seed', wallsHash(g1.walls) === PIN.walls && g1.optimal === PIN.optimal && g1.foeDist === PIN.foeDist
  && g1.foe.r === PIN.foe.r && g1.foe.c === PIN.foe.c, `${wallsHash(g1.walls)} ${g1.optimal} ${g1.foeDist} ${JSON.stringify(g1.foe)}`);
```

- In the fairness loop, delete `if (l.margin !== l.foeDist - l.optimal) problems.push(\`${i}: margin\`);` and lower the loop from 120 seeds to 60 (each now plays its candidates).
- Replace the `run-starts-fresh` check with:

```js
  check('run-starts-fresh', G.seed === 'stefan-1984' && G.hp === E.MAX_HP && G.turns === 0 && G.pages === 0 && !G.over
    && G.player.r === 1 && G.player.c === 1 && G.optimal === PIN.optimal && G.foeSpawnDist === PIN.foeDist && G.stillTurns === 0,
    JSON.stringify([G.seed, G.hp, G.optimal, G.foeSpawnDist]));
```

- Replace the last play-through lines

```js
  h.game.toggleAuto();
  h.advance(350 * 400);
  check('auto-plays-the-run-to-an-end', h.G.over && !h.G.auto && h.pending() === 0 && route0 > 0 && h.ends.length === 1, JSON.stringify([h.G.over, h.G.turns, h.G.deathCause]));
```

with

```js
  h.game.toggleAuto();
  h.advance(350 * 700);
  check('auto-plays-the-run-to-an-end', h.G.over && !h.G.auto && h.pending() === 0 && route0 > 0 && h.ends.length === 1, JSON.stringify([h.G.over, h.G.turns, h.G.deathCause]));
```

(This run was paused and resumed by the player mid-way, so it need not be won; `maze-rule.test.mjs` checks that a T from the start wins.)

- [ ] **Step 5: Run everything Crete has, then rebuild**

Run: `cd websites/www.cs/games/crete && node --test test/maze-rule.test.mjs test/engine.test.mjs test/rules.test.mjs test/bots.test.mjs && cd .. && node _kit/build/build.mjs crete && php crete/tools/install-files.php && crete/test.sh`
Expected: PASS. `rg -n "budget|margin|MISTAKE" crete/src` prints nothing.

- [ ] **Step 6: Commit**

```bash
git add -A websites/www.cs/games/crete
git commit -m "Crete: every maze is one the creature reaches and a careful player escapes; T plays that player"
```

### Task 18: The seed sweep, `crete-play`'s pin, the docs, and PR 9 ships

**Files:**
- Create: `websites/www.cs/games/crete/test/maze-sweep.test.mjs`
- Modify: `websites/www.cs/tests/e2e/crete-play.spec.mjs` (the pinned seed's comment and the play-through's clock budget), `websites/www.cs/games/crete/README.md`

**Interfaces:**
- Consumes: `generateRun` (Task 17).
- Produces: the sweep's budgets as a test: fallback on ≤ 1% of seeds, generation p95 ≤ 20 ms; 1,000 seeds in `make test`, 10,000 on the nightly run (GitHub sets `GITHUB_EVENT_NAME=schedule` for it) or whatever `CRETE_SWEEP_SEEDS` says.

- [ ] **Step 1: Write the sweep**

```js
// websites/www.cs/games/crete/test/maze-sweep.test.mjs
// Spec section 4's budgets over many seeds: the fallback is rare and
// generation is fast. 1,000 seeds per make test; the nightly run sweeps 10,000.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateRun } from '../src/engine.ts';

const SEEDS = Number(process.env.CRETE_SWEEP_SEEDS ?? (process.env.GITHUB_EVENT_NAME === 'schedule' ? 10_000 : 1_000));

test(`over ${SEEDS} seeds the fallback fires on at most 1% and generation takes at most 20 ms at p95`, () => {
  const times = [];
  const fellBack = [];
  for (let i = 0; i < SEEDS; i++) {
    const seed = `sweep-${i}`;
    const t0 = performance.now();
    const pick = generateRun(seed);
    times.push(performance.now() - t0);
    if (pick.fallback) fellBack.push(seed);
  }
  times.sort((a, b) => a - b);
  const p95 = times[Math.floor(SEEDS * 0.95)];
  assert.ok(fellBack.length <= SEEDS * 0.01, `fallback on ${fellBack.length} of ${SEEDS}: ${fellBack.slice(0, 10).join(' ')}`);
  assert.ok(p95 <= 20, `p95 ${p95.toFixed(2)} ms`);
});
```

Run: `cd websites/www.cs/games/crete && node --test test/maze-sweep.test.mjs`
Expected: PASS, in a few seconds. If either budget fails, do not loosen the test: stop and report the numbers (the fallback count and its seeds, the p95) to the operator; the rule itself is the spec's.

Run the nightly size once locally to see it hold: `CRETE_SWEEP_SEEDS=10000 node --test test/maze-sweep.test.mjs`.

- [ ] **Step 2: Re-pin `crete-play`**

Every maze is now one the play-through wins from the start, so `play-1` still works as the pinned seed; its maze is new. In `tests/e2e/crete-play.spec.mjs`, change

```js
const WIN_SEED = 'play-1'; // the play-through wins this maze
```

to

```js
const WIN_SEED = 'play-1'; // the play-through (the strategist) wins every maze; this one is pinned so a failure replays
```

and in the first test change `await page.clock.runFor(120_000);` to `await page.clock.runFor(250_000);` (the strategist can wait in safe zones; 250 s of 350 ms steps covers its 600-action limit).

Run: `cd websites/www.cs && make e2e E2E_ARGS="crete-play.spec.mjs"`
Expected: PASS.

- [ ] **Step 3: Document the rule**

In `crete/README.md`, add a section after "Source layout and build":

```markdown
## The maze rule

Every maze must be met and must be winnable. For a seed, attempt *i* draws its
layout from `mulberry32(hashSeed(seed + ":maze:" + i))` and its run from
`mulberry32(hashSeed(seed + ":run:" + i))`, and `trial()` plays it with the real
`createGame` rules and silent hooks, twice: the **dasher** (`bots.ts`) walks
`goalPath()` and never fights; the **strategist** bashes, raises a shard,
throws the jammer, eats a snack, waits in a safe zone (six turns at most) or
steps, first match wins. The first attempt (of 80) where the creature reaches
the dasher and the strategist escapes is the maze. Failing that, the
strategist-won attempt whose dasher came closest is used; a maze the
strategist loses is never returned. The play-through (T) is the strategist,
so it wins any run it starts from the beginning. `test/maze-sweep.test.mjs`
holds the budgets (fallback on ≤ 1% of seeds, p95 ≤ 20 ms) over 1,000 seeds,
and 10,000 nightly.
```

Add `grid.ts` and `bots.ts` rows to the module table: `grid`: "cells, keys and the breadth-first searches" (DOM-free); `bots`: "the dasher and the strategist: each names one action for a game" (DOM-free). Change the `engine` row to "seeded RNG and the per-attempt streams, maze generation and the maze rule, the run's state and every rule (moves, items, bash, waiting, the chase, hint, route, play-through)".

- [ ] **Step 4: Verify and commit**

Run: `cd websites/www.cs && make test && make e2e E2E_ARGS="crete-play.spec.mjs games-hub.spec.mjs"`
Expected: green.

```bash
git add -A websites/www.cs/games/crete websites/www.cs/tests/e2e/crete-play.spec.mjs
git commit -m "Crete: the maze rule's seed sweep and budgets; crete-play re-pinned; README"
```

- [ ] **Step 5: Ship PR 9**

Push `games/crete-maze-rule`, open the PR ("Crete: every maze is met and winnable; the play-through is the strategist", spec row 9; say in the description that `?seed=` links now give new mazes). If `main` moved, rebase and rebuild the generated files (Global Constraints). Run the pr-fix loop on the review comments, then merge on green CI, deploy, live-check with `crete-play.spec.mjs`, and end the report with `/play/tankity/?v=<merge sha>`.

---

# PR 19: Install straight into each game, full screen; icons; Quit; Install and Share

Branch `games/install-and-exit`. Spec section 11. The tasks run in the order 19–24, 26–31, 25: Task 26's probe needs Task 20's manifests, and Task 25 ships the PR. If PR 12 (Tankity's title card, Plan C) is in flight when this PR starts, Task 24 moves into PR 12 and this PR ships without it; otherwise Task 24 returns Tankity to the demo it opens on, which PR 12 later puts its title card over.

### Task 19: One drawing per game, every icon rendered from it

**Files:**
- Modify: `websites/www.cs/games/package.json`, `package-lock.json` (`@resvg/resvg-js` 2.6.2, dev)
- Create: `websites/www.cs/games/_kit/build/icons.mjs`, `_kit/build/icons.test.mjs`
- Create: `websites/www.cs/games/tankity/tools/icon.svg`, `crete/tools/icon.svg`, `cylon/tools/icon.svg`
- Regenerate: each game's `icon-192.png`, `icon-512.png`; create `icon-maskable-192.png`, `icon-maskable-512.png`, `icon-monochrome-512.png`, `icon-apple-180.png`
- Modify: `_kit/README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: `ICONS: { file: string; size: number; look: 'full' | 'safe' | 'mono' }[]` (six entries, below), `iconSvg(source: string, look): string`, `rasterize(svg: string, size: number): { width: number; height: number; pixels: Uint8Array }`, `renderPng(svg: string, size: number): Buffer`, `writeIcons(gameDir: string): string[]`; CLI `node _kit/build/icons.mjs <game>` from `games/`. A source drawing is a 512×512 SVG with a `<g id="bg">` (full-bleed backdrop) and a `<g id="art">` that stays within 256 px of the centre.

| file | size | look |
|---|---|---|
| `icon-192.png`, `icon-512.png` | 192, 512 | full: backdrop and art |
| `icon-maskable-192.png`, `icon-maskable-512.png` | 192, 512 | safe: backdrop full-bleed, art scaled by 0.8 into the maskable safe zone (radius 204.8 of 512) |
| `icon-monochrome-512.png` | 512 | mono: the safe-zone art as a white silhouette on transparent, for Android's themed icons |
| `icon-apple-180.png` | 180 | full (iOS rounds the corners itself; it must be opaque) |

- [ ] **Step 1: Add the renderer**

Run: `cd websites/www.cs/games && npm install --save-dev --save-exact @resvg/resvg-js@2.6.2`
Expected: `package.json` gains `"@resvg/resvg-js": "2.6.2"` under `devDependencies`; the lockfile updates.

- [ ] **Step 2: Write the failing tests**

```js
// websites/www.cs/games/_kit/build/icons.test.mjs
// The icon renderer: the variant drawings, what each looks like in pixels,
// and the six files a game gets.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ICONS, iconSvg, rasterize, renderPng, writeIcons } from './icons.mjs';

const SOURCE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">'
  + '<g id="bg"><rect width="512" height="512" fill="#112233"/></g>'
  + '<g id="art"><circle cx="256" cy="256" r="100" fill="#ff0000"/></g></svg>';
const at = (img, x, y) => Array.from(img.pixels.slice((y * img.width + x) * 4, (y * img.width + x) * 4 + 4));
const pngSize = png => [png.readUInt32BE(16), png.readUInt32BE(20)];

test('a game gets six icons: any, maskable, monochrome and Apple', () => {
  assert.deepEqual(ICONS.map(i => [i.file, i.size, i.look]), [
    ['icon-192.png', 192, 'full'], ['icon-512.png', 512, 'full'],
    ['icon-maskable-192.png', 192, 'safe'], ['icon-maskable-512.png', 512, 'safe'],
    ['icon-monochrome-512.png', 512, 'mono'], ['icon-apple-180.png', 180, 'full'],
  ]);
});

test('a drawing without its two groups is refused', () => {
  assert.throws(() => iconSvg('<svg><rect/></svg>', 'full'), /id="bg".*id="art"/);
});

test('the full look is the drawing as drawn', () => {
  const img = rasterize(iconSvg(SOURCE, 'full'), 512);
  assert.deepEqual(at(img, 2, 2), [0x11, 0x22, 0x33, 255]);
  assert.deepEqual(at(img, 256, 256), [255, 0, 0, 255]);
  assert.deepEqual(at(img, 256 + 95, 256), [255, 0, 0, 255]);
});

test('the safe look keeps the backdrop full-bleed and shrinks the art into the safe zone', () => {
  const img = rasterize(iconSvg(SOURCE, 'safe'), 512);
  assert.deepEqual(at(img, 2, 2), [0x11, 0x22, 0x33, 255]);
  assert.deepEqual(at(img, 256, 256), [255, 0, 0, 255]);
  assert.deepEqual(at(img, 256 + 95, 256), [0x11, 0x22, 0x33, 255], 'the 100 px circle is 80 px now');
});

test('the mono look is the safe-zone art in white on transparent', () => {
  const img = rasterize(iconSvg(SOURCE, 'mono'), 512);
  assert.equal(at(img, 2, 2)[3], 0);
  assert.deepEqual(at(img, 256, 256), [255, 255, 255, 255]);
  assert.equal(at(img, 256 + 95, 256)[3], 0);
});

test('a rendered icon is a PNG of its size', () => {
  assert.deepEqual(pngSize(renderPng(iconSvg(SOURCE, 'full'), 180)), [180, 180]);
});

test('writeIcons renders a game folder\'s six icons from tools/icon.svg', () => {
  const dir = mkdtempSync(join(tmpdir(), 'icons-'));
  try {
    mkdirSync(join(dir, 'tools'));
    writeFileSync(join(dir, 'tools', 'icon.svg'), SOURCE);
    assert.deepEqual(writeIcons(dir), ICONS.map(i => i.file));
    for (const icon of ICONS) assert.deepEqual(pngSize(readFileSync(join(dir, icon.file))), [icon.size, icon.size], icon.file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

Run: `cd websites/www.cs/games && node --test _kit/build/icons.test.mjs`
Expected: FAIL, `Cannot find module '.../_kit/build/icons.mjs'`.

- [ ] **Step 3: Write the renderer**

```js
#!/usr/bin/env node
// Renders a game's install icons from one drawing, <game>/tools/icon.svg:
//   node _kit/build/icons.mjs <game>      (from websites/www.cs/games)
// The drawing is 512x512 with two groups: id="bg", the full-bleed backdrop,
// and id="art", which stays within 256 px of the centre. Maskable and
// monochrome icons scale the art by 0.8 into the safe zone (radius 204.8).
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

export const ICONS = [
  { file: 'icon-192.png', size: 192, look: 'full' },
  { file: 'icon-512.png', size: 512, look: 'full' },
  { file: 'icon-maskable-192.png', size: 192, look: 'safe' },
  { file: 'icon-maskable-512.png', size: 512, look: 'safe' },
  { file: 'icon-monochrome-512.png', size: 512, look: 'mono' },
  { file: 'icon-apple-180.png', size: 180, look: 'full' },
];

const SAFE_ART = '<g transform="translate(51.2 51.2) scale(0.8)"><use href="#art"/></g>';
const WHITE = '<filter id="icon-mono" filterUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">'
  + '<feFlood flood-color="#fff"/><feComposite in2="SourceAlpha" operator="in"/></filter>';

/** One variant: the source's groups become definitions, placed per look. */
export function iconSvg(source, look) {
  if (!/id="bg"/.test(source) || !/id="art"/.test(source)) {
    throw new Error('icon.svg needs a group id="bg" and a group id="art"');
  }
  const inner = source.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const body = look === 'full' ? '<use href="#bg"/><use href="#art"/>'
    : look === 'safe' ? `<use href="#bg"/>${SAFE_ART}`
    : `${WHITE}<g filter="url(#icon-mono)">${SAFE_ART}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><defs>${inner}</defs>${body}</svg>`;
}

function render(svg, size) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: size }, font: { loadSystemFonts: false } }).render();
}

/** RGBA pixels, for tests. */
export function rasterize(svg, size) {
  const img = render(svg, size);
  return { width: img.width, height: img.height, pixels: img.pixels };
}

export function renderPng(svg, size) {
  return render(svg, size).asPng();
}

export function writeIcons(gameDir) {
  const source = readFileSync(join(gameDir, 'tools', 'icon.svg'), 'utf8');
  for (const icon of ICONS) writeFileSync(join(gameDir, icon.file), renderPng(iconSvg(source, icon.look), icon.size));
  return ICONS.map(i => i.file);
}

if (resolve(process.argv[1] ?? '') === resolve(import.meta.filename)) {
  const name = process.argv[2];
  if (!name) {
    console.error('usage: node _kit/build/icons.mjs <game>');
    process.exit(1);
  }
  for (const f of writeIcons(resolve(import.meta.dirname, '..', '..', name))) console.log(`icons: wrote ${name}/${f}`);
}
```

Run: `cd websites/www.cs/games && node --test _kit/build/icons.test.mjs`
Expected: PASS.

- [ ] **Step 4: The three drawings**

```xml
<!-- websites/www.cs/games/tankity/tools/icon.svg: the tank under the moon. Source of every install icon (games/_kit/build/icons.mjs). -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#05060f"/>
      <stop offset="1" stop-color="#141a3a"/>
    </linearGradient>
  </defs>
  <g id="bg">
    <rect width="512" height="512" fill="url(#sky)"/>
    <path d="M0 365 C 40 335, 80 345, 120 362 S 200 345, 250 350 S 300 415, 370 425 S 440 380, 512 398 V512 H0 Z" fill="#7a4a1f" stroke="#3dbd3d" stroke-width="7"/>
  </g>
  <g id="art">
    <g fill="#ffffff">
      <circle cx="165" cy="70" r="3"/><circle cx="96" cy="112" r="3"/><circle cx="282" cy="86" r="3"/>
      <circle cx="70" cy="238" r="3"/><circle cx="430" cy="262" r="3"/>
    </g>
    <circle cx="372" cy="132" r="38" fill="#f3efe2"/>
    <g fill="#e8c36a">
      <circle cx="282" cy="168" r="3"/><circle cx="300" cy="136" r="3.5"/><circle cx="320" cy="108" r="4.5"/>
      <circle cx="340" cy="90" r="5"/><circle cx="398" cy="96" r="6"/><circle cx="416" cy="122" r="7"/>
      <circle cx="432" cy="158" r="8"/><circle cx="440" cy="200" r="9"/>
    </g>
    <rect x="196" y="262" width="86" height="15" rx="5" fill="#c99a1f" transform="rotate(-28 200 270)"/>
    <path d="M128 324 a43 43 0 0 1 86 0 z" fill="#e8b423"/>
    <rect x="82" y="320" width="178" height="33" rx="16.5" fill="#2b2b33"/>
    <g fill="#9a9aa6"><circle cx="120" cy="336" r="9"/><circle cx="153" cy="336" r="9"/><circle cx="188" cy="336" r="9"/><circle cx="221" cy="336" r="9"/></g>
  </g>
</svg>
```

```xml
<!-- websites/www.cs/games/crete/tools/icon.svg: the maze. Source of every install icon (games/_kit/build/icons.mjs). -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0e1320"/>
      <stop offset="1" stop-color="#1a2034"/>
    </linearGradient>
  </defs>
  <g id="bg"><rect width="512" height="512" fill="url(#night)"/></g>
  <g id="art">
    <g fill="none" stroke="#f0b429" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
      <path d="M196 432 H80 V80 H432 V432 H318"/>
      <path d="M385 210 V128 H128 V384 H385 V300"/>
      <path d="M230 176 H176 V336 H336 V176 H285"/>
    </g>
    <circle cx="256" cy="256" r="28" fill="#e5484d"/>
    <circle cx="256" cy="256" r="10" fill="#ffd0d0"/>
  </g>
</svg>
```

```xml
<!-- websites/www.cs/games/cylon/tools/icon.svg: the Cylon eye. Source of every install icon (games/_kit/build/icons.mjs). -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="void" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#05060d"/>
      <stop offset="1" stop-color="#0a0c16"/>
    </linearGradient>
    <radialGradient id="glow">
      <stop offset="0" stop-color="#ff2a2a"/>
      <stop offset="0.55" stop-color="#ff1a1a" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#ff0000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g id="bg"><rect width="512" height="512" fill="url(#void)"/></g>
  <g id="art">
    <circle cx="256" cy="256" r="190" fill="url(#glow)"/>
    <rect x="76" y="250" width="360" height="12" fill="#c81e1e" opacity="0.85"/>
    <circle cx="256" cy="256" r="75" fill="#05060d"/>
    <rect x="181" y="250" width="150" height="12" fill="#8a1a1a"/>
    <circle cx="256" cy="256" r="30" fill="#ff3b3b"/>
    <circle cx="256" cy="256" r="11" fill="#ffffff"/>
  </g>
</svg>
```

(The first line of each file is an XML comment before `<svg>`; `iconSvg` drops everything before the `<svg>` tag.)

Render them:

```bash
cd websites/www.cs/games && for g in tankity crete cylon; do node _kit/build/icons.mjs $g; done
```

Expected: six "icons: wrote" lines per game. Open the three `icon-maskable-512.png` and `icon-monochrome-512.png` files and look: the art sits well inside a circle of 80% of the width, and the monochrome icon is a white silhouette on transparent.

- [ ] **Step 5: Document and commit**

Add to `_kit/README.md`, in the Build section:

```markdown
`node _kit/build/icons.mjs <game>` renders the game's six install icons from
one drawing, `<game>/tools/icon.svg`: a 512×512 SVG with a full-bleed
`<g id="bg">` and a `<g id="art">` that stays within 256 px of the centre. Any
(192, 512) and Apple (180) icons are the drawing; maskable (192, 512) icons
keep the backdrop and scale the art by 0.8 into the safe zone; the monochrome
icon (512) is that art as a white silhouette for Android's themed icons. The
PNGs are checked in; rerun after editing the drawing. `install-core.php`
checks each one's size.
```

```bash
git add websites/www.cs/games/package.json websites/www.cs/games/package-lock.json websites/www.cs/games/_kit/build websites/www.cs/games/_kit/README.md websites/www.cs/games/*/tools/icon.svg websites/www.cs/games/*/icon-*.png
git commit -m "Games kit: every install icon rendered from one drawing per game"
```

### Task 20: Full-screen manifests and the icon set in `install-core.php`

**Files:**
- Modify: `websites/www.cs/games/_kit/php/install-core.php` (`install_block`, `install_icon_problems`, `install_manifest`; new `INSTALL_ICONS`)
- Modify: `websites/www.cs/games/_kit/php/tests/InstallCoreTest.php`
- Modify: `websites/www.cs/games/_kit/build/icons.test.mjs` (the two tables agree)
- Modify: `websites/www.cs/tools/site-game-pages.php` (line 83)
- Modify: `websites/www.cs/tests/e2e/games-pwa.spec.mjs`
- Regenerate: each game's `manifest.webmanifest`; Crete's and Tankity's `index.html` and `sw.js`; `play/*/index.html`

Plan C's PR 10 lands before this PR. Its Task 1 adds the `kit_php` copies to `install_sync` (and the `mkdir` in its write loop) and the `testKitPhpIsCopiedIntoServerAndChecked` / `testKitPhpMustNameAKitFile` cases to `InstallCoreTest`; this task's edits are to other functions and to `setUp()`, so rebase onto it and keep both sides. Cylon's install config is then `['kind' => 'start', 'kit_php' => ['score-guard.php']]`, and its `server/score-guard.php` copy must stay current through Step 3.

**Interfaces:**
- Consumes: the six icon files (Task 19); Plan C Task 1's `install_sync` with `kit_php`.
- Produces: `INSTALL_ICONS` (PHP constant: `[['file', 'size', 'purpose'], …]`, purposes `any`, `maskable`, `monochrome`, `apple`); every manifest has `display: "standalone"`, `display_override: ["fullscreen", "standalone"]` and five icons (all but `apple`); a `start` game (Cylon) gets `start_url` `../../index.html?game=<id>&app=1` and `scope` `../../index.html`; page games keep `./` for both. The page block's and the wrapper pages' `apple-touch-icon` is `sizes="180x180" href="…icon-apple-180.png"`.

- [ ] **Step 1: Write the failing PHP tests**

In `InstallCoreTest.php`, replace the icon loop in `setUp()`

```php
        foreach ([192, 512] as $n) {
            file_put_contents("$this->dir/icon-$n.png", self::png($n));
        }
```

with

```php
        foreach (INSTALL_ICONS as $icon) {
            file_put_contents("$this->dir/{$icon['file']}", self::png($icon['size']));
        }
```

Replace `testManifestForAPlayGameAndAStartGame` with:

```php
    public function testManifestForAPlayGameAndAStartGame(): void
    {
        [$card] = install_card($this->dir, 'play');
        $play = json_decode(install_manifest($card, 'arty'), true);
        $this->assertSame(['./', './'], [$play['start_url'], $play['scope']]);
        $start = json_decode(install_manifest(['start' => 'arty'] + $card, 'arty'), true);
        // A path, not a query, narrows the scope: browsers ignore a scope's query.
        $this->assertSame(['../../index.html?game=arty&app=1', '../../index.html'], [$start['start_url'], $start['scope']]);
    }

    public function testManifestOpensFullScreenAndListsEveryIconByPurpose(): void
    {
        [$card] = install_card($this->dir, 'play');
        $m = json_decode(install_manifest($card, 'arty'), true);
        $this->assertSame('standalone', $m['display']);
        $this->assertSame(['fullscreen', 'standalone'], $m['display_override']);
        $this->assertSame([
            ['icon-192.png', '192x192', 'any'], ['icon-512.png', '512x512', 'any'],
            ['icon-maskable-192.png', '192x192', 'maskable'], ['icon-maskable-512.png', '512x512', 'maskable'],
            ['icon-monochrome-512.png', '512x512', 'monochrome'],
        ], array_map(fn(array $i): array => [$i['src'], $i['sizes'], $i['purpose']], $m['icons']));
        $this->assertSame(['image/png'], array_values(array_unique(array_column($m['icons'], 'type'))));
    }
```

In `testBlockIsInsertedThenReplaced`, add:

```php
        $this->assertStringContainsString('<link rel="apple-touch-icon" sizes="180x180" href="icon-apple-180.png">', $once);
```

Replace `testIconsMustBeSquarePngsOfTheirSize` with:

```php
    public function testEveryIconMustBeAPngOfItsSize(): void
    {
        $this->assertSame([], install_icon_problems($this->dir));
        file_put_contents("$this->dir/icon-512.png", self::png(511));
        unlink("$this->dir/icon-maskable-192.png");
        $this->assertSame([
            'icon-512.png must be a 512x512 PNG',
            'icon-maskable-192.png must be a 192x192 PNG',
        ], install_icon_problems($this->dir));
    }
```

In `testPrecacheListsShippedFilesOnly`, change the expected list to:

```php
        $this->assertSame(['dist/main.js', 'game.css', 'icon-192.png', 'icon-512.png', 'icon-apple-180.png',
            'icon-maskable-192.png', 'icon-maskable-512.png', 'icon-monochrome-512.png', 'index.html'], $names);
```

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite kit`
Expected: FAIL: `INSTALL_ICONS` is undefined.

- [ ] **Step 2: Implement**

In `install-core.php`, after `INSTALL_SW_REGISTER`, add:

```php
/** Every install icon (rendered by games/_kit/build/icons.mjs): file, size and
 *  purpose. `apple` is the home-screen icon iOS reads from the page; the rest
 *  go in the manifest. */
const INSTALL_ICONS = [
    ['file' => 'icon-192.png', 'size' => 192, 'purpose' => 'any'],
    ['file' => 'icon-512.png', 'size' => 512, 'purpose' => 'any'],
    ['file' => 'icon-maskable-192.png', 'size' => 192, 'purpose' => 'maskable'],
    ['file' => 'icon-maskable-512.png', 'size' => 512, 'purpose' => 'maskable'],
    ['file' => 'icon-monochrome-512.png', 'size' => 512, 'purpose' => 'monochrome'],
    ['file' => 'icon-apple-180.png', 'size' => 180, 'purpose' => 'apple'],
];
```

In `install_block`, replace `'<link rel="apple-touch-icon" sizes="192x192" href="icon-192.png">',` with `'<link rel="apple-touch-icon" sizes="180x180" href="icon-apple-180.png">',`.

Replace `install_icon_problems` with:

```php
/** Problems with the install icons: each must be a square PNG of its size. */
function install_icon_problems(string $dir): array
{
    $problems = [];
    foreach (INSTALL_ICONS as $icon) {
        $n = $icon['size'];
        $info = @getimagesize("$dir/{$icon['file']}");
        if ($info === false || $info[2] !== IMAGETYPE_PNG || $info[0] !== $n || $info[1] !== $n) {
            $problems[] = "{$icon['file']} must be a {$n}x$n PNG";
        }
    }
    return $problems;
}
```

In `install_manifest`, replace the doc comment's second sentence with "A `start` game runs on the site page, so it starts there, with its scope narrowed to that page: an installed app stays in the game." and replace the `$manifest = […]` array's `start_url` through `icons` entries with:

```php
        'start_url' => $start ? '../../index.html?game=' . rawurlencode($id) . '&app=1' : ($card['play'] === 'index.html' ? './' : $card['play']),
        'scope' => $start ? '../../index.html' : './',
        'display_override' => ['fullscreen', 'standalone'],
        'display' => 'standalone',
        'background_color' => $card['background_color'],
        'theme_color' => $card['theme_color'],
        'categories' => ['games'],
        'icons' => array_values(array_map(
            fn(array $i): array => ['src' => $i['file'], 'sizes' => "{$i['size']}x{$i['size']}", 'type' => 'image/png', 'purpose' => $i['purpose']],
            array_filter(INSTALL_ICONS, fn(array $i): bool => $i['purpose'] !== 'apple')
        )),
```

In `websites/www.cs/tools/site-game-pages.php` line 83, replace

```php
        '<link rel="apple-touch-icon" sizes="192x192" href="' . site_pages_esc($base) . 'icon-192.png">',
```

with

```php
        '<link rel="apple-touch-icon" sizes="180x180" href="' . site_pages_esc($base) . 'icon-apple-180.png">',
```

Add to `_kit/build/icons.test.mjs`:

```js
test('install-core.php checks exactly the icons this renders', () => {
  const php = readFileSync(join(import.meta.dirname, '..', 'php', 'install-core.php'), 'utf8');
  const listed = [...php.matchAll(/\['file' => '([^']+)', 'size' => (\d+)/g)].map(m => [m[1], Number(m[2])]);
  assert.deepEqual(listed, ICONS.map(i => [i.file, i.size]));
});
```

- [ ] **Step 3: Regenerate and run**

Run:

```bash
cd websites/www.cs
vendor/bin/phpunit --testsuite kit
(cd games && node --test _kit/build/icons.test.mjs)
for g in crete cylon tankity; do php games/$g/tools/install-files.php; done
php tools/site-game-pages.php
make test
```

Expected: green, Plan C's two `KitPhp` cases included; `install-files.php` rewrites the three manifests and the Crete and Tankity pages and `sw.js` (the new icons are precached) and leaves `cylon/server/score-guard.php` as it is; `site-game-pages.php` rewrites `play/*/index.html`.

- [ ] **Step 4: The PWA spec checks what installs**

In `tests/e2e/games-pwa.spec.mjs`, in the `links a valid manifest` test:
- Replace `expect(html).toMatch(/<link rel="apple-touch-icon" [^>]*href="[^"]*icon-192\.png"/);` with `expect(html).toMatch(/<link rel="apple-touch-icon" sizes="180x180" href="[^"]*icon-apple-180\.png"/);`.
- After `expect(m.display).toBe('standalone');` add `expect(m.display_override).toEqual(['fullscreen', 'standalone']);`.
- Replace

```js
    if (id === 'cylon') expect(start.search).toBe('?game=cylon');
    else expect(scope.pathname).toMatch(new RegExp(`/games/${id}/$`));
```

with

```js
    if (id === 'cylon') {
      expect(start.search).toBe('?game=cylon&app=1');
      expect(scope.pathname).toMatch(/\/index\.html$/);
    } else {
      expect(scope.pathname).toMatch(new RegExp(`/games/${id}/$`));
    }
```

- Replace the "Icons: 192 and 512 exist" block's first two lines with:

```js
    // Icons: any, maskable and monochrome, each a PNG of its stated size.
    expect(m.icons.map(i => `${i.purpose} ${i.sizes}`)).toEqual(
      ['any 192x192', 'any 512x512', 'maskable 192x192', 'maskable 512x512', 'monochrome 512x512']);
```

and append after the icon loop:

```js
    const apple = html.match(/<link rel="apple-touch-icon" sizes="180x180" href="([^"]+)"/)[1];
    const appleRes = await request.get(new URL(apple, new URL(PAGE_GAMES.includes(id) ? `games/${id}/` : `play/${id}/`, baseURL)).href);
    expect(appleRes.status()).toBe(200);
    const appleBody = await appleRes.body();
    expect(appleBody.readUInt32BE(16) + 'x' + appleBody.readUInt32BE(20)).toBe('180x180');
```

Run: `cd websites/www.cs && make e2e E2E_ARGS="games-pwa.spec.mjs"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A websites/www.cs/games websites/www.cs/tools/site-game-pages.php websites/www.cs/play websites/www.cs/tests/e2e/games-pwa.spec.mjs
git commit -m "Install: full-screen manifests, every icon by purpose, a 180 px Apple icon; Cylon's app scoped to its page"
```

### Task 21: `app.ts`: installed, full screen, and leaving

**Files:**
- Create: `websites/www.cs/games/_kit/app.ts`
- Create: `websites/www.cs/games/_kit/test/app.test.mjs`
- Modify: `_kit/README.md`

**Interfaces:**
- Consumes: `Timers` (ports.ts), `browserTimers` (ports.browser.ts); `manualClock` (tests).
- Produces:
  - `EXIT_HINT = 'Swipe the app away to close it'`, `CLOSE_WAIT_MS = 150`
  - `interface AppEnv { matches(query: string): boolean; iosStandalone(): boolean; fullscreenElement(): Element | null; requestFullscreen(el: Element): Promise<void>; exitFullscreen(): Promise<void>; closeWindow(): void; closed(): boolean; timers: Timers }`
  - `type ExitOutcome = 'closed' | 'title' | 'title-with-hint'`
  - `isInstalled(env): boolean` (display-mode `fullscreen`, `standalone` or `minimal-ui`, or iOS `navigator.standalone`)
  - `enterFullscreen(env, el: Element): Promise<boolean>` (true when full screen; never throws)
  - `exitApp(env): Promise<ExitOutcome>`: installed → `closeWindow()`, and if the window reports closed within `CLOSE_WAIT_MS` → `'closed'`; otherwise leave full screen if in it, and `'title-with-hint'` when installed, `'title'` in a browser tab (which is never asked to close).
  - `browserAppEnv(): AppEnv`

- [ ] **Step 1: Write the failing tests**

```js
// websites/www.cs/games/_kit/test/app.test.mjs
// Installed-app detection, full screen, and the three ways a game is left:
// an installed app that can close, one that cannot, and a browser tab.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isInstalled, enterFullscreen, exitApp, EXIT_HINT, CLOSE_WAIT_MS } from '../app.ts';
import { manualClock } from './clock.ts';

function fakeEnv({ modes = [], ios = false, full = false, closes = false, refuse = false } = {}) {
  const clock = manualClock();
  const log = [];
  let closed = false;
  let inFull = full;
  const env = {
    matches: q => modes.some(m => q === `(display-mode: ${m})`),
    iosStandalone: () => ios,
    fullscreenElement: () => (inFull ? { id: 'frame' } : null),
    requestFullscreen: async () => { log.push('enter'); if (refuse) throw new Error('denied'); inFull = true; },
    exitFullscreen: async () => { log.push('leave'); if (refuse) throw new Error('denied'); inFull = false; },
    closeWindow: () => { log.push('close'); if (closes) closed = true; },
    closed: () => closed,
    timers: clock.timers,
  };
  return { env, log, clock };
}

test('an app runs installed in any app display mode, or as an iOS home-screen app', () => {
  for (const m of ['fullscreen', 'standalone', 'minimal-ui']) assert.equal(isInstalled(fakeEnv({ modes: [m] }).env), true, m);
  assert.equal(isInstalled(fakeEnv({ ios: true }).env), true);
  assert.equal(isInstalled(fakeEnv({ modes: ['browser'] }).env), false);
  assert.equal(isInstalled(fakeEnv().env), false);
});

test('an installed app that may close its window closes it', async () => {
  const { env, log, clock } = fakeEnv({ modes: ['fullscreen'], closes: true });
  const out = exitApp(env);
  clock.advance(CLOSE_WAIT_MS);
  assert.equal(await out, 'closed');
  assert.deepEqual(log, ['close']);
});

test('an installed app that cannot close falls back to its title card, out of full screen, with the hint', async () => {
  const { env, log, clock } = fakeEnv({ modes: ['standalone'], full: true });
  let settled = false;
  const out = exitApp(env).then(v => { settled = true; return v; });
  clock.advance(CLOSE_WAIT_MS - 1);
  await Promise.resolve();
  assert.equal(settled, false, 'it gives the window its moment to close');
  clock.advance(1);
  assert.equal(await out, 'title-with-hint');
  assert.deepEqual(log, ['close', 'leave']);
  assert.equal(EXIT_HINT, 'Swipe the app away to close it');
});

test('a browser tab is never asked to close: it leaves full screen and shows the title card', async () => {
  const { env, log, clock } = fakeEnv({ full: true });
  assert.equal(await exitApp(env), 'title');
  assert.deepEqual(log, ['leave']);
  assert.equal(clock.pending(), 0);
  const plain = fakeEnv();
  assert.equal(await exitApp(plain.env), 'title');
  assert.deepEqual(plain.log, []);
});

test('a browser that refuses to leave full screen still gets the title card', async () => {
  const { env } = fakeEnv({ full: true, refuse: true });
  assert.equal(await exitApp(env), 'title');
});

test('entering full screen asks once, and says whether it worked', async () => {
  const off = fakeEnv();
  assert.equal(await enterFullscreen(off.env, {}), true);
  assert.deepEqual(off.log, ['enter']);
  const on = fakeEnv({ full: true });
  assert.equal(await enterFullscreen(on.env, {}), true);
  assert.deepEqual(on.log, []);
  const refused = fakeEnv({ refuse: true });
  assert.equal(await enterFullscreen(refused.env, {}), false);
});
```

Run: `cd websites/www.cs/games && node --test _kit/test/app.test.mjs`
Expected: FAIL, `Cannot find module '.../_kit/app.ts'`.

- [ ] **Step 2: Implement**

```ts
// websites/www.cs/games/_kit/app.ts
// What every game shares about running as an installed app: telling whether
// it is one, full screen, and leaving. The browser is a port (AppEnv), so the
// three ways a game can be left are unit-tested. DOM program only.
import type { Timers } from './ports.ts';
import { browserTimers } from './ports.browser.ts';

export const EXIT_HINT = 'Swipe the app away to close it';
/** How long a closing window gets before the game falls back to its title card. */
export const CLOSE_WAIT_MS = 150;

export interface AppEnv {
  /** window.matchMedia(query).matches */
  matches(query: string): boolean;
  /** iOS home-screen apps say so here, not through display-mode. */
  iosStandalone(): boolean;
  fullscreenElement(): Element | null;
  requestFullscreen(el: Element): Promise<void>;
  exitFullscreen(): Promise<void>;
  closeWindow(): void;
  closed(): boolean;
  timers: Timers;
}

export type ExitOutcome = 'closed' | 'title' | 'title-with-hint';

const APP_MODES = ['fullscreen', 'standalone', 'minimal-ui'];

export function isInstalled(env: AppEnv): boolean {
  return APP_MODES.some(m => env.matches(`(display-mode: ${m})`)) || env.iosStandalone();
}

export async function enterFullscreen(env: AppEnv, el: Element): Promise<boolean> {
  if (env.fullscreenElement()) return true;
  try {
    await env.requestFullscreen(el);
    return true;
  } catch {
    return false;
  }
}

/**
 * Leaves the game. An installed app asks to close its window (installed
 * desktop Chrome and Edge allow it); where that does nothing, and always in a
 * browser tab, which must never be closed, it leaves full screen and the game
 * shows its title card. An installed app that is still open adds the hint.
 */
export async function exitApp(env: AppEnv): Promise<ExitOutcome> {
  const installed = isInstalled(env);
  if (installed) {
    env.closeWindow();
    const gone = await new Promise<boolean>(resolve => {
      env.timers.setTimeout(() => resolve(env.closed()), CLOSE_WAIT_MS);
    });
    if (gone) return 'closed';
  }
  if (env.fullscreenElement()) {
    try {
      await env.exitFullscreen();
    } catch {
      // Already out, or refused: the title card shows either way.
    }
  }
  return installed ? 'title-with-hint' : 'title';
}

export function browserAppEnv(): AppEnv {
  return {
    matches: q => typeof window.matchMedia === 'function' && window.matchMedia(q).matches,
    iosStandalone: () => (navigator as Navigator & { standalone?: boolean }).standalone === true,
    fullscreenElement: () => document.fullscreenElement,
    requestFullscreen: el => (typeof el.requestFullscreen === 'function' ? el.requestFullscreen() : Promise.reject(new Error('no fullscreen'))),
    exitFullscreen: () => (typeof document.exitFullscreen === 'function' ? document.exitFullscreen() : Promise.resolve()),
    closeWindow: () => window.close(),
    closed: () => window.closed,
    timers: browserTimers,
  };
}
```

- [ ] **Step 3: Run, type-check, document, commit**

Run: `cd websites/www.cs/games && node --test _kit/test/app.test.mjs && node_modules/.bin/tsc -p _kit/tsconfig.json`
Expected: PASS; tsc silent.

Add to `_kit/README.md`:

```markdown
## Installed apps (`app.ts`)

Each game installs as its own app (its manifest asks for full screen, then
standalone). `isInstalled(env)` reads the display mode (or iOS's
`navigator.standalone`); `enterFullscreen(env, el)` asks once and reports
whether it worked; `exitApp(env)` is every game's Quit: an installed app asks
to close its window, and where that does nothing within `CLOSE_WAIT_MS`, or in
a browser tab (never closed), it leaves full screen and answers `'title'` or,
for an installed app, `'title-with-hint'`: the game then shows its title card
and, with the hint, `EXIT_HINT`. Pages pass `browserAppEnv()`; tests pass a
fake environment and a manual clock.
```

```bash
git add websites/www.cs/games/_kit/app.ts websites/www.cs/games/_kit/test/app.test.mjs websites/www.cs/games/_kit/README.md
git commit -m "Games kit: app.ts (installed, full screen, and one way to leave)"
```

### Task 22: Crete's Quit control, key and title card

**Files:**
- Create: `websites/www.cs/games/crete/src/ui/title.tsx`
- Modify: `crete/src/engine.ts` (`Game.quit`), `crete/src/ui.ts` (`Ui`, `Controls`, keys, the Quit button, the title card), `crete/src/main.ts`, `crete/index.html` (a Quit button, `#title-root`), `crete/src/tsconfig.dom.json`, `crete/test/ui.test.mjs`, `crete/test/rules.test.mjs`, `crete/README.md`, `tests/e2e/crete-play.spec.mjs`
- Rebuild: `crete/dist/`, `index.html`, `sw.js`

**Interfaces:**
- Consumes: `exitApp`, `browserAppEnv`, `EXIT_HINT` (Task 21); `Dialog`, `Button` (Task 6).
- Produces: `Game.quit(): void` (ends the run where it stands: no ending card, no turn, the play-through stopped); `TitleCardProps = { open: boolean; hint: boolean; onPlay: () => void }`, `renderTitleCard(root, props)`; ids `#title-veil`, `#title-name`, `#title-play`, `#title-hint`; `Ui.showTitle(hint: boolean)`, `Ui.hideTitle()`; `Controls.quit()`; key `Q` and button `#quit`.

- [ ] **Step 1: Write the failing tests**

Append to `crete/test/rules.test.mjs`:

```js
test('quitting ends the run where it stands: no ending card, no turn, play-through stopped', () => {
  const ends = [];
  const clock = manualClock();
  const game = E.createGame({ say() {}, sfx() {}, render() {}, showEnd: won => ends.push(won), timers: clock.timers });
  game.newRun('quit');
  game.toggleAuto();
  game.quit();
  assert.deepEqual([game.G.over, game.G.won, game.G.auto, game.G.turns, ends.length, clock.pending()], [true, false, false, 0, 0, 0]);
});
```

In `crete/test/ui.test.mjs`, add `title: '../src/ui/title.tsx'` to the `importTsx` map, `const { renderTitleCard } = ui.title;`, and append:

```js
test('the title card names the game and focuses Play; Play calls back', () => {
  const root = makeEl('title-root');
  let played = 0;
  renderTitleCard(root, { open: false, hint: false, onPlay: () => { played++; } });
  assert.equal(byId(root, 'title-veil').hidden, true);
  renderTitleCard(root, { open: true, hint: false, onPlay: () => { played++; } });
  assert.equal(byId(root, 'title-veil').hidden, false);
  assert.equal(byId(root, 'title-name').textContent, 'The Island of Crete');
  assert.equal(byId(root, 'title-hint'), undefined);
  assert.equal(globalThis.__focused?.id, 'title-play');
  click(byId(root, 'title-play'));
  assert.equal(played, 1);
});

test('an installed app that could not close says how to', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: true, onPlay() {} });
  assert.equal(byId(root, 'title-hint').textContent, 'Swipe the app away to close it.');
});
```

Run: `cd websites/www.cs/games/crete && node --test test/rules.test.mjs test/ui.test.mjs`
Expected: FAIL: `game.quit is not a function`; `../src/ui/title.tsx` cannot be resolved.

- [ ] **Step 2: The engine's quit**

In `Game`, add `quit(): void;` with the doc comment `/** Ends the run where it stands, with no ending card: the player is leaving. */`. In `createGame`, add:

```ts
  function quit(): void {
    if (G.over) return;
    stopAuto();
    clearHint();
    G.hint = null;
    G.over = true;
    G.won = false;
    render();
  }
```

and `quit,` to the `game` object.

- [ ] **Step 3: The title card**

```tsx
// websites/www.cs/games/crete/src/ui/title.tsx
// The Island of Crete: the title card, shown after Quit when the game cannot
// close its own window. Play starts a new run on the seed box.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { EXIT_HINT } from '../../../_kit/app.ts';

export interface TitleCardProps {
  open: boolean;
  /** An installed app that could not close itself: say how to. */
  hint: boolean;
  onPlay: () => void;
}

export function TitleCard(p: TitleCardProps) {
  return (
    <Dialog open={p.open} id="title-veil" veilClass="veil" panelClass="card" kicker="Minotaur chase" kickerClass="kicker"
      titleId="title-name" title="The Island of Crete" focusId="title-play">
      <p>A text-based chase. Theseus (you) moves once. The Minotaur moves twice. Reach the exit alive.</p>
      {p.hint && <p id="title-hint" class="runstats" role="status">{EXIT_HINT}.</p>}
      <Button id="title-play" onClick={p.onPlay}>▶ Play (N)</Button>
    </Dialog>
  );
}

export function renderTitleCard(root: Element, props: TitleCardProps): void {
  render(<TitleCard {...props} />, root);
}
```

Add `"ui/title.tsx"` to `files` in `crete/src/tsconfig.dom.json`.

- [ ] **Step 4: The page: a Quit button, a key, and the card**

In `crete/index.html`, add after the `#mute` button inside `#seed-form`:

```html
        <button type="button" id="quit" title="End this run and leave the game">⏻ Quit (Q)</button>
```

and after `<div id="end-root"></div>`:

```html
    <div id="title-root"></div>
```

Change the "Stuck?" help item's last sentence to: "<strong>M</strong> toggles sound. <strong>Q</strong> quits."

In `crete/src/ui.ts`:
- Add `import { renderTitleCard } from "./ui/title.tsx";`.
- In `Controls`, add `/** Leave the game (Q, or the Quit button). */ quit(): void;`.
- In `Ui`, add `/** The title card, after Quit; \`hint\` adds how to close an installed app. */ showTitle(hint: boolean): void;` and `hideTitle(): void;`.
- After the endings section, add:

```ts
  /* ---------- the title card, after Quit ---------- */
  let title = { open: false, hint: false };
  let play = (): void => {};
  function drawTitle(): void {
    renderTitleCard($("title-root"), { ...title, onPlay: () => play() });
  }
  function showTitle(hint: boolean): void {
    title = { open: true, hint };
    drawTitle();
  }
  function hideTitle(): void {
    if (!title.open) return;
    title = { open: false, hint: false };
    drawTitle();
  }
```

- In `bindControls`, change the destructuring to `{ game, restart, toggleMute, wake, quit }`; set `play = () => restart(seedBox().value);` next to `again = …`; in the keydown handler, after the `h` branch and before `if (G.over || G.auto) return;`, add:

```ts
      if (k === "q") {
        ev.preventDefault();
        quit();
        return;
      }
```

and after the `#mute` click binding add:

```ts
    $("quit").addEventListener("click", () => {
      wake();
      quit();
    });
```

- Add `drawTitle();` next to `drawEnd();` before `return`, and `showTitle, hideTitle,` to the returned object.

In `crete/src/main.ts`:
- Add `import { exitApp, browserAppEnv } from '../../_kit/app.ts';`.
- In `restart`, add `ui.hideTitle();` after `ui.hideEnd();`.
- Add:

```ts
/* Quit: the run ends; an installed app closes where it may, and otherwise
   (always in a browser tab) the title card shows. */
async function quit(): Promise<void> {
  game.quit();
  ui.hideEnd();
  const outcome = await exitApp(browserAppEnv());
  if (outcome !== 'closed') ui.showTitle(outcome === 'title-with-hint');
}
```

- In `start`, pass it: `ui.bindControls({ game, restart, toggleMute, wake: audio.ensure, quit: () => { void quit(); } });`.

In `crete/README.md`'s opening paragraph, add "Q quits" to the list of controls, and add to the module table's `ui/…` row: "`ui/title.tsx`, the title card Quit returns to".

- [ ] **Step 5: The browser spec presses Quit**

Append to `tests/e2e/crete-play.spec.mjs`:

```js
test('Quit (Q) ends the run and shows the title card in a browser tab; Play starts a new run', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.keyboard.press('q');
  await expect(page.locator('#title-veil')).toBeVisible();
  await expect(page.locator('#title-hint')).toHaveCount(0);
  expect(await page.evaluate(() => window.__mazeTest.G.over)).toBe(true);
  await page.locator('#title-play').click();
  await expect(page.locator('#title-veil')).toBeHidden();
  expect(await page.evaluate(() => ({ over: window.__mazeTest.G.over, turns: window.__mazeTest.G.turns }))).toEqual({ over: false, turns: 0 });
  expect(errors).toEqual([]);
});
```

- [ ] **Step 6: Verify and commit**

Run: `cd websites/www.cs/games/crete && node --test test/rules.test.mjs test/ui.test.mjs && cd .. && node _kit/build/build.mjs crete && php crete/tools/install-files.php && crete/test.sh && cd .. && make e2e E2E_ARGS="crete-play.spec.mjs"`
Expected: green.

```bash
git add -A websites/www.cs/games/crete websites/www.cs/tests/e2e/crete-play.spec.mjs
git commit -m "Crete: Quit (Q) closes the installed app, or returns to a title card"
```

### Task 23: Cylon's Game On toggle leaves the app

**Files:**
- Modify: `websites/www.cs/games/cylon/src/main.ts` (imports; `setGameEnabled`; the `createGameOver` call), `cylon/src/gameover.ts` (`GameOverDeps.closed`, `dismiss`), `cylon/mount.html`, `cylon/css/help.css`, `cylon/README.md`, `tests/e2e/cylon-help.spec.mjs`
- Rebuild: `cylon/dist/`, `php tools/site-versions.php`

**Interfaces:**
- Consumes: `exitApp`, `browserAppEnv`, `EXIT_HINT` (Task 21).
- Produces: turning the game off (the toggle; or Close on a quit run's game-over panel) calls `exitApp`. `GameOverDeps` gains `closed: () => void`, called after a quit run's panel is closed. `#cylon-exit-hint` (in `mount.html`, `role="status"`, hidden) shows `EXIT_HINT` for six seconds when an installed app cannot close.

- [ ] **Step 1: The spec, failing**

Append to `tests/e2e/cylon-help.spec.mjs`:

```js
test('Game Off in a browser tab ends the session and leaves the page as it was', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?game=cylon');
  await expect(page.locator('#cylon-game-toggle')).toHaveAttribute('aria-pressed', 'true', { timeout: 10_000 });
  await page.locator('#cylon-game-toggle').click();
  await expect(page.locator('#cylon-game-toggle')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#cylon-game-toggle-label')).toHaveText('Game Off');
  await expect(page.locator('#cylon-gameover')).toBeHidden();
  await expect(page.locator('#cylon-exit-hint')).toBeHidden();
  await expect(page.locator('#cylon-exit-hint')).toHaveCount(1);
  expect(errors).toEqual([]);
});
```

Run: `cd websites/www.cs && make e2e E2E_ARGS="cylon-help.spec.mjs"`
Expected: FAIL on `#cylon-exit-hint` count (no such element yet).

- [ ] **Step 2: The hint element and its style**

Append to `cylon/mount.html`:

```html
<p class="cylon-exit-hint" id="cylon-exit-hint" role="status" hidden></p>
```

Append to `cylon/css/help.css`:

```css
/* After Game Off, an installed app that cannot close itself says how to. */
.cylon-exit-hint {
  position: fixed;
  left: 50%;
  bottom: 1.5rem;
  transform: translateX(-50%);
  z-index: 2200;
  margin: 0;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  background: rgba(5, 6, 13, 0.92);
  color: #fff;
  font: 600 0.95rem/1.3 system-ui, sans-serif;
}
.cylon-exit-hint[hidden] {
  display: none;
}
```

- [ ] **Step 3: Leaving**

In `cylon/src/gameover.ts`, add to `GameOverDeps`:

```ts
  /** A quit run's panel was closed: the game leaves (kit exitApp). */
  closed: () => void;
```

and in `dismiss`, after `d.resetRunStats();` add `d.closed();`.

In `cylon/src/main.ts`:
- Add `import { exitApp, browserAppEnv, EXIT_HINT } from '../../_kit/app.ts';`.
- After `const gameOverRoot = …`, add `const exitHintEl = document.getElementById('cylon-exit-hint');`.
- Add `closed: () => { void leaveApp(); },` to the `createGameOver({…})` deps.
- After `setGameEnabled`, add:

```ts
    let exitHintTimer: Timer | null = null;
    /** The session is off: an installed app closes where it may, or says how to close it. */
    async function leaveApp() {
        const outcome = await exitApp(browserAppEnv());
        if (outcome !== 'title-with-hint' || !exitHintEl) return;
        exitHintEl.textContent = EXIT_HINT;
        exitHintEl.hidden = false;
        clearTimeout(exitHintTimer ?? undefined);
        exitHintTimer = setTimeout(() => { exitHintEl.hidden = true; }, 6000);
    }
```

- In `setGameEnabled`, at the end of the `if (!on) {…}` branch (after `syncWorldEndedLook();`), add `void leaveApp();`.

(A run with KOs that is switched off first shows its game-over panel, as today; leaving happens when that panel's Close is pressed.)

In `cylon/README.md`'s "Host contract", add: "**Leaving.** Game Off (and Close on a quit run's panel) calls the kit's `exitApp`: the installed app (`start_url` `../../index.html?game=cylon&app=1`, scoped to that page) closes where the platform allows; otherwise the page stays, out of full screen, and an installed app shows `#cylon-exit-hint`."

- [ ] **Step 4: Verify and commit**

Run: `cd websites/www.cs/games && node _kit/build/build.mjs cylon && php cylon/tools/install-files.php && cylon/test.sh && cd .. && php tools/site-versions.php && make e2e E2E_ARGS="cylon-help.spec.mjs cylon-play.spec.mjs"`
Expected: green.

```bash
git add -A websites/www.cs/games/cylon websites/www.cs/index.html websites/www.cs/tests/e2e/cylon-help.spec.mjs
git commit -m "Cylon: Game Off leaves the installed app, or says how to close it"
```

### Task 24: Tankity's Menu → Quit

**Files:**
- Modify: `websites/www.cs/games/tankity/src/ui/menu.tsx` (`MenuProps.onQuit`, a Quit button), `tankity/src/menu.ts` (`MenuDeps.quit`, `renderMenu`), `tankity/src/main.ts` (imports, `quitGame`, `toggleFullscreen`, the `createMenu` call), `tankity/test/menu.test.mjs`, `tankity/README.md`, `tests/e2e/tankity-overlays.spec.mjs`
- Rebuild: `tankity/dist/`, `index.html`, `sw.js`

This task is written against Plan C's PR 13 (the settings-only menu of Task 14 with Task 19's phone extras, `test/menu.test.mjs`, and `backToTitle()` from Task 13); PR 19 lands after it. Plan D Task 18 adds Standings to the same files after this task.

**Interfaces:**
- Consumes: `exitApp`, `enterFullscreen`, `browserAppEnv`, `EXIT_HINT` (Task 21); Tankity's `netLeave(quiet)`, `endTutorial`, `tutorialActive`, `say()`, and Plan C Task 13's `backToTitle()` (close the panels, restart the demo, open the title card); Plan C Task 14's `test/menu.test.mjs` (`draw(over)`, `byId`).
- Produces: `MenuProps.onQuit: () => void`; `#menu-quit` (`class="btn-leave"`, text "Quit"); `MenuDeps.quit(): void`. Quit leaves a room quietly if in one, ends a tutorial, returns to the title card over the demo (`backToTitle()`), says "You left the match.", then calls `exitApp`; an installed app that cannot close also says the hint in the radio log.

- [ ] **Step 1: The failing unit test**

Append to `tankity/test/menu.test.mjs`:

```js
test('Quit is always in the menu and reports a press', () => {
  let quits = 0;
  const { section } = draw({ onQuit: () => { quits++; } });
  const quit = byId(section, 'menu-quit');
  assert.equal(quit.localName, 'button');
  assert.equal(quit.textContent, 'Quit');
  assert.equal(quit.className, 'btn-leave');
  click(quit);
  assert.equal(quits, 1);
});
```

Run: `cd websites/www.cs/games/tankity && node --test test/menu.test.mjs`
Expected: FAIL (`menu-quit` missing).

- [ ] **Step 2: The button**

In `src/ui/menu.tsx`'s `MenuProps`, add after `onLeave`:

```ts
  /** Quit: end the match and leave the game. */
  onQuit: () => void;
```

and after the `#menu-leave` button:

```tsx
        <button type="button" id="menu-quit" class="btn-leave" title="End this match and leave the game"
          onClick={blurThen(p.onQuit)}>Quit</button>
```

In `src/menu.ts`, add `quit(): void;` to `MenuDeps`, `quit` to `createMenu`'s destructuring, and `onQuit: quit,` after `onLeave: openLeaveVeil,` in `renderMenu`.

- [ ] **Step 3: Quitting, and full screen through the kit**

In `src/main.ts`:
- Add `import { exitApp, enterFullscreen, browserAppEnv, EXIT_HINT } from '../../_kit/app.ts';`.
- In the `createMenu({…})` call, add `quit: () => { void quitGame(); },`.
- Add, before `toggleFullscreen`:

```ts
/* Menu → Quit: the match ends (a room is left quietly) and the page returns
   to the title card over the demo; an installed app then closes where it may. */
async function quitGame(): Promise<void> {
  if (net.on) netLeave(true);
  endTutorial(tutorialActive());
  backToTitle();
  say('You left the match.', 'info');
  const outcome = await exitApp(browserAppEnv());
  if (outcome === 'title-with-hint') say(`${EXIT_HINT}.`, 'info');
}
```

- Replace `toggleFullscreen` with:

```ts
function toggleFullscreen(): void {
  // The frame carries the canvas plus its HUD and pads, so the whole battle goes fullscreen together.
  const el = $('frame') || document.documentElement;
  if (typeof el.requestFullscreen !== 'function' || typeof document.exitFullscreen !== 'function') {
    say('Fullscreen is not supported in this browser.', 'info');
    return;
  }
  if (document.fullscreenElement) {
    void document.exitFullscreen();
    return;
  }
  void enterFullscreen(browserAppEnv(), el).then(ok => {
    if (!ok) say('Fullscreen is not available right now.', 'info');
  });
}
```

In `tankity/README.md`, where the menu is described, add: "Quit ends the match (leaving a room first) and returns to the title card over the demo; an installed app closes, or says how to close it (`games/_kit/app.ts`)."

- [ ] **Step 4: The browser spec presses Quit**

Append to `tests/e2e/tankity-overlays.spec.mjs`:

```js
test('Menu → Quit ends the match and returns to the title card in a browser tab', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await page.click('#title-play');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await expect(page.locator('#title-card')).toBeHidden();
  await page.evaluate(() => document.getElementById('btn-menu').click());
  await expect(page.locator('#menu-overlay')).toBeVisible();
  await page.evaluate(() => document.getElementById('menu-quit').click());
  await expect(page.locator('#menu-overlay')).toBeHidden();
  await expect(page.locator('#shop-veil')).toBeHidden();
  await expect(page.locator('#title-card')).toBeVisible();
  await expect(page.locator('#log-overlay')).toContainText('You left the match.');
  await expect(page.locator('#log-overlay')).not.toContainText('Swipe the app away');
  expect(errors).toEqual([]);
});
```

(The menu is opened by its button's click handler: in the shop, Esc first closes the shop's own panels.)

- [ ] **Step 5: Verify and commit**

Run: `cd websites/www.cs/games && node _kit/build/build.mjs tankity && php tankity/tools/install-files.php && tankity/test.sh && cd .. && make e2e E2E_ARGS="tankity-overlays.spec.mjs tankity-start.spec.mjs"`
Expected: green.

```bash
git add -A websites/www.cs/games/tankity websites/www.cs/tests/e2e/tankity-overlays.spec.mjs
git commit -m "Tankity: Menu → Quit; full screen through the kit"
```

### Task 26: Probe where Chromium offers to install (the decision point)

**Files:**
- Create, run, then delete (never committed): `websites/www.cs/tests/e2e/install-probe.spec.mjs`

Each game's site page (`/play/<id>/`) links the game's manifest (`../../games/<id>/manifest.webmanifest`) but lies outside its scope (`games/<id>/`), and shows the game in a frame. The CIC's manifest is scoped to `index.html`, so the home page at the bare site address (`/~wgrim/?game=cylon`) is outside it too. Whether Chromium fires `beforeinstallprompt` on such a page decides where the Install button can prompt. This task measures it in real Chrome against the docker site, before any button is built; Tasks 27 and 30 take its answers as two constants.

**Interfaces:**
- Consumes: Task 20's full-screen manifests and icons (the probe needs installable manifests); the site's own manifest swap for `?game=cylon` (`src/main.ts` `openLinkedGame`).
- Produces: two answers, recorded in the PR description with the six `PROBE` lines:
  - `OUT_OF_SCOPE_PROMPTS`: whether Chromium prompts on a page outside the linked manifest's scope (the two `play page` lines). Task 27 writes it into `games/_kit/install.ts`.
  - `PROMPTS_IN_SCOPE`: whether Chromium prompts for The CIC on `index.html?game=cylon`, inside its manifest's scope, once the page has swapped its manifest link to Cylon's. Task 30 writes it into `games/cylon/src/main.ts`.

- [ ] **Step 1: Write the probe**

```js
// websites/www.cs/tests/e2e/install-probe.spec.mjs
// One-off probe, deleted after it runs: where does Chromium offer to install
// each game? Prints one PROBE line per page.
import { test } from '@playwright/test';

// Chrome asks for some engagement before it offers to install; the probe asks
// whether a page qualifies, not whether a visitor has engaged yet.
test.use({ launchOptions: { args: ['--bypass-app-banner-engagement-checks'] } });

const PAGES = [
  ['baseline crete', 'games/crete/'],
  ['baseline tankity', 'games/tankity/'],
  ['play page crete', 'play/crete/'],
  ['play page tankity', 'play/tankity/'],
  ['cylon at index.html (in scope)', 'index.html?game=cylon'],
  ['cylon at the site root (out of scope)', './?game=cylon'],
];

for (const [name, path] of PAGES) {
  test(name, async ({ page }) => {
    await page.addInitScript(() => {
      window.__offers = 0;
      window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__offers++; });
    });
    await page.goto(path);
    // The manifest and icons load, the service worker registers, and for The
    // CIC main.js swaps the manifest link once the games list arrives.
    await page.waitForTimeout(5000);
    const cdp = await page.context().newCDPSession(page);
    const { url: manifest } = await cdp.send('Page.getAppManifest');
    const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
    const offers = await page.evaluate(() => window.__offers);
    console.log(`PROBE ${name} | manifest ${manifest} | beforeinstallprompt ${offers} | errors ${JSON.stringify(installabilityErrors.map(e => e.errorId))}`);
  });
}
```

- [ ] **Step 2: Run it**

Run: `cd websites/www.cs && make up && make e2e E2E_ARGS="install-probe.spec.mjs"`
Expected: six `PROBE` lines. If both baselines say `beforeinstallprompt 0` with `errors []`, this Chrome does not fire the event headless: rerun headed, `make e2e E2E_ARGS="install-probe.spec.mjs --headed"`, and read that run.

- [ ] **Step 3: Decide (the decision point)**

Read the lines in this order:
1. **The baselines** (`games/crete/`, `games/tankity/`) must be installable: `beforeinstallprompt 1` (or more) and `errors []`, manifest `…/games/<id>/manifest.webmanifest`. If either reports an error, stop: Task 20's manifest or icons are wrong. Fix that first and rerun; nothing below means anything until both baselines pass.
2. **`OUT_OF_SCOPE_PROMPTS`** is `true` when both `play page` lines read like the baselines (the event fired, no errors, the game's manifest), and `false` otherwise. If the two disagree, it is `false`.
   - `true`: the Install button prompts right on `/play/<id>/` (branch A).
   - `false`: on Chromium, Install on `/play/<id>/` opens `games/<id>/?install`, and the game's page shows the same bar, which prompts there (branch B).
   - Either way, iOS's Install on a site page opens `games/<id>/?install`: iOS saves the page it is on to the home screen, and that must be the game.
3. **`PROMPTS_IN_SCOPE`** is `true` when the `cylon at index.html` line shows manifest `…/games/cylon/manifest.webmanifest`, the event fired, and no errors; otherwise `false` (Chromium does not pick up a swapped manifest link, so The CIC cannot prompt from the home page at all, and Task 30 shows Share only on Chromium, with the iOS steps on iOS).
4. The `cylon at the site root` line should agree with the `play page` lines (it is the same rule: a page outside the manifest's scope). If it does not, set `OUT_OF_SCOPE_PROMPTS` to `false`: the bar then sends Chromium to a page in scope, which works whichever line is right.

Both branches are written out below: Task 27 has one constant to set, and Task 30 one more; Tasks 28, 29 and 31 are the same in both branches.

- [ ] **Step 4: Remove the probe**

Run: `rm websites/www.cs/tests/e2e/install-probe.spec.mjs && git -C websites/www.cs status --short tests/e2e`
Expected: nothing listed (the probe was never added; `select.mjs --check` would refuse a spec no rule selects). Paste the six `PROBE` lines and the two answers into a scratch note for the PR description (Task 25 Step 4). No commit.

### Task 27: The kit's `install.ts`: when to offer Install, and how Share falls back

**Files:**
- Create: `websites/www.cs/games/_kit/install.ts`
- Create: `websites/www.cs/games/_kit/test/install.test.mjs`
- Modify: `websites/www.cs/games/_kit/README.md`

The logic is the kit's, not the play page's own module: the site's TypeScript (`src/`, compiled one file to one by `tools/ts-build.mjs` with TypeScript 6) is classic scripts with no imports, while branch B, The CIC (Task 30) and iOS's arrival on `games/<id>/?install` all need the same logic on game pages, which only the kit reaches. The kit also brings the ports, the manual clock, Preact and the DOM stub this needs. The site page gets it from the game's own `dist/install.js` (Task 28).

**Interfaces:**
- Consumes: `Timers` (ports.ts), `browserTimers` (ports.browser.ts), `isInstalled`, `browserAppEnv` (Task 21); `manualClock` (tests).
- Produces:
  - `OUT_OF_SCOPE_PROMPTS: boolean` (Task 26), `IOS_STEPS = 'Tap Share, then Add to Home Screen'`, `COPIED_MS = 2500`, `PROMPT_STASH = '__installPrompt'`
  - `type Platform = 'ios' | 'chromium' | 'other'`; `interface DeferredPrompt { prompt(): Promise<unknown> }`
  - `interface InstallEnv { onPrompt(cb: (p: DeferredPrompt) => void): void; onInstalled(cb: () => void): void; installed(): boolean; platform(): Platform; framed(): boolean; share: ((data: { title: string; url: string }) => Promise<void>) | null; copy: ((text: string) => Promise<void>) | null; navigate(url: string, replace: boolean): void; timers: Timers }`
  - `interface InstallSetup { title: string; shareUrl: string; installPage: string | null; promptsHere: boolean; asked: boolean }`
  - `type ShareState = 'idle' | 'copied' | 'field'`; `interface InstallView { off: boolean; install: boolean; highlight: boolean; steps: boolean; share: ShareState }`
  - `interface Install { view(): InstallView; pressInstall(): Promise<void>; closeSteps(): void; pressShare(): Promise<void>; closeShare(): void }`
  - `createInstall(env, setup, onChange: (v: InstallView) => void): Install`, `asksInstall(search: string): boolean`, `withInstall(page: string): string`, `browserInstallEnv(): InstallEnv`
  - The rules: framed → nothing at all; installed (or after `appinstalled`) → no Install; iOS → Install always, which opens the steps here when `installPage` is null and otherwise goes to `withInstall(installPage)`; Chromium on a page that prompts → Install only while a held-back prompt is in hand, a click spends it; Chromium on a page that does not (`promptsHere: false`) with an `installPage` → Install at once, which goes there; anything else → no Install. `asked` (`?install`) highlights a shown button; on iOS it opens the steps here, or goes to `installPage` with `replace`. Nothing ever prompts without a click. Share: Web Share; on `AbortError` nothing; on another error, or without Web Share, the clipboard and `'copied'` for `COPIED_MS`; if that fails or is missing, `'field'`.

- [ ] **Step 1: Write the failing tests**

```js
// websites/www.cs/games/_kit/test/install.test.mjs
// Install and Share on every platform: Chromium's held-back prompt, iOS's
// steps, a browser that cannot install, an installed app, ?install, and the
// three ways a link is shared.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInstall, asksInstall, withInstall, COPIED_MS, IOS_STEPS } from '../install.ts';
import { manualClock } from './clock.ts';

// A site page (/play/crete/) and the game's own page (games/crete/).
const PLAY = {
  title: 'The Island of Crete', shareUrl: 'https://site.test/play/crete/',
  installPage: 'https://site.test/games/crete/', promptsHere: true, asked: false,
};
const GAME = { ...PLAY, installPage: null };

function setup({ platform = 'chromium', installed = false, framed = false, share = null, copy = null, early = null } = {}, how = PLAY) {
  const clock = manualClock();
  const went = [];
  const views = [];
  let offer = () => {};
  let installedNow = () => {};
  const env = {
    onPrompt: cb => { offer = cb; if (early) cb(early); },
    onInstalled: cb => { installedNow = cb; },
    installed: () => installed,
    platform: () => platform,
    framed: () => framed,
    share,
    copy,
    navigate: (url, replace) => went.push([url, replace]),
    timers: clock.timers,
  };
  const install = createInstall(env, how, v => views.push(v));
  return { install, went, views, clock, offer: p => offer(p), installedNow: () => installedNow() };
}
const fakePrompt = () => {
  const p = { shown: 0, prompt: async () => { p.shown++; } };
  return p;
};

test('Chromium: Install stays hidden until the browser offers to install, then shows', () => {
  const t = setup();
  assert.equal(t.install.view().install, false);
  t.offer(fakePrompt());
  assert.equal(t.install.view().install, true);
  assert.equal(t.views.at(-1).install, true, 'the bar is redrawn');
});

test('a prompt held back before the bar mounted shows Install', () => {
  assert.equal(setup({ early: fakePrompt() }).install.view().install, true);
});

test('a click prompts once; the spent prompt takes the button with it', async () => {
  const t = setup();
  const p = fakePrompt();
  t.offer(p);
  await t.install.pressInstall();
  assert.equal(p.shown, 1);
  assert.equal(t.install.view().install, false);
  await t.install.pressInstall();
  assert.equal(p.shown, 1);
});

test('a prompt that throws leaves no button and no error', async () => {
  const t = setup();
  t.offer({ prompt: async () => { throw new Error('already shown'); } });
  await t.install.pressInstall();
  assert.equal(t.install.view().install, false);
});

test('appinstalled hides Install for good', () => {
  const t = setup();
  t.offer(fakePrompt());
  t.installedNow();
  assert.equal(t.install.view().install, false);
  t.offer(fakePrompt());
  assert.equal(t.install.view().install, false);
});

test('the installed app never shows Install or the steps, on any platform', () => {
  for (const platform of ['chromium', 'ios', 'other']) {
    const t = setup({ platform, installed: true }, { ...GAME, asked: true });
    t.offer(fakePrompt());
    assert.deepEqual([t.install.view().install, t.install.view().steps, t.went], [false, false, []], platform);
  }
});

test('a browser that cannot install shows no Install button', () => {
  const t = setup({ platform: 'other' });
  assert.equal(t.install.view().install, false);
  const away = setup({ platform: 'other' }, { ...PLAY, promptsHere: false, asked: true });
  assert.equal(away.install.view().install, false);
  assert.deepEqual(away.went, []);
});

test('iOS on the game page: Install opens the Add to Home Screen steps, which close', async () => {
  const t = setup({ platform: 'ios' }, GAME);
  assert.deepEqual([t.install.view().install, t.install.view().steps], [true, false]);
  await t.install.pressInstall();
  assert.equal(t.install.view().steps, true);
  t.install.closeSteps();
  assert.equal(t.install.view().steps, false);
  assert.equal(IOS_STEPS, 'Tap Share, then Add to Home Screen');
});

test('iOS on a site page: Install opens the game page asking to install, so iOS saves the game', async () => {
  const t = setup({ platform: 'ios' });
  await t.install.pressInstall();
  assert.deepEqual(t.went, [['https://site.test/games/crete/?install', false]]);
  assert.equal(t.install.view().steps, false);
});

test('?install highlights Install once it shows, and never prompts by itself', () => {
  const t = setup({}, { ...PLAY, asked: true });
  assert.equal(t.install.view().highlight, false, 'nothing to highlight yet');
  const p = fakePrompt();
  t.offer(p);
  assert.deepEqual([t.install.view().install, t.install.view().highlight, p.shown, t.went], [true, true, 0, []]);
});

test('?install on iOS opens the steps on the game page, and goes to the game page from a site page', () => {
  assert.equal(setup({ platform: 'ios' }, { ...GAME, asked: true }).install.view().steps, true);
  const fromSite = setup({ platform: 'ios' }, { ...PLAY, asked: true });
  assert.deepEqual(fromSite.went, [['https://site.test/games/crete/?install', true]]);
});

test('Chromium on a page it does not prompt on: Install shows at once and opens the game page', async () => {
  const t = setup({}, { ...PLAY, promptsHere: false, asked: true });
  assert.deepEqual([t.install.view().install, t.install.view().highlight], [true, true]);
  await t.install.pressInstall();
  assert.deepEqual(t.went, [['https://site.test/games/crete/?install', false]]);
});

test('inside the site page\'s frame the bar is off: no Install, no steps, no share', async () => {
  const shared = [];
  const t = setup({ framed: true, platform: 'ios', share: async d => { shared.push(d); } }, { ...GAME, asked: true });
  t.offer(fakePrompt());
  await t.install.pressShare();
  const v = t.install.view();
  assert.deepEqual([v.off, v.install, v.steps, shared], [true, false, false, []]);
});

test('Share hands the title and the site page to the share sheet', async () => {
  const shared = [];
  const t = setup({ share: async d => { shared.push(d); }, copy: async () => { throw new Error('unused'); } });
  await t.install.pressShare();
  assert.deepEqual(shared, [{ title: 'The Island of Crete', url: 'https://site.test/play/crete/' }]);
  assert.equal(t.install.view().share, 'idle');
});

test('a cancelled share sheet is silent: no copy, no message, no redraw', async () => {
  const copied = [];
  const t = setup({
    share: async () => { throw Object.assign(new Error('cancelled'), { name: 'AbortError' }); },
    copy: async u => { copied.push(u); },
  });
  await t.install.pressShare();
  assert.deepEqual([copied, t.install.view().share, t.views.length], [[], 'idle', 0]);
});

test('without Web Share the address is copied and "Link copied" shows, then clears', async () => {
  const copied = [];
  const t = setup({ copy: async u => { copied.push(u); } });
  await t.install.pressShare();
  assert.deepEqual(copied, ['https://site.test/play/crete/']);
  assert.equal(t.install.view().share, 'copied');
  t.clock.advance(COPIED_MS - 1);
  assert.equal(t.install.view().share, 'copied');
  t.clock.advance(1);
  assert.equal(t.install.view().share, 'idle');
});

test('a share sheet that refuses falls back to copying', async () => {
  const copied = [];
  const t = setup({
    share: async () => { throw Object.assign(new Error('no gesture'), { name: 'NotAllowedError' }); },
    copy: async u => { copied.push(u); },
  });
  await t.install.pressShare();
  assert.deepEqual([copied.length, t.install.view().share], [1, 'copied']);
});

test('a blocked or missing clipboard shows the address in a field, until it is closed', async () => {
  const t = setup({ copy: async () => { throw new Error('denied'); } });
  await t.install.pressShare();
  assert.equal(t.install.view().share, 'field');
  t.install.closeShare();
  assert.equal(t.install.view().share, 'idle');
  const none = setup();
  await none.install.pressShare();
  assert.equal(none.install.view().share, 'field');
});

test('?install is read in any form, and added to a page keeping its query and hash', () => {
  for (const s of ['?install', '?install=1', '?game=cylon&install']) assert.equal(asksInstall(s), true, s);
  for (const s of ['', '?installs', '?game=cylon']) assert.equal(asksInstall(s), false, s);
  assert.equal(withInstall('https://site.test/games/crete/'), 'https://site.test/games/crete/?install');
  assert.equal(withInstall('https://site.test/index.html?game=cylon#top'), 'https://site.test/index.html?game=cylon&install#top');
});
```

Run: `cd websites/www.cs/games && node --test _kit/test/install.test.mjs`
Expected: FAIL, `Cannot find module '.../_kit/install.ts'`.

- [ ] **Step 2: Implement**

Set `OUT_OF_SCOPE_PROMPTS` to Task 26's answer: the code below is branch A (`true`); for branch B write `false`. Nothing else in this task differs between the branches.

```ts
// websites/www.cs/games/_kit/install.ts
// Install and Share for one game: whether to offer the browser's install
// prompt, iOS's Add to Home Screen steps, or nothing, and how a link is
// shared. The browser is a port (InstallEnv), so every platform is
// unit-tested; browserInstallEnv() is the real one.
import type { Timers } from './ports.ts';
import { browserTimers } from './ports.browser.ts';
import { isInstalled, browserAppEnv } from './app.ts';

/**
 * Whether Chromium offers to install a game from a page that links its
 * manifest but lies outside the manifest's scope, as the site's /play/<id>/
 * pages do (measured in Chrome). Where it does not, Install there opens the
 * game's own page with ?install.
 */
export const OUT_OF_SCOPE_PROMPTS: boolean = true;

export const IOS_STEPS = 'Tap Share, then Add to Home Screen';
/** How long "Link copied" stays up. */
export const COPIED_MS = 2500;
/** Where the page's first script parks a prompt that came before the bar (install-core.php's INSTALL_PROMPT_STASH). */
export const PROMPT_STASH = '__installPrompt';

export type Platform = 'ios' | 'chromium' | 'other';

/** A held-back BeforeInstallPromptEvent: prompt() shows the browser's install dialog, once. */
export interface DeferredPrompt {
  prompt(): Promise<unknown>;
}

export interface InstallEnv {
  /** Each install prompt the browser offers, already held back with preventDefault(). */
  onPrompt(cb: (p: DeferredPrompt) => void): void;
  /** appinstalled. */
  onInstalled(cb: () => void): void;
  /** This page runs as an installed app. */
  installed(): boolean;
  platform(): Platform;
  /** This page is inside another page's frame (the game inside /play/<id>/). */
  framed(): boolean;
  /** navigator.share, or null where there is none. */
  share: ((data: { title: string; url: string }) => Promise<void>) | null;
  /** navigator.clipboard.writeText, or null where there is none. */
  copy: ((text: string) => Promise<void>) | null;
  /** Goes to another page; `replace` leaves this one out of the history. */
  navigate(url: string, replace: boolean): void;
  timers: Timers;
}

export interface InstallSetup {
  /** The game's name, for the share sheet. */
  title: string;
  /** The address Share hands out: the game's /play/<id>/ page. */
  shareUrl: string;
  /** The page installing happens on when it cannot happen here (absolute, without ?install), or null when it can. */
  installPage: string | null;
  /** Whether Chromium offers its install prompt on this page. */
  promptsHere: boolean;
  /** The address asked for installing (?install). */
  asked: boolean;
}

/** 'copied': "Link copied" is up; 'field': the address is shown to copy by hand. */
export type ShareState = 'idle' | 'copied' | 'field';

export interface InstallView {
  /** Nothing to draw: the page is framed. */
  off: boolean;
  install: boolean;
  /** ?install: the button is drawn to the eye. */
  highlight: boolean;
  /** iOS's Add to Home Screen steps are open. */
  steps: boolean;
  share: ShareState;
}

export interface Install {
  view(): InstallView;
  pressInstall(): Promise<void>;
  closeSteps(): void;
  pressShare(): Promise<void>;
  closeShare(): void;
}

export function asksInstall(search: string): boolean {
  return new URLSearchParams(search).has('install');
}

/** `page` with ?install added to its query. */
export function withInstall(page: string): string {
  const url = new URL(page);
  url.search = url.search ? `${url.search}&install` : '?install';
  return url.href;
}

const cancelled = (e: unknown): boolean => (e as { name?: unknown } | null)?.name === 'AbortError';

export function createInstall(env: InstallEnv, setup: InstallSetup, onChange: (v: InstallView) => void): Install {
  const off = env.framed();
  const platform = env.platform();
  const ios = platform === 'ios';
  // Chromium on a page it does not prompt on: Install opens the page that does.
  const sendsAway = platform === 'chromium' && !setup.promptsHere && setup.installPage !== null;
  let installed = env.installed();
  let prompt: DeferredPrompt | null = null;
  let steps = false;
  let share: ShareState = 'idle';
  let copiedTimer: number | null = null;

  const offered = (): boolean => !off && !installed && (ios || sendsAway || prompt !== null);
  const view = (): InstallView => ({ off, install: offered(), highlight: setup.asked && offered(), steps, share });
  const changed = (): void => onChange(view());

  function setShare(next: ShareState): void {
    if (copiedTimer !== null) {
      env.timers.clearTimeout(copiedTimer);
      copiedTimer = null;
    }
    share = next;
    if (next === 'copied') {
      copiedTimer = env.timers.setTimeout(() => {
        copiedTimer = null;
        share = 'idle';
        changed();
      }, COPIED_MS);
    }
    changed();
  }

  if (!off && !installed) {
    env.onPrompt(p => {
      prompt = p;
      changed();
    });
    env.onInstalled(() => {
      installed = true;
      prompt = null;
      steps = false;
      changed();
    });
    if (setup.asked && ios) {
      if (setup.installPage === null) steps = true;
      else env.navigate(withInstall(setup.installPage), true);
    }
  }

  return {
    view,
    async pressInstall() {
      if (!offered()) return;
      if (ios) {
        if (setup.installPage === null) {
          steps = true;
          changed();
        } else {
          env.navigate(withInstall(setup.installPage), false);
        }
        return;
      }
      if (prompt) {
        // A prompt shows once; the browser offers a new one if the player declines.
        const p = prompt;
        prompt = null;
        changed();
        try {
          await p.prompt();
        } catch {
          // Already shown, or refused: the button is gone either way.
        }
        return;
      }
      if (setup.installPage !== null) env.navigate(withInstall(setup.installPage), false);
    },
    closeSteps() {
      if (!steps) return;
      steps = false;
      changed();
    },
    async pressShare() {
      if (off) return;
      if (env.share) {
        try {
          await env.share({ title: setup.title, url: setup.shareUrl });
          return;
        } catch (e) {
          if (cancelled(e)) return;
          // Refused (no gesture left, a blocked sheet): copy instead.
        }
      }
      if (env.copy) {
        try {
          await env.copy(setup.shareUrl);
          setShare('copied');
          return;
        } catch {
          // A blocked clipboard: show the address to copy by hand.
        }
      }
      setShare('field');
    },
    closeShare() {
      if (share !== 'idle') setShare('idle');
    },
  };
}

type Parked = { [PROMPT_STASH]?: DeferredPrompt | null };
type WithBrands = Navigator & { userAgentData?: { brands?: { brand: string }[] } };

export function browserInstallEnv(): InstallEnv {
  const parked = window as unknown as Parked;
  return {
    onPrompt: cb => {
      const early = parked[PROMPT_STASH];
      parked[PROMPT_STASH] = null;
      if (early) cb(early);
      window.addEventListener('beforeinstallprompt', ev => {
        ev.preventDefault();
        parked[PROMPT_STASH] = null;
        cb(ev as unknown as DeferredPrompt);
      });
    },
    onInstalled: cb => window.addEventListener('appinstalled', () => cb()),
    installed: () => isInstalled(browserAppEnv()),
    // iPadOS reports itself as a Mac; its touch points give it away.
    platform: () => (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      ? 'ios'
      : ((navigator as WithBrands).userAgentData?.brands ?? []).some(b => b.brand === 'Chromium') ? 'chromium' : 'other'),
    framed: () => window.self !== window.top,
    share: typeof navigator.share === 'function' ? data => navigator.share(data) : null,
    copy: typeof navigator.clipboard?.writeText === 'function' ? text => navigator.clipboard.writeText(text) : null,
    navigate: (url, replace) => (replace ? location.replace(url) : location.assign(url)),
    timers: browserTimers,
  };
}
```

- [ ] **Step 3: Run, type-check, document, commit**

Run: `cd websites/www.cs/games && node --test _kit/test/install.test.mjs && node_modules/.bin/tsc -p _kit/tsconfig.json`
Expected: PASS; tsc silent.

Add to `_kit/README.md`, after "Installed apps (`app.ts`)" (in branch B, replace the second paragraph's first sentence with "Chromium does not offer to install from a page outside the manifest's scope (`OUT_OF_SCOPE_PROMPTS` is false), so on a site page Install opens the game's own page with `?install`, which prompts."):

```markdown
## Install and Share (`install.ts`, `ui/install-bar.tsx`)

`createInstall(env, setup, onChange)` decides what the Install and Share
buttons show; the browser is a port (`InstallEnv`: the held-back install
prompt, `appinstalled`, whether the page runs installed, the platform, whether
it is framed, `navigator.share`, the clipboard, navigation, timers), so tests
pass a fake and `browserInstallEnv()` is the real one. Chromium gets Install
only while a held-back `beforeinstallprompt` is in hand, and a click spends it;
iOS, which has no install API, gets Install always, opening the "Tap Share,
then Add to Home Screen" steps; other browsers get none; an installed app never
does. `?install` highlights the button, or on iOS opens the steps, and never
prompts by itself.

Chromium offers to install from a page outside the manifest's scope
(`OUT_OF_SCOPE_PROMPTS`, measured in Chrome), so the site's `/play/<id>/`
pages prompt themselves. iOS saves the page it is on, so on a site page its
Install opens the game's own page with `?install`, where the steps open. Share
uses Web Share, then the clipboard ("Link copied"), then a selectable field; a
cancelled share sheet is no error.
```

```bash
git add websites/www.cs/games/_kit/install.ts websites/www.cs/games/_kit/test/install.test.mjs websites/www.cs/games/_kit/README.md
git commit -m "Games kit: install.ts decides Install and Share on every platform"
```

### Task 28: The Install and Share bar, built into each page game as `dist/install.js`

**Files:**
- Create: `websites/www.cs/games/_kit/ui/install-bar.tsx`, `websites/www.cs/games/_kit/install-page.ts`
- Create: `websites/www.cs/games/_kit/test/install-bar.test.mjs`
- Modify: `websites/www.cs/games/crete/build.json`, `websites/www.cs/games/tankity/build.json`, `_kit/README.md`
- Rebuild: `crete/dist/`, `tankity/dist/` (each gains `install.js` and its map), each `sw.js`

**Interfaces:**
- Consumes: `createInstall`, `browserInstallEnv`, `asksInstall`, `OUT_OF_SCOPE_PROMPTS`, `IOS_STEPS`, the `Install*` types (Task 27); `Dialog`, `Button` (Task 6); `importTsx`, `dom-stub.mjs` (Task 5).
- Produces:
  - `InstallBarProps = { view: InstallView; shareUrl: string; onInstall(): void; onShare(): void; onCloseSteps(): void; onCloseShare(): void }`, `InstallBar(props)`, `mountInstallBar(root: Element, setup: InstallSetup, env: InstallEnv): Install`.
  - Ids: `#install-btn` (class `kit-install-btn`, plus `kit-install-asked` when highlighted), `#share-btn`, `#share-status` (`role="status"`, "Link copied"), `#share-url` (read-only field), `#install-steps` (the dialog's veil), `#install-steps-title`, `#install-steps-text`, `#install-steps-done`. `mountInstallBar` adds `<style id="kit-install-css">` once, first in `<head>`, so a page's own CSS wins; colours come from `--kit-install-accent`.
  - `install-page.ts`, each page game's `dist/install.js` (iife): with `#play-install` on the page (a site page) it mounts there with `data-title`, `data-game-page`, `shareUrl` = the page's own folder, `installPage` = `data-game-page`, `promptsHere: OUT_OF_SCOPE_PROMPTS`; otherwise, when the address has `?install` (the game's own page), it mounts in a `div.kit-install-corner` with `installPage: null`, `promptsHere: true` and `shareUrl` `../../play/<id>/`.

- [ ] **Step 1: Write the failing tests**

```js
// websites/www.cs/games/_kit/test/install-bar.test.mjs
// The Install and Share bar in the DOM stub: what each view draws, the iOS
// steps dialog's focus and Escape, and the address field.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { importTsx } from './tsx.ts';
import { document, makeEl, click, fire, fireDocument } from './dom-stub.mjs';

globalThis.document = document;
const { bar } = await importTsx(import.meta.dirname, { bar: '../ui/install-bar.tsx' });
const { InstallBar } = bar;

const walk = (el, out = []) => { for (const c of el.children) if (c.nodeType === 1) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const VIEW = { off: false, install: false, highlight: false, steps: false, share: 'idle' };
const calls = [];
const roots = [];
afterEach(() => {
  for (const root of roots.splice(0)) render(null, root);
  calls.length = 0;
  document.activeElement = null;
  globalThis.__focused = null;
});
function draw(view, root = makeEl('root')) {
  if (!roots.includes(root)) roots.push(root);
  render(h(InstallBar, {
    view: { ...VIEW, ...view }, shareUrl: 'https://site.test/play/crete/',
    onInstall: () => calls.push('install'), onShare: () => calls.push('share'),
    onCloseSteps: () => calls.push('close-steps'), onCloseShare: () => calls.push('close-share'),
  }), root);
  return root;
}

test('Install is drawn only when the view offers it; Share always', () => {
  const root = draw({});
  assert.equal(byId(root, 'install-btn'), undefined);
  assert.equal(byId(root, 'share-btn').textContent, 'Share');
  draw({ install: true }, root);
  const install = byId(root, 'install-btn');
  assert.equal(install.textContent, 'Install');
  assert.equal(install.className, 'kit-install-btn');
  click(install);
  click(byId(root, 'share-btn'));
  assert.deepEqual(calls, ['install', 'share']);
});

test('?install draws Install highlighted', () => {
  assert.equal(byId(draw({ install: true, highlight: true }), 'install-btn').className, 'kit-install-btn kit-install-asked');
});

test('a framed page draws nothing', () => {
  assert.equal(draw({ off: true, install: true }).children.length, 0);
});

test('"Link copied" is said in a status line', () => {
  const root = draw({});
  const status = byId(root, 'share-status');
  assert.equal(status.getAttribute('role'), 'status');
  assert.equal(status.textContent, '');
  draw({ share: 'copied' }, root);
  assert.equal(byId(root, 'share-status').textContent, 'Link copied');
});

test('a blocked clipboard shows the address in a focused field; Escape closes it', () => {
  const root = draw({ share: 'field' });
  const field = byId(root, 'share-url');
  assert.equal(field.value, 'https://site.test/play/crete/');
  assert.equal(globalThis.__focused, field);
  fire(field, 'keydown', { type: 'keydown', key: 'Escape' });
  assert.deepEqual(calls, ['close-share']);
});

test('iOS steps: a dialog with the Share glyph; Done is focused; Escape and Done close it', () => {
  const root = draw({ install: true });
  assert.equal(byId(root, 'install-steps').hidden, true);
  draw({ install: true, steps: true }, root);
  const veil = byId(root, 'install-steps');
  assert.equal(veil.hidden, false);
  assert.equal(veil.children[0].getAttribute('role'), 'dialog');
  assert.equal(byId(root, 'install-steps-title').textContent, 'Add to Home Screen');
  assert.equal(byId(root, 'install-steps-text').textContent, 'Tap Share, then Add to Home Screen.');
  assert.equal(walk(byId(root, 'install-steps-text')).some(n => n.localName === 'svg'), true);
  assert.equal(globalThis.__focused?.id, 'install-steps-done');
  fireDocument('keydown', { key: 'Escape' });
  click(byId(root, 'install-steps-done'));
  assert.deepEqual(calls, ['close-steps', 'close-steps']);
});
```

Run: `cd websites/www.cs/games && node --test _kit/test/install-bar.test.mjs`
Expected: FAIL: `../ui/install-bar.tsx` cannot be resolved.

- [ ] **Step 2: The bar**

```tsx
// websites/www.cs/games/_kit/ui/install-bar.tsx
// The Install and Share buttons, iOS's Add to Home Screen steps and the
// shared address, drawn from an InstallView (install.ts). mountInstallBar()
// wires one to the browser and brings its own small stylesheet.
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { Button } from './button.tsx';
import { Dialog } from './dialog.tsx';
import { createInstall, IOS_STEPS } from '../install.ts';
import type { Install, InstallEnv, InstallSetup, InstallView } from '../install.ts';

export interface InstallBarProps {
  view: InstallView;
  shareUrl: string;
  onInstall: () => void;
  onShare: () => void;
  onCloseSteps: () => void;
  onCloseShare: () => void;
}

/** iOS's Share glyph: a box with an arrow out of its top. */
function ShareGlyph() {
  return (
    <svg class="kit-install-glyph" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M8 10H6v11h12V10h-2" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export function InstallBar(p: InstallBarProps) {
  const v = p.view;
  const field = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (v.share !== 'field') return;
    field.current?.focus();
    field.current?.select?.();
  }, [v.share]);
  if (v.off) return null;
  return (
    <span class="kit-install">
      {v.install && (
        <Button id="install-btn" class={v.highlight ? 'kit-install-btn kit-install-asked' : 'kit-install-btn'}
          title="Install this game as an app" onClick={p.onInstall}>Install</Button>
      )}
      <Button id="share-btn" class="kit-install-btn" title="Share a link to this game" onClick={p.onShare}>Share</Button>
      <span id="share-status" class="kit-install-status" role="status">{v.share === 'copied' ? 'Link copied' : null}</span>
      {v.share === 'field' && (
        <input id="share-url" class="kit-install-url" type="text" readOnly value={p.shareUrl} aria-label="Link to this game"
          ref={field} onKeyDown={ev => {
            if (ev.key !== 'Escape') return;
            ev.preventDefault();
            p.onCloseShare();
          }} />
      )}
      <Dialog open={v.steps} id="install-steps" veilClass="kit-install-veil" panelClass="kit-install-panel"
        titleId="install-steps-title" title="Add to Home Screen" focusId="install-steps-done" onDismiss={p.onCloseSteps}>
        <p id="install-steps-text"><ShareGlyph />{IOS_STEPS}.</p>
        <Button id="install-steps-done" class="kit-install-btn" onClick={p.onCloseSteps}>Done</Button>
      </Dialog>
    </span>
  );
}

// The bar's own look, first in <head> so the page's CSS can restyle it.
const CSS = `
.kit-install { display: inline-flex; align-items: center; gap: 0.5rem; }
.kit-install-btn { font: 600 0.9rem/1.1 system-ui, sans-serif; padding: 0.3rem 0.75rem; border: 1px solid var(--kit-install-accent, #f0b429); border-radius: 6px; background: transparent; color: var(--kit-install-accent, #f0b429); cursor: pointer; }
.kit-install-btn:hover, .kit-install-btn:focus-visible { background: color-mix(in srgb, var(--kit-install-accent, #f0b429) 18%, transparent); }
.kit-install-btn:focus-visible { outline: 2px solid var(--kit-install-accent, #f0b429); outline-offset: 2px; }
.kit-install-asked { background: var(--kit-install-accent, #f0b429); color: #000; animation: kit-install-pulse 1.2s ease-in-out 3; }
@keyframes kit-install-pulse { 50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--kit-install-accent, #f0b429) 40%, transparent); } }
@media (prefers-reduced-motion: reduce) { .kit-install-asked { animation: none; } }
.kit-install-status { color: var(--kit-install-accent, #f0b429); white-space: nowrap; }
.kit-install-status:empty { display: none; }
.kit-install-url { width: min(22rem, 55vw); padding: 0.25rem 0.4rem; font: 500 0.85rem/1.2 ui-monospace, monospace; }
.kit-install-veil { position: fixed; inset: 0; z-index: 3000; display: grid; place-items: center; padding: 1rem; background: rgba(0, 0, 0, 0.6); }
.kit-install-veil[hidden] { display: none; }
.kit-install-panel { max-width: 22rem; padding: 1.25rem; border-radius: 12px; background: #11141b; color: #eef1f6; font: 500 1rem/1.45 system-ui, sans-serif; }
.kit-install-panel h2 { margin: 0 0 0.5rem; font-size: 1.15rem; }
.kit-install-glyph { vertical-align: -0.3em; margin-right: 0.4rem; }
.kit-install-corner { position: fixed; top: 0.5rem; right: 0.5rem; z-index: 2900; }
`;

function addStyles(): void {
  if (document.getElementById('kit-install-css')) return;
  const style = document.createElement('style');
  style.id = 'kit-install-css';
  style.textContent = CSS;
  document.head.prepend(style);
}

/** Draws the bar into `root` and keeps it current as the browser offers, installs and shares. */
export function mountInstallBar(root: Element, setup: InstallSetup, env: InstallEnv): Install {
  addStyles();
  // A prompt held back before the bar mounted arrives during createInstall; the first draw below shows it.
  let draw = (_v: InstallView): void => {};
  const install = createInstall(env, setup, v => draw(v));
  draw = v => render(
    <InstallBar view={v} shareUrl={setup.shareUrl}
      onInstall={() => { void install.pressInstall(); }} onShare={() => { void install.pressShare(); }}
      onCloseSteps={install.closeSteps} onCloseShare={install.closeShare} />,
    root);
  draw(install.view());
  return install;
}
```

Run: `cd websites/www.cs/games && node --test _kit/test/install-bar.test.mjs`
Expected: PASS.

- [ ] **Step 3: The entry each page game ships**

```ts
// websites/www.cs/games/_kit/install-page.ts
// Built into each page game as dist/install.js. On the site's /play/<id>/
// page it fills the top bar's #play-install; on the game's own page it shows
// a corner bar, and only when the address asks (?install).
import { mountInstallBar } from './ui/install-bar.tsx';
import { asksInstall, browserInstallEnv, OUT_OF_SCOPE_PROMPTS } from './install.ts';

const asked = asksInstall(location.search);
const sitePage = document.getElementById('play-install');
if (sitePage) {
  mountInstallBar(sitePage, {
    title: sitePage.dataset.title ?? document.title,
    shareUrl: new URL('./', location.href).href,
    installPage: new URL(sitePage.dataset.gamePage ?? './', location.href).href,
    promptsHere: OUT_OF_SCOPE_PROMPTS,
    asked,
  }, browserInstallEnv());
} else if (asked) {
  // games/<id>/: its site page is ../../play/<id>/.
  const folder = new URL('./', location.href);
  const id = folder.pathname.split('/').filter(Boolean).pop() ?? '';
  const corner = document.createElement('div');
  corner.className = 'kit-install-corner';
  document.body.append(corner);
  mountInstallBar(corner, {
    title: document.title,
    shareUrl: new URL(`../../play/${id}/`, folder).href,
    installPage: null,
    promptsHere: true,
    asked,
  }, browserInstallEnv());
}
```

(The game's page inside a site page's frame also sees `?install`, because `play.js` passes the address's query to the frame; there `framed()` turns the bar off and the corner stays empty.)

In `crete/build.json` and `tankity/build.json`, append to `entries`:

```json
    { "in": "../_kit/install-page.ts", "out": "install", "format": "iife" }
```

(Crete's becomes a two-line `entries` list: `src/main.ts` then this. The kit's `tsconfig.json` already type-checks `*.ts` and `ui/*.tsx`.)

- [ ] **Step 4: Build, check, document, commit**

Run:

```bash
cd websites/www.cs/games
node --test _kit/test/install.test.mjs _kit/test/install-bar.test.mjs && node_modules/.bin/tsc -p _kit/tsconfig.json
node _kit/build/build.mjs crete && node _kit/build/build.mjs tankity
php crete/tools/install-files.php && php tankity/tools/install-files.php
crete/test.sh && tankity/test.sh
```

Expected: green; each build writes `dist/install.js` and `dist/install.js.map`; `install-files.php` rewrites each `sw.js` (`dist/install.js` is now precached). Each `THIRD_PARTY_LICENSES.txt` is unchanged: Preact was already bundled.

In `_kit/README.md`'s Install and Share section, add:

```markdown
`ui/install-bar.tsx` draws it: `#install-btn` (`kit-install-asked` when
highlighted), `#share-btn`, `#share-status` ("Link copied"), `#share-url` (the
address to copy by hand) and the steps dialog `#install-steps` on the kit's
`Dialog` (focus moves in and back; Escape closes it). `mountInstallBar(root,
setup, env)` wires it to the browser and adds its stylesheet once, first in
`<head>`; a page restyles it through `--kit-install-accent` or its own rules.
Each page game builds `install-page.ts` as `dist/install.js` (an entry in its
`build.json`): the site's `/play/<id>/` page loads it to fill `#play-install`,
and the game's own page loads it to show a corner bar when the address has
`?install`.
```

```bash
git add websites/www.cs/games/_kit websites/www.cs/games/crete websites/www.cs/games/tankity
git commit -m "Games kit: the Install and Share bar, built into each page game as dist/install.js"
```

### Task 29: The pages load the bar: site pages, game pages, and the prompt held back early

**Files:**
- Modify: `websites/www.cs/games/_kit/php/install-core.php` (`INSTALL_PROMPT_STASH`, `install_block`), `_kit/php/tests/InstallCoreTest.php`, `_kit/test/install.test.mjs`
- Modify: `websites/www.cs/games/crete/index.html`, `crete/tools/install-files.php`, `tankity/index.html`, `tankity/tools/install-files.php`
- Modify: `websites/www.cs/tools/site-game-pages.php` (`site_pages_wrapper`, `site_pages_forward_page`, `site_pages_sync`), `tests/php/checks/site-game-pages.php`, `play/play.css`
- Regenerate: Crete's and Tankity's `index.html` and `sw.js`; `play/*/index.html`

The buttons are drawn by the kit's component into a mount point the generated page carries, not written as static markup: Install and Share need JavaScript (the install prompt, Web Share, the clipboard), so static buttons would be dead without it, and one component keeps one markup for the site pages, the game pages and The CIC. `site-game-pages.php` writes the mount, its script and the stash, and its check covers all three.

**Interfaces:**
- Consumes: `dist/install.js` (Task 28); `PROMPT_STASH` (Task 27).
- Produces: `INSTALL_PROMPT_STASH` (PHP constant): `<script>window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); window.__installPrompt = e; });</script>`, in every page game's install block and in every site page's head, before any other script. A site page's nav ends with `<span class="play-install" id="play-install" data-title="<title>" data-game-page="../../games/<id>/"></span>` after `.play-now`, and its head loads `../../games/<id>/dist/install.js?v=<hash>` (`defer`). `site_pages_sync` reports a page game without `dist/install.js` and fails. The forward page for a `start` game keeps the address's query and hash (`/play/cylon/?install` opens `../../?game=cylon&install`), with the meta refresh as the no-script fallback.

- [ ] **Step 1: Write the failing tests**

In `InstallCoreTest.php`, add:

```php
    public function testBlockHoldsBackTheInstallPromptForTheInstallBar(): void
    {
        [$card] = install_card($this->dir, 'play');
        $block = install_block($card, '');
        $this->assertStringContainsString(INSTALL_PROMPT_STASH, $block);
        $this->assertStringContainsString('e.preventDefault(); window.__installPrompt = e;', INSTALL_PROMPT_STASH);
        $this->assertLessThan(strpos($block, INSTALL_SW_REGISTER), strpos($block, INSTALL_PROMPT_STASH));
    }
```

Append to `games/_kit/test/install.test.mjs` (and add `PROMPT_STASH` to its `../install.ts` import, `readFileSync` from `node:fs` and `join` from `node:path`):

```js
test('the page\'s first script parks an early prompt where the bar looks for it', () => {
  const php = readFileSync(join(import.meta.dirname, '..', 'php', 'install-core.php'), 'utf8');
  assert.match(php, new RegExp(`window\\.${PROMPT_STASH} = e;`));
});
```

In `tests/php/checks/site-game-pages.php`:
- After the line that writes `$root/arty/og.png`, add:

```php
// A page game's built Install and Share bar, which its site page loads.
@mkdir("$root/arty/dist", 0777, true);
file_put_contents("$root/arty/dist/install.js", "(()=>{})();\n");
```

- After the `wrapper-installs-game` check, add:

```php
// Install and Share: the bar's mount after the game's name, the game's
// dist/install.js with its own version, and the early-prompt stash before it.
$check('wrapper-install-bar', str_contains($wrap, '<span class="play-install" id="play-install" data-title="Arty &amp; Co" data-game-page="../../games/arty/"></span>')
    && strpos($wrap, 'class="play-now"') < strpos($wrap, 'id="play-install"'));
$check('wrapper-loads-install-js', str_contains($wrap, '<script src="../../games/arty/dist/install.js?v='
    . substr(hash('sha256', (string) file_get_contents("$root/arty/dist/install.js")), 0, 10) . '" defer></script>'));
$check('wrapper-stashes-the-prompt-first', str_contains($wrap, INSTALL_PROMPT_STASH)
    && strpos($wrap, INSTALL_PROMPT_STASH) < strpos($wrap, '<script src='));
```

- After the `start-page-no-image-card` check, add:

```php
$check('start-page-keeps-the-query', str_contains($fwd, "<script>location.replace(\"../../?game=mounted\" + location.search.replace(/^\\?/, '&') + location.hash);</script>")
    && str_contains($fwd, '<noscript><meta http-equiv="refresh" content="0; url=../../?game=mounted"></noscript>'));
```

- After the `unreadable-shared-file-fails` block (after `file_put_contents("$tmp/play/play.js", $keep);`), add:

```php
// A page game that was never built has no bar to load: a note and a failure.
unlink("$root/arty/dist/install.js");
[$stale, $notes, $broken] = site_pages_sync($root, $site, false);
$check('unbuilt-game-fails', $broken === true
    && in_array('games/arty/dist/install.js is not readable, but play/arty/ loads it; build the game', $notes, true), json_encode([$notes, $broken]));
file_put_contents("$root/arty/dist/install.js", "(()=>{})();\n");
```

Run: `cd websites/www.cs && vendor/bin/phpunit --testsuite kit && vendor/bin/phpunit --testsuite site && (cd games && node --test _kit/test/install.test.mjs)`
Expected: FAIL: `INSTALL_PROMPT_STASH` is undefined; the new `site-game-pages` checks fail; the stash test finds no `window.__installPrompt = e;`.

- [ ] **Step 2: The stash in the kit's install block**

In `install-core.php`, after `INSTALL_SW_REGISTER`, add:

```php
/* Holds back the browser's install prompt for the page's Install button
   (games/_kit/install.ts): the event can fire before the deferred
   dist/install.js runs, and a prompt not held back is lost. */
const INSTALL_PROMPT_STASH = "<script>window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); window.__installPrompt = e; });</script>";
```

In `install_block`, add `INSTALL_PROMPT_STASH,` on the line before `INSTALL_SW_REGISTER,`.

- [ ] **Step 3: The game pages load the bar**

In `crete/index.html`, after `<script type="module" src="dist/main.js?v=…"></script>`, add:

```html
    <script src="dist/install.js?v=0" defer></script>
```

In `tankity/index.html`, after `<script type="module" src="dist/main.js?v=…"></script>`, add `<script src="dist/install.js?v=0" defer></script>` at the same indent.

In `crete/tools/install-files.php`, change `'versioned' => ['dist/main.js', 'game.css'],` to `'versioned' => ['dist/main.js', 'dist/install.js', 'game.css'],`; in `tankity/tools/install-files.php`, change `'versioned' => ['dist/main.js', 'dist/fx.js', 'game.css'],` to `'versioned' => ['dist/main.js', 'dist/fx.js', 'dist/install.js', 'game.css'],`.

- [ ] **Step 4: The site pages**

In `tools/site-game-pages.php`:
- After `require_once __DIR__ . '/../games/hub.php';`, add `require_once __DIR__ . '/../games/_kit/php/install-core.php'; // INSTALL_PROMPT_STASH`.
- In the file's doc comment, after the paragraph on `?v=`, add: "A play game's page also loads the game's own `dist/install.js` (the kit's Install and Share bar, built with the game) into `#play-install`, versioned the same way, and holds back the install prompt from its first script (`INSTALL_PROMPT_STASH`). A play game that has not been built cannot be written."
- In `site_pages_wrapper`, change the doc comment's last sentence to "$versions maps play.css, play.js and the game's install.js to their `?v=`." and replace the `$head = array_merge(…);` statement with:

```php
    $head = array_merge(
        ['<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">',
         "<title>$title · William Grim</title>"],
        site_pages_preview($card, $site),
        site_pages_install($card, "../../games/$id/"),
        [INSTALL_PROMPT_STASH,
         '<link rel="icon" href="../../favicon-32.png" sizes="32x32">',
         '<link rel="stylesheet" href="../play.css?v=' . $versions['play.css'] . '">',
         '<style>:root { --game-bg: ' . $card['background_color'] . '; --game-theme: ' . $card['theme_color']
            . '; --game-accent: ' . $card['accent_color'] . '; }</style>',
         '<script src="../play.js?v=' . $versions['play.js'] . '" defer></script>',
         '<script src="../../games/' . $id . '/dist/install.js?v=' . $versions['install.js'] . '" defer></script>']);
```

  and after the `play-now` line of the returned page add:

```php
        . "  <span class=\"play-install\" id=\"play-install\" data-title=\"$title\" data-game-page=\"$game\"></span>\n"
```

- In `site_pages_forward_page`, after `$to = …;` add `$js = json_encode('../../?game=' . rawurlencode($card['id']), JSON_UNESCAPED_SLASHES);`, change its doc comment to "The site's page for a game mounted in the site page: its preview tags, then straight on to the site with ?game=<id>, keeping the address's query and hash (?install).", and replace the meta refresh line with:

```php
        . '<script>location.replace(' . $js . " + location.search.replace(/^\\?/, '&') + location.hash);</script>\n"
        . '<noscript><meta http-equiv="refresh" content="0; url=' . $to . "\"></noscript>\n"
```

- In `site_pages_sync`, add `$broken = false;` after `$notes = [];`, and replace the loop's first statement (`$content = isset($card['page']) ? … : …;`) with:

```php
        if (isset($card['page'])) {
            $bar = @file_get_contents("$root/{$card['id']}/dist/install.js");
            if (!is_string($bar)) {
                $notes[] = "games/{$card['id']}/dist/install.js is not readable, but play/{$card['id']}/ loads it; build the game";
                $broken = true;
                continue;
            }
            $content = site_pages_wrapper($card, $site, $versions + ['install.js' => site_pages_version($bar)]);
        } else {
            $content = site_pages_forward_page($card, $site);
        }
```

  and change the final `return [$stale, $notes, false];` to `return [$stale, $notes, $broken];`.

In `play/play.css`, after the `.play-now img` rule, add:

```css
/* Install and Share (the game's dist/install.js draws them). */
.play-install { display: inline-flex; --kit-install-accent: var(--game-accent); }
.play-install:empty { display: none; }
```

and inside the `@media (max-width: 560px)` block add `.play-install { margin-left: auto; }` (the game's name, which pushes the bar right on wider screens, is hidden there).

- [ ] **Step 5: Regenerate, run, commit**

Run:

```bash
cd websites/www.cs
vendor/bin/phpunit --testsuite kit && vendor/bin/phpunit --testsuite site
(cd games && node --test _kit/test/install.test.mjs)
for g in crete cylon tankity; do php games/$g/tools/install-files.php; done
php tools/site-game-pages.php
make test
```

Expected: green; `install-files.php` rewrites Crete's and Tankity's `index.html` (the stash in the block, `dist/install.js?v=`) and `sw.js`; `site-game-pages.php` rewrites all three `play/*/index.html`.

```bash
git add -A websites/www.cs/games/_kit websites/www.cs/games/crete websites/www.cs/games/tankity websites/www.cs/tools/site-game-pages.php websites/www.cs/tests/php websites/www.cs/play
git commit -m "Install and Share on each game's site page; the game page shows them for ?install; the prompt held back from the first script"
```

### Task 30: The CIC's Install and Share, in its game bar

**Files:**
- Modify: `websites/www.cs/index.html` (`#cylon-install-root`), `games/cylon/src/main.ts`, `games/cylon/css/nav.css`, `games/cylon/README.md`
- Rebuild: `cylon/dist/`; `php tools/site-versions.php`

The CIC's site page forwards to the home page, so its buttons live where it is played: the home page's game bar, when the address opens The CIC (`?game=cylon`). The site's `main.js` links Cylon's manifest for `?game=cylon` once the games list arrives; Cylon links it first, before the bar listens, so a prompt the bar holds back is the game's, never the site's.

**Interfaces:**
- Consumes: `mountInstallBar` (Task 28); `asksInstall`, `browserInstallEnv`, `OUT_OF_SCOPE_PROMPTS` (Task 27); Task 26's `PROMPTS_IN_SCOPE`.
- Produces: `#cylon-install-root` (class `cylon-install`) at the end of `#site-nav-game`; with `?game=cylon`, the kit bar there: title "The CIC", share URL `play/cylon/`; at `index.html` (in scope) `installPage: null`; at the bare site address `installPage` `index.html?game=cylon`. `PROMPTS_IN_SCOPE` (in `main.ts`) is Task 26's answer.

| Task 26 | at `index.html?game=cylon` | at `/?game=cylon` |
|---|---|---|
| A: `OUT_OF_SCOPE_PROMPTS`, `PROMPTS_IN_SCOPE` both true | prompts here | prompts here; iOS goes to `index.html` |
| B: only `PROMPTS_IN_SCOPE` true | prompts here | Chromium's and iOS's Install go to `index.html?game=cylon&install` |
| `PROMPTS_IN_SCOPE` false | Share only on Chromium; iOS's steps here | the same |

- [ ] **Step 1: The mount point and its style**

In `index.html`, inside `#site-nav-game`, after the `#cylon-help-btn` button's closing `</button>`, add:

```html
      <span class="cylon-install" id="cylon-install-root"></span>
```

Append to `games/cylon/css/nav.css`:

```css
/* Install and Share (games/_kit/ui/install-bar.tsx), in the game bar when the address opens The CIC. */
.cylon-install { display: inline-flex; --kit-install-accent: #ff3b3b; }
.cylon-install:empty { display: none; }
@media (max-width: 560px) {
  .cylon-install .kit-install-btn { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
}
```

- [ ] **Step 2: Mount the bar**

In `games/cylon/src/main.ts`:
- Add the imports:

```ts
import { mountInstallBar } from '../../_kit/ui/install-bar.tsx';
import { asksInstall, browserInstallEnv, OUT_OF_SCOPE_PROMPTS } from '../../_kit/install.ts';
```

- After `const CYLON_MOUNT_URL = …;`, add (in the third row of the table above, write `false`):

```ts
/** Whether Chrome offers The CIC's install prompt on index.html, inside its manifest's scope, once the page links that manifest (measured in Chrome). */
const PROMPTS_IN_SCOPE: boolean = true;

/**
 * Install and Share in the game bar, when the address opens The CIC
 * (?game=cylon). The page links Cylon's manifest before the bar listens, so a
 * held-back prompt is the game's, not the site's.
 */
function mountInstall(): void {
    const root = document.getElementById('cylon-install-root');
    if (!root || new URLSearchParams(location.search).get('game') !== 'cylon') return;
    document.querySelector('link[rel="manifest"]')?.setAttribute('href', 'games/cylon/manifest.webmanifest');
    const inScope = location.pathname.endsWith('/index.html');
    mountInstallBar(root, {
        title: 'The CIC',
        shareUrl: new URL('play/cylon/', location.href).href,
        installPage: inScope || !PROMPTS_IN_SCOPE ? null : new URL('index.html?game=cylon', location.href).href,
        promptsHere: PROMPTS_IN_SCOPE && (inScope || OUT_OF_SCOPE_PROMPTS),
        asked: asksInstall(location.search),
    }, browserInstallEnv());
}
```

- In `initializeCylonEffects`, after `bindHelp();`, add `mountInstall();`.

In `games/cylon/README.md`'s "Host contract", add: "**Install and Share.** With `?game=cylon`, `#cylon-install-root` in the home page's game bar holds the kit's Install and Share bar (`games/_kit/install.ts`): Share hands out `play/cylon/`; Install installs The CIC (the page links its manifest first). `/play/cylon/?install` forwards to `?game=cylon&install`, which highlights Install, or on iOS opens the Add to Home Screen steps."

- [ ] **Step 3: Build, check, commit**

Run: `cd websites/www.cs/games && node _kit/build/build.mjs cylon && php cylon/tools/install-files.php && cylon/test.sh && cd .. && php tools/site-versions.php && make e2e E2E_ARGS="cylon-help.spec.mjs home-eye.spec.mjs"`
Expected: green; `site-versions.php` rewrites `index.html`'s `?v=` for `nav.css` and `dist/main.js`.

```bash
git add -A websites/www.cs/games/cylon websites/www.cs/index.html
git commit -m "Cylon: Install and Share in the game bar for ?game=cylon"
```

### Task 31: The browser spec: Install and Share on every game

**Files:**
- Create: `websites/www.cs/tests/e2e/games-install.spec.mjs`
- Modify: `websites/www.cs/tests/e2e/select.mjs`, `select-test.mjs`, `shard.mjs` (`WEIGHTS`)

**Interfaces:**
- Consumes: Tasks 28–30's pages and ids.
- Produces: `games-install.spec.mjs` (≤ 15 s; weight 10), selected by the site shell, Crete, Tankity and the kit (`_kit/` already selects everything). Its checks hold in both of Task 26's branches: the synthetic event shows Install on a site page in either (branch B shows it at once); the click that must prompt is tested on the game's own page, which prompts in both.

- [ ] **Step 1: Write the spec**

```js
// websites/www.cs/tests/e2e/games-install.spec.mjs
// Install and Share on each game: Install appears when the browser offers to
// install and prompts on a click; on an iPhone it opens the Add to Home Screen
// steps on the game's own page; Share falls back to copying the link.
import { test, expect } from '@playwright/test';

const PAGE_GAMES = ['crete', 'tankity'];
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

/** Chrome's install offer, as a page sees it: a beforeinstallprompt whose prompt() is counted. */
const offerInstall = page => page.evaluate(() => {
  const ev = new Event('beforeinstallprompt', { cancelable: true });
  ev.prompt = () => { window.__prompted = (window.__prompted ?? 0) + 1; return Promise.resolve(); };
  window.dispatchEvent(ev);
});

/** Chrome's own install offers are kept from the page, so only the test's offer counts. */
const onlyTestOffers = target => target.addInitScript(() => {
  window.addEventListener('beforeinstallprompt', e => {
    if (!e.isTrusted) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  });
});

/** No Web Share, and a clipboard that records what it is given. */
const noShareSheet = context => context.addInitScript(() => {
  Object.defineProperty(Navigator.prototype, 'share', { value: undefined, configurable: true });
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: text => { window.__copied = text; return Promise.resolve(); } },
    configurable: true,
  });
});

function watchErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  return errors;
}

for (const id of PAGE_GAMES) {
  test(`${id}: the site page shows Install when the browser offers it, and Share copies its address`, async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    await onlyTestOffers(context);
    await noShareSheet(context);
    const page = await context.newPage();
    const errors = watchErrors(page);
    await page.goto(`play/${id}/`);
    const bar = page.locator('#play-install');
    await expect(bar.locator('#share-btn')).toBeVisible();
    await offerInstall(page);
    await expect(bar.locator('#install-btn')).toBeVisible();
    await bar.locator('#share-btn').click();
    await expect(bar.locator('#share-status')).toHaveText('Link copied');
    expect(await page.evaluate(() => window.__copied)).toBe(new URL(`play/${id}/`, baseURL).href);
    expect(errors).toEqual([]);
    await context.close();
  });
}

test('the game page asked to install (?install) highlights Install, and a click prompts', async ({ page }) => {
  await onlyTestOffers(page);
  const errors = watchErrors(page);
  await page.goto('games/crete/?install');
  await expect(page.locator('.kit-install-corner #share-btn')).toBeVisible();
  await offerInstall(page);
  const install = page.locator('.kit-install-corner #install-btn');
  await expect(install).toBeVisible();
  await expect(install).toHaveClass(/kit-install-asked/);
  await install.click();
  expect(await page.evaluate(() => window.__prompted)).toBe(1);
  await expect(install).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('on an iPhone, Install opens the game page with the Add to Home Screen steps; Escape closes them', async ({ browser }) => {
  const context = await browser.newContext({ userAgent: IPHONE });
  const page = await context.newPage();
  const errors = watchErrors(page);
  await page.goto('play/crete/');
  await page.locator('#play-install #install-btn').click();
  await expect(page).toHaveURL(/\/games\/crete\/\?install$/);
  await expect(page.locator('#install-steps')).toBeVisible();
  await expect(page.locator('#install-steps-text')).toHaveText('Tap Share, then Add to Home Screen.');
  await expect(page.locator('#install-steps-done')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#install-steps')).toBeHidden();
  expect(errors).toEqual([]);
  await context.close();
});

test('The CIC: the game bar has Share, and the page links the game\'s manifest', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('./?game=cylon');
  await expect(page.locator('#cylon-install-root #share-btn')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /games\/cylon\/manifest\.webmanifest$/);
  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: Select and weigh it**

In `tests/e2e/select.mjs`, add `'games-install.spec.mjs'` to the `shell` list, to the Crete rule's list (`['games-hub.spec.mjs', 'games-pwa.spec.mjs', 'crete-play.spec.mjs', 'games-install.spec.mjs']`), and to both Tankity rules (`[...tankity, 'games-pwa.spec.mjs', 'games-hub.spec.mjs', 'games-install.spec.mjs']`).

In `select-test.mjs`, next to the other site-shell cases, add:

```js
has('play-page-runs-install-spec', select([`${S}play/play.css`, `${S}tools/site-game-pages.php`]), ['games-install.spec.mjs']);
has('a-page-game-runs-install-spec', select([`${S}games/crete/index.html`, `${S}games/tankity/index.html`]), ['games-install.spec.mjs']);
```

In `shard.mjs`'s `WEIGHTS`, add `'games-install.spec.mjs': 10,` after `'games-pwa.spec.mjs': 3,`.

- [ ] **Step 3: Run and commit**

Run: `cd websites/www.cs && node tests/e2e/select-test.mjs && node tests/e2e/shard-test.mjs && node tests/e2e/select.mjs --check && make e2e E2E_ARGS="games-install.spec.mjs"`
Expected: green, the spec within 15 s (Playwright prints its time; if it runs longer, set its weight to the measured seconds).

```bash
git add websites/www.cs/tests/e2e/games-install.spec.mjs websites/www.cs/tests/e2e/select.mjs websites/www.cs/tests/e2e/select-test.mjs websites/www.cs/tests/e2e/shard.mjs
git commit -m "e2e: games-install checks Install and Share on every game"
```

### Task 25: Docs, the whole check, and PR 19 ships

**Files:**
- Modify: `websites/www.cs/games/README.md`, `tests/e2e/select.mjs` and `select-test.mjs` (the icon renderer is not a browser concern)

**Interfaces:**
- Consumes: everything above.
- Produces: `select.mjs` maps `games/_kit/build/icons.mjs` and `icons.test.mjs` to NONE, like the build's own tests. (`games/<id>/tools/icon.svg` already falls under the `tools/` NONE rule; the PNGs it produces fall under each game's folder rule.)

- [ ] **Step 1: Selection**

In `tests/e2e/select.mjs`, change the kit's NONE rule

```js
  [new RegExp(`^${SITE}games/_kit/(README\\.md|test/|php/tests/|build/(build\\.test\\.mjs|fixture/))`), 'NONE'],
```

to

```js
  [new RegExp(`^${SITE}games/_kit/(README\\.md|test/|php/tests/|build/(build\\.test\\.mjs|icons(\\.test)?\\.mjs|fixture/))`), 'NONE'],
```

and add to `select-test.mjs`, next to the other kit cases (its `check(name, got, want)` helper):

```js
check('kit-icon-renderer-runs-no-spec', select([`${S}games/_kit/build/icons.mjs`, `${S}games/_kit/build/icons.test.mjs`]), 'NONE');
check('a-game-icon-drawing-runs-no-spec', select([`${S}games/crete/tools/icon.svg`]), 'NONE');
```

- [ ] **Step 2: The games README**

In `websites/www.cs/games/README.md`, in the section on installing, state: each game installs as its own full-screen app (manifest `display_override: ["fullscreen", "standalone"]`); its icons are rendered from `tools/icon.svg` by `node _kit/build/icons.mjs <id>` (any 192 and 512, maskable 192 and 512, monochrome 512, Apple 180), and `tools/install-files.php --check` fails on a missing or wrong-sized one; every game has a Quit (Tankity: Menu → Quit; Cylon: the Game On toggle; Crete: the Quit button or Q) through `_kit/app.ts`. In the site-side bullet on `play/<id>/index.html`, add to the `play` game's description: "Install and Share sit at the end of the navbar, drawn by the game's own `dist/install.js` (the kit's `install.ts`); `?install` highlights Install, or on iOS opens the Add to Home Screen steps on the game's page"; to the `start` game's: "keeping the address's query (`?install`)"; and to the Game bullet: "A page game's page also loads `dist/install.js`, which shows the same bar in a corner when the address has `?install`."

- [ ] **Step 3: The whole check**

Run: `cd websites/www.cs && make test && make e2e E2E_ARGS="games-pwa.spec.mjs games-install.spec.mjs"`
Expected: green.

```bash
git add websites/www.cs/games/README.md websites/www.cs/tests/e2e/select.mjs websites/www.cs/tests/e2e/select-test.mjs
git commit -m "Install and exit: docs; the icon renderer selects no browser spec"
```

- [ ] **Step 4: Ship PR 19**

Push `games/install-and-exit`, open the PR ("Install and exit: full-screen apps, icon sets from one drawing per game, Quit in each game, and Install and Share buttons", spec row 19). Paste Task 26's six `PROBE` lines and its two answers (`OUT_OF_SCOPE_PROMPTS`, `PROMPTS_IN_SCOPE`) into the description, and say which branch the PR built. CI selects every spec (`_kit/` and `games/package*.json` changed). If `main` moved, rebase and rebuild the generated files (Global Constraints). Run the pr-fix loop on the review comments, then merge on green CI, deploy, live-check with `games-pwa.spec.mjs` and `games-install.spec.mjs` (both read-only), and end the report with `/play/tankity/?v=<merge sha>`.

---

## Self-review

- **Spec coverage.** Row 6: Tasks 1–4 (`audio/core.ts`; Crete, Cylon, Tankity adopt it). Row 7: Tasks 5–8 (kit `ui/`; Crete's ending and inventory). Row 8: Tasks 9–12 (Cylon's help, game over, settings, board; the intro stays an animated sprite). Row 9: Tasks 13–18 (dasher meets, strategist wins, derived streams, 80 attempts and the fallback, never a losing maze, 1,000-seed sweep with both budgets, 10,000 nightly through `GITHUB_EVENT_NAME=schedule`, HUD drops the budget and keeps the optimal route, `engine.test` and `crete-play` re-pinned, T is the strategist). Row 19: Tasks 19–25 (full-screen manifests; per-game icon sets from one drawing, maskable, Apple and monochrome; `install-core.php` checks every icon; `app.ts` with `isInstalled`, `enterFullscreen`, `exitApp`; Quit in Tankity, Cylon and Crete; close where allowed, else title card, out of full screen, and the phone hint; unit tests for the closable, not-closable and browser-tab cases; each game's spec presses its exit; `games-pwa` checks start URL, scope, display and icons). Install and Share: Tasks 26–31 (the probe and its two answers; `install.ts` with every platform branch unit-tested; the bar, `dist/install.js` per page game; the site pages' mount, script and prompt stash, checked by `site-game-pages`; The CIC's bar on the home page; `games-install` within 15 s, selected and weighted).
- **Placeholder scan.** The only values a task cannot know in advance are Crete's re-pinned maze numbers; Task 17 Step 4 gives the command that prints them and where each goes.
- **Type consistency.** `AudioCore`, `BusName`, `ToneSpec`, `NoiseSpec` (Task 1) are used with those names in Tasks 2–4. `Dialog`/`Button`/`Panel`/`KeyChip` props (Task 6) match their uses in Tasks 7, 8, 10, 11, 22 and in Plan C (Tankity's chips use `KeyChip`'s `at` and `decorative`; its title card is a `Dialog`). Task 24 uses Plan C's `backToTitle()` and `test/menu.test.mjs` by those names. `HsRow`/`highScoreRows`/`HsList`/`renderHsRows` (Task 9) match Tasks 11–12. `Bot`, `BotAction`, `dasher`, `strategist`, `WAIT_LIMIT` (Task 16) match Task 17; `Trial`, `Judge`, `RunPick`, `trial`, `perform`, `generateRun(seed, judge)` (Task 17) match Task 18's sweep. `AppEnv`, `ExitOutcome`, `exitApp`, `enterFullscreen`, `browserAppEnv`, `EXIT_HINT`, `CLOSE_WAIT_MS` (Task 21) match Tasks 22–24. `INSTALL_ICONS` (Task 20) and `ICONS` (Task 19) are held equal by a test. `InstallEnv`, `InstallSetup`, `InstallView`, `Install`, `createInstall`, `browserInstallEnv`, `asksInstall`, `withInstall`, `OUT_OF_SCOPE_PROMPTS`, `IOS_STEPS`, `PROMPT_STASH` (Task 27) match Tasks 28–30; `mountInstallBar` and the bar's ids (Task 28) match Tasks 29–31; `PROMPT_STASH` and `INSTALL_PROMPT_STASH` (Task 29) are held equal by a test.
- **Review Focus.** Each of the six lines has its test in the named task.
