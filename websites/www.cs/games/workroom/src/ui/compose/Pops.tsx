// The composer's popovers: a track's menu (Rename, Duplicate Track, Change Instrument, Clear Notes, Remove Track), the
// chord helper (chords by name, the key, the chords in the key), adding or renaming a section, Add Instrument (every
// instrument by family, each with Hear), and a marker on the ruler.
import { useState } from 'preact/hooks';
import type { Entry } from '../../catalogue.ts';
import { BASIC_CHORDS, chordName, chordPitches, chordRoot, keyChords, keyName } from '../../compose/chords.ts';
import type { Chord } from '../../compose/chords.ts';
import { clearPart, duplicatePart, removePart, setInstrument } from '../../compose/edit.ts';
import { addSection, renameSection, SECTION_NAMES, sectionsOf } from '../../compose/sections.ts';
import { cx } from '../console/cx.ts';
import type { Ctl } from './ctl.ts';
import { barWords } from './ctl.ts';
import { Glyph } from './Glyph.tsx';
import { Icon, InstrumentPicker } from './InstrumentPicker.tsx';
import { Pop, PopItem, PopSection } from './Pop.tsx';

const KEYS = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

export function TrackMenu(p: { c: Ctl; part: string; anchor: HTMLElement | null; onClose(): void }) {
  const { c } = p;
  const part = c.doc.parts.find(x => x.id === p.part);
  const [changing, setChanging] = useState(false);
  if (!part) return null;
  const entry = c.entryOf(part);
  return (
    <Pop title={part.name} anchor={p.anchor} onClose={p.onClose} name="track">
      <div class="grid">
        <PopItem glyph="pencil" label="Rename" onClick={() => { p.onClose(); c.setRenaming(part.id); }} />
        {part.vocal ? null : <PopItem glyph="dup" label="Duplicate Track" data={{ 'data-duplicate-track': '' }} onClick={() => {
          const made = duplicatePart(c.doc, part.id);
          p.onClose();
          if (!made) { c.say('A piece holds at most 16 tracks.'); return; }
          c.apply(made.doc, `Duplicated ${part.name}.`);
        }} />}
      </div>
      {entry && !part.vocal ? (
        <PopSection title="Change Instrument">
          <p class="text-sm text-dim">Now: <b>{entry.name}</b>. The notes stay; they play on the new instrument.</p>
          {changing ? (
            <InstrumentPicker entries={c.entries.filter(e => !!e.pieces === !!entry.pieces)} value={part.instrument} onHear={e => c.hearInstrument(e)}
              onPick={e => { c.apply(setInstrument(c.doc, part.id, e), `${part.name} now plays on the ${e.name}.`); setChanging(false); }} />
          ) : <button type="button" class="cmp-btn" onClick={() => setChanging(true)}><Icon name={entry.icon} />Change Instrument</button>}
        </PopSection>
      ) : null}
      <div class="grid">
        <PopItem glyph="eraser" label="Clear Notes" onClick={() => { p.onClose(); c.apply(clearPart(c.doc, part.id), `Cleared ${part.name}. Undo brings the notes back.`); }} />
        <PopItem glyph="trash" label="Remove Track" danger data={{ 'data-remove-track': '' }} onClick={() => { p.onClose(); c.apply(removePart(c.doc, part.id), `Removed ${part.name}. Undo brings it back.`); }} />
      </div>
    </Pop>
  );
}

