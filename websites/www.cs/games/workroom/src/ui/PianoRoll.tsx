// The piano roll: notes as blocks, pitch up, on the same view as the timeline.
import { axisTicks } from '../axis.ts';
import { readableOn } from '../color.ts';
import { ROLL_H, labelRows, layoutRoll } from '../pianoroll.ts';
import type { Score } from '../score.ts';
import type { TempoMap } from '../tempo.ts';
import { boundsFor } from '../zoom.ts';
import type { View } from '../zoom.ts';
import { useSurface } from './surface.ts';
import { useTheme } from './theme-context.ts';
import { AXIS_H, Axis, Playhead } from './parts.tsx';

export interface PianoRollProps { score: Score; tempo: TempoMap; view: View; time: number; lanes?: ReadonlySet<string>; onSeek(t: number): void; onView(v: View): void; onHold?(held: boolean): void }

export function PianoRoll(p: PianoRollProps) {
  const { score, tempo, view } = p;
  const roll = layoutRoll(score, view, ROLL_H, p.lanes);
  const surface = useSurface({ view, bounds: boundsFor(score.duration, view.width), duration: score.duration, onSeek: p.onSeek, onView: p.onView, onHold: p.onHold });
  const theme = useTheme();
  const height = roll.height + AXIS_H;
  if (roll.notes.length === 0) return <p class="empty p-4">No notes to show in the chosen lanes.</p>;
  return (
    <svg class="roll block max-w-full touch-none select-none" data-roll="" width={view.width} height={height} viewBox={`0 0 ${view.width} ${height}`} role="img" aria-label="Piano roll" {...surface}>
      {roll.rows.map(r => <rect class={r.black ? 'row black fill-well' : 'row fill-lane'} x={0} y={r.y} width={view.width} height={roll.rowH} />)}
      {labelRows(roll).map(r => <text class="pitch-name pointer-events-none fill-dim font-mono text-[10px]" data-pitch-name="" x={4} y={r.y + roll.rowH - 1}>{r.name}</text>)}
      {roll.notes.map(n => <rect class="note" data-note={n.index} data-lane={n.lane} x={n.rect.x} y={n.rect.y} width={Math.max(1, n.rect.w)} height={n.rect.h} rx={1} fill={readableOn(theme, n.color, 'mark')} />)}
      <Axis ticks={axisTicks(score, tempo, view)} height={roll.height} />
      <Playhead view={view} time={p.time} height={roll.height} />
    </svg>
  );
}
