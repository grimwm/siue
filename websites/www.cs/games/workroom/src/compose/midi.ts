// Standard MIDI Files: reading one (formats 0 and 1, any ticks to the quarter, running status, a note-on at velocity 0
// as a note-off, the sustain pedal, channel 10 as drums) into the importer's parts, and writing the editor's document
// as format 1 at 480 ticks to the quarter: a conductor track with the title, every speed and time signature, then one
// track per part on its channel (channels.ts) with its General MIDI program. DOM-free.
import type { Entry } from '../catalogue.ts';
import type { Tempo } from '../score.ts';
import { beatClock, quarterClock } from './beats.ts';
import { channels, DRUM_CHANNEL } from './channels.ts';
import { barsNeeded } from './doc.ts';
import type { EditDoc } from './doc.ts';
import { byStart, ImportError, unitOf } from './music-file.ts';
import type { ReadMusic, ReadNote, ReadPart } from './music-file.ts';

export { ImportError };

const WRITE_TPQ = 480;
const DEFAULT_TEMPO_US = 500_000;
const SUSTAIN = 64;
/** Controllers that set up a channel rather than move it: bank select, data entry, RPN/NRPN, reset and all-notes-off. */
const SETUP_CONTROLLERS = new Set([0, 6, 32, 38, 98, 99, 100, 101, 120, 121, 123]);

const text = (bytes: Uint8Array): string => new TextDecoder('latin1').decode(bytes);

class Reader {
  at = 0;
  readonly bytes: Uint8Array;
  readonly end: number;
  constructor(bytes: Uint8Array, end = bytes.length) { this.bytes = bytes; this.end = end; }
  need(n: number): void { if (this.at + n > this.end) throw new ImportError('This MIDI file ends early: it may have been cut short while downloading.'); }
  u8(): number { this.need(1); return this.bytes[this.at++]!; }
  u16(): number { return (this.u8() << 8) | this.u8(); }
  u32(): number { return ((this.u8() << 24) >>> 0) + (this.u8() << 16) + (this.u8() << 8) + this.u8(); }
  vlq(): number {
    let n = 0;
    for (let i = 0; i < 4; i++) { const b = this.u8(); n = (n << 7) | (b & 0x7f); if (!(b & 0x80)) return n; }
    throw new ImportError('This MIDI file has a time value too long to read.');
  }
  take(n: number): Uint8Array { this.need(n); const out = this.bytes.subarray(this.at, this.at + n); this.at += n; return out; }
}

interface Meta { tick: number; tempo?: number; time?: [number, number]; key?: [number, number] }

/**
 * A MIDI file as the importer's parts: one part per channel of each track that plays notes, named from the track
 * (or as the channel). `check` is called now and then, and throws to stop a read that has taken too long.
 */
