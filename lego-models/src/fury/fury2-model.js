// Units: x across (+x = tank's left) / z along (front = +z) in studs; y in plate heights. LDraw: X=x*20, Y=-y*8, Z=-z*20.
var COLORS={
  olive:{hex:0x6f6d3c,ld:330,name:"橄欖綠"}, int:{hex:0xa0a5a9,ld:71,name:"淺灰（內部，可換任意色）"},
  lbg:{hex:0xa3a8ab,ld:71,name:"淺灰"}, dbg:{hex:0x5f615c,ld:72,name:"深灰"}, black:{hex:0x1e2328,ld:0,name:"黑"},
  brown:{hex:0x6a3418,ld:70,name:"紅棕"}, silver:{hex:0x8f9194,ld:179,name:"平光銀"}, tan:{hex:0xd9c493,ld:19,name:"米色"},
  dtan:{hex:0x8f8366,ld:28,name:"深米色"}, red:{hex:0xb51a0e,ld:4,name:"紅"}, yellow:{hex:0xf2cd37,ld:14,name:"黃"},
  blue:{hex:0x1e5aa8,ld:1,name:"藍"}, tblack:{hex:0x2b3036,ld:40,name:"透明黑",trans:true}, tclear:{hex:0xf2f8ff,ld:47,name:"透明",trans:true}
};
var SCHEMES={olive:{hex:0x6f6d3c,ld:330,name:"橄欖綠"},gray:{hex:0x9ba1a5,ld:71,name:"淺灰（參考作品配色）"}};
var BRICK={"2x10":"3006","2x8":"3007","2x6":"2456","2x4":"3001","2x3":"3002","2x2":"3003","1x8":"3008","1x6":"3009","1x4":"3010","1x3":"3622","1x2":"3004","1x1":"3005"};
var PLATE6={"6x16":"3027","6x14":"3456","6x12":"3028","6x10":"3033","6x8":"3036","6x6":"3958","4x6":"3032","2x6":"3795","3x6":"3795x"};
var PLATE={"4x8":"3035","4x6":"3032","2x10":"3832","2x8":"3034","2x6":"3795","2x4":"3020","2x3":"3021","2x2":"3022","1x6":"3666","1x4":"3710","1x3":"3623","1x2":"3023","1x1":"3024"};
var TILE={"2x4":"87079","2x2":"3068","1x6":"6636","1x4":"2431","1x3":"63864","1x2":"3069","1x1":"3070"};
var NAMES={"3006":"Brick 2×10","3007":"Brick 2×8","2456":"Brick 2×6","3001":"Brick 2×4","3002":"Brick 2×3","3003":"Brick 2×2",
 "3008":"Brick 1×8","3009":"Brick 1×6","3010":"Brick 1×4","3622":"Brick 1×3","3004":"Brick 1×2","3005":"Brick 1×1",
 "3035":"Plate 4×8","3032":"Plate 4×6","3832":"Plate 2×10","3034":"Plate 2×8","3795":"Plate 2×6","3020":"Plate 2×4","3021":"Plate 2×3",
 "3022":"Plate 2×2","3666":"Plate 1×6","3710":"Plate 1×4","3623":"Plate 1×3","3023":"Plate 1×2","3024":"Plate 1×1",
 "87079":"Tile 2×4","3068":"Tile 2×2","6636":"Tile 1×6","2431":"Tile 1×4","63864":"Tile 1×3","3069":"Tile 1×2","3070":"Tile 1×1",
 "3040":"Slope 45° 2×1","4286":"Slope 33° 3×1","3665":"Slope Inverted 45° 2×1","3039":"Slope 45° 2×2",
 "54200":"Slope 30° 1×1×2/3（起司斜）","2412b":"Tile 1×2 Grille","15068":"Slope Curved 2×2",
 "3700":"Technic Brick 1×2 with Hole","3706":"Technic Axle 6","3705":"Technic Axle 4","32073":"Technic Axle 5","3737":"Technic Axle 10",
 "3708":"Technic Axle 12","4519":"Technic Axle 3","50451":"Technic Axle 16","6538c":"Technic Axle Connector 2L",
 "56145":"Wheel 30.4×20（負重輪／誘導輪）","55978":"Tire 37×22 ZR（負重輪橡膠胎）","99781":"Bracket 1×2 - 1×2","61678":"Slope Curved 4×1","57519":"Technic Sprocket Wheel 25.6（主動輪）","4185":"Technic Wedge Belt Wheel（托帶輪）",
 "57518":"Technic Link Tread Wide","32316":"Technic Liftarm Thick 1×5（轉向架）","32523":"Technic Liftarm Thick 1×3（擺臂）",
 "6558":"Technic Pin 3L with Friction",
 "32270":"Technic Gear 12T Double Bevel","32269":"Technic Gear 20T Double Bevel","4019":"Technic Gear 16T","3649":"Technic Gear 40T","4716":"Technic Worm Gear",
 "2850b":"Technic Engine Cylinder","88014":"Powered Up Technic XL Motor","3707":"Technic Axle 8","3648":"Technic Gear 24T","62821b":"Technic Differential 28T（Closed Center）","2540":"Plate 1×2 with Handle on Side","4589":"Cone 1×1","6536":"Technic Axle and Pin Connector Perpendicular","2851":"Technic Engine Piston","2852":"Technic Engine Connecting Rod","2853":"Technic Engine Crankshaft",
 "32278":"Technic Liftarm Thick 1×15","40490":"Technic Liftarm Thick 1×9",
 "88012":"Powered Up Technic Hub","88013":"Powered Up Technic L Motor","45303":"Powered Up Medium Linear Motor","88005":"Powered Up Light（LED）",
 "18939":"Technic Turntable 60T Bottom","18938":"Technic Turntable 60T Top",
 "4070":"Brick 1×1 with Headlight","98138":"Tile 1×1 Round","14769":"Tile 2×2 Round","4073":"Plate 1×1 Round",
 "87081":"Brick Round 4×4","60474":"Plate Round 4×4 with Hole","3062b":"Brick Round 1×1","2569":"Antenna Whip 8H",
 "87994":"Bar 3L","63965":"Bar 6L with Stop Ring","3941":"Brick Round 2×2 with Axle Hole","4032":"Plate Round 2×2 with Axle Hole",
 "4740":"Dish 2×2 Inverted","32064":"Technic Brick 1×2 with Axle Hole","87087":"Brick 1×1 with Stud on Side",
 "STRING":"String Braided 31L with End Studs（綁帶）","3036":"Plate 6×8","731c05":"Technic Shock Absorber 6.5L"};
var IDDISP={STRING:"14225"};

