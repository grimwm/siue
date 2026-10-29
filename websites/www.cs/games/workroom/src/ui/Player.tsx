// The audio: Play/Pause, five seconds back and ahead, the start and end
// of the track, Loop (on by default; a hear-it clip never loops), the time readout
// (and the bar on a music piece), the draft's downloads (the audio it plays,
// the sheet music, the score), and the playhead's time kept in step with the
// <audio> element in both directions. A draft played from its score plays the
// sound built in the page: while it is built the Player says so with a progress
// line, and a build that failed says why; either way nothing can play.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { downloadLinks } from '../download.ts';
import type { DownloadLink } from '../download.ts';
import { clipDone, pickSource, skipTarget } from '../player.ts';
import type { Clip, Skip } from '../player.ts';
import { BUILD_STAGES, STAGE_WORDS } from '../render/sound.ts';
import type { DraftSound } from '../render/sound.ts';
import type { AudioSource } from '../score.ts';
import { Button, buttonClass } from './console/Button.tsx';
import { Readout } from './console/Readout.tsx';

// The transport buttons' 16 px icons (paths in a 16-unit box) and accessible names.
const SKIPS: readonly { kind: Skip; label: string; icon: string }[] = [
  { kind: 'start', label: 'To the start', icon: 'M3 3v10M13 3 6 8l7 5Z' },
  { kind: 'back5', label: 'Back 5 seconds', icon: 'M8 3 2 8l6 5ZM14 3 8 8l6 5Z' },
  { kind: 'ahead5', label: 'Ahead 5 seconds', icon: 'M8 3l6 5-6 5ZM2 3l6 5-6 5Z' },
  { kind: 'end', label: 'To the end', icon: 'M13 3v10M3 3l7 5-7 5Z' },
];

/** duration is the piece's length in seconds; onSeek is the page's seek, which moves the audio, the playhead and the view together. download names the draft on screen (sheet: it has sheet music); without it, no downloads. rendered is the sound built for a draft played from its score, played in place of src. */
export interface PlayerProps { src: AudioSource[]; rendered?: DraftSound; duration: number; onSeek(t: number): void; audioSrc(file: string): string; time: number; bar: number | null; onTime(t: number): void; clip: Clip | null; onClipDone(): void; seekRef?: { current: ((t: number) => void) | null }; clipRef?: { current: ((c: Clip) => void) | null }; onPlaying?(playing: boolean): void; pauseRef?: { current: (() => void) | null }; download?: { piece: string; version: number; sheet: boolean } }

export function Player(p: PlayerProps) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [problem, setProblem] = useState<string | null>(null);
  const source = useMemo(() => {
    const probe = document.createElement('audio');
    return pickSource(p.src, t => probe.canPlayType(t));
  }, [p.src]);
  const rendered = p.rendered;
  const url = rendered ? (rendered.state === 'ready' ? rendered.url : null) : source ? p.audioSrc(source.file) : null;
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

  // A demo in the guide pauses the piece first.
  useEffect(() => {
    const ref = p.pauseRef;
    if (!ref) return;
    ref.current = () => { audio.current?.pause(); };
    return () => { ref.current = null; };
  }, [p.pauseRef]);

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
  const skip = (kind: Skip): void => p.onSeek(skipTarget(kind, audio.current?.currentTime ?? p.time, p.duration));
  return (
    <div class="player flex flex-wrap items-center gap-3 rounded-lg bg-panel p-3 ring-1 ring-rule">
      {url ? (
        <audio ref={audio} preload="metadata" loop={loop && !p.clip} src={url}
          onError={() => setProblem("This draft's audio could not play. Reload the page, or open another draft.")}
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
          onTimeUpdate={() => { if (audio.current) p.onTime(audio.current.currentTime); }} />
      ) : rendered ? <Building sound={rendered} /> : <p class="error w-full" role="alert">This browser cannot play this draft's audio.</p>}
      {problem ? <p class="error w-full" role="alert">{problem}</p> : null}
      <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Transport">
        {SKIPS.slice(0, 2).map(s => <SkipButton {...s} disabled={!url} onClick={() => skip(s.kind)} />)}
        <Button variant="primary" class="min-w-24" disabled={!url} onClick={toggle}>{playing ? 'Pause' : 'Play'}</Button>
        {SKIPS.slice(2).map(s => <SkipButton {...s} disabled={!url} onClick={() => skip(s.kind)} />)}
        <Button variant="secondary" pressed={loop} pressedLook="outline" disabled={!url} onClick={() => setLoop(l => !l)}>Loop</Button>
      </div>
      <Readout time={p.time} bar={p.bar} />
      {p.download ? <Downloads links={downloadLinks({ ...p.download, audio: rendered ? null : source, ...(rendered?.state === 'ready' ? { wav: rendered.url } : {}) }, p.audioSrc)} /> : null}
    </div>
  );
}

/** The sound being built, with a progress line through the build's stages, or why it could not be built. */
function Building(p: { sound: DraftSound }) {
  const s = p.sound;
  if (s.state === 'failed') return <p class="error w-full" role="alert">The sound could not be built: {s.reason}</p>;
  if (s.state !== 'building') return null;
  const step = BUILD_STAGES.indexOf(s.stage) + 1;
  return (
    <div class="grid w-full gap-1" role="status">
      <p class="text-sm">Building the sound… <span class="font-mono text-xs text-dim">{STAGE_WORDS[s.stage]}</span></p>
      <progress class="h-1 w-full accent-amber" max={BUILD_STAGES.length} value={step} aria-label="Building the sound" />
    </div>
  );
}

// Plain same-origin links (a built sound's is its blob address): the download attribute saves the file under the draft's name.
const DOWNLOAD_ICON = 'M8 2v8M4.5 6.5 8 10l3.5-3.5M3 13h10';
function Downloads(p: { links: DownloadLink[] }) {
  return (
    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Download this draft">
      {p.links.map(l => (
        <a class={buttonClass('secondary')} href={l.href} download={l.name} aria-label={`Download ${l.label.toLowerCase()}, ${l.name}`}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d={DOWNLOAD_ICON} /></svg>
          {l.label}
        </a>
      ))}
    </div>
  );
}

function SkipButton(p: { label: string; icon: string; disabled: boolean; onClick(): void }) {
  return (
    <Button variant="secondary" class="px-0" label={p.label} disabled={p.disabled} onClick={p.onClick}>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d={p.icon} /></svg>
    </Button>
  );
}
