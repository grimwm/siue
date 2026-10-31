// The front page's Connect Your AI panel, the same for every studio: numbered steps that name only uv, the copyable
// command for each AI app (the studio's address and the published siue-music wheel already in it, the AI key a
// placeholder), making an AI key on Your studio and typing the pairing code there. The commands come from the server
// (music/lib/Connect.php) in the body's data-connect.
import { useState } from 'preact/hooks';
import { Button } from './console/Button.tsx';
import { Panel } from './console/Panel.tsx';

export interface ConnectCommand { app: string; how: string; text: string }
export interface ConnectData { uv: string; wheel: string; version: string; sha256: string; placeholder: string; commands: ConnectCommand[] }

/** data-connect's JSON as ConnectData, or null when it is missing or not that. */
export function readConnect(raw: string | undefined): ConnectData | null {
  try {
    const d = JSON.parse(raw ?? '') as Partial<ConnectData>;
    const ok = typeof d.uv === 'string' && typeof d.wheel === 'string' && typeof d.version === 'string' && typeof d.sha256 === 'string'
      && typeof d.placeholder === 'string' && Array.isArray(d.commands)
      && d.commands.every(c => typeof c?.app === 'string' && typeof c.how === 'string' && typeof c.text === 'string');
    return ok ? (d as ConnectData) : null;
  } catch {
    return null;
  }
}

const LINK = 'underline focus-visible:outline-2 focus-visible:outline-amber';
const STEP = 'font-display text-sm font-semibold';

function Command(p: { c: ConnectCommand; copy?: (text: string) => Promise<void> }) {
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <div class="grid gap-1" data-connect-app={p.c.app}>
      <h4 class="text-sm font-semibold">{p.c.app}</h4>
      <p class="text-sm">{p.c.how}</p>
      <pre class="overflow-x-auto rounded-md border border-rule bg-well p-2 text-xs"><code>{p.c.text}</code></pre>
      {p.copy ? (
        <div class="flex items-center gap-2">
          <Button onClick={() => { void p.copy!(p.c.text).then(() => setCopied('Copied.'), () => setCopied('Select the text and copy it.')); }}>Copy</Button>
          {copied ? <span class="text-xs" role="status">{copied}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export function ConnectAi(p: { connect?: ConnectData | null; copy?: (text: string) => Promise<void> }) {
  const c = p.connect ?? null;
  return (
    <Panel title="Connect Your AI" class="grid gap-3" data={{ 'data-connect-ai': '' }}>
      <p class="text-sm">Your own AI app (Claude Code, Claude Desktop, Cursor, Codex, Gemini CLI or any app that speaks MCP) can work in your studio: list, read, publish and delete drafts, and read the notes you send it.</p>
      <ol class="grid list-decimal gap-3 pl-5">
        <li class="grid gap-1">
          <h3 class={STEP}>Install uv</h3>
          <p class="text-sm">It runs the siue-music server on your computer. Follow {c ? <a href={c.uv} class={LINK}>uv's installation page</a> : 'uv\'s installation page'}.</p>
        </li>
        <li class="grid gap-1">
          <h3 class={STEP}>Make An AI Key</h3>
          <p class="text-sm">On <a href="studio.php" class={LINK}>Your studio</a>, make an AI key with the permissions your AI needs (read notes, to read the notes you send). Your studio then shows these commands with the key already in them.</p>
        </li>
        <li class="grid gap-2">
          <h3 class={STEP}>Add siue-music To Your AI App</h3>
          {c ? (
            <>
              <p class="text-sm">Copy the one for your app, and put your AI key where it says {c.placeholder}.</p>
              {c.commands.map(cmd => <Command key={cmd.app} c={cmd} copy={p.copy} />)}
              <p class="text-xs text-dim">siue-music {c.version}: {c.wheel}, SHA-256 {c.sha256}.</p>
            </>
          ) : <p class="text-sm">The commands could not be loaded. Reload the page.</p>}
        </li>
        <li class="grid gap-1">
          <h3 class={STEP}>Type The Pairing Code</h3>
          <p class="text-sm">Ask your AI for its siue-music pairing code. Type it on that key's row on Your studio, with your passphrase. From then on your AI can open the notes you send.</p>
        </li>
      </ol>
    </Panel>
  );
}
