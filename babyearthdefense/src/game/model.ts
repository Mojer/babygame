import {
  BOSS, CHAIN_WINDOW, ENEMY_STATS, EYEBALL, PICKUP, STAGES, WEAPONS,
  type EnemyKind, type PickupKind, type SpawnPattern, type StageSpec, type WeaponKind
} from './content';

// 純邏輯模型：不依賴 Phaser，可在 Node 測試。原點為地球中心，y 軸向下。

export const FIXED_STEP = 1 / 60;
export const BASE_WIDTH = 1080;
export const BASE_HEIGHT = 1920;
export const EARTH_RADIUS = 140;
export const ORBIT_RADIUS = 230;
export const PLAYER_RADIUS = 34;
export const SHIELD_MAX = 100;
export const TURN_SPEED = 5.2;
export const FIRE_INTERVAL = .11;
export const BULLET_SPEED = 1500;
export const STUN_TIME = 1;
export const COMBO_WINDOW = 2;
export const BOMB_MAX = 3;
export const BOMB_KILLS_PER_CHARGE = 40;
export const WAVE_BREAK = 2.2;
export const BOSS_WARNING = 3;

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

export type GameState = 'ready' | 'running' | 'won' | 'lost';
export type Phase = 'wave' | 'break' | 'warning' | 'boss';

export interface Bullet { id: number; x: number; y: number; vx: number; vy: number; angle: number; kind: WeaponKind }
export type DamageSource = WeaponKind | 'bomb' | 'nova-blast';
interface PendingNova { x: number; y: number; at: number; depth: number }
interface Target { ref: object; x: number; y: number; damage: (amount: number) => void }
export interface EnemyBullet { id: number; x: number; y: number; vx: number; vy: number; damage: number }
export interface Enemy {
  id: number; kind: EnemyKind; x: number; y: number; vx: number; vy: number;
  hp: number; radius: number; age: number; flash: number;
  hovering: boolean; hoverRadius: number; orbitDir: 1 | -1; fireTimer: number;
}
export interface Pickup { id: number; kind: PickupKind; x: number; y: number; vx: number; vy: number; age: number }
export interface Pod { id: number; index: number; x: number; y: number; angle: number; hp: number; alive: boolean; fireTimer: number; flash: number }
export interface Boss {
  x: number; y: number; theta: number; enter: number;
  hp: number; phase: 'pods' | 'exposed' | 'dying';
  pods: Pod[]; podSpin: number; exposedTimer: number; spawnTimer: number; dyingTimer: number; flash: number;
}

export type GameEvent =
  | { type: 'fire'; x: number; y: number }
  | { type: 'hit'; x: number; y: number }
  | { type: 'kill'; x: number; y: number; kind: EnemyKind | 'pod' | 'bullet'; score: number; source?: DamageSource }
  | { type: 'chain'; points: { x: number; y: number }[] }
  | { type: 'nova'; x: number; y: number; depth: number; radius: number }
  | { type: 'chainCombo'; count: number }
  | { type: 'weaponEnd'; weapon: WeaponKind }
  | { type: 'earthHit'; x: number; y: number; damage: number }
  | { type: 'stun'; x: number; y: number }
  | { type: 'deflect'; x: number; y: number }
  | { type: 'pickup'; kind: PickupKind; x: number; y: number }
  | { type: 'bomb' }
  | { type: 'bombCharged' }
  | { type: 'wave'; id: string }
  | { type: 'waveClear'; id: string }
  | { type: 'bossWarning' }
  | { type: 'bossExposed' }
  | { type: 'bossShielded' }
  | { type: 'bossDown'; x: number; y: number }
  | { type: 'won' }
  | { type: 'lost' };

interface PendingSpawn { time: number; kind: EnemyKind; angle: number }

/** mulberry32：可重現的亂數，方便測試。 */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const wrapAngle = (a: number) => ((a % TAU) + TAU + Math.PI) % TAU - Math.PI;

export class GameModel {
  state: GameState = 'ready';
  phase: Phase = 'wave';
  stage: StageSpec;
  waveIndex = 0;
  phaseTime = 0;
  time = 0;

  halfWidth = BASE_WIDTH / 2;
  halfHeight = BASE_HEIGHT / 2;