var PARTS=[], STEP=1;
function key(x,z){return x+","+z}
function rectCells(rects,minus){
  var s=new Set();
  rects.forEach(function(r){for(var x=r[0];x<r[1];x++)for(var z=r[2];z<r[3];z++)s.add(key(x,z))});
  (minus||[]).forEach(function(r){for(var x=r[0];x<r[1];x++)for(var z=r[2];z<r[3];z++)s.delete(key(x,z))});
  return s;
}
function ellipse(rx,rzf,rzr,cz,minus){
  var s=new Set();
  for(var x=-12;x<12;x++)for(var z=-16;z<20;z++){
    var dx=(x+.5)/rx, dzr=z+.5-cz, dz=dzr/(dzr>0?rzf:rzr);
    if(dx*dx+dz*dz<=1)s.add(key(x,z));
  }
  (minus||[]).forEach(function(r){for(var x=r[0];x<r[1];x++)for(var z=r[2];z<r[3];z++)s.delete(key(x,z))});
  return s;
}
// Wall cells: within w cells of the outline (Chebyshev); `solid` forces extra cells to stay filled.
function ringOf(A,w,solid,wz,base){
  var s=new Set(),O=base||A; wz=wz||w;
  A.forEach(function(k){var a=k.split(","),x=+a[0],z=+a[1],wall=false;
    for(var dx=-w;dx<=w&&!wall;dx++)for(var dz=-wz;dz<=wz&&!wall;dz++)if(!O.has(key(x+dx,z+dz)))wall=true;
    if(wall||(solid&&solid.has(k)))s.add(k)});
  return s;
}
function sorted(set){return Array.from(set).map(function(k){var a=k.split(",");return [+a[0],+a[1]]}).sort(function(a,b){return a[1]-b[1]||a[0]-b[0]})}
var ROT={id:"1 0 0 0 1 0 0 0 1",ry90:"0 0 1 0 1 0 -1 0 0","+z":"1 0 0 0 1 0 0 0 1","-z":"-1 0 0 0 1 0 0 0 -1",
  "+x":"0 0 -1 0 1 0 1 0 0","-x":"0 0 1 0 1 0 -1 0 0",rx90:"1 0 0 0 0 -1 0 1 0",rz90:"0 -1 0 1 0 0 0 0 1"};
function ld(x,y,z,m){return {x:x*20,y:-y*8,z:-z*20,m:m}}
function box(part,color,x0,x1,z0,z1,y0,h,o){
  o=o||{};var w=x1-x0,d=z1-z0;
  var p={step:STEP,part:part,color:color,kind:o.kind||"box",x0:x0,x1:x1,z0:z0,z1:z1,y0:y0,h:h,studs:o.studs!==false,dir:o.dir||"+z",zone:o.zone,
    ld:ld((x0+x1)/2,y0+h,(z0+z1)/2,o.m||(d>w?ROT.ry90:ROT.id))};
  PARTS.push(p);return p;
}
function slope(part,color,x0,x1,z0,z1,y0,h,dir,prof,o){
  var p={step:STEP,part:part,color:color,kind:"slope",x0:x0,x1:x1,z0:z0,z1:z1,y0:y0,h:h,dir:dir,prof:prof,zone:o&&o.zone,
    ld:ld((x0+x1)/2,y0+h,(z0+z1)/2,ROT[dir])};
  PARTS.push(p);return p;
}
function cyl(part,color,cx,cy,cz,r,len,axis,o){
  o=o||{};var L;
  if(axis==="y")L=ld(cx,cy+len,cz,ROT.id);
  else if(axis==="z")L=ld(cx,cy,cz+len/2,ROT.rx90);
  else L=ld(cx,cy,cz,o.m||ROT.rz90);
  var p={step:STEP,part:part,color:color,kind:"cyl",cx:cx,cy:cy,cz:cz,r:r,len:len,axis:axis,stud:!!o.stud,wheel:o.wheel||0,teeth:o.teeth||0,spin:o.spin||0,zone:o.zone,ld:L};
  PARTS.push(p);return p;
}
function pu(part,color,x0,x1,z0,z1,y0,h,style,o){
  var p={step:STEP,part:part,color:color,kind:"pubox",style:style,x0:x0,x1:x1,z0:z0,z1:z1,y0:y0,h:h,zone:o&&o.zone,ld:null};
  PARTS.push(p);return p;
}
function virt(part,color,L,o){var p={step:STEP,part:part,color:color,kind:"virtual",ld:L||null,zone:o&&o.zone};PARTS.push(p);return p}
function pack(avail,table,pref,cb,xonly){
  var sizes=Object.keys(table).map(function(k){var a=k.split("x");return [+a[0],+a[1],k]}).sort(function(a,b){return b[0]*b[1]-a[0]*a[1]||b[1]-a[1]});
  var free=new Set(avail);
  sorted(free).forEach(function(c){
    if(!free.has(key(c[0],c[1])))return;
    for(var i=0;i<sizes.length;i++){
      var s=sizes[i], ors=pref==="z"?[[s[0],s[1]],[s[1],s[0]]]:[[s[1],s[0]],[s[0],s[1]]];
      if(xonly)ors=[[s[1],s[0]]];
      for(var j=0;j<ors.length;j++){
        var w=ors[j][0],d=ors[j][1],ok=true;
        for(var x=c[0];x<c[0]+w&&ok;x++)for(var z=c[1];z<c[1]+d&&ok;z++)if(!free.has(key(x,z)))ok=false;
        if(ok){
          for(x=c[0];x<c[0]+w;x++)for(z=c[1];z<c[1]+d;z++)free.delete(key(x,z));
          cb(table[s[2]],c[0],c[0]+w,c[1],c[1]+d);return;
        }
      }
    }
  });
}
var DIRS=[["+z",0,1],["-z",0,-1],["+x",1,0],["-x",-1,0]];
// One layer: armor-line slopes where the layer above recedes, inverted slopes where the layer below is smaller, then pack the rest (only wall cells when `ring` is given).
function shellLayer(o){
  var A=o.shape, U=o.up, D=o.down, avail=new Set(o.avail||A), color=o.color||"olive";
  if(!o.plate){
    DIRS.forEach(function(dd){
      sorted(avail).forEach(function(c){
        var x=c[0],z=c[1];
        if(!avail.has(key(x,z))||A.has(key(x+dd[1],z+dd[2])))return;
        var fp=null,part,prof;
        if(U&&!U.has(key(x,z))){
          var r=0;while(r<3&&!U.has(key(x-r*dd[1],z-r*dd[2]))&&A.has(key(x-r*dd[1],z-r*dd[2])))r++;
          if((r===1||r===2)&&U.has(key(x-r*dd[1],z-r*dd[2]))){fp=r+1;part=r===1?"3040":"4286";prof=r===1?"s45":"s33"}
        }
        if(!fp&&D&&!D.has(key(x,z))&&D.has(key(x-dd[1],z-dd[2]))){fp=2;part="3665";prof="i45"}
        if(!fp)return;
        var cells=[];for(var k=0;k<fp;k++)cells.push(key(x-k*dd[1],z-k*dd[2]));
        if(!cells.every(function(q){return avail.has(q)}))return;
        cells.forEach(function(q){avail.delete(q)});
        var xs=[x,x-(fp-1)*dd[1]],zs=[z,z-(fp-1)*dd[2]];
        slope(part,color,Math.min.apply(0,xs),Math.max.apply(0,xs)+1,Math.min.apply(0,zs),Math.max.apply(0,zs)+1,o.y,3,dd[0],prof);
      });
    });
  }
  var packSet=avail;
  if(o.ring){packSet=new Set();avail.forEach(function(k){if(o.ring.has(k))packSet.add(k)})}
  var table=o.floor?Object.assign({},PLATE6,{"2x4":"3020","2x3":"3021","2x2":"3022","1x6":"3666","1x4":"3710","1x3":"3623","1x2":"3023","1x1":"3024"}):(o.plate?PLATE:BRICK);
  if(o.floor)delete table["3x6"];
  var cbBrick=function(part,x0,x1,z0,z1){
    if(!o.plate&&x1-x0===1&&z1-z0===1&&(!D||!D.has(key(x0,z0)))&&(!U||!U.has(key(x0,z0))))return;
    var hidden=!o.plate&&U&&D;
    for(var x=x0;x<x1&&hidden;x++)for(var z=z0;z<z1&&hidden;z++){
      if(!U.has(key(x,z))||!D.has(key(x,z)))hidden=false;
      DIRS.forEach(function(dd){if(!A.has(key(x+dd[1],z+dd[2])))hidden=false});
    }
    box(part,hidden?"int":color,x0,x1,z0,z1,o.y,o.plate?1:3);
  };
  if(o.floor){floorPlates(packSet,o.y);return}
  if(o.xonly&&o.solid){var sp=new Set(),rest=new Set();packSet.forEach(function(k){(o.solid.has(k)?sp:rest).add(k)});
    pack(sp,table,"x",cbBrick,true);pack(rest,table,o.pref,cbBrick);return}
  pack(packSet,table,o.pref,cbBrick);
}
// Floor: 6-wide plates on each side so every plate reaches a side wall; narrow strips beside the motor opening.
function floorPlates(cells,y){
  var P6={16:"3027",14:"3456",12:"3028",10:"3033",8:"3036",6:"3958",4:"3032",2:"3795",1:"3666"},P2={10:"3832",8:"3034",6:"3795",4:"3020",3:"3021",2:"3022",1:"3023"};
  [[-6,0],[0,6]].forEach(function(h){
    var z=-19, full=function(z){for(var x=h[0];x<h[1];x++)if(!cells.has(key(x,z)))return false;return true};
    while(z<19){
      if(full(z)){var n=0;while(z+n<19&&full(z+n))n++;
        while(n>0){var L=[16,14,12,10,8,6,4,2,1].filter(function(v){return v<=n})[0];box(P6[L],"olive",h[0],h[1],z,z+L,y,1);z+=L;n-=L}}
      else{var x0=h[0]<0?h[0]:h[1]-2,n2=0;while(z+n2<19&&!full(z+n2))n2++;
        var zz=z,m=n2;while(m>0){var L2=[10,8,6,4,3,2,1].filter(function(v){return v<=m})[0];box(P2[L2],"olive",x0,x0+2,zz,zz+L2,y,1);zz+=L2;m-=L2}
        z+=n2}
    }
  });
}

