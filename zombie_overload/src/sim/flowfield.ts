import { CELL, GRID_H, GRID_W } from './content';

const CELLS = GRID_W * GRID_H;
export const FLOW_INF = 0x3fffffff;
const W_ORTHO = 5; // 5:7 近似 1:√2，距離場接近歐氏距離
const W_DIAG = 7;
const BUCKETS = 8; // 最大邊權 7 < 8，環狀桶即可（Dial's algorithm）
const W = GRID_W;
// 8 方向：0-3 直向，4-7 斜向（斜向對應的兩個直向分量）
const OFF = [-1, 1, -W, W, -W - 1, -W + 1, W - 1, W + 1];
const DIAG_A = [0, 1, 0, 1]; // 左/右
const DIAG_B = [2, 2, 3, 3]; // 上/下

/**
 * 以玩家為源頭的距離場＋方向場。數千隻殭屍共用同一張圖，
 * 不需要各自跑 A*。最外圈格子強制視為牆，內層迴圈不用做邊界檢查。
 */
export class FlowField {
  readonly dist = new Int32Array(CELLS);
  readonly dirX = new Float32Array(CELLS);
  readonly dirY = new Float32Array(CELLS);
  private readonly wall = new Uint8Array(CELLS);
  private readonly buckets = new Int32Array(BUCKETS * CELLS);
  private readonly bucketLen = new Int32Array(BUCKETS);
  private srcCell = -1;

  constructor(blocked: Uint8Array) {
    for (let c = 0; c < CELLS; c++) {
      const x = c % W;
      const y = (c / W) | 0;
      this.wall[c] = blocked[c] || x === 0 || y === 0 || x === W - 1 || y === GRID_H - 1 ? 1 : 0;
    }
  }

  /** 玩家換格子才重算，回傳是否有重算 */
  update(px: number, py: number, force = false): boolean {
    const gx = Math.min(W - 2, Math.max(1, (px / CELL) | 0));
    const gy = Math.min(GRID_H - 2, Math.max(1, (py / CELL) | 0));
    const src = gy * W + gx;
    if (src === this.srcCell && !force) return false;
    this.srcCell = src;
    this.integrate(src);
    this.gradient();
    return true;
  }

  private integrate(src: number) {
    const { dist, wall, buckets, bucketLen } = this;
    dist.fill(FLOW_INF);
    bucketLen.fill(0);
    if (wall[src]) return;
    dist[src] = 0;
    buckets[0] = src;
    bucketLen[0] = 1;
    let pending = 1;
    for (let d = 0; pending > 0; d++) {
      const b = d & (BUCKETS - 1);
      const base = b * CELLS;
      while (bucketLen[b] > 0) {
        const c = buckets[base + --bucketLen[b]];
        pending--;
        if (dist[c] !== d) continue;
        let okMask = 0;
        for (let o = 0; o < 8; o++) {
          let w: number;
          if (o < 4) {
            if (wall[c + OFF[o]]) continue;
            okMask |= 1 << o;
            w = W_ORTHO;
          } else {
            // 斜向：兩個直向都通才能走，避免切角穿牆
            const k = o - 4;
            if (!(okMask & (1 << DIAG_A[k])) || !(okMask & (1 << DIAG_B[k]))) continue;
            w = W_DIAG;
          }
          const n = c + OFF[o];
          if (wall[n]) continue;
          const nd = d + w;
          if (nd >= dist[n]) continue;
          dist[n] = nd;
          const nb = nd & (BUCKETS - 1);
          buckets[nb * CELLS + bucketLen[nb]++] = n;
          pending++;
        }
      }
    }
  }

  /** Sobel 梯度 → 平滑的行進方向；牆壁當作「比自己更遠」，自然把殭屍推離牆角 */
  private gradient() {
    const { dist, dirX, dirY, wall } = this;
    for (let c = W + 1; c < CELLS - W - 1; c++) {
      const d0 = dist[c];
      if (wall[c] || d0 >= FLOW_INF) {
        dirX[c] = 0;
        dirY[c] = 0;
        continue;
      }
      const far = d0 + 16;
      let v: number;
      v = dist[c - W - 1];
      const nw = wall[c - W - 1] || v >= FLOW_INF ? far : v;
      v = dist[c - W];
      const n = wall[c - W] || v >= FLOW_INF ? far : v;
      v = dist[c - W + 1];
      const ne = wall[c - W + 1] || v >= FLOW_INF ? far : v;
      v = dist[c - 1];
      const w = wall[c - 1] || v >= FLOW_INF ? far : v;
      v = dist[c + 1];
      const e = wall[c + 1] || v >= FLOW_INF ? far : v;
      v = dist[c + W - 1];
      const sw = wall[c + W - 1] || v >= FLOW_INF ? far : v;
      v = dist[c + W];
      const so = wall[c + W] || v >= FLOW_INF ? far : v;
      v = dist[c + W + 1];
      const se = wall[c + W + 1] || v >= FLOW_INF ? far : v;
      const gx = ne + 2 * e + se - (nw + 2 * w + sw);
      const gy = sw + 2 * so + se - (nw + 2 * n + ne);
      const len2 = gx * gx + gy * gy;
      if (len2 < 1e-8) {
        dirX[c] = 0;
        dirY[c] = 0;
      } else {
        const inv = -1 / Math.sqrt(len2);
        dirX[c] = gx * inv;
        dirY[c] = gy * inv;
      }
    }
  }
}
