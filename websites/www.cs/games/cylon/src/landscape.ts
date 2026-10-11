/* Cylon Defense: the landscape writers.
 *
 * The page's backdrop while a run is live is a set of CSS variables on <body>
 * (the fracture and ash hotspots, the land's shift, scale and rotation) and the
 * debris letters carry their own blast vectors. This module writes them:
 * rearrangeLandscape aims the blast hotspot at an impact (and, for a full nuke,
 * reshuffles the whole backdrop), disruptGlyphs kicks the letters next to it,
 * and clearLandscapeVars puts the backdrop back. It reads each variable's
 * current value from the body, so a blast blends from whatever the last one left.
 *
 * It touches only <body>, the debris elements and `window`; the page's scroll
 * offsets and the reduced-motion flag come in as arguments. Browser-only: it
 * compiles in the DOM program. */

export interface LandscapeDeps {
  /** With reduced motion the page is never scattered, so no letter is kicked. */
  reduceMotion: boolean;
  scrollX: () => number;
  scrollY: () => number;
}

export interface LandscapeOptions {
  /** On-screen letter kick radius, in px, overriding the weapon's own. */
  radius?: number;
}

export interface Landscape {
  /** A uniform draw in [min, max). */
  randRange(min: number, max: number): number;
  /** A blast at a viewport position: the hotspot, and for a full nuke the whole backdrop, then the letters. */
  rearrangeLandscape(clientX: number, clientY: number, scale?: number, opts?: LandscapeOptions): void;
  /** The same blast, given a page position. */
  rearrangeLandscapePage(pageX: number, pageY: number, scale?: number, opts?: LandscapeOptions): void;
  /** Kicks the debris letters (and, for a full nuke, blocks and panels) near a page position. */
  disruptGlyphs(pageX: number, pageY: number, scale?: number, radiusOverride?: number | null): void;
  /** Removes every variable the blasts wrote, so the backdrop returns to its CSS defaults. */
  clearLandscapeVars(): void;
}

