/* Operation Tankity: the game menu's settings.
 *
 * The settings menu: the unit look, the text size, the colour theme, the Difficulty and Screen flashes (all remembered in this browser), a
 * room's turn time (the host's slider, everyone else's label), and the
 * props the game menu overlay (src/ui/menu.tsx) is drawn from: what is
 * chosen, what is muted, whether a room runs, and what each button does.
 * Sound, music, fullscreen and a match on the seed box's hills arrive as deps. */
import { browserStorage } from '../../_kit/ports.browser.ts';
import { pref, text } from '../../_kit/prefs.ts';
import type { sfx as SfxApi } from './audio.ts';
import { DIFFICULTIES } from './ai.ts';
import { DIFFICULTY_NAMES, isDifficulty } from './difficulty.ts';
import type { DifficultySetting } from './difficulty.ts';
import type { GameState, GameTank } from './game-types.ts';
import type { RoomClient } from './net.ts';
import { THEMES, isHex, isTheme, themeSetting } from './theme.ts';
import type { Volume } from './volume.ts';
import { drawUnitIcon } from './ui/icons.ts';
import { renderMenu as drawMenu } from './ui/menu.tsx';
import type { KeyHintFn } from './ui/chrome.tsx';
import type { AlertsState } from './ui/games.tsx';

/** The slice of the game's state the menu reads and writes (main.ts's G). */
export type MenuState = Pick<GameState, 'body' | 'tanks'>;

/** What the menu needs from the page and the rest of the game. */
export interface MenuDeps {
  G: MenuState;
  $(id: string): HTMLElement | null;
  net: Pick<RoomClient, 'on' | 'sendBody' | 'turnSecs' | 'isHost'>;
  sfx: Pick<typeof SfxApi, 'play'>;
  difficulty: DifficultySetting;
  unlock(): void;
  /** Full screen on a touch device, asked inside the Play this seed tap (optional: tests omit it). */
  playFullscreen?(): void;
  isSoundMuted(): boolean;
  isMusicMuted(): boolean;
  keyHint: KeyHintFn;
  myTank(): GameTank | null;
  openLeaveVeil(): void;
  placeLogBelowStatus(): void;
  freshMatchFromSeedBox(opts?: { tut?: boolean }): void;
  toggleFullscreen(): void;
  quit(): void;
  /** The room match's scoreboard card (room.ts openStandings). */
  openStandings(): void;
  /** The host set the room's turn time. */
  turnTime(secs: number): void;
  /** The Turn alerts button's state and click. */
  alerts(): { state: AlertsState; onClick: () => void };
  toggleMusic(): void;
  toggleOverlay(id: string, btnId?: string): void;
  toggleSound(): void;
  nextSong(): void;
  /** Screen flashes on or off in the effects engine. */
  setFlashes(on: boolean): void;
  /** The Sound and Music sliders: their levels, and what a drag sets. */
  volume: Pick<Volume, 'level' | 'setLevel'>;
}

