// The front page's Connect your AI help: what the MCP server is, what it needs,
// the one command that prints the connect commands, things to ask, and that the
// AI may delete a published draft with the publish key's delete permission but
// not notes; numbered steps, no secret, and the pieces list shows it to people
// with the allowance whether or not a keyring is uploaded, and to no one else.
// With no keyring the pieces list makes the notes key.
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

test('it gives things to ask, says deleting a draft needs the publish key\'s delete permission, and that notes cannot be deleted', async () => {
  const text = panel(await mount(h(ui.connect.ConnectAi, {})))!.textContent;
  assert.match(text, /wait for my notes and make the next draft/);
  assert.match(text, /publish draft 4 of crete-title/);
  assert.match(text, /delete draft 2 of crete-title/);
  assert.match(text, /delete permission/);
  assert.match(text, /publish keys have/);
  assert.match(text, /cannot delete notes/);
  assert.doesNotMatch(text, /cannot delete drafts/);
});

test('it shows no secret: no key, passphrase or address with one in it', async () => {
  const text = panel(await mount(h(ui.connect.ConnectAi, {})))!.textContent;
  assert.doesNotMatch(text, /[0-9a-f]{32}/i);
  assert.doesNotMatch(text, /Bearer|PRIVATE KEY|passphrase:|key=/i);
});

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

test('the pieces list shows the panel to people with the allowance, with or without an uploaded keyring, and to no one else', async () => {
  for (const named of [true, false]) {
    for (const hasKeyring of [false, true]) {
      const root = await mount(h(ui.index.PiecesIndex, { notes: session(hasKeyring), list: makeEl('ol') as unknown as ParentNode, named }));
      await settle();
      assert.equal(panel(root) !== undefined, named, `keyring ${hasKeyring ? 'uploaded' : 'missing'}, ${named ? 'named' : 'studio'}`);
      if (!named) assert.doesNotMatch(root.textContent, /music-setup/);
      await act(() => { render(null, renderTarget(root)); });
    }
  }
});

test('with no keyring the pieces list makes the notes key: two passphrases, checked, then made and unlocked', async () => {
  const made: string[] = [];
  const root = await mount(h(ui.index.PiecesIndex, { notes: session(false, made), list: makeEl('ol') as unknown as ParentNode, named: false }));
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
  const root = await mount(h(ui.index.PiecesIndex, { notes, list: makeEl('ol') as unknown as ParentNode, named: false }));
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
  const root = await mount(h(ui.index.PiecesIndex, { notes, list: makeEl('ol') as unknown as ParentNode, named: false }));
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
