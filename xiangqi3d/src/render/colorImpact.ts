import * as THREE from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

const DURATION = 0.38

/**
 * Full-colour hit flash: a bright core, radial speed lines tinted by the attack style
 * and a short tinted vignette. Idle passes are disabled so they cost nothing.
 */
export class ColorImpactPass extends ShaderPass {
  private t = 1

  constructor() {
    super({
      uniforms: {
        tDiffuse: { value: null },
        center: { value: new THREE.Vector2(0.5, 0.5) },
        aspect: { value: 1 },
        progress: { value: 1 },
        color: { value: new THREE.Color(1, 1, 1) },
        seed: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform vec2 center;
        uniform float aspect, progress, seed;
        uniform vec3 color;
        varying vec2 vUv;
        float hash(float n) { return fract(sin(n * 12.9898 + seed) * 43758.5453); }
        void main() {
          vec4 src = texture2D(tDiffuse, vUv);
          vec2 d = vUv - center;
          d.x *= aspect;
          float r = length(d);
          float a = atan(d.y, d.x) / 6.2831853 + 0.5;
          float fade = 1.0 - progress;

          // radial speed lines: random-width wedges that rush outward
          float slot = floor(a * 72.0);
          float w = fract(a * 72.0);
          float on = step(0.55, hash(slot));
          float width = 0.12 + 0.3 * hash(slot + 7.0);
          float line = on * (1.0 - smoothstep(0.0, width, abs(w - 0.5)));
          float inner = 0.06 + progress * 0.55 + hash(slot + 3.0) * 0.12;
          line *= smoothstep(inner, inner + 0.12, r) * fade;

          float core = exp(-r * r * 60.0) * fade * fade;
          float pop = smoothstep(0.25, 0.0, progress);
          float vignette = smoothstep(0.35, 1.0, r) * fade;

          vec3 col = src.rgb;
          col = mix(col, color * 0.35, vignette * 0.45);
          col = mix(col, mix(color, vec3(1.0), 0.35), line * 0.8);
          col += (color + 0.4) * core * 0.9;
          col = mix(col, col * 1.15 + 0.04, pop * 0.5);
          gl_FragColor = vec4(col, src.a);
        }
      `,
    })
    this.enabled = false
  }

  trigger(uv: { x: number; y: number }, color: number): void {
    this.uniforms.center.value.set(uv.x, uv.y)
    this.uniforms.color.value.setHex(color)
    this.uniforms.seed.value = Math.random() * 100
    this.t = 0
    this.enabled = true
  }

  setCenter(uv: { x: number; y: number }): void {
    this.uniforms.center.value.set(uv.x, uv.y)
  }

  setAspect(aspect: number): void {
    this.uniforms.aspect.value = aspect
  }

  get active(): boolean {
    return this.enabled
  }

  update(dt: number): void {
    if (!this.enabled) return
    this.t = Math.min(1, this.t + dt / DURATION)
    this.uniforms.progress.value = this.t
    if (this.t >= 1) this.enabled = false
  }
}
