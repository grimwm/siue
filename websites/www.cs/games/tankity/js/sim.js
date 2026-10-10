/* Operation Tankity: the game math.
 *
 * The pure part of the sim, shared by the solo game, the demo and the client's
 * own shell flight in game.js, and kept in step with the room server's sim
 * (rooms.php) by the shared vectors in protocol/sim-vectors.json. Nothing here
 * touches the page, sound, particles or chat: state goes in as arguments, and
 * what happened (a blast's hits, a volley's trails) comes back as data for the
 * caller to show. */
export function hashSeed(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
}
export function mulberry32(a) {
    return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
export function gauss(rng) {
    return (rng() + rng() + rng() - 1.5) * 2;
}
/* ---------- board + physics tuning ---------- */
export const W = 720, H = 460;
export const GRAV = 95;
export const FLAT_GRAV = 90; // flat bolts arc a little, so short shots and demos still land
export const TUNE = {
    lives: 3, maxLives: 5, oneUpEvery: 3000,
    playerArmor: 100, droneArmor: 60,
    fuel: 80, driveSpeed: 42,
    thinkTime: 0.9, settleTime: 1.1,
    roundWinScore: 750, roundWinCash: 500, killBonus: 300,
};
/* Tuning is read-only: one frozen table means a balance number cannot drift
// halfway through a match. PHP arrays already copy on write, so the server
// side gets the same guarantee for free. */
Object.freeze(TUNE);
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
/* ---------- the arsenal ---------- */
/* Builds the read-only arsenal from game.json's arsenal section (or the baked
   fallback). Null when it holds no usable ammo row. */
export function buildArsenal(data) {
    const w = {};
    const order = [];
    const shop = [];
    const gear = {};
    for (const a of (data && data.ammo) || []) {
        if (!a || !a.key || !a.name)
            continue;
        w[a.key] = Object.assign({ effect: 'shot', speed: 1.0, pack: 0, price: 0, minRound: 1 }, a);
        order.push(a.key);
        if ((a.pack || 0) > 0) {
            // Round-1 goods sell everywhere including the pre-match shelf
            // (G.round is 0 there); later unlocks need the round to arrive.
            const openFrom = (a.minRound || 1) <= 1 ? 0 : a.minRound;
            shop.push({ kind: 'ammo', w: a.key, n: a.pack, label: `${a.name} ×${a.pack}`, cat: a.cat || 'Shells', minRound: openFrom, price: a.price || 0 });
        }
    }
    for (const g of (data && data.gear) || []) {
        if (!g || !g.key || !g.name)
            continue;
        gear[g.key] = g;
        const openFrom = (g.minRound || 1) <= 1 ? 0 : g.minRound;
        shop.push({ kind: 'gear', g: g.key, n: g.n || 0, label: g.name, cat: g.cat || 'Tricks', minRound: openFrom, price: g.price || 0, effect: g.effect });
    }
    if (!order.length)
        return null;
    // The arsenal is read-only after the build: every shell, row, and paint
    // job freezes, so a stray write fails loudly instead of bending ballistics
    // mid-match. Hot per-frame state (shells, particles, tanks) stays mutable
    // where freezing would cost real time.
    for (const k of Object.keys(w)) {
        const row = w[k];
        if (row.gfx)
            Object.freeze(row.gfx);
        const blast = row.gfx && row.gfx['blast'];
        if (blast)
            Object.freeze(blast);
        Object.freeze(row);
    }
    for (const row of shop)
        Object.freeze(row);
    for (const k of Object.keys(gear))
        Object.freeze(gear[k]);
    Object.freeze(order);
    Object.freeze(shop);
    return { weapons: w, order, shop, gear };
}
/* Drone magazine from the data file: shells the battery may load by round. */
export function droneRack(arsenal, round) {
    const rack = { shell: Infinity };
    for (const k of arsenal.order) {
        if (k === 'shell')
            continue;
        const a = arsenal.weapons[k];
        rack[k] = (a && a.ai && round >= (a.aiRound || 99)) ? 2 : 0;
    }
    return rack;
}
/* ---------- terrain ---------- */
/* Rolling hills from seeded sines, and the clouds that drift over them. */
export function genTerrain(rng) {
    const terrain = new Array(W);
    const a = [20 + rng() * 30, 10 + rng() * 22, 5 + rng() * 12];
    const p = [rng() * 6.28, rng() * 6.28, rng() * 6.28];
    const f = [1 / 260 + rng() / 500, 1 / 120 + rng() / 260, 1 / 47 + rng() / 120];
    for (let x = 0; x < W; x++) {
        const y = 330
            + a[0] * Math.sin(x * f[0] + p[0])
            + a[1] * Math.sin(x * f[1] + p[1])
            + a[2] * Math.sin(x * f[2] + p[2]);
        terrain[x] = clamp(y, 190, 415);
    }
    const clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push({ x: rng() * W, y: 30 + rng() * 90, s: 0.6 + rng() * 0.9, v: 3 + rng() * 5 });
    }
    return { terrain, clouds };
}
export function surfY(terrain, x) {
    const xi = clamp(Math.round(x), 0, W - 1);
    return terrain[xi];
}
/* Cuts a crater: the ground under the blast drops to a 3:4 ellipse around
   (x, y), never below floor. The war, the room replay and the firing range
   all carve with this. */
