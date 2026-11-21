import * as THREE from 'three'
import { toonVertexMaterial, withoutOutline } from './toon'

/** Board footprint (grass slab half-sizes) and the river that crosses it along x. */
const BOARD_X = 4.95
const BOARD_Z = 5.45
const RIVER_Y = -0.12

const SIZE = 110
const SEGMENTS = 176

/** Fog of war: everything fades to this colour by distance from the board centre. */
export const FOG_COLOR = 0x07080c
const FOG_START = 15
const FOG_END = 33

// ---------- noise ----------

function hash(x: number, z: number): number {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function valueNoise(x: number, z: number): number {
  const xi = Math.floor(x)
  const zi = Math.floor(z)
  const xf = x - xi
  const zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = zf * zf * (3 - 2 * zf)
  const a = hash(xi, zi)
  const b = hash(xi + 1, zi)
  const c = hash(xi, zi + 1)
  const d = hash(xi + 1, zi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

function fbm(x: number, z: number, octaves = 4): number {
  let sum = 0
  let amp = 0.5
  let f = 1
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * f, z * f) * amp
    f *= 2.03
    amp *= 0.5
  }
  return sum / 0.9375
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Centre line of the river canyon: straight across the board, meandering further out. */
function canyonZ(x: number): number {
  const out = Math.max(0, Math.abs(x) - BOARD_X)
  return Math.sin(x * 0.17 + (x > 0 ? 0.6 : 2.1)) * 2.2 * smooth(0, 9, out)
}

function canyonHalfWidth(x: number): number {
  const out = Math.max(0, Math.abs(x) - BOARD_X)
  return 0.42 + out * 0.035
}

/**
 * Height field: a flat apron around the board, slopes and rolling hills beyond it,
 * mountains in the distance, and a steep-walled canyon carrying the river away on both sides.
 */
export function terrainHeight(x: number, z: number): number {
  const dx = Math.max(0, Math.abs(x) - BOARD_X)
  const dz = Math.max(0, Math.abs(z) - BOARD_Z)
  const d = Math.hypot(dx, dz)

  // the first ~3 units stay low so cutscene cameras just off the board are not buried in a hill
  const hills = smooth(2, 9, d) * (1 + 5 * fbm(x * 0.075 + 3.1, z * 0.075 - 1.7))
  const mountains = smooth(12, 30, d) * Math.pow(fbm(x * 0.045 - 8, z * 0.045 + 5, 5), 1.6) * 11
  let h = -0.02 + hills + mountains

  // canyon: flat floor below the water, steep walls up to whatever the hills reached
  const out = Math.max(0, Math.abs(x) - BOARD_X + 0.4)
  if (out > 0) {
    const w = canyonHalfWidth(x)
    const off = Math.abs(z - canyonZ(x))
    const wall = smooth(w, w + 0.9 + out * 0.02, off)
    const floor = RIVER_Y - 0.35
    // cliffs: lift the rim a little so the canyon reads even where the hills are low
    const rim = (1 - smooth(w + 0.9, w + 3.2, off)) * smooth(2, 10, out) * 1.4
    h = floor + (h + rim - floor) * wall
  }
  return h
}

// ---------- colours ----------

const GRASS = new THREE.Color(0x8fd16a)
const MEADOW = new THREE.Color(0x6fbf4e)
const FOREST = new THREE.Color(0x4f9a45)
const ROCK = new THREE.Color(0xa8744a)
const CLIFF = new THREE.Color(0x8d6748)
const SAND = new THREE.Color(0xe2c98f)
const PEAK = new THREE.Color(0xd9d4c7)

function colourFor(h: number, slope: number, nearRiver: boolean): THREE.Color {
  const c = new THREE.Color()
  if (nearRiver && h < RIVER_Y + 0.25) return c.copy(SAND)
  c.copy(GRASS).lerp(MEADOW, smooth(0.2, 1.6, h)).lerp(FOREST, smooth(1.8, 4, h))
  c.lerp(PEAK, smooth(6.5, 9.5, h))
  // steep faces turn to earth and rock
  c.lerp(ROCK, smooth(0.32, 0.5, slope)).lerp(CLIFF, smooth(0.55, 0.8, slope))
  return c
}

// ---------- fog-of-war shader patch ----------

function withFogOfWar<T extends THREE.Material>(material: T): T {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFogColor = { value: new THREE.Color(FOG_COLOR) }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vFowWorld;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvFowWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vFowWorld;\nuniform vec3 uFogColor;')
      .replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        float fow = smoothstep(${FOG_START.toFixed(1)}, ${FOG_END.toFixed(1)}, length(vFowWorld.xz));
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uFogColor, fow);`,
      )
  }
  return material
}

// ---------- pieces of the landscape ----------

function buildGround(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    // tuck the ground under the board slab so the slab's edges sit on it
    const under = Math.abs(x) < BOARD_X - 0.05 && Math.abs(z) < BOARD_Z - 0.05
    pos.setY(i, under ? -0.4 : terrainHeight(x, z))
  }
  geo.computeVertexNormals()
  const nrm = geo.attributes.normal as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const slope = 1 - nrm.getY(i)
    const nearRiver = Math.abs(x) > BOARD_X - 0.6 && Math.abs(z - canyonZ(x)) < canyonHalfWidth(x) + 0.5
    const c = colourFor(pos.getY(i), slope, nearRiver)
    // a little per-vertex variation so wide slopes are not flat paint
    const jitter = 0.94 + hash(x * 3.1, z * 2.7) * 0.1
    colors.set([c.r * jitter, c.g * jitter, c.b * jitter], i * 3)
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const ground = new THREE.Mesh(geo, withFogOfWar(withoutOutline(toonVertexMaterial())))
  ground.receiveShadow = true
  return ground
}

/** Water ribbons following the canyon out of both sides of the board. */
function buildRiver(material: THREE.Material): THREE.Mesh {
  const positions: number[] = []
  const indices: number[] = []
  const steps = 90
  for (const side of [-1, 1]) {
    const base = positions.length / 3
    for (let i = 0; i <= steps; i++) {
      const x = side * (BOARD_X - 0.3 + (i / steps) * (SIZE / 2 - BOARD_X))
      const zc = canyonZ(x)
      const w = canyonHalfWidth(x) + 0.25
      positions.push(x, RIVER_Y, zc - w, x, RIVER_Y, zc + w)
      if (i < steps) {
        const a = base + i * 2
        if (side > 0) indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
        else indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
      }
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  const river = new THREE.Mesh(geo, material)
  river.receiveShadow = true
  return river
}

/** Little cone trees and boulders scattered over the hills (instanced, a few draw calls). */
function buildScatter(): THREE.Group {
  const group = new THREE.Group()
  const spots: { x: number; z: number; h: number; s: number }[] = []
  const rocks: { x: number; z: number; h: number; s: number }[] = []
  let seed = 11
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  for (let tries = 0; tries < 1400 && spots.length < 140; tries++) {
    const a = rnd() * Math.PI * 2
    const r = 7 + rnd() * 20
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    if (Math.abs(x) < BOARD_X + 1.5 && Math.abs(z) < BOARD_Z + 1.5) continue
    if (Math.abs(x) > BOARD_X - 1 && Math.abs(z - canyonZ(x)) < canyonHalfWidth(x) + 1.3) continue
    const h = terrainHeight(x, z)
    const e = 0.25
    const slope = Math.hypot(terrainHeight(x + e, z) - terrainHeight(x - e, z), terrainHeight(x, z + e) - terrainHeight(x, z - e)) / (2 * e)
    if (slope > 0.9 || h > 7) {
      // far boulders silhouette against the dark horizon and look like they float
      if (rocks.length < 40 && r < 19 && h < 6) rocks.push({ x, z, h, s: 0.4 + rnd() * 0.6 })
      continue
    }
    if (fbm(x * 0.2, z * 0.2, 2) < 0.45) continue
    spots.push({ x, z, h, s: 0.45 + rnd() * 0.4 })
  }

  const matrix = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const leafMat = withFogOfWar(withoutOutline(toonVertexMaterial(0x3f8f45)))
  const trunkMat = withFogOfWar(withoutOutline(toonVertexMaterial(0x7a5236)))
  const rockMat = withFogOfWar(withoutOutline(toonVertexMaterial(0x9a8f84)))
  const leaves = new THREE.InstancedMesh(new THREE.ConeGeometry(0.45, 1.3, 7), leafMat, spots.length)
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.08, 0.1, 0.4, 6), trunkMat, spots.length)
  spots.forEach((p, i) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.x * 3.1)
    matrix.compose(new THREE.Vector3(p.x, p.h + 0.85 * p.s, p.z), q, new THREE.Vector3(p.s, p.s, p.s))
    leaves.setMatrixAt(i, matrix)
    matrix.compose(new THREE.Vector3(p.x, p.h + 0.15 * p.s, p.z), q, new THREE.Vector3(p.s, p.s, p.s))
    trunks.setMatrixAt(i, matrix)
  })
  const boulders = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.5, 0), rockMat, rocks.length)
  rocks.forEach((p, i) => {
    q.setFromEuler(new THREE.Euler(p.x, p.z, 0))
    matrix.compose(new THREE.Vector3(p.x, p.h + 0.1, p.z), q, new THREE.Vector3(p.s * 1.3, p.s, p.s * 1.1))
    boulders.setMatrixAt(i, matrix)
  })
  for (const m of [leaves, trunks, boulders]) m.castShadow = m.receiveShadow = false
  group.add(leaves, trunks, boulders)
  return group
}

/** Sky dome whose horizon sinks into the fog-of-war colour. */
function buildSky(): THREE.Mesh {
  const mat = withoutOutline(
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uSky: { value: new THREE.Color(0xbfe6ff) },
        uZenith: { value: new THREE.Color(0x8ccbf5) },
        uFog: { value: new THREE.Color(FOG_COLOR) },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uSky, uZenith, uFog;
        varying vec3 vDir;
        void main() {
          vec3 sky = mix(uSky, uZenith, smoothstep(0.35, 0.9, vDir.y));
          gl_FragColor = vec4(mix(uFog, sky, smoothstep(0.02, 0.32, vDir.y)), 1.0);
          #include <colorspace_fragment>
        }
      `,
    }),
  )
  const sky = new THREE.Mesh(new THREE.SphereGeometry(95, 32, 16), mat)
  sky.renderOrder = -1
  sky.frustumCulled = false
  return sky
}

