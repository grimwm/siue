// A track's header, the same whether the track is open or not: a grip to drag it up or down (or focus it and press ↑ or
// ↓), a caret to open or close it, its instrument's tile (the track menu: rename, duplicate, change the instrument,
// clear, remove), its name, and a speaker that mutes it (crossed out while it is muted).
import { movePart, renamePart } from '../../compose/edit.ts';
import type { Part } from '../../compose/doc.ts';
import { isMuted, setMuted } from '../../compose/mutes.ts';
import type { Ctl } from './ctl.ts';
import { Glyph } from './Glyph.tsx';
import { Icon } from './InstrumentPicker.tsx';

export function TrackHead(p: { c: Ctl; part: Part }) {
  const { c, part } = p;
  const renaming = c.renaming === part.id;
  const setRenaming = (on: boolean): void => c.setRenaming(on ? part.id : null);
  const open = c.open.has(part.id);
  const muted = isMuted(part, c.doc);
  const entry = c.entryOf(part);
  const kind = part.vocal ? 'Vocal Track' : entry?.pieces ? 'Drums' : entry?.name ?? part.instrument;
  const commit = (v: string): void => {
    setRenaming(false);
    if (v.trim() && v.trim() !== part.name) c.apply(renamePart(c.doc, part.id, v));
  };
  return (
    <div class="cmp-th" data-track-head={part.id}>
      <Grip c={c} part={part} />
      <button type="button" class="cmp-icon caret" aria-expanded={open} aria-label={`${open ? 'Collapse' : 'Expand'} ${part.name}`}
        title={open ? 'Collapse: hide the notes' : 'Expand: show the notes'} onClick={() => c.toggleOpen(part.id)}>
        <Glyph name={open ? 'chev-d' : 'chev-r'} />
      </button>
      <button type="button" class="cmp-tile tile" style={{ '--c': part.color }} aria-label={`Track Menu: ${part.name}`} aria-haspopup="dialog" data-pop-anchor=""
        data-track-menu={part.id} title="Rename, duplicate or change the instrument" onClick={e => c.openPop('track', e.currentTarget as HTMLElement, part.id)}>
        {part.vocal ? <Glyph name="mic" /> : <Icon name={entry?.icon ?? 'keys'} size={22} />}
        <span class="dots" aria-hidden="true"><Glyph name="more" size={12} /></span>
      </button>
      {renaming ? (
        <span class="name"><input type="text" class="min-h-11 w-full min-w-0 rounded-md border border-amber bg-well px-2 text-ink" value={part.name} maxLength={60}
          aria-label="Track Name" ref={el => { if (el && document.activeElement !== el) { el.focus(); el.select?.(); } }}
          onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') commit((e.target as HTMLInputElement).value); }}
          onBlur={e => commit((e.target as HTMLInputElement).value)} /></span>
      ) : (
        <span class="name" onDblClick={() => setRenaming(true)}>
          <b data-track-name="">{part.name}</b>
          <small>{muted ? 'Muted' : kind}</small>
        </span>
      )}
      <button type="button" class="cmp-icon mute" aria-pressed={muted} data-mute={part.id} aria-label={`${muted ? 'Unmute' : 'Mute'} ${part.name}`}
        title={`${muted ? 'Unmute' : 'Mute'} ${part.name}`} onClick={() => c.apply(setMuted(c.doc, part.id, !muted))}>
        <Glyph name={muted ? 'spk-off' : 'spk'} />
      </button>
    </div>
  );
}

/** The grip: drag the track up or down (a finger too, at once), or press ↑ or ↓ on it. One Undo step. */
function Grip(p: { c: Ctl; part: Part }) {
  const { c, part } = p;
  const index = c.doc.parts.findIndex(x => x.id === part.id);
  const down = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget as HTMLElement;
    btn.setPointerCapture?.(e.pointerId);
    const tl = btn.closest('.cmp-tl-in') as HTMLElement | null;
    if (!tl) return;
    const d: { live: boolean; at: number | null; ghost?: HTMLElement; line?: HTMLElement; groups?: { id: string; top: number; bottom: number }[] } = { live: false, at: null };
    const y0 = e.clientY;
    const groups = () => c.doc.parts.map(x => {
      const rows = [...tl.querySelectorAll<HTMLElement>(`[data-track-row="${x.id}"]`)];
      return { id: x.id, top: Math.min(...rows.map(r => r.offsetTop)), bottom: Math.max(...rows.map(r => r.offsetTop + r.offsetHeight)) };
    });
    const move = (ev: PointerEvent): void => {
      if (!d.live) {
        if (Math.abs(ev.clientY - y0) < 4) return;
        d.live = true;
        d.groups = groups();
        d.ghost = document.createElement('div');
        d.ghost.className = 'cmp-row-ghost';
        d.ghost.textContent = part.name;
        d.ghost.style.left = `${tl.getBoundingClientRect().left + 8}px`;
        d.ghost.style.top = '0px';
        document.body.append(d.ghost);
        d.line = document.createElement('div');
        d.line.className = 'cmp-insert-row';
        tl.append(d.line);
        for (const r of tl.querySelectorAll(`[data-track-row="${part.id}"]`)) r.classList.add('lifting');
      }
      d.ghost!.style.transform = `translateY(${ev.clientY - 20}px)`;
      const y = ev.clientY - tl.getBoundingClientRect().top;
      const g = d.groups!;
      let at = g.findIndex(x => y < (x.top + x.bottom) / 2);
      if (at < 0) at = g.length;
      d.at = at;
      d.line!.style.top = `${at < g.length ? g[at]!.top : g[g.length - 1]!.bottom}px`;
    };
    const up = (ev: PointerEvent): void => {
      btn.removeEventListener('pointermove', move);
      btn.removeEventListener('pointerup', up);
      btn.removeEventListener('pointercancel', up);
      if (!d.live) return;
      d.ghost?.remove();
      d.line?.remove();
      for (const r of tl.querySelectorAll('.lifting')) r.classList.remove('lifting');
      if (ev.type === 'pointerup' && d.at !== null) c.apply(movePart(c.doc, part.id, d.at));
    };
    btn.addEventListener('pointermove', move);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
  };
  return (
    <button type="button" class="grip" data-grip={part.id} aria-label={`Move ${part.name}`} title="Drag to move this track up or down"
      onPointerDown={down}
      onKeyDown={e => {
        const d = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
        if (!d) return;
        e.preventDefault();
        e.stopPropagation();
        c.apply(movePart(c.doc, part.id, index + d + (d > 0 ? 1 : 0)));
        requestAnimationFrame(() => (document.querySelector(`[data-grip="${part.id}"]`) as HTMLElement | null)?.focus());
      }}>
      <Glyph name="grip" size={18} />
    </button>
  );
}
