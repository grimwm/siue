// Operation Tankity rooms: two real browsers in one room.
import { test, expect } from '@playwright/test';
import type { Browser, APIRequestContext, Page } from '@playwright/test';
import { roomPair, hud, rec, resetRec, shellTrack, bowFromChord, holdBarrel, expectFullSwing, aimTo, setPower, groundProbe, newPlayer, setInitials } from './helpers.ts';
import { roomView, views } from './rooms-shop-helpers.ts';

const myTurn = (page: Page) => hud(page, 'hud-turn').then(t => /YOU\. Aim!/.test(t));

test('two players: drive, real shell flights on both screens, turns after the replay, HUD agrees with the server', async ({ browser }) => {
  const { host, guest, roomState } = await roomPair(browser);
  await expect.poll(() => myTurn(host.page), { timeout: 30_000 }).toBe(true);

  // Driving moves the tank on the server and costs fuel.
  const before = roomView(roomState.host).tanks.find(t => t.seat === 0)!;
  await host.page.keyboard.down('Shift');
  await host.page.keyboard.down('ArrowRight');
  await host.page.waitForTimeout(900);
  await host.page.keyboard.up('ArrowRight');
  await host.page.keyboard.up('Shift');
  await expect.poll(() => roomView(roomState.host).tanks.find(t => t.seat === 0)!.x, { timeout: 10_000 }).not.toBe(before.x);
  expect(Number(await hud(host.page, 'hud-fuel'))).toBeLessThan(80);

  // The host fires; both screens replay the flight along its real arc.
  await resetRec(host.page);
  await resetRec(guest.page);
  const fired = Date.now();
  await host.page.keyboard.press('Control');
  await expect.poll(() => myTurn(guest.page), { timeout: 60_000 }).toBe(true);
  const waited = (Date.now() - fired) / 1000;
  const shot = views(roomState.host).flatMap(r => r.events || []).find(e => e.t === 'shot' && e.by === 0)!;
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
  const server = roomView(roomState.guest).tanks;
  // The armor pill's name carries your armor and each rival's, in words.
  const armorText = await guest.page.locator('.pill.armor').getAttribute('aria-label');
  const mine = server.find(t => t.name === 'ZED')!;
  expect(armorText).toContain(`Armor ${mine.hp} of`);
  for (const t of server.filter(t => t.name !== 'ZED')) expect(armorText).toContain(`${t.name} ${t.hp} of`);

  await guest.page.screenshot({ path: 'test-results/tankity-room-guest.png' });
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close();
  await guest.ctx.close();
});

test('in a room the barrel swings through the whole arc without snapping back, and the server keeps it', async ({ browser }) => {
  const { host, guest, roomState } = await roomPair(browser);
  await expect.poll(() => myTurn(host.page), { timeout: 30_000 }).toBe(true);
  // Long holds span several polls; none may pull the barrel back.
  for (const key of ['ArrowRight', 'ArrowLeft']) {
    expectFullSwing(await holdBarrel(host.page, key, 4500));
    const shown = parseInt(await hud(host.page, 'hud-angle'), 10);
    await expect.poll(() => Math.round(roomView(roomState.host).tanks.find(t => t.seat === 0)!.angle), { timeout: 10_000 }).toBe(shown);
    await host.page.waitForTimeout(2500); // more polls after release
    expect(parseInt(await hud(host.page, 'hud-angle'), 10)).toBe(shown);
  }
  expect(host.errors).toEqual([]);
  await host.ctx.close();
  await guest.ctx.close();
});

test('in a room, firing the last round of a weapon loads the Shell again', async ({ browser }) => {
  const { host, guest } = await roomPair(browser);
  await expect.poll(() => myTurn(host.page), { timeout: 30_000 }).toBe(true);
  await host.page.keyboard.press('g');
  await host.page.locator('#gun-grid .gun-choice', { hasText: 'Buckshot' }).click();
  await expect.poll(() => hud(host.page, 'hud-weapon'), { timeout: 10_000 }).toMatch(/^Buckshot ×1/);
  await host.page.waitForTimeout(500); // the server spaces one seat's acts 150 ms apart
  await host.page.keyboard.press('Control');
  await expect.poll(() => hud(host.page, 'hud-weapon'), { timeout: 30_000 }).toMatch(/^Shell ∞/);
  await host.ctx.close();
  await guest.ctx.close();
});

test('a unit body picked in a room reaches everyone', async ({ browser }) => {
  const { host, guest, roomState } = await roomPair(browser);
  await expect.poll(() => myTurn(host.page), { timeout: 30_000 }).toBe(true);
  await guest.page.keyboard.press('q');
  await guest.page.click('#unit-picker button[title=Walker]');
  await guest.page.keyboard.press('q');
  await expect.poll(() => {
    const room = roomView(roomState.host);
    const t = room && room.tanks.find(x => x.name === 'ZED');
    return t && t.body;
  }, { timeout: 15_000 }).toBe('walker');
  await host.ctx.close();
  await guest.ctx.close();
});

test('closing every player tab keeps the room', async ({ browser, request }) => {
  const used = async () => (await (await request.get('games/tankity/rooms.php?action=ping')).json()).rooms.used;
  const { host, guest, code } = await roomPair(browser);
  const withRoom = await used();
  await guest.page.close();
  await host.page.close();
  await new Promise(r => setTimeout(r, 5000));
  expect(await used()).toBe(withRoom);
  const still = await (await request.get(`games/tankity/rooms.php?action=state&code=${code}&since=0`)).json();
  expect(still.ok).toBe(true);
  expect(still.room.phase).toBe('play');
  await guest.ctx.close();
  await host.ctx.close();
});

