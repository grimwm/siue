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
const onlineListeners: (() => void)[] = [];
const listen = (type: string, f: unknown): void => { if (type.startsWith('key')) keyListeners.push(f); if (type === 'online') onlineListeners.push(f as () => void); };
Object.assign(globalThis, { window: { addEventListener: listen, removeEventListener() {} } });
const addToDocument = stubDocument.addEventListener;
stubDocument.addEventListener = (type, f) => { listen(type, f); addToDocument(type, f); };
const ui = await importTsx<{
  unlock: typeof import('../src/ui/UnlockPanel.tsx');
  history: typeof import('../src/ui/History.tsx');
  answers: typeof import('../src/ui/Answers.tsx');
  index: typeof import('../src/ui/PiecesIndex.tsx');
  api: typeof import('../src/api.ts');
}>(import.meta.dirname, { unlock: '../src/ui/UnlockPanel.tsx', history: '../src/ui/History.tsx', answers: '../src/ui/Answers.tsx', index: '../src/ui/PiecesIndex.tsx', api: '../src/api.ts' });

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
    memoryOnly: () => false,
    unreadable: () => 0,
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

test('a lock that overtakes the history in flight leaves the unlock form, not the unopened notes', async () => {
  let open = true;
  const seen: number[] = [];
  const notes = fakeSession({ unlocked: () => open, history: async () => { open = false; return [item('a')]; } });
  const root = await mount(h(ui.answers.Answers, { notes, score, version: 1, refresh: 0, ask: null, onUnlocked: () => {}, onItems: (i: readonly HistoryItem[]) => seen.push(i.length) }));
  await settle();
  assert.ok(byAttr(root, 'autocomplete', 'current-password'), 'the unlock form is up');
  assert.equal(walk(root).some(e => e._attrs['data-note'] !== undefined), false);
  assert.deepEqual(seen, []);
});

test('opening the panel loads the notes once', async () => {
  const notes = fakeSession({ unlocked: () => true });
  await mount(h(ui.answers.Answers, { notes, score, version: 1, refresh: 0, ask: null, onUnlocked: () => {}, onItems: () => {} }));
  await settle();
  assert.equal(notes.calls.filter(c => c === 'history').length, 1);
});

/** Counts the promise rejections nobody handled while `work` runs. */
async function unhandledDuring(work: () => Promise<void>): Promise<number> {
  let n = 0;
  const count = (): void => { n++; };
  process.on('unhandledRejection', count);
  try { await work(); await settle(); } finally { process.off('unhandledRejection', count); }
  return n;
}

test('a store that cannot list the notes not sent yet still lets the panel load the history', async () => {
  const notes = fakeSession({ unlocked: () => true, kept: async () => { throw new DOMException('The connection is closing.', 'InvalidStateError'); } });
  let root: StubElement | null = null;
  const unhandled = await unhandledDuring(async () => {
    root = await mount(h(ui.answers.Answers, { notes, score, version: 1, refresh: 0, ask: null, onUnlocked: () => {}, onItems: () => {} }));
  });
  assert.equal(unhandled, 0);
  assert.equal(notes.calls.filter(c => c === 'history').length, 1, 'the history is loaded');
  assert.equal(walk(root!).filter(e => e._attrs['data-note'] !== undefined).length, 1);
});

test('on the pieces list, a Discard that fails says so in plain words and lists the notes not sent yet again', async () => {
  const waiting: Pending = { key: 'k1', bundle: new Uint8Array([1]), made: '2026-10-20T00:00:00.000Z', reason: 'offline' };
  let listed = 0;
  const notes = fakeSession({ kept: async () => { listed++; return [waiting]; }, discard: async () => { throw new DOMException('The connection is closing.', 'InvalidStateError'); } });
  let root: StubElement | null = null;
  const unhandled = await unhandledDuring(async () => {
    root = await mount(h(ui.index.PiecesIndex, { notes, list: makeEl('ol') as unknown as ParentNode }));
    await settle();
    await act(() => { fire(button(root!, 'Discard')!, 'click'); });
    await act(() => { fire(walk(root!).filter(e => e.localName === 'button' && /^Discard/.test(e.textContent)).at(-1)!, 'click'); });
  });
  assert.equal(unhandled, 0);
  assert.ok(listed >= 2, 'listed again after the failure');
  assert.ok(walk(root!).some(e => e._attrs['role'] === 'alert' && /could not be discarded/i.test(e.textContent) && !/reach the server/i.test(e.textContent)), 'a plain message');
});