export function carveCrater(terrain, x, y, r, floor) {
    const x0 = Math.max(0, Math.floor(x - r)), x1 = Math.min(terrain.length - 1, Math.ceil(x + r));
    for (let ix = x0; ix <= x1; ix++) {
        const dx = ix - x;
        const cut = Math.sqrt(Math.max(0, r * r - dx * dx)) * 0.75;
        terrain[ix] = Math.min(floor, Math.max(terrain[ix], y + cut));
    }
}
/* ---------- units ---------- */
/* Which way a tank faces: +1 right, -1 left. Angles count from that side. */
export function facing(t) {
    return t.dirS || (t.isPlayer ? 1 : -1);
}
export function isGroundUnit(t) {
    return t.isPlayer || !!t.human;
}
/* Units keep at least this far apart, centre to centre, so hulls and rotors
   never overlap; fresh rounds spread them wider still. */
export const UNIT_GAP = 44;
export const SPAWN_GAP = 110;
export function spotTaken(tanks, t, x) {
    return tanks.some(o => o !== t && o.hp > 0 && Math.abs(o.x - x) < UNIT_GAP);
}
/* n spawn points across the hills, at least SPAWN_GAP apart, in random
   order: nobody owns a side. Falls back to even spacing if sampling fails. */
export function spawnSpots(n, rng) {
    const lo = 30, hi = W - 30;
    for (let tries = 0; tries < 200; tries++) {
        const xs = [];
        for (let i = 0; i < n; i++)
            xs.push(Math.round(lo + rng() * (hi - lo)));
        xs.sort((a, b) => a - b);
        if (xs.every((x, i) => i === 0 || x - xs[i - 1] >= SPAWN_GAP)) {
            for (let i = xs.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [xs[i], xs[j]] = [xs[j], xs[i]];
            }
            return xs;
        }
    }
    return Array.from({ length: n }, (_, i) => Math.round(lo + (i + 0.5) * (hi - lo) / n));
}
/* Hit boxes match the drawn units: a ground unit's hull and turret, or a
   drone's body up in the air (rooms.php room_unit_box() is the same). */
