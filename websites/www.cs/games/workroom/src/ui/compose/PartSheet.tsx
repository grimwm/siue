// The selected part as sheet music, engraved live from the editor's document (compose/toxml.ts) through the page's
// sheet bundle: one long line that scrolls right, in the instrument's clef, written as its players read it (or how it
// sounds, with Concert Pitch), amber and red notes coloured as on the grid, the playhead's bar lit. It is engraved
// again a moment after the last edit. Its box keeps a fixed height, so a new drawing never moves the page.
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Entry } from '../../catalogue.ts';
import type { EditDoc } from '../../compose/doc.ts';
import { toMusicXml } from '../../compose/toxml.ts';
import type { SheetHandle } from '../../sheetlife.ts';
import type { SheetModule } from '../SheetMusic.tsx';

/** Edits closer together than this are engraved once. */
export const ENGRAVE_AFTER_MS = 250;

export interface PartSheetProps {
  doc: EditDoc;
  part: string;
  entries: readonly Entry[];
  concert: boolean;
  /** The bar the playhead is in, lit on the sheet; null lights none. */
  bar: number | null;
  loadSheet(): Promise<SheetModule>;
  /** The scrolling box, for the Both view to scroll with the grid. */
  boxRef?: { current: HTMLDivElement | null };
  onScroll?(): void;
  class?: string;
}

export function PartSheet(p: PartSheetProps) {
  const host = useRef<HTMLDivElement>(null);
  const sheet = useRef<Promise<SheetHandle> | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => () => { void sheet.current?.then(s => s.dispose(), () => {}); sheet.current = null; }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      let xml: string;
      try {
        xml = toMusicXml(p.doc, p.entries, { parts: [p.part], concert: p.concert });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setState('error');
        return;
      }
      sheet.current ??= p.loadSheet().then(mod => {
        const s = mod.mountSheet(host.current!, text => text);
        s.layout({ continuous: true, zoom: 1 }, false);
        return s;
      });
      const mine = sheet.current;
      mine.then(s => s.show(xml, p.part)).then(() => { setState('ready'); }, (e: unknown) => {
        if (sheet.current === mine) sheet.current = null;
        setError(e instanceof Error ? e.message : 'The sheet music could not be drawn.');
        setState('error');
      });
    }, ENGRAVE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [p.doc, p.part, p.concert]);
  useEffect(() => { void sheet.current?.then(s => s.mark(p.bar), () => {}); }, [p.bar, state]);

  return (
    <div class={`grid gap-1 ${p.class ?? ''}`}>
      <div ref={el => { if (p.boxRef) p.boxRef.current = el; }} data-part-sheet="" onScroll={p.onScroll}
        class="relative h-72 overflow-auto rounded-lg border border-rule bg-paper p-2 [overflow-anchor:none]" aria-label="Your part as sheet music">
        <div ref={host} class="min-w-full" />
      </div>
      <p data-sheet-state="" aria-live="polite" class="h-5 truncate font-mono text-xs text-dim">
        {state === 'loading' ? 'Writing the sheet music…' : state === 'error' ? error : ''}
      </p>
    </div>
  );
}
