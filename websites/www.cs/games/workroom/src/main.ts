// The workroom page: reads which view and piece the server rendered, loads the
// draft over the session and draws it. The index view has nothing to draw yet.
import { render, h } from 'preact';
import { draftUrl, loadDraft } from './load.ts';
import { Workroom } from './ui/Workroom.tsx';

const root = document.getElementById('workroom')!;
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
    render(h(Workroom, {
      score: loaded.score,
      version: loaded.version,
      versions: loaded.versions,
      audioSrc: file => draftUrl(piece, loaded.version, file),
      onVersion: v => { location.search = `?id=${encodeURIComponent(piece)}&v=${v}`; },
    }), root);
  }
} else {
  root.textContent = '';
}
