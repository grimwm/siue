// Shared by the room shop specs: reading the shop, aiming like the room
// server, and playing a round to its win.
import { lastRoom } from './helpers.mjs';

export const shopOpen = page => page.evaluate(() => !document.getElementById('shop-veil').hidden);

/* Where a shell lands: rooms.php's room_sim_shot, ported (gravity 95, wind
   push 2.2, speed 40 + 2.4 * power, fired from 20 px out along the barrel). */
/* The newest room a page saw, with the hills from the newest snapshot that
   carried them: polls leave the hills out while they have not changed. */
export function withHills(list) {
  const room = lastRoom(list);
  if (!room || room.terrain) return room;
  const held = [...list].reverse().find(r => Array.isArray(r.terrain));
  return held ? { ...room, terrain: held.terrain } : null;
}

export function landing(room, tank, angle, power) {
  const rad = angle * Math.PI / 180;
  const speed = 40 + power * 2.4;
  let x = tank.x + Math.cos(rad) * 20 * tank.dirS, y = tank.y - 14 - Math.sin(rad) * 20;
  let vx = Math.cos(rad) * speed * tank.dirS, vy = -Math.sin(rad) * speed;
  const dt = 1 / 60;
  for (let i = 0; i < 720; i++) {
    vx += room.wind * 2.2 * dt; vy += 95 * dt;
    x += vx * dt; y += vy * dt;
    if (x < -20 || x > 740 || y > 500) return null;
    if (i >= 6 && y >= room.terrain[Math.max(0, Math.min(719, Math.round(x)))]) return x;
  }
  return null;
}

/* The aim whose shell lands closest to the first living drone, or, with every
   drone down, to the other human (a round ends on one unit left standing). */
export function bestAim(room, seat) {
  const me = room.tanks.find(t => t.seat === seat);
  const foe = room.tanks.find(t => t.kind === 'ai' && t.hp > 0)
    || room.tanks.find(t => t.seat !== seat && t.hp > 0);
  let best = null;
  for (let a = 10; a <= 170; a++) {
    for (let p = 10; p <= 100; p++) {
      const x = landing(room, me, a, p);
      const miss = x === null ? 1e9 : Math.abs(x - foe.x);
      if (!best || miss < best.miss) best = { angle: a, power: p, miss };
    }
  }
  return best;
}

/* Play both players' turns (straight to the room server, as the keyboard
   would) until the round is won and each sees the shop. */
export async function reachShop(host, guest, code, roomState) {
  const seats = [[host, 'host', 0], [guest, 'guest', 1]];
  for (let i = 0; i < 80; i++) {
    if (await shopOpen(host.page) && await shopOpen(guest.page)) return;
    for (const [pl, name, seat] of seats) {
      const room = withHills(roomState[name]);
      if (!room || room.phase !== 'play' || room.turn !== seat || !room.csrf) continue;
      const aim = bestAim(room, seat);
      await pl.page.evaluate(async ({ code, token, csrf, angle, power }) => {
        await fetch('rooms.php?action=act', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
          body: JSON.stringify({ code, token, csrf, kind: 'fire', angle, power }),
        });
      }, { code, token: pl.token, csrf: room.csrf, angle: aim.angle, power: aim.power });
    }
    await host.page.waitForTimeout(1500);
  }
  throw new Error('nobody won the round');
}

/* Both players lob shells straight up onto their own tanks (angle 90, power
   12, straight to the room server as the keyboard would) until the battery
   takes the round and each sees the shop. Once both are wrecked the drones
   fight on, one paced turn per poll, until one is left, so this waits longer
   than a round the battery wins at once. */
export async function loseRound(host, guest, code, roomState) {
  const seats = [[host, 'host', 0], [guest, 'guest', 1]];
  for (let i = 0; i < 160; i++) {
    if (await shopOpen(host.page) && await shopOpen(guest.page)) return;
    for (const [pl, name, seat] of seats) {
      const room = lastRoom(roomState[name]);
      if (!room || room.phase !== 'play' || room.turn !== seat || !room.csrf) continue;
      await pl.page.evaluate(async ({ code, token, csrf }) => {
        await fetch('rooms.php?action=act', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
          body: JSON.stringify({ code, token, csrf, kind: 'fire', angle: 90, power: 12 }),
        });
      }, { code, token: pl.token, csrf: room.csrf });
    }
    await host.page.waitForTimeout(1500);
  }
  throw new Error('the round was never lost');
}
