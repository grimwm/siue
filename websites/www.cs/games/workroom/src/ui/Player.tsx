// The audio: one Play/Pause button, the time, the bar on a music piece, and
// the playhead's time kept in step with the <audio> element in both directions.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { formatSeconds } from '../axis.ts';
import { clipDone, pickSource } from '../player.ts';
import type { Clip } from '../player.ts';
import type { AudioSource } from '../score.ts';

export interface PlayerProps { src: AudioSource[]; audioSrc(file: string): string; time: number; bar: number | null; onTime(t: number): void; clip: Clip | null; onClipDone(): void; seekRef?: { current: ((t: number) => void) | null }; clipRef?: { current: ((c: Clip) => void) | null }; onPlaying?(playing: boolean): void }

export function Player(p: PlayerProps) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const source = useMemo(() => {
    const probe = document.createElement('audio');
    return pickSource(p.src, t => probe.canPlayType(t));
  }, [p.src]);
  const live = useRef(p);
  live.current = p;

  // A seek from a view writes the audio's position at once, so the next frame reports the new time and never the old one.
  useEffect(() => {
    const ref = p.seekRef;
    if (!ref) return;
    ref.current = t => { if (audio.current) audio.current.currentTime = t; };
    return () => { ref.current = null; };
  }, [p.seekRef]);

  // Starting the sound must happen inside the tap that asked for it (iOS refuses a later play()), so these run in the click handler itself.
  const start = (a: HTMLAudioElement): void => {
    setProblem(null);
    a.play().catch(() => setProblem('The sound did not start. Tap Play to start it.'));
  };
  // Hear it: play the clip from its start.
  useEffect(() => {
    const ref = p.clipRef;
    if (!ref) return;
    ref.current = c => {
      const a = audio.current;
      if (!a) return;
      a.currentTime = c.from;
      start(a);
    };
    return () => { ref.current = null; };
  }, [p.clipRef]);

  useEffect(() => { p.onPlaying?.(playing); }, [playing]);

  // While playing, the playhead follows the audio every frame; a clip stops at its end.
  useEffect(() => {
    const a = audio.current;
    if (!a || !playing) return;
    let frame = 0;
    const tick = (): void => {
      const { clip, onTime, onClipDone } = live.current;
      onTime(a.currentTime);
      if (clip && clipDone(a.currentTime, clip)) { a.pause(); onClipDone(); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const toggle = (): void => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) start(a); else a.pause();
  };
  return (
    <div class="player">
      {source ? (
        <audio ref={audio} preload="metadata" src={p.audioSrc(source.file)}
          onError={() => setProblem("This draft's audio could not play. Reload the page, or open another draft.")}
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
          onTimeUpdate={() => { if (audio.current) p.onTime(audio.current.currentTime); }} />
      ) : <p class="error" role="alert">This browser cannot play this draft's audio.</p>}
      {problem ? <p class="error" role="alert">{problem}</p> : null}
      <button type="button" class="play" disabled={!source} onClick={toggle}>{playing ? 'Pause' : 'Play'}</button>
      <span class="clock" data-clock="">{formatSeconds(p.time)}</span>
      {p.bar !== null ? <span class="bar" data-bar="">bar {p.bar}</span> : null}
    </div>
  );
}
