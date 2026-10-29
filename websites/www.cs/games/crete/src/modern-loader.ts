/* Loads the modern look's bundle (dist/modern.js, three.js and the 3D board) on demand. Resolves to null, never
 * throws, when the browser has no WebGL or the bundle fails to load: the caller falls back to the classic look. */
type Modern = typeof import('./modern/entry.ts');

declare const MODERN_V: string; // the modern bundle's content hash, injected by the build

/** True when `make()` yields a canvas that can create a WebGL2 or WebGL context. */
export function webglAvailable(make: () => { getContext(kind: string): unknown }): boolean {
  try {
    const c = make();
    return (c.getContext('webgl2') ?? c.getContext('webgl')) != null;
  } catch {
    return false;
  }
}

let loading: Promise<Modern | null> | null = null;

export function loadModern(): Promise<Modern | null> {
  loading ??= (async () => {
    if (!webglAvailable(() => document.createElement('canvas'))) return null;
    try {
      // A non-literal URL keeps the bundler from inlining the bundle into main.js.
      const url = new URL(`dist/modern.js?v=${MODERN_V}`, document.baseURI).href;
      return (await import(/* @vite-ignore */ url)) as Modern;
    } catch {
      return null;
    }
  })();
  return loading;
}
