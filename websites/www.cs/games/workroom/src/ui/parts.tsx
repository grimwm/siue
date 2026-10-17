// Drawing pieces the views share: the playhead and the time axis.
import { thinTicks } from '../axis.ts';
import type { AxisTick } from '../axis.ts';
import { timeToX } from '../zoom.ts';
import type { View } from '../zoom.ts';

export const AXIS_H = 20;

/** The playhead: a vertical line at the playing time, when that time is on screen. */
export function Playhead(p: { view: View; time: number; height: number }) {
  const x = timeToX(p.view, p.time);
  if (x < 0 || x > p.view.width) return null;
  return <line class="playhead" data-playhead="" x1={x} x2={x} y1={0} y2={p.height} />;
}

/** The time axis along the bottom of a drawing of the given height: one gridline and one `<text data-tick>` per readable tick. */
export function Axis(p: { ticks: readonly AxisTick[]; height: number }) {
  const ticks = thinTicks(p.ticks);
  return (
    <g class="axis">
      {ticks.map(t => <line class="tick" x1={t.x} x2={t.x} y1={0} y2={p.height} />)}
      {ticks.map(t => <text class="tick-label" data-tick="" x={t.x + 3} y={p.height + 14}>{t.label}</text>)}
    </g>
  );
}
