import Phaser from 'phaser';
import { ORBIT_RADIUS } from '../game/model';

// Motion graphic 圖層：全部以程式向量繪製，跟著音樂節拍脈動。
// 背景：極座標網格、節拍掃描、超空間流光、節拍波紋。
// 前景：雷電鏈、貫穿雷射、連鎖爆破環、擊破環。

const TAU = Math.PI * 2;
const ADD = Phaser.BlendModes.ADD;

interface Ring { r: number; life: number; width: number; color: number }
interface Bolt { points: { x: number; y: number }[]; life: number }
interface Nova { x: number; y: number; radius: number; life: number; depth: number }
interface KillRing { x: number; y: number; size: number; life: number; color: number }
interface Streak { a: number; r: number; speed: number; length: number }

const NOVA_COLORS = [0xffd35a, 0xffa53d, 0xff6b4a, 0xff4fa0, 0xe04dff, 0xa45cff, 0x7f7cff, 0x6fd8ff];

export type Palette = 'calm' | 'battle' | 'boss';

export class MotionLayer {
  /** 0–1，每拍瞬間拉高後衰減；其他模組可用來做縮放脈動。 */
  energy = 0;
  private barStart = 0;
  private barLength = 60 / 140 * 4;
  private intensity = 0;
  private intensityTarget = 0;
  private palette: Palette = 'calm';
  private gridRotation = 0;
  private time = 0;

  private back: Phaser.GameObjects.Graphics;
  private front: Phaser.GameObjects.Graphics;
  private rings: Ring[] = [];
  private bolts: Bolt[] = [];
  private novas: Nova[] = [];
  private killRings: KillRing[] = [];
  private streaks: Streak[] = [];
  private laser: { angle: number } | null = null;

  constructor(private scene: Phaser.Scene, backDepth: number, frontDepth: number) {
    this.back = scene.add.graphics().setBlendMode(ADD).setDepth(backDepth);
    this.front = scene.add.graphics().setBlendMode(ADD).setDepth(frontDepth);
    for (let i = 0; i < 70; i++) this.streaks.push(this.newStreak(true));
  }

  private newStreak(anywhere = false): Streak {
    return {
      a: Math.random() * TAU,
      r: anywhere ? 260 + Math.random() * 1000 : 260 + Math.random() * 80,
      speed: 260 + Math.random() * 520,
      length: 20 + Math.random() * 70
    };
  }

  /** 流光速度與密度：0 平靜、1 全速（Boss、高連擊）。 */
  setIntensity(value: number) { this.intensityTarget = Phaser.Math.Clamp(value, 0, 1); }
  setPalette(palette: Palette) { this.palette = palette; }
  setLaser(angle: number | null) { this.laser = angle === null ? null : { angle }; }

  onBeat(downbeat: boolean) {
    this.energy = downbeat ? 1.25 : 1;
    const color = this.palette === 'boss' ? 0xff4fd8 : 0x39c6ff;
    this.rings.push({ r: ORBIT_RADIUS + 10, life: 1, width: downbeat ? 5 : 3, color });
    if (downbeat) {
      this.barStart = this.time;
      this.rings.push({ r: ORBIT_RADIUS - 30, life: .8, width: 2, color: 0xffffff });
    }
  }

  bolt(points: { x: number; y: number }[]) { this.bolts.push({ points, life: .26 }); }
  nova(x: number, y: number, radius: number, depth: number) { this.novas.push({ x, y, radius, depth, life: 1 }); }
  killRing(x: number, y: number, size: number, color: number) { this.killRings.push({ x, y, size, color, life: 1 }); }

  update(dt: number, halfWidth: number, halfHeight: number, muzzle: { x: number; y: number }) {
    this.time += dt;
    this.energy = Math.max(0, this.energy - dt * 3.2);
    this.intensity += (this.intensityTarget - this.intensity) * Math.min(1, dt * 2);
    this.gridRotation += dt * (.02 + this.intensity * .05);
    const maxR = Math.hypot(halfWidth, halfHeight) + 40;
    this.drawBack(dt, maxR);
    this.drawFront(dt, maxR, muzzle);
  }

