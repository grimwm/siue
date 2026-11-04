/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */
"use strict";(()=>{var Ia=Object.defineProperty;var _n=(e,t)=>{for(var n in t)Ia(e,n,{get:t[n],enumerable:!0})};var ko=`<!-- Cylon Defense — FX / overlays injected into #game-root -->
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
`;var _o=`/* The games kit's opt-in stylesheet. Every selector carries a .kit- class and
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
`;var So=`/* Cylon Defense: The scanner bar, the eye and its glare cone, and the home page eye (two sweeps, then the red fill).
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


`;var Eo=`/* Cylon Defense: The combat nav: control box, the fade between civil and combat chrome, the mobile layout.
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
`;var To=`/* Cylon Defense: The How to Play overlay.
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
`;var Ao=`/* Cylon Defense: The touch-play layout, the reticle, and the KO and hull readouts.
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


`;var Mo=`/* Cylon Defense: The game-over panel: the initials entry, the buttons and the board.
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
`;var Co=`/* Cylon Defense: The settings gear and its panel.
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


`;var Lo=`/* Cylon Defense: The Game On toggle, the grenade and raptor buttons, and the high-score list.
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


`;var Po=`/* Cylon Defense: The grenade blast, the scorched holes, and the page rules that hold while a run is live.
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


`;var Ro=`/* Cylon Defense: The battlefield: drones and their bolts, the raptor, the missiles and the nuke.
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


`;var Io=`/* Cylon Defense: The world-ended look: fracture and ash, the scattered glyphs and panels.
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


`;var Do=`/* Cylon Defense: The intro title card: "The CIC" and its glide into the brand.
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

`;var Bo=`/* Cylon Defense: the embed's own rules (src/embed.ts): the home page's dark tokens, the combat bar and the host page's panels.
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
`;var Wa="__siteStats",Ya="__siteStatsQ";function ja(e,t,n){try{let o=globalThis,r=o[Wa];if(r){r.event(e,t,n);return}let a=o[Ya]??=[];a.length<50&&a.push([e,t,n])}catch{}}function Ho(e){return(t,n)=>ja(e,t,n)}var Gt=Ho("cylon");var zt={};_n(zt,{BOT_CAP_PER_KOS:()=>Za,BOT_CAP_START:()=>Qa,MAX_HITS:()=>Ja,MISSILE_GROUND_CAP_MAX:()=>ni,MISSILE_TRACKER_CAP_MAX:()=>ti,MISSILE_TRACKER_CHANCE_BASE:()=>ei,botCap:()=>ii,currentHp:()=>An,difficultyFactor:()=>Sn,groundMissileCap:()=>oi,hpTint:()=>Mn,killLevel:()=>dt,lerp:()=>je,nextMissileDelayMs:()=>En,nextNukeDelayMs:()=>Tn,planWave:()=>si,trackerMissileCap:()=>ri,trackerMissileChance:()=>ai,volumeToGain:()=>Cn});var Ja=30,Qa=4,Za=5,ei=.14,ti=3,ni=5;function je(e,t,n){return e+(t-e)*Math.min(1,Math.max(0,n))}function dt(e){return Math.floor(e/5)}function Sn(e,t,n){if(!t)return 0;let o=(n-t)/6e4,r=Math.min(1,o/3.5),a=Math.min(1,dt(e)/10);return Math.min(1,a*.75+r*.25)}function En(e,t){let n=Math.min(1,dt(e)/10),o=je(8500,3400,n),r=je(2800,1600,n);return Math.max(2400,o-r/2+t()*r)}function Tn(e,t){let n=je(32500,24e3,e),o=je(15e3,12e3,e);return n-o/2+t()*o}function oi(e){return Math.min(5,1+Math.floor(dt(e)/2))}function ri(e){let t=dt(e);return t<3?1:t<7?2:Math.min(3,3)}function ai(e){return Math.min(.34,.14+dt(e)*.02)}function ii(e,t){return Math.min(t,4+Math.floor(e/5))}function si(e,t,n){let o=n()<.55,r=Math.min(e,Math.max(2,Math.min(4,Math.floor(t/3)))),a=o?Math.min(e,2+Math.floor(n()*Math.max(1,r-1))):1;return{isWave:o,count:a}}function An(e){return Math.max(0,30-e)}function Mn(e){let t=(s,h,l)=>Math.round(s+(h-s)*l),n=(s,h,l)=>({r:t(s.r,h.r,l),g:t(s.g,h.g,l),b:t(s.b,h.b,l)}),o={r:125,g:255,b:154},r={r:255,g:210,b:74},a={r:255,g:72,b:72},i=Math.max(0,Math.min(1,e/30)),c=i>=.5?n(r,o,(i-.5)/.5):n(a,r,i/.5);return{color:`rgb(${c.r}, ${c.g}, ${c.b})`,glow:`rgba(${c.r}, ${c.g}, ${c.b}, 0.55)`}}function Cn(e,t="sfx"){let n=Math.max(0,Math.min(100,Number(e)||0))/100;if(t==="music")return Math.min(2.5,n/.5*1.25);let r=(n<=.5?n/.5*85:85+(n-.5)/.5*15)/100;return r*r}var Pn={};_n(Pn,{botPageRect:()=>Oo,candidateSpots:()=>qo,clampToBounds:()=>Vt,findSafeSpot:()=>di,inflate:()=>li,isInBounds:()=>No,isSafeSpot:()=>kt,marchOrigin:()=>ui,randomVisibleSpot:()=>Ln,rectsOverlap:()=>Fo,visibleBounds:()=>ci});function Fo(e,t){return!(e.right<t.left||e.left>t.right||e.bottom<t.top||e.top>t.bottom)}function li(e,t){return{left:e.left-t,top:e.top-t,right:e.right+t,bottom:e.bottom+t}}function Oo(e,t,n){return{left:e,top:t,right:e+n.w,bottom:t+n.h}}function ci(e,t){let n=Math.max(72,e.navBottom+10),o=10,r=e.scrollX+o,a=e.scrollY+n,i=e.scrollX+e.width-t.w-o,c=e.scrollY+e.height-t.h-o-6;return{left:r,top:a,right:Math.max(r,i),bottom:Math.max(a,c)}}function Vt(e,t,n){return{x:Math.min(Math.max(e.left,t),e.right),y:Math.min(Math.max(e.top,n),e.bottom)}}function No(e,t,n){return t>=e.left-2&&t<=e.right+2&&n>=e.top-2&&n<=e.bottom+2}function kt(e,t,n,o,r){let a=Oo(e,t,r);return e<4||t<70||e+r.w>o.w-4||t+r.h>o.h-4?!1:!n.some(i=>Fo(a,i))}function Ln(e,t){let n=e.bounds,o=Math.max(1,n.right-n.left),r=Math.max(1,n.bottom-n.top);for(let i=0;i<36;i++){let c=n.left+t()*o,s=n.top+t()*r;if(kt(c,s,e.forbidden,e.doc,e.bot))return{x:c,y:s,edge:"return"}}let a=Vt(n,(n.left+n.right)/2,(n.top+n.bottom)/2);return kt(a.x,a.y,e.forbidden,e.doc,e.bot)?{...a,edge:"return"}:null}function qo(e,t){let n=[],o=["left","right","bottom"],r=Math.max(40,e.bottom-e.top),a=Math.max(40,e.right-e.left);o.forEach(i=>{for(let c=0;c<10;c++){let s,h;i==="left"?(s=e.left,h=e.top+t()*r):i==="right"?(s=e.right,h=e.top+t()*r):(s=e.left+t()*a,h=e.bottom-t()*Math.min(36,r*.25));let l=Vt(e,s,h);n.push({...l,edge:i})}});for(let i=n.length-1;i>0;i--){let c=Math.floor(t()*(i+1)),s=n[i];n[i]=n[c],n[c]=s}return n}function di(e,t,n){if(t)if(No(e.bounds,t.x,t.y))for(let o=0;o<28;o++){let r=t.x+(n()-.5)*200,a=t.y+(n()-.5)*140,i=Vt(e.bounds,r,a);if(kt(i.x,i.y,e.forbidden,e.doc,e.bot))return{x:i.x,y:i.y,edge:"patrol"}}else{let o=Ln(e,n);if(o)return o}for(let o of qo(e.bounds,n))if(kt(o.x,o.y,e.forbidden,e.doc,e.bot))return o;return Ln(e,n)}function ui(e,t,n){return t.edge==="left"?{x:e.left-n.w+6,y:t.y}:t.edge==="right"?{x:e.right+n.w-6,y:t.y}:{x:t.x,y:e.bottom+n.h-6}}var Rn=["sfx","music"];function pi(){let e=globalThis,t=e.AudioContext||e.webkitAudioContext;return t?new t:null}function Go(e={}){let t=e.createContext??pi,n=null,o=!1,r=!1,a=[],i=null,c={sfx:1,music:1},s={sfx:!1,music:!1},h={};function l(f){let d=h[f];if(!d||!n)return;let u=s[f]?0:c[f];try{d.gain.cancelScheduledValues(n.currentTime),d.gain.setValueAtTime(u,n.currentTime)}catch{d.gain.value=u}}function _(f){try{return Promise.resolve(f())}catch(d){return Promise.reject(d)}}function k(){if(!n){let d=null;try{if(d=t(),!d)return null;let u={};for(let g of Rn){let E=d.createGain();E.connect(d.destination),u[g]=E}n=d,Object.assign(h,u);for(let g of Rn)l(g)}catch{n=null;let u=d;return u&&_(()=>u.close()).catch(()=>{}),null}}let f=n;return f.state==="suspended"&&!r&&_(()=>f.resume()).catch(()=>{}),f}function b(f){let d=f===void 0?"sfx":typeof f=="string"?f:null;if(d&&s[d])return null;let u=k();if(!u)return null;let g=d?h[d]:f;return g?{c:u,node:g}:null}function w(f,d){let u=b(d);if(!u)return;let{c:g,node:E}=u;try{let v=f.at??g.currentTime+(f.when??0),A=f.vol??.05,R=g.createOscillator(),H=g.createGain();if(R.type=f.type??"square",R.frequency.setValueAtTime(f.freq,v),f.slideTo&&R.frequency.exponentialRampToValueAtTime(Math.max(1,f.slideTo),v+(f.slideDur??f.dur)),f.attack?(H.gain.setValueAtTime(1e-4,v),H.gain.exponentialRampToValueAtTime(A,v+f.attack)):H.gain.setValueAtTime(A,v),H.gain.exponentialRampToValueAtTime(1e-4,v+f.dur),f.filter){let F=m(g,f.filter,v,f.dur);R.connect(F),F.connect(H)}else R.connect(H);H.connect(E),R.start(v),R.stop(v+f.dur+(f.stopPad??.02))}catch{}}function m(f,d,u,g){let E=f.createBiquadFilter();if(E.type=d.type,E.frequency.setValueAtTime(d.freq,u),d.slideTo){let v=u+(d.slideDur??g);d.slide==="linear"?E.frequency.linearRampToValueAtTime(d.slideTo,v):E.frequency.exponentialRampToValueAtTime(Math.max(1,d.slideTo),v)}return E}function T(f,d){let u=b(d);if(!u)return;let{c:g,node:E}=u;try{let v=f.at??g.currentTime+(f.when??0),A=f.oscs.map(F=>{let I=g.createOscillator();return I.type=F.type,I.frequency.setValueAtTime(F.freq,v),I}),R=g.createGain();R.gain.setValueAtTime(1e-4,v);for(let F of f.envelope)F.ramp==="linear"?R.gain.linearRampToValueAtTime(F.to,v+F.at):R.gain.exponentialRampToValueAtTime(F.to,v+F.at);let H=f.filter?m(g,f.filter,v,f.dur):R;f.filter&&H.connect(R);for(let F of A)F.connect(H);R.connect(E);for(let F of A)F.start(v),F.stop(v+f.dur+(f.stopPad??.02))}catch{}}function x(f,d){let u=b(d);if(!u)return;let{c:g,node:E}=u;try{let v=f.at??g.currentTime+(f.when??0),A=g.createBufferSource();if(f.source==="fade"){let F=Math.max(1,Math.floor(g.sampleRate*f.dur)),I=g.createBuffer(1,F,g.sampleRate),V=I.getChannelData(0),G=f.fadePower??1;for(let ne=0;ne<F;ne++)V[ne]=(Math.random()*2-1)*(G===1?1-ne/F:Math.pow(1-ne/F,G));A.buffer=I}else{if(!i){i=g.createBuffer(1,g.sampleRate,g.sampleRate);let F=i.getChannelData(0);for(let I=0;I<F.length;I++)F[I]=Math.random()*2-1}A.buffer=i,A.loop=!0}let R=g.createBiquadFilter();R.type=f.filterType??"lowpass",R.frequency.setValueAtTime(f.filterFreq??1200,v),f.slideTo&&R.frequency.exponentialRampToValueAtTime(Math.max(1,f.slideTo),v+f.dur),f.filterQ!==void 0&&(R.Q.value=f.filterQ);let H=g.createGain();H.gain.setValueAtTime(f.vol,v),H.gain.exponentialRampToValueAtTime(1e-4,v+f.dur),A.connect(R),R.connect(H),H.connect(E),A.start(v),A.stop(v+f.dur+.02)}catch{}}function B(f){let d=k();if(!d||o)return;f&&a.push(f);let u=()=>{if(o||d.state!=="running")return;o=!0;try{let E=d.createGain();E.gain.value=1e-4;let v=d.createOscillator();v.connect(E),E.connect(d.destination),v.start(),v.stop(d.currentTime+.01)}catch{}let g=a;a=[];for(let E of g)E()};d.state==="running"?u():_(()=>d.resume()).then(u,()=>{})}return{context:k,peek:()=>n,bus:f=>h[f]??null,setGain(f,d){c[f]=d,l(f)},setMuted(f,d){s[f]=d,l(f)},isMuted:f=>s[f],unlock:B,suspend(){let f=n;f&&_(()=>f.suspend()).catch(()=>{})},hold(){r=!0;let f=n;f&&_(()=>f.suspend()).catch(()=>{})},release(){r=!1;let f=n;f&&_(()=>f.resume()).catch(()=>{})},wake(){let f=k();return f&&f.state==="suspended"&&_(()=>f.resume()).catch(()=>{}),f},close(){let f=n;n=null;for(let d of Rn)delete h[d];o=!1,a=[],i=null,f&&f.state!=="closed"&&_(()=>f.close()).catch(()=>{})},tone:w,noise:x,voice:T}}function $t(e,t,n,o=.09){e.tone({at:n,freq:85,slideTo:32,slideDur:.5,dur:.85,stopPad:.05,type:"sine",vol:o,attack:.015,filter:{type:"lowpass",freq:200,slideTo:55,slideDur:.45}},t),e.tone({at:n,freq:52,slideTo:24,slideDur:.4,dur:.55,stopPad:.05,type:"triangle",vol:o*.75,attack:.02},t)}function In(e,t,n,o=.035){e.noise({at:n,dur:.18,vol:o,source:"fade",fadePower:1.4,filterType:"bandpass",filterFreq:380,filterQ:.7},t)}function zo(e,t,n,o,r=3.2,a=.04){let i=Math.min(1.1,r*.35);e.voice({at:n,oscs:[{type:"sawtooth",freq:o},{type:"triangle",freq:o*1.498},{type:"sine",freq:o*.5}],filter:{type:"lowpass",freq:480,slideTo:280,slideDur:r,slide:"linear"},envelope:[{ramp:"linear",to:a,at:i},{ramp:"linear",to:a*.7,at:r*.7},{ramp:"exp",to:1e-4,at:r}],dur:r,stopPad:.05},t)}function Vo(e,t,n,o,r=4,a=.012){e.voice({at:n,oscs:[{type:"triangle",freq:o},{type:"sine",freq:o*1.02}],envelope:[{ramp:"linear",to:a,at:1.5},{ramp:"linear",to:a*.5,at:r*.8},{ramp:"exp",to:1e-4,at:r}],dur:r,stopPad:.05},t)}var mi={small:{thumpGain:.11,thumpDur:.28,crackGain:.08,crackDur:.12,debrisGain:.06,debrisDur:.22,rumbleGain:.05,rumbleDur:.35,thumpFreq:70,crackFreq:420},medium:{thumpGain:.16,thumpDur:.45,crackGain:.12,crackDur:.16,debrisGain:.1,debrisDur:.4,rumbleGain:.09,rumbleDur:.65,thumpFreq:55,crackFreq:380},large:{thumpGain:.2,thumpDur:.85,crackGain:.14,crackDur:.28,debrisGain:.12,debrisDur:.7,rumbleGain:.14,rumbleDur:1.4,thumpFreq:42,crackFreq:300}};function $o(e){let t=e.settings,n=Go({createContext:e.createContext}),o=null,r=[],a=null,i=!1,c=!1;function s(){let d=t();n.setMuted("sfx",!d.soundEnabled||d.soundVolume<=0),n.setGain("sfx",e.volumeToGain(d.soundVolume,"sfx"));let u=d.musicEnabled&&e.sessionActive()&&i;n.setGain("music",u?e.volumeToGain(d.musicVolume,"music"):0)}function h(){return s(),n.context()}function l(){return s(),n.isMuted("sfx")?null:n.context()}function _(){let d=t();c||!d.soundEnabled&&!d.musicEnabled||(s(),n.unlock(m))}function k(d,u){d.forEach(g=>{try{let E=g;typeof E.stop=="function"&&E.stop()}catch{}try{g.disconnect()}catch{}});try{u.disconnect()}catch{}}function b(d=!0){a&&(clearInterval(a),a=null);let u=n.peek(),g=o,E=r;if(i=!1,o=null,r=[],s(),!u||!g)return;let v=u.currentTime,A=()=>k(E,g);try{d?(g.gain.cancelScheduledValues(v),g.gain.setValueAtTime(Math.max(g.gain.value,1e-4),v),g.gain.exponentialRampToValueAtTime(1e-4,v+.9),setTimeout(A,950)):(g.gain.value=0,A())}catch{A()}}function w(){let d=t();if(i||!d.musicEnabled||d.musicVolume<=0||!e.sessionActive())return;let u=h(),g=n.bus("music");if(!u||!g)return;let E=()=>{if(i||!t().musicEnabled||!e.sessionActive())return;if(a&&(clearInterval(a),a=null),o){let Te=o,de=r;o=null,r=[],k(de,Te)}let v=u.createGain();v.gain.value=1e-4,v.connect(g);let A=u.createOscillator(),R=u.createOscillator(),H=u.createOscillator(),F=u.createGain(),I=u.createBiquadFilter();A.type="sawtooth",R.type="sine",H.type="triangle",A.frequency.value=36.71,R.frequency.value=55,H.frequency.value=38.89,I.type="lowpass",I.frequency.value=160,I.Q.value=.6,F.gain.value=.07,A.connect(I),R.connect(I),H.connect(I),I.connect(F),F.connect(v);let V=u.createOscillator(),G=u.createOscillator(),ne=u.createGain(),q=u.createBiquadFilter();V.type="sawtooth",G.type="triangle",V.frequency.value=73.42,G.frequency.value=87.31,q.type="lowpass",q.frequency.value=320,ne.gain.value=.028,V.connect(q),G.connect(q),q.connect(ne),ne.connect(v);let O=u.createOscillator(),Q=u.createGain();O.type="sine",O.frequency.value=.04,Q.gain.value=30,O.connect(Q),Q.connect(I.frequency);let K=u.currentTime;A.start(K),R.start(K),H.start(K),V.start(K),G.start(K),O.start(K),V.frequency.setValueAtTime(73.42,K),G.frequency.setValueAtTime(87.31,K),V.frequency.setValueAtTime(73.42,K+8),G.frequency.linearRampToValueAtTime(92.5,K+16),V.frequency.linearRampToValueAtTime(65.41,K+24),G.frequency.linearRampToValueAtTime(98,K+24),V.frequency.linearRampToValueAtTime(73.42,K+32),G.frequency.linearRampToValueAtTime(87.31,K+32),v.gain.setValueAtTime(1e-4,K),v.gain.exponentialRampToValueAtTime(1,K+1.2),o=v,r=[A,R,H,V,G,O,F,ne,I,q,Q],i=!0,s();let ce=60/50,Le=[73.42,69.3,65.41,87.31,73.42,55,82.41,73.42],et=[293.66,311.13,277.18,349.23],xe=0,M=()=>{let Te=n.peek();if(!i||!Te||!o)return;let de=Te.currentTime+.05,Ae=de,Ve=de+ce*2;$t(n,o,Ae,xe%2===0?.11:.08),xe%2===1?$t(n,o,Ve,.06):In(n,o,Ve,.03),zo(n,o,Ae+ce*.15,Le[xe%Le.length]??73.42,ce*3.4,.038),xe%2===0&&Vo(n,o,Ae+ce*.5,et[xe/2%et.length]??293.66,ce*3.6,.014),xe%4===3&&($t(n,o,Ae+ce*.75,.07),In(n,o,Ae+ce*1.1,.04)),xe+=1};M(),a=setInterval(M,4*ce*1e3-40)};u.state==="suspended"?u.resume().then(E).catch(()=>{}):E()}function m(){let d=t();!c&&e.sessionActive()&&d.musicEnabled&&d.musicVolume>0?i?s():w():b(!0)}function T({freq:d=440,freqEnd:u=null,type:g="square",duration:E=.12,gain:v=.08,delay:A=0}){n.tone({freq:d,dur:E,type:g,vol:v,slideTo:u,when:A,attack:.01})}function x({duration:d=.18,gain:u=.06,delay:g=0,filterFreq:E=900,filterType:v="bandpass"}={}){n.noise({dur:d,vol:u,when:g,filterFreq:E,filterType:v,source:"fade"})}function B(d,u=0){if(!l())return;let g=mi[d];T({freq:g.thumpFreq,freqEnd:Math.max(18,g.thumpFreq*.35),type:"sine",duration:g.thumpDur,gain:g.thumpGain,delay:u}),T({freq:g.thumpFreq*1.4,freqEnd:24,type:"triangle",duration:g.thumpDur*.85,gain:g.thumpGain*.55,delay:u+.02}),x({duration:g.crackDur,gain:g.crackGain,delay:u+.03,filterFreq:g.crackFreq,filterType:"bandpass"}),T({freq:900,freqEnd:120,type:"square",duration:g.crackDur*.7,gain:g.crackGain*.45,delay:u+.03}),x({duration:g.debrisDur,gain:g.debrisGain,delay:u+.06,filterFreq:1800,filterType:"highpass"}),x({duration:g.debrisDur*.8,gain:g.debrisGain*.7,delay:u+.08,filterFreq:700,filterType:"bandpass"}),T({freq:48,freqEnd:20,type:"sine",duration:g.rumbleDur,gain:g.rumbleGain,delay:u+.1}),x({duration:g.rumbleDur*.9,gain:g.rumbleGain*.65,delay:u+.12,filterFreq:180,filterType:"lowpass"})}let f={projectile(){T({freq:980,freqEnd:240,type:"sawtooth",duration:.14,gain:.07}),T({freq:1400,freqEnd:400,type:"square",duration:.08,gain:.035,delay:.01})},hit(){T({freq:160,freqEnd:70,type:"sawtooth",duration:.1,gain:.05}),x({duration:.08,gain:.04})},heal(){T({freq:280,freqEnd:540,type:"sine",duration:.18,gain:.05}),T({freq:420,freqEnd:660,type:"triangle",duration:.14,gain:.03,delay:.04})},ko(){B("small")},nuke(){B("large")},raptor(){T({freq:220,freqEnd:70,type:"sawtooth",duration:.7,gain:.09}),T({freq:140,freqEnd:55,type:"triangle",duration:.85,gain:.07,delay:.04}),x({duration:.55,gain:.08,filterFreq:700,filterType:"lowpass"}),x({duration:.4,gain:.05,delay:.15,filterFreq:2400,filterType:"highpass"}),[.45,.58,.7,.82,.94,1.06].forEach((d,u)=>{T({freq:980-u*40,freqEnd:180,type:"square",duration:.07,gain:.055,delay:d}),x({duration:.08,gain:.045,delay:d,filterFreq:1600})}),B("medium",.72),B("medium",1)},grenadeArm(){T({freq:640,freqEnd:420,type:"square",duration:.09,gain:.05}),T({freq:880,freqEnd:660,type:"triangle",duration:.07,gain:.035,delay:.04}),x({duration:.06,gain:.03,filterFreq:2200})},grenade(){T({freq:420,freqEnd:140,type:"sawtooth",duration:.14,gain:.05}),x({duration:.12,gain:.05,filterFreq:1800,filterType:"highpass"}),B("medium",.08)},missile(){T({freq:380,freqEnd:110,type:"sawtooth",duration:.22,gain:.055}),x({duration:.14,gain:.04,filterFreq:1400,filterType:"highpass"})},trackerMissile(){T({freq:520,freqEnd:160,type:"sawtooth",duration:.22,gain:.07}),x({duration:.14,gain:.04,filterFreq:2200,filterType:"highpass"})},introLaunch(){T({freq:160,freqEnd:70,type:"sawtooth",duration:.28,gain:.06})},nukeLaunch(){T({freq:180,freqEnd:90,type:"sawtooth",duration:.2,gain:.05})}};return{sfx(d){c||(s(),f[d]())},prime(){c||l()},unlock:_,syncMusic:m,settingChanged(d){let u=t();(d==="musicEnabled"||d==="musicVolume")&&m(),(d==="soundEnabled"||d==="soundVolume")&&h(),d==="soundEnabled"&&!u.soundEnabled&&!u.musicEnabled&&n.suspend(),(d==="soundEnabled"||d==="musicEnabled")&&(u.soundEnabled||u.musicEnabled)&&h()},pageHide(){c=!0,b(!1),n.hold()},pageShow(){c&&(c=!1,n.release(),m())},pageClose(){c=!0,b(!1),n.close()}}}function ut(e){return(e.key==="q"||e.key==="Q")&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.isComposing}var fi=new Set(["range","checkbox","radio","button","submit","reset","image","color","file"]);function Ut(e){let t=e;return t?t.isContentEditable||t.tagName==="SELECT"?!0:t.tagName==="INPUT"&&t.type&&fi.has(t.type)?!1:(t.tagName==="INPUT"||t.tagName==="TEXTAREA")&&!t.readOnly:!1}var hi=1e4,yi=6e4,gi=700,bi=1900;function Uo(e){if(e.ctrlKey||e.metaKey||e.altKey)return null;if(ut(e))return e.repeat?null:"disarm";let t=(e.key??"").toLowerCase();return t==="r"?"raptor":t==="g"?"grenade":null}function vi(e,t){return Math.max(0,e-t)}function Xo(e,t){let n=vi(e,t);return n>0?Math.max(1,Math.ceil(n/1e3)):0}function Ko(e){let t=!1,n=!1,o=[];function r(){o.forEach(i=>e.clearTimer(i)),o=[],n=!1,e.raptorClear()}function a(){t&&(t=!1,e.changed())}return{grenadeArmed:()=>t,raptorInbound:()=>n,cancelGrenadeArm:a,clearRaptor:r,readyGrenade(){return!e.isLive()||e.now()<e.readyAt("grenade")?!1:t?(a(),!1):(t=!0,e.sfx("grenadeArm"),e.changed(),!0)},throwGrenadeAt(i,c){return!e.isLive()||!t?!1:e.now()<e.readyAt("grenade")?(a(),!1):(t=!1,e.setReadyAt("grenade",e.now()+hi),e.changed(),e.sfx("grenade"),e.grenadeBlast(i,c),!0)},callRaptor(){return!e.isLive()||n||e.now()<e.readyAt("raptor")||!e.raptorAvailable()?!1:(r(),n=!0,e.setReadyAt("raptor",e.now()+yi),e.changed(),e.sfx("raptor"),e.raptorLaunch(),o.push(e.setTimer(()=>{!n||!e.isLive()||e.raptorStrike()},gi)),o.push(e.setTimer(()=>{e.raptorClear(),n=!1,o=[],e.changed()},bi)),!0)},reset(){e.setReadyAt("grenade",0),e.setReadyAt("raptor",0),t=!1,r()}}}var He={small:{radius:56,holdMs:800,fadeMs:1e3},medium:{radius:165,holdMs:2500,fadeMs:2e3},large:{radius:0,holdMs:4e3,fadeMs:3e3}};function Jo(e){let t=[];function n(s){s&&(e.clearTimer(s.holdTimer),e.clearTimer(s.fadeTimer),s.el.remove(),t=t.filter(h=>h!==s))}function o(s,h){s.fadeTimer=e.setTimer(()=>{if(e.paused()){s.fadeTimer=null;return}n(s)},h)}function r(s,h){s.holdTimer=e.setTimer(()=>{if(e.paused()){s.holdTimer=null;return}a(s)},h)}function a(s){if(!s.el.isConnected){n(s);return}s.phase="fade",s.el.style.setProperty("--hole-fade-ms",`${s.fadeMs}ms`),s.el.classList.add("is-fading"),s.fadeDue=e.now()+s.fadeMs,o(s,s.fadeMs)}function i(){let s=t[0];s&&(s.phase==="hold"?(e.clearTimer(s.holdTimer),a(s)):n(s))}function c(){let{width:s,height:h}=e.viewport();return Math.min(s||400,h||400)*.42}return{punch(s,h,{radius:l,holdMs:_,fadeMs:k}={}){let b=e.field;if(!b||!e.isLive())return;let w=l!==void 0&&l>0?l:c(),m=_!==void 0&&_>0?_:He.small.holdMs,T=k!==void 0&&k>0?k:He.small.fadeMs;for(;t.length>=24;)i(),t.length>=24&&n(t[0]);let x=e.create("div");x.className="cylon-hole",x.setAttribute("aria-hidden","true"),x.style.left=`${s}px`,x.style.top=`${h}px`,x.style.width=`${w*2}px`,x.style.height=`${w*2}px`;let B=e.create("div");B.className="cylon-hole-glitch",x.appendChild(B),b.appendChild(x);let f={el:x,holdTimer:null,fadeTimer:null,holdDue:e.now()+m,fadeDue:0,fadeMs:T,phase:"hold"};r(f,m),t.push(f)},clearAll(){[...t].forEach(n),t=[],e.field?.querySelectorAll(".cylon-hole").forEach(s=>s.remove())},largeRadius:c,count:()=>t.length,pause(){t.forEach(s=>{e.clearTimer(s.holdTimer),e.clearTimer(s.fadeTimer),s.holdTimer=null,s.fadeTimer=null})},resume(s,h){t.forEach(l=>{l.phase==="hold"&&l.holdDue>s?(e.clearTimer(l.holdTimer),l.holdDue+=h,r(l,Math.max(0,l.holdDue-e.now()))):l.phase==="fade"&&l.fadeDue>s&&(e.clearTimer(l.fadeTimer),l.fadeDue+=h,o(l,Math.max(0,l.fadeDue-e.now())))})}}}var Wo={xSpread:.55,ySpread:.7,rotMax:28},Yo={xSpread:1.15,ySpread:1.25,rotMax:150},jo={xSpread:1.35,ySpread:1.4,rotMax:220},Dn=".interest-list li, .course-list li",xi="h1, h2, h3, .page-lead, .contact-block, .interest-list, .course-list, .project-list, .project-list > li, aside, .games-hub-card, .games-home-callout, .cylon-debris",wi=3e3;function Qo(e){let t=e.doc.body,n=null;function o(){let{width:c,height:s}=e.viewport();return{vw:c||800,vh:s||600}}function r(c,s,h,l){let _=(e.random()-.5)*s*l.xSpread,k=(e.random()-.5)*h*l.ySpread,b=(e.random()-.5)*l.rotMax;c.style.setProperty("--sx",`${_.toFixed(1)}px`),c.style.setProperty("--sy",`${k.toFixed(1)}px`),c.style.setProperty("--sr",`${b.toFixed(1)}deg`)}function a(c,s,h){let l=(e.random()-.5)*s*.35,_=(e.random()-.5)*h*.4,k=(e.random()-.5)*120;c.style.setProperty("--mx",`${l.toFixed(1)}px`),c.style.setProperty("--my",`${_.toFixed(1)}px`),c.style.setProperty("--mr",`${k.toFixed(1)}deg`)}let i=()=>t.dataset.cylonScattered==="1";return{scattered:i,scatter(){if(i()||e.reduceMotion)return;let{vw:c,vh:s}=o();e.doc.querySelectorAll(".page-panel").forEach(h=>{h.classList.add("cylon-scatter-panel"),r(h,c,s,Wo),h.querySelectorAll(xi).forEach(k=>{k.classList.add("cylon-scatter-block"),r(k,c,s,Yo)});let l=e.doc.createTreeWalker(h,NodeFilter.SHOW_TEXT,{acceptNode(k){return!k.nodeValue||!/\S/.test(k.nodeValue)||k.parentElement?.closest(".cylon-scatter-char")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),_=[];for(;l.nextNode();)_.push(l.currentNode);_.forEach(k=>{let b=e.doc.createDocumentFragment();for(let w of k.nodeValue??""){if(w===" "||w===`
`||w==="	"){b.appendChild(e.doc.createTextNode(w));continue}let m=e.doc.createElement("span");m.className="cylon-scatter-char",m.textContent=w,r(m,c,s,jo),b.appendChild(m)}k.parentNode?.replaceChild(b,k)}),h.querySelectorAll(Dn).forEach(k=>a(k,c,s))}),t.dataset.cylonScattered="1"},restore(){i()&&(e.doc.querySelectorAll(".cylon-scatter-char").forEach(c=>{c.replaceWith(e.doc.createTextNode(c.textContent||""))}),e.doc.querySelectorAll(Dn).forEach(c=>{c.style.removeProperty("--mx"),c.style.removeProperty("--my"),c.style.removeProperty("--mr")}),e.doc.querySelectorAll(".cylon-scatter-panel, .cylon-scatter-block").forEach(c=>{c.classList.remove("cylon-scatter-panel","cylon-scatter-block"),c.style.removeProperty("--sx"),c.style.removeProperty("--sy"),c.style.removeProperty("--sr")}),t.dataset.cylonScattered="0")},reshuffle(){if(!i()||e.reduceMotion)return;let{vw:c,vh:s}=o();t.classList.add("cylon-glyphs-blowing"),e.doc.querySelectorAll(".cylon-scatter-panel").forEach(h=>{r(h,c,s,Wo)}),e.doc.querySelectorAll(".cylon-scatter-block").forEach(h=>{r(h,c,s,Yo)}),e.doc.querySelectorAll(".cylon-scatter-char").forEach(h=>{r(h,c,s,jo)}),e.doc.querySelectorAll(Dn).forEach(h=>a(h,c,s)),e.clearTimer(n),n=e.setTimer(()=>{t.classList.remove("cylon-glyphs-blowing"),n=null},wi)},cancelReshuffleSettle(){e.clearTimer(n),n=null}}}function Zo(e){let t=0,n=!1;function o(){e.body.classList.remove("cylon-intro-hero");let l=e.titleEl;l&&(l.hidden=!0,l.setAttribute("aria-hidden","true"),l.classList.remove("is-hero","is-settling","is-exit"),l.style.cssText="")}function r(){let l=e.titleEl;if(!l)return{x:0,y:0};let _=(window.innerWidth||1)*.5,k=(window.innerHeight||1)*.48;return l.style.left=`${_}px`,l.style.top=`${k}px`,l.style.right="auto",l.style.bottom="auto",l.style.transform="translate(-50%, -50%)",l.style.transformOrigin="center center",{x:_,y:k}}function a(){let l=e.titleEl;l&&(l.textContent=e.title,l.hidden=!1,l.setAttribute("aria-hidden","false"),l.classList.remove("is-exit","is-settling","is-hero"),l.style.cssText="",r(),e.body.classList.add("cylon-intro-hero"),l.offsetWidth,l.classList.add("is-hero"))}function i(){return window.matchMedia("(max-width: 819px)").matches}function c(l){let _=e.titleEl;if(l!==t||!_||_.hidden)return;let k=e.brandEl;if(e.reduceMotion||i()||!k){_.classList.add("is-exit");let A=e.reduceMotion?0:450;setTimeout(()=>{l===t&&o()},A);return}let b=r();_.offsetWidth;let w=_.getBoundingClientRect(),m=k.getBoundingClientRect(),T=w.left+w.width/2,x=w.top+w.height/2,B=m.left+m.width/2,f=m.top+m.height/2,d=B-T,u=f-x,g=m.width/Math.max(w.width,1);_.classList.remove("is-hero"),_.classList.add("is-settling"),_.style.left=`${b.x}px`,_.style.top=`${b.y}px`,_.style.transform="translate(-50%, -50%) scale(1)",requestAnimationFrame(()=>{requestAnimationFrame(()=>{l===t&&(_.style.transform=`translate(calc(-50% + ${d}px), calc(-50% + ${u}px)) scale(${g})`,_.style.textShadow="none")})});let E=!1,v=A=>{A&&A.propertyName&&A.propertyName!=="transform"||E||l!==t||(E=!0,_.removeEventListener("transitionend",v),o())};_.addEventListener("transitionend",v),setTimeout(()=>v(),e.settleMs+120)}function s(){t+=1,n=!1,e.setNukeInFlight(!1),e.nukeEl&&e.nukeEl.classList.remove("is-flying"),o()}function h(){let l=++t;n=!0,e.startRun(),e.setNukeInFlight(!1),o();let _=(window.innerWidth||1)/2,k=(window.innerHeight||1)*.48,b=E=>{let v=()=>{if(!(l!==t||!e.enabled())){if(e.paused()){setTimeout(v,100);return}E()}};v()},w=()=>{n=!1,e.beginCombat()},m=(E,v)=>{if(l!==t||!e.enabled())return;e.setNukeInFlight(!1),e.nukeEl&&e.nukeEl.classList.remove("is-flying"),e.detonate(E,v),a();let A=e.reduceMotion?0:520;setTimeout(()=>b(w),A);let R=e.reduceMotion?0:Math.max(900,A+e.navFadeMs+80);setTimeout(()=>b(()=>c(l)),R)},T=e.nukeEl;if(e.reduceMotion||!T){m(_,k);return}e.setNukeInFlight(!0);let x=_+(e.random()-.5)*Math.min(120,(window.innerWidth||400)*.15),B=-72,f=performance.now(),d=f,u=e.speed;T.style.left=`${x}px`,T.style.top=`${B}px`,T.classList.add("is-flying"),e.launched();let g=E=>{if(l!==t)return;if(!e.enabled()){s();return}if(e.paused()){f+=E-d,d=E,requestAnimationFrame(g);return}let v=Math.min(.05,(E-d)/1e3);d=E;let A=_-x,R=k-B,H=Math.hypot(A,R)||1,F=u*v;if(x+=A/H*Math.min(F,H),B+=R/H*Math.min(F,H),T.style.left=`${x}px`,T.style.top=`${B}px`,T.style.setProperty("--nuke-heading",`${Math.atan2(R,A)*(180/Math.PI)}deg`),H<=e.arriveRadius||E-f>=e.maxFlightMs){m(x,B);return}requestAnimationFrame(g)};requestAnimationFrame(g)}return{play:h,cancel:s,playing:()=>n}}function er(e){let{reduceMotion:t,scrollX:n,scrollY:o}=e;function r(b,w){return b+Math.random()*(w-b)}function a(b,w){let m=document.body.style.getPropertyValue(b)||getComputedStyle(document.body).getPropertyValue(b),T=parseFloat(m);return Number.isFinite(T)?T:w}function i(b,w,m){return b+(w-b)*m}function c(b){return 90+Math.max(.05,Math.min(1.6,b))*180}function s(b,w,m){let T=document.body,x=window.innerWidth||1,B=window.innerHeight||1,f=Math.max(.05,Math.min(1,m)),d=Math.max(8,Math.min(92,b/x*100)),u=Math.max(10,Math.min(90,w/B*100)),g=Math.min(1,.55+f*.6);T.style.setProperty("--blast-x",`${i(a("--blast-x",50),d,g).toFixed(1)}%`),T.style.setProperty("--blast-y",`${i(a("--blast-y",48),u,g).toFixed(1)}%`),T.style.setProperty("--land-morph-ms",`${Math.round(280+f*420)}ms`)}function h(b,w,m=1,T={}){if(!document.body.classList.contains("cylon-world-ended")&&m<.9&&m<.99)return;let x=Math.max(.05,Math.min(1,m)),B=b+n(),f=w+o(),d=Number.isFinite(T.radius)?T.radius:null;if(x<.9){s(b,w,x),l(B,f,x,d);return}let u=document.body,g=window.innerWidth||1,E=window.innerHeight||1,v=Math.max(8,Math.min(92,b/g*100)),A=Math.max(10,Math.min(90,w/E*100));u.style.setProperty("--blast-x",`${i(a("--blast-x",50),v,Math.min(1,x*1.15)).toFixed(1)}%`),u.style.setProperty("--blast-y",`${i(a("--blast-y",48),A,Math.min(1,x*1.15)).toFixed(1)}%`),u.style.setProperty("--crack-a",`${i(a("--crack-a",118),r(70,160),x).toFixed(1)}deg`),u.style.setProperty("--crack-b",`${i(a("--crack-b",28),r(8,70),x).toFixed(1)}deg`),u.style.setProperty("--crack-c",`${i(a("--crack-c",155),r(120,200),x).toFixed(1)}deg`),u.style.setProperty("--crack-grain",`${i(a("--crack-grain",-18),r(-40,12),x).toFixed(1)}deg`),u.style.setProperty("--scar-1",`${i(a("--scar-1",42),r(28,48),x).toFixed(1)}%`),u.style.setProperty("--scar-2",`${i(a("--scar-2",61),r(52,72),x).toFixed(1)}%`),u.style.setProperty("--scar-3",`${i(a("--scar-3",33),r(22,42),x).toFixed(1)}%`),u.style.setProperty("--scar-4",`${i(a("--scar-4",72),r(58,82),x).toFixed(1)}%`),u.style.setProperty("--scar-5",`${i(a("--scar-5",18),r(12,30),x).toFixed(1)}%`),u.style.setProperty("--scar-6",`${i(a("--scar-6",78),r(68,88),x).toFixed(1)}%`),u.style.setProperty("--ash-1-x",`${i(a("--ash-1-x",18),r(8,40),x).toFixed(1)}%`),u.style.setProperty("--ash-1-y",`${i(a("--ash-1-y",22),r(10,40),x).toFixed(1)}%`),u.style.setProperty("--ash-2-x",`${i(a("--ash-2-x",82),r(58,92),x).toFixed(1)}%`),u.style.setProperty("--ash-2-y",`${i(a("--ash-2-y",70),r(45,85),x).toFixed(1)}%`),u.style.setProperty("--ash-3-x",`${i(a("--ash-3-x",50),r(30,70),x).toFixed(1)}%`),u.style.setProperty("--ash-3-y",`${i(a("--ash-3-y",100),r(75,105),x).toFixed(1)}%`);let R=i(a("--land-shift-x",0),r(-28,28),x),H=i(a("--land-shift-y",0),r(-22,22),x),F=i(a("--land-scale",1),r(1.02,1.1),x),I=i(a("--land-rot",0),r(-2.8,2.8),x);u.style.setProperty("--land-shift-x",`${R.toFixed(1)}px`),u.style.setProperty("--land-shift-y",`${H.toFixed(1)}px`),u.style.setProperty("--ash-drift-x",`${(-R*.35).toFixed(1)}px`),u.style.setProperty("--ash-drift-y",`${(-H*.35).toFixed(1)}px`),u.style.setProperty("--land-rot",`${I.toFixed(2)}deg`),u.style.setProperty("--land-scale",`${F.toFixed(3)}`),u.style.setProperty("--ash-scale",`${(1+(F-1)*.4).toFixed(3)}`),u.style.setProperty("--land-morph-ms",`${Math.round(420+x*930)}ms`),l(B,f,x,d)}function l(b,w,m=1,T=null){if(document.body.dataset.cylonScattered!=="1"||t)return;let x=Math.max(.05,Math.min(1.6,m)),B=Number.isFinite(T)&&T>0?T:c(x),d=x<.95?".cylon-scatter-char":".cylon-scatter-char, .cylon-scatter-block, .cylon-scatter-panel",u=[...document.querySelectorAll(d)],g=Math.min(1,.7+x*.3),E=55*x,v=48+200*x;u.forEach(A=>{if(A.classList.contains("cylon-scatter-panel")&&x<1.1)return;let R=A.getBoundingClientRect(),H=R.left+R.width/2+n(),F=R.top+R.height/2+o(),I=H-b,V=F-w,G=Math.hypot(I,V)||1;if(G>B||Math.random()>g)return;let ne=parseFloat(A.style.getPropertyValue("--sx"))||0,q=parseFloat(A.style.getPropertyValue("--sy"))||0,O=parseFloat(A.style.getPropertyValue("--sr"))||0,Q=Math.max(0,1-G/B),K=r(v*.5,v)*Q;A.style.setProperty("--sx",`${(ne+I/G*K+r(-E,E)*Q).toFixed(1)}px`),A.style.setProperty("--sy",`${(q+V/G*K+r(-E,E)*Q).toFixed(1)}px`),A.style.setProperty("--sr",`${(O+r(-32,32)*x*Q).toFixed(1)}deg`)})}function _(b,w,m=1,T={}){h(b-n(),w-o(),m,T)}function k(){["--blast-x","--blast-y","--crack-a","--crack-b","--crack-c","--crack-grain","--scar-1","--scar-2","--scar-3","--scar-4","--scar-5","--scar-6","--ash-1-x","--ash-1-y","--ash-2-x","--ash-2-y","--ash-3-x","--ash-3-y","--land-shift-x","--land-shift-y","--ash-drift-x","--ash-drift-y","--land-rot","--land-scale","--ash-scale","--land-morph-ms"].forEach(b=>document.body.style.removeProperty(b))}return{randRange:r,rearrangeLandscape:h,rearrangeLandscapePage:_,disruptGlyphs:l,clearLandscapeVars:k}}function tr(e){let{eye:t,glare:n,game:o,settings:r,mouse:a,state:i,isGameLive:c,EYE_DISORIENT_MS:s}=e,h=50,l=!1,_=5.2,k=0,b=0;function w(){let g=t.parentElement;if(!g)return 50;let E=t.getBoundingClientRect(),v=g.getBoundingClientRect();return v.width<1?50:(E.left+E.width/2-v.left)/v.width*100}function m(){return i.pending(o.schedule.eyeDisorientedUntil,Date.now())}function T(g){(!c()||!r.eyeEnabled||m())&&(g=!1),g&&!l&&(h=w(),k=Math.asin(Math.max(-1,Math.min(1,(h-50)/45))),b=performance.now()),l=g,t.classList.toggle("is-tracking",g&&!m()),n&&n.classList.toggle("is-active",g&&!m()),!g&&!m()&&(t.style.left="",n&&(n.style.opacity="",n.style.height="",n.style.top="",n.style.transform=""))}function x(g=s){o.schedule.eyeDisorientedUntil=Date.now()+g,l=!1,t.classList.remove("is-tracking"),t.classList.add("is-disoriented"),h=w(),n&&(n.classList.add("is-active"),n.classList.add("is-disoriented"))}function B(){t.classList.contains("is-disoriented")&&!m()&&(t.classList.remove("is-disoriented"),n&&n.classList.remove("is-disoriented"),l||(t.style.left="",n&&n.classList.remove("is-active")))}function f(){if(B(),m()){let g=performance.now()/1e3,E=50+Math.sin(g*6.8)*30+Math.sin(g*15.4)*14+Math.sin(g*2.7)*10+Math.sin(g*31)*4,v=Math.min(95,Math.max(5,E));if(h+=(v-h)*.22,t.style.left=`${h}%`,n){n.classList.add("is-active"),n.style.left=`${h/100*window.innerWidth}px`;let A=.45+.55*(.5+.5*Math.sin(g*22));n.style.height=`${Math.min(window.innerHeight*.28,176)*A}px`,n.style.opacity=String(.35+.55*A)}}else if(l&&r.eyeEnabled){let g=performance.now();if(k+=Math.min(.05,(g-b)/1e3)*(Math.PI*2/_),b=g,h=50+45*Math.sin(k),t.style.left=`${h}%`,n){let E=u(),v=E.y+t.getBoundingClientRect().height*.2,A=a.clientX-E.x,R=Math.max(1,a.clientY-v);n.style.opacity="",n.style.left=`${E.x}px`,n.style.top=`${v}px`;let H=Math.hypot(A,R),F=Math.min(H*.85,140+H*.25);n.style.height=`${H}px`,n.style.setProperty("--glare-reach",`${F/Math.max(1,H)*100}%`),n.style.opacity=String(Math.max(.3,Math.min(1,1-H/(Math.hypot(window.innerWidth,window.innerHeight)*1.2)))),n.style.transform=`translateX(-50%) rotate(${-Math.atan2(A,R)}rad)`}}requestAnimationFrame(f)}function d(){o.schedule.eyeDisorientedUntil=0,t&&t.classList.remove("is-disoriented"),n&&(n.classList.remove("is-disoriented"),l||n.classList.remove("is-active"))}function u(){let g=t.getBoundingClientRect();return{x:g.left+g.width/2,y:g.top+g.height/2}}return{isEyeDisoriented:m,setEyeTracking:T,disorientEye:x,clearEyeDisorient:d,eyeClientCenter:u,updateEye:f}}function nr(e){let{reticleEl:t,mouse:n,lastAim:o,game:r,settings:a,coarsePointer:i,IDLE_MS:c,isGameLive:s,isEyeDisoriented:h,setEyeTracking:l,audio:_,abilities:k,scrollX:b,scrollY:w}=e;function m(){n.pageX=n.clientX+b(),n.pageY=n.clientY+w()}function T(){!t||t.hidden||(t.style.transform=`translate(${n.clientX}px, ${n.clientY}px)`)}function x(v,A){let R=window.innerWidth||1,H=window.innerHeight||1;n.clientX=Math.min(R-8,Math.max(8,v)),n.clientY=Math.min(H-8,Math.max(8,A)),m(),n.t=performance.now(),T(),o.clientX=n.clientX,o.clientY=n.clientY,o.t=performance.now(),s()&&a.eyeEnabled&&!h()&&(l(!0),clearTimeout(r.idleTimer),r.idleTimer=setTimeout(()=>l(!1),c))}function B(){if(!t)return;let v=s();t.hidden=!v,t.setAttribute("aria-hidden",v?"false":"true"),t.classList.toggle("is-mouse-follow",v&&!i),v&&T()}function f(){x(window.innerWidth/2,window.innerHeight*.42)}function d(v){return!v||!v.closest?!1:!!v.closest(".site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel")}function u(v){_.prime(),!(r.reticlePointerId!=null&&v.pointerId===r.reticlePointerId)&&(i&&v.pointerType==="touch"||d(v.target)||x(v.clientX,v.clientY))}function g(v){r.reticlePointerId==null||v&&v.pointerId!==r.reticlePointerId||(r.draggingReticle=!1,r.reticlePointerId=null,t?.classList.remove("is-dragging"))}function E(){if(!t||!i)return;t.addEventListener("pointerdown",A=>{s()&&(A.button!=null&&A.button!==0||r.reticlePointerId==null&&(k.grenadeArmed()||(A.preventDefault(),r.draggingReticle=!0,r.reticlePointerId=A.pointerId,t.classList.add("is-dragging"),x(A.clientX,A.clientY))))});let v=A=>{r.reticlePointerId==null||A.pointerId!==r.reticlePointerId||(A.preventDefault(),x(A.clientX,A.clientY))};window.addEventListener("pointermove",v,{passive:!1}),window.addEventListener("pointerup",g,!0),window.addEventListener("pointercancel",g,!0)}return{syncMousePageFromClient:m,paintReticle:T,syncReticleVisibility:B,resetReticleToCenter:f,onPointerMove:u,bindReticle:E}}function or(e){let{game:t,settings:n,mouse:o,lastAim:r,state:a,rules:i,playfield:c,field:s,ambushUnder:h,missileEl:l,nukeEl:_,nukeMissileEl:k,scoreEl:b,audio:w,intro:m,abilities:T,holes:x,debris:B,punchHole:f,HOLE_PRESETS:d,isGameLive:u,isEyeDisoriented:g,eyeClientCenter:E,syncMousePageFromClient:v,rearrangeLandscape:A,rearrangeLandscapePage:R,disruptGlyphs:H,randRange:F,registerHit:I,resizeBattlefield:V,scrollX:G,scrollY:ne,BOT_HARD_CAP:q,BOT_SIZE:O,LINK_PAD:Q,HIT_RADIUS:K,BOLT_HIT_RADIUS:Ee,NUKE_DIRECT_HIT_RADIUS:ce,NUKE_SPEED:Le,NUKE_ARRIVE_RADIUS:et,NUKE_MAX_FLIGHT_MS:xe,MISSILE_SPEED:M,MISSILE_ARRIVE:Te,MISSILE_MAX_FLIGHT_MS:de,MISSILE_BLAST_RADIUS:Ae,SMALL_WEAPON_SCALE:Ve,MISSILE_WEAPON_SCALE:we}=e,Z=0,ft=null,Pe=[],Re=null,$e=[];function At(){let p=document.documentElement;return{w:p.clientWidth,h:Math.max(document.body.offsetHeight,p.clientHeight)}}function tt(){let p=h?[...h.querySelectorAll(".cylon-bot")]:[],S=s?[...s.querySelectorAll(".cylon-bot")]:[];return p.concat(S)}function ln(){return i.killLevel(t.run.koScore)}function ht(){return i.groundMissileCap(t.run.koScore)}function Mt(){return i.trackerMissileCap(t.run.koScore)}function Ct(){return i.trackerMissileChance(t.run.koScore)}function nt(p=null){return Pe.filter(S=>S.alive?p==null?!0:S.tracker===p:!1).length}function Ie(p){return p?nt(!0)<Mt():nt(!1)<ht()}function cn(){$e.forEach(p=>clearTimeout(p)),$e=[]}function dn(){clearTimeout(Re),Re=null,cn(),Pe.forEach(p=>{p.alive=!1,p.el.remove()}),Pe=[],l&&l.classList.remove("is-flying","is-tracker")}function un(){let p=window.innerWidth||800,S=Math.max(24,Math.min(56,p*.04)),L=Math.max(80,p-S*2),D=8+Math.random()*22,U=Pe.filter(X=>X.alive).map(X=>{let ee=parseFloat(X.el.style.left);return Number.isFinite(ee)?ee:X.originX||p/2}),j=12,z=[];for(let X=0;X<j;X++)z.push(S+(X+.5)/j*L);if(z.push(S+Math.random()*L),z.push(S+Math.random()*L),z.push(S+Math.random()*L),!U.length&&Math.random()<.28){let X=E();return{x:Math.min(p-S,Math.max(S,X.x+(Math.random()-.5)*64)),y:Math.min(D+18,Math.max(6,X.y-36))}}let ie=z[0],J=-1/0;for(let X of z){let ee;if(!U.length)ee=Math.abs(X-p/2)/(p/2)*40+Math.random()*80;else{let se=1/0;for(let te of U)se=Math.min(se,Math.abs(X-te));ee=se*(1+U.length*.35)+Math.random()*36}ee>J&&(J=ee,ie=X)}return{x:ie,y:D}}function pn(p,S,L){p&&(p.alive=!1,p.el.remove(),Pe=Pe.filter(z=>z!==p&&z.alive));let D=S+window.scrollX,$=L+window.scrollY;w.sfx("ko");let U=document.createElement("div");U.className="cylon-missile-blast",U.style.left=`${D}px`,U.style.top=`${$}px`,U.setAttribute("aria-hidden","true"),s.appendChild(U),setTimeout(()=>U.remove(),420),f(D,$,d.small),R(D,$,we),v(),Math.hypot(o.clientX-S,o.clientY-L)<=Ae&&I(2)}function yt({forceTracker:p=!1,forceGround:S=!1,fromPair:L=!1}={}){if(!u()||g())return!1;let D=!1;if(S){if(!Ie(!1))return!1}else if(p){if(D=Ie(!0),!D)return!1}else if(D=Math.random()<Ct()&&Ie(!0),!D&&!Ie(!1))return!1;let $=performance.now()-r.t<4e3,U=$?r.clientX:o.clientX,j=$?r.clientY:o.clientY,z=document.createElement("div");z.className="cylon-small-missile is-flying"+(D?" is-tracker":""),z.setAttribute("aria-hidden","true"),document.body.appendChild(z);let ie=un(),J=ie.x,X=ie.y,ee={el:z,tracker:D,alive:!0,originX:J};Pe.push(ee);let se=performance.now(),te=se;z.style.left=`${J}px`,z.style.top=`${X}px`,w.prime(),w.sfx(D?"trackerMissile":"missile");let he=re=>{if(!ee.alive)return;if(t.paused||!n.gameEnabled||t.run.gameOver){se+=re-te,te=re,requestAnimationFrame(he);return}let me=Math.min(.05,(re-te)/1e3);te=re;let be=D?o.clientX:U,ke=D?o.clientY:j,ye=be-J,Se=ke-X,Me=Math.hypot(ye,Se)||1,ct=M*me;if(J+=ye/Me*Math.min(ct,Me),X+=Se/Me*Math.min(ct,Me),z.style.left=`${J}px`,z.style.top=`${X}px`,z.style.transform=`rotate(${Math.atan2(Se,ye)*(180/Math.PI)}deg)`,Me<=Te||re-se>=de){pn(ee,J,X);return}requestAnimationFrame(he)};if(requestAnimationFrame(he),D&&!L&&Mt()>=2&&Ie(!0)&&Math.random()<.45&&(clearTimeout(Re),Re=setTimeout(()=>{Re=null,!(!u()||t.paused||g())&&yt({forceTracker:!0,fromPair:!0})},280+Math.random()*320)),!D&&!L&&!S){let re=ln(),me=ht()-nt(!1),be=Math.min(me,re<2?0:re<5?1:2);if(be>0&&Math.random()<.35+Math.min(.4,re*.04)){let ke=1+(be>1&&Math.random()<.3+Math.min(.35,re*.03)?1:0);for(let ye=0;ye<Math.min(ke,be);ye++){let Se=90+ye*(140+Math.random()*160),Me=setTimeout(()=>{$e=$e.filter(ct=>ct!==Me),!(!u()||t.paused||g())&&yt({forceGround:!0,fromPair:!0})},Se);$e.push(Me)}}}return!0}function mn(p,S){return c.inflate(p,S)}function Lt(p){return{left:p.left+G(),top:p.top+ne(),right:p.right+G(),bottom:p.bottom+ne()}}function Pt(){let p=document.querySelectorAll('a, button, input, select, textarea, label, summary, [role="link"], [role="button"]'),S=[];return p.forEach(L=>{if(L.closest(".cylon-battlefield")||L.classList.contains("cylon-bot")||L.closest("#cylon-reticle")||L.closest(".cylon-settings"))return;let D=L.getBoundingClientRect();D.width<2||D.height<2||S.push(mn(Lt(D),Q))}),S}function ot(){let p=document.querySelector(".site-nav");return c.visibleBounds({scrollX:G(),scrollY:ne(),width:document.documentElement.clientWidth||window.innerWidth||1,height:window.innerHeight||1,navBottom:p?p.getBoundingClientRect().bottom:70},O)}function gt(p,S){return c.clampToBounds(ot(),p,S)}function Ue(p,S){return c.isInBounds(ot(),p,S)}function Rt(p,S,L){return c.isSafeSpot(p,S,L,At(),O)}function bt(p){let S=p?{x:parseFloat(p.style.left)||0,y:parseFloat(p.style.top)||0}:null;return c.findSafeSpot({bounds:ot(),forbidden:Pt(),doc:At(),bot:O},S,Math.random)}function It(p,S,L,D){w.sfx("projectile");let $=document.createElement("div");$.className="cylon-bolt",$.setAttribute("aria-hidden","true");let U=L-p,j=D-S,z=Math.hypot(U,j)||1,ie=Math.atan2(j,U)*(180/Math.PI);$.style.left=`${p}px`,$.style.top=`${S}px`,$.style.width=`${Math.min(z,28)}px`,$.style.transform=`rotate(${ie}deg)`,s.appendChild($);let J=Math.min(.55,.18+z/1800)*1e3,X=performance.now(),ee=X,se=!1,te=(me,be,{struck:ke=!1}={})=>{se||(se=!0,$.remove(),rt(me,be,{sound:!1}),ke&&I())},he=$.animate([{left:`${p}px`,top:`${S}px`,opacity:1,width:"14px"},{left:`${L}px`,top:`${D}px`,opacity:.85,width:"22px"}],{duration:J,easing:"linear",fill:"forwards"}),re=me=>{if(se)return;if(!n.gameEnabled||t.run.gameOver){try{he.cancel()}catch{}te(L,D,{struck:!1});return}if(t.paused){X+=me-ee,ee=me;try{he.pause()}catch{}requestAnimationFrame(re);return}try{he.playState==="paused"&&he.play()}catch{}ee=me;let be=Math.min(1,(me-X)/J),ke=p+(L-p)*be,ye=S+(D-S)*be;if(v(),Math.hypot(o.pageX-ke,o.pageY-ye)<=Ee){try{he.cancel()}catch{}te(ke,ye,{struck:!0});return}be<1&&requestAnimationFrame(re)};requestAnimationFrame(re),he.onfinish=()=>{if(se)return;v();let me=Math.hypot(o.pageX-L,o.pageY-D)<=K;te(L,D,{struck:me})}}function rt(p,S,{sound:L=!0}={}){if(!s)return;L&&n.soundEnabled&&(w.prime(),w.sfx("projectile"));let D=document.createElement("div");D.className="cylon-impact",D.style.left=`${p}px`,D.style.top=`${S}px`,D.setAttribute("aria-hidden","true"),s.appendChild(D),f(p,S,d.small),R(p,S,Ve),setTimeout(()=>D.remove(),300)}function fn(p){return!p||!p.closest?!0:!!(p.closest(".site-nav")||p.closest(".cylon-help")||p.closest(".cylon-gameover")||p.closest(".cylon-settings-panel")||p.closest(".cylon-bot")||p.closest("#cylon-reticle")||p.closest("#cic-enter-btn"))}function hn(){window.addEventListener("pointerdown",p=>{u()&&(T.grenadeArmed()||m.playing()||p.button!=null&&p.button!==0||t.reticlePointerId!=null&&p.pointerId===t.reticlePointerId||fn(p.target)||(p.preventDefault(),rt(p.pageX,p.pageY)))})}function le(){t.run=a.recordKill(t.run),b&&(b.textContent=String(t.run.koScore),b.classList.remove("is-bump"),b.offsetWidth,b.classList.add("is-bump"),setTimeout(()=>b.classList.remove("is-bump"),180))}function Oe(p){p._shootInterval&&clearInterval(p._shootInterval),p._patrolInterval&&clearInterval(p._patrolInterval),p._shootInterval=null,p._patrolInterval=null}function Xe(p){if(p.dataset.ko==="1")return;p.dataset.ko="1",p.classList.add("is-ko"),Oe(p),w.sfx("ko");let S=(parseFloat(p.style.left)||0)+O.w/2,L=(parseFloat(p.style.top)||0)+O.h/2;rt(S,L,{sound:!1}),le(),Z=Math.max(0,Z-1),setTimeout(()=>p.remove(),560)}function Dt(){tt().forEach(p=>{Oe(p),p.remove()}),s.querySelectorAll(".cylon-bolt, .cylon-impact").forEach(p=>p.remove()),x.clearAll(),Z=0}function yn(){tt().forEach((S,L)=>{setTimeout(()=>{S.isConnected&&S.dataset.ko!=="1"&&Xe(S)},L*70)}),s.querySelectorAll(".cylon-bolt").forEach(S=>S.remove())}function gn(p){return c.marchOrigin(ot(),p,O)}function vt(p){let S=Pt(),L=parseFloat(p.style.left)||0,D=parseFloat(p.style.top)||0;if(!Ue(L,D)||!Rt(L,D,S)){let $=bt(p);return $?(p.style.left=`${$.x}px`,p.style.top=`${$.y}px`,!0):!1}return!0}function Bt(p){if(!u()||p.dataset.ko==="1"||!p.isConnected||p.classList.contains("is-marching"))return;let S=bt(p);if(!S)return;let L=gt(S.x,S.y);p.classList.add("is-marching"),p.style.left=`${L.x}px`,p.style.top=`${L.y}px`,setTimeout(()=>{!p.isConnected||p.dataset.ko==="1"||(p.classList.remove("is-marching"),vt(p))},920)}function at(){u()&&tt().forEach(p=>{if(p.dataset.ko==="1"||!p.isConnected||p.classList.contains("is-hiding"))return;let S=parseFloat(p.style.left)||0,L=parseFloat(p.style.top)||0;Ue(S,L)||Bt(p)})}function it(){let p=document.querySelector("#nav-main.is-active, #nav-contact.is-active")||document.getElementById("nav-main");if(!p)return null;let S=[...p.querySelectorAll("h1, h2, h3, p, li")];if(!S.length)return null;let L=S.filter($=>{let U=$.getBoundingClientRect();return U.width>8&&U.height>8&&U.bottom>60&&U.top<(window.innerHeight||1)-20&&U.right>0&&U.left<(window.innerWidth||1)}),D=L.length?L:S;for(let $=0;$<12;$++){let j=D[Math.floor(Math.random()*D.length)].getBoundingClientRect();if(j.width<8||j.height<8)continue;let z=Lt(j),ie=z.left+Math.random()*Math.max(8,z.right-z.left-O.w),J=z.top+Math.random()*Math.max(4,Math.min(z.bottom-z.top,O.h)*.65);return{x:ie,y:J}=gt(ie,J),{x:ie,y:J,edge:"ambush"}}return null}function xt(p){let S=()=>{if(!u()||p.dataset.ko==="1"||!p.isConnected||p.classList.contains("is-marching"))return;if(!vt(p)){Oe(p),p.remove(),Z=Math.max(0,Z-1);return}let L=parseFloat(p.style.left)||0,D=parseFloat(p.style.top)||0;v(),It(L+O.w/2,D+O.h*.35,o.pageX,o.pageY)};setTimeout(S,200+Math.random()*400),p._shootInterval=setInterval(S,1500+Math.random()*1100),p._patrolInterval=setInterval(()=>Bt(p),2200+Math.random()*1800)}function st(){return i.botCap(t.run.koScore,q)}function oe(p){p.addEventListener("pointerdown",S=>{u()&&(p.classList.contains("is-hiding")||t.reticlePointerId!=null&&S.pointerId===t.reticlePointerId||S.pointerType==="mouse"&&S.button!=null&&S.button!==0||(S.preventDefault(),S.stopPropagation(),w.prime(),Xe(p)))}),p.addEventListener("wheel",S=>{document.body.classList.contains("cylon-game-live")||window.scrollBy({top:S.deltaY,left:S.deltaX,behavior:"auto"})},{passive:!0})}function De(p){if(!(p.dataset.ko==="1"||!p.isConnected)){if(p.classList.remove("is-marching","is-hiding","is-emerging"),!vt(p)){Oe(p),p.remove(),Z=Math.max(0,Z-1);return}xt(p)}}function ue(){if(!u()||Z>=st())return!1;V();let S=Math.random()<.4&&h?it():null,L=document.createElement("button");if(L.type="button",L.title="Attack drone",L.setAttribute("aria-label","Attack hostile drone"),L.innerHTML='<span class="cylon-bot-body"></span><span class="cylon-bot-legs" aria-hidden="true"><span></span><span></span></span>',oe(L),S)return L.className="cylon-bot is-hiding",L.style.left=`${S.x}px`,L.style.top=`${S.y}px`,h.appendChild(L),Z+=1,setTimeout(()=>{if(L.dataset.ko==="1"||!L.isConnected||!u()){L.isConnected&&(Oe(L),L.remove(),Z=Math.max(0,Z-1));return}s.appendChild(L),L.classList.remove("is-hiding"),L.classList.add("is-emerging"),setTimeout(()=>De(L),560)},700+Math.random()*900),!0;let D=bt();if(!D)return!1;let $=gn(D);return L.className="cylon-bot is-marching",L.style.left=`${$.x}px`,L.style.top=`${$.y}px`,s.appendChild(L),Z+=1,requestAnimationFrame(()=>{L.style.left=`${D.x}px`,L.style.top=`${D.y}px`}),setTimeout(()=>De(L),950),!0}function lt(){if(!u())return;let p=st()-Z;if(p<=0)return;let{isWave:S,count:L}=i.planWave(p,st(),Math.random);for(let D=0;D<L;D++)setTimeout(()=>ue(),D*(S?380:0))}function Ke(p=!1){clearTimeout(ft);let S=p?2500+Math.random()*2500:3500+Math.random()*4500;ft=setTimeout(()=>{u()&&lt(),Ke(!1)},S)}function Ne(p,S,{dealDamage:L=!0,shake:D=!0}={}){if(!_)return;w.prime(),w.sfx("nuke");let $=window.innerWidth||1,U=window.innerHeight||1;_.style.setProperty("--nuke-x",`${p/$*100}%`),_.style.setProperty("--nuke-y",`${S/U*100}%`),_.classList.add("is-detonating"),D&&(document.body.classList.add("is-nuke-shake"),setTimeout(()=>document.body.classList.remove("is-nuke-shake"),600));let j=p+window.scrollX,z=S+window.scrollY;f(j,z,{radius:x.largeRadius(),holdMs:d.large.holdMs,fadeMs:d.large.fadeMs});let ie=3+Math.floor(Math.random()*3);for(let J=0;J<ie;J++){let X=Math.random()*Math.PI*2,ee=F(x.largeRadius()*.35,x.largeRadius()*.85),se=j+Math.cos(X)*ee,te=z+Math.sin(X)*ee;f(se,te,{radius:F(48,110),holdMs:d.medium.holdMs,fadeMs:d.medium.fadeMs})}A(p,S,1),B.scattered()?B.reshuffle():(H(j,z,1.45),setTimeout(()=>H(j,z,1.2),220),setTimeout(()=>H(j,z,.85),520)),L&&Math.hypot(o.clientX-p,o.clientY-S)<=ce&&I(1,{fromNuke:!0}),setTimeout(()=>_.classList.remove("is-detonating"),2500)}function pe(){if(!u()||g()||t.nukeInFlight)return;if(!k){Ne(o.clientX,o.clientY);return}t.nukeInFlight=!0;let p=E(),S=p.x,L=p.y,D=o.clientX,$=o.clientY,U=!g(),j=performance.now(),z=j;k.style.left=`${S}px`,k.style.top=`${L}px`,k.classList.add("is-flying"),w.prime(),w.sfx("nukeLaunch");let ie=J=>{if(t.paused||!n.gameEnabled||t.run.gameOver){if(j+=J-z,z=J,!t.nukeInFlight)return;requestAnimationFrame(ie);return}let X=Math.min(.05,(J-z)/1e3);z=J,g()?U&&(U=!1):(U=!0,D=o.clientX,$=o.clientY);let ee=D,se=$,te=ee-S,he=se-L,re=Math.hypot(te,he)||1,me=Le*X;S+=te/re*Math.min(me,re),L+=he/re*Math.min(me,re),k.style.left=`${S}px`,k.style.top=`${L}px`;let be=Math.atan2(he,te)*(180/Math.PI);k.style.setProperty("--nuke-heading",`${be}deg`);let ke=re<=et,ye=J-j>=xe;if(ke||ye){k.classList.remove("is-flying"),t.nukeInFlight=!1,Ne(S,L);return}requestAnimationFrame(ie)};requestAnimationFrame(ie)}return{allBots:tt,knockOutBot:Xe,clearAllBots:Dt,wipeAllBotsWithScore:yn,herdBotsIntoView:at,scheduleAmbush:Ke,bindPlayerMissShots:hn,canLaunchMissile:Ie,launchSmallMissile:yt,clearActiveMissiles:dn,launchNuke:pe,detonateNukeAt:Ne}}function ar(e){let t=e.weekStartsOn==="sunday"?"Sunday":"Monday",n=e.timezone==="America/Chicago"?"Central":e.timezone==="local"?"your time":String(e.timezone||"");return`Play often — scores reset every ${t} at midnight ${n}.`}function Xt(e){return e.map((t,n)=>{let o=t.at?new Date(t.at):null,r=o&&!Number.isNaN(o.getTime())?o.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"}):"";return{rank:n+1,initials:(t.initials||"AAA").toString().slice(0,3).toUpperCase(),date:r,score:t.score}})}function qe(e){return typeof e=="object"&&e!==null}function ir(e,t){let n=t.log??((d,u)=>console.error(d,u)),o="",r="",a=0,i=null,c=10,s=new Set,h=[],l=[];function _(d){return{"X-Cylon-CSRF":o,...d}}function k(d){if(!qe(d))return;let u=Number(d.maxScores);u>=1&&(c=u),Array.isArray(d.blockedInitials)&&(s.clear(),d.blockedInitials.forEach(g=>{let E=String(g||"").toUpperCase();/^[A-Z]{3}$/.test(E)&&s.add(E)}))}function b(d){qe(d)&&(Array.isArray(d.scores)&&(h=d.scores),Array.isArray(d.alltime)&&(l=d.alltime))}async function w(){try{let d=await t.fetch(e,{cache:"no-store",credentials:"same-origin",headers:_()});if(!d.ok)throw new Error("bad status");let u=await d.json();if(!qe(u))throw new Error("bad body");return typeof u.csrf=="string"&&u.csrf&&(o=u.csrf),k(u.config),h=Array.isArray(u.scores)?u.scores:[],l=Array.isArray(u.alltime)?u.alltime:[],qe(u.config)?u.config:null}catch{return null}}function m(){let d=++a;return r="",i=(async()=>{try{o||await w();let u=await t.fetch(e,{method:"POST",credentials:"same-origin",headers:_({"Content-Type":"application/json"}),body:JSON.stringify({op:"start"}),cache:"no-store"}),g=await u.json().catch(()=>null);if(d!==a)return;u.ok&&qe(g)&&typeof g.run=="string"&&(r=g.run)}catch(u){n("Cylon run token failed",u)}})(),i}function T(d,u=h){if(d<1)return!1;if(!u||u.length<c)return!0;let g=1/0;for(let E of u){let v=Number(E.score)||0;v<g&&(g=v)}return d>g}function x(d){let u=qe(d)?d.alltimeRank:null;return typeof u=="number"&&Number.isInteger(u)&&u>=1?u:null}function B(d){return s.has((d||"").toUpperCase())}async function f(d,u,g){if(!d||d<1)return{saved:!1,problem:null,allTimeRank:null};let E=(u||"AAA").toUpperCase().slice(0,3).padEnd(3,"A");if(B(E))return{saved:!1,problem:"invalid-initials",allTimeRank:null};try{if(i&&await i,!r)return{saved:!1,problem:"save-failed",allTimeRank:null};let v=await t.fetch(e,{method:"POST",credentials:"same-origin",headers:_({"Content-Type":"application/json"}),body:JSON.stringify({op:"score",score:d,hits:g,initials:E,run:r}),cache:"no-store"}),A=null;try{A=await v.json()}catch{A=null}return v.status===400&&qe(A)&&A.error==="invalid initials"?(b(A),{saved:!1,problem:"invalid-initials",allTimeRank:null}):v.ok?(r="",b(A),{saved:!0,problem:null,allTimeRank:x(A)}):(b(A),{saved:!1,problem:"save-failed",allTimeRank:null})}catch{return{saved:!1,problem:null,allTimeRank:null}}}return{board:()=>h,alltime:()=>l,qualifies:T,isBlocked:B,load:w,startRun:m,submit:f}}var rr="cylon-local-scores",Bn=10;function ki(e){let t=new Date(e.getFullYear(),e.getMonth(),e.getDate());return t.setDate(t.getDate()-t.getDay()),t.getTime()}function sr(e,t=()=>new Date){let n=[];function o(){try{let s=JSON.parse(e?.getItem(rr)??"[]");return Array.isArray(s)?s.filter(h=>qe(h)&&typeof h.score=="number"&&h.score>=1):[]}catch{return[]}}let r=s=>[...s].sort((h,l)=>l.score-h.score||Number(new Date(h.at??0))-Number(new Date(l.at??0))).slice(0,Bn),a=()=>r(n),i=()=>{let s=ki(t());return r(n.filter(h=>Number(new Date(h.at??0))>=s))};n=o();function c(s,h=i()){return s<1?!1:h.length<Bn?!0:s>Math.min(...h.map(l=>l.score))}return{board:i,alltime:a,qualifies:c,isBlocked:()=>!1,async load(){return n=o(),{maxScores:Bn,weekStartsOn:"sunday",timezone:"local"}},async startRun(){},async submit(s,h,l){if(!s||s<1)return{saved:!1,problem:null,allTimeRank:null};let k={initials:(h||"AAA").toUpperCase().slice(0,3).padEnd(3,"A"),score:s,at:t().toISOString()};n=[...o(),k];let b=new Set([...a(),...i()]);n=n.filter(m=>b.has(m));try{e?.setItem(rr,JSON.stringify(n))}catch{}let w=a().indexOf(k);return{saved:!0,problem:null,allTimeRank:w>=0?w+1:null}}}}var Y,ur,_i,Ge,lr,Jt,pr,Wt,mr,Fn,Hn,Si,Qt={},Zt=[],Ei=/^m(i|n|o|s|text|space)$/,On=Array.isArray,fr=Zt.slice,Je=Object.assign;function en(e){e&&e.parentNode&&e.remove()}function Yt(e,t,n,o,r){var a={type:e,props:t,key:n,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r||++ur,__i:-1,__u:0};return!r&&Y.vnode&&Y.vnode(a),a}function _e(e){return e.children}function jt(e,t){this.props=e,this.context=t,this.__g=0}function ze(e,t){if(t==null)return e.__?ze(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])&&n.__e)return n.__e;return typeof e.type!="function"||e.props.__P?null:ze(e)}function hr(e){if((e=e.__)&&e.__c&&!e.props.__P)return e.__e=null,e.__k.some(function(t){return t&&(e.__e=t.__e)}),hr(e)}function cr(e){(8&e.__g||!(e.__g|=8)||!Ge.push(e)||Jt++)&&lr==Y.debounceRendering||((lr=Y.debounceRendering)||queueMicrotask)(Ti)}function Ti(){var e,t,n,o,r,a,i,c,s;try{for(t=1;Ge.length;)Ge.length>t&&Ge.sort(pr),e=Ge.shift(),t=Ge.length,8&e.__g&&(o=void 0,r=void 0,a=(r=(n=e).__v).__e,i=[],c=[],(s=n.__P)&&((o=Je({constructor:void 0},r)).__v=r.__v+1,Y.vnode&&Y.vnode(o),Nn(s,o,r,n.__n,s.namespaceURI,32&r.__u?[a]:null,i,a||ze(r),32&r.__u,c),o.__v=r.__v,o.__.__k[o.__i]=o,vr(i,o,c),r.__=r.__e=null,o.__e!=a&&hr(o)))}finally{Ge.length=Jt=0}}function yr(e,t,n,o,r,a,i,c,s,h,l){var _,k,b,w,m,T,x=o.__k||Zt,B=t.length;for(s=Ai(n,t,x,s,B),_=0;_<B;_++)(b=n.__k[_])!=null&&(k=~b.__i&&x[b.__i]||Qt,b.__i=_,T=Nn(e,b,k,r,a,i,c,s,h,l),w=b.__e,(k.ref!=b.ref||8&k.__u)&&(k.ref&&qn(k.ref,null,b,k),b.ref&&l.push(b.ref,b.__c||w,b)),m=m||w,4&b.__u?(s=gr(b,s,e,!k.__v),k.__e&&(k.__e=null)):typeof b.type=="function"&&T!==void 0?s=T:w&&(s=w.nextSibling),b.__u&=-7);return n.__e=m,s}function Ai(e,t,n,o,r){var a,i,c,s,h,l,_,k,b,w,m=n.length,T=m,x=0,B=!1,f=e.__k=Array(r);for(a=0;a<r;a++)(i=t[a])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i!="object"||i.constructor==String?i=f[a]=Yt(null,i):On(i)?i=f[a]=Yt(_e,{children:i}):i.constructor===void 0&&i.__b?i=f[a]=Yt(i.type,i.props,i.key,i.ref,i.__v):f[a]=i,s=a+x,i.__=e,i.__b=e.__b+1,c=null,~(h=i.__i=Mi(i,n,s,T))&&(T--,(c=n[h])&&(c.__u|=2)),c&&c.__v?(i.__u|=2,h==s-1?x--:h==s+1?x++:h!=s&&(h>s?x--:x++,B=!0)):(~h||(r>m?x--:r<m&&x++),typeof i.type!="function"&&(i.__u|=4))):f[a]=null;if(B){for(l=[],_=[],a=0;a<r;a++)if((i=f[a])&&2&i.__u){for(k=0,b=l.length;k<b;)l[w=k+b>>1]<i.__i?k=w+1:b=w;l[k]=i.__i,_[a]=k+1}for(x=l.length;a--;)_[a]&&(_[a]==x?x--:f[a].__u|=4)}if(T)for(a=0;a<m;a++)!(c=n[a])||2&c.__u||(c.__e==o&&(o=ze(c)),Gn(c,c));return o}function gr(e,t,n,o){var r,a,i;if(typeof e.type=="function"){if(e.props.__P)return t;if(r=e.__k)for(a=0;a<r.length;a++)r[a]&&(r[a].__=e,t=gr(r[a],t,n,!1));return t}for(t&&!t.parentNode&&(t=ze(e))&&!t.parentNode&&(t=null),i=t;i&&i.nodeType==8;)i=i.nextSibling;for(e.__e!=i&&(!o&&n.moveBefore&&e.__e.parentNode?n.moveBefore(e.__e,t):n.insertBefore(e.__e,t||null)),t=e.__e;(t=t&&t.nextSibling)&&t.nodeType==8;);return t}function Mi(e,t,n,o){var r,a,i,c=e.key,s=e.type,h=t[n],l=h&&!(2&h.__u);if(h===null&&c==null||l&&c==h.key&&s==h.type)return n;if(o>(l?1:0)){for(r=n-1,a=n+1;r>=0||a<t.length;)if((h=t[i=r>=0?r--:a++])&&!(2&h.__u)&&c==h.key&&s==h.type)return i}return-1}function dr(e,t,n){n==null&&(n=""),t[0]=="-"?e.setProperty(t,n):e[t]=n}function Kt(e,t,n,o,r){var a,i;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof o=="string"&&(e.style.cssText=o=""),o)for(t in o)n&&t in n||dr(e.style,t,"");if(n)for(t in n)o&&n[t]==o[t]||dr(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")(e.__e||(e.__e={}))[t]=n,n&&o||(i=Hn[t]||(Hn[t]=Ci(t)),(e.__a||(e.__a={}))[t]=Fn,a=t!=(t=t.replace(mr,"$1")),(t=t.slice(2))[0]<"a"&&(t=t.toLowerCase()),n?e.addEventListener(t,i,a):e.removeEventListener(t,i,a));else{if(r=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function Ci(e){return function(t){if(this.__e){var n=this.__e[e];if(t[Wt]==null)t[Wt]=Fn++;else if(t[Wt]<this.__a[e])return;return n(Y.event?Y.event(t):t)}}}function Nn(e,t,n,o,r,a,i,c,s,h){var l,_,k,b,w,m,T,x,B,f,d,u,g,E,v,A,R,H,F,I,V=t.type;if(t.constructor!==void 0)return null;if(128&n.__u&&(s=32&n.__u,l=n.__c.__z)){if(t.__u|=s,_=a=[],l.nodeType==8)for(k=1,b=l.nextSibling;b;b=b.nextSibling){if(b.nodeType==8){if(b.data.startsWith("$s"))k++;else if(b.data.startsWith("/$s")&&!--k)break}a.push(b)}else a.push(l);c=a[0]}(l=Y.__b)&&l(t);e:if(typeof V=="function"){w=i.length;try{if(f=t.props,d=(l=V.prototype)&&l.render,u=(l=V.contextType)&&o[l.__c],g=l?u?u.props.value:l.__:o,n.__c?2&(m=t.__c=n.__c).__g&&(m.__g|=1):(d?t.__c=m=new V(f,g):(t.__c=m=new jt(f,g),m.constructor=V,m.render=Pi),u&&u.sub(m),m.state||(m.state={}),m.__n=o,m.__g|=8,m.__h=[],m.__k=[]),d&&(m.__s||(m.__s=m.state),V.getDerivedStateFromProps&&(m.__s==m.state&&(m.__s=Je({},m.__s)),Je(m.__s,V.getDerivedStateFromProps(f,m.__s)))),T=m.props,x=m.state,m.__v=t,n.__c){if(d&&!V.getDerivedStateFromProps&&f!==T&&m.componentWillReceiveProps&&m.componentWillReceiveProps(f,g),t.__v==n.__v&&!(8&m.__g)||!(4&m.__g)&&m.shouldComponentUpdate&&m.shouldComponentUpdate(f,m.__s,g)===!1){t.__v!=n.__v&&(m.props=f,m.state=m.__s,m.__g&=-9),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(G){G&&(G.__=t)}),Zt.push.apply(m.__h,m.__k),m.__k=[],m.__h.length&&i.push(m),c=ze(n);break e}m.componentWillUpdate&&m.componentWillUpdate(f,m.__s,g),d&&m.componentDidUpdate&&m.__h.push(function(){m.componentDidUpdate(T,x,B)})}else d&&!V.getDerivedStateFromProps&&m.componentWillMount&&m.componentWillMount(),d&&m.componentDidMount&&m.__h.push(m.componentDidMount);if(m.context=g,m.props=f,m.__P=e,m.__g&=-5,E=Y.__r,v=0,d)m.state=m.__s,m.__g&=-9,E&&E(t),l=m.render(m.props,m.state,m.context),Zt.push.apply(m.__h,m.__k),m.__k=[];else do m.__g&=-9,E&&E(t),l=m.render(m.props,m.state,m.context),m.state=m.__s;while(8&m.__g&&++v<25);m.state=m.__s,m.getChildContext&&(o=Je({},o,m.getChildContext())),d&&n.__c&&m.getSnapshotBeforeUpdate&&(B=m.getSnapshotBeforeUpdate(T,x)),A=l&&l.type===_e&&l.key==null?l.props.children:l,f.__P&&(l=c,r=(e=f.__P).namespaceURI,s=a=null,n.props&&n.props.__P!=e&&(n.__k.some(function(G){G&&Gn(G,G)}),n.__k=null),c=n.__k?ze(n,0):null),c=yr(e,On(A)?A:[A],t,n,o,r,a,i,c,s,h),f.__P&&(t.__e=null,c=l),t.__u&=-161,128&n.__u&&(m.__z=null),_&&_.some(en),m.__h.length&&i.push(m),1&m.__g&&(m.__g&=-4)}catch(G){if(i.length=w,t.__v=null,s||a)if(G.then){if(R=0,t.__u|=s?160:128,a){for(~(F=a.indexOf(c||void 0))||(F=a.length);(I=a[F-1])&&I.nodeType==8;)F--;for(;F<a.length;F++)if(I=a[F]){if(a[F]=null,I.nodeType==8){if(I.data.startsWith("$s"))R++||(H=I);else if(R&&I.data.startsWith("/$s")&&!--R){c=I;break}}else if(!R)break}}if(!H){for(;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;H=c}t.__c.__z||(t.__c.__z=H),t.__e=c}else a&&a.some(en);else t.__e=n.__e;t.__k||(t.__k=n.__k||[]),G.then||br(t),Y.__e(G,t,n)}}else c=t.__e=Li(n.__e,t,n,o,r,a,i,s,h,e);return(l=Y.diffed)&&l(t),128&t.__u?void 0:c}function br(e){e&&(e.__c&&(e.__c.__g|=4),e.__k&&e.__k.some(br))}function vr(e,t,n){for(var o=0;o<n.length;)qn(n[o++],n[o++],n[o++]);Y.__c&&Y.__c(t,e),e.some(function(r){try{e=r.__h,r.__h=[],e.some(function(a){a.call(r)})}catch(a){Y.__e(a,r.__v)}})}function Li(e,t,n,o,r,a,i,c,s,h){var l,_,k,b,w,m,T,x,B,f=n.props||Qt,d=t.props,u=t.type;if(u=="svg"?r="http://www.w3.org/2000/svg":u=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),a){for(l=0;l<a.length;l++)if((w=a[l])&&(u?w.localName==u:w.nodeType==3)){e=w,a[l]=null;break}}if(!e){if(x=h.ownerDocument||document,!u)return x.createTextNode(d);e=x.createElementNS(r,u,d.is&&d),c&&(Y.__m&&Y.__m(t,a),c=!1),a=null}if(u){if(h=u=="template"?e.content:e,a=u=="textarea"&&d.defaultValue!=null?null:a&&fr.call(h.childNodes),!c&&a)for(f={},l=0;l<e.attributes.length;l++)f[(w=e.attributes[l]).name]=w.value;for(l in f)w=f[l],l=="dangerouslySetInnerHTML"?k=w:l=="children"||l in d||l=="value"&&"defaultValue"in d||l=="checked"&&"defaultChecked"in d||Kt(e,l,null,w,r);for(l in B=1&n.__u,d)w=d[l],l=="children"?b=w:l=="dangerouslySetInnerHTML"?_=w:l=="value"?m=w:l=="checked"?T=w:c&&typeof w!="function"||!(f[l]!==w||B&&w!=null)||Kt(e,l,w,f[l],r);_?(c||k&&(_.__html==k.__html||_.__html==e.innerHTML)||(e.innerHTML=_.__html),t.__k=[]):(k&&(e.textContent=""),(u=="foreignObject"||r=="http://www.w3.org/1998/Math/MathML"&&Ei.test(u))&&(r="http://www.w3.org/1999/xhtml"),yr(h,On(b)?b:[b],t,n,o,r,a,i,a?a[0]:n.__k&&ze(n,0),c,s),a&&a.some(en)),c&&u!="textarea"||(l="value",u=="progress"&&m==null?e.removeAttribute(l):m==null||m===e[l]&&(u!="progress"||m)||Kt(e,l,m,f[l],r),l="checked",T!=null&&T!=e[l]&&Kt(e,l,T,f[l],r))}else f===d||c&&e.data==d||(e.data=d);return e}function qn(e,t,n,o){try{typeof e=="function"?t?t.__x=e(t)||1:o&&(o=o.__c||o.__e)&&(t=o.__x)&&(o.__x=null,typeof t=="function"?t():e(null)):e.current=t}catch(r){Y.__e(r,n)}}function Gn(e,t,n){var o,r;if(Y.unmount&&Y.unmount(e),!(o=e.ref)||o.current&&o.current!=e.__e||qn(o,null,t,e),o=e.__c){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(a){Y.__e(a,t)}o.__P=o.__n=null}if(o=e.__k)for(r=0;r<o.length;r++)o[r]&&Gn(o[r],t,typeof e.type!="function"||n&&!e.props.__P);(o=e.__e)&&(n||en(o),o.__e&&(o.__e=null)),e.__e=e.__c=e.__=null}function Pi(e,t,n){return this.constructor(e,n)}function Fe(e,t){var n,o,r,a;Y.__&&Y.__(e,t),t.nodeType==9&&(t=t.documentElement),o=(n=e&&32&e.__u)?null:t.__k,t.__k=Yt(_e,{children:[e]}),r=[],a=[],Nn(t,t.__k,o||Qt,Qt,t.namespaceURI,o?null:t.firstChild?fr.call(t.childNodes):null,r,o?o.__e:t.firstChild,n,a),vr(r,t.__k,a),t.__k.props.children=null}Y={__e:function(e,t,n,o){for(var r,a,i;t=t.__;)if((r=t.__c)&&!(1&r.__g)){r.__g|=4;try{if((a=r.constructor)&&a.getDerivedStateFromError&&(r.setState(a.getDerivedStateFromError(e)),i=8&r.__g),r.componentDidCatch&&(r.componentDidCatch(e,o||{}),i=8&r.__g),i)return void(r.__g|=2)}catch(c){e=c,i=0}}throw Jt=0,e}},ur=0,_i=function(e){return e!=null&&e.constructor===void 0},jt.prototype.setState=function(e,t){var n=this.__s;n&&n!=this.state||(n=this.__s=Je({},this.state)),typeof e=="function"&&(e=e(Je({},n),this.props)),e&&(Je(n,e),this.__v&&(t&&this.__k.push(t),cr(this)))},jt.prototype.forceUpdate=function(e){this.__v&&(this.__g|=4,e&&this.__h.push(e),cr(this))},jt.prototype.render=_e,Ge=[],Jt=0,pr=function(e,t){return e.__v.__b-t.__v.__b},Wt=Symbol(),mr=/(PointerCapture)$|Capture$/i,Fn=0,Hn={},Si=0;var tn,ve,zn,xr,Ri=Object.is,Vn=0,Cr=[],$n=[],ae=Y,wr=ae.__b,kr=ae.__r,_r=ae.diffed,Sr=ae.__c,Er=ae.unmount,Tr=ae.__;function Lr(e,t){ae.__h&&ae.__h(ve,e,Vn||t),Vn=0;var n=ve.__H||(ve.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function Qe(e,t){var n=Lr(tn++,4);!ae.__s&&Pr(n.__H,t)&&(n.__P=!1,n.__=e,n.u=t,ve.__h.push(n))}function Ze(e){return Vn=5,Ii(function(){return{current:e}},[])}function Ii(e,t){var n=Lr(tn++,7);return Pr(n.__H,t)&&(n.__=e(),n.__H=t),n.__}function Di(){var e;do{for(;e=$n.shift();)try{_t(e)}catch(n){ae.__e(n,{__:(e=e.__P)&&e.__v})}for(;e=Cr.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(_t),t.__h.some(Un),t.__h=[]}catch(n){t.__h=[],ae.__e(n,e.__v)}}}while($n.length)}ae.__b=function(e){ve=null,wr&&wr(e)},ae.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),Tr&&Tr(e,t)},ae.__r=function(e){kr&&kr(e),tn=0;var t=(ve=e.__c).__H;t&&(zn==ve?ve.__h=[]:(t.__h.some(_t),t.__h.some(Un),tn=0),t.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})),zn=ve},ae.diffed=function(e){_r&&_r(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&Mr(Cr.push(t)),t.__H.__.some(function(n){n.u&&(n.__H=n.u)})),zn=ve=null},ae.__c=function(e,t){t.some(function(n){try{n.__h.some(_t),n.__h=n.__h.filter(function(o){return!o.__||Un(o)})}catch(o){t.some(function(r){r.__h&&(r.__h=[])}),t=[],ae.__e(o,n.__v)}}),Sr&&Sr(e,t)},ae.unmount=function(e){Er&&Er(e);var t,n,o=e.__c;o&&o.__H&&(o.__H.__.some(function(r){try{if(r.__P&&r.__c){if(n===void 0){for(n=e.__;n&&(!n.__c||!n.__c.__P);)n=n.__;n=n&&n.__c}r.__P=n,Mr($n.push(r))}else _t(r)}catch(a){t=a}}),o.__H=void 0,t&&ae.__e(t,o.__v))};var Ar=typeof requestAnimationFrame=="function";function Bi(e){var t,n=function(){clearTimeout(o),Ar&&cancelAnimationFrame(t),setTimeout(e)},o=setTimeout(n,35);Ar&&(t=requestAnimationFrame(n))}function Mr(e){e!=1&&xr==ae.requestAnimationFrame||((xr=ae.requestAnimationFrame)||Bi)(Di)}function _t(e){var t=ve,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),ve=t}function Un(e){var t=ve;e.__c=e.__(),ve=t}function Pr(e,t){return!e||e.length!=t.length||t.some(function(n,o){return!Ri(n,e[o])})}var Hi=0;function y(e,t,n,o,r,a){t||(t={});var i,c,s=t;if("ref"in s&&typeof e!="function")for(c in s={},t)c=="ref"?i=t[c]:s[c]=t[c];var h={type:e,props:s,key:n,ref:i,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--Hi,__i:-1,__u:0};return(r||a)&&(h.__source=r,h.__self=a),Y.vnode&&Y.vnode(h),h}function pt({label:e,class:t,at:n,decorative:o,variant:r}){let a=r==="tab"?t?`kit-key-tab ${t}`:"kit-key-tab":t??"kit-key-chip";return y("kbd",{class:a,"data-keyhint":n,"aria-hidden":o?"true":void 0,children:e})}var Xn=null;function Rr(){return Xn}function Ce(e){return y("button",{type:"button",id:e.id,class:e.class,disabled:e.disabled,"aria-label":e.label,title:e.title,"aria-pressed":e.pressed,role:e.checked===void 0?void 0:"switch","aria-checked":e.checked,onClick:t=>{Xn=t.currentTarget,t.currentTarget.blur(),e.onClick(),setTimeout(()=>{Xn=null},0)},children:[e.children,e.keyLabel?y(pt,{label:e.keyLabel,variant:"tab",class:"kit-key-inline",decorative:!0}):null]})}var Fi=new Set(["button","input","select","textarea"]);function Oi(e){if(e.hidden||e.inert||e.getAttribute("inert")!=null||e.style&&e.style.display==="none")return!0;if(typeof getComputedStyle=="function")try{if(getComputedStyle(e).display==="none")return!0}catch{}return!1}function Ir(e){let t=[],n=(o,r)=>{let a=!1;for(let i of Array.from(o.children)){if(i.nodeType!==1)continue;let c=i,s=(c.localName||"").toLowerCase(),h=s==="legend"&&!a;if(s==="legend"&&(a=!0),Oi(c))continue;let l=c.getAttribute("tabindex"),_=l!=null?Number(l)>=0:Fi.has(s)||s==="a"&&c.getAttribute("href")!=null,k=r&&!h;_&&!k&&!c.disabled&&t.push(c),n(c,k||s==="fieldset"&&c.disabled===!0)}};return n(e,!1),t}function Ni(e,t){for(let n=t;n;n=n.parentNode)if(n===e)return!0;return!1}function mt(e){let t=Ze(null),n=Ze(null),o=Ze(!1),r=Ze(!1),a=()=>{n.current?.focus?.(),n.current=null};return Qe(()=>{if(e.open&&!o.current){let i=document.activeElement;n.current=i&&i!==document.body?i:Rr();let c=e.focusId?document.getElementById(e.focusId):null,s=t.current?Ir(t.current).find(h=>h.localName==="button"):void 0;(c??s??t.current)?.focus?.()}else!e.open&&o.current&&a();o.current=e.open},[e.open]),Qe(()=>()=>{o.current&&a()},[]),Qe(()=>{if(!e.open)return;let i=c=>{let s=t.current;if(c.key!=="Tab"||c.ctrlKey||c.altKey||c.metaKey||!s)return;let h=Ir(s),l=document.activeElement,_=Ni(s,l);if(!h.length){c.preventDefault(),s.focus();return}let k=h[0],b=h[h.length-1],w=h.includes(l);(c.shiftKey?!_||!w||l===k:!_||!w||l===b)&&(c.preventDefault(),(c.shiftKey?b:k).focus())};return document.addEventListener("keydown",i,!0),()=>document.removeEventListener("keydown",i,!0)},[e.open]),Qe(()=>{let i=e.onDismiss;if(!e.open||!i)return;let c=s=>{!ut(s)||Ut(s.target)||(s.preventDefault(),s.stopPropagation(),s.repeat||i())};return document.addEventListener("keydown",c,!0),()=>document.removeEventListener("keydown",c,!0)},[e.open,e.onDismiss]),y("div",{id:e.id,class:e.veilClass,hidden:!e.open,onPointerDown:i=>{r.current=i.target===i.currentTarget},onClick:i=>{let c=r.current&&i.target===i.currentTarget;r.current=!1,c&&e.onDismiss?.()},children:y("div",{class:e.panelClass,role:e.role??"dialog","aria-modal":"true","aria-labelledby":e.titleId,"aria-describedby":e.describedBy,tabIndex:-1,ref:t,children:[e.kicker!=null&&e.kicker!==!1&&y("p",{class:e.kickerClass,id:e.kickerId,children:e.kicker}),e.close!=null&&e.close!==!1?y("div",{class:"kit-dialog-head",children:[y("h2",{id:e.titleId,class:e.titleClass,children:e.title}),e.close]}):y("h2",{id:e.titleId,class:e.titleClass,children:e.title}),e.children]})})}function qi({rows:e}){return e.length?y(_e,{children:e.map(t=>y("li",{children:[y("span",{class:"cylon-hs-rank",children:["#",t.rank]}),y("strong",{class:"cylon-hs-initials",children:t.initials}),y("span",{class:"cylon-hs-date",children:t.date}),y("span",{class:"cylon-hs-score",children:[t.score," KOs"]})]},t.rank))}):y("li",{class:"cylon-hs-empty",children:"No scores yet"})}function nn({id:e,rows:t}){return y("ol",{class:"cylon-high-scores",id:e,children:y(qi,{rows:t})})}var St=[{board:"week",id:"cylon-tab-week",label:"This Week"},{board:"alltime",id:"cylon-tab-alltime",label:"All Time"}];function Gi(e){let t=n=>o=>{if(o.key==="ArrowUp")e.onSpin(n,1);else if(o.key==="ArrowDown")e.onSpin(n,-1);else if(o.key==="ArrowLeft")e.onPick(n-1);else if(o.key==="ArrowRight"||o.key===" "||o.key==="Spacebar")n<2&&e.onPick(n+1);else if(o.key==="Enter")e.onSubmit();else return;o.preventDefault()};return y("div",{class:"cylon-initials",id:"cylon-initials",role:"group","aria-label":"Arcade initials",children:[0,1,2].map(n=>y("div",{class:"cylon-initial-slot",onWheel:o=>{o.preventDefault(),e.onSpin(n,o.deltaY<0?1:-1)},children:[y("button",{type:"button",class:"cylon-initial-spin","data-initial":n,"data-dir":"1","aria-label":`Scroll initial ${n+1} up`,onClick:()=>e.onSpin(n,1),children:"▲"}),y("button",{type:"button",class:n===e.active?"cylon-initial is-active":"cylon-initial",id:`cylon-initial-${n}`,"data-initial":n,"aria-label":`Initial ${n+1}, use up and down to change`,onClick:()=>e.onPick(n),onKeyDown:t(n),children:e.initials[n]}),y("button",{type:"button",class:"cylon-initial-spin","data-initial":n,"data-dir":"-1","aria-label":`Scroll initial ${n+1} down`,onClick:()=>e.onSpin(n,-1),children:"▼"})]},n))})}function zi(e){return y("div",{class:"cylon-hs-tabs",role:"tablist","aria-label":"High score board",children:St.map((t,n)=>y("button",{type:"button",class:"cylon-hs-tab",role:"tab",id:t.id,"data-board":t.board,"aria-selected":e.board===t.board?"true":"false",tabIndex:e.board===t.board?0:-1,"aria-controls":"cylon-gameover-panel",onClick:()=>e.onTab(t.board,!1),onKeyDown:o=>{let r=o.key==="ArrowRight"?1:o.key==="ArrowLeft"?-1:0,a=o.key==="Home"?0:o.key==="End"?St.length-1:-1,i=r?(n+r+St.length)%St.length:a;i<0||(o.preventDefault(),e.onTab(St[i].board,!0))},children:t.label},t.id))})}function Vi(e){let t=e.board==="alltime"?"cylon-tab-alltime":"cylon-tab-week";return y(mt,{open:e.open,id:"cylon-gameover",veilClass:"cylon-gameover",panelClass:"cylon-gameover-panel",kicker:"Cylon Defense",kickerClass:"cylon-gameover-kicker",titleId:"cylon-gameover-title",titleClass:"cylon-gameover-title",title:"Game Over",focusId:e.mode==="entry"?"cylon-initial-0":"cylon-play-again",children:[y("p",{class:"cylon-gameover-reason",id:"cylon-gameover-reason",children:e.reason}),y("p",{class:"cylon-gameover-stats",children:[y("span",{children:[y("em",{id:"cylon-gameover-kos",children:e.kos})," KOs"]}),y("span",{children:[y("em",{id:"cylon-gameover-hits",children:e.hp})," HP"]})]}),y("div",{class:"cylon-gameover-entry",id:"cylon-gameover-entry",hidden:e.mode!=="entry",children:[y("p",{class:"cylon-gameover-entry-label",children:"Enter Your Initials"}),y(Gi,{...e}),y("p",{class:"cylon-gameover-entry-hint",children:"↑↓ change letter · ←→ next · Enter submit"}),y("p",{class:"cylon-gameover-entry-error",id:"cylon-initials-error",role:"alert",hidden:!e.error,children:e.error}),y("div",{class:"cylon-gameover-actions",children:[y(Ce,{class:"cylon-gameover-btn",id:"cylon-score-submit",disabled:e.submitting,onClick:e.onSubmit,children:"Submit Score"}),y(Ce,{class:"cylon-gameover-btn is-ghost",id:"cylon-score-skip",onClick:e.onSkip,children:"Skip"})]})]}),y("div",{class:"cylon-gameover-board",id:"cylon-gameover-board",hidden:e.mode!=="board",children:[y("p",{class:"cylon-gameover-entry-label",children:"High Scores"}),y("p",{class:"cylon-gameover-alltime",id:"cylon-gameover-alltime",role:"status",hidden:e.allTimeRank===null,children:e.allTimeRank===null?"":`New all-time #${e.allTimeRank}!`}),y(zi,{...e}),y("div",{role:"tabpanel",id:"cylon-gameover-panel","aria-labelledby":t,tabIndex:0,children:y(nn,{id:"cylon-gameover-scores",rows:e.rows})}),y("p",{class:"cylon-gameover-entry-hint",id:"cylon-gameover-reset",children:e.resetText}),y(Ce,{class:"cylon-gameover-btn",id:"cylon-play-again",onClick:e.onDismiss,children:e.quit?"Close":"Play Again"})]})]})}function Dr(e,t){Fe(y(Vi,{...t}),e)}var $i={hits:()=>"You took too much fire. The eye cooked you.",nuke:()=>"A nuke landed on you. Frak.",quit:e=>e?"Run ended. Record your score?":"Run ended."};function Br(e){let{game:t,state:n,scores:o}=e,r=!1,a="",i=0,c=0,s="entry",h=["A","A","A"],l=0,_="",k=!1,b="week",w=null,m="Play often — scores reset every Sunday at midnight Central.";function T(){e.root&&Dr(e.root,{open:r,reason:a,kos:i,hp:c,mode:s,initials:h,active:l,error:_,submitting:k,board:b,allTimeRank:w,rows:Xt(b==="alltime"?o.alltime():o.board()),resetText:m,quit:t.run.endReason==="quit",onSpin:g,onPick:u,onSubmit:()=>{v()},onSkip:A,onTab:d,onDismiss:H})}let x=I=>{document.getElementById(I)?.focus()};function B(){e.boardChanged(),T()}async function f(){let I=await o.load();I&&(m=e.weeklyResetText(I)),B()}function d(I,V){b=I,T(),V&&x(I==="alltime"?"cylon-tab-alltime":"cylon-tab-week")}function u(I){l=Math.max(0,Math.min(2,I)),T(),x(`cylon-initial-${l}`)}function g(I,V){let G=(h[I]??"A").charCodeAt(0)-65,ne=String.fromCharCode(65+((G+V)%26+26)%26);h=h.map((q,O)=>O===I?ne:q),_="",u(I)}function E(){s="board",T(),x("cylon-play-again"),f()}async function v(){if(k)return;let I=t.run.pendingScore?t.run.pendingScore.score:t.run.koScore,V=t.run.pendingScore?t.run.pendingScore.hits:t.run.hitsTaken;k=!0,w=null,T();let G=await o.submit(I,h.join(""),V);if(k=!1,G.saved){Gt("score_submit"),_="",w=G.allTimeRank,t.run=n.clearPendingScore(t.run),E();return}G.problem==="invalid-initials"?_="Those initials aren't valid — choose another.":G.problem==="save-failed"&&(_="Could not save that score. Refresh and play again."),B()}function A(){t.run=n.clearPendingScore(t.run),E()}function R(){r=!1,s="entry",w=null,b="week",t.run=n.setEndReason(n.clearPendingScore(t.run),null),T()}function H(){if(t.run.endReason==="quit"){R(),t.run=n.clearGameOver(t.run),e.resetRunStats(),e.closed();return}e.setGameEnabled(!0)}async function F(I){if(!e.root)return;t.run=n.setEndReason(t.run,I),await f();let V=o.qualifies(t.run.koScore);V||(t.run=n.clearPendingScore(t.run)),a=$i[I](V),i=t.run.koScore,c=e.currentHp(),s=V?"entry":"board",h=["A","A","A"],l=0,_="",r=!0,T()}return{renderHighScores:B,fetchHighScores:f,hideGameOver:R,showGameOver:F,resetText:()=>m}}function Hr(e){return{parse(t){let n=JSON.parse(t);if(!e(n))throw new Error("unexpected shape");return n},stringify:t=>JSON.stringify(t)}}function Fr(e,t,n,o){let r=new Set,a=null;function i(){if(a)return a.v;try{let c=o?.getItem(e);return c==null?t:n.parse(c)}catch{return t}}return{get:i,set(c){let s=!1;try{o&&(o.setItem(e,n.stringify(c)),s=!0)}catch{}a=s?null:{v:c};for(let h of r)h(c)},subscribe(c){return r.add(c),()=>r.delete(c)}}}var on={setTimeout:(e,t)=>window.setTimeout(e,t),clearTimeout:e=>window.clearTimeout(e),setInterval:(e,t)=>window.setInterval(e,t),clearInterval:e=>window.clearInterval(e)};function rn(){try{return window.localStorage}catch{return null}}var Or="cylon-settings",Kn={gameEnabled:!1,soundEnabled:!0,musicEnabled:!0,soundVolume:50,musicVolume:50,eyeEnabled:!0};function Nr(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ui(e){let t=(o,r,a)=>y("label",{class:"cylon-setting",children:[y("input",{type:"checkbox","data-setting":o,checked:r,onChange:i=>e.onSetting(o,i.currentTarget.checked)}),y("span",{children:a})]}),n=(o,r,a,i)=>{let c=s=>e.onSetting(o,Number(s.currentTarget.value));return y("label",{class:"cylon-setting cylon-setting-slider",children:[y("span",{children:a}),y("input",{type:"range",min:"0",max:"100",step:"1",value:r,"data-setting":o,"aria-label":i,onInput:c,onChange:c})]})};return y(_e,{children:[y("p",{class:"cylon-settings-title",children:"Options"}),t("soundEnabled",e.soundEnabled,"Sound Effects"),n("soundVolume",e.soundVolume,"SFX Volume","Sound effects volume"),t("musicEnabled",e.musicEnabled,"Music"),n("musicVolume",e.musicVolume,"Music Volume","Music volume"),t("eyeEnabled",e.eyeEnabled,"Eye Tracking"),y("p",{class:"cylon-settings-title cylon-settings-scores-title",children:"Weekly High Scores"}),y("p",{class:"cylon-settings-hint",id:"cylon-weekly-reset",children:e.resetText}),y(nn,{id:"cylon-high-scores",rows:e.rows}),y("p",{class:"cylon-settings-hint",children:"Start with 30 HP — occasional nukes and small missiles (2 HP each). Last 10s without a hit to heal 1. Cyan/pink missiles chase you; orange locks where you just aimed. More drones as KOs rise. Drag the reticle to dodge · tap drones · Grenade / Raptor in the bar."})]})}function qr(e,t){Fe(y(Ui,{...t}),e)}function Gr(e){let{settingsRoot:t,gameToggleBtn:n,gameToggleLabel:o,cicEnterBtn:r,navBurger:a,navMenu:i,navGame:c,siteBrand:s,BRAND_CIVIL:h,BRAND_COMBAT:l,NAV_FADE_MS:_,reduceMotion:k,settingsPanel:b,fetchHighScores:w,setGameEnabled:m,setEyeTracking:T}=e,x={settingChanged:q=>e.settingChanged(q)},B=Kn,f=Fr(Or,Kn,Hr(Nr),rn()),d=Object.assign({},B,f.get());d.gameEnabled=!1,d.soundVolume=Math.max(0,Math.min(100,Number(d.soundVolume)||B.soundVolume)),d.musicVolume=Math.max(0,Math.min(100,Number(d.musicVolume)||B.musicVolume));let u=!1;d.soundVolume===85&&(d.soundVolume=50,u=!0),d.musicVolume===40&&(d.musicVolume=50,u=!0),u&&f.set(d);let g=0,E=null;function v(){f.set(d),A(),H()}function A(){b&&qr(b,{soundEnabled:d.soundEnabled,soundVolume:d.soundVolume,musicEnabled:d.musicEnabled,musicVolume:d.musicVolume,eyeEnabled:d.eyeEnabled,rows:e.boardRows(),resetText:e.resetText(),onSetting:R})}function R(q,O){q==="soundVolume"||q==="musicVolume"?typeof O=="number"&&(d[q]=Math.max(0,Math.min(100,O||0))):typeof O=="boolean"&&(d[q]=O),v(),q==="eyeEnabled"&&!d.eyeEnabled&&T(!1),x.settingChanged(q)}function H(){n&&(n.classList.toggle("is-on",d.gameEnabled),n.setAttribute("aria-pressed",d.gameEnabled?"true":"false"),o&&(o.textContent=d.gameEnabled?"Game On":"Game Off"))}function F(q){if(document.body.classList.toggle("cylon-nav-combat",q),s&&(s.textContent=q?l:h),c&&(c.hidden=!q),t&&(t.hidden=!q),r&&(r.hidden=q),!q){let O=document.getElementById("cylon-settings-panel"),Q=document.getElementById("cylon-settings-toggle");O&&!O.hidden&&(O.hidden=!0,Q&&Q.setAttribute("aria-expanded","false"))}}function I(){let q=!!d.gameEnabled,O=document.querySelector(".site-nav-inner"),Q=document.body.classList.contains("cylon-nav-combat");if(k||!O||Q===q){clearTimeout(E),E=null,O?.classList.remove("is-nav-fading"),F(q);return}let K=++g;clearTimeout(E),O.classList.add("is-nav-fading"),E=setTimeout(()=>{K===g&&(F(q),requestAnimationFrame(()=>{requestAnimationFrame(()=>{K===g&&(O.classList.remove("is-nav-fading"),E=null)})}))},_)}function V(){if(!a||!i)return;let q=()=>{i.classList.remove("is-open"),a.setAttribute("aria-expanded","false")};a.addEventListener("click",O=>{O.stopPropagation();let Q=!i.classList.contains("is-open");i.classList.toggle("is-open",Q),a.setAttribute("aria-expanded",Q?"true":"false")}),i.querySelectorAll("a.site-link").forEach(O=>{O.addEventListener("click",()=>q())}),document.addEventListener("click",O=>{i.classList.contains("is-open")&&(i.contains(O.target)||a.contains(O.target)||q())}),window.addEventListener("resize",()=>{window.matchMedia("(min-width: 820px)").matches&&q()})}function G(){n&&(H(),n.addEventListener("click",q=>{q.preventDefault(),q.stopPropagation(),m(!d.gameEnabled)}))}function ne(){if(!t)return;A();let q=document.getElementById("cylon-settings-toggle"),O=b;!q||!O||(q.addEventListener("click",Q=>{Q.stopPropagation();let K=O.hasAttribute("hidden");K?(w(),O.removeAttribute("hidden")):O.setAttribute("hidden",""),q.setAttribute("aria-expanded",K?"true":"false")}),document.addEventListener("click",Q=>{t.contains(Q.target)||(O.setAttribute("hidden",""),q.setAttribute("aria-expanded","false"))}))}return{settings:d,saveSettings:v,syncGameToggleUi:H,syncNavChrome:I,renderSettings:A,bindSettings:ne,bindGameToggle:G,bindNavMenu:V}}function zr(){return y(_e,{children:[y("li",{children:["Over time, expect occasional ",y("strong",{children:"nukes"})," and smaller ",y("strong",{children:"missiles"})," (each missile costs ",y("strong",{children:"2 HP"}),")."]}),y("li",{children:[y("strong",{children:"Cyan/pink"})," missiles chase you; ",y("strong",{children:"orange"})," ones aim where you just were."]}),y("li",{children:["Go ",y("strong",{children:"10 seconds"})," without taking a hit to ",y("strong",{children:"heal 1 HP"}),"."]}),y("li",{children:["More ",y("strong",{children:"drones"})," appear as your KO count rises."]})]})}function Xi(){return y("div",{class:"cylon-help-body",id:"cylon-help-desktop",children:y("ol",{children:[y("li",{children:["Flip ",y("strong",{children:"Game On"})," in the top bar."]}),y("li",{children:[y("strong",{children:"Move the mouse"})," to dodge bolts and nukes — the eye and drones track your cursor."]}),y("li",{children:[y("strong",{children:"Click drones"})," to KO them and score."]}),y("li",{children:[y("strong",{children:"Grenade"})," (",y(pt,{label:"G"}),"): arm, then click where you want the blast; ",y(pt,{label:"Q"})," puts it away."]}),y("li",{children:[y("strong",{children:"Raptor"})," (",y(pt,{label:"R"}),"): orbital strike that clears the field and dazes the eye."]}),y(zr,{}),y("li",{children:["You start with ",y("strong",{children:"30 HP"})," — hit 0, or take a nuke, then enter 3 initials for the board."]})]})})}function Ki(){return y("div",{class:"cylon-help-body",id:"cylon-help-mobile",children:y("ol",{children:[y("li",{children:["Flip ",y("strong",{children:"Game On"})," in the top bar."]}),y("li",{children:[y("strong",{children:"Drag the green reticle"})," with one finger to dodge. Drones and nukes aim at that reticle."]}),y("li",{children:["With your ",y("strong",{children:"other finger"}),", tap drones to KO them, or tap Grenade / Raptor / menu controls."]}),y("li",{children:[y("strong",{children:"Grenade"}),": tap the button to arm, then tap the page to throw."]}),y("li",{children:[y("strong",{children:"Raptor"}),": tap for a strike that clears drones and dazes the eye."]}),y(zr,{}),y("li",{children:["You start with ",y("strong",{children:"30 HP"})," — hit 0, or take a nuke, then scroll initials ▲▼ for the high-score board."]})]})})}function Wi(e){return y(mt,{open:e.open,id:"cylon-help",veilClass:"cylon-help",panelClass:"cylon-help-panel",kicker:"Cylon Defense",kickerClass:"cylon-help-kicker",titleId:"cylon-help-title",titleClass:"cylon-help-title",title:"How to Play",focusId:"cylon-help-close",onDismiss:e.onClose,children:[y("p",{class:"cylon-help-platform",id:"cylon-help-platform",children:e.touch?"Touch Controls":"Desktop Controls"}),e.touch?y(Ki,{}):y(Xi,{}),y(Ce,{class:"cylon-gameover-btn",id:"cylon-help-close",onClick:e.onClose,children:"Got It"})]})}function Vr(e,t){Fe(y(Wi,{...t}),e)}var Tt={};_n(Tt,{beginRun:()=>Qn,clearGameOver:()=>ro,clearPendingScore:()=>oo,createRun:()=>jn,createSchedule:()=>Wn,endRun:()=>no,healOne:()=>to,msUntil:()=>Et,pending:()=>Yi,recordKill:()=>ji,resetScore:()=>Jn,setEndReason:()=>Ji,skewForPause:()=>Yn,stopClock:()=>Zn,takeHits:()=>eo});function Wn(){return{missileDueAt:0,nukeDueAt:0,healDueAt:0,grenadeReadyAt:0,raptorReadyAt:0,eyeDisorientedUntil:0}}function Yn(e,t,n){if(n<=0)return e;let o=r=>r>t?r+n:r;return{missileDueAt:o(e.missileDueAt),nukeDueAt:o(e.nukeDueAt),healDueAt:o(e.healDueAt),grenadeReadyAt:o(e.grenadeReadyAt),raptorReadyAt:o(e.raptorReadyAt),eyeDisorientedUntil:o(e.eyeDisorientedUntil)}}function Et(e,t){return Math.max(0,e-t)}function Yi(e,t){return t<e}function jn(){return{koScore:0,hitCount:0,hitsTaken:0,runStartedAt:0,gameOver:!1,endReason:null,pendingScore:null}}function Jn(e){return{...e,koScore:0,hitCount:0,hitsTaken:0,gameOver:!1,pendingScore:null}}function ji(e){return{...e,koScore:e.koScore+1}}function Qn(e,t){return{...e,runStartedAt:t}}function Zn(e){return e.runStartedAt===0?e:{...e,runStartedAt:0}}function eo(e,t,n,o=!1){let r=Math.max(0,Number(t)||0),a={...e,hitCount:e.hitCount+r,hitsTaken:e.hitsTaken+r},i=o?"nuke":a.hitCount>=n?"hits":null;return{run:a,ends:i}}function to(e){return e.hitCount>0?{...e,hitCount:e.hitCount-1}:e}function no(e,t){return{...e,gameOver:!0,runStartedAt:0,pendingScore:{score:e.koScore,hits:e.hitsTaken,reason:t}}}function Ji(e,t){return{...e,endReason:t}}function oo(e){return e.pendingScore===null?e:{...e,pendingScore:null}}function ro(e){return e.gameOver?{...e,gameOver:!1}:e}var $r="Swipe the app away to close it",Qi=150,Zi=["fullscreen","standalone","minimal-ui"];function ao(e){return Zi.some(t=>e.matches(`(display-mode: ${t})`))||e.iosStandalone()}async function Ur(e){let t=ao(e);if(t){try{e.closeWindow()}catch{}if(await new Promise(o=>{e.timers.setTimeout(()=>o(e.closed()),Qi)}))return"closed"}if(e.fullscreenElement())try{await e.exitFullscreen()}catch{}return t?"title-with-hint":"title"}function es(e,t){return{...e,fullscreenSupported:n=>{let o=n;return(typeof o.requestFullscreen=="function"||typeof o.webkitRequestFullscreen=="function")&&(typeof t.exitFullscreen=="function"||typeof t.webkitExitFullscreen=="function")},fullscreenElement:()=>e.fullscreenElement()??t.webkitFullscreenElement??null,requestFullscreen:n=>{let o=n;return typeof o.requestFullscreen=="function"?e.requestFullscreen(n):typeof o.webkitRequestFullscreen=="function"?Promise.resolve(o.webkitRequestFullscreen()):Promise.reject(new Error("no fullscreen"))},exitFullscreen:()=>typeof t.exitFullscreen=="function"?e.exitFullscreen():typeof t.webkitExitFullscreen=="function"?Promise.resolve(t.webkitExitFullscreen()):Promise.resolve()}}function an(){return es({matches:e=>typeof window.matchMedia=="function"&&window.matchMedia(e).matches,iosStandalone:()=>navigator.standalone===!0,fullscreenSupported:e=>typeof e.requestFullscreen=="function"&&typeof document.exitFullscreen=="function",fullscreenElement:()=>document.fullscreenElement,requestFullscreen:e=>typeof e.requestFullscreen=="function"?e.requestFullscreen():Promise.reject(new Error("no fullscreen")),exitFullscreen:()=>typeof document.exitFullscreen=="function"?document.exitFullscreen():Promise.resolve(),closeWindow:()=>window.close(),closed:()=>window.closed,timers:on},document)}function Xr(e,t){let n=()=>{e.doc.visibilityState!=="hidden"&&t.show()};e.doc.addEventListener("visibilitychange",()=>{e.doc.visibilityState==="hidden"?t.hide():n()}),e.doc.addEventListener("freeze",()=>t.hide()),e.doc.addEventListener("resume",n),e.win.addEventListener("pagehide",o=>{t.hide(),o?.persisted===!1&&t.close?.()}),e.win.addEventListener("pageshow",n),e.doc.visibilityState==="hidden"&&t.hide()}function io(e){let t=e.size??18;return y("svg",{viewBox:"0 0 24 24",width:t,height:t,fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false",class:e.class,children:[y("path",{d:"M12 15V3M7 8l5-5 5 5"}),y("path",{d:"M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"})]})}var Kr=!0,Wr="Tap Share, then Add to Home Screen",ts=2500,so="__installPrompt";function Yr(e){return new URLSearchParams(e).has("install")}function lo(e){let t=new URL(e);return t.search=t.search?`${t.search}&install`:"?install",t.href}function jr(e){try{return new URL(e).searchParams.get("v")||null}catch{return null}}function Jr(e,t){if(!t)return e;let n=new URL(e);return n.searchParams.set("v",t),n.href}var ns=e=>e?.name==="AbortError";function os(e,t,n){let o="idle",r=null,a=0;function i(c){r!==null&&(e.timers.clearTimeout(r),r=null),o=c,c==="copied"&&(r=e.timers.setTimeout(()=>{r=null,o="idle",n()},ts)),n()}return{state:()=>o,async press(){let c=++a;if(e.share)try{await e.share({title:t.title,url:t.shareUrl});return}catch(s){if(ns(s)||c!==a)return}if(e.copy)try{await e.copy(t.shareUrl),c===a&&i("copied");return}catch{}c===a&&i("field")},close(){a++,o!=="idle"&&i("idle")}}}function Qr(e,t,n){let o=e.framed(),r=os(e,t,()=>b()),a=e.platform(),i=a==="ios",c=a==="chromium"&&!t.promptsHere&&t.installPage!==null,s=e.installed(),h=null,l=!1,_=()=>!o&&!s&&(i||c||h!==null),k=()=>({off:o,install:_(),highlight:t.asked&&_(),steps:l,share:r.state()}),b=()=>n(k());return!o&&!s&&(e.onPrompt(w=>{h=w,b()}),e.onInstalled(()=>{t.onEvent?.("install"),s=!0,h=null,l=!1,b()}),t.asked&&i&&(t.installPage===null?l=!0:e.navigate(lo(t.installPage),!0))),{view:k,async pressInstall(){if(_()){if(i){t.installPage===null?(l=!0,b()):e.navigate(lo(t.installPage),!1);return}if(h){let w=h;h=null,b();try{await w.prompt()}catch{}return}t.installPage!==null&&e.navigate(lo(t.installPage),!1)}},closeSteps(){l&&(l=!1,b())},async pressShare(){o||(t.onEvent?.("share"),await r.press())},closeShare:r.close}}function rs(e,t,n,o=[]){return/iPhone|iPad|iPod/.test(e)||t==="MacIntel"&&n>1?"ios":o.some(r=>r.brand==="Chromium")?"chromium":"other"}function as(){return{share:typeof navigator.share=="function"?e=>navigator.share(e):null,copy:typeof navigator.clipboard?.writeText=="function"?e=>navigator.clipboard.writeText(e):null,timers:on}}function Zr(){let e=window;return{onPrompt:t=>{let n=e[so];e[so]=null,n&&t(n),window.addEventListener("beforeinstallprompt",o=>{o.preventDefault(),e[so]=null,t(o)})},onInstalled:t=>window.addEventListener("appinstalled",()=>t()),installed:()=>ao(an()),platform:()=>rs(navigator.userAgent,navigator.platform,navigator.maxTouchPoints,navigator.userAgentData?.brands),framed:()=>window.self!==window.top,...as(),navigate:(t,n)=>n?location.replace(t):location.assign(t)}}var is={viewBox:"0 0 24 24",width:18,height:18,"aria-hidden":"true",focusable:"false",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round",class:"kit-install-icon"};function ss(){return y("svg",{...is,children:[y("path",{d:"M12 3v12M7 10l5 5 5-5"}),y("path",{d:"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"})]})}function ls(e){let t=e.view,n=Ze(null);return Qe(()=>{t.share==="field"&&(n.current?.focus(),n.current?.select?.())},[t.share]),t.off?null:y("span",{class:"kit-install",children:[t.install&&y(Ce,{id:"install-btn",class:t.highlight?"kit-install-btn kit-install-asked":"kit-install-btn",title:"Install this game as an app",onClick:e.onInstall,children:[y(ss,{}),y("span",{class:"kit-install-txt",children:"Install"})]}),y(Ce,{id:"share-btn",class:"kit-install-btn",title:"Share a link to this game",onClick:e.onShare,children:[y(io,{class:"kit-install-icon"}),y("span",{class:"kit-install-txt",children:"Share"})]}),y("span",{id:"share-status",class:"kit-install-status",role:"status",children:t.share==="copied"?"Link copied":null}),t.share==="field"&&y("input",{id:"share-url",class:"kit-install-url",type:"text",readOnly:!0,value:e.shareUrl,"aria-label":"Link to this game",ref:n,onKeyDown:o=>{ut(o)&&(o.preventDefault(),o.repeat||e.onCloseShare())}}),y(mt,{open:t.steps,id:"install-steps",veilClass:"kit-install-veil",panelClass:"kit-install-panel",titleId:"install-steps-title",title:"Add to Home Screen",focusId:"install-steps-done",onDismiss:e.onCloseSteps,children:[y("p",{id:"install-steps-text",children:[y(io,{size:20,class:"kit-install-glyph"}),Wr,"."]}),y(Ce,{id:"install-steps-done",class:"kit-install-btn",onClick:e.onCloseSteps,children:"Done"})]})]})}var cs=`
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
`;function ds(){if(document.getElementById("kit-install-css"))return;let e=document.createElement("style");e.id="kit-install-css",e.textContent=cs,document.head.prepend(e)}function ea(e,t,n){ds();let o=a=>{},r=Qr(n,t,a=>o(a));return o=a=>Fe(y(ls,{view:a,shareUrl:t.shareUrl,onInstall:()=>{r.pressInstall()},onShare:()=>{r.pressShare()},onCloseSteps:r.closeSteps,onCloseShare:r.closeShare}),e),o(r.view()),r}var ra={},na=e=>new URL(e,ra.url).href,ta=!0;function us(){let e=document.getElementById("cylon-install-root");if(!e||new URLSearchParams(location.search).get("game")!=="cylon")return;document.querySelector('link[rel="manifest"]')?.setAttribute("href","games/cylon/manifest.webmanifest");let t=location.pathname.endsWith("/index.html");ea(e,{title:"The CIC",shareUrl:Jr(new URL("play/cylon/",location.href).href,jr(ra.url)),installPage:t||!ta?null:new URL("index.html?game=cylon",location.href).href,promptsHere:ta&&(t||Kr),asked:Yr(location.search)},Zr())}async function ps(e){let t=document.getElementById("game-root");if(!t)return!1;if(t.dataset.mounted==="1"&&document.getElementById("cylon-eye"))return!0;try{if(e!==void 0)t.innerHTML=e;else{let n=await fetch(na("../mount.html?v=769e886323"),{cache:"no-store"});if(!n.ok)throw new Error(`mount ${n.status}`);t.innerHTML=await n.text()}return t.dataset.mounted="1",t.dataset.game="cylon",!0}catch(n){return console.error("Cylon mount failed",n),!1}}async function oa(e={}){let t=typeof e.onTheme=="function"?e.onTheme:()=>{};await ps(e.mountHtml);let n=document.getElementById("cylon-eye"),o=document.getElementById("cylon-glare"),r=document.getElementById("cylon-battlefield"),a=document.getElementById("cylon-ambush-under"),i=document.getElementById("cylon-nuke"),c=document.getElementById("cylon-nuke-missile"),s=document.getElementById("cylon-small-missile"),h=document.getElementById("cylon-score-value"),l=document.getElementById("cylon-hits-value"),_=document.getElementById("cylon-settings"),k=document.getElementById("cylon-raptor"),b=document.getElementById("cylon-raptor-impacts"),w=document.getElementById("cylon-raptor-btn"),m=document.getElementById("cylon-raptor-cd"),T=document.getElementById("cylon-grenade-btn"),x=document.getElementById("cylon-grenade-cd"),B=document.getElementById("cylon-game-toggle"),f=document.getElementById("cylon-game-toggle-label"),d=document.getElementById("cic-enter-btn"),u=document.getElementById("cylon-settings-panel"),g=document.getElementById("cylon-gameover-root"),E=document.getElementById("cylon-exit-hint"),v=null,A=document.getElementById("cylon-reticle"),R=document.getElementById("site-nav-burger"),H=document.getElementById("site-nav-menu"),F=document.getElementById("site-nav-power"),I=document.getElementById("site-nav-game"),V=document.getElementById("site-brand"),G=document.getElementById("cylon-intro-title"),ne="William Grim",q="The CIC",O=880,Q=document.getElementById("cylon-help-btn"),K=document.getElementById("cylon-help-root"),Ee=!1;if(!n||!r)return;let ce=window.matchMedia("(prefers-reduced-motion: reduce)").matches,Le=window.matchMedia("(pointer: coarse)").matches,et=Le?10:30;if(ce)return;let xe=e.localScores?sr(rn()):ir(e.scoresApi||na("../scores.php"),{fetch:(C,P)=>fetch(C,P)}),M={run:jn(),schedule:Wn(),paused:!1,pauseStartedAt:0,nukeInFlight:!1,reticlePointerId:null,draggingReticle:!1,idleTimer:null},Te={clientX:window.innerWidth/2,clientY:window.innerHeight/3,pageX:window.innerWidth/2,pageY:window.innerHeight/3,t:0},de=null,Ae=null,Ve={clientX:0,clientY:0,t:0},we=null,Z=null,ft=null,Pe=2e3,Re={w:44,h:56},$e=28,At=52,tt=44,{MAX_HITS:ln}=zt,ht=1e4,Mt=64,Ct=520,nt=28,Ie=2800,cn=640,dn=22,un=2200,pn=72,yt=.22,mn=.32,Lt=.62,Pt=.5,ot=.72,gt=3e4,Ue=He.medium.radius,Rt=Math.round(2850*.45),{renderHighScores:bt,fetchHighScores:It,hideGameOver:rt,showGameOver:fn,resetText:hn}=Br({game:M,state:Tt,scores:xe,weeklyResetText:ar,currentHp:go,setGameEnabled:kn,resetRunStats:xo,root:g,boardChanged:()=>yn(),closed:()=>{wo()}}),{settings:le,saveSettings:Oe,syncGameToggleUi:Xe,syncNavChrome:Dt,renderSettings:yn,bindSettings:gn,bindGameToggle:vt,bindNavMenu:Bt}=Gr({settingsRoot:_,gameToggleBtn:B,gameToggleLabel:f,cicEnterBtn:d,navBurger:R,navMenu:H,navGame:I,siteBrand:V,BRAND_CIVIL:ne,BRAND_COMBAT:q,NAV_FADE_MS:Rt,reduceMotion:ce,settingsPanel:u,boardRows:()=>Xt(xe.board()),resetText:hn,fetchHighScores:It,setGameEnabled:kn,setEyeTracking:C=>j(C),settingChanged:C=>oe.settingChanged(C)});function at(){return window.scrollX||window.pageXOffset||0}function it(){return window.scrollY||window.pageYOffset||0}function xt(){r&&(r.style.width="",r.style.height="")}function st(){return le.gameEnabled&&!M.paused}let oe=$o({settings:()=>le,sessionActive:st,volumeToGain:Cn}),De=Zo({titleEl:G,nukeEl:c,brandEl:V,body:document.body,title:q,reduceMotion:ce,navFadeMs:Rt,settleMs:O,speed:Ct*.85,arriveRadius:nt,maxFlightMs:Ie,random:Math.random,enabled:()=>le.gameEnabled,paused:()=>M.paused,startRun:()=>xe.startRun(),launched:()=>{oe.prime(),oe.sfx("introLaunch")},setNukeInFlight:C=>{M.nukeInFlight=C},detonate:(C,P)=>ua(C,P,{dealDamage:!1,shake:!1}),beginCombat:Pa});function ue(){return st()&&!M.run.gameOver&&!De.playing()}let lt=Jo({field:r,isLive:ue,paused:()=>M.paused,viewport:()=>({width:window.innerWidth,height:window.innerHeight}),create:C=>document.createElement(C),now:()=>Date.now(),setTimer:(C,P)=>setTimeout(C,P),clearTimer:C=>clearTimeout(C)}),Ke=Qo({doc:document,viewport:()=>({width:window.innerWidth,height:window.innerHeight}),random:Math.random,reduceMotion:ce,setTimer:(C,P)=>setTimeout(C,P),clearTimer:C=>clearTimeout(C)}),Ne=lt.punch,pe=Ko({now:()=>Date.now(),setTimer:(C,P)=>setTimeout(C,P),clearTimer:C=>clearTimeout(C),isLive:ue,readyAt:C=>C==="grenade"?M.schedule.grenadeReadyAt:M.schedule.raptorReadyAt,setReadyAt:(C,P)=>{C==="grenade"?M.schedule.grenadeReadyAt=P:M.schedule.raptorReadyAt=P},sfx:C=>{oe.prime(),oe.sfx(C)},changed:We,grenadeBlast:Ma,raptorAvailable:()=>!!k,raptorLaunch:()=>{z(gt),k?.classList.add("is-inbound")},raptorStrike:La,raptorClear:Aa}),{rearrangeLandscape:p,rearrangeLandscapePage:S,disruptGlyphs:L,clearLandscapeVars:D,randRange:$}=er({reduceMotion:ce,scrollX:at,scrollY:it}),{isEyeDisoriented:U,setEyeTracking:j,disorientEye:z,clearEyeDisorient:ie,eyeClientCenter:J,updateEye:X}=tr({eye:n,glare:o,game:M,settings:le,mouse:Te,state:Tt,isGameLive:ue,EYE_DISORIENT_MS:gt}),{syncMousePageFromClient:ee,paintReticle:se,syncReticleVisibility:te,resetReticleToCenter:he,onPointerMove:re,bindReticle:me}=nr({reticleEl:A,mouse:Te,lastAim:Ve,game:M,settings:le,coarsePointer:Le,IDLE_MS:Pe,isGameLive:ue,isEyeDisoriented:U,setEyeTracking:j,audio:oe,abilities:pe,scrollX:at,scrollY:it}),{allBots:be,knockOutBot:ke,clearAllBots:ye,wipeAllBotsWithScore:Se,herdBotsIntoView:Me,scheduleAmbush:ct,bindPlayerMissShots:ca,canLaunchMissile:Ht,launchSmallMissile:co,clearActiveMissiles:da,launchNuke:uo,detonateNukeAt:ua}=or({game:M,settings:le,mouse:Te,lastAim:Ve,state:Tt,rules:zt,playfield:Pn,field:r,ambushUnder:a,missileEl:s,nukeEl:i,nukeMissileEl:c,scoreEl:h,audio:oe,intro:De,abilities:pe,holes:lt,debris:Ke,punchHole:Ne,HOLE_PRESETS:He,isGameLive:ue,isEyeDisoriented:U,eyeClientCenter:J,syncMousePageFromClient:ee,rearrangeLandscape:p,rearrangeLandscapePage:S,disruptGlyphs:L,randRange:$,registerHit:Sa,resizeBattlefield:xt,scrollX:at,scrollY:it,BOT_HARD_CAP:et,BOT_SIZE:Re,LINK_PAD:$e,HIT_RADIUS:At,BOLT_HIT_RADIUS:tt,NUKE_DIRECT_HIT_RADIUS:Mt,NUKE_SPEED:Ct,NUKE_ARRIVE_RADIUS:nt,NUKE_MAX_FLIGHT_MS:Ie,MISSILE_SPEED:cn,MISSILE_ARRIVE:dn,MISSILE_MAX_FLIGHT_MS:un,MISSILE_BLAST_RADIUS:pn,SMALL_WEAPON_SCALE:yt,MISSILE_WEAPON_SCALE:mn});function po(){Ke.scatter(),document.body.classList.add("cylon-world-ended"),document.body.classList.remove("cylon-glyphs-blown"),document.body.classList.add("cylon-glyphs-blowing"),requestAnimationFrame(()=>{requestAnimationFrame(()=>{le.gameEnabled&&document.body.classList.add("cylon-glyphs-blown"),setTimeout(()=>{document.body.classList.remove("cylon-glyphs-blowing")},3e3)})})}function bn(C={}){let P=le.gameEnabled,N=!!C.deferScatter;document.body.classList.toggle("cylon-game-live",P),t(P),Dt(),P?N||po():(document.body.classList.remove("cylon-glyphs-blown"),document.body.classList.remove("cylon-glyphs-blowing"),document.body.classList.remove("cylon-world-ended"),Ke.cancelReshuffleSettle(),D(),setTimeout(()=>{le.gameEnabled||Ke.restore()},2900))}function ws(C,P,N){return je(C,P,N)}function pa(){return Sn(M.run.koScore,M.run.runStartedAt,Date.now())}function ma(){return En(M.run.koScore,Math.random)}function fa(){return Tn(pa(),Math.random)}function Ft(){clearTimeout(we??void 0),clearTimeout(Z??void 0),we=null,Z=null,M.schedule.missileDueAt=0,M.schedule.nukeDueAt=0,da()}function vn(C=!1){if(clearTimeout(we??void 0),!ue())return;let P=C?4e3+Math.random()*3e3:ma();M.schedule.missileDueAt=Date.now()+P,we=setTimeout(()=>{we=null,!(!ue()||M.paused)&&(!U()&&(Ht(!1)||Ht(!0))&&co(),vn(!1))},P)}function xn(C=!1){if(clearTimeout(Z??void 0),!ue())return;let P=C?12e3+Math.random()*8e3:fa();M.schedule.nukeDueAt=Date.now()+P,Z=setTimeout(()=>{Z=null,!(!ue()||M.paused)&&(!U()&&!M.nukeInFlight&&uo(),xn(!1))},P)}function ha(){Ft(),vn(!0),xn(!0)}function ya(C){if(C<=0)return;let P=M.schedule;M.schedule=Yn(P,M.pauseStartedAt,C),M.schedule.missileDueAt!==P.missileDueAt&&(clearTimeout(we??void 0),we=setTimeout(()=>{we=null,!(!ue()||M.paused)&&(!U()&&(Ht(!1)||Ht(!0))&&co(),vn(!1))},Et(M.schedule.missileDueAt,Date.now()))),M.schedule.nukeDueAt!==P.nukeDueAt&&(clearTimeout(Z??void 0),Z=setTimeout(()=>{Z=null,!(!ue()||M.paused)&&(!U()&&!M.nukeInFlight&&uo(),xn(!1))},Et(M.schedule.nukeDueAt,Date.now()))),M.schedule.healDueAt!==P.healDueAt&&(clearTimeout(de??void 0),de=setTimeout(()=>{de=null,mo()},Et(M.schedule.healDueAt,Date.now()))),lt.resume(M.pauseStartedAt,C)}function wt(){clearTimeout(de??void 0),de=null,M.schedule.healDueAt=0}function mo(){de=null,M.schedule.healDueAt=0,!(!ue()||M.run.hitCount<=0)&&(M.run=to(M.run),qt(),oe.prime(),oe.sfx("heal"),l&&(l.classList.add("is-heal"),setTimeout(()=>l.classList.remove("is-heal"),320)),fo())}function fo(){wt(),!(!le.gameEnabled||M.run.gameOver||M.paused||M.run.hitCount<=0)&&(M.schedule.healDueAt=Date.now()+ht,de=setTimeout(()=>{de=null,mo()},ht))}function ga(){ee(),clearTimeout(ft??void 0),ft=setTimeout(Me,180)}function ba(){let C=P=>!!(P instanceof Element&&P.closest(".cylon-help-panel, .cylon-gameover, .cylon-settings-panel"));document.addEventListener("wheel",P=>{document.body.classList.contains("cylon-game-live")&&(C(P.target)||P.preventDefault())},{passive:!1}),document.addEventListener("touchmove",P=>{if(!document.body.classList.contains("cylon-game-live"))return;let N=P.target;N&&N.closest&&N.closest(".site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel")||P.preventDefault()},{passive:!1})}function Ot(){K&&Vr(K,{open:Ee,touch:Le,onClose:wa})}function ho(){M.paused||(M.paused=!0,M.pauseStartedAt=Date.now(),clearTimeout(M.idleTimer??void 0),lt.pause(),clearTimeout(we??void 0),clearTimeout(Z??void 0),clearTimeout(de??void 0),we=null,Z=null,de=null,j(!1),oe.syncMusic(),We())}function yo(){if(!M.paused)return;let C=Date.now()-M.pauseStartedAt;ya(C),M.paused=!1,M.pauseStartedAt=0,oe.syncMusic(),We(),te()}let Nt=!1;function va(){Xr({doc:document,win:window},{hide(){le.gameEnabled&&!M.paused&&(ho(),Nt=!0),oe.pageHide()},show(){oe.pageShow(),Nt&&!Ee&&yo(),Nt=!1},close:oe.pageClose})}function xa(){K&&(ho(),Nt=!1,Q?.focus(),Ee=!0,Ot())}function wa(){Ee&&(Ee=!1,Ot(),yo())}function ka(){Ot(),Q&&Q.addEventListener("click",C=>{C.preventDefault(),C.stopPropagation(),xa()})}function go(){return An(M.run.hitCount)}function _a(C){return Mn(C)}function qt(){if(!l)return;let C=go();l.textContent=String(C),l.classList.remove("is-hp-good","is-hp-mid","is-hp-low");let P=_a(C);l.style.color=P.color,l.style.textShadow=`0 0 8px ${P.glow}`}function Sa(C=1,{fromNuke:P=!1}={}){if(M.run.gameOver||!ue())return;let N=eo(M.run,C,ln,P);M.run=N.run,qt(),oe.sfx("hit"),fo(),N.ends&&(wt(),vo(N.ends))}function bo(C,P,N,W=!0){if(!C)return;let fe=Xo(N,Date.now()),ge=fe>0,Be=!ge&&W&&ue();C.disabled=!Be,C.classList.toggle("is-cooling",ge),P&&(ge?(P.hidden=!1,P.textContent=String(fe),P.setAttribute("aria-label",`${fe} seconds remaining`)):(P.hidden=!0,P.textContent="",P.removeAttribute("aria-label")))}function Ea(){bo(w,m,M.schedule.raptorReadyAt,!pe.raptorInbound())}function Ta(){if(bo(T,x,pe.grenadeArmed()?0:M.schedule.grenadeReadyAt,!0),!T)return;T.classList.toggle("is-armed",pe.grenadeArmed());let C=T.querySelector(".cylon-raptor-btn-label");C&&(C.textContent=pe.grenadeArmed()?"Armed":"Grenade"),document.body.classList.toggle("cylon-grenade-armed",pe.grenadeArmed())}function We(){Ea(),Ta()}function Aa(){k&&k.classList.remove("is-inbound"),b&&(b.innerHTML="")}function wn(){pe.reset(),document.body.classList.remove("cylon-grenade-armed"),ie(),We()}function Ma(C,P){let N=C,W=P,fe=document.createElement("div");fe.className="cylon-grenade-blast",fe.style.left=`${N}px`,fe.style.top=`${W}px`,fe.setAttribute("aria-hidden","true"),r?.appendChild(fe),Ne(N,W,He.medium);for(let ge=0;ge<2;ge++){let Be=Math.random()*Math.PI*2,Ye=$(Ue*.35,Ue*.85);Ne(N+Math.cos(Be)*Ye,W+Math.sin(Be)*Ye,{radius:$(36,64),holdMs:He.small.holdMs,fadeMs:He.small.fadeMs})}S(N,W,Lt,{radius:Ue*1.2}),setTimeout(()=>fe.remove(),480),be().forEach(ge=>{if(ge.dataset.ko==="1")return;let Be=(parseFloat(ge.style.left)||0)+Re.w/2,Ye=(parseFloat(ge.style.top)||0)+Re.h/2;Math.hypot(Be-N,Ye-W)<=Ue&&ke(ge)})}function Ca(){if(!b)return;b.innerHTML="";let C=10,P=110;for(let N=0;N<C;N++)setTimeout(()=>{if(!ue())return;let W=document.createElement("span");W.className="cylon-raptor-impact";let fe=12+Math.random()*76,ge=40+Math.random()*50;W.style.left=`${fe}%`,W.style.top=`${ge}%`,b.appendChild(W);let Be=window.scrollX+fe/100*window.innerWidth,Ye=window.scrollY+ge/100*window.innerHeight;Ne(Be,Ye,He.medium),S(Be,Ye,Pt,{radius:P}),setTimeout(()=>W.remove(),560)},N*55)}function La(){let C=window.innerWidth||1,N=(window.innerHeight||1)*.62,W=Math.min(220,C*.28);for(let fe=0;fe<5;fe++){let ge=C*(.18+fe*.16);p(ge,N,ot,{radius:W})}Ca(),Se()}function Pa(){if(!le.gameEnabled||M.run.gameOver)return;po();let C=(window.innerWidth||1)/2,P=(window.innerHeight||1)*.48,N=C+at(),W=P+it();requestAnimationFrame(()=>{L(N,W,1.35),setTimeout(()=>L(N,W,1.1),280)}),M.run=Qn(M.run,Date.now()),ha(),Le?(he(),document.body.classList.add("cylon-touch-play")):se(),te(),We()}function vo(C){if(M.run.gameOver)return;M.run=no(M.run,C);let P=C==="hits"||C==="nuke";ye(),Ft(),wt(),clearTimeout(M.idleTimer??void 0),j(!1),De.cancel(),M.draggingReticle=!1,M.reticlePointerId=null,wn(),P||(le.gameEnabled=!1,Oe(),document.body.classList.remove("cylon-touch-play")),Xe(),te(),oe.syncMusic(),P||bn(),fn(C)}function xo(){M.run=Jn(M.run),wt(),h&&(h.textContent="0"),qt()}function kn(C){let P=le.gameEnabled;if(!C&&P&&!M.run.gameOver&&M.run.koScore>0){vo("quit");return}le.gameEnabled=C,Oe(),C?(P||Gt("game_start"),De.cancel(),ye(),Ft(),rt(),xo(),wn(),Xe(),te(),oe.syncMusic(),bn({deferScatter:!0}),De.play()):(De.cancel(),ye(),Ft(),wt(),M.run=Zn(M.run),clearTimeout(M.idleTimer??void 0),j(!1),M.draggingReticle=!1,M.reticlePointerId=null,M.paused=!1,M.pauseStartedAt=0,document.body.classList.remove("cylon-touch-play"),rt(),M.run=oo(ro(M.run)),Ee&&(Ee=!1,Ot()),wn(),Xe(),te(),oe.syncMusic(),bn(),wo())}async function wo(){await Ur(an())!=="title-with-hint"||!E||(E.textContent=$r,E.hidden=!1,clearTimeout(v??void 0),v=setTimeout(()=>{E.hidden=!0},6e3))}function Ra(){let C=(P,N)=>{P&&(P.addEventListener("pointerup",W=>{M.reticlePointerId!=null&&W.pointerId===M.reticlePointerId||W.pointerType==="mouse"&&W.button!=null&&W.button!==0||(W.preventDefault(),W.stopPropagation(),N())}),P.addEventListener("click",W=>{W.detail===0?(W.preventDefault(),N()):W.preventDefault()}))};C(w,()=>{pe.callRaptor()}),C(T,()=>{pe.readyGrenade()}),window.addEventListener("keydown",P=>{if(Ut(P.target))return;let N=Uo(P);N==="disarm"?pe.cancelGrenadeArm():N==="raptor"?(P.preventDefault(),pe.callRaptor()):N==="grenade"&&(P.preventDefault(),pe.readyGrenade())}),window.addEventListener("pointerdown",P=>{if(!pe.grenadeArmed()||P.button!=null&&P.button!==0)return;let N=P.target;N&&(N.closest("#cylon-grenade-btn")||N.closest("#cylon-raptor-btn")||N.closest("#cylon-game-toggle")||N.closest("#cylon-settings")||N.closest("#theme-toggle")||N.closest("#site-nav-burger")||N.closest("#site-nav-menu a")||N.closest("#cylon-help-btn")||N.closest("#cylon-help")||N.closest(".site-brand")||N.closest("#cylon-gameover"))||(P.preventDefault(),pe.throwGrenadeAt(P.pageX,P.pageY))},!0),clearInterval(Ae??void 0),Ae=setInterval(We,250),We()}window.cylonStartGame=()=>{le.gameEnabled||M.run.gameOver||(kn(!0),window.scrollTo({top:0,behavior:ce?"auto":"smooth"}))},gn(),vt(),Ra(),ca(),me(),ba(),Bt(),ka(),va(),us(),xt(),qt(),Dt(),te(),bt(),It(),window.addEventListener("resize",xt),window.addEventListener("pointermove",re,{passive:!0}),window.addEventListener("scroll",ga,{passive:!0}),window.addEventListener("pointerdown",oe.unlock,{passive:!0}),window.addEventListener("keydown",oe.unlock,{passive:!0}),document.addEventListener("selectstart",C=>{document.body.classList.contains("cylon-game-live")&&C.preventDefault()}),document.addEventListener("dragstart",C=>{document.body.classList.contains("cylon-game-live")&&C.preventDefault()}),requestAnimationFrame(X),ct(!0)}var ms=[_o,So,Eo,To,Ao,Mo,Co,Lo,Po,Ro,Io,Do,Bo],fs="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&display=swap",hs="cic-embed",aa="cic-embed-launch",ia="cic-embed-bar",ys=new Set(["SCRIPT","STYLE","LINK","META","NOSCRIPT","TEMPLATE","IFRAME"]),gs="img, picture, figure, video, svg, blockquote, pre, table, form, button, input, h4, h5, h6, .wp-block-image, .wp-block-button",sn=(e,t)=>{console.error(`The CIC: ${e}`,t??"")},bs=`
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
</div>`;function vs(e){for(let t of Array.from(document.body.children))ys.has(t.tagName)||e.has(t)||(t.classList.add("page-panel","cic-embed-host"),getComputedStyle(t).position==="static"&&t.classList.add("cic-embed-host-static"),t.querySelectorAll(gs).forEach(n=>n.classList.add("cylon-debris")))}var sa=!1;async function xs(e){if(sa)return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){e.textContent="The CIC Rests (Reduced Motion)",e.disabled=!0;return}if(document.getElementById("game-root")||document.getElementById(ia)){sn("this page already has a #game-root; not launching");return}sa=!0,e.remove();let t=document.createElement("link");t.rel="stylesheet",t.href=fs,document.head.appendChild(t);let n=document.createElement("style");n.id="cic-embed-style",n.textContent=ms.join(`
`),document.head.appendChild(n);let o=document.createElement("div");o.id="game-root",o.dataset.game="cylon";let r=document.createElement("header");r.id=ia,r.className="site-nav",r.innerHTML=bs,vs(new Set([o,r])),document.body.prepend(o),document.body.appendChild(r),document.documentElement.classList.add("cic-embed-on"),document.body.classList.add("cic-embed-on"),r.querySelector("#cic-embed-leave")?.addEventListener("click",()=>{location.reload()}),await oa({mountHtml:ko,localScores:!0}),window.cylonStartGame?.()}function la(){if(document.getElementById(aa))return;let e=document.createElement("button");e.type="button",e.id=aa,e.textContent="Play The CIC",e.title="Play The CIC on this page",e.setAttribute("style",["font: 700 14px/1.2 system-ui, sans-serif","letter-spacing: .06em","color: #fff","background: #8a0a0a","border: 1px solid #ff5555","border-radius: 6px","padding: 10px 16px","cursor: pointer","box-shadow: 0 4px 14px rgba(0,0,0,.35)"].join(";")),e.addEventListener("click",()=>{xs(e).catch(n=>sn("the game failed to start",n))});let t=document.getElementById(hs);t?t.appendChild(e):(e.style.cssText+=";position:fixed;right:16px;bottom:16px;z-index:2147483000",document.body.appendChild(e))}try{document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{try{la()}catch(e){sn("the launcher failed",e)}}):la()}catch(e){sn("the launcher failed",e)}})();
//# sourceMappingURL=embed.js.map
