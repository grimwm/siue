// The Island of Crete: a chapter's card. The opening card (under "Chapter 1 of 10": the chapter's words and
// quotation, Enter the Halls, Levels and Back) shows before its first level. The closing card (under "End of Chapter 1":
// its own words and quotation, the moves and best possible of the win that ended it, and On to Chapter 2, which
// goes on to that chapter's opening card, or Continue with a line saying the next chapter is not yet released)
// shows after its last. The last chapter's closing card also shows the campaign's ending, chosen by the story pages
// found across every chapter (every one, some or none), under "The End". src/ui.ts picks which and owns the keys (Enter is Begin, N is Levels, Q is back), so the
// dialog is given no onDismiss.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { CHAPTERS } from '../campaign/chapters.ts';
import type { Chapter } from '../campaign/chapters.ts';
import { endingFor } from '../campaign/lore.ts';
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
  /** The story pages found across the campaign, and how many there are: they pick the ending a closing card holds. */
  pagesFound?: number;
  pagesTotal?: number;
  onEnter: () => void;
  onLevels: () => void;
  onClose: () => void;
  /** Back on the opening card: it closes, as Q does, and shows what was under it (the title card after New Game). */
  onBack: () => void;
}

export function ChapterCard(p: ChapterCardProps) {
  const card = p.closing ? p.chapter.lore?.closing : p.chapter.lore?.opening;
  const quote = card?.quote;
  const onward = p.closing && p.next?.released ? `On to Chapter ${p.next.n}` : 'Continue';
  const ending = p.closing && card?.endings ? endingFor(card.endings, p.pagesFound ?? 0, p.pagesTotal ?? 0) : null;
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
      {ending && (
        <div id="chapter-ending" class="chapter-ending">
          <p class="kicker">{`The End · ${p.pagesFound ?? 0} of ${p.pagesTotal ?? 0} pages found`}</p>
          <h3 id="chapter-ending-title">{ending.title}</h3>
          <p class="story">{ending.text}</p>
        </div>
      )}
      {p.closing && p.score && <p id="chapter-score" class="runstats">{p.score}</p>}
      {p.closing && p.next && !p.next.released && <p id="chapter-next" class="runstats">{`Chapter ${p.next.n} is not yet released`}</p>}
      <div class="title-actions">
        {!p.closing && <Button id="chapter-enter" keyLabel={KEYS.begin.label} onClick={p.onEnter}>Enter the Halls</Button>}
        {!p.closing && <Button id="chapter-levels" keyLabel={KEYS.new.label} onClick={p.onLevels}>Levels</Button>}
        {!p.closing && <Button id="chapter-back" class="quiet" keyLabel={KEYS.menu.label} onClick={p.onBack}>Back</Button>}
        {p.closing && <Button id="chapter-continue" keyLabel={KEYS.begin.label} onClick={p.onClose}>{onward}</Button>}
      </div>
    </Dialog>
  );
}

export function renderChapterCard(root: Element, props: ChapterCardProps): void {
  render(<ChapterCard {...props} />, root);
}
