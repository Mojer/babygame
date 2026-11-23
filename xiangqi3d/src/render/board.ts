import * as THREE from 'three'
import { FILES, RANKS } from '../rules/position'
import { Diorama, RIVER_HALF } from './diorama'
import { mesh, withoutOutline } from './toon'

export const GRASS_TOP = 0
const LINE = 0xffffff

/** World position of a board square (index = rank * 9 + file); red's back rank is nearest +z. */
export function squareToWorld(index: number, y = GRASS_TOP): THREE.Vector3 {
  const file = index % FILES
  const rank = Math.floor(index / FILES)
  return new THREE.Vector3(file - 4, y, 4.5 - rank)
}

export function worldToSquare(x: number, z: number): number | null {
  const file = Math.round(x + 4)
  const rank = Math.round(4.5 - z)
  if (file < 0 || file >= FILES || rank < 0 || rank >= RANKS) return null
  if (Math.hypot(x - (file - 4), z - (4.5 - rank)) > 0.48) return null
  return rank * FILES + file
}

function textTexture(text: string, color: string, width = 1024, height = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.font = `bold ${height * 0.62}px "PingFang TC", "Noto Serif TC", "Microsoft JhengHei", serif`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2 + height * 0.04)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function lineBar(x1: number, z1: number, x2: number, z2: number, width = 0.045): THREE.Mesh {
  const len = Math.hypot(x2 - x1, z2 - z1)
  const bar = new THREE.Mesh(
    new THREE.PlaneGeometry(len, width),
    withoutOutline(new THREE.MeshBasicMaterial({ color: LINE, transparent: true, opacity: 0.85 })),
  )
  bar.rotation.x = -Math.PI / 2
  bar.rotation.z = -Math.atan2(z2 - z1, x2 - x1)
  bar.position.set((x1 + x2) / 2, GRASS_TOP + 0.004, (z1 + z2) / 2)
  bar.receiveShadow = true
  return bar
}

export class Board {
  readonly root = new THREE.Group()
  private readonly markers = new THREE.Group()
  private readonly diorama = new Diorama()

  constructor() {
    this.root.add(this.diorama.root)

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(7.2, 0.9),
      withoutOutline(new THREE.MeshBasicMaterial({ map: textTexture('楚 河　　　　漢 界', '#ffffff', 2048, 256), transparent: true, opacity: 0.85 })),
    )
    label.rotation.x = -Math.PI / 2
    label.position.y = GRASS_TOP - 0.07
    this.root.add(label)

    this.addGrid()
    this.addDecor()
    this.root.add(this.markers)
  }

  private addGrid(): void {
    const lines = new THREE.Group()
    const z = (rank: number) => 4.5 - rank
    for (let rank = 0; rank < RANKS; rank++) lines.add(lineBar(-4, z(rank), 4, z(rank)))
    for (let file = 0; file < FILES; file++) {
      const x = file - 4
      lines.add(lineBar(x, z(0), x, z(4)), lineBar(x, z(5), x, z(9)))
    }
    for (const [r0, r1] of [[0, 2], [7, 9]]) {
      lines.add(lineBar(-1, z(r0), 1, z(r1)), lineBar(1, z(r0), -1, z(r1)))
    }
    this.root.add(lines)
  }

  private addDecor(): void {
    const rnd = mulberry32(7)
    const flowerColors = [0xffffff, 0xffd34f, 0xff9fc2]
    for (let i = 0; i < 36; i++) {
      const side = rnd() < 0.5 ? -1 : 1
      const x = side * (4.35 + rnd() * 0.5)
      const z = (rnd() - 0.5) * 10.6
      if (Math.abs(z) < RIVER_HALF + 0.15) continue
      const f = mesh(new THREE.SphereGeometry(0.06 + rnd() * 0.04, 8, 6), flowerColors[i % 3])
      f.position.set(x, GRASS_TOP + 0.04, z)
      this.root.add(f)
    }
    for (let i = 0; i < 8; i++) {
      const tuft = mesh(new THREE.ConeGeometry(0.12, 0.3, 5), 0x6fbf4e)
      const zSide = rnd() < 0.5 ? -1 : 1
      tuft.position.set((rnd() - 0.5) * 9.4, GRASS_TOP + 0.13, zSide * (4.95 + rnd() * 0.3))
      this.root.add(tuft)
    }
  }

  tick(t: number): void {
    this.diorama.tick(t)
  }

  /** Show selection ring and legal-move dots; captures get a red ring. */
  showMarkers(
    selected: number | null,
    targets: { square: number; capture: boolean }[],
    lastMove?: { from: number; to: number },
    hint?: { from: number; to: number } | null,
  ): void {
    this.markers.clear()
    if (hint) {
      this.markers.add(this.ring(hint.from, 0x4fd96b, 0.42, 0.56, 1))
      this.markers.add(this.ring(hint.to, 0x4fd96b, 0.3, 0.56, 0.9))
    }
    if (lastMove) {
      for (const sq of [lastMove.from, lastMove.to]) this.markers.add(this.ring(sq, 0xffe08a, 0.36, 0.44, 0.45))
    }
    if (selected !== null) this.markers.add(this.ring(selected, 0xffe08a, 0.4, 0.5, 0.95))
    for (const t of targets) {
      if (t.capture) this.markers.add(this.ring(t.square, 0xff5a4f, 0.4, 0.5, 0.95))
      else this.markers.add(this.dot(t.square))
    }
  }

  private ring(square: number, color: number, inner: number, outer: number, opacity: number): THREE.Mesh {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(inner, outer, 40),
      withoutOutline(new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false })),
    )
    m.rotation.x = -Math.PI / 2
    m.position.copy(squareToWorld(square, GRASS_TOP + 0.012))
    m.renderOrder = 2
    return m
  }

  private dot(square: number): THREE.Mesh {
    const m = new THREE.Mesh(
      new THREE.CircleGeometry(0.16, 24),
      withoutOutline(new THREE.MeshBasicMaterial({ color: 0xfff3a8, transparent: true, opacity: 0.95, depthWrite: false })),
    )
    m.rotation.x = -Math.PI / 2
    m.position.copy(squareToWorld(square, GRASS_TOP + 0.012))
    m.renderOrder = 2
    return m
  }
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export { textTexture }
