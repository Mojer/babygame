// Beat-locked promo renderer for 寶貝遊樂場 茜の篇, KIRAKIRA edition.
//
// Same beat clock and scenes as ../promo, plus a pastel take on the KIRAKIRA MV
// look: a rainbow gate tunnel (one gate passes per beat) with warp streaks and
// rainbow lasers, pop-art halftone dots, comic starbursts and twinkle stars.
// 茜 is the game's char_akane.glb (from her character sheet).
//
// drawFrame(B) is a pure function of the beat number B: every pose, camera move,
// caption and particle is computed from B and the events in score.json (the
// same list audio.py plays). frame f → B = f / fps / (60 / bpm). 128 BPM,
// 64 beats = 30 s, two bars (8 beats) per shot.
//
// Layers per frame: 2D motion-graphic background → toon/outline 3D diorama
// (real room GLBs from the game, transparent clear) → 2D captions, particles,
// speech bubbles → shape wipe between shots.

import * as THREE from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { loadGLB, toonify } from '../src/core/assets';
import { Room, type Interactable } from '../src/scene/room';
import { AKANE_PINK, toon } from './akane';
import score from './score.json';
import { dotWipe, gateWipe, halftone, halftoneCorners, KIRA_INK, popBurst, rainbowTunnel, RAINBOW, sparkle, speedLines } from './kira';

const W = score.width;
const H = score.height;
const SPB = 60 / score.bpm;
export const FRAMES = Math.round(score.beats * SPB * score.fps);
export const beatAt = (f: number) => f / score.fps / SPB;

const FONT = "'jf open 粉圓 2.1', 'jf-openhuninn-2.1', 'Huninn', 'GenSenRounded2 TW', 'PingFang TC', sans-serif";
const INK = '#4D3329';
const TAU = Math.PI * 2;

type Ev = { beat: number; type: string; [k: string]: any };
const EV = score.events as Ev[];
const of = (type: string) => EV.filter((e) => e.type === type);

// ─── Math ────────────────────────────────────────────────
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const inv = (a: number, b: number, v: number) => clamp((v - a) / (b - a));
const frac = (x: number) => x - Math.floor(x);
const outCubic = (t: number) => 1 - (1 - t) ** 3;
const inCubic = (t: number) => t * t * t;
const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const outExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));
const outBack = (t: number, s = 1.9) => (t <= 0 ? 0 : 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2);
const outElastic = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1);
const hash = (n: number) => frac(Math.sin(n * 127.1 + 311.7) * 43758.5453);
/** 1 on the beat, decaying to 0 before the next one. */
const kick = (B: number, every = 1, sharp = 5) => (B < 0 ? 0 : Math.exp(-frac(B / every) * every * sharp));
/** Pop-in scale for something appearing at beat b0. */
const pop = (B: number, b0: number, len = 0.35) => outBack(inv(b0, b0 + len, B));
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ─── Puppet: deterministic pose for a cast member ────────
interface Limb {
  obj: THREE.Object3D;
  base: THREE.Vector3;
  side: number;
}
interface Pose {
  at: THREE.Vector3;
  yaw: number;
  /** Walk cycle phase (radians); one step per half cycle. */
  walk?: number;
  /** 0..1 through a hop (squash only; the caller moves `at`). */
  hop?: number;
  /** 0..1 through a happy jump. */
  happy?: number;
  sit?: 'sit' | 'bath';
  rock?: number;
  /** Beats since the wave started. */
  wave?: number;
}

class Puppet {
  readonly root = new THREE.Group();
  private readonly body = new THREE.Group();
  private legs: Limb[] = [];
  private arms: Limb[] = [];
  private eyes: THREE.Object3D[] = [];
  private sprout?: THREE.Group;
  height = 0.7;
  private readonly seed: number;

  constructor(
    readonly key: string,
    model: THREE.Object3D,
  ) {
    this.seed = hash(key.length * 7.3 + key.charCodeAt(0));
    this.height = new THREE.Box3().setFromObject(model).max.y;
    this.body.add(model);
    this.root.add(this.body);
    model.traverse((o) => {
      const n = o.name;
      // Match the game (character.ts HIDE_BLUSH): cheek blush is hidden for now.
      if (n.includes('_blush_')) o.visible = false;
      if (/_leg_[LR]$/.test(n)) this.legs.push({ obj: o, base: o.position.clone(), side: n.endsWith('L') ? -1 : 1 });
      if (/_arm_[LR]$/.test(n)) this.arms.push({ obj: o, base: o.position.clone(), side: n.endsWith('L') ? -1 : 1 });
      if (/_eye_(hi_)?-?1$/.test(n)) this.eyes.push(o);
    });
    const sproutParts: THREE.Object3D[] = [];
    model.traverse((o) => o.name.includes('_sprout') && sproutParts.push(o));
    if (sproutParts.length) {
      model.updateMatrixWorld(true);
      const box = new THREE.Box3();
      sproutParts.forEach((o) => box.expandByObject(o));
      const g = new THREE.Group();
      box.getCenter(g.position);
      g.position.y = box.min.y;
      model.add(g);
      g.updateMatrixWorld();
      sproutParts.forEach((o) => g.attach(o));
      this.sprout = g;
    }
  }

  static async load(key: string) {
    const gltf = await loadGLB(`/models/char_${key}.glb`);
    toonify(gltf.scene, { castShadow: true, receiveShadow: false });
    return new Puppet(key, gltf.scene);
  }

  pose(p: Pose, B: number) {
    const t = B * SPB;
    let bob = 0;
    let tilt = 0;
    let squash = 1 + Math.sin(t * 2.4 + this.seed * 9) * 0.015;
    let swing = 0;
    if (p.walk !== undefined) {
      bob = Math.abs(Math.sin(p.walk)) * 0.035;
      tilt = Math.sin(p.walk) * 0.09;
      swing = Math.sin(p.walk);
      squash = 1;
    }
    if (p.hop !== undefined) squash = 1 + Math.sin(Math.PI * clamp(p.hop)) * 0.09;
    const happy = p.happy !== undefined && p.happy >= 0 && p.happy < 1;
    if (happy) {
      const k = p.happy!;
      bob += Math.abs(Math.sin(k * TAU)) * 0.12;
      squash *= 1 + Math.sin(k * Math.PI * 4) * 0.06;
    }
    this.root.visible = true;
    this.root.position.copy(p.at);
    this.root.rotation.set(0, p.yaw, 0);
    const b = this.body;
    b.position.y = bob + (p.sit ? (p.sit === 'bath' ? 0 : -0.1) : 0);
    b.rotation.set(p.rock ?? 0, 0, tilt);
    b.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
    if (this.sprout) this.sprout.rotation.z = Math.sin(t * 2.2) * 0.12 + tilt * 1.5;

    for (const l of this.legs) {
      l.obj.position.copy(l.base);
      l.obj.position.z += p.sit ? 0.07 : swing * l.side * 0.035;
      if (p.sit) l.obj.position.y += 0.035;
    }
    const cheer = happy ? 0.08 : 0;
    for (const a of this.arms) {
      a.obj.position.copy(a.base);
      a.obj.position.z -= swing * a.side * 0.03;
      a.obj.position.y += cheer;
      if (p.wave !== undefined && p.wave >= 0 && a.side > 0) {
        const up = outBack(clamp(p.wave / 0.3));
        a.obj.position.y += 0.15 * up;
        a.obj.position.x += 0.03 * up + Math.sin(p.wave * Math.PI * 2) * 0.035 * up;
        a.obj.position.z += 0.02 * up;
      }
    }
    const closed = frac(t / 2.7 + this.seed) > 0.955;
    for (const e of this.eyes) e.scale.y = closed ? 0.15 : 1;
  }

  headTop(out = new THREE.Vector3()) {
    this.root.updateMatrixWorld(true);
    return this.body.getWorldPosition(out).add(V(0, this.height + 0.08, 0));
  }
}

// ─── Shared 2D helpers ───────────────────────────────────
type Ctx = CanvasRenderingContext2D;
type ShapeKind = 'circle' | 'star' | 'heart' | 'flower' | 'ring' | 'plus' | 'tri' | 'cloud' | 'squiggle' | 'drop' | 'sparkle';

