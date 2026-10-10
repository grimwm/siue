/* Cylon Defense: the battlefield's scars and the page's debris.
 *
 * Two parts, both DOM-facing. `createHoles` owns the terrain holes: the dark
 * scorch each blast punches into the field, how long it holds, how it fades,
 * the cap on how many exist, and how a pause stops and re-times them.
 * `createDebris` owns the page's glyphs: wrapping the text of each panel into
 * single-letter spans with blast vectors, putting it back, and the full
 * re-scatter a mid-run nuke gives the debris that is already out.
 *
 * Neither looks anything up on its own. The elements, the document, the
 * viewport, the random source, the clock, the timers and the game's pause and
 * liveness predicates come in as `deps`, so nothing here reaches cylon.js's
 * state and a test can drive the holes with fake elements and a fake clock.
 * Browser-only: it compiles in the DOM program. */
/** How many holes may exist at once; the oldest is faded out to make room. */
export const MAX_HOLES = 24;
export const HOLE_PRESETS = {
    small: { radius: 56, holdMs: 800, fadeMs: 1000 },
    // Grenade-sized.
    medium: { radius: 165, holdMs: 2500, fadeMs: 2000 },
    // Radius filled at punch time from the viewport.
    large: { radius: 0, holdMs: 4000, fadeMs: 3000 },
};
export function createHoles(d) {
    let active = [];
    function remove(entry) {
        if (!entry)
            return;
        d.clearTimer(entry.holdTimer);
        d.clearTimer(entry.fadeTimer);
        entry.el.remove();
        active = active.filter((h) => h !== entry);
    }
    function armFade(entry, ms) {
        entry.fadeTimer = d.setTimer(() => {
            if (d.paused()) {
                entry.fadeTimer = null;
                return;
            }
            remove(entry);
        }, ms);
    }
    function armHold(entry, ms) {
        entry.holdTimer = d.setTimer(() => {
            if (d.paused()) {
                entry.holdTimer = null;
                return;
            }
            beginFade(entry);
        }, ms);
    }
    function beginFade(entry) {
        if (!entry.el.isConnected) {
            remove(entry);
            return;
        }
        entry.phase = 'fade';
        entry.el.style.setProperty('--hole-fade-ms', `${entry.fadeMs}ms`);
        entry.el.classList.add('is-fading');
        entry.fadeDue = d.now() + entry.fadeMs;
        armFade(entry, entry.fadeMs);
    }
    function forceFadeOldest() {
        const oldest = active[0];
        if (!oldest)
            return;
        if (oldest.phase === 'hold') {
            d.clearTimer(oldest.holdTimer);
            beginFade(oldest);
        }
        else {
            remove(oldest);
        }
    }
    function largeRadius() {
        const { width, height } = d.viewport();
        return Math.min(width || 400, height || 400) * 0.42;
    }
    return {
        punch(pageX, pageY, { radius, holdMs, fadeMs } = {}) {
            const field = d.field;
            if (!field || !d.isLive())
                return;
            const r = radius !== undefined && radius > 0 ? radius : largeRadius();
            const hold = holdMs !== undefined && holdMs > 0 ? holdMs : HOLE_PRESETS.small.holdMs;
            const fade = fadeMs !== undefined && fadeMs > 0 ? fadeMs : HOLE_PRESETS.small.fadeMs;
            while (active.length >= MAX_HOLES) {
                forceFadeOldest();
                if (active.length >= MAX_HOLES)
                    remove(active[0]);
            }
            const el = d.create('div');
            el.className = 'cylon-hole';
            el.setAttribute('aria-hidden', 'true');
            el.style.left = `${pageX}px`;
            el.style.top = `${pageY}px`;
            el.style.width = `${r * 2}px`;
            el.style.height = `${r * 2}px`;
            const rim = d.create('div');
            rim.className = 'cylon-hole-glitch';
            el.appendChild(rim);
            field.appendChild(el);
            const entry = {
                el,
                holdTimer: null,
                fadeTimer: null,
                holdDue: d.now() + hold,
                fadeDue: 0,
                fadeMs: fade,
                phase: 'hold',
            };
            armHold(entry, hold);
            active.push(entry);
        },
        clearAll() {
            [...active].forEach(remove);
            active = [];
            d.field?.querySelectorAll('.cylon-hole').forEach((el) => el.remove());
        },
        largeRadius,
        count: () => active.length,
        pause() {
            active.forEach((h) => {
                d.clearTimer(h.holdTimer);
                d.clearTimer(h.fadeTimer);
                h.holdTimer = null;
                h.fadeTimer = null;
            });
        },
        resume(pausedAt, elapsedMs) {
            active.forEach((h) => {
                if (h.phase === 'hold' && h.holdDue > pausedAt) {
                    d.clearTimer(h.holdTimer);
                    h.holdDue += elapsedMs;
                    armHold(h, Math.max(0, h.holdDue - d.now()));
                }
                else if (h.phase === 'fade' && h.fadeDue > pausedAt) {
                    d.clearTimer(h.fadeTimer);
                    h.fadeDue += elapsedMs;
                    armFade(h, Math.max(0, h.fadeDue - d.now()));
                }
            });
        },
    };
}
const PANEL_SPREAD = { xSpread: 0.55, ySpread: 0.7, rotMax: 28 };
const BLOCK_SPREAD = { xSpread: 1.15, ySpread: 1.25, rotMax: 150 };
const CHAR_SPREAD = { xSpread: 1.35, ySpread: 1.4, rotMax: 220 };
const LIST_ITEMS = '.interest-list li, .course-list li';
const BLOCKS = 'h1, h2, h3, .page-lead, .contact-block, .interest-list, .course-list, .project-list, .project-list > li, aside, .games-hub-card, .games-home-callout';
/** How long a reshuffle's long transition runs before the snappy curve returns. */
const RESHUFFLE_SETTLE_MS = 3000;
export function createDebris(d) {
    const body = d.doc.body;
    let settleTimer = null;
    function size() {
        const { width, height } = d.viewport();
        return { vw: width || 800, vh: height || 600 };
    }
    function assignBlastVector(el, vw, vh, s) {
        const dx = (d.random() - 0.5) * vw * s.xSpread;
        const dy = (d.random() - 0.5) * vh * s.ySpread;
        const rot = (d.random() - 0.5) * s.rotMax;
        el.style.setProperty('--sx', `${dx.toFixed(1)}px`);
        el.style.setProperty('--sy', `${dy.toFixed(1)}px`);
        el.style.setProperty('--sr', `${rot.toFixed(1)}deg`);
    }
    /** List markers get their own blast vectors (CSS reads --mx/--my/--mr). */
    function assignListVector(li, vw, vh) {
        const dx = (d.random() - 0.5) * vw * 0.35;
        const dy = (d.random() - 0.5) * vh * 0.4;
        const rot = (d.random() - 0.5) * 120;
        li.style.setProperty('--mx', `${dx.toFixed(1)}px`);
        li.style.setProperty('--my', `${dy.toFixed(1)}px`);
        li.style.setProperty('--mr', `${rot.toFixed(1)}deg`);
    }
    const isScattered = () => body.dataset['cylonScattered'] === '1';
    return {
        scattered: isScattered,
        scatter() {
            if (isScattered() || d.reduceMotion)
                return;
            const { vw, vh } = size();
            d.doc.querySelectorAll('.page-panel').forEach((root) => {
                // The panel shell is debris too, not just the letters inside.
                root.classList.add('cylon-scatter-panel');
                assignBlastVector(root, vw, vh, PANEL_SPREAD);
                root.querySelectorAll(BLOCKS).forEach((block) => {
                    block.classList.add('cylon-scatter-block');
                    assignBlastVector(block, vw, vh, BLOCK_SPREAD);
                });
                const walker = d.doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
                    acceptNode(node) {
                        if (!node.nodeValue || !/\S/.test(node.nodeValue))
                            return NodeFilter.FILTER_REJECT;
                        if (node.parentElement?.closest('.cylon-scatter-char'))
                            return NodeFilter.FILTER_REJECT;
                        return NodeFilter.FILTER_ACCEPT;
                    },
                });
                const texts = [];
                while (walker.nextNode())
                    texts.push(walker.currentNode);
                texts.forEach((textNode) => {
                    const frag = d.doc.createDocumentFragment();
                    for (const ch of textNode.nodeValue ?? '') {
                        if (ch === ' ' || ch === '\n' || ch === '\t') {
                            frag.appendChild(d.doc.createTextNode(ch));
                            continue;
                        }
                        const span = d.doc.createElement('span');
                        span.className = 'cylon-scatter-char';
                        span.textContent = ch;
                        // Spread across the full viewport: a planetary debris field.
                        assignBlastVector(span, vw, vh, CHAR_SPREAD);
                        frag.appendChild(span);
                    }
                    textNode.parentNode?.replaceChild(frag, textNode);
                });
                root.querySelectorAll(LIST_ITEMS).forEach((li) => assignListVector(li, vw, vh));
            });
            body.dataset['cylonScattered'] = '1';
        },
        restore() {
            if (!isScattered())
                return;
            d.doc.querySelectorAll('.cylon-scatter-char').forEach((span) => {
                span.replaceWith(d.doc.createTextNode(span.textContent || ''));
            });
            d.doc.querySelectorAll(LIST_ITEMS).forEach((li) => {
                li.style.removeProperty('--mx');
                li.style.removeProperty('--my');
                li.style.removeProperty('--mr');
            });
            d.doc.querySelectorAll('.cylon-scatter-panel, .cylon-scatter-block').forEach((el) => {
                el.classList.remove('cylon-scatter-panel', 'cylon-scatter-block');
                el.style.removeProperty('--sx');
                el.style.removeProperty('--sy');
                el.style.removeProperty('--sr');
            });
            body.dataset['cylonScattered'] = '0';
        },
        reshuffle() {
            if (!isScattered() || d.reduceMotion)
                return;
            const { vw, vh } = size();
            body.classList.add('cylon-glyphs-blowing');
            d.doc.querySelectorAll('.cylon-scatter-panel').forEach((el) => {
                assignBlastVector(el, vw, vh, PANEL_SPREAD);
            });
            d.doc.querySelectorAll('.cylon-scatter-block').forEach((el) => {
                assignBlastVector(el, vw, vh, BLOCK_SPREAD);
            });
            d.doc.querySelectorAll('.cylon-scatter-char').forEach((el) => {
                assignBlastVector(el, vw, vh, CHAR_SPREAD);
            });
            d.doc.querySelectorAll(LIST_ITEMS).forEach((li) => assignListVector(li, vw, vh));
            d.clearTimer(settleTimer);
            settleTimer = d.setTimer(() => {
                body.classList.remove('cylon-glyphs-blowing');
                settleTimer = null;
            }, RESHUFFLE_SETTLE_MS);
        },
        cancelReshuffleSettle() {
            d.clearTimer(settleTimer);
            settleTimer = null;
        },
    };
}
