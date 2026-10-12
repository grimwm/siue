/* The bookkeeping a shell in flight carries for the effects engine's trail.
 * Types only and DOM-free, so the replay can hold it without the engine's types. */

/** Per-shell trail bookkeeping (FxSys.newTrail). */
export interface TrailState { has: boolean; px: number; py: number; acc: number[] }

/** Anything that can carry the trail state of a shell in flight. */
export interface TrailCarrier { fx?: TrailState | null; fxs?: TrailState | null }
