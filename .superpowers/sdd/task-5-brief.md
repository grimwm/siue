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

