/* Operation Tankity effects engine.
 *
 * Shared by game.js (battlefield, firing range, room replay) and the dev-only
 * fx-editor.html, so what the editor previews is the code that ships.
 * Loaded before game.js; exposes window.TankityFX (also module.exports).
 *
 * An EFFECT is { emitters: [...], screen: { shake, flash: { color, alpha, dur } } }.
 * A weapon's entry in game.yaml's `effects:` section (served as game.json) holds three effects plus optional extras:
 *   muzzle   once, as the shell leaves the barrel
 *   trail    every frame while the shell flies (emitters use `rate`)
 *   impact   once, on detonation; `unit: "r"` sizes it by the blast radius
 *   special  named extras: split (cluster), steer (seeker), pierce (lance),
 *            arc (EMP, over each tank it fries)
 *   body     the shell itself: halo radius/alpha/pulse, stretch (streak behind)
 * Every emitter field and its default lives in DEFAULTS below; game.yaml
 * carries only what differs. The particle pool is preallocated and capped, so
 * a frame never allocates and a runaway effect cannot run the frame rate down.
 */
(function (root) {
  'use strict';
  const TAU = Math.PI * 2, DEG = Math.PI / 180, LUT_N = 12;
  const SHAPES = ['dot', 'streak', 'ring', 'spark', 'smoke', 'sprite', 'bolt', 'beam'];
  const SLOTS = ['muzzle', 'trail', 'impact'];
  const SPECIALS = ['split', 'steer', 'pierce', 'arc'];
  const EASES = ['linear', 'out', 'in'];
  const AIMS = ['fixed', 'forward', 'back', 'normal'];

  /* Emitter defaults. Arrays here are shared: never edit one in place. */
  const DEFAULTS = {
    shape: 'dot',
    count: 0, rate: 0,            // burst size, or particles per second (trail, or with duration)
    delay: 0, duration: 0,        // seconds before it starts; seconds a rate emitter keeps going
    life: [0.4, 0.7],             // seconds
    speed: [0, 0],                // px/s (or r/s when unit is "r"); negative flies inward with edge
    aim: 'fixed',                 // fixed | forward | back | normal, relative to the shell's heading
    angle: 0,                     // degrees counter-clockwise (90 = up), added to the aim
    spread: 360,                  // cone width in degrees
    offset: 0, edge: false,       // spawn within this distance of the point, or exactly on that circle
    gravity: 0, drag: 0, wind: 0, // px/s^2 downward; 1/s slowdown; how much the battlefield wind pushes
    size: [2, 3],                 // radius at birth (ring: start radius; spark: arm; beam: half width)
    sizeEnd: 1, ease: 'linear',   // size multiplier at death; linear | out | in
    alpha: [1, 0],                // keyframes spread evenly over life
    colors: ['#ffffff'],          // ramp spread evenly over life
    glow: false,                  // additive ('lighter') compositing
    round: true,                  // dots: round, or square pixels
    length: 8, width: 2,          // streak/beam/bolt length; ring line width
    unit: 'px',                   // "r": size, speed, offset, length scale with the blast radius
    sheet: '', fps: 0, scale: 1,  // sprite: sheet name, frames per second (0 = once over life), size multiplier
    anchor: 'center',             // sprite: center | bottom
    rotJitter: 0, spin: [0, 0],   // random start rotation (degrees); spin range (degrees/s)
    tint: '',                     // sprite: multiply the sheet by this colour
  };
  const SCHEMA = {
    shape: SHAPES, aim: AIMS, ease: EASES, unit: ['px', 'r'], anchor: ['center', 'bottom'],
  };

  /* ---------- colours ---------- */
  function parseColor(s) {
    s = String(s || '');
    let m = /^#([0-9a-f]{3})$/i.exec(s);
    if (m) return [parseInt(m[1][0] + m[1][0], 16), parseInt(m[1][1] + m[1][1], 16), parseInt(m[1][2] + m[1][2], 16)];
    m = /^#([0-9a-f]{6})/i.exec(s);
    if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    m = /^rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/i.exec(s);
    if (m) return [+m[1], +m[2], +m[3]];
    return [255, 255, 255];
  }
  /* A colour ramp becomes LUT_N ready-made css strings, so drawing never
     builds one. Cached per colors array: edits must replace the array. */
  const lutCache = new WeakMap();
  function lutFor(colors) {
    let lut = lutCache.get(colors);
    if (lut) return lut;
    const rgb = colors.map(parseColor);
    lut = new Array(LUT_N);
    for (let i = 0; i < LUT_N; i++) {
      const f = rgb.length > 1 ? i / (LUT_N - 1) * (rgb.length - 1) : 0;
      const a = Math.floor(f), b = Math.min(a + 1, rgb.length - 1), u = f - a;
      lut[i] = 'rgb(' + Math.round(rgb[a][0] + (rgb[b][0] - rgb[a][0]) * u) + ',' +
        Math.round(rgb[a][1] + (rgb[b][1] - rgb[a][1]) * u) + ',' +
        Math.round(rgb[a][2] + (rgb[b][2] - rgb[a][2]) * u) + ')';
    }
    lutCache.set(colors, lut);
    return lut;
  }
  function ramp(arr, t) {
    const n = arr.length;
    if (n === 1) return arr[0];
    const f = t * (n - 1);
    let i = f | 0;
    if (i >= n - 1) return arr[n - 1];
    if (i < 0) i = 0;
    return arr[i] + (arr[i + 1] - arr[i]) * (f - i);
  }
  const rnd = (r) => r[0] + (r[1] - r[0]) * Math.random();

  /* ---------- soft blobs and tinted sheets (offscreen, cached) ---------- */
  const blobs = new Map();
  function blobFor(color) {
    let b = blobs.get(color);
    if (b !== undefined) return b;
    b = null;
    if (typeof document !== 'undefined' && document.createElement) {
      try {
        const cv = document.createElement('canvas');
        cv.width = cv.height = 32;
        const g = cv.getContext('2d');
        if (g) {
          const rgb = parseColor(color).join(',');
          const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
          gr.addColorStop(0, 'rgba(' + rgb + ',1)');
          gr.addColorStop(0.35, 'rgba(' + rgb + ',0.55)');
          gr.addColorStop(1, 'rgba(' + rgb + ',0)');
          g.fillStyle = gr;
          g.fillRect(0, 0, 32, 32);
          b = cv;
        }
      } catch (_) { b = null; }
    }
    blobs.set(color, b);
    return b;
  }
  /* Sprite sheets: name -> { img, fw, fh, cols, frames, ready, tints }. */
  const sheets = {};
  function tintedSheet(sh, color) {
    let t = sh.tints[color];
    if (t !== undefined) return t;
    t = sh.img;
    if (typeof document !== 'undefined' && document.createElement && sh.img.width) {
      try {
        const cv = document.createElement('canvas');
        cv.width = sh.img.width; cv.height = sh.img.height;
        const g = cv.getContext('2d');
        g.drawImage(sh.img, 0, 0);
        g.globalCompositeOperation = 'multiply';
        g.fillStyle = color;
        g.fillRect(0, 0, cv.width, cv.height);
        g.globalCompositeOperation = 'destination-in';
        g.drawImage(sh.img, 0, 0);
        t = cv;
      } catch (_) { t = sh.img; }
    }
    sh.tints[color] = t;
    return t;
  }
  /* Read sprites.json (written by fx/blender/render_fx.py) and fetch each
     sheet. Missing sheets or no Image support just leave sprite emitters
     silent; every effect also carries non-sprite emitters. */
  function loadSprites(base, done) {
    if (typeof fetch !== 'function' || typeof Image !== 'function') { if (done) done(false); return Promise.resolve(false); }
    return fetch(base + 'sprites.json').then(r => r.json()).then(idx => {
      let pending = 0, any = false;
      const finish = () => { if (--pending <= 0 && done) done(any); };
      for (const name of Object.keys(idx || {})) {
        const d = idx[name];
        if (!d || !d.file || name[0] === '_') continue;
        const sh = sheets[name] = { name, img: new Image(), fw: d.frame, fh: d.frame, cols: d.cols, frames: d.frames, fps: d.fps || 24, ready: false, tints: {} };
        pending++;
        sh.img.onload = () => { sh.ready = true; any = true; finish(); };
        sh.img.onerror = () => finish();
        sh.img.src = base + d.file;
      }
      if (!pending && done) done(false);
      return true;
    }).catch(() => { if (done) done(false); return false; });
  }

  /* ---------- effect data helpers ---------- */
  /* Emitters inherit DEFAULTS through their prototype, so JSON.stringify
     (the editor's draft) and toYaml (its export) write only what an author
     changed. */
  function adopt(em) { return Object.setPrototypeOf(em, DEFAULTS); }
  function dressEffect(ef) {
    if (!ef) return ef;
    if (!Array.isArray(ef.emitters)) ef.emitters = [];
    for (const em of ef.emitters) adopt(em);
    return ef;
  }
  /* Give every emitter in a whole effects table its defaults. */
  function dress(defs) {
    for (const key of Object.keys(defs || {})) {
      if (key[0] === '_') continue;
      const w = defs[key];
      for (const s of SLOTS) dressEffect(w[s]);
      if (w.special) for (const k of Object.keys(w.special)) dressEffect(w.special[k]);
    }
    return defs;
  }
  function newEmitter(shape) { return adopt({ shape: shape || 'dot' }); }
  function cloneEmitter(em) { return adopt(JSON.parse(JSON.stringify(em))); }
  /* Problems with an effects table, as readable strings (empty when sound). */
  function validate(defs, keys) {
    const bad = [];
    const num = (v) => typeof v === 'number' && isFinite(v);
    const pair = (v) => Array.isArray(v) && v.length === 2 && num(v[0]) && num(v[1]);
    const checkEffect = (name, ef) => {
      if (!ef || !Array.isArray(ef.emitters)) { bad.push(name + ': no emitters list'); return; }
      ef.emitters.forEach((em, i) => {
        const at = name + '[' + i + ']';
        if (SHAPES.indexOf(em.shape) < 0) bad.push(at + ': unknown shape ' + em.shape);
        for (const f of ['life', 'speed', 'size', 'spin']) if (!pair(em[f])) bad.push(at + ': ' + f + ' must be [min, max]');
        for (const f of ['count', 'rate', 'delay', 'duration', 'spread', 'sizeEnd']) if (!num(em[f])) bad.push(at + ': ' + f + ' must be a number');
        if (!Array.isArray(em.alpha) || !em.alpha.length || !em.alpha.every(num)) bad.push(at + ': alpha needs numbers');
        if (!Array.isArray(em.colors) || !em.colors.length) bad.push(at + ': colors needs a colour');
        if (em.life && em.life[0] <= 0) bad.push(at + ': life must be above zero');
        for (const f of Object.keys(SCHEMA)) if (SCHEMA[f].indexOf(em[f]) < 0) bad.push(at + ': ' + f + ' is ' + em[f]);
        if (em.shape === 'sprite' && !em.sheet) bad.push(at + ': sprite needs a sheet');
      });
    };
    for (const k of keys) {
      const w = defs && defs[k];
      if (!w) { bad.push(k + ': no effects'); continue; }
      for (const s of SLOTS) checkEffect(k + '.' + s, w[s]);
      if (w.special) for (const s of Object.keys(w.special)) checkEffect(k + '.special.' + s, w.special[s]);
    }
    return bad;
  }
  /* A plain effect set from a weapon's paint job, for any weapon the table
     does not describe (the table fails to load, or a new weapon lacks one). */
  function derive(gfx) {
    gfx = gfx || {};
    const shell = gfx.shell || '#ffe27a', trail = gfx.trail || shell, blast = gfx.blast || ['#ffb13c', '#fff3c4'];
    return dress({
      derived: {
        muzzle: { emitters: [{ count: 5, life: [0.12, 0.25], speed: [30, 90], aim: 'forward', spread: 40, size: [1.5, 2.5], colors: [shell, '#ffffff'], glow: true }] },
        trail: { emitters: [{ rate: 34, life: [0.2, 0.34], size: [1.6, 2.2], sizeEnd: 0.3, alpha: [0.9, 0], colors: [trail, '#7a5a30'] }] },
        impact: {
          emitters: [
            { count: 1, life: [0.25, 0.3], size: [0.9, 0.9], unit: 'r', sizeEnd: 0.4, alpha: [0.9, 0], colors: [blast[1], blast[0]], glow: true },
            { count: 16, life: [0.4, 0.8], speed: [1.6, 5], unit: 'r', gravity: 160, drag: 1.5, size: [1.5, 2.6], colors: [blast[1], blast[0], '#5a4630'] },
          ],
        },
      },
    }).derived;
  }

  /* ---------- the particle system ---------- */
  function createSystem(opts) {
    opts = opts || {};
    const max = opts.max || 700;
    const P = [];
    for (let i = 0; i < max; i++) {
      P.push({ x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 1, s0: 1, rot: 0, vr: 0, g: 0, d: 0, wk: 0, len: 0, ez: 0, em: null, lut: null, pts: null });
    }
    const Q = [];
    for (let i = 0; i < 48; i++) Q.push({ on: false, em: null, x: 0, y: 0, ang: 0, k: 1, t: 0, acc: 0 });
    let n = 0, cursor = 0;
    const sys = {
      max, wind: 0, reduced: null,
      stats: { spawned: 0, recycled: 0, peak: 0 },
      flash: { a: 0, dur: 0.3, t: 0, color: '#ffffff' },
      get live() { return n; },
    };
    const isReduced = () => (sys.reduced !== null ? sys.reduced : api.reduced);

    function alloc() {
      sys.stats.spawned++;
      if (n < max) { const p = P[n++]; if (n > sys.stats.peak) sys.stats.peak = n; return p; }
      // Full: recycle a slot in rotation. A new blast outranks an old puff.
      sys.stats.recycled++;
      cursor = (cursor + 1) % max;
      return P[cursor];
    }
    function spawn(em, x, y, ang, k, lifeK) {
      const p = alloc();
      p.em = em;
      p.lut = lutFor(em.colors);
      p.age = 0;
      p.life = Math.max(0.03, rnd(em.life) * lifeK);
      p.s0 = rnd(em.size) * k;
      p.g = em.gravity; p.d = em.drag; p.wk = em.wind;
      p.ez = em.ease === 'out' ? 1 : em.ease === 'in' ? 2 : 0;
      p.len = em.length * k;
      p.vr = (em.spin[0] + (em.spin[1] - em.spin[0]) * Math.random()) * DEG;
      p.rot = (Math.random() * 2 - 1) * em.rotJitter * DEG;
      const base = em.aim === 'forward' ? ang : em.aim === 'back' ? ang + Math.PI : em.aim === 'normal' ? ang - Math.PI / 2 : 0;
      const a = base - (em.angle + (Math.random() - 0.5) * em.spread) * DEG;
      const ca = Math.cos(a), sa = Math.sin(a);
      const sp = rnd(em.speed) * k;
      p.vx = ca * sp;
      p.vy = sa * sp;
      let px = x, py = y;
      if (em.offset) {
        const off = em.offset * k;
        if (em.edge) { px += ca * off; py += sa * off; } else {
          const oa = Math.random() * TAU, od = Math.sqrt(Math.random()) * off;
          px += Math.cos(oa) * od; py += Math.sin(oa) * od;
        }
      }
      p.x = px; p.y = py;
      if (em.shape === 'beam') p.rot = a;
      if (em.shape === 'bolt') {
        // A jagged polyline, fixed for the bolt's whole life.
        if (!p.pts) p.pts = new Float32Array(14);
        const L = p.len || p.s0, px2 = -sa, py2 = ca;
        for (let i = 0; i < 7; i++) {
          const f = i / 6, j = i === 0 || i === 6 ? 0 : (Math.random() - 0.5) * L * 0.34;
          p.pts[i * 2] = ca * L * f + px2 * j;
          p.pts[i * 2 + 1] = sa * L * f + py2 * j;
        }
      }
    }
    function burst(em, x, y, ang, k) {
      const red = isReduced();
      let c = em.count * (red ? 0.35 : 1);
      c = c > 0 && c < 1 ? 1 : Math.round(c);
      const lifeK = red ? 0.7 : 1;
      for (let i = 0; i < c; i++) spawn(em, x, y, ang, k, lifeK);
    }
    /* Fire an effect. x,y world point; ang the shell's heading (radians,
       canvas axes); r the blast radius for `unit: "r"` emitters. Returns the
       effect's own screen-shake if it sets one, else undefined. */
    sys.emit = function (ef, x, y, ang, r) {
      if (!ef) return undefined;
      const list = ef.emitters;
      for (let i = 0; i < list.length; i++) {
        const em = list[i];
        const k = em.unit === 'r' ? (r || 1) : 1;
        if (em.delay > 0 || em.duration > 0) {
          for (let j = 0; j < Q.length; j++) {
            const q = Q[j];
            if (q.on) continue;
            q.on = true; q.em = em; q.x = x; q.y = y; q.ang = ang || 0; q.k = k; q.t = 0; q.acc = 0;
            break;
          }
        } else burst(em, x, y, ang || 0, k);
      }
      const sc = ef.screen;
      if (sc) {
        if (sc.flash && !isReduced()) {
          const f = sys.flash;
          if (sc.flash.alpha >= f.a * (1 - f.t / f.dur)) {
            f.a = sc.flash.alpha; f.dur = Math.max(0.05, sc.flash.dur || 0.3); f.t = 0; f.color = sc.flash.color || '#ffffff';
          }
        }
        return typeof sc.shake === 'number' ? sc.shake : undefined;
      }
      return undefined;
    };
    /* Per-shell trail bookkeeping: allocate once per shell and pass to trail(). */
    sys.newTrail = function (ef) {
      const t = { has: false, px: 0, py: 0, acc: [] };
      for (let i = 0; i < ef.emitters.length; i++) t.acc.push(0);
      return t;
    };
    /* A shell in flight: call every frame with its position. Emitters with a
       `rate` drip particles along the path travelled since the last call. */
    sys.trail = function (ef, tr, x, y, ang, dt, r) {
      if (!ef) return;
      const list = ef.emitters, red = isReduced();
      const px = tr.has ? tr.px : x, py = tr.has ? tr.py : y;
      tr.has = true; tr.px = x; tr.py = y;
      if (n > max * 0.8) return; // a crowded pool keeps its budget for blasts
      const lifeK = red ? 0.7 : 1;
      for (let i = 0; i < list.length; i++) {
        const em = list[i];
        if (!(em.rate > 0)) continue;
        let a = tr.acc[i] + em.rate * (red ? 0.4 : 1) * dt;
        if (a > 6) a = 6;
        const m = a | 0;
        tr.acc[i] = a - m;
        const k = em.unit === 'r' ? (r || 1) : 1;
        for (let j = 1; j <= m; j++) {
          const f = j / m;
          spawn(em, px + (x - px) * f, py + (y - py) * f, ang, k, lifeK);
        }
      }
    };
    sys.clear = function () {
      n = 0;
      for (let i = 0; i < Q.length; i++) Q[i].on = false;
      sys.flash.a = 0;
    };
    sys.step = function (dt) {
      const red = isReduced();
      for (let j = 0; j < Q.length; j++) {
        const q = Q[j];
        if (!q.on) continue;
        q.t += dt;
        const em = q.em;
        if (q.t < em.delay) continue;
        if (em.duration > 0 && em.rate > 0) {
          q.acc += em.rate * (red ? 0.4 : 1) * dt;
          if (q.acc > 6) q.acc = 6;
          while (q.acc >= 1) { q.acc -= 1; spawn(em, q.x, q.y, q.ang, q.k, red ? 0.7 : 1); }
          if (q.t - em.delay >= em.duration) q.on = false;
        } else {
          burst(em, q.x, q.y, q.ang, q.k);
          q.on = false;
        }
      }
      for (let i = n - 1; i >= 0; i--) {
        const p = P[i];
        p.age += dt;
        if (p.age >= p.life) { P[i] = P[n - 1]; P[n - 1] = p; n--; continue; }
        if (p.d) { const f = Math.max(0, 1 - p.d * dt); p.vx *= f; p.vy *= f; }
        p.vy += p.g * dt;
        if (p.wk) p.vx += sys.wind * p.wk * 3 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
      }
      const f = sys.flash;
      if (f.a > 0) { f.t += dt; if (f.t >= f.dur) f.a = 0; }
    };
    function drawPass(c, glowPass) {
      for (let i = 0; i < n; i++) {
        const p = P[i], em = p.em;
        if (em.glow !== glowPass) continue;
        const t = p.age / p.life;
        let al = ramp(em.alpha, t);
        if (al <= 0.01) continue;
        if (al > 1) al = 1;
        const e = p.ez === 1 ? 1 - (1 - t) * (1 - t) : p.ez === 2 ? t * t : t;
        const sz = p.s0 * (1 + (em.sizeEnd - 1) * e);
        if (sz <= 0.05) continue;
        const col = p.lut[(t * (LUT_N - 1)) | 0];
        c.globalAlpha = al;
        switch (em.shape) {
          case 'dot':
            if (glowPass) {
              const b = blobFor(col);
              if (b) { c.drawImage(b, p.x - sz * 1.3, p.y - sz * 1.3, sz * 2.6, sz * 2.6); break; }
            }
            c.fillStyle = col;
            if (em.round) {
              c.beginPath();
              c.arc(p.x, p.y, sz, 0, TAU);
              c.fill();
            } else c.fillRect(p.x - sz, p.y - sz, sz * 2, sz * 2);
            break;
          case 'smoke': {
            const b = blobFor(col);
            if (b) c.drawImage(b, p.x - sz, p.y - sz, sz * 2, sz * 2);
            else { c.fillStyle = col; c.beginPath(); c.arc(p.x, p.y, sz, 0, TAU); c.fill(); }
            break;
          }
          case 'streak': {
            const sp = Math.hypot(p.vx, p.vy);
            const ux = sp > 1 ? p.vx / sp : Math.cos(p.rot), uy = sp > 1 ? p.vy / sp : Math.sin(p.rot);
            const L = p.len * (1 - t * 0.4);
            c.strokeStyle = col;
            c.lineWidth = sz * 0.8 + 0.4;
            c.lineCap = 'round';
            c.beginPath();
            c.moveTo(p.x, p.y);
            c.lineTo(p.x - ux * L, p.y - uy * L);
            c.stroke();
            break;
          }
          case 'ring':
            c.strokeStyle = col;
            c.lineWidth = Math.max(0.5, em.width * (1 - t) + 0.5);
            c.beginPath();
            c.arc(p.x, p.y, sz, 0, TAU);
            c.stroke();
            break;
          case 'spark': {
            const ca = Math.cos(p.rot) * sz, sa = Math.sin(p.rot) * sz;
            c.strokeStyle = col;
            c.lineWidth = 1.4;
            c.lineCap = 'round';
            c.beginPath();
            c.moveTo(p.x - ca, p.y - sa); c.lineTo(p.x + ca, p.y + sa);
            c.moveTo(p.x + sa * 0.55, p.y - ca * 0.55); c.lineTo(p.x - sa * 0.55, p.y + ca * 0.55);
            c.stroke();
            c.fillStyle = col;
            c.beginPath();
            c.arc(p.x, p.y, sz * 0.22 + 0.4, 0, TAU);
            c.fill();
            break;
          }
          case 'bolt': {
            const q = p.pts;
            if (!q) break;
            const flick = 0.55 + 0.45 * Math.sin(p.age * 70 + p.s0 * 13);
            c.globalAlpha = al * flick;
            c.strokeStyle = col;
            c.lineCap = 'round';
            c.lineJoin = 'round';
            for (let pass = 0; pass < 2; pass++) {
              c.lineWidth = pass ? 1.1 : 3.2;
              if (pass) c.strokeStyle = '#ffffff';
              c.beginPath();
              c.moveTo(p.x + q[0], p.y + q[1]);
              for (let j = 1; j < 7; j++) c.lineTo(p.x + q[j * 2], p.y + q[j * 2 + 1]);
              c.stroke();
              if (!pass) c.globalAlpha = al * flick * 0.9;
            }
            break;
          }
          case 'beam': {
            const ex = p.x + Math.cos(p.rot) * p.len, ey = p.y + Math.sin(p.rot) * p.len;
            c.lineCap = 'round';
            c.strokeStyle = p.lut[0];
            c.lineWidth = sz * 3.4;
            c.globalAlpha = al * 0.38;
            c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(ex, ey); c.stroke();
            c.strokeStyle = p.lut[LUT_N - 1];
            c.lineWidth = sz;
            c.globalAlpha = al * 0.95;
            c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(ex, ey); c.stroke();
            break;
          }
          case 'sprite': {
            const sh = sheets[em.sheet];
            if (!sh || !sh.ready) break;
            let f = em.fps > 0 ? (p.age * em.fps) | 0 : (t * sh.frames) | 0;
            if (f >= sh.frames) f = sh.frames - 1;
            const img = em.tint ? tintedSheet(sh, em.tint) : sh.img;
            const sx = (f % sh.cols) * sh.fw, sy = ((f / sh.cols) | 0) * sh.fh;
            const d = sz * 2 * em.scale;
            const oy = em.anchor === 'bottom' ? -d / 2 : 0;
            if (p.rot) {
              c.save();
              c.translate(p.x, p.y + oy);
              c.rotate(p.rot);
              c.drawImage(img, sx, sy, sh.fw, sh.fh, -d / 2, -d / 2, d, d);
              c.restore();
            } else c.drawImage(img, sx, sy, sh.fw, sh.fh, p.x - d / 2, p.y + oy - d / 2, d, d);
            break;
          }
        }
      }
    }
    sys.draw = function (c) {
      if (!n) return;
      const oa = c.globalAlpha;
      drawPass(c, false);
      c.globalCompositeOperation = 'lighter';
      drawPass(c, true);
      c.globalCompositeOperation = 'source-over';
      c.globalAlpha = oa;
    };
    /* The full-screen flash, in canvas pixels (call outside the world transform). */
    sys.drawFlash = function (c, w, h) {
      const f = sys.flash;
      if (!(f.a > 0)) return;
      c.globalAlpha = Math.max(0, f.a * (1 - f.t / f.dur));
      c.fillStyle = f.color;
      c.fillRect(0, 0, w, h);
      c.globalAlpha = 1;
    };
    return sys;
  }

  /* A soft additive glow at a point (shell halos, lock-on pulses). */
  function glow(c, x, y, rad, color, alpha) {
    const b = blobFor(color);
    const oa = c.globalAlpha;
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = alpha;
    if (b) c.drawImage(b, x - rad, y - rad, rad * 2, rad * 2);
    else { c.fillStyle = color; c.beginPath(); c.arc(x, y, rad * 0.5, 0, TAU); c.fill(); }
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = oa;
  }
  /* The shell's own glow: a halo, a stretch of light behind it, and an
     optional pulse. body = { halo, alpha, pulse, stretch } from game.yaml. */
  /* A shell body's settings when its weapon leaves them out. */
  const BODY_DEFAULTS = Object.freeze({ halo: 9, alpha: 0.5, pulse: 0, stretch: 0 });
  function drawBody(c, x, y, vx, vy, body, color, time) {
    body = body || {};
    const halo = body.halo === undefined ? BODY_DEFAULTS.halo : body.halo;
    let a = body.alpha === undefined ? BODY_DEFAULTS.alpha : body.alpha;
    if (body.pulse) a *= 0.7 + 0.3 * Math.sin(time * body.pulse * TAU);
    if (body.stretch > 0) {
      const sp = Math.hypot(vx, vy);
      if (sp > 1) {
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = 0.5;
        c.strokeStyle = color;
        c.lineWidth = 2.5;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x - vx / sp * body.stretch, y - vy / sp * body.stretch);
        c.stroke();
        c.globalCompositeOperation = 'source-over';
        c.globalAlpha = 1;
      }
    }
    if (halo > 0 && a > 0) glow(c, x, y, halo, color, a);
  }

  /* How a weapon's effect set (one weapon's entry in `effects`) is played. The game
     and the editor both go through these, so they cannot drift apart. Each
     returns what the engine returns: emit() gives the effect's own screen shake. */
  const play = {
    muzzle(sys, set, x, y, ang) { return sys.emit(set.muzzle, x, y, ang, 0); },
    impact(sys, set, x, y, r) { return sys.emit(set.impact, x, y, 0, r); },
    special(sys, set, name, x, y, ang) {
      const ef = set.special && set.special[name];
      if (ef) sys.emit(ef, x, y, ang, 0);
    },
    /* A shell in flight, any object that can carry the trail state (s.fx,
       s.fxs): drip its trail (and a seeker's steer pulse) along the path flown. */
    trail(sys, set, s, dt, x, y, vx, vy) {
      const ang = Math.atan2(vy, vx);
      if (!s.fx) s.fx = sys.newTrail(set.trail);
      sys.trail(set.trail, s.fx, x, y, ang, dt, 0);
      const steer = set.special && set.special.steer;
      if (steer) {
        if (!s.fxs) s.fxs = sys.newTrail(steer);
        sys.trail(steer, s.fxs, x, y, ang, dt, 0);
      }
    },
  };

  /* The `effects:` block of game.yaml, as the editor exports it: weapons in
     the order given, each one's slots in a fixed order, one emitter per line
     as a flow map. Only an emitter's own fields are written (the defaults ride
     its prototype), so an export diffs cleanly. */
  const yKey = (k) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : JSON.stringify(k));
  function yVal(v) {
    if (Array.isArray(v)) return '[' + v.map(yVal).join(', ') + ']';
    if (v && typeof v === 'object') {
      const ks = Object.keys(v);
      return ks.length ? '{ ' + ks.map(k => yKey(k) + ': ' + yVal(v[k])).join(', ') + ' }' : '{}';
    }
    // Plain words stay bare; anything else (colours, '', true-ish text) is quoted.
    if (typeof v === 'string' && /^[A-Za-z][A-Za-z0-9]*$/.test(v) && !/^(true|false|null)$/.test(v)) return v;
    return JSON.stringify(v);
  }
  function toYaml(defs) {
    const effect = (ef, ind) => {
      const out = [];
      if (ef.screen) out.push(ind + 'screen: ' + yVal(ef.screen));
      if (ef.emitters.length) {
        out.push(ind + 'emitters:');
        for (const em of ef.emitters) out.push(ind + '  - ' + yVal(em));
      } else out.push(ind + 'emitters: []');
      return out;
    };
    const out = ['effects:'];
    for (const k of Object.keys(defs)) {
      if (k[0] === '_') continue;
      const w = defs[k];
      out.push('  ' + yKey(k) + ':');
      if (w.body) out.push('    body: ' + yVal(w.body));
      for (const slot of SLOTS) if (w[slot]) out.push('    ' + slot + ':', ...effect(w[slot], '      '));
      if (w.special && Object.keys(w.special).length) {
        out.push('    special:');
        for (const n of Object.keys(w.special)) out.push('      ' + yKey(n) + ':', ...effect(w.special[n], '        '));
      }
    }
    return out.join('\n') + '\n';
  }

  const api = {
    version: 1,
    DEFAULTS, SHAPES, SLOTS, SPECIALS, EASES, AIMS, SCHEMA,
    reduced: false,
    sheets,
    createSystem, loadSprites, glow, drawBody, BODY_DEFAULTS,
    adopt, dress, dressEffect, newEmitter, cloneEmitter, validate, derive, toYaml, play,
    parseColor, lutFor,
  };
  root.TankityFX = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : globalThis));
