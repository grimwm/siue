// The Island of Crete: the Endless card. It says what Endless is and which pieces a new run takes, shows the saved
// run (its seed, the level it is on, what it has cleared) with Continue, the deepest level any run cleared without
// Ariadne's thread, New Run, and a seed box with Play This Seed (any seed plays the same levels for anyone with the
// same pieces). While a level is being made it shows the search's progress, with Cancel. Q takes it to the title
// card (src/ui.ts owns every card, so the dialog is given no onDismiss).
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';
import type { EndlessView } from '../endless/mode.ts';
import { tierWords } from '../endless/name.ts';

export interface EndlessCardProps extends EndlessView {
  open: boolean;
  onContinue(): void;
  onNew(seed?: string, tier?: number): void;
  onCancel(): void;
  onBack(): void;
  /** The link that opens this run's seed, for Copy Seed Link. */
  link: string | null;
  onCopy?(link: string): void;
}

/** How far the search has got, 0 to 1. */
const share = (p: EndlessView['finding']) => (p?.progress ? Math.min(1, p.progress.spent / p.progress.budget) : 0);

export function EndlessCard(p: EndlessCardProps) {
  const [seed, setSeed] = useState('');
  const run = p.run;
  if (p.finding) {
    const pct = Math.round(share(p.finding) * 100);
    return (
      <Dialog open={p.open} id="endless-veil" veilClass="veil" panelClass="card endless" kicker="Endless" kickerClass="kicker"
        titleId="endless-title" title="Finding a Good Level…" focusId="endless-cancel">
        <p id="endless-finding">Drawing halls and checking each one with the solver: every level must be won without a catch, use every piece and keep the Minotaur close.</p>
        <div class="endless-bar" role="progressbar" aria-label="Finding a level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <span style={{ width: `${Math.max(4, pct)}%` }} />
        </div>
        <p id="endless-progress" class="runstats" aria-live="polite">
          {p.finding.progress ? `${p.finding.progress.tries.toLocaleString('en-US')} drafts tried` : 'Starting…'}
        </p>
        <div class="title-actions">
          <Button id="endless-cancel" keyLabel={KEYS.menu.label} onClick={p.onCancel}>Cancel</Button>
        </div>
      </Dialog>
    );
  }
  return (
    <Dialog open={p.open} id="endless-veil" veilClass="veil" panelClass="card endless" kicker="The Island of Crete" kickerClass="kicker"
      titleId="endless-title" title="Endless" focusId={p.linked ? 'endless-linked' : run ? 'endless-continue' : 'endless-new'}>
      <p>New levels without end, made from a seed and checked by the solver, each a little harder than the last until the climb levels off. A new run takes {tierWords(p.tier)}.</p>
      {run && (
        <p id="endless-run" class="runstats">
          {`Run ${run.seed} · Level ${run.depth} · ${run.cleared} cleared${run.assisted ? ' with help' : ''} · ${run.moves} moves`}
        </p>
      )}
      <p id="endless-best" class="runstats">{p.best ? `Your deepest: Level ${p.best.depth} (seed ${p.best.seed})` : 'Your deepest: none yet'}</p>
      {p.error && <p id="endless-error" class="runstats" role="alert">{p.error}</p>}
      {p.linked && <p id="endless-linked-note" class="runstats">{`A link brought seed ${p.linked.seed}, with ${tierWords(p.linked.tier)}. Playing it starts a new run.`}</p>}
      <div class="title-actions">
        {p.linked && <Button id="endless-linked" keyLabel={KEYS.begin.label} onClick={() => p.onNew(p.linked!.seed, p.linked!.tier)}>{`Play Seed ${p.linked.seed}`}</Button>}
        {run && <Button id="endless-continue" keyLabel={p.linked ? undefined : KEYS.begin.label} title={`Continue at Level ${run.depth}`} onClick={p.onContinue}>Continue</Button>}
        <Button id="endless-new" keyLabel={run ? undefined : KEYS.begin.label} onClick={() => p.onNew()}>New Run</Button>
        {run && p.link && p.onCopy && <Button id="endless-copy" onClick={() => p.onCopy!(p.link!)}>Copy Seed Link</Button>}
      </div>
      <form class="endless-seed" onSubmit={e => { e.preventDefault(); if (seed.trim()) p.onNew(seed); }}>
        <label for="endless-seed-box">Seed</label>
        <input id="endless-seed-box" type="text" inputMode="text" autoComplete="off" autoCapitalize="off" spellcheck={false} maxLength={32}
          value={seed} onInput={e => setSeed((e.target as HTMLInputElement).value)} />
        <Button id="endless-seed-play" disabled={!seed.trim()} onClick={() => p.onNew(seed)}>Play This Seed</Button>
      </form>
      <div class="title-actions">
        <Button id="endless-back" class="quiet" keyLabel={KEYS.menu.label} onClick={p.onBack}>Back</Button>
      </div>
    </Dialog>
  );
}

export function renderEndlessCard(root: Element, props: EndlessCardProps): void {
  render(<EndlessCard {...props} />, root);
}
