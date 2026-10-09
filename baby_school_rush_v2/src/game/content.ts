export type Route = 'upper' | 'middle' | 'lower';
export type ObstacleKind = 'barrier' | 'beam' | 'bike' | 'gate';

export type PlatformSpec = {
  x: number;
  width: number;
  y: number;
  route: Route;
  /** Can be dropped through with Slide. */
  oneWay?: boolean;
  /** Drawn as a thin bridge deck instead of a solid rooftop block. */
  deck?: boolean;
};

export type ObstacleSpec = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: ObstacleKind;
  route: Route;
};

export type PickupSpec = { id: string; x: number; y: number; route: Route };

/** Roughly 89 seconds of running at the authored section paces, before RUSH and penalties. */
export const LEVEL_LENGTH = 32_400;
export const BASELINE = 430;
/** Deep enough that a standing runner (76px) passes under middle-route ground obstacles. */
export const LOWER_ROUTE = 516;
/** Bottom edge of a street-level beam: standing runners hit it, sliding runners pass under. */
const BEAM_Y = BASELINE - 68;

/**
 * Railway crossing set piece. Once the runner is `warnDistance` from the tracks the bell starts,
 * the street gate closes and a train passes; the footbridge above and the underpass below stay open.
 */
export const CROSSING = {
  trackX: 26_600,
  trackWidth: 220,
  /** The near-side gate the street route is held behind. */
  gateX: 26_560,
  warnDistance: 1_800,
  bridgeY: 322,
  /** Seconds after the warning. */
  armDown: 1.4,
  trainIn: 2.6,
  trainOut: 6.6,
  armUp: 7.6
} as const;

export const platforms: PlatformSpec[] = [
  { x: 0, width: LEVEL_LENGTH + 1_200, y: BASELINE, route: 'middle', oneWay: true },
  // Build: first rooftops and the first underpass.
  { x: 5_400, width: 1_300, y: 322, route: 'upper', oneWay: true },
  { x: 7_600, width: 900, y: 350, route: 'upper', oneWay: true },
  { x: 9_300, width: 1_500, y: LOWER_ROUTE, route: 'lower', oneWay: true },
  // Fast: a long high rooftop over a dense street.
  { x: 14_900, width: 1_500, y: 308, route: 'upper', oneWay: true },
  // Breath: riverside underpass.
  { x: 21_000, width: 1_500, y: LOWER_ROUTE, route: 'lower', oneWay: true },
  // Event: footbridge and underpass around the railway crossing.
  { x: CROSSING.trackX - 700, width: 1_300, y: CROSSING.bridgeY, route: 'upper', deck: true },
  { x: CROSSING.trackX - 650, width: 1_350, y: LOWER_ROUTE, route: 'lower', oneWay: true },
  // Final: one last rooftop before the school gate.
  { x: 30_500, width: 1_100, y: 330, route: 'upper', oneWay: true }
];

const SIZE: Record<ObstacleKind, { width: number; height: number }> = {
  barrier: { width: 52, height: 54 },
  beam: { width: 116, height: 30 },
  bike: { width: 52, height: 54 },
  gate: { width: 60, height: 60 }
};

type Placement = [kind: ObstacleKind, x: number, route?: Route, y?: number];

/** Street obstacles stand on BASELINE and street beams hang at BEAM_Y unless a y is given. */
const layout: Placement[] = [
  // Calm 0–16%: learn jump and slide one at a time.
  ['barrier', 1_480], ['beam', 2_300], ['barrier', 3_100], ['beam', 3_800], ['bike', 4_500],
  // Build 16–38%: routes open up.
  ['beam', 5_800], ['barrier', 5_950, 'upper', 322], ['barrier', 6_400],
  ['bike', 7_100], ['barrier', 8_000], ['bike', 8_100, 'upper', 350], ['beam', 8_800],
  ['bike', 9_700], ['barrier', 9_900, 'lower', LOWER_ROUTE], ['beam', 10_300],
  ['barrier', 11_100], ['beam', 11_800],
  // Fast 38–58%: tight chains for Perfect streaks.
  ['barrier', 12_700], ['beam', 13_300], ['barrier', 13_850], ['bike', 14_450],
  ['beam', 15_300], ['beam', 15_500, 'upper', 268], ['barrier', 15_900], ['barrier', 16_000, 'upper', 308], ['bike', 16_300],
  ['barrier', 16_800], ['beam', 17_350], ['bike', 17_900], ['gate', 18_450],
  // Breath 58–72%: room to read the next line.
  ['barrier', 19_400], ['beam', 20_500],
  ['bike', 21_500], ['barrier', 21_700, 'lower', LOWER_ROUTE], ['barrier', 22_900],
  // Event 72–90%: clear the street before the crossing, then pick bridge or underpass.
  ['barrier', 23_800], ['beam', 24_350],
  ['barrier', 26_200, 'lower', LOWER_ROUTE], ['barrier', 26_950, 'upper', CROSSING.bridgeY],
  ['bike', 27_900], ['beam', 28_500],
  // Final 90–100%: school gate sprint.
  ['barrier', 29_600], ['beam', 30_150], ['gate', 31_300], ['barrier', 31_900]
];

export const obstacles: ObstacleSpec[] = layout.map(([kind, x, route = 'middle', y], index) => ({
  id: `o${String(index + 1).padStart(2, '0')}`,
  x,
  y: y ?? (kind === 'beam' ? BEAM_Y : BASELINE),
  ...SIZE[kind],
  kind,
  route
}));

const PICKUP_SPACING = 420;
const spans = (platform: PlatformSpec, x: number) => x >= platform.x && x <= platform.x + platform.width;

/** Coins follow the optional route wherever one exists, rewarding the detour. */
export const pickups: PickupSpec[] = Array.from({ length: Math.floor((LEVEL_LENGTH - 1_400) / PICKUP_SPACING) }, (_, index) => {
  const x = 780 + index * PICKUP_SPACING;
  const wave = Math.sin(index % 6);
  const upper = platforms.find(platform => platform.route === 'upper' && spans(platform, x));
  const lower = platforms.find(platform => platform.route === 'lower' && spans(platform, x));
  const id = `p${index}`;
  if (upper) return { id, x, y: upper.y - 52 - wave * 24, route: 'upper' };
  if (lower) return { id, x, y: LOWER_ROUTE - 38, route: 'lower' };
  return { id, x, y: 360 - wave * 42, route: 'middle' };
});

export const sectionAt = (progress: number) => {
  if (progress < .16) return { id: 'calm', label: '晨光巷口', pace: 300 };
  if (progress < .38) return { id: 'build', label: '屋頂捷徑', pace: 348 };
  if (progress < .58) return { id: 'fast', label: '商店街快線', pace: 402 };
  if (progress < .72) return { id: 'breath', label: '河堤喘息', pace: 318 };
  if (progress < .90) return { id: 'event', label: '平交道追逐', pace: 428 };
  return { id: 'final', label: '校門衝刺', pace: 472 };
};
