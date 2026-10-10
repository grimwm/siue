// Tests for the Preact overlays in src/ui (compiled to js/ui): each is rendered
// with sample props into the Node DOM stub (tools/dom-stub.mjs) and its key DOM
// asserted: the ids and classes game.css and the browser specs rely on, the
// title bar's cells, the shop's rows, and that every click reaches the callback
// the game passed. Run: node ui-test.js. Exit 0 when every check passes.
import fs from 'node:fs';
import path from 'node:path';
import { click, fire, submit, document, makeEl, els } from './tools/dom-stub.mjs';

globalThis.document = document;
const { renderHelp } = await import('./js/ui/help.js');
const { renderShop } = await import('./js/ui/shop.js');
const { renderLobby } = await import('./js/ui/lobby.js');
const { renderMenu } = await import('./js/ui/menu.js');
const { renderGuns } = await import('./js/ui/guns.js');
const { renderScores } = await import('./js/ui/scores.js');
const { renderLog } = await import('./js/ui/log.js');
const { renderTutorial } = await import('./js/ui/tutorial.js');
const { renderHud } = await import('./js/ui/hud.js');

const errors = [];
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined && !cond ? ' :: ' + extra : ''));
  if (!cond) errors.push(name);
}
const walk = (el, out = []) => { for (const c of el.children) { out.push(c); walk(c, out); } return out; };
const hasClass = (el, name) => String(el.className || '').split(' ').includes(name);
const byClass = (el, name) => walk(el).filter(n => hasClass(n, name));
const byId = (el, id) => walk(el).find(n => n.id === id);
const text = el => el.textContent;

// The keys a game.json with the default bindings shows.
const KEYS = {
  'global:escape': 'ESC', 'scroll:lineDown': 'J', 'scroll:lineUp': 'K', 'scroll:pageUp': 'PgUp',
  'scroll:pageDown': 'PgDn', 'scroll:halfUp': 'Shift+K', 'scroll:halfDown': 'Shift+J',
  'shop:selUp': '▲', 'shop:selDown': '▼', 'shop:qtyDown': '◀', 'shop:qtyUp': '▶',
  'shop:buy': 'B', 'shop:preview': 'V', 'global:fire': 'Ctrl',
  'shop:buy:1': 'Enter', 'aim:barrelLeft': '◀', 'aim:barrelRight': '▶',
  'global:new': 'N', 'global:sound': 'E', 'global:music': 'M', 'global:fullscreen': 'F', 'global:random': 'T',
  'global:rooms': 'O', 'global:tutorial': 'U', 'global:report': 'R',
};
const keyHint = (ctx, action, idx) => (idx ? KEYS[`${ctx}:${action}:${idx}`] : undefined) ?? KEYS[`${ctx}:${action}`] ?? '';

// ---- help ----
{
  const section = makeEl('help-overlay');
  let closed = 0;
  const props = { keyHint, onClose: () => { closed++; } };
  renderHelp(section, props);
  const [head, list] = section.children;
  check('help-head-and-list', head.localName === 'header' && hasClass(head, 'ov-head') && list.localName === 'ul' && hasClass(list, 'help'),
    section.children.map(c => c.localName).join());
  check('help-title', text(byId(head, 'help-h')) === 'How to play' && byId(head, 'help-h').localName === 'h2');
  const x = byId(head, 'help-close');
  check('help-close-button', x.localName === 'button' && hasClass(x, 'ov-x') && x.getAttribute('aria-label') === 'Close'
    && x.getAttribute('title') === 'Close (ESC)' && x.getAttribute('type') === 'button');
  const [esc, glyph] = x.children;
  check('help-close-esc-cap', hasClass(esc, 'key') && hasClass(esc, 'esc-cap') && esc.getAttribute('data-keyhint') === 'global:escape'
    && text(esc) === 'ESC', `${esc.className}|${text(esc)}`);
  check('help-close-glyph', hasClass(glyph, 'x-glyph') && glyph.getAttribute('aria-hidden') === 'true' && text(glyph) === '×');
  const nav = byId(head, 'nav-help');
  const cells = byClass(nav, 'scroll-keys').map(text);
  check('help-nav', hasClass(nav, 'nav-hint') && hasClass(nav, 'ov-keys') && nav.getAttribute('data-scroll-only') === ''
    && cells.join('|') === 'J/K line|PgUp/PgDn page|Shift+K/Shift+J half page', cells.join('|'));
  const items = list.children;
  check('help-items', items.length === 14 && items.every(li => li.localName === 'li'), String(items.length));
  check('help-audience-classes', items.filter(li => hasClass(li, 'keys-only')).length === 5
    && items.filter(li => hasClass(li, 'touch-only')).length === 1, 'keys-only/touch-only');
  check('help-prose-keys-are-plain', byClass(list, 'key').length === 0
    && text(items[1]).startsWith('Hold ') && /Ctrl fires and ends your turn\.$/.test(text(items[1])), text(items[1]));
  check('help-touch-prose-names-no-key', walk(items[2]).every(n => n.getAttribute?.('data-keyhint') === undefined));
  click(x);
  check('help-close-calls-back', closed === 1);
  // A new key table redraws in place: the same nodes, new key names.
  renderHelp(section, { keyHint: (c, a) => (KEYS[`${c}:${a}`] ?? '').toLowerCase(), onClose: props.onClose });
  check('help-redraw-keeps-nodes', section.children[1] === list && byId(head, 'help-close') === x);
  check('help-redraw-rewrites-keys', text(byClass(nav, 'scroll-keys')[0]) === 'j/k line' && text(esc) === 'esc');
  check('help-missing-key-is-empty', (() => {
    const s = makeEl('s');
    renderHelp(s, { keyHint: () => '', onClose() {} });
    return byClass(s, 'esc-cap').every(n => text(n) === '');
  })());
}

