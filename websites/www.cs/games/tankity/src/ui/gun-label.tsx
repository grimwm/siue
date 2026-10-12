/* The deck's Weapon button face: the loaded gun's shell and name over its
 * damage and blast size ("34 dmg · M"); screen readers also hear its count
 * and the rest of the rack. The button itself stays in index.html.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

export interface GunLabelProps {
  /** The loaded gun's arsenal key (for the icon), or null before a match. */
  gun: string | null;
  name: string;
  /** For readers: the count and the rest of the rack (" ×2 · also Shell ∞"). */
  sr: string;
  /** "34 dmg · M". */
  line: string;
  drawIcon: (canvas: HTMLCanvasElement, weapon: string) => void;
  /** Changes whenever the arsenal the icon is painted from does. */
  arsenalRev: number;
}

export function GunLabel(p: GunLabelProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { if (canvas.current && p.gun) p.drawIcon(canvas.current, p.gun); }, [p.gun, p.arsenalRev]);
  return (
    <>
      <span class="gun-top">
        <canvas class="gun-icon" aria-hidden="true" ref={canvas} />
        <span id="hud-weapon">{p.name}{p.sr && <span class="sr-only">{p.sr}</span>}</span>
      </span>
      <span class="gun-line">{p.line}</span>
    </>
  );
}

/** Draws (or redraws) the Weapon button's face into its slot. */
export function renderGunLabel(container: Element, props: GunLabelProps): void {
  render(<GunLabel {...props} />, container);
}
