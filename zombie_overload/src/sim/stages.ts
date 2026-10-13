export const STAGE_IDS = ['city', 'japan'] as const;
export type StageId = (typeof STAGE_IDS)[number];

export const STAGES = {
  city: {
    id: 'city', number: '01', name: '屍潮都市', latin: 'DEAD CITY', color: '#4fc3ff',
    subtitle: '最後的都市防線',
    description: '穿過廢棄街道與中央廣場，在失控的感染屍潮中撐過十分鐘。',
    landmarks: ['都市廣場', '十字街道', '中央噴水池'],
    enemies: ['普通殭屍', '衝刺殭屍', '裝甲殭屍', '感染核心', '巨大變異體'],
    boss: '巨大變異體', bossPlural: '巨大變異體', core: '感染核心', horde: '屍潮',
  },
  japan: {
    id: 'japan', number: '02', name: '百鬼夜行', latin: 'NIGHT OF THE YOKAI', color: '#ff8cb3',
    subtitle: '妖氣籠罩的神社參道',
    description: '踏入月下神社，穿越朱紅鳥居、櫻花庭園與祭典街。百鬼甦醒，巨獸正在逼近。',
    landmarks: ['朱紅鳥居', '月下神社', '櫻花祭典街'],
    enemies: ['河童', '天狗', '赤鬼', '唐傘妖', '荒魂巨獸'],
    boss: '荒魂巨獸', bossPlural: '荒魂巨獸', core: '唐傘妖', horde: '百鬼',
  },
} satisfies Record<StageId, {
  id: StageId; number: string; name: string; latin: string; color: string;
  subtitle: string; description: string; landmarks: string[]; enemies: string[];
  boss: string; bossPlural: string; core: string; horde: string;
}>;

export function stageId(value: string | null | undefined): StageId | null {
  return STAGE_IDS.includes(value as StageId) ? value as StageId : null;
}
