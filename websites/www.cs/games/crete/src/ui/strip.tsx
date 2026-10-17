// The Island of Crete: the control strip. The move pad, Wait, Undo and Restart, Ariadne's thread (Hint, Route,
// Auto) and the three tools with their counts, each with a key tab printed from the key table (the tools'
// from their own definition). src/ui.ts builds the rows; this draws them and reports presses.
import { render } from 'preact';
import { Button } from '../../../_kit/ui/button.tsx';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';
import { KEYS } from '../keys.ts';
import type { Action, MoveAction } from '../keys.ts';
import type { Tool } from '../puzzle/tiles.ts';

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
  onMove: (dir: MoveAction) => void;
  onWait: () => void;
  onUndo: () => void;
  onRestart: () => void;
  onHint: () => void;
  onRoute: () => void;
  onAuto: () => void;
  onTool: (kind: Tool) => void;
}

const PAD: { dir: MoveAction; glyph: string; name: string }[] = [
  { dir: 'up', glyph: '▲', name: 'Move up' },
  { dir: 'left', glyph: '◀', name: 'Move left' },
  { dir: 'down', glyph: '▼', name: 'Move down' },
  { dir: 'right', glyph: '▶', name: 'Move right' },
];

function Tab({ action }: { action: Action }) {
  return <KeyChip variant="tab" label={KEYS[action].label} at={action} decorative />;
}

export function Strip(p: StripProps) {
  return (
    <>
      <div class="pad" role="group" aria-label="Movement">
        {PAD.map(m => (
          <Button key={m.dir} class={`mv mv-${m.dir}`} label={m.name} disabled={p.over} onClick={() => p.onMove(m.dir)}>
            {m.glyph}<Tab action={m.dir} />
          </Button>
        ))}
      </div>
      <div class="actions" role="group" aria-label="Actions">
        <div class="turn">
          <Button id="btn-wait" title="Let the Minotaur move without you" disabled={p.over} onClick={p.onWait}>Wait<Tab action="wait" /></Button>
          <Button id="btn-undo" title="Take back your last turn" onClick={p.onUndo}>Undo<Tab action="undo" /></Button>
          <Button id="btn-restart" title="Begin the trial again" onClick={p.onRestart}>Restart<Tab action="restart" /></Button>
        </div>
        <div class="thread" role="group" aria-label="Ariadne's thread">
          <Button id="btn-hint" title="Take one step along the thread" onClick={p.onHint}>Hint<Tab action="hint" /></Button>
          <Button id="btn-route" title="Draw the whole thread" pressed={p.route} onClick={p.onRoute}>Route<Tab action="route" /></Button>
          <Button id="btn-auto" title="Follow the thread for you" pressed={p.playing} onClick={p.onAuto}>Auto<Tab action="auto" /></Button>
        </div>
        <div class="tools" role="group" aria-label="Tools">
          {p.tools.map(t => (
            <Button key={t.kind} id={`tool-${t.kind}`} class="tool" label={`${t.name} × ${t.count}. ${t.desc}`} title={t.desc}
              disabled={t.disabled} onClick={() => p.onTool(t.kind)}>
              <span aria-hidden="true">{t.emoji}</span><span class="n" aria-hidden="true">{t.count}</span>
              <KeyChip variant="tab" label={t.key} at={`item:${t.kind}`} decorative />
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}

export function renderStrip(root: Element, props: StripProps): void {
  render(<Strip {...props} />, root);
}
