// The Island of Crete: the ending card. src/ui.ts decides the words; this
// draws them and reports Play again.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';

export interface EndView {
  open: boolean;
  kicker: string;
  title: string;
  text: string;
  /** The score line under the text. */
  score: string;
}

export interface EndCardProps extends EndView {
  onAgain: () => void;
}

export function EndCard(p: EndCardProps) {
  return (
    <Dialog open={p.open} id="end-veil" veilClass="veil" panelClass="card"
      kicker={p.kicker} kickerId="end-kicker" kickerClass="kicker" titleId="end-title" title={p.title} focusId="again">
      <p id="end-text">{p.text}</p>
      <p id="end-score" class="runstats">{p.score}</p>
      <Button id="again" onClick={p.onAgain}>{`Play again (${KEYS.new.label})`}</Button>
    </Dialog>
  );
}

export function renderEndCard(root: Element, props: EndCardProps): void {
  render(<EndCard {...props} />, root);
}
