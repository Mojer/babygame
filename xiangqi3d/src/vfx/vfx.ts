import * as THREE from 'three'
import type { SceneVfx } from './vendor/vfx-asset'
import { NO_OUTLINE } from '../render/toon'

export type AttackStyle = 'melee' | 'charge' | 'ranged'
export type Quality = 'high' | 'low'

type Factory = (o?: Record<string, unknown>) => SceneVfx

interface Factories {
  bursts: Record<AttackStyle, Factory>
  circle: Factory
}

/** The effect modules are large, so they load after the menu is up instead of blocking startup. */
async function loadFactories(): Promise<Factories> {
  const [shock, fire, energy, circle] = await Promise.all([
    import('./vendor/effect-shockwave.js'),
    import('./vendor/effect-fire-explosion.js'),
    import('./vendor/effect-energy-burst.js'),
    import('./vendor/effect-spell-indicator-circle.js'),
  ])
  return { bursts: { melee: shock.default, charge: fire.default, ranged: energy.default }, circle: circle.default }
}

/** Owns every live 00GameDevs scene effect: spawns, updates and disposes them. */
export class VfxManager {
  readonly root = new THREE.Group()
  private readonly active = new Set<SceneVfx>()
  private checkWarning: SceneVfx | null = null
  quality: Quality = 'high'
  private factories: Factories | null = null

  constructor(private readonly renderer: THREE.WebGLRenderer) {}

  /** Load the effect modules and compile their shaders; effects requested earlier are skipped. */
  async load(scene: THREE.Scene, camera: THREE.Camera): Promise<void> {
    this.factories = await loadFactories()
    this.prewarm(scene, camera)
  }

  private add(fx: SceneVfx): SceneVfx {
    // OutlineEffect would try to outline the effects' custom shaders
    fx.group.traverse((o) => {
      const m = (o as THREE.Mesh).material
      for (const mat of Array.isArray(m) ? m : m ? [m] : []) mat.userData.outlineParameters = NO_OUTLINE
    })
    this.root.add(fx.group)
    this.active.add(fx)
    return fx
  }

  /** Capture burst at a world point; `scale` 1 is a board-sized pop, larger for cutscenes. */
  burst(style: AttackStyle, at: THREE.Vector3, scale = 1): void {
    if (!this.factories) return
    const density = this.quality === 'high' ? 0.5 : 0.2
    const fx = this.add(this.factories.bursts[style]({ size: 0.35 * scale, density, speed: 1.15 }))
    fx.group.position.copy(at)
    fx.hit?.(at.clone())
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
  }

  clear(): void {
    for (const fx of this.active) {
      this.root.remove(fx.group)
      fx.dispose()
    }
    this.active.clear()
    this.checkWarning = null
  }

  /** Compile every effect's shaders up front so the first capture does not hitch. */
  private prewarm(scene: THREE.Scene, camera: THREE.Camera): void {
    const f = this.factories!
    const temp = [...Object.values(f.bursts).map((make) => make({ size: 0.35 })), f.circle({ size: 0.6 })]
    for (const fx of temp) {
      fx.hit?.()
      fx.update(0.3)
      this.root.add(fx.group)
    }
    this.renderer.compile(scene, camera)
    for (const fx of temp) {
      this.root.remove(fx.group)
      fx.dispose()
    }
  }
}
