import { CELL, DEAD, GRID_H, GRID_W, KIND_RADIUS, MAX_ZOMBIE_RADIUS } from './content';
import type { Zombies } from './zombies';

const CELLS = GRID_W * GRID_H;

export function cellOf(x: number, y: number) {
  let cx = (x / CELL) | 0;
  let cy = (y / CELL) | 0;
  if (cx < 0) cx = 0;
  else if (cx >= GRID_W) cx = GRID_W - 1;
  if (cy < 0) cy = 0;
  else if (cy >= GRID_H) cy = GRID_H - 1;
  return cy * GRID_W + cx;
}

/**
 * 均勻空間網格。每個 tick 用 counting sort 重建：
 * count → prefix sum → 依序填入，O(n)，不配置記憶體。
 * items[start[c] .. start[c+1]) 就是第 c 格裡的殭屍 slot。
 */
export class Grid {
  readonly start = new Int32Array(CELLS + 1);
  /** 每格殭屍數，同時當密度圖用 */
  readonly count = new Int32Array(CELLS);
  readonly items: Int32Array;
  private readonly cursor = new Int32Array(CELLS);

  constructor(cap: number) {
    this.items = new Int32Array(cap);
  }

  build(z: Zombies) {
    const { count, start, cursor, items } = this;
    const act = z.active;
    const n = z.count;
    const xs = z.x;
    const ys = z.y;
    const cells = z.cell;
    count.fill(0);
    for (let k = 0; k < n; k++) {
      const s = act[k];
      const c = cellOf(xs[s], ys[s]);
      cells[s] = c;
      count[c]++;
    }
    let acc = 0;
    for (let c = 0; c < CELLS; c++) {
      start[c] = acc;
      cursor[c] = acc;
      acc += count[c];
    }
    start[CELLS] = acc;
    for (let k = 0; k < n; k++) {
      const s = act[k];
      items[cursor[cells[s]]++] = s;
    }
  }

  /** 收集圓心距離 ≤ r + 殭屍半徑 的存活殭屍，寫進 out，回傳數量 */
  query(z: Zombies, x: number, y: number, r: number, out: Int32Array, max = out.length): number {
    const reach = r + MAX_ZOMBIE_RADIUS;
    const x0 = Math.max(0, ((x - reach) / CELL) | 0);
    const x1 = Math.min(GRID_W - 1, ((x + reach) / CELL) | 0);
    const y0 = Math.max(0, ((y - reach) / CELL) | 0);
    const y1 = Math.min(GRID_H - 1, ((y + reach) / CELL) | 0);
    const { start, items } = this;
    const xs = z.x;
    const ys = z.y;
    const st = z.status;
    const kd = z.kind;
    let n = 0;
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const c = cy * GRID_W + cx;
        for (let i = start[c], e = start[c + 1]; i < e; i++) {
          const s = items[i];
          if (st[s] & DEAD) continue;
          const dx = xs[s] - x;
          const dy = ys[s] - y;
          const rr = r + KIND_RADIUS[kd[s]];
          if (dx * dx + dy * dy <= rr * rr) {
            out[n++] = s;
            if (n >= max) return n;
          }
        }
      }
    }
    return n;
  }

  /** 由近到遠一圈一圈找最近的存活殭屍 */
  nearest(z: Zombies, x: number, y: number, maxR: number, skipFrozen = false): number {
    const ccx = (x / CELL) | 0;
    const ccy = (y / CELL) | 0;
    const rings = Math.ceil(maxR / CELL) + 1;
    let best = -1;
    let bestD = maxR * maxR;
    const { start, items } = this;
    for (let ring = 0; ring <= rings; ring++) {
      // 這一圈最近可能的距離已超過目前最佳 → 結束
      const minD = (ring - 1) * CELL;
      if (best >= 0 && minD > 0 && minD * minD > bestD) break;
      for (let cy = ccy - ring; cy <= ccy + ring; cy++) {
        if (cy < 0 || cy >= GRID_H) continue;
        const edgeRow = cy === ccy - ring || cy === ccy + ring;
        for (let cx = ccx - ring; cx <= ccx + ring; cx += edgeRow ? 1 : ring * 2 || 1) {
          if (cx < 0 || cx >= GRID_W) continue;
          const c = cy * GRID_W + cx;
          for (let i = start[c], e = start[c + 1]; i < e; i++) {
            const s = items[i];
            const st = z.status[s];
            if (st & DEAD || (skipFrozen && st & 1)) continue;
            const dx = z.x[s] - x;
            const dy = z.y[s] - y;
            const d = dx * dx + dy * dy;
            if (d < bestD) {
              bestD = d;
              best = s;
            }
          }
        }
      }
    }
    return best;
  }

  /** 在矩形範圍內找 5×5 格密度最高的位置（技能鎖定屍群用）；minDist 內的格子不列入（避開玩家本人） */
  densest(x: number, y: number, halfW: number, halfH: number, out: { x: number; y: number; n: number }, minDist = 0) {
    const x0 = Math.max(2, ((x - halfW) / CELL) | 0);
    const x1 = Math.min(GRID_W - 3, ((x + halfW) / CELL) | 0);
    const y0 = Math.max(2, ((y - halfH) / CELL) | 0);
    const y1 = Math.min(GRID_H - 3, ((y + halfH) / CELL) | 0);
    const count = this.count;
    let best = -1;
    out.n = 0;
    const min2 = minDist * minDist;
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const ox = (cx + 0.5) * CELL - x;
        const oy = (cy + 0.5) * CELL - y;
        if (ox * ox + oy * oy < min2) continue;
        let sum = 0;
        for (let oy = -2; oy <= 2; oy++) {
          const row = (cy + oy) * GRID_W + cx;
          sum += count[row - 2] + count[row - 1] + count[row] + count[row + 1] + count[row + 2];
        }
        if (sum > best) {
          best = sum;
          out.x = (cx + 0.5) * CELL;
          out.y = (cy + 0.5) * CELL;
          out.n = sum;
        }
      }
    }
    return out;
  }
}
