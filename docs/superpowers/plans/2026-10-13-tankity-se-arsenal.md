# Tankity: Scorched Earth Arsenal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Tankity's arsenal toward the original Scorched Earth. The SE classics arrive in four families (Blast, Beams and tracers, Earth, Fire), and every current weapon stays: Shell, Buckshot, Mortar, Rail, Cluster, Flak, Seeker, Lance, Heavy, Needle, EMP, Roller, NUKE. Each new weapon has its own flight and effect parameters in `game.yaml`. The room server (PHP) and the browser (TS) compute identical outcomes. Drones use the new guns sensibly, and prices and unlock rounds keep the economy balanced.

**Architecture:** Every new mechanic is a new `effect` value with its own required fields in `game.yaml` (`tools/game-json.php` validates them). Mechanics are shared by effect and parameters, never by named weapon groups. Each mechanic is a pure function that exists twice: `src/sim.ts` / `src/earth.ts` / `src/fire.ts` in the browser, and `server/sim.php` / `server/earth.php` / `server/fire.php` on the server. The two copies are kept equal by `protocol/sim-vectors.json`, and the files are scanned by `test/determinism.test.mjs`. Terrain-changing mechanics reach room clients as new replay events (`beam`, `dirt`, `dig`, `pour`, `riot`, `slump`, `fire`). Each client applies an event with the same shared TS function, and `terrainRev` resyncs the hills as today. The drones get one new layer. They still search aim per planning arc (`flightKey`, unchanged in spirit), but they now choose the gun by **predicted harm**: `aiHarm`, which `ai.ts` and `ai.php` share. It predicts blast damage at the predicted landing, fall damage from the terrain the gun would remove (using the fall-damage PR's formula), burn damage, and a burial value. A gun that would hurt the drone itself is never chosen. Visuals follow the effects pipeline: a `game.yaml` `effects` entry per weapon, plus new Blender sheets from `fx/blender/render_fx.py`.

**Tech Stack:** TypeScript 7 (native type stripping for `node --test`), Preact 11, esbuild via `games/_kit/build/build.mjs`, PHP 8.4, PHPUnit 12, Playwright, Blender 5.2 (`/opt/homebrew/bin/blender`).

**Spec:** this file's Design section (the user's decisions are in `.superpowers/sdd/2026-10-13-tankity-se-arsenal/planner-brief.md`).

**Branches:** four PRs, landed in order, each off `main` in its own worktree:
`games/tankity-arsenal-blast`, `games/tankity-arsenal-beams`, `games/tankity-arsenal-earth`, `games/tankity-arsenal-fire`.

All paths are relative to `websites/www.cs/games/tankity/` unless they start with `websites/` or `tests/` (`tests/` is `websites/www.cs/tests/`).

---

## Global Constraints

- **Determinism.** Rule modules (`src/sim.ts`, `src/ai.ts`, `src/armor.ts`, `src/detmath.ts`, `src/solo.ts`, and the new `src/earth.ts` and `src/fire.ts`; `server/sim.php`, `server/ai.php`, `server/detmath.php`, and the new `server/earth.php` and `server/fire.php`) use only `+ - * /`, `Math.floor`/`floor`, `Math.sqrt`/`sqrt`, `dsin`/`dcos`/`datan2` (`det_*`), `rad()`/`deg2rad`, `powi`, `dist`. They never use RNG during flight or terrain operations. Every "random-looking" spread (Funky Bomb) is a fixed index pattern. Add every new rule file to the TS_RULES and PHP lists in `test/determinism.test.mjs` **in the same commit that creates it**.
- **Parity.** Each new mechanic gets TS/PHP parity vectors in `protocol/sim-vectors.php`. The whole-volley loop there already covers every weapon in `game.json` on three setups, and targeted cases come on top. Regenerate `sim-vectors.json` and `protocol/*.json` fixtures **only in docker**: `export COMPOSE_PROJECT_NAME=$(cat <sdd>/compose-project-name)`, then `make up`, `make sim-vectors`, `make protocol` from `websites/www.cs`. Tear the stack down with `docker compose -p "$COMPOSE_PROJECT_NAME" down -v`. Never prune. Never bind 3000/5173/8000/8080. The same applies to `protocol/solo-runs.json` if the fall-damage PR added it.
- **Weapons diverge.** No `if (wkey === 'babynuke')` and no lists of weapon keys anywhere in code. Behaviour comes from `effect` and the row's fields only. Two weapons with equal fields fly and burst alike; that is a coincidence of data, not a group.
- **Fall damage.** The fall-damage + parachutes PR (`games/tankity-fall-damage`) lands before PR 3. Every terrain removal in PRs 1, 3 and 4 goes through the settle path that PR adds, so falls are damaged and credited to the shooter who removed the ground. Self-dug falls credit nobody.
- **Effects overhaul.** The effects-overhaul PR (`games/tankity-fx-overhaul`) lands before PR 1 is opened. Each family PR only *adds* sheet builders and `--only` names to `render_fx.py`, and reuses the overhaul's sheets wherever one fits (for example, if the overhaul adds a debris or dirt sheet, the Earth family uses it rather than rendering a new one).
- **Keys.** Esc is never bound or mentioned to players; Q opens the menu and closes overlays. No new key bindings are needed: the picker and the shop already reach every row.
- **Docs describe current state.** Update `game.yaml`'s header comments (effects and fields), `README.md` (the `game.yaml` row's count, the `server/` and `src/` rows, the sim-vectors "Covered" list, the e2e list), and `fx/CREDITS.md`. No "added in", no dates.
- **TDD.** Each task writes its failing test first. Run `node --test test/<file>.test.mjs` and `vendor/bin/phpunit -c ../../phpunit.xml --testsuite tankity --filter <Test>` (from `websites/www.cs`) to see it fail, implement, then see it pass.
- **Gates per PR.** `bash websites/www.cs/games/tankity/test.sh`. Then `make test` in `websites/www.cs` with the PR's compose project. Then at most two e2e specs locally (`make e2e E2E_ARGS="tankity-fx-range tankity-pickers"`); CI runs the rest.
- **Build.** From `websites/www.cs/games`, run `node _kit/build/build.mjs tankity`. In `tankity`, run `php tools/game-json.php` after every `game.yaml` edit and `php tools/install-files.php` after the last edit to anything served. Commit `game.yaml` and `game.json` together.
- **Commits.** Small and logical. Each message ends with the session's `Co-Authored-By` / `Claude-Session` lines.

## Review Focus

