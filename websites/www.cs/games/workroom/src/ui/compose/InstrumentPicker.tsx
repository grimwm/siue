// The instrument picker: the catalogue by category, each category and the Lyre with its icon, each instrument with its
// range in words ("G3–A7") and, for a stand-in, what plays instead; with onHear, a Hear button plays a short tune on it.
import { useState } from 'preact/hooks';
import { CATEGORIES } from '../../catalogue.ts';
import type { Category, Entry } from '../../catalogue.ts';
import { iconPaths } from '../../compose/icons.ts';
import { pitchName } from '../../pianoroll.ts';
import { cx } from '../console/cx.ts';

export function Icon(p: { name: string; size?: number; class?: string }) {
  const size = p.size ?? 18;
  return (
    <svg data-icon={p.name} aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" class={cx('shrink-0', p.class)}>
      <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">{iconPaths(p.name).map(d => <path d={d} />)}</g>
    </svg>
  );
}

/** An instrument's range in words: its normal range, and how far experts go when that is further. */
export function rangeWords(e: Entry): string {
  if (e.pieces) return `${e.pieces.length} drums`;
  if (!e.range) return '';
  const normal = `${pitchName(e.range[0])}–${pitchName(e.range[1])}`;
  const ex = e.expert;
  return ex && (ex[0] !== e.range[0] || ex[1] !== e.range[1]) ? `${normal} (experts ${pitchName(ex[0])}–${pitchName(ex[1])})` : normal;
}

export interface InstrumentPickerProps {
  entries: readonly Entry[]; value: string | null; onPick(e: Entry): void;
  /** Plays a short tune on the instrument; with it, each instrument has a Hear button beside it. */
  onHear?(e: Entry): void;
}

export function InstrumentPicker(p: InstrumentPickerProps) {
  const current = p.entries.find(e => e.id === p.value);
  const [category, setCategory] = useState<Category>(current?.category ?? 'strings');
  const shown = p.entries.filter(e => e.category === category);
  return (
    <div data-instrument-picker="" class="grid gap-3">
      <div role="group" aria-label="Instrument families" class="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {CATEGORIES.map(c => (
          <button type="button" aria-pressed={c.id === category} onClick={() => setCategory(c.id)}
            class={cx('flex min-h-14 flex-col items-center justify-center gap-1 rounded-md border px-2 py-1 text-center text-xs font-semibold',
              c.id === category ? 'border-amber bg-amber text-on-accent' : 'border-rule bg-panel text-ink hover:border-dim')}>
            <Icon name={c.id} />{c.label}
          </button>
        ))}
      </div>
      <div role="group" aria-label="Instruments" class="grid gap-2 sm:grid-cols-2">
        {shown.map(e => (
          <div class="flex items-stretch gap-1">
            <button type="button" data-instrument={e.id} aria-pressed={e.id === p.value} onClick={() => p.onPick(e)}
              class={cx('flex min-h-14 min-w-0 flex-1 items-start gap-2 rounded-md border p-2 text-left', e.id === p.value ? 'border-amber bg-lane' : 'border-rule bg-panel hover:border-dim')}>
              <Icon name={e.icon} class="mt-0.5 text-amber" />
              <span class="grid min-w-0">
                <span class="font-semibold">{e.name}</span>
                <span class="font-mono text-xs text-dim">{rangeWords(e)}</span>
                {e.standin || e.id === 'lyre' ? <span data-standin="" class="text-xs text-amber">Stand-In Sound</span> : null}
                {e.standinNote ? <span class="text-xs text-dim">{e.standinNote}</span> : null}
              </span>
            </button>
            {p.onHear ? (
              <button type="button" data-hear-instrument={e.id} aria-label={`Hear ${e.name}`} title={`Hear ${e.name}`} onClick={() => p.onHear!(e)}
                class="inline-flex min-h-14 min-w-14 flex-col items-center justify-center gap-0.5 rounded-md border border-rule bg-panel text-xs font-semibold hover:border-dim">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24"><path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.3-7.2a.8.8 0 0 0 0-1.4L8.2 4.1A.8.8 0 0 0 7 4.8z" fill="currentColor" /></svg>Hear
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