// ---- shop ----
const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'game.json'), 'utf8'));
const ammo = GAME.arsenal.ammo.filter(a => a.pack > 0);
const gear = GAME.arsenal.gear;
/** The shelf the way game.js lays it out: a heading per category, the free Shell under Shells. */
function shelf({ sel = 0, qty = 1, cash = 600, round = 1 } = {}) {
  const entries = [];
  let lastCat = '';
  [...ammo.map(a => ({ ...a, kind: 'ammo', w: a.key })), ...gear.map(g => ({ ...g, kind: 'gear', g: g.key }))].forEach((it, index) => {
    if (it.cat !== lastCat) {
      lastCat = it.cat;
      entries.push({ kind: 'cat', name: it.cat });
      if (it.kind === 'ammo' && !entries.some(e => e.kind === 'free')) {
        entries.push({ kind: 'free', weapon: 'shell', name: 'Shell', vals: '∞ (free)', sub: 'A plain shell.', sub2: 'Always loaded, never runs out.', icon: { kind: 'ammo', w: 'shell' } });
      }
    }
    const locked = (it.minRound || 0) > round;
    entries.push({
      kind: 'item', index, name: it.name ?? it.label, vals: `($${it.price})${qty > 1 ? ` ×${qty} = $${it.price * qty}` : ''}`,
      sub: `${it.key} line one`, sub2: locked ? `Unlocks in round ${it.minRound}.` : 'Pack of 1.',
      icon: it.kind === 'ammo' ? { kind: 'ammo', w: it.w } : { kind: 'gear', g: it.g },
      selected: index === sel, locked, disabled: locked || cash < it.price * qty, qty,
      weapon: it.kind === 'ammo' ? it.w : undefined,
    });
  });
  return entries;
}
function shopProps(over = {}) {
  const calls = { buy: [], preview: [], next: 0, leave: 0, icons: [] };
  const props = {
    keyHint, title: 'Field shop', cash: 'War chest: $600', entries: shelf(),
    next: { label: 'Start round 2 (N)' }, readyLine: null, inRoom: false,
    drawIcon: (canvas, icon) => { calls.icons.push([canvas.className, icon]); },
    arsenalRev: 1,
    onBuy: i => calls.buy.push(i), onPreview: w => calls.preview.push(w), onNext: () => { calls.next++; }, onLeave: () => { calls.leave++; },
    ...over,
  };
  return { props, calls };
}
{
  const veil = makeEl('shop-veil');
  const { props, calls } = shopProps();
  renderShop(veil, props);
  const card = veil.children[0];
  check('shop-card', veil.children.length === 1 && hasClass(card, 'card') && card.getAttribute('role') === 'dialog'
    && card.getAttribute('aria-modal') === 'true' && card.getAttribute('aria-labelledby') === 'shop-title');
  const head = card.children[0];
  check('shop-head', text(byClass(head, 'kicker')[0]) === 'Between rounds' && text(byId(head, 'shop-title')) === 'Field shop'
    && !byId(head, 'help-close') && byClass(head, 'ov-x').length === 0, 'no × on the shop');
  const nav = byId(head, 'nav-shop');
  check('shop-nav', hasClass(nav, 'nav-hint') && nav.getAttribute('data-scroll-only') === undefined
    && text(nav) === '▲▼ or JK move◀▶ packsB buy · V previewPgUp/PgDn pageShift+K/Shift+J half page', text(nav));
  check('shop-cash', text(byId(card, 'shop-cash')) === 'War chest: $600' && hasClass(byId(card, 'shop-cash'), 'runstats'));
  const list = byId(card, 'shop-list');
  check('shop-list', list.localName === 'ul' && hasClass(list, 'scores'));
  const rows = list.children.filter(li => !hasClass(li, 'shop-cat'));
  check('shop-all-20-items', rows.length === 20, String(rows.length));
  check('shop-categories', list.children.filter(li => hasClass(li, 'shop-cat')).map(text).join('|') === 'Shells|Hull and fuel|Tricks',
    list.children.filter(li => hasClass(li, 'shop-cat')).map(text).join('|'));
  const free = list.children.find(li => hasClass(li, 'shop-free'));
  check('shop-shell-row-heads-the-shells', list.children.indexOf(free) === 1 && text(byClass(free, 'shop-name')[0]) === 'Shell ∞ (free)'
    && free.children.length === 3, text(byClass(free, 'shop-name')[0]));
  check('shop-free-row-has-preview-only', byClass(free, 'acts')[0].children.map(text).join() === 'Preview');
  const items = list.children.filter(li => !hasClass(li, 'shop-cat') && !hasClass(li, 'shop-free'));
  const first = items[0];
  check('shop-row-shape', first.children.length === 3 && first.children[0].localName === 'canvas' && first.children[0].className === 'shop-icon'
    && first.children[0].getAttribute('aria-hidden') === 'true' && hasClass(first.children[1], 'shop-item') && hasClass(first.children[2], 'acts'));
  const [name, sub, sub2] = first.children[1].children;
  check('shop-row-lines', hasClass(name, 'shop-name') && hasClass(sub, 'shop-sub') && hasClass(sub2, 'shop-sub'));
  check('shop-row-name-numbers-in-own-colour', text(name) === `1. ${GAME.arsenal.ammo.find(a => a.pack > 0).name} ($${ammo[0].price})`
    && byClass(name, 'shop-vals').map(text).join() === `($${ammo[0].price})`, text(name));
  check('shop-selection', first.className === 'sel' && items.filter(li => hasClass(li, 'sel')).length === 1
    && items.slice(1).every(li => li.className === ''), items.map(li => li.className).join());
  const acts = first.children[2].children;
  check('shop-buy-and-preview-buttons', acts.length === 2 && text(acts[0]) === 'Preview (V)' && text(acts[1]) === 'Buy (B)'
    && acts.every(b => b.localName === 'button' && b.getAttribute('type') === 'button') && hasClass(acts[0].children[1], 'key')
    && acts[0].children[1].getAttribute('data-keyhint') === 'shop:preview', acts.map(text).join('|'));
  const gearRow = items[items.length - 1];
  check('shop-gear-row-has-no-preview', gearRow.children[2].children.length === 1 && /^Buy /.test(text(gearRow.children[2].children[0])));
  const locked = items.find(li => /^\d+\. NUKE/.test(text(byClass(li, 'shop-name')[0])));
  const lockedBtn = locked.children[2].children[1];
  check('shop-locked-row', text(lockedBtn) === 'Locked' && lockedBtn.disabled === true && /Unlocks in round 4/.test(text(locked.children[1].children[2])),
    text(lockedBtn));
  check('shop-icons-drawn-once-per-row', calls.icons.length === 20 && calls.icons.every(([cls]) => cls === 'shop-icon')
    && calls.icons.filter(([, i]) => i.kind === 'gear').length === gear.length, String(calls.icons.length));
  // Icons are painted when a row first appears and when the arsenal changes, not on every redraw.
  const painted = calls.icons.length;
  renderShop(veil, { ...props, entries: shelf({ qty: 2 }) });
  check('shop-redraw-does-not-repaint-icons', calls.icons.length === painted, String(calls.icons.length));
  renderShop(veil, { ...props, entries: shelf({ qty: 2 }), arsenalRev: 2 });
  check('shop-new-arsenal-repaints-icons', calls.icons.length === painted + 20, String(calls.icons.length - painted));
  renderShop(veil, { ...props, entries: shelf() });
  // Buttons report to the game.
  click(acts[1]);
  click(acts[0]);
  click(free.children[2].children[0]);
  click(gearRow.children[2].children[0]);
  check('shop-clicks-reach-the-game', calls.buy.join() === '0,18' && calls.preview.join() === `${ammo[0].key},shell`, `${calls.buy}|${calls.preview}`);
  // Start button: a plain label outside a room, and no ready line or Leave button.
  const next = byId(card, 'shop-next');
  const readyLine = byId(card, 'shop-ready');
  const leave = byId(card, 'shop-leave');
  check('shop-start-button-solo', text(next) === 'Start round 2 (N)' && hasClass(next, 'btn-primary') && next.getAttribute('aria-pressed') === undefined
    && readyLine.hidden === true && leave.hidden === true && hasClass(leave, 'btn-leave'));
  click(next);
  click(leave);
  check('shop-start-and-leave-reach-the-game', calls.next === 1 && calls.leave === 1);

  // A room: the Ready toggle reads Ready / Ready ✓ with aria-pressed, a line counts who is ready.
  renderShop(veil, shopProps({ next: { label: 'Ready (N)', pressed: false }, readyLine: '0/2 ready · shop closes in 1:30 · ABC  DEF', inRoom: true }).props);
  check('shop-ready-toggle-idle', text(next) === 'Ready (N)' && next.getAttribute('aria-pressed') === 'false'
    && readyLine.hidden === false && text(readyLine) === '0/2 ready · shop closes in 1:30 · ABC  DEF' && leave.hidden === false,
    `${text(next)}|${next.getAttribute('aria-pressed')}|${readyLine.hidden}`);
  renderShop(veil, shopProps({ next: { label: 'Ready ✓ (N)', pressed: true }, readyLine: '1/2 ready · ABC ✓  DEF', inRoom: true }).props);
  check('shop-ready-toggle-pressed', text(next) === 'Ready ✓ (N)' && next.getAttribute('aria-pressed') === 'true' && text(readyLine) === '1/2 ready · ABC ✓  DEF');
  check('shop-redraw-keeps-nodes', veil.children[0] === card && byId(card, 'shop-next') === next && byId(card, 'shop-list') === list
    && list.children.filter(li => !hasClass(li, 'shop-cat')).length === 20 && list.children.filter(li => !hasClass(li, 'shop-cat'))[2] === rows[2]);
  // Back to solo: the toggle's aria-pressed goes away with it.
  renderShop(veil, shopProps().props);
  check('shop-solo-again-drops-aria-pressed', next.getAttribute('aria-pressed') === undefined && readyLine.hidden === true && leave.hidden === true);

  // Pack counts: the bulk total shows after the price in the numbers' colour, and the button names the packs.
  renderShop(veil, shopProps({ entries: shelf({ qty: 3, sel: 2 }) }).props);
  const bulk = list.children.filter(li => !hasClass(li, 'shop-cat') && !hasClass(li, 'shop-free'))[2];
  check('shop-bulk-row', /×3 = \$/.test(text(byClass(bulk, 'shop-vals')[0])) && /^Buy ×3 \(B\)$/.test(text(bulk.children[2].children[bulk.children[2].children.length - 1])),
    text(bulk.children[1].children[0]) + '|' + text(bulk.children[2]));
  check('shop-cant-afford-disables-buy', (() => {
    renderShop(veil, shopProps({ entries: shelf({ cash: 50 }) }).props);
    const row = list.children.filter(li => !hasClass(li, 'shop-cat') && !hasClass(li, 'shop-free'))[0];
    const btn = row.children[2].children[row.children[2].children.length - 1];
    return btn.disabled === true;
  })());
  // The title changes with the round; the pre-match shop says so.
  renderShop(veil, shopProps({ title: 'Pre-match shop' }).props);
  check('shop-title-follows-the-round', text(byId(card, 'shop-title')) === 'Pre-match shop');
  // The highlighted row stays in view: scrolled to when the selection moves, left alone otherwise.
  delete globalThis.__scrolledTo;
  const fresh = makeEl('fresh-veil');
  renderShop(fresh, shopProps({ entries: shelf({ sel: 3 }) }).props);
  check('shop-first-draw-scrolls-to-selection', globalThis.__scrolledTo && hasClass(globalThis.__scrolledTo, 'sel'));
  delete globalThis.__scrolledTo;
  renderShop(fresh, shopProps({ entries: shelf({ sel: 3, qty: 2 }) }).props);
  check('shop-redraw-same-selection-leaves-scroll', globalThis.__scrolledTo === undefined);
  renderShop(fresh, shopProps({ entries: shelf({ sel: 4 }) }).props);
  check('shop-moved-selection-scrolls', globalThis.__scrolledTo && hasClass(globalThis.__scrolledTo, 'sel')
    && byId(fresh, 'shop-list').children.filter(li => hasClass(li, 'sel')).length === 1);
  check('shop-registers-ids-for-the-page', els['shop-next'] !== undefined && els['shop-list'] !== undefined);
}

