import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

const raw=document.getElementById("fury-data");
if(raw)start(JSON.parse(raw.textContent));
else fetch("fury-data.json").then(r=>r.json()).then(start).catch(()=>{document.getElementById("ttl").textContent="零件資料載入失敗，請重新整理頁面"});

function start(DATA){
if(THREE.ColorManagement){if("legacyMode" in THREE.ColorManagement)THREE.ColorManagement.legacyMode=false;else THREE.ColorManagement.enabled=true}
const {parts:PARTS,geo:GEO_DATA,track:TRACK,eng:ENG,steps:STEPS,names:NAMES,iddisp:IDDISP,colors:COLORS,schemes:SCHEMES,k:K}=DATA;
const PH=0.4, stage=document.getElementById("stage");
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
if("physicallyCorrectLights" in renderer)renderer.physicallyCorrectLights=true;
if("outputEncoding" in renderer&&THREE.sRGBEncoding!==undefined)renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
stage.prepend(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,1,1,600);
camera.position.set(50,34,60);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,8,3); controls.enableDamping=true; controls.autoRotate=!reduce; controls.autoRotateSpeed=.8;
controls.minDistance=12; controls.maxDistance=200;
scene.add(new THREE.HemisphereLight(0xe4ebf5,0x3b3a33,1.1));
const sun=new THREE.DirectionalLight(0xfff1de,2.1); sun.position.set(40,90,60); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048); Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:10,far:220}); sun.shadow.bias=-.0005; sun.shadow.normalBias=.02; scene.add(sun);
const rim=new THREE.DirectionalLight(0xd6e2ff,.45); rim.position.set(-60,30,-50); scene.add(rim);
const ground=new THREE.Mesh(new THREE.CircleGeometry(44,64),new THREE.ShadowMaterial({opacity:.3})); ground.receiveShadow=true;
ground.rotation.x=-Math.PI/2; ground.position.y=-.02; scene.add(ground);

const mats={};
function mat(k){
  if(mats[k])return mats[k];const c=COLORS[k];
  return mats[k]=new THREE.MeshStandardMaterial({color:c.hex,roughness:.7,metalness:k==="silver"?.45:0,flatShading:true,side:THREE.DoubleSide,
    transparent:!!c.trans,opacity:c.trans?.6:1});
}
function b64(s,T){const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new T(u.buffer)}
const GEOM={};
function geom(id){
  if(GEOM[id])return GEOM[id];const d=GEO_DATA[id];if(!d)return null;
  const p=b64(d.p,Int16Array),f=new Float32Array(p.length);for(let i=0;i<p.length;i++)f[i]=p[i]*.25;
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(f,3));
  g.setIndex(new THREE.BufferAttribute(b64(d.i,d.i32?Uint32Array:Uint16Array),1));g.computeVertexNormals();g.computeBoundingSphere();
  return GEOM[id]=g;
}
const STUDG=new THREE.CylinderGeometry(6,6,4,14); STUDG.translate(0,-2,0);
const W=new THREE.Matrix4().makeScale(.05,-.05,-.05);
function ldm(R,P){return new THREE.Matrix4().set(R[0],R[1],R[2],P[0],R[3],R[4],R[5],P[1],R[6],R[7],R[8],P[2],0,0,0,1)}
const world=(R,P)=>W.clone().multiply(ldm(R,P));

// ---------- groups ----------
const turPivot=new THREE.Group(); turPivot.position.set(0,0,K.TCZ); scene.add(turPivot);
const turret=new THREE.Group(); turret.position.set(0,0,-K.TCZ); turPivot.add(turret);
const GPY=(K.GY+K.DY_T)*PH, gunPivot=new THREE.Group(); gunPivot.position.set(0,GPY,K.GPZ); turret.add(gunPivot);
const gunHolder=new THREE.Group(); gunHolder.position.set(0,-GPY,-K.GPZ); gunPivot.add(gunHolder);
const PARENT={hull:scene,tur:turret,gun:gunHolder};
const steps=[];
for(let s=0;s<STEPS.length;s++){const z={};["hull","tur","gun"].forEach(k=>{z[k]=new THREE.Group();PARENT[k].add(z[k])});steps.push(z)}

