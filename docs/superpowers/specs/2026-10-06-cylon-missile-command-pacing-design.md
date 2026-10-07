# Cylon Missile Command pacing + bot pressure

Date: 2026-10-06  
Site: `websites/www.cs` (Cylon defense mini-game)

## Goal

Make inbound threats feel like Missile Command: nukes appear occasionally (not every 10 hits), smaller missiles appear more often (2× damage), most missiles aim at recent pointer/finger ground, occasional trackers chase the reticle and look different, and bot count rises with KO score so grenades matter more mid-run.

## Decisions (locked)

- Approach: **dual schedulers** (missile timer + nuke timer) + **KO-tier bot cap**.
- Small-missile aim mix: **~75–80% ground-locked** to recent aim sample; **~20–25% live trackers**.
- Cadence: **ramps** from sparse → snappy with run time + KO score.
- Bot hard cap: **30 desktop / 10 mobile**; start at 4; **+1 every 5 KOs**.
- Tracker missiles must be **visually distinct** from ground missiles.
- Remove hit-triggered nukes (`HITS_PER_NUKE` / `registerHit` → `launchNuke`).

## Behavior

### Hits and endings

- Bot bolt hit: `+1` hit (unchanged).
- Small missile splash on player: `+2` hits (not instant game over).
- Nuke direct hit: still ends the run (`fromNuke` / nuke reason).
- `MAX_HITS` (30) still ends the run on accumulated hits.
- No nukes spawned from hit count milestones.

### Small missiles

- Spawn on a dedicated timer while Game On.
- Interval lerps with difficulty `d ∈ [0,1]`:
  - Early (`d≈0`): ~8–14s between missiles
  - Late (`d≈1`): ~5–10s
- At launch, roll mode:
  - **Ground (~75–80%):** lock target to `lastAim` (pointer/finger position sampled from recent aim updates). Fallback to current aim if no recent sample.
  - **Tracker (~20–25%):** chase live reticle/mouse for the flight (like today’s nuke steering, but smaller/faster).
- On detonation: modest blast radius; if player aim is inside, `registerHit(2)` (not `fromNuke`).
- Punch a destruction hole at impact (reuse existing `punchHole` / medium or small preset).
- At most **one** small missile in flight; next schedule starts after impact or cancel.

### Nukes

- Separate rarer timer while Game On and `settings.nukesEnabled`.
- Interval lerps with `d`:
  - Early: ~25–40s
  - Late: ~18–30s
- Flight/detonation behavior stays as today (chase aim, large FX, direct hit ends run).
- At most **one** nuke in flight; eye disorient (post-Raptor) blocks nuke launch (unchanged intent).
- Small missiles also blocked while eye disoriented (fairness).

### Difficulty factor

- `d` combines normalized run time (toward ~3–4 minutes) and KO score (toward ~40 KOs), clamped to `[0,1]`.
- Used only to lerp inbound intervals (and optionally slight missile speed); not required for bot cap (bots use KO tiers).

### Bot pressure

- `botCap() = min(hardCap, 4 + floor(koScore / 5))`
- `hardCap = coarsePointer ? 10 : 30`
- `spawnBot` / `launchWave` use `botCap()` instead of a fixed `MAX_BOTS = 4`.
- Wave sizing may use more of the available room as cap grows so grenades become more useful.

## Visual / audio

| Threat | Look | Sound |
|--------|------|--------|
| Ground missile | Slim warm/orange streak to locked point; small blast | Short whoosh + small crack |
| Tracker missile | Cyan/magenta pulse, thicker seeking trail, optional lock pip | Same family, slightly sharper whoosh |
| Nuke | Existing large missile + mushroom | Existing large explosion |

No new audio sample files — procedural Web Audio on `sfxBus`.

## UI / help

- Update How to Play: occasional nukes; smaller missiles deal 2 hits; trackers look different and chase; bot numbers rise with KOs.
- Hits HUD unchanged (numeric). No required new counters.

## Lifecycle / edges

- Timers start when Game On; clear on Game Off / game over.
- Pause (How to Play): freeze inbound schedules (same pause skew / clear-and-reschedule pattern as hole timers / cooldowns).
- `nukesEnabled` off: no nuke timer launches; **small missiles still run**.
- Prefer single-flight for each class (missile / nuke) to avoid spam.

## Non-goals

- Player-fired anti-missile batteries (classic Missile Command cities).
- Changing MAX_HITS or high-score format.
- Shipping audio samples.
- Making every missile a tracker.

## Testing

- After 10 hits: **no** automatic nuke (old behavior gone).
- Game On idle: small missiles appear; nukes rarer; intervals tighten later in a run / with KOs.
- Ground missile targets recent pointer/finger spot; moving away before impact avoids the +2.
- Tracker looks distinct and follows reticle; dodge still works.
- Desktop: bot cap can climb toward 30 with KOs; mobile hard-stops at 10.
- Nukes toggle off: missiles continue, nukes stop.
- Pause freezes inbound; Game Off clears in-flight FX and timers.
- Hard-refresh after deploy with cache-bust.

## Files

- `websites/www.cs/main.js` — schedulers, missile entity, botCap, remove hit-nuke trigger
- `websites/www.cs/custom.css` — `.cylon-missile`, `.cylon-missile.is-tracker`
- `websites/www.cs/index.html` — How to Play copy + cache-bust
