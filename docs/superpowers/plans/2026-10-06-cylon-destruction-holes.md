# Cylon Destruction Holes + Realistic Explosion SFX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Combat impacts punch temporary scorched+glitch holes in page content (weapon-scaled size/duration) that fade back, and explosion SFX use layered Web Audio instead of flat noise.

**Architecture:** Overlay `.cylon-hole` nodes in `#cylon-battlefield` via `punchHole(pageX, pageY, opts)` with a concurrent cap and pause-aware timers. Call sites on bolt impact, KO, grenade, Raptor impacts, and nuke. New `playExplosion({ size })` layers thump/crack/debris/rumble on `sfxBus`.

**Tech Stack:** Static HTML/CSS/JS, Web Audio API, Bootstrap site (existing). No new audio files. No unit-test harness — verify with `node --check` and manual playtests.

## Global Constraints

- Visual: scorched void + edge glitch; fade back after weapon-scaled hold.
- Scale: bolts/KOs small (~48–64px, hold ~0.8s, fade ~1s); grenade/Raptor medium (`GRENADE_RADIUS` = 165, hold ~2.5s, fade ~2s); nuke large near-viewport (hold ~4s, fade ~3s).
- Overlay masks only — do not clone/shred real page DOM.
- Holes: `pointer-events: none`; do not damage nav/reticle/score/modals.
- No holes while Game Off; clear on Game Off / game over.
- Pause (How to Play): freeze hole timers via `applyPauseTimeSkew`.
- Audio: procedural only on `sfxBus`; gated by SFX toggle + volume.
- `playExplosion`: small = KO; medium = grenade + Raptor ground; large = nuke. Bolt zap / grenade arm unchanged.
- Cap ~24 concurrent holes; force-fade oldest when over cap.
- Spec: `docs/superpowers/specs/2026-10-06-cylon-destruction-holes-design.md`

## File map

| File | Role |
|------|------|
| `websites/www.cs/custom.css` | `.cylon-hole` scorch, glitch rim, fade, reduced-motion |
| `websites/www.cs/main.js` | `punchHole`, hole registry/pause/cleanup, call sites, `playExplosion` |
| `websites/www.cs/index.html` | Cache-bust `?v=` on css/js after changes |

---

### Task 1: Hole CSS (scorch + glitch + fade)

**Files:**
- Modify: `websites/www.cs/custom.css` (after `.cylon-grenade-blast` block ~line 1317)
- Modify: `websites/www.cs/index.html` (css `?v=` bump)

**Interfaces:**
- Consumes: none
- Produces: CSS classes `.cylon-hole`, `.cylon-hole.is-fading`, `.cylon-hole-glitch` (rim child); z-index below bots (1061) and blasts (1063) but above page content — use `z-index: 1059` inside `.cylon-battlefield` (field is 1060)

- [ ] **Step 1: Add hole styles**

Insert after the `@keyframes grenadeBlast` block:

```css
/* Destruction holes — scorched void + rim glitch over page content */
.cylon-hole {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1059;
  margin: 0;
  transform: translate(-50%, -50%);
  background:
    radial-gradient(
      circle,
      rgba(8, 4, 2, 0.92) 0%,
      rgba(20, 10, 6, 0.78) 38%,
      rgba(40, 18, 10, 0.45) 58%,
      transparent 72%
    );
  mix-blend-mode: multiply;
  box-shadow:
    0 0 0 1px rgba(255, 80, 40, 0.25) inset,
    0 0 18px 4px rgba(0, 0, 0, 0.35);
  opacity: 1;
  will-change: opacity, transform;
}

.cylon-hole-glitch {
  position: absolute;
  inset: -6%;
  border-radius: 50%;
  pointer-events: none;
  background:
    radial-gradient(
      circle,
      transparent 52%,
      rgba(255, 60, 40, 0.35) 62%,
      rgba(80, 200, 255, 0.2) 68%,
      transparent 78%
    );
  mix-blend-mode: screen;
  animation: holeGlitch 0.12s steps(2, end) infinite;
  opacity: 0.85;
}

.cylon-hole.is-fading {
  transition: opacity var(--hole-fade-ms, 1000ms) ease-out;
  opacity: 0;
}

.cylon-hole.is-fading .cylon-hole-glitch {
  animation: none;
  opacity: 0;
  transition: opacity 0.35s ease-out;
}

@keyframes holeGlitch {
  0% {
    transform: translate(0, 0) skewX(0deg);
    filter: none;
  }
  50% {
    transform: translate(1.5px, -1px) skewX(-2deg);
    filter: hue-rotate(20deg);
  }
  100% {
    transform: translate(-1px, 1px) skewX(1deg);
    filter: hue-rotate(-15deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cylon-hole-glitch {
    animation: none;
    opacity: 0.4;
    filter: none;
  }
}
```