const buckets={}, studB={}, dyns=[];
PARTS.forEach(p=>{
  if(p.v||!p.R)return;
  if(p.cu)return;
  if(!GEO_DATA[p.id])return;
  const key=p.st+"|"+p.z+"|"+p.id+"|"+p.c, Mw=world(p.R,p.P);
  const b=buckets[key]=buckets[key]||{p,list:[]};
  if(p.d)dyns.push({p,key,idx:b.list.length,base:Mw.clone()});
  b.list.push(Mw);
  if(!p.d){const studs=GEO_DATA[p.id].s;if(studs.length){const sk=p.st+"|"+p.z+"|"+(COLORS[p.c].trans?"tclear":p.c),sb=studB[sk]=studB[sk]||{p,list:[]};
    studs.forEach(s=>sb.list.push(Mw.clone().multiply(new THREE.Matrix4().makeTranslation(s[0],s[1],s[2]))))}}
});
const meshOf={};
function addIM(geo,m,list,step,zone,shadow){
  const im=new THREE.InstancedMesh(geo,m,list.length);list.forEach((M,i)=>im.setMatrixAt(i,M));
  im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;if(shadow){im.castShadow=true;im.receiveShadow=true}
  steps[step-1][zone].add(im);return im;
}
for(const k in buckets){const b=buckets[k];const g=geom(b.p.id);if(!g)continue;
  const im=addIM(g,mat(b.p.c),b.list,b.p.st,b.p.z,!COLORS[b.p.c].trans);meshOf[k]=im;
  if(b.list.length>1&&(b.p.c==="olive"||b.p.c==="int")){const col=new THREE.Color();b.list.forEach((m,i)=>{const h=Math.sin(i*12.9898+k.length*78.233)*43758.5453,v=.93+(h-Math.floor(h))*.1;im.setColorAt(i,col.setRGB(v,v,v))});im.instanceColor.needsUpdate=true}
}
for(const k in studB){const b=studB[k];const c=k.split("|")[2];addIM(STUDG,mat(c),b.list,b.p.st,b.p.z,true)}
// strings drawn as straps / bands
PARTS.filter(p=>p.cu&&p.x).forEach(p=>{
  const x=p.x, m=mat("black"), g=steps[p.st-1][p.z];
  if(p.k==="strap"){const mesh=new THREE.Mesh(new THREE.BoxGeometry(.12,15.6*PH,.2),m);mesh.position.set(x.x,24.6*PH,x.z);g.add(mesh)}
  else{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(x.r,x.r,.18,24,1,true),new THREE.MeshStandardMaterial({color:0x1e2328,side:THREE.DoubleSide}));
    mesh.rotation.x=Math.PI/2;mesh.position.set(x.cx,(x.cy+K.DY_T)*PH,x.cz);g.add(mesh)}
});

// ---------- moving parts ----------
const T1=new THREE.Matrix4(),T2=new THREE.Matrix4(),RM=new THREE.Matrix4(),AX={x:new THREE.Vector3(1,0,0),y:new THREE.Vector3(0,1,0),z:new THREE.Vector3(0,0,1)};
const norm=a=>{const l=Math.hypot(...a);return a.map(v=>v/l)}, cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const mv=(R,v)=>[R[0]*v[0]+R[1]*v[1]+R[2]*v[2],R[3]*v[0]+R[4]*v[1]+R[5]*v[2],R[6]*v[0]+R[7]*v[1]+R[8]*v[2]];
function frame(c){let {X,Y,Z}=c;if(!X)X=cross(Y,Z);if(!Y)Y=cross(Z,X);if(!Z)Z=cross(X,Y);return [X[0],Y[0],Z[0],X[1],Y[1],Z[1],X[2],Y[2],Z[2]]}
function alignY(b){b=norm(b);const v=cross([0,1,0],b),c=b[1];if(c<-.9999)return [1,0,0,0,-1,0,0,0,-1];const k=1/(1+c),[x,y,z]=v;
  return [x*x*k+c,x*y*k-z,x*z*k+y,y*x*k+z,y*y*k+c,y*z*k-x,z*x*k-y,z*y*k+x,z*z*k+c]}
