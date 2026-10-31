/* The Island of Crete, modern look: the finish. The scene renders to a half-float target with four samples a
 * pixel, then one pass tone maps it with ACES, warms it with a light grade and settles the corners with a vignette,
 * and FXAA smooths what edges are left as it draws to the screen. Without FXAA the tone map draws straight to the
 * screen. No pass blurs or repaints the picture: edges and textures stay as sharp as the pixel ratio allows. */
import { HalfFloatType, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, WebGLRenderTarget } from 'three';
import type { Camera, WebGLRenderer } from 'three';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

const TONE = `
uniform sampler2D tDiffuse; uniform float exposure; uniform vec2 res; varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
void main(){
  vec3 col = pow(aces(texture2D(tDiffuse, vUv).rgb * exposure), vec3(1.0/2.2));
  float l = dot(col, vec3(.2126, .7152, .0722));
  col = col * vec3(1.02, 1.0, 0.96) + vec3(0.018, 0.009, 0.0) * (1.0 - l);
  vec2 q = (vUv - 0.5) * vec2(res.x / res.y, 1.0);
  col *= 1.0 - 0.5 * smoothstep(0.35, 0.95, length(q));
  gl_FragColor = vec4(col, 1.0);
}`;

export interface Finish {
  /** The drawing buffer's size in device pixels. */
  setSize(pw: number, ph: number): void;
  render(scene: Scene, camera: Camera, aa: boolean): void;
  dispose(): void;
}

export function createFinish(renderer: WebGLRenderer): Finish {
  const quadCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const tone = new ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, exposure: { value: 1.4 }, res: { value: new Vector2(1, 1) } },
    vertexShader: VS, fragmentShader: TONE, depthTest: false, depthWrite: false,
  });
  const fxaa = new ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, resolution: { value: new Vector2() } },
    vertexShader: FXAAShader.vertexShader, fragmentShader: FXAAShader.fragmentShader, depthTest: false, depthWrite: false,
  });
  const quad = new Mesh(new PlaneGeometry(2, 2), tone);
  quad.frustumCulled = false;
  const quadScene = new Scene();
  quadScene.add(quad);
  const hdr = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: 4 });
  const ldr = new WebGLRenderTarget(1, 1);

  return {
    setSize(pw, ph) {
      hdr.setSize(pw, ph);
      ldr.setSize(pw, ph);
      (tone.uniforms.res!.value as Vector2).set(pw, ph);
      (fxaa.uniforms.resolution!.value as Vector2).set(1 / pw, 1 / ph);
    },
    render(scene, camera, aa) {
      renderer.setRenderTarget(hdr);
      renderer.render(scene, camera);
      quad.material = tone;
      tone.uniforms.tDiffuse!.value = hdr.texture;
      renderer.setRenderTarget(aa ? ldr : null);
      renderer.render(quadScene, quadCam);
      if (!aa) return;
      quad.material = fxaa;
      fxaa.uniforms.tDiffuse!.value = ldr.texture;
      renderer.setRenderTarget(null);
      renderer.render(quadScene, quadCam);
    },
    dispose() {
      hdr.dispose();
      ldr.dispose();
      tone.dispose();
      fxaa.dispose();
      quad.geometry.dispose();
    },
  };
}
