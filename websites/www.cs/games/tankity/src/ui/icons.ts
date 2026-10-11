/* Operation Tankity: the little pictures.
 *
 * Every shell and trick has a small canvas icon, shared by the shop rows, the
 * weapon picker and the HUD; the hills picker has a silhouette per map and the
 * game menu a thumbnail per unit. Each function draws on the canvas it is
 * handed and reads nothing else: the weapon or trick to draw arrives as an
 * argument, so no game state is needed here. */
import { drawChassis } from '../render.js';
import type { Gear, Gfx, Weapon } from '../sim.js';

/** A paint job with every color the shell icon draws. */
type Paint = Required<Pick<Gfx, 'shell' | 'trail' | 'blast'>> & Pick<Gfx, 'painter'>;

/* The unit thumbnail: the chassis with a turret dome on top. */
export function drawUnitIcon(cv: HTMLCanvasElement, key: string): void {
  const c = cv.getContext && cv.getContext('2d');
  if (!c || !c.translate) return;
  c.translate(24, 28);
  drawChassis(c, key, '#d7a800', 0, false);
  c.fillStyle = '#d7a800';
  c.beginPath();
  c.arc(0, -12, 7, 0, Math.PI * 2);
  c.fill();
}
/* Picture buttons: every shell and trick has a small canvas icon, shared by
   the shop rows and the HUD. Icons draw on a fixed 40x26 grid at twice the
   pixels so they stay crisp when CSS sizes them. */
export const ICON_W = 40, ICON_H = 26;
export function iconCtx(cv: HTMLCanvasElement | null | undefined): CanvasRenderingContext2D | null {
  if (!cv) return null;
  cv.width = ICON_W * 2;
  cv.height = ICON_H * 2;
  const c = cv.getContext && cv.getContext('2d');
  if (!c || !c.scale) return null;
  c.scale(2, 2);
  return c;
}
/* The shell as it flies: a trail in its trail color behind a body in its
   shell color, in front of a faint blast ring sized by its radius. Beam
   shells fly flat as a bright streak; spark shells throw spokes. */
