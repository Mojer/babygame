import * as THREE from 'three';
import {box,cylinder,seededRandom} from '../core/primitives.js';
import {createBuilding} from '../objects/BuildingFactory.js';
import {createTrees} from '../objects/TreeFactory.js';
import {createFountain} from '../objects/Fountain.js';
import {createRail} from '../transport/RailGenerator.js';
import {createTrain} from '../transport/Train.js';
import {createTraffic} from '../transport/TrafficSystem.js';
import {createHelipad} from '../objects/Helipad.js';
import {createHelicopter} from '../transport/Helicopter.js';
export function createCity(){const group=new THREE.Group(),random=seededRandom();box(group,120,3,120,0,-1.5,0,0xcfc8b5);box(group,120,.35,120,0,.17,0,0xdde0ca);box(group,118,.12,118,0,.4,0,0xe6e1cf);
 for(const p of [-22,22]){box(group,7,.1,108,p,.52,0,0x8e9993);box(group,108,.1,7,0,.53,p,0x8e9993);for(let j=-51;j<54;j+=5){if(Math.abs(Math.abs(j)-22)<5)continue;box(group,.15,.02,2,p,.6,j,0xeae5cc);box(group,2,.02,.15,j,.61,p,0xeae5cc);}}
 for(const x of [-22,22])for(const z of [-22,22])for(const side of [-1,1])for(let k=-2;k<=2;k++){box(group,.55,.03,2.2,x+k*1.1,.62,z+side*5,0xf5efdc);}
 // Each plot stays clear of the inner roads and elevated perimeter.
 const plots=[[-36,-35,12,11,16],[-8,-35,11,10,18],[8,-35,11,10,26],[35,-35,13,12,21],[-35,-8,11,11,25],[-35,8,11,11,17],[35,-8,12,11,32],[35,8,12,11,20],[-35,35,12,12,14],[-8,35,11,11,17],[8,35,11,11,23],[35,35,13,12,15],[-11,-10,8,8,8],[11,-10,8,8,9],[-11,11,8,8,7],[11,11,8,8,8]];
 const buildings=plots.map(([x,z,width,depth,height],index)=>{const b=createBuilding({index,x,z,width,depth,height,type:index%5,helipad:index===6});group.add(b);return b;});
 const helipad=createHelipad(buildings[6],plots[6][4]);
 const helicopter=createHelicopter(helipad.landingPosition);group.add(helicopter.group);
 box(group,34,.15,34,0,.6,0,0xece5d3);box(group,3,.05,34,0,.7,0,0xf8efdf);box(group,34,.05,3,0,.71,0,0xf8efdf);
 for(const x of [-14,14])for(const z of [-2,2])box(group,4,.2,2,x,.82,z,0xb5c69b);
 const trees=[];for(let i=0;i<20;i++){const a=-54+(i+.5)*108/20;trees.push([a,-55],[a,55],[-55,a],[55,a]);}group.add(createTrees(trees,random));
 for(const x of [-16,16])for(const z of [-6,6]){box(group,3,.3,1,x,1.3,z,0xa67e55);box(group,3,.9,.2,x,1.9,z-.5,0xa67e55);for(const dx of [-1,1])box(group,.16,.9,.7,x+dx,.85,z,0x586854);}
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2,x=Math.cos(a)*8.7,z=Math.sin(a)*8.7;cylinder(group,.45,.6,.6,x,1,z,0xd3a47f,8);cylinder(group,.65,.7,.7,x,1.6,z,0x829b60,7);}
 const lampMaterial=new THREE.MeshStandardMaterial({color:0xfff0bd,emissive:0xffd48a,emissiveIntensity:0});
 for(const x of [-27,27])for(const z of [-45,-13,13,45]){cylinder(group,.12,.17,5,x,3,z,0x6b7b69,6);box(group,.9,.4,.9,x,5.6,z,lampMaterial);}
 const fountain=createFountain();group.add(fountain.group);const rail=createRail();group.add(rail.group);const train=createTrain(rail.curve);group.add(train.group);const traffic=createTraffic(random);group.add(traffic.group);return{group,buildings,fountain,train,traffic,helicopter,helipad,lampMaterial};}
