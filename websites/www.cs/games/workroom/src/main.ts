// The workroom page: starts the theme switch, reads which view and piece the
// server rendered, loads the draft over the session and draws it. The index view has nothing to draw yet.
import { render, h } from 'preact';
import { createAudioCore } from '../../_kit/audio/core.ts';
import { browserStorage, browserThemePorts } from './browser.ts';
import { guideStore } from './guide.ts';
import { draftUrl, loadDraft } from './load.ts';
import { startTheme } from './theme.ts';
import { demoPlayer } from './ui/demo-player.ts';
import { ThemeRoot, ThemeSwitch } from './ui/ThemeSwitch.tsx';
import { Workroom } from './ui/Workroom.tsx';

const theme = startTheme(browserThemePorts());
const switchHost = document.getElementById('theme-switch');
if (switchHost) render(h(ThemeSwitch, { handle: theme }), switchHost);

const root = document.getElementById('workroom')!;
const playDemo = demoPlayer(createAudioCore());
const { view, piece, version } = document.body.dataset;

function say(text: string, role = 'alert'): void {
  const p = document.createElement('p');
  p.className = 'error';
  p.setAttribute('role', role);
  p.textContent = text;
  root.replaceChildren(p);
}

if (view === 'piece' && piece) {
  root.textContent = 'Loading…';
  const wanted = version && /^\d+$/.test(version) ? Number(version) : null;
  const loaded = await loadDraft(window.fetch.bind(window), piece, wanted);
  if (!loaded.ok) say(loaded.error);
  else {
    root.textContent = '';
    render(h(ThemeRoot, { handle: theme }, h(Workroom, {
      score: loaded.score,
      version: loaded.version,
      versions: loaded.versions,
      audioSrc: file => draftUrl(piece, loaded.version, file),
      guide: guideStore(browserStorage()),
      playDemo,
      stopDemo: playDemo.stop,
      onVersion: v => { location.search = `?id=${encodeURIComponent(piece)}&v=${v}`; },
    })), root);
  }
} else {
  root.textContent = '';
}
