// games/tankity/src/ui/rotate-hint.tsx
/* The "turn sideways" chip over the top of the battlefield. */
import { render } from 'preact';

export function RotateHint({ onDismiss }: { onDismiss(): void }) {
  return (
    <div class="rotate-hint" role="status">
      <span>Turn sideways for the full battlefield</span>
      <button type="button" class="rotate-x" aria-label="Dismiss" onClick={onDismiss}>×</button>
    </div>
  );
}
export function renderRotateHint(root: Element, show: boolean, onDismiss: () => void): void {
  render(show ? <RotateHint onDismiss={onDismiss} /> : null, root);
}
