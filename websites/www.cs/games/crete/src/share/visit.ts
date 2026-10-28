/* The Island of Crete: a shared link's visit to the game page. Opening a link proves it (share/open.ts) and shows its
 * card, or says why it cannot open; the level's rating starts in the solver's worker (share/rating.ts) and goes on
 * while the level is played. Play opens the level as the outside level of kind 'shared', with the link's line for
 * Ariadne's thread; Edit a copy opens the editor on the level alone (not the author's initials or best). Opening
 * another link, a bad one included, or the page going away cancels the rating. Only a fragment of the form
 * `L<digits>…` is a link (`fragmentKind`). DOM-free. */
import { LINK_MESSAGES } from './link.ts';
import type { Shared } from './link.ts';
import { openLink } from './open.ts';
import type { Rater, RatingState } from './rating.ts';
import type { OutsideLevel } from '../campaign/chapters.ts';
import { fromLevel } from '../editor/model.ts';
import type { Draft } from '../editor/model.ts';
import type { Level } from '../puzzle/level.ts';
import type { Action } from '../puzzle/step.ts';

/** What the address's fragment (with its `#`) asks for: the editor, a share link, nothing, or something that is not
 *  the game's (ignored). */
export function fragmentKind(hash: string): 'edit' | 'link' | 'empty' | 'other' {
  if (hash === '#edit') return 'edit';
  if (/^#L[0-9]/.test(hash)) return 'link';
  return hash === '' || hash === '#' ? 'empty' : 'other';
}

export interface VisitDeps {
  rater: Pick<Rater, 'state' | 'rate' | 'cancel'>;
  /** Opens `level` as the outside level `about`, with `line` as its proven line. */
  play(level: Level, about: OutsideLevel, line: readonly Action[]): void;
  /** Opens the editor on `draft`. */
  edit(draft: Draft): void;
  /** The shared card opens. */
  show(): void;
  /** The link cannot be opened, for the reason `message` gives. */
  refuse(message: string): void;
}

/** What the shared card shows: the level's name, the author's best and the rating as it stands. */
export interface SharedView {
  /** The link's level: the level in play is this link's when it is this very level. */
  level: Level;
  name: string;
  best: number | null;
  /** The rating of this link's level; `none` before it is asked for. */
  rating: RatingState;
}

export interface Visit {
  /** Opens the link whose fragment (without `#`) is `fragment`. */
  open(fragment: string): Promise<void>;
  /** The address moved on from a link: a link still decoding is dropped, and shows no card. */
  forget(): void;
  /** The open link's card, or null when no link is open. */
  card(): SharedView | null;
  play(): void;
  edit(): void;
  /** The page is going away: the rating is cancelled; the link stays open. */
  leave(): void;
  /** The page is back: a rating that was cancelled by `leave` starts again. */
  back(): void;
}

export function createVisit(deps: VisitDeps): Visit {
  let current: { shared: Shared; name: string } | null = null;
  /** The latest open's number; a link that finishes decoding after a newer one was asked for is dropped. */
  let opening = 0;

  return {
    async open(fragment) {
      const mine = ++opening;
      const r = await openLink(fragment);
      if (mine !== opening) return;
      if (!r.ok) {
        current = null;
        deps.rater.cancel();
        deps.refuse(LINK_MESSAGES[r.error]);
        return;
      }
      current = { shared: r.shared, name: r.name };
      deps.rater.rate(r.shared.text);
      deps.show();
    },
    forget() {
      opening++;
    },
    card() {
      if (!current) return null;
      const s = deps.rater.state;
      return {
        level: current.shared.level,
        name: current.name,
        best: current.shared.best,
        rating: s.kind !== 'none' && s.text === current.shared.text ? s : { kind: 'none' },
      };
    },
    play() {
      if (!current) return;
      const { shared, name } = current;
      deps.play(shared.level, { kind: 'shared', name, best: shared.best }, shared.line);
    },
    edit() {
      if (current) deps.edit(fromLevel(current.shared.level));
    },
    leave() {
      deps.rater.cancel();
    },
    back() {
      if (current) deps.rater.rate(current.shared.text);
    },
  };
}
