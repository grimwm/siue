/* Effects editor (dev only): edits game.yaml's effects section live. The preview runs the
   game's own engine and playback helpers (fx.js: createSystem, play, drawBody),
   so what you see is what ships; only the toy ballistics around the shell are
   this page's own. */
(function () {
  'use strict';
  const FX = window.TankityFX;
  const $ = id => document.getElementById(id);
  const W = 720, H = 300, DRAFT = 'tankity-fx-draft';

  /* ---------- state ---------- */
  let defs = null;                 // game.json's effects, emitters dressed with DEFAULTS
  let arsenal = {};                // the arsenal's ammo by key (game.json)
  const cur = { weapon: 'shell', slot: 'impact', em: 0 };
  const muted = new WeakSet();     // emitters silenced in the preview only
  const sys = FX.createSystem({ max: 700 });
  let dirty = false, restartAt = 0;
  let playing = null;              // the effect set the preview's last launch plays

  const store = {
    get() { try { return localStorage.getItem(DRAFT); } catch (_) { return null; } },
    set(v) { try { localStorage.setItem(DRAFT, v); } catch (_) { /* private window */ } },
    del() { try { localStorage.removeItem(DRAFT); } catch (_) { /* private window */ } },
  };
  function say(msg, kind) {
    const s = $('status');
    s.textContent = msg;
    s.className = 'status' + (kind ? ' ' + kind : '');
  }
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const k of Object.keys(attrs || {})) {
      if (k === 'class') el.className = attrs[k];
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] !== undefined) el.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    for (const kid of kids) el.append(kid);
    return el;
  }
  const hex = c => {
    const [r, g, b] = FX.parseColor(c);
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  };

  /* ---------- data ---------- */
  function weaponKeys() { return Object.keys(defs).filter(k => k[0] !== '_'); }
  function entry() { return defs ? defs[cur.weapon] : undefined; }
  /* The effect being edited: a slot, or one of the weapon's specials. */
  function effect() {
    const w = entry();
    if (!w) return null;
    if (cur.slot.startsWith('special:')) return (w.special || {})[cur.slot.slice(8)] || null;
    return cur.slot === 'body' ? null : w[cur.slot] || null;
  }
  function slotNames() {
    const w = entry();
    const names = ['muzzle', 'trail', 'impact'];
    if (w && w.special) for (const k of Object.keys(w.special)) names.push('special:' + k);
    names.push('body');
    return names;
  }
  function load(data, fromDraft) {
    defs = FX.dress(data);
    if (!defs[cur.weapon]) cur.weapon = weaponKeys()[0];
    cur.em = 0;
    dirty = !!fromDraft;
    build();
    fire();
  }
  function touch() {
    dirty = true;
    store.set(JSON.stringify(defs));
    restartAt = performance.now() + 160;
  }

  /* ---------- left column ---------- */
  function build() {
    const sel = $('weapon');
    sel.replaceChildren(...weaponKeys().map(k => h('option', { value: k }, k + (arsenal[k] ? ' · ' + arsenal[k].name : ''))));
    sel.value = cur.weapon;
    buildSlots();
  }
  function buildSlots() {
    if (!slotNames().includes(cur.slot)) cur.slot = 'impact';
    $('slots').replaceChildren(...slotNames().map(n => h('button', {
      type: 'button', 'aria-pressed': n === cur.slot ? 'true' : 'false', 'data-slot': n,
      onclick: () => { cur.slot = n; cur.em = 0; buildSlots(); },
    }, n.replace('special:', '★ '))));
    const w = entry();
    const have = w.special || {};
    $('special-name').replaceChildren(...FX.SPECIALS.filter(n => !have[n]).map(n => h('option', { value: n }, n)));
    $('special-add').disabled = !$('special-name').options.length;
    buildExtra();
    buildEmitters();
  }
  /* Slot-level settings: the effect's screen block, or the weapon's body. */
  function buildExtra() {
    const box = $('slot-extra');
    box.replaceChildren();
    const w = entry();
    if (cur.slot === 'body') {
      const body = w.body || (w.body = {});
      box.append(h('p', { class: 'help' }, 'The shell itself: halo (glow radius), alpha, pulse (Hz), stretch (light behind it).'));
      for (const [k, min, max, step] of [['halo', 0, 40, 0.5], ['alpha', 0, 1, 0.05], ['pulse', 0, 20, 0.5], ['stretch', 0, 60, 1]]) {
        box.append(numberRow(k, body[k] === undefined ? FX.BODY_DEFAULTS[k] : body[k], min, max, step, v => { body[k] = v; touch(); }));
      }
      return;
    }
    const ef = effect();
    if (!ef) return;
    const sc = ef.screen || {};
    const shakeOn = typeof sc.shake === 'number';
    const gshake = arsenal[cur.weapon] && arsenal[cur.weapon].gfx ? arsenal[cur.weapon].gfx.shake : undefined;
    box.append(h('h2', {}, 'Screen'));
    box.append(h('div', { class: 'row' },
      h('span', {}, 'Shake'),
      h('input', { type: 'checkbox', id: 'shake-on', 'aria-label': 'Set shake', ...(shakeOn ? { checked: true } : {}), onchange: e => {
        const s = ef.screen || (ef.screen = {});
        if (e.target.checked) s.shake = gshake === undefined ? 0.3 : gshake; else delete s.shake;
        pruneScreen(ef); touch(); buildExtra();
      } }),
      shakeOn ? h('input', { type: 'number', id: 'shake-val', min: 0, max: 1, step: 0.05, value: sc.shake, onchange: e => { ef.screen.shake = +e.target.value; touch(); } })
        : h('span', { class: 'hint' }, 'weapon default' + (gshake === undefined ? '' : ' (' + gshake + ')'))));
    const fl = sc.flash;
    box.append(h('div', { class: 'row' },
      h('span', {}, 'Flash'),
      h('input', { type: 'checkbox', id: 'flash-on', 'aria-label': 'Screen flash', ...(fl ? { checked: true } : {}), onchange: e => {
        const s = ef.screen || (ef.screen = {});
        if (e.target.checked) s.flash = { color: '#ffffff', alpha: 0.2, dur: 0.25 }; else delete s.flash;
        pruneScreen(ef); touch(); buildExtra();
      } })));
    if (fl) {
      box.append(h('div', { class: 'row' }, h('span', {}, 'Colour'),
        h('input', { type: 'color', value: hex(fl.color), onchange: e => { fl.color = e.target.value; touch(); } })));
      box.append(numberRow('Alpha', fl.alpha, 0, 1, 0.05, v => { fl.alpha = v; touch(); }));
      box.append(numberRow('Seconds', fl.dur, 0.05, 1.5, 0.05, v => { fl.dur = v; touch(); }));
    }
  }
  function pruneScreen(ef) { if (ef.screen && !Object.keys(ef.screen).length) delete ef.screen; }
  function numberRow(label, value, min, max, step, onset) {
    const num = h('input', { type: 'number', min, max, step, value, 'aria-label': label + ' value' });
    const rng = h('input', { type: 'range', min, max, step, value, 'aria-label': label });
    num.addEventListener('input', () => { if (num.value !== '') { rng.value = num.value; onset(+num.value); } });
    rng.addEventListener('input', () => { num.value = rng.value; onset(+rng.value); });
    return h('div', { class: 'row' }, h('span', {}, label), rng, num);
  }
  function emitterLabel(em) {
    const bits = [em.shape];
    if (em.rate > 0) bits.push(em.rate + '/s'); else if (em.count) bits.push('×' + em.count);
    if (em.sheet) bits.push(em.sheet);
    if (em.delay) bits.push('+' + em.delay + 's');
    return bits.join(' ');
  }
  function buildEmitters() {
    const ol = $('emitters');
    ol.replaceChildren();
    const ef = effect();
    $('em-add').disabled = !ef;
    if (!ef) { buildParams(); return; }
    if (cur.em >= ef.emitters.length) cur.em = Math.max(0, ef.emitters.length - 1);
    ef.emitters.forEach((em, i) => {
      const act = (fn) => e => { e.stopPropagation(); fn(); };
      const name = 'emitter ' + (i + 1) + ', ' + em.shape, current = i === cur.em ? 'true' : 'false';
      ol.append(h('li', { class: muted.has(em) ? 'muted' : '', 'aria-current': current, 'data-i': i },
        h('button', { type: 'button', class: 'label', 'aria-current': current, onclick: () => { cur.em = i; buildEmitters(); } }, h('span', { class: 'swatch', style: 'background:' + hex(em.colors[Math.floor((em.colors.length - 1) / 2)]) }), '#' + (i + 1) + ' ' + emitterLabel(em)),
        h('button', { type: 'button', title: muted.has(em) ? 'Unmute in preview' : 'Mute in preview', 'aria-label': (muted.has(em) ? 'Unmute ' : 'Mute ') + name, onclick: act(() => { if (muted.has(em)) muted.delete(em); else muted.add(em); buildEmitters(); fire(); }) }, 'M'),
        h('button', { type: 'button', title: 'Move up', 'aria-label': 'Move up ' + name, onclick: act(() => move(i, -1)) }, '↑'),
        h('button', { type: 'button', title: 'Move down', 'aria-label': 'Move down ' + name, onclick: act(() => move(i, 1)) }, '↓'),
        h('button', { type: 'button', title: 'Duplicate', 'aria-label': 'Duplicate ' + name, onclick: act(() => { ef.emitters.splice(i + 1, 0, FX.cloneEmitter(em)); cur.em = i + 1; touch(); buildEmitters(); }) }, '⧉'),
        h('button', { type: 'button', title: 'Remove', 'aria-label': 'Remove ' + name, onclick: act(() => { ef.emitters.splice(i, 1); touch(); buildEmitters(); }) }, '✕')));
    });
    buildParams();
  }
  function move(i, d) {
    const list = effect().emitters, j = i + d;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    cur.em = j; touch(); buildEmitters();
  }

  /* ---------- right column: every emitter parameter ---------- */
  const GROUPS = [
    ['Look', ['shape', 'size', 'sizeEnd', 'ease', 'colors', 'alpha', 'glow', 'round', 'length', 'width', 'unit']],
    ['Emission', ['count', 'rate', 'delay', 'duration']],
    ['Motion', ['life', 'speed', 'aim', 'angle', 'spread', 'offset', 'edge', 'gravity', 'drag', 'wind']],
    ['Sprite', ['sheet', 'fps', 'scale', 'anchor', 'rotJitter', 'spin', 'tint']],
  ];
  const PAIRS = new Set(['life', 'speed', 'size', 'spin']);
  const BOOLS = new Set(['glow', 'round', 'edge']);
  const ENUMS = { shape: FX.SHAPES, aim: FX.AIMS, ease: FX.EASES, unit: ['px', 'r'], anchor: ['center', 'bottom'] };
  function range(name, em) {
    const r = em.unit === 'r';
    switch (name) {
      case 'count': return [0, 80, 1];
      case 'rate': return [0, 160, 1];
      case 'delay': return [0, 2, 0.01];
      case 'duration': return [0, 3, 0.05];
      case 'sizeEnd': return [0, 10, 0.05];
      case 'spread': return [0, 360, 1];
      case 'angle': return [-180, 180, 1];
      case 'offset': return r ? [0, 2, 0.01] : [0, 80, 1];
      case 'gravity': return [-400, 600, 5];
      case 'drag': return [0, 6, 0.05];
      case 'wind': return [0, 1, 0.05];
      case 'length': return r ? [0, 3, 0.01] : [0, 320, 1];
      case 'width': return [0.5, 10, 0.5];
      case 'fps': return [0, 60, 1];
      case 'scale': return [0.2, 3, 0.05];
      case 'rotJitter': return [0, 180, 1];
      case 'life': return [0.02, 3, 0.01];
      case 'speed': return r ? [-10, 12, 0.05] : [-600, 800, 5];
      case 'size': return r ? [0, 3, 0.01] : [0, 40, 0.1];
      case 'spin': return [-720, 720, 5];
      default: return [0, 100, 1];
    }
  }
  const visible = (name, em) => {
    if (name === 'round') return em.shape === 'dot';
    if (name === 'length') return ['streak', 'beam', 'bolt'].includes(em.shape);
    if (name === 'width') return em.shape === 'ring';
    if (name === 'rotJitter' || name === 'spin') return ['sprite', 'spark', 'streak'].includes(em.shape);
    return true;
  };
  function setField(em, name, value) {
    if (JSON.stringify(value) === JSON.stringify(FX.DEFAULTS[name])) delete em[name]; else em[name] = value;
    touch();
  }
  function fieldRow(em, name) {
    const own = Object.prototype.hasOwnProperty.call(em, name);
    const row = h('div', { class: 'field' + (own ? ' is-set' : ''), 'data-field': name }, h('label', { for: 'f-' + name, title: (FX.DEFAULTS[name] !== undefined ? 'default ' + JSON.stringify(FX.DEFAULTS[name]) : '') }, name));
    const mark = () => row.classList.toggle('is-set', Object.prototype.hasOwnProperty.call(em, name));
    const reset = h('button', { type: 'button', class: 'reset', title: 'Back to the default', 'aria-label': 'Reset ' + name, onclick: () => { delete em[name]; touch(); buildParams(); buildEmittersLabelOnly(); } }, '↺');
    const done = v => { setField(em, name, v); mark(); };
    const id = 'f-' + name;
    const [min, max, step] = range(name, em);
    if (ENUMS[name]) {
      const sel = h('select', { id }, ...ENUMS[name].map(o => h('option', { value: o }, o)));
      sel.value = em[name];
      sel.addEventListener('change', () => { done(sel.value); if (name === 'shape' || name === 'unit') buildParams(); buildEmittersLabelOnly(); });
      row.append(sel);
    } else if (BOOLS.has(name)) {
      const cb = h('input', { type: 'checkbox', id, ...(em[name] ? { checked: true } : {}) });
      cb.addEventListener('change', () => done(cb.checked));
      row.append(cb);
    } else if (PAIRS.has(name)) {
      const a = h('input', { type: 'number', id, min, max, step, value: em[name][0], 'aria-label': name + ' min' });
      const b = h('input', { type: 'number', min, max, step, value: em[name][1], 'aria-label': name + ' max' });
      const upd = () => { if (a.value !== '' && b.value !== '') done([+a.value, +b.value]); };
      a.addEventListener('input', upd); b.addEventListener('input', upd);
      row.append(a, h('span', { class: 'hint' }, 'to'), b);
    } else if (name === 'colors') {
      const chips = h('div', { class: 'chips', id });
      const draw = () => {
        chips.replaceChildren(...em.colors.map((c, i) => h('span', { class: 'chip' },
          h('input', { type: 'color', value: hex(c), 'aria-label': 'Colour ' + (i + 1), oninput: e => { const next = em.colors.slice(); next[i] = e.target.value; done(next); } }),
          em.colors.length > 1 ? h('button', { type: 'button', 'aria-label': 'Remove colour', onclick: () => { const next = em.colors.slice(); next.splice(i, 1); done(next); draw(); } }, '✕') : '')),
        h('button', { type: 'button', 'aria-label': 'Add colour', onclick: () => { done(em.colors.concat(em.colors[em.colors.length - 1])); draw(); } }, '+'));
      };
      draw();
      row.append(chips);
    } else if (name === 'alpha') {
      const chips = h('div', { class: 'chips', id });
      const draw = () => {
        chips.replaceChildren(...em.alpha.map((v, i) => h('span', { class: 'chip' },
          h('input', { type: 'number', min: 0, max: 1, step: 0.05, value: v, 'aria-label': 'Alpha key ' + (i + 1), oninput: e => { if (e.target.value === '') return; const next = em.alpha.slice(); next[i] = +e.target.value; done(next); } }),
          em.alpha.length > 1 ? h('button', { type: 'button', 'aria-label': 'Remove key', onclick: () => { const next = em.alpha.slice(); next.splice(i, 1); done(next); draw(); } }, '✕') : '')),
        h('button', { type: 'button', 'aria-label': 'Add key', onclick: () => { done(em.alpha.concat(0)); draw(); } }, '+'));
      };
      draw();
      row.append(chips);
    } else if (name === 'sheet') {
      const names = Object.keys(FX.sheets);
      const sel = h('select', { id }, h('option', { value: '' }, '(none)'), ...names.map(n => h('option', { value: n }, n)));
      if (em.sheet && !names.includes(em.sheet)) sel.append(h('option', { value: em.sheet }, em.sheet + ' (missing)'));
      sel.value = em.sheet;
      sel.addEventListener('change', () => { done(sel.value); buildEmittersLabelOnly(); });
      row.append(sel);
    } else if (name === 'tint') {
      const col = h('input', { type: 'color', id, value: hex(em.tint || '#ffffff'), oninput: e => done(e.target.value) });
      row.append(col, h('button', { type: 'button', 'aria-label': 'Clear tint', onclick: () => { done(''); col.value = '#ffffff'; } }, 'none'));
    } else {
      const num = h('input', { type: 'number', min, max, step, value: em[name], 'aria-label': name + ' value' });
      const rng = h('input', { type: 'range', min, max, step, value: em[name], 'aria-label': name + ' slider', id });
      const upd = v => { if (v !== '') done(+v); };
      num.addEventListener('input', () => { rng.value = num.value; upd(num.value); });
      rng.addEventListener('input', () => { num.value = rng.value; upd(rng.value); });
      row.append(rng, num);
    }
    row.append(reset);
    return row;
  }
  function buildEmittersLabelOnly() {
    const ef = effect();
    if (!ef) return;
    const labels = $('emitters').querySelectorAll('li .label');
    ef.emitters.forEach((em, i) => {
      if (!labels[i]) return;
      labels[i].replaceChildren(h('span', { class: 'swatch', style: 'background:' + hex(em.colors[Math.floor((em.colors.length - 1) / 2)]) }), '#' + (i + 1) + ' ' + emitterLabel(em));
    });
  }
  function buildParams() {
    const box = $('params');
    box.replaceChildren();
    const ef = effect();
    $('param-title').textContent = ef && ef.emitters[cur.em] ? 'Emitter #' + (cur.em + 1) + ' · ' + cur.weapon + ' ' + cur.slot.replace('special:', 'special ') : 'Parameters';
    if (!ef || !ef.emitters[cur.em]) {
      box.append(h('p', { class: 'help' }, cur.slot === 'body' ? 'The shell body has no emitters; edit its fields on the left.' : 'No emitter selected. Add one on the left.'));
      return;
    }
    const em = ef.emitters[cur.em];
    box.append(h('p', { class: 'help' }, 'Highlighted names differ from the default; ↺ resets one. unit "r" scales size, speed, offset and length by the blast radius.'));
    for (const [title, names] of GROUPS) {
      if (title === 'Sprite' && em.shape !== 'sprite') continue;
      const rows = names.filter(n => visible(n, em));
      if (!rows.length) continue;
      box.append(h('div', { class: 'group' }, h('h3', {}, title), ...rows.map(n => fieldRow(em, n))));
    }
  }

  /* ---------- preview: a toy range around the real engine ---------- */
  const cv = $('stage'), c = cv.getContext('2d');
  const SX = 70, TX = 590;
  let terr = [], shells = [], booms = [], phase = 'idle', phaseT = 0, target = { hp: 1 }, time = 0, blasts = [];
  function makeTerrain() {
    terr = new Array(W);
    for (let x = 0; x < W; x++) terr[x] = 232 + 12 * Math.sin(x / 70 + 1) + 6 * Math.sin(x / 31);
  }
  const groundAt = x => terr[Math.max(0, Math.min(W - 1, Math.round(x)))];
  function carve(x, y, r) {
    for (let ix = Math.max(0, Math.floor(x - r)); ix <= Math.min(W - 1, Math.ceil(x + r)); ix++) {
      const dx = ix - x;
      terr[ix] = Math.min(H - 4, Math.max(terr[ix], y + Math.sqrt(Math.max(0, r * r - dx * dx)) * 0.75));
    }
  }
  /* The entry as the preview plays it: muted emitters filtered out. */
  function playSet() {
    const w = entry(), out = {};
    const strip = ef => ef && { emitters: ef.emitters.filter(e => !muted.has(e)), screen: ef.screen };
    for (const s of FX.SLOTS) out[s] = strip(w[s]) || { emitters: [] };
    out.body = w.body;
    out.special = {};
    for (const k of Object.keys(w.special || {})) out.special[k] = strip(w.special[k]);
    return out;
  }
  const weapon = () => arsenal[cur.weapon] || { radius: cur.weapon === 'laststand' ? 44 : 26, speed: 1, effect: 'shot', gfx: { shell: '#ffe27a' } };
  function fire() {
    sys.clear();
    sys.reduced = $('reduced').checked;
    makeTerrain();
    shells = []; booms = []; blasts = [];
    phase = 'aim'; phaseT = 0.35;
    target = { hp: 1 };
  }
  function launch() {
    const w = weapon(), set = (playing = playSet());
    const flat = !!w.flat, ang = (flat ? 11 : 55) * Math.PI / 180, g = flat ? 70 : 170;
    const sx = SX, sy = groundAt(SX) - 14, tx = TX, ty = groundAt(TX) - 12;
    const v = Math.sqrt(g * (tx - sx) ** 2 / (2 * Math.cos(ang) ** 2 * (ty - sy + (tx - sx) * Math.tan(ang))));
    const n = w.effect === 'pellets' ? (w.pellets || 3) : 1;
    for (let i = 0; i < n; i++) {
      const a = ang + (n === 1 ? 0 : (i - (n - 1) / 2) * (w.spread || 0.1));
      shells.push({ x: sx, y: sy, vx: Math.cos(a) * v, vy: -Math.sin(a) * v, g, age: 0, r: w.radius, dmg: w.dmg, pierced: false, split: false, fx: null, fxs: null });
    }
    const m0 = shells[0];
    FX.play.muzzle(sys, set, sx, sy, Math.atan2(m0.vy, m0.vx));
    phase = 'fly'; phaseT = 0;
  }
  function explode(s, set) {
    const w = weapon();
    FX.play.impact(sys, set, s.x, s.y, s.r);
    carve(s.x, s.y, s.r);
    blasts.push({ x: s.x, y: s.y, r: s.r, t: 0 });
    const ty = groundAt(TX) - 12;
    if (w.effect === 'emp' && Math.hypot(s.x - TX, s.y - ty) < s.r + 14) FX.play.special(sys, set, 'arc', TX, ty, 0);
  }
  function stepShells(dt, set) {
    const w = weapon(), sp = w.speed || 1, ty = groundAt(TX) - 12;
    for (const s of shells) {
      const d = dt * sp;
      s.age += d;
      if (w.effect === 'seeker') {
        const dx = TX - s.x, dy = ty - s.y, L = Math.max(1, Math.hypot(dx, dy));
        s.vx += dx / L * (w.steer || 70) * d; s.vy += dy / L * (w.steer || 70) * d;
      }
      s.vy += s.g * d;
      s.x += s.vx * d; s.y += s.vy * d;
      FX.play.trail(sys, set, s, dt, s.x, s.y, s.vx, s.vy);
      const hit = Math.hypot(s.x - TX, s.y - ty) < 13;
      if (w.effect === 'cluster' && !s.split && s.age >= (w.fuse || 0.9)) {
        s.split = true; s.dead = true;
        FX.play.special(sys, set, 'split', s.x, s.y, Math.atan2(s.vy, s.vx));
        const n = w.split || 4, base = Math.atan2(s.vy, s.vx), spd = Math.hypot(s.vx, s.vy) * 0.85;
        for (let i = 0; i < n; i++) {
          const a = base + (i - (n - 1) / 2) * (w.fan || 0.22);
          shells.push({ x: s.x, y: s.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, g: s.g, age: 0, r: w.subRadius || w.radius, split: true, fx: null, fxs: null });
        }
        continue;
      }
      if (w.effect === 'pierce' && hit && !s.pierced) {
        s.pierced = true;
        FX.play.special(sys, set, 'pierce', s.x, s.y, Math.atan2(s.vy, s.vx));
        explode(s, set);
        continue;
      }
      const prox = w.effect === 'proximity' && Math.hypot(s.x - TX, s.y - ty) < (w.prox || 34);
      if (hit || prox || (s.age > 0.1 && s.y >= groundAt(s.x)) || s.x > W + 20 || s.y > H + 40) {
        s.dead = true;
        explode(s, set);
      }
    }
    shells = shells.filter(s => !s.dead);
  }
  let last = 0, fpsAcc = 0, fpsN = 0, fps = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    const real = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    fpsAcc += real; fpsN++;
    if (fpsAcc > 0.5) { fps = Math.round(fpsN / fpsAcc); fpsAcc = 0; fpsN = 0; }
    if (restartAt && performance.now() >= restartAt) { restartAt = 0; fire(); }
    const dt = real * ($('slow').checked ? 0.25 : 1);
    time += dt;
    sys.reduced = $('reduced').checked;
    sys.step(dt);
    for (const b of blasts) b.t += dt;
    blasts = blasts.filter(b => b.t < 0.9);
    if (phase === 'aim') { phaseT -= dt; if (phaseT <= 0) launch(); }
    else if (phase === 'fly') {
      stepShells(dt, playing);
      if (!shells.length) { phase = 'settle'; phaseT = 0; }
    } else if (phase === 'settle') {
      phaseT += dt;
      if (sys.live === 0 && phaseT > 0.5 && sys.flash.a <= 0 || phaseT > 4) {
        phase = 'done'; phaseT = 0;
      }
    } else if (phase === 'done') {
      phaseT += dt;
      if (phaseT > 0.5 && $('loop').checked) fire();
    }
    draw();
    $('stats').textContent = `${sys.live} live · peak ${sys.stats.peak} · recycled ${sys.stats.recycled} · ${fps} fps`;
  }
  function draw() {
    c.fillStyle = '#00000b';
    c.fillRect(0, 0, W, H);
    c.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) c.fillRect((i * 97) % W, (i * 53) % 150, 1.2, 1.2);
    c.fillStyle = '#7a4a1e';
    c.beginPath();
    c.moveTo(0, H);
    for (let x = 0; x < W; x += 3) c.lineTo(x, terr[x]);
    c.lineTo(W, H);
    c.fill();
    c.strokeStyle = '#00aa00';
    c.lineWidth = 2;
    c.beginPath();
    for (let x = 0; x < W; x += 3) { if (x === 0) c.moveTo(x, terr[x]); else c.lineTo(x, terr[x]); }
    c.stroke();
    tank(SX, groundAt(SX), '#ffd75e');
    tank(TX, groundAt(TX), '#ff5a5a');
    sys.draw(c);
    const w = weapon(), set = playing || playSet();
    for (const s of shells) {
      FX.drawBody(c, s.x, s.y, s.vx, s.vy, set.body, (w.gfx && w.gfx.shell) || '#ffe27a', time);
      c.fillStyle = (w.gfx && w.gfx.shell) || '#ffe27a';
      c.beginPath(); c.arc(s.x, s.y, 3.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath(); c.arc(s.x, s.y, 1.5, 0, Math.PI * 2); c.fill();
    }
    if ($('showr').checked) {
      c.save();
      c.setLineDash([4, 4]);
      c.strokeStyle = '#ffffff';
      c.lineWidth = 1;
      for (const b of blasts) {
        c.globalAlpha = 0.55 * (1 - b.t / 0.9);
        c.beginPath(); c.arc(b.x, b.y, b.r, 0, Math.PI * 2); c.stroke();
      }
      c.restore();
      c.globalAlpha = 1;
    }
    sys.drawFlash(c, W, H);
  }
  function tank(x, gy, col) {
    c.fillStyle = '#24242e';
    c.beginPath(); c.roundRect(x - 11, gy - 14, 22, 12, 5); c.fill();
    c.strokeStyle = col; c.lineWidth = 2;
    c.beginPath(); c.roundRect(x - 11, gy - 14, 22, 12, 5); c.stroke();
    c.fillStyle = '#ffffff';
    c.beginPath(); c.arc(x, gy - 8, 3, 0, Math.PI * 2); c.fill();
  }

  /* ---------- export ---------- */
  const PASTE = 'Replace the effects: block at the end of games/tankity/game.yaml with it, then run php tools/game-json.php.';
  const COPIED = 'Copied the effects: block. ' + PASTE;
  function problems() {
    const bad = FX.validate(defs, weaponKeys());
    if (bad.length) say(bad.length + ' problem' + (bad.length > 1 ? 's' : '') + ': ' + bad[0], 'bad');
    return bad;
  }
  async function copy() {
    if (problems().length) return;
    const text = FX.toYaml(defs);
    try {
      await navigator.clipboard.writeText(text);
      dirty = false;
      say(COPIED + ' (' + text.length + ' bytes).', 'good');
    } catch (_) {
      const ta = h('textarea', { style: 'position:fixed;opacity:0' }, text);
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_e) { ok = false; }
      ta.remove();
      if (ok) dirty = false;
      say(ok ? COPIED + ' (' + text.length + ' bytes).' : 'Copy was blocked; use Download.', ok ? 'good' : 'bad');
    }
  }
  function download() {
    if (problems().length) return;
    const url = URL.createObjectURL(new Blob([FX.toYaml(defs)], { type: 'text/yaml' }));
    const a = h('a', { href: url, download: 'effects.yaml' });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    dirty = false;
    say('Downloaded effects.yaml. ' + PASTE, 'good');
  }
  async function reloadFile(useDraft) {
    const arm = await fetch('game.json', { cache: 'no-store' }).then(r => r.json());
    const eff = arm.effects;
    if (!eff) throw new Error('game.json has no effects section');
    arsenal = {};
    for (const a of (arm.arsenal && arm.arsenal.ammo) || []) arsenal[a.key] = a;
    let data = eff, fromDraft = false;
    const draft = useDraft ? store.get() : null;
    if (draft) { try { data = JSON.parse(draft); fromDraft = true; } catch (_) { data = eff; } } else store.del();
    load(data, fromDraft);
    say(fromDraft ? 'Restored your unsaved edits. "Reload file" drops them.' : 'Loaded the effects from game.json.', fromDraft ? '' : 'good');
  }

  /* ---------- wire up ---------- */
  $('weapon').addEventListener('change', e => { cur.weapon = e.target.value; cur.em = 0; buildSlots(); fire(); });
  $('em-add').addEventListener('click', () => {
    const ef = effect();
    if (!ef) return;
    const em = FX.newEmitter($('new-shape').value);
    if (cur.slot === 'trail' || cur.slot === 'special:steer') em.rate = 30;
    else em.count = 8;
    ef.emitters.push(em);
    cur.em = ef.emitters.length - 1;
    touch(); buildEmitters();
  });
  $('special-add').addEventListener('click', () => {
    const name = $('special-name').value;
    if (!name) return;
    const w = entry();
    (w.special || (w.special = {}))[name] = FX.dressEffect({ emitters: [] });
    cur.slot = 'special:' + name; cur.em = 0;
    touch(); buildSlots();
  });
  $('new-shape').replaceChildren(...FX.SHAPES.map(s => h('option', { value: s }, s)));
  $('fire').addEventListener('click', fire);
  for (const id of ['loop', 'slow', 'reduced', 'showr']) $(id).addEventListener('change', () => { if (id === 'reduced') fire(); });
  $('copy').addEventListener('click', copy);
  $('download').addEventListener('click', download);
  $('reload').addEventListener('click', () => reloadFile(false));
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(document.activeElement.tagName)) { e.preventDefault(); fire(); }
  });
  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  window.fxEditor = { sys, get defs() { return defs; }, cur, fire, get phase() { return phase; } };

  makeTerrain();
  FX.loadSprites('fx/sprites/', () => { buildParams(); });
  reloadFile(true).then(() => requestAnimationFrame(frame)).catch(err => say('Could not load the effects from game.json: ' + err.message, 'bad'));
}());
