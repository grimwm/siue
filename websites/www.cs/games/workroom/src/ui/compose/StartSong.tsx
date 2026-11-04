// Start A Song: four pictured starting points (Just A Beat, Beat + Bass, Full Band, Empty Song), each a button whose
// picture shows the instruments it brings. Picking one is an ordinary edit: Undo takes it back.
import type { Entry } from '../../catalogue.ts';
import { TEMPLATES, templateEntry } from '../../compose/templates.ts';
import type { TemplateId } from '../../compose/templates.ts';
import { PART_COLOURS } from '../../compose/edit.ts';
import { Glyph } from './Glyph.tsx';
import { Icon } from './InstrumentPicker.tsx';

/** The tiles' colours, in track order, as the tracks' own. */
const TILE = PART_COLOURS;

export function StartSong(p: { entries: readonly Entry[]; onPick(id: TemplateId): void; onHide(): void }) {
  return (
    <section class="cmp-start" data-start-song="" aria-label="Start A Song">
      <div class="cmp-start-head">
        <h2>Start A Song</h2>
        <p>Pick a starting point: a few tracks you can change. Undo takes it back.</p>
        <button type="button" class="cmp-link" data-start-hide="" onClick={p.onHide}>Hide</button>
      </div>
      <div class="cmp-templates">
        {TEMPLATES.map(t => {
          const pics = t.pictures.map(id => templateEntry(p.entries, id)).filter((e): e is Entry => !!e);
          return (
            <button type="button" class="cmp-tpl" data-template={t.id} onClick={() => p.onPick(t.id)}>
              <span class="cmp-tpl-pic" aria-hidden="true">
                {pics.length
                  ? pics.map((e, i) => <span class="cmp-tpl-tile" style={{ '--c': TILE[i % TILE.length] }}><Icon name={e.icon} size={20} /></span>)
                  : <span class="cmp-tpl-empty"><Glyph name="plus" size={18} /></span>}
              </span>
              <span class="cmp-tpl-txt"><b>{t.name}</b><small>{t.about}</small></span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
