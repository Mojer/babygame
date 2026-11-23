import * as THREE from 'three'
import { toon, withoutOutline } from './toon'

/** Empty space around the floating board. */
export const BACKDROP = 0x040405

export const HALF_X = 4.95
export const HALF_Z = 5.45
export const RIVER_HALF = 0.32
const DEPTH = 4.4
export const WATER_TOP = -0.1
const BED = -0.5
const TOP_PX = 120
const CLIFF_W = 512
const CLIFF_H = 1024
const CLIFF_TILE = (CLIFF_W / CLIFF_H) * DEPTH

function rng(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  draw(canvas.getContext('2d')!)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.flipY = false
  tex.anisotropy = 8
  return tex
}

function blob(ctx: CanvasRenderingContext2D, rnd: () => number, cx: number, cy: number, r: number, wobble = 0.35): void {
  const n = 14
  ctx.beginPath()
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    const rr = r * (1 - wobble / 2 + rnd() * wobble)
    const x = cx + Math.cos(a) * rr
    const y = cy + Math.sin(a) * rr * 0.85
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

const PEBBLES = ['#a7997f', '#d9cca9', '#8e8270', '#bdae8f', '#cfc3a5', '#9b8d78']

function pebbles(ctx: CanvasRenderingContext2D, rnd: () => number, cx: number, cy: number, r: number, count: number): void {
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2
    const d = Math.sqrt(rnd()) * r
    const x = cx + Math.cos(a) * d
    const y = cy + Math.sin(a) * d * 0.85
    const s = 2 + rnd() * 4.5
    ctx.fillStyle = 'rgba(70,55,40,0.35)'
    ctx.beginPath()
    ctx.ellipse(x + 1, y + 1.5, s, s * 0.75, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = PEBBLES[Math.floor(rnd() * PEBBLES.length)]
    ctx.beginPath()
    ctx.ellipse(x, y, s, s * 0.75, rnd() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
}

function grassBlades(ctx: CanvasRenderingContext2D, rnd: () => number, w: number, h: number, count: number): void {
  const tones = ['rgba(86,152,62,0.55)', 'rgba(170,224,122,0.5)', 'rgba(104,170,72,0.5)']
  ctx.lineWidth = 1.6
  ctx.lineCap = 'round'
  for (let i = 0; i < count; i++) {
    const x = rnd() * w
    const y = rnd() * h
    const len = 3 + rnd() * 5
    const lean = (rnd() - 0.5) * 3
    ctx.strokeStyle = tones[i % tones.length]
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + lean, y - len)
    ctx.stroke()
  }
}

/**
 * Grass for one bank of the board, with gravel in the margins and a pebbly strip
 * along the river. `zMin`..`zMax` is the bank's extent; canvas rows follow +z.
 */
function grassTexture(zMin: number, zMax: number, seed: number): THREE.CanvasTexture {
  const w = Math.round(HALF_X * 2 * TOP_PX)
  const h = Math.round((zMax - zMin) * TOP_PX)
  const toPx = (x: number, z: number): [number, number] => [(x + HALF_X) * TOP_PX, (z - zMin) * TOP_PX]
  const riverZ = Math.abs(zMin) < Math.abs(zMax) ? zMin : zMax
  const outerZ = riverZ === zMin ? zMax : zMin

  return canvasTexture(w, h, (ctx) => {
    const rnd = rng(seed)
    ctx.fillStyle = '#88c960'
    ctx.fillRect(0, 0, w, h)
    const mottle = ['#7cbf56', '#94d36a', '#8acb61', '#77b650', '#9cd872', '#83c45b']
    for (let i = 0; i < 2600; i++) {
      ctx.globalAlpha = 0.25 + rnd() * 0.25
      ctx.fillStyle = mottle[i % mottle.length]
      blob(ctx, rnd, rnd() * w, rnd() * h, 6 + rnd() * 22, 0.5)
    }
    ctx.globalAlpha = 1

    // worn earth showing through here and there
    for (let i = 0; i < 9; i++) {
      ctx.globalAlpha = 0.16
      ctx.fillStyle = '#b39463'
      blob(ctx, rnd, rnd() * w, rnd() * h, 25 + rnd() * 45, 0.6)
    }
    ctx.globalAlpha = 1

    // gravel patches hugging the outer margin
    const patches: [number, number, number][] = []
    for (let tries = 0; patches.length < 16 && tries < 400; tries++) {
      const x = (rnd() * 2 - 1) * HALF_X
      const z = zMin + rnd() * (zMax - zMin)
      const edge = Math.min(HALF_X - Math.abs(x), Math.abs(outerZ - z))
      if (edge > 0.55 || Math.abs(z - riverZ) < 0.6) continue
      patches.push([x, z, 0.16 + rnd() * 0.3])
    }
    for (const [x, z, r] of patches) {
      const [px, py] = toPx(x, z)
      ctx.fillStyle = '#c6b088'
      blob(ctx, rnd, px, py, r * TOP_PX)
      ctx.fillStyle = '#b39c74'
      blob(ctx, rnd, px + 3, py + 4, r * TOP_PX * 0.7)
      pebbles(ctx, rnd, px, py, r * TOP_PX * 0.9, Math.round(r * 160))
    }

    // pebble bank along the river
    const bankPx = (riverZ - zMin) * TOP_PX
    const dir = riverZ === zMin ? 1 : -1
    for (let x = -20; x < w + 20; x += 14) {
      const reach = 10 + rnd() * 16
      ctx.fillStyle = '#cdb98f'
      blob(ctx, rnd, x, bankPx + dir * reach * 0.4, reach, 0.5)
    }
    for (let x = 0; x < w; x += 40) pebbles(ctx, rnd, x + rnd() * 30, bankPx + dir * 9, 14, 9)

    grassBlades(ctx, rnd, w, h, 9000)

    // soft darker rim so the edge reads before the cliff drops away
    const rim = ctx.createLinearGradient(0, 0, 0, h)
    const near = dir > 0 ? 1 : 0
    rim.addColorStop(near, 'rgba(40,70,20,0.22)')
    rim.addColorStop(near === 1 ? 0.92 : 0.08, 'rgba(40,70,20,0)')
    ctx.fillStyle = rim
    ctx.fillRect(0, 0, w, h)
    for (const side of [0, 1]) {
      const g = ctx.createLinearGradient(side ? w : 0, 0, side ? w - 30 : 30, 0)
      g.addColorStop(0, 'rgba(40,70,20,0.22)')
      g.addColorStop(1, 'rgba(40,70,20,0)')
      ctx.fillStyle = g
      ctx.fillRect(side ? w - 30 : 0, 0, 30, h)
    }
  })
}

/** Layers from the grass line down: sediment bands alternate with rows of chunky stones. */
const LAYERS: { kind: 'sediment' | 'stones'; h: number; color: string }[] = [
  { kind: 'stones', h: 120, color: '#b8916a' },
  { kind: 'sediment', h: 40, color: '#8d6a4c' },
  { kind: 'stones', h: 150, color: '#c9a77c' },
  { kind: 'sediment', h: 28, color: '#a07b58' },
  { kind: 'sediment', h: 46, color: '#7f6049' },
  { kind: 'stones', h: 135, color: '#a78562' },
  { kind: 'sediment', h: 36, color: '#93715a' },
  { kind: 'stones', h: 160, color: '#8d7360' },
]

function rock(ctx: CanvasRenderingContext2D, rnd: () => number, x: number, y: number, w: number, h: number, color: string): void {
  const pts: [number, number][] = []
  const n = 9
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const k = 0.82 + rnd() * 0.18
    pts.push([x + w / 2 + (Math.cos(a) * w * k) / 2, y + h / 2 + (Math.sin(a) * h * k) / 2])
  }
  const path = () => {
    ctx.beginPath()
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
    ctx.closePath()
  }
  ctx.save()
  path()
  ctx.fillStyle = color
  ctx.fill()
  ctx.clip()
  // lit upper face and shadowed underside give each stone some bulk
  ctx.fillStyle = 'rgba(255,238,205,0.28)'
  ctx.fillRect(x, y, w, h * 0.32)
  ctx.fillStyle = 'rgba(35,20,10,0.32)'
  ctx.fillRect(x, y + h * 0.72, w, h * 0.3)
  if (rnd() < 0.5) {
    ctx.strokeStyle = 'rgba(40,24,14,0.45)'
    ctx.lineWidth = 2
    ctx.beginPath()
    const cx = x + w * (0.3 + rnd() * 0.4)
    ctx.moveTo(cx, y + h * 0.15)
    ctx.lineTo(cx + (rnd() - 0.5) * 14, y + h * 0.5)
    ctx.lineTo(cx + (rnd() - 0.5) * 20, y + h * 0.8)
    ctx.stroke()
  }
  ctx.restore()
  path()
  ctx.strokeStyle = 'rgba(45,28,16,0.85)'
  ctx.lineWidth = 3
  ctx.stroke()
}

function shade(hex: string, k: number): string {
  const c = new THREE.Color(hex).multiplyScalar(k)
  return `#${c.getHexString()}`
}

/** Layered cliff face: hanging grass, topsoil, then strata of rock fading into the dark below. */
function cliffTexture(): THREE.CanvasTexture {
  const w = CLIFF_W
  const h = CLIFF_H
  return canvasTexture(w, h, (ctx) => {
    const rnd = rng(42)
    const soilTop = 30
    const rockTop = 120

    ctx.fillStyle = '#6a4630'
    ctx.fillRect(0, 0, w, rockTop)
    for (let i = 0; i < 320; i++) {
      ctx.fillStyle = rnd() < 0.5 ? 'rgba(135,95,64,0.6)' : 'rgba(55,34,22,0.5)'
      ctx.beginPath()
      ctx.arc(rnd() * w, soilTop + rnd() * (rockTop - soilTop), 1.5 + rnd() * 3.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.strokeStyle = 'rgba(160,118,76,0.55)'
    ctx.lineWidth = 2
    for (let i = 0; i < 16; i++) {
      let x = rnd() * w
      let y = soilTop + 4
      ctx.beginPath()
      ctx.moveTo(x, y)
      for (let k = 0; k < 6; k++) {
        x += (rnd() - 0.5) * 14
        y += 6 + rnd() * 10
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    let y = rockTop
    let i = 0
    while (y < h) {
      const layer = LAYERS[i % LAYERS.length]
      const lh = layer.h * (0.85 + rnd() * 0.3)
      if (layer.kind === 'sediment') {
        ctx.fillStyle = layer.color
        ctx.fillRect(0, y, w, lh)
        for (let k = 0; k < 5; k++) {
          ctx.fillStyle = k % 2 ? 'rgba(255,230,190,0.12)' : 'rgba(40,24,14,0.18)'
          ctx.fillRect(0, y + rnd() * lh, w, 2 + rnd() * 3)
        }
        ctx.fillStyle = 'rgba(40,24,14,0.5)'
        ctx.fillRect(0, y, w, 3)
      } else {
        ctx.fillStyle = shade(layer.color, 0.45)
        ctx.fillRect(0, y, w, lh)
        let x = -rnd() * 60
        while (x < w) {
          const bw = 70 + rnd() * 120
          const tone = shade(layer.color, 0.88 + rnd() * 0.24)
          const top = y + 3 + rnd() * 6
          const bh = lh - 6 - rnd() * 10
          // same seed for each wrapped copy so the stone matches across the texture seam
          const seed = Math.floor(rnd() * 1e9)
          for (const dx of [-w, 0, w]) rock(ctx, rng(seed), x + dx, top, bw, bh, tone)
          x += bw - 6
        }
      }
      y += lh
      i++
    }

    // grass lip hanging over the cliff edge
    ctx.fillStyle = '#5a9b40'
    ctx.fillRect(0, 0, w, soilTop)
    for (let x = -3; x < w; x += 5) {
      const len = 4 + rnd() * rnd() * 40
      ctx.beginPath()
      ctx.roundRect(x, soilTop - 4, 7, len, 3.5)
      ctx.fill()
    }
    ctx.fillStyle = '#7cc057'
    ctx.fillRect(0, 0, w, soilTop - 10)
    ctx.fillStyle = 'rgba(195,238,145,0.65)'
    ctx.fillRect(0, 0, w, 5)

    const fade = ctx.createLinearGradient(0, h * 0.4, 0, h * 0.98)
    const c = new THREE.Color(BACKDROP)
    const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)}`
    fade.addColorStop(0, `rgba(${rgb},0)`)
    fade.addColorStop(1, `rgba(${rgb},1)`)
    ctx.fillStyle = fade
    ctx.fillRect(0, 0, w, h)
  })
}

/** All cliff faces in one geometry; uv.u runs along the face, uv.v down from the grass line. */
class CliffBuilder {
  private readonly pos: number[] = []
  private readonly nrm: number[] = []
  private readonly uv: number[] = []
  private readonly idx: number[] = []

  /** A vertical face from (x0,z0) to (x1,z1) between yTop and yBot, facing `normal`. */
  face(x0: number, z0: number, x1: number, z1: number, yTop: number, yBot: number, normal: [number, number]): void {
    const dx = x1 - x0
    const dz = z1 - z0
    // triangle (top0, bot0, bot1) faces (-dz, dx); swap ends if that points inward
    if (-dz * normal[0] + dx * normal[1] < 0) {
      ;[x0, x1] = [x1, x0]
      ;[z0, z1] = [z1, z0]
    }
    const along = (x: number, z: number) => (Math.abs(normal[0]) > 0 ? z : x) / CLIFF_TILE
    const v = (y: number) => -y / DEPTH
    const base = this.pos.length / 3
    const corners: [number, number, number][] = [
      [x0, yTop, z0],
      [x0, yBot, z0],
      [x1, yBot, z1],
      [x1, yTop, z1],
    ]
    for (const [x, y, z] of corners) {
      this.pos.push(x, y, z)
      this.nrm.push(normal[0], 0, normal[1])
      this.uv.push(along(x, z), v(y))
    }
    this.idx.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3))
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nrm, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2))
    g.setIndex(this.idx)
    return g
  }
}

function topSurface(zMin: number, zMax: number, seed: number): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(HALF_X * 2, zMax - zMin)
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, 0, (zMin + zMax) / 2)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const uv = geo.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + HALF_X) / (HALF_X * 2), (pos.getZ(i) - zMin) / (zMax - zMin))
  const top = new THREE.Mesh(geo, toonMap(grassTexture(zMin, zMax, seed)))
  top.receiveShadow = true
  return top
}

function toonMap(map: THREE.Texture): THREE.MeshToonMaterial {
  const m = toon(0xffffff).clone()
  m.map = map
  return m
}

const WATER_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
  }
`

/** River surface: streaks drifting out towards both falls, foam along the banks. */
function riverMaterial(): THREE.ShaderMaterial {
  return withoutOutline(
    new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color(0x2f9bd6) },
        uShallow: { value: new THREE.Color(0x63cdf2) },
        uFoam: { value: new THREE.Color(0xeafaff) },
      },
      vertexShader: WATER_VERT,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uDeep, uShallow, uFoam;
        varying vec3 vWorld;
        void main() {
          float across = abs(vWorld.z) / ${RIVER_HALF.toFixed(3)};
          vec3 col = mix(uDeep, uShallow, smoothstep(0.35, 1.0, across));
          float flow = abs(vWorld.x) * 2.6 - uTime * 1.1 + sin(vWorld.z * 23.0 + vWorld.x * 1.7) * 0.35;
          float streak = smoothstep(0.82, 0.92, fract(flow)) * smoothstep(0.98, 0.9, fract(flow));
          col = mix(col, uFoam, streak * 0.55 * (1.0 - across * 0.4));
          float bank = smoothstep(0.78, 0.97, across + sin(vWorld.x * 9.0 + uTime * 1.5) * 0.04);
          col = mix(col, uFoam, bank * 0.75);
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }
      `,
    }),
  )
}

/** Falling sheet of water: fast streaks, a bright lip, and a fade into the dark below. */
function fallMaterial(): THREE.ShaderMaterial {
  return withoutOutline(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uWater: { value: new THREE.Color(0x58c2ee) },
        uFoam: { value: new THREE.Color(0xf2fcff) },
        uLength: { value: 1 },
      },
      vertexShader: WATER_VERT,
      fragmentShader: /* glsl */ `
        uniform float uTime, uLength;
        uniform vec3 uWater, uFoam;
        varying vec2 vUv;
        float hash(float n) { return fract(sin(n) * 43758.5453); }
        void main() {
          float lane = floor(vUv.x * 18.0);
          float speed = 2.2 + hash(lane) * 1.2;
          float s = fract(vUv.y * 1.8 - uTime * speed + hash(lane + 7.0) * 3.0);
          float streak = smoothstep(0.55, 0.75, s) * smoothstep(1.0, 0.8, s);
          float lip = 1.0 - smoothstep(0.0, 0.25, vUv.y);
          vec3 col = mix(uWater, uFoam, clamp(streak * 0.7 + lip * 0.8, 0.0, 1.0));
          float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
          float fade = 1.0 - smoothstep(uLength * 0.35, uLength * 0.95, vUv.y);
          gl_FragColor = vec4(col, (0.78 + streak * 0.2) * edge * fade);
          #include <colorspace_fragment>
        }
      `,
    }),
  )
}

/** Ribbon that rolls over the board edge at `side` (±1) and drops into the dark. */
function waterfall(side: number, material: THREE.ShaderMaterial): THREE.Mesh {
  const path: [number, number][] = []
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2)
    path.push([HALF_X - 0.06 + Math.sin(a) * 0.16, WATER_TOP - (1 - Math.cos(a)) * 0.16])
  }
  const drop = DEPTH + 1.4
  for (let i = 1; i <= 10; i++) path.push([HALF_X + 0.1 + i * 0.012, WATER_TOP - 0.16 - (i / 10) * drop])

  const lengths = [0]
  for (let i = 1; i < path.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]))
  }
  const total = lengths[lengths.length - 1]
  material.uniforms.uLength.value = total

  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const w = RIVER_HALF - 0.01
  path.forEach(([x, y], i) => {
    const spread = 1 + (lengths[i] / total) * 0.25
    pos.push(side * x, y, -w * spread, side * x, y, w * spread)
    uv.push(0, lengths[i], 1, lengths[i])
    if (i < path.length - 1) {
      const a = i * 2
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  const m = new THREE.Mesh(g, material)
  m.renderOrder = 1
  return m
}

const MAP_URL = `${import.meta.env.BASE_URL}textures/old-map.webp`
/** world size of one copy of the map; it repeats (mirrored) out to the horizon */
const MAP_W = 78
const MAP_H = 52
const MAP_Y = -6.5
const MAP_REACH = 320
/** share of each side trimmed off so the torn paper edges do not show where copies meet */
const MAP_TRIM = 0.05

/** A copy of the image squeezed to `width` pixels; drawn back up, the lost detail reads as blur. */
function softened(img: HTMLImageElement, width: number): THREE.CanvasTexture {
  const sx = img.width * MAP_TRIM
  const sy = img.height * MAP_TRIM
  const sw = img.width - sx * 2
  const sh = img.height - sy * 2
  const height = Math.round((width * sh) / sw)
  const tex = canvasTexture(width, height, (ctx) => {
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height)
  })
  tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping
  return tex
}

/**
 * An old map spread out below the board and on to the horizon. Three copies at falling
 * resolution are blended by distance from the viewer, so it gets ever softer and darker.
 */
function mapBackdrop(): THREE.Mesh {
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1)
  blank.needsUpdate = true
  const mat = withoutOutline(
    new THREE.ShaderMaterial({
      depthWrite: false,
      uniforms: {
        uNear: { value: blank as THREE.Texture },
        uMid: { value: blank as THREE.Texture },
        uFar: { value: blank as THREE.Texture },
        uShow: { value: 0 },
        uBackdrop: { value: new THREE.Color(BACKDROP) },
      },
      vertexShader: WATER_VERT,
      fragmentShader: /* glsl */ `
        uniform sampler2D uNear, uMid, uFar;
        uniform float uShow;
        uniform vec3 uBackdrop;
        varying vec3 vWorld;
        void main() {
          vec2 uv = vWorld.xz / vec2(${MAP_W.toFixed(1)}, ${MAP_H.toFixed(1)}) + 0.5;
          float dist = length(vWorld - cameraPosition);
          float soft = smoothstep(12.0, 34.0, dist);
          float softer = smoothstep(30.0, 90.0, dist);
          vec3 col = mix(texture2D(uNear, uv).rgb, texture2D(uMid, uv).rgb, soft);
          col = mix(col, texture2D(uFar, uv).rgb, softer);
          col *= 0.82 - soft * 0.17 - softer * 0.25;
          // the board's shadow pooled underneath it
          vec2 q = abs(vWorld.xz) - vec2(${HALF_X.toFixed(2)}, ${HALF_Z.toFixed(2)});
          float box = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
          col *= mix(0.2, 1.0, smoothstep(-1.0, 3.0, box));
          float horizon = smoothstep(70.0, 140.0, length(vWorld.xz));
          gl_FragColor = vec4(mix(col, uBackdrop, max(horizon, 1.0 - uShow)), 1.0);
          #include <colorspace_fragment>
        }
      `,
    }),
  )
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(MAP_REACH, MAP_REACH), mat)
  plane.rotation.x = -Math.PI / 2
  plane.position.y = MAP_Y
  plane.renderOrder = -1
  plane.frustumCulled = false
  new THREE.ImageLoader().load(MAP_URL, (img) => {
    mat.uniforms.uNear.value = softened(img, 480)
    mat.uniforms.uMid.value = softened(img, 110)
    mat.uniforms.uFar.value = softened(img, 32)
    mat.uniforms.uShow.value = 1
  })
  return plane
}

/** The board as a floating block of earth: grass banks, layered cliffs, and a river spilling off both ends. */
export class Diorama {
  readonly root = new THREE.Group()
  private readonly river = riverMaterial()
  private readonly fall = fallMaterial()

  constructor() {
    this.root.add(mapBackdrop(), topSurface(RIVER_HALF, HALF_Z, 3), topSurface(-HALF_Z, -RIVER_HALF, 9))

    const c = new CliffBuilder()
    for (const sx of [-1, 1]) {
      c.face(sx * HALF_X, RIVER_HALF, sx * HALF_X, HALF_Z, 0, -DEPTH, [sx, 0])
      c.face(sx * HALF_X, -HALF_Z, sx * HALF_X, -RIVER_HALF, 0, -DEPTH, [sx, 0])
      c.face(sx * HALF_X, -RIVER_HALF, sx * HALF_X, RIVER_HALF, BED, -DEPTH, [sx, 0])
    }
    for (const sz of [-1, 1]) {
      c.face(-HALF_X, sz * HALF_Z, HALF_X, sz * HALF_Z, 0, -DEPTH, [0, sz])
      c.face(-HALF_X, sz * RIVER_HALF, HALF_X, sz * RIVER_HALF, 0, BED, [0, -sz])
    }
    const cliffTex = cliffTexture()
    cliffTex.wrapS = THREE.RepeatWrapping
    const cliffs = new THREE.Mesh(c.build(), toonMap(cliffTex))
    this.root.add(cliffs)

    const surface = new THREE.Mesh(new THREE.PlaneGeometry(HALF_X * 2, RIVER_HALF * 2), this.river)
    surface.rotation.x = -Math.PI / 2
    surface.position.y = WATER_TOP
    this.root.add(surface, waterfall(1, this.fall), waterfall(-1, this.fall))
  }

  tick(t: number): void {
    this.river.uniforms.uTime.value = t
    this.fall.uniforms.uTime.value = t
  }
}
