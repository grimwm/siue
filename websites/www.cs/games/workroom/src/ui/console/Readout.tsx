// The time readout: the playing time, and the bar on a music piece.
import { formatSeconds } from '../../axis.ts';

export function Readout(p: { time: number; bar: number | null }) {
  return (
    <span data-readout="" class="inline-flex min-h-11 items-center gap-3 rounded-md bg-well px-3 font-mono text-amber tabular-nums">
      <span data-clock="">{formatSeconds(p.time)}</span>
      {p.bar !== null ? <span data-bar="" class="text-dim">bar {p.bar}</span> : null}
    </span>
  );
}