export function ChordsPop(p: { c: Ctl; part: string; anchor: HTMLElement | null; onClose(): void; setKey(k: { tonic: number; minor: boolean } | null): void }) {
  const { c } = p;
  const part = c.doc.parts.find(x => x.id === p.part);
  if (!part) return null;
  const pick = (ch: Chord): void => {
    const root = chordRoot(ch, c.low(part) + 11);
    for (const q of chordPitches(ch, root)) c.preview(part, q, 2);
    c.setChord({ chord: ch, part: part.id });
    c.setSelectMode(false);
    p.onClose();
  };
  const chip = (ch: Chord) => (
    <button type="button" class="cmp-btn" data-chord={chordName(ch)} aria-pressed={!!c.chord && chordName(c.chord.chord) === chordName(ch)} onClick={() => pick(ch)}>{chordName(ch)}</button>
  );
  const key = c.doc.key ?? null;
  return (
    <Pop title="Chords" anchor={p.anchor} onClose={p.onClose} name="chords">
      <p class="text-sm text-dim">Tap a chord to hear it. Then tap the piano roll where it should go, or press Put At Cursor. It uses the New Notes length.</p>
      <PopSection title="Chords"><div class="cmp-pop-row">{BASIC_CHORDS.map(chip)}</div></PopSection>
      <PopSection title="Key"><KeyPicker c={c} setKey={p.setKey} /></PopSection>
      {key ? <PopSection title={`Chords In ${keyName(key)}`}><div class="cmp-pop-row">{keyChords(key).map(chip)}</div></PopSection> : null}
    </Pop>
  );
}

export function KeyPicker(p: { c: Ctl; setKey(k: { tonic: number; minor: boolean } | null): void }) {
  const key = p.c.doc.key ?? null;
  return (
    <div class="cmp-pop-row">
      <select aria-label="Key" data-key-picker="" class="min-h-11 rounded-md border border-rule bg-well px-2 text-ink"
        onChange={e => { const v = (e.target as HTMLSelectElement).value; p.setKey(v === '' ? null : { tonic: Number(v), minor: key?.minor ?? false }); }}>
        <option value="" selected={!key}>No Key</option>
        {KEYS.map((n, i) => <option value={String(i)} selected={key?.tonic === i}>{n}</option>)}
      </select>
      <span class="cmp-seg" role="group" aria-label="Major Or Minor">
        {([['Major', false], ['Minor', true]] as const).map(([w, m]) => (
          <button type="button" aria-pressed={!!key && key.minor === m} disabled={!key} onClick={() => key && p.setKey({ tonic: key.tonic, minor: m })}>{w}</button>
        ))}
      </span>
      <span class="cmp-label">{key ? `Rows in ${keyName(key)} are shaded.` : 'Pick a key to shade the notes that fit it.'}</span>
    </div>
  );
}

export function SectionPop(p: { c: Ctl; id: string | null; anchor: HTMLElement | null; onClose(): void }) {
  const { c } = p;
  const secs = sectionsOf(c.doc);
  const x = p.id ? secs.find(s => s.id === p.id) ?? null : null;
  const loopFrom = c.loop ? c.clock.barOfBeat(c.loop.from + 1e-9) : null;
  const loopTo = c.loop ? c.clock.barOfBeat(c.loop.to - 1e-9) : null;
  const cursorBar = c.clock.barOfBeat(c.cursor + 1e-9);
  const [name, setName] = useState(x?.name ?? 'Verse');
  const [own, setOwn] = useState(x && !(SECTION_NAMES as readonly string[]).includes(x.name) ? x.name : '');
  const [from, setFrom] = useState(loopFrom ?? Math.min(cursorBar, c.bars));
  const [to, setTo] = useState(loopTo ?? Math.min(c.bars, (loopFrom ?? cursorBar) + 3));
  const done = (): void => {
    const n = (own.trim() || name).slice(0, 60);
    p.onClose();
    if (x) { if (n !== x.name) c.apply(renameSection(c.doc, x.id, n), `Renamed the section ${n}.`); return; }
    const made = addSection(c.doc, n, from, Math.max(from, to));
    c.apply(made.doc, `${n} is bar ${from} to bar ${Math.max(from, to)}.`);
    c.setPick({ kind: 'section', id: made.id });
  };
  const stepper = (v: number, set: (v: number) => void, label: string, lo: number, hi: number) => (
    <span class="cmp-seg" role="group" aria-label={label}>
      <button type="button" aria-label={`Less ${label}`} onClick={() => set(Math.max(lo, v - 1))}>−</button>
      <button type="button" disabled class="min-w-12">{v}</button>
      <button type="button" aria-label={`More ${label}`} onClick={() => set(Math.min(hi, v + 1))}>+</button>
    </span>
  );
  return (
    <Pop title={x ? 'Rename Section' : 'Add Section'} anchor={p.anchor} onClose={p.onClose} name="section">
      <PopSection title="Name">
        <div class="cmp-pop-row">{SECTION_NAMES.map(n => <button type="button" class="cmp-btn" aria-pressed={!own && name === n} onClick={() => { setName(n); setOwn(''); }}>{n}</button>)}</div>
        <input type="text" class="min-h-11 rounded-md border border-rule bg-well px-3 text-ink" placeholder="Or your own name" aria-label="Your Own Name" maxLength={24} value={own}
          onInput={e => setOwn((e.target as HTMLInputElement).value)} onKeyDown={e => e.stopPropagation()} />
      </PopSection>
      {x ? null : (
        <PopSection title="Bars">
          <div class="cmp-pop-row"><span class="cmp-label">From bar</span>{stepper(from, v => { setFrom(v); if (to < v) setTo(v); }, 'Start Bar', 1, c.bars)}
            <span class="cmp-label">to bar</span>{stepper(to, v => setTo(Math.max(from, v)), 'End Bar', from, c.bars)}</div>
        </PopSection>
      )}
      <div class="cmp-pop-row"><button type="button" class="cmp-btn primary" data-section-done="" onClick={done}><Glyph name="check" size={16} />{x ? 'Rename' : 'Add Section'}</button></div>
    </Pop>
  );
}

