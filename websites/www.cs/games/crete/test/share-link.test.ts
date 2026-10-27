// Share links: a level, its proof and its author in a URL fragment. Link text is untrusted, so each bad link must
// come back as a named error and never throw.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeLink, decodeLink, LINK_MESSAGES, ENCODED_MAX, DECODED_MAX, MAX_LINE, LINK_VERSION } from '../src/share/link.ts';
import { levelCode, sharedName } from '../src/share/name.ts';
import { openLink } from '../src/share/open.ts';
import { solve } from '../src/puzzle/solver.ts';
import { initial } from '../src/puzzle/state.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import { TRIALS } from '../src/puzzle/trials.ts';
import { lineText, lineOf } from '../src/puzzle/cache.ts';
import { TERRAIN, OBJECTS, HAZARDS } from '../src/puzzle/tiles.ts';
import { mulberry32, hashSeed } from '../../_kit/rng.ts';

/** The level text a link carries: serialize's output with no title, intro or pages. */
const canonical = (raw: string) => serialize({ ...parse(raw), title: '', intro: '' });

/** Every terrain, object and hazard (each facing), every machine template, P and M. */
function everyPiece(): string {
  const chars = [
    ...Object.values(TERRAIN).map(d => d.char).filter(c => c !== 'C'),
    ...Object.values(OBJECTS).map(d => d.char).filter(c => c !== 'p'),
    'o', 'o', 'w', 'e', 'C', 'C', 'C', 'C', 'M', 'P', '*',
  ];
  while (chars.length % 8 !== 0) chars.push('.');
  const rows: string[] = [];
  for (let i = 0; i < chars.length; i += 8) rows.push(chars.slice(i, i + 8).join(''));
  const head = ['hearts: 5', 'relics: 1', 'facing: up down left right', 'machines: block-up ball-down glider-left fireball-right'];
  return canonical(`${head.join('\n')}\n\n${rows.join('\n')}\n`);
}

const SMALL = canonical('title: x\nintro: y\n\n#####\n#P.E#\n#####\n');

/** A link built by hand from payload text, as another program might write one. */
async function pack(payload: string, version = LINK_VERSION): Promise<string> {
  const cs = new CompressionStream('deflate-raw');
  const w = cs.writable.getWriter();
  void w.write(new TextEncoder().encode(payload));
  void w.close();
  const bytes = new Uint8Array(await new Response(cs.readable).arrayBuffer());
  return `${version}.${Buffer.from(bytes).toString('base64url')}`;
}
const payloadOf = (text: string, by = 'WGR', line = 'rr', best = '') => `by: ${by}\n${best}line: ${line}\n\n${text}`;
const errorOf = async (fragment: string) => {
  const r = await decodeLink(fragment);
  assert.equal(r.ok, false);
  return r.ok ? null : r.error;
};

test('round trip keeps every piece', async () => {
  const text = everyPiece();
  assert.equal(parse(text).hearts, 5);
  assert.equal(parse(text).relics, 1);
  const line = lineOf('rrdluwzxc')!;
  const fragment = await encodeLink({ text, line, initials: 'WGR', best: 54 });
  assert.match(fragment, /^L1\.[A-Za-z0-9_-]+$/);
  const r = await decodeLink(fragment);
  assert.ok(r.ok);
  assert.equal(r.shared.text, text);
  assert.deepEqual(r.shared.line, line);
  assert.equal(r.shared.initials, 'WGR');
  assert.equal(r.shared.best, 54);
  assert.equal(r.shared.level.hearts, 5);
  const none = await decodeLink(await encodeLink({ text, line, initials: 'ABC', best: null }));
  assert.ok(none.ok);
  assert.equal(none.shared.best, null);
});

