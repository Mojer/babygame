import { BORDER, MAP_H, MAP_W } from '../sim/content';
import type { MapLayout } from '../sim/map';
import type { MapSheet } from './mapPainterOblique';

/** AI 地磚鋪底、參道／庭園幾何烘進 chunk；神社與樹冠由角色層依足跡排序。 */
export function paintMapJapan(layout: MapLayout, sheet: MapSheet): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_W;
  canvas.height = MAP_H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const pattern = (name: string) => {
    const f = sheet.frames[name];
    const tile = document.createElement('canvas');
    tile.width = f.w;
    tile.height = f.h;
    tile.getContext('2d')!.drawImage(sheet.image, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
    return ctx.createPattern(tile, 'repeat')!;
  };
  const moss = pattern('tile_moss');
  const stone = pattern('tile_stone');
  const wood = pattern('tile_wood');
  const roof = pattern('tile_roof');
  ctx.fillStyle = moss;
  ctx.fillRect(0, 0, MAP_W, MAP_H);
  ctx.fillStyle = stone;
  for (const [a, b] of layout.roadsH) ctx.fillRect(BORDER, a, MAP_W - BORDER * 2, b - a);
  for (const [a, b] of layout.roadsV) ctx.fillRect(a, BORDER, b - a, MAP_H - BORDER * 2);
  // 主殿前庭連接出生點與兩侧庭園。
  ctx.fillRect(864, 816, 320, 464);
  for (const p of layout.props) {
    if (p.kind === 'shrine') {
      ctx.fillStyle = stone;
      ctx.fillRect(p.x - 32, p.y - 16, p.w + 64, p.h + 104);
    }
    if (p.kind === 'yatai' && p.blocks) {
      ctx.fillStyle = wood;
      ctx.fillRect(p.x - 8, p.y, p.w + 16, p.h + 16);
    }
    if (p.kind === 'sakura') {
      ctx.fillStyle = 'rgba(240,137,171,0.12)';
      ctx.beginPath();
      ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, 38, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (p.kind === 'stoneLantern') {
      const glow = ctx.createRadialGradient(p.x + 6, p.y + 6, 0, p.x + 6, p.y + 6, 30);
      glow.addColorStop(0, 'rgba(255,184,92,0.22)');
      glow.addColorStop(1, 'rgba(255,184,92,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(p.x - 24, p.y - 24, 60, 60);
    }
  }
  ctx.fillStyle = roof;
  ctx.fillRect(0, 0, MAP_W, BORDER);
  ctx.fillRect(0, MAP_H - BORDER, MAP_W, BORDER);
  ctx.fillRect(0, BORDER, BORDER, MAP_H - BORDER * 2);
  ctx.fillRect(MAP_W - BORDER, BORDER, BORDER, MAP_H - BORDER * 2);
  return canvas;
}
