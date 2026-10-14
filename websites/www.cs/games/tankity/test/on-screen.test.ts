// Which room each tab shows (src/on-screen.ts), shared over BroadcastChannel
// or, without one, a localStorage key and its storage events, so no tab
// toasts a room another tab is showing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { StorageLike } from '../../_kit/ports.ts';
import { createOnScreen, ON_SCREEN_KEY, ON_SCREEN_STALE_MS } from '../src/on-screen.ts';
import type { ChannelLike } from '../src/on-screen.ts';

function bus() {
  const members: ChannelLike[] = [];
  return {
    open(): ChannelLike {
      const ch: ChannelLike = { onmessage: null, postMessage(m) { for (const o of members) if (o !== ch && o.onmessage) o.onmessage({ data: m }); } };
      members.push(ch);
      return ch;
    },
  };
}
function sharedStorage() {
  const m = new Map<string, string>();
  const listeners: Array<{ owner: StorageLike; fn: (key: string | null) => void }> = [];
  const view = (): StorageLike => ({
    getItem: k => m.get(k) ?? null,
    setItem(k, v) { m.set(k, String(v)); for (const l of listeners) if (l.owner !== this) l.fn(k); },
    removeItem: k => { m.delete(k); },
  });
  return { view, listen: (owner: StorageLike, fn: (key: string | null) => void) => { listeners.push({ owner, fn }); } };
}

test('over a BroadcastChannel: another tab showing a room is known until it moves on or goes quiet', () => {
  let now = 1000;
  const b = bus();
  const a = createOnScreen({ tab: 'a', now: () => now, channel: b.open(), storage: null, listen: () => {} });
  const c = createOnScreen({ tab: 'c', now: () => now, channel: b.open(), storage: null, listen: () => {} });
  a.set('7K2Q');
  assert.equal(c.elsewhere('7K2Q'), true);
  assert.equal(a.elsewhere('7K2Q'), false, 'a tab is not elsewhere to itself');
  assert.equal(c.elsewhere('AB3D'), false);
  now += ON_SCREEN_STALE_MS + 1;
  assert.equal(c.elsewhere('7K2Q'), false, 'a tab that stopped reporting is forgotten');
  a.set('7K2Q');
  a.set('');
  assert.equal(c.elsewhere('7K2Q'), false);
});

test('without BroadcastChannel: the localStorage key and its storage events carry it', () => {
  let now = 1000;
  const s = sharedStorage();
  const sa = s.view(), sc = s.view();
  let cListener: ((key: string | null) => void) | null = null;
  const a = createOnScreen({ tab: 'a', now: () => now, channel: null, storage: sa, listen: fn => s.listen(sa, fn) });
  const c = createOnScreen({ tab: 'c', now: () => now, channel: null, storage: sc, listen: fn => { cListener = fn; s.listen(sc, fn); } });
  a.set('7K2Q');
  assert.ok(sa.getItem(ON_SCREEN_KEY));
  assert.equal(c.elsewhere('7K2Q'), true);
  c.set('AB3D');
  assert.equal(a.elsewhere('AB3D'), true);
  assert.equal(a.elsewhere('7K2Q'), false);
  assert.ok(cListener);
});

test('storage that throws or holds junk never throws', () => {
  const bad = { getItem: () => { throw new Error('no'); }, setItem: () => { throw new Error('no'); }, removeItem() {} };
  const t = createOnScreen({ tab: 'a', now: () => 1, channel: null, storage: bad, listen: () => {} });
  t.set('7K2Q');
  assert.equal(t.elsewhere('7K2Q'), false);
  const junk = { getItem: () => '{nope', setItem() {}, removeItem() {} };
  const u = createOnScreen({ tab: 'b', now: () => 1, channel: null, storage: junk, listen: () => {} });
  assert.equal(u.elsewhere('7K2Q'), false);
});
