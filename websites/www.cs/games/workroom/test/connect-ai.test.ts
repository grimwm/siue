// The front page's Connect your AI help: what the MCP server is, what it needs,
// the one command that prints the connect commands, things to ask, and that the
// AI cannot delete; numbered steps, no secret, and the pieces list shows it
// whether or not a keyring is uploaded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { ComponentChild } from 'preact';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { NotesSession } from '../src/notes-session.ts';

installDocument();
Object.assign(globalThis, { window: { addEventListener() {}, removeEventListener() {} } });
const ui = await importTsx<{ connect: typeof import('../src/ui/ConnectAi.tsx'); index: typeof import('../src/ui/PiecesIndex.tsx') }>(
  import.meta.dirname, { connect: '../src/ui/ConnectAi.tsx', index: '../src/ui/PiecesIndex.tsx' });

const mount = async (vnode: ComponentChild): Promise<StubElement> => { const root = makeEl('root'); await act(() => { render(vnode, renderTarget(root)); }); return root; };
const settle = async (): Promise<void> => { for (let i = 0; i < 10; i++) await act(async () => { await new Promise(r => setImmediate(r)); }); };
const panel = (root: StubElement) => walk(root).find(e => e._attrs['data-connect-ai'] !== undefined);

test('it is a titled panel that says what the MCP server is and which apps can use it', async () => {
  const root = await mount(h(ui.connect.ConnectAi, {}));
  const p = panel(root)!;
  assert.ok(p, 'the panel is there');
  assert.equal(p._attrs['aria-label'], 'Connect your AI');
  assert.match(p.textContent, /MCP/);
  assert.match(p.textContent, /Claude Code/);
  assert.match(p.textContent, /Claude Desktop/);
});

test('it lists what is needed: the repository, Python 3, the signed-in 1Password CLI, and make music-setup once', async () => {
  const text = panel(await mount(h(ui.connect.ConnectAi, {})))!.textContent;
  assert.match(text, /repository/);
  assert.match(text, /Python 3/);
  assert.match(text, /1Password CLI/);
  assert.match(text, /signed in/);
  assert.match(text, /make music-setup/);
});

test('the steps are numbered and the one command that prints the connect commands is code', async () => {
  const root = await mount(h(ui.connect.ConnectAi, {}));
  const steps = walk(root).find(e => e.localName === 'ol')!;
  assert.ok(steps, 'a numbered list');
  assert.ok(walk(steps).filter(e => e.localName === 'li').length >= 4, 'four steps or more');
  const code = walk(root).filter(e => e.localName === 'code').map(e => e.textContent);
  assert.ok(code.includes('make music-mcp-setup'));
  assert.ok(code.includes('make music-setup'));
  assert.match(steps.textContent, /claude mcp add/);
});

test('it gives things to ask and says the AI cannot delete drafts or notes', async () => {
  const text = panel(await mount(h(ui.connect.ConnectAi, {})))!.textContent;
  assert.match(text, /wait for my notes and make the next draft/);
  assert.match(text, /publish draft 4 of crete-title/);
  assert.match(text, /cannot delete drafts or notes/);
});

test('it shows no secret: no key, passphrase or address with one in it', async () => {
  const text = panel(await mount(h(ui.connect.ConnectAi, {})))!.textContent;
  assert.doesNotMatch(text, /[0-9a-f]{32}/i);
  assert.doesNotMatch(text, /Bearer|PRIVATE KEY|passphrase:|key=/i);
});

/** A locked notes session with nothing in it; hasKeyring says whether a keyring is uploaded. */
const session = (hasKeyring: boolean): NotesSession => ({
  hasKeyring: async () => hasKeyring,
  unlocked: () => false,
  unlock: async () => null,
  restore: async () => false,
  history: async () => [],
  send: async () => ({ key: 'k', memoryOnly: false, sent: [], kept: [] }),
  flush: async () => ({ sent: [], kept: [] }),
  kept: async () => [],
  discard: async () => {},
  remove: async () => {},
  removeAll: async () => 0,
  lock() {},
  memoryOnly: () => false,
  unreadable: () => 0,
});

test('the pieces list shows the panel, with or without an uploaded keyring', async () => {
  for (const hasKeyring of [false, true]) {
    const root = await mount(h(ui.index.PiecesIndex, { notes: session(hasKeyring), list: makeEl('ol') as unknown as ParentNode }));
    await settle();
    assert.ok(panel(root), `keyring ${hasKeyring ? 'uploaded' : 'missing'}`);
    await act(() => { render(null, renderTarget(root)); });
  }
});
