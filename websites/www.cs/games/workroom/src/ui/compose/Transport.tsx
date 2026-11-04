// The transport bar, always in view at the top: Play and Stop (also the space bar; "Getting Ready…" while the sound is
// built), Back To Start, Loop, the tempo (− BPM +), where the music is (Bar · Beat · time, written by the playhead's
// clock, never by a render), Undo and Redo, Save Draft, the Piece menu, and the three views: Compose, Mix and Sheet.
import type { Ref } from 'preact';
import { cx } from '../console/cx.ts';
import { Glyph } from './Glyph.tsx';

export type View = 'compose' | 'mix' | 'sheet';
export const VIEWS: readonly { id: View; label: string; glyph: string }[] = [
  { id: 'compose', label: 'Compose', glyph: 'roll' }, { id: 'mix', label: 'Mix', glyph: 'mix' }, { id: 'sheet', label: 'Sheet', glyph: 'staff' },
];

export interface TransportProps {
  playing: boolean;
  /** The sound is being built: Play says so and waits. */
  getting: boolean;
  onPlay(): void;
  onStop(): void;
  onRewind(): void;
  loopOn: boolean;
  onLoop(): void;
  bpm: number;
  onBpm(bpm: number): void;
  readout: Ref<HTMLSpanElement>;
  undos: number;
  redos: number;
  onUndo(): void;
  onRedo(): void;
  saving: boolean;
  canSave: boolean;
  onSave(): void;
  onMenu(anchor: HTMLElement): void;
  view: View;
  onView(v: View): void;
}

export function Transport(p: TransportProps) {
  return (
    <div class="cmp-transport" role="toolbar" aria-label="Transport" data-transport="">
      <button type="button" class={cx('cmp-btn cmp-play min-w-28', p.playing && 'on')} data-play="" aria-label={p.playing ? 'Stop' : 'Play'} disabled={p.getting && !p.playing}
        onClick={() => (p.playing ? p.onStop() : p.onPlay())}>
        <Glyph name={p.playing ? 'stop' : 'play'} />{p.getting ? 'Getting Ready…' : p.playing ? 'Stop' : 'Play'}
      </button>
      <button type="button" class="cmp-icon" aria-label="Back To Start" title="Back to the start" onClick={p.onRewind}><Glyph name="rewind" /></button>
      <button type="button" class="cmp-icon" aria-label="Loop" aria-pressed={p.loopOn} title="Loop: play round and round" data-loop="" onClick={p.onLoop}><Glyph name="loop" /></button>
      <span class="cmp-seg cmp-tempo" role="group" aria-label="Tempo">
        <button type="button" aria-label="Slower" title="Slower" onClick={() => p.onBpm(p.bpm - 4)}>−</button>
        <button type="button" disabled class="min-w-14 font-mono text-sm text-amber" data-bpm="">{p.bpm}<span class="ml-1 text-[0.6rem] text-dim">BPM</span></button>
        <button type="button" aria-label="Faster" title="Faster" onClick={() => p.onBpm(p.bpm + 4)}>+</button>
      </span>
      <span class="cmp-readout" ref={p.readout} data-readout="" aria-live="off">Bar 1 · Beat 1 · 0:00</span>
      <button type="button" class="cmp-icon" aria-label="Undo" title="Undo (Ctrl+Z)" data-undo={String(p.undos)} disabled={p.undos === 0} onClick={p.onUndo}><Glyph name="undo" /></button>
      <button type="button" class="cmp-icon" aria-label="Redo" title="Redo (Shift+Ctrl+Z)" data-redo={String(p.redos)} disabled={p.redos === 0} onClick={p.onRedo}><Glyph name="redo" /></button>
      <button type="button" class="cmp-btn cmp-wide primary" data-save="" disabled={p.saving || !p.canSave} onClick={p.onSave}><Glyph name="save" size={18} />{p.saving ? 'Saving…' : 'Save Draft'}</button>
      <button type="button" class="cmp-icon" aria-label="Piece Menu" title="Save, import, export, markers" data-pop-anchor="" data-piece-menu="" onClick={e => p.onMenu(e.currentTarget as HTMLElement)}><Glyph name="more" /></button>
      <div role="tablist" aria-label="Views" class="cmp-modes">
        {VIEWS.map(v => (
          <button type="button" role="tab" aria-selected={p.view === v.id} data-view={v.id} onClick={() => p.onView(v.id)}><Glyph name={v.glyph} size={18} />{v.label}</button>
        ))}
      </div>
    </div>
  );
}

/** "Bar 3 · Beat 2 · 0:05" for a beat, through the clock. */
export function readoutWords(bar: number, beat: number, seconds: number): string {
  const s = Math.max(0, seconds);
  return `Bar ${bar} · Beat ${beat} · ${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}
