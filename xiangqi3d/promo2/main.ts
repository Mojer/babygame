// "Seven classes" film for Q 版象棋王國 (30 s, 120 BPM, 60 beats, 1080p60).
//
// Each class gets one hard zoom on its red piece and one on its black piece (sides
// alternate who goes first), wrapped in motion graphics: side-coloured slabs, giant
// outline glyphs, stat bars and a move grid. Then mirrored
// captures, a red/black face-off and the logo over the floating-diorama map.
//
// drawFrame(B) is a pure function of the beat number. The 3D layer is the game's own
// Board (diorama + map) and PieceView; everything else is drawn on a 2D canvas.

import * as THREE from 'three'
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js'
import { Board, squareToWorld } from '../src/render/board'
import { loadPieceModels } from '../src/render/models'
import { PieceView } from '../src/render/pieces'
import { NO_OUTLINE, withoutOutline } from '../src/render/toon'
import type { Piece, PieceKind, Side } from '../src/rules/position'
import { parseFen, START_FEN } from '../src/rules/position'
import score from './score.json'

const W = score.width
const H = score.height
const SPB = 60 / score.bpm
export const FRAMES = Math.round(score.beats * SPB * score.fps)
export const beatAt = (f: number) => f / score.fps / SPB

const SERIF = "'Songti TC', 'Noto Serif TC', serif"
const SANS = "'PingFang TC', 'Noto Sans TC', sans-serif"
const COND = "'Avenir Next Condensed', 'Arial Narrow', sans-serif"
const GOLD = '#f4c45a'
const TAU = Math.PI * 2

type Ev = { beat: number; type: string; [k: string]: any }
const EV = score.events as Ev[]
const of = (type: string) => EV.filter((e) => e.type === type)

// ─── math ────────────────────────────────────────────────
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const inv = (a: number, b: number, v: number) => clamp((v - a) / (b - a))
const frac = (x: number) => x - Math.floor(x)
const outCubic = (t: number) => 1 - (1 - t) ** 3
const inCubic = (t: number) => t * t * t
const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const outExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t))
const outBack = (t: number, s = 1.7) => (t <= 0 ? 0 : 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2)
const hash = (n: number) => frac(Math.sin(n * 127.1 + 311.7) * 43758.5453)
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
const sq = (file: number, rank: number) => rank * 9 + file
const hit = (B: number, b0: number, len = 0.6) => (B < b0 ? 0 : Math.exp(-((B - b0) / len) * 4))
const other = (s: Side): Side => (s === 'red' ? 'black' : 'red')
/** beats per side in the class carousel, and the beat (within it) the hero lands on */
const HALF = score.half
const LAND = 1.25
/** beat (within a capture) the hit lands on */
const IMP = 2

const SHOTS = score.shots.map((s, i) => ({ ...s, end: score.shots[i + 1]?.beat ?? score.beats }))
const shotAt = (B: number) => SHOTS.filter((s) => s.beat <= B).pop() ?? SHOTS[0]

// ─── side look ───────────────────────────────────────────
const LOOK = {
  red: { main: '#d8322a', dark: '#4a0906', accent: '#ffcf5a', glow: '255,90,50', rgb: 0xff6a3a, label: '紅方', en: 'RED' },
  black: { main: '#34405c', dark: '#070b16', accent: '#9fd4ff', glow: '120,190,255', rgb: 0x6fb8ff, label: '黑方', en: 'BLACK' },
}
const NAME: Record<Side, Record<PieceKind, string>> = {
  red: { king: '帥', advisor: '仕', elephant: '相', rook: '俥', horse: '傌', cannon: '炮', pawn: '兵' },
  black: { king: '將', advisor: '士', elephant: '象', rook: '車', horse: '馬', cannon: '砲', pawn: '卒' },
}
const HOME: Record<Side, Record<PieceKind, number>> = {
  red: { king: sq(4, 0), advisor: sq(3, 0), elephant: sq(2, 0), horse: sq(1, 0), rook: sq(0, 0), cannon: sq(1, 2), pawn: sq(4, 3) },
  black: { king: sq(4, 9), advisor: sq(5, 9), elephant: sq(6, 9), horse: sq(7, 9), rook: sq(8, 9), cannon: sq(7, 7), pawn: sq(4, 6) },
}
const LINE_DIRS = [[0, 1], [0, 2], [0, -1], [0, -2], [1, 0], [2, 0], [-1, 0], [-2, 0]]
const MOVES: Record<PieceKind, number[][]> = {
  pawn: [[0, 1], [-1, 0], [1, 0]],
  cannon: LINE_DIRS,
  rook: LINE_DIRS,
  horse: [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]],
  elephant: [[2, 2], [-2, 2], [2, -2], [-2, -2]],
  advisor: [[1, 1], [-1, 1], [1, -1], [-1, -1]],
  king: [[0, 1], [0, -1], [1, 0], [-1, 0]],
}

// ─── materials ───────────────────────────────────────────
function glowMaterial(color: number, strength = 1): THREE.ShaderMaterial {
  const m = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: strength } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
      void main(){ float a = pow(clamp(1.0 - length(vUv - 0.5) * 2.0, 0.0, 1.0), 1.8); gl_FragColor = vec4(uColor, a * uOpacity); }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  m.userData.outlineParameters = NO_OUTLINE
  return m
}

function makePiece(side: Side, kind: PieceKind): PieceView {
  const v = new PieceView({ side, kind } as Piece)
  v.root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (mesh.isMesh) mesh.castShadow = true
  })
  return v
}

function idle(v: PieceView, B: number, seed: number) {
  v.figure.position.y = 0.12 + Math.abs(Math.sin(B * SPB * 2.2 + seed)) * 0.015
}