// ---------- hull: hollow shell so the drivetrain fits inside; roof is three removable plate layers ----------
var BOGIES=[-11,0,11], STATIONS=[-14,-8,-3,3,8,14], ROLLERS=[];
var WHEEL_Y=7.83, AXLE_Y=9.8, BRACKET_Y=12.8, SPROCKET_Z=19, IDLER_Z=-19, SPR_R=2.55, TIRE_R=2.3, WX=[9.3], ARM_X=7.35, BRK_X=6.45, PITCH=1.4;
var HL=[
  {y:4,plate:1,floor:1,r:[[-6,6,-19,22]],cut:[[-4,4,-18,-9]],st:1},
  {y:5,r:[[-6,6,-19,22]],hol:1,rw:2,rwz:1,st:1},{y:8,r:[[-6,6,-20,22]],hol:1,rw:2,rwz:1,st:1},{y:11,r:[[-6,6,-21,22]],hol:1,rw:2,rwz:1,st:1},
  {y:14,plate:1,r:[[-6,6,-21,22]],hol:1,rw:1,st:1},{y:15,plate:1,r:[[-6,6,-21,22]],hol:1,rw:1,st:1},
  {y:16,r:[[-10,10,-21,22]],cut:[[-10,-6,14,22],[6,10,14,22],[-10,-6,-21,-16],[6,10,-21,-16],[5,6,1,9]],hol:1,st:6,sponson:1},{y:19,r:[[-10,10,-21,21]],hol:1,st:6},
  {y:22,r:[[-10,10,-21,19]],hol:1,st:6},{y:25,r:[[-10,10,-21,18]],hol:1,st:6},
  {y:28,plate:1,r:[[-10,10,-20,16]],cut:[[-4,4,-4,4],[3,6,-2,12]],st:7},{y:29,plate:1,r:[[-10,10,-20,16]],cut:[[-4,4,-4,4],[3,6,-2,12]],st:7},{y:30,plate:1,r:[[-10,10,-20,16]],cut:[[-4,4,-4,4],[3,6,-2,12]],st:7}
].map(function(l){l.s=rectCells(l.r,l.cut);return l});
HL.forEach(function(l,i){
  STEP=l.st;
  var avail=new Set(l.s);
  function tb(z,y){[[-6,-5],[5,6]].forEach(function(xx){for(var q=z-1;q<z+1;q++)avail.delete(key(xx[0],q));box("3700","dbg",xx[0],xx[1],z-1,z+1,y,3)})}
  if(l.y===8)[SPROCKET_Z,IDLER_Z].forEach(function(z){tb(z,8)});
  if(l.y===11)BOGIES.forEach(function(c){tb(c,11)});
  var solid=null;
  if(l.sponson){solid=new Set();l.s.forEach(function(k){var x=+k.split(",")[0];if(!HL[i-1].s.has(k)||x===-6||x===5)solid.add(k)})}
  shellLayer({solid:solid,shape:l.s,avail:avail,ring:l.hol?ringOf(l.s,l.rw||2,solid,l.rwz,l.sponson?rectCells(l.r):null):null,y:l.y,plate:!!l.plate,floor:!!l.floor,xonly:!!l.sponson,pref:(l.floor||l.sponson)?"x":(i%2?"x":"z"),
    up:HL[i+1]?HL[i+1].s:null,down:i>0?HL[i-1].s:null});
});

