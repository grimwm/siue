/* Cylon Defense: the grenade and the raptor strike.
 *
 * The two abilities are a small state machine each. The grenade is armed by a
 * press and thrown by the next click, or disarmed by a second press; the raptor
 * is called, strikes a beat later and lands a beat after that. Both are held
 * off by a cooldown: the moment each is next usable lives in the game's
 * Schedule (src/state.ts: grenadeReadyAt, raptorReadyAt), so a pause moves it
 * with every other due-at. This module keeps the arming flag, the raptor's
 * "inbound" flag and its timers, and decides what a press or a click does. It
 * touches no element: the cooldown fields come through `readyAt`/`setReadyAt`,
 * and the visible effects (the blast, the holes, the landscape, the knock-outs,
 * the eye, the raptor's sprite, the buttons) come in as callbacks. DOM-free, so
 * abilities-test.js runs it on a fake clock with fake timers. */
export const GRENADE_COOLDOWN_MS = 10000;
export const RAPTOR_COOLDOWN_MS = 60000;
/** From the call to the strike band's blast. */
export const RAPTOR_STRIKE_AT_MS = 700;
/** From the call to the raptor leaving, when it can be called again. */
export const RAPTOR_LANDS_AT_MS = 1900;
/** Milliseconds from `now` until `readyAt`, never negative. */
export function cooldownRemaining(readyAt, now) {
    return Math.max(0, readyAt - now);
}
/** The whole seconds a cooldown badge shows (10…1, 60…1), or 0 when it is not cooling. */
export function cooldownSeconds(readyAt, now) {
    const remaining = cooldownRemaining(readyAt, now);
    return remaining > 0 ? Math.max(1, Math.ceil(remaining / 1000)) : 0;
}
export function createAbilities(d) {
    let armed = false;
    let inbound = false;
    let timers = [];
    function clearRaptor() {
        timers.forEach((t) => d.clearTimer(t));
        timers = [];
        inbound = false;
        d.raptorClear();
    }
    function cancelGrenadeArm() {
        if (!armed)
            return;
        armed = false;
        d.changed();
    }
    return {
        grenadeArmed: () => armed,
        raptorInbound: () => inbound,
        cancelGrenadeArm,
        clearRaptor,
        readyGrenade() {
            if (!d.isLive())
                return false;
            if (d.now() < d.readyAt('grenade'))
                return false;
            if (armed) {
                cancelGrenadeArm();
                return false;
            }
            armed = true;
            d.sfx('grenadeArm');
            d.changed();
            return true;
        },
        throwGrenadeAt(pageX, pageY) {
            if (!d.isLive())
                return false;
            if (!armed)
                return false;
            if (d.now() < d.readyAt('grenade')) {
                cancelGrenadeArm();
                return false;
            }
            armed = false;
            d.setReadyAt('grenade', d.now() + GRENADE_COOLDOWN_MS);
            d.changed();
            d.sfx('grenade');
            d.grenadeBlast(pageX, pageY);
            return true;
        },
        callRaptor() {
            if (!d.isLive() || inbound)
                return false;
            if (d.now() < d.readyAt('raptor'))
                return false;
            if (!d.raptorAvailable())
                return false;
            clearRaptor();
            inbound = true;
            d.setReadyAt('raptor', d.now() + RAPTOR_COOLDOWN_MS);
            d.changed();
            d.sfx('raptor');
            d.raptorLaunch();
            timers.push(d.setTimer(() => {
                if (!inbound || !d.isLive())
                    return;
                d.raptorStrike();
            }, RAPTOR_STRIKE_AT_MS));
            timers.push(d.setTimer(() => {
                d.raptorClear();
                inbound = false;
                timers = [];
                d.changed();
            }, RAPTOR_LANDS_AT_MS));
            return true;
        },
        reset() {
            d.setReadyAt('grenade', 0);
            d.setReadyAt('raptor', 0);
            armed = false;
            clearRaptor();
        },
    };
}
