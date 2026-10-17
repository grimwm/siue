// The story timeline: the energy curve, the sections, one row per lane with
// its motif ribbons, and the time axis, all on the shared view.
import type { ComponentChildren } from 'preact';
import { layoutTimeline, TIMELINE } from '../timeline.ts';
import { splitTerms } from '../glossary.ts';
import { axisTicks } from '../axis.ts';
import type { Score } from '../score.ts';
import type { TempoMap } from '../tempo.ts';
import { boundsFor } from '../zoom.ts';
import type { View } from '../zoom.ts';
import { useSurface } from './surface.ts';
import { AXIS_H, Axis, Playhead } from './parts.tsx';

export interface TimelineProps { score: Score; tempo: TempoMap; view: View; time: number; onSeek(t: number): void; onView(v: View): void; onTerm(id: string): void; onHold?(held: boolean): void; overlay?: ComponentChildren }

/** A section's name as SVG text: plain runs are tspans, glossary words are tspans that open their card (a button cannot live inside an svg). */
function SectionName(p: { name: string; onTerm(id: string): void }) {
  return (
    <>
      {splitTerms(p.name).map(part => 'term' in part
        ? (
          <tspan
            class="word" data-term={part.term.id} role="button" tabindex={0}
            onPointerDown={e => e.stopPropagation()}
            onClick={() => p.onTerm(part.term.id)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.onTerm(part.term.id); } }}
          >{part.text}</tspan>
        )
        : <tspan>{part.text}</tspan>)}
    </>
  );
}

export function Timeline(p: TimelineProps) {
  const { score, tempo, view } = p;
  const layout = layoutTimeline(score, tempo, view);
  const surface = useSurface({ view, bounds: boundsFor(score.duration, view.width), duration: score.duration, onSeek: p.onSeek, onView: p.onView, onHold: p.onHold });
  const height = layout.height + AXIS_H;
  return (
    <svg class="tl" data-timeline="" width={view.width} height={height} viewBox={`0 0 ${view.width} ${height}`} role="img" aria-label="Story timeline" {...surface}>
      <polyline class="energy" fill="none" points={layout.energy.points.map(([x, y]) => `${x},${y}`).join(' ')} />
      {layout.sections.map(s => (
        <svg x={s.rect.x} y={s.rect.y} width={Math.max(0, s.rect.w)} height={s.rect.h}>
          <rect class="section" data-section={s.id} width={Math.max(0, s.rect.w)} height={s.rect.h} fill={s.color} />
          <text class="section-name" x={6} y={TIMELINE.sectionH - 10}><SectionName name={s.name} onTerm={p.onTerm} /></text>
        </svg>
      ))}
      {layout.lanes.map(l => (
        <g>
          <rect class="lane" data-lane={l.id} x={l.rect.x} y={l.rect.y} width={l.rect.w} height={l.rect.h} />
          <text class="lane-name" x={6} y={l.rect.y + 16} fill={l.color}>{l.name}</text>
        </g>
      ))}
      {layout.ribbons.map(r => <rect class="ribbon" data-motif={r.motif} data-character={r.character} x={r.rect.x} y={r.rect.y} width={Math.max(0, r.rect.w)} height={r.rect.h} fill={r.color} />)}
      {p.overlay}
      <Axis ticks={axisTicks(score, tempo, view)} height={layout.height} />
      <Playhead view={view} time={p.time} height={layout.height} />
    </svg>
  );
}
