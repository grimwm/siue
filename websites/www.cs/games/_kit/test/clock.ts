// A manual clock for engine tests: timers fire only when advance() passes them.
import type { Clock, Timers } from '../ports.ts';

export function manualClock(): { timers: Timers; clock: Clock; advance(ms: number): void; pending(): number } {
  let now = 0;
  let nextId = 1;
  const queue = new Map<number, { at: number; every: number; fn: () => void }>();
  const add = (fn: () => void, ms: number, every: number): number => {
    queue.set(nextId, { at: now + ms, every, fn });
    return nextId++;
  };
  return {
    timers: {
      setTimeout: (fn, ms) => add(fn, ms, 0),
      clearTimeout: id => { queue.delete(id); },
      setInterval: (fn, ms) => add(fn, ms, ms),
      clearInterval: id => { queue.delete(id); },
    },
    clock: { now: () => now },
    advance(ms) {
      const end = now + ms;
      for (;;) {
        let due: [number, { at: number; every: number; fn: () => void }] | undefined;
        for (const entry of queue) if (entry[1].at <= end && (!due || entry[1].at < due[1].at)) due = entry;
        if (!due) break;
        const [id, t] = due;
        now = t.at;
        if (t.every) t.at += t.every; else queue.delete(id);
        t.fn();
      }
      now = end;
    },
    pending: () => queue.size,
  };
}
