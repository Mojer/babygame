import * as THREE from 'three'
import type { SceneVfx } from './vendor/vfx-asset'
import type { HyperdimensionalSoulFireballVFX } from './vendor/effect-flame-magic-bolt.js'
import type { WeaponSmearVfx } from './vendor/effect-weapon-smear.js'
import type { PieceKind } from '../rules/position'
import { NO_OUTLINE } from '../render/toon'

export type AttackStyle = 'melee' | 'charge' | 'ranged'
export type Quality = 'high' | 'low'

type Factory = (o?: Record<string, unknown>) => SceneVfx
type BoltClass = typeof HyperdimensionalSoulFireballVFX

interface Factories {
  sweep: Factory
  swordWave: Factory
  dust: Factory
  smear: (o?: Record<string, unknown>) => WeaponSmearVfx
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
  const [sweep, swordWave, dust, smear, fire, mate, circle, bolt] = await Promise.all([
    import('./vendor/effect-azure-sweep.js'),
    import('./vendor/effect-energy-sword-wave.js'),
    import('./vendor/effect-shockwave.js'),
    import('./vendor/effect-weapon-smear.js'),
    import('./vendor/effect-fire-explosion.js'),
    import('./vendor/effect-astral-convergence.js'),
    import('./vendor/effect-spell-indicator-circle.js'),
    import('./vendor/effect-flame-magic-bolt.js'),
  ])
  return {
    sweep: sweep.default,
    swordWave: swordWave.default,
    dust: dust.default,
    smear: smear.default,
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
  /** Invisible spear pivots swung each frame so the weapon-smear trail has something to follow. */
  private readonly swings = new Set<{ pivot: THREE.Object3D; fx: WeaponSmearVfx; t: number; yaw: number }>()

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

  /** Point bursts that only need a position; the directional ones are handled in capture(). */
  private spawn(kind: PieceKind, scale: number): SceneVfx {
    const f = this.factories!
    const low = this.quality === 'low'
    const density = low ? 0.2 : 0.5
    switch (kind) {
      case 'king':
      case 'advisor':
        return f.sweep({ size: 0.42 * scale, density, speed: 1.1, color: kind === 'king' ? '#ffcf4a' : '#5a9bff' })
      case 'elephant':
        // the default sand colour vanishes on the grass; a darker, bigger cloud reads as a stomp
        return f.dust({ size: Math.min(2, 0.9 * scale), density: low ? 0.5 : 1, detail: 2, speed: 1.1, color: '#8a5a2b' })
      case 'rook':
        if (this.rolling) return this.rolling({ size: 0.42 * scale, speed: 1.15 })
        return f.fire({ size: 0.4 * scale, density, speed: 1.15, color: '#ff7a26' })
      default:
        return f.fire({ size: 0.4 * scale, density, speed: 1.15, color: '#ff7a26' })
    }
  }

  /**
   * Capture effect for the attacking piece kind at the victim's square; `dir` is the
   * attack direction on the board and `scale` 1 is a board-sized pop, larger in cutscenes.
   */
  capture(kind: PieceKind, at: THREE.Vector3, dir: THREE.Vector3, scale = 1): void {
    if (!this.factories) return
    const flat = dir.clone().setY(0)
    if (flat.lengthSq() < 1e-6) flat.set(0, 0, 1)
    flat.normalize()
    if (kind === 'pawn') return this.spearSwing(at, flat, scale)
    if (kind === 'horse') {
      // crescent waves launched from just behind the victim, flying along the attack
      const fx = this.add(
        this.factories.swordWave({ size: 0.25, quantity: this.quality === 'low' ? 1 : 3, spread: 0.45, speed: 1.3, theme: 'azure' }),
      )
      // size bottoms out at 0.25, still several squares wide, so shrink the object itself
      fx.group.scale.setScalar(0.45 * scale)
      fx.group.position.copy(at).addScaledVector(flat, -0.6 * scale)
      fx.group.rotation.y = Math.atan2(flat.x, flat.z)
      return
    }
    const fx = this.add(this.spawn(kind, scale))
    fx.group.position.copy(at)
    fx.hit?.(at.clone())
  }

  /** A pawn's spear slash: an invisible blade swept across the victim drives the smear trail. */
  private spearSwing(at: THREE.Vector3, dir: THREE.Vector3, scale: number): void {
    const f = this.factories!
    const pivot = new THREE.Object3D()
    pivot.position.copy(at).addScaledVector(dir, -0.45 * scale)
    pivot.position.y += 0.45 * scale
    pivot.rotation.order = 'YXZ'
    const yaw = Math.atan2(dir.x, dir.z) - Math.PI / 2
    pivot.rotation.set(0, yaw - 1.1, 0.45)
    this.root.add(pivot)
    pivot.updateMatrixWorld(true)
    // detail is the trail brightness; the default is too faint against the sunny board
    const fx = f.smear({ size: 1, speed: 0.6, detail: 2, density: this.quality === 'low' ? 0.4 : 1, color: '#5aa0ff' })
    fx.attachWeapon(pivot, { base: [0.15 * scale, 0, 0], tip: [0.85 * scale, 0, 0] })
    fx.reset()
    this.add(fx)
    this.swings.add({ pivot, fx, t: 0, yaw })
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
    // move the spear pivots first so the smear samples this frame's blade
    for (const sw of this.swings) {
      sw.t = Math.min(1, sw.t + dt / 0.24)
      const k = 1 - Math.pow(1 - sw.t, 3)
      sw.pivot.rotation.y = sw.yaw - 1.1 + 2.2 * k
      sw.pivot.updateMatrixWorld(true)
      if (sw.t >= 1) {
        sw.fx.stop()
        this.root.remove(sw.pivot)
        this.swings.delete(sw)
      }
    }
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
    for (const sw of this.swings) this.root.remove(sw.pivot)
    this.swings.clear()
    this.cancelBolts()
    this.checkWarning = null
  }

  /** Compile every effect's shaders up front so the first capture does not hitch. */
  private prewarm(scene: THREE.Scene, camera: THREE.Camera): void {
    const f = this.factories!
    const temp = [
      ...(['king', 'elephant', 'cannon'] as const).map((k) => this.spawn(k, 1)),
      f.swordWave({ size: 0.25 }),
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
