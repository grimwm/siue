// The Island of Crete: the level list. A tab for each of the campaign's chapters (the unreleased ones disabled),
// then a button for each level of the shown chapter with its title and how this browser has done with it.
// src/ui.ts builds the rows; this draws them and reports a pick or a tab. Q (the kit's back key) is handled by
// src/ui.ts, which owns every card, so the dialog is given no onDismiss; Close is for a pointer.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import type { Chapter } from '../campaign/chapters.ts';
import { KEYS } from '../keys.ts';

export interface LevelRow {
  title: string;
  /** "cleared · best 12", "cleared with help" or "not yet". */
  status: string;
}

export interface LevelsProps {
  open: boolean;
  chapters: readonly Chapter[];
  /** The chapter number whose levels are listed. */
  shown: number;
  /** The shown chapter's levels, in order. */
  rows: LevelRow[];
  /** The level in play (0-based within the shown chapter), or -1. */
  current: number;
  onPick: (i: number) => void;
  onTab: (n: number) => void;
  onClose: () => void;
}

export function Levels(p: LevelsProps) {
  return (
    <Dialog open={p.open} id="levels-veil" veilClass="veil" panelClass="card levels" kicker="The Island of Crete" kickerClass="kicker"
      titleId="levels-title" title="Levels" focusId={`level-${Math.max(0, p.current) + 1}`}
      close={<Button id="levels-close" class="close" label="Close the level list" keyLabel={KEYS.menu.label} onClick={p.onClose}>✕</Button>}>
      <div class="chapter-tabs">
        {p.chapters.map(c => (
          <Button key={c.n} id={`levels-tab-${c.n}`} class="chapter-tab" pressed={c.n === p.shown} disabled={!c.released} onClick={() => p.onTab(c.n)}>
            {c.released ? `Ch ${c.n}` : `Ch ${c.n} · soon`}
          </Button>
        ))}
      </div>
      <ol class="level-list">
        {p.rows.map((r, i) => (
          <li key={i}>
            <Button id={`level-${i + 1}`} class="level-pick" pressed={i === p.current} onClick={() => p.onPick(i)}>
              <span class="level-n">{i + 1}</span>
              <span class="level-name">{r.title}</span>
              <span class="level-status">{r.status}</span>
            </Button>
          </li>
        ))}
      </ol>
    </Dialog>
  );
}

export function renderLevels(root: Element, props: LevelsProps): void {
  render(<Levels {...props} />, root);
}
