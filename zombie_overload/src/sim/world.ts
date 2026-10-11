import { ChainQueue, ChainTracker, EV_BURST, EV_COLLAPSE, EV_PLAGUE, EV_SHARD } from './chain';
import {
  BORDER,
  BRUTE,
  CAUSE_BLAST,
  CAUSE_BURN,
  CAUSE_NORMAL,
  CAUSE_PLAGUE,
  CAUSE_SHATTER,
  CHAIN,
  CORE,
  DEAD,
  DIRECTOR,
  FIXED_STEP,
  MUTANT,
  FROZEN,
  GRID_H,
  GRID_W,
  KIND_RADIUS,
  MAP_H,
  MAP_W,
  PLAYER,
  PULLED,
  REACTION,
  RUN_SECONDS,
  FINAL,
  RUNNER,
  SKILLS,
  T_AREA,
  T_BEAM,
  T_DOT,
  T_EXPLOSION,
  T_HIT,
  T_SHARD,
  T_SHOCK,
  TIERS,
  type TierName,
  VOLATILE,
  WALKER,
  xpForLevel,
  ZOMBIE_KINDS,
} from './content';
import { FLOW_INF, FlowField } from './flowfield';
import { Gems } from './gems';
import { cellOf, Grid } from './grid';
import { DeathLog, FX_BOLT_HIT, FX_SPLASH, FX_BURST, FX_COLLAPSE, FX_FREEZE, FX_PLAGUE, FX_SCORCH, FX_SHARD, FxLog } from './logs';
import { CHARACTERS, type CharacterDef, type CharacterId } from './characters';
import { buildMap, type MapLayout } from './map';
import { DEATH_REACTIONS, REACTIVE_STATUS, STATUS_REACTIONS } from './reactions';
import { Rng } from './rng';
import { baseMods, FALLBACK_UPGRADE, type Mods, type Upgrade, UPGRADES } from './upgrades';
import { Zombies } from './zombies';

export interface WorldOptions {
  seed?: number;
  tier?: TierName;
  /** 覆寫同屏殭屍上限 */
  cap?: number;
  god?: boolean;
  /** 開局直接把殭屍補滿到上限 */
  stress?: boolean;
  /** 升級自動選第一個（壓測／無人值守） */
  autoLevel?: boolean;
  /** 從第幾秒開始（跳過前期） */
  startTime?: number;
  /** 不生怪（測試用） */
  noSpawn?: boolean;
  /** 關閉自動技能（壓測只量移動成本） */
  noSkills?: boolean;
  character?: CharacterId;
  ult?: UltKind;
}

export interface Input {
  mx: number;
  my: number;
  dash: boolean;
  ult: boolean;
}

export type GameEvent =
  | { type: 'nova'; x: number; y: number; r: number }
  | { type: 'holeStart'; x: number; y: number; r: number }
  | { type: 'holeEnd'; x: number; y: number; r: number; n: number }
  | { type: 'beamStart'; x: number; y: number }
  | { type: 'ult'; x: number; y: number; kind: UltKind }
  | { type: 'ultImpact'; x: number; y: number }
  | { type: 'ultPulse'; x: number; y: number }
  | { type: 'dash'; x: number; y: number }
  | { type: 'bolt' }
  | { type: 'hurt' }
  | { type: 'levelup'; level: number }
  | { type: 'surge'; angle: number }
  | { type: 'mutant'; x: number; y: number }
  | { type: 'mutantDown'; x: number; y: number }
  | { type: 'finalWave'; count: number }
  | { type: 'finish' }
  | { type: 'chainEnd'; count: number }
  | { type: 'gameover'; win: boolean };

export interface Hole {
  active: boolean;
  x: number;
  y: number;
  r: number;
  t: number;
  dur: number;
}

export interface Beam {
  active: boolean;
  /** 0 = 預警, 1 = 掃射 */
  phase: number;
  t: number;
  x0: number;
  y0: number;
  dx: number;
  dy: number;
  len: number;
  r: number;
  hx: number;
  hy: number;
  scorchX: number;
  scorchY: number;
}

/**
 * 大招（兩個提案，開局選）：
 * - ship「星艦砲擊」：戰艦從畫面外飛到主角上空，往地面發射一圈擴散到整個畫面的衝擊波，再飛走。
 * - pylon「天降巨砲」：巨型武器從外太空墜落插進地面，落地後朝 360° 連續散射數輪砲彈，砲彈貫穿掃過整個畫面。
 * 衝擊波的觸發類型和以前相同（凍結碎裂、不穩定引爆照樣成立）。
 */
export type UltKind = 'ship' | 'pylon';

export interface Ult {
  active: boolean;
  kind: UltKind;
  t: number;
  /** 0 進場、1 攻擊中、2 退場 */
  phase: number;
  x: number;
  y: number;
  /** 戰艦目前位置（地面投影）、水平方向（翻轉用）、垂直方向（傾斜用） */
  hx: number;
  hy: number;
  dir: number;
  dy: number;
  chain: number;
  /** 天降巨砲已放出的衝擊波數 */
  pulses: number;
  /** 畫面半寬高（衝擊波最大半徑、戰艦進場距離） */
  hw: number;
  hh: number;
}

export interface Ring {
  active: boolean;
  x: number;
  y: number;
  r: number;
  max: number;
  speed: number;
}

/** 天降巨砲散射的砲彈（貫穿；uid 用來記錄每隻殭屍最後被哪一發打過） */
export interface Shell {
  active: boolean;
  uid: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 已飛行距離／最大距離 */
  d: number;
  max: number;
}

export interface Player {
  x: number;
  y: number;
  px: number;
  py: number;
  facing: number;
  moving: boolean;
  hp: number;
  maxHp: number;
  dashT: number;
  dashCd: number;
  dashDx: number;
  dashDy: number;
  hurtT: number;
  xp: number;
  xpNext: number;
  level: number;
  ult: number;
}

export interface Profile {
  grid: number;
  move: number;
  skills: number;
  chain: number;
  other: number;
}

const BOLT_CAP = 256;

// 鄰格搜尋順序：先自己那格，再上下左右，最後斜角（K 上限截斷時偏差最小）
const NB_X = [0, -1, 1, 0, 0, -1, 1, -1, 1];
const NB_Y = [0, 0, 0, -1, 1, -1, -1, 1, 1];
const KIND_SPEED = Float32Array.from(ZOMBIE_KINDS, k => k.speed);
const KIND_DPS = Float32Array.from(ZOMBIE_KINDS, k => k.dps);
const KIND_XP = Float32Array.from(ZOMBIE_KINDS, k => k.xp);

const now = () => performance.now();

