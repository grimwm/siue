// The ports an engine takes instead of reaching for the page: the page wires
// the browser adapters (ports.browser.ts), tests wire fakes (test/).
export interface Timers {
  setTimeout(fn: () => void, ms: number): number;
  clearTimeout(id: number): void;
  setInterval(fn: () => void, ms: number): number;
  clearInterval(id: number): void;
}
export interface Clock { now(): number }
export type Rng = () => number;
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
