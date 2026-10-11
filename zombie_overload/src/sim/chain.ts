import { CHAIN } from './content';

export const EV_SHARD = 0;
export const EV_BURST = 1;
export const EV_PLAGUE = 2;
export const EV_COLLAPSE = 3;

/**
 * 連鎖事件佇列：每個反應都延遲幾十毫秒才結算。
 * 1) 畫面上看起來是一圈圈往外擴散的波浪
 * 2) 運算量自然攤到多個 tick
 * 每 tick 最多結算 budgetPerTick 個，超過的順延到下個 tick。
 */
export class ChainQueue {
  readonly kind = new Uint8Array(CHAIN.maxPending);
  readonly x = new Float32Array(CHAIN.maxPending);
  readonly y = new Float32Array(CHAIN.maxPending);
  readonly due = new Int32Array(CHAIN.maxPending);
  readonly depth = new Uint8Array(CHAIN.maxPending);
  readonly chain = new Int32Array(CHAIN.maxPending);
  readonly a = new Float32Array(CHAIN.maxPending);
  readonly b = new Float32Array(CHAIN.maxPending);
  count = 0;
  dropped = 0;

  /** 回傳是否成功排入（超過深度上限或佇列滿則丟棄） */
  push(kind: number, x: number, y: number, due: number, depth: number, chain: number, a = 0, b = 0): boolean {
    if (depth > CHAIN.maxDepth) return false;
    if (this.count >= CHAIN.maxPending) {
      this.dropped++;
      return false;
    }
    const i = this.count++;
    this.kind[i] = kind;
    this.x[i] = x;
    this.y[i] = y;
    this.due[i] = due;
    this.depth[i] = depth;
    this.chain[i] = chain;
    this.a[i] = a;
    this.b[i] = b;
    return true;
  }

  /**
   * 取出到期事件交給 run 執行。run 期間新推入的事件（延遲 ≥ 1 tick）不會在本輪執行。
   * 回傳本輪處理數。
   */
  drain(tick: number, budget: number, run: (i: number) => void): number {
    const n = this.count;
    let done = 0;
    let w = 0;
    for (let i = 0; i < n; i++) {
      if (this.due[i] <= tick && done < budget) {
        run(i);
        done++;
      } else {
        this.move(i, w++);
      }
    }
    // run() 期間新增的事件接在 n 之後，往前搬
    for (let i = n; i < this.count; i++) this.move(i, w++);
    this.count = w;
    return done;
  }

  private move(from: number, to: number) {
    if (from === to) return;
    this.kind[to] = this.kind[from];
    this.x[to] = this.x[from];
    this.y[to] = this.y[from];
    this.due[to] = this.due[from];
    this.depth[to] = this.depth[from];
    this.chain[to] = this.chain[from];
    this.a[to] = this.a[from];
    this.b[to] = this.b[from];
  }
}

const TRACK = 1024;

/**
 * 每一條連鎖有自己的 id：從「根」（碎裂、毒爆、黑洞坍縮、星艦掃蕩）開始，
 * 由它引發的事件與擊殺都記在同一條上。佇列裡還有這條的事件、或最近剛有擊殺，就算還在進行。
 * 不同來源的零星反應不會被串成一條假的超長連鎖。
 */
export class ChainTracker {
  readonly count = new Int32Array(TRACK);
  readonly last = new Int32Array(TRACK);
  readonly pending = new Int32Array(TRACK);
  readonly active: number[] = [];
  private next = 0;

  open(tick: number): number {
    const id = this.next;
    this.next = (this.next + 1) & (TRACK - 1);
    this.count[id] = 0;
    this.last[id] = tick;
    this.pending[id] = 0;
    this.active.push(id);
    return id;
  }

  hit(id: number, tick: number) {
    this.count[id]++;
    this.last[id] = tick;
  }

  /** 清掉已結束的連鎖（結束的計數寫進 ended），回傳進行中最大的連鎖數 */
  update(tick: number, windowTicks: number, ended: number[]): number {
    let best = 0;
    const act = this.active;
    for (let i = act.length - 1; i >= 0; i--) {
      const id = act[i];
      if (this.pending[id] <= 0 && tick - this.last[id] > windowTicks) {
        ended.push(this.count[id]);
        act[i] = act[act.length - 1];
        act.pop();
        continue;
      }
      if (this.count[id] > best) best = this.count[id];
    }
    return best;
  }
}
