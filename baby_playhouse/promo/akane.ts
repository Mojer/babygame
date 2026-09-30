import * as THREE from 'three';

// 茜 (Akane): the chibi girl who leads this promo. Built from primitives the same
// way the Blender scripts build the cast (2-head, ~0.7 m, palette colours), but
// directly in three.js coordinates: Y up, facing +Z, feet at y = 0. Part names
// follow the game's convention so the puppet can find *_leg_L/R, *_arm_L/R, *_eye_*.

export const AKANE_RED = '#E0475B';

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

type V3 = [number, number, number];
const D = Math.PI / 180;

function mesh(name: string, geo: THREE.BufferGeometry, color: string, at: V3, scale: V3 = [1, 1, 1], rot: V3 = [0, 0, 0]) {
  const m = new THREE.Mesh(geo, toon(color));
  m.name = name;
  m.position.set(...at);
  m.scale.set(...scale);
  m.rotation.set(rot[0] * D, rot[1] * D, rot[2] * D);
  m.castShadow = true;
  return m;
}
const ball = (name: string, r: number, at: V3, color: string, scale?: V3, rot?: V3) =>
  mesh(name, new THREE.SphereGeometry(r, 28, 20), color, at, scale, rot);
const cyl = (name: string, rTop: number, rBot: number, h: number, at: V3, color: string, rot?: V3) =>
  mesh(name, new THREE.CylinderGeometry(rTop, rBot, h, 28), color, at, undefined, rot);

export function buildAkane(): THREE.Group {
  const root = new THREE.Group();
  root.name = 'CHAR_akane';
  const add = (...o: THREE.Object3D[]) => (root.add(...o), o[0]);
  const skin = '#FBD3B8';
  const hair = '#5A3B2E';

  for (const s of [-1, 1]) {
    const side = s < 0 ? 'L' : 'R';
    // Leg groups carry sock + shoe so the walk swing moves both.
    const leg = new THREE.Group();
    leg.name = `akane_leg_${side}`;
    leg.position.set(s * 0.068, 0, 0);
    leg.add(ball(`akane_sock_${side}`, 0.045, [0, 0.085, 0], '#FFFDF7'));
    leg.add(ball(`akane_shoe_${side}`, 0.058, [0, 0.045, 0.012], AKANE_RED, [1, 0.8, 1.15]));
    add(leg);
    add(ball(`akane_arm_${side}`, 0.048, [s * 0.155, 0.23, 0.01], skin, [0.8, 1.25, 0.8], [0, 0, -s * 25]));
  }

  // A-line dress with a round top, white collar and a yellow bow.
  add(cyl('akane_dress', 0.095, 0.175, 0.2, [0, 0.16, 0], AKANE_RED));
  add(ball('akane_body', 0.125, [0, 0.25, 0], AKANE_RED, [1, 0.95, 0.92]));
  add(cyl('akane_hem', 0.178, 0.178, 0.025, [0, 0.07, 0], '#FFFDF7'));
  for (const s of [-1, 1]) add(ball(`akane_collar_${s}`, 0.045, [s * 0.045, 0.335, 0.085], '#FFFDF7', [1.1, 0.55, 0.7], [0, 0, s * 20]));
  for (const s of [-1, 1]) add(ball(`akane_bow_${s}`, 0.022, [s * 0.026, 0.31, 0.118], '#FFE08A', [1.3, 0.9, 0.6]));
  add(ball('akane_bow_knot', 0.012, [0, 0.31, 0.124], '#F5A45D'));

  // Head, hair cap, bangs and two buns tied with red ribbons.
  add(ball('akane_head', 0.19, [0, 0.47, 0], skin, [1.1, 0.95, 1]));
  add(ball('akane_hair', 0.205, [0, 0.5, -0.05], hair, [1.13, 0.98, 1.02]));
  add(ball('akane_bangs', 0.16, [0, 0.575, 0.066], hair, [1.18, 0.5, 0.8]));
  for (const s of [-1, 1]) {
    add(ball(`akane_bun_${s}`, 0.072, [s * 0.19, 0.63, -0.03], hair));
    add(ball(`akane_ribbon_${s}`, 0.032, [s * 0.14, 0.6, 0.0], AKANE_RED, [1.4, 0.8, 0.7], [0, 0, s * 35]));
  }

  // Face.
  for (const s of [-1, 1]) {
    add(ball(`akane_eye_${s}`, 0.027, [s * 0.075, 0.46, 0.172], '#2E2B33', [1, 1.3, 0.5]));
    add(ball(`akane_eye_hi_${s}`, 0.009, [s * 0.068, 0.475, 0.188], '#FFFFFF'));
    add(ball(`akane_blush_${s}`, 0.035, [s * 0.12, 0.42, 0.148], '#FFB7B2', [1, 0.7, 0.4]));
  }
  add(ball('akane_mouth', 0.016, [0, 0.408, 0.176], '#C0485A', [1.4, 0.8, 0.5]));

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).receiveShadow = false;
  });
  return root;
}
