import { ZOMBIE_KINDS } from './content';

/**
 * 殭屍資料池（SoA）。每個欄位是一條 typed array，以 slot 索引。
 * active[0..count) 是存活 slot 的緊密清單，移除用 swap-remove，O(1)。
 * 整個遊戲過程不會為殭屍配置任何新物件。
 */
export class Zombies {
  readonly cap: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  /** 上一個 tick 的位置，渲染插值用 */
  readonly px: Float32Array;
  readonly py: Float32Array;
  readonly vx: Float32Array;
  readonly vy: Float32Array;
  readonly hp: Float32Array;
  readonly facing: Float32Array;
  readonly anim: Float32Array;
  readonly frozenT: Float32Array;
  readonly volatileT: Float32Array;
  /** 受擊閃白剩餘時間 */
  readonly flash: Float32Array;
  readonly kind: Uint8Array;
  readonly status: Uint8Array;
  /** 被哪個黑洞吸住（-1 = 無） */
  readonly hole: Int8Array;
  readonly cell: Int32Array;

  readonly active: Int32Array;
  readonly pos: Int32Array;
  count = 0;
  private readonly free: Int32Array;
  private freeTop: number;

  constructor(cap: number) {
    this.cap = cap;
    this.x = new Float32Array(cap);
    this.y = new Float32Array(cap);
    this.px = new Float32Array(cap);
    this.py = new Float32Array(cap);
    this.vx = new Float32Array(cap);
    this.vy = new Float32Array(cap);
    this.hp = new Float32Array(cap);
    this.facing = new Float32Array(cap);
    this.anim = new Float32Array(cap);
    this.frozenT = new Float32Array(cap);
    this.volatileT = new Float32Array(cap);
    this.flash = new Float32Array(cap);
    this.kind = new Uint8Array(cap);
    this.status = new Uint8Array(cap);
    this.hole = new Int8Array(cap);
    this.cell = new Int32Array(cap);
    this.active = new Int32Array(cap);
    this.pos = new Int32Array(cap).fill(-1);
    this.free = new Int32Array(cap);
    for (let i = 0; i < cap; i++) this.free[i] = cap - 1 - i;
    this.freeTop = cap;
  }

  get full() {
    return this.freeTop === 0;
  }

  spawn(kind: number, x: number, y: number, phase: number, hpMul = 1): number {
    if (this.freeTop === 0) return -1;
    const s = this.free[--this.freeTop];
    this.x[s] = this.px[s] = x;
    this.y[s] = this.py[s] = y;
    this.vx[s] = this.vy[s] = 0;
    this.hp[s] = ZOMBIE_KINDS[kind].hp * hpMul;
    this.facing[s] = phase * Math.PI * 2;
    this.anim[s] = phase * 4;
    this.frozenT[s] = 0;
    this.volatileT[s] = 0;
    this.flash[s] = 0;
    this.kind[s] = kind;
    this.status[s] = 0;
    this.hole[s] = -1;
    this.pos[s] = this.count;
    this.active[this.count++] = s;
    return s;
  }

  remove(s: number) {
    const i = this.pos[s];
    if (i < 0) return;
    const last = this.active[--this.count];
    this.active[i] = last;
    this.pos[last] = i;
    this.pos[s] = -1;
    this.free[this.freeTop++] = s;
  }
}
