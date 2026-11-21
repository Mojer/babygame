import type * as THREE from 'three'

/** Shared shape of 00GameDevs scene-object effects (see each file's header notes). */
export interface SceneVfx {
  readonly group: THREE.Group
  readonly finished: boolean
  readonly phase?: string
  update(deltaSeconds: number): void
  stop(): void
  hit?(worldPosition?: THREE.Vector3, worldNormal?: THREE.Vector3): void
  reset(): void
  setOptions(options: Record<string, unknown>): void
  setProgress?(progress: number): void
  dispose(): void
}
