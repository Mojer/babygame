// Pop-art + KIRAKIRA graphics for the promo, all canvas 2D and pure functions of the beat.
//
// - rainbowTunnel: flight through outlined pastel polygon gates, one gate passes per
//   beat (after the KIRAKIRA MV's k-tunnel, but daylight pastel with ink outlines),
//   warp streaks and optional rainbow lasers swinging on the beat.
// - halftone / halftoneCorner: Ben-Day dot fields whose dot size follows a gradient.
// - popBurst: comic starburst sticker with halftone fill and a word on it.
// - sparkle: four-point twinkle star.
// - gateWipe / dotWipe: shot transitions.

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const frac = (x: number) => x - Math.floor(x);
const hash = (n: number) => frac(Math.sin(n * 127.1 + 311.7) * 43758.5453);
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const RAINBOW = ['#FF8FB1', '#FFB067', '#FFE36E', '#8FE3A3', '#7CCBFF', '#B89CFF'];
export const KIRA_INK = '#5A3A73';

// ─── primitives ─────────────────────────────────────────
export type GateKind = 'tri' | 'square' | 'hex' | 'star' | 'circle' | 'heart';
const GATES: GateKind[] = ['star', 'hex', 'heart', 'square', 'circle', 'tri'];

export function gatePath(ctx: Ctx, kind: GateKind, r: number) {
  ctx.beginPath();
  if (kind === 'circle') return ctx.arc(0, 0, r, 0, TAU);
  if (kind === 'heart') {
    const s = r / 1.05;
    ctx.moveTo(0, s * 0.95);
    ctx.bezierCurveTo(-s * 1.35, s * 0.1, -s * 0.95, -s * 1.05, 0, -s * 0.45);
    ctx.bezierCurveTo(s * 0.95, -s * 1.05, s * 1.35, s * 0.1, 0, s * 0.95);
    return ctx.closePath();
  }
  const n = kind === 'tri' ? 3 : kind === 'square' ? 4 : kind === 'hex' ? 6 : 10;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * TAU) / n;
    const rr = kind === 'star' && i % 2 ? r * 0.52 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
}

export function sparkle(ctx: Ctx, x: number, y: number, r: number, fill = '#FFFFFF', rot = 0, ink: string | null = KIRA_INK) {
  if (r < 1) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = (i * TAU) / 4 - Math.PI / 2;
    const b = a + TAU / 8;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.quadraticCurveTo(Math.cos(b) * r * 0.12, Math.sin(b) * r * 0.12, Math.cos(a + TAU / 4) * r, Math.sin(a + TAU / 4) * r);
  }
  ctx.closePath();
  if (ink) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, r * 0.16);
    ctx.strokeStyle = ink;
    ctx.stroke();
  }
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

/** Dots on a 45° grid; radius = maxR * size(x, y) (0..1). */
export function halftone(ctx: Ctx, color: string, cell: number, maxR: number, size: (x: number, y: number) => number, W: number, H: number, off = 0) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let j = -1; j * cell * 0.5 < H + cell; j++) {
    const y = j * cell * 0.5;
    const shift = (j % 2 ? cell / 2 : 0) + (off % cell);
    for (let x = -cell + shift; x < W + cell; x += cell) {
      const r = maxR * clamp(size(x, y));
      if (r < 0.8) continue;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, TAU);
    }
  }
  ctx.fill();
  ctx.restore();
}

/** Halftone that grows toward one or more corners — the pop-art frame on every shot. */
export function halftoneCorners(ctx: Ctx, color: string, W: number, H: number, B: number, corners: [number, number][], reach = 0.55) {
  const pulse = Math.exp(-frac(B) * 5) * 0.12;
  halftone(ctx, color, 34, 15, (x, y) => {
    let m = 0;
    for (const [cx, cy] of corners) {
      const d = Math.hypot((x - cx * W) / W, (y - cy * H) / H);
      m = Math.max(m, 1 - d / reach);
    }
    return m * (1 + pulse);
  }, W, H, B * 8);
}

