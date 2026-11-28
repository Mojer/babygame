// Build page data: placements (LDraw matrices) + compact real-part meshes.
const fs=require("fs"),L=require("./ldraw.js");
const C=require("./compile.js"); const {out,M}=C;
const NORENDER=new Set(["22168","14225"]);
const ids=[...new Set(out.filter(o=>o.R&&!o.virt&&!o.custom&&!NORENDER.has(o.id)).map(o=>o.id))];
const geo={};let tri=0,bytes=0;
for(const id of ids){
  const g=L.load(id+".dat"); const map=new Map(),pos=[],idx=[];
  for(const t of g.tris){for(const p of t){const q=p.map(v=>Math.round(v*4));const k=q.join(",");let i=map.get(k);if(i===undefined){i=pos.length/3;map.set(k,i);pos.push(...q)}idx.push(i)}}
  const P=Int16Array.from(pos), I=pos.length/3<65536?Uint16Array.from(idx):Uint32Array.from(idx);
  const bx=L.bbox(id+".dat");
  geo[id]={c:[0,1,2].map(i=>+((bx.mn[i]+bx.mx[i])/2).toFixed(2)),p:Buffer.from(P.buffer).toString("base64"),i:Buffer.from(I.buffer).toString("base64"),i32:I instanceof Uint32Array?1:0,s:g.studs.map(s=>s.map(v=>Math.round(v)))};
  tri+=idx.length/3; bytes+=P.byteLength+I.byteLength;
}
const parts=out.map(o=>({id:o.id,part:o.part,c:o.color,st:o.step,z:o.zone,R:o.R?o.R.map(v=>+v.toFixed(5)):null,P:o.P?o.P.map(v=>+v.toFixed(2)):null,d:o.dyn,v:o.virt?1:0,cu:o.custom?1:0,k:o.kind,
  x:o.kind==="strap"||o.kind==="band"?M.PARTS[o.i]:undefined}));
const data={parts,geo,track:M.TRACK,eng:M.ENG,steps:M.STEPS,names:M.NAMES,iddisp:M.IDDISP,colors:M.COLORS,schemes:M.SCHEMES,
  k:{GY:M.GY,DY_T:1.5,TCZ:M.TCZ,GPZ:12.5+(M.TCZ-4),CR_Y:M.CR_Y,SPR_R:M.SPR_R,len:M.DIMS.len,wid:23.4}};
fs.writeFileSync(__dirname+"/../src/fury/fury-data.json",JSON.stringify(data));
console.log("render ids",ids.length,"tris",tri,"raw KB",(bytes/1024).toFixed(0),"json KB",(fs.statSync(__dirname+"/../src/fury/fury-data.json").size/1024).toFixed(0));