export function unitHitBox(t) {
    return isGroundUnit(t)
        ? { cx: t.x, cy: t.y - 10, rx: 20, ry: 13 }
        : { cx: t.x, cy: t.y - 30, rx: 18, ry: 14 };
}
export function inHitBox(t, x, y) {
    const b = unitHitBox(t);
    return ((x - b.cx) / b.rx) ** 2 + ((y - b.cy) / b.ry) ** 2 <= 1;
}
/* ---------- firing and flight ---------- */
export function muzzle(t) {
    const rad = t.angle * Math.PI / 180;
    const s = facing(t);
    return { x: t.x + Math.cos(rad) * 20 * s, y: t.y - 14 - Math.sin(rad) * 20 };
}
export function shotSpeed(power, flat, mult) {
    const m = mult || 1;
    return (flat ? 140 + power * 3.2 : 40 + power * 2.4) * m;
}
/* Fires wkey from tank t: spends the round and launches the volley's shells
   into world.shells. Null when t has none left. */
export function fireWeapon(world, arsenal, t, wkey) {
    const w = arsenal.weapons[wkey];
    const store = (t.isPlayer ? world.ammo : t.ammo);
    if ((store[wkey] || 0) <= 0)
        return null;
    if (wkey !== 'shell')
        store[wkey] -= 1;
    // The last one fired: the player's gun falls back to the endless Shell.
    let spent = false;
    if (t.isPlayer && wkey !== 'shell' && store[wkey] <= 0 && world.selected === wkey) {
        world.selected = 'shell';
        spent = true;
    }
    const m = muzzle(t);
    const rad = t.angle * Math.PI / 180;
    const s = facing(t);
    const shots = w.pellets || 1;
    for (let i = 0; i < shots; i++) {
        const off = shots === 1 ? 0 : (i - (shots - 1) / 2) * (w.spread || 0);
        const a = rad + off;
        const spd = shotSpeed(t.power, w.flat, w.speed);
        world.shells.push({
            x: m.x, y: m.y,
            vx: Math.cos(a) * spd * s, vy: -Math.sin(a) * spd,
            wkey, owner: t, life: 12,
            age: 0, pierced: false, split: false,
        });
    }
    return { x: m.x, y: m.y, ang: Math.atan2(-Math.sin(rad), Math.cos(rad) * s), spent };
}
/* One ballistic step. Shared by the real shells, the AI predictor, the aim
 * guide, and the firing-range preview, so the demo flies exactly like war. */
export function stepBallistic(st, dt, wind, grav) {
    st.vx += wind * 2.2 * dt;
    st.vy += grav * dt;
    st.x += st.vx * dt;
    st.y += st.vy * dt;
}
/* Predict where a shot lands (used by the AI and the aim guide). */
export function simShot(world, arsenal, x, y, angle, power, wkey, dirS) {
    const w = arsenal.weapons[wkey];
    const rad = angle * Math.PI / 180;
    const st = {
        x, y,
        vx: Math.cos(rad) * shotSpeed(power, w.flat, w.speed) * dirS,
        vy: -Math.sin(rad) * shotSpeed(power, w.flat, w.speed),
    };
    const dt = 1 / 60;
    const grav = w.flat ? FLAT_GRAV : GRAV;
    for (let i = 0; i < 720; i++) {
        stepBallistic(st, dt, world.wind, grav);
        if (st.x < 0 || st.x >= W)
            return { x: st.x, y: st.y, oob: true };
        if (st.y >= H + 40)
            return { x: st.x, y: st.y, oob: true };
        if (i >= 6 && st.y >= world.terrain[clamp(Math.round(st.x), 0, W - 1)])
            return { x: st.x, y: st.y, oob: false };
    }
    return { x: st.x, y: st.y, oob: true };
}
/* Seekers bend toward the nearest live rival before the ballistic step. */
export function steerShell(tanks, s, w, dt) {
    let best = null, bd = Infinity;
    for (const t of tanks) {
        if (t.hp <= 0 || t === s.owner)
            continue;
        const d = Math.hypot(t.x - s.x, (t.y - 12) - s.y);
        if (d < bd) {
            bd = d;
            best = t;
        }
    }
    if (!best)
        return;
    const dx = best.x - s.x, dy = (best.y - 12) - s.y;
    const d = Math.max(1, Math.hypot(dx, dy));
    const push = (w.steer || 70) * dt;
    s.vx += (dx / d) * push;
    s.vy += (dy / d) * push;
}
/* Cluster shells split on fuse into a deterministic fan: fixed offsets, no
// random numbers, so the room server replays the exact same bloom. Returns
// the bomblets. */
export function splitShell(s, w) {
    const n = Math.max(2, w.split || 4);
    const fan = w.fan || 0.22;
    const sp = Math.hypot(s.vx, s.vy) * 0.85;
    const base = Math.atan2(s.vy, s.vx);
    const bomblets = [];
    for (let i = 0; i < n; i++) {
        const a = base + (i - (n - 1) / 2) * fan;
        bomblets.push({
            x: s.x, y: s.y,
            vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            wkey: s.wkey, owner: s.owner, life: 12,
            age: 0, pierced: false, split: true,
            dw: w.subDmg || w.dmg, dr: w.subRadius || w.radius,
        });
    }
    return bomblets;
}
/* The first unit shell s touches anywhere along its step, sampled every
   3 px so a fast shell (or a slow frame) cannot skip through one. The
   muzzle sits inside its gunner's box, so a shell ignores its owner until
   it has flown clear of that box; one that comes back (wind, a lob
   straight up) hits it like anyone else. */
