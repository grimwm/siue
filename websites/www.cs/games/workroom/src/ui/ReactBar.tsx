// One tap on a section: the eight reactions, for the section under the
// playhead (or the whole piece when there is none, as on a sound without moments).
import { REACTIONS } from '../answer.ts';
import type { Reaction } from '../note.ts';
import type { Section } from '../score.ts';
import { Button } from './console/Button.tsx';

export interface ReactBarProps { section: Section; whole: boolean; busy: boolean; onReact(r: Reaction): void }

export function ReactBar(p: ReactBarProps) {
  return (
    <div data-react-bar="" class="grid gap-2 rounded-lg border border-amber bg-panel p-3">
      <p class="font-mono text-xs text-amber">{p.whole ? 'React to the whole piece' : `React to: ${p.section.name}`}</p>
      <p class="text-sm text-dim">Move the playhead to react to another part.</p>
      <div role="group" aria-label="Reactions" class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {REACTIONS.map(r => <Button disabled={p.busy} data={{ 'data-reaction': r.id }} onClick={() => p.onReact(r.id)}>{r.label}</Button>)}
      </div>
    </div>
  );
}
