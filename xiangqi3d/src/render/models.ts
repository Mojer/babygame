import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { PieceKind } from '../rules/position'

/** Material names in pieces.glb are colour roles (see tools/blender/build_pieces.py). */
export type Role =
  | 'main' | 'trim' | 'plume' | 'skin' | 'hair' | 'dark' | 'wood' | 'metal' | 'grey'
  | 'coat' | 'snout' | 'pink' | 'white' | 'gem' | 'fuse' | 'cheek' | 'eyehi'

export interface ModelPart {
  geometry: THREE.BufferGeometry
  role: Role
}

const templates = new Map<PieceKind, ModelPart[]>()

/** Parts for a piece kind, or null when the GLB has not loaded (callers fall back to primitives). */
export function modelParts(kind: PieceKind): ModelPart[] | null {
  return templates.get(kind) ?? null
}

export async function loadPieceModels(url = `${import.meta.env.BASE_URL}models/pieces.glb`): Promise<boolean> {
  try {
    const gltf = await new GLTFLoader().loadAsync(url)
    gltf.scene.updateMatrixWorld(true)
    gltf.scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      // a multi-material Blender mesh arrives as a group of meshes, one per primitive
      let kindNode: THREE.Object3D = mesh
      while (kindNode.parent && kindNode.parent !== gltf.scene) kindNode = kindNode.parent
      const kind = kindNode.name as PieceKind
      const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld)
      const role = (mesh.material as THREE.Material).name as Role
      const list = templates.get(kind) ?? []
      list.push({ geometry, role })
      templates.set(kind, list)
    })
    return templates.size === 7
  } catch (err) {
    console.warn('pieces.glb failed to load, using built-in figures', err)
    templates.clear()
    return false
  }
}
