// The audio: one Play/Pause button, the time, the bar on a music piece, and
// the playhead's time kept in step with the <audio> element in both directions.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { formatSeconds } from '../axis.ts';
import { clipDone, pickSource } from '../player.ts';
import type { Clip } from '../player.ts';
import type { AudioSource } from '../score.ts';

export interface PlayerProps { src: AudioSource[]; audioSrc(file: string): string; time: number; bar: number | null; onTime(t: number): void; clip: Clip | null; onClipDone(): void }

/** A time that differs from the audio's by more than this is a seek from outside, not the audio's own progress. */
const SEEK_EPS = 0.25;

export function Player(p: PlayerProps) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const source = useMemo(() => {
    const probe = document.createElement('audio');
    return pickSource(p.src, t => probe.canPlayType(t));
  }, [p.src]);
  const live = useRef(p);
  live.current = p;

  // A seek from a view moves the audio.
  useEffect(() => {
    const a = audio.current;
    if (a && Math.abs(a.currentTime - p.time) > SEEK_EPS) a.currentTime = p.time;
  }, [p.time]);

  // Hear it: play the clip from its start.
  useEffect(() => {
    const a = audio.current;
    if (!a || !p.clip) return;
    a.currentTime = p.clip.from;
    void a.play().catch(() => {});
  }, [p.clip]);

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
    if (a.paused) void a.play().catch(() => {}); else a.pause();
  };
  return (
    <div class="player">
      {source ? (
        <audio ref={audio} preload="metadata" src={p.audioSrc(source.file)}
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
          onTimeUpdate={() => { if (audio.current) p.onTime(audio.current.currentTime); }} />
      ) : <p class="error" role="alert">This browser cannot play this draft's audio.</p>}
      <button type="button" class="play" disabled={!source} onClick={toggle}>{playing ? 'Pause' : 'Play'}</button>
      <span class="clock" data-clock="">{formatSeconds(p.time)}</span>
      {p.bar !== null ? <span class="bar" data-bar="">bar {p.bar}</span> : null}
    </div>
  );
}
