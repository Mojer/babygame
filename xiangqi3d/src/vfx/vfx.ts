import * as THREE from 'three'
import createShockwave from './vendor/effect-shockwave.js'
import createFireExplosion from './vendor/effect-fire-explosion.js'
import createEnergyBurst from './vendor/effect-energy-burst.js'
import createCircleWarning from './vendor/effect-spell-indicator-circle.js'
import type { SceneVfx } from './vendor/vfx-asset'
import { NO_OUTLINE } from '../render/toon'

export type AttackStyle = 'melee' | 'charge' | 'ranged'
export type Quality = 'high' | 'low'

const BURSTS: Record<AttackStyle, (o?: Record<string, unknown>) => SceneVfx> = {
  melee: createShockwave,
  charge: createFireExplosion,
  ranged: createEnergyBurst,
}

/** Owns every live 00GameDevs scene effect: spawns, updates and disposes them. */
export class VfxManager {
  readonly root = new THREE.Group()
  private readonly active = new Set<SceneVfx>()
  private checkWarning: SceneVfx | null = null
  quality: Quality = 'high'

  constructor(private readonly renderer: THREE.WebGLRenderer) {}

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
    const density = this.quality === 'high' ? 0.5 : 0.2
    const fx = this.add(BURSTS[style]({ size: 0.35 * scale, density, speed: 1.15 }))
    fx.group.position.copy(at)
    fx.hit?.(at.clone())
  }

  /** Red circle under a checked king; replaces any previous warning. */
  warnCheck(at: THREE.Vector3): void {
    this.checkWarning?.stop()
    const fx = this.add(createCircleWarning({ size: 0.62, warningDuration: 0.9, progressMode: 'auto', color: '#ff303e' }))
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
  prewarm(scene: THREE.Scene, camera: THREE.Camera): void {
    const temp = [...Object.values(BURSTS).map((make) => make({ size: 0.35 })), createCircleWarning({ size: 0.6 })]
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