  playerAngle = -Math.PI / 2;
  targetAngle: number | null = null;
  turnInput = 0;
  fireTimer = 0;
  stun = 0;
  weapon: WeaponKind = 'blaster';
  weaponTime = 0;
  laserActive = false;
  private laserTick = 0;
  private laserDeflect = 0;
  private novas: PendingNova[] = [];
  chainKills = 0;
  private chainTimer = 0;
  private showcaseKind: PickupKind | null = null;
  private showcaseAt = 0;

  shield = SHIELD_MAX;
  score = 0;
  combo = 0;
  maxCombo = 0;
  comboTimer = 0;
  kills = 0;
  bombs = 2;
  bombMeter = 0;

  bullets: Bullet[] = [];
  enemyBullets: EnemyBullet[] = [];
  enemies: Enemy[] = [];
  pickups: Pickup[] = [];
  boss: Boss | null = null;

  private pending: PendingSpawn[] = [];
  private events: GameEvent[] = [];
  private nextId = 1;
  private random: () => number;

  constructor(options: { seed?: number; stage?: StageSpec } = {}) {
    this.random = rng(options.seed ?? Date.now());
    this.stage = options.stage ?? STAGES[0];
  }

  get wave() { return this.stage.waves[this.waveIndex]; }
  get waveLabel() { return this.phase === 'boss' || this.phase === 'warning' ? `${this.stage.id}-BOSS` : this.wave.id; }
  get playerX() { return Math.cos(this.playerAngle) * ORBIT_RADIUS; }
  get playerY() { return Math.sin(this.playerAngle) * ORBIT_RADIUS; }

  setViewport(width: number, height: number) {
    this.halfWidth = width / 2;
    this.halfHeight = height / 2;
  }

  /** 觸控目標方位（弧度）；null 表示放開手指，戰機停在原地。 */
  setTarget(angle: number | null) { this.targetAngle = angle; }
  /** 鍵盤轉向：-1 逆時針、1 順時針、0 停止。優先於觸控目標。 */
  setTurn(direction: number) { this.turnInput = Math.sign(direction); }

  start() {
    if (this.state !== 'ready') return;
    this.state = 'running';
    this.beginWave(0);
  }

  /** 開發用：直接跳到 Boss 戰。 */
  skipToBoss() {
    if (this.state !== 'running') return;
    this.pending = [];
    this.enemies = [];
    this.events = [];
    this.waveIndex = this.stage.waves.length - 1;
    this.phase = 'warning';
    this.phaseTime = BOSS_WARNING;
  }

  drainEvents() {
    const out = this.events;
    this.events = [];
    return out;
  }

  /** 從原點沿某角度到畫面邊緣的距離。 */
  edgeDistance(angle: number) {
    const c = Math.abs(Math.cos(angle));
    const s = Math.abs(Math.sin(angle));
    return Math.min(c > 1e-6 ? this.halfWidth / c : Infinity, s > 1e-6 ? this.halfHeight / s : Infinity);
  }

  bomb() {
    if (this.state !== 'running' || this.bombs <= 0) return false;
    this.bombs--;
    this.emit({ type: 'bomb' });
    for (const enemy of this.enemies) this.killEnemy(enemy, false, 'bomb');
    this.enemies = [];
    this.enemyBullets = [];
    const boss = this.boss;
    if (boss && boss.enter >= 1) {
      if (boss.phase === 'pods') {
          for (const pod of boss.pods) if (pod.alive) this.damagePod(boss, pod, 4, 'bomb');
      } else if (boss.phase === 'exposed') {
        this.damageBoss(boss, 15);
      }
    }
    return true;
  }

  step(dt = FIXED_STEP) {
    if (this.state !== 'running') return;
    this.time += dt;
    this.phaseTime += dt;
    this.updatePlayer(dt);
    this.updateDirector(dt);
    this.updateBullets(dt);
    this.updateLaser(dt);
    this.updateNovas();
    this.updateEnemies(dt);
    this.updateBoss(dt);
    this.updateEnemyBullets(dt);
    this.updatePickups(dt);
    if (this.comboTimer > 0 && (this.comboTimer -= dt) <= 0) this.combo = 0;
    if (this.chainTimer > 0 && (this.chainTimer -= dt) <= 0) {
      if (this.chainKills >= 3) this.emit({ type: 'chainCombo', count: this.chainKills });
      this.chainKills = 0;
    }
    if (this.shield <= 0) {
      this.shield = 0;
      this.state = 'lost';
      this.emit({ type: 'lost' });
    }
  }

