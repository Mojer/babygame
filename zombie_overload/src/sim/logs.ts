/**
 * sim → 渲染層的高頻事件，用 typed array 記錄避免每次死亡都配置物件。
 * 渲染層每幀讀完後 clear()。滿了就丟棄（只影響特效，不影響遊戲結果）。
 */
export class DeathLog {
  readonly cap: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly kind: Uint8Array;
  readonly cause: Uint8Array;
  readonly facing: Float32Array;
  count = 0;

  constructor(cap = 8192) {
    this.cap = cap;
    this.x = new Float32Array(cap);
    this.y = new Float32Array(cap);
    this.kind = new Uint8Array(cap);
    this.cause = new Uint8Array(cap);
    this.facing = new Float32Array(cap);
  }

  push(x: number, y: number, kind: number, cause: number, facing: number) {
    if (this.count >= this.cap) return;
    const i = this.count++;
    this.x[i] = x;
    this.y[i] = y;
    this.kind[i] = kind;
    this.cause[i] = cause;
    this.facing[i] = facing;
  }

  clear() {
    this.count = 0;
  }
}

export const FX_SHARD = 0;
export const FX_BURST = 1;
export const FX_PLAGUE = 2;
export const FX_COLLAPSE = 3;
export const FX_SCORCH = 4;
export const FX_BOLT_HIT = 5;
export const FX_FREEZE = 6;
/** 茜的範圍爆破砲命中（a = 半徑） */
export const FX_SPLASH = 7;

export class FxLog {
  readonly cap: number;
  readonly kind: Uint8Array;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly a: Float32Array;
  count = 0;

  constructor(cap = 4096) {
    this.cap = cap;
    this.kind = new Uint8Array(cap);
    this.x = new Float32Array(cap);
    this.y = new Float32Array(cap);
    this.a = new Float32Array(cap);
  }

  push(kind: number, x: number, y: number, a = 0) {
    if (this.count >= this.cap) return;
    const i = this.count++;
    this.kind[i] = kind;
    this.x[i] = x;
    this.y[i] = y;
    this.a[i] = a;
  }

  clear() {
    this.count = 0;
  }
}
