// The story timeline: the energy curve, the sections, one row per lane with
// its motif ribbons, and the time axis, all on the shared view.
import type { ComponentChildren } from 'preact';
import { readableOn } from '../color.ts';
import { layoutTimeline, TIMELINE } from '../timeline.ts';
import { splitTerms } from '../glossary.ts';
import { axisTicks } from '../axis.ts';
import type { Score } from '../score.ts';
import type { TempoMap } from '../tempo.ts';
import { boundsFor } from '../zoom.ts';
import type { View } from '../zoom.ts';
import { useSurface } from './surface.ts';
import { useTheme } from './theme-context.ts';
import { AXIS_H, Axis, LANE_ICON_SIZE, LaneIcon, Playhead } from './parts.tsx';

export interface TimelineProps { score: Score; tempo: TempoMap; view: View; time: number; onSeek(t: number): void; onView(v: View): void; onTerm(id: string): void; onHold?(held: boolean): void; overlay?: ComponentChildren }

/** A section's name as SVG text: plain runs are tspans, glossary words are tspans that open their card (a button cannot live inside an svg). */
function SectionName(p: { name: string; onTerm(id: string): void }) {
  return (
    <>
      {splitTerms(p.name).map(part => 'term' in part
        ? (
          <tspan
            class="word pointer-events-auto cursor-pointer fill-amber underline" data-term={part.term.id} role="button" tabindex={0}
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
  const theme = useTheme();
  const height = layout.height + AXIS_H;
  return (
    <svg class="tl block max-w-full touch-none select-none" data-timeline="" width={view.width} height={height} viewBox={`0 0 ${view.width} ${height}`} role="group" aria-label="Story timeline" {...surface}>
      <polyline class="energy stroke-ink" stroke-width={1.5} fill="none" points={layout.energy.points.map(([x, y]) => `${x},${y}`).join(' ')} />
      {layout.sections.map(s => (
        <svg x={s.rect.x} y={s.rect.y} width={Math.max(0, s.rect.w)} height={s.rect.h}>
          <rect class="section" data-section={s.id} width={Math.max(0, s.rect.w)} height={s.rect.h} fill={readableOn(theme, s.color, 'mark')} opacity={0.35} />
          <text class="section-name pointer-events-none fill-ink text-[13px]" x={6} y={TIMELINE.sectionH - 10}><SectionName name={s.name} onTerm={p.onTerm} /></text>
        </svg>
      ))}
      {layout.lanes.map(l => (
        <g>
          <rect class="lane fill-lane stroke-rule" data-lane={l.id} x={l.rect.x} y={l.rect.y} width={l.rect.w} height={l.rect.h} />
          <LaneIcon family={l.icon} color={readableOn(theme, l.color, 'text')} x={6} y={l.rect.y + 4} />
          <text class="lane-name pointer-events-none text-xs" x={8 + LANE_ICON_SIZE + 4} y={l.rect.y + 16} fill={readableOn(theme, l.color, 'text')}>{l.name}</text>
        </g>
      ))}
      {layout.ribbons.map(r => <rect class="ribbon" opacity={0.9} data-motif={r.motif} data-character={r.character} x={r.rect.x} y={r.rect.y} width={Math.max(0, r.rect.w)} height={r.rect.h} fill={readableOn(theme, r.color, 'mark')} />)}
      {p.overlay}
      <Axis ticks={axisTicks(score, tempo, view)} height={layout.height} />
      <Playhead view={view} time={p.time} height={layout.height} />
    </svg>
  );
}
