/* Operation Tankity: the solo match flow.
 *
 * The phases of a match against the drone battery and the moves between them:
 * a name card (banner), the shop, a turn being aimed (aim for the player,
 * think for a drone), shells in flight (fly), the pause while the dust and
 * the falling tanks settle (settle), and the end of the match (over). One
 * table says which event is legal in which phase and where it leads;
 * transition() reads it and answers the next phase, or null for a move the
 * match has no business making. game.js asks for each next phase here and
 * stores it in G.phase; the strings are the ones the e2e specs and the room
 * client read, so they do not change.
 *
 * Room matches are driven by the server's snapshots (net.ts, replay.ts) and
 * set their phase from those; they do not pass through this table.
 * Nothing here touches the page, so it compiles in the DOM-free program and
 * flow-test.js walks a whole match through it. */
export const PHASES = ['banner', 'shop', 'aim', 'think', 'fly', 'settle', 'over'];
export const EVENTS = [
    'matchStart', 'demo', 'shopOpen', 'shopDone', 'playerUp', 'foeUp', 'fire', 'shellsLanded',
    'roundWon', 'tankLost', 'matchWon', 'matchLost',
];
/** event -> phase it may happen in -> phase it leads to. A phase missing from
 * an event's row rejects that event. */
export const FLOW = {
    // Starting over is legal from anywhere: a new game mid-turn, or after the end.
    matchStart: { banner: 'banner', shop: 'banner', aim: 'banner', think: 'banner', fly: 'banner', settle: 'banner', over: 'banner' },
    demo: { banner: 'banner', shop: 'banner', aim: 'banner', think: 'banner', fly: 'banner', settle: 'banner', over: 'banner' },
    shopOpen: { banner: 'shop' },
    shopDone: { shop: 'banner' },
    playerUp: { banner: 'aim', settle: 'aim' },
    foeUp: { banner: 'think', settle: 'think' },
    fire: { aim: 'fly', think: 'fly' },
    // A blast during settle (the rest of a volley) stays in settle.
    shellsLanded: { fly: 'settle', settle: 'settle' },
    roundWon: { settle: 'banner' },
    tankLost: { settle: 'banner' },
    matchWon: { settle: 'over' },
    matchLost: { settle: 'over' },
};
/** The phase `event` leads to from `phase`, or null when the move is illegal. */
export function transition(phase, event) {
    return FLOW[event]?.[phase] ?? null;
}
