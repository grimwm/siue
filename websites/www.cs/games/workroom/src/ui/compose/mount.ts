// The compose page (compose.php): the catalogue from the shared library, then the editor on the piece's newest draft, or
// New Piece first. Notes sound through one AudioContext made on the first key (a browser starts sound only after a
// gesture), from the samples the renderer decodes, so each file is fetched and decoded once for both.
import { h, render } from 'preact';
import type { PageApi } from '../../api.ts';
import { catalogue } from '../../catalogue.ts';
import type { Entry } from '../../catalogue.ts';
import { docFromScore, newDoc } from '../../compose/doc.ts';
import { createSampler } from '../../compose/sampler.ts';
import { loadDraft } from '../../load.ts';
import type { Fetch } from '../../load.ts';
import { defaultDeps, LIBRARY_BASE, loadInstruments } from '../../render/engine.ts';
import type { Library } from '../../render/plan.ts';
import type { BuildSound } from '../../render/sound.ts';
import type { ThemeHandle } from '../../theme.ts';
import { ThemeRoot } from '../ThemeSwitch.tsx';
import { Composer } from './Composer.tsx';
import type { ComposerStart } from './Composer.tsx';
import { NewPiece } from './NewPiece.tsx';

export interface MountArgs {
  root: HTMLElement;
  theme: ThemeHandle;
  piece: string;
  version: string | undefined;
  fetcher: Fetch;
  api: PageApi;
  buildSound: BuildSound;
  say(root: HTMLElement, text: string): void;
}

function readJson<T>(text: string | undefined, fallback: T): T {
  try {
    return text ? (JSON.parse(text) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function mountComposer(a: MountArgs): Promise<void> {
  a.root.textContent = 'Loading…';
  let lib: Library;
  try {
    const reply = await fetch(`${LIBRARY_BASE}library.json`);
    if (!reply.ok) throw new Error(`the server answered ${reply.status}`);
    lib = (await reply.json()) as Library;
  } catch (e) {
    a.say(a.root, `The instruments could not be loaded: ${e instanceof Error ? e.message : String(e)}. Reload the page to try again.`);
    return;
  }
  const entries = catalogue(lib);
  let ctx: AudioContext | null = null;
  const context = (): AudioContext => {
    ctx ??= new AudioContext({ latencyHint: 'interactive' });
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  };
  const deps = defaultDeps();
  const sampler = createSampler({
    context,
    library: async () => lib,
    load: (l, instrument, only) => loadInstruments(l, [instrument], deps.fetchBytes, deps.decode, undefined, only),
  });
  const click = (accent: boolean): void => {
    const c = context();
    const osc = c.createOscillator();
    const amp = c.createGain();
    osc.frequency.value = accent ? 1760 : 1320;
    amp.gain.setValueAtTime(0.25, c.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
    osc.connect(amp).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.1);
  };
  const open = (start: ComposerStart): void => {
    a.root.textContent = '';
    render(h(ThemeRoot, { handle: a.theme }, h(Composer, {
      start, entries: entries as Entry[], api: a.api, sampler, buildSound: a.buildSound, click,
      now: () => performance.now() / 1000,
      onSaved: piece => { history.replaceState(null, '', `compose.php?id=${encodeURIComponent(piece)}`); },
    })), a.root);
  };

  if (a.piece === '') {
    const body = document.body.dataset;
    a.root.textContent = '';
    render(h(ThemeRoot, { handle: a.theme }, h(NewPiece, {
      taken: readJson<string[]>(body['pieces'], []),
      projects: readJson<{ id: string; name: string }[]>(body['projects'], []),
      onStart: (piece, project) => { render(null, a.root); open({ doc: newDoc(piece.title), piece, project, version: 0 }); },
    })), a.root);
    return;
  }
  const wanted = a.version && /^\d+$/.test(a.version) ? Number(a.version) : null;
  const loaded = await loadDraft(a.fetcher, a.piece, wanted);
  if (!loaded.ok) { a.say(a.root, loaded.error); return; }
  if (loaded.score.kind !== 'music') { a.say(a.root, 'Only a music piece can be composed here: a sound piece has no bars to write in.'); return; }
  open({ doc: docFromScore(loaded.score, entries), piece: loaded.score.piece, project: loaded.score.project, version: Math.max(...loaded.versions) });
}
