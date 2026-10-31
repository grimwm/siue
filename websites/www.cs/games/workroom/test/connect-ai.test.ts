// The front page's Connect Your AI panel, the same for every studio, the owner's
// included: four numbered steps (uv, an AI key, the command per app, the pairing
// code) and never make, a terminal, a checkout, a repository, GitHub, PyPI or
// 1Password. The pieces list shows the panel to every studio whether or not a
// keyring is uploaded. With no keyring the pieces list makes the notes key.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { ComponentChild } from 'preact';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { NotesSession } from '../src/notes-session.ts';

installDocument();
Object.assign(globalThis, { window: { addEventListener() {}, removeEventListener() {} } });
import type { ConnectData } from '../src/ui/ConnectAi.tsx';
const ui = await importTsx<{ connect: typeof import('../src/ui/ConnectAi.tsx'); index: typeof import('../src/ui/PiecesIndex.tsx') }>(
  import.meta.dirname, { connect: '../src/ui/ConnectAi.tsx', index: '../src/ui/PiecesIndex.tsx' });

const mount = async (vnode: ComponentChild): Promise<StubElement> => { const root = makeEl('root'); await act(() => { render(vnode, renderTarget(root)); }); return root; };
const settle = async (): Promise<void> => { for (let i = 0; i < 10; i++) await act(async () => { await new Promise(r => setImmediate(r)); }); };
const panel = (root: StubElement) => walk(root).find(e => e._attrs['data-connect-ai'] !== undefined);

