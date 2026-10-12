/* Cylon Defense: the settings and the nav chrome.
 *
 * The player's settings (sound, music, their volumes, the eye) persist in
 * localStorage (one kit pref) and are drawn by ui/settings.tsx in the gear's panel; the
 * Game On toggle sits beside it. The nav has two looks, civil and combat, and the chrome fades between
 * them when the game is switched. The mobile menu's burger is bound here too.
 *
 * It touches only the nav elements it is handed and `document`; what the
 * settings change in the game (the eye, the sound) goes out through callbacks.
 * Browser-only: it compiles in the DOM program. */
import { pref, json } from '../../_kit/prefs.ts';
import { browserStorage } from '../../_kit/ports.browser.ts';
import { DEFAULT_SETTINGS, SETTINGS_KEY, isSettings } from './types.ts';
import type { Settings, Timer } from './types.ts';
import { renderSettings as drawSettings } from './ui/settings.tsx';
import type { SettingKey } from './ui/settings.tsx';
import type { HsRow } from './scores.ts';

export interface ChromeDeps {
  settingsRoot: HTMLElement | null;
  gameToggleBtn: HTMLElement | null;
  gameToggleLabel: HTMLElement | null;
  cicEnterBtn: HTMLElement | null;
  navBurger: HTMLElement | null;
  navMenu: HTMLElement | null;
  navGame: HTMLElement | null;
  siteBrand: HTMLElement | null;
  /** The brand's text in the civil and the combat nav. */
  BRAND_CIVIL: string;
  BRAND_COMBAT: string;
  /** How long the nav chrome fades, matching --cylon-desolate-fade * 0.45. */
  NAV_FADE_MS: number;
  reduceMotion: boolean;
  /** The gear's panel, which the settings are drawn into. */
  settingsPanel: HTMLElement | null;
  /** The weekly board and its reset sentence (the game-over module keeps them). */
  boardRows: () => readonly HsRow[];
  resetText: () => string;
  fetchHighScores: () => Promise<void>;
  /** The Game On toggle was pressed. */
  setGameEnabled: (on: boolean) => void;
  /** The eye was switched off in the settings. */
  setEyeTracking: (on: boolean) => void;
  /** A setting changed (audio.settingChanged). */
  settingChanged: (key: string) => void;
}

export interface Chrome {
  /** The live settings; the object is never replaced. */
  settings: Settings;
  saveSettings(): void;
  syncGameToggleUi(): void;
  /** Fades to the nav look the settings call for (civil when the game is off). */
  syncNavChrome(): void;
  renderSettings(): void;
  bindSettings(): void;
  bindGameToggle(): void;
  bindNavMenu(): void;
}