// ---------- power: XL motor in the engine bay, L motor for steering, L motor for the turret, Technic Hub, lights ----------
STEP=2;
var DS_Y=9.8, CR_Y=17.3;
pu("88014","dbg",-2.5,2.5,-17.6,-9.6,DS_Y-6.125,12.25,"motor");
pu("88013","dbg",-1.5,1.5,7.4,15.4,12.5,9.75,"motor");
pu("88012","lbg",-4.5,4.5,-8,.9,15.2,12.5,"hub");
virt("88005","black");

// ---------- drivetrain: driveshaft -> twin-differential steering (like the Sherman's controlled differential) ----------
STEP=3;
cyl("3708","black",0,DS_Y,-3,.2,12,"z"); cyl("6538c","dbg",0,DS_Y,3,.45,2,"z"); cyl("3708","black",0,DS_Y,10,.2,12,"z");
cyl("3648","black",0,DS_Y,-8.9,1.6,.5,"z",{teeth:24,spin:1});
cyl("32270","black",0,DS_Y,14.75,.85,.5,"z",{teeth:12,spin:1});
cyl("3707","black",0,DS_Y,16,.2,8,"x",{m:ROT.id});
cyl("32269","black",.75,DS_Y,16,1.35,.5,"x",{teeth:20,spin:-.6});
[-1,1].forEach(function(sd){
  cyl("32269","black",sd*2.5,DS_Y,16,1.35,.5,"x",{teeth:20,spin:-.6});
  cyl("62821b","dbg",sd*2.5,DS_Y,SPROCKET_Z,1.8,3,"x",{teeth:28,spin:.43});
  cyl("3707","black",sd*7.5,DS_Y,SPROCKET_Z,.2,8,"x",{m:ROT.id});
});
cyl("32270","black",0,DS_Y,17.25,.85,.5,"z",{teeth:12});
cyl("4519","black",0,DS_Y,17.8,.2,1.5,"z");
cyl("32270","black",0,DS_Y,18.2,.85,.5,"z",{teeth:12});
cyl("4519","black",0,DS_Y+.8,18.95,.2,7.5,"y");
cyl("32270","black",0,DS_Y+.8,18.95,.85,1.25,"y",{teeth:12});
cyl("32270","black",0,16,18.95,.85,1.25,"y",{teeth:12});
cyl("4519","black",0,17.4,16.8,.2,3,"z");
cyl("32270","black",0,17.4,18.2,.85,.5,"z",{teeth:12});

// Ford GAA V8 above the XL motor; crank geared 1:1 (24T/24T) to the driveshaft so the pistons move with the tracks
cyl("3648","black",0,CR_Y,-8.9,1.6,.5,"z",{teeth:24,spin:-1});
[-10.4,-12.7,-15,-17.3].forEach(function(z){cyl("2853","dbg",0,CR_Y,z,.45,2,"z")});
var ENG=[], S2=Math.SQRT1_2;
[[-1,-10.5],[1,-11.5]].forEach(function(b){for(var i=0;i<4;i++){
  var z=b[1]-2*i, dir=[b[0]*S2,S2,0], phase=(i%2?Math.PI:0)+(i>1?Math.PI/2:0)+(b[0]>0?Math.PI/4:0);
  var c=[dir[0]*2.9,CR_Y+dir[1]*2.9/0.4,z];
  PARTS.push({step:STEP,part:"2850b",color:"lbg",kind:"tcyl",c:c,dir:dir,r:1.5,len:2.6,ld:null});
  ENG.push({z:z,dir:dir,phase:phase});
  PARTS.push({step:STEP,part:"2851",color:"yellow",kind:"piston",eng:ENG.length-1,ld:null});
  PARTS.push({step:STEP,part:"2852",color:"lbg",kind:"conrod",eng:ENG.length-1,ld:null});
}});
[-1,1].forEach(function(sd){cyl("3941","lbg",sd*5.5,21,-14,1,3,"y")});

// ---------- HVSS: fixed bogie bracket, two swing arms, shock absorber; rubber-tyred dual road wheels ----------
STEP=4;
function tyredWheel(x,y,z){
  cyl("56145","lbg",x,y,z,1.9,2.5,"x",{wheel:1}).roll=TIRE_R;
  PARTS.push({step:STEP,part:"55978",color:"black",kind:"tire",cx:x,cy:y,cz:z,r:TIRE_R,ri:1.9,len:2.7,axis:"x",ld:ld(x,y,z,ROT.rz90)});
}
[-1,1].forEach(function(sd){
  var X=sd*ARM_X;
  BOGIES.forEach(function(c){
    cyl("6558","blue",sd*6.5,BRACKET_Y,c,.22,3,"x",{m:ROT.id});
    PARTS.push({step:STEP,part:"32316",color:"lbg",kind:"rod",a:[sd*BRK_X,BRACKET_Y,c-2],b:[sd*BRK_X,BRACKET_Y,c+2],w:.5,h:.95,ld:ld(X,BRACKET_Y,c,ROT.ry90)});
    [-1,1].forEach(function(e){
      var s=c+3*e;
      PARTS.push({step:STEP,part:"32523",color:"lbg",kind:"rod",a:[X,BRACKET_Y,c+1.5*e],b:[X,WHEEL_Y,s],w:.5,h:.85,ld:ld(X,(BRACKET_Y+WHEEL_Y)/2,c+2.25*e,ROT.id)});
      cyl("32073","black",sd*9.4,WHEEL_Y,s,.2,5,"x",{m:ROT.id});
      WX.forEach(function(ax){tyredWheel(sd*ax,WHEEL_Y,s)});
    });
  });
  [0,1].forEach(function(j){var m=(BOGIES[j]+BOGIES[j+1])/2,z0=m-3.25,z1=m+3.25;PARTS.push({step:STEP,part:"731c05",color:"lbg",kind:"rod",a:[X,10.3,z0],b:[X,10.3,z1],ax:"y",ld:null})});
  WX.forEach(function(ax){cyl("57519","black",sd*ax,AXLE_Y,SPROCKET_Z,SPR_R,1.8,"x",{wheel:3})});
  cyl("3706","black",sd*8.5,AXLE_Y,IDLER_Z,.2,6,"x",{m:ROT.id});
  WX.forEach(function(ax){cyl("56145","lbg",sd*ax,AXLE_Y,IDLER_Z,1.9,2.5,"x",{wheel:1})});
});

