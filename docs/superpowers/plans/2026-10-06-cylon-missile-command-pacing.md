# Cylon Missile Command Pacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hit-triggered nukes with ramping dual inbound schedulers (small missiles + occasional nukes), KO-tier bot pressure, always-on nukes, and a fade-in desolate “world ended” page look while Game On.

**Architecture:** Two pause-aware timers drive small missiles and nukes; intervals lerp from a difficulty factor based on run time + KOs. Ground missiles lock a recent aim sample; trackers chase live aim and use a distinct CSS class. `botCap()` replaces fixed `MAX_BOTS`. `body.cylon-world-ended` toggles desolate content styles. Remove `nukesEnabled` entirely.

**Tech Stack:** Static HTML/CSS/JS, Web Audio (existing), no new media files. Verify with `node --check` + manual playtest.

## Global Constraints

- Dual schedulers; remove `HITS_PER_NUKE` / hit→nuke path.
- Nukes **always on** — delete Options `nukesEnabled` checkbox and setting.
- Small missiles: early ~8–14s, late ~5–10s; ~75–80% ground (last aim), ~20–25% tracker; splash `+2` hits; one in flight.
- Nukes: early ~25–40s, late ~18–30s; chase aim; direct hit ends run; one in flight.
- Eye disorient blocks nukes **and** small missiles.
- Bot cap: start 4, +1 every 5 KOs; hard cap **30 desktop / 10 mobile** (`coarsePointer`).
- Tracker missiles visually distinct (cyan/magenta pulse + thicker trail).
- Game On: `cylon-world-ended` ashy + cracked content with **~0.8–1.5s fade-in**; Game Off fades out; HUD/nav uncracked; RM = ashy only.
- Spec: `docs/superpowers/specs/2026-10-06-cylon-missile-command-pacing-design.md`

## File map

| File | Role |
|------|------|
| `websites/www.cs/main.js` | Schedulers, missile flight, botCap, lastAim, world-ended class, remove nukesEnabled / hit-nuke |
| `websites/www.cs/custom.css` | Missile + tracker styles; `.cylon-world-ended` desolate + fade |
| `websites/www.cs/index.html` | Remove nukes checkbox; How to Play; missile DOM shell; cache-bust |

---

### Task 1: Remove nukes toggle + hit-triggered nukes

**Files:**
- Modify: `websites/www.cs/main.js` (settings, `registerHit`, `launchNuke`)
- Modify: `websites/www.cs/index.html` (Options checkbox + hint text)

**Interfaces:**
- Consumes: existing `launchNuke`, `registerHit`
- Produces: no `settings.nukesEnabled`; `registerHit` never calls `launchNuke`; `launchNuke` no longer checks `nukesEnabled`

- [ ] **Step 1: Remove setting and UI**

In `main.js` defaults, delete `nukesEnabled: true`.

In settings sync, delete:

```javascript
        const nukes = settingsRoot.querySelector('[data-setting="nukesEnabled"]');
        // ...
        if (nukes) nukes.checked = settings.nukesEnabled;
```

(and any change-handler branch for `nukesEnabled` if present).

In `index.html`, remove the nukes checkbox label entirely. Update the settings hint from “Survive until 30 hits or a nuke lands on you…” to mention occasional nukes/missiles (full help copy in Task 5 can refine).

- [ ] **Step 2: Strip hit→nuke and nukesEnabled guards**

In `registerHit`, remove the block:

```javascript
        if (
            !isEyeDisoriented()
            && settings.nukesEnabled
            && hitCount > 0
            && hitCount % HITS_PER_NUKE === 0
            && hitCount < MAX_HITS
        ) {
            launchNuke();
        }
```

Delete unused `const HITS_PER_NUKE = 10;`.

In `launchNuke`, change the guard from:

```javascript
        if (!isGameLive() || !settings.nukesEnabled || isEyeDisoriented() || nukeInFlight) return;
```

to:

```javascript
        if (!isGameLive() || isEyeDisoriented() || nukeInFlight) return;
```

- [ ] **Step 3: Verify**

Run: `node --check websites/www.cs/main.js`  
Expected: exit 0  
Run: `rg "nukesEnabled|HITS_PER_NUKE" websites/www.cs`  
Expected: no matches