/** Comic starburst with ink outline, drop shadow, halftone fill and a word. */
export function popBurst(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  fill: string,
  word: string,
  drawWord: (s: string, size: number) => void,
  rot = 0,
  seed = 1,
) {
  if (r < 2) return;
  const spikes = 12;
  const path = () => {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const a = (i * Math.PI) / spikes;
      const rr = i % 2 ? r * (0.68 + hash(seed + i) * 0.08) : r * (0.95 + hash(seed * 3 + i) * 0.12);
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
  };
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.save();
  ctx.translate(r * 0.06, r * 0.08);
  path();
  ctx.fillStyle = KIRA_INK;
  ctx.fill();
  ctx.restore();
  path();
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(6, r * 0.07);
  ctx.strokeStyle = KIRA_INK;
  ctx.stroke();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.save();
  path();
  ctx.clip();
  ctx.translate(-r, -r);
  halftone(ctx, 'rgba(255,255,255,0.55)', r * 0.16, r * 0.055, (px, py) => 1.1 - Math.hypot(px - r * 0.8, py - r * 0.7) / r, 2 * r, 2 * r);
  ctx.restore();
  ctx.save();
  ctx.rotate(-rot * 0.6);
  drawWord(word, r * (word.length > 2 ? 0.46 : 0.62));
  ctx.restore();
  ctx.restore();
}

