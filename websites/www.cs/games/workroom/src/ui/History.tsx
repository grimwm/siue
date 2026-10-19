
// The owner's notes: this piece's or all of them, newest first, each waiting or
// picked up, with its words, its recording, its shape or why it could not be
// opened, and Delete. Delete, Delete all and Discard each ask first, in words
// that name what goes; none is red (red is the colour of recording). Below, the
// notes not sent yet, with why, and Try again.
import { useEffect, useState } from 'preact/hooks';
import { KIND_LABELS, REACTION_LABELS, spanLabel } from '../answer.ts';
import type { HistoryItem } from '../history.ts';
import type { NoteBody } from '../note.ts';
import { KEPT_MESSAGES } from '../outbox.ts';
import type { Pending } from '../outbox.ts';
import { Button } from './console/Button.tsx';
import { Chip } from './console/Chip.tsx';
import { cx } from './console/cx.ts';

export interface HistoryProps {
  items: readonly HistoryItem[];
  total: number;
  scope: 'piece' | 'all';
  onScope(s: 'piece' | 'all'): void;
  version: number;
  laneName(id: string): string | null;
  numberOf(id: string): number | null;
  answers(id: string): string | null;
  kept: readonly Pending[];
  busy: boolean;
  onDelete(id: string): void;
  onDeleteAll(): void;
  onDiscard(key: string): void;
  onRetry(): void;
}

const SMALL_CAPS = 'font-display text-xs font-semibold tracking-widest text-dim uppercase';
const stamp = (d: Date): string => d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const arrivedAt = (seconds: number): string => stamp(new Date(seconds * 1000));

function NoteAudio(p: { bytes: Uint8Array<ArrayBuffer>; mime: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
    const u = URL.createObjectURL(new Blob([p.bytes], { type: p.mime }));
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [p.bytes, p.mime]);
  return url ? <audio data-note-audio="" controls preload="metadata" src={url} class="w-full" /> : null;
}

/** A small line of the drawn shape, left to right over the piece. */
function Shape(p: { curve: readonly [number, number][] }) {
  const end = p.curve[p.curve.length - 1]?.[0] || 1;
  return (
    <svg data-note-shape="" viewBox="0 0 100 24" preserveAspectRatio="none" class="h-6 w-full" role="img" aria-label={`An energy shape of ${p.curve.length} points`}>
      <polyline class="stroke-go" fill="none" stroke-width={1.5} vector-effect="non-scaling-stroke" points={p.curve.map(([t, v]) => `${(t / end) * 100},${24 - v * 24}`).join(' ')} />
    </svg>
  );
}

function Summary(p: { body: NoteBody; audio: Uint8Array<ArrayBuffer> | null; version: number; lane: string | null }) {
  const b = p.body;
  const head = b.kind === 'react' && b.reaction ? `${KIND_LABELS.react}: ${REACTION_LABELS[b.reaction]}` : KIND_LABELS[b.kind];
  const where = [b.kind === 'energy' ? 'The whole piece' : spanLabel(b), p.lane, b.draft !== p.version ? `draft ${b.draft}` : null].filter(Boolean).join(' · ');
  return (
    <>
      <p class="font-display text-sm font-semibold tracking-wider uppercase">{head}</p>
      <p class="font-mono text-xs text-dim">{where}</p>
      {b.text ? <p class="break-words whitespace-pre-wrap">{b.text}</p> : null}
      {p.audio && b.audio ? <NoteAudio bytes={p.audio} mime={b.audio.mime} /> : null}
      {b.curve ? <Shape curve={b.curve} /> : null}
    </>
  );
}