// ─── promo ───────────────────────────────────────────────
export async function createPromo(canvas: HTMLCanvasElement) {
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  await loadPieceModels(`${import.meta.env.BASE_URL}models/pieces.glb`)
  const titleImg = new Image()
  titleImg.src = `${import.meta.env.BASE_URL}ui/title.webp`
  await titleImg.decode()

  const gl = document.createElement('canvas')
  gl.width = W
  gl.height = H
  const renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, alpha: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(1)
  renderer.setSize(W, H, false)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  const outline = new OutlineEffect(renderer, { defaultThickness: 0.0035, defaultColor: [0.1, 0.07, 0.06], defaultAlpha: 0.95 })
  const camera = new THREE.PerspectiveCamera(32, W / H, 0.05, 200)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x040405)
  const board = new Board()
  scene.add(board.root)
  const army = new Map<number, PieceView>()
  const armyRoot = new THREE.Group()
  parseFen(START_FEN).board.forEach((p, i) => {
    if (!p) return
    const v = makePiece(p.side, p.kind)
    armyRoot.add(v.root)
    army.set(i, v)
  })
  scene.add(armyRoot)
  const hemi = new THREE.HemisphereLight(0xc8d6ff, 0x2a1f18, 0.5)
  const sun = new THREE.DirectionalLight(0xffd2a0, 2.6)
  sun.castShadow = true
  sun.shadow.mapSize.set(4096, 4096)
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 40 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.02
  const rim = new THREE.DirectionalLight(0xffffff, 1.5)
  const heroLight = new THREE.PointLight(0xffffff, 0, 5, 1.6)
  scene.add(hemi, sun, sun.target, rim, rim.target, heroLight)
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), withoutOutline(new THREE.MeshBasicMaterial({ color: 0xfff0c0 })))
  const shellGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), glowMaterial(0xff9a2a, 1.4))
  shell.add(shellGlow)
  scene.add(shell)

  // ── 2D buffers
  const grain = document.createElement('canvas')
  grain.width = grain.height = 512
  {
    const g = grain.getContext('2d')!
    const img = g.createImageData(512, 512)
    for (let i = 0; i < img.data.length; i += 4) {
      const n = hash(i * 0.37) * 255
      img.data[i] = img.data[i + 1] = img.data[i + 2] = n
      img.data[i + 3] = 255
    }
    g.putImageData(img, 0, 0)
  }
  const tmp = document.createElement('canvas')
  tmp.width = W
  tmp.height = H
  const tctx = tmp.getContext('2d')!

  const project = (p: THREE.Vector3) => {
    const v = p.clone().project(camera)
    return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H }
  }

  function setCam(pos: THREE.Vector3, look: THREE.Vector3, fov = 32, shake = 0, B = 0, screenX = W / 2) {
    camera.fov = fov
    camera.position.copy(pos)
    if (shake > 0) {
      const t = Math.floor(B * 40)
      camera.position.add(V((hash(t) - 0.5) * shake, (hash(t + 9) - 0.5) * shake, (hash(t + 17) - 0.5) * shake))
    }
    camera.lookAt(look)
    if (screenX !== W / 2) camera.setViewOffset(W, H, W / 2 - screenX, 0, W, H)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
  }

  function render3D(filter = 'none') {
    renderer.setClearColor(0x000000, 0)
    renderer.clear()
    outline.render(scene, camera)
    ctx.save()
    ctx.filter = filter
    ctx.drawImage(gl, 0, 0)
    ctx.restore()
  }

  /** Render the current camera into a clip polygon only. */
  function render3DClip(poly: [number, number][], filter = 'none') {
    renderer.setClearColor(0x000000, 0)
    renderer.clear()
    outline.render(scene, camera)
    ctx.save()
    ctx.beginPath()
    poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.closePath()
    ctx.clip()
    ctx.fillStyle = '#040405'
    ctx.fillRect(0, 0, W, H)
    ctx.filter = filter
    ctx.drawImage(gl, 0, 0)
    ctx.restore()
  }

  function resetBoard(B: number) {
    shell.visible = false
    heroLight.intensity = 0
    let k = 0
    for (const [i, v] of army) {
      v.root.position.copy(squareToWorld(i))
      v.root.rotation.set(0, 0, 0)
      v.root.scale.setScalar(1)
      v.root.visible = true
      v.figure.rotation.y = v.piece.side === 'red' ? Math.PI : 0
      v.figure.position.z = v.piece.side === 'red' ? -0.17 : 0.17
      idle(v, B, k++ * 1.7)
    }
    board.showMarkers(null, [])
    board.tick(B * SPB)
  }

  function mood(strength = 1) {
    hemi.intensity = 0.5 * strength
    hemi.color.set(0xc8d6ff)
    sun.color.set(0xffc890)
    sun.intensity = 2.8 * strength
    sun.position.set(-6, 7, 3)
    sun.target.position.set(0, 0, 0)
    rim.color.set(0x9fb8ff)
    rim.intensity = 1.0
    rim.position.set(5, 3, -6)
    rim.target.position.set(0, 0, 0)
    renderer.toneMappingExposure = 1.0
  }

  /** Hide pieces standing between the camera and a hero square (and right at the lens). */
  function clearSightline(heroSq: number, cam: THREE.Vector3) {
    const h = squareToWorld(heroSq)
    const dx = h.x - cam.x, dz = h.z - cam.z
    const len2 = dx * dx + dz * dz
    for (const [i, v] of army) {
      if (i === heroSq || !v.root.visible) continue
      const p = v.root.position
      const t = ((p.x - cam.x) * dx + (p.z - cam.z) * dz) / len2
      const cx = cam.x + dx * t, cz = cam.z + dz * t
      const d = Math.hypot(p.x - cx, p.z - cz)
      if ((t > -0.2 && t < 0.9 && d < 0.6) || Math.hypot(p.x - cam.x, p.z - cam.z) < 0.9) v.root.visible = false
    }
  }

  // ── 2D layers
  function grade(B: number, vignette = 0.7) {
    ctx.save()
    ctx.globalCompositeOperation = 'soft-light'
    ctx.fillStyle = 'rgba(20,50,80,0.28)'
    ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, `rgba(0,0,0,${vignette})`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    ctx.globalAlpha = 0.06
    ctx.globalCompositeOperation = 'overlay'
    const ox = Math.floor(hash(Math.floor(B * 30)) * 512)
    const oy = Math.floor(hash(Math.floor(B * 30) + 5) * 512)
    for (let x = -ox; x < W; x += 512) for (let y = -oy; y < H; y += 512) ctx.drawImage(grain, x, y)
    ctx.restore()
  }

  function embers(B: number, count: number, alpha = 1, rgb = '255,190,90') {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < count; i++) {
      const life = frac(B * SPB * (0.05 + hash(i) * 0.1) + hash(i + 3))
      const x = (hash(i + 7) * 1.2 - 0.1) * W + Math.sin(B * 0.9 + i) * 40 + life * 120
      const y = H * (1.05 - life * 1.15)
      const r = 1.5 + hash(i + 11) * 3.5
      const a = Math.sin(life * Math.PI) * alpha * (0.4 + 0.6 * hash(i + 13))
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4)
      g.addColorStop(0, `rgba(${rgb},${a})`)
      g.addColorStop(1, `rgba(${rgb},0)`)
      ctx.fillStyle = g
      ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8)
    }
    ctx.restore()
  }

  function flash(k: number, color = '255,240,220') {
    if (k <= 0.001) return
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = `rgba(${color},${k})`
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
  }

  function fade(k: number, color = '0,0,0') {
    if (k <= 0.001) return
    ctx.fillStyle = `rgba(${color},${k})`
    ctx.fillRect(0, 0, W, H)
  }

  function bug(alpha: number) {
    ctx.save()
    ctx.globalAlpha = alpha * 0.85
    const x = W - 96, y = H - 92
    ctx.beginPath()
    ctx.arc(x, y, 30, 0, TAU)
    ctx.fillStyle = '#c8281e'
    ctx.fill()
    ctx.lineWidth = 4
    ctx.strokeStyle = '#fff6e2'
    ctx.beginPath()
    ctx.arc(x, y, 23, 0, TAU)
    ctx.stroke()
    ctx.fillStyle = '#fff6e2'
    ctx.font = `900 30px ${SANS}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Q', x, y + 1)
    ctx.restore()
  }

  function spacedText(text: string, x: number, y: number, spacing: number, align: 'center' | 'left' | 'right' = 'center') {
    const chars = [...text]
    const widths = chars.map((c) => ctx.measureText(c).width)
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
    let cx = align === 'center' ? x - total / 2 : align === 'left' ? x : x - total
    ctx.textAlign = 'left'
    chars.forEach((c, i) => {
      ctx.fillText(c, cx, y)
      cx += widths[i] + spacing
    })
  }

  function speedLines(cx: number, cy: number, k: number, color: string, seed: number, dark = false) {
    if (k <= 0) return
    ctx.save()
    ctx.globalCompositeOperation = dark ? 'source-over' : 'lighter'
    for (let i = 0; i < 90; i++) {
      if (hash(i + seed) < 0.45) continue
      const a = (i / 90) * TAU + hash(i * 3 + seed) * 0.05
      const r0 = lerp(140, 420, hash(i + 5 + seed)) + (1 - k) * 300
      const w = 0.004 + hash(i + 9 + seed) * 0.012
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a - w) * 1500, cy + Math.sin(a - w) * 1500)
      ctx.lineTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0)
      ctx.lineTo(cx + Math.cos(a + w) * 1500, cy + Math.sin(a + w) * 1500)
      ctx.fillStyle = color
      ctx.globalAlpha = k * (dark ? 0.9 : 0.55)
      ctx.fill()
    }
    ctx.restore()
  }

  function sparks(cx: number, cy: number, t: number, seed: number, color = '255,190,90') {
    if (t < 0 || t > 1.6) return
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 70; i++) {
      const a = hash(i + seed) * TAU
      const d = (300 + hash(i * 2 + seed) * 900) * outCubic(clamp(t / 1.2))
      const x = cx + Math.cos(a) * d
      const y = cy + Math.sin(a) * d * 0.7 + t * t * 260
      const life = 1 - t / 1.6
      ctx.strokeStyle = `rgba(${color},${life})`
      ctx.lineWidth = 2 + hash(i + 4) * 3
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - Math.cos(a) * 30 * life, y - Math.sin(a) * 30 * life)
      ctx.stroke()
    }
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 420)
    const k = Math.exp(-t * 3)
    g.addColorStop(0, `rgba(255,240,210,${k})`)
    g.addColorStop(0.3, `rgba(${color},${k * 0.5})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(cx - 420, cy - 420, 840, 840)
    ctx.restore()
  }

  /** radial zoom blur of what is already on the canvas */
  function zoomBlur(k: number, cx: number, cy: number) {
    if (k <= 0.01) return
    tctx.clearRect(0, 0, W, H)
    tctx.drawImage(canvas, 0, 0)
    ctx.save()
    for (let i = 1; i <= 7; i++) {
      const s = 1 + k * 0.045 * i
      ctx.globalAlpha = 0.42 / i ** 0.6
      ctx.setTransform(s, 0, 0, s, cx * (1 - s), cy * (1 - s))
      ctx.drawImage(tmp, 0, 0)
    }
    ctx.restore()
  }

  /** horizontal whip-pan smear */
  function whipBlur(k: number, dir: number) {
    if (k <= 0.01) return
    tctx.clearRect(0, 0, W, H)
    tctx.drawImage(canvas, 0, 0)
    ctx.save()
    for (let i = 1; i <= 9; i++) {
      ctx.globalAlpha = 0.22
      ctx.drawImage(tmp, dir * k * i * 46, 0)
    }
    ctx.restore()
  }

  /** ground shock ring around a projected foot point */
  function shockRing(x: number, y: number, t: number, rgb: string) {
    if (t < 0 || t > 1) return
    const r = 60 + outCubic(t) * 520
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.strokeStyle = `rgba(${rgb},${(1 - t) * 0.9})`
    ctx.lineWidth = 18 * (1 - t) + 2
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * 0.28, 0, 0, TAU)
    ctx.stroke()
    ctx.lineWidth = 3
    ctx.strokeStyle = `rgba(255,255,255,${(1 - t) * 0.8})`
    ctx.beginPath()
    ctx.ellipse(x, y, r * 0.7, r * 0.2, 0, 0, TAU)
    ctx.stroke()
    ctx.restore()
  }

  /** a 2D game token: cream disc, side ring, glyph */
  function token(x: number, y: number, r: number, side: Side, ch: string, rot = 0) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(rot)
    ctx.shadowColor = `rgba(${LOOK[side].glow},0.7)`
    ctx.shadowBlur = r * 0.5
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, TAU)
    ctx.fillStyle = '#f5e6c8'
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.lineWidth = r * 0.1
    ctx.strokeStyle = side === 'red' ? '#c8281e' : '#1f2638'
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.82, 0, TAU)
    ctx.stroke()
    ctx.fillStyle = side === 'red' ? '#c8281e' : '#1f2638'
    ctx.font = `900 ${r * 1.15}px ${SERIF}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ch, 0, r * 0.06)
    ctx.restore()
  }

  /** diagonal colour slab entering from one side; dir=+1 from the left, -1 from the right */
  function slab(side: Side, dir: number, k: number, width = 0.46, B = 0) {
    if (k <= 0) return
    const L = LOOK[side]
    const off = (1 - k) * W * 0.6 * -dir
    const x0 = dir > 0 ? 0 : W
    const top = W * width * dir
    const bot = W * (width - 0.09) * dir
    ctx.save()
    ctx.translate(off, 0)
    ctx.beginPath()
    ctx.moveTo(x0 - dir * 40, 0)
    ctx.lineTo(x0 + top, 0)
    ctx.lineTo(x0 + bot, H)
    ctx.lineTo(x0 - dir * 40, H)
    ctx.closePath()
    const g = ctx.createLinearGradient(x0, 0, x0 + top, H)
    g.addColorStop(0, L.dark + 'f2')
    g.addColorStop(1, L.main + 'c0')
    ctx.fillStyle = g
    ctx.fill()
    ctx.save()
    ctx.clip()
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 2
    const o = (B * 40) % 36
    for (let x = -H + o; x < W; x += 36) {
      ctx.beginPath()
      ctx.moveTo(x, H)
      ctx.lineTo(x + H * 0.6, 0)
      ctx.stroke()
    }
    ctx.restore()
    ctx.strokeStyle = L.accent
    ctx.lineWidth = 6
    ctx.shadowColor = L.accent
    ctx.shadowBlur = 24
    ctx.beginPath()
    ctx.moveTo(x0 + top, 0)
    ctx.lineTo(x0 + bot, H)
    ctx.stroke()
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x0 + top + dir * 26, 0)
    ctx.lineTo(x0 + bot + dir * 26, H)
    ctx.stroke()
    ctx.restore()
  }

  /** full-screen diagonal wipe in a side colour: p 0..1 covers, 1..2 uncovers */
  function wipe(p: number, side: Side, dir: number) {
    if (p <= 0 || p >= 2) return
    const L = LOOK[side]
    const span = W + 700
    const lead = p <= 1 ? outCubic(p) : 1
    const tail = p <= 1 ? 0 : inCubic(p - 1)
    const xa = (dir > 0 ? -350 : W + 350) + dir * span * tail
    const xb = (dir > 0 ? -350 : W + 350) + dir * span * lead
    const lo = Math.min(xa, xb), hi = Math.max(xa, xb)
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(lo + 175, 0)
    ctx.lineTo(hi + 175, 0)
    ctx.lineTo(hi - 175, H)
    ctx.lineTo(lo - 175, H)
    ctx.closePath()
    ctx.fillStyle = L.main
    ctx.fill()
    ctx.strokeStyle = L.accent
    ctx.lineWidth = 10
    ctx.stroke()
    ctx.restore()
  }

  function statBars(x: number, y: number, stats: number[], t: number, side: Side, align: 'left' | 'right') {
    const L = LOOK[side]
    const LABELS = ['攻擊', '機動', '防守']
    stats.forEach((v, r) => {
      const tr = t - r * 0.12
      if (tr < 0) return
      const a = outCubic(inv(0, 0.2, tr))
      const yy = y + r * 58
      ctx.save()
      ctx.globalAlpha = a
      ctx.font = `700 28px ${SANS}`
      ctx.fillStyle = '#fff3dc'
      ctx.textBaseline = 'middle'
      const lx = align === 'left' ? x : x - 108
      ctx.textAlign = 'left'
      ctx.fillText(LABELS[r], lx, yy)
      for (let s = 0; s < 5; s++) {
        const on = s < v && tr > 0.1 + s * 0.05
        const sx = align === 'left' ? x + 100 + s * 62 : x - 140 - (4 - s) * 62
        ctx.save()
        ctx.translate(sx, yy)
        ctx.transform(1, 0, -0.35, 1, 0, 0)
        ctx.fillStyle = on ? L.accent : 'rgba(255,255,255,0.14)'
        if (on) {
          ctx.shadowColor = L.accent
          ctx.shadowBlur = 14
        }
        ctx.fillRect(0, -13, 52, 26)
        ctx.restore()
      }
      ctx.restore()
    })
  }

  function moveGrid(x: number, y: number, size: number, kind: PieceKind, side: Side, t: number) {
    if (t < 0) return
    const L = LOOK[side]
    const a = outCubic(inv(0, 0.25, t))
    const cell = size / 5
    ctx.save()
    ctx.globalAlpha = a
    ctx.translate(x, y + (1 - a) * 30)
    ctx.fillStyle = 'rgba(8,8,12,0.72)'
    ctx.beginPath()
    ctx.roundRect(0, 0, size, size + 46, 16)
    ctx.fill()
    ctx.strokeStyle = L.accent
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.font = `600 22px ${COND}`
    ctx.fillStyle = L.accent
    ctx.textBaseline = 'middle'
    spacedText('MOVES', size / 2, 26, 6)
    ctx.translate(0, 46)
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'
    ctx.lineWidth = 1.5
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(cell / 2, cell / 2 + i * cell)
      ctx.lineTo(size - cell / 2, cell / 2 + i * cell)
      ctx.moveTo(cell / 2 + i * cell, cell / 2)
      ctx.lineTo(cell / 2 + i * cell, size - cell / 2)
      ctx.stroke()
    }
    const c = size / 2
    const slide = kind === 'rook' || kind === 'cannon'
    if (slide) {
      const k = outCubic(inv(0.15, 0.5, t))
      ctx.strokeStyle = L.accent
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(c - 2 * cell * k, c)
      ctx.lineTo(c + 2 * cell * k, c)
      ctx.moveTo(c, c - 2 * cell * k)
      ctx.lineTo(c, c + 2 * cell * k)
      ctx.stroke()
    }
    MOVES[kind].forEach(([dx, dy], i) => {
      const p = outBack(inv(0.15 + i * 0.04, 0.4 + i * 0.04, t), 2.2)
      if (p <= 0) return
      ctx.beginPath()
      ctx.arc(c + dx * cell, c - dy * cell, 11 * p, 0, TAU)
      ctx.fillStyle = L.accent
      ctx.shadowColor = L.accent
      ctx.shadowBlur = 16
      ctx.fill()
    })
    ctx.shadowBlur = 0
    token(c, c, cell * 0.42, side, NAME[side][kind])
    ctx.restore()
  }

  // ════════════════════════════════════════════════════════
  // shots
  // ════════════════════════════════════════════════════════

  function openShot(B: number) {
    ctx.fillStyle = '#040405'
    ctx.fillRect(0, 0, W, H)
    // faint board grid drifting
    ctx.save()
    ctx.strokeStyle = 'rgba(244,196,90,0.07)'
    ctx.lineWidth = 2
    const off = (B * 60) % 120
    for (let x = -120 + off; x < W + 120; x += 120) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
    }
    for (let y = 0; y < H; y += 120) {
      ctx.beginPath()
      ctx.moveTo(0, y + 60)
      ctx.lineTo(W, y + 60)
      ctx.stroke()
    }
    ctx.restore()
    // centre river line
    const lk = outExpo(inv(0, 2, B))
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const lg = ctx.createLinearGradient(W / 2 - 900 * lk, 0, W / 2 + 900 * lk, 0)
    lg.addColorStop(0, 'rgba(255,200,120,0)')
    lg.addColorStop(0.5, 'rgba(255,220,160,0.9)')
    lg.addColorStop(1, 'rgba(255,200,120,0)')
    ctx.fillStyle = lg
    ctx.fillRect(0, H / 2 - 2, W, 4)
    ctx.restore()
    // tokens charge in and collide on beat 2
    const k = inv(0, 6, B) ** 2.6
    const r = 150
    const xl = lerp(170, W / 2 - r, k)
    const xr = lerp(W - 170, W / 2 + r, k)
    for (let i = 1; i <= 6; i++) {
      ctx.globalAlpha = 0.12 * (1 - i / 7) * k
      token(xl - i * 70 * k, H / 2, r, 'red', '帥')
      token(xr + i * 70 * k, H / 2, r, 'black', '將')
    }
    ctx.globalAlpha = 1
    token(xl, H / 2, r, 'red', '帥', -0.6 * (1 - k))
    token(xr, H / 2, r, 'black', '將', 0.6 * (1 - k))
    ctx.save()
    ctx.globalAlpha = inv(0.8, 2, B) * (1 - inv(5, 5.6, B))
    ctx.font = `600 30px ${COND}`
    ctx.fillStyle = GOLD
    ctx.textBaseline = 'middle'
    spacedText('Q-STYLE  XIANGQI  KINGDOM', W / 2, H * 0.78, 14)
    ctx.restore()
    speedLines(W / 2, H / 2, inv(4, 6, B) * 0.5, 'rgba(255,255,255,1)', 3)
    grade(B, 0.8)
    fade(1 - outCubic(inv(0, 0.4, B)))
  }

  function caption(B: number, e: Ev, end: number, y: number) {
    const t = B - e.beat
    if (t < 0 || B > end) return
    const a = 1 - inCubic(inv(end - 0.3, end, B))
    ctx.save()
    ctx.globalAlpha = a
    ctx.textBaseline = 'middle'
    ctx.font = `600 30px ${COND}`
    ctx.fillStyle = GOLD
    spacedText(e.kicker, W / 2, y - 92, 14)
    const big = [...e.text].length <= 4
    ctx.font = `900 ${big ? 170 : 104}px ${SERIF}`
    const reveal = outCubic(inv(0, 0.5, t))
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, y - 140, W * reveal, 280)
    ctx.clip()
    ctx.shadowColor = 'rgba(0,0,0,0.85)'
    ctx.shadowBlur = 30
    const tg = ctx.createLinearGradient(0, y - 90, 0, y + 90)
    tg.addColorStop(0, '#ffffff')
    tg.addColorStop(0.6, '#fff0d2')
    tg.addColorStop(1, '#e6b45a')
    ctx.fillStyle = tg
    spacedText(e.text, W / 2, y, lerp(big ? 70 : 30, big ? 40 : 14, outCubic(inv(0, end - e.beat, t))))
    ctx.restore()
    // glint riding the reveal edge
    if (reveal < 1) {
      ctx.globalCompositeOperation = 'lighter'
      const gx = W * reveal
      const g = ctx.createLinearGradient(gx - 80, 0, gx + 10, 0)
      g.addColorStop(0, 'rgba(255,220,160,0)')
      g.addColorStop(1, 'rgba(255,240,210,0.9)')
      ctx.fillStyle = g
      ctx.fillRect(gx - 80, y - 110, 90, 220)
    }
    ctx.restore()
  }

  function revealShot(B: number) {
    resetBoard(B)
    mood(1)
    const k = inOutCubic(inv(6, 12, B))
    const p0 = V(0, 19, 11), p1 = V(-9, 7, 3), p2 = V(-6.4, 1.0, 0.6)
    const a = p0.clone().multiplyScalar((1 - k) ** 2).add(p1.clone().multiplyScalar(2 * k * (1 - k))).add(p2.clone().multiplyScalar(k * k))
    const look = V(0, -1.5, 0).lerp(V(-1.2, 0.2, 0), k)
    setCam(a, look, lerp(42, 30, k), hit(B, 6, 0.6) * 0.4, B)
    render3D()
    zoomBlur(hit(B, 6, 0.8), W / 2, H / 2)
    // darken for the captions
    const g = ctx.createLinearGradient(0, H * 0.45, 0, H)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.6)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    const [c1, c2] = of('caption')
    caption(B, c1, 9, H * 0.74)
    caption(B, c2, 12, H * 0.74)
    embers(B, 50, 0.6)
    grade(B, 0.7)
    flash(hit(B, 6, 0.35) * 1.0, '255,250,240')
    whipBlur(inv(11.7, 12, B), -1)
  }

  /** One hero beat-pair: zoom in, jump, land, MG. tt = beats since this side's cut (0..dur). */
  function heroPiece(B: number, e: Ev, side: Side, tt: number, screenX: number, textSide: number, opts: { dur?: number; text?: boolean } = {}) {
    const kind = e.kind as PieceKind
    const L = LOOK[side]
    const heroSq = HOME[side][kind]
    const hero = army.get(heroSq)!
    const P = squareToWorld(heroSq)
    const facing = side === 'red' ? -1 : 1
    const az0 = (e.i % 2 ? 0.42 : -0.42) * facing * (side === 'red' ? 1 : -1)
    const az = az0 - Math.sign(az0) * 0.3 * inOutCubic(inv(LAND, opts.dur ?? HALF, tt))
    const dur = opts.dur ?? HALF
    const rush = outExpo(inv(0, 0.6, tt))
    const d = lerp(10, 2.1, rush) - 0.4 * inv(0.6, dur, tt)
    const h = lerp(4.2, 0.5, rush)
    const camPos = P.clone().add(V(Math.sin(az) * d, h, facing * Math.cos(az) * d))
    const finalCam = P.clone().add(V(Math.sin(az0) * 2.1, 0.5, facing * Math.cos(az0) * 2.1))
    clearSightline(heroSq, finalCam)
    // jump & land on the next beat
    const jt = inv(0.6, LAND, tt)
    hero.root.position.y = Math.sin(jt * Math.PI) * 0.45 * (tt < LAND ? 1 : 0)
    hero.figure.rotation.y = (side === 'red' ? Math.PI : 0) + (tt < LAND ? jt * TAU : 0)
    const squash = hit(B, B - tt + LAND, 0.25)
    hero.root.scale.set(1 + squash * 0.18, 1 - squash * 0.2, 1 + squash * 0.18)
    // lights
    sun.position.copy(P).add(V(-3 * facing, 6, 4 * facing))
    sun.target.position.copy(P)
    rim.position.copy(P).add(V(1.5, 2.5, -5 * facing))
    rim.target.position.copy(P)
    rim.color.setHex(L.rgb)
    rim.intensity = 4
    heroLight.color.setHex(L.rgb)
    heroLight.position.copy(P).add(V(0, 0.9, facing * 0.9))
    heroLight.intensity = 1.5 + squash * 8
    const shake = hit(B, B - tt + LAND, 0.35) * 0.06
    setCam(camPos.add(V(0, hero.root.position.y * 0.7, 0)), P.clone().add(V(0, 0.42 + hero.root.position.y * 0.85, 0)), 30, shake, B, screenX)
    return { hero, P, foot: project(P.clone()), head: project(P.clone().add(V(0, 0.55, 0))), L, kind, side, textSide }
  }

  /** MG for one hero: slab, giant glyph, counter, name slam, line, stats, move grid. */
  function heroMG(B: number, e: Ev, side: Side, tt: number, textSide: number, headX: number, headY: number, footX: number, footY: number) {
    const kind = e.kind as PieceKind
    const L = LOOK[side]
    const dir = textSide < 0 ? 1 : -1 // slab enters from the text side
    const colX = textSide < 0 ? W * 0.215 : W * 0.785
    const sk = outExpo(inv(0, 0.35, tt))
    slab(side, dir, sk, 0.44, B)
    // giant outline glyph inside the slab
    ctx.save()
    ctx.globalAlpha = 0.16 * sk
    ctx.font = `900 980px ${SERIF}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 6
    ctx.strokeStyle = L.accent
    ctx.strokeText(NAME[side][kind], colX + (textSide < 0 ? -1 : 1) * (60 + tt * 30), H * 0.52)
    ctx.restore()
    // counter + side label
    ctx.save()
    ctx.globalAlpha = sk
    ctx.textBaseline = 'middle'
    ctx.font = `700 46px ${COND}`
    ctx.fillStyle = L.accent
    spacedText(`0${e.i + 1}  /  07`, colX, 150, 8)
    ctx.fillStyle = L.accent
    ctx.fillRect(colX - 170 * sk, 186, 340 * sk, 3)
    ctx.font = `700 30px ${SANS}`
    ctx.fillStyle = '#fff3dc'
    spacedText(`${L.label}　${L.en}`, colX, 226, 10)
    ctx.restore()
    // name slam on landing
    const lt = tt - LAND
    if (lt >= -0.5) {
      const pre = lt < 0
      const s = pre ? 1.0 : lerp(1.9, 1, outBack(inv(0, 0.22, lt), 2.4))
      ctx.save()
      ctx.globalAlpha = pre ? 0.0 : Math.min(1, lt * 10)
      ctx.translate(colX, 470)
      ctx.scale(s, s)
      ctx.font = `900 300px ${SERIF}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 26
      ctx.strokeStyle = 'rgba(0,0,0,0.85)'
      ctx.strokeText(NAME[side][kind], 0, 0)
      ctx.shadowColor = `rgba(${L.glow},0.9)`
      ctx.shadowBlur = 50
      const g = ctx.createLinearGradient(0, -140, 0, 140)
      g.addColorStop(0, '#ffffff')
      g.addColorStop(0.55, side === 'red' ? '#ffe2c8' : '#e6f2ff')
      g.addColorStop(1, L.accent)
      ctx.fillStyle = g
      ctx.fillText(NAME[side][kind], 0, 0)
      ctx.restore()
    }
    // english kicker
    ctx.save()
    ctx.globalAlpha = sk
    ctx.textBaseline = 'middle'
    ctx.font = `800 54px ${COND}`
    ctx.fillStyle = '#ffffff'
    spacedText(e.en, colX + (1 - outExpo(inv(0.1, 0.6, tt))) * 120 * dir, 650, lerp(40, 18, outCubic(inv(0.1, HALF, tt))))
    ctx.restore()
    // typewriter line
    const chars = [...(e.line as string)]
    const n = Math.floor(clamp((tt - LAND - 0.05) / 0.08, 0, chars.length))
    if (n > 0) {
      ctx.save()
      ctx.textBaseline = 'middle'
      ctx.font = `800 52px ${SANS}`
      ctx.fillStyle = L.accent
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 12
      spacedText(chars.slice(0, n).join(''), colX, 732, 10)
      ctx.restore()
    }
    statBars(colX - 200, 830, e.stats, tt - LAND - 0.2, side, 'left')
    // move grid near the hero, on the far side from the text
    const gx = textSide < 0 ? W - 410 : 150
    moveGrid(gx, H - 400, 250, kind, side, tt - LAND - 0.35)
    shockRing(footX, footY, (tt - LAND) / 0.8, L.glow)
    speedLines(headX, headY, hit(B, B - tt + LAND, 0.5) * 0.8, `rgba(${L.glow},1)`, e.i * 13 + (side === 'red' ? 0 : 7))
  }

  function classesShot(B: number) {
    const e = of('class').filter((c) => c.beat <= B).pop()!
    const t = B - e.beat
    const half = t < HALF ? 0 : 1
    const side: Side = half === 0 ? e.first : other(e.first)
    const tt = t - half * HALF
    const textSide = side === 'red' ? -1 : 1 // red text left / hero right; black mirrored
    resetBoard(B)
    mood(0.85)
    const r = heroPiece(B, e, side, tt, textSide < 0 ? W * 0.66 : W * 0.34, textSide)
    render3D('saturate(1.08) contrast(1.08)')
    zoomBlur(1 - inv(0, 0.6, tt), r.head.x, r.head.y)
    zoomBlur(hit(B, B - tt + LAND, 0.3) * 0.6, r.head.x, r.head.y)
    // shade behind the text column
    const sg = ctx.createLinearGradient(textSide < 0 ? 0 : W, 0, W / 2, 0)
    sg.addColorStop(0, 'rgba(0,0,0,0.55)')
    sg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = sg
    ctx.fillRect(0, 0, W, H)
    heroMG(B, e, side, tt, textSide, r.head.x, r.head.y, r.foot.x, r.foot.y)
    embers(B, 30, 0.5, LOOK[side].glow)
    grade(B, 0.6)
    flash(hit(B, B - tt + LAND, 0.15) * 0.45, LOOK[side].glow)
    flash((1 - inv(0, 0.12, tt)) * 0.55)
    // wipe out to the next side / class
    const next = half === 0 ? other(side) : (of('class').find((c) => c.beat > e.beat)?.first ?? 'red')
    const nextDir = next === 'red' ? 1 : -1
    wipe(inv(HALF - 0.2, HALF, tt), next, nextDir)
    wipe(1 + inv(0, 0.22, tt), side, side === 'red' ? 1 : -1)
  }

  function kingsShot(B: number) {
    const e = of('class').find((c) => c.kind === 'king')!
    resetBoard(B)
    mood(0.85)
    // split edge slides in on beat 31
    const sk = outExpo(inv(62, 62.35, B))
    const cx = lerp(W + 260, W / 2, sk)
    const slant = 150
    const leftPoly: [number, number][] = [[0, 0], [cx + slant, 0], [cx - slant, H], [0, H]]
    const rightPoly: [number, number][] = [[cx + slant, 0], [W, 0], [W, H], [cx - slant, H]]
    // red king (left / full before the split)
    const ttR = B - 60
    const rr = heroPiece(B, e, 'red', ttR, lerp(W * 0.6, W * 0.33, sk), -1, { dur: 8 })
    render3DClip(leftPoly, 'saturate(1.08) contrast(1.08)')
    zoomBlur((1 - inv(0, 0.6, ttR)) * (B < 62 ? 1 : 0), rr.head.x, rr.head.y)
    const red = { head: rr.head, foot: rr.foot }
    let blk: { head: { x: number; y: number }; foot: { x: number; y: number } } | null = null
    if (B >= 62) {
      resetBoard(B)
      const ttB = B - 62
      const rb = heroPiece(B, e, 'black', ttB, W * 0.68, 1, { dur: 6 })
      render3DClip(rightPoly, 'saturate(1.08) contrast(1.08)')
      blk = { head: rb.head, foot: rb.foot }
    }
    // shade and MG
    const both = B >= 62
    const yName = 250
    for (const side of ['red', 'black'] as Side[]) {
      if (side === 'black' && !both) continue
      const L = LOOK[side]
      const tt = B - (side === 'red' ? 60 : 62)
      const p = side === 'red' ? red : blk!
      const colX = side === 'red' ? W * 0.11 : W * 0.89
      shockRing(p.foot.x, p.foot.y, (tt - LAND) / 0.8, L.glow)
      const lt = tt - LAND
      if (lt >= 0) {
        const s = lerp(1.9, 1, outBack(inv(0, 0.22, lt), 2.4))
        ctx.save()
        ctx.translate(colX, yName)
        ctx.scale(s, s)
        ctx.font = `900 230px ${SERIF}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.lineJoin = 'round'
        ctx.lineWidth = 26
        ctx.strokeStyle = 'rgba(0,0,0,0.85)'
        ctx.strokeText(NAME[side].king, 0, 0)
        ctx.shadowColor = `rgba(${L.glow},0.9)`
        ctx.shadowBlur = 50
        ctx.fillStyle = '#fff4e4'
        ctx.fillText(NAME[side].king, 0, 0)
        ctx.restore()
        ctx.save()
        ctx.globalAlpha = outCubic(inv(0.1, 0.4, lt))
        ctx.textBaseline = 'middle'
        ctx.font = `700 34px ${SANS}`
        ctx.fillStyle = L.accent
        spacedText(`${L.label}主帥`, colX, yName + 190, 12)
        ctx.restore()
      }
      speedLines(p.head.x, p.head.y, hit(B, B - tt + LAND, 0.5) * 0.8, `rgba(${L.glow},1)`, side === 'red' ? 61 : 67)
    }
    // glowing split edge
    if (both) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (const [w, a] of [[24, 0.25], [8, 0.8], [3, 1]] as const) {
        ctx.strokeStyle = `rgba(255,236,200,${a})`
        ctx.lineWidth = w
        ctx.beginPath()
        ctx.moveTo(cx + slant, 0)
        for (let i = 1; i <= 12; i++) {
          const y = (i / 12) * H
          const jitter = (hash(i + Math.floor(B * 24)) - 0.5) * 26
          ctx.lineTo(lerp(cx + slant, cx - slant, i / 12) + jitter, y)
        }
        ctx.stroke()
      }
      ctx.restore()
    }
    // counter + line at the bottom
    const la = outCubic(inv(64.5, 65, B))
    if (la > 0) {
      ctx.save()
      ctx.globalAlpha = la * (1 - inv(67.6, 68, B))
      const g = ctx.createLinearGradient(0, H * 0.7, 0, H)
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(1, 'rgba(0,0,0,0.75)')
      ctx.fillStyle = g
      ctx.fillRect(0, H * 0.7, W, H * 0.3)
      ctx.textBaseline = 'middle'
      ctx.font = `700 40px ${COND}`
      ctx.fillStyle = GOLD
      spacedText('07  /  07   GENERAL', W / 2, H - 190, 10)
      ctx.font = `900 84px ${SERIF}`
      ctx.fillStyle = '#fff3dc'
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 20
      spacedText(e.line, W / 2, H - 100, lerp(60, 26, la))
      ctx.restore()
    }
    embers(B, 40, 0.6)
    grade(B, 0.6)
    flash(hit(B, 60 + LAND, 0.15) * 0.45, LOOK.red.glow)
    flash(hit(B, 62 + LAND, 0.15) * 0.45, LOOK.black.glow)
    flash(hit(B, 62, 0.2) * 0.7)
    wipe(1 + inv(60, 60.22, B), 'red', 1)
    flash(inCubic(inv(67.75, 68, B)), '255,255,255')
  }

  // ── captures
  type Cap = { from: number; to: number; screen?: number; hide: number[] }
  const CAPS: Cap[] = [
    { from: sq(1, 2), to: sq(1, 9), screen: sq(1, 7), hide: [] },
    { from: sq(7, 7), to: sq(7, 0), screen: sq(7, 2), hide: [] },
    { from: sq(0, 0), to: sq(0, 6), hide: [sq(0, 3)] },
    { from: sq(8, 9), to: sq(8, 3), hide: [sq(8, 6)] },
  ]

  function clashShot(B: number) {
    const caps = of('capture')
    const ci = Math.min(3, Math.floor((B - 68) / 4))
    const e = caps[ci]
    const c = CAPS[ci]
    const t = B - e.beat
    const L = LOOK[e.side as Side]
    resetBoard(B)
    mood(1)
    // earlier captures stay resolved; blockers for the rook files are gone all along
    for (const cc of CAPS) for (const h of cc.hide) army.get(h)!.root.visible = false
    for (let j = 0; j < ci; j++) {
      army.get(CAPS[j].to)!.root.visible = false
      army.get(CAPS[j].from)!.root.position.copy(squareToWorld(CAPS[j].to))
    }
    const att = army.get(c.from)!
    const vic = army.get(c.to)!
    const A = squareToWorld(c.from), T = squareToWorld(c.to)
    const fwd = Math.sign(T.z - A.z)
    const impact = e.beat + IMP
    let shellPos: THREE.Vector3 | null = null
    if (e.how === 'cannon') {
      att.figure.position.z = att.figure.position.z + 0.14 * hit(B, e.beat + 0.3, 0.4) * fwd * -1
      if (t >= 0.3 && t < IMP) {
        const k = inv(0.3, IMP, t)
        const a = A.clone().add(V(0, 0.45, fwd * 0.3))
        const b = T.clone().add(V(0, 0.35, 0))
        shellPos = a.lerp(b, k)
        shellPos.y += Math.sin(k * Math.PI) * 2.6
        shell.visible = true
        shell.position.copy(shellPos)
      }
      if (t >= IMP + 0.4) att.root.position.copy(A).lerp(T, inOutCubic(inv(IMP + 0.4, IMP + 1.3, t)))
    } else {
      const k = inCubic(inv(0.2, IMP, t))
      att.root.position.copy(A).lerp(T.clone().add(V(0, 0, -fwd * 0.05)), k)
      att.root.position.y = t < IMP ? Math.abs(Math.sin(B * 14)) * 0.04 : 0
      att.root.rotation.x = t < IMP ? 0.14 * fwd * inv(0.2, 0.7, t) : 0
    }
    if (t >= IMP) {
      const u = t - IMP
      const tt = u < 0.6 ? u * 0.4 : 0.24 + (u - 0.6) * 0.9
      vic.root.position.copy(T).add(V(0.3 * tt * (ci % 2 ? -1 : 1), Math.sin(clamp(tt / 1.2) * Math.PI) * 1.8, fwd * 1.8 * tt))
      vic.root.rotation.set(-tt * 6 * fwd, tt * 4, tt * 3)
      vic.root.scale.setScalar(Math.max(0.001, 1 - inv(0.6, 1.1, tt)))
    }
    // camera: mirrored pairs
    const mx = ci % 2 ? -1 : 1
    const shake = hit(B, impact, 0.5) * 0.3
    if (e.how === 'cannon') {
      const k = inv(e.beat, e.beat + 4, B)
      const mid = A.clone().lerp(T, 0.5)
      setCam(V(mid.x + mx * lerp(6.8, 6.0, k), lerp(3.6, 3.0, k), mid.z + mx * 1.2), V(mid.x, 0.6, mid.z), 40, shake, B)
    } else {
      const k = inv(e.beat, impact, B)
      if (t < IMP) {
        const rp = att.root.position
        setCam(V(rp.x - mx * 2.6, 0.7, rp.z - fwd * 1.6), V(rp.x, 0.35, rp.z + fwd * 1.8), 34, k * 0.03, B)
      } else {
        const a = lerp(-0.6, 0.5, inv(impact, e.beat + 4, B))
        setCam(V(T.x - mx * Math.cos(a) * 3.4, 1.2, T.z - fwd * Math.sin(a + 1.2) * 3.4), V(T.x, 0.45, T.z), 32, shake, B)
      }
    }
    render3D('saturate(1.05) contrast(1.1)')
    const vp = project(T.clone().add(V(0, 0.45, 0)))
    if (shellPos) {
      const sp = project(shellPos)
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const g = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 60)
      g.addColorStop(0, 'rgba(255,240,200,0.9)')
      g.addColorStop(1, `rgba(${L.glow},0)`)
      ctx.fillStyle = g
      ctx.fillRect(sp.x - 60, sp.y - 60, 120, 120)
      ctx.restore()
      const mp = project(A.clone().add(V(0, 0.45, fwd * 0.3)))
      sparks(mp.x, mp.y, (t - 0.3) * 1.6, 90 + ci, L.glow)
    }
    if (e.how === 'rook' && t < IMP) speedLines(W / 2, H / 2, inv(0.6, IMP, t) * 0.5, 'rgba(255,255,255,1)', 31 + ci)
    if (t >= IMP) {
      sparks(vp.x, vp.y, (t - IMP) * 0.8, 3 + ci, L.glow)
      speedLines(vp.x, vp.y, hit(B, impact, 0.6), `rgba(${L.glow},1)`, 11 + ci)
      // 吃! stamp
      const st = (t - IMP) * 0.6
      const s = lerp(2.6, 1, outExpo(inv(0, 0.2, st)))
      ctx.save()
      ctx.translate(clamp(vp.x + mx * 160, 260, W - 260), clamp(vp.y - 170, 230, H - 300))
      ctx.rotate(-0.12 * mx)
      ctx.scale(s, s)
      ctx.globalAlpha = 1 - inv(0.8, 1, st)
      ctx.font = `900 200px ${SERIF}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 30
      ctx.strokeStyle = '#000'
      ctx.strokeText('吃！', 0, 0)
      ctx.lineWidth = 12
      ctx.strokeStyle = '#fff'
      ctx.strokeText('吃！', 0, 0)
      ctx.fillStyle = L.main === LOOK.black.main ? '#4a66a8' : L.main
      ctx.fillText('吃！', 0, 0)
      ctx.restore()
    }
    // lower-third: attacker → victim
    {
      const side = e.side as Side
      const left = side === 'red'
      const a = outExpo(inv(0, 0.3, t)) * (1 - inv(3.7, 4, t))
      const x = left ? 80 : W - 80
      ctx.save()
      ctx.globalAlpha = a
      ctx.translate((1 - a) * 200 * (left ? -1 : 1), 0)
      ctx.fillStyle = L.dark + 'e0'
      ctx.beginPath()
      const bw = 560
      const bx = left ? x : x - bw
      ctx.moveTo(bx + 30, H - 210)
      ctx.lineTo(bx + bw, H - 210)
      ctx.lineTo(bx + bw - 30, H - 90)
      ctx.lineTo(bx, H - 90)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = L.accent
      ctx.lineWidth = 3
      ctx.stroke()
      const aKind = att.piece.kind, vKind = vic.piece.kind
      token(bx + 100, H - 150, 46, side, NAME[side][aKind])
      token(bx + bw - 110, H - 150, 46, other(side), NAME[other(side)][vKind])
      ctx.fillStyle = L.accent
      ctx.font = `900 54px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('→ 吃 →', bx + bw / 2, H - 150)
      ctx.restore()
    }
    // scoreboard
    {
      let rs = 0, bs = 0
      for (const cc of caps) if (B >= cc.beat + IMP) cc.side === 'red' ? rs++ : bs++
      const pop = (s: Side) => caps.filter((cc) => cc.side === s).reduce((m, cc) => m + hit(B, cc.beat + IMP, 0.4), 0)
      ctx.save()
      ctx.globalAlpha = outCubic(inv(68, 68.3, B)) * (1 - inv(83.7, 84, B))
      ctx.translate(W / 2, 92)
      ctx.fillStyle = 'rgba(8,8,12,0.75)'
      ctx.beginPath()
      ctx.roundRect(-250, -48, 500, 96, 20)
      ctx.fill()
      ctx.fillStyle = LOOK.red.main
      ctx.fillRect(-250, -48, 170, 96)
      ctx.fillStyle = LOOK.black.main
      ctx.fillRect(80, -48, 170, 96)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.font = `900 44px ${SANS}`
      ctx.fillText('紅', -165, 2)
      ctx.fillText('黑', 165, 2)
      ctx.font = `800 64px ${COND}`
      for (const [s, n, x] of [['red', rs, -45], ['black', bs, 45]] as const) {
        const p = 1 + pop(s) * 0.5
        ctx.save()
        ctx.translate(x, 4)
        ctx.scale(p, p)
        ctx.fillStyle = pop(s) > 0.2 ? LOOK[s].accent : '#fff'
        ctx.fillText(String(n), 0, 0)
        ctx.restore()
      }
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillText(':', 0, 0)
      ctx.restore()
    }
    embers(B, 40, 0.6)
    grade(B, 0.65)
    flash(hit(B, impact, 0.15) * 0.8)
    flash((1 - inv(0, 0.1, t)) * 0.6)
    bug(1)
  }

  function card(B: number, e: Ev, end: number, y: number) {
    const t = B - e.beat
    if (t < 0 || B > end) return
    const inK = outExpo(inv(0, 0.45, t))
    const outK = inCubic(inv(end - 0.4, end, B))
    ctx.save()
    ctx.globalAlpha = inK * (1 - outK)
    ctx.textBaseline = 'alphabetic'
    const sh = ctx.createLinearGradient(0, y - 240, 0, H)
    sh.addColorStop(0, 'rgba(0,0,0,0)')
    sh.addColorStop(1, 'rgba(0,0,0,0.7)')
    ctx.fillStyle = sh
    ctx.fillRect(0, y - 240, W, H - y + 240)
    ctx.font = `700 34px ${COND}`
    const kick = e.kicker as string
    const [kl, kr] = kick.split('VS')
    ctx.textAlign = 'right'
    ctx.fillStyle = LOOK.red.accent
    ctx.fillText(kl.trim(), W / 2 - 50, y - 140)
    ctx.textAlign = 'center'
    ctx.fillStyle = '#fff'
    ctx.fillText('VS', W / 2, y - 140)
    ctx.textAlign = 'left'
    ctx.fillStyle = LOOK.black.accent
    ctx.fillText(kr.trim(), W / 2 + 50, y - 140)
    const scale = lerp(1.2, 1, inK)
    ctx.save()
    ctx.translate(W / 2, y)
    ctx.scale(scale, scale)
    ctx.font = `900 170px ${SERIF}`
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 30
    const chars = [...(e.title as string)]
    const widths = chars.map((c) => ctx.measureText(c).width)
    const total = widths.reduce((a, b) => a + b, 0) + 30 * (chars.length - 1)
    let x = -total / 2
    ctx.textAlign = 'left'
    chars.forEach((c, i) => {
      ctx.fillStyle = i === 0 ? '#ff5a44' : i === 1 ? '#c9dcff' : '#fff2da'
      ctx.fillText(c, x, 0)
      x += widths[i] + 30
    })
    ctx.restore()
    ctx.globalAlpha = inK * (1 - outK) * inv(0.25, 0.6, t)
    ctx.font = `600 46px ${SANS}`
    ctx.fillStyle = '#f3ead8'
    ctx.textAlign = 'center'
    spacedText(e.sub, W / 2, y + 100, 10)
    ctx.restore()
  }

  function armyShot(B: number) {
    resetBoard(B)
    mood(1)
    // ripple hop across the ranks on each beat
    for (const [i, v] of army) {
      const rank = Math.floor(i / 9)
      const d = Math.abs(rank - 4.5)
      const ph = frac(B - d * 0.08)
      v.root.position.y = Math.max(0, Math.sin(clamp(ph / 0.35) * Math.PI)) * 0.18
    }
    const k = inOutCubic(inv(84, 92, B))
    const a = lerp(-0.9, 0.2, k)
    const r = lerp(14, 11.5, k)
    setCam(V(Math.sin(a) * r, lerp(7.5, 6.0, k), Math.cos(a) * r), V(0, -0.6, 0), 36)
    render3D('saturate(1.05) contrast(1.06)')
    card(B, of('card')[0], 92, H * 0.74)
    embers(B, 50, 0.6)
    grade(B, 0.6)
    flash((1 - inv(84, 84.15, B)) * 0.8)
    bug(1)
  }

  function faceoffShot(B: number) {
    const vsB = of('vs')[0].beat
    const k = inv(92, 104, B)
    const close = outExpo(inv(102.8, 104, B))
    const cx = W / 2
    const slant = 200 * (1 - close)
    const gap = 0
    const leftPoly: [number, number][] = [[0, 0], [cx + slant - gap, 0], [cx - slant - gap, H], [0, H]]
    const rightPoly: [number, number][] = [[cx + slant + gap, 0], [W, 0], [W, H], [cx - slant + gap, H]]
    const enter = outExpo(inv(92, 92.5, B))
    for (const side of ['red', 'black'] as Side[]) {
      resetBoard(B)
      mood(0.9)
      const f = side === 'red' ? 1 : -1
      const L = LOOK[side]
      rim.color.setHex(L.rgb)
      rim.intensity = 3
      rim.position.set(0, 3, f * 9)
      sun.position.set(-3, 6, -4 * f)
      for (const [i, v] of army) {
        if (v.piece.side !== side) v.root.visible = false
        else v.root.position.y = Math.max(0, Math.sin(clamp(frac(B - (side === 'red' ? i % 9 : 8 - (i % 9)) * 0.04) / 0.3) * Math.PI)) * 0.12 * (B < vsB ? 1 : 1.6)
      }
      const dist = lerp(6.2, 4.6, k) + (1 - enter) * 4
      // black's camera mirrors red's across the centre file (not rotated), so the halves read as a mirror pair
      const camPos = V(-0.6, lerp(1.0, 0.75, k), f * (4.5 - dist))
      const shake = hit(B, vsB, 0.6) * 0.15
      setCam(camPos, V(0, 0.5, f * 4.5), 34, shake, B, side === 'red' ? W * 0.27 : W * 0.73)
      render3DClip(side === 'red' ? leftPoly : rightPoly, 'saturate(1.08) contrast(1.1)')
      // tint
      ctx.save()
      ctx.beginPath()
      const poly = side === 'red' ? leftPoly : rightPoly
      poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
      ctx.clip()
      ctx.globalCompositeOperation = 'soft-light'
      ctx.fillStyle = side === 'red' ? 'rgba(255,60,30,0.45)' : 'rgba(60,140,255,0.45)'
      ctx.fillRect(0, 0, W, H)
      ctx.restore()
      // side title
      ctx.save()
      ctx.globalAlpha = outCubic(inv(92.3, 92.8, B)) * (1 - close)
      ctx.textBaseline = 'middle'
      ctx.font = `900 120px ${SERIF}`
      ctx.fillStyle = '#fff4e4'
      ctx.shadowColor = `rgba(${L.glow},0.9)`
      ctx.shadowBlur = 40
      spacedText(L.label, side === 'red' ? W * 0.2 : W * 0.8, 170, 30)
      ctx.font = `700 34px ${COND}`
      ctx.fillStyle = L.accent
      ctx.shadowBlur = 0
      spacedText(`TEAM  ${L.en}`, side === 'red' ? W * 0.2 : W * 0.8, 260, 12)
      ctx.restore()
    }
    // split edge
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (const [w, a] of [[30, 0.25], [10, 0.8], [3, 1]] as const) {
      ctx.strokeStyle = `rgba(255,236,200,${a})`
      ctx.lineWidth = w
      ctx.beginPath()
      ctx.moveTo(cx + slant, 0)
      for (let i = 1; i <= 14; i++) {
        const jitter = (hash(i + Math.floor(B * 24)) - 0.5) * 30 * (1 + hit(B, vsB, 0.6) * 3)
        ctx.lineTo(lerp(cx + slant, cx - slant, i / 14) + jitter, (i / 14) * H)
      }
      ctx.stroke()
    }
    ctx.restore()
    // VS slam
    const vt = B - vsB
    if (vt >= 0) {
      const s = lerp(3, 1, outExpo(inv(0, 0.22, vt))) * lerp(1, 1.08, inv(0.3, 3, vt)) * (1 + close * 1.5)
      sparks(cx, H * 0.5, vt, 77, '255,220,160')
      ctx.save()
      ctx.translate(cx, H * 0.5)
      ctx.rotate(-0.06)
      ctx.scale(s, s)
      ctx.font = `italic 900 260px ${COND}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 30
      ctx.strokeStyle = '#000'
      ctx.strokeText('VS', 0, 0)
      ctx.lineWidth = 10
      ctx.strokeStyle = '#fff'
      ctx.strokeText('VS', 0, 0)
      const g = ctx.createLinearGradient(-150, 0, 150, 0)
      g.addColorStop(0.45, '#ff4a32')
      g.addColorStop(0.55, '#5aa8ff')
      ctx.fillStyle = g
      ctx.fillText('VS', 0, 0)
      ctx.restore()
    }
    const ask = of('ask')[0]
    const aa = outCubic(inv(ask.beat, ask.beat + 0.5, B)) * (1 - close)
    if (aa > 0) {
      ctx.save()
      ctx.globalAlpha = aa
      const g = ctx.createLinearGradient(0, H * 0.72, 0, H)
      g.addColorStop(0, 'rgba(0,0,0,0)')
      g.addColorStop(1, 'rgba(0,0,0,0.7)')
      ctx.fillStyle = g
      ctx.fillRect(0, H * 0.72, W, H * 0.28)
      ctx.textBaseline = 'middle'
      ctx.font = `900 92px ${SERIF}`
      ctx.fillStyle = '#fff3dc'
      ctx.shadowColor = 'rgba(0,0,0,0.85)'
      ctx.shadowBlur = 20
      spacedText(ask.text, W / 2, H - 130, lerp(50, 24, aa))
      ctx.restore()
    }
    embers(B, 50, 0.7)
    grade(B, 0.6)
    flash(hit(B, vsB, 0.2) * 0.9)
    flash((1 - inv(92, 92.15, B)) * 0.9)
    flash(close * 0.9, '255,250,240')
  }

  function logoShot(B: number) {
    const t = B - 104
    resetBoard(B)
    mood(0.9)
    const a = t * 0.06
    setCam(V(Math.sin(a) * 4, 17, Math.cos(a) * 4 + 6), V(0, -1.5, 0), 40)
    render3D('brightness(0.42) saturate(0.85) blur(2px)')
    // god rays
    ctx.save()
    ctx.translate(W / 2, H * 0.42)
    ctx.rotate(B * 0.05)
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 16; i++) {
      ctx.rotate(TAU / 16)
      const g = ctx.createLinearGradient(0, 0, 1200, 0)
      g.addColorStop(0, `rgba(255,${i % 2 ? 120 : 160},${i % 2 ? 50 : 220},${0.1 * outCubic(inv(0, 1, t))})`)
      g.addColorStop(1, 'rgba(255,80,30,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(1200, -60 - hash(i) * 60)
      ctx.lineTo(1200, 60 + hash(i + 2) * 60)
      ctx.fill()
    }
    ctx.restore()
    const glow = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, 760)
    glow.addColorStop(0, `rgba(200,40,30,${0.45 * outCubic(inv(0, 0.6, t))})`)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)
    embers(B, 70, 0.8)
    // red & black generals drop in above the title
    const tkR = outBack(inv(0.4, 0.9, t), 1.8)
    const tkB = outBack(inv(0.55, 1.05, t), 1.8)
    const ty = H * 0.42 - 255
    if (tkR > 0) token(W / 2 - 112, lerp(-160, ty, tkR), 92, 'red', '帥', lerp(-1.5, 0, tkR))
    if (tkB > 0) token(W / 2 + 112, lerp(-160, ty, tkB), 92, 'black', '將', lerp(1.5, 0, tkB))
    const s = lerp(1.35, 1, outExpo(inv(0, 0.5, t))) * lerp(1, 1.04, inv(0.5, 8, t))
    const iw = 1000, ih = 1000 * (335 / 1100)
    ctx.save()
    ctx.globalAlpha = outCubic(inv(0, 0.25, t))
    ctx.translate(W / 2, H * 0.42)
    ctx.scale(s, s)
    ctx.shadowColor = 'rgba(255,90,40,0.6)'
    ctx.shadowBlur = 60
    ctx.drawImage(titleImg, -iw / 2, -ih / 2, iw, ih)
    ctx.restore()
    const sw = inv(0.4, 1.6, t)
    if (sw > 0 && sw < 1) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const x = lerp(W / 2 - 650, W / 2 + 650, sw)
      const g = ctx.createLinearGradient(x - 120, 0, x + 120, 0)
      g.addColorStop(0, 'rgba(255,255,255,0)')
      g.addColorStop(0.5, 'rgba(255,240,210,0.35)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(x - 120, H * 0.42 - ih / 2, 240, ih)
      ctx.restore()
    }
    const tag = of('tagline')[0]
    const ta = outCubic(inv(tag.beat, tag.beat + 0.6, B))
    ctx.save()
    ctx.globalAlpha = ta
    ctx.font = `900 92px ${SERIF}`
    ctx.fillStyle = '#fff1d6'
    ctx.shadowColor = 'rgba(255,120,40,0.6)'
    ctx.shadowBlur = 30
    ctx.textBaseline = 'middle'
    spacedText(tag.text, W / 2, H * 0.74, lerp(80, 40, ta))
    ctx.shadowBlur = 0
    ctx.globalAlpha = ta * inv(108.6, 109.2, B)
    ctx.font = `500 32px ${SANS}`
    ctx.fillStyle = 'rgba(255,241,214,0.78)'
    spacedText('紅黑七大兵種　雙人・電腦・教學', W / 2, H * 0.83, 6)
    ctx.restore()
    grade(B, 0.7)
    flash(hit(B, 104, 0.25) * 1.0, '255,230,200')
    fade(inCubic(inv(115.4, 117, B)))
  }

  // ════════════════════════════════════════════════════════
  function drawFrame(B: number) {
    ctx.save()
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)
    switch (shotAt(B).name) {
      case 'open': openShot(B); break
      case 'reveal': revealShot(B); break
      case 'classes': classesShot(B); break
      case 'kings': kingsShot(B); break
      case 'clash': clashShot(B); break
      case 'army': armyShot(B); break
      case 'faceoff': faceoffShot(B); break
      case 'logo': logoShot(B); break
    }
    ctx.restore()
  }

  return { drawFrame, beatAt, frames: FRAMES }
}
