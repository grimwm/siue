// The notes panel: the unlock form suits a password manager and keeps nothing;
// the history says waiting or picked up, names a damaged note, marks another
// draft, plays a recording; Delete, Delete all and Discard each ask first, in
// words that name what goes, and none is red; the notes not sent yet say why.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { fire, installDocument, makeEl, document as stubDocument, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { ComponentChild } from 'preact';
import type { HistoryItem } from '../src/history.ts';
import type { NoteBody } from '../src/note.ts';
import { UNLOCK_FIRST } from '../src/notes-session.ts';
import type { NotesSession } from '../src/notes-session.ts';
import { KEPT_MESSAGES } from '../src/outbox.ts';
import type { Pending } from '../src/outbox.ts';
import type { Score } from '../src/score.ts';

installDocument();
// Every key listener the panel puts on the window or the document, so the Escape test can press Escape at each.
const keyListeners: unknown[] = [];
const listen = (type: string, f: unknown): void => { if (type.startsWith('key')) keyListeners.push(f); };
Object.assign(globalThis, { window: { addEventListener: listen, removeEventListener() {} } });
const addToDocument = stubDocument.addEventListener;
stubDocument.addEventListener = (type, f) => { listen(type, f); addToDocument(type, f); };
const ui = await importTsx<{
  unlock: typeof import('../src/ui/UnlockPanel.tsx');
  history: typeof import('../src/ui/History.tsx');
  answers: typeof import('../src/ui/Answers.tsx');
  api: typeof import('../src/api.ts');
}>(import.meta.dirname, { unlock: '../src/ui/UnlockPanel.tsx', history: '../src/ui/History.tsx', answers: '../src/ui/Answers.tsx', api: '../src/api.ts' });

const score = JSON.parse(readFileSync(new URL('./fixtures/score-v1.json', import.meta.url), 'utf8')) as Score;
const button = (root: StubElement, text: string) => walk(root).find(e => e.localName === 'button' && e.textContent === text);
const byAttr = (root: StubElement, name: string, value?: string) => walk(root).find(e => (value === undefined ? e._attrs[name] !== undefined : e._attrs[name] === value));
const settle = async (): Promise<void> => { for (let i = 0; i < 20; i++) await act(async () => { await new Promise(r => setImmediate(r)); }); };
const mount = async (vnode: ComponentChild): Promise<StubElement> => { const root = makeEl('root'); await act(() => { render(vnode, renderTarget(root)); }); return root; };
const body = (extra: Partial<NoteBody> = {}): NoteBody => ({ v: 1, kind: 'text', piece: 'test-piece', draft: 1, from: 8, to: 12, fromBar: 5, toBar: 6, lane: 'brass', text: 'louder here', reaction: null, curve: null, audio: null, made: '2026-10-20T00:00:00.000Z', ...extra });
const item = (c: string, extra: Partial<HistoryItem> = {}, b: Partial<NoteBody> = {}): HistoryItem => ({ id: c.repeat(32), arrived: 1_760_000_000, pickedUp: null, state: 'waiting', opened: { fingerprint: 'ab'.repeat(32), body: body(b), audio: null }, problem: null, ...extra });
const historyProps = (extra: Record<string, unknown> = {}) => ({
  items: [] as HistoryItem[], total: 0, scope: 'piece' as const, onScope: () => {}, version: 1, laneName: (id: string) => (id === 'brass' ? 'Brass' : null),
  numberOf: () => null, answers: () => null, kept: [] as Pending[], busy: false, onDelete: () => {}, onDeleteAll: () => {}, onDiscard: () => {}, onRetry: () => {}, ...extra,
});

test('the unlock form suits a password manager, offers nothing to remember, and clears the field', async () => {
  const calls: string[] = [];
  const root = await mount(h(ui.unlock.UnlockPanel, { busy: false, error: null, onUnlock: (p: string) => calls.push(p) }));
  const pass = byAttr(root, 'autocomplete', 'current-password')!;
  assert.equal(pass._attrs['type'], 'password');
  assert.ok(byAttr(root, 'autocomplete', 'username'));
  assert.equal(walk(root).some(e => e._attrs['type'] === 'checkbox'), false, 'no remember-this-device box');
  assert.doesNotMatch(root.textContent, /remember|forget/i);
  pass.value = 'secret words';
  await act(() => { fire(pass, 'input'); });
  const submit = walk(root).find(e => e.localName === 'button')!;
  assert.equal(submit._attrs['type'], 'submit');
  assert.equal(submit.textContent, 'Unlock notes');
  await act(() => { fire(walk(root).find(e => e.localName === 'form')!, 'submit'); });
  assert.deepEqual(calls, ['secret words']);
  assert.equal(pass.value, '', 'the passphrase does not stay in the page');
});

