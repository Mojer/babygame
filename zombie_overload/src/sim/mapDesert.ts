import { BORDER, CELL, GRID_H, GRID_W, MAP_H, MAP_W } from './content';
import type { MapLayout, Prop, PropKind } from './map';
import { Rng } from './rng';

/** Four broad processional routes connect the pyramid courts and oasis gardens. */
export function buildDesertMap(seed: number): MapLayout {
  const rng = new Rng(seed ^ 0x73616e64);
  const props: Prop[] = [];
  const blocked = new Uint8Array(GRID_W * GRID_H);
  const spawn = { x: 1024, y: 1216 };
  const roadsH: [number,number][] = [[560,672],[1040,1152],[1504,1616]];
  const roadsV: [number,number][] = [[432,560],[960,1088],[1488,1616]];
  const rect = (x:number,y:number,w:number,h:number) => {
    for(let gy=Math.max(0,Math.floor(y/CELL));gy<Math.min(GRID_H,Math.ceil((y+h)/CELL));gy++)
      for(let gx=Math.max(0,Math.floor(x/CELL));gx<Math.min(GRID_W,Math.ceil((x+w)/CELL));gx++) blocked[gy*GRID_W+gx]=1;
  };
  const add=(kind:PropKind,cx:number,cy:number,w:number,h:number,blocks=true)=>{
    const p:Prop={kind,x:cx-w/2,y:cy-h/2,w,h,blocks,variant:rng.int(3),vertical:false};
    props.push(p);if(blocks)rect(p.x,p.y,w,h);
  };
  rect(0,0,MAP_W,BORDER);rect(0,MAP_H-BORDER,MAP_W,BORDER);
  rect(0,0,BORDER,MAP_H);rect(MAP_W-BORDER,0,BORDER,MAP_H);
  for(const [x,y] of [[1024,736],[496,384],[1552,384]]) add('pyramid',x,y,248,112);
  const gate=(x:number,y:number)=>{
    add('desertGate',x,y,160,32,false);
    rect(x-80,y-16,32,32);rect(x+48,y-16,32,32);
  };
  gate(1024,1072);gate(496,768);gate(1552,768);
  for(const x of [864,1184]) for(const y of [944,1328,1664]) add('obelisk',x,y,24,24);
  for(const [x,y] of [[736,864],[1312,864],[352,1376],[1696,1376]]) add('sphinx',x,y,88,40);
  // Oasis courts and tomb gardens form readable clusters instead of a uniform scatter.
  for(const [cx,cy] of [[288,896],[720,432],[1328,432],[1760,896],
    [656,1216],[1392,1216],[480,1712],[1024,1744],[1568,1712]]) {
    add('palm',cx-44,cy-20,24,16);
    add('palm',cx+44,cy+24,24,16);
    add('sarcophagus',cx,cy+32,32,24);
    add('soulBrazier',cx+58,cy-24,16,16,false);
  }
  const onRoad=(x:number,y:number)=>roadsH.some(([a,b])=>y>a-32&&y<b+32)||roadsV.some(([a,b])=>x>a-40&&x<b+40);
  for(let y=224;y<MAP_H-192;y+=160) for(let x=224;x<MAP_W-192;x+=160) {
    const cx=x+rng.int(3)*16,cy=y+rng.int(3)*16;
    if(onRoad(cx,cy)||Math.hypot(cx-spawn.x,cy-spawn.y)<176)continue;
    if(props.some(p=>Math.abs(cx-p.x-p.w/2)<p.w/2+48&&Math.abs(cy-p.y-p.h/2)<p.h/2+56))continue;
    add(rng.next()<.5?'ruinColumn':'soulBrazier',cx,cy,24,16);
  }
  for(const x of [928,1120]) for(const y of [1136,1408,1568]) add('soulBrazier',x,y,16,16,false);
  // Boundary monuments sit inside the already blocked sandstone perimeter.
  for(let x=224;x<MAP_W-160;x+=176){add('ruinColumn',x,104,24,16,false);add('soulBrazier',x,MAP_H-96,16,16,false);}
  for(let y=288;y<MAP_H-160;y+=192){add('obelisk',104,y,24,16,false);add('ruinColumn',MAP_W-104,y,24,16,false);}
  return {stage:'desert',props,roadsH,roadsV,blocked,spawn,fountain:{x:1024,y:736,r:0,ry:0}};
}