export class World {
  readonly rng: Rng;
  readonly map: MapLayout;
  readonly zombies: Zombies;
  readonly grid: Grid;
  readonly flow: FlowField;
  readonly gems = new Gems();
  readonly chain = new ChainQueue();
  readonly chains = new ChainTracker();
  readonly deaths = new DeathLog();
  readonly fx = new FxLog();
  readonly events: GameEvent[] = [];
  readonly player: Player;
  readonly holes: Hole[] = [];
  readonly beams: Beam[] = [];
  readonly ult: Ult = { active: false, kind: 'ship', t: 0, phase: 0, x: 0, y: 0, hx: 0, hy: 0, dir: 1, dy: 1, chain: -1, pulses: 0, hw: 0, hh: 0 };
  readonly rings: Ring[] = [0, 1, 2, 3].map(() => ({ active: false, x: 0, y: 0, r: 0, max: 0, speed: 0 }));
  readonly shells: Shell[] = [];
  private shellUid = 0;
  private shellHit!: Int32Array;
  readonly bolts = {
    x: new Float32Array(BOLT_CAP),
    y: new Float32Array(BOLT_CAP),
    vx: new Float32Array(BOLT_CAP),
    vy: new Float32Array(BOLT_CAP),
    life: new Float32Array(BOLT_CAP),
    pierce: new Uint8Array(BOLT_CAP),
    /** 每顆子彈已命中過的殭屍（貫穿時不重複打同一隻），每顆最多記 4 隻 */
    hits: new Int32Array(BOLT_CAP * 4),
    count: 0,
  };
  character: CharacterDef = CHARACTERS.akane;
  readonly mods: Mods = baseMods();
  readonly upgradeLevels: Record<string, number> = {};
  readonly prof: Profile = { grid: 0, move: 0, skills: 0, chain: 0, other: 0 };
  readonly stats = { kills: 0, maxChain: 0, combo: 0, chainDropped: 0, mutantKills: 0, ults: 0, clearTime: 0 };
  /** run → final（最終波，擊倒全部巨大變異體）→ finish（清場演出，數秒後結算） */
  finale: 'run' | 'final' | 'finish' = 'run';
  finalLeft = 0;
  finalTotal = 0;
  private finishT = 0;

  tier: TierName;
  cap: number;
  time = 0;
  tick = 0;
  over: '' | 'win' | 'lose' = '';
  pendingLevels = 0;
  /** 主迴圈消耗：大招時短暫停格 */
  hitStop = 0;
  /** 殭屍血量倍率，隨時間成長；反應傷害同步放大，連鎖不會後期失效 */
  hpMul = 1;
  viewW = 600;
  viewH = 400;

  private readonly opts: WorldOptions;
  private readonly tmp: Int32Array;
  private readonly tmp2: Int32Array;
  private readonly dead: Int32Array;
  private deadCount = 0;
  private sepNeighbors: number;
  private spawnAcc = 40;
  private readonly ended: number[] = [];
  private flowCooldown = 0;
  private boltCd = 0.5;
  private frostCd = 2;
  private holeCd = 5;
  private beamCd = 8;
  private nextSurge = 40;
  private nextMutant = 0;
  private surgeLeft = 0;
  private surgeAngle = 0;
  private hurtEventT = 0;
  private readonly dense = { x: 0, y: 0, n: 0 };

  constructor(opts: WorldOptions = {}) {
    this.opts = opts;
    const seed = opts.seed ?? 1;
    this.rng = new Rng(seed);
    this.map = buildMap(seed);
    this.tier = opts.tier ?? 'high';
    this.cap = opts.cap ?? TIERS[this.tier].cap;
    this.sepNeighbors = TIERS[this.tier].sepNeighbors;
    const poolCap = Math.max(this.cap, TIERS.high.cap) + 64;
    this.zombies = new Zombies(poolCap);
    this.shellHit = new Int32Array(poolCap).fill(-1);
    this.grid = new Grid(poolCap);
    this.flow = new FlowField(this.map.blocked);
    this.tmp = new Int32Array(poolCap);
    this.tmp2 = new Int32Array(poolCap);
    this.dead = new Int32Array(poolCap);
    for (let i = 0; i < 4; i++) this.holes.push({ active: false, x: 0, y: 0, r: 0, t: 0, dur: 0 });
    for (let i = 0; i < 2; i++)
      this.beams.push({ active: false, phase: 0, t: 0, x0: 0, y0: 0, dx: 1, dy: 0, len: 0, r: 0, hx: 0, hy: 0, scorchX: 0, scorchY: 0 });
    const { x, y } = this.map.spawn;
    this.player = {
      x, y, px: x, py: y, facing: -Math.PI / 2, moving: false,
      hp: PLAYER.hp, maxHp: PLAYER.hp, dashT: 0, dashCd: 0, dashDx: 0, dashDy: -1, hurtT: 0,
      xp: 0, xpNext: xpForLevel(1), level: 1, ult: 0,
    };
    this.setCharacter(opts.character ?? 'akane');
    this.ult.kind = opts.ult ?? 'ship';
    this.time = opts.startTime ?? 0;
    this.nextSurge = Math.max(DIRECTOR.surgeFirst, Math.ceil((this.time + 10) / DIRECTOR.surgeEvery) * DIRECTOR.surgeEvery - 10);
    this.hpMul = 1 + Math.min(this.time, RUN_SECONDS) / DIRECTOR.hpRamp;
    this.nextMutant = Math.max(DIRECTOR.mutantFirst, this.time + 20);
    this.flow.update(x, y, true);
    if (opts.stress && !opts.noSpawn) this.fillStress();
  }

  /** 開局前換角色（血量、速度、基本攻擊） */
  setCharacter(id: CharacterId) {
    this.character = CHARACTERS[id];
    this.player.hp = this.player.maxHp = this.character.hp;
  }

  setView(w: number, h: number) {
    this.viewW = w;
    this.viewH = h;
  }

  setTier(t: TierName) {
    this.tier = t;
    if (this.opts.cap === undefined) this.cap = TIERS[t].cap;
    this.sepNeighbors = TIERS[t].sepNeighbors;
  }

  // ───────────────────────── 主步進 ─────────────────────────

  step(input: Input) {
    if (this.over || this.pendingLevels > 0) return;
    const dt = FIXED_STEP;
    this.tick++;
    this.time += dt;
    this.hpMul = 1 + Math.min(this.time, RUN_SECONDS) / DIRECTOR.hpRamp;
    let t0 = now();
    const prof = this.prof;

    this.updatePlayer(input, dt);
    this.grid.build(this.zombies);
    if ((this.flowCooldown -= dt) <= 0 && this.flow.update(this.player.x, this.player.y)) this.flowCooldown = 0.1;
    let t1 = now();
    prof.grid = ema(prof.grid, t1 - t0);
    t0 = t1;

    this.updateZombies(dt);
    this.contactDamage(dt);
    t1 = now();
    prof.move = ema(prof.move, t1 - t0);
    t0 = t1;

    this.updateSkills(input, dt);
    this.updateBolts(dt);
    t1 = now();
    prof.skills = ema(prof.skills, t1 - t0);
    t0 = t1;

    this.chain.drain(this.tick, CHAIN.budgetPerTick, this.runEvent);
    this.stats.chainDropped = this.chain.dropped;
    t1 = now();
    prof.chain = ema(prof.chain, t1 - t0);
    t0 = t1;

    const xp = this.gems.update(this.player.x, this.player.y, PLAYER.pickup * this.mods.pickup, dt);
    if (xp > 0) this.gainXp(xp);
    this.updateDirector(dt);
    this.flushDead();
    this.ended.length = 0;
    this.stats.combo = this.chains.update(this.tick, Math.round(CHAIN.comboWindow / dt), this.ended);
    for (const n of this.ended) if (n >= CHAIN.bannerMin) this.events.push({ type: 'chainEnd', count: n });
    if (this.player.hp <= 0 && !this.over) {
      this.over = 'lose';
      this.events.push({ type: 'gameover', win: false });
    } else if (!this.over) this.updateFinale(dt);
    prof.other = ema(prof.other, now() - t0);
  }

