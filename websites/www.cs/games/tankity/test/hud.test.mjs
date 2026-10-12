// The status bar (Menu, aim numbers, four pills, the match badge) and the
// deck's Weapon label, rendered into the Node DOM stub.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { document, makeEl, click } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const { hud, gunLabel } = await importTsx(import.meta.dirname, { hud: '../src/ui/hud.tsx', gunLabel: '../src/ui/gun-label.tsx' });
const walk = (el, out = []) => { for (const c of el.children || []) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const hasClass = (el, name) => String(el.className || '').split(' ').includes(name);

const SOLO = { kind: 'solo', cash: 12450, round: 13, score: 98760, nextOneUp: 99000 };
function props(over = {}) {
  const calls = { menu: 0 };
  return {
    calls,
    p: {
      turn: 'YOU. Aim!', angle: '162°', power: '100', fuel: '100', ammo: '×2',
      armor: { shown: '100', sr: 'you 100 · REAPER:100' }, lives: 5, wind: '← 12', badge: SOLO,
      online: false, runStats: '', menuOpen: false, menuKey: 'Esc', onMenu: () => { calls.menu++; }, ...over,
    },
  };
}

test('the bar runs Menu, angle, power, fuel, AMMO, ARMOR, lives, WIND, then the badge', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props().p);
  const order = walk(bar).filter(n => n.id && ['btn-menu', 'hud-angle', 'hud-power', 'hud-fuel', 'hud-ammo', 'hud-armor', 'hud-lives', 'hud-wind', 'hud-score'].includes(n.id)).map(n => n.id);
  assert.deepEqual(order, ['btn-menu', 'hud-angle', 'hud-power', 'hud-fuel', 'hud-ammo', 'hud-armor', 'hud-lives', 'hud-wind', 'hud-score']);
  const rows = walk(bar).filter(n => hasClass(n, 'hud-row'));
  assert.deepEqual(rows.map(r => r.className), ['hud-row r1', 'hud-row r2', 'hud-row r3']);
  assert.equal(byId(bar, 'hud-turn').getAttribute('aria-live'), 'polite');
});

test('Menu has its Esc chip, says whether the menu is open, and reports a tap', () => {
  const bar = makeEl('hud-bar');
  const { p, calls } = props({ menuOpen: true });
  hud.renderHud(bar, p);
  const menu = byId(bar, 'btn-menu');
  assert.equal(menu.getAttribute('aria-expanded'), 'true');
  const chip = walk(menu).find(n => n.localName === 'kbd');
  assert.equal(chip.textContent, 'Esc');
  assert.equal(chip.getAttribute('aria-hidden'), 'true');
  click(menu);
  assert.equal(calls.menu, 1);
  hud.renderHud(bar, props({ menuKey: '' }).p);
  assert.equal(walk(byId(bar, 'btn-menu')).find(n => n.localName === 'kbd'), undefined);
});

test('lives are always a heart and a number, named for readers', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props({ lives: 3 }).p);
  const lives = byId(bar, 'hud-lives');
  assert.equal(lives.textContent, '♥ 3');
  assert.equal(lives.getAttribute('role'), 'img');
  assert.equal(lives.getAttribute('aria-label'), '3 lives');
});

test('labels shorten for the eye but readers keep the full word', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props().p);
  const shorts = walk(bar).filter(n => hasClass(n, 'short'));
  assert.deepEqual(shorts.map(n => n.textContent), ['ANG', 'PWR', 'FUEL', 'ARM', 'RND']);
  assert.ok(shorts.every(n => n.getAttribute('aria-hidden') === 'true'));
});

test('the solo badge: cash, round, points with thousands separators and the next 1-up', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props().p);
  const badge = byId(bar, 'hud-score');
  assert.equal(badge.children.length, 3);
  assert.equal(badge.children[0].textContent, '$12,450');
  assert.match(badge.children[1].textContent, /13$/);
  assert.equal(badge.children[2].textContent, '98,760 PTS');
  assert.equal(badge.getAttribute('title'), 'Next 1-up at 99,000 points');
});

test('the room badge: room code, your seat, round, and the server dot', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props({ badge: { kind: 'room', code: 'ABCD', seat: 'P2', round: 13 }, online: true }).p);
  const badge = byId(bar, 'hud-score');
  assert.equal(badge.children.length, 3);
  assert.match(badge.children[0].textContent, /^ROOM ABCD/);
  assert.equal(badge.children[1].textContent, 'YOU P2');
  assert.equal(byId(bar, 'hud-dot').className, 'dot on');
  assert.equal(byId(bar, 'hud-server').textContent, 'online');
});

test('a redraw updates in place', () => {
  const bar = makeEl('hud-bar');
  hud.renderHud(bar, props().p);
  const angle = byId(bar, 'hud-angle');
  hud.renderHud(bar, props({ angle: '63°', armor: { shown: '90', sr: '' } }).p);
  assert.equal(byId(bar, 'hud-angle'), angle);
  assert.equal(angle.textContent, '63°');
  assert.equal(byId(bar, 'hud-armor').textContent, '90');
});

test('the Weapon label: the icon painted once per gun, the name, the line, and the rest for readers', () => {
  const slot = makeEl('deck-gun');
  const painted = [];
  const gp = over => ({ gun: 'buck', name: 'Buckshot', sr: ' ×2 · also Shell ∞', line: '17 dmg · M', drawIcon: (cv, w) => painted.push(w), arsenalRev: 1, ...over });
  gunLabel.renderGunLabel(slot, gp());
  assert.equal(byId(slot, 'hud-weapon').textContent, 'Buckshot ×2 · also Shell ∞');
  assert.equal(walk(slot).find(n => hasClass(n, 'gun-line')).textContent, '17 dmg · M');
  assert.equal(walk(slot).find(n => hasClass(n, 'gun-icon')).getAttribute('aria-hidden'), 'true');
  gunLabel.renderGunLabel(slot, gp());
  gunLabel.renderGunLabel(slot, gp({ gun: 'rail', name: 'Rail' }));
  gunLabel.renderGunLabel(slot, gp({ gun: 'rail', name: 'Rail', arsenalRev: 2 }));
  assert.deepEqual(painted, ['buck', 'rail', 'rail']);
});
