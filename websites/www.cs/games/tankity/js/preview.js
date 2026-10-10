/* Operation Tankity: the firing-range preview.
 *
 * A live mini demo of one weapon, run on its own small field with the war's
 * own ballistics (stepBallistic, shotSpeed, blastDamage and carveCrater from
 * sim.ts), so the demo flies exactly like a real shot. It aims, fires at a
 * fixed dummy, shows how the volley went, then resets and goes again.
 *
 * The state is a plain PreviewState that game.js keeps (G.preview) and the
 * renderer draws from the view; this module only steps it. It never touches
 * the page: weapons, particle effects and the result text come in as a
 * PreviewEnv, so it compiles in the DOM-free program and preview-test.js
 * drives it on a clock the test moves by hand. */
import { GRAV, FLAT_GRAV, clamp, shotSpeed, stepBallistic, carveCrater, blastDamage, } from './sim.js?v=33d9295722';
export const PV_W = 360, PV_H = 200, PV_WIND = 3, PV_FOE_HP = 60;
export function makePreviewTerrain() {
    const terr = new Array(PV_W);
    for (let x = 0; x < PV_W; x++) {
        terr[x] = 150 + 14 * Math.sin(x / 63 + 1) + 7 * Math.sin(x / 29);
    }
    return terr;
}
/** A fresh demo of weapon `wkey`, or null for a weapon the arsenal lacks. */
export function createPreview(wkey, env, fx, cv) {
    if (!env.weapon(wkey))
        return null;
    return {
        wkey, terr: makePreviewTerrain(),
        sx: 44, tx: 296, wind: PV_WIND,
        angle: 60, power: 50, phase: 'aim', t: 0.6,
        shells: [], booms: [], volleys: 0, foeHp: PV_FOE_HP,
        fx,
        result: '', resultT: 0, volleyDmg: 0, volleyHits: 0,
        cv,
    };
}
function weaponOf(env, key) {
    const w = env.weapon(key);
    if (!w)
        throw new Error(`preview: unknown weapon ${key}`);
    return w;
}
/** Where a shot at (angle, power) comes down, in columns. */
export function previewShot(pv, env, angle, power) {
    const w = weaponOf(env, pv.wkey);
    const rad = angle * Math.PI / 180;
    const st = {
        x: pv.sx, y: (pv.terr[pv.sx] ?? 0) - 12,
        vx: Math.cos(rad) * shotSpeed(power, w.flat, w.speed),
        vy: -Math.sin(rad) * shotSpeed(power, w.flat, w.speed),
    };
    const grav = w.flat ? FLAT_GRAV : GRAV;
    for (let i = 0; i < 720; i++) {
        stepBallistic(st, 1 / 60, pv.wind, grav);
        if (st.x < 0 || st.x >= PV_W || st.y >= PV_H)
            return st.x;
        if (i >= 6 && st.y >= (pv.terr[clamp(Math.round(st.x), 0, PV_W - 1)] ?? 0))
            return st.x;
    }
    return st.x;
}
/* Aim the demo at the target with the same integrator the war uses. A coarse
 * sweep plus a fine pass lands every demo on the target: demos never miss.
 * The fine passes read the best candidate live, so their bounds follow it as
 * it improves mid-sweep. */