Also add to the existing reduced-motion / print cleanup block near the bottom of `custom.css` (where `.cylon-impact` is listed) if present:

```css
  .cylon-hole,
```

so holes are hidden when motion is globally suppressed in that block (keep consistent with other FX).

- [ ] **Step 2: Bump CSS cache-bust**

In `websites/www.cs/index.html`, change:

```html
<link href="custom.css?v=20261006aa" rel="stylesheet">
```

to:

```html
<link href="custom.css?v=20261006ac" rel="stylesheet">
```

- [ ] **Step 3: Verify CSS parses**

Run: `node -e "const fs=require('fs'); const c=fs.readFileSync('websites/www.cs/custom.css','utf8'); if(!c.includes('.cylon-hole')) process.exit(1); console.log('ok', c.match(/\.cylon-hole/g).length);"`  
Expected: `ok` with match count ≥ 3

- [ ] **Step 4: Commit**

```bash
git add websites/www.cs/custom.css websites/www.cs/index.html
git commit -m "$(cat <<'EOF'
Add scorched destruction-hole styles for Cylon combat impacts.

EOF
)"
```

---

### Task 2: `punchHole` + pause, cap, cleanup

**Files:**
- Modify: `websites/www.cs/main.js` (near other battlefield helpers; after constants ~line 173 and near `applyPauseTimeSkew` / `clearAllBots`)

**Interfaces:**
- Consumes: `field`, `paused`, `pauseStartedAt`, `isGameLive()`, `applyPauseTimeSkew`
- Produces:
  - `const MAX_HOLES = 24`
  - `const HOLE_PRESETS = { small: { radius: 56, holdMs: 800, fadeMs: 1000 }, medium: { radius: GRENADE_RADIUS, holdMs: 2500, fadeMs: 2000 }, large: { radius: null, holdMs: 4000, fadeMs: 3000 } }` (`large.radius` computed at punch time as `Math.min(window.innerWidth, window.innerHeight) * 0.42`)
  - `let activeHoles = []` — entries `{ el, holdTimer, fadeTimer, holdDue, fadeDue, phase: 'hold'|'fade' }`
  - `punchHole(pageX, pageY, { radius, holdMs, fadeMs })` → `void`
  - `clearAllHoles()` → `void`
  - Extends `applyPauseTimeSkew(elapsed)` to reschedule hole timers
  - Calls `clearAllHoles()` from `clearAllBots` (or both Game Off / `endGame` paths that already call `clearAllBots`)

- [ ] **Step 1: Add hole state + presets next to other constants**

After `const GRENADE_RADIUS = 165;`:

```javascript
    const MAX_HOLES = 24;
    const HOLE_PRESETS = {
        small: { radius: 56, holdMs: 800, fadeMs: 1000 },
        medium: { radius: GRENADE_RADIUS, holdMs: 2500, fadeMs: 2000 },
        // radius filled at punch time from viewport
        large: { radius: 0, holdMs: 4000, fadeMs: 3000 }
    };
    let activeHoles = [];
```

- [ ] **Step 2: Implement punchHole / fade / clear / pause skew**

Add these functions near `clearAllBots` (before or after):

