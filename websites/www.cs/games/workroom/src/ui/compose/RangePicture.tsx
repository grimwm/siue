// The range picture: one bar from the instrument's lowest note to its highest, green where a professional plays, amber
// where only experts reach, red beyond what a real player can play, with a tick for each note of the part. Drums have
// no range and draw nothing.
import type { Entry } from '../../catalogue.ts';
import { rangeBands } from '../../catalogue.ts';
import { pitchName } from '../../pianoroll.ts';

const FILL: Readonly<Record<'normal' | 'expert' | 'out', string>> = { normal: 'bg-go', expert: 'bg-amber', out: 'bg-record' };

export function RangePicture(p: { entry: Entry; pitches: readonly number[] }) {
  const r = rangeBands(p.entry, p.pitches);
  if (!r) return null;
  const span = r.hi - r.lo + 1;
  const left = (pitch: number): string => `${((pitch - r.lo) / span) * 100}%`;
  const pitches = [...new Set(p.pitches)];
  return (
    <figure data-range-picture="" class="grid gap-1" aria-label={`${p.entry.name}: plays ${pitchName(p.entry.range![0])} to ${pitchName(p.entry.range![1])}`}>
      <div class="relative h-4 overflow-hidden rounded-sm border border-rule">
        {r.bands.map(b => (
          <span data-band={b.cls} class={`absolute inset-y-0 ${FILL[b.cls]} opacity-80`} style={{ left: left(b.from), width: `${((b.to - b.from + 1) / span) * 100}%` }} />
        ))}
        {pitches.map(pitch => <span data-tick={pitch} class="absolute inset-y-0 w-0.5 bg-ink" style={{ left: left(pitch) }} />)}
      </div>
      <figcaption class="flex justify-between font-mono text-xs text-dim"><span>{pitchName(r.lo)}</span><span>{pitchName(r.hi)}</span></figcaption>
    </figure>
  );
}
