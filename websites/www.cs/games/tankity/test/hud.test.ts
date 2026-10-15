// The status bar (Menu, aim numbers, four pills, the match badge) and the
// deck's Weapon label, rendered into the Node DOM stub.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asElement, byId, click, installDocument, makeEl, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { GameTank, Tables } from '../src/game-types.ts';
import type { HudDeps } from '../src/hud.ts';
import type { HudProps } from '../src/ui/hud.tsx';
import type { GunLabelProps } from '../src/ui/gun-label.tsx';

installDocument();
const { hud, gunLabel } = await importTsx<{
  hud: typeof import('../src/ui/hud.tsx');
  gunLabel: typeof import('../src/ui/gun-label.tsx');
}>(import.meta.dirname, { hud: '../src/ui/hud.tsx', gunLabel: '../src/ui/gun-label.tsx' });

/** Item `i` of a list the case reads, which must be there. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}
/** An element the case knows is drawn; it fails, naming it, when it is not. */
function must(el: StubElement | undefined, what: string): StubElement {
  assert.ok(el, `no ${what}`);
  return el;
}
// walk and byId are the stub's: elements only, which is all an id or class can match.
const hasClass = (el: StubElement, name: string) => String(el.className || '').split(' ').includes(name);
const withClass = (el: StubElement, name: string) => walk(el).filter(n => hasClass(n, name));
const kbdOf = (el: StubElement) => walk(el).find(n => n.localName === 'kbd');
const armorPill = (bar: StubElement) => must(withClass(bar, 'armor')[0], 'armor pill');
const render = (bar: StubElement, p: HudProps) => hud.renderHud(asElement(bar), p);

const SOLO = { kind: 'solo', cash: 12450, round: 13, score: 98760, nextOneUp: 99000 } as const;
function props(over: Partial<HudProps> = {}) {
  const calls = { menu: 0 };
  const p: HudProps = {
    turn: 'YOU. Aim!', angle: '162°', power: '100', fuel: '100', ammo: '×2',
    armor: { shown: '100', max: 125, sr: 'REAPER 60 of 60' }, lives: 5, wind: '← 12', badge: SOLO,
    online: false, runStats: '', menuOpen: false, menuKey: 'Q', onMenu: () => { calls.menu++; }, ...over,
  };
  return { calls, p };
}

test('the bar runs Menu, angle, power, fuel, AMMO, ARMOR, lives, WIND, then the badge', () => {
  const bar = makeEl('hud-bar');
  render(bar, props().p);
  const order = walk(bar).filter(n => n.id && ['btn-menu', 'hud-angle', 'hud-power', 'hud-fuel', 'hud-ammo', 'hud-armor', 'hud-lives', 'hud-wind', 'hud-score'].includes(n.id)).map(n => n.id);
  assert.deepEqual(order, ['btn-menu', 'hud-angle', 'hud-power', 'hud-fuel', 'hud-ammo', 'hud-armor', 'hud-lives', 'hud-wind', 'hud-score']);
  const rows = walk(bar).filter(n => hasClass(n, 'hud-row'));
  assert.deepEqual(rows.map(r => r.className), ['hud-row r1', 'hud-row r2', 'hud-row r3']);
  assert.equal(byId(bar, 'hud-turn').getAttribute('aria-live'), 'polite');
});

test('Menu has its Q chip, says whether the menu is open, and reports a tap', () => {
  const bar = makeEl('hud-bar');
  const { p, calls } = props({ menuOpen: true });
  render(bar, p);
  const menu = byId(bar, 'btn-menu');
  assert.equal(menu.getAttribute('aria-expanded'), 'true');
  const chip = must(kbdOf(menu), 'Q chip');
  assert.equal(chip.textContent, 'Q');
  assert.equal(chip.getAttribute('aria-hidden'), 'true');
  click(menu);
  assert.equal(calls.menu, 1);
  render(bar, props({ menuKey: '' }).p);
  assert.equal(kbdOf(byId(bar, 'btn-menu')), undefined);
});

test('lives are always a heart and a number, named for readers', () => {
  const bar = makeEl('hud-bar');
  render(bar, props({ lives: 3 }).p);
  const lives = byId(bar, 'hud-lives');
  assert.equal(lives.textContent, '♥ 3');
  assert.equal(lives.getAttribute('role'), 'img');
  assert.equal(lives.getAttribute('aria-label'), '3 lives');
});

test('labels shorten for the eye but readers keep the full word', () => {
  const bar = makeEl('hud-bar');
  render(bar, props().p);
  const shorts = walk(bar).filter(n => hasClass(n, 'short'));
  assert.deepEqual(shorts.map(n => n.textContent), ['ANG', 'PWR', 'FUEL', 'ARM', 'RND']);
  assert.ok(shorts.every(n => n.getAttribute('aria-hidden') === 'true'));
});

test('the solo badge: cash, round, points with thousands separators and the next 1-up', () => {
  const bar = makeEl('hud-bar');
  render(bar, props().p);
  const badge = byId(bar, 'hud-score');
  assert.equal(badge.children.length, 3);
  assert.equal(nth(badge.children, 0).textContent, '$12,450');
  assert.match(nth(badge.children, 1).textContent, /13$/);
  assert.equal(nth(badge.children, 2).textContent, '98,760 PTS');
  assert.equal(badge.getAttribute('title'), 'Next 1-up at 99,000 points');
});

