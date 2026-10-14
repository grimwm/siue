// Tests for the Preact overlays in src/ui: each is rendered with sample props into
// the Node DOM stub (games/_kit/test/dom-stub.mjs) and its key DOM asserted: the ids and
// classes game.css and the browser specs rely on, the title bar's cells, the
// shop's rows, and that every click reaches the callback the game passed.
import { check } from '../../_kit/test/check.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import fs from 'node:fs';
import path from 'node:path';
import { click, fire, submit, document, makeEl, els } from '../../_kit/test/dom-stub.mjs';

globalThis.document = document;

const UI = ['shop', 'lobby', 'guns', 'log', 'tutorial', 'leave'];
const ui = await importTsx(import.meta.dirname, Object.fromEntries(UI.map(n => [n, `../src/ui/${n}.tsx`])));
const { renderShop } = ui.shop;
const { renderLobby } = ui.lobby;
const { renderGuns } = ui.guns;
const { renderLog } = ui.log;
const { renderTutorial } = ui.tutorial;
const { renderLeave } = ui.leave;

const walk = (el, out = []) => { for (const c of el.children) { out.push(c); walk(c, out); } return out; };
const hasClass = (el, name) => String(el.className || '').split(' ').includes(name);
const byClass = (el, name) => walk(el).filter(n => hasClass(n, name));
/** A shop row's Preview/Buy row: the text column's fourth child, under the description. */
const actsOf = li => li.children[1].children[3];
const byId = (el, id) => walk(el).find(n => n.id === id);
const text = el => el.textContent;

// The keys a game.json with the default bindings shows.
const KEYS = {
  'global:back': 'Q', 'scroll:lineDown': 'J', 'scroll:lineUp': 'K', 'scroll:pageUp': 'PgUp',
  'scroll:pageDown': 'PgDn', 'scroll:halfUp': 'Shift+K', 'scroll:halfDown': 'Shift+J',
  'shop:selUp': '▲', 'shop:selDown': '▼', 'shop:qtyDown': '◀', 'shop:qtyUp': '▶',
  'shop:buy': 'B', 'shop:preview': 'V', 'global:fire': 'Ctrl',
  'shop:buy:1': 'Enter', 'aim:barrelLeft': '◀', 'aim:barrelRight': '▶',
  'global:new': 'N', 'global:sound': 'E', 'global:music': 'M', 'global:fullscreen': 'F', 'global:random': 'T',
  'global:rooms': 'O', 'global:tutorial': 'U', 'global:report': 'R', 'shop:next': 'N', 'global:gunStock': 'I',
};
const keyHint = (ctx, action, idx) => (idx ? KEYS[`${ctx}:${action}:${idx}`] : undefined) ?? KEYS[`${ctx}:${action}`] ?? '';