1. **Parity holes.** Any new code path in the TS sim without its PHP twin, or the reverse. In particular, check the order sub-munitions resolve in. The server resolves a volley strictly sequentially (`room_fire_shot`), and the browser holds later shells with `waitsOnEarlier`. Every new child shell needs an `order` that sorts after its parent and before the next pellet.
2. **Harmless blasts.** A `dmg: 0` burst must touch no unit: no shield spent, no `lastHitBy`, no `dealt`, no `hit` event.
3. **Burial.** Ground units must not be lifted by risen ground mid-round. Every place that sets `t.y = surfY(...)` (drive, `fallTanks`, `room_settle_tanks`, the AI shuffle, `snapTanks`) is reviewed.
4. **AI cost.** The drone turn budget. `test/ai-search.test.mjs` and `RoomsLoadTest` must stay inside their limits with a round-9 rack holding every `ai: true` gun.
5. **Balance table.** The prices, packs, minRound and aiRound values in the Design tables, against cash income (round win 500, kill 300, damage x2).
6. **Event schema.** The new replay events in `src/protocol.ts` and `server/protocol.php`, the fixtures, and the client's terrain mirroring (`room.ts`).

---

## Design

### Scorched Earth reference and our takes

SE behaviour below is **as remembered, unverified** unless stated otherwise. No exact SE numbers are claimed. Every number in the tables is ours, chosen against Tankity's existing scale:

- Shell: 34 damage, radius 26, free.
- Mortar: 56/42, $200 for 2.
- Heavy: 85/52.
- NUKE: 95/70, $500 for 1.
- Income: round win $500, kill bonus $300, damage dealt x2.

#### Overlaps with what we already have (rulings)

| SE weapon | Ours | Ruling |
|---|---|---|
| Baby Missile, Missile | Shell (free, endless), Mortar | **Not added.** A paid small shell is strictly worse than the free Shell, and Mortar already fills "bigger plain shell". |
| MIRV | Cluster | Covered. Cluster splits on a fuse; the new Death's Head splits at the apex (the SE-style trigger, unverified), so the two diverge by parameter. |
| Nuke | NUKE | Kept as is. Baby Nuke is added below it. |
| Roller | Roller | Kept. Baby Roller and Heavy Roller are added with their own friction, roll time and speed. |
| Heat guidance (an SE accessory, unverified) | Seeker | Covered by Seeker as a weapon; no guidance accessory. |

### New `effect` values and fields

Every field below is validated by `tools/game-json.php`: it is required for its effect, and any other effect rejects it as unknown. Ranges are in brackets.

| effect | Behaviour | Fields |
|---|---|---|
| `hop` | Flies like a shell. Each burst (ground or direct hit) spawns the next warhead from the burst point. The new warhead's velocity is `(vx * hopKeep, -abs(vy) * hopKeep)`, and it carries `subDmg`/`subRadius`. This continues until `hops` warheads have burst or one leaves the field. | `hops` [2..6], `hopKeep` [0.2..0.9], `subDmg`, `subRadius` |
| `scatter` | Flies like a shell. On its burst, it throws `split` bomblets upward from the burst point (fixed pattern below). Each bomblet is a normal arc with wind, and bursts with `subDmg`/`subRadius`. | `split` [2..12], `fan` [0.2..3.0] (total spread in radians, centred straight up), `kick` [40..400] (px/s), `subDmg`, `subRadius` |
| `cluster` (existing) | New optional `apex: true`: it splits at the first step where `vy >= 0` and `age >= 0.1`, instead of on `fuse`. With `apex`, `fuse` is not required. | `apex` (bool) |
| `beam` | No flight. A straight ray from the muzzle along the barrel, length `range * power / 100 * fieldReach(w)`. It is marched in 3 px steps, so it cannot skip a box. Each unit whose hit box the ray enters is hit once for flat `dmg` (no falloff, no direct-hit doubling). It carves a channel by calling `carveCrater` with r = `radius` every `radius` px along the ray. It stops at the range or the field's edge. | `range` [60..1200] |
| `plasma` | No flight. A radial burst centred on the firer's hit box, with radius `radius * power / 100` (never below 20) and `blastDamage` falloff. The firer is immune, and it carves no crater. | none beyond dmg/radius |
| `tracer` | Flies like a shell and leaves its path on screen (gfx `mark`). It has no blast, no crater, no damage and no events beyond `shot`. | none (`dmg: 0`, `radius: 0`) |
| `dirt` | Flies like a shell. On its burst, it first deals `dmg` as a normal blast if `dmg > 0`, with no crater. Then it adds a disc of dirt of radius `radius` around the burst point: `terrain[ix] = min(terrain[ix], y - chord(ix))`. | none beyond dmg/radius |
| `pour` | Flies like a shell. On its burst it pours `volume` px² of liquid dirt at the burst column (pour algorithm below). The dirt ends as a flat-topped pool. | `volume` [200..20000] |
| `dig` | Flies like a shell. Touching the ground, it burrows on along its heading for `digLen` px at a fixed speed (`digSpeed`, 240 px/s), cutting a trench of half-width `digR`. Because the world is a heightmap, a tunnel is a trench open to the sky. With `warheads > 0`, it bursts `warheads` blasts of `subDmg`/`subRadius`, spaced evenly along the dug path (the last at its end). With no warheads it does no damage. A unit in the path stops the burrow there; with warheads, the remaining warheads burst at that point. | `digLen` [20..400], `digR` [3..30], `warheads` [0..8], `subDmg`, `subRadius` (required when warheads > 0) |
| `riot` | No flight. It clears earth around the firer and does no damage: `carveCrater` at the hull centre with r = `radius / 2`, then `carveCrater` every 4 px along the barrel out to `radius`, with r growing linearly from `radius / 4` to `radius * fan`. | `fan` [0.1..1.5] |
| `slump` | Flies like a shell. On its burst the ground within `radius` slumps: `passes` passes of moving earth downhill wherever neighbouring columns differ by more than `slope` px. Each pass works left to right, and each move keeps the volume. No damage. | `slope` [0.5..6], `passes` [1..60] |
| `napalm` | Flies like a shell. On its burst it pours `volume` px² of burning liquid (the same pour algorithm on a copy of the terrain; the ground itself is unchanged). The pool burns for `burn` s. Every `tick` s, each unit whose hit box reaches into the flames takes `dmg`. "Reaches into" means the box's bottom is at or below `poolTop - flame` over a pooled column within its x range. | `volume`, `burn` [0.5..10], `tick` [0.1..2], `flame` [4..60] |

`dmg` now validates as a whole number from 0 to 500. A row with `dmg: 0` is harmless: its burst damages no unit, spends no shield, and sets no `lastHitBy` or `dealt` flag. `radius` validates from 0 to 200, and 0 is allowed only for `tracer`.

#### Shared algorithms (both languages, bit for bit)