/** Slowly churning dark mist standing at the edge of the explored land. */
function buildFogWall(): THREE.Mesh {
  const mat = withoutOutline(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(FOG_COLOR) } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform vec3 uColor;
        varying vec2 vUv;
        float wave(vec2 p) {
          return sin(p.x * 23.0 + uTime * 0.35) * 0.5 + sin(p.x * 41.0 - uTime * 0.22 + p.y * 3.0) * 0.3
            + sin(p.x * 67.0 + uTime * 0.5 - p.y * 5.0) * 0.2;
        }
        void main() {
          float billow = 0.5 + 0.5 * wave(vUv);
          float top = 0.55 + 0.3 * billow;
          float a = (1.0 - smoothstep(top - 0.35, top, vUv.y)) * 0.92;
          gl_FragColor = vec4(uColor * (0.8 + 0.4 * billow), a);
          #include <colorspace_fragment>
        }
      `,
    }),
  )
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, 14, 96, 1, true), mat)
  wall.position.y = 3
  return wall
}

/** Everything outside the board: hills, canyon river, scattered trees, sky and the fog of war. */
export class Terrain {
  readonly root = new THREE.Group()
  private readonly fogWall: THREE.Mesh

  constructor(waterMaterial: THREE.Material) {
    this.fogWall = buildFogWall()
    this.root.add(buildSky(), buildGround(), buildRiver(withFogOfWar(waterMaterial.clone())), buildScatter(), this.fogWall)
  }

  tick(t: number): void {
    ;(this.fogWall.material as THREE.ShaderMaterial).uniforms.uTime.value = t
  }
}
