// Beat-locked brand film for Q 版象棋王國 (30 s, 120 BPM, 60 beats, 1080p60).
//
// Style follows a year-ahead AAA trailer: dark cinematic grade, embers, a split-flap
// title reveal, a lit "garage" line-up with light pillars, bold feature cards with an
// English kicker, rising tech-tree bars, and an emblem end card.
//
// drawFrame(B) is a pure function of the beat number B. The 3D layer reuses the
// game's own Board/Terrain/PieceView (pieces.glb); 2D captions, flips, impacts and
// the grade are drawn on top. Cue beats come from score.json (audio.py plays the same list).

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
/** decaying 0..1 envelope after beat b0 */
const hit = (B: number, b0: number, len = 0.6) => (B < b0 ? 0 : Math.exp(-((B - b0) / len) * 4))

const SHOTS = score.shots.map((s, i) => ({ ...s, end: score.shots[i + 1]?.beat ?? score.beats }))
const shotAt = (B: number) => SHOTS.filter((s) => s.beat <= B).pop() ?? SHOTS[0]

// ─── materials ───────────────────────────────────────────
function glowMaterial(color: number, fade: 'up' | 'down' | 'radial', strength = 1): THREE.ShaderMaterial {
  const m = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: strength } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
      void main(){
        float a = ${fade === 'radial' ? 'pow(clamp(1.0 - length(vUv - 0.5) * 2.0, 0.0, 1.0), 1.8)' : fade === 'up' ? 'pow(vUv.y, 1.4)' : 'pow(1.0 - vUv.y, 1.4)'};
        gl_FragColor = vec4(uColor, a * uOpacity);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  m.userData.outlineParameters = NO_OUTLINE
  return m
}

function barMaterial(): THREE.ShaderMaterial {
  const m = new THREE.ShaderMaterial({
    uniforms: { uHeat: { value: 0 } },
    vertexShader: /* glsl */ `varying vec3 vP; varying vec2 vUv; void main(){ vUv = uv; vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uHeat; varying vec3 vP; varying vec2 vUv;
      void main(){
        float y = vUv.y;
        vec3 base = mix(vec3(0.05,0.05,0.07), vec3(0.55,0.32,0.08), pow(y, 2.0));
        float stripe = step(0.92, fract(y * 14.0)) * 0.35 * y;
        float edge = smoothstep(0.42, 0.5, max(abs(vUv.x - 0.5), 0.0));
        vec3 col = base + vec3(1.0,0.75,0.3) * (stripe + edge * 0.5 * y) + vec3(1.0,0.85,0.5) * smoothstep(0.985, 1.0, y) * 1.5;
        gl_FragColor = vec4(col * (0.6 + 0.6 * uHeat), 1.0);
      }`,
  })
  m.userData.outlineParameters = NO_OUTLINE
  return m
}

// ─── piece helpers ───────────────────────────────────────
function makePiece(side: Side, kind: PieceKind): PieceView {
  const v = new PieceView({ side, kind } as Piece)
  v.root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (mesh.isMesh) mesh.castShadow = true
  })
  return v
}

function boardArmy(): { root: THREE.Group; at: Map<number, PieceView> } {
  const root = new THREE.Group()
  const at = new Map<number, PieceView>()
  const pos = parseFen(START_FEN)
  pos.board.forEach((p, i) => {
    if (!p) return
    const v = makePiece(p.side, p.kind)
    v.root.position.copy(squareToWorld(i))
    root.add(v.root)
    at.set(i, v)
  })
  return { root, at }
}

