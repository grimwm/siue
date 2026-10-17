// The sound picture: the spectrogram stretched by the view, with the time axis
// across and the frequency words down the side.
import { axisTicks } from '../axis.ts';
import { PICTURE_H, spectroAxis } from '../spectro.ts';
import { tempoMap } from '../tempo.ts';
import type { Score } from '../score.ts';
import { boundsFor } from '../zoom.ts';
import type { View } from '../zoom.ts';
import { useSurface } from './surface.ts';
import { AXIS_H, Axis, Playhead } from './parts.tsx';

export interface SoundPictureProps { score: Score; view: View; time: number; imageSrc: string; onSeek(t: number): void; onView(v: View): void; onHold?(held: boolean): void }

export function SoundPicture(p: SoundPictureProps) {
  const { score, view } = p;
  const surface = useSurface({ view, bounds: boundsFor(score.duration, view.width), duration: score.duration, onSeek: p.onSeek, onView: p.onView, onHold: p.onHold });
  const height = PICTURE_H + AXIS_H;
  return (
    <div class="sound-picture">
      <div class="picture relative block max-w-full touch-none select-none overflow-hidden" data-picture="" style={{ width: `${view.width}px`, height: `${height}px` }} {...surface}>
        <img data-spectrogram="" alt="Spectrogram: time across, pitch up, brighter is louder" src={p.imageSrc} draggable={false}
          class="pointer-events-none absolute top-0 max-w-none [image-rendering:pixelated]"
          style={{ left: `${-view.start * view.pxPerSec}px`, width: `${score.duration * view.pxPerSec}px`, height: `${PICTURE_H}px` }} />
        <svg class="picture-marks pointer-events-none absolute top-0 left-0" width={view.width} height={height} viewBox={`0 0 ${view.width} ${height}`} aria-hidden="true">
          {spectroAxis(score.spectrogram, PICTURE_H).map(a => <text class="freq fill-ink stroke-well font-mono text-[11px] [paint-order:stroke] [stroke-width:3px]" data-freq={a.text} x={4} y={Math.min(PICTURE_H - 4, Math.max(12, a.y))}>{a.text}</text>)}
          <Axis ticks={axisTicks(score, tempoMap(score), view)} height={PICTURE_H} />
          <Playhead view={view} time={p.time} height={PICTURE_H} />
        </svg>
      </div>
    </div>
  );
}