export function sweepHit(tanks, s, x0, y0, x1, y1) {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 3));
    for (let i = 1; i <= n; i++) {
        const px = x0 + (x1 - x0) * i / n, py = y0 + (y1 - y0) * i / n;
        if (!s.clear && !inHitBox(s.owner, px, py))
            s.clear = true;
        for (const t of tanks) {
            if (t.hp <= 0 || t === s.pierced || (t === s.owner && !s.clear))
                continue;
            if (inHitBox(t, px, py))
                return { t, x: px, y: py };
        }
    }
    return null;
}
/* ---------- blasts ---------- */
/* Damage by distance d from the unit's body: full at the centre, falling to
   30% at the edge of the reach (blast radius plus 14, a unit's own size). */
export function blastDamage(dmg, d, r) {
    return Math.round(dmg * Math.max(0.3, 1 - d / (r + 14)));
}
/* A shell bursts at (x, y): carves the crater, then docks armor by distance
   (direct hits pay double) and settles shields, bunkers, EMP fuel drain,
   score, cash and wrecks in world. */
export function explode(world, arsenal, x, y, wkey, owner, direct, ov) {
    const w = arsenal.weapons[wkey];
    const dmg0 = (ov && ov.dmg) || w.dmg;
    const r = (ov && ov.radius) || w.radius;
    const gfx = (ov && ov.gfx) || w.gfx || {};
    carveCrater(world.terrain, x, y, r, H - 4);
    const blast = { x, y, r, wkey, fx: (ov && ov.fx) || wkey, shake: gfx.shake || 0.5, owner, events: [] };
    for (const t of world.tanks) {
        if (t.hp <= 0)
            continue;
        // Distance from the unit's body (its hit box centre), drone or tank.
        const b = unitHitBox(t);
        const d = Math.hypot(b.cx - x, b.cy - y);
        if (d > r + 14)
            continue;
        // A shield absorbs one hit whole, then it is gone.
        if (t.isPlayer && world.shield) {
            world.shield = false;
            blast.events.push({ kind: 'shield', tank: t });
            continue;
        }
        let dmg = blastDamage(dmg0, d, r);
        if (direct === t)
            dmg *= 2;
        // A bunker halves everything that gets through.
        if (t.isPlayer && (world.bunker || 0) > 0)
            dmg = Math.max(1, Math.round(dmg / 2));
        t.hp = Math.max(0, t.hp - dmg);
        // EMP fries fuel as well as armor.
        if (w.effect === 'emp') {
            t.fuel = Math.max(0, (t.fuel || 0) - (w.drain || 0));
            blast.events.push({ kind: 'arc', tank: t });
        }
        if (owner.isPlayer && !t.isPlayer) {
            world.score += dmg * 2;
            world.cash += dmg * 2;
        }
        if (t.hp <= 0)
            blast.events.push(wreck(world, arsenal, t));
        else
            blast.events.push({ kind: 'wound', tank: t, dmg, hp: t.hp, direct: !!direct });
    }
    return blast;
}
function wreck(world, arsenal, t) {
    // Last stand: the wreck itself detonates, once, then the trick is spent.
    let lastStand = null;
    if (t.isPlayer && world.laststand) {
        world.laststand = false;
        const ls = arsenal.gear['laststand'] || {};
        lastStand = explode(world, arsenal, t.x, t.y - 12, 'shell', t, null, { dmg: ls.dmg || 50, radius: ls.radius || 44, fx: 'laststand' });
    }
    if (!t.isPlayer) {
        world.score += TUNE.killBonus;
        world.cash += TUNE.killBonus;
    }
    return { kind: 'wreck', tank: t, lastStand };
}
/* Advances every shell dt seconds: flight, fuses, hits and bursts. Bomblets
   born this frame fly this frame too. */
