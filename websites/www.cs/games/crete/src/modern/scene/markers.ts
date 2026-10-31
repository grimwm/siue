/* The Island of Crete, modern look: the floating markers' look (src/modern/markers.ts says who carries which).
 * Each is a six-sided glass crystal, point down, faceted, faintly lit from within and a little see-through, with a
 * thin near-black rim. One geometry and one material per kind serve every marker. The markers live in their own scene with their own
 * light, drawn over the finished picture, past the tone map and FXAA, so walls never hide them; each turns
 * to face the camera, upright on screen, and hangs at its piece's head as the screen shows it. */
import { AmbientLight, BackSide, DirectionalLight, Group, LatheGeometry, Mesh, MeshBasicMaterial, MeshPhongMaterial, Scene, Vector2, Vector3 } from 'three';
import type { Camera } from 'three';
import { MARKER_COLOURS, MARKER_HEIGHT, MARKER_RIM, MARKER_WIDTH, bob, markerRise, markerScale } from '../markers.ts';
import type { MarkerKind } from '../markers.ts';
import { variant } from '../variants.ts';

/** Where a marker's piece stands and how tall it is. */
export interface MarkerInfo {
  kind: MarkerKind;
  foot: Vector3;
  h: number;
  /** How far its top leans back up the board. */
  back: number;
}

export interface MarkerSet {
  readonly scene: Scene;
  /** The markers, each with its MarkerInfo as userData. */
  readonly group: Group;
  /** A marker of `kind` over a piece `h` tall, its top leaning `back` up the board, standing at `foot` (kept by
   *  reference: move the vector to move it). */
  make(kind: MarkerKind, foot: Vector3, h: number, back?: number): Mesh;
  /** Hangs every marker over its piece for `camera` at `pitchDeg`, bobbing at loop time `t` unless `still`, grown
   *  where a cell is only `cellPx` CSS pixels so it stays readable; returns that growth. */
  place(camera: Camera, pitchDeg: number, t: number, still: boolean, cellPx: number): number;
  dispose(): void;
}

/** The crystal's turn about its own axis, so an edge faces the viewer and the facets catch the light. */
const FACET_TURN = Math.PI / 6;

export function createMarkers(): MarkerSet {
  const scene = new Scene();
  const group = new Group();
  const w = MARKER_WIDTH / 2, h = MARKER_HEIGHT;
  // Point down at the origin, widest a little above the middle, a shorter point on top.
  const geometry = new LatheGeometry([new Vector2(0, 0), new Vector2(w, h * 0.6), new Vector2(0, h)], 6);
  const mats = new Map<MarkerKind, MeshPhongMaterial>();
  const white = variant().items === 'white';
  for (const [kind, c] of Object.entries(MARKER_COLOURS) as [MarkerKind, number][]) {
    const color = white && kind === 'item' ? 0xffffff : c;
    mats.set(kind, new MeshPhongMaterial({
      color, emissive: color, emissiveIntensity: 0.45, specular: 0xffffff, shininess: 80, flatShading: true,
      transparent: true, opacity: 0.9, depthTest: false, depthWrite: false, fog: false, toneMapped: false,
    }));
  }
  // The rim: the crystal's own surface drawn from behind, pushed out along its normals, in near black.
  const rim = new MeshBasicMaterial({ color: MARKER_RIM, side: BackSide, depthTest: false, depthWrite: false, fog: false, toneMapped: false });
  rim.onBeforeCompile = sh => {
    sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = position + normal * ${white ? '0.04' : '0.022'};`);
  };
  const key = new DirectionalLight(0xffffff, 2.2);
  scene.add(new AmbientLight(0xffffff, 0.7), key, group);
  const right = new Vector3(), up = new Vector3(), back = new Vector3();

  return {
    scene,
    group,
    make(kind, foot, ph, back = 0) {
      const m = new Mesh(geometry, mats.get(kind)!);
      m.userData = { kind, foot, h: ph, back } satisfies MarkerInfo;
      m.renderOrder = 10;
      const edge = new Mesh(geometry, rim);
      edge.renderOrder = 9;
      m.add(edge);
      group.add(m);
      return m;
    },
    place(camera, pitchDeg, t, still, cellPx) {
      const grow = markerScale(cellPx);
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      up.setFromMatrixColumn(camera.matrixWorld, 1);
      back.setFromMatrixColumn(camera.matrixWorld, 2);
      // The light comes from over the viewer's left shoulder.
      key.position.copy(back).multiplyScalar(3).addScaledVector(up, 2).addScaledVector(right, -1.5);
      const dy = bob(t, still);
      for (const m of group.children) {
        const info = m.userData as MarkerInfo;
        m.position.copy(info.foot).addScaledVector(up, markerRise(info.h, pitchDeg, info.back) + dy);
        m.quaternion.copy(camera.quaternion);
        m.rotateY(FACET_TURN);
        m.scale.setScalar(grow);
      }
      return grow;
    },
    dispose() {
      group.clear();
      geometry.dispose();
      for (const m of mats.values()) m.dispose();
      rim.dispose();
    },
  };
}
