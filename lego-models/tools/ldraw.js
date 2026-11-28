// Minimal LDraw reader: resolves sub-files, returns triangles (studs split out), stud positions and bbox in LDU.
const fs=require("fs"),path=require("path");
const ROOT=path.join(__dirname,"ldraw-lib","ldraw");
const DIRS=["parts","p","parts/s","p/48"].map(d=>path.join(ROOT,d));
const cache=new Map();
function find(name){
  name=name.replace(/\\/g,"/").toLowerCase();
  for(const d of DIRS){const f=path.join(d,name);if(fs.existsSync(f))return f}
  for(const d of DIRS){const f=path.join(d,path.basename(name));if(fs.existsSync(f))return f}
  return null;
}
const STUD=/^(stud\d*a?\.dat|stud2a?\.dat|studp\d+\.dat|stud10\.dat|stud15\.dat|stud17a\.dat|stud18a\.dat|stud22a\.dat|stud3a?\.dat|stud4a?\.dat|stud4o\.dat|stud4h\.dat|stud4f\d+\.dat|stud6a?\.dat)$/;
const TOPSTUD=/^(stud|stud2|stud2a|stud10|stud15|stud17a|stud22a|studp\d+)\.dat$/;
function mul(a,b){ // 4x4 row-major as [a..p] using LDraw (x,y,z,a,b,c,d,e,f,g,h,i)
  const r=new Array(12);
  // a,b = {o:[x,y,z], m:[a,b,c,d,e,f,g,h,i]}
  return null;
}
function apply(T,p){return [T[0]+T[3]*p[0]+T[4]*p[1]+T[5]*p[2], T[1]+T[6]*p[0]+T[7]*p[1]+T[8]*p[2], T[2]+T[9]*p[0]+T[10]*p[1]+T[11]*p[2]]}
function compose(A,B){ // A*B, both [x,y,z,a,b,c,d,e,f,g,h,i]
  const o=apply(A,[B[0],B[1],B[2]]);
  const m=(r,c)=>A[3+r*3]*B[3+c]+A[3+r*3+1]*B[3+3+c]+A[3+r*3+2]*B[3+6+c];
  return [o[0],o[1],o[2],m(0,0),m(0,1),m(0,2),m(1,0),m(1,1),m(1,2),m(2,0),m(2,1),m(2,2)];
}
const ID=[0,0,0,1,0,0,0,1,0,0,0,1];
function load(name){
  const key=name.toLowerCase();
  if(cache.has(key))return cache.get(key);
  const f=find(name); const out={tris:[],studs:[],found:!!f,title:""};
  cache.set(key,out);
  if(!f)return out;
  const lines=fs.readFileSync(f,"utf8").split(/\r?\n/);
  out.title=(lines[0]||"").replace(/^0\s*/,"");
  for(const ln of lines){
    const t=ln.trim().split(/\s+/);
    if(t[0]==="1"){
      const T=t.slice(2,14).map(Number), sub=t.slice(14).join(" "), base=path.basename(sub.replace(/\\/g,"/")).toLowerCase();
      if(STUD.test(base)){ if(TOPSTUD.test(base))out.studs.push(apply(T,[0,0,0])); continue; }
      const s=load(sub);
      for(const tr of s.tris)out.tris.push(tr.map(p=>apply(T,p)));
      for(const p of s.studs)out.studs.push(apply(T,p));
    }else if(t[0]==="3"){const v=t.slice(2,11).map(Number);out.tris.push([v.slice(0,3),v.slice(3,6),v.slice(6,9)])}
    else if(t[0]==="4"){const v=t.slice(2,14).map(Number),a=v.slice(0,3),b=v.slice(3,6),c=v.slice(6,9),d=v.slice(9,12);out.tris.push([a,b,c],[a,c,d])}
  }
  return out;
}
function bbox(part){const g=load(part);const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  for(const tr of g.tris)for(const p of tr)for(let i=0;i<3;i++){mn[i]=Math.min(mn[i],p[i]);mx[i]=Math.max(mx[i],p[i])}
  return {mn,mx};}
module.exports={load,bbox,apply,compose,ID,find};
