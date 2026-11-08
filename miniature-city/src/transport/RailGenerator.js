import * as THREE from 'three';
import {box,cylinder,material} from '../core/primitives.js';
export function createRail(){const group=new THREE.Group();const points=[[-46,-45],[0,-49],[46,-45],[50,0],[46,45],[0,49],[-46,45],[-50,0]].map(([x,z])=>new THREE.Vector3(x,9,z));const curve=new THREE.CatmullRomCurve3(points,true,'catmullrom',.3);
 const sample=curve.getSpacedPoints(400);for(let side of [-1,1]){const p=sample.map((v,i)=>{const t=curve.getTangentAt(i/400);return v.clone().add(new THREE.Vector3(t.z,0,-t.x).multiplyScalar(side*1.05));});const rail=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p,false),400,.15,6,false),material(0x777c70));group.add(rail);}
 for(let i=0;i<180;i++){const t=i/180,p=curve.getPointAt(t),dir=curve.getTangentAt(t);const sleeper=box(group,3.4,.25,.55,p.x,8.7,p.z,0xe1d4b8);sleeper.rotation.y=Math.atan2(dir.x,dir.z);}
 const deck=new THREE.Mesh(new THREE.TubeGeometry(curve,400,1.8,4,true),material(0xe8ddc5));deck.scale.y=.09;deck.position.y=7.65;deck.receiveShadow=true;deck.castShadow=true;group.add(deck);
 for(let i=0;i<24;i++){const p=curve.getPointAt(i/24);cylinder(group,.6,.85,7.8,p.x,4,p.z,0xd3c8b1,8);box(group,2.8,.5,2.8,p.x,7.9,p.z,0xe9dfcb);}
 box(group,17,.65,5,0,8,48,0xd6cbb6);box(group,18,.35,5.5,0,12.3,48,0x6f8a7d);for(const x of [-7,7])box(group,.3,4,.3,x,10.2,49.5,0xc2b8a1);for(let i=0;i<12;i++)box(group,3,.65,1.1,11, .5+i*.64,36+i,0xd4cbb8);
 return{group,curve};}
