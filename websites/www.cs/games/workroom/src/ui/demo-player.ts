// Plays the guide's built-in demos on the kit's audio context, inside the tap
// that asked for them (iOS starts sound only there). One demo sounds at a time:
// starting another, or calling stop(), fades the current one out within 30 ms.
import type { AudioCore } from '../../../_kit/audio/core.ts';
import { scheduleDemo } from '../demo.ts';
import type { DemoContext, DemoId, DemoRun } from '../demo.ts';

/** Seconds between the tap and the first tone, so the context has started. */
const LEAD = 0.02;

export interface DemoPlayer { (id: DemoId): void; stop(): void }

export function demoPlayer(core: AudioCore): DemoPlayer {
  let current: DemoRun | null = null;
  const stop = (): void => { current?.stop(); current = null; };
  const play = (id: DemoId): void => {
    stop();
    core.unlock();
    const ctx = core.context();
    if (!ctx) return;
    current = scheduleDemo(ctx as unknown as DemoContext, id, ctx.currentTime + LEAD);
  };
  return Object.assign(play, { stop });
}
