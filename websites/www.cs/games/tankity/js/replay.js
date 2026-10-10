/* Operation Tankity: the room volley replay.
 *
 * The server settles a whole turn per request and sends it as events, each
 * stamped with `at` (seconds into the volley); a shot carries the path it
 * flew, its launch and landing times and its blast radius. This module plays
 * a volley back at real speed, so every room client shows exactly what the
 * server computed: the barrel easing to the shooter's aim, each shell
 * following its recorded path point by point, blasts and hits landing when
 * the server says they did.
 *
 * It owns the queue of events waiting to play and the volley on screen, and
 * nothing else. What the replay causes (a blast, a muzzle flash, a trail, a
 * sound, a log line, a tank's armor) happens through the ReplayEnv it is built
 * with; where the shells are now it hands back from flying(), for the
 * renderer. game.js decides when a room snapshot is adopted: it asks idle()
 * after step(). Nothing here touches the page, so it compiles in the DOM-free
 * program and replay-test.js steps recorded volleys on a clock the test moves
 * by hand. */
import { planCatchUp, isVolleyOpener } from './net.js?v=6259020b84';
/** rooms.php records a path point every 5 sim steps at 60/s. */
export const PATH_HZ = 12;
/** A volley kept back by a catch-up plays this much faster. */
export const FAST_SPEED = 3;
export function parsePath(str) {
    return String(str || '').split(' ').filter(Boolean).map(p => p.split(',').map(Number));
}
/** Where a replayed shell is at flight time ft: path points are 1/PATH_HZ s
 * apart. The last element is the path index the position is on. */
