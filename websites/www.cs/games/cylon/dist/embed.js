/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */
"use strict";(()=>{var ci=Object.defineProperty;var Nn=(e,t)=>{for(var n in t)ci(e,n,{get:t[n],enumerable:!0})};var Go=`<!-- Cylon Defense — FX / overlays injected into #game-root -->
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
`;var Vo=`/* The games kit's opt-in stylesheet. Every selector carries a .kit- class and
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


`;var $o=`/* Cylon Defense: The combat nav: control box, the fade between civil and combat chrome, the mobile layout.
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
`;var Uo=`/* Cylon Defense: The How to Play overlay.
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
`;var Xo=`/* Cylon Defense: The touch-play layout, the reticle, and the KO and hull readouts.
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


`;var Ko=`/* Cylon Defense: The game-over panel: the initials entry, the buttons and the board.
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
`;var Wo=`/* Cylon Defense: The settings gear and its panel.
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


`;var Yo=`/* Cylon Defense: The Game On toggle, the grenade and raptor buttons, and the high-score list.
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


`;var jo=`/* Cylon Defense: The grenade blast, the scorched holes, and the page rules that hold while a run is live.
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


`;var Jo=`/* Cylon Defense: The battlefield: drones and their bolts, the raptor, the missiles and the nuke.
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


`;var Qo=`/* Cylon Defense: The world-ended look: fracture and ash, the scattered glyphs and panels.
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


`;var Zo=`/* Cylon Defense: The intro title card: "The CIC" and its glide into the brand.
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

`;var er=`/* Cylon Defense: the embed's own rules (src/embed.ts): the home page's dark tokens, the combat bar and the host page's panels.
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
`;var Si="__siteStats",Ei="__siteStatsQ";function Ti(e,t,n){try{let o=globalThis,r=o[Si];if(r){r.event(e,t,n);return}let a=o[Ei]??=[];a.length<50&&a.push([e,t,n])}catch{}}function tr(e){return(t,n)=>Ti(e,t,n)}var dn=tr("cylon");var un={};Nn(un,{BOT_CAP_PER_KOS:()=>Ci,BOT_CAP_START:()=>Mi,MAX_HITS:()=>Ai,MISSILE_GROUND_CAP_MAX:()=>Pi,MISSILE_TRACKER_CAP_MAX:()=>Ri,MISSILE_TRACKER_CHANCE_BASE:()=>Li,botCap:()=>Fi,currentHp:()=>zn,difficultyFactor:()=>qn,groundMissileCap:()=>Ii,hpTint:()=>$n,killLevel:()=>Ft,lerp:()=>St,nextMissileDelayMs:()=>Gn,nextNukeDelayMs:()=>Vn,planWave:()=>Hi,trackerMissileCap:()=>Di,trackerMissileChance:()=>Bi,volumeToGain:()=>Un});var Ai=30,Mi=4,Ci=5,Li=.14,Ri=3,Pi=5;function St(e,t,n){return e+(t-e)*Math.min(1,Math.max(0,n))}function Ft(e){return Math.floor(e/5)}function qn(e,t,n){if(!t)return 0;let o=(n-t)/6e4,r=Math.min(1,o/3.5),a=Math.min(1,Ft(e)/10);return Math.min(1,a*.75+r*.25)}function Gn(e,t){let n=Math.min(1,Ft(e)/10),o=St(8500,3400,n),r=St(2800,1600,n);return Math.max(2400,o-r/2+t()*r)}function Vn(e,t){let n=St(32500,24e3,e),o=St(15e3,12e3,e);return n-o/2+t()*o}function Ii(e){return Math.min(5,1+Math.floor(Ft(e)/2))}function Di(e){let t=Ft(e);return t<3?1:t<7?2:Math.min(3,3)}function Bi(e){return Math.min(.34,.14+Ft(e)*.02)}function Fi(e,t){return Math.min(t,4+Math.floor(e/5))}function Hi(e,t,n){let o=n()<.55,r=Math.min(e,Math.max(2,Math.min(4,Math.floor(t/3)))),a=o?Math.min(e,2+Math.floor(n()*Math.max(1,r-1))):1;return{isWave:o,count:a}}function zn(e){return Math.max(0,30-e)}function $n(e){let t=(l,d,s)=>Math.round(l+(d-l)*s),n=(l,d,s)=>({r:t(l.r,d.r,s),g:t(l.g,d.g,s),b:t(l.b,d.b,s)}),o={r:125,g:255,b:154},r={r:255,g:210,b:74},a={r:255,g:72,b:72},i=Math.max(0,Math.min(1,e/30)),c=i>=.5?n(r,o,(i-.5)/.5):n(a,r,i/.5);return{color:`rgb(${c.r}, ${c.g}, ${c.b})`,glow:`rgba(${c.r}, ${c.g}, ${c.b}, 0.55)`}}function Un(e,t="sfx"){let n=Math.max(0,Math.min(100,Number(e)||0))/100;if(t==="music")return Math.min(2.5,n/.5*1.25);let r=(n<=.5?n/.5*85:85+(n-.5)/.5*15)/100;return r*r}var Kn={};Nn(Kn,{botPageRect:()=>or,candidateSpots:()=>ar,clampToBounds:()=>pn,findSafeSpot:()=>qi,inflate:()=>Oi,isInBounds:()=>rr,isSafeSpot:()=>Xt,marchOrigin:()=>Gi,randomVisibleSpot:()=>Xn,rectsOverlap:()=>nr,visibleBounds:()=>Ni});function nr(e,t){return!(e.right<t.left||e.left>t.right||e.bottom<t.top||e.top>t.bottom)}function Oi(e,t){return{left:e.left-t,top:e.top-t,right:e.right+t,bottom:e.bottom+t}}function or(e,t,n){return{left:e,top:t,right:e+n.w,bottom:t+n.h}}function Ni(e,t){let n=Math.max(72,e.navBottom+10),o=10,r=e.scrollX+o,a=e.scrollY+n,i=e.scrollX+e.width-t.w-o,c=e.scrollY+e.height-t.h-o-6;return{left:r,top:a,right:Math.max(r,i),bottom:Math.max(a,c)}}function pn(e,t,n){return{x:Math.min(Math.max(e.left,t),e.right),y:Math.min(Math.max(e.top,n),e.bottom)}}function rr(e,t,n){return t>=e.left-2&&t<=e.right+2&&n>=e.top-2&&n<=e.bottom+2}function Xt(e,t,n,o,r){let a=or(e,t,r);return e<4||t<70||e+r.w>o.w-4||t+r.h>o.h-4?!1:!n.some(i=>nr(a,i))}function Xn(e,t){let n=e.bounds,o=Math.max(1,n.right-n.left),r=Math.max(1,n.bottom-n.top);for(let i=0;i<36;i++){let c=n.left+t()*o,l=n.top+t()*r;if(Xt(c,l,e.forbidden,e.doc,e.bot))return{x:c,y:l,edge:"return"}}let a=pn(n,(n.left+n.right)/2,(n.top+n.bottom)/2);return Xt(a.x,a.y,e.forbidden,e.doc,e.bot)?{...a,edge:"return"}:null}function ar(e,t){let n=[],o=["left","right","bottom"],r=Math.max(40,e.bottom-e.top),a=Math.max(40,e.right-e.left);o.forEach(i=>{for(let c=0;c<10;c++){let l,d;i==="left"?(l=e.left,d=e.top+t()*r):i==="right"?(l=e.right,d=e.top+t()*r):(l=e.left+t()*a,d=e.bottom-t()*Math.min(36,r*.25));let s=pn(e,l,d);n.push({...s,edge:i})}});for(let i=n.length-1;i>0;i--){let c=Math.floor(t()*(i+1)),l=n[i];n[i]=n[c],n[c]=l}return n}function qi(e,t,n){if(t)if(rr(e.bounds,t.x,t.y))for(let o=0;o<28;o++){let r=t.x+(n()-.5)*200,a=t.y+(n()-.5)*140,i=pn(e.bounds,r,a);if(Xt(i.x,i.y,e.forbidden,e.doc,e.bot))return{x:i.x,y:i.y,edge:"patrol"}}else{let o=Xn(e,n);if(o)return o}for(let o of ar(e.bounds,n))if(Xt(o.x,o.y,e.forbidden,e.doc,e.bot))return o;return Xn(e,n)}function Gi(e,t,n){return t.edge==="left"?{x:e.left-n.w+6,y:t.y}:t.edge==="right"?{x:e.right+n.w-6,y:t.y}:{x:t.x,y:e.bottom+n.h-6}}function Vi(e){try{return e.top!==e}catch{return!0}}function ir(e,t){if(!Vi(e.win))return!1;let n=!1,o=0,r=()=>{n||(n=!0,t.away())},a=()=>{n&&(n=!1,t.back())},i=()=>{o&&e.timers.clearTimeout(o),o=0},c=()=>e.doc.visibilityState!=="hidden",l=()=>{try{return e.doc.hasFocus()||(e.doc.fullscreenElement??null)!==null}catch{return!0}},d=()=>{i(),c()&&l()?a():r()};e.win.addEventListener("blur",()=>{i(),o=e.timers.setTimeout(d,50)}),e.win.addEventListener("focus",d);let s=()=>{i(),c()&&a()};return e.win.addEventListener("pointerdown",s,!0),e.win.addEventListener("keydown",s,!0),e.doc.addEventListener("visibilitychange",d),d(),!0}var Kt=1e-4,Ht=["sfx","music"];function zi(){let e=globalThis,t=e.AudioContext||e.webkitAudioContext;return t?new t:null}function lr(e={}){let t=e.createContext??zi,n=e.timers??{setTimeout:(p,E)=>globalThis.setTimeout(p,E),clearTimeout:p=>globalThis.clearTimeout(p)},o=null,r=!1,a=!1,i=!1,c=!1,l=0,d=[],s=null,k={sfx:1,music:1},T={sfx:!1,music:!1},h={};function x(p){let E=h[p];if(!E||!o||i)return;let O=T[p]?0:k[p];try{E.gain.cancelScheduledValues(o.currentTime),E.gain.setValueAtTime(O,o.currentTime)}catch{E.gain.value=O}}function u(p){try{return Promise.resolve(p())}catch(E){return Promise.reject(E)}}function C(){if(!o){let E=null;try{if(E=t(),!E)return null;let O={};for(let N of Ht){let P=E.createGain();P.connect(E.destination),O[N]=P}o=E,Object.assign(h,O);for(let N of Ht)x(N);if(i){for(let P of Ht)O[P].gain.value=0;let N=E;u(()=>N.suspend()).catch(()=>{})}}catch{o=null;let O=E;return O&&u(()=>O.close()).catch(()=>{}),null}}let p=o;return p.state==="suspended"&&!a&&!i&&u(()=>p.resume()).catch(()=>{}),p}function b(p){let E=o;if(E)for(let O of Ht){let N=h[O];if(N)try{let P=E.currentTime;N.gain.cancelScheduledValues(P),N.gain.setValueAtTime(N.gain.value,P),N.gain.linearRampToValueAtTime(0,P+p)}catch{N.gain.value=0}}}function _(p){if(p===i)return;i=p,l&&n.clearTimeout(l),l=0;let E=o;if(p){if(c=!!E&&E.state==="running",!E)return;b(.15),l=n.setTimeout(()=>{l=0,i&&o===E&&u(()=>E.suspend()).catch(()=>{})},.15*1e3);return}for(let O of Ht)x(O);E&&c&&!a&&u(()=>E.resume()).catch(()=>{}),c=!1}function S(p){let E=p===void 0?"sfx":typeof p=="string"?p:null;if(i||E&&T[E])return null;let O=C();if(!O)return null;let N=E?h[E]:p;return N?{c:O,node:N}:null}function g(p,E){let O=S(E);if(!O)return;let{c:N,node:P}=O;try{let F=p.at??N.currentTime+(p.when??0),X=p.vol??.05,J=N.createOscillator(),V=N.createGain();if(J.type=p.type??"square",J.frequency.setValueAtTime(p.freq,F),p.slideTo&&J.frequency.exponentialRampToValueAtTime(Math.max(1,p.slideTo),F+(p.slideDur??p.dur)),p.attack?(V.gain.setValueAtTime(Kt,F),V.gain.exponentialRampToValueAtTime(X,F+p.attack)):V.gain.setValueAtTime(X,F),V.gain.exponentialRampToValueAtTime(Kt,F+p.dur),p.filter){let H=m(N,p.filter,F,p.dur);J.connect(H),H.connect(V)}else J.connect(V);V.connect(P),J.start(F),J.stop(F+p.dur+(p.stopPad??.02))}catch{}}function m(p,E,O,N){let P=p.createBiquadFilter();if(P.type=E.type,P.frequency.setValueAtTime(E.freq,O),E.slideTo){let F=O+(E.slideDur??N);E.slide==="linear"?P.frequency.linearRampToValueAtTime(E.slideTo,F):P.frequency.exponentialRampToValueAtTime(Math.max(1,E.slideTo),F)}return P}function v(p,E){let O=S(E);if(!O)return;let{c:N,node:P}=O;try{let F=p.at??N.currentTime+(p.when??0),X=p.oscs.map(H=>{let Z=N.createOscillator();return Z.type=H.type,Z.frequency.setValueAtTime(H.freq,F),Z}),J=N.createGain();J.gain.setValueAtTime(Kt,F);for(let H of p.envelope)H.ramp==="linear"?J.gain.linearRampToValueAtTime(H.to,F+H.at):J.gain.exponentialRampToValueAtTime(H.to,F+H.at);let V=p.filter?m(N,p.filter,F,p.dur):J;p.filter&&V.connect(J);for(let H of X)H.connect(V);J.connect(P);for(let H of X)H.start(F),H.stop(F+p.dur+(p.stopPad??.02))}catch{}}function M(p,E){let O=S(E);if(!O)return;let{c:N,node:P}=O;try{let F=p.at??N.currentTime+(p.when??0),X=N.createBufferSource();if(p.source==="fade"){let H=Math.max(1,Math.floor(N.sampleRate*p.dur)),Z=N.createBuffer(1,H,N.sampleRate),me=Z.getChannelData(0),te=p.fadePower??1;for(let ve=0;ve<H;ve++)me[ve]=(Math.random()*2-1)*(te===1?1-ve/H:Math.pow(1-ve/H,te));X.buffer=Z}else{if(!s){s=N.createBuffer(1,N.sampleRate,N.sampleRate);let H=s.getChannelData(0);for(let Z=0;Z<H.length;Z++)H[Z]=Math.random()*2-1}X.buffer=s,X.loop=!0}let J=N.createBiquadFilter();J.type=p.filterType??"lowpass",J.frequency.setValueAtTime(p.filterFreq??1200,F),p.slideTo&&J.frequency.exponentialRampToValueAtTime(Math.max(1,p.slideTo),F+p.dur),p.filterQ!==void 0&&(J.Q.value=p.filterQ);let V=N.createGain();V.gain.setValueAtTime(p.vol,F),V.gain.exponentialRampToValueAtTime(Kt,F+p.dur),X.connect(J),J.connect(V),V.connect(P),X.start(F),X.stop(F+p.dur+.02)}catch{}}function R(p){let E=C();if(!E||r)return;p&&d.push(p);let O=()=>{if(r||E.state!=="running")return;r=!0;try{let P=E.createGain();P.gain.value=Kt;let F=E.createOscillator();F.connect(P),P.connect(E.destination),F.start(),F.stop(E.currentTime+.01)}catch{}let N=d;d=[];for(let P of N)P()};E.state==="running"?O():u(()=>E.resume()).then(O,()=>{})}return{context:C,peek:()=>o,bus:p=>h[p]??null,setGain(p,E){k[p]=E,x(p)},setMuted(p,E){T[p]=E,x(p)},isMuted:p=>T[p],unlock:R,suspend(){c=!1;let p=o;p&&u(()=>p.suspend()).catch(()=>{})},hold(){a=!0;let p=o;p&&u(()=>p.suspend()).catch(()=>{})},release(){a=!1;let p=o;if(i){p&&(c=!0);return}p&&u(()=>p.resume()).catch(()=>{})},wake(){let p=C();return p&&p.state==="suspended"&&!i&&u(()=>p.resume()).catch(()=>{}),p},setAway:_,isAway:()=>i,close(){let p=o;o=null,c=!1;for(let E of Ht)delete h[E];r=!1,d=[],s=null,p&&p.state!=="closed"&&u(()=>p.close()).catch(()=>{})},tone:g,noise:M,voice:v}}function mn(e,t,n,o=.09){e.tone({at:n,freq:85,slideTo:32,slideDur:.5,dur:.85,stopPad:.05,type:"sine",vol:o,attack:.015,filter:{type:"lowpass",freq:200,slideTo:55,slideDur:.45}},t),e.tone({at:n,freq:52,slideTo:24,slideDur:.4,dur:.55,stopPad:.05,type:"triangle",vol:o*.75,attack:.02},t)}function Wn(e,t,n,o=.035){e.noise({at:n,dur:.18,vol:o,source:"fade",fadePower:1.4,filterType:"bandpass",filterFreq:380,filterQ:.7},t)}function cr(e,t,n,o,r=3.2,a=.04){let i=Math.min(1.1,r*.35);e.voice({at:n,oscs:[{type:"sawtooth",freq:o},{type:"triangle",freq:o*1.498},{type:"sine",freq:o*.5}],filter:{type:"lowpass",freq:480,slideTo:280,slideDur:r,slide:"linear"},envelope:[{ramp:"linear",to:a,at:i},{ramp:"linear",to:a*.7,at:r*.7},{ramp:"exp",to:1e-4,at:r}],dur:r,stopPad:.05},t)}function dr(e,t,n,o,r=4,a=.012){e.voice({at:n,oscs:[{type:"triangle",freq:o},{type:"sine",freq:o*1.02}],envelope:[{ramp:"linear",to:a,at:1.5},{ramp:"linear",to:a*.5,at:r*.8},{ramp:"exp",to:1e-4,at:r}],dur:r,stopPad:.05},t)}var $i={small:{thumpGain:.11,thumpDur:.28,crackGain:.08,crackDur:.12,debrisGain:.06,debrisDur:.22,rumbleGain:.05,rumbleDur:.35,thumpFreq:70,crackFreq:420},medium:{thumpGain:.16,thumpDur:.45,crackGain:.12,crackDur:.16,debrisGain:.1,debrisDur:.4,rumbleGain:.09,rumbleDur:.65,thumpFreq:55,crackFreq:380},large:{thumpGain:.2,thumpDur:.85,crackGain:.14,crackDur:.28,debrisGain:.12,debrisDur:.7,rumbleGain:.14,rumbleDur:1.4,thumpFreq:42,crackFreq:300}};function ur(e){let t=e.settings,n=lr({createContext:e.createContext}),o=null,r=[],a=null,i=!1,c=!1,l=!1;function d(){let m=t();n.setMuted("sfx",!m.soundEnabled||m.soundVolume<=0),n.setGain("sfx",e.volumeToGain(m.soundVolume,"sfx"));let v=m.musicEnabled&&e.sessionActive()&&i;n.setGain("music",v?e.volumeToGain(m.musicVolume,"music"):0)}function s(){return d(),n.context()}function k(){return d(),n.isMuted("sfx")?null:n.context()}function T(){let m=t();c||l||!m.soundEnabled&&!m.musicEnabled||(d(),n.unlock(C))}function h(m,v){m.forEach(M=>{try{let R=M;typeof R.stop=="function"&&R.stop()}catch{}try{M.disconnect()}catch{}});try{v.disconnect()}catch{}}function x(m=!0){a&&(clearInterval(a),a=null);let v=n.peek(),M=o,R=r;if(i=!1,o=null,r=[],d(),!v||!M)return;let p=v.currentTime,E=()=>h(R,M);try{m?(M.gain.cancelScheduledValues(p),M.gain.setValueAtTime(Math.max(M.gain.value,1e-4),p),M.gain.exponentialRampToValueAtTime(1e-4,p+.9),setTimeout(E,950)):(M.gain.value=0,E())}catch{E()}}function u(){let m=t();if(i||!m.musicEnabled||m.musicVolume<=0||!e.sessionActive())return;let v=s(),M=n.bus("music");if(!v||!M)return;let R=()=>{if(i||!t().musicEnabled||!e.sessionActive())return;if(a&&(clearInterval(a),a=null),o){let Oe=o,Se=r;o=null,r=[],h(Se,Oe)}let p=v.createGain();p.gain.value=1e-4,p.connect(M);let E=v.createOscillator(),O=v.createOscillator(),N=v.createOscillator(),P=v.createGain(),F=v.createBiquadFilter();E.type="sawtooth",O.type="sine",N.type="triangle",E.frequency.value=36.71,O.frequency.value=55,N.frequency.value=38.89,F.type="lowpass",F.frequency.value=160,F.Q.value=.6,P.gain.value=.07,E.connect(F),O.connect(F),N.connect(F),F.connect(P),P.connect(p);let X=v.createOscillator(),J=v.createOscillator(),V=v.createGain(),H=v.createBiquadFilter();X.type="sawtooth",J.type="triangle",X.frequency.value=73.42,J.frequency.value=87.31,H.type="lowpass",H.frequency.value=320,V.gain.value=.028,X.connect(H),J.connect(H),H.connect(V),V.connect(p);let Z=v.createOscillator(),me=v.createGain();Z.type="sine",Z.frequency.value=.04,me.gain.value=30,Z.connect(me),me.connect(F.frequency);let te=v.currentTime;E.start(te),O.start(te),N.start(te),X.start(te),J.start(te),Z.start(te),X.frequency.setValueAtTime(73.42,te),J.frequency.setValueAtTime(87.31,te),X.frequency.setValueAtTime(73.42,te+8),J.frequency.linearRampToValueAtTime(92.5,te+16),X.frequency.linearRampToValueAtTime(65.41,te+24),J.frequency.linearRampToValueAtTime(98,te+24),X.frequency.linearRampToValueAtTime(73.42,te+32),J.frequency.linearRampToValueAtTime(87.31,te+32),p.gain.setValueAtTime(1e-4,te),p.gain.exponentialRampToValueAtTime(1,te+1.2),o=p,r=[E,O,N,X,J,Z,P,V,F,H,me],i=!0,d();let Ae=60/50,$e=[73.42,69.3,65.41,87.31,73.42,55,82.41,73.42],rt=[293.66,311.13,277.18,349.23],Ie=0,L=()=>{let Oe=n.peek();if(!i||!Oe||!o)return;let Se=Oe.currentTime+.05,Ue=Se,Ze=Se+Ae*2;mn(n,o,Ue,Ie%2===0?.11:.08),Ie%2===1?mn(n,o,Ze,.06):Wn(n,o,Ze,.03),cr(n,o,Ue+Ae*.15,$e[Ie%$e.length]??73.42,Ae*3.4,.038),Ie%2===0&&dr(n,o,Ue+Ae*.5,rt[Ie/2%rt.length]??293.66,Ae*3.6,.014),Ie%4===3&&(mn(n,o,Ue+Ae*.75,.07),Wn(n,o,Ue+Ae*1.1,.04)),Ie+=1};L(),a=setInterval(L,4*Ae*1e3-40)};v.state==="suspended"?v.resume().then(R).catch(()=>{}):R()}function C(){let m=t();!c&&!l&&e.sessionActive()&&m.musicEnabled&&m.musicVolume>0?i?d():u():x(!0)}function b({freq:m=440,freqEnd:v=null,type:M="square",duration:R=.12,gain:p=.08,delay:E=0}){n.tone({freq:m,dur:R,type:M,vol:p,slideTo:v,when:E,attack:.01})}function _({duration:m=.18,gain:v=.06,delay:M=0,filterFreq:R=900,filterType:p="bandpass"}={}){n.noise({dur:m,vol:v,when:M,filterFreq:R,filterType:p,source:"fade"})}function S(m,v=0){if(!k())return;let M=$i[m];b({freq:M.thumpFreq,freqEnd:Math.max(18,M.thumpFreq*.35),type:"sine",duration:M.thumpDur,gain:M.thumpGain,delay:v}),b({freq:M.thumpFreq*1.4,freqEnd:24,type:"triangle",duration:M.thumpDur*.85,gain:M.thumpGain*.55,delay:v+.02}),_({duration:M.crackDur,gain:M.crackGain,delay:v+.03,filterFreq:M.crackFreq,filterType:"bandpass"}),b({freq:900,freqEnd:120,type:"square",duration:M.crackDur*.7,gain:M.crackGain*.45,delay:v+.03}),_({duration:M.debrisDur,gain:M.debrisGain,delay:v+.06,filterFreq:1800,filterType:"highpass"}),_({duration:M.debrisDur*.8,gain:M.debrisGain*.7,delay:v+.08,filterFreq:700,filterType:"bandpass"}),b({freq:48,freqEnd:20,type:"sine",duration:M.rumbleDur,gain:M.rumbleGain,delay:v+.1}),_({duration:M.rumbleDur*.9,gain:M.rumbleGain*.65,delay:v+.12,filterFreq:180,filterType:"lowpass"})}let g={projectile(){b({freq:980,freqEnd:240,type:"sawtooth",duration:.14,gain:.07}),b({freq:1400,freqEnd:400,type:"square",duration:.08,gain:.035,delay:.01})},hit(){b({freq:160,freqEnd:70,type:"sawtooth",duration:.1,gain:.05}),_({duration:.08,gain:.04})},heal(){b({freq:280,freqEnd:540,type:"sine",duration:.18,gain:.05}),b({freq:420,freqEnd:660,type:"triangle",duration:.14,gain:.03,delay:.04})},ko(){S("small")},nuke(){S("large")},raptor(){b({freq:220,freqEnd:70,type:"sawtooth",duration:.7,gain:.09}),b({freq:140,freqEnd:55,type:"triangle",duration:.85,gain:.07,delay:.04}),_({duration:.55,gain:.08,filterFreq:700,filterType:"lowpass"}),_({duration:.4,gain:.05,delay:.15,filterFreq:2400,filterType:"highpass"}),[.45,.58,.7,.82,.94,1.06].forEach((m,v)=>{b({freq:980-v*40,freqEnd:180,type:"square",duration:.07,gain:.055,delay:m}),_({duration:.08,gain:.045,delay:m,filterFreq:1600})}),S("medium",.72),S("medium",1)},grenadeArm(){b({freq:640,freqEnd:420,type:"square",duration:.09,gain:.05}),b({freq:880,freqEnd:660,type:"triangle",duration:.07,gain:.035,delay:.04}),_({duration:.06,gain:.03,filterFreq:2200})},grenade(){b({freq:420,freqEnd:140,type:"sawtooth",duration:.14,gain:.05}),_({duration:.12,gain:.05,filterFreq:1800,filterType:"highpass"}),S("medium",.08)},missile(){b({freq:380,freqEnd:110,type:"sawtooth",duration:.22,gain:.055}),_({duration:.14,gain:.04,filterFreq:1400,filterType:"highpass"})},trackerMissile(){b({freq:520,freqEnd:160,type:"sawtooth",duration:.22,gain:.07}),_({duration:.14,gain:.04,filterFreq:2200,filterType:"highpass"})},introLaunch(){b({freq:160,freqEnd:70,type:"sawtooth",duration:.28,gain:.06})},nukeLaunch(){b({freq:180,freqEnd:90,type:"sawtooth",duration:.2,gain:.05})}};return{sfx(m){c||l||(d(),g[m]())},prime(){!c&&!l&&k()},unlock:T,syncMusic:C,settingChanged(m){let v=t();(m==="musicEnabled"||m==="musicVolume")&&C(),(m==="soundEnabled"||m==="soundVolume")&&s(),m==="soundEnabled"&&!v.soundEnabled&&!v.musicEnabled&&n.suspend(),(m==="soundEnabled"||m==="musicEnabled")&&(v.soundEnabled||v.musicEnabled)&&s()},pageHide(){c=!0,x(!1),n.hold()},pageShow(){c&&(c=!1,n.release(),C())},pageClose(){c=!0,x(!1),n.close()},frameAway(m){if(m!==l){if(l=m,m){n.setAway(!0),x(!0);return}n.setAway(!1),C()}}}}function Ot(e){return(e.key==="q"||e.key==="Q")&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.isComposing}var Ui=new Set(["range","checkbox","radio","button","submit","reset","image","color","file"]);function Nt(e){let t=e;return t?t.isContentEditable||t.tagName==="SELECT"?!0:t.tagName==="INPUT"&&t.type&&Ui.has(t.type)?!1:(t.tagName==="INPUT"||t.tagName==="TEXTAREA")&&!t.readOnly:!1}var Xi=1e4,Ki=6e4,Wi=700,Yi=1900;function pr(e){if(e.ctrlKey||e.metaKey||e.altKey)return null;if(Ot(e))return e.repeat?null:"disarm";let t=(e.key??"").toLowerCase();return t==="r"?"raptor":t==="g"?"grenade":null}function ji(e,t){return Math.max(0,e-t)}function mr(e,t){let n=ji(e,t);return n>0?Math.max(1,Math.ceil(n/1e3)):0}function fr(e){let t=!1,n=!1,o=[];function r(){o.forEach(i=>e.clearTimer(i)),o=[],n=!1,e.raptorClear()}function a(){t&&(t=!1,e.changed())}return{grenadeArmed:()=>t,raptorInbound:()=>n,cancelGrenadeArm:a,clearRaptor:r,readyGrenade(){return!e.isLive()||e.now()<e.readyAt("grenade")?!1:t?(a(),!1):(t=!0,e.sfx("grenadeArm"),e.changed(),!0)},throwGrenadeAt(i,c){return!e.isLive()||!t?!1:e.now()<e.readyAt("grenade")?(a(),!1):(t=!1,e.setReadyAt("grenade",e.now()+Xi),e.changed(),e.sfx("grenade"),e.grenadeBlast(i,c),!0)},callRaptor(){return!e.isLive()||n||e.now()<e.readyAt("raptor")||!e.raptorAvailable()?!1:(r(),n=!0,e.setReadyAt("raptor",e.now()+Ki),e.changed(),e.sfx("raptor"),e.raptorLaunch(),o.push(e.setTimer(()=>{!n||!e.isLive()||e.raptorStrike()},Wi)),o.push(e.setTimer(()=>{e.raptorClear(),n=!1,o=[],e.changed()},Yi)),!0)},reset(){e.setReadyAt("grenade",0),e.setReadyAt("raptor",0),t=!1,r()}}}var lt={small:{radius:56,holdMs:800,fadeMs:1e3},medium:{radius:165,holdMs:2500,fadeMs:2e3},large:{radius:0,holdMs:4e3,fadeMs:3e3}};function gr(e){let t=[];function n(l){l&&(e.clearTimer(l.holdTimer),e.clearTimer(l.fadeTimer),l.el.remove(),t=t.filter(d=>d!==l))}function o(l,d){l.fadeTimer=e.setTimer(()=>{if(e.paused()){l.fadeTimer=null;return}n(l)},d)}function r(l,d){l.holdTimer=e.setTimer(()=>{if(e.paused()){l.holdTimer=null;return}a(l)},d)}function a(l){if(!l.el.isConnected){n(l);return}l.phase="fade",l.el.style.setProperty("--hole-fade-ms",`${l.fadeMs}ms`),l.el.classList.add("is-fading"),l.fadeDue=e.now()+l.fadeMs,o(l,l.fadeMs)}function i(){let l=t[0];l&&(l.phase==="hold"?(e.clearTimer(l.holdTimer),a(l)):n(l))}function c(){let{width:l,height:d}=e.viewport();return Math.min(l||400,d||400)*.42}return{punch(l,d,{radius:s,holdMs:k,fadeMs:T}={}){let h=e.field;if(!h||!e.isLive())return;let x=s!==void 0&&s>0?s:c(),u=k!==void 0&&k>0?k:lt.small.holdMs,C=T!==void 0&&T>0?T:lt.small.fadeMs;for(;t.length>=24;)i(),t.length>=24&&n(t[0]);let b=e.create("div");b.className="cylon-hole",b.setAttribute("aria-hidden","true"),b.style.left=`${l}px`,b.style.top=`${d}px`,b.style.width=`${x*2}px`,b.style.height=`${x*2}px`;let _=e.create("div");_.className="cylon-hole-glitch",b.appendChild(_),h.appendChild(b);let S={el:b,holdTimer:null,fadeTimer:null,holdDue:e.now()+u,fadeDue:0,fadeMs:C,phase:"hold"};r(S,u),t.push(S)},clearAll(){[...t].forEach(n),t=[],e.field?.querySelectorAll(".cylon-hole").forEach(l=>l.remove())},largeRadius:c,count:()=>t.length,pause(){t.forEach(l=>{e.clearTimer(l.holdTimer),e.clearTimer(l.fadeTimer),l.holdTimer=null,l.fadeTimer=null})},resume(l,d){t.forEach(s=>{s.phase==="hold"&&s.holdDue>l?(e.clearTimer(s.holdTimer),s.holdDue+=d,r(s,Math.max(0,s.holdDue-e.now()))):s.phase==="fade"&&s.fadeDue>l&&(e.clearTimer(s.fadeTimer),s.fadeDue+=d,o(s,Math.max(0,s.fadeDue-e.now())))})}}}var hr={xSpread:.55,ySpread:.7,rotMax:28},yr={xSpread:1.15,ySpread:1.25,rotMax:150},Yn={xSpread:1.35,ySpread:1.4,rotMax:220},jn=".interest-list li, .course-list li",Ji="h1, h2, h3, .page-lead, .contact-block, .interest-list, .course-list, .project-list, .project-list > li, aside, .games-hub-card, .games-home-callout, .cylon-debris",Qi=3e3;function br(e){let t=e.doc.body,n=null;function o(){let{width:d,height:s}=e.viewport();return{vw:d||800,vh:s||600}}function r(d,s,k){let T=+((e.random()-.5)*d*k.xSpread).toFixed(1),h=+((e.random()-.5)*s*k.ySpread).toFixed(1),x=+((e.random()-.5)*k.rotMax).toFixed(1);return{sx:T,sy:h,sr:x}}function a(d,s,k,T){let h=r(s,k,T);d.style.setProperty("--sx",`${h.sx.toFixed(1)}px`),d.style.setProperty("--sy",`${h.sy.toFixed(1)}px`),d.style.setProperty("--sr",`${h.sr.toFixed(1)}deg`)}let i=()=>{let{vw:d,vh:s}=o();return r(d,s,Yn)};function c(d,s,k){let T=(e.random()-.5)*s*.35,h=(e.random()-.5)*k*.4,x=(e.random()-.5)*120;d.style.setProperty("--mx",`${T.toFixed(1)}px`),d.style.setProperty("--my",`${h.toFixed(1)}px`),d.style.setProperty("--mr",`${x.toFixed(1)}deg`)}let l=()=>t.dataset.cylonScattered==="1";return{scattered:l,scatter(){if(l()||e.reduceMotion)return;let{vw:d,vh:s}=o(),k=[...e.doc.querySelectorAll(".page-panel")];k.forEach(T=>{if(T.classList.add("cylon-scatter-panel"),a(T,d,s,hr),T.querySelectorAll(Ji).forEach(u=>{u.classList.add("cylon-scatter-block"),a(u,d,s,yr)}),T.querySelectorAll(jn).forEach(u=>c(u,d,s)),e.glyphs)return;let h=e.doc.createTreeWalker(T,NodeFilter.SHOW_TEXT,{acceptNode(u){return!u.nodeValue||!/\S/.test(u.nodeValue)||u.parentElement?.closest(".cylon-scatter-char")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),x=[];for(;h.nextNode();)x.push(h.currentNode);x.forEach(u=>{let C=e.doc.createDocumentFragment();for(let b of u.nodeValue??""){if(b===" "||b===`
`||b==="	"){C.appendChild(e.doc.createTextNode(b));continue}let _=e.doc.createElement("span");_.className="cylon-scatter-char",_.textContent=b,a(_,d,s,Yn),C.appendChild(_)}u.parentNode?.replaceChild(C,u)})}),e.glyphs?.scatter(k,i),t.dataset.cylonScattered="1"},restore(){l()&&(e.glyphs?.restore(),e.doc.querySelectorAll(".cylon-scatter-char").forEach(d=>{d.replaceWith(e.doc.createTextNode(d.textContent||""))}),e.doc.querySelectorAll(jn).forEach(d=>{d.style.removeProperty("--mx"),d.style.removeProperty("--my"),d.style.removeProperty("--mr")}),e.doc.querySelectorAll(".cylon-scatter-panel, .cylon-scatter-block").forEach(d=>{d.classList.remove("cylon-scatter-panel","cylon-scatter-block"),d.style.removeProperty("--sx"),d.style.removeProperty("--sy"),d.style.removeProperty("--sr")}),t.dataset.cylonScattered="0")},reshuffle(){if(!l()||e.reduceMotion)return;let{vw:d,vh:s}=o();t.classList.add("cylon-glyphs-blowing"),e.doc.querySelectorAll(".cylon-scatter-panel").forEach(k=>{a(k,d,s,hr)}),e.doc.querySelectorAll(".cylon-scatter-block").forEach(k=>{a(k,d,s,yr)}),e.doc.querySelectorAll(".cylon-scatter-char").forEach(k=>{a(k,d,s,Yn)}),e.doc.querySelectorAll(jn).forEach(k=>c(k,d,s)),e.glyphs?.reshuffle(i),e.clearTimer(n),n=e.setTimer(()=>{t.classList.remove("cylon-glyphs-blowing"),n=null},Qi)},cancelReshuffleSettle(){e.clearTimer(n),n=null}}}function vr(e){let t=0,n=!1;function o(){e.body.classList.remove("cylon-intro-hero");let s=e.titleEl;s&&(s.hidden=!0,s.setAttribute("aria-hidden","true"),s.classList.remove("is-hero","is-settling","is-exit"),s.style.cssText="")}function r(){let s=e.titleEl;if(!s)return{x:0,y:0};let k=(window.innerWidth||1)*.5,T=(window.innerHeight||1)*.48;return s.style.left=`${k}px`,s.style.top=`${T}px`,s.style.right="auto",s.style.bottom="auto",s.style.transform="translate(-50%, -50%)",s.style.transformOrigin="center center",{x:k,y:T}}function a(){let s=e.titleEl;s&&(s.textContent=e.title,s.hidden=!1,s.setAttribute("aria-hidden","false"),s.classList.remove("is-exit","is-settling","is-hero"),s.style.cssText="",r(),e.body.classList.add("cylon-intro-hero"),s.offsetWidth,s.classList.add("is-hero"))}function i(){return window.matchMedia("(max-width: 819px)").matches}function c(s){let k=e.titleEl;if(s!==t||!k||k.hidden)return;let T=e.brandEl;if(e.reduceMotion||i()||!T){k.classList.add("is-exit");let p=e.reduceMotion?0:450;setTimeout(()=>{s===t&&o()},p);return}let h=r();k.offsetWidth;let x=k.getBoundingClientRect(),u=T.getBoundingClientRect(),C=x.left+x.width/2,b=x.top+x.height/2,_=u.left+u.width/2,S=u.top+u.height/2,g=_-C,m=S-b,v=u.width/Math.max(x.width,1);k.classList.remove("is-hero"),k.classList.add("is-settling"),k.style.left=`${h.x}px`,k.style.top=`${h.y}px`,k.style.transform="translate(-50%, -50%) scale(1)",requestAnimationFrame(()=>{requestAnimationFrame(()=>{s===t&&(k.style.transform=`translate(calc(-50% + ${g}px), calc(-50% + ${m}px)) scale(${v})`,k.style.textShadow="none")})});let M=!1,R=p=>{p&&p.propertyName&&p.propertyName!=="transform"||M||s!==t||(M=!0,k.removeEventListener("transitionend",R),o())};k.addEventListener("transitionend",R),setTimeout(()=>R(),e.settleMs+120)}function l(){t+=1,n=!1,e.setNukeInFlight(!1),e.nukeEl&&e.nukeEl.classList.remove("is-flying"),o()}function d(){let s=++t;n=!0,e.startRun(),e.setNukeInFlight(!1),o();let k=(window.innerWidth||1)/2,T=(window.innerHeight||1)*.48,h=M=>{let R=()=>{if(!(s!==t||!e.enabled())){if(e.paused()){setTimeout(R,100);return}M()}};R()},x=()=>{n=!1,e.beginCombat()},u=(M,R)=>{if(s!==t||!e.enabled())return;e.setNukeInFlight(!1),e.nukeEl&&e.nukeEl.classList.remove("is-flying"),e.detonate(M,R),a();let p=e.reduceMotion?0:520;setTimeout(()=>h(x),p);let E=e.reduceMotion?0:Math.max(900,p+e.navFadeMs+80);setTimeout(()=>h(()=>c(s)),E)},C=e.nukeEl;if(e.reduceMotion||!C){u(k,T);return}e.setNukeInFlight(!0);let b=k+(e.random()-.5)*Math.min(120,(window.innerWidth||400)*.15),_=-72,S=performance.now(),g=S,m=e.speed;C.style.left=`${b}px`,C.style.top=`${_}px`,C.classList.add("is-flying"),e.launched();let v=M=>{if(s!==t)return;if(!e.enabled()){l();return}if(e.paused()){S+=M-g,g=M,requestAnimationFrame(v);return}let R=Math.min(.05,(M-g)/1e3);g=M;let p=k-b,E=T-_,O=Math.hypot(p,E)||1,N=m*R;if(b+=p/O*Math.min(N,O),_+=E/O*Math.min(N,O),C.style.left=`${b}px`,C.style.top=`${_}px`,C.style.setProperty("--nuke-heading",`${Math.atan2(E,p)*(180/Math.PI)}deg`),O<=e.arriveRadius||M-S>=e.maxFlightMs){u(b,_);return}requestAnimationFrame(v)};requestAnimationFrame(v)}return{play:d,cancel:l,playing:()=>n}}function xr(e){let{reduceMotion:t,scrollX:n,scrollY:o}=e;function r(h,x){return h+Math.random()*(x-h)}function a(h,x){let u=document.body.style.getPropertyValue(h)||getComputedStyle(document.body).getPropertyValue(h),C=parseFloat(u);return Number.isFinite(C)?C:x}function i(h,x,u){return h+(x-h)*u}function c(h){return 90+Math.max(.05,Math.min(1.6,h))*180}function l(h,x,u){let C=document.body,b=window.innerWidth||1,_=window.innerHeight||1,S=Math.max(.05,Math.min(1,u)),g=Math.max(8,Math.min(92,h/b*100)),m=Math.max(10,Math.min(90,x/_*100)),v=Math.min(1,.55+S*.6);C.style.setProperty("--blast-x",`${i(a("--blast-x",50),g,v).toFixed(1)}%`),C.style.setProperty("--blast-y",`${i(a("--blast-y",48),m,v).toFixed(1)}%`),C.style.setProperty("--land-morph-ms",`${Math.round(280+S*420)}ms`)}function d(h,x,u=1,C={}){if(!document.body.classList.contains("cylon-world-ended")&&u<.9&&u<.99)return;let b=Math.max(.05,Math.min(1,u)),_=h+n(),S=x+o(),g=Number.isFinite(C.radius)?C.radius:null;if(b<.9){l(h,x,b),s(_,S,b,g);return}let m=document.body,v=window.innerWidth||1,M=window.innerHeight||1,R=Math.max(8,Math.min(92,h/v*100)),p=Math.max(10,Math.min(90,x/M*100));m.style.setProperty("--blast-x",`${i(a("--blast-x",50),R,Math.min(1,b*1.15)).toFixed(1)}%`),m.style.setProperty("--blast-y",`${i(a("--blast-y",48),p,Math.min(1,b*1.15)).toFixed(1)}%`),m.style.setProperty("--crack-a",`${i(a("--crack-a",118),r(70,160),b).toFixed(1)}deg`),m.style.setProperty("--crack-b",`${i(a("--crack-b",28),r(8,70),b).toFixed(1)}deg`),m.style.setProperty("--crack-c",`${i(a("--crack-c",155),r(120,200),b).toFixed(1)}deg`),m.style.setProperty("--crack-grain",`${i(a("--crack-grain",-18),r(-40,12),b).toFixed(1)}deg`),m.style.setProperty("--scar-1",`${i(a("--scar-1",42),r(28,48),b).toFixed(1)}%`),m.style.setProperty("--scar-2",`${i(a("--scar-2",61),r(52,72),b).toFixed(1)}%`),m.style.setProperty("--scar-3",`${i(a("--scar-3",33),r(22,42),b).toFixed(1)}%`),m.style.setProperty("--scar-4",`${i(a("--scar-4",72),r(58,82),b).toFixed(1)}%`),m.style.setProperty("--scar-5",`${i(a("--scar-5",18),r(12,30),b).toFixed(1)}%`),m.style.setProperty("--scar-6",`${i(a("--scar-6",78),r(68,88),b).toFixed(1)}%`),m.style.setProperty("--ash-1-x",`${i(a("--ash-1-x",18),r(8,40),b).toFixed(1)}%`),m.style.setProperty("--ash-1-y",`${i(a("--ash-1-y",22),r(10,40),b).toFixed(1)}%`),m.style.setProperty("--ash-2-x",`${i(a("--ash-2-x",82),r(58,92),b).toFixed(1)}%`),m.style.setProperty("--ash-2-y",`${i(a("--ash-2-y",70),r(45,85),b).toFixed(1)}%`),m.style.setProperty("--ash-3-x",`${i(a("--ash-3-x",50),r(30,70),b).toFixed(1)}%`),m.style.setProperty("--ash-3-y",`${i(a("--ash-3-y",100),r(75,105),b).toFixed(1)}%`);let E=i(a("--land-shift-x",0),r(-28,28),b),O=i(a("--land-shift-y",0),r(-22,22),b),N=i(a("--land-scale",1),r(1.02,1.1),b),P=i(a("--land-rot",0),r(-2.8,2.8),b);m.style.setProperty("--land-shift-x",`${E.toFixed(1)}px`),m.style.setProperty("--land-shift-y",`${O.toFixed(1)}px`),m.style.setProperty("--ash-drift-x",`${(-E*.35).toFixed(1)}px`),m.style.setProperty("--ash-drift-y",`${(-O*.35).toFixed(1)}px`),m.style.setProperty("--land-rot",`${P.toFixed(2)}deg`),m.style.setProperty("--land-scale",`${N.toFixed(3)}`),m.style.setProperty("--ash-scale",`${(1+(N-1)*.4).toFixed(3)}`),m.style.setProperty("--land-morph-ms",`${Math.round(420+b*930)}ms`),s(_,S,b,g)}function s(h,x,u=1,C=null){if(document.body.dataset.cylonScattered!=="1"||t)return;let b=Math.max(.05,Math.min(1.6,u)),_=Number.isFinite(C)&&C>0?C:c(b),S=b<.95,g=S?".cylon-scatter-char":".cylon-scatter-char, .cylon-scatter-block, .cylon-scatter-panel",m=[...document.querySelectorAll(g)],v=Math.min(1,.7+b*.3),M=55*b,R=48+200*b,p=n(),E=o(),O=(P,F,X,J,V)=>{let H=P-h,Z=F-x,me=Math.hypot(H,Z)||1;if(me>_||Math.random()>v)return null;let te=Math.max(0,1-me/_),ve=r(R*.5,R)*te;return{sx:+(X+H/me*ve+r(-M,M)*te).toFixed(1),sy:+(J+Z/me*ve+r(-M,M)*te).toFixed(1),sr:+(V+r(-32,32)*b*te).toFixed(1)}};m.filter(P=>!(P.classList.contains("cylon-scatter-panel")&&b<1.1)).map(P=>({el:P,rect:P.getBoundingClientRect()})).forEach(({el:P,rect:F})=>{let X=O(F.left+F.width/2+p,F.top+F.height/2+E,parseFloat(P.style.getPropertyValue("--sx"))||0,parseFloat(P.style.getPropertyValue("--sy"))||0,parseFloat(P.style.getPropertyValue("--sr"))||0);X&&(P.style.setProperty("--sx",`${X.sx.toFixed(1)}px`),P.style.setProperty("--sy",`${X.sy.toFixed(1)}px`),P.style.setProperty("--sr",`${X.sr.toFixed(1)}deg`))}),e.glyphs&&(e.glyphs.kick((P,F,X)=>O(P,F,X.sx,X.sy,X.sr)),S||e.glyphs.poke(3500))}function k(h,x,u=1,C={}){d(h-n(),x-o(),u,C)}function T(){["--blast-x","--blast-y","--crack-a","--crack-b","--crack-c","--crack-grain","--scar-1","--scar-2","--scar-3","--scar-4","--scar-5","--scar-6","--ash-1-x","--ash-1-y","--ash-2-x","--ash-2-y","--ash-3-x","--ash-3-y","--land-shift-x","--land-shift-y","--ash-drift-x","--ash-drift-y","--land-rot","--land-scale","--ash-scale","--land-morph-ms"].forEach(h=>document.body.style.removeProperty(h))}return{randRange:r,rearrangeLandscape:d,rearrangeLandscapePage:k,disruptGlyphs:s,clearLandscapeVars:T}}function wr(e){let{eye:t,glare:n,game:o,settings:r,mouse:a,state:i,isGameLive:c,EYE_DISORIENT_MS:l}=e,d=50,s=!1,k=5.2,T=0,h=0;function x(){let v=t.parentElement;if(!v)return 50;let M=t.getBoundingClientRect(),R=v.getBoundingClientRect();return R.width<1?50:(M.left+M.width/2-R.left)/R.width*100}function u(){return i.pending(o.schedule.eyeDisorientedUntil,Date.now())}function C(v){(!c()||!r.eyeEnabled||u())&&(v=!1),v&&!s&&(d=x(),T=Math.asin(Math.max(-1,Math.min(1,(d-50)/45))),h=performance.now()),s=v,t.classList.toggle("is-tracking",v&&!u()),n&&n.classList.toggle("is-active",v&&!u()),!v&&!u()&&(t.style.left="",n&&(n.style.opacity="",n.style.height="",n.style.top="",n.style.transform=""))}function b(v=l){o.schedule.eyeDisorientedUntil=Date.now()+v,s=!1,t.classList.remove("is-tracking"),t.classList.add("is-disoriented"),d=x(),n&&(n.classList.add("is-active"),n.classList.add("is-disoriented"))}function _(){t.classList.contains("is-disoriented")&&!u()&&(t.classList.remove("is-disoriented"),n&&n.classList.remove("is-disoriented"),s||(t.style.left="",n&&n.classList.remove("is-active")))}function S(){if(_(),u()){let v=performance.now()/1e3,M=50+Math.sin(v*6.8)*30+Math.sin(v*15.4)*14+Math.sin(v*2.7)*10+Math.sin(v*31)*4,R=Math.min(95,Math.max(5,M));if(d+=(R-d)*.22,t.style.left=`${d}%`,n){n.classList.add("is-active"),n.style.left=`${d/100*window.innerWidth}px`;let p=.45+.55*(.5+.5*Math.sin(v*22));n.style.height=`${Math.min(window.innerHeight*.28,176)*p}px`,n.style.opacity=String(.35+.55*p)}}else if(s&&r.eyeEnabled){let v=performance.now();if(T+=Math.min(.05,(v-h)/1e3)*(Math.PI*2/k),h=v,d=50+45*Math.sin(T),t.style.left=`${d}%`,n){let M=m(),R=M.y+t.getBoundingClientRect().height*.2,p=a.clientX-M.x,E=Math.max(1,a.clientY-R);n.style.opacity="",n.style.left=`${M.x}px`,n.style.top=`${R}px`;let O=Math.hypot(p,E),N=Math.min(O*.85,140+O*.25);n.style.height=`${O}px`,n.style.setProperty("--glare-reach",`${N/Math.max(1,O)*100}%`),n.style.opacity=String(Math.max(.3,Math.min(1,1-O/(Math.hypot(window.innerWidth,window.innerHeight)*1.2)))),n.style.transform=`translateX(-50%) rotate(${-Math.atan2(p,E)}rad)`}}requestAnimationFrame(S)}function g(){o.schedule.eyeDisorientedUntil=0,t&&t.classList.remove("is-disoriented"),n&&(n.classList.remove("is-disoriented"),s||n.classList.remove("is-active"))}function m(){let v=t.getBoundingClientRect();return{x:v.left+v.width/2,y:v.top+v.height/2}}return{isEyeDisoriented:u,setEyeTracking:C,disorientEye:b,clearEyeDisorient:g,eyeClientCenter:m,updateEye:S}}function kr(e){let{reticleEl:t,mouse:n,lastAim:o,game:r,settings:a,coarsePointer:i,IDLE_MS:c,isGameLive:l,isEyeDisoriented:d,setEyeTracking:s,audio:k,abilities:T,scrollX:h,scrollY:x}=e;function u(){n.pageX=n.clientX+h(),n.pageY=n.clientY+x()}function C(){!t||t.hidden||(t.style.transform=`translate(${n.clientX}px, ${n.clientY}px)`)}function b(R,p){let E=window.innerWidth||1,O=window.innerHeight||1;n.clientX=Math.min(E-8,Math.max(8,R)),n.clientY=Math.min(O-8,Math.max(8,p)),u(),n.t=performance.now(),C(),o.clientX=n.clientX,o.clientY=n.clientY,o.t=performance.now(),l()&&a.eyeEnabled&&!d()&&(s(!0),clearTimeout(r.idleTimer),r.idleTimer=setTimeout(()=>s(!1),c))}function _(){if(!t)return;let R=l();t.hidden=!R,t.setAttribute("aria-hidden",R?"false":"true"),t.classList.toggle("is-mouse-follow",R&&!i),R&&C()}function S(){b(window.innerWidth/2,window.innerHeight*.42)}function g(R){return!R||!R.closest?!1:!!R.closest(".site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel")}function m(R){k.prime(),!(r.reticlePointerId!=null&&R.pointerId===r.reticlePointerId)&&(i&&R.pointerType==="touch"||g(R.target)||b(R.clientX,R.clientY))}function v(R){r.reticlePointerId==null||R&&R.pointerId!==r.reticlePointerId||(r.draggingReticle=!1,r.reticlePointerId=null,t?.classList.remove("is-dragging"))}function M(){if(!t||!i)return;t.addEventListener("pointerdown",p=>{l()&&(p.button!=null&&p.button!==0||r.reticlePointerId==null&&(T.grenadeArmed()||(p.preventDefault(),r.draggingReticle=!0,r.reticlePointerId=p.pointerId,t.classList.add("is-dragging"),b(p.clientX,p.clientY))))});let R=p=>{r.reticlePointerId==null||p.pointerId!==r.reticlePointerId||(p.preventDefault(),b(p.clientX,p.clientY))};window.addEventListener("pointermove",R,{passive:!1}),window.addEventListener("pointerup",v,!0),window.addEventListener("pointercancel",v,!0)}return{syncMousePageFromClient:u,paintReticle:C,syncReticleVisibility:_,resetReticleToCenter:S,onPointerMove:m,bindReticle:M}}function _r(e){let{game:t,settings:n,mouse:o,lastAim:r,state:a,rules:i,playfield:c,field:l,ambushUnder:d,missileEl:s,nukeEl:k,nukeMissileEl:T,scoreEl:h,audio:x,intro:u,abilities:C,holes:b,debris:_,punchHole:S,HOLE_PRESETS:g,isGameLive:m,isEyeDisoriented:v,eyeClientCenter:M,syncMousePageFromClient:R,rearrangeLandscape:p,rearrangeLandscapePage:E,disruptGlyphs:O,randRange:N,registerHit:P,resizeBattlefield:F,scrollX:X,scrollY:J,BOT_HARD_CAP:V,BOT_SIZE:H,LINK_PAD:Z,HIT_RADIUS:me,BOLT_HIT_RADIUS:te,NUKE_DIRECT_HIT_RADIUS:ve,NUKE_SPEED:Ae,NUKE_ARRIVE_RADIUS:$e,NUKE_MAX_FLIGHT_MS:rt,MISSILE_SPEED:Ie,MISSILE_ARRIVE:L,MISSILE_MAX_FLIGHT_MS:Oe,MISSILE_BLAST_RADIUS:Se,SMALL_WEAPON_SCALE:Ue,MISSILE_WEAPON_SCALE:Ze}=e,de=0,Me=null,Xe=[],at=null,Je=[];function Ke(){let f=document.documentElement;return{w:f.clientWidth,h:Math.max(document.body.offsetHeight,f.clientHeight)}}function et(){let f=d?[...d.querySelectorAll(".cylon-bot")]:[],A=l?[...l.querySelectorAll(".cylon-bot")]:[];return f.concat(A)}function Ct(){return i.killLevel(t.run.koScore)}function bt(){return i.groundMissileCap(t.run.koScore)}function dt(){return i.trackerMissileCap(t.run.koScore)}function w(){return i.trackerMissileChance(t.run.koScore)}function D(f=null){return Xe.filter(A=>A.alive?f==null?!0:A.tracker===f:!1).length}function q(f){return f?D(!0)<dt():D(!1)<bt()}function $(){Je.forEach(f=>clearTimeout(f)),Je=[]}function z(){clearTimeout(at),at=null,$(),Xe.forEach(f=>{f.alive=!1,f.el.remove()}),Xe=[],s&&s.classList.remove("is-flying","is-tracker")}function W(){let f=window.innerWidth||800,A=Math.max(24,Math.min(56,f*.04)),B=Math.max(80,f-A*2),U=8+Math.random()*22,oe=Xe.filter(re=>re.alive).map(re=>{let be=parseFloat(re.el.style.left);return Number.isFinite(be)?be:re.originX||f/2}),fe=12,j=[];for(let re=0;re<fe;re++)j.push(A+(re+.5)/fe*B);if(j.push(A+Math.random()*B),j.push(A+Math.random()*B),j.push(A+Math.random()*B),!oe.length&&Math.random()<.28){let re=M();return{x:Math.min(f-A,Math.max(A,re.x+(Math.random()-.5)*64)),y:Math.min(U+18,Math.max(6,re.y-36))}}let ge=j[0],ce=-1/0;for(let re of j){let be;if(!oe.length)be=Math.abs(re-f/2)/(f/2)*40+Math.random()*80;else{let Ee=1/0;for(let Te of oe)Ee=Math.min(Ee,Math.abs(re-Te));be=Ee*(1+oe.length*.35)+Math.random()*36}be>ce&&(ce=be,ge=re)}return{x:ge,y:U}}function K(f,A,B){f&&(f.alive=!1,f.el.remove(),Xe=Xe.filter(j=>j!==f&&j.alive));let U=A+window.scrollX,ee=B+window.scrollY;x.sfx("ko");let oe=document.createElement("div");oe.className="cylon-missile-blast",oe.style.left=`${U}px`,oe.style.top=`${ee}px`,oe.setAttribute("aria-hidden","true"),l.appendChild(oe),setTimeout(()=>oe.remove(),420),S(U,ee,g.small),E(U,ee,Ze),R(),Math.hypot(o.clientX-A,o.clientY-B)<=Se&&P(2)}function ie({forceTracker:f=!1,forceGround:A=!1,fromPair:B=!1}={}){if(!m()||v())return!1;let U=!1;if(A){if(!q(!1))return!1}else if(f){if(U=q(!0),!U)return!1}else if(U=Math.random()<w()&&q(!0),!U&&!q(!1))return!1;let ee=performance.now()-r.t<4e3,oe=ee?r.clientX:o.clientX,fe=ee?r.clientY:o.clientY,j=document.createElement("div");j.className="cylon-small-missile is-flying"+(U?" is-tracker":""),j.setAttribute("aria-hidden","true"),document.body.appendChild(j);let ge=W(),ce=ge.x,re=ge.y,be={el:j,tracker:U,alive:!0,originX:ce};Xe.push(be);let Ee=performance.now(),Te=Ee;j.style.left=`${ce}px`,j.style.top=`${re}px`,x.prime(),x.sfx(U?"trackerMissile":"missile");let Be=pe=>{if(!be.alive)return;if(t.paused||!n.gameEnabled||t.run.gameOver){Ee+=pe-Te,Te=pe,requestAnimationFrame(Be);return}let Re=Math.min(.05,(pe-Te)/1e3);Te=pe;let He=U?o.clientX:oe,We=U?o.clientY:fe,Ge=He-ce,Qe=We-re,Ye=Math.hypot(Ge,Qe)||1,Bt=Ie*Re;if(ce+=Ge/Ye*Math.min(Bt,Ye),re+=Qe/Ye*Math.min(Bt,Ye),j.style.left=`${ce}px`,j.style.top=`${re}px`,j.style.transform=`rotate(${Math.atan2(Qe,Ge)*(180/Math.PI)}deg)`,Ye<=L||pe-Ee>=Oe){K(be,ce,re);return}requestAnimationFrame(Be)};if(requestAnimationFrame(Be),U&&!B&&dt()>=2&&q(!0)&&Math.random()<.45&&(clearTimeout(at),at=setTimeout(()=>{at=null,!(!m()||t.paused||v())&&ie({forceTracker:!0,fromPair:!0})},280+Math.random()*320)),!U&&!B&&!A){let pe=Ct(),Re=bt()-D(!1),He=Math.min(Re,pe<2?0:pe<5?1:2);if(He>0&&Math.random()<.35+Math.min(.4,pe*.04)){let We=1+(He>1&&Math.random()<.3+Math.min(.35,pe*.03)?1:0);for(let Ge=0;Ge<Math.min(We,He);Ge++){let Qe=90+Ge*(140+Math.random()*160),Ye=setTimeout(()=>{Je=Je.filter(Bt=>Bt!==Ye),!(!m()||t.paused||v())&&ie({forceGround:!0,fromPair:!0})},Qe);Je.push(Ye)}}}return!0}function ue(f,A){return c.inflate(f,A)}function xe(f){return{left:f.left+X(),top:f.top+J(),right:f.right+X(),bottom:f.bottom+J()}}function we(){let f=document.querySelectorAll('a, button, input, select, textarea, label, summary, [role="link"], [role="button"]'),A=[];return f.forEach(B=>{if(B.closest(".cylon-battlefield")||B.classList.contains("cylon-bot")||B.closest("#cylon-reticle")||B.closest(".cylon-settings"))return;let U=B.getBoundingClientRect();U.width<2||U.height<2||A.push(ue(xe(U),Z))}),A}function ye(){let f=document.querySelector(".site-nav");return c.visibleBounds({scrollX:X(),scrollY:J(),width:document.documentElement.clientWidth||window.innerWidth||1,height:window.innerHeight||1,navBottom:f?f.getBoundingClientRect().bottom:70},H)}function Ce(f,A){return c.clampToBounds(ye(),f,A)}function ne(f,A){return c.isInBounds(ye(),f,A)}function Y(f,A,B){return c.isSafeSpot(f,A,B,Ke(),H)}function _e(f){let A=f?{x:parseFloat(f.style.left)||0,y:parseFloat(f.style.top)||0}:null;return c.findSafeSpot({bounds:ye(),forbidden:we(),doc:Ke(),bot:H},A,Math.random)}function tt(f,A,B,U){x.sfx("projectile");let ee=document.createElement("div");ee.className="cylon-bolt",ee.setAttribute("aria-hidden","true");let oe=B-f,fe=U-A,j=Math.hypot(oe,fe)||1,ge=Math.atan2(fe,oe)*(180/Math.PI);ee.style.left=`${f}px`,ee.style.top=`${A}px`,ee.style.width=`${Math.min(j,28)}px`,ee.style.transform=`rotate(${ge}deg)`,l.appendChild(ee);let ce=Math.min(.55,.18+j/1800)*1e3,re=performance.now(),be=re,Ee=!1,Te=(Re,He,{struck:We=!1}={})=>{Ee||(Ee=!0,ee.remove(),De(Re,He,{sound:!1}),We&&P())},Be=ee.animate([{left:`${f}px`,top:`${A}px`,opacity:1,width:"14px"},{left:`${B}px`,top:`${U}px`,opacity:.85,width:"22px"}],{duration:ce,easing:"linear",fill:"forwards"}),pe=Re=>{if(Ee)return;if(!n.gameEnabled||t.run.gameOver){try{Be.cancel()}catch{}Te(B,U,{struck:!1});return}if(t.paused){re+=Re-be,be=Re;try{Be.pause()}catch{}requestAnimationFrame(pe);return}try{Be.playState==="paused"&&Be.play()}catch{}be=Re;let He=Math.min(1,(Re-re)/ce),We=f+(B-f)*He,Ge=A+(U-A)*He;if(R(),Math.hypot(o.pageX-We,o.pageY-Ge)<=te){try{Be.cancel()}catch{}Te(We,Ge,{struck:!0});return}He<1&&requestAnimationFrame(pe)};requestAnimationFrame(pe),Be.onfinish=()=>{if(Ee)return;R();let Re=Math.hypot(o.pageX-B,o.pageY-U)<=me;Te(B,U,{struck:Re})}}function De(f,A,{sound:B=!0}={}){if(!l)return;B&&n.soundEnabled&&(x.prime(),x.sfx("projectile"));let U=document.createElement("div");U.className="cylon-impact",U.style.left=`${f}px`,U.style.top=`${A}px`,U.setAttribute("aria-hidden","true"),l.appendChild(U),S(f,A,g.small),E(f,A,Ue),setTimeout(()=>U.remove(),300)}function Ne(f){return!f||!f.closest?!0:!!(f.closest(".site-nav")||f.closest(".cylon-help")||f.closest(".cylon-gameover")||f.closest(".cylon-settings-panel")||f.closest(".cylon-bot")||f.closest("#cylon-reticle")||f.closest("#cic-enter-btn"))}function vt(){window.addEventListener("pointerdown",f=>{m()&&(C.grenadeArmed()||u.playing()||f.button!=null&&f.button!==0||t.reticlePointerId!=null&&f.pointerId===t.reticlePointerId||Ne(f.target)||(f.preventDefault(),De(f.pageX,f.pageY)))})}function it(){t.run=a.recordKill(t.run),h&&(h.textContent=String(t.run.koScore),h.classList.remove("is-bump"),h.offsetWidth,h.classList.add("is-bump"),setTimeout(()=>h.classList.remove("is-bump"),180))}function ae(f){f._shootInterval&&clearInterval(f._shootInterval),f._patrolInterval&&clearInterval(f._patrolInterval),f._shootInterval=null,f._patrolInterval=null}function ze(f){if(f.dataset.ko==="1")return;f.dataset.ko="1",f.classList.add("is-ko"),ae(f),x.sfx("ko");let A=(parseFloat(f.style.left)||0)+H.w/2,B=(parseFloat(f.style.top)||0)+H.h/2;De(A,B,{sound:!1}),it(),de=Math.max(0,de-1),setTimeout(()=>f.remove(),560)}function qe(){et().forEach(f=>{ae(f),f.remove()}),l.querySelectorAll(".cylon-bolt, .cylon-impact").forEach(f=>f.remove()),b.clearAll(),de=0}function Lt(){et().forEach((A,B)=>{setTimeout(()=>{A.isConnected&&A.dataset.ko!=="1"&&ze(A)},B*70)}),l.querySelectorAll(".cylon-bolt").forEach(A=>A.remove())}function $t(f){return c.marchOrigin(ye(),f,H)}function nt(f){let A=we(),B=parseFloat(f.style.left)||0,U=parseFloat(f.style.top)||0;if(!ne(B,U)||!Y(B,U,A)){let ee=_e(f);return ee?(f.style.left=`${ee.x}px`,f.style.top=`${ee.y}px`,!0):!1}return!0}function nn(f){if(!m()||f.dataset.ko==="1"||!f.isConnected||f.classList.contains("is-marching"))return;let A=_e(f);if(!A)return;let B=Ce(A.x,A.y);f.classList.add("is-marching"),f.style.left=`${B.x}px`,f.style.top=`${B.y}px`,setTimeout(()=>{!f.isConnected||f.dataset.ko==="1"||(f.classList.remove("is-marching"),nt(f))},920)}function In(){m()&&et().forEach(f=>{if(f.dataset.ko==="1"||!f.isConnected||f.classList.contains("is-hiding"))return;let A=parseFloat(f.style.left)||0,B=parseFloat(f.style.top)||0;ne(A,B)||nn(f)})}function Rt(){let f=document.querySelector("#nav-main.is-active, #nav-contact.is-active")||document.getElementById("nav-main");if(!f)return null;let A=[...f.querySelectorAll("h1, h2, h3, p, li")];if(!A.length)return null;let B=A.filter(ee=>{let oe=ee.getBoundingClientRect();return oe.width>8&&oe.height>8&&oe.bottom>60&&oe.top<(window.innerHeight||1)-20&&oe.right>0&&oe.left<(window.innerWidth||1)}),U=B.length?B:A;for(let ee=0;ee<12;ee++){let fe=U[Math.floor(Math.random()*U.length)].getBoundingClientRect();if(fe.width<8||fe.height<8)continue;let j=xe(fe),ge=j.left+Math.random()*Math.max(8,j.right-j.left-H.w),ce=j.top+Math.random()*Math.max(4,Math.min(j.bottom-j.top,H.h)*.65);return{x:ge,y:ce}=Ce(ge,ce),{x:ge,y:ce,edge:"ambush"}}return null}function Pt(f){let A=()=>{if(!m()||f.dataset.ko==="1"||!f.isConnected||f.classList.contains("is-marching"))return;if(!nt(f)){ae(f),f.remove(),de=Math.max(0,de-1);return}let B=parseFloat(f.style.left)||0,U=parseFloat(f.style.top)||0;R(),tt(B+H.w/2,U+H.h*.35,o.pageX,o.pageY)};setTimeout(A,200+Math.random()*400),f._shootInterval=setInterval(A,1500+Math.random()*1100),f._patrolInterval=setInterval(()=>nn(f),2200+Math.random()*1800)}function xt(){return i.botCap(t.run.koScore,V)}function on(f){f.addEventListener("pointerdown",A=>{m()&&(f.classList.contains("is-hiding")||t.reticlePointerId!=null&&A.pointerId===t.reticlePointerId||A.pointerType==="mouse"&&A.button!=null&&A.button!==0||(A.preventDefault(),A.stopPropagation(),x.prime(),ze(f)))}),f.addEventListener("wheel",A=>{document.body.classList.contains("cylon-game-live")||window.scrollBy({top:A.deltaY,left:A.deltaX,behavior:"auto"})},{passive:!0})}function he(f){if(!(f.dataset.ko==="1"||!f.isConnected)){if(f.classList.remove("is-marching","is-hiding","is-emerging"),!nt(f)){ae(f),f.remove(),de=Math.max(0,de-1);return}Pt(f)}}function ut(){if(!m()||de>=xt())return!1;F();let A=Math.random()<.4&&d?Rt():null,B=document.createElement("button");if(B.type="button",B.title="Attack drone",B.setAttribute("aria-label","Attack hostile drone"),B.innerHTML='<span class="cylon-bot-body"></span><span class="cylon-bot-legs" aria-hidden="true"><span></span><span></span></span>',on(B),A)return B.className="cylon-bot is-hiding",B.style.left=`${A.x}px`,B.style.top=`${A.y}px`,d.appendChild(B),de+=1,setTimeout(()=>{if(B.dataset.ko==="1"||!B.isConnected||!m()){B.isConnected&&(ae(B),B.remove(),de=Math.max(0,de-1));return}l.appendChild(B),B.classList.remove("is-hiding"),B.classList.add("is-emerging"),setTimeout(()=>he(B),560)},700+Math.random()*900),!0;let U=_e();if(!U)return!1;let ee=$t(U);return B.className="cylon-bot is-marching",B.style.left=`${ee.x}px`,B.style.top=`${ee.y}px`,l.appendChild(B),de+=1,requestAnimationFrame(()=>{B.style.left=`${U.x}px`,B.style.top=`${U.y}px`}),setTimeout(()=>he(B),950),!0}function Le(){if(!m())return;let f=xt()-de;if(f<=0)return;let{isWave:A,count:B}=i.planWave(f,xt(),Math.random);for(let U=0;U<B;U++)setTimeout(()=>ut(),U*(A?380:0))}function wt(f=!1){clearTimeout(Me);let A=f?2500+Math.random()*2500:3500+Math.random()*4500;Me=setTimeout(()=>{m()&&Le(),wt(!1)},A)}function It(f,A,{dealDamage:B=!0,shake:U=!0}={}){if(!k)return;x.prime(),x.sfx("nuke");let ee=window.innerWidth||1,oe=window.innerHeight||1;k.style.setProperty("--nuke-x",`${f/ee*100}%`),k.style.setProperty("--nuke-y",`${A/oe*100}%`),k.classList.add("is-detonating"),U&&(document.body.classList.add("is-nuke-shake"),setTimeout(()=>document.body.classList.remove("is-nuke-shake"),600));let fe=f+window.scrollX,j=A+window.scrollY;S(fe,j,{radius:b.largeRadius(),holdMs:g.large.holdMs,fadeMs:g.large.fadeMs});let ge=3+Math.floor(Math.random()*3);for(let ce=0;ce<ge;ce++){let re=Math.random()*Math.PI*2,be=N(b.largeRadius()*.35,b.largeRadius()*.85),Ee=fe+Math.cos(re)*be,Te=j+Math.sin(re)*be;S(Ee,Te,{radius:N(48,110),holdMs:g.medium.holdMs,fadeMs:g.medium.fadeMs})}p(f,A,1),_.scattered()?_.reshuffle():(O(fe,j,1.45),setTimeout(()=>O(fe,j,1.2),220),setTimeout(()=>O(fe,j,.85),520)),B&&Math.hypot(o.clientX-f,o.clientY-A)<=ve&&P(1,{fromNuke:!0}),setTimeout(()=>k.classList.remove("is-detonating"),2500)}function Dt(){if(!m()||v()||t.nukeInFlight)return;if(!T){It(o.clientX,o.clientY);return}t.nukeInFlight=!0;let f=M(),A=f.x,B=f.y,U=o.clientX,ee=o.clientY,oe=!v(),fe=performance.now(),j=fe;T.style.left=`${A}px`,T.style.top=`${B}px`,T.classList.add("is-flying"),x.prime(),x.sfx("nukeLaunch");let ge=ce=>{if(t.paused||!n.gameEnabled||t.run.gameOver){if(fe+=ce-j,j=ce,!t.nukeInFlight)return;requestAnimationFrame(ge);return}let re=Math.min(.05,(ce-j)/1e3);j=ce,v()?oe&&(oe=!1):(oe=!0,U=o.clientX,ee=o.clientY);let be=U,Ee=ee,Te=be-A,Be=Ee-B,pe=Math.hypot(Te,Be)||1,Re=Ae*re;A+=Te/pe*Math.min(Re,pe),B+=Be/pe*Math.min(Re,pe),T.style.left=`${A}px`,T.style.top=`${B}px`;let He=Math.atan2(Be,Te)*(180/Math.PI);T.style.setProperty("--nuke-heading",`${He}deg`);let We=pe<=$e,Ge=ce-fe>=rt;if(We||Ge){T.classList.remove("is-flying"),t.nukeInFlight=!1,It(A,B);return}requestAnimationFrame(ge)};requestAnimationFrame(ge)}return{allBots:et,knockOutBot:ze,clearAllBots:qe,wipeAllBotsWithScore:Lt,herdBotsIntoView:In,scheduleAmbush:wt,bindPlayerMissShots:vt,canLaunchMissile:q,launchSmallMissile:ie,clearActiveMissiles:z,launchNuke:Dt,detonateNukeAt:It}}function Er(e){let t=e.weekStartsOn==="sunday"?"Sunday":"Monday",n=e.timezone==="America/Chicago"?"Central":e.timezone==="local"?"your time":String(e.timezone||"");return`Play often — scores reset every ${t} at midnight ${n}.`}function fn(e){return e.map((t,n)=>{let o=t.at?new Date(t.at):null,r=o&&!Number.isNaN(o.getTime())?o.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"}):"";return{rank:n+1,initials:(t.initials||"AAA").toString().slice(0,3).toUpperCase(),date:r,score:t.score}})}function pt(e){return typeof e=="object"&&e!==null}function Tr(e,t){let n=t.log??((g,m)=>console.error(g,m)),o="",r="",a=0,i=null,c=10,l=new Set,d=[],s=[];function k(g){return{"X-Cylon-CSRF":o,...g}}function T(g){if(!pt(g))return;let m=Number(g.maxScores);m>=1&&(c=m),Array.isArray(g.blockedInitials)&&(l.clear(),g.blockedInitials.forEach(v=>{let M=String(v||"").toUpperCase();/^[A-Z]{3}$/.test(M)&&l.add(M)}))}function h(g){pt(g)&&(Array.isArray(g.scores)&&(d=g.scores),Array.isArray(g.alltime)&&(s=g.alltime))}async function x(){try{let g=await t.fetch(e,{cache:"no-store",credentials:"same-origin",headers:k()});if(!g.ok)throw new Error("bad status");let m=await g.json();if(!pt(m))throw new Error("bad body");return typeof m.csrf=="string"&&m.csrf&&(o=m.csrf),T(m.config),d=Array.isArray(m.scores)?m.scores:[],s=Array.isArray(m.alltime)?m.alltime:[],pt(m.config)?m.config:null}catch{return null}}function u(){let g=++a;return r="",i=(async()=>{try{o||await x();let m=await t.fetch(e,{method:"POST",credentials:"same-origin",headers:k({"Content-Type":"application/json"}),body:JSON.stringify({op:"start"}),cache:"no-store"}),v=await m.json().catch(()=>null);if(g!==a)return;m.ok&&pt(v)&&typeof v.run=="string"&&(r=v.run)}catch(m){n("Cylon run token failed",m)}})(),i}function C(g,m=d){if(g<1)return!1;if(!m||m.length<c)return!0;let v=1/0;for(let M of m){let R=Number(M.score)||0;R<v&&(v=R)}return g>v}function b(g){let m=pt(g)?g.alltimeRank:null;return typeof m=="number"&&Number.isInteger(m)&&m>=1?m:null}function _(g){return l.has((g||"").toUpperCase())}async function S(g,m,v){if(!g||g<1)return{saved:!1,problem:null,allTimeRank:null};let M=(m||"AAA").toUpperCase().slice(0,3).padEnd(3,"A");if(_(M))return{saved:!1,problem:"invalid-initials",allTimeRank:null};try{if(i&&await i,!r)return{saved:!1,problem:"save-failed",allTimeRank:null};let R=await t.fetch(e,{method:"POST",credentials:"same-origin",headers:k({"Content-Type":"application/json"}),body:JSON.stringify({op:"score",score:g,hits:v,initials:M,run:r}),cache:"no-store"}),p=null;try{p=await R.json()}catch{p=null}return R.status===400&&pt(p)&&p.error==="invalid initials"?(h(p),{saved:!1,problem:"invalid-initials",allTimeRank:null}):R.ok?(r="",h(p),{saved:!0,problem:null,allTimeRank:b(p)}):(h(p),{saved:!1,problem:"save-failed",allTimeRank:null})}catch{return{saved:!1,problem:null,allTimeRank:null}}}return{board:()=>d,alltime:()=>s,qualifies:C,isBlocked:_,load:x,startRun:u,submit:S}}var Sr="cylon-local-scores",Jn=10;function Zi(e){let t=new Date(e.getFullYear(),e.getMonth(),e.getDate());return t.setDate(t.getDate()-t.getDay()),t.getTime()}function Ar(e,t=()=>new Date){let n=[];function o(){try{let l=JSON.parse(e?.getItem(Sr)??"[]");return Array.isArray(l)?l.filter(d=>pt(d)&&typeof d.score=="number"&&d.score>=1):[]}catch{return[]}}let r=l=>[...l].sort((d,s)=>s.score-d.score||Number(new Date(d.at??0))-Number(new Date(s.at??0))).slice(0,Jn),a=()=>r(n),i=()=>{let l=Zi(t());return r(n.filter(d=>Number(new Date(d.at??0))>=l))};n=o();function c(l,d=i()){return l<1?!1:d.length<Jn?!0:l>Math.min(...d.map(s=>s.score))}return{board:i,alltime:a,qualifies:c,isBlocked:()=>!1,async load(){return n=o(),{maxScores:Jn,weekStartsOn:"sunday",timezone:"local"}},async startRun(){},async submit(l,d,s){if(!l||l<1)return{saved:!1,problem:null,allTimeRank:null};let T={initials:(d||"AAA").toUpperCase().slice(0,3).padEnd(3,"A"),score:l,at:t().toISOString()};n=[...o(),T];let h=new Set([...a(),...i()]);n=n.filter(u=>h.has(u));try{e?.setItem(Sr,JSON.stringify(n))}catch{}let x=a().indexOf(T);return{saved:!0,problem:null,allTimeRank:x>=0?x+1:null}}}}var le,Rr,es,mt,Mr,vn,Pr,yn,Ir,Zn,Qn,ts,xn={},wn=[],ns=/^m(i|n|o|s|text|space)$/,eo=Array.isArray,Dr=wn.slice,Et=Object.assign;function kn(e){e&&e.parentNode&&e.remove()}function gn(e,t,n,o,r){var a={type:e,props:t,key:n,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:r||++Rr,__i:-1,__u:0};return!r&&le.vnode&&le.vnode(a),a}function je(e){return e.children}function bn(e,t){this.props=e,this.context=t,this.__g=0}function ft(e,t){if(t==null)return e.__?ft(e.__,e.__i+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])&&n.__e)return n.__e;return typeof e.type!="function"||e.props.__P?null:ft(e)}function Br(e){if((e=e.__)&&e.__c&&!e.props.__P)return e.__e=null,e.__k.some(function(t){return t&&(e.__e=t.__e)}),Br(e)}function Cr(e){(8&e.__g||!(e.__g|=8)||!mt.push(e)||vn++)&&Mr==le.debounceRendering||((Mr=le.debounceRendering)||queueMicrotask)(os)}function os(){var e,t,n,o,r,a,i,c,l;try{for(t=1;mt.length;)mt.length>t&&mt.sort(Pr),e=mt.shift(),t=mt.length,8&e.__g&&(o=void 0,r=void 0,a=(r=(n=e).__v).__e,i=[],c=[],(l=n.__P)&&((o=Et({constructor:void 0},r)).__v=r.__v+1,le.vnode&&le.vnode(o),to(l,o,r,n.__n,l.namespaceURI,32&r.__u?[a]:null,i,a||ft(r),32&r.__u,c),o.__v=r.__v,o.__.__k[o.__i]=o,Nr(i,o,c),r.__=r.__e=null,o.__e!=a&&Br(o)))}finally{mt.length=vn=0}}function Fr(e,t,n,o,r,a,i,c,l,d,s){var k,T,h,x,u,C,b=o.__k||wn,_=t.length;for(l=rs(n,t,b,l,_),k=0;k<_;k++)(h=n.__k[k])!=null&&(T=~h.__i&&b[h.__i]||xn,h.__i=k,C=to(e,h,T,r,a,i,c,l,d,s),x=h.__e,(T.ref!=h.ref||8&T.__u)&&(T.ref&&no(T.ref,null,h,T),h.ref&&s.push(h.ref,h.__c||x,h)),u=u||x,4&h.__u?(l=Hr(h,l,e,!T.__v),T.__e&&(T.__e=null)):typeof h.type=="function"&&C!==void 0?l=C:x&&(l=x.nextSibling),h.__u&=-7);return n.__e=u,l}function rs(e,t,n,o,r){var a,i,c,l,d,s,k,T,h,x,u=n.length,C=u,b=0,_=!1,S=e.__k=Array(r);for(a=0;a<r;a++)(i=t[a])!=null&&typeof i!="boolean"&&typeof i!="function"?(typeof i!="object"||i.constructor==String?i=S[a]=gn(null,i):eo(i)?i=S[a]=gn(je,{children:i}):i.constructor===void 0&&i.__b?i=S[a]=gn(i.type,i.props,i.key,i.ref,i.__v):S[a]=i,l=a+b,i.__=e,i.__b=e.__b+1,c=null,~(d=i.__i=as(i,n,l,C))&&(C--,(c=n[d])&&(c.__u|=2)),c&&c.__v?(i.__u|=2,d==l-1?b--:d==l+1?b++:d!=l&&(d>l?b--:b++,_=!0)):(~d||(r>u?b--:r<u&&b++),typeof i.type!="function"&&(i.__u|=4))):S[a]=null;if(_){for(s=[],k=[],a=0;a<r;a++)if((i=S[a])&&2&i.__u){for(T=0,h=s.length;T<h;)s[x=T+h>>1]<i.__i?T=x+1:h=x;s[T]=i.__i,k[a]=T+1}for(b=s.length;a--;)k[a]&&(k[a]==b?b--:S[a].__u|=4)}if(C)for(a=0;a<u;a++)!(c=n[a])||2&c.__u||(c.__e==o&&(o=ft(c)),oo(c,c));return o}function Hr(e,t,n,o){var r,a,i;if(typeof e.type=="function"){if(e.props.__P)return t;if(r=e.__k)for(a=0;a<r.length;a++)r[a]&&(r[a].__=e,t=Hr(r[a],t,n,!1));return t}for(t&&!t.parentNode&&(t=ft(e))&&!t.parentNode&&(t=null),i=t;i&&i.nodeType==8;)i=i.nextSibling;for(e.__e!=i&&(!o&&n.moveBefore&&e.__e.parentNode?n.moveBefore(e.__e,t):n.insertBefore(e.__e,t||null)),t=e.__e;(t=t&&t.nextSibling)&&t.nodeType==8;);return t}function as(e,t,n,o){var r,a,i,c=e.key,l=e.type,d=t[n],s=d&&!(2&d.__u);if(d===null&&c==null||s&&c==d.key&&l==d.type)return n;if(o>(s?1:0)){for(r=n-1,a=n+1;r>=0||a<t.length;)if((d=t[i=r>=0?r--:a++])&&!(2&d.__u)&&c==d.key&&l==d.type)return i}return-1}function Lr(e,t,n){n==null&&(n=""),t[0]=="-"?e.setProperty(t,n):e[t]=n}function hn(e,t,n,o,r){var a,i;e:if(t=="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof o=="string"&&(e.style.cssText=o=""),o)for(t in o)n&&t in n||Lr(e.style,t,"");if(n)for(t in n)o&&n[t]==o[t]||Lr(e.style,t,n[t])}else if(t[0]=="o"&&t[1]=="n")(e.__e||(e.__e={}))[t]=n,n&&o||(i=Qn[t]||(Qn[t]=is(t)),(e.__a||(e.__a={}))[t]=Zn,a=t!=(t=t.replace(Ir,"$1")),(t=t.slice(2))[0]<"a"&&(t=t.toLowerCase()),n?e.addEventListener(t,i,a):e.removeEventListener(t,i,a));else{if(r=="http://www.w3.org/2000/svg")t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!="width"&&t!="height"&&t!="href"&&t!="list"&&t!="form"&&t!="tabIndex"&&t!="download"&&t!="rowSpan"&&t!="colSpan"&&t!="role"&&t!="popover"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!="-"?e.removeAttribute(t):e.setAttribute(t,t=="popover"&&n==1?"":n))}}function is(e){return function(t){if(this.__e){var n=this.__e[e];if(t[yn]==null)t[yn]=Zn++;else if(t[yn]<this.__a[e])return;return n(le.event?le.event(t):t)}}}function to(e,t,n,o,r,a,i,c,l,d){var s,k,T,h,x,u,C,b,_,S,g,m,v,M,R,p,E,O,N,P,F=t.type;if(t.constructor!==void 0)return null;if(128&n.__u&&(l=32&n.__u,s=n.__c.__z)){if(t.__u|=l,k=a=[],s.nodeType==8)for(T=1,h=s.nextSibling;h;h=h.nextSibling){if(h.nodeType==8){if(h.data.startsWith("$s"))T++;else if(h.data.startsWith("/$s")&&!--T)break}a.push(h)}else a.push(s);c=a[0]}(s=le.__b)&&s(t);e:if(typeof F=="function"){x=i.length;try{if(S=t.props,g=(s=F.prototype)&&s.render,m=(s=F.contextType)&&o[s.__c],v=s?m?m.props.value:s.__:o,n.__c?2&(u=t.__c=n.__c).__g&&(u.__g|=1):(g?t.__c=u=new F(S,v):(t.__c=u=new bn(S,v),u.constructor=F,u.render=ls),m&&m.sub(u),u.state||(u.state={}),u.__n=o,u.__g|=8,u.__h=[],u.__k=[]),g&&(u.__s||(u.__s=u.state),F.getDerivedStateFromProps&&(u.__s==u.state&&(u.__s=Et({},u.__s)),Et(u.__s,F.getDerivedStateFromProps(S,u.__s)))),C=u.props,b=u.state,u.__v=t,n.__c){if(g&&!F.getDerivedStateFromProps&&S!==C&&u.componentWillReceiveProps&&u.componentWillReceiveProps(S,v),t.__v==n.__v&&!(8&u.__g)||!(4&u.__g)&&u.shouldComponentUpdate&&u.shouldComponentUpdate(S,u.__s,v)===!1){t.__v!=n.__v&&(u.props=S,u.state=u.__s,u.__g&=-9),t.__e=n.__e,t.__k=n.__k,t.__k.some(function(X){X&&(X.__=t)}),wn.push.apply(u.__h,u.__k),u.__k=[],u.__h.length&&i.push(u),c=ft(n);break e}u.componentWillUpdate&&u.componentWillUpdate(S,u.__s,v),g&&u.componentDidUpdate&&u.__h.push(function(){u.componentDidUpdate(C,b,_)})}else g&&!F.getDerivedStateFromProps&&u.componentWillMount&&u.componentWillMount(),g&&u.componentDidMount&&u.__h.push(u.componentDidMount);if(u.context=v,u.props=S,u.__P=e,u.__g&=-5,M=le.__r,R=0,g)u.state=u.__s,u.__g&=-9,M&&M(t),s=u.render(u.props,u.state,u.context),wn.push.apply(u.__h,u.__k),u.__k=[];else do u.__g&=-9,M&&M(t),s=u.render(u.props,u.state,u.context),u.state=u.__s;while(8&u.__g&&++R<25);u.state=u.__s,u.getChildContext&&(o=Et({},o,u.getChildContext())),g&&n.__c&&u.getSnapshotBeforeUpdate&&(_=u.getSnapshotBeforeUpdate(C,b)),p=s&&s.type===je&&s.key==null?s.props.children:s,S.__P&&(s=c,r=(e=S.__P).namespaceURI,l=a=null,n.props&&n.props.__P!=e&&(n.__k.some(function(X){X&&oo(X,X)}),n.__k=null),c=n.__k?ft(n,0):null),c=Fr(e,eo(p)?p:[p],t,n,o,r,a,i,c,l,d),S.__P&&(t.__e=null,c=s),t.__u&=-161,128&n.__u&&(u.__z=null),k&&k.some(kn),u.__h.length&&i.push(u),1&u.__g&&(u.__g&=-4)}catch(X){if(i.length=x,t.__v=null,l||a)if(X.then){if(E=0,t.__u|=l?160:128,a){for(~(N=a.indexOf(c||void 0))||(N=a.length);(P=a[N-1])&&P.nodeType==8;)N--;for(;N<a.length;N++)if(P=a[N]){if(a[N]=null,P.nodeType==8){if(P.data.startsWith("$s"))E++||(O=P);else if(E&&P.data.startsWith("/$s")&&!--E){c=P;break}}else if(!E)break}}if(!O){for(;c&&c.nodeType==8&&c.nextSibling;)c=c.nextSibling;O=c}t.__c.__z||(t.__c.__z=O),t.__e=c}else a&&a.some(kn);else t.__e=n.__e;t.__k||(t.__k=n.__k||[]),X.then||Or(t),le.__e(X,t,n)}}else c=t.__e=ss(n.__e,t,n,o,r,a,i,l,d,e);return(s=le.diffed)&&s(t),128&t.__u?void 0:c}function Or(e){e&&(e.__c&&(e.__c.__g|=4),e.__k&&e.__k.some(Or))}function Nr(e,t,n){for(var o=0;o<n.length;)no(n[o++],n[o++],n[o++]);le.__c&&le.__c(t,e),e.some(function(r){try{e=r.__h,r.__h=[],e.some(function(a){a.call(r)})}catch(a){le.__e(a,r.__v)}})}function ss(e,t,n,o,r,a,i,c,l,d){var s,k,T,h,x,u,C,b,_,S=n.props||xn,g=t.props,m=t.type;if(m=="svg"?r="http://www.w3.org/2000/svg":m=="math"?r="http://www.w3.org/1998/Math/MathML":r||(r="http://www.w3.org/1999/xhtml"),a){for(s=0;s<a.length;s++)if((x=a[s])&&(m?x.localName==m:x.nodeType==3)){e=x,a[s]=null;break}}if(!e){if(b=d.ownerDocument||document,!m)return b.createTextNode(g);e=b.createElementNS(r,m,g.is&&g),c&&(le.__m&&le.__m(t,a),c=!1),a=null}if(m){if(d=m=="template"?e.content:e,a=m=="textarea"&&g.defaultValue!=null?null:a&&Dr.call(d.childNodes),!c&&a)for(S={},s=0;s<e.attributes.length;s++)S[(x=e.attributes[s]).name]=x.value;for(s in S)x=S[s],s=="dangerouslySetInnerHTML"?T=x:s=="children"||s in g||s=="value"&&"defaultValue"in g||s=="checked"&&"defaultChecked"in g||hn(e,s,null,x,r);for(s in _=1&n.__u,g)x=g[s],s=="children"?h=x:s=="dangerouslySetInnerHTML"?k=x:s=="value"?u=x:s=="checked"?C=x:c&&typeof x!="function"||!(S[s]!==x||_&&x!=null)||hn(e,s,x,S[s],r);k?(c||T&&(k.__html==T.__html||k.__html==e.innerHTML)||(e.innerHTML=k.__html),t.__k=[]):(T&&(e.textContent=""),(m=="foreignObject"||r=="http://www.w3.org/1998/Math/MathML"&&ns.test(m))&&(r="http://www.w3.org/1999/xhtml"),Fr(d,eo(h)?h:[h],t,n,o,r,a,i,a?a[0]:n.__k&&ft(n,0),c,l),a&&a.some(kn)),c&&m!="textarea"||(s="value",m=="progress"&&u==null?e.removeAttribute(s):u==null||u===e[s]&&(m!="progress"||u)||hn(e,s,u,S[s],r),s="checked",C!=null&&C!=e[s]&&hn(e,s,C,S[s],r))}else S===g||c&&e.data==g||(e.data=g);return e}function no(e,t,n,o){try{typeof e=="function"?t?t.__x=e(t)||1:o&&(o=o.__c||o.__e)&&(t=o.__x)&&(o.__x=null,typeof t=="function"?t():e(null)):e.current=t}catch(r){le.__e(r,n)}}function oo(e,t,n){var o,r;if(le.unmount&&le.unmount(e),!(o=e.ref)||o.current&&o.current!=e.__e||no(o,null,t,e),o=e.__c){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(a){le.__e(a,t)}o.__P=o.__n=null}if(o=e.__k)for(r=0;r<o.length;r++)o[r]&&oo(o[r],t,typeof e.type!="function"||n&&!e.props.__P);(o=e.__e)&&(n||kn(o),o.__e&&(o.__e=null)),e.__e=e.__c=e.__=null}function ls(e,t,n){return this.constructor(e,n)}function ct(e,t){var n,o,r,a;le.__&&le.__(e,t),t.nodeType==9&&(t=t.documentElement),o=(n=e&&32&e.__u)?null:t.__k,t.__k=gn(je,{children:[e]}),r=[],a=[],to(t,t.__k,o||xn,xn,t.namespaceURI,o?null:t.firstChild?Dr.call(t.childNodes):null,r,o?o.__e:t.firstChild,n,a),Nr(r,t.__k,a),t.__k.props.children=null}le={__e:function(e,t,n,o){for(var r,a,i;t=t.__;)if((r=t.__c)&&!(1&r.__g)){r.__g|=4;try{if((a=r.constructor)&&a.getDerivedStateFromError&&(r.setState(a.getDerivedStateFromError(e)),i=8&r.__g),r.componentDidCatch&&(r.componentDidCatch(e,o||{}),i=8&r.__g),i)return void(r.__g|=2)}catch(c){e=c,i=0}}throw vn=0,e}},Rr=0,es=function(e){return e!=null&&e.constructor===void 0},bn.prototype.setState=function(e,t){var n=this.__s;n&&n!=this.state||(n=this.__s=Et({},this.state)),typeof e=="function"&&(e=e(Et({},n),this.props)),e&&(Et(n,e),this.__v&&(t&&this.__k.push(t),Cr(this)))},bn.prototype.forceUpdate=function(e){this.__v&&(this.__g|=4,e&&this.__h.push(e),Cr(this))},bn.prototype.render=je,mt=[],vn=0,Pr=function(e,t){return e.__v.__b-t.__v.__b},yn=Symbol(),Ir=/(PointerCapture)$|Capture$/i,Zn=0,Qn={},ts=0;var _n,Ve,ro,qr,cs=Object.is,ao=0,Yr=[],io=[],ke=le,Gr=ke.__b,Vr=ke.__r,zr=ke.diffed,$r=ke.__c,Ur=ke.unmount,Xr=ke.__;function jr(e,t){ke.__h&&ke.__h(Ve,e,ao||t),ao=0;var n=Ve.__H||(Ve.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({}),n.__[e]}function Tt(e,t){var n=jr(_n++,4);!ke.__s&&Jr(n.__H,t)&&(n.__P=!1,n.__=e,n.u=t,Ve.__h.push(n))}function At(e){return ao=5,ds(function(){return{current:e}},[])}function ds(e,t){var n=jr(_n++,7);return Jr(n.__H,t)&&(n.__=e(),n.__H=t),n.__}function us(){var e;do{for(;e=io.shift();)try{Wt(e)}catch(n){ke.__e(n,{__:(e=e.__P)&&e.__v})}for(;e=Yr.shift();){var t=e.__H;if(e.__P&&t)try{t.__h.some(Wt),t.__h.some(so),t.__h=[]}catch(n){t.__h=[],ke.__e(n,e.__v)}}}while(io.length)}ke.__b=function(e){Ve=null,Gr&&Gr(e)},ke.__=function(e,t){e&&t.__k&&t.__k.__m&&(e.__m=t.__k.__m),Xr&&Xr(e,t)},ke.__r=function(e){Vr&&Vr(e),_n=0;var t=(Ve=e.__c).__H;t&&(ro==Ve?Ve.__h=[]:(t.__h.some(Wt),t.__h.some(so),_n=0),t.__h=[],t.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})),ro=Ve},ke.diffed=function(e){zr&&zr(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&Wr(Yr.push(t)),t.__H.__.some(function(n){n.u&&(n.__H=n.u)})),ro=Ve=null},ke.__c=function(e,t){t.some(function(n){try{n.__h.some(Wt),n.__h=n.__h.filter(function(o){return!o.__||so(o)})}catch(o){t.some(function(r){r.__h&&(r.__h=[])}),t=[],ke.__e(o,n.__v)}}),$r&&$r(e,t)},ke.unmount=function(e){Ur&&Ur(e);var t,n,o=e.__c;o&&o.__H&&(o.__H.__.some(function(r){try{if(r.__P&&r.__c){if(n===void 0){for(n=e.__;n&&(!n.__c||!n.__c.__P);)n=n.__;n=n&&n.__c}r.__P=n,Wr(io.push(r))}else Wt(r)}catch(a){t=a}}),o.__H=void 0,t&&ke.__e(t,o.__v))};var Kr=typeof requestAnimationFrame=="function";function ps(e){var t,n=function(){clearTimeout(o),Kr&&cancelAnimationFrame(t),setTimeout(e)},o=setTimeout(n,35);Kr&&(t=requestAnimationFrame(n))}function Wr(e){e!=1&&qr==ke.requestAnimationFrame||((qr=ke.requestAnimationFrame)||ps)(us)}function Wt(e){var t=Ve,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),Ve=t}function so(e){var t=Ve;e.__c=e.__(),Ve=t}function Jr(e,t){return!e||e.length!=t.length||t.some(function(n,o){return!cs(n,e[o])})}var ms=0;function y(e,t,n,o,r,a){t||(t={});var i,c,l=t;if("ref"in l&&typeof e!="function")for(c in l={},t)c=="ref"?i=t[c]:l[c]=t[c];var d={type:e,props:l,key:n,ref:i,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--ms,__i:-1,__u:0};return(r||a)&&(d.__source=r,d.__self=a),le.vnode&&le.vnode(d),d}function qt({label:e,class:t,at:n,decorative:o,variant:r}){let a=r==="tab"?t?`kit-key-tab ${t}`:"kit-key-tab":t??"kit-key-chip";return y("kbd",{class:a,"data-keyhint":n,"aria-hidden":o?"true":void 0,children:e})}var lo=null;function Qr(){return lo}function ot(e){return y("button",{type:"button",id:e.id,class:e.class,disabled:e.disabled,"aria-label":e.label,title:e.title,"aria-pressed":e.pressed,role:e.checked===void 0?void 0:"switch","aria-checked":e.checked,onClick:t=>{lo=t.currentTarget,t.currentTarget.blur(),e.onClick(),setTimeout(()=>{lo=null},0)},children:[e.children,e.keyLabel?y(qt,{label:e.keyLabel,variant:"tab",class:"kit-key-inline",decorative:!0}):null]})}var fs=new Set(["button","input","select","textarea"]);function hs(e){if(e.hidden||e.inert||e.getAttribute("inert")!=null||e.style&&e.style.display==="none")return!0;if(typeof getComputedStyle=="function")try{if(getComputedStyle(e).display==="none")return!0}catch{}return!1}function Zr(e){let t=[],n=(o,r)=>{let a=!1;for(let i of Array.from(o.children)){if(i.nodeType!==1)continue;let c=i,l=(c.localName||"").toLowerCase(),d=l==="legend"&&!a;if(l==="legend"&&(a=!0),hs(c))continue;let s=c.getAttribute("tabindex"),k=s!=null?Number(s)>=0:fs.has(l)||l==="a"&&c.getAttribute("href")!=null,T=r&&!d;k&&!T&&!c.disabled&&t.push(c),n(c,T||l==="fieldset"&&c.disabled===!0)}};return n(e,!1),t}function ys(e,t){for(let n=t;n;n=n.parentNode)if(n===e)return!0;return!1}function Gt(e){let t=At(null),n=At(null),o=At(!1),r=At(!1),a=()=>{n.current?.focus?.(),n.current=null};return Tt(()=>{if(e.open&&!o.current){let i=document.activeElement;n.current=i&&i!==document.body?i:Qr();let c=e.focusId?document.getElementById(e.focusId):null,l=t.current?Zr(t.current).find(d=>d.localName==="button"):void 0;(c??l??t.current)?.focus?.()}else!e.open&&o.current&&a();o.current=e.open},[e.open]),Tt(()=>()=>{o.current&&a()},[]),Tt(()=>{if(!e.open)return;let i=c=>{let l=t.current;if(c.key!=="Tab"||c.ctrlKey||c.altKey||c.metaKey||!l)return;let d=Zr(l),s=document.activeElement,k=ys(l,s);if(!d.length){c.preventDefault(),l.focus();return}let T=d[0],h=d[d.length-1],x=d.includes(s);(c.shiftKey?!k||!x||s===T:!k||!x||s===h)&&(c.preventDefault(),(c.shiftKey?h:T).focus())};return document.addEventListener("keydown",i,!0),()=>document.removeEventListener("keydown",i,!0)},[e.open]),Tt(()=>{let i=e.onDismiss;if(!e.open||!i)return;let c=l=>{!Ot(l)||Nt(l.target)||(l.preventDefault(),l.stopPropagation(),l.repeat||i())};return document.addEventListener("keydown",c,!0),()=>document.removeEventListener("keydown",c,!0)},[e.open,e.onDismiss]),y("div",{id:e.id,class:e.veilClass,hidden:!e.open,onPointerDown:i=>{r.current=i.target===i.currentTarget},onClick:i=>{let c=r.current&&i.target===i.currentTarget;r.current=!1,c&&e.onDismiss?.()},children:y("div",{class:e.panelClass,role:e.role??"dialog","aria-modal":"true","aria-labelledby":e.titleId,"aria-describedby":e.describedBy,tabIndex:-1,ref:t,children:[e.kicker!=null&&e.kicker!==!1&&y("p",{class:e.kickerClass,id:e.kickerId,children:e.kicker}),e.close!=null&&e.close!==!1?y("div",{class:"kit-dialog-head",children:[y("h2",{id:e.titleId,class:e.titleClass,children:e.title}),e.close]}):y("h2",{id:e.titleId,class:e.titleClass,children:e.title}),e.children]})})}function gs({rows:e}){return e.length?y(je,{children:e.map(t=>y("li",{children:[y("span",{class:"cylon-hs-rank",children:["#",t.rank]}),y("strong",{class:"cylon-hs-initials",children:t.initials}),y("span",{class:"cylon-hs-date",children:t.date}),y("span",{class:"cylon-hs-score",children:[t.score," KOs"]})]},t.rank))}):y("li",{class:"cylon-hs-empty",children:"No scores yet"})}function Sn({id:e,rows:t}){return y("ol",{class:"cylon-high-scores",id:e,children:y(gs,{rows:t})})}var Yt=[{board:"week",id:"cylon-tab-week",label:"This Week"},{board:"alltime",id:"cylon-tab-alltime",label:"All Time"}];function bs(e){let t=n=>o=>{if(o.key==="ArrowUp")e.onSpin(n,1);else if(o.key==="ArrowDown")e.onSpin(n,-1);else if(o.key==="ArrowLeft")e.onPick(n-1);else if(o.key==="ArrowRight"||o.key===" "||o.key==="Spacebar")n<2&&e.onPick(n+1);else if(o.key==="Enter")e.onSubmit();else return;o.preventDefault()};return y("div",{class:"cylon-initials",id:"cylon-initials",role:"group","aria-label":"Arcade initials",children:[0,1,2].map(n=>y("div",{class:"cylon-initial-slot",onWheel:o=>{o.preventDefault(),e.onSpin(n,o.deltaY<0?1:-1)},children:[y("button",{type:"button",class:"cylon-initial-spin","data-initial":n,"data-dir":"1","aria-label":`Scroll initial ${n+1} up`,onClick:()=>e.onSpin(n,1),children:"▲"}),y("button",{type:"button",class:n===e.active?"cylon-initial is-active":"cylon-initial",id:`cylon-initial-${n}`,"data-initial":n,"aria-label":`Initial ${n+1}, use up and down to change`,onClick:()=>e.onPick(n),onKeyDown:t(n),children:e.initials[n]}),y("button",{type:"button",class:"cylon-initial-spin","data-initial":n,"data-dir":"-1","aria-label":`Scroll initial ${n+1} down`,onClick:()=>e.onSpin(n,-1),children:"▼"})]},n))})}function vs(e){return y("div",{class:"cylon-hs-tabs",role:"tablist","aria-label":"High score board",children:Yt.map((t,n)=>y("button",{type:"button",class:"cylon-hs-tab",role:"tab",id:t.id,"data-board":t.board,"aria-selected":e.board===t.board?"true":"false",tabIndex:e.board===t.board?0:-1,"aria-controls":"cylon-gameover-panel",onClick:()=>e.onTab(t.board,!1),onKeyDown:o=>{let r=o.key==="ArrowRight"?1:o.key==="ArrowLeft"?-1:0,a=o.key==="Home"?0:o.key==="End"?Yt.length-1:-1,i=r?(n+r+Yt.length)%Yt.length:a;i<0||(o.preventDefault(),e.onTab(Yt[i].board,!0))},children:t.label},t.id))})}function xs(e){let t=e.board==="alltime"?"cylon-tab-alltime":"cylon-tab-week";return y(Gt,{open:e.open,id:"cylon-gameover",veilClass:"cylon-gameover",panelClass:"cylon-gameover-panel",kicker:"Cylon Defense",kickerClass:"cylon-gameover-kicker",titleId:"cylon-gameover-title",titleClass:"cylon-gameover-title",title:"Game Over",focusId:e.mode==="entry"?"cylon-initial-0":"cylon-play-again",children:[y("p",{class:"cylon-gameover-reason",id:"cylon-gameover-reason",children:e.reason}),y("p",{class:"cylon-gameover-stats",children:[y("span",{children:[y("em",{id:"cylon-gameover-kos",children:e.kos})," KOs"]}),y("span",{children:[y("em",{id:"cylon-gameover-hits",children:e.hp})," HP"]})]}),y("div",{class:"cylon-gameover-entry",id:"cylon-gameover-entry",hidden:e.mode!=="entry",children:[y("p",{class:"cylon-gameover-entry-label",children:"Enter Your Initials"}),y(bs,{...e}),y("p",{class:"cylon-gameover-entry-hint",children:"↑↓ change letter · ←→ next · Enter submit"}),y("p",{class:"cylon-gameover-entry-error",id:"cylon-initials-error",role:"alert",hidden:!e.error,children:e.error}),y("div",{class:"cylon-gameover-actions",children:[y(ot,{class:"cylon-gameover-btn",id:"cylon-score-submit",disabled:e.submitting,onClick:e.onSubmit,children:"Submit Score"}),y(ot,{class:"cylon-gameover-btn is-ghost",id:"cylon-score-skip",onClick:e.onSkip,children:"Skip"})]})]}),y("div",{class:"cylon-gameover-board",id:"cylon-gameover-board",hidden:e.mode!=="board",children:[y("p",{class:"cylon-gameover-entry-label",children:"High Scores"}),y("p",{class:"cylon-gameover-alltime",id:"cylon-gameover-alltime",role:"status",hidden:e.allTimeRank===null,children:e.allTimeRank===null?"":`New all-time #${e.allTimeRank}!`}),y(vs,{...e}),y("div",{role:"tabpanel",id:"cylon-gameover-panel","aria-labelledby":t,tabIndex:0,children:y(Sn,{id:"cylon-gameover-scores",rows:e.rows})}),y("p",{class:"cylon-gameover-entry-hint",id:"cylon-gameover-reset",children:e.resetText}),y(ot,{class:"cylon-gameover-btn",id:"cylon-play-again",onClick:e.onDismiss,children:e.quit?"Close":"Play Again"})]})]})}function ea(e,t){ct(y(xs,{...t}),e)}var ws={hits:()=>"You took too much fire. The eye cooked you.",nuke:()=>"A nuke landed on you. Frak.",quit:e=>e?"Run ended. Record your score?":"Run ended."};function ta(e){let{game:t,state:n,scores:o}=e,r=!1,a="",i=0,c=0,l="entry",d=["A","A","A"],s=0,k="",T=!1,h="week",x=null,u="Play often — scores reset every Sunday at midnight Central.";function C(){e.root&&ea(e.root,{open:r,reason:a,kos:i,hp:c,mode:l,initials:d,active:s,error:k,submitting:T,board:h,allTimeRank:x,rows:fn(h==="alltime"?o.alltime():o.board()),resetText:u,quit:t.run.endReason==="quit",onSpin:v,onPick:m,onSubmit:()=>{R()},onSkip:p,onTab:g,onDismiss:O})}let b=P=>{document.getElementById(P)?.focus({preventScroll:!0})};function _(){e.boardChanged(),C()}async function S(){let P=await o.load();P&&(u=e.weeklyResetText(P)),_()}function g(P,F){h=P,C(),F&&b(P==="alltime"?"cylon-tab-alltime":"cylon-tab-week")}function m(P){s=Math.max(0,Math.min(2,P)),C(),b(`cylon-initial-${s}`)}function v(P,F){let X=(d[P]??"A").charCodeAt(0)-65,J=String.fromCharCode(65+((X+F)%26+26)%26);d=d.map((V,H)=>H===P?J:V),k="",m(P)}function M(){l="board",C(),b("cylon-play-again"),S()}async function R(){if(T)return;let P=t.run.pendingScore?t.run.pendingScore.score:t.run.koScore,F=t.run.pendingScore?t.run.pendingScore.hits:t.run.hitsTaken;T=!0,x=null,C();let X=await o.submit(P,d.join(""),F);if(T=!1,X.saved){dn("score_submit"),k="",x=X.allTimeRank,t.run=n.clearPendingScore(t.run),M();return}X.problem==="invalid-initials"?k="Those initials aren't valid — choose another.":X.problem==="save-failed"&&(k="Could not save that score. Refresh and play again."),_()}function p(){t.run=n.clearPendingScore(t.run),M()}function E(){r=!1,l="entry",x=null,h="week",t.run=n.setEndReason(n.clearPendingScore(t.run),null),C()}function O(){if(t.run.endReason==="quit"){E(),t.run=n.clearGameOver(t.run),e.resetRunStats(),e.closed();return}e.setGameEnabled(!0)}async function N(P){if(!e.root)return;t.run=n.setEndReason(t.run,P),await S();let F=o.qualifies(t.run.koScore);F||(t.run=n.clearPendingScore(t.run)),a=ws[P](F),i=t.run.koScore,c=e.currentHp(),l=F?"entry":"board",d=["A","A","A"],s=0,k="",r=!0,C()}return{renderHighScores:_,fetchHighScores:S,hideGameOver:E,showGameOver:N,resetText:()=>u}}function na(e){return{parse(t){let n=JSON.parse(t);if(!e(n))throw new Error("unexpected shape");return n},stringify:t=>JSON.stringify(t)}}function oa(e,t,n,o){let r=new Set,a=null;function i(){if(a)return a.v;try{let c=o?.getItem(e);return c==null?t:n.parse(c)}catch{return t}}return{get:i,set(c){let l=!1;try{o&&(o.setItem(e,n.stringify(c)),l=!0)}catch{}a=l?null:{v:c};for(let d of r)d(c)},subscribe(c){return r.add(c),()=>r.delete(c)}}}var Vt={setTimeout:(e,t)=>window.setTimeout(e,t),clearTimeout:e=>window.clearTimeout(e),setInterval:(e,t)=>window.setInterval(e,t),clearInterval:e=>window.clearInterval(e)};function En(){try{return window.localStorage}catch{return null}}var ra="cylon-settings",co={gameEnabled:!1,soundEnabled:!0,musicEnabled:!0,soundVolume:50,musicVolume:50,eyeEnabled:!0};function aa(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function ks(e){let t=(o,r,a)=>y("label",{class:"cylon-setting",children:[y("input",{type:"checkbox","data-setting":o,checked:r,onChange:i=>e.onSetting(o,i.currentTarget.checked)}),y("span",{children:a})]}),n=(o,r,a,i)=>{let c=l=>e.onSetting(o,Number(l.currentTarget.value));return y("label",{class:"cylon-setting cylon-setting-slider",children:[y("span",{children:a}),y("input",{type:"range",min:"0",max:"100",step:"1",value:r,"data-setting":o,"aria-label":i,onInput:c,onChange:c})]})};return y(je,{children:[y("p",{class:"cylon-settings-title",children:"Options"}),t("soundEnabled",e.soundEnabled,"Sound Effects"),n("soundVolume",e.soundVolume,"SFX Volume","Sound effects volume"),t("musicEnabled",e.musicEnabled,"Music"),n("musicVolume",e.musicVolume,"Music Volume","Music volume"),t("eyeEnabled",e.eyeEnabled,"Eye Tracking"),y("p",{class:"cylon-settings-title cylon-settings-scores-title",children:"Weekly High Scores"}),y("p",{class:"cylon-settings-hint",id:"cylon-weekly-reset",children:e.resetText}),y(Sn,{id:"cylon-high-scores",rows:e.rows}),y("p",{class:"cylon-settings-hint",children:"Start with 30 HP — occasional nukes and small missiles (2 HP each). Last 10s without a hit to heal 1. Cyan/pink missiles chase you; orange locks where you just aimed. More drones as KOs rise. Drag the reticle to dodge · tap drones · Grenade / Raptor in the bar."})]})}function ia(e,t){ct(y(ks,{...t}),e)}function sa(e){let{settingsRoot:t,gameToggleBtn:n,gameToggleLabel:o,cicEnterBtn:r,navBurger:a,navMenu:i,navGame:c,siteBrand:l,BRAND_CIVIL:d,BRAND_COMBAT:s,NAV_FADE_MS:k,reduceMotion:T,settingsPanel:h,fetchHighScores:x,setGameEnabled:u,setEyeTracking:C}=e,b={settingChanged:V=>e.settingChanged(V)},_=co,S=oa(ra,co,na(aa),En()),g=Object.assign({},_,S.get());g.gameEnabled=!1,g.soundVolume=Math.max(0,Math.min(100,Number(g.soundVolume)||_.soundVolume)),g.musicVolume=Math.max(0,Math.min(100,Number(g.musicVolume)||_.musicVolume));let m=!1;g.soundVolume===85&&(g.soundVolume=50,m=!0),g.musicVolume===40&&(g.musicVolume=50,m=!0),m&&S.set(g);let v=0,M=null;function R(){S.set(g),p(),O()}function p(){h&&ia(h,{soundEnabled:g.soundEnabled,soundVolume:g.soundVolume,musicEnabled:g.musicEnabled,musicVolume:g.musicVolume,eyeEnabled:g.eyeEnabled,rows:e.boardRows(),resetText:e.resetText(),onSetting:E})}function E(V,H){V==="soundVolume"||V==="musicVolume"?typeof H=="number"&&(g[V]=Math.max(0,Math.min(100,H||0))):typeof H=="boolean"&&(g[V]=H),R(),V==="eyeEnabled"&&!g.eyeEnabled&&C(!1),b.settingChanged(V)}function O(){n&&(n.classList.toggle("is-on",g.gameEnabled),n.setAttribute("aria-pressed",g.gameEnabled?"true":"false"),o&&(o.textContent=g.gameEnabled?"Game On":"Game Off"))}function N(V){if(document.body.classList.toggle("cylon-nav-combat",V),l&&(l.textContent=V?s:d),c&&(c.hidden=!V),t&&(t.hidden=!V),r&&(r.hidden=V),!V){let H=document.getElementById("cylon-settings-panel"),Z=document.getElementById("cylon-settings-toggle");H&&!H.hidden&&(H.hidden=!0,Z&&Z.setAttribute("aria-expanded","false"))}}function P(){let V=!!g.gameEnabled,H=document.querySelector(".site-nav-inner"),Z=document.body.classList.contains("cylon-nav-combat");if(T||!H||Z===V){clearTimeout(M),M=null,H?.classList.remove("is-nav-fading"),N(V);return}let me=++v;clearTimeout(M),H.classList.add("is-nav-fading"),M=setTimeout(()=>{me===v&&(N(V),requestAnimationFrame(()=>{requestAnimationFrame(()=>{me===v&&(H.classList.remove("is-nav-fading"),M=null)})}))},k)}function F(){if(!a||!i)return;let V=()=>{i.classList.remove("is-open"),a.setAttribute("aria-expanded","false")};a.addEventListener("click",H=>{H.stopPropagation();let Z=!i.classList.contains("is-open");i.classList.toggle("is-open",Z),a.setAttribute("aria-expanded",Z?"true":"false")}),i.querySelectorAll("a.site-link").forEach(H=>{H.addEventListener("click",()=>V())}),document.addEventListener("click",H=>{i.classList.contains("is-open")&&(i.contains(H.target)||a.contains(H.target)||V())}),window.addEventListener("resize",()=>{window.matchMedia("(min-width: 820px)").matches&&V()})}function X(){n&&(O(),n.addEventListener("click",V=>{V.preventDefault(),V.stopPropagation(),u(!g.gameEnabled)}))}function J(){if(!t)return;p();let V=document.getElementById("cylon-settings-toggle"),H=h;!V||!H||(V.addEventListener("click",Z=>{Z.stopPropagation();let me=H.hasAttribute("hidden");me?(x(),H.removeAttribute("hidden")):H.setAttribute("hidden",""),V.setAttribute("aria-expanded",me?"true":"false")}),document.addEventListener("click",Z=>{t.contains(Z.target)||(H.setAttribute("hidden",""),V.setAttribute("aria-expanded","false"))}))}return{settings:g,saveSettings:R,syncGameToggleUi:O,syncNavChrome:P,renderSettings:p,bindSettings:J,bindGameToggle:X,bindNavMenu:F}}var _s=new Set([" ","Spacebar","PageUp","PageDown","Home","End","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"]),Ss='button, a[href], summary, label, [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="tab"], [role="radio"], [role="menuitem"]',Es=3;function Ts(e){return!!e.key&&_s.has(e.key)&&!e.ctrlKey&&!e.metaKey&&!e.altKey}function la(e){let{doc:t,win:n}=e,o=null,r=!1,a=null,i=(_,S)=>!!(_&&_.closest&&_.closest(S));function c(){let _=[],S=(g,m)=>{if(g.matches(e.touchFree)||g.matches(e.panels))return;let v=n.getComputedStyle(g).overflowY;if((v==="auto"||v==="scroll"||v==="overlay")&&g.scrollHeight>g.clientHeight+1&&_.push(g),!(m>=Es))for(let M of Array.from(g.children))S(M,m+1)};return t.body&&S(t.body,0),_}function l(){if(o)return;let _=t.documentElement,S=t.body,g=Math.max(0,n.innerWidth-_.clientWidth);if(o={x:n.scrollX,y:n.scrollY,gutter:_.style.getPropertyValue("scrollbar-gutter"),gutterPriority:_.style.getPropertyPriority("scrollbar-gutter"),padding:S.style.getPropertyValue("padding-right"),paddingPriority:S.style.getPropertyPriority("padding-right"),wrappers:c().map(m=>({el:m,top:m.scrollTop,left:m.scrollLeft}))},g>0)if(e.gutterStable)_.style.setProperty("scrollbar-gutter","stable","important");else{let m=parseFloat(n.getComputedStyle(S).paddingRight)||0;S.style.setProperty("padding-right",`${m+g}px`,"important")}for(let m of o.wrappers)m.el.classList.add("cylon-scroll-held");_.classList.add("cylon-scroll-held")}function d(){if(!o)return;let _=t.documentElement,S=t.body;_.classList.remove("cylon-scroll-held");for(let g of o.wrappers)g.el.classList.remove("cylon-scroll-held");o.gutter?_.style.setProperty("scrollbar-gutter",o.gutter,o.gutterPriority):_.style.removeProperty("scrollbar-gutter"),o.padding?S.style.setProperty("padding-right",o.padding,o.paddingPriority):S.style.removeProperty("padding-right"),o=null,s()}function s(){r=!1,a&&clearTimeout(a),a=null}function k(_,S){o&&(o.y=_,o.x=0,r=S,a&&clearTimeout(a),a=S?setTimeout(s,1500):null),n.scrollTo({top:_,left:0,behavior:S?"smooth":"instant"})}function T(_){if(!o||r)return;let S=_.target;if(S===t||S===t.documentElement||S===t.body){(n.scrollX!==o.x||n.scrollY!==o.y)&&n.scrollTo({top:o.y,left:o.x,behavior:"instant"});return}let g=o.wrappers.find(m=>m.el===S);g&&(g.el.scrollTop!==g.top||g.el.scrollLeft!==g.left)&&(g.el.scrollTop=g.top,g.el.scrollLeft=g.left)}function h(_){!e.live()||i(_.target,e.panels)||_.preventDefault()}function x(_){!e.live()||i(_.target,e.touchFree)||_.preventDefault()}function u(_){if(_.defaultPrevented||!e.live()||!Ts(_))return;let S=_.target;Nt(S)||i(S,e.panels)||i(S,"input, select, textarea")||(_.key===" "||_.key==="Spacebar")&&i(S,Ss)||_.preventDefault()}let C=!1;function b(){C||(C=!0,t.addEventListener("wheel",h,{passive:!1}),t.addEventListener("touchmove",x,{passive:!1}),n.addEventListener("keydown",u),t.addEventListener("scroll",T,{capture:!0,passive:!0}),n.addEventListener("scrollend",s,{passive:!0}))}return{hold:l,release:d,held:()=>o!==null,moveTo:k,bind:b}}function ca(){return y(je,{children:[y("li",{children:["Over time, expect occasional ",y("strong",{children:"nukes"})," and smaller ",y("strong",{children:"missiles"})," (each missile costs ",y("strong",{children:"2 HP"}),")."]}),y("li",{children:[y("strong",{children:"Cyan/pink"})," missiles chase you; ",y("strong",{children:"orange"})," ones aim where you just were."]}),y("li",{children:["Go ",y("strong",{children:"10 seconds"})," without taking a hit to ",y("strong",{children:"heal 1 HP"}),"."]}),y("li",{children:["More ",y("strong",{children:"drones"})," appear as your KO count rises."]})]})}function As(){return y("div",{class:"cylon-help-body",id:"cylon-help-desktop",children:y("ol",{children:[y("li",{children:["Flip ",y("strong",{children:"Game On"})," in the top bar."]}),y("li",{children:[y("strong",{children:"Move the mouse"})," to dodge bolts and nukes — the eye and drones track your cursor."]}),y("li",{children:[y("strong",{children:"Click drones"})," to KO them and score."]}),y("li",{children:[y("strong",{children:"Grenade"})," (",y(qt,{label:"G"}),"): arm, then click where you want the blast; ",y(qt,{label:"Q"})," puts it away."]}),y("li",{children:[y("strong",{children:"Raptor"})," (",y(qt,{label:"R"}),"): orbital strike that clears the field and dazes the eye."]}),y(ca,{}),y("li",{children:["You start with ",y("strong",{children:"30 HP"})," — hit 0, or take a nuke, then enter 3 initials for the board."]})]})})}function Ms(){return y("div",{class:"cylon-help-body",id:"cylon-help-mobile",children:y("ol",{children:[y("li",{children:["Flip ",y("strong",{children:"Game On"})," in the top bar."]}),y("li",{children:[y("strong",{children:"Drag the green reticle"})," with one finger to dodge. Drones and nukes aim at that reticle."]}),y("li",{children:["With your ",y("strong",{children:"other finger"}),", tap drones to KO them, or tap Grenade / Raptor / menu controls."]}),y("li",{children:[y("strong",{children:"Grenade"}),": tap the button to arm, then tap the page to throw."]}),y("li",{children:[y("strong",{children:"Raptor"}),": tap for a strike that clears drones and dazes the eye."]}),y(ca,{}),y("li",{children:["You start with ",y("strong",{children:"30 HP"})," — hit 0, or take a nuke, then scroll initials ▲▼ for the high-score board."]})]})})}function Cs(e){return y(Gt,{open:e.open,id:"cylon-help",veilClass:"cylon-help",panelClass:"cylon-help-panel",kicker:"Cylon Defense",kickerClass:"cylon-help-kicker",titleId:"cylon-help-title",titleClass:"cylon-help-title",title:"How to Play",focusId:"cylon-help-close",onDismiss:e.onClose,children:[y("p",{class:"cylon-help-platform",id:"cylon-help-platform",children:e.touch?"Touch Controls":"Desktop Controls"}),e.touch?y(Ms,{}):y(As,{}),y(ot,{class:"cylon-gameover-btn",id:"cylon-help-close",onClick:e.onClose,children:"Got It"})]})}function da(e,t){ct(y(Cs,{...t}),e)}var Jt={};Nn(Jt,{beginRun:()=>ho,clearGameOver:()=>wo,clearPendingScore:()=>xo,createRun:()=>mo,createSchedule:()=>uo,endRun:()=>vo,healOne:()=>bo,msUntil:()=>jt,pending:()=>Ls,recordKill:()=>Rs,resetScore:()=>fo,setEndReason:()=>Ps,skewForPause:()=>po,stopClock:()=>yo,takeHits:()=>go});function uo(){return{missileDueAt:0,nukeDueAt:0,healDueAt:0,grenadeReadyAt:0,raptorReadyAt:0,eyeDisorientedUntil:0}}function po(e,t,n){if(n<=0)return e;let o=r=>r>t?r+n:r;return{missileDueAt:o(e.missileDueAt),nukeDueAt:o(e.nukeDueAt),healDueAt:o(e.healDueAt),grenadeReadyAt:o(e.grenadeReadyAt),raptorReadyAt:o(e.raptorReadyAt),eyeDisorientedUntil:o(e.eyeDisorientedUntil)}}function jt(e,t){return Math.max(0,e-t)}function Ls(e,t){return t<e}function mo(){return{koScore:0,hitCount:0,hitsTaken:0,runStartedAt:0,gameOver:!1,endReason:null,pendingScore:null}}function fo(e){return{...e,koScore:0,hitCount:0,hitsTaken:0,gameOver:!1,pendingScore:null}}function Rs(e){return{...e,koScore:e.koScore+1}}function ho(e,t){return{...e,runStartedAt:t}}function yo(e){return e.runStartedAt===0?e:{...e,runStartedAt:0}}function go(e,t,n,o=!1){let r=Math.max(0,Number(t)||0),a={...e,hitCount:e.hitCount+r,hitsTaken:e.hitsTaken+r},i=o?"nuke":a.hitCount>=n?"hits":null;return{run:a,ends:i}}function bo(e){return e.hitCount>0?{...e,hitCount:e.hitCount-1}:e}function vo(e,t){return{...e,gameOver:!0,runStartedAt:0,pendingScore:{score:e.koScore,hits:e.hitsTaken,reason:t}}}function Ps(e,t){return{...e,endReason:t}}function xo(e){return e.pendingScore===null?e:{...e,pendingScore:null}}function wo(e){return e.gameOver?{...e,gameOver:!1}:e}var ua="Swipe the app away to close it",Is=150,Ds=["fullscreen","standalone","minimal-ui"];function ko(e){return Ds.some(t=>e.matches(`(display-mode: ${t})`))||e.iosStandalone()}async function pa(e){let t=ko(e);if(t){try{e.closeWindow()}catch{}if(await new Promise(o=>{e.timers.setTimeout(()=>o(e.closed()),Is)}))return"closed"}if(e.fullscreenElement())try{await e.exitFullscreen()}catch{}return t?"title-with-hint":"title"}function Bs(e,t){return{...e,fullscreenSupported:n=>{let o=n;return(typeof o.requestFullscreen=="function"||typeof o.webkitRequestFullscreen=="function")&&(typeof t.exitFullscreen=="function"||typeof t.webkitExitFullscreen=="function")},fullscreenElement:()=>e.fullscreenElement()??t.webkitFullscreenElement??null,requestFullscreen:n=>{let o=n;return typeof o.requestFullscreen=="function"?e.requestFullscreen(n):typeof o.webkitRequestFullscreen=="function"?Promise.resolve(o.webkitRequestFullscreen()):Promise.reject(new Error("no fullscreen"))},exitFullscreen:()=>typeof t.exitFullscreen=="function"?e.exitFullscreen():typeof t.webkitExitFullscreen=="function"?Promise.resolve(t.webkitExitFullscreen()):Promise.resolve()}}function Tn(){return Bs({matches:e=>typeof window.matchMedia=="function"&&window.matchMedia(e).matches,iosStandalone:()=>navigator.standalone===!0,fullscreenSupported:e=>typeof e.requestFullscreen=="function"&&typeof document.exitFullscreen=="function",fullscreenElement:()=>document.fullscreenElement,requestFullscreen:e=>typeof e.requestFullscreen=="function"?e.requestFullscreen():Promise.reject(new Error("no fullscreen")),exitFullscreen:()=>typeof document.exitFullscreen=="function"?document.exitFullscreen():Promise.resolve(),closeWindow:()=>window.close(),closed:()=>window.closed,timers:Vt},document)}function ma(e,t){let n=()=>{e.doc.visibilityState!=="hidden"&&t.show()};e.doc.addEventListener("visibilitychange",()=>{e.doc.visibilityState==="hidden"?t.hide():n()}),e.doc.addEventListener("freeze",()=>t.hide()),e.doc.addEventListener("resume",n),e.win.addEventListener("pagehide",o=>{t.hide(),o?.persisted===!1&&t.close?.()}),e.win.addEventListener("pageshow",n),e.doc.visibilityState==="hidden"&&t.hide()}function _o(e){let t=e.size??18;return y("svg",{viewBox:"0 0 24 24",width:t,height:t,fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false",class:e.class,children:[y("path",{d:"M12 15V3M7 8l5-5 5 5"}),y("path",{d:"M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"})]})}var fa=!0,ha="Tap Share, then Add to Home Screen",Fs=2500,So="__installPrompt";function ya(e){return new URLSearchParams(e).has("install")}function Eo(e){let t=new URL(e);return t.search=t.search?`${t.search}&install`:"?install",t.href}function ga(e){try{return new URL(e).searchParams.get("v")||null}catch{return null}}function ba(e,t){if(!t)return e;let n=new URL(e);return n.searchParams.set("v",t),n.href}var Hs=e=>e?.name==="AbortError";function Os(e,t,n){let o="idle",r=null,a=0;function i(c){r!==null&&(e.timers.clearTimeout(r),r=null),o=c,c==="copied"&&(r=e.timers.setTimeout(()=>{r=null,o="idle",n()},Fs)),n()}return{state:()=>o,async press(){let c=++a;if(e.share)try{await e.share({title:t.title,url:t.shareUrl});return}catch(l){if(Hs(l)||c!==a)return}if(e.copy)try{await e.copy(t.shareUrl),c===a&&i("copied");return}catch{}c===a&&i("field")},close(){a++,o!=="idle"&&i("idle")}}}function va(e,t,n){let o=e.framed(),r=Os(e,t,()=>h()),a=e.platform(),i=a==="ios",c=a==="chromium"&&!t.promptsHere&&t.installPage!==null,l=e.installed(),d=null,s=!1,k=()=>!o&&!l&&(i||c||d!==null),T=()=>({off:o,install:k(),highlight:t.asked&&k(),steps:s,share:r.state()}),h=()=>n(T());return!o&&!l&&(e.onPrompt(x=>{d=x,h()}),e.onInstalled(()=>{t.onEvent?.("install"),l=!0,d=null,s=!1,h()}),t.asked&&i&&(t.installPage===null?s=!0:e.navigate(Eo(t.installPage),!0))),{view:T,async pressInstall(){if(k()){if(i){t.installPage===null?(s=!0,h()):e.navigate(Eo(t.installPage),!1);return}if(d){let x=d;d=null,h();try{await x.prompt()}catch{}return}t.installPage!==null&&e.navigate(Eo(t.installPage),!1)}},closeSteps(){s&&(s=!1,h())},async pressShare(){o||(t.onEvent?.("share"),await r.press())},closeShare:r.close}}function Ns(e,t,n,o=[]){return/iPhone|iPad|iPod/.test(e)||t==="MacIntel"&&n>1?"ios":o.some(r=>r.brand==="Chromium")?"chromium":"other"}function qs(){return{share:typeof navigator.share=="function"?e=>navigator.share(e):null,copy:typeof navigator.clipboard?.writeText=="function"?e=>navigator.clipboard.writeText(e):null,timers:Vt}}function xa(){let e=window;return{onPrompt:t=>{let n=e[So];e[So]=null,n&&t(n),window.addEventListener("beforeinstallprompt",o=>{o.preventDefault(),e[So]=null,t(o)})},onInstalled:t=>window.addEventListener("appinstalled",()=>t()),installed:()=>ko(Tn()),platform:()=>Ns(navigator.userAgent,navigator.platform,navigator.maxTouchPoints,navigator.userAgentData?.brands),framed:()=>window.self!==window.top,...qs(),navigate:(t,n)=>n?location.replace(t):location.assign(t)}}var Gs={viewBox:"0 0 24 24",width:18,height:18,"aria-hidden":"true",focusable:"false",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round",class:"kit-install-icon"};function Vs(){return y("svg",{...Gs,children:[y("path",{d:"M12 3v12M7 10l5 5 5-5"}),y("path",{d:"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"})]})}function zs(e){let t=e.view,n=At(null);return Tt(()=>{t.share==="field"&&(n.current?.focus(),n.current?.select?.())},[t.share]),t.off?null:y("span",{class:"kit-install",children:[t.install&&y(ot,{id:"install-btn",class:t.highlight?"kit-install-btn kit-install-asked":"kit-install-btn",title:"Install this game as an app",onClick:e.onInstall,children:[y(Vs,{}),y("span",{class:"kit-install-txt",children:"Install"})]}),y(ot,{id:"share-btn",class:"kit-install-btn",title:"Share a link to this game",onClick:e.onShare,children:[y(_o,{class:"kit-install-icon"}),y("span",{class:"kit-install-txt",children:"Share"})]}),y("span",{id:"share-status",class:"kit-install-status",role:"status",children:t.share==="copied"?"Link copied":null}),t.share==="field"&&y("input",{id:"share-url",class:"kit-install-url",type:"text",readOnly:!0,value:e.shareUrl,"aria-label":"Link to this game",ref:n,onKeyDown:o=>{Ot(o)&&(o.preventDefault(),o.repeat||e.onCloseShare())}}),y(Gt,{open:t.steps,id:"install-steps",veilClass:"kit-install-veil",panelClass:"kit-install-panel",titleId:"install-steps-title",title:"Add to Home Screen",focusId:"install-steps-done",onDismiss:e.onCloseSteps,children:[y("p",{id:"install-steps-text",children:[y(_o,{size:20,class:"kit-install-glyph"}),ha,"."]}),y(ot,{id:"install-steps-done",class:"kit-install-btn",onClick:e.onCloseSteps,children:"Done"})]})]})}var $s=`
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
`;function Us(){if(document.getElementById("kit-install-css"))return;let e=document.createElement("style");e.id="kit-install-css",e.textContent=$s,document.head.prepend(e)}function wa(e,t,n){Us();let o=a=>{},r=va(n,t,a=>o(a));return o=a=>ct(y(zs,{view:a,shareUrl:t.shareUrl,onInstall:()=>{r.pressInstall()},onShare:()=>{r.pressShare()},onCloseSteps:r.closeSteps,onCloseShare:r.closeShare}),e),o(r.view()),r}var Xs=["#site-brand",".navbar-brand",".wp-block-site-title",".site-title"],Ks=[" – "," — "," | "," · "," - "];var Ws="The CIC";function Qt(e){return(e??"").replace(/\s+/g," ").trim()}function Ys(e){let t=-1,n=0;for(let o of Ks){let r=e.lastIndexOf(o);r>t&&(t=r,n=o.length)}return t<0?"":Qt(e.slice(t+n))}function js(e){let t=Array.from(e);return t.length<=40?e:`${t.slice(0,39).join("").trimEnd()}…`}function An(e,t,n){let o=a=>Qt(e.querySelector(a)?.getAttribute("content")),r=[()=>Qt(n?.getAttribute("data-site-name")),()=>{for(let a of Xs){let i=Qt(e.querySelector(a)?.textContent);if(i)return i}return""},()=>o('meta[property="og:site_name"]'),()=>o('meta[name="application-name"]'),()=>Ys(e.title),()=>Qt(t).replace(/^www\./i,"")];for(let a of r){let i=a();if(i)return js(i)}return Ws}var Ea={},_a=e=>new URL(e,Ea.url).href,ka=!0;function Js(){let e=document.getElementById("cylon-install-root");if(!e||new URLSearchParams(location.search).get("game")!=="cylon")return;document.querySelector('link[rel="manifest"]')?.setAttribute("href","games/cylon/manifest.webmanifest");let t=location.pathname.endsWith("/index.html");wa(e,{title:"The CIC",shareUrl:ba(new URL("play/cylon/",location.href).href,ga(Ea.url)),installPage:t||!ka?null:new URL("index.html?game=cylon",location.href).href,promptsHere:ka&&(t||fa),asked:ya(location.search)},xa())}async function Qs(e){let t=document.getElementById("game-root");if(!t)return!1;if(t.dataset.mounted==="1"&&document.getElementById("cylon-eye"))return!0;try{if(e!==void 0)t.innerHTML=e;else{let n=await fetch(_a("../mount.html?v=769e886323"),{cache:"no-store"});if(!n.ok)throw new Error(`mount ${n.status}`);t.innerHTML=await n.text()}return t.dataset.mounted="1",t.dataset.game="cylon",!0}catch(n){return console.error("Cylon mount failed",n),!1}}async function Sa(e={}){let t=typeof e.onTheme=="function"?e.onTheme:()=>{};await Qs(e.mountHtml);let n=document.getElementById("cylon-eye"),o=document.getElementById("cylon-glare"),r=document.getElementById("cylon-battlefield"),a=document.getElementById("cylon-ambush-under"),i=document.getElementById("cylon-nuke"),c=document.getElementById("cylon-nuke-missile"),l=document.getElementById("cylon-small-missile"),d=document.getElementById("cylon-score-value"),s=document.getElementById("cylon-hits-value"),k=document.getElementById("cylon-settings"),T=document.getElementById("cylon-raptor"),h=document.getElementById("cylon-raptor-impacts"),x=document.getElementById("cylon-raptor-btn"),u=document.getElementById("cylon-raptor-cd"),C=document.getElementById("cylon-grenade-btn"),b=document.getElementById("cylon-grenade-cd"),_=document.getElementById("cylon-game-toggle"),S=document.getElementById("cylon-game-toggle-label"),g=document.getElementById("cic-enter-btn"),m=document.getElementById("cylon-settings-panel"),v=document.getElementById("cylon-gameover-root"),M=document.getElementById("cylon-exit-hint"),R=null,p=document.getElementById("cylon-reticle"),E=document.getElementById("site-nav-burger"),O=document.getElementById("site-nav-menu"),N=document.getElementById("site-nav-power"),P=document.getElementById("site-nav-game"),F=document.getElementById("site-brand"),X=document.getElementById("cylon-intro-title"),J=e.siteName||An(document,location.hostname),V="The CIC",H=880,Z=document.getElementById("cylon-help-btn"),me=document.getElementById("cylon-help-root"),te=!1;if(!n||!r)return;let ve=window.matchMedia("(prefers-reduced-motion: reduce)").matches,Ae=la({doc:document,win:window,gutterStable:CSS.supports("scrollbar-gutter","stable"),panels:".cylon-help-panel, .cylon-gameover, .cylon-settings-panel",touchFree:".site-nav, .cylon-help, .cylon-gameover, .cylon-settings-panel",live:()=>document.body.classList.contains("cylon-game-live")}),$e=window.matchMedia("(pointer: coarse)").matches,rt=$e?10:30;if(ve)return;let Ie=e.localScores?Ar(En()):Tr(e.scoresApi||_a("../scores.php"),{fetch:(I,G)=>fetch(I,G)}),L={run:mo(),schedule:uo(),paused:!1,pauseStartedAt:0,nukeInFlight:!1,reticlePointerId:null,draggingReticle:!1,idleTimer:null},Oe={clientX:window.innerWidth/2,clientY:window.innerHeight/3,pageX:window.innerWidth/2,pageY:window.innerHeight/3,t:0},Se=null,Ue=null,Ze={clientX:0,clientY:0,t:0},de=null,Me=null,Xe=null,at=2e3,Je={w:44,h:56},Ke=28,et=52,Ct=44,{MAX_HITS:bt}=un,dt=1e4,w=64,D=520,q=28,$=2800,z=640,W=22,K=2200,ie=72,ue=.22,xe=.32,we=.62,ye=.5,Ce=.72,ne=3e4,Y=lt.medium.radius,_e=Math.round(2850*.45),{renderHighScores:tt,fetchHighScores:De,hideGameOver:Ne,showGameOver:vt,resetText:it}=ta({game:L,state:Jt,scores:Ie,weeklyResetText:Er,currentHp:Fo,setGameEnabled:On,resetRunStats:No,root:v,boardChanged:()=>$t(),closed:()=>{qo()}}),{settings:ae,saveSettings:ze,syncGameToggleUi:qe,syncNavChrome:Lt,renderSettings:$t,bindSettings:nt,bindGameToggle:nn,bindNavMenu:In}=sa({settingsRoot:k,gameToggleBtn:_,gameToggleLabel:S,cicEnterBtn:g,navBurger:E,navMenu:O,navGame:P,siteBrand:F,BRAND_CIVIL:J,BRAND_COMBAT:V,NAV_FADE_MS:_e,reduceMotion:ve,settingsPanel:m,boardRows:()=>fn(Ie.board()),resetText:it,fetchHighScores:De,setGameEnabled:On,setEyeTracking:I=>ge(I),settingChanged:I=>he.settingChanged(I)});function Rt(){return window.scrollX||window.pageXOffset||0}function Pt(){return window.scrollY||window.pageYOffset||0}function xt(){r&&(r.style.width="",r.style.height="")}function on(){return ae.gameEnabled&&!L.paused}let he=ur({settings:()=>ae,sessionActive:on,volumeToGain:Un}),ut=vr({titleEl:X,nukeEl:c,brandEl:F,body:document.body,title:V,reduceMotion:ve,navFadeMs:_e,settleMs:H,speed:D*.85,arriveRadius:q,maxFlightMs:$,random:Math.random,enabled:()=>ae.gameEnabled,paused:()=>L.paused,startRun:()=>Ie.startRun(),launched:()=>{he.prime(),he.sfx("introLaunch")},setNukeInFlight:I=>{L.nukeInFlight=I},detonate:(I,G)=>Va(I,G,{dealDamage:!1,shake:!1}),beginCombat:si});function Le(){return on()&&!L.run.gameOver&&!ut.playing()}let wt=gr({field:r,isLive:Le,paused:()=>L.paused,viewport:()=>({width:window.innerWidth,height:window.innerHeight}),create:I=>document.createElement(I),now:()=>Date.now(),setTimer:(I,G)=>setTimeout(I,G),clearTimer:I=>clearTimeout(I)}),It=e.glyphLayer??null,Dt=br({doc:document,glyphs:It,viewport:()=>({width:window.innerWidth,height:window.innerHeight}),random:Math.random,reduceMotion:ve,setTimer:(I,G)=>setTimeout(I,G),clearTimer:I=>clearTimeout(I)}),f=wt.punch,A=fr({now:()=>Date.now(),setTimer:(I,G)=>setTimeout(I,G),clearTimer:I=>clearTimeout(I),isLive:Le,readyAt:I=>I==="grenade"?L.schedule.grenadeReadyAt:L.schedule.raptorReadyAt,setReadyAt:(I,G)=>{I==="grenade"?L.schedule.grenadeReadyAt=G:L.schedule.raptorReadyAt=G},sfx:I=>{he.prime(),he.sfx(I)},changed:kt,grenadeBlast:ri,raptorAvailable:()=>!!T,raptorLaunch:()=>{ce(ne),T?.classList.add("is-inbound")},raptorStrike:ii,raptorClear:oi}),{rearrangeLandscape:B,rearrangeLandscapePage:U,disruptGlyphs:ee,clearLandscapeVars:oe,randRange:fe}=xr({reduceMotion:ve,glyphs:It,scrollX:Rt,scrollY:Pt}),{isEyeDisoriented:j,setEyeTracking:ge,disorientEye:ce,clearEyeDisorient:re,eyeClientCenter:be,updateEye:Ee}=wr({eye:n,glare:o,game:L,settings:ae,mouse:Oe,state:Jt,isGameLive:Le,EYE_DISORIENT_MS:ne}),{syncMousePageFromClient:Te,paintReticle:Be,syncReticleVisibility:pe,resetReticleToCenter:Re,onPointerMove:He,bindReticle:We}=kr({reticleEl:p,mouse:Oe,lastAim:Ze,game:L,settings:ae,coarsePointer:$e,IDLE_MS:at,isGameLive:Le,isEyeDisoriented:j,setEyeTracking:ge,audio:he,abilities:A,scrollX:Rt,scrollY:Pt}),{allBots:Ge,knockOutBot:Qe,clearAllBots:Ye,wipeAllBotsWithScore:Bt,herdBotsIntoView:Oa,scheduleAmbush:Na,bindPlayerMissShots:qa,canLaunchMissile:rn,launchSmallMissile:Co,clearActiveMissiles:Ga,launchNuke:Lo,detonateNukeAt:Va}=_r({game:L,settings:ae,mouse:Oe,lastAim:Ze,state:Jt,rules:un,playfield:Kn,field:r,ambushUnder:a,missileEl:l,nukeEl:i,nukeMissileEl:c,scoreEl:d,audio:he,intro:ut,abilities:A,holes:wt,debris:Dt,punchHole:f,HOLE_PRESETS:lt,isGameLive:Le,isEyeDisoriented:j,eyeClientCenter:be,syncMousePageFromClient:Te,rearrangeLandscape:B,rearrangeLandscapePage:U,disruptGlyphs:ee,randRange:fe,registerHit:ei,resizeBattlefield:xt,scrollX:Rt,scrollY:Pt,BOT_HARD_CAP:rt,BOT_SIZE:Je,LINK_PAD:Ke,HIT_RADIUS:et,BOLT_HIT_RADIUS:Ct,NUKE_DIRECT_HIT_RADIUS:w,NUKE_SPEED:D,NUKE_ARRIVE_RADIUS:q,NUKE_MAX_FLIGHT_MS:$,MISSILE_SPEED:z,MISSILE_ARRIVE:W,MISSILE_MAX_FLIGHT_MS:K,MISSILE_BLAST_RADIUS:ie,SMALL_WEAPON_SCALE:ue,MISSILE_WEAPON_SCALE:xe});function Ro(){Dt.scatter(),document.body.classList.add("cylon-world-ended"),document.body.classList.remove("cylon-glyphs-blown"),document.body.classList.add("cylon-glyphs-blowing"),requestAnimationFrame(()=>{requestAnimationFrame(()=>{ae.gameEnabled&&document.body.classList.add("cylon-glyphs-blown"),setTimeout(()=>{document.body.classList.remove("cylon-glyphs-blowing")},3e3)})})}function Dn(I={}){let G=ae.gameEnabled,Q=!!I.deferScatter;document.body.classList.toggle("cylon-game-live",G),G?Ae.hold():Ae.release(),t(G),Lt(),G?Q||Ro():(document.body.classList.remove("cylon-glyphs-blown"),document.body.classList.remove("cylon-glyphs-blowing"),document.body.classList.remove("cylon-world-ended"),Dt.cancelReshuffleSettle(),oe(),setTimeout(()=>{ae.gameEnabled||Dt.restore()},2900))}function yl(I,G,Q){return St(I,G,Q)}function za(){return qn(L.run.koScore,L.run.runStartedAt,Date.now())}function $a(){return Gn(L.run.koScore,Math.random)}function Ua(){return Vn(za(),Math.random)}function an(){clearTimeout(de??void 0),clearTimeout(Me??void 0),de=null,Me=null,L.schedule.missileDueAt=0,L.schedule.nukeDueAt=0,Ga()}function Bn(I=!1){if(clearTimeout(de??void 0),!Le())return;let G=I?4e3+Math.random()*3e3:$a();L.schedule.missileDueAt=Date.now()+G,de=setTimeout(()=>{de=null,!(!Le()||L.paused)&&(!j()&&(rn(!1)||rn(!0))&&Co(),Bn(!1))},G)}function Fn(I=!1){if(clearTimeout(Me??void 0),!Le())return;let G=I?12e3+Math.random()*8e3:Ua();L.schedule.nukeDueAt=Date.now()+G,Me=setTimeout(()=>{Me=null,!(!Le()||L.paused)&&(!j()&&!L.nukeInFlight&&Lo(),Fn(!1))},G)}function Xa(){an(),Bn(!0),Fn(!0)}function Ka(I){if(I<=0)return;let G=L.schedule;L.schedule=po(G,L.pauseStartedAt,I),L.schedule.missileDueAt!==G.missileDueAt&&(clearTimeout(de??void 0),de=setTimeout(()=>{de=null,!(!Le()||L.paused)&&(!j()&&(rn(!1)||rn(!0))&&Co(),Bn(!1))},jt(L.schedule.missileDueAt,Date.now()))),L.schedule.nukeDueAt!==G.nukeDueAt&&(clearTimeout(Me??void 0),Me=setTimeout(()=>{Me=null,!(!Le()||L.paused)&&(!j()&&!L.nukeInFlight&&Lo(),Fn(!1))},jt(L.schedule.nukeDueAt,Date.now()))),L.schedule.healDueAt!==G.healDueAt&&(clearTimeout(Se??void 0),Se=setTimeout(()=>{Se=null,Po()},jt(L.schedule.healDueAt,Date.now()))),wt.resume(L.pauseStartedAt,I)}function Ut(){clearTimeout(Se??void 0),Se=null,L.schedule.healDueAt=0}function Po(){Se=null,L.schedule.healDueAt=0,!(!Le()||L.run.hitCount<=0)&&(L.run=bo(L.run),cn(),he.prime(),he.sfx("heal"),s&&(s.classList.add("is-heal"),setTimeout(()=>s.classList.remove("is-heal"),320)),Io())}function Io(){Ut(),!(!ae.gameEnabled||L.run.gameOver||L.paused||L.run.hitCount<=0)&&(L.schedule.healDueAt=Date.now()+dt,Se=setTimeout(()=>{Se=null,Po()},dt))}function Wa(){Te(),clearTimeout(Xe??void 0),Xe=setTimeout(Oa,180)}function sn(){me&&da(me,{open:te,touch:$e,onClose:Ja})}function Do(){L.paused||(L.paused=!0,L.pauseStartedAt=Date.now(),clearTimeout(L.idleTimer??void 0),wt.pause(),clearTimeout(de??void 0),clearTimeout(Me??void 0),clearTimeout(Se??void 0),de=null,Me=null,Se=null,ge(!1),he.syncMusic(),kt())}function Bo(){if(!L.paused)return;let I=Date.now()-L.pauseStartedAt;Ka(I),L.paused=!1,L.pauseStartedAt=0,he.syncMusic(),kt(),pe()}let ln=!1;function Ya(){ma({doc:document,win:window},{hide(){ae.gameEnabled&&!L.paused&&(Do(),ln=!0),he.pageHide()},show(){he.pageShow(),ln&&!te&&Bo(),ln=!1},close:he.pageClose}),ir({doc:document,win:window,timers:Vt},{away:()=>he.frameAway(!0),back:()=>he.frameAway(!1)})}function ja(){me&&(Do(),ln=!1,Z?.focus({preventScroll:!0}),te=!0,sn())}function Ja(){te&&(te=!1,sn(),Bo())}function Qa(){sn(),Z&&Z.addEventListener("click",I=>{I.preventDefault(),I.stopPropagation(),ja()})}function Fo(){return zn(L.run.hitCount)}function Za(I){return $n(I)}function cn(){if(!s)return;let I=Fo();s.textContent=String(I),s.classList.remove("is-hp-good","is-hp-mid","is-hp-low");let G=Za(I);s.style.color=G.color,s.style.textShadow=`0 0 8px ${G.glow}`}function ei(I=1,{fromNuke:G=!1}={}){if(L.run.gameOver||!Le())return;let Q=go(L.run,I,bt,G);L.run=Q.run,cn(),he.sfx("hit"),Io(),Q.ends&&(Ut(),Oo(Q.ends))}function Ho(I,G,Q,se=!0){if(!I)return;let Pe=mr(Q,Date.now()),Fe=Pe>0,st=!Fe&&se&&Le();I.disabled=!st,I.classList.toggle("is-cooling",Fe),G&&(Fe?(G.hidden=!1,G.textContent=String(Pe),G.setAttribute("aria-label",`${Pe} seconds remaining`)):(G.hidden=!0,G.textContent="",G.removeAttribute("aria-label")))}function ti(){Ho(x,u,L.schedule.raptorReadyAt,!A.raptorInbound())}function ni(){if(Ho(C,b,A.grenadeArmed()?0:L.schedule.grenadeReadyAt,!0),!C)return;C.classList.toggle("is-armed",A.grenadeArmed());let I=C.querySelector(".cylon-raptor-btn-label");I&&(I.textContent=A.grenadeArmed()?"Armed":"Grenade"),document.body.classList.toggle("cylon-grenade-armed",A.grenadeArmed())}function kt(){ti(),ni()}function oi(){T&&T.classList.remove("is-inbound"),h&&(h.innerHTML="")}function Hn(){A.reset(),document.body.classList.remove("cylon-grenade-armed"),re(),kt()}function ri(I,G){let Q=I,se=G,Pe=document.createElement("div");Pe.className="cylon-grenade-blast",Pe.style.left=`${Q}px`,Pe.style.top=`${se}px`,Pe.setAttribute("aria-hidden","true"),r?.appendChild(Pe),f(Q,se,lt.medium);for(let Fe=0;Fe<2;Fe++){let st=Math.random()*Math.PI*2,_t=fe(Y*.35,Y*.85);f(Q+Math.cos(st)*_t,se+Math.sin(st)*_t,{radius:fe(36,64),holdMs:lt.small.holdMs,fadeMs:lt.small.fadeMs})}U(Q,se,we,{radius:Y*1.2}),setTimeout(()=>Pe.remove(),480),Ge().forEach(Fe=>{if(Fe.dataset.ko==="1")return;let st=(parseFloat(Fe.style.left)||0)+Je.w/2,_t=(parseFloat(Fe.style.top)||0)+Je.h/2;Math.hypot(st-Q,_t-se)<=Y&&Qe(Fe)})}function ai(){if(!h)return;h.innerHTML="";let I=10,G=110;for(let Q=0;Q<I;Q++)setTimeout(()=>{if(!Le())return;let se=document.createElement("span");se.className="cylon-raptor-impact";let Pe=12+Math.random()*76,Fe=40+Math.random()*50;se.style.left=`${Pe}%`,se.style.top=`${Fe}%`,h.appendChild(se);let st=window.scrollX+Pe/100*window.innerWidth,_t=window.scrollY+Fe/100*window.innerHeight;f(st,_t,lt.medium),U(st,_t,ye,{radius:G}),setTimeout(()=>se.remove(),560)},Q*55)}function ii(){let I=window.innerWidth||1,Q=(window.innerHeight||1)*.62,se=Math.min(220,I*.28);for(let Pe=0;Pe<5;Pe++){let Fe=I*(.18+Pe*.16);B(Fe,Q,Ce,{radius:se})}ai(),Bt()}function si(){if(!ae.gameEnabled||L.run.gameOver)return;Ro();let I=(window.innerWidth||1)/2,G=(window.innerHeight||1)*.48,Q=I+Rt(),se=G+Pt();requestAnimationFrame(()=>{ee(Q,se,1.35),setTimeout(()=>ee(Q,se,1.1),280)}),L.run=ho(L.run,Date.now()),Xa(),$e?(Re(),document.body.classList.add("cylon-touch-play")):Be(),pe(),kt()}function Oo(I){if(L.run.gameOver)return;L.run=vo(L.run,I);let G=I==="hits"||I==="nuke";Ye(),an(),Ut(),clearTimeout(L.idleTimer??void 0),ge(!1),ut.cancel(),L.draggingReticle=!1,L.reticlePointerId=null,Hn(),G||(ae.gameEnabled=!1,ze(),document.body.classList.remove("cylon-touch-play")),qe(),pe(),he.syncMusic(),G||Dn(),vt(I)}function No(){L.run=fo(L.run),Ut(),d&&(d.textContent="0"),cn()}function On(I){let G=ae.gameEnabled;if(!I&&G&&!L.run.gameOver&&L.run.koScore>0){Oo("quit");return}ae.gameEnabled=I,ze(),I?(G||dn("game_start"),ut.cancel(),Ye(),an(),Ne(),No(),Hn(),qe(),pe(),he.syncMusic(),Dn({deferScatter:!0}),ut.play()):(ut.cancel(),Ye(),an(),Ut(),L.run=yo(L.run),clearTimeout(L.idleTimer??void 0),ge(!1),L.draggingReticle=!1,L.reticlePointerId=null,L.paused=!1,L.pauseStartedAt=0,document.body.classList.remove("cylon-touch-play"),Ne(),L.run=xo(wo(L.run)),te&&(te=!1,sn()),Hn(),qe(),pe(),he.syncMusic(),Dn(),qo())}async function qo(){await pa(Tn())!=="title-with-hint"||!M||(M.textContent=ua,M.hidden=!1,clearTimeout(R??void 0),R=setTimeout(()=>{M.hidden=!0},6e3))}function li(){let I=(G,Q)=>{G&&(G.addEventListener("pointerup",se=>{L.reticlePointerId!=null&&se.pointerId===L.reticlePointerId||se.pointerType==="mouse"&&se.button!=null&&se.button!==0||(se.preventDefault(),se.stopPropagation(),Q())}),G.addEventListener("click",se=>{se.detail===0?(se.preventDefault(),Q()):se.preventDefault()}))};I(x,()=>{A.callRaptor()}),I(C,()=>{A.readyGrenade()}),window.addEventListener("keydown",G=>{if(Nt(G.target))return;let Q=pr(G);Q==="disarm"?A.cancelGrenadeArm():Q==="raptor"?(G.preventDefault(),A.callRaptor()):Q==="grenade"&&(G.preventDefault(),A.readyGrenade())}),window.addEventListener("pointerdown",G=>{if(!A.grenadeArmed()||G.button!=null&&G.button!==0)return;let Q=G.target;Q&&(Q.closest("#cylon-grenade-btn")||Q.closest("#cylon-raptor-btn")||Q.closest("#cylon-game-toggle")||Q.closest("#cylon-settings")||Q.closest("#theme-toggle")||Q.closest("#site-nav-burger")||Q.closest("#site-nav-menu a")||Q.closest("#cylon-help-btn")||Q.closest("#cylon-help")||Q.closest(".site-brand")||Q.closest("#cylon-gameover"))||(G.preventDefault(),A.throwGrenadeAt(G.pageX,G.pageY))},!0),clearInterval(Ue??void 0),Ue=setInterval(kt,250),kt()}window.cylonStartGame=()=>{ae.gameEnabled||L.run.gameOver||(On(!0),Ae.moveTo(0,!ve))},nt(),nn(),li(),qa(),We(),Ae.bind(),In(),Qa(),Ya(),Js(),xt(),cn(),Lt(),pe(),tt(),De(),window.addEventListener("resize",xt),window.addEventListener("pointermove",He,{passive:!0}),window.addEventListener("scroll",Wa,{passive:!0}),window.addEventListener("pointerdown",he.unlock,{passive:!0}),window.addEventListener("keydown",he.unlock,{passive:!0}),document.addEventListener("selectstart",I=>{document.body.classList.contains("cylon-game-live")&&I.preventDefault()}),document.addEventListener("dragstart",I=>{document.body.classList.contains("cylon-game-live")&&I.preventDefault()}),requestAnimationFrame(Ee),Na(!0)}var Mt={a:1,b:0,c:0,d:1,e:0,f:0};function ht(e,t){return{a:e.a*t.a+e.c*t.b,b:e.b*t.a+e.d*t.b,c:e.a*t.c+e.c*t.d,d:e.b*t.c+e.d*t.d,e:e.a*t.e+e.c*t.f+e.e,f:e.b*t.e+e.d*t.f+e.f}}function Mn(e){let t=e.a*e.d-e.b*e.c||1e-12;return{a:e.d/t,b:-e.b/t,c:-e.c/t,d:e.a/t,e:(e.c*e.f-e.d*e.e)/t,f:(e.b*e.e-e.a*e.f)/t}}function Zt(e,t,n){return{x:e.a*t+e.c*n+e.e,y:e.b*t+e.d*n+e.f}}function Cn(e,t,n){return ht(ht({...Mt,e:t,f:n},e),{...Mt,e:-t,f:-n})}function To(e,t,n){let o=n*Math.PI/180,r=Math.cos(o),a=Math.sin(o);return{a:r,b:a,c:-a,d:r,e,f:t}}function Ao(e,t,n,o){let r=3*e,a=3*(n-e)-r,i=1-r-a,c=3*t,l=3*(o-t)-c,d=1-c-l,s=h=>((i*h+a)*h+r)*h,k=h=>((d*h+l)*h+c)*h,T=h=>(3*i*h+2*a)*h+r;return h=>{if(h<=0)return 0;if(h>=1)return 1;let x=h;for(let b=0;b<8;b++){let _=s(x)-h;if(Math.abs(_)<1e-6)return k(x);let S=T(x);if(Math.abs(S)<1e-6)break;x-=_/S}let u=0,C=1;x=h;for(let b=0;b<30;b++){let _=s(x);if(Math.abs(_-h)<1e-6)break;_<h?u=x:C=x,x=(u+C)/2}return k(x)}}var Ta=Ao(.22,.7,.2,1),Aa=Ao(.15,.85,.25,1),Mo=Ao(.25,.1,.25,1);function yt(e,t){return e.ms<=0||t>=e.t0+e.ms?e.to:t<=e.t0?e.from:e.from+(e.to-e.from)*e.ease((t-e.t0)/e.ms)}function gt(e,t,n,o,r){return{from:yt(e,n),to:t,t0:n,ms:o,ease:r}}var en=e=>({from:e,to:e,t0:0,ms:0,ease:Mo});function tn(e,t){return e.ms>0&&t<e.t0+e.ms&&e.from!==e.to}function Ma(e){let t=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(e.trim());if(t)return{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16),a:1};let n=/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i.exec(e.trim());if(!n)return null;let o=n[4]===void 0?1:n[4].endsWith("%")?parseFloat(n[4])/100:parseFloat(n[4]);return{r:+n[1],g:+n[2],b:+n[3],a:o}}function Ca(e,t,n){let o=e.a*n+t.a*(1-n);if(o<=0)return{r:0,g:0,b:0,a:0};let r=(a,i)=>Math.round((a*e.a*n+i*t.a*(1-n))/o);return{r:r(e.r,t.r),g:r(e.g,t.g),b:r(e.b,t.b),a:o}}var Ln=e=>`rgba(${e.r}, ${e.g}, ${e.b}, ${+e.a.toFixed(3)})`;function La(e,t){let n=/^\s*([\d.]+)(ms|s)\s*$/.exec(e);return n?n[2]==="s"?parseFloat(n[1])*1e3:parseFloat(n[1]):t}var Zs=320,el=450,tl=1600,Ra={r:90,g:88,b:84,a:1},nl=[[0,1.5,"rgba(0, 0, 0, 0.4)"],[-1.8,.4,"rgba(40, 90, 160, 0.45)"],[1.8,0,"rgba(160, 35, 35, 0.5)"]],ol=.55,zt=3,Rn=2048,rl=6e3,al=new Set(["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","TEXTAREA","SELECT","OPTION","svg","SVG","CANVAS","IFRAME","VIDEO","AUDIO"]),Pa=e=>{if(!e||e==="none")return Mt;let t=new DOMMatrixReadOnly(e);return{a:t.a,b:t.b,c:t.c,d:t.d,e:t.e,f:t.f}},il=e=>Math.abs(e.a-1)<.001&&Math.abs(e.d-1)<.001&&Math.abs(e.b)<.001&&Math.abs(e.c)<.001;function Ia(e){let{doc:t,win:n}=e,o=e.max??rl,r=t.body,a=null,i=null,c=1,l=[],d=[],s=[],k=new Map,T=new Map,h=[],x=new Set,u=()=>({sx:0,sy:0,sr:0}),C=!1,b=0,_=0,S=null,g=null,m=null,v=[],M=new Map,R=0,p=0,E=0,O=new Map,N=null,P=()=>n.performance.now(),F=()=>r.classList.contains("cylon-glyphs-blown"),X=()=>r.classList.contains("cylon-glyphs-blowing"),J=()=>La(n.getComputedStyle(r).getPropertyValue("--cylon-desolate-fade"),tl);function V(){return N||(N=t.createElement("canvas").getContext("2d",{willReadFrequently:!0})),N}function H(w){let D=O.get(w);if(!D){let q=V();q.font=w;let $=q.measureText("Mg");D={asc:Math.round($.fontBoundingBoxAscent||$.actualBoundingBoxAscent),desc:Math.round($.fontBoundingBoxDescent||$.actualBoundingBoxDescent)},O.set(w,D)}return D}function Z(w){let D=V();D.fillStyle="#000",D.fillStyle=w;let q=Ma(String(D.fillStyle));if(q)return q;D.setTransform(1,0,0,1,0,0),D.clearRect(0,0,1,1),D.fillRect(0,0,1,1);let[$=0,z=0,W=0,K=0]=D.getImageData(0,0,1,1).data;return{r:$,g:z,b:W,a:K/255}}function me(w,D){let q=`${D}|${w.style.font}|${Ln(w.style.color)}|${w.ch}`,$=M.get(q);if($)return $;let z=V();z.font=w.style.font;let W=z.measureText(w.ch),K=Math.max(W.width,(W.actualBoundingBoxLeft||0)+(W.actualBoundingBoxRight||0))+zt*2,ie=w.style.asc+w.style.desc+zt*2,ue=Math.ceil(K*c),xe=Math.ceil(ie*c);if(R+ue>Rn&&(R=0,p+=E+1,E=0),!v.length||p+xe>Rn){let _e=t.createElement("canvas");_e.width=Rn,_e.height=Rn,v.push(_e),R=0,p=0,E=0}let we=v.length-1,ye=v[we].getContext("2d"),Ce={page:we,sx:R,sy:p,sw:ue,sh:xe};ye.setTransform(c,0,0,c,R,p),ye.font=w.style.font,ye.textBaseline="alphabetic";let ne=zt,Y=zt+w.style.asc;if(D==="blown"){for(let[_e,tt,De]of nl)ye.fillStyle=De,ye.fillText(w.ch,ne+_e,Y+tt);ye.fillStyle=Ln(Ca(w.style.color,Ra,.38))}else ye.fillStyle=Ln(w.style.color);return ye.fillText(w.ch,ne,Y),R+=ue+1,E=Math.max(E,xe),M.set(q,Ce),Ce}function te(w,D){let q=T.get(w);if(q)return q;let $=n.getComputedStyle(w),z=w===D||!w.parentElement?null:te(w.parentElement,D),W=z?z.ok:!0;(al.has(w.tagName)||w.closest("svg"))&&(W=!1),($.visibility==="hidden"||$.display==="none")&&(W=!1),($.clipPath!=="none"||$.clip&&$.clip!=="auto")&&(W=!1),$.overflow!=="visible"&&w.offsetWidth<=2&&(W=!1);let K=$.getPropertyValue("-webkit-text-fill-color"),ie=Z($.color);(!ie||ie.a<=0)&&(W=!1),K&&Z(K)?.a===0&&(W=!1);let ue=(z?z.opacity:1)*(parseFloat($.opacity)||0);ue<=0&&(W=!1);let xe=`${$.fontStyle} ${$.fontWeight} ${$.fontSize} ${$.fontFamily}`,we=$.textTransform,{asc:ye,desc:Ce}=H(xe),ne={ok:W,font:xe,color:ie??Ra,opacity:ue,upper:we==="uppercase"||we==="capitalize",lower:we==="lowercase",asc:ye,desc:Ce};return T.set(w,ne),ne}function ve(w,D){let q=k.get(w);if(q)return q;let $;if(w===D){let z=n.getComputedStyle(D).position;$={el:w,style:n.getComputedStyle(w),parent:null,fixed:z==="fixed"||z==="sticky",blocks:0,ox:0,oy:0,world:Mt},s.push($)}else{let z=ve(w.parentElement??D,D),W=n.getComputedStyle(w);if(!(w.classList.contains("cylon-scatter-block")&&W.display!=="inline"&&W.display!=="contents"))return k.set(w,z),z;$={el:w,style:W,parent:z,fixed:z.fixed,blocks:z.blocks+1,ox:0,oy:0,world:Mt},s.push($)}return k.set(w,$),$}function Ae(){let w=n.scrollX,D=n.scrollY;for(let q of s){let $=q.el.getBoundingClientRect(),z=q.parent?q.parent.world:Mt,W=Pa(q.style.transform),K=Zt(Mn(z),$.left+$.width/2+(q.fixed?0:w),$.top+$.height/2+(q.fixed?0:D));q.ox=K.x-W.e,q.oy=K.y-W.f,q.world=ht(z,Cn(W,q.ox,q.oy))}}function $e(){for(let w of s){let D=Cn(Pa(w.style.transform),w.ox,w.oy);w.world=w.parent?ht(w.parent.world,D):D}}let rt=()=>t.createRange();function Ie(w,D){D.setStart(w.text,w.start),D.setEnd(w.text,w.end);let q=D.getBoundingClientRect();if(q.width<=0||q.height<=0)return null;let $=w.frame.fixed?{x:0,y:0}:{x:n.scrollX,y:n.scrollY},z=Zt(Mn(w.frame.world),q.left+q.width/2+$.x,q.top+q.height/2+$.y);if(il(w.frame.world))return{lx:z.x,ly:z.y,w:q.width,h:q.height};let W=V();return W.font=w.style.font,{lx:z.x,ly:z.y,w:W.measureText(w.ch).width,h:w.style.asc+w.style.desc}}function L(w,D){let q=D.get(w);if(q)return q;let $=w.el,z=xe=>parseFloat($.style?.getPropertyValue(xe)??"")||0,W=To(z("--sx"),z("--sy"),z("--sr")),K=w.parent?1:.96,ie=Cn({a:W.a*K,b:W.b*K,c:W.c*K,d:W.d*K,e:W.e,f:W.f},w.ox,w.oy),ue=w.parent?ht(L(w.parent,D),ie):ie;return D.set(w,ue),ue}function Oe(){if(!d.length||l.length>=o)return;$e();let w=n.innerWidth||1,D=n.innerHeight||1,q=n.scrollX,$=n.scrollY,z=w*.75,W=D*.75,K=rt(),ie=new Map,ue=[],xe=[];for(let ne of d){if(!ne.text.isConnected)continue;K.selectNodeContents(ne.text);let Y=K.getBoundingClientRect();if(Y.width<=0&&Y.height<=0)continue;let _e=Y.bottom>-W&&Y.top<D+W&&Y.right>-z&&Y.left<w+z,tt=!1;if(!_e){let De=ne.frame.fixed?0:q,Ne=ne.frame.fixed?0:$,vt=ht(L(ne.frame,ie),Mn(ne.frame.world)),it=1/0,ae=1/0,ze=-1/0,qe=-1/0;for(let[Lt,$t]of[[Y.left,Y.top],[Y.right,Y.top],[Y.left,Y.bottom],[Y.right,Y.bottom]]){let nt=Zt(vt,Lt+De,$t+Ne);it=Math.min(it,nt.x-De),ze=Math.max(ze,nt.x-De),ae=Math.min(ae,nt.y-Ne),qe=Math.max(qe,nt.y-Ne)}tt=qe>-W&&ae<D+W&&ze>-z&&it<w+z}if(!_e&&!tt){xe.push(ne);continue}ue.push({p:ne,dist:Math.abs(Y.top+Y.height/2-D/2)})}ue.sort((ne,Y)=>ne.dist-Y.dist);let we=[],ye=[],Ce=C;for(let{p:ne}of ue){if(l.length+we.length>=o){xe.push(ne);continue}let Y=ne.text.parentElement;if(!Y)continue;let _e=te(Y,Se(ne.frame));if(!_e.ok)continue;let tt=ne.text.nodeValue??"",De=0;for(let Ne of tt){let vt=De;if(De+=Ne.length,/^[\s­​-‍⁠﻿]$/.test(Ne))continue;let it=_e.upper?Ne.toUpperCase():_e.lower?Ne.toLowerCase():Ne,ae={text:ne.text,start:vt,end:De,ch:it,frame:ne.frame,style:_e},ze=Ie(ae,K);if(!ze)continue;let qe=u();we.push({...ae,...ze,v:qe,rest:me(ae,"rest"),blown:me(ae,"blown"),x:en(Ce?qe.sx:0),y:en(Ce?qe.sy:0),r:en(Ce?qe.sr:0),k:en(Ce?1:0)})}ye.push(ne.text)}ye.forEach(Ue),d=xe,l=l.concat(we),Ke()}let Se=w=>{let D=w;for(;D.parent;)D=D.parent;return D.el};function Ue(w){let D=w.parentElement;if(!D)return;let q=t.createElement("span");q.className="cylon-glyph-src",w.replaceWith(q),q.appendChild(w),h.push(q),D.classList.add("cylon-glyph-parent"),x.add(D)}function Ze(){a&&(c=Math.min(3,n.devicePixelRatio||1),a.width=Math.round((n.innerWidth||1)*c),a.height=Math.round((n.innerHeight||1)*c))}function de(w,D,q){let $=P();for(let z of l)z.x=gt(z.x,C?z.v.sx:0,$,w,q),z.y=gt(z.y,C?z.v.sy:0,$,w,q),z.r=gt(z.r,C?z.v.sr:0,$,w,q),z.k=gt(z.k,C?1:0,$,D,Mo)}function Me(){if(X()){let w=J();return{ms:w,lookMs:w,ease:Aa}}return{ms:Zs,lookMs:el,ease:Ta}}function Xe(){let w=F();if(w===C)return;C=w;let{ms:D,lookMs:q,ease:$}=Me();de(D,q,$),et(Math.max(D,q)+200)}function at(w){if(!a||!i)return!1;let D=n.innerWidth||1,q=n.innerHeight||1,$=n.scrollX,z=n.scrollY;i.setTransform(1,0,0,1,0,0),i.clearRect(0,0,a.width,a.height);let W=!1;for(let K of l){(tn(K.x,w)||tn(K.y,w)||tn(K.r,w)||tn(K.k,w))&&(W=!0);let ie=ht(K.frame.world,To(K.lx+yt(K.x,w),K.ly+yt(K.y,w),yt(K.r,w))),ue=K.frame.fixed?ie.e:ie.e-$,xe=K.frame.fixed?ie.f:ie.f-z;if(ue<-80||xe<-80||ue>D+80||xe>q+80)continue;let we=yt(K.k,w),ye=K.style.opacity*(1+(Math.pow(ol,K.frame.blocks)-1)*we);i.setTransform(c*ie.a,c*ie.b,c*ie.c,c*ie.d,c*ue,c*xe);let Ce=-K.w/2-zt,ne=-K.h/2-zt;if(we<1){let Y=K.rest;i.globalAlpha=ye*(1-we),i.drawImage(v[Y.page],Y.sx,Y.sy,Y.sw,Y.sh,Ce,ne,Y.sw/c,Y.sh/c)}if(we>0){let Y=K.blown;i.globalAlpha=ye*we,i.drawImage(v[Y.page],Y.sx,Y.sy,Y.sw,Y.sh,Ce,ne,Y.sw/c,Y.sh/c)}}return i.globalAlpha=1,W}function Je(w){if(b=0,!a)return;let D=w<_;D&&$e(),(at(w)||D)&&Ke()}function Ke(){!b&&a&&(b=n.requestAnimationFrame(Je))}function et(w){_=Math.max(_,P()+w),Ke(),d.length&&Ct()}function Ct(){g&&clearTimeout(g),g=setTimeout(()=>{g=null,Oe()},150)}function bt(){Ke(),Ct()}function dt(){m&&clearTimeout(m),m=setTimeout(()=>{m=null,Ze(),Ae();let w=rt();for(let D of l){let q=Ie(D,w);q&&Object.assign(D,q)}Oe(),Ke()},200)}return{scatter(w,D){if(!a){u=D,C=F();for(let q of w){let $=t.createTreeWalker(q,NodeFilter.SHOW_TEXT,{acceptNode(z){if(!z.nodeValue||!/\S/.test(z.nodeValue))return NodeFilter.FILTER_REJECT;let W=z.parentElement;return!W||W.closest(".cylon-glyph-src, .cylon-scatter-char")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});for(;$.nextNode();){let z=$.currentNode;d.push({text:z,frame:ve(z.parentElement,q)})}}Ae(),a=t.createElement("canvas"),a.className="cylon-glyph-layer",a.setAttribute("aria-hidden","true"),i=a.getContext("2d"),Ze(),Oe(),r.appendChild(a),S=new MutationObserver(Xe),S.observe(r,{attributes:!0,attributeFilter:["class"]}),n.addEventListener("scroll",bt,{passive:!0}),n.addEventListener("resize",dt),Ke()}},restore(){b&&n.cancelAnimationFrame(b),b=0,S?.disconnect(),S=null,n.removeEventListener("scroll",bt),n.removeEventListener("resize",dt),g&&clearTimeout(g),m&&clearTimeout(m),g=null,m=null;for(let w of h){let D=w.firstChild;D?w.replaceWith(D):w.remove()}h.length=0,x.forEach(w=>w.classList.remove("cylon-glyph-parent")),x.clear(),a?.remove(),a=null,i=null,l=[],d=[],s=[],k.clear(),T.clear(),v.length=0,M.clear(),R=0,p=0,E=0,C=!1,_=0},reshuffle(w){u=w;for(let z of l)z.v=w();let{ms:D,lookMs:q,ease:$}=Me();C=F(),de(D,q,$),et(Math.max(D,q)+200)},kick(w){if(!l.length)return;let D=P(),q=n.scrollX,$=n.scrollY,{ms:z,ease:W}=Me();for(let K of l){let ie=Zt(K.frame.world,K.lx+yt(K.x,D),K.ly+yt(K.y,D)),ue=w(K.frame.fixed?ie.x+q:ie.x,K.frame.fixed?ie.y+$:ie.y,K.v);ue&&(K.v=ue,C&&(K.x=gt(K.x,ue.sx,D,z,W),K.y=gt(K.y,ue.sy,D,z,W),K.r=gt(K.r,ue.sr,D,z,W)))}Ke()},poke:et,count:()=>l.length}}var sl=[Vo,zo,$o,Uo,Xo,Ko,Wo,Yo,jo,Jo,Qo,Zo,er],ll="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&display=swap",cl="cic-embed",Da="cic-embed-launch",Ba="cic-embed-bar",dl=new Set(["SCRIPT","STYLE","LINK","META","NOSCRIPT","TEMPLATE","IFRAME"]),ul="img, picture, figure, video, svg, blockquote, pre, table, form, button, input, h4, h5, h6, .wp-block-image, .wp-block-button",pl=document.currentScript,Pn=(e,t)=>{console.error(`The CIC: ${e}`,t??"")},ml=`
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
</div>`;function fl(e){for(let t of Array.from(document.body.children))dl.has(t.tagName)||e.has(t)||(t.classList.add("page-panel","cic-embed-host"),getComputedStyle(t).position==="static"&&t.classList.add("cic-embed-host-static"),t.querySelectorAll(ul).forEach(n=>n.classList.add("cylon-debris")))}var Fa=!1;async function hl(e){if(Fa)return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){e.textContent="The CIC Rests (Reduced Motion)",e.disabled=!0;return}if(document.getElementById("game-root")||document.getElementById(Ba)){Pn("this page already has a #game-root; not launching");return}Fa=!0,e.remove();let t=document.createElement("link");t.rel="stylesheet",t.href=ll,document.head.appendChild(t);let n=document.createElement("style");n.id="cic-embed-style",n.textContent=sl.join(`
`),document.head.appendChild(n);let o=An(document,location.hostname,pl),r=document.createElement("div");r.id="game-root",r.dataset.game="cylon";let a=document.createElement("header");a.id=Ba,a.className="site-nav",a.innerHTML=ml,fl(new Set([r,a])),document.body.prepend(r),document.body.appendChild(a),document.documentElement.classList.add("cic-embed-on"),document.body.classList.add("cic-embed-on"),a.querySelector("#cic-embed-leave")?.addEventListener("click",()=>{location.reload()}),await Sa({mountHtml:Go,localScores:!0,siteName:o,glyphLayer:Ia({doc:document,win:window})}),window.cylonStartGame?.()}function Ha(){if(document.getElementById(Da))return;let e=document.createElement("button");e.type="button",e.id=Da,e.textContent="Play The CIC",e.title="Play The CIC on this page",e.setAttribute("style",["font: 700 14px/1.2 system-ui, sans-serif","letter-spacing: .06em","color: #fff","background: #8a0a0a","border: 1px solid #ff5555","border-radius: 6px","padding: 10px 16px","cursor: pointer","box-shadow: 0 4px 14px rgba(0,0,0,.35)"].join(";")),e.addEventListener("click",()=>{hl(e).catch(n=>Pn("the game failed to start",n))});let t=document.getElementById(cl);t?t.appendChild(e):(e.style.cssText+=";position:fixed;right:16px;bottom:16px;z-index:2147483000",document.body.appendChild(e))}try{document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{try{Ha()}catch(e){Pn("the launcher failed",e)}}):Ha()}catch(e){Pn("the launcher failed",e)}})();
//# sourceMappingURL=embed.js.map
