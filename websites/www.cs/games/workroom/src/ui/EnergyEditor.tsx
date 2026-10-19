// Drawing the energy the owner wants: a 160 px well over the shared time axis,
// the energy now as a dashed line, each stroke replacing the curve under its
// own time span, the sections faint behind for orientation. Pointer only; the
// buttons under it send the shape, start over or leave. While a stroke is in
// progress it holds the playhead's follow (onHold), as the other views do, so
// playback never scrolls the drawing under the finger.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { axisTicks } from '../axis.ts';
import { readableOn } from '../color.ts';
import { ENERGY_EDIT_H, curveToPixels, redraw, strokeFromPixels } from '../energy.ts';
import type { Curve } from '../energy.ts';
import type { Score } from '../score.ts';
import { sectionTimes } from '../tempo.ts';
import type { TempoMap } from '../tempo.ts';
import { timeToX } from '../zoom.ts';
import type { View } from '../zoom.ts';
import { Button } from './console/Button.tsx';
import { AXIS_H, Axis } from './parts.tsx';
import { useTheme } from './theme-context.ts';

export interface EnergyEditorProps { score: Score; tempo: TempoMap; view: View; busy: boolean; onSend(curve: Curve): void; onCancel(): void; /** true while a stroke is being drawn, false once it ends or is cancelled. */ onHold?(held: boolean): void }

interface PointerLike { pointerId: number; clientX: number; clientY: number; currentTarget: Element }
const local = (e: PointerLike): [number, number] => {
  const r = e.currentTarget.getBoundingClientRect();
  return [e.clientX - (r.left || 0), e.clientY - (r.top || 0)];
};
const points = (pts: readonly [number, number][]): string => pts.map(([x, y]) => `${x},${y}`).join(' ');
const copy = (c: readonly [number, number][]): Curve => c.map(([t, v]): [number, number] => [t, v]);

export function EnergyEditor(p: EnergyEditorProps) {
  const { score, view } = p;
  const theme = useTheme();
  const [curve, setCurve] = useState<Curve>(() => copy(score.energy));
  const [drawn, setDrawn] = useState(false);
  const [live, setLive] = useState<[number, number][]>([]);
  const stroke = useRef<[number, number][] | null>(null);
  const pointer = useRef<number | null>(null);
  const latest = useRef(p);
  latest.current = p;
  // A drawing left mid-stroke never sees its release.
  useEffect(() => () => { if (stroke.current) latest.current.onHold?.(false); }, []);
  const sections = useMemo(() => score.sections.map(s => ({ ...sectionTimes(s, p.tempo, score.duration), id: s.id, fill: readableOn(theme, s.color, 'mark') })), [score, p.tempo, theme]);
  const height = ENERGY_EDIT_H + AXIS_H;
  const end = (): void => {
    const s = stroke.current;
    stroke.current = null;
    pointer.current = null;
    setLive([]);
    if (s) p.onHold?.(false);
    if (!s) return;
    const drawing = strokeFromPixels(s, view);
    if (drawing.length < 2) return; // a tap draws nothing
    setCurve(c => redraw(c, drawing, score.duration));
    setDrawn(true);
  };
  return (
    <div class="grid gap-2">
      <svg data-energy-editor="" data-guide="energy-editor" class="block max-w-full cursor-crosshair touch-none select-none" width={view.width} height={height} viewBox={`0 0 ${view.width} ${height}`}
        role="img" aria-label="The energy drawing: drag across it to draw the shape you want"
        onPointerDown={(e: PointerLike) => { if (stroke.current) return; pointer.current = e.pointerId; e.currentTarget.setPointerCapture?.(e.pointerId); stroke.current = [local(e)]; setLive([local(e)]); p.onHold?.(true); }}
        onPointerMove={(e: PointerLike) => { const s = stroke.current; if (!s || e.pointerId !== pointer.current) return; s.push(local(e)); setLive(s.slice()); }}
        onPointerUp={(e: PointerLike) => { if (e.pointerId === pointer.current) end(); }}
        onPointerCancel={(e: PointerLike) => { if (!stroke.current || e.pointerId !== pointer.current) return; p.onHold?.(false); stroke.current = null; pointer.current = null; setLive([]); }}>
        <rect class="fill-well" x={0} y={0} width={view.width} height={ENERGY_EDIT_H} />
        {sections.map(s => <rect class="pointer-events-none opacity-20" data-energy-section={s.id} x={timeToX(view, s.from)} y={0} width={Math.max(0, (s.to - s.from) * view.pxPerSec)} height={ENERGY_EDIT_H} fill={s.fill} />)}
        <polyline data-energy-now="" class="pointer-events-none stroke-dim" fill="none" stroke-width={2} stroke-dasharray="6 4" points={points(curveToPixels(score.energy, view))} />
        {drawn ? <polyline data-energy-drawn="" class="pointer-events-none stroke-go" fill="none" stroke-width={3} stroke-linejoin="round" points={points(curveToPixels(curve, view))} /> : null}
        {live.length > 1 ? <polyline data-energy-stroke="" class="pointer-events-none stroke-amber" fill="none" stroke-width={2} points={points(live)} /> : null}
        <Axis ticks={axisTicks(score, p.tempo, view)} height={ENERGY_EDIT_H} />
      </svg>
      <div data-guide="energy-actions" class="flex flex-wrap gap-2">
        <Button variant="primary" disabled={!drawn || p.busy} onClick={() => p.onSend(curve)}>Send this shape</Button>
        <Button disabled={!drawn} onClick={() => { setCurve(copy(score.energy)); setDrawn(false); }}>Start over</Button>
        <Button variant="ghost" onClick={p.onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
