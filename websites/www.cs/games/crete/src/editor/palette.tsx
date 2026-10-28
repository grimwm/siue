// The Island of Crete: the level editor's palette. One button per brush, in five groups (Terrain, Pieces, Figures,
// Hazards, Machines), each showing its sprite as a CSS background cut from the board's atlas (fx/sprites/tiles.png)
// and named for screen readers. The hazard and machine buttons show the facing they paint, which is the current
// brush's when it has one; Turn (O) rotates it. The fake and invisible walls look like wall and floor in the game,
// so their swatches carry a letter (HIDDEN_MARK), as their cells do on the editor's board. The page brush is the
// owner's only.
import atlasJson from '../../fx/sprites/tiles.json' with { type: 'json' };
import { Button } from '../../../_kit/ui/button.tsx';
import { HAZARDS, OBJECTS, PIECE_NAMES, TERRAIN } from '../puzzle/tiles.ts';
import type { Dir, HazardKind, ObjectKind, Template, Terrain } from '../puzzle/tiles.ts';
import type { Atlas } from '../board-plan.ts';
import type { Brush } from './model.ts';
import { EDITOR_KEYS } from './keys.ts';

export interface PaletteProps {
  brush: Brush;
  owner: boolean;
  onPick(b: Brush): void;
  onRotate(): void;
}

const atlas = atlasJson as Atlas;
/** Where the atlas image is, from the game page. */
const SHEET = 'url(fx/sprites/tiles.png)';
/** A swatch's side, in CSS pixels. */
const SWATCH = 32;

const ARROW: Record<Dir, string> = { up: '↑', right: '→', down: '↓', left: '←' };
/** Clockwise. */
const NEXT: Record<Dir, Dir> = { up: 'right', right: 'down', down: 'left', left: 'up' };

export const nextDir = (d: Dir): Dir => NEXT[d];

/** The editor's letter for a terrain that hides what it is: the game draws it as wall or floor. */
export const HIDDEN_MARK: Partial<Record<Terrain, string>> = { 'fake-wall': 'F', 'invisible-wall': 'I' };

/** The facing a brush paints, when it has one. */
export function dirOf(b: Brush): Dir | null {
  return b.kind === 'hazard' || b.kind === 'machine' ? b.dir : null;
}

const TERRAIN_NAMES: Partial<Record<Terrain, string>> = {
  exit: 'Exit', gate: 'Gate', safe: 'Safe zone', button: 'Button',
  'force-up': 'Force floor up', 'force-down': 'Force floor down', 'force-left': 'Force floor left', 'force-right': 'Force floor right',
  'toggle-open': 'Toggle wall, open', 'toggle-closed': 'Toggle wall, closed',
  'door-red': 'Red door', 'door-blue': 'Blue door', 'door-yellow': 'Yellow door', 'door-green': 'Green door',
};
const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const templateName = (t: Template): string => (t === 'block' ? 'block' : HAZARDS[t].name);

/** A brush's button id. */
export function brushId(b: Brush): string {
  switch (b.kind) {
    case 'terrain': return `brush-${b.t}`;
    case 'object': return `brush-${b.o}`;
    case 'hazard': return `brush-${b.h}`;
    case 'machine': return `brush-machine-${b.template}`;
    default: return `brush-${b.kind}`;
  }
}

/** A brush's accessible name; a hazard or machine ends with its facing. */
export function brushName(b: Brush): string {
  switch (b.kind) {
    case 'terrain': return TERRAIN_NAMES[b.t] ?? PIECE_NAMES[b.t] ?? cap(b.t);
    case 'object': return cap(OBJECTS[b.o].name);
    case 'player': return 'Theseus';
    case 'minotaur': return 'Minotaur';
    case 'erase': return 'Erase';
    case 'hazard': return `${HAZARDS[b.h].name}, facing ${b.dir}`;
    case 'machine': return `Clone machine (${templateName(b.template)}), facing ${b.dir}`;
    case 'page': return 'Story page';
  }
}