```javascript
    function largeHoleRadius() {
        return Math.min(window.innerWidth || 400, window.innerHeight || 400) * 0.42;
    }

    function removeHoleEntry(entry) {
        if (!entry) return;
        clearTimeout(entry.holdTimer);
        clearTimeout(entry.fadeTimer);
        entry.el.remove();
        activeHoles = activeHoles.filter((h) => h !== entry);
    }

    function beginHoleFade(entry) {
        if (!entry || !entry.el.isConnected) {
            removeHoleEntry(entry);
            return;
        }
        entry.phase = 'fade';
        entry.el.style.setProperty('--hole-fade-ms', `${entry.fadeMs}ms`);
        entry.el.classList.add('is-fading');
        entry.fadeDue = Date.now() + entry.fadeMs;
        entry.fadeTimer = setTimeout(() => removeHoleEntry(entry), entry.fadeMs);
    }

    function forceFadeOldestHole() {
        const oldest = activeHoles[0];
        if (!oldest) return;
        if (oldest.phase === 'hold') {
            clearTimeout(oldest.holdTimer);
            beginHoleFade(oldest);
        } else {
            removeHoleEntry(oldest);
        }
    }

    function punchHole(pageX, pageY, { radius, holdMs, fadeMs } = {}) {
        if (!field || !isGameLive()) return;
        const r = radius > 0 ? radius : largeHoleRadius();
        const hold = holdMs > 0 ? holdMs : HOLE_PRESETS.small.holdMs;
        const fade = fadeMs > 0 ? fadeMs : HOLE_PRESETS.small.fadeMs;

        while (activeHoles.length >= MAX_HOLES) {
            forceFadeOldestHole();
            if (activeHoles.length >= MAX_HOLES) removeHoleEntry(activeHoles[0]);
        }

        const el = document.createElement('div');
        el.className = 'cylon-hole';
        el.setAttribute('aria-hidden', 'true');
        el.style.left = `${pageX}px`;
        el.style.top = `${pageY}px`;
        el.style.width = `${r * 2}px`;
        el.style.height = `${r * 2}px`;
        const rim = document.createElement('div');
        rim.className = 'cylon-hole-glitch';
        el.appendChild(rim);
        field.appendChild(el);

        const entry = {
            el,
            holdTimer: null,
            fadeTimer: null,
            holdDue: Date.now() + hold,
            fadeDue: 0,
            fadeMs: fade,
            phase: 'hold'
        };
        entry.holdTimer = setTimeout(() => beginHoleFade(entry), hold);
        activeHoles.push(entry);
    }

    function clearAllHoles() {
        [...activeHoles].forEach(removeHoleEntry);
        activeHoles = [];
        field?.querySelectorAll('.cylon-hole').forEach((el) => el.remove());
    }
```

Update `applyPauseTimeSkew`:

```javascript
    function applyPauseTimeSkew(elapsed) {
        if (elapsed <= 0) return;
        if (grenadeReadyAt > pauseStartedAt) grenadeReadyAt += elapsed;
        if (raptorReadyAt > pauseStartedAt) raptorReadyAt += elapsed;
        if (eyeDisorientedUntil > pauseStartedAt) eyeDisorientedUntil += elapsed;

        activeHoles.forEach((h) => {
            if (h.phase === 'hold' && h.holdDue > pauseStartedAt) {
                clearTimeout(h.holdTimer);
                h.holdDue += elapsed;
                h.holdTimer = setTimeout(() => beginHoleFade(h), Math.max(0, h.holdDue - Date.now()));
            } else if (h.phase === 'fade' && h.fadeDue > pauseStartedAt) {
                clearTimeout(h.fadeTimer);
                h.fadeDue += elapsed;
                h.fadeTimer = setTimeout(() => removeHoleEntry(h), Math.max(0, h.fadeDue - Date.now()));
            }
        });
    }
```

Update `clearAllBots` to also clear holes:

