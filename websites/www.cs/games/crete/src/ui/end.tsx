// The Island of Crete: the ending card of a level. src/ui.ts decides the words; this draws them and reports
// the buttons: after a win Next level (unless it was the last), Retry and Levels; after a loss Undo and Restart. A win that took story pages names them.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';

export interface EndView {
  open: boolean;
  won: boolean;
  /** A won level that has a level after it. */
  hasNext: boolean;
  kicker: string;
  title: string;
  text: string;
  /** Titles of the story pages taken in this win. */
  pages: string[];
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
      {p.won && p.pages.length > 0 && (
        <p id="end-pages" class="runstats">
          {p.pages.length === 1 ? `You found a page: ${p.pages[0]}. It is in the Lore book.` : `You found pages: ${p.pages.join(', ')}. They are in the Lore book.`}
        </p>
      )}
      <p id="end-score" class="runstats">{p.score}</p>
      <div class="title-actions">
        {p.won && p.hasNext && <Button id="end-next" keyLabel={KEYS.begin.label} onClick={p.onNext}>Next level</Button>}
        {p.won && <Button id="end-retry" keyLabel={KEYS.restart.label} onClick={p.onRetry}>Retry</Button>}
        {p.won && <Button id="end-trials" keyLabel={KEYS.new.label} onClick={p.onTrials}>Levels</Button>}
        {!p.won && <Button id="end-undo" keyLabel={KEYS.undo.label} onClick={p.onUndo}>Undo</Button>}
        {!p.won && <Button id="end-restart" keyLabel={KEYS.restart.label} onClick={p.onRestart}>Restart</Button>}
      </div>
    </Dialog>
  );
}

export function renderEndCard(root: Element, props: EndCardProps): void {
  render(<EndCard {...props} />, root);
}
