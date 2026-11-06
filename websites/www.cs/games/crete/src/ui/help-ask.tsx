// The Island of Crete: the card that asks once, the first time New Game or Endless is chosen on the title card, whether
// this device may help build Endless levels (src/settings.ts helpBuild). Help Build Levels and No Thanks keep the
// answer and go on; src/ui.ts owns the keys (Enter presses the focused button, Q and Escape are No Thanks), so the
// dialog is given no onDismiss.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KEYS } from '../keys.ts';

export interface HelpAskProps {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
}

export const HELP_ASK_TEXT = 'Your device can help make and check new Endless levels while the game is idle. It never runs during play or on low battery, and you can change this any time in the menu.';

export function HelpAsk(p: HelpAskProps) {
  return (
    <Dialog open={p.open} id="help-veil" veilClass="veil" panelClass="card help-ask" kicker="Endless" kickerClass="kicker"
      titleId="help-title" title="Help Build Endless Levels" focusId="help-yes">
      <p id="help-text">{HELP_ASK_TEXT}</p>
      <div class="title-actions">
        <Button id="help-yes" keyLabel={KEYS.begin.label} onClick={p.onYes}>Help Build Levels</Button>
        <Button id="help-no" class="quiet" keyLabel={KEYS.menu.label} onClick={p.onNo}>No Thanks</Button>
      </div>
    </Dialog>
  );
}

export function renderHelpAsk(root: Element, props: HelpAskProps): void {
  render(<HelpAsk {...props} />, root);
}