test('the room badge: room code, your seat, round, and the server dot', () => {
  const bar = makeEl('hud-bar');
  render(bar, props({ badge: { kind: 'room', code: 'ABCD', seat: 'P2', round: 13 }, online: true }).p);
  const badge = byId(bar, 'hud-score');
  assert.equal(badge.children.length, 3);
  assert.match(nth(badge.children, 0).textContent, /^ROOM ABCD/);
  assert.equal(nth(badge.children, 1).textContent, 'YOU P2');
  assert.equal(byId(bar, 'hud-dot').className, 'dot on');
  assert.equal(byId(bar, 'hud-server').textContent, 'online');
});

test('a redraw updates in place', () => {
  const bar = makeEl('hud-bar');
  render(bar, props().p);
  const angle = byId(bar, 'hud-angle');
  render(bar, props({ angle: '63°', armor: { shown: '90', max: 125, sr: '' } }).p);
  assert.equal(byId(bar, 'hud-angle'), angle);
  assert.equal(angle.textContent, '63°');
  assert.equal(byId(bar, 'hud-armor').textContent, '90');
  const pill = armorPill(bar);
  assert.equal(pill.getAttribute('aria-label'), 'Armor 90 of 125');
});

test('the Weapon label: the icon painted once per gun, the name, the line, and the rest for readers', () => {
  const slot = makeEl('deck-gun');
  const drawGun = (el: StubElement, p: GunLabelProps) => gunLabel.renderGunLabel(asElement(el), p);
  const painted: string[] = [];
  const gp = (over: Partial<GunLabelProps> = {}): GunLabelProps => ({ gun: 'buck', name: 'Buckshot', sr: ' ×2 · also Shell ∞', line: '17 dmg · M', spoken: '17 damage, medium blast', drawIcon: (_cv, w) => { painted.push(w); }, arsenalRev: 1, ...over });
  drawGun(slot, gp());
  assert.equal(byId(slot, 'hud-weapon').textContent, 'Buckshot ×2 · also Shell ∞');
  const line = must(withClass(slot, 'gun-line')[0], 'gun line');
  assert.equal(line.textContent, '17 dmg · M');
  assert.equal(line.getAttribute('aria-hidden'), 'true');
  assert.ok(walk(slot).some(n => hasClass(n, 'sr-only') && n.textContent === '17 damage, medium blast'));
  assert.equal(must(withClass(slot, 'gun-icon')[0], 'gun icon').getAttribute('aria-hidden'), 'true');
  drawGun(slot, gp());
  drawGun(slot, gp({ gun: 'needle', name: 'Needle' }));
  drawGun(slot, gp({ gun: 'needle', name: 'Needle', arsenalRev: 2 }));
  assert.deepEqual(painted, ['buck', 'needle', 'needle']);
});

test('armor is named with its maximum and the rivals in words; before a match the pill and lives still read', () => {
  const bar = makeEl('hud-bar');
  render(bar, props().p);
  const pill = armorPill(bar);
  assert.equal(pill.getAttribute('aria-label'), 'Armor 100 of 125, REAPER 60 of 60');
  assert.equal(pill.getAttribute('role'), 'img');
  assert.equal(pill.getAttribute('title'), '100 of 125');
  render(bar, props({ armor: { shown: '-', max: null, sr: '' }, lives: null, badge: null }).p);
  assert.equal(armorPill(bar).getAttribute('aria-label'), 'Armor -');
  assert.equal(armorPill(bar).getAttribute('title'), undefined);
  assert.equal(byId(bar, 'hud-lives').textContent, '-');
  assert.equal(byId(bar, 'hud-score').textContent, '-');
});

test('in a room the turn line carries the time left on a long turn, or the room close that comes first', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const m = await importTsx<{ sim: typeof import('../src/sim.ts'); hudMod: typeof import('../src/hud.ts') }>(import.meta.dirname, { sim: '../src/sim.ts', hudMod: '../src/hud.ts' });
  const GAME: { arsenal: Parameters<typeof m.sim.buildArsenal>[0] } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
  const arsenal = m.sim.buildArsenal(GAME.arsenal);
  assert.ok(arsenal, 'game.json has an arsenal');
  const tables: Tables = { rev: 0, arsenal, weapons: arsenal.weapons, shop: arsenal.shop, gear: arsenal.gear, order: arsenal.order };
  const tank: GameTank = { x: 0, y: 0, seat: 0, isPlayer: true, angle: 45, power: 50, hp: 100, maxHp: 100, fuel: 100, id: 'you' };
  const G: HudDeps['G'] = { chutes: 0, tanks: [tank], turn: 0, phase: 'aim', over: false, ammo: { shell: -1 }, selected: 'shell', lives: 3, cash: 0, round: 1,
    score: 0, nextOneUp: 3000, wind: 0, shield: false, bunker: 0, jammer: 0, laststand: false, plate: 0, armor: 100, w: 720 };
  const net: HudDeps['net'] = { on: true, code: 'AB3D', seat: 0, turnSecs: 28800, turnClockLeft: () => 3600, closeClockLeft: () => null };
  const h = m.hudMod.createHud({
    G, $: () => null, tables, net, MATCH: { myTurn: true }, me: () => tank, cur: () => tank, myTank: () => tank,
    seatName: () => 'ABC', drawShellIcon() {}, keyHint: () => '', touch: () => false, menuOpen: () => false, onMenu() {},
  });
  h.renderHUD();
  assert.equal(h.HUD.turn, 'YOU. Aim! · 1h 0m left');
  net.turnSecs = 120;
  h.renderHUD();
  assert.equal(h.HUD.turn, 'YOU. Aim!');
  net.turnSecs = 86400;
  net.closeClockLeft = () => 540;
  h.renderHUD();
  assert.equal(h.HUD.turn, 'YOU. Aim! · Room closes in 9:00 unless someone plays');
});
