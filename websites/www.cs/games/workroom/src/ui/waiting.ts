// The pieces list's "N waiting" counts, written into the server-rendered rows
// (music/lib/Pages.php: <a data-waiting="<piece>">…</a><span class="waiting-count">)
// once the notes are unlocked: the server cannot know a sealed note's piece.
export function showWaiting(list: ParentNode, counts: ReadonlyMap<string, number>): void {
  for (const a of Array.from(list.querySelectorAll('a'))) {
    const piece = a.getAttribute('data-waiting');
    const next = a.nextSibling as (Node & { className?: string }) | null;
    if (piece === null || !next || next.nodeType !== 1 || !String(next.className ?? '').split(' ').includes('waiting-count')) continue;
    const n = counts.get(piece) ?? 0;
    next.textContent = n === 0 ? '' : `${n} waiting`;
  }
}
