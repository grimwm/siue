/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */
"use strict";(()=>{var oi=Object.defineProperty;var Bn=(e,t)=>{for(var n in t)oi(e,n,{get:t[n],enumerable:!0})};var Oo=`<!-- Cylon Defense — FX / overlays injected into #game-root -->
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
`;var No=`/* The games kit's opt-in stylesheet. Every selector carries a .kit- class and
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
`;var qo=`/* Cylon Defense: The scanner bar, the eye and its glare cone, and the home page eye (two sweeps, then the red fill).
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


`;var Go=`/* Cylon Defense: The combat nav: control box, the fade between civil and combat chrome, the mobile layout.
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
`;var zo=`/* Cylon Defense: The How to Play overlay.
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
`;var Vo=`/* Cylon Defense: The touch-play layout, the reticle, and the KO and hull readouts.
 * One of the stylesheets index.html links in order; the order is the cascade (README.md, "Stylesheets"). */
/*
 * Touch play: don't pan the document; keep nav / bots tappable.
 * Avoid overflow:hidden here — it jumps scroll and fights sticky nav.
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


`;var $o=`/* Cylon Defense: The game-over panel: the initials entry, the buttons and the board.
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
`;var Uo=`/* Cylon Defense: The settings gear and its panel.
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


`;var Xo=`/* Cylon Defense: The Game On toggle, the grenade and raptor buttons, and the high-score list.
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


`;var Ko=`/* Cylon Defense: The grenade blast, the scorched holes, and the page rules that hold while a run is live.
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


/* Scattered page — no point scrolling (wheel/touch blocked in JS too) */
body.cylon-game-live {
  overscroll-behavior: none;
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


`;var Wo=`/* Cylon Defense: The battlefield: drones and their bolts, the raptor, the missiles and the nuke.
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


`;var Yo=`/* Cylon Defense: The world-ended look: fracture and ash, the scattered glyphs and panels.
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


`;var jo=`/* Cylon Defense: The intro title card: "The CIC" and its glide into the brand.
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

`;var Jo=`/* Cylon Defense: the embed's own rules (src/embed.ts): the home page's dark tokens, the combat bar and the host page's panels.
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
`;var bi="__siteStats",vi="__siteStatsQ";function xi(e,t,n){try{let o=globalThis,r=o[bi];if(r){r.event(e,t,n);return}let a=o[vi]??=[];a.length<50&&a.push([e,t,n])}catch{}}function Qo(e){return(t,n)=>xi(e,t,n)}var an=Qo("cylon");var sn={};Bn(sn,{BOT_CAP_PER_KOS:()=>_i,BOT_CAP_START:()=>ki,MAX_HITS:()=>wi,MISSILE_GROUND_CAP_MAX:()=>Ti,MISSILE_TRACKER_CAP_MAX:()=>Ei,MISSILE_TRACKER_CHANCE_BASE:()=>Si,botCap:()=>Li,currentHp:()=>Nn,difficultyFactor:()=>Fn,groundMissileCap:()=>Mi,hpTint:()=>qn,killLevel:()=>Bt,lerp:()=>_t,nextMissileDelayMs:()=>Hn,nextNukeDelayMs:()=>On,planWave:()=>Ri,trackerMissileCap:()=>Ai,trackerMissileChance:()=>Ci,volumeToGain:()=>Gn});var wi=30,ki=4,_i=5,Si=.14,Ei=3,Ti=5;function _t(e,t,n){return e+(t-e)*Math.min(1,Math.max(0,n))}function Bt(e){return Math.floor(e/5)}function Fn(e,t,n){if(!t)return 0;let o=(n-t)/6e4,r=Math.min(1,o/3.5),a=Math.min(1,Bt(e)/10);return Math.min(1,a*.75+r*.25)}function Hn(e,t){let n=Math.min(1,Bt(e)/10),o=_t(8500,3400,n),r=_t(2800,1600,n);return Math.max(2400,o-r/2+t()*r)}function On(e,t){let n=_t(32500,24e3,e),o=_t(15e3,12e3,e);return n-o/2+t()*o}function Mi(e){return Math.min(5,1+Math.floor(Bt(e)/2))}function Ai(e){let t=Bt(e);return t<3?1:t<7?2:Math.min(3,3)}function Ci(e){return Math.min(.34,.14+Bt(e)*.02)}function Li(e,t){return Math.min(t,4+Math.floor(e/5))}function Ri(e,t,n){let o=n()<.55,r=Math.min(e,Math.max(2,Math.min(4,Math.floor(t/3)))),a=o?Math.min(e,2+Math.floor(n()*Math.max(1,r-1))):1;return{isWave:o,count:a}}function Nn(e){return Math.max(0,30-e)}function qn(e){let t=(l,p,s)=>Math.round(l+(p-l)*s),n=(l,p,s)=>({r:t(l.r,p.r,s),g:t(l.g,p.g,s),b:t(l.b,p.b,s)}),o={r:125,g:255,b:154},r={r:255,g:210,b:74},a={r:255,g:72,b:72},i=Math.max(0,Math.min(1,e/30)),u=i>=.5?n(r,o,(i-.5)/.5):n(a,r,i/.5);return{color:`rgb(${u.r}, ${u.g}, ${u.b})`,glow:`rgba(${u.r}, ${u.g}, ${u.b}, 0.55)`}}function Gn(e,t="sfx"){let n=Math.max(0,Math.min(100,Number(e)||0))/100;if(t==="music")return Math.min(2.5,n/.5*1.25);let r=(n<=.5?n/.5*85:85+(n-.5)/.5*15)/100;return r*r}var Vn={};Bn(Vn,{botPageRect:()=>er,candidateSpots:()=>nr,clampToBounds:()=>ln,findSafeSpot:()=>Di,inflate:()=>Ii,isInBounds:()=>tr,isSafeSpot:()=>Ut,marchOrigin:()=>Bi,randomVisibleSpot:()=>zn,rectsOverlap:()=>Zo,visibleBounds:()=>Pi});function Zo(e,t){return!(e.right<t.left||e.left>t.right||e.bottom<t.top||e.top>t.bottom)}function Ii(e,t){return{left:e.left-t,top:e.top-t,right:e.right+t,bottom:e.bottom+t}}function er(e,t,n){return{left:e,top:t,right:e+n.w,bottom:t+n.h}}function Pi(e,t){let n=Math.max(72,e.navBottom+10),o=10,r=e.scrollX+o,a=e.scrollY+n,i=e.scrollX+e.width-t.w-o,u=e.scrollY+e.height-t.h-o-6;return{left:r,top:a,right:Math.max(r,i),bottom:Math.max(a,u)}}function ln(e,t,n){return{x:Math.min(Math.max(e.left,t),e.right),y:Math.min(Math.max(e.top,n),e.bottom)}}function tr(e,t,n){return t>=e.left-2&&t<=e.right+2&&n>=e.top-2&&n<=e.bottom+2}function Ut(e,t,n,o,r){let a=er(e,t,r);return e<4||t<70||e+r.w>o.w-4||t+r.h>o.h-4?!1:!n.some(i=>Zo(a,i))}function zn(e,t){let n=e.bounds,o=Math.max(1,n.right-n.left),r=Math.max(1,n.bottom-n.top);for(let i=0;i<36;i++){let u=n.left+t()*o,l=n.top+t()*r;if(Ut(u,l,e.forbidden,e.doc,e.bot))return{x:u,y:l,edge:"return"}}let a=ln(n,(n.left+n.right)/2,(n.top+n.bottom)/2);return Ut(a.x,a.y,e.forbidden,e.doc,e.bot)?{...a,edge:"return"}:null}function nr(e,t){let n=[],o=["left","right","bottom"],r=Math.max(40,e.bottom-e.top),a=Math.max(40,e.right-e.left);o.forEach(i=>{for(let u=0;u<10;u++){let l,p;i==="left"?(l=e.left,p=e.top+t()*r):i==="right"?(l=e.right,p=e.top+t()*r):(l=e.left+t()*a,p=e.bottom-t()*Math.min(36,r*.25));let s=ln(e,l,p);n.push({...s,edge:i})}});for(let i=n.length-1;i>0;i--){let u=Math.floor(t()*(i+1)),l=n[i];n[i]=n[u],n[u]=l}return n}function Di(e,t,n){if(t)if(tr(e.bounds,t.x,t.y))for(let o=0;o<28;o++){let r=t.x+(n()-.5)*200,a=t.y+(n()-.5)*140,i=ln(e.bounds,r,a);if(Ut(i.x,i.y,e.forbidden,e.doc,e.bot))return{x:i.x,y:i.y,edge:"patrol"}}else{let o=zn(e,n);if(o)return o}for(let o of nr(e.bounds,n))if(Ut(o.x,o.y,e.forbidden,e.doc,e.bot))return o;return zn(e,n)}function Bi(e,t,n){return t.edge==="left"?{x:e.left-n.w+6,y:t.y}:t.edge==="right"?{x:e.right+n.w-6,y:t.y}:{x:t.x,y:e.bottom+n.h-6}}var $n=["sfx","music"];function Fi(){let e=globalThis,t=e.AudioContext||e.webkitAudioContext;return t?new t:null}function or(e={}){let t=e.createContext??Fi,n=null,o=!1,r=!1,a=[],i=null,u={sfx:1,music:1},l={sfx:!1,music:!1},p={};function s(h){let c=p[h];if(!c||!n)return;let d=l[h]?0:u[h];try{c.gain.cancelScheduledValues(n.currentTime),c.gain.setValueAtTime(d,n.currentTime)}catch{c.gain.value=d}}function _(h){try{return Promise.resolve(h())}catch(c){return Promise.reject(c)}}function E(){if(!n){let c=null;try{if(c=t(),!c)return null;let d={};for(let y of $n){let T=c.createGain();T.connect(c.destination),d[y]=T}n=c,Object.assign(p,d);for(let y of $n)s(y)}catch{n=null;let d=c;return d&&_(()=>d.close()).catch(()=>{}),null}}let h=n;return h.state==="suspended"&&!r&&_(()=>h.resume()).catch(()=>{}),h}function g(h){let c=h===void 0?"sfx":typeof h=="string"?h:null;if(c&&l[c])return null;let d=E();if(!d)return null;let y=c?p[c]:h;return y?{c:d,node:y}:null}function x(h,c){let d=g(c);if(!d)return;let{c:y,node:T}=d;try{let w=h.at??y.currentTime+(h.when??0),C=h.vol??.05,H=y.createOscillator(),G=y.createGain();if(H.type=h.type??"square",H.frequency.setValueAtTime(h.freq,w),h.slideTo&&H.frequency.exponentialRampToValueAtTime(Math.max(1,h.slideTo),w+(h.slideDur??h.dur)),h.attack?(G.gain.setValueAtTime(1e-4,w),G.gain.exponentialRampToValueAtTime(C,w+h.attack)):G.gain.setValueAtTime(C,w),G.gain.exponentialRampToValueAtTime(1e-4,w+h.dur),h.filter){let z=f(y,h.filter,w,h.dur);H.connect(z),z.connect(G)}else H.connect(G);G.connect(T),H.start(w),H.stop(w+h.dur+(h.stopPad??.02))}catch{}}function f(h,c,d,y){let T=h.createBiquadFilter();if(T.type=c.type,T.frequency.setValueAtTime(c.freq,d),c.slideTo){let w=d+(c.slideDur??y);c.slide==="linear"?T.frequency.linearRampToValueAtTime(c.slideTo,w):T.frequency.exponentialRampToValueAtTime(Math.max(1,c.slideTo),w)}return T}function S(h,c){let d=g(c);if(!d)return;let{c:y,node:T}=d;try{let w=h.at??y.currentTime+(h.when??0),C=h.oscs.map(z=>{let D=y.createOscillator();return D.type=z.type,D.frequency.setValueAtTime(z.freq,w),D}),H=y.createGain();H.gain.setValueAtTime(1e-4,w);for(let z of h.envelope)z.ramp==="linear"?H.gain.linearRampToValueAtTime(z.to,w+z.at):H.gain.exponentialRampToValueAtTime(z.to,w+z.at);let G=h.filter?f(y,h.filter,w,h.dur):H;h.filter&&G.connect(H);for(let z of C)z.connect(G);H.connect(T);for(let z of C)z.start(w),z.stop(w+h.dur+(h.stopPad??.02))}catch{}}function v(h,c){let d=g(c);if(!d)return;let{c:y,node:T}=d;try{let w=h.at??y.currentTime+(h.when??0),C=y.createBufferSource();if(h.source==="fade"){let z=Math.max(1,Math.floor(y.sampleRate*h.dur)),D=y.createBuffer(1,z,y.sampleRate),X=D.getChannelData(0),K=h.fadePower??1;for(let ue=0;ue<z;ue++)X[ue]=(Math.random()*2-1)*(K===1?1-ue/z:Math.pow(1-ue/z,K));C.buffer=D}else{if(!i){i=y.createBuffer(1,y.sampleRate,y.sampleRate);let z=i.getChannelData(0);for(let D=0;D<z.length;D++)z[D]=Math.random()*2-1}C.buffer=i,C.loop=!0}let H=y.createBiquadFilter();H.type=h.filterType??"lowpass",H.frequency.setValueAtTime(h.filterFreq??1200,w),h.slideTo&&H.frequency.exponentialRampToValueAtTime(Math.max(1,h.slideTo),w+h.dur),h.filterQ!==void 0&&(H.Q.value=h.filterQ);let G=y.createGain();G.gain.setValueAtTime(h.vol,w),G.gain.exponentialRampToValueAtTime(1e-4,w+h.dur),C.connect(H),H.connect(G),G.connect(T),C.start(w),C.stop(w+h.dur+.02)}catch{}}function F(h){let c=E();if(!c||o)return;h&&a.push(h);let d=()=>{if(o||c.state!=="running")return;o=!0;try{let T=c.createGain();T.gain.value=1e-4;let w=c.createOscillator();w.connect(T),T.connect(c.destination),w.start(),w.stop(c.currentTime+.01)}catch{}let y=a;a=[];for(let T of y)T()};c.state==="running"?d():_(()=>c.resume()).then(d,()=>{})}return{context:E,peek:()=>n,bus:h=>p[h]??null,setGain(h,c){u[h]=c,s(h)},setMuted(h,c){l[h]=c,s(h)},isMuted:h=>l[h],unlock:F,suspend(){let h=n;h&&_(()=>h.suspend()).catch(()=>{})},hold(){r=!0;let h=n;h&&_(()=>h.suspend()).catch(()=>{})},release(){r=!1;let h=n;h&&_(()=>h.resume()).catch(()=>{})},wake(){let h=E();return h&&h.state==="suspended"&&_(()=>h.resume()).catch(()=>{}),h},close(){let h=n;n=null;for(let c of $n)delete p[c];o=!1,a=[],i=null,h&&h.state!=="closed"&&_(()=>h.close()).catch(()=>{})},tone:x,noise:v,voice:S}}function cn(e,t,n,o=.09){e.tone({at:n,freq:85,slideTo:32,slideDur:.5,dur:.85,stopPad:.05,type:"sine",vol:o,attack:.015,filter:{type:"lowpass",freq:200,slideTo:55,slideDur:.45}},t),e.tone({at:n,freq:52,slideTo:24,slideDur:.4,dur:.55,stopPad:.05,type:"triangle",vol:o*.75,attack:.02},t)}function Un(e,t,n,o=.035){e.noise({at:n,dur:.18,vol:o,source:"fade",fadePower:1.4,filterType:"bandpass",filterFreq:380,filterQ:.7},t)}function rr(e,t,n,o,r=3.2,a=.04){let i=Math.min(1.1,r*.35);e.voice({at:n,oscs:[{type:"sawtooth",freq:o},{type:"triangle",freq:o*1.498},{type:"sine",freq:o*.5}],filter:{type:"lowpass",freq:480,slideTo:280,slideDur:r,slide:"linear"},envelope:[{ramp:"linear",to:a,at:i},{ramp:"linear",to:a*.7,at:r*.7},{ramp:"exp",to:1e-4,at:r}],dur:r,stopPad:.05},t)}function ar(e,t,n,o,r=4,a=.012){e.voice({at:n,oscs:[{type:"triangle",freq:o},{type:"sine",freq:o*1.02}],envelope:[{ramp:"linear",to:a,at:1.5},{ramp:"linear",to:a*.5,at:r*.8},{ramp:"exp",to:1e-4,at:r}],dur:r,stopPad:.05},t)}var Hi={small:{thumpGain:.11,thumpDur:.28,crackGain:.08,crackDur:.12,debrisGain:.06,debrisDur:.22,rumbleGain:.05,rumbleDur:.35,thumpFreq:70,crackFreq:420},medium:{thumpGain:.16,thumpDur:.45,crackGain:.12,crackDur:.16,debrisGain:.1,debrisDur:.4,rumbleGain:.09,rumbleDur:.65,thumpFreq:55,crackFreq:380},large:{thumpGain:.2,thumpDur:.85,crackGain:.14,crackDur:.28,debrisGain:.12,debrisDur:.7,rumbleGain:.14,rumbleDur:1.4,thumpFreq:42,crackFreq:300}};function ir(e){let t=e.settings,n=or({createContext:e.createContext}),o=null,r=[],a=null,i=!1,u=!1;function l(){let c=t();n.setMuted("sfx",!c.soundEnabled||c.soundVolume<=0),n.setGain("sfx",e.volumeToGain(c.soundVolume,"sfx"));let d=c.musicEnabled&&e.sessionActive()&&i;n.setGain("music",d?e.volumeToGain(c.musicVolume,"music"):0)}function p(){return l(),n.context()}function s(){return l(),n.isMuted("sfx")?null:n.context()}function _(){let c=t();u||!c.soundEnabled&&!c.musicEnabled||(l(),n.unlock(f))}function E(c,d){c.forEach(y=>{try{let T=y;typeof T.stop=="function"&&T.stop()}catch{}try{y.disconnect()}catch{}});try{d.disconnect()}catch{}}function g(c=!0){a&&(clearInterval(a),a=null);let d=n.peek(),y=o,T=r;if(i=!1,o=null,r=[],l(),!d||!y)return;let w=d.currentTime,C=()=>E(T,y);try{c?(y.gain.cancelScheduledValues(w),y.gain.setValueAtTime(Math.max(y.gain.value,1e-4),w),y.gain.exponentialRampToValueAtTime(1e-4,w+.9),setTimeout(C,950)):(y.gain.value=0,C())}catch{C()}}function x(){let c=t();if(i||!c.musicEnabled||c.musicVolume<=0||!e.sessionActive())return;let d=p(),y=n.bus("music");if(!d||!y)return;let T=()=>{if(i||!t().musicEnabled||!e.sessionActive())return;if(a&&(clearInterval(a),a=null),o){let Ge=o,be=r;o=null,r=[],E(be,Ge)}let w=d.createGain();w.gain.value=1e-4,w.connect(y);let C=d.createOscillator(),H=d.createOscillator(),G=d.createOscillator(),z=d.createGain(),D=d.createBiquadFilter();C.type="sawtooth",H.type="sine",G.type="triangle",C.frequency.value=36.71,H.frequency.value=55,G.frequency.value=38.89,D.type="lowpass",D.frequency.value=160,D.Q.value=.6,z.gain.value=.07,C.connect(D),H.connect(D),G.connect(D),D.connect(z),z.connect(w);let X=d.createOscillator(),K=d.createOscillator(),ue=d.createGain(),$=d.createBiquadFilter();X.type="sawtooth",K.type="triangle",X.frequency.value=73.42,K.frequency.value=87.31,$.type="lowpass",$.frequency.value=320,ue.gain.value=.028,X.connect($),K.connect($),$.connect(ue),ue.connect(w);let U=d.createOscillator(),se=d.createGain();U.type="sine",U.frequency.value=.04,se.gain.value=30,U.connect(se),se.connect(D.frequency);let Q=d.currentTime;C.start(Q),H.start(Q),G.start(Q),X.start(Q),K.start(Q),U.start(Q),X.frequency.setValueAtTime(73.42,Q),K.frequency.setValueAtTime(87.31,Q),X.frequency.setValueAtTime(73.42,Q+8),K.frequency.linearRampToValueAtTime(92.5,Q+16),X.frequency.linearRampToValueAtTime(65.41,Q+24),K.frequency.linearRampToValueAtTime(98,Q+24),X.frequency.linearRampToValueAtTime(73.42,Q+32),K.frequency.linearRampToValueAtTime(87.31,Q+32),w.gain.setValueAtTime(1e-4,Q),w.gain.exponentialRampToValueAtTime(1,Q+1.2),o=w,r=[C,H,G,X,K,U,z,ue,D,$,se],i=!0,l();let me=60/50,Ue=[73.42,69.3,65.41,87.31,73.42,55,82.41,73.42],ot=[293.66,311.13,277.18,349.23],Pe=0,A=()=>{let Ge=n.peek();if(!i||!Ge||!o)return;let be=Ge.currentTime+.05,Xe=be,rt=be+me*2;cn(n,o,Xe,Pe%2===0?.11:.08),Pe%2===1?cn(n,o,rt,.06):Un(n,o,rt,.03),rr(n,o,Xe+me*.15,Ue[Pe%Ue.length]??73.42,me*3.4,.038),Pe%2===0&&ar(n,o,Xe+me*.5,ot[Pe/2%ot.length]??293.66,me*3.6,.014),Pe%4===3&&(cn(n,o,Xe+me*.75,.07),Un(n,o,Xe+me*1.1,.04)),Pe+=1};A(),a=setInterval(A,4*me*1e3-40)};d.state==="suspended"?d.resume().then(T).catch(()=>{}):T()}function f(){let c=t();!u&&e.sessionActive()&&c.musicEnabled&&c.musicVolume>0?i?l():x():g(!0)}function S({freq:c=440,freqEnd:d=null,type:y="square",duration:T=.12,gain:w=.08,delay:C=0}){n.tone({freq:c,dur:T,type:y,vol:w,slideTo:d,when:C,attack:.01})}function v({duration:c=.18,gain:d=.06,delay:y=0,filterFreq:T=900,filterType:w="bandpass"}={}){n.noise({dur:c,vol:d,when:y,filterFreq:T,filterType:w,source:"fade"})}function F(c,d=0){if(!s())return;let y=Hi[c];S({freq:y.thumpFreq,freqEnd:Math.max(18,y.thumpFreq*.35),type:"sine",duration:y.thumpDur,gain:y.thumpGain,delay:d}),S({freq:y.thumpFreq*1.4,freqEnd:24,type:"triangle",duration:y.thumpDur*.85,gain:y.thumpGain*.55,delay:d+.02}),v({duration:y.crackDur,gain:y.crackGain,delay:d+.03,filterFreq:y.crackFreq,filterType:"bandpass"}),S({freq:900,freqEnd:120,type:"square",duration:y.crackDur*.7,gain:y.crackGain*.45,delay:d+.03}),v({duration:y.debrisDur,gain:y.debrisGain,delay:d+.06,filterFreq:1800,filterType:"highpass"}),v({duration:y.debrisDur*.8,gain:y.debrisGain*.7,delay:d+.08,filterFreq:700,filterType:"bandpass"}),S({freq:48,freqEnd:20,type:"sine",duration:y.rumbleDur,gain:y.rumbleGain,delay:d+.1}),v({duration:y.rumbleDur*.9,gain:y.rumbleGain*.65,delay:d+.12,filterFreq:180,filterType:"lowpass"})}let h={projectile(){S({freq:980,freqEnd:240,type:"sawtooth",duration:.14,gain:.07}),S({freq:1400,freqEnd:400,type:"square",duration:.08,gain:.035,delay:.01})},hit(){S({freq:160,freqEnd:70,type:"sawtooth",duration:.1,gain:.05}),v({duration:.08,gain:.04})},heal(){S({freq:280,freqEnd:540,type:"sine",duration:.18,gain:.05}),S({freq:420,freqEnd:660,type:"triangle",duration:.14,gain:.03,delay:.04})},ko(){F("small")},nuke(){F("large")},raptor(){S({freq:220,freqEnd:70,type:"sawtooth",duration:.7,gain:.09}),S({freq:140,freqEnd:55,type:"triangle",duration:.85,gain:.07,delay:.04}),v({duration:.55,gain:.08,filterFreq:700,filterType:"lowpass"}),v({duration:.4,gain:.05,delay:.15,filterFreq:2400,filterType:"highpass"}),[.45,.58,.7,.82,.94,1.06].forEach((c,d)=>{S({freq:980-d*40,freqEnd:180,type:"square",duration:.07,gain:.055,delay:c}),v({duration:.08,gain:.045,delay:c,filterFreq:1600})}),F("medium",.72),F("medium",1)},grenadeArm(){S({freq:640,freqEnd:420,type:"square",duration:.09,gain:.05}),S({freq:880,freqEnd:660,type:"triangle",duration:.07,gain:.035,delay:.04}),v({duration:.06,gain:.03,filterFreq:2200})},grenade(){S({freq:420,freqEnd:140,type:"sawtooth",duration:.14,gain:.05}),v({duration:.12,gain:.05,filterFreq:1800,filterType:"highpass"}),F("medium",.08)},missile(){S({freq:380,freqEnd:110,type:"sawtooth",duration:.22,gain:.055}),v({duration:.14,gain:.04,filterFreq:1400,filterType:"highpass"})},trackerMissile(){S({freq:520,freqEnd:160,type:"sawtooth",duration:.22,gain:.07}),v({duration:.14,gain:.04,filterFreq:2200,filterType:"highpass"})},introLaunch(){S({freq:160,freqEnd:70,type:"sawtooth",duration:.28,gain:.06})},nukeLaunch(){S({freq:180,freqEnd:90,type:"sawtooth",duration:.2,gain:.05})}};return{sfx(c){u||(l(),h[c]())},prime(){u||s()},unlock:_,syncMusic:f,settingChanged(c){let d=t();(c==="musicEnabled"||c==="musicVolume")&&f(),(c==="soundEnabled"||c==="soundVolume")&&p(),c==="soundEnabled"&&!d.soundEnabled&&!d.musicEnabled&&n.suspend(),(c==="soundEnabled"||c==="musicEnabled")&&(d.soundEnabled||d.musicEnabled)&&p()},pageHide(){u=!0,g(!1),n.hold()},pageShow(){u&&(u=!1,n.release(),f())},pageClose(){u=!0,g(!1),n.close()}}}function Ft(e){return(e.key==="q"||e.key==="Q")&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.isComposing}var Oi=new Set(["range","checkbox","radio","button","submit","reset","image","color","file"]);function dn(e){let t=e;return t?t.isContentEditable||t.tagName==="SELECT"?!0:t.tagName==="INPUT"&&t.type&&Oi.has(t.type)?!1:(t.tagName==="INPUT"||t.tagName==="TEXTAREA")&&!t.readOnly:!1}var Ni=1e4,qi=6e4,Gi=700,zi=1900;function sr(e){if(e.ctrlKey||e.metaKey||e.altKey)return null;if(Ft(e))return e.repeat?null:"disarm";let t=(e.key??"").toLowerCase();return t==="r"?"raptor":t==="g"?"grenade":null}function Vi(e,t){return Math.max(0,e-t)}function lr(e,t){let n=Vi(e,t);return n>0?Math.max(1,Math.ceil(n/1e3)):0}function cr(e){let t=!1,n=!1,o=[];function r(){o.forEach(i=>e.clearTimer(i)),o=[],n=!1,e.raptorClear()}function a(){t&&(t=!1,e.changed())}return{grenadeArmed:()=>t,raptorInbound:()=>n,cancelGrenadeArm:a,clearRaptor:r,readyGrenade(){return!e.isLive()||e.now()<e.readyAt("grenade")?!1:t?(a(),!1):(t=!0,e.sfx("grenadeArm"),e.changed(),!0)},throwGrenadeAt(i,u){return!e.isLive()||!t?!1:e.now()<e.readyAt("grenade")?(a(),!1):(t=!1,e.setReadyAt("grenade",e.now()+Ni),e.changed(),e.sfx("grenade"),e.grenadeBlast(i,u),!0)},callRaptor(){return!e.isLive()||n||e.now()<e.readyAt("raptor")||!e.raptorAvailable()?!1:(r(),n=!0,e.setReadyAt("raptor",e.now()+qi),e.changed(),e.sfx("raptor"),e.raptorLaunch(),o.push(e.setTimer(()=>{!n||!e.isLive()||e.raptorStrike()},Gi)),o.push(e.setTimer(()=>{e.raptorClear(),n=!1,o=[],e.changed()},zi)),!0)},reset(){e.setReadyAt("grenade",0),e.setReadyAt("raptor",0),t=!1,r()}}}var ct={small:{radius:56,holdMs:800,fadeMs:1e3},medium:{radius:165,holdMs:2500,fadeMs:2e3},large:{radius:0,holdMs:4e3,fadeMs:3e3}};function pr(e){let t=[];function n(l){l&&(e.clearTimer(l.holdTimer),e.clearTimer(l.fadeTimer),l.el.remove(),t=t.filter(p=>p!==l))}function o(l,p){l.fadeTimer=e.setTimer(()=>{if(e.paused()){l.fadeTimer=null;return}n(l)},p)}function r(l,p){l.holdTimer=e.setTimer(()=>{if(e.paused()){l.holdTimer=null;return}a(l)},p)}function a(l){if(!l.el.isConnected){n(l);return}l.phase="fade",l.el.style.setProperty("--hole-fade-ms",`${l.fadeMs}ms`),l.el.classList.add("is-fading"),l.fadeDue=e.now()+l.fadeMs,o(l,l.fadeMs)}function i(){let l=t[0];l&&(l.phase==="hold"?(e.clearTimer(l.holdTimer),a(l)):n(l))}function u(){let{width:l,height:p}=e.viewport();return Math.min(l||400,p||400)*.42}return{punch(l,p,{radius:s,holdMs:_,fadeMs:E}={}){let g=e.field;if(!g||!e.isLive())return;let x=s!==void 0&&s>0?s:u(),f=_!==void 0&&_>0?_:ct.small.holdMs,S=E!==void 0&&E>0?E:ct.small.fadeMs;for(;t.length>=24;)i(),t.length>=24&&n(t[0]);let v=e.create("div");v.className="cylon-hole",v.setAttribute("aria-hidden","true"),v.style.left=`${l}px`,v.style.top=`${p}px`,v.style.width=`${x*2}px`,v.style.height=`${x*2}px`;let F=e.create("div");F.className="cylon-hole-glitch",v.appendChild(F),g.appendChild(v);let h={el:v,holdTimer:null,fadeTimer:null,holdDue:e.now()+f,fadeDue:0,fadeMs:S,phase:"hold"};r(h,f),t.push(h)},clearAll(){[...t].forEach(n),t=[],e.field?.querySelectorAll(".cylon-hole").forEach(l=>l.remove())},largeRadius:u,count:()=>t.length,pause(){t.forEach(l=>{e.clearTimer(l.holdTimer),e.clearTimer(l.fadeTimer),l.holdTimer=null,l.fadeTimer=null})},resume(l,p){t.forEach(s=>{s.phase==="hold"&&s.holdDue>l?(e.clearTimer(s.holdTimer),s.holdDue+=p,r(s,Math.max(0,s.holdDue-e.now()))):s.phase==="fade"&&s.fadeDue>l&&(e.clearTimer(s.fadeTimer),s.fadeDue+=p,o(s,Math.max(0,s.fadeDue-e.now())))})}}}var dr={xSpread:.55,ySpread:.7,rotMax:28},ur={xSpread:1.15,ySpread:1.25,rotMax:150},Xn={xSpread:1.35,ySpread:1.4,rotMax:220},Kn=".interest-list li, .course-list li",$i="h1, h2, h3, .page-lead, .contact-block, .interest-list, .course-list, .project-list, .project-list > li, aside, .games-hub-card, .games-home-callout, .cylon-debris",Ui=3e3;function mr(e){let t=e.doc.body,n=null;function o(){let{width:p,height:s}=e.viewport();return{vw:p||800,vh:s||600}}function r(p,s,_){let E=+((e.random()-.5)*p*_.xSpread).toFixed(1),g=+((e.random()-.5)*s*_.ySpread).toFixed(1),x=+((e.random()-.5)*_.rotMax).toFixed(1);return{sx:E,sy:g,sr:x}}function a(p,s,_,E){let g=r(s,_,E);p.style.setProperty("--sx",`${g.sx.toFixed(1)}px`),p.style.setProperty("--sy",`${g.sy.toFixed(1)}px`),p.style.setProperty("--sr",`${g.sr.toFixed(1)}deg`)}let i=()=>{let{vw:p,vh:s}=o();return r(p,s,Xn)};function u(p,s,_){let E=(e.random()-.5)*s*.35,g=(e.random()-.5)*_*.4,x=(e.random()-.5)*120;p.style.setProperty("--mx",`${E.toFixed(1)}px`),p.style.setProperty("--my",`${g.toFixed(1)}px`),p.style.setProperty("--mr",`${x.toFixed(1)}deg`)}let l=()=>t.dataset.cylonScattered==="1";return{scattered:l,scatter(){if(l()||e.reduceMotion)return;let{vw:p,vh:s}=o(),_=[...e.doc.querySelectorAll(".page-panel")];_.forEach(E=>{if(E.classList.add("cylon-scatter-panel"),a(E,p,s,dr),E.querySelectorAll($i).forEach(f=>{f.classList.add("cylon-scatter-block"),a(f,p,s,ur)}),E.querySelectorAll(Kn).forEach(f=>u(f,p,s)),e.glyphs)return;let g=e.doc.createTreeWalker(E,NodeFilter.SHOW_TEXT,{acceptNode(f){return!f.nodeValue||!/\S/.test(f.nodeValue)||f.parentElement?.closest(".cylon-scatter-char")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),x=[];for(;g.nextNode();)x.push(g.currentNode);x.forEach(f=>{let S=e.doc.createDocumentFragment();for(let v of f.nodeValue??""){if(v===" "||v===`
`||v==="	"){S.appendChild(e.doc.createTextNode(v));continue}let F=e.doc.createElement("span");F.className="cylon-scatter-char",F.textContent=v,a(F,p,s,Xn),S.appendChild(F)}f.parentNode?.replaceChild(S,f)})}),e.glyphs?.scatter(_,i),t.dataset.cylonScattered="1"},restore(){l()&&(e.glyphs?.restore(),e.doc.querySelectorAll(".cylon-scatter-char").forEach(p=>{p.replaceWith(e.doc.createTextNode(p.textContent||""))}),e.doc.querySelectorAll(Kn).forEach(p=>{p.style.removeProperty("--mx"),p.style.removeProperty("--my"),p.style.removeProperty("--mr")}),e.doc.querySelectorAll(".cylon-scatter-panel, .cylon-scatter-block").forEach(p=>{p.classList.remove("cylon-scatter-panel","cylon-scatter-block"),p.style.removeProperty("--sx"),p.style.removeProperty("--sy"),p.style.removeProperty("--sr")}),t.dataset.cylonScattered="0")},reshuffle(){if(!l()||e.reduceMotion)return;let{vw:p,vh:s}=o();t.classList.add("cylon-glyphs-blowing"),e.doc.querySelectorAll(".cylon-scatter-panel").forEach(_=>{a(_,p,s,dr)}),e.doc.querySelectorAll(".cylon-scatter-block").forEach(_=>{a(_,p,s,ur)}),e.doc.querySelectorAll(".cylon-scatter-char").forEach(_=>{a(_,p,s,Xn)}),e.doc.querySelectorAll(Kn).forEach(_=>u(_,p,s)),e.glyphs?.reshuffle(i),e.clearTimer(n),n=e.setTimer(()=>{t.classList.remove("cylon-glyphs-blowing"),n=null},Ui)},cancelReshuffleSettle(){e.clearTimer(n),n=null}}}function fr(e){let t=0,n=!1;function o(){e.body.classList.remove("cylon-intro-hero");let s=e.titleEl;s&&(s.hidden=!0,s.setAttribute("aria-hidden","true"),s.classList.remove("is-hero","is-settling","is-exit"),s.style.cssText="")}function r(){let s=e.titleEl;if(!s)return{x:0,y:0};let _=(window.innerWidth||1)*.5,E=(window.innerHeight||1)*.48;return s.style.left=`${_}px`,s.style.top=`${E}px`,s.style.right="auto",s.style.bottom="auto",s.style.transform="translate(-50%, -50%)",s.style.transformOrigin="center center",{x:_,y:E}}function a(){let s=e.titleEl;s&&(s.textContent=e.title,s.hidden=!1,s.setAttribute("aria-hidden","false"),s.classList.remove("is-exit","is-settling","is-hero"),s.style.cssText="",r(),e.body.classList.add("cylon-intro-hero"),s.offsetWidth,s.classList.add("is-hero"))}function i(){return window.matchMedia("(max-width: 819px)").matches}function u(s){let _=e.titleEl;if(s!==t||!_||_.hidden)return;let E=e.brandEl;if(e.reduceMotion||i()||!E){_.classList.add("is-exit");let C=e.reduceMotion?0:450;setTimeout(()=>{s===t&&o()},C);return}let g=r();_.offsetWidth;let x=_.getBoundingClientRect(),f=E.getBoundingClientRect(),S=x.left+x.width/2,v=x.top+x.height/2,F=f.left+f.width/2,h=f.top+f.height/2,c=F-S,d=h-v,y=f.width/Math.max(x.width,1);_.classList.remove("is-hero"),_.classList.add("is-settling"),_.style.left=`${g.x}px`,_.style.top=`${g.y}px`,_.style.transform="translate(-50%, -50%) scale(1)",requestAnimationFrame(()=>{requestAnimationFrame(()=>{s===t&&(_.style.transform=`translate(calc(-50% + ${c}px), calc(-50% + ${d}px)) scale(${y})`,_.style.textShadow="none")})});let T=!1,w=C=>{C&&C.propertyName&&C.propertyName!=="transform"||T||s!==t||(T=!0,_.removeEventListener("transitionend",w),o())};_.addEventListener("transitionend",w),setTimeout(()=>w(),e.settleMs+120)}function l(){t+=1,n=!1,e.setNukeInFlight(!1),e.nukeEl&&e.nukeEl.classList.remove("is-flying"),o()}function p(){let s=++t;n=!0,e.startRun(),e.setNukeInFlight(!1),o();let _=(window.innerWidth||1)/2,E=(window.innerHeight||1)*.48,g=T=>{let w=()=>{if(!(s!==t||!e.enabled())){if(e.paused()){setTimeout(w,100);return}T()}};w()},x=()=>{n=!1,e.beginCombat()},f=(T,w)=>{if(s!==t||!e.enabled())return;e.setNukeInFlight(!1),e.nukeEl&&e.nukeEl.classList.remove("is-flying"),e.detonate(T,w),a();let C=e.reduceMotion?0:520;setTimeout(()=>g(x),C);let H=e.reduceMotion?0:Math.max(900,C+e.navFadeMs+80);setTimeout(()=>g(()=>u(s)),H)},S=e.nukeEl;if(e.reduceMotion||!S){f(_,E);return}e.setNukeInFlight(!0);let v=_+(e.random()-.5)*Math.min(120,(window.innerWidth||400)*.15),F=-72,h=performance.now(),c=h,d=e.speed;S.style.left=`${v}px`,S.style.top=`${F}px`,S.classList.add("is-flying"),e.launched();let y=T=>{if(s!==t)return;if(!e.enabled()){l();return}if(e.paused()){h+=T-c,c=T,requestAnimationFrame(y);return}let w=Math.min(.05,(T-c)/1e3);c=T;let C=_-v,H=E-F,G=Math.hypot(C,H)||1,z=d*w;if(v+=C/G*Math.min(z,G),F+=H/G*Math.min(z,G),S.style.left=`${v}px`,S.style.top=`${F}px`,S.style.setProperty("--nuke-heading",`${Math.atan2(H,C)*(180/Math.PI)}deg`),G<=e.arriveRadius||T-h>=e.maxFlightMs){f(v,F);return}requestAnimationFrame(y)};requestAnimationFrame(y)}return{play:p,cancel:l,playing:()=>n}}function hr(e){let{reduceMotion:t,scrollX:n,scrollY:o}=e;function r(g,x){return g+Math.random()*(x-g)}function a(g,x){let f=document.body.style.getPropertyValue(g)||getComputedStyle(document.body).getPropertyValue(g),S=parseFloat(f);return Number.isFinite(S)?S:x}function i(g,x,f){return g+(x-g)*f}function u(g){return 90+Math.max(.05,Math.min(1.6,g))*180}function l(g,x,f){let S=document.body,v=window.innerWidth||1,F=window.innerHeight||1,h=Math.max(.05,Math.min(1,f)),c=Math.max(8,Math.min(92,g/v*100)),d=Math.max(10,Math.min(90,x/F*100)),y=Math.min(1,.55+h*.6);S.style.setProperty("--blast-x",`${i(a("--blast-x",50),c,y).toFixed(1)}%`),S.style.setProperty("--blast-y",`${i(a("--blast-y",48),d,y).toFixed(1)}%`),S.style.setProperty("--land-morph-ms",`${Math.round(280+h*420)}ms`)}function p(g,x,f=1,S={}){if(!document.body.classList.contains("cylon-world-ended")&&f<.9&&f<.99)return;let v=Math.max(.05,Math.min(1,f)),F=g+n(),h=x+o(),c=Number.isFinite(S.radius)?S.radius:null;if(v<.9){l(g,x,v),s(F,h,v,c);return}let d=document.body,y=window.innerWidth||1,T=window.innerHeight||1,w=Math.max(8,Math.min(92,g/y*100)),C=Math.max(10,Math.min(90,x/T*100));d.style.setProperty("--blast-x",`${i(a("--blast-x",50),w,Math.min(1,v*1.15)).toFixed(1)}%`),d.style.setProperty("--blast-y",`${i(a("--blast-y",48),C,Math.min(1,v*1.15)).toFixed(1)}%`),d.style.setProperty("--crack-a",`${i(a("--crack-a",118),r(70,160),v).toFixed(1)}deg`),d.style.setProperty("--crack-b",`${i(a("--crack-b",28),r(8,70),v).toFixed(1)}deg`),d.style.setProperty("--crack-c",`${i(a("--crack-c",155),r(120,200),v).toFixed(1)}deg`),d.style.setProperty("--crack-grain",`${i(a("--crack-grain",-18),r(-40,12),v).toFixed(1)}deg`),d.style.setProperty("--scar-1",`${i(a("--scar-1",42),r(28,48),v).toFixed(1)}%`),d.style.setProperty("--scar-2",`${i(a("--scar-2",61),r(52,72),v).toFixed(1)}%`),d.style.setProperty("--scar-3",`${i(a("--scar-3",33),r(22,42),v).toFixed(1)}%`),d.style.setProperty("--scar-4",`${i(a("--scar-4",72),r(58,82),v).toFixed(1)}%`),d.style.setProperty("--scar-5",`${i(a("--scar-5",18),r(12,30),v).toFixed(1)}%`),d.style.setProperty("--scar-6",`${i(a("--scar-6",78),r(68,88),v).toFixed(1)}%`),d.style.setProperty("--ash-1-x",`${i(a("--ash-1-x",18),r(8,40),v).toFixed(1)}%`),d.style.setProperty("--ash-1-y",`${i(a("--ash-1-y",22),r(10,40),v).toFixed(1)}%`),d.style.setProperty("--ash-2-x",`${i(a("--ash-2-x",82),r(58,92),v).toFixed(1)}%`),d.style.setProperty("--ash-2-y",`${i(a("--ash-2-y",70),r(45,85),v).toFixed(1)}%`),d.style.setProperty("--ash-3-x",`${i(a("--ash-3-x",50),r(30,70),v).toFixed(1)}%`),d.style.setProperty("--ash-3-y",`${i(a("--ash-3-y",100),r(75,105),v).toFixed(1)}%`);let H=i(a("--land-shift-x",0),r(-28,28),v),G=i(a("--land-shift-y",0),r(-22,22),v),z=i(a("--land-scale",1),r(1.02,1.1),v),D=i(a("--land-rot",0),r(-2.8,2.8),v);d.style.setProperty("--land-shift-x",`${H.toFixed(1)}px`),d.style.setProperty("--land-shift-y",`${G.toFixed(1)}px`),d.style.setProperty("--ash-drift-x",`${(-H*.35).toFixed(1)}px`),d.style.setProperty("--ash-drift-y",`${(-G*.35).toFixed(1)}px`),d.style.setProperty("--land-rot",`${D.toFixed(2)}deg`),d.style.setProperty("--land-scale",`${z.toFixed(3)}`),d.style.setProperty("--ash-scale",`${(1+(z-1)*.4).toFixed(3)}`),d.style.setProperty("--land-morph-ms",`${Math.round(420+v*930)}ms`),s(F,h,v,c)}function s(g,x,f=1,S=null){if(document.body.dataset.cylonScattered!=="1"||t)return;let v=Math.max(.05,Math.min(1.6,f)),F=Number.isFinite(S)&&S>0?S:u(v),h=v<.95,c=h?".cylon-scatter-char":".cylon-scatter-char, .cylon-scatter-block, .cylon-scatter-panel",d=[...document.querySelectorAll(c)],y=Math.min(1,.7+v*.3),T=55*v,w=48+200*v,C=n(),H=o(),G=(D,X,K,ue,$)=>{let U=D-g,se=X-x,Q=Math.hypot(U,se)||1;if(Q>F||Math.random()>y)return null;let Te=Math.max(0,1-Q/F),me=r(w*.5,w)*Te;return{sx:+(K+U/Q*me+r(-T,T)*Te).toFixed(1),sy:+(ue+se/Q*me+r(-T,T)*Te).toFixed(1),sr:+($+r(-32,32)*v*Te).toFixed(1)}};d.filter(D=>!(D.classList.contains("cylon-scatter-panel")&&v<1.1)).map(D=>({el:D,rect:D.getBoundingClientRect()})).forEach(({el:D,rect:X})=>{let K=G(X.left+X.width/2+C,X.top+X.height/2+H,parseFloat(D.style.getPropertyValue("--sx"))||0,parseFloat(D.style.getPropertyValue("--sy"))||0,parseFloat(D.style.getPropertyValue("--sr"))||0);K&&(D.style.setProperty("--sx",`${K.sx.toFixed(1)}px`),D.style.setProperty("--sy",`${K.sy.toFixed(1)}px`),D.style.setProperty("--sr",`${K.sr.toFixed(1)}deg`))}),e.glyphs&&(e.glyphs.kick((D,X,K)=>G(D,X,K.sx,K.sy,K.sr)),h||e.glyphs.poke(3500))}function _(g,x,f=1,S={}){p(g-n(),x-o(),f,S)}function E(){["--blast-x","--blast-y","--crack-a","--crack-b","--crack-c","--crack-grain","--scar-1","--scar-2","--scar-3","--scar-4","--scar-5","--scar-6","--ash-1-x","--ash-1-y","--ash-2-x","--ash-2-y","--ash-3-x","--ash-3-y","--land-shift-x","--land-shift-y","--ash-drift-x","--ash-drift-y","--land-rot","--land-scale","--ash-scale","--land-morph-ms"].forEach(g=>document.body.style.removeProperty(g))}return{randRange:r,rearrangeLandscape:p,rearrangeLandscapePage:_,disruptGlyphs:s,clearLandscapeVars:E}}function yr(e){let{eye:t,glare:n,game:o,settings:r,mouse:a,state:i,isGameLive:u,EYE_DISORIENT_MS:l}=e,p=50,s=!1,_=5.2,E=0,g=0;function x(){let y=t.parentElement;if(!y)return 50;let T=t.getBoundingClientRect(),w=y.getBoundingClientRect();return w.width<1?50:(T.left+T.width/2-w.left)/w.width*100}function f(){return i.pending(o.schedule.eyeDisorientedUntil,Date.now())}function S(y){(!u()||!r.eyeEnabled||f())&&(y=!1),y&&!s&&(p=x(),E=Math.asin(Math.max(-1,Math.min(1,(p-50)/45))),g=performance.now()),s=y,t.classList.toggle("is-tracking",y&&!f()),n&&n.classList.toggle("is-active",y&&!f()),!y&&!f()&&(t.style.left="",n&&(n.style.opacity="",n.style.height="",n.style.top="",n.style.transform=""))}function v(y=l){o.schedule.eyeDisorientedUntil=Date.now()+y,s=!1,t.classList.remove("is-tracking"),t.classList.add("is-disoriented"),p=x(),n&&(n.classList.add("is-active"),n.classList.add("is-disoriented"))}function F(){t.classList.contains("is-disoriented")&&!f()&&(t.classList.remove("is-disoriented"),n&&n.classList.remove("is-disoriented"),s||(t.style.left="",n&&n.classList.remove("is-active")))}function h(){if(F(),f()){let y=performance.now()/1e3,T=50+Math.sin(y*6.8)*30+Math.sin(y*15.4)*14+Math.sin(y*2.7)*10+Math.sin(y*31)*4,w=Math.min(95,Math.max(5,T));if(p+=(w-p)*.22,t.style.left=`${p}%`,n){n.classList.add("is-active"),n.style.left=`${p/100*window.innerWidth}px`;let C=.45+.55*(.5+.5*Math.sin(y*22));n.style.height=`${Math.min(window.innerHeight*.28,176)*C}px`,n.style.opacity=String(.35+.55*C)}}else if(s&&r.eyeEnabled){let y=performance.now();if(E+=Math.min(.05,(y-g)/1e3)*(Math.PI*2/_),g=y,p=50+45*Math.sin(E),t.style.left=`${p}%`,n){let T=d(),w=T.y+t.getBoundingClientRect().height*.2,C=a.clientX-T.x,H=Math.max(1,a.clientY-w);n.style.opacity="",n.style.left=`${T.x}px`,n.style.top=`${w}px`;let G=Math.hypot(C,H),z=Math.min(G*.85,140+G*.25);n.style.height=`${G}px`,n.style.setProperty("--glare-reach",`${z/Math.max(1,G)*100}%`),n.style.opacity=String(Math.max(.3,Math.min(1,1-G/(Math.hypot(window.innerWidth,window.innerHeight)*1.2)))),n.style.transform=`translateX(-50%) rotate(${-Math.atan2(C,H)}rad)`}}requestAnimationFrame(h)}function c(){o.schedule.eyeDisorientedUntil=0,t&&t.classList.remove("is-disoriented"),n&&(n.classList.remove("is-disoriented"),s||n.classList.remove("is-active"))}function d(){let y=t.getBoundingClientRect();return{x:y.left+y.width/2,y:y.top+y.height/2}}return{isEyeDisoriented:f,setEyeTracking:S,disorientEye:v,clearEyeDisorient:c,eyeClientCenter:d,updateEye:h}}function gr(e){let{reticleEl:t,mouse:n,lastAim:o,game:r,settings:a,coarsePointer:i,IDLE_MS:u,isGameLive:l,isEyeDisoriented:p,setEyeTracking:s,audio:_,abilities:E,scrollX:g,scrollY:x}=e;function f(){n.pageX=n.clientX+g(),n.pageY=n.clientY+x()}function S(){!t||t.hidden||(t.style.transform=`translate(${n.clientX}px, ${n.clientY}px)`)}function v(w,C){let H=window.innerWidth||1,G=window.innerHeight||1;n.clientX=Math.min(H-8,Math.max(8,w)),n.clientY=Math.min(G-8,Math.max(8,C)),f(),n.t=performance.now(),S(),o.clientX=n.clientX,o.clientY=n.clientY,o.t=performance.now(),l()&&a.eyeEnabled&&!p()&&(s(!0),clearTimeout(r.idleTimer),r.idleTimer=setTimeout(()=>s(!1),u))}function F(){if(!t)return;let w=l();t.hidden=!w,t.setAttribute("aria-hidden",w?"false":"true"),t.classList.toggle("is-mouse-follow",w&&!i),w&&S()}function h(){v(window.innerWidth/2,window.innerHeight*.42)}function c(w){return!w||!w.closest?!1:!!w.closest(".site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel")}function d(w){_.prime(),!(r.reticlePointerId!=null&&w.pointerId===r.reticlePointerId)&&(i&&w.pointerType==="touch"||c(w.target)||v(w.clientX,w.clientY))}function y(w){r.reticlePointerId==null||w&&w.pointerId!==r.reticlePointerId||(r.draggingReticle=!1,r.reticlePointerId=null,t?.classList.remove("is-dragging"))}function T(){if(!t||!i)return;t.addEventListener("pointerdown",C=>{l()&&(C.button!=null&&C.button!==0||r.reticlePointerId==null&&(E.grenadeArmed()||(C.preventDefault(),r.draggingReticle=!0,r.reticlePointerId=C.pointerId,t.classList.add("is-dragging"),v(C.clientX,C.clientY))))});let w=C=>{r.reticlePointerId==null||C.pointerId!==r.reticlePointerId||(C.preventDefault(),v(C.clientX,C.clientY))};window.addEventListener("pointermove",w,{passive:!1}),window.addEventListener("pointerup",y,!0),window.addEventListener("pointercancel",y,!0)}return{syncMousePageFromClient:f,paintReticle:S,syncReticleVisibility:F,resetReticleToCenter:h,onPointerMove:d,bindReticle:T}}function br(e){let{game:t,settings:n,mouse:o,lastAim:r,state:a,rules:i,playfield:u,field:l,ambushUnder:p,missileEl:s,nukeEl:_,nukeMissileEl:E,scoreEl:g,audio:x,intro:f,abilities:S,holes:v,debris:F,punchHole:h,HOLE_PRESETS:c,isGameLive:d,isEyeDisoriented:y,eyeClientCenter:T,syncMousePageFromClient:w,rearrangeLandscape:C,rearrangeLandscapePage:H,disruptGlyphs:G,randRange:z,registerHit:D,resizeBattlefield:X,scrollX:K,scrollY:ue,BOT_HARD_CAP:$,BOT_SIZE:U,LINK_PAD:se,HIT_RADIUS:Q,BOLT_HIT_RADIUS:Te,NUKE_DIRECT_HIT_RADIUS:me,NUKE_SPEED:Ue,NUKE_ARRIVE_RADIUS:ot,NUKE_MAX_FLIGHT_MS:Pe,MISSILE_SPEED:A,MISSILE_ARRIVE:Ge,MISSILE_MAX_FLIGHT_MS:be,MISSILE_BLAST_RADIUS:Xe,SMALL_WEAPON_SCALE:rt,MISSILE_WEAPON_SCALE:Fe}=e,ce=0,at=null,je=[],Je=null,it=[];function Ke(){let m=document.documentElement;return{w:m.clientWidth,h:Math.max(document.body.offsetHeight,m.clientHeight)}}function Ze(){let m=p?[...p.querySelectorAll(".cylon-bot")]:[],M=l?[...l.querySelectorAll(".cylon-bot")]:[];return m.concat(M)}function At(){return i.killLevel(t.run.koScore)}function ut(){return i.groundMissileCap(t.run.koScore)}function vt(){return i.trackerMissileCap(t.run.koScore)}function k(){return i.trackerMissileChance(t.run.koScore)}function R(m=null){return je.filter(M=>M.alive?m==null?!0:M.tracker===m:!1).length}function B(m){return m?R(!0)<vt():R(!1)<ut()}function N(){it.forEach(m=>clearTimeout(m)),it=[]}function O(){clearTimeout(Je),Je=null,N(),je.forEach(m=>{m.alive=!1,m.el.remove()}),je=[],s&&s.classList.remove("is-flying","is-tracker")}function W(){let m=window.innerWidth||800,M=Math.max(24,Math.min(56,m*.04)),I=Math.max(80,m-M*2),q=8+Math.random()*22,te=je.filter(ne=>ne.alive).map(ne=>{let ye=parseFloat(ne.el.style.left);return Number.isFinite(ye)?ye:ne.originX||m/2}),re=12,j=[];for(let ne=0;ne<re;ne++)j.push(M+(ne+.5)/re*I);if(j.push(M+Math.random()*I),j.push(M+Math.random()*I),j.push(M+Math.random()*I),!te.length&&Math.random()<.28){let ne=T();return{x:Math.min(m-M,Math.max(M,ne.x+(Math.random()-.5)*64)),y:Math.min(q+18,Math.max(6,ne.y-36))}}let Ee=j[0],le=-1/0;for(let ne of j){let ye;if(!te.length)ye=Math.abs(ne-m/2)/(m/2)*40+Math.random()*80;else{let _e=1/0;for(let Ae of te)_e=Math.min(_e,Math.abs(ne-Ae));ye=_e*(1+te.length*.35)+Math.random()*36}ye>le&&(le=ye,Ee=ne)}return{x:Ee,y:q}}function V(m,M,I){m&&(m.alive=!1,m.el.remove(),je=je.filter(j=>j!==m&&j.alive));let q=M+window.scrollX,Z=I+window.scrollY;x.sfx("ko");let te=document.createElement("div");te.className="cylon-missile-blast",te.style.left=`${q}px`,te.style.top=`${Z}px`,te.setAttribute("aria-hidden","true"),l.appendChild(te),setTimeout(()=>te.remove(),420),h(q,Z,c.small),H(q,Z,Fe),w(),Math.hypot(o.clientX-M,o.clientY-I)<=Xe&&D(2)}function oe({forceTracker:m=!1,forceGround:M=!1,fromPair:I=!1}={}){if(!d()||y())return!1;let q=!1;if(M){if(!B(!1))return!1}else if(m){if(q=B(!0),!q)return!1}else if(q=Math.random()<k()&&B(!0),!q&&!B(!1))return!1;let Z=performance.now()-r.t<4e3,te=Z?r.clientX:o.clientX,re=Z?r.clientY:o.clientY,j=document.createElement("div");j.className="cylon-small-missile is-flying"+(q?" is-tracker":""),j.setAttribute("aria-hidden","true"),document.body.appendChild(j);let Ee=W(),le=Ee.x,ne=Ee.y,ye={el:j,tracker:q,alive:!0,originX:le};je.push(ye);let _e=performance.now(),Ae=_e;j.style.left=`${le}px`,j.style.top=`${ne}px`,x.prime(),x.sfx(q?"trackerMissile":"missile");let we=ge=>{if(!ye.alive)return;if(t.paused||!n.gameEnabled||t.run.gameOver){_e+=ge-Ae,Ae=ge,requestAnimationFrame(we);return}let Re=Math.min(.05,(ge-Ae)/1e3);Ae=ge;let He=q?o.clientX:te,We=q?o.clientY:re,Ne=He-le,$e=We-ne,tt=Math.hypot(Ne,$e)||1,Dt=A*Re;if(le+=Ne/tt*Math.min(Dt,tt),ne+=$e/tt*Math.min(Dt,tt),j.style.left=`${le}px`,j.style.top=`${ne}px`,j.style.transform=`rotate(${Math.atan2($e,Ne)*(180/Math.PI)}deg)`,tt<=Ge||ge-_e>=be){V(ye,le,ne);return}requestAnimationFrame(we)};if(requestAnimationFrame(we),q&&!I&&vt()>=2&&B(!0)&&Math.random()<.45&&(clearTimeout(Je),Je=setTimeout(()=>{Je=null,!(!d()||t.paused||y())&&oe({forceTracker:!0,fromPair:!0})},280+Math.random()*320)),!q&&!I&&!M){let ge=At(),Re=ut()-R(!1),He=Math.min(Re,ge<2?0:ge<5?1:2);if(He>0&&Math.random()<.35+Math.min(.4,ge*.04)){let We=1+(He>1&&Math.random()<.3+Math.min(.35,ge*.03)?1:0);for(let Ne=0;Ne<Math.min(We,He);Ne++){let $e=90+Ne*(140+Math.random()*160),tt=setTimeout(()=>{it=it.filter(Dt=>Dt!==tt),!(!d()||t.paused||y())&&oe({forceGround:!0,fromPair:!0})},$e);it.push(tt)}}}return!0}function de(m,M){return u.inflate(m,M)}function ve(m){return{left:m.left+K(),top:m.top+ue(),right:m.right+K(),bottom:m.bottom+ue()}}function xe(){let m=document.querySelectorAll('a, button, input, select, textarea, label, summary, [role="link"], [role="button"]'),M=[];return m.forEach(I=>{if(I.closest(".cylon-battlefield")||I.classList.contains("cylon-bot")||I.closest("#cylon-reticle")||I.closest(".cylon-settings"))return;let q=I.getBoundingClientRect();q.width<2||q.height<2||M.push(de(ve(q),se))}),M}function fe(){let m=document.querySelector(".site-nav");return u.visibleBounds({scrollX:K(),scrollY:ue(),width:document.documentElement.clientWidth||window.innerWidth||1,height:window.innerHeight||1,navBottom:m?m.getBoundingClientRect().bottom:70},U)}function Me(m,M){return u.clampToBounds(fe(),m,M)}function ee(m,M){return u.isInBounds(fe(),m,M)}function J(m,M,I){return u.isSafeSpot(m,M,I,Ke(),U)}function Se(m){let M=m?{x:parseFloat(m.style.left)||0,y:parseFloat(m.style.top)||0}:null;return u.findSafeSpot({bounds:fe(),forbidden:xe(),doc:Ke(),bot:U},M,Math.random)}function Qe(m,M,I,q){x.sfx("projectile");let Z=document.createElement("div");Z.className="cylon-bolt",Z.setAttribute("aria-hidden","true");let te=I-m,re=q-M,j=Math.hypot(te,re)||1,Ee=Math.atan2(re,te)*(180/Math.PI);Z.style.left=`${m}px`,Z.style.top=`${M}px`,Z.style.width=`${Math.min(j,28)}px`,Z.style.transform=`rotate(${Ee}deg)`,l.appendChild(Z);let le=Math.min(.55,.18+j/1800)*1e3,ne=performance.now(),ye=ne,_e=!1,Ae=(Re,He,{struck:We=!1}={})=>{_e||(_e=!0,Z.remove(),De(Re,He,{sound:!1}),We&&D())},we=Z.animate([{left:`${m}px`,top:`${M}px`,opacity:1,width:"14px"},{left:`${I}px`,top:`${q}px`,opacity:.85,width:"22px"}],{duration:le,easing:"linear",fill:"forwards"}),ge=Re=>{if(_e)return;if(!n.gameEnabled||t.run.gameOver){try{we.cancel()}catch{}Ae(I,q,{struck:!1});return}if(t.paused){ne+=Re-ye,ye=Re;try{we.pause()}catch{}requestAnimationFrame(ge);return}try{we.playState==="paused"&&we.play()}catch{}ye=Re;let He=Math.min(1,(Re-ne)/le),We=m+(I-m)*He,Ne=M+(q-M)*He;if(w(),Math.hypot(o.pageX-We,o.pageY-Ne)<=Te){try{we.cancel()}catch{}Ae(We,Ne,{struck:!0});return}He<1&&requestAnimationFrame(ge)};requestAnimationFrame(ge),we.onfinish=()=>{if(_e)return;w();let Re=Math.hypot(o.pageX-I,o.pageY-q)<=Q;Ae(I,q,{struck:Re})}}function De(m,M,{sound:I=!0}={}){if(!l)return;I&&n.soundEnabled&&(x.prime(),x.sfx("projectile"));let q=document.createElement("div");q.className="cylon-impact",q.style.left=`${m}px`,q.style.top=`${M}px`,q.setAttribute("aria-hidden","true"),l.appendChild(q),h(m,M,c.small),H(m,M,rt),setTimeout(()=>q.remove(),300)}function ze(m){return!m||!m.closest?!0:!!(m.closest(".site-nav")||m.closest(".cylon-help")||m.closest(".cylon-gameover")||m.closest(".cylon-settings-panel")||m.closest(".cylon-bot")||m.closest("#cylon-reticle")||m.closest("#cic-enter-btn"))}function xt(){window.addEventListener("pointerdown",m=>{d()&&(S.grenadeArmed()||f.playing()||m.button!=null&&m.button!==0||t.reticlePointerId!=null&&m.pointerId===t.reticlePointerId||ze(m.target)||(m.preventDefault(),De(m.pageX,m.pageY)))})}function pe(){t.run=a.recordKill(t.run),g&&(g.textContent=String(t.run.koScore),g.classList.remove("is-bump"),g.offsetWidth,g.classList.add("is-bump"),setTimeout(()=>g.classList.remove("is-bump"),180))}function Ce(m){m._shootInterval&&clearInterval(m._shootInterval),m._patrolInterval&&clearInterval(m._patrolInterval),m._shootInterval=null,m._patrolInterval=null}function Oe(m){if(m.dataset.ko==="1")return;m.dataset.ko="1",m.classList.add("is-ko"),Ce(m),x.sfx("ko");let M=(parseFloat(m.style.left)||0)+U.w/2,I=(parseFloat(m.style.top)||0)+U.h/2;De(M,I,{sound:!1}),pe(),ce=Math.max(0,ce-1),setTimeout(()=>m.remove(),560)}function Ve(){Ze().forEach(m=>{Ce(m),m.remove()}),l.querySelectorAll(".cylon-bolt, .cylon-impact").forEach(m=>m.remove()),v.clearAll(),ce=0}function qt(){Ze().forEach((M,I)=>{setTimeout(()=>{M.isConnected&&M.dataset.ko!=="1"&&Oe(M)},I*70)}),l.querySelectorAll(".cylon-bolt").forEach(M=>M.remove())}function Gt(m){return u.marchOrigin(fe(),m,U)}function et(m){let M=xe(),I=parseFloat(m.style.left)||0,q=parseFloat(m.style.top)||0;if(!ee(I,q)||!J(I,q,M)){let Z=Se(m);return Z?(m.style.left=`${Z.x}px`,m.style.top=`${Z.y}px`,!0):!1}return!0}function Zt(m){if(!d()||m.dataset.ko==="1"||!m.isConnected||m.classList.contains("is-marching"))return;let M=Se(m);if(!M)return;let I=Me(M.x,M.y);m.classList.add("is-marching"),m.style.left=`${I.x}px`,m.style.top=`${I.y}px`,setTimeout(()=>{!m.isConnected||m.dataset.ko==="1"||(m.classList.remove("is-marching"),et(m))},920)}function Ct(){d()&&Ze().forEach(m=>{if(m.dataset.ko==="1"||!m.isConnected||m.classList.contains("is-hiding"))return;let M=parseFloat(m.style.left)||0,I=parseFloat(m.style.top)||0;ee(M,I)||Zt(m)})}function Lt(){let m=document.querySelector("#nav-main.is-active, #nav-contact.is-active")||document.getElementById("nav-main");if(!m)return null;let M=[...m.querySelectorAll("h1, h2, h3, p, li")];if(!M.length)return null;let I=M.filter(Z=>{let te=Z.getBoundingClientRect();return te.width>8&&te.height>8&&te.bottom>60&&te.top<(window.innerHeight||1)-20&&te.right>0&&te.left<(window.innerWidth||1)}),q=I.length?I:M;for(let Z=0;Z<12;Z++){let re=q[Math.floor(Math.random()*q.length)].getBoundingClientRect();if(re.width<8||re.height<8)continue;let j=ve(re),Ee=j.left+Math.random()*Math.max(8,j.right-j.left-U.w),le=j.top+Math.random()*Math.max(4,Math.min(j.bottom-j.top,U.h)*.65);return{x:Ee,y:le}=Me(Ee,le),{x:Ee,y:le,edge:"ambush"}}return null}function zt(m){let M=()=>{if(!d()||m.dataset.ko==="1"||!m.isConnected||m.classList.contains("is-marching"))return;if(!et(m)){Ce(m),m.remove(),ce=Math.max(0,ce-1);return}let I=parseFloat(m.style.left)||0,q=parseFloat(m.style.top)||0;w(),Qe(I+U.w/2,q+U.h*.35,o.pageX,o.pageY)};setTimeout(M,200+Math.random()*400),m._shootInterval=setInterval(M,1500+Math.random()*1100),m._patrolInterval=setInterval(()=>Zt(m),2200+Math.random()*1800)}function Rt(){return i.botCap(t.run.koScore,$)}function he(m){m.addEventListener("pointerdown",M=>{d()&&(m.classList.contains("is-hiding")||t.reticlePointerId!=null&&M.pointerId===t.reticlePointerId||M.pointerType==="mouse"&&M.button!=null&&M.button!==0||(M.preventDefault(),M.stopPropagation(),x.prime(),Oe(m)))}),m.addEventListener("wheel",M=>{document.body.classList.contains("cylon-game-live")||window.scrollBy({top:M.deltaY,left:M.deltaX,behavior:"auto"})},{passive:!0})}function st(m){if(!(m.dataset.ko==="1"||!m.isConnected)){if(m.classList.remove("is-marching","is-hiding","is-emerging"),!et(m)){Ce(m),m.remove(),ce=Math.max(0,ce-1);return}zt(m)}}function Le(){if(!d()||ce>=Rt())return!1;X();let M=Math.random()<.4&&p?Lt():null,I=document.createElement("button");if(I.type="button",I.title="Attack drone",I.setAttribute("aria-label","Attack hostile drone"),I.innerHTML='<span class="cylon-bot-body"></span><span class="cylon-bot-legs" aria-hidden="true"><span></span><span></span></span>',he(I),M)return I.className="cylon-bot is-hiding",I.style.left=`${M.x}px`,I.style.top=`${M.y}px`,p.appendChild(I),ce+=1,setTimeout(()=>{if(I.dataset.ko==="1"||!I.isConnected||!d()){I.isConnected&&(Ce(I),I.remove(),ce=Math.max(0,ce-1));return}l.appendChild(I),I.classList.remove("is-hiding"),I.classList.add("is-emerging"),setTimeout(()=>st(I),560)},700+Math.random()*900),!0;let q=Se();if(!q)return!1;let Z=Gt(q);return I.className="cylon-bot is-marching",I.style.left=`${Z.x}px`,I.style.top=`${Z.y}px`,l.appendChild(I),ce+=1,requestAnimationFrame(()=>{I.style.left=`${q.x}px`,I.style.top=`${q.y}px`}),setTimeout(()=>st(I),950),!0}function It(){if(!d())return;let m=Rt()-ce;if(m<=0)return;let{isWave:M,count:I}=i.planWave(m,Rt(),Math.random);for(let q=0;q<I;q++)setTimeout(()=>Le(),q*(M?380:0))}function Vt(m=!1){clearTimeout(at);let M=m?2500+Math.random()*2500:3500+Math.random()*4500;at=setTimeout(()=>{d()&&It(),Vt(!1)},M)}function pt(m,M,{dealDamage:I=!0,shake:q=!0}={}){if(!_)return;x.prime(),x.sfx("nuke");let Z=window.innerWidth||1,te=window.innerHeight||1;_.style.setProperty("--nuke-x",`${m/Z*100}%`),_.style.setProperty("--nuke-y",`${M/te*100}%`),_.classList.add("is-detonating"),q&&(document.body.classList.add("is-nuke-shake"),setTimeout(()=>document.body.classList.remove("is-nuke-shake"),600));let re=m+window.scrollX,j=M+window.scrollY;h(re,j,{radius:v.largeRadius(),holdMs:c.large.holdMs,fadeMs:c.large.fadeMs});let Ee=3+Math.floor(Math.random()*3);for(let le=0;le<Ee;le++){let ne=Math.random()*Math.PI*2,ye=z(v.largeRadius()*.35,v.largeRadius()*.85),_e=re+Math.cos(ne)*ye,Ae=j+Math.sin(ne)*ye;h(_e,Ae,{radius:z(48,110),holdMs:c.medium.holdMs,fadeMs:c.medium.fadeMs})}C(m,M,1),F.scattered()?F.reshuffle():(G(re,j,1.45),setTimeout(()=>G(re,j,1.2),220),setTimeout(()=>G(re,j,.85),520)),I&&Math.hypot(o.clientX-m,o.clientY-M)<=me&&D(1,{fromNuke:!0}),setTimeout(()=>_.classList.remove("is-detonating"),2500)}function Pt(){if(!d()||y()||t.nukeInFlight)return;if(!E){pt(o.clientX,o.clientY);return}t.nukeInFlight=!0;let m=T(),M=m.x,I=m.y,q=o.clientX,Z=o.clientY,te=!y(),re=performance.now(),j=re;E.style.left=`${M}px`,E.style.top=`${I}px`,E.classList.add("is-flying"),x.prime(),x.sfx("nukeLaunch");let Ee=le=>{if(t.paused||!n.gameEnabled||t.run.gameOver){if(re+=le-j,j=le,!t.nukeInFlight)return;requestAnimationFrame(Ee);return}let ne=Math.min(.05,(le-j)/1e3);j=le,y()?te&&(te=!1):(te=!0,q=o.clientX,Z=o.clientY);let ye=q,_e=Z,Ae=ye-M,we=_e-I,ge=Math.hypot(Ae,we)||1,Re=Ue*ne;M+=Ae/ge*Math.min(Re,ge),I+=we/ge*Math.min(Re,ge),E.style.left=`${M}px`,E.style.top=`${I}px`;let He=Math.atan2(we,Ae)*(180/Math.PI);E.style.setProperty("--nuke-heading",`${He}deg`);let We=ge<=ot,Ne=le-re>=Pe;if(We||Ne){E.classList.remove("is-flying"),t.nukeInFlight=!1,pt(M,I);return}requestAnimationFrame(Ee)};requestAnimationFrame(Ee)}return{allBots:Ze,knockOutBot:Oe,clearAllBots:Ve,wipeAllBotsWithScore:qt,herdBotsIntoView:Ct,scheduleAmbush:Vt,bindPlayerMissShots:xt,canLaunchMissile:B,launchSmallMissile:oe,clearActiveMissiles:O,launchNuke:Pt,detonateNukeAt:pt}}function xr(e){let t=e.weekStartsOn==="sunday"?"Sunday":"Monday",n=e.timezone==="America/Chicago"?"Central":e.timezone==="local"?"your time":String(e.timezone||"");return`Play often — scores reset every ${t} at midnight ${n}.`}function un(e){return e.map((t,n)=>{let o=t.at?new Date(t.at):null,r=o&&!Number.isNaN(o.getTime())?o.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"}):"";return{rank:n+1,initials:(t.initials||"AAA").toString().slice(0,3).toUpperCase(),date:r,score:t.score}})}function mt(e){return typeof e=="object"&&e!==null}function wr(e,t){let n=t.log??((c,d)=>console.error(c,d)),o="",r="",a=0,i=null,u=10,l=new Set,p=[],s=[];function _(c){return{"X-Cylon-CSRF":o,...c}}function E(c){if(!mt(c))return;let d=Number(c.maxScores);d>=1&&(u=d),Array.isArray(c.blockedInitials)&&(l.clear(),c.blockedInitials.forEach(y=>{let T=String(y||"").toUpperCase();/^[A-Z]{3}$/.test(T)&&l.add(T)}))}function g(c){mt(c)&&(Array.isArray(c.scores)&&(p=c.scores),Array.isArray(c.alltime)&&(s=c.alltime))}async function x(){try{let c=await t.fetch(e,{cache:"no-store",credentials:"same-origin",headers:_()});if(!c.ok)throw new Error("bad status");let d=await c.json();if(!mt(d))throw new Error("bad body");return typeof d.csrf=="string"&&d.csrf&&(o=d.csrf),E(d.config),p=Array.isArray(d.scores)?d.scores:[],s=Array.isArray(d.alltime)?d.alltime:[],mt(d.config)?d.config:null}catch{return null}}function f(){let c=++a;return r="",i=(async()=>{try{o||await x();let d=await t.fetch(e,{method:"POST",credentials:"same-origin",headers:_({"Content-Type":"application/json"}),body:JSON.stringify({op:"start"}),cache:"no-store"}),y=await d.json().catch(()=>null);if(c!==a)return;d.ok&&mt(y)&&typeof y.run=="string"&&(r=y.run)}catch(d){n("Cylon run token failed",d)}})(),i}function S(c,d=p){if(c<1)return!1;if(!d||d.length<u)return!0;let y=1/0;for(let T of d){let w=Number(T.score)||0;w<y&&(y=w)}return c>y}function v(c){let d=mt(c)?c.alltimeRank:null;return typeof d=="number"&&Number.isInteger(d)&&d>=1?d:null}function F(c){return l.has((c||"").toUpperCase())}async function h(c,d,y){if(!c||c<1)return{saved:!1,problem:null,allTimeRank:null};let T=(d||"AAA").toUpperCase().slice(0,3).padEnd(3,"A");if(F(T))return{saved:!1,problem:"invalid-initials",allTimeRank:null};try{if(i&&await i,!r)return{saved:!1,problem:"save-failed",allTimeRank:null};let w=await t.fetch(e,{method:"POST",credentials:"same-origin",headers:_({"Content-Type":"application/json"}),body:JSON.stringify({op:"score",score:c,hits:y,initials:T,run:r}),cache:"no-store"}),C=null;try{C=await w.json()}catch{C=null}return w.status===400&&mt(C)&&C.error==="invalid initials"?(g(C),{saved:!1,problem:"invalid-initials",allTimeRank:null}):w.ok?(r="",g(C),{saved:!0,problem:null,allTimeRank:v(C)}):(g(C),{saved:!1,problem:"save-failed",allTimeRank:null})}catch{return{saved:!1,problem:null,allTimeRank:null}}}return{board:()=>p,alltime:()=>s,qualifies:S,isBlocked:F,load:x,startRun:f,submit:h}}var vr="cylon-local-scores",Wn=10;function Xi(e){let t=new Date(e.getFullYear(),e.getMonth(),e.getDate());return t.setDate(t.getDate()-t.getDay()),t.getTime()}function kr(e,t=()=>new Date){let n=[];function o(){try{let l=JSON.parse(e?.getItem(vr)??"[]");return Array.isArray(l)?l.filter(p=>mt(p)&&typeof p.score=="number"&&p.score>=1):[]}catch{return[]}}let r=l=>[...l].sort((p,s)=>s.score-p.score||Number(new Date(p.at??0))-Number(new Date(s.at??0))).slice(0,Wn),a=()=>r(n),i=()=>{let l=Xi(t());return r(n.filter(p=>Number(new Date(p.at??0))>=l))};n=o();function u(l,p=i()){return l<1?!1:p.length<Wn?!0:l>Math.min(...p.map(s=>s.score))}return{board:i,alltime:a,qualifies:u,isBlocked:()=>!1,async load(){return n=o(),{maxScores:Wn,weekStartsOn:"sunday",timezone:"local"}},async startRun(){},async submit(l,p,s){if(!l||l<1)return{saved:!1,problem:null,allTimeRank:null};let E={initials:(p||"AAA").toUpperCase().slice(0,3).padEnd(3,"A"),score:l,at:t().toISOString()};n=[...o(),E];let g=new Set([...a(),...i()]);n=n.filter(f=>g.has(f));try{e?.setItem(vr,JSON.stringify(n))}catch{}let x=a().indexOf(E);return{saved:!0,problem:null,allTimeRank:x>=0?x+1:null}}}}var ie,Tr,Ki,ft,_r,yn,Mr,mn,Ar,jn,Yn,Wi,gn={},bn=[],Yi=/^m(i|n|o|s|text|space)$/,Jn=Array.isArray,Cr=bn.slice,St=Object.assign;function vn(e){e&&e.parentNode&&e.remove()}function fn(e,t,n,o,r){var a={type:e,props:t,key:n,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r||++Tr,__i:-1,__u:0};return!r&&ie.vnode&&ie.vnode(a),a}function Ye(e){return e.children}function hn(e,t){this.props=e,this.context=t,this.__g=0}function ht(e,t){if(t==null)return e.__?ht(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])&&n.__e)return n.__e;return typeof e.type!="function"||e.props.__P?null:ht(e)}function Lr(e){if((e=e.__)&&e.__c&&!e.props.__P)return e.__e=null,e.__k.some(function(t){return t&&(e.__e=t.__e)}),Lr(e)}function Sr(e){(8&e.__g||!(e.__g|=8)||!ft.push(e)||yn++)&&_r==ie.debounceRendering||((_r=ie.debounceRendering)||queueMicrotask)(ji)}function ji(){var e,t,n,o,r,a,i,u,l;try{for(t=1;ft.length;)ft.length>t&&ft.sort(Mr),e=ft.shift(),t=ft.length,8&e.__g&&(o=void 0,r=void 0,a=(r=(n=e).__v).__e,i=[],u=[],(l=n.__P)&&((o=St({constructor:void 0},r)).__v=r.__v+1,ie.vnode&&ie.vnode(o),Qn(l,o,r,n.__n,l.namespaceURI,32&r.__u?[a]:null,i,a||ht(r),32&r.__u,u),o.__v=r.__v,o.__.__k[o.__i]=o,Dr(i,o,u),r.__=r.__e=null,o.__e!=a&&Lr(o)))}finally{ft.length=yn=0}}function Rr(e,t,n,o,r,a,i,u,l,p,s){var _,E,g,x,f,S,v=o.__k||bn,F=t.length;for(l=Ji(n,t,v,l,F),_=0;_<F;_++)(g=n.__k[_])!=null&&(E=~g.__i&&v[g.__i]||gn,g.__i=_,S=Qn(e,g,E,r,a,i,u,l,p,s),x=g.__e,(E.ref!=g.ref||8&E.__u)&&(E.ref&&Zn(E.ref,null,g,E),g.ref&&s.push(g.ref,g.__c||x,g)),f=f||x,4&g.__u?(l=Ir(g,l,e,!E.__v),E.__e&&(E.__e=null)):typeof g.type=="function"&&S!==void 0?l=S:x&&(l=x.nextSibling),g.__u&=-7);return n.__e=f,l}function Ji(e,t,n,o,r){var a,i,u,l,p,s,_,E,g,x,f=n.length,S=f,v=0,F=!1,h=e.__k=Array(r);for(a=0;a<r;a++)(i=t[a])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i!="object"||i.constructor==String?i=h[a]=fn(null,i):Jn(i)?i=h[a]=fn(Ye,{children:i}):i.constructor===void 0&&i.__b?i=h[a]=fn(i.type,i.props,i.key,i.ref,i.__v):h[a]=i,l=a+v,i.__=e,i.__b=e.__b+1,u=null,~(p=i.__i=Qi(i,n,l,S))&&(S--,(u=n[p])&&(u.__u|=2)),u&&u.__v?(i.__u|=2,p==l-1?v--:p==l+1?v++:p!=l&&(p>l?v--:v++,F=!0)):(~p||(r>f?v--:r<f&&v++),typeof i.type!="function"&&(i.__u|=4))):h[a]=null;if(F){for(s=[],_=[],a=0;a<r;a++)if((i=h[a])&&2&i.__u){for(E=0,g=s.length;E<g;)s[x=E+g>>1]<i.__i?E=x+1:g=x;s[E]=i.__i,_[a]=E+1}for(v=s.length;a--;)_[a]&&(_[a]==v?v--:h[a].__u|=4)}if(S)for(a=0;a<f;a++)!(u=n[a])||2&u.__u||(u.__e==o&&(o=ht(u)),eo(u,u));return o}function Ir(e,t,n,o){var r,a,i;if(typeof e.type=="function"){if(e.props.__P)return t;if(r=e.__k)for(a=0;a<r.length;a++)r[a]&&(r[a].__=e,t=Ir(r[a],t,n,!1));return t}for(t&&!t.parentNode&&(t=ht(e))&&!t.parentNode&&(t=null),i=t;i&&i.nodeType==8;)i=i.nextSibling;for(e.__e!=i&&(!o&&n.moveBefore&&e.__e.parentNode?n.moveBefore(e.__e,t):n.insertBefore(e.__e,t||null)),t=e.__e;(t=t&&t.nextSibling)&&t.nodeType==8;);return t}function Qi(e,t,n,o){var r,a,i,u=e.key,l=e.type,p=t[n],s=p&&!(2&p.__u);if(p===null&&u==null||s&&u==p.key&&l==p.type)return n;if(o>(s?1:0)){for(r=n-1,a=n+1;r>=0||a<t.length;)if((p=t[i=r>=0?r--:a++])&&!(2&p.__u)&&u==p.key&&l==p.type)return i}return-1}function Er(e,t,n){n==null&&(n=""),t[0]=="-"?e.setProperty(t,n):e[t]=n}function pn(e,t,n,o,r){var a,i;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof o=="string"&&(e.style.cssText=o=""),o)for(t in o)n&&t in n||Er(e.style,t,"");if(n)for(t in n)o&&n[t]==o[t]||Er(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")(e.__e||(e.__e={}))[t]=n,n&&o||(i=Yn[t]||(Yn[t]=Zi(t)),(e.__a||(e.__a={}))[t]=jn,a=t!=(t=t.replace(Ar,"$1")),(t=t.slice(2))[0]<"a"&&(t=t.toLowerCase()),n?e.addEventListener(t,i,a):e.removeEventListener(t,i,a));else{if(r=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Zi(e){return function(t){if(this.__e){var n=this.__e[e];if(t[mn]==null)t[mn]=jn++;else if(t[mn]<this.__a[e])return;return n(ie.event?ie.event(t):t)}}}function Qn(e,t,n,o,r,a,i,u,l,p){var s,_,E,g,x,f,S,v,F,h,c,d,y,T,w,C,H,G,z,D,X=t.type;if(t.constructor!==void 0)return null;if(128&n.__u&&(l=32&n.__u,s=n.__c.__z)){if(t.__u|=l,_=a=[],s.nodeType==8)for(E=1,g=s.nextSibling;g;g=g.nextSibling){if(g.nodeType==8){if(g.data.startsWith("$s"))E++;else if(g.data.startsWith("/$s")&&!--E)break}a.push(g)}else a.push(s);u=a[0]}(s=ie.__b)&&s(t);e:if(typeof X=="function"){x=i.length;try{if(h=t.props,c=(s=X.prototype)&&s.render,d=(s=X.contextType)&&o[s.__c],y=s?d?d.props.value:s.__:o,n.__c?2&(f=t.__c=n.__c).__g&&(f.__g|=1):(c?t.__c=f=new X(h,y):(t.__c=f=new hn(h,y),f.constructor=X,f.render=ts),d&&d.sub(f),f.state||(f.state={}),f.__n=o,f.__g|=8,f.__h=[],f.__k=[]),c&&(f.__s||(f.__s=f.state),X.getDerivedStateFromProps&&(f.__s==f.state&&(f.__s=St({},f.__s)),St(f.__s,X.getDerivedStateFromProps(h,f.__s)))),S=f.props,v=f.state,f.__v=t,n.__c){if(c&&!X.getDerivedStateFromProps&&h!==S&&f.componentWillReceiveProps&&f.componentWillReceiveProps(h,y),t.__v==n.__v&&!(8&f.__g)||!(4&f.__g)&&f.shouldComponentUpdate&&f.shouldComponentUpdate(h,f.__s,y)===!1){t.__v!=n.__v&&(f.props=h,f.state=f.__s,f.__g&=-9),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(K){K&&(K.__=t)}),bn.push.apply(f.__h,f.__k),f.__k=[],f.__h.length&&i.push(f),u=ht(n);break e}f.componentWillUpdate&&f.componentWillUpdate(h,f.__s,y),c&&f.componentDidUpdate&&f.__h.push(function(){f.componentDidUpdate(S,v,F)})}else c&&!X.getDerivedStateFromProps&&f.componentWillMount&&f.componentWillMount(),c&&f.componentDidMount&&f.__h.push(f.componentDidMount);if(f.context=y,f.props=h,f.__P=e,f.__g&=-5,T=ie.__r,w=0,c)f.state=f.__s,f.__g&=-9,T&&T(t),s=f.render(f.props,f.state,f.context),bn.push.apply(f.__h,f.__k),f.__k=[];else do f.__g&=-9,T&&T(t),s=f.render(f.props,f.state,f.context),f.state=f.__s;while(8&f.__g&&++w<25);f.state=f.__s,f.getChildContext&&(o=St({},o,f.getChildContext())),c&&n.__c&&f.getSnapshotBeforeUpdate&&(F=f.getSnapshotBeforeUpdate(S,v)),C=s&&s.type===Ye&&s.key==null?s.props.children:s,h.__P&&(s=u,r=(e=h.__P).namespaceURI,l=a=null,n.props&&n.props.__P!=e&&(n.__k.some(function(K){K&&eo(K,K)}),n.__k=null),u=n.__k?ht(n,0):null),u=Rr(e,Jn(C)?C:[C],t,n,o,r,a,i,u,l,p),h.__P&&(t.__e=null,u=s),t.__u&=-161,128&n.__u&&(f.__z=null),_&&_.some(vn),f.__h.length&&i.push(f),1&f.__g&&(f.__g&=-4)}catch(K){if(i.length=x,t.__v=null,l||a)if(K.then){if(H=0,t.__u|=l?160:128,a){for(~(z=a.indexOf(u||void 0))||(z=a.length);(D=a[z-1])&&D.nodeType==8;)z--;for(;z<a.length;z++)if(D=a[z]){if(a[z]=null,D.nodeType==8){if(D.data.startsWith("$s"))H++||(G=D);else if(H&&D.data.startsWith("/$s")&&!--H){u=D;break}}else if(!H)break}}if(!G){for(;u&&u.nodeType==8&&u.nextSibling;)u=u.nextSibling;G=u}t.__c.__z||(t.__c.__z=G),t.__e=u}else a&&a.some(vn);else t.__e=n.__e;t.__k||(t.__k=n.__k||[]),K.then||Pr(t),ie.__e(K,t,n)}}else u=t.__e=es(n.__e,t,n,o,r,a,i,l,p,e);return(s=ie.diffed)&&s(t),128&t.__u?void 0:u}function Pr(e){e&&(e.__c&&(e.__c.__g|=4),e.__k&&e.__k.some(Pr))}function Dr(e,t,n){for(var o=0;o<n.length;)Zn(n[o++],n[o++],n[o++]);ie.__c&&ie.__c(t,e),e.some(function(r){try{e=r.__h,r.__h=[],e.some(function(a){a.call(r)})}catch(a){ie.__e(a,r.__v)}})}function es(e,t,n,o,r,a,i,u,l,p){var s,_,E,g,x,f,S,v,F,h=n.props||gn,c=t.props,d=t.type;if(d=="svg"?r="http://www.w3.org/2000/svg":d=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),a){for(s=0;s<a.length;s++)if((x=a[s])&&(d?x.localName==d:x.nodeType==3)){e=x,a[s]=null;break}}if(!e){if(v=p.ownerDocument||document,!d)return v.createTextNode(c);e=v.createElementNS(r,d,c.is&&c),u&&(ie.__m&&ie.__m(t,a),u=!1),a=null}if(d){if(p=d=="template"?e.content:e,a=d=="textarea"&&c.defaultValue!=null?null:a&&Cr.call(p.childNodes),!u&&a)for(h={},s=0;s<e.attributes.length;s++)h[(x=e.attributes[s]).name]=x.value;for(s in h)x=h[s],s=="dangerouslySetInnerHTML"?E=x:s=="children"||s in c||s=="value"&&"defaultValue"in c||s=="checked"&&"defaultChecked"in c||pn(e,s,null,x,r);for(s in F=1&n.__u,c)x=c[s],s=="children"?g=x:s=="dangerouslySetInnerHTML"?_=x:s=="value"?f=x:s=="checked"?S=x:u&&typeof x!="function"||!(h[s]!==x||F&&x!=null)||pn(e,s,x,h[s],r);_?(u||E&&(_.__html==E.__html||_.__html==e.innerHTML)||(e.innerHTML=_.__html),t.__k=[]):(E&&(e.textContent=""),(d=="foreignObject"||r=="http://www.w3.org/1998/Math/MathML"&&Yi.test(d))&&(r="http://www.w3.org/1999/xhtml"),Rr(p,Jn(g)?g:[g],t,n,o,r,a,i,a?a[0]:n.__k&&ht(n,0),u,l),a&&a.some(vn)),u&&d!="textarea"||(s="value",d=="progress"&&f==null?e.removeAttribute(s):f==null||f===e[s]&&(d!="progress"||f)||pn(e,s,f,h[s],r),s="checked",S!=null&&S!=e[s]&&pn(e,s,S,h[s],r))}else h===c||u&&e.data==c||(e.data=c);return e}function Zn(e,t,n,o){try{typeof e=="function"?t?t.__x=e(t)||1:o&&(o=o.__c||o.__e)&&(t=o.__x)&&(o.__x=null,typeof t=="function"?t():e(null)):e.current=t}catch(r){ie.__e(r,n)}}function eo(e,t,n){var o,r;if(ie.unmount&&ie.unmount(e),!(o=e.ref)||o.current&&o.current!=e.__e||Zn(o,null,t,e),o=e.__c){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(a){ie.__e(a,t)}o.__P=o.__n=null}if(o=e.__k)for(r=0;r<o.length;r++)o[r]&&eo(o[r],t,typeof e.type!="function"||n&&!e.props.__P);(o=e.__e)&&(n||vn(o),o.__e&&(o.__e=null)),e.__e=e.__c=e.__=null}function ts(e,t,n){return this.constructor(e,n)}function dt(e,t){var n,o,r,a;ie.__&&ie.__(e,t),t.nodeType==9&&(t=t.documentElement),o=(n=e&&32&e.__u)?null:t.__k,t.__k=fn(Ye,{children:[e]}),r=[],a=[],Qn(t,t.__k,o||gn,gn,t.namespaceURI,o?null:t.firstChild?Cr.call(t.childNodes):null,r,o?o.__e:t.firstChild,n,a),Dr(r,t.__k,a),t.__k.props.children=null}ie={__e:function(e,t,n,o){for(var r,a,i;t=t.__;)if((r=t.__c)&&!(1&r.__g)){r.__g|=4;try{if((a=r.constructor)&&a.getDerivedStateFromError&&(r.setState(a.getDerivedStateFromError(e)),i=8&r.__g),r.componentDidCatch&&(r.componentDidCatch(e,o||{}),i=8&r.__g),i)return void(r.__g|=2)}catch(u){e=u,i=0}}throw yn=0,e}},Tr=0,Ki=function(e){return e!=null&&e.constructor===void 0},hn.prototype.setState=function(e,t){var n=this.__s;n&&n!=this.state||(n=this.__s=St({},this.state)),typeof e=="function"&&(e=e(St({},n),this.props)),e&&(St(n,e),this.__v&&(t&&this.__k.push(t),Sr(this)))},hn.prototype.forceUpdate=function(e){this.__v&&(this.__g|=4,e&&this.__h.push(e),Sr(this))},hn.prototype.render=Ye,ft=[],yn=0,Mr=function(e,t){return e.__v.__b-t.__v.__b},mn=Symbol(),Ar=/(PointerCapture)$|Capture$/i,jn=0,Yn={},Wi=0;var xn,qe,to,Br,ns=Object.is,no=0,$r=[],oo=[],ke=ie,Fr=ke.__b,Hr=ke.__r,Or=ke.diffed,Nr=ke.__c,qr=ke.unmount,Gr=ke.__;function Ur(e,t){ke.__h&&ke.__h(qe,e,no||t),no=0;var n=qe.__H||(qe.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function Et(e,t){var n=Ur(xn++,4);!ke.__s&&Xr(n.__H,t)&&(n.__P=!1,n.__=e,n.u=t,qe.__h.push(n))}function Tt(e){return no=5,os(function(){return{current:e}},[])}function os(e,t){var n=Ur(xn++,7);return Xr(n.__H,t)&&(n.__=e(),n.__H=t),n.__}function rs(){var e;do{for(;e=oo.shift();)try{Xt(e)}catch(n){ke.__e(n,{__:(e=e.__P)&&e.__v})}for(;e=$r.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(Xt),t.__h.some(ro),t.__h=[]}catch(n){t.__h=[],ke.__e(n,e.__v)}}}while(oo.length)}ke.__b=function(e){qe=null,Fr&&Fr(e)},ke.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),Gr&&Gr(e,t)},ke.__r=function(e){Hr&&Hr(e),xn=0;var t=(qe=e.__c).__H;t&&(to==qe?qe.__h=[]:(t.__h.some(Xt),t.__h.some(ro),xn=0),t.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})),to=qe},ke.diffed=function(e){Or&&Or(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&Vr($r.push(t)),t.__H.__.some(function(n){n.u&&(n.__H=n.u)})),to=qe=null},ke.__c=function(e,t){t.some(function(n){try{n.__h.some(Xt),n.__h=n.__h.filter(function(o){return!o.__||ro(o)})}catch(o){t.some(function(r){r.__h&&(r.__h=[])}),t=[],ke.__e(o,n.__v)}}),Nr&&Nr(e,t)},ke.unmount=function(e){qr&&qr(e);var t,n,o=e.__c;o&&o.__H&&(o.__H.__.some(function(r){try{if(r.__P&&r.__c){if(n===void 0){for(n=e.__;n&&(!n.__c||!n.__c.__P);)n=n.__;n=n&&n.__c}r.__P=n,Vr(oo.push(r))}else Xt(r)}catch(a){t=a}}),o.__H=void 0,t&&ke.__e(t,o.__v))};var zr=typeof requestAnimationFrame=="function";function as(e){var t,n=function(){clearTimeout(o),zr&&cancelAnimationFrame(t),setTimeout(e)},o=setTimeout(n,35);zr&&(t=requestAnimationFrame(n))}function Vr(e){e!=1&&Br==ke.requestAnimationFrame||((Br=ke.requestAnimationFrame)||as)(rs)}function Xt(e){var t=qe,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),qe=t}function ro(e){var t=qe;e.__c=e.__(),qe=t}function Xr(e,t){return!e||e.length!=t.length||t.some(function(n,o){return!ns(n,e[o])})}var is=0;function b(e,t,n,o,r,a){t||(t={});var i,u,l=t;if("ref"in l&&typeof e!="function")for(u in l={},t)u=="ref"?i=t[u]:l[u]=t[u];var p={type:e,props:l,key:n,ref:i,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--is,__i:-1,__u:0};return(r||a)&&(p.__source=r,p.__self=a),ie.vnode&&ie.vnode(p),p}function Ht({label:e,class:t,at:n,decorative:o,variant:r}){let a=r==="tab"?t?`kit-key-tab ${t}`:"kit-key-tab":t??"kit-key-chip";return b("kbd",{class:a,"data-keyhint":n,"aria-hidden":o?"true":void 0,children:e})}var ao=null;function Kr(){return ao}function nt(e){return b("button",{type:"button",id:e.id,class:e.class,disabled:e.disabled,"aria-label":e.label,title:e.title,"aria-pressed":e.pressed,role:e.checked===void 0?void 0:"switch","aria-checked":e.checked,onClick:t=>{ao=t.currentTarget,t.currentTarget.blur(),e.onClick(),setTimeout(()=>{ao=null},0)},children:[e.children,e.keyLabel?b(Ht,{label:e.keyLabel,variant:"tab",class:"kit-key-inline",decorative:!0}):null]})}var ss=new Set(["button","input","select","textarea"]);function ls(e){if(e.hidden||e.inert||e.getAttribute("inert")!=null||e.style&&e.style.display==="none")return!0;if(typeof getComputedStyle=="function")try{if(getComputedStyle(e).display==="none")return!0}catch{}return!1}function Wr(e){let t=[],n=(o,r)=>{let a=!1;for(let i of Array.from(o.children)){if(i.nodeType!==1)continue;let u=i,l=(u.localName||"").toLowerCase(),p=l==="legend"&&!a;if(l==="legend"&&(a=!0),ls(u))continue;let s=u.getAttribute("tabindex"),_=s!=null?Number(s)>=0:ss.has(l)||l==="a"&&u.getAttribute("href")!=null,E=r&&!p;_&&!E&&!u.disabled&&t.push(u),n(u,E||l==="fieldset"&&u.disabled===!0)}};return n(e,!1),t}function cs(e,t){for(let n=t;n;n=n.parentNode)if(n===e)return!0;return!1}function Ot(e){let t=Tt(null),n=Tt(null),o=Tt(!1),r=Tt(!1),a=()=>{n.current?.focus?.(),n.current=null};return Et(()=>{if(e.open&&!o.current){let i=document.activeElement;n.current=i&&i!==document.body?i:Kr();let u=e.focusId?document.getElementById(e.focusId):null,l=t.current?Wr(t.current).find(p=>p.localName==="button"):void 0;(u??l??t.current)?.focus?.()}else!e.open&&o.current&&a();o.current=e.open},[e.open]),Et(()=>()=>{o.current&&a()},[]),Et(()=>{if(!e.open)return;let i=u=>{let l=t.current;if(u.key!=="Tab"||u.ctrlKey||u.altKey||u.metaKey||!l)return;let p=Wr(l),s=document.activeElement,_=cs(l,s);if(!p.length){u.preventDefault(),l.focus();return}let E=p[0],g=p[p.length-1],x=p.includes(s);(u.shiftKey?!_||!x||s===E:!_||!x||s===g)&&(u.preventDefault(),(u.shiftKey?g:E).focus())};return document.addEventListener("keydown",i,!0),()=>document.removeEventListener("keydown",i,!0)},[e.open]),Et(()=>{let i=e.onDismiss;if(!e.open||!i)return;let u=l=>{!Ft(l)||dn(l.target)||(l.preventDefault(),l.stopPropagation(),l.repeat||i())};return document.addEventListener("keydown",u,!0),()=>document.removeEventListener("keydown",u,!0)},[e.open,e.onDismiss]),b("div",{id:e.id,class:e.veilClass,hidden:!e.open,onPointerDown:i=>{r.current=i.target===i.currentTarget},onClick:i=>{let u=r.current&&i.target===i.currentTarget;r.current=!1,u&&e.onDismiss?.()},children:b("div",{class:e.panelClass,role:e.role??"dialog","aria-modal":"true","aria-labelledby":e.titleId,"aria-describedby":e.describedBy,tabIndex:-1,ref:t,children:[e.kicker!=null&&e.kicker!==!1&&b("p",{class:e.kickerClass,id:e.kickerId,children:e.kicker}),e.close!=null&&e.close!==!1?b("div",{class:"kit-dialog-head",children:[b("h2",{id:e.titleId,class:e.titleClass,children:e.title}),e.close]}):b("h2",{id:e.titleId,class:e.titleClass,children:e.title}),e.children]})})}function ds({rows:e}){return e.length?b(Ye,{children:e.map(t=>b("li",{children:[b("span",{class:"cylon-hs-rank",children:["#",t.rank]}),b("strong",{class:"cylon-hs-initials",children:t.initials}),b("span",{class:"cylon-hs-date",children:t.date}),b("span",{class:"cylon-hs-score",children:[t.score," KOs"]})]},t.rank))}):b("li",{class:"cylon-hs-empty",children:"No scores yet"})}function wn({id:e,rows:t}){return b("ol",{class:"cylon-high-scores",id:e,children:b(ds,{rows:t})})}var Kt=[{board:"week",id:"cylon-tab-week",label:"This Week"},{board:"alltime",id:"cylon-tab-alltime",label:"All Time"}];function us(e){let t=n=>o=>{if(o.key==="ArrowUp")e.onSpin(n,1);else if(o.key==="ArrowDown")e.onSpin(n,-1);else if(o.key==="ArrowLeft")e.onPick(n-1);else if(o.key==="ArrowRight"||o.key===" "||o.key==="Spacebar")n<2&&e.onPick(n+1);else if(o.key==="Enter")e.onSubmit();else return;o.preventDefault()};return b("div",{class:"cylon-initials",id:"cylon-initials",role:"group","aria-label":"Arcade initials",children:[0,1,2].map(n=>b("div",{class:"cylon-initial-slot",onWheel:o=>{o.preventDefault(),e.onSpin(n,o.deltaY<0?1:-1)},children:[b("button",{type:"button",class:"cylon-initial-spin","data-initial":n,"data-dir":"1","aria-label":`Scroll initial ${n+1} up`,onClick:()=>e.onSpin(n,1),children:"▲"}),b("button",{type:"button",class:n===e.active?"cylon-initial is-active":"cylon-initial",id:`cylon-initial-${n}`,"data-initial":n,"aria-label":`Initial ${n+1}, use up and down to change`,onClick:()=>e.onPick(n),onKeyDown:t(n),children:e.initials[n]}),b("button",{type:"button",class:"cylon-initial-spin","data-initial":n,"data-dir":"-1","aria-label":`Scroll initial ${n+1} down`,onClick:()=>e.onSpin(n,-1),children:"▼"})]},n))})}function ps(e){return b("div",{class:"cylon-hs-tabs",role:"tablist","aria-label":"High score board",children:Kt.map((t,n)=>b("button",{type:"button",class:"cylon-hs-tab",role:"tab",id:t.id,"data-board":t.board,"aria-selected":e.board===t.board?"true":"false",tabIndex:e.board===t.board?0:-1,"aria-controls":"cylon-gameover-panel",onClick:()=>e.onTab(t.board,!1),onKeyDown:o=>{let r=o.key==="ArrowRight"?1:o.key==="ArrowLeft"?-1:0,a=o.key==="Home"?0:o.key==="End"?Kt.length-1:-1,i=r?(n+r+Kt.length)%Kt.length:a;i<0||(o.preventDefault(),e.onTab(Kt[i].board,!0))},children:t.label},t.id))})}function ms(e){let t=e.board==="alltime"?"cylon-tab-alltime":"cylon-tab-week";return b(Ot,{open:e.open,id:"cylon-gameover",veilClass:"cylon-gameover",panelClass:"cylon-gameover-panel",kicker:"Cylon Defense",kickerClass:"cylon-gameover-kicker",titleId:"cylon-gameover-title",titleClass:"cylon-gameover-title",title:"Game Over",focusId:e.mode==="entry"?"cylon-initial-0":"cylon-play-again",children:[b("p",{class:"cylon-gameover-reason",id:"cylon-gameover-reason",children:e.reason}),b("p",{class:"cylon-gameover-stats",children:[b("span",{children:[b("em",{id:"cylon-gameover-kos",children:e.kos})," KOs"]}),b("span",{children:[b("em",{id:"cylon-gameover-hits",children:e.hp})," HP"]})]}),b("div",{class:"cylon-gameover-entry",id:"cylon-gameover-entry",hidden:e.mode!=="entry",children:[b("p",{class:"cylon-gameover-entry-label",children:"Enter Your Initials"}),b(us,{...e}),b("p",{class:"cylon-gameover-entry-hint",children:"↑↓ change letter · ←→ next · Enter submit"}),b("p",{class:"cylon-gameover-entry-error",id:"cylon-initials-error",role:"alert",hidden:!e.error,children:e.error}),b("div",{class:"cylon-gameover-actions",children:[b(nt,{class:"cylon-gameover-btn",id:"cylon-score-submit",disabled:e.submitting,onClick:e.onSubmit,children:"Submit Score"}),b(nt,{class:"cylon-gameover-btn is-ghost",id:"cylon-score-skip",onClick:e.onSkip,children:"Skip"})]})]}),b("div",{class:"cylon-gameover-board",id:"cylon-gameover-board",hidden:e.mode!=="board",children:[b("p",{class:"cylon-gameover-entry-label",children:"High Scores"}),b("p",{class:"cylon-gameover-alltime",id:"cylon-gameover-alltime",role:"status",hidden:e.allTimeRank===null,children:e.allTimeRank===null?"":`New all-time #${e.allTimeRank}!`}),b(ps,{...e}),b("div",{role:"tabpanel",id:"cylon-gameover-panel","aria-labelledby":t,tabIndex:0,children:b(wn,{id:"cylon-gameover-scores",rows:e.rows})}),b("p",{class:"cylon-gameover-entry-hint",id:"cylon-gameover-reset",children:e.resetText}),b(nt,{class:"cylon-gameover-btn",id:"cylon-play-again",onClick:e.onDismiss,children:e.quit?"Close":"Play Again"})]})]})}function Yr(e,t){dt(b(ms,{...t}),e)}var fs={hits:()=>"You took too much fire. The eye cooked you.",nuke:()=>"A nuke landed on you. Frak.",quit:e=>e?"Run ended. Record your score?":"Run ended."};function jr(e){let{game:t,state:n,scores:o}=e,r=!1,a="",i=0,u=0,l="entry",p=["A","A","A"],s=0,_="",E=!1,g="week",x=null,f="Play often — scores reset every Sunday at midnight Central.";function S(){e.root&&Yr(e.root,{open:r,reason:a,kos:i,hp:u,mode:l,initials:p,active:s,error:_,submitting:E,board:g,allTimeRank:x,rows:un(g==="alltime"?o.alltime():o.board()),resetText:f,quit:t.run.endReason==="quit",onSpin:y,onPick:d,onSubmit:()=>{w()},onSkip:C,onTab:c,onDismiss:G})}let v=D=>{document.getElementById(D)?.focus()};function F(){e.boardChanged(),S()}async function h(){let D=await o.load();D&&(f=e.weeklyResetText(D)),F()}function c(D,X){g=D,S(),X&&v(D==="alltime"?"cylon-tab-alltime":"cylon-tab-week")}function d(D){s=Math.max(0,Math.min(2,D)),S(),v(`cylon-initial-${s}`)}function y(D,X){let K=(p[D]??"A").charCodeAt(0)-65,ue=String.fromCharCode(65+((K+X)%26+26)%26);p=p.map(($,U)=>U===D?ue:$),_="",d(D)}function T(){l="board",S(),v("cylon-play-again"),h()}async function w(){if(E)return;let D=t.run.pendingScore?t.run.pendingScore.score:t.run.koScore,X=t.run.pendingScore?t.run.pendingScore.hits:t.run.hitsTaken;E=!0,x=null,S();let K=await o.submit(D,p.join(""),X);if(E=!1,K.saved){an("score_submit"),_="",x=K.allTimeRank,t.run=n.clearPendingScore(t.run),T();return}K.problem==="invalid-initials"?_="Those initials aren't valid — choose another.":K.problem==="save-failed"&&(_="Could not save that score. Refresh and play again."),F()}function C(){t.run=n.clearPendingScore(t.run),T()}function H(){r=!1,l="entry",x=null,g="week",t.run=n.setEndReason(n.clearPendingScore(t.run),null),S()}function G(){if(t.run.endReason==="quit"){H(),t.run=n.clearGameOver(t.run),e.resetRunStats(),e.closed();return}e.setGameEnabled(!0)}async function z(D){if(!e.root)return;t.run=n.setEndReason(t.run,D),await h();let X=o.qualifies(t.run.koScore);X||(t.run=n.clearPendingScore(t.run)),a=fs[D](X),i=t.run.koScore,u=e.currentHp(),l=X?"entry":"board",p=["A","A","A"],s=0,_="",r=!0,S()}return{renderHighScores:F,fetchHighScores:h,hideGameOver:H,showGameOver:z,resetText:()=>f}}function Jr(e){return{parse(t){let n=JSON.parse(t);if(!e(n))throw new Error("unexpected shape");return n},stringify:t=>JSON.stringify(t)}}function Qr(e,t,n,o){let r=new Set,a=null;function i(){if(a)return a.v;try{let u=o?.getItem(e);return u==null?t:n.parse(u)}catch{return t}}return{get:i,set(u){let l=!1;try{o&&(o.setItem(e,n.stringify(u)),l=!0)}catch{}a=l?null:{v:u};for(let p of r)p(u)},subscribe(u){return r.add(u),()=>r.delete(u)}}}var kn={setTimeout:(e,t)=>window.setTimeout(e,t),clearTimeout:e=>window.clearTimeout(e),setInterval:(e,t)=>window.setInterval(e,t),clearInterval:e=>window.clearInterval(e)};function _n(){try{return window.localStorage}catch{return null}}var Zr="cylon-settings",io={gameEnabled:!1,soundEnabled:!0,musicEnabled:!0,soundVolume:50,musicVolume:50,eyeEnabled:!0};function ea(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function hs(e){let t=(o,r,a)=>b("label",{class:"cylon-setting",children:[b("input",{type:"checkbox","data-setting":o,checked:r,onChange:i=>e.onSetting(o,i.currentTarget.checked)}),b("span",{children:a})]}),n=(o,r,a,i)=>{let u=l=>e.onSetting(o,Number(l.currentTarget.value));return b("label",{class:"cylon-setting cylon-setting-slider",children:[b("span",{children:a}),b("input",{type:"range",min:"0",max:"100",step:"1",value:r,"data-setting":o,"aria-label":i,onInput:u,onChange:u})]})};return b(Ye,{children:[b("p",{class:"cylon-settings-title",children:"Options"}),t("soundEnabled",e.soundEnabled,"Sound Effects"),n("soundVolume",e.soundVolume,"SFX Volume","Sound effects volume"),t("musicEnabled",e.musicEnabled,"Music"),n("musicVolume",e.musicVolume,"Music Volume","Music volume"),t("eyeEnabled",e.eyeEnabled,"Eye Tracking"),b("p",{class:"cylon-settings-title cylon-settings-scores-title",children:"Weekly High Scores"}),b("p",{class:"cylon-settings-hint",id:"cylon-weekly-reset",children:e.resetText}),b(wn,{id:"cylon-high-scores",rows:e.rows}),b("p",{class:"cylon-settings-hint",children:"Start with 30 HP — occasional nukes and small missiles (2 HP each). Last 10s without a hit to heal 1. Cyan/pink missiles chase you; orange locks where you just aimed. More drones as KOs rise. Drag the reticle to dodge · tap drones · Grenade / Raptor in the bar."})]})}function ta(e,t){dt(b(hs,{...t}),e)}function na(e){let{settingsRoot:t,gameToggleBtn:n,gameToggleLabel:o,cicEnterBtn:r,navBurger:a,navMenu:i,navGame:u,siteBrand:l,BRAND_CIVIL:p,BRAND_COMBAT:s,NAV_FADE_MS:_,reduceMotion:E,settingsPanel:g,fetchHighScores:x,setGameEnabled:f,setEyeTracking:S}=e,v={settingChanged:$=>e.settingChanged($)},F=io,h=Qr(Zr,io,Jr(ea),_n()),c=Object.assign({},F,h.get());c.gameEnabled=!1,c.soundVolume=Math.max(0,Math.min(100,Number(c.soundVolume)||F.soundVolume)),c.musicVolume=Math.max(0,Math.min(100,Number(c.musicVolume)||F.musicVolume));let d=!1;c.soundVolume===85&&(c.soundVolume=50,d=!0),c.musicVolume===40&&(c.musicVolume=50,d=!0),d&&h.set(c);let y=0,T=null;function w(){h.set(c),C(),G()}function C(){g&&ta(g,{soundEnabled:c.soundEnabled,soundVolume:c.soundVolume,musicEnabled:c.musicEnabled,musicVolume:c.musicVolume,eyeEnabled:c.eyeEnabled,rows:e.boardRows(),resetText:e.resetText(),onSetting:H})}function H($,U){$==="soundVolume"||$==="musicVolume"?typeof U=="number"&&(c[$]=Math.max(0,Math.min(100,U||0))):typeof U=="boolean"&&(c[$]=U),w(),$==="eyeEnabled"&&!c.eyeEnabled&&S(!1),v.settingChanged($)}function G(){n&&(n.classList.toggle("is-on",c.gameEnabled),n.setAttribute("aria-pressed",c.gameEnabled?"true":"false"),o&&(o.textContent=c.gameEnabled?"Game On":"Game Off"))}function z($){if(document.body.classList.toggle("cylon-nav-combat",$),l&&(l.textContent=$?s:p),u&&(u.hidden=!$),t&&(t.hidden=!$),r&&(r.hidden=$),!$){let U=document.getElementById("cylon-settings-panel"),se=document.getElementById("cylon-settings-toggle");U&&!U.hidden&&(U.hidden=!0,se&&se.setAttribute("aria-expanded","false"))}}function D(){let $=!!c.gameEnabled,U=document.querySelector(".site-nav-inner"),se=document.body.classList.contains("cylon-nav-combat");if(E||!U||se===$){clearTimeout(T),T=null,U?.classList.remove("is-nav-fading"),z($);return}let Q=++y;clearTimeout(T),U.classList.add("is-nav-fading"),T=setTimeout(()=>{Q===y&&(z($),requestAnimationFrame(()=>{requestAnimationFrame(()=>{Q===y&&(U.classList.remove("is-nav-fading"),T=null)})}))},_)}function X(){if(!a||!i)return;let $=()=>{i.classList.remove("is-open"),a.setAttribute("aria-expanded","false")};a.addEventListener("click",U=>{U.stopPropagation();let se=!i.classList.contains("is-open");i.classList.toggle("is-open",se),a.setAttribute("aria-expanded",se?"true":"false")}),i.querySelectorAll("a.site-link").forEach(U=>{U.addEventListener("click",()=>$())}),document.addEventListener("click",U=>{i.classList.contains("is-open")&&(i.contains(U.target)||a.contains(U.target)||$())}),window.addEventListener("resize",()=>{window.matchMedia("(min-width: 820px)").matches&&$()})}function K(){n&&(G(),n.addEventListener("click",$=>{$.preventDefault(),$.stopPropagation(),f(!c.gameEnabled)}))}function ue(){if(!t)return;C();let $=document.getElementById("cylon-settings-toggle"),U=g;!$||!U||($.addEventListener("click",se=>{se.stopPropagation();let Q=U.hasAttribute("hidden");Q?(x(),U.removeAttribute("hidden")):U.setAttribute("hidden",""),$.setAttribute("aria-expanded",Q?"true":"false")}),document.addEventListener("click",se=>{t.contains(se.target)||(U.setAttribute("hidden",""),$.setAttribute("aria-expanded","false"))}))}return{settings:c,saveSettings:w,syncGameToggleUi:G,syncNavChrome:D,renderSettings:C,bindSettings:ue,bindGameToggle:K,bindNavMenu:X}}function oa(){return b(Ye,{children:[b("li",{children:["Over time, expect occasional ",b("strong",{children:"nukes"})," and smaller ",b("strong",{children:"missiles"})," (each missile costs ",b("strong",{children:"2 HP"}),")."]}),b("li",{children:[b("strong",{children:"Cyan/pink"})," missiles chase you; ",b("strong",{children:"orange"})," ones aim where you just were."]}),b("li",{children:["Go ",b("strong",{children:"10 seconds"})," without taking a hit to ",b("strong",{children:"heal 1 HP"}),"."]}),b("li",{children:["More ",b("strong",{children:"drones"})," appear as your KO count rises."]})]})}function ys(){return b("div",{class:"cylon-help-body",id:"cylon-help-desktop",children:b("ol",{children:[b("li",{children:["Flip ",b("strong",{children:"Game On"})," in the top bar."]}),b("li",{children:[b("strong",{children:"Move the mouse"})," to dodge bolts and nukes — the eye and drones track your cursor."]}),b("li",{children:[b("strong",{children:"Click drones"})," to KO them and score."]}),b("li",{children:[b("strong",{children:"Grenade"})," (",b(Ht,{label:"G"}),"): arm, then click where you want the blast; ",b(Ht,{label:"Q"})," puts it away."]}),b("li",{children:[b("strong",{children:"Raptor"})," (",b(Ht,{label:"R"}),"): orbital strike that clears the field and dazes the eye."]}),b(oa,{}),b("li",{children:["You start with ",b("strong",{children:"30 HP"})," — hit 0, or take a nuke, then enter 3 initials for the board."]})]})})}function gs(){return b("div",{class:"cylon-help-body",id:"cylon-help-mobile",children:b("ol",{children:[b("li",{children:["Flip ",b("strong",{children:"Game On"})," in the top bar."]}),b("li",{children:[b("strong",{children:"Drag the green reticle"})," with one finger to dodge. Drones and nukes aim at that reticle."]}),b("li",{children:["With your ",b("strong",{children:"other finger"}),", tap drones to KO them, or tap Grenade / Raptor / menu controls."]}),b("li",{children:[b("strong",{children:"Grenade"}),": tap the button to arm, then tap the page to throw."]}),b("li",{children:[b("strong",{children:"Raptor"}),": tap for a strike that clears drones and dazes the eye."]}),b(oa,{}),b("li",{children:["You start with ",b("strong",{children:"30 HP"})," — hit 0, or take a nuke, then scroll initials ▲▼ for the high-score board."]})]})})}function bs(e){return b(Ot,{open:e.open,id:"cylon-help",veilClass:"cylon-help",panelClass:"cylon-help-panel",kicker:"Cylon Defense",kickerClass:"cylon-help-kicker",titleId:"cylon-help-title",titleClass:"cylon-help-title",title:"How to Play",focusId:"cylon-help-close",onDismiss:e.onClose,children:[b("p",{class:"cylon-help-platform",id:"cylon-help-platform",children:e.touch?"Touch Controls":"Desktop Controls"}),e.touch?b(gs,{}):b(ys,{}),b(nt,{class:"cylon-gameover-btn",id:"cylon-help-close",onClick:e.onClose,children:"Got It"})]})}function ra(e,t){dt(b(bs,{...t}),e)}var Yt={};Bn(Yt,{beginRun:()=>po,clearGameOver:()=>bo,clearPendingScore:()=>go,createRun:()=>co,createSchedule:()=>so,endRun:()=>yo,healOne:()=>ho,msUntil:()=>Wt,pending:()=>vs,recordKill:()=>xs,resetScore:()=>uo,setEndReason:()=>ws,skewForPause:()=>lo,stopClock:()=>mo,takeHits:()=>fo});function so(){return{missileDueAt:0,nukeDueAt:0,healDueAt:0,grenadeReadyAt:0,raptorReadyAt:0,eyeDisorientedUntil:0}}function lo(e,t,n){if(n<=0)return e;let o=r=>r>t?r+n:r;return{missileDueAt:o(e.missileDueAt),nukeDueAt:o(e.nukeDueAt),healDueAt:o(e.healDueAt),grenadeReadyAt:o(e.grenadeReadyAt),raptorReadyAt:o(e.raptorReadyAt),eyeDisorientedUntil:o(e.eyeDisorientedUntil)}}function Wt(e,t){return Math.max(0,e-t)}function vs(e,t){return t<e}function co(){return{koScore:0,hitCount:0,hitsTaken:0,runStartedAt:0,gameOver:!1,endReason:null,pendingScore:null}}function uo(e){return{...e,koScore:0,hitCount:0,hitsTaken:0,gameOver:!1,pendingScore:null}}function xs(e){return{...e,koScore:e.koScore+1}}function po(e,t){return{...e,runStartedAt:t}}function mo(e){return e.runStartedAt===0?e:{...e,runStartedAt:0}}function fo(e,t,n,o=!1){let r=Math.max(0,Number(t)||0),a={...e,hitCount:e.hitCount+r,hitsTaken:e.hitsTaken+r},i=o?"nuke":a.hitCount>=n?"hits":null;return{run:a,ends:i}}function ho(e){return e.hitCount>0?{...e,hitCount:e.hitCount-1}:e}function yo(e,t){return{...e,gameOver:!0,runStartedAt:0,pendingScore:{score:e.koScore,hits:e.hitsTaken,reason:t}}}function ws(e,t){return{...e,endReason:t}}function go(e){return e.pendingScore===null?e:{...e,pendingScore:null}}function bo(e){return e.gameOver?{...e,gameOver:!1}:e}var aa="Swipe the app away to close it",ks=150,_s=["fullscreen","standalone","minimal-ui"];function vo(e){return _s.some(t=>e.matches(`(display-mode: ${t})`))||e.iosStandalone()}async function ia(e){let t=vo(e);if(t){try{e.closeWindow()}catch{}if(await new Promise(o=>{e.timers.setTimeout(()=>o(e.closed()),ks)}))return"closed"}if(e.fullscreenElement())try{await e.exitFullscreen()}catch{}return t?"title-with-hint":"title"}function Ss(e,t){return{...e,fullscreenSupported:n=>{let o=n;return(typeof o.requestFullscreen=="function"||typeof o.webkitRequestFullscreen=="function")&&(typeof t.exitFullscreen=="function"||typeof t.webkitExitFullscreen=="function")},fullscreenElement:()=>e.fullscreenElement()??t.webkitFullscreenElement??null,requestFullscreen:n=>{let o=n;return typeof o.requestFullscreen=="function"?e.requestFullscreen(n):typeof o.webkitRequestFullscreen=="function"?Promise.resolve(o.webkitRequestFullscreen()):Promise.reject(new Error("no fullscreen"))},exitFullscreen:()=>typeof t.exitFullscreen=="function"?e.exitFullscreen():typeof t.webkitExitFullscreen=="function"?Promise.resolve(t.webkitExitFullscreen()):Promise.resolve()}}function Sn(){return Ss({matches:e=>typeof window.matchMedia=="function"&&window.matchMedia(e).matches,iosStandalone:()=>navigator.standalone===!0,fullscreenSupported:e=>typeof e.requestFullscreen=="function"&&typeof document.exitFullscreen=="function",fullscreenElement:()=>document.fullscreenElement,requestFullscreen:e=>typeof e.requestFullscreen=="function"?e.requestFullscreen():Promise.reject(new Error("no fullscreen")),exitFullscreen:()=>typeof document.exitFullscreen=="function"?document.exitFullscreen():Promise.resolve(),closeWindow:()=>window.close(),closed:()=>window.closed,timers:kn},document)}function sa(e,t){let n=()=>{e.doc.visibilityState!=="hidden"&&t.show()};e.doc.addEventListener("visibilitychange",()=>{e.doc.visibilityState==="hidden"?t.hide():n()}),e.doc.addEventListener("freeze",()=>t.hide()),e.doc.addEventListener("resume",n),e.win.addEventListener("pagehide",o=>{t.hide(),o?.persisted===!1&&t.close?.()}),e.win.addEventListener("pageshow",n),e.doc.visibilityState==="hidden"&&t.hide()}function xo(e){let t=e.size??18;return b("svg",{viewBox:"0 0 24 24",width:t,height:t,fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false",class:e.class,children:[b("path",{d:"M12 15V3M7 8l5-5 5 5"}),b("path",{d:"M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"})]})}var la=!0,ca="Tap Share, then Add to Home Screen",Es=2500,wo="__installPrompt";function da(e){return new URLSearchParams(e).has("install")}function ko(e){let t=new URL(e);return t.search=t.search?`${t.search}&install`:"?install",t.href}function ua(e){try{return new URL(e).searchParams.get("v")||null}catch{return null}}function pa(e,t){if(!t)return e;let n=new URL(e);return n.searchParams.set("v",t),n.href}var Ts=e=>e?.name==="AbortError";function Ms(e,t,n){let o="idle",r=null,a=0;function i(u){r!==null&&(e.timers.clearTimeout(r),r=null),o=u,u==="copied"&&(r=e.timers.setTimeout(()=>{r=null,o="idle",n()},Es)),n()}return{state:()=>o,async press(){let u=++a;if(e.share)try{await e.share({title:t.title,url:t.shareUrl});return}catch(l){if(Ts(l)||u!==a)return}if(e.copy)try{await e.copy(t.shareUrl),u===a&&i("copied");return}catch{}u===a&&i("field")},close(){a++,o!=="idle"&&i("idle")}}}function ma(e,t,n){let o=e.framed(),r=Ms(e,t,()=>g()),a=e.platform(),i=a==="ios",u=a==="chromium"&&!t.promptsHere&&t.installPage!==null,l=e.installed(),p=null,s=!1,_=()=>!o&&!l&&(i||u||p!==null),E=()=>({off:o,install:_(),highlight:t.asked&&_(),steps:s,share:r.state()}),g=()=>n(E());return!o&&!l&&(e.onPrompt(x=>{p=x,g()}),e.onInstalled(()=>{t.onEvent?.("install"),l=!0,p=null,s=!1,g()}),t.asked&&i&&(t.installPage===null?s=!0:e.navigate(ko(t.installPage),!0))),{view:E,async pressInstall(){if(_()){if(i){t.installPage===null?(s=!0,g()):e.navigate(ko(t.installPage),!1);return}if(p){let x=p;p=null,g();try{await x.prompt()}catch{}return}t.installPage!==null&&e.navigate(ko(t.installPage),!1)}},closeSteps(){s&&(s=!1,g())},async pressShare(){o||(t.onEvent?.("share"),await r.press())},closeShare:r.close}}function As(e,t,n,o=[]){return/iPhone|iPad|iPod/.test(e)||t==="MacIntel"&&n>1?"ios":o.some(r=>r.brand==="Chromium")?"chromium":"other"}function Cs(){return{share:typeof navigator.share=="function"?e=>navigator.share(e):null,copy:typeof navigator.clipboard?.writeText=="function"?e=>navigator.clipboard.writeText(e):null,timers:kn}}function fa(){let e=window;return{onPrompt:t=>{let n=e[wo];e[wo]=null,n&&t(n),window.addEventListener("beforeinstallprompt",o=>{o.preventDefault(),e[wo]=null,t(o)})},onInstalled:t=>window.addEventListener("appinstalled",()=>t()),installed:()=>vo(Sn()),platform:()=>As(navigator.userAgent,navigator.platform,navigator.maxTouchPoints,navigator.userAgentData?.brands),framed:()=>window.self!==window.top,...Cs(),navigate:(t,n)=>n?location.replace(t):location.assign(t)}}var Ls={viewBox:"0 0 24 24",width:18,height:18,"aria-hidden":"true",focusable:"false",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round",class:"kit-install-icon"};function Rs(){return b("svg",{...Ls,children:[b("path",{d:"M12 3v12M7 10l5 5 5-5"}),b("path",{d:"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"})]})}function Is(e){let t=e.view,n=Tt(null);return Et(()=>{t.share==="field"&&(n.current?.focus(),n.current?.select?.())},[t.share]),t.off?null:b("span",{class:"kit-install",children:[t.install&&b(nt,{id:"install-btn",class:t.highlight?"kit-install-btn kit-install-asked":"kit-install-btn",title:"Install this game as an app",onClick:e.onInstall,children:[b(Rs,{}),b("span",{class:"kit-install-txt",children:"Install"})]}),b(nt,{id:"share-btn",class:"kit-install-btn",title:"Share a link to this game",onClick:e.onShare,children:[b(xo,{class:"kit-install-icon"}),b("span",{class:"kit-install-txt",children:"Share"})]}),b("span",{id:"share-status",class:"kit-install-status",role:"status",children:t.share==="copied"?"Link copied":null}),t.share==="field"&&b("input",{id:"share-url",class:"kit-install-url",type:"text",readOnly:!0,value:e.shareUrl,"aria-label":"Link to this game",ref:n,onKeyDown:o=>{Ft(o)&&(o.preventDefault(),o.repeat||e.onCloseShare())}}),b(Ot,{open:t.steps,id:"install-steps",veilClass:"kit-install-veil",panelClass:"kit-install-panel",titleId:"install-steps-title",title:"Add to Home Screen",focusId:"install-steps-done",onDismiss:e.onCloseSteps,children:[b("p",{id:"install-steps-text",children:[b(xo,{size:20,class:"kit-install-glyph"}),ca,"."]}),b(nt,{id:"install-steps-done",class:"kit-install-btn",onClick:e.onCloseSteps,children:"Done"})]})]})}var Ps=`
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
`;function Ds(){if(document.getElementById("kit-install-css"))return;let e=document.createElement("style");e.id="kit-install-css",e.textContent=Ps,document.head.prepend(e)}function ha(e,t,n){Ds();let o=a=>{},r=ma(n,t,a=>o(a));return o=a=>dt(b(Is,{view:a,shareUrl:t.shareUrl,onInstall:()=>{r.pressInstall()},onShare:()=>{r.pressShare()},onCloseSteps:r.closeSteps,onCloseShare:r.closeShare}),e),o(r.view()),r}var va={},ga=e=>new URL(e,va.url).href,ya=!0;function Bs(){let e=document.getElementById("cylon-install-root");if(!e||new URLSearchParams(location.search).get("game")!=="cylon")return;document.querySelector('link[rel="manifest"]')?.setAttribute("href","games/cylon/manifest.webmanifest");let t=location.pathname.endsWith("/index.html");ha(e,{title:"The CIC",shareUrl:pa(new URL("play/cylon/",location.href).href,ua(va.url)),installPage:t||!ya?null:new URL("index.html?game=cylon",location.href).href,promptsHere:ya&&(t||la),asked:da(location.search)},fa())}async function Fs(e){let t=document.getElementById("game-root");if(!t)return!1;if(t.dataset.mounted==="1"&&document.getElementById("cylon-eye"))return!0;try{if(e!==void 0)t.innerHTML=e;else{let n=await fetch(ga("../mount.html?v=769e886323"),{cache:"no-store"});if(!n.ok)throw new Error(`mount ${n.status}`);t.innerHTML=await n.text()}return t.dataset.mounted="1",t.dataset.game="cylon",!0}catch(n){return console.error("Cylon mount failed",n),!1}}async function ba(e={}){let t=typeof e.onTheme=="function"?e.onTheme:()=>{};await Fs(e.mountHtml);let n=document.getElementById("cylon-eye"),o=document.getElementById("cylon-glare"),r=document.getElementById("cylon-battlefield"),a=document.getElementById("cylon-ambush-under"),i=document.getElementById("cylon-nuke"),u=document.getElementById("cylon-nuke-missile"),l=document.getElementById("cylon-small-missile"),p=document.getElementById("cylon-score-value"),s=document.getElementById("cylon-hits-value"),_=document.getElementById("cylon-settings"),E=document.getElementById("cylon-raptor"),g=document.getElementById("cylon-raptor-impacts"),x=document.getElementById("cylon-raptor-btn"),f=document.getElementById("cylon-raptor-cd"),S=document.getElementById("cylon-grenade-btn"),v=document.getElementById("cylon-grenade-cd"),F=document.getElementById("cylon-game-toggle"),h=document.getElementById("cylon-game-toggle-label"),c=document.getElementById("cic-enter-btn"),d=document.getElementById("cylon-settings-panel"),y=document.getElementById("cylon-gameover-root"),T=document.getElementById("cylon-exit-hint"),w=null,C=document.getElementById("cylon-reticle"),H=document.getElementById("site-nav-burger"),G=document.getElementById("site-nav-menu"),z=document.getElementById("site-nav-power"),D=document.getElementById("site-nav-game"),X=document.getElementById("site-brand"),K=document.getElementById("cylon-intro-title"),ue="William Grim",$="The CIC",U=880,se=document.getElementById("cylon-help-btn"),Q=document.getElementById("cylon-help-root"),Te=!1;if(!n||!r)return;let me=window.matchMedia("(prefers-reduced-motion: reduce)").matches,Ue=window.matchMedia("(pointer: coarse)").matches,ot=Ue?10:30;if(me)return;let Pe=e.localScores?kr(_n()):wr(e.scoresApi||ga("../scores.php"),{fetch:(L,P)=>fetch(L,P)}),A={run:co(),schedule:so(),paused:!1,pauseStartedAt:0,nukeInFlight:!1,reticlePointerId:null,draggingReticle:!1,idleTimer:null},Ge={clientX:window.innerWidth/2,clientY:window.innerHeight/3,pageX:window.innerWidth/2,pageY:window.innerHeight/3,t:0},be=null,Xe=null,rt={clientX:0,clientY:0,t:0},Fe=null,ce=null,at=null,je=2e3,Je={w:44,h:56},it=28,Ke=52,Ze=44,{MAX_HITS:At}=sn,ut=1e4,vt=64,k=520,R=28,B=2800,N=640,O=22,W=2200,V=72,oe=.22,de=.32,ve=.62,xe=.5,fe=.72,Me=3e4,ee=ct.medium.radius,J=Math.round(2850*.45),{renderHighScores:Se,fetchHighScores:Qe,hideGameOver:De,showGameOver:ze,resetText:xt}=jr({game:A,state:Yt,scores:Pe,weeklyResetText:xr,currentHp:Po,setGameEnabled:Dn,resetRunStats:Fo,root:y,boardChanged:()=>qt(),closed:()=>{Ho()}}),{settings:pe,saveSettings:Ce,syncGameToggleUi:Oe,syncNavChrome:Ve,renderSettings:qt,bindSettings:Gt,bindGameToggle:et,bindNavMenu:Zt}=na({settingsRoot:_,gameToggleBtn:F,gameToggleLabel:h,cicEnterBtn:c,navBurger:H,navMenu:G,navGame:D,siteBrand:X,BRAND_CIVIL:ue,BRAND_COMBAT:$,NAV_FADE_MS:J,reduceMotion:me,settingsPanel:d,boardRows:()=>un(Pe.board()),resetText:xt,fetchHighScores:Qe,setGameEnabled:Dn,setEyeTracking:L=>j(L),settingChanged:L=>he.settingChanged(L)});function Ct(){return window.scrollX||window.pageXOffset||0}function Lt(){return window.scrollY||window.pageYOffset||0}function zt(){r&&(r.style.width="",r.style.height="")}function Rt(){return pe.gameEnabled&&!A.paused}let he=ir({settings:()=>pe,sessionActive:Rt,volumeToGain:Gn}),st=fr({titleEl:K,nukeEl:u,brandEl:X,body:document.body,title:$,reduceMotion:me,navFadeMs:J,settleMs:U,speed:k*.85,arriveRadius:R,maxFlightMs:B,random:Math.random,enabled:()=>pe.gameEnabled,paused:()=>A.paused,startRun:()=>Pe.startRun(),launched:()=>{he.prime(),he.sfx("introLaunch")},setNukeInFlight:L=>{A.nukeInFlight=L},detonate:(L,P)=>Ba(L,P,{dealDamage:!1,shake:!1}),beginCombat:ti});function Le(){return Rt()&&!A.run.gameOver&&!st.playing()}let It=pr({field:r,isLive:Le,paused:()=>A.paused,viewport:()=>({width:window.innerWidth,height:window.innerHeight}),create:L=>document.createElement(L),now:()=>Date.now(),setTimer:(L,P)=>setTimeout(L,P),clearTimer:L=>clearTimeout(L)}),Vt=e.glyphLayer??null,pt=mr({doc:document,glyphs:Vt,viewport:()=>({width:window.innerWidth,height:window.innerHeight}),random:Math.random,reduceMotion:me,setTimer:(L,P)=>setTimeout(L,P),clearTimer:L=>clearTimeout(L)}),Pt=It.punch,m=cr({now:()=>Date.now(),setTimer:(L,P)=>setTimeout(L,P),clearTimer:L=>clearTimeout(L),isLive:Le,readyAt:L=>L==="grenade"?A.schedule.grenadeReadyAt:A.schedule.raptorReadyAt,setReadyAt:(L,P)=>{L==="grenade"?A.schedule.grenadeReadyAt=P:A.schedule.raptorReadyAt=P},sfx:L=>{he.prime(),he.sfx(L)},changed:wt,grenadeBlast:Qa,raptorAvailable:()=>!!E,raptorLaunch:()=>{Ee(Me),E?.classList.add("is-inbound")},raptorStrike:ei,raptorClear:Ja}),{rearrangeLandscape:M,rearrangeLandscapePage:I,disruptGlyphs:q,clearLandscapeVars:Z,randRange:te}=hr({reduceMotion:me,glyphs:Vt,scrollX:Ct,scrollY:Lt}),{isEyeDisoriented:re,setEyeTracking:j,disorientEye:Ee,clearEyeDisorient:le,eyeClientCenter:ne,updateEye:ye}=yr({eye:n,glare:o,game:A,settings:pe,mouse:Ge,state:Yt,isGameLive:Le,EYE_DISORIENT_MS:Me}),{syncMousePageFromClient:_e,paintReticle:Ae,syncReticleVisibility:we,resetReticleToCenter:ge,onPointerMove:Re,bindReticle:He}=gr({reticleEl:C,mouse:Ge,lastAim:rt,game:A,settings:pe,coarsePointer:Ue,IDLE_MS:je,isGameLive:Le,isEyeDisoriented:re,setEyeTracking:j,audio:he,abilities:m,scrollX:Ct,scrollY:Lt}),{allBots:We,knockOutBot:Ne,clearAllBots:$e,wipeAllBotsWithScore:tt,herdBotsIntoView:Dt,scheduleAmbush:Ia,bindPlayerMissShots:Pa,canLaunchMissile:en,launchSmallMissile:To,clearActiveMissiles:Da,launchNuke:Mo,detonateNukeAt:Ba}=br({game:A,settings:pe,mouse:Ge,lastAim:rt,state:Yt,rules:sn,playfield:Vn,field:r,ambushUnder:a,missileEl:l,nukeEl:i,nukeMissileEl:u,scoreEl:p,audio:he,intro:st,abilities:m,holes:It,debris:pt,punchHole:Pt,HOLE_PRESETS:ct,isGameLive:Le,isEyeDisoriented:re,eyeClientCenter:ne,syncMousePageFromClient:_e,rearrangeLandscape:M,rearrangeLandscapePage:I,disruptGlyphs:q,randRange:te,registerHit:Wa,resizeBattlefield:zt,scrollX:Ct,scrollY:Lt,BOT_HARD_CAP:ot,BOT_SIZE:Je,LINK_PAD:it,HIT_RADIUS:Ke,BOLT_HIT_RADIUS:Ze,NUKE_DIRECT_HIT_RADIUS:vt,NUKE_SPEED:k,NUKE_ARRIVE_RADIUS:R,NUKE_MAX_FLIGHT_MS:B,MISSILE_SPEED:N,MISSILE_ARRIVE:O,MISSILE_MAX_FLIGHT_MS:W,MISSILE_BLAST_RADIUS:V,SMALL_WEAPON_SCALE:oe,MISSILE_WEAPON_SCALE:de});function Ao(){pt.scatter(),document.body.classList.add("cylon-world-ended"),document.body.classList.remove("cylon-glyphs-blown"),document.body.classList.add("cylon-glyphs-blowing"),requestAnimationFrame(()=>{requestAnimationFrame(()=>{pe.gameEnabled&&document.body.classList.add("cylon-glyphs-blown"),setTimeout(()=>{document.body.classList.remove("cylon-glyphs-blowing")},3e3)})})}function Ln(L={}){let P=pe.gameEnabled,Y=!!L.deferScatter;document.body.classList.toggle("cylon-game-live",P),t(P),Ve(),P?Y||Ao():(document.body.classList.remove("cylon-glyphs-blown"),document.body.classList.remove("cylon-glyphs-blowing"),document.body.classList.remove("cylon-world-ended"),pt.cancelReshuffleSettle(),Z(),setTimeout(()=>{pe.gameEnabled||pt.restore()},2900))}function Zs(L,P,Y){return _t(L,P,Y)}function Fa(){return Fn(A.run.koScore,A.run.runStartedAt,Date.now())}function Ha(){return Hn(A.run.koScore,Math.random)}function Oa(){return On(Fa(),Math.random)}function tn(){clearTimeout(Fe??void 0),clearTimeout(ce??void 0),Fe=null,ce=null,A.schedule.missileDueAt=0,A.schedule.nukeDueAt=0,Da()}function Rn(L=!1){if(clearTimeout(Fe??void 0),!Le())return;let P=L?4e3+Math.random()*3e3:Ha();A.schedule.missileDueAt=Date.now()+P,Fe=setTimeout(()=>{Fe=null,!(!Le()||A.paused)&&(!re()&&(en(!1)||en(!0))&&To(),Rn(!1))},P)}function In(L=!1){if(clearTimeout(ce??void 0),!Le())return;let P=L?12e3+Math.random()*8e3:Oa();A.schedule.nukeDueAt=Date.now()+P,ce=setTimeout(()=>{ce=null,!(!Le()||A.paused)&&(!re()&&!A.nukeInFlight&&Mo(),In(!1))},P)}function Na(){tn(),Rn(!0),In(!0)}function qa(L){if(L<=0)return;let P=A.schedule;A.schedule=lo(P,A.pauseStartedAt,L),A.schedule.missileDueAt!==P.missileDueAt&&(clearTimeout(Fe??void 0),Fe=setTimeout(()=>{Fe=null,!(!Le()||A.paused)&&(!re()&&(en(!1)||en(!0))&&To(),Rn(!1))},Wt(A.schedule.missileDueAt,Date.now()))),A.schedule.nukeDueAt!==P.nukeDueAt&&(clearTimeout(ce??void 0),ce=setTimeout(()=>{ce=null,!(!Le()||A.paused)&&(!re()&&!A.nukeInFlight&&Mo(),In(!1))},Wt(A.schedule.nukeDueAt,Date.now()))),A.schedule.healDueAt!==P.healDueAt&&(clearTimeout(be??void 0),be=setTimeout(()=>{be=null,Co()},Wt(A.schedule.healDueAt,Date.now()))),It.resume(A.pauseStartedAt,L)}function $t(){clearTimeout(be??void 0),be=null,A.schedule.healDueAt=0}function Co(){be=null,A.schedule.healDueAt=0,!(!Le()||A.run.hitCount<=0)&&(A.run=ho(A.run),rn(),he.prime(),he.sfx("heal"),s&&(s.classList.add("is-heal"),setTimeout(()=>s.classList.remove("is-heal"),320)),Lo())}function Lo(){$t(),!(!pe.gameEnabled||A.run.gameOver||A.paused||A.run.hitCount<=0)&&(A.schedule.healDueAt=Date.now()+ut,be=setTimeout(()=>{be=null,Co()},ut))}function Ga(){_e(),clearTimeout(at??void 0),at=setTimeout(Dt,180)}function za(){let L=P=>!!(P instanceof Element&&P.closest(".cylon-help-panel, .cylon-gameover, .cylon-settings-panel"));document.addEventListener("wheel",P=>{document.body.classList.contains("cylon-game-live")&&(L(P.target)||P.preventDefault())},{passive:!1}),document.addEventListener("touchmove",P=>{if(!document.body.classList.contains("cylon-game-live"))return;let Y=P.target;Y&&Y.closest&&Y.closest(".site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel")||P.preventDefault()},{passive:!1})}function nn(){Q&&ra(Q,{open:Te,touch:Ue,onClose:Ua})}function Ro(){A.paused||(A.paused=!0,A.pauseStartedAt=Date.now(),clearTimeout(A.idleTimer??void 0),It.pause(),clearTimeout(Fe??void 0),clearTimeout(ce??void 0),clearTimeout(be??void 0),Fe=null,ce=null,be=null,j(!1),he.syncMusic(),wt())}function Io(){if(!A.paused)return;let L=Date.now()-A.pauseStartedAt;qa(L),A.paused=!1,A.pauseStartedAt=0,he.syncMusic(),wt(),we()}let on=!1;function Va(){sa({doc:document,win:window},{hide(){pe.gameEnabled&&!A.paused&&(Ro(),on=!0),he.pageHide()},show(){he.pageShow(),on&&!Te&&Io(),on=!1},close:he.pageClose})}function $a(){Q&&(Ro(),on=!1,se?.focus(),Te=!0,nn())}function Ua(){Te&&(Te=!1,nn(),Io())}function Xa(){nn(),se&&se.addEventListener("click",L=>{L.preventDefault(),L.stopPropagation(),$a()})}function Po(){return Nn(A.run.hitCount)}function Ka(L){return qn(L)}function rn(){if(!s)return;let L=Po();s.textContent=String(L),s.classList.remove("is-hp-good","is-hp-mid","is-hp-low");let P=Ka(L);s.style.color=P.color,s.style.textShadow=`0 0 8px ${P.glow}`}function Wa(L=1,{fromNuke:P=!1}={}){if(A.run.gameOver||!Le())return;let Y=fo(A.run,L,At,P);A.run=Y.run,rn(),he.sfx("hit"),Lo(),Y.ends&&($t(),Bo(Y.ends))}function Do(L,P,Y,ae=!0){if(!L)return;let Ie=lr(Y,Date.now()),Be=Ie>0,lt=!Be&&ae&&Le();L.disabled=!lt,L.classList.toggle("is-cooling",Be),P&&(Be?(P.hidden=!1,P.textContent=String(Ie),P.setAttribute("aria-label",`${Ie} seconds remaining`)):(P.hidden=!0,P.textContent="",P.removeAttribute("aria-label")))}function Ya(){Do(x,f,A.schedule.raptorReadyAt,!m.raptorInbound())}function ja(){if(Do(S,v,m.grenadeArmed()?0:A.schedule.grenadeReadyAt,!0),!S)return;S.classList.toggle("is-armed",m.grenadeArmed());let L=S.querySelector(".cylon-raptor-btn-label");L&&(L.textContent=m.grenadeArmed()?"Armed":"Grenade"),document.body.classList.toggle("cylon-grenade-armed",m.grenadeArmed())}function wt(){Ya(),ja()}function Ja(){E&&E.classList.remove("is-inbound"),g&&(g.innerHTML="")}function Pn(){m.reset(),document.body.classList.remove("cylon-grenade-armed"),le(),wt()}function Qa(L,P){let Y=L,ae=P,Ie=document.createElement("div");Ie.className="cylon-grenade-blast",Ie.style.left=`${Y}px`,Ie.style.top=`${ae}px`,Ie.setAttribute("aria-hidden","true"),r?.appendChild(Ie),Pt(Y,ae,ct.medium);for(let Be=0;Be<2;Be++){let lt=Math.random()*Math.PI*2,kt=te(ee*.35,ee*.85);Pt(Y+Math.cos(lt)*kt,ae+Math.sin(lt)*kt,{radius:te(36,64),holdMs:ct.small.holdMs,fadeMs:ct.small.fadeMs})}I(Y,ae,ve,{radius:ee*1.2}),setTimeout(()=>Ie.remove(),480),We().forEach(Be=>{if(Be.dataset.ko==="1")return;let lt=(parseFloat(Be.style.left)||0)+Je.w/2,kt=(parseFloat(Be.style.top)||0)+Je.h/2;Math.hypot(lt-Y,kt-ae)<=ee&&Ne(Be)})}function Za(){if(!g)return;g.innerHTML="";let L=10,P=110;for(let Y=0;Y<L;Y++)setTimeout(()=>{if(!Le())return;let ae=document.createElement("span");ae.className="cylon-raptor-impact";let Ie=12+Math.random()*76,Be=40+Math.random()*50;ae.style.left=`${Ie}%`,ae.style.top=`${Be}%`,g.appendChild(ae);let lt=window.scrollX+Ie/100*window.innerWidth,kt=window.scrollY+Be/100*window.innerHeight;Pt(lt,kt,ct.medium),I(lt,kt,xe,{radius:P}),setTimeout(()=>ae.remove(),560)},Y*55)}function ei(){let L=window.innerWidth||1,Y=(window.innerHeight||1)*.62,ae=Math.min(220,L*.28);for(let Ie=0;Ie<5;Ie++){let Be=L*(.18+Ie*.16);M(Be,Y,fe,{radius:ae})}Za(),tt()}function ti(){if(!pe.gameEnabled||A.run.gameOver)return;Ao();let L=(window.innerWidth||1)/2,P=(window.innerHeight||1)*.48,Y=L+Ct(),ae=P+Lt();requestAnimationFrame(()=>{q(Y,ae,1.35),setTimeout(()=>q(Y,ae,1.1),280)}),A.run=po(A.run,Date.now()),Na(),Ue?(ge(),document.body.classList.add("cylon-touch-play")):Ae(),we(),wt()}function Bo(L){if(A.run.gameOver)return;A.run=yo(A.run,L);let P=L==="hits"||L==="nuke";$e(),tn(),$t(),clearTimeout(A.idleTimer??void 0),j(!1),st.cancel(),A.draggingReticle=!1,A.reticlePointerId=null,Pn(),P||(pe.gameEnabled=!1,Ce(),document.body.classList.remove("cylon-touch-play")),Oe(),we(),he.syncMusic(),P||Ln(),ze(L)}function Fo(){A.run=uo(A.run),$t(),p&&(p.textContent="0"),rn()}function Dn(L){let P=pe.gameEnabled;if(!L&&P&&!A.run.gameOver&&A.run.koScore>0){Bo("quit");return}pe.gameEnabled=L,Ce(),L?(P||an("game_start"),st.cancel(),$e(),tn(),De(),Fo(),Pn(),Oe(),we(),he.syncMusic(),Ln({deferScatter:!0}),st.play()):(st.cancel(),$e(),tn(),$t(),A.run=mo(A.run),clearTimeout(A.idleTimer??void 0),j(!1),A.draggingReticle=!1,A.reticlePointerId=null,A.paused=!1,A.pauseStartedAt=0,document.body.classList.remove("cylon-touch-play"),De(),A.run=go(bo(A.run)),Te&&(Te=!1,nn()),Pn(),Oe(),we(),he.syncMusic(),Ln(),Ho())}async function Ho(){await ia(Sn())!=="title-with-hint"||!T||(T.textContent=aa,T.hidden=!1,clearTimeout(w??void 0),w=setTimeout(()=>{T.hidden=!0},6e3))}function ni(){let L=(P,Y)=>{P&&(P.addEventListener("pointerup",ae=>{A.reticlePointerId!=null&&ae.pointerId===A.reticlePointerId||ae.pointerType==="mouse"&&ae.button!=null&&ae.button!==0||(ae.preventDefault(),ae.stopPropagation(),Y())}),P.addEventListener("click",ae=>{ae.detail===0?(ae.preventDefault(),Y()):ae.preventDefault()}))};L(x,()=>{m.callRaptor()}),L(S,()=>{m.readyGrenade()}),window.addEventListener("keydown",P=>{if(dn(P.target))return;let Y=sr(P);Y==="disarm"?m.cancelGrenadeArm():Y==="raptor"?(P.preventDefault(),m.callRaptor()):Y==="grenade"&&(P.preventDefault(),m.readyGrenade())}),window.addEventListener("pointerdown",P=>{if(!m.grenadeArmed()||P.button!=null&&P.button!==0)return;let Y=P.target;Y&&(Y.closest("#cylon-grenade-btn")||Y.closest("#cylon-raptor-btn")||Y.closest("#cylon-game-toggle")||Y.closest("#cylon-settings")||Y.closest("#theme-toggle")||Y.closest("#site-nav-burger")||Y.closest("#site-nav-menu a")||Y.closest("#cylon-help-btn")||Y.closest("#cylon-help")||Y.closest(".site-brand")||Y.closest("#cylon-gameover"))||(P.preventDefault(),m.throwGrenadeAt(P.pageX,P.pageY))},!0),clearInterval(Xe??void 0),Xe=setInterval(wt,250),wt()}window.cylonStartGame=()=>{pe.gameEnabled||A.run.gameOver||(Dn(!0),window.scrollTo({top:0,behavior:me?"auto":"smooth"}))},Gt(),et(),ni(),Pa(),He(),za(),Zt(),Xa(),Va(),Bs(),zt(),rn(),Ve(),we(),Se(),Qe(),window.addEventListener("resize",zt),window.addEventListener("pointermove",Re,{passive:!0}),window.addEventListener("scroll",Ga,{passive:!0}),window.addEventListener("pointerdown",he.unlock,{passive:!0}),window.addEventListener("keydown",he.unlock,{passive:!0}),document.addEventListener("selectstart",L=>{document.body.classList.contains("cylon-game-live")&&L.preventDefault()}),document.addEventListener("dragstart",L=>{document.body.classList.contains("cylon-game-live")&&L.preventDefault()}),requestAnimationFrame(ye),Ia(!0)}var Mt={a:1,b:0,c:0,d:1,e:0,f:0};function yt(e,t){return{a:e.a*t.a+e.c*t.b,b:e.b*t.a+e.d*t.b,c:e.a*t.c+e.c*t.d,d:e.b*t.c+e.d*t.d,e:e.a*t.e+e.c*t.f+e.e,f:e.b*t.e+e.d*t.f+e.f}}function En(e){let t=e.a*e.d-e.b*e.c||1e-12;return{a:e.d/t,b:-e.b/t,c:-e.c/t,d:e.a/t,e:(e.c*e.f-e.d*e.e)/t,f:(e.b*e.e-e.a*e.f)/t}}function jt(e,t,n){return{x:e.a*t+e.c*n+e.e,y:e.b*t+e.d*n+e.f}}function Tn(e,t,n){return yt(yt({...Mt,e:t,f:n},e),{...Mt,e:-t,f:-n})}function _o(e,t,n){let o=n*Math.PI/180,r=Math.cos(o),a=Math.sin(o);return{a:r,b:a,c:-a,d:r,e,f:t}}function So(e,t,n,o){let r=3*e,a=3*(n-e)-r,i=1-r-a,u=3*t,l=3*(o-t)-u,p=1-u-l,s=g=>((i*g+a)*g+r)*g,_=g=>((p*g+l)*g+u)*g,E=g=>(3*i*g+2*a)*g+r;return g=>{if(g<=0)return 0;if(g>=1)return 1;let x=g;for(let v=0;v<8;v++){let F=s(x)-g;if(Math.abs(F)<1e-6)return _(x);let h=E(x);if(Math.abs(h)<1e-6)break;x-=F/h}let f=0,S=1;x=g;for(let v=0;v<30;v++){let F=s(x);if(Math.abs(F-g)<1e-6)break;F<g?f=x:S=x,x=(f+S)/2}return _(x)}}var xa=So(.22,.7,.2,1),wa=So(.15,.85,.25,1),Eo=So(.25,.1,.25,1);function gt(e,t){return e.ms<=0||t>=e.t0+e.ms?e.to:t<=e.t0?e.from:e.from+(e.to-e.from)*e.ease((t-e.t0)/e.ms)}function bt(e,t,n,o,r){return{from:gt(e,n),to:t,t0:n,ms:o,ease:r}}var Jt=e=>({from:e,to:e,t0:0,ms:0,ease:Eo});function Qt(e,t){return e.ms>0&&t<e.t0+e.ms&&e.from!==e.to}function ka(e){let t=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(e.trim());if(t)return{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16),a:1};let n=/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i.exec(e.trim());if(!n)return null;let o=n[4]===void 0?1:n[4].endsWith("%")?parseFloat(n[4])/100:parseFloat(n[4]);return{r:+n[1],g:+n[2],b:+n[3],a:o}}function _a(e,t,n){let o=e.a*n+t.a*(1-n);if(o<=0)return{r:0,g:0,b:0,a:0};let r=(a,i)=>Math.round((a*e.a*n+i*t.a*(1-n))/o);return{r:r(e.r,t.r),g:r(e.g,t.g),b:r(e.b,t.b),a:o}}var Mn=e=>`rgba(${e.r}, ${e.g}, ${e.b}, ${+e.a.toFixed(3)})`;function Sa(e,t){let n=/^\s*([\d.]+)(ms|s)\s*$/.exec(e);return n?n[2]==="s"?parseFloat(n[1])*1e3:parseFloat(n[1]):t}var Hs=320,Os=450,Ns=1600,Ea={r:90,g:88,b:84,a:1},qs=[[0,1.5,"rgba(0, 0, 0, 0.4)"],[-1.8,.4,"rgba(40, 90, 160, 0.45)"],[1.8,0,"rgba(160, 35, 35, 0.5)"]],Gs=.55,Nt=3,An=2048,zs=6e3,Vs=new Set(["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","TEXTAREA","SELECT","OPTION","svg","SVG","CANVAS","IFRAME","VIDEO","AUDIO"]),Ta=e=>{if(!e||e==="none")return Mt;let t=new DOMMatrixReadOnly(e);return{a:t.a,b:t.b,c:t.c,d:t.d,e:t.e,f:t.f}},$s=e=>Math.abs(e.a-1)<.001&&Math.abs(e.d-1)<.001&&Math.abs(e.b)<.001&&Math.abs(e.c)<.001;function Ma(e){let{doc:t,win:n}=e,o=e.max??zs,r=t.body,a=null,i=null,u=1,l=[],p=[],s=[],_=new Map,E=new Map,g=[],x=new Set,f=()=>({sx:0,sy:0,sr:0}),S=!1,v=0,F=0,h=null,c=null,d=null,y=[],T=new Map,w=0,C=0,H=0,G=new Map,z=null,D=()=>n.performance.now(),X=()=>r.classList.contains("cylon-glyphs-blown"),K=()=>r.classList.contains("cylon-glyphs-blowing"),ue=()=>Sa(n.getComputedStyle(r).getPropertyValue("--cylon-desolate-fade"),Ns);function $(){return z||(z=t.createElement("canvas").getContext("2d",{willReadFrequently:!0})),z}function U(k){let R=G.get(k);if(!R){let B=$();B.font=k;let N=B.measureText("Mg");R={asc:Math.round(N.fontBoundingBoxAscent||N.actualBoundingBoxAscent),desc:Math.round(N.fontBoundingBoxDescent||N.actualBoundingBoxDescent)},G.set(k,R)}return R}function se(k){let R=$();R.fillStyle="#000",R.fillStyle=k;let B=ka(String(R.fillStyle));if(B)return B;R.setTransform(1,0,0,1,0,0),R.clearRect(0,0,1,1),R.fillRect(0,0,1,1);let[N=0,O=0,W=0,V=0]=R.getImageData(0,0,1,1).data;return{r:N,g:O,b:W,a:V/255}}function Q(k,R){let B=`${R}|${k.style.font}|${Mn(k.style.color)}|${k.ch}`,N=T.get(B);if(N)return N;let O=$();O.font=k.style.font;let W=O.measureText(k.ch),V=Math.max(W.width,(W.actualBoundingBoxLeft||0)+(W.actualBoundingBoxRight||0))+Nt*2,oe=k.style.asc+k.style.desc+Nt*2,de=Math.ceil(V*u),ve=Math.ceil(oe*u);if(w+de>An&&(w=0,C+=H+1,H=0),!y.length||C+ve>An){let Se=t.createElement("canvas");Se.width=An,Se.height=An,y.push(Se),w=0,C=0,H=0}let xe=y.length-1,fe=y[xe].getContext("2d"),Me={page:xe,sx:w,sy:C,sw:de,sh:ve};fe.setTransform(u,0,0,u,w,C),fe.font=k.style.font,fe.textBaseline="alphabetic";let ee=Nt,J=Nt+k.style.asc;if(R==="blown"){for(let[Se,Qe,De]of qs)fe.fillStyle=De,fe.fillText(k.ch,ee+Se,J+Qe);fe.fillStyle=Mn(_a(k.style.color,Ea,.38))}else fe.fillStyle=Mn(k.style.color);return fe.fillText(k.ch,ee,J),w+=de+1,H=Math.max(H,ve),T.set(B,Me),Me}function Te(k,R){let B=E.get(k);if(B)return B;let N=n.getComputedStyle(k),O=k===R||!k.parentElement?null:Te(k.parentElement,R),W=O?O.ok:!0;(Vs.has(k.tagName)||k.closest("svg"))&&(W=!1),(N.visibility==="hidden"||N.display==="none")&&(W=!1),(N.clipPath!=="none"||N.clip&&N.clip!=="auto")&&(W=!1),N.overflow!=="visible"&&k.offsetWidth<=2&&(W=!1);let V=N.getPropertyValue("-webkit-text-fill-color"),oe=se(N.color);(!oe||oe.a<=0)&&(W=!1),V&&se(V)?.a===0&&(W=!1);let de=(O?O.opacity:1)*(parseFloat(N.opacity)||0);de<=0&&(W=!1);let ve=`${N.fontStyle} ${N.fontWeight} ${N.fontSize} ${N.fontFamily}`,xe=N.textTransform,{asc:fe,desc:Me}=U(ve),ee={ok:W,font:ve,color:oe??Ea,opacity:de,upper:xe==="uppercase"||xe==="capitalize",lower:xe==="lowercase",asc:fe,desc:Me};return E.set(k,ee),ee}function me(k,R){let B=_.get(k);if(B)return B;let N;if(k===R){let O=n.getComputedStyle(R).position;N={el:k,style:n.getComputedStyle(k),parent:null,fixed:O==="fixed"||O==="sticky",blocks:0,ox:0,oy:0,world:Mt},s.push(N)}else{let O=me(k.parentElement??R,R),W=n.getComputedStyle(k);if(!(k.classList.contains("cylon-scatter-block")&&W.display!=="inline"&&W.display!=="contents"))return _.set(k,O),O;N={el:k,style:W,parent:O,fixed:O.fixed,blocks:O.blocks+1,ox:0,oy:0,world:Mt},s.push(N)}return _.set(k,N),N}function Ue(){let k=n.scrollX,R=n.scrollY;for(let B of s){let N=B.el.getBoundingClientRect(),O=B.parent?B.parent.world:Mt,W=Ta(B.style.transform),V=jt(En(O),N.left+N.width/2+(B.fixed?0:k),N.top+N.height/2+(B.fixed?0:R));B.ox=V.x-W.e,B.oy=V.y-W.f,B.world=yt(O,Tn(W,B.ox,B.oy))}}function ot(){for(let k of s){let R=Tn(Ta(k.style.transform),k.ox,k.oy);k.world=k.parent?yt(k.parent.world,R):R}}let Pe=()=>t.createRange();function A(k,R){R.setStart(k.text,k.start),R.setEnd(k.text,k.end);let B=R.getBoundingClientRect();if(B.width<=0||B.height<=0)return null;let N=k.frame.fixed?{x:0,y:0}:{x:n.scrollX,y:n.scrollY},O=jt(En(k.frame.world),B.left+B.width/2+N.x,B.top+B.height/2+N.y);if($s(k.frame.world))return{lx:O.x,ly:O.y,w:B.width,h:B.height};let W=$();return W.font=k.style.font,{lx:O.x,ly:O.y,w:W.measureText(k.ch).width,h:k.style.asc+k.style.desc}}function Ge(k,R){let B=R.get(k);if(B)return B;let N=k.el,O=ve=>parseFloat(N.style?.getPropertyValue(ve)??"")||0,W=_o(O("--sx"),O("--sy"),O("--sr")),V=k.parent?1:.96,oe=Tn({a:W.a*V,b:W.b*V,c:W.c*V,d:W.d*V,e:W.e,f:W.f},k.ox,k.oy),de=k.parent?yt(Ge(k.parent,R),oe):oe;return R.set(k,de),de}function be(){if(!p.length||l.length>=o)return;ot();let k=n.innerWidth||1,R=n.innerHeight||1,B=n.scrollX,N=n.scrollY,O=k*.75,W=R*.75,V=Pe(),oe=new Map,de=[],ve=[];for(let ee of p){if(!ee.text.isConnected)continue;V.selectNodeContents(ee.text);let J=V.getBoundingClientRect();if(J.width<=0&&J.height<=0)continue;let Se=J.bottom>-W&&J.top<R+W&&J.right>-O&&J.left<k+O,Qe=!1;if(!Se){let De=ee.frame.fixed?0:B,ze=ee.frame.fixed?0:N,xt=yt(Ge(ee.frame,oe),En(ee.frame.world)),pe=1/0,Ce=1/0,Oe=-1/0,Ve=-1/0;for(let[qt,Gt]of[[J.left,J.top],[J.right,J.top],[J.left,J.bottom],[J.right,J.bottom]]){let et=jt(xt,qt+De,Gt+ze);pe=Math.min(pe,et.x-De),Oe=Math.max(Oe,et.x-De),Ce=Math.min(Ce,et.y-ze),Ve=Math.max(Ve,et.y-ze)}Qe=Ve>-W&&Ce<R+W&&Oe>-O&&pe<k+O}if(!Se&&!Qe){ve.push(ee);continue}de.push({p:ee,dist:Math.abs(J.top+J.height/2-R/2)})}de.sort((ee,J)=>ee.dist-J.dist);let xe=[],fe=[],Me=S;for(let{p:ee}of de){if(l.length+xe.length>=o){ve.push(ee);continue}let J=ee.text.parentElement;if(!J)continue;let Se=Te(J,Xe(ee.frame));if(!Se.ok)continue;let Qe=ee.text.nodeValue??"",De=0;for(let ze of Qe){let xt=De;if(De+=ze.length,/^[\s­​-‍⁠﻿]$/.test(ze))continue;let pe=Se.upper?ze.toUpperCase():Se.lower?ze.toLowerCase():ze,Ce={text:ee.text,start:xt,end:De,ch:pe,frame:ee.frame,style:Se},Oe=A(Ce,V);if(!Oe)continue;let Ve=f();xe.push({...Ce,...Oe,v:Ve,rest:Q(Ce,"rest"),blown:Q(Ce,"blown"),x:Jt(Me?Ve.sx:0),y:Jt(Me?Ve.sy:0),r:Jt(Me?Ve.sr:0),k:Jt(Me?1:0)})}fe.push(ee.text)}fe.forEach(rt),p=ve,l=l.concat(xe),Ke()}let Xe=k=>{let R=k;for(;R.parent;)R=R.parent;return R.el};function rt(k){let R=k.parentElement;if(!R)return;let B=t.createElement("span");B.className="cylon-glyph-src",k.replaceWith(B),B.appendChild(k),g.push(B),R.classList.add("cylon-glyph-parent"),x.add(R)}function Fe(){a&&(u=Math.min(3,n.devicePixelRatio||1),a.width=Math.round((n.innerWidth||1)*u),a.height=Math.round((n.innerHeight||1)*u))}function ce(k,R,B){let N=D();for(let O of l)O.x=bt(O.x,S?O.v.sx:0,N,k,B),O.y=bt(O.y,S?O.v.sy:0,N,k,B),O.r=bt(O.r,S?O.v.sr:0,N,k,B),O.k=bt(O.k,S?1:0,N,R,Eo)}function at(){if(K()){let k=ue();return{ms:k,lookMs:k,ease:wa}}return{ms:Hs,lookMs:Os,ease:xa}}function je(){let k=X();if(k===S)return;S=k;let{ms:R,lookMs:B,ease:N}=at();ce(R,B,N),Ze(Math.max(R,B)+200)}function Je(k){if(!a||!i)return!1;let R=n.innerWidth||1,B=n.innerHeight||1,N=n.scrollX,O=n.scrollY;i.setTransform(1,0,0,1,0,0),i.clearRect(0,0,a.width,a.height);let W=!1;for(let V of l){(Qt(V.x,k)||Qt(V.y,k)||Qt(V.r,k)||Qt(V.k,k))&&(W=!0);let oe=yt(V.frame.world,_o(V.lx+gt(V.x,k),V.ly+gt(V.y,k),gt(V.r,k))),de=V.frame.fixed?oe.e:oe.e-N,ve=V.frame.fixed?oe.f:oe.f-O;if(de<-80||ve<-80||de>R+80||ve>B+80)continue;let xe=gt(V.k,k),fe=V.style.opacity*(1+(Math.pow(Gs,V.frame.blocks)-1)*xe);i.setTransform(u*oe.a,u*oe.b,u*oe.c,u*oe.d,u*de,u*ve);let Me=-V.w/2-Nt,ee=-V.h/2-Nt;if(xe<1){let J=V.rest;i.globalAlpha=fe*(1-xe),i.drawImage(y[J.page],J.sx,J.sy,J.sw,J.sh,Me,ee,J.sw/u,J.sh/u)}if(xe>0){let J=V.blown;i.globalAlpha=fe*xe,i.drawImage(y[J.page],J.sx,J.sy,J.sw,J.sh,Me,ee,J.sw/u,J.sh/u)}}return i.globalAlpha=1,W}function it(k){if(v=0,!a)return;let R=k<F;R&&ot(),(Je(k)||R)&&Ke()}function Ke(){!v&&a&&(v=n.requestAnimationFrame(it))}function Ze(k){F=Math.max(F,D()+k),Ke(),p.length&&At()}function At(){c&&clearTimeout(c),c=setTimeout(()=>{c=null,be()},150)}function ut(){Ke(),At()}function vt(){d&&clearTimeout(d),d=setTimeout(()=>{d=null,Fe(),Ue();let k=Pe();for(let R of l){let B=A(R,k);B&&Object.assign(R,B)}be(),Ke()},200)}return{scatter(k,R){if(!a){f=R,S=X();for(let B of k){let N=t.createTreeWalker(B,NodeFilter.SHOW_TEXT,{acceptNode(O){if(!O.nodeValue||!/\S/.test(O.nodeValue))return NodeFilter.FILTER_REJECT;let W=O.parentElement;return!W||W.closest(".cylon-glyph-src, .cylon-scatter-char")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});for(;N.nextNode();){let O=N.currentNode;p.push({text:O,frame:me(O.parentElement,B)})}}Ue(),a=t.createElement("canvas"),a.className="cylon-glyph-layer",a.setAttribute("aria-hidden","true"),i=a.getContext("2d"),Fe(),be(),r.appendChild(a),h=new MutationObserver(je),h.observe(r,{attributes:!0,attributeFilter:["class"]}),n.addEventListener("scroll",ut,{passive:!0}),n.addEventListener("resize",vt),Ke()}},restore(){v&&n.cancelAnimationFrame(v),v=0,h?.disconnect(),h=null,n.removeEventListener("scroll",ut),n.removeEventListener("resize",vt),c&&clearTimeout(c),d&&clearTimeout(d),c=null,d=null;for(let k of g){let R=k.firstChild;R?k.replaceWith(R):k.remove()}g.length=0,x.forEach(k=>k.classList.remove("cylon-glyph-parent")),x.clear(),a?.remove(),a=null,i=null,l=[],p=[],s=[],_.clear(),E.clear(),y.length=0,T.clear(),w=0,C=0,H=0,S=!1,F=0},reshuffle(k){f=k;for(let O of l)O.v=k();let{ms:R,lookMs:B,ease:N}=at();S=X(),ce(R,B,N),Ze(Math.max(R,B)+200)},kick(k){if(!l.length)return;let R=D(),B=n.scrollX,N=n.scrollY,{ms:O,ease:W}=at();for(let V of l){let oe=jt(V.frame.world,V.lx+gt(V.x,R),V.ly+gt(V.y,R)),de=k(V.frame.fixed?oe.x+B:oe.x,V.frame.fixed?oe.y+N:oe.y,V.v);de&&(V.v=de,S&&(V.x=bt(V.x,de.sx,R,O,W),V.y=bt(V.y,de.sy,R,O,W),V.r=bt(V.r,de.sr,R,O,W)))}Ke()},poke:Ze,count:()=>l.length}}var Us=[No,qo,Go,zo,Vo,$o,Uo,Xo,Ko,Wo,Yo,jo,Jo],Xs="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&display=swap",Ks="cic-embed",Aa="cic-embed-launch",Ca="cic-embed-bar",Ws=new Set(["SCRIPT","STYLE","LINK","META","NOSCRIPT","TEMPLATE","IFRAME"]),Ys="img, picture, figure, video, svg, blockquote, pre, table, form, button, input, h4, h5, h6, .wp-block-image, .wp-block-button",Cn=(e,t)=>{console.error(`The CIC: ${e}`,t??"")},js=`
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
</div>`;function Js(e){for(let t of Array.from(document.body.children))Ws.has(t.tagName)||e.has(t)||(t.classList.add("page-panel","cic-embed-host"),getComputedStyle(t).position==="static"&&t.classList.add("cic-embed-host-static"),t.querySelectorAll(Ys).forEach(n=>n.classList.add("cylon-debris")))}var La=!1;async function Qs(e){if(La)return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){e.textContent="The CIC Rests (Reduced Motion)",e.disabled=!0;return}if(document.getElementById("game-root")||document.getElementById(Ca)){Cn("this page already has a #game-root; not launching");return}La=!0,e.remove();let t=document.createElement("link");t.rel="stylesheet",t.href=Xs,document.head.appendChild(t);let n=document.createElement("style");n.id="cic-embed-style",n.textContent=Us.join(`
`),document.head.appendChild(n);let o=document.createElement("div");o.id="game-root",o.dataset.game="cylon";let r=document.createElement("header");r.id=Ca,r.className="site-nav",r.innerHTML=js,Js(new Set([o,r])),document.body.prepend(o),document.body.appendChild(r),document.documentElement.classList.add("cic-embed-on"),document.body.classList.add("cic-embed-on"),r.querySelector("#cic-embed-leave")?.addEventListener("click",()=>{location.reload()}),await ba({mountHtml:Oo,localScores:!0,glyphLayer:Ma({doc:document,win:window})}),window.cylonStartGame?.()}function Ra(){if(document.getElementById(Aa))return;let e=document.createElement("button");e.type="button",e.id=Aa,e.textContent="Play The CIC",e.title="Play The CIC on this page",e.setAttribute("style",["font: 700 14px/1.2 system-ui, sans-serif","letter-spacing: .06em","color: #fff","background: #8a0a0a","border: 1px solid #ff5555","border-radius: 6px","padding: 10px 16px","cursor: pointer","box-shadow: 0 4px 14px rgba(0,0,0,.35)"].join(";")),e.addEventListener("click",()=>{Qs(e).catch(n=>Cn("the game failed to start",n))});let t=document.getElementById(Ks);t?t.appendChild(e):(e.style.cssText+=";position:fixed;right:16px;bottom:16px;z-index:2147483000",document.body.appendChild(e))}try{document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{try{Ra()}catch(e){Cn("the launcher failed",e)}}):Ra()}catch(e){Cn("the launcher failed",e)}})();
//# sourceMappingURL=embed.js.map
