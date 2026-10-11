export interface Mods {
  boltCount: number;
  boltDamage: number;
  frostRadius: number;
  frostCd: number;
  holeRadius: number;
  holePower: number;
  beamLength: number;
  beamRadius: number;
  cdAll: number;
  move: number;
  pickup: number;
  reactionRadius: number;
  ultCharge: number;
}

export const baseMods = (): Mods => ({
  boltCount: 1,
  boltDamage: 1,
  frostRadius: 1,
  frostCd: 1,
  holeRadius: 1,
  holePower: 1,
  beamLength: 1,
  beamRadius: 1,
  cdAll: 1,
  move: 1,
  pickup: 1,
  reactionRadius: 1,
  ultCharge: 1,
});

export interface UpgradeTarget {
  mods: Mods;
  addMaxHp(n: number): void;
  heal(n: number): void;
}

export interface Upgrade {
  id: string;
  icon: string;
  name: string;
  desc: string;
  max: number;
  apply(t: UpgradeTarget): void;
}

export const UPGRADES: Upgrade[] = [
  { id: 'bolt', icon: '🔹', name: '基本攻擊強化', desc: '基本攻擊 +1 發，傷害 +20%', max: 5, apply: t => { t.mods.boltCount++; t.mods.boltDamage *= 1.2; } },
  { id: 'frost', icon: '❄️', name: '冰晶崩裂', desc: '凍結範圍 +18%，冷卻 -8%', max: 5, apply: t => { t.mods.frostRadius *= 1.18; t.mods.frostCd *= 0.92; } },
  { id: 'hole', icon: '🌀', name: '黑洞壓縮', desc: '吸入範圍 +15%，坍縮傷害 +25%', max: 5, apply: t => { t.mods.holeRadius *= 1.15; t.mods.holePower *= 1.25; } },
  { id: 'beam', icon: '☄️', name: '軌道焚城', desc: '橫掃長度 +20%，光束寬度 +12%', max: 5, apply: t => { t.mods.beamLength *= 1.2; t.mods.beamRadius *= 1.12; } },
  { id: 'cd', icon: '⏱️', name: '超頻核心', desc: '全部技能冷卻 -8%', max: 4, apply: t => { t.mods.cdAll *= 0.92; } },
  { id: 'reaction', icon: '💥', name: '連鎖增幅', desc: '碎裂／毒爆／殉爆範圍 +12%', max: 4, apply: t => { t.mods.reactionRadius *= 1.12; } },
  { id: 'move', icon: '👟', name: '輕量跑鞋', desc: '移動速度 +10%', max: 3, apply: t => { t.mods.move *= 1.1; } },
  { id: 'magnet', icon: '🧲', name: '磁吸', desc: '拾取範圍 +35%', max: 3, apply: t => { t.mods.pickup *= 1.35; } },
  { id: 'ult', icon: '⚡', name: '終極充能', desc: '終極武器充能速度 +25%', max: 3, apply: t => { t.mods.ultCharge *= 1.25; } },
  { id: 'vital', icon: '❤️', name: '強化體質', desc: '最大生命 +20 並回滿', max: 3, apply: t => { t.addMaxHp(20); } },
];

export const FALLBACK_UPGRADE: Upgrade = {
  id: 'medkit',
  icon: '🩹',
  name: '急救包',
  desc: '回復 30 生命',
  max: Infinity,
  apply: t => t.heal(30),
};
