// The sound picture: the spectrogram stretched by the view, with the time axis
// across, the frequency words down the side and what brightness means.
import { axisTicks } from '../axis.ts';
import { BRIGHTNESS_LEGEND, spectroAxis } from '../spectro.ts';
import { tempoMap } from '../tempo.ts';
import type { Score } from '../score.ts';
import { boundsFor } from '../zoom.ts';
import type { View } from '../zoom.ts';
import { useSurface } from './surface.ts';
import { AXIS_H, Axis, Playhead } from './parts.tsx';

export const PICTURE_HEIGHT = 200;

export interface SoundPictureProps { score: Score; view: View; time: number; imageSrc: string; onSeek(t: number): void; onView(v: View): void }

export function SoundPicture(p: SoundPictureProps) {
  const { score, view } = p;
  const surface = useSurface({ view, bounds: boundsFor(score.duration, view.width), duration: score.duration, onSeek: p.onSeek, onView: p.onView });
  const height = PICTURE_HEIGHT + AXIS_H;
  return (
    <div class="sound-picture">
      <div class="picture" data-picture="" style={{ width: `${view.width}px`, height: `${PICTURE_HEIGHT}px` }} {...surface}>
        <img data-spectrogram="" alt="Spectrogram: time across, pitch up, brighter is louder" src={p.imageSrc} draggable={false}
          style={{ left: `${-view.start * view.pxPerSec}px`, width: `${score.duration * view.pxPerSec}px`, height: `${PICTURE_HEIGHT}px` }} />
        <svg class="picture-marks" width={view.width} height={height} viewBox={`0 0 ${view.width} ${height}`} aria-hidden="true">
          {spectroAxis(score.spectrogram, PICTURE_HEIGHT).map(a => <text class="freq" data-freq={a.text} x={4} y={Math.min(PICTURE_HEIGHT - 4, Math.max(12, a.y))}>{a.text}</text>)}
          <Axis ticks={axisTicks(score, tempoMap(score), view)} height={PICTURE_HEIGHT} />
          <Playhead view={view} time={p.time} height={PICTURE_HEIGHT} />
        </svg>
      </div>
      <p class="legend">{BRIGHTNESS_LEGEND[0]} · {BRIGHTNESS_LEGEND[1]}</p>
    </div>
  );
}
