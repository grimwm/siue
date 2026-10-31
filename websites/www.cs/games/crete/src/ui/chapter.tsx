// The Island of Crete: a chapter's card. The opening card (under "Chapter 1 of 10": the chapter's words and
// quotation, Enter the halls and Levels) shows before its first level. The closing card (under "End of Chapter 1":
// its own words and quotation, the moves and best possible of the win that ended it, and On to Chapter 2, which
// goes on to that chapter's opening card, or Continue with a line saying the next chapter is not yet released)
// shows after its last. src/ui.ts picks which and owns the keys (Enter is Begin, N is Levels, Q is back), so the
// dialog is given no onDismiss.
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
  /** On a closing card opened by a win, that win's ending and score; empty otherwise. */
  score?: string;
  /** The chapter after this one; the closing card says when it is not released. */
  next: Chapter | null;
  onEnter: () => void;
  onLevels: () => void;
  onClose: () => void;
}

export function ChapterCard(p: ChapterCardProps) {
  const card = p.closing ? p.chapter.lore?.closing : p.chapter.lore?.opening;
  const quote = card?.quote;
  const onward = p.closing && p.next?.released ? `On to Chapter ${p.next.n}` : 'Continue';
  const kicker = p.closing ? `End of Chapter ${p.chapter.n}` : `Chapter ${p.chapter.n} of ${CHAPTERS.length}`;
  return (
    <Dialog open={p.open} id="chapter-veil" veilClass="veil" panelClass="card chapter" kicker={kicker}
      kickerId="chapter-kicker" kickerClass="kicker" titleId="chapter-title" title={p.chapter.name}
      focusId={p.closing ? 'chapter-continue' : 'chapter-enter'}>
      <p id="chapter-text" class="story">{card?.text ?? ''}</p>
      {quote && (
        <blockquote class="chapter-quote">
          {quote.text}
          <cite>{quote.cite}</cite>
        </blockquote>
      )}
      {p.closing && p.score && <p id="chapter-score" class="runstats">{p.score}</p>}
      {p.closing && p.next && !p.next.released && <p id="chapter-next" class="runstats">{`Chapter ${p.next.n} is not yet released`}</p>}
      <div class="title-actions">
        {!p.closing && <Button id="chapter-enter" keyLabel={KEYS.begin.label} onClick={p.onEnter}>Enter the halls</Button>}
        {!p.closing && <Button id="chapter-levels" keyLabel={KEYS.new.label} onClick={p.onLevels}>Levels</Button>}
        {p.closing && <Button id="chapter-continue" keyLabel={KEYS.begin.label} onClick={p.onClose}>{onward}</Button>}
      </div>
    </Dialog>
  );
}

export function renderChapterCard(root: Element, props: ChapterCardProps): void {
  render(<ChapterCard {...props} />, root);
}
