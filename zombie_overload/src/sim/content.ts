// 所有數值集中在這裡（調難度、調效能預算改這裡）。sim/ 底下不依賴 Pixi，可在 Node 執行。

export const FIXED_STEP = 1 / 60;
export const RUN_SECONDS = 600;

// 地圖：世界座標 1 單位 = 1 個像素美術像素
export const MAP_W = 2048;
export const MAP_H = 2048;
export const CELL = 16; // 空間網格與流場共用的格子大小
export const GRID_W = MAP_W / CELL;
export const GRID_H = MAP_H / CELL;
export const BORDER = 128; // 外圍建築厚度

// 殭屍種類
export const WALKER = 0;
export const RUNNER = 1;
export const BRUTE = 2;
export const CORE = 3;
/** 巨大變異體（小 Boss）：不會被凍結、吸入或引爆，只能硬打 */
export const MUTANT = 4;

export interface ZombieKind {
  name: string;
  label: string;
  hp: number;
  speed: number;
  radius: number;
  dps: number;
  xp: number;
}

export const ZOMBIE_KINDS: ZombieKind[] = [
  { name: 'walker', label: '普通殭屍', hp: 10, speed: 24, radius: 5, dps: 5, xp: 1 },
  { name: 'runner', label: '衝刺殭屍', hp: 6, speed: 56, radius: 4.5, dps: 5, xp: 1 },
  { name: 'brute', label: '裝甲殭屍', hp: 70, speed: 17, radius: 7, dps: 12, xp: 5 },
  { name: 'core', label: '感染核心', hp: 16, speed: 21, radius: 5.5, dps: 5, xp: 2 },
  { name: 'mutant', label: '巨大變異體', hp: 420, speed: 19, radius: 11, dps: 22, xp: 30 },
];
export const KIND_RADIUS = Float32Array.from(ZOMBIE_KINDS, k => k.radius);
export const MAX_ZOMBIE_RADIUS = 11;

// 狀態位元
export const FROZEN = 1;
export const PULLED = 2;
export const VOLATILE = 4;
export const DEAD = 128;

// 傷害觸發類型（反應表用）
export const T_HIT = 1;
export const T_EXPLOSION = 2;
export const T_BEAM = 4;
export const T_SHARD = 8;
export const T_SHOCK = 16;
export const T_DOT = 32;
/** 這些觸發造成的擊殺會計入 CHAIN 連擊 */
export const T_AREA = T_EXPLOSION | T_BEAM | T_SHARD | T_SHOCK;

// 死亡表現（給渲染層挑特效）
export const CAUSE_NORMAL = 0;
export const CAUSE_SHATTER = 1;
export const CAUSE_BURN = 2;
export const CAUSE_BLAST = 3;
export const CAUSE_PLAGUE = 4;

export const PLAYER = {
  hp: 100,
  speed: 74,
  radius: 5,
  dashSpeed: 300,
  dashTime: 0.16,
  dashCooldown: 2.2,
  pickup: 48,
  maxTouching: 5,
};

export const SKILLS = {
  bolt: { cooldown: 0.42, damage: 6, speed: 260, range: 210, life: 1.1 },
  frost: { cooldown: 6.5, radius: 84, freeze: 3.2, damage: 2 },
  hole: { cooldown: 9, radius: 118, duration: 2.6, pull: 150, dps: 4, collapseRadius: 54, collapseBase: 26, collapsePer: 0.5 },
  beam: { cooldown: 7.5, telegraph: 0.5, sweep: 1.1, length: 250, radius: 22, dps: 120 },
  /** 大招：衝擊波傷害、擴散速度；兩種提案各自的時間軸 */
  ult: {
    killsToCharge: 220,
    damage: 26,
    ringSpeed: 720,
    /** 星艦：對角飛越全程秒數；ease 越大中央越慢（0.72 → 中央約為平均速度的 28%，不會停） */
    ship: { duration: 1.9, ease: 0.72 },
    // 天降巨砲：落地後連續 volleys 輪全方位散射，每輪 shells 發、角度逐輪錯開；砲彈貫穿、每隻每發只打一次
    pylon: { fall: 0.45, impactRadius: 70, volleys: 7, interval: 0.2, shells: 24, shellSpeed: 560, shellRadius: 15, linger: 0.35, fade: 0.4 },
  },
};

export const REACTION = {
  shard: { radius: 24, damage: 12, delay: [0.04, 0.07] as const },
  // 殉爆傷害刻意低於感染核心血量：殉爆不會自己引爆核心 → 連鎖是「局部」的，大連鎖要靠玩家組合技能
  burst: { radius: 28, damage: 14, delay: [0.06, 0.09] as const },
  plague: { radius: 50, damage: 30, volatileRadius: 64, volatileMax: 10, volatileTime: 5, delay: [0.09, 0.13] as const },
};

export const CHAIN = {
  maxDepth: 40,
  budgetPerTick: 96, // 每個 tick 最多結算幾個連鎖事件，超過的順延
  maxPending: 8192,
  comboWindow: 0.5, // 佇列已清空且這段時間沒有新擊殺，這條連鎖結束
  bannerMin: 15,
};

export const GEMS = { cap: 600 };

/** 最終波：時間到後在主角周圍一圈生出大量巨大變異體，全部擊倒才算過關；之後 finishDelay 秒進結算。
 *  最終波期間變異體血量 ×hpScale、一般殭屍照常以 spawnScale 速率生成（沒有屍潮、不再生變異體），保留連鎖與大招充能 */
export const FINAL = { mutants: 10, ringMin: 230, ringMax: 380, finishDelay: 3.2, hpScale: 0.6, spawnScale: 0.5 };

// 生怪節奏：每秒生成 base + perSec × 秒數（打得越快不會生得越快 → 一局總擊殺約 2 萬）
export const DIRECTOR = {
  base: 6,
  perSec: 0.12,
  /** 一半在畫面邊緣生成（立刻有戰鬥），一半在遠處外圈（屍群慢慢合圍、累積數量） */
  farShare: 0.5,
  farMin: 120,
  farMax: 520,
  /** 巨大變異體：第一隻出現時間、間隔、同時最多幾隻（隨時間增加） */
  mutantFirst: 90,
  mutantEvery: 70,
  mutantMaxBase: 1,
  mutantMaxPerMin: 0.34,
  /** 第 5 分鐘後：間隔逐漸縮短、同時上限加速成長、每次可能一次來 2 隻 */
  mutantLateStart: 300,
  mutantLateEvery: 30,
  mutantLateAccel: 0.075,
  mutantLateEveryMin: 10,
  mutantLatePerMin: 2,
  surgeEvery: 50,
  surgeFirst: 40,
  surgeBase: 150,
  surgePerSec: 1.2,
  /** 殭屍血量隨時間成長：1 + 秒數 / hpRamp */
  hpRamp: 600,
};

// 品質分級：同屏上限與特效預算
export const TIERS = {
  low: { label: '低', cap: 700, particles: 1500, splatsPerFrame: 60, deathFxPerFrame: 40, lens: false, sepNeighbors: 6 },
  mid: { label: '中', cap: 1400, particles: 3000, splatsPerFrame: 140, deathFxPerFrame: 100, lens: true, sepNeighbors: 8 },
  high: { label: '高', cap: 2600, particles: 6000, splatsPerFrame: 260, deathFxPerFrame: 220, lens: true, sepNeighbors: 8 },
};
export type TierName = keyof typeof TIERS;
export const TIER_ORDER: TierName[] = ['low', 'mid', 'high'];

export function xpForLevel(level: number) {
  return Math.floor(5 * Math.pow(1.17, level) + level * 3);
}