  private countMutants() {
    const z = this.zombies;
    let n = 0;
    for (let k = 0; k < z.count; k++) {
      const s = z.active[k];
      if (z.kind[s] === MUTANT && !(z.status[s] & DEAD)) n++;
    }
    return n;
  }

  private updateFinale(dt: number) {
    if (this.finale === 'run') {
      if (this.time < RUN_SECONDS) return;
      // 最終波：主角周圍一圈巨大變異體（加上場上原本的）
      this.finale = 'final';
      const p = this.player;
      for (let i = 0; i < FINAL.mutants; i++) {
        const a = (i / FINAL.mutants) * Math.PI * 2 + this.rng.next() * 0.3;
        let ok = false;
        for (let tries = 0; tries < 8 && !ok; tries++) {
          const d = this.rng.range(FINAL.ringMin, FINAL.ringMax);
          ok = this.trySpawn(MUTANT, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d * 0.8);
        }
        if (!ok) this.spawnFar(MUTANT);
      }
      this.finalTotal = this.finalLeft = this.countMutants();
      const z = this.zombies;
      for (let k = 0; k < z.count; k++) {
        const s = z.active[k];
        if (z.kind[s] === MUTANT) z.hp[s] *= FINAL.hpScale;
      }
      this.events.push({ type: 'finalWave', count: this.finalTotal });
    } else if (this.finale === 'final') {
      this.finalLeft = this.countMutants();
      if (this.finalLeft > 0) return;
      // 全部擊倒：剩下的殭屍一起炸掉，進入 FINISH 演出
      this.finale = 'finish';
      this.finishT = 0;
      this.stats.clearTime = this.time;
      const z = this.zombies;
      const chain = this.chains.open(this.tick);
      for (let k = z.count - 1; k >= 0; k--) {
        const s = z.active[k];
        if (!(z.status[s] & DEAD)) this.damage(s, 1e9, T_SHOCK, 0, chain);
      }
      this.hitStop = Math.max(this.hitStop, 0.25);
      this.events.push({ type: 'finish' });
    } else if ((this.finishT += dt) >= FINAL.finishDelay) {
      this.over = 'win';
      this.events.push({ type: 'gameover', win: true });
    }
  }

  // ───────────────────────── 玩家 ─────────────────────────

  private updatePlayer(input: Input, dt: number) {
    const p = this.player;
    p.px = p.x;
    p.py = p.y;
    let mx = input.mx;
    let my = input.my;
    const ml = Math.hypot(mx, my);
    if (ml > 1) {
      mx /= ml;
      my /= ml;
    }
    p.dashCd -= dt;
    p.hurtT -= dt;
    if (input.dash && p.dashCd <= 0) {
      p.dashT = PLAYER.dashTime;
      p.dashCd = PLAYER.dashCooldown;
      if (ml > 0.1) {
        p.dashDx = mx / Math.min(1, ml);
        p.dashDy = my / Math.min(1, ml);
        const dl = Math.hypot(p.dashDx, p.dashDy);
        p.dashDx /= dl;
        p.dashDy /= dl;
      } else {
        p.dashDx = Math.cos(p.facing);
        p.dashDy = Math.sin(p.facing);
      }
      this.events.push({ type: 'dash', x: p.x, y: p.y });
    }
    let vx: number;
    let vy: number;
    if (p.dashT > 0) {
      p.dashT -= dt;
      vx = p.dashDx * PLAYER.dashSpeed;
      vy = p.dashDy * PLAYER.dashSpeed;
    } else {
      const sp = this.character.speed * this.mods.move;
      vx = mx * sp;
      vy = my * sp;
    }
    p.moving = vx * vx + vy * vy > 1;
    if (p.moving) p.facing = Math.atan2(vy, vx);
    const nx = p.x + vx * dt;
    if (!this.playerBlocked(nx, p.y)) p.x = nx;
    const ny = p.y + vy * dt;
    if (!this.playerBlocked(p.x, ny)) p.y = ny;
  }

  private playerBlocked(x: number, y: number) {
    const r = PLAYER.radius;
    const b = this.map.blocked;
    return b[cellOf(x - r, y - r)] || b[cellOf(x + r, y - r)] || b[cellOf(x - r, y + r)] || b[cellOf(x + r, y + r)];
  }

  private contactDamage(dt: number) {
    const p = this.player;
    const z = this.zombies;
    const n = this.grid.query(z, p.x, p.y, PLAYER.radius + 1.5, this.tmp, 64);
    let dps = 0;
    let touching = 0;
    for (let i = 0; i < n && touching < PLAYER.maxTouching; i++) {
      const s = this.tmp[i];
      if (z.status[s] & (FROZEN | PULLED)) continue;
      dps += KIND_DPS[z.kind[s]];
      touching++;
    }
    if (dps <= 0 || p.dashT > 0 || this.opts.god || this.finale === 'finish') return;
    p.hp -= dps * this.hpMul * dt;
    p.hurtT = 0.12;
    if ((this.hurtEventT -= dt) <= 0) {
      this.hurtEventT = 0.3;
      this.events.push({ type: 'hurt' });
    }
  }

  // ───────────────────────── 殭屍移動 ─────────────────────────

