import { Rectangle, Texture } from 'pixi.js';

/**
 * 佔位美術：全部用程式畫在同一張圖集上（ParticleContainer 規定同屏粒子共用一張貼圖來源）。
 * 正上方 90° 俯視：角色朝 +x 方向，畫面上只看得到頭頂、肩膀與手臂，靠旋轉表現面向。
 * 之後換成正式美術時，只要維持同樣的 frame 名稱與尺寸即可。
 */

type Px = string | null;

export class Sprite2D {
  readonly px: Px[];
  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.px = new Array(w * h).fill(null);
  }

  set(x: number, y: number, c: string) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.px[y * this.w + x] = c;
  }

  get(x: number, y: number): Px {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    return this.px[y * this.w + x];
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, c: string) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, c);
      }
    }
  }

  circle(cx: number, cy: number, r: number, c: string) {
    this.ellipse(cx, cy, r, r, c);
  }

  line(x0: number, y0: number, x1: number, y1: number, thick: number, c: string) {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 3) + 1;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      if (thick <= 1) this.set(x, y, c);
      else this.circle(x, y, thick / 2, c);
    }
  }

  rect(x: number, y: number, w: number, h: number, c: string) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }

  outline(c: string) {
    const add: number[] = [];
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.get(x, y)) continue;
        if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push(y * this.w + x);
      }
    }
    for (const i of add) this.px[i] = c;
  }

  map(fn: (c: string) => string): Sprite2D {
    const out = new Sprite2D(this.w, this.h);
    for (let i = 0; i < this.px.length; i++) {
      const c = this.px[i];
      out.px[i] = c ? fn(c) : null;
    }
    return out;
  }
}

