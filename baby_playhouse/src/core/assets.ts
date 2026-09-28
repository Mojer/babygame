import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

const draco = new DRACOLoader();

const loader = new GLTFLoader();
loader.setDRACOLoader(draco);

export function loadGLB(url: string): Promise<GLTF> {
  return loader.loadAsync(url);
}

/** 3-step ramp shared by every toon material. */
const gradient = (() => {
  const data = new Uint8Array([110, 190, 255]);
  const tex = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
})();

const toonCache = new Map<THREE.Material, THREE.MeshToonMaterial>();

/** Swap glTF PBR materials for cel-shaded ones (keeps palette map + emissive). */
export function toonify(root: THREE.Object3D, opts: { castShadow?: boolean; receiveShadow?: boolean } = {}) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = opts.castShadow ?? true;
    mesh.receiveShadow = opts.receiveShadow ?? true;
    const src = mesh.material as THREE.MeshStandardMaterial;
    let toon = toonCache.get(src);
    if (!toon) {
      if (src.map) src.map.anisotropy = 4;
      toon = new THREE.MeshToonMaterial({
        name: src.name,
        map: src.map,
        gradientMap: gradient,
        emissive: src.emissive,
        emissiveMap: src.emissiveMap,
        emissiveIntensity: src.emissiveIntensity,
      });
      toonCache.set(src, toon);
    }
    mesh.material = toon;
  });
}
