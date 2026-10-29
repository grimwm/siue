// Sheet music: a lane picker and the notation of the chosen lane. The notation
// library is a separate bundle, fetched when this view first opens.
import { useEffect, useRef, useState } from 'preact/hooks';
import { siblingUrl } from '../load.ts';
import type { Lane } from '../score.ts';
import type { SheetHandle } from '../sheetlife.ts';
import { Chip } from './console/Chip.tsx';

export interface SheetModule { mountSheet(el: HTMLElement): SheetHandle }
/** The two things the view fetches, replaceable in tests. */
export interface SheetPorts { fetchText(url: string): Promise<string>; loadModule(): Promise<SheetModule> }
export interface SheetMusicProps { musicxmlSrc: string; laneId: string; lanes: Lane[]; onLane(id: string): void; ports?: SheetPorts }

const realPorts: SheetPorts = {
  async fetchText(url) {
    const reply = await fetch(url);
    if (reply.redirected) throw new Error('Your sign-in ended. Sign in again.');
    if (!reply.ok) throw new Error(`The sheet music file did not load (${reply.status}).`);
    return reply.text();
  },
  async loadModule() {
    try {
      return (await import(siblingUrl(import.meta.url, 'sheet.js'))) as SheetModule;
    } catch {
      throw new Error('The sheet music renderer did not load. Check the connection and reload the page.');
    }
  },
};

/** What a view that was left before its file arrived mounts: nothing to draw into, nothing to dispose. */
const NO_SHEET: SheetHandle = { async show() {}, dispose() {} };

interface Mounted { xml: string; sheet: SheetHandle }

export function SheetMusic(p: SheetMusicProps) {
  const host = useRef<HTMLDivElement>(null);
  const mounted = useRef<Promise<Mounted> | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const ports = p.ports ?? realPorts;

  // Leaving the view (or changing the file) clears the notation and its listener.
  useEffect(() => () => {
    const m = mounted.current;
    mounted.current = null;
    void m?.then(x => x.sheet.dispose(), () => {});
  }, [p.musicxmlSrc]);

  // One notation per container: the first run fetches and mounts, every lane draws through the same handle.
  useEffect(() => {
    let current = true;
    setStatus('loading');
    mounted.current ??= Promise.all([ports.fetchText(p.musicxmlSrc), ports.loadModule()]).then(([xml, mod]) => ({ xml, sheet: host.current ? mod.mountSheet(host.current) : NO_SHEET }));
    const mine = mounted.current;
    mine.then(m => m.sheet.show(m.xml, p.laneId, p.lanes.find(l => l.id === p.laneId)?.name)).then(
      () => { if (current) setStatus('ready'); },
      (e: unknown) => {
        if (mounted.current === mine) mounted.current = null; // a failed fetch is tried again next time
        if (!current) return;
        setError(e instanceof Error ? e.message : 'The sheet music could not be drawn.');
        setStatus('error');
      },
    );
    return () => { current = false; };
  }, [p.musicxmlSrc, p.laneId]);

  return (
    <div class="sheet-view grid gap-2 p-2">
      <div class="lane-picker flex flex-wrap gap-2" role="group" aria-label="Instrument" data-guide="lane-picker">
        {p.lanes.map(l => <Chip pressed={l.id === p.laneId} onClick={() => p.onLane(l.id)}>{l.name}</Chip>)}
      </div>
      {status === 'loading' ? <p class="loading" role="status">Loading sheet music…</p> : null}
      {status === 'error' ? <p class="error" role="alert">{error}</p> : null}
      <div id="sheet" data-guide="sheet" class="overflow-x-auto rounded-md bg-paper p-2" ref={host} />
    </div>
  );
}
