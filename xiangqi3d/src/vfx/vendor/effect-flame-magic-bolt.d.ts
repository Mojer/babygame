import type * as THREE from 'three'
import type { SceneVfx } from './vfx-asset'

export interface BoltLaunchOptions {
  speed?: number
  maxRange?: number
  castDuration?: number
  impactDuration?: number
  onImpact?: ((at: THREE.Vector3) => void) | null
  onComplete?: (() => void) | null
}

/** Gameplay-driven cast: launch() then step() every frame, in group-local coordinates. */
export class HyperdimensionalSoulFireballVFX {
  constructor(options?: { quality?: 'high' | 'medium' | 'low' } & BoltLaunchOptions)
  readonly group: THREE.Group
  readonly state: 'idle' | 'cast' | 'flying' | 'impact' | 'done'
  launch(origin: THREE.Vector3, direction: THREE.Vector3, opts?: BoltLaunchOptions): this
  step(dt: number, cameraPos?: THREE.Vector3): string
  cancel(): void
  dispose(): void
}

export const defaultOptions: Record<string, unknown>
export default function createVFX(options?: Record<string, unknown>): SceneVfx
