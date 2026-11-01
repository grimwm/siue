// Speed and Loudness: the piece's speed (Slow, Walking, Quick or any BPM) and its changes along the way (Steady,
// Slow Down, Speed Up, Sudden Change), this part's speed (Follow Piece, Ratio To Piece, Own BPM), and this part's
// loudness line (Very Soft to Very Loud, Get Louder, Get Softer). Every change is one edit, so Undo takes it back.
import type { ComponentChildren } from 'preact';
import { LEVEL_NAMES } from '../../compose/loudness.ts';
import { lineOf, MAX_BPM, MIN_BPM, PIECE_SPEEDS, RATIOS, speedWords } from '../../compose/speed.ts';
import type { EditDoc, Part } from '../../compose/doc.ts';
import type { DynMark, Speed, TempoMark } from '../../score.ts';
import { Button } from '../console/Button.tsx';
import { Panel } from '../console/Panel.tsx';

export interface SpeedPanelProps {
  doc: EditDoc;
  part: Part;
  /** How many bars the piece has now. */
  bars: number;
  help: boolean;
  onPieceSpeed(bpm: number): void;
  onLine(marks: TempoMark[]): void;
  onPartSpeed(speed: Speed): void;
  onLoudness(marks: DynMark[]): void;
}

const field = 'min-h-11 w-24 rounded-md border border-rule bg-well px-3 text-ink';
const numberOf = (e: Event): number => Number((e.target as HTMLInputElement).value);

function Row(p: { label: string; children: ComponentChildren }) {
  return <div class="flex flex-wrap items-center gap-2"><span class="w-28 text-sm text-dim">{p.label}</span>{p.children}</div>;
}

/** How a mark gets to the next one: all at once at the next mark (Sudden Change), or gradually. */
const tempoWay = (m: TempoMark, next: TempoMark | undefined): string =>
  !next ? 'Steady' : m.shape === 'speed_up' ? 'Speed Up' : m.shape === 'slow_down' ? 'Slow Down' : next.bpm === m.bpm ? 'Steady' : 'Sudden Change';

