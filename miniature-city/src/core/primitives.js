import * as THREE from 'three';
const materials = new Map();
export function material(color) { if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .82 })); return materials.get(color); }
const boxGeometry = new THREE.BoxGeometry(1,1,1);
export function box(parent,w,h,d,x,y,z,color) { const m = new THREE.Mesh(boxGeometry, typeof color === 'object' ? color : material(color)); m.scale.set(w,h,d); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m; }
export function cylinder(parent,r1,r2,h,x,y,z,color,segments=24) { const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),typeof color==='object'?color:material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m; }
export function seededRandom(seed=2417){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