// ---- lobby ----
const MAPS = [
  { id: '', name: 'Random hills' },
  { id: 'canyon', name: 'Canyon 3', profile: [0.1, 0.5, 0.9] },
  { id: 'twin', name: 'Twin Hills', profile: [0.9, 0.2, 0.9] },
];
const SEATS = [
  { human: true, name: 'abc', mode: 'human' }, { human: false, name: 'REAPER', mode: 'ai' },
  { human: false, name: 'WRAITH', mode: 'open' }, { human: true, name: 'def', mode: 'human' },
];
function lobbyProps(over = {}) {
  const calls = { close: 0, pick: [], host: [], join: [], seat: [], copy: 0, start: 0, leave: 0, icons: [] };
  const props = {
    keyHint, onClose: () => { calls.close++; }, online: true, count: '3 / 10 rooms occupied', status: '', inRoom: false,
    maps: MAPS, mapId: '', drawMapIcon: (cv, profile) => { calls.icons.push(profile); }, mapsRev: 1, prefillCode: '',
    onPickMap: id => calls.pick.push(id), onHost: i => calls.host.push(i), onJoin: (c, i) => calls.join.push([c, i]),
    code: '', link: '', hills: 'Hills: Random hills', seats: [], mySeat: 0, isHost: false, seatsHint: '',
    onSeatMode: (i, m) => calls.seat.push([i, m]), onCopy: () => { calls.copy++; }, onStart: () => { calls.start++; }, onLeave: () => { calls.leave++; },
    ...over,
  };
  return { props, calls };
}
const attr = (el, k) => el.getAttribute(k);
const listeners = (el, type) => ((el._l || {})[type] || []).length;
{
  const veil = makeEl('lobby-veil');
  veil.hidden = false;
  const { props, calls } = lobbyProps({ status: 'Knocking…' });
  renderLobby(veil, props);
  const card = veil.children[0];
  check('lobby-card', veil.children.length === 1 && hasClass(card, 'card') && attr(card, 'role') === 'dialog'
    && attr(card, 'aria-modal') === 'true' && attr(card, 'aria-labelledby') === 'lobby-title');
  const head = card.children[0];
  check('lobby-head', text(byClass(head, 'kicker')[0]) === 'Squad up, no chatter' && text(byId(head, 'lobby-title')) === 'Game rooms');
  const x = byId(head, 'lobby-close');
  check('lobby-close-button', hasClass(x, 'ov-x') && attr(x, 'title') === 'Close (ESC)' && text(byClass(x, 'esc-cap')[0]) === 'ESC');
  const nav = byId(head, 'nav-lobby');
  check('lobby-nav', attr(nav, 'data-scroll-only') === '' && text(nav) === 'J/K linePgUp/PgDn pageShift+K/Shift+J half page', text(nav));
  click(x);
  check('lobby-close-calls-back', calls.close === 1);
  // Out of a room: the intro, the forms and the hills; the room part is hidden.
  const intro = byId(card, 'lobby-intro'), rows = byId(card, 'lobby-rows'), room = byId(card, 'lobby-room');
  check('lobby-out-of-room', intro.hidden === false && rows.hidden === false && room.hidden === true
    && hasClass(intro, 'hint') && hasClass(rows, 'lobby-rows'), `${intro.hidden}|${rows.hidden}|${room.hidden}`);
  check('lobby-status-and-count', text(byId(card, 'lobby-status')) === 'Knocking…' && attr(byId(card, 'lobby-status'), 'aria-live') === 'polite'
    && text(byId(card, 'lobby-count')) === '3 / 10 rooms occupied' && attr(byId(card, 'lobby-count'), 'aria-live') === 'polite');
  const dot = byId(card, 'net-dot');
  check('lobby-dot', dot.className === 'dot on' && attr(dot, 'title') === 'room server: connected');
  renderLobby(veil, { ...props, online: false });
  check('lobby-dot-off', dot.className === 'dot off' && attr(dot, 'title') === 'room server: not connected');
  renderLobby(veil, props);
  // The hills: Random plus a silhouette per named map, one pressed.
  const picker = byId(card, 'lobby-map-picker');
  const tiles = picker.children;
  check('lobby-map-tiles', hasClass(picker, 'map-picker') && attr(picker, 'role') === 'group' && tiles.length === 3
    && tiles.map(t => attr(t, 'data-map')).join('|') === '|canyon|twin' && tiles.map(t => attr(t, 'title')).join('|') === 'Random hills|Canyon 3|Twin Hills'
    && tiles.every(t => hasClass(t, 'unit-choice') && hasClass(t, 'map-choice') && attr(t, 'type') === 'button'));
  check('lobby-map-tile-shape', tiles.every(t => t.children.length === 2 && t.children[0].localName === 'canvas' && hasClass(t.children[0], 'map-icon')
    && attr(t.children[0], 'aria-hidden') === 'true') && text(tiles[1].children[1]) === 'Canyon 3');
  check('lobby-map-pressed', tiles.map(t => attr(t, 'aria-pressed')).join() === 'true,false,false', tiles.map(t => attr(t, 'aria-pressed')).join());
  check('lobby-map-hidden-value', attr(byId(card, 'lobby-map'), 'type') === 'hidden' && byId(card, 'lobby-map').value === '');
  check('lobby-map-icons-drawn-once', calls.icons.length === 3 && calls.icons[0] === null && calls.icons[1].join() === '0.1,0.5,0.9', String(calls.icons.length));
  renderLobby(veil, { ...props, mapId: 'canyon' });
  check('lobby-map-pick-redraws-pressed', picker.children.map(t => attr(t, 'aria-pressed')).join() === 'false,true,false', picker.children.map(t => attr(t, 'aria-pressed')).join());
  check('lobby-map-redraw-does-not-repaint', calls.icons.length === 3);
  renderLobby(veil, { ...props, mapId: 'canyon', mapsRev: 2 });
  check('lobby-map-new-maps-repaint', calls.icons.length === 6, String(calls.icons.length));
  check('lobby-map-hidden-value-follows-pick', byId(card, 'lobby-map').value === 'canyon');
  click(picker.children[2]);
  check('lobby-map-click-reports-id', calls.pick.join() === 'twin');
  // The host form: initials as typed, on submit.
  const hostForm = byId(card, 'host-form');
  byId(card, 'host-initials').value = 'abc';
  submit(hostForm);
  check('lobby-host-submit', calls.host.join() === 'abc' && hasClass(byId(card, 'host-go'), 'btn-primary') && text(byId(card, 'host-go')) === 'Host a room');
  check('lobby-initials-boxes', attr(byId(card, 'host-initials'), 'placeholder') === 'ABC' && attr(byId(card, 'host-initials'), 'maxLength') === '3'
    && attr(byId(card, 'join-code'), 'maxLength') === '4' && attr(byId(card, 'join-initials'), 'placeholder') === 'ZED');
  byId(card, 'join-code').value = 'tst1';
  byId(card, 'join-initials').value = 'def';
  submit(byId(card, 'join-form'));
  check('lobby-join-submit', JSON.stringify(calls.join) === '[["tst1","def"]]', JSON.stringify(calls.join));
  // The typed boxes survive every redraw; an invite's code fills the code box once.
  renderLobby(veil, { ...props, status: 'Raising the flag…' });
  check('lobby-redraw-keeps-typing', byId(card, 'host-initials').value === 'abc' && byId(card, 'join-code').value === 'tst1');
  renderLobby(veil, { ...props, prefillCode: 'ZZ99' });
  check('lobby-invite-code-prefills', byId(card, 'join-code').value === 'ZZ99');
  byId(card, 'join-code').value = 'AAAA';
  renderLobby(veil, { ...props, prefillCode: 'ZZ99', status: 'x' });
  check('lobby-invite-code-fills-once', byId(card, 'join-code').value === 'AAAA');
  // The veil scrolls: a redraw puts it back where the player left it.
  veil.scrollTop = 150;
  fire(veil, 'scroll');
  veil.scrollTop = 0; // the browser's scroll anchoring moved it
  renderLobby(veil, { ...props, status: 'Hang tight.' });
  check('lobby-redraw-keeps-scroll', veil.scrollTop === 150, String(veil.scrollTop));
  veil.hidden = true;
  renderLobby(veil, props);
  veil.hidden = false;
  veil.scrollTop = 0; // a reopened veil starts at the top
  renderLobby(veil, props);
  check('lobby-reopened-starts-at-top', veil.scrollTop === 0, String(veil.scrollTop));

  // In a room: the forms go, the code, link, hills and seats show.
  const inRoom = { inRoom: true, code: 'TST1', link: 'http://x/play/?code=TST1', hills: 'Hills: Canyon 3', seats: SEATS, mySeat: 0, isHost: true, seatsHint: 'Tap a seat nobody holds.' };
  renderLobby(veil, { ...props, ...inRoom });
  check('lobby-in-room', intro.hidden === true && rows.hidden === true && room.hidden === false);
  check('lobby-room-code-and-link', text(byId(card, 'lobby-code')) === 'TST1' && hasClass(byId(card, 'lobby-code'), 'room-code')
    && byId(card, 'join-link').value === 'http://x/play/?code=TST1' && attr(byId(card, 'join-link'), 'aria-label') === 'Invite link'
    && text(byId(card, 'lobby-hills')) === 'Hills: Canyon 3' && text(byId(card, 'seats-hint')) === 'Tap a seat nobody holds.');
  renderLobby(veil, { ...props, ...inRoom, code: '' });
  check('lobby-no-code-yet', text(byId(card, 'lobby-code')) === '····');
  renderLobby(veil, { ...props, ...inRoom });
  const seats = byId(card, 'lobby-seats').children;
  check('lobby-seat-tiles', seats.length === 4 && seats.every(t => hasClass(t, 'unit-choice') && hasClass(t, 'seat-tile'))
    && seats.map(t => attr(t, 'data-mode')).join() === 'human,ai,open,human' && seats.map(t => attr(t, 'data-seat')).join() === '0,1,2,3');
  check('lobby-seat-labels', seats.map(t => text(byClass(t, 'seat-name')[0])).join('|') === 'ABC|AI|Open|DEF'
    && seats.map(t => text(byClass(t, 'seat-cap')[0])).join('|') === 'You · host|Tap for Open|Tap for AI|Player',
    seats.map(t => text(byClass(t, 'seat-name')[0]) + '/' + text(byClass(t, 'seat-cap')[0])).join('|'));
  check('lobby-seat-classes-and-titles', hasClass(seats[2], 'seat-open') && !hasClass(seats[1], 'seat-open')
    && hasClass(seats[0], 'seat-fixed') && !hasClass(seats[1], 'seat-fixed') && hasClass(seats[3], 'seat-fixed')
    && seats.map(t => attr(t, 'title')).join('|') === 'Seat 1|Drone battery seat|Open seat: no tank|Seat 4');
  check('lobby-host-flips-only-empty-seats', seats.map(t => attr(t, 'aria-disabled')).join() === 'true,,,true'
    && seats.map(t => listeners(t, 'click')).join() === '0,1,1,0', seats.map(t => attr(t, 'aria-disabled')).join());
  click(seats[1]); click(seats[2]); click(seats[0]);
  check('lobby-seat-click-asks-for-the-other-mode', JSON.stringify(calls.seat) === '[[1,"open"],[2,"ai"]]', JSON.stringify(calls.seat));
  const start = byId(card, 'lobby-start');
  check('lobby-host-sees-start', !start.style.display && hasClass(start, 'btn-primary') && text(start) === 'Start match');
  click(start); click(byId(card, 'lobby-leave')); click(byId(card, 'copy-link'));
  check('lobby-room-buttons-report', calls.start === 1 && calls.leave === 1 && calls.copy === 1 && text(byId(card, 'copy-link')) === 'Copy invite');
  // A guest sees the same seats, read-only, and no Start.
  renderLobby(veil, { ...props, ...inRoom, isHost: false, mySeat: 3, seatsHint: 'The host decides.' });
  check('lobby-guest-seats-read-only', seats.map(t => attr(t, 'aria-disabled')).join() === 'true,true,true,true'
    && seats.map(t => listeners(t, 'click')).join() === '0,0,0,0' && seats.every(t => hasClass(t, 'seat-fixed')),
    seats.map(t => listeners(t, 'click')).join());
  check('lobby-guest-caps', seats.map(t => text(byClass(t, 'seat-cap')[0])).join('|') === 'Player · host|Drone|Nobody|You');
  check('lobby-guest-has-no-start', start.style.display === 'none');
  renderLobby(veil, { ...props, ...inRoom });
  check('lobby-host-again-sees-start', !start.style.display && seats.map(t => listeners(t, 'click')).join() === '0,1,1,0');
  // Back out of the room: the forms return.
  renderLobby(veil, props);
  check('lobby-back-out', rows.hidden === false && intro.hidden === false && room.hidden === true);
  check('lobby-redraw-keeps-nodes', veil.children[0] === card && byId(card, 'host-form') === hostForm);
}

