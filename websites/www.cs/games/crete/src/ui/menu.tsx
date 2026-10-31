// The Island of Crete: the menu, in three sections under small headings. Sound and screen: switches for sound, music,
// music in the background and full screen. Board: the two looks as pictures and, for the modern look, the view
// (Angled or Top-down) and, while angled, the walls; then which edge of the strip the arrows stand at.
// The story: the Lore book, the story log and how to play (folded). Then Back to the editor or Shared level (the
// shared level's card; each only when the page gives it), and Quit on its own. On a wide screen the sections stand
// in two columns.
// Q (the kit's back key) is handled by src/ui.ts, which owns every card, so the dialog is given no onDismiss;
// the Close button is for a pointer or a finger.
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';
import type { Seg } from '../help.ts';
import type { Tone as LogTone } from '../game.ts';
import type { Look, PadSide, View, WallMode } from '../settings.ts';
import { LookTiles } from './look-tiles.tsx';

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
  /** Shown only while the look is modern and the view angled. */
  walls: WallMode;
  /** Shown only while the look is modern. */
  view: View;
  /** The edge of the strip the arrows stand at. */
  pad: PadSide;
  /** Whether the mini map shows: a switch shown only while the look is modern. */
  minimap: boolean;
  log: LogLine[];
  help: Seg[][];
  onSound: () => void;
  onMusic: () => void;
  onBackground: () => void;
  onFullscreen: () => void;
  onLook: (look: Look) => void;
  onWalls: (walls: WallMode) => void;
  onView: (view: View) => void;
  onPad: (side: PadSide) => void;
  onMinimap: () => void;
  onLore: () => void;
  onQuit: () => void;
  onClose: () => void;
  /** The kicker: the level's place ("Chapter 1 · Level 3") or kind ("Shared level"); the game's name when not given. */
  place?: string;
  /** The open level's name, under the title, when given. */
  levelName?: string;
  /** Back to the editor, shown only when given. */
  onBackToEditor?: () => void;
  /** The shared level's card, shown only when given. */
  onSharedCard?: () => void;
}

const WALL_CHOICES: [WallMode, string][] = [['solid', 'Solid'], ['ghosted', 'Ghosted'], ['low', 'Low']];
const VIEW_CHOICES: [View, string][] = [['angled', 'Angled'], ['top', 'Top-down']];
const PAD_CHOICES: [PadSide, string][] = [['left', 'Left'], ['right', 'Right']];

const segs = (line: Seg[]) => line.map(s => (typeof s === 'string' ? s : <strong>{s.strong}</strong>));