  private accent() { return this.palette === 'boss' ? 0xff4fd8 : 0x39c6ff; }

  private drawBack(dt: number, maxR: number) {
    const g = this.back;
    g.clear();
    const accent = this.accent();
    const e = this.energy;

    // 極座標網格
    for (let r = 320, i = 0; r < maxR; r += 110, i++) {
      g.lineStyle(i % 3 === 0 ? 2 : 1, accent, .05 + e * .05 + (i % 3 === 0 ? .03 : 0));
      g.strokeCircle(0, 0, r);
    }
    for (let i = 0; i < 24; i++) {
      const a = this.gridRotation + (i / 24) * TAU;
      g.lineStyle(1, accent, i % 6 === 0 ? .1 + e * .06 : .035);
      g.lineBetween(Math.cos(a) * 300, Math.sin(a) * 300, Math.cos(a) * maxR, Math.sin(a) * maxR);
    }

    // 以小節為週期的雷達掃描
    const phase = ((this.time - this.barStart) / this.barLength) % 1;
    const sweep = -Math.PI / 2 + phase * TAU;
    for (let i = 0; i < 18; i++) {
      const a = sweep - i * .03;
      g.lineStyle(3, accent, (.16 - i * .009) * (.6 + this.intensity * .6));
      g.lineBetween(Math.cos(a) * 290, Math.sin(a) * 290, Math.cos(a) * maxR, Math.sin(a) * maxR);
    }

    // 超空間流光
    const streakColor = this.palette === 'boss' ? 0xff7ae6 : 0xbff0ff;
    const speedScale = .35 + this.intensity * 1.8 + e * .4;
    for (let i = 0; i < this.streaks.length; i++) {
      const s = this.streaks[i];
      s.r += s.speed * speedScale * dt;
      if (s.r > maxR) { this.streaks[i] = this.newStreak(); continue; }
      const len = s.length * (.5 + this.intensity * 1.5);
      g.lineStyle(2, streakColor, (.08 + this.intensity * .28) * Math.min(1, (s.r - 260) / 200));
      g.lineBetween(Math.cos(s.a) * s.r, Math.sin(s.a) * s.r, Math.cos(s.a) * (s.r + len), Math.sin(s.a) * (s.r + len));
    }

    // 節拍波紋：從軌道往外擴散
    this.rings = this.rings.filter(ring => {
      ring.r += 820 * dt;
      ring.life -= dt * 1.1;
      if (ring.life <= 0 || ring.r > maxR) return false;
      g.lineStyle(ring.width, ring.color, ring.life * .35);
      g.strokeCircle(0, 0, ring.r);
      return true;
    });

    // 軌道刻度：每拍閃亮
    for (let i = 0; i < 48; i++) {
      const a = -this.gridRotation * 2 + (i / 48) * TAU;
      const long = i % 4 === 0;
      const r0 = ORBIT_RADIUS + 18, r1 = r0 + (long ? 16 : 7) + (long ? e * 10 : 0);
      g.lineStyle(long ? 3 : 2, accent, long ? .35 + e * .5 : .18);
      g.lineBetween(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1);
    }
  }