// ---------- tracks: belt around road wheels, return rollers, sprocket, idler ----------
STEP=5;
var TRACK_T=0.36, TRACK=null;
(function(){
  var circ=STATIONS.map(function(z){return [z,WHEEL_Y*0.4,TIRE_R+TRACK_T]})
    .concat(ROLLERS.map(function(z){return [z,AXLE_Y*0.4,1.5+TRACK_T]}))
    .concat([[SPROCKET_Z,AXLE_Y*0.4,SPR_R+TRACK_T],[IDLER_Z,AXLE_Y*0.4,1.9+TRACK_T]]);
  var pts=[];circ.forEach(function(c){for(var i=0;i<96;i++){var a=i/96*Math.PI*2;pts.push([c[0]+Math.cos(a)*c[2],c[1]+Math.sin(a)*c[2]])}});
  pts.sort(function(a,b){return a[0]-b[0]||a[1]-b[1]});
  function cr(o,a,b){return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])}
  var lo=[],hi=[];
  pts.forEach(function(p){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)});
  pts.slice().reverse().forEach(function(p){while(hi.length>1&&cr(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop();hi.push(p)});
  var poly=lo.slice(0,-1).concat(hi.slice(0,-1)), per=0, seg=[];
  for(var i=0;i<poly.length;i++){var a=poly[i],b=poly[(i+1)%poly.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,L,per]);per+=L}
  var n=Math.round(per/PITCH), pitch=per/n, rows=[-WX[0],WX[0]];
  TRACK={seg:seg,per:per,n:n,pitch:pitch,rows:rows};
  rows.forEach(function(ax){
    var s=0;
    for(var k=0;k<n;k++){
      var d=k*pitch;while(seg[s][3]+seg[s][2]<d)s++;
      var g=seg[s],f=(d-g[3])/g[2],z=g[0][0]+(g[1][0]-g[0][0])*f,yy=g[0][1]+(g[1][1]-g[0][1])*f,ang=Math.atan2(g[1][1]-g[0][1],g[1][0]-g[0][0]);
      var c=Math.cos(-ang),sn=Math.sin(-ang);
      PARTS.push({step:STEP,part:"57518",color:"dbg",kind:"mlink",
        ld:{x:ax*20,y:-yy/0.4*8,z:-z*20,m:"1 0 0 0 "+c.toFixed(4)+" "+(-sn).toFixed(4)+" 0 "+sn.toFixed(4)+" "+c.toFixed(4)}});
    }
  });
})();

// ---------- deck ----------
var deckRes=new Set();
function res(x0,x1,z0,z1){for(var x=x0;x<x1;x++)for(var z=z0;z<z1;z++)deckRes.add(key(x,z))}
res(-4,4,-4,4); res(3,6,-2,12); res(-5,-3,12,14); res(3,5,12,14); res(-5,-4,14,15); res(4,5,14,15);
res(-8,8,-15,-8); res(-8,8,-19,-15); res(-10,-9,-20,-19); res(9,10,-20,-19);
res(-10,-9,-6,10); res(9,10,-6,10); res(-9,-7,15,16); res(8,10,15,16); res(-6,-4,-20,-19); res(4,6,-20,-19); res(5,6,15,16);
res(-10,-8,-9,-7); res(8,10,-9,-7); res(-10,-9,-14,-13); res(9,10,-14,-13); res(-10,-9,-11,-10); res(9,10,-11,-10); res(-9,-8,-4,8); res(8,9,-4,8);
STEP=7;
var deck=rectCells([[-10,10,-20,16]]);deckRes.forEach(function(k){deck.delete(k)});
pack(deck,TILE,"z",function(part,x0,x1,z0,z1){box(part,"olive",x0,x1,z0,z1,31,1,{studs:false})});
for(var gz=-15;gz<-8;gz++)for(var gx=-8;gx<8;gx+=2)box("2412b","olive",gx,gx+2,gz,gz+1,31,1,{studs:false});

STEP=8;
[[-5,-3],[3,5]].forEach(function(xx){box("14769","olive",xx[0],xx[1],12,14,31,1,{kind:"round",studs:false})});
slope("54200","black",-5,-4,14,15,31,2,"+z","c30"); slope("54200","black",4,5,14,15,31,2,"+z","c30");
[-1,1].forEach(function(sd){
  var a=sd<0?-10:9, b=sd<0?-9:8;
  box("2431","brown",a,a+1,-6,-2,31,1,{studs:false}); box("3069","silver",a,a+1,-2,0,31,1,{studs:false});
  box("6636","dbg",a,a+1,0,6,31,1,{studs:false}); box("2431","brown",a,a+1,6,10,31,1,{studs:false});
  box("2431","brown",b,b+1,-4,0,31,1,{studs:false}); box("3070","silver",b,b+1,0,1,31,1,{studs:false});
  box("3069","olive",b,b+1,1,3,31,1,{studs:false}); box("2431","olive",b,b+1,3,7,31,1,{studs:false}); box("3070","olive",b,b+1,7,8,31,1,{studs:false});
  cyl("98138","red",sd*9.5,31,-19.5,.45,.67,"y");
});
PARTS.push({step:STEP,part:"4740",color:"dbg",kind:"tcyl",c:[-5.8,23.4+1.3,19.05+.55],dir:[0,S2,S2],ld:null});

