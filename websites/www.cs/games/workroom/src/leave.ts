// Leaving the page (another draft, a link, a reload, closing the tab) asks
// first while something the owner made would be lost: words typed but not
// sent, a recording running or kept but not stored, or a note this browser
// could keep only in this page view's memory.

export interface Unsaved { draft: string; recording: boolean; held: boolean; memoryOnly: boolean }

export function unsavedWork(u: Unsaved): boolean {
  return u.draft.trim() !== '' || u.recording || u.held || u.memoryOnly;
}

/** What the guard needs of a beforeunload event: asking the browser to confirm. */
export interface LeaveEvent { preventDefault(): void; returnValue: unknown }
export interface LeaveTarget {
  addEventListener(type: 'beforeunload', f: (e: LeaveEvent) => void): void;
  removeEventListener(type: 'beforeunload', f: (e: LeaveEvent) => void): void;
}

/** Makes the browser ask before the page goes while `unsaved()` is true; returns the call that removes the guard. */
export function guardLeaving(target: LeaveTarget, unsaved: () => boolean): () => void {
  const ask = (e: LeaveEvent): void => {
    if (!unsaved()) return;
    e.preventDefault();
    e.returnValue = ''; // the older browsers' way to ask
  };
  target.addEventListener('beforeunload', ask);
  return () => target.removeEventListener('beforeunload', ask);
}