function shapePath(ctx: Ctx, kind: ShapeKind, r: number) {
  ctx.beginPath();
  switch (kind) {
    case 'circle':
    case 'ring':
      ctx.arc(0, 0, r, 0, TAU);
      break;
    case 'star':
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const rr = i % 2 ? r * 0.5 : r;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      break;
    case 'heart': {
      const s = r / 1.05;
      ctx.moveTo(0, s * 0.95);
      ctx.bezierCurveTo(-s * 1.35, s * 0.1, -s * 0.95, -s * 1.05, 0, -s * 0.45);
      ctx.bezierCurveTo(s * 0.95, -s * 1.05, s * 1.35, s * 0.1, 0, s * 0.95);
      ctx.closePath();
      break;
    }
    case 'flower':
      for (let i = 0; i < 5; i++) {
        const a = (i * TAU) / 5 - Math.PI / 2;
        ctx.moveTo(Math.cos(a) * r * 0.55 + r * 0.45, Math.sin(a) * r * 0.55);
        ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.45, 0, TAU);
      }
      break;
    case 'plus': {
      const a = r * 0.36;
      ctx.moveTo(-a, -r);
      ctx.lineTo(a, -r);
      ctx.lineTo(a, -a);
      ctx.lineTo(r, -a);
      ctx.lineTo(r, a);
      ctx.lineTo(a, a);
      ctx.lineTo(a, r);
      ctx.lineTo(-a, r);
      ctx.lineTo(-a, a);
      ctx.lineTo(-r, a);
      ctx.lineTo(-r, -a);
      ctx.lineTo(-a, -a);
      ctx.closePath();
      break;
    }
    case 'tri':
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i * TAU) / 3;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      break;
    case 'cloud':
      ctx.arc(-r * 0.5, r * 0.1, r * 0.45, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(-r * 0.05, -r * 0.25, r * 0.55, Math.PI, 0);
      ctx.arc(r * 0.55, r * 0.05, r * 0.42, Math.PI * 1.4, Math.PI * 0.5);
      ctx.closePath();
      break;
    case 'drop':
      ctx.moveTo(0, -r);
      ctx.bezierCurveTo(r * 0.9, -r * 0.1, r * 0.75, r, 0, r);
      ctx.bezierCurveTo(-r * 0.75, r, -r * 0.9, -r * 0.1, 0, -r);
      break;
    case 'squiggle':
      ctx.moveTo(-r, 0);
      for (let i = 1; i <= 16; i++) ctx.lineTo(-r + (i / 16) * 2 * r, Math.sin((i / 16) * TAU * 1.5) * r * 0.3);
      break;
  }
}

function shape(ctx: Ctx, kind: ShapeKind, x: number, y: number, r: number, rot: number, fill: string, line = 6, ink = INK) {
  if (r <= 0.5) return;
  if (kind === 'sparkle') return sparkle(ctx, x, y, r * 1.2, fill, rot * 0.25, line ? ink : null);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  shapePath(ctx, kind, r);
  ctx.lineJoin = ctx.lineCap = 'round';
  if (kind === 'ring' || kind === 'squiggle') {
    ctx.lineWidth = r * (kind === 'ring' ? 0.42 : 0.3) + line * 2;
    ctx.strokeStyle = ink;
    if (line) ctx.stroke();
    ctx.lineWidth = r * (kind === 'ring' ? 0.42 : 0.3);
    ctx.strokeStyle = fill;
    ctx.stroke();
  } else {
    if (line) {
      ctx.lineWidth = line * 2;
      ctx.strokeStyle = ink;
      ctx.stroke();
    }
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.restore();
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

interface TextOpts {
  size: number;
  fill?: string;
  stroke?: string;
  strokeW?: number;
  ink?: string;
  inkW?: number;
  align?: CanvasTextAlign;
  shadow?: number;
}
function text(ctx: Ctx, s: string, x: number, y: number, o: TextOpts) {
  ctx.save();
  ctx.font = `${o.size}px ${FONT}`;
  ctx.textAlign = o.align ?? 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const inkW = o.inkW ?? o.size * 0.16;
  if (o.shadow) {
    ctx.fillStyle = 'rgba(77,51,41,0.35)';
    ctx.strokeStyle = 'rgba(77,51,41,0.35)';
    ctx.lineWidth = inkW;
    ctx.strokeText(s, x, y + o.shadow);
    ctx.fillText(s, x, y + o.shadow);
  }
  if (inkW > 0) {
    ctx.lineWidth = inkW;
    ctx.strokeStyle = o.ink ?? INK;
    ctx.strokeText(s, x, y);
  }
  if (o.stroke) {
    ctx.lineWidth = o.strokeW ?? o.size * 0.08;
    ctx.strokeStyle = o.stroke;
    ctx.strokeText(s, x, y);
  }
  ctx.fillStyle = o.fill ?? '#fff';
  ctx.fillText(s, x, y);
  ctx.restore();
}

// ─── Background motion graphics ─────────────────────────
interface Theme {
  bg: string;
  bg2: string;
  pattern: 'rays' | 'dots' | 'stripes' | 'checker' | 'bubbles' | 'zigzag';
  colors: string[];
  kinds: ShapeKind[];
  /** Pop-art halftone colour for the corner dot fields. */
  dots?: string;
}
const THEMES: Record<string, Theme> = {
  intro: { bg: '#FFD3DC', bg2: '#FFE3E8', pattern: 'rays', colors: ['#FFFFFF', '#FFE08A', '#F28C7A', '#A9D3F2', '#A5DCC8', '#C9B8E8'], kinds: ['star', 'heart', 'sparkle', 'flower', 'ring', 'plus'], dots: '#F7B3C4' },
  lawn: { bg: '#BEE4F6', bg2: '#D3EEFA', pattern: 'dots', colors: ['#FFFFFF', '#A3D67E', '#FFE08A', '#F7A8B8', '#FFF3C4'], kinds: ['cloud', 'flower', 'sparkle', 'star', 'squiggle'], dots: '#9ED3EE' },
  living: { bg: '#FFDDC2', bg2: '#FFE9D6', pattern: 'stripes', colors: ['#FFFFFF', '#8FC7B5', '#F28C7A', '#FFE08A', '#C9B8E8'], kinds: ['heart', 'ring', 'sparkle', 'plus', 'circle'], dots: '#FBC3A0' },
  cafe: { bg: '#FBE7B5', bg2: '#FFF1CC', pattern: 'checker', colors: ['#FFFFFF', '#C98B5A', '#F7A8B8', '#E8665A', '#A5DCC8'], kinds: ['heart', 'sparkle', 'star', 'drop', 'ring'], dots: '#F2D08A' },
  bathroom: { bg: '#C9E6F8', bg2: '#DCF0FC', pattern: 'bubbles', colors: ['#FFFFFF', '#A9D3F2', '#FFE08A', '#A5DCC8', '#F7A8B8'], kinds: ['ring', 'sparkle', 'drop', 'star', 'plus'], dots: '#A9D3F2' },
  together: { bg: '#C6EAD6', bg2: '#DAF3E5', pattern: 'rays', colors: ['#FFFFFF', '#FFE08A', '#F28C7A', '#A9D3F2', '#C9B8E8'], kinds: ['star', 'heart', 'flower', 'sparkle', 'squiggle'], dots: '#A5DCC0' },
  end: { bg: '#FFD3DC', bg2: '#FFE3E8', pattern: 'rays', colors: ['#FFFFFF', '#FFE08A', AKANE_PINK, '#A9D3F2', '#A5DCC8', '#C9B8E8'], kinds: ['star', 'heart', 'flower', 'ring', 'sparkle', 'plus'], dots: '#F7B3C4' },
};

function drawPattern(ctx: Ctx, th: Theme, B: number, cx = W / 2, cy = H * 0.55) {
  ctx.fillStyle = th.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.fillStyle = th.bg2;
  const k = kick(B);
  switch (th.pattern) {
    case 'rays': {
      ctx.translate(cx, cy);
      ctx.rotate(B * 0.06);
      const n = 18;
      for (let i = 0; i < n; i += 2) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 2400, (i * TAU) / n, ((i + 1) * TAU) / n);
        ctx.fill();
      }
      break;
    }
    case 'dots': {
      const s = 110;
      const off = (B * 14) % s;
      for (let y = -s; y < H + s; y += s)
        for (let x = -s; x < W + s; x += s) {
          const odd = Math.round(y / s) % 2 ? s / 2 : 0;
          ctx.beginPath();
          ctx.arc(x + odd + off, y + off, 16 + k * 6, 0, TAU);
          ctx.fill();
        }
      break;
    }
    case 'stripes': {
      ctx.rotate(-0.5);
      const s = 120;
      const off = (B * 20) % (s * 2);
      for (let x = -2400; x < 2400; x += s * 2) ctx.fillRect(x + off, -2000, s, 4000);
      break;
    }
    case 'checker': {
      ctx.translate(W / 2, H / 2);
      ctx.rotate(0.35);
      const s = 130;
      const off = (B * 16) % (s * 2);
      for (let y = -1400; y < 1400; y += s)
        for (let x = -1600; x < 1600; x += s) if ((Math.round(x / s) + Math.round(y / s)) % 2 === 0) ctx.fillRect(x + off, y, s, s);
      break;
    }
    case 'bubbles': {
      for (let i = 0; i < 26; i++) {
        const x = hash(i * 3.1) * W;
        const sp = 40 + hash(i * 5.7) * 60;
        const y = H + 100 - ((B * sp + hash(i) * (H + 200)) % (H + 200));
        const r = 18 + hash(i * 9.9) * 50;
        ctx.lineWidth = 8;
        ctx.strokeStyle = th.bg2;
        ctx.beginPath();
        ctx.arc(x + Math.sin(B + i) * 20, y, r, 0, TAU);
        ctx.stroke();
      }
      break;
    }
    case 'zigzag':
      break;
  }
  ctx.restore();
  // Pop-art frame: halftone dots swelling out of two opposite corners.
  if (th.dots) halftoneCorners(ctx, th.dots, W, H, B, [[1, 0], [0, 1]], 0.62);
}