const alerts = (root: StubElement): string => walk(root).filter(e => e._attrs['role'] === 'alert').map(e => e.textContent).join(' | ');
const unlockWith = async (root: StubElement, pass: string): Promise<void> => {
  const field = byAttr(root, 'autocomplete', 'current-password')!;
  field.value = pass;
  await act(() => { fire(field, 'input'); });
  await act(() => { fire(walk(root).find(e => e.localName === 'form')!, 'submit'); });
  await settle();
};

test('the notes panel says the server answered with an error, with its status, not that it could not be reached', async () => {
  const { ServerError } = ui.api;
  const notes = fakeSession({ unlocked: () => true, history: async () => { throw new ServerError(503); } });
  const root = await mount(h(ui.answers.Answers, { notes, score, version: 1, refresh: 0, ask: null, onUnlocked: () => {}, onItems: () => {} }));
  await settle();
  assert.match(alerts(root), /503/);
  assert.doesNotMatch(alerts(root), /reach the server/);
});

test('the notes panel says how many listed notes it could not read, and a failed Discard says it could not be discarded', async () => {
  const waiting: Pending = { key: 'k1', bundle: new Uint8Array([1]), made: '2026-10-20T00:00:00.000Z', reason: 'offline' };
  const notes = fakeSession({ unlocked: () => true, unreadable: () => 2, kept: async () => [waiting], discard: async () => { throw new DOMException('closing', 'InvalidStateError'); } });
  const root = await mount(h(ui.answers.Answers, { notes, score, version: 1, refresh: 0, ask: null, onUnlocked: () => {}, onItems: () => {} }));
  await settle();
  assert.match(alerts(root), /2 notes .*could not be read/);
  await act(() => { fire(button(root, 'Discard')!, 'click'); });
  await act(() => { fire(walk(root).filter(e => e.localName === 'button' && /^Discard/.test(e.textContent)).at(-1)!, 'click'); });
  await settle();
  assert.match(alerts(root), /could not be discarded/);
  assert.doesNotMatch(alerts(root), /reach the server/);
});

test('on the pieces list, a recount that fails after an unlock keeps the unlock form away and says why', async () => {
  const { ServerError } = ui.api;
  const notes = fakeSession({ history: async () => { throw new ServerError(500); } });
  const root = await mount(h(ui.index.PiecesIndex, { notes, list: makeEl('ol') as unknown as ParentNode }));
  await settle();
  await unlockWith(root, 'right');
  assert.equal(byAttr(root, 'autocomplete', 'current-password'), undefined, 'the notes are unlocked, so the form is gone');
  assert.match(alerts(root), /500/);
  assert.doesNotMatch(alerts(root), /reach the server/);
});

test('on the pieces list, a recount after a flush that fails says so, and the counts are tried again after the next flush', async () => {
  const { ServerError } = ui.api;
  let failing = false;
  let flushes = 0;
  const notes = fakeSession({ flush: async () => { flushes++; return { sent: [], kept: [] }; }, history: async () => { if (failing) throw new ServerError(502); return [item('a')]; } });
  const root = await mount(h(ui.index.PiecesIndex, { notes, list: makeEl('ol') as unknown as ParentNode }));
  await settle();
  await unlockWith(root, 'right');
  assert.equal(alerts(root), '');
  failing = true;
  await act(() => { onlineListeners.at(-1)!(); });
  await settle();
  assert.ok(flushes >= 2);
  assert.match(alerts(root), /502/);
  failing = false;
  await act(() => { onlineListeners.at(-1)!(); });
  await settle();
  assert.equal(alerts(root), '', 'a recount that works clears the message');
});

test('on the pieces list, notes the page could not read are counted in a message', async () => {
  const notes = fakeSession({ unreadable: () => 1 });
  const root = await mount(h(ui.index.PiecesIndex, { notes, list: makeEl('ol') as unknown as ParentNode }));
  await settle();
  await unlockWith(root, 'right');
  assert.match(alerts(root), /1 note .*could not be read/);
});

