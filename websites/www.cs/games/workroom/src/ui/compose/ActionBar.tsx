// The action bar at the foot of the screen: what can be done with what is picked. Picked notes: pitch and octave up or
// down, their loudness, Fix Timing, Duplicate, Copy, Paste, Loop Bars, Delete. A picked region: Split, Join, Repeat,
// Duplicate, Copy, Paste, Delete. A picked section: Rename, Duplicate, Loop Bars, Remove. A chord from the chord
// helper: Hear, Put At Cursor, Other Chord, Done. Splitting: Cancel. It is gone when nothing is picked.
import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { chordName, chordPitches, chordRoot } from '../../compose/chords.ts';
import type { RegionClip } from '../../compose/regions.ts';
import { copyRegion, deleteRegion, duplicateRegion, joinRegion, loopRegion, pasteRegion, splitRegion } from '../../compose/regions.ts';
import type { NoteClip } from '../../compose/notetools.ts';
import { copyNotes, duplicateNotes, fixTiming, pasteNotes, setVelocity, transposeNotes } from '../../compose/notetools.ts';
import { duplicateSection, removeSection, sectionsOf } from '../../compose/sections.ts';
import { removeNotes } from '../../compose/edit.ts';
import { addNotes } from '../../compose/edit.ts';
import type { Ctl } from './ctl.ts';
import { barWords } from './ctl.ts';
import { Glyph } from './Glyph.tsx';

export type Clipboard = RegionClip | NoteClip | null;

export interface ActionBarProps {
  c: Ctl;
  clip: Clipboard;
  setClip(c: Clipboard): void;
}

function Act(p: { glyph: string; label: string; onClick(e: MouseEvent): void; disabled?: boolean; danger?: boolean; title?: string }) {
  return (
    <button type="button" class={`cmp-btn${p.danger ? ' danger' : ''}`} data-pop-anchor="" disabled={p.disabled} title={p.title} onClick={e => p.onClick(e as MouseEvent)}>
      <Glyph name={p.glyph} size={18} /><span>{p.label}</span>
    </button>
  );
}

/** Copy, Paste and their keys work on the picked notes or region; paste goes at the cursor. */
export function copyPicked(c: Ctl, setClip: (x: Clipboard) => void): boolean {
  const k = c.pick;
  if (k.kind === 'notes') {
    const part = c.doc.parts.find(x => x.id === k.part);
    const made = part ? copyNotes(c.doc, k.part, k.ids, c.drums(part)) : null;
    if (made) { setClip(made); c.say(`Copied ${k.ids.size} ${k.ids.size === 1 ? 'note' : 'notes'}. Paste puts them at the cursor.`); return true; }
  }
  if (k.kind === 'region') {
    const part = c.doc.parts.find(x => x.id === k.part);
    if (part) { setClip(copyRegion(c.doc, k.part, k.id, c.drums(part))); c.say('Copied the region. Paste puts it at the cursor.'); return true; }
  }
  return false;
}

export function pasteAtCursor(c: Ctl, clip: Clipboard): boolean {
  if (!clip) return false;
  const fits = (id: string | null | undefined) => {
    const part = c.doc.parts.find(x => x.id === id);
    return part && !part.vocal && c.drums(part) === clip.drums ? part : null;
  };
  const k = c.pick;
  const part = fits(k.kind === 'region' || k.kind === 'notes' ? k.part : null) ?? fits(c.sel) ?? c.doc.parts.find(x => fits(x.id));
  if (!part) { c.say(`Paste needs a ${clip.drums ? 'drum' : 'note'} track.`); return false; }
  const at = Math.floor(c.cursor + 1e-9);
  if (clip.kind === 'region') {
    const made = pasteRegion(c.doc, part.id, clip, at);
    c.apply(made.doc);
    c.setPick({ kind: 'region', part: part.id, id: made.id });
  } else {
    const made = pasteNotes(c.doc, part.id, clip, at);
    c.apply(made.doc);
    c.setPick({ kind: 'notes', part: part.id, ids: new Set(made.ids) });
  }
  c.say(`Pasted at ${barWords(c.clock, at)} on the ${part.name}.`);
  return true;
}