function lum(hex: string) {
  const n = parseInt(hex.slice(1, 7), 16);
  return (((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) / 255;
}

const toWhite = () => '#ffffff';
const toIce = (c: string) => {
  const l = lum(c);
  return l > 0.5 ? '#effaff' : l > 0.33 ? '#c4e9ff' : l > 0.15 ? '#8fcbf2' : '#3c6f99';
};

// ───────────────────────── 角色 ─────────────────────────

interface ZombieLook {
  size: number;
  shirt: string;
  shirtDark: string;
  skin: string;
  hair: string;
  outline: string;
  bodyRx: number;
  bodyRy: number;
  head: number;
  headX: number;
  armsBack?: boolean;
}

const LOOKS: ZombieLook[] = [
  // 普通殭屍：灰綠色破襯衫
  { size: 16, shirt: '#59654f', shirtDark: '#464f3e', skin: '#93a77e', hair: '#36352a', outline: '#14170f', bodyRx: 2.7, bodyRy: 4.7, head: 2.4, headX: 9 },
  // 衝刺殭屍：細瘦、鏽紅上衣、手往後甩
  { size: 16, shirt: '#82483a', shirtDark: '#64362b', skin: '#aa9e80', hair: '#2a2420', outline: '#170e0b', bodyRx: 2.2, bodyRy: 3.9, head: 2.2, headX: 9.6, armsBack: true },
  // 裝甲殭屍：大一號、鎮暴裝甲與頭盔
  { size: 20, shirt: '#5f666b', shirtDark: '#4a5054', skin: '#7f8c72', hair: '#2b3034', outline: '#101315', bodyRx: 4, bodyRy: 6.6, head: 3, headX: 12 },
  // 感染核心：紫灰上衣、背上發光膿包
  { size: 16, shirt: '#51476a', shirtDark: '#3f3753', skin: '#8ea27a', hair: '#30283a', outline: '#120f18', bodyRx: 2.8, bodyRy: 4.8, head: 2.4, headX: 9.2 },
  // 巨大變異體（90° 佔位用）
  { size: 28, shirt: '#6b5a52', shirtDark: '#54453f', skin: '#8fa078', hair: '#3a2a26', outline: '#120d0b', bodyRx: 6.5, bodyRy: 10, head: 3.6, headX: 17 },
];

function drawZombie(kind: number, frame: number): Sprite2D {
  const L = LOOKS[kind];
  const s = new Sprite2D(L.size, L.size);
  const c = L.size / 2;
  const swing = [1.2, 0, -1.2, 0][frame];
  const bx = c - 1;
  // 腳步（藏在身體下，只露出一點）
  s.set(bx - L.bodyRx - 0.5, c - 2 + (frame % 2), L.outline);
  s.set(bx - L.bodyRx - 0.5, c + 1 - (frame % 2), L.outline);
  // 手臂
  const armY = L.bodyRy - 0.8;
  const armT = kind === 2 ? 2.4 : 1.5;
  if (L.armsBack) {
    s.line(bx, c - armY, bx - 3 + swing, c - armY - 1.2, armT, L.skin);
    s.line(bx, c + armY, bx - 3 - swing, c + armY + 1.2, armT, L.skin);
  } else {
    const reach = kind === 2 ? 5.5 : 5;
    s.line(bx + 1, c - armY + 0.5, bx + reach + swing, c - armY + 1, armT, L.skin);
    s.line(bx + 1, c + armY - 0.5, bx + reach - swing, c + armY - 1, armT, L.skin);
  }
  // 肩膀／軀幹
  s.ellipse(bx, c, L.bodyRx, L.bodyRy, L.shirt);
  s.ellipse(bx - 0.9, c, L.bodyRx * 0.55, L.bodyRy * 0.8, L.shirtDark);
  if (kind === 2) {
    // 肩甲與裝甲條紋
    s.circle(bx + 0.5, c - L.bodyRy + 2.2, 2.2, '#737a80');
    s.circle(bx + 0.5, c + L.bodyRy - 2.2, 2.2, '#737a80');
    s.rect(bx - 0.5, c - 3, 1, 6, '#8d959b');
  }
  if (kind === 3) {
    const r = frame % 2 === 0 ? 2.3 : 1.8;
    s.circle(bx - 1.8, c, r, '#a8e83a');
    s.circle(bx - 1.8, c, r * 0.5, '#f2ffb4');
  }
  // 頭
  const hx = L.headX - (L.size === 20 ? 0 : 0.5);
  s.circle(hx, c, L.head, kind === 2 ? '#2c3135' : L.skin);
  if (kind === 2) {
    s.line(hx + 1.8, c - 1.6, hx + 1.8, c + 1.6, 1, '#6fa7c2');
  } else {
    s.circle(hx - 0.9, c - 0.3, L.head * 0.65, L.hair);
    s.set(hx + 1, c - 1, '#5e1d1d'); // 傷口
  }
  s.outline(L.outline);
  return s;
}

function drawPlayer(frame: number): Sprite2D {
  const s = new Sprite2D(16, 16);
  const c = 8;
  const step = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  s.set(3, 6 + step, '#0b0f14');
  s.set(3, 9 - step, '#0b0f14');
  // 背包
  s.rect(3, 5, 2, 6, '#e0712f');
  s.rect(3, 6, 1, 4, '#b4531c');
  // 外套
  s.ellipse(7, c, 2.9, 4.4, '#22b8e6');
  s.ellipse(7.6, c - 1.4, 1.2, 1.6, '#86e6ff');
  // 槍（右手往前）
  s.line(8, 11, 14, 10.5, 1, '#dfe7ec');
  s.set(14, 10, '#ffffff');
  s.line(8, 5, 11, 7.5, 1.4, '#f0c9a0');
  // 頭
  s.circle(9, c, 2.3, '#f0c9a0');
  s.circle(8.3, c - 0.2, 1.8, '#2a2320');
  s.outline('#0b0f14');
  return s;
}

// ───────────────────────── 特效 ─────────────────────────

function glow(r: number): Sprite2D {
  // 像素風光暈：分 4 階透明度 + 有序抖色（用灰階表示強度，渲染時加法混合＋染色）
  const size = r * 2;
  const s = new Sprite2D(size, size);
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - r, y + 0.5 - r) / r;
      if (d >= 1) continue;
      const v = Math.pow(1 - d, 1.6);
      const th = (bayer[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
      const level = Math.min(4, Math.floor(v * 4 + th));
      if (level <= 0) continue;
      const g = Math.round((level / 4) * 255);
      const h = g.toString(16).padStart(2, '0');
      s.set(x, y, `#${h}${h}${h}`);
    }
  }
  return s;
}

function ring(r: number): Sprite2D {
  const size = Math.ceil(r * 2 + 3);
  const s = new Sprite2D(size, size);
  const c = size / 2;
  const t = r < 10 ? 1 : 1.6;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - c, y + 0.5 - c);
      if (Math.abs(d - r) < t * 0.75) s.set(x, y, '#ffffff');
      else if (Math.abs(d - r) < t * 1.5) s.set(x, y, '#808080');
    }
  }
  return s;
}

