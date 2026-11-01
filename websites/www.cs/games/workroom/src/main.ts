// The workroom page: starts the theme switch, reads which view and piece the
// server rendered, and draws it: a piece (its views, the answer bar and the
// notes panel), on the pieces list the unlock that fills in each piece's
// waiting count, or on Your studio the change of passphrase and the pairing of each AI key waiting for its code. Notes are sealed to the current key of the keyring the
// passphrase unlocks; this browser remembers that unlock for the same sign-in
// and keyring, so it is restored before the page draws. Nothing seals before an
// unlock or a restore.
import { render, h } from 'preact';
import { createAudioCore } from '../../_kit/audio/core.ts';
import { createApi } from './api.ts';
import type { PageApi } from './api.ts';
import { browserLock, browserMedia, browserStorage, browserThemePorts } from './browser.ts';
import { guideStore } from './guide.ts';
import { indexedDbOutbox } from './idb.ts';
import { draftUrl, loadDraft } from './load.ts';
import { createNotesSession } from './notes-session.ts';
import type { NotesSession } from './notes-session.ts';
import { createOutbox } from './outbox.ts';
import { readLimits } from './studio-limits.ts';
import { browserSound } from './render/browser-sound.ts';
import { indexedDbKeyMemory } from './remember.ts';
import { startTheme } from './theme.ts';
import { createVault } from './vault.ts';
import { demoPlayer } from './ui/demo-player.ts';
import { DeleteDraft } from './ui/DeleteDraft.tsx';
import { PiecesIndex } from './ui/PiecesIndex.tsx';
import { ChangePassphrase } from './ui/ChangePassphrase.tsx';
import { readConnect } from './ui/ConnectAi.tsx';
import { PairAi } from './ui/PairAi.tsx';
import { pairAi } from './pair-flow.ts';
import { changePassphrase } from './passphrase.ts';
import { ThemeRoot, ThemeSwitch } from './ui/ThemeSwitch.tsx';
import { Workroom } from './ui/Workroom.tsx';
import { mountComposer } from './ui/compose/mount.ts';

const theme = startTheme(browserThemePorts());
const switchHost = document.getElementById('theme-switch');
if (switchHost) render(h(ThemeSwitch, { handle: theme }), switchHost);

const root = document.getElementById('workroom');
const playDemo = demoPlayer(createAudioCore());
const { view, piece, version } = document.body.dataset;
/** What this studio may hold (the body's data-note-max, data-room). */
const { noteMax } = readLimits(document.body);
const fetcher = window.fetch.bind(window);
const api: PageApi = createApi(fetcher, document.querySelector('meta[name="csrf"]')?.getAttribute('content') ?? '');

/** The notes on this page view: the unlocked keys are remembered in IndexedDB as non-extractable keys; the outbox holds sealed notes only. */
function notesSession(): NotesSession {
  return createNotesSession({ api, vault: createVault(), outbox: createOutbox(indexedDbOutbox(), api, () => crypto.randomUUID(), browserLock(), noteMax), memory: indexedDbKeyMemory() });
}
const notes = notesSession();
const sound = browserSound();
/** How long the page waits to restore a remembered unlock before drawing locked: a stalled request must not keep it blank. */
const RESTORE_WAIT_MS = 5000;
if (root) await Promise.race([notes.restore(), new Promise(resolve => setTimeout(resolve, RESTORE_WAIT_MS))]);

function say(root: HTMLElement, text: string, role = 'alert'): void {
  const p = document.createElement('p');
  p.className = 'error';
  p.setAttribute('role', role);
  p.textContent = text;
  root.replaceChildren(p);
}

const changeHost = document.getElementById('change-passphrase');
if (view === 'studio') {
  if (changeHost) {
    render(h(ThemeRoot, { handle: theme }, h(ChangePassphrase, {
      change: (current, next, again) => changePassphrase(api, current, next, again),
      onChanged: () => { location.assign('studio.php?changed=passphrase'); },
    })), changeHost);
  }
  for (const host of document.querySelectorAll<HTMLElement>('[data-pair-ai]')) {
    const key = Number(host.dataset.pairAi);
    if (!Number.isInteger(key) || key < 1) continue;
    render(h(ThemeRoot, { handle: theme }, h(PairAi, {
      label: host.dataset.label ?? 'this key',
      pair: (code, passphrase) => pairAi(api, key, code, passphrase),
      onPaired: () => { location.assign('studio.php?paired=1'); },
    })), host);
  }
} else if (!root) {
  // A page without the workroom's place draws nothing more.
} else if (view === 'piece' && piece) {
  root.textContent = 'Loading…';
  const wanted = version && /^\d+$/.test(version) ? Number(version) : null;
  const loaded = await loadDraft(fetcher, piece, wanted);
  if (!loaded.ok) say(root, loaded.error);
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
      manage: h(DeleteDraft, {
        piece, title: loaded.score.piece.title, version: loaded.version, versions: loaded.versions,
        remove: (id, v) => api.deleteDraft(id, v), confirm: q => window.confirm(q), go: url => { location.assign(url); },
      }),
      notes,
      media: browserMedia(),
      buildSound: sound,
      sheet: loaded.sheet,
    })), root);
  }
} else if (view === 'compose') {
  await mountComposer({ root, theme, piece: piece ?? '', version, fetcher, api, buildSound: sound, say });
} else if (view === 'index') {
  root.textContent = '';
  const list = document.querySelector('.index-body');
  const copy = (text: string): Promise<void> => navigator.clipboard.writeText(text);
  if (list) render(h(ThemeRoot, { handle: theme }, h(PiecesIndex, { notes, list, connect: readConnect(document.body.dataset.connect), copy })), root);
} else {
  root.textContent = '';
}