```javascript
    function clearAllBots() {
        field.querySelectorAll('.cylon-bot').forEach((bot) => {
            clearBotTimers(bot);
            bot.remove();
        });
        field.querySelectorAll('.cylon-bolt, .cylon-impact').forEach((el) => el.remove());
        clearAllHoles();
        activeBots = 0;
    }
```

- [ ] **Step 3: Syntax check**

Run: `node --check websites/www.cs/main.js`  
Expected: exit 0, no output

- [ ] **Step 4: Commit**

```bash
git add websites/www.cs/main.js
git commit -m "$(cat <<'EOF'
Add punchHole with pause-aware timers and a concurrent hole cap.

EOF
)"
```

---

### Task 3: Wire hole call sites

**Files:**
- Modify: `websites/www.cs/main.js` — `fireBolt`, `knockOutBot`, `throwGrenadeAt`, `spawnRaptorImpacts`, `detonateNukeAt`

**Interfaces:**
- Consumes: `punchHole`, `HOLE_PRESETS`, `largeHoleRadius`, `GRENADE_RADIUS`, `BOT_SIZE`
- Produces: visual holes at each combat impact (no API change)

- [ ] **Step 1: Bolt impact + KO**

In `fireBolt` `anim.onfinish`, after creating `.cylon-impact`:

```javascript
            punchHole(toX, toY, HOLE_PRESETS.small);
```

In `knockOutBot`, after `playKoSound()`:

```javascript
        const kx = (parseFloat(bot.style.left) || 0) + BOT_SIZE.w / 2;
        const ky = (parseFloat(bot.style.top) || 0) + BOT_SIZE.h / 2;
        punchHole(kx, ky, HOLE_PRESETS.small);
```

- [ ] **Step 2: Grenade**

In `throwGrenadeAt`, after appending blast:

```javascript
        punchHole(x, y, HOLE_PRESETS.medium);
```

- [ ] **Step 3: Raptor impacts**

In `spawnRaptorImpacts`, when each impact span is created, compute page coordinates from viewport percentages (impacts are positioned inside fixed `#cylon-raptor`):

```javascript
                const leftPct = 12 + Math.random() * 76;
                const topPct = 40 + Math.random() * 50;
                hit.style.left = `${leftPct}%`;
                hit.style.top = `${topPct}%`;
                raptorImpactsEl.appendChild(hit);
                const pageX = window.scrollX + (leftPct / 100) * window.innerWidth;
                const pageY = window.scrollY + (topPct / 100) * window.innerHeight;
                punchHole(pageX, pageY, HOLE_PRESETS.medium);
                setTimeout(() => hit.remove(), 560);
```

(Remove the old random inline left/top assignment so it isn’t duplicated.)

- [ ] **Step 4: Nuke**

In `detonateNukeAt`, after starting the visual detonation, convert client → page and punch large hole:

```javascript
        const pageX = clientX + window.scrollX;
        const pageY = clientY + window.scrollY;
        punchHole(pageX, pageY, {
            radius: largeHoleRadius(),
            holdMs: HOLE_PRESETS.large.holdMs,
            fadeMs: HOLE_PRESETS.large.fadeMs
        });
```

- [ ] **Step 5: Syntax check + cache-bust JS**

Run: `node --check websites/www.cs/main.js`  
Bump `index.html` script to `main.js?v=20261006ac`

- [ ] **Step 6: Manual playtest checklist**

1. Game On → tap a bot → small hole under KO, fades ~2s total  
2. Grenade → medium hole at blast  
3. Raptor → several medium holes along strike  
4. Take hits until nuke → large hole at detonation  
5. Open How to Play mid-hole → hole lifetime freezes; close → resumes  
6. Game Off → holes cleared  

- [ ] **Step 7: Commit**

```bash
git add websites/www.cs/main.js websites/www.cs/index.html
git commit -m "$(cat <<'EOF'
Punch destruction holes at bolt, KO, grenade, Raptor, and nuke impacts.

EOF
)"
```

---

### Task 4: Layered `playExplosion` SFX

