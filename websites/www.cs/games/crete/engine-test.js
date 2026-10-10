// The Island of Crete's rules, with no page: seeded generation, the chase, items,
// the hint and play-through timers. Run here: `node engine-test.js`.
// js/engine.js (compiled from src/engine.ts) takes everything it shows or
// plays through hooks, so the test hands it recording ones and a fake clock.
import * as E from './js/engine.js';
import crypto from 'node:crypto';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};

/** A game wired to recorders and a manual clock. */
function harness() {
  const log = [];
  const sounds = [];
  const ends = [];
  let renders = 0;
  let now = 0;
  let nextId = 1;
  const pending = new Map(); // id -> { at, every, fn }
  const timers = {
    setTimeout: (fn, ms) => { pending.set(nextId, { at: now + ms, every: 0, fn }); return nextId++; },
    clearTimeout: id => { pending.delete(id); },
    setInterval: (fn, ms) => { pending.set(nextId, { at: now + ms, every: ms, fn }); return nextId++; },
    clearInterval: id => { pending.delete(id); },
  };
  const advance = ms => {
    const end = now + ms;
    for (;;) {
      const due = [...pending.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      const [id, t] = due;
      now = t.at;
      if (t.every) t.at += t.every; else pending.delete(id);
      t.fn();
    }
    now = end;
  };
  const game = E.createGame({
    say: (text, tone) => log.push({ text, tone }),
    sfx: name => sounds.push(name),
    render: () => { renders++; },
    showEnd: won => ends.push(won),
    timers,
  });
  return { game, G: game.G, log, sounds, ends, advance, pending, renders: () => renders };
}

/** An empty arena: walls on the border only, no safe zones, barriers or loot. */
function arena(G, player, foe) {
  G.walls = Array.from({ length: E.ROWS }, (_, r) => Array.from({ length: E.COLS }, (_, c) => r === 0 || c === 0 || r === E.ROWS - 1 || c === E.COLS - 1));
  G.safe = new Set();
  G.barriers = new Set();
  G.pickups = new Map();
  G.player = { ...player };
  G.foe = { ...foe };
}
const said = (h, re) => h.log.some(l => re.test(l.text));
const dist = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

// ---- seeded randomness ----
check('hash-is-pinned', E.hashSeed('stefan-1984') === 1737770012, E.hashSeed('stefan-1984'));
check('rng-is-pinned', E.mulberry32(E.hashSeed('stefan-1984'))() === 0.33325220248661935, '');
const a = E.mulberry32(7), b = E.mulberry32(7);
check('rng-replays-per-seed', [a(), a(), a()].join() === [b(), b(), b()].join(), '');
check('rng-in-unit-interval', Array.from({ length: 1000 }, a).every(v => v >= 0 && v < 1), '');

// ---- generation ----
const wallsHash = walls => crypto.createHash('sha256').update(walls.map(r => r.map(w => (w ? '#' : '.')).join('')).join('\n')).digest('hex').slice(0, 12);
const g1 = E.generateRun('stefan-1984').layout;
check('maze-is-pinned-per-seed', wallsHash(g1.walls) === 'f81101096cba' && g1.optimal === 26 && g1.margin === 10 && g1.foeDist === 36
  && g1.foe.r === 3 && g1.foe.c === 7, `${wallsHash(g1.walls)} ${g1.optimal} ${g1.margin} ${g1.foeDist}`);
check('same-seed-same-maze', wallsHash(E.generateRun('stefan-1984').layout.walls) === wallsHash(g1.walls), '');
check('other-seed-other-maze', wallsHash(E.generateRun('shot-1').layout.walls) !== wallsHash(g1.walls), '');
check('blank-seed-is-random-but-named', /^stefan-\d{4}$/.test(E.chooseSeed('  ')) && E.chooseSeed('  abc ') === 'abc', E.chooseSeed(''));

// Every maze, over many seeds, is a fair board.
let problems = [];
for (let i = 0; i < 120; i++) {
  const { layout: l } = E.generateRun(`seed-${i}`);
  const open = (r, c) => !l.walls[r][c];
  const fromStart = E.bfsDist(l.walls, E.START);
  // The route to the exit may cross a barrier; with every barrier open it must exist.
  const opened = l.walls.map(row => row.slice());
  for (const k of l.barriers) { const [r, c] = k.split(',').map(Number); opened[r][c] = false; }
  const toExit = E.bfsDist(opened, E.START)[E.EXIT.r][E.EXIT.c];
  if (!open(E.START.r, E.START.c) || !open(E.EXIT.r, E.EXIT.c)) problems.push(`${i}: start or exit walled`);
  if (toExit !== l.optimal || toExit < 1) problems.push(`${i}: optimal ${l.optimal} vs ${toExit}`);
  if (l.barriers.size !== 2) problems.push(`${i}: ${l.barriers.size} barriers`);
  if ([...l.barriers].some(k => { const [r, c] = k.split(',').map(Number); return open(r, c); })) problems.push(`${i}: barrier not closed`);
  if (l.pickups.size !== 8) problems.push(`${i}: ${l.pickups.size} pickups`);
  for (const k of l.pickups.keys()) { const [r, c] = k.split(',').map(Number); if (fromStart[r][c] === -1) problems.push(`${i}: loot ${k} unreachable`); }
  const kinds = [...l.pickups.values()].sort().join();
  if (kinds !== 'fuse,fuse,jammer,page,page,page,shard,snack') problems.push(`${i}: loot ${kinds}`);
  if (l.safe.has(E.key(E.START.r, E.START.c)) || l.safe.has(E.key(E.EXIT.r, E.EXIT.c))) problems.push(`${i}: safe zone on start or exit`);
  if (l.safe.has(E.key(l.foe.r, l.foe.c)) || !open(l.foe.r, l.foe.c)) problems.push(`${i}: creature in a safe zone or wall`);
  if (l.foe.r === E.EXIT.r && l.foe.c === E.EXIT.c) problems.push(`${i}: creature on the exit`);
  if (l.margin !== l.foeDist - l.optimal) problems.push(`${i}: margin`);
}
check('every-generated-maze-is-fair', problems.length === 0, problems.slice(0, 3).join('; '));

// ---- search ----
const room = Array.from({ length: E.ROWS }, (_, r) => Array.from({ length: E.COLS }, (_, c) => r === 0 || c === 0 || r === E.ROWS - 1 || c === E.COLS - 1));
const path = E.bfsPath(room, { r: 1, c: 1 }, { r: 3, c: 4 });
check('path-is-shortest-and-inclusive', path.length === 6 && path[0].r === 1 && path[5].r === 3 && path[5].c === 4, path.length);
check('path-steps-are-adjacent', path.every((p, i) => i === 0 || dist(p, path[i - 1]) === 1), '');
const split = room.map(r => r.slice());
for (let r = 0; r < E.ROWS; r++) split[r][7] = true;
check('no-path-through-a-wall', E.bfsPath(split, { r: 1, c: 1 }, { r: 1, c: 13 }).length === 0, '');
check('distance-from-a-wall-is-unreachable', E.bfsDist(room, { r: 0, c: 0 }).every(row => row.every(v => v === -1)), '');
check('distance-is-manhattan-in-the-open', E.bfsDist(room, { r: 1, c: 1 })[13][13] === 24, E.bfsDist(room, { r: 1, c: 1 })[13][13]);

// ---- a run ----
{
  const h = harness();
  h.game.newRun('stefan-1984');
  const G = h.G;
  check('run-starts-fresh', G.seed === 'stefan-1984' && G.hp === E.MAX_HP && G.turns === 0 && G.pages === 0 && !G.over
    && G.player.r === 1 && G.player.c === 1 && G.optimal === 26 && G.budget === 10 && G.foeSpawnDist === 36, JSON.stringify([G.seed, G.hp, G.optimal, G.budget]));
  check('snack-heal-is-rolled-4-to-6', G.snackHeal >= 4 && G.snackHeal <= 6, G.snackHeal);
  check('start-inventory', JSON.stringify(G.inv) === '{"shard":1,"snack":1,"jammer":1}', JSON.stringify(G.inv));
  check('hud-distance-matches-search', h.game.foeDistance() === E.bfsDist(G.walls, G.player)[G.foe.r][G.foe.c], '');
}

// Walls cost nothing; a step costs a turn and the creature moves twice.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 1, c: 1 }, { r: 13, c: 13 });
  h.game.tryMove(-1, 0);
  check('wall-costs-no-turn', h.G.turns === 0 && h.G.player.r === 1 && said(h, /Wall\. The Labyrinth declines/) && h.sounds.includes('bump'), '');
  h.game.tryMove(0, 1);
  check('step-costs-a-turn', h.G.turns === 1 && h.G.player.c === 2 && h.sounds.includes('move'), '');
  // 24 apart, you step toward it (23), it takes two steps (21).
  check('creature-takes-two-steps-per-turn', dist(h.G.foe, h.G.player) === 24 - 1 - 2 + 0, `${dist(h.G.foe, h.G.player)}`);
  check('every-action-redraws', h.renders() >= 1, h.renders());
}