  // ─── Player ────────────────────────────────────────────────

  private updatePlayer(dt: number) {
    if (this.stun > 0) this.stun = Math.max(0, this.stun - dt);
    if (this.weapon !== 'blaster' && (this.weaponTime -= dt) <= 0) {
      this.emit({ type: 'weaponEnd', weapon: this.weapon });
      this.weapon = 'blaster';
      this.weaponTime = 0;
    }
    const turn = TURN_SPEED * (this.stun > 0 ? .4 : 1) * dt;
    if (this.turnInput !== 0) {
      this.playerAngle = wrapAngle(this.playerAngle + this.turnInput * turn);
    } else if (this.targetAngle !== null) {
      const diff = wrapAngle(this.targetAngle - this.playerAngle);
      this.playerAngle = wrapAngle(this.playerAngle + Math.max(-turn, Math.min(turn, diff)));
    }
    if (this.weapon === 'laser') return;
    this.fireTimer -= dt;
    if (this.stun === 0 && this.fireTimer <= 0) {
      this.fireTimer += WEAPONS[this.weapon].interval;
      if (this.fireTimer < 0) this.fireTimer = 0;
      const angles = this.weapon === 'spread' ? [-9 * DEG, 0, 9 * DEG] : [0];
      const muzzle = ORBIT_RADIUS + PLAYER_RADIUS;
      for (const offset of angles) {
        const a = this.playerAngle + offset;
        this.bullets.push({
          id: this.nextId++,
          x: Math.cos(this.playerAngle) * muzzle,
          y: Math.sin(this.playerAngle) * muzzle,
          vx: Math.cos(a) * BULLET_SPEED,
          vy: Math.sin(a) * BULLET_SPEED,
          angle: a,
          kind: this.weapon
        });
      }
      this.emit({ type: 'fire', x: this.playerX, y: this.playerY });
    }
  }

  private stunPlayer() {
    if (this.stun > 0) return false;
    this.stun = STUN_TIME;
    this.combo = 0;
    this.emit({ type: 'stun', x: this.playerX, y: this.playerY });
    return true;
  }

  // ─── Waves ─────────────────────────────────────────────────

  private beginWave(index: number) {
    this.waveIndex = index;
    this.phase = 'wave';
    this.phaseTime = 0;
    this.pending = [];
    for (const group of this.wave.groups) {
      const angles = this.patternAngles(group.pattern, group.count);
      angles.forEach((angle, i) => this.pending.push({ time: group.delay + group.interval * i, kind: group.enemy, angle }));
    }
    this.pending.sort((a, b) => a.time - b.time);
    this.showcaseKind = PICKUP.showcase[index] ?? null;
    this.showcaseAt = this.kills + PICKUP.showcaseAfterKills;
    this.emit({ type: 'wave', id: this.wave.id });
  }

