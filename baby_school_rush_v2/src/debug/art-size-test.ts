import Phaser from 'phaser';
import type { GameModel } from '../game/model';

/**
 * Debug-only stand-in that draws the character master art at its real in-game size,
 * so readability can be judged before rigging. Enable with ?debug&art=setup[&h=120].
 */
const SETUP_POSE = {
  key: 'art-size-test',
  url: 'assets/character/setup/schoolgirl-setup-pose-v1.png',
  /** Opaque bounds of the character inside the 1024 × 1536 master. */
  top: 26,
  bottom: 1_483,
  centerX: 554
} as const;

const LEAN: Partial<Record<GameModel['pose'], number>> = { run: 2, 'fast-run': 5, rush: 10 };

/** Box-filtered halving keeps the downscaled art as clean as a properly exported asset. */
function downsample(source: CanvasImageSource & { width: number; height: number }, height: number) {
  let current: CanvasImageSource = source;
  let w = source.width, h = source.height;
  while (h / 2 >= height) {
    const next = document.createElement('canvas');
    next.width = Math.round(w / 2); next.height = Math.round(h / 2);
    next.getContext('2d')!.drawImage(current, 0, 0, next.width, next.height);
    current = next; w = next.width; h = next.height;
  }
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(w * height / h)); out.height = Math.max(1, Math.round(height));
  const context = out.getContext('2d')!;
  context.imageSmoothingQuality = 'high';
  context.drawImage(current, 0, 0, out.width, out.height);
  return out;
}

export class ArtSizeTest {
  private image!: Phaser.GameObjects.Image;
  private hitbox!: Phaser.GameObjects.Graphics;

  /** Character height in logical (540-tall) units; the gray-box runner is about 100. */
  constructor(readonly height: number) {}

  preload(scene: Phaser.Scene) {
    scene.load.image(SETUP_POSE.key, SETUP_POSE.url);
  }

  create(scene: Phaser.Scene, devicePixelsPerUnit: number) {
    const source = scene.textures.get(SETUP_POSE.key).getSourceImage() as HTMLImageElement;
    const artHeight = SETUP_POSE.bottom - SETUP_POSE.top;
    const textureHeight = source.height * this.height * devicePixelsPerUnit / artHeight;
    scene.textures.addCanvas(`${SETUP_POSE.key}-sized`, downsample(source, textureHeight));
    this.image = scene.add.image(0, 0, `${SETUP_POSE.key}-sized`)
      .setOrigin(SETUP_POSE.centerX / source.width, SETUP_POSE.bottom / source.height)
      .setScale(this.height * source.height / artHeight / textureHeight)
      .setDepth(2);
    this.hitbox = scene.add.graphics().setDepth(3);
  }

  update(model: GameModel, screenX: number, alpha: number) {
    this.image.setPosition(screenX, model.y).setAngle(LEAN[model.pose] ?? 0).setAlpha(alpha);
    const box = model.playerRect();
    this.hitbox.clear().lineStyle(1, 0xff4d5e, .9).strokeRect(box.left - model.distance, box.top, box.width, box.height);
  }
}
