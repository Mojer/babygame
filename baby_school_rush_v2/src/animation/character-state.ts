import type { SpineGameObject } from '@esotericsoftware/spine-phaser-v4';
import type { CharacterPose } from '../game/model';

export const SPINE_ANIMATIONS: Record<CharacterPose, { name: string; loop: boolean }> = {
  idle: { name: 'idle', loop: true },
  run: { name: 'run', loop: true },
  'fast-run': { name: 'run_fast', loop: true },
  rush: { name: 'rush', loop: true },
  jump: { name: 'jump_up', loop: false },
  apex: { name: 'jump_apex', loop: true },
  fall: { name: 'fall', loop: true },
  slide: { name: 'slide_loop', loop: true }
};

export const SPINE_TRANSIENTS = {
  land: { name: 'land', duration: 180 },
  'slide-start': { name: 'slide_start', duration: 140 },
  'slide-end': { name: 'slide_end', duration: 160 },
  hit: { name: 'hit', duration: 360 },
  victory: { name: 'victory', duration: 1_200 }
} as const;

export type CharacterTransient = keyof typeof SPINE_TRANSIENTS;

export const SPINE_CHARACTER = {
  enabled: import.meta.env.VITE_SPINE_CHARACTER === '1',
  skeletonKey: 'schoolgirl-skeleton',
  atlasKey: 'schoolgirl-atlas',
  skeletonUrl: 'assets/character/schoolgirl.skel',
  atlasUrl: 'assets/character/schoolgirl.atlas',
  scale: .42
} as const;

/** Keeps gameplay state independent from Spine animation names and tracks. */
export class SpineCharacterController {
  private current: CharacterPose | null = null;
  private lockedUntil = 0;

  constructor(readonly object: SpineGameObject) {}

  setPose(pose: CharacterPose, runSpeed: number) {
    if (performance.now() < this.lockedUntil) return;
    if (pose !== this.current) {
      const animation = SPINE_ANIMATIONS[pose];
      this.object.animationState.setAnimation(0, animation.name, animation.loop);
      this.current = pose;
    }
    const locomotion = pose === 'run' || pose === 'fast-run' || pose === 'rush';
    this.object.animationState.timeScale = locomotion ? Math.min(1.45, Math.max(.82, runSpeed / 350)) : 1;
  }

  playTransient(state: CharacterTransient) {
    const animation = SPINE_TRANSIENTS[state];
    this.object.animationState.setAnimation(0, animation.name, false);
    this.current = null;
    this.lockedUntil = performance.now() + animation.duration;
  }

  setTransform(x: number, y: number, alpha: number) {
    this.object.setPosition(x, y).setScale(SPINE_CHARACTER.scale).setAlpha(alpha);
  }
}
