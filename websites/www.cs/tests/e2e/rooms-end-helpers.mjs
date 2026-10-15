// Shared by the room match-end specs: a two-human room with one drone, played
// by lobbing shells onto our own tanks (angle 90, power 12) straight to the
// room server, the way the keyboard would.
import { expect } from '@playwright/test';
import { roomPair, lastRoom } from './helpers.mjs';
import { landing, withHills } from './rooms-shop-helpers.mjs';

/* Two humans (host ABC, guest ZED) and one drone; each page learns its token. */
export async function endPair(browser) {
  const pair = await roomPair(browser, {
    beforeStart: async ({ host }) => { await host.page.locator('#lobby-seats .seat-tile').nth(3).click(); },
  });
  for (const pl of [pair.host, pair.guest]) {
    pl.page.on('request', r => { const m = r.url().match(/action=state.*[?&]token=([0-9a-f]+)/); if (m) pl.token = m[1]; });
  }
  await expect.poll(() => pair.host.token && pair.guest.token, { timeout: 15_000 }).toBeTruthy();
  return pair;
}

export const phaseOf = (roomState, name) => (lastRoom(roomState[name]) || {}).phase;

export const LOB = [90, 12]; // straight up at the lowest power: it comes down on the shooter (leaned into the wind)
export const WIDE = [10, 100]; // a hard shot that lands on nobody: off the field, or as far from every unit as it can (aimed per turn)

/* Each listed player ('host' | 'guest') fires whenever it is their turn, until
   done() says so. A player must fire to pass the turn, so a player who should
   stay alive fires WIDE. */
export async function lobUntil(pair, plan, done) {
  const { roomState, code } = pair;
  for (let i = 0; i < 160; i++) {
    if (await done()) return;
    for (const [name, [angle, power]] of Object.entries(plan)) {
      const room = lastRoom(roomState[name]);
      const pl = pair[name];
      if (!room || room.phase !== 'play' || room.turn !== (name === 'host' ? 0 : 1) || !room.csrf) continue;
      let aim = angle;
      if (angle === WIDE[0] && power === WIDE[1]) {
        // The air shortens a flat shot to inside the field: aim it where it lands on nobody.
        const me = room.tanks.find(t => t.seat === (name === 'host' ? 0 : 1));
        const hilly = withHills(roomState[name]);
        if (me && hilly) {
          let best = -1;
          for (let a = 10; a <= 170; a++) {
            const x = landing(hilly, me, a, power);
            const clear = x === null ? Infinity : Math.min(...room.tanks.filter(t => t.hp > 0).map(t => Math.abs(t.x - x)));
            if (clear > best) [best, aim] = [clear, a];
          }
        }
      }
      if (angle === LOB[0] && power === LOB[1]) {
        // The wind pushes a lob off its own tank: lean the barrel so it comes down on it (room_sim_shot's physics).
        const me = room.tanks.find(t => t.seat === (name === 'host' ? 0 : 1));
        const hilly = withHills(roomState[name]);
        if (me && hilly) {
          let best = Infinity;
          for (let a = 60; a <= 120; a++) {
            const x = landing(hilly, me, a, power);
            if (x !== null && Math.abs(x - me.x) < best) [best, aim] = [Math.abs(x - me.x), a];
          }
        }
      }
      await pl.page.evaluate(async ({ code, token, csrf, angle, power }) => {
        await fetch('rooms.php?action=act', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
          body: JSON.stringify({ code, token, csrf, kind: 'fire', angle, power }),
        });
      }, { code, token: pl.token, csrf: room.csrf, angle: aim, power });
    }
    await pair.host.page.waitForTimeout(700);
  }
  throw new Error('the round never ended');
}

const shopUp = page => page.evaluate(() => !document.getElementById('shop-veil').hidden);
const endUp = page => page.evaluate(() => !document.getElementById('end-veil').hidden);

/* Both lose the round (a life each), until both see the shop or the end card. */
export async function loseRoundBoth(pair) {
  const seen = async p => (await shopUp(p)) || (await endUp(p));
  await lobUntil(pair, { host: LOB, guest: LOB }, async () => (await seen(pair.host.page)) && (await seen(pair.guest.page)));
}

/* Everyone readies the shop; resolves when the next round is on. */
export async function nextRound(pair) {
  for (const pl of [pair.host, pair.guest]) await pl.page.locator('#shop-next').click();
  await expect.poll(() => phaseOf(pair.roomState, 'host'), { timeout: 15_000 }).toBe('play');
}

/* Three lost rounds take every life: the match ends with no winner. */
export async function playToOver(pair) {
  for (let i = 0; i < 3; i++) {
    await loseRoundBoth(pair);
    if (i < 2) await nextRound(pair);
  }
  for (const pl of [pair.host, pair.guest]) await expect(pl.page.locator('#end-veil')).toBeVisible({ timeout: 15_000 });
}
