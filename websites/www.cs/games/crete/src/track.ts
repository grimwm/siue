// websites/www.cs/games/crete/src/track.ts
// Crete's visitor-statistics events (the kit's track): New Game and Continue, each level started and won, and
// Hint, Route and Auto. Levels are named chapter-level ("1-3") so the dashboard's funnel sorts in campaign order.
import { tracker } from '../../_kit/stats.ts';
import { chapterOf } from './campaign/chapters.ts';

export const track = tracker('crete');

/** The campaign level `i` as the statistics name it: "<chapter>-<level within it>". */
export function levelName(i: number): string {
  const { chapter, within } = chapterOf(i);
  return `${chapter.n}-${within + 1}`;
}

/** What watchPlay reads of the game. */
export interface Played {
  readonly opens: number;
  readonly trial: number;
  readonly run: { readonly now: { readonly outcome: string } } | null;
}

/** A watcher for the game's changes that sends level_start when a level opens and level_win when a try is won;
 *  a level from outside the campaign (the editor's, a shared one) sends nothing. */
export function watchPlay(send: (name: string, prop?: string) => void = track): (g: Played, outside: boolean) => void {
  let opens = -1;
  let won: object | null = null;
  return (g, outside) => {
    const opened = g.opens !== opens;
    opens = g.opens;
    if (outside) return;
    if (opened) send('level_start', levelName(g.trial));
    if (g.run && g.run.now.outcome === 'won' && won !== g.run) {
      won = g.run;
      send('level_win', levelName(g.trial));
    }
  };
}
