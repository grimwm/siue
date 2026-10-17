// The Island of Crete: the control strip. The move pad, Hint, Route, Auto, Bash and the three tools with their
// counts, each with a key tab printed from the key table (the tools' from their own definition). src/ui.ts
// builds the rows; this draws them and reports presses.
import { render } from 'preact';
import { Button } from '../../../_kit/ui/button.tsx';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';
import { KEYS } from '../keys.ts';
import type { Action, MoveAction } from '../keys.ts';
import type { ItemKind } from '../engine.ts';

export interface ToolRow {
  kind: ItemKind;
  emoji: string;
  name: string;
  /** The key the engine's definition prints. */
  key: string;
  count: number;
  desc: string;
  disabled: boolean;
}

export interface StripProps {
  tools: ToolRow[];
  /** The play-through is running. */
  auto: boolean;
  /** The whole route is drawn. */
  route: boolean;
  /** The run has ended: moves and Bash wait for a new one. */
  over: boolean;
  onMove: (dir: MoveAction) => void;
  onHint: () => void;
  onRoute: () => void;
  onAuto: () => void;
  onBash: () => void;
  onTool: (kind: ItemKind) => void;
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
        <Button id="btn-hint" title="Flash your next step" onClick={p.onHint}>Hint<Tab action="hint" /></Button>
        <Button id="btn-route" title="Show the whole route" pressed={p.route} onClick={p.onRoute}>Route<Tab action="route" /></Button>
        <Button id="btn-auto" title="Play for you" pressed={p.auto} onClick={p.onAuto}>Auto<Tab action="auto" /></Button>
        <Button id="btn-bash" title="Shove the adjacent Minotaur backwards" disabled={p.over} onClick={p.onBash}>Bash<Tab action="bash" /></Button>
        {p.tools.map(t => (
          <Button key={t.kind} id={`tool-${t.kind}`} class="tool" label={`${t.name} × ${t.count}. ${t.desc}`} title={t.desc}
            disabled={t.disabled} onClick={() => p.onTool(t.kind)}>
            <span aria-hidden="true">{t.emoji}</span><span class="n" aria-hidden="true">{t.count}</span>
            <KeyChip variant="tab" label={t.key} at={`item:${t.kind}`} decorative />
          </Button>
        ))}
      </div>
    </>
  );
}

export function renderStrip(root: Element, props: StripProps): void {
  render(<Strip {...props} />, root);
}