/** gentle idle bob for a figure */
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
  renderer.toneMappingExposure = 1.05
  const outline = new OutlineEffect(renderer, { defaultThickness: 0.0035, defaultColor: [0.1, 0.07, 0.06], defaultAlpha: 0.95 })
  const camera = new THREE.PerspectiveCamera(35, W / H, 0.05, 200)

  // ── board scene (cold open, flip bg, battle, teach, check)
  const boardScene = new THREE.Scene()
  boardScene.background = new THREE.Color(0x07080c)
  const board = new Board()
  boardScene.add(board.root)
  const army = boardArmy()
  boardScene.add(army.root)
  const hemi = new THREE.HemisphereLight(0xbfd2ff, 0x2a1f18, 0.6)
  const sun = new THREE.DirectionalLight(0xffb070, 2.6)
  sun.castShadow = true
  sun.shadow.mapSize.set(4096, 4096)
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.02
  const rim = new THREE.DirectionalLight(0x8fb4ff, 1.2)
  boardScene.add(hemi, sun, sun.target, rim, rim.target)

  // extra props for staged moments
  const lesson = {
    horse: makePiece('red', 'horse'),
    pawnA: makePiece('black', 'pawn'),
    pawnB: makePiece('black', 'pawn'),
  }
  const mate = { rook: makePiece('red', 'rook'), king: makePiece('black', 'king'), advL: makePiece('black', 'advisor'), advR: makePiece('black', 'advisor') }
  const extras = new THREE.Group()
  extras.add(...[...Object.values(lesson), ...Object.values(mate)].map((v) => v.root))
  boardScene.add(extras)
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), withoutOutline(new THREE.MeshBasicMaterial({ color: 0xffd36a })))
  const shellGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), glowMaterial(0xff9a2a, 'radial', 1.4))
  shell.add(shellGlow)
  boardScene.add(shell)

  // ── line-up stage
  const stageScene = new THREE.Scene()
  stageScene.background = new THREE.Color(0x050608)
  stageScene.fog = new THREE.Fog(0x050608, 9, 22)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.35, metalness: 0.6 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  floor.material.userData.outlineParameters = NO_OUTLINE
  stageScene.add(floor)
  stageScene.add(new THREE.HemisphereLight(0x6070a0, 0x101010, 0.25))
  const back = new THREE.DirectionalLight(0x7fa0ff, 1.4)
  back.position.set(0, 4, -6)
  stageScene.add(back)
  const LINEUP: { kind: PieceKind; x: number }[] = [
    { kind: 'pawn', x: -3.3 }, { kind: 'cannon', x: 3.3 }, { kind: 'horse', x: -2.2 }, { kind: 'rook', x: 2.2 },
    { kind: 'elephant', x: -1.1 }, { kind: 'advisor', x: 1.1 }, { kind: 'king', x: 0 },
  ]
  const lineup = LINEUP.map((l) => {
    const v = makePiece('red', l.kind)
    v.root.position.set(l.x, 0, l.kind === 'king' ? 0.35 : 0)
    v.root.rotation.y = Math.PI
    v.root.scale.setScalar(1.25)
    const spot = new THREE.SpotLight(0xfff0d8, 0, 9, 0.42, 0.55, 1.2)
    spot.position.set(l.x, 6, 1.4)
    spot.target = v.root
    spot.castShadow = l.kind === 'king'
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 1.0, 6, 32, 1, true), glowMaterial(0xffe2b0, 'up', 0))
    cone.position.set(l.x, 3, v.root.position.z + 0.6)
    cone.rotation.x = -0.2
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), glowMaterial(0xffd9a0, 'radial', 0))
    pool.rotation.x = -Math.PI / 2
    pool.position.set(l.x, 0.01, v.root.position.z)
    stageScene.add(v.root, spot, cone, pool)
    return { ...l, v, spot, cone, pool }
  })
  const pillars: THREE.Mesh[] = []
  for (let i = -4; i <= 4; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 7, 0.12), withoutOutline(new THREE.MeshBasicMaterial({ color: 0xffa040 })))
    p.position.set(i * 1.9, 3.5, -5 - Math.abs(i) * 0.4)
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 8), glowMaterial(0xff8a2a, 'radial', 0.6))
    halo.position.copy(p.position).add(V(0, 0, 0.1))
    stageScene.add(p, halo)
    pillars.push(p, halo)
  }

  // ── difficulty bars
  const barScene = new THREE.Scene()
  barScene.background = null
  barScene.add(new THREE.HemisphereLight(0xfff0e0, 0x202030, 1.2))
  const key = new THREE.DirectionalLight(0xffd8a0, 2.2)
  key.position.set(3, 8, 6)
  barScene.add(key)
  const BARS: { kind: PieceKind; x: number; h: number }[] = [
    { kind: 'pawn', x: -2.6, h: 1.4 },
    { kind: 'horse', x: 0, h: 2.4 },
    { kind: 'king', x: 2.6, h: 3.4 },
  ]
  const bars = BARS.map((b) => {
    const mat = barMaterial()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), mat)
    mesh.position.x = b.x
    const v = makePiece('red', b.kind)
    v.root.rotation.y = Math.PI
    v.root.scale.setScalar(1.3)
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 9), glowMaterial(0xffb050, 'up', 0))
    beam.position.set(b.x, 4.5, -0.7)
    barScene.add(mesh, v.root, beam)
    return { ...b, mesh, mat, v, beam }
  })

  // ── 2D helpers
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
    return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, behind: v.z > 1 }
  }

  function setCam(pos: THREE.Vector3, look: THREE.Vector3, fov = 35, shake = 0, B = 0) {
    camera.fov = fov
    camera.updateProjectionMatrix()
    camera.position.copy(pos)
    if (shake > 0) {
      const t = B * 37
      camera.position.add(V((hash(Math.floor(t)) - 0.5) * shake, (hash(Math.floor(t) + 9) - 0.5) * shake, 0))
    }
    camera.lookAt(look)
  }

  function render3D(scene: THREE.Scene, filter = 'none') {
    renderer.setClearColor(0x000000, 0)
    renderer.clear()
    outline.render(scene, camera)
    ctx.save()
    ctx.filter = filter
    ctx.drawImage(gl, 0, 0)
    ctx.restore()
  }

  // ── board state per frame
  function resetBoard(B: number, opts: { army?: boolean; lesson?: boolean; mate?: boolean } = {}) {
    army.root.visible = opts.army ?? true
    lesson.horse.root.visible = lesson.pawnA.root.visible = lesson.pawnB.root.visible = !!opts.lesson
    for (const v of Object.values(mate)) v.root.visible = !!opts.mate
    shell.visible = false
    let k = 0
    for (const [i, v] of army.at) {
      v.root.position.copy(squareToWorld(i))
      v.root.rotation.set(0, 0, 0)
      v.root.scale.setScalar(1)
      v.root.visible = true
      idle(v, B, k++ * 1.7)
    }
    board.showMarkers(null, [])
    board.tick(B * SPB)
  }

  function moodDusk(strength = 1) {
    hemi.intensity = 0.3 * strength
    hemi.color.set(0x9fb6e8)
    sun.color.set(0xff9a50)
    sun.intensity = 3.4 * strength
    sun.position.set(-7, 4.2, -5)
    sun.target.position.set(0, 0, 0)
    rim.position.set(6, 3, 6)
    rim.intensity = 0.9 * strength
    renderer.toneMappingExposure = 0.9
  }
  function moodDay() {
    hemi.intensity = 1.3
    hemi.color.set(0xfff4e6)
    sun.color.set(0xfff0d8)
    sun.intensity = 2.0
    sun.position.set(4, 12, 6)
    rim.intensity = 0.3
    renderer.toneMappingExposure = 1.0
  }

  // ── 2D overlays
  function embers(B: number, count: number, alpha = 1, warm = true) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < count; i++) {
      const sp = 0.05 + hash(i) * 0.1
      const life = frac(B * SPB * sp + hash(i + 3))
      const x = (hash(i + 7) * 1.2 - 0.1) * W + Math.sin(B * 0.9 + i) * 40 + life * 120
      const y = H * (1.05 - life * 1.15)
      const r = 1.5 + hash(i + 11) * 3.5
      const a = Math.sin(life * Math.PI) * alpha * (0.4 + 0.6 * hash(i + 13)) * (0.6 + 0.4 * Math.sin(B * 6 + i))
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4)
      g.addColorStop(0, warm ? `rgba(255,190,90,${a})` : `rgba(200,220,255,${a})`)
      g.addColorStop(1, 'rgba(255,120,30,0)')
      ctx.fillStyle = g
      ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8)
    }
    ctx.restore()
  }

  function haze(alpha: number, color = '255,150,70', y0 = 0.55) {
    const g = ctx.createLinearGradient(0, H * y0, 0, H)
    g.addColorStop(0, `rgba(${color},0)`)
    g.addColorStop(1, `rgba(${color},${alpha})`)
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
  }

  function grade(B: number, vignette = 0.75) {
    ctx.save()
    // teal shadows / warm highlights
    ctx.globalCompositeOperation = 'soft-light'
    ctx.fillStyle = 'rgba(20,60,80,0.35)'
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

  function letterbox(amount: number) {
    if (amount <= 0) return
    const h = H * 0.12 * amount
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, h)
    ctx.fillRect(0, H - h, W, h)
  }

  function bug(alpha: number) {
    // corner emblem like a broadcast bug
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

  function spacedText(text: string, x: number, y: number, spacing: number) {
    const chars = [...text]
    const widths = chars.map((c) => ctx.measureText(c).width)
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
    let cx = x - total / 2
    ctx.textAlign = 'left'
    chars.forEach((c, i) => {
      ctx.fillText(c, cx, y)
      cx += widths[i] + spacing
    })
  }

  /** WoT-style feature card: English kicker, huge title, subtitle, gold rule. */
  function card(B: number, e: Ev, end: number, y = H * 0.74) {
    const t = B - e.beat
    if (t < 0 || B > end) return
    const inK = outExpo(inv(0, 0.45, t))
    const outK = inCubic(inv(end - 0.4, end, B))
    const a = inK * (1 - outK)
    ctx.save()
    ctx.globalAlpha = a
    ctx.textBaseline = 'alphabetic'
    // backing shade
    const sh = ctx.createLinearGradient(0, y - 220, 0, H)
    sh.addColorStop(0, 'rgba(0,0,0,0)')
    sh.addColorStop(1, 'rgba(0,0,0,0.65)')
    ctx.fillStyle = sh
    ctx.fillRect(0, y - 220, W, H - y + 220)
    // kicker
    ctx.font = `600 30px ${COND}`
    ctx.fillStyle = GOLD
    spacedText(e.kicker ?? '', W / 2, y - 132 + (1 - inK) * 20, 10)
    // title
    const long = [...e.title].length > 6
    const size = long ? 104 : 150
    const scale = lerp(1.18, 1, inK) * lerp(1, 1.04, outK)
    ctx.save()
    ctx.translate(W / 2, y)
    ctx.scale(scale, scale)
    ctx.font = `900 ${size}px ${SERIF}`
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 30
    ctx.shadowOffsetY = 8
    const tg = ctx.createLinearGradient(0, -size, 0, 0)
    tg.addColorStop(0, '#ffffff')
    tg.addColorStop(0.65, '#fff1d6')
    tg.addColorStop(1, '#e8b860')
    ctx.fillStyle = tg
    spacedText(e.title, 0, 0, long ? 8 : 26)
    ctx.restore()
    // rule
    const rw = 520 * outCubic(inv(0.1, 0.6, t))
    const rg = ctx.createLinearGradient(W / 2 - rw / 2, 0, W / 2 + rw / 2, 0)
    rg.addColorStop(0, 'rgba(244,196,90,0)')
    rg.addColorStop(0.5, 'rgba(244,196,90,1)')
    rg.addColorStop(1, 'rgba(244,196,90,0)')
    ctx.fillStyle = rg
    ctx.fillRect(W / 2 - rw / 2, y + 30, rw, 3)
    // subtitle
    ctx.globalAlpha = a * inv(0.25, 0.6, t)
    ctx.font = `600 50px ${SANS}`
    ctx.fillStyle = '#f3ead8'
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 16
    spacedText(e.sub ?? '', W / 2, y + 100, 14)
    ctx.restore()
  }

  function caption(B: number, e: Ev, len = 2.6) {
    const t = B - e.beat
    if (t < 0 || t > len) return
    const a = Math.min(inv(0, 0.6, t), 1 - inv(len - 0.6, len, t))
    ctx.save()
    ctx.globalAlpha = a
    ctx.font = `700 76px ${SERIF}`
    ctx.fillStyle = '#f6ead2'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(255,150,60,0.6)'
    ctx.shadowBlur = 30
    spacedText(e.text, W / 2, H * 0.8 + (1 - outCubic(inv(0, 1.2, t))) * 16, lerp(70, 44, outCubic(inv(0, len, t))))
    ctx.restore()
  }

  function speedLines(cx: number, cy: number, k: number, color: string, seed: number, dark = false) {
    if (k <= 0) return
    ctx.save()
    ctx.globalCompositeOperation = dark ? 'source-over' : 'lighter'
    for (let i = 0; i < 90; i++) {
      if (hash(i + seed) < 0.45) continue
      const a = (i / 90) * TAU + hash(i * 3 + seed) * 0.05
      const r0 = lerp(120, 380, hash(i + 5 + seed)) + (1 - k) * 300
      const r1 = 1400
      const w = 0.004 + hash(i + 9 + seed) * 0.012
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1)
      ctx.lineTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0)
      ctx.lineTo(cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1)
      ctx.fillStyle = color
      ctx.globalAlpha = k * (dark ? 0.9 : 0.55)
      ctx.fill()
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

  function sparks(cx: number, cy: number, t: number, seed: number, color = '255,190,90') {
    if (t < 0 || t > 1.6) return
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 70; i++) {
      const a = hash(i + seed) * TAU
      const sp = 300 + hash(i * 2 + seed) * 900
      const d = sp * outCubic(clamp(t / 1.2))
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
    g.addColorStop(0, `rgba(255,235,190,${k})`)
    g.addColorStop(0.3, `rgba(${color},${k * 0.5})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(cx - 420, cy - 420, 840, 840)
    ctx.restore()
  }

  // ── split-flap tiles
  const FLIP_TEXT = ['楚', '河', '漢', '界']
  const POOL = '帥仕相俥傌炮兵將士象車馬砲卒王國'
  function flapTile(x: number, y: number, w: number, h: number, top: string, bottom: string, flapChar: string, flapP: number, glow: number) {
    const drawHalf = (ch: string, half: 'top' | 'bottom', scaleY = 1) => {
      ctx.save()
      const hy = y + h / 2
      ctx.beginPath()
      if (half === 'top') ctx.rect(x, y, w, h / 2 - 2)
      else ctx.rect(x, hy + 2, w, h / 2 - 2)
      ctx.clip()
      ctx.translate(0, hy)
      ctx.scale(1, scaleY)
      ctx.translate(0, -hy)
      const g = ctx.createLinearGradient(0, y, 0, y + h)
      g.addColorStop(0, '#2a2c33')
      g.addColorStop(0.5, '#15161b')
      g.addColorStop(1, '#202228')
      ctx.fillStyle = g
      ctx.fillRect(x, y, w, h)
      if (ch) {
        ctx.font = `900 ${h * 0.68}px ${SERIF}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.shadowColor = `rgba(255,40,20,${0.9 * glow})`
        ctx.shadowBlur = 40
        ctx.fillStyle = glow > 0.5 ? '#ff4a32' : '#a8392c'
        ctx.fillText(ch, x + w / 2, y + h / 2 + h * 0.03)
        ctx.shadowBlur = 0
        ctx.fillStyle = `rgba(255,210,180,${0.35 * glow})`
        ctx.fillText(ch, x + w / 2, y + h / 2 + h * 0.03)
      }
      ctx.restore()
    }
    drawHalf(top, 'top')
    drawHalf(bottom, 'bottom')
    if (flapP < 1) {
      if (flapP < 0.5) drawHalf(flapChar, 'top', 1 - flapP * 2)
      else drawHalf(top, 'bottom', flapP * 2 - 1)
    }
    ctx.fillStyle = '#000'
    ctx.fillRect(x, y + h / 2 - 2, w, 4)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, w, h)
  }

  // ════════════════════════════════════════════════════════
  // shots
  // ════════════════════════════════════════════════════════

  function coldOpen(B: number) {
    resetBoard(B)
    moodDusk(0.5)
    hemi.intensity = 0.1
    sun.position.set(0, 2.2, -9)
    sun.intensity = 4.5
    rim.intensity = 0.5
    rim.color.set(0x6f8fd8)
    renderer.toneMappingExposure = 0.75
    const king = army.at.get(sq(4, 0))!
    if (B < 4) {
      const k = inOutCubic(inv(0, 4, B))
      setCam(V(lerp(1.3, 0.75, k), lerp(0.42, 0.5, k), lerp(6.4, 5.6, k)), V(lerp(0.2, 0, k), 0.45, -4), 30)
    } else {
      const k = inOutCubic(inv(4, 8, B))
      const a = lerp(-0.5, 0.25, k)
      const r = lerp(1.35, 1.05, k)
      setCam(V(Math.sin(a) * r, 0.28, 4.5 - Math.cos(a) * r), V(0, 0.5, 4.5), 28)
      king.figure.rotation.y = Math.PI
    }
    render3D(boardScene, 'saturate(0.55) contrast(1.25) brightness(0.8)')
    haze(0.35 * (1 - inv(6, 8, B)), '255,130,60', 0.4)
    embers(B, 70, 0.9)
    for (const e of of('caption')) caption(B, e, e.beat === 1 ? 2.8 : 3.6)
    grade(B, 0.85)
    letterbox(1 - inOutCubic(inv(7, 8, B)))
    ctx.fillStyle = `rgba(0,0,0,${1 - outCubic(inv(0, 1.2, B))})`
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = `rgba(0,0,0,${inCubic(inv(7.6, 8, B))})`
    ctx.fillRect(0, 0, W, H)
  }

  function flipShot(B: number) {
    resetBoard(B)
    moodDusk(0.6)
    const k = inv(8, 14, B)
    setCam(V(0, 15 - k * 2, 2 + k * 2), V(0, 0, 0), 38)
    renderer.setClearColor(0, 0)
    outline.render(boardScene, camera)
    ctx.save()
    ctx.filter = 'blur(10px) brightness(0.28) saturate(0.6)'
    ctx.drawImage(gl, 0, 0)
    ctx.restore()
    // light streaks
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 5; i++) {
      const y = H * (0.2 + i * 0.15)
      const x = ((B * 180 * (0.6 + hash(i) * 0.8) + hash(i + 4) * W) % (W + 800)) - 400
      const g = ctx.createLinearGradient(x - 400, 0, x + 400, 0)
      g.addColorStop(0, 'rgba(255,80,40,0)')
      g.addColorStop(0.5, 'rgba(255,90,40,0.18)')
      g.addColorStop(1, 'rgba(255,80,40,0)')
      ctx.fillStyle = g
      ctx.fillRect(x - 400, y, 800, 2)
    }
    ctx.restore()

    const tw = 250, th = 320, gap = 34
    const total = tw * 4 + gap * 3
    const zoom = lerp(1.0, 1.06, inv(8, 14, B))
    ctx.save()
    ctx.translate(W / 2, H * 0.44)
    ctx.scale(zoom, zoom)
    ctx.translate(-W / 2, -H * 0.44)
    const flips = of('flip')
    FLIP_TEXT.forEach((ch, i) => {
      const fb = flips[i].beat
      const x = W / 2 - total / 2 + i * (tw + gap)
      const y = H * 0.44 - th / 2
      const step = 0.125
      let cur: string, prev: string, p: number
      if (B < fb) {
        const n = Math.floor((B - 8) / step)
        cur = n < 0 ? '' : POOL[(n * 5 + i * 3) % POOL.length]
        prev = n <= 0 ? '' : POOL[((n - 1) * 5 + i * 3) % POOL.length]
        p = frac((B - 8) / step)
      } else {
        const n = Math.floor((fb - 8) / step) - 1
        cur = ch
        prev = n < 0 ? '' : POOL[(n * 5 + i * 3) % POOL.length]
        p = clamp((B - fb) / 0.15)
      }
      const glow = B >= fb ? 0.6 + 0.4 * hit(B, fb, 0.5) + 0.15 * hit(B, 12, 1) : 0.25
      flapTile(x, y, tw, th, cur, p < 1 ? prev : cur, prev, p, glow)
    })
    ctx.restore()
    // subtitle at the braam
    const s = inv(12, 12.6, B)
    if (s > 0) {
      ctx.save()
      ctx.globalAlpha = outCubic(s) * (1 - inv(13.6, 14, B))
      ctx.font = `600 30px ${COND}`
      ctx.fillStyle = GOLD
      spacedText('Q-STYLE  XIANGQI  KINGDOM', W / 2, H * 0.74, 12)
      ctx.font = `700 64px ${SERIF}`
      ctx.fillStyle = '#f6ead2'
      ctx.shadowColor = 'rgba(255,80,40,0.5)'
      ctx.shadowBlur = 24
      spacedText('一盤棋　一個王國', W / 2, H * 0.82, lerp(40, 22, outCubic(s)))
      ctx.restore()
    }
    embers(B, 40, 0.6)
    flash(hit(B, 12, 0.25) * 0.5, '255,120,80')
    grade(B, 0.8)
    ctx.fillStyle = `rgba(0,0,0,${1 - outCubic(inv(8, 8.3, B))})`
    ctx.fillRect(0, 0, W, H)
  }

  function lineupShot(B: number) {
    const k = inOutCubic(inv(14, 24, B))
    const swing = Math.sin(B * 0.25) * 0.15
    setCam(V(lerp(-1.2, 0.8, k), lerp(0.75, 0.95, k), lerp(7.4, 5.6, k)), V(swing * 0.5, 1.05, 0), 36)
    for (const [i, l] of lineup.entries()) {
      const e = of('spot').find((s) => s.kind === l.kind)!
      const on = inv(e.beat, e.beat + 0.12, B)
      const pulse = hit(B, e.beat, 0.5)
      l.spot.intensity = on * (40 + pulse * 60)
      ;(l.cone.material as THREE.ShaderMaterial).uniforms.uOpacity.value = on * (0.22 + pulse * 0.35)
      ;(l.pool.material as THREE.ShaderMaterial).uniforms.uOpacity.value = on * (0.5 + pulse * 0.6)
      l.v.root.position.y = Math.max(0, Math.sin(clamp((B - e.beat) / 0.5) * Math.PI)) * 0.25 * (B >= e.beat ? 1 : 0)
      idle(l.v, B, i)
    }
    for (const p of pillars) p.visible = true
    render3D(stageScene)
    // name tags
    for (const l of lineup) {
      const e = of('spot').find((s) => s.kind === l.kind)!
      const t = B - e.beat
      if (t < 0) continue
      const pos = project(V(l.x, -0.05, l.v.root.position.z + 0.7))
      const a = outCubic(inv(0, 0.3, t)) * (1 - inv(19.6, 20, B))
      if (a <= 0) continue
      ctx.save()
      ctx.globalAlpha = a
      ctx.font = `900 ${l.kind === 'king' ? 64 : 50}px ${SERIF}`
      ctx.fillStyle = '#ffe9c4'
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(255,140,40,0.7)'
      ctx.shadowBlur = 20
      ctx.fillText(NAME[l.kind], pos.x, pos.y + 40)
      ctx.font = `600 18px ${COND}`
      ctx.fillStyle = GOLD
      ctx.shadowBlur = 0
      spacedText(EN[l.kind], pos.x, pos.y + 72, 5)
      ctx.restore()
    }
    embers(B, 40, 0.5)
    card(B, of('card')[0], 24, H * 0.88)
    flash(hit(B, 20, 0.2) * 0.35)
    grade(B, 0.7)
    flash(1 - outCubic(inv(14, 14.25, B)), '255,255,255')
  }

  // rook charge a0 → a6 (captures black pawn); cannon b2 → b9 (captures black horse)
  const ROOK_FROM = sq(0, 0), ROOK_TO = sq(0, 6), PAWN_BLOCK = sq(0, 3)
  const CAN_FROM = sq(1, 2), CAN_TO = sq(1, 9)

  function battleShot(B: number) {
    resetBoard(B)
    moodDusk(1)
    const charge = of('charge')[0].beat
    const imp1 = of('impact')[0].beat
    const imp2 = of('impact')[1].beat
    army.at.get(PAWN_BLOCK)!.root.visible = false
    const rook = army.at.get(ROOK_FROM)!
    const victim = army.at.get(ROOK_TO)!
    const from = squareToWorld(ROOK_FROM)
    const to = squareToWorld(ROOK_TO)
    // slow motion just after the hit
    const ck = B < imp1 ? inCubic(inv(charge, imp1, B)) : 1
    const rp = from.clone().lerp(to, ck)
    rook.root.position.copy(rp)
    rook.root.position.y = B > charge && B < imp1 ? Math.abs(Math.sin(B * 14)) * 0.04 : 0
    rook.root.rotation.x = B > charge && B < imp1 ? -0.12 * inv(charge, charge + 0.5, B) : 0
    if (B >= imp1) {
      const t = (B - imp1) * (B < imp1 + 1 ? 0.35 : 1) // slow-mo
      const tt = B < imp1 + 1 ? t : 0.35 + (B - imp1 - 1)
      victim.root.position.copy(to).add(V(0.25 * tt, Math.sin(clamp(tt / 1.4) * Math.PI) * 1.6, -1.6 * tt))
      victim.root.rotation.set(-tt * 6, tt * 4, tt * 3)
      victim.root.scale.setScalar(Math.max(0.001, 1 - inv(0.8, 1.6, tt)))
    }
    // cannon shot
    const cannon = army.at.get(CAN_FROM)!
    const horse = army.at.get(CAN_TO)!
    const cb = of('cannon')[0].beat
    cannon.figure.position.z = -0.17 + 0.14 * hit(B, cb, 0.4) // recoil
    if (B >= cb && B < imp2) {
      const k = (B - cb) / (imp2 - cb)
      const a = squareToWorld(CAN_FROM).add(V(0, 0.45, -0.3))
      const b = squareToWorld(CAN_TO).add(V(0, 0.35, 0))
      shell.visible = true
      shell.position.lerpVectors(a, b, k)
      shell.position.y += Math.sin(k * Math.PI) * 2.4
      shellGlow.lookAt(camera.position)
    }
    if (B >= imp2) {
      const t = B - imp2
      horse.root.position.copy(squareToWorld(CAN_TO)).add(V(-0.4 * t, Math.sin(clamp(t / 1.2) * Math.PI) * 1.4, -0.8 * t))
      horse.root.rotation.set(t * 5, -t * 3, 0)
      horse.root.scale.setScalar(Math.max(0.001, 1 - inv(0.6, 1.2, t)))
    }

    const shake = hit(B, imp1, 0.5) * 0.25 + hit(B, imp2, 0.5) * 0.15
    if (B < charge) {
      // low behind the rook, looking down the file across the river
      const k = inOutCubic(inv(24, charge, B))
      setCam(V(-4.55 + k * 0.1, 0.42, 5.9 - k * 0.3), V(-4, 0.4, -3), 30)
    } else if (B < imp1 + 0.01) {
      // side tracking shot
      const side = V(-6.2, 0.7, 0)
      setCam(V(side.x, side.y, rp.z + 1.4), V(-4, 0.35, rp.z - 0.8), 32, shake * 0.4, B)
    } else if (B < cb) {
      // slow orbit around the rook on the captured square
      const k = inv(imp1, cb, B)
      const a = lerp(-2.2, -1.2, k)
      setCam(V(-4 + Math.cos(a) * 2.4, 0.9, to.z + Math.sin(a) * -2.4), V(-4, 0.4, to.z), 32, shake, B)
    } else {
      // wide elevated side view to read the cannon arc
      const k = inv(cb, 34, B)
      setCam(V(4.5 - k * 0.6, 4.2, 0.6), V(-2.4, 0.3, -1.2), 36, shake, B)
    }
    render3D(boardScene, 'saturate(0.8) contrast(1.12)')
    // impact 2D
    const p1 = project(to.clone().add(V(0, 0.4, 0)))
    const p2 = project(squareToWorld(CAN_TO).add(V(0, 0.4, 0)))
    if (B >= imp1 && B < cb) {
      sparks(p1.x, p1.y, (B - imp1) * 0.6, 3, '255,150,60')
      speedLines(p1.x, p1.y, hit(B, imp1, 0.7), 'rgba(255,170,90,1)', 11)
    }
    if (B >= cb && B < imp2) {
      const A = squareToWorld(CAN_FROM).add(V(0, 0.45, -0.3)), Bp = squareToWorld(CAN_TO).add(V(0, 0.35, 0))
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const kNow = (B - cb) / (imp2 - cb)
      for (let j = 0; j < 24; j++) {
        const kk = kNow - j * 0.012
        if (kk < 0) break
        const w = A.clone().lerp(Bp, kk)
        w.y += Math.sin(kk * Math.PI) * 2.4
        const p = project(w)
        const r = 26 * (1 - j / 24)
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
        g.addColorStop(0, `rgba(255,220,140,${0.8 * (1 - j / 24)})`)
        g.addColorStop(1, 'rgba(255,120,30,0)')
        ctx.fillStyle = g
        ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2)
      }
      ctx.restore()
    }
    if (B >= imp2) {
      sparks(p2.x, p2.y, B - imp2, 8, '255,200,90')
      speedLines(p2.x, p2.y, hit(B, imp2, 0.5), 'rgba(255,210,120,1)', 21)
    }
    if (B > charge && B < imp1) speedLines(W / 2, H / 2, inv(charge, imp1, B) * 0.5, 'rgba(255,255,255,1)', 31)
    haze(0.18)
    embers(B, 50, 0.7)
    card(B, of('card')[1], 32.6)
    flash(hit(B, imp1, 0.15) * 0.9)
    flash(hit(B, imp2, 0.12) * 0.5)
    grade(B, 0.7)
    flash(1 - outCubic(inv(24, 24.2, B)), '255,255,255')
  }

  function levelsShot(B: number) {
    // background: dark with a faint tech-tree grid
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#0a0b10')
    bg.addColorStop(1, '#1a1208')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    ctx.save()
    ctx.strokeStyle = 'rgba(244,196,90,0.06)'
    ctx.lineWidth = 1
    const off = (B * 30) % 80
    for (let x = -80 + off; x < W + 80; x += 80) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
    }
    for (let y = 0; y < H; y += 80) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }
    ctx.restore()

    const k = inOutCubic(inv(34, 42, B))
    setCam(V(lerp(-1.2, 1.2, k), lerp(1.4, 2.0, k), lerp(13, 11.8, k)), V(0, lerp(2.9, 3.2, k), 0), 34)
    for (const [i, b] of bars.entries()) {
      const e = of('bar')[i]
      const g = outBack(inv(e.beat, e.beat + 0.7, B), 1.2)
      const h = Math.max(0.02, b.h * g)
      b.mesh.scale.y = h
      b.mesh.position.y = h / 2
      b.mat.uniforms.uHeat.value = 0.5 + hit(B, e.beat, 0.6)
      b.v.root.position.set(b.x, h, 0)
      b.v.root.visible = B >= e.beat
      idle(b.v, B, i)
      ;(b.beam.material as THREE.ShaderMaterial).uniforms.uOpacity.value = (B >= e.beat ? 0.25 : 0) + hit(B, e.beat, 0.4) * 0.6
    }
    render3D(barScene)
    // labels
    const LABEL = [
      { zh: '簡單', en: 'EASY', stars: 1 },
      { zh: '普通', en: 'NORMAL', stars: 2 },
      { zh: '困難', en: 'HARD', stars: 3 },
    ]
    for (const [i, b] of bars.entries()) {
      const e = of('bar')[i]
      const t = B - e.beat - 0.3
      if (t < 0) continue
      const p = project(V(b.x, 0, 0.8))
      ctx.save()
      ctx.globalAlpha = outCubic(inv(0, 0.4, t)) * (1 - inv(41.6, 42, B))
      ctx.textAlign = 'center'
      ctx.font = `900 58px ${SERIF}`
      ctx.fillStyle = '#fff1d6'
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 14
      ctx.fillText(LABEL[i].zh, p.x, p.y + 70)
      ctx.font = `28px ${SANS}`
      ctx.fillStyle = GOLD
      ctx.fillText('★'.repeat(LABEL[i].stars) + '☆'.repeat(3 - LABEL[i].stars), p.x, p.y + 112)
      ctx.font = `600 20px ${COND}`
      spacedText(LABEL[i].en, p.x, p.y + 142, 6)
      ctx.restore()
    }
    embers(B, 30, 0.5)
    card(B, of('card')[2], 42, H * 0.2 + 60)
    flash(of('bar').reduce((s, e) => s + hit(B, e.beat, 0.12) * 0.25, 0))
    grade(B, 0.65)
    flash(1 - outCubic(inv(34, 34.2, B)), '255,255,255')
  }

  const NAME: Record<PieceKind, string> = { king: '帥', advisor: '仕', elephant: '相', rook: '俥', horse: '傌', cannon: '炮', pawn: '兵' }
  const EN: Record<PieceKind, string> = { king: 'GENERAL', advisor: 'ADVISOR', elephant: 'ELEPHANT', rook: 'CHARIOT', horse: 'HORSE', cannon: 'CANNON', pawn: 'SOLDIER' }

  function horseTargets(i: number) {
    const f = i % 9, r = Math.floor(i / 9)
    const out: number[] = []
    for (const [df, dr] of [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]) {
      const nf = f + df, nr = r + dr
      if (nf >= 0 && nf < 9 && nr >= 0 && nr < 10) out.push(sq(nf, nr))
    }
    return out
  }

  function teachShot(B: number) {
    resetBoard(B, { army: false, lesson: true })
    moodDay()
    const hops = of('hop').map((e) => e.beat)
    const S0 = sq(4, 3), S1 = sq(5, 5), S2 = sq(6, 7)
    lesson.pawnA.root.position.copy(squareToWorld(S1))
    lesson.pawnB.root.position.copy(squareToWorld(S2))
    lesson.pawnA.root.scale.setScalar(1)
    lesson.pawnB.root.scale.setScalar(1)
    const hopTo = (v: PieceView, a: number, b: number, t: number) => {
      const k = inOutCubic(clamp(t / 0.6))
      v.root.position.copy(squareToWorld(a)).lerp(squareToWorld(b), k)
      v.root.position.y = Math.sin(k * Math.PI) * 0.9
    }
    let cur = S0
    lesson.horse.root.position.copy(squareToWorld(S0))
    if (B >= hops[0]) {
      hopTo(lesson.horse, S0, S1, B - hops[0])
      cur = S1
      const t = B - hops[0] - 0.5
      if (t > 0) {
        lesson.pawnA.root.scale.setScalar(Math.max(0.001, 1 - t * 2))
        lesson.pawnA.root.rotation.y = t * 12
        lesson.pawnA.root.position.y = Math.sin(clamp(t * 2) * Math.PI) * 0.4
      }
    }
    if (B >= hops[1]) {
      hopTo(lesson.horse, S1, S2, B - hops[1])
      cur = S2
      const t = B - hops[1] - 0.5
      if (t > 0) {
        lesson.pawnB.root.scale.setScalar(Math.max(0.001, 1 - t * 2))
        lesson.pawnB.root.rotation.y = t * 12
        lesson.pawnB.root.position.y = Math.sin(clamp(t * 2) * Math.PI) * 0.4
      }
    }
    lesson.pawnA.root.visible = B < hops[0] + 1
    lesson.pawnB.root.visible = B < hops[1] + 1
    idle(lesson.horse, B, 0)
    const moving = hops.some((h) => B >= h && B < h + 0.6)
    if (!moving) {
      const targets = horseTargets(cur).map((s) => ({ square: s, capture: (s === S1 && B < hops[0]) || (s === S2 && B < hops[1] && B >= hops[0]) }))
      board.showMarkers(cur, targets)
    }
    const k = inOutCubic(inv(42, 50, B))
    const c = squareToWorld(cur)
    setCam(V(lerp(3.5, 1.5, k), lerp(9.5, 7.5, k), lerp(7.5, 6.0, k)), V(lerp(0.5, 1.2, k), 0, lerp(0.4, -1.4, k)), 34)
    void c
    render3D(boardScene)
    // guide panel
    const a = outCubic(inv(42.2, 42.8, B)) * (1 - inv(49.6, 50, B))
    ctx.save()
    ctx.globalAlpha = a
    const px = 90 + (1 - a) * -60, py = 90
    ctx.fillStyle = 'rgba(20,16,12,0.72)'
    ctx.beginPath()
    ctx.roundRect(px, py, 420, 190, 22)
    ctx.fill()
    ctx.strokeStyle = 'rgba(244,196,90,0.7)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(px + 90, py + 95, 58, 0, TAU)
    ctx.fillStyle = '#fff6e2'
    ctx.fill()
    ctx.lineWidth = 8
    ctx.strokeStyle = '#c8281e'
    ctx.stroke()
    ctx.fillStyle = '#c8281e'
    ctx.font = `900 72px ${SERIF}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('傌', px + 90, py + 98)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#fff1d6'
    ctx.font = `800 46px ${SANS}`
    ctx.fillText('走「日」字', px + 175, py + 75)
    ctx.font = `500 26px ${SANS}`
    ctx.fillStyle = 'rgba(255,241,214,0.8)'
    ctx.fillText('亮點 = 可以走的格子', px + 175, py + 128)
    ctx.restore()
    card(B, of('card')[3], 50)
    grade(B, 0.45)
    flash(1 - outCubic(inv(42, 42.2, B)), '255,255,255')
  }

  function checkShot(B: number) {
    resetBoard(B, { army: false, mate: true })
    moodDusk(0.9)
    const KING = sq(4, 9)
    mate.king.root.position.copy(squareToWorld(KING))
    mate.advL.root.position.copy(squareToWorld(sq(3, 9)))
    mate.advR.root.position.copy(squareToWorld(sq(5, 9)))
    const rFrom = squareToWorld(sq(4, 3)), rTo = squareToWorld(sq(4, 7))
    const k = inCubic(inv(50, 51.6, B))
    mate.rook.root.position.copy(rFrom).lerp(rTo, k)
    mate.rook.root.position.y = B < 51.6 ? Math.abs(Math.sin(B * 14)) * 0.04 : 0
    for (const [i, v] of Object.values(mate).entries()) idle(v, B, i)
    const mateB = of('checkmate')[0].beat
    // king trembles after the hit
    mate.king.root.rotation.z = B > mateB ? Math.sin(B * 60) * 0.05 * hit(B, mateB, 1.5) : 0
    const zoom = B < mateB ? lerp(30, 24, inCubic(inv(50, mateB, B))) : lerp(26, 22, inv(mateB, 54, B))
    const shakeAmt = B < mateB ? inv(50.5, 51.5, B) * 0.03 : hit(B, mateB, 0.8) * 0.12
    setCam(V(0.9, 0.55, -2.4), V(0, 0.45, -4.3), zoom, shakeAmt, B)
    render3D(boardScene, 'saturate(0.75) contrast(1.15)')
    if (B < mateB) {
      haze(0.2)
      embers(B, 60, 0.8)
      speedLines(W / 2, H / 2, inv(50.5, 51.5, B) * 0.45, 'rgba(255,255,255,1)', 41)
      grade(B, 0.8)
      if (B >= 51.5) {
        ctx.fillStyle = '#000'
        ctx.fillRect(0, 0, W, H)
      }
      flash(1 - outCubic(inv(50, 50.2, B)), '255,255,255')
      return
    }
    // black & white impact frame
    tctx.filter = 'grayscale(1) contrast(4) brightness(1.15)'
    tctx.drawImage(canvas, 0, 0)
    tctx.filter = 'none'
    ctx.drawImage(tmp, 0, 0)
    const kp = project(squareToWorld(KING).add(V(0, 0.5, 0)))
    speedLines(kp.x, kp.y, 0.75 + 0.25 * hit(B, mateB, 0.4), 'rgba(0,0,0,1)', 51, true)
    // stamp
    const t = B - mateB
    const s = lerp(2.4, 1, outExpo(inv(0, 0.25, t))) * lerp(1, 1.06, inv(0.25, 2, t))
    ctx.save()
    ctx.translate(W * 0.5, H * 0.5)
    ctx.rotate(-0.08)
    ctx.scale(s, s)
    ctx.font = `900 260px ${SERIF}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 34
    ctx.strokeStyle = '#000'
    ctx.strokeText('將軍！', 0, 0)
    ctx.lineWidth = 14
    ctx.strokeStyle = '#fff'
    ctx.strokeText('將軍！', 0, 0)
    ctx.fillStyle = '#e0261c'
    ctx.fillText('將軍！', 0, 0)
    ctx.restore()
    ctx.font = `600 30px ${COND}`
    ctx.fillStyle = '#000'
    ctx.globalAlpha = inv(52.4, 52.8, B)
    spacedText('CHECKMATE', W / 2, H * 0.72, 18)
    ctx.globalAlpha = 1
    flash(hit(B, mateB, 0.1))
    grade(B, 0.5)
    ctx.fillStyle = `rgba(0,0,0,${inCubic(inv(53.7, 54, B))})`
    ctx.fillRect(0, 0, W, H)
  }

  function logoShot(B: number) {
    const t = B - 54
    ctx.fillStyle = '#060507'
    ctx.fillRect(0, 0, W, H)
    // god rays
    ctx.save()
    ctx.translate(W / 2, H * 0.42)
    ctx.rotate(B * 0.05)
    ctx.globalCompositeOperation = 'lighter'
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU
      ctx.rotate(TAU / 16)
      const g = ctx.createLinearGradient(0, 0, 1200, 0)
      g.addColorStop(0, `rgba(255,120,50,${0.12 * outCubic(inv(0, 1, t))})`)
      g.addColorStop(1, 'rgba(255,80,30,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(1200, -60 - hash(i) * 60)
      ctx.lineTo(1200, 60 + hash(i + 2) * 60)
      ctx.fill()
      void a
    }
    ctx.restore()
    const glow = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, 700)
    glow.addColorStop(0, `rgba(200,40,30,${0.55 * outCubic(inv(0, 0.6, t))})`)
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, W, H)
    embers(B, 80, 0.9)
    // title
    const s = lerp(1.35, 1, outExpo(inv(0, 0.5, t))) * lerp(1, 1.04, inv(0.5, 6, t))
    const iw = 1100 * 1.05, ih = 335 * 1.05
    ctx.save()
    ctx.globalAlpha = outCubic(inv(0, 0.25, t))
    ctx.translate(W / 2, H * 0.42)
    ctx.scale(s, s)
    ctx.shadowColor = 'rgba(255,90,40,0.6)'
    ctx.shadowBlur = 60
    ctx.drawImage(titleImg, -iw / 2, -ih / 2, iw, ih)
    ctx.restore()
    // shine sweep across the logo
    const sw = inv(0.4, 1.6, t)
    if (sw > 0 && sw < 1) {
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      const x = lerp(W / 2 - 700, W / 2 + 700, sw)
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
    spacedText(tag.text, W / 2, H * 0.76, lerp(80, 40, ta))
    ctx.shadowBlur = 0
    ctx.globalAlpha = ta * inv(55.6, 56.2, B)
    ctx.font = `500 32px ${SANS}`
    ctx.fillStyle = 'rgba(255,241,214,0.75)'
    spacedText('親子對弈的 3D 象棋　雙人・電腦・教學', W / 2, H * 0.85, 6)
    ctx.restore()
    flash(hit(B, 54, 0.2) * 0.9, '255,220,190')
    grade(B, 0.7)
    ctx.fillStyle = `rgba(0,0,0,${inCubic(inv(58.8, 60, B))})`
    ctx.fillRect(0, 0, W, H)
  }

  // ════════════════════════════════════════════════════════
  function drawFrame(B: number) {
    ctx.save()
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)
    const shot = shotAt(B)
    switch (shot.name) {
      case 'coldopen': coldOpen(B); break
      case 'flip': flipShot(B); break
      case 'lineup': lineupShot(B); break
      case 'battle': battleShot(B); break
      case 'levels': levelsShot(B); break
      case 'teach': teachShot(B); break
      case 'check': checkShot(B); break
      case 'logo': logoShot(B); break
    }
    if (B >= 8 && B < 54) bug(1)
    ctx.restore()
  }

  return { drawFrame, beatAt, frames: FRAMES }
}