export function solvePreview(pv, env) {
    const w = weaponOf(env, pv.wkey);
    const best = { have: false, err: 0, a: 0, p: 0 };
    const consider = (a, p) => {
        const ca = clamp(a, 5, 85), cp = clamp(p, 10, 100);
        const err = Math.abs(previewShot(pv, env, ca, cp) - pv.tx);
        if (!best.have || err < best.err) {
            best.have = true;
            best.err = err;
            best.a = ca;
            best.p = cp;
        }
    };
    if (w.flat) {
        // Rail speed answers to power, so sweep both: short soft lobs thread
        // hills that full-power bolts sail over.
        for (let a = 5; a <= 85; a += 2) {
            for (const p of [20, 35, 50, 65, 80])
                consider(a, p);
        }
        for (let a = best.a - 3; a <= best.a + 3; a += 0.5) {
            for (let p = best.p - 6; p <= best.p + 6; p += 1.5)
                consider(a, p);
        }
    }
    else {
        for (let p = 20; p <= 100; p += 2)
            consider(60, p);
        for (let a = 50; a <= 70; a += 2)
            consider(a, best.p);
        for (let a = best.a - 3; a <= best.a + 3; a += 0.5)
            consider(a, best.p);
        for (let p = best.p - 2; p <= best.p + 2; p += 0.25)
            consider(best.a, p);
    }
    pv.angle = best.a;
    pv.power = best.p;
}
function previewFire(pv, env) {
    const w = weaponOf(env, pv.wkey);
    const rad = pv.angle * Math.PI / 180;
    const shots = w.pellets || 1;
    const y0 = (pv.terr[pv.sx] ?? 0) - 12;
    for (let i = 0; i < shots; i++) {
        const off = shots === 1 ? 0 : (i - (shots - 1) / 2) * (w.spread || 0);
        const a = rad + off;
        const spd = shotSpeed(pv.power, w.flat, w.speed);
        pv.shells.push({ x: pv.sx, y: y0, vx: Math.cos(a) * spd, vy: -Math.sin(a) * spd, wkey: pv.wkey, age: 0, pierced: false, split: false });
    }
    pv.volleyDmg = 0;
    pv.volleyHits = 0;
    env.muzzle(pv.fx, pv.wkey, pv.sx, y0, Math.atan2(-Math.sin(rad), Math.cos(rad)));
}
function previewBoom(pv, env, x, y, ov) {
    const w = weaponOf(env, pv.wkey);
    const dmg0 = (ov && ov.dmg) || w.dmg;
    const r = (ov && ov.radius) || w.radius;
    pv.booms.push({ x, y, r, wkey: pv.wkey, t: 0, life: 0.5 });
    carveCrater(pv.terr, x, y, r, PV_H - 4);
    env.impact(pv.fx, pv.wkey, x, y, r);
    // Same falloff the war uses, scored against the demo target.
    const fy = (pv.terr[pv.tx] ?? 0) - 12;
    const d = Math.hypot(pv.tx - x, fy - y);
    if (d <= r + 14) {
        let dmg = blastDamage(dmg0, d, r);
        const direct = d < 14;
        if (direct)
            dmg *= 2;
        pv.foeHp = Math.max(0, pv.foeHp - dmg);
        pv.volleyDmg += dmg;
        pv.volleyHits += 1;
    }
}
const shellBoom = (s) => s.dw ? { dmg: s.dw, radius: s.dr } : null;
/** Advance the demo by `dt` seconds. */
export function stepPreview(pv, dt, env) {
    if (pv.fx) {
        pv.fx.wind = pv.wind;
        pv.fx.step(dt);
    }
    for (const bm of pv.booms)
        bm.t += dt;
    pv.booms = pv.booms.filter(bm => bm.t < bm.life);
    if (pv.resultT > 0)
        pv.resultT -= dt;
    if (pv.phase === 'aim') {
        pv.t -= dt;
        if (pv.t <= 0) {
            solvePreview(pv, env);
            previewFire(pv, env);
            pv.phase = 'fly';
        }
    }
    else if (pv.phase === 'fly') {
        const w = weaponOf(env, pv.wkey);
        const grav = w.flat ? FLAT_GRAV : GRAV;
        const fy = (pv.terr[pv.tx] ?? 0) - 12;
        // Bomblets join pv.shells mid-loop and get their first step this frame.
        for (const s of pv.shells) {
            s.age = (s.age || 0) + dt;
            if (w.effect === 'seeker') {
                const dx = pv.tx - s.x, dy = fy - s.y;
                const d = Math.max(1, Math.hypot(dx, dy));
                const push = (w.steer || 70) * dt;
                s.vx += (dx / d) * push;
                s.vy += (dy / d) * push;
            }
            stepBallistic(s, dt, pv.wind, grav);
            if (s.dead)
                continue;
            env.trail(pv.fx, s, dt);
            if (w.effect === 'cluster' && !s.split && s.age >= (w.fuse || 0.9)) {
                s.split = true;
                env.special(pv.fx, pv.wkey, 'split', s.x, s.y, Math.atan2(s.vy, s.vx));
                const n = Math.max(2, w.split || 4), fan = w.fan || 0.22;
                const sp = Math.hypot(s.vx, s.vy) * 0.85, base = Math.atan2(s.vy, s.vx);
                for (let i = 0; i < n; i++) {
                    const a = base + (i - (n - 1) / 2) * fan;
                    pv.shells.push({ x: s.x, y: s.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, wkey: pv.wkey, age: 0, pierced: false, split: true, dw: w.subDmg || w.dmg, dr: w.subRadius || w.radius });
                }
                s.dead = true;
                continue;
            }
            const touch = !s.pierced && Math.hypot(s.x - pv.tx, s.y - fy) < 10;
            const near = w.effect === 'proximity' && Math.hypot(s.x - pv.tx, s.y - fy) < (w.prox || 34);
            if (touch || near) {
                if (w.effect === 'pierce' && !s.pierced && touch) {
                    s.pierced = true;
                    env.special(pv.fx, pv.wkey, 'pierce', s.x, s.y, Math.atan2(s.vy, s.vx));
                    previewBoom(pv, env, s.x, s.y, shellBoom(s));
                    continue;
                }
                s.dead = true;
                previewBoom(pv, env, s.x, s.y, shellBoom(s));
                continue;
            }
            s.dead = s.x < 0 || s.x >= PV_W || s.y >= PV_H ||
                (s.age >= 0.1 && s.y >= (pv.terr[clamp(Math.round(s.x), 0, PV_W - 1)] ?? 0));
            if (s.dead)
                previewBoom(pv, env, s.x, s.y, shellBoom(s));
        }
        pv.shells = pv.shells.filter(s => !s.dead);
        if (!pv.shells.length) {
            pv.phase = 'show';
            pv.t = 1.6;
            pv.result = pv.volleyHits > 1
                ? `${pv.volleyHits} hits · ${pv.volleyDmg} total damage`
                : pv.volleyHits === 1
                    ? (pv.volleyDmg >= w.dmg ? `Direct hit! ${pv.volleyDmg} damage (×2 bonus)` : `Splash: ${pv.volleyDmg} damage`)
                    : 'Clean miss. Blame the wind.';
            pv.resultT = 1.6;
            env.showResult(pv.result);
        }
    }
    else if (pv.phase === 'show') {
        pv.t -= dt;
        if (pv.t <= 0) {
            pv.volleys += 1;
            if (pv.foeHp <= 0 || pv.volleys % 4 === 3) {
                pv.terr = makePreviewTerrain();
                pv.foeHp = PV_FOE_HP;
            }
            pv.phase = 'aim';
            pv.t = 0.5;
        }
    }
}
