// The Island of Crete: the editor's Share panel. Share turns a proven, hard-enough level into a link (`shareLink`);
// the owner also edits the campaign fields (id, title, intro) and copies the level in the campaign's trials.ts form
// (`trialsEntry`). The link's checks run in a fixed order, and a link that does not open again here is never shown.
import { useRef, useState } from 'preact/hooks';
import { Button } from '../../../_kit/ui/button.tsx';
import { validInitials } from '../../../_kit/initials.ts';
import { ENCODED_MAX, LINK_MESSAGES, MAX_LINE, encodeLink } from '../share/link.ts';
import { openLink } from '../share/open.ts';
import { levelCode, sharedName } from '../share/name.ts';
import { lineOf } from '../puzzle/cache.ts';
import { sharedProblems } from '../puzzle/difficulty.ts';
import type { Difficulty } from '../puzzle/difficulty.ts';
import { toText } from './model.ts';
import type { Draft } from './model.ts';

export const INITIALS_MESSAGE = 'Pick three letters that are not a word on the blocked list.';
export const COPY_FALLBACK = 'Press Ctrl+C to copy.';

/** The link for the level text `draftText` (the draft's share text) and the name it goes by, or what is wrong. `base`
 *  is the page's URL without its hash; `d` is the level's measure, whose line and rating a link is allowed to carry. */
export async function shareLink(
  base: string, draftText: string, d: Difficulty, initials: string, best: number | null,
): Promise<{ ok: true; url: string; name: string } | { ok: false; message: string }> {
  const by = validInitials(initials);
  if (by === null) return { ok: false, message: INITIALS_MESSAGE };
  const problems = sharedProblems(d);
  if (problems.length > 0 || !d.solved) return { ok: false, message: `Not shareable yet: ${problems.join('; ')}.` };
  const line = lineOf(d.line);
  if (line === null) return { ok: false, message: "The solver's line could not be read." };
  if (line.length > MAX_LINE) return { ok: false, message: "This level's quickest win is too long to share." };
  const fragment = await encodeLink({ text: draftText, line, initials: by, best });
  if (fragment.length - 'L1.'.length > ENCODED_MAX) return { ok: false, message: 'This level is too large to share as a link.' };
  // The link is shown only once it opens: its line replays to a win on the level it carries.
  const opened = await openLink(fragment);
  if (!opened.ok) return { ok: false, message: opened.error === 'damaged' ? "The solver's line could not be read." : LINK_MESSAGES[opened.error] };
  return { ok: true, url: `${base}#${fragment}`, name: sharedName(await levelCode(draftText), by) };
}

/** `{ id: '<id>', text: \`<campaign text>\` },`, the form of an entry in src/puzzle/trials.ts: the text's backslashes,
 *  backticks and `${` escaped, and the id's backslashes, quotes and line breaks. An empty id reads `trial-new`. */
export function trialsEntry(d: Draft): string {
  const text = toText(d, false).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  const id = (d.id.trim() || 'trial-new').replace(/[\\']/g, c => `\\${c}`).replace(/\r/g, '\\r').replace(/\n/g, '\\n')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return `{ id: '${id}', text: \`${text}\` },`;
}

export interface ShareProps {
  /** The three letters as typed. */
  initials: string;
  /** A share is under way (its Check may be running). */
  busy: boolean;
  /** What the last Share said when it made no link; '' otherwise. */
  message: string;
  /** The link for the draft as it stands, once made. */
  link: { url: string; name: string } | null;
  owner: boolean;
  draft: Draft;
  onInitials(raw: string): void;
  onShare(): void;
  onId(id: string): void;
  onTitle(title: string): void;
  onIntro(intro: string): void;
}

/** Puts `text` on the clipboard; when that is not allowed, selects `field` and says to copy by hand. */
async function copyText(text: string, field: HTMLInputElement | HTMLTextAreaElement | null): Promise<string> {
  try {
    await navigator.clipboard.writeText(text);
    return 'Copied.';
  } catch {
    field?.focus();
    field?.select();
    return COPY_FALLBACK;
  }
}

/** The made link: its name, the field, Copy and what Copy said. Keyed by the link, so a new link starts uncopied. */
function LinkBlock(p: { link: { url: string; name: string } }) {
  const field = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState('');
  return (
    <div class="share-result">
      <p id="share-name">{p.link.name}</p>
      <input id="share-link" ref={field} type="text" readOnly value={p.link.url} aria-label="Link"
        onFocus={ev => ev.currentTarget.select()} />
      <Button id="share-copy" onClick={() => { void copyText(p.link.url, field.current).then(setCopied); }}>Copy</Button>
      {copied !== '' && <p id="share-copied" aria-live="polite">{copied}</p>}
    </div>
  );
}

/** The owner's Copy for trials.ts and the entry it made. Keyed by the draft's text, so an edit clears the entry. */
function EntryBlock(p: { draft: Draft }) {
  const entry = useRef<HTMLTextAreaElement>(null);
  const [entryText, setEntryText] = useState<string | null>(null);
  const [entryCopied, setEntryCopied] = useState('');
  return (
    <>
      <Button id="owner-export" onClick={() => {
        const text = trialsEntry(p.draft);
        setEntryText(text);
        void copyText(text, entry.current).then(setEntryCopied);
      }}>Copy for trials.ts</Button>
      {entryText !== null && (
        <>
          <textarea id="owner-entry" ref={entry} readOnly value={entryText} aria-label="Level entry" onFocus={ev => ev.currentTarget.select()} />
          {entryCopied !== '' && <p id="owner-copied" aria-live="polite">{entryCopied}</p>}
        </>
      )}
    </>
  );
}

export function SharePanel(p: ShareProps) {
  return (
    <section id="share-panel" class="share-panel" aria-label="Share">
      <h3>Share</h3>
      <label>Your Initials <input id="share-initials" type="text" maxLength={3} autocomplete="off" spellcheck={false} value={p.initials}
        onInput={ev => {
          const up = ev.currentTarget.value.toUpperCase();
          ev.currentTarget.value = up;
          p.onInitials(up);
        }} /></label>
      <Button id="share-run" disabled={p.busy} onClick={p.onShare}>Share</Button>
      {p.message !== '' && <p id="share-message" class="share-message" aria-live="polite">{p.message}</p>}
      {p.link && <LinkBlock key={p.link.url} link={p.link} />}
      {p.owner && (
        <div id="owner-fields" class="owner-fields">
          <label>Id <input id="owner-id" type="text" key={`i${p.draft.id}`} defaultValue={p.draft.id} onChange={ev => p.onId(ev.currentTarget.value)} /></label>
          <label>Title <input id="owner-title" type="text" key={`t${p.draft.title}`} defaultValue={p.draft.title} onChange={ev => p.onTitle(ev.currentTarget.value)} /></label>
          <label>Intro <textarea id="owner-intro" key={`n${p.draft.intro}`} defaultValue={p.draft.intro} onChange={ev => p.onIntro(ev.currentTarget.value)} /></label>
          <EntryBlock key={toText(p.draft, false)} draft={p.draft} />
        </div>
      )}
    </section>
  );
}