  private updateZombies(dt: number) {
    const z = this.zombies;
    const { x, y, vx, vy, status, kind, frozenT, volatileT, facing, anim, flash, hole, cell } = z;
    z.px.set(x);
    z.py.set(y);
    const act = z.active;
    const n = z.count;
    const ppx = this.player.x;
    const ppy = this.player.y;
    const fdx = this.flow.dirX;
    const fdy = this.flow.dirY;
    const fdist = this.flow.dist;
    const blocked = this.map.blocked;
    const gs = this.grid.start;
    const gi = this.grid.items;
    const K = this.sepNeighbors;
    const steer = Math.min(1, dt * 8);
    const pr = PLAYER.radius;
    const holes = this.holes;
    const pull = SKILLS.hole.pull;

    for (let k = 0; k < n; k++) {
      const s = act[k];
      let st = status[s];
      if (st & DEAD) continue;
      if (flash[s] > 0) flash[s] -= dt;
      if (st & VOLATILE && (volatileT[s] -= dt) <= 0) st = status[s] = st & ~VOLATILE;
      const sx = x[s];
      const sy = y[s];

      // 被黑洞吸住：不做互斥（擠成一團本來就是要的畫面，也省運算）
      if (st & PULLED) {
        const h = holes[hole[s]];
        if (h && h.active) {
          const dx = h.x - sx;
          const dy = h.y - sy;
          const d = Math.sqrt(dx * dx + dy * dy) + 1e-3;
          const ux = dx / d;
          const uy = dy / d;
          const orbit = 2 + (s % 6) * 1.5;
          const closeness = 1 - Math.min(1, d / h.r);
          const radial = Math.min(pull * (0.45 + closeness), (d - orbit) * 7);
          const swirl = 40 + closeness * 110;
          vx[s] = ux * radial - uy * swirl;
          vy[s] = uy * radial + ux * swirl;
          let nx = sx + vx[s] * dt;
          let ny = sy + vy[s] * dt;
          if (blocked[cellOf(nx, sy)]) nx = sx;
          if (blocked[cellOf(nx, ny)]) ny = sy;
          x[s] = nx;
          y[s] = ny;
          facing[s] += dt * (6 + closeness * 10);
          continue;
        }
        status[s] = st = st & ~PULLED;
        hole[s] = -1;
      }

      if (st & FROZEN) {
        if ((frozenT[s] -= dt) > 0) {
          vx[s] = 0;
          vy[s] = 0;
          continue;
        }
        status[s] = st = st & ~FROZEN;
      }

      // 追玩家：近距離或流場無解時直追，否則沿流場繞過障礙物
      const c = cell[s];
      const dx = ppx - sx;
      const dy = ppy - sy;
      const d2 = dx * dx + dy * dy;
      let ux = 0;
      let uy = 0;
      if (d2 > 2304 && fdist[c] < FLOW_INF) {
        ux = fdx[c];
        uy = fdy[c];
      }
      if (ux === 0 && uy === 0) {
        const d = Math.sqrt(d2) + 1e-4;
        ux = dx / d;
        uy = dy / d;
      }
      const kd = kind[s];
      const sp = KIND_SPEED[kd];
      const nvx = vx[s] + (ux * sp - vx[s]) * steer;
      const nvy = vy[s] + (uy * sp - vy[s]) * steer;
      vx[s] = nvx;
      vy[s] = nvy;
      let nx = sx + nvx * dt;
      let ny = sy + nvy * dt;

      // 局部互斥：只看鄰近格子、最多 K 個鄰居 → 屍群再密也不會 O(n²)
      const r1 = KIND_RADIUS[kd];
      let pushX = 0;
      let pushY = 0;
      let checked = 0;
      const ccx = c % GRID_W;
      const ccy = (c / GRID_W) | 0;
      for (let o = 0; o < 9 && checked < K; o++) {
        const gx = ccx + NB_X[o];
        const gy = ccy + NB_Y[o];
        if (gx < 0 || gy < 0 || gx >= GRID_W || gy >= GRID_H) continue;
        const cc = gy * GRID_W + gx;
        for (let i = gs[cc], e = gs[cc + 1]; i < e; i++) {
          const j = gi[i];
          if (j === s) continue;
          if (++checked > K) break;
          const ex = sx - x[j];
          const ey = sy - y[j];
          const rr = r1 + KIND_RADIUS[kind[j]];
          const e2 = ex * ex + ey * ey;
          if (e2 >= rr * rr) continue;
          if (e2 < 1e-6) {
            pushX += s & 1 ? 0.4 : -0.4;
            pushY += s & 2 ? 0.4 : -0.4;
            continue;
          }
          const ed = Math.sqrt(e2);
          const f = ((rr - ed) / ed) * 0.5;
          pushX += ex * f;
          pushY += ey * f;
        }
      }
      const pl = pushX * pushX + pushY * pushY;
      if (pl > 4) {
        const m = 2 / Math.sqrt(pl);
        pushX *= m;
        pushY *= m;
      }
      nx += pushX;
      ny += pushY;

      // 不與玩家重疊
      const qx = nx - ppx;
      const qy = ny - ppy;
      const rr = pr + r1;
      const q2 = qx * qx + qy * qy;
      if (q2 < rr * rr && q2 > 1e-6) {
        const q = Math.sqrt(q2);
        nx = ppx + (qx / q) * rr;
        ny = ppy + (qy / q) * rr;
      }

      if (blocked[cellOf(nx, sy)]) nx = sx;
      if (blocked[cellOf(nx, ny)]) ny = sy;
      x[s] = nx;
      y[s] = ny;
      const mvx = nx - sx;
      const mvy = ny - sy;
      const m2 = mvx * mvx + mvy * mvy;
      if (m2 > 1e-4) {
        facing[s] = Math.atan2(nvy, nvx);
        anim[s] += Math.sqrt(m2) * 0.2;
      }
    }
  }

  // ───────────────────────── 技能 ─────────────────────────

