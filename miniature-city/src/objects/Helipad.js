import * as THREE from 'three';
import {box,cylinder,material} from '../core/primitives.js';

export function createHelipad(building,height){
 const group=new THREE.Group();
 group.position.y=height+1.6;
 box(group,11.6,.5,11.6,0,0,0,0xeee2ca);
 box(group,11,.07,11,0,.285,0,0x526d66);
 const ring=new THREE.Mesh(new THREE.RingGeometry(4.15,4.4,64),material(0xffeed0));
 ring.rotation.x=-Math.PI/2;
 ring.position.y=.33;
 group.add(ring);
 for(const x of [-1.2,1.2])box(group,.55,.025,3.3,x,.34,0,0xffeed0);
 box(group,2.4,.025,.55,0,.34,0,0xffeed0);
 const lights=new THREE.MeshStandardMaterial({color:0xa4e5bc,emissive:0x6cdda0,emissiveIntensity:1.8});
 for(const x of [-5.2,5.2])for(const z of [-5.2,5.2])cylinder(group,.16,.2,.18,x,.37,z,lights,8);
 building.add(group);
 building.userData.description+=' 屋頂設有直升機停機坪，提供環城航班起降。';
 const landingPosition=building.position.clone().add(new THREE.Vector3(0,height+1.95,0));
 return{group,landingPosition};
}
