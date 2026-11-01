// New Piece: its title and its project (one of the studio's own, or a new one), before the editor opens on it.
import { useState } from 'preact/hooks';
import { DEFAULT_PROJECT, pieceIdFor, projectFor } from '../../compose/newpiece.ts';
import { Button } from '../console/Button.tsx';
import { Panel } from '../console/Panel.tsx';

export interface NewPieceProps {
  taken: readonly string[];
  projects: readonly { id: string; name: string }[];
  onStart(piece: { id: string; title: string }, project: { id: string; name: string }): void;
  /** The title to start with (an imported file's), which the person can change. */
  title?: string;
  /** What the piece starts with, said under the heading ("4 parts from quartet.musicxml"). */
  note?: string;
}

export function NewPiece(p: NewPieceProps) {
  const [title, setTitle] = useState(p.title ?? '');
  const [project, setProject] = useState(p.projects[0]?.name ?? DEFAULT_PROJECT.name);
  const clean = title.trim().slice(0, 120);
  return (
    <Panel title="New Piece" class="mx-auto max-w-xl">
      {p.note ? <p data-new-piece-note="" class="mb-3 text-sm text-dim">{p.note}</p> : null}
      <form class="grid gap-3" onSubmit={e => { e.preventDefault(); if (clean) p.onStart({ id: pieceIdFor(clean, new Set(p.taken)), title: clean }, projectFor(project, p.projects)); }}>
        <label class="grid gap-1">Title
          <input type="text" name="title" required maxLength={120} value={title} onInput={e => setTitle((e.target as HTMLInputElement).value)}
            class="min-h-11 rounded-md border border-rule bg-well px-3 text-ink" /></label>
        <label class="grid gap-1">Project
          <input type="text" name="project" list="new-piece-projects" maxLength={80} value={project} onInput={e => setProject((e.target as HTMLInputElement).value)}
            class="min-h-11 rounded-md border border-rule bg-well px-3 text-ink" /></label>
        <datalist id="new-piece-projects">{p.projects.map(x => <option value={x.name} />)}</datalist>
        <p class="text-sm text-dim">A project groups pieces on the pieces page. Pick one of yours or type a new name.</p>
        <Button variant="primary" submit disabled={!clean}>Start Composing</Button>
      </form>
    </Panel>
  );
}