- [ ] **Step 4: Commit**

```bash
git add websites/www.cs/main.js websites/www.cs/index.html
git commit -m "$(cat <<'EOF'
Remove hit-triggered nukes and the nukesEnabled options toggle.

EOF
)"
```

---

### Task 2: Difficulty factor, last-aim buffer, inbound schedulers

**Files:**
- Modify: `websites/www.cs/main.js`

**Interfaces:**
- Consumes: `isGameLive`, `paused` / `applyPauseTimeSkew` / `openHelp` / `closeHelp`, `koScore`, `setGameEnabled`, `launchNuke`, `isEyeDisoriented`
- Produces:
  - `let runStartedAt = 0`
  - `let lastAim = { clientX, clientY, t: 0 }`
  - `let missileTimer = null`, `let nukeTimer = null`
  - `let missileInFlight = false`
  - `difficultyFactor()` → `number` in `[0,1]`
  - `lerp(a,b,t)`, `nextMissileDelayMs()`, `nextNukeDelayMs()`
  - `scheduleMissiles(first?)`, `scheduleNukes(first?)`, `clearInboundSchedulers()`
  - `setAim` updates `lastAim`
  - `resetRunStats` / Game On sets `runStartedAt`; Game Off clears schedulers
  - Placeholder `launchSmallMissile()` that no-ops until Task 3 (or stubs a console-free empty body that reschedules)

- [ ] **Step 1: Add state + difficulty helpers** near other lets/constants:

```javascript
    const BOT_CAP_START = 4;
    const BOT_CAP_PER_KOS = 5;
    const BOT_HARD_CAP = coarsePointer ? 10 : 30;
    let runStartedAt = 0;
    let lastAim = { clientX: 0, clientY: 0, t: 0 };
    let missileTimer = null;
    let nukeTimer = null;
    let missileInFlight = false;
    let missileDueAt = 0;
    let nukeDueAt = 0;
```

```javascript
    function lerp(a, b, t) {
        return a + (b - a) * Math.min(1, Math.max(0, t));
    }

    function difficultyFactor() {
        if (!runStartedAt) return 0;
        const elapsedMin = (Date.now() - runStartedAt) / 60000;
        const timePart = Math.min(1, elapsedMin / 3.5);
        const koPart = Math.min(1, koScore / 40);
        return Math.min(1, timePart * 0.55 + koPart * 0.45);
    }

    function nextMissileDelayMs() {
        const d = difficultyFactor();
        const lo = lerp(11000, 7000, d);  // center of 8–14 → 5–10
        const span = lerp(3000, 2500, d);
        return lo - span / 2 + Math.random() * span;
    }

    function nextNukeDelayMs() {
        const d = difficultyFactor();
        const lo = lerp(32500, 24000, d); // center of 25–40 → 18–30
        const span = lerp(15000, 12000, d);
        return lo - span / 2 + Math.random() * span;
    }
```

- [ ] **Step 2: Update `setAim` to record lastAim**

At end of `setAim`:

```javascript
        lastAim.clientX = mouse.clientX;
        lastAim.clientY = mouse.clientY;
        lastAim.t = performance.now();
```

- [ ] **Step 3: Schedulers + pause integration**

```javascript
    function clearInboundSchedulers() {
        clearTimeout(missileTimer);
        clearTimeout(nukeTimer);
        missileTimer = null;
        nukeTimer = null;
        missileDueAt = 0;
        nukeDueAt = 0;
    }

    function scheduleMissiles(first = false) {
        clearTimeout(missileTimer);
        if (!isGameLive()) return;
        const wait = first ? 4000 + Math.random() * 3000 : nextMissileDelayMs();
        missileDueAt = Date.now() + wait;
        missileTimer = setTimeout(() => {
            missileTimer = null;
            if (!isGameLive() || paused) return;
            if (!isEyeDisoriented() && !missileInFlight) {
                launchSmallMissile(); // Task 3 implements
            }
            scheduleMissiles(false);
        }, wait);
    }

    function scheduleNukes(first = false) {
        clearTimeout(nukeTimer);
        if (!isGameLive()) return;
        const wait = first ? 12000 + Math.random() * 8000 : nextNukeDelayMs();
        nukeDueAt = Date.now() + wait;
        nukeTimer = setTimeout(() => {
            nukeTimer = null;
            if (!isGameLive() || paused) return;
            if (!isEyeDisoriented() && !nukeInFlight) {
                launchNuke();
            }
            scheduleNukes(false);
        }, wait);
    }

    function startInboundSchedulers() {
        clearInboundSchedulers();
        scheduleMissiles(true);
        scheduleNukes(true);
    }
```

