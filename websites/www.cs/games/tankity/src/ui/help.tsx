/* The "How to play" overlay: how a match goes, then every key the game binds,
 * read from the live key table so a remapped game.json rewrites it. Touch
 * screens get the touch prose instead of the key list. The section element
 * (#help-overlay) stays in index.html and the game shows and hides it.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { Fragment, render } from 'preact';
import { KeyHints, Key, OverlayHead, ScrollKeys } from './chrome.tsx';
import type { KeyHintFn } from './chrome.tsx';

export interface HelpProps {
  /** The live key table (see KeyHintFn). */
  keyHint: KeyHintFn;
  /** The × button: the game closes the overlay. */
  onClose: () => void;
}

/** Every binding, grouped the way a player meets them: [keys, what they do].
 *  Two keys in one row read as a range ("1–9"). */
// A row's keys are a range (1–9) unless the row says they are alternatives (Space or Ctrl).
export const HELP_KEYS: readonly (readonly [string, readonly (readonly [readonly string[], string, 'or'?])[]])[] = [
  ['Aiming and firing', [
    [['aim:barrelLeft'], 'swing the barrel left'],
    [['aim:barrelRight'], 'swing the barrel right'],
    [['aim:powerUp'], 'more power'],
    [['aim:powerDown'], 'less power'],
    [['aim:driveLeft'], 'drive left (uses fuel)'],
    [['aim:driveRight'], 'drive right (uses fuel)'],
    [['global:fire', 'global:fire:2'], 'fire and end your turn', 'or'],
    [['global:guns'], 'pick a weapon (a digit, or the arrows and Enter, loads one)'],
    [['global:gunStock'], 'in the weapon picker: show every gun, or only those in stock'],
  ]],
  ['Panels and settings', [
    [['global:back'], 'open the menu, or close whatever is open'],
    [['global:log'], 'the radio log'],
    [['global:help'], 'this help'],
    [['global:report'], 'the scores'],
    [['global:music'], 'music on or off'],
    [['global:nextTrack'], 'the next song'],
    [['global:sound'], 'sound effects on or off'],
    [['global:fullscreen'], 'fullscreen on or off'],
  ]],
  ['Matches', [
    [['global:new'], 'a new match on the seed box\'s hills (in the shop: start the round)'],
    [['global:random'], 'a new match on random hills'],
    [['global:rooms'], 'the game rooms'],
    [['global:tutorial'], 'the tutorial'],
    [['global:battlePreview'], 'the firing range'],
  ]],
  ['In the shop', [
    [['shop:selUp'], 'the row above'],
    [['shop:selDown'], 'the row below'],
    [['shop:qtyDown'], 'fewer packs'],
    [['shop:qtyUp'], 'more packs (never more than the chest covers)'],
    [['shop:buy'], 'buy the row'],
    [['shop:buyRow:0', 'shop:buyRow:8'], 'buy that row outright'],
    [['shop:preview'], 'try the row\'s gun on the firing range'],
    [['shop:next'], 'start the round (Ready, in a room)'],
    [['shop:close'], 'close the firing range or a panel, else open the menu'],
  ]],
  ['Scrolling a panel', [
    [['scroll:lineDown'], 'a line down'],
    [['scroll:lineUp'], 'a line up'],
    [['scroll:pageDown'], 'a page down'],
    [['scroll:pageUp'], 'a page up'],
    [['scroll:halfDown'], 'half a page down'],
    [['scroll:halfUp'], 'half a page up'],
  ]],
];

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
        <li class="touch-only">
          Hold <strong>◀ ▶</strong> to swing the barrel and <strong>▲ ▼</strong> for power.{' '}
          <strong>Drive</strong> moves while you have fuel. <strong>FIRE</strong> shoots and ends your
          turn. In the shop, tap a row's <strong>Buy</strong> or <strong>Preview</strong>.{' '}
          <strong>Menu</strong> holds the settings.
        </li>
        <li>
          <strong>Wind</strong> pushes every shell, so check it before you fire. <strong>Weapon</strong> opens
          every gun on your rack as tiles: Shell, Buckshot, Mortar, Rail, the round-4 <strong>NUKE</strong>, and
          more from the shop. Shells are free; the good stuff is bought with winnings, starting with a $600 stake
          you spend in the shop before round 1.
        </li>
        <li>
          There is no final victory. Every round the battery rebuilds with thicker armor, steadier aim, and
          deeper magazines. How many hills can you hold?
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
          shot so nobody can fudge a hit. The host can pick named hills, and Play again keeps them for the
          next match without ever revealing the seed.
        </li>
        <li>
          A room with two or more people ends when only one has lives left: that player wins a bonus of
          twice the round bonus, and everyone sees the standings. Leaving counts as giving up, so the one
          who stays wins. <strong>Play again (same room)</strong> brings everyone back to the lobby with
          fresh lives; lose your last life and you watch the finish. Every score files itself on the
          all-time board for the room's Difficulty, except the scores of players who left early.
        </li>
        <li>
          Opening the page runs a demo battle behind the start. Every round gets its own name card before the
          shop and the shooting, and the camera pulls back as the battle spreads. Panels never pause the battle.
        </li>
      </ul>
      <div class="help-keys keys-only">
        {HELP_KEYS.map(([group, rows], g) => (
          <section key={group} aria-labelledby={`help-keys-${g}`}>
            <h3 id={`help-keys-${g}`}>{group}</h3>
            <dl>
              {rows.map(([ats, what, join]) => (
                <div key={ats.join()}>
                  <dt>{ats.map((at, i) => <Fragment key={at}>{i > 0 && (join === 'or' ? ' or ' : '–')}<Key at={at} cls="hk" /></Fragment>)}</dt>
                  <dd>{what}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws, after the keys change) the help into its section. */
export function renderHelp(container: Element, props: HelpProps): void {
  render(<Help {...props} />, container);
}