- **Funky pattern.** Bomblet `i` of `n` leaves at angle `-PI/2 + (i - (n - 1) / 2) * fan / (n - 1)` (screen-up is −y). Its speed is `kick * (0.6 + 0.4 * ((i * 5) % n) / (n - 1))`, and its order is `[...parent.order, i]`.
- **Dirt disc** (`addDirt(terrain, x, y, r)`): for `ix` in `[floor(x - r), ceil(x + r)]` clipped to the field, set `chord = sqrt(max(0, r * r - dx * dx))` and `terrain[ix] = max(TOP_Y, min(terrain[ix], y - chord))`. `TOP_Y = 40` keeps the sky open, and the floor is unchanged. Dirt that would sit below the existing surface changes nothing.
- **Pour** (`pourLevel(terrain, x, volume)` returns `{level, x0, x1}`). It finds the level `L` that holds `volume`. It bisects L between `min(terrain)` and `H - 4` for exactly 48 iterations. For each candidate L, the basin is the connected run of columns from `round(x)` outward while `terrain[ix] > L - 0.5`, and its volume is `sum(terrain[ix] - L)` over the basin. Liquid that would spill off the field edge is lost: the basin stops at the edge. Liquid Dirt sets `terrain[ix] = L` over the basin, and Napalm keeps the pool (`L`, `x0..x1`) as a fire.
- **Slump**: in each pass, for `ix` from `x0` to `x1 - 1`, set `d = terrain[ix + 1] - terrain[ix]` (y grows downward). If `abs(d) > slope`, move `m = (abs(d) - slope) / 2` from the higher column to the lower one. A higher column has the smaller y: `terrain[high] += m`, `terrain[low] -= m`.
- **Dig path**: from the touchdown, step `digSpeed / 60` px per sim step along the unit heading at touchdown, for `ceil(digLen / (digSpeed / 60))` steps. Each step: `carveCrater(terrain, x, y, digR, H - 4)`, check `rollHit`-style contact (the unit's box at its own height), and record a path point every `ROOM_PATH_EVERY` steps.
- **Buried.** A ground unit is buried when `surfY(t.x) < t.y - BURY_EPS` (`BURY_EPS = 2`). Mid-round, nothing lifts a ground unit: `fallTanks`, `room_settle_tanks`, `snapTanks` and the drive step leave it where it is. A new round places every unit on fresh hills, as today. Drones hover, so risen ground carries them up and they are never buried. A buried unit cannot drive. Its shells start under the ground, and after the existing 0.1 s ground grace they burst in the dirt above it, carving and hurting by the usual blast rules (the firer included). That is the SE consequence of being buried, as remembered and unverified. Riot Charge and the diggers dig a unit out.

### The four families

`ai` is shown as `aiRound`, or `-` for `ai: false`. New field `aiRack` sets how many shells a drone loads (default 2). `cat` values in the shop are Shells, Rollers, Beams, Tracers, Earth and Fire. Existing rows keep their own `cat`, except Roller, which moves to Rollers.

#### PR 1: Blast

| key | name | SE (as remembered, unverified) | Our take | effect | dmg | radius | price | pack | minRound | ai | other |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `babynuke` | Baby Nuke | A smaller nuke. | A hill-levelling blast at normal speed, a step under NUKE. | shot | 72 | 50 | 320 | 1 | 3 | 7, aiRack 1 | speed 1.0 |
| `leapfrog` | Leapfrog | Bursts, then leaps on and bursts again, three times. | Three warheads, each hop losing 45% of its speed. Good for walking craters down a slope. | hop | 40 | 26 | 240 | 2 | 3 | 6 | hops 3, hopKeep 0.55, subDmg 34, subRadius 22 |
| `funky` | Funky Bomb | Bursts and flings colourful bomblets every which way. | Eight bomblets thrown up in a fixed "funky" fan, landing all around the burst. Rewards a near miss. | scatter | 30 | 24 | 380 | 1 | 5 | 7, aiRack 1 | split 8, fan 2.4, kick 150, subDmg 24, subRadius 18 |
| `deathshead` | Death's Head | A heavy MIRV whose warheads split at the top of the arc. | Nine heavy warheads splitting at the apex in a tight fan. The most expensive gun in the shop. | cluster | 30 | 20 | 900 | 1 | 7 | 9, aiRack 1 | apex true, split 9, fan 0.16, subDmg 60, subRadius 40 |
| `babyroller` | Baby Roller | A small roller. | A cheap roller that stops sooner. | roller | 28 | 22 | 90 | 3 | 1 | 3 | friction 0.8, rollTime 6, speed 1.0 |
| `heavyroller` | Heavy Roller | A big roller. | A heavy, slower ball that rolls far. | roller | 70 | 50 | 380 | 1 | 5 | 8, aiRack 1 | friction 0.45, rollTime 9, speed 0.85 |

#### PR 2: Beams and tracers

| key | name | SE (as remembered, unverified) | Our take | effect | dmg | radius | price | pack | minRound | ai | other |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `laser` | Laser | A straight beam weapon. | A dead-straight ray along the barrel. Power sets its reach. It cuts a thin channel through hills and hits every unit on the line, drones included. | beam | 45 | 6 | 300 | 2 | 4 | 6 | range 520 |
| `plasma` | Plasma Blast | A burst of energy around the firing tank; power sets its size. | A ring of plasma around you that hurts everyone close and spares you. Power sets the radius. | plasma | 60 | 90 | 280 | 2 | 3 | 5 | none |
| `tracer` | Tracer | A harmless shot that shows its path. | Shows its whole path and landing to you until your next shot. Costs pennies. | tracer | 0 | 0 | 15 | 5 | 1 | - | gfx mark: line |
| `smoketracer` | Smoke Tracer | A tracer that leaves a smoke trail. | Leaves a smoke trail that everyone sees for the round, drifting with the wind. | tracer | 0 | 0 | 30 | 5 | 1 | - | gfx mark: smoke |

#### PR 3: Earth

| key | name | SE (as remembered, unverified) | Our take | effect | dmg | radius | price | pack | minRound | ai | other |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `dirtclod` | Dirt Clod | A small ball of dirt. | A small mound; enough to cover a hull in a dip. | dirt | 0 | 20 | 40 | 5 | 1 | 4 | none |
| `dirtball` | Dirt Ball | A bigger ball of dirt. | Buries a tank on flat ground. | dirt | 0 | 35 | 90 | 3 | 2 | 5 | none |
| `tondirt` | Ton of Dirt | A huge ball of dirt. | A hill where the target stood. | dirt | 0 | 60 | 200 | 2 | 4 | 7, aiRack 1 | none |
| `liquiddirt` | Liquid Dirt | Dirt that flows and fills low ground. | Fills the valley it lands in to a flat floor, burying whatever sits at the bottom. | pour | 0 | 1 | 160 | 2 | 3 | 6 | volume 4000 |
| `dirtcharge` | Dirt Charge | An explosion that throws up dirt. | A real blast that buries what it hurt under a mound. | dirt | 20 | 45 | 180 | 2 | 4 | 6 | none |
| `babydigger` | Baby Digger | Tunnels into the ground. | A short trench along its heading. | dig | 0 | 1 | 50 | 3 | 1 | 4 | digLen 60, digR 8, warheads 0 |
| `digger` | Digger | A longer tunnel. | Undermines a tank so it drops, with fall damage. | dig | 0 | 1 | 110 | 2 | 3 | 6 | digLen 110, digR 11, warheads 0 |
| `heavydigger` | Heavy Digger | The longest tunnel. | A deep, wide trench. | dig | 0 | 1 | 200 | 2 | 5 | 8 | digLen 180, digR 15, warheads 0 |
| `babysandhog` | Baby Sandhog | A burrowing warhead. | Two warheads burst along a short burrow. | dig | 0 | 1 | 160 | 2 | 2 | 5 | digLen 70, digR 7, warheads 2, subDmg 26, subRadius 18 |
| `sandhog` | Sandhog | Burrows, then bursts. | Three warheads along the burrow. | dig | 0 | 1 | 280 | 2 | 4 | 7 | digLen 120, digR 9, warheads 3, subDmg 34, subRadius 22 |
| `heavysandhog` | Heavy Sandhog | A big burrowing bomb. | Five warheads along a long burrow. | dig | 0 | 1 | 450 | 1 | 6 | 9, aiRack 1 | digLen 180, digR 12, warheads 5, subDmg 44, subRadius 28 |
| `riotcharge` | Riot Charge | Clears dirt around your own tank. | Digs you out: a wide, short scoop in front of the barrel and over the hull. | riot | 0 | 45 | 60 | 3 | 1 | 2 | fan 1.2 |
| `riotblast` | Riot Blast | A longer clearing charge. | A long, narrow cut along the barrel: a firing lane through a hill. | riot | 0 | 90 | 120 | 2 | 3 | 4 | fan 0.6 |
| `riotbomb` | Riot Bomb | A bomb that removes dirt without hurting. | A harmless crater where it lands. Drops tanks for fall damage. | shot | 0 | 45 | 100 | 3 | 2 | 5 | speed 1.0 |
| `heavyriot` | Heavy Riot Bomb | A bigger dirt-removing bomb. | A huge harmless crater. | shot | 0 | 75 | 220 | 2 | 4 | 7 | speed 1.0 |
| `disrupter` | Earth Disrupter | Makes suspended dirt fall. A heightmap has no suspended dirt. | Shakes the ground loose: within its radius, every steep slope slumps, so tanks on ridges and cliff edges drop. | slump | 0 | 120 | 260 | 1 | 5 | 8, aiRack 1 | slope 1.0, passes 24 |

#### PR 4: Fire

| key | name | SE (as remembered, unverified) | Our take | effect | dmg (per tick) | radius | price | pack | minRound | ai | other |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `napalm` | Napalm | Burning liquid that runs downhill and burns what it reaches. | Pools in the low ground where it lands and burns for 3 s. Up to 36 damage to a tank sitting in it. | napalm | 6 | 1 | 300 | 2 | 4 | 6 | volume 2200, burn 3.0, tick 0.5, flame 18 |
| `hotnapalm` | Hot Napalm | Hotter, bigger napalm. | A bigger, taller pool that burns for 4 s, up to 80. Reaches hovering drones. | napalm | 10 | 1 | 550 | 1 | 6 | 9, aiRack 1 | volume 3200, burn 4.0, tick 0.5, flame 26 |

A shield absorbs the first burn tick on its owner whole, then it is gone. A bunker halves each tick (minimum 1). Kills and score from burns are credited to the shooter, as for blasts.

### Drone gun choice (new in PR 1, extended by each family)

The aim search stays as it is per planning arc (`arcGuns` dedupes by `flightKey`). It now keeps the **best aim per arc** instead of one global best. Then, for each loaded gun, `aiHarm(world, arsenal, t, target, wkey, aim)` predicts:

- **Blast** (PR 1): `blastDamage(dmg, d, radius)` on the target's box centre at the predicted landing, plus, for `pellets`, `hop`, `scatter` and `cluster`, the extra munitions it predicts. `pellets` and `cluster` count `pellets` or `split` times the sub blast at `d + fan spread at that distance` (a closed form, no extra flights). `hop` and `scatter` count only the first burst plus a fixed share, `AI_SUB_SHARE = 0.35`, of their sub-munitions' total. **Self-harm guard:** if the predicted burst's reach (`radius + 14`, or the sub-munitions' spread) covers the drone's own box, the gun scores −Infinity.
- **Fall** (PR 1 hook, real from PR 3): apply the gun's terrain operation to a copy of the terrain at the predicted landing (crater, dig path, riot cut, slump), then compute the target's drop and `fallDamage(drop)` from the fall-damage PR. The same calculation for the drone itself is subtracted.
- **Beam / plasma** (PR 2): no arc. A beam is aimed geometrically, `angle = round(deg(datan2(...)))` to the target box centre at power 100, and scores `dmg` per unit on the line inside its reach (rivals minus self). Plasma scores the summed `blastDamage` to rivals within `radius` at power 100, and is chosen only when that sum is above the best ballistic harm.
- **Burial** (PR 3): `dirt` and `pour` score `AI_BURY = 30` when the predicted terrain leaves a ground-unit target buried by more than 12 px, and 0 otherwise. Drones are never buried, so dirt never targets a drone. **Dig out:** drones are never buried. A buried human seat whose turn the battery fires (auto-fire on a timeout) fires its first `riot` gun in rack order if it holds one, and otherwise its best gun.
- **Burn** (PR 4): run the pour at the predicted landing on a terrain copy and sum the tick damage over the ticks for each rival in the flames, minus self.

