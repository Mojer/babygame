import * as THREE from 'three'

const gradient = (() => {
  const tex = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  tex.needsUpdate = true
  return tex
})()

const cache = new Map<number, THREE.MeshToonMaterial>()

export function toon(color: number): THREE.MeshToonMaterial {
  let m = cache.get(color)
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: gradient })
    cache.set(color, m)
  }
  return m
}

export const NO_OUTLINE = { visible: false }

export function withoutOutline<T extends THREE.Material>(material: T): T {
  material.userData.outlineParameters = NO_OUTLINE
  return material
}

export function mesh(geometry: THREE.BufferGeometry, color: number | THREE.Material): THREE.Mesh {
  const m = new THREE.Mesh(geometry, typeof color === 'number' ? toon(color) : color)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

/**
 * A fresh (uncached) toon material, so callers may patch it with onBeforeCompile.
 * Without a colour it reads per-vertex colours from the geometry.
 */
export function toonVertexMaterial(color?: number): THREE.MeshToonMaterial {
  return color === undefined
    ? new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: gradient })
    : new THREE.MeshToonMaterial({ color, gradientMap: gradient })
}
