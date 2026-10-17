import { MAP_H, MAP_W } from '../sim/content';
import type { MapLayout } from '../sim/map';
import type { MapSheet } from './mapPainterOblique';

/** One full-world cloud painting, with soft frosting paths baked from the layout.
 * No repeating tiles, square village pads or separate border material.
 */
export function paintMapCandy(_layout: MapLayout, sheet: MapSheet): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_W; canvas.height = MAP_H;
  canvas.getContext('2d')!.drawImage(sheet.ground!, 0, 0, MAP_W, MAP_H);
  return canvas;
}
