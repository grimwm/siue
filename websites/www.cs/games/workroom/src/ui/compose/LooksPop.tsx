// Colors And Style: the lights (Dark or Light), the colors (five palettes) and the style (five sets of shapes), chosen
// apart. Each Colors card shows its palette in the page's style; each Style card shows its style in the page's colors.
import { COLOR_OPTIONS, MODES, STYLE_OPTIONS } from '../../compose/looks.ts';
import type { Look } from '../../compose/looks.ts';
import { Glyph } from './Glyph.tsx';
import { Pop, PopSection } from './Pop.tsx';

/** A strip of the palette's grounds and inks, and its six track colors as cables. */
const GROUNDS = ['--color-ground', '--color-panel', '--color-well', '--color-rule', '--color-dim', '--color-ink'];
const CABLES = ['--t1', '--t2', '--t3', '--t4', '--t5', '--t6'];

export function LooksPop(p: { look: Look; onLook(l: Look): void; anchor: HTMLElement | null; onClose(): void }) {
  const { look } = p;
  return (
    <Pop title="Colors And Style" anchor={p.anchor} onClose={p.onClose} name="looks">
      <p class="text-sm text-dim">Pick colors and a style separately: any colors work with any style. Your song and its sounds stay the same.</p>
      <PopSection title="Lights">
        <span class="cmp-seg self-start" role="group" aria-label="Lights">
          {MODES.map(m => (
            <button type="button" aria-pressed={look.mode === m.id} data-look-mode={m.id} onClick={() => p.onLook({ ...look, mode: m.id })}>{m.name}</button>
          ))}
        </span>
      </PopSection>
      <PopSection title="Colors">
        <p class="text-sm text-dim">The paint: backgrounds, text and highlights.</p>
        <div class="cmp-looks">
          {COLOR_OPTIONS.map(o => (
            <button type="button" class="cmp-look" aria-pressed={look.colors === o.id} data-look-colors={o.id} onClick={() => p.onLook({ ...look, colors: o.id })}>
              <span class="cmp-swatch" data-colors={o.id} data-mode={look.mode} aria-hidden="true">
                <span class="ground">{GROUNDS.map(c => <i style={{ background: `var(${c})` }} />)}</span>
                <span class="pad"><Glyph name="play" size={22} /></span>
                <span class="read">Bar 3 · Beat 2</span>
                <span class="cables">{CABLES.map(c => <i style={{ background: `var(${c})` }} />)}</span>
              </span>
              <span class="name"><b>{o.name}</b><small>{o.about}</small></span>
            </button>
          ))}
        </div>
      </PopSection>
      <PopSection title="Style">
        <p class="text-sm text-dim">The shapes: lettering, buttons, the readout and the meters, shown here in your colors.</p>
        <div class="cmp-looks">
          {STYLE_OPTIONS.map(o => (
            <button type="button" class="cmp-look" aria-pressed={look.style === o.id} data-look-style={o.id} onClick={() => p.onLook({ ...look, style: o.id })}>
              <span class="cmp-stylecard" data-style={o.id} aria-hidden="true">
                <span class="cmp-btn cmp-play"><Glyph name="play" size={18} /><Glyph name="reel" size={18} class="reel" />Play</span>
                <span class="read">Bar 3</span>
                <span class="cmp-meter"><i /></span>
              </span>
              <span class="name"><b>{o.name}</b><small>{o.about}</small></span>
            </button>
          ))}
        </div>
      </PopSection>
    </Pop>
  );
}