test('round trip at 64 x 64', async () => {
  const row = (r: number) => (r === 0 || r === 63 ? '#'.repeat(64) : r === 1 ? `#P${'.'.repeat(61)}#` : `#${'.'.repeat(62)}#`);
  const text = canonical(`\n${Array.from({ length: 64 }, (_, r) => row(r)).join('\n')}\n`);
  const r = await decodeLink(await encodeLink({ text, line: [], initials: 'WGR', best: null }));
  assert.ok(r.ok);
  assert.equal(r.shared.level.rows, 64);
  assert.equal(r.shared.level.cols, 64);
  assert.equal(r.shared.text, text);
});

test('the worst case fits', async () => {
  const rng = mulberry32(hashSeed('crete worst case'));
  const legend = [
    ...Object.values(TERRAIN).map(d => d.char), ...Object.values(OBJECTS).map(d => d.char),
    ...Object.values(HAZARDS).map(d => d.char), 'M',
  ];
  const at = Math.floor(rng() * 4096);
  const grid: string[] = [];
  for (let r = 0; r < 64; r++) {
    let row = '';
    for (let c = 0; c < 64; c++) row += r * 64 + c === at ? 'P' : legend[Math.floor(rng() * legend.length)];
    grid.push(row);
  }
  const text = `title: \nintro: \n\n${grid.join('\n')}\n`;
  const alphabet = 'udlrwzxc';
  let letters = '';
  for (let i = 0; i < MAX_LINE; i++) letters += alphabet[Math.floor(rng() * alphabet.length)];
  const fragment = await encodeLink({ text, line: lineOf(letters)!, initials: 'WGR', best: 99_999 });
  assert.ok(fragment.length - 'L1.'.length <= ENCODED_MAX, `encoded ${fragment.length - 3}`);
  console.log(`worst case encoded length ${fragment.length - 3} of ${ENCODED_MAX}`);
});

test('a fragment over ENCODED_MAX is too-long before decompressing', async () => {
  const real = globalThis.DecompressionStream;
  let made = 0;
  globalThis.DecompressionStream = class extends real {
    constructor(format: CompressionFormat) { super(format); made++; }
  } as typeof real;
  try {
    assert.equal(await errorOf(`L1.${'A'.repeat(ENCODED_MAX + 1)}`), 'too-long');
    assert.equal(made, 0);
    assert.equal(await errorOf(`L1.${'A'.repeat(ENCODED_MAX)}`), 'damaged', 'at the limit it is read');
    assert.equal(made, 1);
  } finally {
    globalThis.DecompressionStream = real;
  }
});

test('a decompression bomb is too-large', async () => {
  const link = await pack('#'.repeat(1_000_000));
  assert.ok(link.length - 3 < ENCODED_MAX);
  assert.equal(await errorOf(link), 'too-large');
  const justOver = await pack(payloadOf(SMALL) + ' '.repeat(DECODED_MAX));
  assert.equal(await errorOf(justOver), 'too-large');
});

test('a bomb is caught after a bounded number of input pieces', async () => {
  const link = await pack('#'.repeat(12_000_000));
  const pieces = Math.ceil(Buffer.from(link.slice(3), 'base64url').length / 1024);
  assert.ok(pieces >= 8, `${pieces} pieces`);
  const real = globalThis.DecompressionStream;
  let writes = 0;
  globalThis.DecompressionStream = class extends real {
    get writable(): WritableStream<BufferSource> {
      const w = super.writable;
      return new Proxy(w, {
        get: (target, key) => {
          if (key !== 'getWriter') return Reflect.get(target, key, target);
          return () => {
            const writer = target.getWriter();
            return new Proxy(writer, {
              get: (wr, k) => {
                if (k === 'write') return (chunk: BufferSource) => { writes++; return wr.write(chunk); };
                const v = Reflect.get(wr, k, wr);
                return typeof v === 'function' ? v.bind(wr) : v;
              },
            });
          };
        },
      });
    }
  } as typeof real;
  try {
    assert.equal(await errorOf(link), 'too-large');
  } finally {
    globalThis.DecompressionStream = real;
  }
  assert.ok(writes >= 1 && writes <= 6, `${writes} of ${pieces} pieces written`);
});