export function stepShells(world, arsenal, dt) {
    const events = [];
    for (const s of world.shells) {
        const w = arsenal.weapons[s.wkey];
        s.age = (s.age || 0) + dt;
        if (w.effect === 'seeker')
            steerShell(world.tanks, s, w, dt);
        const x0 = s.x, y0 = s.y;
        stepBallistic(s, dt, world.wind, w.flat ? FLAT_GRAV : GRAV);
        s.life -= dt;
        events.push({ kind: 'trail', shell: s, x: s.x, y: s.y, vx: s.vx, vy: s.vy });
        if (s.life <= 0 || s.x < -20 || s.x > W + 20 || s.y > H + 40) {
            s.dead = true;
            continue;
        }
        // Cluster blooms on fuse, wherever it happens to be.
        if (w.effect === 'cluster' && !s.split && s.age >= (w.fuse || 0.9)) {
            s.split = true;
            events.push({ kind: 'split', wkey: s.wkey, x: s.x, y: s.y, ang: Math.atan2(s.vy, s.vx) });
            world.shells.push(...splitShell(s, w));
            s.dead = true;
            continue;
        }
        // Direct hit on a living tank?
        // A lance that already went through a tank cannot hit that tank again.
        let direct = null;
        const hit = sweepHit(world.tanks, s, x0, y0, s.x, s.y);
        if (hit) {
            // Burst where the shell touched the unit, not past it.
            direct = hit.t;
            s.x = hit.x;
            s.y = hit.y;
        }
        // Flak bursts next to anything it passes, but never its own gunner: the
        // muzzle starts inside the burst radius.
        if (!direct && w.effect === 'proximity') {
            let bd = w.prox || 34;
            for (const t of world.tanks) {
                if (t.hp <= 0 || t === s.owner)
                    continue;
                const d = Math.hypot(s.x - t.x, s.y - (t.y - 12));
                if (d < bd) {
                    bd = d;
                    direct = t;
                }
            }
        }
        const ov = s.dw ? { dmg: s.dw, radius: s.dr } : null;
        if (direct) {
            // A lance punches through its first victim and keeps flying.
            if (w.effect === 'pierce' && !s.pierced) {
                s.pierced = direct;
                events.push({ kind: 'pierce', wkey: s.wkey, x: s.x, y: s.y, ang: Math.atan2(s.vy, s.vx) });
                events.push({ kind: 'blast', blast: explode(world, arsenal, s.x, s.y, s.wkey, s.owner, direct, ov) });
                continue;
            }
            events.push({ kind: 'blast', blast: explode(world, arsenal, s.x, s.y, s.wkey, s.owner, direct, ov) });
            s.dead = true;
            continue;
        }
        if (s.age >= 0.1 && s.y >= surfY(world.terrain, s.x)) {
            events.push({ kind: 'blast', blast: explode(world, arsenal, s.x, s.y, s.wkey, s.owner, null, ov) });
            s.dead = true;
        }
    }
    world.shells = world.shells.filter(s => !s.dead);
    // No clearing here: every pellet of a volley resolves on its own, so a
    // buckshot spread scores up to three independent hits. The turn advances
    // once the last pellet lands (or fizzles).
    return events;
}
/* ---------- tanks falling ---------- */
/* Tanks left hanging over a crater fall under gravity every frame until they
   land; ground that rose (a new round, fresh hills) takes them straight up. */
