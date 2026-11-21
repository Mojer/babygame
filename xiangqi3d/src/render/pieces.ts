import * as THREE from 'three'
import type { Piece, PieceKind, Side } from '../rules/position'
import { GRASS_TOP } from './board'
import { type ModelPart, type Role, modelParts } from './models'
import { mesh, toon, withoutOutline } from './toon'

const NAMES: Record<Side, Record<PieceKind, string>> = {
  red: { king: '帥', advisor: '仕', elephant: '相', rook: '俥', horse: '傌', cannon: '炮', pawn: '兵' },
  black: { king: '將', advisor: '士', elephant: '象', rook: '車', horse: '馬', cannon: '砲', pawn: '卒' },
}

export function pieceName(piece: Piece): string {
  return NAMES[piece.side][piece.kind]
}

interface Palette {
  main: number
  trim: number
  plume: number
  ink: string
}

const PALETTE: Record<Side, Palette> = {
  red: { main: 0xe0483e, trim: 0xffc94a, plume: 0xffe066, ink: '#c8281e' },
  black: { main: 0x3b4256, trim: 0xc9d3e0, plume: 0xffffff, ink: '#1f2638' },
}

const SKIN = 0xffd9b8
const WOOD = 0xc08850
const DARK = 0x3a2a22
const BASE_TOP = 0.12

const nameTextures = new Map<string, THREE.CanvasTexture>()

