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

/** Where a match is. */
export type Phase = 'banner' | 'shop' | 'aim' | 'think' | 'fly' | 'settle' | 'over';

/** What happens to a match. */
export type FlowEvent =
  | 'matchStart'   // a new match begins (its first name card)
  | 'demo'         // attract mode begins
  | 'shopOpen'     // the name card is done and the shop opens
  | 'shopDone'     // the player leaves the shop for the next round
  | 'playerUp'     // the turn (or the round's first move) is the player's
  | 'foeUp'        // the turn (or the round's first move) is a drone's
  | 'fire'         // a gun is fired
  | 'shellsLanded' // a blast, or a shot that fizzled out
  | 'roundWon'     // the player's tank is the last unit standing
  | 'tankLost'     // the player's tank was wrecked and the drones fought on to one (or none); the shop opens
  | 'matchWon'
  | 'matchLost';

export const PHASES: readonly Phase[] = ['banner', 'shop', 'aim', 'think', 'fly', 'settle', 'over'];
export const EVENTS: readonly FlowEvent[] = [
  'matchStart', 'demo', 'shopOpen', 'shopDone', 'playerUp', 'foeUp', 'fire', 'shellsLanded',
  'roundWon', 'tankLost', 'matchWon', 'matchLost',
];

/** event -> phase it may happen in -> phase it leads to. A phase missing from
 * an event's row rejects that event. */
export const FLOW: Readonly<Record<FlowEvent, Readonly<Partial<Record<Phase, Phase>>>>> = {
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
export function transition(phase: Phase, event: FlowEvent): Phase | null {
  return FLOW[event]?.[phase] ?? null;
}

/** Once the player's tank is wrecked the drones fight on while the player
 * watches, at this multiple of normal speed (rooms.php ROOM_DRONE_SPEED and
 * src/replay.ts FAST_SPEED play the same 3 in a room). */
export const WATCH_SPEED = 3;

/** How many sim steps one frame runs: normal while the player's tank stands
 * (and in the demo, which has no player to wait for), WATCH_SPEED once it has
 * fallen. */
export function warSpeed(playerAlive: boolean, demo: boolean): number {
  return demo || playerAlive ? 1 : WATCH_SPEED;
}

/** Run one frame's war: `speed` sub-steps of `dt` each (so shells and aim
 * moves keep their step size rather than tunnelling), stopping early when a
 * step answers false because the phase left think/fly/settle. Returns the
 * steps run. `step` gets the sub-step's dt and its index. */
export function runWar(dt: number, speed: number, step: (dt: number, i: number) => boolean): number {
  let n = 0;
  for (let i = 0; i < speed; i++) {
    n++;
    if (!step(dt, i)) break;
  }
  return n;
}
