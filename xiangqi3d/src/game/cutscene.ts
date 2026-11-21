import * as THREE from 'three'
import type { Piece, PieceKind } from '../rules/position'
import { GRASS_TOP, squareToWorld } from '../render/board'
import type { PieceView } from '../render/pieces'
import type { Stage } from '../render/stage'
import { type AttackStyle, STYLE_COLOR, type VfxManager } from '../vfx/vfx'
import { sound } from '../audio/sound'

export type CutsceneMode = 'all' | 'major' | 'off'

const STYLE: Record<PieceKind, AttackStyle> = {
  pawn: 'melee', advisor: 'melee', elephant: 'melee', king: 'melee', horse: 'melee',
  rook: 'charge',
  cannon: 'ranged',
}

export const attackStyle = (kind: PieceKind): AttackStyle => STYLE[kind]

const MAJOR: PieceKind[] = ['rook', 'horse', 'cannon']

/** Decide whether a capture earns a battle cutscene; a mating capture always does. */
export function wantsCutscene(mode: CutsceneMode, attacker: Piece, victim: Piece, mating: boolean): boolean {
  if (mating) return true
  if (mode === 'all') return true
  if (mode === 'major') return MAJOR.includes(victim.kind) || attacker.kind === 'rook'
  return false
}

interface Anim {
  t: number
  dur: number
  fn: (k: number) => void
  done: () => void
}

const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)
const easeIn = (k: number) => k * k * k
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3)

/**
 * Short (≤1.5 s) skippable battle scenes. Every step is an Anim or a wait driven by the
 * stage clock; skip() runs every remaining step to its end state immediately.
 */
export class BattleCutscene {
  private readonly anims = new Set<Anim>()
  private skipping = false
  private playing = false
  private readonly projectile: THREE.Mesh

