// websites/www.cs/games/_kit/ui/install-bar.tsx
// The Install and Share buttons, iOS's Add to Home Screen steps and the
// shared address, drawn from an InstallView (install.ts). mountInstallBar()
// wires one to the browser and brings its own small stylesheet.
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { Button } from './button.tsx';
import { Dialog } from './dialog.tsx';
import { createInstall, IOS_STEPS } from '../install.ts';
import type { Install, InstallEnv, InstallSetup, InstallView } from '../install.ts';

export interface InstallBarProps {
  view: InstallView;
  shareUrl: string;
  onInstall: () => void;
  onShare: () => void;
  onCloseSteps: () => void;
  onCloseShare: () => void;
}

/** iOS's Share glyph: a box with an arrow out of its top. */
function ShareGlyph() {
  return (
    <svg class="kit-install-glyph" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M8 10H6v11h12V10h-2" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

export function InstallBar(p: InstallBarProps) {
  const v = p.view;
  const field = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (v.share !== 'field') return;
    field.current?.focus();
    field.current?.select?.();
  }, [v.share]);
  if (v.off) return null;
  return (
    <span class="kit-install">
      {v.install && (
        <Button id="install-btn" class={v.highlight ? 'kit-install-btn kit-install-asked' : 'kit-install-btn'}
          title="Install this game as an app" onClick={p.onInstall}>Install</Button>
      )}
      <Button id="share-btn" class="kit-install-btn" title="Share a link to this game" onClick={p.onShare}>Share</Button>
      <span id="share-status" class="kit-install-status" role="status">{v.share === 'copied' ? 'Link copied' : null}</span>
      {v.share === 'field' && (
        <input id="share-url" class="kit-install-url" type="text" readOnly value={p.shareUrl} aria-label="Link to this game"
          ref={field} onKeyDown={ev => {
            if (ev.key !== 'Escape') return;
            ev.preventDefault();
            p.onCloseShare();
          }} />
      )}
      <Dialog open={v.steps} id="install-steps" veilClass="kit-install-veil" panelClass="kit-install-panel"
        titleId="install-steps-title" title="Add to Home Screen" focusId="install-steps-done" onDismiss={p.onCloseSteps}>
        <p id="install-steps-text"><ShareGlyph />{IOS_STEPS}.</p>
        <Button id="install-steps-done" class="kit-install-btn" onClick={p.onCloseSteps}>Done</Button>
      </Dialog>
    </span>
  );
}

// The bar's own look, first in <head> so the page's CSS can restyle it.
const CSS = `
.kit-install { display: inline-flex; align-items: center; gap: 0.5rem; }
.kit-install-btn { font: 600 0.9rem/1.1 system-ui, sans-serif; padding: 0.3rem 0.75rem; border: 1px solid var(--kit-install-accent, #f0b429); border-radius: 6px; background: transparent; color: var(--kit-install-accent, #f0b429); cursor: pointer; }
.kit-install-btn:hover, .kit-install-btn:focus-visible { background: color-mix(in srgb, var(--kit-install-accent, #f0b429) 18%, transparent); }
.kit-install-btn:focus-visible { outline: 2px solid var(--kit-install-accent, #f0b429); outline-offset: 2px; }
.kit-install-asked { background: var(--kit-install-accent, #f0b429); color: #000; animation: kit-install-pulse 1.2s ease-in-out 3; }
@keyframes kit-install-pulse { 50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--kit-install-accent, #f0b429) 40%, transparent); } }
@media (prefers-reduced-motion: reduce) { .kit-install-asked { animation: none; } }
.kit-install-status { color: var(--kit-install-accent, #f0b429); white-space: nowrap; }
/* Always in the page, so a screen reader announces the text when it arrives; empty, it takes no room. */
.kit-install-status:empty { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.kit-install-url { width: min(22rem, 55vw); padding: 0.25rem 0.4rem; font: 500 0.85rem/1.2 ui-monospace, monospace; }
.kit-install-veil { position: fixed; inset: 0; z-index: 3000; display: grid; place-items: center; padding: 1rem; background: rgba(0, 0, 0, 0.6); }
.kit-install-veil[hidden] { display: none; }
.kit-install-panel { max-width: 22rem; padding: 1.25rem; border-radius: 12px; background: #11141b; color: #eef1f6; font: 500 1rem/1.45 system-ui, sans-serif; }
.kit-install-panel h2 { margin: 0 0 0.5rem; font-size: 1.15rem; }
.kit-install-glyph { vertical-align: -0.3em; margin-right: 0.4rem; }
.kit-install-corner { position: fixed; top: 0.5rem; right: 0.5rem; z-index: 2900; }
`;

function addStyles(): void {
  if (document.getElementById('kit-install-css')) return;
  const style = document.createElement('style');
  style.id = 'kit-install-css';
  style.textContent = CSS;
  document.head.prepend(style);
}

/** Draws the bar into `root` and keeps it current as the browser offers, installs and shares. */
export function mountInstallBar(root: Element, setup: InstallSetup, env: InstallEnv): Install {
  addStyles();
  // A prompt held back before the bar mounted arrives during createInstall; the first draw below shows it.
  let draw = (_v: InstallView): void => {};
  const install = createInstall(env, setup, v => draw(v));
  draw = v => render(
    <InstallBar view={v} shareUrl={setup.shareUrl}
      onInstall={() => { void install.pressInstall(); }} onShare={() => { void install.pressShare(); }}
      onCloseSteps={install.closeSteps} onCloseShare={install.closeShare} />,
    root);
  draw(install.view());
  return install;
}