export const FALL_GRAVITY = 700;
/* Returns the tanks that touched down this frame. */
export function fallTanks(world, dt) {
    const landed = [];
    for (const t of world.tanks) {
        if (t.hp <= 0)
            continue;
        const gy = surfY(world.terrain, t.x);
        if (t.y < gy - 0.5) {
            t.vy = (t.vy || 0) + FALL_GRAVITY * dt;
            t.y = Math.min(gy, t.y + t.vy * dt);
            if (t.y >= gy) {
                t.vy = 0;
                landed.push(t);
            }
        }
        else {
            t.y = gy;
            t.vy = 0;
        }
    }
    return landed;
}
export function anyTankFalling(world) {
    return world.tanks.some(t => t.hp > 0 && t.y < surfY(world.terrain, t.x) - 0.5);
}
export function aiChoose(world, arsenal, t) {
    // Drones feud with each other too: usually the nearest rival, sometimes
    // whoever else is still rolling. Nobody is safe, nobody is perfect.
    const rivals = world.tanks
        .filter(c => c !== t && c.hp > 0)
        .sort((a, b) => Math.abs(a.x - t.x) - Math.abs(b.x - t.x));
    let target = rivals[0] || t;
    if (rivals.length > 1 && world.rng() >= 0.6) {
        target = rivals[1 + Math.floor(world.rng() * (rivals.length - 1))];
    }
    const dirS = facing(t);
    const m = muzzle(t);
    let best = null;
    const keys = ['shell'];
    const rack = t.ammo || {};
    for (const k of arsenal.order) {
        if (k === 'shell' || keys.includes(k))
            continue;
        if ((rack[k] || 0) > 0)
            keys.push(k);
    }
    for (const wkey of keys) {
        for (let a = 25; a <= 155; a += 6) {
            for (let p = 20; p <= 100; p += 6) {
                const land = simShot(world, arsenal, m.x, m.y, a, p, wkey, dirS);
                const err = land.oob ? 400 + Math.abs(land.x - target.x) * 0.2 : Math.abs(land.x - target.x);
                if (!best || err < best.err)
                    best = { err, a, p, wkey };
            }
        }
    }
    const pick = best;
    // Deliberately shaky hands: dangerous up close, forgiving at range.
    // A jammer doubles the wobble of anything aimed at our tank.
    const skill = Math.min(1, 0.35 + world.round * 0.12);
    let wob = Math.max(0.25, 1.2 - skill);
    if (target.isPlayer && (world.jammer || 0) > 0)
        wob *= 2;
    const angle = clamp(Math.round(pick.a + gauss(world.rng) * 9 * wob), 10, 170);
    const power = clamp(Math.round(pick.p + gauss(world.rng) * 12 * wob), 10, 100);
    // Drones shuffle for a better firing spot instead of camping one rut.
    if (world.rng() < 0.35) {
        const dx = (world.rng() < 0.5 ? -1 : 1) * (8 + world.rng() * 27);
        const nx = clamp(t.x + dx, 12, W - 12);
        if (!spotTaken(world.tanks, t, nx)) {
            t.x = nx;
            t.y = surfY(world.terrain, t.x);
        }
    }
    return { wkey: pick.wkey, angle, power };
}
