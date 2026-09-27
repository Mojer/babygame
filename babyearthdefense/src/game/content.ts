// 遊戲數值與關卡資料。座標單位為邏輯像素（基準畫面 1080×1920，地球在原點）。

export type EnemyKind = 'chomper' | 'eyeball' | 'mini';
export type WeaponKind = 'blaster' | 'spread' | 'chain' | 'laser' | 'nova';
export type PickupKind = Exclude<WeaponKind, 'blaster'> | 'repair' | 'bomb';

export interface EnemyStats {
  hp: number;
  radius: number;
  /** 從出生點抵達地球表面的秒數；以時間而非速度定義，直式螢幕上下左右來的敵人才公平。 */
  travelTime: number;
  /** 撞上地球扣的護盾值。 */
  damage: number;
  score: number;
}

export const ENEMY_STATS: Record<EnemyKind, EnemyStats> = {
  chomper: { hp: 1, radius: 44, travelTime: 7.5, damage: 10, score: 100 },
  eyeball: { hp: 3, radius: 46, travelTime: 5, damage: 12, score: 250 },
  mini: { hp: 1, radius: 24, travelTime: 3.2, damage: 5, score: 50 }
};

export const EYEBALL = {
  hoverMin: 390,
  hoverMax: 450,
  orbitSpeed: .28,
  fireInterval: 3.2,
  bulletSpeed: 180,
  bulletDamage: 4,
  splitCount: 2
};

export const BOSS = {
  bodyRadius: 150,
  coreHp: 70,
  podCount: 8,
  podHp: 7,
  podRadius: 36,
  podOrbit: 210,
  podSpin: .45,
  podFireInterval: 5.5,
  bulletSpeed: 170,
  bulletDamage: 3,
  spawnInterval: 9,
  spawnCount: 2,
  exposedTime: 9,
  regrowPods: 4,
  driftSpeed: .045,
  enterTime: 3,
  dyingTime: 2.2,
  score: 5000,
  podScore: 300
};

export const WEAPONS = {
  blaster: { name: 'BLASTER', label: '光束砲', duration: 0, interval: .11 },
  spread: { name: 'SPREAD', label: '散射彈', duration: 10, interval: .11 },
  /** 命中後電弧跳向附近敵人。 */
  chain: { name: 'CHAIN LIGHTNING', label: '雷電鏈', duration: 10, interval: .16, jumps: 4, range: 300 },
  /** 持續貫穿光束，打穿直線上所有東西。 */
  laser: { name: 'PIERCING LASER', label: '貫穿雷射', duration: 7, interval: 0, tick: .07, width: 30 },
  /** 擊破的敵人會爆炸，炸死的敵人再爆炸，連鎖擴散。 */
  nova: { name: 'CHAIN NOVA', label: '連鎖爆破', duration: 10, interval: .12, radius: 180, delay: .1, maxDepth: 6, damage: 2 }
} as const;

export const PICKUP = {
  dropChance: .09,
  speed: 95,
  collectRadius: 80,
  /** 距離戰機多近開始被吸過去（小朋友友善）。 */
  magnetRadius: 260,
  magnetSpeed: 900,
  repairAmount: 15,
  weights: { spread: 4, chain: 3, laser: 2, nova: 3, repair: 3, bomb: 2 } as Record<PickupKind, number>,
  /** 每個波次保證掉落一次的展示武器（依波次順序），讓玩家體驗每種武器。 */
  showcase: ['chain', 'laser', 'nova'] as PickupKind[],
  showcaseAfterKills: 3
};

/** 連鎖擊破計數視窗（秒）。 */
export const CHAIN_WINDOW = .6;

export type SpawnPattern =
  | { kind: 'random' }
  | { kind: 'arc'; center: number; spread: number }
  | { kind: 'ring' }
  | { kind: 'sweep'; from: number; to: number };

export interface SpawnGroup {
  enemy: EnemyKind;
  count: number;
  /** 同組內每隻間隔秒數。 */
  interval: number;
  /** 距離波次開始的秒數。 */
  delay: number;
  /** 角度以度數表示，0° 為右、90° 為下（螢幕座標）。 */
  pattern: SpawnPattern;
}

export interface WaveSpec {
  id: string;
  groups: SpawnGroup[];
}

export interface StageSpec {
  id: number;
  waves: WaveSpec[];
}

export const STAGES: StageSpec[] = [
  {
    id: 1,
    waves: [
      {
        id: '1-1',
        groups: [
          { enemy: 'chomper', count: 6, interval: 1.4, delay: 0, pattern: { kind: 'random' } },
          { enemy: 'chomper', count: 4, interval: .5, delay: 9, pattern: { kind: 'arc', center: -90, spread: 50 } }
        ]
      },
      {
        id: '1-2',
        groups: [
          { enemy: 'chomper', count: 5, interval: .45, delay: 0, pattern: { kind: 'arc', center: 90, spread: 60 } },
          { enemy: 'eyeball', count: 2, interval: 2, delay: 3, pattern: { kind: 'random' } },
          { enemy: 'chomper', count: 8, interval: .7, delay: 7, pattern: { kind: 'sweep', from: 0, to: 360 } }
        ]
      },
      {
        id: '1-3',
        groups: [
          { enemy: 'chomper', count: 8, interval: 0, delay: 0, pattern: { kind: 'ring' } },
          { enemy: 'eyeball', count: 3, interval: 1.5, delay: 4, pattern: { kind: 'random' } },
          { enemy: 'chomper', count: 6, interval: .4, delay: 10, pattern: { kind: 'arc', center: 180, spread: 70 } },
          { enemy: 'chomper', count: 6, interval: .4, delay: 12, pattern: { kind: 'arc', center: 0, spread: 70 } }
        ]
      }
    ]
  }
];
