// The Island of Crete: the toast's line. Words as words; a tool's button named by the picture that button shows
// (src/ui/strip.tsx): the Modern icon or the Classic sprite, in the board's look, the size of the line's text, with
// the tool's name for a screen reader.
import { render } from 'preact';
import { ENTRY } from '../dictionary.ts';
import { TOOL_ALT } from '../tool-effects.ts';
import type { Said } from '../tool-effects.ts';
import { Picture } from './sprite.tsx';
import type { Pics } from './sprite.tsx';

/** A tool's picture in the line, in CSS pixels: 1.25 times the toast's 0.9rem text. */
export const TOAST_PIC = 18;

export function ToastLine({ said, pics }: { said: Said; pics: Pics }) {
  if (typeof said === 'string') return <>{said}</>;
  return (
    <>
      {said.map((p, i) => typeof p === 'string' ? p : (
        <span key={i} class="toast-pic" role="img" aria-label={TOOL_ALT[p.tool]} data-tool={p.tool}>
          <Picture pics={pics} entry={ENTRY[p.tool]!} size={TOAST_PIC} alone />
        </span>
      ))}
    </>
  );
}

export function renderToast(root: Element, said: Said, pics: Pics): void {
  render(<ToastLine said={said} pics={pics} />, root);
}
