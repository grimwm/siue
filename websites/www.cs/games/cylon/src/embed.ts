/* Cylon Defense: the embed. One classic script another site's page includes
 * (README.md, "Embedding on another site"); it carries the game, mount.html's
 * markup and every stylesheet, so the host page fetches nothing else from this
 * site and needs no cross-origin headers.
 *
 * Until the visitor presses the launcher, it adds one button and no styles.
 * Pressed, it styles and mounts the game over the host page, hands the host's
 * top-level elements to the game as its page panels (the debris the nukes
 * scatter), puts the combat bar on top and starts a run. Leave reloads the page,
 * which is how the host gets its own page back. Nothing here throws into the
 * host: every failure is logged. */

import mountHtml from '../mount.html' with { type: 'text' };
import kitCss from '../../_kit/kit.css' with { type: 'text' };
import eyeCss from '../css/eye.css' with { type: 'text' };
import navCss from '../css/nav.css' with { type: 'text' };
import helpCss from '../css/help.css' with { type: 'text' };
import hudCss from '../css/hud.css' with { type: 'text' };
import gameoverCss from '../css/gameover.css' with { type: 'text' };
import settingsCss from '../css/settings.css' with { type: 'text' };
import controlsCss from '../css/controls.css' with { type: 'text' };
import fxCss from '../css/fx.css' with { type: 'text' };
import unitsCss from '../css/units.css' with { type: 'text' };
import worldCss from '../css/world.css' with { type: 'text' };
import introCss from '../css/intro.css' with { type: 'text' };
import embedCss from './embed.css' with { type: 'text' };
import { initializeCylonEffects } from './main.ts';

/** The stylesheets in the home page's order (README.md, "Stylesheets"), then the embed's own. */
const CSS = [kitCss, eyeCss, navCss, helpCss, hudCss, gameoverCss, settingsCss, controlsCss, fxCss, unitsCss, worldCss, introCss, embedCss];
const FONTS = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&display=swap';
/** Where the host page asks for the launcher; without it, the launcher sits in a corner. */
const SLOT_ID = 'cic-embed';
const LAUNCH_ID = 'cic-embed-launch';
const BAR_ID = 'cic-embed-bar';
/** Host elements that are never debris. */
const SKIP = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'TEMPLATE', 'IFRAME']);
/** Host content that flies as one piece (the game also scatters headings and asides). */
const DEBRIS = 'img, picture, figure, video, svg, blockquote, pre, table, form, button, input, h4, h5, h6, .wp-block-image, .wp-block-button';

const log = (message: string, err?: unknown): void => { console.error(`The CIC: ${message}`, err ?? ''); };

/** The combat bar: the home page header's game controls, with the same ids the game looks for. */
const BAR_HTML = `
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
</div>`;

/** The host's top-level elements become the game's page panels; static ones get a position so they stack above the hiding drones. */
function claimHostPage(skip: ReadonlySet<Element>): void {
  for (const el of Array.from(document.body.children)) {
    if (SKIP.has(el.tagName) || skip.has(el)) continue;
    el.classList.add('page-panel', 'cic-embed-host');
    if (getComputedStyle(el).position === 'static') el.classList.add('cic-embed-host-static');
    el.querySelectorAll(DEBRIS).forEach((d) => d.classList.add('cylon-debris'));
  }
}

let launched = false;

async function launch(button: HTMLButtonElement): Promise<void> {
  if (launched) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // The game stays still for a visitor who asks for less motion, as it does on the home page.
    button.textContent = 'The CIC Rests (Reduced Motion)';
    button.disabled = true;
    return;
  }
  if (document.getElementById('game-root') || document.getElementById(BAR_ID)) {
    log('this page already has a #game-root; not launching');
    return;
  }
  launched = true;
  button.remove();

  const fonts = document.createElement('link');
  fonts.rel = 'stylesheet';
  fonts.href = FONTS;
  document.head.appendChild(fonts);
  const style = document.createElement('style');
  style.id = 'cic-embed-style';
  style.textContent = CSS.join('\n');
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'game-root';
  root.dataset['game'] = 'cylon';
  const bar = document.createElement('header');
  bar.id = BAR_ID;
  bar.className = 'site-nav';
  bar.innerHTML = BAR_HTML;
  claimHostPage(new Set([root, bar]));
  document.body.prepend(root);
  document.body.appendChild(bar);
  document.documentElement.classList.add('cic-embed-on');
  document.body.classList.add('cic-embed-on');
  bar.querySelector('#cic-embed-leave')?.addEventListener('click', () => { location.reload(); });

  await initializeCylonEffects({ mountHtml, localScores: true });
  window.cylonStartGame?.();
}

function placeLauncher(): void {
  if (document.getElementById(LAUNCH_ID)) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.id = LAUNCH_ID;
  button.textContent = 'Play The CIC';
  button.title = 'Play The CIC on this page';
  // Inline styles only: the host's stylesheets stay the only ones until the game starts.
  button.setAttribute('style', [
    'font: 700 14px/1.2 system-ui, sans-serif', 'letter-spacing: .06em', 'color: #fff', 'background: #8a0a0a',
    'border: 1px solid #ff5555', 'border-radius: 6px', 'padding: 10px 16px', 'cursor: pointer',
    'box-shadow: 0 4px 14px rgba(0,0,0,.35)',
  ].join(';'));
  button.addEventListener('click', () => {
    launch(button).catch((err: unknown) => log('the game failed to start', err));
  });
  const slot = document.getElementById(SLOT_ID);
  if (slot) {
    slot.appendChild(button);
  } else {
    button.style.cssText += ';position:fixed;right:16px;bottom:16px;z-index:2147483000';
    document.body.appendChild(button);
  }
}

try {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try { placeLauncher(); } catch (err) { log('the launcher failed', err); }
    });
  } else {
    placeLauncher();
  }
} catch (err) {
  log('the launcher failed', err);
}