// ---- menu ----
const UNITS = [{ key: 'tank', name: 'Tank' }, { key: 'hover', name: 'Hover' }, { key: 'walker', name: 'Walker' }, { key: 'buggy', name: 'Buggy' }];
const SIZES = [{ key: 's', name: 'Small', scale: 0.9 }, { key: 'm', name: 'Normal', scale: 1 }, { key: 'l', name: 'Large', scale: 1.15 }, { key: 'xl', name: 'Huge', scale: 1.3 }];
function menuProps(over = {}) {
  const calls = { close: 0, newGame: 0, submit: 0, unit: [], size: [], sound: 0, music: 0, fs: 0, random: 0, rooms: 0, tutorial: 0, scores: 0, leave: 0, drawn: [] };
  const props = {
    keyHint, onClose: () => { calls.close++; }, onNewGame: () => { calls.newGame++; }, onSubmit: () => { calls.submit++; },
    units: UNITS, unit: 'tank', drawUnit: (cv, key) => { calls.drawn.push(key); }, onPickUnit: k => calls.unit.push(k),
    sizes: SIZES, size: 'm', onPickSize: k => calls.size.push(k),
    sound: true, music: true, fullscreen: false,
    onSound: () => { calls.sound++; }, onMusic: () => { calls.music++; }, onFullscreen: () => { calls.fs++; },
    onRandom: () => { calls.random++; }, onRooms: () => { calls.rooms++; }, onTutorial: () => { calls.tutorial++; }, onScores: () => { calls.scores++; },
    inRoom: false, onLeave: () => { calls.leave++; },
    ...over,
  };
  return { props, calls };
}
{
  const section = makeEl('menu-overlay');
  section.hidden = false;
  const { props, calls } = menuProps();
  renderMenu(section, props);
  const [head, form] = section.children;
  check('menu-head-and-form', hasClass(head, 'ov-head') && form.localName === 'form' && form.id === 'seed-form' && hasClass(form, 'menu-grid'));
  check('menu-title', text(byId(head, 'menu-h')) === 'Game menu' && byId(head, 'menu-close') && attr(byId(head, 'nav-menu'), 'data-scroll-only') === ''
    && text(byId(head, 'nav-menu')) === 'J/K linePgUp/PgDn pageShift+K/Shift+J half page');
  click(byId(head, 'menu-close'));
  check('menu-close-calls-back', calls.close === 1);
  const seed = byId(form, 'seed-input');
  check('menu-seed-row', seed.localName === 'input' && attr(seed, 'placeholder') === 'e.g. bam-bam-01' && text(byClass(form, 'seed-row')[0].children[0]) === 'Seed');
  const ng = byId(form, 'new-game');
  check('menu-new-game-button', hasClass(ng, 'btn-primary') && text(ng) === 'New Game (N)' && hasClass(ng.children[ng.children.length - 1], 'key')
    && attr(ng.children[ng.children.length - 1], 'data-keyhint') === 'global:new', text(ng));
  click(ng);
  submit(form);
  check('menu-new-game-and-enter-report', calls.newGame === 1 && calls.submit === 1);
  const unitTiles = byId(form, 'unit-picker').children;
  check('menu-unit-tiles', unitTiles.length === 4 && unitTiles.map(t => text(t.children[1])).join() === 'Tank,Hover,Walker,Buggy'
    && unitTiles.every(t => hasClass(t, 'unit-choice') && t.children[0].localName === 'canvas') && unitTiles.map(t => attr(t, 'aria-pressed')).join() === 'true,false,false,false');
  check('menu-unit-thumbnails-drawn-once', calls.drawn.join() === 'tank,hover,walker,buggy');
  click(unitTiles[2]);
  check('menu-unit-click-reports-key', calls.unit.join() === 'walker');
  const sizeTiles = byId(form, 'text-picker').children;
  check('menu-text-tiles', sizeTiles.length === 4 && sizeTiles.every(t => hasClass(t, 'text-choice'))
    && sizeTiles.map(t => text(t.children[1])).join() === 'Small,Normal,Large,Huge' && sizeTiles.map(t => text(t.children[0])).join() === 'Aa,Aa,Aa,Aa'
    && sizeTiles.map(t => attr(t, 'aria-pressed')).join() === 'false,true,false,false' && attr(sizeTiles[0], 'title') === 'Small text');
  check('menu-text-glyphs-grow', sizeTiles.map(t => t.children[0].style.fontSize).join() === '0.75rem,0.9rem,1.1875rem,1.5rem'
    || sizeTiles[3].children[0].style.fontSize !== sizeTiles[0].children[0].style.fontSize, sizeTiles.map(t => t.children[0].style.fontSize).join());
  click(sizeTiles[3]);
  check('menu-text-click-reports-key', calls.size.join() === 'xl');
  const toggles = ['btn-sound', 'btn-music', 'fullscreen'].map(id => byId(form, id));
  check('menu-toggles', toggles.map(t => hasClass(t, 'tile-toggle') && hasClass(t, 'unit-choice')).every(Boolean)
    && toggles.map(t => attr(t, 'aria-pressed')).join() === 'true,true,false' && toggles.map(t => text(t)).join('|') === 'Sound (E)|Music (M)|Fullscreen (F)',
    toggles.map(t => text(t)).join('|'));
  check('menu-toggle-icons', toggles.every(t => byClass(t, 'tile-icon').length === 1) && byClass(toggles[0], 'on-only').length === 1 && byClass(toggles[0], 'off-only').length === 1);
  toggles.forEach(click);
  check('menu-toggle-clicks-report', calls.sound === 1 && calls.music === 1 && calls.fs === 1);
  renderMenu(section, { ...props, sound: false, fullscreen: true });
  check('menu-toggle-states-follow', toggles.map(t => attr(t, 'aria-pressed')).join() === 'false,true,true');
  const buttons = ['random-run', 'rooms-open', 'tutorial-open', 'scores-open'].map(id => byId(form, id));
  check('menu-action-buttons', buttons.map(b => text(b)).join('|') === 'Random seed (T)|Rooms (O)|Tutorial (U)|Scores (R)'
    && buttons.every(b => b.localName === 'button' && attr(b, 'type') === 'button'), buttons.map(b => text(b)).join('|'));
  buttons.forEach(click);
  check('menu-action-clicks-report', calls.random === 1 && calls.rooms === 1 && calls.tutorial === 1 && calls.scores === 1);
  const leave = byId(form, 'menu-leave');
  check('menu-leave-hidden-outside-a-room', leave.hidden === true && hasClass(leave, 'btn-leave'));
  renderMenu(section, { ...props, inRoom: true });
  click(leave);
  check('menu-leave-in-a-room', leave.hidden === false && calls.leave === 1);
  // The seed box is the page's: a redraw leaves what was typed.
  seed.value = 'bam-bam-01';
  renderMenu(section, props);
  check('menu-redraw-keeps-nodes-and-seed', section.children[1] === form && byId(form, 'new-game') === ng && seed.value === 'bam-bam-01'
    && calls.drawn.length === 4);
  section.scrollTop = 90;
  fire(section, 'scroll');
  section.scrollTop = 0;
  renderMenu(section, { ...props, size: 'l' });
  check('menu-redraw-keeps-scroll', section.scrollTop === 90 && sizeTiles.map(t => attr(t, 'aria-pressed')).join() === 'false,false,true,false', String(section.scrollTop));
  check('menu-keys-follow-the-table', (() => {
    renderMenu(section, { ...props, keyHint: (c, a) => (KEYS[`${c}:${a}`] ?? '').toLowerCase() });
    return text(ng) === 'New Game (n)';
  })());
  check('menu-no-key-means-no-cap', (() => {
    const s2 = makeEl('menu-touch');
    renderMenu(s2, { ...props, keyHint: () => '' });
    return text(byId(s2, 'new-game')) === 'New Game ' && text(byId(s2, 'rooms-open')) === 'Rooms ';
  })());
}