export function Kept(p: { kept: readonly Pending[]; busy: boolean; onDiscard(key: string): void; onRetry(): void }) {
  const [asking, setAsking] = useState<string | null>(null);
  if (p.kept.length === 0) return null;
  return (
    <div data-kept="" class="grid gap-2">
      <span class={SMALL_CAPS}>Not sent yet</span>
      <ul class="grid gap-2">
        {p.kept.map(k => (
          <li data-kept-note={k.key} class="grid gap-1 rounded-md border border-rule bg-well p-3">
            <span class="font-mono text-xs text-dim">Made {stamp(new Date(k.made))}</span>
            <p class="text-sm">{k.reason === 'new' ? 'Sending…' : KEPT_MESSAGES[k.reason]}</p>
            {asking === k.key ? (
              <div class="flex flex-wrap gap-2">
                <Button disabled={p.busy} onClick={() => { setAsking(null); p.onDiscard(k.key); }}>Discard this note</Button>
                <Button variant="ghost" onClick={() => setAsking(null)}>Keep it</Button>
              </div>
            ) : <div class="flex justify-end"><Button variant="ghost" disabled={p.busy} onClick={() => setAsking(k.key)}>Discard</Button></div>}
          </li>
        ))}
      </ul>
      <Button disabled={p.busy} onClick={p.onRetry}>Try again</Button>
    </div>
  );
}

const deleteAllQuestion = (n: number): string => (n === 1 ? 'Delete the one note? This cannot be undone.' : `Delete all ${n} notes, on every piece? This cannot be undone.`);
const deleteAllLabel = (n: number): string => (n === 1 ? 'Delete the one note' : `Delete all ${n} notes`);

export function History(p: HistoryProps) {
  const [asking, setAsking] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  return (
    <div data-history="" class="grid gap-3">
      <div class="flex flex-wrap gap-2" role="group" aria-label="Which notes">
        <Chip pressed={p.scope === 'piece'} onClick={() => p.onScope('piece')}>This piece</Chip>
        <Chip pressed={p.scope === 'all'} onClick={() => p.onScope('all')}>All pieces</Chip>
      </div>
      {p.items.length === 0 ? <p class="empty">{p.scope === 'piece' ? 'No notes on this piece yet.' : 'No notes yet.'}</p> : (
        <ol class="grid gap-3" aria-label="Notes">
          {p.items.map(i => {
            const n = p.numberOf(i.id);
            const answered = p.answers(i.id);
            return (
              <li data-note={i.id} class="grid gap-1 rounded-md border border-rule bg-well p-3">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="font-mono text-xs text-dim">{n !== null ? `#${n} · ` : ''}{arrivedAt(i.arrived)}</span>
                  <span data-state={i.state} class={cx('font-mono text-xs tracking-widest uppercase', i.state === 'waiting' ? 'text-amber' : 'text-go')}>{i.state === 'waiting' ? 'Waiting' : 'Picked up'}</span>
                </div>
                {i.opened
                  ? <Summary body={i.opened.body} audio={i.opened.audio} version={p.version} lane={i.opened.body.lane ? p.laneName(i.opened.body.lane) : null} />
                  : <p class="text-sm text-dim">{i.problem ?? 'Opening…'}</p>}
                {answered ? <p class="text-sm text-amber">{answered}</p> : null}
                {deleting === i.id ? (
                  <div role="group" aria-label={`Delete note from ${arrivedAt(i.arrived)}`} class="grid gap-2 rounded-md border border-amber p-3">
                    <p>Delete this note? This cannot be undone.</p>
                    <div class="flex flex-wrap gap-2">
                      <Button disabled={p.busy} onClick={() => { setDeleting(null); p.onDelete(i.id); }}>Delete it</Button>
                      <Button variant="ghost" onClick={() => setDeleting(null)}>Keep it</Button>
                    </div>
                  </div>
                ) : (
                  <div class="flex justify-end">
                    <Button variant="ghost" label={`Delete note from ${arrivedAt(i.arrived)}`} disabled={p.busy} onClick={() => setDeleting(i.id)}>Delete</Button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {p.total > 0 ? (asking ? (
        <div role="group" aria-label="Delete all notes" class="grid gap-2 rounded-md border border-amber p-3">
          <p>{deleteAllQuestion(p.total)}</p>
          <div class="flex flex-wrap gap-2">
            <Button disabled={p.busy} onClick={() => { setAsking(false); p.onDeleteAll(); }}>{deleteAllLabel(p.total)}</Button>
            <Button variant="ghost" onClick={() => setAsking(false)}>Keep them</Button>
          </div>
        </div>
      ) : <Button disabled={p.busy} onClick={() => setAsking(true)}>Delete all</Button>) : null}
      <Kept kept={p.kept} busy={p.busy} onDiscard={p.onDiscard} onRetry={p.onRetry} />
    </div>
  );
}
