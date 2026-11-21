import * as THREE from 'three'
import type { SceneVfx } from './vendor/vfx-asset'
import type { HyperdimensionalSoulFireballVFX } from './vendor/effect-flame-magic-bolt.js'
import { NO_OUTLINE } from '../render/toon'

export type AttackStyle = 'melee' | 'charge' | 'ranged'
export type Quality = 'high' | 'low'

type Factory = (o?: Record<string, unknown>) => SceneVfx
type BoltClass = typeof HyperdimensionalSoulFireballVFX

interface Factories {
  slash: Factory
  fire: Factory
  mate: Factory
  circle: Factory
  Bolt: BoltClass
}

/** Colour of each attack style's impact flash (linear-space friendly hex). */
export const STYLE_COLOR: Record<AttackStyle, number> = {
  melee: 0x8fb4ff,
  charge: 0xff8a2a,
  ranged: 0xffc23a,
}

// the fireball is authored for an ~8 m path; shrink it to board scale
const BOLT_SCALE = 0.45

/** The effect modules are large, so they load after the menu is up instead of blocking startup. */
async function loadFactories(): Promise<Factories> {
  const [slash, fire, mate, circle, bolt] = await Promise.all([
    import('./vendor/effect-dimensional-rend.js'),
    import('./vendor/effect-fire-explosion.js'),
    import('./vendor/effect-astral-convergence.js'),
    import('./vendor/effect-spell-indicator-circle.js'),
    import('./vendor/effect-flame-magic-bolt.js'),
  ])
  return {
    slash: slash.default,
    fire: fire.default,
    mate: mate.default,
    circle: circle.default,
    Bolt: bolt.HyperdimensionalSoulFireballVFX,
  }
}

function noOutline(group: THREE.Object3D): void {
  // OutlineEffect would try to outline the effects' custom shaders
  group.traverse((o) => {
    const m = (o as THREE.Mesh).material
    for (const mat of Array.isArray(m) ? m : m ? [m] : []) mat.userData.outlineParameters = NO_OUTLINE
  })
}

/** Owns every live 00GameDevs scene effect: spawns, updates and disposes them. */
export class VfxManager {
  readonly root = new THREE.Group()
  private readonly active = new Set<SceneVfx>()
  private readonly bolts = new Set<HyperdimensionalSoulFireballVFX>()
  private checkWarning: SceneVfx | null = null
  quality: Quality = 'high'
  private factories: Factories | null = null
  /** The rolling fireburst carries ~1 MB of baked mesh, so it loads last; until then charges use the fire burst. */
  private rolling: Factory | null = null
  private camera: THREE.Camera | null = null
  private readonly boltRoot = new THREE.Group()

  constructor(private readonly renderer: THREE.WebGLRenderer) {
    this.boltRoot.scale.setScalar(BOLT_SCALE)
    this.root.add(this.boltRoot)
  }

  /** Load the effect modules and compile their shaders; effects requested earlier are skipped. */
  async load(scene: THREE.Scene, camera: THREE.Camera): Promise<void> {
    this.camera = camera
    this.factories = await loadFactories()
    this.prewarm(scene, camera)
    const rolling = await import('./vendor/effect-rolling-fireburst.js')
    this.rolling = rolling.default
    this.prewarmOne(scene, camera, this.rolling({ size: 0.42 }))
  }

  private add(fx: SceneVfx): SceneVfx {
    noOutline(fx.group)
    this.root.add(fx.group)
    this.active.add(fx)
    return fx
  }

  private spawn(style: AttackStyle, scale: number): SceneVfx {
    const f = this.factories!
    const low = this.quality === 'low'
    if (style === 'melee') {
      return f.slash({
        size: 0.55 * scale,
        density: low ? 0.12 : 0.3,
        quantity: low ? 8 : 14,
        panelCount: low ? 0 : 6,
        spread: 1.2,
        speed: 1.2,
        color: '#8fb4ff',
      })
    }
    if (style === 'charge' && this.rolling) return this.rolling({ size: 0.42 * scale, speed: 1.15 })
    return f.fire({ size: 0.4 * scale, density: low ? 0.2 : 0.5, speed: 1.15, color: '#ff7a26' })
  }