export function createLandscape(d: LandscapeDeps): Landscape {
  const { reduceMotion, scrollX, scrollY } = d;

  function randRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  function readBodyNum(name: string, fallback: number): number {
    const raw = document.body.style.getPropertyValue(name)
      || getComputedStyle(document.body).getPropertyValue(name);
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  }

  function blendToward(current: number, target: number, scale: number): number {
    return current + (target - current) * scale;
  }

  /** Blast radius (page px) around the visible impact — scaled by weapon power. */
  function disruptRadiusForScale(scale: number): number {
    const s = Math.max(0.05, Math.min(1.6, scale));
    // shot≈0.22 → ~130px · missile≈0.32 → ~150px · grenade≈0.48 → ~180px · nuke≈1.4 → ~350px
    return 90 + s * 180;
  }

  /** Aim the crack/ash hotspot at the impact without rewriting the whole scar field. */
  function aimBlastHotspot(clientX: number, clientY: number, scale: number): void {
    const body = document.body;
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    const s = Math.max(0.05, Math.min(1, scale));
    const blastX = Math.max(8, Math.min(92, (clientX / vw) * 100));
    const blastY = Math.max(10, Math.min(90, (clientY / vh) * 100));
    const blend = Math.min(1, 0.55 + s * 0.6);
    body.style.setProperty('--blast-x', `${blendToward(readBodyNum('--blast-x', 50), blastX, blend).toFixed(1)}%`);
    body.style.setProperty('--blast-y', `${blendToward(readBodyNum('--blast-y', 48), blastY, blend).toFixed(1)}%`);
    body.style.setProperty('--land-morph-ms', `${Math.round(280 + s * 420)}ms`);
  }

  /**
   * Reshuffle fracture / ash overlays and nudge nearby debris.
   * Global crack/ash rewrite only for full nukes (scale ≈ 1).
   * Grenade / Raptor / shots stay local letter AoE + blast hotspot.
   * @param opts optional on-screen letter kick radius override
   */
  function rearrangeLandscape(clientX: number, clientY: number, scale = 1, opts: LandscapeOptions = {}): void {
    if (!document.body.classList.contains('cylon-world-ended') && scale < 0.9) {
      if (scale < 0.99) return;
    }
    const s = Math.max(0.05, Math.min(1, scale));
    const pageX = clientX + scrollX();
    const pageY = clientY + scrollY();
    const radiusOpt: number | null = Number.isFinite(opts.radius) ? opts.radius! : null;

    // Non-nuke weapons: local letter AoE + hotspot — never rewrite the whole backdrop
    if (s < 0.9) {
      aimBlastHotspot(clientX, clientY, s);
      disruptGlyphs(pageX, pageY, s, radiusOpt);
      return;
    }

    const body = document.body;
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;
    const blastX = Math.max(8, Math.min(92, (clientX / vw) * 100));
    const blastY = Math.max(10, Math.min(90, (clientY / vh) * 100));

    body.style.setProperty('--blast-x', `${blendToward(readBodyNum('--blast-x', 50), blastX, Math.min(1, s * 1.15)).toFixed(1)}%`);
    body.style.setProperty('--blast-y', `${blendToward(readBodyNum('--blast-y', 48), blastY, Math.min(1, s * 1.15)).toFixed(1)}%`);
    body.style.setProperty('--crack-a', `${blendToward(readBodyNum('--crack-a', 118), randRange(70, 160), s).toFixed(1)}deg`);
    body.style.setProperty('--crack-b', `${blendToward(readBodyNum('--crack-b', 28), randRange(8, 70), s).toFixed(1)}deg`);
    body.style.setProperty('--crack-c', `${blendToward(readBodyNum('--crack-c', 155), randRange(120, 200), s).toFixed(1)}deg`);
    body.style.setProperty('--crack-grain', `${blendToward(readBodyNum('--crack-grain', -18), randRange(-40, 12), s).toFixed(1)}deg`);
    body.style.setProperty('--scar-1', `${blendToward(readBodyNum('--scar-1', 42), randRange(28, 48), s).toFixed(1)}%`);
    body.style.setProperty('--scar-2', `${blendToward(readBodyNum('--scar-2', 61), randRange(52, 72), s).toFixed(1)}%`);
    body.style.setProperty('--scar-3', `${blendToward(readBodyNum('--scar-3', 33), randRange(22, 42), s).toFixed(1)}%`);
    body.style.setProperty('--scar-4', `${blendToward(readBodyNum('--scar-4', 72), randRange(58, 82), s).toFixed(1)}%`);
    body.style.setProperty('--scar-5', `${blendToward(readBodyNum('--scar-5', 18), randRange(12, 30), s).toFixed(1)}%`);
    body.style.setProperty('--scar-6', `${blendToward(readBodyNum('--scar-6', 78), randRange(68, 88), s).toFixed(1)}%`);
    body.style.setProperty('--ash-1-x', `${blendToward(readBodyNum('--ash-1-x', 18), randRange(8, 40), s).toFixed(1)}%`);
    body.style.setProperty('--ash-1-y', `${blendToward(readBodyNum('--ash-1-y', 22), randRange(10, 40), s).toFixed(1)}%`);
    body.style.setProperty('--ash-2-x', `${blendToward(readBodyNum('--ash-2-x', 82), randRange(58, 92), s).toFixed(1)}%`);
    body.style.setProperty('--ash-2-y', `${blendToward(readBodyNum('--ash-2-y', 70), randRange(45, 85), s).toFixed(1)}%`);
    body.style.setProperty('--ash-3-x', `${blendToward(readBodyNum('--ash-3-x', 50), randRange(30, 70), s).toFixed(1)}%`);
    body.style.setProperty('--ash-3-y', `${blendToward(readBodyNum('--ash-3-y', 100), randRange(75, 105), s).toFixed(1)}%`);

    const shiftX = blendToward(readBodyNum('--land-shift-x', 0), randRange(-28, 28), s);
    const shiftY = blendToward(readBodyNum('--land-shift-y', 0), randRange(-22, 22), s);
    const landScale = blendToward(readBodyNum('--land-scale', 1), randRange(1.02, 1.1), s);
    const landRot = blendToward(readBodyNum('--land-rot', 0), randRange(-2.8, 2.8), s);
    body.style.setProperty('--land-shift-x', `${shiftX.toFixed(1)}px`);
    body.style.setProperty('--land-shift-y', `${shiftY.toFixed(1)}px`);
    body.style.setProperty('--ash-drift-x', `${(-shiftX * 0.35).toFixed(1)}px`);
    body.style.setProperty('--ash-drift-y', `${(-shiftY * 0.35).toFixed(1)}px`);
    body.style.setProperty('--land-rot', `${landRot.toFixed(2)}deg`);
    body.style.setProperty('--land-scale', `${landScale.toFixed(3)}`);
    body.style.setProperty('--ash-scale', `${(1 + (landScale - 1) * 0.4).toFixed(3)}`);
    body.style.setProperty('--land-morph-ms', `${Math.round(420 + s * 930)}ms`);

    disruptGlyphs(pageX, pageY, s, radiusOpt);
  }

  /**
   * Kick debris that is visually next to the blast (getBoundingClientRect).
   * Non-nuke weapons only touch individual letters — never parent blocks.
   * @param radiusOverride explicit on-screen px radius (grenade/raptor blasts)
   */
  function disruptGlyphs(pageX: number, pageY: number, scale = 1, radiusOverride: number | null = null): void {
    if (document.body.dataset.cylonScattered !== '1' || reduceMotion) return;
    const s = Math.max(0.05, Math.min(1.6, scale));
    const radius = Number.isFinite(radiusOverride) && radiusOverride! > 0
      ? radiusOverride!
      : disruptRadiusForScale(s);
    // Only full nuke-scale blasts may nudge blocks/panels
    const localOnly = s < 0.95;
    const selector = localOnly
      ? '.cylon-scatter-char'
      : '.cylon-scatter-char, .cylon-scatter-block, .cylon-scatter-panel';
    const nodes = [...document.querySelectorAll<HTMLElement>(selector)];
    const chance = Math.min(1, 0.7 + s * 0.3);
    const jitter = 55 * s;
    const pushMax = 48 + 200 * s;
    nodes.forEach((el) => {
      if (el.classList.contains('cylon-scatter-panel') && s < 1.1) return;
      const rect = el.getBoundingClientRect();
      // On-screen position after scatter transforms — “physically next to the blast”
      const cx = rect.left + rect.width / 2 + scrollX();
      const cy = rect.top + rect.height / 2 + scrollY();
      const awayX = cx - pageX;
      const awayY = cy - pageY;
      const awayDist = Math.hypot(awayX, awayY) || 1;
      if (awayDist > radius) return;
      if (Math.random() > chance) return;
      const sx = parseFloat(el.style.getPropertyValue('--sx')) || 0;
      const sy = parseFloat(el.style.getPropertyValue('--sy')) || 0;
      const sr = parseFloat(el.style.getPropertyValue('--sr')) || 0;
      const falloff = Math.max(0, 1 - awayDist / radius);
      const push = randRange(pushMax * 0.5, pushMax) * falloff;
      el.style.setProperty('--sx', `${(sx + (awayX / awayDist) * push + randRange(-jitter, jitter) * falloff).toFixed(1)}px`);
      el.style.setProperty('--sy', `${(sy + (awayY / awayDist) * push + randRange(-jitter, jitter) * falloff).toFixed(1)}px`);
      el.style.setProperty('--sr', `${(sr + randRange(-32, 32) * s * falloff).toFixed(1)}deg`);
    });
  }

  function rearrangeLandscapePage(pageX: number, pageY: number, scale = 1, opts: LandscapeOptions = {}): void {
    rearrangeLandscape(pageX - scrollX(), pageY - scrollY(), scale, opts);
  }

  function clearLandscapeVars(): void {
    [
      '--blast-x', '--blast-y', '--crack-a', '--crack-b', '--crack-c', '--crack-grain',
      '--scar-1', '--scar-2', '--scar-3', '--scar-4', '--scar-5', '--scar-6',
      '--ash-1-x', '--ash-1-y', '--ash-2-x', '--ash-2-y', '--ash-3-x', '--ash-3-y',
      '--land-shift-x', '--land-shift-y', '--ash-drift-x', '--ash-drift-y',
      '--land-rot', '--land-scale', '--ash-scale', '--land-morph-ms'
    ].forEach((k) => document.body.style.removeProperty(k));
  }

  return { randRange, rearrangeLandscape, rearrangeLandscapePage, disruptGlyphs, clearLandscapeVars };
}