export function SpeedPanel(p: SpeedPanelProps) {
  const Help = (q: { children: string }) => (p.help ? <p class="border-l-2 border-amber pl-2 text-sm text-dim">{q.children}</p> : null);
  const line = lineOf(p.doc);
  const first = line[0]!;
  const setMark = (i: number, change: Partial<TempoMark>) => p.onLine(line.map((m, j) => (j === i ? { ...m, ...change } : m)));
  const gradual = (i: number, on: boolean) => {
    const m = line[i]!;
    const next = line[i + 1]!;
    setMark(i, { shape: on ? (next.bpm > m.bpm ? 'speed_up' : 'slow_down') : 'steady' });
  };
  const lastBar = line[line.length - 1]!.bar;
  const speed = p.part.speed;
  const dyn = p.part.dynamics ?? [];
  const setDyn = (i: number, change: Partial<DynMark>) => p.onLoudness(dyn.map((m, j) => (j === i ? { ...m, ...change } : m)));
  const dynBar = dyn.length ? dyn[dyn.length - 1]!.bar : 0;
  return (
    <Panel title="Speed And Loudness">
      <div class="grid gap-4" data-speed-panel="">
        <section class="grid gap-2" aria-label="Piece Speed">
          <h3 class="font-display text-sm font-semibold tracking-wide uppercase">Piece Speed</h3>
          <Row label="Starts At">
            {PIECE_SPEEDS.map(s => <Button pressed={first.bpm === s.bpm} onClick={() => p.onPieceSpeed(s.bpm)} data={{ 'data-piece-speed': String(s.bpm) }}>{`${s.label} ${s.bpm}`}</Button>)}
            <label class="flex items-center gap-2 text-sm">Beats Per Minute
              <input type="number" min={MIN_BPM} max={MAX_BPM} value={first.bpm} class={field} data-piece-bpm=""
                onChange={e => { const v = numberOf(e); if (v >= MIN_BPM && v <= MAX_BPM) p.onPieceSpeed(v); }} /></label>
          </Row>
          <ol class="grid gap-2" data-tempo-line="">
            {line.slice(1).map((m, k) => {
              const i = k + 1;
              const prev = line[i - 1]!;
              return (
                <li class="grid gap-1 rounded-md border border-rule p-2" data-tempo-mark={String(m.bar)}>
                  <Row label={`At Bar ${m.bar}`}>
                    <input type="number" min={MIN_BPM} max={MAX_BPM} value={m.bpm} class={field} aria-label={`Beats per minute at bar ${m.bar}`}
                      onChange={e => { const v = numberOf(e); if (v >= MIN_BPM && v <= MAX_BPM) setMark(i, { bpm: v }); }} />
                    <span class="text-sm text-dim">BPM</span>
                    <Button variant="ghost" onClick={() => p.onLine(line.filter((_, j) => j !== i))}>Remove</Button>
                  </Row>
                  <Row label="Getting There">
                    <Button pressed={prev.shape === 'steady'} onClick={() => gradual(i - 1, false)}>Sudden Change</Button>
                    <Button pressed={prev.shape !== 'steady'} disabled={prev.bpm === m.bpm} onClick={() => gradual(i - 1, true)}
                      data={{ 'data-gradual': String(m.bar) }}>{m.bpm >= prev.bpm ? 'Speed Up' : 'Slow Down'}</Button>
                    <span class="font-mono text-xs text-dim">{`bars ${prev.bar}–${m.bar}: ${tempoWay(prev, m)}`}</span>
                  </Row>
                </li>
              );
            })}
          </ol>
          <div class="flex flex-wrap gap-2">
            <Button onClick={() => p.onLine([...line, { bar: Math.max(lastBar + 1, Math.min(p.bars, lastBar + 4)), bpm: line[line.length - 1]!.bpm, shape: 'steady' }])}
              data={{ 'data-add-tempo': '' }}>Add A Speed Change</Button>
          </div>
          <Help>The piece starts at one speed. A speed change at a bar comes all at once (Sudden Change), or gradually from the mark before it (Speed Up or Slow Down, a little each bar). Parts that follow the piece move with it.</Help>
        </section>
        <section class="grid gap-2" aria-label="This Part's Speed">
          <h3 class="font-display text-sm font-semibold tracking-wide uppercase">This Part's Speed</h3>
          <Row label="Plays At">
            <Button pressed={speed === 'follow'} onClick={() => p.onPartSpeed('follow')} data={{ 'data-part-speed': 'follow' }}>Follow Piece</Button>
            <Button pressed={speed !== 'follow' && 'ratio' in speed} onClick={() => p.onPartSpeed({ ratio: 1 })}>Ratio To Piece</Button>
            <Button pressed={speed !== 'follow' && 'bpm' in speed} onClick={() => p.onPartSpeed({ bpm: first.bpm })} data={{ 'data-part-speed': 'bpm' }}>Own BPM</Button>
          </Row>
          {speed !== 'follow' && 'ratio' in speed ? (
            <Row label="Ratio">
              {RATIOS.map(r => <Button pressed={Math.abs(speed.ratio - r.ratio) < 1e-6} onClick={() => p.onPartSpeed({ ratio: r.ratio })} data={{ 'data-ratio': String(r.ratio) }}>{r.label}</Button>)}
            </Row>
          ) : null}
          {speed !== 'follow' && 'bpm' in speed ? (
            <Row label="Own BPM">
              <input type="number" min={MIN_BPM} max={MAX_BPM} value={speed.bpm} class={field} data-own-bpm=""
                onChange={e => { const v = numberOf(e); if (v >= MIN_BPM && v <= MAX_BPM) p.onPartSpeed({ bpm: v }); }} />
            </Row>
          ) : null}
          <p class="font-mono text-xs text-dim" data-speed-words="">{speedWords(speed)}</p>
          <Help>Follow Piece is the usual choice. Ratio To Piece keeps the part locked to the piece at half, two-thirds, the same, one and a half or twice its speed, the way music apps sync tracks. Own BPM keeps a fixed speed of its own and drifts against the piece on purpose. A change of speed keeps the part's rhythm and moves its notes.</Help>
        </section>
        <section class="grid gap-2" aria-label="This Part's Loudness">
          <h3 class="font-display text-sm font-semibold tracking-wide uppercase">This Part's Loudness</h3>
          {dyn.length === 0 ? <p class="text-sm text-dim" data-loudness-none="">Each note plays as loud as it was played.</p> : null}
          <ol class="grid gap-2" data-loudness-line="">
            {dyn.map((m, i) => {
              const next = dyn[i + 1];
              return (
                <li class="grid gap-1 rounded-md border border-rule p-2" data-loudness-mark={String(m.bar)}>
                  <Row label={i === 0 ? 'From The Start' : `At Bar ${m.bar}`}>
                    <select class="min-h-11 rounded-md border border-rule bg-well px-2 text-ink" aria-label={`Loudness at bar ${m.bar}`} data-level={String(m.bar)}
                      onChange={e => setDyn(i, { level: Number((e.target as HTMLSelectElement).value) })}>
                      {LEVEL_NAMES.map(l => <option value={l.level} selected={l.level === m.level}>{`${l.label} (${l.mark})`}</option>)}
                    </select>
                    {i > 0 || dyn.length === 1 ? <Button variant="ghost" onClick={() => p.onLoudness(dyn.filter((_, j) => j !== i))}>Remove</Button> : null}
                  </Row>
                  {next ? (
                    <Row label="Then">
                      <Button pressed={m.shape === 'steady'} onClick={() => setDyn(i, { shape: 'steady' })}>Steady</Button>
                      <Button pressed={m.shape !== 'steady'} disabled={next.level === m.level} onClick={() => setDyn(i, { shape: next.level > m.level ? 'louder' : 'softer' })}
                        data={{ 'data-dyn-gradual': String(m.bar) }}>{next.level >= m.level ? 'Get Louder' : 'Get Softer'}</Button>
                    </Row>
                  ) : null}
                </li>
              );
            })}
          </ol>
          <div class="flex flex-wrap gap-2">
            <Button onClick={() => p.onLoudness(dyn.length ? [...dyn, { bar: Math.max(dynBar + 1, Math.min(p.bars, dynBar + 2)), level: dyn[dyn.length - 1]!.level, shape: 'steady' }] : [{ bar: 1, level: 80, shape: 'steady' }])}
              data={{ 'data-add-loudness': '' }}>{dyn.length ? 'Add A Loudness Mark' : 'Add A Loudness Line'}</Button>
            {dyn.length ? <Button variant="ghost" onClick={() => p.onLoudness([])}>Clear Loudness Line</Button> : null}
          </div>
          <Help>A loudness line sets how loud the part plays, from Very Soft (pp) to Very Loud (ff). Between marks it stays Steady or moves gradually (Get Louder, Get Softer). Each note keeps how hard it was played on top of the line.</Help>
        </section>
      </div>
    </Panel>
  );
}