test('L2 is newer; garbage, bad base64 and a truncated stream are damaged', async () => {
  const good = await pack(payloadOf(SMALL));
  assert.equal(await errorOf(await pack(payloadOf(SMALL), 'L2')), 'newer');
  assert.equal(await errorOf(await pack(payloadOf(SMALL), 'L10')), 'newer');
  assert.equal(await errorOf('hello'), 'not-a-link');
  assert.equal(await errorOf(''), 'not-a-link');
  assert.equal(await errorOf('L1'), 'not-a-link');
  assert.equal(await errorOf('L1.!!!!'), 'damaged');
  assert.equal(await errorOf('L1.A'), 'damaged');
  assert.equal(await errorOf('L1.AAAA'), 'damaged');
  assert.equal(await errorOf('L1.' + 'x'.repeat(40)), 'damaged');
  assert.equal(await errorOf(good.slice(0, good.length - 6)), 'damaged');
  assert.equal(await errorOf('L1.' + good.slice(3, 12)), 'damaged');
  assert.equal(await errorOf(await pack('no header here')), 'damaged');
  assert.equal(await errorOf(await pack(payloadOf('not a level\n'))), 'damaged');
  assert.equal(await errorOf(await pack(payloadOf(SMALL, 'WG'))), 'damaged', 'bad initials');
  assert.equal(await errorOf(await pack(payloadOf(SMALL, 'ASS'))), 'damaged', 'a blocked word');
  assert.equal(await errorOf(await pack(payloadOf(SMALL, 'WGR', 'rq'))), 'damaged', 'a letter that is no move');
  assert.equal(await errorOf(await pack(payloadOf(SMALL, 'WGR', 'rr', 'best: 1.5\n'))), 'damaged');
  assert.equal(await errorOf(await pack(payloadOf(SMALL, 'WGR', 'rr', 'best: -3\n'))), 'damaged');
  assert.ok((await decodeLink(good)).ok);
});

test('a link with a title, intro or pages is damaged', async () => {
  const withTitle = SMALL.replace('title: ', 'title: Free text');
  const withIntro = SMALL.replace('intro: ', 'intro: Free text');
  const withPage = canonical('pages: found-it\n\n#####\n#PpE#\n#####\n').replace('title: \n', 'title: \n');
  assert.equal(await errorOf(await pack(payloadOf(withTitle))), 'damaged');
  assert.equal(await errorOf(await pack(payloadOf(withIntro))), 'damaged');
  assert.equal(await errorOf(await pack(payloadOf(withPage))), 'damaged');
  assert.equal(await errorOf(await pack(payloadOf('title: \nintro: \n\n#####\n#PpE#\n#####\n'))), 'damaged', 'a page cell with no pages header');
});

test('a board side outside 3..64 is damaged', async () => {
  const wide = `title: \nintro: \n\n${'.'.repeat(65)}\n${'P'.padEnd(65, '.')}\n${'.'.repeat(65)}\n`;
  const tall = `title: \nintro: \n\n${Array.from({ length: 65 }, (_, r) => (r === 0 ? 'P..' : '...')).join('\n')}\n`;
  const narrow = 'title: \nintro: \n\n..\nP.\n..\n';
  const short = 'title: \nintro: \n\n...\nP..\n';
  for (const text of [wide, tall, narrow, short]) assert.equal(await errorOf(await pack(payloadOf(text))), 'damaged');
  const edge = `title: \nintro: \n\n${Array.from({ length: 64 }, (_, r) => (r === 0 ? `P${'.'.repeat(63)}` : '.'.repeat(64))).join('\n')}\n`;
  assert.ok((await decodeLink(await pack(payloadOf(edge)))).ok);
});

test('a best below the line\'s length is damaged', async () => {
  const line = lineOf('rrrr')!;
  assert.equal(await errorOf(await encodeLink({ text: SMALL, line, initials: 'WGR', best: 3 })), 'damaged');
  const r = await decodeLink(await encodeLink({ text: SMALL, line, initials: 'WGR', best: 4 }));
  assert.ok(r.ok);
});