/** Radial speed lines around a centre (manga focus lines). */
export function speedLines(ctx: Ctx, cx: number, cy: number, W: number, H: number, B: number, color = 'rgba(255,255,255,0.8)', n = 48, inner = 380) {
  ctx.save();
  ctx.fillStyle = color;
  const seedB = Math.floor(B * 4);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + hash(i + seedB * 0.37) * 0.08;
    const r0 = inner + hash(i * 3.3 + seedB) * 160;
    const r1 = Math.hypot(W, H);
    const w = 0.012 + hash(i * 7.7) * 0.02;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a - w) * r1, cy + Math.sin(a - w) * r1);
    ctx.lineTo(cx + Math.cos(a + w) * r1, cy + Math.sin(a + w) * r1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ─── rainbow tunnel ─────────────────────────────────────
export interface TunnelOpts {
  /** Gates per beat (a gate reaches the camera every 1/gatesPerBeat beats). */
  gatesPerBeat?: number;
  /** Vanishing point in px. */
  vx?: number;
  vy?: number;
  lasers?: boolean;
  /** 0..1 fade from white (intro). */
  fade?: number;
  /** Distance travelled in gates; overrides B * gatesPerBeat (for easing the speed). */
  dist?: number;
}

export function rainbowTunnel(ctx: Ctx, W: number, H: number, B: number, o: TunnelOpts = {}) {
  const t = B * (60 / 128);
  const gpb = o.gatesPerBeat ?? 1;
  const travel = o.dist ?? B * gpb;
  const vx = o.vx ?? W / 2 + Math.sin(B * 0.2) * 60;
  const vy = o.vy ?? H * 0.44 + Math.cos(B * 0.15) * 30;
  const kick = Math.exp(-frac(B) * 5);
  // Dawn sky: pearl core → pink → lilac edges.
  const g = ctx.createRadialGradient(vx, vy, 0, vx, vy, Math.hypot(W, H) * 0.7);
  g.addColorStop(0, '#FFFBF2');
  g.addColorStop(0.28, '#FFE0EC');
  g.addColorStop(0.62, '#F6C6E4');
  g.addColorStop(1, '#D4C2FA');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Soft sunburst behind everything.
  ctx.save();
  ctx.translate(vx, vy);
  ctx.rotate(B * 0.05);
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  for (let i = 0; i < 24; i += 2) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 2600, (i * TAU) / 24, ((i + 1) * TAU) / 24);
    ctx.fill();
  }
  ctx.restore();

  // Warp streaks, streaming out from the vanishing point.
  ctx.save();
  ctx.lineCap = 'round';
  for (let k = 0; k < 64; k++) {
    const a = hash(k * 7.13) * TAU;
    const rr = 0.9 + hash(k * 3.7) * 3.2;
    const zz = ((hash(k * 1.91) * 30 - travel * 1.6 * 1.5) % 30 + 30) % 30 + 0.4;
    const s0 = (rr * 1.4) / zz;
    const s1 = (rr * 1.4) / (zz + 1.4 + 3 * kick);
    const f = smooth(30, 18, zz) * smooth(0.15, 0.5, s0);
    if (f <= 0.01) continue;
    const sc = H * 0.5;
    ctx.strokeStyle = `rgba(255,255,255,${0.9 * f})`;
    ctx.lineWidth = 3 + 6 / zz;
    ctx.beginPath();
    ctx.moveTo(vx + Math.cos(a) * s0 * sc, vy + Math.sin(a) * s0 * sc);
    ctx.lineTo(vx + Math.cos(a) * s1 * sc, vy + Math.sin(a) * s1 * sc);
    ctx.stroke();
  }
  ctx.restore();

  // Gates, far to near.
  const N = 22;
  const D = 1.6;
  const dist = travel;
  const F = H * 0.62;
  ctx.save();
  ctx.lineJoin = 'round';
  for (let k = N - 1; k >= 0; k--) {
    const z = (k + 1 - frac(dist)) * D;
    const gi = k + Math.floor(dist);
    const kind = GATES[Math.floor(hash(gi * 1.37 + 0.5) * GATES.length)];
    const R = (1.35 + 0.35 * hash(gi * 3.1)) * (kind === 'star' ? 1.25 : 1);
    const s = F / z;
    const r = R * s;
    const fog = smooth(N * D * 0.8, N * D * 0.25, z) * smooth(0.35, 1.3, z);
    if (fog <= 0.01) continue;
    const rot = gi * 0.35 + t * 0.6 * (gi % 2 ? 1 : -1);
    const col = RAINBOW[((gi % RAINBOW.length) + RAINBOW.length) % RAINBOW.length];
    const th = (0.06 + 0.035 * kick) * s;
    ctx.save();
    ctx.globalAlpha = fog;
    ctx.translate(vx, vy);
    ctx.rotate(rot);
    gatePath(ctx, kind, r);
    if (gi % 3 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fill();
    }
    ctx.lineWidth = th + Math.max(4, s * 0.035);
    ctx.strokeStyle = KIRA_INK;
    ctx.stroke();
    ctx.lineWidth = th;
    ctx.strokeStyle = col;
    ctx.stroke();
    ctx.lineWidth = th * 0.28;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.stroke();
    // twinkles riding the gate's corners
    if (gi % 2 === 0 && s > 60) {
      const n = kind === 'hex' ? 6 : kind === 'square' ? 4 : 3;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i * TAU) / n;
        const tw = 0.5 + 0.5 * Math.sin(t * 8 + gi + i * 2);
        sparkle(ctx, Math.cos(a) * r, Math.sin(a) * r, (0.08 + 0.06 * tw) * s, '#FFFFFF', 0, null);
      }
    }
    ctx.restore();
  }
  ctx.restore();

  // 七色 lasers from the bottom corners, swinging on the beat.
  if (o.lasers) {
    ctx.save();
    ctx.lineCap = 'round';
    for (let k = 0; k < 10; k++) {
      const sd = k < 5 ? -1 : 1;
      const m = k % 5;
      const ox = W / 2 + sd * W * 0.52;
      const oy = H * 1.05;
      const a = -Math.PI / 2 - sd * (0.18 + 0.16 * m) - 0.3 * Math.sin(B * Math.PI * 0.5 + k * 1.3) * sd;
      const len = H * 1.6;
      const x1 = ox + Math.cos(a) * len;
      const y1 = oy + Math.sin(a) * len;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(x1, y1);
      ctx.globalAlpha = 0.55 + 0.35 * kick;
      ctx.strokeStyle = RAINBOW[k % RAINBOW.length];
      ctx.lineWidth = 16 + 8 * kick;
      ctx.stroke();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    ctx.restore();
  }
  if (o.fade !== undefined && o.fade < 1) {
    ctx.fillStyle = `rgba(255,251,242,${1 - o.fade})`;
    ctx.fillRect(0, 0, W, H);
  }
  return { vx, vy };
}