/** The sprites a brush's swatch shows, the top one first. */
function spritesOf(b: Brush): string[] {
  switch (b.kind) {
    case 'terrain': return [TERRAIN[b.t].sprites[0]!];
    case 'object': return [OBJECTS[b.o].sprite];
    case 'player': return ['theseus'];
    case 'minotaur': return ['minotaur'];
    case 'erase': return ['floor'];
    case 'hazard': return [HAZARDS[b.h].sprite];
    case 'machine': return [b.template === 'block' ? OBJECTS.block.sprite : HAZARDS[b.template].sprite, `clone-${b.dir}`];
    case 'page': return [OBJECTS.page.sprite];
  }
}

export interface PaletteGroup { name: string; brushes: Brush[] }

/** The palette's groups, the hazards and machines facing `dir`; the page brush only for the owner. */
export function paletteGroups(owner: boolean, dir: Dir): PaletteGroup[] {
  const terrain = (Object.keys(TERRAIN) as Terrain[]).filter(t => t !== 'clone');
  const pieces = (Object.keys(OBJECTS) as ObjectKind[]).filter(o => o !== 'page');
  const kinds = Object.keys(HAZARDS) as HazardKind[];
  const figures: Brush[] = [{ kind: 'player' }, { kind: 'minotaur' }, { kind: 'erase' }];
  if (owner) figures.push({ kind: 'page', id: '' });
  return [
    { name: 'Terrain', brushes: terrain.map(t => ({ kind: 'terrain', t })) },
    { name: 'Pieces', brushes: pieces.map(o => ({ kind: 'object', o })) },
    { name: 'Figures', brushes: figures },
    { name: 'Hazards', brushes: kinds.map(h => ({ kind: 'hazard', h, dir })) },
    { name: 'Machines', brushes: (['block', ...kinds] as Template[]).map(template => ({ kind: 'machine', template, dir })) },
  ];
}

function Swatch({ b }: { b: Brush }) {
  const frames = spritesOf(b).map(name => atlas.sprites[name]).filter(s => s !== undefined);
  return (
    <span class="swatch" aria-hidden="true">
      <span class="swatch-img" style={{
        width: `${atlas.cell}px`, height: `${atlas.cell}px`, transform: `scale(${SWATCH / atlas.cell})`,
        backgroundImage: frames.map(() => SHEET).join(', '),
        // The cell under the rise: a sprite's frame is the rise, then the cell.
        backgroundPosition: frames.map(s => `-${s.x}px -${s.y + atlas.rise}px`).join(', '),
      }} />
      {b.kind === 'erase' && <span class="brush-mark erase-mark">✕</span>}
      {b.kind === 'terrain' && HIDDEN_MARK[b.t] && <span class="brush-mark">{HIDDEN_MARK[b.t]}</span>}
      {dirOf(b) && <span class="brush-dir">{ARROW[dirOf(b)!]}</span>}
    </span>
  );
}

export function Palette(p: PaletteProps) {
  const dir = dirOf(p.brush);
  const picked = brushId(p.brush);
  return (
    <div id="editor-palette" class="palette">
      {paletteGroups(p.owner, dir ?? 'up').map(g => (
        <section class="palette-group" key={g.name}>
          <h3>{g.name}</h3>
          <div class="palette-row">
            {g.brushes.map(b => (
              <Button key={brushId(b)} id={brushId(b)} class="brush" label={brushName(b)} title={brushName(b)}
                pressed={brushId(b) === picked} onClick={() => p.onPick(b)}>
                <Swatch b={b} />
              </Button>
            ))}
          </div>
        </section>
      ))}
      <Button id="brush-rotate" class="brush-rotate" disabled={dir === null} keyLabel={EDITOR_KEYS.rotate.label} onClick={p.onRotate}>
        Turn ↻
      </Button>
    </div>
  );
}
