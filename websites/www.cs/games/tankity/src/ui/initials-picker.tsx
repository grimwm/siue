/* The three one-letter initials boxes, shared by the title card and the rooms
 * lobby. The game owns the saved set and whether a typed one is allowed; this
 * draws the boxes and reports a full set. What the player types stays in the
 * boxes across redraws (the lobby redraws on every poll); the saved set goes
 * back in when it changes or when the game bumps `rev`.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { useLayoutEffect, useRef } from 'preact/hooks';
import type { Ref } from 'preact';

export interface InitialsPickerProps {
  /** The boxes' ids are `<idPrefix>-initial-1` to `-3`, so two pickers on one page never collide. */
  idPrefix: string;
  /** The saved initials, three uppercase letters. */
  initials: string;
  /** A change puts the saved set back in the boxes (a card opening, a lobby reopening). */
  rev?: number;
  /** All three boxes hold a letter: the set, uppercase. The game checks it. */
  onInitials: (word: string) => void;
  /** The fieldset, for reading what the boxes hold (typedLetters). */
  fieldRef?: Ref<HTMLFieldSetElement>;
  /** The visible rejection text; while it is non-empty each box is marked invalid and points at the note. */
  problem?: string;
  /** The id of the element that shows `problem`. */
  noteId?: string;
}

/** What the boxes hold, one character per box, a space for an empty one. */
export function typedLetters(field: Element | null | undefined): string {
  const boxes = (field?.querySelectorAll?.('.initial') ?? []) as ArrayLike<HTMLInputElement>;
  return [0, 1, 2].map(i => (boxes[i]?.value || ' ').slice(0, 1)).join('');
}

export function InitialsPicker({ idPrefix, initials, rev = 0, onInitials, fieldRef, problem, noteId }: InitialsPickerProps) {
  const boxes = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  useLayoutEffect(() => {
    boxes.forEach((b, i) => { if (b.current) b.current.value = initials[i] ?? ''; });
  }, [initials, rev]);
  function typed(i: number, ev: Event): void {
    const box = ev.currentTarget as HTMLInputElement;
    // One letter per box, shown uppercase whatever case was typed. The typed
    // letter replaces the one there wherever the caret sat (a box focused
    // without its letter selected), so the boxes have no length limit.
    const { data, inputType } = ev as InputEvent;
    const letters = (data || box.value).replace(/[^A-Za-z]/g, '').toUpperCase();
    // A paste or drop fills this box and the ones after it, in order.
    const pasted = inputType === 'insertFromPaste' || inputType === 'insertFromDrop';
    const spread = pasted ? letters.slice(0, 3 - i) : letters.slice(-1);
    box.value = spread[0] ?? '';
    if (!spread) return;
    // Retyping from a box starts a new set: the boxes after it empty, so a
    // half-typed set is never saved as a mix of new and old letters.
    boxes.slice(i + 1).forEach((later, k) => { if (later.current) later.current.value = spread[k + 1] ?? ''; });
    const next = boxes[Math.min(i + spread.length, 2)]?.current;
    if (next) {
      next.focus?.();
      next.select?.();
    }
    const word = boxes.map(b => b.current?.value ?? '').join('');
    if (/^[A-Z]{3}$/.test(word)) onInitials(word);
  }
  return (
    <fieldset class="initials" ref={fieldRef}>
      <legend>Your initials</legend>
      {[0, 1, 2].map(i => (
        <input key={i} ref={boxes[i]} id={`${idPrefix}-initial-${i + 1}`} class="initial" type="text" inputMode="text"
          autocomplete="off" spellcheck={false} aria-label={`Initial ${i + 1} of 3`}
          aria-invalid={problem ? true : undefined} aria-describedby={problem && noteId ? noteId : undefined}
          onInput={ev => typed(i, ev)}
          onFocus={ev => (ev.currentTarget as HTMLInputElement).select?.()} />
      ))}
    </fieldset>
  );
}