var GL=Math.atan2(31*0.4-16*0.4,22-16);
[[3,8]].forEach(function(xx){for(var k=0;k<4;k++){
  var t=.22+k*.19, z=22-(22-16)*t+1.45*Math.sin(GL), y=(16+(31-16)*t)*0.4+1.45*Math.cos(GL);
  PARTS.push({step:STEP,part:"57518",color:"black",kind:"tlink",c:[(xx[0]+xx[1])/2,y/0.4,z],up:[0,S2,-S2],n:[0,S2,S2],ld:null});
}});
// lifting eyes, siren, fuel caps, exhaust deflector
[[-9,15,"+z"],[8,15,"+z"],[-6,-20,"-z"],[4,-20,"-z"]].forEach(function(q){PARTS.push({step:STEP,part:"2540",color:"dbg",kind:"eye",cx:q[0]+1,cz:q[1]+.5,y0:31,dir:q[2],ld:null})});
cyl("4073","dbg",5.5,31,15.5,.48,1,"y"); cyl("4589","dbg",5.5,32,15.5,.45,3,"y");
[[-10,-14],[9,-14],[-10,-11],[9,-11]].forEach(function(q){cyl("98138","dbg",q[0]+.5,31,q[1]+.5,.42,.4,"y")});
// sand-shield rails, side tool brackets, fenders over sprocket and idler, tow pintle
[-1,1].forEach(function(sd){
  for(var q=0;q<13;q++)PARTS.push({step:STEP,part:"2412b",color:"olive",kind:"vtile",cx:sd*10.2,cy:17.5,cz:-14.5+2*q,n:sd,ld:null});
  for(var q2=0;q2<4;q2++)virt("99781","dbg",ld(sd*10,16,-14+7*q2,ROT.id));
  [-9].forEach(function(z){PARTS.push({step:STEP,part:"3069",color:"olive",kind:"vtile",cx:sd*10.2,cy:21,cz:z,n:sd,ld:null});virt("87087","olive",ld(sd*9.5,21,z,ROT.id))});
  box("3036","olive",sd<0?-12:6,sd<0?-6:12,14,22,18,1);
  box("4070","dbg",sd<0?-10:9,sd<0?-9:10,21,22,19,3,{kind:"headlight"}); cyl("98138","tclear",sd*9.5,20.3,22.2,.45,.27,"z");
  box("3032","olive",sd<0?-12:6,sd<0?-6:12,-20,-16,18,1);
  box("3003","dtan",sd<0?-10:8,sd<0?-8:10,-9,-7,31,3); slope("15068","dtan",sd<0?-10:8,sd<0?-8:10,-9,-7,34,2,"+z","curve");
});
PARTS.push({step:STEP,part:"6536",color:"dbg",kind:"pintle",cx:0,cy:12.5,cz:-21.4,ld:ld(0,12.5,-21.4,ROT.id)});

PARTS.push({step:STEP,part:"3034",color:"olive",kind:"rod",a:[0,21.5,-21.25],b:[0,27,-22.6],w:12,h:.32,ld:ld(-2,24,-21.8,ROT.id)});
virt("3034","olive",ld(2,24,-21.8,ROT.id));

PARTS.push({step:STEP,part:"56145",color:"lbg",kind:"tcyl",c:[-1.5,23.5+4.25,19+1.7],dir:[0,S2,S2],ld:null});
PARTS.push({step:STEP,part:"55978",color:"black",kind:"ttire",c:[-1.5,23.5+4.25,19+1.7],dir:[0,S2,S2],ld:null});

// ---------- turret ring: 60T turntable turned by a worm on an M motor under the roof ----------
STEP=9;
PARTS.push({step:STEP,part:"18939",color:"dbg",kind:"ttbase",cx:0,cz:0,y0:31,h:1.5,zone:"hull",ld:ld(0,32.5,0,ROT.id)});
PARTS.push({step:STEP,part:"18938",color:"black",kind:"tttop",cx:0,cz:4,y0:32.5,h:1.5,ld:ld(0,34,4,ROT.id)});
pu("88013","dbg",3,6,1,9,18.15,9.75,"motor",{zone:"hull"});
cyl("4519","black",4.5,23,9.6,.2,1.6,"z",{zone:"hull"});
cyl("32270","black",4.5,23,9.6,.85,.5,"z",{teeth:12,zone:"hull"});
cyl("3706","black",4.5,23.6,10.35,.2,9,"y",{zone:"hull"});
cyl("32270","black",4.5,23.6,10.35,.85,1.25,"y",{teeth:12,zone:"hull"});
cyl("32270","black",4.5,31.1,10.35,.85,1.25,"y",{teeth:12,zone:"hull"});
cyl("32270","black",4.25,32.4,9.6,.85,.5,"z",{teeth:12,zone:"hull"});
cyl("3708","black",4.25,32.4,4.6,.2,12,"z",{zone:"hull"});
cyl("4716","dbg",4.25,32.4,0,.65,2,"z",{teeth:1,zone:"hull"});
var TCZ=4, MANT=[-3,3,8,13];
var T=[
  {y:34,s:ellipse(6.5,6.5,8.5,TCZ)},
  {y:37,s:ellipse(7,7,9,TCZ,[MANT])},
  {y:40,s:ellipse(6.5,6,8.5,TCZ,[MANT])},
  {y:43,s:ellipse(5.5,4.5,7.5,TCZ)}
];
T.forEach(function(l,i){
  if(i===2)STEP=10;
  shellLayer({shape:l.s,y:l.y,pref:i%2?"z":"x",up:i<3?T[i+1].s:null,down:i>0?T[i-1].s:null});
  if(i===1){var m=rectCells([MANT]);m.delete(key(-1,12));m.delete(key(0,12));
    box("3700","dbg",-1,1,12,13,37,3,{m:ROT.id}); pack(m,BRICK,"z",function(p,a,b,c,d){box(p,"olive",a,b,c,d,37,3)})}
  if(i===2)pack(rectCells([MANT]),BRICK,"x",function(p,a,b,c,d){box(p,"olive",a,b,c,d,40,3)});
});
var roofRes=new Set();
function rres(x0,x1,z0,z1){for(var x=x0;x<x1;x++)for(var z=z0;z<z1;z++)roofRes.add(key(x,z))}
rres(-5,-1,0,4); rres(0,2,-2,0); rres(2,4,1,3); rres(3,4,4,5); rres(-3,-2,6,7); rres(1,3,6,8); rres(3,4,-3,-2);
rres(-3,-1,-3,-1); rres(1,3,-4,-2); 
var roof=new Set(T[3].s);roofRes.forEach(function(k){roof.delete(k)});
pack(roof,TILE,"z",function(part,x0,x1,z0,z1){box(part,"olive",x0,x1,z0,z1,46,1,{studs:false})});
pack(rectCells([[-3,3,8,11]]),TILE,"z",function(part,x0,x1,z0,z1){box(part,"olive",x0,x1,z0,z1,43,1,{studs:false})});
[-3,-1,1].forEach(function(x){slope("3039","olive",x,x+2,11,13,43,3,"+z","s45")});

// ---------- 76mm M1A2 with muzzle brake ----------
STEP=11;
var GY=38.8, gz=13;
cyl("50451","black",0,GY,20,.2,16,"z"); cyl("3707","black",0,GY,32,.2,8,"z");
function barrel(part,color,r,len,n){for(var i=0;i<n;i++){cyl(part,color,0,GY,gz+len/2,r,len,"z");gz+=len}}
barrel("3941","olive",1,1.2,3); barrel("6538c","dbg",.48,2,9);
box("32064","dbg",-1,1,gz,gz+1,GY-1.75,3,{m:ROT.id}); box("3022","dbg",-1,1,gz-.5,gz+1.5,GY+1.25,1); box("3022","dbg",-1,1,gz-.5,gz+1.5,GY-2.75,1);
gz+=1.5;
var GUN_END=gz;

