// Your Keyboard: a plugged-in MIDI keyboard or drum pads, through Web MIDI. The browser is asked only when the person
// turns it on, and never for SysEx. Its keys play and record exactly as the on-screen ones do (compose/midiin.ts reads
// velocity, the sustain pedal and channel 10's drum pads). The page sends to a device only when the person picks it
// under Sends GM To, and then only the part's General MIDI program, so a General MIDI keyboard's own sound matches.
import { useEffect, useRef, useState } from 'preact/hooks';
import { createMidiKeys, deviceLabel, drumName, parseMidi, programChange } from '../../compose/midiin.ts';
import { pitchName } from '../../pianoroll.ts';
import { Button } from '../console/Button.tsx';
import { Panel } from '../console/Panel.tsx';

export interface YourKeyboardProps {
  /** Asks the browser for Web MIDI; absent where the browser has none (Safari). */
  request?: () => Promise<MIDIAccess>;
  /** The part's General MIDI program (1–128) to send, or null for a drum part (General MIDI drums need none). */
  program: number | null;
  /** The part's own drum names, by key, when it is a drum part. */
  drums: ReadonlyMap<number, string> | null;
  onDown(key: string, pitch: number, velocity: number, drum: boolean): void;
  onUp(key: string): void;
  help: boolean;
}

interface Port { id: string; name: string }
const ports = (map: MIDIInputMap | MIDIOutputMap): Port[] =>
  [...map.values()].filter(p => p.state !== 'disconnected').map(p => ({ id: p.id, name: deviceLabel(p.name, p.manufacturer) }));

export function YourKeyboard(p: YourKeyboardProps) {
  const [on, setOn] = useState(false);
  const [access, setAccess] = useState<MIDIAccess | null>(null);
  const [inputs, setInputs] = useState<Port[]>([]);
  const [outputs, setOutputs] = useState<Port[]>([]);
  const [input, setInput] = useState('all');
  const [output, setOutput] = useState('');
  const [pedal, setPedal] = useState(false);
  const [last, setLast] = useState('');
  const [note, setNote] = useState('');
  const props = useRef(p);
  props.current = p;
  const keys = useRef(createMidiKeys({
    down: (key, pitch, velocity, drum) => {
      props.current.onDown(key, pitch, velocity, drum);
      const named = props.current.drums?.get(pitch);
      setLast(drum || named ? `${named ?? drumName(pitch)} · Pad ${pitch} · Velocity ${velocity}` : `${pitchName(pitch)} · Velocity ${velocity}`);
    },
    up: key => props.current.onUp(key),
  })).current;

  // Listens to the chosen inputs while on; a device that goes away, or is no longer chosen, lets its keys go.
  useEffect(() => {
    if (!on || !access) return;
    const listening = new Set<string>();
    const listen = (): void => {
      setInputs(ports(access.inputs));
      setOutputs(ports(access.outputs));
      for (const port of access.inputs.values()) {
        const wanted = port.state !== 'disconnected' && (input === 'all' || input === port.id);
        if (wanted && !listening.has(port.id)) {
          listening.add(port.id);
          port.onmidimessage = e => {
            if (!e.data) return;
            const m = parseMidi(e.data);
            if (!m) return;
            keys.message(port.id, m);
            if (m.kind === 'sustain') setPedal(keys.pedal());
          };
        } else if (!wanted && listening.has(port.id)) {
          listening.delete(port.id);
          port.onmidimessage = null;
          keys.lost(port.id);
          setPedal(keys.pedal());
        }
      }
      for (const id of [...listening]) if (!access.inputs.get(id)) { listening.delete(id); keys.lost(id); setPedal(keys.pedal()); }
    };
    listen();
    access.onstatechange = listen;
    return () => {
      access.onstatechange = null;
      for (const id of listening) {
        const port = access.inputs.get(id);
        if (port) port.onmidimessage = null;
        keys.lost(id);
      }
      setPedal(false);
    };
  }, [on, access, input]);

  // The part's program goes to the picked output when it is picked and whenever the part's instrument changes.
  useEffect(() => {
    if (!on || !access || !output || p.program === null) return;
    try { access.outputs.get(output)?.send(programChange(p.program)); } catch { /* a device that went away mid-send */ }
  }, [on, access, output, p.program]);

  const turnOn = async (): Promise<void> => {
    if (!p.request) return;
    setNote('Asking the browser for your keyboard…');
    try {
      const a = await p.request();
      setAccess(a);
      setOn(true);
      setNote(a.inputs.size === 0 ? 'No keyboard is plugged in yet. Plug one in; it shows here by itself.' : '');
    } catch (e) {
      setNote(e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'SecurityError')
        ? 'The browser was not allowed to use MIDI devices, so Your Keyboard stays off. The on-screen keys and the computer keys still work.'
        : `Your keyboard could not be reached: ${e instanceof Error ? e.message : String(e)} The on-screen keys still work.`);
    }
  };

  if (!p.request) {
    return (
      <Panel title="Your Keyboard">
        <p data-midi-note="" class="text-sm text-dim">This browser has no Web MIDI (Safari has none), so a plugged-in keyboard cannot play here. Chrome, Edge and Firefox can. The on-screen keys and the computer keys work everywhere.</p>
      </Panel>
    );
  }
  return (
    <Panel title="Your Keyboard">
      <div class="grid gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <Button pressed={on} onClick={() => { if (on) { setOn(false); setNote(''); setLast(''); } else void turnOn(); }} data={{ 'data-midi-toggle': on ? 'on' : 'off' }}>Your Keyboard: {on ? 'On' : 'Off'}</Button>
          {on ? <span data-pedal="" class="font-mono text-xs text-dim">Sustain Pedal: {pedal ? 'Down' : 'Up'}</span> : null}
        </div>
        {on ? (
          <>
            <label class="grid gap-1 text-sm">Choose Device
              <select data-midi-input="" value={input} onChange={e => setInput((e.target as HTMLSelectElement).value)} class="min-h-11 rounded-md border border-rule bg-well px-2 text-ink">
                <option value="all">All Devices</option>
                {inputs.map(i => <option value={i.id}>{i.name}</option>)}
              </select></label>
            <label class="grid gap-1 text-sm">Sends GM To
              <select data-midi-output="" value={output} onChange={e => setOutput((e.target as HTMLSelectElement).value)} class="min-h-11 rounded-md border border-rule bg-well px-2 text-ink">
                <option value="">None</option>
                {outputs.map(o => <option value={o.id}>{o.name}</option>)}
              </select></label>
          </>
        ) : null}
        <p data-midi-devices="" class="h-5 truncate font-mono text-xs text-dim">{on ? (inputs.length ? `Plugged In: ${inputs.map(i => i.name).join(', ')}` : 'No device plugged in') : ''}</p>
        <p data-midi-last="" class="h-5 truncate font-mono text-xs">{last}</p>
        <p data-midi-note="" class="min-h-5 text-sm text-dim">{note}</p>
        {p.help ? (
          <p class="border-l-2 border-amber pl-2 text-sm text-dim">
            A keyboard plays here with Studio Sounds, the studio's own recordings. How hard you press sets how loud the note is, and the sustain pedal holds notes as on a piano. Drum pads (channel 10) play the drum part. A keyboard's own built-in sound can still play through its speakers; Sends GM To picks this part's sound on a General MIDI keyboard.
          </p>
        ) : null}
      </div>
    </Panel>
  );
}