test('a wrong passphrase is shown, not thrown', async () => {
  const root = await mount(h(ui.unlock.UnlockPanel, { busy: false, error: 'That passphrase did not unlock the key.', onUnlock: () => {} }));
  assert.equal(byAttr(root, 'role', 'alert')!.textContent, 'That passphrase did not unlock the key.');
});

test('each note: when, waiting or picked up, its words, where, another draft, a problem; Delete asks first', async () => {
  const deleted: string[] = [];
  const items = [
    item('a', {}, { draft: 2 }),
    item('b', { state: 'picked-up', pickedUp: 1_760_000_100 }, { kind: 'react', text: null, reaction: 'love-it', lane: null }),
    item('c', { opened: null, problem: 'Could not open this note: it was damaged or changed.' }),
  ];
  const root = await mount(h(ui.history.History, historyProps({ items, total: 3, numberOf: (id: string) => (id === 'a'.repeat(32) ? 4 : null), answers: (id: string) => (id === 'a'.repeat(32) ? 'Answered in this draft: change 1' : null), onDelete: (id: string) => deleted.push(id) })));
  const notes = walk(root).filter(e => e._attrs['data-note'] !== undefined);
  assert.deepEqual(notes.map(n => byAttr(n, 'data-state')!.textContent), ['Waiting', 'Picked up', 'Waiting']);
  assert.match(notes[0]!.textContent, /#4/);
  assert.match(notes[0]!.textContent, /louder here/);
  assert.match(notes[0]!.textContent, /Bars 5–6 · 8 s – 12 s · Brass · draft 2/);
  assert.match(notes[0]!.textContent, /Answered in this draft: change 1/);
  assert.match(notes[1]!.textContent, /Reaction: Love it/);
  assert.match(notes[2]!.textContent, /it was damaged or changed/);
  const del = walk(notes[2]!).find(e => e.localName === 'button')!;
  assert.equal(del.textContent, 'Delete');
  assert.match(del._attrs['aria-label'] ?? '', /^Delete note from /);
  await act(() => { fire(del, 'click'); });
  assert.deepEqual(deleted, [], 'one tap only asks');
  assert.match(notes[2]!.textContent, /Delete this note\? This cannot be undone\./);
  await act(() => { fire(button(notes[2]!, 'Keep it')!, 'click'); });
  assert.deepEqual(deleted, []);
  assert.doesNotMatch(notes[2]!.textContent, /cannot be undone/);
  await act(() => { fire(button(notes[2]!, 'Delete')!, 'click'); });
  await act(() => { fire(button(notes[2]!, 'Delete it')!, 'click'); });
  assert.deepEqual(deleted, ['c'.repeat(32)]);
});

test('a recording plays from a blob: URL', async () => {
  const audio = new Uint8Array([1, 2, 3]);
  const items = [item('d', { opened: { fingerprint: 'ab'.repeat(32), body: body({ kind: 'hum', text: null, audio: { mime: 'audio/mp4', seconds: 2 } }), audio } })];
  const root = await mount(h(ui.history.History, historyProps({ items, total: 1 })));
  await settle();
  const player = byAttr(root, 'data-note-audio')!;
  assert.equal(player.localName, 'audio');
  assert.match(player._attrs['src'] ?? (player as unknown as { src: string }).src, /^blob:/);
});

test('Delete all asks first, names the count on its button, and says it is every piece', async () => {
  let all = 0;
  const root = await mount(h(ui.history.History, historyProps({ items: [item('a'), item('b')], total: 12, onDeleteAll: () => all++ })));
  await act(() => { fire(button(root, 'Delete all')!, 'click'); });
  assert.equal(all, 0);
  assert.match(root.textContent, /Delete all 12 notes, on every piece\? This cannot be undone\./);
  await act(() => { fire(button(root, 'Keep them')!, 'click'); });
  assert.doesNotMatch(root.textContent, /cannot be undone/);
  await act(() => { fire(button(root, 'Delete all')!, 'click'); });
  await act(() => { fire(button(root, 'Delete all 12 notes')!, 'click'); });
  assert.equal(all, 1);
});

test('nothing in the notes panel is red: destructive actions are plain buttons with explicit words', async () => {
  const pending: Pending[] = [{ key: 'k1', bundle: new Uint8Array(1), made: '2026-10-20T00:00:00.000Z', reason: 'offline' }];
  const root = await mount(h(ui.history.History, historyProps({ items: [item('a')], total: 3, kept: pending })));
  await act(() => { fire(button(root, 'Delete all')!, 'click'); });
  await act(() => { fire(button(root, 'Delete')!, 'click'); });
  await act(() => { fire(button(root, 'Discard')!, 'click'); });
  assert.ok(button(root, 'Delete all 3 notes') && button(root, 'Delete it') && button(root, 'Discard this note'));
  assert.doesNotMatch(walk(root).map(e => e._attrs['class'] ?? '').join(' '), /record/, 'red is the colour of recording');
});

test('the scope chips switch between this piece and all pieces', async () => {
  const picked: string[] = [];
  const root = await mount(h(ui.history.History, historyProps({ onScope: (s: string) => picked.push(s) })));
  assert.match(root.textContent, /No notes on this piece yet\./);
  assert.equal(button(root, 'This piece')!._attrs['aria-pressed'], 'true');
  fire(button(root, 'All pieces')!, 'click');
  assert.deepEqual(picked, ['all']);
});

test('notes not sent yet say why; Discard asks first; Try again flushes', async () => {
  const discarded: string[] = [];
  let retries = 0;
  const kept: Pending[] = [{ key: 'k1', bundle: new Uint8Array(1), made: '2026-10-20T00:00:00.000Z', reason: 'offline' }, { key: 'k2', bundle: new Uint8Array(1), made: '2026-10-20T00:00:01.000Z', reason: 'new' }];
  const root = await mount(h(ui.history.Kept, { kept, busy: false, onDiscard: (k: string) => discarded.push(k), onRetry: () => retries++ }));
  assert.match(root.textContent, /Not sent yet/);
  assert.ok(root.textContent.includes(KEPT_MESSAGES.offline));
  assert.match(root.textContent, /Sending…/);
  const first = walk(root).find(e => e._attrs['data-kept-note'] === 'k1')!;
  await act(() => { fire(walk(first).find(e => e.localName === 'button' && e.textContent === 'Discard')!, 'click'); });
  assert.deepEqual(discarded, []);
  await act(() => { fire(button(root, 'Discard this note')!, 'click'); });
  assert.deepEqual(discarded, ['k1']);
  fire(button(root, 'Try again')!, 'click');
  assert.equal(retries, 1);
});

test('the questions that ask before deleting or discarding take no Escape: the question stays until it is answered', async () => {
  const calls: string[] = [];
  const kept: Pending[] = [{ key: 'k1', bundle: new Uint8Array(1), made: '2026-10-20T00:00:00.000Z', reason: 'offline' }];
  const root = await mount(h(ui.history.History, historyProps({ items: [item('a')], total: 4, kept, onDelete: () => calls.push('delete'), onDeleteAll: () => calls.push('all'), onDiscard: () => calls.push('discard') })));
  await act(() => { fire(button(root, 'Delete all')!, 'click'); });
  await act(() => { fire(button(root, 'Delete')!, 'click'); });
  await act(() => { fire(button(root, 'Discard')!, 'click'); });
  assert.equal(walk(root).filter(e => e._attrs['role'] === 'group' && /^Delete/.test(e._attrs['aria-label'] ?? '')).length, 2, 'both questions are open');
  let taken = 0;
  for (const el of [root, ...walk(root)]) for (const type of ['keydown', 'keyup', 'keypress']) fire(el, type, { key: 'Escape', code: 'Escape', keyCode: 27, preventDefault: () => { taken++; }, stopPropagation: () => { taken++; } });
  for (const f of keyListeners) {
    const ev = { type: 'keydown', key: 'Escape', preventDefault: () => { taken++; }, stopPropagation: () => { taken++; } };
    (f as (e: typeof ev) => void)(ev);
  }
  assert.equal(taken, 0);
  assert.ok(button(root, 'Delete all 4 notes') && button(root, 'Delete it') && button(root, 'Discard this note'), 'the questions are still open');
  assert.deepEqual(calls, []);
});

function fakeSession(over: Partial<NotesSession> = {}): NotesSession & { calls: string[] } {
  const calls: string[] = [];
  let open = false;
  return {
    calls,
    hasKeyring: async () => true,
    unlocked: () => open,
    unlock: async p => { calls.push(`unlock ${p}`); if (p !== 'right') return 'That passphrase did not unlock the key.'; open = true; return null; },
    history: async () => { calls.push('history'); return [item('a'), item('e', {}, { piece: 'other-piece' })]; },
    send: async () => ({ key: 'k', memoryOnly: false, sent: [], kept: [] }),
    flush: async () => { calls.push('flush'); return { sent: [], kept: [] }; },
    kept: async () => [],
    discard: async () => {},
    remove: async id => { calls.push(`remove ${id[0]}`); },
    removeAll: async () => 2,
    lock() {},
    ...over,
  };
}

test('the notes panel: locked it asks for the passphrase (and says why when a composer asked) and lists nothing; unlocked it lists this piece', async () => {
  const notes = fakeSession();
  const seen: number[] = [];
  let unlockedCalls = 0;
  const root = await mount(h(ui.answers.Answers, { notes, score, version: 1, refresh: 0, ask: UNLOCK_FIRST, onUnlocked: () => unlockedCalls++, onItems: (i: readonly HistoryItem[]) => seen.push(i.length) }));
  await settle();
  assert.equal(byAttr(root, 'aria-label', 'Notes & answers')!.localName, 'section', 'the panel is "Notes & answers", not the name of the note box');
  assert.ok(byAttr(root, 'autocomplete', 'current-password'));
  assert.equal(byAttr(root, 'data-unlock-reason')!.textContent, UNLOCK_FIRST, 'the reason sits above the form');
  assert.doesNotMatch(root.textContent, /Waiting|Picked up|Delete all/);
  assert.deepEqual(notes.calls, ['flush'], 'the outbox is flushed on mount; nothing is listed before an unlock');
  const pass = byAttr(root, 'autocomplete', 'current-password')!;
  pass.value = 'wrong';
  await act(() => { fire(pass, 'input'); });
  await act(() => { fire(walk(root).find(e => e.localName === 'form')!, 'submit'); });
  await settle();
  assert.match(root.textContent, /did not unlock the key/);
  assert.equal(unlockedCalls, 0);
  pass.value = 'right';
  await act(() => { fire(pass, 'input'); });
  await act(() => { fire(walk(root).find(e => e.localName === 'form')!, 'submit'); });
  await settle();
  assert.equal(unlockedCalls, 1, 'the Workroom hears of the unlock');
  assert.equal(byAttr(root, 'data-unlock-reason'), undefined);
  assert.equal(walk(root).filter(e => e._attrs['data-note'] !== undefined).length, 1, 'this piece only');
  assert.deepEqual(seen, [2], 'the Workroom gets every note, for the timeline');
  await act(() => { fire(walk(root).find(e => e.localName === 'button' && e.textContent === 'Delete')!, 'click'); });
  await act(() => { fire(button(root, 'Delete it')!, 'click'); });
  await settle();
  assert.ok(notes.calls.includes('remove a'));
});

test('a sign-in that ended locks the notes and brings the unlock form back', async () => {
  const { SignedOut } = ui.api; // the copy the components bundle, so instanceof agrees
  let locks = 0;
  let open = true;
  const notes = fakeSession({ unlocked: () => open, lock: () => { locks++; open = false; }, history: async () => { throw new SignedOut(); } });
  const root = await mount(h(ui.answers.Answers, { notes, score, version: 1, refresh: 0, ask: null, onUnlocked: () => {}, onItems: () => {} }));
  await settle();
  assert.equal(locks, 1);
  assert.ok(byAttr(root, 'autocomplete', 'current-password'), 'the unlock form is back');
  assert.match(root.textContent, /Your sign-in ended/);
});

test('an unlock overtaken by a lock does not open the panel', async () => {
  let unlockedCalls = 0;
  const notes = fakeSession({ unlock: async () => null });
  const root = await mount(h(ui.answers.Answers, { notes, score, version: 1, refresh: 0, ask: null, onUnlocked: () => unlockedCalls++, onItems: () => {} }));
  await settle();
  const pass = byAttr(root, 'autocomplete', 'current-password')!;
  pass.value = 'x';
  await act(() => { fire(pass, 'input'); });
  await act(() => { fire(walk(root).find(e => e.localName === 'form')!, 'submit'); });
  await settle();
  assert.equal(unlockedCalls, 0);
  assert.ok(byAttr(root, 'autocomplete', 'current-password'));
});
