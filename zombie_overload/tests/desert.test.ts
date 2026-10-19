import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { World } from '../src/sim/world';
import { buildMap } from '../src/sim/map';
import { stageId, STAGE_IDS } from '../src/sim/stages';
import { BORDER,CELL,GRID_W,GRID_H,MAP_W,MAP_H,FINAL,MUTANT,T_EXPLOSION } from '../src/sim/content';
import { FLOW_INF } from '../src/sim/flowfield';
import { cellOf } from '../src/sim/grid';
import { desertPose } from '../src/render/desertMotion';
const idle={mx:0,my:0,dash:false,ult:false};
for(const seed of [1,42,77]) test(`沙漠冥域 ${seed}：出生淨空、全場可達、封閉邊界與完整遺跡`,()=>{
 const w=new World({stage:'desert',seed,noSpawn:true,noSkills:true});
 assert.equal(w.stage.number,'04');assert.equal(stageId('desert'),'desert');assert.equal(STAGE_IDS.length,4);
 assert.deepEqual(w.map,buildMap(seed,'desert'));
 for(let dy=-48;dy<=48;dy+=CELL)for(let dx=-48;dx<=48;dx+=CELL)assert.equal(w.map.blocked[cellOf(w.player.x+dx,w.player.y+dy)],0);
 let open=0;
 for(let gy=0;gy<GRID_H;gy++)for(let gx=0;gx<GRID_W;gx++){
  const c=gy*GRID_W+gx;
  if(gx*CELL<BORDER||gy*CELL<BORDER||gx*CELL>=MAP_W-BORDER||gy*CELL>=MAP_H-BORDER)assert.equal(w.map.blocked[c],1);
  if(!w.map.blocked[c]){open++;assert.ok(w.flow.dist[c]<FLOW_INF,`Unreachable ${gx},${gy}`);}
 }
 assert.ok(open>GRID_W*GRID_H*.65);
 for(const kind of ['pyramid','desertGate','obelisk','palm','sphinx','ruinColumn','sarcophagus','soulBrazier'])assert.ok(w.map.props.some(p=>p.kind===kind));
 assert.ok(w.map.props.length>=100);
 for(let i=0;i<180;i++)w.step({...idle,my:-1});
 assert.ok(w.player.y<1040,'可穿過主神殿門');
});
test('沙漠冥域：沙海巨獸最終波可完成結算',()=>{
 const w=new World({stage:'desert',seed:42,startTime:599.5,noSpawn:true,noSkills:true,god:true,autoLevel:true});
 for(let i=0;i<60;i++)w.step(idle);assert.equal(w.finale,'final');assert.ok(w.finalLeft>=FINAL.mutants*.8);
 for(let k=w.zombies.count-1;k>=0;k--){const s=w.zombies.active[k];if(w.zombies.kind[s]===MUTANT)w.damage(s,1e9,T_EXPLOSION,0,-1);}
 for(let i=0;i<Math.ceil(FINAL.finishDelay*60)+10;i++)w.step(idle);assert.equal(w.over,'win');assert.equal(w.stage.boss,'沙海巨獸');
});
test('沙漠動作：五怪各有八格、可見步幅、個體錯拍、暫停保持姿勢',()=>{
 for(let k=0;k<5;k++){
  const frames=new Set<number>();let min=Infinity,max=-Infinity;
  for(let i=0;i<120;i++){const p=desertPose(k,i/60,0,{frame:0,lift:0,lean:0,scaleX:1,scaleY:1});frames.add(p.frame);min=Math.min(min,p.lift);max=Math.max(max,p.lift);assert.ok(p.scaleX>0&&p.scaleY>0);}
  assert.equal(frames.size,8);assert.ok(max-min>1);
  const pose=()=>({frame:0,lift:0,lean:0,scaleX:1,scaleY:1});
  assert.deepEqual(desertPose(k,1,3,pose()),desertPose(k,1,3,pose()));
  assert.notDeepEqual(desertPose(k,1,3,pose()),desertPose(k,1,4,pose()));
 }
});
test('沙漠圖集：保留舊關卡、完整動作與物件、實體像素不越界',()=>{
 const base=new URL('../public/sprites/',import.meta.url);
 const old=JSON.parse(readFileSync(new URL('horde_detail.json',base),'utf8'));
 const sheet=JSON.parse(readFileSync(new URL('horde_world.json',base),'utf8'));
 for(const [key,frame]of Object.entries(old.frames))assert.deepEqual(sheet.frames[key],frame,`舊圖集 ${key}`);
 const png=readFileSync(new URL(sheet.image,base));const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
 const check=(key:string)=>{const f=sheet.frames[key];assert.ok(f,key);assert.ok((f.x+f.w)*2<=width&&(f.y+f.h)*2<=height,key);return`${f.x},${f.y}`;};
 for(let k=0;k<5;k++){assert.equal(new Set(Array.from({length:8},(_,i)=>check(`e${k}_${i}`))).size,8);for(const state of ['white','ice','corpse'])check(`e${k}_${state}`);}
 for(const p of buildMap(42,'desert').props)check('prop_'+p.kind);
});
