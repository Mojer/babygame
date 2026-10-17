/** Simulation-clock poses keep the five candy creatures visibly alive even in a crowd.
 * Write into a reusable pose so the horde renderer does not allocate per enemy/frame.
 */
export interface CandyPose { frame: number; lift: number; lean: number; scaleX: number; scaleY: number }
export const CANDY_GAITS = [
  { fps: 10, hop: 2, lean: .09, squash: .035 },
  { fps: 8, hop: 6, lean: .06, squash: .08 },
  { fps: 9, hop: 5, lean: .065, squash: .13 },
  { fps: 11, hop: 3.5, lean: .095, squash: .065 },
  { fps: 6, hop: 1.6, lean: .04, squash: .035 },
] as const;

export function candyPose(kind: number, time: number, slot: number, out: CandyPose): CandyPose {
  const gait = CANDY_GAITS[kind];
  const step = time * gait.fps + slot * 2.47213595;
  const phase = step * Math.PI / 4;
  const wave = Math.cos(phase * 2);
  out.frame = (step | 0) & 7;
  out.lift = kind === 1 ? (Math.sin(phase) + 1) * gait.hop / 2 : Math.abs(Math.sin(phase)) * gait.hop;
  out.lean = Math.sin(phase) * gait.lean;
  out.scaleX = 1 + wave * gait.squash;
  out.scaleY = 1 - wave * gait.squash;
  return out;
}