The gun with the highest harm wins. Ties go to rack order. Harm 0 everywhere falls back to the closest-landing arc's first gun (today's behaviour). **Glory** takes the max-harm gun even if its arc lands worse. **Lobber** keeps its area filter (`pellets`, `cluster`, `scatter`, `hop`, `napalm`, or radius ≥ 40). Wobble applies to every choice as today, so beams miss like shells do. Tracers are `ai: false`: drones compute their flights and have no use for a path shown on screen.

`droneRack` / `room_ai_rack` loads `aiRack` (default 2) of each `ai: true` gun from `aiRound`.

### Rooms wire (new events)

Every event carries `at` (seconds into the volley) like today:

| event | Fields | Client action |
|---|---|---|
| `shot` (existing) | as today; `hop`/`scatter` children are ordinary `shot`s with `t0` | as today |
| `beam` | `by, w, x0, y0, x1, y1` | draw the beam; carve with the shared `beamCarve` |
| `plasma` | `by, w, x, y, r` | ring effect |
| `dirt` | `w, x, y, r` | `addDirt` |
| `pour` | `w, x, v` | `pourLevel`, then fill (Liquid Dirt) |
| `dig` | `by, w, p, r` | carve along the path `p` |
| `riot` | `by, w, x, y, a, r, fan` (`a` = barrel angle in radians, world frame) | `riotCarve` |
| `slump` | `w, x, r, slope, passes` | `slumpGround` |
| `fire` | `w, x, v, flame, until` | `pourLevel`, then draw flames until `until` |

`hit`/`kill` events from burns are stamped at their tick time.

### Visuals

`game.yaml` `effects` gets an entry per new key (muzzle, trail, impact, and specials where useful). A family PR may add a new special name to `TANKITY_FX_SPECIALS` only with its engine hook: `hop` (each leap), `scatter`, `dig` (the burrow dust, a rate emitter), `beam`, `pour`, `burn` (a rate emitter over the pool). New gfx `painter` values for icons: `drill` (diggers and sandhogs), `clod` (dirt), `flame` (napalm), `dash` (tracers). New gfx field `mark`: `line` or `smoke`, for tracers only.

