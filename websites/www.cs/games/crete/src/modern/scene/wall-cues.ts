/* The Island of Crete, modern look: the hidden walls' cues (src/wall-cues.ts), drawn into the scene so walls and
 * figures in front hide them as they hide anything. A found invisible wall wears a glass shell a hair larger than its
 * stone: a faint cool sheen, brighter along its edges, so it reads as found without standing out; as it comes into
 * view a band of light sweeps up and across it and the shell flashes, then settles. An unshown invisible wall beside
 * Theseus shows only a thin slab of faint glass along its face toward him, just inside its cell, and only while he
 * stands there; it is blended over the floor rather than added, so it shows on the pale sand. A fake wall's haze is a sheet just
 * off its face toward Theseus, and a strip along the top's edge on that side (seen when the face is turned away from
 * the camera): faint warm bands that waver and drift like heat over stone, or a still tint when motion is reduced. Both
 * glow additively and write no depth, so the stone under them still shows. */
import { AdditiveBlending, BoxGeometry, Color, DoubleSide, Group, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import type { CueDraw, Face } from '../../wall-cues.ts';
import type { Dir } from '../../puzzle/tiles.ts';
import { cellX, cellZ } from './floor.ts';

export interface WallCues {
  readonly group: Group;
  /** Shows `c` on a board of `cols` × `rows`, its walls `h` high. */
  set(c: CueDraw, cols: number, rows: number, h: number): void;
  clear(): void;
  dispose(): void;
}

const GLASS = new Color(0.55, 0.78, 1);
const HAZE = new Color(1, 0.93, 0.82);
/** How far the shell stands out from the stone, and the haze off the face. */
const SHELL = 1.03;
const OFF = 0.012;
/** How deep the haze's top strip reaches over the wall, in cells. */
const TOP_STRIP = 0.3;
/** The glass beside Theseus: how deep its slab reaches into the cell and how much of the face it spans, in cells,
 *  and how strongly it shows when fully up. */
const SLIVER = 0.07;
const SLIVER_SPAN = 0.94;
const SLIVER_A = 1;

const VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vUv = uv;
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/** The shell: a faint sheen, brighter towards each face's edges, and the shimmer's band (uBand from -0.3 to 1.3,
 *  across the shell's height and one diagonal) with a flash (uFlash, 0 to 1). */
const GLASS_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uH;
uniform float uBand;
uniform float uFlash;
varying vec2 vUv;
varying vec3 vPos;
void main() {
  vec2 e = abs(vUv - 0.5) * 2.0;
  float edge = smoothstep(0.78, 1.0, max(e.x, e.y));
  float a = 0.045 + 0.17 * edge;
  float d = (vPos.y / uH + 0.5) * 0.7 + (vPos.x + vPos.z) * 0.3 + 0.15;
  float k = (d - uBand) * 5.0;
  float band = uFlash * exp(-k * k);
  a += 0.18 * uFlash + 0.55 * band;
  gl_FragColor = vec4(mix(uColor, vec3(1.0), band) * a, 1.0);
}`;

/** The glass beside Theseus: blended over the floor, not added to it, so pale glass shows on pale sand. A faint cool
 *  body, paler and fuller towards each face's edges, at uA. */
const SLIVER_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uA;
varying vec2 vUv;
void main() {
  vec2 e = abs(vUv - 0.5) * 2.0;
  float edge = smoothstep(0.7, 1.0, max(e.x, e.y));
  gl_FragColor = vec4(mix(uColor, vec3(1.0), 0.6 * edge), (0.08 + 0.4 * edge) * uA);
}`;

/** The haze: bands that waver along the face (vUv.x along it, vUv.y up it) and drift, fading at its ends, at uA. */
const HAZE_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uA;
uniform float uT;
uniform float uStill;
varying vec2 vUv;
void main() {
  float ends = smoothstep(0.0, 0.18, vUv.x) * (1.0 - smoothstep(0.82, 1.0, vUv.x)) * smoothstep(0.0, 0.12, vUv.y) * (1.0 - smoothstep(0.85, 1.0, vUv.y));
  float wave = vUv.y * 16.0 + sin(vUv.x * 9.0 + uT * 2.2) * 1.4 - uT * 2.6;
  float bands = mix(0.5 + 0.5 * (0.5 + 0.5 * sin(wave)), 0.75, uStill);
  gl_FragColor = vec4(uColor * uA * bands * ends, 1.0);
}`;

/** The way to Theseus as x and z on the floor. */
const WAY: Record<Dir, readonly [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

export function createWallCues(): WallCues {
  const group = new Group();
  const box = new BoxGeometry(1, 1, 1);
  const plane = new PlaneGeometry(1, 1);
  const shells: Mesh[] = [];
  const slivers: Mesh[] = [];
  const hazes: Mesh[] = [];

  const glassMat = (): ShaderMaterial => new ShaderMaterial({
    vertexShader: VERTEX, fragmentShader: GLASS_FRAGMENT, transparent: true, depthWrite: false, blending: AdditiveBlending,
    toneMapped: false, uniforms: { uColor: { value: GLASS }, uH: { value: 1 }, uBand: { value: -1 }, uFlash: { value: 0 } },
  });
  const sliverMat = (): ShaderMaterial => new ShaderMaterial({
    vertexShader: VERTEX, fragmentShader: SLIVER_FRAGMENT, transparent: true, depthWrite: false,
    toneMapped: false, uniforms: { uColor: { value: GLASS }, uA: { value: 0 } },
  });
  const hazeMat = (): ShaderMaterial => new ShaderMaterial({
    vertexShader: VERTEX, fragmentShader: HAZE_FRAGMENT, transparent: true, depthWrite: false, blending: AdditiveBlending,
    toneMapped: false, side: DoubleSide, uniforms: { uColor: { value: HAZE }, uA: { value: 0 }, uT: { value: 0 }, uStill: { value: 0 } },
  });

  /** The `n`th mesh of `list`, made the first time it is needed; the ones past what shows are hidden. */
  function nth(list: Mesh[], n: number, make: () => Mesh): Mesh {
    let m = list[n];
    if (!m) {
      m = make();
      list.push(m);
      group.add(m);
    }
    m.visible = true;
    return m;
  }

  function placeHaze(f: Face, n: number, c: CueDraw, strength: number, cols: number, rows: number, h: number): void {
    const [dx, dz] = WAY[f.face];
    const x = cellX(f.at.c, cols), z = cellZ(f.at.r, rows);
    const yaw = Math.atan2(dx, dz);
    const set = (m: Mesh) => {
      const u = (m.material as ShaderMaterial).uniforms;
      u.uA!.value = (c.still ? 0.04 : 0.055) * strength;
      u.uT!.value = c.t;
      u.uStill!.value = c.still ? 1 : 0;
    };
    // On the face: a sheet the wall's width and height, just off it, facing Theseus.
    const face = nth(hazes, 2 * n, () => new Mesh(plane, hazeMat()));
    face.scale.set(1, h, 1);
    face.rotation.set(0, yaw, 0);
    face.position.set(x + dx * (0.5 + OFF), h / 2, z + dz * (0.5 + OFF));
    set(face);
    // On the top, along that edge: lying flat, its far side (vUv.y = 1) at the face.
    const strip = nth(hazes, 2 * n + 1, () => new Mesh(plane, hazeMat()));
    strip.scale.set(1, TOP_STRIP, 1);
    strip.rotation.set(-Math.PI / 2, yaw, 0, 'YXZ');
    strip.position.set(x + dx * (0.5 - TOP_STRIP / 2), h + OFF, z + dz * (0.5 - TOP_STRIP / 2));
    set(strip);
  }

  return {
    group,
    set(c, cols, rows, h) {
      c.found.forEach((f, n) => {
        const m = nth(shells, n, () => new Mesh(box, glassMat()));
        m.scale.set(SHELL, h * SHELL, SHELL);
        m.position.set(cellX(f.at.c, cols), (h * SHELL) / 2 - 0.005, cellZ(f.at.r, rows));
        const u = (m.material as ShaderMaterial).uniforms;
        u.uH!.value = 1;
        u.uBand!.value = f.shimmer === null ? -1 : -0.3 + 1.6 * f.shimmer;
        u.uFlash!.value = f.shimmer === null ? 0 : Math.sin(Math.PI * f.shimmer);
      });
      for (let n = c.found.length; n < shells.length; n++) shells[n]!.visible = false;
      // The glass beside Theseus: a slab on the face toward him, its outer side on the cell's edge.
      c.glass.forEach((g, n) => {
        const m = nth(slivers, n, () => new Mesh(box, sliverMat()));
        const [dx, dz] = WAY[g.face];
        const across = dx !== 0;
        m.scale.set(across ? SLIVER : SLIVER_SPAN, h, across ? SLIVER_SPAN : SLIVER);
        m.position.set(cellX(g.at.c, cols) + dx * (0.5 - SLIVER / 2), h / 2, cellZ(g.at.r, rows) + dz * (0.5 - SLIVER / 2));
        const u = (m.material as ShaderMaterial).uniforms;
        u.uA!.value = SLIVER_A * g.strength;
      });
      for (let n = c.glass.length; n < slivers.length; n++) slivers[n]!.visible = false;
      const faces = c.haze?.faces ?? [];
      faces.forEach((f, n) => placeHaze(f, n, c, c.haze!.strength, cols, rows, h));
      for (let n = 2 * faces.length; n < hazes.length; n++) hazes[n]!.visible = false;
    },
    clear() {
      for (const m of [...shells, ...slivers, ...hazes]) m.visible = false;
    },
    dispose() {
      for (const m of [...shells, ...slivers, ...hazes]) (m.material as ShaderMaterial).dispose();
      box.dispose();
      plane.dispose();
    },
  };
}
