/* The "How to play" overlay: mostly static prose whose key names come from the
 * live key table, so a remapped game.json rewrites the help by itself. The
 * section element (#help-overlay) stays in index.html and the game shows and
 * hides it; this fills it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { KeyHints, Key, OverlayHead, ScrollKeys } from './chrome.js';
import type { KeyHintFn } from './chrome.js';

export interface HelpProps {
  /** The live key table (see KeyHintFn). */
  keyHint: KeyHintFn;
  /** The × button: the game closes the overlay. */
  onClose: () => void;
}

export function Help({ keyHint, onClose }: HelpProps) {
  return (
    <KeyHints.Provider value={keyHint}>
      <OverlayHead titleId="help-h" title="How to play" closeId="help-close" onClose={onClose}
        navId="nav-help" scrollOnly nav={<ScrollKeys line />} />
      <ul class="help">
        <li>
          Scorched-earth artillery: you and the drone battery take turns lobbing shells across destructible
          hills. Last one rolling wins the round.
        </li>
        <li class="keys-only">
          Hold <strong><Key at="aim:barrelLeft" /><Key at="aim:barrelRight" /></strong> for barrel angle,{' '}
          <strong><Key at="aim:powerUp" /><Key at="aim:powerDown" /></strong> for power.{' '}
          <strong><Key at="aim:driveLeft" />/<Key at="aim:driveRight" /></strong> drives while you have
          fuel. <strong><Key at="global:fire" /></strong> fires and ends your turn.
        </li>
        <li class="touch-only">
          Hold <strong>◀ ▶</strong> to swing the barrel and <strong>▲ ▼</strong> for power.{' '}
          <strong>Drive ◀ ▶</strong> moves while you have fuel. <strong>Fire</strong> shoots and ends your
          turn. In the shop, tap a row's <strong>Buy</strong> or <strong>Preview</strong>.{' '}
          <strong>Menu</strong> holds New Game, rooms, sound, music, fullscreen and the tutorial.
        </li>
        <li>
          <strong>Wind</strong> pushes every shell, so check the meter before you fire.{' '}
          <span class="keys-only"><strong><Key at="global:guns" /></strong> (or <strong>Weapons</strong>) opens every gun on your rack as tiles, and <strong><Key at="global:cycle" /></strong> loads the next one:</span><span class="touch-only"><strong>Weapons</strong> opens every gun on your rack as tiles:</span>{' '}
          Shell, Buckshot, Mortar, Rail, the round-4 <strong>NUKE</strong>, and more from the shop. Shells
          are free; the good stuff is bought with winnings, starting with a $600 stake you spend in the shop
          before round 1.
        </li>
        <li>
          There is no final victory. Every round the battery rebuilds with thicker armor, steadier aim, and
          deeper magazines. How many hills can you hold?
        </li>
        <li class="keys-only">
          <strong><Key at="global:fullscreen" /></strong> toggles fullscreen for the full hillside view;{' '}
          <strong><Key at="global:fullscreen" /></strong> again leaves it.
        </li>
        <li class="keys-only">
          <strong><Key at="global:sound" /></strong> toggles sound effects,{' '}
          <strong><Key at="global:music" /></strong> toggles the music. Each has its own button in the menu
          (<strong><Key at="global:menu" /></strong> opens it), so one can stay on while the other rests.
          New Game, seed, fullscreen, rooms (<strong><Key at="global:rooms" /></strong>), and random hills (<strong><Key at="global:random" /></strong>)
          live there too.
        </li>
        <li class="keys-only">
          <strong><Key at="global:guns" /></strong> opens the weapon picker (number keys pick a gun there).
          In the shop, <strong><Key at="shop:selUp" />/<Key at="shop:selDown" /></strong> move,{' '}
          <strong><Key at="shop:qtyDown" />/<Key at="shop:qtyUp" /></strong> pick how many packs to buy
          (never more than the chest covers), <strong><Key at="shop:buy" /></strong> or{' '}
          <strong><Key at="shop:buy:1" /></strong> buys, number keys buy that row, and{' '}
          <strong><Key at="shop:preview:1" /></strong> or <strong><Key at="shop:preview" /></strong>{' '}
          previews it.
        </li>
        <li>
          Explosions carve craters and damage by distance. Direct hits pay double. You have{' '}
          <strong>3 lives</strong>; every 3000 points earns a <strong>1-up</strong> (max 5).
        </li>
        <li>
          The battery (<strong>Reaper</strong>, <strong>Wraith</strong>, <strong>Spotter</strong>) aims
          back, and gets steadier every round. Keep moving and mind the wind.
        </li>
        <li>
          <strong>Rooms</strong> lets friends share a hillside: host a room, read out the code, and take
          turns with the battery filling empty seats. Initials only, no chat, and the server settles every
          shot so nobody can fudge a hit. The host can pick named hills, and a rematch replays them without
          ever revealing the seed.
        </li>
        <li>
          Opening the page runs a demo battle. Press <strong>New Game</strong><span class="keys-only"> (or <strong><Key at="global:new" /></strong>)</span>{' '}
          to take the controls with a fanfare. Every round gets its own name card before the shop and the
          shooting.
        </li>
        <li>
          The camera pulls back as the battle spreads so every tank stays in view. The railgun trades its
          old cross-map glare for a shorter, saner bolt.
        </li>
        <li class="keys-only">
          <strong><Key at="global:log" /></strong> shows or hides the radio log,{' '}
          <strong><Key at="global:help" /></strong> this help, <strong><Key at="global:report" /></strong>{' '}
          the after-action report, and <strong><Key at="global:escape" /></strong> closes any open menu.
          Overlays never pause the battle.
        </li>
      </ul>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws, after the keys change) the help into its section. */
export function renderHelp(container: Element, props: HelpProps): void {
  render(<Help {...props} />, container);
}