// ---- weapon picker ----
function gunTiles(n = 10, loaded = 0) {
  return Array.from({ length: n }, (_, i) => ({ key: i === 0 ? 'shell' : `gun${i}`, name: i === 0 ? 'Shell' : `Gun ${i}`, title: `note ${i}`, count: i === 0 ? '∞' : `×${i}`, loaded: i === loaded }));
}
{
  const section = makeEl('gun-overlay');
  section.hidden = false;
  const calls = { close: 0, pick: [], icons: [] };
  const gp = (over = {}) => ({
    keyHint, onClose: () => { calls.close++; }, tiles: gunTiles(), cursor: 0, drawIcon: (cv, w) => { calls.icons.push(w); }, arsenalRev: 1,
    onPick: w => calls.pick.push(w), ...over,
  });
  delete globalThis.__scrolledTo;
  renderGuns(section, gp());
  const [head, grid] = section.children;
  check('guns-head-and-grid', hasClass(head, 'ov-head') && text(byId(head, 'gun-h')) === 'Weapons' && byId(head, 'gun-close') && grid.id === 'gun-grid'
    && hasClass(grid, 'gun-grid') && attr(grid, 'role') === 'group' && attr(grid, 'aria-label') === 'Weapons you own');
  const nav = byId(head, 'nav-gun');
  check('guns-nav', hasClass(nav, 'nav-hint') && attr(nav, 'data-scroll-only') === undefined && text(nav) === '◀▶▲▼ or JK moveEnter loads1-9 load that tile', text(nav));
  click(byId(head, 'gun-close'));
  check('guns-close-calls-back', calls.close === 1);
  const tiles = grid.children;
  check('guns-tiles', tiles.length === 10 && tiles.every(t => hasClass(t, 'unit-choice') && hasClass(t, 'gun-choice') && attr(t, 'type') === 'button')
    && tiles.map(t => attr(t, 'title')).slice(0, 2).join('|') === 'note 0|note 1');
  check('guns-tile-text-and-numbers', text(tiles[0].children[1]) === '1. Shell' && text(tiles[8].children[1]) === '9. Gun 8' && text(tiles[9].children[1]) === 'Gun 9'
    && text(tiles[0].children[2]) === '∞' && text(tiles[3].children[2]) === '×3' && hasClass(tiles[3].children[2], 'gun-count'),
    tiles.map(t => text(t.children[1])).join('|'));
  check('guns-loaded-gun-is-pressed', tiles.map(t => attr(t, 'aria-pressed')).join() === 'true,false,false,false,false,false,false,false,false,false');
  check('guns-cursor-class', tiles.filter(t => hasClass(t, 'cursor')).length === 1 && hasClass(tiles[0], 'cursor'));
  check('guns-icons-drawn-once-per-tile', calls.icons.length === 10 && tiles.every(t => t.children[0].localName === 'canvas' && attr(t.children[0], 'aria-hidden') === 'true'));
  click(tiles[4]);
  check('guns-click-reports-weapon', calls.pick.join() === 'gun4');
  check('guns-first-draw-scrolls-cursor-into-view', globalThis.__scrolledTo && hasClass(globalThis.__scrolledTo, 'cursor'));
  // The cursor moves: the tile scrolls into view. A redraw that leaves it: no scroll.
  delete globalThis.__scrolledTo;
  renderGuns(section, gp({ cursor: 5 }));
  check('guns-cursor-moves', tiles.filter(t => hasClass(t, 'cursor')).length === 1 && hasClass(tiles[5], 'cursor') && hasClass(globalThis.__scrolledTo ?? makeEl(''), 'cursor'));
  delete globalThis.__scrolledTo;
  renderGuns(section, gp({ cursor: 5, tiles: gunTiles(10, 2) }));
  check('guns-redraw-same-cursor-leaves-scroll', globalThis.__scrolledTo === undefined && attr(tiles[2], 'aria-pressed') === 'true' && attr(tiles[0], 'aria-pressed') === 'false');
  section.scrollTop = 70;
  fire(section, 'scroll');
  section.scrollTop = 0;
  renderGuns(section, gp({ cursor: 5, tiles: gunTiles(10, 3) }));
  check('guns-redraw-keeps-scroll', section.scrollTop === 70, String(section.scrollTop));
  // A smaller rack drops tiles and keeps the rest of the nodes.
  renderGuns(section, gp({ cursor: 1, tiles: gunTiles(4) }));
  check('guns-smaller-rack', grid.children.length === 4 && grid.children[1] === tiles[1] && calls.icons.length === 10);
  renderGuns(section, gp({ cursor: 1, tiles: gunTiles(4), arsenalRev: 2 }));
  check('guns-new-arsenal-repaints', calls.icons.length === 14, String(calls.icons.length));
}