function blob(size: number, seed: number, colors: string[]): Sprite2D {
  const s = new Sprite2D(size, size);
  let h = seed * 9301 + 49297;
  const rnd = () => ((h = (h * 9301 + 49297) % 233280) / 233280);
  const c = size / 2;
  const n = 4 + Math.floor(rnd() * 4);
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * size * 0.28;
    s.circle(c + Math.cos(a) * d, c + Math.sin(a) * d, size * (0.12 + rnd() * 0.16), colors[0]);
  }
  // 噴濺點
  for (let i = 0; i < 6; i++) {
    const a = rnd() * Math.PI * 2;
    const d = size * (0.3 + rnd() * 0.18);
    s.set(c + Math.cos(a) * d, c + Math.sin(a) * d, colors[0]);
  }
  if (colors[1]) s.circle(c, c, size * 0.14, colors[1]);
  return s;
}

function scorch(size: number, seed: number): Sprite2D {
  const s = new Sprite2D(size, size);
  const c = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x + 0.5 - c, y + 0.5 - c) / c;
      const n = Math.sin(x * 1.7 + seed) * Math.cos(y * 1.3 - seed) * 0.15;
      if (d + n < 0.55) s.set(x, y, '#0d0907');
      else if (d + n < 0.85 && (x + y + seed) % 2 === 0) s.set(x, y, '#1a1210');
    }
  }
  return s;
}

function holeSprite(): Sprite2D {
  const r = 24;
  const s = new Sprite2D(r * 2, r * 2);
  for (let y = 0; y < r * 2; y++) {
    for (let x = 0; x < r * 2; x++) {
      const d = Math.hypot(x + 0.5 - r, y + 0.5 - r);
      const a = Math.atan2(y + 0.5 - r, x + 0.5 - r);
      const spiral = Math.sin(a * 3 + d * 0.5);
      if (d < 11) s.set(x, y, '#030006');
      else if (d < 13) s.set(x, y, '#1a0630');
      else if (d < 22 && spiral > 0.2 - (22 - d) / 14) s.set(x, y, d < 17 ? '#3d0f6b' : '#26093f');
    }
  }
  return s;
}

// ───────────────────────── 打包 ─────────────────────────

export interface Atlas {
  canvas: HTMLCanvasElement;
  /** [種類][0-3 走路, 4 受擊白, 5 冰凍] */
  zombie: Texture[][];
  /** [0-2 走路, 3 受擊白] */
  player: Texture[];
  corpse: Texture[];
  ring: Texture[];
  ringRadius: number[];
  glow: Record<16 | 32 | 64, Texture>;
  t: Record<string, Texture>;
  blood: Texture[];
  ichor: Texture[];
  water: Texture[];
  scorch: Texture[];
  gib: Texture[];
  shard: Texture[];
}

