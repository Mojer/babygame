import { BORDER, MAP_H, MAP_W } from '../sim/content';
import type { MapLayout, Prop } from '../sim/map';
import { hash2 } from '../sim/rng';
import { Sprite2D } from './atlas';

/**
 * 把整張都市廣場畫在一張 2048² canvas 上（只在載入時畫一次），
 * 之後切成 chunk 烘進 RenderTexture，血跡也烘在同一層。
 * 場景刻意低彩度，讓殭屍輪廓與技能特效跳出來。
 */
export function paintMap(layout: MapLayout): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_W;
  canvas.height = MAP_H;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  paintPlaza(ctx);
  paintFountainPlaza(ctx, layout);
  for (const [a, b] of layout.roadsH) paintRoad(ctx, BORDER, a, MAP_W - BORDER * 2, b - a, true);
  for (const [a, b] of layout.roadsV) paintRoad(ctx, a, BORDER, b - a, MAP_H - BORDER * 2, false);
  for (const [ha, hb] of layout.roadsH) for (const [va, vb] of layout.roadsV) paintIntersection(ctx, va, ha, vb - va, hb - ha);
  paintSidewalk(ctx);

  for (const p of layout.props) if (p.kind === 'wreck') paintScorch(ctx, p);
  for (const p of layout.props) paintProp(ctx, p, layout);
  return canvas;
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function disc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: string) {
  ctx.fillStyle = c;
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    const dy = y + 0.5 - cy;
    if (Math.abs(dy) > r) continue;
    const half = Math.sqrt(r * r - dy * dy);
    const x0 = Math.round(cx - half);
    const x1 = Math.round(cx + half);
    if (x1 > x0) ctx.fillRect(x0, y, x1 - x0, 1);
  }
}

function blit(ctx: CanvasRenderingContext2D, sp: Sprite2D, x: number, y: number, vertical: boolean) {
  for (let j = 0; j < sp.h; j++) {
    for (let i = 0; i < sp.w; i++) {
      const c = sp.px[j * sp.w + i];
      if (!c) continue;
      ctx.fillStyle = c;
      if (vertical) ctx.fillRect(x + (sp.h - 1 - j), y + i, 1, 1);
      else ctx.fillRect(x + i, y + j, 1, 1);
    }
  }
}

function paintPlaza(ctx: CanvasRenderingContext2D) {
  const shades = ['#5d605c', '#626561', '#5a5d59', '#605f5a'];
  for (let ty = 0; ty < MAP_H; ty += 32) {
    for (let tx = 0; tx < MAP_W; tx += 32) {
      const h = hash2(tx, ty, 1);
      rect(ctx, tx, ty, 32, 32, shades[(h * shades.length) | 0]);
      rect(ctx, tx, ty, 32, 1, '#4f524e');
      rect(ctx, tx, ty, 1, 32, '#4f524e');
      // 污漬與裂縫
      if (h > 0.72) {
        const sx = tx + 4 + ((hash2(tx, ty, 2) * 20) | 0);
        const sy = ty + 4 + ((hash2(tx, ty, 3) * 20) | 0);
        disc(ctx, sx, sy, 2 + hash2(tx, ty, 4) * 4, 'rgba(40,42,38,0.35)');
      }
      if (h < 0.18) {
        let x = tx + 3 + ((hash2(tx, ty, 5) * 26) | 0);
        let y = ty + 3;
        ctx.fillStyle = '#4a4c48';
        for (let i = 0; i < 22; i++) {
          ctx.fillRect(x, y, 1, 1);
          y++;
          x += hash2(x, y, 6) < 0.33 ? -1 : hash2(x, y, 7) < 0.5 ? 1 : 0;
        }
      }
      for (let i = 0; i < 5; i++) {
        const px = tx + ((hash2(tx + i, ty, 8) * 32) | 0);
        const py = ty + ((hash2(tx, ty + i, 9) * 32) | 0);
        rect(ctx, px, py, 1, 1, hash2(px, py, 10) < 0.5 ? '#6c6f6a' : '#525550');
      }
    }
  }
}

function paintFountainPlaza(ctx: CanvasRenderingContext2D, layout: MapLayout) {
  const { x, y } = layout.fountain;
  // 噴水池周圍的同心圓鋪面
  for (let r = 200; r > 60; r -= 14) disc(ctx, x, y, r, r % 28 === 4 ? '#67635b' : '#6b675f');
  for (let a = 0; a < 24; a++) {
    const ang = (a / 24) * Math.PI * 2;
    for (let r = 64; r < 200; r += 2) rect(ctx, x + Math.cos(ang) * r, y + Math.sin(ang) * r, 1, 1, '#5a5750');
  }
}

