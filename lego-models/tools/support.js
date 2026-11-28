const C=require("./compile.js");const {out,bb}=C;
function aabb(o){const b=bb(o.id),pts=[];for(const x of [b.mn[0],b.mx[0]])for(const y of [b.mn[1],b.mx[1]])for(const z of [b.mn[2],b.mx[2]]){const R=o.R;pts.push([R[0]*x+R[1]*y+R[2]*z+o.P[0],R[3]*x+R[4]*y+R[5]*z+o.P[1],R[6]*x+R[7]*y+R[8]*z+o.P[2]])}
  const mn=[0,1,2].map(i=>Math.min(...pts.map(p=>p[i]))),mx=[0,1,2].map(i=>Math.max(...pts.map(p=>p[i])));return {mn,mx}}
const STUDK=new Set(["box","slope","round","headlight","eye"]);
const all=out.filter(o=>o.R&&!o.virt&&!o.custom).map(o=>({o,b:aabb(o)}));
const studp=all.filter(e=>STUDK.has(e.o.kind));
const ov=(a,b)=>Math.max(0,Math.min(a.mx[0],b.mx[0])-Math.max(a.mn[0],b.mn[0]))*Math.max(0,Math.min(a.mx[2],b.mx[2])-Math.max(a.mn[2],b.mn[2]));
const floating=[];
for(const e of studp){
  const bot=e.b.mx[1], top=e.b.mn[1]; let ok=false;   // LDraw: +Y is down
  for(const f of all){if(f===e)continue;
    if(Math.abs(f.b.mn[1]-bot)<2&&ov(e.b,f.b)>50){ok=true;break}
    if(Math.abs(f.b.mx[1]-top)<2&&ov(e.b,f.b)>50){ok=true;break}
  }
  if(!ok)floating.push(e.o);
}
const by={};floating.forEach(o=>{const k=o.id+" 步驟"+o.step;by[k]=(by[k]||0)+1});
console.log("stud parts",studp.length,"floating",floating.length);console.log(Object.entries(by).map(([k,v])=>v+"× "+k).join("\n"));
module.exports={floating};