export function readMidi(bytes: Uint8Array, check: () => void = () => {}): ReadMusic {
  const r = new Reader(bytes);
  if (bytes.length < 14 || text(bytes.subarray(0, 4)) !== 'MThd') throw new ImportError('This is not a MIDI file: it does not start the way MIDI files do.');
  r.at = 4;
  const headerLength = r.u32();
  if (headerLength < 6) throw new ImportError('This MIDI file\'s header is damaged.');
  const format = r.u16();
  const trackCount = r.u16();
  const division = r.u16();
  r.at = 8 + headerLength;
  if (format > 1) throw new ImportError('This MIDI file holds separate patterns (MIDI format 2), which cannot be read as one piece.');
  if (division & 0x8000) throw new ImportError('This MIDI file is timed in video frames rather than beats, which cannot be read as music.');
  const tpq = division || 96;

  const metas: Meta[] = [];
  const lost = new Set<string>();
  let bends = 0;
  let moves = 0;
  let sysex = false;
  let title: string | null = null;
  const programs = new Map<number, number>(); // channel -> first program, file-wide
  const parts: { track: number; channel: number; name: string | null; program: number | null; notes: ReadNote[] }[] = [];
  let events = 0;

  for (let t = 0; t < trackCount; t++) {
    if (r.at >= bytes.length) break;
    const id = text(r.take(4));
    const length = r.u32();
    if (id !== 'MTrk') { r.need(length); r.at += length; t--; continue; }
    r.need(length);
    const tr = new Reader(bytes, r.at + length);
    tr.at = r.at;
    r.at += length;
    let tick = 0;
    let status = 0;
    let trackName: string | null = null;
    const own = new Map<number, { program: number | null; notes: ReadNote[] }>();
    const open = new Map<number, { start: number; velocity: number }[]>(); // channel*128+pitch -> starts
    const pedal = new Set<number>();
    const held = new Map<number, number[]>(); // channel -> keys ended under the pedal (channel*128+pitch)
    const chan = (c: number) => { let o = own.get(c); if (!o) { o = { program: null, notes: [] }; own.set(c, o); } return o; };
    const end = (key: number, at: number): void => {
      const starts = open.get(key);
      const s = starts?.shift();
      if (!s) return;
      chan(key >> 7).notes.push({ start: s.start / tpq, length: Math.max(1, at - s.start) / tpq, pitch: key & 127, velocity: s.velocity });
    };
    while (tr.at < tr.end) {
      if (++events % 2000 === 0) check();
      tick += tr.vlq();
      let b = tr.u8();
      if (b === 0xff) {
        const type = tr.u8();
        const data = tr.take(tr.vlq());
        if (type === 0x2f) break;
        if (type === 0x03 && data.length) { trackName ??= text(data).trim() || null; if (t === 0 && title === null) title = trackName; }
        else if (type === 0x51 && data.length === 3) metas.push({ tick, tempo: (data[0]! << 16) | (data[1]! << 8) | data[2]! });
        else if (type === 0x58 && data.length >= 2) metas.push({ tick, time: [data[0]!, 2 ** data[1]!] });
        else if (type === 0x59 && data.length === 2) metas.push({ tick, key: [((data[0]! << 24) >> 24), data[1]!] });
        continue;
      }
      if (b === 0xf0 || b === 0xf7) { tr.take(tr.vlq()); sysex = true; continue; }
      if (b & 0x80) { status = b; b = tr.u8(); } else if (!status) throw new ImportError('This MIDI file has an event with no status before it.');
      const kind = status & 0xf0;
      const c = status & 0x0f;
      const two = kind !== 0xc0 && kind !== 0xd0;
      const d1 = b & 0x7f;
      const d2 = two ? tr.u8() & 0x7f : 0;
      if (kind === 0x90 && d2 > 0) {
        const key = (c << 7) | d1;
        const starts = open.get(key) ?? [];
        // A key struck again while it still sounds ends the earlier note there.
        if (starts.length && !pedal.has(c)) end(key, tick);
        (open.get(key) ?? open.set(key, []).get(key)!).push({ start: tick, velocity: d2 });
        chan(c);
      } else if (kind === 0x80 || kind === 0x90) {
        const key = (c << 7) | d1;
        if (pedal.has(c)) (held.get(c) ?? held.set(c, []).get(c)!).push(key);
        else end(key, tick);
      } else if (kind === 0xb0) {
        if (d1 === SUSTAIN) {
          if (d2 >= 64) pedal.add(c);
          else { pedal.delete(c); for (const key of held.get(c) ?? []) end(key, tick); held.delete(c); }
        } else if (!SETUP_CONTROLLERS.has(d1)) moves++;
      } else if (kind === 0xc0) {
        chan(c).program ??= d1 + 1;
        if (!programs.has(c)) programs.set(c, d1 + 1);
      } else if (kind === 0xe0) bends++;
    }
    // Notes still sounding at the end of the track end there.
    for (const [key, starts] of open) while (starts.length) end(key, tick);
    for (const [c, o] of own) if (o.notes.length) parts.push({ track: t, channel: c, name: trackName, program: o.program, notes: o.notes.sort(byStart) });
  }
  if (bends) lost.add(`Pitch-wheel moves (${bends}). The notes come across at their own pitch, without the bends.`);
  if (moves) lost.add('Volume, pan and other controller moves. Each note keeps its own loudness.');
  if (sysex) lost.add('Device messages (SysEx) for a particular synthesizer.');

  const { tempo, fifths, mode } = tempoMap(metas, tpq, lost, Math.max(0, ...parts.flatMap(p => p.notes.map(n => n.start + n.length))));
  lost.add(fifths === null ? 'Key and clef. MIDI files don\'t say, so the key is worked out from the notes and each clef is chosen from its instrument.'
    : 'Clefs. MIDI files don\'t say, so each part\'s clef is chosen from its instrument.');
  const perTrack = new Map<number, number>();
  for (const p of parts) perTrack.set(p.track, (perTrack.get(p.track) ?? 0) + 1);
  const read: ReadPart[] = parts.map(p => {
    const drums = p.channel === DRUM_CHANNEL;
    const base = p.name ?? (drums ? 'Drums' : `Channel ${p.channel + 1}`);
    return {
      name: p.name && perTrack.get(p.track)! > 1 ? `${base} (Channel ${p.channel + 1})` : base,
      program: drums ? null : p.program ?? programs.get(p.channel) ?? null, drums, notes: p.notes,
    };
  });
  return { format: 'MIDI', app: null, title, tempo, fifths, mode, parts: read, lost: [...lost] };
}

