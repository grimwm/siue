// The Song popover (a sheet on a phone): the song's length (a bar more or less at the end or at the cursor), its time
// signature, tempo changes from a bar on, its key and whether Type Notes keeps to it, markers, and the metronome's
// Click and count-in.
import { useState } from 'preact/hooks';
import { barsNeeded } from '../../compose/doc.ts';
import { insertBar, removeBar } from '../../compose/sections.ts';
import { METERS, meterOf, setMeter, setTempoAt, tempoChanges } from '../../compose/song.ts';
import type { SongPrefs } from '../../compose/songprefs.ts';
import { clampBpm } from '../../compose/speed.ts';
import type { Ctl } from './ctl.ts';
import { barWords } from './ctl.ts';
import { Glyph } from './Glyph.tsx';
import { Pop, PopSection } from './Pop.tsx';
import { KeyPicker } from './Pops.tsx';

export interface SongPopProps {
  c: Ctl;
  anchor: HTMLElement | null;
  onClose(): void;
  prefs: SongPrefs;
  setPrefs(p: SongPrefs): void;
  setKey(k: { tonic: number; minor: boolean } | null): void;
  addMarker(name: string): void;
  removeMarker(i: number): void;
}

export function SongPop(p: SongPopProps) {
  const { c } = p;
  const bars = barsNeeded(c.doc);
  const bar = Math.min(bars, c.clock.barOfBeat(c.cursor + 1e-9));
  const meter = meterOf(c.doc);
  const [bpm, setBpm] = useState(c.clock.tempoAt(bar).bpm);
  const [name, setName] = useState('');
  const at = Math.floor(c.cursor + 1e-9);
  const changes = tempoChanges(c.doc);
  const toggle = (k: keyof SongPrefs, label: string, glyph: string) => (
    <button type="button" class="cmp-btn small" aria-pressed={p.prefs[k]} data-song-pref={k} onClick={() => p.setPrefs({ ...p.prefs, [k]: !p.prefs[k] })}>
      <Glyph name={glyph} size={16} />{`${label}: ${p.prefs[k] ? 'On' : 'Off'}`}
    </button>
  );
  return (
    <Pop title="Song" anchor={p.anchor} onClose={p.onClose} name="song">
      <PopSection title="Length">
        <p class="text-sm text-dim" data-song-length="">{`${bars} ${bars === 1 ? 'bar' : 'bars'}. The cursor is on bar ${bar}.`}</p>
        <div class="cmp-pop-row">
          <button type="button" class="cmp-btn small" data-bar-add-end="" onClick={() => c.apply(insertBar(c.doc, bars + 1), `The song is ${bars + 1} bars.`)}><Glyph name="plus" size={16} />Add A Bar At The End</button>
          <button type="button" class="cmp-btn small" data-bar-remove-end="" disabled={bars <= 1} onClick={() => c.apply(removeBar(c.doc, bars), `Removed bar ${bars}. Undo brings it back.`)}><Glyph name="trash" size={16} />Remove The Last Bar</button>
        </div>
        <div class="cmp-pop-row">
          <button type="button" class="cmp-btn small" data-bar-add-here="" onClick={() => c.apply(insertBar(c.doc, bar), `Put an empty bar in at bar ${bar}; the music after it moved a bar on.`)}><Glyph name="plus" size={16} />{`Add A Bar Before Bar ${bar}`}</button>
          <button type="button" class="cmp-btn small" data-bar-remove-here="" disabled={bars <= 1} onClick={() => c.apply(removeBar(c.doc, bar), `Removed bar ${bar} and what starts in it. Undo brings it back.`)}><Glyph name="trash" size={16} />{`Remove Bar ${bar}`}</button>
        </div>
      </PopSection>
      <PopSection title="Time Signature">
        <span class="cmp-seg" role="group" aria-label="Time Signature">
          {METERS.map(m => (
            <button type="button" aria-pressed={meter === m.id} data-meter-id={m.id}
              onClick={() => c.apply(setMeter(c.doc, m.id), `The song is in ${m.id} now. The notes sound as they did; the bars are drawn again around them.`)}>{m.id}</button>
          ))}
        </span>
        <p class="text-sm text-dim">{meter ? `${METERS.find(m => m.id === meter)!.words}. ` : 'The song changes time signature along the way. '}It changes the bars, the ruler and the metronome; the notes keep their place in time.{meter === '6/8' ? ' In 6/8 a beat is an eighth note, so the tempo counts eighths.' : ''}</p>
      </PopSection>
      <PopSection title="Tempo Changes">
        <p class="text-sm text-dim">{`The song starts at ${c.clock.tempoAt(1).bpm} BPM, the tempo in the bar above. A tempo change holds from its bar on.`}</p>
        {changes.length ? (
          <div class="cmp-song-list">
            {changes.map(t => (
              <div class="cmp-song-li" data-tempo-change={t.bar}><span class="flex-1">{`From bar ${t.bar}: ${t.bpm} BPM`}</span>
                <button type="button" class="cmp-icon" aria-label={`Remove The Tempo Change At Bar ${t.bar}`} onClick={() => c.apply(setTempoAt(c.doc, t.bar, null))}><Glyph name="close" /></button></div>
            ))}
          </div>
        ) : null}
        <div class="cmp-pop-row">
          <span class="cmp-seg" role="group" aria-label="New Tempo">
            <button type="button" aria-label="Slower" onClick={() => setBpm(v => clampBpm(v - 4))}>−</button>
            <button type="button" disabled class="min-w-16" data-new-bpm="">{bpm}<span class="ml-1 text-[0.6rem] text-dim">BPM</span></button>
            <button type="button" aria-label="Faster" onClick={() => setBpm(v => clampBpm(v + 4))}>+</button>
          </span>
          <button type="button" class="cmp-btn small" data-tempo-at="" disabled={bar <= 1} title={bar <= 1 ? 'Bar 1 is the tempo in the bar above' : ''}
            onClick={() => c.apply(setTempoAt(c.doc, bar, bpm), `From bar ${bar} the song plays at ${bpm} BPM.`)}>{`Change Tempo At Bar ${bar}`}</button>
        </div>
      </PopSection>
      <PopSection title="Key">
        <KeyPicker c={c} setKey={p.setKey} />
        <div class="cmp-pop-row">{c.doc.key ? toggle('inKey', 'Type Notes Stay In Key', 'keys') : <span class="text-sm text-dim">With a key, Type Notes can keep to it.</span>}</div>
      </PopSection>
      <PopSection title="Markers">
        <p class="text-sm text-dim">Named points on the ruler. Tap one there to jump to it.</p>
        {(c.doc.markers ?? []).map((m, i) => (
          <div class="cmp-song-li"><span class="flex-1">{m.name} · {barWords(c.clock, m.beat)}</span>
            <button type="button" class="cmp-btn small" onClick={() => { c.setCursor(m.beat); if (c.playing) c.playFrom(m.beat); }}>Jump</button>
            <button type="button" class="cmp-icon" aria-label={`Remove The Marker ${m.name}`} onClick={() => p.removeMarker(i)}><Glyph name="close" /></button></div>
        ))}
        <div class="cmp-pop-row">
          <input type="text" class="min-h-11 min-w-0 flex-1 rounded-md border border-rule bg-well px-3 text-ink" placeholder="Name, e.g. Big Drop" aria-label="Marker Name" maxLength={24}
            value={name} onInput={e => setName((e.target as HTMLInputElement).value)} onKeyDown={e => e.stopPropagation()} />
          <button type="button" class="cmp-btn small" data-add-marker="" onClick={() => { p.addMarker(name.trim() || `Marker ${(c.doc.markers?.length ?? 0) + 1}`); setName(''); }}>
            <Glyph name="flag" size={16} />{`Add At ${barWords(c.clock, at).replace(/^b/, 'B')}`}
          </button>
        </div>
      </PopSection>
      <PopSection title="Metronome">
        <div class="cmp-pop-row">
          {toggle('click', 'Click', 'metro')}
          {toggle('countIn', 'Count In One Bar Before Playing', 'metro')}
        </div>
        <p class="text-sm text-dim">Click ticks on every beat while the song plays, louder on the first of each bar.</p>
      </PopSection>
    </Pop>
  );
}