function paintRoad(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, horizontal: boolean) {
  rect(ctx, x, y, w, h, '#303236');
  for (let i = 0; i < (w * h) / 18; i++) {
    const px = x + ((hash2(i, x + y, 11) * w) | 0);
    const py = y + ((hash2(i, x - y, 12) * h) | 0);
    rect(ctx, px, py, 1, 1, hash2(px, py, 13) < 0.5 ? '#2a2c30' : '#393b3f');
  }
  // 路緣與車道線
  if (horizontal) {
    rect(ctx, x, y, w, 2, '#6a6c6a');
    rect(ctx, x, y + h - 2, w, 2, '#6a6c6a');
    for (let px = x; px < x + w; px += 24) rect(ctx, px, y + h / 2 - 1, 12, 2, '#827b52');
  } else {
    rect(ctx, x, y, 2, h, '#6a6c6a');
    rect(ctx, x + w - 2, y, 2, h, '#6a6c6a');
    for (let py = y; py < y + h; py += 24) rect(ctx, x + w / 2 - 1, py, 2, 12, '#827b52');
  }
}

function paintIntersection(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  rect(ctx, x, y, w, h, '#2f3135');
  // 斑馬線
  for (let i = 4; i < w - 4; i += 6) {
    rect(ctx, x + i, y - 14, 3, 10, '#7f8180');
    rect(ctx, x + i, y + h + 4, 3, 10, '#7f8180');
  }
  for (let i = 4; i < h - 4; i += 6) {
    rect(ctx, x - 14, y + i, 10, 3, '#7f8180');
    rect(ctx, x + w + 4, y + i, 10, 3, '#7f8180');
  }
}

function paintSidewalk(ctx: CanvasRenderingContext2D) {
  const b = BORDER;
  ctx.fillStyle = '#525551';
  ctx.fillRect(b, b, MAP_W - b * 2, 20);
  ctx.fillRect(b, MAP_H - b - 20, MAP_W - b * 2, 20);
  ctx.fillRect(b, b, 20, MAP_H - b * 2);
  ctx.fillRect(MAP_W - b - 20, b, 20, MAP_H - b * 2);
  for (let i = b; i < MAP_W - b; i += 16) {
    rect(ctx, i, b, 1, 20, '#484b47');
    rect(ctx, i, MAP_H - b - 20, 1, 20, '#484b47');
    rect(ctx, b, i, 20, 1, '#484b47');
    rect(ctx, MAP_W - b - 20, i, 20, 1, '#484b47');
  }
}

function paintScorch(ctx: CanvasRenderingContext2D, p: Prop) {
  const cx = p.x + p.w / 2;
  const cy = p.y + p.h / 2;
  disc(ctx, cx, cy, 22, 'rgba(15,12,10,0.35)');
  disc(ctx, cx, cy, 15, 'rgba(15,12,10,0.4)');
}

const CAR_COLORS = ['#6b4a45', '#46586b', '#6c6a5a', '#405044', '#7a7468', '#5a4a6a'];
const ROOF_COLORS = ['#3c4046', '#463d36', '#3a4239', '#423c48'];

function carSprite(variant: number, wreck: boolean): Sprite2D {
  const s = new Sprite2D(32, 16);
  const body = wreck ? '#2b2724' : CAR_COLORS[variant % CAR_COLORS.length];
  const roof = wreck ? '#1f1c1a' : shade(body, 1.15);
  s.rect(1, 1, 30, 14, body);
  s.rect(0, 2, 32, 12, body);
  s.rect(11, 3, 12, 10, roof); // 車頂
  s.rect(23, 3, 4, 10, wreck ? '#2f3a3e' : '#1c2329'); // 擋風玻璃
  s.rect(7, 3, 4, 10, wreck ? '#2f3a3e' : '#1c2329'); // 後擋
  s.rect(24, 4, 1, 3, '#4a5862');
  if (wreck) {
    for (let i = 0; i < 14; i++) s.set(2 + ((i * 7) % 28), 2 + ((i * 5) % 12), i % 3 ? '#3e2a1e' : '#5a6a70');
  } else {
    s.set(31, 3, '#d8d0a0');
    s.set(31, 12, '#d8d0a0');
    s.set(0, 3, '#7a2a24');
    s.set(0, 12, '#7a2a24');
    s.rect(14, 2, 6, 1, shade(body, 1.3));
  }
  s.outline('#121212');
  // 外框會超出 32×16，往內縮一圈
  const out = new Sprite2D(32, 16);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 32; x++) out.px[y * 32 + x] = s.px[y * 32 + x];
  for (let x = 0; x < 32; x++) {
    if (out.px[x]) out.px[x] = '#121212';
    if (out.px[15 * 32 + x]) out.px[15 * 32 + x] = '#121212';
  }
  return out;
}

