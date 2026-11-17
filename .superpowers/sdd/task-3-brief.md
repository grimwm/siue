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