**Files:**
- Modify: `websites/www.cs/main.js` — replace explosion bodies of `playKoSound`, `playGrenadeSound`, `playNukeSound`, and Raptor ground portion of `playRaptorSound`

**Interfaces:**
- Consumes: `playTone`, `playNoiseBurst`, `ensureAudio`, `sfxBus`
- Produces: `playExplosion({ size: 'small'|'medium'|'large', delay = 0 })` → `void`

- [ ] **Step 1: Add playExplosion helper** after `playNoiseBurst`:

```javascript
    function playExplosion({ size = 'medium', delay = 0 } = {}) {
        const ctx = ensureAudio();
        if (!ctx) return;
        const profiles = {
            small: {
                thumpGain: 0.11,
                thumpDur: 0.28,
                crackGain: 0.08,
                crackDur: 0.12,
                debrisGain: 0.06,
                debrisDur: 0.22,
                rumbleGain: 0.05,
                rumbleDur: 0.35,
                thumpFreq: 70,
                crackFreq: 420
            },
            medium: {
                thumpGain: 0.16,
                thumpDur: 0.45,
                crackGain: 0.12,
                crackDur: 0.16,
                debrisGain: 0.1,
                debrisDur: 0.4,
                rumbleGain: 0.09,
                rumbleDur: 0.65,
                thumpFreq: 55,
                crackFreq: 380
            },
            large: {
                thumpGain: 0.2,
                thumpDur: 0.85,
                crackGain: 0.14,
                crackDur: 0.28,
                debrisGain: 0.12,
                debrisDur: 0.7,
                rumbleGain: 0.14,
                rumbleDur: 1.4,
                thumpFreq: 42,
                crackFreq: 300
            }
        };
        const p = profiles[size] || profiles.medium;
        // 1) Sub thump
        playTone({
            freq: p.thumpFreq,
            freqEnd: Math.max(18, p.thumpFreq * 0.35),
            type: 'sine',
            duration: p.thumpDur,
            gain: p.thumpGain,
            delay
        });
        playTone({
            freq: p.thumpFreq * 1.4,
            freqEnd: 24,
            type: 'triangle',
            duration: p.thumpDur * 0.85,
            gain: p.thumpGain * 0.55,
            delay: delay + 0.02
        });
        // 2) Sharp crack
        playNoiseBurst({
            duration: p.crackDur,
            gain: p.crackGain,
            delay: delay + 0.03,
            filterFreq: p.crackFreq,
            filterType: 'bandpass'
        });
        playTone({
            freq: 900,
            freqEnd: 120,
            type: 'square',
            duration: p.crackDur * 0.7,
            gain: p.crackGain * 0.45,
            delay: delay + 0.03
        });
        // 3) Debris / hiss
        playNoiseBurst({
            duration: p.debrisDur,
            gain: p.debrisGain,
            delay: delay + 0.06,
            filterFreq: 1800,
            filterType: 'highpass'
        });
        playNoiseBurst({
            duration: p.debrisDur * 0.8,
            gain: p.debrisGain * 0.7,
            delay: delay + 0.08,
            filterFreq: 700,
            filterType: 'bandpass'
        });
        // 4) Rumble tail
        playTone({
            freq: 48,
            freqEnd: 20,
            type: 'sine',
            duration: p.rumbleDur,
            gain: p.rumbleGain,
            delay: delay + 0.1
        });
        playNoiseBurst({
            duration: p.rumbleDur * 0.9,
            gain: p.rumbleGain * 0.65,
            delay: delay + 0.12,
            filterFreq: 180,
            filterType: 'lowpass'
        });
    }
```

- [ ] **Step 2: Rewire callers**

