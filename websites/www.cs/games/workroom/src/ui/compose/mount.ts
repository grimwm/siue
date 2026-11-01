// The compose page (compose.php): the catalogue from the shared library, then the editor on the piece's newest draft, or
// New Piece first. Notes sound through one AudioContext made on the first key (a browser starts sound only after a
// gesture), from the samples the renderer decodes, so each file is fetched and decoded once for both.
import { h, render } from 'preact';
import type { PageApi } from '../../api.ts';
import { catalogue } from '../../catalogue.ts';
import type { Entry } from '../../catalogue.ts';
import { docFromScore, newDoc } from '../../compose/doc.ts';
import type { EditDoc } from '../../compose/doc.ts';
import type { XmlDocument } from '../../compose/fromxml.ts';
import { browserInflate } from '../../compose/mxl.ts';
import { createSampler } from '../../compose/sampler.ts';
import { loadDraft } from '../../load.ts';
import type { Fetch } from '../../load.ts';
import { defaultDeps, LIBRARY_BASE, loadInstruments } from '../../render/engine.ts';
import type { Library } from '../../render/plan.ts';
import type { BuildSound } from '../../render/sound.ts';
import type { ThemeHandle } from '../../theme.ts';
import { loadSheetModule } from '../SheetMusic.tsx';
import { ThemeRoot } from '../ThemeSwitch.tsx';
import type { ComposerFiles } from './Composer.tsx';
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

/** Sheet music, import and export in the browser: the sheet bundle, DOMParser (which loads nothing from outside the file), DecompressionStream, and a download. */
const FILES: ComposerFiles = {
  loadSheet: loadSheetModule,
  importPorts: {
    parseXml: text => new DOMParser().parseFromString(text, 'application/xml') as unknown as XmlDocument,
    inflate: browserInflate,
    now: () => performance.now(),
  },
  save(name, data) {
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};

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
  const body = document.body.dataset;
  const taken = (): string[] => readJson<string[]>(body['pieces'], []);
  const projects = (): { id: string; name: string }[] => readJson<{ id: string; name: string }[]>(body['projects'], []);
  /** New Piece: its title and project, then the editor on `doc` (an empty piece, or one made from an imported file). */
  const startNew = (doc: EditDoc | null, title?: string, note?: string): void => {
    a.root.textContent = '';
    render(h(ThemeRoot, { handle: a.theme }, h(NewPiece, {
      taken: taken(), projects: projects(), title, note,
      onStart: (piece, project) => {
        render(null, a.root);
        history.replaceState(null, '', 'compose.php');
        open({ doc: doc ? { ...doc, title: piece.title } : newDoc(piece.title), piece, project, version: 0 });
      },
    })), a.root);
  };
  const open = (start: ComposerStart): void => {
    a.root.textContent = '';
    render(h(ThemeRoot, { handle: a.theme }, h(Composer, {
      start, entries: entries as Entry[], api: a.api, sampler, buildSound: a.buildSound, click, files: FILES,
      now: () => performance.now() / 1000,
      onSaved: piece => { history.replaceState(null, '', `compose.php?id=${encodeURIComponent(piece)}`); },
      onNewPiece: (doc, title) => {
        render(null, a.root);
        startNew(doc, title, `${doc.parts.length} ${doc.parts.length === 1 ? 'part' : 'parts'} from the file you imported, at its own speed.`);
      },
    })), a.root);
  };

  if (a.piece === '') {
    startNew(null);
    return;
  }
  const wanted = a.version && /^\d+$/.test(a.version) ? Number(a.version) : null;
  const loaded = await loadDraft(a.fetcher, a.piece, wanted);
  if (!loaded.ok) { a.say(a.root, loaded.error); return; }
  if (loaded.score.kind !== 'music') { a.say(a.root, 'Only a music piece can be composed here: a sound piece has no bars to write in.'); return; }
  open({ doc: docFromScore(loaded.score, entries), piece: loaded.score.piece, project: loaded.score.project, version: Math.max(...loaded.versions) });
}
