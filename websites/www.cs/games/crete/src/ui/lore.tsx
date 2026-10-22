// The Island of Crete: the Lore book. One dialog with two views: the list (each released chapter's opening card,
// its story pages found or hidden, its closing card once seen; the unreleased chapters in one line each), and one
// entry in full with a Back button. src/ui.ts owns which entry shows and Q (an open entry goes back to the list,
// then the book closes), so the dialog is given no onDismiss; Close is for a pointer.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { chapterOf, pageHome } from '../campaign/chapters.ts';
import type { Chapter } from '../campaign/chapters.ts';
import type { Quote } from '../campaign/lore.ts';
import { KEYS } from '../keys.ts';

export type LoreEntry = { kind: 'card'; which: 'opening' | 'closing'; chapter: number } | { kind: 'page'; id: string };

export interface LoreProps {
  open: boolean;
  chapters: readonly Chapter[];
  found: (id: string) => boolean;
  /** Whether chapter `n`'s closing card has been seen. */
  closingSeen: (n: number) => boolean;
  /** The entry shown in full, or null for the list. */
  shown: LoreEntry | null;
  onShow: (e: LoreEntry | null) => void;
  onClose: () => void;
}

/** "level 9", or "levels 9 and 10": where a page is, by place in its chapter. */
function whereText(pageId: string): string {
  const at = pageHome(pageId).map(i => chapterOf(i).within + 1);
  return at.length === 1 ? `level ${at[0]}` : `levels ${at.join(' and ')}`;
}

interface Full { title: string; text: string; quote?: Quote }

function fullOf(chapters: readonly Chapter[], e: LoreEntry): Full | null {
  if (e.kind === 'page') {
    const page = chapters.flatMap(c => c.lore?.pages ?? []).find(x => x.id === e.id);
    return page ?? null;
  }
  const c = chapters[e.chapter - 1];
  const card = e.which === 'opening' ? c?.lore?.opening : c?.lore?.closing;
  return c && card ? { title: c.name, ...card } : null;
}

export function Lore(p: LoreProps) {
  const full = p.shown ? fullOf(p.chapters, p.shown) : null;
  return (
    <Dialog open={p.open} id="lore-veil" veilClass="veil" panelClass="card lore" kicker="The Island of Crete" kickerClass="kicker"
      titleId="lore-title" title="Lore book" focusId="lore-close">
      <Button id="lore-close" class="close" label="Close the Lore book" keyLabel={KEYS.menu.label} onClick={p.onClose}>✕</Button>
      {full ? (
        <div class="lore-entry">
          <h3 id="lore-entry-title">{full.title}</h3>
          <p id="lore-entry-text" class="story">{full.text}</p>
          {full.quote && (
            <blockquote class="chapter-quote">
              {full.quote.text}
              <cite>{full.quote.cite}</cite>
            </blockquote>
          )}
          <Button id="lore-back" keyLabel={KEYS.menu.label} onClick={() => p.onShow(null)}>Back</Button>
        </div>
      ) : (
        <div class="lore-list">
          {p.chapters.map(c => c.released && c.lore ? (
            <section key={c.n} class="lore-chapter">
              <h3>{`Chapter ${c.n} · ${c.name}`}</h3>
              <ul class="lore-entries">
                <li><Button id={`lore-opening-${c.n}`} class="lore-pick" onClick={() => p.onShow({ kind: 'card', which: 'opening', chapter: c.n })}>Opening</Button></li>
                {c.lore.pages.map(pg => p.found(pg.id) ? (
                  <li key={pg.id}>
                    <Button id={`lore-page-${pg.id}`} class="lore-pick" onClick={() => p.onShow({ kind: 'page', id: pg.id })}>
                      <span class="lore-name">{pg.title}</span>
                      <span class="lore-where">{`found in ${whereText(pg.id)}`}</span>
                    </Button>
                  </li>
                ) : (
                  <li key={pg.id}>
                    <Button id={`lore-page-${pg.id}`} class="lore-pick" disabled onClick={() => {}}>
                      <span class="lore-name">? ? ?</span>
                      <span class="lore-where">{`hides in ${whereText(pg.id)}`}</span>
                    </Button>
                  </li>
                ))}
                {p.closingSeen(c.n) && (
                  <li><Button id={`lore-closing-${c.n}`} class="lore-pick" onClick={() => p.onShow({ kind: 'card', which: 'closing', chapter: c.n })}>Closing</Button></li>
                )}
              </ul>
            </section>
          ) : (
            <p key={c.n} class="lore-soon">{`Chapter ${c.n} · Not yet released`}</p>
          ))}
        </div>
      )}
    </Dialog>
  );
}

export function renderLore(root: Element, props: LoreProps): void {
  render(<Lore {...props} />, root);
}
