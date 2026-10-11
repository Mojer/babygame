import { DEAD, MAP_H, MAP_W } from './content';
import type { Input, World } from './world';

const buf = new Int32Array(4096);

/**
 * 簡單的自動玩家（壓測與平衡模擬用）：
 * 避開附近屍群、有空檔就撿寶石、繞著廣場中心走、被包圍時衝刺、畫面上殭屍夠多才放星艦掃蕩。
 * 不是好玩家，但比亂走更接近真人，平衡數據才有參考價值。
 */
export function botInput(w: World, input: Input) {
  const p = w.player;
  const z = w.zombies;
  const n = w.grid.query(z, p.x, p.y, 120, buf);
  let fx = 0;
  let fy = 0;
  let close = 0;
  for (let i = 0; i < n; i++) {
    const s = buf[i];
    if (z.status[s] & DEAD) continue;
    const dx = p.x - z.x[s];
    const dy = p.y - z.y[s];
    const d2 = dx * dx + dy * dy + 1;
    fx += (dx / d2) * 60;
    fy += (dy / d2) * 60;
    if (d2 < 900) close++;
  }
  // 沒被貼身時去撿最近的經驗寶石
  if (close < 2) {
    const g = w.gems;
    let best = -1;
    let bestD = 200 * 200;
    for (let i = 0; i < g.count; i++) {
      const d = (g.x[i] - p.x) ** 2 + (g.y[i] - p.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best >= 0) {
      const d = Math.sqrt(bestD) + 1;
      fx += ((g.x[best] - p.x) / d) * 0.9;
      fy += ((g.y[best] - p.y) / d) * 0.9;
    }
  }
  // 繞場中心慢慢轉，離中心太遠就拉回來
  const cx = MAP_W / 2 - p.x;
  const cy = MAP_H / 2 - p.y;
  const cd = Math.hypot(cx, cy) + 1;
  const orbit = 0.35;
  fx += (-cy / cd) * orbit + (cx / cd) * Math.max(0, (cd - 420) / 300);
  fy += (cx / cd) * orbit + (cy / cd) * Math.max(0, (cd - 420) / 300);
  const l = Math.hypot(fx, fy);
  input.mx = l > 0.05 ? fx / l : 0;
  input.my = l > 0.05 ? fy / l : 0;
  input.dash = close >= 4 && p.dashCd <= 0;
  if (p.ult >= 1) {
    const onScreen = w.grid.query(z, p.x, p.y, Math.min(w.viewW, w.viewH) / 2, buf);
    input.ult = onScreen >= 120 || p.hp < p.maxHp * 0.35;
  }
}
