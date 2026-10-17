// The Island of Crete: the ending card of a trial. src/ui.ts decides the words; this draws them and reports
// the buttons: after a win Next trial (unless it was the last), Retry and Trials; after a loss Undo and Restart.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';
import { KEYS } from '../keys.ts';

export interface EndView {
  open: boolean;
  won: boolean;
  /** A won trial that has a trial after it. */
  hasNext: boolean;
  kicker: string;
  title: string;
  text: string;
  /** The moves and best line under the text. */
  score: string;
}

export interface EndCardProps extends EndView {
  onNext: () => void;
  onRetry: () => void;
  onTrials: () => void;
  onUndo: () => void;
  onRestart: () => void;
}

export function EndCard(p: EndCardProps) {
  const focusId = p.won ? (p.hasNext ? 'end-next' : 'end-retry') : 'end-undo';
  return (
    <Dialog open={p.open} id="end-veil" veilClass="veil" panelClass="card" kicker={p.kicker} kickerId="end-kicker"
      kickerClass="kicker" titleId="end-title" title={p.title} focusId={focusId}>
      <p id="end-text">{p.text}</p>
      <p id="end-score" class="runstats">{p.score}</p>
      <div class="title-actions">
        {p.won && p.hasNext && <Button id="end-next" onClick={p.onNext}>Next trial</Button>}
        {p.won && <Button id="end-retry" onClick={p.onRetry}>Retry</Button>}
        {p.won && <Button id="end-trials" onClick={p.onTrials}>Trials<KeyChip label={KEYS.new.label} decorative /></Button>}
        {!p.won && <Button id="end-undo" keyLabel={KEYS.undo.label} onClick={p.onUndo}>Undo</Button>}
        {!p.won && <Button id="end-restart" keyLabel={KEYS.restart.label} onClick={p.onRestart}>Restart</Button>}
      </div>
    </Dialog>
  );
}

export function renderEndCard(root: Element, props: EndCardProps): void {
  render(<EndCard {...props} />, root);
}