// ---------- turret fittings ----------
STEP=12;
cyl("87081","olive",-3,46,2,2,3,"y");
cyl("60474","olive",-3,49,2,2,1,"y");
cyl("3062b","dbg",.5,46,-1.5,.48,3,"y");
box("3004","black",0,1,-2,0,49,3); box("3004","dbg",1,2,-2,0,46,3);
cyl("63965","black",.5,50.5,3,.16,6,"z");
box("14769","olive",2,4,1,3,46,1,{kind:"round",studs:false});
slope("54200","black",3,4,4,5,46,2,"+z","c30"); slope("54200","black",-3,-2,6,7,46,2,"+z","c30");
cyl("4032","olive",2,46,7,.98,1,"y"); cyl("98138","dbg",2,47,7,.45,.67,"y");
cyl("4073","dbg",3.5,46,-2.5,.48,1,"y",{stud:true}); cyl("2569","black",3.5,47,-2.5,.08,24,"y");
cyl("87994","black",1.8,41,14.6,.12,3,"z");
[[-2.5,38.3],[2.5,38.3],[-2.5,41.7],[2.5,41.7]].forEach(function(q){cyl("98138","dbg",q[0],q[1],13.25,.3,.18,"z")});
box("3666","olive",-3,3,13,14,43,1,{studs:false});
PARTS.push({step:STEP,part:"4032",color:"olive",kind:"tcyl",c:[7.15,38.5,2],dir:[1,0,0],r:.95,len:.4,ld:ld(7.15,38.5,2,ROT.rz90)});



// ---------- Fury's field stowage ----------
STEP=13;
[-1,1].forEach(function(sd){
  for(var k=0;k<3;k++){
    var x=sd*(11.45+(k===1?.25:0)), y=19.6+5*k;
    for(var i=0;i<14;i++)cyl("3941","brown",x,y,-6+1.2*i+.6,1,1.2,"z");
    virt("3708","black",ld(x,y,-0.5,ROT.rx90)); virt("3708","black",ld(x,y,9,ROT.rx90));
  }
  [-3,8].forEach(function(z){PARTS.push({step:STEP,part:"STRING",color:"black",kind:"strap",x:sd*11.6,z:z,ld:null})});
});
box("3008","brown",-8,0,21,22,19,3); box("3622","brown",0,3,21,22,19,3);
box("3001","brown",-8,-4,-19,-17,31,3); box("3001","brown",-8,-4,-17,-15,31,3);
box("3001","brown",-8,-4,-19,-17,34,3); box("3001","brown",-8,-4,-17,-15,34,3);
box("87079","brown",-8,-4,-19,-17,37,1,{studs:false}); box("87079","brown",-8,-4,-17,-15,37,1,{studs:false});
[[-4,-2],[-2,0]].forEach(function(xx,j){[-19,-17].forEach(function(z){box("3003","tan",xx[0],xx[1],z,z+2,31,3);
  slope("15068","tan",xx[0],xx[1],z,z+2,34,2,j?"-x":"+x","curve")})});
box("3003","dtan",0,2,-19,-17,31,3); box("3003","dtan",2,4,-19,-17,31,3);
cyl("4073","silver",.5,34,-18.5,.48,1,"y",{stud:true}); cyl("4073","silver",2.5,34,-18.5,.48,1,"y",{stud:true});
box("3001","olive",0,4,-17,-15,31,3); box("87079","olive",0,4,-17,-15,34,1,{studs:false});
box("3001","tan",4,8,-19,-17,31,3); box("3001","tan",4,8,-17,-15,31,3);
box("3001","tan",4,8,-19,-17,34,3); box("3001","tan",4,8,-17,-15,34,3);
box("87079","tan",4,8,-19,-17,37,1,{studs:false}); box("87079","tan",4,8,-17,-15,37,1,{studs:false});
[-1,1].forEach(function(sd){
  for(var b=0;b<4;b++)cyl("3941",sd<0?"tan":"dtan",sd*8.05,41,-4+1.2*b+.6,1,1.2,"z",{zone:"tur"});
  [-3.2,-.8].forEach(function(z){PARTS.push({step:STEP,part:"STRING",color:"black",kind:"band",cx:sd*8.05,cy:41,cz:z,r:1.05,zone:"tur",ld:null})});
});
PARTS.push({step:STEP,part:"56145",color:"lbg",kind:"tcyl",c:[6,41.4,-17],dir:[0,1,0],r:1.9,len:2.5,ld:ld(6,40,-17,ROT.id)});
PARTS.push({step:STEP,part:"55978",color:"black",kind:"ttire",c:[6,41.4,-17],dir:[0,1,0],r:TIRE_R,ri:1.9,len:2.7,ld:ld(6,40,-17,ROT.id)});
PARTS.push({step:STEP,part:"56145",color:"lbg",kind:"tcyl",c:[-11.45,25,-13],dir:[-1,0,0],r:1.9,len:2.5,ld:ld(-11.45,23.5,-13,ROT.rz90)});
PARTS.push({step:STEP,part:"55978",color:"black",kind:"ttire",c:[-11.45,25,-13],dir:[-1,0,0],r:TIRE_R,ri:1.9,len:2.7,ld:ld(-11.45,23.5,-13,ROT.rz90)});
virt("3705","black",ld(-10.5,23.5,-13,ROT.id)); virt("87087","olive",ld(-9.5,23.5,-13,ROT.id));
box("3003","tan",-3,-1,-3,-1,46,3,{zone:"tur"}); slope("15068","tan",-3,-1,-3,-1,49,2,"+z","curve",{zone:"tur"});
box("3003","olive",1,3,-4,-2,46,3,{zone:"tur"}); box("3068","olive",1,3,-4,-2,49,1,{studs:false,zone:"tur"});

PARTS.forEach(function(p){if(!p.zone)p.zone=p.step===11?"gun":(p.step===9||p.step===10||p.step===12)?"tur":"hull"});
var TDZ=-4;
PARTS.forEach(function(p){if(p.zone!=="tur"&&p.zone!=="gun")return;
  ["z0","z1","cz"].forEach(function(k){if(typeof p[k]==="number")p[k]+=TDZ});
  ["c","a","b"].forEach(function(k){if(p[k]&&p[k].length===3)p[k][2]+=TDZ});
  if(p.ld)p.ld.z-=TDZ*20;});
GUN_END+=TDZ; TCZ+=TDZ;