  constructor(
    private readonly stage: Stage,
    private readonly vfx: VfxManager,
  ) {
    stage.onTick((dt) => {
      for (const a of this.anims) {
        a.t = Math.min(1, a.t + dt / a.dur)
        a.fn(a.t)
        if (a.t >= 1) {
          this.anims.delete(a)
          a.done()
        }
      }
    })
    this.projectile = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xffe066 }),
    )
    this.projectile.visible = false
    stage.scene.add(this.projectile)
  }

  get active(): boolean {
    return this.playing
  }

  skip(): void {
    if (!this.playing) return
    this.skipping = true
    this.vfx.cancelBolts()
    for (const a of [...this.anims]) {
      this.anims.delete(a)
      a.fn(1)
      a.done()
    }
  }

  private animate(dur: number, fn: (k: number) => void): Promise<void> {
    if (this.skipping) {
      fn(1)
      return Promise.resolve()
    }
    return new Promise((done) => this.anims.add({ t: 0, dur, fn, done }))
  }

  private wait(sec: number): Promise<void> {
    return this.animate(sec, () => {})
  }

  private async framed(from: THREE.Vector3, to: THREE.Vector3, body: () => Promise<void>): Promise<void> {
    this.playing = true
    this.skipping = false
    this.stage.beginCinematic()
    try {
      const mid = from.clone().lerp(to, 0.5)
      const dir = to.clone().sub(from).setY(0)
      const len = Math.max(dir.length(), 1)
      dir.normalize()
      const side = new THREE.Vector3(-dir.z, 0, dir.x)
      // shoot from the board edge nearest the action so other pieces do not block the view
      const outward = mid.clone().setY(0)
      if (outward.lengthSq() < 0.01) outward.copy(this.stage.camera.position).setY(0)
      if (side.dot(outward) < 0) side.negate()
      // back off until both ends fit the screen width (portrait screens see less sideways)
      const cam = this.stage.camera
      const halfH = Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * cam.aspect)
      const dist = Math.max(4.8, (len / 2 + 1.1) / Math.tan(halfH))
      const camPos = mid.clone().addScaledVector(side, dist * 0.77).add(new THREE.Vector3(0, dist * 0.64, 0))
      const shot = this.stage.shot(camPos, mid.clone().setY(GRASS_TOP + 0.45), 0.3)
      if (!this.skipping) await shot
      await body()
    } finally {
      this.projectile.visible = false
      this.stage.endCinematic(this.skipping ? 0.25 : 0.45)
      this.playing = false
      this.skipping = false
    }
  }

  /** Attacker strikes the victim and ends standing on `toSquare`; the victim view is left shrunk to nothing. */
  playCapture(attacker: PieceView, victim: PieceView, fromSquare: number, toSquare: number, mating = false): Promise<void> {
    const from = squareToWorld(fromSquare)
    const to = squareToWorld(toSquare)
    const style = attackStyle(attacker.piece.kind)
    return this.framed(from, to, async () => {
      const dir = to.clone().sub(from).normalize()
      const strikePos = to.clone().addScaledVector(dir, -0.55)

      if (style === 'melee') {
        await this.animate(0.12, (k) => attacker.root.position.copy(from).addScaledVector(dir, -0.15 * k))
        const start = attacker.root.position.clone()
        await this.animate(0.25, (k) => {
          attacker.root.position.lerpVectors(start, strikePos, easeInOut(k))
          attacker.root.position.y = GRASS_TOP + Math.sin(k * Math.PI) * 0.7
        })
      } else if (style === 'charge') {
        await this.animate(0.1, (k) => (attacker.figure.rotation.x = -0.25 * k))
        await this.animate(0.22, (k) => attacker.root.position.lerpVectors(from, strikePos, easeIn(k)))
        attacker.figure.rotation.x = 0
      } else {
        const muzzle = from.clone().add(new THREE.Vector3(0, 0.45, 0))
        const target = to.clone().add(new THREE.Vector3(0, 0.35, 0))
        await this.animate(0.08, (k) => attacker.root.position.copy(from).addScaledVector(dir, -0.18 * Math.sin(k * Math.PI)))
        const flight = 0.32
        if (!this.skipping && this.vfx.bolt(muzzle, target, flight)) {
          await this.wait(flight)
        } else {
          this.projectile.visible = true
          const arc = 0.6 + from.distanceTo(to) * 0.15
          await this.animate(flight, (k) => {
            this.projectile.position.lerpVectors(muzzle, target, k)
            this.projectile.position.y += Math.sin(k * Math.PI) * arc
          })
          this.projectile.visible = false
        }
      }

      this.strike(attacker, victim, style, to, dir, mating)
      const fling = dir.clone().multiplyScalar(1.6).add(new THREE.Vector3(0, 0, 0))
      await this.animate(0.42, (k) => {
        victim.root.position.copy(to).addScaledVector(fling, easeOut(k))
        victim.root.position.y = GRASS_TOP + Math.sin(k * Math.PI) * 1.1
        victim.root.rotation.z = k * 6
        victim.root.scale.setScalar(Math.max(0.001, 1 - k))
      })

      const before = attacker.root.position.clone()
      await this.animate(0.22, (k) => {
        attacker.root.position.lerpVectors(before, to, easeInOut(k))
        attacker.root.position.y = GRASS_TOP + Math.sin(k * Math.PI) * 0.25
      })
      attacker.root.position.copy(to)
      await this.wait(0.12)
    })
  }

  /** Mate without a capture: the attacker moves, then the defeated king is blasted over. */
  async playCheckmate(attacker: PieceView, fromSquare: number, toSquare: number, king: PieceView, kingSquare: number): Promise<void> {
    await attacker.moveTo(squareToWorld(toSquare))
    const kingPos = squareToWorld(kingSquare)
    void fromSquare
    return this.framed(squareToWorld(toSquare), kingPos, async () => {
      await this.wait(0.15)
      this.strike(attacker, king, 'charge', kingPos, kingPos.clone().sub(attacker.root.position), true)
      await this.animate(0.5, (k) => {
        king.root.rotation.z = easeOut(k) * (Math.PI / 2)
        king.root.position.y = GRASS_TOP + Math.sin(k * Math.PI) * 0.4
      })
      await this.wait(0.35)
    })
  }

  /** Normal hits stay in full colour; only the checkmate gets the black-and-white comic frame. */
  private strike(attacker: PieceView, victim: PieceView, style: AttackStyle, at: THREE.Vector3, dir: THREE.Vector3, mating: boolean): void {
    sound.play('capture')
    if (this.skipping) {
      this.vfx.capture(attacker.piece.kind, at, dir, 1)
      if (mating) this.vfx.mateBurst(at)
      return
    }
    const center = at.clone().setY(GRASS_TOP + 0.35)
    if (mating) {
      this.stage.impact(center, [attacker.root, victim.root])
      this.vfx.mateBurst(at)
      this.stage.hitStop(0.1)
      this.stage.shake(0.35)
    } else {
      this.stage.colorImpact(center, STYLE_COLOR[style])
      this.stage.hitStop(0.07)
      this.stage.shake(0.25)
    }
    this.vfx.capture(attacker.piece.kind, at, dir, 2.2)
  }
}