function planterSprite(variant: number): Sprite2D {
  const s = new Sprite2D(32, 32);
  s.rect(0, 0, 32, 32, '#787a75');
  s.rect(1, 1, 30, 30, '#6a6c67');
  s.rect(3, 3, 26, 26, '#3a2f22');
  const greens = ['#44573a', '#4f6640', '#3d4f33'];
  for (let i = 0; i < 9; i++) {
    const x = 8 + ((i * 37 + variant * 11) % 16);
    const y = 8 + ((i * 53 + variant * 7) % 16);
    s.circle(x, y, 4 + (i % 3), greens[(i + variant) % 3]);
  }
  for (let i = 0; i < 7; i++) s.set(9 + ((i * 29) % 14), 9 + ((i * 17) % 14), '#6a8250');
  return s;
}

function paintProp(ctx: CanvasRenderingContext2D, p: Prop, layout: MapLayout) {
  switch (p.kind) {
    case 'building':
      paintBuilding(ctx, p);
      break;
    case 'car':
    case 'wreck':
      blit(ctx, carSprite(p.variant, p.kind === 'wreck'), p.x, p.y, p.vertical);
      break;
    case 'planter':
      blit(ctx, planterSprite(p.variant), p.x, p.y, false);
      break;
    case 'fountain': {
      const { x, y, r } = layout.fountain;
      disc(ctx, x, y, r + 5, '#7d7d77');
      disc(ctx, x, y, r + 2, '#93938d');
      disc(ctx, x, y, r - 1, '#3a5662');
      for (let rr = r - 8; rr > 14; rr -= 9) {
        for (let a = 0; a < 90; a++) {
          const ang = (a / 90) * Math.PI * 2;
          if (hash2(a, rr, 21) < 0.5) rect(ctx, x + Math.cos(ang) * rr, y + Math.sin(ang) * rr, 2, 1, '#4c6e7b');
        }
      }
      disc(ctx, x, y, 12, '#888882');
      disc(ctx, x, y, 8, '#a5a59f');
      disc(ctx, x, y, 3, '#5d7f8c');
      break;
    }
    case 'bench': {
      const s = new Sprite2D(20, 8);
      s.rect(0, 0, 20, 8, '#3a3a38');
      s.rect(1, 1, 18, 2, '#6a5238');
      s.rect(1, 5, 18, 2, '#6a5238');
      s.rect(1, 3, 18, 1, '#58442e');
      blit(ctx, s, p.x, p.y, p.vertical);
      break;
    }
    case 'bin':
      disc(ctx, p.x + 4, p.y + 4, 4, '#2a302a');
      disc(ctx, p.x + 4, p.y + 4, 3, '#4b574d');
      rect(ctx, p.x + 3, p.y + 3, 2, 2, '#232823');
      break;
    case 'barrier': {
      const s = new Sprite2D(24, 6);
      s.rect(0, 0, 24, 6, '#2e2e2c');
      for (let i = 0; i < 24; i += 6) s.rect(i + 1, 1, 3, 4, '#a39548');
      blit(ctx, s, p.x, p.y, p.vertical);
      break;
    }
  }
}

function paintBuilding(ctx: CanvasRenderingContext2D, p: Prop) {
  const roof = ROOF_COLORS[p.variant % ROOF_COLORS.length];
  rect(ctx, p.x, p.y, p.w, p.h, '#202226');
  rect(ctx, p.x + 2, p.y + 2, p.w - 4, p.h - 4, shade(roof, 1.25)); // 女兒牆
  rect(ctx, p.x + 5, p.y + 5, p.w - 10, p.h - 10, roof);
  // 屋頂防水層接縫
  for (let x = p.x + 5; x < p.x + p.w - 5; x += 16) rect(ctx, x, p.y + 5, 1, p.h - 10, shade(roof, 0.9));
  // 冷氣主機、通風口、水塔
  const n = Math.floor((p.w * p.h) / 5000);
  for (let i = 0; i < n; i++) {
    const hx = hash2(p.x + i, p.y, 30);
    const hy = hash2(p.x, p.y + i, 31);
    const x = p.x + 12 + Math.floor(hx * (p.w - 36));
    const y = p.y + 12 + Math.floor(hy * (p.h - 36));
    const kind = hash2(x, y, 32);
    if (kind < 0.5) {
      rect(ctx, x, y, 12, 10, '#1d1f22');
      rect(ctx, x + 1, y + 1, 10, 8, '#7b8186');
      disc(ctx, x + 6, y + 5, 3, '#4d5257');
      rect(ctx, x + 5, y + 4, 2, 2, '#2c3034');
    } else if (kind < 0.8) {
      rect(ctx, x, y, 6, 6, '#1d1f22');
      rect(ctx, x + 1, y + 1, 4, 4, '#5d6166');
    } else {
      disc(ctx, x + 9, y + 9, 9, '#1d1f22');
      disc(ctx, x + 9, y + 9, 8, '#6d6458');
      disc(ctx, x + 9, y + 9, 4, '#5b5348');
    }
  }
}

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
