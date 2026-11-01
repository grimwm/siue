// The import preview: what the file holds (Found In, From, Speed, Time Signature, Key, Length), each part matched to an
// instrument the person can change (a drum part only to drums), how many of its notes sit outside that instrument's
// range, What Can't Come Across, and the three ways on: Add As New Parts, Start A New Piece, Cancel. Nothing in the
// piece changes until one of the first two is pressed.
import type { Entry } from '../../catalogue.ts';
import { CATEGORIES, rangeClass } from '../../catalogue.ts';
import type { ImportPreview as Preview } from '../../compose/importing.ts';
import { Button } from '../console/Button.tsx';
import { Panel } from '../console/Panel.tsx';

export interface ImportPreviewProps {
  preview: Preview;
  choice: readonly string[];
  entries: readonly Entry[];
  /** The piece's own name, for the line that says where Add As New Parts puts them. */
  piece: string;
  onChoice(index: number, instrument: string): void;
  onAdd(): void;
  onNew(): void;
  onCancel(): void;
}

function flags(entry: Entry | undefined, pitches: readonly number[]) {
  if (!entry) return null;
  if (entry.pieces) return <span class="text-sm text-go">Drum hits</span>;
  const red = pitches.filter(p => rangeClass(entry, p) === 'out').length;
  const amber = pitches.filter(p => rangeClass(entry, p) === 'expert').length;
  if (!red && !amber) return <span data-flag="ok" class="text-sm text-go">All notes fit the {entry.name}</span>;
  return (
    <span class="flex flex-wrap gap-x-3 text-sm">
      {amber ? <span data-flag="amber" class="text-amber">{amber} {amber === 1 ? 'note' : 'notes'} only experts reach</span> : null}
      {red ? <span data-flag="red" class="text-record">{red} {red === 1 ? 'note' : 'notes'} a real player can't play</span> : null}
    </span>
  );
}

export function ImportPreview(p: ImportPreviewProps) {
  const v = p.preview;
  return (
    <Panel title={`Found In ${v.file}`}>
      <div data-import-preview="" class="grid gap-3">
        <dl class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <div><dt class="inline font-semibold">From </dt><dd class="inline">{v.app} ({v.type})</dd></div>
          <div><dt class="inline font-semibold">Speed </dt><dd class="inline">{v.bpm} BPM · {v.tempoWord}</dd></div>
          <div><dt class="inline font-semibold">Time Signature </dt><dd class="inline">{v.time}</dd></div>
          <div><dt class="inline font-semibold">Key </dt><dd class="inline">{v.key}</dd></div>
          <div><dt class="inline font-semibold">Length </dt><dd class="inline">{v.bars} {v.bars === 1 ? 'bar' : 'bars'}</dd></div>
        </dl>
        <ul class="grid gap-2">
          {v.parts.map((part, i) => {
            const chosen = p.entries.find(e => e.id === p.choice[i]);
            return (
              <li data-import-part={String(i)} class="grid gap-1 rounded-md border border-rule bg-well p-2">
                <label class="flex flex-wrap items-center gap-2">
                  <b>{part.name}</b>
                  <span class="text-xs text-dim">({part.from}, from {v.app})</span>
                  <span aria-hidden="true">→</span>
                  <select aria-label={`Instrument for ${part.name}`} value={p.choice[i]} class="min-h-11 rounded-md border border-rule bg-panel px-2 text-ink"
                    onChange={e => p.onChoice(i, (e.target as HTMLSelectElement).value)}>
                    {CATEGORIES.map(c => {
                      const inst = p.entries.filter(e => e.category === c.id && !!e.pieces === part.drums);
                      return inst.length ? <optgroup label={c.label}>{inst.map(e => <option value={e.id} selected={e.id === p.choice[i]}>{e.name}</option>)}</optgroup> : null;
                    })}
                  </select>
                </label>
                {flags(chosen, part.notes.map(n => n.pitch))}
              </li>
            );
          })}
        </ul>
        <div>
          <h3 class="font-display text-sm font-semibold tracking-wide uppercase">What Can't Come Across</h3>
          {v.lost.length ? <ul data-import-lost="" class="mt-1 list-disc pl-5 text-sm">{v.lost.map(l => <li>{l}</li>)}</ul>
            : <p class="text-sm text-dim">Everything in the file comes across.</p>}
        </div>
        <div class="flex flex-wrap gap-2">
          <Button variant="primary" onClick={p.onAdd}>Add As New Parts</Button>
          <Button onClick={p.onNew}>Start A New Piece</Button>
          <Button onClick={p.onCancel}>Cancel</Button>
        </div>
        <p class="border-l-2 border-amber pl-2 text-sm text-dim">Add As New Parts puts these parts into {p.piece} next to the ones there; the piece keeps its own speed. Start A New Piece makes a new piece from the file at its own speed ({v.bpm} BPM). Notes outside an instrument's range are kept and marked, never moved.</p>
      </div>
    </Panel>
  );
}
