// Cylon Defense: the settings panel under the nav's gear: sound, music, their
// volumes, the eye, and the weekly board. src/chrome.ts holds the settings and
// saves them; this draws them and reports each change.
import { render } from 'preact';
import { HsList } from './board.tsx';
import type { HsRow } from '../scores.ts';

export type SettingKey = 'soundEnabled' | 'soundVolume' | 'musicEnabled' | 'musicVolume' | 'eyeEnabled';

export interface SettingsProps {
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  eyeEnabled: boolean;
  rows: readonly HsRow[];
  resetText: string;
  onSetting(key: SettingKey, value: boolean | number): void;
}

export function SettingsPanel(p: SettingsProps) {
  const toggle = (key: SettingKey, on: boolean, label: string) => (
    <label class="cylon-setting">
      <input type="checkbox" data-setting={key} checked={on}
        onChange={e => p.onSetting(key, e.currentTarget.checked)} />
      <span>{label}</span>
    </label>
  );
  const slider = (key: SettingKey, value: number, label: string, name: string) => {
    const set = (e: Event): void => p.onSetting(key, Number((e.currentTarget as HTMLInputElement).value));
    return (
      <label class="cylon-setting cylon-setting-slider">
        <span>{label}</span>
        <input type="range" min="0" max="100" step="1" value={value} data-setting={key} aria-label={name}
          onInput={set} onChange={set} />
      </label>
    );
  };
  return (
    <>
      <p class="cylon-settings-title">Options</p>
      {toggle('soundEnabled', p.soundEnabled, 'Sound Effects')}
      {slider('soundVolume', p.soundVolume, 'SFX Volume', 'Sound effects volume')}
      {toggle('musicEnabled', p.musicEnabled, 'Music')}
      {slider('musicVolume', p.musicVolume, 'Music Volume', 'Music volume')}
      {toggle('eyeEnabled', p.eyeEnabled, 'Eye Tracking')}
      <p class="cylon-settings-title cylon-settings-scores-title">Weekly High Scores</p>
      <p class="cylon-settings-hint" id="cylon-weekly-reset">{p.resetText}</p>
      <HsList id="cylon-high-scores" rows={p.rows} />
      <p class="cylon-settings-hint">Start with 30 HP — occasional nukes and small missiles (2 HP each). Last 10s without a hit to heal 1. Cyan/pink missiles chase you; orange locks where you just aimed. More drones as KOs rise. Drag the reticle to dodge · tap drones · Grenade / Raptor in the bar.</p>
    </>
  );
}

export function renderSettings(panel: Element, props: SettingsProps): void {
  render(<SettingsPanel {...props} />, panel);
}
