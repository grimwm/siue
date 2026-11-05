// The Island of Crete: the title card. Shown when the page opens, after Quit, and with a note when a share link
// cannot be opened (src/share/visit.ts). New Game opens the new-game card, which asks for the look; Continue (shown
// once a level is cleared and until all are) opens the chapter card of the first level not cleared, and has Enter;
// Endless, Story, Make a level and Settings open the Endless card, the story card, the level editor and the menu when the page gives them,
// and Demo plays Endless by itself (src/demo.ts);
// the kit's install bar mounts into #title-install (src/install-slot.ts). The buttons stand in one column: the way in
// first and filled (Continue when it is offered, else New Game), New Game outlined under Continue, then the rest
// outlined, two to a row; Escape, as Q, backs out of any card opened from here (src/ui.ts).
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
  /** Why a share link did not open, when one did not. */
  note?: string;
  onPlay: () => void;
  /** Where Continue goes, for its title and accessible name ("Continue at Chapter 2, Level 3"); no Continue without it. */
  resume?: string;
  onContinue?: () => void;
  onStory?: () => void;
  /** Make a level: opens the level editor. */
  onEditor?: () => void;
  /** Endless: opens the Endless card. */
  onEndless?: () => void;
  /** Demo: Endless plays by itself (src/demo.ts). */
  onDemo?: () => void;
  onSettings?: () => void;
}

export function TitleCard(p: TitleCardProps) {
  return (
    <Dialog open={p.open} id="title-veil" veilClass="veil" panelClass="card" kicker={`Chapter 1 · ${CHAPTERS[0]!.name}`} kickerClass="kicker"
      titleId="title-name" title="The Island of Crete" focusId={p.resume ? 'title-continue' : 'title-play'}>
      <p>Tile puzzles in the Labyrinth. Gather the relics, open the Daedalus Gate and reach the exit. The Minotaur takes two steps to your one.</p>
      {p.hint && <p id="title-hint" class="runstats" role="status">{EXIT_HINT}.</p>}
      {p.note && <p id="title-note" class="runstats">{p.note}</p>}
      <div class="title-menu">
        {p.resume && p.onContinue && <Button id="title-continue" class="title-primary" label={p.resume} title={p.resume} keyLabel={KEYS.begin.label} onClick={p.onContinue}>Continue</Button>}
        <Button id="title-play" class={p.resume && p.onContinue ? 'quiet' : 'title-primary'} keyLabel={KEYS.new.label} onClick={p.onPlay}>New Game</Button>
        <div class="title-grid">
          {p.onEndless && <Button id="title-endless" class="quiet" keyLabel={KEYS.endless.label} onClick={p.onEndless}>Endless</Button>}
          {p.onDemo && <Button id="title-demo" class="quiet" keyLabel={KEYS.demo.label} onClick={p.onDemo}>Demo</Button>}
          {p.onStory && <Button id="title-story" class="quiet" keyLabel={KEYS.story.label} onClick={p.onStory}>Story</Button>}
          {p.onEditor && <Button id="title-editor" class="quiet" keyLabel={KEYS.editor.label} onClick={p.onEditor}>Make a Level</Button>}
          {p.onSettings && <Button id="title-settings" class="quiet" keyLabel={KEYS.menu.label} onClick={p.onSettings}>Settings</Button>}
        </div>
      </div>
      <div id="title-install" class="title-install" />
    </Dialog>
  );
}

export function renderTitleCard(root: Element, props: TitleCardProps): void {
  render(<TitleCard {...props} />, root);
}