function nameTexture(piece: Piece): THREE.CanvasTexture {
  const key = `${piece.side}-${piece.kind}`
  let tex = nameTextures.get(key)
  if (tex) return tex
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff6e2'
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = 12
  ctx.strokeStyle = PALETTE[piece.side].ink
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 18, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = PALETTE[piece.side].ink
  ctx.font = `bold ${size * 0.6}px "PingFang TC", "Noto Serif TC", "Microsoft JhengHei", serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(pieceName(piece), size / 2, size / 2 + size * 0.03)
  tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  nameTextures.set(key, tex)
  return tex
}

// ---------- figure builders (local front = +z, feet at y = 0) ----------

function face(head: THREE.Object3D, r: number, y: number): void {
  for (const sx of [-1, 1]) {
    const eye = mesh(new THREE.SphereGeometry(r * 0.13, 10, 8), DARK)
    eye.position.set(sx * r * 0.36, y + r * 0.05, r * 0.9)
    eye.scale.set(1, 1.3, 0.6)
    const cheek = new THREE.Mesh(new THREE.CircleGeometry(r * 0.15, 16), withoutOutline(new THREE.MeshBasicMaterial({ color: 0xff9aa2 })))
    cheek.position.set(sx * r * 0.55, y - r * 0.22, r * 0.84)
    cheek.rotation.y = sx * 0.55
    head.add(eye, cheek)
  }
}

function humanoid(p: Palette): { root: THREE.Group; head: THREE.Group; handL: THREE.Object3D; handR: THREE.Object3D } {
  const root = new THREE.Group()
  for (const sx of [-1, 1]) {
    const leg = mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.12, 8), DARK)
    leg.position.set(sx * 0.06, 0.06, 0)
    root.add(leg)
  }
  const body = mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.24, 14), p.main)
  body.position.y = 0.23
  const belt = mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.04, 14), p.trim)
  belt.position.y = 0.2
  root.add(body, belt)

  const head = new THREE.Group()
  head.position.y = 0.5
  const skull = mesh(new THREE.SphereGeometry(0.19, 20, 16), SKIN)
  head.add(skull)
  face(head, 0.19, 0)
  root.add(head)

  const handL = mesh(new THREE.SphereGeometry(0.05, 10, 8), SKIN)
  handL.position.set(-0.17, 0.25, 0.04)
  const handR = mesh(new THREE.SphereGeometry(0.05, 10, 8), SKIN)
  handR.position.set(0.17, 0.25, 0.04)
  root.add(handL, handR)
  return { root, head, handL, handR }
}

function buildKing(p: Palette): THREE.Group {
  const h = humanoid(p)
  const crownBand = mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.08, 16, 1, true), p.trim)
  crownBand.position.y = 0.17
  h.head.add(crownBand)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const spike = mesh(new THREE.ConeGeometry(0.035, 0.09, 6), p.trim)
    spike.position.set(Math.sin(a) * 0.14, 0.25, Math.cos(a) * 0.14)
    h.head.add(spike)
  }
  const gem = mesh(new THREE.SphereGeometry(0.03, 8, 6), p.plume === 0xffffff ? 0x6fd3ff : 0xff3355)
  gem.position.set(0, 0.17, 0.16)
  h.head.add(gem)
  const capeMat = toon(p.main).clone()
  capeMat.side = THREE.DoubleSide
  const cape = mesh(new THREE.ConeGeometry(0.22, 0.36, 16, 1, true, Math.PI * 0.6, Math.PI * 0.8), capeMat)
  cape.position.set(0, 0.25, -0.02)
  h.root.add(cape)
  return h.root
}

function buildAdvisor(p: Palette): THREE.Group {
  const h = humanoid(p)
  const helmet = mesh(new THREE.SphereGeometry(0.2, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), p.main)
  helmet.position.y = 0.03
  const knob = mesh(new THREE.SphereGeometry(0.04, 8, 6), p.trim)
  knob.position.y = 0.24
  h.head.add(helmet, knob)
  const shield = mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 18), p.trim)
  shield.rotation.z = Math.PI / 2
  shield.rotation.y = Math.PI / 2
  shield.position.set(-0.2, 0.26, 0.08)
  shield.rotation.x = 0.3
  h.root.add(shield)
  return h.root
}

function buildPawn(p: Palette): THREE.Group {
  const h = humanoid(p)
  const helmet = mesh(new THREE.ConeGeometry(0.21, 0.2, 16), p.main)
  helmet.position.y = 0.17
  const plume = mesh(new THREE.SphereGeometry(0.05, 8, 6), p.plume)
  plume.position.y = 0.29
  h.head.add(helmet, plume)
  const shaft = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.62, 6), WOOD)
  shaft.position.set(0.2, 0.36, 0.05)
  const tip = mesh(new THREE.ConeGeometry(0.04, 0.1, 6), p.trim)
  tip.position.set(0.2, 0.72, 0.05)
  h.root.add(shaft, tip)
  return h.root
}

function buildElephant(p: Palette): THREE.Group {
  const root = new THREE.Group()
  const grey = 0xb6c2cf
  const body = mesh(new THREE.SphereGeometry(0.24, 20, 16), grey)
  body.scale.set(1, 0.85, 1.15)
  body.position.y = 0.28
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const leg = mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.16, 8), grey)
    leg.position.set(sx * 0.12, 0.08, sz * 0.13)
    root.add(leg)
  }
  const blanket = mesh(new THREE.BoxGeometry(0.34, 0.05, 0.3), p.main)
  blanket.position.set(0, 0.48, -0.02)
  const head = mesh(new THREE.SphereGeometry(0.18, 18, 14), grey)
  head.position.set(0, 0.42, 0.25)
  face(head, 0.18, 0.02)
  const trunk = mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.2, 8), grey)
  trunk.position.set(0, -0.1, 0.17)
  trunk.rotation.x = 0.5
  head.add(trunk)
  for (const sx of [-1, 1]) {
    const ear = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 16), 0xf1b6c0)
    ear.rotation.z = Math.PI / 2
    ear.position.set(sx * 0.18, 0.02, -0.03)
    ear.rotation.y = sx * 0.4
    head.add(ear)
    const tusk = mesh(new THREE.ConeGeometry(0.02, 0.08, 6), 0xffffff)
    tusk.position.set(sx * 0.07, -0.11, 0.13)
    tusk.rotation.x = 1.9
    head.add(tusk)
  }
  const tassel = mesh(new THREE.SphereGeometry(0.04, 8, 6), p.trim)
  tassel.position.set(0, 0.17, 0.02)
  head.add(tassel)
  root.add(body, blanket, head)
  return root
}

function buildHorse(p: Palette): THREE.Group {
  const root = new THREE.Group()
  const coat = 0xf3dcb0
  const body = mesh(new THREE.CapsuleGeometry(0.13, 0.22, 6, 14), coat)
  body.rotation.x = Math.PI / 2
  body.position.y = 0.3
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const leg = mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.22, 8), coat)
    leg.position.set(sx * 0.08, 0.11, sz * 0.13)
    const hoof = mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.04, 8), DARK)
    hoof.position.set(sx * 0.08, 0.02, sz * 0.13)
    root.add(leg, hoof)
  }
  const neck = mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.22, 10), coat)
  neck.position.set(0, 0.45, 0.17)
  neck.rotation.x = 0.45
  const head = mesh(new THREE.SphereGeometry(0.15, 18, 14), coat)
  head.position.set(0, 0.58, 0.24)
  face(head, 0.15, 0.03)
  const snout = mesh(new THREE.SphereGeometry(0.08, 12, 10), 0xffeedd)
  snout.position.set(0, -0.06, 0.12)
  head.add(snout)
  for (const sx of [-1, 1]) {
    const ear = mesh(new THREE.ConeGeometry(0.035, 0.09, 6), coat)
    ear.position.set(sx * 0.07, 0.15, -0.02)
    head.add(ear)
  }
  const mane = mesh(new THREE.BoxGeometry(0.05, 0.12, 0.26), p.main)
  mane.position.set(0, 0.55, 0.1)
  mane.rotation.x = 0.4
  const saddle = mesh(new THREE.BoxGeometry(0.28, 0.06, 0.2), p.main)
  saddle.position.set(0, 0.43, -0.03)
  const saddleTrim = mesh(new THREE.BoxGeometry(0.3, 0.02, 0.22), p.trim)
  saddleTrim.position.set(0, 0.405, -0.03)
  const tail = mesh(new THREE.ConeGeometry(0.05, 0.18, 8), p.main)
  tail.position.set(0, 0.3, -0.29)
  tail.rotation.x = -2.3
  root.add(body, neck, head, mane, saddle, saddleTrim, tail)
  return root
}

function wheel(x: number, z: number, r: number): THREE.Mesh {
  const w = mesh(new THREE.CylinderGeometry(r, r, 0.05, 16), WOOD)
  w.rotation.z = Math.PI / 2
  w.position.set(x, r, z)
  const hub = mesh(new THREE.CylinderGeometry(r * 0.35, r * 0.35, 0.07, 10), DARK)
  w.add(hub)
  return w
}

function buildRook(p: Palette): THREE.Group {
  const root = new THREE.Group()
  const cart = mesh(new THREE.BoxGeometry(0.34, 0.18, 0.36), WOOD)
  cart.position.y = 0.24
  const rim = mesh(new THREE.BoxGeometry(0.38, 0.05, 0.4), p.main)
  rim.position.y = 0.35
  root.add(cart, rim, wheel(-0.2, -0.02, 0.13), wheel(0.2, -0.02, 0.13))
  const pole = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6), DARK)
  pole.position.set(0.1, 0.6, -0.1)
  const flag = mesh(new THREE.BoxGeometry(0.02, 0.15, 0.22), p.main)
  flag.position.set(0.1, 0.76, 0.01)
  const flagTip = mesh(new THREE.SphereGeometry(0.03, 8, 6), p.trim)
  flagTip.position.set(0.1, 0.86, -0.1)
  const shaft = mesh(new THREE.BoxGeometry(0.04, 0.04, 0.2), WOOD)
  shaft.position.set(0, 0.2, 0.26)
  root.add(pole, flag, flagTip, shaft)
  return root
}

function buildCannon(p: Palette): THREE.Group {
  const root = new THREE.Group()
  const carriage = mesh(new THREE.BoxGeometry(0.26, 0.1, 0.3), WOOD)
  carriage.position.y = 0.17
  root.add(carriage, wheel(-0.17, -0.02, 0.12), wheel(0.17, -0.02, 0.12))
  const barrel = mesh(new THREE.CylinderGeometry(0.075, 0.1, 0.42, 16), 0x555b66)
  barrel.rotation.x = Math.PI / 2 - 0.35
  barrel.position.set(0, 0.3, 0.05)
  const band = mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.05, 16), p.main)
  band.position.y = -0.1
  const band2 = mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.04, 16), p.trim)
  band2.position.y = 0.17
  barrel.add(band, band2)
  const muzzleFace = new THREE.Group()
  face(muzzleFace, 0.1, 0)
  muzzleFace.position.set(0, -0.02, -0.02)
  barrel.add(muzzleFace)
  const fuse = mesh(new THREE.SphereGeometry(0.03, 8, 6), 0xffb02e)
  fuse.position.set(0, 0.34, -0.13)
  root.add(barrel, fuse)
  return root
}

const BUILDERS: Record<PieceKind, (p: Palette) => THREE.Group> = {
  king: buildKing,
  advisor: buildAdvisor,
  elephant: buildElephant,
  horse: buildHorse,
  rook: buildRook,
  cannon: buildCannon,
  pawn: buildPawn,
}

// ---------- Blender figures ----------

const flatCache = new Map<number, THREE.MeshBasicMaterial>()

/** Unlit and outline-free, for blush and eye highlights. */
function flat(color: number): THREE.MeshBasicMaterial {
  let m = flatCache.get(color)
  if (!m) {
    m = withoutOutline(new THREE.MeshBasicMaterial({ color }))
    flatCache.set(color, m)
  }
  return m
}

function roleMaterial(role: Role, side: Side): THREE.Material {
  const p = PALETTE[side]
  switch (role) {
    case 'main': return toon(p.main)
    case 'trim': return toon(p.trim)
    case 'plume': return toon(p.plume)
    case 'skin': return toon(SKIN)
    case 'hair': return toon(0x4a3428)
    case 'dark': return toon(DARK)
    case 'wood': return toon(WOOD)
    case 'metal': return toon(0x5b6270)
    case 'grey': return toon(0xb6c2cf)
    case 'coat': return toon(0xf3dcb0)
    case 'snout': return toon(0xffeedd)
    case 'pink': return toon(0xf1b6c0)
    case 'white': return toon(0xfbf8f0)
    case 'gem': return toon(side === 'red' ? 0xff3355 : 0x6fd3ff)
    case 'fuse': return toon(0xffb02e)
    case 'cheek': return flat(0xff9aa2)
    case 'eyehi': return flat(0xffffff)
  }
}

function buildFromModel(parts: ModelPart[], side: Side): THREE.Group {
  const root = new THREE.Group()
  for (const part of parts) {
    const m = new THREE.Mesh(part.geometry, roleMaterial(part.role, side))
    const tiny = part.role === 'cheek' || part.role === 'eyehi'
    m.castShadow = !tiny
    m.receiveShadow = !tiny
    root.add(m)
  }
  return root
}

// ---------- piece view ----------

export class PieceView {
  readonly root = new THREE.Group()
  readonly figure: THREE.Group
  private readonly lift = new THREE.Group()
  private phase = Math.random() * Math.PI * 2
  private selected = false
  private hop = 0
  private tween: { from: THREE.Vector3; to: THREE.Vector3; t: number; dur: number; resolve: () => void } | null = null
  private dying: { t: number; resolve: () => void } | null = null

  constructor(readonly piece: Piece) {
    const p = PALETTE[piece.side]
    const owner = piece.side === 'red' ? 1 : -1

    const base = mesh(new THREE.CylinderGeometry(0.43, 0.45, BASE_TOP, 32), 0xf5e6c8)
    base.position.y = BASE_TOP / 2
    const rim = mesh(new THREE.TorusGeometry(0.43, 0.025, 8, 40), p.main)
    rim.rotation.x = Math.PI / 2
    rim.position.y = BASE_TOP
    this.lift.add(base, rim)

    const label = new THREE.Mesh(
      new THREE.CircleGeometry(0.2, 32),
      withoutOutline(new THREE.MeshToonMaterial({ map: nameTexture(piece), alphaTest: 0.5 })),
    )
    label.rotation.x = -Math.PI / 2
    if (piece.side === 'black') label.rotation.z = Math.PI
    label.position.set(0, BASE_TOP + 0.003, owner * 0.21)
    label.receiveShadow = true
    this.lift.add(label)

    const parts = modelParts(piece.kind)
    this.figure = parts ? buildFromModel(parts, piece.side) : BUILDERS[piece.kind](p)
    this.figure.scale.setScalar(0.85)
    this.figure.position.set(0, BASE_TOP, -owner * 0.17)
    this.figure.rotation.y = piece.side === 'red' ? Math.PI : 0
    this.lift.add(this.figure)
    this.root.add(this.lift)
  }

  setSelected(on: boolean): void {
    this.selected = on
  }

  moveTo(target: THREE.Vector3, dur = 0.38): Promise<void> {
    return new Promise((resolve) => {
      this.tween = { from: this.root.position.clone(), to: target.clone(), t: 0, dur, resolve }
    })
  }

  die(): Promise<void> {
    return new Promise((resolve) => {
      this.dying = { t: 0, resolve }
    })
  }

  tick(dt: number, t: number): void {
    this.figure.position.y = BASE_TOP + Math.abs(Math.sin(t * 2.2 + this.phase)) * 0.015
    this.hop = THREE.MathUtils.damp(this.hop, this.selected ? 1 : 0, 12, dt)
    this.lift.position.y = this.hop * (0.18 + Math.abs(Math.sin(t * 7)) * 0.08)

    if (this.tween) {
      const tw = this.tween
      tw.t = Math.min(1, tw.t + dt / tw.dur)
      const k = tw.t < 0.5 ? 2 * tw.t * tw.t : 1 - Math.pow(-2 * tw.t + 2, 2) / 2
      this.root.position.lerpVectors(tw.from, tw.to, k)
      this.root.position.y = tw.from.y + Math.sin(tw.t * Math.PI) * 0.6
      if (tw.t >= 1) {
        this.tween = null
        tw.resolve()
      }
    }

    if (this.dying) {
      const d = this.dying
      d.t = Math.min(1, d.t + dt / 0.45)
      this.root.scale.setScalar(Math.max(0.001, 1 - d.t))
      this.root.rotation.y += dt * 14
      this.root.position.y = GRASS_TOP + Math.sin(d.t * Math.PI) * 0.5
      if (d.t >= 1) {
        this.dying = null
        d.resolve()
      }
    }
  }
}
