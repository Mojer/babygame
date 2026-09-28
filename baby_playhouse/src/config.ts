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
}

export const CHARACTERS: CharacterDef[] = [
  { key: 'panda', label: '熊貓', icon: '🐼', spawn: [-2.05, -2.05], facing: Math.PI / 4, voice: 330 },
  { key: 'bunny', label: '兔兔', icon: '🐰', spawn: [1.55, 1.35], facing: Math.PI / 4, voice: 620 },
  { key: 'cat', label: '貓咪', icon: '🐱', spawn: [2.2, -0.55], facing: Math.PI / 4 + 0.35, voice: 470 },
];

export const ROOMS = {
  cafe: { model: 'models/room_cafe.glb' },
};

/** Messages for doors leading to rooms that are not built yet. */
export const COMING_SOON: Record<string, string> = {
  bathroom: '🛁 浴室蓋房子中…',
};

export const WALK_SPEED = 1.3; // m/s
export const CHAR_RADIUS = 0.16;
export const NAV_CELL = 0.1;
