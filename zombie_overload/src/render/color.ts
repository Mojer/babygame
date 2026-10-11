/** Pixi Particle.color 是 ABGR（alpha 在最高位、紅色在最低位） */
export function abgr(rgb: number, alpha = 1): number {
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;
  return (((Math.round(alpha * 255) & 255) << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

export const WHITE = abgr(0xffffff);
