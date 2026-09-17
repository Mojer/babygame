import { GROUND } from './model';
/** Keep at least 640 world pixels visible so portrait play retains reaction time. */
export function worldLayout(width: number, height: number) {
  const zoom = Math.min(width / 640, height / 360);
  const worldWidth = width / zoom;
  const worldHeight = height / zoom;
  const top = GROUND - worldHeight * 0.7;
  return { zoom, worldWidth, worldHeight, top };
}