// A frozen creature skips its turn.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 1, c: 1 }, { r: 13, c: 13 });
  h.G.frozen = 1;
  h.game.tryMove(0, 1);
  check('frozen-creature-stays', h.G.foe.r === 13 && h.G.foe.c === 13 && h.G.frozen === 0 && said(h, /judders/), JSON.stringify(h.G.foe));
}

// Barriers and fuses.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 13, c: 13 });
  h.G.barriers.add(E.key(5, 6)); h.G.walls[5][6] = true;
  h.game.tryMove(0, 1);
  check('barrier-blocks-without-a-fuse', h.G.player.c === 5 && h.G.turns === 0 && h.G.walls[5][6] && said(h, /wants a 🔌 fuse/), '');
  h.G.fuses = 1;
  h.game.tryMove(0, 1);
  check('fuse-opens-the-barrier', h.G.player.c === 6 && h.G.fuses === 0 && h.G.opened === 1 && h.G.score === 40
    && !h.G.walls[5][6] && !h.G.barriers.has(E.key(5, 6)) && h.sounds.includes('open'), JSON.stringify([h.G.player, h.G.fuses, h.G.score]));
}

// Pickups.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 13, c: 13 });
  h.G.pickups.set(E.key(5, 6), 'page');
  h.G.pickups.set(E.key(5, 7), 'fuse');
  h.G.pickups.set(E.key(5, 8), 'jammer');
  h.game.tryMove(0, 1); h.game.tryMove(0, 1); h.game.tryMove(0, 1);
  check('pickups-score-and-stock', h.G.pages === 1 && h.G.fuses === 1 && h.G.inv.jammer === 2 && h.G.score === 120 && h.G.pickups.size === 0,
    JSON.stringify([h.G.pages, h.G.fuses, h.G.inv, h.G.score]));
  check('pickups-sound-and-say', h.sounds.includes('page') && h.sounds.includes('pickup') && said(h, /Script page 1\/3/) && said(h, /Picked up: Signal Jammer/), '');
}