Extend `applyPauseTimeSkew(elapsed)`:

```javascript
        if (missileDueAt > pauseStartedAt) {
            clearTimeout(missileTimer);
            missileDueAt += elapsed;
            missileTimer = setTimeout(() => {
                missileTimer = null;
                if (!isGameLive() || paused) return;
                if (!isEyeDisoriented() && !missileInFlight) launchSmallMissile();
                scheduleMissiles(false);
            }, Math.max(0, missileDueAt - Date.now()));
        }
        if (nukeDueAt > pauseStartedAt) {
            clearTimeout(nukeTimer);
            nukeDueAt += elapsed;
            nukeTimer = setTimeout(() => {
                nukeTimer = null;
                if (!isGameLive() || paused) return;
                if (!isEyeDisoriented() && !nukeInFlight) launchNuke();
                scheduleNukes(false);
            }, Math.max(0, nukeDueAt - Date.now()));
        }
```

In `openHelp` when setting `paused = true`, also `clearTimeout(missileTimer); clearTimeout(nukeTimer);` (keep due times for skew on close) — same pattern as hole timers.

Stub until Task 3:

```javascript
    function launchSmallMissile() {
        // Implemented in Task 3
    }
```

- [ ] **Step 4: Wire Game On / Off**

In `resetRunStats` or Game On branch of `setGameEnabled(true)`:

```javascript
            runStartedAt = Date.now();
            startInboundSchedulers();
```

In Game Off / `endGame` cleanup paths that call `clearAllBots`, also:

```javascript
        clearInboundSchedulers();
        missileInFlight = false;
        runStartedAt = 0;
```

Ensure `launchNuke` still sets `nukeInFlight` as today; after detonation completes, `nukeInFlight` clears (existing).

- [ ] **Step 5: Verify + commit**

```bash
node --check websites/www.cs/main.js
git add websites/www.cs/main.js
git commit -m "$(cat <<'EOF'
Schedule occasional nukes and missiles from a ramping difficulty clock.

EOF
)"
```

---

### Task 3: Small missile entity (ground + tracker)

**Files:**
- Modify: `websites/www.cs/index.html` — add `<div class="cylon-small-missile" id="cylon-small-missile" aria-hidden="true"></div>` near nuke missile
- Modify: `websites/www.cs/custom.css` — missile + tracker + blast styles
- Modify: `websites/www.cs/main.js` — implement `launchSmallMissile`, detonation, SFX

**Interfaces:**
- Consumes: `lastAim`, `mouse`, `missileInFlight`, `punchHole`, `HOLE_PRESETS`, `registerHit`, `playTone` / `playNoiseBurst` / `playExplosion`
- Produces: working small missiles; constants `MISSILE_SPEED`, `MISSILE_BLAST_RADIUS`, `MISSILE_TRACKER_CHANCE = 0.22`

- [ ] **Step 1: HTML shell** next to nuke missile:

```html
<div class="cylon-small-missile" id="cylon-small-missile" aria-hidden="true"></div>
```

- [ ] **Step 2: CSS** (after nuke missile styles or near impacts):