  private updateSkills(input: Input, dt: number) {
    const p = this.player;
    const m = this.mods;
    const cd = m.cdAll;
    const hw = this.viewW / 2;
    const hh = this.viewH / 2;
    const auto = !this.opts.noSkills;

    if (auto && (this.boltCd -= dt) <= 0) {
      const atk = this.character.attack;
      const target = this.grid.nearest(this.zombies, p.x, p.y, atk.range);
      if (target < 0) this.boltCd = 0.1;
      else {
        this.boltCd = atk.cooldown * cd;
        const base = Math.atan2(this.zombies.y[target] - p.y, this.zombies.x[target] - p.x);
        for (let i = 0; i < m.boltCount; i++) {
          const a = base + (i - (m.boltCount - 1) / 2) * 0.16;
          this.fireBolt(p.x, p.y, a);
        }
        this.events.push({ type: 'bolt' });
      }
    }

    if (auto && (this.frostCd -= dt) <= 0) {
      const r = SKILLS.frost.radius * m.frostRadius;
      const n = this.grid.query(this.zombies, p.x, p.y, r, this.tmp);
      if (n < 4) this.frostCd = 0.4;
      else {
        this.frostCd = SKILLS.frost.cooldown * m.frostCd * cd;
        const z = this.zombies;
        for (let i = 0; i < n; i++) {
          const s = this.tmp[i];
          this.damage(s, SKILLS.frost.damage, T_HIT, 0, -1);
          if (z.status[s] & DEAD || z.kind[s] === MUTANT) continue;
          z.status[s] |= FROZEN;
          z.frozenT[s] = SKILLS.frost.freeze * (z.kind[s] === BRUTE ? 0.5 : 1) * (0.9 + 0.2 * this.rng.next());
          this.fx.push(FX_FREEZE, z.x[s], z.y[s]);
        }
        this.events.push({ type: 'nova', x: p.x, y: p.y, r });
      }
    }

    if (auto && (this.holeCd -= dt) <= 0) {
      // 黑洞不放在玩家身上：屍群最密處常常就是包圍玩家的那一圈
      const r = SKILLS.hole.radius * m.holeRadius;
      const d = this.grid.densest(p.x, p.y, hw - 24, hh - 24, this.dense, Math.min(r * 0.85 + 16, 150));
      const slot = this.holes.find(h => !h.active);
      if (d.n < 8 || !slot) this.holeCd = 0.5;
      else {
        this.holeCd = SKILLS.hole.cooldown * cd;
        slot.active = true;
        slot.x = d.x;
        slot.y = d.y;
        slot.r = r;
        slot.t = 0;
        slot.dur = SKILLS.hole.duration;
        this.events.push({ type: 'holeStart', x: d.x, y: d.y, r: slot.r });
      }
    }

    if (auto && (this.beamCd -= dt) <= 0) {
      const d = this.grid.densest(p.x, p.y, hw, hh, this.dense);
      const slot = this.beams.find(b => !b.active);
      if (d.n < 8 || !slot) this.beamCd = 0.5;
      else {
        this.beamCd = SKILLS.beam.cooldown * cd;
        // 垂直於「玩家→屍群」方向橫掃，一次掃過整片前線
        let ax = d.x - p.x;
        let ay = d.y - p.y;
        const al = Math.hypot(ax, ay) || 1;
        ax /= al;
        ay /= al;
        const dir = this.rng.next() < 0.5 ? 1 : -1;
        slot.dx = -ay * dir;
        slot.dy = ax * dir;
        slot.len = SKILLS.beam.length * m.beamLength;
        slot.r = SKILLS.beam.radius * m.beamRadius;
        slot.x0 = d.x - slot.dx * slot.len * 0.5;
        slot.y0 = d.y - slot.dy * slot.len * 0.5;
        slot.hx = slot.scorchX = slot.x0;
        slot.hy = slot.scorchY = slot.y0;
        slot.t = 0;
        slot.phase = 0;
        slot.active = true;
      }
    }

    if (input.ult && p.ult >= 1 && !this.ult.active) {
      p.ult = 0;
      this.stats.ults++;
      const u = this.ult;
      u.active = true;
      u.t = 0;
      u.phase = 0;
      u.pulses = 0;
      u.x = p.x;
      // 天降巨砲插在主角正前方（北側）一點，不會把主角整個蓋住
      u.y = u.kind === 'pylon' ? p.y - 34 : p.y;
      u.hw = hw;
      u.hh = hh;
      u.dir = this.rng.next() < 0.5 ? 1 : -1;
      u.dy = this.rng.next() < 0.5 ? 1 : -1;
      u.hx = p.x - u.dir * (hw + 140);
      u.hy = p.y - u.dy * (hh + 110);
      u.chain = this.chains.open(this.tick);
      this.events.push({ type: 'ult', x: p.x, y: p.y, kind: u.kind });
    }

    for (let i = 0; i < this.holes.length; i++) this.updateHole(i, dt);
    for (const b of this.beams) if (b.active) this.updateBeam(b, dt);
    if (this.ult.active) this.updateUlt(dt);
    for (const r of this.rings) if (r.active) this.updateRing(r, dt);
    for (const sh of this.shells) if (sh.active) this.updateShell(sh, dt);
  }

  private updateHole(idx: number, dt: number) {
    const h = this.holes[idx];
    if (!h.active) return;
    h.t += dt;
    const z = this.zombies;
    if (this.tick % 2 === 0) {
      const n = this.grid.query(z, h.x, h.y, h.r, this.tmp);
      const dmg = SKILLS.hole.dps * dt * 2;
      for (let i = 0; i < n; i++) {
        const s = this.tmp[i];
        if (z.kind[s] === MUTANT) continue;
        if (!(z.status[s] & PULLED)) {
          z.status[s] |= PULLED;
          z.hole[s] = idx;
        }
        if (z.hole[s] === idx) this.damage(s, dmg, T_DOT, 0, -1);
      }
    }
    if (h.t < h.dur) return;
    // 坍縮：吸入越多，爆炸越大
    let captured = 0;
    for (let k = 0; k < z.count; k++) {
      const s = z.active[k];
      if (z.hole[s] !== idx) continue;
      z.hole[s] = -1;
      z.status[s] &= ~PULLED;
      if (!(z.status[s] & DEAD)) captured++;
    }
    h.active = false;
    const m = this.mods;
    const radius = SKILLS.hole.collapseRadius * Math.sqrt(m.holeRadius) * (1 + (Math.min(captured, 400) / 400) * 0.7);
    const dmg = (SKILLS.hole.collapseBase + SKILLS.hole.collapsePer * captured) * m.holePower;
    this.enqueue(EV_COLLAPSE, h.x, h.y, 1, 0, this.chains.open(this.tick), radius, dmg);
    if (captured > 120) this.hitStop = Math.max(this.hitStop, 0.06);
    this.events.push({ type: 'holeEnd', x: h.x, y: h.y, r: radius, n: captured });
  }

  private updateBeam(b: Beam, dt: number) {
    b.t += dt;
    if (b.phase === 0) {
      if (b.t >= SKILLS.beam.telegraph) {
        b.phase = 1;
        b.t = 0;
        this.events.push({ type: 'beamStart', x: b.x0, y: b.y0 });
      }
      return;
    }
    const u = Math.min(1, b.t / SKILLS.beam.sweep);
    b.hx = b.x0 + b.dx * b.len * u;
    b.hy = b.y0 + b.dy * b.len * u;
    const n = this.grid.query(this.zombies, b.hx, b.hy, b.r, this.tmp);
    const dmg = SKILLS.beam.dps * dt;
    for (let i = 0; i < n; i++) this.damage(this.tmp[i], dmg, T_BEAM, 0, -1);
    const sx = b.hx - b.scorchX;
    const sy = b.hy - b.scorchY;
    if (sx * sx + sy * sy > 25) {
      b.scorchX = b.hx;
      b.scorchY = b.hy;
      this.fx.push(FX_SCORCH, b.hx, b.hy, b.r);
    }
    if (u >= 1) b.active = false;
  }

  setUltKind(kind: UltKind) {
    if (!this.ult.active) this.ult.kind = kind;
  }

  private spawnRing(x: number, y: number) {
    const r = this.rings.find(k => !k.active);
    if (!r) return;
    r.active = true;
    r.x = x;
    r.y = y;
    r.r = 0;
    r.max = Math.hypot(this.ult.hw, this.ult.hh) + 40;
    r.speed = SKILLS.ult.ringSpeed;
  }

