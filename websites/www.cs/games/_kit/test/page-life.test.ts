// websites/www.cs/games/_kit/test/page-life.test.ts
// A game follows its page: hidden, frozen or leaving calls `hide`, visible
// again calls `show`, and a page that is gone for good also calls `close`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { followPage } from '../page-life.ts';

function rig(state = 'visible') {
  const handlers: Record<string, (e: unknown) => void> = {};
  const doc = { visibilityState: state, addEventListener: (t: string, h: (e: unknown) => void) => { handlers['d:' + t] = h; } };
  const win = { addEventListener: (t: string, h: (e: unknown) => void) => { handlers['w:' + t] = h; } };
  const log: string[] = [];
  followPage({ doc, win }, { hide: () => log.push('hide'), show: () => log.push('show'), close: () => log.push('close') });
  return { doc, handlers, log };
}

test('hidden hides, visible shows', () => {
  const { doc, handlers, log } = rig();
  doc.visibilityState = 'hidden';
  handlers['d:visibilitychange']!({});
  doc.visibilityState = 'visible';
  handlers['d:visibilitychange']!({});
  assert.deepEqual(log, ['hide', 'show']);
});

test('freeze and resume, pagehide and pageshow', () => {
  const { handlers, log } = rig();
  handlers['d:freeze']!({});
  handlers['d:resume']!({});
  handlers['w:pagehide']!({ persisted: true });
  handlers['w:pageshow']!({});
  assert.deepEqual(log, ['hide', 'show', 'hide', 'show']);
});

test('a page gone for good closes after hiding', () => {
  const { handlers, log } = rig();
  handlers['w:pagehide']!({ persisted: false });
  assert.deepEqual(log, ['hide', 'close']);
});

test('a show while the document is still hidden does nothing', () => {
  const { doc, handlers, log } = rig();
  doc.visibilityState = 'hidden';
  handlers['w:pageshow']!({});
  assert.deepEqual(log, []);
});

test('a page that starts hidden hides at once', () => {
  assert.deepEqual(rig('hidden').log, ['hide']);
});
