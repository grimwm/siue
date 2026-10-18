// A glossary word is a chip that opens a two-line card; the card can play the
// moment of the piece where the word is heard.
import type { Ref } from 'preact';
import type { Term } from '../glossary.ts';
import type { Clip } from '../player.ts';
import { Button } from './console/Button.tsx';
import { Chip } from './console/Chip.tsx';
import { Panel } from './console/Panel.tsx';

/** A glossary word: a compact chip in a list, or (inline) text inside a sentence. */
export function Word(p: { term: Term; text: string; inline?: boolean; onOpen(id: string): void }) {
  return <Chip term={p.term.id} inline={p.inline} onClick={() => p.onOpen(p.term.id)}>{p.text}</Chip>;
}

export function Card(p: { cardRef?: Ref<HTMLElement>; term: Term; clip: Clip | null; onHear(c: Clip): void; onClose(): void }) {
  const clip = p.clip;
  return (
    <Panel role="dialog" label={p.term.word} tabIndex={-1} panelRef={p.cardRef} accent data={{ 'data-card': '' }}>
      <h3 class="font-display text-xl font-semibold uppercase">{p.term.word}</h3>
      <p class="mt-1">{p.term.lines[0]}</p>
      <p class="mt-1 text-dim">{p.term.lines[1]}</p>
      <div class="mt-3 flex flex-wrap gap-2">
        {clip ? <Button variant="primary" onClick={() => p.onHear(clip)}>Hear it</Button> : null}
        <Button variant="ghost" onClick={p.onClose}>Close</Button>
      </div>
    </Panel>
  );
}
