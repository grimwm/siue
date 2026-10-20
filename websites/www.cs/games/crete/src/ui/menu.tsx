// The Island of Crete: the menu. In order: sound and full screen, the Lore book, the story log, how to play, Quit.
// Q (the kit's back key) is handled by src/ui.ts, which owns every card, so the dialog is given no onDismiss;
// the Close button is for a pointer or a finger.
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';
import type { Seg } from '../help.ts';
import type { Tone as LogTone } from '../game.ts';

export interface LogLine {
  text: string;
  tone?: LogTone;
}

export interface MenuProps {
  open: boolean;
  muted: boolean;
  fullscreen: boolean;
  log: LogLine[];
  help: Seg[][];
  onSound: () => void;
  onFullscreen: () => void;
  onLore: () => void;
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
      <div class="menu-sec" data-section="audio">
        <Button id="mute" keyLabel={KEYS.mute.label} onClick={p.onSound}>{p.muted ? '🔇 Muted' : '🔊 Sound'}</Button>
        <Button id="fullscreen" onClick={p.onFullscreen}>{p.fullscreen ? 'Leave full screen' : 'Full screen'}</Button>
      </div>
      <div class="menu-sec" data-section="lore">
        <Button id="menu-lore" onClick={p.onLore}>📖 Lore book</Button>
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
