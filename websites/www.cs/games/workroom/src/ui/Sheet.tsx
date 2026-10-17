// Sheet music: a lane picker and the notation of the chosen lane. The notation
// library is a separate bundle, fetched when this view first opens.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Lane } from '../score.ts';

export interface SheetProps { musicxmlSrc: string; laneId: string; lanes: Lane[]; onLane(id: string): void }

interface SheetModule { renderSheet(el: HTMLElement, musicxml: string, laneId: string): Promise<void> }

export function Sheet(p: SheetProps) {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let current = true;
    setError(null);
    (async () => {
      const reply = await fetch(p.musicxmlSrc);
      if (reply.redirected) throw new Error('Your sign-in ended. Sign in again.');
      if (!reply.ok) throw new Error(`The sheet music file did not load (${reply.status}).`);
      const xml = await reply.text();
      const mod = (await import(/* @vite-ignore */ new URL('./sheet.js', import.meta.url).href)) as SheetModule;
      if (current && host.current) await mod.renderSheet(host.current, xml, p.laneId);
    })().catch((e: unknown) => { if (current) setError(e instanceof Error ? e.message : 'The sheet music could not be drawn.'); });
    return () => { current = false; };
  }, [p.musicxmlSrc, p.laneId]);
  return (
    <div class="sheet-view">
      <div class="lane-picker" role="group" aria-label="Instrument">
        {p.lanes.map(l => <button type="button" class="chip" aria-pressed={l.id === p.laneId} onClick={() => p.onLane(l.id)}>{l.name}</button>)}
      </div>
      {error ? <p class="error" role="alert">{error}</p> : null}
      <div id="sheet" ref={host} />
    </div>
  );
}