  private updateUlt(dt: number) {
    const u = this.ult;
    u.t += dt;
    this.chains.last[u.chain] = this.tick;
    if (u.kind === 'ship') {
      // 從畫面一角斜飛到對角，經過主角上空；速度曲線 v = 1 + ease·cos(2πk)：兩端快、中央慢但不為零
      const U = SKILLS.ult.ship;
      const k = Math.min(1, u.t / U.duration);
      const s = k + (U.ease / (2 * Math.PI)) * Math.sin(2 * Math.PI * k);
      const ex = u.hw + 140;
      const ey = u.hh + 110;
      u.hx = u.x - u.dir * ex + u.dir * ex * 2 * s;
      u.hy = u.y - u.dy * ey + u.dy * ey * 2 * s;
      if (u.pulses === 0 && k >= 0.5) {
        // 飛到中央上空：往地面發射擴散到整個畫面的衝擊波
        u.pulses = 1;
        u.phase = 1;
        this.spawnRing(u.x, u.y);
        this.hitStop = 0.06;
        this.events.push({ type: 'ultImpact', x: u.x, y: u.y });
      }
      if (k >= 1) u.active = false;
      return;
    }
    const U = SKILLS.ult.pylon;
    if (u.phase === 0) {
      if (u.t >= U.fall) {
        u.phase = 1;
        u.t = 0;
        // 落地：近距離重擊，立刻打出第一輪散射
        const n = this.grid.query(this.zombies, u.x, u.y, U.impactRadius, this.tmp);
        for (let i = 0; i < n; i++) this.damage(this.tmp[i], SKILLS.ult.damage * 2 * this.hpMul, T_SHOCK, 0, u.chain);
        this.hitStop = 0.12;
        this.events.push({ type: 'ultImpact', x: u.x, y: u.y });
      }
    } else if (u.phase === 1) {
      if (u.pulses < U.volleys && u.t >= u.pulses * U.interval) {
        this.fireVolley(u.pulses);
        u.pulses++;
        this.events.push({ type: 'ultPulse', x: u.x, y: u.y });
      }
      // 等最後一輪砲彈飛出畫面
      const travel = (Math.hypot(u.hw, u.hh) + 40) / U.shellSpeed;
      if (u.t >= (U.volleys - 1) * U.interval + travel + U.linger) {
        u.phase = 2;
        u.t = 0;
      }
    } else if (u.t >= U.fade) u.active = false;
  }

  /** 一輪全方位散射；逐輪錯開 1/volleys 個間隔，全部輪數合起來角度間距 = 360°/(shells·volleys) */
  private fireVolley(v: number) {
    const u = this.ult;
    const U = SKILLS.ult.pylon;
    const step = (Math.PI * 2) / U.shells;
    const off = step * ((v * 3) % U.volleys) / U.volleys;
    const max = Math.hypot(u.hw, u.hh) + 40;
    for (let i = 0; i < U.shells; i++) {
      let sh = this.shells.find(k => !k.active);
      if (!sh) {
        sh = { active: false, uid: 0, x: 0, y: 0, vx: 0, vy: 0, d: 0, max: 0 };
        this.shells.push(sh);
      }
      const a = off + i * step;
      sh.active = true;
      sh.uid = this.shellUid++;
      sh.x = u.x;
      sh.y = u.y;
      sh.vx = Math.cos(a) * U.shellSpeed;
      sh.vy = Math.sin(a) * U.shellSpeed;
      sh.d = 0;
      sh.max = max;
    }
  }

  private updateShell(sh: Shell, dt: number) {
    sh.x += sh.vx * dt;
    sh.y += sh.vy * dt;
    sh.d += SKILLS.ult.pylon.shellSpeed * dt;
    const z = this.zombies;
    const n = this.grid.query(z, sh.x, sh.y, SKILLS.ult.pylon.shellRadius, this.tmp);
    const dmg = SKILLS.ult.damage * this.hpMul;
    for (let i = 0; i < n; i++) {
      const j = this.tmp[i];
      if (this.shellHit[j] === sh.uid) continue;
      this.shellHit[j] = sh.uid;
      this.damage(j, dmg, T_SHOCK, 0, this.ult.chain);
    }
    if (sh.d >= sh.max) sh.active = false;
  }

  /** 擴散的衝擊波：只傷害這一 tick 剛被波前掃到的殭屍（環帶 prev < d ≤ r），每圈每隻只打一次 */
  private updateRing(s: Ring, dt: number) {
    const prev = s.r;
    s.r = Math.min(s.max, s.r + s.speed * dt);
    const z = this.zombies;
    const n = this.grid.query(z, s.x, s.y, s.r, this.tmp);
    const p2 = prev * prev;
    const dmg = SKILLS.ult.damage * this.hpMul;
    for (let i = 0; i < n; i++) {
      const j = this.tmp[i];
      const dx = z.x[j] - s.x;
      const dy = z.y[j] - s.y;
      if (dx * dx + dy * dy > p2) this.damage(j, dmg, T_SHOCK, 0, this.ult.chain);
    }
    if (s.r >= s.max) s.active = false;
  }

  private fireBolt(x: number, y: number, a: number) {
    const b = this.bolts;
    if (b.count >= BOLT_CAP) return;
    const i = b.count++;
    b.x[i] = x;
    b.y[i] = y;
    const atk = this.character.attack;
    b.vx[i] = Math.cos(a) * atk.speed;
    b.vy[i] = Math.sin(a) * atk.speed;
    b.life[i] = atk.life;
    b.pierce[i] = atk.pierce;
    b.hits.fill(-1, i * 4, i * 4 + 4);
  }

  private updateBolts(dt: number) {
    const b = this.bolts;
    const atk = this.character.attack;
    const dmg = atk.damage * this.mods.boltDamage;
    for (let i = 0; i < b.count; i++) {
      b.x[i] += b.vx[i] * dt;
      b.y[i] += b.vy[i] * dt;
      b.life[i] -= dt;
      const n = this.grid.query(this.zombies, b.x[i], b.y[i], atk.radius, this.tmp, 8);
      const h = i * 4;
      for (let k = 0; k < n && b.pierce[i] > 0; k++) {
        const s = this.tmp[k];
        if (b.hits[h] === s || b.hits[h + 1] === s || b.hits[h + 2] === s || b.hits[h + 3] === s) continue;
        this.damage(s, dmg, T_HIT, 0, -1);
        this.fx.push(FX_BOLT_HIT, b.x[i], b.y[i]);
        b.hits[h + (atk.pierce - b.pierce[i]) % 4] = s;
        b.pierce[i]--;
        if (atk.splash) {
          // 範圍爆破：以命中點為圓心炸開（爆炸會碎裂凍結的殭屍）
          const bx = b.x[i];
          const by = b.y[i];
          const m = this.grid.query(this.zombies, bx, by, atk.splash.radius, this.tmp2);
          for (let q = 0; q < m; q++) if (this.tmp2[q] !== s) this.damage(this.tmp2[q], atk.splash.damage * this.mods.boltDamage, T_EXPLOSION, 0, -1);
          this.fx.push(FX_SPLASH, bx, by, atk.splash.radius);
          break;
        }
      }
      if (b.pierce[i] === 0 || b.life[i] <= 0 || this.map.blocked[cellOf(b.x[i], b.y[i])]) {
        const last = --b.count;
        b.x[i] = b.x[last];
        b.y[i] = b.y[last];
        b.vx[i] = b.vx[last];
        b.vy[i] = b.vy[last];
        b.life[i] = b.life[last];
        b.pierce[i] = b.pierce[last];
        b.hits.copyWithin(i * 4, last * 4, last * 4 + 4);
        i--;
      }
    }
  }

