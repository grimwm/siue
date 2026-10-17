// Drawing pieces the views share: the playhead and the time axis.
import { AXIS_H, thinTicks } from '../axis.ts';
import type { AxisTick } from '../axis.ts';
import { LANE_ICONS } from '../laneicons.ts';
import type { Family } from '../score.ts';
import { timeToX } from '../zoom.ts';
import type { View } from '../zoom.ts';

export { AXIS_H };

/** The playhead: a vertical line at the playing time, when that time is on screen. */
export function Playhead(p: { view: View; time: number; height: number }) {
  const x = timeToX(p.view, p.time);
  if (x < 0 || x > p.view.width) return null;
  return <line class="playhead pointer-events-none stroke-amber" stroke-width={2} data-playhead="" x1={x} x2={x} y1={0} y2={p.height} />;
}

export const LANE_ICON_SIZE = 14;

/** A lane's instrument family as a small line drawing at (x, y), named for assistive tech. */
export function LaneIcon(p: { family: Family; color: string; x: number; y: number }) {
  return (
    <svg class="lane-icon pointer-events-none" data-icon={p.family} role="img" aria-label={`${p.family} instruments`} x={p.x} y={p.y} width={LANE_ICON_SIZE} height={LANE_ICON_SIZE} viewBox="0 0 16 16">
      <g fill="none" stroke={p.color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        {LANE_ICONS[p.family].map(d => <path d={d} />)}
      </g>
    </svg>
  );
}

/** The time axis along the bottom of a drawing of the given height: one gridline and one `<text data-tick>` per readable tick. */
export function Axis(p: { ticks: readonly AxisTick[]; height: number }) {
  const ticks = thinTicks(p.ticks);
  return (
    <g class="axis">
      {ticks.map(t => <line class="tick stroke-rule" stroke-width={1} x1={t.x} x2={t.x} y1={0} y2={p.height} />)}
      {ticks.map(t => <text class="tick-label pointer-events-none fill-dim font-mono text-[11px]" data-tick="" x={t.x + 3} y={p.height + 14}>{t.label}</text>)}
    </g>
  );
}
