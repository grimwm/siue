// The Island of Crete: a level's start card. A small card over the top of the board with the chapter and level
// number (or, for a level from outside the campaign, what kind it is), title and intro, and any author's best to
// beat; the status bar and the strip stay usable under it. Begin, a move key or Q closes it (src/ui.ts owns every
// card, so the dialog is given no onDismiss).
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';
import { placeWords } from '../campaign/chapters.ts';

export interface StartProps {
  open: boolean;
  /** The chapter's number. */
  chapter: number;
  /** The level's place in its chapter, 1-based. */
  number: number;
  /** The kicker in place of the chapter and level number: a level from outside the campaign has neither. */
  kicker?: string;
  title: string;
  intro: string;
  /** A line under the intro, when given: the author's best to beat. */
  best?: string;
  onBegin: () => void;
}

export function Start(p: StartProps) {
  return (
    <Dialog open={p.open} id="start-veil" veilClass="veil veil-start" panelClass="card start" kicker={p.kicker ?? placeWords(p.chapter, p.number, '').kicker}
      kickerClass="kicker" titleId="start-title" title={p.title} focusId="start-begin">
      <p id="start-intro">{p.intro}</p>
      {p.best !== undefined && <p id="start-best" class="runstats">{p.best}</p>}
      <Button id="start-begin" keyLabel={KEYS.begin.label} onClick={p.onBegin}>Begin</Button>
    </Dialog>
  );
}

export function renderStart(root: Element, props: StartProps): void {
  render(<Start {...props} />, root);
}
