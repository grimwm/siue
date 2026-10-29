/* The Island of Crete, modern look: the finish. The scene renders to a half-float target, is tone mapped with
 * ACES, then a Kuwahara filter paints it in small flat strokes, a warm grade and a vignette settle it, and a
 * canvas weave with fine grain lies over it. Without the paint pass the tone map draws straight to the screen. */
import { HalfFloatType, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, WebGLRenderTarget } from 'three';
import type { Camera, WebGLRenderer } from 'three';

const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

const TONE = `
uniform sampler2D tDiffuse; uniform float exposure; varying vec2 vUv;
vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb * exposure; c = aces(c); gl_FragColor = vec4(pow(c, vec3(1.0/2.2)), 1.0); }`;

const PAINT = `
uniform sampler2D tDiffuse; uniform vec2 texel; uniform float radius; uniform float stride; uniform float grain; uniform float dpr; uniform vec2 res; varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec3 col; int r = int(radius + 0.5);
  if (r == 0) { col = texture2D(tDiffuse, vUv).rgb; }
  else {
    vec3 m0 = vec3(0.), m1 = vec3(0.), m2 = vec3(0.), m3 = vec3(0.), s0 = vec3(0.), s1 = vec3(0.), s2 = vec3(0.), s3 = vec3(0.);
    for (int j = -6; j <= 6; j++) { if (j < -r || j > r) continue;
      for (int i = -6; i <= 6; i++) { if (i < -r || i > r) continue;
        vec3 c = texture2D(tDiffuse, vUv + vec2(float(i), float(j)) * texel * stride).rgb; vec3 c2 = c * c;
        if (i <= 0 && j <= 0) { m0 += c; s0 += c2; }
        if (i >= 0 && j <= 0) { m1 += c; s1 += c2; }
        if (i <= 0 && j >= 0) { m2 += c; s2 += c2; }
        if (i >= 0 && j >= 0) { m3 += c; s3 += c2; } } }
    float n = float((r + 1) * (r + 1));
    m0 /= n; m1 /= n; m2 /= n; m3 /= n;
    float v0 = dot(s0 / n - m0 * m0, vec3(1.)), v1 = dot(s1 / n - m1 * m1, vec3(1.)), v2 = dot(s2 / n - m2 * m2, vec3(1.)), v3 = dot(s3 / n - m3 * m3, vec3(1.));
    float w0 = 1.0 / pow(0.0008 + max(v0, 0.), 2.0), w1 = 1.0 / pow(0.0008 + max(v1, 0.), 2.0), w2 = 1.0 / pow(0.0008 + max(v2, 0.), 2.0), w3 = 1.0 / pow(0.0008 + max(v3, 0.), 2.0);
    col = (m0 * w0 + m1 * w1 + m2 * w2 + m3 * w3) / (w0 + w1 + w2 + w3);
  }
  float l = dot(col, vec3(.2126, .7152, .0722));
  col = mix(vec3(l), col, 0.78);
  col = col * vec3(1.05, 1.0, 0.9) + vec3(0.018, 0.009, 0.0) * (1.0 - l);
  vec2 q = (vUv - 0.5) * vec2(res.x / res.y, 1.0);
  col *= 1.0 - 0.5 * smoothstep(0.35, 0.95, length(q));
  vec2 fc = gl_FragCoord.xy / dpr;
  float weave = sin(fc.x * 2.3) * sin(fc.y * 2.3);
  float nz = hash(floor(fc)) - 0.5;
  col += (weave * 0.012 + nz * 0.028) * grain * (0.35 + l);
  gl_FragColor = vec4(col, 1.0);
}`;

export interface Paint {
  /** The drawing buffer's size in device pixels and its pixel ratio. */
  setSize(pw: number, ph: number, dpr: number): void;
  render(scene: Scene, camera: Camera, paint: boolean): void;
  dispose(): void;
}

export function createPaint(renderer: WebGLRenderer): Paint {
  const quadCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const tone = new ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, exposure: { value: 1.3 } },
    vertexShader: VS, fragmentShader: TONE, depthTest: false, depthWrite: false,
  });
  const paintMat = new ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null }, texel: { value: new Vector2() }, radius: { value: 2 }, stride: { value: 1 },
      grain: { value: 1 }, dpr: { value: 1 }, res: { value: new Vector2(1, 1) },
    },
    vertexShader: VS, fragmentShader: PAINT, depthTest: false, depthWrite: false,
  });
  const quad = new Mesh(new PlaneGeometry(2, 2), tone);
  quad.frustumCulled = false;
  const quadScene = new Scene();
  quadScene.add(quad);
  const hdr = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: 4 });
  const ldr = new WebGLRenderTarget(1, 1);

  return {
    setSize(pw, ph, dpr) {
      hdr.setSize(pw, ph);
      ldr.setSize(pw, ph);
      const u = paintMat.uniforms;
      (u.texel!.value as Vector2).set(1 / pw, 1 / ph);
      (u.res!.value as Vector2).set(pw, ph);
      u.stride!.value = dpr;
      u.dpr!.value = dpr;
    },
    render(scene, camera, paint) {
      renderer.setRenderTarget(hdr);
      renderer.render(scene, camera);
      quad.material = tone;
      tone.uniforms.tDiffuse!.value = hdr.texture;
      renderer.setRenderTarget(paint ? ldr : null);
      renderer.render(quadScene, quadCam);
      if (!paint) return;
      quad.material = paintMat;
      paintMat.uniforms.tDiffuse!.value = ldr.texture;
      renderer.setRenderTarget(null);
      renderer.render(quadScene, quadCam);
    },
    dispose() {
      hdr.dispose();
      ldr.dispose();
      tone.dispose();
      paintMat.dispose();
      quad.geometry.dispose();
    },
  };
}