// Items.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 13, c: 13 });
  h.game.useItem('snack');
  check('snack-at-full-health-costs-nothing', h.G.inv.snack === 1 && h.G.turns === 0 && said(h, /Already at full health/), '');
  h.G.hp = 5;
  h.game.useItem('snack');
  check('snack-heals-and-costs-a-turn', h.G.hp === 5 + h.G.snackHeal && h.G.inv.snack === 0 && h.G.turns === 1, JSON.stringify([h.G.hp, h.G.snackHeal]));
  h.game.useItem('snack');
  check('empty-stock-says-so', said(h, /No Sugar Puffs left/) && h.G.turns === 1, '');
  h.game.useItem('shard');
  check('shard-freezes-and-is-free', h.G.frozen === 1 && h.G.inv.shard === 0 && h.G.turns === 1, '');
  const t = h.G.turns;
  h.game.useItem('jammer');
  check('jammer-hurls-the-creature-far', h.G.inv.jammer === 0 && h.G.turns === t + 1 && E.bfsDist(h.G.walls, h.G.player)[h.G.foe.r][h.G.foe.c] >= 4, JSON.stringify(h.G.foe));
}

// Bash.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 9, c: 9 });
  h.game.bash();
  check('bash-needs-the-creature-adjacent', h.G.turns === 0 && said(h, /Nothing in reach/), '');
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 6 });
  h.G.hp = E.MAX_HP;
  h.game.bash();
  // Shoved from (5,6) to (5,9), dazed so it takes one step back: (5,8). The cooldown of 3 ticks once.
  check('bash-shoves-it-three-cells-and-dazes-it', h.G.foe.r === 5 && h.G.foe.c === 8 && h.G.bashCd === 2, JSON.stringify([h.G.foe, h.G.bashCd]));
  check('bash-costs-a-turn', h.G.turns === 1 && h.sounds.includes('bash'), '');
  h.game.bash();
  check('bash-recharges', said(h, /Bash is recharging/), '');
}

