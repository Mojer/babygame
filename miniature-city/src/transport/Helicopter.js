import * as THREE from 'three';
import {box,cylinder,material} from '../core/primitives.js';

const smooth=t=>t*t*(3-2*t);
const phases=[['orbit',32],['approach',5],['landing',8],['parked',8],['takeoff',8],['departure',5]];
export const flightDuration=phases.reduce((sum,[,duration])=>sum+duration,0);

export function createHelicopter(landingPosition){
 const group=new THREE.Group(),body=new THREE.Group();
 group.add(body);
 const shell=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),material(0xd9734e));
 shell.scale.set(1.35,1.15,2.1);shell.position.set(0,1.7,.3);shell.castShadow=true;body.add(shell);
 const glass=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),material(0x315b65));
 glass.scale.set(1.22,.87,1.15);glass.position.set(0,1.9,1.25);glass.castShadow=true;body.add(glass);
 box(body,2.2,.23,2.5,0,.95,.15,0xffecd0);
 box(body,.48,.45,4.1,0,1.7,-3,0xd9734e);
 box(body,.18,1.75,1.1,0,2.4,-4.8,0xf2e4c9);
 box(body,2.3,.14,.8,0,1.75,-3.8,0xf2e4c9);
 for(const x of [-1.25,1.25]){
  box(body,.16,.18,4.1,x,.09,0,0x435a55);
  for(const z of [-.9,.9])box(body,.12,.75,.12,x,.53,z,0x586b60);
 }
 cylinder(body,.17,.2,.8,0,3.05,0,0x4b5f55,8);
 const rotor=new THREE.Group();rotor.position.set(0,3.5,0);body.add(rotor);
 for(const angle of [0,Math.PI/2]){const blade=box(rotor,10,.09,.35,0,0,0,0x435a55);blade.rotation.y=angle;}
 cylinder(rotor,.32,.4,.22,0,.12,0,0xe7d8bc,10);
 const tailRotor=new THREE.Group();tailRotor.position.set(.36,2.3,-4.9);body.add(tailRotor);
 box(tailRotor,.1,1.9,.16,0,0,0,0x435a55);box(tailRotor,.1,.16,1.9,0,0,0,0x435a55);
 const beacon=cylinder(body,.15,.18,.22,0,2.92,1.1,new THREE.MeshStandardMaterial({color:0xff5642,emissive:0xff3018,emissiveIntensity:2}),8);
 const cruiseY=Math.max(52,landingPosition.y+17);
 const orbitRadius=35,orbitCenter=new THREE.Vector3(landingPosition.x-orbitRadius,0,landingPosition.z);
 const abovePad=landingPosition.clone();abovePad.y=cruiseY;
 const approach=abovePad.clone().add(new THREE.Vector3(0,0,8));
 const tangent=new THREE.Vector3(),forward=new THREE.Vector3(0,0,1),up=new THREE.Vector3(0,1,0);
 let elapsed=0,rotorAngle=0,phase='orbit';
 function update(dt){
  elapsed=(elapsed+dt)%flightDuration;
  let local=elapsed,duration;
  for(const [name,seconds] of phases){if(local<seconds){phase=name;duration=seconds;break;}local-=seconds;}
  const t=local/duration,u=smooth(t);
  body.rotation.set(0,0,0);
  if(phase==='orbit'){
   const angle=t*Math.PI*2;
   group.position.set(orbitCenter.x+Math.cos(angle)*orbitRadius,cruiseY+Math.sin(angle*2)*.6,orbitCenter.z+Math.sin(angle)*orbitRadius);
   tangent.set(-Math.sin(angle),0,Math.cos(angle));
   group.quaternion.setFromUnitVectors(forward,tangent);
   body.rotation.z=.055;
  }else if(phase==='approach'){
   group.position.copy(abovePad).lerp(approach,u);
   group.quaternion.setFromAxisAngle(up,0);
  }else if(phase==='landing'){
   group.position.copy(approach).lerp(landingPosition,u);
   group.quaternion.setFromAxisAngle(up,0);
  }else if(phase==='parked'){
   group.position.copy(landingPosition);
   group.quaternion.setFromAxisAngle(up,0);
  }else if(phase==='takeoff'){
   group.position.copy(landingPosition).lerp(approach,u);
   group.quaternion.setFromAxisAngle(up,0);
  }else{
   group.position.copy(approach).lerp(abovePad,u);
   group.quaternion.setFromAxisAngle(up,0);
  }
  const rotorSpeed=phase==='parked'?Math.max(0,1-local/2):phase==='takeoff'?Math.min(1,local/1.5):1;
  rotorAngle=(rotorAngle+dt*38*rotorSpeed)%(Math.PI*2);
  rotor.rotation.y=rotorAngle;tailRotor.rotation.x=-rotorAngle*1.8;
  beacon.material.emissiveIntensity=phase==='parked'?.4:1.5+Math.sin(elapsed*8)*.5;
 }
 update(0);
 return{group,update,get phase(){return phase;}};
}
