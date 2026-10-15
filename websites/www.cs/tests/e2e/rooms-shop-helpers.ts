// Shared by the room shop specs: reading the shop, aiming like the room
// server, and playing a round to its win.
import type { Page } from '@playwright/test';
import { lastRoom } from './helpers.ts';
import type { Player, Room, RoomPair } from './helpers.ts';

/* What the room specs read of a room, a unit and an event: rooms.php's snapshot
   (helpers.ts keeps Room loose, since specs read more keys than any one names). */
export type Tank = { seat: number; kind: string; name: string; hp: number; x: number; y: number; dirS: number; angle: number; body: string; menu: boolean };
export type RoomEvent = { seq?: number; t: string; by?: number; seat?: number; p: string; t1: number };
export type RoomView = {
  phase: string; turn: number; csrf: string; round: number; turnSecs: number; wind?: number; terrain?: number[];
  tanks: Tank[]; seats: { mode: string; bot: boolean }[]; events?: RoomEvent[];
  you: { seat: number; weapon: string; lives: number; score: number; cash: number };
  winner?: number | null; winBonus: number;
};

/* A player that learns its seat token from its state polls. */
export type SeatedPlayer = Player & { token?: string };
export type SeatedPair = RoomPair & { host: SeatedPlayer; guest: SeatedPlayer };
export const seatedPair = (pair: RoomPair): SeatedPair => pair;

/* The newest room a page saw, read as a RoomView (as lastRoom, undefined until the first snapshot). */
export const roomView = (list: Room[]): RoomView => lastRoom(list) as RoomView;

/* A page's whole list of rooms, read as RoomViews. */
export const views = (list: Room[]): RoomView[] => list as RoomView[];

export const shopOpen = (page: Page): Promise<boolean> => page.evaluate(() => !(document.getElementById('shop-veil') as HTMLElement).hidden);

/* The newest room a page saw, with the hills from the newest snapshot that
   carried them: polls leave the hills out while they have not changed. */
export function withHills(list: Room[]): RoomView | null | undefined {
  const room = roomView(list);
  if (!room || room.terrain) return room;
  const held = [...list].reverse().find(r => Array.isArray(r.terrain)) as RoomView | undefined;
  return held ? { ...room, terrain: held.terrain } : null;
}

/* Where a Shell lands: rooms.php's room_sim_shot, ported (server/flight.php's
   air: gravity 95, drag 0.0012 per px against the speed through the air, the
   wind 10 px/s a unit at 40 px over the field's floor and growing as the
   3/16 power of the height; speed 40 + 2.4 * power, fired from 20 px out
   along the barrel). */
const shear = (h: number) => { const r = Math.sqrt(Math.sqrt(Math.sqrt(Math.sqrt(Math.max(h, 1) / 40)))); return r * r * r; };
export function landing(room: RoomView, tank: Tank, angle: number, power: number): number | null {
  const rad = angle * Math.PI / 180;
  const speed = 40 + power * 2.4;
  let x = tank.x + Math.cos(rad) * 20 * tank.dirS, y = tank.y - 14 - Math.sin(rad) * 20;
  let vx = Math.cos(rad) * speed * tank.dirS, vy = -Math.sin(rad) * speed;
  const dt = 1 / 60;
  for (let i = 0; i < 720; i++) {
    const rx = room.wind ? vx - room.wind * 10 * shear(460 - y) : vx, d = 0.0012 * Math.sqrt(rx * rx + vy * vy);
    vx -= d * rx * dt; vy += (95 - d * vy) * dt;
    x += vx * dt; y += vy * dt;
    if (x < -20 || x > 740 || y > 500) return null;
    if (i >= 6 && y >= room.terrain![Math.max(0, Math.min(719, Math.round(x)))]!) return x;
  }
  return null;
}

/* The aim whose shell lands closest to the first living drone, or, with every
   drone down, to the other human (a round ends on one unit left standing). */
export function bestAim(room: RoomView, seat: number): { angle: number; power: number; miss: number } {
  const me = room.tanks.find(t => t.seat === seat)!;
  const foe = room.tanks.find(t => t.kind === 'ai' && t.hp > 0)
    || room.tanks.find(t => t.seat !== seat && t.hp > 0)!;
  let best: { angle: number; power: number; miss: number } | null = null;
  for (let a = 10; a <= 170; a++) {
    for (let p = 10; p <= 100; p++) {
      const x = landing(room, me, a, p);
      const miss = x === null ? 1e9 : Math.abs(x - foe.x);
      if (!best || miss < best.miss) best = { angle: a, power: p, miss };
    }
  }
  return best!;
}

/* Play both players' turns (straight to the room server, as the keyboard
   would) until the round is won and each sees the shop. */
export async function reachShop(host: SeatedPlayer, guest: SeatedPlayer, code: string, roomState: RoomPair['roomState']) {
  const seats = [[host, 'host', 0], [guest, 'guest', 1]] as const;
  for (let i = 0; i < 80; i++) {
    if (await shopOpen(host.page) && await shopOpen(guest.page)) return;
    for (const [pl, name, seat] of seats) {
      const room = withHills(roomState[name]);
      if (!room || room.phase !== 'play' || room.turn !== seat || !room.csrf) continue;
      const aim = bestAim(room, seat);
      await pl.page.evaluate(async ({ code, token, csrf, angle, power }: { code: string; token?: string; csrf: string; angle: number; power: number }) => {
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
export async function loseRound(host: SeatedPlayer, guest: SeatedPlayer, code: string, roomState: RoomPair['roomState']) {
  const seats = [[host, 'host', 0], [guest, 'guest', 1]] as const;
  for (let i = 0; i < 160; i++) {
    if (await shopOpen(host.page) && await shopOpen(guest.page)) return;
    for (const [pl, name, seat] of seats) {
      const room = roomView(roomState[name]);
      if (!room || room.phase !== 'play' || room.turn !== seat || !room.csrf) continue;
      await pl.page.evaluate(async ({ code, token, csrf }: { code: string; token?: string; csrf: string }) => {
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