function fitP(id,R,Ct){const c=GEO_DATA[id].c,rc=mv(R,c);return [Ct[0]-rc[0],Ct[1]-rc[1],Ct[2]-rc[2]]}
function linkAt(d,x){
  const seg=TRACK.seg,L=TRACK.per;d=((d%L)+L)%L;let s=0;while(s<seg.length-1&&seg[s][3]+seg[s][2]<d)s++;
  const g=seg[s],f=(d-g[3])/g[2],z=g[0][0]+(g[1][0]-g[0][0])*f,y=g[0][1]+(g[1][1]-g[0][1])*f,tz=(g[1][0]-g[0][0])/g[2],ty=(g[1][1]-g[0][1])/g[2];
  const t=norm([0,-ty,-tz]);return {R:frame({X:[-1,0,0],Z:t.map(v=>-v)}),P:[x*20,-y*20,-z*20]};
}
function engineRP(kind,e,th){
  const a=th+e.phase,bank=Math.atan2(e.dir[0],e.dir[1]),dp=1.9+.45*Math.cos(a-bank);
  const C=[0,K.CR_Y*.4,e.z],pin=[Math.sin(a)*.5,C[1]+Math.cos(a)*.5,e.z],pc=[e.dir[0]*dp,C[1]+e.dir[1]*dp,e.z],toL=v=>[v[0]*20,-v[1]*20,-v[2]*20];
  if(kind==="piston"){const R=alignY([-e.dir[0],e.dir[1],0]);return {R,P:fitP("2851",R,toL(pc))}}
  const R=alignY([-(pc[0]-pin[0]),(pc[1]-pin[1]),0]);return {R,P:fitP("2852",R,toL([(pin[0]+pc[0])/2,(pin[1]+pc[1])/2,e.z]))};
}
let dist=0;
function setDyn(){
  const sprAng=-dist/K.SPR_R, th=dist/K.SPR_R/0.43, touched=new Set();
  dyns.forEach(d=>{
    const p=d.p,im=meshOf[d.key];if(!im)return;let M;
    if(p.d.t==="link"){const r=linkAt(p.d.k*TRACK.pitch+dist,p.d.row);M=world(r.R,r.P)}
    else if(p.d.t==="piston"||p.d.t==="conrod"){const r=engineRP(p.d.t,ENG[p.d.eng],th);M=world(r.R,r.P)}
    else{const ang=p.d.t==="wheel"?-dist/p.d.r:(p.d.spin?p.d.spin*sprAng/0.43:0);if(!ang)return;
      const c=new THREE.Vector3(p.d.c[0],p.d.c[1]*PH,p.d.c[2]);
      M=T1.makeTranslation(c.x,c.y,c.z).clone().multiply(RM.makeRotationAxis(AX[p.d.axis],ang)).multiply(T2.makeTranslation(-c.x,-c.y,-c.z)).multiply(d.base)}
    im.setMatrixAt(d.idx,M);touched.add(im);
  });
  touched.forEach(im=>im.instanceMatrix.needsUpdate=true);
}
setDyn();

