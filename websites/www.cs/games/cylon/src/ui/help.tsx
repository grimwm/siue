// Cylon Defense: How to Play. The game opens and closes it (opening pauses the
// run); this draws the steps for a mouse or for touch.
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { Button } from '../../../_kit/ui/button.tsx';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';

export interface HelpProps {
  open: boolean;
  /** A coarse pointer: show the touch steps. */
  touch: boolean;
  onClose: () => void;
}

function SharedSteps() {
  return (
    <>
      <li>Over time, expect occasional <strong>nukes</strong> and smaller <strong>missiles</strong> (each missile costs <strong>2 HP</strong>).</li>
      <li><strong>Cyan/pink</strong> missiles chase you; <strong>orange</strong> ones aim where you just were.</li>
      <li>Go <strong>10 seconds</strong> without taking a hit to <strong>heal 1 HP</strong>.</li>
      <li>More <strong>drones</strong> appear as your KO count rises.</li>
    </>
  );
}

function DesktopSteps() {
  return (
    <div class="cylon-help-body" id="cylon-help-desktop">
      <ol>
        <li>Flip <strong>Game On</strong> in the top bar.</li>
        <li><strong>Move the mouse</strong> to dodge bolts and nukes — the eye and drones track your cursor.</li>
        <li><strong>Click drones</strong> to KO them and score.</li>
        <li><strong>Grenade</strong> (<KeyChip label="G" />): arm, then click where you want the blast; <KeyChip label="Q" /> puts it away.</li>
        <li><strong>Raptor</strong> (<KeyChip label="R" />): orbital strike that clears the field and dazes the eye.</li>
        <SharedSteps />
        <li>You start with <strong>30 HP</strong> — hit 0, or take a nuke, then enter 3 initials for the board.</li>
      </ol>
    </div>
  );
}

function TouchSteps() {
  return (
    <div class="cylon-help-body" id="cylon-help-mobile">
      <ol>
        <li>Flip <strong>Game On</strong> in the top bar.</li>
        <li><strong>Drag the green reticle</strong> with one finger to dodge. Drones and nukes aim at that reticle.</li>
        <li>With your <strong>other finger</strong>, tap drones to KO them, or tap Grenade / Raptor / menu controls.</li>
        <li><strong>Grenade</strong>: tap the button to arm, then tap the page to throw.</li>
        <li><strong>Raptor</strong>: tap for a strike that clears drones and dazes the eye.</li>
        <SharedSteps />
        <li>You start with <strong>30 HP</strong> — hit 0, or take a nuke, then scroll initials ▲▼ for the high-score board.</li>
      </ol>
    </div>
  );
}

export function Help(p: HelpProps) {
  return (
    <Dialog open={p.open} id="cylon-help" veilClass="cylon-help" panelClass="cylon-help-panel"
      kicker="Cylon defense" kickerClass="cylon-help-kicker" titleId="cylon-help-title" titleClass="cylon-help-title"
      title="How to Play" focusId="cylon-help-close" onDismiss={p.onClose}>
      <p class="cylon-help-platform" id="cylon-help-platform">{p.touch ? 'Touch controls' : 'Desktop controls'}</p>
      {p.touch ? <TouchSteps /> : <DesktopSteps />}
      <Button class="cylon-gameover-btn" id="cylon-help-close" onClick={p.onClose}>Got it</Button>
    </Dialog>
  );
}

export function renderHelp(root: Element, props: HelpProps): void {
  render(<Help {...props} />, root);
}
