// ---- real LDraw part meshes + shared lighting ----
if(THREE.ColorManagement){if("legacyMode" in THREE.ColorManagement)THREE.ColorManagement.legacyMode=false;else THREE.ColorManagement.enabled=true}
const REAL=JSON.parse(document.getElementById("real-data").textContent);
const MOVED={"3040":"3040b","3068":"3068b","3069":"3069b","3070":"3070b","3665":"3665a","4032":"4032a","4073":"6141","4185":"4185a","3957":"3957a"};
const pid=p=>MOVED[p]||p;
function lookSetup(renderer,scene,R,groundY){
  // r147 defaults to legacy light units and linear output; r160 needs none of these.
  if("physicallyCorrectLights" in renderer)renderer.physicallyCorrectLights=true;
  if("outputEncoding" in renderer&&THREE.sRGBEncoding!==undefined)renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene.add(new THREE.HemisphereLight(0xe4ebf5,0x3b3a33,1.1));
  const key=new THREE.DirectionalLight(0xfff1de,2.1); key.position.set(R*1.1,R*2.2,R*1.5); key.castShadow=true;
  key.shadow.mapSize.set(2048,2048); Object.assign(key.shadow.camera,{left:-R*1.3,right:R*1.3,top:R*1.3,bottom:-R*1.3,near:R*.3,far:R*6});
  key.shadow.bias=-.0005; key.shadow.normalBias=.02; scene.add(key);
  const fill=new THREE.DirectionalLight(0xd6e2ff,.45); fill.position.set(-R*1.5,R*.8,-R*1.2); scene.add(fill);
  const ground=new THREE.Mesh(new THREE.CircleGeometry(R*1.25,64),new THREE.ShadowMaterial({opacity:.3}));
  ground.receiveShadow=true; ground.rotation.x=-Math.PI/2; ground.position.y=groundY; scene.add(ground);
}
const mats={};
function mat(k){
  if(mats[k])return mats[k];const c=COLORS[k];
  return mats[k]=new THREE.MeshStandardMaterial({color:c.hex,roughness:.7,metalness:k==="silver"?.45:0,flatShading:true,side:THREE.DoubleSide,
    transparent:!!c.trans,opacity:c.trans?.6:1});
}
function b64(s,T){const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new T(u.buffer)}
const GEOM={};
function geom(id){
  if(GEOM[id])return GEOM[id];const d=REAL.geo[id];
  const p=b64(d.p,Int16Array),f=new Float32Array(p.length);for(let i=0;i<p.length;i++)f[i]=p[i]*.25;
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(f,3));
  g.setIndex(new THREE.BufferAttribute(b64(d.i,d.i32?Uint32Array:Uint16Array),1));g.computeVertexNormals();
  return GEOM[id]=g;
}
const STUDG=new THREE.CylinderGeometry(6,6,4,16); STUDG.translate(0,-2,0);
const W=new THREE.Matrix4().makeScale(.05,-.05,-.05);
const ldm=(R,P)=>new THREE.Matrix4().set(R[0],R[1],R[2],P[0],R[3],R[4],R[5],P[1],R[6],R[7],R[8],P[2],0,0,0,1);
function realBounds(){const b=new THREE.Box3(),v=new THREE.Vector3();
  REAL.parts.forEach(p=>{v.set(p.P[0]*.05,-p.P[1]*.05,-p.P[2]*.05);b.expandByPoint(v)});return b}
function realGroups(parentOf){
  const groups=new Map(),buckets={};
  REAL.parts.forEach(p=>{
    const par=parentOf(p),gk=p.st+"|"+par.uuid;let g=groups.get(gk);
    if(!g){g=new THREE.Group();g.userData.step=p.st;par.add(g);groups.set(gk,g)}
    const Mw=W.clone().multiply(ldm(p.R,p.P)),bk=gk+"|"+p.id+"|"+p.c;
    (buckets[bk]=buckets[bk]||{g,id:p.id,c:p.c,list:[]}).list.push(Mw);
    const st=REAL.geo[p.id].s;
    if(st.length){const sk=gk+"|stud|"+p.c,b=buckets[sk]=buckets[sk]||{g,id:null,c:p.c,list:[]};
      st.forEach(s=>b.list.push(Mw.clone().multiply(new THREE.Matrix4().makeTranslation(s[0],s[1],s[2]))))}
  });
  for(const k in buckets){const b=buckets[k],im=new THREE.InstancedMesh(b.id?geom(b.id):STUDG,mat(b.c),b.list.length);
    b.list.forEach((M,i)=>im.setMatrixAt(i,M));im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;
    const tr=!!COLORS[b.c].trans;im.castShadow=!tr;im.receiveShadow=!tr;b.g.add(im)}
  return [...groups.values()];
}
function realLDraw(header){
  const f=n=>{n=Math.round(n*1000)/1000;return (Object.is(n,-0)?0:n).toString()},o=header.slice();
  for(let s=1;s<=STEPS.length;s++){REAL.parts.forEach(p=>{if(p.st===s)o.push(["1",COLORS[p.c].ld,...p.P.map(f),...p.R.map(f),p.id+".dat"].join(" "))});o.push("0 STEP")}
  return o.join("\n")+"\n";
}
// ---- end real lib ----