// ---- shop ----
const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
// The shop groups each category under one heading, in first-appearance order (src/sim.ts buildArsenal).
const byCat = rows => { const cats = [...new Set(rows.map(r => r.cat))]; return cats.flatMap(c => rows.filter(r => r.cat === c)); };
const ammo = byCat(GAME.arsenal.ammo.filter(a => a.pack > 0));
const gear = GAME.arsenal.gear;
/** Shop rows that are not headings: the free Shell, every priced ammo pack and every trick. */
const ITEMS = 1 + ammo.length + gear.length;
/** The shelf the way main.ts lays it out: a heading per category, the free Shell under Shells. */
function shelf({ sel = 0, qty = 1, cash = 600, round = 1 } = {}) { // sel -1 is the free Shell row
  const entries = [];
  let lastCat = '';
  [...ammo.map(a => ({ ...a, kind: 'ammo', w: a.key })), ...gear.map(g => ({ ...g, kind: 'gear', g: g.key }))].forEach((it, index) => {
    if (it.cat !== lastCat) {
      lastCat = it.cat;
      entries.push({ kind: 'cat', name: it.cat });
      if (it.kind === 'ammo' && !entries.some(e => e.kind === 'free')) {
        entries.push({ kind: 'free', weapon: 'shell', selected: sel === -1, name: 'Shell', vals: '∞ (free)', sub: 'A plain shell.', sub2: 'Always loaded, never runs out.', icon: { kind: 'ammo', w: 'shell' } });
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
    keyHint, title: 'Field shop', cash: 'War chest: $600', entries: shelf(), board: null,
    next: { label: 'Start round 2', keyAt: 'shop:next' }, readyLine: null, inRoom: false,
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
  check('shop-all-items', rows.length === ITEMS, String(rows.length));
  check('shop-categories', list.children.filter(li => hasClass(li, 'shop-cat')).map(text).join('|') === 'Shells|Rollers|Hull and fuel|Tricks',
    list.children.filter(li => hasClass(li, 'shop-cat')).map(text).join('|'));
  const free = list.children.find(li => hasClass(li, 'shop-free'));
  check('shop-shell-row-heads-the-shells', list.children.indexOf(free) === 1 && text(byClass(free, 'shop-name')[0]) === 'Shell ∞ (free)'
    && free.children.length === 2, text(byClass(free, 'shop-name')[0]));
  check('shop-free-row-has-preview-only', byClass(free, 'acts')[0].children.map(text).join() === 'Preview V');
  const items = list.children.filter(li => !hasClass(li, 'shop-cat') && !hasClass(li, 'shop-free'));
  const first = items[0];
  check('shop-row-shape', first.children.length === 2 && first.children[0].localName === 'canvas' && first.children[0].className === 'shop-icon'
    && first.children[0].getAttribute('aria-hidden') === 'true' && hasClass(first.children[1], 'shop-item')
    && hasClass(actsOf(first), 'acts'));
  const [name, sub, sub2] = first.children[1].children;
  check('shop-row-lines', hasClass(name, 'shop-name') && hasClass(sub, 'shop-sub') && hasClass(sub2, 'shop-sub'));
  check('shop-row-name-numbers-in-own-colour', text(name) === `1. ${GAME.arsenal.ammo.find(a => a.pack > 0).name} ($${ammo[0].price})`
    && byClass(name, 'shop-vals').map(text).join() === `($${ammo[0].price})`, text(name));
  check('shop-selection', first.className === 'sel' && items.filter(li => hasClass(li, 'sel')).length === 1
    && items.slice(1).every(li => li.className === ''), items.map(li => li.className).join());
  const acts = actsOf(first).children;
  check('shop-buy-and-preview-buttons', acts.length === 2 && text(acts[0]) === 'Preview V' && text(acts[1]) === 'Buy B'
    && acts.every(b => b.localName === 'button' && b.getAttribute('type') === 'button') && hasClass(acts[0].children[1], 'key')
    && acts[0].children[1].getAttribute('data-keyhint') === 'shop:preview'
    && acts[0].children[1].localName === 'kbd' && acts[0].children[1].getAttribute('aria-hidden') === 'true', acts.map(text).join('|'));
  const gearRow = items[items.length - 1];
  check('shop-gear-row-has-no-preview', actsOf(gearRow).children.length === 1 && /^Buy /.test(text(actsOf(gearRow).children[0])));
  const locked = items.find(li => /^\d+\. NUKE/.test(text(byClass(li, 'shop-name')[0])));
  const lockedBtn = actsOf(locked).children[1];
  check('shop-locked-row', text(lockedBtn) === 'Locked' && lockedBtn.disabled === true && /Unlocks in round 4/.test(text(locked.children[1].children[2])),
    text(lockedBtn));
  check('shop-icons-drawn-once-per-row', calls.icons.length === ITEMS && calls.icons.every(([cls]) => cls === 'shop-icon')
    && calls.icons.filter(([, i]) => i.kind === 'gear').length === gear.length, String(calls.icons.length));
  // Icons are painted when a row first appears and when the arsenal changes, not on every redraw.
  const painted = calls.icons.length;
  renderShop(veil, { ...props, entries: shelf({ qty: 2 }) });
  check('shop-redraw-does-not-repaint-icons', calls.icons.length === painted, String(calls.icons.length));
  renderShop(veil, { ...props, entries: shelf({ qty: 2 }), arsenalRev: 2 });
  check('shop-new-arsenal-repaints-icons', calls.icons.length === painted + ITEMS, String(calls.icons.length - painted));
  renderShop(veil, { ...props, entries: shelf() });
  // Buttons report to the game.
  click(acts[1]);
  click(acts[0]);
  click(actsOf(free).children[0]);
  click(actsOf(gearRow).children[0]);
  check('shop-clicks-reach-the-game', calls.buy.join() === `0,${ammo.length + gear.length - 1}` && calls.preview.join() === `${ammo[0].key},shell`, `${calls.buy}|${calls.preview}`);
  // A Buy click drops the button's focus, so Enter later buys the selected row and not the one last clicked.
  check('shop-buy-click-drops-focus', (() => {
    let blurred = 0;
    const btn = actsOf(free).children[0];
    const real = btn.blur; btn.blur = () => { blurred++; };
    click(btn);
    btn.blur = real;
    return blurred === 1;
  })());
  // Start button: a plain label outside a room, and no ready line or Leave button.
  const next = byId(card, 'shop-next');
  const readyLine = byId(card, 'shop-ready');
  const leave = byId(card, 'shop-leave');
  check('shop-start-button-solo', text(next) === 'Start round 2 N' && hasClass(next, 'btn-primary') && next.getAttribute('aria-pressed') === undefined
    && readyLine.hidden === true && leave.hidden === true && hasClass(leave, 'btn-leave'));
  click(next);
  click(leave);
  check('shop-start-and-leave-reach-the-game', calls.next === 1 && calls.leave === 1);

  // A room: the Ready toggle reads Ready / Ready ✓ with aria-pressed, a line counts who is ready.
  renderShop(veil, shopProps({ next: { label: 'Ready', keyAt: 'shop:next', pressed: false }, readyLine: '0/2 ready · shop closes in 1:30 · ABC  DEF', inRoom: true }).props);
  check('shop-ready-toggle-idle', text(next) === 'Ready N' && next.getAttribute('aria-pressed') === 'false'
    && readyLine.hidden === false && text(readyLine) === '0/2 ready · shop closes in 1:30 · ABC  DEF' && leave.hidden === false,
    `${text(next)}|${next.getAttribute('aria-pressed')}|${readyLine.hidden}`);
  renderShop(veil, shopProps({ next: { label: 'Ready ✓', keyAt: 'shop:next', pressed: true }, readyLine: '1/2 ready · ABC ✓  DEF', inRoom: true }).props);
  check('shop-ready-toggle-pressed', text(next) === 'Ready ✓ N' && next.getAttribute('aria-pressed') === 'true' && text(readyLine) === '1/2 ready · ABC ✓  DEF');
  check('shop-redraw-keeps-nodes', veil.children[0] === card && byId(card, 'shop-next') === next && byId(card, 'shop-list') === list
    && list.children.filter(li => !hasClass(li, 'shop-cat')).length === ITEMS && list.children.filter(li => !hasClass(li, 'shop-cat'))[2] === rows[2]);
  // Back to solo: the toggle's aria-pressed goes away with it.
  renderShop(veil, shopProps().props);
  check('shop-solo-again-drops-aria-pressed', next.getAttribute('aria-pressed') === undefined && readyLine.hidden === true && leave.hidden === true);

  // Pack counts: the bulk total shows after the price in the numbers' colour, and the button names the packs.
  renderShop(veil, shopProps({ entries: shelf({ qty: 3, sel: 2 }) }).props);
  const bulk = list.children.filter(li => !hasClass(li, 'shop-cat') && !hasClass(li, 'shop-free'))[2];
  check('shop-bulk-row', /×3 = \$/.test(text(byClass(bulk, 'shop-vals')[0])) && /^Buy ×3 B$/.test(text(actsOf(bulk).children[actsOf(bulk).children.length - 1])),
    text(bulk.children[1].children[0]) + '|' + text(actsOf(bulk)));
  check('shop-cant-afford-disables-buy', (() => {
    renderShop(veil, shopProps({ entries: shelf({ cash: 50 }) }).props);
    const row = list.children.filter(li => !hasClass(li, 'shop-cat') && !hasClass(li, 'shop-free'))[0];
    const btn = actsOf(row).children[actsOf(row).children.length - 1];
    return btn.disabled === true;
  })());
  // The title changes with the round; the pre-match shop says so.
  renderShop(veil, shopProps({ title: 'Pre-match shop' }).props);
  check('shop-title-follows-the-round', text(byId(card, 'shop-title')) === 'Pre-match shop');
  // The highlighted row stays in view: scrolled to when the selection moves, left alone otherwise.
  // A draw into the hidden veil cannot scroll (nothing is laid out), so the
  // first draw once it shows still brings the row in: the pre-match shop
  // opened with Buckshot selected but scrolled out of sight on short screens.
  // The stub lays shop rows out 100 tall in a 300 tall list; a row is in view
  // when the list's scrollTop frames it.
  const inView = (list, li) => { const top = li.offsetTop; return top >= list.scrollTop && top + li.offsetHeight <= list.scrollTop + list.clientHeight; };
  const selIn = list => list.children.find(li => hasClass(li, 'sel'));
  const fresh = makeEl('fresh-veil');
  fresh.hidden = true;
  renderShop(fresh, shopProps({ entries: shelf({ sel: 3 }) }).props);
  check('shop-hidden-draw-does-not-scroll', byId(fresh, 'shop-list').scrollTop === 0);
  fresh.hidden = false;
  renderShop(fresh, shopProps({ entries: shelf({ sel: 3 }) }).props);
  check('shop-first-draw-scrolls-to-selection', byId(fresh, 'shop-list').scrollTop > 0 && inView(byId(fresh, 'shop-list'), selIn(byId(fresh, 'shop-list'))));
  const keptTop = byId(fresh, 'shop-list').scrollTop;
  renderShop(fresh, shopProps({ entries: shelf({ sel: 3, qty: 2 }) }).props);
  check('shop-redraw-same-selection-leaves-scroll', byId(fresh, 'shop-list').scrollTop === keptTop);
  renderShop(fresh, shopProps({ entries: shelf({ sel: 4 }) }).props);
  check('shop-moved-selection-scrolls', inView(byId(fresh, 'shop-list'), selIn(byId(fresh, 'shop-list')))
    && byId(fresh, 'shop-list').children.filter(li => hasClass(li, 'sel')).length === 1);
  // The free Shell row takes the highlight like any other row.
  renderShop(fresh, shopProps({ entries: shelf({ sel: -1 }) }).props);
  const freeLi = byId(fresh, 'shop-list').children.find(li => hasClass(li, 'shop-free'));
  check('shop-shell-row-selectable', hasClass(freeLi, 'sel') && inView(byId(fresh, 'shop-list'), freeLi)
    && byId(fresh, 'shop-list').children.filter(li => hasClass(li, 'sel')).length === 1);
  // A resize (the phone turning, a window drag) brings the highlighted row back
  // only when it was in view; a list scrolled away from it by hand stays put.
  const onResize = [];
  globalThis.window = { addEventListener: (t, f) => { if (t === 'resize') onResize.push(f); }, removeEventListener() {} };
  const turned = makeEl('turned-veil');
  turned.hidden = false;
  renderShop(turned, shopProps({ entries: shelf({ sel: 4 }) }).props);
  delete globalThis.window;
  const tl = byId(turned, 'shop-list');
  tl.scrollTop = 0;
  fire(tl, 'scroll');
  for (const f of onResize) f();
  check('shop-resize-keeps-a-hand-scroll', onResize.length === 1 && tl.scrollTop === 0);
  tl.scrollTop = selIn(tl).offsetTop;
  fire(tl, 'scroll');
  tl.scrollTop = 0; // the layout moved under the row, no scroll of the player's
  for (const f of onResize) f();
  check('shop-resize-keeps-the-row-in-view', inView(tl, selIn(tl)));
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
  const calls = { close: 0, pick: [], host: [], join: [], seat: [], copy: 0, start: 0, leave: 0, icons: [], initials: [] };
  const props = {
    keyHint, onClose: () => { calls.close++; }, online: true, count: '3 / 10 rooms occupied', status: '', inRoom: false,
    maps: MAPS, mapId: '', drawMapIcon: (cv, profile) => { calls.icons.push(profile); }, mapsRev: 1, prefillCode: '',
    onPickMap: id => calls.pick.push(id), initials: 'ZED', initialsRev: 0, initialsProblem: '', onInitials: w => calls.initials.push(w),
    onHost: l => calls.host.push(l), onJoin: (c, l) => calls.join.push([c, l]),
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
  check('lobby-close-button', hasClass(x, 'ov-x') && attr(x, 'title') === 'Close (Q)' && text(byClass(x, 'key')[0]) === 'Q');
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
  // One set of initials boxes above both forms, the saved set in them; hosting
  // and joining hand over what the boxes hold.
  const initialBoxes = () => [1, 2, 3].map(n => byId(card, `lobby-initial-${n}`));
  check('lobby-initials-boxes', initialBoxes().every(b => b && hasClass(b, 'initial')) && initialBoxes().map(b => b.value).join('') === 'ZED'
    && !byId(card, 'host-initials') && !byId(card, 'join-initials') && attr(byId(card, 'join-code'), 'maxLength') === '4');
  check('lobby-initials-before-forms', card.children.indexOf(byId(card, 'lobby-initials')) < card.children.indexOf(rows));
  check('lobby-intro-initials-set-here', /set here or on the title card/.test(text(intro)), text(intro));
  const hostForm = byId(card, 'host-form');
  submit(hostForm);
  check('lobby-host-submit', JSON.stringify(calls.host) === '["ZED"]' && hasClass(byId(card, 'host-go'), 'btn-primary') && text(byId(card, 'host-go')) === 'Host a room',
    JSON.stringify(calls.host));
  byId(card, 'join-code').value = 'tst1';
  submit(byId(card, 'join-form'));
  check('lobby-join-submit', JSON.stringify(calls.join) === '[["tst1","ZED"]]', JSON.stringify(calls.join));
  initialBoxes()[0].value = 'q';
  fire(initialBoxes()[0], 'input');
  renderLobby(veil, { ...props, status: 'Raising the flag…' });
  submit(hostForm);
  check('lobby-host-hands-over-half-typed', calls.host[1] === 'Q  ', JSON.stringify(calls.host));
  initialBoxes()[1].value = 'x'; fire(initialBoxes()[1], 'input');
  initialBoxes()[2].value = 'y'; fire(initialBoxes()[2], 'input');
  check('lobby-initials-report-a-full-set', JSON.stringify(calls.initials) === '["QXY"]', JSON.stringify(calls.initials));
  renderLobby(veil, { ...props, initialsProblem: 'Those initials are not allowed. Pick others.' });
  check('lobby-initials-note', text(byId(card, 'lobby-initials-note')) === 'Those initials are not allowed. Pick others.'
    && attr(byId(card, 'lobby-initials-note'), 'role') === 'status');
  renderLobby(veil, { ...props, initialsRev: 1 });
  check('lobby-initials-rev-puts-saved-back', initialBoxes().map(b => b.value).join('') === 'ZED');
  // The typed code survives every redraw; an invite's code fills the code box once.
  renderLobby(veil, { ...props, status: 'Raising the flag…' });
  check('lobby-redraw-keeps-typing', byId(card, 'join-code').value === 'tst1');
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
  check('lobby-in-room', intro.hidden === true && rows.hidden === true && room.hidden === false && byId(card, 'lobby-initials').hidden === true);
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
  check('lobby-back-out', rows.hidden === false && intro.hidden === false && room.hidden === true && byId(card, 'lobby-initials').hidden === false);
  check('lobby-redraw-keeps-nodes', veil.children[0] === card && byId(card, 'host-form') === hostForm);
}

// The turn time: a slider in the host form; in a room the host's slider, everyone else's label.
{
  const veil = makeEl('lobby-veil');
  const turns = { form: [], room: [] };
  const base = { turnSecs: 600, onTurnForm: s => turns.form.push(s), onTurnRoom: s => turns.room.push(s) };
  renderLobby(veil, lobbyProps(base).props);
  const form = byId(veil, 'host-form');
  const range = byId(form, 'lobby-turn');
  check('lobby-turn-in-host-form', !!range && attr(range, 'type') === 'range' && !!byId(form, 'host-go'));
  range.value = '0';
  fire(range, 'input');
  check('lobby-turn-reports', turns.form.join() === '60', turns.form.join());
  check('lobby-intro-turn-copy', /from one minute to a week/.test(text(byId(veil, 'lobby-intro'))) && !/crew fires/.test(text(byId(veil, 'lobby-intro'))));

  const hostRoom = makeEl('lobby-veil');
  renderLobby(hostRoom, lobbyProps({ ...base, inRoom: true, isHost: true, code: 'AB3D', seats: SEATS }).props);
  const roomRange = byId(hostRoom, 'room-turn');
  check('lobby-room-turn-host', !!roomRange && !byId(hostRoom, 'room-turn-label'));
  roomRange.value = '5';
  fire(roomRange, 'input');
  check('lobby-room-turn-reports', turns.room.join() === '86400', turns.room.join());
  check('lobby-room-close-rule', /single connection/.test(text(byId(hostRoom, 'turn-hint'))), text(byId(hostRoom, 'turn-hint')));

  const guestRoom = makeEl('lobby-veil');
  renderLobby(guestRoom, lobbyProps({ ...base, inRoom: true, isHost: false, code: 'AB3D', seats: SEATS, mySeat: 3 }).props);
  check('lobby-room-turn-guest', !byId(guestRoom, 'room-turn') && text(byId(guestRoom, 'room-turn-label')) === 'Turn time: 10 min');
}

// Your games in the lobby when not in a room; the Turn alerts button in one.
{
  const row = { code: 'AB3D', gone: false, seat: 1, phase: 'lobby', round: 0, turnSecs: 120, turn: null, yourTurn: false, turnKey: null,
    turnLeft: null, shopLeft: null, players: ['ABC', 'ZED'], hostSeat: 0, turnName: null, expiresAt: 2e9, closesIn: 600 };
  let opened = '', alerted = 0;
  const g = { rows: [row], alerts: 'off', age: 0, onOpen: c => { opened = c; }, onAlerts: () => { alerted++; } };
  const out = makeEl('lobby-veil');
  renderLobby(out, lobbyProps({ turnSecs: 120, onTurnForm() {}, onTurnRoom() {}, games: g }).props);
  const list = byId(out, 'lobby-games');
  check('lobby-your-games-out-of-room', !!list && /AB3D/.test(text(list)));
  click(walk(list).find(n => n.localName === 'button' && /Open/.test(text(n))));
  check('lobby-your-games-open', opened === 'AB3D');
  const none = makeEl('lobby-veil');
  renderLobby(none, lobbyProps({ turnSecs: 120, onTurnForm() {}, onTurnRoom() {}, games: { ...g, rows: [] } }).props);
  check('lobby-your-games-hidden-when-empty', !byId(none, 'lobby-games'));
  const inRoom = makeEl('lobby-veil');
  renderLobby(inRoom, lobbyProps({ turnSecs: 120, onTurnForm() {}, onTurnRoom() {}, games: g, inRoom: true, seats: SEATS }).props);
  const btn = byId(inRoom, 'room-alerts');
  check('lobby-room-alerts-button', !!btn && text(btn) === 'Turn alerts: off' && !byId(inRoom, 'lobby-games'));
  click(btn);
  check('lobby-room-alerts-click', alerted === 1);
}

// ---- weapon picker ----
function gunTiles(n = 10, loaded = 0) {
  return Array.from({ length: n }, (_, i) => ({ key: i === 0 ? 'shell' : `gun${i}`, name: i === 0 ? 'Shell' : `Gun ${i}`, title: `note ${i}`, count: i === 0 ? '∞' : `×${i}`, loaded: i === loaded, empty: false }));
}
{
  const section = makeEl('gun-overlay');
  section.hidden = false;
  const calls = { close: 0, pick: [], icons: [], toggle: 0 };
  const gp = (over = {}) => ({
    keyHint, onClose: () => { calls.close++; }, tiles: gunTiles(), cursor: 0, drawIcon: (cv, w) => { calls.icons.push(w); }, arsenalRev: 1,
    inStockOnly: false, onToggleStock: () => { calls.toggle++; },
    onPick: w => calls.pick.push(w), ...over,
  });
  delete globalThis.__scrolledTo;
  renderGuns(section, gp());
  const [head, grid] = section.children;
  check('guns-head-and-grid', hasClass(head, 'ov-head') && text(byId(head, 'gun-h')) === 'Weapons' && byId(head, 'gun-close') && grid.id === 'gun-grid'
    && hasClass(grid, 'gun-grid') && attr(grid, 'role') === 'group' && attr(grid, 'aria-label') === 'All weapons');
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

// The weapon picker's toggle and its empty tiles.
{
  const section = makeEl('gun-overlay-2');
  section.hidden = false;
  const calls = { pick: [], toggle: 0 };
  const gp = (over = {}) => ({
    keyHint, onClose: () => {}, tiles: gunTiles(), cursor: 0, drawIcon: () => {}, arsenalRev: 1,
    inStockOnly: false, onToggleStock: () => { calls.toggle++; }, onPick: w => calls.pick.push(w), ...over,
  });
  renderGuns(section, gp());
  const [head, grid] = section.children;
  const tools = walk(head).find(n => hasClass(n, 'ov-tools'));
  // Every gun, or only those in stock, with its key chip.
  const stock = byId(tools, 'gun-stock');
  check('guns-stock-toggle', hasClass(head, 'has-tools') && !!tools && stock.localName === 'button' && attr(stock, 'type') === 'button'
    && text(stock) === 'Show: All I' && attr(stock.children[stock.children.length - 1], 'data-keyhint') === 'global:gunStock', text(stock));
  click(stock);
  check('guns-stock-toggle-reports', calls.toggle === 1);
  renderGuns(section, gp({ inStockOnly: true }));
  check('guns-stock-toggle-in-stock', text(stock) === 'Show: In stock I' && attr(grid, 'aria-label') === 'Weapons in stock', text(stock));
  // None in stock: greyed (aria-disabled) but still a button, and a click still reports (the game says why not).
  renderGuns(section, gp({ tiles: gunTiles().map((t, i) => (i === 2 ? { ...t, count: '×0', empty: true } : t)) }));
  const emptyTile = grid.children[2];
  check('guns-empty-tile', attr(emptyTile, 'aria-disabled') === 'true' && emptyTile.disabled !== true && attr(grid.children[1], 'aria-disabled') === undefined
    && /None in stock/.test(attr(emptyTile, 'title')), attr(emptyTile, 'aria-disabled'));
  click(emptyTile);
  check('guns-empty-tile-click-reports', calls.pick.join() === 'gun2');
}

// ---- leave question ----
{
  const veil = makeEl('leave-veil');
  veil.hidden = false;
  const calls = { stay: 0, leave: 0 };
  renderLeave(veil, { keyHint, title: 'Leave this room?', text: 'The battery takes your seat.', onStay: () => { calls.stay++; }, onLeave: () => { calls.leave++; } });
  const card = veil.children[0];
  check('leave-card', hasClass(card, 'card') && card.getAttribute('role') === 'alertdialog' && attr(card, 'aria-modal') === 'true'
    && attr(card, 'aria-labelledby') === 'leave-title' && attr(card, 'aria-describedby') === 'leave-text');
  check('leave-head-and-text', hasClass(card.children[0], 'ov-head') && text(byId(card, 'leave-title')) === 'Leave this room?'
    && text(byId(card, 'leave-text')) === 'The battery takes your seat.');
  const stay = byId(card, 'leave-stay');
  const go = byId(card, 'leave-go');
  check('leave-buttons', hasClass(stay, 'btn-primary') && hasClass(go, 'btn-leave') && text(go) === 'Leave room'
    && text(stay) === 'Stay in the match Q' && byClass(stay, 'key').length === 1, text(stay));
  click(stay);
  check('leave-stay-calls-back', calls.stay === 1 && calls.leave === 0);
  click(go);
  check('leave-go-calls-back', calls.leave === 1 && calls.stay === 1);
  check('leave-no-step-out-without-a-handler', !byId(card, 'leave-step'));
}
// Step out keeps the seat: the veil offers it when the game passes onStepOut.
{
  const veil = makeEl('leave-veil');
  veil.hidden = false;
  const calls = { stay: 0, leave: 0, step: 0 };
  renderLeave(veil, {
    keyHint, title: 'Leave this room?', text: 'Step out keeps your seat; Your games brings you back.',
    onStay: () => { calls.stay++; }, onLeave: () => { calls.leave++; }, onStepOut: () => { calls.step++; },
  });
  const card = veil.children[0];
  const step = byId(card, 'leave-step');
  check('leave-step-out-button', !!step && text(step) === 'Step out' && /seat/.test(text(byId(card, 'leave-text'))));
  click(step);
  check('leave-step-out-calls-back', calls.step === 1 && calls.leave === 0 && calls.stay === 0);
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
  const tp = (over = {}) => ({ keyHint: (c, a) => (c === 'global' && a === 'tutorial' ? 'U' : c === 'global' && a === 'back' ? 'Q' : ''), text: '', progress: '', skip: 'Skip tutorial', skipKey: 'global:back', onSkip: () => { skipped++; }, ...over });
  renderTutorial(section, tp());
  const [h, p1, p2, btn, nav] = section.children;
  check('tutorial-shape', h.localName === 'h2' && h.id === 'tutorial-h' && text(h) === 'Tutorial' && p1.id === 'tutorial-text' && p2.id === 'tutorial-progress' && hasClass(p2, 'hint')
    && btn.id === 'tutorial-skip' && btn.localName === 'button' && nav.id === 'nav-tutorial' && hasClass(nav, 'nav-hint'));
  check('tutorial-idle-is-blank', text(p1) === '' && text(p2) === '');
  renderTutorial(section, tp({ text: 'Move 2 of 5: Hold ▲ or ▼ to change power.', progress: 'Follow along in the hills behind this card.' }));
  check('tutorial-move', text(p1) === 'Move 2 of 5: Hold ▲ or ▼ to change power.' && text(p2) === 'Follow along in the hills behind this card.' && section.children[1] === p1);
  check('tutorial-skip-label-has-the-q-chip', text(btn) === 'Skip tutorial Q' && byClass(btn, 'key').length === 1);
  renderTutorial(section, tp({ skipKey: undefined }));
  check('tutorial-skip-label-without-key-on-touch', text(btn) === 'Skip tutorial');
  click(btn);
  check('tutorial-skip-calls-back', skipped === 1);
  check('tutorial-replay-hint-names-the-key', text(nav) === 'U replays anytime; skipping once skips it for good' && byClass(nav, 'key').length === 0
    && attr(walk(nav)[0], 'data-keyhint') === 'global:tutorial', text(nav));
}
