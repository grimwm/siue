/* The pieces every overlay shares: a key hint that reads the live key table,
 * and the title bar (title, optional close button, key footer). Components get
 * everything from props and context; none of them reaches into the game's
 * state or the page.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { createContext } from 'preact';
import type { ComponentChildren } from 'preact';
import { useContext, useLayoutEffect, useRef } from 'preact/hooks';
import { KeyChip } from '../../../_kit/ui/key-chip.tsx';

/** The key shown for an action: the first token its context lists, or the
 *  nth with `idx`. Empty when the action has no key. */
export type KeyHintFn = (ctx: string, action: string, idx?: number) => string;

/** A root component provides the page's key table to every Key below it. */
export const KeyHints = createContext<KeyHintFn>(() => '');

/** A live key label. `at` is "context:action" or "context:action:n". A bare
 *  one is the key chip on a button: the kit's KeyChip as a dark keycap the
 *  CSS shows only where there is a mouse or trackpad, hidden from screen
 *  readers (the button's words are its name). Otherwise it is the plain key
 *  name inside a sentence, or a cap with its own classes (`cls`, as on the
 *  close button's Q). */
export function Key({ at, bare, cls }: { at: string; bare?: boolean; cls?: string }) {
  const hint = useContext(KeyHints);
  const [ctx = '', action = '', idx] = at.split(':');
  const cap = hint(ctx, action, Number(idx ?? 0));
  if (bare) return <KeyChip label={cap} class="key" variant="tab" at={at} decorative />;
  return <span class={cls} data-keyhint={at}>{cap}</span>;
}

export interface OverlayHeadProps {
  /** The small line above the title (the shop's "Between rounds"). */
  kicker?: string;
  /** The id on the kicker line, where the game reads it. */
  kickerId?: string;
  titleId: string;
  title: string;
  /** Controls that sit in the bar beside the × (the weapon picker's toggle). */
  tools?: ComponentChildren;
  /** With a close handler the bar has the × button; its id is `closeId`. */
  closeId?: string;
  onClose?: () => void;
  navId: string;
  /** The key footer shows only while the panel overflows (the game toggles it). */
  scrollOnly?: boolean;
  /** The key footer's cells. */
  nav: ComponentChildren;
}

/** Title bar: title left, any tools then × right, key hints below, on the grid in game.css. */
export function OverlayHead(p: OverlayHeadProps) {
  const hint = useContext(KeyHints);
  const esc = hint('global', 'back', 0);
  return (
    <header class={p.tools ? 'ov-head has-tools' : 'ov-head'}>
      <div class="ov-title">
        {p.kicker !== undefined && <p class="kicker" id={p.kickerId}>{p.kicker}</p>}
        <h2 id={p.titleId}>{p.title}</h2>
      </div>
      {p.tools && <div class="ov-tools">{p.tools}</div>}
      {p.onClose && (
        <button type="button" class="ov-x" id={p.closeId} aria-label="Close" title={esc ? `Close (${esc})` : 'Close'}
          onClick={ev => { ev.currentTarget.blur(); p.onClose?.(); }}>
          <Key at="global:back" cls="kit-key-tab key" />
          <span class="x-glyph" aria-hidden="true">×</span>
        </button>
      )}
      <div class="nav-hint ov-keys" id={p.navId} data-scroll-only={p.scrollOnly ? '' : undefined}>{p.nav}</div>
    </header>
  );
}

/** The scroll keys that end a key footer: page and half page, and with
 *  `line` the line keys too. */
export function ScrollKeys({ line }: { line?: boolean }) {
  return (
    <>
      {line && <span class="scroll-keys"><Key at="scroll:lineDown" />/<Key at="scroll:lineUp" /> line</span>}
      <span class="scroll-keys"><Key at="scroll:pageUp" />/<Key at="scroll:pageDown" /> page</span>
      <span class="scroll-keys"><Key at="scroll:halfUp" />/<Key at="scroll:halfDown" /> half page</span>
    </>
  );
}

/** A click handler that drops the button's focus first (so a key press never
 *  re-triggers it), then calls `fn`. */
export function blurThen(fn: () => void) {
  return (ev: Event) => { (ev.currentTarget as HTMLElement).blur(); fn(); };
}

/** Keeps a scrolled panel where the player left it. Preact updates rows in
 *  place, and where a row can change height the browser's scroll anchoring may
 *  nudge the panel (it does on Linux fonts). So the hook remembers the scroll
 *  and puts it back after every redraw, except one where `moved` changed (a
 *  selection or cursor the component scrolled into view itself): that scroll
 *  stands and becomes the new one to keep. `target` names the scrolling
 *  element, which may sit outside the component (the veil or overlay it fills). */
export function useScrollKeep(target: () => HTMLElement | null | undefined, moved: unknown = 0): void {
  const scrolled = useRef(0);
  const seen = useRef(moved);
  const drawn = useRef(false);
  useLayoutEffect(() => {
    const el = target();
    if (!el) return undefined;
    const onScroll = () => { scrolled.current = el.scrollTop; };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  useLayoutEffect(() => {
    const el = target();
    if (!el) return;
    // A closed panel has no scroll, and the browser starts it at the top when
    // it reopens: there is nothing to keep.
    if (el.hidden) {
      seen.current = moved;
      scrolled.current = 0;
    } else if (!drawn.current || seen.current !== moved) {
      seen.current = moved;
      scrolled.current = el.scrollTop;
    } else if (el.scrollTop !== scrolled.current) {
      el.scrollTop = scrolled.current;
    }
    drawn.current = true;
  });
}