/** A locked notes session with nothing in it; hasKeyring says whether a keyring is uploaded. */
const session = (hasKeyring: boolean, made: string[] = [], stored = false): NotesSession => ({
  hasKeyring: async () => hasKeyring,
  keyStored: () => stored,
  makeKey: async p => { made.push(p); return made.length === 1 ? 'There is a notes key already. Reload the page and unlock it with its passphrase.' : null; },
  unlocked: () => made.length > 1,
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

const CONNECT: ConnectData = {
  uv: 'https://docs.astral.sh/uv/getting-started/installation/',
  wheel: 'https://www.cs.siue.edu/~wgrim/music/dist/siue_music-1.0.0-py3-none-any.whl',
  version: '1.0.0', sha256: 'ab'.repeat(32), placeholder: 'PASTE-YOUR-AI-KEY-HERE',
  commands: [
    { app: 'Claude Code', how: 'Run this once, in any folder.', text: 'claude mcp add --scope user siue-music --env SIUE_MUSIC_BASE=https://www.cs.siue.edu/~wgrim/music/ --env SIUE_MUSIC_AI_KEY=PASTE-YOUR-AI-KEY-HERE -- uvx --from https://www.cs.siue.edu/~wgrim/music/dist/siue_music-1.0.0-py3-none-any.whl siue-music mcp' },
    { app: 'Claude Desktop', how: 'Add this.', text: '{"mcpServers": {}}' },
  ],
};
const FORBIDDEN = /\bmake music|\bmake\b(?! an AI key)|terminal|checkout|repositor|GitHub|PyPI|1Password|\bop\b/i;

test('every studio sees four numbered steps naming only uv, the command for each app, an AI key and the pairing code', async () => {
  const copied: string[] = [];
  const root = await mount(h(ui.connect.ConnectAi, { connect: CONNECT, copy: async t => { copied.push(t); } }));
  const p = panel(root)!;
  assert.equal(p._attrs['aria-label'], 'Connect Your AI');
  assert.deepEqual(walk(p).filter(e => e.localName === 'h3').map(e => e.textContent), ['Install uv', 'Make An AI Key', 'Add siue-music To Your AI App', 'Type The Pairing Code']);
  assert.equal(walk(p).filter(e => e.localName === 'ol').length, 1);
  assert.equal(walk(p).find(e => e.localName === 'a' && e.textContent === "uv's installation page")?._attrs['href'], CONNECT.uv);
  assert.equal(walk(p).find(e => e.localName === 'a' && e.textContent === 'Your studio')?._attrs['href'], 'studio.php');
  const codes = walk(p).filter(e => e.localName === 'code').map(e => e.textContent);
  assert.deepEqual(codes, CONNECT.commands.map(c => c.text), 'one copyable command per app');
  assert.match(codes[0]!, /uvx --from https:\/\/www\.cs\.siue\.edu\/~wgrim\/music\/dist\/siue_music-1\.0\.0-py3-none-any\.whl siue-music mcp$/);
  assert.match(p.textContent, new RegExp(`SHA-256 ${CONNECT.sha256}`), 'the wheel\'s SHA-256 is shown');
  assert.doesNotMatch(p.textContent, FORBIDDEN);
  const copy = walk(p).find(e => e.localName === 'button' && e.textContent === 'Copy')!;
  await act(() => { fire(copy, 'click'); });
  await settle();
  assert.deepEqual(copied, [CONNECT.commands[0]!.text]);
  assert.equal(walk(p).find(e => e._attrs['role'] === 'status')?.textContent, 'Copied.');
});

test('without the server\'s commands the panel says to reload, and still names no forbidden step', async () => {
  const root = await mount(h(ui.connect.ConnectAi, { connect: null }));
  assert.match(panel(root)!.textContent, /The commands could not be loaded\. Reload the page\./);
  assert.doesNotMatch(panel(root)!.textContent, FORBIDDEN);
  assert.equal(ui.connect.readConnect('{"uv":1}'), null);
  assert.equal(ui.connect.readConnect(undefined), null);
  assert.deepEqual(ui.connect.readConnect(JSON.stringify(CONNECT)), CONNECT);
});

test('the pieces list shows the same panel to every studio, with or without an uploaded keyring', async () => {
  for (const hasKeyring of [false, true]) {
    const root = await mount(h(ui.index.PiecesIndex, { notes: session(hasKeyring), list: makeEl('ol') as unknown as ParentNode, connect: CONNECT }));
    await settle();
    const where = `keyring ${hasKeyring ? 'uploaded' : 'missing'}`;
    assert.match(panel(root)?.textContent ?? '', /Type The Pairing Code/, where);
    assert.doesNotMatch(root.textContent, /make music|terminal|checkout|1Password/i, where);
    await act(() => { render(null, renderTarget(root)); });
  }
});

test('with no keyring the pieces list makes the notes key: two passphrases, checked, then made and unlocked', async () => {
  const made: string[] = [];
  const root = await mount(h(ui.index.PiecesIndex, { notes: session(false, made), list: makeEl('ol') as unknown as ParentNode }));
  await settle();
  const form = () => walk(root).find(e => e._attrs['data-make-key'] !== undefined)!;
  assert.equal(walk(form()).find(e => e.localName === 'p')!.textContent,
    'Make your notes key. Your notes are sealed in this browser with a key only your passphrase unlocks. Nobody can reset it, not even the people who run this site. If you forget it, Forgot your passphrase on Your studio deletes your notes and this key so you can make a new one; your pieces stay.');
  assert.ok(walk(form()).find(e => e.localName === 'button' && e.textContent === 'Make my notes key'));
  const type = async (a: string, b: string): Promise<void> => {
    const [first, again] = walk(form()).filter(e => e._attrs['autocomplete'] === 'new-password');
    first!.value = a; await act(() => { fire(first!, 'input'); });
    again!.value = b; await act(() => { fire(again!, 'input'); });
    await act(() => { fire(walk(form()).find(e => e.localName === 'form')!, 'submit'); });
    await settle();
  };
  const alert = () => walk(form()).find(e => e._attrs['role'] === 'alert')?.textContent;
  await type('short', 'short');
  assert.equal(alert(), 'Choose a passphrase of at least 12 characters.');
  await type('twelve chars or more', 'twelve chars or less');
  assert.equal(alert(), 'The two passphrases are not the same. Type it again in both fields.');
  assert.deepEqual(made, [], 'nothing is made until the two agree');
  assert.ok(walk(form()).filter(e => e._attrs['autocomplete'] === 'new-password').every(e => e.value === ''), 'the fields are cleared');
  await type('twelve chars or more', 'twelve chars or more');
  assert.equal(alert(), 'There is a notes key already. Reload the page and unlock it with its passphrase.');
  await type('twelve chars or more', 'twelve chars or more');
  assert.deepEqual(made, ['twelve chars or more', 'twelve chars or more']);
  assert.ok(walk(root).find(e => e._attrs['data-make-key'] !== undefined) === undefined, 'made and unlocked: the notes panel takes its place');
  assert.ok(walk(root).find(e => e._attrs['data-pieces-notes'] !== undefined));
  await act(() => { render(null, renderTarget(root)); });
});

test('a key that was stored but did not unlock takes the panel to the unlock form with the reason, so a retry cannot make another key', async () => {
  const made: string[] = [];
  const notes = session(false, made, true);
  notes.makeKey = async p => { made.push(p); return 'Could not reach the server. Check the connection and try again.'; };
  notes.unlocked = () => false;
  const root = await mount(h(ui.index.PiecesIndex, { notes, list: makeEl('ol') as unknown as ParentNode }));
  await settle();
  const form = walk(root).find(e => e._attrs['data-make-key'] !== undefined)!;
  const [first, again] = walk(form).filter(e => e._attrs['autocomplete'] === 'new-password');
  first!.value = 'twelve chars or more'; await act(() => { fire(first!, 'input'); });
  again!.value = 'twelve chars or more'; await act(() => { fire(again!, 'input'); });
  await act(() => { fire(walk(form).find(e => e.localName === 'form')!, 'submit'); });
  await settle();
  assert.deepEqual(made, ['twelve chars or more']);
  assert.ok(walk(root).find(e => e._attrs['data-make-key'] !== undefined) === undefined, 'no make form: the key exists');
  assert.equal(walk(root).find(e => e._attrs['data-unlock-reason'] !== undefined)?.textContent, 'Could not reach the server. Check the connection and try again.');
  await act(() => { render(null, renderTarget(root)); });
});

test('a make that returns nothing and unlocks nothing says so instead of going silent', async () => {
  const notes = session(false, []);
  notes.makeKey = async () => null;
  notes.unlocked = () => false;
  const root = await mount(h(ui.index.PiecesIndex, { notes, list: makeEl('ol') as unknown as ParentNode }));
  await settle();
  const form = walk(root).find(e => e._attrs['data-make-key'] !== undefined)!;
  const [first, again] = walk(form).filter(e => e._attrs['autocomplete'] === 'new-password');
  first!.value = 'twelve chars or more'; await act(() => { fire(first!, 'input'); });
  again!.value = 'twelve chars or more'; await act(() => { fire(again!, 'input'); });
  await act(() => { fire(walk(form).find(e => e.localName === 'form')!, 'submit'); });
  await settle();
  assert.match(walk(root).find(e => e._attrs['role'] === 'alert')?.textContent ?? '', /locked again/);
  await act(() => { render(null, renderTarget(root)); });
});
