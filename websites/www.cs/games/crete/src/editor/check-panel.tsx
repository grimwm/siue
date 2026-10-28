// The Island of Crete: the editor's Check panel. The Check button, then, while the search runs, an indeterminate
// bar with how far it has looked and Stop and Keep searching; when it is done, what the solver found (check.ts).
// An answer for an earlier draft stays, greyed, with "Out of date: press Check."
import { Button } from '../../../_kit/ui/button.tsx';
import { EDITOR_KEYS } from './keys.ts';
import { checkLines, checkSummary } from './check.ts';
import type { CheckState } from './check.ts';
import type { Level } from '../puzzle/level.ts';

export interface CheckPanelProps {
  state: CheckState;
  /** The draft's share text, which an answer is current for. */
  current: string;
  /** The level of the text the answer is for. */
  level: Level;
  onCheck(): void;
  onStop(): void;
  onKeep(): void;
  /** Share, from the strip: a narrow screen keeps the Share panel in the closed drawer. */
  onShare?: () => void;
}

/** What the running search has done, in a line. */
function progressText(s: Extract<CheckState, { kind: 'running' }>): string {
  const r = s.report;
  const text = r
    ? `Searched ${r.stored.toLocaleString('en-US')} situations · trying lines of at least ${r.bestF.toLocaleString('en-US')} moves${r.storage === 'memory' ? ' (in memory only)' : ''}`
    : 'Starting the search…';
  return s.stopped ? `${text} Stopped.` : text;
}

/** The check in one strip, in the editor's bar: where a narrow screen keeps the side panel closed, the Check button,
 *  the running search's bar and text with Stop and Keep searching, and the answer in a line. Wide screens hide it
 *  (game.css) for the panel. A search goes on while the editor is left (Try it, Q), so the strip is current on return. */
export function CheckStrip(p: CheckPanelProps) {
  const s = p.state;
  const summary = checkSummary(s, p.current);
  return (
    <div id="check-strip" class={summary === 'Out of date: press Check.' ? 'check-strip stale' : 'check-strip'} aria-label="Check">
      <Button id="check-strip-run" keyLabel={EDITOR_KEYS.check.label} onClick={p.onCheck}>Check</Button>
      {s.kind === 'running' && (
        <>
          <div class="check-bar" role="progressbar" aria-label="Searching" />
          <span id="check-strip-text" class="check-strip-text">{progressText(s)}</span>
          <Button id="check-strip-stop" disabled={s.stopped} onClick={p.onStop}>Stop</Button>
          <Button id="check-strip-keep" disabled={!s.stopped} onClick={p.onKeep}>Keep searching</Button>
        </>
      )}
      {summary !== '' && <span id="check-strip-text" class="check-strip-text" role="status">{summary}</span>}
      {p.onShare && <Button id="check-strip-share" disabled={s.kind === 'running' && !s.stopped} onClick={p.onShare}>Share</Button>}
    </div>
  );
}

export function CheckPanel(p: CheckPanelProps) {
  const s = p.state;
  const running = s.kind === 'running';
  const { lines, stale } = checkLines(s, p.current, p.level);
  return (
    <section id="check-panel" class="check-panel" aria-label="Check">
      <h3>Check</h3>
      <Button id="check-run" keyLabel={EDITOR_KEYS.check.label} onClick={p.onCheck}>Check</Button>
      {running && (
        <div class="check-running">
          <div class="check-bar" role="progressbar" aria-label="Searching" />
          <p id="check-progress" aria-live="polite">
            {progressText(s)}
          </p>
          <div class="check-actions">
            <Button id="check-stop" disabled={s.stopped} onClick={p.onStop}>Stop</Button>
            <Button id="check-keep" disabled={!s.stopped} onClick={p.onKeep}>Keep searching</Button>
          </div>
        </div>
      )}
      {lines.length > 0 && (
        <div id="check-result" class={stale ? 'check-result stale' : 'check-result'} role="status">
          {lines.map((line, i) => <p key={i}>{line}</p>)}
          {stale && <p id="check-stale" class="check-stale">Out of date: press Check.</p>}
        </div>
      )}
    </section>
  );
}
