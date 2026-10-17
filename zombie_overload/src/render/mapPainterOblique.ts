import { BORDER, MAP_H, MAP_W } from '../sim/content';
import type { MapLayout, Prop } from '../sim/map';
import { hash2 } from '../sim/rng';

export interface MapSheet {
  image: ImageBitmap;
  /** Optional full-world ground art; avoids repeating small terrain tiles. */
  ground?: ImageBitmap;
  frames: Record<string, { x: number; y: number; w: number; h: number }>;
}

const FACADES = ['facade_shop_green', 'facade_shop_red', 'facade_apartment', 'facade_brick'];

/**
 * 3/4 斜俯視地圖的靜態層（載入時畫一次，之後烘進地面 chunk）：
 * 無縫地磚鋪底、道路標線用程式畫、外圍建築 = 屋頂地磚 + 底邊一排立面模組。
 * 立面底邊就是碰撞邊界；建築依底邊 y 由北到南畫，南邊的牆會蓋住北邊的屋頂。
 * 車輛、花台、噴水池等有高度的物件不在這裡，它們和角色一起依 y 排序。
 */
export function paintMapOblique(layout: MapLayout, sheet: MapSheet): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_W;
  canvas.height = MAP_H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const pattern = (name: string) => {
    const f = sheet.frames[name];
    const c = document.createElement('canvas');
    c.width = f.w;
    c.height = f.h;
    c.getContext('2d')!.drawImage(sheet.image, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
    return ctx.createPattern(c, 'repeat')!;
  };
  const plaza = pattern('tile_plaza');
  const asphalt = pattern('tile_asphalt');
  const sidewalk = pattern('tile_sidewalk');
  const roof = pattern('tile_roof');

  ctx.fillStyle = plaza;
  ctx.fillRect(0, 0, MAP_W, MAP_H);

  // 建築前的人行道
  ctx.fillStyle = sidewalk;
  const b = BORDER;
  ctx.fillRect(b, b, MAP_W - b * 2, 24);
  ctx.fillRect(b, MAP_H - b - 24, MAP_W - b * 2, 24);
  ctx.fillRect(b, b, 24, MAP_H - b * 2);
  ctx.fillRect(MAP_W - b - 24, b, 24, MAP_H - b * 2);

  // 噴水池周圍一圈人行道石材
  const f = layout.fountain;
  ctx.fillStyle = sidewalk;
  ctx.beginPath();
  ctx.ellipse(f.x, f.y, f.r + 26, f.ry + 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(20,22,20,0.35)';
  ctx.beginPath();
  ctx.ellipse(f.x, f.y + 6, f.r + 4, f.ry + 4, 0, 0, Math.PI * 2);
  ctx.fill();

  for (const [y0, y1] of layout.roadsH) road(ctx, asphalt, b, y0, MAP_W - b * 2, y1 - y0, true);
  for (const [x0, x1] of layout.roadsV) road(ctx, asphalt, x0, b, x1 - x0, MAP_H - b * 2, false);
  for (const [ha, hb] of layout.roadsH) for (const [va, vb] of layout.roadsV) crossing(ctx, asphalt, va, ha, vb - va, hb - ha);

  // 事故車底下的焦痕
  for (const p of layout.props) {
    if (p.kind !== 'wreck') continue;
    ctx.fillStyle = 'rgba(12,10,8,0.4)';
    ctx.beginPath();
    ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, 24, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const buildings = layout.props.filter(p => p.kind === 'building').sort((a, c) => a.y + a.h - (c.y + c.h));
  for (const p of buildings) building(ctx, sheet, roof, p);
  return canvas;
}

function road(ctx: CanvasRenderingContext2D, asphalt: CanvasPattern, x: number, y: number, w: number, h: number, horizontal: boolean) {
  ctx.fillStyle = asphalt;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#6d6f6b';
  if (horizontal) {
    ctx.fillRect(x, y, w, 3);
    ctx.fillRect(x, y + h - 3, w, 3);
    ctx.fillStyle = '#8a8152';
    for (let px = x; px < x + w; px += 24) ctx.fillRect(px, y + h / 2 - 1, 12, 2);
  } else {
    ctx.fillRect(x, y, 3, h);
    ctx.fillRect(x + w - 3, y, 3, h);
    ctx.fillStyle = '#8a8152';
    for (let py = y; py < y + h; py += 24) ctx.fillRect(x + w / 2 - 1, py, 2, 12);
  }
}

function crossing(ctx: CanvasRenderingContext2D, asphalt: CanvasPattern, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = asphalt;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(190,190,180,0.55)';
  for (let i = 4; i < w - 4; i += 7) {
    ctx.fillRect(x + i, y - 16, 4, 12);
    ctx.fillRect(x + i, y + h + 4, 4, 12);
  }
  for (let i = 4; i < h - 4; i += 7) {
    ctx.fillRect(x - 16, y + i, 12, 4);
    ctx.fillRect(x + w + 4, y + i, 12, 4);
  }
}

function building(ctx: CanvasRenderingContext2D, sheet: MapSheet, roof: CanvasPattern, p: Prop) {
  const fh = sheet.frames[FACADES[0]].h;
  const bottom = p.y + p.h;
  const roofBottom = bottom - fh;
  // 屋頂：地磚＋女兒牆外框
  ctx.fillStyle = roof;
  ctx.fillRect(p.x, p.y, p.w, roofBottom - p.y);
  ctx.fillStyle = '#1b1d20';
  ctx.fillRect(p.x, p.y, p.w, 2);
  ctx.fillRect(p.x, p.y, 2, roofBottom - p.y);
  ctx.fillRect(p.x + p.w - 2, p.y, 2, roofBottom - p.y);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(p.x + 2, p.y + 2, p.w - 4, 2);
  // 立面：一排 64px 模組，最後一塊裁切
  ctx.save();
  ctx.beginPath();
  ctx.rect(p.x, roofBottom - 8, p.w, fh + 8);
  ctx.clip();
  for (let x = p.x, i = 0; x < p.x + p.w; x += 64, i++) {
    const name = FACADES[(hash2(p.x + i * 7, p.y, 3) * FACADES.length) | 0];
    const f = sheet.frames[name];
    ctx.drawImage(sheet.image, f.x, f.y, f.w, f.h, x, bottom - f.h, f.w, f.h);
  }
  ctx.restore();
  // 牆腳陰影
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(p.x, bottom, p.w, 4);
}