/** Loop These Bars: the bars around the picked notes, region or section. */
export function loopPicked(c: Ctl): void {
  const k = c.pick;
  let a: number | null = null;
  let z: number | null = null;
  if (k.kind === 'notes') {
    const ns = c.doc.parts.find(x => x.id === k.part)?.notes.filter(n => k.ids.has(n.id)) ?? [];
    if (ns.length) { a = Math.min(...ns.map(n => n.start)); z = Math.max(...ns.map(n => n.start + n.length)); }
  } else if (k.kind === 'region') {
    const r = c.doc.parts.find(x => x.id === k.part)?.regions?.find(x => x.id === k.id);
    if (r) { a = r.start; z = r.start + r.length; }
  } else if (k.kind === 'section') {
    const s = sectionsOf(c.doc).find(x => x.id === k.id);
    if (s) { a = c.clock.barStartBeat(s.from); z = c.clock.barStartBeat(s.to + 1); }
  }
  if (a === null || z === null) return;
  const from = c.clock.barStartBeat(c.clock.barOfBeat(a + 1e-9));
  const to = Math.min(c.end, Math.max(c.clock.barStartBeat(c.clock.barOfBeat(from) + 1), c.clock.barStartBeat(c.clock.barOfBeat(z - 1e-9) + 1)));
  c.setLoop({ from, to });
  c.say(`Looping ${barWords(c.clock, from)} to ${barWords(c.clock, to)}. Loop is on.`);
  if (c.playing) c.playFrom(from);
}

