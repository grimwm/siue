// The Island of Crete: the control strip. The move pad (a connected cross round an inert centre), Wait, Undo and Restart, Ariadne's
// thread (Hint, Route, Auto), the three tools with their counts and the look swap, each with a key tab printed from the
// key table (the tools' from their own definition). On a phone the thread is one Thread button whose panel holds the
// three. src/ui.ts builds the rows and decides which strip a screen gets; this draws them and reports presses.
import { render } from 'preact';
import { useRef } from 'preact/hooks';
import { Button } from '../../../_kit/ui/button.tsx';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';
import { KEYS } from '../keys.ts';
import type { Action, MoveAction } from '../keys.ts';
import type { Tool } from '../puzzle/tiles.ts';
import type { Look } from '../settings.ts';

export interface ToolRow {
  kind: Tool;
  emoji: string;
  name: string;
  /** The key the tool's definition prints. */
  key: string;
  count: number;
  desc: string;
  disabled: boolean;
}

export interface StripProps {
  tools: ToolRow[];
  /** The play-out is running. */
  playing: boolean;
  /** The whole thread is drawn. */
  route: boolean;
  /** The try is over: moves and tools wait for an Undo or a Restart. */
  over: boolean;
  /** The look the board is drawn in; the swap button names the other one. */
  look: Look;
  /** A phone's strip: Hint, Route and Auto sit in the Thread button's panel. */
  compact: boolean;
  /** The Thread panel is open (only on a compact strip). */
  threadOpen: boolean;
  /** Thread asks for its panel open or shut; a choice in it asks for it shut. */
  onThread: (open: boolean) => void;
  onMove: (dir: MoveAction) => void;
  onWait: () => void;
  onUndo: () => void;
  onRestart: () => void;
  onHint: () => void;
  onRoute: () => void;
  onAuto: () => void;
  onTool: (kind: Tool) => void;
  /** The swap button asks for this look. */
  onLook: (look: Look) => void;
}

// In reading order, so the focus goes up, left, right, down; the CSS places them round the centre.
const PAD: { dir: MoveAction; glyph: string; name: string }[] = [
  { dir: 'up', glyph: '▲', name: 'Move up' },
  { dir: 'left', glyph: '◀', name: 'Move left' },
  { dir: 'right', glyph: '▶', name: 'Move right' },
  { dir: 'down', glyph: '▼', name: 'Move down' },
];

function Tab({ action }: { action: Action }) {
  return <KeyChip variant="tab" label={KEYS[action].label} at={action} decorative />;
}

export function Strip(p: StripProps) {
  const threadBtn = useRef<HTMLButtonElement>(null);
  // A choice in the panel shuts it and hands the focus back to Thread.
  const choose = (fn: () => void) => p.compact ? () => {
    fn();
    p.onThread(false);
    threadBtn.current?.focus();
  } : fn;
  const helps = [
    <Button key="hint" id="btn-hint" title="Take one step along the thread" onClick={choose(p.onHint)}>Hint<Tab action="hint" /></Button>,
    <Button key="route" id="btn-route" title="Draw the whole thread" pressed={p.route} onClick={choose(p.onRoute)}>Route<Tab action="route" /></Button>,
    <Button key="auto" id="btn-auto" title="Follow the thread for you" pressed={p.playing} onClick={choose(p.onAuto)}>Auto<Tab action="auto" /></Button>,
  ];
  const threadOn = p.playing || p.route;
  return (
    <>
      <div class="pad" role="group" aria-label="Movement">
        {PAD.map(m => [
          m.dir === 'right' ? <span key="hub" class="pad-hub" aria-hidden="true" /> : null,
          <Button key={m.dir} class={`mv mv-${m.dir}`} label={m.name} disabled={p.over} onClick={() => p.onMove(m.dir)}>
            {m.glyph}<Tab action={m.dir} />
          </Button>,
        ])}
      </div>
      <div class="actions" role="group" aria-label="Actions">
        <div class="turn">
          <Button id="btn-wait" title="Let the Minotaur move without you" disabled={p.over} onClick={p.onWait}>Wait<Tab action="wait" /></Button>
          <Button id="btn-undo" title="Take back your last turn" onClick={p.onUndo}>Undo<Tab action="undo" /></Button>
          <Button id="btn-restart" title="Begin the level again" onClick={p.onRestart}>Restart<Tab action="restart" /></Button>
        </div>
        {p.compact ? (
          <div class="thread thread-fold">
            <button type="button" id="btn-thread" ref={threadBtn} class={threadOn ? 'thread-btn on' : 'thread-btn'}
              aria-expanded={p.threadOpen} aria-controls="thread-panel"
              aria-label={`Thread${p.playing ? ', playing out' : p.route ? ', route drawn' : ''}`}
              title="Ariadne's thread: Hint, Route, Auto" onClick={() => p.onThread(!p.threadOpen)}>
              Thread
            </button>
            <div id="thread-panel" class="thread-panel" role="group" aria-label="Ariadne's thread" hidden={!p.threadOpen}>
              {helps}
            </div>
          </div>
        ) : (
          <div class="thread" role="group" aria-label="Ariadne's thread">{helps}</div>
        )}
        <div class="tools" role="group" aria-label="Tools">
          {p.tools.map(t => (
            <Button key={t.kind} id={`tool-${t.kind}`} class="tool" label={`${t.name} × ${t.count}. ${t.desc}`} title={t.desc}
              disabled={t.disabled} onClick={() => p.onTool(t.kind)}>
              <span aria-hidden="true">{t.emoji}</span><span class="n" aria-hidden="true">{t.count}</span>
              <KeyChip variant="tab" label={t.key} at={`item:${t.kind}`} decorative />
            </Button>
          ))}
        </div>
        <div class="view" role="group" aria-label="Look">
          <Button id="btn-look" title={p.look === 'modern' ? 'Show the classic tiles' : 'Show the modern board'}
            onClick={() => p.onLook(p.look === 'modern' ? 'classic' : 'modern')}>
            {p.look === 'modern' ? 'Classic' : 'Modern'}<Tab action="look" />
          </Button>
        </div>
      </div>
    </>
  );
}

export function renderStrip(root: Element, props: StripProps): void {
  render(<Strip {...props} />, root);
}