export function drawShellIcon(cv: HTMLCanvasElement, w: Weapon | undefined): void {
  const c = w && w.gfx && iconCtx(cv);
  if (!c) return;
  const g = w!.gfx as Paint;
  const flat = g.painter === 'beam';
  const cx = 26, cy = 13;
  const br = 5 + Math.min(1, (w.radius || 0) / 70) * 8;
  const halo = c.createRadialGradient(cx, cy, 0, cx, cy, br);
  halo.addColorStop(0, g.blast[1]);
  halo.addColorStop(1, g.blast[0]);
  c.save();
  c.globalAlpha = 0.34;
  c.fillStyle = halo;
  c.beginPath();
  c.arc(cx, cy, br, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 0.6;
  c.strokeStyle = g.blast[0];
  c.lineWidth = 1;
  c.stroke();
  c.restore();
  // The trail fades in toward the shell.
  const fade = c.createLinearGradient(2, 0, cx, 0);
  fade.addColorStop(0, 'rgba(0,0,0,0)');
  fade.addColorStop(1, g.trail);
  c.strokeStyle = fade;
  c.lineCap = 'round';
  c.lineWidth = flat ? 1.8 : 2.4;
  c.beginPath();
  if (flat) {
    c.moveTo(2, cy);
    c.lineTo(cx - 2, cy);
  } else {
    c.moveTo(3, 23);
    c.quadraticCurveTo(14, 1, cx - 2, cy - 2);
  }
  c.stroke();
  c.fillStyle = g.shell;
  c.strokeStyle = g.shell;
  if (flat) {
    c.save();
    c.shadowColor = g.shell;
    c.shadowBlur = 5;
    c.lineWidth = 2.6;
    c.beginPath();
    c.moveTo(cx - 8, cy);
    c.lineTo(cx + 2, cy);
    c.stroke();
    c.restore();
  } else if (w.effect === 'pellets') {
    for (const [dx, dy] of [[-3, -3], [2, -1], [-1, 3]] as [number, number][]) {
      c.beginPath();
      c.arc(cx + dx, cy + dy, 2, 0, Math.PI * 2);
      c.fill();
    }
  } else if (g.painter === 'ball') {
    // A ball with a stripe across it, tipped as if rolling.
    c.save();
    c.translate(cx, cy);
    c.rotate(-0.5);
    c.beginPath();
    c.arc(0, 0, 4.4, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = 'rgba(40,24,8,0.75)';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(-4.4, 0);
    c.lineTo(4.4, 0);
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.8)';
    c.beginPath();
    c.arc(0, -2.2, 1, 0, Math.PI * 2);
    c.fill();
    c.restore();
  } else if (w.effect === 'cluster') {
    c.beginPath();
    c.arc(cx, cy, 2.8, 0, Math.PI * 2);
    c.fill();
    for (const [dx, dy] of [[-5, -3], [4, 4]] as [number, number][]) {
      c.beginPath();
      c.arc(cx + dx, cy + dy, 1.6, 0, Math.PI * 2);
      c.fill();
    }
  } else {
    if (g.painter === 'spark') {
      c.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + 0.3;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * 3.5, cy + Math.sin(a) * 3.5);
        c.lineTo(cx + Math.cos(a) * 6.5, cy + Math.sin(a) * 6.5);
        c.stroke();
      }
    }
    c.beginPath();
    c.arc(cx, cy, 3.8, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.beginPath();
    c.arc(cx - 1, cy - 1, 1, 0, Math.PI * 2);
    c.fill();
  }
}
/* A trick or supply as a simple picture of what it does. */
export function drawGearIcon(cv: HTMLCanvasElement, g: Gear | undefined): void {
  const c = g && iconCtx(cv);
  if (!c) return;
  const cx = ICON_W / 2, cy = ICON_H / 2;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  switch (g.effect) {
    case 'repair': // a green cross
      c.fillStyle = '#7ddf64';
      c.fillRect(cx - 3, cy - 10, 6, 20);
      c.fillRect(cx - 10, cy - 3, 20, 6);
      break;
    case 'fuel': // a jerry can with a drop on it
      c.fillStyle = '#ff9f43';
      c.fillRect(cx - 7, cy - 6, 14, 17);
      c.fillRect(cx - 7, cy - 10, 6, 4);
      c.fillStyle = '#7a4a1e';
      c.fillRect(cx + 1, cy - 9, 4, 3);
      c.fillStyle = '#fff3c4';
      c.beginPath();
      c.moveTo(cx, cy - 2);
      c.quadraticCurveTo(cx + 5, cy + 4, cx, cy + 8);
      c.quadraticCurveTo(cx - 5, cy + 4, cx, cy - 2);
      c.fill();
      break;
    case 'plate': { // layered armor with rivets
      c.fillStyle = '#7d8590';
      c.fillRect(cx - 12, cy - 8, 24, 16);
      c.fillStyle = '#aab2bd';
      c.fillRect(cx - 12, cy - 8, 24, 5);
      c.fillStyle = '#3a4226';
      for (const [dx, dy] of [[-9, -5], [9, -5], [-9, 5], [9, 5]] as [number, number][]) {
        c.beginPath();
        c.arc(cx + dx, cy + dy, 1.2, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = '#ffc93c';
      c.fillRect(cx - 1.5, cy - 3, 3, 9);
      c.fillRect(cx - 4.5, cy, 9, 3);
      break;
    }
    case 'shield': // a heater shield
      c.fillStyle = '#6fc3ff';
      c.beginPath();
      c.moveTo(cx - 9, cy - 10);
      c.lineTo(cx + 9, cy - 10);
      c.lineTo(cx + 9, cy + 1);
      c.quadraticCurveTo(cx + 8, cy + 8, cx, cy + 12);
      c.quadraticCurveTo(cx - 8, cy + 8, cx - 9, cy + 1);
      c.closePath();
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.fillRect(cx - 9, cy - 10, 9, 20);
      break;
    case 'extralife': // a heart
      c.fillStyle = '#ff5964';
      c.beginPath();
      c.moveTo(cx, cy + 10);
      c.bezierCurveTo(cx - 16, cy - 1, cx - 8, cy - 14, cx, cy - 5);
      c.bezierCurveTo(cx + 8, cy - 14, cx + 16, cy - 1, cx, cy + 10);
      c.fill();
      break;
    case 'jammer': // a dot sending out waves
      c.strokeStyle = '#c77dff';
      c.lineWidth = 2;
      for (const r of [5, 9, 13]) {
        c.beginPath();
        c.arc(cx - 8, cy + 6, r, -1.35, -0.2);
        c.stroke();
      }
      c.fillStyle = '#c77dff';
      c.beginPath();
      c.arc(cx - 8, cy + 6, 2.2, 0, Math.PI * 2);
      c.fill();
      break;
    case 'bunker': // a dug-in mound with a slit
      c.fillStyle = '#7a4a1e';
      c.beginPath();
      c.moveTo(cx - 15, cy + 10);
      c.quadraticCurveTo(cx, cy - 20, cx + 15, cy + 10);
      c.closePath();
      c.fill();
      c.fillStyle = '#1a1a00';
      c.fillRect(cx - 5, cy - 1, 10, 3);
      c.strokeStyle = '#00aa00';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(cx - 15, cy + 10);
      c.quadraticCurveTo(cx, cy - 20, cx + 15, cy + 10);
      c.stroke();
      break;
    case 'laststand': { // a starburst
      c.fillStyle = '#ff7b39';
      c.beginPath();
      for (let i = 0; i < 16; i++) {
        const r = i % 2 ? 6 : 12;
        const a = i * Math.PI / 8;
        c.lineTo(cx + Math.cos(a) * r * 1.2, cy + Math.sin(a) * r);
      }
      c.closePath();
      c.fill();
      c.fillStyle = '#ffe27a';
      c.beginPath();
      c.arc(cx, cy, 4, 0, Math.PI * 2);
      c.fill();
      break;
    }
    default: // an unknown trick still gets a crate
      c.fillStyle = '#a8b08a';
      c.fillRect(cx - 8, cy - 8, 16, 16);
  }
}
/* The host's hills: a Random tile plus one per named map, each a silhouette
   of that map's terrain from the server. #lobby-map is the hidden value. */
export function drawMapIcon(cv: HTMLCanvasElement, profile: readonly number[] | undefined): void {
  const c = iconCtx(cv);
  if (!c) return;
  c.fillStyle = '#00000b';
  c.fillRect(0, 0, ICON_W, ICON_H);
  const pts = Array.isArray(profile) && profile.length > 1 ? profile.map(Number) : null;
  // The generator keeps most hills in a narrow band, so each silhouette is
  // stretched to fill its tile.
  const lo = pts ? Math.min(...pts) : 0, hi = pts ? Math.max(...pts) : 1;
  const span = Math.max(0.12, hi - lo);
  const yAt = (i: number) => pts
    ? ICON_H - 5 - ((pts[i]! - lo) / span) * (ICON_H - 12) - 2
    : 15 + 4 * Math.sin(i * 0.5) + 3 * Math.sin(i * 1.7);
  const n = pts ? pts.length : 24;
  c.fillStyle = '#7a4a1e';
  c.beginPath();
  c.moveTo(0, ICON_H);
  for (let i = 0; i < n; i++) c.lineTo(i * ICON_W / (n - 1), yAt(i));
  c.lineTo(ICON_W, ICON_H);
  c.closePath();
  c.fill();
  c.strokeStyle = '#00aa00';
  c.lineWidth = 1.5;
  c.lineJoin = 'round';
  c.beginPath();
  for (let i = 0; i < n; i++) {
    if (i === 0) c.moveTo(0, yAt(0));
    else c.lineTo(i * ICON_W / (n - 1), yAt(i));
  }
  c.stroke();
  if (!pts) {
    c.fillStyle = '#ffc93c';
    c.font = '800 14px sans-serif';
    c.textAlign = 'center';
    c.fillText('?', ICON_W / 2, 12);
  }
}