const flush = async (): Promise<void> => { await settle(); await settle(); };
const unlockedPieces = async (over: Partial<NotesSession>) => {
  const notes = fakeSession(over);
  const root = await mount(h(ui.index.PiecesIndex, { notes, list: makeEl('ol') as unknown as ParentNode }));
  await settle();
  await unlockWith(root, 'right');
  assert.equal(alerts(root), '', 'nothing to say before the action');
  return { notes, root };
};

test('pieces list, unlocked: a failed Discard, Try again or flush still shows after the reload that follows it', async () => {
  const waiting: Pending = { key: 'k1', bundle: new Uint8Array([1]), made: '2026-10-20T00:00:00.000Z', reason: 'offline' };
  const { ServerError } = ui.api;
  const discarding = await unlockedPieces({ kept: async () => [waiting], discard: async () => { throw new DOMException('closing', 'InvalidStateError'); } });
  await act(() => { fire(button(discarding.root, 'Discard')!, 'click'); });
  await act(() => { fire(walk(discarding.root).filter(e => e.localName === 'button' && /^Discard/.test(e.textContent)).at(-1)!, 'click'); });
  await flush();
  assert.ok(discarding.notes.calls.filter(c => c === 'history').length >= 2, 'the counts were reloaded');
  assert.match(alerts(discarding.root), /could not be discarded/);
  let flushes = 0;
  const retrying = await unlockedPieces({ kept: async () => [waiting], flush: async () => { if (++flushes > 1) throw new ServerError(503); return { sent: [], kept: [] }; } });
  await act(() => { fire(button(retrying.root, 'Try again')!, 'click'); });
  await flush();
  assert.match(alerts(retrying.root), /503/);
});

test('notes panel, unlocked: a failed Delete, Delete all, Discard or Try again still shows after the reload that follows it', async () => {
  const waiting: Pending = { key: 'k1', bundle: new Uint8Array([1]), made: '2026-10-20T00:00:00.000Z', reason: 'offline' };
  const { ServerError } = ui.api;
  const fails = async (over: Partial<NotesSession>, click: (root: StubElement) => Promise<void>, expected: RegExp): Promise<void> => {
    const notes = fakeSession({ unlocked: () => true, kept: async () => [waiting], ...over });
    const root = await mount(h(ui.answers.Answers, { notes, score, version: 1, refresh: 0, ask: null, onUnlocked: () => {}, onItems: () => {} }));
    await settle();
    assert.equal(alerts(root), '');
    const before = notes.calls.filter(c => c === 'history').length;
    await click(root);
    await flush();
    assert.ok(notes.calls.filter(c => c === 'history').length > before, 'the history was reloaded');
    assert.match(alerts(root), expected);
  };
  const press = async (root: StubElement, ...labels: string[]): Promise<void> => { for (const l of labels) await act(() => { fire(button(root, l)!, 'click'); }); };
  await fails({ remove: async () => { throw new ServerError(500); } }, root => press(root, 'Delete', 'Delete it'), /500/);
  await fails({ removeAll: async () => { throw new ServerError(502); } }, root => press(root, 'Delete all', 'Delete all 2 notes'), /502/);
  await fails({ flush: async () => { throw new ServerError(503); } }, root => press(root, 'Try again'), /503/);
  await fails({ discard: async () => { throw new DOMException('closing', 'InvalidStateError'); } }, async root => {
    await press(root, 'Discard');
    await act(() => { fire(walk(root).filter(e => e.localName === 'button' && /^Discard/.test(e.textContent)).at(-1)!, 'click'); });
  }, /could not be discarded/);
});

const general = (c: string, text: string, extra: Partial<HistoryItem> = {}): HistoryItem => item(c, extra, { piece: 'general', draft: 1, from: 0, to: 0, fromBar: null, toBar: null, lane: null, text });
const generalPanel = (notes: NotesSession, extra: Record<string, unknown> = {}) => h(ui.answers.Answers, { notes, score: null, version: 1, refresh: 0, ask: null, onUnlocked: () => {}, onItems: () => {}, ...extra });

test('general notes: the unlock form says what unlocking gives on the front page', async () => {
  const root = await mount(generalPanel(fakeSession()));
  await settle();
  assert.match(root.textContent, /general notes/);
  assert.match(root.textContent, /how many notes wait/);
  assert.doesNotMatch(root.textContent, /Unlock to write and read your notes\./);
});

