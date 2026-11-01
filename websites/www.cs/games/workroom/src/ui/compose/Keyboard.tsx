// The on-screen keys: two octaves of piano keys from a C, moved with ‹ Lower and Higher ›, or a drum part's pads, one
// per drum. Every key is its own pointer target, so several fingers play a chord, and each key sounds while it is held.
// The keys never take the focus, so pressing them never scrolls the page to them.
import { useEffect, useRef } from 'preact/hooks';
import type { Entry } from '../../catalogue.ts';
import { rangeClass } from '../../catalogue.ts';
import { screenKeys } from '../../compose/keys.ts';
import { pitchName } from '../../pianoroll.ts';
import { Button } from '../console/Button.tsx';
import { cx } from '../console/cx.ts';

export interface KeyboardProps {
  entry: Entry;
  start: number;
  held: ReadonlySet<number>;
  onStart(start: number): void;
  onDown(pitch: number): void;
  onUp(pitch: number): void;
}

const OCTAVES = 2;
/** A black key is dark in both themes, a little see-through so the rows behind show, as on the approved mockup. */
const BLACK_KEY = 'rgba(30, 24, 18, 0.82)';

export function Keyboard(p: KeyboardProps) {
  const pointers = useRef(new Map<number, number>());
  const press = (e: PointerEvent, pitch: number): void => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, pitch);
    p.onDown(pitch);
  };
  const lift = (e: PointerEvent): void => {
    const pitch = pointers.current.get(e.pointerId);
    if (pitch === undefined) return;
    pointers.current.delete(e.pointerId);
    p.onUp(pitch);
  };
  // A key let go off the keyboard (the pointer slid away first) still stops.
  const liftRef = useRef(lift);
  liftRef.current = lift;
  useEffect(() => {
    const off = (e: PointerEvent): void => liftRef.current(e);
    window.addEventListener('pointerup', off);
    window.addEventListener('pointercancel', off);
    return () => { window.removeEventListener('pointerup', off); window.removeEventListener('pointercancel', off); };
  }, []);
  // A finger sliding onto another key plays that one, the way a glissando does.
  const enter = (e: PointerEvent, pitch: number): void => {
    if (e.buttons === 0) return;
    const was = pointers.current.get(e.pointerId);
    if (was === undefined || was === pitch) return;
    pointers.current.set(e.pointerId, pitch);
    p.onUp(was);
    p.onDown(pitch);
  };
  const handlers = (pitch: number) => ({
    onPointerDown: (e: PointerEvent) => press(e, pitch),
    onPointerUp: lift, onPointerCancel: lift,
    onPointerEnter: (e: PointerEvent) => enter(e, pitch),
    onContextMenu: (e: Event) => e.preventDefault(),
  });

  if (p.entry.pieces) {
    return (
      <div data-keyboard="drums" role="group" aria-label="Drum pads" class="grid grid-cols-4 gap-2 select-none">
        {p.entry.pieces.map(([pitch, name]) => (
          <button type="button" tabIndex={-1} data-key={pitch} aria-label={name} aria-pressed={p.held.has(pitch)} {...handlers(pitch)}
            class={cx('min-h-16 touch-none rounded-lg border border-rule px-2 font-display text-sm font-semibold uppercase', p.held.has(pitch) ? 'bg-amber text-on-accent' : 'bg-panel text-ink')}>
            {name}
          </button>
        ))}
      </div>
    );
  }
  const keys = screenKeys(p.start, OCTAVES);
  const whites = keys.filter(k => !k.black);
  const w = 100 / whites.length;
  return (
    <div class="grid gap-2">
      <div class="flex items-center justify-between gap-2">
        <Button onClick={() => p.onStart(Math.max(0, p.start - 12))} disabled={p.start <= 0}>‹ Lower</Button>
        <span data-keys-from="" class="font-mono text-sm text-dim">{pitchName(p.start)}–{pitchName(Math.min(127, p.start + 12 * OCTAVES))}</span>
        <Button onClick={() => p.onStart(Math.min(108, p.start + 12))} disabled={p.start >= 108}>Higher ›</Button>
      </div>
      <div data-keyboard="keys" role="group" aria-label="Keyboard" class="relative h-36 touch-none select-none">
        {whites.map((k, i) => {
          const range = rangeClass(p.entry, k.pitch);
          return (
            <button type="button" tabIndex={-1} data-key={k.pitch} aria-label={pitchName(k.pitch)} aria-pressed={p.held.has(k.pitch)} {...handlers(k.pitch)}
              class={cx('absolute top-0 h-full rounded-b-md border border-rule pb-1 font-mono text-[10px] flex items-end justify-center',
                p.held.has(k.pitch) ? 'bg-amber text-on-accent' : range === 'out' ? 'bg-record/20 text-ink' : range === 'expert' ? 'bg-amber/20 text-ink' : 'bg-paper text-dim')}
              style={{ left: `${i * w}%`, width: `${w}%` }}>{k.pitch % 12 === 0 ? pitchName(k.pitch) : ''}</button>
          );
        })}
        {keys.filter(k => k.black).map(k => {
          const before = whites.filter(x => x.pitch < k.pitch).length;
          return (
            <button type="button" tabIndex={-1} data-key={k.pitch} aria-label={pitchName(k.pitch)} aria-pressed={p.held.has(k.pitch)} {...handlers(k.pitch)}
              class={cx('absolute top-0 z-10 h-[60%] rounded-b-md border-[1.5px] border-paper/75', p.held.has(k.pitch) && 'bg-amber')}
              style={{ left: `${(before - 0.3) * w}%`, width: `${w * 0.6}%`, ...(p.held.has(k.pitch) ? {} : { background: BLACK_KEY }) }} />
          );
        })}
      </div>
    </div>
  );
}