  private patternAngles(pattern: SpawnPattern, count: number) {
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : .5;
      switch (pattern.kind) {
        case 'random': out.push(this.random() * TAU); break;
        case 'ring': out.push((i / count) * TAU + this.random() * .2); break;
        case 'arc': out.push((pattern.center + (t - .5) * pattern.spread) * DEG); break;
        case 'sweep': out.push((pattern.from + (pattern.to - pattern.from) * (i / count)) * DEG); break;
      }
    }
    return out;
  }

  private updateDirector(dt: number) {
    if (this.phase === 'wave') {
      while (this.pending.length && this.pending[0].time <= this.phaseTime) {
        const spawn = this.pending.shift()!;
        this.spawnEnemy(spawn.kind, spawn.angle);
      }
      if (!this.pending.length && !this.enemies.length) {
        this.emit({ type: 'waveClear', id: this.wave.id });
        this.phase = 'break';
        this.phaseTime = 0;
      }
    } else if (this.phase === 'break' && this.phaseTime >= WAVE_BREAK) {
      if (this.waveIndex + 1 < this.stage.waves.length) this.beginWave(this.waveIndex + 1);
      else {
        this.phase = 'warning';
        this.phaseTime = 0;
        this.emit({ type: 'bossWarning' });
      }
    } else if (this.phase === 'warning' && this.phaseTime >= BOSS_WARNING) {
      this.phase = 'boss';
      this.phaseTime = 0;
      this.spawnBoss();
    }
    void dt;
  }

  // ─── Enemies ───────────────────────────────────────────────

  spawnEnemy(kind: EnemyKind, angle: number, from?: { x: number; y: number }) {
    const stats = ENEMY_STATS[kind];
    const distance = from ? Math.hypot(from.x, from.y) : this.edgeDistance(angle) + stats.radius + 40;
    const x = from ? from.x : Math.cos(angle) * distance;
    const y = from ? from.y : Math.sin(angle) * distance;
    const heading = Math.atan2(-y, -x);
    const speed = Math.max(60, (distance - EARTH_RADIUS) / stats.travelTime);
    const enemy: Enemy = {
      id: this.nextId++, kind, x, y,
      vx: Math.cos(heading) * speed, vy: Math.sin(heading) * speed,
      hp: stats.hp, radius: stats.radius, age: 0, flash: 0,
      hovering: false,
      hoverRadius: Math.min(EYEBALL.hoverMin + this.random() * (EYEBALL.hoverMax - EYEBALL.hoverMin), this.halfWidth - stats.radius - 20),
      orbitDir: this.random() < .5 ? 1 : -1,
      fireTimer: EYEBALL.fireInterval * (.5 + this.random() * .5)
    };
    this.enemies.push(enemy);
    return enemy;
  }

  private updateEnemies(dt: number) {
    const px = this.playerX, py = this.playerY;
    for (const enemy of this.enemies) {
      enemy.age += dt;
      if (enemy.flash > 0) enemy.flash -= dt;
      if (enemy.kind === 'eyeball') {
        const r = Math.hypot(enemy.x, enemy.y);
        if (!enemy.hovering && r <= enemy.hoverRadius) enemy.hovering = true;
        if (enemy.hovering) {
          const a = Math.atan2(enemy.y, enemy.x) + enemy.orbitDir * EYEBALL.orbitSpeed * dt;
          enemy.x = Math.cos(a) * enemy.hoverRadius;
          enemy.y = Math.sin(a) * enemy.hoverRadius;
          if ((enemy.fireTimer -= dt) <= 0) {
            enemy.fireTimer = EYEBALL.fireInterval;
            this.fireEnemyBullet(enemy.x, enemy.y, EYEBALL.bulletSpeed, EYEBALL.bulletDamage);
          }
          continue;
        }
      }
      // 側向擺動讓直線衝鋒不那麼呆板。
      const wobble = Math.sin(enemy.age * 3 + enemy.id) * (enemy.kind === 'mini' ? 40 : 22);
      const len = Math.hypot(enemy.vx, enemy.vy) || 1;
      enemy.x += (enemy.vx + (-enemy.vy / len) * wobble) * dt;
      enemy.y += (enemy.vy + (enemy.vx / len) * wobble) * dt;
    }
    this.enemies = this.enemies.filter(enemy => {
      if (enemy.hp <= 0) return false;
      if (this.stun === 0 && Math.hypot(enemy.x - px, enemy.y - py) < enemy.radius + PLAYER_RADIUS && enemy.kind !== 'eyeball') {
        this.stunPlayer();
        this.emit({ type: 'kill', x: enemy.x, y: enemy.y, kind: enemy.kind, score: 0 });
        return false;
      }
      if (Math.hypot(enemy.x, enemy.y) <= EARTH_RADIUS + enemy.radius * .4) {
        this.hitEarth(enemy.x, enemy.y, ENEMY_STATS[enemy.kind].damage);
        return false;
      }
      return true;
    });
  }

  private damageEnemy(enemy: Enemy, amount: number, source: DamageSource, depth = 0) {
    if (enemy.hp <= 0) return;
    enemy.hp -= amount;
    enemy.flash = .08;
    if (enemy.hp <= 0) this.killEnemy(enemy, true, source, depth);
    else this.emit({ type: 'hit', x: enemy.x, y: enemy.y });
  }

  private killEnemy(enemy: Enemy, allowSplit: boolean, source: DamageSource, depth = 0) {
    enemy.hp = 0;
    const base = ENEMY_STATS[enemy.kind].score;
    const score = this.addKill(base, source);
    this.emit({ type: 'kill', x: enemy.x, y: enemy.y, kind: enemy.kind, score, source });
    if (source === 'nova' || source === 'nova-blast') this.queueNova(enemy.x, enemy.y, depth);
    if (allowSplit && enemy.kind === 'eyeball') {
      const heading = Math.atan2(enemy.y, enemy.x);
      for (let i = 0; i < EYEBALL.splitCount; i++) {
        const offset = (i - (EYEBALL.splitCount - 1) / 2) * .5;
        this.spawnEnemy('mini', heading, {
          x: enemy.x + Math.cos(heading + Math.PI / 2) * offset * 60,
          y: enemy.y + Math.sin(heading + Math.PI / 2) * offset * 60
        });
      }
    }
    this.maybeDrop(enemy.x, enemy.y);
  }

  private addKill(base: number, source: DamageSource) {
    this.kills++;
    if (source === 'chain' || source === 'nova-blast') {
      this.chainKills++;
      this.chainTimer = CHAIN_WINDOW;
    }
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.comboTimer = COMBO_WINDOW;
    const score = Math.round(base * Math.min(3, 1 + this.combo * .05));
    this.score += score;
    if (this.bombs < BOMB_MAX && ++this.bombMeter >= BOMB_KILLS_PER_CHARGE) {
      this.bombMeter = 0;
      this.bombs++;
      this.emit({ type: 'bombCharged' });
    }
    return score;
  }

  private hitEarth(x: number, y: number, damage: number) {
    this.shield -= damage;
    this.combo = 0;
    this.emit({ type: 'earthHit', x, y, damage });
  }

  private fireEnemyBullet(x: number, y: number, speed: number, damage: number) {
    const a = Math.atan2(-y, -x);
    this.enemyBullets.push({ id: this.nextId++, x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, damage });
  }

  private updateEnemyBullets(dt: number) {
    const px = this.playerX, py = this.playerY;
    this.enemyBullets = this.enemyBullets.filter(bullet => {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      if (this.stun === 0 && Math.hypot(bullet.x - px, bullet.y - py) < PLAYER_RADIUS + 14) {
        this.stunPlayer();
        return false;
      }
      if (Math.hypot(bullet.x, bullet.y) <= EARTH_RADIUS) {
        this.hitEarth(bullet.x, bullet.y, bullet.damage);
        return false;
      }
      return true;
    });
  }

  // ─── Player bullets ────────────────────────────────────────

  private updateBullets(dt: number) {
    const limit = Math.hypot(this.halfWidth, this.halfHeight) + 80;
    this.bullets = this.bullets.filter(bullet => {
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;
      if (Math.hypot(bullet.x, bullet.y) > limit) return false;
      for (const enemy of this.enemies) {
        if (enemy.hp > 0 && Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < enemy.radius + 10) {
          this.damageEnemy(enemy, 1, bullet.kind);
          if (bullet.kind === 'chain') this.chainFrom(enemy.x, enemy.y, enemy);
          return false;
        }
      }
      for (let i = 0; i < this.enemyBullets.length; i++) {
        const shot = this.enemyBullets[i];
        if (Math.hypot(shot.x - bullet.x, shot.y - bullet.y) < 26) {
          this.enemyBullets.splice(i, 1);
          this.score += 10;
          this.emit({ type: 'kill', x: shot.x, y: shot.y, kind: 'bullet', score: 10 });
          return false;
        }
      }
      const boss = this.boss;
      if (boss && boss.enter >= 1 && boss.phase !== 'dying') {
        for (const pod of boss.pods) {
          if (pod.alive && Math.hypot(pod.x - bullet.x, pod.y - bullet.y) < BOSS.podRadius + 10) {
            this.damagePod(boss, pod, 1, bullet.kind);
            if (bullet.kind === 'chain') this.chainFrom(pod.x, pod.y, pod);
            return false;
          }
        }
        if (Math.hypot(boss.x - bullet.x, boss.y - bullet.y) < BOSS.bodyRadius) {
          if (boss.phase === 'exposed') this.damageBoss(boss, 1);
          else this.emit({ type: 'deflect', x: bullet.x, y: bullet.y });
          return false;
        }
      }
      return true;
    });
  }

  // ─── Boss ──────────────────────────────────────────────────

  private bossAnchor(theta: number) {
    // 沿畫面邊緣內側的橢圓軌道漂移，永遠有一部分身體在畫面內。
    let x = Math.cos(theta) * (this.halfWidth - 110);
    let y = Math.sin(theta) * (this.halfHeight - 300);
    // 觸手眼球不可伸進戰機軌道；窄螢幕左右兩側時 Boss 會退到畫面邊緣外一半。
    const minDistance = ORBIT_RADIUS + BOSS.podOrbit + 90;
    const distance = Math.hypot(x, y);
    if (distance < minDistance) { x *= minDistance / distance; y *= minDistance / distance; }
    return { x, y };
  }

  private spawnBoss() {
    const theta = 135 * DEG;
    const start = this.bossAnchor(theta);
    const pods: Pod[] = Array.from({ length: BOSS.podCount }, (_, index) => ({
      id: this.nextId++, index, x: start.x, y: start.y, angle: 0,
      hp: BOSS.podHp, alive: true, fireTimer: BOSS.podFireInterval * (index / BOSS.podCount + .5), flash: 0
    }));
    this.boss = {
      x: start.x * 1.8, y: start.y * 1.8, theta, enter: 0,
      hp: BOSS.coreHp, phase: 'pods', pods, podSpin: 0,
      exposedTimer: 0, spawnTimer: BOSS.spawnInterval * .6, dyingTimer: 0, flash: 0
    };
  }

  private updateBoss(dt: number) {
    const boss = this.boss;
    if (!boss) return;
    if (boss.flash > 0) boss.flash -= dt;
    boss.enter = Math.min(1, boss.enter + dt / BOSS.enterTime);
    if (boss.enter >= 1 && boss.phase !== 'dying') boss.theta += BOSS.driftSpeed * dt;
    const anchor = this.bossAnchor(boss.theta);
    const k = 1 + .8 * (1 - easeOut(boss.enter));
    boss.x = anchor.x * k;
    boss.y = anchor.y * k;
    boss.podSpin += BOSS.podSpin * dt;
    for (const pod of boss.pods) {
      if (pod.flash > 0) pod.flash -= dt;
      pod.angle = boss.podSpin + (pod.index / BOSS.podCount) * TAU;
      const reach = BOSS.podOrbit + Math.sin(this.time * 1.6 + pod.index) * 26;
      pod.x = boss.x + Math.cos(pod.angle) * reach;
      pod.y = boss.y + Math.sin(pod.angle) * reach;
    }
    if (boss.phase === 'dying') {
      if ((boss.dyingTimer -= dt) <= 0) {
        this.boss = null;
        this.state = 'won';
        this.emit({ type: 'won' });
      }
      return;
    }
    if (boss.enter < 1) return;
    for (const pod of boss.pods) {
      if (!pod.alive) continue;
      if ((pod.fireTimer -= dt) <= 0) {
        pod.fireTimer = BOSS.podFireInterval * (boss.phase === 'exposed' ? .6 : 1);
        this.fireEnemyBullet(pod.x, pod.y, BOSS.bulletSpeed, BOSS.bulletDamage);
      }
    }
    if ((boss.spawnTimer -= dt) <= 0) {
      boss.spawnTimer = BOSS.spawnInterval;
      for (let i = 0; i < BOSS.spawnCount; i++) {
        const a = Math.atan2(-boss.y, -boss.x) + (i - (BOSS.spawnCount - 1) / 2) * .4;
        this.spawnEnemy('chomper', a, { x: boss.x + Math.cos(a) * BOSS.bodyRadius, y: boss.y + Math.sin(a) * BOSS.bodyRadius });
      }
    }
    if (boss.phase === 'exposed' && (boss.exposedTimer -= dt) <= 0) {
      boss.phase = 'pods';
      boss.pods.slice(0, BOSS.regrowPods).forEach(pod => { pod.alive = true; pod.hp = BOSS.podHp; });
      this.emit({ type: 'bossShielded' });
    }
  }

  private damagePod(boss: Boss, pod: Pod, amount: number, source: DamageSource) {
    if (!pod.alive) return;
    pod.hp -= amount;
    pod.flash = .08;
    if (pod.hp > 0) {
      this.emit({ type: 'hit', x: pod.x, y: pod.y });
      return;
    }
    pod.alive = false;
    const score = this.addKill(BOSS.podScore, source);
    this.emit({ type: 'kill', x: pod.x, y: pod.y, kind: 'pod', score, source });
    if (boss.pods.every(p => !p.alive)) {
      boss.phase = 'exposed';
      boss.exposedTimer = BOSS.exposedTime;
      this.emit({ type: 'bossExposed' });
    }
  }

  private damageBoss(boss: Boss, amount: number) {
    boss.hp -= amount;
    boss.flash = .08;
    this.emit({ type: 'hit', x: boss.x, y: boss.y });
    if (boss.hp <= 0) {
      boss.hp = 0;
      boss.phase = 'dying';
      boss.dyingTimer = BOSS.dyingTime;
      this.score += BOSS.score;
      this.enemies = [];
      this.enemyBullets = [];
      this.emit({ type: 'bossDown', x: boss.x, y: boss.y });
    }
  }

  // ─── Special weapons ───────────────────────────────────────

  private targets(): Target[] {
    const out: Target[] = [];
    for (const enemy of this.enemies) {
      if (enemy.hp > 0) out.push({ ref: enemy, x: enemy.x, y: enemy.y, damage: n => this.damageEnemy(enemy, n, 'chain') });
    }
    const boss = this.boss;
    if (boss && boss.enter >= 1 && boss.phase !== 'dying') {
      for (const pod of boss.pods) {
        if (pod.alive) out.push({ ref: pod, x: pod.x, y: pod.y, damage: n => this.damagePod(boss, pod, n, 'chain') });
      }
    }
    return out;
  }

  /** 雷電鏈：從命中點跳向最近的敵人，最多 jumps 次。 */
  private chainFrom(x: number, y: number, first: object) {
    const { jumps, range } = WEAPONS.chain;
    const points = [{ x, y }];
    const hit = new Set<object>([first]);
    const pool = this.targets();
    let cx = x, cy = y;
    for (let j = 0; j < jumps; j++) {
      let best: Target | null = null;
      let bestDistance: number = range;
      for (const target of pool) {
        if (hit.has(target.ref)) continue;
        const d = Math.hypot(target.x - cx, target.y - cy);
        if (d < bestDistance) { bestDistance = d; best = target; }
      }
      if (!best) break;
      hit.add(best.ref);
      points.push({ x: best.x, y: best.y });
      cx = best.x; cy = best.y;
      best.damage(1);
    }
    if (points.length > 1) this.emit({ type: 'chain', points });
  }

  /** 貫穿雷射：沿戰機方位的整條射線，每 tick 對線上所有目標造成傷害。 */
  private updateLaser(dt: number) {
    this.laserActive = this.weapon === 'laser' && this.stun === 0;
    if (!this.laserActive) { this.laserTick = 0; return; }
    if ((this.laserTick -= dt) > 0) return;
    this.laserTick += WEAPONS.laser.tick;
    const dx = Math.cos(this.playerAngle), dy = Math.sin(this.playerAngle);
    const width = WEAPONS.laser.width;
    const onBeam = (x: number, y: number, r: number) => x * dx + y * dy > ORBIT_RADIUS && Math.abs(x * dy - y * dx) < r + width;
    for (const enemy of this.enemies.slice()) if (enemy.hp > 0 && onBeam(enemy.x, enemy.y, enemy.radius)) this.damageEnemy(enemy, 1, 'laser');
    this.enemyBullets = this.enemyBullets.filter(shot => {
      if (!onBeam(shot.x, shot.y, 14)) return true;
      this.score += 10;
      this.emit({ type: 'kill', x: shot.x, y: shot.y, kind: 'bullet', score: 10, source: 'laser' });
      return false;
    });
    const boss = this.boss;
    if (boss && boss.enter >= 1 && boss.phase !== 'dying') {
      for (const pod of boss.pods) if (pod.alive && onBeam(pod.x, pod.y, BOSS.podRadius)) this.damagePod(boss, pod, 1, 'laser');
      if (onBeam(boss.x, boss.y, BOSS.bodyRadius - width)) {
        if (boss.phase === 'exposed') this.damageBoss(boss, 1);
        else if (++this.laserDeflect % 3 === 0) this.emit({ type: 'deflect', x: boss.x - dx * BOSS.bodyRadius, y: boss.y - dy * BOSS.bodyRadius });
      }
    }
  }

  private queueNova(x: number, y: number, depth: number) {
    if (depth > WEAPONS.nova.maxDepth) return;
    this.novas.push({ x, y, at: this.time + WEAPONS.nova.delay, depth });
  }

  /** 連鎖爆破：延遲一拍後爆炸，炸死的敵人再排入下一層爆炸。 */
  private updateNovas() {
    if (!this.novas.length) return;
    const due = this.novas.filter(n => n.at <= this.time);
    if (!due.length) return;
    this.novas = this.novas.filter(n => n.at > this.time);
    const { radius, damage } = WEAPONS.nova;
    for (const nova of due) {
      this.emit({ type: 'nova', x: nova.x, y: nova.y, depth: nova.depth, radius });
      for (const enemy of this.enemies.slice()) {
        if (enemy.hp > 0 && Math.hypot(enemy.x - nova.x, enemy.y - nova.y) < radius + enemy.radius) {
          this.damageEnemy(enemy, damage, 'nova-blast', nova.depth + 1);
        }
      }
      this.enemyBullets = this.enemyBullets.filter(shot => Math.hypot(shot.x - nova.x, shot.y - nova.y) >= radius);
      const boss = this.boss;
      if (boss && boss.enter >= 1 && boss.phase !== 'dying') {
        for (const pod of boss.pods) {
          if (pod.alive && Math.hypot(pod.x - nova.x, pod.y - nova.y) < radius + BOSS.podRadius) this.damagePod(boss, pod, damage, 'nova-blast');
        }
      }
    }
  }

  // ─── Pickups ───────────────────────────────────────────────

  private maybeDrop(x: number, y: number) {
    let kind: PickupKind | null = null;
    if (this.showcaseKind && this.kills >= this.showcaseAt) {
      kind = this.showcaseKind;
      this.showcaseKind = null;
    } else if (this.random() < PICKUP.dropChance) {
      const entries = Object.entries(PICKUP.weights) as [PickupKind, number][];
      let roll = this.random() * entries.reduce((sum, [, w]) => sum + w, 0);
      kind = entries.find(([, w]) => (roll -= w) < 0)?.[0] ?? 'repair';
    }
    if (!kind) return;
    const a = Math.atan2(-y, -x);
    this.pickups.push({ id: this.nextId++, kind, x, y, vx: Math.cos(a) * PICKUP.speed, vy: Math.sin(a) * PICKUP.speed, age: 0 });
  }

  private updatePickups(dt: number) {
    const px = this.playerX, py = this.playerY;
    this.pickups = this.pickups.filter(pickup => {
      pickup.age += dt;
      const toShip = Math.hypot(px - pickup.x, py - pickup.y);
      if (toShip < PICKUP.magnetRadius) {
        const pull = PICKUP.magnetSpeed * (1 - toShip / PICKUP.magnetRadius) + PICKUP.speed;
        pickup.vx = (px - pickup.x) / toShip * pull;
        pickup.vy = (py - pickup.y) / toShip * pull;
      }
      pickup.x += pickup.vx * dt;
      pickup.y += pickup.vy * dt;
      if (Math.hypot(pickup.x - px, pickup.y - py) < PICKUP.collectRadius) {
        if (pickup.kind in WEAPONS) this.equip(pickup.kind as WeaponKind);
        else if (pickup.kind === 'repair') this.shield = Math.min(SHIELD_MAX, this.shield + PICKUP.repairAmount);
        else this.bombs = Math.min(BOMB_MAX, this.bombs + 1);
        this.emit({ type: 'pickup', kind: pickup.kind, x: pickup.x, y: pickup.y });
        return false;
      }
      return Math.hypot(pickup.x, pickup.y) > EARTH_RADIUS;
    });
  }

  equip(weapon: WeaponKind) {
    if (weapon === this.weapon) this.weaponTime += WEAPONS[weapon].duration;
    else { this.weapon = weapon; this.weaponTime = WEAPONS[weapon].duration; }
    this.fireTimer = 0;
  }

  private emit(event: GameEvent) { this.events.push(event); }
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;