  private drawFront(dt: number, maxR: number, muzzle: { x: number; y: number }) {
    const g = this.front;
    g.clear();

    if (this.laser) this.drawLaser(g, this.laser.angle, muzzle, maxR);

    this.bolts = this.bolts.filter(bolt => {
      bolt.life -= dt;
      if (bolt.life <= 0) return false;
      const k = bolt.life / .26;
      const path = this.jag(bolt.points);
      for (const [width, color, alpha] of [[26, 0x3a9bff, .35], [11, 0x9ae6ff, .85], [4, 0xffffff, 1]] as const) {
        g.lineStyle(width * (.6 + k * .4), color, alpha * k);
        g.strokePoints(path, false);
      }
      for (const p of bolt.points) {
        g.fillStyle(0xbff0ff, .5 * k);
        g.fillCircle(p.x, p.y, 10 + 22 * (1 - k));
      }
      return true;
    });

    this.novas = this.novas.filter(nova => {
      nova.life -= dt * 2.4;
      if (nova.life <= 0) return false;
      const t = 1 - nova.life;
      const r = nova.radius * (1 - (1 - t) ** 3);
      const color = NOVA_COLORS[Math.min(nova.depth, NOVA_COLORS.length - 1)];
      g.fillStyle(color, .16 * nova.life);
      g.fillCircle(nova.x, nova.y, r);
      g.lineStyle(10 * nova.life + 2, color, .9 * nova.life);
      g.strokeCircle(nova.x, nova.y, r);
      g.lineStyle(3, 0xffffff, .8 * nova.life);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU + t * 1.5 + nova.depth;
        g.lineBetween(nova.x + Math.cos(a) * r * 1.02, nova.y + Math.sin(a) * r * 1.02, nova.x + Math.cos(a) * (r * 1.02 + 26 * nova.life), nova.y + Math.sin(a) * (r * 1.02 + 26 * nova.life));
      }
      return true;
    });

    this.killRings = this.killRings.filter(ring => {
      ring.life -= dt * 3.2;
      if (ring.life <= 0) return false;
      const r = ring.size * (1.6 - ring.life * .9);
      g.lineStyle(4 * ring.life + 1, ring.color, ring.life);
      g.strokeCircle(ring.x, ring.y, r);
      return true;
    });
  }

  private drawLaser(g: Phaser.GameObjects.Graphics, angle: number, muzzle: { x: number; y: number }, maxR: number) {
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const ex = dx * maxR, ey = dy * maxR;
    const flicker = Math.sin(this.time * 55) * 3 + this.energy * 10;
    for (const [width, color, alpha] of [[76, 0xff3bd0, .16], [38 + flicker, 0x7fe8ff, .45], [12 + flicker * .3, 0xffffff, .95]] as const) {
      g.lineStyle(width, color, alpha);
      g.lineBetween(muzzle.x, muzzle.y, ex, ey);
    }
    // 沿光束往外流動的箭形記號
    const spacing = 110;
    const offset = (this.time * 1400) % spacing;
    const nx = -dy, ny = dx;
    g.lineStyle(4, 0xffffff, .7);
    for (let d = 40 + offset; d < maxR; d += spacing) {
      const cx = muzzle.x + dx * d, cy = muzzle.y + dy * d;
      g.lineBetween(cx - dx * 14 + nx * 22, cy - dy * 14 + ny * 22, cx, cy);
      g.lineBetween(cx - dx * 14 - nx * 22, cy - dy * 14 - ny * 22, cx, cy);
    }
    g.fillStyle(0xffffff, .9);
    g.fillCircle(muzzle.x, muzzle.y, 18 + flicker);
    g.lineStyle(3, 0x7fe8ff, .8);
    g.strokeCircle(muzzle.x, muzzle.y, 34 + flicker * 1.5 + (this.time * 120) % 30);
  }

  /** 把折線切細並隨機偏移，做成閃爍的閃電路徑。 */
  private jag(points: { x: number; y: number }[]) {
    const out: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i], b = points[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const segments = Math.max(3, Math.round(len / 34));
      for (let s = 0; s < segments; s++) {
        const t = s / segments;
        const jitter = s === 0 ? 0 : (Math.random() - .5) * 42;
        out.push(new Phaser.Math.Vector2(a.x + dx * t + nx * jitter, a.y + dy * t + ny * jitter));
      }
    }
    const last = points[points.length - 1];
    out.push(new Phaser.Math.Vector2(last.x, last.y));
    return out;
  }
}