/** The speed and time signature by bar from the file's meta events. A change in the middle of a bar takes effect at the next bar. */
function tempoMap(metas: readonly Meta[], tpq: number, lost: Set<string>, endQuarters: number): { tempo: Tempo[]; fifths: number | null; mode: 'major' | 'minor' | null } {
  const sorted = [...metas].sort((a, b) => a.tick - b.tick);
  const key = sorted.find(m => m.key)?.key;
  let us = DEFAULT_TEMPO_US;
  let beats = 4;
  let unit: Tempo['unit'] = 4;
  const out: Tempo[] = [];
  let bar = 1;
  let barTick = 0;
  let i = 0;
  const push = (): void => {
    const bpm = Math.round(((60_000_000 / us) * unit / 4) * 100) / 100;
    const last = out[out.length - 1];
    if (last && last.bpm === bpm && last.beats === beats && last.unit === unit) return;
    if (last && last.bar === bar) out.pop();
    out.push({ bar, bpm, beats, unit });
  };
  const apply = (m: Meta): void => {
    if (m.tempo) us = m.tempo;
    if (m.time) {
      const u = unitOf(m.time[1]);
      if (u && m.time[0] >= 1 && m.time[0] <= 16) { beats = m.time[0]; unit = u; }
      else lost.add(`The time signature ${m.time[0]}/${m.time[1]}, which the workroom cannot write; the bars keep ${beats}/${unit}.`);
    }
  };
  const lastTick = Math.max(endQuarters * tpq, ...sorted.map(m => m.tick));
  for (;;) {
    const barTicks = (beats * 4 * tpq) / unit;
    // Changes at the bar's start shape this bar; changes inside it, the next.
    while (i < sorted.length && sorted[i]!.tick <= barTick + 1e-6) apply(sorted[i++]!);
    push();
    const next = barTick + barTicks;
    const before = `${us} ${beats} ${unit}`;
    while (i < sorted.length && sorted[i]!.tick < next - 1e-6) apply(sorted[i++]!);
    if (`${us} ${beats} ${unit}` !== before) lost.add(`A speed or time change in the middle of bar ${bar}. It starts at bar ${bar + 1} instead.`);
    if (i >= sorted.length && next >= lastTick) break;
    bar++;
    barTick = next;
    if (bar > 100_000) break;
  }
  return { tempo: out, fifths: key ? key[0] : null, mode: key ? (key[1] ? 'minor' : 'major') : null };
}

const vlq = (n: number): number[] => {
  const out = [n & 0x7f];
  let v = Math.floor(n / 128);
  while (v > 0) { out.unshift(0x80 | (v & 0x7f)); v = Math.floor(v / 128); }
  return out;
};
const ascii = (s: string): number[] => [...s].map(ch => { const c = ch.charCodeAt(0); return c < 128 ? c : 63; });
const meta = (type: number, data: number[]): number[] => [0xff, type, ...vlq(data.length), ...data];

function chunk(events: { tick: number; order: number; raw: number[] }[]): number[] {
  events.sort((a, b) => a.tick - b.tick || a.order - b.order);
  const body: number[] = [];
  let now = 0;
  for (const e of events) { body.push(...vlq(e.tick - now), ...e.raw); now = e.tick; }
  body.push(0, 0xff, 0x2f, 0);
  const n = body.length;
  return [0x4d, 0x54, 0x72, 0x6b, (n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255, ...body];
}

/** The document as a format-1 Standard MIDI File. */
export function writeMidi(doc: EditDoc, entries: readonly Entry[]): Uint8Array {
  const clock = beatClock(doc.tempo);
  const q = quarterClock(doc.tempo);
  const bars = barsNeeded(doc);
  const tick = (beat: number): number => Math.round(q.quarters(beat) * WRITE_TPQ);
  const conductor = [{ tick: 0, order: 0, raw: meta(0x03, ascii(doc.title)) }];
  for (const t of doc.tempo.filter(x => x.bar <= bars)) {
    const at = tick(clock.barStartBeat(t.bar));
    const us = Math.round(60_000_000 / ((t.bpm * 4) / t.unit));
    conductor.push({ tick: at, order: 1, raw: meta(0x51, [(us >> 16) & 255, (us >> 8) & 255, us & 255]) });
    conductor.push({ tick: at, order: 1, raw: meta(0x58, [t.beats, Math.log2(t.unit), 24, 8]) });
  }
  const chans = channels(doc, entries);
  const tracks = [chunk(conductor)];
  for (const p of doc.parts) {
    const e = entries.find(x => x.id === p.instrument);
    const c = chans.get(p.id) ?? 0;
    const ev = [{ tick: 0, order: 0, raw: meta(0x03, ascii(p.name)) }, { tick: 0, order: 1, raw: [0xc0 | c, Math.max(0, Math.min(127, (e?.gm ?? 1) - 1))] }];
    for (const n of p.notes) {
      const on = tick(n.start);
      const off = Math.max(on + 1, tick(n.start + n.length));
      const v = Math.max(1, Math.min(127, Math.round(n.velocity)));
      ev.push({ tick: on, order: 3, raw: [0x90 | c, n.pitch & 127, v] }, { tick: off, order: 2, raw: [0x80 | c, n.pitch & 127, 0] });
    }
    tracks.push(chunk(ev));
  }
  const n = tracks.length;
  return new Uint8Array([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, (n >> 8) & 255, n & 255, (WRITE_TPQ >> 8) & 255, WRITE_TPQ & 255, ...tracks.flat()]);
}