function resize(){const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(stage); resize();

let anim=null, driving=false, last=performance.now();
function showStep(n,animate){
  steps.forEach((z,i)=>{for(const k in z){z[k].visible=i<n;z[k].position.y=0}});
  anim=animate&&!reduce?{z:steps[n-1],t0:performance.now()}:null;
}
function tick(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(anim){const k=Math.min(1,(now-anim.t0)/500);for(const z in anim.z)anim.z[z].position.y=8*(1-k)*(1-k);if(k>=1)anim=null}
  if(driving){dist-=5*dt;setDyn()}
  controls.update(); renderer.render(scene,camera); requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---------- UI ----------
const $=id=>document.getElementById(id);
const hex=n=>"#"+n.toString(16).padStart(6,"0");
const idOf=p=>IDDISP[p]||p;
function chips(list){const grp={};list.forEach(p=>{const k=p.part+"|"+p.c;grp[k]=(grp[k]||0)+1});return Object.entries(grp).sort((a,b)=>b[1]-a[1])}
function render(n,animate){
  const st=STEPS[n-1], list=PARTS.filter(p=>p.st===n);
  $("no").textContent=n; $("ttl").textContent=st.t; $("sub").textContent=`${st.s?st.s+" · ":""}${list.length} 個零件`;
  $("instr").innerHTML=st.i.map(x=>`<li>${x}</li>`).join("");
  $("callout").innerHTML=`<div class="callout-t">這一步需要</div>`+chips(list).map(([k,c])=>{const [part,col]=k.split("|");
    return `<span class="chip"><span class="sw" style="background:${hex(COLORS[col].hex)}"></span>${c}× ${NAMES[part]||part} <span class="mono">${idOf(part)}</span></span>`}).join("");
  $("slider").max=STEPS.length; $("slider").value=n; $("prev").disabled=n===1; $("next").disabled=n===STEPS.length;
  showStep(n,animate);
}
let cur=STEPS.length;
$("prev").onclick=()=>{if(cur>1)render(--cur,true)};
$("next").onclick=()=>{if(cur<STEPS.length)render(++cur,true)};
$("slider").oninput=e=>{cur=+e.target.value;render(cur,true)};
$("spin").onclick=e=>{controls.autoRotate=!controls.autoRotate;e.target.textContent="自動旋轉："+(controls.autoRotate?"開":"關");e.target.setAttribute("aria-pressed",controls.autoRotate)};
if(reduce){$("spin").textContent="自動旋轉：關";$("spin").setAttribute("aria-pressed","false")}
function setTur(v){turPivot.rotation.y=v*Math.PI/180;$("tur-o").textContent=v+"°"}
function setGun(v){gunPivot.rotation.x=-v*Math.PI/180;$("gun-o").textContent=v+"°"}
$("tur").oninput=e=>setTur(+e.target.value); $("gun").oninput=e=>setGun(+e.target.value);
setTur(-20); setGun(6);
$("drive").onclick=e=>{driving=!driving;e.target.textContent=driving?"停止行駛":"行駛示範";e.target.setAttribute("aria-pressed",driving)};
let xray=false;
$("xray").onclick=e=>{xray=!xray;["olive","int"].forEach(k=>{const m=mat(k);m.transparent=xray;m.opacity=xray?.12:1;m.depthWrite=!xray;m.needsUpdate=true});
  e.target.textContent=xray?"關閉透視":"透視內部";e.target.setAttribute("aria-pressed",xray)};
function f(n){n=Math.round(n*1000)/1000;return (Object.is(n,-0)?0:n).toString()}
function toLDraw(){
  const o=["0 M4A3E8 Sherman Easy Eight \"Fury\" (1:18, motorized)","0 Name: FURY.ldr","0 Author: Claude","0 !LDRAW_ORG Unofficial_Model",""];
  for(let s=1;s<=STEPS.length;s++){
    PARTS.forEach(p=>{if(p.st!==s||!p.R||!p.P)return;o.push(["1",COLORS[p.c].ld,...p.P.map(f),...p.R.map(f),p.id+".dat"].join(" "))});
    o.push("0 STEP");
  }
  return o.join("\n")+"\n";
}
let ldr="";
function table(){
  $("parts").innerHTML=chips(PARTS).sort((a,b)=>a[0].localeCompare(b[0])).map(([k,c])=>{const [part,col]=k.split("|");
    return `<tr><td>${NAMES[part]||part}</td><td class="mono">${idOf(part)}</td><td><span class="chip" style="border:0;padding:0"><span class="sw" style="background:${hex(COLORS[col].hex)}"></span>${COLORS[col].name}</span></td><td class="n">${c}</td></tr>`}).join("");
  ldr=toLDraw(); $("ldr").value=ldr;
}
$("scheme").onchange=e=>{Object.assign(COLORS.olive,SCHEMES[e.target.value]);mat("olive").color.setHex(COLORS.olive.hex);table();render(cur,false)};
render(cur,false); table();
$("s-pcs").textContent=PARTS.length.toLocaleString();
$("s-len").textContent=`≈ ${Math.round(K.len*0.8)} cm`;
$("copy").onclick=()=>{
  navigator.clipboard.writeText(ldr).then(()=>{$("copied").textContent="已複製，貼到文字檔並存成 FURY.ldr"})
  .catch(()=>{$("ldr").select();$("copied").textContent="已選取全部內容，請按 ⌘C / Ctrl+C 複製"});
};
}
