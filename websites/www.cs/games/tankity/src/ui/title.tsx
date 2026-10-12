/* The title card over the dimmed demo, on the kit's Dialog: Play, Play with
 * friends, Tutorial, a Settings link, and the three-letter initials. The game
 * owns whether it shows, the initials and what each button does; this draws
 * them and reports. Its mount point (#title-root) stays in index.html.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useRef } from 'preact/hooks';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { KeyHints, Key, blurThen } from './chrome.tsx';
import type { KeyHintFn } from './chrome.tsx';

export interface TitleProps {
  keyHint: KeyHintFn;
  /** The card shows; the demo plays dimmed behind it. */
  open: boolean;
  /** The saved initials, three uppercase letters. */
  initials: string;
  /** Why the last typed set was refused, or empty. */
  problem: string;
  /** The menu is open (the Settings link's aria-expanded). */
  settingsOpen: boolean;
  /** All three boxes hold a letter: the set, uppercase. The game checks it. */
  onInitials: (word: string) => void;
  onPlay: () => void;
  onFriends: () => void;
  onTutorial: () => void;
  onSettings: () => void;
}

function InitialsPicker({ initials, onInitials }: Pick<TitleProps, 'initials' | 'onInitials'>) {
  const boxes = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  function typed(i: number, ev: Event): void {
    const box = ev.currentTarget as HTMLInputElement;
    // One letter per box, shown uppercase whatever case was typed.
    const letter = box.value.replace(/[^A-Za-z]/g, '').slice(-1).toUpperCase();
    box.value = letter;
    if (!letter) return;
    const next = boxes[i + 1]?.current;
    if (next) {
      next.focus?.();
      next.select?.();
    }
    const word = boxes.map(b => b.current?.value ?? '').join('');
    if (/^[A-Z]{3}$/.test(word)) onInitials(word);
  }
  return (
    <fieldset class="initials">
      <legend>Your initials</legend>
      {[0, 1, 2].map(i => (
        <input key={i} ref={boxes[i]} id={`title-initial-${i + 1}`} class="initial" type="text" inputMode="text"
          autocomplete="off" spellcheck={false} maxLength={1} aria-label={`Initial ${i + 1} of 3`}
          value={initials[i] ?? ''} onInput={ev => typed(i, ev)}
          onFocus={ev => (ev.currentTarget as HTMLInputElement).select?.()} />
      ))}
    </fieldset>
  );
}

export function Title(p: TitleProps) {
  // No onDismiss: Esc opens the settings menu over the card, never closes it.
  return (
    <KeyHints.Provider value={p.keyHint}>
      <Dialog open={p.open} id="title-card" veilClass="title-veil" panelClass="title-card" titleId="title-h"
        title="Operation Tankity" describedBy="title-tag" focusId="title-play">
        <p id="title-tag" class="title-tag">Mind the wind. Flatten the drone battery.</p>
        <button type="button" id="title-play" class="title-play btn-primary" onClick={blurThen(p.onPlay)}>
          <span aria-hidden="true">▶ </span>Play <Key at="global:new" bare />
        </button>
        <div class="title-row">
          <button type="button" id="rooms-open" onClick={blurThen(p.onFriends)}>Play with friends <Key at="global:rooms" bare /></button>
          <button type="button" id="tutorial-open" onClick={blurThen(p.onTutorial)}>Tutorial <Key at="global:tutorial" bare /></button>
        </div>
        <InitialsPicker initials={p.initials} onInitials={p.onInitials} />
        <p class="title-note" id="title-initials-note" role="status">{p.problem}</p>
        <button type="button" id="title-settings" class="title-link" aria-haspopup="dialog" aria-expanded={p.settingsOpen}
          onClick={blurThen(p.onSettings)}>Settings <Key at="global:escape" bare /></button>
      </Dialog>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the title card into its mount point. */
export function renderTitle(container: Element, props: TitleProps): void {
  render(<Title {...props} />, container);
}
