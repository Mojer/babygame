import type * as THREE from 'three'
import type { SceneVfx } from './vfx-asset'

type Vec = THREE.Vector3 | [number, number, number]

/** Trail that follows a weapon object; animate the weapon, then call update(). */
export interface WeaponSmearVfx extends SceneVfx {
  attachWeapon(weapon: THREE.Object3D, blade: { base: Vec; tip: Vec }): void
  detachWeapon(): void
}

export const defaultOptions: Record<string, unknown>
export default function createVFX(options?: Record<string, unknown>): WeaponSmearVfx
