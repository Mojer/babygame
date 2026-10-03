export interface CharacterDef {
  key: string;
  label: string;
  icon: string;
  /** Spawn position on the floor (three.js world, metres). */
  spawn: [number, number];
  /** Facing angle in radians around +Y (0 = facing +Z / camera side). */
  facing: number;
  /** Base pitch of the character's "hi" voice. */
  voice: number;
  /** Things the character says in a speech bubble when picked (one at random). */
  lines: string[];
}

export const CHARACTERS: CharacterDef[] = [
  {
    key: 'capybara',
    label: '園長',
    icon: '🌱',
    spawn: [1.35, 1.35],
    facing: Math.PI / 4,
    voice: 200,
    lines: ['有東西找不到，希望大家可以幫忙搜尋！', '慢慢來，不要急～', '頭上的小芽今天也很有精神！'],
  },
  {
    key: 'akane',
    label: '小茜',
    icon: '👧',
    spawn: [0, 0],
    facing: Math.PI / 4,
    voice: 560,
    lines: ['我是小茜！', '我來幫忙找東西！', '書包裡有點心喔～'],
  },
  {
    key: 'yu',
    label: '小宇',
    icon: '👦',
    spawn: [0, 0],
    facing: Math.PI / 4,
    voice: 470,
    lines: ['我是小宇！', '我跑很快喔！', '要不要一起找？'],
  },
  {
    key: 'panda',
    label: '熊貓',
    icon: '🐼',
    spawn: [-2.05, -2.05],
    facing: Math.PI / 4,
    voice: 330,
    lines: ['我來煮咖啡！', '肚子有點餓了～', '一起玩吧！'],
  },
  {
    key: 'bunny',
    label: '兔兔',
    icon: '🐰',
    spawn: [1.55, 1.35],
    facing: Math.PI / 4,
    voice: 620,
    lines: ['蹦蹦跳跳！', '我想玩溜滑梯！', '嗨嗨！'],
  },
  {
    key: 'cat',
    label: '貓咪',
    icon: '🐱',
    spawn: [2.2, -0.55],
    facing: Math.PI / 4 + 0.35,
    voice: 470,
    lines: ['喵～', '我想騎搖搖馬！', '找東西交給我！'],
  },
];

export interface RoomDef {
  model: string;
  label: string;
  /** Background colour around the room (sky for outdoor rooms). */
  bg?: number;
}

export const ROOMS: Record<string, RoomDef> = {
  living: { model: 'models/room_living.glb', label: '🛋️ 迎賓客廳' },
  cafe: { model: 'models/room_cafe.glb', label: '☕ 咖啡廳' },
  bathroom: { model: 'models/room_bathroom.glb', label: '🛁 浴室' },
  lawn: { model: 'models/room_lawn.glb', label: '🌳 草坪', bg: 0xcfe8f6 },
  ballpit: { model: 'models/room_ballpit.glb', label: '🎈 球池房間' },
  farm: { model: 'models/room_farm.glb', label: '🌻 開心農場', bg: 0xcfe8f6 },
};

export const START_ROOM = 'lawn';

/** Opening line: who speaks right after the game loads. */
export const INTRO = { speaker: 'capybara', text: '有東西找不到，希望大家可以幫忙搜尋！' };
export const DEFAULT_BG = 0xf3e6d3;

/** Messages for doors leading to rooms that are not built yet. */
export const COMING_SOON: Record<string, string> = {};

export const WALK_SPEED = 1.3; // m/s
export const CHAR_RADIUS = 0.16;
export const NAV_CELL = 0.1;