export function AddPop(p: { c: Ctl; anchor: HTMLElement | null; onClose(): void; onAdd(e: Entry): void; onVocal?: () => void }) {
  const { c } = p;
  return (
    <Pop title="Add Instrument" anchor={p.anchor} onClose={p.onClose} name="add">
      <p class="text-sm text-dim">Adding an instrument gives an empty track. Hear plays a short tune on it first.</p>
      <InstrumentPicker entries={c.entries} value={null} onPick={e => { p.onClose(); p.onAdd(e); }} onHear={e => c.hearInstrument(e)} />
      {p.onVocal ? <button type="button" class="cmp-btn" onClick={() => { p.onClose(); p.onVocal!(); }}><Glyph name="mic" />Add Vocal Track</button> : null}
    </Pop>
  );
}

export function MarkerPop(p: { c: Ctl; anchor: HTMLElement | null; onClose(): void; add(name: string): void; remove(i: number): void }) {
  const { c } = p;
  const [name, setName] = useState('');
  const at = Math.floor(c.cursor + 1e-9);
  return (
    <Pop title="Markers" anchor={p.anchor} onClose={p.onClose} name="marker">
      <p class="text-sm text-dim">Named points on the ruler. Tap one there to jump to it.</p>
      {(c.doc.markers ?? []).map((m, i) => (
        <div class="cmp-pop-row"><span class="flex-1">{m.name} · {barWords(c.clock, m.beat)}</span>
          <button type="button" class="cmp-icon" aria-label={`Remove The Marker ${m.name}`} onClick={() => p.remove(i)}><Glyph name="close" /></button></div>
      ))}
      <div class="cmp-pop-row">
        <input type="text" class={cx('min-h-11 min-w-0 flex-1 rounded-md border border-rule bg-well px-3 text-ink')} placeholder="Name, e.g. Big Drop" aria-label="Marker Name" maxLength={24}
          value={name} onInput={e => setName((e.target as HTMLInputElement).value)} onKeyDown={e => e.stopPropagation()} />
        <button type="button" class="cmp-btn" data-add-marker="" onClick={() => { p.add(name.trim() || `Marker ${(c.doc.markers?.length ?? 0) + 1}`); setName(''); }}>
          <Glyph name="flag" size={16} />{`Add At ${barWords(c.clock, at).replace(/^b/, 'B')}`}
        </button>
      </div>
    </Pop>
  );
}
