// The Island of Crete: the title card. Shown when the page opens and after Quit. Play opens Chapter 1's card;
// Story and Settings open the story card and the menu when the page gives them; the kit's install bar mounts
// into #title-install (src/install-slot.ts).
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { EXIT_HINT } from '../../../_kit/app.ts';
import { CHAPTERS } from '../campaign/chapters.ts';
import { KEYS } from '../keys.ts';

export interface TitleCardProps {
  open: boolean;
  /** An installed app that could not close itself: say how to. */
  hint: boolean;
  onPlay: () => void;
  onStory?: () => void;
  onSettings?: () => void;
}

export function TitleCard(p: TitleCardProps) {
  return (
    <Dialog open={p.open} id="title-veil" veilClass="veil" panelClass="card" kicker={`Chapter 1 · ${CHAPTERS[0]!.name}`} kickerClass="kicker"
      titleId="title-name" title="The Island of Crete" focusId="title-play">
      <p>Tile puzzles in the Labyrinth. Gather the relics, open the gate and reach the exit. The Minotaur takes two steps to your one.</p>
      {p.hint && <p id="title-hint" class="runstats" role="status">{EXIT_HINT}.</p>}
      <div class="title-actions">
        <Button id="title-play" keyLabel={KEYS.new.label} onClick={p.onPlay}>▶ Play</Button>
        {p.onStory && <Button id="title-story" keyLabel={KEYS.story.label} onClick={p.onStory}>Story</Button>}
        {p.onSettings && <Button id="title-settings" keyLabel={KEYS.menu.label} onClick={p.onSettings}>Settings</Button>}
      </div>
      <div id="title-install" class="title-install" />
    </Dialog>
  );
}

export function renderTitleCard(root: Element, props: TitleCardProps): void {
  render(<TitleCard {...props} />, root);
}