export function Menu(p: MenuProps) {
  const list = useRef<HTMLOListElement>(null);
  // Newest line in view whenever the menu opens or a line arrives.
  useLayoutEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  }, [p.open, p.log.length]);
  return (
    <Dialog open={p.open} id="menu-veil" veilClass="veil" panelClass="card menu" kicker={p.place ?? 'The Island of Crete'} kickerClass="kicker"
      titleId="menu-title" title="Menu"
      close={<Button id="menu-close" class="close" label="Close menu" keyLabel={KEYS.menu.label} onClick={p.onClose}>✕</Button>}>
      {p.levelName && <p id="menu-level" class="menu-level">{p.levelName}</p>}
      <div class="menu-cols">
        <div class="menu-col">
          <section class="menu-sec" data-section="audio" aria-labelledby="menu-audio-h">
            <h3 id="menu-audio-h">Sound and screen</h3>
            <div class="menu-list">
              <Button id="mute" class="menu-row" checked={!p.muted} keyLabel={KEYS.mute.label} onClick={p.onSound}>
                <span class="menu-row-name">Sound</span><span class="switch" aria-hidden="true" />
              </Button>
              <Button id="music" class="menu-row" checked={p.music} onClick={p.onMusic}>
                <span class="menu-row-name">Music</span><span class="switch" aria-hidden="true" />
              </Button>
              <Button id="music-hidden" class="menu-row" checked={p.background} onClick={p.onBackground}>
                <span class="menu-row-name">Music in the background<small>Keeps playing in another tab</small></span>
                <span class="switch" aria-hidden="true" />
              </Button>
              <Button id="fullscreen" class="menu-row" checked={p.fullscreen} keyLabel={KEYS.fullscreen.label} onClick={p.onFullscreen}>
                <span class="menu-row-name">Full screen</span><span class="switch" aria-hidden="true" />
              </Button>
            </div>
          </section>
          <section class="menu-sec" data-section="look" aria-labelledby="menu-board-h">
            <h3 id="menu-board-h">Board</h3>
            <LookTiles look={p.look} idPrefix="look" label="Look" onPick={p.onLook} />
            {p.look === 'modern' && (
              <div class="menu-walls" data-section="view">
                <span class="menu-label" id="menu-view-label">View</span>
                <div class="seg seg-2" role="group" aria-labelledby="menu-view-label">
                  {VIEW_CHOICES.map(([v, name]) => (
                    <Button key={v} id={`view-${v}`} class="seg-opt" pressed={p.view === v} onClick={() => p.onView(v)}>{name}</Button>
                  ))}
                </div>
              </div>
            )}
            {p.look === 'modern' && p.view === 'angled' && (
              <div class="menu-walls" data-section="walls">
                <span class="menu-label" id="menu-walls-label">Walls</span>
                <div class="seg" role="group" aria-labelledby="menu-walls-label">
                  {WALL_CHOICES.map(([mode, name]) => (
                    <Button key={mode} id={`walls-${mode}`} class="seg-opt" pressed={p.walls === mode} onClick={() => p.onWalls(mode)}>{name}</Button>
                  ))}
                </div>
              </div>
            )}
            {p.look === 'modern' && (
              <Button id="minimap-switch" class="menu-row" checked={p.minimap} onClick={p.onMinimap}>
                <span class="menu-row-name">Mini map<small>The whole level in a corner of the board</small></span>
                <span class="switch" aria-hidden="true" />
              </Button>
            )}
            <div class="menu-walls" data-section="pad">
              <span class="menu-label" id="menu-pad-label">Arrows</span>
              <div class="seg seg-2" role="group" aria-labelledby="menu-pad-label">
                {PAD_CHOICES.map(([side, name]) => (
                  <Button key={side} id={`pad-${side}`} class="seg-opt" pressed={p.pad === side} onClick={() => p.onPad(side)}>{name}</Button>
                ))}
              </div>
            </div>
          </section>
        </div>
        <div class="menu-col">
          <section class="menu-sec" aria-labelledby="menu-story-h">
            <h3 id="menu-story-h">The story</h3>
            <div class="menu-list">
              <div data-section="lore">
                <Button id="menu-lore" class="menu-row" keyLabel={KEYS.lore.label} onClick={p.onLore}>
                  <span class="menu-row-name">📖 Lore book</span><span class="menu-row-go" aria-hidden="true">›</span>
                </Button>
              </div>
              <div class="menu-fold" data-section="log">
                <h4>Story log</h4>
                <ol id="log" class="log" aria-live="polite" ref={list}>
                  {p.log.map((l, i) => <li key={i} class={l.tone}>{l.text}</li>)}
                </ol>
                {p.log.length === 0 && <p class="menu-empty">Nothing yet: what happens in the Labyrinth is told here.</p>}
              </div>
              <details class="menu-fold" data-section="help">
                <summary>How to play</summary>
                <ul class="help">
                  {p.help.map((line, i) => <li key={i}>{segs(line)}</li>)}
                </ul>
              </details>
            </div>
          </section>
          {(p.onBackToEditor || p.onSharedCard) && (
            <div class="menu-sec menu-more">
              {p.onBackToEditor && <div data-section="editor"><Button id="menu-editor" class="quiet" onClick={p.onBackToEditor}>Back to the editor</Button></div>}
              {p.onSharedCard && <div data-section="shared"><Button id="menu-shared" class="quiet" onClick={p.onSharedCard}>Shared level</Button></div>}
            </div>
          )}
          <div class="menu-sec menu-quit" data-section="quit">
            <Button id="quit" class="danger" title="End this run and leave the game" onClick={p.onQuit}>⏻ Quit this run</Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export function renderMenu(root: Element, props: MenuProps): void {
  render(<Menu {...props} />, root);
}
