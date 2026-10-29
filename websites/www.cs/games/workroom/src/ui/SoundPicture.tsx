// The sound picture: the spectrogram stretched by the view, with the time axis
// across and the frequency words down the side. A draft played from its score
// has no spectrogram file: its picture is drawn from the sound built in the
// page, over the score's spectrogram range or 20 Hz to 12 kHz, once the sound
// is ready.
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { axisTicks } from '../axis.ts';
import type { DraftSound } from '../render/sound.ts';
import { SPECTRUM_RANGE, spectrum } from '../render/spectrum.ts';
import type { Picture, SpectrumSize } from '../render/spectrum.ts';
import { PICTURE_H, spectroAxis } from '../spectro.ts';
import { tempoMap } from '../tempo.ts';
import type { Score, Spectrogram } from '../score.ts';
import { boundsFor } from '../zoom.ts';
import type { View } from '../zoom.ts';
import { useSurface } from './surface.ts';
import { AXIS_H, Axis, Playhead } from './parts.tsx';

/** rendered is the sound built for a draft played from its score: the picture is drawn from it rather than read from imageSrc. */
export interface SoundPictureProps { score: Score; view: View; time: number; imageSrc: string; rendered?: DraftSound; onSeek(t: number): void; onView(v: View): void; onHold?(held: boolean): void }

/** Columns of the drawn picture per second of sound, and at most this many in all; the view stretches them. */
const COLUMNS_PER_SEC = 40;
const MAX_COLUMNS = 2048;

/** The pictures already drawn, by the audio they were drawn from, so coming back to the view does not draw again. */
const drawn = new WeakMap<readonly Float32Array[], { size: string; picture: Picture }>();
function pictureOf(channels: readonly Float32Array[], rate: number, size: SpectrumSize): Picture {
  const key = `${rate} ${size.width} ${size.height} ${size.low_hz} ${size.high_hz}`;
  const was = drawn.get(channels);
  if (was?.size === key) return was.picture;
  const picture = spectrum(channels, rate, size);
  drawn.set(channels, { size: key, picture });
  return picture;
}

const ALT = 'Spectrogram: time across, pitch up, brighter is louder';
const PICTURE_CLASS = 'pointer-events-none absolute top-0 max-w-none [image-rendering:pixelated]';

export function SoundPicture(p: SoundPictureProps) {
  const { score, view, rendered } = p;
  const surface = useSurface({ view, bounds: boundsFor(score.duration, view.width), duration: score.duration, onSeek: p.onSeek, onView: p.onView, onHold: p.onHold });
  const height = PICTURE_H + AXIS_H;
  const range: Spectrogram | undefined = rendered ? { file: 'spectrogram.png', scale: 'log', ...SPECTRUM_RANGE, ...(score.spectrogram ? { low_hz: score.spectrogram.low_hz, high_hz: score.spectrogram.high_hz } : {}) } : score.spectrogram;
  const ready = rendered?.state === 'ready' ? rendered : null;
  const picture = useMemo(() => ready && range
    ? pictureOf(ready.channels, ready.rate, { width: Math.max(1, Math.min(MAX_COLUMNS, Math.round(score.duration * COLUMNS_PER_SEC))), height: PICTURE_H, low_hz: range.low_hz, high_hz: range.high_hz })
    : null, [ready?.channels, ready?.rate, score.duration, range?.low_hz, range?.high_hz]);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (picture) canvas.current?.getContext('2d')?.putImageData(new ImageData(picture.data, picture.width, picture.height), 0, 0);
  }, [picture]);
  if (!range) return null; // a renderable score may have no picture
  const place = { left: `${-view.start * view.pxPerSec}px`, width: `${score.duration * view.pxPerSec}px`, height: `${PICTURE_H}px` };
  return (
    <div class="sound-picture">
      <div class="picture relative block max-w-full touch-none select-none overflow-hidden" data-picture="" style={{ width: `${view.width}px`, height: `${height}px` }} {...surface}>
        {!rendered ? <img data-spectrogram="" alt={ALT} src={p.imageSrc} draggable={false} class={PICTURE_CLASS} style={place} /> : null}
        {picture ? <canvas ref={canvas} data-spectrogram="" role="img" aria-label={ALT} width={picture.width} height={picture.height} class={PICTURE_CLASS} style={place} /> : null}
        {rendered?.state === 'building' ? <p class="absolute top-0 left-0 w-full p-3 text-center text-sm text-dim" role="status">Building the sound…</p> : null}
        {rendered?.state === 'failed' ? <p class="error absolute top-0 left-0 w-full p-3 text-center" role="alert">The sound could not be built: {rendered.reason}</p> : null}
        <svg class="picture-marks pointer-events-none absolute top-0 left-0" width={view.width} height={height} viewBox={`0 0 ${view.width} ${height}`} aria-hidden="true">
          {spectroAxis(range, PICTURE_H).map(a => <text class="freq fill-ink stroke-well font-mono text-[11px] [paint-order:stroke] [stroke-width:3px]" data-freq={a.text} x={4} y={Math.min(PICTURE_H - 4, Math.max(12, a.y))}>{a.text}</text>)}
          <Axis ticks={axisTicks(score, tempoMap(score), view)} height={PICTURE_H} />
          <Playhead view={view} time={p.time} height={PICTURE_H} />
        </svg>
      </div>
    </div>
  );
}
