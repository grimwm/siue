// Save To Studio for vocal takes: each take on this device is made both ways for real, so its exact size as Perfect
// and as Good To The Ear shows beside what each would leave of the studio, in space and in minutes of singing. The
// person picks per take (the studio's setting picks first); nothing is sent until Save To Studio.
import { useEffect, useState } from 'preact/hooks';
import { humanBytes, leaves, QUALITY_LABELS, sizesFor } from '../../compose/vocalsave.ts';
import type { Encoded, Quality, TakeSizes } from '../../compose/vocalsave.ts';
import type { OpusFile } from '../../compose/opus.ts';
import { Button } from '../console/Button.tsx';
import { Panel } from '../console/Panel.tsx';

export interface TakeToSave { id: string; name: string; pcm: Int16Array; rate: number }

export interface SaveTakesProps {
  takes: readonly TakeToSave[];
  room: number;
  quality: Quality;
  opus(pcm: Int16Array, rate: number): Promise<OpusFile | null>;
  onCancel(): void;
  onSave(chosen: Map<string, { enc: Encoded; seconds: number }>): void;
}

export function SaveTakes(p: SaveTakesProps) {
  const [sizes, setSizes] = useState<Map<string, TakeSizes> | null>(null);
  const [pick, setPick] = useState<Map<string, Quality>>(new Map());
  const [failed, setFailed] = useState('');
  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const out = new Map<string, TakeSizes>();
        for (const t of p.takes) out.set(t.id, await sizesFor(t.pcm, t.rate, { opus: p.opus }));
        if (!live) return;
        setSizes(out);
        setPick(new Map(p.takes.map(t => [t.id, p.quality === 'ear' && out.get(t.id)!.ear ? 'ear' : 'perfect'])));
      } catch (e) {
        if (live) setFailed(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { live = false; };
  }, []);

  const enc = (id: string, q: Quality): Encoded | null => (q === 'ear' ? sizes?.get(id)?.ear ?? null : sizes?.get(id)?.perfect ?? null);
  const total = sizes ? p.takes.reduce((n, t) => n + (enc(t.id, pick.get(t.id) ?? 'perfect')?.bytes.length ?? 0), 0) : 0;
  const fits = total <= p.room;

  return (
    <Panel title="Save To Studio">
      <div class="grid gap-3" data-save-takes="">
        <p class="text-sm">These takes are only on this device. Choose how to keep each one in your studio. Perfect keeps every detail; Good To The Ear sounds the same for a voice and takes much less room.</p>
        {failed ? <p class="text-sm text-record">The sizes could not be worked out: {failed}</p> : null}
        {!sizes && !failed ? <p data-sizing="" class="text-sm text-dim">Working out the sizes…</p> : null}
        {sizes ? p.takes.map(t => {
          const s = sizes.get(t.id)!;
          const row = (q: Quality) => {
            const e = q === 'ear' ? s.ear : s.perfect;
            if (!e) return <p class="text-sm text-dim">This browser cannot make Good To The Ear, so this take is kept Perfect.</p>;
            const left = leaves(p.room, e, s.seconds);
            return (
              <label data-choice={q} class="flex flex-wrap items-center gap-2 text-sm">
                <input type="radio" name={`q-${t.id}`} checked={pick.get(t.id) === q} onChange={() => setPick(new Map(pick).set(t.id, q))} />
                <span class="font-semibold">{QUALITY_LABELS[q]}</span>
                <span data-size="" class="font-mono">{humanBytes(e.bytes.length)}</span>
                <span class="text-dim">{left.bytes >= 0 ? `leaves ${humanBytes(left.bytes)}, about ${left.minutes} more minutes at this quality` : `needs ${humanBytes(-left.bytes)} more room than your studio has`}</span>
              </label>
            );
          };
          return (
            <div data-save-take={t.id} class="grid gap-1 rounded-md border border-rule p-3">
              <p class="font-semibold">{t.name} <span class="font-mono text-xs text-dim">{Math.round(s.seconds * 10) / 10} s</span></p>
              {row('perfect')}{row('ear')}
            </div>
          );
        }) : null}
        {sizes ? <p data-save-total="" class={fits ? 'text-sm' : 'text-sm text-record'}>{fits ? `All together: ${humanBytes(total)} of the ${humanBytes(p.room)} your studio has left.` : `All together these need ${humanBytes(total)}, but your studio has ${humanBytes(p.room)} left. Choose Good To The Ear, trim a take, or delete drafts in Your studio.`}</p> : null}
        <div class="flex flex-wrap gap-2">
          <Button variant="primary" disabled={!sizes || !fits} onClick={() => p.onSave(new Map(p.takes.map(t => { const q = pick.get(t.id) ?? 'perfect'; return [t.id, { enc: enc(t.id, q)!, seconds: sizes!.get(t.id)!.seconds }]; })))}>Save To Studio</Button>
          <Button variant="ghost" onClick={p.onCancel}>Not Now</Button>
        </div>
      </div>
    </Panel>
  );
}