export function ActionBar(p: ActionBarProps) {
  const { c } = p;
  const k = c.pick;
  const ref = useRef<HTMLDivElement>(null);
  const shown = !c.placing && (k.kind === 'notes' || k.kind === 'region' || k.kind === 'section' || !!c.chord || c.splitting);
  useEffect(() => {
    document.body?.classList?.toggle('cmp-has-actbar', shown);
    return () => document.body?.classList?.remove('cmp-has-actbar');
  }, [shown]);
  if (!shown) return null;
  const close = () => { c.setPick({ kind: 'none' }); c.setChord(null); c.setSplitting(false); };
  let title = '';
  let say = '';
  let body: ComponentChildren = null;
  if (c.chord) {
    const part = c.doc.parts.find(x => x.id === c.chord!.part);
    const root = part ? chordRoot(c.chord.chord, c.low(part) + 11) : 60;
    title = `Chord ${chordName(c.chord.chord)}`;
    say = `Tap the ${part?.name ?? 'piano roll'} where it goes.`;
    body = (
      <div class="btns">
        <Act glyph="play" label="Hear" onClick={() => { if (part) for (const q of chordPitches(c.chord!.chord, root)) c.preview(part, q, 2); }} />
        <Act glyph="plus" label="Put At Cursor" onClick={() => {
          if (!part) return;
          const made = addNotes(c.doc, part.id, chordPitches(c.chord!.chord, root).map(pitch => ({ start: Math.floor(c.cursor + 1e-9), length: c.len, pitch })));
          c.apply(made.doc);
          c.setPick({ kind: 'notes', part: part.id, ids: new Set(made.ids) });
        }} />
        <Act glyph="chord" label="Other Chord" onClick={e => c.openPop('chords', e.currentTarget as HTMLElement, c.chord!.part)} />
        <Act glyph="check" label="Done" onClick={() => c.setChord(null)} />
      </div>
    );
  } else if (c.splitting) {
    title = 'Split';
    say = 'Tap a region where it should split.';
    body = <div class="btns"><Act glyph="close" label="Cancel" onClick={() => c.setSplitting(false)} /></div>;
  } else if (k.kind === 'notes') {
    const part = c.doc.parts.find(x => x.id === k.part);
    if (!part) return null;
    const drums = c.drums(part);
    const ns = part.notes.filter(n => k.ids.has(n.id));
    const avg = ns.length ? Math.round(ns.reduce((s, n) => s + n.velocity, 0) / ns.length) : 90;
    title = ns.length === 1 ? '1 Note' : `${ns.length} Notes`;
    say = drums || c.coarse ? `On the ${part.name}.` : `On the ${part.name}. ↑ ↓ change the pitch; Shift for an octave.`;
    const tr = (d: number) => { c.apply(transposeNotes(c.doc, part.id, k.ids, d)); const first = ns[0]; if (first) c.preview(part, Math.max(0, Math.min(127, first.pitch + d)), 1); };
    body = (
      <>
        <div class="cmp-pop-row">
          {drums ? null : (
            <>
              <span class="cmp-label">Pitch</span>
              <span class="cmp-seg" role="group" aria-label="Pitch">
                <button type="button" aria-label="Lower" title="Lower (↓)" onClick={() => tr(-1)}><Glyph name="chev-d" size={16} /></button>
                <button type="button" aria-label="Higher" title="Higher (↑)" onClick={() => tr(1)}><Glyph name="chev-u" size={16} /></button>
              </span>
              <span class="cmp-label">Octave</span>
              <span class="cmp-seg" role="group" aria-label="Octave Of The Picked Notes">
                <button type="button" aria-label="An Octave Lower" title="An octave lower (Shift+↓)" onClick={() => tr(-12)}><Glyph name="chev-d" size={16} /></button>
                <button type="button" aria-label="An Octave Higher" title="An octave higher (Shift+↑)" onClick={() => tr(12)}><Glyph name="chev-u" size={16} /></button>
              </span>
            </>
          )}
          <label class="flex min-w-40 flex-1 items-center gap-2"><span class="cmp-label">Loudness</span>
            <input type="range" min={10} max={127} step={1} value={avg} aria-label="Loudness Of The Picked Notes" data-loudness="" class="min-h-11 w-full min-w-0 accent-amber"
              onChange={e => c.apply(setVelocity(c.doc, part.id, k.ids, Number((e.target as HTMLInputElement).value)), 'Changed how loud the picked notes play.')} />
          </label>
        </div>
        <div class="btns">
          <Act glyph="magnet" label="Fix Timing" title="Snap the picked notes to the New Notes length" onClick={() => c.apply(fixTiming(c.doc, part.id, k.ids, drums ? c.clock.quarter(1) / 4 : c.len), 'The picked notes now start on the step.')} />
          <Act glyph="dup" label="Duplicate" onClick={() => { const made = duplicateNotes(c.doc, part.id, k.ids, 1); c.apply(made.doc); c.setPick({ kind: 'notes', part: part.id, ids: new Set(made.ids) }); }} />
          <Act glyph="copy" label="Copy" onClick={() => copyPicked(c, p.setClip)} />
          <Act glyph="paste" label="Paste" disabled={!p.clip} onClick={() => pasteAtCursor(c, p.clip)} />
          <Act glyph="loop" label="Loop Bars" onClick={() => loopPicked(c)} />
          <Act glyph="trash" label="Delete" danger onClick={() => { c.apply(removeNotes(c.doc, part.id, k.ids), 'Deleted. Undo brings them back.'); c.setPick({ kind: 'none' }); }} />
        </div>
      </>
    );
  } else if (k.kind === 'region') {
    const part = c.doc.parts.find(x => x.id === k.part);
    const r = part?.regions?.find(x => x.id === k.id);
    if (!part || !r) return null;
    title = 'Region';
    say = `${part.name} · ${barWords(c.clock, r.start)} → ${barWords(c.clock, r.start + r.length)}${r.loop ? ' · repeats' : ''}`;
    const split = () => {
      const at = Math.round(c.cursor);
      if (at > r.start && at < r.start + r.length) {
        const made = splitRegion(c.doc, part.id, r.id, at);
        if (made) { c.apply(made.doc); c.setPick({ kind: 'region', part: part.id, id: made.id }); return; }
      }
      c.setSplitting(true);
    };
    body = (
      <div class="btns">
        <Act glyph="split" label="Split" title="Split at the cursor, or tap where (S)" onClick={split} />
        <Act glyph="join" label="Join" disabled={(part.regions?.length ?? 0) < 2} title="Join with the next region" onClick={() => { const next = joinRegion(c.doc, part.id, r.id); if (next) c.apply(next); }} />
        <Act glyph="loop" label="Repeat" title="Play this region once more after itself" onClick={() => c.apply(loopRegion(c.doc, part.id, r.id, r.start + r.length + (r.loop ?? r.length)), 'The region repeats once more.')} />
        <Act glyph="dup" label="Duplicate" onClick={() => { const made = duplicateRegion(c.doc, part.id, r.id); c.apply(made.doc); c.setPick({ kind: 'region', part: part.id, id: made.id }); }} />
        <Act glyph="copy" label="Copy" onClick={() => copyPicked(c, p.setClip)} />
        <Act glyph="paste" label="Paste" disabled={!p.clip} onClick={() => pasteAtCursor(c, p.clip)} />
        <Act glyph="trash" label="Delete" danger onClick={() => { c.apply(deleteRegion(c.doc, part.id, r.id), 'Deleted the region. Undo brings it back.'); c.setPick({ kind: 'none' }); }} />
      </div>
    );
  } else if (k.kind === 'section') {
    const s = sectionsOf(c.doc).find(x => x.id === k.id);
    if (!s) return null;
    title = s.name;
    say = `Bar ${s.from} → bar ${s.to}. Drag it to move it with its music.`;
    body = (
      <div class="btns">
        <Act glyph="pencil" label="Rename" onClick={e => c.openPop('section-rename', e.currentTarget as HTMLElement, s.id)} />
        <Act glyph="dup" label="Duplicate" title="Repeat this section straight after it" onClick={() => c.apply(duplicateSection(c.doc, s.id), `${s.name} now plays twice.`)} />
        <Act glyph="loop" label="Loop Bars" onClick={() => loopPicked(c)} />
        <Act glyph="trash" label="Remove" danger title="Remove the name; the music stays" disabled={sectionsOf(c.doc).length < 2}
          onClick={() => { c.apply(removeSection(c.doc, s.id), 'The section name is gone; the music stays.'); c.setPick({ kind: 'none' }); }} />
      </div>
    );
  }
  return (
    <div ref={ref} class="cmp-actbar" role="region" aria-label="Actions" data-actbar="">
      <div class="top"><b>{title}</b><span>{say}</span>
        <button type="button" class="cmp-icon" aria-label="Done" title="Done" onClick={close}><Glyph name="close" /></button>
      </div>
      {body}
    </div>
  );
}