// Safe zones keep the creature out; the aura burns beside it.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 8 });
  for (const c of [4, 5, 6]) h.G.safe.add(E.key(5, c));
  h.game.tryMove(0, 1);
  check('creature-cannot-enter-a-safe-zone', !h.G.safe.has(E.key(h.G.foe.r, h.G.foe.c)) && !h.G.over, JSON.stringify(h.G.foe));
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 7 });
  const hp = h.G.hp;
  h.game.tryMove(0, -1); // 3 apart; it takes two steps and ends beside you
  check('aura-burns-two-hp', h.G.hp === hp - 2 && dist(h.G.foe, h.G.player) === 1 && said(h, /proximity burns/) && !h.G.over, JSON.stringify([h.G.hp, h.G.foe]));
}

// Death and the win.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 7 });
  h.game.tryMove(0, -1);
  h.game.tryMove(0, -1);
  check('caught-ends-the-run', h.G.over && !h.G.won && h.ends.join() === 'false' && h.sounds.includes('lose') && h.G.deathCause === 'It found you between the frames. The screen goes white.', h.G.deathCause);
  const t = h.G.turns;
  h.game.tryMove(0, 1);
  check('nothing-moves-after-the-end', h.G.turns === t && said(h, /Run over — press N/), '');

  const w = harness();
  w.game.newRun('x');
  arena(w.G, { r: E.EXIT.r, c: E.EXIT.c - 1 }, { r: 1, c: 1 });
  w.G.pages = 2;
  w.game.tryMove(0, 1);
  check('reaching-the-exit-wins', w.G.over && w.G.won && w.ends.join() === 'true' && w.sounds.includes('win'), '');

  const k = harness();
  k.game.newRun('x');
  arena(k.G, { r: 5, c: 5 }, { r: 13, c: 13 });
  k.G.hp = 1;
  k.G.foe = { r: 5, c: 7 };
  k.game.tryMove(0, -1); // it ends beside you; the burn takes the last hit point
  check('hp-zero-ends-the-run', k.G.over && k.G.hp === 0 && k.G.deathCause === 'The static wore you down to nothing.' && k.ends.join() === 'false', JSON.stringify([k.G.hp, k.G.deathCause]));
}

// Hint, answer, play-through: the timers go through the hooks.
{
  const h = harness();
  h.game.newRun('stefan-1984');
  h.game.hint();
  const route = h.game.goalPath();
  check('hint-marks-the-next-cell', h.G.hint === E.key(route[1].r, route[1].c) && h.sounds.includes('hint') && said(h, /^Hint: head (north|south|west|east)/), h.G.hint);
  h.advance(1599);
  check('hint-lingers-1600ms', h.G.hint !== null, '');
  h.advance(2);
  check('hint-fades', h.G.hint === null, '');
  h.game.toggleAnswer();
  check('answer-on', h.G.showRoute && h.sounds.includes('answerOn'), '');
  h.game.toggleAnswer();
  check('answer-off', !h.G.showRoute && h.sounds.includes('answerOff'), '');

  const route0 = h.game.goalPath().length;
  h.game.toggleAuto();
  check('auto-starts-on-a-timer', h.G.auto && h.pending.size === 1 && h.G.autoTimer > 0, '');
  h.game.tryMove(0, 1);
  check('player-input-waits-for-the-take-over', said(h, /Play-through is running/), '');
  h.advance(350 * 5);
  check('auto-walks-the-route', h.G.turns >= 3 || h.G.over, h.G.turns);
  h.game.toggleAuto();
  check('auto-pauses-on-a-second-press', !h.G.auto && h.pending.size === 0 && said(h, /Play-through paused/), '');
  h.game.toggleAuto();
  h.advance(350 * 400);
  check('auto-plays-the-run-to-an-end', h.G.over && !h.G.auto && h.pending.size === 0 && route0 > 0 && h.ends.length === 1, JSON.stringify([h.G.over, h.G.turns, h.G.deathCause]));
}

// The creature steers toward you by search, breaking ties with the rng only.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 9 });
  h.game.foeStep();
  check('foe-step-gets-closer', dist(h.G.foe, h.G.player) === 3, JSON.stringify(h.G.foe));
}

console.log(failed ? `ENGINE-FAIL ${failed}` : 'ENGINE-OK');
process.exit(failed ? 1 : 0);
