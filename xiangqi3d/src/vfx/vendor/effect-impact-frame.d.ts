import type * as THREE from 'three'
import type { Pass } from 'three/examples/jsm/postprocessing/Pass.js'

export interface ImpactFramePass extends Pass {
  readonly active: boolean
  update(deltaSeconds: number): void
  trigger(center?: { x: number; y: number }, direction?: { x: number; y: number }): boolean
  setCenter(center: { x: number; y: number }): void
  setDirection(direction: { x: number; y: number } | null): void
  setSubjectMask(texture: THREE.Texture | null): void
  setSubjects(scene: THREE.Scene | null, camera?: THREE.Camera, subjects?: THREE.Object3D[]): void
  reset(): void
  setOptions(options: Record<string, unknown>): void
  dispose(): void
}
export const defaultOptions: Record<string, unknown>
export default function createImpactFramePass(options?: Record<string, unknown>): ImpactFramePass