```css
.cylon-small-missile {
  position: fixed;
  width: 28px;
  height: 6px;
  margin: -3px 0 0 -14px;
  border-radius: 3px;
  pointer-events: none;
  z-index: 1940;
  opacity: 0;
  visibility: hidden;
  background: linear-gradient(90deg, rgba(255, 160, 60, 0.15), #ff9020 40%, #fff6c8 100%);
  box-shadow: 0 0 10px 3px rgba(255, 120, 40, 0.75);
  transform-origin: center center;
}

.cylon-small-missile.is-flying {
  opacity: 1;
  visibility: visible;
}

.cylon-small-missile.is-tracker {
  height: 8px;
  margin-top: -4px;
  background: linear-gradient(90deg, rgba(80, 220, 255, 0.2), #ff40c8 45%, #e8ffff 100%);
  box-shadow:
    0 0 12px 4px rgba(255, 60, 200, 0.85),
    0 0 22px 8px rgba(60, 200, 255, 0.45);
  animation: trackerPulse 0.18s ease-in-out infinite alternate;
}

.cylon-small-missile.is-tracker::after {
  content: "";
  position: absolute;
  left: 100%;
  top: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 2px;
  border: 1.5px solid rgba(255, 80, 220, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(80, 220, 255, 0.8);
}

@keyframes trackerPulse {
  from { filter: brightness(1); }
  to { filter: brightness(1.35); }
}

.cylon-missile-blast {
  position: absolute;
  width: 120px;
  height: 120px;
  margin: -60px 0 0 -60px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1063;
  background: radial-gradient(circle, rgba(255, 220, 160, 0.9) 0%, rgba(255, 100, 40, 0.55) 40%, transparent 70%);
  animation: grenadeBlast 0.4s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  .cylon-small-missile.is-tracker {
    animation: none;
  }
}
```

- [ ] **Step 3: Implement launch + flight + detonate** in `main.js`

```javascript
    const MISSILE_SPEED = 640;
    const MISSILE_ARRIVE = 22;
    const MISSILE_MAX_FLIGHT_MS = 2200;
    const MISSILE_BLAST_RADIUS = 72;
    const MISSILE_TRACKER_CHANCE = 0.22;
    const missileEl = document.getElementById('cylon-small-missile');

    function playSmallMissileSound(tracker) {
        playTone({
            freq: tracker ? 520 : 380,
            freqEnd: tracker ? 160 : 110,
            type: 'sawtooth',
            duration: 0.22,
            gain: tracker ? 0.07 : 0.055
        });
        playNoiseBurst({
            duration: 0.14,
            gain: 0.04,
            filterFreq: tracker ? 2200 : 1400,
            filterType: 'highpass'
        });
    }

    function detonateSmallMissileAt(clientX, clientY) {
        missileInFlight = false;
        if (missileEl) {
            missileEl.classList.remove('is-flying', 'is-tracker');
        }
        const pageX = clientX + window.scrollX;
        const pageY = clientY + window.scrollY;
        playExplosion({ size: 'small', delay: 0 });
        const blast = document.createElement('div');
        blast.className = 'cylon-missile-blast';
        blast.style.left = `${pageX}px`;
        blast.style.top = `${pageY}px`;
        blast.setAttribute('aria-hidden', 'true');
        field.appendChild(blast);
        setTimeout(() => blast.remove(), 420);
        punchHole(pageX, pageY, HOLE_PRESETS.small);
        syncMousePageFromClient();
        const miss = Math.hypot(mouse.clientX - clientX, mouse.clientY - clientY);
        if (miss <= MISSILE_BLAST_RADIUS) {
            registerHit(2);
        }
    }

    function launchSmallMissile() {
        if (!isGameLive() || isEyeDisoriented() || missileInFlight || !missileEl) return;
        missileInFlight = true;
        const tracker = Math.random() < MISSILE_TRACKER_CHANCE;
        const aimFresh = performance.now() - lastAim.t < 4000;
        let lockX = aimFresh ? lastAim.clientX : mouse.clientX;
        let lockY = aimFresh ? lastAim.clientY : mouse.clientY;

        const origin = eyeClientCenter();
        let x = origin.x;
        let y = origin.y - 40;
        const started = performance.now();
        let last = started;

        missileEl.classList.toggle('is-tracker', tracker);
        missileEl.classList.add('is-flying');
        missileEl.style.left = `${x}px`;
        missileEl.style.top = `${y}px`;
        if (settings.soundEnabled) ensureAudio();
        playSmallMissileSound(tracker);

        const tick = (now) => {
            if (paused || !settings.gameEnabled || gameOver) {
                started += now - last;
                last = now;
                if (!missileInFlight) return;
                requestAnimationFrame(tick);
                return;
            }
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const tx = tracker ? mouse.clientX : lockX;
            const ty = tracker ? mouse.clientY : lockY;
            const dx = tx - x;
            const dy = ty - y;
            const dist = Math.hypot(dx, dy) || 1;
            const step = MISSILE_SPEED * dt;
            x += (dx / dist) * Math.min(step, dist);
            y += (dy / dist) * Math.min(step, dist);
            missileEl.style.left = `${x}px`;
            missileEl.style.top = `${y}px`;
            missileEl.style.setProperty('--missile-heading', `${Math.atan2(dy, dx) * (180 / Math.PI)}deg`);
            missileEl.style.transform = `rotate(${Math.atan2(dy, dx) * (180 / Math.PI)}deg)`;
            if (dist <= MISSILE_ARRIVE || now - started >= MISSILE_MAX_FLIGHT_MS) {
                detonateSmallMissileAt(x, y);
                return;
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
```