New Blender sheets, all additive in `render_fx.py`, each family adding its own `--only` names:

- PR 1: none required (fireball/shock/mushroom suffice). Baby Nuke uses `mushroom` at a smaller scale.
- PR 2: `beam` (a glowing streak, neutral grey to tint) and `plasma` (a radial energy ring, neutral).
- PR 3: `dirt` (a natural-colour clod and spray burst). Reuse the overhaul's debris sheet if it has one.
- PR 4: `flame` (a looping natural-colour flame tongue, anchor bottom).

Budget: under 600 KB of new sheets across all four PRs, 8-bit quantized as today.

---

## Rulings

1. **Order kept: Blast → Beams → Earth → Fire.** Fire depends on Earth's pour algorithm and burial. Earth depends on the fall-damage PR. Blast introduces the harm-based gun choice that every later family extends, so it goes first. Beams are independent and could swap with Blast, but they gain nothing by going first.
2. **No Missile or Baby Missile** (covered by the free Shell and by Mortar); see the overlaps table.
3. **Tunnels are trenches.** The terrain is a heightmap with no overhangs, so diggers cut a trench open to the sky, and Earth Disrupter becomes "slump the slopes" (SE's suspended dirt cannot exist here).
4. **Burial is derived, not stored.** A ground unit below the surface is buried; nothing mid-round lifts it. Drones hover and ride rising ground.
5. **Harmless rows** (`dmg: 0`) touch no unit, so they spend no shields.
6. **Laser** hits every unit on its line once, with flat damage and no doubling. **Plasma** spares its firer and carves nothing.
7. **Napalm** never changes the ground. Its pool is computed once at the burst from the terrain at that moment. It does not spread further, and it does not cause falls.
8. **Tracers are `ai: false`.** All other new guns are `ai: true` with a staggered `aiRound`. Big single packs get `aiRack: 1`.
9. **Roller moves to a new Rollers shop category** with its two siblings. The other existing rows keep `cat: Shells`.
10. **Gun choice by predicted harm** replaces "first gun of the best arc". This changes drone behaviour on `main` (drones now fire Mortar/Heavy where they used to fire Shell on the same arc), so ai-aim vectors and possibly `ai-hitrate` expectations are regenerated in PR 1. Hit-rate measures landings, which do not change for a same-arc swap.

---

## PR 1: Blast (`games/tankity-arsenal-blast`)

### Task 1.1: Validator: dmg 0, `aiRack`, `hop`, `scatter`, `apex`, Rollers category

**Files:** `tools/game-json.php`, `test/php/GameJsonTest.php`, `game.yaml` (header comment only in this task)

- [ ] Failing tests in `GameJsonTest`:
  - `dmg: 0` is accepted.
  - `dmg: -1` and `dmg: 501` are refused.
  - `effect: hop` without `hops` names the missing field; `hops: 7` is out of range.
  - `effect: scatter` requires `split, fan, kick, subDmg, subRadius`.
  - `apex: true` is accepted on `cluster` only, and makes `fuse` optional.
  - `aiRack` is accepted, 1..9.
- [ ] Implement:
  - Extend `TANKITY_AMMO_EFFECTS`, the `$needs` table (line ~704), the allowed-keys list (line ~713) and the ordered-keys output.
  - `dmg` range 0..500.
  - `apex` bool; cluster's `fuse` is required only when `apex` is not true.
- [ ] Document the new effects and fields in the `game.yaml` header (the ammo row fields block). Current state only.
- [ ] Run: `cd websites/www.cs && vendor/bin/phpunit -c phpunit.xml --testsuite tankity --filter GameJson`.
- [ ] Commit.

### Task 1.2: Harmless blasts (TS + PHP)

**Files:** `src/sim.ts` (`explode`), `server/sim.php` (`room_explode`), `protocol/sim-vectors.php`, `test/sim-vectors.test.mjs`, `test/php/RoomsSimTest.php`

- [ ] Failing vectors (`blast` group):
  - `dmg 0` next to a shielded human: shield kept, hp unchanged, crater carved.
  - `dmg 0` next to a drone: no `lastHitBy`, no `dealt`.
  - A PHPUnit case asserting that no `hit` event appears.
- [ ] Implement: `explode`/`room_explode` skip the unit loop when `dmg0 === 0` (after carving).
- [ ] `make sim-vectors` (docker), then `node --test test/sim-vectors.test.mjs`.
- [ ] Commit.

### Task 1.3: `hop` (Leapfrog) in both sims

**Files:** `src/sim.ts`, `server/sim.php` (`room_fire_shot`, `room_fly_arc`), `protocol/sim-vectors.php`, `test/sim-vectors.test.mjs`

- [ ] Interface (TS): export `hopShell(s: Shell, w: Weapon, x: number, y: number, reach: number): Shell | null`.
  - It returns the next warhead with `order: [...s.order, 0]`, `dw/dr` from `subDmg/subRadius`, `age: 0`, `hop: (s.hop || 1) + 1`.
  - It returns null when `(s.hop || 1) >= w.hops`.
- [ ] Interface (PHP): `room_hop_vel(float $vx, float $vy, float $keep): array`.
- [ ] Also PHP: a loop in `room_fire_shot`. After a `hit` from a `hop` weapon, fly the next arc from `[x, y - 1]` with that velocity and `$sub`. Emit a `shot` event with `t0` = the previous landing time.
- [ ] Shell type: add an optional `hop?: number`.
- [ ] Failing vectors:
  - `hop-vel` for several velocities.
  - Volleys `leapfrog-down-a-slope` (three bursts walk downhill).
  - `leapfrog-direct-hit-hops-on`.
  - `leapfrog-second-hop-leaves-the-field` (the chain ends).
- [ ] TS stepShells: on a hop weapon's burst (ground or direct), push `hopShell(...)` if non-null, then mark the parent dead.
- [ ] The `split`-like StepEvent `{kind: 'hop', wkey, x, y, ang}` drives the fx special.
- [ ] Implement, then regenerate vectors in docker, then run the tests.
- [ ] Commit.

### Task 1.4: `scatter` (Funky Bomb) in both sims

**Files:** as in Task 1.3.

- [ ] Interface:
  - TS `scatterShells(s: Shell, w: Weapon, x: number, y: number, reach: number): Shell[]`, using the funky pattern from Design.
  - PHP `room_scatter_vel(int $n, float $fan, float $kick): array`.
- [ ] Failing vectors:
  - `scatter-vel` (n = 2, 8, 12).
  - Volleys `funky-on-flat`, `funky-in-a-pit` (bomblets burst on the pit walls at once), and `funky-direct-hit`.
- [ ] Bomblets start at `y - 2` with age 99 on the server (as cluster bomblets do), and `split: true` in TS (ground-burst at once).
- [ ] Implement, regenerate, run, commit.

### Task 1.5: Cluster `apex` (Death's Head)

**Files:** `src/sim.ts` (stepShells cluster branch), `server/sim.php` (`room_fly_arc` split condition), vectors.

- [ ] Failing vectors:
  - `deathshead-splits-at-apex` (split point at the arc's top within one step).
  - `deathshead-fired-downhill-splits-at-0.1s`.
- [ ] Split condition (both languages): `w.apex ? (s.age >= 0.1 && s.vy >= 0) : s.age >= fuse`. The PHP split-check order must match the TS order: after the ballistic step, before the hit sweep.
- [ ] Implement, regenerate, run, commit.

### Task 1.6: `aiRack`

**Files:** `src/sim.ts` (`droneRack`), `server/ai.php` (`room_ai_rack`), `server/sim.php` (`room_weapons` adds `aiRack`, plus the `apex`, `hops`, `hopKeep`, `kick` fields), vectors (`rack` cases), `test/solo.test.mjs`

- [ ] Failing tests:
  - Round 9 rack: Death's Head 1, others 2.
  - The `room_weapons` defaults for every new field match TS defaults.
- [ ] Implement, regenerate, run, commit.

### Task 1.7: Drone gun choice by predicted harm

**Files:** `src/ai.ts`, `server/ai.php`, new pure helper `aiHarm` in `src/ai.ts` / `room_ai_harm` in `server/ai.php`, `test/ai-search.test.mjs`, `test/ai-arcs.test.mjs`, `test/php/AiArcsTest.php`, vectors (`ai-aim`, `ai-harm`)

- [ ] Interface:
  - TS: `export function aiHarm(world: World, arsenal: Arsenal, self: Tank, target: Tank, wkey: string, land: {x: number; y: number; oob: boolean}): number`.
  - PHP: `room_ai_harm(array $room, array $self, array $target, string $wkey, array $land): float`.
  - Blast term, self-harm guard, sub-munition terms and `AI_SUB_SHARE` as in Design. Fall term: return 0 until PR 3 (a `fallHarm` stub that is the identity 0), tested to exist.
- [ ] `aiChoose` / `room_ai_choose`: the search records `bestByArc[flightKey]`. After the search, each loaded gun is scored at its arc's best aim, and the max-harm gun is picked (ties go to rack order). If every harm is ≤ 0, keep today's pick. Glory uses max harm. Lobber's area filter adds `hop`, `scatter`, `napalm` by effect.
- [ ] Failing vectors (`ai-harm`):
  - Mortar beats Shell on the same arc.
  - Baby Nuke refused when the drone stands within reach of the landing.
  - Funky beats Shell on a near miss.
- [ ] Failing vectors (`ai-aim`): a mixed rack picks the predicted gun.
- [ ] `test/ai-search.test.mjs`: the time budget holds with the full round-9 rack.
- [ ] Implement, regenerate (`make sim-vectors`), run `node --test test/ai-*.test.mjs` and `--filter AiArcs`. If `ai-hitrate` moves, read the README note about the easy 1440 cell before retuning.
- [ ] Commit.

### Task 1.8: Arsenal rows and effects

**Files:** `game.yaml` (six ammo rows per the PR 1 table; Roller `cat: Rollers`; `effects` entries for each new key), `game.json`, `src/ui/icons.ts` (if a painter is needed: none in PR 1), `README.md`

- [ ] Failing test: `test/smoke.test.mjs` already demands muzzle/trail/impact effects for every weapon; adding the rows first makes it fail.
- [ ] Add the effects:
  - `leapfrog` and `funky` get a `hop` / `scatter` special.
  - `deathshead` uses the `split` special.
  - `babynuke` gets the mushroom at scale 0.9 with a smaller flash.
- [ ] Add `hop` and `scatter` to `TANKITY_FX_SPECIALS`, and trigger them from `match.ts` (solo StepEvents) and `replay.ts` (rooms: a `shot` with `t0 > 0.01` whose weapon effect is hop/scatter plays the special at its first point).
- [ ] `php tools/game-json.php`, then `node _kit/build/build.mjs tankity`, then `php tools/install-files.php`.
- [ ] Commit.

### Task 1.9: Firing range, label and picker

**Files:** `src/preview.ts` (hop, scatter, apex split), `src/weapon-label.ts` (unchanged for blasts), `test/preview.test.mjs`, `tests/e2e/tankity-fx-range.spec.mjs` (if it enumerates weapons)

- [ ] Failing `preview.test`: Leapfrog shows three bursts, and Funky shows 1 + 8.
- [ ] Implement by calling the exported `hopShell` / `scatterShells` from `sim.ts`, not by copying them.
- [ ] Commit.

### Task 1.10: Gate and PR

- [ ] `bash websites/www.cs/games/tankity/test.sh`.
- [ ] `make test` (docker, own project).
- [ ] `make e2e E2E_ARGS="tankity-fx-range tankity-pickers"`.
- [ ] Tear down.
- [ ] README: the arsenal count, sim-vectors "Covered" (hop, scatter, apex, harmless blasts, gun choice), and the `server/ai.php` row.
- [ ] Open the PR through `foundry:pr-fix-loop`.

---

## PR 2: Beams and tracers (`games/tankity-arsenal-beams`)

### Task 2.1: Validator

**Files:** `tools/game-json.php`, `GameJsonTest.php`, `game.yaml` header

- [ ] Failing tests:
  - `beam` requires `range`.
  - `plasma` has no extra fields.
  - `tracer` requires `dmg: 0` and accepts `radius: 0`, and any other effect refuses `radius: 0`.
  - The gfx `mark` field is allowed only with `tracer`, and the `dash` painter is accepted.
- [ ] Implement, commit.

### Task 2.2: `beam` in both sims

**Files:** `src/sim.ts` (new `fireBeam(world, arsenal, t, w): {x0, y0, x1, y1, hits: Blast}`), `server/sim.php` (`room_fire_beam`), `server/rules.php` (`room_fire_shot` branches on effect `beam` before the pellet loop), vectors, `RoomsSimTest`

- [ ] Shared:
  - The ray is marched in 3 px steps from the muzzle by `(dcos(a) * s, -dsin(a))`.
  - Each unit is hit at most once; reuse the `explode` bookkeeping via a new `hitUnit(world, owner, t, dmg, wkey)` that both `explode` and the beam call (factored out of `explode` in this task, with the PHP twin `room_hit_unit`).
  - Carve every `radius` px. Stop at `range * power / 100 * fieldReach` or the field edge.
- [ ] Failing vectors:
  - `laser-through-two-drones` (both hit once).
  - `laser-short-power-stops-short`.
  - `laser-through-a-hill` (channel carved).
  - `laser-into-shield`.
- [ ] Solo: `fireWeapon` handles `beam` by resolving at once (no shells). The match flow goes straight to settle. A `StepEvent` of `{kind: 'beam', ...}` is returned from a new `fireNow` path that `match.ts` plays.
- [ ] Implement, regenerate, run, commit.

### Task 2.3: `plasma` in both sims

**Files:** as in Task 2.2 (`firePlasma` / `room_fire_plasma`).

- [ ] Failing vectors:
  - `plasma-spares-firer`.
  - `plasma-power-30-small-ring`.
  - `plasma-min-radius-20`.
  - `plasma-no-crater`.
- [ ] Implement via `hitUnit` with `blastDamage` falloff.
- [ ] Commit.

### Task 2.4: `tracer` in both sims

- [ ] Failing vectors:
  - `tracer-volley` (terrain unchanged, no hp change).
  - The server emits `shot` with `r: 0` and no `burst`/`fizzle`/`hit`.
- [ ] TS stepShells: a tracer that lands is marked dead with a `{kind: 'mark', ...}` StepEvent (no blast).
- [ ] The solo flow treats a volley with no blast like a fizzle.
- [ ] Commit.

### Task 2.5: Drones aim beams and plasma

**Files:** `src/ai.ts`, `server/ai.php`, vectors (`ai-aim` beam cases)

- [ ] `aiHarm` gains the beam and plasma terms (Design). The beam angle uses `datan2`. Degrees come from `r / PI * 180` (not `* Math.PI / 180`, which the determinism test bans), then `Math.round` / `det_round`. Power is 100.
- [ ] Failing vectors:
  - A drone with Laser and a rival in line picks Laser at the computed angle.
  - A drone with Plasma and a rival 40 px away picks Plasma.
  - A drone with Plasma and rivals 300 px away does not.
- [ ] Commit.

### Task 2.6: Wire, replay, room client

**Files:** `src/protocol.ts` (event types), `server/protocol.php`, `protocol/generate.php` / `scenarios.php` (a beam scenario), `src/replay.ts` (route `beam`, `plasma`), `src/room.ts` (draw and carve), `test/replay.test.mjs`, `test/protocol.test.mjs`

- [ ] Failing replay test: a `beam` event at `at = 0` carves the client terrain exactly as `fireBeam` did.
- [ ] Regenerate fixtures in docker (`make protocol`).
- [ ] Commit.

### Task 2.7: Rows, effects, sheets, label, preview

**Files:** `game.yaml` (four rows, Beams and Tracers cats, effects), `fx/blender/render_fx.py` (`beam`, `plasma` builders, `--only` names), `fx/sprites/*`, `fx/CREDITS.md`, `src/fx/engine.ts` (the `beam` special and tracer `mark` rendering, with the line kept for the owner until their next shot in solo and in rooms), `src/render.ts`, `src/ui/icons.ts` (`dash` painter), `src/weapon-label.ts` + `test/weapon-label.test.mjs`, `src/preview.ts` + `test/preview.test.mjs`

- [ ] Weapon label line:
  - `dmg: 0` reads `no damage · <kind>`, where the kind is a word from the effect: `tracer` → "path", `beam` → "beam", and terrain effects come in PR 3.
  - A beam reads `45 dmg · beam`.
  - Failing test first.
- [ ] Render sheets: `/opt/homebrew/bin/blender -b -P render_fx.py -- --only beam,plasma --out ../sprites` (from `fx/blender`), then check sizes.
- [ ] Gate (as in Task 1.10). Open the PR.

---

## PR 3: Earth (`games/tankity-arsenal-earth`, after fall damage merges)

### Task 3.0: Read the fall-damage interface

- [ ] Read the merged fall-damage code. Record its formula function, its settle function and its credit path (TS and PHP names) in this task's commit message notes.
- [ ] Every terrain op below calls that settle with the op's owner as the creditor. If the fall PR exposes no owner parameter, add one (with its own vectors) before going on.

### Task 3.1: New rule modules and the determinism scan

**Files:** new `src/earth.ts`, `server/earth.php`, `rooms.php` (require after `sim.php`), `test/determinism.test.mjs` (add both), `test/php/rooms-lib.php` (if it lists requires)

- [ ] Failing: the determinism test lists `src/earth.ts` / `server/earth.php` (run it after creating empty modules with a header comment).
- [ ] Commit.

### Task 3.2: Terrain ops (pure, both languages)

**Files:** `src/earth.ts`, `server/earth.php`, vectors (`earth` group), `test/sim-vectors.test.mjs`

- [ ] Interfaces (TS; PHP twins named `room_add_dirt`, etc., taking `array &$terrain`):
  - `addDirt(terrain: number[], x: number, y: number, r: number): void`
  - `pourLevel(terrain: readonly number[], x: number, volume: number): { level: number; x0: number; x1: number }`
  - `fillPour(terrain: number[], p: { level: number; x0: number; x1: number }): void`
  - `slumpGround(terrain: number[], x: number, r: number, slope: number, passes: number): void`
  - `digPath(world, s: Shell, w: Weapon): { path: [number, number][]; stop: Tank | null; x: number; y: number }` (carves as it goes)
  - `riotCarve(terrain: number[], hx: number, hy: number, a: number, dirS: number, r: number, fan: number): void`
  - `buried(t: Tank, terrain): boolean`
- [ ] Failing vectors per function. Edge cases:
  - Dirt at the field edge.
  - Dirt below the surface (no change).
  - Pour into a V valley; pour on a slope spilling off the edge.
  - Pour of zero volume.
  - Slump of a cliff, conserving the total within 1e-9.
  - Dig into a hill and out the other side.
  - Riot at the left edge facing left.
- [ ] Commit per function pair.

### Task 3.3: Burial (no lifting mid-round)

**Files:** `src/sim.ts` (`fallTanks`), `src/solo.ts` (`snapTanks`), `src/match.ts` (drive refuses while buried), `src/ai.ts` (the firing-spot shuffle sets `y` from the surface only for drones, which ride the ground), `server/sim.php` (`room_settle_tanks`), `server/rules.php` (drive action), tests: `test/fixed-step.test.mjs`, `test/solo.test.mjs`, vectors (`settle` group), `RoomsSimTest`

- [ ] Failing tests:
  - A ground unit under fresh dirt keeps its y through `fallTanks` and `room_settle_tanks`.
  - A drone under fresh dirt rides up.
  - A buried tank's drive is refused with a log line.
  - A new round places it on the hills.
  - A buried tank's Shell bursts in the dirt above it and carves (volley vector `buried-fires-shell`).
- [ ] Implement, regenerate, run, commit.

### Task 3.4: Effects `dirt`, `pour`, `dig`, `riot`, `slump` in both sims

**Files:**
- `src/sim.ts`: stepShells branches by effect at burst; a burrowing state like `rolling` (`digging`, with `dx/dy/dl`), stepped per sim step in `stepDigger` mirroring `stepRoller`; `riot` resolved at fire time like a beam.
- `server/sim.php` / `server/rules.php`: `room_fly_arc` returns `'dig'` at touchdown for dig weapons, then `room_dig_arc`; `room_fire_shot` dispatches `riot` before the pellet loop; at burst, `dirt`/`pour`/`slump` call the earth ops and emit events.
- Vectors: volley cases.

- [ ] Failing volley vectors:
  - `dirtball-buries-human`.
  - `dirtcharge-hurts-then-buries`.
  - `liquiddirt-fills-valley-buries-two`.
  - `digger-under-tank-drops-it` (with the fall damage credited to the shooter).
  - `sandhog-three-warheads`.
  - `sandhog-stops-at-tank`.
  - `riotcharge-digs-out-buried-tank`.
  - `riotbomb-harmless-crater-drops-tank`.
  - `disrupter-slumps-ridge-tank-falls`.
  - `disrupter-self-fall-credits-nobody`.
- [ ] Ordering: a sandhog's warheads burst in order along the path, and every child has `order: [...parent, k]`.
- [ ] Implement, regenerate, run, commit (one commit per effect).

### Task 3.5: Drones use earth sensibly

**Files:** `src/ai.ts`, `server/ai.php`, vectors (`ai-harm`, `ai-aim`)

- [ ] `aiHarm`:
  - The fall term is now real: apply the op on a copy and use the fall-damage formula for the target and for self.
  - The burial term is `AI_BURY = 30`.
  - The riot rule: a buried human seat fired by the battery fires its first `riot` gun in rack order.
- [ ] Failing vectors:
  - The digger is chosen when the target sits on a ridge above a deep trench path.
  - Dirt Ball is chosen against a full-hp human in a dip that a Shell cannot kill.
  - Dirt is never aimed at a drone.
  - The disrupter is refused when the drone itself stands on a slope in reach.
  - An auto-fired buried human seat fires Riot Charge when it holds one.
- [ ] Commit.

### Task 3.6: Wire, replay, room client

**Files:** `src/protocol.ts`, `server/protocol.php`, `protocol/scenarios.php` (dirt, dig, riot, slump, pour scenarios), `src/replay.ts`, `src/room.ts`, `test/replay.test.mjs`, `test/protocol.test.mjs`

- [ ] Failing replay tests: each event mutates the client terrain to exactly the server's (`make protocol` fixtures carry the server terrain after the volley).
- [ ] Commit.

### Task 3.7: Rows, effects, sheets, label, preview, picker icons

**Files:** `game.yaml` (16 rows, cat Earth; effects with `dig` and `pour` specials), `fx/blender/render_fx.py` (`dirt` sheet unless the overhaul's debris fits), `src/ui/icons.ts` (`drill`, `clod`), `src/weapon-label.ts` (`no damage · earth`, and `20 dmg · L` for Dirt Charge), `src/preview.ts` (dirt, pour, dig, riot, slump on the range: a dummy that gets buried, dropped or dug out), `test/preview.test.mjs`, `README.md`

- [ ] Gate (as in Task 1.10), with the e2e pair `tankity-fx-range tankity-rooms-play`. Open the PR.

---

## PR 4: Fire (`games/tankity-arsenal-fire`)

### Task 4.1: Validator and module

**Files:** `tools/game-json.php` (`napalm`: `volume, burn, tick, flame`), `GameJsonTest.php`, new `src/fire.ts` and `server/fire.php`, `rooms.php`, `test/determinism.test.mjs`

- [ ] Failing tests first, as in Tasks 2.1 and 3.1.
- [ ] Commit.

### Task 4.2: Burning pools (pure)

**Files:** `src/fire.ts`, `server/fire.php`, vectors (`fire` group)

- [ ] Interfaces:
  - `firePool(terrain, x, volume): Pool`, which reuses `pourLevel` from `earth.ts` on a copy and returns `{level, x0, x1, flame}`.
  - `inFlames(pool, t: Tank): boolean` (box bottom ≥ `level - flame` over any pooled column in `[box.cx - rx, box.cx + rx]`).
  - `burnTicks(w): number` = `floor(burn / tick + 1e-9)`.
- [ ] Failing vectors:
  - A pool in a valley.
  - A pool on flat ground (thin and wide).
  - A tank on the rim just outside.
  - A drone over the pool, inside for `hotnapalm` and outside for `napalm` (flame 26 vs 18 against the drone box bottom at y − 16).
- [ ] Commit.

### Task 4.3: Napalm in both sims

**Files:**
- `src/sim.ts`: `World.fires: Fire[]`; `stepShells` creates a fire at a napalm burst; `stepFires(world, arsenal, dt): StepEvent[]` ticks per sim step, counting steps, not seconds (`tick * 60`, rounded).
- `src/match.ts`: the settle waits while `fires.length`.
- `server/rules.php` `room_fire_shot`: after a napalm `hit`, emit `fire`, then resolve every tick inline, stamping `hit`/`kill` events at `landing + k * tick`. The pace stamp covers `until`.
- Vectors (volleys).

- [ ] Failing volley vectors:
  - `napalm-in-a-valley-burns-two`.
  - `napalm-shield-eats-first-tick`.
  - `napalm-bunker-halves`.
  - `napalm-kills-credit-shooter`.
  - `napalm-burns-own-gunner-no-score`.
  - `hotnapalm-reaches-drone`.
- [ ] Solo: a test in `test/match-local.test.mjs` that the turn does not pass while a fire burns.
- [ ] Commit.

### Task 4.4: Drones use napalm

- [ ] `aiHarm` burn term (Design).
- [ ] Failing vectors:
  - Napalm is chosen against two rivals sharing a valley.
  - It is refused when the drone's own column is in the predicted pool.
- [ ] Commit.

### Task 4.5: Wire, replay, rows, effects, sheets

**Files:** `src/protocol.ts`, `server/protocol.php`, `protocol/scenarios.php` (a napalm scenario), `src/replay.ts` (a `fire` event starts the flames and keeps the volley open until `until`), `src/room.ts`, `game.yaml` (two rows, cat Fire, effects with a `burn` special rate emitter), `fx/blender/render_fx.py` (`flame` sheet), `src/ui/icons.ts` (`flame` painter), `src/weapon-label.ts` (`6 dmg/tick · fire`), `src/preview.ts` (napalm on the range), tests for each, `README.md`, `fx/CREDITS.md`

- [ ] Gate (as in Task 1.10), with the e2e pair `tankity-fx-battle tankity-rooms-play`. Open the PR.

---

## Run commands (reference)

```bash
# per worktree, once
SDD=/Users/wgrim/Documents/Repositories/siue/.superpowers/sdd/2026-10-13-tankity-se-arsenal
export COMPOSE_PROJECT_NAME=$(cat $SDD/compose-project-name-<family>)   # one per PR worktree
cd websites/www.cs && make up

# quick loop (tankity folder)
node --test test/sim-vectors.test.mjs test/ai-search.test.mjs
cd ../.. && vendor/bin/phpunit -c phpunit.xml --testsuite tankity --filter 'RoomsSim|AiArcs|GameJson'

# regenerate (docker only)
make sim-vectors && make protocol

# build + gate
cd games && node _kit/build/build.mjs tankity && cd tankity && php tools/game-json.php && php tools/install-files.php
bash test.sh && cd ../.. && make test && make e2e E2E_ARGS="tankity-fx-range tankity-pickers"
docker compose -p "$COMPOSE_PROJECT_NAME" down -v
```