export function createMenu(deps: MenuDeps) {
  const {
    G, $, net, sfx, difficulty, unlock, playFullscreen, isSoundMuted, isMusicMuted, keyHint, myTank, openLeaveVeil, placeLogBelowStatus,
    freshMatchFromSeedBox, openStandings, turnTime, alerts, toggleFullscreen, quit, toggleMusic, toggleOverlay, toggleSound, nextSong, setFlashes, volume,
  } = deps;

  /* Ground units: every human (you, and the people in a room) picks a body.
     Bodies are looks only; all share the turret pivot at (0, -12), so aim,
     muzzle and shots are identical whichever one you drive. */
  const UNIT_BODIES = [
    { key: 'tank', name: 'Tank' },
    { key: 'hover', name: 'Hover' },
    { key: 'walker', name: 'Walker' },
    { key: 'buggy', name: 'Buggy' },
  ];
  /* The unit picker in the Game menu: one button per body, each with a small
     drawing of it. The choice is remembered and, in a room, shared. */
  const bodyPref = pref('tankity-body', 'tank', text, browserStorage());
  function loadBody(): string {
    const b = bodyPref.get();
    return UNIT_BODIES.some(u => u.key === b) ? b : 'tank';
  }
  function chooseBody(key: string): void {
    if (!UNIT_BODIES.some(u => u.key === key)) return;
    G.body = key;
    bodyPref.set(key);
    const mine = net.on ? myTank() : (G.tanks || []).find(t => t.isPlayer);
    if (mine) mine.body = key;
    net.sendBody(key);
    renderMenu();
  }
  /* Text size: a menu setting kept in this browser. It scales every panel
     (they size in rem) and the name tags over the units. */
  const TEXT_SIZES = [
    { key: 's', name: 'Small', scale: 0.9 },
    { key: 'm', name: 'Normal', scale: 1 },
    { key: 'l', name: 'Large', scale: 1.15 },
    { key: 'xl', name: 'Huge', scale: 1.3 },
  ];
  let TEXT_SIZE = 'm';
  function textScale(): number {
    return (TEXT_SIZES.find(t => t.key === TEXT_SIZE) || TEXT_SIZES[1]!).scale;
  }
  const textPref = pref('tankity-text', 'm', text, browserStorage());
  function loadTextSize(): void {
    const key = textPref.get();
    applyTextSize(TEXT_SIZES.some(t => t.key === key) ? key : 'm');
  }
  function applyTextSize(key: string): void {
    TEXT_SIZE = key;
    if (document.documentElement && document.documentElement.style) {
      document.documentElement.style.fontSize = `${textScale() * 100}%`;
    }
    renderMenu();
    placeLogBelowStatus();
  }
  function chooseTextSize(key: string): void {
    if (!TEXT_SIZES.some(t => t.key === key)) return;
    textPref.set(key);
    applyTextSize(key);
    sfx.play('click');
  }
  /* Theme: the accent colours of every panel and button (src/theme.ts), kept
     in this browser. index.html put the saved one on <html> before the first
     paint; a pick here saves it and repaints at once. */
  const theme = themeSetting(browserStorage(), typeof document === 'undefined' ? null : document.documentElement);
  function chooseTheme(key: string): void {
    if (!isTheme(key)) return;
    theme.set(key);
    sfx.play('click');
    renderMenu();
  }
  function chooseCustom(hex: string): void {
    if (!isHex(hex.toLowerCase())) return;
    theme.setCustom(hex);
    renderMenu();
  }
  /* Difficulty: how well the drones aim (ai.ts DIFFICULTY). Kept in this
     browser; the match in progress keeps the aim it was dealt. */
  const DIFFICULTY_CHOICES = DIFFICULTIES.map(key => ({ key, name: DIFFICULTY_NAMES[key] }));
  function chooseDifficulty(key: string): void {
    if (!isDifficulty(key)) return;
    difficulty.set(key);
    sfx.play('click');
    renderMenu();
  }
  /* Screen flashes: on unless a player turns them off (kept in this browser).
     Off drops the full-screen flash and the large bright blast layers;
     prefers-reduced-motion drops the flash whatever this says. */
  const flashPref = pref('tankity-flashes', 'on', text, browserStorage());
  const flashesOn = (): boolean => flashPref.get() !== 'off';
  function loadFlashes(): void { setFlashes(flashesOn()); }
  function toggleFlashes(): void {
    flashPref.set(flashesOn() ? 'off' : 'on');
    setFlashes(flashesOn());
    sfx.play('click');
    renderMenu();
  }
  /* The game menu is a Preact component (src/ui/menu.tsx): it gets what it shows
     (the unit, the text size, what is muted, whether a room runs) and reports
     clicks. The seed box stays the page's own. */
  function renderMenu(): void {
    const section = $('menu-overlay');
    if (!section) return;
    drawMenu(section, {
      keyHint,
      onClose: () => toggleOverlay('menu-overlay', 'btn-menu'),
      onPlaySeed: () => { playFullscreen?.(); unlock(); sfx.play('click'); freshMatchFromSeedBox(); },
      onSubmit: () => {
        // In a room, Enter asks the leave question like Leave room does.
        if (net.on) { openLeaveVeil(); return; }
        sfx.play('click');
        freshMatchFromSeedBox();
      },
      units: UNIT_BODIES,
      unit: G.body,
      drawUnit: drawUnitIcon,
      onPickUnit: chooseBody,
      sizes: TEXT_SIZES,
      size: TEXT_SIZE,
      onPickSize: chooseTextSize,
      themes: THEMES,
      theme: theme.get(),
      onPickTheme: chooseTheme,
      customColour: theme.custom(),
      onPickCustom: chooseCustom,
      difficulties: DIFFICULTY_CHOICES,
      difficulty: difficulty.get(),
      onPickDifficulty: chooseDifficulty,
      sound: !isSoundMuted(),
      music: !isMusicMuted(),
      soundLevel: volume.level('sound'),
      musicLevel: volume.level('music'),
      onSoundLevel: level => { volume.setLevel('sound', level); renderMenu(); },
      onMusicLevel: level => { volume.setLevel('music', level); renderMenu(); },
      fullscreen: !!document.fullscreenElement,
      flashes: flashesOn(),
      onFlashes: toggleFlashes,
      onSound: toggleSound,
      onMusic: toggleMusic,
      onFullscreen: toggleFullscreen,
      onScores: () => toggleOverlay('report-overlay', 'scores-open'),
      // The card replaces the menu: close it first, so Q then goes back to the battle.
      onStandings: () => { toggleOverlay('menu-overlay', 'btn-menu'); openStandings(); },
      inRoom: net.on,
      turn: net.on ? { secs: net.turnSecs, host: net.isHost } : null,
      onTurn: turnTime,
      alerts: net.on ? alerts() : null,
      onLeave: openLeaveVeil,
      onQuit: quit,
      onNextSong: nextSong,
      // Radio and Help close the menu, then open their panel in its place.
      onRadio: () => { toggleOverlay('menu-overlay', 'btn-menu'); toggleOverlay('log-overlay', 'btn-log'); },
      onHelp: () => { toggleOverlay('menu-overlay', 'btn-menu'); toggleOverlay('help-overlay', 'btn-help'); },
      radioOpen: !($('log-overlay')?.hidden ?? true),
      helpOpen: !($('help-overlay')?.hidden ?? true),
    });
  }

  return { loadBody, loadTextSize, loadFlashes, textScale, renderMenu };
}
