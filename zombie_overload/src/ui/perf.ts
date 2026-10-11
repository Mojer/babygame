import { TIER_ORDER, TIERS, type TierName } from '../sim/content';
import type { World } from '../sim/world';

export interface PerfSample {
  frameMs: number;
  simMs: number;
  renderMs: number;
  steps: number;
}

/**
 * 效能 HUD ＋ 動態降級。
 * 滾動 3 秒平均幀時間 > 19ms（低於約 52 FPS）就降一級：同屏上限、粒子預算、透鏡濾鏡一起降。
 * 只降不升，避免來回抖動。網址加 ?fx=low|mid|high 可鎖定等級。
 */
export class PerfMonitor {
  visible: boolean;
  private readonly frames: number[] = [];
  private sim = 0;
  private render = 0;
  private acc = 0;
  private slowT = 0;
  private grace = 3;

  constructor(
    private readonly el: HTMLElement,
    visible: boolean,
    private readonly locked: boolean,
    private readonly onDowngrade: (t: TierName) => void,
  ) {
    this.visible = visible;
    el.classList.toggle('hidden', !visible);
  }

  toggle() {
    this.visible = !this.visible;
    this.el.classList.toggle('hidden', !this.visible);
  }

  sample(s: PerfSample, w: World, extra: { tier: TierName; particles: number; view: string; renderer: string }, playing: boolean) {
    this.frames.push(s.frameMs);
    if (this.frames.length > 180) this.frames.shift();
    this.sim += (s.simMs - this.sim) * 0.1;
    this.render += (s.renderMs - this.render) * 0.1;

    if (playing && !this.locked) {
      this.grace -= s.frameMs / 1000;
      if (this.grace <= 0) {
        const avg = this.avg();
        this.slowT = avg > 19 ? this.slowT + s.frameMs / 1000 : 0;
        const idx = TIER_ORDER.indexOf(extra.tier);
        if (this.slowT > 3 && idx > 0) {
          this.slowT = 0;
          this.grace = 4;
          this.frames.length = 0;
          this.onDowngrade(TIER_ORDER[idx - 1]);
        }
      }
    }

    this.acc += s.frameMs;
    if (this.acc < 250 || !this.visible) return;
    this.acc = 0;
    const avg = this.avg();
    const sorted = [...this.frames].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
    const pr = w.prof;
    this.el.textContent = [
      `FPS ${(1000 / avg).toFixed(0).padStart(3)}  幀 ${avg.toFixed(1)}ms  p95 ${p95.toFixed(1)}ms`,
      `模擬 ${this.sim.toFixed(2)}ms  渲染 ${this.render.toFixed(2)}ms`,
      `  網格 ${pr.grid.toFixed(2)} 移動 ${pr.move.toFixed(2)} 技能 ${pr.skills.toFixed(2)} 連鎖 ${pr.chain.toFixed(2)}`,
      `殭屍 ${w.zombies.count}/${w.cap}  粒子 ${extra.particles}  連鎖佇列 ${w.chain.count}`,
      `等級 ${TIERS[extra.tier].label}${this.locked ? '（鎖定）' : ''}  ${extra.view}  ${extra.renderer}`,
    ].join('\n');
  }

  private avg() {
    if (this.frames.length === 0) return 16.7;
    let s = 0;
    for (const f of this.frames) s += f;
    return s / this.frames.length;
  }
}
