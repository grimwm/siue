// A glossary word is a button that opens a two-line card; the card can play the
// moment of the piece where the word is heard.
import type { Term } from '../glossary.ts';
import type { Clip } from '../player.ts';

export function Word(p: { term: Term; text: string; onOpen(id: string): void }) {
  return <button type="button" class="word" data-term={p.term.id} onClick={() => p.onOpen(p.term.id)}>{p.text}</button>;
}

export function Card(p: { term: Term; clip: Clip | null; onHear(c: Clip): void; onClose(): void }) {
  const clip = p.clip;
  return (
    <div class="card" role="dialog" aria-label={p.term.word}>
      <h3>{p.term.word}</h3>
      <p>{p.term.lines[0]}</p>
      <p>{p.term.lines[1]}</p>
      <div class="card-actions">
        {clip ? <button type="button" class="hear" onClick={() => p.onHear(clip)}>Hear it</button> : null}
        <button type="button" class="close" onClick={p.onClose}>Close</button>
      </div>
    </div>
  );
}