```javascript
    function playKoSound() {
        playExplosion({ size: 'small' });
    }

    function playNukeSound() {
        playExplosion({ size: 'large' });
    }

    function playGrenadeSound() {
        // Throw whoosh (keep)
        playTone({ freq: 420, freqEnd: 140, type: 'sawtooth', duration: 0.14, gain: 0.05 });
        playNoiseBurst({ duration: 0.12, gain: 0.05, filterFreq: 1800, filterType: 'highpass' });
        // Detonation
        playExplosion({ size: 'medium', delay: 0.08 });
    }

    function playRaptorSound() {
        // Incoming flyby (keep)
        playTone({ freq: 220, freqEnd: 70, type: 'sawtooth', duration: 0.7, gain: 0.09 });
        playTone({ freq: 140, freqEnd: 55, type: 'triangle', duration: 0.85, gain: 0.07, delay: 0.04 });
        playNoiseBurst({ duration: 0.55, gain: 0.08, filterFreq: 700, filterType: 'lowpass' });
        playNoiseBurst({ duration: 0.4, gain: 0.05, delay: 0.15, filterFreq: 2400, filterType: 'highpass' });
        // Cannon strafe (keep)
        [0.45, 0.58, 0.7, 0.82, 0.94, 1.06].forEach((d, i) => {
            playTone({
                freq: 980 - i * 40,
                freqEnd: 180,
                type: 'square',
                duration: 0.07,
                gain: 0.055,
                delay: d
            });
            playNoiseBurst({ duration: 0.08, gain: 0.045, delay: d, filterFreq: 1600 });
        });
        // Ground impacts — layered explosions
        playExplosion({ size: 'medium', delay: 0.72 });
        playExplosion({ size: 'medium', delay: 1.0 });
    }
```

Leave `playProjectileSound`, `playGrenadeArmSound`, and `playHitSound` unchanged.

- [ ] **Step 3: Syntax check**

Run: `node --check websites/www.cs/main.js`  
Expected: exit 0

- [ ] **Step 4: Manual audio checklist**

1. SFX on, volume mid: KO sounds like a small boom (not a toy beep)  
2. Grenade: whoosh then fuller boom  
3. Raptor: flyby/strafe then two ground booms  
4. Nuke: deep long boom  
5. SFX off: silence for all of the above; holes still appear  

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/main.js
git commit -m "$(cat <<'EOF'
Replace flat explosion noise with layered thump/crack/debris/rumble.

EOF
)"
```

---

### Task 5: Deploy and verify live

**Files:**
- Modify: `websites/www.cs/index.html` — ensure both `custom.css?v=20261006ac` and `main.js?v=20261006ac`

**Interfaces:**
- Consumes: completed Tasks 1–4
- Produces: live site updated via `make deploy`

- [ ] **Step 1: Confirm cache-bust tokens match**

```bash
rg "custom.css\\?v=|main.js\\?v=" websites/www.cs/index.html
```

Expected: both end in `20261006ac` (or the final bump chosen during implementation).

- [ ] **Step 2: Deploy**

```bash
cd websites/www.cs && node --check main.js && make deploy
```

Expected: scp succeeds; scores JSON not overwritten.

- [ ] **Step 3: Live hard-refresh playtest**

Hard-refresh the CS site. Repeat Task 3 Step 6 + Task 4 Step 4 on desktop and mobile if available.

- [ ] **Step 4: Final commit only if deploy tweaks remain**

If only cache-bust changed after last commit:

```bash
git add websites/www.cs/index.html
git commit -m "$(cat <<'EOF'
Cache-bust Cylon assets after destruction-hole deploy.

EOF
)"
```

Otherwise skip empty commit.

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Scorch + edge glitch | Task 1 |
| Weapon-scaled size/duration | Tasks 2–3 + `HOLE_PRESETS` |
| Overlay in battlefield | Task 2 |
| Call sites: bolt, KO, grenade, Raptor, nuke | Task 3 |
| Cap ~24 + clear on Game Off/over | Task 2 (`clearAllBots`) |
| Pause freezes hole timers | Task 2 (`applyPauseTimeSkew`) |
| pointer-events none / chrome undamaged | Task 1 CSS |
| prefers-reduced-motion static scorch | Task 1 |
| `playExplosion` small/medium/large | Task 4 |
| No sample files | Task 4 |
| Deploy + verify | Task 5 |