export function buildAtlas(): Atlas {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  let cx = 1;
  let cy = 1;
  let rowH = 0;
  const put = (sp: Sprite2D, alpha = 1): Rectangle => {
    if (cx + sp.w + 2 > canvas.width) {
      cx = 1;
      cy += rowH + 2;
      rowH = 0;
    }
    ctx.globalAlpha = alpha;
    for (let y = 0; y < sp.h; y++) {
      for (let x = 0; x < sp.w; x++) {
        const c = sp.px[y * sp.w + x];
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(cx + x, cy + y, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
    const r = new Rectangle(cx, cy, sp.w, sp.h);
    cx += sp.w + 2;
    rowH = Math.max(rowH, sp.h);
    return r;
  };

  const pending: { name: string; rect: Rectangle }[] = [];
  const add = (name: string, sp: Sprite2D, alpha = 1) => {
    pending.push({ name, rect: put(sp, alpha) });
  };

  for (let k = 0; k < 5; k++) {
    const walk = [0, 1, 2, 3].map(f => drawZombie(k, f));
    walk.forEach((sp, f) => add(`z${k}_${f}`, sp));
    add(`z${k}_white`, walk[0].map(toWhite));
    add(`z${k}_ice`, walk[0].map(toIce));
    add(`z${k}_corpse`, walk[1].map(c => {
      const l = lum(c);
      const v = Math.round(18 + l * 60).toString(16).padStart(2, '0');
      return `#${v}${Math.round(18 + l * 40).toString(16).padStart(2, '0')}${v}`;
    }), 0.9);
  }
  const pf = [0, 1, 2].map(drawPlayer);
  pf.forEach((sp, f) => add(`p_${f}`, sp));
  add('p_white', pf[0].map(toWhite));

  const gem = new Sprite2D(5, 5);
  gem.set(2, 0, '#46d2ff');
  gem.rect(1, 1, 3, 3, '#46d2ff');
  gem.set(0, 2, '#46d2ff');
  gem.set(4, 2, '#46d2ff');
  gem.set(2, 4, '#46d2ff');
  gem.set(2, 1, '#d8f6ff');
  gem.set(1, 2, '#d8f6ff');
  add('gem', gem);
  add('gemBig', gem.map(c => (c === '#46d2ff' ? '#ff4d6d' : '#ffd0d8')));

  const dot = new Sprite2D(2, 2);
  dot.rect(0, 0, 2, 2, '#ffffff');
  add('dot', dot);
  const spark = new Sprite2D(3, 3);
  spark.set(1, 0, '#ffffff');
  spark.rect(0, 1, 3, 1, '#ffffff');
  spark.set(1, 2, '#ffffff');
  add('spark', spark);
  const bolt = new Sprite2D(7, 3);
  bolt.rect(0, 1, 7, 1, '#7fd8ff');
  bolt.rect(2, 0, 4, 3, '#bff0ff');
  bolt.rect(3, 1, 3, 1, '#ffffff');
  add('bolt', bolt);
  for (let i = 0; i < 3; i++) add(`gib${i}`, blob(4, i + 3, ['#ffffff', '#9a9a9a']));
  for (let i = 0; i < 3; i++) {
    const sh = new Sprite2D(4, 4);
    if (i === 0) sh.line(0, 3, 3, 0, 1, '#ffffff');
    else if (i === 1) sh.rect(0, 1, 4, 2, '#e0f4ff');
    else {
      sh.rect(1, 0, 2, 4, '#ffffff');
      sh.set(1, 0, '#c0e8ff');
    }
    add(`shard${i}`, sh);
  }
  add('glow16', glow(8));
  add('glow32', glow(16));
  add('glow64', glow(32));
  const ringRadius = [3, 5, 8, 11, 15, 19, 24, 30, 37, 45, 54, 64];
  ringRadius.forEach((r, i) => add(`ring${i}`, ring(r)));
  for (let i = 0; i < 4; i++) add(`blood${i}`, blob(12 + (i % 2) * 4, i + 11, ['#5a1515', '#3a0b0b']), 0.85);
  for (let i = 0; i < 2; i++) add(`ichor${i}`, blob(14, i + 31, ['#45601e', '#2e4212']), 0.85);
  for (let i = 0; i < 2; i++) add(`water${i}`, blob(14, i + 41, ['#7d9db0']), 0.45);
  for (let i = 0; i < 2; i++) add(`scorch${i}`, scorch(14 + i * 4, i * 3 + 1), 0.6);
  add('hole', holeSprite());
  const shadow = new Sprite2D(16, 6);
  shadow.ellipse(8, 3, 8, 3, '#000000');
  add('shadow', shadow, 0.32);

  const base = Texture.from(canvas);
  base.source.scaleMode = 'nearest';
  const t: Record<string, Texture> = {};
  for (const { name, rect } of pending) t[name] = new Texture({ source: base.source, frame: rect });

  return {
    canvas,
    zombie: [0, 1, 2, 3, 4].map(k => [0, 1, 2, 3].map(f => t[`z${k}_${f}`]).concat([t[`z${k}_white`], t[`z${k}_ice`]])),
    player: [t.p_0, t.p_1, t.p_2, t.p_white],
    corpse: [0, 1, 2, 3, 4].map(k => t[`z${k}_corpse`]),
    ring: ringRadius.map((_, i) => t[`ring${i}`]),
    ringRadius,
    glow: { 16: t.glow16, 32: t.glow32, 64: t.glow64 },
    t,
    blood: [0, 1, 2, 3].map(i => t[`blood${i}`]),
    ichor: [0, 1].map(i => t[`ichor${i}`]),
    water: [0, 1].map(i => t[`water${i}`]),
    scorch: [0, 1].map(i => t[`scorch${i}`]),
    gib: [0, 1, 2].map(i => t[`gib${i}`]),
    shard: [0, 1, 2].map(i => t[`shard${i}`]),
  };
}
