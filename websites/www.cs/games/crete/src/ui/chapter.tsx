// The Island of Crete: a chapter's card. The opening card (the chapter's words and quotation, Enter the halls
// and Levels) shows before its first level; the closing card (its own words and quotation, what comes next,
// Continue, which goes on to the next chapter's opening card once that chapter is released) shows after its
// last. src/ui.ts picks which and owns the keys (Enter is Begin, N is Levels, Q is back), so the dialog is given
// no onDismiss.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { CHAPTERS } from '../campaign/chapters.ts';
import type { Chapter } from '../campaign/chapters.ts';
import { KEYS } from '../keys.ts';

export interface ChapterCardProps {
  open: boolean;
  chapter: Chapter;
  /** The closing card, not the opening one. */
  closing: boolean;
  /** The chapter after this one; the closing card says when it is not released. */
  next: Chapter | null;
  onEnter: () => void;
  onLevels: () => void;
  onClose: () => void;
}

export function ChapterCard(p: ChapterCardProps) {
  const card = p.closing ? p.chapter.lore?.closing : p.chapter.lore?.opening;
  const quote = card?.quote;
  return (
    <Dialog open={p.open} id="chapter-veil" veilClass="veil" panelClass="card chapter" kicker={`Chapter ${p.chapter.n} of ${CHAPTERS.length}`}
      kickerId="chapter-kicker" kickerClass="kicker" titleId="chapter-title" title={p.chapter.name}
      focusId={p.closing ? 'chapter-continue' : 'chapter-enter'}>
      <p id="chapter-text" class="story">{card?.text ?? ''}</p>
      {quote && (
        <blockquote class="chapter-quote">
          {quote.text}
          <cite>{quote.cite}</cite>
        </blockquote>
      )}
      {p.closing && p.next && !p.next.released && <p id="chapter-next" class="runstats">{`Chapter ${p.next.n} is not yet released`}</p>}
      <div class="title-actions">
        {!p.closing && <Button id="chapter-enter" keyLabel={KEYS.begin.label} onClick={p.onEnter}>Enter the halls</Button>}
        {!p.closing && <Button id="chapter-levels" keyLabel={KEYS.new.label} onClick={p.onLevels}>Levels</Button>}
        {p.closing && <Button id="chapter-continue" keyLabel={KEYS.begin.label} onClick={p.onClose}>Continue</Button>}
      </div>
    </Dialog>
  );
}

export function renderChapterCard(root: Element, props: ChapterCardProps): void {
  render(<ChapterCard {...props} />, root);
}
