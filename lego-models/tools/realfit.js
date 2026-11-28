// Re-place a page model's parts with real LDraw geometry: fit each part's real bbox to its intended cell box.
const fs=require("fs"),vm=require("vm"),L=require("./ldraw.js");
const MOVED={"3040":"3040b","3068":"3068b","3069":"3069b","3070":"3070b","3665":"3665a","4032":"4032a","4073":"6141","4185":"4185a","3957":"3957a"};
const page=process.argv[2], outFile=process.argv[3], model=process.argv[4];
const html=fs.readFileSync(page,"utf8");
const src=html.match(/<script id="model">([\s\S]*?)<\/script>/)[1];
const ctx={};vm.createContext(ctx);vm.runInContext(src+";this.PARTS=PARTS;this.STEPS=STEPS;this.COLORS=COLORS;this.toLDraw=toLDraw;",ctx);
const {PARTS,STEPS,COLORS}=ctx;
const lines=ctx.toLDraw().split("\n").filter(l=>l.startsWith("1 "));
const order=[];for(let s=1;s<=STEPS.length;s++)PARTS.forEach(p=>{if(p.step===s)order.push(p)});
if(order.length!==lines.length)throw new Error("line/part mismatch "+order.length+" "+lines.length);

const mv=(R,v)=>[R[0]*v[0]+R[1]*v[1]+R[2]*v[2],R[3]*v[0]+R[4]*v[1]+R[5]*v[2],R[6]*v[0]+R[7]*v[1]+R[8]*v[2]];
const mm=(A,B)=>{const o=[];for(let r=0;r<3;r++)for(let c=0;c<3;c++)o.push(A[r*3]*B[c]+A[r*3+1]*B[3+c]+A[r*3+2]*B[6+c]);return o};
const RY90=[0,0,1,0,1,0,-1,0,0], RY180=[-1,0,0,0,1,0,0,0,-1];
function rbox(id,R){const b=L.bbox(id+".dat"),mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  for(const x of [b.mn[0],b.mx[0]])for(const y of [b.mn[1],b.mx[1]])for(const z of [b.mn[2],b.mx[2]]){const q=mv(R,[x,y,z]);for(let i=0;i<3;i++){mn[i]=Math.min(mn[i],q[i]);mx[i]=Math.max(mx[i],q[i])}}
  return {mn,mx,d:[0,1,2].map(i=>mx[i]-mn[i]),c:[0,1,2].map(i=>(b.mn[i]+b.mx[i])/2)};}
// Mean horizontal position of the top (min LDraw Y) or bottom vertices, relative to the rotated bbox centre.
function faceBias(id,R,top){const g=L.load(id+".dat");let ext=top?1e9:-1e9;const pts=[];
  for(const t of g.tris)for(const p of t){const q=mv(R,p);pts.push(q);ext=top?Math.min(ext,q[1]):Math.max(ext,q[1])}
  const sel=pts.filter(q=>Math.abs(q[1]-ext)<.5);const b=rbox(id,R);const cx=(b.mn[0]+b.mx[0])/2,cz=(b.mn[2]+b.mx[2])/2;
  return [sel.reduce((a,q)=>a+q[0],0)/sel.length-cx,sel.reduce((a,q)=>a+q[2],0)/sel.length-cz];}
const DIR={"+z":[0,-1],"-z":[0,1],"+x":[1,0],"-x":[-1,0]}; // our dir -> LDraw (X,Z) unit
const FIT=new Set(["box","plate","brick","technic","slope","round","turntable","headlight","grille","fence"]);
const report={fit:0,rot90:0,flip:0,moved:0,dimBad:[],cyl:0};
const out=order.map((p,k)=>{
  const t=lines[k].trim().split(/\s+/);let id=t[14].replace(/\.dat$/i,"");id=MOVED[id]||id;
  if(!L.find(id+".dat"))throw new Error("missing part "+id);
  let R=t.slice(5,14).map(Number), P=t.slice(2,5).map(Number);
  const kind=p.kind||"box";
  if(p.x0!==undefined&&FIT.has(kind)){
    const want=[(p.x1-p.x0)*20,p.h*8,(p.z1-p.z0)*20];
    let b=rbox(id,R);
    const err=(d)=>Math.abs(d[0]-want[0])+Math.abs(d[2]-want[2]);
    if(err(b.d)>12){const R2=mm(R,RY90),b2=rbox(id,R2);if(err(b2.d)<err(b.d)-8){R=R2;b=b2;report.rot90++}}
    if(err(b.d)>12||Math.abs(b.d[1]-want[1])>10)report.dimBad.push(`${p.part} ${kind} want ${want} got ${b.d.map(v=>v.toFixed(0))}`);
    if(kind==="slope"&&p.dir){
      const inv=p.prof==="i45", f=faceBias(id,R,!inv), u=DIR[p.dir];
      if(f[0]*u[0]+f[1]*u[1]>1){R=mm(R,RY180);report.flip++}
    }
    const Ct=[(p.x0+p.x1)/2*20,-(p.y0+p.h/2)*8,-(p.z0+p.z1)/2*20], rc=mv(R,rbox(id,R).c);
    const P2=[Ct[0]-rc[0],Ct[1]-rc[1],Ct[2]-rc[2]];
    if(Math.hypot(P2[0]-P[0],P2[1]-P[1],P2[2]-P[2])>2)report.moved++;
    P=P2;report.fit++;
  }else if(kind==="cyl"){
    const C=p.axis==="y"?[p.cx*20,-(p.cy+p.len/2)*8,-p.cz*20]:[p.cx*20,-p.cy*8,-p.cz*20];
    const rc=mv(R,rbox(id,R).c),P2=[C[0]-rc[0],C[1]-rc[1],C[2]-rc[2]];
    if(Math.hypot(P2[0]-P[0],P2[1]-P[1],P2[2]-P[2])>2)report.moved++;
    P=P2;report.cyl++;
  }
  return {id,c:p.color,st:p.step,k:kind,R:R.map(v=>+v.toFixed(5)),P:P.map(v=>+v.toFixed(2)),arm:p.arm||undefined};
});
const ids=[...new Set(out.map(o=>o.id))],geo={};
for(const id of ids){
  const g=L.load(id+".dat"),map=new Map(),pos=[],idx=[];
  for(const t of g.tris)for(const p of t){const q=p.map(v=>Math.round(v*4)),key=q.join(",");let i=map.get(key);if(i===undefined){i=pos.length/3;map.set(key,i);pos.push(...q)}idx.push(i)}
  const Pa=Int16Array.from(pos),I=pos.length/3<65536?Uint16Array.from(idx):Uint32Array.from(idx);
  geo[id]={p:Buffer.from(Pa.buffer).toString("base64"),i:Buffer.from(I.buffer).toString("base64"),i32:I instanceof Uint32Array?1:0,s:g.studs.map(s=>s.map(v=>Math.round(v)))};
}
fs.writeFileSync(outFile,JSON.stringify({model,parts:out,geo}));
console.log(model,"parts",out.length,"ids",ids.length,JSON.stringify({...report,dimBad:report.dimBad.length}),"KB",(fs.statSync(outFile).size/1024).toFixed(0));
report.dimBad.slice(0,25).forEach(s=>console.log("  dim",s));