test('general notes: unlocked, only the general notes are listed, without piece scope chips, a span or Delete all', async () => {
  const notes = fakeSession({ unlocked: () => true, history: async () => [general('a', 'play the theme again'), item('b'), general('c', 'shorter intro')] });
  const root = await mount(generalPanel(notes));
  await settle();
  const listed = walk(root).filter(e => e._attrs['data-note'] !== undefined);
  assert.equal(listed.length, 2);
  assert.match(root.textContent, /play the theme again/);
  assert.doesNotMatch(root.textContent, /louder here/, 'a note on a piece is not a general note');
  assert.doesNotMatch(root.textContent, /This piece|All pieces|Delete all|0:00|draft/);
  assert.match(root.textContent, /General/);
  assert.ok(button(root, 'Delete'), 'one note can still be deleted');
});

test('general notes: with none yet, the list says so', async () => {
  const root = await mount(generalPanel(fakeSession({ unlocked: () => true, history: async () => [item('b')] })));
  await settle();
  assert.match(root.textContent, /No general notes yet\./);
});

test('general notes: writing one seals a text note on the general piece, says it is sent, clears the box and reloads the list', async () => {
  const sent: NoteBody[] = [];
  const notes = fakeSession({ unlocked: () => true, send: async b => { sent.push(b); return { key: 'k', memoryOnly: false, sent: [{ key: 'k', id: 'a'.repeat(32) }], kept: [] }; } });
  const root = await mount(generalPanel(notes));
  await settle();
  const box = walk(root).find(e => e.localName === 'textarea')!;
  box.value = '  more brass in the finale  ';
  await act(() => { fire(box, 'input'); });
  await act(() => { fire(button(root, 'Send note')!, 'click'); });
  await settle();
  assert.equal(sent.length, 1);
  assert.equal(sent[0]!.piece, 'general');
  assert.equal(sent[0]!.text, 'more brass in the finale');
  assert.match(root.textContent, /Sent\. It is waiting for pickup\./);
  assert.equal(walk(root).find(e => e.localName === 'textarea')!.value, '');
  assert.equal(notes.calls.filter(c => c === 'history').length, 2, 'the list was loaded again');
});

test('general notes: an empty note is refused in words, a note kept on this device says why, and a failed seal keeps the words', async () => {
  let mode: 'kept' | 'fail' = 'kept';
  const notes = fakeSession({ unlocked: () => true, send: async () => {
    if (mode === 'fail') throw new Error('This note could not be sealed here.');
    return { key: 'k', memoryOnly: false, sent: [], kept: [{ key: 'k', reason: 'offline' }] };
  } });
  const root = await mount(generalPanel(notes));
  await settle();
  const type = async (text: string): Promise<void> => { const box = walk(root).find(e => e.localName === 'textarea')!; box.value = text; await act(() => { fire(box, 'input'); }); };
  await act(() => { fire(button(root, 'Send note')!, 'click'); });
  assert.match(root.textContent, /Type a note first/);
  await type('hello');
  await act(() => { fire(button(root, 'Send note')!, 'click'); });
  await settle();
  assert.match(root.textContent, /kept on this device/);
  mode = 'fail';
  await type('again');
  await act(() => { fire(button(root, 'Send note')!, 'click'); });
  await settle();
  assert.match(root.textContent, /could not be sealed/);
  assert.equal(walk(root).find(e => e.localName === 'textarea')!.value, 'again');
});

test('general notes: locked, there is no box to write in', async () => {
  const root = await mount(generalPanel(fakeSession()));
  await settle();
  assert.equal(walk(root).some(e => e.localName === 'textarea'), false);
});

test('the front page is the general notes panel: it unlocks, fills the per-piece counts from every note, and keeps the counts hint', async () => {
  const notes = fakeSession();
  const list = makeEl('ol');
  const root = await mount(h(ui.index.PiecesIndex, { notes, list: list as unknown as ParentNode }));
  await settle();
  assert.ok(byAttr(root, 'data-pieces-notes'), 'the panel keeps its marker');
  await unlockWith(root, 'right');
  assert.match(root.textContent, /Each piece shows how many of your notes wait for pickup\./);
  assert.ok(walk(root).some(e => e.localName === 'textarea'), 'and the general box is there');
});
