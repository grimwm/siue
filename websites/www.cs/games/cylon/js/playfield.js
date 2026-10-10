/* Cylon Defense: where drones may stand.
 *
 * The geometry behind spawning and marching: the box of page coordinates a
 * drone stays tappable in, which spots are clear of links and buttons, and
 * where a drone enters from and goes to next. Everything here is arithmetic on
 * numbers the page measured (the scroll offset, the viewport, the nav bar's
 * bottom edge, the rectangles of the links to avoid), so it compiles in the
 * DOM-free program and playfield-test.js drives it with a seeded random
 * source. cylon.js measures the page and moves the drone elements. */
export function rectsOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}
export function inflate(rect, pad) {
    return {
        left: rect.left - pad,
        top: rect.top - pad,
        right: rect.right + pad,
        bottom: rect.bottom + pad,
    };
}
/** The page-coordinate box of a drone standing at (x, y). */
export function botPageRect(x, y, bot) {
    return { left: x, top: y, right: x + bot.w, bottom: y + bot.h };
}
/** Page-coord box drones should live in so they stay tappable on screen. */
export function visibleBounds(view, bot) {
    const topPad = Math.max(72, view.navBottom + 10);
    const margin = 10;
    const left = view.scrollX + margin;
    const top = view.scrollY + topPad;
    const right = view.scrollX + view.width - bot.w - margin;
    const bottom = view.scrollY + view.height - bot.h - margin - 6;
    return {
        left,
        top,
        right: Math.max(left, right),
        bottom: Math.max(top, bottom),
    };
}
export function clampToBounds(b, x, y) {
    return {
        x: Math.min(Math.max(b.left, x), b.right),
        y: Math.min(Math.max(b.top, y), b.bottom),
    };
}
export function isInBounds(b, x, y) {
    return x >= b.left - 2 && x <= b.right + 2 && y >= b.top - 2 && y <= b.bottom + 2;
}
/** True when a drone at (x, y) is inside the page and clear of every forbidden rect. */
export function isSafeSpot(x, y, forbidden, doc, bot) {
    const rect = botPageRect(x, y, bot);
    if (x < 4 || y < 70 || x + bot.w > doc.w - 4 || y + bot.h > doc.h - 4)
        return false;
    return !forbidden.some((r) => rectsOverlap(rect, r));
}
export function randomVisibleSpot(f, rng) {
    const b = f.bounds;
    const spanX = Math.max(1, b.right - b.left);
    const spanY = Math.max(1, b.bottom - b.top);
    for (let i = 0; i < 36; i++) {
        const x = b.left + rng() * spanX;
        const y = b.top + rng() * spanY;
        if (isSafeSpot(x, y, f.forbidden, f.doc, f.bot))
            return { x, y, edge: 'return' };
    }
    // Last resort: clamped center of the playfield
    const fallback = clampToBounds(b, (b.left + b.right) / 2, (b.top + b.bottom) / 2);
    if (isSafeSpot(fallback.x, fallback.y, f.forbidden, f.doc, f.bot)) {
        return { ...fallback, edge: 'return' };
    }
    return null;
}
/** Entry spots along the left, right and bottom edges, in random order. */
export function candidateSpots(b, rng) {
    const spots = [];
    const edges = ['left', 'right', 'bottom'];
    const spanY = Math.max(40, b.bottom - b.top);
    const spanX = Math.max(40, b.right - b.left);
    // Stay inside the visible playfield (tappable), not past the screen edge
    edges.forEach((edge) => {
        for (let i = 0; i < 10; i++) {
            let x;
            let y;
            if (edge === 'left') {
                x = b.left;
                y = b.top + rng() * spanY;
            }
            else if (edge === 'right') {
                x = b.right;
                y = b.top + rng() * spanY;
            }
            else {
                x = b.left + rng() * spanX;
                y = b.bottom - rng() * Math.min(36, spanY * 0.25);
            }
            const clamped = clampToBounds(b, x, y);
            spots.push({ ...clamped, edge });
        }
    });
    for (let i = spots.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const a = spots[i];
        spots[i] = spots[j];
        spots[j] = a;
    }
    return spots;
}
/**
 * A clear spot for a drone: near `near` (a patrol step) when it is on screen,
 * back into view when it is not, otherwise along an entry edge.
 */
export function findSafeSpot(f, near, rng) {
    if (near) {
        // Off-screen after a scroll (or bad patrol): march back into view
        if (!isInBounds(f.bounds, near.x, near.y)) {
            const back = randomVisibleSpot(f, rng);
            if (back)
                return back;
        }
        else {
            for (let i = 0; i < 28; i++) {
                const x = near.x + (rng() - 0.5) * 200;
                const y = near.y + (rng() - 0.5) * 140;
                const clamped = clampToBounds(f.bounds, x, y);
                if (isSafeSpot(clamped.x, clamped.y, f.forbidden, f.doc, f.bot)) {
                    return { x: clamped.x, y: clamped.y, edge: 'patrol' };
                }
            }
        }
    }
    for (const spot of candidateSpots(f.bounds, rng)) {
        if (isSafeSpot(spot.x, spot.y, f.forbidden, f.doc, f.bot))
            return spot;
    }
    return randomVisibleSpot(f, rng);
}
/** Where a drone starts its march: just outside the visible playfield on its entry side. */
export function marchOrigin(b, spot, bot) {
    if (spot.edge === 'left')
        return { x: b.left - bot.w + 6, y: spot.y };
    if (spot.edge === 'right')
        return { x: b.right + bot.w - 6, y: spot.y };
    return { x: spot.x, y: b.bottom + bot.h - 6 };
}
