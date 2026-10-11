/**
 * 可選角色。刻意只有少數差異：血量、移動速度、基本攻擊；技能與升級全部共用。
 */
export type CharacterId = 'akane' | 'yu';

export interface BasicAttack {
  label: string;
  cooldown: number;
  damage: number;
  speed: number;
  /** 自動瞄準的搜尋距離 */
  range: number;
  life: number;
  /** 最多貫穿幾隻 */
  pierce: number;
  /** 命中判定半徑 */
  radius: number;
  /** 命中時爆炸的範圍傷害（爆炸算 T_EXPLOSION，會碎裂凍結的殭屍） */
  splash?: { radius: number; damage: number };
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  title: string;
  desc: string;
  hp: number;
  speed: number;
  attack: BasicAttack;
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  akane: {
    id: 'akane',
    name: '茜',
    title: '重砲少女',
    desc: '側背重型大砲：砲彈命中就爆炸，範圍傷害、能炸碎凍結的殭屍；射速慢。跑得快、血量較少——邊跑邊轟。',
    hp: 90,
    speed: 82,
    attack: { label: '範圍爆破砲', cooldown: 0.75, damage: 10, speed: 220, range: 230, life: 1.2, pierce: 1, radius: 6, splash: { radius: 30, damage: 12 } },
  },
  yu: {
    id: 'yu',
    name: '宇',
    title: '機槍少年',
    desc: '輕機槍連射：射速極快、射程長，一次打一隻。血量多、稍慢——站穩掃射、精準點殺。',
    hp: 125,
    speed: 68,
    attack: { label: '輕機槍', cooldown: 0.14, damage: 3.2, speed: 380, range: 240, life: 0.7, pierce: 1, radius: 2 },
  },
};

export const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[];
