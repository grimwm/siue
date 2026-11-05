// The Island of Crete: Demo's strip (src/demo.ts). While Demo plays, a small, quiet line at the foot of the board
// says what plays ("Demo · Endless Medium · Level 7") and, under it, how to take over. It takes no pointer: any tap or
// key, anywhere, ends Demo (src/main.ts).
import { render } from 'preact';
import { demoWords } from '../demo.ts';
import type { DemoView } from '../demo.ts';

export const DEMO_HINT = 'Tap or press any key to play';

export function DemoStrip(p: { view: DemoView | null }) {
  if (!p.view) return null;
  return (
    <div id="demo-strip" class="demo-strip" role="status">
      <p id="demo-line" class="demo-line">{demoWords(p.view)}</p>
      <p class="demo-hint">{DEMO_HINT}</p>
    </div>
  );
}

export function renderDemoStrip(root: Element | null, props: { view: DemoView | null }): void {
  if (root) render(<DemoStrip {...props} />, root);
}
