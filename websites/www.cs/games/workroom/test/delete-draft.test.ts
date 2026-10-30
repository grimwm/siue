// Delete this draft and Delete this piece: each asks with the browser's confirm
// first, posts, then goes to the next newest draft or the pieces list.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import type { ComponentChild } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';

installDocument();
const ui = await importTsx<{ del: typeof import('../src/ui/DeleteDraft.tsx'); api: typeof import('../src/api.ts') }>(import.meta.dirname, { del: '../src/ui/DeleteDraft.tsx', api: '../src/api.ts' });
const { ServerError } = ui.api;

const mount = async (vnode: ComponentChild): Promise<StubElement> => { const root = makeEl('root'); await act(() => { render(vnode, renderTarget(root)); }); return root; };
const settle = async (): Promise<void> => { for (let i = 0; i < 10; i++) await act(async () => { await new Promise(r => setImmediate(r)); }); };
const button = (root: StubElement, text: string) => walk(root).find(e => e.localName === 'button' && e.textContent === text)!;

function setup(over: { versions?: number[]; version?: number; answer?: boolean; remove?: (piece: string, v?: number) => Promise<number> } = {}) {
  const log = { asked: [] as string[], removed: [] as [string, number | undefined][], went: [] as string[] };
  const props = {
    piece: 'crete-title', title: 'Crete Title', version: over.version ?? 3, versions: over.versions ?? [3, 2, 1],
    remove: over.remove ?? (async (piece: string, v?: number) => { log.removed.push([piece, v]); return 1; }),
    confirm: (q: string) => { log.asked.push(q); return over.answer ?? true; },
    go: (url: string) => { log.went.push(url); },
  };
  return { log, props };
}
const click = async (root: StubElement, text: string): Promise<void> => { await act(() => { fire(button(root, text), 'click'); }); await settle(); };

test('Delete this draft asks, posts the version, and opens the next newest draft', async () => {
  const { log, props } = setup();
  const root = await mount(h(ui.del.DeleteDraft, props));
  await click(root, 'Delete this draft');
  assert.deepEqual(log.asked, ['Delete draft 3 of Crete Title? This cannot be undone.']);
  assert.deepEqual(log.removed, [['crete-title', 3]]);
  assert.deepEqual(log.went, ['piece.php?id=crete-title&v=2']);
});

test('deleting a draft that is not the newest goes to the newest left', async () => {
  const { log, props } = setup({ version: 1 });
  await click(await mount(h(ui.del.DeleteDraft, props)), 'Delete this draft');
  assert.deepEqual(log.went, ['piece.php?id=crete-title&v=3']);
});

test('the only draft goes to the pieces list, and says the piece goes with it', async () => {
  const { log, props } = setup({ versions: [1], version: 1 });
  await click(await mount(h(ui.del.DeleteDraft, props)), 'Delete this draft');
  assert.match(log.asked[0]!, /only draft, so the piece goes too/);
  assert.deepEqual(log.went, ['./']);
});

test('Delete this piece names how many drafts go, posts no version, and goes to the pieces list', async () => {
  const { log, props } = setup();
  await click(await mount(h(ui.del.DeleteDraft, props)), 'Delete this piece');
  assert.deepEqual(log.asked, ['Delete Crete Title and all 3 of its drafts? This cannot be undone.']);
  assert.deepEqual(log.removed, [['crete-title', undefined]]);
  assert.deepEqual(log.went, ['./']);
});

test('a No on the confirm deletes nothing and goes nowhere', async () => {
  const { log, props } = setup({ answer: false });
  const root = await mount(h(ui.del.DeleteDraft, props));
  await click(root, 'Delete this draft');
  await click(root, 'Delete this piece');
  assert.equal(log.asked.length, 2);
  assert.deepEqual([log.removed, log.went], [[], []]);
});

test('a failed delete stays on the page and says why; one the server no longer has moves on', async () => {
  const failing = setup({ remove: async () => { throw new ServerError(500); } });
  const root = await mount(h(ui.del.DeleteDraft, failing.props));
  await click(root, 'Delete this draft');
  assert.deepEqual(failing.log.went, []);
  assert.match(walk(root).find(e => e._attrs['role'] === 'alert')!.textContent, /500/);
  const gone = setup({ remove: async () => { throw new ServerError(404); } });
  await click(await mount(h(ui.del.DeleteDraft, gone.props)), 'Delete this draft');
  assert.deepEqual(gone.log.went, ['piece.php?id=crete-title&v=2']);
});
