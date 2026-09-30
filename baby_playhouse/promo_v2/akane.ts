import * as THREE from 'three';

// Shared toon material helper for the promo's own props (the stage). 茜 herself now
// comes from the game's char_akane.glb, built from her character sheet.

/** 茜's signature pink (her polo shirt), used for the promo's accents. */
export const AKANE_PINK = '#F2789F';

const ramp = (() => {
  const data = new Uint8Array([110, 190, 255]);
  const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
})();

const mats = new Map<string, THREE.MeshToonMaterial>();
export function toon(hex: string) {
  let m = mats.get(hex);
  if (!m) mats.set(hex, (m = new THREE.MeshToonMaterial({ color: hex, gradientMap: ramp })));
  return m;
}