// ---- scores ----
{
  const section = makeEl('report-overlay');
  section.hidden = false;
  const calls = { close: 0, filed: [] };
  const sp = (over = {}) => ({ keyHint, onClose: () => { calls.close++; }, rows: null, note: '', formHidden: false, onFile: n => calls.filed.push(n), ...over });
  renderScores(section, sp());
  const [head, form, list, note] = section.children;
  check('scores-shape', hasClass(head, 'ov-head') && text(byId(head, 'score-h')) === 'Scores' && byId(head, 'report-close') && attr(byId(head, 'nav-report'), 'data-scroll-only') === ''
    && form.id === 'score-form' && hasClass(form, 'seedbox') && list.id === 'scores' && hasClass(list, 'scores') && list.localName === 'ol'
    && note.id === 'scores-note' && hasClass(note, 'hint'));
  click(byId(head, 'report-close'));
  check('scores-close-calls-back', calls.close === 1);
  check('scores-form', text(form.children[0]) === 'Callsign' && attr(byId(form, 'name-input'), 'maxLength') === '24'
    && attr(byId(form, 'name-input'), 'placeholder') === 'e.g. tankity' && text(byId(form, 'save-score')) === 'File report' && attr(byId(form, 'save-score'), 'type') === 'submit');
  check('scores-before-load-shows-nothing', list.children.length === 0 && text(note) === '');
  renderScores(section, sp({ rows: [] , note: 'Showing reports from file store.' }));
  check('scores-empty', list.children.length === 1 && text(list.children[0]) === 'No after-action reports filed yet. Be the first legend.' && text(note) === 'Showing reports from file store.');
  renderScores(section, sp({ rows: ['ZED: 4200 pts (3 rounds won)', 'ABC: 100 pts (0 rounds won)'], note: 'Showing reports from file store.' }));
  check('scores-rows', list.children.length === 2 && list.children.every(li => li.localName === 'li') && text(list.children[0]) === 'ZED: 4200 pts (3 rounds won)');
  byId(form, 'name-input').value = '  zed ';
  submit(form);
  check('scores-submit-reports-the-box-as-typed', calls.filed.join('|') === '  zed ', JSON.stringify(calls.filed));
  check('scores-form-visible', !form.style.display);
  renderScores(section, sp({ rows: ['a'], formHidden: true }));
  check('scores-form-hidden-for-rooms', form.style.display === 'none' && byId(form, 'name-input').value === '  zed ');
  renderScores(section, sp({ rows: ['a'] }));
  check('scores-form-back', !form.style.display && section.children[1] === form);
  section.scrollTop = 40;
  fire(section, 'scroll');
  section.scrollTop = 0;
  renderScores(section, sp({ rows: ['a', 'b'] }));
  check('scores-reload-keeps-scroll', section.scrollTop === 40, String(section.scrollTop));
}

