// A new piece's id and project: the id made from its title (lowercase letters, digits and hyphens, as every piece id is)
// and kept apart from the studio's other pieces; the project one of the studio's own by name, or a new one. DOM-free.
import { GENERAL_PIECE } from '../note.ts';

export const DEFAULT_PROJECT = { id: 'my-pieces', name: 'My Pieces' } as const;
/** The workroom's general notes have their own piece id (Store::GENERAL_PIECE): no piece may have it. */
const RESERVED = new Set([GENERAL_PIECE]);

const slug = (text: string, max: number): string =>
  text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max).replace(/-+$/, '');

/** The id for a piece called `title`, not one of `taken`: "my-first-tune", then "my-first-tune-2". */
export function pieceIdFor(title: string, taken: ReadonlySet<string>): string {
  const base = slug(title, 40) || 'piece';
  const free = (id: string): boolean => !taken.has(id) && !RESERVED.has(id);
  if (free(base)) return base;
  for (let n = 2; ; n++) if (free(`${base}-${n}`)) return `${base}-${n}`;
}

/** The project named `name`: one of the studio's own when the name is one of theirs, else a new one; My Pieces when blank. */
export function projectFor(name: string, projects: readonly { id: string; name: string }[]): { id: string; name: string } {
  const clean = name.trim().slice(0, 80);
  if (clean === '') return { ...DEFAULT_PROJECT };
  const known = projects.find(p => p.name.toLowerCase() === clean.toLowerCase());
  if (known) return { ...known };
  const ids = new Set(projects.map(p => p.id));
  const base = slug(clean, 40) || DEFAULT_PROJECT.id;
  let id = base;
  for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
  return { id, name: clean };
}