  // ───────────────────────── 傷害與反應 ─────────────────────────

  /** chain = 所屬連鎖 id（-1 = 不屬於任何連鎖；若這次傷害觸發反應，會開一條新的） */
  damage(s: number, amount: number, trigger: number, depth: number, chain: number) {
    const z = this.zombies;
    const st = z.status[s];
    if (st & DEAD) return;
    if (st & REACTIVE_STATUS) {
      for (let i = 0; i < STATUS_REACTIONS.length; i++) {
        const r = STATUS_REACTIONS[i];
        if (!(st & r.status) || !(trigger & r.triggers)) continue;
        if (chain < 0) chain = this.chains.open(this.tick);
        if (r.id === 'shatter') {
          z.status[s] = st & ~r.status;
          this.kill(s, trigger, depth, CAUSE_SHATTER, chain);
          this.enqueue(EV_SHARD, z.x[s], z.y[s], this.delay(REACTION.shard.delay), depth + 1, chain);
          return;
        }
        // detonate：保留不穩定狀態直接擊殺，交給死亡反應（殉爆）處理
        this.kill(s, trigger, depth, CAUSE_BLAST, chain);
        return;
      }
    }
    z.hp[s] -= amount;
    if (!(trigger & T_DOT)) z.flash[s] = 0.07;
    if (z.hp[s] <= 0) this.kill(s, trigger, depth, trigger & T_BEAM ? CAUSE_BURN : trigger & (T_EXPLOSION | T_SHOCK) ? CAUSE_BLAST : CAUSE_NORMAL, chain);
  }