var STEPS=[
 {t:"中空下車體",s:"留出動力艙空間",i:["底板用 6 格寬平板左右各一排，每片都接到側牆；車尾中央留開口讓 XL 馬達下緣穿過。","往上疊 3 層磚、2 層 plate：側牆 2 格厚、前後牆 1 格厚，中間全部留空。","第 2 層兩側埋 Technic 孔磚給主動輪與誘導輪；第 3 層埋孔磚給 3 組轉向架。","車首用倒斜磚一層層外推，做出圓弧變速箱蓋。"]},
 {t:"動力系統",s:"Powered Up 4 顆元件",i:["XL 馬達（22172）放在車尾引擎艙，等於真車引擎位置，負責前進後退。","L 馬達（22169）放在車首上方負責轉向；另一顆 L 馬達放在右側車頂下方負責砲塔。","Control+ Technic Hub（22127）放在車體中段：A 埠 XL 馬達、B 埠轉向、C 埠砲塔、D 埠大燈 LED（22168）。"]},
 {t:"傳動系統",s:"傳動軸＋雙差速器轉向",i:["XL 馬達往前接傳動軸（Axle 12＋2L 軸連接器＋Axle 8），跑到車首。","傳動軸末端 12T 斜齒輪咬合橫向軸上的 20T；橫軸兩端的 20T 與左右兩顆 28T 差速器中心距 3 格，兩側同向轉＝直行。","轉向馬達經直立軸，用 12T 斜齒輪夾在兩顆差速器中間，讓兩側一快一慢＝轉彎，可原地轉向。","差速器外側接 Axle 8 直接帶動 Ø40 主動輪。","車尾 V8：曲軸上的 24T 與傳動軸上的 24T 上下相距 3 格咬合（1:1），8 組汽缸、活塞、連桿呈 90° V 形，上方兩個空氣濾清器。"]},
 {t:"HVSS 懸吊",s:"每側 3 組可動轉向架",i:["Technic Pin 3L 穿過車體孔磚，依序串起 1×5 轉向架樑與 1×3 擺臂。","每組轉向架掛兩支擺臂，擺臂下端穿 Axle 5，套一個 30.4mm 輪框加 37×22 ZR 橡膠胎。","相鄰兩組轉向架的擺臂之間橫裝 6.5L 避震器（731c05），間距剛好 6.5 格。","前方 Ø40 主動輪、後方誘導輪。"]},
 {t:"履帶",s:"5 格寬寬版履帶",i:["Technic Link Tread Wide（5 格寬）每側串成一條環，套在負重輪外。","上緣靠在輪胎頂上，前後繞過主動輪與誘導輪。"]},
 {t:"上車體與 47° 首上",s:"同樣中空外牆",i:["上車體加寬到 20 格；履帶上方的部分疊實心當翼子板底。","首上斜面依序 45°、33°、45°、33°，接近真車 47° 傾角。","前角裝大燈（內藏 LED），車尾用 45° 斜磚收邊。"]},
 {t:"可拆式車頂",s:"換電池從這裡打開",i:["三層 plate 交錯疊成車頂，直接壓在外牆上，方便拿下來換 Hub 電池；中央開孔裝砲塔轉盤，右側開孔讓砲塔蝸桿穿出。","甲板用 Tile 鋪平；車尾鋪 Tile 1×2 Grille 當引擎格柵。"]},
 {t:"車體裝備",s:"",i:["駕駛與副駕駛艙蓋、潛望鏡；首上四角吊環、警笛。","首上：右側 .30 機槍球座、中間備用負重輪、左側兩排備用履帶；大燈加護框。","兩側工具、油箱蓋、帆布袋、車尾尾燈、吊環、拖鉤，以及斜擋的排氣導流板。","車身兩側沿翼子板加防沙邊條（Grille Tile 側裝），側板加工具支架；主動輪與誘導輪上方蓋擋泥板。"]},
 {t:"砲塔驅動與下層",s:"60T 轉盤＋蝸桿",i:["Technic 60T 轉盤（18939＋18938）嵌在車頂開孔裡。","砲塔 L 馬達吊在車頂下方，直立軸往上經 12T 斜齒輪轉向，帶動蝸桿咬合轉盤外齒（中心距 4.25 格）；蝸桿自鎖，砲塔停下不會亂轉。","砲塔第 1、2 層與防盾下層，防盾正中放橫向孔磚當砲耳。"]},
 {t:"砲塔上層",s:"鑄造弧面",i:["每層沿橢圓邊緣往內收，斜磚做出鑄造砲塔的圓弧。","防盾頂部 Tile 與 2×2 斜磚收尾，砲塔頂鋪 Tile。"]},
 {t:"76mm 主砲",s:"砲口制退器",i:["Axle 16 從砲耳穿出，套 3 個圓磚 2×2（砲根）、7 個 Axle Connector 2L（砲管）。","前端 Axle 4 接兩個 Technic Brick 1×2 with Axle Hole，上下夾 Plate 2×2，做成方形制退器。"]},
 {t:"砲塔配件",s:"車長塔、.50 重機槍",i:["右後方車長觀測塔與艙蓋。","塔後立柱架 .50 重機槍：黑色 1×2 機匣、Bar 6L 槍管、旁邊彈藥箱。","防盾右側同軸機槍、左側瞄準鏡孔；裝填手艙蓋、通風罩、吊環、天線。","車長塔一圈 6 片透明黑觀測窗；砲塔尾部掛儲物箱；防盾加螺栓頭與上方雨罩；左側手槍射擊孔。"]},
 {t:"戰場堆積物",s:"完成！",i:["車體兩側各綁 3 根原木（紅棕色圓磚 2×2 穿 Axle 12），用 LEGO 帶凸點編織繩（14225）綁兩道。","車首下緣橫一根木樑，用側面凸點磚固定。","車尾堆木箱、帆布袋、油桶、彈藥箱，箱頂再放一個備用負重輪；右側車身掛另一個備用輪。","砲塔兩側各綁一卷睡袋（圓磚 2×2 串在軸上），砲塔後方再放帆布袋與彈藥箱。"]}
];
var DIMS={len:GUN_END+22.6,wid:22};

function toLDraw(){
  function f(n){n=Math.round(n*100)/100;return (Object.is(n,-0)?0:n).toString()}
  var out=["0 M4A3E8 Sherman Easy Eight \"Fury\" (1:18, motorized)","0 Name: FURY.ldr","0 Author: Claude","0 !LDRAW_ORG Unofficial_Model",""];
  for(var s=1;s<=STEPS.length;s++){
    PARTS.forEach(function(p){if(p.step!==s||!p.ld)return;var L=p.ld;
      out.push(["1",COLORS[p.color].ld,f(L.x),f(L.y),f(L.z),L.m,p.part+".dat"].join(" "))});
    out.push("0 STEP");
  }
  return out.join("\n")+"\n";
}
