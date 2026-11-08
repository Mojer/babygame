import * as THREE from 'three';
import {box,cylinder,material} from '../core/primitives.js';
export const windowMaterial=new THREE.MeshStandardMaterial({color:0x638b90,roughness:.35,metalness:.15,emissive:0xffc976,emissiveIntensity:0});
const names=['日光公寓','青葉書店','小日子辦公室','山丘旅館','城市展覽館','午後咖啡館','森之住宅','白樺工作室','微風商辦','橙花公寓','晴空中心','南街商店','光影美術館','綠洲住宅','時光旅舍','小城圖書館'];
export function createBuilding({index,x,z,width=11,depth=10,height=18,type=0,helipad=false}){
 const g=new THREE.Group();g.position.set(x,.65,z);g.userData={building:true,name:names[index],description:`${['溫暖住宅','街角商店','現代商辦','露台旅館','公共文化空間'][type]} · ${Math.max(2,Math.round(height/3))} 層樓\n每一道窗景，都收藏著城市的日常。`};
 const colors=[0xf0dfbf,0xd89a7c,0xdce5db,0xe8d4be,0xf3ead7];const c=colors[type];
 box(g,width+.9,.65,depth+.9,0,.3,0,0xece6d8);box(g,width,height,depth,0,height/2+.6,0,c);
 box(g,width+.6,.6,depth+.6,0,height+.7,0,0xf5eddd);box(g,width-1,.18,depth-1,0,height+1.05,0,0xa4a798);
 for(const side of [-1,1]){box(g,width,.65,.4,0,3,side*depth/2,0xf6eddb);box(g,.4,.65,depth,side*width/2,3,0,0xf6eddb);}
 const transforms=[];const dummy=new THREE.Object3D();
 for(let y=4.7;y<height-1;y+=3.3){for(let a=-width/2+1.6;a<width/2-1;a+=2.6)for(const side of [-1,1]){dummy.position.set(a,y,side*(depth/2+.04));dummy.scale.set(1.2,1.8,.1);dummy.rotation.set(0,0,0);dummy.updateMatrix();transforms.push(dummy.matrix.clone());}
 for(let a=-depth/2+1.7;a<depth/2-1;a+=2.6)for(const side of [-1,1]){dummy.position.set(side*(width/2+.04),y,a);dummy.scale.set(.1,1.8,1.2);dummy.updateMatrix();transforms.push(dummy.matrix.clone());}}
 const windows=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),windowMaterial,transforms.length);transforms.forEach((m,i)=>windows.setMatrixAt(i,m));g.add(windows);
 box(g,2.2,2.6,.16,0,1.8,depth/2+.1,windowMaterial);
 if(type===1){for(let i=0;i<6;i++)box(g,width/6,.25,2.4,-width/2+(i+.5)*width/6,3.2,depth/2+.8,i%2?0xfff5df:0xc97252);box(g,width*.7,1.1,.3,0,4,depth/2+.2,0x476c5a);}
 if(type===0||type===3)for(let y=7;y<height;y+=6.6){box(g,width+.8,.25,1.7,0,y,depth/2+.6,0xf5e9cf);box(g,width+.8,.65,.12,0,y+.4,depth/2+1.4,0xc3b497);}
 if(type===2){box(g,width*.55,4,depth*.65,-1,height+2,0,0xc5d4cb);box(g,.16,5,.16,-1,height+6,0,0x6f8079);}
 if(type===4){for(let i=-1;i<=1;i++)cylinder(g,.4,.4,4,i*3,2.6,depth/2+.5,0xfdf5e4,12);}
 if(!helipad){box(g,2,1.2,2,-2,height+1.6,-1,0xb9bcad);box(g,2.4,.2,2.4,-2,height+2.3,-1,0xe7e5d9);}
 if(type===3)cylinder(g,1.5,1.5,2,2,height+2.1,-2,0x809b8e);
 return g;
}
