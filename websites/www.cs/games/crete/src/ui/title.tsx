// The Island of Crete: the title card, shown after Quit when the game cannot
// close its own window. Play starts a new run on the seed box.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { EXIT_HINT } from '../../../_kit/app.ts';

export interface TitleCardProps {
  open: boolean;
  /** An installed app that could not close itself: say how to. */
  hint: boolean;
  onPlay: () => void;
}

export function TitleCard(p: TitleCardProps) {
  return (
    <Dialog open={p.open} id="title-veil" veilClass="veil" panelClass="card" kicker="Minotaur chase" kickerClass="kicker"
      titleId="title-name" title="The Island of Crete" focusId="title-play">
      <p>A text-based chase. Theseus (you) moves once. The Minotaur moves twice. Reach the exit alive.</p>
      {p.hint && <p id="title-hint" class="runstats" role="status">{EXIT_HINT}.</p>}
      <Button id="title-play" onClick={p.onPlay}>▶ Play (N)</Button>
    </Dialog>
  );
}

export function renderTitleCard(root: Element, props: TitleCardProps): void {
  render(<TitleCard {...props} />, root);
}
