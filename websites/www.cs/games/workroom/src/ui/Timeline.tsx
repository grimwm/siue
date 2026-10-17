// The story timeline: the energy as a glow behind everything, the sections,
// one row per lane with its dimmed notes, each character's tune as a
// constellation of stars over its lane, and the time axis, all on the shared view.
import type { ComponentChildren } from 'preact';
import { useMemo } from 'preact/hooks';
import { readableOn } from '../color.ts';
import { layoutTimeline, TIMELINE } from '../timeline.ts';
import { layoutConstellations, STAR_R } from '../constellation.ts';
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

let glowCount = 0;

/** "<Name>'s tune: 3 notes, rising", from the first star against the last. */
function tuneLabel(name: string, ys: number[]): string {
  const first = ys[0];
  const last = ys[ys.length - 1];
  const shape = first === undefined || last === undefined || first === last ? 'level' : last < first ? 'rising' : 'falling';
  return `${name}'s tune: ${ys.length} ${ys.length === 1 ? 'note' : 'notes'}, ${shape}`;
}

export function Timeline(p: TimelineProps) {
  const { score, tempo, view } = p;
  const layout = layoutTimeline(score, tempo, view);
  const stars = layoutConstellations(score, layout, view);
  const surface = useSurface({ view, bounds: boundsFor(score.duration, view.width), duration: score.duration, onSeek: p.onSeek, onView: p.onView, onHold: p.onHold });
  const theme = useTheme();
  // Readable colours depend on the theme and the score's own colours, not on the view, so panning and zooming reuse them.
  const marks = useMemo(() => {
    const of = (list: { id: string; color: string }[]) => new Map(list.map(x => [x.id, { mark: readableOn(theme, x.color, 'mark'), text: readableOn(theme, x.color, 'text') }]));
    return { section: of(score.sections), lane: of(score.lanes), color: new Map(score.characters.map(c => [c.color, { mark: readableOn(theme, c.color, 'mark'), text: readableOn(theme, c.color, 'text') }])) };
  }, [theme, score]);
  const glowId = useMemo(() => `tl-glow-${++glowCount}`, []);
  const height = layout.height + AXIS_H;
  return (
    <svg class="tl block max-w-full touch-none select-none" data-timeline="" width={view.width} height={height} viewBox={`0 0 ${view.width} ${height}`} role="group" aria-label="Story timeline" {...surface}>
      <defs><filter id={glowId} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="8" /></filter></defs>
      <polygon class="pointer-events-none fill-go opacity-25" data-glow="" aria-hidden="true" filter={`url(#${glowId})`} points={layout.glow.map(([x, y]) => `${x},${y}`).join(' ')} />
      {layout.sections.map(s => (
        <svg x={s.rect.x} y={s.rect.y} width={Math.max(0, s.rect.w)} height={s.rect.h}>
          <rect class="section opacity-40" data-section={s.id} width={Math.max(0, s.rect.w)} height={s.rect.h} fill={marks.section.get(s.id)?.mark} />
          <text class="section-name pointer-events-none fill-ink font-display text-[12px] font-semibold tracking-wider uppercase" x={6} y={TIMELINE.sectionH - 10}><SectionName name={s.name} onTerm={p.onTerm} /></text>
        </svg>
      ))}
      {layout.lanes.map(l => (
        <g>
          <rect class="lane fill-lane/80 stroke-rule" data-lane={l.id} x={l.rect.x} y={l.rect.y} width={l.rect.w} height={l.rect.h} />
          <LaneIcon family={l.icon} color={marks.lane.get(l.id)?.mark ?? 'currentColor'} x={6} y={l.rect.y + 4} />
          <text class="lane-name pointer-events-none font-display text-[11px] font-semibold tracking-wider uppercase" x={8 + LANE_ICON_SIZE + 4} y={l.rect.y + 15} fill={marks.lane.get(l.id)?.text}>{l.name}</text>
        </g>
      ))}
      {layout.notes.map(n => <rect class="pointer-events-none opacity-35" data-lane-note={n.index} x={n.rect.x} y={n.rect.y} width={Math.max(1, n.rect.w)} height={n.rect.h} rx={1} fill={marks.lane.get(n.lane)?.mark} />)}
      {stars.map(c => {
        const mark = marks.color.get(c.color)?.mark ?? c.color;
        const text = marks.color.get(c.color)?.text ?? c.color;
        const first = c.stars[0];
        return (
          <g class="pointer-events-none" data-motif={c.motif} data-character={c.character} role="img" aria-label={tuneLabel(c.name, c.stars.map(s => s.y))}>
            {c.ribbon ? <rect data-ribbon="" x={c.ribbon.x} y={c.ribbon.y} width={Math.max(0, c.ribbon.w)} height={c.ribbon.h} fill={mark} /> : null}
            {c.stars.length > 1 ? <polyline data-constellation-line="" aria-hidden="true" fill="none" stroke={mark} stroke-width={1.5} stroke-opacity={0.85} stroke-linejoin="round" points={c.stars.map(s => `${s.x},${s.y}`).join(' ')} /> : null}
            {c.stars.map(s => <circle data-star={s.note} aria-hidden="true" cx={s.x} cy={s.y} r={STAR_R[s.size]} fill={mark} />)}
            {first ? <text data-character-name="" class="font-display text-[11px] font-semibold tracking-wider uppercase" x={first.x + 7} y={Math.max(first.y - 6, layout.lanes[0]?.rect.y ?? 0) + 2} fill={text}>{c.name}</text> : null}
          </g>
        );
      })}
      {p.overlay}
      <Axis ticks={axisTicks(score, tempo, view)} height={layout.height} />
      <Playhead view={view} time={p.time} height={layout.height} />
    </svg>
  );
}
