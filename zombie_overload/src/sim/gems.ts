import { GEMS } from './content';

/**
 * 經驗寶石。超過上限時不再新增，而是把經驗值併進既有寶石並變成大顆（紅寶石），
 * 擊殺幾萬隻也不會鋪滿整個畫面。
 */
export class Gems {
  readonly cap = GEMS.cap;
  readonly x = new Float32Array(GEMS.cap);
  readonly y = new Float32Array(GEMS.cap);
  readonly value = new Float32Array(GEMS.cap);
  readonly speed = new Float32Array(GEMS.cap);
  readonly magnet = new Uint8Array(GEMS.cap);
  count = 0;
  private mergeCursor = 0;

  spawn(x: number, y: number, v: number) {
    if (this.count >= this.cap) {
      const i = this.mergeCursor++ % this.count;
      this.value[i] += v;
      return;
    }
    const i = this.count++;
    this.x[i] = x;
    this.y[i] = y;
    this.value[i] = v;
    this.speed[i] = 0;
    this.magnet[i] = 0;
  }

  /** 回傳本 tick 撿到的經驗值 */
  update(px: number, py: number, pickup: number, dt: number): number {
    let gained = 0;
    const r2 = pickup * pickup;
    for (let i = 0; i < this.count; i++) {
      const dx = px - this.x[i];
      const dy = py - this.y[i];
      const d2 = dx * dx + dy * dy;
      if (!this.magnet[i] && d2 < r2) this.magnet[i] = 1;
      if (!this.magnet[i]) continue;
      if (d2 < 49) {
        gained += this.value[i];
        this.removeAt(i);
        i--;
        continue;
      }
      const sp = (this.speed[i] = Math.min(420, this.speed[i] + 900 * dt));
      const d = Math.sqrt(d2);
      this.x[i] += (dx / d) * sp * dt;
      this.y[i] += (dy / d) * sp * dt;
    }
    return gained;
  }

  private removeAt(i: number) {
    const last = --this.count;
    this.x[i] = this.x[last];
    this.y[i] = this.y[last];
    this.value[i] = this.value[last];
    this.speed[i] = this.speed[last];
    this.magnet[i] = this.magnet[last];
  }
}
