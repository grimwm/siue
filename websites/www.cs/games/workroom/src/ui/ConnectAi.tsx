// The front page's Connect your AI help, the same for every studio: nothing to
// run, only what the page offers. AI keys are made on Your studio, and
// connecting an AI app is coming.
import { Panel } from './console/Panel.tsx';

export function ConnectAi() {
  return (
    <Panel title="Connect your AI" class="grid gap-3" data={{ 'data-connect-ai': '' }}>
      <p class="text-sm">Connecting your own AI app to your studio is coming.</p>
      <p class="text-sm">
        You can already make AI keys on <a href="studio.php" class="underline focus-visible:outline-2 focus-visible:outline-amber">Your studio</a>. An AI key lets one AI work in your studio with the permissions you give it.
      </p>
    </Panel>
  );
}