export function createChrome(d: ChromeDeps): Chrome {
  const { settingsRoot, gameToggleBtn, gameToggleLabel, cicEnterBtn, navBurger, navMenu, navGame, siteBrand,
    BRAND_CIVIL, BRAND_COMBAT, NAV_FADE_MS, reduceMotion, settingsPanel, fetchHighScores, setGameEnabled,
    setEyeTracking } = d;
  // The settings panel reaches the sound through one callback; the name is the
  // one the panel's handler has always called.
  const audio = { settingChanged: (key: string): void => d.settingChanged(key) };

  const defaults = DEFAULT_SETTINGS;
  const saved = pref<Partial<Settings>>(SETTINGS_KEY, DEFAULT_SETTINGS, json(isSettings), browserStorage());
  let settings: Settings = Object.assign({}, defaults, saved.get());
  // Game stays off until the player explicitly enables it
  settings.gameEnabled = false;
  settings.soundVolume = Math.max(0, Math.min(100, Number(settings.soundVolume) || defaults.soundVolume));
  settings.musicVolume = Math.max(0, Math.min(100, Number(settings.musicVolume) || defaults.musicVolume));
  // Migrate old defaults to the new midpoint UI values
  let migrated = false;
  if (settings.soundVolume === 85) {
    settings.soundVolume = 50;
    migrated = true;
  }
  if (settings.musicVolume === 40) {
    settings.musicVolume = 50;
    migrated = true;
  }
  if (migrated) {
    saved.set(settings);
  }

  let navChromeFadeGen = 0;
  let navChromeFadeTimer: Timer | null = null;

  function saveSettings() {
    saved.set(settings);
    renderSettings();
    syncGameToggleUi();
  }

  function renderSettings(): void {
    if (!settingsPanel) return;
    drawSettings(settingsPanel, {
      soundEnabled: settings.soundEnabled,
      soundVolume: settings.soundVolume,
      musicEnabled: settings.musicEnabled,
      musicVolume: settings.musicVolume,
      eyeEnabled: settings.eyeEnabled,
      rows: d.boardRows(),
      resetText: d.resetText(),
      onSetting: applySetting,
    });
  }

  function applySetting(key: SettingKey, value: boolean | number): void {
    // The key table says which settings are volumes and which are switches; a mismatched value is ignored.
    if (key === 'soundVolume' || key === 'musicVolume') {
      if (typeof value === 'number') settings[key] = Math.max(0, Math.min(100, value || 0));
    } else if (typeof value === 'boolean') {
      settings[key] = value;
    }
    saveSettings();
    if (key === 'eyeEnabled' && !settings.eyeEnabled) setEyeTracking(false);
    audio.settingChanged(key);
  }

  function syncGameToggleUi() {
    if (!gameToggleBtn) return;
    gameToggleBtn.classList.toggle('is-on', settings.gameEnabled);
    gameToggleBtn.setAttribute('aria-pressed', settings.gameEnabled ? 'true' : 'false');
    if (gameToggleLabel) {
      gameToggleLabel.textContent = settings.gameEnabled ? 'Game On' : 'Game Off';
    }
  }

  /** Apply civil vs combat nav structure (no animation). */
  function applyNavChrome(on: boolean): void {
    document.body.classList.toggle('cylon-nav-combat', on);
    if (siteBrand) {
      siteBrand.textContent = on ? BRAND_COMBAT : BRAND_CIVIL;
    }
    if (navGame) {
      navGame.hidden = !on;
    }
    if (settingsRoot) {
      settingsRoot.hidden = !on;
    }
    if (cicEnterBtn) {
      cicEnterBtn.hidden = on;
    }
    // Game toggle stays in #site-nav-power — never reparented (avoids fade/size jumps)
    if (!on) {
      const panel = document.getElementById('cylon-settings-panel');
      const toggleBtn = document.getElementById('cylon-settings-toggle');
      if (panel && !panel.hidden) {
        panel.hidden = true;
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      }
    }
  }

  /** Fade out → swap chrome → fade in (same family as page scatter fade). */
  function syncNavChrome() {
    const on = !!settings.gameEnabled;
    const navInner = document.querySelector('.site-nav-inner');
    const already = document.body.classList.contains('cylon-nav-combat');

    if (reduceMotion || !navInner || already === on) {
      clearTimeout(navChromeFadeTimer!);
      navChromeFadeTimer = null;
      navInner?.classList.remove('is-nav-fading');
      applyNavChrome(on);
      return;
    }

    const gen = ++navChromeFadeGen;
    clearTimeout(navChromeFadeTimer!);
    navInner.classList.add('is-nav-fading');
    navChromeFadeTimer = setTimeout(() => {
      if (gen !== navChromeFadeGen) return;
      applyNavChrome(on);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (gen !== navChromeFadeGen) return;
          navInner.classList.remove('is-nav-fading');
          navChromeFadeTimer = null;
        });
      });
    }, NAV_FADE_MS);
  }

  function bindNavMenu() {
    if (!navBurger || !navMenu) return;
    const closeMenu = () => {
      navMenu.classList.remove('is-open');
      navBurger.setAttribute('aria-expanded', 'false');
    };
    navBurger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !navMenu.classList.contains('is-open');
      navMenu.classList.toggle('is-open', open);
      navBurger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navMenu.querySelectorAll('a.site-link').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });
    document.addEventListener('click', (e) => {
      if (!navMenu.classList.contains('is-open')) return;
      if (navMenu.contains(e.target as Node | null) || navBurger.contains(e.target as Node | null)) return;
      closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 820px)').matches) closeMenu();
    });
  }

  function bindGameToggle() {
    if (!gameToggleBtn) return;
    syncGameToggleUi();
    gameToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setGameEnabled(!settings.gameEnabled);
    });
  }

  function bindSettings() {
    if (!settingsRoot) return;
    renderSettings();
    const toggleBtn = document.getElementById('cylon-settings-toggle');
    const panel = settingsPanel;
    if (!toggleBtn || !panel) return;
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = panel.hasAttribute('hidden');
      if (open) {
        fetchHighScores();
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
      toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (!settingsRoot.contains(e.target as Node | null)) {
        panel.setAttribute('hidden', '');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  return { settings, saveSettings, syncGameToggleUi, syncNavChrome, renderSettings, bindSettings, bindGameToggle, bindNavMenu };
}