/** Big four-point twinkles: each lights up on its beat and fades before the next. */
function twinkles(ctx: Ctx, B: number, seed: number, n = 6, avoid?: { x: number; y: number; r: number }) {
  for (let i = 0; i < n; i++) {
    const beat = Math.floor(B + i / n);
    const h = (k: number) => hash(seed * 17 + beat * 3.1 + i * 7.7 + k);
    let x = 80 + h(1) * (W - 160);
    let y = 80 + h(2) * (H - 160);
    if (avoid && Math.hypot(x - avoid.x, y - avoid.y) < avoid.r) x = x < avoid.x ? avoid.x - avoid.r : avoid.x + avoid.r;
    const k = frac(B + i / n);
    const s = Math.sin(Math.PI * Math.min(1, k * 1.6)) * (k < 0.625 ? 1 : 0);
    sparkle(ctx, x, y, (30 + h(3) * 34) * s, h(4) < 0.5 ? '#FFFFFF' : '#FFF3B0', k * 1.5);
  }
}

/** Floating outlined shapes that pop in at shot start and pulse on every beat. */
function drawShapes(ctx: Ctx, th: Theme, B: number, b0: number, seed: number, n = 26, avoid?: { x: number; y: number; r: number }) {
  for (let i = 0; i < n; i++) {
    const h = (k: number) => hash(seed * 31.7 + i * 7.13 + k);
    let x = h(1) * W;
    let y = h(2) * H;
    if (avoid) {
      const dx = x - avoid.x;
      const dy = y - avoid.y;
      const d = Math.hypot(dx, dy);
      if (d < avoid.r) {
        x = avoid.x + (dx / (d || 1)) * avoid.r;
        y = avoid.y + (dy / (d || 1)) * avoid.r;
      }
    }
    const kind = th.kinds[Math.floor(h(3) * th.kinds.length)];
    const color = th.colors[Math.floor(h(4) * th.colors.length)];
    const r = 22 + h(5) * 46;
    const off = h(6) < 0.5 ? 0 : 0.5; // half the shapes pulse on the off-beat
    const dir = h(7) < 0.5 ? -1 : 1;
    const s = pop(B, b0 + i * 0.035, 0.4) * (1 + 0.28 * kick(B + off));
    // Rotation ticks on each beat: an eighth turn that snaps with overshoot.
    const beatN = Math.floor(B + off);
    const rot = h(8) * TAU + dir * (beatN + outBack(frac(B + off) * 3 > 1 ? 1 : frac(B + off) * 3)) * (Math.PI / 8);
    const fy = Math.sin(B * 0.8 + i) * 10;
    shape(ctx, kind, x, y + fy, r * s, rot, color, 5);
  }
}