// ---- radio log ----
{
  const section = makeEl('log-overlay');
  section.hidden = false;
  section.scrollHeight = 500;
  let closed = 0;
  const line = (id, tone) => ({ id, text: `line ${id}`, tone });
  const lp = lines => ({ keyHint, onClose: () => { closed++; }, lines });
  renderLog(section, lp([line(1), line(2, 'info'), line(3, 'good'), line(4, 'bad')]));
  const [head, ol] = section.children;
  check('log-shape', hasClass(head, 'ov-head') && text(byId(head, 'log-h')) === 'Radio log' && byId(head, 'log-close') && attr(byId(head, 'nav-log'), 'data-scroll-only') === ''
    && ol.id === 'log' && ol.localName === 'ol' && hasClass(ol, 'log') && hasClass(ol, 'log-transparent') && attr(ol, 'aria-live') === 'polite');
  click(byId(head, 'log-close'));
  check('log-close-calls-back', closed === 1);
  check('log-lines', ol.children.length === 4 && ol.children.map(li => li.className).join() === ',info,good,bad' && text(ol.children[2]) === 'line 3');
  check('log-follows-the-newest-line', section.scrollTop === 500, String(section.scrollTop));
  // A reader who scrolled up stays put while nothing new arrives.
  section.scrollTop = 120;
  fire(section, 'scroll');
  section.scrollTop = 0;
  renderLog(section, lp([line(1), line(2, 'info'), line(3, 'good'), line(4, 'bad')]));
  check('log-redraw-keeps-the-readers-place', section.scrollTop === 120, String(section.scrollTop));
  // A new line, and the oldest trimmed: the rest keep their rows and the panel follows.
  const kept = ol.children[2];
  renderLog(section, lp([line(2, 'info'), line(3, 'good'), line(4, 'bad'), line(5)]));
  check('log-trim-keeps-rows', ol.children.length === 4 && ol.children[1] === kept && text(ol.children[3]) === 'line 5' && text(ol.children[0]) === 'line 2');
  check('log-new-line-scrolls-to-bottom', section.scrollTop === 500, String(section.scrollTop));
}

