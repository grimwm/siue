// Tests for the Preact overlays in src/ui (compiled to js/ui): each is rendered
// with sample props into the Node DOM stub (tools/dom-stub.mjs) and its key DOM
// asserted: the ids and classes game.css and the browser specs rely on, the
// title bar's cells, the shop's rows, and that every click reaches the callback
// the game passed. Run: node ui-test.js. Exit 0 when every check passes.
import fs from 'node:fs';
import path from 'node:path';
import { click, document, makeEl, els } from './tools/dom-stub.mjs';

globalThis.document = document;
const { renderHelp } = await import('./js/ui/help.js');
const { renderShop } = await import('./js/ui/shop.js');

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
};
const keyHint = (ctx, action) => KEYS[`${ctx}:${action}`] ?? '';

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

console.log(errors.length ? 'UI-FAILED: ' + errors.join(',') : 'UI-OK');
process.exit(errors.length ? 1 : 0);
