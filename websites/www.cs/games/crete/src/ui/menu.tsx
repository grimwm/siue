// The Island of Crete: the menu. In order: the seed box, sound and full screen, the story log, how to play, Quit.
// Q (the kit's back key) is handled by src/ui.ts, which owns every card, so the dialog is given no onDismiss;
// the Close button is for a pointer or a finger.
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';
import type { Seg } from '../help.ts';
import type { LogTone } from '../engine.ts';

export interface LogLine {
  text: string;
  tone?: LogTone;
}

export interface MenuProps {
  open: boolean;
  /** The seed box's text. */
  seed: string;
  /** The run's facts under the seed box. */
  runInfo: string;
  muted: boolean;
  fullscreen: boolean;
  log: LogLine[];
  help: Seg[][];
  onSeed: (text: string) => void;
  onPlaySeed: () => void;
  onRandom: () => void;
  onSound: () => void;
  onFullscreen: () => void;
  onQuit: () => void;
  onClose: () => void;
}

const segs = (line: Seg[]) => line.map(s => (typeof s === 'string' ? s : <strong>{s.strong}</strong>));

export function Menu(p: MenuProps) {
  const list = useRef<HTMLOListElement>(null);
  // Newest line in view whenever the menu opens or a line arrives.
  useLayoutEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [p.open, p.log.length]);
  return (
    <Dialog open={p.open} id="menu-veil" veilClass="veil" panelClass="card menu" kicker="The Island of Crete" kickerClass="kicker"
      titleId="menu-title" title="Menu">
      <Button id="menu-close" class="close" label="Close menu" keyLabel={KEYS.menu.label} onClick={p.onClose}>✕</Button>
      <form id="seed-form" class="menu-sec seedbox" data-section="seed" action="#"
        onSubmit={ev => { ev.preventDefault(); p.onPlaySeed(); }}>
        <label for="seed-input">Seed</label>
        <input id="seed-input" name="seed" type="text" inputMode="text" autocomplete="off" spellcheck={false}
          placeholder="e.g. stefan-1984" value={p.seed} onInput={ev => p.onSeed(ev.currentTarget.value)} />
        <Button id="seed-play" onClick={p.onPlaySeed}>Play this seed</Button>
        <Button id="random-run" title="Ignore the seed box and start on a fresh random seed" onClick={p.onRandom}>🎲 Random seed</Button>
        <p id="run-stats" class="runstats">{p.runInfo}</p>
      </form>
      <div class="menu-sec" data-section="audio">
        <Button id="mute" keyLabel={KEYS.mute.label} onClick={p.onSound}>{p.muted ? '🔇 Muted' : '🔊 Sound'}</Button>
        <Button id="fullscreen" onClick={p.onFullscreen}>{p.fullscreen ? 'Leave full screen' : 'Full screen'}</Button>
      </div>
      <section class="menu-sec" data-section="log">
        <h3>Story log</h3>
        <ol id="log" class="log" aria-live="polite" ref={list}>
          {p.log.map((l, i) => <li key={i} class={l.tone}>{l.text}</li>)}
        </ol>
      </section>
      <section class="menu-sec" data-section="help">
        <h3>How to play</h3>
        <ul class="help">
          {p.help.map((line, i) => <li key={i}>{segs(line)}</li>)}
        </ul>
      </section>
      <div class="menu-sec" data-section="quit">
        <Button id="quit" title="End this run and leave the game" onClick={p.onQuit}>⏻ Quit</Button>
      </div>
    </Dialog>
  );
}

export function renderMenu(root: Element, props: MenuProps): void {
  render(<Menu {...props} />, root);
}
