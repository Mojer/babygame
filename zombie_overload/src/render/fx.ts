import { Particle, ParticleContainer, type Texture } from 'pixi.js';

/**
 * 視覺粒子（純表現，不影響遊戲結果）。SoA ＋ 固定上限：
 * 上限滿了就不再生成 → 1000 隻同時死亡也不會讓特效拖垮幀率。
 */
export class FxSystem {
  readonly container: ParticleContainer;
  cap: number;
  count = 0;
  private x: Float32Array;
  private y: Float32Array;
  private vx: Float32Array;
  private vy: Float32Array;
  private life: Float32Array;
  private max: Float32Array;
  private drag: Float32Array;
  private rot: Float32Array;
  private spin: Float32Array;
  private s0: Float32Array;
  private s1: Float32Array;
  private a0: Float32Array;
  private rgb: Uint32Array;
  private tex: Texture[] = [];
  private seq: (Texture[] | null)[] = [];
  private readonly parts: Particle[] = [];

  constructor(atlasTexture: Texture, cap: number, additive: boolean) {
    this.cap = cap;
    this.container = new ParticleContainer({
      texture: atlasTexture,
      roundPixels: true,
      dynamicProperties: { position: true, rotation: true, uvs: true, color: true, vertex: true },
    });
    if (additive) this.container.blendMode = 'add';
    this.x = new Float32Array(cap);
    this.y = new Float32Array(cap);
    this.vx = new Float32Array(cap);
    this.vy = new Float32Array(cap);
    this.life = new Float32Array(cap);
    this.max = new Float32Array(cap);
    this.drag = new Float32Array(cap);
    this.rot = new Float32Array(cap);
    this.spin = new Float32Array(cap);
    this.s0 = new Float32Array(cap);
    this.s1 = new Float32Array(cap);
    this.a0 = new Float32Array(cap);
    this.rgb = new Uint32Array(cap);
    for (let i = 0; i < cap; i++) {
      this.parts.push(new Particle({ texture: atlasTexture, anchorX: 0.5, anchorY: 0.5 }));
      this.tex.push(atlasTexture);
      this.seq.push(null);
    }
  }

  /** 品質分級改變時調整上限（只縮不擴，避免重新配置） */
  setBudget(n: number) {
    this.cap = Math.min(n, this.parts.length);
    if (this.count > this.cap) this.count = this.cap;
  }

  get full() {
    return this.count >= this.cap;
  }

  spawn(
    t: Texture | Texture[],
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    rgb: number,
    alpha = 1,
    scale0 = 1,
    scale1 = scale0,
    drag = 0,
    rot = 0,
    spin = 0,
  ) {
    if (this.count >= this.cap) return false;
    const i = this.count++;
    this.x[i] = x;
    this.y[i] = y;
    this.vx[i] = vx;
    this.vy[i] = vy;
    this.life[i] = life;
    this.max[i] = life;
    this.drag[i] = drag;
    this.rot[i] = rot;
    this.spin[i] = spin;
    this.s0[i] = scale0;
    this.s1[i] = scale1;
    this.a0[i] = alpha;
    this.rgb[i] = rgb;
    if (Array.isArray(t)) {
      this.seq[i] = t;
      this.tex[i] = t[0];
    } else {
      this.seq[i] = null;
      this.tex[i] = t;
    }
    return true;
  }

  update(dt: number) {
    const children = this.container.particleChildren;
    let n = this.count;
    for (let i = 0; i < n; i++) {
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        n--;
        this.copy(n, i);
        i--;
        continue;
      }
      const k = Math.max(0, 1 - this.drag[i] * dt);
      this.vx[i] *= k;
      this.vy[i] *= k;
      this.x[i] += this.vx[i] * dt;
      this.y[i] += this.vy[i] * dt;
      this.rot[i] += this.spin[i] * dt;
    }
    this.count = n;
    for (let i = 0; i < n; i++) {
      const p = this.parts[i];
      const u = 1 - this.life[i] / this.max[i];
      const sq = this.seq[i];
      p.texture = sq ? sq[Math.min(sq.length - 1, (u * sq.length) | 0)] : this.tex[i];
      p.x = this.x[i];
      p.y = this.y[i];
      p.rotation = this.rot[i];
      const s = this.s0[i] + (this.s1[i] - this.s0[i]) * u;
      p.scaleX = s;
      p.scaleY = s;
      const a = this.a0[i] * (1 - u * u);
      p.color = ((((a * 255) | 0) << 24) | this.rgb[i]) >>> 0;
      children[i] = p;
    }
    children.length = n;
  }

  private copy(from: number, to: number) {
    this.x[to] = this.x[from];
    this.y[to] = this.y[from];
    this.vx[to] = this.vx[from];
    this.vy[to] = this.vy[from];
    this.life[to] = this.life[from];
    this.max[to] = this.max[from];
    this.drag[to] = this.drag[from];
    this.rot[to] = this.rot[from];
    this.spin[to] = this.spin[from];
    this.s0[to] = this.s0[from];
    this.s1[to] = this.s1[from];
    this.a0[to] = this.a0[from];
    this.rgb[to] = this.rgb[from];
    this.tex[to] = this.tex[from];
    this.seq[to] = this.seq[from];
  }
}

/** 0xRRGGBB → Particle 用的 BGR（不含 alpha） */
export function bgr(rgb: number) {
  return ((rgb & 255) << 16) | (rgb & 0xff00) | ((rgb >> 16) & 255);
}