// ─── Particles (2D, anchored to projected 3D points) ────
type PKind = 'star' | 'heart' | 'note' | 'bubble' | 'drop' | 'steam' | 'confetti';
function burst(ctx: Ctx, kind: PKind, x: number, y: number, B: number, b0: number, n: number, seed: number, spread = 1) {
  const t = (B - b0) * SPB;
  if (t < 0) return;
  const life = kind === 'bubble' ? 2.4 : kind === 'steam' ? 1.4 : kind === 'confetti' ? 2.2 : 1.1;
  if (t > life) return;
  for (let i = 0; i < n; i++) {
    const h = (k: number) => hash(seed * 13.3 + i * 3.7 + k);
    let px = x;
    let py = y;
    const a = -Math.PI / 2 + (h(1) - 0.5) * Math.PI * 1.3 * spread;
    const sp = (280 + h(2) * 420) * (kind === 'bubble' || kind === 'steam' ? 0.35 : 1);
    const g = kind === 'bubble' || kind === 'steam' ? -40 : kind === 'confetti' ? 500 : 900;
    px += Math.cos(a) * sp * t + (kind === 'bubble' ? Math.sin(t * 5 + i) * 18 : 0);
    py += Math.sin(a) * sp * t + 0.5 * g * t * t;
    const k = t / life;
    const s = outBack(clamp(t / 0.18)) * (1 - inCubic(k));
    const rot = (h(3) - 0.5) * 2 + t * (h(4) - 0.5) * 8;
    switch (kind) {
      case 'star':
        shape(ctx, 'star', px, py, (18 + h(5) * 16) * s, rot, h(6) < 0.5 ? '#FFE08A' : '#FFF3C4', 4);
        break;
      case 'heart':
        shape(ctx, 'heart', px, py, (18 + h(5) * 14) * s, rot * 0.3, h(6) < 0.5 ? '#F7A8B8' : AKANE_PINK, 4);
        break;
      case 'note':
        ctx.save();
        ctx.globalAlpha = clamp(s);
        text(ctx, h(6) < 0.5 ? '♪' : '♫', px, py, { size: 58 * clamp(s + 0.2), fill: h(7) < 0.5 ? '#6FA8DC' : '#F28C7A', inkW: 9 });
        ctx.restore();
        break;
      case 'bubble': {
        const r = (14 + h(5) * 22) * s;
        if (r < 1) break;
        ctx.save();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#6FA8DC';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.beginPath();
        ctx.arc(px, py, r, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px - r * 0.35, py - r * 0.35, r * 0.25, 0, TAU);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'drop':
        shape(ctx, 'drop', px, py, (12 + h(5) * 8) * s, Math.atan2(Math.sin(a) * sp + g * t, Math.cos(a) * sp) - Math.PI / 2 + Math.PI, '#A9D3F2', 3);
        break;
      case 'steam':
        ctx.save();
        ctx.globalAlpha = 0.9 * (1 - k);
        shape(ctx, 'cloud', px, py, (26 + h(5) * 16) * (0.6 + k), 0, '#FFFFFF', 4);
        ctx.restore();
        break;
      case 'confetti': {
        const cols = ['#FFE08A', '#F28C7A', '#A5DCC8', '#A9D3F2', '#C9B8E8', AKANE_PINK];
        ctx.save();
        ctx.translate(px + Math.sin(t * 6 + i) * 30, py);
        ctx.rotate(rot * 3);
        ctx.scale(1, Math.cos(t * 9 + i));
        ctx.fillStyle = cols[i % cols.length];
        ctx.fillRect(-10, -6, 20, 12);
        ctx.restore();
        break;
      }
    }
  }
}

function bubble(ctx: Ctx, s: string, x: number, y: number, k: number, size = 46, side: 'up' | 'left' = 'up') {
  if (k <= 0.01) return;
  ctx.save();
  ctx.font = `${size}px ${FONT}`;
  const w = ctx.measureText(s).width + size * 1.1;
  const h = size * 1.7;
  ctx.translate(x, y);
  ctx.scale(k, k);
  const bx = side === 'up' ? -w / 2 : 30;
  const by = side === 'up' ? -h - 26 : -h / 2 - 50;
  ctx.lineJoin = 'round';
  roundRect(ctx, bx, by, w, h, h / 2);
  ctx.moveTo(-16, by + h - 2);
  if (side === 'up') {
    ctx.moveTo(-18, by + h - 4);
    ctx.lineTo(0, 0);
    ctx.lineTo(18, by + h - 4);
  } else {
    ctx.moveTo(bx + 30, by + h - 6);
    ctx.lineTo(0, 0);
    ctx.lineTo(bx + 70, by + h - 6);
  }
  ctx.lineWidth = 12;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.fill();
  text(ctx, s, bx + w / 2, by + h / 2 + 2, { size, fill: INK, inkW: 0 });
  ctx.restore();
}

// ─── Renderer ────────────────────────────────────────────
export async function createPromo(canvas: HTMLCanvasElement) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const gl = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  gl.setPixelRatio(1);
  gl.setSize(W, H, false);
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFShadowMap;
  gl.toneMapping = THREE.NoToneMapping;
  gl.setClearColor(0x000000, 0);
  const outline = new OutlineEffect(gl, { defaultThickness: 0.0035, defaultColor: [0.3, 0.2, 0.16], defaultAlpha: 0.9 });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
  const hemi = new THREE.HemisphereLight(0xfff6e8, 0xe0bf98, 1.9);
  const sun = new THREE.DirectionalLight(0xfff1dc, 1.6);
  sun.position.set(3, 7, 4.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -5, bottom: -5, right: 5, top: 5, near: 1, far: 20 });
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.02;
  scene.add(hemi, sun);

  // Rooms from the game, plus a round stage for the title / cast cards.
  const ROOM_FILES = { lawn: 'room_lawn', living: 'room_living', cafe: 'room_cafe', bathroom: 'room_bathroom' } as const;
  type RoomKey = keyof typeof ROOM_FILES;
  const CAST = ['akane', 'capybara', 'panda', 'bunny', 'cat'] as const;
  type CastKey = (typeof CAST)[number];
  const [roomList, castList] = await Promise.all([
    Promise.all(Object.values(ROOM_FILES).map((f) => Room.load(`/models/${f}.glb`))),
    Promise.all(CAST.map((k) => Puppet.load(k))),
  ]);
  const rooms = Object.fromEntries(Object.keys(ROOM_FILES).map((k, i) => [k, roomList[i]])) as Record<RoomKey, Room>;
  const cast = Object.fromEntries(CAST.map((k, i) => [k, castList[i]])) as Record<CastKey, Puppet>;
  for (const r of roomList) scene.add(r.root);
  for (const c of castList) scene.add(c.root);

  const stage = new THREE.Group();
  {
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 48), toon('#FFFDF7'));
    top.position.y = -0.04;
    top.receiveShadow = true;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.6, 0.12, 48), toon('#F7A8B8'));
    rim.position.y = -0.12;
    stage.add(top, rim);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), toon(i % 2 ? '#FFE08A' : '#FFFFFF'));
      dot.position.set(Math.cos(a) * 0.64, -0.12, Math.sin(a) * 0.64);
      stage.add(dot);
    }
  }
  scene.add(stage);

  // Snapshot every animatable thing so each frame starts from the rest state.
  const rest: { o: THREE.Object3D; p: THREE.Vector3; r: THREE.Euler; s: THREE.Vector3 }[] = [];
  const matRest: { m: THREE.MeshToonMaterial; e: THREE.Color; i: number }[] = [];
  for (const r of roomList)
    for (const it of r.interactables) {
      for (const o of [it.pivot, ...it.parts]) rest.push({ o, p: o.position.clone(), r: o.rotation.clone(), s: o.scale.clone() });
      for (const p of it.parts) {
        const m = p.material as THREE.MeshToonMaterial;
        matRest.push({ m, e: m.emissive.clone(), i: m.emissiveIntensity });
      }
    }
  const resetAll = () => {
    for (const x of rest) {
      x.o.position.copy(x.p);
      x.o.rotation.copy(x.r);
      x.o.scale.copy(x.s);
    }
    for (const x of matRest) {
      x.m.emissive.copy(x.e);
      x.m.emissiveIntensity = x.i;
    }
    for (const r of roomList) r.root.visible = false;
    for (const c of castList) c.root.visible = false;
    stage.visible = false;
  };

  const find = (room: RoomKey, pred: (it: Interactable) => boolean) => rooms[room].interactables.find(pred);
  const named = (room: RoomKey, name: string) => {
    const it = find(room, (i) => i.name === name);
    if (!it) console.warn('missing', room, name, rooms[room].interactables.map((i) => i.name));
    return it;
  };
  const snapPos = (it?: Interactable) => (it?.snap ? it.snap.getWorldPosition(new THREE.Vector3()) : (it?.pivot.position.clone() ?? V(0, 0, 0)));
  const snapYaw = (it?: Interactable) =>
    it?.snap ? new THREE.Euler().setFromQuaternion(it.snap.getWorldQuaternion(new THREE.Quaternion()), 'YXZ').y : 0;
  const topOf = (it?: Interactable) => {
    if (!it) return V(0, 0, 0);
    const b = new THREE.Box3().setFromObject(it.pivot);
    return V((b.min.x + b.max.x) / 2, b.max.y, (b.min.z + b.max.z) / 2);
  };
  const jelly = (it: Interactable | undefined, B: number, b0: number, amp = 0.15, len = 0.9) => {
    if (!it || B < b0) return;
    const k = clamp((B - b0) * SPB / len);
    const s = Math.sin(k * Math.PI * 3) * (1 - k) * amp;
    it.pivot.scale.set(1 + s, 1 - s, 1 + s);
  };

  // Layout pulled from the room GLBs.
  const L = {
    lawnDoor: rooms.lawn.door('DOOR_north')?.position.clone() ?? V(1, 0, -2.5),
    ladder: rooms.lawn.fxPoints.get('slide_ladder') ?? V(-1.3, 0, -1.9),
    slideTop: snapPos(named('lawn', 'slide')),
    ramp: ['slide_0', 'slide_1', 'slide_2'].map((k) => rooms.lawn.fxPoints.get(k) ?? V(0, 0, 0)),
    horse: named('lawn', 'horse'),
    car: named('lawn', 'car'),
    livingDoor: rooms.living.door('DOOR_south')?.position.clone() ?? V(1, 0, 2.5),
    sofa: find('living', (i) => i.name.startsWith('sofa_seat') && !!i.snap),
    sofas: rooms.living.interactables.filter((i) => i.name.startsWith('sofa_seat')),
    beanbags: rooms.living.interactables.filter((i) => i.name.startsWith('beanbag')),
    tv: named('living', 'tv'),
    stools: rooms.cafe.interactables.filter((i) => i.action === 'sit' && !!i.snap),
    coffee: named('cafe', 'coffee_machine'),
    cake: named('cafe', 'cake'),
    barista: (() => {
      let p: THREE.Vector3 | undefined;
      rooms.cafe.root.traverse((o) => o.name === 'SNAP_barista' && (p = o.getWorldPosition(new THREE.Vector3())));
      return p ?? V(-2.1, 0, -2.1);
    })(),
    tub: named('bathroom', 'tub'),
    duck: named('bathroom', 'duck'),
    bench: named('bathroom', 'bench'),
    stepStool: named('bathroom', 'step_stool'),
  };
  (window as any).__layout = {
    rooms: Object.fromEntries(
      Object.entries(rooms).map(([k, r]) => [
        k,
        {
          ints: r.interactables.map((i) => ({ n: i.name, a: i.action, p: i.pivot.position.toArray().map((v) => +v.toFixed(2)), snap: i.snap ? snapPos(i).toArray().map((v) => +v.toFixed(2)) : null })),
          doors: r.doors.map((d) => ({ n: d.name, p: d.position.toArray().map((v) => +v.toFixed(2)) })),
          fx: [...r.fxPoints].map(([k2, v]) => [k2, v.toArray().map((x) => +x.toFixed(2))]),
        },
      ]),
    ),
  };

  // ── camera ────────────────────────────────────────────
  const setCam = (target: THREE.Vector3, yawDeg: number, pitchDeg: number, dist: number, fov = 30, shiftX = 0) => {
    const y = (yawDeg * Math.PI) / 180;
    const p = (pitchDeg * Math.PI) / 180;
    camera.fov = fov;
    camera.position.set(target.x + Math.sin(y) * Math.cos(p) * dist, target.y + Math.sin(p) * dist, target.z + Math.cos(y) * Math.cos(p) * dist);
    camera.lookAt(target);
    if (shiftX) camera.setViewOffset(W, H, -shiftX, 0, W, H);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  };
  const project = (v: THREE.Vector3) => {
    const p = v.clone().project(camera);
    return { x: ((p.x + 1) / 2) * W, y: ((1 - p.y) / 2) * H };
  };

  // ── choreography helpers ─────────────────────────────
  /** Walk from a to b over [b0, b1]; steps land on eighth notes. */
  const walkBetween = (a: THREE.Vector3, b: THREE.Vector3, b0: number, b1: number, B: number): Pose => {
    const k = inOutCubic(inv(b0, b1, B));
    const at = a.clone().lerp(b, k).setY(0);
    const yaw = Math.atan2(b.x - a.x, b.z - a.z);
    const moving = B > b0 && B < b1;
    return { at, yaw, walk: moving ? B * Math.PI * 2 : undefined };
  };
  const hopBetween = (a: THREE.Vector3, b: THREE.Vector3, b0: number, b1: number, B: number, arc = 0.3) => {
    const k = inv(b0, b1, B);
    const at = a.clone().lerp(b, k);
    at.y += Math.sin(Math.PI * k) * arc;
    return { at, k };
  };
  const faceCam = (at: THREE.Vector3) => Math.atan2(camera.position.x - at.x, camera.position.z - at.z);
  const happyAt = (B: number, b0: number, len = 0.9) => (B >= b0 && (B - b0) * SPB < len ? ((B - b0) * SPB) / len : undefined);
  const boingsFor = (who: string) => of('boing').filter((e) => e.who === who).map((e) => e.beat);
  /** Hop in place on every `boing` event for this character (together shot). */
  const hopInPlace = (who: string, B: number) => {
    for (const b0 of boingsFor(who)) {
      const k = inv(b0, b0 + 0.5, B);
      if (k > 0 && k < 1) return { y: Math.sin(Math.PI * k) * 0.28, k };
    }
    return { y: 0, k: undefined as number | undefined };
  };

  // ── shots ─────────────────────────────────────────────
  interface ShotOut {
    theme: Theme;
    seed: number;
    avoid?: { x: number; y: number; r: number };
    fg?: () => void;
    bgExtra?: () => void;
    /** Replaces the themed pattern (tunnel shots). */
    bg?: () => void;
  }

  const letters = of('letter');
  const LETTER_COLORS = ['#F28C7A', '#FFB84D', '#7CC47F', '#6FA8DC', '#9C7BC4'];
  const drawTitle = (B: number, cy: number, size: number, appear: (i: number) => number) => {
    const gap = size * 1.02;
    const x0 = W / 2 - (gap * (letters.length - 1)) / 2;
    letters.forEach((e, i) => {
      const b0 = appear(i);
      const k = inv(b0, b0 + 0.4, B);
      if (k <= 0) return;
      const drop = (1 - outBack(k, 2.2)) * -260;
      const sq = 1 + Math.sin(clamp((B - b0 - 0.25) / 0.4) * Math.PI) * 0.12 * (k >= 1 ? 1 : 0);
      const bob = -kick(B + i * 0.12, 1, 6) * 14 * (k >= 1 ? 1 : 0);
      ctx.save();
      ctx.translate(x0 + i * gap, cy + drop + bob);
      ctx.rotate((i % 2 ? 1 : -1) * 0.07 + Math.sin(B * Math.PI * 0.5 + i) * 0.03);
      ctx.scale(1 / sq, sq);
      text(ctx, e.text, 0, 0, { size, fill: LETTER_COLORS[i], stroke: '#fff', strokeW: size * 0.2, inkW: size * 0.32, shadow: 14 });
      ctx.restore();
    });
  };
  const drawBadge = (B: number, b0: number, x: number, y: number, size = 78) => {
    const k = inv(b0, b0 + 0.45, B);
    if (k <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(lerp(-0.6, -0.06, outElastic(k)) + Math.sin(B * Math.PI) * 0.02);
    const s = outBack(k) * (1 + kick(B, 1, 7) * 0.04);
    ctx.scale(s, s);
    ctx.font = `${size}px ${FONT}`;
    const w = ctx.measureText('茜の篇').width + size * 1.4;
    const h = size * 1.55;
    // ribbon tails
    for (const d of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(d * (w / 2 - 10), -h * 0.28);
      ctx.lineTo(d * (w / 2 + 60), -h * 0.3);
      ctx.lineTo(d * (w / 2 + 34), h * 0.12);
      ctx.lineTo(d * (w / 2 + 60), h * 0.5);
      ctx.lineTo(d * (w / 2 - 10), h * 0.4);
      ctx.closePath();
      ctx.lineJoin = 'round';
      ctx.lineWidth = 12;
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.fillStyle = '#B8324A';
      ctx.fill();
    }
    roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
    ctx.lineWidth = 12;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.fillStyle = AKANE_PINK;
    ctx.fill();
    roundRect(ctx, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, h / 2);
    ctx.setLineDash([14, 12]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFD3DC';
    ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, '茜の篇', 0, 4, { size, fill: '#fff', inkW: 0 });
    ctx.restore();
  };

  const caption = (B: number, e: Ev, shotEnd: number) => {
    const k = inv(e.beat + 0.1, e.beat + 0.5, B);
    const out = inv(shotEnd - 0.6, shotEnd - 0.4, B);
    if (k > 0) {
      ctx.save();
      const x = lerp(-520, 70, outBack(k)) - inCubic(out) * 600;
      const y = 80 + Math.sin(B * Math.PI) * 4;
      ctx.translate(x, y);
      ctx.font = `74px ${FONT}`;
      const w = ctx.measureText(e.zh).width + 190;
      roundRect(ctx, 0, 0, w, 124, 62);
      ctx.lineWidth = 12;
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fill();
      const ik = 1 + kick(B, 1, 6) * 0.12;
      ctx.save();
      ctx.translate(62, 62);
      ctx.scale(ik, ik);
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, TAU);
      ctx.fillStyle = e.color;
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = INK;
      ctx.stroke();
      ctx.font = `52px 'Apple Color Emoji'`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.icon, 0, 4);
      ctx.restore();
      text(ctx, e.zh, 128, 66, { size: 74, fill: INK, inkW: 0, align: 'left' });
      ctx.restore();
    }
    // Sub-line: each character bounces in on a 16th-note stagger.
    if (B >= e.subAt) {
      const chars = [...e.sub];
      const size = 104;
      const gap = size * 0.98;
      const x0 = W / 2 - (gap * (chars.length - 1)) / 2;
      chars.forEach((ch: string, i: number) => {
        const b0 = e.subAt + i * 0.125;
        const kk = inv(b0, b0 + 0.3, B);
        if (kk <= 0) return;
        const bob = -kick(B - i * 0.125, 1, 6) * 12;
        const o = inCubic(out);
        ctx.save();
        ctx.translate(x0 + i * gap, H - 130 + (1 - outBack(kk)) * 120 + bob + o * 260);
        ctx.rotate((i % 2 ? 1 : -1) * 0.06);
        const s = outBack(kk);
        ctx.scale(s, s);
        text(ctx, ch, 0, 0, { size, fill: '#fff', inkW: size * 0.3, ink: INK, stroke: e.color, strokeW: size * 0.18, shadow: 10 });
        ctx.restore();
      });
    }
  };

  const stageShot = (who: CastKey, B: number, dropAt: number, fall = 0.5) => {
    stage.visible = true;
    stage.position.set(0, 0, 0);
    stage.scale.setScalar(1);
    const p = cast[who];
    const land = dropAt + fall;
    const k = inv(dropAt, land, B);
    const y = B < land ? (1 - inCubic(k)) * 2.2 * fall * 2 : 0;
    const sq = happyAt(B, land, 0.35);
    p.pose({ at: V(0, y, 0), yaw: 0, hop: sq !== undefined ? 1 - sq : undefined }, B);
    return p;
  };

  // Every shot is two bars (8 beats). Beat numbers below are absolute and match score.json.
  const one = (type: string) => of(type)[0];
  const badges = of('badge');

  const SHOTS: Record<string, (B: number) => ShotOut> = {
    intro(B) {
      // Flight through the rainbow tunnel: 茜 runs out of the vanishing point toward the
      // camera (steps on sixteenths), arrives on beat 2 with a hop, then waves. One gate
      // passes per beat; the title spells out from beat 3, ribbon on 6.
      const p = cast.akane;
      const arrive = 2;
      const k = inv(0, arrive, B);
      const z = lerp(-9, 0, outCubic(k));
      const running = B < arrive;
      const at = V(0, 0, z);
      const hop = inv(arrive, arrive + 0.5, B);
      if (hop > 0 && hop < 1) at.y = Math.sin(Math.PI * hop) * 0.3;
      p.pose({
        at,
        yaw: running ? 0 : Math.sin(B * Math.PI * 0.25) * 0.15,
        walk: running ? B * Math.PI * 4 : undefined,
        hop: hop > 0 && hop < 1 ? hop : undefined,
        happy: happyAt(B, 6, 0.6),
        wave: B >= arrive + 0.6 ? B - arrive - 0.6 : undefined,
      }, B);
      setCam(V(0, 0.52, 0), 0, 9, 4.4 - outExpo(inv(arrive, 8, B)) * 0.25);
      let vp = { vx: W / 2, vy: H * 0.44 };
      return {
        theme: { ...THEMES.intro, colors: ['#FFFFFF', ...RAINBOW] },
        seed: 1,
        avoid: { x: W / 2, y: 520, r: 460 },
        bg: () => {
          vp = rainbowTunnel(ctx, W, H, B, { gatesPerBeat: 1, fade: inv(0, 0.5, B), vx: W / 2 + Math.sin(B * 0.3) * 50, vy: H * 0.5 });
        },
        fg: () => {
          // soft contact shadow under her feet
          const foot = project(V(0, 0, z));
          const sh = clamp(1 - at.y * 2) * clamp((z + 9) / 4);
          ctx.save();
          ctx.globalAlpha = 0.25 * sh;
          ctx.fillStyle = KIRA_INK;
          ctx.beginPath();
          ctx.ellipse(foot.x, foot.y + 4, 90 * (4.4 / (4.4 - z)), 20 * (4.4 / (4.4 - z)), 0, 0, TAU);
          ctx.fill();
          ctx.restore();
          drawTitle(B, 200, 196, (i) => letters[i].beat);
          drawBadge(B, badges[0].beat, W / 2 + 470, 420, 64);
          const head = project(p.headTop());
          bubble(ctx, '嗨！我是小茜～', head.x + 150, head.y + 40, pop(B, arrive + 0.5, 0.35) * (1 - inv(5.6, 5.9, B)), 50, 'left');
          burst(ctx, 'star', foot.x, foot.y - 40, B, arrive + 0.5, 12, 3, 1.4);
          burst(ctx, 'star', W / 2 + 470, 420, B, badges[0].beat, 10, 4, 1.4);
          void vp;
        },
      };
    },

    lawn(B) {
      rooms.lawn.root.visible = true;
      const a = cast.akane;
      const start = L.lawnDoor.clone().add(V(0, 0, 0.5));
      const top = L.slideTop.clone();
      const [r0, r1, r2] = L.ramp;
      const rampYaw = Math.atan2(r1.x - r0.x, r1.z - r0.z);
      const slideAt = one('slide').beat; // 13
      let pose: Pose;
      if (B < 11) pose = walkBetween(start, L.ladder, 8.5, 11, B);
      else if (B < 11.5) {
        const h = hopBetween(L.ladder, top, 11, 11.5, B, 0.1);
        pose = { at: h.at, yaw: Math.atan2(top.x - L.ladder.x, top.z - L.ladder.z), hop: h.k };
      } else if (B < slideAt) {
        // Sit at the top, peek at the camera, get ready.
        const look = inOutCubic(inv(11.5, 12, B)) * (1 - inOutCubic(inv(12.5, 13, B)));
        pose = { at: top, yaw: rampYaw + look * 0.9, sit: 'sit', happy: happyAt(B, 12, 0.5) };
      } else if (B < slideAt + 1) {
        const t = inv(slideAt, slideAt + 1, B);
        const k = inCubic(t) * 0.6 + t * 0.4;
        const d1 = r0.distanceTo(r1);
        const d2 = r1.distanceTo(r2);
        const d = k * (d1 + d2);
        const at = d < d1 ? r0.clone().lerp(r1, d / d1) : r1.clone().lerp(r2, (d - d1) / d2);
        pose = { at: at.setY(Math.max(0, at.y - 0.02)), yaw: rampYaw, sit: d < d1 ? 'sit' : undefined };
      } else pose = { at: r2.clone().setY(0), yaw: 0, happy: happyAt(B, 14) ?? happyAt(B, 15, 0.6) };
      if (B >= slideAt + 1) pose.yaw = faceCam(pose.at);
      a.pose(pose, B);
      // Camera: swoop in from high and wide, then follow 茜 to the slide.
      const k = outExpo(inv(8, 9.6, B));
      const follow = V(lerp(-0.2, -1.0, inOutCubic(inv(8.5, 12, B))), 0.4, lerp(-0.6, 0.0, inOutCubic(inv(11.5, 14.5, B))));
      const tgt = V(0, 0.3, 0).lerp(follow, k);
      setCam(tgt, lerp(70, 38, k) + (B - 8) * 0.9, lerp(62, 38, k) - inOutCubic(inv(10, 12, B)) * 10, lerp(17, 7.6, k) - kick(B) * 0.06);
      // Friends: bunny rocks the horse, cat in the car, capybara waves, panda cheers.
      const rock = Math.sin(B * Math.PI * 0.5) * 0.16;
      if (L.horse) {
        L.horse.pivot.rotation.x = rock;
        cast.bunny.pose({ at: snapPos(L.horse), yaw: snapYaw(L.horse), sit: 'sit', rock }, B);
      }
      if (L.car) {
        const bump = Math.abs(Math.sin(B * Math.PI)) * 0.03;
        L.car.pivot.position.y += bump;
        cast.cat.pose({ at: snapPos(L.car).add(V(0, bump, 0)), yaw: snapYaw(L.car), sit: 'sit' }, B);
      }
      const capy = V(0.05, 0, 0.75);
      cast.capybara.pose({ at: capy, yaw: faceCam(capy), wave: B > 9 && B < 12 ? B - 9 : undefined, happy: happyAt(B, 14.25, 0.7) }, B);
      const panda = V(-0.3, 0, 1.7);
      cast.panda.pose({ at: panda, yaw: faceCam(panda), happy: frac(B / 4) < 0.25 ? frac(B / 4) / 0.25 : undefined }, B);
      return {
        theme: THEMES.lawn,
        seed: 2,
        fg: () => {
          caption(B, of('caption')[0], 16);
          const pe = project(r2.clone().setY(0.3));
          burst(ctx, 'star', pe.x, pe.y, B, slideAt + 1, 12, 5, 1.4);
          if (B >= slideAt && B < slideAt + 1.05) {
            const pa = project(a.headTop());
            for (let i = 0; i < 3; i++) {
              const tt = frac(B * 4 + i / 3);
              ctx.save();
              ctx.globalAlpha = 1 - tt;
              shape(ctx, 'squiggle', pa.x + 70 + tt * 60, pa.y + 20 + i * 36, 34, 0, '#FFFFFF', 4);
              ctx.restore();
            }
          }
        },
      };
    },

    living(B) {
      rooms.living.root.visible = true;
      const a = cast.akane;
      const seat = L.sofas[1] ?? L.sofa;
      const seatPos = snapPos(seat);
      const door = L.livingDoor.clone().add(V(0, 0, -0.45));
      const app = seat?.approach ?? seatPos.clone().setY(0);
      const tvOn = one('ding').beat; // 19.5
      let pose: Pose;
      if (B < 18.5) pose = walkBetween(door, app, 16.25, 18.5, B);
      else if (B < 19) {
        const h = hopBetween(app, seatPos, 18.5, 19, B, 0.3);
        pose = { at: h.at, yaw: faceCam(h.at), hop: h.k };
      } else pose = { at: seatPos, yaw: faceCam(seatPos), sit: 'sit', happy: happyAt(B, 20.5) ?? happyAt(B, 22, 0.7) };
      a.pose(pose, B);
      jelly(seat, B, 19, 0.14);
      // TV lights up and flips colour every eighth note.
      if (L.tv && B >= tvOn) {
        const screen = L.tv.parts.find((p) => p.name === 'INT_tv') ?? L.tv.parts[0];
        const m = screen.material as THREE.MeshToonMaterial;
        const cols = [0xf28c7a, 0xfff3c4, 0xa5dcc8, 0xa9d3f2, 0xc9b8e8];
        m.emissive.setHex(cols[Math.floor((B - tvOn) * 2) % cols.length]);
        m.emissiveIntensity = 0.9;
        jelly(L.tv, B, tvOn, 0.08);
      }
      const bb = L.beanbags;
      const sitters: [CastKey, Interactable | undefined][] = [
        ['panda', bb[0]],
        ['bunny', bb[1]],
        ['cat', L.sofas[3] ?? L.sofas[2]],
      ];
      sitters.forEach(([who, it], i) => {
        if (!it) return;
        const at = snapPos(it);
        const ph = frac(B / 2 + i * 0.25);
        cast[who].pose({ at, yaw: faceCam(at), sit: 'sit', happy: ph < 0.3 && B > tvOn ? ph / 0.3 : undefined }, B);
      });
      const capy = V(-1.4, 0, 1.2);
      cast.capybara.pose({ at: capy, yaw: faceCam(capy), wave: B > 17 && B < 19 ? B - 17 : undefined }, B);
      const k = outCubic(inv(16, 22, B));
      const la = a.root.position;
      setCam(V(lerp(0.6, la.x * 0.6 + 0.3, k), 0.35, lerp(0.6, la.z * 0.6 + 0.1, k)), lerp(24, 46, k), lerp(44, 36, k), lerp(9.5, 7.2, k) - kick(B) * 0.06);
      return {
        theme: THEMES.living,
        seed: 3,
        fg: () => {
          caption(B, of('caption')[1], 24);
          const tv = project(topOf(L.tv));
          for (const b0 of [tvOn, tvOn + 1, tvOn + 2, tvOn + 3]) burst(ctx, 'note', tv.x, tv.y, B, b0, 5, b0 * 4, 1.2);
          const hd = project(a.headTop());
          burst(ctx, 'heart', hd.x, hd.y, B, 20.5, 7, 10);
          burst(ctx, 'heart', hd.x, hd.y, B, 22, 6, 14);
        },
      };
    },

    cafe(B) {
      rooms.cafe.root.visible = true;
      const a = cast.akane;
      const cx = L.coffee?.pivot.position ?? V(-2, 0, -2);
      const stools = [...L.stools].sort((p, q) => snapPos(p).distanceTo(cx) - snapPos(q).distanceTo(cx));
      const s0 = stools[0];
      const byName = (n: string) => L.stools.find((i) => i.name === n);
      const at = snapPos(s0);
      const brew = of('ding').find((e) => e.at === 'coffee')!.beat; // 25
      const cakes = of('pop').filter((e) => e.at === 'cake').map((e) => e.beat);
      const yum = of('sparkle').find((e) => e.at === 'akane')!.beat; // 28.5
      a.pose({ at, yaw: faceCam(at), sit: 'sit', happy: happyAt(B, 24.25, 0.5) ?? happyAt(B, yum) ?? happyAt(B, 30, 0.7) }, B);
      jelly(s0, B, 24, 0.1);
      const bar = L.barista.clone().setY(0);
      cast.panda.pose({ at: bar, yaw: faceCam(bar), happy: happyAt(B, brew, 0.6), wave: B >= brew + 0.5 && B < brew + 2.5 ? B - brew - 0.5 : undefined }, B);
      jelly(L.coffee, B, brew, 0.14);
      jelly(L.coffee, B, brew + 1, 0.1);
      for (const c of cakes) jelly(L.cake, B, c, 0.3, 0.5);
      const st = byName('stool_bar_2') ?? stools[1];
      if (st) {
        const p = snapPos(st);
        cast.bunny.pose({ at: p, yaw: faceCam(p), sit: 'sit', happy: happyAt(B, cakes[0], 0.5) }, B);
      }
      const catAt = V(-0.25, 0, -1.25);
      cast.cat.pose({ at: catAt, yaw: faceCam(catAt), happy: happyAt(B, cakes[1], 0.5), wave: B > 24.5 && B < 26.5 ? B - 24.5 : undefined }, B);
      const capy = V(1.3, 0, 1.3);
      cast.capybara.pose({ at: capy, yaw: faceCam(capy) + Math.sin(B * Math.PI * 0.5) * 0.2 }, B);
      const k = outCubic(inv(24, 31, B));
      const tgt = at.clone().lerp(cx, 0.35).setY(0.35);
      setCam(tgt, lerp(52, 34, k), lerp(44, 34, k), lerp(8.2, 6.2, k) - kick(B) * 0.06);
      return {
        theme: THEMES.cafe,
        seed: 4,
        fg: () => {
          caption(B, of('caption')[2], 32);
          const cm = project(topOf(L.coffee));
          for (let b0 = brew; b0 < 30; b0 += 0.5) burst(ctx, 'steam', cm.x, cm.y, B, b0, 2, b0 * 3);
          const ck = project(topOf(L.cake));
          cakes.forEach((c, i) => burst(ctx, 'heart', ck.x, ck.y, B, c, 7, 11 + i));
          const hd = project(a.headTop());
          burst(ctx, 'star', hd.x, hd.y, B, yum, 10, 13, 1.3);
          const ph = project(cast.panda.headTop());
          bubble(ctx, '請用咖啡～', ph.x, ph.y, pop(B, brew + 0.5, 0.35) * (1 - inv(30.6, 30.9, B)), 44);
        },
      };
    },

    bathroom(B) {
      rooms.bathroom.root.visible = true;
      const a = cast.akane;
      const at = snapPos(L.tub);
      const splash = one('splash').beat; // 36.5
      a.pose({ at, yaw: faceCam(at), sit: 'bath', happy: happyAt(B, 32.25, 0.5) ?? happyAt(B, splash, 0.7) ?? happyAt(B, 38.25, 0.6) }, B);
      const foam = L.tub?.parts.filter((p) => p.name.includes('_foam')) ?? [];
      foam.forEach((f, i) => f.scale.multiplyScalar(1 + kick(B + i * 0.1, 0.5, 6) * 0.12));
      for (const e of of('squeak')) jelly(L.duck, B, e.beat, 0.35, 0.4);
      if (L.duck) L.duck.pivot.position.y += Math.sin(B * Math.PI * 0.5) * 0.01;
      if (L.bench?.snap) {
        const p = snapPos(L.bench);
        cast.capybara.pose({ at: p, yaw: faceCam(p), sit: 'sit' }, B);
      }
      if (L.stepStool?.snap) {
        const p = snapPos(L.stepStool);
        cast.cat.pose({ at: p, yaw: faceCam(p), sit: 'sit', happy: happyAt(B, splash + 0.25, 0.7) }, B);
      }
      const k = outCubic(inv(32, 39, B));
      setCam(at.clone().setY(0.3).add(V(0.25, 0, 0.35)), lerp(26, 44, k), lerp(40, 30, k), lerp(5.8, 4.3, k) - kick(B) * 0.04);
      return {
        theme: THEMES.bathroom,
        seed: 5,
        fg: () => {
          caption(B, of('caption')[3], 40);
          const tb = project(topOf(L.tub));
          for (let b0 = 32; b0 < 40; b0 += 0.5) burst(ctx, 'bubble', tb.x + (hash(b0) - 0.5) * 260, tb.y + 20, B, b0, 3, b0 * 7, 0.9);
          const dk = project(topOf(L.duck));
          for (const e of of('squeak')) burst(ctx, 'star', dk.x, dk.y, B, e.beat, 4, e.beat * 5, 0.8);
          const hd = project(a.headTop());
          burst(ctx, 'drop', hd.x, hd.y + 30, B, splash, 14, 21, 1.6);
        },
      };
    },

    friends(B) {
      // Two beats per friend: drop in (half a beat), land, wave, say their line.
      const list = of('friend');
      const idx = clamp(Math.floor((B - list[0].beat) / 2), 0, list.length - 1);
      const e = list[idx];
      const who = e.who as CastKey;
      const p = stageShot(who, B, e.beat, 0.5);
      const land = e.beat + 0.5;
      p.pose({ at: p.root.position.clone(), yaw: -0.35 + Math.sin(B * Math.PI * 0.5) * 0.1, wave: B > land + 0.25 ? B - land - 0.25 : undefined, happy: happyAt(B, land, 0.5) }, B);
      setCam(V(0, 0.45, 0), 0, 12, 3.6 + (1 - outCubic(inv(e.beat, e.beat + 2, B))) * 0.25, 30, 380);
      const th: Theme = { ...THEMES.together, bg: e.bg, bg2: '#FFFFFF66', pattern: 'rays', colors: ['#FFFFFF', e.color, '#FFE08A', '#F7A8B8'], dots: e.color + '55' };
      return {
        theme: th,
        seed: 10 + idx,
        bg: () => {
          // Pop-art card: flat colour, halftone gradient, manga speed lines and a big starburst behind the friend.
          ctx.fillStyle = e.bg;
          ctx.fillRect(0, 0, W, H);
          halftone(ctx, e.color + '40', 30, 13, (x, y) => 1.15 - Math.hypot(x - W * 0.25, y - H * 0.4) / 900, W, H, B * 10);
          const cx = W / 2 + 380;
          const cy = H * 0.52;
          speedLines(ctx, cx, cy, W, H, B, 'rgba(255,255,255,0.75)', 44, 300);
          const pk = pop(B, e.beat, 0.35);
          popBurst(ctx, cx, cy, 330 * pk * (1 + kick(B, 1, 6) * 0.04), e.color, '', () => {}, B * 0.15, idx + 3);
          halftoneCorners(ctx, e.color + '66', W, H, B, [[1, 1]], 0.5);
        },
        fg: () => {
          const k = inv(e.beat, e.beat + 0.4, B);
          ctx.save();
          ctx.translate(lerp(-900, 0, outBack(k, 1.4)), 0);
          const cx = 560;
          const size = e.name.length > 3 ? 110 : 150;
          text(ctx, e.name, cx, 440, { size, fill: e.color, stroke: '#fff', strokeW: size * 0.2, inkW: size * 0.32, shadow: 12 });
          text(ctx, `No.${idx + 1}`, cx, 280, { size: 60, fill: '#fff', inkW: 16 });
          ctx.restore();
          bubble(ctx, e.line, 560, 700, pop(B, land + 0.25, 0.35), 54);
          for (let i = 0; i < list.length; i++) {
            const on = i <= idx;
            shape(ctx, 'heart', 440 + i * 80, 900, on ? 26 + (i === idx ? kick(B) * 8 : 0) : 18, 0, on ? list[i].color : '#FFFFFF', 4);
          }
          const hp = project(p.headTop());
          burst(ctx, 'star', hp.x, hp.y, B, land, 8, idx * 17 + 1, 1.3);
        },
        avoid: { x: W / 2 + 380, y: H * 0.55, r: 360 },
      };
    },

    together(B) {
      rooms.lawn.root.visible = true;
      const order: CastKey[] = ['capybara', 'panda', 'akane', 'bunny', 'cat'];
      const c0 = V(-0.15, 0, 1.15);
      const spacing = 0.52;
      const cheers = of('cheer').map((e) => e.beat);
      setCam(c0.clone().setY(0.6), 45 + (B - 48) * 0.8, 22, 5.8 - outCubic(inv(48, 55, B)) * 0.6 - kick(B) * 0.05, 30);
      const right = V(1, 0, -1).normalize();
      const back = V(-1, 0, -1).normalize();
      order.forEach((who, i) => {
        const at = c0.clone().addScaledVector(right, (i - 2) * spacing).addScaledVector(back, i === 2 ? -0.15 : Math.abs(i - 2) * 0.12);
        const h = hopInPlace(who, B);
        const cheer = cheers.map((c) => happyAt(B, c + i * 0.06, 0.8)).find((v) => v !== undefined);
        at.y += h.y;
        cast[who].pose({ at, yaw: faceCam(at), hop: h.k, happy: cheer, wave: who === 'akane' && B > 51.5 && B < 53 ? B - 51.5 : undefined }, B);
      });
      if (L.horse) L.horse.pivot.rotation.x = Math.sin(B * Math.PI * 0.5) * 0.1;
      return {
        theme: THEMES.together,
        seed: 6,
        fg: () => {
          of('stamp').forEach((e, row) => {
            const chars = [...e.text];
            const size = 140;
            const gap = size;
            const y = 120 + row * 160;
            const x0 = W / 2 - (gap * (chars.length - 1)) / 2 + (row ? 120 : -120);
            chars.forEach((ch, i) => {
              const b0 = e.beat + i * 0.25;
              const k = inv(b0, b0 + 0.3, B);
              if (k <= 0) return;
              const s = lerp(2.4, 1, outBack(k, 1.6));
              ctx.save();
              ctx.globalAlpha = clamp(k * 3);
              ctx.translate(x0 + i * gap, y - kick(B - i * 0.1, 1, 6) * 10);
              ctx.rotate((i % 2 ? 1 : -1) * 0.08);
              ctx.scale(s, s);
              text(ctx, ch, 0, 0, { size, fill: row ? AKANE_PINK : '#FFB84D', stroke: '#fff', strokeW: size * 0.2, inkW: size * 0.32, shadow: 12 });
              ctx.restore();
            });
          });
          cheers.forEach((c, i) => {
            burst(ctx, 'confetti', W * 0.3, H * 0.2, B, c, 30, 41 + i * 2, 2);
            burst(ctx, 'confetti', W * 0.7, H * 0.2, B, c, 30, 42 + i * 2, 2);
          });
          for (const who of order) {
            const b0 = boingsFor(who).find((b) => b >= 48) ?? 49;
            const hp = project(cast[who].headTop());
            burst(ctx, 'star', hp.x, hp.y, B, b0 + 0.25, 5, b0 * 11, 1);
          }
        },
      };
    },

    end(B) {
      stage.visible = true;
      stage.scale.set(2.3, 1, 1.6);
      const S = one('logo').beat; // 56
      const spots: [CastKey, THREE.Vector3][] = [
        ['akane', V(0, 0, 0.35)],
        ['capybara', V(-0.95, 0, -0.35)],
        ['panda', V(-0.42, 0, -0.5)],
        ['bunny', V(0.42, 0, -0.5)],
        ['cat', V(0.95, 0, -0.35)],
      ];
      spots.forEach(([who, at], i) => {
        const b0 = S + 0.5 + i * 0.25;
        const k = inv(b0, b0 + 0.5, B);
        const p = at.clone();
        p.y = (1 - outBack(k, 1.4)) * 1.6 * (k < 1 ? 1 : 0);
        const hh = frac((B - S) / 2 + i * 0.2);
        cast[who].pose({ at: p, yaw: -p.x * 0.35, happy: B > S + 2.5 && hh < 0.3 ? hh / 0.3 : undefined, wave: who === 'akane' && B > S + 1.25 ? B - S - 1.25 : undefined }, B);
      });
      setCam(V(0, 0.85, 0), 0, 12, 6.3 - outExpo(inv(S, S + 3, B)) * 0.6);
      const cta = one('cta').beat;
      const fin = of('sparkle').at(-1)!.beat;
      return {
        theme: { ...THEMES.end, colors: ['#FFFFFF', ...RAINBOW] },
        seed: 7,
        avoid: { x: W / 2, y: H * 0.62, r: 420 },
        bg: () => {
          // two gates per beat, easing down over the final chord
          const slow = Math.max(0, B - 62);
          rainbowTunnel(ctx, W, H, B, { dist: 2 * B - 0.4 * slow * slow, lasers: true, vx: W / 2, vy: H * 0.46 });
        },
        fg: () => {
          drawTitle(B, 200, 176, (i) => S + i * 0.125);
          drawBadge(B, badges[1].beat, W / 2, 380, 70);
          const k = inv(cta, cta + 0.45, B);
          if (k > 0) {
            ctx.save();
            ctx.translate(W / 2, H - 120);
            const s = outBack(k) * (1 + kick(B, 1, 5) * 0.06);
            ctx.scale(s, s);
            const w = 640;
            const h = 128;
            roundRect(ctx, -w / 2, -h / 2 + 10, w, h, h / 2);
            ctx.fillStyle = INK;
            ctx.fill();
            roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
            ctx.lineWidth = 12;
            ctx.strokeStyle = INK;
            ctx.stroke();
            ctx.fillStyle = '#FFB84D';
            ctx.fill();
            text(ctx, '一起來玩吧！', 0, 4, { size: 72, fill: '#fff', inkW: 16 });
            ctx.restore();
          }
          burst(ctx, 'star', W / 2 - 360, H - 140, B, fin, 8, 51, 1.2);
          burst(ctx, 'star', W / 2 + 360, H - 140, B, fin, 8, 52, 1.2);
          burst(ctx, 'confetti', W / 2, H * 0.1, B, S, 40, 53, 2.2);
          burst(ctx, 'confetti', W / 2, H * 0.1, B, fin, 30, 54, 2.2);
        },
      };
    },
  };

  // ── pop-art stickers ──────────────────────────────────
  const pows = of('pow');
  const drawWord = (word: string, size: number) =>
    text(ctx, word, 0, size * 0.04, { size, fill: '#FFFFFF', inkW: size * 0.28, ink: KIRA_INK, stroke: '#FFE36E', strokeW: size * 0.1 });
  const drawPows = (B: number) => {
    for (const e of pows) {
      const len = e.len ?? 1.5;
      if (B < e.beat || B > e.beat + len) continue;
      const k = inv(e.beat, e.beat + 0.3, B);
      const out = inv(e.beat + len - 0.25, e.beat + len, B);
      const r = (e.r ?? 150) * outBack(k, 2.4) * (1 - inCubic(out)) * (1 + kick(B, 1, 7) * 0.06);
      const rot = (e.rot ?? -0.12) + Math.sin(B * Math.PI) * 0.05;
      popBurst(ctx, e.x * W, e.y * H, r, e.color, e.text, drawWord, rot, e.beat);
    }
  };

  // ── wipes ─────────────────────────────────────────────
  const wipes = of('wipe');
  const drawWipe = (B: number) => {
    for (const w of wipes) {
      const bar = w.beat + 0.5;
      if (B < w.beat || B > bar + 0.55) continue;
      const nth = THEMES[w.to] ?? THEMES.together;
      if (w.shape === 'gate') {
        gateWipe(ctx, W, H, B, w.beat, bar);
        continue;
      }
      if (w.shape === 'dots') {
        dotWipe(ctx, W, H, B, w.beat, bar, nth.dots ?? '#F7B3C4', '#FFFFFF');
        continue;
      }
      const th = THEMES[w.to] ?? THEMES.together;
      const cell = 250;
      const cols = Math.ceil(W / cell) + 1;
      const rows = Math.ceil(H / cell) + 1;
      const kind = w.shape as ShapeKind;
      const scale = { circle: 0.82, star: 1.45, heart: 1.1, flower: 1.05 }[kind as string] ?? 1;
      const cc = [th.bg, '#FFFFFF', th.colors[1] ?? '#FFE08A', th.colors[2] ?? '#F7A8B8'];
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) {
          const d = ((i + j) / (cols + rows - 2)) * 0.28;
          const cin = outBack(inv(w.beat + d, w.beat + d + 0.22, B), 1.4);
          const cout = inCubic(inv(bar + d, bar + d + 0.25, B));
          const r = cell * scale * cin * (1 - cout);
          const x = i * cell + (j % 2 ? cell / 2 : 0) - cell / 4;
          const y = j * cell - cell / 4;
          shape(ctx, kind, x, y, r, (i + j) * 0.4 + B * 0.5, cc[(i + j * 2) % cc.length], 6);
        }
    }
  };

  const shotAt = (B: number) => [...score.shots].reverse().find((s) => B >= s.beat) ?? score.shots[0];

  function drawFrame(B: number) {
    resetAll();
    const shot = shotAt(B);
    const b0 = shot.beat;
    const out = SHOTS[shot.name](B);
    if (out.bg) out.bg();
    else drawPattern(ctx, out.theme, B);
    drawShapes(ctx, out.theme, B, b0, out.seed, out.bg ? 16 : 26, out.avoid);
    twinkles(ctx, B, out.seed, 6, out.avoid);
    out.bgExtra?.();
    gl.setRenderTarget(null);
    gl.clear(true, true, true);
    outline.render(scene, camera);
    ctx.drawImage(gl.domElement, 0, 0, W, H);
    out.fg?.();
    drawPows(B);
    drawWipe(B);
  }

  return { drawFrame, frames: FRAMES, beatAt };
}
