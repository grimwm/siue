// Try It: one line above the timeline with the next thing to try and a dot per step, filled as each is done. It never
// blocks: it only suggests. Hide Tips folds it to a small Show Tips button.
import { COACH_STEPS, coachWords } from '../../compose/coach.ts';
import type { CoachStep } from '../../compose/coach.ts';
import { cx } from '../console/cx.ts';

export function Coach(p: { done: ReadonlySet<CoachStep>; hidden: boolean; onHide(): void; onShow(): void }) {
  if (p.hidden) {
    return (
      <div class="cmp-coach-off" data-coach="hidden">
        <button type="button" class="cmp-link" data-coach-show="" onClick={p.onShow}>Show Tips</button>
      </div>
    );
  }
  const count = COACH_STEPS.filter(s => p.done.has(s.id)).length;
  return (
    <div class="cmp-coach" data-coach="">
      <b>Try It</b>
      <span class="cmp-dots" role="img" aria-label={`${count} of ${COACH_STEPS.length} done`}>
        {COACH_STEPS.map(s => <i class={cx(p.done.has(s.id) && 'done')} data-step={s.id} />)}
      </span>
      <span class="cmp-coach-msg" aria-live="polite" data-coach-msg="">{coachWords(p.done)}</span>
      <button type="button" class="cmp-link" data-coach-hide="" onClick={p.onHide}>Hide Tips</button>
    </div>
  );
}