// ---- tutorial coach ----
{
  const section = makeEl('tutorial-overlay');
  let skipped = 0;
  const tp = (over = {}) => ({ keyHint: (c, a) => (c === 'global' && a === 'tutorial' ? 'U' : ''), text: '', progress: '', skip: 'Skip tutorial (ESC)', onSkip: () => { skipped++; }, ...over });
  renderTutorial(section, tp());
  const [h, p1, p2, btn, nav] = section.children;
  check('tutorial-shape', h.localName === 'h2' && h.id === 'tutorial-h' && text(h) === 'Tutorial' && p1.id === 'tutorial-text' && p2.id === 'tutorial-progress' && hasClass(p2, 'hint')
    && btn.id === 'tutorial-skip' && btn.localName === 'button' && nav.id === 'nav-tutorial' && hasClass(nav, 'nav-hint'));
  check('tutorial-idle-is-blank', text(p1) === '' && text(p2) === '');
  renderTutorial(section, tp({ text: 'Move 2 of 5: Hold ▲ or ▼ to change power.', progress: 'Follow along in the hills behind this card.' }));
  check('tutorial-move', text(p1) === 'Move 2 of 5: Hold ▲ or ▼ to change power.' && text(p2) === 'Follow along in the hills behind this card.' && section.children[1] === p1);
  check('tutorial-skip-label-is-plain-text', text(btn) === 'Skip tutorial (ESC)' && byClass(btn, 'key').length === 0);
  renderTutorial(section, tp({ skip: 'Skip tutorial' }));
  check('tutorial-skip-label-without-key-on-touch', text(btn) === 'Skip tutorial');
  click(btn);
  check('tutorial-skip-calls-back', skipped === 1);
  check('tutorial-replay-hint-names-the-key', text(nav) === 'U replays anytime; skipping once skips it for good' && byClass(nav, 'key').length === 0
    && attr(walk(nav)[0], 'data-keyhint') === 'global:tutorial', text(nav));
}


// ---- status bar ----
{
  const bar = makeEl('hud-bar');
  const calls = { weapon: 0, icons: [] };
  const hp = (over = {}) => ({
    turn: 'YOU. Aim!', angle: '62°', power: '55', fuel: '260', wind: '→ 4',
    weapon: { key: 'buck', text: 'Buckshot ×2', sr: ' · also Shell ∞' },
    armor: { shown: '100', sr: 'you 100 · REAPER:100' }, lives: { text: '♥♥♥', title: '3 lives' },
    score: { text: '$600 · round 1 · 0 pts', title: 'Next 1-up at 3000 points' }, online: false, runStats: '',
    drawIcon: (cv, w) => { calls.icons.push(w); }, arsenalRev: 1, onWeapon: () => { calls.weapon++; },
    ...over,
  });
  renderHud(bar, hp());
  const [dl, runStats] = bar.children;
  check('hud-shape', dl.localName === 'dl' && hasClass(dl, 'hud') && runStats.id === 'run-stats' && hasClass(runStats, 'runstats') && dl.children.length === 10, String(dl.children.length));
  check('hud-values', ['hud-turn', 'hud-angle', 'hud-power', 'hud-fuel', 'hud-wind'].map(id => text(byId(bar, id))).join('|') === 'YOU. Aim!|62°|55|260|→ 4'
    && attr(byId(bar, 'hud-turn'), 'aria-live') === 'polite' && byId(bar, 'hud-turn').localName === 'dd');
  check('hud-labels', dl.children.map(div => text(div.children[0])).join('|') === 'Turn|Angle|Power|Fuel|Weapon|Armor|Lives|Score|Wind|Server');
  check('hud-screen-reader-only-cells', dl.children.filter(d => hasClass(d, 'sr-only')).length === 2 && hasClass(dl.children[4].children[0], 'sr-only'));
  const gun = byId(bar, 'hud-weapon');
  check('hud-weapon-chip', gun.children.length === 1 && hasClass(gun.children[0], 'chip') && hasClass(gun.children[0].children[0], 'chip-icon')
    && attr(gun.children[0].children[0], 'aria-hidden') === 'true' && text(gun) === 'Buckshot ×2 · also Shell ∞' && hasClass(byClass(gun, 'sr-only')[0], 'sr-only'), text(gun));
  check('hud-weapon-title', attr(gun, 'title') === 'Pick a weapon');
  click(gun);
  check('hud-weapon-tap-reports', calls.weapon === 1);
  check('hud-icon-drawn', calls.icons.join() === 'buck');
  check('hud-armor-with-screen-reader-line', text(byId(bar, 'hud-armor')) === '100 you 100 · REAPER:100' && byClass(byId(bar, 'hud-armor'), 'sr-only').length === 1);
  check('hud-lives-and-score', text(byId(bar, 'hud-lives')) === '♥♥♥' && attr(byId(bar, 'hud-lives'), 'title') === '3 lives' && attr(byId(bar, 'hud-lives'), 'aria-label') === '3 lives'
    && text(byId(bar, 'hud-score')) === '$600 · round 1 · 0 pts' && attr(byId(bar, 'hud-score'), 'title') === 'Next 1-up at 3000 points');
  check('hud-server-dot-off', byId(bar, 'hud-dot').className === 'dot off' && attr(byId(bar, 'hud-dot'), 'title') === 'room server: not connected'
    && text(byId(bar, 'hud-server')) === 'offline' && hasClass(byId(bar, 'hud-server'), 'sr-only'));
  // A redraw updates in place: the same nodes, no repaint of an unchanged icon, no sr line when there is nothing to add.
  renderHud(bar, hp({ angle: '63°', online: true, runStats: 'Room TST1 · you are ABC · round 1', armor: { shown: '90', sr: '' }, weapon: { key: 'buck', text: 'Buckshot ×1', sr: '' } }));
  check('hud-redraw-in-place', bar.children[0] === dl && byId(bar, 'hud-weapon') === gun && text(byId(bar, 'hud-angle')) === '63°' && calls.icons.length === 1);
  check('hud-redraw-values', text(byId(bar, 'hud-armor')) === '90' && byClass(byId(bar, 'hud-armor'), 'sr-only').length === 0 && text(gun) === 'Buckshot ×1'
    && byClass(gun, 'sr-only').length === 0 && text(runStats) === 'Room TST1 · you are ABC · round 1');
  check('hud-server-dot-on', byId(bar, 'hud-dot').className === 'dot on' && text(byId(bar, 'hud-server')) === 'online' && attr(byId(bar, 'hud-dot'), 'title') === 'room server: connected');
  renderHud(bar, hp({ weapon: { key: 'rail', text: 'Rail ×1', sr: '' } }));
  check('hud-new-gun-repaints-icon', calls.icons.join() === 'buck,rail');
  renderHud(bar, hp({ weapon: { key: 'rail', text: 'Rail ×1', sr: '' }, arsenalRev: 2 }));
  check('hud-new-arsenal-repaints-icon', calls.icons.join() === 'buck,rail,rail');
  renderHud(bar, hp({ weapon: null }));
  check('hud-no-gun-yet', text(byId(bar, 'hud-weapon')) === '-' && byClass(gun, 'chip').length === 0);
  renderHud(bar, hp({ lives: { text: '', title: '' }, score: { text: '-', title: '' } }));
  check('hud-no-lives-no-label', attr(byId(bar, 'hud-lives'), 'aria-label') === undefined && attr(byId(bar, 'hud-score'), 'title') === undefined);
}

console.log(errors.length ? 'UI-FAILED: ' + errors.join(',') : 'UI-OK');
process.exit(errors.length ? 1 : 0);
