/* A game follows its page's life: hidden, frozen or leaving, it goes quiet
 * (`hide`); visible again, it picks up (`show`); a page gone for good (a
 * pagehide that will not be restored from the back/forward cache) also
 * `close`s. `hide` and `show` may run more than once in a row. */

export interface PageTargets {
  doc: { visibilityState: string; addEventListener(type: string, fn: (e: unknown) => void): void };
  win: { addEventListener(type: string, fn: (e: unknown) => void): void };
}

export interface PageHooks {
  hide(): void;
  show(): void;
  close?(): void;
}

export function followPage(t: PageTargets, on: PageHooks): void {
  const show = (): void => { if (t.doc.visibilityState !== 'hidden') on.show(); };
  t.doc.addEventListener('visibilitychange', () => { if (t.doc.visibilityState === 'hidden') on.hide(); else show(); });
  t.doc.addEventListener('freeze', () => on.hide());
  t.doc.addEventListener('resume', show);
  t.win.addEventListener('pagehide', e => {
    on.hide();
    if ((e as { persisted?: boolean } | null)?.persisted === false) on.close?.();
  });
  t.win.addEventListener('pageshow', show);
  if (t.doc.visibilityState === 'hidden') on.hide();
}
