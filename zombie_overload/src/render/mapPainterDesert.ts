import { MAP_H, MAP_W } from '../sim/content';
import type { MapLayout } from '../sim/map';
import type { MapSheet } from './mapPainterOblique';
/** Single authored desert plate; landmarks stay in the actor depth-sorted layer. */
export function paintMapDesert(_layout:MapLayout,sheet:MapSheet):HTMLCanvasElement {
  const canvas=document.createElement('canvas');canvas.width=MAP_W;canvas.height=MAP_H;
  canvas.getContext('2d')!.drawImage(sheet.ground!,0,0,MAP_W,MAP_H);
  return canvas;
}
