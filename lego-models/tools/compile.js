// Compile the design into true LDraw placements using real part geometry, then check collisions and export meshes.
const fs=require("fs"),L=require("./ldraw.js");
const model=fs.readFileSync(__dirname+"/../src/fury/fury2-model.js","utf8");
const M=new Function(model+";return {PARTS,STEPS,DIMS,TRACK,ENG,NAMES,IDDISP,COLORS,SCHEMES,TCZ,GY,CR_Y,DS_Y,SPR_R,TIRE_R,PITCH,WHEEL_Y,AXLE_Y,SPROCKET_Z,IDLER_Z}")();
const LDMAP={"2853":"2853a","3023":"3023b","3040":"3040b","3068":"3068b","3069":"3069b","3070":"3070b","32064":"32064a","3648":"3648b",
 "3665":"3665a","4032":"4032a","4073":"6141","63965":"63965a","6538c":"59443","62821b":"62821","731c05":"73129","88012":"22127",
 "88013":"22169","88014":"22172","88005":"22168","STRING":"14225"};
const AXL={};
"3705 3706 3707 3708 3737 4519 32073 50451 6558 14225".split(" ").forEach(k=>AXL[k]="X");
"3941 3062b 6141 4032a 98138 87081 60474 14769 4589 4740 63965a 87994 2569 73129 2850b 2851 2852 18938 18939".split(" ").forEach(k=>AXL[k]="Y");
"56145 55978 57519 62821 32269 32270 3648b 4185 4716 59443 2853a 22169 22172".split(" ").forEach(k=>AXL[k]="Z");
const I=[1,0,0,0,1,0,0,0,1], RY90=[0,0,1,0,1,0,-1,0,0], RX90=[1,0,0,0,0,-1,0,1,0], RZ90=[0,-1,0,1,0,0,0,0,1];
const AXROT={X:{x:I,y:RZ90,z:RY90},Y:{y:I,x:RZ90,z:RX90},Z:{z:I,x:RY90,y:RX90}};
const mv=(R,v)=>[R[0]*v[0]+R[1]*v[1]+R[2]*v[2],R[3]*v[0]+R[4]*v[1]+R[5]*v[2],R[6]*v[0]+R[7]*v[1]+R[8]*v[2]];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const l=Math.hypot(...a);return a.map(v=>v/l)};
const P2L=(x,y,z)=>[x*20,-y*8,-z*20];          // point: studs, plates, studs -> LDU
const D2L=d=>norm([d[0],-d[1],-d[2]]);          // direction in stud space -> LDraw
function frame(cols){ // cols: {X,Y,Z} images of local axes (two given)
  let {X,Y,Z}=cols;
  if(!X)X=cross(Y,Z); if(!Y)Y=cross(Z,X); if(!Z)Z=cross(X,Y);
  return [X[0],Y[0],Z[0],X[1],Y[1],Z[1],X[2],Y[2],Z[2]];
}
function alignAxis(local,dirLD){ // minimal rotation mapping local unit axis to dirLD
  const a=local==="X"?[1,0,0]:local==="Y"?[0,1,0]:[0,0,1], b=norm(dirLD), v=cross(a,b), c=a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  if(c<-0.9999){return local==="Y"?[1,0,0,0,-1,0,0,0,-1]:[-1,0,0,0,1,0,0,0,-1]}
  const k=1/(1+c), [x,y,z]=v;
  return [x*x*k+c, x*y*k-z, x*z*k+y, y*x*k+z, y*y*k+c, y*z*k-x, z*x*k-y, z*y*k+x, z*z*k+c];
}
const parseM=s=>s.split(" ").map(Number);
const BB={}; function bb(id){if(!BB[id])BB[id]=L.bbox(id+".dat");return BB[id]}
function fit(id,R,Ct){const b=bb(id),c=[(b.mn[0]+b.mx[0])/2,(b.mn[1]+b.mx[1])/2,(b.mn[2]+b.mx[2])/2],rc=mv(R,c);return [Ct[0]-rc[0],Ct[1]-rc[1],Ct[2]-rc[2]]}

