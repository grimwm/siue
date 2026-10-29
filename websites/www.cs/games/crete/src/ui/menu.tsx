// The Island of Crete: the menu. In order: sound, music, music in the background and full screen, the look (and, for the modern look, the walls), the Lore book, the story log, how to play, Back to
// the editor or Shared level (the shared level's card; each only when the page gives it), Quit.
// Q (the kit's back key) is handled by src/ui.ts, which owns every card, so the dialog is given no onDismiss;
// the Close button is for a pointer or a finger.
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';
import type { Seg } from '../help.ts';
import type { Tone as LogTone } from '../game.ts';
import type { Look, WallMode } from '../settings.ts';

export interface LogLine {
  text: string;
  tone?: LogTone;
}

export interface MenuProps {
  open: boolean;
  muted: boolean;
  /** Whether the Music switch is on (Sound off silences the music whatever it says). */
  music: boolean;
  /** Whether the music goes on while the page is hidden. */
  background: boolean;
  fullscreen: boolean;
  look: Look;
  /** Shown only while the look is modern. */
  walls: WallMode;
  log: LogLine[];
  help: Seg[][];
  onSound: () => void;
  onMusic: () => void;
  onBackground: () => void;
  onFullscreen: () => void;
  onLook: (look: Look) => void;
  onWalls: (walls: WallMode) => void;
  onLore: () => void;
  onQuit: () => void;
  onClose: () => void;
  /** Back to the editor, shown only when given. */
  onBackToEditor?: () => void;
  /** The shared level's card, shown only when given. */
  onSharedCard?: () => void;
}

const WALL_CHOICES: [WallMode, string][] = [['solid', 'Solid'], ['ghosted', 'Ghosted'], ['low', 'Low']];

const segs = (line: Seg[]) => line.map(s => (typeof s === 'string' ? s : <strong>{s.strong}</strong>));

export function Menu(p: MenuProps) {
  const list = useRef<HTMLOListElement>(null);
  // Newest line in view whenever the menu opens or a line arrives.
  useLayoutEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [p.open, p.log.length]);
  return (
    <Dialog open={p.open} id="menu-veil" veilClass="veil" panelClass="card menu" kicker="The Island of Crete" kickerClass="kicker"
      titleId="menu-title" title="Menu"
      close={<Button id="menu-close" class="close" label="Close menu" keyLabel={KEYS.menu.label} onClick={p.onClose}>✕</Button>}>
      <div class="menu-sec" data-section="audio">
        <Button id="mute" keyLabel={KEYS.mute.label} onClick={p.onSound}>{p.muted ? '🔇 Muted' : '🔊 Sound'}</Button>
        <Button id="music" onClick={p.onMusic}>{p.music ? '🎶 Music' : '🎶 Music off'}</Button>
        <Button id="music-hidden" onClick={p.onBackground}>{p.background ? '🎶 Music in the background: On' : '🎶 Music in the background: Off'}</Button>
        <Button id="fullscreen" keyLabel={KEYS.fullscreen.label} onClick={p.onFullscreen}>{p.fullscreen ? 'Leave full screen' : 'Full screen'}</Button>
      </div>
      <div class="menu-sec" data-section="look">
        <span class="menu-label">Look:</span>
        <Button id="look-modern" pressed={p.look === 'modern'} onClick={() => p.onLook('modern')}>Modern</Button>
        <Button id="look-classic" pressed={p.look === 'classic'} onClick={() => p.onLook('classic')}>Classic</Button>
      </div>
      {p.look === 'modern' && (
        <div class="menu-sec" data-section="walls">
          <span class="menu-label">Walls:</span>
          {WALL_CHOICES.map(([mode, name]) => (
            <Button key={mode} id={`walls-${mode}`} pressed={p.walls === mode} onClick={() => p.onWalls(mode)}>{name}</Button>
          ))}
        </div>
      )}
      <div class="menu-sec" data-section="lore">
        <Button id="menu-lore" keyLabel={KEYS.lore.label} onClick={p.onLore}>📖 Lore book</Button>
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
      {p.onBackToEditor && (
        <div class="menu-sec" data-section="editor">
          <Button id="menu-editor" onClick={p.onBackToEditor}>Back to the editor</Button>
        </div>
      )}
      {p.onSharedCard && (
        <div class="menu-sec" data-section="shared">
          <Button id="menu-shared" onClick={p.onSharedCard}>Shared level</Button>
        </div>
      )}
      <div class="menu-sec" data-section="quit">
        <Button id="quit" title="End this run and leave the game" onClick={p.onQuit}>⏻ Quit</Button>
      </div>
    </Dialog>
  );
}

export function renderMenu(root: Element, props: MenuProps): void {
  render(<Menu {...props} />, root);
}
