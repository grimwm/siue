// The front page's Connect your AI help: how the owner connects an AI app to the
// workroom's MCP server (siue-music mcp, run on their own computer), in numbered
// steps. It names commands only; every key stays in 1Password and on that
// computer, so nothing here is secret.
import type { ComponentChildren } from 'preact';
import { Panel } from './console/Panel.tsx';

const Code = (p: { children: ComponentChildren }) => <code class="rounded bg-well px-1 font-mono text-sm">{p.children}</code>;
const ASK = ['wait for my notes and make the next draft', 'publish draft 4 of crete-title', 'what did I say about crete-title?'];

export function ConnectAi() {
  return (
    <Panel title="Connect your AI" class="grid gap-3" data={{ 'data-connect-ai': '' }}>
      <p class="text-sm">
        Your AI app (Claude Code, Claude Desktop, or any app that speaks MCP) can work in this workroom for you: list the pieces,
        read a draft's score, publish a draft, wait for your notes and read them. A small program on your computer, the
        workroom's MCP server, does this with your keys; this page only explains how to set it up.
      </p>
      <details class="grid gap-3 text-sm">
        <summary class="min-h-11 cursor-pointer py-2 font-display font-semibold tracking-wider uppercase focus-visible:outline-2 focus-visible:outline-amber">Show the steps</summary>
        <p class="mt-2">You need, on the computer your AI app runs on:</p>
        <ul class="grid list-disc gap-1 pl-5">
          <li>this repository checked out;</li>
          <li>Python 3;</li>
          <li>the 1Password CLI (op), installed and signed in;</li>
          <li><Code>make music-setup</Code> run once, which sets up your keys.</li>
        </ul>
        <ol class="mt-2 grid list-decimal gap-2 pl-5 marker:font-mono marker:text-dim" aria-label="Steps to connect your AI">
          <li>In a terminal, go to the <Code>websites/www.cs</Code> folder of your checkout.</li>
          <li>Run <Code>make music-mcp-setup</Code>. It gets the MCP server ready and prints the commands that connect your AI app, with this checkout's paths filled in.</li>
          <li>Claude Code: paste the <Code>claude mcp add</Code> line it printed. Claude Desktop: paste the block it printed into the settings file it names, then restart the app. Another MCP app: give it the same command.</li>
          <li>Ask your AI, in your own words, for example: {ASK.map((a, i) => <span key={a}>{i > 0 ? ', ' : ''}“{a}”</span>)}.</li>
        </ol>
        <p class="mt-2">The printed commands name the workroom's server address. For a workroom on another server, the printed text says where to change it.</p>
        <p class="mt-2 text-dim">Your AI cannot delete drafts or notes: the workroom's API keys cannot delete. You delete notes yourself, here in the workroom.</p>
      </details>
    </Panel>
  );
}
