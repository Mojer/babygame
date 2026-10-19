import type { CandyPose } from './candyMotion';
/** Separate cadences: dragging linen, quick jackal steps, armor weight, hovering reaper. */
export const DESERT_GAITS = [
  {fps:7,hop:1.3,lean:.055,squash:.025},
  {fps:12,hop:3.4,lean:.10,squash:.045},
  {fps:7,hop:1.8,lean:.045,squash:.035},
  {fps:8,hop:4,lean:.055,squash:.025},
  {fps:6,hop:1.7,lean:.04,squash:.035},
] as const;
export function desertPose(kind:number,time:number,slot:number,out:CandyPose):CandyPose {
  const gait=DESERT_GAITS[kind];
  const step=time*gait.fps+slot*2.47213595,phase=step*Math.PI/4;
  out.frame=(step|0)&7;
  out.lift=kind===3?(Math.sin(phase)+1)*gait.hop/2:Math.abs(Math.sin(phase))*gait.hop;
  out.lean=Math.sin(phase)*gait.lean;
  out.scaleX=1+Math.cos(phase*2)*gait.squash;
  out.scaleY=1-Math.cos(phase*2)*gait.squash;
  return out;
}
