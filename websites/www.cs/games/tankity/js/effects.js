/* ---------- effects ---------- */
/* Every weapon's looks (muzzle flash, flight trail, blast, specials) live in
// game.yaml's effects section (served as game.json), keyed by weapon key, and
// run on the particle engine in fx.js (shared with the dev-only
// fx-editor.html). game.yaml and README.md describe the fields. Blast radii
// stay in the arsenal: effects scale to the radius the sim hands them and
// never decide it. Until game.json arrives (or when it cannot, e.g. file://
// play) this baked Shell keeps the war lit, and any weapon it does not
// describe gets a plain effect derived from its paint job (gfx). */
export const FX = window.TankityFX || null;
export const FX_BUDGET = 700;
const FALLBACK_FX = {
    shell: {
        body: { halo: 9, alpha: 0.45 },
        muzzle: { emitters: [
                { count: 1, size: [7, 7], sizeEnd: 0.4, life: [0.09, 0.09], alpha: [1, 0.6, 0], colors: ['#ffffff', '#ffe27a'], glow: true },
                { shape: 'streak', count: 7, aim: 'forward', spread: 35, speed: [90, 200], length: 7, life: [0.1, 0.22], gravity: 200, drag: 1.2, colors: ['#fff3c4', '#ffb13c'], glow: true },
            ] },
        trail: { emitters: [
                { rate: 46, life: [0.22, 0.4], speed: [0, 14], size: [1.4, 2.2], sizeEnd: 0.3, colors: ['#fff3c4', '#ffd75e', '#ff9f43'], glow: true },
            ] },
        impact: { emitters: [
                { count: 1, unit: 'r', size: [0.9, 0.9], sizeEnd: 0.5, life: [0.25, 0.25], alpha: [1, 0.7, 0], colors: ['#ffffff', '#ffb13c'], glow: true },
                { shape: 'ring', count: 1, unit: 'r', size: [0.25, 0.25], sizeEnd: 4, ease: 'out', life: [0.4, 0.4], width: 3, alpha: [0.8, 0.4, 0], colors: ['#e8d4a0', '#a0703a'] },
                { count: 16, speed: [70, 190], angle: 90, spread: 150, gravity: 340, drag: 0.4, size: [1.3, 2.6], life: [0.5, 1], round: false, alpha: [1, 1, 0], colors: ['#b8854a', '#7a4a1e', '#3a2610'] },
                { shape: 'streak', count: 10, speed: [120, 260], length: 9, life: [0.2, 0.5], gravity: 200, drag: 1.2, colors: ['#fff3c4', '#ffb13c'], glow: true },
            ] },
    },
};
export function createEffects(deps) {
    const { G, tables } = deps;
    let FX_DEFS = FX ? FX.dress(FALLBACK_FX) : {};
    const FX_DERIVED = {};
    /* A weapon's effect set: its entry, else one derived from its paint job. */
    function fxSet(key) {
        const d = FX_DEFS[key];
        if (d)
            return d;
        return FX_DERIVED[key] || (FX_DERIVED[key] = FX.derive(((tables.weapons[key] || {}).gfx)));
    }
    /* Install game.json's effects section: each entry that passes validation wins; a
       bad one is reported and left to the derived effect. */
    function installEffects(data) {
        if (!FX || !data || typeof data !== 'object')
            return 0;
        const next = {};
        for (const key of Object.keys(data)) {
            if (key[0] === '_')
                continue;
            FX.dress({ [key]: data[key] });
            const bad = FX.validate({ [key]: data[key] }, [key]);
            if (bad.length) {
                if (window.console)
                    console.warn('game.json effects: ' + bad[0]);
                continue;
            }
            next[key] = data[key];
        }
        if (!next.shell)
            return 0;
        FX_DEFS = next;
        return Object.keys(next).length;
    }
    if (FX) {
        // Reduced motion: fewer, shorter particles and no screen flash (shake is
        // already off in the renderer).
        const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
        if (mq) {
            FX.reduced = !!mq.matches;
            if (mq.addEventListener)
                mq.addEventListener('change', e => { FX.reduced = e.matches; });
        }
        FX.loadSprites('fx/sprites/');
    }
    function fxMuzzle(sys, wkey, x, y, ang) {
        if (!sys)
            return;
        const kick = FX.play.muzzle(sys, fxSet(wkey), x, y, ang);
        if (kick !== undefined && sys === G.fx)
            G.shake = Math.max(G.shake || 0, kick);
    }
    /* Returns the effect's own screen shake, if it sets one. */
    function fxImpact(sys, key, x, y, r) {
        return sys ? FX.play.impact(sys, fxSet(key), x, y, r) : undefined;
    }
    function fxSpecial(sys, key, name, x, y, ang) {
        if (sys)
            FX.play.special(sys, fxSet(key), name, x, y, ang);
    }
    /* A shell in flight (any object with x, y, vx, vy, wkey, or pass them
       explicitly for a replayed one): drip its trail along the path it flew. */
    function fxTrail(sys, s, dt, x, y, vx, vy, wkey) {
        if (!sys)
            return;
        if (x === undefined) {
            x = s.x;
            y = s.y;
            vx = s.vx;
            vy = s.vy;
            wkey = s.wkey;
        }
        FX.play.trail(sys, fxSet(wkey), s, dt, x, y, vx, vy);
    }
    return { fxSet, installEffects, fxMuzzle, fxImpact, fxSpecial, fxTrail };
}
