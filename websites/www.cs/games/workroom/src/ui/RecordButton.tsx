// Start or stop a recording: the record colour, and while recording the clock
// against the minute the recorder allows.
import { recordClock } from '../answer.ts';
import { MAX_AUDIO_SECONDS } from '../note.ts';
import { Button } from './console/Button.tsx';

export interface RecordButtonProps { recording: boolean; seconds: number; disabled?: boolean; idle?: string; onStart(): void; onStop(): void }

export function RecordButton(p: RecordButtonProps) {
  return p.recording
    ? <Button variant="record" pressed data={{ 'data-recording': '' }} onClick={p.onStop}>{`Stop (${recordClock(Math.min(p.seconds, MAX_AUDIO_SECONDS))} of ${recordClock(MAX_AUDIO_SECONDS)})`}</Button>
    : <Button variant="record" disabled={p.disabled} onClick={p.onStart}>{p.idle ?? 'Hum it'}</Button>;
}
