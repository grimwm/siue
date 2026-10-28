// The workroom page: starts the theme switch, reads which view and piece the
// server rendered, and draws it: a piece (its views, the answer bar and the
// notes panel), or on the pieces list the unlock that fills in each piece's
// waiting count. Notes are sealed to the current key of the keyring the
// passphrase unlocks; this browser remembers that unlock for the same sign-in
// and keyring, so it is restored before the page draws. Nothing seals before an
// unlock or a restore.
import { render, h } from 'preact';
import { createAudioCore } from '../../_kit/audio/core.ts';
import { createApi } from './api.ts';
import { browserLock, browserMedia, browserStorage, browserThemePorts } from './browser.ts';
import { guideStore } from './guide.ts';
import { indexedDbOutbox } from './idb.ts';
import { draftUrl, loadDraft } from './load.ts';
import { createNotesSession } from './notes-session.ts';
import type { NotesSession } from './notes-session.ts';
import { createOutbox } from './outbox.ts';
import { indexedDbKeyMemory } from './remember.ts';
import { startTheme } from './theme.ts';
import { createVault } from './vault.ts';
import { demoPlayer } from './ui/demo-player.ts';
import { PiecesIndex } from './ui/PiecesIndex.tsx';
import { ThemeRoot, ThemeSwitch } from './ui/ThemeSwitch.tsx';
import { Workroom } from './ui/Workroom.tsx';

const theme = startTheme(browserThemePorts());
const switchHost = document.getElementById('theme-switch');
if (switchHost) render(h(ThemeSwitch, { handle: theme }), switchHost);

const root = document.getElementById('workroom')!;
const playDemo = demoPlayer(createAudioCore());
const { view, piece, version } = document.body.dataset;
const fetcher = window.fetch.bind(window);

/** The notes on this page view: the unlocked keys are remembered in IndexedDB as non-extractable keys; the outbox holds sealed notes only. */
function notesSession(): NotesSession {
  const api = createApi(fetcher, document.querySelector('meta[name="csrf"]')?.getAttribute('content') ?? '');
  return createNotesSession({ api, vault: createVault(), outbox: createOutbox(indexedDbOutbox(), api, () => crypto.randomUUID(), browserLock()), memory: indexedDbKeyMemory() });
}
const notes = notesSession();
/** How long the page waits to restore a remembered unlock before drawing locked: a stalled request must not keep it blank. */
const RESTORE_WAIT_MS = 5000;
await Promise.race([notes.restore(), new Promise(resolve => setTimeout(resolve, RESTORE_WAIT_MS))]);

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
  const loaded = await loadDraft(fetcher, piece, wanted);
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
      notes,
      media: browserMedia(),
    })), root);
  }
} else if (view === 'index') {
  root.textContent = '';
  const list = document.querySelector('.index-body');
  if (list) render(h(ThemeRoot, { handle: theme }, h(PiecesIndex, { notes, list })), root);
} else {
  root.textContent = '';
}