Also clear `missileEl` classes in `clearInboundSchedulers` / Game Off:

```javascript
        if (missileEl) missileEl.classList.remove('is-flying', 'is-tracker');
        missileInFlight = false;
```

- [ ] **Step 4: Verify + commit**

```bash
node --check websites/www.cs/main.js
git add websites/www.cs/main.js websites/www.cs/custom.css websites/www.cs/index.html
git commit -m "$(cat <<'EOF'
Add ground and tracker small missiles with distinct seeking visuals.

EOF
)"
```

---

### Task 4: KO-tier bot cap

**Files:**
- Modify: `websites/www.cs/main.js` — `spawnBot`, `launchWave`; replace `MAX_BOTS` uses

**Interfaces:**
- Consumes: `koScore`, `BOT_HARD_CAP`, `BOT_CAP_START`, `BOT_CAP_PER_KOS`
- Produces: `botCap()` → number

- [ ] **Step 1: Replace MAX_BOTS**

Remove or stop using `const MAX_BOTS = 4` for spawn limits.

```javascript
    function botCap() {
        return Math.min(BOT_HARD_CAP, BOT_CAP_START + Math.floor(koScore / BOT_CAP_PER_KOS));
    }
```

In `spawnBot`:

```javascript
        if (!isGameLive() || activeBots >= botCap()) return false;
```

In `launchWave`:

```javascript
        const room = botCap() - activeBots;
        if (room <= 0) return;
        const isWave = Math.random() < 0.55;
        const maxBatch = Math.min(room, Math.max(2, Math.min(4, Math.floor(botCap() / 3))));
        const count = isWave
            ? Math.min(room, 2 + Math.floor(Math.random() * Math.max(1, maxBatch - 1)))
            : 1;
```

Keep `MAX_WAVE` only if still useful; otherwise drop in favor of `maxBatch`.

- [ ] **Step 2: Verify + commit**

```bash
node --check websites/www.cs/main.js
rg "MAX_BOTS" websites/www.cs/main.js || true
git add websites/www.cs/main.js
git commit -m "$(cat <<'EOF'
Scale bot population with KO score up to desktop/mobile hard caps.

EOF
)"
```

---

### Task 5: Desolate world-ended look (fade-in)

**Files:**
- Modify: `websites/www.cs/custom.css`
- Modify: `websites/www.cs/main.js` — toggle class in `setGameEnabled` / `endGame`

**Interfaces:**
- Consumes: `setGameEnabled`, game over paths
- Produces: `body.cylon-world-ended` while a run is live (`settings.gameEnabled && !gameOver` or entire Game On session until Off)

- [ ] **Step 1: CSS** — scope to main content; exclude nav/HUD

Prefer wrapping existing content or targeting known containers. If content lives under `main` / `#nav-main` / `.container`, use:

