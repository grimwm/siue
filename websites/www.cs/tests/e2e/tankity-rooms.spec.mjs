// Operation Tankity rooms: two real browsers in one room.
import { test, expect } from '@playwright/test';
import { roomPair, hud, rec, resetRec, shellTrack, bowFromChord, lastRoom } from './helpers.mjs';

const myTurn = page => hud(page, 'hud-turn').then(t => /YOU\. Aim!/.test(t));

test('two players: drive, real shell flights on both screens, turns after the replay, HUD agrees with the server', async ({ browser }) => {
  const { host, guest, roomState } = await roomPair(browser);
  await expect.poll(() => myTurn(host.page), { timeout: 30_000 }).toBe(true);

  // Driving moves the tank on the server and costs fuel.
  const before = lastRoom(roomState.host).tanks.find(t => t.seat === 0);
  await host.page.keyboard.down('d');
  await host.page.waitForTimeout(900);
  await host.page.keyboard.up('d');
  await expect.poll(() => lastRoom(roomState.host).tanks.find(t => t.seat === 0).x, { timeout: 10_000 }).not.toBe(before.x);
  expect(Number(await hud(host.page, 'hud-fuel'))).toBeLessThan(80);

  // The host fires; both screens replay the flight along its real arc.
  await resetRec(host.page);
  await resetRec(guest.page);
  const fired = Date.now();
  await host.page.keyboard.press('Control');
  await expect.poll(() => myTurn(guest.page), { timeout: 60_000 }).toBe(true);
  const waited = (Date.now() - fired) / 1000;
  const shot = roomState.host.flatMap(r => r.events || []).find(e => e.t === 'shot' && e.by === 0);
  expect(shot, 'the server sent a stamped shot').toBeTruthy();
  expect(shot.p.split(' ').length).toBeGreaterThan(2);
  for (const who of [host, guest]) {
    const track = shellTrack((await rec(who.page)).shells);
    expect(track.length, 'the shell flies over many frames').toBeGreaterThan(15);
    expect(bowFromChord(track), 'the flight bows like an arc, not a straight tracer').toBeGreaterThan(6);
  }
  expect(waited, 'the next turn waits for the flight to play').toBeGreaterThan(shot.t1);

  // Once settled, each HUD's armor list matches the server's numbers.
  await guest.page.waitForTimeout(1500);
  const server = lastRoom(roomState.guest).tanks;
  const armorText = await hud(guest.page, 'hud-armor');
  const mine = server.find(t => t.name === 'zed');
  expect(armorText).toContain(`you ${mine.hp}`);
  for (const t of server.filter(t => t.name !== 'zed')) expect(armorText).toContain(`${t.name}:${t.hp}`);

  await guest.page.screenshot({ path: 'test-results/tankity-room-guest.png' });
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close();
  await guest.ctx.close();
});

test('a unit body picked in a room reaches everyone', async ({ browser }) => {
  const { host, guest, roomState } = await roomPair(browser);
  await expect.poll(() => myTurn(host.page), { timeout: 30_000 }).toBe(true);
  await guest.page.keyboard.press('c');
  await guest.page.click('#unit-picker button[title=Walker]');
  await guest.page.keyboard.press('Escape');
  await expect.poll(() => {
    const room = lastRoom(roomState.host);
    const t = room && room.tanks.find(x => x.name === 'zed');
    return t && t.body;
  }, { timeout: 15_000 }).toBe('walker');
  await host.ctx.close();
  await guest.ctx.close();
});

test('closing every player tab frees the room slot at once', async ({ browser, request }) => {
  const used = async () => (await (await request.get('games/tankity/rooms.php?action=ping')).json()).rooms.used;
  const { host, guest, code } = await roomPair(browser);
  const withRoom = await used();
  await guest.ctx.close();
  await host.ctx.close();
  await expect.poll(used, { timeout: 10_000 }).toBe(withRoom - 1);
  const gone = await (await request.get(`games/tankity/rooms.php?action=state&code=${code}&token=x&since=0`)).json();
  expect(gone.error).toMatch(/no such room|bad seat token/);
});