  /** Capture burst at a world point; `scale` 1 is a board-sized pop, larger for cutscenes. */
  burst(style: AttackStyle, at: THREE.Vector3, scale = 1): void {
    if (!this.factories) return
    const fx = this.add(this.spawn(style, scale))
    fx.group.position.copy(at)
    fx.hit?.(at.clone())
  }

  /** The checkmate finisher: a star-ring detonation over the fallen king. */
  mateBurst(at: THREE.Vector3): void {
    if (!this.factories) return
    const low = this.quality === 'low'
    const fx = this.add(this.factories.mate({ size: 0.9, density: low ? 0.2 : 0.5, quantity: low ? 6 : 10, color: '#ffd76a' }))
    fx.group.position.copy(at)
    fx.hit?.(at.clone())
  }

  /** Cannon fireball from `from` to `to` (world points) arriving after about `flight` seconds. */
  bolt(from: THREE.Vector3, to: THREE.Vector3, flight: number): boolean {
    if (!this.factories) return false
    const start = from.clone().divideScalar(BOLT_SCALE)
    const end = to.clone().divideScalar(BOLT_SCALE)
    const dir = end.clone().sub(start)
    const range = dir.length()
    const b = new this.factories.Bolt({ quality: this.quality === 'low' ? 'low' : 'high' })
    noOutline(b.group)
    this.boltRoot.add(b.group)
    b.launch(start, dir.normalize(), {
      maxRange: range,
      castDuration: 0.04,
      speed: range / Math.max(0.05, flight - 0.04),
      impactDuration: 0.6,
    })
    this.bolts.add(b)
    return true
  }

  cancelBolts(): void {
    for (const b of this.bolts) b.dispose()
    this.bolts.clear()
  }

  /** Red circle under a checked king; replaces any previous warning. */
  warnCheck(at: THREE.Vector3): void {
    this.checkWarning?.stop()
    if (!this.factories) return
    const fx = this.add(this.factories.circle({ size: 0.62, warningDuration: 0.9, progressMode: 'auto', color: '#ff303e' }))
    fx.group.position.copy(at)
    this.checkWarning = fx
  }

  clearCheck(): void {
    this.checkWarning?.stop()
    this.checkWarning = null
  }

  update(dt: number): void {
    for (const fx of this.active) {
      fx.update(dt)
      if (fx.finished) {
        this.root.remove(fx.group)
        fx.dispose()
        this.active.delete(fx)
        if (fx === this.checkWarning) this.checkWarning = null
      }
    }
    if (this.bolts.size) {
      const cam = this.camera ? this.camera.position.clone().divideScalar(BOLT_SCALE) : undefined
      for (const b of this.bolts) {
        if (b.step(dt, cam) === 'done') {
          b.dispose()
          this.bolts.delete(b)
        }
      }
    }
  }

  clear(): void {
    for (const fx of this.active) {
      this.root.remove(fx.group)
      fx.dispose()
    }
    this.active.clear()
    this.cancelBolts()
    this.checkWarning = null
  }

  /** Compile every effect's shaders up front so the first capture does not hitch. */
  private prewarm(scene: THREE.Scene, camera: THREE.Camera): void {
    const f = this.factories!
    const temp = [
      ...(['melee', 'ranged'] as const).map((s) => this.spawn(s, 1)),
      f.mate({ size: 0.9 }),
      f.circle({ size: 0.6 }),
    ]
    for (const fx of temp) {
      fx.hit?.()
      fx.update(0.3)
      this.root.add(fx.group)
    }
    const bolt = new f.Bolt()
    bolt.launch(new THREE.Vector3(0, 1, 2), new THREE.Vector3(0, 0, -1), { maxRange: 4 })
    bolt.step(0.3)
    this.boltRoot.add(bolt.group)
    this.renderer.compile(scene, camera)
    for (const fx of temp) {
      this.root.remove(fx.group)
      fx.dispose()
    }
    bolt.dispose()
  }

  private prewarmOne(scene: THREE.Scene, camera: THREE.Camera, fx: SceneVfx): void {
    fx.update(0.3)
    this.root.add(fx.group)
    this.renderer.compile(scene, camera)
    this.root.remove(fx.group)
    fx.dispose()
  }
}