// ─── transitions ────────────────────────────────────────
/** Concentric rainbow gates rushing out of the centre to cover the frame, then a star
 *  hole punches open from the centre to reveal the next shot. Drawn on its own layer. */
let wipeLayer: HTMLCanvasElement | undefined;
export function gateWipe(ctx: Ctx, W: number, H: number, B: number, start: number, cut: number) {
  const inK = clamp((B - start) / (cut - start));
  const outK = clamp((B - cut) / 0.5);
  if (inK <= 0 || outK >= 1) return;
  if (!wipeLayer) {
    wipeLayer = document.createElement('canvas');
    wipeLayer.width = W;
    wipeLayer.height = H;
  }
  const c = wipeLayer.getContext('2d')!;
  c.clearRect(0, 0, W, H);
  const Rmax = Math.hypot(W, H) * 0.62;
  c.save();
  c.translate(W / 2, H / 2);
  c.rotate(B * 0.8);
  c.lineJoin = 'round';
  const rings = 7;
  for (let i = 0; i < rings; i++) {
    // outer ring first, each smaller ring lands a little later
    const d = i / rings;
    const kin = clamp((inK - d * 0.55) / 0.45);
    const r = Rmax * (1 - d * 0.82) * (1 - (1 - kin) ** 3) * 1.25;
    if (r <= 1) continue;
    gatePath(c, GATES[i % GATES.length], r);
    c.fillStyle = RAINBOW[i % RAINBOW.length];
    c.lineWidth = 16;
    c.strokeStyle = KIRA_INK;
    c.stroke();
    c.fill();
  }
  // white halftone sheen over the rings
  c.globalCompositeOperation = 'source-atop';
  c.rotate(-B * 0.8);
  c.translate(-W / 2, -H / 2);
  halftone(c, 'rgba(255,255,255,0.4)', 40, 14, (x, y) => 1.2 - Math.hypot(x - W * 0.3, y - H * 0.3) / (W * 0.8), W, H, B * 20);
  c.translate(W / 2, H / 2);
  c.rotate(B * 0.8);
  if (outK > 0) {
    c.globalCompositeOperation = 'destination-out';
    gatePath(c, 'star', Rmax * 1.6 * (1 - (1 - outK) ** 3));
    c.fill();
  }
  c.restore();
  ctx.drawImage(wipeLayer, 0, 0);
}

/** Halftone dots swell until they touch, then shrink away. */
export function dotWipe(ctx: Ctx, W: number, H: number, B: number, start: number, cut: number, color: string, color2: string) {
  const cell = 90;
  const inK = clamp((B - start) / (cut - start));
  const outK = clamp((B - cut) / 0.55);
  if (inK <= 0 || outK >= 1) return;
  ctx.save();
  for (const [c, off] of [[color2, 0.08], [color, 0]] as const) {
    halftone(ctx, c, cell, cell * 0.75, (x, y) => {
      const d = (x / W) * 0.6 + (y / H) * 0.4; // sweep from the top-left
      const a = clamp((inK - d * 0.5 + off) / 0.5);
      const b = clamp((outK - d * 0.5) / 0.5);
      return a * (1 - b);
    }, W, H);
  }
  ctx.restore();
}
