// The Island of Crete: the story card, the title card's short intro in the myth's voice.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';

export interface StoryProps {
  open: boolean;
  onClose: () => void;
}

export const STORY: readonly string[] = [
  'Crete, long ago. King Minos keeps the Labyrinth beneath his palace, and in the Labyrinth he keeps the Minotaur: half bull, all appetite, quicker than anything that has tried to cross it.',
  'Every ninth year a tribute ship comes in from Athens, and what it carries does not leave the island. This year Theseus walks down the gangway himself, and he does not mean to stay.',
  'The walls turn. The creature takes two steps for each of yours. There are pages scattered in the dark, a door somewhere, and nobody to ask the way. Run.',
];

export function StoryCard(p: StoryProps) {
  return (
    <Dialog open={p.open} id="story-veil" veilClass="veil" panelClass="card" kicker="Story" kickerClass="kicker"
      titleId="story-title" title="The Labyrinth" focusId="story-close">
      {STORY.map((t, i) => <p key={i} class="story-text">{t}</p>)}
      <Button id="story-close" keyLabel={KEYS.menu.label} onClick={p.onClose}>Back</Button>
    </Dialog>
  );
}

export function renderStoryCard(root: Element, props: StoryProps): void {
  render(<StoryCard {...props} />, root);
}
