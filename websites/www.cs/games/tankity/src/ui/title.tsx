/* The title card over the dimmed demo, on the kit's Dialog: Play, Play with
 * friends, Tutorial, a Settings link, the three-letter initials, and Your
 * games when this browser holds a seat in a room. Share sits beside Play. The game
 * owns whether it shows, the initials and what each button does; this draws
 * them and reports. Its mount point (#title-root) stays in index.html.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { ShareIcon } from '../../../_kit/ui/share-icon.tsx';
import { isBackKey } from '../../../_kit/keys.ts';
import type { ShareState } from '../../../_kit/install.ts';
import { KeyHints, Key, blurThen } from './chrome.tsx';
import { InitialsPicker } from './initials-picker.tsx';
import type { KeyHintFn } from './chrome.tsx';
import { YourGames } from './games.tsx';
import type { GamesView } from './games.tsx';

export interface TitleProps {
  keyHint: KeyHintFn;
  /** The card shows; the demo plays dimmed behind it. */
  open: boolean;
  /** The saved initials, three uppercase letters. */
  initials: string;
  /** A change puts the saved set back in the boxes (the card opening). */
  initialsRev?: number;
  /** Why the last typed set was refused, or empty. */
  problem: string;
  /** An installed app that could not close itself says how, or empty. */
  hint: string;
  /** The menu is open (the Settings link's aria-expanded). */
  settingsOpen: boolean;
  /** All three boxes hold a letter: the set, uppercase. The game checks it. */
  onInitials: (word: string) => void;
  onPlay: () => void;
  onFriends: () => void;
  onTutorial: () => void;
  onSettings: () => void;
  /** Share: "Link copied" is up, or the address is shown to copy by hand. */
  shareState: ShareState;
  /** The address Share hands out: the game's /play/tankity/ page. */
  shareUrl: string;
  onShare: () => void;
  onCloseShare: () => void;
  /** The rooms this browser sits in; the list shows only when there are some. */
  games?: GamesView;
}

export function Title(p: TitleProps) {
  const field = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (p.shareState !== 'field') return;
    field.current?.focus();
    field.current?.select?.();
  }, [p.shareState]);
  // No onDismiss: Q opens the settings menu over the card, never closes it.
  return (
    <KeyHints.Provider value={p.keyHint}>
      <Dialog open={p.open} id="title-card" veilClass="title-veil" panelClass="title-card" titleId="title-h"
        title="Operation Tankity" describedBy="title-tag" focusId="title-play">
        <p id="title-tag" class="title-tag">Mind the wind. Flatten the drone battery.</p>
        <div class="title-primary">
          <button type="button" id="title-play" class="title-play btn-primary" onClick={blurThen(p.onPlay)}>
            <span aria-hidden="true">▶ </span>Play <Key at="global:new" bare />
          </button>
          <button type="button" id="title-share" class="title-share" aria-label="Share" title="Share a link to this game"
            onClick={blurThen(p.onShare)}>
            <ShareIcon size={22} />
          </button>
        </div>
        <p class="title-note title-share-status" id="title-share-status" role="status">{p.shareState === 'copied' ? 'Link copied' : ''}</p>
        {p.shareState === 'field' && (
          <input id="title-share-url" class="title-share-url" type="text" readOnly value={p.shareUrl} aria-label="Link to this game"
            ref={field} onKeyDown={ev => {
              if (!isBackKey(ev)) return;
              ev.preventDefault();
              ev.stopPropagation();
              if (!ev.repeat) p.onCloseShare();
            }} />
        )}
        <div class="title-row">
          <button type="button" id="rooms-open" onClick={blurThen(p.onFriends)}>Play with friends <Key at="global:rooms" bare /></button>
          <button type="button" id="tutorial-open" class="title-tutorial" onClick={blurThen(p.onTutorial)}>
            <span class="title-tutorial-icon" aria-hidden="true">🎓</span>Tutorial <Key at="global:tutorial" bare />
          </button>
        </div>
        <InitialsPicker idPrefix="title" initials={p.initials} rev={p.initialsRev} onInitials={p.onInitials}
          problem={p.problem} noteId="title-initials-note" />
        <p class="title-note" id="title-initials-note" role="status">{p.problem}</p>
        {p.games && p.games.rows.length > 0 && <YourGames id="your-games" {...p.games} />}
        {p.hint && <p class="title-hint" id="title-hint" role="status">{p.hint}</p>}
        <button type="button" id="title-settings" class="title-settings" aria-haspopup="dialog" aria-expanded={p.settingsOpen}
          onClick={blurThen(p.onSettings)}>Settings <Key at="global:back" bare /></button>
      </Dialog>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the title card into its mount point. */
export function renderTitle(container: Element, props: TitleProps): void {
  render(<Title {...props} />, container);
}