test('a line over MAX_LINE is too-long', async () => {
  const link = await pack(payloadOf(SMALL, 'WGR', 'r'.repeat(MAX_LINE + 1)));
  assert.equal(await errorOf(link), 'too-long');
  const ok = await decodeLink(await pack(payloadOf(SMALL, 'WGR', 'r'.repeat(MAX_LINE))));
  assert.ok(ok.ok);
});

test('levelCode is stable', async () => {
  const text = canonical(TRIALS[0]!.text);
  const code = await levelCode(text);
  assert.match(code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/);
  assert.equal(code, await levelCode(text));
  assert.notEqual(code, await levelCode(`${text}\n`));
  assert.equal(code, 'V43B');
});

test('sharedName names the level and its author', () => {
  assert.equal(sharedName('K7QX', 'WGR'), 'Level K7QX by WGR');
});

test('every error has a message', () => {
  assert.equal(LINK_MESSAGES.damaged, 'This level link is damaged. Ask for the link again.');
  assert.equal(LINK_MESSAGES['too-long'], 'This level link is too long to open.');
  assert.equal(LINK_MESSAGES['too-large'], 'This level link is too long to open.');
  assert.equal(LINK_MESSAGES.newer, 'This level was made by a newer version of the game. Reload the page and try again.');
  assert.equal(LINK_MESSAGES['not-a-link'], 'This is not a level link.');
  assert.equal(lineText(lineOf('udlrwzxc')!), 'udlrwzxc');
});

/** Trial 9 as a link carries it: no title, intro or pages, each `p` cell a floor. */
const TRIAL_9 = canonical(TRIALS[8]!.text.replace(/^pages: .*\n/m, '').replace(/p/g, '.').replace(/^(title|intro): .*$/gm, '$1: '));
let trialLine: ReturnType<typeof lineOf> | undefined;
function trial9Line() {
  if (!trialLine) {
    const r = solve(initial(parse(TRIAL_9)));
    assert.ok(r.solved);
    trialLine = r.line;
  }
  return trialLine;
}

test('a real link opens', async () => {
  const line = trial9Line()!;
  const fragment = await encodeLink({ text: TRIAL_9, line, initials: 'WGR', best: line.length });
  const r = await openLink(fragment);
  assert.ok(r.ok);
  assert.equal(r.shared.text, TRIAL_9);
  assert.deepEqual(r.shared.line, line);
  assert.equal(r.name, `Level ${await levelCode(TRIAL_9)} by WGR`);
});

test('a line that wins early or never is damaged', async () => {
  const line = trial9Line()!;
  const early = await encodeLink({ text: TRIAL_9, line: [...line, ...line.slice(0, 1)], initials: 'WGR', best: null });
  assert.deepEqual(await openLink(early), { ok: false, error: 'damaged' });
  const short = await encodeLink({ text: TRIAL_9, line: line.slice(0, -1), initials: 'WGR', best: null });
  assert.deepEqual(await openLink(short), { ok: false, error: 'damaged' });
  const empty = await encodeLink({ text: TRIAL_9, line: [], initials: 'WGR', best: null });
  assert.deepEqual(await openLink(empty), { ok: false, error: 'damaged' });
});

test('a line that loses before the end is damaged', async () => {
  // One heart, and the Minotaur stands two steps from P: the first move to the right gets P caught and the level lost, so
  // the line that would otherwise run to the exit is refused at its second move.
  const text = canonical('hearts: 1\n\n######\n#P.M.#\n#...E#\n######\n');
  const fragment = await encodeLink({ text, line: lineOf('rrrdr')!, initials: 'WGR', best: null });
  assert.deepEqual(await openLink(fragment), { ok: false, error: 'damaged' });
});

test('openLink passes decode errors through', async () => {
  assert.deepEqual(await openLink('nonsense'), { ok: false, error: 'not-a-link' });
});