/* A room's field is 720 wide, so a wide box shows scenery either side: the drawn ground reaches both
   screen edges and continues across both seams, and a shell the sim retires past the edge is still
   drawn flying on over the scenery (the sim and the server keep their out of bounds). */
test('a room shows its ground across the scenery and a shell flies on over it', async ({ browser }) => {
  const { host, guest } = await roomPair(browser);
  await expect.poll(() => myTurn(host.page), { timeout: 30_000 }).toBe(true);
  for (const [w, h] of [[852, 393], [1280, 720]] as const) {
    await host.page.setViewportSize({ width: w, height: h });
    await host.page.waitForTimeout(700);
    expect(Number(await host.page.locator('#stage').getAttribute('data-w')), `${w}×${h}: a room is 720 wide`).toBe(720);
    const gp = await host.page.evaluate(groundProbe);
    expect(gp.seams, `${w}×${h}: scenery shows either side of the 720 field`).toBe(2);
    expect(gp.probs, `${w}×${h}`).toEqual([]);
  }
  // At full power the shell leaves the 720 field whichever way the tank faces.
  await aimTo(host.page, 40);
  await setPower(host.page, 100);
  await resetRec(host.page);
  await host.page.keyboard.press('Control');
  await expect.poll(async () => shellTrack((await rec(host.page)).shells).some(([x]) => x > 760 || x < -40), { timeout: 15_000 }).toBe(true);
  await host.ctx.close(); await guest.ctx.close();
});

/* A host alone: hosting opens a lobby (friends could still join by code). */
async function hostAlone(browser: Browser) {
  const host = await newPlayer(browser);
  await setInitials(host.page, 'sol');
  await host.page.click('#rooms-open');
  await host.page.click('#host-go');
  await host.page.waitForSelector('#lobby-room:not([hidden])');
  await expect.poll(() => hud(host.page, 'lobby-code')).toMatch(/^[A-Z0-9]{6}$/);
  const code = (await hud(host.page, 'lobby-code')).trim();
  const seat = await host.page.evaluate((c: string) => (JSON.parse(localStorage.getItem('tankity-seats') || '{}').seats || []).find((s: { code: string }) => s.code === c), code);
  return { host, code, seat };
}
const occupancy = async (request: APIRequestContext) => (await (await request.get('games/tankity/rooms.php?action=ping')).json());

test('a host alone plays here: Start closes the lobby, takes no slot, and the match is solo', async ({ browser, request }) => {
  const { host, code, seat } = await hostAlone(browser);
  const { page } = host;
  await expect(page.locator('#room-hint')).toHaveText('With only you seated, Start plays here on your device.');
  // The host sets the room's speed; the match played here keeps it.
  await page.waitForTimeout(300); // the server spaces one seat's acts 150 ms apart
  const sped = await page.request.post(new URL('rooms.php?action=speed', page.url()).href, {
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': seat.csrf },
    data: { code, token: seat.token, csrf: seat.csrf, speed: 4 },
  });
  expect(sped.status()).toBe(200);
  const before = await occupancy(request);
  await page.waitForTimeout(300); // the server spaces one seat's acts 150 ms apart
  await page.click('#lobby-start');

  await expect(page.locator('#lobby-veil')).toBeHidden();
  await expect(page.locator('#log')).toContainText('Nobody else joined, so this match plays here on your device.');
  // Solo's own start: the pre-match shop, three lives, the player's turn after it.
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
  await expect(page.locator('#hud-lives')).toHaveAttribute('aria-label', '3 lives');
  await expect(page.locator('#speed-val')).toHaveText('4×');

  const after = await occupancy(request);
  expect(after.rooms.used, 'no match slot taken').toBe(before.rooms.used);
  expect(after.lobbies.used, 'the lobby closed').toBe(before.lobbies.used - 1);
  const gone = await request.get(`games/tankity/rooms.php?action=state&code=${code}&token=${seat.token}`);
  expect(gone.status()).toBe(404);
  expect(await gone.json()).toEqual({ error: 'no such room' });
  // Not in Your games: this browser holds no seat there.
  const held = await page.evaluate((c: string) => (JSON.parse(localStorage.getItem('tankity-seats') || '{}').seats || []).some((s: { code: string }) => s.code === c), code);
  expect(held).toBe(false);
  expect(host.errors).toEqual([]);
  await host.ctx.close();
});

test('an old tab starting alone is told to reload, and its lobby stays', async ({ browser, request }) => {
  const { host, code, seat } = await hostAlone(browser);
  // A bundle from before local starts sends Start without the protocol.
  await host.page.route('**/rooms.php?action=start*', route => {
    const body = JSON.parse(route.request().postData() || '{}');
    delete body.proto;
    return route.continue({ postData: JSON.stringify(body) });
  });
  await host.page.waitForTimeout(300);
  await host.page.click('#lobby-start');
  await expect(host.page.locator('#lobby-status')).toHaveText('Tankity was updated. Reload the page to keep playing.');
  await expect(host.page.locator('#lobby-veil')).toBeVisible();
  const still = await (await request.get(`games/tankity/rooms.php?action=state&code=${code}&token=${seat.token}`)).json();
  expect(still.room.phase).toBe('lobby');
  expect(host.errors).toEqual([]);
  await host.ctx.close();
});