```css
body.cylon-world-ended {
  --cylon-desolate-fade: 1.1s;
}

/* Fade ashy wash over page content, not fixed game chrome */
body.cylon-world-ended .site-main,
body.cylon-world-ended main,
body.cylon-world-ended #nav-main,
body.cylon-world-ended #nav-contact,
body.cylon-world-ended .content-wrap {
  transition:
    filter var(--cylon-desolate-fade) ease,
    color var(--cylon-desolate-fade) ease;
  filter: grayscale(0.55) contrast(0.92) brightness(0.88);
}

body.cylon-world-ended .site-main h1,
body.cylon-world-ended .site-main h2,
body.cylon-world-ended .site-main h3,
body.cylon-world-ended main h1,
body.cylon-world-ended main h2,
body.cylon-world-ended main h3,
body.cylon-world-ended #nav-main h1,
body.cylon-world-ended #nav-main h2,
body.cylon-world-ended #nav-main p,
body.cylon-world-ended #nav-main li,
body.cylon-world-ended #nav-contact p {
  text-shadow:
    0.6px 0 0 rgba(40, 40, 40, 0.55),
    -0.6px 0.4px 0 rgba(90, 90, 90, 0.35),
    0 0 1px rgba(0, 0, 0, 0.4);
  color: color-mix(in srgb, currentColor 55%, #6a6a6a 45%);
}

/* Subtle crack lines via repeating background on headings */
body.cylon-world-ended .site-main h1,
body.cylon-world-ended main h1,
body.cylon-world-ended #nav-main h1 {
  background-image: repeating-linear-gradient(
    105deg,
    transparent 0 11px,
    rgba(30, 30, 30, 0.18) 11px 12px,
    transparent 12px 23px
  );
  background-blend-mode: multiply;
  -webkit-background-clip: text;
  background-clip: text;
}

@media (prefers-reduced-motion: reduce) {
  body.cylon-world-ended .site-main,
  body.cylon-world-ended main,
  body.cylon-world-ended #nav-main,
  body.cylon-world-ended #nav-contact {
    transition: filter 0.4s ease;
    filter: grayscale(0.5) brightness(0.9);
  }
}
```

Inspect `index.html` structure and adjust selectors to real content wrappers so nav (`.site-header` / game chrome) is **not** filtered. If a clean wrapper is missing, add `class="site-main"` around the page panels only (minimal HTML change).

- [ ] **Step 2: Toggle class**

```javascript
    function syncWorldEndedLook() {
        const on = settings.gameEnabled; // includes mid-run; clear on Game Off
        document.body.classList.toggle('cylon-world-ended', on);
    }
```

Call `syncWorldEndedLook()` at end of `setGameEnabled` and when `endGame` forces game off. Ensure Game Off removes the class so the fade-out transition can run (keep class removal immediate; CSS transition on filter handles fade when toggling).

- [ ] **Step 3: Verify + commit**

```bash
node --check websites/www.cs/main.js
git add websites/www.cs/main.js websites/www.cs/custom.css websites/www.cs/index.html
git commit -m "$(cat <<'EOF'
Fade the page into a desolate cracked look while the game is on.

EOF
)"
```

---

### Task 6: Help copy, cache-bust, deploy

**Files:**
- Modify: `websites/www.cs/index.html` — How to Play + settings hint + `?v=20261006ad`
- Deploy via `make deploy`

- [ ] **Step 1: Update help bullets** (desktop + mobile) to include:

- Occasional nukes and smaller missiles (missiles deal 2 hits).
- Cyan/pink seeking missiles chase you; orange ones aim where you just were.
- More drones appear as your KO count rises.
- The page looks ruined while Game On.

Update settings hint similarly (no “every 10 hits”).

- [ ] **Step 2: Cache-bust**

```html
<link href="custom.css?v=20261006ad" rel="stylesheet">
...
<script src="main.js?v=20261006ad"></script>
```

- [ ] **Step 3: Deploy**

```bash
cd websites/www.cs && node --check main.js && make deploy
```

- [ ] **Step 4: Manual checklist**

1. 10 hits → no nuke from hits  
2. Idle Game On → small missiles; later/rarer nukes  
3. Orange missile → recent aim lock; dodge blast  
4. Cyan/pink tracker → distinct + follows pip  
5. KOs raise bot density; mobile caps at 10  
6. No nukes checkbox in Options  
7. Game On fades desolate look; Game Off restores  
8. Pause freezes inbound schedules  

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/index.html
git commit -m "$(cat <<'EOF'
Document Missile Command threats in How to Play and cache-bust assets.

EOF
)"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Remove hit→nuke + HITS_PER_NUKE | 1 |
| Nukes always on / remove toggle | 1 |
| Dual ramping schedulers | 2 |
| lastAim ground lock + tracker % | 3 |
| +2 missile splash; distinct tracker look | 3 |
| Eye disorient blocks both | 2–3 |
| botCap 4 + KO/5; hard 30/10 | 4 |
| Desolate fade-in world ended | 5 |
| Help + deploy | 6 |