  private kill(s: number, trigger: number, depth: number, cause: number, chain: number) {
    const z = this.zombies;
    const st = z.status[s];
    z.status[s] = st | DEAD;
    this.dead[this.deadCount++] = s;
    const k = z.kind[s];
    const x = z.x[s];
    const y = z.y[s];
    this.stats.kills++;
    this.gems.spawn(x, y, KIND_XP[k]);
    // 範圍／連鎖擊殺充能較少，避免「大招 → 連鎖 → 立刻又滿」的無限循環
    if (!(trigger & T_SHOCK)) {
      const w = trigger & T_AREA || chain >= 0 ? 0.2 : 1;
      this.player.ult = Math.min(1, this.player.ult + (w * this.mods.ultCharge) / SKILLS.ult.killsToCharge);
    }
    let deathCause = cause;
    for (let i = 0; i < DEATH_REACTIONS.length; i++) {
      const r = DEATH_REACTIONS[i];
      if ((r.kind >= 0 && r.kind !== k) || (st & r.status) !== r.status) continue;
      if (chain < 0) chain = this.chains.open(this.tick);
      const delay = r.event === EV_PLAGUE ? REACTION.plague.delay : REACTION.burst.delay;
      this.enqueue(r.event, x, y, this.delay(delay), depth + 1, chain);
      if (r.event === EV_PLAGUE) deathCause = CAUSE_PLAGUE;
      break;
    }
    if (chain >= 0) {
      this.chains.hit(chain, this.tick);
      const n = this.chains.count[chain];
      if (n > this.stats.maxChain) this.stats.maxChain = n;
    }
    this.deaths.push(x, y, k, deathCause, z.facing[s]);
    if (k === MUTANT) {
      this.stats.mutantKills++;
      // 小 Boss 倒下：一圈經驗寶石＋大爆炸（爆炸本身會開一條連鎖）
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        this.gems.spawn(x + Math.cos(a) * 14, y + Math.sin(a) * 10, 5);
      }
      this.enqueue(EV_COLLAPSE, x, y, 2, depth + 1, chain >= 0 ? chain : this.chains.open(this.tick), 64, 40);
      this.hitStop = Math.max(this.hitStop, 0.08);
      this.events.push({ type: 'mutantDown', x, y });
    }
  }

  private enqueue(kind: number, x: number, y: number, delayTicks: number, depth: number, chain: number, a = 0, b = 0) {
    if (this.chain.push(kind, x, y, this.tick + delayTicks, depth, chain, a, b)) this.chains.pending[chain]++;
  }

  /** 延遲 tick 數 */
  private delay(range: readonly [number, number]) {
    return Math.max(1, Math.round(this.rng.range(range[0], range[1]) / FIXED_STEP));
  }

  /** 連鎖事件結算（綁定一次，避免每 tick 產生閉包） */
  private readonly runEvent = (i: number) => {
    const q = this.chain;
    const kind = q.kind[i];
    const x = q.x[i];
    const y = q.y[i];
    const depth = q.depth[i];
    const chain = q.chain[i];
    this.chains.pending[chain]--;
    const rm = this.mods.reactionRadius;
    const hm = this.hpMul;
    const z = this.zombies;
    const tmp = this.tmp;
    switch (kind) {
      case EV_SHARD: {
        const r = REACTION.shard.radius * rm;
        const n = this.grid.query(z, x, y, r, tmp);
        for (let k = 0; k < n; k++) this.damage(tmp[k], REACTION.shard.damage * hm, T_SHARD, depth, chain);
        this.fx.push(FX_SHARD, x, y, r);
        break;
      }
      case EV_BURST: {
        const r = REACTION.burst.radius * rm;
        const n = this.grid.query(z, x, y, r, tmp);
        for (let k = 0; k < n; k++) this.damage(tmp[k], REACTION.burst.damage * hm, T_EXPLOSION, depth, chain);
        this.fx.push(FX_BURST, x, y, r);
        break;
      }
      case EV_PLAGUE: {
        const r = REACTION.plague.radius * rm;
        let n = this.grid.query(z, x, y, r, tmp);
        for (let k = 0; k < n; k++) this.damage(tmp[k], REACTION.plague.damage * hm, T_EXPLOSION, depth, chain);
        n = this.grid.query(z, x, y, REACTION.plague.volatileRadius * rm, tmp);
        let infected = 0;
        for (let k = 0; k < n && infected < REACTION.plague.volatileMax; k++) {
          const s = tmp[k];
          if (z.status[s] & (DEAD | VOLATILE) || z.kind[s] === MUTANT) continue;
          z.status[s] |= VOLATILE;
          z.volatileT[s] = REACTION.plague.volatileTime;
          infected++;
        }
        this.fx.push(FX_PLAGUE, x, y, r);
        break;
      }
      case EV_COLLAPSE: {
        const r = q.a[i];
        const n = this.grid.query(z, x, y, r, tmp);
        for (let k = 0; k < n; k++) this.damage(tmp[k], q.b[i] * hm, T_EXPLOSION, depth, chain);
        this.fx.push(FX_COLLAPSE, x, y, r);
        break;
      }
    }
  };

  private flushDead() {
    const z = this.zombies;
    for (let i = 0; i < this.deadCount; i++) z.remove(this.dead[i]);
    this.deadCount = 0;
  }

  // ───────────────────────── 成長 ─────────────────────────

  private gainXp(v: number) {
    const p = this.player;
    p.xp += v;
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level++;
      p.xpNext = xpForLevel(p.level);
      this.pendingLevels++;
      this.events.push({ type: 'levelup', level: p.level });
    }
    if (this.opts.autoLevel) while (this.pendingLevels > 0) this.applyUpgrade(this.rollChoices()[0].id);
  }

  rollChoices(): Upgrade[] {
    const pool = UPGRADES.filter(u => (this.upgradeLevels[u.id] ?? 0) < u.max);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = this.rng.int(i + 1);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picks = pool.slice(0, 3);
    if (picks.length < 3) picks.push(FALLBACK_UPGRADE);
    return picks;
  }

  applyUpgrade(id: string) {
    const u = UPGRADES.find(x => x.id === id) ?? FALLBACK_UPGRADE;
    const p = this.player;
    u.apply({
      mods: this.mods,
      addMaxHp: n => {
        p.maxHp += n;
        p.hp = p.maxHp;
      },
      heal: n => {
        p.hp = Math.min(p.maxHp, p.hp + n);
      },
    });
    this.upgradeLevels[u.id] = (this.upgradeLevels[u.id] ?? 0) + 1;
    this.pendingLevels = Math.max(0, this.pendingLevels - 1);
  }

  // ───────────────────────── 生怪導演 ─────────────────────────

  private updateDirector(dt: number) {
    if (this.opts.noSpawn || this.finale === 'finish') return;
    const z = this.zombies;
    const t = this.time;
    const final = this.finale === 'final';
    if (t >= this.nextSurge && !final) {
      this.nextSurge += DIRECTOR.surgeEvery;
      this.surgeLeft = Math.floor(Math.min(this.cap - z.count, DIRECTOR.surgeBase + t * DIRECTOR.surgePerSec));
      this.surgeAngle = this.rng.next() * Math.PI * 2;
      if (this.surgeLeft > 20) this.events.push({ type: 'surge', angle: this.surgeAngle });
    }
    if (this.surgeLeft > 0) {
      const p = this.player;
      const dist = Math.hypot(this.viewW / 2, this.viewH / 2) + 50;
      const cx = p.x + Math.cos(this.surgeAngle) * dist;
      const cy = p.y + Math.sin(this.surgeAngle) * dist;
      for (let i = 0; i < 40 && this.surgeLeft > 0 && z.count < this.cap; i++) {
        this.surgeLeft--;
        const ox = (this.rng.next() + this.rng.next() - 1) * 110;
        const oy = (this.rng.next() + this.rng.next() - 1) * 110;
        this.trySpawn(this.pickKind(t), cx + ox, cy + oy);
      }
    }
    if (this.opts.stress) {
      for (let i = 0; i < 40 && z.count < this.cap; i++) this.spawnAtEdge(this.pickKind(t));
      return;
    }
    if (t >= this.nextMutant && !final) {
      const late = Math.max(0, t - DIRECTOR.mutantLateStart);
      this.nextMutant +=
        late > 0 ? Math.max(DIRECTOR.mutantLateEveryMin, DIRECTOR.mutantLateEvery - late * DIRECTOR.mutantLateAccel) : DIRECTOR.mutantEvery;
      const max =
        DIRECTOR.mutantMaxBase + Math.floor((t / 60) * DIRECTOR.mutantMaxPerMin) + Math.floor((late / 60) * DIRECTOR.mutantLatePerMin);
      const alive = this.countMutants();
      const want = Math.min(max - alive, 1 + Math.min(2, Math.floor(late / 100)));
      for (let i = 0; i < want; i++) {
        const before = z.count;
        this.spawnFar(MUTANT);
        if (z.count > before) {
          const s = z.active[z.count - 1];
          if (i === 0) this.events.push({ type: 'mutant', x: z.x[s], y: z.y[s] });
        }
      }
    }
    // 固定生成速率（與玩家殺多快無關）：前期稀疏，後期屍潮
    this.spawnAcc = Math.min(80, this.spawnAcc + (DIRECTOR.base + DIRECTOR.perSec * t) * (final ? FINAL.spawnScale : 1) * dt);
    for (let i = 0; i < 40 && this.spawnAcc >= 1 && z.count < this.cap; i++) {
      this.spawnAcc--;
      if (this.rng.next() < DIRECTOR.farShare) this.spawnFar(this.pickKind(t));
      else this.spawnAtEdge(this.pickKind(t));
    }
  }

  private spawnFar(kind: number) {
    const p = this.player;
    const base = Math.hypot(this.viewW / 2, this.viewH / 2);
    for (let tries = 0; tries < 6; tries++) {
      const a = this.rng.next() * Math.PI * 2;
      const d = base + this.rng.range(DIRECTOR.farMin, DIRECTOR.farMax);
      if (this.trySpawn(kind, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d)) return;
    }
    this.spawnAtEdge(kind);
  }

  private pickKind(t: number) {
    const r = this.rng.next();
    const core = 0.035 + Math.min(0.025, t / 12000);
    const brute = t > 60 ? Math.min(0.08, (t - 60) / 1500) : 0;
    const runner = Math.min(0.16, t / 900);
    if (r < core) return CORE;
    if (r < core + brute) return BRUTE;
    if (r < core + brute + runner) return RUNNER;
    return WALKER;
  }

  private spawnAtEdge(kind: number) {
    const p = this.player;
    const hw = this.viewW / 2 + 20;
    const hh = this.viewH / 2 + 20;
    for (let tries = 0; tries < 8; tries++) {
      const r = this.rng.next() * (hw + hh) * 2;
      let x: number;
      let y: number;
      if (r < hw * 2) {
        x = p.x - hw + r;
        y = p.y + (this.rng.next() < 0.5 ? -hh : hh);
      } else {
        x = p.x + (this.rng.next() < 0.5 ? -hw : hw);
        y = p.y - hh + (r - hw * 2);
      }
      if (this.trySpawn(kind, x, y)) return;
    }
  }

  private trySpawn(kind: number, x: number, y: number) {
    if (x < BORDER + 8 || y < BORDER + 8 || x > MAP_W - BORDER - 8 || y > MAP_H - BORDER - 8) return false;
    if (this.map.blocked[cellOf(x, y)]) return false;
    return this.zombies.spawn(kind, x, y, this.rng.next(), this.hpMul) >= 0;
  }

  private fillStress() {
    const p = this.player;
    let guard = this.cap * 6;
    while (this.zombies.count < this.cap && guard-- > 0) {
      const a = this.rng.next() * Math.PI * 2;
      const d = 110 + Math.sqrt(this.rng.next()) * 760;
      this.trySpawn(this.pickKind(this.time + 120), p.x + Math.cos(a) * d, p.y + Math.sin(a) * d);
    }
  }
}

function ema(prev: number, v: number) {
  return prev + (v - prev) * 0.05;
}
