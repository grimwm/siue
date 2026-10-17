// The Island of Crete: the trial list. Eight buttons, each with the trial's title and how this browser has
// done with it. src/ui.ts builds the rows; this draws them and reports a pick. Q (the kit's back key) is
// handled by src/ui.ts, which owns every card, so the dialog is given no onDismiss; Close is for a pointer.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';

export interface TrialRow {
  title: string;
  /** "cleared · best 12", "cleared with help" or "not yet". */
  status: string;
}

export interface TrialsProps {
  open: boolean;
  rows: TrialRow[];
  /** The trial in play (0-based), or -1. */
  current: number;
  onPick: (i: number) => void;
  onClose: () => void;
}

export function Trials(p: TrialsProps) {
  return (
    <Dialog open={p.open} id="trials-veil" veilClass="veil" panelClass="card trials" kicker="The Island of Crete" kickerClass="kicker"
      titleId="trials-title" title="The Eight Trials" focusId={`trial-${Math.max(0, p.current) + 1}`}>
      <Button id="trials-close" class="close" label="Close the trial list" keyLabel={KEYS.menu.label} onClick={p.onClose}>✕</Button>
      <ol class="trial-list">
        {p.rows.map((r, i) => (
          <li key={i}>
            <Button id={`trial-${i + 1}`} class="trial-pick" pressed={i === p.current} onClick={() => p.onPick(i)}>
              <span class="trial-n">{i + 1}</span>
              <span class="trial-name">{r.title}</span>
              <span class="trial-status">{r.status}</span>
            </Button>
          </li>
        ))}
      </ol>
    </Dialog>
  );
}

export function renderTrials(root: Element, props: TrialsProps): void {
  render(<Trials {...props} />, root);
}
