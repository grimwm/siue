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

