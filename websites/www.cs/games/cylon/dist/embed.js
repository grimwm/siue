/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */
"use strict";(()=>{var ii=Object.defineProperty;var Hn=(e,t)=>{for(var n in t)ii(e,n,{get:t[n],enumerable:!0})};var qo=`<!-- Cylon Defense — FX / overlays injected into #game-root -->
<div class="cylon-scanner" aria-hidden="true">
  <div class="cylon-eye" id="cylon-eye"></div>
</div>
<div class="cylon-glare" id="cylon-glare" aria-hidden="true"></div>

<div class="cylon-ambush-under" id="cylon-ambush-under" role="group" aria-label="Drones in hiding"></div>
<div class="cylon-battlefield" id="cylon-battlefield" role="group" aria-label="Battlefield"></div>
<div class="cylon-nuke-missile" id="cylon-nuke-missile" aria-hidden="true"></div>
<div class="cylon-small-missile" id="cylon-small-missile" aria-hidden="true"></div>
<div class="cylon-nuke" id="cylon-nuke" aria-hidden="true">
  <div class="cylon-nuke-flash"></div>
  <div class="cylon-nuke-ball"></div>
  <div class="cylon-nuke-ring"></div>
</div>
<div class="cylon-raptor" id="cylon-raptor" aria-hidden="true">
  <div class="cylon-raptor-skyflash"></div>
  <div class="cylon-raptor-ground"></div>
  <div class="cylon-raptor-ship">
    <span class="cylon-raptor-wing cylon-raptor-wing-l"></span>
    <span class="cylon-raptor-fuselage"></span>
    <span class="cylon-raptor-wing cylon-raptor-wing-r"></span>
    <span class="cylon-raptor-engine"></span>
    <span class="cylon-raptor-cannon cylon-raptor-cannon-l"></span>
    <span class="cylon-raptor-cannon cylon-raptor-cannon-r"></span>
    <span class="cylon-raptor-beam cylon-raptor-beam-l"></span>
    <span class="cylon-raptor-beam cylon-raptor-beam-r"></span>
    <span class="cylon-raptor-beam-core"></span>
  </div>
  <div class="cylon-raptor-strafe"></div>
  <div class="cylon-raptor-impacts" id="cylon-raptor-impacts"></div>
</div>

<div class="cylon-reticle" id="cylon-reticle" hidden aria-hidden="true">
  <span class="cylon-reticle-ring"></span>
  <span class="cylon-reticle-core"></span>
</div>

<div class="cylon-intro-title" id="cylon-intro-title" hidden aria-hidden="true">The CIC</div>

<div id="cylon-help-root"></div>

<div id="cylon-gameover-root"></div>

<p class="cylon-exit-hint" id="cylon-exit-hint" role="status" hidden></p>
`;var Go=`/* The games kit's opt-in stylesheet. Every selector carries a .kit- class and
   every custom property starts with --kit-, so linking this file changes
   nothing until an element wears a kit- class. A game links it before its own
   CSS and restyles through the properties or with its own rules. */

/* A key as the player presses it (ui/key-chip.tsx). :where() keeps the
   specificity at zero, so any rule of the game's own wins. */
:where(.kit-key-chip) {
  display: inline-block;
  box-sizing: border-box;
  min-width: 1.6em;
  padding: 0.05em 0.4em;
  border: 1px solid var(--kit-key-border, currentColor);
  border-bottom-width: 2px;
  border-radius: 0.3em;
  background: var(--kit-key-bg, rgba(255, 255, 255, 0.08));
  color: var(--kit-key-color, inherit);
  font-family: var(--kit-key-font, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 0.85em;
  line-height: 1.3;
  text-align: center;
  white-space: nowrap;
}

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
/* A dialog's title row (ui/dialog.tsx close): the title wraps in the space the close button leaves, and the
   button stays at the end of the row, centred on the title. */
.kit-dialog-head { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; }
.kit-dialog-head > h2 { min-width: 0; overflow-wrap: anywhere; }
.kit-dialog-head > button { flex: none; margin: 0; }

/* A key tab in line after a button's words (ui/button.tsx keyLabel): in flow, spaced from the words, and
   centred on them. */
:where(.kit-key-tab.kit-key-inline) {
  --kit-key-tab-position: static;
  margin-left: 0.5em;
  vertical-align: middle;
  position: relative;
  top: -0.1em;
  right: auto;
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
`;var zo=`/* Cylon Defense: The scanner bar, the eye and its glare cone, and the home page eye (two sweeps, then the red fill).
 * One of the stylesheets index.html links in order; the order is the cascade (README.md, "Stylesheets"). */
/* Cylon Defense — game styles (extracted from site shell) */

@keyframes cylonSweep {
  0% { left: 5%; }
  100% { left: 95%; }
}

@keyframes cylonTrail {
  0% {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 0, 0, 0.0) 30%,
      rgba(255, 0, 0, 0.28) 55%,
      rgba(255, 90, 90, 0.5) 72%,
      transparent 100%
    );
    transform: translate(-35%, -50%) scaleX(1.15);
  }
  100% {
    background: linear-gradient(
      270deg,
      transparent 0%,
      rgba(255, 0, 0, 0.0) 30%,
      rgba(255, 0, 0, 0.28) 55%,
      rgba(255, 90, 90, 0.5) 72%,
      transparent 100%
    );
    transform: translate(-65%, -50%) scaleX(1.15);
  }
}

/* —— Cylon scanner —— */
.cylon-scanner {
  position: sticky;
  top: 0;
  z-index: 1040;
  height: var(--scanner-height);
  background:
    linear-gradient(
      180deg,
      #050608 0%,
      #151a24 35%,
      #0a0d12 55%,
      #050608 100%
    );
  border-bottom: 1px solid var(--rail-edge);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.65),
    0 0 24px rgba(180, 0, 0, 0.15),
    0 4px 18px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}


.cylon-scanner::before {
  /* recessed track groove */
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 28%;
  bottom: 28%;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.65), rgba(20, 24, 32, 0.35), rgba(0, 0, 0, 0.7)),
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 5px,
      rgba(0, 0, 0, 0.4) 5px,
      rgba(0, 0, 0, 0.4) 6px
    );
  border-radius: 999px;
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.85),
    0 1px 0 rgba(255, 255, 255, 0.04);
  pointer-events: none;
}


.cylon-eye {
  position: absolute;
  top: 50%;
  left: 0;
  width: 32%;
  max-width: 16rem;
  min-width: 8rem;
  height: 160%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  /* core + elongated horizontal bloom (reads as a scanner slit) */
  background:
    radial-gradient(
      ellipse 14% 48% at 50% 50%,
      #ffffff 0%,
      #ffe0e0 28%,
      transparent 58%
    ),
    radial-gradient(
      ellipse 62% 78% at 50% 50%,
      #ff3a3a 0%,
      #ff0000 34%,
      #b00000 58%,
      transparent 74%
    );
  box-shadow:
    0 0 3px 1px rgba(255, 230, 230, 1),
    0 0 10px 3px rgba(255, 60, 60, 1),
    0 0 22px 8px rgba(255, 0, 0, 0.85),
    0 0 48px 18px rgba(180, 0, 0, 0.55),
    0 0 80px 32px rgba(100, 0, 0, 0.3);
  animation: cylonSweep 2.6s ease-in-out infinite alternate;
  will-change: left;
  transition: left 0.08s linear, filter 0.2s ease, box-shadow 0.2s ease;
}


.cylon-eye.is-tracking {
  animation: none;
  filter: saturate(1.25) brightness(1.15);
  box-shadow:
    0 0 4px 1px rgba(255, 240, 240, 1),
    0 0 14px 5px rgba(255, 40, 40, 1),
    0 0 32px 12px rgba(255, 0, 0, 0.9),
    0 0 60px 24px rgba(180, 0, 0, 0.55),
    0 12px 40px 10px rgba(255, 0, 0, 0.25);
}


.cylon-eye.is-tracking::after {
  animation: none;
  opacity: 0.55;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    ellipse 70% 60% at 50% 50%,
    rgba(255, 60, 60, 0.55),
    transparent 72%
  );
}


/* downward glare when watching the cursor (outside clipped scanner) */
.cylon-glare {
  position: fixed;
  top: var(--scanner-height);
  left: 50%;
  width: 3px;
  height: 0;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 1035;
  opacity: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 80, 80, 0.9) 0%,
    rgba(255, 0, 0, 0.28) 40%,
    transparent 100%
  );
  box-shadow: 0 0 12px 3px rgba(255, 0, 0, 0.4);
  /* Swings from its top end, which sits on the eye. */
  transform-origin: 50% 0;
  transition: height 0.15s ease, opacity 0.15s ease, left 0.08s linear;
}


.cylon-glare.is-active {
  opacity: 0.9;
  height: min(32vh, 14rem);
}


/* While it watches you the glare is a soft cone of light from the eye that
   fades with distance (the script sets its length and --glare-reach, how
   far toward the cursor it carries before it is gone), never a solid beam
   touching the cursor. */
.cylon-glare.is-active:not(.is-disoriented) {
  transition: opacity 0.15s ease;
  width: 26px;
  border-radius: 50% 50% 0 0 / 12% 12% 0 0;
  background: radial-gradient(
    ellipse 50% 100% at 50% 0%,
    rgba(255, 110, 110, 0.55) 0%,
    rgba(255, 40, 40, 0.28) calc(var(--glare-reach, 60%) * 0.45),
    rgba(255, 0, 0, 0.08) calc(var(--glare-reach, 60%) * 0.8),
    transparent var(--glare-reach, 60%)
  );
  box-shadow: none;
  filter: blur(1.5px);
  mix-blend-mode: screen;
}


.cylon-eye.is-disoriented {
  animation: none;
  filter: hue-rotate(-10deg) saturate(1.4) brightness(1.25);
  box-shadow:
    0 0 4px 1px rgba(255, 240, 240, 1),
    0 0 18px 6px rgba(255, 60, 60, 1),
    0 0 36px 14px rgba(255, 0, 0, 0.75),
    0 0 8px 2px rgba(120, 180, 255, 0.45);
}


.cylon-eye.is-disoriented::after {
  animation: none;
  opacity: 0.7;
}


.cylon-glare.is-disoriented {
  filter: hue-rotate(40deg);
}


.cylon-eye::before {
  /* bright horizontal iris line */
  content: "";
  position: absolute;
  left: 8%;
  right: 8%;
  top: 42%;
  height: 16%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 80, 80, 0.35) 22%,
    rgba(255, 255, 255, 0.95) 50%,
    rgba(255, 80, 80, 0.35) 78%,
    transparent 100%
  );
  box-shadow: 0 0 8px 2px rgba(255, 60, 60, 0.7);
}


.cylon-eye::after {
  /* motion trail: stretches opposite the travel direction */
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 160%;
  height: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 0, 0, 0.0) 30%,
    rgba(255, 0, 0, 0.25) 55%,
    rgba(255, 80, 80, 0.45) 72%,
    transparent 100%
  );
  filter: blur(4px);
  pointer-events: none;
  animation: cylonTrail 2.6s ease-in-out infinite alternate;
  opacity: 0.85;
}


/* Home page (game off): the eye sweeps the bar end to end twice, and on its
   third pass stops in the middle and opens into a band of red filling the
   strip. Starting the game shrinks it back and the hunt sweeps on from the
   middle (half a cycle in, so it never jumps). */
@keyframes cylonIntro {
  0% { left: 5%; animation-timing-function: ease-in-out; }
  22.2% { left: 95%; animation-timing-function: ease-in-out; }
  44.4% { left: 5%; animation-timing-function: ease-in-out; }
  66.7% { left: 95%; animation-timing-function: ease-in-out; }
  88.9% { left: 5%; animation-timing-function: ease-in; }
  100% { left: 50%; }
}
@keyframes cylonFill {
  to {
    left: 50%;
    width: 100%;
    max-width: 100%;
    border-radius: 0;
    background: linear-gradient(180deg, #ff4a4a 0%, #ff0000 45%, #b00000 100%);
    box-shadow: 0 0 18px 4px rgba(255, 0, 0, 0.55);
  }
}
@keyframes cylonShrink {
  from { width: 100%; max-width: 100%; }
}
body:not(.cylon-game-live) .cylon-eye {
  animation: cylonIntro 11.7s linear forwards, cylonFill 0.9s ease-out 11.7s forwards;
}
body:not(.cylon-game-live) .cylon-eye::before,
body:not(.cylon-game-live) .cylon-eye::after {
  animation: cylonTrail 2.6s ease-in-out infinite alternate, cylonFade 0.6s ease-out 11.7s forwards;
}
@keyframes cylonFade {
  to { opacity: 0; }
}
body.cylon-game-live .cylon-eye {
  animation: cylonShrink 0.7s ease-out, cylonSweep 2.6s ease-in-out -1.3s infinite alternate;
}


@media (prefers-reduced-motion: reduce) {
  .cylon-eye,
  .cylon-eye::after {
    animation: none;
  }

  .cylon-eye {
    left: 50%;
  }

  body:not(.cylon-game-live) .cylon-eye {
    animation: cylonFill 0s forwards;
  }

  .cylon-eye::after {
    opacity: 0.4;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      ellipse 70% 60% at 50% 50%,
      rgba(255, 40, 40, 0.4),
      transparent 70%
    );
  }
}


`;var Vo=`/* Cylon Defense: The combat nav: control box, the fade between civil and combat chrome, the mobile layout.
 * One of the stylesheets index.html links in order; the order is the cascade (README.md, "Stylesheets"). */
/*
 * Combat nav control box — brand/link/theme heights live in site.css;
 * game widgets share the same midline here.
 */
.site-nav-inner .cylon-game-toggle,
.site-nav-inner .cylon-raptor-btn,
.site-nav-inner .cylon-settings-toggle,
.site-nav-inner .cylon-score {
  height: var(--nav-control-h);
  min-height: var(--nav-control-h);
  max-height: var(--nav-control-h);
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  line-height: 1;
  vertical-align: middle;
}


/* Fade chrome, brand, theme ↔ settings — game toggle stays put */
.site-brand,
.site-nav-menu,
.site-nav-game,
.theme-toggle,
.site-nav-tools .cylon-settings {
  transition: opacity calc(var(--cylon-desolate-fade, 1.6s) * 0.45) ease;
  opacity: 1;
}


.site-nav-inner.is-nav-fading .site-brand,
.site-nav-inner.is-nav-fading .site-nav-menu,
.site-nav-inner.is-nav-fading .site-nav-game,
.site-nav-inner.is-nav-fading .theme-toggle,
.site-nav-inner.is-nav-fading .site-nav-tools .cylon-settings {
  opacity: 0;
  pointer-events: none;
}


/* Combat: settings gear takes the theme button's slot */
body.cylon-nav-combat .theme-toggle {
  display: none;
}


body:not(.cylon-nav-combat) .site-nav-tools .cylon-settings {
  display: none;
}


@media (prefers-reduced-motion: reduce) {
  .site-brand,
  .site-nav-menu,
  .site-nav-game,
  .theme-toggle,
  .site-nav-tools .cylon-settings {
    transition: none;
  }

  .site-nav-inner.is-nav-fading .site-brand,
  .site-nav-inner.is-nav-fading .site-nav-menu,
  .site-nav-inner.is-nav-fading .site-nav-game,
  .site-nav-inner.is-nav-fading .theme-toggle,
  .site-nav-inner.is-nav-fading .site-nav-tools .cylon-settings {
    opacity: 1;
    pointer-events: auto;
  }
}


body.cylon-nav-combat .site-nav-menu-primary {
  display: none !important;
}


.site-nav-game:not([hidden]),
body.cylon-nav-combat .site-nav-game {
  display: flex;
}


body:not(.cylon-nav-combat) .site-nav-power {
  margin-left: auto;
}


.site-nav-game .cylon-help-btn {
  flex: 0 0 auto;
}


.cylon-help-btn .cylon-raptor-btn-label {
  letter-spacing: 0.06em;
}


.cylon-help-label-short {
  display: none;
}


@media (max-width: 819px) {
  /* Compact help control — sits with gear on the game row */
  .cylon-help-label-full {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .cylon-help-label-short {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1;
  }

  .cylon-help-btn {
    width: var(--nav-control-h);
    min-width: var(--nav-control-h);
    max-width: var(--nav-control-h);
    padding: 0;
    justify-content: center;
  }

  /* Icon-only ability buttons on narrow screens */
  #cylon-grenade-btn,
  #cylon-raptor-btn {
    padding: 0.35rem 0.45rem;
    min-width: 2.4rem;
    justify-content: center;
  }

  #cylon-grenade-btn .cylon-ability-icon,
  #cylon-raptor-btn .cylon-ability-icon {
    width: 1.35rem;
    height: 1.35rem;
  }

  #cylon-grenade-btn .cylon-raptor-btn-label,
  #cylon-raptor-btn .cylon-raptor-btn-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  #cylon-grenade-btn .cylon-raptor-btn-cd,
  #cylon-raptor-btn .cylon-raptor-btn-cd {
    position: absolute;
    right: -0.15rem;
    top: -0.35rem;
    min-width: 1.25rem;
    padding: 0.08rem 0.22rem;
    font-size: 0.72rem;
  }

  /*
   * Combat row: [game bar… ?] · power · gear
   * Brand fades away so controls shift left; power sits between help and settings.
   */
  body.cylon-nav-combat .site-nav-inner {
    flex-wrap: nowrap;
    gap: 0.35rem 0.4rem;
  }

  body.cylon-nav-combat .site-brand {
    flex: 0 0 0;
    width: 0;
    min-width: 0;
    max-width: 0;
    margin: 0;
    padding: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    border: none;
    transform: none;
    transition: opacity calc(var(--cylon-desolate-fade, 1.6s) * 0.45) ease;
  }

  body.cylon-nav-combat .site-nav-game {
    flex: 1 1 auto;
    flex-wrap: nowrap;
    justify-content: flex-start;
    gap: 0.3rem 0.35rem;
    min-width: 0;
    margin-top: 0;
    padding-top: 0;
    border-top: none;
    height: var(--nav-control-h);
    min-height: var(--nav-control-h);
  }

  body.cylon-nav-combat .site-nav-power {
    order: 3;
    margin-left: 0;
  }

  body.cylon-nav-combat .site-nav-tools {
    order: 4;
  }

  body.cylon-nav-combat .cylon-score {
    gap: 0.2rem;
  }

  body.cylon-nav-combat .cylon-score-label {
    font-size: 0.58rem;
  }
}

/*
 * Phones: one combat row overlaps its own buttons, so the nav takes two rows —
 * The CIC · power · gear, then the game bar across the full width.
 */
@media (max-width: 679px) {
  body.cylon-nav-combat .site-nav-inner {
    flex-wrap: wrap;
    row-gap: 0.5rem;
  }

  body.cylon-nav-combat .site-brand {
    flex: 0 0 auto;
    width: auto;
    min-width: 0;
    max-width: none;
    margin-right: auto;
    opacity: 1;
    overflow: visible;
    pointer-events: auto;
    transform: translateY(-0.05em);
  }

  body.cylon-nav-combat .site-nav-game {
    order: 5;
    flex: 1 0 100%;
    justify-content: space-between;
  }
}

/* Install and Share (games/_kit/ui/install-bar.tsx) when the address opens The CIC. The game bar has no room
   for two more buttons on a phone, so they sit in the bottom corner, which no control uses. */
.cylon-install {
  position: fixed;
  left: 0.5rem;
  bottom: 0.5rem;
  z-index: 1500;
  display: inline-flex;
  padding: 0.25rem;
  border-radius: 8px;
  background: rgba(5, 6, 13, 0.85);
  --kit-install-accent: #ff3b3b;
}
.cylon-install:empty { display: none; }
/* The pill sits at the screen's bottom, so the address opens above it. */
.cylon-install .kit-install-url { top: auto; bottom: calc(100% + 0.4rem); left: 0; right: auto; }
@media (min-width: 601px) {
  .cylon-install .kit-install-btn { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
}
/* On a phone the buttons are icon squares (the kit's), and "Link copied" opens above the pill. */
.cylon-install .kit-install-status:not(:empty) { top: auto; bottom: calc(100% + 0.4rem); right: auto; left: 0; }
`;var $o=`/* Cylon Defense: The How to Play overlay.
 * One of the stylesheets index.html links in order; the order is the cascade (README.md, "Stylesheets"). */
.cylon-help {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(4, 6, 10, 0.72);
  backdrop-filter: blur(6px);
}


.cylon-help[hidden] {
  display: none !important;
}


.cylon-help-panel {
  width: min(100%, 24rem);
  max-height: min(88vh, 36rem);
  overflow: auto;
  padding: 1.35rem 1.25rem 1.25rem;
  background: linear-gradient(180deg, #1a2030 0%, #10151f 100%);
  border: 1px solid var(--rail-edge);
  box-shadow:
    0 0 0 1px rgba(255, 60, 60, 0.15),
    0 20px 50px rgba(0, 0, 0, 0.55);
  text-align: left;
}


.cylon-help-kicker {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--steel);
  text-align: center;
}


.cylon-help-title {
  margin: 0.35rem 0 0.35rem;
  font-family: var(--font-display);
  font-size: 1.35rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--crimson-hot);
  text-shadow: 0 0 16px rgba(255, 40, 40, 0.45);
  text-align: center;
}


.cylon-help-platform {
  margin: 0 0 0.9rem;
  font-family: var(--font-display);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--steel-bright);
  text-align: center;
}


.cylon-help-body {
  margin: 0 0 1rem;
  color: var(--text);
  font-size: 0.92rem;
  line-height: 1.45;
}


.cylon-help-body ol {
  margin: 0;
  padding-left: 1.2rem;
}


.cylon-help-body li {
  margin: 0 0 0.55rem;
}


.cylon-help-body li:last-child {
  margin-bottom: 0;
}


.cylon-help-body kbd {
  display: inline-block;
  padding: 0.05rem 0.35rem;
  border: 1px solid var(--rail-edge);
  border-bottom-width: 2px;
  font-family: var(--font-display);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--crimson-hot);
  background: rgba(0, 0, 0, 0.35);
}


.cylon-help-panel .cylon-gameover-btn {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
}



/* After Game Off, an installed app that cannot close itself says how to. */
.cylon-exit-hint {
  position: fixed;
  left: 50%;
  bottom: 3.75rem; /* above Install and Share's corner pill */
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
`;var Uo=`/* Cylon Defense: The touch-play layout, the reticle, and the KO and hull readouts.
 * One of the stylesheets index.html links in order; the order is the cascade (README.md, "Stylesheets"). */
/*
 * Touch play: don't pan the document; keep nav / bots tappable.
 * The root's overflow is held by src/scroll-lock.ts (html.cylon-scroll-held, fx.css).
 */
body.cylon-touch-play {
  overscroll-behavior: none;
  touch-action: none;
}


body.cylon-touch-play main {
  /* Page surface was above the pip (z 1058 > 1025) and ate drags as scrolls */
  pointer-events: none !important;
}


body.cylon-touch-play .site-nav,
body.cylon-touch-play .site-nav * {
  touch-action: manipulation;
  pointer-events: auto;
}


body.cylon-touch-play .cylon-bot {
  touch-action: manipulation;
  pointer-events: auto;
}


/*
 * Dodge pip — above main (1058) so it can be grabbed; below nav (2200),
 * help/gameover (2100), and nuke/raptor FX (~1950–2000). Bots stay at 1061
 * so battlefield layering is unchanged; a second finger still hits a bot
 * wherever the pip isn't.
 * Mobile (drag to dodge): green. Desktop (.is-mouse-follow attack cursor): red.
 */
.cylon-reticle {
  position: fixed;
  left: 0;
  top: 0;
  width: 56px;
  height: 56px;
  margin: -28px 0 0 -28px;
  z-index: 1080;
  pointer-events: auto;
  touch-action: none;
  cursor: grab;
  filter: drop-shadow(0 0 8px rgba(60, 220, 100, 0.55));
}


.cylon-reticle[hidden] {
  display: none !important;
}


/* Desktop: sit on the mouse; let clicks pass through to bots / UI */
.cylon-reticle.is-mouse-follow {
  pointer-events: none;
  cursor: none;
  filter: drop-shadow(0 0 8px rgba(255, 60, 60, 0.55));
}


.cylon-reticle.is-dragging {
  cursor: grabbing;
}


.cylon-reticle-ring {
  position: absolute;
  inset: 4px;
  border: 2px solid rgba(70, 230, 120, 0.95);
  border-radius: 50%;
  box-shadow: inset 0 0 10px rgba(40, 200, 90, 0.35);
}


.cylon-reticle.is-mouse-follow .cylon-reticle-ring {
  border-color: rgba(255, 90, 90, 0.95);
  box-shadow: inset 0 0 10px rgba(255, 40, 40, 0.35);
}


.cylon-reticle-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px 3px rgba(60, 230, 110, 0.9);
}


.cylon-reticle.is-mouse-follow .cylon-reticle-core {
  box-shadow: 0 0 10px 3px rgba(255, 80, 60, 0.9);
}


.cylon-score {
  gap: 0.35rem;
  font-family: var(--font-display);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  color: var(--steel);
  user-select: none;
  white-space: nowrap;
  border: 1px solid transparent;
  padding: 0 0.15rem;
  /* Match brand: display caps read high without a slight nudge */
  transform: translateY(0.04em);
}


.cylon-score-label {
  text-transform: uppercase;
  opacity: 0.85;
}


.cylon-score-value {
  color: var(--crimson-hot);
  font-weight: 700;
  font-size: 0.95rem;
  min-width: 1.25ch;
  text-shadow: 0 0 8px rgba(255, 40, 40, 0.45);
  transition: transform 0.15s ease, color 0.2s ease, text-shadow 0.2s ease;
}


.cylon-score-value.is-bump {
  transform: scale(1.25);
  color: #fff;
}


/* HP color is set in JS (smooth green↔yellow↔red lerp); heal still flashes */
#cylon-hits-value {
  transition: transform 0.15s ease, color 0.25s ease, text-shadow 0.25s ease;
}


.cylon-score-value.is-heal,
#cylon-hits-value.is-heal {
  transform: scale(1.2);
  color: #b8ffc8 !important;
  text-shadow: 0 0 10px rgba(80, 255, 140, 0.65) !important;
}


.cylon-score-cap {
  color: var(--steel);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
}


`;var Xo=`/* Cylon Defense: The game-over panel: the initials entry, the buttons and the board.
 * One of the stylesheets index.html links in order; the order is the cascade (README.md, "Stylesheets"). */
.cylon-gameover {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(4, 6, 10, 0.72);
  backdrop-filter: blur(6px);
}


.cylon-gameover[hidden] {
  display: none !important;
}


.cylon-gameover-panel {
  width: min(100%, 22rem);
  padding: 1.35rem 1.25rem 1.25rem;
  background: linear-gradient(180deg, #1a2030 0%, #10151f 100%);
  border: 1px solid var(--rail-edge);
  box-shadow:
    0 0 0 1px rgba(255, 60, 60, 0.15),
    0 20px 50px rgba(0, 0, 0, 0.55);
  text-align: center;
}


.cylon-gameover-kicker {
  margin: 0;
  font-family: var(--font-display);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--steel);
}


.cylon-gameover-title {
  margin: 0.35rem 0 0.5rem;
  font-family: var(--font-display);
  font-size: 1.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--crimson-hot);
  text-shadow: 0 0 16px rgba(255, 40, 40, 0.45);
}


.cylon-gameover-reason {
  margin: 0 0 0.85rem;
  color: var(--text-muted);
  font-size: 0.95rem;
}


.cylon-gameover-stats {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  margin: 0 0 1.1rem;
  font-family: var(--font-display);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--steel-bright);
}


.cylon-gameover-stats em {
  font-style: normal;
  color: var(--crimson-hot);
  font-size: 1.15rem;
  margin-right: 0.2rem;
}


.cylon-gameover-entry-label {
  margin: 0 0 0.55rem;
  font-family: var(--font-display);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--steel);
}


.cylon-initials {
  display: flex;
  justify-content: center;
  gap: 0.7rem;
  margin-bottom: 0.45rem;
}


.cylon-initial-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}


.cylon-initial-spin {
  width: 2.4rem;
  height: 1.15rem;
  padding: 0;
  line-height: 1;
  font-size: 0.65rem;
  color: var(--crimson-hot);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  opacity: 0.75;
}


.cylon-initial-spin:hover,
.cylon-initial-spin:focus-visible {
  opacity: 1;
  color: #fff;
  border-color: var(--rail-edge);
  outline: none;
}


.cylon-initial {
  width: 2.4rem;
  height: 2.7rem;
  display: grid;
  place-items: center;
  padding: 0;
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
  color: #fff;
  background: #0a0d14;
  border: 1px solid var(--rail-edge);
  border-bottom-color: var(--crimson);
  cursor: pointer;
  user-select: none;
}


.cylon-initial:focus,
.cylon-initial.is-active {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
  box-shadow: 0 0 12px rgba(255, 60, 60, 0.35);
}


.cylon-gameover-entry-hint {
  margin: 0 0 0.7rem;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.cylon-gameover-entry-error {
  margin: 0 0 0.55rem;
  font-family: var(--font-display);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ffb4b4;
}

.cylon-gameover-entry-error[hidden] {
  display: none;
}


.cylon-gameover-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  justify-content: center;
  margin-top: 0.85rem;
}


.cylon-gameover-btn {
  font-family: var(--font-display);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(180deg, #8a1515 0%, #5a0c0c 100%);
  border: 1px solid #c03030;
  padding: 0.55rem 1rem;
  cursor: pointer;
}


.cylon-gameover-actions .cylon-gameover-btn {
  margin-top: 0;
}


.cylon-gameover-btn.is-ghost {
  background: transparent;
  border-color: var(--rail-edge);
  color: var(--muted);
}


.cylon-gameover-btn:hover {
  filter: brightness(1.12);
}


.cylon-gameover-btn.is-ghost:hover {
  filter: none;
  color: var(--text);
  border-color: var(--crimson);
}


.cylon-gameover-board .cylon-high-scores {
  text-align: left;
  margin-bottom: 0.9rem;
  max-height: 12rem;
}



.cylon-hs-tabs {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  margin: 0 0 0.6rem;
}

.cylon-hs-tab {
  font-family: var(--font-display);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  background: transparent;
  border: 1px solid var(--rail-edge);
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}

.cylon-hs-tab[aria-selected="true"] {
  color: #fff;
  border-color: #c03030;
  background: linear-gradient(180deg, #8a1515 0%, #5a0c0c 100%);
}

.cylon-hs-tab:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.cylon-gameover-alltime {
  margin: 0 0 0.6rem;
  font-family: var(--font-display);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffd24a;
}

.cylon-gameover-alltime[hidden] {
  display: none;
}
`;var Ko=`/* Cylon Defense: The settings gear and its panel.
 * One of the stylesheets index.html links in order; the order is the cascade (README.md, "Stylesheets"). */
.cylon-settings {
  position: relative;
}


.cylon-settings-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--nav-control-h, 2.25rem);
  height: var(--nav-control-h, 2.25rem);
  padding: 0;
  line-height: 1;
  font-size: 1.15rem;
  color: var(--steel-bright);
  box-sizing: border-box;
  background: transparent;
  border: 1px solid var(--rail-edge);
  cursor: pointer;
}


.cylon-settings-toggle:hover,
.cylon-settings-toggle[aria-expanded="true"] {
  color: var(--text);
  border-color: var(--crimson-dim);
}


.cylon-settings-panel {
  position: absolute;
  top: calc(100% + 0.55rem);
  right: 0;
  z-index: 2300;
  min-width: 14rem;
  max-width: min(18rem, calc(100vw - 1.5rem));
  padding: 0.75rem 0.85rem;
  background: var(--surface);
  border: 1px solid var(--rail-edge);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45);
  color: var(--text);
}


.cylon-settings-title {
  font-family: var(--font-display);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--steel);
  margin: 0 0 0.55rem;
}


.cylon-setting {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  color: var(--text-muted);
  margin: 0.35rem 0;
  cursor: pointer;
  user-select: none;
}


.cylon-setting input[type="checkbox"] {
  accent-color: var(--crimson);
  width: 0.95rem;
  height: 0.95rem;
  margin: 0;
  flex: 0 0 auto;
}


.cylon-setting-slider {
  flex-wrap: wrap;
  cursor: default;
  gap: 0.35rem 0.5rem;
}


.cylon-setting-slider > span {
  flex: 1 1 100%;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--steel);
}


.cylon-setting-slider input[type="range"] {
  flex: 1 1 auto;
  width: 100%;
  height: 0.35rem;
  margin: 0;
  accent-color: var(--crimson);
  cursor: pointer;
}


.cylon-settings-hint {
  margin: 0.65rem 0 0;
  font-size: 0.75rem;
  line-height: 1.35;
  color: var(--steel);
}


.cylon-settings-hint kbd {
  font-family: var(--font-display);
  font-size: 0.7rem;
  padding: 0.05rem 0.3rem;
  border: 1px solid var(--rail-edge);
  background: var(--bg);
  color: var(--text);
}


`;var Wo=`/* Cylon Defense: The Game On toggle, the grenade and raptor buttons, and the high-score list.
 * One of the stylesheets index.html links in order; the order is the cascade (README.md, "Stylesheets"). */
.cylon-game-toggle {
  position: relative;
  gap: 0.4rem;
  width: 7.75rem;
  min-width: 7.75rem;
  max-width: 7.75rem;
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0 0.55rem;
  border: 1px solid var(--rail-edge);
  background: var(--surface);
  color: var(--steel-bright);
  cursor: pointer;
  touch-action: manipulation;
  flex: 0 0 7.75rem;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease,
    width 0.2s ease, min-width 0.2s ease, max-width 0.2s ease, padding 0.2s ease;
}


.cylon-game-toggle-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.cylon-game-toggle-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--steel);
  box-shadow: none;
  flex: 0 0 auto;
}


.cylon-game-toggle.is-on {
  color: #e8ffe8;
  border-color: #2f8f3a;
  background: linear-gradient(180deg, #1a3d22 0%, #102416 100%);
  box-shadow: 0 0 12px rgba(40, 160, 60, 0.35);
}


.cylon-game-toggle.is-on .cylon-game-toggle-dot {
  background: #3dff6a;
  box-shadow: 0 0 8px 2px rgba(60, 255, 100, 0.75);
}


/* Mobile: Game On collapses to the green power pip; Game Off keeps full label */
@media (max-width: 819px) {
  .cylon-game-toggle.is-on {
    width: var(--nav-control-h);
    min-width: var(--nav-control-h);
    max-width: var(--nav-control-h);
    flex: 0 0 var(--nav-control-h);
    padding: 0;
    gap: 0;
    justify-content: center;
  }

  .cylon-game-toggle.is-on .cylon-game-toggle-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .cylon-game-toggle.is-on .cylon-game-toggle-dot {
    width: 0.72rem;
    height: 0.72rem;
  }
}


.cylon-game-toggle:not(.is-on) {
  color: var(--text-muted);
  border-color: var(--rail-edge);
  opacity: 0.9;
}


.cylon-game-toggle:hover {
  border-color: var(--crimson-dim);
}


.cylon-raptor-btn {
  gap: 0.35rem;
  font-family: var(--font-display);
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--steel-bright);
  background: transparent;
  border: 1px solid var(--rail-edge);
  padding: 0 0.45rem;
  cursor: pointer;
  touch-action: manipulation;
  position: relative;
  z-index: 1;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}


.cylon-ability-icon {
  width: 1.15rem;
  height: 1.15rem;
  flex: 0 0 auto;
  display: block;
}


.cylon-raptor-btn:hover:not(:disabled) {
  color: var(--text);
  border-color: var(--crimson-dim);
}


.cylon-raptor-btn:disabled {
  cursor: not-allowed;
}


.cylon-raptor-btn:disabled:not(.is-cooling):not(.is-armed) {
  opacity: 0.45;
}


.cylon-raptor-btn.is-cooling {
  opacity: 1;
  color: rgba(255, 255, 255, 0.55);
  border-color: rgba(255, 80, 80, 0.55);
  background: rgba(40, 8, 8, 0.55);
}


.cylon-raptor-btn.is-cooling .cylon-raptor-btn-label {
  opacity: 0.55;
}


.cylon-raptor-btn.is-armed {
  color: #fff4e0;
  border-color: #e0a020;
  box-shadow: 0 0 10px rgba(255, 160, 40, 0.45);
}


.cylon-raptor-btn-cd {
  display: inline-grid;
  place-items: center;
  min-width: 1.65rem;
  padding: 0.12rem 0.35rem;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: #fff;
  background: linear-gradient(180deg, #c62828 0%, #7a1010 100%);
  border: 1px solid #ff6b6b;
  box-shadow: 0 0 8px rgba(255, 60, 40, 0.45);
}


.cylon-raptor-btn-cd[hidden] {
  display: none;
}


body.cylon-grenade-armed {
  cursor: crosshair;
}


body.cylon-grenade-armed .cylon-bot {
  cursor: crosshair;
}


.cylon-settings-scores-title {
  margin-top: 0.85rem;
}


.cylon-high-scores {
  list-style: none;
  margin: 0 0 0.5rem;
  padding: 0;
  font-size: 0.82rem;
  color: var(--text-muted);
  max-height: 9rem;
  overflow: auto;
}


.cylon-high-scores li {
  display: grid;
  /* rank · initials · date (with year) · score — leave room so Orbitron initials don't collide */
  grid-template-columns: 2.75ch 4.5ch minmax(7.5rem, 1fr) auto;
  align-items: baseline;
  column-gap: 0.75rem;
  padding: 0.2rem 0;
  border-bottom: 1px solid var(--rail-edge);
  font-variant-numeric: tabular-nums;
}


.cylon-high-scores li:last-child {
  border-bottom: none;
}


.cylon-high-scores .cylon-hs-rank {
  color: var(--steel);
  font-variant-numeric: tabular-nums;
}


.cylon-high-scores .cylon-hs-initials {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--text);
  min-width: 0;
  padding-right: 0.15rem;
}


.cylon-high-scores .cylon-hs-date {
  text-align: left;
  white-space: nowrap;
  color: var(--text-muted);
  padding-left: 0.15rem;
}


.cylon-high-scores .cylon-hs-score {
  color: var(--crimson-hot);
  font-family: var(--font-display);
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
}


.cylon-high-scores .cylon-hs-empty {
  display: block;
  color: var(--steel);
  font-style: italic;
}


`;var Yo=`/* Cylon Defense: The grenade blast, the scorched holes, and the page rules that hold while a run is live.
 * One of the stylesheets index.html links in order; the order is the cascade (README.md, "Stylesheets"). */
.cylon-grenade-blast {
  position: absolute;
  width: 300px;
  height: 300px;
  margin: -150px 0 0 -150px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1063;
  background: radial-gradient(
    circle,
    rgba(255, 255, 220, 0.95) 0%,
    rgba(255, 140, 40, 0.75) 28%,
    rgba(255, 40, 20, 0.45) 52%,
    transparent 70%
  );
  box-shadow: 0 0 28px 10px rgba(255, 100, 40, 0.55);
  animation: grenadeBlast 0.45s ease-out forwards;
}


@keyframes grenadeBlast {
  0% {
    transform: scale(0.25);
    opacity: 1;
  }
  100% {
    transform: scale(1.15);
    opacity: 0;
  }
}


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


@media (prefers-reduced-motion: reduce) {
  .cylon-hole-glitch {
    animation: none;
    opacity: 0.4;
    filter: none;
  }
}


.interest-list,
.course-list,
.project-list {
  list-style: none;
  padding: 0;
  margin: 0;
}


.interest-list li,
.course-list li {
  position: relative;
  padding: 0.35rem 0 0.35rem 1.1rem;
  color: var(--text);
}


.interest-list li::before,
.course-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.85em;
  width: 0.45rem;
  height: 2px;
  background: var(--crimson);
  box-shadow: 0 0 6px rgba(255, 40, 40, 0.55);
}


.cylon-gradient {
  /* superseded by .cylon-scanner; keep harmless fallback */
  background: var(--rail);
}


/* Behind page text while Game On — bots spawn here, then rise to the battlefield */
.cylon-ambush-under {
  position: absolute;
  inset: 0;
  width: auto;
  max-width: 100%;
  z-index: 1055;
  pointer-events: none;
  overflow: hidden;
}


/* Page sits above ambush-under so bots can hide behind letters */
body.cylon-game-live main {
  position: relative;
  z-index: 1058;
}


/* No text highlight / long-press select while fighting */
body.cylon-game-live,
body.cylon-game-live * {
  user-select: none !important;
  -webkit-user-select: none !important;
  -webkit-touch-callout: none;
}


/* Scattered page — no point scrolling. src/scroll-lock.ts holds the root, and any wrapper a theme scrolls instead,
 * while a run is live, and refuses the wheel, touch drags and the scroll keys outside the game's own panels. */
body.cylon-game-live {
  overscroll-behavior: none;
}

html.cylon-scroll-held,
.cylon-scroll-held {
  overflow: hidden !important;
  overscroll-behavior: none !important;
}


body.cylon-game-live ::selection {
  background: transparent;
  color: inherit;
}


/* Block accidental link/UI clicks in page content; scroll still works */
body.cylon-game-live main a,
body.cylon-game-live main button,
body.cylon-game-live main input,
body.cylon-game-live main select,
body.cylon-game-live main textarea,
body.cylon-game-live main label,
body.cylon-game-live main summary,
body.cylon-game-live main [role="link"],
body.cylon-game-live main [role="button"] {
  pointer-events: none !important;
  cursor: default;
}


`;var jo=`/* Cylon Defense: The battlefield: drones and their bolts, the raptor, the missiles and the nuke.
 * One of the stylesheets index.html links in order; the order is the cascade (README.md, "Stylesheets"). */
/* —— Ambush battlefield (document-grounded; scrolls with the page) —— */
.cylon-battlefield {
  position: absolute;
  inset: 0; /* sized by in-flow body content — never JS scrollHeight */
  width: auto;
  max-width: 100%;
  z-index: 1060;
  pointer-events: none;
  overflow: hidden; /* keep off-screen marches from widening the page */
}


.cylon-bot {
  position: absolute;
  width: 44px;
  height: 56px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  pointer-events: auto;
  cursor: crosshair;
  /* Above the dodge pip’s former layer; second finger taps hostiles while dragging */
  z-index: 1061;
  touch-action: manipulation;
  transform-origin: 50% 80%;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.55));
  transition: left 0.9s linear, top 0.9s linear;
}


.cylon-bot.is-hiding {
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35)) brightness(0.75);
  opacity: 0.92;
}


.cylon-bot.is-emerging {
  animation: botEmerge 0.55s ease-out forwards;
}


.cylon-bot.is-marching .cylon-bot-legs span:first-child {
  animation: marchLeg 0.28s ease-in-out infinite alternate;
}


.cylon-bot.is-marching .cylon-bot-legs span:last-child {
  animation: marchLeg 0.28s ease-in-out infinite alternate-reverse;
}


.cylon-bot:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 3px;
}


.cylon-bot-body {
  position: absolute;
  inset: 10px 8px 6px;
  background:
    linear-gradient(160deg, #6a7384 0%, #2a313c 45%, #151920 100%);
  border: 1px solid #8a93a3;
  border-radius: 4px 4px 3px 3px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}


.cylon-bot-body::before {
  content: "";
  position: absolute;
  left: 18%;
  right: 18%;
  top: 18%;
  height: 22%;
  background: #0a0c10;
  border: 1px solid #4a5568;
  border-radius: 2px;
  box-shadow: inset 0 0 6px rgba(255, 0, 0, 0.35);
}


.cylon-bot-body::after {
  /* red slit eye */
  content: "";
  position: absolute;
  left: 22%;
  right: 22%;
  top: 24%;
  height: 10%;
  background: linear-gradient(90deg, #660000, #ff2222 45%, #fff 50%, #ff2222 55%, #660000);
  border-radius: 1px;
  box-shadow: 0 0 6px 1px rgba(255, 0, 0, 0.85);
  animation: botEyePulse 0.9s ease-in-out infinite alternate;
}


.cylon-bot-legs {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 2px;
  height: 10px;
  display: flex;
  justify-content: space-between;
}


.cylon-bot-legs span {
  width: 7px;
  height: 100%;
  background: linear-gradient(180deg, #5a6575, #1a1f28);
  border-radius: 1px;
  border: 1px solid #7a8494;
}


.cylon-bot.is-ko {
  pointer-events: none;
  animation: botKo 0.55s ease-in forwards;
}


.cylon-bolt {
  position: absolute;
  width: 10px;
  height: 3px;
  margin-left: -5px;
  margin-top: -1.5px;
  border-radius: 2px;
  background: linear-gradient(90deg, #ffaaaa, #ff0000 40%, #ffffff 50%, #ff0000 60%, #aa0000);
  box-shadow:
    0 0 6px 2px rgba(255, 40, 40, 0.95),
    0 0 14px 4px rgba(255, 0, 0, 0.55);
  pointer-events: none;
  z-index: 1062;
  transform-origin: center center;
}


.cylon-impact {
  position: absolute;
  width: 18px;
  height: 18px;
  margin: -9px 0 0 -9px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1062;
  background: radial-gradient(circle, #fff 0%, #ff4444 35%, transparent 70%);
  animation: impactPop 0.28s ease-out forwards;
}


/* Abstract transport strike (Raptor-inspired silhouette) */
.cylon-raptor {
  position: fixed;
  inset: 0;
  z-index: 1950;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
}


.cylon-raptor.is-inbound {
  visibility: visible;
  opacity: 1;
}


.cylon-raptor-skyflash {
  position: absolute;
  inset: 0;
  opacity: 0;
  background:
    radial-gradient(ellipse 80% 45% at 50% 20%, rgba(180, 220, 255, 0.35), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent 45%);
}


.cylon-raptor.is-inbound .cylon-raptor-skyflash {
  animation: raptorSkyFlash 1.85s ease-out forwards;
}


.cylon-raptor-ground {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: 0;
  height: 55%;
  opacity: 0;
  background:
    radial-gradient(ellipse 70% 55% at 50% 100%, rgba(255, 120, 40, 0.45), transparent 70%),
    linear-gradient(180deg, transparent 0%, rgba(255, 60, 20, 0.12) 40%, rgba(40, 10, 0, 0.35) 100%);
  filter: blur(1px);
}


.cylon-raptor.is-inbound .cylon-raptor-ground {
  animation: raptorGroundBloom 1.85s ease-out forwards;
}


.cylon-raptor-ship {
  position: absolute;
  top: 18%;
  left: -24%;
  width: 190px;
  height: 52px;
  filter:
    drop-shadow(0 0 14px rgba(160, 210, 255, 0.55))
    drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45));
  z-index: 2;
}


.cylon-raptor.is-inbound .cylon-raptor-ship {
  animation: raptorFly 1.85s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
}


.cylon-raptor-fuselage {
  position: absolute;
  left: 16%;
  top: 28%;
  width: 58%;
  height: 42%;
  background: linear-gradient(180deg, #e8eef8 0%, #8a96a8 40%, #2a313c 100%);
  border: 1px solid #f2f6ff;
  border-radius: 2px 10px 5px 2px;
  transform: skewX(-12deg);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}


.cylon-raptor-wing {
  position: absolute;
  top: 14%;
  width: 36%;
  height: 24%;
  background: linear-gradient(180deg, #c5d0e0, #3d4654);
  border: 1px solid #dce5f2;
  box-shadow: 0 0 8px rgba(140, 180, 255, 0.25);
}


.cylon-raptor-wing-l {
  left: 6%;
  transform: skewX(-28deg);
}


.cylon-raptor-wing-r {
  right: 4%;
  top: 46%;
  transform: skewX(-18deg) scaleY(0.85);
}


.cylon-raptor-engine {
  position: absolute;
  right: 2%;
  top: 30%;
  width: 18%;
  height: 36%;
  background: radial-gradient(circle, #fff 0%, #9cf 25%, #3af 55%, transparent 75%);
  box-shadow:
    0 0 16px 6px rgba(100, 200, 255, 0.85),
    0 0 40px 14px rgba(40, 120, 255, 0.45);
  border-radius: 50%;
}


.cylon-raptor.is-inbound .cylon-raptor-engine {
  animation: raptorEnginePulse 0.12s ease-in-out infinite alternate;
}


.cylon-raptor-cannon {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, #ffd080 40%, #ff4010 70%, transparent 80%);
  box-shadow:
    0 0 10px 3px rgba(255, 160, 60, 0.95),
    0 0 22px 8px rgba(255, 60, 20, 0.55);
  opacity: 0;
  z-index: 3;
}


.cylon-raptor-cannon-l {
  left: 34%;
  top: 78%;
}


.cylon-raptor-cannon-r {
  left: 52%;
  top: 72%;
}


.cylon-raptor.is-inbound .cylon-raptor-cannon {
  animation: raptorMuzzle 1.85s linear forwards;
}


.cylon-raptor-beam {
  position: absolute;
  top: 85%;
  width: 7px;
  height: 0;
  border-radius: 4px;
  opacity: 0;
  transform-origin: top center;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 210, 120, 0.9) 18%,
    rgba(255, 80, 30, 0.75) 55%,
    rgba(255, 40, 10, 0.15) 100%
  );
  box-shadow:
    0 0 10px 3px rgba(255, 180, 80, 0.95),
    0 0 28px 8px rgba(255, 60, 20, 0.55),
    0 40px 50px 12px rgba(255, 40, 0, 0.25);
  z-index: 1;
}


.cylon-raptor-beam-l {
  left: 36%;
}


.cylon-raptor-beam-r {
  left: 54%;
}


.cylon-raptor-beam-core {
  position: absolute;
  left: 42%;
  top: 80%;
  width: 14px;
  height: 0;
  border-radius: 6px;
  opacity: 0;
  transform-origin: top center;
  background: linear-gradient(
    180deg,
    #fff 0%,
    #ffe9a0 25%,
    rgba(255, 120, 40, 0.85) 70%,
    transparent 100%
  );
  box-shadow:
    0 0 18px 6px rgba(255, 220, 160, 1),
    0 0 48px 16px rgba(255, 80, 20, 0.65);
  z-index: 1;
}


.cylon-raptor.is-inbound .cylon-raptor-beam,
.cylon-raptor.is-inbound .cylon-raptor-beam-core {
  animation: raptorBeam 1.85s linear forwards;
}


.cylon-raptor-strafe {
  position: absolute;
  inset: 12% -5% 0;
  opacity: 0;
  z-index: 0;
  background:
    repeating-linear-gradient(
      98deg,
      transparent 0,
      transparent 26px,
      rgba(255, 240, 200, 0.05) 26px,
      rgba(255, 120, 40, 0.22) 29px,
      rgba(255, 40, 10, 0.35) 31px,
      transparent 34px
    ),
    linear-gradient(
      180deg,
      transparent 0%,
      rgba(255, 180, 80, 0.08) 35%,
      rgba(255, 60, 20, 0.18) 70%,
      rgba(20, 0, 0, 0.25) 100%
    );
  mix-blend-mode: screen;
}


.cylon-raptor.is-inbound .cylon-raptor-strafe {
  animation: raptorStrafe 1.85s ease-out forwards;
}


.cylon-raptor-impacts {
  position: absolute;
  inset: 0;
  z-index: 1;
}


.cylon-raptor-impact {
  position: absolute;
  width: 48px;
  height: 48px;
  margin: -24px 0 0 -24px;
  border-radius: 50%;
  pointer-events: none;
  background:
    radial-gradient(circle, #fff 0%, #ffe08a 18%, #ff6020 42%, rgba(255, 40, 0, 0.35) 62%, transparent 72%);
  box-shadow:
    0 0 20px 8px rgba(255, 140, 40, 0.85),
    0 0 50px 18px rgba(255, 40, 0, 0.4);
  animation: raptorImpact 0.55s ease-out forwards;
}


@keyframes raptorFly {
  /* Enter high, dive into a low attack run early, then climb out */
  0% {
    left: -28%;
    top: 6%;
    transform: rotate(-18deg) scale(0.8);
  }
  12% {
    left: 8%;
    top: 28%;
    transform: rotate(-12deg) scale(0.95);
  }
  22% {
    left: 22%;
    top: 42%;
    transform: rotate(-4deg) scale(1.05);
  }
  45% {
    left: 48%;
    top: 44%;
    transform: rotate(0deg) scale(1.08);
  }
  68% {
    left: 72%;
    top: 36%;
    transform: rotate(6deg) scale(1.02);
  }
  100% {
    left: 112%;
    top: 12%;
    transform: rotate(14deg) scale(0.9);
  }
}


@keyframes raptorEnginePulse {
  from {
    filter: brightness(1);
    transform: scale(1);
  }
  to {
    filter: brightness(1.45);
    transform: scale(1.15);
  }
}


@keyframes raptorMuzzle {
  0%,
  8% {
    opacity: 0;
    transform: scale(0.4);
  }
  12%,
  70% {
    opacity: 1;
    transform: scale(1.15);
  }
  16%,
  24%,
  32%,
  40%,
  48%,
  56%,
  64% {
    opacity: 1;
    transform: scale(1.45);
  }
  20%,
  28%,
  36%,
  44%,
  52%,
  60% {
    opacity: 0.55;
    transform: scale(0.85);
  }
  82%,
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}


@keyframes raptorBeam {
  0%,
  8% {
    opacity: 0;
    height: 0;
    filter: brightness(1);
  }
  14% {
    opacity: 1;
    height: 48vh;
    filter: brightness(1.4);
  }
  22%,
  38%,
  54% {
    opacity: 0.95;
    height: 52vh;
    filter: brightness(1.8);
  }
  30%,
  46% {
    opacity: 0.7;
    height: 40vh;
    filter: brightness(1.1);
  }
  66% {
    opacity: 0.85;
    height: 46vh;
  }
  82%,
  100% {
    opacity: 0;
    height: 12vh;
    filter: brightness(0.6);
  }
}


@keyframes raptorStrafe {
  0%,
  8% {
    opacity: 0;
    transform: translateX(-10%);
  }
  14% {
    opacity: 0.95;
    transform: translateX(-4%);
  }
  40% {
    opacity: 1;
    transform: translateX(0%);
  }
  65% {
    opacity: 0.7;
    transform: translateX(5%);
  }
  100% {
    opacity: 0;
    transform: translateX(12%);
  }
}


@keyframes raptorSkyFlash {
  0%,
  6% {
    opacity: 0;
  }
  12% {
    opacity: 0.9;
  }
  28% {
    opacity: 0.3;
  }
  42% {
    opacity: 0.65;
  }
  100% {
    opacity: 0;
  }
}


@keyframes raptorGroundBloom {
  0%,
  8% {
    opacity: 0;
  }
  16% {
    opacity: 0.95;
  }
  55% {
    opacity: 0.6;
  }
  100% {
    opacity: 0;
  }
}


@keyframes raptorImpact {
  0% {
    transform: scale(0.25);
    opacity: 1;
  }
  55% {
    transform: scale(1.35);
    opacity: 0.9;
  }
  100% {
    transform: scale(2.1);
    opacity: 0;
  }
}


/* Nuke warhead in flight (launched from the eye, seeks the cursor) */
.cylon-nuke-missile {
  position: fixed;
  left: 0;
  top: 0;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1995;
  opacity: 0;
  visibility: hidden;
  background:
    radial-gradient(circle at 35% 35%, #fff 0%, #ffe08a 28%, #ff5a00 60%, #800000 100%);
  box-shadow:
    0 0 10px 4px rgba(255, 160, 40, 0.95),
    0 0 28px 10px rgba(255, 60, 0, 0.55);
}


.cylon-nuke-missile.is-flying {
  opacity: 1;
  visibility: visible;
}


.cylon-nuke-missile.is-flying::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 28px;
  height: 8px;
  margin: -4px 0 0 -22px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 180, 80, 0.85), transparent);
  transform: rotate(var(--nuke-heading, 0deg));
  transform-origin: right center;
  filter: blur(1px);
}


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


/* BSG-style nuclear flash */
.cylon-nuke {
  position: fixed;
  inset: 0;
  z-index: 2000;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
}


.cylon-nuke.is-detonating {
  visibility: visible;
  animation: nukeScreen 2.4s ease-out forwards;
}


.cylon-nuke-flash {
  position: absolute;
  inset: 0;
  background: #fff;
  opacity: 0;
}


.cylon-nuke.is-detonating .cylon-nuke-flash {
  animation: nukeFlash 2.4s ease-out forwards;
}


.cylon-nuke-ball {
  position: absolute;
  left: var(--nuke-x, 50%);
  top: var(--nuke-y, 42%);
  width: 12px;
  height: 12px;
  margin: -6px 0 0 -6px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 40% 35%, #fff 0%, #ffe9a8 18%, #ff8a1a 42%, #ff2a00 62%, rgba(40, 0, 0, 0) 72%);
  opacity: 0;
  transform: scale(0.2);
  filter: blur(0.5px);
  box-shadow:
    0 0 40px 20px rgba(255, 220, 160, 0.85),
    0 0 120px 60px rgba(255, 80, 20, 0.55);
}


.cylon-nuke.is-detonating .cylon-nuke-ball {
  animation: nukeBall 2.4s cubic-bezier(0.15, 0.7, 0.25, 1) forwards;
}


.cylon-nuke-ring {
  position: absolute;
  left: var(--nuke-x, 50%);
  top: var(--nuke-y, 42%);
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border-radius: 50%;
  border: 2px solid rgba(255, 240, 200, 0.85);
  opacity: 0;
  transform: scale(0.3);
  box-shadow: 0 0 24px 4px rgba(255, 180, 80, 0.55);
}


.cylon-nuke.is-detonating .cylon-nuke-ring {
  animation: nukeRing 1.6s ease-out forwards;
}


body.is-nuke-shake {
  animation: nukeShake 0.55s linear;
}


@keyframes nukeScreen {
  0%,
  100% {
    opacity: 1;
  }
}


@keyframes nukeFlash {
  0% {
    opacity: 0;
  }
  4% {
    opacity: 1;
  }
  18% {
    opacity: 0.92;
  }
  45% {
    opacity: 0.35;
  }
  100% {
    opacity: 0;
  }
}


@keyframes nukeBall {
  0% {
    opacity: 0;
    transform: scale(0.15);
  }
  6% {
    opacity: 1;
    transform: scale(1.2);
  }
  35% {
    opacity: 1;
    transform: scale(38);
  }
  100% {
    opacity: 0;
    transform: scale(55);
  }
}


@keyframes nukeRing {
  0% {
    opacity: 0.9;
    transform: scale(0.4);
  }
  100% {
    opacity: 0;
    transform: scale(70);
  }
}


@keyframes nukeShake {
  0%,
  100% {
    transform: translate(0, 0);
  }
  20% {
    transform: translate(-3px, 2px);
  }
  40% {
    transform: translate(3px, -2px);
  }
  60% {
    transform: translate(-2px, -1px);
  }
  80% {
    transform: translate(2px, 1px);
  }
}


`;var Jo=`/* Cylon Defense: The world-ended look: fracture and ash, the scattered glyphs and panels.
 * One of the stylesheets index.html links in order; the order is the cascade (README.md, "Stylesheets"). */
/* —— Desolate world-ended look (Game On) —— */
/* Slower than the nuke flash so glyph scatter reads after the whiteout */
body.cylon-world-ended {
  --cylon-desolate-fade: 2.85s;
}


/* Let blasted glyphs fly past panel edges */
body.cylon-world-ended main,
body.cylon-world-ended #nav-main,
body.cylon-world-ended #nav-contact,
body.cylon-world-ended .page-panel {
  overflow: visible;
}


#nav-main,
#nav-contact,
.page-panel,
main {
  transition:
    filter var(--cylon-desolate-fade, 1.1s) ease,
    color var(--cylon-desolate-fade, 1.1s) ease,
    opacity var(--cylon-desolate-fade, 1.1s) ease;
  filter: none;
}


/* Ashy content panels */
body.cylon-world-ended #nav-main,
body.cylon-world-ended #nav-contact {
  filter: grayscale(0.72) contrast(1.08) brightness(0.78) sepia(0.18);
}


/* Full-viewport fracture / ash — CSS vars reshuffle on each nuke */
body.cylon-world-ended {
  --crack-a: 118deg;
  --crack-b: 28deg;
  --crack-c: 155deg;
  --crack-grain: -18deg;
  --scar-1: 42%;
  --scar-2: 61%;
  --scar-3: 33%;
  --scar-4: 72%;
  --scar-5: 18%;
  --scar-6: 78%;
  --ash-1-x: 18%;
  --ash-1-y: 22%;
  --ash-2-x: 82%;
  --ash-2-y: 70%;
  --ash-3-x: 50%;
  --ash-3-y: 100%;
  --land-shift-x: 0px;
  --land-shift-y: 0px;
  --ash-drift-x: 0px;
  --ash-drift-y: 0px;
  --land-rot: 0deg;
  --land-scale: 1;
  --ash-scale: 1;
  --blast-x: 50%;
  --blast-y: 48%;
  --land-morph-ms: 1.1s;
}


body.cylon-world-ended::before {
  content: "";
  position: fixed;
  inset: -8%;
  z-index: 40;
  pointer-events: none;
  opacity: 0;
  transform: translate(var(--land-shift-x), var(--land-shift-y)) rotate(var(--land-rot)) scale(var(--land-scale));
  transition:
    opacity var(--cylon-desolate-fade, 1.1s) ease,
    transform var(--land-morph-ms, 1.1s) cubic-bezier(0.22, 0.7, 0.2, 1),
    background var(--land-morph-ms, 1.1s) ease;
  background:
    radial-gradient(
      ellipse 48% 42% at var(--blast-x) var(--blast-y),
      rgba(40, 12, 8, 0.45) 0%,
      transparent 62%
    ),
    linear-gradient(
      var(--crack-a),
      transparent 0%,
      transparent calc(var(--scar-1) - 0.4%),
      rgba(20, 16, 12, 0.55) var(--scar-1),
      transparent calc(var(--scar-1) + 0.5%),
      transparent calc(var(--scar-2) - 0.4%),
      rgba(12, 12, 12, 0.4) var(--scar-2),
      transparent calc(var(--scar-2) + 0.55%)
    ),
    linear-gradient(
      var(--crack-b),
      transparent 0%,
      transparent calc(var(--scar-3) - 0.35%),
      rgba(0, 0, 0, 0.35) var(--scar-3),
      transparent calc(var(--scar-3) + 0.45%),
      transparent calc(var(--scar-4) - 0.35%),
      rgba(40, 28, 20, 0.3) var(--scar-4),
      transparent calc(var(--scar-4) + 0.5%)
    ),
    linear-gradient(
      var(--crack-c),
      transparent 0%,
      transparent calc(var(--scar-5) - 0.3%),
      rgba(0, 0, 0, 0.32) var(--scar-5),
      transparent calc(var(--scar-5) + 0.4%),
      transparent calc(var(--scar-6) - 0.3%),
      rgba(25, 18, 12, 0.28) var(--scar-6),
      transparent calc(var(--scar-6) + 0.45%)
    ),
    repeating-linear-gradient(
      var(--crack-grain),
      transparent 0 38px,
      rgba(0, 0, 0, 0.14) 38px 39px,
      transparent 39px 71px
    );
  mix-blend-mode: multiply;
}


body.cylon-world-ended::before {
  opacity: 0.9;
}


body.cylon-world-ended::after {
  content: "";
  position: fixed;
  inset: -6%;
  z-index: 41;
  pointer-events: none;
  opacity: 0;
  transform: translate(var(--ash-drift-x), var(--ash-drift-y)) scale(var(--ash-scale));
  transition:
    opacity var(--cylon-desolate-fade, 1.1s) ease,
    transform var(--land-morph-ms, 1.1s) cubic-bezier(0.22, 0.7, 0.2, 1),
    background var(--land-morph-ms, 1.1s) ease;
  background:
    radial-gradient(ellipse 55% 40% at var(--ash-1-x) var(--ash-1-y), rgba(0, 0, 0, 0.28), transparent 70%),
    radial-gradient(ellipse 40% 50% at var(--ash-2-x) var(--ash-2-y), rgba(30, 20, 10, 0.22), transparent 65%),
    radial-gradient(ellipse 50% 35% at var(--ash-3-x) var(--ash-3-y), rgba(0, 0, 0, 0.2), transparent 70%),
    radial-gradient(ellipse 35% 30% at var(--blast-x) var(--blast-y), rgba(60, 20, 10, 0.22), transparent 68%);
}


body.cylon-world-ended::after {
  opacity: 1;
}


/* Per-glyph / panel / block nuke scatter — rest pose, then fade/blow when .cylon-glyphs-blown */
.cylon-scatter-char {
  display: inline-block;
  position: relative;
  z-index: 1;
  white-space: pre;
  transform: translate(0, 0) rotate(0deg);
  opacity: 1;
  /* Combat weapon kicks: snappy. Opening scatter overrides via .cylon-glyphs-blowing */
  transition:
    transform 0.32s cubic-bezier(0.22, 0.7, 0.2, 1),
    color 0.45s ease,
    text-shadow 0.45s ease,
    opacity 0.45s ease;
}


body.cylon-glyphs-blown .cylon-scatter-char {
  transform: translate(var(--sx, 0), var(--sy, 0)) rotate(var(--sr, 0deg));
  color: color-mix(in srgb, currentColor 38%, #5a5854 62%);
  text-shadow:
    1.8px 0 0 rgba(160, 35, 35, 0.5),
    -1.8px 0.4px 0 rgba(40, 90, 160, 0.45),
    0 1.5px 0 rgba(0, 0, 0, 0.4);
}


body.cylon-glyphs-blowing .cylon-scatter-char {
  transition:
    transform var(--cylon-desolate-fade, 1.6s) cubic-bezier(0.15, 0.85, 0.25, 1),
    color var(--cylon-desolate-fade, 1.6s) ease,
    text-shadow var(--cylon-desolate-fade, 1.6s) ease,
    opacity calc(var(--cylon-desolate-fade, 1.6s) * 0.85) ease;
}


/* Whole page panels + section chrome fly with the glyphs */
.page-panel.cylon-scatter-panel,
.cylon-scatter-block {
  transform: translate(0, 0) rotate(0deg);
  opacity: 1;
  transition:
    transform 0.32s cubic-bezier(0.22, 0.7, 0.2, 1),
    opacity 0.45s ease,
    filter 0.45s ease,
    border-color 0.45s ease,
    box-shadow 0.45s ease;
  will-change: transform, opacity;
}


body.cylon-glyphs-blowing .page-panel.cylon-scatter-panel,
body.cylon-glyphs-blowing .cylon-scatter-block {
  transition:
    transform var(--cylon-desolate-fade, 1.6s) cubic-bezier(0.15, 0.85, 0.25, 1),
    opacity calc(var(--cylon-desolate-fade, 1.6s) * 0.9) ease,
    filter var(--cylon-desolate-fade, 1.6s) ease,
    border-color var(--cylon-desolate-fade, 1.6s) ease,
    box-shadow var(--cylon-desolate-fade, 1.6s) ease;
}


/* Keep panel opacity up so letter debris stays readable; shell still drifts */
body.cylon-glyphs-blown .page-panel.cylon-scatter-panel {
  transform: translate(var(--sx, 0), var(--sy, 0)) rotate(var(--sr, 0deg)) scale(0.96);
  filter: grayscale(0.8) brightness(0.7) sepia(0.15);
  pointer-events: none;
}


body.cylon-glyphs-blown .cylon-scatter-block {
  transform: translate(var(--sx, 0), var(--sy, 0)) rotate(var(--sr, 0deg));
  opacity: 0.55;
  pointer-events: none;
  border-color: transparent;
  box-shadow: none;
}


/* List chrome (bullets, rules) otherwise stays planted after glyphs fly */
.interest-list li::before,
.course-list li::before {
  transition:
    opacity calc(var(--cylon-desolate-fade, 1.6s) * 0.7) ease,
    transform var(--cylon-desolate-fade, 1.6s) cubic-bezier(0.15, 0.85, 0.25, 1),
    box-shadow calc(var(--cylon-desolate-fade, 1.6s) * 0.7) ease;
}


body.cylon-glyphs-blown .interest-list li::before,
body.cylon-glyphs-blown .course-list li::before {
  opacity: 0;
  transform: translate(var(--mx, 12px), var(--my, -28px)) rotate(var(--mr, -25deg));
  box-shadow: none;
}


.project-list > li,
.page-panel h2 {
  transition:
    border-color var(--cylon-desolate-fade, 1.6s) ease,
    opacity var(--cylon-desolate-fade, 1.6s) ease;
}


body.cylon-glyphs-blown .project-list > li {
  border-bottom-color: transparent;
}


body.cylon-glyphs-blown .page-panel h2 {
  border-bottom-color: transparent;
}


/* Chromatic fracture on block type when glyphs aren't wrapped yet */
body.cylon-world-ended #nav-main h1,
body.cylon-world-ended #nav-main h2,
body.cylon-world-ended #nav-main h3,
body.cylon-world-ended #nav-contact h1,
body.cylon-world-ended #nav-contact h2,
body.cylon-world-ended #nav-contact h3 {
  position: relative;
  color: color-mix(in srgb, currentColor 35%, #5a5854 65%);
  letter-spacing: 0.04em;
  text-shadow:
    2.5px 0 0 rgba(160, 35, 35, 0.55),
    -2.5px 0.5px 0 rgba(40, 90, 160, 0.5),
    0 2px 0 rgba(0, 0, 0, 0.45),
    1px 1px 0 rgba(20, 20, 20, 0.35);
  transition:
    color var(--cylon-desolate-fade, 1.1s) ease,
    text-shadow var(--cylon-desolate-fade, 1.1s) ease;
}


body.cylon-world-ended #nav-main p,
body.cylon-world-ended #nav-main li,
body.cylon-world-ended #nav-contact p,
body.cylon-world-ended #nav-contact li {
  color: color-mix(in srgb, currentColor 40%, #6e6a64 60%);
  text-shadow:
    1.4px 0 0 rgba(130, 40, 40, 0.4),
    -1.4px 0 0 rgba(35, 70, 130, 0.35),
    0 1px 0 rgba(0, 0, 0, 0.3);
}


body.cylon-world-ended #nav-main a,
body.cylon-world-ended #nav-contact a {
  color: color-mix(in srgb, currentColor 45%, #7a6a5a 55%);
  text-shadow:
    1.2px 0 0 rgba(140, 50, 40, 0.45),
    -1.2px 0 0 rgba(40, 80, 140, 0.4);
  text-decoration-thickness: 1.5px;
  text-decoration-color: rgba(80, 70, 60, 0.55);
}


@media (prefers-reduced-motion: reduce) {
  body.cylon-world-ended #nav-main,
  body.cylon-world-ended #nav-contact {
    transition: filter 0.4s ease;
    filter: grayscale(0.65) brightness(0.85);
  }

  body.cylon-world-ended::before,
  body.cylon-world-ended::after {
    opacity: 0.35;
    transition: opacity 0.4s ease;
  }

  body.cylon-world-ended #nav-main h1,
  body.cylon-world-ended #nav-main h2,
  body.cylon-world-ended #nav-main h3,
  body.cylon-world-ended #nav-contact h1,
  body.cylon-world-ended #nav-contact h2,
  body.cylon-world-ended #nav-contact h3,
  body.cylon-world-ended #nav-main p,
  body.cylon-world-ended #nav-main li,
  body.cylon-world-ended #nav-contact p,
  body.cylon-world-ended #nav-contact li,
  body.cylon-world-ended #nav-main a,
  body.cylon-world-ended #nav-contact a,
  body.cylon-world-ended .cylon-scatter-char {
    animation: none;
    transform: none;
    text-shadow: none;
    color: color-mix(in srgb, currentColor 50%, #707070 50%);
  }
}


`;var Qo=`/* Cylon Defense: The intro title card: "The CIC" and its glide into the brand.
 * One of the stylesheets index.html links in order; the order is the cascade (README.md, "Stylesheets"). */
/* —— Intro title card: giant “The CIC” → brand slot (desktop) or fade (mobile) —— */
.cylon-intro-title {
  position: fixed;
  left: 50%;
  top: 48%;
  z-index: 2010;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--text);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(2.75rem, 14vw, 7.5rem);
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  text-align: center;
  pointer-events: none;
  user-select: none;
  transform: translate(-50%, -50%);
  transform-origin: center center;
  opacity: 0;
  text-shadow:
    0 0 28px rgba(255, 40, 40, 0.45),
    0 0 80px rgba(255, 20, 20, 0.25),
    0 2px 0 rgba(0, 0, 0, 0.55);
  /* opacity only while anchored; transform reserved for the settle glide */
  transition: none;
  will-change: opacity;
}

.cylon-intro-title.is-hero {
  opacity: 1;
  transition: opacity 0.5s ease-out;
}

.cylon-intro-title.is-settling {
  /* Keep visible — removing .is-hero would otherwise snap opacity back to 0 */
  opacity: 1;
  will-change: transform, opacity;
  transition:
    transform 0.88s cubic-bezier(0.22, 0.84, 0.18, 1),
    text-shadow 0.55s ease;
}

.cylon-intro-title.is-exit {
  opacity: 0;
  transition: opacity 0.45s ease;
}

/* Hide the real brand while the hero card owns the wordmark */
body.cylon-intro-hero .site-brand {
  opacity: 0 !important;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .cylon-bot,
  .cylon-bot-body::after,
  .cylon-impact,
  .cylon-hole,
  .cylon-nuke.is-detonating,
  .cylon-nuke.is-detonating .cylon-nuke-flash,
  .cylon-nuke.is-detonating .cylon-nuke-ball,
  .cylon-nuke.is-detonating .cylon-nuke-ring,
  .cylon-raptor.is-inbound .cylon-raptor-ship,
  .cylon-raptor.is-inbound .cylon-raptor-strafe,
  .cylon-raptor.is-inbound .cylon-raptor-beam,
  .cylon-raptor.is-inbound .cylon-raptor-beam-core,
  .cylon-raptor.is-inbound .cylon-raptor-cannon,
  .cylon-raptor.is-inbound .cylon-raptor-skyflash,
  .cylon-raptor.is-inbound .cylon-raptor-ground,
  .cylon-raptor-impact,
  .cylon-grenade-blast,
  body.is-nuke-shake,
  .cylon-intro-title.is-hero,
  .cylon-intro-title.is-settling,
  .cylon-intro-title.is-exit {
    animation: none !important;
    transition: none !important;
  }

  .cylon-battlefield,
  .cylon-nuke,
  .cylon-nuke-missile,
  .cylon-raptor {
    display: none !important;
  }
}

`;var Zo=`/* Cylon Defense: the embed's own rules (src/embed.ts): the home page's dark tokens, the combat bar and the host page's panels.
 * Every rule needs body.cic-embed-on or the bar, which only exist once the visitor starts the game. */
body.cic-embed-on {
  --bg: #0c0e12;
  --bg-elevated: #141820;
  --surface: #1a1f2a;
  --text: #e6e9ef;
  --text-muted: #9aa3b2;
  --steel: #6b7a8f;
  --steel-bright: #a8b4c4;
  --crimson: #ff1a1a;
  --crimson-hot: #ff5555;
  --crimson-dim: #8a0a0a;
  --rail: #1e2430;
  --rail-edge: #2a3344;
  --focus: #ff4444;
  --font-display: "Orbitron", "Segoe UI", sans-serif;
  --scanner-height: 1.15rem;
}

/* Debris flies past the screen's edges without widening the page (the home page clips the same way). */
html.cic-embed-on,
body.cic-embed-on {
  overflow-x: clip;
}

/* The host page's top-level elements: the game's panels, stacked over the hiding drones like the home page's main. */
body.cic-embed-on .cic-embed-host {
  isolation: isolate;
  z-index: 1058 !important;
}

body.cic-embed-on .cic-embed-host-static {
  position: relative;
}

body.cylon-world-ended .cic-embed-host {
  filter: grayscale(0.72) contrast(1.08) brightness(0.78) sepia(0.18);
}

/* The combat bar, fixed under the scanner, above everything the game draws but its dialogs. */
#cic-embed-bar {
  position: fixed;
  top: var(--scanner-height);
  left: 0;
  right: 0;
  z-index: 2250;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  margin: 0;
  padding: 0.5rem 0;
  background: rgba(12, 14, 18, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--rail-edge);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  color: var(--text);
  font: 400 16px/1.4 "Segoe UI", system-ui, sans-serif;
  text-align: left;
}

#cic-embed-bar *,
#cic-embed-bar *::before,
#cic-embed-bar *::after {
  box-sizing: border-box;
}

#cic-embed-bar button {
  cursor: pointer;
  text-transform: none;
}

#cic-embed-bar .site-nav-inner {
  --nav-control-h: 2.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 0.6rem;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}

#cic-embed-bar .site-brand {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.06em;
  color: var(--crimson-hot);
  text-transform: uppercase;
  white-space: nowrap;
  flex: 0 0 auto;
}

#cic-embed-bar .site-nav-power,
#cic-embed-bar .site-nav-tools {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex: 0 0 auto;
}

#cic-embed-bar .site-nav-game {
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem 0.55rem;
  min-width: 0;
}

#cic-embed-bar .site-nav-game[hidden] {
  display: none;
}

#cic-embed-bar .site-nav-tools {
  margin-left: auto;
}

#cic-embed-bar .cylon-settings {
  position: relative;
}

#cic-embed-bar .cic-embed-leave {
  height: var(--nav-control-h);
  padding: 0 0.75rem;
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--steel-bright);
  background: var(--surface);
  border: 1px solid var(--rail-edge);
  border-radius: 0;
}

#cic-embed-bar .cic-embed-leave:hover,
#cic-embed-bar .cic-embed-leave:focus-visible {
  color: var(--text);
  border-color: var(--crimson-hot);
}

#cic-embed-bar .visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

@media (max-width: 679px) {
  #cic-embed-bar .site-nav-inner {
    --nav-control-h: 2.5rem;
    padding: 0 0.5rem;
  }

  /* Two rows: The CIC · power · gear · Leave, then the game bar across the full width. */
  #cic-embed-bar .site-nav-game {
    order: 5;
    flex-basis: 100%;
  }
}

/* The page's letters, drawn on one canvas (src/glyphs.ts): the text under it is kept for its layout but not painted. */
.cylon-glyph-src {
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
  text-shadow: none !important;
}

.cylon-glyph-parent {
  text-decoration-color: transparent !important;
}

/* Over the host's panels (z-index 1058) as their letters were, under everything the game draws above them.
 * Its filter is the one the letters' panel has (world.css and the host rules above), with the same timing. */
.cylon-glyph-layer {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1058;
  pointer-events: none;
  contain: strict;
  transition: filter 0.45s ease;
}

body.cylon-world-ended .cylon-glyph-layer {
  filter: grayscale(0.72) contrast(1.08) brightness(0.78) sepia(0.18);
}

body.cylon-glyphs-blown .cylon-glyph-layer {
  filter: grayscale(0.8) brightness(0.7) sepia(0.15);
}

body.cylon-glyphs-blowing .cylon-glyph-layer {
  transition: filter var(--cylon-desolate-fade, 1.6s) ease;
}
`;var wi="__siteStats",ki="__siteStatsQ";function _i(e,t,n){try{let o=globalThis,r=o[wi];if(r){r.event(e,t,n);return}let a=o[ki]??=[];a.length<50&&a.push([e,t,n])}catch{}}function er(e){return(t,n)=>_i(e,t,n)}var sn=er("cylon");var ln={};Hn(ln,{BOT_CAP_PER_KOS:()=>Ti,BOT_CAP_START:()=>Ei,MAX_HITS:()=>Si,MISSILE_GROUND_CAP_MAX:()=>Ci,MISSILE_TRACKER_CAP_MAX:()=>Mi,MISSILE_TRACKER_CHANCE_BASE:()=>Ai,botCap:()=>Ii,currentHp:()=>Gn,difficultyFactor:()=>On,groundMissileCap:()=>Li,hpTint:()=>zn,killLevel:()=>Ft,lerp:()=>St,nextMissileDelayMs:()=>Nn,nextNukeDelayMs:()=>qn,planWave:()=>Di,trackerMissileCap:()=>Ri,trackerMissileChance:()=>Pi,volumeToGain:()=>Vn});var Si=30,Ei=4,Ti=5,Ai=.14,Mi=3,Ci=5;function St(e,t,n){return e+(t-e)*Math.min(1,Math.max(0,n))}function Ft(e){return Math.floor(e/5)}function On(e,t,n){if(!t)return 0;let o=(n-t)/6e4,r=Math.min(1,o/3.5),a=Math.min(1,Ft(e)/10);return Math.min(1,a*.75+r*.25)}function Nn(e,t){let n=Math.min(1,Ft(e)/10),o=St(8500,3400,n),r=St(2800,1600,n);return Math.max(2400,o-r/2+t()*r)}function qn(e,t){let n=St(32500,24e3,e),o=St(15e3,12e3,e);return n-o/2+t()*o}function Li(e){return Math.min(5,1+Math.floor(Ft(e)/2))}function Ri(e){let t=Ft(e);return t<3?1:t<7?2:Math.min(3,3)}function Pi(e){return Math.min(.34,.14+Ft(e)*.02)}function Ii(e,t){return Math.min(t,4+Math.floor(e/5))}function Di(e,t,n){let o=n()<.55,r=Math.min(e,Math.max(2,Math.min(4,Math.floor(t/3)))),a=o?Math.min(e,2+Math.floor(n()*Math.max(1,r-1))):1;return{isWave:o,count:a}}function Gn(e){return Math.max(0,30-e)}function zn(e){let t=(c,m,s)=>Math.round(c+(m-c)*s),n=(c,m,s)=>({r:t(c.r,m.r,s),g:t(c.g,m.g,s),b:t(c.b,m.b,s)}),o={r:125,g:255,b:154},r={r:255,g:210,b:74},a={r:255,g:72,b:72},i=Math.max(0,Math.min(1,e/30)),p=i>=.5?n(r,o,(i-.5)/.5):n(a,r,i/.5);return{color:`rgb(${p.r}, ${p.g}, ${p.b})`,glow:`rgba(${p.r}, ${p.g}, ${p.b}, 0.55)`}}function Vn(e,t="sfx"){let n=Math.max(0,Math.min(100,Number(e)||0))/100;if(t==="music")return Math.min(2.5,n/.5*1.25);let r=(n<=.5?n/.5*85:85+(n-.5)/.5*15)/100;return r*r}var Un={};Hn(Un,{botPageRect:()=>nr,candidateSpots:()=>rr,clampToBounds:()=>cn,findSafeSpot:()=>Hi,inflate:()=>Bi,isInBounds:()=>or,isSafeSpot:()=>$t,marchOrigin:()=>Oi,randomVisibleSpot:()=>$n,rectsOverlap:()=>tr,visibleBounds:()=>Fi});function tr(e,t){return!(e.right<t.left||e.left>t.right||e.bottom<t.top||e.top>t.bottom)}function Bi(e,t){return{left:e.left-t,top:e.top-t,right:e.right+t,bottom:e.bottom+t}}function nr(e,t,n){return{left:e,top:t,right:e+n.w,bottom:t+n.h}}function Fi(e,t){let n=Math.max(72,e.navBottom+10),o=10,r=e.scrollX+o,a=e.scrollY+n,i=e.scrollX+e.width-t.w-o,p=e.scrollY+e.height-t.h-o-6;return{left:r,top:a,right:Math.max(r,i),bottom:Math.max(a,p)}}function cn(e,t,n){return{x:Math.min(Math.max(e.left,t),e.right),y:Math.min(Math.max(e.top,n),e.bottom)}}function or(e,t,n){return t>=e.left-2&&t<=e.right+2&&n>=e.top-2&&n<=e.bottom+2}function $t(e,t,n,o,r){let a=nr(e,t,r);return e<4||t<70||e+r.w>o.w-4||t+r.h>o.h-4?!1:!n.some(i=>tr(a,i))}function $n(e,t){let n=e.bounds,o=Math.max(1,n.right-n.left),r=Math.max(1,n.bottom-n.top);for(let i=0;i<36;i++){let p=n.left+t()*o,c=n.top+t()*r;if($t(p,c,e.forbidden,e.doc,e.bot))return{x:p,y:c,edge:"return"}}let a=cn(n,(n.left+n.right)/2,(n.top+n.bottom)/2);return $t(a.x,a.y,e.forbidden,e.doc,e.bot)?{...a,edge:"return"}:null}function rr(e,t){let n=[],o=["left","right","bottom"],r=Math.max(40,e.bottom-e.top),a=Math.max(40,e.right-e.left);o.forEach(i=>{for(let p=0;p<10;p++){let c,m;i==="left"?(c=e.left,m=e.top+t()*r):i==="right"?(c=e.right,m=e.top+t()*r):(c=e.left+t()*a,m=e.bottom-t()*Math.min(36,r*.25));let s=cn(e,c,m);n.push({...s,edge:i})}});for(let i=n.length-1;i>0;i--){let p=Math.floor(t()*(i+1)),c=n[i];n[i]=n[p],n[p]=c}return n}function Hi(e,t,n){if(t)if(or(e.bounds,t.x,t.y))for(let o=0;o<28;o++){let r=t.x+(n()-.5)*200,a=t.y+(n()-.5)*140,i=cn(e.bounds,r,a);if($t(i.x,i.y,e.forbidden,e.doc,e.bot))return{x:i.x,y:i.y,edge:"patrol"}}else{let o=$n(e,n);if(o)return o}for(let o of rr(e.bounds,n))if($t(o.x,o.y,e.forbidden,e.doc,e.bot))return o;return $n(e,n)}function Oi(e,t,n){return t.edge==="left"?{x:e.left-n.w+6,y:t.y}:t.edge==="right"?{x:e.right+n.w-6,y:t.y}:{x:t.x,y:e.bottom+n.h-6}}var Xn=["sfx","music"];function Ni(){let e=globalThis,t=e.AudioContext||e.webkitAudioContext;return t?new t:null}function ar(e={}){let t=e.createContext??Ni,n=null,o=!1,r=!1,a=[],i=null,p={sfx:1,music:1},c={sfx:!1,music:!1},m={};function s(u){let l=m[u];if(!l||!n)return;let d=c[u]?0:p[u];try{l.gain.cancelScheduledValues(n.currentTime),l.gain.setValueAtTime(d,n.currentTime)}catch{l.gain.value=d}}function k(u){try{return Promise.resolve(u())}catch(l){return Promise.reject(l)}}function E(){if(!n){let l=null;try{if(l=t(),!l)return null;let d={};for(let y of Xn){let M=l.createGain();M.connect(l.destination),d[y]=M}n=l,Object.assign(m,d);for(let y of Xn)s(y)}catch{n=null;let d=l;return d&&k(()=>d.close()).catch(()=>{}),null}}let u=n;return u.state==="suspended"&&!r&&k(()=>u.resume()).catch(()=>{}),u}function g(u){let l=u===void 0?"sfx":typeof u=="string"?u:null;if(l&&c[l])return null;let d=E();if(!d)return null;let y=l?m[l]:u;return y?{c:d,node:y}:null}function x(u,l){let d=g(l);if(!d)return;let{c:y,node:M}=d;try{let w=u.at??y.currentTime+(u.when??0),L=u.vol??.05,H=y.createOscillator(),G=y.createGain();if(H.type=u.type??"square",H.frequency.setValueAtTime(u.freq,w),u.slideTo&&H.frequency.exponentialRampToValueAtTime(Math.max(1,u.slideTo),w+(u.slideDur??u.dur)),u.attack?(G.gain.setValueAtTime(1e-4,w),G.gain.exponentialRampToValueAtTime(L,w+u.attack)):G.gain.setValueAtTime(L,w),G.gain.exponentialRampToValueAtTime(1e-4,w+u.dur),u.filter){let z=f(y,u.filter,w,u.dur);H.connect(z),z.connect(G)}else H.connect(G);G.connect(M),H.start(w),H.stop(w+u.dur+(u.stopPad??.02))}catch{}}function f(u,l,d,y){let M=u.createBiquadFilter();if(M.type=l.type,M.frequency.setValueAtTime(l.freq,d),l.slideTo){let w=d+(l.slideDur??y);l.slide==="linear"?M.frequency.linearRampToValueAtTime(l.slideTo,w):M.frequency.exponentialRampToValueAtTime(Math.max(1,l.slideTo),w)}return M}function S(u,l){let d=g(l);if(!d)return;let{c:y,node:M}=d;try{let w=u.at??y.currentTime+(u.when??0),L=u.oscs.map(z=>{let D=y.createOscillator();return D.type=z.type,D.frequency.setValueAtTime(z.freq,w),D}),H=y.createGain();H.gain.setValueAtTime(1e-4,w);for(let z of u.envelope)z.ramp==="linear"?H.gain.linearRampToValueAtTime(z.to,w+z.at):H.gain.exponentialRampToValueAtTime(z.to,w+z.at);let G=u.filter?f(y,u.filter,w,u.dur):H;u.filter&&G.connect(H);for(let z of L)z.connect(G);H.connect(M);for(let z of L)z.start(w),z.stop(w+u.dur+(u.stopPad??.02))}catch{}}function v(u,l){let d=g(l);if(!d)return;let{c:y,node:M}=d;try{let w=u.at??y.currentTime+(u.when??0),L=y.createBufferSource();if(u.source==="fade"){let z=Math.max(1,Math.floor(y.sampleRate*u.dur)),D=y.createBuffer(1,z,y.sampleRate),X=D.getChannelData(0),K=u.fadePower??1;for(let me=0;me<z;me++)X[me]=(Math.random()*2-1)*(K===1?1-me/z:Math.pow(1-me/z,K));L.buffer=D}else{if(!i){i=y.createBuffer(1,y.sampleRate,y.sampleRate);let z=i.getChannelData(0);for(let D=0;D<z.length;D++)z[D]=Math.random()*2-1}L.buffer=i,L.loop=!0}let H=y.createBiquadFilter();H.type=u.filterType??"lowpass",H.frequency.setValueAtTime(u.filterFreq??1200,w),u.slideTo&&H.frequency.exponentialRampToValueAtTime(Math.max(1,u.slideTo),w+u.dur),u.filterQ!==void 0&&(H.Q.value=u.filterQ);let G=y.createGain();G.gain.setValueAtTime(u.vol,w),G.gain.exponentialRampToValueAtTime(1e-4,w+u.dur),L.connect(H),H.connect(G),G.connect(M),L.start(w),L.stop(w+u.dur+.02)}catch{}}function T(u){let l=E();if(!l||o)return;u&&a.push(u);let d=()=>{if(o||l.state!=="running")return;o=!0;try{let M=l.createGain();M.gain.value=1e-4;let w=l.createOscillator();w.connect(M),M.connect(l.destination),w.start(),w.stop(l.currentTime+.01)}catch{}let y=a;a=[];for(let M of y)M()};l.state==="running"?d():k(()=>l.resume()).then(d,()=>{})}return{context:E,peek:()=>n,bus:u=>m[u]??null,setGain(u,l){p[u]=l,s(u)},setMuted(u,l){c[u]=l,s(u)},isMuted:u=>c[u],unlock:T,suspend(){let u=n;u&&k(()=>u.suspend()).catch(()=>{})},hold(){r=!0;let u=n;u&&k(()=>u.suspend()).catch(()=>{})},release(){r=!1;let u=n;u&&k(()=>u.resume()).catch(()=>{})},wake(){let u=E();return u&&u.state==="suspended"&&k(()=>u.resume()).catch(()=>{}),u},close(){let u=n;n=null;for(let l of Xn)delete m[l];o=!1,a=[],i=null,u&&u.state!=="closed"&&k(()=>u.close()).catch(()=>{})},tone:x,noise:v,voice:S}}function dn(e,t,n,o=.09){e.tone({at:n,freq:85,slideTo:32,slideDur:.5,dur:.85,stopPad:.05,type:"sine",vol:o,attack:.015,filter:{type:"lowpass",freq:200,slideTo:55,slideDur:.45}},t),e.tone({at:n,freq:52,slideTo:24,slideDur:.4,dur:.55,stopPad:.05,type:"triangle",vol:o*.75,attack:.02},t)}function Kn(e,t,n,o=.035){e.noise({at:n,dur:.18,vol:o,source:"fade",fadePower:1.4,filterType:"bandpass",filterFreq:380,filterQ:.7},t)}function ir(e,t,n,o,r=3.2,a=.04){let i=Math.min(1.1,r*.35);e.voice({at:n,oscs:[{type:"sawtooth",freq:o},{type:"triangle",freq:o*1.498},{type:"sine",freq:o*.5}],filter:{type:"lowpass",freq:480,slideTo:280,slideDur:r,slide:"linear"},envelope:[{ramp:"linear",to:a,at:i},{ramp:"linear",to:a*.7,at:r*.7},{ramp:"exp",to:1e-4,at:r}],dur:r,stopPad:.05},t)}function sr(e,t,n,o,r=4,a=.012){e.voice({at:n,oscs:[{type:"triangle",freq:o},{type:"sine",freq:o*1.02}],envelope:[{ramp:"linear",to:a,at:1.5},{ramp:"linear",to:a*.5,at:r*.8},{ramp:"exp",to:1e-4,at:r}],dur:r,stopPad:.05},t)}var qi={small:{thumpGain:.11,thumpDur:.28,crackGain:.08,crackDur:.12,debrisGain:.06,debrisDur:.22,rumbleGain:.05,rumbleDur:.35,thumpFreq:70,crackFreq:420},medium:{thumpGain:.16,thumpDur:.45,crackGain:.12,crackDur:.16,debrisGain:.1,debrisDur:.4,rumbleGain:.09,rumbleDur:.65,thumpFreq:55,crackFreq:380},large:{thumpGain:.2,thumpDur:.85,crackGain:.14,crackDur:.28,debrisGain:.12,debrisDur:.7,rumbleGain:.14,rumbleDur:1.4,thumpFreq:42,crackFreq:300}};function lr(e){let t=e.settings,n=ar({createContext:e.createContext}),o=null,r=[],a=null,i=!1,p=!1;function c(){let l=t();n.setMuted("sfx",!l.soundEnabled||l.soundVolume<=0),n.setGain("sfx",e.volumeToGain(l.soundVolume,"sfx"));let d=l.musicEnabled&&e.sessionActive()&&i;n.setGain("music",d?e.volumeToGain(l.musicVolume,"music"):0)}function m(){return c(),n.context()}function s(){return c(),n.isMuted("sfx")?null:n.context()}function k(){let l=t();p||!l.soundEnabled&&!l.musicEnabled||(c(),n.unlock(f))}function E(l,d){l.forEach(y=>{try{let M=y;typeof M.stop=="function"&&M.stop()}catch{}try{y.disconnect()}catch{}});try{d.disconnect()}catch{}}function g(l=!0){a&&(clearInterval(a),a=null);let d=n.peek(),y=o,M=r;if(i=!1,o=null,r=[],c(),!d||!y)return;let w=d.currentTime,L=()=>E(M,y);try{l?(y.gain.cancelScheduledValues(w),y.gain.setValueAtTime(Math.max(y.gain.value,1e-4),w),y.gain.exponentialRampToValueAtTime(1e-4,w+.9),setTimeout(L,950)):(y.gain.value=0,L())}catch{L()}}function x(){let l=t();if(i||!l.musicEnabled||l.musicVolume<=0||!e.sessionActive())return;let d=m(),y=n.bus("music");if(!d||!y)return;let M=()=>{if(i||!t().musicEnabled||!e.sessionActive())return;if(a&&(clearInterval(a),a=null),o){let C=o,He=r;o=null,r=[],E(He,C)}let w=d.createGain();w.gain.value=1e-4,w.connect(y);let L=d.createOscillator(),H=d.createOscillator(),G=d.createOscillator(),z=d.createGain(),D=d.createBiquadFilter();L.type="sawtooth",H.type="sine",G.type="triangle",L.frequency.value=36.71,H.frequency.value=55,G.frequency.value=38.89,D.type="lowpass",D.frequency.value=160,D.Q.value=.6,z.gain.value=.07,L.connect(D),H.connect(D),G.connect(D),D.connect(z),z.connect(w);let X=d.createOscillator(),K=d.createOscillator(),me=d.createGain(),$=d.createBiquadFilter();X.type="sawtooth",K.type="triangle",X.frequency.value=73.42,K.frequency.value=87.31,$.type="lowpass",$.frequency.value=320,me.gain.value=.028,X.connect($),K.connect($),$.connect(me),me.connect(w);let U=d.createOscillator(),se=d.createGain();U.type="sine",U.frequency.value=.04,se.gain.value=30,U.connect(se),se.connect(D.frequency);let Z=d.currentTime;L.start(Z),H.start(Z),G.start(Z),X.start(Z),K.start(Z),U.start(Z),X.frequency.setValueAtTime(73.42,Z),K.frequency.setValueAtTime(87.31,Z),X.frequency.setValueAtTime(73.42,Z+8),K.frequency.linearRampToValueAtTime(92.5,Z+16),X.frequency.linearRampToValueAtTime(65.41,Z+24),K.frequency.linearRampToValueAtTime(98,Z+24),X.frequency.linearRampToValueAtTime(73.42,Z+32),K.frequency.linearRampToValueAtTime(87.31,Z+32),w.gain.setValueAtTime(1e-4,Z),w.gain.exponentialRampToValueAtTime(1,Z+1.2),o=w,r=[L,H,G,X,K,U,z,me,D,$,se],i=!0,c();let fe=60/50,Ve=[73.42,69.3,65.41,87.31,73.42,55,82.41,73.42],$e=[293.66,311.13,277.18,349.23],Fe=0,je=()=>{let C=n.peek();if(!i||!C||!o)return;let He=C.currentTime+.05,ke=He,ot=He+fe*2;dn(n,o,ke,Fe%2===0?.11:.08),Fe%2===1?dn(n,o,ot,.06):Kn(n,o,ot,.03),ir(n,o,ke+fe*.15,Ve[Fe%Ve.length]??73.42,fe*3.4,.038),Fe%2===0&&sr(n,o,ke+fe*.5,$e[Fe/2%$e.length]??293.66,fe*3.6,.014),Fe%4===3&&(dn(n,o,ke+fe*.75,.07),Kn(n,o,ke+fe*1.1,.04)),Fe+=1};je(),a=setInterval(je,4*fe*1e3-40)};d.state==="suspended"?d.resume().then(M).catch(()=>{}):M()}function f(){let l=t();!p&&e.sessionActive()&&l.musicEnabled&&l.musicVolume>0?i?c():x():g(!0)}function S({freq:l=440,freqEnd:d=null,type:y="square",duration:M=.12,gain:w=.08,delay:L=0}){n.tone({freq:l,dur:M,type:y,vol:w,slideTo:d,when:L,attack:.01})}function v({duration:l=.18,gain:d=.06,delay:y=0,filterFreq:M=900,filterType:w="bandpass"}={}){n.noise({dur:l,vol:d,when:y,filterFreq:M,filterType:w,source:"fade"})}function T(l,d=0){if(!s())return;let y=qi[l];S({freq:y.thumpFreq,freqEnd:Math.max(18,y.thumpFreq*.35),type:"sine",duration:y.thumpDur,gain:y.thumpGain,delay:d}),S({freq:y.thumpFreq*1.4,freqEnd:24,type:"triangle",duration:y.thumpDur*.85,gain:y.thumpGain*.55,delay:d+.02}),v({duration:y.crackDur,gain:y.crackGain,delay:d+.03,filterFreq:y.crackFreq,filterType:"bandpass"}),S({freq:900,freqEnd:120,type:"square",duration:y.crackDur*.7,gain:y.crackGain*.45,delay:d+.03}),v({duration:y.debrisDur,gain:y.debrisGain,delay:d+.06,filterFreq:1800,filterType:"highpass"}),v({duration:y.debrisDur*.8,gain:y.debrisGain*.7,delay:d+.08,filterFreq:700,filterType:"bandpass"}),S({freq:48,freqEnd:20,type:"sine",duration:y.rumbleDur,gain:y.rumbleGain,delay:d+.1}),v({duration:y.rumbleDur*.9,gain:y.rumbleGain*.65,delay:d+.12,filterFreq:180,filterType:"lowpass"})}let u={projectile(){S({freq:980,freqEnd:240,type:"sawtooth",duration:.14,gain:.07}),S({freq:1400,freqEnd:400,type:"square",duration:.08,gain:.035,delay:.01})},hit(){S({freq:160,freqEnd:70,type:"sawtooth",duration:.1,gain:.05}),v({duration:.08,gain:.04})},heal(){S({freq:280,freqEnd:540,type:"sine",duration:.18,gain:.05}),S({freq:420,freqEnd:660,type:"triangle",duration:.14,gain:.03,delay:.04})},ko(){T("small")},nuke(){T("large")},raptor(){S({freq:220,freqEnd:70,type:"sawtooth",duration:.7,gain:.09}),S({freq:140,freqEnd:55,type:"triangle",duration:.85,gain:.07,delay:.04}),v({duration:.55,gain:.08,filterFreq:700,filterType:"lowpass"}),v({duration:.4,gain:.05,delay:.15,filterFreq:2400,filterType:"highpass"}),[.45,.58,.7,.82,.94,1.06].forEach((l,d)=>{S({freq:980-d*40,freqEnd:180,type:"square",duration:.07,gain:.055,delay:l}),v({duration:.08,gain:.045,delay:l,filterFreq:1600})}),T("medium",.72),T("medium",1)},grenadeArm(){S({freq:640,freqEnd:420,type:"square",duration:.09,gain:.05}),S({freq:880,freqEnd:660,type:"triangle",duration:.07,gain:.035,delay:.04}),v({duration:.06,gain:.03,filterFreq:2200})},grenade(){S({freq:420,freqEnd:140,type:"sawtooth",duration:.14,gain:.05}),v({duration:.12,gain:.05,filterFreq:1800,filterType:"highpass"}),T("medium",.08)},missile(){S({freq:380,freqEnd:110,type:"sawtooth",duration:.22,gain:.055}),v({duration:.14,gain:.04,filterFreq:1400,filterType:"highpass"})},trackerMissile(){S({freq:520,freqEnd:160,type:"sawtooth",duration:.22,gain:.07}),v({duration:.14,gain:.04,filterFreq:2200,filterType:"highpass"})},introLaunch(){S({freq:160,freqEnd:70,type:"sawtooth",duration:.28,gain:.06})},nukeLaunch(){S({freq:180,freqEnd:90,type:"sawtooth",duration:.2,gain:.05})}};return{sfx(l){p||(c(),u[l]())},prime(){p||s()},unlock:k,syncMusic:f,settingChanged(l){let d=t();(l==="musicEnabled"||l==="musicVolume")&&f(),(l==="soundEnabled"||l==="soundVolume")&&m(),l==="soundEnabled"&&!d.soundEnabled&&!d.musicEnabled&&n.suspend(),(l==="soundEnabled"||l==="musicEnabled")&&(d.soundEnabled||d.musicEnabled)&&m()},pageHide(){p=!0,g(!1),n.hold()},pageShow(){p&&(p=!1,n.release(),f())},pageClose(){p=!0,g(!1),n.close()}}}function Ht(e){return(e.key==="q"||e.key==="Q")&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.isComposing}var Gi=new Set(["range","checkbox","radio","button","submit","reset","image","color","file"]);function Ot(e){let t=e;return t?t.isContentEditable||t.tagName==="SELECT"?!0:t.tagName==="INPUT"&&t.type&&Gi.has(t.type)?!1:(t.tagName==="INPUT"||t.tagName==="TEXTAREA")&&!t.readOnly:!1}var zi=1e4,Vi=6e4,$i=700,Ui=1900;function cr(e){if(e.ctrlKey||e.metaKey||e.altKey)return null;if(Ht(e))return e.repeat?null:"disarm";let t=(e.key??"").toLowerCase();return t==="r"?"raptor":t==="g"?"grenade":null}function Xi(e,t){return Math.max(0,e-t)}function dr(e,t){let n=Xi(e,t);return n>0?Math.max(1,Math.ceil(n/1e3)):0}function ur(e){let t=!1,n=!1,o=[];function r(){o.forEach(i=>e.clearTimer(i)),o=[],n=!1,e.raptorClear()}function a(){t&&(t=!1,e.changed())}return{grenadeArmed:()=>t,raptorInbound:()=>n,cancelGrenadeArm:a,clearRaptor:r,readyGrenade(){return!e.isLive()||e.now()<e.readyAt("grenade")?!1:t?(a(),!1):(t=!0,e.sfx("grenadeArm"),e.changed(),!0)},throwGrenadeAt(i,p){return!e.isLive()||!t?!1:e.now()<e.readyAt("grenade")?(a(),!1):(t=!1,e.setReadyAt("grenade",e.now()+zi),e.changed(),e.sfx("grenade"),e.grenadeBlast(i,p),!0)},callRaptor(){return!e.isLive()||n||e.now()<e.readyAt("raptor")||!e.raptorAvailable()?!1:(r(),n=!0,e.setReadyAt("raptor",e.now()+Vi),e.changed(),e.sfx("raptor"),e.raptorLaunch(),o.push(e.setTimer(()=>{!n||!e.isLive()||e.raptorStrike()},$i)),o.push(e.setTimer(()=>{e.raptorClear(),n=!1,o=[],e.changed()},Ui)),!0)},reset(){e.setReadyAt("grenade",0),e.setReadyAt("raptor",0),t=!1,r()}}}var st={small:{radius:56,holdMs:800,fadeMs:1e3},medium:{radius:165,holdMs:2500,fadeMs:2e3},large:{radius:0,holdMs:4e3,fadeMs:3e3}};function fr(e){let t=[];function n(c){c&&(e.clearTimer(c.holdTimer),e.clearTimer(c.fadeTimer),c.el.remove(),t=t.filter(m=>m!==c))}function o(c,m){c.fadeTimer=e.setTimer(()=>{if(e.paused()){c.fadeTimer=null;return}n(c)},m)}function r(c,m){c.holdTimer=e.setTimer(()=>{if(e.paused()){c.holdTimer=null;return}a(c)},m)}function a(c){if(!c.el.isConnected){n(c);return}c.phase="fade",c.el.style.setProperty("--hole-fade-ms",`${c.fadeMs}ms`),c.el.classList.add("is-fading"),c.fadeDue=e.now()+c.fadeMs,o(c,c.fadeMs)}function i(){let c=t[0];c&&(c.phase==="hold"?(e.clearTimer(c.holdTimer),a(c)):n(c))}function p(){let{width:c,height:m}=e.viewport();return Math.min(c||400,m||400)*.42}return{punch(c,m,{radius:s,holdMs:k,fadeMs:E}={}){let g=e.field;if(!g||!e.isLive())return;let x=s!==void 0&&s>0?s:p(),f=k!==void 0&&k>0?k:st.small.holdMs,S=E!==void 0&&E>0?E:st.small.fadeMs;for(;t.length>=24;)i(),t.length>=24&&n(t[0]);let v=e.create("div");v.className="cylon-hole",v.setAttribute("aria-hidden","true"),v.style.left=`${c}px`,v.style.top=`${m}px`,v.style.width=`${x*2}px`,v.style.height=`${x*2}px`;let T=e.create("div");T.className="cylon-hole-glitch",v.appendChild(T),g.appendChild(v);let u={el:v,holdTimer:null,fadeTimer:null,holdDue:e.now()+f,fadeDue:0,fadeMs:S,phase:"hold"};r(u,f),t.push(u)},clearAll(){[...t].forEach(n),t=[],e.field?.querySelectorAll(".cylon-hole").forEach(c=>c.remove())},largeRadius:p,count:()=>t.length,pause(){t.forEach(c=>{e.clearTimer(c.holdTimer),e.clearTimer(c.fadeTimer),c.holdTimer=null,c.fadeTimer=null})},resume(c,m){t.forEach(s=>{s.phase==="hold"&&s.holdDue>c?(e.clearTimer(s.holdTimer),s.holdDue+=m,r(s,Math.max(0,s.holdDue-e.now()))):s.phase==="fade"&&s.fadeDue>c&&(e.clearTimer(s.fadeTimer),s.fadeDue+=m,o(s,Math.max(0,s.fadeDue-e.now())))})}}}var pr={xSpread:.55,ySpread:.7,rotMax:28},mr={xSpread:1.15,ySpread:1.25,rotMax:150},Wn={xSpread:1.35,ySpread:1.4,rotMax:220},Yn=".interest-list li, .course-list li",Ki="h1, h2, h3, .page-lead, .contact-block, .interest-list, .course-list, .project-list, .project-list > li, aside, .games-hub-card, .games-home-callout, .cylon-debris",Wi=3e3;function hr(e){let t=e.doc.body,n=null;function o(){let{width:m,height:s}=e.viewport();return{vw:m||800,vh:s||600}}function r(m,s,k){let E=+((e.random()-.5)*m*k.xSpread).toFixed(1),g=+((e.random()-.5)*s*k.ySpread).toFixed(1),x=+((e.random()-.5)*k.rotMax).toFixed(1);return{sx:E,sy:g,sr:x}}function a(m,s,k,E){let g=r(s,k,E);m.style.setProperty("--sx",`${g.sx.toFixed(1)}px`),m.style.setProperty("--sy",`${g.sy.toFixed(1)}px`),m.style.setProperty("--sr",`${g.sr.toFixed(1)}deg`)}let i=()=>{let{vw:m,vh:s}=o();return r(m,s,Wn)};function p(m,s,k){let E=(e.random()-.5)*s*.35,g=(e.random()-.5)*k*.4,x=(e.random()-.5)*120;m.style.setProperty("--mx",`${E.toFixed(1)}px`),m.style.setProperty("--my",`${g.toFixed(1)}px`),m.style.setProperty("--mr",`${x.toFixed(1)}deg`)}let c=()=>t.dataset.cylonScattered==="1";return{scattered:c,scatter(){if(c()||e.reduceMotion)return;let{vw:m,vh:s}=o(),k=[...e.doc.querySelectorAll(".page-panel")];k.forEach(E=>{if(E.classList.add("cylon-scatter-panel"),a(E,m,s,pr),E.querySelectorAll(Ki).forEach(f=>{f.classList.add("cylon-scatter-block"),a(f,m,s,mr)}),E.querySelectorAll(Yn).forEach(f=>p(f,m,s)),e.glyphs)return;let g=e.doc.createTreeWalker(E,NodeFilter.SHOW_TEXT,{acceptNode(f){return!f.nodeValue||!/\S/.test(f.nodeValue)||f.parentElement?.closest(".cylon-scatter-char")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),x=[];for(;g.nextNode();)x.push(g.currentNode);x.forEach(f=>{let S=e.doc.createDocumentFragment();for(let v of f.nodeValue??""){if(v===" "||v===`
`||v==="	"){S.appendChild(e.doc.createTextNode(v));continue}let T=e.doc.createElement("span");T.className="cylon-scatter-char",T.textContent=v,a(T,m,s,Wn),S.appendChild(T)}f.parentNode?.replaceChild(S,f)})}),e.glyphs?.scatter(k,i),t.dataset.cylonScattered="1"},restore(){c()&&(e.glyphs?.restore(),e.doc.querySelectorAll(".cylon-scatter-char").forEach(m=>{m.replaceWith(e.doc.createTextNode(m.textContent||""))}),e.doc.querySelectorAll(Yn).forEach(m=>{m.style.removeProperty("--mx"),m.style.removeProperty("--my"),m.style.removeProperty("--mr")}),e.doc.querySelectorAll(".cylon-scatter-panel, .cylon-scatter-block").forEach(m=>{m.classList.remove("cylon-scatter-panel","cylon-scatter-block"),m.style.removeProperty("--sx"),m.style.removeProperty("--sy"),m.style.removeProperty("--sr")}),t.dataset.cylonScattered="0")},reshuffle(){if(!c()||e.reduceMotion)return;let{vw:m,vh:s}=o();t.classList.add("cylon-glyphs-blowing"),e.doc.querySelectorAll(".cylon-scatter-panel").forEach(k=>{a(k,m,s,pr)}),e.doc.querySelectorAll(".cylon-scatter-block").forEach(k=>{a(k,m,s,mr)}),e.doc.querySelectorAll(".cylon-scatter-char").forEach(k=>{a(k,m,s,Wn)}),e.doc.querySelectorAll(Yn).forEach(k=>p(k,m,s)),e.glyphs?.reshuffle(i),e.clearTimer(n),n=e.setTimer(()=>{t.classList.remove("cylon-glyphs-blowing"),n=null},Wi)},cancelReshuffleSettle(){e.clearTimer(n),n=null}}}function yr(e){let t=0,n=!1;function o(){e.body.classList.remove("cylon-intro-hero");let s=e.titleEl;s&&(s.hidden=!0,s.setAttribute("aria-hidden","true"),s.classList.remove("is-hero","is-settling","is-exit"),s.style.cssText="")}function r(){let s=e.titleEl;if(!s)return{x:0,y:0};let k=(window.innerWidth||1)*.5,E=(window.innerHeight||1)*.48;return s.style.left=`${k}px`,s.style.top=`${E}px`,s.style.right="auto",s.style.bottom="auto",s.style.transform="translate(-50%, -50%)",s.style.transformOrigin="center center",{x:k,y:E}}function a(){let s=e.titleEl;s&&(s.textContent=e.title,s.hidden=!1,s.setAttribute("aria-hidden","false"),s.classList.remove("is-exit","is-settling","is-hero"),s.style.cssText="",r(),e.body.classList.add("cylon-intro-hero"),s.offsetWidth,s.classList.add("is-hero"))}function i(){return window.matchMedia("(max-width: 819px)").matches}function p(s){let k=e.titleEl;if(s!==t||!k||k.hidden)return;let E=e.brandEl;if(e.reduceMotion||i()||!E){k.classList.add("is-exit");let L=e.reduceMotion?0:450;setTimeout(()=>{s===t&&o()},L);return}let g=r();k.offsetWidth;let x=k.getBoundingClientRect(),f=E.getBoundingClientRect(),S=x.left+x.width/2,v=x.top+x.height/2,T=f.left+f.width/2,u=f.top+f.height/2,l=T-S,d=u-v,y=f.width/Math.max(x.width,1);k.classList.remove("is-hero"),k.classList.add("is-settling"),k.style.left=`${g.x}px`,k.style.top=`${g.y}px`,k.style.transform="translate(-50%, -50%) scale(1)",requestAnimationFrame(()=>{requestAnimationFrame(()=>{s===t&&(k.style.transform=`translate(calc(-50% + ${l}px), calc(-50% + ${d}px)) scale(${y})`,k.style.textShadow="none")})});let M=!1,w=L=>{L&&L.propertyName&&L.propertyName!=="transform"||M||s!==t||(M=!0,k.removeEventListener("transitionend",w),o())};k.addEventListener("transitionend",w),setTimeout(()=>w(),e.settleMs+120)}function c(){t+=1,n=!1,e.setNukeInFlight(!1),e.nukeEl&&e.nukeEl.classList.remove("is-flying"),o()}function m(){let s=++t;n=!0,e.startRun(),e.setNukeInFlight(!1),o();let k=(window.innerWidth||1)/2,E=(window.innerHeight||1)*.48,g=M=>{let w=()=>{if(!(s!==t||!e.enabled())){if(e.paused()){setTimeout(w,100);return}M()}};w()},x=()=>{n=!1,e.beginCombat()},f=(M,w)=>{if(s!==t||!e.enabled())return;e.setNukeInFlight(!1),e.nukeEl&&e.nukeEl.classList.remove("is-flying"),e.detonate(M,w),a();let L=e.reduceMotion?0:520;setTimeout(()=>g(x),L);let H=e.reduceMotion?0:Math.max(900,L+e.navFadeMs+80);setTimeout(()=>g(()=>p(s)),H)},S=e.nukeEl;if(e.reduceMotion||!S){f(k,E);return}e.setNukeInFlight(!0);let v=k+(e.random()-.5)*Math.min(120,(window.innerWidth||400)*.15),T=-72,u=performance.now(),l=u,d=e.speed;S.style.left=`${v}px`,S.style.top=`${T}px`,S.classList.add("is-flying"),e.launched();let y=M=>{if(s!==t)return;if(!e.enabled()){c();return}if(e.paused()){u+=M-l,l=M,requestAnimationFrame(y);return}let w=Math.min(.05,(M-l)/1e3);l=M;let L=k-v,H=E-T,G=Math.hypot(L,H)||1,z=d*w;if(v+=L/G*Math.min(z,G),T+=H/G*Math.min(z,G),S.style.left=`${v}px`,S.style.top=`${T}px`,S.style.setProperty("--nuke-heading",`${Math.atan2(H,L)*(180/Math.PI)}deg`),G<=e.arriveRadius||M-u>=e.maxFlightMs){f(v,T);return}requestAnimationFrame(y)};requestAnimationFrame(y)}return{play:m,cancel:c,playing:()=>n}}function gr(e){let{reduceMotion:t,scrollX:n,scrollY:o}=e;function r(g,x){return g+Math.random()*(x-g)}function a(g,x){let f=document.body.style.getPropertyValue(g)||getComputedStyle(document.body).getPropertyValue(g),S=parseFloat(f);return Number.isFinite(S)?S:x}function i(g,x,f){return g+(x-g)*f}function p(g){return 90+Math.max(.05,Math.min(1.6,g))*180}function c(g,x,f){let S=document.body,v=window.innerWidth||1,T=window.innerHeight||1,u=Math.max(.05,Math.min(1,f)),l=Math.max(8,Math.min(92,g/v*100)),d=Math.max(10,Math.min(90,x/T*100)),y=Math.min(1,.55+u*.6);S.style.setProperty("--blast-x",`${i(a("--blast-x",50),l,y).toFixed(1)}%`),S.style.setProperty("--blast-y",`${i(a("--blast-y",48),d,y).toFixed(1)}%`),S.style.setProperty("--land-morph-ms",`${Math.round(280+u*420)}ms`)}function m(g,x,f=1,S={}){if(!document.body.classList.contains("cylon-world-ended")&&f<.9&&f<.99)return;let v=Math.max(.05,Math.min(1,f)),T=g+n(),u=x+o(),l=Number.isFinite(S.radius)?S.radius:null;if(v<.9){c(g,x,v),s(T,u,v,l);return}let d=document.body,y=window.innerWidth||1,M=window.innerHeight||1,w=Math.max(8,Math.min(92,g/y*100)),L=Math.max(10,Math.min(90,x/M*100));d.style.setProperty("--blast-x",`${i(a("--blast-x",50),w,Math.min(1,v*1.15)).toFixed(1)}%`),d.style.setProperty("--blast-y",`${i(a("--blast-y",48),L,Math.min(1,v*1.15)).toFixed(1)}%`),d.style.setProperty("--crack-a",`${i(a("--crack-a",118),r(70,160),v).toFixed(1)}deg`),d.style.setProperty("--crack-b",`${i(a("--crack-b",28),r(8,70),v).toFixed(1)}deg`),d.style.setProperty("--crack-c",`${i(a("--crack-c",155),r(120,200),v).toFixed(1)}deg`),d.style.setProperty("--crack-grain",`${i(a("--crack-grain",-18),r(-40,12),v).toFixed(1)}deg`),d.style.setProperty("--scar-1",`${i(a("--scar-1",42),r(28,48),v).toFixed(1)}%`),d.style.setProperty("--scar-2",`${i(a("--scar-2",61),r(52,72),v).toFixed(1)}%`),d.style.setProperty("--scar-3",`${i(a("--scar-3",33),r(22,42),v).toFixed(1)}%`),d.style.setProperty("--scar-4",`${i(a("--scar-4",72),r(58,82),v).toFixed(1)}%`),d.style.setProperty("--scar-5",`${i(a("--scar-5",18),r(12,30),v).toFixed(1)}%`),d.style.setProperty("--scar-6",`${i(a("--scar-6",78),r(68,88),v).toFixed(1)}%`),d.style.setProperty("--ash-1-x",`${i(a("--ash-1-x",18),r(8,40),v).toFixed(1)}%`),d.style.setProperty("--ash-1-y",`${i(a("--ash-1-y",22),r(10,40),v).toFixed(1)}%`),d.style.setProperty("--ash-2-x",`${i(a("--ash-2-x",82),r(58,92),v).toFixed(1)}%`),d.style.setProperty("--ash-2-y",`${i(a("--ash-2-y",70),r(45,85),v).toFixed(1)}%`),d.style.setProperty("--ash-3-x",`${i(a("--ash-3-x",50),r(30,70),v).toFixed(1)}%`),d.style.setProperty("--ash-3-y",`${i(a("--ash-3-y",100),r(75,105),v).toFixed(1)}%`);let H=i(a("--land-shift-x",0),r(-28,28),v),G=i(a("--land-shift-y",0),r(-22,22),v),z=i(a("--land-scale",1),r(1.02,1.1),v),D=i(a("--land-rot",0),r(-2.8,2.8),v);d.style.setProperty("--land-shift-x",`${H.toFixed(1)}px`),d.style.setProperty("--land-shift-y",`${G.toFixed(1)}px`),d.style.setProperty("--ash-drift-x",`${(-H*.35).toFixed(1)}px`),d.style.setProperty("--ash-drift-y",`${(-G*.35).toFixed(1)}px`),d.style.setProperty("--land-rot",`${D.toFixed(2)}deg`),d.style.setProperty("--land-scale",`${z.toFixed(3)}`),d.style.setProperty("--ash-scale",`${(1+(z-1)*.4).toFixed(3)}`),d.style.setProperty("--land-morph-ms",`${Math.round(420+v*930)}ms`),s(T,u,v,l)}function s(g,x,f=1,S=null){if(document.body.dataset.cylonScattered!=="1"||t)return;let v=Math.max(.05,Math.min(1.6,f)),T=Number.isFinite(S)&&S>0?S:p(v),u=v<.95,l=u?".cylon-scatter-char":".cylon-scatter-char, .cylon-scatter-block, .cylon-scatter-panel",d=[...document.querySelectorAll(l)],y=Math.min(1,.7+v*.3),M=55*v,w=48+200*v,L=n(),H=o(),G=(D,X,K,me,$)=>{let U=D-g,se=X-x,Z=Math.hypot(U,se)||1;if(Z>T||Math.random()>y)return null;let Te=Math.max(0,1-Z/T),fe=r(w*.5,w)*Te;return{sx:+(K+U/Z*fe+r(-M,M)*Te).toFixed(1),sy:+(me+se/Z*fe+r(-M,M)*Te).toFixed(1),sr:+($+r(-32,32)*v*Te).toFixed(1)}};d.filter(D=>!(D.classList.contains("cylon-scatter-panel")&&v<1.1)).map(D=>({el:D,rect:D.getBoundingClientRect()})).forEach(({el:D,rect:X})=>{let K=G(X.left+X.width/2+L,X.top+X.height/2+H,parseFloat(D.style.getPropertyValue("--sx"))||0,parseFloat(D.style.getPropertyValue("--sy"))||0,parseFloat(D.style.getPropertyValue("--sr"))||0);K&&(D.style.setProperty("--sx",`${K.sx.toFixed(1)}px`),D.style.setProperty("--sy",`${K.sy.toFixed(1)}px`),D.style.setProperty("--sr",`${K.sr.toFixed(1)}deg`))}),e.glyphs&&(e.glyphs.kick((D,X,K)=>G(D,X,K.sx,K.sy,K.sr)),u||e.glyphs.poke(3500))}function k(g,x,f=1,S={}){m(g-n(),x-o(),f,S)}function E(){["--blast-x","--blast-y","--crack-a","--crack-b","--crack-c","--crack-grain","--scar-1","--scar-2","--scar-3","--scar-4","--scar-5","--scar-6","--ash-1-x","--ash-1-y","--ash-2-x","--ash-2-y","--ash-3-x","--ash-3-y","--land-shift-x","--land-shift-y","--ash-drift-x","--ash-drift-y","--land-rot","--land-scale","--ash-scale","--land-morph-ms"].forEach(g=>document.body.style.removeProperty(g))}return{randRange:r,rearrangeLandscape:m,rearrangeLandscapePage:k,disruptGlyphs:s,clearLandscapeVars:E}}function br(e){let{eye:t,glare:n,game:o,settings:r,mouse:a,state:i,isGameLive:p,EYE_DISORIENT_MS:c}=e,m=50,s=!1,k=5.2,E=0,g=0;function x(){let y=t.parentElement;if(!y)return 50;let M=t.getBoundingClientRect(),w=y.getBoundingClientRect();return w.width<1?50:(M.left+M.width/2-w.left)/w.width*100}function f(){return i.pending(o.schedule.eyeDisorientedUntil,Date.now())}function S(y){(!p()||!r.eyeEnabled||f())&&(y=!1),y&&!s&&(m=x(),E=Math.asin(Math.max(-1,Math.min(1,(m-50)/45))),g=performance.now()),s=y,t.classList.toggle("is-tracking",y&&!f()),n&&n.classList.toggle("is-active",y&&!f()),!y&&!f()&&(t.style.left="",n&&(n.style.opacity="",n.style.height="",n.style.top="",n.style.transform=""))}function v(y=c){o.schedule.eyeDisorientedUntil=Date.now()+y,s=!1,t.classList.remove("is-tracking"),t.classList.add("is-disoriented"),m=x(),n&&(n.classList.add("is-active"),n.classList.add("is-disoriented"))}function T(){t.classList.contains("is-disoriented")&&!f()&&(t.classList.remove("is-disoriented"),n&&n.classList.remove("is-disoriented"),s||(t.style.left="",n&&n.classList.remove("is-active")))}function u(){if(T(),f()){let y=performance.now()/1e3,M=50+Math.sin(y*6.8)*30+Math.sin(y*15.4)*14+Math.sin(y*2.7)*10+Math.sin(y*31)*4,w=Math.min(95,Math.max(5,M));if(m+=(w-m)*.22,t.style.left=`${m}%`,n){n.classList.add("is-active"),n.style.left=`${m/100*window.innerWidth}px`;let L=.45+.55*(.5+.5*Math.sin(y*22));n.style.height=`${Math.min(window.innerHeight*.28,176)*L}px`,n.style.opacity=String(.35+.55*L)}}else if(s&&r.eyeEnabled){let y=performance.now();if(E+=Math.min(.05,(y-g)/1e3)*(Math.PI*2/k),g=y,m=50+45*Math.sin(E),t.style.left=`${m}%`,n){let M=d(),w=M.y+t.getBoundingClientRect().height*.2,L=a.clientX-M.x,H=Math.max(1,a.clientY-w);n.style.opacity="",n.style.left=`${M.x}px`,n.style.top=`${w}px`;let G=Math.hypot(L,H),z=Math.min(G*.85,140+G*.25);n.style.height=`${G}px`,n.style.setProperty("--glare-reach",`${z/Math.max(1,G)*100}%`),n.style.opacity=String(Math.max(.3,Math.min(1,1-G/(Math.hypot(window.innerWidth,window.innerHeight)*1.2)))),n.style.transform=`translateX(-50%) rotate(${-Math.atan2(L,H)}rad)`}}requestAnimationFrame(u)}function l(){o.schedule.eyeDisorientedUntil=0,t&&t.classList.remove("is-disoriented"),n&&(n.classList.remove("is-disoriented"),s||n.classList.remove("is-active"))}function d(){let y=t.getBoundingClientRect();return{x:y.left+y.width/2,y:y.top+y.height/2}}return{isEyeDisoriented:f,setEyeTracking:S,disorientEye:v,clearEyeDisorient:l,eyeClientCenter:d,updateEye:u}}function vr(e){let{reticleEl:t,mouse:n,lastAim:o,game:r,settings:a,coarsePointer:i,IDLE_MS:p,isGameLive:c,isEyeDisoriented:m,setEyeTracking:s,audio:k,abilities:E,scrollX:g,scrollY:x}=e;function f(){n.pageX=n.clientX+g(),n.pageY=n.clientY+x()}function S(){!t||t.hidden||(t.style.transform=`translate(${n.clientX}px, ${n.clientY}px)`)}function v(w,L){let H=window.innerWidth||1,G=window.innerHeight||1;n.clientX=Math.min(H-8,Math.max(8,w)),n.clientY=Math.min(G-8,Math.max(8,L)),f(),n.t=performance.now(),S(),o.clientX=n.clientX,o.clientY=n.clientY,o.t=performance.now(),c()&&a.eyeEnabled&&!m()&&(s(!0),clearTimeout(r.idleTimer),r.idleTimer=setTimeout(()=>s(!1),p))}function T(){if(!t)return;let w=c();t.hidden=!w,t.setAttribute("aria-hidden",w?"false":"true"),t.classList.toggle("is-mouse-follow",w&&!i),w&&S()}function u(){v(window.innerWidth/2,window.innerHeight*.42)}function l(w){return!w||!w.closest?!1:!!w.closest(".site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel")}function d(w){k.prime(),!(r.reticlePointerId!=null&&w.pointerId===r.reticlePointerId)&&(i&&w.pointerType==="touch"||l(w.target)||v(w.clientX,w.clientY))}function y(w){r.reticlePointerId==null||w&&w.pointerId!==r.reticlePointerId||(r.draggingReticle=!1,r.reticlePointerId=null,t?.classList.remove("is-dragging"))}function M(){if(!t||!i)return;t.addEventListener("pointerdown",L=>{c()&&(L.button!=null&&L.button!==0||r.reticlePointerId==null&&(E.grenadeArmed()||(L.preventDefault(),r.draggingReticle=!0,r.reticlePointerId=L.pointerId,t.classList.add("is-dragging"),v(L.clientX,L.clientY))))});let w=L=>{r.reticlePointerId==null||L.pointerId!==r.reticlePointerId||(L.preventDefault(),v(L.clientX,L.clientY))};window.addEventListener("pointermove",w,{passive:!1}),window.addEventListener("pointerup",y,!0),window.addEventListener("pointercancel",y,!0)}return{syncMousePageFromClient:f,paintReticle:S,syncReticleVisibility:T,resetReticleToCenter:u,onPointerMove:d,bindReticle:M}}function xr(e){let{game:t,settings:n,mouse:o,lastAim:r,state:a,rules:i,playfield:p,field:c,ambushUnder:m,missileEl:s,nukeEl:k,nukeMissileEl:E,scoreEl:g,audio:x,intro:f,abilities:S,holes:v,debris:T,punchHole:u,HOLE_PRESETS:l,isGameLive:d,isEyeDisoriented:y,eyeClientCenter:M,syncMousePageFromClient:w,rearrangeLandscape:L,rearrangeLandscapePage:H,disruptGlyphs:G,randRange:z,registerHit:D,resizeBattlefield:X,scrollX:K,scrollY:me,BOT_HARD_CAP:$,BOT_SIZE:U,LINK_PAD:se,HIT_RADIUS:Z,BOLT_HIT_RADIUS:Te,NUKE_DIRECT_HIT_RADIUS:fe,NUKE_SPEED:Ve,NUKE_ARRIVE_RADIUS:$e,NUKE_MAX_FLIGHT_MS:Fe,MISSILE_SPEED:je,MISSILE_ARRIVE:C,MISSILE_MAX_FLIGHT_MS:He,MISSILE_BLAST_RADIUS:ke,SMALL_WEAPON_SCALE:ot,MISSILE_WEAPON_SCALE:gt}=e,ce=0,Ae=null,Ue=[],rt=null,Je=[];function Xe(){let h=document.documentElement;return{w:h.clientWidth,h:Math.max(document.body.offsetHeight,h.clientHeight)}}function Ze(){let h=m?[...m.querySelectorAll(".cylon-bot")]:[],A=c?[...c.querySelectorAll(".cylon-bot")]:[];return h.concat(A)}function Ct(){return i.killLevel(t.run.koScore)}function bt(){return i.groundMissileCap(t.run.koScore)}function ct(){return i.trackerMissileCap(t.run.koScore)}function _(){return i.trackerMissileChance(t.run.koScore)}function P(h=null){return Ue.filter(A=>A.alive?h==null?!0:A.tracker===h:!1).length}function B(h){return h?P(!0)<ct():P(!1)<bt()}function N(){Je.forEach(h=>clearTimeout(h)),Je=[]}function O(){clearTimeout(rt),rt=null,N(),Ue.forEach(h=>{h.alive=!1,h.el.remove()}),Ue=[],s&&s.classList.remove("is-flying","is-tracker")}function W(){let h=window.innerWidth||800,A=Math.max(24,Math.min(56,h*.04)),I=Math.max(80,h-A*2),q=8+Math.random()*22,te=Ue.filter(ne=>ne.alive).map(ne=>{let be=parseFloat(ne.el.style.left);return Number.isFinite(be)?be:ne.originX||h/2}),pe=12,j=[];for(let ne=0;ne<pe;ne++)j.push(A+(ne+.5)/pe*I);if(j.push(A+Math.random()*I),j.push(A+Math.random()*I),j.push(A+Math.random()*I),!te.length&&Math.random()<.28){let ne=M();return{x:Math.min(h-A,Math.max(A,ne.x+(Math.random()-.5)*64)),y:Math.min(q+18,Math.max(6,ne.y-36))}}let ge=j[0],le=-1/0;for(let ne of j){let be;if(!te.length)be=Math.abs(ne-h/2)/(h/2)*40+Math.random()*80;else{let Se=1/0;for(let Ee of te)Se=Math.min(Se,Math.abs(ne-Ee));be=Se*(1+te.length*.35)+Math.random()*36}be>le&&(le=be,ge=ne)}return{x:ge,y:q}}function V(h,A,I){h&&(h.alive=!1,h.el.remove(),Ue=Ue.filter(j=>j!==h&&j.alive));let q=A+window.scrollX,Q=I+window.scrollY;x.sfx("ko");let te=document.createElement("div");te.className="cylon-missile-blast",te.style.left=`${q}px`,te.style.top=`${Q}px`,te.setAttribute("aria-hidden","true"),c.appendChild(te),setTimeout(()=>te.remove(),420),u(q,Q,l.small),H(q,Q,gt),w(),Math.hypot(o.clientX-A,o.clientY-I)<=ke&&D(2)}function re({forceTracker:h=!1,forceGround:A=!1,fromPair:I=!1}={}){if(!d()||y())return!1;let q=!1;if(A){if(!B(!1))return!1}else if(h){if(q=B(!0),!q)return!1}else if(q=Math.random()<_()&&B(!0),!q&&!B(!1))return!1;let Q=performance.now()-r.t<4e3,te=Q?r.clientX:o.clientX,pe=Q?r.clientY:o.clientY,j=document.createElement("div");j.className="cylon-small-missile is-flying"+(q?" is-tracker":""),j.setAttribute("aria-hidden","true"),document.body.appendChild(j);let ge=W(),le=ge.x,ne=ge.y,be={el:j,tracker:q,alive:!0,originX:le};Ue.push(be);let Se=performance.now(),Ee=Se;j.style.left=`${le}px`,j.style.top=`${ne}px`,x.prime(),x.sfx(q?"trackerMissile":"missile");let Ie=ue=>{if(!be.alive)return;if(t.paused||!n.gameEnabled||t.run.gameOver){Se+=ue-Ee,Ee=ue,requestAnimationFrame(Ie);return}let Le=Math.min(.05,(ue-Ee)/1e3);Ee=ue;let Be=q?o.clientX:te,Ke=q?o.clientY:pe,qe=Be-le,Qe=Ke-ne,We=Math.hypot(qe,Qe)||1,Bt=je*Le;if(le+=qe/We*Math.min(Bt,We),ne+=Qe/We*Math.min(Bt,We),j.style.left=`${le}px`,j.style.top=`${ne}px`,j.style.transform=`rotate(${Math.atan2(Qe,qe)*(180/Math.PI)}deg)`,We<=C||ue-Se>=He){V(be,le,ne);return}requestAnimationFrame(Ie)};if(requestAnimationFrame(Ie),q&&!I&&ct()>=2&&B(!0)&&Math.random()<.45&&(clearTimeout(rt),rt=setTimeout(()=>{rt=null,!(!d()||t.paused||y())&&re({forceTracker:!0,fromPair:!0})},280+Math.random()*320)),!q&&!I&&!A){let ue=Ct(),Le=bt()-P(!1),Be=Math.min(Le,ue<2?0:ue<5?1:2);if(Be>0&&Math.random()<.35+Math.min(.4,ue*.04)){let Ke=1+(Be>1&&Math.random()<.3+Math.min(.35,ue*.03)?1:0);for(let qe=0;qe<Math.min(Ke,Be);qe++){let Qe=90+qe*(140+Math.random()*160),We=setTimeout(()=>{Je=Je.filter(Bt=>Bt!==We),!(!d()||t.paused||y())&&re({forceGround:!0,fromPair:!0})},Qe);Je.push(We)}}}return!0}function de(h,A){return p.inflate(h,A)}function ve(h){return{left:h.left+K(),top:h.top+me(),right:h.right+K(),bottom:h.bottom+me()}}function xe(){let h=document.querySelectorAll('a, button, input, select, textarea, label, summary, [role="link"], [role="button"]'),A=[];return h.forEach(I=>{if(I.closest(".cylon-battlefield")||I.classList.contains("cylon-bot")||I.closest("#cylon-reticle")||I.closest(".cylon-settings"))return;let q=I.getBoundingClientRect();q.width<2||q.height<2||A.push(de(ve(q),se))}),A}function he(){let h=document.querySelector(".site-nav");return p.visibleBounds({scrollX:K(),scrollY:me(),width:document.documentElement.clientWidth||window.innerWidth||1,height:window.innerHeight||1,navBottom:h?h.getBoundingClientRect().bottom:70},U)}function Me(h,A){return p.clampToBounds(he(),h,A)}function ee(h,A){return p.isInBounds(he(),h,A)}function Y(h,A,I){return p.isSafeSpot(h,A,I,Xe(),U)}function _e(h){let A=h?{x:parseFloat(h.style.left)||0,y:parseFloat(h.style.top)||0}:null;return p.findSafeSpot({bounds:he(),forbidden:xe(),doc:Xe(),bot:U},A,Math.random)}function et(h,A,I,q){x.sfx("projectile");let Q=document.createElement("div");Q.className="cylon-bolt",Q.setAttribute("aria-hidden","true");let te=I-h,pe=q-A,j=Math.hypot(te,pe)||1,ge=Math.atan2(pe,te)*(180/Math.PI);Q.style.left=`${h}px`,Q.style.top=`${A}px`,Q.style.width=`${Math.min(j,28)}px`,Q.style.transform=`rotate(${ge}deg)`,c.appendChild(Q);let le=Math.min(.55,.18+j/1800)*1e3,ne=performance.now(),be=ne,Se=!1,Ee=(Le,Be,{struck:Ke=!1}={})=>{Se||(Se=!0,Q.remove(),Pe(Le,Be,{sound:!1}),Ke&&D())},Ie=Q.animate([{left:`${h}px`,top:`${A}px`,opacity:1,width:"14px"},{left:`${I}px`,top:`${q}px`,opacity:.85,width:"22px"}],{duration:le,easing:"linear",fill:"forwards"}),ue=Le=>{if(Se)return;if(!n.gameEnabled||t.run.gameOver){try{Ie.cancel()}catch{}Ee(I,q,{struck:!1});return}if(t.paused){ne+=Le-be,be=Le;try{Ie.pause()}catch{}requestAnimationFrame(ue);return}try{Ie.playState==="paused"&&Ie.play()}catch{}be=Le;let Be=Math.min(1,(Le-ne)/le),Ke=h+(I-h)*Be,qe=A+(q-A)*Be;if(w(),Math.hypot(o.pageX-Ke,o.pageY-qe)<=Te){try{Ie.cancel()}catch{}Ee(Ke,qe,{struck:!0});return}Be<1&&requestAnimationFrame(ue)};requestAnimationFrame(ue),Ie.onfinish=()=>{if(Se)return;w();let Le=Math.hypot(o.pageX-I,o.pageY-q)<=Z;Ee(I,q,{struck:Le})}}function Pe(h,A,{sound:I=!0}={}){if(!c)return;I&&n.soundEnabled&&(x.prime(),x.sfx("projectile"));let q=document.createElement("div");q.className="cylon-impact",q.style.left=`${h}px`,q.style.top=`${A}px`,q.setAttribute("aria-hidden","true"),c.appendChild(q),u(h,A,l.small),H(h,A,ot),setTimeout(()=>q.remove(),300)}function Oe(h){return!h||!h.closest?!0:!!(h.closest(".site-nav")||h.closest(".cylon-help")||h.closest(".cylon-gameover")||h.closest(".cylon-settings-panel")||h.closest(".cylon-bot")||h.closest("#cylon-reticle")||h.closest("#cic-enter-btn"))}function vt(){window.addEventListener("pointerdown",h=>{d()&&(S.grenadeArmed()||f.playing()||h.button!=null&&h.button!==0||t.reticlePointerId!=null&&h.pointerId===t.reticlePointerId||Oe(h.target)||(h.preventDefault(),Pe(h.pageX,h.pageY)))})}function at(){t.run=a.recordKill(t.run),g&&(g.textContent=String(t.run.koScore),g.classList.remove("is-bump"),g.offsetWidth,g.classList.add("is-bump"),setTimeout(()=>g.classList.remove("is-bump"),180))}function oe(h){h._shootInterval&&clearInterval(h._shootInterval),h._patrolInterval&&clearInterval(h._patrolInterval),h._shootInterval=null,h._patrolInterval=null}function ze(h){if(h.dataset.ko==="1")return;h.dataset.ko="1",h.classList.add("is-ko"),oe(h),x.sfx("ko");let A=(parseFloat(h.style.left)||0)+U.w/2,I=(parseFloat(h.style.top)||0)+U.h/2;Pe(A,I,{sound:!1}),at(),ce=Math.max(0,ce-1),setTimeout(()=>h.remove(),560)}function Ne(){Ze().forEach(h=>{oe(h),h.remove()}),c.querySelectorAll(".cylon-bolt, .cylon-impact").forEach(h=>h.remove()),v.clearAll(),ce=0}function Lt(){Ze().forEach((A,I)=>{setTimeout(()=>{A.isConnected&&A.dataset.ko!=="1"&&ze(A)},I*70)}),c.querySelectorAll(".cylon-bolt").forEach(A=>A.remove())}function zt(h){return p.marchOrigin(he(),h,U)}function tt(h){let A=xe(),I=parseFloat(h.style.left)||0,q=parseFloat(h.style.top)||0;if(!ee(I,q)||!Y(I,q,A)){let Q=_e(h);return Q?(h.style.left=`${Q.x}px`,h.style.top=`${Q.y}px`,!0):!1}return!0}function Zt(h){if(!d()||h.dataset.ko==="1"||!h.isConnected||h.classList.contains("is-marching"))return;let A=_e(h);if(!A)return;let I=Me(A.x,A.y);h.classList.add("is-marching"),h.style.left=`${I.x}px`,h.style.top=`${I.y}px`,setTimeout(()=>{!h.isConnected||h.dataset.ko==="1"||(h.classList.remove("is-marching"),tt(h))},920)}function Rn(){d()&&Ze().forEach(h=>{if(h.dataset.ko==="1"||!h.isConnected||h.classList.contains("is-hiding"))return;let A=parseFloat(h.style.left)||0,I=parseFloat(h.style.top)||0;ee(A,I)||Zt(h)})}function Rt(){let h=document.querySelector("#nav-main.is-active, #nav-contact.is-active")||document.getElementById("nav-main");if(!h)return null;let A=[...h.querySelectorAll("h1, h2, h3, p, li")];if(!A.length)return null;let I=A.filter(Q=>{let te=Q.getBoundingClientRect();return te.width>8&&te.height>8&&te.bottom>60&&te.top<(window.innerHeight||1)-20&&te.right>0&&te.left<(window.innerWidth||1)}),q=I.length?I:A;for(let Q=0;Q<12;Q++){let pe=q[Math.floor(Math.random()*q.length)].getBoundingClientRect();if(pe.width<8||pe.height<8)continue;let j=ve(pe),ge=j.left+Math.random()*Math.max(8,j.right-j.left-U.w),le=j.top+Math.random()*Math.max(4,Math.min(j.bottom-j.top,U.h)*.65);return{x:ge,y:le}=Me(ge,le),{x:ge,y:le,edge:"ambush"}}return null}function Pt(h){let A=()=>{if(!d()||h.dataset.ko==="1"||!h.isConnected||h.classList.contains("is-marching"))return;if(!tt(h)){oe(h),h.remove(),ce=Math.max(0,ce-1);return}let I=parseFloat(h.style.left)||0,q=parseFloat(h.style.top)||0;w(),et(I+U.w/2,q+U.h*.35,o.pageX,o.pageY)};setTimeout(A,200+Math.random()*400),h._shootInterval=setInterval(A,1500+Math.random()*1100),h._patrolInterval=setInterval(()=>Zt(h),2200+Math.random()*1800)}function xt(){return i.botCap(t.run.koScore,$)}function en(h){h.addEventListener("pointerdown",A=>{d()&&(h.classList.contains("is-hiding")||t.reticlePointerId!=null&&A.pointerId===t.reticlePointerId||A.pointerType==="mouse"&&A.button!=null&&A.button!==0||(A.preventDefault(),A.stopPropagation(),x.prime(),ze(h)))}),h.addEventListener("wheel",A=>{document.body.classList.contains("cylon-game-live")||window.scrollBy({top:A.deltaY,left:A.deltaX,behavior:"auto"})},{passive:!0})}function ye(h){if(!(h.dataset.ko==="1"||!h.isConnected)){if(h.classList.remove("is-marching","is-hiding","is-emerging"),!tt(h)){oe(h),h.remove(),ce=Math.max(0,ce-1);return}Pt(h)}}function dt(){if(!d()||ce>=xt())return!1;X();let A=Math.random()<.4&&m?Rt():null,I=document.createElement("button");if(I.type="button",I.title="Attack drone",I.setAttribute("aria-label","Attack hostile drone"),I.innerHTML='<span class="cylon-bot-body"></span><span class="cylon-bot-legs" aria-hidden="true"><span></span><span></span></span>',en(I),A)return I.className="cylon-bot is-hiding",I.style.left=`${A.x}px`,I.style.top=`${A.y}px`,m.appendChild(I),ce+=1,setTimeout(()=>{if(I.dataset.ko==="1"||!I.isConnected||!d()){I.isConnected&&(oe(I),I.remove(),ce=Math.max(0,ce-1));return}c.appendChild(I),I.classList.remove("is-hiding"),I.classList.add("is-emerging"),setTimeout(()=>ye(I),560)},700+Math.random()*900),!0;let q=_e();if(!q)return!1;let Q=zt(q);return I.className="cylon-bot is-marching",I.style.left=`${Q.x}px`,I.style.top=`${Q.y}px`,c.appendChild(I),ce+=1,requestAnimationFrame(()=>{I.style.left=`${q.x}px`,I.style.top=`${q.y}px`}),setTimeout(()=>ye(I),950),!0}function Ce(){if(!d())return;let h=xt()-ce;if(h<=0)return;let{isWave:A,count:I}=i.planWave(h,xt(),Math.random);for(let q=0;q<I;q++)setTimeout(()=>dt(),q*(A?380:0))}function wt(h=!1){clearTimeout(Ae);let A=h?2500+Math.random()*2500:3500+Math.random()*4500;Ae=setTimeout(()=>{d()&&Ce(),wt(!1)},A)}function It(h,A,{dealDamage:I=!0,shake:q=!0}={}){if(!k)return;x.prime(),x.sfx("nuke");let Q=window.innerWidth||1,te=window.innerHeight||1;k.style.setProperty("--nuke-x",`${h/Q*100}%`),k.style.setProperty("--nuke-y",`${A/te*100}%`),k.classList.add("is-detonating"),q&&(document.body.classList.add("is-nuke-shake"),setTimeout(()=>document.body.classList.remove("is-nuke-shake"),600));let pe=h+window.scrollX,j=A+window.scrollY;u(pe,j,{radius:v.largeRadius(),holdMs:l.large.holdMs,fadeMs:l.large.fadeMs});let ge=3+Math.floor(Math.random()*3);for(let le=0;le<ge;le++){let ne=Math.random()*Math.PI*2,be=z(v.largeRadius()*.35,v.largeRadius()*.85),Se=pe+Math.cos(ne)*be,Ee=j+Math.sin(ne)*be;u(Se,Ee,{radius:z(48,110),holdMs:l.medium.holdMs,fadeMs:l.medium.fadeMs})}L(h,A,1),T.scattered()?T.reshuffle():(G(pe,j,1.45),setTimeout(()=>G(pe,j,1.2),220),setTimeout(()=>G(pe,j,.85),520)),I&&Math.hypot(o.clientX-h,o.clientY-A)<=fe&&D(1,{fromNuke:!0}),setTimeout(()=>k.classList.remove("is-detonating"),2500)}function Dt(){if(!d()||y()||t.nukeInFlight)return;if(!E){It(o.clientX,o.clientY);return}t.nukeInFlight=!0;let h=M(),A=h.x,I=h.y,q=o.clientX,Q=o.clientY,te=!y(),pe=performance.now(),j=pe;E.style.left=`${A}px`,E.style.top=`${I}px`,E.classList.add("is-flying"),x.prime(),x.sfx("nukeLaunch");let ge=le=>{if(t.paused||!n.gameEnabled||t.run.gameOver){if(pe+=le-j,j=le,!t.nukeInFlight)return;requestAnimationFrame(ge);return}let ne=Math.min(.05,(le-j)/1e3);j=le,y()?te&&(te=!1):(te=!0,q=o.clientX,Q=o.clientY);let be=q,Se=Q,Ee=be-A,Ie=Se-I,ue=Math.hypot(Ee,Ie)||1,Le=Ve*ne;A+=Ee/ue*Math.min(Le,ue),I+=Ie/ue*Math.min(Le,ue),E.style.left=`${A}px`,E.style.top=`${I}px`;let Be=Math.atan2(Ie,Ee)*(180/Math.PI);E.style.setProperty("--nuke-heading",`${Be}deg`);let Ke=ue<=$e,qe=le-pe>=Fe;if(Ke||qe){E.classList.remove("is-flying"),t.nukeInFlight=!1,It(A,I);return}requestAnimationFrame(ge)};requestAnimationFrame(ge)}return{allBots:Ze,knockOutBot:ze,clearAllBots:Ne,wipeAllBotsWithScore:Lt,herdBotsIntoView:Rn,scheduleAmbush:wt,bindPlayerMissShots:vt,canLaunchMissile:B,launchSmallMissile:re,clearActiveMissiles:O,launchNuke:Dt,detonateNukeAt:It}}function kr(e){let t=e.weekStartsOn==="sunday"?"Sunday":"Monday",n=e.timezone==="America/Chicago"?"Central":e.timezone==="local"?"your time":String(e.timezone||"");return`Play often — scores reset every ${t} at midnight ${n}.`}function un(e){return e.map((t,n)=>{let o=t.at?new Date(t.at):null,r=o&&!Number.isNaN(o.getTime())?o.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"}):"";return{rank:n+1,initials:(t.initials||"AAA").toString().slice(0,3).toUpperCase(),date:r,score:t.score}})}function ut(e){return typeof e=="object"&&e!==null}function _r(e,t){let n=t.log??((l,d)=>console.error(l,d)),o="",r="",a=0,i=null,p=10,c=new Set,m=[],s=[];function k(l){return{"X-Cylon-CSRF":o,...l}}function E(l){if(!ut(l))return;let d=Number(l.maxScores);d>=1&&(p=d),Array.isArray(l.blockedInitials)&&(c.clear(),l.blockedInitials.forEach(y=>{let M=String(y||"").toUpperCase();/^[A-Z]{3}$/.test(M)&&c.add(M)}))}function g(l){ut(l)&&(Array.isArray(l.scores)&&(m=l.scores),Array.isArray(l.alltime)&&(s=l.alltime))}async function x(){try{let l=await t.fetch(e,{cache:"no-store",credentials:"same-origin",headers:k()});if(!l.ok)throw new Error("bad status");let d=await l.json();if(!ut(d))throw new Error("bad body");return typeof d.csrf=="string"&&d.csrf&&(o=d.csrf),E(d.config),m=Array.isArray(d.scores)?d.scores:[],s=Array.isArray(d.alltime)?d.alltime:[],ut(d.config)?d.config:null}catch{return null}}function f(){let l=++a;return r="",i=(async()=>{try{o||await x();let d=await t.fetch(e,{method:"POST",credentials:"same-origin",headers:k({"Content-Type":"application/json"}),body:JSON.stringify({op:"start"}),cache:"no-store"}),y=await d.json().catch(()=>null);if(l!==a)return;d.ok&&ut(y)&&typeof y.run=="string"&&(r=y.run)}catch(d){n("Cylon run token failed",d)}})(),i}function S(l,d=m){if(l<1)return!1;if(!d||d.length<p)return!0;let y=1/0;for(let M of d){let w=Number(M.score)||0;w<y&&(y=w)}return l>y}function v(l){let d=ut(l)?l.alltimeRank:null;return typeof d=="number"&&Number.isInteger(d)&&d>=1?d:null}function T(l){return c.has((l||"").toUpperCase())}async function u(l,d,y){if(!l||l<1)return{saved:!1,problem:null,allTimeRank:null};let M=(d||"AAA").toUpperCase().slice(0,3).padEnd(3,"A");if(T(M))return{saved:!1,problem:"invalid-initials",allTimeRank:null};try{if(i&&await i,!r)return{saved:!1,problem:"save-failed",allTimeRank:null};let w=await t.fetch(e,{method:"POST",credentials:"same-origin",headers:k({"Content-Type":"application/json"}),body:JSON.stringify({op:"score",score:l,hits:y,initials:M,run:r}),cache:"no-store"}),L=null;try{L=await w.json()}catch{L=null}return w.status===400&&ut(L)&&L.error==="invalid initials"?(g(L),{saved:!1,problem:"invalid-initials",allTimeRank:null}):w.ok?(r="",g(L),{saved:!0,problem:null,allTimeRank:v(L)}):(g(L),{saved:!1,problem:"save-failed",allTimeRank:null})}catch{return{saved:!1,problem:null,allTimeRank:null}}}return{board:()=>m,alltime:()=>s,qualifies:S,isBlocked:T,load:x,startRun:f,submit:u}}var wr="cylon-local-scores",jn=10;function Yi(e){let t=new Date(e.getFullYear(),e.getMonth(),e.getDate());return t.setDate(t.getDate()-t.getDay()),t.getTime()}function Sr(e,t=()=>new Date){let n=[];function o(){try{let c=JSON.parse(e?.getItem(wr)??"[]");return Array.isArray(c)?c.filter(m=>ut(m)&&typeof m.score=="number"&&m.score>=1):[]}catch{return[]}}let r=c=>[...c].sort((m,s)=>s.score-m.score||Number(new Date(m.at??0))-Number(new Date(s.at??0))).slice(0,jn),a=()=>r(n),i=()=>{let c=Yi(t());return r(n.filter(m=>Number(new Date(m.at??0))>=c))};n=o();function p(c,m=i()){return c<1?!1:m.length<jn?!0:c>Math.min(...m.map(s=>s.score))}return{board:i,alltime:a,qualifies:p,isBlocked:()=>!1,async load(){return n=o(),{maxScores:jn,weekStartsOn:"sunday",timezone:"local"}},async startRun(){},async submit(c,m,s){if(!c||c<1)return{saved:!1,problem:null,allTimeRank:null};let E={initials:(m||"AAA").toUpperCase().slice(0,3).padEnd(3,"A"),score:c,at:t().toISOString()};n=[...o(),E];let g=new Set([...a(),...i()]);n=n.filter(f=>g.has(f));try{e?.setItem(wr,JSON.stringify(n))}catch{}let x=a().indexOf(E);return{saved:!0,problem:null,allTimeRank:x>=0?x+1:null}}}}var ie,Mr,ji,pt,Er,yn,Cr,mn,Lr,Qn,Jn,Ji,gn={},bn=[],Qi=/^m(i|n|o|s|text|space)$/,Zn=Array.isArray,Rr=bn.slice,Et=Object.assign;function vn(e){e&&e.parentNode&&e.remove()}function fn(e,t,n,o,r){var a={type:e,props:t,key:n,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r||++Mr,__i:-1,__u:0};return!r&&ie.vnode&&ie.vnode(a),a}function Ye(e){return e.children}function hn(e,t){this.props=e,this.context=t,this.__g=0}function mt(e,t){if(t==null)return e.__?mt(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])&&n.__e)return n.__e;return typeof e.type!="function"||e.props.__P?null:mt(e)}function Pr(e){if((e=e.__)&&e.__c&&!e.props.__P)return e.__e=null,e.__k.some(function(t){return t&&(e.__e=t.__e)}),Pr(e)}function Tr(e){(8&e.__g||!(e.__g|=8)||!pt.push(e)||yn++)&&Er==ie.debounceRendering||((Er=ie.debounceRendering)||queueMicrotask)(Zi)}function Zi(){var e,t,n,o,r,a,i,p,c;try{for(t=1;pt.length;)pt.length>t&&pt.sort(Cr),e=pt.shift(),t=pt.length,8&e.__g&&(o=void 0,r=void 0,a=(r=(n=e).__v).__e,i=[],p=[],(c=n.__P)&&((o=Et({constructor:void 0},r)).__v=r.__v+1,ie.vnode&&ie.vnode(o),eo(c,o,r,n.__n,c.namespaceURI,32&r.__u?[a]:null,i,a||mt(r),32&r.__u,p),o.__v=r.__v,o.__.__k[o.__i]=o,Fr(i,o,p),r.__=r.__e=null,o.__e!=a&&Pr(o)))}finally{pt.length=yn=0}}function Ir(e,t,n,o,r,a,i,p,c,m,s){var k,E,g,x,f,S,v=o.__k||bn,T=t.length;for(c=es(n,t,v,c,T),k=0;k<T;k++)(g=n.__k[k])!=null&&(E=~g.__i&&v[g.__i]||gn,g.__i=k,S=eo(e,g,E,r,a,i,p,c,m,s),x=g.__e,(E.ref!=g.ref||8&E.__u)&&(E.ref&&to(E.ref,null,g,E),g.ref&&s.push(g.ref,g.__c||x,g)),f=f||x,4&g.__u?(c=Dr(g,c,e,!E.__v),E.__e&&(E.__e=null)):typeof g.type=="function"&&S!==void 0?c=S:x&&(c=x.nextSibling),g.__u&=-7);return n.__e=f,c}function es(e,t,n,o,r){var a,i,p,c,m,s,k,E,g,x,f=n.length,S=f,v=0,T=!1,u=e.__k=Array(r);for(a=0;a<r;a++)(i=t[a])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i!="object"||i.constructor==String?i=u[a]=fn(null,i):Zn(i)?i=u[a]=fn(Ye,{children:i}):i.constructor===void 0&&i.__b?i=u[a]=fn(i.type,i.props,i.key,i.ref,i.__v):u[a]=i,c=a+v,i.__=e,i.__b=e.__b+1,p=null,~(m=i.__i=ts(i,n,c,S))&&(S--,(p=n[m])&&(p.__u|=2)),p&&p.__v?(i.__u|=2,m==c-1?v--:m==c+1?v++:m!=c&&(m>c?v--:v++,T=!0)):(~m||(r>f?v--:r<f&&v++),typeof i.type!="function"&&(i.__u|=4))):u[a]=null;if(T){for(s=[],k=[],a=0;a<r;a++)if((i=u[a])&&2&i.__u){for(E=0,g=s.length;E<g;)s[x=E+g>>1]<i.__i?E=x+1:g=x;s[E]=i.__i,k[a]=E+1}for(v=s.length;a--;)k[a]&&(k[a]==v?v--:u[a].__u|=4)}if(S)for(a=0;a<f;a++)!(p=n[a])||2&p.__u||(p.__e==o&&(o=mt(p)),no(p,p));return o}function Dr(e,t,n,o){var r,a,i;if(typeof e.type=="function"){if(e.props.__P)return t;if(r=e.__k)for(a=0;a<r.length;a++)r[a]&&(r[a].__=e,t=Dr(r[a],t,n,!1));return t}for(t&&!t.parentNode&&(t=mt(e))&&!t.parentNode&&(t=null),i=t;i&&i.nodeType==8;)i=i.nextSibling;for(e.__e!=i&&(!o&&n.moveBefore&&e.__e.parentNode?n.moveBefore(e.__e,t):n.insertBefore(e.__e,t||null)),t=e.__e;(t=t&&t.nextSibling)&&t.nodeType==8;);return t}function ts(e,t,n,o){var r,a,i,p=e.key,c=e.type,m=t[n],s=m&&!(2&m.__u);if(m===null&&p==null||s&&p==m.key&&c==m.type)return n;if(o>(s?1:0)){for(r=n-1,a=n+1;r>=0||a<t.length;)if((m=t[i=r>=0?r--:a++])&&!(2&m.__u)&&p==m.key&&c==m.type)return i}return-1}function Ar(e,t,n){n==null&&(n=""),t[0]=="-"?e.setProperty(t,n):e[t]=n}function pn(e,t,n,o,r){var a,i;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof o=="string"&&(e.style.cssText=o=""),o)for(t in o)n&&t in n||Ar(e.style,t,"");if(n)for(t in n)o&&n[t]==o[t]||Ar(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")(e.__e||(e.__e={}))[t]=n,n&&o||(i=Jn[t]||(Jn[t]=ns(t)),(e.__a||(e.__a={}))[t]=Qn,a=t!=(t=t.replace(Lr,"$1")),(t=t.slice(2))[0]<"a"&&(t=t.toLowerCase()),n?e.addEventListener(t,i,a):e.removeEventListener(t,i,a));else{if(r=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function ns(e){return function(t){if(this.__e){var n=this.__e[e];if(t[mn]==null)t[mn]=Qn++;else if(t[mn]<this.__a[e])return;return n(ie.event?ie.event(t):t)}}}function eo(e,t,n,o,r,a,i,p,c,m){var s,k,E,g,x,f,S,v,T,u,l,d,y,M,w,L,H,G,z,D,X=t.type;if(t.constructor!==void 0)return null;if(128&n.__u&&(c=32&n.__u,s=n.__c.__z)){if(t.__u|=c,k=a=[],s.nodeType==8)for(E=1,g=s.nextSibling;g;g=g.nextSibling){if(g.nodeType==8){if(g.data.startsWith("$s"))E++;else if(g.data.startsWith("/$s")&&!--E)break}a.push(g)}else a.push(s);p=a[0]}(s=ie.__b)&&s(t);e:if(typeof X=="function"){x=i.length;try{if(u=t.props,l=(s=X.prototype)&&s.render,d=(s=X.contextType)&&o[s.__c],y=s?d?d.props.value:s.__:o,n.__c?2&(f=t.__c=n.__c).__g&&(f.__g|=1):(l?t.__c=f=new X(u,y):(t.__c=f=new hn(u,y),f.constructor=X,f.render=rs),d&&d.sub(f),f.state||(f.state={}),f.__n=o,f.__g|=8,f.__h=[],f.__k=[]),l&&(f.__s||(f.__s=f.state),X.getDerivedStateFromProps&&(f.__s==f.state&&(f.__s=Et({},f.__s)),Et(f.__s,X.getDerivedStateFromProps(u,f.__s)))),S=f.props,v=f.state,f.__v=t,n.__c){if(l&&!X.getDerivedStateFromProps&&u!==S&&f.componentWillReceiveProps&&f.componentWillReceiveProps(u,y),t.__v==n.__v&&!(8&f.__g)||!(4&f.__g)&&f.shouldComponentUpdate&&f.shouldComponentUpdate(u,f.__s,y)===!1){t.__v!=n.__v&&(f.props=u,f.state=f.__s,f.__g&=-9),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(K){K&&(K.__=t)}),bn.push.apply(f.__h,f.__k),f.__k=[],f.__h.length&&i.push(f),p=mt(n);break e}f.componentWillUpdate&&f.componentWillUpdate(u,f.__s,y),l&&f.componentDidUpdate&&f.__h.push(function(){f.componentDidUpdate(S,v,T)})}else l&&!X.getDerivedStateFromProps&&f.componentWillMount&&f.componentWillMount(),l&&f.componentDidMount&&f.__h.push(f.componentDidMount);if(f.context=y,f.props=u,f.__P=e,f.__g&=-5,M=ie.__r,w=0,l)f.state=f.__s,f.__g&=-9,M&&M(t),s=f.render(f.props,f.state,f.context),bn.push.apply(f.__h,f.__k),f.__k=[];else do f.__g&=-9,M&&M(t),s=f.render(f.props,f.state,f.context),f.state=f.__s;while(8&f.__g&&++w<25);f.state=f.__s,f.getChildContext&&(o=Et({},o,f.getChildContext())),l&&n.__c&&f.getSnapshotBeforeUpdate&&(T=f.getSnapshotBeforeUpdate(S,v)),L=s&&s.type===Ye&&s.key==null?s.props.children:s,u.__P&&(s=p,r=(e=u.__P).namespaceURI,c=a=null,n.props&&n.props.__P!=e&&(n.__k.some(function(K){K&&no(K,K)}),n.__k=null),p=n.__k?mt(n,0):null),p=Ir(e,Zn(L)?L:[L],t,n,o,r,a,i,p,c,m),u.__P&&(t.__e=null,p=s),t.__u&=-161,128&n.__u&&(f.__z=null),k&&k.some(vn),f.__h.length&&i.push(f),1&f.__g&&(f.__g&=-4)}catch(K){if(i.length=x,t.__v=null,c||a)if(K.then){if(H=0,t.__u|=c?160:128,a){for(~(z=a.indexOf(p||void 0))||(z=a.length);(D=a[z-1])&&D.nodeType==8;)z--;for(;z<a.length;z++)if(D=a[z]){if(a[z]=null,D.nodeType==8){if(D.data.startsWith("$s"))H++||(G=D);else if(H&&D.data.startsWith("/$s")&&!--H){p=D;break}}else if(!H)break}}if(!G){for(;p&&p.nodeType==8&&p.nextSibling;)p=p.nextSibling;G=p}t.__c.__z||(t.__c.__z=G),t.__e=p}else a&&a.some(vn);else t.__e=n.__e;t.__k||(t.__k=n.__k||[]),K.then||Br(t),ie.__e(K,t,n)}}else p=t.__e=os(n.__e,t,n,o,r,a,i,c,m,e);return(s=ie.diffed)&&s(t),128&t.__u?void 0:p}function Br(e){e&&(e.__c&&(e.__c.__g|=4),e.__k&&e.__k.some(Br))}function Fr(e,t,n){for(var o=0;o<n.length;)to(n[o++],n[o++],n[o++]);ie.__c&&ie.__c(t,e),e.some(function(r){try{e=r.__h,r.__h=[],e.some(function(a){a.call(r)})}catch(a){ie.__e(a,r.__v)}})}function os(e,t,n,o,r,a,i,p,c,m){var s,k,E,g,x,f,S,v,T,u=n.props||gn,l=t.props,d=t.type;if(d=="svg"?r="http://www.w3.org/2000/svg":d=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),a){for(s=0;s<a.length;s++)if((x=a[s])&&(d?x.localName==d:x.nodeType==3)){e=x,a[s]=null;break}}if(!e){if(v=m.ownerDocument||document,!d)return v.createTextNode(l);e=v.createElementNS(r,d,l.is&&l),p&&(ie.__m&&ie.__m(t,a),p=!1),a=null}if(d){if(m=d=="template"?e.content:e,a=d=="textarea"&&l.defaultValue!=null?null:a&&Rr.call(m.childNodes),!p&&a)for(u={},s=0;s<e.attributes.length;s++)u[(x=e.attributes[s]).name]=x.value;for(s in u)x=u[s],s=="dangerouslySetInnerHTML"?E=x:s=="children"||s in l||s=="value"&&"defaultValue"in l||s=="checked"&&"defaultChecked"in l||pn(e,s,null,x,r);for(s in T=1&n.__u,l)x=l[s],s=="children"?g=x:s=="dangerouslySetInnerHTML"?k=x:s=="value"?f=x:s=="checked"?S=x:p&&typeof x!="function"||!(u[s]!==x||T&&x!=null)||pn(e,s,x,u[s],r);k?(p||E&&(k.__html==E.__html||k.__html==e.innerHTML)||(e.innerHTML=k.__html),t.__k=[]):(E&&(e.textContent=""),(d=="foreignObject"||r=="http://www.w3.org/1998/Math/MathML"&&Qi.test(d))&&(r="http://www.w3.org/1999/xhtml"),Ir(m,Zn(g)?g:[g],t,n,o,r,a,i,a?a[0]:n.__k&&mt(n,0),p,c),a&&a.some(vn)),p&&d!="textarea"||(s="value",d=="progress"&&f==null?e.removeAttribute(s):f==null||f===e[s]&&(d!="progress"||f)||pn(e,s,f,u[s],r),s="checked",S!=null&&S!=e[s]&&pn(e,s,S,u[s],r))}else u===l||p&&e.data==l||(e.data=l);return e}function to(e,t,n,o){try{typeof e=="function"?t?t.__x=e(t)||1:o&&(o=o.__c||o.__e)&&(t=o.__x)&&(o.__x=null,typeof t=="function"?t():e(null)):e.current=t}catch(r){ie.__e(r,n)}}function no(e,t,n){var o,r;if(ie.unmount&&ie.unmount(e),!(o=e.ref)||o.current&&o.current!=e.__e||to(o,null,t,e),o=e.__c){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(a){ie.__e(a,t)}o.__P=o.__n=null}if(o=e.__k)for(r=0;r<o.length;r++)o[r]&&no(o[r],t,typeof e.type!="function"||n&&!e.props.__P);(o=e.__e)&&(n||vn(o),o.__e&&(o.__e=null)),e.__e=e.__c=e.__=null}function rs(e,t,n){return this.constructor(e,n)}function lt(e,t){var n,o,r,a;ie.__&&ie.__(e,t),t.nodeType==9&&(t=t.documentElement),o=(n=e&&32&e.__u)?null:t.__k,t.__k=fn(Ye,{children:[e]}),r=[],a=[],eo(t,t.__k,o||gn,gn,t.namespaceURI,o?null:t.firstChild?Rr.call(t.childNodes):null,r,o?o.__e:t.firstChild,n,a),Fr(r,t.__k,a),t.__k.props.children=null}ie={__e:function(e,t,n,o){for(var r,a,i;t=t.__;)if((r=t.__c)&&!(1&r.__g)){r.__g|=4;try{if((a=r.constructor)&&a.getDerivedStateFromError&&(r.setState(a.getDerivedStateFromError(e)),i=8&r.__g),r.componentDidCatch&&(r.componentDidCatch(e,o||{}),i=8&r.__g),i)return void(r.__g|=2)}catch(p){e=p,i=0}}throw yn=0,e}},Mr=0,ji=function(e){return e!=null&&e.constructor===void 0},hn.prototype.setState=function(e,t){var n=this.__s;n&&n!=this.state||(n=this.__s=Et({},this.state)),typeof e=="function"&&(e=e(Et({},n),this.props)),e&&(Et(n,e),this.__v&&(t&&this.__k.push(t),Tr(this)))},hn.prototype.forceUpdate=function(e){this.__v&&(this.__g|=4,e&&this.__h.push(e),Tr(this))},hn.prototype.render=Ye,pt=[],yn=0,Cr=function(e,t){return e.__v.__b-t.__v.__b},mn=Symbol(),Lr=/(PointerCapture)$|Capture$/i,Qn=0,Jn={},Ji=0;var xn,Ge,oo,Hr,as=Object.is,ro=0,Xr=[],ao=[],we=ie,Or=we.__b,Nr=we.__r,qr=we.diffed,Gr=we.__c,zr=we.unmount,Vr=we.__;function Kr(e,t){we.__h&&we.__h(Ge,e,ro||t),ro=0;var n=Ge.__H||(Ge.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function Tt(e,t){var n=Kr(xn++,4);!we.__s&&Wr(n.__H,t)&&(n.__P=!1,n.__=e,n.u=t,Ge.__h.push(n))}function At(e){return ro=5,is(function(){return{current:e}},[])}function is(e,t){var n=Kr(xn++,7);return Wr(n.__H,t)&&(n.__=e(),n.__H=t),n.__}function ss(){var e;do{for(;e=ao.shift();)try{Ut(e)}catch(n){we.__e(n,{__:(e=e.__P)&&e.__v})}for(;e=Xr.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(Ut),t.__h.some(io),t.__h=[]}catch(n){t.__h=[],we.__e(n,e.__v)}}}while(ao.length)}we.__b=function(e){Ge=null,Or&&Or(e)},we.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),Vr&&Vr(e,t)},we.__r=function(e){Nr&&Nr(e),xn=0;var t=(Ge=e.__c).__H;t&&(oo==Ge?Ge.__h=[]:(t.__h.some(Ut),t.__h.some(io),xn=0),t.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})),oo=Ge},we.diffed=function(e){qr&&qr(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&Ur(Xr.push(t)),t.__H.__.some(function(n){n.u&&(n.__H=n.u)})),oo=Ge=null},we.__c=function(e,t){t.some(function(n){try{n.__h.some(Ut),n.__h=n.__h.filter(function(o){return!o.__||io(o)})}catch(o){t.some(function(r){r.__h&&(r.__h=[])}),t=[],we.__e(o,n.__v)}}),Gr&&Gr(e,t)},we.unmount=function(e){zr&&zr(e);var t,n,o=e.__c;o&&o.__H&&(o.__H.__.some(function(r){try{if(r.__P&&r.__c){if(n===void 0){for(n=e.__;n&&(!n.__c||!n.__c.__P);)n=n.__;n=n&&n.__c}r.__P=n,Ur(ao.push(r))}else Ut(r)}catch(a){t=a}}),o.__H=void 0,t&&we.__e(t,o.__v))};var $r=typeof requestAnimationFrame=="function";function ls(e){var t,n=function(){clearTimeout(o),$r&&cancelAnimationFrame(t),setTimeout(e)},o=setTimeout(n,35);$r&&(t=requestAnimationFrame(n))}function Ur(e){e!=1&&Hr==we.requestAnimationFrame||((Hr=we.requestAnimationFrame)||ls)(ss)}function Ut(e){var t=Ge,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),Ge=t}function io(e){var t=Ge;e.__c=e.__(),Ge=t}function Wr(e,t){return!e||e.length!=t.length||t.some(function(n,o){return!as(n,e[o])})}var cs=0;function b(e,t,n,o,r,a){t||(t={});var i,p,c=t;if("ref"in c&&typeof e!="function")for(p in c={},t)p=="ref"?i=t[p]:c[p]=t[p];var m={type:e,props:c,key:n,ref:i,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--cs,__i:-1,__u:0};return(r||a)&&(m.__source=r,m.__self=a),ie.vnode&&ie.vnode(m),m}function Nt({label:e,class:t,at:n,decorative:o,variant:r}){let a=r==="tab"?t?`kit-key-tab ${t}`:"kit-key-tab":t??"kit-key-chip";return b("kbd",{class:a,"data-keyhint":n,"aria-hidden":o?"true":void 0,children:e})}var so=null;function Yr(){return so}function nt(e){return b("button",{type:"button",id:e.id,class:e.class,disabled:e.disabled,"aria-label":e.label,title:e.title,"aria-pressed":e.pressed,role:e.checked===void 0?void 0:"switch","aria-checked":e.checked,onClick:t=>{so=t.currentTarget,t.currentTarget.blur(),e.onClick(),setTimeout(()=>{so=null},0)},children:[e.children,e.keyLabel?b(Nt,{label:e.keyLabel,variant:"tab",class:"kit-key-inline",decorative:!0}):null]})}var ds=new Set(["button","input","select","textarea"]);function us(e){if(e.hidden||e.inert||e.getAttribute("inert")!=null||e.style&&e.style.display==="none")return!0;if(typeof getComputedStyle=="function")try{if(getComputedStyle(e).display==="none")return!0}catch{}return!1}function jr(e){let t=[],n=(o,r)=>{let a=!1;for(let i of Array.from(o.children)){if(i.nodeType!==1)continue;let p=i,c=(p.localName||"").toLowerCase(),m=c==="legend"&&!a;if(c==="legend"&&(a=!0),us(p))continue;let s=p.getAttribute("tabindex"),k=s!=null?Number(s)>=0:ds.has(c)||c==="a"&&p.getAttribute("href")!=null,E=r&&!m;k&&!E&&!p.disabled&&t.push(p),n(p,E||c==="fieldset"&&p.disabled===!0)}};return n(e,!1),t}function ps(e,t){for(let n=t;n;n=n.parentNode)if(n===e)return!0;return!1}function qt(e){let t=At(null),n=At(null),o=At(!1),r=At(!1),a=()=>{n.current?.focus?.(),n.current=null};return Tt(()=>{if(e.open&&!o.current){let i=document.activeElement;n.current=i&&i!==document.body?i:Yr();let p=e.focusId?document.getElementById(e.focusId):null,c=t.current?jr(t.current).find(m=>m.localName==="button"):void 0;(p??c??t.current)?.focus?.()}else!e.open&&o.current&&a();o.current=e.open},[e.open]),Tt(()=>()=>{o.current&&a()},[]),Tt(()=>{if(!e.open)return;let i=p=>{let c=t.current;if(p.key!=="Tab"||p.ctrlKey||p.altKey||p.metaKey||!c)return;let m=jr(c),s=document.activeElement,k=ps(c,s);if(!m.length){p.preventDefault(),c.focus();return}let E=m[0],g=m[m.length-1],x=m.includes(s);(p.shiftKey?!k||!x||s===E:!k||!x||s===g)&&(p.preventDefault(),(p.shiftKey?g:E).focus())};return document.addEventListener("keydown",i,!0),()=>document.removeEventListener("keydown",i,!0)},[e.open]),Tt(()=>{let i=e.onDismiss;if(!e.open||!i)return;let p=c=>{!Ht(c)||Ot(c.target)||(c.preventDefault(),c.stopPropagation(),c.repeat||i())};return document.addEventListener("keydown",p,!0),()=>document.removeEventListener("keydown",p,!0)},[e.open,e.onDismiss]),b("div",{id:e.id,class:e.veilClass,hidden:!e.open,onPointerDown:i=>{r.current=i.target===i.currentTarget},onClick:i=>{let p=r.current&&i.target===i.currentTarget;r.current=!1,p&&e.onDismiss?.()},children:b("div",{class:e.panelClass,role:e.role??"dialog","aria-modal":"true","aria-labelledby":e.titleId,"aria-describedby":e.describedBy,tabIndex:-1,ref:t,children:[e.kicker!=null&&e.kicker!==!1&&b("p",{class:e.kickerClass,id:e.kickerId,children:e.kicker}),e.close!=null&&e.close!==!1?b("div",{class:"kit-dialog-head",children:[b("h2",{id:e.titleId,class:e.titleClass,children:e.title}),e.close]}):b("h2",{id:e.titleId,class:e.titleClass,children:e.title}),e.children]})})}function ms({rows:e}){return e.length?b(Ye,{children:e.map(t=>b("li",{children:[b("span",{class:"cylon-hs-rank",children:["#",t.rank]}),b("strong",{class:"cylon-hs-initials",children:t.initials}),b("span",{class:"cylon-hs-date",children:t.date}),b("span",{class:"cylon-hs-score",children:[t.score," KOs"]})]},t.rank))}):b("li",{class:"cylon-hs-empty",children:"No scores yet"})}function wn({id:e,rows:t}){return b("ol",{class:"cylon-high-scores",id:e,children:b(ms,{rows:t})})}var Xt=[{board:"week",id:"cylon-tab-week",label:"This Week"},{board:"alltime",id:"cylon-tab-alltime",label:"All Time"}];function fs(e){let t=n=>o=>{if(o.key==="ArrowUp")e.onSpin(n,1);else if(o.key==="ArrowDown")e.onSpin(n,-1);else if(o.key==="ArrowLeft")e.onPick(n-1);else if(o.key==="ArrowRight"||o.key===" "||o.key==="Spacebar")n<2&&e.onPick(n+1);else if(o.key==="Enter")e.onSubmit();else return;o.preventDefault()};return b("div",{class:"cylon-initials",id:"cylon-initials",role:"group","aria-label":"Arcade initials",children:[0,1,2].map(n=>b("div",{class:"cylon-initial-slot",onWheel:o=>{o.preventDefault(),e.onSpin(n,o.deltaY<0?1:-1)},children:[b("button",{type:"button",class:"cylon-initial-spin","data-initial":n,"data-dir":"1","aria-label":`Scroll initial ${n+1} up`,onClick:()=>e.onSpin(n,1),children:"▲"}),b("button",{type:"button",class:n===e.active?"cylon-initial is-active":"cylon-initial",id:`cylon-initial-${n}`,"data-initial":n,"aria-label":`Initial ${n+1}, use up and down to change`,onClick:()=>e.onPick(n),onKeyDown:t(n),children:e.initials[n]}),b("button",{type:"button",class:"cylon-initial-spin","data-initial":n,"data-dir":"-1","aria-label":`Scroll initial ${n+1} down`,onClick:()=>e.onSpin(n,-1),children:"▼"})]},n))})}function hs(e){return b("div",{class:"cylon-hs-tabs",role:"tablist","aria-label":"High score board",children:Xt.map((t,n)=>b("button",{type:"button",class:"cylon-hs-tab",role:"tab",id:t.id,"data-board":t.board,"aria-selected":e.board===t.board?"true":"false",tabIndex:e.board===t.board?0:-1,"aria-controls":"cylon-gameover-panel",onClick:()=>e.onTab(t.board,!1),onKeyDown:o=>{let r=o.key==="ArrowRight"?1:o.key==="ArrowLeft"?-1:0,a=o.key==="Home"?0:o.key==="End"?Xt.length-1:-1,i=r?(n+r+Xt.length)%Xt.length:a;i<0||(o.preventDefault(),e.onTab(Xt[i].board,!0))},children:t.label},t.id))})}function ys(e){let t=e.board==="alltime"?"cylon-tab-alltime":"cylon-tab-week";return b(qt,{open:e.open,id:"cylon-gameover",veilClass:"cylon-gameover",panelClass:"cylon-gameover-panel",kicker:"Cylon Defense",kickerClass:"cylon-gameover-kicker",titleId:"cylon-gameover-title",titleClass:"cylon-gameover-title",title:"Game Over",focusId:e.mode==="entry"?"cylon-initial-0":"cylon-play-again",children:[b("p",{class:"cylon-gameover-reason",id:"cylon-gameover-reason",children:e.reason}),b("p",{class:"cylon-gameover-stats",children:[b("span",{children:[b("em",{id:"cylon-gameover-kos",children:e.kos})," KOs"]}),b("span",{children:[b("em",{id:"cylon-gameover-hits",children:e.hp})," HP"]})]}),b("div",{class:"cylon-gameover-entry",id:"cylon-gameover-entry",hidden:e.mode!=="entry",children:[b("p",{class:"cylon-gameover-entry-label",children:"Enter Your Initials"}),b(fs,{...e}),b("p",{class:"cylon-gameover-entry-hint",children:"↑↓ change letter · ←→ next · Enter submit"}),b("p",{class:"cylon-gameover-entry-error",id:"cylon-initials-error",role:"alert",hidden:!e.error,children:e.error}),b("div",{class:"cylon-gameover-actions",children:[b(nt,{class:"cylon-gameover-btn",id:"cylon-score-submit",disabled:e.submitting,onClick:e.onSubmit,children:"Submit Score"}),b(nt,{class:"cylon-gameover-btn is-ghost",id:"cylon-score-skip",onClick:e.onSkip,children:"Skip"})]})]}),b("div",{class:"cylon-gameover-board",id:"cylon-gameover-board",hidden:e.mode!=="board",children:[b("p",{class:"cylon-gameover-entry-label",children:"High Scores"}),b("p",{class:"cylon-gameover-alltime",id:"cylon-gameover-alltime",role:"status",hidden:e.allTimeRank===null,children:e.allTimeRank===null?"":`New all-time #${e.allTimeRank}!`}),b(hs,{...e}),b("div",{role:"tabpanel",id:"cylon-gameover-panel","aria-labelledby":t,tabIndex:0,children:b(wn,{id:"cylon-gameover-scores",rows:e.rows})}),b("p",{class:"cylon-gameover-entry-hint",id:"cylon-gameover-reset",children:e.resetText}),b(nt,{class:"cylon-gameover-btn",id:"cylon-play-again",onClick:e.onDismiss,children:e.quit?"Close":"Play Again"})]})]})}function Jr(e,t){lt(b(ys,{...t}),e)}var gs={hits:()=>"You took too much fire. The eye cooked you.",nuke:()=>"A nuke landed on you. Frak.",quit:e=>e?"Run ended. Record your score?":"Run ended."};function Qr(e){let{game:t,state:n,scores:o}=e,r=!1,a="",i=0,p=0,c="entry",m=["A","A","A"],s=0,k="",E=!1,g="week",x=null,f="Play often — scores reset every Sunday at midnight Central.";function S(){e.root&&Jr(e.root,{open:r,reason:a,kos:i,hp:p,mode:c,initials:m,active:s,error:k,submitting:E,board:g,allTimeRank:x,rows:un(g==="alltime"?o.alltime():o.board()),resetText:f,quit:t.run.endReason==="quit",onSpin:y,onPick:d,onSubmit:()=>{w()},onSkip:L,onTab:l,onDismiss:G})}let v=D=>{document.getElementById(D)?.focus({preventScroll:!0})};function T(){e.boardChanged(),S()}async function u(){let D=await o.load();D&&(f=e.weeklyResetText(D)),T()}function l(D,X){g=D,S(),X&&v(D==="alltime"?"cylon-tab-alltime":"cylon-tab-week")}function d(D){s=Math.max(0,Math.min(2,D)),S(),v(`cylon-initial-${s}`)}function y(D,X){let K=(m[D]??"A").charCodeAt(0)-65,me=String.fromCharCode(65+((K+X)%26+26)%26);m=m.map(($,U)=>U===D?me:$),k="",d(D)}function M(){c="board",S(),v("cylon-play-again"),u()}async function w(){if(E)return;let D=t.run.pendingScore?t.run.pendingScore.score:t.run.koScore,X=t.run.pendingScore?t.run.pendingScore.hits:t.run.hitsTaken;E=!0,x=null,S();let K=await o.submit(D,m.join(""),X);if(E=!1,K.saved){sn("score_submit"),k="",x=K.allTimeRank,t.run=n.clearPendingScore(t.run),M();return}K.problem==="invalid-initials"?k="Those initials aren't valid — choose another.":K.problem==="save-failed"&&(k="Could not save that score. Refresh and play again."),T()}function L(){t.run=n.clearPendingScore(t.run),M()}function H(){r=!1,c="entry",x=null,g="week",t.run=n.setEndReason(n.clearPendingScore(t.run),null),S()}function G(){if(t.run.endReason==="quit"){H(),t.run=n.clearGameOver(t.run),e.resetRunStats(),e.closed();return}e.setGameEnabled(!0)}async function z(D){if(!e.root)return;t.run=n.setEndReason(t.run,D),await u();let X=o.qualifies(t.run.koScore);X||(t.run=n.clearPendingScore(t.run)),a=gs[D](X),i=t.run.koScore,p=e.currentHp(),c=X?"entry":"board",m=["A","A","A"],s=0,k="",r=!0,S()}return{renderHighScores:T,fetchHighScores:u,hideGameOver:H,showGameOver:z,resetText:()=>f}}function Zr(e){return{parse(t){let n=JSON.parse(t);if(!e(n))throw new Error("unexpected shape");return n},stringify:t=>JSON.stringify(t)}}function ea(e,t,n,o){let r=new Set,a=null;function i(){if(a)return a.v;try{let p=o?.getItem(e);return p==null?t:n.parse(p)}catch{return t}}return{get:i,set(p){let c=!1;try{o&&(o.setItem(e,n.stringify(p)),c=!0)}catch{}a=c?null:{v:p};for(let m of r)m(p)},subscribe(p){return r.add(p),()=>r.delete(p)}}}var kn={setTimeout:(e,t)=>window.setTimeout(e,t),clearTimeout:e=>window.clearTimeout(e),setInterval:(e,t)=>window.setInterval(e,t),clearInterval:e=>window.clearInterval(e)};function _n(){try{return window.localStorage}catch{return null}}var ta="cylon-settings",lo={gameEnabled:!1,soundEnabled:!0,musicEnabled:!0,soundVolume:50,musicVolume:50,eyeEnabled:!0};function na(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function bs(e){let t=(o,r,a)=>b("label",{class:"cylon-setting",children:[b("input",{type:"checkbox","data-setting":o,checked:r,onChange:i=>e.onSetting(o,i.currentTarget.checked)}),b("span",{children:a})]}),n=(o,r,a,i)=>{let p=c=>e.onSetting(o,Number(c.currentTarget.value));return b("label",{class:"cylon-setting cylon-setting-slider",children:[b("span",{children:a}),b("input",{type:"range",min:"0",max:"100",step:"1",value:r,"data-setting":o,"aria-label":i,onInput:p,onChange:p})]})};return b(Ye,{children:[b("p",{class:"cylon-settings-title",children:"Options"}),t("soundEnabled",e.soundEnabled,"Sound Effects"),n("soundVolume",e.soundVolume,"SFX Volume","Sound effects volume"),t("musicEnabled",e.musicEnabled,"Music"),n("musicVolume",e.musicVolume,"Music Volume","Music volume"),t("eyeEnabled",e.eyeEnabled,"Eye Tracking"),b("p",{class:"cylon-settings-title cylon-settings-scores-title",children:"Weekly High Scores"}),b("p",{class:"cylon-settings-hint",id:"cylon-weekly-reset",children:e.resetText}),b(wn,{id:"cylon-high-scores",rows:e.rows}),b("p",{class:"cylon-settings-hint",children:"Start with 30 HP — occasional nukes and small missiles (2 HP each). Last 10s without a hit to heal 1. Cyan/pink missiles chase you; orange locks where you just aimed. More drones as KOs rise. Drag the reticle to dodge · tap drones · Grenade / Raptor in the bar."})]})}function oa(e,t){lt(b(bs,{...t}),e)}function ra(e){let{settingsRoot:t,gameToggleBtn:n,gameToggleLabel:o,cicEnterBtn:r,navBurger:a,navMenu:i,navGame:p,siteBrand:c,BRAND_CIVIL:m,BRAND_COMBAT:s,NAV_FADE_MS:k,reduceMotion:E,settingsPanel:g,fetchHighScores:x,setGameEnabled:f,setEyeTracking:S}=e,v={settingChanged:$=>e.settingChanged($)},T=lo,u=ea(ta,lo,Zr(na),_n()),l=Object.assign({},T,u.get());l.gameEnabled=!1,l.soundVolume=Math.max(0,Math.min(100,Number(l.soundVolume)||T.soundVolume)),l.musicVolume=Math.max(0,Math.min(100,Number(l.musicVolume)||T.musicVolume));let d=!1;l.soundVolume===85&&(l.soundVolume=50,d=!0),l.musicVolume===40&&(l.musicVolume=50,d=!0),d&&u.set(l);let y=0,M=null;function w(){u.set(l),L(),G()}function L(){g&&oa(g,{soundEnabled:l.soundEnabled,soundVolume:l.soundVolume,musicEnabled:l.musicEnabled,musicVolume:l.musicVolume,eyeEnabled:l.eyeEnabled,rows:e.boardRows(),resetText:e.resetText(),onSetting:H})}function H($,U){$==="soundVolume"||$==="musicVolume"?typeof U=="number"&&(l[$]=Math.max(0,Math.min(100,U||0))):typeof U=="boolean"&&(l[$]=U),w(),$==="eyeEnabled"&&!l.eyeEnabled&&S(!1),v.settingChanged($)}function G(){n&&(n.classList.toggle("is-on",l.gameEnabled),n.setAttribute("aria-pressed",l.gameEnabled?"true":"false"),o&&(o.textContent=l.gameEnabled?"Game On":"Game Off"))}function z($){if(document.body.classList.toggle("cylon-nav-combat",$),c&&(c.textContent=$?s:m),p&&(p.hidden=!$),t&&(t.hidden=!$),r&&(r.hidden=$),!$){let U=document.getElementById("cylon-settings-panel"),se=document.getElementById("cylon-settings-toggle");U&&!U.hidden&&(U.hidden=!0,se&&se.setAttribute("aria-expanded","false"))}}function D(){let $=!!l.gameEnabled,U=document.querySelector(".site-nav-inner"),se=document.body.classList.contains("cylon-nav-combat");if(E||!U||se===$){clearTimeout(M),M=null,U?.classList.remove("is-nav-fading"),z($);return}let Z=++y;clearTimeout(M),U.classList.add("is-nav-fading"),M=setTimeout(()=>{Z===y&&(z($),requestAnimationFrame(()=>{requestAnimationFrame(()=>{Z===y&&(U.classList.remove("is-nav-fading"),M=null)})}))},k)}function X(){if(!a||!i)return;let $=()=>{i.classList.remove("is-open"),a.setAttribute("aria-expanded","false")};a.addEventListener("click",U=>{U.stopPropagation();let se=!i.classList.contains("is-open");i.classList.toggle("is-open",se),a.setAttribute("aria-expanded",se?"true":"false")}),i.querySelectorAll("a.site-link").forEach(U=>{U.addEventListener("click",()=>$())}),document.addEventListener("click",U=>{i.classList.contains("is-open")&&(i.contains(U.target)||a.contains(U.target)||$())}),window.addEventListener("resize",()=>{window.matchMedia("(min-width: 820px)").matches&&$()})}function K(){n&&(G(),n.addEventListener("click",$=>{$.preventDefault(),$.stopPropagation(),f(!l.gameEnabled)}))}function me(){if(!t)return;L();let $=document.getElementById("cylon-settings-toggle"),U=g;!$||!U||($.addEventListener("click",se=>{se.stopPropagation();let Z=U.hasAttribute("hidden");Z?(x(),U.removeAttribute("hidden")):U.setAttribute("hidden",""),$.setAttribute("aria-expanded",Z?"true":"false")}),document.addEventListener("click",se=>{t.contains(se.target)||(U.setAttribute("hidden",""),$.setAttribute("aria-expanded","false"))}))}return{settings:l,saveSettings:w,syncGameToggleUi:G,syncNavChrome:D,renderSettings:L,bindSettings:me,bindGameToggle:K,bindNavMenu:X}}var vs=new Set([" ","Spacebar","PageUp","PageDown","Home","End","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"]),xs='button, a[href], summary, label, [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="tab"], [role="radio"], [role="menuitem"]',ws=3;function ks(e){return!!e.key&&vs.has(e.key)&&!e.ctrlKey&&!e.metaKey&&!e.altKey}function aa(e){let{doc:t,win:n}=e,o=null,r=!1,a=null,i=(T,u)=>!!(T&&T.closest&&T.closest(u));function p(){let T=[],u=(l,d)=>{if(l.matches(e.touchFree)||l.matches(e.panels))return;let y=n.getComputedStyle(l).overflowY;if((y==="auto"||y==="scroll"||y==="overlay")&&l.scrollHeight>l.clientHeight+1&&T.push(l),!(d>=ws))for(let M of Array.from(l.children))u(M,d+1)};return t.body&&u(t.body,0),T}function c(){if(o)return;let T=t.documentElement,u=t.body,l=Math.max(0,n.innerWidth-T.clientWidth);if(o={x:n.scrollX,y:n.scrollY,gutter:T.style.getPropertyValue("scrollbar-gutter"),gutterPriority:T.style.getPropertyPriority("scrollbar-gutter"),padding:u.style.getPropertyValue("padding-right"),paddingPriority:u.style.getPropertyPriority("padding-right"),wrappers:p().map(d=>({el:d,top:d.scrollTop,left:d.scrollLeft}))},l>0)if(e.gutterStable)T.style.setProperty("scrollbar-gutter","stable","important");else{let d=parseFloat(n.getComputedStyle(u).paddingRight)||0;u.style.setProperty("padding-right",`${d+l}px`,"important")}for(let d of o.wrappers)d.el.classList.add("cylon-scroll-held");T.classList.add("cylon-scroll-held")}function m(){if(!o)return;let T=t.documentElement,u=t.body;T.classList.remove("cylon-scroll-held");for(let l of o.wrappers)l.el.classList.remove("cylon-scroll-held");o.gutter?T.style.setProperty("scrollbar-gutter",o.gutter,o.gutterPriority):T.style.removeProperty("scrollbar-gutter"),o.padding?u.style.setProperty("padding-right",o.padding,o.paddingPriority):u.style.removeProperty("padding-right"),o=null,s()}function s(){r=!1,a&&clearTimeout(a),a=null}function k(T,u){o&&(o.y=T,o.x=0,r=u,a&&clearTimeout(a),a=u?setTimeout(s,1500):null),n.scrollTo({top:T,left:0,behavior:u?"smooth":"instant"})}function E(T){if(!o||r)return;let u=T.target;if(u===t||u===t.documentElement||u===t.body){(n.scrollX!==o.x||n.scrollY!==o.y)&&n.scrollTo({top:o.y,left:o.x,behavior:"instant"});return}let l=o.wrappers.find(d=>d.el===u);l&&(l.el.scrollTop!==l.top||l.el.scrollLeft!==l.left)&&(l.el.scrollTop=l.top,l.el.scrollLeft=l.left)}function g(T){!e.live()||i(T.target,e.panels)||T.preventDefault()}function x(T){!e.live()||i(T.target,e.touchFree)||T.preventDefault()}function f(T){if(T.defaultPrevented||!e.live()||!ks(T))return;let u=T.target;Ot(u)||i(u,e.panels)||i(u,"input, select, textarea")||(T.key===" "||T.key==="Spacebar")&&i(u,xs)||T.preventDefault()}let S=!1;function v(){S||(S=!0,t.addEventListener("wheel",g,{passive:!1}),t.addEventListener("touchmove",x,{passive:!1}),n.addEventListener("keydown",f),t.addEventListener("scroll",E,{capture:!0,passive:!0}),n.addEventListener("scrollend",s,{passive:!0}))}return{hold:c,release:m,held:()=>o!==null,moveTo:k,bind:v}}function ia(){return b(Ye,{children:[b("li",{children:["Over time, expect occasional ",b("strong",{children:"nukes"})," and smaller ",b("strong",{children:"missiles"})," (each missile costs ",b("strong",{children:"2 HP"}),")."]}),b("li",{children:[b("strong",{children:"Cyan/pink"})," missiles chase you; ",b("strong",{children:"orange"})," ones aim where you just were."]}),b("li",{children:["Go ",b("strong",{children:"10 seconds"})," without taking a hit to ",b("strong",{children:"heal 1 HP"}),"."]}),b("li",{children:["More ",b("strong",{children:"drones"})," appear as your KO count rises."]})]})}function _s(){return b("div",{class:"cylon-help-body",id:"cylon-help-desktop",children:b("ol",{children:[b("li",{children:["Flip ",b("strong",{children:"Game On"})," in the top bar."]}),b("li",{children:[b("strong",{children:"Move the mouse"})," to dodge bolts and nukes — the eye and drones track your cursor."]}),b("li",{children:[b("strong",{children:"Click drones"})," to KO them and score."]}),b("li",{children:[b("strong",{children:"Grenade"})," (",b(Nt,{label:"G"}),"): arm, then click where you want the blast; ",b(Nt,{label:"Q"})," puts it away."]}),b("li",{children:[b("strong",{children:"Raptor"})," (",b(Nt,{label:"R"}),"): orbital strike that clears the field and dazes the eye."]}),b(ia,{}),b("li",{children:["You start with ",b("strong",{children:"30 HP"})," — hit 0, or take a nuke, then enter 3 initials for the board."]})]})})}function Ss(){return b("div",{class:"cylon-help-body",id:"cylon-help-mobile",children:b("ol",{children:[b("li",{children:["Flip ",b("strong",{children:"Game On"})," in the top bar."]}),b("li",{children:[b("strong",{children:"Drag the green reticle"})," with one finger to dodge. Drones and nukes aim at that reticle."]}),b("li",{children:["With your ",b("strong",{children:"other finger"}),", tap drones to KO them, or tap Grenade / Raptor / menu controls."]}),b("li",{children:[b("strong",{children:"Grenade"}),": tap the button to arm, then tap the page to throw."]}),b("li",{children:[b("strong",{children:"Raptor"}),": tap for a strike that clears drones and dazes the eye."]}),b(ia,{}),b("li",{children:["You start with ",b("strong",{children:"30 HP"})," — hit 0, or take a nuke, then scroll initials ▲▼ for the high-score board."]})]})})}function Es(e){return b(qt,{open:e.open,id:"cylon-help",veilClass:"cylon-help",panelClass:"cylon-help-panel",kicker:"Cylon Defense",kickerClass:"cylon-help-kicker",titleId:"cylon-help-title",titleClass:"cylon-help-title",title:"How to Play",focusId:"cylon-help-close",onDismiss:e.onClose,children:[b("p",{class:"cylon-help-platform",id:"cylon-help-platform",children:e.touch?"Touch Controls":"Desktop Controls"}),e.touch?b(Ss,{}):b(_s,{}),b(nt,{class:"cylon-gameover-btn",id:"cylon-help-close",onClick:e.onClose,children:"Got It"})]})}function sa(e,t){lt(b(Es,{...t}),e)}var Wt={};Hn(Wt,{beginRun:()=>fo,clearGameOver:()=>xo,clearPendingScore:()=>vo,createRun:()=>po,createSchedule:()=>co,endRun:()=>bo,healOne:()=>go,msUntil:()=>Kt,pending:()=>Ts,recordKill:()=>As,resetScore:()=>mo,setEndReason:()=>Ms,skewForPause:()=>uo,stopClock:()=>ho,takeHits:()=>yo});function co(){return{missileDueAt:0,nukeDueAt:0,healDueAt:0,grenadeReadyAt:0,raptorReadyAt:0,eyeDisorientedUntil:0}}function uo(e,t,n){if(n<=0)return e;let o=r=>r>t?r+n:r;return{missileDueAt:o(e.missileDueAt),nukeDueAt:o(e.nukeDueAt),healDueAt:o(e.healDueAt),grenadeReadyAt:o(e.grenadeReadyAt),raptorReadyAt:o(e.raptorReadyAt),eyeDisorientedUntil:o(e.eyeDisorientedUntil)}}function Kt(e,t){return Math.max(0,e-t)}function Ts(e,t){return t<e}function po(){return{koScore:0,hitCount:0,hitsTaken:0,runStartedAt:0,gameOver:!1,endReason:null,pendingScore:null}}function mo(e){return{...e,koScore:0,hitCount:0,hitsTaken:0,gameOver:!1,pendingScore:null}}function As(e){return{...e,koScore:e.koScore+1}}function fo(e,t){return{...e,runStartedAt:t}}function ho(e){return e.runStartedAt===0?e:{...e,runStartedAt:0}}function yo(e,t,n,o=!1){let r=Math.max(0,Number(t)||0),a={...e,hitCount:e.hitCount+r,hitsTaken:e.hitsTaken+r},i=o?"nuke":a.hitCount>=n?"hits":null;return{run:a,ends:i}}function go(e){return e.hitCount>0?{...e,hitCount:e.hitCount-1}:e}function bo(e,t){return{...e,gameOver:!0,runStartedAt:0,pendingScore:{score:e.koScore,hits:e.hitsTaken,reason:t}}}function Ms(e,t){return{...e,endReason:t}}function vo(e){return e.pendingScore===null?e:{...e,pendingScore:null}}function xo(e){return e.gameOver?{...e,gameOver:!1}:e}var la="Swipe the app away to close it",Cs=150,Ls=["fullscreen","standalone","minimal-ui"];function wo(e){return Ls.some(t=>e.matches(`(display-mode: ${t})`))||e.iosStandalone()}async function ca(e){let t=wo(e);if(t){try{e.closeWindow()}catch{}if(await new Promise(o=>{e.timers.setTimeout(()=>o(e.closed()),Cs)}))return"closed"}if(e.fullscreenElement())try{await e.exitFullscreen()}catch{}return t?"title-with-hint":"title"}function Rs(e,t){return{...e,fullscreenSupported:n=>{let o=n;return(typeof o.requestFullscreen=="function"||typeof o.webkitRequestFullscreen=="function")&&(typeof t.exitFullscreen=="function"||typeof t.webkitExitFullscreen=="function")},fullscreenElement:()=>e.fullscreenElement()??t.webkitFullscreenElement??null,requestFullscreen:n=>{let o=n;return typeof o.requestFullscreen=="function"?e.requestFullscreen(n):typeof o.webkitRequestFullscreen=="function"?Promise.resolve(o.webkitRequestFullscreen()):Promise.reject(new Error("no fullscreen"))},exitFullscreen:()=>typeof t.exitFullscreen=="function"?e.exitFullscreen():typeof t.webkitExitFullscreen=="function"?Promise.resolve(t.webkitExitFullscreen()):Promise.resolve()}}function Sn(){return Rs({matches:e=>typeof window.matchMedia=="function"&&window.matchMedia(e).matches,iosStandalone:()=>navigator.standalone===!0,fullscreenSupported:e=>typeof e.requestFullscreen=="function"&&typeof document.exitFullscreen=="function",fullscreenElement:()=>document.fullscreenElement,requestFullscreen:e=>typeof e.requestFullscreen=="function"?e.requestFullscreen():Promise.reject(new Error("no fullscreen")),exitFullscreen:()=>typeof document.exitFullscreen=="function"?document.exitFullscreen():Promise.resolve(),closeWindow:()=>window.close(),closed:()=>window.closed,timers:kn},document)}function da(e,t){let n=()=>{e.doc.visibilityState!=="hidden"&&t.show()};e.doc.addEventListener("visibilitychange",()=>{e.doc.visibilityState==="hidden"?t.hide():n()}),e.doc.addEventListener("freeze",()=>t.hide()),e.doc.addEventListener("resume",n),e.win.addEventListener("pagehide",o=>{t.hide(),o?.persisted===!1&&t.close?.()}),e.win.addEventListener("pageshow",n),e.doc.visibilityState==="hidden"&&t.hide()}function ko(e){let t=e.size??18;return b("svg",{viewBox:"0 0 24 24",width:t,height:t,fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false",class:e.class,children:[b("path",{d:"M12 15V3M7 8l5-5 5 5"}),b("path",{d:"M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"})]})}var ua=!0,pa="Tap Share, then Add to Home Screen",Ps=2500,_o="__installPrompt";function ma(e){return new URLSearchParams(e).has("install")}function So(e){let t=new URL(e);return t.search=t.search?`${t.search}&install`:"?install",t.href}function fa(e){try{return new URL(e).searchParams.get("v")||null}catch{return null}}function ha(e,t){if(!t)return e;let n=new URL(e);return n.searchParams.set("v",t),n.href}var Is=e=>e?.name==="AbortError";function Ds(e,t,n){let o="idle",r=null,a=0;function i(p){r!==null&&(e.timers.clearTimeout(r),r=null),o=p,p==="copied"&&(r=e.timers.setTimeout(()=>{r=null,o="idle",n()},Ps)),n()}return{state:()=>o,async press(){let p=++a;if(e.share)try{await e.share({title:t.title,url:t.shareUrl});return}catch(c){if(Is(c)||p!==a)return}if(e.copy)try{await e.copy(t.shareUrl),p===a&&i("copied");return}catch{}p===a&&i("field")},close(){a++,o!=="idle"&&i("idle")}}}function ya(e,t,n){let o=e.framed(),r=Ds(e,t,()=>g()),a=e.platform(),i=a==="ios",p=a==="chromium"&&!t.promptsHere&&t.installPage!==null,c=e.installed(),m=null,s=!1,k=()=>!o&&!c&&(i||p||m!==null),E=()=>({off:o,install:k(),highlight:t.asked&&k(),steps:s,share:r.state()}),g=()=>n(E());return!o&&!c&&(e.onPrompt(x=>{m=x,g()}),e.onInstalled(()=>{t.onEvent?.("install"),c=!0,m=null,s=!1,g()}),t.asked&&i&&(t.installPage===null?s=!0:e.navigate(So(t.installPage),!0))),{view:E,async pressInstall(){if(k()){if(i){t.installPage===null?(s=!0,g()):e.navigate(So(t.installPage),!1);return}if(m){let x=m;m=null,g();try{await x.prompt()}catch{}return}t.installPage!==null&&e.navigate(So(t.installPage),!1)}},closeSteps(){s&&(s=!1,g())},async pressShare(){o||(t.onEvent?.("share"),await r.press())},closeShare:r.close}}function Bs(e,t,n,o=[]){return/iPhone|iPad|iPod/.test(e)||t==="MacIntel"&&n>1?"ios":o.some(r=>r.brand==="Chromium")?"chromium":"other"}function Fs(){return{share:typeof navigator.share=="function"?e=>navigator.share(e):null,copy:typeof navigator.clipboard?.writeText=="function"?e=>navigator.clipboard.writeText(e):null,timers:kn}}function ga(){let e=window;return{onPrompt:t=>{let n=e[_o];e[_o]=null,n&&t(n),window.addEventListener("beforeinstallprompt",o=>{o.preventDefault(),e[_o]=null,t(o)})},onInstalled:t=>window.addEventListener("appinstalled",()=>t()),installed:()=>wo(Sn()),platform:()=>Bs(navigator.userAgent,navigator.platform,navigator.maxTouchPoints,navigator.userAgentData?.brands),framed:()=>window.self!==window.top,...Fs(),navigate:(t,n)=>n?location.replace(t):location.assign(t)}}var Hs={viewBox:"0 0 24 24",width:18,height:18,"aria-hidden":"true",focusable:"false",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round",class:"kit-install-icon"};function Os(){return b("svg",{...Hs,children:[b("path",{d:"M12 3v12M7 10l5 5 5-5"}),b("path",{d:"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"})]})}function Ns(e){let t=e.view,n=At(null);return Tt(()=>{t.share==="field"&&(n.current?.focus(),n.current?.select?.())},[t.share]),t.off?null:b("span",{class:"kit-install",children:[t.install&&b(nt,{id:"install-btn",class:t.highlight?"kit-install-btn kit-install-asked":"kit-install-btn",title:"Install this game as an app",onClick:e.onInstall,children:[b(Os,{}),b("span",{class:"kit-install-txt",children:"Install"})]}),b(nt,{id:"share-btn",class:"kit-install-btn",title:"Share a link to this game",onClick:e.onShare,children:[b(ko,{class:"kit-install-icon"}),b("span",{class:"kit-install-txt",children:"Share"})]}),b("span",{id:"share-status",class:"kit-install-status",role:"status",children:t.share==="copied"?"Link copied":null}),t.share==="field"&&b("input",{id:"share-url",class:"kit-install-url",type:"text",readOnly:!0,value:e.shareUrl,"aria-label":"Link to this game",ref:n,onKeyDown:o=>{Ht(o)&&(o.preventDefault(),o.repeat||e.onCloseShare())}}),b(qt,{open:t.steps,id:"install-steps",veilClass:"kit-install-veil",panelClass:"kit-install-panel",titleId:"install-steps-title",title:"Add to Home Screen",focusId:"install-steps-done",onDismiss:e.onCloseSteps,children:[b("p",{id:"install-steps-text",children:[b(ko,{size:20,class:"kit-install-glyph"}),pa,"."]}),b(nt,{id:"install-steps-done",class:"kit-install-btn",onClick:e.onCloseSteps,children:"Done"})]})]})}var qs=`
.kit-install { position: relative; display: inline-flex; align-items: center; gap: 0.5rem; }
.kit-install-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; font: 600 0.9rem/1.1 system-ui, sans-serif; padding: 0.3rem 0.75rem; border: 1px solid var(--kit-install-accent, #f0b429); border-radius: 6px; background: transparent; color: var(--kit-install-accent, #f0b429); cursor: pointer; }
.kit-install-btn:hover, .kit-install-btn:focus-visible { background: color-mix(in srgb, var(--kit-install-accent, #f0b429) 18%, transparent); }
.kit-install-btn:focus-visible { outline: 2px solid var(--kit-install-accent, #f0b429); outline-offset: 2px; }
.kit-install-asked { background: var(--kit-install-accent, #f0b429); color: #000; animation: kit-install-pulse 1.2s ease-in-out 3; }
@keyframes kit-install-pulse { 50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--kit-install-accent, #f0b429) 40%, transparent); } }
@media (prefers-reduced-motion: reduce) { .kit-install-asked { animation: none; } }
.kit-install-status { color: var(--kit-install-accent, #f0b429); white-space: nowrap; }
/* Shown, it floats under the buttons at every width, so it never widens the bar or pushes it onto a second line. */
.kit-install-status:not(:empty) { position: absolute; top: calc(100% + 0.4rem); right: 0; z-index: 3000; padding: 0.3rem 0.6rem; border-radius: 6px; background: #11141b; }
/* Always in the page, so a screen reader announces the text when it arrives; empty, it takes no room. */
.kit-install-status:empty { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
/* Under the buttons, out of the bar's layout, and never wider than the screen. */
.kit-install-url { position: absolute; top: calc(100% + 0.4rem); right: 0; z-index: 3000; width: min(22rem, calc(100vw - 1.5rem)); padding: 0.25rem 0.4rem; font: 500 0.85rem/1.2 ui-monospace, monospace; }
.kit-install-veil { position: fixed; inset: 0; z-index: 3000; display: grid; place-items: center; padding: 1rem; background: rgba(0, 0, 0, 0.6); }
.kit-install-veil[hidden] { display: none; }
.kit-install-panel { max-width: 22rem; padding: 1.25rem; border-radius: 12px; background: #11141b; color: #eef1f6; font: 500 1rem/1.45 system-ui, sans-serif; }
.kit-install-panel h2 { margin: 0 0 0.5rem; font-size: 1.15rem; }
/* A phone has no room for the words: each button is an icon square, its word kept for screen readers. A tap lands 2px beyond the square too. */
@media (max-width: 600px) {
  .kit-install-btn { position: relative; width: 2.5rem; height: 2.5rem; padding: 0; flex: none; }
  .kit-install-btn::after { content: ''; position: absolute; inset: -2px; }
  .kit-install-txt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
}
.kit-install-glyph { vertical-align: -0.3em; margin-right: 0.4rem; }
.kit-install-corner { position: fixed; top: 0.5rem; right: 0.5rem; z-index: 2900; }
`;function Gs(){if(document.getElementById("kit-install-css"))return;let e=document.createElement("style");e.id="kit-install-css",e.textContent=qs,document.head.prepend(e)}function ba(e,t,n){Gs();let o=a=>{},r=ya(n,t,a=>o(a));return o=a=>lt(b(Ns,{view:a,shareUrl:t.shareUrl,onInstall:()=>{r.pressInstall()},onShare:()=>{r.pressShare()},onCloseSteps:r.closeSteps,onCloseShare:r.closeShare}),e),o(r.view()),r}var zs=["#site-brand",".navbar-brand",".wp-block-site-title",".site-title"],Vs=[" – "," — "," | "," · "," - "];var $s="The CIC";function Yt(e){return(e??"").replace(/\s+/g," ").trim()}function Us(e){let t=-1,n=0;for(let o of Vs){let r=e.lastIndexOf(o);r>t&&(t=r,n=o.length)}return t<0?"":Yt(e.slice(t+n))}function Xs(e){let t=Array.from(e);return t.length<=40?e:`${t.slice(0,39).join("").trimEnd()}…`}function En(e,t,n){let o=a=>Yt(e.querySelector(a)?.getAttribute("content")),r=[()=>Yt(n?.getAttribute("data-site-name")),()=>{for(let a of zs){let i=Yt(e.querySelector(a)?.textContent);if(i)return i}return""},()=>o('meta[property="og:site_name"]'),()=>o('meta[name="application-name"]'),()=>Us(e.title),()=>Yt(t).replace(/^www\./i,"")];for(let a of r){let i=a();if(i)return Xs(i)}return $s}var ka={},xa=e=>new URL(e,ka.url).href,va=!0;function Ks(){let e=document.getElementById("cylon-install-root");if(!e||new URLSearchParams(location.search).get("game")!=="cylon")return;document.querySelector('link[rel="manifest"]')?.setAttribute("href","games/cylon/manifest.webmanifest");let t=location.pathname.endsWith("/index.html");ba(e,{title:"The CIC",shareUrl:ha(new URL("play/cylon/",location.href).href,fa(ka.url)),installPage:t||!va?null:new URL("index.html?game=cylon",location.href).href,promptsHere:va&&(t||ua),asked:ma(location.search)},ga())}async function Ws(e){let t=document.getElementById("game-root");if(!t)return!1;if(t.dataset.mounted==="1"&&document.getElementById("cylon-eye"))return!0;try{if(e!==void 0)t.innerHTML=e;else{let n=await fetch(xa("../mount.html?v=769e886323"),{cache:"no-store"});if(!n.ok)throw new Error(`mount ${n.status}`);t.innerHTML=await n.text()}return t.dataset.mounted="1",t.dataset.game="cylon",!0}catch(n){return console.error("Cylon mount failed",n),!1}}async function wa(e={}){let t=typeof e.onTheme=="function"?e.onTheme:()=>{};await Ws(e.mountHtml);let n=document.getElementById("cylon-eye"),o=document.getElementById("cylon-glare"),r=document.getElementById("cylon-battlefield"),a=document.getElementById("cylon-ambush-under"),i=document.getElementById("cylon-nuke"),p=document.getElementById("cylon-nuke-missile"),c=document.getElementById("cylon-small-missile"),m=document.getElementById("cylon-score-value"),s=document.getElementById("cylon-hits-value"),k=document.getElementById("cylon-settings"),E=document.getElementById("cylon-raptor"),g=document.getElementById("cylon-raptor-impacts"),x=document.getElementById("cylon-raptor-btn"),f=document.getElementById("cylon-raptor-cd"),S=document.getElementById("cylon-grenade-btn"),v=document.getElementById("cylon-grenade-cd"),T=document.getElementById("cylon-game-toggle"),u=document.getElementById("cylon-game-toggle-label"),l=document.getElementById("cic-enter-btn"),d=document.getElementById("cylon-settings-panel"),y=document.getElementById("cylon-gameover-root"),M=document.getElementById("cylon-exit-hint"),w=null,L=document.getElementById("cylon-reticle"),H=document.getElementById("site-nav-burger"),G=document.getElementById("site-nav-menu"),z=document.getElementById("site-nav-power"),D=document.getElementById("site-nav-game"),X=document.getElementById("site-brand"),K=document.getElementById("cylon-intro-title"),me=e.siteName||En(document,location.hostname),$="The CIC",U=880,se=document.getElementById("cylon-help-btn"),Z=document.getElementById("cylon-help-root"),Te=!1;if(!n||!r)return;let fe=window.matchMedia("(prefers-reduced-motion: reduce)").matches,Ve=aa({doc:document,win:window,gutterStable:CSS.supports("scrollbar-gutter","stable"),panels:".cylon-help-panel, .cylon-gameover, .cylon-settings-panel",touchFree:".site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel",live:()=>document.body.classList.contains("cylon-game-live")}),$e=window.matchMedia("(pointer: coarse)").matches,Fe=$e?10:30;if(fe)return;let je=e.localScores?Sr(_n()):_r(e.scoresApi||xa("../scores.php"),{fetch:(R,F)=>fetch(R,F)}),C={run:po(),schedule:co(),paused:!1,pauseStartedAt:0,nukeInFlight:!1,reticlePointerId:null,draggingReticle:!1,idleTimer:null},He={clientX:window.innerWidth/2,clientY:window.innerHeight/3,pageX:window.innerWidth/2,pageY:window.innerHeight/3,t:0},ke=null,ot=null,gt={clientX:0,clientY:0,t:0},ce=null,Ae=null,Ue=null,rt=2e3,Je={w:44,h:56},Xe=28,Ze=52,Ct=44,{MAX_HITS:bt}=ln,ct=1e4,_=64,P=520,B=28,N=2800,O=640,W=22,V=2200,re=72,de=.22,ve=.32,xe=.62,he=.5,Me=.72,ee=3e4,Y=st.medium.radius,_e=Math.round(2850*.45),{renderHighScores:et,fetchHighScores:Pe,hideGameOver:Oe,showGameOver:vt,resetText:at}=Qr({game:C,state:Wt,scores:je,weeklyResetText:kr,currentHp:Bo,setGameEnabled:Fn,resetRunStats:Oo,root:y,boardChanged:()=>zt(),closed:()=>{No()}}),{settings:oe,saveSettings:ze,syncGameToggleUi:Ne,syncNavChrome:Lt,renderSettings:zt,bindSettings:tt,bindGameToggle:Zt,bindNavMenu:Rn}=ra({settingsRoot:k,gameToggleBtn:T,gameToggleLabel:u,cicEnterBtn:l,navBurger:H,navMenu:G,navGame:D,siteBrand:X,BRAND_CIVIL:me,BRAND_COMBAT:$,NAV_FADE_MS:_e,reduceMotion:fe,settingsPanel:d,boardRows:()=>un(je.board()),resetText:at,fetchHighScores:Pe,setGameEnabled:Fn,setEyeTracking:R=>ge(R),settingChanged:R=>ye.settingChanged(R)});function Rt(){return window.scrollX||window.pageXOffset||0}function Pt(){return window.scrollY||window.pageYOffset||0}function xt(){r&&(r.style.width="",r.style.height="")}function en(){return oe.gameEnabled&&!C.paused}let ye=lr({settings:()=>oe,sessionActive:en,volumeToGain:Vn}),dt=yr({titleEl:K,nukeEl:p,brandEl:X,body:document.body,title:$,reduceMotion:fe,navFadeMs:_e,settleMs:U,speed:P*.85,arriveRadius:B,maxFlightMs:N,random:Math.random,enabled:()=>oe.gameEnabled,paused:()=>C.paused,startRun:()=>je.startRun(),launched:()=>{ye.prime(),ye.sfx("introLaunch")},setNukeInFlight:R=>{C.nukeInFlight=R},detonate:(R,F)=>Na(R,F,{dealDamage:!1,shake:!1}),beginCombat:ri});function Ce(){return en()&&!C.run.gameOver&&!dt.playing()}let wt=fr({field:r,isLive:Ce,paused:()=>C.paused,viewport:()=>({width:window.innerWidth,height:window.innerHeight}),create:R=>document.createElement(R),now:()=>Date.now(),setTimer:(R,F)=>setTimeout(R,F),clearTimer:R=>clearTimeout(R)}),It=e.glyphLayer??null,Dt=hr({doc:document,glyphs:It,viewport:()=>({width:window.innerWidth,height:window.innerHeight}),random:Math.random,reduceMotion:fe,setTimer:(R,F)=>setTimeout(R,F),clearTimer:R=>clearTimeout(R)}),h=wt.punch,A=ur({now:()=>Date.now(),setTimer:(R,F)=>setTimeout(R,F),clearTimer:R=>clearTimeout(R),isLive:Ce,readyAt:R=>R==="grenade"?C.schedule.grenadeReadyAt:C.schedule.raptorReadyAt,setReadyAt:(R,F)=>{R==="grenade"?C.schedule.grenadeReadyAt=F:C.schedule.raptorReadyAt=F},sfx:R=>{ye.prime(),ye.sfx(R)},changed:kt,grenadeBlast:ti,raptorAvailable:()=>!!E,raptorLaunch:()=>{le(ee),E?.classList.add("is-inbound")},raptorStrike:oi,raptorClear:ei}),{rearrangeLandscape:I,rearrangeLandscapePage:q,disruptGlyphs:Q,clearLandscapeVars:te,randRange:pe}=gr({reduceMotion:fe,glyphs:It,scrollX:Rt,scrollY:Pt}),{isEyeDisoriented:j,setEyeTracking:ge,disorientEye:le,clearEyeDisorient:ne,eyeClientCenter:be,updateEye:Se}=br({eye:n,glare:o,game:C,settings:oe,mouse:He,state:Wt,isGameLive:Ce,EYE_DISORIENT_MS:ee}),{syncMousePageFromClient:Ee,paintReticle:Ie,syncReticleVisibility:ue,resetReticleToCenter:Le,onPointerMove:Be,bindReticle:Ke}=vr({reticleEl:L,mouse:He,lastAim:gt,game:C,settings:oe,coarsePointer:$e,IDLE_MS:rt,isGameLive:Ce,isEyeDisoriented:j,setEyeTracking:ge,audio:ye,abilities:A,scrollX:Rt,scrollY:Pt}),{allBots:qe,knockOutBot:Qe,clearAllBots:We,wipeAllBotsWithScore:Bt,herdBotsIntoView:Ba,scheduleAmbush:Fa,bindPlayerMissShots:Ha,canLaunchMissile:tn,launchSmallMissile:Mo,clearActiveMissiles:Oa,launchNuke:Co,detonateNukeAt:Na}=xr({game:C,settings:oe,mouse:He,lastAim:gt,state:Wt,rules:ln,playfield:Un,field:r,ambushUnder:a,missileEl:c,nukeEl:i,nukeMissileEl:p,scoreEl:m,audio:ye,intro:dt,abilities:A,holes:wt,debris:Dt,punchHole:h,HOLE_PRESETS:st,isGameLive:Ce,isEyeDisoriented:j,eyeClientCenter:be,syncMousePageFromClient:Ee,rearrangeLandscape:I,rearrangeLandscapePage:q,disruptGlyphs:Q,randRange:pe,registerHit:Ja,resizeBattlefield:xt,scrollX:Rt,scrollY:Pt,BOT_HARD_CAP:Fe,BOT_SIZE:Je,LINK_PAD:Xe,HIT_RADIUS:Ze,BOLT_HIT_RADIUS:Ct,NUKE_DIRECT_HIT_RADIUS:_,NUKE_SPEED:P,NUKE_ARRIVE_RADIUS:B,NUKE_MAX_FLIGHT_MS:N,MISSILE_SPEED:O,MISSILE_ARRIVE:W,MISSILE_MAX_FLIGHT_MS:V,MISSILE_BLAST_RADIUS:re,SMALL_WEAPON_SCALE:de,MISSILE_WEAPON_SCALE:ve});function Lo(){Dt.scatter(),document.body.classList.add("cylon-world-ended"),document.body.classList.remove("cylon-glyphs-blown"),document.body.classList.add("cylon-glyphs-blowing"),requestAnimationFrame(()=>{requestAnimationFrame(()=>{oe.gameEnabled&&document.body.classList.add("cylon-glyphs-blown"),setTimeout(()=>{document.body.classList.remove("cylon-glyphs-blowing")},3e3)})})}function Pn(R={}){let F=oe.gameEnabled,J=!!R.deferScatter;document.body.classList.toggle("cylon-game-live",F),F?Ve.hold():Ve.release(),t(F),Lt(),F?J||Lo():(document.body.classList.remove("cylon-glyphs-blown"),document.body.classList.remove("cylon-glyphs-blowing"),document.body.classList.remove("cylon-world-ended"),Dt.cancelReshuffleSettle(),te(),setTimeout(()=>{oe.gameEnabled||Dt.restore()},2900))}function pl(R,F,J){return St(R,F,J)}function qa(){return On(C.run.koScore,C.run.runStartedAt,Date.now())}function Ga(){return Nn(C.run.koScore,Math.random)}function za(){return qn(qa(),Math.random)}function nn(){clearTimeout(ce??void 0),clearTimeout(Ae??void 0),ce=null,Ae=null,C.schedule.missileDueAt=0,C.schedule.nukeDueAt=0,Oa()}function In(R=!1){if(clearTimeout(ce??void 0),!Ce())return;let F=R?4e3+Math.random()*3e3:Ga();C.schedule.missileDueAt=Date.now()+F,ce=setTimeout(()=>{ce=null,!(!Ce()||C.paused)&&(!j()&&(tn(!1)||tn(!0))&&Mo(),In(!1))},F)}function Dn(R=!1){if(clearTimeout(Ae??void 0),!Ce())return;let F=R?12e3+Math.random()*8e3:za();C.schedule.nukeDueAt=Date.now()+F,Ae=setTimeout(()=>{Ae=null,!(!Ce()||C.paused)&&(!j()&&!C.nukeInFlight&&Co(),Dn(!1))},F)}function Va(){nn(),In(!0),Dn(!0)}function $a(R){if(R<=0)return;let F=C.schedule;C.schedule=uo(F,C.pauseStartedAt,R),C.schedule.missileDueAt!==F.missileDueAt&&(clearTimeout(ce??void 0),ce=setTimeout(()=>{ce=null,!(!Ce()||C.paused)&&(!j()&&(tn(!1)||tn(!0))&&Mo(),In(!1))},Kt(C.schedule.missileDueAt,Date.now()))),C.schedule.nukeDueAt!==F.nukeDueAt&&(clearTimeout(Ae??void 0),Ae=setTimeout(()=>{Ae=null,!(!Ce()||C.paused)&&(!j()&&!C.nukeInFlight&&Co(),Dn(!1))},Kt(C.schedule.nukeDueAt,Date.now()))),C.schedule.healDueAt!==F.healDueAt&&(clearTimeout(ke??void 0),ke=setTimeout(()=>{ke=null,Ro()},Kt(C.schedule.healDueAt,Date.now()))),wt.resume(C.pauseStartedAt,R)}function Vt(){clearTimeout(ke??void 0),ke=null,C.schedule.healDueAt=0}function Ro(){ke=null,C.schedule.healDueAt=0,!(!Ce()||C.run.hitCount<=0)&&(C.run=go(C.run),an(),ye.prime(),ye.sfx("heal"),s&&(s.classList.add("is-heal"),setTimeout(()=>s.classList.remove("is-heal"),320)),Po())}function Po(){Vt(),!(!oe.gameEnabled||C.run.gameOver||C.paused||C.run.hitCount<=0)&&(C.schedule.healDueAt=Date.now()+ct,ke=setTimeout(()=>{ke=null,Ro()},ct))}function Ua(){Ee(),clearTimeout(Ue??void 0),Ue=setTimeout(Ba,180)}function on(){Z&&sa(Z,{open:Te,touch:$e,onClose:Wa})}function Io(){C.paused||(C.paused=!0,C.pauseStartedAt=Date.now(),clearTimeout(C.idleTimer??void 0),wt.pause(),clearTimeout(ce??void 0),clearTimeout(Ae??void 0),clearTimeout(ke??void 0),ce=null,Ae=null,ke=null,ge(!1),ye.syncMusic(),kt())}function Do(){if(!C.paused)return;let R=Date.now()-C.pauseStartedAt;$a(R),C.paused=!1,C.pauseStartedAt=0,ye.syncMusic(),kt(),ue()}let rn=!1;function Xa(){da({doc:document,win:window},{hide(){oe.gameEnabled&&!C.paused&&(Io(),rn=!0),ye.pageHide()},show(){ye.pageShow(),rn&&!Te&&Do(),rn=!1},close:ye.pageClose})}function Ka(){Z&&(Io(),rn=!1,se?.focus({preventScroll:!0}),Te=!0,on())}function Wa(){Te&&(Te=!1,on(),Do())}function Ya(){on(),se&&se.addEventListener("click",R=>{R.preventDefault(),R.stopPropagation(),Ka()})}function Bo(){return Gn(C.run.hitCount)}function ja(R){return zn(R)}function an(){if(!s)return;let R=Bo();s.textContent=String(R),s.classList.remove("is-hp-good","is-hp-mid","is-hp-low");let F=ja(R);s.style.color=F.color,s.style.textShadow=`0 0 8px ${F.glow}`}function Ja(R=1,{fromNuke:F=!1}={}){if(C.run.gameOver||!Ce())return;let J=yo(C.run,R,bt,F);C.run=J.run,an(),ye.sfx("hit"),Po(),J.ends&&(Vt(),Ho(J.ends))}function Fo(R,F,J,ae=!0){if(!R)return;let Re=dr(J,Date.now()),De=Re>0,it=!De&&ae&&Ce();R.disabled=!it,R.classList.toggle("is-cooling",De),F&&(De?(F.hidden=!1,F.textContent=String(Re),F.setAttribute("aria-label",`${Re} seconds remaining`)):(F.hidden=!0,F.textContent="",F.removeAttribute("aria-label")))}function Qa(){Fo(x,f,C.schedule.raptorReadyAt,!A.raptorInbound())}function Za(){if(Fo(S,v,A.grenadeArmed()?0:C.schedule.grenadeReadyAt,!0),!S)return;S.classList.toggle("is-armed",A.grenadeArmed());let R=S.querySelector(".cylon-raptor-btn-label");R&&(R.textContent=A.grenadeArmed()?"Armed":"Grenade"),document.body.classList.toggle("cylon-grenade-armed",A.grenadeArmed())}function kt(){Qa(),Za()}function ei(){E&&E.classList.remove("is-inbound"),g&&(g.innerHTML="")}function Bn(){A.reset(),document.body.classList.remove("cylon-grenade-armed"),ne(),kt()}function ti(R,F){let J=R,ae=F,Re=document.createElement("div");Re.className="cylon-grenade-blast",Re.style.left=`${J}px`,Re.style.top=`${ae}px`,Re.setAttribute("aria-hidden","true"),r?.appendChild(Re),h(J,ae,st.medium);for(let De=0;De<2;De++){let it=Math.random()*Math.PI*2,_t=pe(Y*.35,Y*.85);h(J+Math.cos(it)*_t,ae+Math.sin(it)*_t,{radius:pe(36,64),holdMs:st.small.holdMs,fadeMs:st.small.fadeMs})}q(J,ae,xe,{radius:Y*1.2}),setTimeout(()=>Re.remove(),480),qe().forEach(De=>{if(De.dataset.ko==="1")return;let it=(parseFloat(De.style.left)||0)+Je.w/2,_t=(parseFloat(De.style.top)||0)+Je.h/2;Math.hypot(it-J,_t-ae)<=Y&&Qe(De)})}function ni(){if(!g)return;g.innerHTML="";let R=10,F=110;for(let J=0;J<R;J++)setTimeout(()=>{if(!Ce())return;let ae=document.createElement("span");ae.className="cylon-raptor-impact";let Re=12+Math.random()*76,De=40+Math.random()*50;ae.style.left=`${Re}%`,ae.style.top=`${De}%`,g.appendChild(ae);let it=window.scrollX+Re/100*window.innerWidth,_t=window.scrollY+De/100*window.innerHeight;h(it,_t,st.medium),q(it,_t,he,{radius:F}),setTimeout(()=>ae.remove(),560)},J*55)}function oi(){let R=window.innerWidth||1,J=(window.innerHeight||1)*.62,ae=Math.min(220,R*.28);for(let Re=0;Re<5;Re++){let De=R*(.18+Re*.16);I(De,J,Me,{radius:ae})}ni(),Bt()}function ri(){if(!oe.gameEnabled||C.run.gameOver)return;Lo();let R=(window.innerWidth||1)/2,F=(window.innerHeight||1)*.48,J=R+Rt(),ae=F+Pt();requestAnimationFrame(()=>{Q(J,ae,1.35),setTimeout(()=>Q(J,ae,1.1),280)}),C.run=fo(C.run,Date.now()),Va(),$e?(Le(),document.body.classList.add("cylon-touch-play")):Ie(),ue(),kt()}function Ho(R){if(C.run.gameOver)return;C.run=bo(C.run,R);let F=R==="hits"||R==="nuke";We(),nn(),Vt(),clearTimeout(C.idleTimer??void 0),ge(!1),dt.cancel(),C.draggingReticle=!1,C.reticlePointerId=null,Bn(),F||(oe.gameEnabled=!1,ze(),document.body.classList.remove("cylon-touch-play")),Ne(),ue(),ye.syncMusic(),F||Pn(),vt(R)}function Oo(){C.run=mo(C.run),Vt(),m&&(m.textContent="0"),an()}function Fn(R){let F=oe.gameEnabled;if(!R&&F&&!C.run.gameOver&&C.run.koScore>0){Ho("quit");return}oe.gameEnabled=R,ze(),R?(F||sn("game_start"),dt.cancel(),We(),nn(),Oe(),Oo(),Bn(),Ne(),ue(),ye.syncMusic(),Pn({deferScatter:!0}),dt.play()):(dt.cancel(),We(),nn(),Vt(),C.run=ho(C.run),clearTimeout(C.idleTimer??void 0),ge(!1),C.draggingReticle=!1,C.reticlePointerId=null,C.paused=!1,C.pauseStartedAt=0,document.body.classList.remove("cylon-touch-play"),Oe(),C.run=vo(xo(C.run)),Te&&(Te=!1,on()),Bn(),Ne(),ue(),ye.syncMusic(),Pn(),No())}async function No(){await ca(Sn())!=="title-with-hint"||!M||(M.textContent=la,M.hidden=!1,clearTimeout(w??void 0),w=setTimeout(()=>{M.hidden=!0},6e3))}function ai(){let R=(F,J)=>{F&&(F.addEventListener("pointerup",ae=>{C.reticlePointerId!=null&&ae.pointerId===C.reticlePointerId||ae.pointerType==="mouse"&&ae.button!=null&&ae.button!==0||(ae.preventDefault(),ae.stopPropagation(),J())}),F.addEventListener("click",ae=>{ae.detail===0?(ae.preventDefault(),J()):ae.preventDefault()}))};R(x,()=>{A.callRaptor()}),R(S,()=>{A.readyGrenade()}),window.addEventListener("keydown",F=>{if(Ot(F.target))return;let J=cr(F);J==="disarm"?A.cancelGrenadeArm():J==="raptor"?(F.preventDefault(),A.callRaptor()):J==="grenade"&&(F.preventDefault(),A.readyGrenade())}),window.addEventListener("pointerdown",F=>{if(!A.grenadeArmed()||F.button!=null&&F.button!==0)return;let J=F.target;J&&(J.closest("#cylon-grenade-btn")||J.closest("#cylon-raptor-btn")||J.closest("#cylon-game-toggle")||J.closest("#cylon-settings")||J.closest("#theme-toggle")||J.closest("#site-nav-burger")||J.closest("#site-nav-menu a")||J.closest("#cylon-help-btn")||J.closest("#cylon-help")||J.closest(".site-brand")||J.closest("#cylon-gameover"))||(F.preventDefault(),A.throwGrenadeAt(F.pageX,F.pageY))},!0),clearInterval(ot??void 0),ot=setInterval(kt,250),kt()}window.cylonStartGame=()=>{oe.gameEnabled||C.run.gameOver||(Fn(!0),Ve.moveTo(0,!fe))},tt(),Zt(),ai(),Ha(),Ke(),Ve.bind(),Rn(),Ya(),Xa(),Ks(),xt(),an(),Lt(),ue(),et(),Pe(),window.addEventListener("resize",xt),window.addEventListener("pointermove",Be,{passive:!0}),window.addEventListener("scroll",Ua,{passive:!0}),window.addEventListener("pointerdown",ye.unlock,{passive:!0}),window.addEventListener("keydown",ye.unlock,{passive:!0}),document.addEventListener("selectstart",R=>{document.body.classList.contains("cylon-game-live")&&R.preventDefault()}),document.addEventListener("dragstart",R=>{document.body.classList.contains("cylon-game-live")&&R.preventDefault()}),requestAnimationFrame(Se),Fa(!0)}var Mt={a:1,b:0,c:0,d:1,e:0,f:0};function ft(e,t){return{a:e.a*t.a+e.c*t.b,b:e.b*t.a+e.d*t.b,c:e.a*t.c+e.c*t.d,d:e.b*t.c+e.d*t.d,e:e.a*t.e+e.c*t.f+e.e,f:e.b*t.e+e.d*t.f+e.f}}function Tn(e){let t=e.a*e.d-e.b*e.c||1e-12;return{a:e.d/t,b:-e.b/t,c:-e.c/t,d:e.a/t,e:(e.c*e.f-e.d*e.e)/t,f:(e.b*e.e-e.a*e.f)/t}}function jt(e,t,n){return{x:e.a*t+e.c*n+e.e,y:e.b*t+e.d*n+e.f}}function An(e,t,n){return ft(ft({...Mt,e:t,f:n},e),{...Mt,e:-t,f:-n})}function Eo(e,t,n){let o=n*Math.PI/180,r=Math.cos(o),a=Math.sin(o);return{a:r,b:a,c:-a,d:r,e,f:t}}function To(e,t,n,o){let r=3*e,a=3*(n-e)-r,i=1-r-a,p=3*t,c=3*(o-t)-p,m=1-p-c,s=g=>((i*g+a)*g+r)*g,k=g=>((m*g+c)*g+p)*g,E=g=>(3*i*g+2*a)*g+r;return g=>{if(g<=0)return 0;if(g>=1)return 1;let x=g;for(let v=0;v<8;v++){let T=s(x)-g;if(Math.abs(T)<1e-6)return k(x);let u=E(x);if(Math.abs(u)<1e-6)break;x-=T/u}let f=0,S=1;x=g;for(let v=0;v<30;v++){let T=s(x);if(Math.abs(T-g)<1e-6)break;T<g?f=x:S=x,x=(f+S)/2}return k(x)}}var _a=To(.22,.7,.2,1),Sa=To(.15,.85,.25,1),Ao=To(.25,.1,.25,1);function ht(e,t){return e.ms<=0||t>=e.t0+e.ms?e.to:t<=e.t0?e.from:e.from+(e.to-e.from)*e.ease((t-e.t0)/e.ms)}function yt(e,t,n,o,r){return{from:ht(e,n),to:t,t0:n,ms:o,ease:r}}var Jt=e=>({from:e,to:e,t0:0,ms:0,ease:Ao});function Qt(e,t){return e.ms>0&&t<e.t0+e.ms&&e.from!==e.to}function Ea(e){let t=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(e.trim());if(t)return{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16),a:1};let n=/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i.exec(e.trim());if(!n)return null;let o=n[4]===void 0?1:n[4].endsWith("%")?parseFloat(n[4])/100:parseFloat(n[4]);return{r:+n[1],g:+n[2],b:+n[3],a:o}}function Ta(e,t,n){let o=e.a*n+t.a*(1-n);if(o<=0)return{r:0,g:0,b:0,a:0};let r=(a,i)=>Math.round((a*e.a*n+i*t.a*(1-n))/o);return{r:r(e.r,t.r),g:r(e.g,t.g),b:r(e.b,t.b),a:o}}var Mn=e=>`rgba(${e.r}, ${e.g}, ${e.b}, ${+e.a.toFixed(3)})`;function Aa(e,t){let n=/^\s*([\d.]+)(ms|s)\s*$/.exec(e);return n?n[2]==="s"?parseFloat(n[1])*1e3:parseFloat(n[1]):t}var Ys=320,js=450,Js=1600,Ma={r:90,g:88,b:84,a:1},Qs=[[0,1.5,"rgba(0, 0, 0, 0.4)"],[-1.8,.4,"rgba(40, 90, 160, 0.45)"],[1.8,0,"rgba(160, 35, 35, 0.5)"]],Zs=.55,Gt=3,Cn=2048,el=6e3,tl=new Set(["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","TEXTAREA","SELECT","OPTION","svg","SVG","CANVAS","IFRAME","VIDEO","AUDIO"]),Ca=e=>{if(!e||e==="none")return Mt;let t=new DOMMatrixReadOnly(e);return{a:t.a,b:t.b,c:t.c,d:t.d,e:t.e,f:t.f}},nl=e=>Math.abs(e.a-1)<.001&&Math.abs(e.d-1)<.001&&Math.abs(e.b)<.001&&Math.abs(e.c)<.001;function La(e){let{doc:t,win:n}=e,o=e.max??el,r=t.body,a=null,i=null,p=1,c=[],m=[],s=[],k=new Map,E=new Map,g=[],x=new Set,f=()=>({sx:0,sy:0,sr:0}),S=!1,v=0,T=0,u=null,l=null,d=null,y=[],M=new Map,w=0,L=0,H=0,G=new Map,z=null,D=()=>n.performance.now(),X=()=>r.classList.contains("cylon-glyphs-blown"),K=()=>r.classList.contains("cylon-glyphs-blowing"),me=()=>Aa(n.getComputedStyle(r).getPropertyValue("--cylon-desolate-fade"),Js);function $(){return z||(z=t.createElement("canvas").getContext("2d",{willReadFrequently:!0})),z}function U(_){let P=G.get(_);if(!P){let B=$();B.font=_;let N=B.measureText("Mg");P={asc:Math.round(N.fontBoundingBoxAscent||N.actualBoundingBoxAscent),desc:Math.round(N.fontBoundingBoxDescent||N.actualBoundingBoxDescent)},G.set(_,P)}return P}function se(_){let P=$();P.fillStyle="#000",P.fillStyle=_;let B=Ea(String(P.fillStyle));if(B)return B;P.setTransform(1,0,0,1,0,0),P.clearRect(0,0,1,1),P.fillRect(0,0,1,1);let[N=0,O=0,W=0,V=0]=P.getImageData(0,0,1,1).data;return{r:N,g:O,b:W,a:V/255}}function Z(_,P){let B=`${P}|${_.style.font}|${Mn(_.style.color)}|${_.ch}`,N=M.get(B);if(N)return N;let O=$();O.font=_.style.font;let W=O.measureText(_.ch),V=Math.max(W.width,(W.actualBoundingBoxLeft||0)+(W.actualBoundingBoxRight||0))+Gt*2,re=_.style.asc+_.style.desc+Gt*2,de=Math.ceil(V*p),ve=Math.ceil(re*p);if(w+de>Cn&&(w=0,L+=H+1,H=0),!y.length||L+ve>Cn){let _e=t.createElement("canvas");_e.width=Cn,_e.height=Cn,y.push(_e),w=0,L=0,H=0}let xe=y.length-1,he=y[xe].getContext("2d"),Me={page:xe,sx:w,sy:L,sw:de,sh:ve};he.setTransform(p,0,0,p,w,L),he.font=_.style.font,he.textBaseline="alphabetic";let ee=Gt,Y=Gt+_.style.asc;if(P==="blown"){for(let[_e,et,Pe]of Qs)he.fillStyle=Pe,he.fillText(_.ch,ee+_e,Y+et);he.fillStyle=Mn(Ta(_.style.color,Ma,.38))}else he.fillStyle=Mn(_.style.color);return he.fillText(_.ch,ee,Y),w+=de+1,H=Math.max(H,ve),M.set(B,Me),Me}function Te(_,P){let B=E.get(_);if(B)return B;let N=n.getComputedStyle(_),O=_===P||!_.parentElement?null:Te(_.parentElement,P),W=O?O.ok:!0;(tl.has(_.tagName)||_.closest("svg"))&&(W=!1),(N.visibility==="hidden"||N.display==="none")&&(W=!1),(N.clipPath!=="none"||N.clip&&N.clip!=="auto")&&(W=!1),N.overflow!=="visible"&&_.offsetWidth<=2&&(W=!1);let V=N.getPropertyValue("-webkit-text-fill-color"),re=se(N.color);(!re||re.a<=0)&&(W=!1),V&&se(V)?.a===0&&(W=!1);let de=(O?O.opacity:1)*(parseFloat(N.opacity)||0);de<=0&&(W=!1);let ve=`${N.fontStyle} ${N.fontWeight} ${N.fontSize} ${N.fontFamily}`,xe=N.textTransform,{asc:he,desc:Me}=U(ve),ee={ok:W,font:ve,color:re??Ma,opacity:de,upper:xe==="uppercase"||xe==="capitalize",lower:xe==="lowercase",asc:he,desc:Me};return E.set(_,ee),ee}function fe(_,P){let B=k.get(_);if(B)return B;let N;if(_===P){let O=n.getComputedStyle(P).position;N={el:_,style:n.getComputedStyle(_),parent:null,fixed:O==="fixed"||O==="sticky",blocks:0,ox:0,oy:0,world:Mt},s.push(N)}else{let O=fe(_.parentElement??P,P),W=n.getComputedStyle(_);if(!(_.classList.contains("cylon-scatter-block")&&W.display!=="inline"&&W.display!=="contents"))return k.set(_,O),O;N={el:_,style:W,parent:O,fixed:O.fixed,blocks:O.blocks+1,ox:0,oy:0,world:Mt},s.push(N)}return k.set(_,N),N}function Ve(){let _=n.scrollX,P=n.scrollY;for(let B of s){let N=B.el.getBoundingClientRect(),O=B.parent?B.parent.world:Mt,W=Ca(B.style.transform),V=jt(Tn(O),N.left+N.width/2+(B.fixed?0:_),N.top+N.height/2+(B.fixed?0:P));B.ox=V.x-W.e,B.oy=V.y-W.f,B.world=ft(O,An(W,B.ox,B.oy))}}function $e(){for(let _ of s){let P=An(Ca(_.style.transform),_.ox,_.oy);_.world=_.parent?ft(_.parent.world,P):P}}let Fe=()=>t.createRange();function je(_,P){P.setStart(_.text,_.start),P.setEnd(_.text,_.end);let B=P.getBoundingClientRect();if(B.width<=0||B.height<=0)return null;let N=_.frame.fixed?{x:0,y:0}:{x:n.scrollX,y:n.scrollY},O=jt(Tn(_.frame.world),B.left+B.width/2+N.x,B.top+B.height/2+N.y);if(nl(_.frame.world))return{lx:O.x,ly:O.y,w:B.width,h:B.height};let W=$();return W.font=_.style.font,{lx:O.x,ly:O.y,w:W.measureText(_.ch).width,h:_.style.asc+_.style.desc}}function C(_,P){let B=P.get(_);if(B)return B;let N=_.el,O=ve=>parseFloat(N.style?.getPropertyValue(ve)??"")||0,W=Eo(O("--sx"),O("--sy"),O("--sr")),V=_.parent?1:.96,re=An({a:W.a*V,b:W.b*V,c:W.c*V,d:W.d*V,e:W.e,f:W.f},_.ox,_.oy),de=_.parent?ft(C(_.parent,P),re):re;return P.set(_,de),de}function He(){if(!m.length||c.length>=o)return;$e();let _=n.innerWidth||1,P=n.innerHeight||1,B=n.scrollX,N=n.scrollY,O=_*.75,W=P*.75,V=Fe(),re=new Map,de=[],ve=[];for(let ee of m){if(!ee.text.isConnected)continue;V.selectNodeContents(ee.text);let Y=V.getBoundingClientRect();if(Y.width<=0&&Y.height<=0)continue;let _e=Y.bottom>-W&&Y.top<P+W&&Y.right>-O&&Y.left<_+O,et=!1;if(!_e){let Pe=ee.frame.fixed?0:B,Oe=ee.frame.fixed?0:N,vt=ft(C(ee.frame,re),Tn(ee.frame.world)),at=1/0,oe=1/0,ze=-1/0,Ne=-1/0;for(let[Lt,zt]of[[Y.left,Y.top],[Y.right,Y.top],[Y.left,Y.bottom],[Y.right,Y.bottom]]){let tt=jt(vt,Lt+Pe,zt+Oe);at=Math.min(at,tt.x-Pe),ze=Math.max(ze,tt.x-Pe),oe=Math.min(oe,tt.y-Oe),Ne=Math.max(Ne,tt.y-Oe)}et=Ne>-W&&oe<P+W&&ze>-O&&at<_+O}if(!_e&&!et){ve.push(ee);continue}de.push({p:ee,dist:Math.abs(Y.top+Y.height/2-P/2)})}de.sort((ee,Y)=>ee.dist-Y.dist);let xe=[],he=[],Me=S;for(let{p:ee}of de){if(c.length+xe.length>=o){ve.push(ee);continue}let Y=ee.text.parentElement;if(!Y)continue;let _e=Te(Y,ke(ee.frame));if(!_e.ok)continue;let et=ee.text.nodeValue??"",Pe=0;for(let Oe of et){let vt=Pe;if(Pe+=Oe.length,/^[\s­​-‍⁠﻿]$/.test(Oe))continue;let at=_e.upper?Oe.toUpperCase():_e.lower?Oe.toLowerCase():Oe,oe={text:ee.text,start:vt,end:Pe,ch:at,frame:ee.frame,style:_e},ze=je(oe,V);if(!ze)continue;let Ne=f();xe.push({...oe,...ze,v:Ne,rest:Z(oe,"rest"),blown:Z(oe,"blown"),x:Jt(Me?Ne.sx:0),y:Jt(Me?Ne.sy:0),r:Jt(Me?Ne.sr:0),k:Jt(Me?1:0)})}he.push(ee.text)}he.forEach(ot),m=ve,c=c.concat(xe),Xe()}let ke=_=>{let P=_;for(;P.parent;)P=P.parent;return P.el};function ot(_){let P=_.parentElement;if(!P)return;let B=t.createElement("span");B.className="cylon-glyph-src",_.replaceWith(B),B.appendChild(_),g.push(B),P.classList.add("cylon-glyph-parent"),x.add(P)}function gt(){a&&(p=Math.min(3,n.devicePixelRatio||1),a.width=Math.round((n.innerWidth||1)*p),a.height=Math.round((n.innerHeight||1)*p))}function ce(_,P,B){let N=D();for(let O of c)O.x=yt(O.x,S?O.v.sx:0,N,_,B),O.y=yt(O.y,S?O.v.sy:0,N,_,B),O.r=yt(O.r,S?O.v.sr:0,N,_,B),O.k=yt(O.k,S?1:0,N,P,Ao)}function Ae(){if(K()){let _=me();return{ms:_,lookMs:_,ease:Sa}}return{ms:Ys,lookMs:js,ease:_a}}function Ue(){let _=X();if(_===S)return;S=_;let{ms:P,lookMs:B,ease:N}=Ae();ce(P,B,N),Ze(Math.max(P,B)+200)}function rt(_){if(!a||!i)return!1;let P=n.innerWidth||1,B=n.innerHeight||1,N=n.scrollX,O=n.scrollY;i.setTransform(1,0,0,1,0,0),i.clearRect(0,0,a.width,a.height);let W=!1;for(let V of c){(Qt(V.x,_)||Qt(V.y,_)||Qt(V.r,_)||Qt(V.k,_))&&(W=!0);let re=ft(V.frame.world,Eo(V.lx+ht(V.x,_),V.ly+ht(V.y,_),ht(V.r,_))),de=V.frame.fixed?re.e:re.e-N,ve=V.frame.fixed?re.f:re.f-O;if(de<-80||ve<-80||de>P+80||ve>B+80)continue;let xe=ht(V.k,_),he=V.style.opacity*(1+(Math.pow(Zs,V.frame.blocks)-1)*xe);i.setTransform(p*re.a,p*re.b,p*re.c,p*re.d,p*de,p*ve);let Me=-V.w/2-Gt,ee=-V.h/2-Gt;if(xe<1){let Y=V.rest;i.globalAlpha=he*(1-xe),i.drawImage(y[Y.page],Y.sx,Y.sy,Y.sw,Y.sh,Me,ee,Y.sw/p,Y.sh/p)}if(xe>0){let Y=V.blown;i.globalAlpha=he*xe,i.drawImage(y[Y.page],Y.sx,Y.sy,Y.sw,Y.sh,Me,ee,Y.sw/p,Y.sh/p)}}return i.globalAlpha=1,W}function Je(_){if(v=0,!a)return;let P=_<T;P&&$e(),(rt(_)||P)&&Xe()}function Xe(){!v&&a&&(v=n.requestAnimationFrame(Je))}function Ze(_){T=Math.max(T,D()+_),Xe(),m.length&&Ct()}function Ct(){l&&clearTimeout(l),l=setTimeout(()=>{l=null,He()},150)}function bt(){Xe(),Ct()}function ct(){d&&clearTimeout(d),d=setTimeout(()=>{d=null,gt(),Ve();let _=Fe();for(let P of c){let B=je(P,_);B&&Object.assign(P,B)}He(),Xe()},200)}return{scatter(_,P){if(!a){f=P,S=X();for(let B of _){let N=t.createTreeWalker(B,NodeFilter.SHOW_TEXT,{acceptNode(O){if(!O.nodeValue||!/\S/.test(O.nodeValue))return NodeFilter.FILTER_REJECT;let W=O.parentElement;return!W||W.closest(".cylon-glyph-src, .cylon-scatter-char")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});for(;N.nextNode();){let O=N.currentNode;m.push({text:O,frame:fe(O.parentElement,B)})}}Ve(),a=t.createElement("canvas"),a.className="cylon-glyph-layer",a.setAttribute("aria-hidden","true"),i=a.getContext("2d"),gt(),He(),r.appendChild(a),u=new MutationObserver(Ue),u.observe(r,{attributes:!0,attributeFilter:["class"]}),n.addEventListener("scroll",bt,{passive:!0}),n.addEventListener("resize",ct),Xe()}},restore(){v&&n.cancelAnimationFrame(v),v=0,u?.disconnect(),u=null,n.removeEventListener("scroll",bt),n.removeEventListener("resize",ct),l&&clearTimeout(l),d&&clearTimeout(d),l=null,d=null;for(let _ of g){let P=_.firstChild;P?_.replaceWith(P):_.remove()}g.length=0,x.forEach(_=>_.classList.remove("cylon-glyph-parent")),x.clear(),a?.remove(),a=null,i=null,c=[],m=[],s=[],k.clear(),E.clear(),y.length=0,M.clear(),w=0,L=0,H=0,S=!1,T=0},reshuffle(_){f=_;for(let O of c)O.v=_();let{ms:P,lookMs:B,ease:N}=Ae();S=X(),ce(P,B,N),Ze(Math.max(P,B)+200)},kick(_){if(!c.length)return;let P=D(),B=n.scrollX,N=n.scrollY,{ms:O,ease:W}=Ae();for(let V of c){let re=jt(V.frame.world,V.lx+ht(V.x,P),V.ly+ht(V.y,P)),de=_(V.frame.fixed?re.x+B:re.x,V.frame.fixed?re.y+N:re.y,V.v);de&&(V.v=de,S&&(V.x=yt(V.x,de.sx,P,O,W),V.y=yt(V.y,de.sy,P,O,W),V.r=yt(V.r,de.sr,P,O,W)))}Xe()},poke:Ze,count:()=>c.length}}var ol=[Go,zo,Vo,$o,Uo,Xo,Ko,Wo,Yo,jo,Jo,Qo,Zo],rl="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&display=swap",al="cic-embed",Ra="cic-embed-launch",Pa="cic-embed-bar",il=new Set(["SCRIPT","STYLE","LINK","META","NOSCRIPT","TEMPLATE","IFRAME"]),sl="img, picture, figure, video, svg, blockquote, pre, table, form, button, input, h4, h5, h6, .wp-block-image, .wp-block-button",ll=document.currentScript,Ln=(e,t)=>{console.error(`The CIC: ${e}`,t??"")},cl=`
<div class="site-nav-inner">
  <span class="site-brand" id="site-brand">The CIC</span>
  <div class="site-nav-power" id="site-nav-power">
    <button type="button" class="cylon-game-toggle" id="cylon-game-toggle" aria-pressed="false" title="Toggle the game">
      <span class="cylon-game-toggle-dot" aria-hidden="true"></span>
      <span class="cylon-game-toggle-label" id="cylon-game-toggle-label">Game Off</span>
    </button>
  </div>
  <div class="site-nav-game" id="site-nav-game" hidden>
    <span class="cylon-score" id="cylon-score" title="Hostile drones neutralized" aria-live="polite">
      <span class="cylon-score-label">KOs</span>
      <span class="cylon-score-value" id="cylon-score-value">0</span>
    </span>
    <span class="cylon-score" id="cylon-hits" title="Hull points — game over at 0, or if a nuke lands on you. Heal 1 after 10s without a hit." aria-live="polite">
      <span class="cylon-score-label">HP</span>
      <span class="cylon-score-value" id="cylon-hits-value">30</span>
    </span>
    <button type="button" class="cylon-raptor-btn" id="cylon-grenade-btn" title="Ready grenade, then tap/click to throw (G)" aria-label="Ready grenade">
      <svg class="cylon-ability-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M11 2h2v2h2.2c.4 0 .8.3.8.8V7l1.4.9c.3.2.4.6.2 1l-.7 1.2A6.5 6.5 0 0 1 18.5 15 6.5 6.5 0 1 1 5.5 15c0-2.1 1-3.9 2.6-5l-.7-1.2c-.2-.4-.1-.8.2-1L9 7V4.8c0-.5.4-.8.8-.8H12V2zm1 8.2A4.3 4.3 0 0 0 7.7 15 4.3 4.3 0 0 0 12 19.3 4.3 4.3 0 0 0 16.3 15 4.3 4.3 0 0 0 12 10.2z"/>
        <path fill="currentColor" d="M10.2 4.8h3.6v1.3l1.1.7-.4.7-1.3-.4H10.8l-1.3.4-.4-.7 1.1-.7V4.8z"/>
        <circle cx="12" cy="15" r="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/>
      </svg>
      <span class="cylon-raptor-btn-label">Grenade</span>
      <span class="cylon-raptor-btn-cd" id="cylon-grenade-cd" hidden></span>
    </button>
    <button type="button" class="cylon-raptor-btn" id="cylon-raptor-btn" title="Call Raptor strike (R)" aria-label="Call Raptor reinforcements">
      <svg class="cylon-ability-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M2.5 13.1 8.8 10.8l1-2.6c.15-.4.55-.55.9-.35l1.1.6L13 6.7c.25-.4.85-.4 1.1 0l1.2 1.75 1.05-.55c.35-.2.75 0 .9.35l1.05 2.55 5.2 1.7c.45.15.65.65.4 1.05l-1.35 1.9c-.2.3-.55.4-.9.3l-2.85-.75-1.45 2.55c-.15.3-.5.5-.85.5H9.85c-.35 0-.7-.2-.85-.5L7.55 15.4l-3.2.7c-.35.1-.75-.15-.85-.5l-1.35-2.05c-.2-.4.1-.9.55-.75z"/>
        <path fill="currentColor" d="M18.6 11.35h2.35l.75.85-1 .35-2.1-.35z"/>
        <path fill="currentColor" opacity=".9" d="M11.1 8.35h1.8l.35.95h-2.5l.35-.95z"/>
      </svg>
      <span class="cylon-raptor-btn-label">Raptor</span>
      <span class="cylon-raptor-btn-cd" id="cylon-raptor-cd" hidden></span>
    </button>
    <button type="button" class="cylon-raptor-btn cylon-help-btn" id="cylon-help-btn" title="How to play" aria-label="How to Play" aria-haspopup="dialog" aria-controls="cylon-help">
      <span class="cylon-raptor-btn-label cylon-help-label-full">How to Play</span>
      <span class="cylon-help-label-short" aria-hidden="true">?</span>
    </button>
  </div>
  <div class="site-nav-tools" id="site-nav-tools">
    <div class="cylon-settings" id="cylon-settings" hidden>
      <button type="button" class="cylon-settings-toggle" id="cylon-settings-toggle" aria-expanded="false" aria-controls="cylon-settings-panel" title="Game settings">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 4.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zM6.25 8a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0z"/><path fill="currentColor" d="M6.6.8a1 1 0 0 1 1-.8h.8a1 1 0 0 1 1 .8l.25 1.3c.4.16.78.38 1.12.64l1.26-.44a1 1 0 0 1 1.18.45l.4.7a1 1 0 0 1-.2 1.24l-1 .87a4.6 4.6 0 0 1 0 1.3l1 .87a1 1 0 0 1 .2 1.24l-.4.7a1 1 0 0 1-1.18.45l-1.26-.44c-.34.26-.72.48-1.12.64L9.4 15.2a1 1 0 0 1-1 .8h-.8a1 1 0 0 1-1-.8l-.25-1.3a4.6 4.6 0 0 1-1.12-.64l-1.26.44a1 1 0 0 1-1.18-.45l-.4-.7a1 1 0 0 1 .2-1.24l1-.87a4.6 4.6 0 0 1 0-1.3l-1-.87a1 1 0 0 1-.2-1.24l.4-.7a1 1 0 0 1 1.18-.45l1.26.44c.34-.26.72-.48 1.12-.64L6.6.8z" opacity=".55"/></svg>
        <span class="visually-hidden">Game settings</span>
      </button>
      <div class="cylon-settings-panel" id="cylon-settings-panel" hidden></div>
    </div>
    <button type="button" class="cic-embed-leave" id="cic-embed-leave" title="Put this page back">Leave</button>
  </div>
</div>`;function dl(e){for(let t of Array.from(document.body.children))il.has(t.tagName)||e.has(t)||(t.classList.add("page-panel","cic-embed-host"),getComputedStyle(t).position==="static"&&t.classList.add("cic-embed-host-static"),t.querySelectorAll(sl).forEach(n=>n.classList.add("cylon-debris")))}var Ia=!1;async function ul(e){if(Ia)return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){e.textContent="The CIC Rests (Reduced Motion)",e.disabled=!0;return}if(document.getElementById("game-root")||document.getElementById(Pa)){Ln("this page already has a #game-root; not launching");return}Ia=!0,e.remove();let t=document.createElement("link");t.rel="stylesheet",t.href=rl,document.head.appendChild(t);let n=document.createElement("style");n.id="cic-embed-style",n.textContent=ol.join(`
`),document.head.appendChild(n);let o=En(document,location.hostname,ll),r=document.createElement("div");r.id="game-root",r.dataset.game="cylon";let a=document.createElement("header");a.id=Pa,a.className="site-nav",a.innerHTML=cl,dl(new Set([r,a])),document.body.prepend(r),document.body.appendChild(a),document.documentElement.classList.add("cic-embed-on"),document.body.classList.add("cic-embed-on"),a.querySelector("#cic-embed-leave")?.addEventListener("click",()=>{location.reload()}),await wa({mountHtml:qo,localScores:!0,siteName:o,glyphLayer:La({doc:document,win:window})}),window.cylonStartGame?.()}function Da(){if(document.getElementById(Ra))return;let e=document.createElement("button");e.type="button",e.id=Ra,e.textContent="Play The CIC",e.title="Play The CIC on this page",e.setAttribute("style",["font: 700 14px/1.2 system-ui, sans-serif","letter-spacing: .06em","color: #fff","background: #8a0a0a","border: 1px solid #ff5555","border-radius: 6px","padding: 10px 16px","cursor: pointer","box-shadow: 0 4px 14px rgba(0,0,0,.35)"].join(";")),e.addEventListener("click",()=>{ul(e).catch(n=>Ln("the game failed to start",n))});let t=document.getElementById(al);t?t.appendChild(e):(e.style.cssText+=";position:fixed;right:16px;bottom:16px;z-index:2147483000",document.body.appendChild(e))}try{document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{try{Da()}catch(e){Ln("the launcher failed",e)}}):Da()}catch(e){Ln("the launcher failed",e)}})();
//# sourceMappingURL=embed.js.map