function linkAt(d,x){
  const seg=M.TRACK.seg,L=M.TRACK.per; d=((d%L)+L)%L; let s=0; while(s<seg.length-1&&seg[s][3]+seg[s][2]<d)s++;
  const g=seg[s],f=(d-g[3])/g[2],z=g[0][0]+(g[1][0]-g[0][0])*f,y=g[0][1]+(g[1][1]-g[0][1])*f;
  const tz=(g[1][0]-g[0][0])/g[2],ty=(g[1][1]-g[0][1])/g[2], tL=norm([0,-ty,-tz]);
  return {R:frame({X:[-1,0,0],Z:tL.map(v=>-v)}),P:[x*20,-y*20,-z*20]};
}
const DY_T=1.5;   // turret rides on the 60T turntable recessed into the roof
const out=[], issues=[];
const linkParts=M.PARTS.filter(p=>p.kind==="mlink");
M.PARTS.forEach((p,idx)=>{
  const id=LDMAP[p.part]||p.part; let R=null,P=null,dyn=null,approx=false;
  const q=JSON.parse(JSON.stringify(p));
  if((q.zone==="tur"||q.zone==="gun")&&q.kind!=="tttop"){["y0","cy"].forEach(k=>{if(typeof q[k]==="number")q[k]+=DY_T});["c","a","b"].forEach(k=>{if(q[k])q[k][1]+=DY_T})}
  switch(q.kind){
  case "box": case "slope": case "round": case "headlight":{
    R=q.ld&&q.ld.m?parseM(q.ld.m):I; const w=q.x1-q.x0,d=q.z1-q.z0;
    const Ct=P2L((q.x0+q.x1)/2,q.y0+q.h/2,(q.z0+q.z1)/2);
    const b=bb(id), ext=b.mx.map((v,i)=>v-b.mn[i]), rx=mv(R,ext).map(Math.abs), want=[w*20,q.h*8,d*20];
    if(q.kind!=="headlight"&&Math.abs(rx[0]-want[0])+Math.abs(rx[2]-want[2])>6){
      const alt=R===I||q.ld.m===undefined?RY90:I, rx2=mv(alt,ext).map(Math.abs);
      if(Math.abs(rx2[0]-want[0])+Math.abs(rx2[2]-want[2])<=6)R=alt; else issues.push(`尺寸不符 ${id} 想要 ${want} 實際 ${rx.map(v=>v.toFixed(0))}`);
    }
    P=fit(id,R,Ct); break;}
  case "eye": R=q.dir==="-z"?[-1,0,0,0,1,0,0,0,-1]:I; P=P2L(q.cx,q.y0+1,q.cz); break;
  case "cyl": case "tire":{
    const ax=AXL[id]; if(!ax){issues.push("缺軸向 "+id);R=I}else R=AXROT[ax][q.axis];
    const Ct=q.axis==="y"?P2L(q.cx,q.cy+q.len/2,q.cz):P2L(q.cx,q.cy,q.cz); P=fit(id,R,Ct);
    if(q.wheel||q.teeth)dyn={t:q.wheel?"wheel":"gear",c:[q.cx,q.cy,q.cz],axis:q.axis,r:q.roll||q.r,spin:q.spin||0};
    if(q.kind==="tire")dyn={t:"wheel",c:[q.cx,q.cy,q.cz],axis:"x",r:q.r};
    break;}
  case "tcyl": case "ttire":{
    const ax=AXL[id]; let d=D2L(q.dir); if(id==="2850b")d=d.map(v=>-v);
    R=alignAxis(ax,d); P=fit(id,R,P2L(q.c[0],q.c[1],q.c[2])); break;}
  case "rod":{
    const a=q.a,b=q.b, d=D2L([b[0]-a[0],(b[1]-a[1])*0.4,b[2]-a[2]]), mid=P2L((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);
    if(q.ax==="y"){R=alignAxis("Y",d)}
    else{const hx=q.hx==="z"?[0,0,1]:[1,0,0]; R=frame({Z:d,X:hx})}
    P=fit(id,R,mid); break;}
  case "vtile":{const n=[q.n,0,0]; R=frame({Y:[-q.n,0,0],X:[0,0,1]}); P=fit(id,R,P2L(q.cx,q.cy,q.cz)); break;}
  case "pubox": R=I; P=fit(id,R,P2L((q.x0+q.x1)/2,q.y0+q.h/2,(q.z0+q.z1)/2)); break;
  case "tlink":{R=frame({X:[1,0,0],Z:D2L(q.up).map(v=>-v)}); P=fit(id,R,P2L(q.c[0],q.c[1],q.c[2])); break;}
  case "pintle": R=I; P=fit(id,R,P2L(q.cx,q.cy,q.cz-.5)); break;
  case "ttbase": case "tttop": R=I; P=P2L(0,28+30/8,p.cz); break;
  case "mlink":{const i=linkParts.indexOf(p),n=M.TRACK.n,row=Math.floor(i/n),k=i%n; dyn={t:"link",row:M.TRACK.rows[row],k};
    const T=linkAt(k*M.TRACK.pitch,M.TRACK.rows[row]); R=T.R; P=T.P; break;}
  case "piston": case "conrod":{
    const e=M.ENG[q.eng], a=e.phase, bank=Math.atan2(e.dir[0],e.dir[1]), dp=1.9+.45*Math.cos(a-bank);
    const C=[0,M.CR_Y*0.4,e.z], pin=[Math.sin(a)*.5,C[1]+Math.cos(a)*.5,e.z], pc=[e.dir[0]*dp,C[1]+e.dir[1]*dp,e.z];
    const toL=v=>[v[0]*20,-v[1]*20,-v[2]*20];
    if(q.kind==="piston"){R=alignAxis("Y",D2L(e.dir).map(v=>-v));P=fit(id,R,toL(pc))}
    else{const mid=[(pin[0]+pc[0])/2,(pin[1]+pc[1])/2,e.z];R=alignAxis("Y",D2L([pc[0]-pin[0],pc[1]-pin[1],0]).map(v=>-v));P=fit(id,R,toL(mid))}
    dyn={t:q.kind,eng:q.eng}; break;}
  case "strap": R=RZ90; P=fit(id,R,P2L(q.x,23.6,q.z)); approx=true; break;
  case "band": R=RY90; P=fit(id,R,P2L(q.cx,q.cy,q.cz)); approx=true; break;
  case "link":{const t=D2L([0,Math.sin(q.ang),Math.cos(q.ang)]); R=frame({X:[-1,0,0],Z:t.map(v=>-v)}); P=P2L(q.cx,q.cy,q.cz); break;}
  case "virtual": if(q.ld){R=parseM(q.ld.m);P=[q.ld.x,q.ld.y,q.ld.z]} approx=true; break;
  default: issues.push("未處理 "+q.kind+" "+id);
  }
  out.push({i:idx,part:p.part,id,color:p.color,step:p.step,zone:p.zone,kind:p.kind,R,P,dyn,approx,virt:p.kind==="virtual",custom:(p.kind==="strap"||p.kind==="band")});
});

// ---------- collision check (oriented boxes from real geometry, studs excluded) ----------
const GEARS=new Set(["32269","32270","3648b","62821","4716","18938","57519","4185"]);
const SKIP=new Set(["3705","3706","3707","3708","3737","4519","32073","50451","6558","59443","14225","22168","2853a","73129","2852","2851"]);
const ROUND={"56145":"Z","55978":"Z","57519":"Z","62821":"Z","32269":"Z","32270":"Z","3648b":"Z","4185":"Z","4716":"Z","4740":"Y","4032a":"Y","98138":"Y","3941":"Y","3062b":"Y","6141":"Y","87081":"Y","60474":"Y","14769":"Y","4589":"Y","18938":"Y","18939":"Y"};
function obb(o){const b=bb(o.id),c=[(b.mn[0]+b.mx[0])/2,(b.mn[1]+b.mx[1])/2,(b.mn[2]+b.mx[2])/2],h=b.mx.map((v,i)=>Math.max(0,(v-b.mn[i])/2-1.5));
  const ra=ROUND[o.id]; if(ra){[0,1,2].forEach(i=>{if("XYZ"[i]!==ra)h[i]*=0.75})}
  const C=mv(o.R,c).map((v,i)=>v+o.P[i]);const ax=[[o.R[0],o.R[3],o.R[6]],[o.R[1],o.R[4],o.R[7]],[o.R[2],o.R[5],o.R[8]]];return {C,h,ax}}
function sat(A,B){const axes=[...A.ax,...B.ax];for(const a of A.ax)for(const b of B.ax){const c=cross(a,b);if(Math.hypot(...c)>1e-6)axes.push(norm(c))}
  const T=B.C.map((v,i)=>v-A.C[i]);
  for(const L of axes){const ra=A.ax.reduce((s,a,i)=>s+A.h[i]*Math.abs(a[0]*L[0]+a[1]*L[1]+a[2]*L[2]),0),rb=B.ax.reduce((s,a,i)=>s+B.h[i]*Math.abs(a[0]*L[0]+a[1]*L[1]+a[2]*L[2]),0);
    if(Math.abs(T[0]*L[0]+T[1]*L[1]+T[2]*L[2])>ra+rb)return false}
  return true}
const solids=out.filter(o=>o.R&&!o.virt&&!o.custom&&o.kind!=="mlink"&&!SKIP.has(o.id));
const boxes=solids.map(o=>({o,b:obb(o)}));
const coll=[];
for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
  const A=boxes[i],B=boxes[j]; const d=Math.hypot(...A.b.C.map((v,k)=>v-B.b.C[k])); const ra=Math.hypot(...A.b.h),rb=Math.hypot(...B.b.h);
  if(d>ra+rb)continue;
  const pair=[A.o.id,B.o.id].sort().join("+");
  if(/^(55978\+56145|18938\+18939|57518\+57518|4740\+87994)$/.test(pair))continue;
  if(GEARS.has(A.o.id)&&GEARS.has(B.o.id))continue;
  if(sat(A.b,B.b))coll.push(`${A.o.id}(步驟${A.o.step}) ↔ ${B.o.id}(步驟${B.o.step})`);
}
const W=C=>`(${(C[0]/20).toFixed(1)},${(-C[1]/8).toFixed(1)},${(-C[2]/20).toFixed(1)})`;
if(process.env.DIAG)for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const A=boxes[i],B=boxes[j];const pair=[A.o.id,B.o.id].sort().join("+");if(/^(55978\+56145|18938\+18939|57518\+57518|4740\+87994)$/.test(pair)||(GEARS.has(A.o.id)&&GEARS.has(B.o.id)))continue;if(Math.hypot(...A.b.C.map((v,k)=>v-B.b.C[k]))<=Math.hypot(...A.b.h)+Math.hypot(...B.b.h)&&sat(A.b,B.b))console.log("  ",A.o.id,W(A.b.C),B.o.id,W(B.b.C))}
const byPair={};coll.forEach(c=>{const k=c.replace(/\(步驟\d+\)/g,"");byPair[k]=(byPair[k]||0)+1});
fs.writeFileSync(__dirname+"/compile-report.json",JSON.stringify({issues,collisions:coll.length,byPair},null,1));
console.log("parts",out.length,"issues",issues.length,"collisions",coll.length);
console.log(issues.slice(0,15).join("\n"));
console.log(Object.entries(byPair).sort((a,b)=>b[1]-a[1]).slice(0,40).map(([k,v])=>v+"× "+k).join("\n"));
module.exports={out,M,LDMAP,bb,linkAt,coll};