export function shellAt(s, ft) {
    const k = (ft - s.e.t0) * PATH_HZ;
    const pts = s.pts;
    if (!pts.length)
        return [s.e.x1, s.e.y1, 0];
    const i = Math.max(0, Math.min(pts.length - 1, Math.floor(k)));
    const j = Math.min(pts.length - 1, i + 1);
    const f = Math.max(0, Math.min(1, k - i));
    const a = pts[i], b = pts[j];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, i];
}
/** A replayed shell's velocity at path index i (points are 1/PATH_HZ s apart). */
export function shellVel(s, i) {
    const pts = s.pts, a = pts[Math.min(i, pts.length - 1)], b = pts[Math.min(i + 1, pts.length - 1)];
    if (!a || !b)
        return [0, 0];
    return [(b[0] - a[0]) * PATH_HZ, (b[1] - a[1]) * PATH_HZ];
}
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function createReplay(env) {
    let queue = [];
    let volley = null;
    let fastNext = false;
    function startVolley() {
        const fast = fastNext;
        fastNext = false;
        const opener = queue.shift();
        const events = [];
        while (queue.length && !isVolleyOpener(queue[0]))
            events.push(queue.shift());
        const shooter = env.tank(opener.seat);
        const a1 = opener.a ?? (shooter ? shooter.angle : 62);
        const p1 = opener.pw ?? (shooter ? shooter.power : 55);
        const x1 = opener.x ?? (shooter ? shooter.x : 0);
        const swing = shooter ? Math.max(Math.abs(a1 - shooter.angle), Math.abs(p1 - shooter.power), Math.abs(x1 - shooter.x)) : 0;
        volley = {
            fast,
            opener, events, done: new Set(), shooter, tau: 0, ft: 0,
            a0: shooter ? shooter.angle : a1, p0: shooter ? shooter.power : p1, x0: shooter ? shooter.x : x1, a1, p1, x1,
            aimDur: swing < 1 ? 0.15 : clamp(0.45 + swing / 110, 0.5, 1.4),
            shots: [], end: Math.max(0, ...events.map(e => ('t1' in e ? e.t1 : undefined) ?? e.at ?? 0)) + 0.6,
        };
        env.event(opener);
    }
    function stepVolley(v, dt) {
        // A volley kept back from a catch-up plays at triple speed.
        v.tau += dt * (v.fast ? FAST_SPEED : 1);
        const sh = v.shooter;
        if (sh) {
            const u = Math.min(1, v.tau / v.aimDur);
            const e = u * u * (3 - 2 * u);
            sh.angle = v.a0 + (v.a1 - v.a0) * e;
            sh.power = v.p0 + (v.p1 - v.p0) * e;
            sh.x = v.x0 + (v.x1 - v.x0) * e;
            sh.showA = sh.angle;
            sh.showP = sh.power;
        }
        const ft = v.tau - v.aimDur;
        v.ft = ft;
        if (ft < 0)
            return;
        for (const e of v.events) {
            if (v.done.has(e) || e.at === undefined || ft < e.at)
                continue;
            v.done.add(e);
            if (e.t === 'shot') {
                const shot = { e, pts: parsePath(e.p), landed: false, fx: null };
                v.shots.push(shot);
                env.launch();
                // Bomblets leave the bloom point; every other shot leaves the barrel.
                const first = shot.pts[0];
                if (e.t0 < 0.01 && shot.pts.length > 1 && first) {
                    const hv = shellVel(shot, 0);
                    env.muzzle(e.w, first[0], first[1], Math.atan2(hv[1], hv[0]));
                }
            }
            else if (e.t === 'burst') {
                env.blast(e.x, e.y, e.r, e.w);
                // A burst from a lance is the bolt passing through a tank.
                const pass = env.effect(e.w) === 'pierce' && v.shots.find(s => s.e.w === e.w);
                if (pass) {
                    const hv = shellVel(pass, shellAt(pass, ft)[2]);
                    env.special(e.w, 'pierce', e.x, e.y, Math.atan2(hv[1], hv[0]));
                }
            }
            else {
                if (e.t === 'hit') {
                    const t = env.tank(e.seat);
                    if (t)
                        t.hp = Math.max(0, t.hp - e.dmg);
                    // Over a fried tank, the EMP's arcs.
                    const emp = t && v.shots.find(s => env.effect(s.e.w) === 'emp');
                    if (t && emp)
                        env.special(emp.e.w, 'arc', t.x, t.y - 12, 0);
                }
                else if (e.t === 'kill') {
                    const t = env.tank(e.seat);
                    if (t)
                        t.hp = 0;
                }
                env.event(e);
            }
        }
        for (const s of v.shots) {
            if (s.landed)
                continue;
            if (ft < s.e.t1) {
                // In flight: the trail drips along the path the server flew.
                const at = shellAt(s, ft), hv = shellVel(s, at[2]);
                env.trail(s, dt, at[0], at[1], hv[0], hv[1], s.e.w);
                continue;
            }
            s.landed = true;
            if (s.e.r > 0)
                env.blast(s.e.x1, s.e.y1, s.e.r, s.e.w);
            else if (s.e.split) {
                const hv = shellVel(s, s.pts.length - 2);
                env.special(s.e.w, 'split', s.e.x1, s.e.y1, Math.atan2(hv[1], hv[0]));
            }
        }
        if (ft >= v.end && v.events.every(e => v.done.has(e) || e.at === undefined) && v.shots.every(s => s.landed)) {
            for (const e of v.events)
                if (!v.done.has(e))
                    env.event(e);
            volley = null;
        }
    }
    return {
        get queue() { return queue; },
        shooter: () => (volley && volley.shooter) || null,
        push(events) { queue.push(...events); },
        step(dt) {
            if (volley)
                stepVolley(volley, dt);
            while (!volley && queue.length) {
                if (isVolleyOpener(queue[0]))
                    startVolley();
                else
                    env.event(queue.shift());
            }
        },
        idle: () => !volley && !queue.length,
        flying() {
            const out = [];
            if (volley && volley.ft >= 0) {
                for (const sh of volley.shots) {
                    if (sh.landed)
                        continue;
                    const [hx, hy, idx] = shellAt(sh, volley.ft);
                    const hv = shellVel(sh, idx);
                    out.push({ x: hx, y: hy, vx: hv[0], vy: hv[1], wkey: sh.e.w });
                }
            }
            return out;
        },
        catchUp(waiting, seat) {
            const plan = planCatchUp(queue, !!volley, waiting, seat);
            if (!plan)
                return null;
            volley = null;
            const skipped = queue.slice(0, plan.cut);
            queue = queue.slice(plan.cut);
            fastNext = plan.fastNext;
            return skipped;
        },
        clear() { queue = []; volley = null; },
    };
}
