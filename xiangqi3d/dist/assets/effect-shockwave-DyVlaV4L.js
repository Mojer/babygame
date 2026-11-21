import{r as e}from"./three.module-DxJRsRpu.js";var t=(function(e,t){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var n=Object.create,r=Object.defineProperty,i=Object.getOwnPropertyDescriptor,a=Object.getOwnPropertyNames,o=Object.getPrototypeOf,s=Object.prototype.hasOwnProperty,c=(e,t,n,o)=>{if(t&&typeof t==`object`||typeof t==`function`)for(var c=a(t),l=0,u=c.length,d;l<u;l++)d=c[l],!s.call(e,d)&&d!==n&&r(e,d,{get:(e=>t[e]).bind(null,d),enumerable:!(o=i(t,d))||o.enumerable});return e};t=((e,t,i)=>(i=e==null?{}:n(o(e)),c(r(i,`default`,{value:e,enumerable:!0}),e)))(t,1);function l(e,t){let n=e,r=[{name:`1 · 現況`,flash:1,burst:1,arc:1,crack:1,energy:1,note:`A 原本體＋第 3 級光暈`},{name:`2 · 加強`,flash:1.5,burst:1.25,arc:1.15,crack:1.1,energy:1.2,note:`＋快速破散的橙金衝擊環`},{name:`3 · 強烈`,flash:2,burst:1.5,arc:1.3,crack:1.2,energy:1.4,note:`＋六束短促放射亮焰`},{name:`4 · 猛烈`,flash:3,burst:1.8,arc:1.5,crack:1.35,energy:1.65,note:`＋八條亮頭、衰減尾跡的火星`},{name:`5 · 極誇張`,flash:4,burst:2.2,arc:1.75,crack:1.5,energy:1.9,note:`＋七塊分離燃燒碎焰`},{name:`6 · 爆裂`,flash:5,burst:2.6,arc:2,crack:1.65,energy:2.1,note:`＋五團翻捲上飄煙塵`},{name:`7 · 超載`,flash:6,burst:3,arc:2.3,crack:1.85,energy:2.3,note:`＋六塊旋轉焦黑碎片`},{name:`8 · 極限`,flash:8,burst:3.6,arc:2.7,crack:2.1,energy:2.6,note:`先行火花／持久白熱爆閃／牆面餘熱`}];function i(e,t,n,r){if(e[t].split(n).length!==2)throw Error(`Non-unique shader patch: `+n);e[t]=e[t].replace(n,r),e.needsUpdate=!0}let a=e=>Number(e).toFixed(4);function o(){let e=r[6],o=t.group.getObjectByName(`lifecycle-impact`),f=t.group.getObjectByName(`lifecycle-contact-glow`),p=t.group.getObjectByName(`lifecycle-impact-wisps`);i(o.material,`vertexShader`,`(.10+.25*grow)*(1.0-smoothstep(.07,.17,t))`,`(.10+.25*smoothstep(0.0,.06,t))*(1.0-smoothstep(.06,.18,t))*${a(e.flash)}`),i(o.material,`vertexShader`,`float reach=(.85+seed*.8)*grow`,`float reach=(.85+seed*.8)*grow*${a(e.burst)}`),i(o.material,`vertexShader`,`float radius=(.32+.75*open+max(t-.1,0.0)*.13)`,`float radius=${a(e.arc)}*(.32+.75*open+max(t-.1,0.0)*.13)`),i(o.material,`fragmentShader`,`heat=.96;alpha=1.0-smoothstep(.075,.15,t);`,`heat=.96;alpha=1.0-smoothstep(.06,.18,t);`),i(o.material,`fragmentShader`,`if(alpha<.005)discard;`,`if(vPart<.5)c*=${a(e.energy)};if(alpha<.005)discard;`),i(p.material,`vertexShader`,`(right*position.x+up*position.y)*1.8`,`(right*position.x+up*position.y)*1.8*${a(e.crack)}`),i(f.material,`vertexShader`,`position.xy*uSize`,`position.xy*${a(e.flash)}*uSize`),i(f.material,`fragmentShader`,`float flash=exp(-r*32.0)*(1.0-smoothstep(.055,.11,t));`,`float flash=exp(-r*32.0)*(.25+.75*smoothstep(0.0,.06,t))*(1.0-smoothstep(.06,.18,t));`),i(f.material,`fragmentShader`,`exp(-r*5.8)`,`exp(-r*5.8*${a(e.flash*e.flash)})`),i(f.material,`fragmentShader`,`gl_FragColor=vec4(c,flash*.95+halo);`,`gl_FragColor=vec4(c*${a(e.energy)},flash*.95+halo);`),i(o.material,`vertexShader`,`grow=1.0-exp(-t*34.0)`,`grow=1.0`),i(o.material,`vertexShader`,`float radius=${a(e.arc)}*`,`float radius=${a(e.arc*1.35)}*`),i(p.material,`vertexShader`,`(right*position.x+up*position.y)*1.8*${a(e.crack)}`,`(right*position.x+up*position.y)*1.8*${a(e.crack*1.35)}`),i(o.material,`vertexShader`,`float reach=(.85+seed*.8)*grow*${a(e.burst)}`,`float reach=(.85+seed*.8)*.80*${a(e.burst)}`),i(o.material,`vertexShader`,`float width=sin(pow(h,.7)*3.141593)*(.10+seed*.035)*retire`,`float width=(.035+seed*.026)*sin(h*3.141593)`),i(o.material,`vertexShader`,`ray*(h*reach)+side*sin(h*3.141593)*.035*sin(aPart+t*14.0)`,`ray*(h*reach+t*(7.0+seed*4.0))`),i(o.material,`fragmentShader`,`*smoothstep(0.0,.015,t)`,``),i(o.material,`fragmentShader`,`1.0-smoothstep(.085,.20,t)`,`1.0-smoothstep(.02,.09,t)`),i(o.material,`vertexShader`,`+t*.26+h*span`,`+t*(id<1.5?4.5:-3.8)+h*span`),i(f.material,`fragmentShader`,`(.25+.75*smoothstep(0.0,.06,t))*(1.0-smoothstep(.06,.18,t))`,`(1.0-smoothstep(.012,.12,t))`),i(f.material,`vertexShader`,`(.5+(1.0-exp(-uImpactProgress*68.0))*.5)`,`1.0`),f.material.uniforms.uPreviewBloomPass={value:0},f.material.fragmentShader=`uniform float uPreviewBloomPass;
`+f.material.fragmentShader,i(f.material,`fragmentShader`,`flash*.95+halo`,`flash*.55*mix(1.0,.25,uPreviewBloomPass)+halo`),i(f.material,`fragmentShader`,`(1.0-smoothstep(.012,.12,t))`,`step(.05,t)*(1.0-smoothstep(.11,.35,t))`),i(f.material,`fragmentShader`,`(1.0-smoothstep(.06,.20,t))`,`step(.05,t)*(1.0-smoothstep(.11,.35,t))`),i(o.material,`fragmentShader`,`1.0-smoothstep(.02,.09,t)`,`step(.05,t)*(1.0-smoothstep(.11,.22,t))`),i(o.material,`vertexShader`,`ray*(h*reach+t*(7.0+seed*4.0))`,`ray*(h*reach+max(t-.11,0.0)*(.09/.24)*(7.0+seed*4.0))`),i(o.material,`vertexShader`,`p=vec3(recoil,0,0)+ray*`,`p=vec3(.05+max(max(t-.11,0.0)*(.09/.24)-.015,0.0)*1.2,0,0)+ray*`),i(p.material,`vertexShader`,`float age=max(0.0,t-.015);`,`float begin=seed*.035,end=.85+seed*.25;float age=max(0.0,t-begin)*(.385+seed*.40)/(end-begin);`),i(p.material,`vertexShader`,`age*(4.0+seed*2.5)/(1.0+age*2.0)`,`1.25*age*(4.0+seed*2.5)/(1.0+age*2.0)`),i(p.material,`fragmentShader`,`*smoothstep(.015,.045,t)*(1.0-smoothstep(.20+seed*.25,.40+seed*.40,t))`,`*smoothstep(seed*.035,seed*.035+.015,t)*(1.0-smoothstep(.185+seed*.25,.385+seed*.40,max(0.0,t-seed*.035)*(.385+seed*.40)/(.85+seed*.25-seed*.035)))`),i(p.material,`fragmentShader`,`float cooling=smoothstep(1.1,2.0,t),retire=1.0-smoothstep(1.35+r*.22,2.0,t);`,`float cooling=smoothstep(.60,2.0,t),retire=1.0-smoothstep(1.35+r*.22,2.0,t);`),i(p.material,`fragmentShader`,`c=mix(c,vec3(1.0,.86,.40),pow(heat,4.0));`,`c=mix(c,vec3(1.0,.86,.40),pow(heat,4.0));
            // Irregular heat conducts away from the cracks, not a uniform red decal.
            float grain=noise2(q*6.0+vec2(3.7,8.2)),fine=noise2(q*17.0+vec2(2.1,4.9));
            float spread=exp(-min(mainLine,twig)*(5.0+grain*5.0));
            float area=(1.0-smoothstep(.48,.83,r+(grain-.5)*.18))*spread*(.32+.68*grain);
            float hotReveal=smoothstep(.12+r*.14,.42+r*.18,t);
            float coolMask=1.0-smoothstep(.60+grain*.30,1.75+grain*.25,t);
            float heated=area*hotReveal*coolMask;
            float spot=pow(grain,3.0)*exp(-min(mainLine,twig)*23.0)*(1.0-cooling);
            vec3 heatColor=mix(vec3(.32,.008,.001),vec3(1.0,.19,.015),1.0-cooling);
            heatColor=mix(heatColor,vec3(1.0,.63,.12),spot);
            float heatAlpha=heated*(1.10+.30*fine);
            c=(c*alpha+heatColor*heatAlpha)/max(alpha+heatAlpha,.0001);
            alpha=min(1.0,alpha+heatAlpha);`),f.material.uniforms.uImpactSurface=o.material.uniforms.uImpactSurface,f.material.uniforms.uImpactPlaneNormal=o.material.uniforms.uImpactPlaneNormal,f.material.vertexShader=`uniform float uImpactSurface;uniform vec3 uImpactPlaneNormal;
`+f.material.vertexShader,i(f.material,`vertexShader`,`void main(){vUv=uv;vec4 mv=`,`void main(){vUv=uv;if(uImpactSurface>.5){vec3 n=normalize(uImpactPlaneNormal),helper=abs(n.y)<.9?vec3(0,1,0):vec3(0,0,1);vec3 right=normalize(cross(helper,n)),up=cross(n,right);vec3 surfacePosition=(right*position.x+up*position.y)*${a(e.flash)}*uSize*(.35+.65*uLifeOrigin)+n*.035*uSize;gl_Position=projectionMatrix*modelViewMatrix*vec4(surfacePosition,1.0);return;}vec4 mv=`);let m=s(f,e),h=c(o),g=l(6,o.material.uniforms,e);t.group.add(g);let _=g.geometry.groups.map(e=>({start:e.start,count:e.count})),v=g.geometry.index,y=g.geometry.attributes.aKind,b=_[0].start;for(;b<_[0].start+_[0].count&&y.getX(v.getX(b))<1.5;)b+=3;let x=new n.Matrix4,S=new n.Matrix3,C=new n.Vector3,w=new n.Vector3,T=new n.Vector3(0,1,0),E=()=>{{let e=o.material.uniforms.uImpactProgress.value*2,t=g.geometry.groups;t[0].start=e>=.4?b:_[0].start,t[0].count=e>=1.1?0:_[0].start+_[0].count-t[0].start,t[1].count=e>=.38&&e<1.4?_[1].count:0,t[2].count=e>=.13&&e<.825?_[2].count:0;for(let e=0;e<t.length;e++)g.material[e].visible=t[e].count>0}g.position.copy(o.position),g.quaternion.copy(o.quaternion),g.visible=o.material.uniforms.uImpact.value>.5&&o.material.uniforms.uImpactProgress.value<.72;{let e=o.material.uniforms;f.visible=o.visible&&e.uImpact.value>.5&&e.uImpactProgress.value>=.05/2&&e.uImpactProgress.value<.35/2}if(g.visible){f.quaternion.copy(o.quaternion),g.updateWorldMatrix(!0,!1),x.copy(g.matrixWorld).invert(),S.setFromMatrix4(x),C.set(1,0,0).transformDirection(g.matrixWorld),w.crossVectors(T,C),w.lengthSq()<1e-8?w.set(0,0,1):w.normalize();let e=g.material[0].uniforms;e.uDebrisSlope.value=C.y,e.uDebrisForward.value.copy(C).applyMatrix3(S),e.uDebrisSide.value.copy(w).applyMatrix3(S),e.uDebrisUp.value.copy(T).applyMatrix3(S)}},D=t.update.bind(t),O=t.hit.bind(t);t.update=e=>{D(e),E()},t.hit=(...e)=>{O(...e),E()},E();{let e=t.setOptions.bind(t);t.setOptions=(...t)=>{e(...t),E()};let n=t.reset.bind(t),r=t.stop.bind(t);t.reset=(...e)=>{n(...e),E()},t.stop=()=>{r(),E()}}let ee=t.dispose.bind(t),k=!1;return t.dispose=()=>{if(!k){k=!0,m&&m.dispose(),h&&h.dispose(),g.removeFromParent(),g.geometry.dispose();for(let e of g.material)e.dispose();ee()}},d(t),u(n,t),t}function s(e,t){let r=e.material,o=new n.BoxGeometry(2,2,2);e.geometry=o,r.side=n.BackSide,r.forceSinglePass=!0,r.uniforms.uFlashCameraToLocal={value:new n.Matrix4},r.uniforms.uFlashOrthographic={value:0},e.onBeforeRender=(t,n,i)=>{r.uniforms.uFlashCameraToLocal.value.copy(i.matrixWorldInverse).multiply(e.matrixWorld).invert(),r.uniforms.uFlashOrthographic.value=+!!i.isOrthographicCamera,r.uniformsNeedUpdate=!0};let s=1.6*t.flash,c=s*.32;return r.vertexShader=`uniform float uSize,uLifeOrigin,uImpactSurface,uFlashOrthographic;uniform vec3 uImpactPlaneNormal;uniform mat4 uFlashCameraToLocal;
 varying vec3 vVolumeOrigin,vVolumeRay;
 void main(){
  vec3 n=uImpactSurface>.5?normalize(uImpactPlaneNormal):vec3(1,0,0),helper=abs(n.y)<.9?vec3(0,1,0):vec3(0,0,1);
  vec3 right=normalize(cross(helper,n)),up=cross(n,right);
  float scale=uSize*(.35+.65*uLifeOrigin),bottom=uImpactSurface>.5?.035:-${a(c)},top=${a(c)};
  vec3 local=right*position.x*${a(s)}+up*position.y*${a(s)}+n*mix(bottom,top,position.z*.5+.5);
  vec4 view=modelViewMatrix*vec4(local*scale,1.0);
  if(uFlashOrthographic>.5){vVolumeOrigin=(uFlashCameraToLocal*vec4(view.xy,0,1)).xyz/scale;vVolumeRay=(uFlashCameraToLocal*vec4(0,0,-1,0)).xyz;}
  else{vVolumeOrigin=(uFlashCameraToLocal*vec4(0,0,0,1)).xyz/scale;vVolumeRay=local-vVolumeOrigin;}
  gl_Position=projectionMatrix*view;
 }`,r.fragmentShader=`uniform float uImpactSurface;uniform vec3 uImpactPlaneNormal;varying vec3 vVolumeOrigin,vVolumeRay;
 float erfLight(float x){float a=abs(x),q=1.0/(1.0+.3275911*a);float y=1.0-(((((1.061405429*q-1.453152027)*q)+1.421413741)*q-.284496736)*q+.254829592)*q*exp(-a*a);return sign(x)*y;}
 float lightIntegral(vec3 o,vec3 d,float nearT,float farT,float radial){
  vec3 weight=vec3(sqrt(radial)/${a(s)},sqrt(radial)/${a(s)},2.0/${a(c)});
  vec3 a=o*weight,b=d*weight;float aa=dot(b,b),ab=dot(a,b),closest=ab/aa;
  float perpendicular=max(0.0,dot(a,a)-ab*ab/aa);
  float integral=erfLight(sqrt(aa)*(farT+closest))-erfLight(sqrt(aa)*(nearT+closest));
  float normalization=uImpactSurface>.5?(.5+.5*abs(d.z))/erfLight(2.0*(1.0-.035/${a(c)})):.5/erfLight(2.0);
  return clamp(exp(-perpendicular)*integral*normalization,0.0,1.0);
 }
 void volumeRay(out vec3 o,out vec3 d,out float nearT,out float farT){
  vec3 n=uImpactSurface>.5?normalize(uImpactPlaneNormal):vec3(1,0,0),helper=abs(n.y)<.9?vec3(0,1,0):vec3(0,0,1);
  vec3 right=normalize(cross(helper,n)),up=cross(n,right),ray=normalize(vVolumeRay);
  o=vec3(dot(vVolumeOrigin,right),dot(vVolumeOrigin,up),dot(vVolumeOrigin,n));d=vec3(dot(ray,right),dot(ray,up),dot(ray,n));
  float bottom=uImpactSurface>.5?.035:-${a(c)};
  vec3 safeDirection=mix(vec3(-1),vec3(1),step(vec3(0),d))*max(abs(d),vec3(.000001));
  vec3 a=(vec3(-${a(s)},-${a(s)},bottom)-o)/safeDirection,b=(vec3(${a(s)},${a(s)},${a(c)})-o)/safeDirection;
  vec3 entry=min(a,b),leave=max(a,b);nearT=max(0.0,max(entry.x,max(entry.y,entry.z)));farT=min(leave.x,min(leave.y,leave.z));
  // Match the approved front profile at the contact boundary.
  if(uImpactSurface>.5)o.z-=.035;
 }
 `+r.fragmentShader,i(r,`fragmentShader`,`vec2 q=vUv*2.0-1.0;float t=uImpactProgress*2.0,r=dot(q,q);`,`vec3 o,d;float nearT,farT;volumeRay(o,d,nearT,farT);if(farT<=nearT)discard;float t=uImpactProgress*2.0;`),i(r,`fragmentShader`,`exp(-r*32.0)`,`lightIntegral(o,d,nearT,farT,32.0)`),i(r,`fragmentShader`,`exp(-r*5.8*${a(t.flash*t.flash)})`,`lightIntegral(o,d,nearT,farT,${a(5.8*t.flash*t.flash)})`),r.fragmentShader=r.fragmentShader.replace(`varying vec2 vUv;`,``),r.needsUpdate=!0,{dispose:()=>{e.onBeforeRender=()=>{},o.dispose()}}}function c(e){let t=e.geometry,r=[],i=[],a=[],o=[],s=new Map;for(let e=0;e<t.attributes.aPart.count;e++)t.attributes.aPart.getX(e)>=.5&&(s.set(e,a.length),r.push(t.attributes.position.getX(e),t.attributes.position.getY(e),t.attributes.position.getZ(e)),i.push(t.attributes.uv.getX(e),t.attributes.uv.getY(e)),a.push(t.attributes.aPart.getX(e)));for(let e=0;e<t.index.count;e+=3){let n=t.index.getX(e),r=t.index.getX(e+1),i=t.index.getX(e+2);s.has(n)&&s.has(r)&&s.has(i)&&o.push(s.get(n),s.get(r),s.get(i))}let c=new n.BufferGeometry;return c.setAttribute(`position`,new n.Float32BufferAttribute(r,3)),c.setAttribute(`uv`,new n.Float32BufferAttribute(i,2)),c.setAttribute(`aPart`,new n.Float32BufferAttribute(a,1)),c.setIndex(o),e.geometry=c,{dispose:()=>c.dispose()}}function l(e,t,r){let i=[],o=[],s=[],c=[],l=[],u=[];function d(e,t,n,r){let a=s.length;for(let a=0;a<=n;a++)for(let l=0;l<=r;l++)i.push(0,0,0),o.push(a/n,l/r),s.push(e),c.push(t);for(let e=0;e<n;e++)for(let t=0;t<r;t++){let n=a+e*(r+1)+t;l.push(n,n+1,n+r+1,n+1,n+r+2,n+r+1)}}if(d(0,0,96,6),e>=2)for(let e=0;e<6;e++)d(1,e,16,6);if(e>=3)for(let e=0;e<8;e++)d(2,e,16,4);if(e>=4)for(let e=0;e<7;e++)d(3,e,18,8);u.push([0,l.length,0]);let f=l.length;if(e>=5)for(let e=0;e<5;e++)d(4,e,1,1);if(u.push([f,l.length-f,1]),f=l.length,e>=6)for(let t=0;t<(e===6?30:6);t++)d(5,t,2,3);u.push([f,l.length-f,2]);let p=new n.BufferGeometry;p.setAttribute(`position`,new n.Float32BufferAttribute(i,3)),p.setAttribute(`uv`,new n.Float32BufferAttribute(o,2)),p.setAttribute(`aKind`,new n.Float32BufferAttribute(s,1)),p.setAttribute(`aId`,new n.Float32BufferAttribute(c,1)),p.setIndex(l);for(let[e,t,n]of u)t&&p.addGroup(e,t,n);let m={uHidden:{value:-1},uOnly:{value:-1},uProgress:t.uImpactProgress,uSurface:t.uImpactSurface,uNormal:t.uImpactPlaneNormal,uSize:t.uSize,uOrigin:t.uLifeOrigin},h=`attribute float aKind,aId;uniform float uProgress,uSize,uOrigin;uniform vec3 uNormal;varying vec2 vUv;varying float vKind,vId,vFade,vSurface;const float PI=3.14159265;
 void main(){float t=uProgress*2.0,h=uv.x,a=uv.y*PI*2.0,seed=fract(sin(aId*18.31+4.7)*4318.3);vec3 p;float fade=0.0;vUv=uv;vKind=aKind;vId=aId;
 if(aKind<.5){float age=clamp((t-.03)/.25,0.0,1.0),grow=1.0-pow(1.0-age,3.0),angle=h*PI*2.0;
 float radius=.25+grow*${a(1.25*r.arc)},width=.075*(1.0-age);float ripple=sin(angle*7.0-age*13.0)*.025;
 p=vec3(.09+age*.5,cos(angle)*(radius+ripple),sin(angle)*(radius+ripple));p+=vec3(sin(a)*width*.55,cos(a)*cos(angle)*width,cos(a)*sin(angle)*width);
 fade=smoothstep(.03,.055,t)*(1.0-smoothstep(.13,.28,t));
 }else if(aKind<2.5){float begin=aKind<1.5?.02:.05+seed*.05,end=aKind<1.5?.22:.50+seed*.15;float age=max(0.0,t-begin);float angle=aId*2.39996+.43;vec3 ray=normalize(vec3(.38+seed*.4,cos(angle),sin(angle))),side=normalize(cross(ray,vec3(1,0,0))),up=cross(ray,side);float width;
 if(aKind<1.5){float grow=1.0-exp(-age*45.0);float reach=(1.25+seed*.8)*${a(r.burst)}*grow;float travel=.1+age*1.6;p=vec3(travel,0,0)+ray*(h*reach);width=pow(max(0.0,sin(h*PI)),.8)*(.04+seed*.02)*(1.0-smoothstep(.09,.22,t));p+=side*sin(h*PI)*.10*sin(aId+age*12.0);}
 else{float distance=age*(4.0+seed*2.0)/(1.0+age*1.4),tail=.28+age*.5;float along=max(0.0,distance-tail*(1.0-h));p=vec3(.1,0,0)+ray*along+vec3(0,-age*age*.5,0);width=(.008+.021*pow(h,5.0))*smoothstep(0.0,.08,h);}
 p+=(side*cos(a)+up*sin(a))*width;fade=smoothstep(begin,begin+.015,t)*(1.0-smoothstep(end-.13,end,t));
 }else{float angle=aId*2.399963+.7;vec3 ray=normalize(vec3(.45+seed*.5,cos(angle),sin(angle))),side=normalize(cross(ray,vec3(1,0,0))),up=cross(ray,side);
 if(aKind<3.5){float age=max(0.0,t-.08),travel=.4+age*(3.2+seed*2.5)/(1.0+age);vec3 center=vec3(.12,0,0)+ray*travel;float radius=pow(max(0.0,sin(h*PI)),.7)*(.12+seed*.09)*(1.0+.25*sin(a*3.0+h*12.0+t*18.0));p=center+ray*((h-.3)*(.50+seed*.35))+side*sin(h*PI)*.18*sin(aId+t*10.0)+(side*cos(a)+up*sin(a))*radius;fade=smoothstep(.08,.12,t)*(1.0-smoothstep(.27+seed*.10,.55,t));}
 else if(aKind<4.5){float age=max(0.0,t-.13);vec3 center=vec3(.22,0,0)+ray*(.35+age*(1.0+seed*.7))+vec3(0,age*.85,0);float size=.55+age*1.4+seed*.25;vec4 mv=modelViewMatrix*vec4(center*uSize,1.0);mv.xy+=(uv*2.0-1.0)*size*uSize;vSurface=dot(center,uNormal);vFade=smoothstep(.13,.23,t)*(1.0-smoothstep(.58+seed*.1,1.05,t));gl_Position=projectionMatrix*mv;return;}
 else{float age=max(0.0,t-.06);vec3 center=vec3(.15,0,0)+ray*(.3+age*(2.2+seed*2.0))+vec3(0,-age*age*3.2,0);float spin=a+age*(7.0+seed*5.0),r=sin(h*PI)*(.14+seed*.09);p=center+ray*((h-.5)*(.35+seed*.3))+(side*cos(spin)+up*sin(spin))*r;fade=smoothstep(.06,.08,t)*(1.0-smoothstep(.55+seed*.10,.95,t));}
 }
 vFade=fade;vSurface=dot(p,uNormal);gl_Position=projectionMatrix*modelViewMatrix*vec4(p*uSize*(.35+.65*uOrigin),1.0);}`,g=`uniform float uProgress,uSurface,uOnly,uHidden;varying vec2 vUv;varying float vKind,vId,vFade,vSurface;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){if(uHidden>=0.0&&abs(vKind-uHidden)<.1)discard;if(uOnly>=0.0&&abs(vKind-uOnly)>.1)discard;if(vFade<.002||(uSurface>.5&&vSurface<-.012))discard;float t=uProgress*2.0;float hot=pow(abs(sin(vUv.y*6.283185)),2.0);vec3 c=mix(vec3(1.0,.12,.015),vec3(1.0,.68,.13),hot);float alpha=vFade;
 if(vKind<.5){float tear=.5+.5*sin(vUv.x*62.83185+sin(vUv.x*25.13)*1.4);alpha*=1.0-smoothstep(.65,1.0,(t-.06)*5.0+tear*.55);}
 else if(vKind<1.5){c=mix(vec3(1.0,.24,.025),vec3(1.0,.95,.70),pow(1.0-vUv.x,1.5));alpha*=1.0-smoothstep(.8,1.0,vUv.x);}
 else if(vKind<2.5){c=mix(vec3(1.0,.18,.01),vec3(1.0,.98,.82),pow(vUv.x,5.0));alpha*=pow(vUv.x,1.4);}
 else if(vKind<3.5){float flow=noise(vec2(vUv.x*7.0-t*8.0,vUv.y*10.0+vId));float heat=sin(vUv.x*3.14159)*(.4+.6*hot)+flow*.25;c=mix(vec3(.95,.075,.005),vec3(1.0,.89,.42),smoothstep(.3,.9,heat));if(flow<.2+(1.0-vFade)*.5)discard;}
 else if(vKind<4.5){vec2 q=vUv*2.0-1.0;float n=noise(q*3.5+vec2(vId*4.0,-t*1.5)),n2=noise(q*7.0+vec2(t*.8,vId));float edge=length(q)+(n-.5)*.36;alpha*= (1.0-smoothstep(.42,.98,edge))*(.25+n*.35+n2*.15);c=mix(vec3(.065,.045,.035),vec3(.29,.23,.18),n*.65+(.5+.5*q.y)*.35);}
 else{float face=.3+.7*abs(sin(vUv.y*6.283185+vId));c=mix(vec3(.018,.014,.010),vec3(.11,.085,.060),face);c+=vec3(.3,.035,.002)*smoothstep(.82,.98,vUv.x)*pow(face,5.0)*(1.0-smoothstep(.12,.45,t));}
 if(alpha<.002)discard;gl_FragColor=vec4(c,alpha);
 #include <colorspace_fragment>
 }`;if(e>=6){let e=(e,t,n)=>{if(e.split(t).length!==2)throw Error(`Non-unique staging patch: `+t);return e.replace(t,n)};for(let[t,n]of[[`(t-.03)/.25`,`(t-.095)/.305`],[`smoothstep(.03,.055,t)*(1.0-smoothstep(.13,.28,t))`,`smoothstep(.095,.135,t)*(1.0-smoothstep(.24,.40,t))`],[`aKind<1.5?.02:.05+seed*.05,end=aKind<1.5?.22:.50+seed*.15`,`aKind<1.5?.075:.16+seed*.06,end=aKind<1.5?.28:.72+seed*.16`],[`smoothstep(.09,.22,t)`,`smoothstep(.16,.28,t)`],[`tail=.28+age*.5`,`tail=.52+age*.65`],[`float angle=aId*2.39996+.43`,`float angle=aId*2.39996+.43+(aKind>1.5?1.1:0.0)`],[`distance=age*(4.0+seed*2.0)/(1.0+age*1.4)`,`distance=.3+age*(9.0+seed*5.0)/(1.0+age*1.4)`],[`(.008+.021*pow(h,5.0))`,`(.012+.033*pow(h,5.0))`],[`float age=max(0.0,t-.08),travel=.4+age*(3.2+seed*2.5)/(1.0+age)`,`float begin=.20+seed*.07,age=max(0.0,t-begin),travel=1.45+age*(4.0+seed*2.5)/(1.0+age)`],[`(.12+seed*.09)`,`(.22+seed*.10)`],[`(.50+seed*.35)`,`(.70+seed*.40)`],[`smoothstep(.08,.12,t)*(1.0-smoothstep(.27+seed*.10,.55,t))`,`smoothstep(begin,begin+.065,t)*(1.0-smoothstep(.42+seed*.08,.78,t))`],[`float age=max(0.0,t-.13);vec3 center=vec3(.22,0,0)+ray*(.35+age*(1.0+seed*.7))+vec3(0,age*.85,0);float size=.55+age*1.4+seed*.25`,`float begin=.38+seed*.09,age=max(0.0,t-begin);vec3 center=vec3(.45,0,0)+ray*(1.45+age*(.8+seed*.6))+vec3(0,.55+age*1.2,0);float size=.42+age*.65+seed*.22`],[`smoothstep(.13,.23,t)*(1.0-smoothstep(.58+seed*.1,1.05,t))`,`smoothstep(begin,begin+.13,t)*(1.0-smoothstep(.96+seed*.08,1.4,t))`],[`float age=max(0.0,t-.06);vec3 center=vec3(.15,0,0)+ray*(.3+age*(2.2+seed*2.0))+vec3(0,-age*age*3.2,0)`,`float begin=.13+seed*.045,age=max(0.0,t-begin);vec3 center=vec3(.15,0,0)+ray*(.9+age*(3.5+seed*2.0))+vec3(0,.35+age*.9-age*age*3.2,0)`],[`(.14+seed*.09)`,`(.34+seed*.16)`],[`(.35+seed*.3)`,`(.55+seed*.35)`],[`smoothstep(.06,.08,t)*(1.0-smoothstep(.55+seed*.10,.95,t))`,`smoothstep(begin,begin+.035,t)*(1.0-smoothstep(.88+seed*.10,1.25,t))`]])h=e(h,t,n);for(let[t,n]of[[`(t-.06)*5.0`,`(t-.14)*3.8`],[`vec3(1.0,.89,.42)`,`vec3(1.0,.55,.11)`],[`(.25+n*.35+n2*.15)`,`(.40+n*.40+n2*.15)`],[`vec3(.065,.045,.035),vec3(.29,.23,.18)`,`vec3(.12,.075,.045),vec3(.45,.33,.22)`],[`vec3(.018,.014,.010),vec3(.11,.085,.060)`,`vec3(.055,.040,.028),vec3(.46,.33,.21)`],[`vec3(.3,.035,.002)*smoothstep(.82,.98,vUv.x)`,`vec3(.65,.14,.015)*smoothstep(.74,.98,vUv.x)`],[`smoothstep(.12,.45,t)`,`smoothstep(.28,.78,t)`]])g=e(g,t,n)}if(e>=6){let e=(e,t)=>{if(h.split(e).length!==2)throw Error(`Non-unique impulse patch: `+e);h=h.replace(e,t)};e(`aKind<1.5?.075:.16+seed*.06`,`aKind<1.5?0.0:.16+seed*.06`);let t=h.indexOf(`if(aKind<1.5){float grow=`),i=h.indexOf(`else{float distance=`,t);if(t<0||i<0)throw Error(`Missing ray branch`);h=h.slice(0,t)+`if(aKind<1.5){float reach=(1.25+seed*.8)*${a(r.burst)}*.70;float travel=.1+age*(9.0+seed*5.0);p=vec3(.1,0,0)+ray*(travel+h*reach);width=(.035+seed*.030)*sin(h*PI);}
 `+h.slice(i),e(`fade=smoothstep(begin,begin+.015,t)*(1.0-smoothstep(end-.13,end,t))`,`fade=aKind<1.5?(1.0-smoothstep(.02,.10,t)):smoothstep(begin,begin+.015,t)*(1.0-smoothstep(end-.13,end,t))`);let o=h.indexOf(`if(aKind<3.5){`),s=h.indexOf(`else if(aKind<4.5)`,o);if(o<0||s<0)throw Error(`Missing fragment branch`);h=h.slice(0,o)+`if(aKind<3.5){float begin=.20+seed*.07,age=max(0.0,t-begin),travel=1.45+age*(7.0+seed*4.0)/(1.0+age);float tail=.8+seed*.65+age*.6;float along=max(0.0,travel-tail*(1.0-h));float width=(.010+.035*pow(h,6.0))*smoothstep(0.0,.12,h);p=vec3(.12,0,0)+ray*along+(side*cos(a)+up*sin(a))*width;fade=smoothstep(begin,begin+.025,t)*(1.0-smoothstep(.42+seed*.08,.78,t));}
 `+h.slice(s),m.uDebrisSlope={value:0},m.uDebrisForward={value:new n.Vector3(1,0,0)},m.uDebrisSide={value:new n.Vector3(0,0,-1)},m.uDebrisUp={value:new n.Vector3(0,1,0)},h=`uniform float uDebrisSlope;uniform vec3 uDebrisForward,uDebrisSide,uDebrisUp;
`+h,e(`vec3 center=vec3(.15,0,0)+ray*(.9+age*(3.5+seed*2.0))+vec3(0,.35+age*.9-age*age*3.2,0)`,`float spread=(seed-.5)*1.1,drop=.05+seed*.06;float unitLength=sqrt(1.0+spread*spread+drop*drop-2.0*drop*uDebrisSlope);vec3 launch=(uDebrisForward+uDebrisSide*spread-uDebrisUp*drop)/unitLength;float speed=(4.4+seed*2.0)*2.5;vec3 center=uDebrisForward*.9+uDebrisSide*((seed-.5)*.45)-uDebrisUp*.08+launch*(age*speed)-uDebrisUp*(age*age*3.2)`)}if(e>=6){let e=(e,t)=>{if(h.split(e).length!==2)throw Error(`Non-unique spark timing patch: `+e);h=h.replace(e,t)};e(`aKind<1.5?0.0:.16+seed*.06,end=aKind<1.5?.28:.72+seed*.16;float age=max(0.0,t-begin);`,`aKind<1.5?.05:(aId<.5?0.0:seed*.035),end=aKind<1.5?.35:.85+seed*.25;float age=aKind<1.5?max(t-.11,0.0)*(.10/.24):max(0.0,t-begin)*(.56+seed*.10)/(end-begin);`),e(`distance=.3+age*(9.0+seed*5.0)/(1.0+age*1.4)`,`distance=.3+1.25*age*(9.0+seed*5.0)/(1.0+age*1.4)`),e(`1.0-smoothstep(.02,.10,t)`,`step(.05,t)*(1.0-smoothstep(.11,.22,t))`),e(`1.0-smoothstep(end-.13,end,t)`,`1.0-smoothstep(.43+seed*.10,.56+seed*.10,age)`),e(`:smoothstep(begin,begin+.015,t)*(1.0-smoothstep(.43+seed*.10,.56+seed*.10,age))`,`:(aId<.5?step(begin,t):smoothstep(begin,begin+.015,t))*(1.0-smoothstep(.43+seed*.10,.56+seed*.10,age))`),e(`float begin=.20+seed*.07,age=max(0.0,t-begin),travel=1.45+age*(7.0+seed*4.0)/(1.0+age)`,`float begin=seed*.035,end=.85+seed*.25,age=max(0.0,t-begin)*(.58-seed*.07)/(end-begin),travel=1.45+1.25*age*(7.0+seed*4.0)/(1.0+age)`),e(`smoothstep(begin,begin+.025,t)*(1.0-smoothstep(.42+seed*.08,.78,t))`,`smoothstep(begin,begin+.015,t)*(1.0-smoothstep(.22+seed*.01,.58-seed*.07,age))`)}if(e===6){let e=`r=sin(h*PI)*(.34+seed*.16);p=center+ray*((h-.5)*(.55+seed*.35))+(side*cos(spin)+up*sin(spin))*r;`;if(h.split(e).length!==2)throw Error(`Non-unique level7 debris size patch`);h=h.replace(e,`r=sin(h*PI)*0.4171958472;float sizeSeed=fract(sin(aId*47.17+19.73)*15731.743),rockScale=.1+.2*sizeSeed;p=center+(ray*((h-.5)*0.7188659157)+(side*cos(spin)+up*sin(spin))*r)*rockScale;`);let t=`float spread=(seed-.5)*1.1,drop=.05+seed*.06;`;if(h.split(t).length!==2)throw Error(`Non-unique level7 debris fan patch`);h=h.replace(t,`float yawSeed=fract(sin(aId*31.71+8.13)*21731.17),pitchSeed=fract(sin(aId*63.19+2.47)*9371.63);float scatterBand=mod(aId,5.0);float spread=(yawSeed-.5)*(scatterBand<3.0?.90:1.75);float drop=scatterBand<3.0?(.035+.24*pitchSeed):(.24+.32*pitchSeed);`);let n=`smoothstep(begin,begin+.035,t)*(1.0-smoothstep(.88+seed*.10,1.25,t))`;if(h.split(n).length!==2)throw Error(`Non-unique level7 debris lifetime patch`);h=h.replace(n,`smoothstep(0.0,.035,age)*(1.0-smoothstep(.35,.65,age))`)}let _=[n.AdditiveBlending,n.NormalBlending,n.NormalBlending].map(e=>new n.ShaderMaterial({uniforms:m,vertexShader:h,fragmentShader:g,transparent:!0,depthWrite:!1,side:n.DoubleSide,forceSinglePass:!0,blending:e}));if(e>=6)for(let e of _.slice(1))e.userData.previewNonEmissive=!0;let v=new n.Mesh(p,_);return v.name=`preview-added-impact-layers`,v.frustumCulled=!1,v.renderOrder=6,v}return o()}function u(e,t){t.group.userData.fireballGlow=!0;let n=new Map,r=!1;function i(t){let n=1,r=1,i=[],a=t.extensions.has(`EXT_color_buffer_float`);function o(t,n,r=!1,o=a){let s=new e.WebGLRenderTarget(t,n,{type:o?e.UnsignedInt101111Type:e.HalfFloatType,format:o?e.RGBFormat:e.RGBAFormat,depthBuffer:r});return s.texture.colorSpace=e.LinearSRGBColorSpace,i.push(s),s}let s=o(1,1,!0,!1),c=o(1,1,!0),l=[0,1,2].map(()=>[o(1,1),o(1,1)]),u=new e.Scene,d=new e.OrthographicCamera(-1,1,1,-1,0,1),f=new e.Mesh(new e.PlaneGeometry(2,2));f.frustumCulled=!1,u.add(f),i.push(f.geometry);function p(t,n){let r=new e.ShaderMaterial({vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0,1);}`,fragmentShader:t,uniforms:n,depthTest:!1,depthWrite:!1});return i.push(r),r}let m=p(`uniform sampler2D source;uniform vec2 stepSize,prefilter;uniform float extractLight;varying vec2 vUv;
vec3 lightAt(vec2 uv){vec3 c=texture2D(source,uv).rgb;float l=max(c.r,max(c.g,c.b));return c*mix(1.0,smoothstep(.12,.55,l),extractLight);}
vec3 sampleGlow(vec2 uv){if(prefilter.x==0.0)return lightAt(uv);return (lightAt(uv+prefilter*vec2(-.5,-.5))+lightAt(uv+prefilter*vec2(.5,-.5))+lightAt(uv+prefilter*vec2(-.5,.5))+lightAt(uv+prefilter*vec2(.5,.5)))*.25;}
void main(){vec3 c=sampleGlow(vUv)*.227027;c+=(sampleGlow(vUv+stepSize*1.384615)+sampleGlow(vUv-stepSize*1.384615))*.316216;c+=(sampleGlow(vUv+stepSize*3.230769)+sampleGlow(vUv-stepSize*3.230769))*.070270;gl_FragColor=vec4(c,1.0);}`,{extractLight:{value:0},source:{value:null},stepSize:{value:new e.Vector2},prefilter:{value:new e.Vector2}}),h=p(`uniform sampler2D baseImage,tightGlow,mediumGlow,wideGlow;uniform vec3 weights;varying vec2 vUv;
void main(){vec3 c=texture2D(baseImage,vUv).rgb+texture2D(tightGlow,vUv).rgb*weights.x+texture2D(mediumGlow,vUv).rgb*weights.y+texture2D(wideGlow,vUv).rgb*weights.z;gl_FragColor=vec4(max(c,vec3(0.0)),1.0);
#include <colorspace_fragment>
}`,{baseImage:{value:s.texture},tightGlow:{value:l[0][1].texture},mediumGlow:{value:l[1][1].texture},wideGlow:{value:l[2][1].texture},weights:{value:new e.Vector3}});h.uniforms.weights.value.set(.6,.24,.06);let g=new e.MeshBasicMaterial({color:0,side:e.DoubleSide});i.push(g);let _=new e.Vector2,v=new e.Vector4,y=new e.Vector4,b=new e.Color,x=[],S=[],C=[];function w(e,n){f.material=e,t.setRenderTarget(n),t.render(u,d)}function T(e,t){if(e!==n||t!==r){n=e,r=t,s.setSize(e,t),c.setSize(Math.max(1,e>>1),Math.max(1,t>>1));for(let n=0;n<3;n++){let r=Math.max(1,Math.round(e/(3*2**n))),i=Math.max(1,Math.round(t/(3*2**n)));for(let e of l[n])e.setSize(r,i)}}}return{render(n,r){let i=t.getRenderTarget(),a=t.getActiveCubeFace(),o=t.getActiveMipmapLevel();t.getDrawingBufferSize(_),T(i?.width??_.x,i?.height??_.y),t.getViewport(v),t.getScissor(y),t.getClearColor(b);let p=t.getClearAlpha(),E=t.getScissorTest(),D=t.autoClear,O=t.xr.enabled,ee=t.toneMapping,k=t.outputColorSpace,A=n.background;x.length=S.length=C.length=0;let j=()=>{for(let[e,t]of x)e.material=t;for(let e=S.length-1;e>=0;e--){let[t,n]=S[e];t.visible=n}for(let e=C.length-1;e>=0;e--){let[t,n]=C[e];t.value=n}n.background=A};try{t.xr.enabled=!1,t.autoClear=!0,t.setScissorTest(!1),t.toneMapping=e.NoToneMapping,t.outputColorSpace=e.SRGBColorSpace,t.setRenderTarget(s),t.render(n,r),n.traverse(e=>{let t=!1;for(let n=e;n;n=n.parent)if(n.userData.fireballGlow){t=!0;break}if(t)for(let t of Array.isArray(e.material)?e.material:e.material?[e.material]:[]){t.userData?.previewNonEmissive&&(S.push([t,t.visible]),t.visible=!1);let e=t.uniforms?.uPreviewBloomPass;e&&(C.push([e,e.value]),e.value=1)}else e.isMesh?(x.push([e,e.material]),e.material=g):(e.isLine||e.isPoints||e.isSprite)&&(S.push([e,e.visible]),e.visible=!1)}),n.background=null,t.setClearColor(0,1),t.setRenderTarget(c),t.render(n,r),j();let p=c.texture,_=c.width,b=c.height;for(let[e,t]of l)m.uniforms.extractLight.value=+(p===c.texture),m.uniforms.source.value=p,m.uniforms.prefilter.value.set(1/_,1/b),m.uniforms.stepSize.value.set(1/e.width,0),w(m,e),m.uniforms.extractLight.value=0,m.uniforms.source.value=e.texture,m.uniforms.prefilter.value.set(0,0),m.uniforms.stepSize.value.set(0,1/t.height),w(m,t),p=t.texture,_=t.width,b=t.height;t.setRenderTarget(i,a,o),t.setViewport(i?i.viewport:v),t.setScissor(i?i.scissor:y),t.setScissorTest(i?i.scissorTest:E),f.material=h,t.render(u,d)}finally{j(),t.setRenderTarget(null),t.setViewport(v),t.setScissor(y),t.setScissorTest(E),t.setClearColor(b,p),t.autoClear=D,t.xr.enabled=O,t.toneMapping=ee,t.outputColorSpace=k,t.setRenderTarget(i,a,o)}},dispose(){for(let e of i)e.dispose()}}}t.render=(e,t,a)=>{if(r)return;let o=n.get(e);o||(o=i(e),n.set(e,o)),o.render(t,a)};let a=t.dispose.bind(t);t.dispose=()=>{if(!r){r=!0;for(let e of n.values())e.dispose();n.clear(),a()}}}function d(e){let t=e.group.getObjectByName(`lifecycle-impact`),n=e.group.getObjectByName(`preview-added-impact-layers`),r=[`1.0,.68,.16`,`1.0,.96,.76`,`1.0,.48,.12`,`1.0,.68,.18`,`.40,.10,.03`,`1.0,.56,.10`,`1.0,.86,.40`,`1.0,.90,.55`,`.32,.008,.001`,`1.0,.19,.015`,`1.0,.63,.12`,`1.0,.94,.73`,`1.0,.12,.015`,`1.0,.68,.13`,`1.0,.24,.025`,`1.0,.95,.70`,`1.0,.18,.01`,`1.0,.98,.82`,`.95,.075,.005`,`1.0,.55,.11`,`.65,.14,.015`],i=t.material.uniforms.uColor.value.constructor,a=new i(`#ff823e`).getHSL({}),o={},s=r.map(e=>{let t=new i().setRGB(...e.split(`,`).map(Number));return{source:t,hsl:t.getHSL({}),uniform:{value:t.clone()}}});function c(){t.material.uniforms.uColor.value.getHSL(o);let e=o.h-a.h,n=a.s>0?o.s/a.s:0;for(let t of s)Math.abs(e)<1e-9&&Math.abs(n-1)<1e-9?t.uniform.value.copy(t.source):t.uniform.value.setHSL(t.hsl.h+e,Math.min(1,t.hsl.s*n),t.hsl.l)}for(let i of[t,e.group.getObjectByName(`lifecycle-impact-wisps`),e.group.getObjectByName(`lifecycle-contact-glow`),n])for(let e of Array.isArray(i.material)?i.material:[i.material]){e.uniforms.uColor=t.material.uniforms.uColor;let n=e.fragmentShader;for(let t=0;t<r.length;t++){let i=`vec3(`+r[t]+`)`;if(n.includes(i)){let r=`uFirePalette`+t;e.uniforms[r]=s[t].uniform,n=`uniform vec3 `+r+`;
`+n.split(i).join(r)}}e.fragmentShader=n,e.needsUpdate=!0}let l=e.setOptions.bind(e);e.setOptions=(...e)=>{let t=l(...e);return c(),t},c()}function f({THREE:e,spec:t,cap:n,uniforms:r,animated:i,mesh:a,instanced:o,shader:s,noise:c,output:l}){if(t.id!==`fire-explosion`||t.renderStyle!==`toon`)return!1;let u=(t.seed??119431)>>>0,d=()=>(u=Math.imul(u,1664525)+1013904223>>>0,u/4294967296),f=`
    float hash3(vec3 p){p=fract(p*.3183099+vec3(.11,.17,.23));p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float field3(vec3 p){
      vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
      return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);
    }
    float turbulence(vec3 p){return field3(p)*.64+field3(p*2.03+5.1)*.26+field3(p*4.01-2.7)*.10;}
    vec3 hotColor(vec3 base,float heat){
      vec3 flame=min(base*(1.2+max(0.0,heat)*3.0),vec3(1.0));
      return mix(flame,vec3(1.0,.97,.85),smoothstep(.75,1.10,heat));
    }
  `;function p(t){return t.transparent=!1,t.depthWrite=!0,t.blending=e.NoBlending,t.side=e.FrontSide,t}function m(t){return t.blending=e.AdditiveBlending,t.depthWrite=!1,t.forceSinglePass=!0,t}function h(t,n,r,i=!1){let a=[],o=[],s=[],c=[];for(let e=0;e<t;e++){let t=a.length/3,l=[e,d(),d(),d()],u=i&&e===0?1:n,f=i&&e===0?1:r;for(let e=0;e<=u;e++)for(let t=0;t<=f;t++)a.push(0,0,0),o.push(e/u,t/f),s.push(...l);for(let e=0;e<u;e++)for(let n=0;n<f;n++){let r=t+e*(f+1)+n,i=r+f+1;c.push(r,i,r+1,r+1,i,i+1)}}let l=new e.BufferGeometry;return l.setAttribute(`position`,new e.Float32BufferAttribute(a,3)),l.setAttribute(`uv`,new e.Float32BufferAttribute(o,2)),l.setAttribute(`aSeed`,new e.Float32BufferAttribute(s,4)),l.setIndex(c),l}let g=[],_=[],v=[],y=[],b=[],x=[],S=new e.SphereGeometry(1,24,18);for(let e=0;e<18;e++){let t=e<8,n=e<15,r=e*2.399963+d()*.35,i=t?1.12+d()*.2:n?.75+d()*.25:.35,a=t?.61+d()*.13:n?1.22+d()*.18:1.75+d()*.2,o=t?.69+d()*.18:n?.65+d()*.18:.65+d()*.15,s=[Math.cos(r)*i,a,Math.sin(r)*i,o],c=[d(),d(),d(),e],l=g.length/3;x.push(s);for(let e=0;e<S.attributes.position.count;e++)g.push(...S.attributes.position.array.slice(e*3,e*3+3)),_.push(...S.attributes.normal.array.slice(e*3,e*3+3)),v.push(...s),y.push(...c);for(let e of S.index.array)b.push(l+e)}S.dispose();let C=new e.BufferGeometry;for(let[t,n,r]of[[`position`,g,3],[`normal`,_,3],[`aLobe`,v,4],[`aSeed`,y,4]])C.setAttribute(t,new e.Float32BufferAttribute(n,r));C.setIndex(b);let w=a(C,p(s(`
    uniform float uTime;uniform vec3 uColor;
    varying vec3 vLocal,vNormal,vView;varying float vHeight,vSeed;
    ${f}
    void main(){
      if(uTime<=0.0||uTime>=1.95)discard;
      vec3 flow=vLocal*2.5+vec3(vSeed*19.0,-uTime*.95,0.0);
      float broad=turbulence(flow),grain=field3(flow*3.4);
      // Holes open from below, then through the lifted crown. Shared 3D noise
      // keeps erosion attached to the volume as the viewing angle changes.
      float burn=smoothstep(.45,2.10,uTime)*.95+(1.0-smoothstep(.0,3.2,vHeight))*.40;
      if(broad+.19<burn)discard;
      vec3 n=normalize(vNormal),view=normalize(-vView);
      float rim=pow(1.0-max(0.0,dot(n,view)),2.4);
      float heat=1.20-uTime*1.9+(vHeight-1.2)*.30+rim*.65+(broad-.5)*.25+vSeed*.05;
      heat-=sin(clamp((uTime-.15)/.80,0.0,1.0)*3.141593)*.12;
      float flame=smoothstep(.32,.68,heat);
      float light=.45+.55*max(0.0,dot(n,normalize(vec3(-.35,.8,.5))));
      vec3 soot=mix(vec3(.003,.0035,.005),vec3(.022,.023,.028),light*(.65+broad*.35));
      soot*=.86+grain*.16*uDetail;
      vec3 color=mix(soot,hotColor(uColor,heat),flame);
      color=mix(color,vec3(1.0,.98,.88),smoothstep(.96,1.23,heat));
      float edge=(1.0-smoothstep(.0,.045,broad+.19-burn))*step(.60,uTime)*(1.0-smoothstep(.65,1.05,uTime));
      color=mix(color,hotColor(uColor,.55),edge*.6);
      gl_FragColor=vec4(color,1.0);${l}
    }`,`
    uniform float uTime;attribute vec4 aLobe,aSeed;
    varying vec3 vLocal,vNormal,vView;varying float vHeight,vSeed;
    ${f}
    vec3 lobeSurface(vec3 point,float t,vec4 seed,mat3 roll){
      float wrinkle=turbulence(point*2.5+seed.x*19.0+vec3(0.0,-t*.95,0.0));
      vec3 local=roll*point,shape=local*vec3(1.05,.88,1.0);
      shape.x+=local.y*local.y*(seed.y-.5)*.35;
      return shape*(.60+wrinkle*.88);
    }
    void main(){
      float t=uTime,launch=1.0-exp(-t*56.0),spread=1.0-exp(-t*32.0);
      float turn=t*(.65+aSeed.x*.55)*(aSeed.z>.5?1.0:-1.0),c=cos(turn),s=sin(turn);
      mat3 roll=mat3(c,s,0.0,-s,c,0.0,0.0,0.0,1.0);
      vLocal=position;vSeed=aSeed.x;
      float swell=(.78+launch*.22)*(1.0+min(t,.9)*.19);
      vec3 center=aLobe.xyz*vec3(spread,launch,spread);
      center.xz*=1.0+min(t,.9)*.12;
      center.y+=max(0.0,t-.3)*(.48+aSeed.y*.4);
      vec3 surface=lobeSurface(position,t,aSeed,roll);
      vec3 tangent=normalize(cross(normal,abs(normal.y)>.99?vec3(1,0,0):vec3(0,1,0))),bitangent=cross(normal,tangent);
      vec3 dx=lobeSurface(normalize(position+tangent*.012),t,aSeed,roll)-surface;
      vec3 dy=lobeSurface(normalize(position+bitangent*.012),t,aSeed,roll)-surface;
      vec3 p=center+surface*aLobe.w*swell;
      p.y=max(.025,p.y);vHeight=p.y;p*=uSize;p.y-=1.35;
      vec4 mv=modelViewMatrix*vec4(p,1.0);vView=mv.xyz;vNormal=normalMatrix*normalize(cross(dx,dy));
      gl_Position=projectionMatrix*mv;
    }`,{},!1)),1);w.name=`fire-explosion-billowing-volume`;let T=m(s(`
    uniform float uTime;uniform vec3 uColor;varying vec2 vUv;varying float vHeat,vWide;
    void main(){
      float d=length((vUv-.5)*2.0);
      float fade=smoothstep(.0,.018,uTime)*smoothstep(.0,.7,vHeat);
      float alpha=exp(-d*d*mix(5.5,4.8,vWide))*(1.0-smoothstep(.72,1.0,d))*fade*mix(.22,.36,vWide);
      if(alpha<.001)discard;
      gl_FragColor=vec4(min(uColor*2.8,vec3(1.0)),alpha);${l}
    }`,`
    uniform float uTime;attribute vec4 aLobe,aSeed;varying vec2 vUv;varying float vHeat,vWide;
    void main(){
      vUv=uv;float t=uTime,launch=1.0-exp(-t*56.0);vWide=step(17.5,aSeed.x);
      vec3 center=aLobe.xyz*vec3(1.0-exp(-t*32.0),launch,1.0-exp(-t*32.0));
      center.xz*=1.0+min(t,.9)*.12;center.y+=max(0.0,t-.3)*.65;
      center*=uSize;center.y-=1.35;
      vec4 mv=modelViewMatrix*vec4(center,1.0);
      float radius=aLobe.w*(1.0+min(t,.9)*.19)*launch;
      mv.z+=radius*.62*uSize*length(modelMatrix[1].xyz);
      mv.xy+=(uv-.5)*radius*3.6*uSize*length(modelMatrix[1].xyz);
      vHeat=1.0-t*1.8+(aLobe.y-1.2)*.18;
      gl_Position=projectionMatrix*mv;
    }`,{},!0)),E=h(19,1,1),D=[];for(let e of[...x,[0,1.15,0,1.9]])for(let t=0;t<4;t++)D.push(...e);E.setAttribute(`aLobe`,new e.Float32BufferAttribute(D,4));let O=a(E,T,3);O.name=`fire-explosion-local-glow`;let ee=s(`
    uniform float uTime;uniform vec3 uColor;varying vec2 vUv;varying vec4 vSeed;
    ${f}${c}
    void main(){
      float kind=vSeed.x,t=uTime,alpha;vec3 color;
      if(kind<.5){
        vec2 p=(vUv-.5)*2.0;float r=length(p);
        float dist=r+(noise2(p*3.5)-.5)*.24;
        vec2 cells=p*3.0,cell=floor(cells),f=fract(cells);
        float first=10.0,second=10.0;
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
          vec2 at=vec2(float(x),float(y)),id=cell+at;
          vec2 jitter=vec2(hash3(vec3(id,1.0)),hash3(vec3(id,2.0)))*.7+.15;
          float d=length(at+jitter-f);
          if(d<first){second=first;first=d;}else if(d<second)second=d;
        }
        float lava=(1.0-smoothstep(.025,.11,second-first))*(1.0-smoothstep(.3,1.0,dist));
        float heat=1.0-smoothstep(.65,2.8,t);
        color=mix(vec3(.012,.010,.009),hotColor(uColor,.6),lava*heat);
        alpha=(1.0-smoothstep(.7,1.0,dist))*(1.0-smoothstep(2.25,2.8,t))*.85;
      }else if(kind<2.5){
        float edge=sin(vUv.y*3.141593);
        float rough=noise2(vec2(vUv.x*24.0-kind*9.0,vUv.y*6.0-t*.4));
        float fade=1.0-smoothstep(.45,1.05,t);
        alpha=smoothstep(.0,.22,edge)*(.45+rough*.40)*fade*smoothstep(.0,.035,t);
        if(rough+.15<smoothstep(.30,1.4,t)*.6)discard;
        color=mix(vec3(.23,.24,.26),hotColor(uColor,.65),1.0-smoothstep(.30,.68,t));
      }else{
        float rip=noise2(vec2(vUv.x*18.0-kind*7.0,vUv.y*2.0-t*1.8));
        if(rip<.20)discard;
        alpha=sin(vUv.y*3.141593)*.85*smoothstep(.0,.035,t)*(1.0-smoothstep(.22,.56,t));
        color=hotColor(uColor,.85);
      }
      if(alpha<.005)discard;gl_FragColor=vec4(color,alpha);${l}
    }`,`
    uniform float uTime;attribute vec4 aSeed;varying vec2 vUv;varying vec4 vSeed;
    void main(){
      vUv=uv;vSeed=aSeed;vec3 p;
      if(aSeed.x<.5)p=vec3((uv.x-.5)*3.35,.022,(uv.y-.5)*3.35);
      else if(aSeed.x<2.5){
        float t=uTime,angle=uv.x*6.283185;
        float wave=sin(angle*9.0+t*2.0+aSeed.x)*.14+sin(angle*17.0-.7+aSeed.x)*.08+sin(angle*5.0)*.10;
        float radius=(1.0-exp(-t*13.0))*(1.70+aSeed.x*.46)+min(t,1.5)*.62;
        radius+=(uv.y-.5)*(.32+aSeed.x*.15)+wave;
        p=vec3(cos(angle)*radius,.04+sin(uv.y*3.141593)*.025,sin(angle)*radius);
      }else{
        float t=uTime,angle=uv.x*6.283185+t*2.6;
        float r=(1.0-exp(-t*48.0))*(2.12-(aSeed.x-3.0)*.42)+t*.28;
        r+=sin(angle*7.0+aSeed.x)*.045+sin(angle*13.0)*.035;
        p=vec3(cos(angle)*r,.55+(aSeed.x-3.0)*.88+sin(angle*3.0+t*3.0)*.08+(uv.y-.5)*.12,sin(angle)*r);
      }
      p*=uSize;p.y-=1.35;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
    }`,{},!1);ee.forceSinglePass=!0;let k=a(h(5,128,4,!0),ee,2);k.name=`fire-explosion-pressure-and-scorch`;let A=s(`
    uniform float uTime;uniform vec3 uColor;varying vec2 vUv;varying vec4 vSeed;
    ${f}
    void main(){
      float alpha=smoothstep(.0,.025,uTime)*(1.0-smoothstep(.55,1.70,uTime));
      float head=smoothstep(.94,.98,vUv.x),heat=max(head,1.0-smoothstep(.08,.27,uTime));
      alpha*=mix(.28,.95,heat)*smoothstep(.0,.20,vUv.x);
      if(alpha<.005)discard;
      gl_FragColor=vec4(mix(vec3(.19,.19,.20),hotColor(uColor,.70),heat),alpha);${l}
    }`,`
    uniform float uTime;attribute vec4 aSeed;varying vec2 vUv;varying vec4 vSeed;
    
    vec3 path(float age,vec4 seed){
      float angle=seed.x*2.399963+seed.y*.8;
      float travel=(1.0-exp(-age*8.0))*(2.5+seed.z*.8);
      float lift=(1.0-exp(-age*10.0))*(1.4+seed.w*2.6)-age*age*2.8;
      vec3 p=vec3(cos(angle)*travel,max(.055,lift+.35),sin(angle)*travel);
      float curl=sin(age*15.0+seed.y*13.0)*age*.12;
      p+=vec3(-sin(angle)*curl,cos(age*11.0+seed.z*9.0)*age*.06,cos(angle)*curl);
      return p;
    }
  
    void main(){
      vUv=uv;vSeed=aSeed;
      float t=max(0.0,uTime-aSeed.y*.025),tail=max(0.0,t-.5),age=mix(tail,t,uv.x);
      vec3 p=path(age,aSeed),direction=normalize(path(age+.002,aSeed)-p);
      vec3 side=normalize(cross(direction,vec3(0.0,1.0,.01))),up=cross(side,direction);
      float width=mix(.020,.055,smoothstep(.95,1.0,uv.x))*(.5+sin(uv.x*3.141593)*.5);
      p+=(side*cos(uv.y*6.283185)+up*sin(uv.y*6.283185))*width;
      p*=uSize;p.y-=1.35;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
    }`,{},!1);A.forceSinglePass=!0;let j=a(h(11,32,4),A,2);j.name=`fire-explosion-ballistic-trails`;let M=m(s(`
    uniform vec3 uColor;varying vec2 vUv;varying float vFade,vSeed;
    ${f}
    void main(){
      vec2 p=(vUv-.5)*2.0;float d=abs(p.x)+abs(p.y);
      float core=1.0-smoothstep(.08,.48,d),halo=exp(-d*d*4.0)*(1.0-smoothstep(.7,1.0,d));
      float alpha=(core+halo*.45)*vFade;
      if(alpha<.005)discard;
      gl_FragColor=vec4(mix(hotColor(uColor,.65),vec3(1.0,.98,.87),core),alpha);${l}
    }`,`
    attribute vec4 seed;uniform float uTime;varying vec2 vUv;varying float vFade,vSeed;
    void main(){
      vUv=uv;vSeed=seed.w;float t=max(0.0,uTime-seed.y*.08);
      float angle=seed.x*6.283185,travel=(1.0-exp(-t*12.0))*(1.2+seed.z*2.3);
      vec3 p=vec3(cos(angle)*travel,max(.04,(1.0-exp(-t*8.0))*(.25+seed.w*1.7)-t*t*1.4),sin(angle)*travel);
      vec3 velocity=vec3(cos(angle)*exp(-t*5.0),.4+seed.w-t*2.0,sin(angle)*exp(-t*5.0));
      vec2 axis=(modelViewMatrix*vec4(velocity,0.0)).xy;
      float len=length(axis);axis=len>.0001?axis/len:vec2(1,0);
      vec2 side=vec2(-axis.y,axis.x);
      p*=uSize;p.y-=1.35;vec4 mv=modelViewMatrix*vec4(p,1.0);
      float streakLength=(.18+seed.z*.38)*(1.0-smoothstep(.12,.55,t))+.09;
      float width=.08+seed.w*.07;
      mv.xy+=(axis*position.x*streakLength+side*position.y*width)*uSize*length(modelMatrix[1].xyz);
      vFade=smoothstep(.0,.015,t)*(1.0-smoothstep(.40,1.4+seed.w*.6,t));
      gl_Position=projectionMatrix*mv;
    }`,{},!0)),N=o(new e.PlaneGeometry(1,1),n,1,M,3);return N.name=`fire-explosion-embers`,i.push(()=>{let e=r.uTime.value;w.visible=e>0&&e<1.95,O.visible=e>0&&e<.68,k.visible=e>0&&e<2.8,j.visible=e>0&&e<1.7,N.visible=e>0&&e<2.1,k.geometry.setDrawRange(0,6+(e<.56?4:e<1.05?2:0)*128*4*6)}),!0}function p({THREE:e,spec:t,cap:n,uniforms:r,animated:i,mesh:a,instanced:o,shader:s,output:c,variation:l}){if(t.id!==`billowing-airburst`)return!1;let u=.5,d=(t.seed??829648)>>>0,f=()=>(d=Math.imul(d,1664525)+1013904223>>>0,d/4294967296),m=`
    float hash3(vec3 p){p=fract(p*.3183099+vec3(.11,.17,.23));p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
      return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
    float billow(vec3 p){return noise3(p)*.65+noise3(p*2.07+7.3)*.25+noise3(p*4.11-3.1)*.10;}
    float flameHeat(float age,float pattern){
      return 1.0-smoothstep(.26,.59,age*1.4+(.5-pattern)*.24);
    }
    vec3 heatColor(vec3 base,float heat){
      vec3 ember=base*vec3(.60,.025,.012);
      vec3 flame=mix(ember,base*vec3(1.05,.13,.06),smoothstep(.18,.72,heat));
      return mix(flame,vec3(1.0,.16,.025),smoothstep(.86,1.18,heat));
    }
  `,h=Array.from({length:6},()=>new e.Vector4),g=Array.from({length:6},()=>new e.Vector4),_=new e.Vector3,v={uJetPaths:{value:h},uJetBends:{value:g},uBurstOffset:{value:_}};l.reset=()=>{let e=(l.seed^t.seed)>>>0,n=()=>(e=Math.imul(e,1664525)+1013904223>>>0,e/4294967296);for(let e=0;e<6;e++){let t,r,i,a=!1;for(let o=0;o<64&&!a;o++){r=n()*1.84-.92;let o=n()*Math.PI*2,s=Math.sqrt(1-r*r);t=Math.cos(o)*s,i=Math.sin(o)*s,a=h.slice(0,e).every(e=>t*e.x+r*e.y+i*e.z<.78)}if(!a){let n=1/0;for(let a=0;a<192;a++){let o=1-2*(a+.5)/192,s=a*2.399963,c=Math.sqrt(1-o*o),l=Math.cos(s)*c,u=Math.sin(s)*c,d=-1;for(let t=0;t<e;t++)d=Math.max(d,l*h[t].x+o*h[t].y+u*h[t].z);d<n&&(n=d,t=l,r=o,i=u)}}h[e].set(t,r,i,3.4+n()*1.2),g[e].set((n()-.5)*.8,(n()-.5)*.65,n()*.035,.82+n()*.3)}_.set(n()*19,n()*19,n()*19)},l.reset();let y=(t.seed??829648)>>>0,b=p.geometryTemplate;b&&b.THREE===e&&b.seed===y||(b={THREE:e,seed:y,lobes:[],samples:[],states:[]},p.geometryTemplate=b);let x=[];function S(t){let n=+!!t,r=b.lobes[n];if(r)return x.push(...b.samples[n]),d=b.states[n],r.clone();let i=x.length,a=new e.SphereGeometry(1,t?20:40,t?14:28),o=[],s=[],c=[],l=[],u=[],p=t?144:9;for(let e=0;e<p;e++){let n=t?Math.floor(e/24):-1,r=t?e%24:e,i=e*2.399963+(f()-.5)*.35,d=1-2*(e+.5)/p,m=Math.sqrt(Math.max(0,1-d*d)),h=t?r/23:0,g=t?[h,(f()-.5)*.3,(f()-.5)*.3,r===23?.33:.17+f()*.14]:e===0?[0,0,0,1.14]:[Math.cos(i)*m*.86,d*.72,Math.sin(i)*m*.86,.72+f()*.19],_=[f(),n,h,f()];t&&r%3!=0&&r!==23||x.push({lobe:g,data:_});let v=o.length/3;for(let e=0;e<a.attributes.position.count;e++)o.push(a.attributes.position.array[e*3],a.attributes.position.array[e*3+1],a.attributes.position.array[e*3+2]),s.push(a.attributes.normal.array[e*3],a.attributes.normal.array[e*3+1],a.attributes.normal.array[e*3+2]),c.push(...g),l.push(..._);for(let e of a.index.array)u.push(v+e)}let m=new e.BufferGeometry;for(let[t,n,r]of[[`position`,o,3],[`normal`,s,3],[`aLobe`,c,4],[`aData`,l,4]])m.setAttribute(t,new e.Float32BufferAttribute(n,r));return m.setIndex(u),t&&(m.userData.jetIndexCount=a.index.count*24),a.dispose(),b.states[n]=d,b.lobes[n]=m.clone(),b.samples[n]=x.slice(i),m}let C=`
    void lobeMotion(float t,out vec3 center,out float swell,out float age){
      age=t;
      if(aData.y>=0.0){
        vec4 path=uJetPaths[int(aData.y)],bend=uJetBends[int(aData.y)];
        float u=aData.z;age=max(0.0,t-.025-bend.z-u*.11);
        float travel=(1.0-exp(-max(0.0,t-.045)*6.5))*path.w;
        vec3 d=path.xyz,side=normalize(cross(d,vec3(.13,1.0,.07))),up=normalize(cross(side,d));
        center=d*(.65+travel*u);
        center+=side*(sin(u*3.141593)*bend.x+aLobe.y)+up*(sin(u*3.7)*bend.y+aLobe.z);
        float drift=max(0.0,t-.65);
        center+=side*(aData.x-.5)*drift*.32+up*(aData.w-.5)*drift*.22;
        center.y+=drift*(.12+.14*u);
        swell=(1.0-exp(-age*30.0))*(1.0+min(t,.8)*.36)*bend.w;
      }else{
        float launch=1.0-exp(-t*19.0);
        float c=cos(t*.23),s=sin(t*.23);
        center=vec3(c*aLobe.x+s*aLobe.z,aLobe.y,-s*aLobe.x+c*aLobe.z)*launch;
        center*=1.0+min(t,.65)*.27;
        center.y+=max(0.0,t-.55)*(.14+aData.w*.16);
        center+=normalize(aLobe.xyz+vec3(.001))*smoothstep(.8,2.0,t)*.23;
        swell=launch*(1.0+min(t,.6)*.22);
      }
    }
  `,w=`
    uniform float uTime,uDetail,uQuantity;
    attribute vec4 aLobe,aData;
    uniform vec4 uJetPaths[6],uJetBends[6];uniform vec3 uBurstOffset;
    varying vec3 vSurface,vNormal,vView;varying float vSeed,vJet,vAlong,vAge;
    ${m}
    ${C}
    vec3 surface(vec3 p,float t){
      float turn=t*(.52+aData.w*.40),c=cos(turn),s=sin(turn);
      vec3 r=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);
      float rolling=sin(r.x*3.1+t*.8+aData.x*6.0)*sin(r.y*3.4-t*.6+aData.w*5.0)*sin(r.z*2.6+t*.5);
      float broad=noise3(r*2.1+uBurstOffset+vec3(0,-t*.25,0));
      float curls=pow(.5+.5*sin(r.x*5.0+t*.55+aData.x*7.0)*cos(r.y*4.0-t*.45)*sin(r.z*4.5+t*.3),2.0);
      float shape=1.0+rolling*(.08+.045*uDetail)+(broad-.5)*.14+curls*(.13+.055*uDetail);
      return r*shape;
    }
    void main(){
      float t=uTime;vSeed=aData.x;vJet=aData.y;vAlong=aData.z;vAge=t;
      vec3 p=surface(position,t);
      vec3 tangent=normalize(cross(normal,abs(normal.y)>.98?vec3(1,0,0):vec3(0,1,0))),bitangent=cross(normal,tangent);
      vec3 dx=surface(normalize(position+tangent*.012),t)-p;
      vec3 dy=surface(normalize(position+bitangent*.012),t)-p;
      vec3 center;float swell,age;lobeMotion(t,center,swell,age);vAge=age;
      vec3 localNormal=normalize(cross(dx,dy));
      #if AIRBURST_JETS == 1
        vec3 d=uJetPaths[int(aData.y)].xyz;p=d*dot(p,d)*1.24+(p-d*dot(p,d));
        localNormal-=d*dot(localNormal,d)*(1.0-1.0/1.24);
      #else
        p*=vec3(1.08,.94,1.0);localNormal/=vec3(1.08,.94,1.0);
      #endif
      p=center+p*aLobe.w*swell;
      vSurface=p;vNormal=normalize(normalMatrix*normalize(localNormal));
      vec4 mv=modelViewMatrix*vec4(p*uSize,1.0);vView=mv.xyz;
      gl_Position=projectionMatrix*mv;
    }
  `,T=`
    uniform float uTime,uQuantity;uniform vec3 uColor,uBurstOffset;
    varying vec3 vSurface,vNormal,vView;varying float vSeed,vJet,vAlong,vAge;
    ${m}
    void main(){
      if(uTime<=0.0||uTime>=2.4)discard;
      #if AIRBURST_JETS == 1
        if(vJet>=uQuantity||vAge<=.001)discard;
      #endif
      float t=uTime;
      vec3 flow=vSurface*1.65+uBurstOffset+vec3(0,-t*.36,t*.12);
      float broad=billow(flow),fine=noise3(flow*3.0);
      float localTime=t-vSeed*.14-vAlong*.08;
      float erosion=smoothstep(.72,2.16,localTime);
      float matter=broad*.72+fine*.12+.22;
      float edge=matter-erosion;
      float coverage=smoothstep(-.035,.065,edge);
      coverage*=1.0-smoothstep(1.8,2.4,t);
      if(coverage<.48)discard;
      vec3 n=normalize(vNormal),view=normalize(-vView);
      vec3 light=normalize(mat3(viewMatrix)*vec3(-.45,.8,.45));
      float diffuse=max(0.0,dot(n,light));
      float rim=pow(1.0-max(0.0,dot(n,view)),1.65);
      float heatAge=t;
      #if AIRBURST_JETS == 1
        heatAge=t-vAlong*.157;
      #endif
      float burn=flameHeat(heatAge,broad);
      // Key lighting shapes cooler folds; it never multiplies white-hot emission.
      float hot=burn*(.78+(broad-.5)*1.0+rim*.17);
      float whiteHot=pow(smoothstep(.84,1.10,hot),2.2);
      vec3 soot=mix(vec3(.002,.0025,.004),vec3(.022,.025,.033),pow(diffuse,1.1));
      soot*=.80+broad*.30;
      // Compress emissive energy before the LDR output clips away the hot folds.
      vec3 warmSurface=heatColor(uColor,.24+hot*.52)*(.8+burn*1.6)*(.30+.70*diffuse)*${u.toFixed(1)};
      vec3 hotEmission=vec3(1.0,.46,.075)*(1.0+burn*${3 .toFixed(1)})*${u.toFixed(1)};
      vec3 thermalMix=vec3(whiteHot,whiteHot,pow(whiteHot,2.0));
      vec3 fire=mix(vec3(1.0)-exp(-warmSurface),vec3(1.0)-exp(-hotEmission),thermalMix);
      vec3 color=mix(soot,fire,smoothstep(.20,.72,burn));
      float residual=(1.0-smoothstep(.40,1.08,heatAge*1.4))*(1.0-burn);
      float seams=pow(smoothstep(.35,.72,broad),1.35);
      float hotEdges=(rim*1.35+pow(max(0.0,broad-.48)*2.0,3.0)*.45)*seams;
      vec3 edgeLight=heatColor(uColor,.60+hotEdges*.20)*hotEdges*residual*${(3*u).toFixed(1)};
      color+=(vec3(1.0)-color)*(vec3(1.0)-exp(-edgeLight));
      // A solid, dark billow first; irregular holes open before the last thin wisps fade.
      gl_FragColor=vec4(color,1.0);${c}
    }
  `;function E(t){let n=s(T,w,v,!1,{AIRBURST_JETS:+!!t});return n.transparent=!1,n.depthWrite=!0,n.blending=e.NoBlending,n.side=e.FrontSide,n}let D=a(S(!1),E(!1),1);D.name=`airburst-core`;let O=a(S(!0),E(!0),1);O.name=`airburst-jets`;let ee=[],k=[],A=[],j=[],M=[];for(let{lobe:e,data:t}of x){let n=ee.length/3;for(let[n,r]of[[-1,-1],[1,-1],[-1,1],[1,1]])ee.push(n,r,0),k.push((n+1)/2,(r+1)/2),A.push(...e),j.push(...t);M.push(n,n+1,n+2,n+2,n+1,n+3)}let N=new e.BufferGeometry;for(let[t,n,r]of[[`position`,ee,3],[`uv`,k,2],[`aLobe`,A,4],[`aData`,j,4]])N.setAttribute(t,new e.Float32BufferAttribute(n,r));N.setIndex(M),N.userData.coreIndexCount=x.filter(e=>e.data[1]<0).length*6,N.userData.jetIndexCount=x.filter(e=>e.data[1]===0).length*6;let P=s(`
    uniform vec3 uColor;varying vec2 vUv;varying float vHeat,vJet,vHot;
    void main(){
      float r=length((vUv-.5)*2.0);
      if(r>=1.0)discard; // Outside the original zero-alpha footprint.
      // Center-weighted soft falloff: no flat bright band around the silhouette.
      float softHalo=exp(-r*r*5.0)*.6+exp(-r*r*2.0)*.4;
      float alpha=softHalo*(1.0-smoothstep(.65,1.0,r));
      alpha*=vHeat*(vJet>=0.0?.085:.065)*${(3*u).toFixed(1)};
      if(alpha<.002)discard;
      vec3 tint=uColor*vec3(.72,.12,.06);
      tint=mix(tint,vec3(.85,.045,.008),vHot*exp(-r*r*8.0)*.12);
      gl_FragColor=vec4(tint,alpha);${c}
    }`,`
    uniform float uTime,uQuantity;uniform vec4 uJetPaths[6],uJetBends[6];uniform vec3 uBurstOffset;
    attribute vec4 aLobe,aData;varying vec2 vUv;varying float vHeat,vJet,vHot;
    ${m}
    ${C}
    void main(){
      vUv=uv;vJet=aData.y;vec3 center;float swell,age;lobeMotion(uTime,center,swell,age);
      float heatAge=uTime-(aData.y>=0.0?aData.z*.157:0.0);
      float pattern=billow(center*1.65+uBurstOffset+vec3(0,-uTime*.36,uTime*.12));
      vHot=flameHeat(heatAge,pattern);
      float cooling=1.0-smoothstep(.40,1.08,heatAge*1.4);
      vHeat=(1.0-exp(-age*30.0))*(vHot+cooling*(1.0-vHot)*.30);
      if(aData.y>=uQuantity||age<=0.0)vHeat=0.0;
      // Maximum fragment alpha occurs at the center. Skip an entire quad only
      // when even its center is below the existing fragment discard threshold.
      if(vHeat*(vJet>=0.0?.085:.065)*${(3*u).toFixed(1)}<.00199){gl_Position=vec4(2,2,2,1);return;}
      float bodyRadius=aLobe.w*swell*1.2;
      float radius=bodyRadius+(aData.y>=0.0?1.05:1.8)*min(1.0,swell);
      vec4 mv=modelViewMatrix*vec4(center*uSize,1.0);
      float scale=length(modelMatrix[1].xyz)*uSize;
      mv.xy+=position.xy*radius*scale;
      gl_Position=projectionMatrix*mv;
    }`,v,!0);P.blending=e.AdditiveBlending,P.forceSinglePass=!0,P.transparent=!1,P.depthTest=!0,P.depthWrite=!1;let F=a(N,P,0);F.name=`airburst-glow`;let I=()=>{let e=Math.round(r.uQuantity.value);O.geometry.setDrawRange(0,O.geometry.userData.jetIndexCount*e),N.setDrawRange(0,N.userData.coreIndexCount+N.userData.jetIndexCount*e)};O.onBeforeRender=I,F.onBeforeRender=I;let te=s(`uniform float uTime;uniform vec3 uColor;varying vec2 vLocal;
    void main(){
      float t=uTime,r=length(vLocal);
      float burst=smoothstep(0.0,.012,t)*(1.0-smoothstep(.028,.090,t));
      float disk=exp(-pow(r/1.13,6.0));
      float halo=exp(-r*r*.8)*.16;
      float alpha=(disk+halo)*burst;
      if(alpha<.002)discard;
      vec3 color=mix(mix(uColor,vec3(1.0,.63,.18),.7),vec3(1.0,.88,.56),disk);
      gl_FragColor=vec4(color*1.65*${u.toFixed(1)},clamp(alpha,0.0,1.0));${c}
    }`,`varying vec2 vLocal;void main(){
      vLocal=position.xy*vec2(6.4,4.4);
      float scale=length(modelMatrix[1].xyz)*uSize;
      vec4 mv=modelViewMatrix*vec4(0,0,0,1);mv.z+=1.35*scale;
      mv.xy+=vLocal*scale;gl_Position=projectionMatrix*mv;
    }`,{},!0);te.blending=e.AdditiveBlending,te.forceSinglePass=!0;let ne=a(new e.PlaneGeometry(1,1),te,4);ne.name=`airburst-flash`;let L=s(`uniform float uTime;uniform vec3 uBurstOffset;varying vec2 vWave;
    void main(){
      float r=length(vWave);if(r<.70||r>1.02)discard;
      float a=atan(vWave.y,vWave.x);
      float contour=.88+sin(a*11.0+uBurstOffset.x)*.042+sin(a*19.0+uBurstOffset.y)*.021+sin(a*5.0+uBurstOffset.z)*.027;
      float width=(.027+.008*sin(a*7.0+uBurstOffset.y))/1.5;
      float band=1.0-smoothstep(width*.4,width,abs(r-contour));
      float life=smoothstep(.035,.055,uTime)*(1.0-smoothstep(.045,.250,uTime));
      float alpha=band*life*.50;
      if(alpha<.003)discard;
      gl_FragColor=vec4(vec3(.27,.29,.34),alpha);${c}
    }`,`uniform float uTime;varying vec2 vWave;
    void main(){
      float t=max(0.0,uTime-.035),radius=1.5*min(5.8,.58+t*28.0);
      vWave=position.xy*2.0;vec4 mv=modelViewMatrix*vec4(0,0,0,1);
      mv.xy+=vWave*radius*uSize*length(modelMatrix[1].xyz);gl_Position=projectionMatrix*mv;
    }`,v,!1);L.forceSinglePass=!0;let R=a(new e.PlaneGeometry(1,1),L,2);R.name=`airburst-shockwave`;let z=[],re=[],ie=[],ae=[];for(let e=0;e<2;e++){let t=z.length/3;for(let t=0;t<=96;t++)for(let n=0;n<2;n++)z.push(0,0,0),re.push(t/96,n),ie.push(e);for(let e=0;e<96;e++){let n=t+e*2;ae.push(n,n+2,n+1,n+1,n+2,n+3)}}let B=new e.BufferGeometry;B.setAttribute(`position`,new e.Float32BufferAttribute(z,3)),B.setAttribute(`uv`,new e.Float32BufferAttribute(re,2)),B.setAttribute(`aArc`,new e.Float32BufferAttribute(ie,1)),B.setIndex(ae);let V=s(`
    uniform float uTime;uniform vec3 uColor,uBurstOffset;varying vec2 vUv;varying float vArc;
    ${m}
    void main(){
      float t=uTime-vArc*.035;
      float folds=noise3(vec3(vUv.x*15.0,vUv.y*1.9,uTime*1.8)+uBurstOffset+vArc*5.0);
      float tear=smoothstep(mix(.58,.34,vArc),mix(1.06,.85,vArc),t);
      float matter=folds*.65+sin(vUv.x*3.141593)*.35;
      float coverage=smoothstep(tear-.05,tear+.065,matter);
      float edge=abs(vUv.y-.5)*2.0;
      float alpha=(1.0-smoothstep(.62,1.0,edge))*pow(max(0.0,sin(vUv.x*3.141593)),.42)*coverage;
      alpha*=smoothstep(.055,.15,t)*(1.0-smoothstep(.75,1.08,t));
      if(alpha<.005)discard;
      float crease=pow(.5+.5*sin(vUv.x*33.0-uTime*7.0+vArc*4.0),2.0);
      vec3 tint=uColor*vec3(1.0,.16,.08);
      tint=mix(tint,vec3(1.0,.20,.025),crease*.30*(1.0-smoothstep(.15,.48,uTime)));
      gl_FragColor=vec4(tint*(1.25+folds*.65)*(1.0-vArc*.18)*${u.toFixed(1)},alpha);${c}
    }`,`
    uniform float uTime;uniform vec3 uBurstOffset;attribute float aArc;varying vec2 vUv;varying float vArc;
    vec3 ribbon(float u,float t){
      float phase=aArc*3.8+uBurstOffset.x*.11;
      float angle=u*(3.35-aArc*.45)+aArc*2.6+t*.55;
      float launch=1.0-exp(-max(0.0,t-.035)*24.0);
      float r=(2.02+aArc*.16+.20*sin(u*13.0-t*3.4+phase)+.10*sin(u*29.0+t*5.0))*launch;
      vec3 p=vec3(cos(angle)*r,sin(u*9.0-t*3.8+phase)*.30+sin(u*19.0+t*4.0)*.11,sin(angle)*r);
      float tilt=.35+aArc*.86;float y=p.y*cos(tilt)-p.z*sin(tilt);p.z=p.y*sin(tilt)+p.z*cos(tilt);p.y=y;
      p.y+=aArc*.16-(1.0-aArc)*(u-.5)*.85;return p;
    }
    void main(){
      vUv=uv;vArc=aArc;float t=max(0.0,uTime-aArc*.035);
      vec4 mv=modelViewMatrix*vec4(ribbon(uv.x,t)*uSize,1.0);
      vec4 next=modelViewMatrix*vec4(ribbon(uv.x+.004,t)*uSize,1.0);
      vec2 tangent=next.xy-mv.xy;tangent=length(tangent)>.0001?normalize(tangent):vec2(1,0);
      float width=(.10+.34*pow(max(0.0,sin(uv.x*3.141593)),.7))*(.68+.32*sin(uv.x*23.0-t*6.0+aArc));
      width*=1.0-smoothstep(.5,1.0,t)*.55;
      float twist=uv.x*10.0-t*4.0+aArc*.9;width*=(.65+.35*sin(twist))*mix(1.0,.24,aArc);
      mv.z+=(uv.y-.5)*width*sin(twist)*uSize*length(modelMatrix[1].xyz);
      mv.xy+=vec2(-tangent.y,tangent.x)*(uv.y-.5)*width*uSize*length(modelMatrix[1].xyz);
      gl_Position=projectionMatrix*mv;
    }`,v,!1);V.forceSinglePass=!0;let oe=a(B,V,3);oe.name=`airburst-arcs`;let H=[],U=[],se=[],W=[];for(let e=0;e<=28;e++)for(let t=0;t<2;t++)H.push(0,0,0),U.push(e/28,t),se.push(0);for(let e=0;e<28;e++){let t=e*2;W.push(t,t+2,t+1,t+1,t+2,t+3)}let G=H.length/3;for(let[e,t]of[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])H.push(e,t,0),U.push(e+.5,t+.5),se.push(1);W.push(G,G+1,G+2,G+2,G+1,G+3);let K=new e.BufferGeometry;K.setAttribute(`position`,new e.Float32BufferAttribute(H,3)),K.setAttribute(`uv`,new e.Float32BufferAttribute(U,2)),K.setAttribute(`aPart`,new e.Float32BufferAttribute(se,1)),K.setIndex(W);let q=s(`
    uniform vec3 uColor;varying vec2 vUv;varying float vFade,vPart,vLong;
    void main(){
      float alpha;vec3 color;vec3 particleColor=uColor;
      if(vPart>.5){
        float r=length((vUv-.5)*2.0);
        float core=exp(-r*r*28.0),halo=exp(-r*r*4.0)*(1.0-smoothstep(.65,1.0,r));
        alpha=(core*.98+halo*.48)*vFade;
        color=particleColor*(.5*${3 .toFixed(1)});
      }else{
        if(vLong<.5)discard;
        float edge=abs(vUv.y-.5)*2.0;
        alpha=exp(-edge*edge*3.5)*smoothstep(0.0,.16,vUv.x)*(.35+.50*vUv.x)*vFade;
        color=mix(vec3(.24,.20,.23),particleColor,pow(vUv.x,10.0));
      }
      if(alpha<.003)discard;
      gl_FragColor=vec4(color,alpha);${c}
    }`,`
    attribute vec4 seed;attribute float aPart;uniform float uTime;uniform vec3 uBurstOffset;
    varying vec2 vUv;varying float vFade,vPart,vLong;
    vec3 emberPath(float age,float isLong){
      // Fixed launch heading; drag slows expansion without steering the particle.
      float launchAngle=seed.x*6.283185+uBurstOffset.x*.17;
      float launchY=seed.y*1.82-.91;
      float horizontal=sqrt(max(0.0,1.0-launchY*launchY));
      vec3 launchDirection=vec3(cos(launchAngle)*horizontal,launchY,sin(launchAngle)*horizontal);
      float outwardDistance=(1.0-exp(-age*mix(3.8,2.5,isLong)))*mix(2.7+seed.z*2.0,5.15+seed.w*.15,isLong);
      float gravityDrop=age*age*(1.1+seed.w*.2);
      return launchDirection*(.12+outwardDistance)-vec3(0,gravityDrop,0);
    }
    void main(){
      vUv=uv;vPart=aPart;vLong=step(.90,seed.z);
      if(aPart<.5&&vLong<.5){vFade=0.0;gl_Position=vec4(2,2,2,1);return;}
      float age=max(0.0,uTime-.015-seed.w*.11);
      float life=mix(.55+seed.w*.5,1.38+seed.w*.28,vLong);
      vFade=smoothstep(0.0,.025,age)*(1.0-smoothstep(life*.54,life,age));
      vFade*=.88+.12*sin(age*(18.0+seed.y*15.0)+seed.x*11.0);
      float sampleAge=age;
      if(aPart<.5){sampleAge=max(0.0,age-(1.0-uv.x)*(.48+seed.w*.28));vFade*=smoothstep(0.0,.055,sampleAge)*vLong;}
      vec4 mv=modelViewMatrix*vec4(emberPath(sampleAge,vLong)*uSize,1.0);
      vec4 next=modelViewMatrix*vec4(emberPath(sampleAge+.008,vLong)*uSize,1.0);
      float scale=uSize*length(modelMatrix[1].xyz);
      // Perspective division also handles motion toward the camera.
      vec4 clip=projectionMatrix*mv,nextClip=projectionMatrix*next;
      vec2 projectedDelta=(nextClip.xy/max(nextClip.w,.0001)-clip.xy/max(clip.w,.0001))/vec2(projectionMatrix[0][0],projectionMatrix[1][1]);
      float projectedSpeed=length(projectedDelta)*max(-mv.z,.0001)/max(.008*scale,.0001);
      float directionWeight=smoothstep(.02,.20,projectedSpeed);
      vec2 tangent=length(projectedDelta)>.000001?normalize(projectedDelta):vec2(1,0);
      vec2 side=vec2(-tangent.y,tangent.x);
      if(aPart>.5){
        float diameter=1.5*mix(.105+seed.w*.075,.36+seed.w*.12,vLong);
        float streak=1.0+(1.0-vLong)*(1.0-smoothstep(.025,.22,age))*1.7*directionWeight;
        mv.xy+=(tangent*position.x*diameter*streak+side*position.y*diameter)*scale;
      }else{
        float width=1.5*(.045+seed.w*.035)*(.25+.75*uv.x);
        mv.xy+=side*(uv.y-.5)*width*scale*directionWeight;
      }
      gl_Position=projectionMatrix*mv;
    }`,v,!1);q.forceSinglePass=!0;let ce=o(K,n,1,q,4);return ce.name=`airburst-embers`,i.push(()=>{let e=Math.round(r.uTime.value*1e8)/1e8;I(),D.visible=e>0&&e<2.11,O.visible=e>0&&e<2.11,F.visible=e>0&&e<1.3,ne.visible=e>0&&e<.09,R.visible=e>.035&&e<.25,oe.visible=e>.055&&e<1.1,ce.visible=e>.015&&e<1.8}),!0}let m=Object.freeze({plasmaLife:.14,ejectionLife:.5,glintLife:.5,flareLife:.075,pressureLife:1,compressionStart:3.47,compressionScale:.65/3,coreFlashLife:.06,duration:5.15,lowerRadius:2.3,upperRadius:6.21,baseY:.04,height:4.4,centerY:2.24,chains:12,maxLinks:48,chainStart:.45,chainEnd:.85,chainBend:1.05,chainSettle:.4,orbStart:1.15,burst:3.65,settle:.036,attack:.012,overshoot:1.1,restRadius:.2,blastRadius:4.2,blastExpand:.08,breakTravel:.12,orbWarp:.125,blastPieces:252,blastLife:1.3,warpLife:1.5,warpCycles:10,warpPower:.495,warpRadius:4.2,waveRadius:10.6,waveWidth:4.3,waveExpand:.8,waveLife:.8,waveHeight:.18,arcGroups:6,arcLife:.16,fragmentScale:.5,fragmentImpulse:6.4,fragmentSpread:.6,auraTrail:.56,inkTrail:.84,auraCount:16,inkCount:12,inkMinRadius:7.8,inkRadius:10.1,inkCoreRadius:.72,inkTurnsMin:1,inkTurnsMax:2,inkLead:.18,inkPullLead:.28,fieldArcs:36,fieldLife:1.3}),h=[[1.35,.38],[1.85,.58],[2.3,.8],[2.7,1.02],[3.05,1.24],[3.35,1.45]],g=Object.freeze(h.flatMap(([e,t],n)=>Array.from({length:5},(r,i)=>Object.freeze([e+((h[n+1]?.[0]??3.65)-e)*i/5,(h[n-1]?.[1]??.2)+(t-(h[n-1]?.[1]??.2))*(i+1)/5])))),_=e=>Math.max(0,Math.min(1,e)),v=(e,t,n)=>{let r=_((n-e)/(t-e));return r*r*(3-2*r)};function y(e,t,n={}){if(e>=m.burst){let r=Math.round((e-m.burst)*1e6),i=11e4+t%5*11e3,a=r+t*19e3;return n.event=1e3+Math.floor(a/i),n.age=a%i/1e6,n.duration=.045+t%3*.01,n.alpha=+(r<25e3||n.age<n.duration)*(1-v(.9,m.fieldLife,r/1e6)),n}let r=143e3+t%7*9e3,i=65e4+t*17e3,a=Math.round(Math.min(e,m.burst)*1e6),o=Math.floor((a-i)/r);return n.event=Math.max(0,o),n.age=(a-i-o*r)/1e6,n.duration=.07+(t+Math.max(0,o)*3)%5*.01,n.alpha=+(o>=0&&n.age<n.duration),n}function b(e,t={}){let n=Number.isFinite(e)?Math.max(0,e):0,r=m.restRadius,i=0,a=Math.min(n,m.compressionStart);for(let[e,t]of g){if(a<e)break;let n=a-e,o=t*m.overshoot;if(n<m.attack){let e=_(n/m.attack);r+=(o-r)*(1-(1-e)**3),i=Math.sin(e*Math.PI*.5);break}if(n<m.attack+m.settle){let e=_((n-m.attack)/m.settle);r=o+(t-o)*(1-(1-e)**2),i=1-v(0,1,e);break}r=t}if(n>=m.compressionStart){i=0;for(let[e]of g){if(n<e)break;let t=n-e;if(t<m.attack){i=Math.sin(_(t/m.attack)*Math.PI*.5);break}if(t<m.attack+m.settle){i=1-v(0,1,_((t-m.attack)/m.settle));break}}let e=r,t=_((n-m.compressionStart)/(m.burst-m.compressionStart));r=e*(1-(1-m.compressionScale)*t*(.35+.65*t))}t.radius=r*v(m.orbStart,m.orbStart+.12,n),t.beat=i,t.flow=Math.max(0,n-m.orbStart)*.36;for(let[e]of g)t.flow+=.03*v(e-.044,e+.012,n);t.orbAlive=v(m.orbStart,m.orbStart+.1,n)*+(n<m.burst),t.blastRadius=g.at(-1)[1]+(m.blastRadius-g.at(-1)[1])*(1-(1-_((n-m.burst)/m.blastExpand))**3),t.jetTravel=1.25*(1-(1-_((n-m.burst-m.blastExpand)/(m.blastLife-m.blastExpand)))**3),t.jetFade=(1-_((n-m.burst-.25)/(m.blastLife-.25)))**2;let o=n-m.burst,s=_(o/m.warpLife);return t.warpFade=o>=0?(1-s)**1.25:0,t.warpKick=o>=0&&o<m.warpLife?Math.sin(s*Math.PI*2*m.warpCycles)*Math.exp(-s*3):0,t.waveRadius=g.at(-1)[1]+(m.waveRadius-g.at(-1)[1])*(1-(1-_((n-m.burst)/m.waveExpand))**5),t}function x(e,t,n={}){e=Math.round(e*1e6)/1e6;let r=19e4+t*13e3,i=Math.round(m.orbStart*1e6)+t*27e3,a=Math.round(Math.min(e,m.burst)*1e6),o=Math.floor((a-i)/r),s=(a-i-o*r)/1e6,c=(50+((o*7+t*3)%5+5)%5*10)/1e3;return n.event=Math.max(0,o),n.age=s,n.duration=c,n.alpha=e>=m.burst?1-v(.04,m.arcLife,e-m.burst):+(o>=0&&s<c),n.flash=e>=m.burst?1-v(.012,.04,e-m.burst):0,n}function S(e){let t=_((e-m.chainEnd)/m.chainSettle);return Math.exp(-1.6*t)*Math.cos(t*Math.PI*2)*(1-v(.75,1,t))}function C(e,t,n,r=[0,0,0]){for(let n=0;n<3;n++)r[n]=e.start[n]+(e.end[n]-e.start[n])*t;let i=S(n),a=Math.sin(t*Math.PI)*m.chainBend*i,o=Math.sin(t*Math.PI*2)*.16*i;return r[0]+=Math.cos(e.angle)*a-Math.sin(e.angle)*o,r[2]+=Math.sin(e.angle)*a+Math.cos(e.angle)*o,r}function w(e,t){return e.impactTime+Math.abs(t-e.impactU)/Math.max(e.impactU,1-e.impactU)*m.breakTravel}function T(e){let t=e>>>0,n=()=>(t=t*1664525+1013904223>>>0,t/4294967296),r=[],i=Math.PI*2;for(let e=0;e<m.chains;e++){let t=(e+.5)*i/m.chains+(n()-.5)*.08,a=e%2,o=a?m.upperRadius:m.lowerRadius,s=a?m.lowerRadius:m.upperRadius,c=Math.sqrt(.04+n()*(.82*.82-.04))*o,l=t+(n()-.5)*.1,u=Math.sqrt(.04+n()*(.82*.82-.04))*s,d={tier:a,angle:t,phase:n()*i,start:[0,m.baseY+a*m.height,0],end:[0,m.baseY+(1-a)*m.height,0],parameters:[],fragments:[],length:0,count:0,pitch:0};for(let e=0;e<=20;e++){let n=e/20,r=c+(.82*o-c)*n,i=u+(.82*s-u)*n;d.start[0]=Math.cos(t)*r,d.start[2]=Math.sin(t)*r,d.end[0]=Math.cos(l)*i,d.end[2]=Math.sin(l)*i;let a=d.end[0]-d.start[0],f=d.end[1]-d.start[1],p=d.end[2]-d.start[2],h=_(-(d.start[0]*a+(d.start[1]-m.centerY)*f+d.start[2]*p)/(a*a+f*f+p*p));if(Math.hypot(d.start[0]+a*h,d.start[1]+f*h-m.centerY,d.start[2]+p*h)>=1.98)break}d.length=Math.hypot(...d.end.map((e,t)=>e-d.start[t])),d.count=Math.min(m.maxLinks,Math.max(16,Math.ceil(d.length/.18)+1)),d.pitch=d.length/(d.count-1);for(let e=0;e<d.count;e++)d.parameters.push(e/(d.count-1));let f=d.end.map((e,t)=>e-d.start[t]);d.impactU=_(-(d.start[0]*f[0]+(d.start[1]-m.centerY)*f[1]+d.start[2]*f[2])/(d.length*d.length));let p=C(d,d.impactU,m.burst),h=Math.hypot(p[0],p[1]-m.centerY,p[2]),v=_((h-g.at(-1)[1])/(m.blastRadius-g.at(-1)[1]));d.impactTime=m.burst+m.blastExpand*(1-Math.cbrt(1-v)),r.push(d)}for(let e of r)for(let t=0;t<e.count;){let r=Math.min(e.count-t,[1,2,3,5][Math.floor(n()*4)]),i=[.55,.75,1,1.25,1.5][Math.floor(n()*5)];e.fragments.push({first:t,count:r,center:(t+(r-1)*.5)/(e.count-1),scale:i}),t+=r}return r}let E=Object.freeze([[[-.5,-.8,-.5,.8],[-.5,.8,.5,.8],[-.5,.15,.35,.15],[.35,.15,.35,-.3]],[[-.5,.8,.5,.8],[.5,.8,-.4,0],[-.4,0,.45,-.15],[.45,-.15,-.4,-.8]],[[0,-.8,0,.75],[-.55,.45,0,.1],[.55,.65,0,.1],[-.55,.45,-.55,.8]],[[-.55,-.35,0,.8],[0,.8,.55,-.35],[.55,-.35,-.55,-.35],[0,-.35,0,-.8]],[[-.5,-.7,-.5,.1],[-.5,.1,.05,.7],[0,-.7,0,0],[0,0,.55,.6]],[[-.45,.8,.35,.35],[.35,.35,-.35,-.1],[-.35,-.1,.45,-.8]],[[-.55,-.8,.55,-.8],[.55,-.8,.55,.75],[.55,.75,-.5,.75],[-.5,.75,-.5,-.3],[-.5,-.3,.15,-.3],[.15,-.3,.15,.25]],[[0,.8,.5,.2],[.5,.2,0,-.4],[0,-.4,-.5,.2],[-.5,.2,0,.8],[0,-.4,.3,-.8]],[[-.5,.6,.05,0],[.05,0,-.5,-.6],[-.5,-.6,-.5,.6],[.05,0,.55,.6],[.55,.6,.55,-.6],[.55,-.6,.05,0]],[[-.45,-.8,-.45,.8],[.45,-.8,.45,.8],[-.45,.5,.45,.5],[-.45,0,.45,0],[-.45,-.5,.45,-.5]],[[-.55,-.6,-.35,.8],[-.2,-.7,0,.7],[.15,-.8,.35,.6],[.5,-.8,.6,.5]],[[-.55,.7,.55,.7],[.55,.7,0,.1],[0,.1,-.55,.7],[0,.1,0,-.8],[-.4,-.35,0,-.6]],[[-.5,.8,-.5,-.65],[-.5,-.65,.35,-.65],[.35,-.65,.35,.1],[.35,.1,-.05,.1],[-.05,.1,-.05,.55]],[[-.5,-.8,-.5,.8],[-.5,.8,.4,.5],[.4,.5,-.5,.1],[-.5,.1,.55,-.8]],[[-.55,.8,-.1,.45],[-.1,.45,-.5,.05],[-.5,.05,-.1,-.45],[.05,.45,.5,.05],[.5,.05,.1,-.45],[.1,-.45,.55,-.8]],[[0,.8,-.5,.35],[-.5,.35,0,-.1],[0,-.1,.5,.35],[.5,.35,0,.8],[0,-.1,0,-.8],[-.4,-.5,.4,-.5]],[[-.5,-.8,.5,.8],[-.5,.8,.5,-.8],[-.5,.8,-.5,.35],[.5,-.8,.5,-.35]],[[-.5,.65,.5,.65],[.5,.65,.1,.1],[.1,.1,.5,-.65],[.5,-.65,-.5,-.65],[-.5,-.65,-.1,-.1],[-.1,-.1,-.5,.65]],[[0,.8,0,-.8],[-.55,.45,0,.1],[.55,.45,0,.1],[-.55,-.2,0,-.55],[.55,-.2,0,-.55]],[[-.5,.8,.1,.8],[.1,.8,.5,.35],[.5,.35,-.4,.35],[-.4,.35,-.4,-.35],[-.4,-.35,.4,-.35],[.4,-.35,.4,-.8]],[[-.5,.75,-.1,.75],[-.1,.75,.4,.15],[.4,.15,0,-.65],[0,-.65,-.5,-.65],[-.5,-.65,-.5,.1],[-.5,.1,.4,.15]],[[-.5,.8,.45,.35],[.45,.35,-.5,-.1],[-.5,-.1,.45,-.55],[-.5,-.55,.1,-.8]],[[-.5,-.8,-.5,.4],[-.5,.4,0,.8],[0,.8,.5,.4],[.5,.4,.5,-.8],[0,-.5,0,.35],[-.5,-.1,.5,-.1]],[[-.55,.7,.55,.7],[-.55,.2,.55,.2],[-.55,-.3,.55,-.3],[-.55,-.8,.55,-.8],[.35,-.8,-.1,-.3]]].map(e=>Object.freeze(e.map(e=>Object.freeze(e)))));function D({THREE:e,spec:t,cap:n,uniforms:r,materials:i,animated:a,mesh:o,instanced:s,shader:c,output:l}){if(t.id!==`darkchain-detonation`)return!1;let u=T(t.seed),d={},f=[],p={uJetTravel:{value:0},uJetFade:{value:1},uWarpKick:{value:0},uWarpFade:{value:0},uChainTension:{value:1},uFlow:{value:0},uOrbRadius:{value:0},uBeat:{value:0},uOrbAlive:{value:0},uBlastRadius:{value:g.at(-1)[1]},uWaveRadius:{value:g.at(-1)[1]}},h=Object.entries(m).map(([e,t])=>`const float DC_${e}=${Number(t).toFixed(6)};`).join(`
`),_=g.at(-1)[1],v=`const float DC_coreReleaseRadius=${b(m.burst).radius.toFixed(6)};const float DC_releaseRadius=${_.toFixed(6)};uniform float uJetTravel,uJetFade,uWarpKick,uWarpFade,uTime,uChainTension,uFlow,uOrbRadius,uBeat,uOrbAlive,uBlastRadius,uWaveRadius;const float TAU=6.28318530718;${h}
    float hash21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise21(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+1.0),f.x),f.y);}
    float mist(vec2 p){return noise21(p)*.57+noise21(p*2.07+3.1)*.29+noise21(p*4.13-1.7)*.14;}
    float charge(){return smoothstep(DC_orbStart,DC_burst,uTime);}
    float hash31(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
    float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);}
  `,C=(e,t,n=!0,r={})=>{let i=c(v+`uniform vec3 uColor;
`+e,v+t,{...p,...r},n);return i.userData.ownLifecycle=!0,i.forceSinglePass=!0,i},D=(e,t,n,r,i,a)=>{let s=o(e,t,r);return s.name=n,f.push({object:s,start:i,end:a}),s};function O(t,n,r){let i=new e.InstancedBufferGeometry;i.setIndex(t.index.clone());for(let[e,n]of Object.entries(t.attributes))i.setAttribute(e,n.clone());t.dispose();for(let[t,[r,a]]of Object.entries(n))i.setAttribute(t,new e.InstancedBufferAttribute(r,a));return i.instanceCount=r,i}let ee=new Float32Array(768);for(let e=0;e<24;e++)for(let t=0;t<8;t++)ee.set(E[e][t]??[4,4,4,4],(e*8+t)*4);let k=`varying vec2 vDisk;uniform float uTier;uniform vec4 uGlyphs[192];
    vec2 line(float d,float w){float aa=max(fwidth(d),.001),distance=abs(d);return vec2(1.0-smoothstep(w,w+aa,distance),exp(-pow(distance/(w*3.4+aa*1.5),1.5)));}
    vec2 segment(vec2 p,vec2 a,vec2 b,float width){vec2 v=b-a;return line(length(p-a-v*clamp(dot(p-a,v)/max(dot(v,v),.000001),0.0,1.0)),width);}
    vec2 magicLetter(vec2 p,float glyph){vec2 ink=vec2(0);for(int i=0;i<8;i++){vec4 stroke=uGlyphs[int(glyph)*8+i];ink=max(ink,segment(p,stroke.xy,stroke.zw,.065));}return ink;}
    void main(){float r=length(vDisk),a=atan(vDisk.y,vDisk.x),turn=uTime*.44*(uTier*2.0-1.0);
      vec2 edge=line(r-.965,.0035)+line(r-.935,.0025)*.8;
      vec2 frame=line(r-.84,.0025),hub=line(r-.23,.0025)+line(r-.205,.0018)*.7,glyphs=vec2(0),ornament=line(r-.30,.0015)+line(r-.545,.0015)+line(r-.615,.0015);
      for(int i=0;i<3;i++){
        float angle=1.57079633+float(i)*TAU/3.0,next=angle+TAU/3.0;
        vec2 axis=vec2(cos(angle),sin(angle)),other=vec2(cos(next),sin(next)),vertex=axis*.84,node=axis*.42;
        frame=max(frame,segment(vDisk,vertex,other*.84,.0025));
        frame=max(frame,segment(vDisk,axis*.23,vertex,.002));
        float corner=length(vDisk-vertex);frame=max(frame,(line(corner-.34,.002)+line(corner-.395,.002))*(1.0-smoothstep(.838,.845,r)));
        float small=length(vDisk-node);hub=max(hub,line(small-.115,.003));ornament=max(ornament,line(small-.095,.0015));
        float ticksAround=atan(vDisk.y-vertex.y,vDisk.x-vertex.x);ornament=max(ornament,line(sin(ticksAround*24.0),.07)*smoothstep(.348,.353,corner)*(1.0-smoothstep(.381,.387,corner))*(1.0-smoothstep(.838,.845,r)));
        vec2 q=vDisk-node;float rotation=angle+turn;q=mat2(cos(rotation),-sin(rotation),sin(rotation),cos(rotation))*q;
        vec2 symbol=line(length(q-vec2(.012,0))-.035,.004)*(1.0-smoothstep(.05,.055,q.x));
        symbol=max(symbol,segment(q,vec2(-.018,-.025),vec2(-.05,-.065),.004));symbol=max(symbol,segment(q,vec2(-.01,.03),vec2(-.045,.065),.004));symbol=max(symbol,segment(q,vec2(.04,0),vec2(.073,0),.004));glyphs=max(glyphs,symbol);
        hub=max(hub,segment(vDisk,-axis*.195,axis*.195,.0018));
      }
      // Match the inner inscription ring speed, with the opposite direction.
      // Wrap before glyph lookup so rotation cannot produce negative glyph indices.
      float letterPosition=fract((a+turn*.35)/TAU+.5)*60.0,letterIndex=floor(letterPosition);
      float glyph=mod(letterIndex*7.0+floor(letterIndex/24.0)*5.0+uTier*11.0,24.0);
      vec2 runes=vec2(0);if(abs(r-.885)<.045)runes=magicLetter(vec2((fract(letterPosition)-.5)*2.0,(r-.885)/.035),glyph);
      vec2 ticks=line(sin(a*48.0),.08)*smoothstep(.242,.245,r)*(1.0-smoothstep(.258,.261,r));
      for(int i=0;i<6;i++){
        float angle=(float(i)+.5)*TAU/6.0;vec2 axis=vec2(cos(angle),sin(angle)),side=vec2(-axis.y,axis.x),local=vec2(dot(vDisk,axis)-.63,dot(vDisk,side));
        ornament=max(ornament,line(abs(local.x)+abs(local.y)-.032,.0018));
        ornament=max(ornament,segment(vDisk,axis*.667,axis*.79,.0014));
        ornament=max(ornament,line(length(vDisk-axis*.79)-.012,.0017));
      }
      float innerPosition=((a-turn*.35)/TAU+.5)*48.0,innerIndex=floor(innerPosition);vec2 script=vec2(0);
      if(abs(r-.579)<.027)script=magicLetter(vec2((fract(innerPosition)-.5)*2.0,(r-.579)/.019),mod(innerIndex*11.0+floor(innerIndex/24.0)*7.0+uTier*5.0+240.0,24.0));
      ornament=max(ornament,script*.8);
      vec2 ink=edge*.8+frame*.60+hub*.65+glyphs*.80+runes*.42+(ticks*.35+ornament*.45)*min(uDetail,1.25);
      float life=smoothstep(0.0,.18,uTime)*(1.0-smoothstep(DC_burst+.08,DC_burst+.60,uTime))*smoothstep(-.04,.12,uTime/.35-fract(a/TAU+.5)*.35);
      float dim=1.0-smoothstep(DC_orbStart,DC_orbStart+.35,uTime)*.35;
      float core=smoothstep(.08,.30,ink.x),halo=clamp(ink.y*.8-ink.x*.45,0.0,1.0)*dim;
      float alpha=max(core,halo*.85)*life;if(r>1.0||alpha<.002)discard;
      float hue=smoothstep(-.75,.75,dot(vDisk,vec2(.8,.6)));
      vec3 black=vec3(.00012,.00008,.0002),corona=mix(vec3(1.0,.002,.035),uColor,hue)*(.90+uBeat*.14);
      gl_FragColor=vec4(mix(corona,black,core),alpha);${l}}`;for(let t=0;t<2;t++)D(new e.PlaneGeometry(2,2),C(k,`varying vec2 vDisk;uniform float uTier;
    void main(){vDisk=position.xy;float t=clamp(uTime/DC_chainStart,0.0,1.0),pop=1.0-pow(1.0-t,3.0)+sin(t*3.14159265)*.18;vec3 p=vec3(position.x*mix(DC_lowerRadius,DC_upperRadius,uTier)*pop,DC_baseY+uTier*DC_height,position.y*mix(DC_lowerRadius,DC_upperRadius,uTier)*pop);gl_Position=projectionMatrix*modelViewMatrix*vec4(p*uSize,1.0);}`,!1,{uTier:{value:t},uGlyphs:{value:ee}}),`darkchain-sigil-`+t,1,0,m.burst+.6);let A=m.chains*m.maxLinks,j={aLink:[new Float32Array(A*4),4],aBreak:[new Float32Array(A*4),4],aStart:[new Float32Array(A*4),4],aEnd:[new Float32Array(A*3),3],aShock:[new Float32Array(A*3),3]},M=0;for(let e of u)for(let t=0;t<e.fragments.length;t++){let n=e.fragments[t];for(let r=n.first;r<n.first+n.count;r++,M++)j.aLink[0].set([e.parameters[r],r,e.pitch/.18,e.angle],M*4),j.aBreak[0].set([n.center,t,e.phase,n.scale],M*4),j.aStart[0].set([...e.start,e.phase],M*4),j.aEnd[0].set(e.end,M*3),j.aShock[0].set([e.impactU,e.impactTime,Math.max(e.impactU,1-e.impactU)],M*3)}let N=O(new e.PlaneGeometry(1,1),j,M);N.userData.darkchainLayout=u;let P=`uniform float uHalo;varying float vAlive,vAlong,vFlight;varying vec2 vLink;
    void main(){if(vAlive<.005)discard;vec2 radii=vec2(.078,.1209),q=vLink/radii;float r=length(q);
      float d=(r-1.0)*r/max(length(vLink/(radii*radii)),.00001),aa=max(fwidth(d),.0005);
      float body=1.0-smoothstep(.017,.019+aa,abs(d));
      float running=1.0-step(DC_burst,uTime),head=fract(uFlow*.8),band=exp(-pow((vAlong-head)*22.0,2.0));
      float hit=step(0.0,vFlight)*(1.0-smoothstep(.008,.046,vFlight)),hot=band*(.02+uBeat*.02)*running+hit*.12;
      if(uHalo<.5){if(r<.001||hash21(gl_FragCoord.xy)>body*vAlive)discard;
        float light=.2+.8*max(0.0,dot(normalize(q),normalize(vec2(-.3,.8))));
        // Keep the solid link neutral black; all purple energy belongs to the halo.
        vec3 color=vec3(.00035)+vec3(.0008)*light+vec3(.0015)*hit;
        gl_FragColor=vec4(color,1.0);
      }else{float cardFade=(1.0-smoothstep(.125,.145,abs(vLink.x)))*(1.0-smoothstep(.180,.205,abs(vLink.y)));
        float halo=exp(-pow(abs(d)/.040,2.0))*(1.0-body)*cardFade,alpha=halo*(.72+hot*.35)*vAlive*(.75+.25*min(uDetail,1.5));
        if(r<.001||alpha<.003)discard;gl_FragColor=vec4(uColor,alpha);
      }
      ${l}
    }`;for(let t=0;t<2;t++){let n=C(P,`attribute vec4 aLink,aStart,aBreak;attribute vec3 aEnd,aShock;uniform float uHalo;varying float vAlive,vAlong,vFlight;varying vec2 vLink;
    vec3 path(float u){float tension=uChainTension;if(abs(tension)<.00001)return mix(aStart.xyz,aEnd,u);vec3 radial=vec3(cos(aLink.w),0,sin(aLink.w)),side=vec3(-sin(aLink.w),0,cos(aLink.w));return mix(aStart.xyz,aEnd,u)+(radial*sin(u*3.14159265)*DC_chainBend+side*sin(u*TAU)*.16)*tension;}
    vec3 spinFragment(vec3 v,vec3 axis,float angle){return v*cos(angle)+cross(axis,v)*sin(angle)+axis*dot(axis,v)*(1.0-cos(angle));}
    void main(){float u=aLink.x;vAlong=u;vLink=position.xy*vec2(.29,.41);
      float reach=mix(-.025,1.025,smoothstep(DC_chainStart,DC_chainEnd,uTime)),grow=smoothstep(u-.02,u+.02,reach)*step(DC_chainStart,uTime);
      vec3 center=path(u),delta=path(min(1.0,u+.002))-path(max(0.0,u-.002)),up=normalize(delta);
      float stretch=length(delta)/((min(1.0,u+.002)-max(0.0,u-.002))*length(aEnd-aStart.xyz));
      vec3 chunk=path(aBreak.x),radial=chunk-vec3(0,DC_centerY,0);float hitTime=aShock.y+abs(aBreak.x-aShock.x)/aShock.z*DC_breakTravel;vFlight=uTime-hitTime;
      float flight=max(0.0,vFlight),seed=fract(sin(aBreak.y*17.1+aBreak.z*31.7)*437.31),spin=flight*(4.0+seed*5.0),fragmentScale=mix(1.0,aBreak.w*DC_fragmentScale,smoothstep(0.0,.08,flight));
      vec3 axis=normalize(vec3(cos(seed*TAU),.35,sin(seed*TAU)));
      vec3 p=chunk+spinFragment((center-chunk)*fragmentScale,axis,spin)+normalize(radial)*((DC_fragmentImpulse+seed*DC_fragmentSpread)/sqrt(aBreak.w))*(1.0-exp(-flight*2.2))/2.2+vec3(0,-1.4*flight*flight,0);
      vec4 mv=modelViewMatrix*vec4(p*uSize,1.0);vec3 direction=(modelViewMatrix*vec4(spinFragment(up,axis,spin),0)).xyz;
      float perspective=1.0-step(.5,projectionMatrix[3][3]);vec2 projected=direction.xy-mv.xy*(direction.z/mv.z)*perspective;
      vec2 heading=normalize(projected+vec2(.000001,0)),across=vec2(heading.y,-heading.x);
      float foreshorten=clamp(length(projected)/max(length(direction),.000001),.22,1.0),narrow=mix(1.0,.58,mod(aLink.y,2.0));
      float scale=uSize*length(modelViewMatrix[0].xyz)*aLink.z*fragmentScale*grow;
      mv.xy+=(across*vLink.x*narrow+heading*vLink.y*stretch*foreshorten)*scale;
      vAlive=grow*(1.0-smoothstep(4.35,4.98,uTime));gl_Position=projectionMatrix*mv;
    }`,t===1,{uHalo:{value:t}});n.side=e.FrontSide,t||(n.transparent=!1,n.depthWrite=!0),D(N,n,t?`darkchain-chain-glow`:`darkchain-chain-body`,t?3:0,m.chainStart,5)}let F=new Float32Array(u.length*2*4),I=new Float32Array(u.length*2);u.forEach((e,t)=>{F.set([...e.start,0],t*8),F.set([...e.end,1],t*8+4),I[t*2]=w(e,e.fragments[0].center),I[t*2+1]=w(e,e.fragments.at(-1).center)}),D(O(new e.PlaneGeometry(1,1),{aAnchor:[F,4],aRelease:[I,1]},u.length*2),C(`varying vec2 vUv;varying float vArrival,vRelease;void main(){vec2 p=(vUv-.5)*2.0;float r=length(p),a=atan(p.y,p.x),ring=exp(-pow((r-.62)*18.0,2.0)),rays=pow(.5+.5*cos(a*6.0),12.0)*exp(-pow((r-.76)*10.0,2.0));float alpha=(ring*.7+rays*.4+exp(-r*r*9.0)*.25)*smoothstep(vArrival,vArrival+.12,uTime)*(1.0-smoothstep(vRelease,vRelease+.08,uTime))*(.55+step(vRelease,uTime)*.45);if(alpha<.003)discard;gl_FragColor=vec4(mix(uColor,vec3(.8,.62,1),ring*.25),alpha);${l}}`,`attribute vec4 aAnchor;attribute float aRelease;varying vec2 vUv;varying float vArrival,vRelease;void main(){vUv=uv;vRelease=aRelease;vArrival=mix(DC_chainStart,DC_chainEnd-.02,aAnchor.w);vec3 p=aAnchor.xyz+vec3(position.x*.4,.007,position.y*.4);gl_Position=projectionMatrix*modelViewMatrix*vec4(p*uSize,1.0);}`),`darkchain-root-seals`,3,m.chainStart,m.burst+m.blastExpand+m.breakTravel+.08);let te=new e.SphereGeometry(1,96,40),ne=C(`varying vec3 vLocal,vNormal,vView;
    void main(){if(uOrbAlive<.003)discard;vec3 p=normalize(vLocal);float energyTime=max(0.0,uTime-DC_orbStart),turn=-energyTime*.90;
      p.xz=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*p.xz;
      float tilt=sin(energyTime*1.4)*.28;p.yz=mat2(cos(tilt),-sin(tilt),sin(tilt),cos(tilt))*p.yz;
      vec3 churn=vec3(sin(p.y*3.1+energyTime*2.1),sin(p.z*2.7-energyTime*1.7),cos(p.x*3.4+energyTime*1.9))*.24;
      float field=noise3(p*2.35+churn+vec3(.4+energyTime*.16,energyTime*.32,1.7-energyTime*.21)),fine=noise3(p*4.3-churn*.7+vec3(6.2,1.3+energyTime*.23,-energyTime*.28));
      field+=(fine-.5)*.07;float aa=max(fwidth(field),.0015),boundary=abs(field-.515);
      float membrane=smoothstep(.36,.405,field)*(1.0-smoothstep(.505,.52,field));
      float edge=1.0-smoothstep(.003,.009+aa,boundary);
      float diffusion=exp(-boundary*38.0),pulse=.72+uBeat*.38;
      float hue=smoothstep(-.7,.7,p.x*.7+p.y*.4+sin(uFlow*.3)*.25);
      vec3 violet=uColor,crimson=vec3(1.0,.002,.035),energy=mix(crimson,violet,hue);
      // Broad translucent-looking masses are shaded on the existing opaque core;
      // dark cavities preserve depth and readability without scene refraction.
      vec3 color=vec3(.0008,.0003,.002)+uColor*.006;
      color+=energy*(membrane*.19+diffusion*.34)*pulse;
      color+=energy*1.35*edge*(1.05+uBeat*.55);
      float folded=dot(p,vec3(.7,.45,.4))+.21*abs(p.y*3.0-.4)-.19*abs(p.z*4.0+.7)-.12;
      float fissure=(1.0-smoothstep(.002,.006+fwidth(folded),abs(folded)))*smoothstep(.56,.68,fine);
      color+=mix(energy,vec3(1,.30,.38),.15)*fissure*(.10+uBeat*.4)*min(uDetail,1.25);
      // Broad traveling energy outline stays on the opaque core: no extra shell or draw.
      vec3 surface=normalize(vLocal);float facing=abs(dot(normalize(vNormal),normalize(vView)));
      float outlineWave=sin(dot(surface,vec3(5.0,7.0,-4.0))-energyTime*6.0)+.35*sin(dot(surface,vec3(-8.0,3.0,6.0))+energyTime*9.0);
      float width=clamp(.52+outlineWave*.475,.20,.78),band=1.0-smoothstep(width-.09,width+.035,facing);
      color=mix(color,vec3(.00010,.00006,.00016),band);
      if(hash21(gl_FragCoord.xy)>uOrbAlive)discard;gl_FragColor=vec4(color,1);${l}}`,`varying vec3 vLocal,vNormal,vView;void main(){vLocal=position;float warp=1.0+DC_orbWarp*sin(position.y*7.0+uFlow*2.0)*sin(position.x*5.0-position.z*4.0);vec3 p=position*uOrbRadius*warp+vec3(0,DC_centerY,0);vec4 mv=modelViewMatrix*vec4(p*uSize,1);vNormal=normalize(normalMatrix*normal);vView=-mv.xyz;gl_Position=projectionMatrix*mv;}`,!1);ne.side=e.FrontSide,ne.transparent=!1,ne.depthWrite=!0,D(te,ne,`darkchain-orb-body`,0,m.orbStart,m.burst);let L=C(`varying vec2 vHalo;void main(){float r=length(vHalo)*1.45;
      if(uTime>=DC_burst){float age=uTime-DC_burst,fade=1.0-smoothstep(.008,DC_coreFlashLife,age),light=exp(-r*r*5.5)*(1.0-smoothstep(.65,1.2,r));if(light*fade<.003)discard;vec3 corona=mix(vec3(.8,.001,.06),uColor,smoothstep(.12,.85,r));vec3 hot=mix(corona,vec3(1.0,.42,.68),1.0-smoothstep(.08,.36,r));gl_FragColor=vec4(hot*8.0,light*fade*.95);${l} return;}if(uOrbAlive<.003||r>1.45)discard;float glow=exp(-pow((r-.98)/.20,2.0))*(1.0-smoothstep(1.18,1.45,r));float alpha=glow*(.52+uBeat*.18)*uOrbAlive*(.8+.2*min(uDetail,1.5));if(alpha<.003)discard;gl_FragColor=vec4(uColor,alpha);${l}}`,`varying vec2 vHalo;void main(){vHalo=uv*2.0-1.0;vec4 center=modelViewMatrix*vec4(vec3(0,DC_centerY,0)*uSize,1);center.xy+=position.xy*(uTime>=DC_burst?DC_releaseRadius:uOrbRadius)*2.9*uSize*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*center;}`,!0);L.side=e.FrontSide,D(new e.PlaneGeometry(1,1),L,`darkchain-orb-halo`,2,m.orbStart,m.burst+m.coreFlashLife);let R=new Float32Array(24),z=new Float32Array(24),re={};for(let e=0;e<6;e++)for(let t=0;t<2;t++)R.set([e,t],(e*2+t)*2);D(O(new e.PlaneGeometry(1,1,12,1),{aArc:[R,2]},12),C(`varying vec2 vUv;varying float vAlpha,vFlash,vFork;
    void main(){float q=abs(vUv.y*2.0-1.0),tip=smoothstep(0.0,.06,vUv.x)*(1.0-smoothstep(.83,1.0,vUv.x));
      float alpha=(1.0-smoothstep(.42,1.0,q))*tip*vAlpha*mix(1.0,.7,vFork);if(alpha<.003)discard;
      vec3 color=mix(uColor,vec3(.94,.83,1),(.46+vFlash*.4)*(1.0-smoothstep(.12,.65,q)));
      gl_FragColor=vec4(color*(1.0+vFlash*.35),alpha);${l}}`,`attribute vec2 aArc;uniform vec4 uArcs[6];uniform float uArcSeed;varying vec2 vUv;varying float vAlpha,vFlash,vFork;
    vec3 arcPoint(float u,float event,float fork){
      float seed=uArcSeed+aArc.x*19.0+event*13.0,longitude=aArc.x*TAU/6.0+hash21(vec2(seed,1))*.75,latitude=(hash21(vec2(seed,2))-.5)*1.65;
      vec3 axis=vec3(cos(longitude)*cos(latitude),sin(latitude),sin(longitude)*cos(latitude)),side=normalize(cross(axis,vec3(0,1,0))),up=cross(side,axis);
      float tilt=hash21(vec2(seed,3))*TAU;vec3 along=side*cos(tilt)+up*sin(tilt),across=cross(along,axis);
      float v=mix(u,.5+u*.36,fork),k=v*12.0,index=floor(k),jitter=mix(hash21(vec2(seed,index)),hash21(vec2(seed,index+1.0)),fract(k))-.5;
      return normalize(axis+along*((v-.5)*1.40)+across*(jitter*.32*sin(v*3.14159265)+fork*u*.46));
    }
    void main(){vUv=uv;vec4 state=uArcs[int(aArc.x)];vAlpha=state.x;vFlash=state.z;vFork=aArc.y;
      if(vAlpha<.001){gl_Position=vec4(0,0,2,1);return;}
      float b=max(0.0,uTime-DC_burst),radius=uOrbRadius*(1.035+smoothstep(0.0,.16,b)*.58);
      vec3 center=vec3(0,DC_centerY,0);
      vec4 mv=modelViewMatrix*vec4((arcPoint(uv.x,state.y,aArc.y)*radius+center)*uSize,1),a=modelViewMatrix*vec4((arcPoint(min(1.0,uv.x+.005),state.y,aArc.y)*radius+center)*uSize,1),z=modelViewMatrix*vec4((arcPoint(max(0.0,uv.x-.005),state.y,aArc.y)*radius+center)*uSize,1);
      vec2 tangent=normalize(a.xy-z.xy+vec2(.00001,0));float width=mix(.052,.024,aArc.y)*(.8+state.z*.7);
      mv.xy+=vec2(-tangent.y,tangent.x)*position.y*width*uSize*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;
    }`,!0,{uArcs:{value:z},uArcSeed:{value:(t.seed>>>0)%4093}}),`darkchain-orb-arcs`,4,m.orbStart,m.burst+m.arcLife);let ie=new Float32Array(m.fieldArcs*4),ae=new Float32Array(m.fieldArcs*4),B={};for(let e=0;e<m.fieldArcs;e++)for(let t=0;t<2;t++)ie.set([e,t],(e*2+t)*2);D(O(new e.PlaneGeometry(1,1,20,1),{aField:[ie,2]},m.fieldArcs*2),C(`varying vec2 vUv;varying float vAlpha,vFieldRed;
    void main(){float q=abs(vUv.y*2.0-1.0),tip=mix(.7,1.0,smoothstep(0.0,.08,vUv.x)*(1.0-smoothstep(.92,1.0,vUv.x)));
      float core=1.0-smoothstep(.28,.36,q),edge=exp(-pow((q-.43)*15.0,2.0)),corona=exp(-q*q*3.5);
      float alpha=max(core,max(edge,corona*.55))*vAlpha*tip;if(alpha<.005)discard;
      vec3 coronaColor=mix(mix(uColor,vec3(.67,.12,1),.25),vec3(.35,.0007,.01225),vFieldRed);
      vec3 color=mix(coronaColor*(.45+edge*.95),vec3(.0002,.0001,.0004),core);
      gl_FragColor=vec4(color,alpha);${l}}`,`attribute vec2 aField;uniform vec4 uField[36];uniform float uFieldSeed;varying vec2 vUv;varying float vAlpha,vFieldRed;
    vec3 fieldPoint(float u,float event,float fork){
      vec3 point=vec3(0.0);
      float seed=uFieldSeed+aField.x*31.7+event*17.3,angle=(aField.x+.5)*TAU/DC_fieldArcs+(hash21(vec2(seed,1))-.5)*.36;
      if(uTime>=DC_burst){
        float latitude=1.0-2.0*(aField.x+.5)/DC_fieldArcs,longitude=aField.x*2.39996323;
        vec3 direction=vec3(cos(longitude)*sqrt(1.0-latitude*latitude),latitude,sin(longitude)*sqrt(1.0-latitude*latitude));
        vec3 side=normalize(cross(direction,vec3(0,1,0))),up=cross(side,direction);
        float v=mix(u,.38+u*.52,fork),k=v*6.0,j=floor(k),age=max(0.0,uTime-DC_burst);
        float jitter=mix(hash21(vec2(seed,j)),hash21(vec2(seed,j+1.0)),fract(k))-.5;
        float distance=3.1+hash21(vec2(aField.x,uFieldSeed)) *2.05,reach=mix(1.6,distance,1.0-pow(1.0-clamp(age/.10,0.0,1.0),3.0));
        float tilt=hash21(vec2(seed,8))*TAU;vec3 along=normalize(side*cos(tilt)+up*sin(tilt)+direction*.25),across=cross(direction,along);
        float span=.48+hash21(vec2(seed,9))*.62;
        point=vec3(0,DC_centerY,0)+direction*reach+along*((v-.5)*span)+across*(jitter*.24+fork*u*.22);
      }else{
      float v=mix(u,.35+u*.38,fork),k=v*20.0,j=floor(k);
      float jag=mix(hash21(vec2(seed,j)),hash21(vec2(seed,j+1.0)),fract(k))-.5;
      float bend=sin(v*3.14159265),r=DC_lowerRadius*mix(sqrt(.015+hash21(vec2(seed,2))*.88),sqrt(.015+hash21(vec2(seed,3))*.88),v);
      angle+=v*(hash21(vec2(seed,4))-.5)*1.1+jag*.38*bend+fork*u*.38;
      point=vec3(cos(angle)*r,DC_baseY+v*DC_height,sin(angle)*r);
      }return point;
    }
    void main(){vUv=uv;vec4 state=uField[int(aField.x)];vAlpha=state.x;vFieldRed=step(DC_burst,uTime)*step(.5,hash21(vec2(aField.x,uFieldSeed+47.0)));
      if(vAlpha<.001){gl_Position=vec4(0,0,2,1);return;}
      vec4 mv=modelViewMatrix*vec4(fieldPoint(uv.x,state.y,aField.y)*uSize,1);
      vec4 ahead=modelViewMatrix*vec4(fieldPoint(min(1.0,uv.x+.002),state.y,aField.y)*uSize,1),behind=modelViewMatrix*vec4(fieldPoint(max(0.0,uv.x-.002),state.y,aField.y)*uSize,1);
      vec3 velocity=ahead.xyz-behind.xyz;float perspective=1.0-step(.5,projectionMatrix[3][3]);vec2 tangent=normalize(velocity.xy-mv.xy*(velocity.z/mv.z)*perspective+vec2(.00001,0));
      float width=mix(.11,.055,aField.y)*(.85+hash21(vec2(aField.x,state.y))*.35)*(1.0+step(DC_burst,uTime)*.25);
      mv.xy+=vec2(-tangent.y,tangent.x)*position.y*width*uSize*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;
    }`,!1,{uField:{value:ae},uFieldSeed:{value:(t.seed>>>0)%4093}}),`darkchain-field-lightning`,4,.65,m.burst+m.fieldLife);let V=`
    float inkProgress(float time,float start){float q=(min(time,DC_burst)-start)/(DC_burst-start);return DC_inkPullLead*q+(1.0-DC_inkPullLead)*pow(max(0.0,q),2.0);}
    float inkTime(float progress,float start){float a=1.0-DC_inkPullLead,q=progress<0.0?progress/DC_inkPullLead:(-DC_inkPullLead+sqrt(DC_inkPullLead*DC_inkPullLead+4.0*a*progress))/(2.0*a);return start+q*(DC_burst-start);}
    vec3 inkPoint(float sampleTime,vec4 seed,float start){
      float q=clamp((sampleTime-start)/(DC_burst-start),0.0,1.0),pull=clamp(inkProgress(sampleTime,start),0.0,1.0);
      float budget=mix(DC_inkTurnsMin,DC_inkTurnsMax,seed.z),turns=DC_inkLead*q+(budget-DC_inkLead)*q*q,angle=seed.x*TAU+TAU*turns;
      float r=mix(mix(DC_inkMinRadius,DC_inkRadius,seed.w),DC_inkCoreRadius,pull);
      float baseLatitude=(seed.y*2.0-1.0)*.96,tilt=.2+seed.w*.25;
      float latitude=baseLatitude*cos(tilt)+sqrt(1.0-baseLatitude*baseLatitude)*sin(tilt)*sin(angle+seed.z*TAU);
      float side=sqrt(max(0.0,1.0-latitude*latitude));
      vec3 direction=vec3(cos(angle)*side,latitude,sin(angle)*side);
      vec3 center=vec3(0,DC_centerY,0),p=center+direction*r;
      return p+normalize(p-center)*(1.0-exp(-max(0.0,sampleTime-DC_burst)*18.0))*.85;
    }
    vec4 inkTrail(vec4 seed,float start,float span,float width,out float valid,out vec2 coreOffset){
      // Tail is an earlier inward position. Intake stays visible while heads enter the core.
      float turnBudget=mix(DC_inkTurnsMin,DC_inkTurnsMax,seed.z);
      // Keep the visible tail below 0.30 turn: one clean arc, never an S-shaped coil.
      float headQ=clamp((uTime-start)/(DC_burst-start),0.0,1.0),headTurn=DC_inkLead*headQ+(turnBudget-DC_inkLead)*headQ*headQ;
      float tailTurn=max(0.0,headTurn-.30),a=turnBudget-DC_inkLead;
      float tailQ=(-DC_inkLead+sqrt(DC_inkLead*DC_inkLead+4.0*a*tailTurn))/(2.0*a);
      float headProgress=inkProgress(uTime,start),minimumProgress=DC_inkPullLead*tailQ+(1.0-DC_inkPullLead)*tailQ*tailQ;
      float tailProgress=max(minimumProgress,headProgress-span*.75*min(1.0,.85/turnBudget));
      float progress=mix(tailProgress,headProgress,uv.x);
      float sampleTime=inkTime(progress,start)+max(0.0,uTime-DC_burst);valid=1.0;
      vec4 mv=modelViewMatrix*vec4(inkPoint(sampleTime,seed,start)*uSize,1);
      vec4 next=modelViewMatrix*vec4(inkPoint(sampleTime+.002,seed,start)*uSize,1);
      vec4 prior=modelViewMatrix*vec4(inkPoint(sampleTime-.002,seed,start)*uSize,1);
      float perspective=1.0-step(.5,projectionMatrix[3][3]);
      // Perspective derivative keeps the narrow stroke perpendicular to visible motion.
      vec3 velocity=next.xyz-prior.xyz;vec2 tangent=normalize(velocity.xy-mv.xy*(velocity.z/mv.z)*perspective+vec2(.00001,0));
      mv.xy+=vec2(-tangent.y,tangent.x)*position.y*width*uSize*length(modelViewMatrix[0].xyz);
      vec4 core=modelViewMatrix*vec4(0,DC_centerY*uSize,0,1);
      coreOffset=(mv.xy-core.xy*(mv.z/core.z))/(mix(.3,1.45,charge())*uSize*length(modelViewMatrix[0].xyz));
      return mv;
    }
  `;function oe(e,n){let r=new Float32Array(e*4),i=(t.seed>>>0^(n===`aAura`?3742535:8004561))>>>0,a=()=>(i=Math.imul(i,1664525)+1013904223>>>0,i/4294967296);for(let t=0;t<e;t++)r.set([(t+a()*.65)/e,a(),a(),a()],t*4);return{[n]:[r,4]}}D(O(new e.PlaneGeometry(1,1,24,1),oe(m.auraCount,`aAura`),m.auraCount),C(`vec3 inkBrush(vec2 uv,float seed,float travel){
    float u=uv.x,q=uv.y*2.0-1.0;
    float grain=noise21(vec2(u*17.0-travel,seed*27.0));
    float profile=pow(max(0.0,sin(u*3.14159265)),.82)*(.84-u*.18);
    float edge=profile*(.91+grain*.07),aa=max(fwidth(q)*1.2,.012);
    float body=1.0-smoothstep(edge-aa,edge+aa,abs(q));
    float hairs=noise21(vec2(u*2.0-travel*.15,q*31.0+seed*39.0));
    float dry=smoothstep(.42,.72,hairs)*smoothstep(.04,.28,u)*smoothstep(.02,.20,abs(q));
    body*=1.0-dry*.08*min(uDetail,1.0);
    float rim=(1.0-smoothstep(.012,.065,abs(q-edge*.88)))*smoothstep(.36,.68,grain);
    return vec3(body,dry,rim);
  }varying vec2 vUv,vCoreOffset;varying float vSeed,vValid;
    void main(){vec3 brush=inkBrush(vUv,vSeed,uTime*.6);float b=max(0.0,uTime-DC_burst);
      float life=smoothstep(.32,.65,uTime)*(1.0-smoothstep(.04,.24,b))*(.60+.40*charge());
      float gap=smoothstep(.85,1.10,length(vCoreOffset)),alpha=brush.x*life*gap*vValid*.98;if(alpha<.003)discard;
      float flash=step(DC_burst,uTime)*(1.0-smoothstep(.008,.065,b));
      vec3 tint=mix(vec3(1.0,.003,.012),uColor,smoothstep(.25,.75,fract(vSeed*3.17)));
      float pigment=smoothstep(.16,.48,vSeed)*smoothstep(.06,.78,vUv.x);
      vec3 ink=mix(vec3(.00015,.0001,.0003),tint*.045,pigment);
      vec3 edge=tint*brush.z*(.035+flash*.10)*min(uDetail,1.5);
      gl_FragColor=vec4(ink+edge,alpha);${l}}`,V+`attribute vec4 aAura;varying vec2 vUv,vCoreOffset;varying float vSeed,vValid;
    void main(){vUv=uv;vSeed=aAura.z;vec4 mv=inkTrail(aAura,.32,DC_auraTrail,.065+aAura.w*.025,vValid,vCoreOffset);gl_Position=projectionMatrix*mv;}`,!1),`darkchain-black-aura`,2,.32,m.burst+.24),D(O(new e.PlaneGeometry(1,1,32,1),oe(m.inkCount,`aStream`),m.inkCount),C(`vec3 inkBrush(vec2 uv,float seed,float travel){
    float u=uv.x,q=uv.y*2.0-1.0;
    float grain=noise21(vec2(u*17.0-travel,seed*27.0));
    float profile=pow(max(0.0,sin(u*3.14159265)),.82)*(.84-u*.18);
    float edge=profile*(.91+grain*.07),aa=max(fwidth(q)*1.2,.012);
    float body=1.0-smoothstep(edge-aa,edge+aa,abs(q));
    float hairs=noise21(vec2(u*2.0-travel*.15,q*31.0+seed*39.0));
    float dry=smoothstep(.42,.72,hairs)*smoothstep(.04,.28,u)*smoothstep(.02,.20,abs(q));
    body*=1.0-dry*.08*min(uDetail,1.0);
    float rim=(1.0-smoothstep(.012,.065,abs(q-edge*.88)))*smoothstep(.36,.68,grain);
    return vec3(body,dry,rim);
  }varying vec2 vUv,vCoreOffset;varying float vSeed,vValid;
    void main(){vec3 brush=inkBrush(vUv,vSeed,uTime*.9);float b=max(0.0,uTime-DC_burst);
      float life=smoothstep(.65,1.15,uTime)*(1.0-smoothstep(.025,.16,b))*(.60+.40*charge());
      float alpha=brush.x*.98*life*vValid*smoothstep(.82,1.02,length(vCoreOffset));if(alpha<.003)discard;
      float flash=step(DC_burst,uTime)*(1.0-smoothstep(.01,.07,b));
      vec3 tint=mix(vec3(1.0,.003,.012),uColor,smoothstep(.25,.75,fract(vSeed*3.17)));
      float pigment=smoothstep(.16,.48,vSeed)*smoothstep(.06,.78,vUv.x);
      vec3 ink=mix(vec3(.00015,.0001,.0003),tint*.045,pigment);
      vec3 edge=tint*brush.z*(.04+pow(vUv.x,3.0)*.06+flash*.12)*min(uDetail,1.5);
      gl_FragColor=vec4(ink+edge,alpha);${l}}`,V+`attribute vec4 aStream;varying vec2 vUv,vCoreOffset;varying float vSeed,vValid;
    void main(){vUv=uv;vSeed=aStream.z;vec4 mv=inkTrail(aStream,.65,DC_inkTrail,.08+aStream.w*.03,vValid,vCoreOffset);gl_Position=projectionMatrix*mv;}`,!1),`darkchain-inward-ribbons`,2,.65,m.burst+.16);let H=`varying vec2 vUv;varying float vAlpha,vSeed,vHot;
    void main(){vec2 p=(vUv*2.0-1.0)*2.2;float shape=abs(p.x)+abs(p.y);
      float core=1.0-smoothstep(.82,1.0,shape);
      float halo=exp(-shape*shape*.52)*(1.0-smoothstep(1.65,2.15,shape));
      float alpha=max(core,halo*.98)*vAlpha;if(alpha<.003)discard;
      vec3 corona=mix(uColor,vec3(1.0,.002,.035),step(.65,vSeed));
      vec3 color=mix(corona*(1.65+vHot*.45),vec3(.00010,.00006,.00016),core);gl_FragColor=vec4(color,alpha);${l}}`,U=s(new e.PlaneGeometry(1,1),Math.round(n*2/3),2/3,C(H,`attribute vec4 seed;varying vec2 vUv;varying float vAlpha,vSeed,vHot;
    void main(){vUv=uv;vSeed=seed.z;float q=fract(max(0.0,uTime-DC_orbStart)*.55+charge()*charge()*.35+seed.x),a=seed.y*TAU+(1.0-q)*2.4,r=mix(3.5,.08,pow(q,.8));vec3 p=vec3(cos(a)*r,DC_centerY+(seed.w-.5)*3.7*(1.0-q),sin(a)*r);vHot=(.2+charge()*.5)*pow(q,3.0);vAlpha=smoothstep(DC_orbStart,1.4,uTime)*smoothstep(0.0,.12,q)*(1.0-smoothstep(.88,1.0,q))*.8;vec4 mv=modelViewMatrix*vec4(p*uSize,1);float size=(.035+seed.z*.065)*2.2;float dr=-3.42*.8*pow(max(q,.001),-.2);vec3 velocity=vec3(cos(a)*dr+sin(a)*r*2.4,-(seed.w-.5)*3.7,sin(a)*dr-cos(a)*r*2.4);vec3 viewVelocity=(modelViewMatrix*vec4(velocity*uSize,0)).xyz;float perspective=1.0-step(.5,projectionMatrix[3][3]);vec2 heading=normalize(viewVelocity.xy-mv.xy*(viewVelocity.z/mv.z)*perspective+vec2(.00001,0)),side=vec2(-heading.y,heading.x);mv.xy+=(side*position.x*.6+heading*position.y*1.6)*size*uSize*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;}`,!1),5);U.name=`darkchain-inward-particles`,f.push({object:U,start:m.orbStart,end:m.burst});let se=`varying vec2 vUv;varying float vAlpha,vSeed,vHot;
    void main(){vec2 p=vUv*2.0-1.0;float shape=abs(p.x)+abs(p.y),core=1.0-smoothstep(.68,.76,shape);
      float halo=exp(-shape*shape*2.1)*(1.0-smoothstep(1.55,1.9,shape)),alpha=max(core,halo*.90)*vAlpha;if(alpha<.003)discard;
      vec3 corona=mix(uColor,vec3(1.0,.002,.035),step(.5,vSeed));
      vec3 color=mix(corona*(1.35+vHot*.30),vec3(.00010,.00006,.00016),core);
      gl_FragColor=vec4(color,alpha);${l}}`,W=s(new e.PlaneGeometry(1,1),Math.round(n/3),1/3,C(se,`attribute vec4 seed;varying vec2 vUv;varying float vAlpha,vSeed,vHot;
    void main(){vUv=uv;vSeed=seed.z;float b=max(0.0,uTime-DC_burst),radius=DC_releaseRadius+(2.6+seed.x*.4)*(1.0-exp(-b*3.2));vec3 direction=normalize(vec3(cos(seed.y*TAU),seed.w*1.7-.85,sin(seed.y*TAU)));vec3 p=vec3(0,DC_centerY,0)+direction*radius;p.y-=b*b*.45;vAlpha=smoothstep(0.0,.035,b)*(1.0-smoothstep(.35,1.15,b));vHot=(1.0-smoothstep(.05,.65,b))*.85;vec4 mv=modelViewMatrix*vec4(p*uSize,1);vec3 velocity=direction*(2.6+seed.x*.4)*3.2*exp(-b*3.2)+vec3(0,-b*.9,0);vec3 viewVelocity=(modelViewMatrix*vec4(velocity*uSize,0)).xyz;float perspective=1.0-step(.5,projectionMatrix[3][3]);vec2 heading=normalize(viewVelocity.xy-mv.xy*(viewVelocity.z/mv.z)*perspective+vec2(.00001,0)),side=vec2(-heading.y,heading.x);mv.xy+=(side*position.x*.7+heading*position.y*1.8*(.9+.3*seed.x))*(.06+seed.z*.15)*uSize*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;}`,!1),5);W.name=`darkchain-debris`,f.push({object:W,start:m.burst,end:5});let G=new e.PlaneGeometry(1,1,1,32),K=new Float32Array(m.blastPieces*4),q=new Float32Array(m.blastPieces*4),ce=new Float32Array(m.blastPieces);for(let e=0;e<m.blastPieces;e++){let n=e*17%29/29,r=1-2*(e+.5)/m.blastPieces,i=e*2.399963229728653+t.seed*.001,a=Math.sqrt(1-r*r);K.set([Math.cos(i)*a,r,Math.sin(i)*a,n],e*4);let o=e%28%5==0;ce[e]=o?1:.35+n*.15,q.set([(o?3.4+n*.3:2+n*.7)*.2,(o?.38+n*.06:.12+n*.06)*.25,e*1.73,(e%2?1:-1)*(.8+n)],e*4)}let le=O(G,{aBurst:[K,4],aShape:[q,4],aStrength:[ce,1]},m.blastPieces),J=`uniform float uBlastLayer;varying vec2 vUv;varying float vSeed,vStrength;
    void main(){float t=uTime-DC_burst,u=vUv.y,q=(vUv.x-.5)*2.0,flash=1.0-smoothstep(.006,.035,t),life=uJetFade;
      float flow=mist(vec2(u*13.0-t*30.0,vSeed*19.0)),edgeLimit=.78+flow*.20;
      float coverage=1.0-smoothstep(edgeLimit-.15,edgeLimit,abs(q));
      float slit=(1.0-smoothstep(.025,.10,abs(q+.24)))*smoothstep(.48,.76,flow)*smoothstep(.025,.08,t);
      float alpha=coverage*(1.0-slit*.82)*life*smoothstep(0.0,.055,u)*vStrength;if(alpha<.003)discard;
      float fray=exp(-pow((q-edgeLimit+.075)*25.0,2.0))*smoothstep(.38,.67,flow);
      float thread=(1.0-smoothstep(.025,.09,abs(q+sin(u*7.0-t*40.0+vSeed*6.0)*.34)))*flow;
      vec3 ink=vec3(.0003,.0001,.0007)+uColor*(.001+flow*.002);
      vec3 edgeColor=mix(uColor,vec3(.75,.001,.045),step(.78,vSeed)*.8);
      vec3 glow=mix(edgeColor,vec3(.94,.80,1),flash*.75);
      if(uBlastLayer>.5)alpha*=fray*.30+thread*.07*min(uDetail,1.5)+flash*.72*smoothstep(.25,.80,u);
      if(alpha<.003)discard;gl_FragColor=vec4(uBlastLayer<.5?ink:glow,alpha);${l}}
  `;for(let t=0;t<2;t++){let n=C(J,`attribute vec4 aBurst,aShape;attribute float aStrength;varying vec2 vUv;varying float vSeed,vStrength;
    void main(){float t=max(0.0,uTime-DC_burst),u=uv.y;vUv=uv;vSeed=aBurst.w;vStrength=aStrength;
      float shrink=.45+.55*uJetFade,stretch=1.0+.16*smoothstep(0.0,.035,t);
      float head=uBlastRadius*mix(.84,1.0,aBurst.w)+uJetTravel;
      float jetLength=min(aShape.x*stretch,head-.12)*shrink;
      vec3 axis=aBurst.xyz,side=normalize(cross(axis,abs(axis.y)>.9?vec3(1,0,0):vec3(0,1,0))),up=cross(side,axis);
      float bend=sin(u*3.14159265),wave=u*8.0-t*38.0+aShape.z;
      vec3 p=axis*(head-(1.0-u)*jetLength)+side*sin(wave)*bend*(.045+aBurst.w*.045)*shrink+up*sin(wave*.67+aShape.w)*bend*.035*shrink+vec3(0,DC_centerY,0);
      vec4 mv=modelViewMatrix*vec4(p*uSize,1.0);vec2 direction=(modelViewMatrix*vec4(axis,0)).xy,screenSide=normalize(vec2(-direction.y,direction.x)+vec2(.00001,0));
      float profile=pow(max(0.0,sin(u*3.14159265)),.65)*(1.0-u*.72);
      mv.xy+=screenSide*position.x*aShape.y*profile*shrink*uSize*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;}
  `,t===1,{uBlastLayer:{value:t}});n.side=e.DoubleSide,D(le,n,t?`darkchain-blast`:`darkchain-blast-ink`,t?6:4,m.burst,m.burst+m.blastLife)}let ue=new Float32Array(16),Y=new Float32Array(16),X=[[.42,.15,-.55],[-.72,1.82,.32],[1.14,3.75,-.28],[-.24,5.16,1.03]];for(let t=0;t<4;t++){ue.set([t%2?.12:-.15,e.MathUtils.degToRad([128,106,140,116][t]),e.MathUtils.degToRad([30,23,35,26][t]),t*.006],t*4);let n=new e.Quaternion().setFromEuler(new e.Euler(...X[t]));Y.set([n.x,n.y,n.z,n.w],t*4)}let de=O(new e.PlaneGeometry(1,1,32,8),{aPressureShape:[ue,4],aPressureRotation:[Y,4]},4),Z=`attribute vec4 aPressureShape,aPressureRotation;uniform float uPressureGlow;
    varying vec2 vPressureUV;varying vec3 vPressureLocal;varying float vPressureAge;
    
    float pressureRadius(float t){
      if(t<.08){float q=clamp(t/.08,0.0,1.0);return mix(DC_coreReleaseRadius,4.2,1.0-pow(1.0-q,3.0));}
      float q=clamp((t-.08)/(DC_pressureLife-.08),0.0,1.0);return 4.2+.4*(1.0-(1.0-q)*(1.0-q));
    }
    vec3 pressureRotate(vec3 p,vec4 q){return p+2.0*cross(q.xyz,cross(q.xyz,p)+q.w*p);}
  
    void main(){float globalAge=uTime-DC_burst,age=max(0.0,globalAge-aPressureShape.w);
      float radius=pressureRadius(age),catchup=smoothstep(.045,DC_pressureLife*.92,age);
      float inner=mix(DC_coreReleaseRadius*.28,radius-.10,catchup),u=uv.x,v=uv.y;
      float angle=(u-.5)*aPressureShape.y+aPressureShape.x;
      float latitude=(v-.5)*aPressureShape.z;
      float r=mix(inner,radius,v);
      vec3 direction=vec3(cos(angle)*cos(latitude),sin(latitude),sin(angle)*cos(latitude));
      vec3 local=pressureRotate(direction*r,aPressureRotation);
      vPressureUV=uv;vPressureLocal=local;vPressureAge=globalAge-aPressureShape.w;
      // Broad, open energy surfaces. The inner boundary catches the outward front.
      if(uPressureGlow>.5)local=pressureRotate(direction*(r+(v-.5)*.08),aPressureRotation);
      gl_Position=projectionMatrix*modelViewMatrix*vec4((local*1.12+vec3(0,DC_centerY,0))*uSize,1.0);}
  `,fe=`uniform float uPressureGlow;
    varying vec2 vPressureUV;varying vec3 vPressureLocal;varying float vPressureAge;
    void main(){float globalAge=uTime-DC_burst,t=vPressureAge;if(t<0.0||globalAge>=DC_pressureLife)discard;
      float u=vPressureUV.x,v=vPressureUV.y;
      // Coherent local-space texture travels radially; no camera-dependent pattern.
      vec3 flow=vPressureLocal*exp(-t*1.3);
      float coarse=noise3(flow*1.05),grain=noise3(flow*3.1);
      float erosion=smoothstep(.30,DC_pressureLife,globalAge);
      float holes=smoothstep(.31+erosion*.48,.53+erosion*.43,coarse*.8+grain*.2);
      float sideGrain=noise3(vec3(u*7.0,v*.8-t*3.0,2.7));
      float sideCut=.08+(1.0-v)*.10+(grain-.5)*.12;
      float ends=smoothstep(sideCut,sideCut+.13,u)*(1.0-smoothstep(1.0-sideCut-.16,1.0-sideCut,u));
      ends*=smoothstep(.24,.55,sideGrain)*(1.0-smoothstep(.90+(grain-.5)*.10,1.0,v));
      float rim=.88+(grain-.5)*.10;
      float crest=exp(-pow((v-rim)/.065,2.0));
      float surface=smoothstep(0.0,.16,v)*(1.0-smoothstep(.84,1.0,v));
      float fade=pow(1.0-smoothstep(.18,DC_pressureLife,globalAge),1.15);
      float alpha=surface*.88*ends*holes*fade;
      vec3 energy=mix(uColor,vec3(.95,.002,.055),smoothstep(.25,.75,coarse));
      energy=pow(energy/max(max(energy.r,energy.g),max(energy.b,.001)),vec3(1.3));
      // Keep pigment black. Only the separate rim pass emits red/violet light.
      vec3 color=vec3(.00018,.00008,.00024);
      if(uPressureGlow>.5){alpha=crest*.35*ends*holes*fade*smoothstep(.65,.78,v)*(1.0-smoothstep(.92,1.0,v));color=energy*2.25;}
      if(alpha<.003)discard;gl_FragColor=vec4(color,alpha);${l}}
  `;D(de,C(fe,Z,!1,{uPressureGlow:{value:0}}),`darkchain-energy-surface`,5,m.burst,m.burst+m.pressureLife),D(de,C(fe,Z,!0,{uPressureGlow:{value:1}}),`darkchain-energy-surface-glow`,6,m.burst,m.burst+m.pressureLife);let pe=new Float32Array(128),me=new Float32Array(128);for(let e=0;e<32;e++){let n=(t.seed+e*43)%127/127,r=1-2*(e+.5)/32,i=e*2.39996323+n*.24,a=Math.sqrt(1-r*r);pe.set([Math.cos(i)*a,r,Math.sin(i)*a,2.7+n*2],e*4),me.set([n,e%5==0?.46:.1+n*.09,e%3*.004,e%5==0?1:.65],e*4)}D(O(new e.PlaneGeometry(1,1,12,1),{aEjectDirection:[pe,4],aEjectSeed:[me,4]},32),C(`varying vec2 vEject;varying vec4 vEjectSeed;varying float vEjectAge;
    void main(){float age=(uTime-DC_burst)/DC_ejectionLife,t=vEjectAge;if(t<0.0||age>=1.0)discard;
      float u=vEject.x,v=(vEject.y-.5)*2.0;
      float grain=noise3(vec3(u*6.0-t*18.0,v*2.0,vEjectSeed.x*17.0));
      float width=.14+.12*grain;
      float filament=1.0-smoothstep(width*.3,width,abs(v));
      float glow=exp(-v*v*9.0)*.35+exp(-v*v*4.0)*.35*(1.0-smoothstep(.15,.65,u));
      float ends=smoothstep(0.0,.05,u)*(1.0-smoothstep(.80,1.0,u));
      float breaks=smoothstep(.13+smoothstep(.45,1.0,age)*.65,.36+smoothstep(.45,1.0,age)*.65,grain);
      float fade=pow(1.0-clamp(age,0.0,1.0),2.0),heat=1.0-smoothstep(.025,.095,age);
      vec3 energy=mix(uColor,vec3(1.0,.001,.055),vEjectSeed.x);
      vec3 color=mix(energy*2.4,vec3(1.0,.55,.76)*3.0,filament*heat*(1.0-u)*(1.0-u));
      // Only the trailing third sheds sparks; the head and leading shaft remain continuous.
      float separate=smoothstep(.18,.45,age),sparks=0.0;
      for(int j=0;j<4;j++){
        float seed=hash21(vec2(vEjectSeed.x*53.0,float(j)+11.0));
        float scatter=hash21(vec2(vEjectSeed.x*71.0,float(j)+29.0));
        float sizeSeed=hash21(vec2(vEjectSeed.x*97.0,float(j)+47.0));
        float released=max(0.0,age-(.18+sizeSeed*.09));
        float drift=1.0-exp(-released*(3.0+scatter*3.0));
        // Fixed seeds: uneven release positions and lateral drift, never frame-to-frame jitter.
        float center=.045+seed*.19+drift*(scatter-.4)*.09;
        float lateral=(scatter*2.0-1.0)*.66*drift;
        float halfLength=mix(.038,.008+.017*sizeSeed,separate),halfWidth=.075+sizeSeed*.13;
        vec2 spark=vec2((u-center)/halfLength,(v-lateral)/halfWidth);
        float solid=1.0-smoothstep(.15,1.0,length(spark));
        float halo=exp(-dot(spark,spark)*.85)*.55;
        sparks+=(solid+halo)*(.65+sizeSeed*.55)*smoothstep(0.0,.055,released);
      }
      float line=(filament+glow)*breaks;
      float tailOnly=1.0-smoothstep(.27,.42,u);
      float alpha=mix(line,sparks,separate*tailOnly)*ends*fade*vEjectSeed.w;
      if(alpha<.003)discard;gl_FragColor=vec4(color,alpha);${l}}
  `,`attribute vec4 aEjectDirection,aEjectSeed;
    varying vec2 vEject;varying vec4 vEjectSeed;varying float vEjectAge;
    void main(){float age=(uTime-DC_burst)/DC_ejectionLife-aEjectSeed.z,t=max(age,0.0),u=uv.x;
      float tip=1.0+aEjectDirection.w*(1.0-exp(-t*34.0));
      float root=tip*smoothstep(.15,1.0,t),r=mix(root,tip,u);
      vec3 local=aEjectDirection.xyz*r;
      vec4 mv=modelViewMatrix*vec4((local+vec3(0,DC_centerY,0))*uSize,1.0);
      vec3 velocity=mat3(modelViewMatrix)*aEjectDirection.xyz;
      float projectedLength=length(velocity.xy);
      vec2 across=projectedLength>.001?vec2(-velocity.y,velocity.x)/projectedLength:vec2(1,0);
      float envelope=.28+.72*pow(max(0.0,sin(u*3.14159265)),.65);
      float width=aEjectSeed.y*envelope*(1.0-.55*smoothstep(.04,1.0,t));
      mv.xy+=across*(uv.y-.5)*width*4.0*uSize*length(modelViewMatrix[0].xyz);
      vEject=uv;vEjectSeed=aEjectSeed;vEjectAge=age;gl_Position=projectionMatrix*mv;}
  `,!0),`darkchain-core-ejection`,6,m.burst,m.burst+m.ejectionLife);let Q=C(`varying vec3 vPlasmaLocal,vPlasmaNormal,vPlasmaView;
    void main(){float t=uTime-DC_burst;if(t<0.0||t>=DC_plasmaLife)discard;
      vec3 flow=vPlasmaLocal*(1.7-t*5.0);
      float coarse=noise3(flow),grain=noise3(flow*2.1+vec3(t*12.0,0,0));
      float tear=smoothstep(.035,DC_plasmaLife,t),field=coarse*.75+grain*.25;
      float coverage=1.0-smoothstep(field-.06,field+.06,tear);
      float fade=1.0-smoothstep(.075,DC_plasmaLife,t);
      float facing=abs(dot(normalize(vPlasmaNormal),normalize(vPlasmaView)));
      float fissure=1.0-smoothstep(.025,.11,abs(field-.52));
      float heat=1.0-smoothstep(.015,.055,t);
      // Color travels across the curved volume independently of its erosion/alpha.
      float rim=pow(1.0-facing,.65);
      vec3 red=vec3(.95,.002,.045),violet=uColor*1.35;
      vec3 energy=mix(vec3(.035,.0005,.085),red,smoothstep(.04,.46,rim));
      energy=mix(energy,violet,smoothstep(.28,.60,rim));
      vec3 color=energy*(.65+.55*smoothstep(.25,.75,field));
      color=mix(color,vec3(2.8,1.1,1.6),heat*pow(facing,10.0)*.85);
      color+=energy*fissure*(1.0-heat)*.45;
      // A broad clear center grades into the colored outer volume, independent of erosion.
      float projectedRadius=sqrt(max(0.0,1.0-facing*facing))*1.14;
      float radialOpacity=smoothstep(.55,.82,projectedRadius)*(1.0-smoothstep(.80,1.08,projectedRadius));
      float corona=exp(-pow((projectedRadius-.88)/.16,2.0))*smoothstep(.56,.74,projectedRadius)*(1.0-smoothstep(.92,1.12,projectedRadius));
      float alpha=coverage*fade*(radialOpacity*.52+corona*.22);
      color+=mix(red,violet,smoothstep(.68,.90,projectedRadius))*corona*.65;
      if(alpha<.003)discard;
      gl_FragColor=vec4(color,alpha);${l}}
  `,`varying vec3 vPlasmaLocal,vPlasmaNormal,vPlasmaView;
    void main(){float t=max(0.0,uTime-DC_burst),q=clamp(t/.055,0.0,1.0);
      float radius=mix(DC_coreReleaseRadius*.92,2.15,1.0-pow(1.0-q,3.0));
      vec3 n=normalize(position);float grain=noise3(n*3.3+vec3(t*9.0,0,-t*7.0));
      float lobes=sin(n.x*8.0+n.y*3.0)*sin(n.z*7.0-n.y*5.0);
      vec3 local=n*radius*(.88+grain*.23+lobes*.08);
      vec4 mv=modelViewMatrix*vec4((local*1.14+vec3(0,DC_centerY,0))*uSize,1.0);
      vPlasmaLocal=local;vPlasmaNormal=normalize(normalMatrix*normal);vPlasmaView=-mv.xyz;
      gl_Position=projectionMatrix*mv;}
  `,!1);Q.side=e.FrontSide,D(new e.SphereGeometry(1,24,16),Q,`darkchain-release-plasma`,3,m.burst,m.burst+m.plasmaLife);let he=new Float32Array(80);for(let e=0;e<20;e++)he.set([e,(t.seed+e*31)%113/113,(t.seed+e*67)%127/127,(t.seed+e*17)%97/97],e*4);D(O(new e.PlaneGeometry(1,1),{aGlint:[he,4]},20),C(`varying vec2 vGlintUV;varying vec4 vGlintSeed;varying float vGlintAlpha;
    void main(){vec2 p=abs(vGlintUV*2.0-1.0);float shape;
      if(vGlintSeed.x<2.0){float along=vGlintSeed.x<.5?p.x:p.y,across=vGlintSeed.x<.5?p.y:p.x;float taper=.012+.48*pow(1.0-along,2.8);shape=exp(-pow(across/taper,2.0)*3.0)*pow(1.0-along,1.4);}
      else shape=exp(-p.x*28.0-p.y*3.0)+exp(-p.y*28.0-p.x*3.0)+exp(-dot(p,p)*18.0)*.35;
      float alpha=shape*vGlintAlpha;if(alpha<.003)discard;
      vec3 color=mix(uColor,vec3(1.0,.005,.06),vGlintSeed.y)*2.2;
      color=mix(color,vec3(2.5,1.2,1.8),exp(-dot(p,p)*16.0)*.85);
      if(vGlintSeed.x<2.0)color*=5.4;gl_FragColor=vec4(color,alpha);${l}}
  `,`attribute vec4 aGlint;varying vec2 vGlintUV;varying vec4 vGlintSeed;varying float vGlintAlpha;
    void main(){float t=uTime-DC_burst;vGlintUV=uv;vGlintSeed=aGlint;vec3 local=vec3(0);float span,width;
      if(aGlint.x<2.0){float life=1.0-smoothstep(.015,DC_flareLife,t);vGlintAlpha=life;span=mix(4.0,12.5,1.0-exp(-max(t,0.0)*70.0));width=1.2;}
      else{float delay=.045+aGlint.y*.07,age=max(0.0,t-delay),y=1.0-2.0*(aGlint.x-1.5)/18.0,angle=aGlint.x*2.39996323+aGlint.y;
        vec3 dir=vec3(cos(angle)*sqrt(max(0.0,1.0-y*y)),y,sin(angle)*sqrt(max(0.0,1.0-y*y)));
        float travel=1.0-exp(-age*10.0);local=dir*mix(1.8,3.6+aGlint.z*2.6,travel);
        float flicker=pow(max(0.0,sin(age*(28.0+aGlint.w*30.0)+1.0)),4.0);
        vGlintAlpha=step(delay,t)*(1.0-smoothstep(.23,DC_glintLife,t))*(.18+.82*flicker);
        span=(.13+aGlint.z*.21)*(1.0-age*.6);width=span;}
      vec4 mv=modelViewMatrix*vec4((local+vec3(0,DC_centerY,0))*uSize,1.0);
      vec2 p=position.xy;if(aGlint.x<2.0){if(aGlint.x<.5)p*=vec2(span,width);else p*=vec2(width,span*.76);}else p*=span;
      mv.xy+=p*uSize*length(modelViewMatrix[0].xyz);gl_Position=projectionMatrix*mv;}
  `,!0),`darkchain-impact-glints`,7,m.burst,m.burst+Math.max(m.glintLife,m.flareLife)),D(O(new e.PlaneGeometry(1,1),oe(24,`aSmoke`),24),C(`varying vec2 vSmokeUV,vSmokeOffset;varying float vSmokeSeed,vSmokeAge;
    void main(){float age=vSmokeAge;if(age<.06||uTime>=DC_duration)discard;
      vec2 p=vSmokeUV*2.0-1.0;float radial=length(p);
      float cloud=mist(p*2.4+vec2(vSmokeSeed*31.0-age*.38,age*.28));
      float billow=1.0-smoothstep(.28+cloud*.24,.86+cloud*.10,radial);
      float texture=.35+.65*smoothstep(.20,.75,cloud);
      float life=smoothstep(.06,.32,age)*pow(1.0-smoothstep(.62,DC_duration-DC_burst,age),.65);
      float centerGap=.10+.90*smoothstep(.8,2.3,length(vSmokeOffset));
      float alpha=billow*texture*life*centerGap*.34;if(alpha<.003)discard;
      vec3 black=vec3(.00025,.00012,.00035),red=vec3(.075,.0007,.004),purple=vec3(.027,.0007,.065);
      vec3 pigment=vSmokeSeed<.34?black:(vSmokeSeed<.67?red:purple);
      vec3 color=mix(black,pigment,smoothstep(.18,.72,cloud));
      gl_FragColor=vec4(color,alpha);${l}}
  `,`attribute vec4 aSmoke;varying vec2 vSmokeUV,vSmokeOffset;varying float vSmokeSeed,vSmokeAge;
    void main(){float age=uTime-DC_burst;vSmokeAge=age;vSmokeSeed=aSmoke.z;vSmokeUV=uv;
      float q=clamp(age/(DC_duration-DC_burst),0.0,1.0),travel=1.0-pow(1.0-q,3.0);
      float angle=aSmoke.x*TAU,latitude=(aSmoke.y*2.0-1.0)*.85,side=sqrt(1.0-latitude*latitude);
      vec3 direction=vec3(cos(angle)*side,latitude,sin(angle)*side);
      vec3 p=vec3(0,DC_centerY,0)+direction*mix(1.9,4.1,travel);p.y+=q*(.25+aSmoke.w*.5);
      vec4 mv=modelViewMatrix*vec4(p*uSize,1.0),center=modelViewMatrix*vec4(0,DC_centerY*uSize,0,1);
      float span=mix(1.6,2.8,travel)*(.75+aSmoke.w*.45),scale=uSize*length(modelViewMatrix[0].xyz);
      vec2 card=position.xy;float turn=aSmoke.z*TAU+age*(aSmoke.w-.5)*.45;
      card=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*card;
      mv.xy+=card*span*scale;
      vSmokeOffset=(mv.xy-center.xy*(mv.z/center.z))/max(scale,.0001);
      gl_Position=projectionMatrix*mv;}
  `,!1),`darkchain-after-smoke`,3,m.burst+.06,m.duration);let $=new e.MeshPhysicalMaterial({transmission:1,roughness:0,metalness:0,transparent:!0,depthWrite:!1,depthTest:!0,side:e.FrontSide});$.uniforms={...r,...p},$.userData.ownLifecycle=!0,$.forceSinglePass=!0,$.vertexShader=v+`uniform float uSize;varying vec2 vLens;varying vec4 vScreen,vCenter;
    void main(){vLens=position.xy*2.0;vec4 center=modelViewMatrix*vec4(0,DC_centerY*uSize,0,1);vCenter=projectionMatrix*center;
      float scale=uSize*length(modelViewMatrix[0].xyz);center.xy+=position.xy*(DC_warpRadius*2.0)*scale;vScreen=projectionMatrix*center;gl_Position=vScreen;}`,$.fragmentShader=v+`varying vec2 vLens;varying vec4 vScreen,vCenter;uniform sampler2D transmissionSamplerMap;uniform vec2 transmissionSamplerSize;
    void main(){float r=length(vLens);if(r>=1.0)discard;
      vec2 uv=vScreen.xy/vScreen.w*.5+.5,center=vCenter.xy/vCenter.w*.5+.5;
      // Broad C1-continuous radial falloff, with zero slope at the outer boundary.
      // Fade through each pulse zero instead of switching an entire refracted patch.
      float feather=1.0-smoothstep(.08,1.0,r);vec2 delta=(uv-center)*uWarpKick*DC_warpPower*feather;
      vec2 inset=.5/max(transmissionSamplerSize,vec2(1));vec3 sceneColor=texture2D(transmissionSamplerMap,clamp(uv+delta,inset,1.0-inset)).rgb;
      float coverage=feather*feather*uWarpFade*smoothstep(0.0,.12,abs(uWarpKick));
      gl_FragColor=vec4(sceneColor,coverage);`+l+` }`,$.onBeforeCompile=e=>{Object.assign(e.uniforms,$.uniforms),e.vertexShader=$.vertexShader,e.fragmentShader=$.fragmentShader,$.userData.transmissionUniforms=e.uniforms},$.customProgramCacheKey=()=>$.vertexShader+`
`+$.fragmentShader,i.add($),D(new e.PlaneGeometry(1,1),$,`darkchain-impact-refraction`,0,m.burst,m.burst+m.warpLife);let ge=[],_e=[],ve=[],ye=[[0,-.5],[0,.5],[.24,.5],[1,0],[.24,-.5],[0,-.5]];for(let e=0;e<=160;e++){let t=e/160*Math.PI*2;for(let[e,n]of ye){let r=m.waveRadius-m.waveWidth*(1-e);ge.push(Math.cos(t)*r,m.centerY+n*m.waveHeight,Math.sin(t)*r),_e.push(e,n)}}for(let e=0;e<160;e++)for(let t=0;t<ye.length-1;t++){let n=e*ye.length+t,r=n+ye.length;ve.push(n,r,n+1,r,r+1,n+1)}let be=new e.BufferGeometry;be.setAttribute(`position`,new e.Float32BufferAttribute(ge,3)),be.setAttribute(`uv`,new e.Float32BufferAttribute(_e,2)),be.setIndex(ve);let xe=D(be,C(`varying float vAcross,vHeight;varying vec2 vRing;
    void main(){float t=max(0.0,uTime-DC_burst),life=1.0-smoothstep(.08,DC_waveLife,t);
      float across=clamp(vAcross,0.0,1.0);vec2 direction=normalize(vRing);
      float grain=noise3(vec3(direction*18.0,across*4.0-t*.5)),bristles=noise3(vec3(direction*110.0,across*.85));
      float brush=.68+.32*smoothstep(.20,.72,grain),dry=smoothstep(.42,.70,bristles);
      float tears=noise3(vec3(direction*6.0,1.7)),edge=.57+.27*noise3(vec3(direction*16.0,2.3))+.16*bristles;
      float broken=smoothstep(.31,.49,tears)*(1.0-smoothstep(edge-.025,edge,across));
      float pressure=pow(smoothstep(0.0,.82,across),.75),trailingFade=smoothstep(0.0,.24,across),rimFade=broken;
      // Pure black pigment, retaining the previous brush opacity and broken edge.
      float inkOpacity=(.65+pressure*.33)*brush*(1.0-dry*.32)*trailingFade*rimFade;
      vec3 color=vec3(.0002,.0001,.0004);
      if(life*inkOpacity<.003)discard;gl_FragColor=vec4(color,life*inkOpacity);${l}}`,`varying float vAcross,vHeight;varying vec2 vRing;
    void main(){float t=max(0.0,uTime-DC_burst),shrink=1.0-smoothstep(.32,DC_waveLife,t);vAcross=uv.x;vHeight=uv.y;
      float width=min(uWaveRadius*.8,DC_waveWidth)*shrink,r=uWaveRadius-width*(1.0-uv.x);vec2 direction=normalize(position.xz);vRing=direction;
      vec3 p=vec3(direction.x*r,DC_centerY+uv.y*DC_waveHeight*shrink,direction.y*r);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p*uSize,1.0);}`,!1),`darkchain-shock-ring`,7,m.burst,m.burst+m.waveLife);xe.material.side=e.FrontSide;let Se={aGround0:[[],3],aGround1:[[],3],aGround2:[[],3],aGroundTiming:[[],4]},Ce=(t.seed>>>0^6527681)>>>0,we=()=>(Ce=Math.imul(Ce,1664525)+1013904223>>>0,Ce/4294967296),Te=Array.from({length:6},(e,t)=>{let n=t*Math.PI/3,r=.75+we()*.35,i=.15;return{start:[Math.cos(n)*8,i,Math.sin(n)*8],low:[Math.cos(n+r)*8*.86,i,Math.sin(n+r)*8*.86],high:[Math.cos(n+r*1.35)*1.2,i,Math.sin(n+r*1.35)*1.2],duration:1.15+we()*.3}});for(let e of Te)Se.aGround0[0].push(...e.start),Se.aGround1[0].push(...e.low),Se.aGround2[0].push(...e.high),Se.aGroundTiming[0].push(0,e.duration,e.duration,.65+we()*.35);for(let e of Object.values(Se))e[0]=new Float32Array(e[0]);let Ee=O(new e.PlaneGeometry(1,1),Se,6);Ee.userData.groundPaths=Te;let De=Math.max(...Te.map(e=>e.duration))/.325,Oe=`vec3 smokePoint(float age){float t=clamp(age,0.0,1.0),ground=clamp(t/.60,0.0,1.0);
    float p=ground*ground*(3.0-2.0*ground),q=1.0-p;
    vec3 point=q*q*q*aGround0+3.0*q*q*p*aGround1+3.0*q*p*p*aGround2+p*p*p*vec3(0,DC_centerY,0);
    point.y=mix(aGround0.y,DC_centerY,smoothstep(.60,1.0,t));return point;}`,ke=`attribute vec3 aGround0,aGround1,aGround2;attribute vec4 aGroundTiming;
    varying vec2 vGroundUv,vGroundOffset;varying float vGroundFade,vGroundSeed;
    ${Oe}
    void main(){float clock=uTime*.325,elapsed=clock-aGroundTiming.x;
      float progress=clamp(elapsed/aGroundTiming.z,0.0,1.0);
      vec3 center=smokePoint(progress);
      float absorb=1.0-smoothstep(.86,1.0,progress);
      float width=(2.145+aGroundTiming.w*.91)*(.65+.35*sin(progress*3.14159))*mix(.2,1.0,absorb);
      vGroundFade=step(0.0,elapsed)*smoothstep(0.0,.13,progress)*absorb*(1.0-smoothstep(DC_burst,DC_burst+.6,uTime));
      vec4 viewCenter=modelViewMatrix*vec4(center*uSize,1.0);
      vec4 viewCore=modelViewMatrix*vec4(0,DC_centerY*uSize,0,1);
      float scale=uSize*length(modelViewMatrix[0].xyz);
      float angle=aGroundTiming.w*6.28318+clock*.32;
      vec2 card=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*position.xy*width;
      vGroundOffset=(viewCenter.xy-viewCore.xy)/max(scale,.001)+card;
      viewCenter.xy+=card*scale;gl_Position=projectionMatrix*viewCenter;
      vGroundUv=uv;vGroundSeed=aGroundTiming.w;}`,Ae=`varying vec2 vGroundUv,vGroundOffset;varying float vGroundFade,vGroundSeed;
    void main(){vec2 q=vGroundUv*2.0-1.0;
      float noise=mist(q*2.2+vec2(vGroundSeed*17.0,-uTime*.48));
      float soft=1.0-smoothstep(.30,1.0,length(q)+.14*(noise-.5));
      soft*=1.0-smoothstep(.88,1.0,max(abs(q.x),abs(q.y)));
      float cloud=mix(.68,1.0,smoothstep(.18,.72,noise)*clamp(uDetail,0.0,1.0));
      float clearCore=.24+.76*smoothstep(.35,1.25,length(vGroundOffset));
      float alpha=soft*cloud*vGroundFade*clearCore*.40;if(alpha<.002)discard;
      float edge=smoothstep(.10,.78,1.0-soft);
      float redBlend=smoothstep(.28,.72,.5+.4*sin(q.x*1.7+q.y*.7+vGroundSeed*6.28318)+.1*(noise-.5));
      vec3 edgePigment=mix(vec3(.018,.0005,.030),vec3(.030,.0004,.003),redBlend);
      vec3 pigment=edgePigment*edge;
      gl_FragColor=vec4(pigment,alpha);${l}}`;D(Ee,C(Ae,ke,!1),`darkchain-ground-smoke`,2,0,De);let je=[],Me=[],Ne=[],Pe=[];for(let e=0;e<8;e++){let t=e*4;for(let[t,n,r,i]of[[-.5,-.5,0,0],[.5,-.5,1,0],[.5,.5,1,1],[-.5,.5,0,1]])je.push(t,n,0),Me.push(r,i),Ne.push(e/7);Pe.push(t,t+1,t+2,t,t+2,t+3)}let Fe=new e.BufferGeometry;Fe.setIndex(Pe),Fe.setAttribute(`position`,new e.Float32BufferAttribute(je,3)),Fe.setAttribute(`uv`,new e.Float32BufferAttribute(Me,2)),Fe.setAttribute(`aTrailSample`,new e.Float32BufferAttribute(Ne,1));let Ie=O(Fe,Se,6),Le=`attribute vec3 aGround0,aGround1,aGround2;attribute vec4 aGroundTiming;attribute float aTrailSample;
    varying vec2 vGroundUv,vGroundOffset;varying float vGroundFade,vGroundSeed;
    ${Oe}
    void main(){float clock=uTime*.325,head=(clock-aGroundTiming.x)/aGroundTiming.z;
      float lag=(1.0-aTrailSample)*.23,age=head-lag;
      vec4 center=modelViewMatrix*vec4(smokePoint(age)*uSize,1);
      float absorb=1.0-smoothstep(.86,1.0,age),headAge=clamp(head,0.0,1.0);
      float width=(2.145+aGroundTiming.w*.91)*.8*(.65+.35*sin(headAge*3.14159))*mix(.2,1.0,1.0-smoothstep(.86,1.0,headAge));
      float scale=uSize*length(modelViewMatrix[0].xyz);
      float angle=aGroundTiming.w*6.28318+aTrailSample*1.7+clock*.32;
      vec2 offset=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*position.xy*width;
      vec4 core=modelViewMatrix*vec4(0,DC_centerY*uSize,0,1);
      vGroundOffset=(center.xy-core.xy)/max(scale,.001)+offset;
      center.xy+=offset*scale;gl_Position=projectionMatrix*center;
      vGroundUv=uv;vGroundSeed=aGroundTiming.w;
      float tailFade=smoothstep(0.0,.30,aTrailSample)*(1.0-smoothstep(.85,1.0,aTrailSample));
      vGroundFade=smoothstep(0.0,.13,age)*absorb*smoothstep(0.0,.10,head)*tailFade*(1.0-smoothstep(DC_duration-.4,DC_duration,uTime));
    }`;return D(Ie,C(Ae.replace(`vGroundFade*clearCore*.40`,`vGroundFade*clearCore*.26`),Le,!1),`darkchain-smoke-tails`,1,0,Math.min(m.duration,De+1.04)),a.push(()=>{let e=Math.round(r.uTime.value*1e6)/1e6;b(e,d),p.uJetTravel.value=d.jetTravel,p.uJetFade.value=d.jetFade,p.uWarpKick.value=d.warpKick,p.uWarpFade.value=d.warpFade,p.uChainTension.value=S(e),p.uFlow.value=d.flow,p.uOrbRadius.value=d.radius,p.uBeat.value=d.beat,p.uOrbAlive.value=d.orbAlive,p.uBlastRadius.value=d.blastRadius,p.uWaveRadius.value=d.waveRadius;for(let t=0;t<m.arcGroups;t++)x(e,t,re),z[t*4]=re.alpha,z[t*4+1]=re.event,z[t*4+2]=re.flash,z[t*4+3]=re.age;for(let t=0;t<m.fieldArcs;t++)y(e,t,B),ae[t*4]=B.alpha,ae[t*4+1]=B.event,ae[t*4+2]=B.age,ae[t*4+3]=B.duration;for(let t of f)t.object.visible=e>=t.start&&e<t.end}),!0}let O=Object.freeze({duration:7.5,groundDuration:3,risingLifetime:1.95,waves:3,waveGap:1.1,stagger:.4,flight:.35,hold:.75,dissolve:.75,tail:.35,maxQuantity:12,pitch:.265,maxLinks:72,height:6,radius:3});function ee(e){let t=new Float64Array(O.waves*O.maxQuantity*4),n=e>>>0;for(let e=0;e<t.length;e++)n=Math.imul(n,1664525)+1013904223>>>0,t[e]=n/4294967296;return t}function k(e,t,n,r,i,a){let o=(t*O.maxQuantity+n)*4,s=e[o],c=e[o+1],l=e[o+2],u=e[o+3],d=(n+.5)*Math.PI*2/r+t*.59+(s-.5)*.18,f=O.radius*(.52+.48*c)*i,p=d+Math.PI*(.6+.36*l),m=(2.4+.7*u)*i;return a.wave=t,a.slot=n,a.birth=t*O.waveGap+(r>1?n/(r-1):.5)*O.stagger,a.start[0]=Math.cos(p)*m,a.start[1]=5.7+.6*l,a.start[2]=Math.sin(p)*m,a.end[0]=Math.cos(d)*f,a.end[1]=0,a.end[2]=Math.sin(d)*f,a.length=Math.hypot(a.end[0]-a.start[0],a.end[1]-a.start[1],a.end[2]-a.start[2]),a.pitch=O.pitch,a.count=Math.min(O.maxLinks,Math.ceil(a.length/a.pitch)+1),a.seed=s,a.active=!0,a}function A(e,t=8,n=1){t=Math.max(1,Math.min(O.maxQuantity,Math.round(Number.isFinite(t)?t:8))),n=Math.max(.5,Math.min(2,Number.isFinite(n)?n:1));let r=ee(e),i=[];for(let e=0;e<O.waves;e++)for(let a=0;a<t;a++)i.push(k(r,e,a,t,n,{start:[0,0,0],end:[0,0,0]}));return i}function j({THREE:e,spec:t,cap:n,uniforms:r,geometries:i,animated:a,mesh:o,instanced:s,shader:c,output:l}){if(t.id!==`golden-chain-rain`)return!1;let u=O.waves*O.maxQuantity,d=u*O.maxLinks,f=ee(t.seed),p=A(t.seed,O.maxQuantity,1);function m(){let t=[],n=[],r=[],i=[];for(let e=0;e<=24;e++){let a=e/24*Math.PI*2,o=Math.cos(a),s=Math.sin(a),c=o/.095,l=s/.17,u=Math.hypot(c,l);for(let a=0;a<=6;a++){let d=a/6*Math.PI*2,f=Math.cos(d),p=Math.sin(d);if(t.push(o*.095+c/u*.031*f,s*.17+l/u*.031*f,.031*p),n.push(c/u*f,l/u*f,p),r.push(e/24,a/6),e<24&&a<6){let t=e*7+a;i.push(t,t+6+1,t+1,t+1,t+6+1,t+6+2)}}}let a=new e.BufferGeometry;return a.setIndex(i),a.setAttribute(`position`,new e.Float32BufferAttribute(t,3)),a.setAttribute(`normal`,new e.Float32BufferAttribute(n,3)),a.setAttribute(`uv`,new e.Float32BufferAttribute(r,2)),a}function h(t,n){let r=new e.InstancedBufferGeometry;t.index&&r.setIndex(t.index.clone());for(let[e,n]of Object.entries(t.attributes))r.setAttribute(e,n.clone());return t.dispose(),r.setAttribute(`aStart`,new e.InstancedBufferAttribute(new Float32Array(n*3),3)),r.setAttribute(`aEnd`,new e.InstancedBufferAttribute(new Float32Array(n*3),3)),r.setAttribute(`aTime`,new e.InstancedBufferAttribute(new Float32Array(n*2),2)),r.instanceCount=0,r}let g=h(m(),d);g.setAttribute(`aLink`,new e.InstancedBufferAttribute(new Float32Array(d*4),4)),g.userData.goldenChainLayout=p;let _=h(new e.PlaneGeometry(.32,.48),d);_.setAttribute(`aLink`,new e.InstancedBufferAttribute(new Float32Array(d*4),4)),_.userData.goldenChainLayout=p,i.add(_);let v=`
    float gcPenetration(float age){float t=clamp((age-.35)/.08,0.0,1.0);return .32*(1.0-pow(1.0-t,3.0));}
    float gcTipDistance(float age,float span){return pow(clamp(age/.35,0.0,1.0),1.5)*span+gcPenetration(age);}
  `,y=`${v}
    varying vec2 vChainClip;
    attribute vec3 aStart,aEnd;attribute vec2 aTime;attribute vec4 aLink;
    uniform float uTime;
    varying vec3 vNormal,vViewPosition,vLocal;varying vec2 vRingUv;
    varying float vAge,vRoute,vDissolve,vAlive,vSeed;
    #ifdef GC_SPRITE
      varying vec2 vSpritePlane;varying vec2 vSpriteHeading;varying float vSpriteWidth;
    #endif
    void main(){
      float age=uTime-aTime.x,travel=pow(clamp(age/.35,0.0,1.0),1.5);
      vec3 delta=aEnd-aStart;float span=length(delta);vec3 forward=delta/span;
      vec3 right=normalize(cross(forward,vec3(0,1,0))),side=normalize(cross(right,forward));
      float tipDistance=gcTipDistance(age,span),headSetback=.83;
      float distance=tipDistance-headSetback-aLink.x*aLink.z;
      float route=clamp(distance/span,0.0,1.0),impact=max(0.0,age-.35);
      float bend=.085*(1.0-travel)+.72*exp(-impact*17.0)*sin(impact*52.0)*step(.35,age);
      bend*=min(aLink.x*.5,1.0); // The first link stays pinned to the arrow tail.
      vec3 tangent=normalize(forward+right*(bend*3.14159265/span*cos(route*3.14159265)));
      vec3 across=normalize(cross(tangent,side));
      float turn=mod(aLink.x,2.0)*1.57079632679;
      vec3 p=position,n=normal;
      #ifdef GC_HALO
        p+=normal*.023;
      #endif
      p.xz=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*p.xz;
      n.xz=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*n.xz;
      vec3 center=aStart+forward*distance+right*sin(route*3.14159265)*bend;
      #ifdef GC_SPRITE
        vec4 view=modelViewMatrix*vec4(center*uSize,1.0);
        vec3 direction=mat3(modelViewMatrix)*tangent;
        vec2 projected=direction.xy;
        if(!isOrthographic)projected-=view.xy*(direction.z/min(view.z,-.00001));
        float projectedLength=length(projected)/max(length(direction),.00001);
        // A ring has no directional head: canonicalize the axis before easing
        // to screen-up near the viewing axis. This avoids a zero normalization.
        vec2 heading=projected/max(length(projected),.00001);
        if(heading.y<0.0)heading=-heading;
        heading=normalize(mix(vec2(0,1),heading,smoothstep(.005,.08,projectedLength)));
        // Match the directed length axis so the plane keeps front-facing
        // winding even when the chain projects downward on the screen.
        if(dot(projected,heading)<0.0)heading=-heading;
        vec2 lateral=vec2(heading.y,-heading.x);
        float width=mix(1.0,.48,mod(aLink.x,2.0));
        // Keep length and depth along the real chain, rotating only its width
        // toward the camera. A full screen-aligned quad stretched across the
        // source/arrow planes, while the old clipping used a different position.
        vec3 lateralView=vec3(lateral,0),headingView=vec3(heading,0);
        vec3 lateralLocal=normalize(vec3(dot(normalMatrix[0],lateralView),dot(normalMatrix[1],lateralView),dot(normalMatrix[2],lateralView)));
        vec3 headingLocal=normalize(vec3(dot(normalMatrix[0],headingView),dot(normalMatrix[1],headingView),dot(normalMatrix[2],headingView)));
        vec3 lengthAxis=normalize(tangent+headingLocal*.08*(1.0-smoothstep(0.0,.08,projectedLength)));
        vec3 local=center+lengthAxis*position.y+lateralLocal*position.x*width;
        // Adjacent axial quads otherwise share the same plane when taut.
        // A tiny alternating depth separation prevents overlap z-fighting.
        local+=normalize(cross(lateralLocal,lengthAxis))*(mod(aLink.x,2.0)-.5)*.0015;
        view=modelViewMatrix*vec4(local*uSize,1.0);
        vSpritePlane=position.xy;vSpriteHeading=heading;vSpriteWidth=width;
        vLocal=local;vNormal=vec3(0,0,1);vViewPosition=-view.xyz;
      #else
      vec3 local=center+across*p.x+tangent*p.y+side*p.z;
      vLocal=local;vNormal=normalize(normalMatrix*(across*n.x+tangent*n.y+side*n.z));
      vec4 view=modelViewMatrix*vec4(local*uSize,1.0);vViewPosition=-view.xyz;
      #endif
      float axial=dot(vLocal-aStart,forward);
      vChainClip=vec2(axial,tipDistance-.64-axial);
      vAge=age;vRoute=route;vDissolve=clamp((age-1.10)/.75,0.0,1.0);vSeed=aLink.w;vRingUv=uv;
      vAlive=step(0.0,age)*(1.0-step(1.85,age));
      gl_Position=projectionMatrix*view;
    }`,b=`
    #ifndef GC_ARROW
      varying vec2 vChainClip;
    #endif
    uniform vec3 uColor;
    uniform float uTextureDensity;
    varying vec3 vNormal,vViewPosition,vLocal;varying vec2 vRingUv;
    varying float vAge,vRoute,vDissolve,vAlive,vSeed;
    #ifdef GC_SPRITE
      varying vec2 vSpritePlane;varying vec2 vSpriteHeading;varying float vSpriteWidth;
    #endif
    #ifdef GC_ARROW
      varying float vSourceDistance;varying vec3 vArrowSurface;
    #endif
    float gcHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float gcLiquidHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
    float gcLiquidNoise(vec3 p){
      vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
      return mix(mix(mix(gcLiquidHash(i),gcLiquidHash(i+vec3(1,0,0)),f.x),mix(gcLiquidHash(i+vec3(0,1,0)),gcLiquidHash(i+vec3(1,1,0)),f.x),f.y),
        mix(mix(gcLiquidHash(i+vec3(0,0,1)),gcLiquidHash(i+vec3(1,0,1)),f.x),mix(gcLiquidHash(i+vec3(0,1,1)),gcLiquidHash(i+vec3(1,1,1)),f.x),f.y),f.z);
    }
    void main(){
      if(vAlive<.5||vLocal.y<0.0)discard;
      #ifndef GC_ARROW
        if(min(vChainClip.x,vChainClip.y)<0.0)discard;
      #endif
      vec2 ringUv=vRingUv;vec3 surfaceNormal=vNormal;float spriteHalo=1.0;
      #ifdef GC_SPRITE
        vec2 ellipse=vSpritePlane/vec2(.095,.17);
        float ellipseRadius=length(ellipse);
        vec2 radial=ellipse/max(ellipseRadius,.00001);
        float tubeDistance=(ellipseRadius-1.0)/max(length(radial/vec2(.095,.17)),.00001);
        float tube=clamp(tubeDistance/.031,-1.0,1.0);
        #ifdef GC_HALO
          if(abs(tubeDistance)<.031||abs(tubeDistance)>.054)discard;
          spriteHalo=1.0-smoothstep(.031,.054,abs(tubeDistance));
        #else
          if(abs(tubeDistance)>.031)discard;
        #endif
        ringUv=vec2(fract(atan(ellipse.y,ellipse.x)/6.283185),acos(tube)/6.283185);
        vec2 radialNormal=normalize(radial/vec2(.095*vSpriteWidth,.17));
        vec2 lateral=vec2(vSpriteHeading.y,-vSpriteHeading.x);
        surfaceNormal=vec3((lateral*radialNormal.x+vSpriteHeading*radialNormal.y)*tube,sqrt(max(0.0,1.0-tube*tube)));
      #endif
      #ifdef GC_ARROW
        if(vSourceDistance<0.0)discard;
      #endif
      float grain=gcHash(floor(ringUv*vec2(24.0,6.0))+vSeed*83.0);
      float threshold=vRoute*.78+grain*.22;
      if(vDissolve>threshold)discard;
      float edge=step(.001,vDissolve)*(1.0-smoothstep(0.0,.045,threshold-vDissolve));
      #ifdef GC_HALO
        gl_FragColor=vec4(uColor*1.10,(.035+edge*.18)*uDetail*spriteHalo);
      #else
        vec3 n=normalize(surfaceNormal),viewDirection=isOrthographic?vec3(0,0,1):normalize(vViewPosition),light=normalize(vec3(-.35,.8,.65));
        float diffuse=clamp(dot(n,light)*.65+.35,0.0,1.0);
        float shine=pow(max(0.0,dot(n,normalize(light+viewDirection))),38.0);
          // Embed the ring UVs on a torus so both seams stay continuous. Advect
          // a warped noise field; its contours form irregular liquid caustics.
          vec3 gold=mix(uColor*vec3(.075,.065,.025),uColor*vec3(.32,.28,.12),smoothstep(.13,.82,diffuse));
          gold+=uColor*shine*.22;
          #ifdef GC_ARROW
            // Model-space sampling stays continuous across the arrow facets and cap.
            vec3 liquid=vArrowSurface*13.5*.65*uTextureDensity;
          #else
          vec2 angle=ringUv*6.283185;
          float radius=2.2+.45*cos(angle.y);
          vec3 liquid=vec3(cos(angle.x)*radius,sin(angle.x)*radius,.45*sin(angle.y))*.65*uTextureDensity;
          #endif
          liquid+=vec3(-vAge*.58*uTextureDensity,vSeed*3.7,vAge*.26*uTextureDensity);
          vec3 warp=vec3(gcLiquidNoise(liquid*.73+vec3(0,0,vAge*.16)),
            gcLiquidNoise(liquid*.73+vec3(13.7,5.2,-vAge*.19)),gcLiquidNoise(liquid*.73+vec3(2.4,19.1,8.3)));
          float field=gcLiquidNoise(liquid+warp*2.1)*.88+gcLiquidNoise(liquid*2.07+warp)*.12;
          float stream=pow(.5+.5*sin(field*36.0),5.0);
          float filament=pow(.5+.5*sin(field*72.0+warp.x*2.0),12.0);
          float water=(stream*1.38+filament*.34)*(.6+.4*diffuse)*min(uDetail,1.4);
          gold+=uColor*vec3(.90,.80,.40)*water;
        float impact=exp(-max(0.0,vAge-.35)*18.0)*step(.35,vAge);
        gold+=uColor*impact*.08;
        gold+=mix(uColor,vec3(1.0,.97,.85),.4)*edge*.85*min(uDetail,1.3);
        gl_FragColor=vec4(gold,1.0);
      #endif
      ${l}
    }`,x=c(b,y,{},!1);x.transparent=!1,x.depthWrite=!0,x.side=e.FrontSide,x.userData.ownLifecycle=!0;let S=o(g,x,1);S.name=`golden-chain-body`;let C=c(b,y,{},!0,{GC_HALO:1});C.side=e.BackSide,C.userData.ownLifecycle=!0;let w=o(g,C,2);w.name=`golden-chain-halo`;let T=c(b,y,{},!1,{GC_SPRITE:1});T.transparent=!1,T.depthWrite=!0,T.side=e.FrontSide,T.userData.ownLifecycle=!0;let E=c(b,y,{},!0,{GC_SPRITE:1,GC_HALO:1});E.side=e.FrontSide,E.userData.ownLifecycle=!0;let D=h(new e.PlaneGeometry(2,2),u),j=`attribute vec3 aStart,aEnd;attribute vec2 aTime;uniform float uTime;
    varying vec2 vRipple;varying float vAge,vFade,vSeed;
    void main(){
      float age=uTime-aTime.x,localAge=age;
      vFade=smoothstep(0.0,.085,localAge)*(1.0-smoothstep(1.10,1.55,age));
      float open=1.0-pow(1.0-clamp(localAge/.16,0.0,1.0),3.0);
      float radius=.82*(.45+.55*open);
      vec3 forward=normalize(aEnd-aStart),right=normalize(cross(forward,vec3(0,1,0))),side=normalize(cross(right,forward));
      vec3 across=right,up=side,center=aStart;
      float extent=1.0;
      #ifdef GC_RIPPLE_GLOW
        extent=1.9;
        // Move the halo just toward the viewer instead of relying on a
        // coplanar depth bias, which varied at a few MSAA edge samples.
        vec3 planeNormal=normalize(cross(across,up));
        vec3 viewNormal=mat3(modelViewMatrix)*planeNormal;
        vec3 viewCenter=(modelViewMatrix*vec4(center*uSize,1.0)).xyz;
        center+=planeNormal*.004*sign(dot(viewNormal,-viewCenter));
      #endif
      #ifdef GC_RIPPLE_FEATHER
        extent=1.2;
      #endif
      // Keep the established opening; retirement fades without collapsing the water disc.
      radius*=mix(.48,1.0,sqrt(smoothstep(0.0,.085,localAge)));
      vec3 p=center+(across*position.x+up*position.y)*radius*extent;
      vRipple=position.xy*extent;vAge=localAge;vSeed=aTime.y;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p*uSize,1.0);
    }`,M=`
    float grHash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
    float grNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
      return mix(mix(grHash(i),grHash(i+vec2(1,0)),f.x),mix(grHash(i+vec2(0,1)),grHash(i+vec2(1,1)),f.x),f.y);}
  `,N=`uniform vec3 uColor;${M}
    varying vec2 vRipple;varying float vAge,vFade,vSeed;
    void main(){
      if(vFade<=0.0)discard;
      vec2 q=vRipple,drift=vec2(vAge*.23,-vAge*.17)+vSeed*17.0;
      float r=length(q),flow=grNoise(q*7.0+drift),fine=grNoise(q*23.0-drift*.8);
      float warped=r+(flow-.5)*.045+(fine-.5)*.012;
      float phase=warped*52.0-vAge*8.5+sin(atan(q.y,q.x)*2.0+r*13.0-vAge*1.7)*.3;
      float crest=pow(.5+.5*cos(phase),5.5);
      float softCrest=pow(.5+.5*cos(phase),1.6);
      float threads=pow(.5+.5*cos(warped*91.0-vAge*6.4+flow*3.0),14.0);
      float broken=smoothstep(.18,.80,grNoise(q*vec2(11.0,16.0)+drift*.45));
      float edge=.64+(flow-.5)*.025;
      float alpha=1.0;
      #ifdef GC_RIPPLE_FEATHER
        // During retirement this existing transparent layer also carries the core.
        if((vAge<=1.10&&r<edge-.005)||r>1.16)discard;
        alpha=(1.0-smoothstep(edge,1.16,r))*(vAge>1.10?vFade:1.0);
      #else
        if(r>edge||vAge>1.10)discard;
      #endif
      vec2 hot=(q+vec2(.075,-.02))*vec2(1.7,1.0);
      float core=exp(-dot(hot,hot)*26.0);
      float reflection=exp(-pow((q.x+.10)*8.0,2.0)-pow(q.y*2.4,2.0))*.35;
      vec3 trough=uColor*vec3(.40,.43,.48)*(.75+flow*.5);
      vec3 waveColor=mix(uColor,vec3(1.0,.94,.73),.72);
      float waves=(crest*1.02+softCrest*.22+threads*.14*min(uDetail,1.4))*(.18+broken*.82);
      vec3 gold=trough+waveColor*waves;
      gold+=vec3(1.0,.96,.79)*(core*4.0+reflection*1.4);
      // The core stays opaque while held, then joins the feather layer for a smooth fade.
      gl_FragColor=vec4(gold*(.8+.2*vFade),alpha);${l}
    }`,P=c(N,j,{},!1);P.transparent=!1,P.depthWrite=!0,P.userData.ownLifecycle=!0;let F=c(`uniform vec3 uColor;${M}
    varying vec2 vRipple;varying float vAge,vFade,vSeed;
    void main(){
      float r=length(vRipple);if(vFade<=0.0||r>=1.9)discard;
      float mist=grNoise(vRipple*4.2+vec2(vAge*.17,-vAge*.13)+vSeed*11.0);
      float haze=.7+.3*mist;
      float bloom=exp(-r*r*1.05)*.54+exp(-r*r*5.0)*.18;
      float bloomSpread=.22+.78*smoothstep(.28,1.10,r);
      float alpha=bloom*haze*bloomSpread*(1.0-smoothstep(1.35,1.9,r))*vFade*(.8+.2*min(uDetail,1.5));
      if(alpha<.002)discard;
      vec3 color=mix(uColor,vec3(1.0,.88,.55),.25)*1.8;
      gl_FragColor=vec4(color,alpha);${l}
    }`,j,{},!0,{GC_RIPPLE_GLOW:1});F.userData.ownLifecycle=!0;let I=[];function te(){let t=[],n=[],r=6531985,i=()=>(r=Math.imul(r,1664525)+1013904223>>>0,r/4294967296);function a(e,r,i,a,o){I.push({a:e,b:r,r0:a,r1:o});let s=r[0]-e[0],c=r[1]-e[1],l=Math.hypot(s,c),u=-c/l,d=s/l,f=[[e[0]+u*i,e[1]+d*i,-1,a],[e[0]-u*i,e[1]-d*i,1,a],[r[0]+u*i*.55,r[1]+d*i*.55,-1,o],[r[0]-u*i*.55,r[1]-d*i*.55,1,o]];for(let e of[0,2,1,1,2,3])t.push(f[e][0],.012,f[e][1]),n.push(f[e][2],f[e][3])}for(let e=0;e<8;e++){let t=e*Math.PI/4+(i()-.5)*.34,n=.78+i()*.22,r=[0,0];for(let e=1;e<=6;e++){let o=e/6*n,s=t+(i()-.5)*.35,c=[Math.cos(s)*o,Math.sin(s)*o];if(a(r,c,.034*(1-e/8),(e-1)/6,e/6),e===2||e===4){let t=s+(i()>.5?1:-1)*(.45+i()*.5),n=.12+i()*.13;a(c,[c[0]+Math.cos(t)*n,c[1]+Math.sin(t)*n],.012,e/6,Math.min(1,e/6+.22))}r=c}}let o=new e.BufferGeometry;return o.setAttribute(`position`,new e.Float32BufferAttribute(t,3)),o.setAttribute(`uv`,new e.Float32BufferAttribute(n,2)),o}let ne=h(te(),u),L=`
    vec2 gcCrackPoint(vec2 q,float seed){
      float radius=length(q),angle=seed*6.283185;
      q*=.88+.12*sin((radius>0.0?atan(q.y,q.x):0.0)*3.0+seed*37.0+radius*4.0);
      return mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*q;
    }
  `,R=c(`uniform vec3 uColor;varying vec2 vCrack;varying float vAge;
    void main(){
      float reveal=smoothstep(vCrack.y*.15,vCrack.y*.15+.03,vAge-.35);
      float fade=1.0-smoothstep(3.05,3.35,vAge); // Three seconds from contact, including the final 0.3s fade.
      float edge=1.0-smoothstep(.72,1.0,abs(vCrack.x));
      float alpha=reveal*fade*edge;if(alpha<.004)discard;
      // A yellow-gold luminous core, not a brown surface multiplied into white.
      float core=1.0-smoothstep(.08,.72,abs(vCrack.x));
      vec3 color=mix(uColor*vec3(1.0,.72,.12),mix(uColor,vec3(1.0,.92,.44),.35)*1.5,core);
      gl_FragColor=vec4(color,alpha);${l}
    }`,`${L}attribute vec3 aEnd;attribute vec2 aTime;uniform float uTime;varying vec2 vCrack;varying float vAge;
    void main(){
      vec2 q=gcCrackPoint(position.xz,aTime.y);
      vec3 p=aEnd+vec3(q.x,position.y,q.y);vCrack=uv;vAge=uTime-aTime.x;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p*uSize,1.0);
    }`,{},!1);R.userData.ownLifecycle=!0;let z=o(ne,R,0);z.name=`golden-chain-ground-cracks`;let re=`${v}
    attribute vec4 seed;attribute float aArrow;attribute vec3 aStart,aEnd;attribute vec2 aTime;
    uniform float uTime;varying vec2 vUv;varying float vFade,vHeat,vGround;
    void main(){
      vec3 delta=aEnd-aStart;float span=length(delta);
      vec3 axis=delta/span,right=normalize(cross(axis,vec3(0,1,0))),side=normalize(cross(right,axis));
      float settledTip=gcTipDistance(1.10,span),tail=settledTip-.64;
      float distance=mix(tail*(.02+seed.y*.96),settledTip-.64+seed.y*.30,aArrow);
      float route=clamp(distance/span,0.0,1.0);
      float age=uTime-aTime.x-1.10-(route*.78+seed.z*.22)*.75;
      float angle=seed.w*6.28318;vec3 radial=right*cos(angle)+side*sin(angle);
      vec3 velocity=radial*(.7+seed.z*.7)+vec3(0,.45+seed.w*.5,0);
      float drift=max(age,0.0);
      vec3 p=aStart+axis*distance+radial*mix(.105,.22*(1.0-seed.y*.47),aArrow)+velocity*drift;
      p.y-=1.4*drift*drift;vGround=p.y;
      float scale=(.085+seed.w*.065)*(1.0-smoothstep(.12,.35,age));
      vFade=step(0.0,age)*(1.0-smoothstep(.08,.35,age));vHeat=1.0-clamp(age/.35,0.0,1.0);
      vec4 view=modelViewMatrix*vec4(p*uSize,1.0);
      float spin=seed.x*6.28318+drift*(seed.z-.5)*15.0;
      vec2 direction=vec2(cos(spin),sin(spin));
      float parentScale=length(modelViewMatrix[0].xyz);
      vec2 offset=(direction*position.x*1.5+vec2(-direction.y,direction.x)*position.y*.58)*scale;
      // Clip the actual billboard surface against local ground, including host rotation.
      vec3 localOffset=vec3(dot(normalMatrix[0],vec3(offset,0)),dot(normalMatrix[1],vec3(offset,0)),dot(normalMatrix[2],vec3(offset,0)))*parentScale;
      vGround+=localOffset.y;
      view.xy+=offset*uSize*parentScale;vUv=uv;gl_Position=projectionMatrix*view;
    }`,ie=`uniform vec3 uColor;varying vec2 vUv;varying float vFade,vHeat,vGround;
    void main(){
      if(vGround<0.0)discard;
      vec2 q=vUv*2.0-1.0;
      float edge=max(max(-q.y-.55,q.x*.92+q.y*.5-.30),-q.x*.75+q.y*.55-.34);
      float chip=1.0-smoothstep(-.045,.025,edge);
      float halo=exp(-pow(max(edge,0.0)*9.0,2.0))*.27*(1.0-smoothstep(.45,1.0,length(q)));
      float alpha=(chip*.85+halo)*vFade*min(1.0,uDetail);if(alpha<.004)discard;
      vec3 gold=uColor*(.85+vUv.y*.7)+vec3(.45,.34,.10)*exp(-abs(edge)*60.0)*vHeat;
      gl_FragColor=vec4(gold,alpha);${l}}`,ae=c(ie,re,{},!0);ae.userData.ownLifecycle=!0;let B=s(new e.PlaneGeometry(1,1),n,.5,ae,4);B.name=`golden-chain-dissolve-motes`;let V=o(D,P,2);V.name=`golden-chain-endpoint-ripples`;let oe=o(D,F,3);oe.name=`golden-chain-endpoint-bloom`;let H=new e.ConeGeometry(.22,.64,4,1),U=H.toNonIndexed();H.dispose(),U.computeVertexNormals();let se=h(U,u),W=c(b,`${v}
    attribute vec3 aStart,aEnd;attribute vec2 aTime;uniform float uTime;
    varying vec3 vNormal,vViewPosition,vLocal,vArrowSurface;varying vec2 vRingUv;
    varying float vAge,vRoute,vDissolve,vAlive,vSeed,vSourceDistance;
    void main(){
      float age=uTime-aTime.x;
      vec3 delta=aEnd-aStart;float span=length(delta);vec3 forward=delta/span;
      vec3 right=normalize(cross(forward,vec3(0,1,0))),side=normalize(cross(right,forward));
      vec3 local=aStart+forward*(gcTipDistance(age,span)-.32+position.y)+right*position.x+side*position.z;
      vLocal=local;vNormal=normalize(normalMatrix*(forward*normal.y+right*normal.x+side*normal.z));
      vec4 view=modelViewMatrix*vec4(local*uSize,1.0);vViewPosition=-view.xyz;
      vArrowSurface=position;vRingUv=uv;vAge=age;vRoute=clamp(dot(local-aStart,forward)/span,0.0,1.0);vDissolve=clamp((age-1.10)/.75,0.0,1.0);vSeed=aTime.y;
      vSourceDistance=gcTipDistance(age,span)-.32+position.y;
      vAlive=step(0.0,age)*(1.0-step(1.85,age));
      gl_Position=projectionMatrix*view;
    }`,{},!1,{GC_ARROW:1});W.transparent=!1,W.depthWrite=!0,W.side=e.FrontSide,W.userData.ownLifecycle=!0;let G=o(se,W,1);G.name=`golden-chain-arrowheads`;let K=c(N,j,{},!1,{GC_RIPPLE_FEATHER:1});K.userData.ownLifecycle=!0;let q=o(D,K,2);q.name=`golden-chain-endpoint-feather`;let ce=c(ie,`${L}
    attribute vec4 seed;attribute vec3 aEnd,aCrackA,aCrackB;attribute vec2 aTime;uniform float uTime;
    varying vec2 vUv;varying float vFade,vHeat,vGround;
    void main(){
      float along=.15+seed.x*.70;
      vec2 q=mix(gcCrackPoint(aCrackA.xy,aTime.y),gcCrackPoint(aCrackB.xy,aTime.y),along);
      float reveal=mix(aCrackA.z,aCrackB.z,along)*.15+.03;
      float contactAge=uTime-aTime.x-.35;
      float delay=reveal+seed.z*.42,elapsed=contactAge-delay;
      // Reuse each slot only after its 1.95s life; freeze the final birth before 3s.
      // Its existing chip can then finish naturally after the ground has faded.
      float cycle=min(floor(max(elapsed,0.0)/1.95),floor((3.0-delay-.0001)/1.95));
      float age=elapsed-cycle*1.95,drift=max(age,0.0);
      float angle=seed.w*6.283185;
      // A second 50% reduction gives one quarter of the original translational velocity.
      vec3 p=aEnd+vec3(q.x,.012,q.y)+vec3(cos(angle)*.14,(.48+seed.y*.38)*2.0,sin(angle)*.14)*drift*.25;
      p.y+=.13*drift*drift*2.0*.25;
      // Keep the established entrance, then hold size and light through 1.6s.
      // Only opacity retires over the final 0.35s; movement and spin stay independent.
      vFade=step(0.0,elapsed)*smoothstep(0.0,.105,age)*(1.0-smoothstep(1.6,1.95,age));
      vHeat=1.0;
      float scale=.035+seed.y*.045,spin=angle+drift*(seed.x-.5)*5.0;
      vec2 direction=vec2(cos(spin),sin(spin));
      vec2 offset=(direction*position.x*1.5+vec2(-direction.y,direction.x)*position.y*.58)*scale;
      float parentScale=length(modelViewMatrix[0].xyz);
      vec3 localOffset=vec3(dot(normalMatrix[0],vec3(offset,0)),dot(normalMatrix[1],vec3(offset,0)),dot(normalMatrix[2],vec3(offset,0)))*parentScale;
      vGround=p.y+localOffset.y;vec4 view=modelViewMatrix*vec4(p*uSize,1.0);
      view.xy+=offset*uSize*parentScale;vUv=uv;gl_Position=projectionMatrix*view;
    }`,{},!0);ce.userData.ownLifecycle=!0;let le=Math.round(n*.3)*8,J=s(new e.PlaneGeometry(1,1),le,.3,ce,4);J.geometry.userData.goldenChainCrackChips=!0,J.name=`golden-chain-crack-chips`;for(let t of[`aCrackA`,`aCrackB`])J.geometry.setAttribute(t,new e.InstancedBufferAttribute(new Float32Array(le*3),3));for(let e=0;e<le;e++){let t=I[Math.min(I.length-1,Math.floor(J.geometry.attributes.seed.getY(e)*I.length))];J.geometry.attributes.aCrackA.setXYZ(e,t.a[0],t.a[1],t.r0),J.geometry.attributes.aCrackB.setXYZ(e,t.b[0],t.b[1],t.r1)}let ue=[],Y=[],X=[];for(let e of I)for(let t of[[-1,-1],[1,-1],[-1,1],[-1,1],[1,-1],[1,1]])ue.push(t[0],t[1],0),Y.push(e.a[0],e.a[1],e.r0),X.push(e.b[0],e.b[1],e.r1);let de=new e.BufferGeometry;de.setAttribute(`position`,new e.Float32BufferAttribute(ue,3)),de.setAttribute(`aCrackA`,new e.Float32BufferAttribute(Y,3)),de.setAttribute(`aCrackB`,new e.Float32BufferAttribute(X,3));let Z=h(de,u),fe=c(`uniform float uCrackBloom,uCrackBloomSpread;uniform vec3 uColor;varying vec2 vGlow;varying vec2 vReveal;
    varying float vAge,vLength;
    void main(){
      float along=clamp((vGlow.x+vLength*.5)/max(vLength,.0001),0.0,1.0);
      float progress=mix(vReveal.x,vReveal.y,along);
      float reveal=smoothstep(progress*.15,progress*.15+.03,vAge-.35);
      float fade=1.0-smoothstep(3.05,3.35,vAge); // Three seconds from contact, including the final 0.3s fade.
      float distance=length(vec2(max(abs(vGlow.x)-vLength*.5,0.0),vGlow.y))/uCrackBloomSpread;
      // Both lobes fade to zero before the geometry edge; no rectangular rim.
      float glow=(exp(-distance*distance/ .0036)*.46+exp(-distance*distance/ .0144)*.24);
      float alpha=glow*(1.0-smoothstep(.13,.20,distance))*reveal*fade*uCrackBloom;
      if(alpha<.001)discard;
      gl_FragColor=vec4(uColor*vec3(2.3,1.8,.65),alpha);${l}
    }`,`${L}
    attribute vec3 aEnd,aCrackA,aCrackB;attribute vec2 aTime;uniform float uTime,uCrackBloomSpread;
    varying vec2 vGlow,vReveal;varying float vAge,vLength;
    void main(){
      vec2 a=gcCrackPoint(aCrackA.xy,aTime.y),b=gcCrackPoint(aCrackB.xy,aTime.y),delta=b-a;
      float lengthAB=length(delta);vec2 direction=delta/max(lengthAB,.0001),across=vec2(-direction.y,direction.x);
      float reach=.20*uCrackBloomSpread;
      vGlow=position.xy*vec2(lengthAB*.5+reach,reach);vLength=lengthAB;vReveal=vec2(aCrackA.z,aCrackB.z);vAge=uTime-aTime.x;
      vec2 q=(a+b)*.5+direction*vGlow.x+across*vGlow.y;
      vec3 p=aEnd+vec3(q.x,.014,q.y);gl_Position=projectionMatrix*modelViewMatrix*vec4(p*uSize,1.0);
    }`,{},!0);fe.userData.ownLifecycle=!0;let pe=o(Z,fe,-1);pe.name=`golden-chain-crack-bloom`,B.geometry.setAttribute(`aArrow`,new e.InstancedBufferAttribute(new Float32Array(n),1));let me=c(ie.replace(`gl_FragColor=vec4(gold,alpha);`,`float facet=smoothstep(-.025,.025,q.x+q.y*.32); gold=uColor*mix(.38,1.55,facet)+uColor*.35*vHeat*exp(-abs(edge)*40.0); gl_FragColor=vec4(gold,alpha);`),`
    attribute vec4 seed;attribute vec3 aEnd;attribute vec2 aTime;
    uniform float uTime;varying vec2 vUv;varying float vFade,vHeat,vGround;
    void main(){
      float age=uTime-aTime.x-.35-seed.w*.025,t=max(age,0.0);
      float angle=seed.x*6.283185,apex=mix(.30,.50,seed.y),gravity=12.0;
      float vy=sqrt(2.0*gravity*apex),land=(vy+sqrt(vy*vy+2.0*gravity*.025))/gravity;
      float radius=mix(.60,1.30,seed.z),progress=(1.0-exp(-3.0*t))/(1.0-exp(-3.0*land));
      vec3 p=aEnd+vec3(cos(angle)*radius*progress,.025+vy*t-.5*gravity*t*t,sin(angle)*radius*progress);
      vFade=step(0.0,age)*(1.0-smoothstep(land-.07,land,age))*(1.0-step(.65,age));
      vHeat=1.0-clamp(t/.30,0.0,1.0);vUv=uv;
      float spin=angle+t*mix(8.0,17.0,seed.z),flip=mix(.4,1.0,abs(cos(t*11.0+angle)));
      // The procedural shard occupies about 0.58 of the quad along its long axis.
      float scale=mix(.04,.08,seed.y)/.58;
      vec2 direction=vec2(cos(spin),sin(spin));
      vec2 offset=(direction*position.y+vec2(-direction.y,direction.x)*position.x*.72*flip)*scale;
      float parentScale=length(modelViewMatrix[0].xyz);
      vec3 localOffset=vec3(dot(normalMatrix[0],vec3(offset,0)),dot(normalMatrix[1],vec3(offset,0)),dot(normalMatrix[2],vec3(offset,0)))*parentScale;
      vGround=p.y+localOffset.y;vec4 view=modelViewMatrix*vec4(p*uSize,1.0);
      view.xy+=offset*uSize*parentScale;gl_Position=projectionMatrix*view;
    }`,{},!1);me.userData.ownLifecycle=!0;let Q=s(new e.PlaneGeometry(1,1),u*24,0,me,4);Q.name=`golden-chain-impact-chips`,Q.geometry.userData.goldenChainImpactChips=!0;let he=[B.geometry,J.geometry,Q.geometry];for(let t of he){let n=t.attributes.seed.count;t.setAttribute(`aStart`,new e.InstancedBufferAttribute(new Float32Array(n*3),3)),t.setAttribute(`aEnd`,new e.InstancedBufferAttribute(new Float32Array(n*3),3)),t.setAttribute(`aTime`,new e.InstancedBufferAttribute(new Float32Array(n*2),2))}function $(e,t,n){e.attributes.aStart.setXYZ(t,n.start[0],n.start[1],n.start[2]),e.attributes.aEnd.setXYZ(t,n.end[0],n.end[1],n.end[2]),e.attributes.aTime.setXY(t,n.birth,n.seed)}function ge(e){e.attributes.aStart.needsUpdate=!0,e.attributes.aEnd.needsUpdate=!0,e.attributes.aTime.needsUpdate=!0}let _e=-1,ve=-1;function ye(){let e=Math.max(1,Math.min(O.maxQuantity,Math.round(r.uQuantity.value))),t=r.uSpread.value;if(e!==_e||t!==ve){_e=e,ve=t;let n=0,r=0;for(let i=0;i<O.waves;i++)for(let a=0;a<e;a++,n++){let o=k(f,i,a,e,t,p[n]);$(ne,n,o),$(Z,n,o),$(se,n,o),$(D,n,o);for(let e=0;e<o.count;e++,r++)$(g,r,o),g.attributes.aLink.setXYZW(r,e,o.count,o.pitch,o.seed+e*.173)}for(let e=n;e<p.length;e++)p[e].active=!1;g.instanceCount=r,ne.instanceCount=Z.instanceCount=n,ge(Z),se.instanceCount=n,ge(se),D.instanceCount=n,ge(D),ge(g),g.attributes.aLink.needsUpdate=!0,ge(ne);for(let e of[`aStart`,`aEnd`,`aTime`,`aLink`])_.attributes[e].array.set(g.attributes[e].array),_.attributes[e].needsUpdate=!0;_.instanceCount=r;for(let e of he){for(let t=0;t<e.attributes.seed.count;t++)$(e,t,p[t%n]),e===B.geometry&&e.attributes.aArrow.setX(t,+(Math.floor(t/n)%4==0));e===B.geometry&&(e.attributes.aArrow.needsUpdate=!0),ge(e)}}}let be;function xe(){ye();let e=r.uSpriteChains.value===1;e!==be&&(be=e,S.geometry=w.geometry=e?_:g,S.material=e?T:x,w.material=e?E:C);let t=r.uTime.value;S.visible=w.visible=t>0&&t<4.45,V.visible=oe.visible=q.visible=t>0&&t<4.15,G.visible=t>0&&t<4.45,z.visible=pe.visible=t>=.35&&t<(O.waves-1)*O.waveGap+O.stagger+O.flight+O.groundDuration,J.visible=t>=.35&&t<(O.waves-1)*O.waveGap+O.stagger+O.flight+.6+2*O.risingLifetime,Q.visible=t>=.35&&t<3.625,B.visible=t>=1.1&&t<4.8}return a.push(xe),xe(),!0}let M=Object.freeze({duration:6.5,defaultQuantity:64,maxQuantity:128,radius:3,height:6.5,rainStart:1.17,flight:.085,landingSparkLife:.29,hold:2.5,dissolve:.7,detonateAt:5.125,sigilRelease:.52,burstLife:.85,shardLife:.975,spreadWindow:1.43,groundHold:3,groundFade:.4,arrowLength:1.24,arrowHeadLength:2/3*.34,penetration:.055}),N=e=>{let t=String(e);return t.includes(`.`)?t:t+`.0`};function P(e){let t=new Float64Array(M.maxQuantity*4),n=e>>>0;for(let e=0;e<t.length;e++)n=Math.imul(n,1664525)+1013904223>>>0,t[e]=n/4294967296;return t}function F(e,t,n,r,i){let a=t*4,o=e[a],s=e[a+2],c=e[a+3],l=t*2.399963229728653+(o-.5)*.5,u=n>1?Math.sqrt((t+.5)/n):0,d=M.radius*u*r,f=M.spreadWindow*t/Math.max(1,n-1),p=(s-.5)*.12,m=c*Math.PI*2;return i.slot=t,i.birth=M.rainStart+f,i.end[0]=Math.cos(l)*d,i.end[1]=0,i.end[2]=Math.sin(l)*d,i.start[0]=i.end[0]+Math.cos(m)*p*M.height,i.start[1]=M.height+(s-.5)*.5,i.start[2]=i.end[2]+Math.sin(m)*p*M.height,i.length=Math.hypot(i.start[0]-i.end[0],i.start[1]-i.end[1],i.start[2]-i.end[2]),i.seed=o,i.active=!0,i}function I(e,t=M.defaultQuantity,n=1){t=Math.max(1,Math.min(M.maxQuantity,Math.round(Number.isFinite(t)?t:M.defaultQuantity))),n=Math.max(.5,Math.min(2,Number.isFinite(n)?n:1));let r=P(e),i=[];for(let e=0;e<t;e++)i.push(F(r,e,t,n,{start:[0,0,0],end:[0,0,0]}));return i}function te({THREE:e,spec:t,cap:n,uniforms:r,geometries:i,animated:a,mesh:o,instanced:s,shader:c,output:l}){if(t.id!==`arcane-arrow-rain`)return!1;let u={uInlay:{value:new e.Color}},d=globalThis.matchMedia?.(`(prefers-reduced-motion: reduce)`),f=M.maxQuantity,p=P(t.seed),m=I(t.seed,f,1),h=`
    float arPenetration(float age){float t=clamp((age-${N(M.flight)})/0.08,0.0,1.0);return ${N(M.penetration)}*(1.0-pow(1.0-t,3.0));}
    float arTipDistance(float age,float span){return pow(clamp(age/${N(M.flight)},0.0,1.0),1.6)*span+arPenetration(age);}
  `;function g(t,n){let r=new e.InstancedBufferGeometry;t.index&&r.setIndex(t.index.clone());for(let[e,n]of Object.entries(t.attributes))r.setAttribute(e,n.clone());return t.dispose(),r.setAttribute(`aStart`,new e.InstancedBufferAttribute(new Float32Array(n*3),3)),r.setAttribute(`aEnd`,new e.InstancedBufferAttribute(new Float32Array(n*3),3)),r.setAttribute(`aTime`,new e.InstancedBufferAttribute(new Float32Array(n*2),2)),r.instanceCount=0,r}function _(){let t=[],n=new e.ConeGeometry(.135,.62,4,1);n.rotateX(Math.PI).translate(0,-.05,0),t.push([n,1]),t.push([new e.ConeGeometry(.135,.22,4,1).translate(0,.37,0),1]),t.push([new e.CylinderGeometry(.032,.046,1.66,6,1).translate(0,1.08,0),0]),t.push([new e.CylinderGeometry(.072,.072,.08,6,1).translate(0,.44,0),2]);for(let n=0;n<3;n++){let r=new e.BoxGeometry(.018,.52,.16),i=r.attributes.position;for(let e=0;e<i.count;e++)i.getZ(e)>0&&i.setY(e,i.getY(e)+.18);r.computeVertexNormals(),r.translate(0,1.62,.09).rotateY(n*Math.PI*2/3),t.push([r,2])}let r=[],i=[],a=[],o=[],s=M.arrowLength/2.42;for(let[e,n]of t){let t=a.length,{position:c,normal:l}=e.attributes;for(let e=0;e<c.count;e++)r.push(c.getX(e)*s,(c.getY(e)- -.36)*s-M.arrowHeadLength,c.getZ(e)*s),i.push(l.getX(e),l.getY(e),l.getZ(e)),a.push(n);for(let n of e.index.array)o.push(t+n);e.dispose()}let c=new e.BufferGeometry;return c.setIndex(o),c.setAttribute(`position`,new e.Float32BufferAttribute(r,3)),c.setAttribute(`normal`,new e.Float32BufferAttribute(i,3)),c.setAttribute(`aPartId`,new e.Float32BufferAttribute(a,1)),c}let v=g(_(),f),y=`${h}
    attribute vec3 aStart,aEnd;attribute vec2 aTime;attribute float aPartId;uniform float uTime;
    varying vec3 vNormal,vViewPosition,vLocal;varying float vAge,vAlive,vSeed,vHeat,vPart;
    void main(){
      float age=uTime-aTime.x;
      vec3 delta=aEnd-aStart;float span=length(delta);vec3 forward=delta/span;
      vec3 right=normalize(cross(forward,vec3(0.0,1.0,0.0)));
      if(length(right)<0.001)right=vec3(1.0,0.0,0.0);
      vec3 side=normalize(cross(right,forward));
      float tip=arTipDistance(age,span);
      // arTipDistance already adds the shallow penetration to the travel, so the
      // contact offset only cancels the tip vertex's own -Y extent (no double pen).
      float contactOffset=-${N(M.arrowHeadLength)}*forward.y;
      // The model's -Y tip sits at the traveling tip; body extends backward.
      vec3 local=aStart+forward*tip+right*position.x+forward*(-position.y)+side*position.z+vec3(0.0,contactOffset,0.0);
      vLocal=local;vPart=aPartId;
      vNormal=normalize(normalMatrix*(right*normal.x+forward*(-normal.y)+side*normal.z));
      vec4 view=modelViewMatrix*vec4(local*uSize,1.0);vViewPosition=-view.xyz;
      vAge=age;vSeed=aTime.y;
      vHeat=1.0-clamp(age/${N(M.flight)},0.0,1.0);
      vAlive=step(0.0,age);
      gl_Position=projectionMatrix*view;
    }`,b=c(`
    uniform vec3 uColor,uInlay;
    varying vec3 vNormal,vViewPosition,vLocal;varying float vAge,vAlive,vSeed,vHeat,vPart;
    void main(){
      if(vAlive<0.5||vLocal.y<0.0)discard;
      vec3 n=normalize(vNormal);
      vec3 viewDirection=isOrthographic?vec3(0.0,0.0,1.0):normalize(vViewPosition);
      vec3 light=normalize(vec3(-0.35,0.8,0.65));
      float diffuse=clamp(dot(n,light)*0.65+0.35,0.0,1.0);
      float shine=pow(max(0.0,dot(n,normalize(light+viewDirection))),38.0);
      // Arcane body: selected tint with a bright core and flowing energy.
      vec3 body=uColor*mix(0.20,0.76,smoothstep(0.13,0.82,diffuse));
      body+=uColor*shine*0.30;
      float flow=0.5+0.5*sin(vLocal.y*26.0-vAge*9.0+vSeed*6.283185);
      body+=uColor*pow(flow,5.0)*0.35*min(uDetail,1.4);
      // Fresnel rim so the slender body reads as glowing energy, not a stick.
      float rim=pow(1.0-abs(dot(n,viewDirection)),2.0);
      body+=uColor*1.2*rim*0.8;
      // Hot tip while falling; cools once embedded.
      float tipHeat=exp(-max(0.0,vLocal.y)*6.0)*vHeat;
      body+=uColor*tipHeat*1.3;
      // Embedded arrows keep a steady arcane glow so the standing shaft and
      // fletching read clearly against the ground for the whole hold.
      float embedded=1.0-vHeat;
      float pulse=0.75+0.25*sin(vAge*3.0+vSeed*6.283185);
      body+=uColor*embedded*0.55*pulse;

      // The shaft carries the arcane tint; the faceted head, collar and
      // fletching use the same pale gold inlay as the casting seal by default.
      float band=smoothstep(.31,.43,diffuse);
      vec3 shaft=body*.72;
      vec3 head=uInlay*(.24+.50*band+.28*rim+.34*shine+.44*vHeat);
      vec3 trim=uInlay*(.42+.30*band+.18*rim+.25*shine);
      body=vPart<.5?shaft:(vPart<1.5?head:trim);
      gl_FragColor=vec4(body/max(.8,max(body.r,max(body.g,body.b))),1.0);
      ${l}
    }`,y,u,!1);b.transparent=!1,b.depthWrite=!0,b.side=e.DoubleSide,b.userData.ownLifecycle=!0;let x=o(v,b,1);x.name=`arcane-arrow-bodies`;let S=g(new e.PlaneGeometry(1,1),f),C=`${h}
    attribute vec3 aStart,aEnd;attribute vec2 aTime;uniform float uTime;
    varying vec2 vUv;varying float vFade;
    void main(){
      float age=uTime-aTime.x;
      vec3 delta=aEnd-aStart;float span=length(delta);vec3 forward=delta/span;
      float tip=arTipDistance(age,span);
      vec3 center=aStart+forward*tip;
      vec4 view=modelViewMatrix*vec4(center*uSize,1.0);
      float scale=0.34*(1.0-smoothstep(${N(M.flight)},${N(M.flight)}+0.1,age));
      view.xy+=position.xy*scale*uSize*length(modelViewMatrix[0].xyz);
      vUv=uv;
      vFade=step(0.0,age)*(1.0-smoothstep(${N(M.flight)},${N(M.flight)}+0.1,age));
      gl_Position=vFade<=0.0?vec4(2.0,2.0,2.0,1.0):projectionMatrix*view;
    }`,w=c(`
    uniform vec3 uInlay;varying vec2 vUv;varying float vFade;
    void main(){
      if(vFade<=0.0)discard;
      vec2 q=vUv*2.0-1.0;float r=length(q);
      float core=exp(-r*r*26.0);
      float halo=exp(-r*r*6.0)*0.5;
      float alpha=(core+halo)*vFade;
      if(alpha<0.004)discard;
      vec3 color=uInlay*(.7+.3*core);
      gl_FragColor=vec4(color*2.0,alpha);
      ${l}
    }`,C,u,!0);w.userData.ownLifecycle=!0;let T=o(S,w,3);T.name=`arcane-arrow-tip-cores`;let E=g(new e.PlaneGeometry(2,2),f),D=`
    attribute vec3 aEnd;attribute vec2 aTime;uniform float uTime;
    varying vec2 vP;varying float vT,vSeed;
    void main(){
      float age=uTime-aTime.x-${N(M.flight)};
      vT=clamp(age/${N(M.landingSparkLife)},0.0,1.0);vSeed=aTime.y;
      vP=vec2(position.x,position.y*.66+.48);
      vec4 view=modelViewMatrix*vec4(aEnd*uSize,1.0);
      view.xy+=vP*1.05*uSize*length(modelViewMatrix[0].xyz);
      gl_Position=(age<0.0||vT>=1.0)?vec4(2.0,2.0,2.0,1.0):projectionMatrix*view;
    }`,O=c(`
    uniform vec3 uColor,uInlay;varying vec2 vP;varying float vT,vSeed;
    void main(){
      float sparks=0.0;
      for(int j=0;j<7;j++){
        float i=float(j),h=fract(sin(i*17.17+vSeed*8.91)*4375.3);
        float a=.25+(i+.55*h)*.395;
        vec2 vel=vec2(cos(a),sin(a))*(.58+.36*h);
        vec2 center=vel*(1.0-pow(1.0-vT,2.2));
        vec2 axis=normalize(vel);
        vec2 d=vP-center;float along=dot(d,axis),across=abs(dot(d,vec2(-axis.y,axis.x)));
        float shape=abs(along)/.145+across/(.012+.014*h);
        sparks=max(sparks,1.0-smoothstep(.68,1.08,shape));
      }
      float alpha=sparks*(1.0-smoothstep(.48,1.0,vT));
      if(alpha<.012)discard;
      gl_FragColor=vec4(mix(uColor,uInlay,.85)*1.65,alpha);
      ${l}
    }`,D,u,!0);O.userData.ownLifecycle=!0;let ee=o(E,O,3);ee.name=`arcane-arrow-contact-sparks`;function k(){let n=[],r=[],i=[],a=t.seed>>>0,o=()=>(a=Math.imul(a,1664525)+1013904223>>>0,a/4294967296);function s(e,t,a,o,s){let c=t[0]-e[0],l=t[1]-e[1],u=Math.hypot(c,l)||1,d=-l/u,f=c/u,p=[[e[0]+d*a,e[1]+f*a,-1,o],[e[0]-d*a,e[1]-f*a,1,o],[t[0]+d*a*.55,t[1]+f*a*.55,-1,s],[t[0]-d*a*.55,t[1]-f*a*.55,1,s]],m=n.length/3;for(let[e,t,i,a]of p)n.push(e,.012,t),r.push(i,a);i.push(m,m+2,m+1,m+1,m+2,m+3)}for(let e=0;e<6;e++){let t=e*Math.PI/3+(o()-.5)*.4,n=.7+o()*.3,r=[0,0];for(let e=1;e<=5;e++){let i=e/5*n,a=t+(o()-.5)*.4,c=[Math.cos(a)*i,Math.sin(a)*i];if(s(r,c,.03*(1-e/7),(e-1)/5,e/5),e===2||e===4){let t=a+(o()>.5?1:-1)*(.5+o()*.5),n=.12+o()*.12;s(c,[c[0]+Math.cos(t)*n,c[1]+Math.sin(t)*n],.012,e/5,Math.min(1,e/5+.22))}r=c}}let c=new e.BufferGeometry;return c.setIndex(i),c.setAttribute(`position`,new e.Float32BufferAttribute(n,3)),c.setAttribute(`uv`,new e.Float32BufferAttribute(r,2)),c}let A=g(k(),f),j=`
    vec2 arCrackPoint(vec2 q,float seed){
      float radius=length(q),angle=seed*6.283185;
      q*=0.88+0.12*sin((radius>0.0?atan(q.y,q.x):0.0)*3.0+seed*37.0+radius*4.0);
      return mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*q;
    }`,te=`${j}
    attribute vec3 aEnd;attribute vec2 aTime;uniform float uTime;
    varying vec2 vCrack;varying float vAge;
    void main(){
      vec2 q=arCrackPoint(position.xz,aTime.y);
      vec3 p=aEnd+vec3(q.x,position.y,q.y);
      vCrack=uv;vAge=uTime-aTime.x;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p*uSize,1.0);
    }`,ne=c(`
    uniform vec3 uColor;varying vec2 vCrack;varying float vAge;
    void main(){
      float reveal=smoothstep(vCrack.y*0.15,vCrack.y*0.15+0.03,vAge-${N(M.flight)});
      float fade=1.0-smoothstep(${N(M.flight)}+${N(M.groundHold)},${N(M.flight)}+${N(M.groundHold)}+${N(M.groundFade)},vAge);
      float edge=1.0-smoothstep(0.72,1.0,abs(vCrack.x));
      float alpha=reveal*fade*edge;
      if(alpha<0.004)discard;
      float core=1.0-smoothstep(0.08,0.72,abs(vCrack.x));
      vec3 color=uColor*mix(.75,1.5,core);
      gl_FragColor=vec4(color,alpha);
      ${l}
    }`,te,{},!0);ne.userData.ownLifecycle=!0;let L=o(A,ne,0);L.name=`arcane-arrow-ground-cracks`;let R=`${j}
    attribute vec3 aEnd;attribute vec2 aTime;uniform float uTime;
    varying vec2 vGlow;varying float vAge;
    void main(){
      // Reuse the crack quad positions but widen them into a soft band.
      vec2 q=arCrackPoint(position.xz*1.6,aTime.y);
      vec3 p=aEnd+vec3(q.x,0.014,q.y);
      vGlow=uv;vAge=uTime-aTime.x;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p*uSize,1.0);
    }`,z=c(`
    uniform vec3 uColor;varying vec2 vGlow;varying float vAge;
    void main(){
      float reveal=smoothstep(vGlow.y*0.15,vGlow.y*0.15+0.03,vAge-${N(M.flight)});
      float fade=1.0-smoothstep(${N(M.flight)}+${N(M.groundHold)},${N(M.flight)}+${N(M.groundHold)}+${N(M.groundFade)},vAge);
      float band=exp(-pow(abs(vGlow.x)*2.2,2.0));
      float alpha=band*reveal*fade*0.35*min(uDetail,1.5);
      if(alpha<0.002)discard;
      gl_FragColor=vec4(uColor*1.65,alpha);
      ${l}
    }`,R,{},!0);z.userData.ownLifecycle=!0;let re=o(A,z,-1);re.name=`arcane-arrow-crack-glow`;let ie=g(new e.PlaneGeometry(1,1),f),ae=`
    attribute vec3 aEnd;attribute vec2 aTime;uniform float uTime;
    varying vec2 vUv;varying float vFade;
    void main(){
      float age=uTime-aTime.x-${N(M.flight)};
      float appear=smoothstep(0.0,0.08,age);
      float fade=1.0-smoothstep(${N(M.hold)}+${N(M.dissolve)}+0.6,${N(M.hold)}+${N(M.dissolve)}+1.0,age);
      vec3 p=aEnd+vec3(0.0,0.02,0.0);
      vec4 view=modelViewMatrix*vec4(p*uSize,1.0);
      float scale=0.30;
      view.xy+=position.xy*scale*uSize*length(modelViewMatrix[0].xyz);
      vUv=uv;vFade=appear*fade;
      gl_Position=vFade<=0.0?vec4(2.0,2.0,2.0,1.0):projectionMatrix*view;
    }`,B=c(`
    uniform vec3 uColor;varying vec2 vUv;varying float vFade;
    void main(){
      if(vFade<=0.0)discard;
      vec2 q=vUv*2.0-1.0;float r=length(q);
      float core=exp(-r*r*20.0);
      float halo=exp(-r*r*5.0)*0.4;
      float alpha=(core+halo)*vFade*0.8;
      if(alpha<0.004)discard;
      vec3 color=uColor*(.7+.3*core);
      gl_FragColor=vec4(color*1.3,alpha);
      ${l}
    }`,ae,{},!0);B.userData.ownLifecycle=!0;let V=o(ie,B,0);V.name=`arcane-arrow-socket-glow`;let oe=`
    attribute vec4 seed;attribute vec3 aEnd;attribute vec2 aTime;uniform float uTime;
    varying vec2 vUv;varying float vFade;
    void main(){
      float contact=uTime-aTime.x-${N(M.flight)};
      float delay=seed.z*0.5;
      float life=1.4;
      float elapsed=contact-delay;
      float cycle=floor(max(elapsed,0.0)/life);
      float age=elapsed-cycle*life;
      float drift=max(age,0.0);
      float angle=seed.w*6.283185;
      vec3 p=aEnd+vec3(cos(angle)*0.12,0.05+drift*(0.5+seed.y*0.4),sin(angle)*0.12);
      vFade=step(0.0,elapsed)*smoothstep(0.0,0.15,age)*(1.0-smoothstep(1.0,1.4,age));
      float scale=0.05+seed.y*0.04;
      vec4 view=modelViewMatrix*vec4(p*uSize,1.0);
      view.xy+=position.xy*scale*uSize*length(modelViewMatrix[0].xyz);
      vUv=uv;gl_Position=vFade<=0.0?vec4(2.0,2.0,2.0,1.0):projectionMatrix*view;
    }`,H=c(`
    uniform vec3 uColor;varying vec2 vUv;varying float vFade;
    void main(){
      if(vFade<=0.0)discard;
      vec2 q=vUv*2.0-1.0;float r=length(q);
      float alpha=exp(-r*r*8.0)*vFade*min(uDetail,1.4);
      if(alpha<0.004)discard;
      gl_FragColor=vec4(uColor*1.4,alpha);
      ${l}
    }`,oe,{},!0);H.userData.ownLifecycle=!0;let U=s(new e.PlaneGeometry(1,1),n,.5,H,4);U.name=`arcane-arrow-rising-motes`;let se=`
    attribute vec4 seed;attribute vec3 aStart,aEnd;attribute vec2 aTime;uniform float uTime;
    varying vec2 vUv;varying float vFade;
    void main(){
      float age=uTime-aTime.x-seed.z*0.3;
      vec3 delta=aEnd-aStart;float span=length(delta);vec3 forward=delta/span;
      vec3 right=normalize(cross(forward,vec3(0.0,1.0,0.0)));
      if(length(right)<0.001)right=vec3(1.0,0.0,0.0);
      vec3 side=normalize(cross(right,forward));
      float travel=pow(clamp(age/${N(M.flight)},0.0,1.0),1.6);
      float offset=(seed.y-0.5)*0.3;
      vec3 center=aStart+forward*(travel*span)+right*offset+side*(seed.w-0.5)*0.3;
      vec4 view=modelViewMatrix*vec4(center*uSize,1.0);
      vec3 dirView=mat3(modelViewMatrix)*forward;
      vec2 heading=length(dirView.xy)>0.0001?normalize(dirView.xy):vec2(0.0,1.0);
      vec2 lateral=vec2(heading.y,-heading.x);
      float scale=0.16;
      view.xy+=(lateral*position.x*0.3+heading*position.y)*scale*uSize*length(modelViewMatrix[0].xyz);
      vUv=uv;
      vFade=step(0.0,age)*(1.0-smoothstep(${N(M.flight)}*0.7,${N(M.flight)},age));
      gl_Position=vFade<=0.0?vec4(2.0,2.0,2.0,1.0):projectionMatrix*view;
    }`,W=c(`
    uniform vec3 uColor;varying vec2 vUv;varying float vFade;
    void main(){
      if(vFade<=0.0)discard;
      float across=abs(vUv.x*2.0-1.0);
      float along=1.0-vUv.y;
      float alpha=exp(-across*across*14.0)*pow(along,1.5)*vFade*min(uDetail,1.4);
      if(alpha<0.004)discard;
      gl_FragColor=vec4(uColor*(.8+.2*along)*1.4,alpha);
      ${l}
    }`,se,{},!0);W.userData.ownLifecycle=!0;let G=s(new e.PlaneGeometry(1,1),n,.3,W,4);G.name=`arcane-arrow-falling-sparks`;let K=new e.InstancedBufferGeometry().copy(new e.PlaneGeometry(2,2));K.setAttribute(`aCardinal`,new e.InstancedBufferAttribute(new Float32Array([1,0,-1,0,0,1,0,-1]),2));let q={value:0},ce=`
    uniform float uTime,uFusionClock;attribute vec2 aCardinal;
    varying vec2 vUv;varying float vFade;
    void main(){
      float approach=1.0-smoothstep(.05,.78,uFusionClock);
      float radius=3.65*1.23*mix(.30,1.0,smoothstep(.55,1.0,uFusionClock));
      float release=smoothstep(${N(M.detonateAt)},${N(M.detonateAt+M.sigilRelease)},uTime);
      vec2 xz=aCardinal*3.10*approach+position.xy*radius*(1.0+.38*release);
      float secondary=smoothstep(0.0,.25,approach);
      vFade=(1.0-release)*(aCardinal.x>.5?1.0:secondary);
      vUv=position.xy;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(vec3(xz.x,.015,xz.y)*uSize,1.0);
    }`,le=c(`
    uniform vec3 uColor,uInlay;uniform float uTime;varying vec2 vUv;varying float vFade;
    // Segment distance for the engraved outer ring.
    float segment(vec2 p,vec2 a,vec2 b){
      vec2 v=b-a;return length(p-a-v*clamp(dot(p-a,v)/dot(v,v),0.0,1.0));
    }
    // A hollow diamond hub and four split lance heads, on the same cardinal axes as the four major crowns.
    float crest(vec2 uv){
      vec2 f=abs(uv);
      vec2 k=vec2(max(f.x,f.y),min(f.x,f.y));
      float hub=abs(k.x+k.y-.120)*.7071-.011;
      // A bevelled spear silhouette with a long kite-shaped cutout.
      float blade=max(max((.124-k.x)*.62+k.y*.78,
                          (k.x-.444)*.19+k.y*.98),-k.x);
      float slit=max((.177-k.x)*.45+k.y*.89,(k.x-.348)*.14+k.y*.99);
      blade=max(blade,-slit);
      float arc=max(abs(length(k)-.274)-.008,max(.078-k.y,k.y-.154));
      float shard=abs(k.x+k.y-.316)+2.8*(k.x-k.y)-.052;
      return min(min(hub,blade),min(arc,shard));
    }
    void main(){
      float r=length(vUv);
      if(r>0.997)discard;
      float d,accent;
      if(r<0.50){
        d=crest(vUv);accent=1.0;
      }else{
        float a=atan(vUv.y,vUv.x), turn=6.2831853;
        // Concentric rails, a woven band and engraved angular runes.
        d=min(abs(r-.706)-.006,abs(r-.814)-.009);
        d=min(d,abs(r-.864)-.006);
        d=min(d,abs(r-(.757+.029*sin(12.0*a)))-.004);
        d=min(d,abs(r-(.757-.029*sin(12.0*a)))-.004);
        float glyphAngle=mod(a+turn/96.0,turn/48.0)-turn/96.0;
        vec2 g=vec2(r*sin(glyphAngle),r-.838);
        d=min(d,segment(g,vec2(-.022,-.013),vec2(.002,.012))-.0045);
        d=min(d,segment(g,vec2(.002,.012),vec2(.021,-.002))-.0045);
        // Sixteen kites interrupt the rims; every fourth grows into an inlaid crown.
        float sector=floor(a/(turn/16.0)+.5);
        float phi=a-sector*(turn/16.0);
        float major=1.0-step(.1,mod(sector,4.0));
        float medium=1.0-step(.1,mod(sector,2.0));
        vec2 k=vec2(r*cos(phi),abs(r*sin(phi)));
        float tip=.882+.045*medium+.058*major, root=.707-.063*medium-.095*major;
        float crown=segment(k,vec2(root,0),vec2(.777,.052+.022*major));
        crown=min(crown,segment(k,vec2(.777,.052+.022*major),vec2(tip,0)));
        crown=min(crown,segment(k,vec2(root+.048,0),vec2(.795,.029)));
        crown=min(crown,segment(k,vec2(.795,.029),vec2(tip-.035,0)));
        float barb=segment(k,vec2(.78,.039),vec2(.852,.075));
        barb=min(barb,segment(k,vec2(.852,.075),vec2(.818,.021)));
        crown=min(crown,barb+.10*(1.0-medium))-.009;
        float ornament=1.0-smoothstep(0.0,.022,crown);
        d=min(d,crown);
        accent=ornament*major;
      }
      float aa=max(.001,.52*fwidth(d)),ink=1.0-smoothstep(-aa,aa,d);
      float glow=.30*exp(-max(d,0.0)*100.0);
      vec3 tint=mix(uColor*.78,uInlay,accent);
      float alpha=max(ink,glow)*vFade*min(uDetail,1.4);
      if(alpha<.005)discard;
      gl_FragColor=vec4(tint*(.90+.10*ink),alpha);
      ${l}
    }`,ce,{...u,uFusionClock:q},!0);le.userData.ownLifecycle=!0;let J=o(K,le,0);J.name=`arcane-arrow-casting-sigil`;let ue=c(`
    uniform vec3 uColor;varying vec2 vUv;varying float vFade;
    void main(){
      if(vFade<=0.0)discard;
      vec2 q=vUv*2.0-1.0;float r=length(q);
      float alpha=exp(-r*r*7.0)*vFade*0.5*min(uDetail,1.4);
      if(alpha<0.004)discard;
      gl_FragColor=vec4(uColor*1.2,alpha);
      ${l}
    }`,`
    attribute vec4 seed;uniform float uTime;
    varying vec2 vUv;varying float vFade;
    void main(){
      float angle=seed.x*6.283185+uTime*0.1;
      float radius=0.5+seed.y*2.8;
      float y=0.3+seed.z*4.5+sin(uTime*0.5+seed.w*6.283185)*0.2;
      vec3 p=vec3(cos(angle)*radius,y,sin(angle)*radius);
      float appear=smoothstep(0.0,0.4,uTime);
      float fade=1.0-smoothstep(3.6,4.4,uTime);
      vec4 view=modelViewMatrix*vec4(p*uSize,1.0);
      float scale=0.04+seed.w*0.03;
      view.xy+=position.xy*scale*uSize*length(modelViewMatrix[0].xyz);
      vUv=uv;vFade=appear*fade*(0.4+0.6*sin(uTime*2.0+seed.x*20.0)*0.5+0.3);
      gl_Position=vFade<=0.0?vec4(2.0,2.0,2.0,1.0):projectionMatrix*view;
    }`,{},!0);ue.userData.ownLifecycle=!0;let Y=s(new e.PlaneGeometry(1,1),n,.2,ue,4);Y.name=`arcane-arrow-ambient-dust`;let X=`
    attribute vec4 seed;attribute vec3 aEnd;attribute vec2 aTime;uniform float uTime;
    varying vec2 vUv;varying float vFade,vHeat;
    void main(){
      float age=uTime-${N(M.detonateAt)};
      float t=max(age,0.0);
      float angle=seed.x*6.283185;
      float radius=mix(0.8,1.9,seed.y);
      float progress=(1.0-exp(-3.0*t))/(1.0-exp(-3.0*0.5));
      vec3 p=aEnd+vec3(cos(angle)*radius*progress,0.16+(1.7+3.0*seed.z)*t-4.0*t*t,sin(angle)*radius*progress);
      vFade=step(0.0,age)*(1.0-smoothstep(0.35,0.5,age));
      vHeat=1.0-clamp(t/0.3,0.0,1.0);
      float scale=mix(0.09,0.20,seed.y);
      float spin=angle+t*mix(8.0,17.0,seed.z);
      vec2 direction=vec2(cos(spin),sin(spin));
      vec4 view=modelViewMatrix*vec4(p*uSize,1.0);
      vec2 offset=(direction*position.y+vec2(-direction.y,direction.x)*position.x*0.7)*scale;
      view.xy+=offset*uSize*length(modelViewMatrix[0].xyz);
      vUv=uv;gl_Position=vFade<=0.0?vec4(2.0,2.0,2.0,1.0):projectionMatrix*view;
    }`,de={uSalvoColor:{value:new e.Color}},Z=new e.Color(t.color),fe=new e.Color(-1,-1,-1),pe={h:0,s:0,l:0};function me(){let t=r.uColor.value;if(fe.equals(t))return;fe.copy(t),t.getHSL(pe,e.SRGBColorSpace);let n=u.uInlay.value;pe.s===0?n.copy(t):n.setHSL((pe.h+.35)%1,pe.s*.76,.62+pe.l*.16,e.SRGBColorSpace);let i=de.uSalvoColor.value;t.equals(Z)?i.setHex(14027519):pe.s===0?i.copy(t):i.setHSL(pe.h,1,.5,e.SRGBColorSpace)}let Q=c(`
    uniform vec3 uSalvoColor;varying vec2 vUv;varying float vFade,vHeat;
    void main(){
      if(vFade<=0.0)discard;
      vec2 q=vUv*2.0-1.0;
      float edge=max(max(-q.y-0.55,q.x*0.92+q.y*0.5-0.30),-q.x*0.75+q.y*0.55-0.34);
      float chip=1.0-smoothstep(-0.045,0.025,edge);
      float alpha=chip*0.85*vFade*min(uDetail,1.4);
      if(alpha<0.004)discard;
      vec3 color=mix(uSalvoColor,vec3(1.0),vHeat*smoothstep(.12,.72,vUv.y))*(0.60+0.24*vUv.y+0.16*exp(-abs(edge)*60.0)*vHeat);
      gl_FragColor=vec4(color,alpha);
      ${l}
    }`,X,de,!1);Q.toneMapped=!1,Q.userData.ownLifecycle=!0;let he=s(new e.PlaneGeometry(1,1),f*8,0,Q,4);he.name=`arcane-arrow-erosion-chips`,he.geometry.userData.arcaneArrowChips=!0;let $=c(`
    uniform vec3 uSalvoColor;varying vec2 vP;varying float vT;
    void main(){
      float r=length(vP);
      if(r>.98)discard;
      float front=.31+.62*(1.0-pow(1.0-vT,2.4));
      float a=atan(vP.y,vP.x+.00001);
      front+=.018*sin(6.0*a-7.0*vT)+.008*sin(13.0*a+5.0*vT);
      float d=abs(r-front);
      float ring=1.0-smoothstep(.009,.028,d);
      float echo=1.0-smoothstep(.005,.018,abs(r-front+.080));
      float gate=smoothstep(-.82,-.32,cos(5.0*a-5.8*vT)+.32*cos(9.0*a+2.7*vT));
      float alpha=(ring*gate+.6*echo*smoothstep(-.4,.4,cos(12.0*a+5.0*vT))+.45*exp(-48.0*d)*gate)*(1.0-vT);
      if(alpha<.005)discard;
      gl_FragColor=vec4(mix(uSalvoColor,vec3(1.0),echo*(1.0-smoothstep(.03,.24,vT)))*(.68+.32*ring),clamp(alpha,0.0,1.0));
      ${l}
    }`,`
    uniform float uTime; uniform float uSpread; varying vec2 vP;varying float vT;
    void main(){vP=position.xy;vT=clamp((uTime-${N(M.detonateAt)})/${N(M.burstLife)},0.0,1.0);
      vec2 xz=vP*(1.8+3.2*uSpread);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(vec3(xz.x,.025,xz.y)*uSize,1.0);}
    `,de,!1);$.toneMapped=!1,$.userData.ownLifecycle=!0;let ge=o(new e.PlaneGeometry(2,2),$,1);ge.name=`arcane-arrow-release-wave`;let _e=new e.BufferGeometry,ve=[],ye=[],be=[];for(let e=0;e<4;e++){let t=e*4;ve.push(-1,-1,0,1,-1,0,1,1,0,-1,1,0),ye.push(e,e,e,e),be.push(t,t+1,t+2,t,t+2,t+3)}_e.setIndex(be),_e.setAttribute(`position`,new e.Float32BufferAttribute(ve,3)),_e.setAttribute(`aRole`,new e.Float32BufferAttribute(ye,1));let xe=g(_e,f),Se=c(`
    uniform vec3 uSalvoColor,uInlay;
    varying vec2 vP;
    varying float vAge,vSeed,vRole,vNeedleRelease;
    void main(){
      vec2 p=vP;
      float t=vAge, s=vSeed, alpha; vec3 color;
      if(vRole<.5){
        // Two tapered diagonals form a single camera-facing four-point glint.
        float a=.785398+(s-.5)*.12;
        vec2 q=mat2(cos(a),-sin(a),sin(a),cos(a))*p;
        vec2 k=abs(q);
        float longArm=k.x/.96+k.y/.105, shortArm=k.y/.81+k.x/.115;
        float star=min(longArm,shortArm);
        float ink=1.-smoothstep(.88,1.02,star);
        float filament=1.-smoothstep(.26,.69,star);
        float r=length(p);
        float white=max(filament*.88,1.-smoothstep(.055,.19,r))*(1.-.73*smoothstep(.035,.17,t));
        float halo=.46*exp(-11.*r*r)*(1.-smoothstep(.52,.90,r));
        float bloom=.36*exp(-2.2*star);
        // Let the white peak cool first; hold the gold silhouette through its turn.
        alpha=max(ink,max(halo,bloom))*(1.-smoothstep(.21,.49,t));
        color=mix(mix(uSalvoColor,uInlay,ink),vec3(1.),white);
      }else{
        float ember=step(2.5,vRole);
        // A straight spine joins each bright tip to its trailing point.
        float y=p.y*.5+.5;
        float plume=(.05+.72*pow(y,2.5))*(1.-smoothstep(.73,1.,y));
        float needle=min(y/.70,(1.-y)/.30);
        float d=abs(p.x)/max(.012,mix(needle,plume,ember));
        float edge=1.-smoothstep(.65,1.1,d);
        float glow=(1.-smoothstep(.4,2.6,d))*.34;
        float remaining=1.-vNeedleRelease;
        float fade=mix(remaining*remaining,1.-smoothstep(.48,.83+.145*s,t),ember)*smoothstep(0.,.14,y);
        float spine=(1.-smoothstep(.05,.4,d))*smoothstep(.25,.88,y);
        float gold=max(ember,clamp(.24+.73*y-.65*t+.25*spine,0.,1.));
        color=mix(uSalvoColor,uInlay,gold);
        color=mix(color,vec3(1.),spine*.60*(1.-smoothstep(.02,.3,t)));
        alpha=max(edge,glow)*fade*mix(smoothstep(0.,.022,t),smoothstep(.018,.078,t),ember);
      }
      if(alpha<.004)discard;
      gl_FragColor=vec4(color,alpha);
      ${l}
    }`,`
    attribute float aRole;attribute vec3 aEnd;attribute vec2 aTime;
    uniform float uTime,uQuantity;
    varying vec2 vP;varying float vAge,vSeed,vRole,vNeedleRelease;
    void main(){
      float t=max(0.,uTime-${N(M.detonateAt)}), s=aTime.y;
      // The two outward needles shorten and lose light on the same clock.
      vNeedleRelease=clamp((t-.045)/(.40+.10*s),0.,1.);
      float rim=clamp((aTime.x-${N(M.rainStart)})/${N(M.spreadWindow)},0.,1.);
      vec3 center=aEnd+vec3(0.,.42,0.);
      float factor=mix(1.12,.78,smoothstep(40.,128.,uQuantity));
      vec2 axis=vec2(0.,1.), sz;
      if(aRole<.5){
        float turn=.28*clamp(t/.49,0.,1.);
        axis=vec2(-sin(turn),cos(turn));
        sz=vec2(mix(.73,1.02,s)*factor*(1.+.38*smoothstep(0.,.095,t)));
      }else{
        float a=atan(aEnd.z,aEnd.x+.00001)+(aRole<1.5?0.:aRole<2.5?(.42+.26*s):(-.47+.19*s));
        float lift=aRole<1.5?.34+.44*s:aRole<2.5?.96+.60*s:.65+.7*s;
        vec3 dir=vec3(cos(a),lift,sin(a));
        bool spark=aRole<2.5;
        float travel=(spark?1.15*(1.-exp(-10.5*t)):1.-exp(-4.2*t))*mix(.70,2.25,rim)*(.75+.45*s);
        float len=mix(.40,1.40,rim)*(.75+.38*s)*(aRole<1.5?1.:aRole<2.5?.62:.15);
        len*=spark?1.42*(1.-.78*vNeedleRelease):1.-.68*smoothstep(.14,.7,t);
        center+=dir*(travel+.33*len);
        vec2 proj=(mat3(modelViewMatrix)*dir).xy;
        axis=length(proj)>.002?normalize(proj):vec2(0.,1.);
        sz=vec2((spark?.095:.062)*factor,len*factor);
      }
      vRole=aRole;vP=position.xy;vAge=t;vSeed=s;
      vec4 view=modelViewMatrix*vec4(center*uSize,1.);
      view.xy+=(axis*sz.y*position.y+vec2(axis.y,-axis.x)*sz.x*position.x)*uSize*length(modelViewMatrix[0].xyz);
      gl_Position=projectionMatrix*view;
    }`,{...de,...u},!1);Se.toneMapped=!1,Se.userData.ownLifecycle=!0;let Ce=o(xe,Se,3);Ce.name=`arcane-arrow-expiry-bursts`;let we=[U.geometry,G.geometry,Y.geometry,he.geometry];for(let t of we){let n=t.attributes.seed.count;t.setAttribute(`aStart`,new e.InstancedBufferAttribute(new Float32Array(n*3),3)),t.setAttribute(`aEnd`,new e.InstancedBufferAttribute(new Float32Array(n*3),3)),t.setAttribute(`aTime`,new e.InstancedBufferAttribute(new Float32Array(n*2),2))}function Te(e,t,n){e.attributes.aStart.setXYZ(t,n.start[0],n.start[1],n.start[2]),e.attributes.aEnd.setXYZ(t,n.end[0],n.end[1],n.end[2]),e.attributes.aTime.setXY(t,n.birth,n.seed)}function Ee(e){e.attributes.aStart.needsUpdate=!0,e.attributes.aEnd.needsUpdate=!0,e.attributes.aTime.needsUpdate=!0}let De=1/0,Oe=0,ke=-1,Ae=-1;function je(){let e=Math.max(1,Math.min(f,Math.round(r.uQuantity.value))),t=r.uSpread.value;if(e!==ke||t!==Ae){De=1/0,Oe=0,ke=e,Ae=t;for(let n=0;n<e;n++){let r=F(p,n,e,t,m[n]);De=Math.min(De,r.birth),Oe=Math.max(Oe,r.birth);for(let e of[v,S,E,A,ie,xe])Te(e,n,r)}for(let t=e;t<m.length;t++)m[t].active=!1;for(let t of[v,S,E,A,ie,xe])t.instanceCount=e,Ee(t);for(let t of we){let n=t.attributes.seed.count;for(let r=0;r<n;r++)Te(t,r,m[r%e]);Ee(t)}}}let Me=[{key:`bodies`,mesh:x,zh:`能量箭實體`,en:`Energy arrow bodies`,desc:`紫色箭身、金黃箭頭與三片尾翼；淺插地面後一同炸開。`},{key:`cores`,mesh:T,zh:`箭尖熱核`,en:`Arrow-tip hot cores`,desc:`箭尖的白熱亮點，飛行時最醒目。`},{key:`contactSparks`,mesh:ee,zh:`落地尖芒`,en:`Landing spikes`,desc:`箭落地時向上、向外彈出七道尖芒，保持朝向並淡出。`},{key:`cracks`,mesh:L,zh:`地面能量裂紋`,en:`Ground energy cracks`,desc:`由中心向外連接生長的分支裂紋網絡。`},{key:`crackGlow`,mesh:re,zh:`裂紋柔光`,en:`Crack soft glow`,desc:`裂紋周圍的柔和光帶。`},{key:`sockets`,mesh:V,zh:`插地光點`,en:`Embedded socket glow`,desc:`箭插地處持續發亮的光點。`},{key:`motes`,mesh:U,zh:`上浮微光`,en:`Rising motes`,desc:`從落點緩緩上升的能量微光。`},{key:`sparks`,mesh:G,zh:`下落火花`,en:`Falling sparks`,desc:`跟隨箭雨下落的細碎火花。`},{key:`sigil`,mesh:J,zh:`施放符文環`,en:`Casting sigil`,desc:`四座刻紋法陣由左右前後收攏，合為中央箭星。`},{key:`dust`,mesh:Y,zh:`氛圍塵光`,en:`Ambient dust`,desc:`體積中緩慢飄浮的奧術塵光。`},{key:`bursts`,mesh:Ce,zh:`箭陣齊爆與飛羽`,en:`Cross-star salvo and flying fletches`,desc:`每個箭位的四芒星輕轉後淡去，金色尖芒沿直線射向外側，留下點點餘燼。`},{key:`chips`,mesh:he,zh:`侵蝕碎屑`,en:`Erosion chips`,desc:`箭消散時拋出的銳利碎片。`},{key:`wave`,mesh:ge,zh:`終結震波`,en:`Final shockwave`,desc:`分段紫光連成帶缺口的震波，掃過最外圈的箭位。`}],Ne=new Map(Me.map(e=>[e.key,!0]));function Pe(){me(),je();let e=r.uTime.value,t=Oe+M.flight,n=M.detonateAt,i=Math.min(t+M.groundHold+M.groundFade,M.detonateAt),a=e=>Ne.get(e)!==!1;x.visible=a(`bodies`)&&e>=De&&e<n,Ce.visible=a(`bursts`)&&e>=M.detonateAt&&e<n+M.shardLife,T.visible=a(`cores`)&&e>=De&&e<t+.12,ee.visible=a(`contactSparks`)&&e>=De+M.flight&&e<t+M.landingSparkLife,L.visible=a(`cracks`)&&e>=De+M.flight&&e<i,re.visible=a(`crackGlow`)&&e>=De+M.flight&&e<i,V.visible=a(`sockets`)&&e>=De+M.flight&&e<i,U.visible=a(`motes`)&&e>=De+M.flight&&e<i,G.visible=a(`sparks`)&&e>=De&&e<t,q.value=d?.matches?M.rainStart:e,K.instanceCount=q.value<.78?4:1,J.visible=a(`sigil`)&&e>=0&&e<M.detonateAt+M.sigilRelease,Y.visible=a(`dust`)&&e>0&&e<M.duration-.1,he.visible=a(`chips`)&&e>=M.detonateAt&&e<n+.5,ge.visible=a(`wave`)&&e>=M.detonateAt&&e<M.detonateAt+M.burstLife}let Fe={list:()=>Me.map(e=>({key:e.key,name:e.mesh.name,zh:e.zh,en:e.en,desc:e.desc,enabled:Ne.get(e.key)!==!1,visible:e.mesh.visible})),setEnabled:(e,t)=>{Ne.has(e)&&(Ne.set(e,!!t),Pe())},solo:e=>{for(let t of Me)Ne.set(t.key,t.key===e);Pe()},showAll:()=>{for(let e of Me)Ne.set(e.key,!0);Pe()},hideAll:()=>{for(let e of Me)Ne.set(e.key,!1);Pe()},reset:()=>{for(let e of Me)Ne.set(e.key,!0);Pe()}};return x.parent.userData.arcaneLayers=Fe,a.push(Pe),Pe(),!0}function ne(e){let{THREE:t,kind:n,variant:r,cap:i,mesh:a,instanced:o,shader:s,output:c}=e,l=`${n}:${r}`,u=[`6:0`,`3:8`,`7:0`,`7:1`,`8:0`,`1:5`,`3:9`,`3:10`,`1:6`,null,`6:1`].indexOf(l);if(u<0)return!1;let d=Math.PI*2,f=[],p=(e,t=[0,0,0],n=[0,0,0,0],r=-1)=>{e.translate(...t),f.push({geometry:e,center:t,data:n,unit:r})};function m(e=f){let n=[],r=[],i=[],a=[],o=[],s=[];for(let t of e){let e=t.geometry.index?t.geometry.toNonIndexed():t.geometry,c=e.attributes.position,l=e.attributes.normal,u=e.attributes.uv;for(let e=0;e<c.count;e++)n.push(c.getX(e),c.getY(e),c.getZ(e)),r.push(l.getX(e),l.getY(e),l.getZ(e)),i.push(u?.getX(e)??0,u?.getY(e)??0),a.push(...t.center),o.push(...t.data),s.push(t.unit??-1);e!==t.geometry&&e.dispose(),t.geometry.dispose()}let c=new t.BufferGeometry;return c.setAttribute(`position`,new t.Float32BufferAttribute(n,3)),c.setAttribute(`normal`,new t.Float32BufferAttribute(r,3)),c.setAttribute(`uv`,new t.Float32BufferAttribute(i,2)),c.setAttribute(`aCenter`,new t.Float32BufferAttribute(a,3)),c.setAttribute(`aData`,new t.Float32BufferAttribute(o,4)),c.setAttribute(`aUnit`,new t.Float32BufferAttribute(s,1)),c}function h(e,n,r){return new t.OctahedronGeometry(1,0).scale(e,n,r)}function g(e,n,r,i,a,o,s=32,c=!1){let l=[],u=[],d=(e,t,n)=>c?[n,Math.cos(t)*e*a,Math.sin(t)*e]:[Math.cos(t)*e,n,Math.sin(t)*e],f=(e,t,n,r,i,a)=>{l.push(...e,...t,...n),u.push(...r,...i,...a)};for(let t=0;t<s;t++){let a=t/s,c=(t+1)/s,l=r+(i-r)*a,u=r+(i-r)*c,p=d(e,l,-o/2),m=d(n,l,-o/2),h=d(n,l,o/2),g=d(e,l,o/2),_=d(e,u,-o/2),v=d(n,u,-o/2),y=d(n,u,o/2),b=d(e,u,o/2);for(let[e,t,n,r]of[[p,_,v,m],[m,v,y,h],[h,y,b,g],[g,b,_,p]])f(e,t,n,[a,0],[c,0],[c,1]),f(e,n,r,[a,0],[c,1],[a,1]);t===0&&(f(p,m,h,[a,0],[a,1],[a,1]),f(p,h,g,[a,0],[a,1],[a,0])),t===s-1&&(f(_,y,v,[c,0],[c,1],[c,1]),f(_,b,y,[c,0],[c,0],[c,1]))}let p=new t.BufferGeometry;return p.setAttribute(`position`,new t.Float32BufferAttribute(l,3)),p.setAttribute(`uv`,new t.Float32BufferAttribute(u,2)),p.computeVertexNormals(),p}function _(e,n,r=.025,i=5){let a=new t.Vector3(...e),o=new t.Vector3(...n),s=o.clone().sub(a),c=new t.CylinderGeometry(r,r,s.length(),i,1,!1);return c.applyQuaternion(new t.Quaternion().setFromUnitVectors(new t.Vector3(0,1,0),s.normalize())),c.translate(...a.add(o).multiplyScalar(.5).toArray()),c}let v=`
    uniform float uTime,uLifeStart,uLifeEnd,uLifeOrigin,uStopTime,uEndDuration,uStretch,uQuantity,uSpread;
    float sat(float a){return clamp(a,0.0,1.0);}
    float ease(float a){a=sat(a);return 1.0-pow(1.0-a,3.0);}
    float fadeEnd(){return 1.0-smoothstep(.58,1.0,uLifeEnd);}
    float grow(){return smoothstep(0.0,1.0,uLifeStart);}
    mat2 turn(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
    float rand(float n){return fract(sin(n*127.1+311.7)*43758.5453);}
  `;function y(e,t=``,n=!1){let r=`${v}
      attribute vec3 aCenter;attribute vec4 aData;attribute float aUnit;
      varying vec2 vUv;varying vec3 vN,vP;varying float vAlpha,vTone,vPart;
      void main(){
        vec3 p=position,c=aCenter,q=p-c;vec3 n=normal;
        vUv=uv;vAlpha=1.0;vTone=aData.w;vPart=aData.x;
        ${e}
        vP=p;vN=normalize(normalMatrix*n);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
      }`,i=`${v}
      uniform float uSize;uniform vec3 uColor;varying vec2 vUv;varying vec3 vN,vP;varying float vAlpha,vTone,vPart;
      void main(){
        float light=dot(normalize(vN),normalize(mat3(viewMatrix)*vec3(-.4,.8,.55)))*.5+.5;
        float shade=mix(.28,.82,smoothstep(.38,.41,light));shade=mix(shade,1.16,smoothstep(.7,.73,light));
        vec3 color=mix(uColor*shade,mix(uColor,vec3(1.0),.7),clamp(vTone,0.0,1.0));
        if(vTone<0.0)color=mix(uColor*.13,vec3(.10,.12,.14),.65)*(.65+shade*.4);
        float alpha=vAlpha;
        ${t}
        if(alpha<.003)discard;
        gl_FragColor=vec4(color,clamp(alpha,0.0,1.0));${c}
      }`,a=s(i,r,{},n);return a.userData.ownLifecycle=!0,a}function b(e,t=``,n=`utility-body`,r=f,i=!1){let o=a(m(r),y(e,t,i),1);return o.name=n,o}if(u===10){let n=`
      const float REND_RELEASE=1.0; const float REND_EXIT=1.2;
      uniform float uTime,uQuantity,uSpread,uPanelCount;
      float rh(float n){return fract(sin(n*127.1+${(e.spec.seed%997/997*73).toFixed(8)})*43758.5453);}
      float rl(float i){return 1.35+rh(i+71.0)*2.05;}
      float rw(float i){return .036+rh(i+89.0)*.024;}
      // Seeded per-cut height and apex skew: narrow needles, broad wedges and
      // oblique triangles, independently scattered without animated jitter.
      vec2 rendPanel(float i,float x,float side){
        float taper=(1.0-x)*.5;
        float height=(rw(i)*18.0+.18)*mix(.117,.5,rh(i+151.0));
        float skew=mix(-.65,1.65,rh(i+173.0));
        return vec2(x+side*taper*skew,side*taper*height);
      }
      float rb(float i){return .2+.36*i/max(1.0,uQuantity-1.0);}
      mat3 rf(float i){
        float a=i<.5?.38:rh(i+109.0)*6.283185;
        float tilt=i<.5?.12:(rh(i+93.0)-.5)*2.4,twist=(rh(i+19.0)-.5)*2.6;
        vec3 d=normalize(vec3(cos(a),sin(a),tilt)),s=normalize(cross(vec3(0.0,0.0,1.0),d)),n=cross(d,s);
        s=s*cos(twist)+n*sin(twist);return mat3(d,s,cross(d,s));
      }
      vec3 rc(float i){
        vec3 c=vec3(rh(i+11.0)-.5,0.0,rh(i+57.0)-.5)*vec3(3.6,0.0,2.8)*uSpread;
        if(i<.5)c.xz=vec2(0.0);
        // The local origin is the ground anchor. Each cut's lower end stays
        // close to it, including when the caller changes size or spread.
        c.y=abs(rf(i)[0].y)*rl(i)*uSize+(i<.5?.04*uSize:.10*uSize+rh(i+31.0)*.45*uSpread);
        return c;
      }
      // Separate seeded positions: panels no longer share a blade's anchor.
      vec3 rendPanelCenter(float i){
        vec3 c=vec3((rh(i+211.0)-.5)*3.6,0.0,(rh(i+239.0)-.5)*2.8)*uSpread;
        c.y=abs(rf(i)[0].y)*rl(i)*uSize+(.03+rh(i+263.0)*.42)*uSize;
        return c;
      }
      // Independent, lifetime-stable triangle proportions for each debris seed.
      float rendShardScale(vec4 seed){
        return seed.w<.58?mix(.9,1.2,seed.z):mix(.2,.4,seed.z);
      }
      vec3 rendShardShape(vec4 seed){
        float lengthScale=mix(.65,2.4,rh(seed.x*997.0+307.0));
        float widthScale=mix(.2,1.4,rh(seed.y*997.0+331.0));
        float apex=mix(-1.4,1.4,rh(seed.z*997.0+359.0))*.577350269*lengthScale;
        return vec3(lengthScale,widthScale,apex);
      }
      // Positive top width gives a convex trapezoid; zero merges the top
      // corners into the original triangular apex. Seed choice never changes.
      vec3 rendShardVertex(vec2 corner,vec3 shape,vec4 seed){
        float top=step(0.0,corner.y);
        float topWidth=seed.x<.5?0.0:mix(.35,1.1,rh(seed.w*997.0+383.0));
        return vec3(corner.x*shape.x*mix(1.0,topWidth,top)+top*shape.z,corner.y*shape.y,0.0);
      }
      float rendShardRadius(vec3 shape,vec4 seed){
        float h=.577350269;
        return max(max(length(rendShardVertex(vec2(-h,-h),shape,seed)),length(rendShardVertex(vec2(h,-h),shape,seed))),
          max(length(rendShardVertex(vec2(h,h),shape,seed)),length(rendShardVertex(vec2(-h,h),shape,seed))));
      }
      vec3 rendCenter(){
        vec3 center=vec3(0.0);
        // Keep the index uniform-driven like the cuts. Some drivers fold sin()
        // differently for literal loop indices, which changes the seeded hash.
        for(int j=0;j<32;j++){float index=uQuantity-1.0-float(j);if(index<0.0)break;center+=rc(index);}
        return center/max(1.0,uQuantity);
      }
    `;function r(n,r,i={}){let a=new t.MeshPhysicalMaterial({transmission:1,roughness:0,metalness:0,transparent:!0,depthWrite:!1,side:t.FrontSide});return a.uniforms={...e.uniforms,...e.lifeUniforms},a.defines={...a.defines,...i},a.vertexShader=`uniform float uSize;
`+r,a.fragmentShader=`uniform float uDetail;
`+n,a.onBeforeCompile=e=>{Object.assign(e.uniforms,a.uniforms),e.vertexShader=a.vertexShader,e.fragmentShader=a.fragmentShader,a.userData.transmissionUniforms=e.uniforms},a.customProgramCacheKey=()=>a.vertexShader+`
`+a.fragmentShader,a.userData.ownLifecycle=!0,e.materials.add(a),a}let l=`
      uniform sampler2D transmissionSamplerMap;uniform vec2 transmissionSamplerSize;
      varying vec4 vScreen;varying vec2 vShift;
      vec4 displacedScene(float strength){
        vec2 uv=vScreen.xy/vScreen.w*.5+.5;
        vec2 resolution=max(transmissionSamplerSize,vec2(1.0));
        vec2 direction=vShift*resolution;
        direction=length(direction)>.0001?normalize(direction):vec2(1.0,0.0);
        // A bounded screen-space shift fades near viewport edges instead of
        // clamping a whole strip to one pixel. No wrapping or feedback sampling.
        vec2 inset=.5/resolution;
        float edge=max(0.0,min(min(uv.x-inset.x,1.0-inset.x-uv.x),min(uv.y-inset.y,1.0-inset.y-uv.y)));
        float amount=.032*clamp(uDetail,.25,2.0)*strength;
        // Larger offsets need a wider viewport guard; stay inside the sampled
        // scene instead of stretching the last row/column across a shard.
        amount*=smoothstep(0.0,max(.08,abs(amount)*1.25),edge);
        vec2 delta=direction*min(resolution.x,resolution.y)/resolution*amount;
        return texture2D(transmissionSamplerMap,clamp(uv+delta,inset,1.0-inset));
      }
    `,u=`${n}
      attribute float aUnit;attribute vec4 aData;varying float vEcho;varying float vBand,vTaper,vAlong,vAlpha,vAge,vExit;varying vec2 vUv;varying vec4 vScreen;varying vec2 vShift;
      void main(){
        float i=aUnit,localTime=uTime;vEcho=0.0;
        #if REND_GLOW == 1
          vEcho=aData.x;localTime-=vEcho*.12;
          // Hold the closing pose while the single trace fades independently.
          if(vEcho>.5)localTime=min(localTime,REND_RELEASE+.10);
        #endif
        float age=localTime-rb(i),sweep=smoothstep(0.0,.06,age),exitProgress=smoothstep(REND_RELEASE,REND_EXIT,localTime);
        float activeCount=uQuantity;
        #if REND_GLOW == 0
          activeCount=uPanelCount;age=uTime-(.2+.36*i/max(1.0,uPanelCount-1.0));sweep=smoothstep(0.0,.06,age);
        #endif
        float alive=step(i+.5,activeCount)*step(0.0,age)*(1.0-step(REND_EXIT,localTime));
        vUv=uv;vBand=position.y;vAlong=(position.x+1.0)*.5;vAge=age;vExit=exitProgress;vAlpha=alive;
        vec3 q=position;
        #if REND_GLOW == 1
          float guide=step(i+.5,uQuantity)*step(i,2.0)*smoothstep(.01,.10,uTime)*(1.0-smoothstep(.14,.2,uTime));
          guide*=1.0-step(.5,vEcho);
          vAlpha=max(alive,guide*.24);
          if(vEcho>.5){vAlpha*=smoothstep(.98,1.03,uTime)*.65;vExit=smoothstep(1.15,1.9,uTime);}
          if(age<0.0)sweep=1.0;
        #endif
        q.x=mix(-1.0,sweep*2.0-1.0,vAlong);
        float taper=pow(max(0.0,1.0-q.x*q.x),.7);
        // The light keeps its needle profile. The distortion window has three
        // straight edges and an independently scattered position.
        float spatialTaper=(1.0-q.x)*.5;
        vBand=position.y*taper;vTaper=taper;
        #if REND_GLOW == 0
          vBand=(position.y+1.0)*spatialTaper;
        #endif
        mat3 frame=rf(i);
        float anchor=frame[0].y>=0.0?-1.0:1.0;
        #if REND_GLOW == 0
          q.xy=rendPanel(i,q.x,position.y+1.0);
        #endif
        q.x=(anchor+(q.x-anchor)*(1.0+.8*exitProgress))*rl(i);
        #if REND_GLOW == 1
          q.yz*=rw(i)*5.5*.375*taper;if(vEcho>.5)q.yz*=1.5;if(age<0.0)q.yz*=.10;
        #else
          q.z*=.008*spatialTaper;q*=2.0;
        #endif
        #if REND_GLOW == 1
          // Only the soft halo faces the camera; its axis and depth follow the 3D cut.
          vec4 mv=modelViewMatrix*vec4(rc(i)+(frame[0]*q.x)*uSize,1.0);
          vec3 direction=mat3(modelViewMatrix)*frame[0];vec2 across=normalize(vec2(-direction.y,direction.x)+vec2(.00001,0.0));
          mv.xy+=across*q.y*uSize*length(modelViewMatrix[1].xyz);gl_Position=projectionMatrix*mv;
        #else
          gl_Position=projectionMatrix*modelViewMatrix*vec4(rendPanelCenter(i)+rf(i)*q*uSize,1.0);
        #endif
        vScreen=gl_Position;vShift=(projectionMatrix*vec4(mat3(modelViewMatrix)*frame[0],0.0)).xy;
      }`;for(let e=0;e<32;e++)p(new t.BoxGeometry(2,2,2,16,1,1),[0,0,0],[0,0,0,0],e);let d=r(`${l}
      varying float vAlpha,vAge,vExit;
      void main(){
        if(vAlpha<.003)discard;
        float reveal=smoothstep(0.0,.04,vAge),fade=1.0-vExit;
        vec4 background=displacedScene(2.0*reveal*fade);
        float alpha=vAlpha*fade*fade;
        if(alpha<.003)discard;
        // This pass only displaces the opaque background. All blade light is
        // supplied by the existing additive glow mesh in the transmission input.
        gl_FragColor=vec4(background.rgb,alpha*background.a);${c}
      }`,u,{REND_GLOW:0});a(m(),d,0).name=`utility-rend-cuts`;let f=[];for(let e=0;e<2;e++)for(let n=0;n<32;n++)f.push({geometry:new t.PlaneGeometry(2,2,e?8:16,1),center:[0,0,0],data:[e,0,0,0],unit:n});let h=s(`uniform vec3 uColor;varying float vEcho,vBand,vTaper,vAlpha,vAge,vExit;
      void main(){if(vAlpha<.003)discard;float radial=abs(vBand)/max(.00001,vTaper)*5.5;
        float halo=(exp(-pow((radial-1.02)*1.3,2.0))*.60+exp(-pow((radial-1.0)*.53,2.0))*.16)*smoothstep(.73,1.10,radial);
        // The blade and halo are captured together for spatial sampling.
        // Opaque foreground geometry still depth-occludes the light.
        float distanceToBlade=abs(vBand)-(.65/5.5)*max(vTaper,0.0);
        float aa=clamp(fwidth(distanceToBlade),.0001,.5/5.5);
        float blade=(1.0-smoothstep(-aa,aa,distanceToBlade))*step(.001,vTaper);
        float alpha=max(halo*(.55+.45*uDetail),blade)*vAlpha*pow(1.0-vExit,vEcho>.5?1.0:2.0);
        vec3 color=mix(uColor,mix(uColor,vec3(1.0),vEcho>.5?.55:.88)*1.35,blade);
        if(alpha<.003)discard;gl_FragColor=vec4(color,alpha);${c}
      }`,u,{},!0,{REND_GLOW:1});h.userData.ownLifecycle=!0,h.transparent=!1,a(m(f),h,1).name=`utility-rend-glow`;let g=r(`${l}
      uniform vec3 uColor;varying float vAlpha,vTone;
      void main(){
        if(vAlpha<.003)discard;
        vec4 background=displacedScene(5.0*(.65+.65*vTone)*vAlpha);
        // Only the shifted background is visible: no tint, surface lighting or
        // unshifted image blended into the slice. Alpha is for lifetime fade only.
        gl_FragColor=vec4(background.rgb,vAlpha*background.a);${c}
      }`,`${n}
      attribute vec4 seed;varying float vAlpha,vTone;varying vec4 vScreen;varying vec2 vShift;
      void main(){
        float i=floor(seed.x*uQuantity),impulseAge=max(0.0,uTime-REND_RELEASE),kick=1.0-exp(-5.0*impulseAge);
        vTone=seed.w;vAlpha=smoothstep(0.0,.045,impulseAge)*(1.0-smoothstep(2.2+seed.z*.15,3.4,uTime));
        float shardScale=rendShardScale(seed);
        vec3 shape=rendShardShape(seed);
        vec3 q=rendShardVertex(position.xy,shape,seed)*shardScale;
        float growth=1.0+.65*smoothstep(0.0,.10,impulseAge);q*=growth;
        float a=seed.y*6.283185+(seed.x<.5?-1.0:1.0)*(.7+.5*seed.z)*kick;
        q.xy=mat2(cos(a),-sin(a),sin(a),cos(a))*q.xy;
        mat3 frame=rf(i);
        vec3 p=rc(i)+frame*vec3((seed.y*2.0-1.0)*rl(i),(seed.z-.5)*.15,(seed.w-.5)*.15)*uSize;
        // Reserve the full rotating shard radius at birth. No moving floor clamp,
        // gravity or downward drift: shards hang in space as their impulse slows.
        float radius=rendShardRadius(shape,seed)*shardScale*1.65;
        p.y=max(p.y,(.02+radius)*uSize);
        vec3 direction=p-rendCenter();direction.y=max(0.0,direction.y);
        if(length(direction)<.01*uSize)direction=vec3(cos(seed.x*6.283185),0.0,sin(seed.x*6.283185));
        p+=normalize(direction)*2.2*uSize*kick;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p+frame*q*uSize,1.0);
        vScreen=gl_Position;vShift=(projectionMatrix*vec4(mat3(modelViewMatrix)*frame[0],0.0)).xy*(seed.w<.5?-1.0:1.0);
      }`),_=new t.BufferGeometry,v=1/Math.sqrt(3),y=[-v,-v,0],b=[v,-v,0],x=[v,v,0],S=[-v,v,0];_.setAttribute(`position`,new t.Float32BufferAttribute([...y,...b,...x,...y,...x,...S,...x,...b,...y,...S,...x,...y],3)),_.setAttribute(`uv`,new t.Float32BufferAttribute([0,0,1,0,1,1,0,0,1,1,0,1,1,1,1,0,0,0,0,1,1,1,0,0],2)),_.computeVertexNormals();let C=o(_,Math.min(i,128),1,g,1);C.name=`utility-rend-particles`;let w=e.group.getObjectByName(`utility-rend-cuts`),T=e.group.getObjectByName(`utility-rend-glow`);e.animated.push(()=>{w.visible=e.uniforms.uPanelCount.value>0&&e.uniforms.uTime.value>=.2&&e.uniforms.uTime.value<1.2,T.visible=e.uniforms.uTime.value>0&&e.uniforms.uTime.value<1.9,C.visible=e.uniforms.uTime.value>1&&e.uniforms.uTime.value<3.4});let E=s(`
      uniform vec3 uColor;
      varying vec2 vLocal;varying float vAlpha;
      void main(){
        if(vAlpha<.003)discard;
        float diamond=abs(vLocal.x)+abs(vLocal.y)*1.15;
        float core=1.0-smoothstep(.03,.28,diamond);
        float halo=pow(max(0.0,1.0-diamond),2.0);
        float alpha=vAlpha*(core*.75+halo*.65)*(.75+.25*uDetail);
        vec3 color=mix(uColor,vec3(1.0),core*.86);
        if(alpha<.003)discard;gl_FragColor=vec4(color,clamp(alpha,0.0,1.0));${c}
      }`,`
      ${n}
      varying vec2 vLocal;varying float vAlpha;
      void main(){
        vLocal=position.xy;
        vAlpha=smoothstep(REND_RELEASE,REND_RELEASE+.025,uTime)*(1.0-smoothstep(REND_RELEASE+.08,REND_RELEASE+.18,uTime));
        vec4 mv=modelViewMatrix*vec4(rendCenter(),1.0);
        mv.xy+=position.xy*.8*uSize*length(modelViewMatrix[1].xyz);
        gl_Position=projectionMatrix*mv;
      }`,{},!0);return E.userData.ownLifecycle=!0,a(new t.PlaneGeometry(2,2),E,1).name=`utility-rend-impact`,!0}if(u===0){for(let e=0;e<9;e++){let t=-1.15+e*2.3/9,n=-1.15+(e+1)*2.3/9,r=(t+n)/2,i=[Math.cos(r)*1.7,.1,Math.sin(r)*1.7];for(let[a,o,s,c]of[[1.35,2.02,.13,.16],[1.95,2.07,.09,.88]]){let l=g(a,o,t,n,1,s,5).translate(0,.1,0);f.push({geometry:l,center:i,data:[e/8,r,0,c]})}if(e<7){let i=g(1.1,1.19,t,n,1,.055,4).translate(0,.25,0);f.push({geometry:i,center:[Math.cos(r)*1.15,.25,Math.sin(r)*1.15],data:[e/8,r,1,.55]})}}b(`
      float t=uTime/.65,sw=ease(t/.62),angle=-1.10+sw*1.82;
      float release=.27+aData.x*.17,peel=ease((uTime-release)/.16);
      p=c+q*(1.0-peel*.68);p.xz+=vec2(cos(aData.y),sin(aData.y))*peel*.32;
      p.y-=peel*peel*.34;p.y+=sin((aData.x+vUv.x/9.0)*3.14159)*.12;
      p.xz=turn(angle-peel*.13)*p.xz;n.xz=turn(angle-peel*.13)*n.xz;p*=uSize;
      float along=(aData.x*8.0+vUv.x)/9.0;
      vAlpha=smoothstep(-.04,.04,sw-along*.72)*smoothstep(0.0,.055,t)*(1.0-smoothstep(release+.09,release+.20,uTime));
    `,`color+=uColor*.055*pow(.5+.5*sin((vPart+vUv.x/9.0)*(16.0+uDetail*26.0)),10.0);`)}else if(u===1){for(let e=0;e<13;e++){let n=-2.25+e*.36,r=Math.sin(e*2.2)*.19+Math.sin(e*.79)*.14,i=[n+.37,.016,Math.sin((e+1)*2.2)*.19+Math.sin((e+1)*.79)*.14];p(_([n,.016,r],i,.038+e%3*.007,4),[0,0,0],[e/12,0,0,.8]);for(let i=-1;i<=1;i+=2){let a=e*2+ +(i===1),o=Math.sin(a*7.3)*.11,s=new t.DodecahedronGeometry(1,0).scale(.15+a%4*.045,.12+a%3*.055,.18+a%5*.035);if(s.rotateZ(o*2.3),s.rotateY(a*1.71),s.rotateX(o*1.5),p(s,[n+o,.09,r+i*(.22+a%3*.095)],[e/12,i,1,-1],e),(e+i)%3!=0){let t=[.1+o,.026,i*(.3+a%4*.12)];p(_([0,0,0],t,.018,4),[n,.033,r],[e/12,i,2,.65]),e%2==0&&p(_(t,[t[0]+.14,t[1],t[2]+i*.1],.012,4),[n,.033,r],[e/12,i,2,.55])}}}for(let e=13;e<26;e++)for(let n=-1;n<=1;n+=2){let r=-2.25+e*.36,i=Math.sin(e*2.2)*.19+Math.sin(e*.79)*.14,a=e*2+ +(n===1),o=Math.sin(a*7.3)*.11,s=new t.DodecahedronGeometry(1,0).scale(.15+a%4*.045,.12+a%3*.055,.18+a%5*.035);s.rotateZ(o*2.3),s.rotateY(a*1.71),s.rotateX(o*1.5),p(s,[r+o,.09,i+n*(.22+a%3*.095)],[e/12,n,1,-1],e)}b(`
      float path=aData.x;
      if(aUnit>=0.0&&uQuantity!=13.0)path=aUnit/max(1.0,uQuantity-1.0);
      float arrival=.1+path*.62,age=uTime-arrival;
      float hit=ease(age/.11),settle=smoothstep(.12,.75,age);
      if(aData.z>.5&&aData.z<1.5){q.xz=turn(aData.y*hit*(1.0-settle)*.27)*q.xz;p=c+q;
        p.y+=sin(sat(age/.72)*3.14159)*(.36+rand(path)*.2);p.z+=aData.y*hit*(1.0-settle)*.15;
        if(uQuantity!=13.0){float index=path*12.0;
          p.x+=(index-aUnit)*.36;
          p.z+=sin(index*2.2)*.19+sin(index*.79)*.14-sin(aUnit*2.2)*.19-sin(aUnit*.79)*.14;}
      }
      p.z*=uSize;p.y*=uSize;
      vAlpha=smoothstep(-.02,.055,age)*(1.0-smoothstep(1.28,1.8,uTime));
      if(aUnit>=0.0)vAlpha*=step(aUnit+.5,uQuantity);
    `,`if(vTone>=0.0){color=mix(uColor,vec3(1.0,.89,.4),.45+.35*sin(vP.x*(5.0+3.0*uDetail)-uTime*9.0));alpha*=.8+.2*sin(vP.x*13.0+uTime*3.0);}`)}else if(u===2||u===3){let e=u===2?7:4;for(let n=0;n<e;n++){let r=(n-1)*d/6,i=n===0?0:.98,a=Math.sqrt(1.18*1.18-i*i),o=new t.Vector3(a,Math.cos(r)*i,Math.sin(r)*i).normalize(),s=[a-.28,.9+Math.cos(r)*i,Math.sin(r)*i],c=new t.Quaternion().setFromUnitVectors(new t.Vector3(0,1,0),o),l=new t.CylinderGeometry(.51,.51,.17,6,1,!1);l.applyQuaternion(c),p(l,s,[n/(e-1),r,0,.08],n);let u=new t.CylinderGeometry(.425,.425,.026,6,1,!1);u.applyQuaternion(c),p(u,[s[0]+o.x*.1,s[1]+o.y*.1,s[2]+o.z*.1],[n/(e-1),r,1,.42],n)}if(u===3)for(let e=0;e<9;e++){let t=e*d/9,n=[.8,.9+Math.cos(t)*.25,Math.sin(t)*.25],r=h(.07,.22,.07);r.rotateX(t),p(r,n,[e/9,t,2,.9])}u===3&&(p(_([1.01,.54,0],[1.01,1.26,0],.014,4),[0,0,0],[0,0,3,1]),p(_([1.01,.83,-.31],[1.01,.97,.31],.012,4),[0,0,0],[0,0,3,1])),b(u===2?`
      float start=smoothstep(aData.x*.38,aData.x*.38+.60,uLifeStart);
      float close=smoothstep(aData.x*.16,.83+aData.x*.16,uLifeEnd);
      float visible=start*(1.0-close);
      p=c+q*(.78+.22*visible);p.x+=(1.0-start)*.45+close*.32;
      p.y+=(1.0-start)*cos(aData.y)*.17;p.z+=(1.0-start)*sin(aData.y)*.17;
      p*=uSize;vAlpha=visible*fadeEnd()*step(aUnit+.5,uQuantity);
    `:`
      float t=uTime/.55,pressure=sin(sat(t/.34)*3.14159);
      float rebound=sin(sat((t-.34)/.27)*3.14159);
      float strength=aData.x<.01?.54:.16*(1.0-aData.x*.45);
      p.x-=pressure*strength;p.x+=rebound*strength*.27;
      if(aData.z<1.5){p.y+=(c.y-.9)*pressure*.10;p.z+=c.z*pressure*.10;}
      if(aData.z>1.5&&aData.z<2.5){float spread=ease((t-.25)/.65);p=c+q*(1.0-spread*.6);p.y+=cos(aData.y)*spread*1.0;p.z+=sin(aData.y)*spread*1.0;p.x+=spread*.35;}
      p*=uSize;vAlpha=smoothstep(0.0,.06,t)*(1.0-smoothstep(.52,1.0,t));
      if(aData.z>2.5)vAlpha*=1.0-smoothstep(.08,.22,t);
      if(aUnit>=0.0)vAlpha*=step(aUnit+.5,uQuantity);
    `,u===2?`float line=pow(.5+.5*sin((vP.y+vP.z*.6)*(10.0+uDetail*8.0)),24.0);color+=uColor*line*.10;`:`color=mix(color,vec3(1.0),.48*(1.0-smoothstep(0.0,.23,uTime)));color+=uColor*.08*pow(.5+.5*sin(vP.y*(10.0+uDetail*12.0)+vP.z*11.0),12.0);`)}else if(u===4){for(let e=0;e<16;e++){let t=e*d/16,n=(e+.8)*d/16;p(g(.92,1.08,t,n,1.35,.18,3,!0),[0,1.45,0],[e/16,t,0,.18]),p(g(.975,1.01,t+.025,n-.025,1.35,.025,3,!0),[.107,1.45,0],[e/16,t,1,.92])}b(`
      float s=smoothstep(aData.x*.3,aData.x*.3+.64,uLifeStart);
      float e=smoothstep(aData.x*.15,.82+aData.x*.15,uLifeEnd);
      float fold=(1.0-s)*.17+e*.15;p.y-=1.45;p.yz*=1.0+fold;p.y+=1.45;
      p.x+=(1.0-s)*sin(aData.y*2.0)*.28;p*=uSize;
      vAlpha=s*(1.0-e)*fadeEnd();
    `,`color+=uColor*.10*sin(vPart*25.13-uTime*1.4);`,`utility-gate-frame`);let e=new t.CircleGeometry(.94,48);e.rotateY(Math.PI/2),e.scale(1,1.35,1),b(`
      float s=grow(),close=1.0-smoothstep(0.0,.82,uLifeEnd);
      p.y-=1.45;p.z*=max(.012,s*close);p.y*=.7+.3*s*close;p.y+=1.45;p*=uSize;
      vAlpha=s*close*fadeEnd();
    `,`
      vec2 q=(vUv-.5)*2.0;float r=length(q);float a=atan(q.y,q.x);
      float swirl=.5+.5*sin(r*(10.0+uDetail*5.0)-a*3.0-uTime*3.25);
      vec2 starUv=(q+vec2(sin(uTime*.08)*.1,uTime*.009))*(12.0+uDetail*2.0);
      vec2 grid=floor(starUv);
      vec2 cell=fract(starUv)-.5;
      float cross=max(pow(max(0.0,1.0-abs(cell.x)*13.0),3.0)*max(0.0,1.0-abs(cell.y)*3.2),pow(max(0.0,1.0-abs(cell.y)*13.0),3.0)*max(0.0,1.0-abs(cell.x)*3.2));
      float star=step(.963,rand(dot(grid,vec2(1.0,71.0))))*cross*(.72+.28*sin(uTime+grid.x));
      color=mix(uColor*.035,uColor*.23,swirl*.17+smoothstep(.55,1.0,r)*.55);
      color+=mix(uColor,vec3(1.0),.8)*star*2.0;alpha*=.50*(1.0-smoothstep(.96,1.0,r));
    `,`utility-star-membrane`,[{geometry:e.translate(0,1.45,0),center:[0,1.45,0],data:[0,0,0,0]}])}else if(u===5||u===8){if(u===5){for(let e=0;e<3;e++){let n=new t.CylinderGeometry(.011,.011,4.8,5,36,!0);n.rotateZ(Math.PI/2),p(n,[0,0,0],[e/3,e*d/3,0,.25])}for(let e=0;e<18;e++){let n=e%3*d/3,r=new t.SphereGeometry(1,8,5);r.scale(.22,.15,.15),p(r,[0,0,0],[e/9,n,1,.68]);let i=new t.ConeGeometry(.12,.44,5,1,!0);i.rotateZ(-Math.PI/2),i.translate(.24,0,0),p(i,[0,0,0],[e/9,n,2,.16])}for(let e=0;e<2;e++)for(let t=0;t<5;t++)p(g(e===0?.27:.16,e===0?.31:.19,t*d/5,(t+.7)*d/5,1,.035,4,!0),[e===0?-2.4:2.4,0,0],[t/5,t*d/5,3+e,.5]);b(`
        float travel=.60,t=uTime/travel,a=aData.y;
        if(aData.z<.5){
          float f=(p.x+2.4)/4.8;float envelope=sin(f*3.14159);
          p.y+=sin(f*3.0+a)*.34*envelope;p.z+=cos(f*3.0+a)*.34*envelope;
          float front=smoothstep(-.04,.06,uTime/.35-(1.0-f));
          float stoppedFor=max(0.0,uTime-uStopTime);
          float drain=smoothstep(-.05,.08,1.0-f-stoppedFor/travel);
          float end=uStopTime<0.0?1.0:mix(1.0,drain,smoothstep(0.0,.08,stoppedFor));
          vAlpha=front*end*grow()*fadeEnd()*.28;
        }else if(aData.z>2.5){
          p=c+q*vec3(uSize/max(uStretch,.001),uSize,uSize);p.yz/=uSize;
          vAlpha=grow()*fadeEnd()*(1.0-smoothstep(.35,1.0,uLifeEnd))*.65;
        }else{
          float index=floor(aData.x*9.0+.5);
          float offset=uQuantity==9.0?aData.x:index/uQuantity;
          float cycle=t+offset,phase=fract(cycle),birth=(floor(cycle)-offset)*travel;
          float f=1.0-phase;float envelope=sin(phase*3.14159);
          float live=step(0.0,birth)*(uStopTime<0.0?1.0:1.0-step(uStopTime+.00001,birth));
          p.x=p.x*uSize/max(uStretch,.001)+(f-.5)*4.8;
          p.y+=sin(f*3.0+a)*.34*envelope;p.z+=cos(f*3.0+a)*.34*envelope;
          vAlpha=live*smoothstep(0.0,.08,phase)*(1.0-smoothstep(.82,1.0,phase))*fadeEnd()*step(index+.5,uQuantity);
        }
        p.yz*=uSize;
      `,`if(vTone>.5)color=mix(uColor*.7,vec3(.86,1.0,.93),.62)*(.92+.08*sin((vP.x*28.0+vP.y*19.0)*uDetail));`)}else{for(let e=0;e<16;e++){let n=(e/8+Math.sin(e*2.3)*.018+1)%1;p(new t.SphereGeometry(1,10,7),[0,0,0],[n,e*2.37,0,.14+e%3*.035])}for(let e=0;e<5;e++){let n=new t.SphereGeometry(1,7,5);n.scale(.09,.065,.065),p(n,[0,0,0],[e/5+.03,e*2.19,2,.26])}function e(){let e=[],n=[],r=[];for(let e=0;e<=8;e++){let t=e/8,n=[],i=.17*(1-t)**.72+.006,a=.065*(1-t)+.004;for(let e=0;e<6;e++){let r=e*d/6;n.push([t,Math.cos(r)*i,Math.sin(r)*a])}r.push(n)}let i=(t,r,i)=>{e.push(...t,...r,...i),n.push(t[0],t[1]+.5,r[0],r[1]+.5,i[0],i[1]+.5)};for(let e=0;e<8;e++)for(let t=0;t<6;t++){let n=(t+1)%6;i(r[e][t],r[e+1][t],r[e+1][n]),i(r[e][t],r[e+1][n],r[e][n])}for(let e=0;e<6;e++){let t=(e+1)%6;i([0,0,0],r[0][t],r[0][e]),i([1,0,0],r[8][e],r[8][t])}let a=new t.BufferGeometry;return a.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),a.setAttribute(`uv`,new t.Float32BufferAttribute(n,2)),a.computeVertexNormals(),a}let n=[-.4,.65,1.8,3.05,4.65];for(let r=0;r<5;r++){let i=(r*.213+.07)%1,a=n[r];p(e(),[0,0,0],[i,a,1,.24]);let o=new t.SphereGeometry(1,8,6);o.scale(.1+r%2*.025,.12+r%3*.018,.1+r%2*.025),p(o,[0,0,0],[i,a,3,.36])}b(`
        if(aData.z<.5){
          float index=floor(aData.y/2.37+.5);
          float offset=uQuantity==8.0?aData.x:fract(aData.x+index*(1.0/uQuantity-1.0/8.0));
          float travel=.25,cycle=uTime/travel+offset,phase=fract(cycle),birth=(floor(cycle)-offset)*travel;
          float live=step(0.0,birth)*(uStopTime<0.0?1.0:1.0-step(uStopTime+.00001,birth));
          float bulb=smoothstep(-1.0,.35,q.x),envelope=pow(max(0.0,sin(phase*3.14159)),.28);
          float radius=(.075+phase*.24)*(.87+.13*sin(aData.y))*envelope;
          float neck=.25+.75*bulb,irregular=1.0+.095*sin(q.x*5.0+aData.y+phase*3.0);
          float length=min(.43+.07*rand(aData.y),min(phase,1.0-phase)*4.55);
          p.x=-2.4+phase*4.8+q.x*length;
          p.y=q.y*radius*neck*irregular+sin(phase*5.0+aData.y)*.045*envelope;
          p.z=q.z*radius*neck*irregular+cos(phase*6.0+aData.y)*.035*envelope;
          vAlpha=live*smoothstep(0.0,.045,phase)*(1.0-smoothstep(.95,1.0,phase))*fadeEnd()*step(index+.5,uQuantity);
        }else if(aData.z>1.5&&aData.z<2.5){
          float travel=.25,cycle=uTime/travel+aData.x,phase=fract(cycle),birth=(floor(cycle)-aData.x)*travel;
          float live=step(0.0,birth)*(uStopTime<0.0?1.0:1.0-step(uStopTime+.00001,birth));
          p.x=-2.4+phase*4.8+q.x*min(1.0,phase*12.0)*min(1.0,(1.0-phase)*12.0);
          float radial=(.12+phase*.38)*sin(phase*3.14159);
          p.y=q.y+cos(aData.y)*radial-.10*phase*phase;p.z=q.z+sin(aData.y)*radial;
          vAlpha=live*smoothstep(.02,.10,phase)*(1.0-smoothstep(.84,1.0,phase))*fadeEnd();
        }else if(aData.z<1.5){
          float period=.38,cycle=(uTime-.25)/period+aData.x,phase=fract(cycle);
          float source=(floor(cycle)-aData.x)*period;
          float live=step(0.0,source)*(uStopTime<0.0?1.0:1.0-step(uStopTime+.00001,source));
          float h=q.x,extend=ease(phase/.40),retreat=smoothstep(.43,.82,phase);
          float reach=.59+.16*rand(aData.y),radial=.13+reach*h*extend;
          float width=1.0-retreat*.68;
          float bow=.13*sin(h*3.14159)-.23*h*h;
          p.x=2.30+(bow+q.z)*uSize/max(uStretch,.001);
          p.y=cos(aData.y)*radial-q.y*width*sin(aData.y);
          p.z=sin(aData.y)*radial+q.y*width*cos(aData.y);
          n=normalize(vec3(normal.z,normal.y*cos(aData.y)-normal.x*sin(aData.y),normal.y*sin(aData.y)+normal.x*cos(aData.y)));
          float rootRetreat=smoothstep(-.06,.06,h-retreat*1.16);
          vAlpha=live*smoothstep(0.0,.08,phase)*(1.0-smoothstep(.67,.83,phase))*rootRetreat*(1.0-smoothstep(.78,1.0,uLifeEnd));
        }else{
          // A drop is born at the tongue tip, then moves independently under gravity.
          float period=.38,cycle=(uTime-.36)/period+aData.x,phase=fract(cycle),age=phase*period;
          float source=(floor(cycle)-aData.x)*period;
          float live=step(0.0,source)*(uStopTime<0.0?1.0:1.0-step(uStopTime+.00001,source));
          float reach=.59+.16*rand(aData.y),radial=.13+reach+age*(.90+.20*rand(aData.y+1.0));
          p.x=2.07+(q.x+age*.22)*uSize/max(uStretch,.001);
          p.y=q.y+cos(aData.y)*radial+.20*age-6.0*age*age;
          p.z=q.z+sin(aData.y)*radial;
          vAlpha=live*smoothstep(0.0,.018,age)*(1.0-smoothstep(.20,.30,age))*(1.0-smoothstep(.94,1.0,uLifeEnd));
        }
        p.yz*=uSize;
      `,`
        float streak=.5+.5*sin(vP.x*(7.0+uDetail*5.0)+vP.y*8.0-uTime*8.0);
        color=mix(color,mix(uColor,vec3(.93,1.0,.35),.52),smoothstep(.67,.86,streak)*.26);
      `)}}else if(u===6){function e(){let e=[],n=[],r=[];for(let e=0;e<=9;e++){let t=e/9,n=.46*Math.sin(t*Math.PI)**.75+.012;r.push([[-n,t,-.045],[n,t,-.045],[-n,t,.045],[n,t,.045]])}let i=(t,r,i)=>{e.push(...t,...r,...i),n.push(t[0]+.5,t[1],r[0]+.5,r[1],i[0]+.5,i[1])};for(let e=0;e<9;e++){let t=r[e],n=r[e+1];for(let[e,r]of[[0,1],[1,3],[3,2],[2,0]])i(t[e],n[e],n[r]),i(t[e],n[r],t[r])}let a=new t.BufferGeometry;return a.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),a.setAttribute(`uv`,new t.Float32BufferAttribute(n,2)),a.computeVertexNormals(),a}for(let t=0;t<2;t++)for(let n=0;n<14;n++){let r=(n+t*.5)*d/7;p(e(),[0,0,0],[n/7,r,t,.21+t*.18],n*2+t)}for(let e=0;e<5;e++){let t=e*d/5;p(h(.06,.14,.06),[Math.cos(t)*.28,.1,Math.sin(t)*.28],[e/5,t,2,.75])}b(`
      float phase=aData.x,angle=aData.y;
      if(aUnit>=0.0&&uQuantity!=14.0){
        float ringCount=max(1.0,floor((uQuantity+1.0-aData.z)/2.0));
        float index=floor(aUnit/2.0);phase=index/ringCount;
        angle=(index+aData.z*.5)*6.28318530718/ringCount;
      }
      float t=uTime/2.2,gather=ease(t/.17),rise=ease((t-.12)/.46),open=ease((t-.26-phase*.035)/.38);
      float dissolve=smoothstep(.68,1.0,t);
      if(aData.z<1.5){
        float h=q.y,spread=.11+open*(.94-aData.z*.20),bend=.25*open;
        float radial=(1.0-gather)*.43+.10+h*spread+h*h*bend;
        float height=.05+rise*.29+h*(.11+rise*1.65)-h*h*.38*open;
        float dr=spread+2.0*h*bend,dy=.11+rise*1.65-h*.76*open;
        vec2 normalProfile=normalize(vec2(dy,-dr));
        radial+=q.z*normalProfile.x;height+=q.z*normalProfile.y;
        float widthScale=.34+rise*.66;
        if(uQuantity>14.0){
          float ringCount=max(1.0,floor((uQuantity+1.0-aData.z)/2.0));
          float halfGap=(radial-q.z*normalProfile.x)*tan(3.14159265359/ringCount)*.82;
          widthScale=min(widthScale*7.0/ringCount,halfGap/max(abs(q.x),.012));
        }
        p=vec3(cos(angle)*radial-q.x*widthScale*sin(angle),height+dissolve*.32,sin(angle)*radial+q.x*widthScale*cos(angle));
        n=normalize(vec3(cos(angle)*normalProfile.x,normalProfile.y,sin(angle)*normalProfile.x)*normal.z+vec3(-sin(angle),0.0,cos(angle))*normal.x+vec3(cos(angle)*dr,dy,sin(angle)*dr)*normal.y);
        vAlpha=smoothstep(0.0,.08,t)*(1.0-dissolve)*step(aUnit+.5,uQuantity);
      }else{p.y+=rise*2.05+dissolve*.2;p.xz*=1.0+rise*.25;vAlpha=smoothstep(.23,.39,t)*(1.0-smoothstep(.7,.98,t));}
      p*=uSize;
    `,`color=mix(color,vec3(1.0,.98,.69),smoothstep(.3,2.0,vP.y/uSize)*.32);float vein=pow(.5+.5*cos((vP.x+vP.z)*(10.0+uDetail*9.0)),18.0);color+=uColor*vein*.07;`)}else if(u===7){for(let e=0;e<18;e++){let n=e*2.39996,r=e===0?0:.55+e%3*.8/2,i=[Math.cos(n)*r,0,Math.sin(n)*r],a=h(.13,.64,.13);a.translate(0,.64,0),p(a,i,[e/9,n,0,.27]);for(let t=0;t<3;t++){let r=h(.075,.15,.075);r.rotateZ((t-1)*.8),p(r,i,[e/9,n+t*d/3,1,.67])}p(new t.CylinderGeometry(.25,.31,.045,6,1,!1),[i[0],.025,i[2]],[e/9,n,2,.12])}b(`
      float index=floor(aData.x*9.0+.5);
      float offset=uQuantity==9.0?aData.x:index/uQuantity;
      float impact=.43+offset*1.05,age=uTime-impact;
      if(aData.z<.5){float fall=sat((age+.34)/.34);float y=(1.0-fall*fall)*2.55;
        p=c+q*uSize;p.y+=y;
        vAlpha=smoothstep(-.37,-.30,age)*(1.0-smoothstep(.015,.12,age));
      }else if(aData.z<1.5){float a=sat(age/.48);p=c+q*uSize*(1.0-a*.55);
        p.x+=cos(aData.y)*a*.43*uSize;p.z+=sin(aData.y)*a*.43*uSize;p.y+=sin(a*3.14159)*.40*uSize;
        vAlpha=smoothstep(0.0,.025,age)*(1.0-smoothstep(.20,.48,age));
      }else{p=c+q*uSize;float a=ease(age/.15);p.xz=c.xz+(p.xz-c.xz)*a;vAlpha=smoothstep(0.0,.04,age)*(1.0-smoothstep(.35,.85,age));}
      p.xz+=(uSpread-1.0)*c.xz;
      vAlpha*=(1.0-smoothstep(2.12,2.4,uTime))*step(index+.5,uQuantity);
    `,`color=mix(color,vec3(.86,.97,1.0),.19);color+=uColor*.08*pow(.5+.5*sin(vP.y*(12.0+uDetail*13.0)+vP.x*19.0),16.0);`)}let x=`${v}
    attribute vec4 seed;varying vec3 vN;varying float vAlpha,vTone;
    void main(){
      vec3 p=vec3(0.0);float size=.009+seed.w*.016;float a=seed.x*6.283185;
      float t=uTime,age=0.0;vAlpha=1.0;vTone=seed.w;
      #if UTILITY == 0
        float f=sat(t/.65);float spread=ease(f/.7);float angle=-1.7+seed.x*2.7+spread*.9;
        p=vec3(cos(angle)*(1.15+seed.z*1.2),.1+(seed.y-.5)*.5,sin(angle)*(1.15+seed.z*1.2));
        p*=uSize;vAlpha=smoothstep(.02,.13,f)*(1.0-smoothstep(.25+seed.y*.3,1.0,f));size*=1.0-f*.6;
      #elif UTILITY == 1
        float x=-2.2+seed.x*4.4;age=t-(.1+seed.x*.62);
        p=vec3(x,.05+max(0.0,age)*(1.3+seed.y)-max(0.0,age)*max(0.0,age)*2.2,sin(seed.x*27.0)*.20+(seed.z-.5)*age*.8);
        p.yz*=uSize;vAlpha=smoothstep(0.0,.08,age)*(1.0-smoothstep(.3,.85,age))*(1.0-smoothstep(1.5,1.8,t));
      #elif UTILITY == 2 || UTILITY == 4
        float f=fract(seed.y+t*.30);float radial=1.1+seed.z*.28;
        #if UTILITY == 2
          p=vec3(.7+seed.z*.1,.9+cos(a)*radial,sin(a)*radial);
        #elif UTILITY == 4
          p=vec3((seed.z-.5)*.25,1.45+cos(a)*1.4,sin(a)*1.04);
        #endif
        p*=uSize;vAlpha=sin(f*3.14159)*grow()*fadeEnd()*(1.0-uLifeEnd)*.7;
      #elif UTILITY == 3
        float f=sat(t/.55);float r=.15+ease(f)*(.45+seed.y*.9);
        p=vec3(.6+f*seed.z,.9+cos(a)*r,sin(a)*r);p*=uSize;
        vAlpha=smoothstep(0.0,.07,f)*(1.0-smoothstep(.25+seed.z*.25,1.0,f));
      #elif UTILITY == 5 || UTILITY == 8
        float travel=.62,cycle=t/travel+seed.y,f=fract(cycle),birth=(floor(cycle)-seed.y)*travel;
        float live=step(0.0,birth)*(uStopTime<0.0?1.0:1.0-step(uStopTime+.00001,birth));
        #if UTILITY == 5
          float path=1.0-f,lane=floor(seed.z*3.0)*2.0944;p.x=2.4-f*4.8;p.y=sin(path*3.0+lane)*sin(f*3.14159)*.34;p.z=cos(path*3.0+lane)*sin(f*3.14159)*.34;size*=.6;
        #else
          p.x=-2.4+f*4.8;p.y=cos(a)*(.08+f*.46)*seed.z;p.z=sin(a)*(.08+f*.46)*seed.z;size*=1.2;
        #endif
        p.yz*=uSize;vAlpha=live*smoothstep(0.0,.08,f)*(1.0-smoothstep(.78,1.0,f))*fadeEnd();
      #elif UTILITY == 6
        float f=sat(t/2.2);float rise=ease((f-seed.y*.22)/.7),r=(.2+seed.z*.9)*sin(rise*2.1);
        p=vec3(cos(a+rise)*r,rise*(1.5+seed.y*1.2),sin(a+rise)*r)*uSize;
        vAlpha=smoothstep(seed.y*.15,seed.y*.15+.13,f)*(1.0-smoothstep(.48+seed.z*.15,1.0,f));
      #elif UTILITY == 7
        // Keep decoration per landing sparse when fewer than nine lances are selected.
        float cell=floor(seed.x*max(9.0,uQuantity)),phi=cell*2.39996,r=cell<.5?0.0:.55+.8*mod(cell,3.0)/2.0;
        age=t-(.43+cell/uQuantity*1.05);float f=sat(age/.55);
        p=vec3(cos(phi)*r,0.0,sin(phi)*r)+vec3(cos(a)*f*.65,sin(f*3.14159)*(.2+seed.y*.5),sin(a)*f*.65)*uSize;
        p.xz+=(uSpread-1.0)*vec2(cos(phi)*r,sin(phi)*r);
        vAlpha=smoothstep(0.0,.03,age)*(1.0-smoothstep(.2,.55,age))*step(cell+.5,uQuantity);
      #endif
      vAlpha*=smoothstep(.42,.90,seed.w);
      #if UTILITY == 2 || UTILITY == 4
        size*=.52;vAlpha*=.38;
      #elif UTILITY == 5
        vAlpha*=.45;
      #elif UTILITY == 8
        vAlpha*=.55;
      #endif
      vec3 q=position*size*uSize;
      #if UTILITY == 0
        q.x*=3.2;q.y*=.35;q.z*=.65;q.xz=turn(-1.7+seed.x*2.7+ease(sat(uTime/.65)/.7)*.9+1.5708)*q.xz;
      #elif UTILITY == 1
        q.xz*=.55;q.y*=2.2;
      #elif UTILITY == 3 || UTILITY == 7
        q.y*=2.0;
      #elif UTILITY == 6
        q.xz*=.6;q.y*=1.6;
      #endif
      #if UTILITY == 5 || UTILITY == 8
        q.x/=max(uStretch,.001);
      #endif
      p+=q;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
    }`,S=s(`uniform vec3 uColor;varying vec3 vN;varying float vAlpha,vTone;
    void main(){if(vAlpha<.003)discard;float light=dot(normalize(vN),normalize(vec3(-.4,.8,.55)))*.5+.5;
      vec3 color=mix(uColor*.65,mix(uColor,vec3(1.0),.65),step(.48,light));
      gl_FragColor=vec4(color,vAlpha*.82);${c}}
  `,x,{},!1,{UTILITY:u});S.userData.ownLifecycle=!0;let C=o(new t.TetrahedronGeometry(1,0),i,1,S,2);return C.name=`utility-detail-particles`,!0}function L(){return`
 float grassHash(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
 vec2 windAt(vec2 root, float phase) {
   float wave = sin(dot(root, vec2(1.1, .7)) - uTime * 1.45);
   float gust = .5 + .5 * sin(dot(root, vec2(.48, -.31)) - uTime * .63);
   float flutter = sin(uTime * 2.6 + phase + root.x * 3.0) * .025;
   return vec2(.12 + wave * .11 + gust * .13, .035 + wave * .045 + flutter);
 }
`}function R(){return`
 float brushStreak(float h, float seed) {
   return sin(h * 23.0 + sin(h * 9.0 + seed * 11.0) * 2.2 + seed * 31.0);
 }
`}function z(e){let{THREE:t,kind:n,variant:r,instanced:i,shader:a,output:o}=e;if(n!==10||r!==0)return!1;function s(e){let n=[],r=[],i=[],a=e?6:3;for(let t=0;t<a;t++){let a=e?1:3,o=n.length/3;for(let e=0;e<=a;e++)for(let i=0;i<2;i++)n.push(i*2-1,e/a,t),r.push(i,e/a);for(let e=0;e<a;e++){let t=o+e*2;i.push(t,t+1,t+2,t+1,t+3,t+2)}}let o=new t.BufferGeometry;return o.setAttribute(`position`,new t.Float32BufferAttribute(n,3)),o.setAttribute(`uv`,new t.Float32BufferAttribute(r,2)),o.setIndex(i),o}let c=`
    attribute vec4 seed;
    uniform float uTime, uLifeStart, uLifeEnd;
    varying vec2 vUv;
    varying float vShade, vSeed, vPetal, vGrowth;
    ${L()}
    void main() {
      vUv = uv; vSeed = seed.w; vPetal = 0.0;
      vGrowth = smoothstep(0.0, 1.0, uLifeStart) * (1.0 - smoothstep(0.0, 1.0, uLifeEnd));
      vec2 root = (seed.xy * 2.0 - 1.0) * 1.85;
      root *= sqrt(1.0 - .27 * root.yx * root.yx / 3.4225);
      float id = position.z, h = position.y;
      float angle = seed.w * 6.283185 + id * 2.39996;
      vec2 along = vec2(cos(angle), sin(angle));
      vec2 across = vec2(-along.y, along.x);
      vec3 p;
      float patchTone = .5 + .5 * sin(root.x * 2.3 + sin(root.y * 1.8) * 1.4);
      #if FLOWERS == 1
        float height = .48 + seed.z * .45;
        vec2 wind = windAt(root, seed.w * 6.283185);
        if (id < .5) {
          p = vec3(across.x * position.x * .009, h * height, across.y * position.x * .009);
          p.xz += wind * h * h;
        } else {
          vPetal = 1.0;
          float a = (id - 1.0) * 1.256637 + seed.w * 6.283185;
          vec2 radial = vec2(cos(a), sin(a)), tangent = vec2(-radial.y, radial.x);
          float lengthPetal = .12 + grassHash(id + seed.z * 91.0) * .085;
          vec2 petal = radial * (.012 + h * lengthPetal) + tangent * position.x * (.045 + seed.z * .025);
          p = vec3(petal.x, height + .018 + h * .035 + dot(petal, across) * .65, petal.y);
          p.xz += wind;
        }
        vShade = .4 + seed.z * .3;
      #else
        float shape = grassHash(seed.z * 103.0 + id * 7.0);
        float height = (.30 + pow(seed.z, .7) * .82) * (.72 + shape * .38);
        float width = (.065 + grassHash(seed.w * 53.0 + id) * .10) * mix(1.25, .72, seed.z);
        float taper = .22 + .78 * pow(max(0.0, sin(h * 2.85 + .23)), .72);
        float lean = (.12 + shape * .27) * h * h;
        vec2 leaf = across * position.x * width * taper + along * lean;
        leaf += windAt(root, seed.w * 6.283185 + id * .23) * h * h;
        p = vec3(leaf.x, h * height - lean * .16, leaf.y);
        vShade = .12 + patchTone * .35 + shape * .28 + seed.z * .05;
      #endif
      p *= uSize * vGrowth;
      p.xz += root;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,l=`
    ${R()}
    uniform vec3 uColor;
    varying vec2 vUv;
    varying float vShade, vSeed, vPetal, vGrowth;
    void main() {
      if (vGrowth < .002) discard;
      float x = vUv.x * 2.0 - 1.0, h = vUv.y;
      vec3 color;
      if (vPetal > .5) {
        float edge = .74 + .09 * sin(h * 19.0 + vSeed * 17.0);
        float cap = pow(abs((h - .46) / .57), 4.0);
        if (x*x + cap > edge) discard;
        color = mix(vec3(.69,.74,.70), vec3(.86,.89,.82), step(.43, vShade + x * .09));
      } else {
        #if FLOWERS == 0
          float streak = brushStreak(h, vSeed);
          float rim = .89 + streak * .028 * uDetail;
          float tip = 1.0 - smoothstep(.70, 1.03, h);
          if (abs(x + .12 * sin(h * 5.0 + vSeed * 9.0)) > rim * tip) discard;
          float notch = step(.94, sin(h * 21.0 + vSeed * 47.0)) * .065 * uDetail;
          if (abs(x) > rim * tip - notch && h > .2) discard;
        #endif
        float light = vShade + h * .16;
        color = mix(uColor * .37, uColor * .77, step(.36, light));
        color = mix(color, uColor * 1.13, step(.57, light));
        color = mix(color, mix(uColor, vec3(.70,.70,.22), .55), step(.76, light));
        float stroke = step(.64, sin(h * 10.0 + vSeed * 37.0 + x * 2.3));
        color *= 1.0 + (stroke - .5) * .10 * uDetail;
      }
      gl_FragColor = vec4(color, 1.0);
      ${o}
    }
  `;for(let e of[!1,!0]){let t=a(l,c,{},!1,{FLOWERS:+!!e});t.transparent=!1,t.depthWrite=!0,t.userData.ownLifecycle=!0;let n=i(s(e),e?32:480,e?1/16:15/16,t,0);n.name=e?`grass-white-flowers`:`grass-brush-clumps`}return!0}function re({THREE:e,spec:t,cap:n,uniforms:r,lifeUniforms:i,materials:a,mesh:o,instanced:s,shader:c,output:l}){if(t.id!==`spatial-sweep`)return!1;let u=`uniform float uTime;
    varying vec2 vSweep;varying vec4 vScreen;varying vec2 vTangent,vRadial;varying float vSeed;
    #if SPATIAL_LAYER == 3
      attribute vec4 seed;
    #endif
    void main(){
      float head=mix(.012,1.0,smoothstep(.08,.32,uTime)),tail=smoothstep(.42,.85,uTime);
      float x=uv.x,along=mix(tail,head,x);
      // Broad leading edge covers 1.60 of the preview sword's 3.00 units.
      // Keep only the trailing end pointed; the head reaches the blade midsection.
      float taper=max(pow(max(0.0,sin(x*3.14159265)),.45),smoothstep(.72,.96,x));
      float angle=-2.35+along*5.235987756,radius=3.0;
      vSeed=0.0;
      #if SPATIAL_LAYER == 0
        radius-=(1.0-uv.y)*1.6*taper;
      #elif SPATIAL_LAYER == 1
        radius+=(uv.y-.5)*.32*taper;
      #elif SPATIAL_LAYER == 2
        radius+=(uv.y-.5)*.040*taper;
      #else
        vSeed=seed.x;radius-=(.12+seed.x*1.22)*taper;
        radius+=(uv.y-.5)*(.010+seed.y*.012)*taper;
        radius+=sin(along*22.0+seed.z*6.283-uTime*12.0)*.009*taper;
      #endif
      vec3 radial=vec3(cos(angle),0.0,sin(angle)),tangent=vec3(-sin(angle),0.0,cos(angle));
      vec3 p=radial*radius+vec3(0,1,0);
      vSweep=uv;
      vScreen=projectionMatrix*modelViewMatrix*vec4(p*uSize,1.0);
      vec4 tangentClip=projectionMatrix*modelViewMatrix*vec4((p+tangent*.65)*uSize,1.0);
      vec4 radialClip=projectionMatrix*modelViewMatrix*vec4((p+radial*.24)*uSize,1.0);
      vTangent=(tangentClip.xy/tangentClip.w-vScreen.xy/vScreen.w)*.5;
      vRadial=(radialClip.xy/radialClip.w-vScreen.xy/vScreen.w)*.5;
      gl_Position=vScreen;
    }`,d=`uniform float uTime;varying vec2 vSweep;varying vec4 vScreen;
    varying vec2 vTangent,vRadial;varying float vSeed;
    float sweepFade(){return smoothstep(.0,.04,uTime)*(1.0-smoothstep(.58,.85,uTime));}
    float sweepEnds(){return smoothstep(.0,.035,vSweep.x)*(1.0-smoothstep(.985,1.0,vSweep.x));}
  `,f=`uniform float uDetail;${d}
    uniform sampler2D transmissionSamplerMap;uniform vec2 transmissionSamplerSize;
    void main(){
      // Three.js draws DoubleSide transmission backs into its opaque capture.
      // This zero-thickness sheet must not sample that same target while writing it.
      #ifdef FLIP_SIDED
        // uDetail is clamped to a positive value. Keep the original no-write
        // discard at runtime, but retain an output for ANGLE's validation.
        if(uDetail>=0.0)discard;
        gl_FragColor=vec4(0.0);
      #else
      float fade=sweepFade(),ends=sweepEnds(),x=vSweep.x,y=vSweep.y;
      float feather=smoothstep(.0,.13,y)*(1.0-smoothstep(.90,1.0,y));
      float coverage=fade*ends*feather;
      if(coverage<.002||vScreen.w<=0.0)discard;
      vec2 uv=vScreen.xy/vScreen.w*.5+.5;
      float band=sin(y*66.0+sin(x*13.0-uTime*8.0)*1.25-uTime*19.0);
      float fine=sin(y*157.0+x*17.0-uTime*33.0)*.12;
      float shear=(.20+.80*smoothstep(.0,.95,x))*(.50+.50*band+fine);
      // Tangential displacement stretches the backdrop along the swing; a smaller
      // radial ripple breaks it into compressed, fast-moving pressure bands.
      vec2 delta=(vTangent*(.20+shear*.95)+vRadial*(band*.32+fine))*uDetail*coverage;
      vec2 resolution=max(transmissionSamplerSize,vec2(1.0)),inset=.5/resolution;
      float edge=max(0.0,min(min(uv.x-inset.x,1.0-inset.x-uv.x),min(uv.y-inset.y,1.0-inset.y-uv.y)));
      delta*=smoothstep(.0,max(.04,length(delta)*1.35),edge);
      vec3 background=texture2D(transmissionSamplerMap,clamp(uv+delta,inset,1.0-inset)).rgb;
      // Neutral refraction: no blue fill, dark tint, fixed screenshot or fake reflection.
      gl_FragColor=vec4(background,coverage);${l}
      #endif
    }`,p=new e.MeshPhysicalMaterial({transmission:1,roughness:0,metalness:0,transparent:!0,depthWrite:!1,depthTest:!0,side:e.DoubleSide});p.forceSinglePass=!0,p.uniforms={...r,...i},p.defines={...p.defines,SPATIAL_LAYER:0},p.vertexShader=`uniform float uSize;
`+u,p.fragmentShader=f,p.onBeforeCompile=e=>{Object.assign(e.uniforms,p.uniforms),e.vertexShader=p.vertexShader,e.fragmentShader=p.fragmentShader,p.userData.transmissionUniforms=e.uniforms},p.customProgramCacheKey=()=>p.vertexShader+`
`+p.fragmentShader,p.userData.ownLifecycle=!0,a.add(p),o(new e.PlaneGeometry(1,1,192,8),p,1).name=`spatial-sweep-refraction`;let m=`uniform vec3 uColor;${d}
    void main(){
      float x=vSweep.x,y=vSweep.y,d=abs(y-.5)*2.0;
      float intensity=mix(.08,1.0,smoothstep(.05,.92,x));
      float alpha;vec3 color=uColor;
      #if SPATIAL_LAYER == 1
        alpha=exp(-d*d*7.0)*(1.0-smoothstep(.7,1.0,d))*.18*uDetail*intensity;
      #elif SPATIAL_LAYER == 2
        alpha=(1.0-smoothstep(.05,1.0,d))*.98*intensity;
        color=mix(uColor,vec3(1.0),.72);
      #else
        float stream=smoothstep(.04+vSeed*.2,.35+vSeed*.2,x)*(1.0-smoothstep(.78,1.0,x));
        alpha=(1.0-smoothstep(.0,1.0,d))*stream*.09*uDetail;
      #endif
      alpha*=sweepFade()*sweepEnds();if(alpha<.002)discard;
      gl_FragColor=vec4(color,alpha);${l}
    }`;for(let[t,n]of[[1,`halo`],[2,`edge`]])o(new e.PlaneGeometry(1,1,192,1),c(m,u,{},!0,{SPATIAL_LAYER:t}),t+1).name=`spatial-sweep-`+n;return s(new e.PlaneGeometry(1,1,192,1),n,1,c(m,u,{},!0,{SPATIAL_LAYER:3}),3).name=`spatial-sweep-streaks`,!0}function ie({THREE:e,spec:t,cap:n,mesh:r,instanced:i,shader:a,output:o}){if(t.id!==`azure-sweep`)return!1;let s=`
    uniform float uTime;
    varying vec2 vSweep;
    varying float vTaper,vSeed;
    float sweepHead(){return mix(.012,1.0,smoothstep(.08,.32,uTime));}
    float sweepTail(){return smoothstep(.42,.85,uTime);}
    float sweepTaper(float x){return pow(max(0.0,sin(x*3.14159265)),.45);}
  
    #if SWEEP_LAYER == 3
    attribute vec4 seed;
    #endif
    void main(){
      float tail=sweepTail(),head=sweepHead(),x=uv.x;
      float along=mix(tail,head,x),taper=sweepTaper(x);
      float angle=-2.35+along*5.235987756;
      float radius=3.0;
      vSeed=0.0;
      #if SWEEP_LAYER == 0
        radius-=(1.0-uv.y)*.9*taper;
      #elif SWEEP_LAYER == 1
        radius+=(uv.y-.5)*.48*taper;
      #elif SWEEP_LAYER == 2
        radius+=(uv.y-.5)*.056*taper;
      #else
        vSeed=seed.x;
        radius-=(.09+seed.x*.68)*taper;
        radius+=(uv.y-.5)*(.012+seed.y*.018)*taper;
        radius+=sin(along*19.0+seed.z*6.283-uTime*4.0)*.012*taper;
      #endif
      vec3 p=vec3(cos(angle)*radius,1.0,sin(angle)*radius);
      #if SWEEP_LAYER == 0
        p.y+=sin(x*3.14159265)*(1.0-uv.y)*.045;
      #elif SWEEP_LAYER == 3
        p.y+=.025;
      #endif
      vSweep=vec2(x,uv.y);vTaper=taper;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p*uSize,1.0);
    }
  `,c=`uniform float uTime;uniform vec3 uColor;
    varying vec2 vSweep;varying float vTaper,vSeed;
    void main(){
      float x=vSweep.x,y=vSweep.y;
      float fade=smoothstep(0.0,.04,uTime)*(1.0-smoothstep(.58,.85,uTime));
      float ends=smoothstep(0.0,.035,x)*(1.0-smoothstep(.985,1.0,x));
      float alpha=0.0;vec3 color=uColor;
      #if SWEEP_LAYER == 0
        float flow=y*49.0+x*8.0-uTime*5.0+sin(x*14.0)*.45;
        float grain=pow(.5+.5*sin(flow),10.0)*(1.0-smoothstep(.6,2.0,fwidth(flow)));
        float edge=smoothstep(0.0,.9,y);
        alpha=(.08+.35*edge+grain*.12*uDetail)*smoothstep(0.0,.22,y);
        color=mix(uColor*.68,uColor*1.1,edge);
      #elif SWEEP_LAYER == 1
        float d=abs(y-.5)*2.0;
        alpha=exp(-d*d*6.0)*(1.0-smoothstep(.72,1.0,d))*.34*uDetail;
        color=mix(uColor,vec3(.28,.85,1.0),.18);
      #elif SWEEP_LAYER == 2
        float d=abs(y-.5)*2.0;
        alpha=(1.0-smoothstep(.12,1.0,d))*.98;
        color=mix(uColor,vec3(.85,1.0,1.0),.80);
      #else
        float ribbon=1.0-smoothstep(.1,1.0,abs(y-.5)*2.0);
        float stream=smoothstep(.02+vSeed*.12,.25+vSeed*.12,x)*(1.0-smoothstep(.72+vSeed*.15,1.0,x));
        alpha=ribbon*stream*(.26+.16*uDetail);
        color=mix(uColor,vec3(.3,.8,1.0),.28);
      #endif
      alpha*=fade*ends;
      if(alpha<.002)discard;
      gl_FragColor=vec4(color,alpha);${o}
    }
  `;for(let[t,n,i]of[[0,`blade`,1],[1,`halo`,2],[2,`edge`,4]]){let o=a(c,s,{},t!==0,{SWEEP_LAYER:t});o.userData.ownLifecycle=!0,r(new e.PlaneGeometry(1,1,192,1),o,i).name=`azure-sweep-`+n}let l=a(c,s,{},!0,{SWEEP_LAYER:3});return l.userData.ownLifecycle=!0,i(new e.PlaneGeometry(1,1,192,1),n,1,l,3).name=`azure-sweep-streaks`,!0}function ae(e){let{THREE:t,kind:n,variant:r,uniforms:i,lifeUniforms:a,materials:o,mesh:s,instanced:c,shader:l,output:u,cap:d}=e;if(n!==2||r!==9)return!1;let f=`
    uniform float uTime,uLifeStart,uLifeEnd;
    float bhGrowth(){return smoothstep(0.0,1.0,uLifeStart)*(1.0-smoothstep(.05,1.0,uLifeEnd));}
    float bhFade(){return smoothstep(0.0,.28,uLifeStart)*(1.0-smoothstep(.6,1.0,uLifeEnd));}
    vec3 bhCenter(){return vec3(0.0,1.5,0.0)*uSize;}
  `,p=`
    float bhHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float bhNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
      return mix(mix(bhHash(i),bhHash(i+vec2(1,0)),f.x),mix(bhHash(i+vec2(0,1)),bhHash(i+vec2(1,1)),f.x),f.y);}
    float bhFbm(vec2 p){return bhNoise(p)*.57+bhNoise(p*2.03+17.0)*.28+bhNoise(p*4.11-9.0)*.15;}
    vec3 bhSpectrum(float t){return .5+.5*cos(6.283185*t+vec3(0.0,2.1,4.2));}
  `,m=`
    vec2 bhBackgroundOffset(vec2 uv,vec2 direction,float r,float spiral,float noise,vec2 radius,vec2 inset){
      const float BH_BACKGROUND_DISTORTION=5.0;
      vec2 tangent=vec2(-direction.y,direction.x);
      float bend=.48*pow(1.0-r,2.0)/max(r,.24);
      float shear=.045*sin(spiral*2.0+(noise-.5)*2.0)*pow(1.0-r,1.5);
      vec2 delta=(-direction*min(bend,.70)+tangent*shear)*BH_BACKGROUND_DISTORTION*radius*uDetail;
      float edge=max(0.0,min(min(uv.x-inset.x,1.0-inset.x-uv.x),min(uv.y-inset.y,1.0-inset.y-uv.y)));
      return delta*smoothstep(0.0,max(.015,length(delta)*1.25),edge);
    }
  `,h=`
    // Periodic, advected brush coordinates. Neighbour cells contribute whole
    // strokes, so cell boundaries never cut a curved mark into rectangular chips.
    vec3 bhStrokeSeed(vec2 p){
      vec3 h=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));
      h+=dot(h,h.yxz+33.33);
      return fract((h.xxy+h.yzz)*h.zyx);
    }
    vec3 bhBrushPaint(float r,float angle,float inner,float mask){
      float t=uTime*1.5;
      const float radialDensity=13.0;
      // Advect the spiral's radial coordinate too: inward motion must not
      // secretly add angular speed in one direction and subtract in the other.
      float flowRadius=r+t*.032;
      vec2 p=vec2((angle+log(flowRadius+.14)*1.6+t*mix(.8,-.8,inner))*16.0/6.283185,flowRadius*radialDensity);
      // Derivatives are measured before cell selection. Width is in radius
      // units, independent of angular density, stroke length and light intensity.
      float pixel=max(length(vec2(dFdx(p.y),dFdy(p.y)))/radialDensity,.0003);
      // Derivatives above remain uniform across neighbouring fragments.
      if(mask<=0.0 && pixel<.005)return vec3(0.0);
      float wash=0.0,shade=0.0,scratch=0.0;
      // Five independently seeded fields increase density without shortening
      // or widening the existing marks. Their coverage is combined, not added.
      for(int layer=0;layer<5;layer++){
        float field=float(layer);
        vec2 fieldPosition=p+vec2(field*1.37,field*.417);
        vec2 cell=floor(fieldPosition),local=fract(fieldPosition);
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
          vec2 offset=vec2(float(x),float(y));
          vec2 id=cell+offset;id.x=mod(id.x,16.0);
          id+=vec2(field*19.0,field*43.0);
          vec3 seed=bhStrokeSeed(id),shape=bhStrokeSeed(id+vec2(37.0,71.0));
          // These candidates had exactly zero coverage in the original field.
          if(shape.z<.28)continue;
          vec2 d=local-offset-seed.xy;
          float halfLength=mix(.07,.94,shape.x*shape.x);
          float u=d.x/halfLength;
          if(abs(u)>1.0)continue;
          // A single inward spiral follows each field's rotation. Randomness
          // changes its length and pitch magnitude, never its bend direction.
          float direction=mix(-1.0,1.0,inner);
          float pitch=-direction*mix(.009,.015,shape.y);
          float cross=d.y/radialDensity-d.x*pitch;
          // taper and grain never exceed one; include the complete AA fringe.
          if(abs(cross)>.006+pixel*.5)continue;
          float alongFlow=u*direction;
          float taper=pow(max(0.0,1.0-abs(u)),.65)*(1.0-.35*max(0.0,alongFlow));
          float width=mix(.0022,.006,seed.z*seed.z)*taper;
          // Longitudinal pigment grain stays attached to the mark; it never
          // resamples in time. Sparse gaps keep the result from becoming a ring.
          float grain=.82+.18*sin(u*16.0+shape.y*23.0)*sin(u*7.0+seed.z*31.0);
          float edge=abs(cross)-width*grain;
          float coverage=(1.0-smoothstep(-pixel*.5,pixel*.5,edge))*step(abs(u),1.0);
          coverage*=step(.28,shape.z);
          float split=abs(cross-width*.34)-width*.11;
          float dryGap=mix(1.0,smoothstep(-pixel*.22,pixel*.22,split),step(.68,seed.x));
          coverage*=dryGap;
          float pigment=.15+.55*seed.z+.12*sin(u*4.0+seed.x*9.0);
          if(coverage>wash){wash=coverage;shade=pigment;}
          scratch=max(scratch,coverage*step(.78,seed.y));
        }
      }
      return vec3(wash,shade,scratch);
    }
  `,g=`${f}${p}
    varying vec2 vDisk;varying vec3 vPoint,vCenter;
    varying vec4 vDiskScreen,vDiskCenterClip;varying vec2 vDiskRadius;
    void main(){
      vDisk=position.xy;float scale=uSize*max(.0001,bhGrowth());
      float r=length(position.xy),a=atan(position.y,position.x),spin=uTime*.72;
      vec2 flow=vec2(cos(a-spin/(r+.25)),sin(a-spin/(r+.25)))*r;
      float n=bhFbm(flow*2.7);
      // Keep a closed annulus: bounded radial scaling cannot fold across its centre.
      // Surface texture carries the fast infall; the silhouette moves more slowly.
      float ringShape=.045*sin(a*3.0-uTime*.32)+.025*sin(a*5.0+uTime*.23)+.015*(n-.5);
      float radius=r*(1.0+ringShape);
      float twist=.10*sin(a*3.0+r*1.8-uTime*.35)/(r+.3);
      vec2 disk=vec2(cos(a+twist),sin(a+twist))*radius;
      float thickness=position.z*(.34+.08*n);
      float lift=.06*sin(a*3.0-r*2.0+uTime*.32)*smoothstep(.7,1.7,r);
      float height=(thickness+lift)*.125;
      vec3 q=vec3(disk.x,height,disk.y)*scale;
      vPoint=(modelViewMatrix*vec4(bhCenter()+q,1.0)).xyz;
      vCenter=(modelViewMatrix*vec4(bhCenter(),1.0)).xyz;
      gl_Position=projectionMatrix*vec4(vPoint,1.0);
      vDiskScreen=gl_Position;vDiskCenterClip=projectionMatrix*vec4(vCenter,1.0);
      float projectedRadius=2.15*scale*length(modelViewMatrix[0].xyz)/max(.01,-vCenter.z);
      vDiskRadius=vec2(projectionMatrix[0][0],projectionMatrix[1][1])*projectedRadius*.5;
    }`,_=`uniform float uSize;${f}${p}${h}
    uniform vec3 uColor;varying vec2 vDisk;varying vec3 vPoint,vCenter;
    void main(){
      float nearSide=dot(vPoint-vCenter,normalize(-vCenter));
      // Complementary depth weights remove the screen-wide hard split between
      // the native transmission capture and the foreground overlay.
      float frontWeight=smoothstep(-.45*uSize,.45*uSize,nearSide);
      #if BH_FRONT == 1
        float layerWeight=frontWeight;
      #else
        float layerWeight=1.0-frontWeight;
      #endif
      if(layerWeight<.0001)discard;
      float r=length(vDisk),a=atan(vDisk.y,vDisk.x),spin=uTime*.9;
      // Positive time in log-radius coordinates carries the pattern inward.
      // The changing angular speed stretches each stream as it approaches the core.
      float advected=a+log(r+.12)*2.4+spin;
      vec2 flow=vec2(cos(advected),sin(advected))*vec2(3.0,3.0);
      float n=bhFbm(flow+vec2(r*4.0+uTime*1.15,r*1.5)),large=bhFbm(flow*.55+r);
      float warped=r+5.0*((n-.5)*.055+sin(a*5.0-r*3.0+spin)*.016);
      float phase=advected*3.0+(n-.5)*3.0;
      float bands=pow(.5+.5*sin(phase),2.5);
      float fine=smoothstep(.38,.64,n);
      float envelope=smoothstep(.65,.88,r)*(1.0-smoothstep(2.05+large*.3,2.65,r));
      float torn=smoothstep(.12,.65,n)*(.3+.7*large);
      float hot=bands*(.55+.45*n);
      vec3 spectrum=bhSpectrum(warped*1.8+large*.7);
      vec3 color=mix(vec3(.02,.10,.9),spectrum*1.8,.7);
      color=mix(color,uColor,.18);
      color=mix(color,vec3(1.0,.97,.94)*2.8,smoothstep(.32,.82,hot));
      // Shared broken strokes carry through the outer disk and the inner halo.
      vec3 brush=bhBrushPaint(r/2.15,a,0.0,1.0);
      float ink=brush.z;
      float outerWeight=smoothstep(.68,.88,r);
      color*=mix(.55,1.0,step(.48,hot));

      float alpha=envelope*(.24+bands*.88+fine*.16)*torn*bhFade();
      if(alpha<.002)discard;
      // Light remains additive; ink also attenuates what is behind the disk,
      // so the bright lens cannot wash the outlines out.
      float inkCoverage=ink*outerWeight*envelope*bhFade()*.98;
      vec3 emission=color*2.4*uDetail*min(1.0,alpha)*(1.0-ink*outerWeight);
      // A hue-preserving highlight shoulder keeps pigment visible at default
      // intensity instead of clipping whole bands to white.
      emission/=1.0+max(emission.r,max(emission.g,emission.b))*1.2;
      float wash=brush.x*outerWeight*envelope*bhFade();
      vec3 pigment=mix(vec3(.008,.018,.055),mix(spectrum*.32,vec3(.08,.25,.40),.55),brush.y);
      // Coverage is geometric: bright HDR values must not inflate the edge.
      emission=mix(emission,pigment*(.75+.25*uDetail),wash)*(1.0-ink*outerWeight);
      inkCoverage=max(inkCoverage,wash*.98);
      emission*=layerWeight;inkCoverage*=layerWeight;
      gl_FragColor=vec4(emission+vec3(.002,.004,.012)*inkCoverage,inkCoverage);${u}
    }`,v=new t.TorusGeometry(1.65,1,12,160);for(let e of[0,1]){let n=l(_,g,{},!0,{BH_FRONT:e});n.transparent=!!e,n.side=t.FrontSide,n.userData.ownLifecycle=!0,n.blending=t.CustomBlending,n.blendEquation=t.AddEquation,n.blendSrc=t.OneFactor,n.blendDst=t.OneMinusSrcAlphaFactor,s(e?v.clone():v,n,e?3:0).name=e?`black-hole-front-disk`:`black-hole-rear-disk`}let y=new t.MeshPhysicalMaterial({transmission:1,roughness:0,metalness:0,transparent:!0,depthWrite:!1,side:t.FrontSide});y.uniforms={...i,...a},y.vertexShader=`uniform float uSize;${f}
    varying vec4 vScreen,vCenterClip;varying vec2 vRadius;varying float vLensInclination;
    void main(){
      float radius=2.15*uSize*max(.0001,bhGrowth());
      vec4 center=modelViewMatrix*vec4(bhCenter(),1.0);
      vec4 p=modelViewMatrix*vec4(bhCenter()+position*radius,1.0);
      vLensInclination=abs(dot(normalize(-center.xyz),normalize(modelViewMatrix[1].xyz)));
      vCenterClip=projectionMatrix*center;
      float worldScale=length(modelViewMatrix[0].xyz);
      float projectedRadius=radius*worldScale/max(.01,-center.z);
      vRadius=vec2(projectionMatrix[0][0],projectionMatrix[1][1])*projectedRadius*.5;
      gl_Position=projectionMatrix*p;vScreen=gl_Position;
    }`,y.fragmentShader=`uniform float uSize,uDetail;${f}${p}${h}${m}
    float bhHaloShape(float angle){
      float shapeNoise=bhFbm(vec2(cos(angle-uTime*.16),sin(angle-uTime*.16))*3.0);
      return .045*sin(angle*3.0-uTime*.32)+.008*sin(angle*5.0+uTime*.23)+.005*(shapeNoise-.5);
    }
    vec2 bhJoinPoint(float t,vec2 end){
      vec2 a=vec2(.97,.0),b=vec2(.77,.0),c=end+vec2(.16,-.18);
      float u=1.0-t;
      return u*u*u*a+3.0*u*u*t*b+3.0*u*t*t*c+t*t*t*end;
    }
    float bhJunction(vec2 q,float overhead){
      if(q.y<-.04||abs(q.x)<.30||overhead>=.999)return 0.0;
      float angle=q.x>0.0?.82:3.141593-.82;
      vec2 end=vec2(abs(cos(angle)),sin(angle))*.58*(1.0+bhHaloShape(angle));
      vec2 p=vec2(abs(q.x),q.y),last=bhJoinPoint(0.0,end);
      float distance=10.0,along=0.0;
      for(int i=1;i<=12;i++){
        float t=float(i)/12.0;vec2 next=bhJoinPoint(t,end),d=next-last;
        float h=clamp(dot(p-last,d)/max(dot(d,d),.000001),0.0,1.0);
        float candidate=length(p-last-d*h);
        if(candidate<distance){distance=candidate;along=(float(i)-1.0+h)/12.0;}
        last=next;
      }
      float width=mix(.018,.012,along),aa=max(fwidth(q.x),fwidth(q.y));
      float mask=1.0-smoothstep(width*.35,width+aa,distance);
      mask*=smoothstep(0.0,.12,along)*(1.0-smoothstep(.80,1.0,along));
      return mask*(.55+.45*pow(.5+.5*sin(along*24.0-uTime*1.2),2.0))*(1.0-overhead);
    }
  
    uniform vec3 uColor;uniform sampler2D transmissionSamplerMap;uniform vec2 transmissionSamplerSize;
    varying vec4 vScreen,vCenterClip;varying vec2 vRadius;varying float vLensInclination;
    void main(){
      float fade=bhFade();if(fade<.001||vCenterClip.w<=0.0)discard;
      vec2 uv=vScreen.xy/vScreen.w*.5+.5,center=vCenterClip.xy/vCenterClip.w*.5+.5;
      vec2 radius=max(abs(vRadius),vec2(.00001));vec2 q=(uv-center)/radius;
      float r=length(q);if(r>=1.0)discard;
      float angle=atan(q.y,q.x),spin=uTime*.8;
      vec2 direction=q/max(r,.0001);
      float spiral=angle+2.6*log(r+.13)+spin;
      vec2 flow=vec2(cos(spiral),sin(spiral));
      float n=bhFbm(flow*4.0+vec2(r*8.0+uTime*.9,r*3.0));
      float large=bhFbm(vec2(cos(angle-spin*.4),sin(angle-spin*.4))*3.0);
      // One angular deformation shared by both annuli. Radius remains monotonic,
      // so neither ring can fold, branch, cross its neighbour or reach the black core.
      float ringShape=bhHaloShape(angle);
      float warped=r/(1.0+ringShape);
      vec2 inset=.5/max(transmissionSamplerSize,vec2(1.0));
      vec2 delta=bhBackgroundOffset(uv,direction,r,spiral,n,radius,inset);
      vec3 background=texture2D(transmissionSamplerMap,clamp(uv+delta,inset,1.0-inset)).rgb;
      float aa=max(fwidth(r),.0005),horizon=1.0-smoothstep(.275-aa,.275+aa,r);
      vec3 color=mix(background,vec3(0.0),horizon);
      float stream=pow(.5+.5*sin(spiral*3.0+(n-.5)*2.6),3.0);
      float corona=exp(-pow((warped-.50)/(.065+large*.02),2.0));
      // Avoid a second, evenly spaced radial stripe pattern underneath the brush.
      float filaments=.65+.35*stream;
      float continuity=.55+.45*stream;
      float inner=exp(-pow((warped-.35)/.016,2.0))*continuity;
      float fringe=exp(-pow((warped-.58)/.055,2.0))*continuity;
      vec3 cool=vec3(.018,.075,1.0),spectrum=bhSpectrum(warped*9.0+large*.8+n*.4);
      vec3 energy=vec3(1.0,.98,.96)*corona*filaments*continuity*(1.4+large);
      energy+=spectrum*fringe*1.9;
      energy+=cool*(exp(-abs(warped-.51)*8.0)*.38+exp(-abs(warped-.30)*38.0)*.24)*(.4+.6*stream);
      energy+=mix(uColor,vec3(1.0),.8)*inner*1.6;
      float stableRim=exp(-pow((r-.284)/max(.0018,aa*.65),2.0));
      const float BH_COLOR_JOIN=1.0;
      float junction=bhJunction(q,smoothstep(.40,.92,vLensInclination))*BH_COLOR_JOIN;
      vec3 joiningLight=mix(spectrum,uColor,.08)*junction*1.1;
      vec3 glow=(energy+joiningLight)*uDetail;
      glow/=1.0+max(glow.r,max(glow.g,glow.b))*1.2;
      color+=glow*smoothstep(.287,.32,r);
      color+=mix(uColor,vec3(1.0),.8)*stableRim*1.3*uDetail*(1.0-horizon);
      // Keep the pigment on circular flow coordinates; silhouette turbulence
      // must not bend individual strokes into radial hooks.
      float brushZone=smoothstep(.30,.34,r)*(1.0-smoothstep(.60,.68,warped));
      vec3 haloBrush=bhBrushPaint(r,angle,1.0,brushZone);
      vec3 pigment=mix(vec3(.008,.018,.055),mix(spectrum*.32,vec3(.08,.25,.40),.55),haloBrush.y);
      color=mix(color,pigment*(.75+.25*uDetail),haloBrush.x*brushZone);
      float innerInk=haloBrush.z*brushZone;
      color=mix(color,vec3(.002,.004,.012),innerInk*.98);
      float alpha=fade*(1.0-smoothstep(.91,1.0,r));
      gl_FragColor=vec4(color,alpha);${u}
    }`,y.onBeforeCompile=e=>{Object.assign(e.uniforms,y.uniforms),e.vertexShader=y.vertexShader,e.fragmentShader=y.fragmentShader,y.userData.transmissionUniforms=e.uniforms},y.customProgramCacheKey=()=>y.vertexShader+`
`+y.fragmentShader,y.userData.ownLifecycle=!0,o.add(y),s(new t.SphereGeometry(1,64,40),y,1).name=`black-hole-lens`;let b=l(`uniform float uSize;${f}
    uniform vec3 uColor;varying vec2 vUv;varying float vAlpha;
    varying vec4 vParticleScreen,vParticleCenter;varying vec2 vParticleRadius;
    void main(){vec2 q=vUv*2.0-1.0;float glow=exp(-dot(q,q)*5.0)*(1.0-smoothstep(.5,1.0,length(q)));
      vec2 screen=vParticleScreen.xy/vParticleScreen.w*.5+.5;
      vec2 center=vParticleCenter.xy/vParticleCenter.w*.5+.5;
      float coreRadius=length((screen-center)/max(abs(vParticleRadius),vec2(.00001)));
      float alpha=min(1.0,glow*2.0)*vAlpha*smoothstep(.285,.31,coreRadius);if(alpha<.002)discard;
      gl_FragColor=vec4(vec3(1.6)*uDetail,alpha);${u}
    }`,`${f}
    attribute vec4 seed;varying vec2 vUv;varying float vAlpha;
    varying vec4 vParticleScreen,vParticleCenter;varying vec2 vParticleRadius;
    // Preserve the front-facing lensed arch. As the viewer moves above the
    // disk, blend onto its circular rim rather than keeping a raised arch.
    vec3 bhParticlePath(float age,vec3 right,vec3 toward,float overhead){
      float a=age*6.283185;
      float r=mix(2.65+seed.y*.30,.38,smoothstep(.48,1.0,age));
      float rear=max(0.0,sin(a));
      float hemisphere=seed.z<.5?-1.0:1.0;
      float lift=pow(rear,1.35)*r*.52*hemisphere;
      float depth=-sin(a)*r*mix(1.0,.18,smoothstep(0.0,.35,rear));
      vec3 arch=right*(-cos(a)*r*mix(1.0,.72,smoothstep(0.0,.75,rear)))+toward*depth+vec3(0.0,lift+(seed.z-.5)*.07*(1.0-age),0.0);
      float rimRadius=2.45+seed.y*.15;
      // Both paths share an angular basis so intermediate views cannot
      // collapse the orbit by blending two opposite directions.
      vec3 rim=right*(-cos(a)*rimRadius)+toward*(-sin(a)*rimRadius)+vec3(0.0,(seed.z-.5)*.025,0.0);
      return mix(arch,rim,overhead);
    }
    void main(){
      float age=fract(seed.x+uTime*(.11+seed.w*.04));
      float scale=uSize*max(.0001,bhGrowth());
      vec3 eye=-modelViewMatrix[3].xyz;
      vec3 localEye=vec3(dot(eye,modelViewMatrix[0].xyz)/dot(modelViewMatrix[0].xyz,modelViewMatrix[0].xyz),
        dot(eye,modelViewMatrix[1].xyz)/dot(modelViewMatrix[1].xyz,modelViewMatrix[1].xyz),
        dot(eye,modelViewMatrix[2].xyz)/dot(modelViewMatrix[2].xyz,modelViewMatrix[2].xyz));
      vec3 viewOffset=localEye-bhCenter();
      float overhead=smoothstep(.40,.92,abs(viewOffset.y)/max(length(viewOffset),.0001));
      // Project the camera's right axis onto the disk. Unlike the eye's
      // horizontal position this remains defined directly above the center.
      vec3 right=vec3(modelViewMatrix[0].x/dot(modelViewMatrix[0].xyz,modelViewMatrix[0].xyz),0.0,
        modelViewMatrix[2].x/dot(modelViewMatrix[2].xyz,modelViewMatrix[2].xyz));
      right=length(right)>.0001?normalize(right):vec3(1.0,0.0,0.0);
      vec3 toward=vec3(-right.z,0.0,right.x);
      vec3 q=bhParticlePath(age,right,toward,overhead);
      vec3 tangent=bhParticlePath(min(.9999,age+.001),right,toward,overhead)-bhParticlePath(max(0.0,age-.001),right,toward,overhead);
      vec4 mv=modelViewMatrix*vec4(bhCenter()+q*scale,1.0);
      vec2 along=normalize((modelViewMatrix*vec4(tangent,0.0)).xy+vec2(.00001));
      mv.xy+=(along*position.x*(.035+.125*seed.w)+vec2(-along.y,along.x)*position.y*.007)*scale*length(modelViewMatrix[0].xyz);
      vUv=uv;vAlpha=smoothstep(0.0,.07,age)*(1.0-smoothstep(.94,1.0,age))*bhFade();
      gl_Position=projectionMatrix*mv;vParticleScreen=gl_Position;
      vec4 center=modelViewMatrix*vec4(bhCenter(),1.0);vParticleCenter=projectionMatrix*center;
      float projectedRadius=2.15*scale*length(modelViewMatrix[0].xyz)/max(.01,-center.z);
      vParticleRadius=vec2(projectionMatrix[0][0],projectionMatrix[1][1])*projectedRadius*.5;
    }`,{},!0);b.transparent=!0,b.userData.ownLifecycle=!0,c(new t.PlaneGeometry(1,1),d,1,b,4).name=`black-hole-infall`;let x=new t.MeshPhysicalMaterial({transmission:1,roughness:0,metalness:0,transparent:!0,depthWrite:!1,side:t.FrontSide});return x.uniforms={...i,...a},x.vertexShader=`uniform float uSize;${f}
    varying vec3 vLensPoint,vLensEye;
    varying vec4 vDiskScreen,vDiskCenterClip;varying vec2 vDiskRadius;
    void main(){
      const vec3 axes=vec3(3.05,.58,3.05);
      float scale=uSize*max(.0001,bhGrowth());
      vec3 eye=-modelViewMatrix[3].xyz;
      vec3 localEye=vec3(dot(eye,modelViewMatrix[0].xyz)/dot(modelViewMatrix[0].xyz,modelViewMatrix[0].xyz),
        dot(eye,modelViewMatrix[1].xyz)/dot(modelViewMatrix[1].xyz,modelViewMatrix[1].xyz),
        dot(eye,modelViewMatrix[2].xyz)/dot(modelViewMatrix[2].xyz,modelViewMatrix[2].xyz));
      vLensPoint=position/axes;vLensEye=(localEye-bhCenter())/(axes*scale);
      vec4 center=modelViewMatrix*vec4(bhCenter(),1.0);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(bhCenter()+position*scale,1.0);
      vDiskScreen=gl_Position;vDiskCenterClip=projectionMatrix*center;
      float projectedRadius=2.15*scale*length(modelViewMatrix[0].xyz)/max(.01,-center.z);
      vDiskRadius=vec2(projectionMatrix[0][0],projectionMatrix[1][1])*projectedRadius*.5;
    }`,x.fragmentShader=`uniform float uSize,uDetail;${f}${p}${m}
    uniform sampler2D transmissionSamplerMap;uniform vec2 transmissionSamplerSize;
    varying vec3 vLensPoint,vLensEye;varying vec4 vDiskScreen,vDiskCenterClip;varying vec2 vDiskRadius;
    void main(){
      float fade=bhFade();if(fade<.001||vDiskCenterClip.w<=0.0)discard;
      // Ray distance in unit-sphere space gives a continuous convex footprint.
      // There is no annular hole or angular deformation of the silhouette.
      vec3 ray=normalize(vLensPoint-vLensEye);
      float r=clamp(length(cross(vLensPoint,ray)),0.0,1.0);
      float coverage=(1.0-smoothstep(.96,1.0,r))*fade;
      if(coverage<.001)discard;
      vec2 uv=vDiskScreen.xy/vDiskScreen.w*.5+.5;
      vec2 center=vDiskCenterClip.xy/vDiskCenterClip.w*.5+.5;
      vec2 radius=max(abs(vDiskRadius),vec2(.00001));
      vec2 q=(uv-center)/radius,direction=q/max(length(q),.0001);
      float angle=atan(q.y,q.x);
      float spiral=angle+2.6*log(r+.13)+uTime*.8;
      float noise=bhFbm(vec2(cos(spiral),sin(spiral))*4.0+vec2(r*8.0+uTime*.9,r*3.0));
      // Halve outer displacement, retaining its footprint and smooth rim.
      // The central lens renders afterwards and protects the black horizon.
      float fieldDistance=mix(.25,.80,r*r);
      vec2 inset=.5/max(transmissionSamplerSize,vec2(1.0));
      vec2 delta=bhBackgroundOffset(uv,direction,fieldDistance,spiral,noise,radius,inset)*.5*(1.0-smoothstep(.85,1.0,r));
      vec3 background=texture2D(transmissionSamplerMap,clamp(uv+delta,inset,1.0-inset)).rgb;
      gl_FragColor=vec4(background,coverage);${u}
    }`,x.onBeforeCompile=e=>{Object.assign(e.uniforms,x.uniforms),e.vertexShader=x.vertexShader,e.fragmentShader=x.fragmentShader,x.userData.transmissionUniforms=e.uniforms},x.customProgramCacheKey=()=>x.vertexShader+`
`+x.fragmentShader,x.userData.ownLifecycle=!0,o.add(x),s(new t.SphereGeometry(1,96,48).scale(3.05,.58,3.05),x,0).name=`black-hole-outer-lens`,!0}function B(e,n={}){let r=e.kind,i=e.variant,a={"0:3":3,"1:1":4,"1:3":6,"3:1":12,"3:3":9,"3:4":5,"2:4":9,"2:5":3,"2:6":4,"2:7":3,"3:7":10,"2:8":7,"3:8":13,"7:0":7,"7:1":4,"1:5":9,"3:9":14,"3:10":9,"1:6":8}[`${r}:${i}`]??1,o=e.renderStyle===`toon`&&(r===3||r===4),s=e.id===`golden-chain-rain`?512:Math.min(r===5?128:1024,Math.max(1,e.maxParticles)),c=new t.Group;c.name=e.id;let u={...e.id===`golden-chain-rain`?{spriteChains:!0}:{},color:e.color,size:e.sizeRange?.default??1,density:e.defaultDensity??.5,speed:1,detail:e.detailRange?.default??1,...e.quantity?{quantity:e.quantity.default}:{},...e.spread?{spread:e.spread.default}:{},...e.crackBloomSpread?{crackBloomSpread:e.crackBloomSpread.default}:{},...e.crackBloom?{crackBloom:e.crackBloom.default}:{},...e.textureDensity?{textureDensity:e.textureDensity.default}:{},...e.panelCount?{panelCount:e.panelCount.default}:{},...n},d=0,m=!1,h=0,g=null,_=0,v=new t.Vector3(1,0,0),y=new t.Vector3(1,0,0),b=new t.Vector3,x=new Set,S=new Set,C=[],w=[],T=e.id===`billowing-airburst`?{seed:Math.random()*4294967296>>>0,reset:null}:null,E=[],O=[],ee=[];function k(e,t=`xyz`,n=0){return E.push({object:e,axes:t,pivot:n,scale:e.scale.clone(),position:e.position.clone()}),e}let A={uTime:{value:0},uColor:{value:new t.Color},uCrackBloomSpread:{value:e.crackBloomSpread?.default??1},uCrackBloom:{value:e.crackBloom?.default??.15},uSpriteChains:{value:0},uTextureDensity:{value:e.textureDensity?.default??1},uPanelCount:{value:e.panelCount?.default??0},uQuantity:{value:a},uSpread:{value:1},uStretch:{value:1},uSize:{value:1},uDetail:{value:1},uDensity:{value:.5}},M={0:[.35,.8],1:[i===2?1.6:.4,.6],2:[.7,1],4:[1.1,1.4],5:[.5,1.2]},N=e.burst?[e.duration*.1,e.duration*.45]:M[r]??[.3,.8],P={start:Math.max(.001,Number(e.lifecycle?.start)||N[0]),end:Math.max(.001,Number(e.lifecycle?.end)||N[1])};Number.isFinite(e.lifecycle?.hitEnd)&&e.lifecycle.hitEnd>0&&(P.hitEnd=e.lifecycle.hitEnd);let F=`starting`,I=0,L=-1,R=1,B=!1,V={uLifeStage:{value:0},uLifeStart:{value:0},uLifeEnd:{value:0},uLifeOrigin:{value:1},uStopTime:{value:-1},uEndDuration:{value:P.end},uImpact:{value:0},uImpactAge:{value:0},uImpactProgress:{value:0},uEmitterTime:{value:0}},oe=new t.Matrix4,H=new t.Matrix4,U=-1,se=null;function W(){if(!e.burst||r===3&&i===2){for(let e of S){if(e.userData.ownLifecycle)continue;r===0&&!e.transparent&&ee.push(e);let t=e.vertexShader.includes(`attribute float aPhase`)?`aPhase`:e.vertexShader.includes(`attribute vec4 seed`)?`seed.x*37.0`:`0.0`;r===2&&[0,2,3,5,6,7,8].includes(i)&&(e.vertexShader=e.vertexShader.replace(/\buTime\b/g,`uEmitterTime`),e.fragmentShader=e.fragmentShader.replace(/\buTime\b/g,`uEmitterTime`));let n=e.vertexShader.replace(/void\s+main\s*\(\s*\)/,`void steadyMain()`),a=e.fragmentShader.replace(/void\s+main\s*\(\s*\)/,`void steadyMain()`);e.uniforms={...e.uniforms,...V,uClipToGroup:{value:oe},uGroupToClip:{value:H}},e.vertexShader=`
    uniform float uLifeStage,uLifeStart,uLifeEnd,uLifeOrigin;
    uniform mat4 uClipToGroup,uGroupToClip;
    varying vec3 vStagePosition;varying float vStagePart;
    vec3 stageShape(vec3 p,float s,float e,float part){
      float grow=s*s*(3.0-2.0*s),curl=(1.0-grow);
      #if KIND == 0
        float tail=1.0-smoothstep(-1.4,.25,p.x);
        #if VARIANT == 0
          p.yz*=mix(.22,1.0,grow);p.x=mix(p.x*.38-.16,p.x,grow);
          p.y+=sin(p.x*4.5+s*7.0)*curl*.15;
        #elif VARIANT == 1
          p.x*=mix(1.3,1.0,grow);p.yz*=mix(.08,1.0,grow);
        #elif VARIANT == 2 || VARIANT == 4
          float assemble=ceil((atan(p.z,p.y)+3.14159)*3.0)*.028;
          p.yz*=1.0+curl*(.8+assemble);p.x-=curl*(.2+assemble);
        #elif VARIANT == 3
          p.yz*=1.0+curl*.8;p.x+=sin(p.y*7.0)*curl*.4;
        #elif VARIANT == 5
          p.z+=sin(p.x*4.0)*curl*.75;p.x-=curl*.5;
        #else
          p.yz*=1.0+curl*.85;float turn=curl*2.4;
          p.yz=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*p.yz;
        #endif
        p.x-=e*tail*1.6;p.yz*=1.0-e*.75;
      #elif KIND == 1
        // Range is revealed in fragments; endpoints never change coordinates.
        p.yz*=mix(.35,1.0,grow)*(1.0-e*.7);
      #elif KIND == 2
        float r=length(p.xz),a=atan(p.z,p.x);
        float cell=floor((a+3.14159)*3.0);float stagger=smoothstep(.04+fract(part*.37+cell*.13)*.2,.9,e);
        #if VARIANT == 0
          p.y+=curl*(.15+sin(a*5.0)*.08);float returnTime=smoothstep(.0,.72,e);float turn=returnTime*.8;p.xz=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*p.xz;p.xz*=1.0-returnTime*.95;p.y=mix(p.y,.06,returnTime)+sin(returnTime*3.14159)*.32;
        #elif VARIANT == 1
          p.y*=grow*(1.0-stagger*.8);p.y+=sin(stagger*3.14159)*.16;p.xz*=1.0+stagger*.1;
        #elif VARIANT == 2
          vec2 cellCenter=(floor(p.xz*2.5)+.5)/2.5;vec2 local=p.xz-cellCenter;float tumble=stagger*(1.0+fract(cell*.71)*2.0);p.xz=cellCenter*(1.0+stagger*.65)+local*cos(tumble);p.y+=local.x*sin(tumble)+sin(stagger*3.14159)*(.25+fract(cell*.71)*.45)-stagger*stagger*.35;p.xz*=mix(.7,1.0,grow);
        #elif VARIANT == 3
          p.y*=grow;float release=smoothstep(fract(cell*.37)*.2,.72,e);p*=1.0+release*.4;p.y+=release*(.12+max(0.0,p.y)*.4);
        #elif VARIANT == 4
          p.y*=grow;p.xz*=1.0+stagger*.32;p.y-=stagger*stagger*max(0.0,p.y)*.9;p.x+=sin(part*3.1)*stagger*.18;
        #elif VARIANT == 5
          p.y*=grow;float release=smoothstep(.02+fract(part*.31)*.2,.72,e);float loosen=release*(.4+max(0.0,p.y)*.7);p.xz+=vec2(cos(part*2.4),sin(part*2.4))*loosen;p.y+=sin(release*3.14159)*.28-release*release*.55;
        #elif VARIANT == 6
          float height=max(0.0,p.y);float retract=smoothstep(.0,.9,e);float bend=retract*height*2.1;float turn=curl*2.7+retract*.4;
          p.xz=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*p.xz;p.xz*=1.0-retract*.3;p.xz+=vec2(cos(a),sin(a))*(cos(bend)-1.0)*height*.45;
          p.y=grow*(height*cos(bend)*(1.0-retract*.5)+min(p.y,0.0));
        #elif VARIANT == 7
          float slide=smoothstep(.04+(.5+.5*sin(a*3.0))*.25,.9,e);p.y*=grow*(1.0-slide);p.y+=sin(slide*3.14159)*(.08+.06*sin(a*2.0));p.xz*=1.0-slide*.83;
        #else
          float pop=smoothstep(.08+fract(part*.41)*.25,.65+fract(part*.41)*.25,e);p.y*=grow*(1.0-pop*.85);p.xz*=mix(.55,1.0,grow)*(1.0+sin(pop*3.14159)*.65);
        #endif
      #elif KIND == 3
        float radius=length(p.xz),angle=atan(p.z,p.x);
        #if VARIANT == 2
          float crest=sin(radius*5.0-e*5.0+sin(angle*5.0));p.y+=crest*sin(e*3.14159)*.18;p.xz*=1.0+e*.12;
        #elif VARIANT == 4
          float h=max(0.0,p.y+1.3);p.z+=sin(h*4.0-e*6.0)*e*.4;p.y+=cos(h*3.5-e*5.0)*e*.24;p.x*=1.0+e*.2;
        #elif VARIANT == 5
          p.x+=sin(p.y*25.0+floor(e*17.0))*e*.07;p.z+=sin(p.y*18.0-floor(e*13.0))*e*.06;
        #elif VARIANT == 6
          float h=max(0.0,p.y+1.3);float roll=e*3.8+radius*2.0;p.y+=sin(roll)*h*.7;p.xz*=1.0+sin(roll)*h*.15;
        #elif VARIANT == 7
          float ray=length(p);p*=1.0-e*.22;p.y+=sin(ray*7.0+e*8.0)*e*.04;
        #endif
      #elif KIND == 4
        float h=clamp((p.y+1.4)/3.4,0.0,1.0);
        // 大範圍捲流向內聚攏；正常持續及收尾（s=1）保持原來的變形。
        float gather=curl*(1.0-smoothstep(0.0,.6,e));
        p.y=-1.4+(p.y+1.4)*(1.0+gather*.10);
        float turn=gather*(1.0-h)*.55-e*.45;p.xz=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*p.xz;p.xz*=1.0+gather*.45+e*.18;
        #if VARIANT == 1
          p.y=max(-1.38,p.y-e*e*h*.7);
        #endif
      #elif KIND == 5
        #if VARIANT == 1
          p.xz*=mix(.18,1.0,grow)*(1.0+e*.18);
        #else
          p.y=-1.4+(p.y+1.4)*mix(.2,1.0,grow);
        #endif
      #endif
      return p;
    }
  `+n+`
        void main(){steadyMain();vStagePosition=vec3(0.0);vStagePart=${t};if(uLifeStage==1.0)return;
          vec4 p=uClipToGroup*gl_Position;p/=p.w;vStagePosition=p.xyz;
          gl_Position=uGroupToClip*vec4(stageShape(p.xyz,uLifeStart,uLifeEnd,vStagePart),1.0);
        }`,e.fragmentShader=`
    uniform float uLifeStage,uLifeStart,uLifeEnd,uLifeOrigin,uImpact;
    varying vec3 vStagePosition;varying float vStagePart;
    float phaseCoverage(vec3 p){
      float s=uLifeStart,e=uLifeEnd;
      float a=atan(p.z,p.x),r=length(p.xz);
      float start=1.0,end=1.0;
      #if KIND == 0
        #if VARIANT == 0
          float curl=sin(p.x*6.0+p.y*5.0+s*9.0)*.06;
          start=smoothstep(0.0,.18,s)*smoothstep(-.12,.12,s-(.15+clamp(-p.x,0.0,3.0)*.2+curl));
        #elif VARIANT == 1
          start=smoothstep(.0,.12,s)*smoothstep(-.1,.1,s-abs(p.x)*.24);
        #elif VARIANT == 2 || VARIANT == 4
          start=smoothstep(-.08,.08,s-(.12+fract(atan(p.z,p.y)*1.7)*.56));
        #elif VARIANT == 3
          start=smoothstep(-.12,.12,s-(.1+fract(p.x*.8+p.y)*.55));
        #elif VARIANT == 5
          start=smoothstep(-.13,.13,s-(.15+clamp(-p.x,0.0,2.0)*.25));
        #else
          start=smoothstep(-.13,.13,s-(.1+fract(atan(p.z,p.y)*.5-p.x*.3)*.6));
        #endif
        end=1.0-smoothstep(0.0,uImpact>.5?.28:.9,e);
      #elif KIND == 1
        float x=clamp((p.x+2.4)/4.8,0.0,1.0);
        start=smoothstep(-.08,.08,s*1.16-.08-x);
        end=smoothstep(-.14,.05,x-e*1.22+.12)*(1.0-smoothstep(.78,1.0,e));
      #elif KIND == 2
        float pattern=0.0;
        #if VARIANT == 0
          pattern=.1+r*.25+sin(a*5.0)*.08;
        #elif VARIANT == 1
          pattern=.12+fract(a/6.28318*5.0)*.22+r*.2;
        #elif VARIANT == 2
          pattern=.1+r*.25+abs(sin(a*3.0))*.1;
        #elif VARIANT == 3
          pattern=.12+max(abs(p.x),abs(p.z))*.27+max(0.0,p.y)*.18;
        #elif VARIANT == 4
          pattern=.1+fract(floor(p.x*3.0)+floor(p.z*3.0)*.38)*.35+max(0.0,p.y)*.2;
        #elif VARIANT == 5
          pattern=.14+fract(a/6.28318*3.0)*.3+max(0.0,p.y)*.2;
        #elif VARIANT == 6
          pattern=.08+r*.18+max(0.0,p.y)*.25;
        #elif VARIANT == 7
          pattern=.1+(1.7-r)*.25+abs(sin(a*1.5))*.12;
        #else
          pattern=.12+r*.2+sin(a*3.0)*.1;
        #endif
        pattern=clamp(pattern,.08,.75);
        start=smoothstep(-.08,.08,s-pattern);
        end=1.0-smoothstep(-.12,.12,e-(.18+pattern*.75));
        #if VARIANT == 0
          end=1.0-smoothstep(.64,.98,e);
        #elif VARIANT == 5 || VARIANT == 6 || VARIANT == 7
          end=1.0-smoothstep(.55,.98,e);
        #endif
        if(e>0.0){
          #if VARIANT == 1
            float ash=.5+.5*sin(p.x*31.0+p.z*23.0+sin(p.x*17.0)*3.0);end*=smoothstep(e*.7-.1,e*.7+.12,ash);
          #elif VARIANT == 3
            float sector=fract(a*1.4324);float gap=smoothstep(.03,.38,e)*.22;end*=smoothstep(gap,gap+.025,sector)*(1.0-smoothstep(1.0-gap-.025,1.0-gap,sector));
          #elif VARIANT == 2 || VARIANT == 4
            vec2 tile=abs(fract(p.xz*2.5)-.5);float crack=max(tile.x,tile.y);end*=1.0-smoothstep(.5-e*.25,.51-e*.25,crack);
          #elif VARIANT == 7
            float grain=.5+.5*sin(p.x*19.0+sin(p.z*15.0)*2.0);end*=mix(1.0,smoothstep(e*.65-.12,e*.65+.15,grain),smoothstep(.5,.9,e));
          #elif VARIANT == 8
            float pop=smoothstep(.08+fract(vStagePart*.41)*.25,.65+fract(vStagePart*.41)*.25,e);end*=1.0-smoothstep(.015,.08,max(0.0,p.y)-(.9-pop*1.5));
          #endif
        }
      #elif KIND == 3
        if(e>0.0){
          #if VARIANT == 2
            float breakUp=.5+.5*sin(a*7.0+sin(a*3.0)+p.y*5.0);end=smoothstep(e*.6-.1,e*.6+.12,breakUp);
          #elif VARIANT == 4
            float flame=.5+.5*sin(p.x*7.0+sin(p.y*5.0-e*9.0)*2.0+p.z*3.0);end=smoothstep(e*.82-.08,e*.82+.09,flame);
          #elif VARIANT == 5
            float segment=floor(p.y*3.0);float discharge=.5+.5*sin(segment*4.7+floor(e*13.0)*2.9);end=mix(smoothstep(.32,.55,discharge)*(1.0-smoothstep(.1,.55,e)),1.0,1.0-smoothstep(-.9,-.3,p.y));
          #elif VARIANT == 6
            float foam=.5+.5*sin(a*11.0+sin(p.y*9.0+e*8.0)+r*4.0);end=smoothstep(e*.88-.08,e*.88+.12,foam);
          #elif VARIANT == 7
            float ray=length(p);float streak=.5+.5*sin(a*9.0+floor(e*9.0)*2.4);end=1.0-smoothstep((1.0-e)*3.0+.2,(1.0-e)*3.0+.5,ray);end*=mix(.2,1.0,streak);
          #endif
        }
      #elif KIND == 4
        float h=clamp((p.y+1.4)/3.4,0.0,1.0);
        start=smoothstep(0.0,.13,s);
        end=1.0-smoothstep(.45,1.0,e);
      #elif KIND == 5
        start=smoothstep(.0,.25,s);
        end=1.0-smoothstep(.35,1.0,e);
      #endif
      return start*end;
    }
  `+a+`
        void main(){steadyMain();if(uLifeStage==1.0)return;
          float coverage=phaseCoverage(vStagePosition);
          if(coverage<.004)discard;gl_FragColor.a*=coverage;
          #if KIND == 1 && VARIANT == 4
            float radius=length(vStagePosition.yz);float core=1.0-smoothstep(.04,.22,radius);float atEnd=smoothstep(1.65,2.05,abs(vStagePosition.x));
            float petal=floor((atan(vStagePosition.z,vStagePosition.y)+3.14159)*.955);float release=smoothstep(.15+fract(petal*.381)*.3,.85,uLifeEnd);
            gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(1.0,.97,.81),core*.75);
            gl_FragColor.a*=mix(.55+.45*core,1.0-release,atEnd);
            gl_FragColor.a*=1.0-atEnd*smoothstep(.35,.9,uLifeEnd)*smoothstep(.05,.55,radius);
          #elif KIND == 2 && VARIANT == 1
            gl_FragColor.rgb*=1.0-uLifeEnd*.75;
          #elif KIND == 4 && VARIANT == 2
            gl_FragColor.rgb*=1.0-uLifeEnd*.6;
          #elif KIND == 3 && VARIANT == 6
            gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.8,.94,1.0),uLifeEnd*.65);
          #endif
        }`}if(r===2){for(let e of c.children)if(e.geometry.type===`PlaneGeometry`){let n=e.geometry,r=n.parameters,i=new t.PlaneGeometry(r.width,r.height,24,24),a=new t.BufferGeometry,o=n.attributes.position.count;for(let e of[`position`,`normal`,`uv`])a.setAttribute(e,new t.Float32BufferAttribute([...n.attributes[e].array,...i.attributes[e].array],n.attributes[e].itemSize));a.setIndex([...n.index.array,...Array.from(i.index.array,e=>e+o)]),O.push({geometry:a,steady:n.index.count,transition:i.index.count}),e.geometry=a,x.delete(n),n.dispose(),i.dispose(),x.add(a)}}for(let e of c.children)e.onBeforeRender=(t,n,r)=>{F!==`active`&&((U!==t.info.render.frame||se!==r)&&(H.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse).multiply(c.matrixWorld),oe.copy(H).invert(),U=t.info.render.frame,se=r),e.material.uniformsNeedUpdate=!0)}}}let G=`
    float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float noise2(vec2 p) {
      vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
      return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);
    }
    float fbm(vec2 p) { return noise2(p)*0.57+noise2(p*2.07+3.1)*0.29+noise2(p*4.13-1.7)*0.14; }
    float band(float x,float width) { return 1.0-smoothstep(width,width+0.004,abs(x)); }
    #define PI 3.14159265359
  `,K=`
    float toonStep(float edge,float x){float aa=max(fwidth(x),.008);return smoothstep(edge-aa,edge+aa,x);}
    vec3 toonShade(vec3 tint,float light){
      vec3 c=mix(tint*.28,tint*1.08,toonStep(.40,light));
      return mix(c,mix(tint,vec3(1.0),.53)*1.15,toonStep(.69,light));
    }
  `,q=`
    vec3 noiseGradient(vec2 p){
      vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f),du=6.0*f*(1.0-f);
      float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
      return vec3(mix(mix(a,b,u.x),mix(c,d,u.x),u.y),du.x*mix(b-a,d-c,u.y),du.y*mix(c-a,d-b,u.x));
    }
    vec3 curlFlow(vec3 p,float t){
      // A=(N(y,z),N(z,x),N(x,y)) 的解析 curl；所有元件取樣同一空間。
      vec3 ax=noiseGradient(p.yz+vec2(7.3-t*0.22,1.7+t*0.11));
      vec3 ay=noiseGradient(p.zx+vec2(13.1+t*0.13,5.4-t*0.19));
      vec3 az=noiseGradient(p.xy+vec2(2.9-t*0.16,17.2+t*0.14));
      return vec3(az.z-ay.y,ax.z-az.y,ay.z-ax.y)*0.65;
    }
  `,ce=`
    vec3 flameErosion(vec2 uv,float t,float seed){
      vec2 p=vec2(uv.x+uv.y*0.65,uv.y);
      float warp=noise2(p*vec2(3.1,2.7)+vec2(seed,t*-0.31));
      p.x+=(warp-0.5)*0.6;
      float broad=noise2(p*vec2(4.0,2.2)+vec2(seed*3.7,-t*0.85));
      float fine=noise2(p*vec2(10.5,5.0)+vec2(seed*7.1,-t*1.35));
      float erosion=broad*0.72+fine*0.28;
      float interior=1.0-abs(uv.x*2.0-1.0);
      float shape=interior-(1.0-erosion)*0.67;
      float aa=max(fwidth(shape)*0.8,0.018);
      float mask=smoothstep(-aa,aa+0.07,shape);
      float heat=clamp(shape*0.9+broad*0.25,0.0,1.0);
      float edge=exp(-abs(shape)*24.0)*smoothstep(0.28,0.58,erosion);
      return vec3(mask,heat,edge);
    }
    vec3 flameColor(vec3 tint,float heat){
      vec3 c=mix(tint*0.065,tint*1.35,smoothstep(0.06,0.48,heat));
      return mix(c,tint*1.6+vec3(1.0,0.85,0.50),smoothstep(0.48,0.84,heat));
    }
  `,le=`
    vec2 smokeOptics(vec2 q,vec2 densityGradient,float density,vec3 lightDir){
      float dome=sqrt(max(0.015,1.0-dot(q,q)));
      vec3 n=normalize(vec3(q-densityGradient*0.13,dome));
      float wrap=clamp(dot(n,lightDir)*0.7+0.3,0.0,1.0);
      float thickness=dome*(0.3+density*1.1);
      float transmission=exp(-thickness*1.7);
      float rim=pow(1.0-dome,2.0)*wrap*0.20;
      return vec2((0.16+wrap*0.70)*mix(0.55,1.0,transmission)+rim,1.0-exp(-thickness*1.8));
    }
  `,J=`
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  `,ue=`
    varying vec2 vUv;
    void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}
  `;function Y(e,n=ue,a={},s=!0,c={}){let l=new t.ShaderMaterial({uniforms:{...A,...V,...a},defines:{KIND:r,VARIANT:i,TOON:+!!o,...c},vertexShader:`uniform float uSize;
`+n,fragmentShader:`uniform float uDetail;
`+(o?`
    float styleStep(float edge,float value){float aa=max(fwidth(value),.012);return smoothstep(edge-aa,edge+aa,value);}
    vec3 styleColor(vec3 tint,float light){
      vec3 c=mix(tint*.22,tint*.72,styleStep(.38,light));
      return mix(c,mix(tint,vec3(1.0),.38)*1.04,styleStep(.70,light));
    }
    vec3 styleHeat(vec3 tint,float heat){
      vec3 c=mix(tint*.24,tint*1.05,styleStep(.38,heat));
      return mix(c,mix(tint,vec3(1.0,.88,.51),.62),styleStep(.70,heat));
    }
  `:``)+e,transparent:!0,depthWrite:!1,side:t.DoubleSide,blending:s&&!o?t.AdditiveBlending:t.NormalBlending});return S.add(l),l}function X(e,n,r=1){x.add(e);let i=new t.Mesh(e,n);return i.frustumCulled=!1,i.renderOrder=r,c.add(i),i}function de(e){return e.blending=t.CustomBlending,e.blendSrc=t.OneFactor,e.blendDst=t.OneMinusSrcAlphaFactor,e}function Z(n,r,i,a,o=1){let s=new t.InstancedBufferGeometry;n.index&&s.setIndex(n.index.clone());for(let e of Object.keys(n.attributes))s.setAttribute(e,n.attributes[e].clone());n.dispose();let c=new Float32Array(r*4),l=(e.seed??((e.index??0)+1)*9187)+C.length*311;for(let e=0;e<c.length;e++)l=l*1664525+1013904223>>>0,c[e]=l/4294967296;return s.setAttribute(`seed`,new t.InstancedBufferAttribute(c,4)),C.push({geometry:s,weight:i,maximum:r}),X(s,a,o)}let fe=`
    attribute vec4 seed;
    uniform float uStopTime,uEndDuration,uQuantity,uSpread;
    uniform float uTime;
    uniform float uStretch;
    varying vec2 vUv;
    varying float vAlpha;
    varying float vSeed;
    varying float vLife;
    varying float vLight;
    ${G}
    ${q}
    varying vec3 vKeyLight;
    void main(){
      vKeyLight=normalize(mat3(viewMatrix)*vec3(-0.45,0.8,0.55));
      vUv=uv;vSeed=seed.w;vLight=1.0;
      float t=uTime,a=seed.x*PI*2.0,r=sqrt(seed.z);
      float life=fract(seed.y+t*0.35);
      vec3 p=vec3(0.0);vec2 shape=vec2(1.0);
      float size=0.05+seed.w*0.06;
      vAlpha=0.8;vLife=life;
      #if CLOUD == 1
        #if KIND == 3
          float age=clamp(t/2.8,0.0,1.0);
          float rise=1.0-exp(-t*4.0);
          float crown=step(0.35,seed.y);
          float expansion=(0.25+rise*1.2)*(0.25+seed.z*0.75);
          p=vec3(cos(a)*expansion*crown,-1.36+rise*(0.5+seed.y*2.45)+age*0.3,sin(a)*expansion*crown);
          p.xz+=vec2(sin(t*1.5+a),cos(t*1.7+a))*age*0.25;
          size=(0.3+rise*0.85)*(0.6+seed.w*0.7);
          vAlpha=smoothstep(0.02,0.18,t)*pow(1.0-age,1.2)*0.72;
          vLife=age;vLight=max(0.0,1.0-t*0.65)*(1.0-crown*seed.y*0.5);
          #if VARIANT == 1
            p=vec3(cos(a)*r*(0.3+age*1.5),-1.3+rise*(seed.y*0.6)+age*0.4,sin(a)*r*(0.3+age*1.5));size*=0.6;vAlpha*=0.28;
            #if TOON == 1
              float expand=smoothstep(.02,.34,t);p=vec3(cos(a)*r*expand*2.2,-1.24+seed.y*.35*expand,sin(a)*r*expand*2.2);p.y=-1.2+(p.y+1.2)*uSize;p.xz*=uSize;
              size=.6+seed.w*.8;shape=vec2(1.4,.65);vAlpha=smoothstep(.01,.13,t)*(1.0-smoothstep(.3,.85,t))*.12;
            #endif
          #elif VARIANT == 2
            float front=(1.0-exp(-t*2.3))*2.55;float scatter=front*(0.35+seed.z*0.7);p=vec3(cos(a)*scatter,-1.35+sin(age*PI)*(0.12+seed.y*0.40),sin(a)*scatter);size*=0.65;shape=vec2(1.7,0.65);vAlpha*=0.42;
          #elif VARIANT == 3
            p.xz*=1.5;p.y=-1.3+age*0.6+seed.y*0.35;size*=0.75;vAlpha*=0.55;
          #endif
        #else
          float h=uStopTime<0.0?fract(seed.y+t*0.15):min(1.0,fract(seed.y+uStopTime*0.15)+(t-uStopTime)/uEndDuration);
          float spread=0.18+pow(h,0.8)*0.7;
          p=vec3(cos(a+h*4.0)*r*spread+sin(h*5.0+t*0.4)*0.25,h*3.5-1.4,sin(a+h*4.0)*r*spread);
          size=(0.48+h*0.95)*(0.75+seed.w*0.45);
          vAlpha=sin(h*PI)*0.5;vLife=h;
          #if VARIANT == 1
            p=vec3(cos(a+t*0.08)*r*2.0,-1.12+seed.y*0.45,sin(a+t*0.08)*r*1.6);
            size=0.9+seed.w*1.0;shape=vec2(1.5,0.6);vAlpha=0.23;vLife=seed.y;
          #elif VARIANT == 2
            h=uStopTime<0.0?fract(seed.y+t*0.48):min(1.0,fract(seed.y+uStopTime*0.48)+(t-uStopTime)/uEndDuration);
            p=vec3(cos(a+h*7.0)*h*h*0.85,h*3.6-1.4,sin(a+h*7.0)*h*h*0.65);
            size=0.18+h*0.9;shape=vec2(1.0,1.25);vAlpha=sin(h*PI)*0.34;vLife=h;
          #elif VARIANT == 3
            float age=clamp(t/3.5,0.0,1.0),expand=1.0-exp(-t*3.2);
            p=vec3(cos(a)*r*expand*1.55,-0.8+seed.y*expand*1.6+age*0.6,sin(a)*r*expand*1.55);
            size=(0.3+expand*0.85)*(0.6+seed.w*0.6);
            vAlpha=smoothstep(0.0,0.15,t)*pow(1.0-age,1.5)*0.6;vLife=age;
          #endif
        #endif
      #else
        #if KIND == 0
          life=fract(seed.y+t*0.65);
          p=vec3(0.85-life*3.6,sin(a)*r*(0.05+life*0.38),cos(a)*r*(0.05+life*0.38));
          size=0.04+seed.w*0.1;vAlpha=pow(1.0-life,1.5);shape=vec2(2.6,0.6);
          #if VARIANT == 0
            p=vec3(0.65-life*(2.8+seed.z*0.7),sin(a)*r*(0.16+life*0.50),cos(a)*r*(0.16+life*0.50));p.y+=sin(life*9.0-t*5.0+a)*life*0.24;size=0.018+seed.w*0.052;vAlpha=sin(life*PI)*pow(1.0-life,1.2)*0.65;shape=vec2(2.3,0.45);
          #elif VARIANT == 1
            p.yz*=0.9;shape=vec2(4.8,0.3);p.yz+=vec2(cos(a),sin(a))*sin(life*PI)*0.14;vAlpha*=0.2+0.8*step(0.45,sin(life*24.0+t*12.0+seed.z*9.0));
          #elif VARIANT == 2
            shape=vec2(2.2,0.6);p.yz*=1.25;p.y-=life*life*0.4;size*=0.42;vAlpha*=0.35+0.35*pow(max(0.0,sin(t*4.0+seed.z*31.0)),6.0);
          #else
            float spiral=life*12.0-t*3.0+(uQuantity==3.0?floor(seed.x*3.0)*2.094:floor(seed.x*uQuantity)*6.283185307/uQuantity);
            p.yz=vec2(cos(spiral),sin(spiral))*((0.26*mix(uSize,1.0,smoothstep(0.0,0.35,life))+life*0.16)*uSpread)+p.yz*0.07;
            shape=vec2(2.0,0.6);
          #endif
        #elif KIND == 1
          float phase=fract(seed.y+t*1.7);
          if(seed.x<0.26){
            p=vec3(-2.4+phase*0.45/uStretch,cos(a)*phase*0.4,sin(a)*phase*0.4);
            vAlpha=1.0-phase;size=0.04;shape=vec2(2.0,0.65);
          }else if(seed.x>0.58){
            float spread=phase*(0.3+seed.z*0.8);
            p=vec3(2.4-phase*(0.2+seed.w*0.65)/uStretch,cos(a)*spread,sin(a)*spread);
            vAlpha=pow(1.0-phase,1.3);shape=vec2(1.0,3.0);size=0.025+seed.w*0.045;
          }else{
            p=vec3((phase-0.5)*4.8,cos(a+t*4.0)*0.12*r,sin(a+t*4.0)*0.12*r);
            vAlpha=0.6;shape=vec2(2.7,0.5);
          }
          #if VARIANT == 2
            float cycle=t,charge=min(cycle/1.52,1.0),release=smoothstep(1.52,1.60,cycle);
            if(seed.x<0.58){float incoming=fract(seed.y+t*(0.45+charge*0.6));float radius=(1.0-incoming)*(0.35+seed.z*0.75);float angle=a-t*2.0;p=vec3(-2.4-(1.0-incoming)*0.7/uStretch,cos(angle)*radius*uSize,sin(angle)*radius*uSize);vAlpha=sin(incoming*PI)*(0.25+charge*0.75)*(1.0-release*0.4);shape=vec2(2.2,0.5);}
            else{vAlpha*=release;size*=0.7+release*0.6;p.yz*=1.0+release*0.35;}
          #elif VARIANT == 3
            // Short, staggered needles leave the electrodes; density never removes the main current.
            float end=seed.x<.32?-1.0:1.0;
            phase=fract(seed.y+t*(1.1+seed.w*.8));
            float travel=phase*(.45+seed.z*.75)*uSize;
            p=vec3(end*2.4-end*travel*.28/uStretch,cos(a)*travel,sin(a)*travel);
            size=(.025+seed.z*.045)*uSize;shape=vec2(.38,4.2);
            vAlpha=pow(1.0-phase,2.0)*smoothstep(.0,.055,phase)*(1.0-step(.10,seed.w));
          #endif
      #elif KIND == 2
          float spin=a+t*0.15;
          p=vec3(cos(spin)*r*1.85,life*1.4,sin(spin)*r*1.85);
          vAlpha=sin(life*PI)*0.55;size=0.04+seed.w*0.055;
          #if VARIANT == 1
            p.y=life*(0.3+r*0.7);p.xz+=vec2(sin(t*2.0+a),cos(t*2.3+a))*life*0.12;shape=vec2(0.8,3.6);size=0.07+seed.w*0.10;
          #elif VARIANT == 2
            p.y=0.08+life*0.4;p.xz*=0.88+0.12*sin(life*PI);shape=vec2(1.0);vAlpha*=0.5+0.5*pow(max(0.0,sin(t*2.0+seed.z*29.0)),4.0);
          #elif VARIANT == 3
            p=vec3(cos(spin)*sin(seed.y*PI*0.5),cos(seed.y*PI*0.5),sin(spin)*sin(seed.y*PI*0.5))*1.85;
            vAlpha=0.25+0.2*sin(t*2.0+seed.z*6.0);
          #endif
        #elif KIND == 3
          float age=clamp(t/2.8,0.0,1.0);
          float dt=max(0.0,t-seed.w*0.1);
          float speed=0.4+seed.z*1.6;
          p=vec3(cos(a)*speed*dt,-1.35+(2.5+seed.y*3.3)*dt-2.5*dt*dt,sin(a)*speed*dt);
          p.y=max(-1.36,p.y);vAlpha=pow(1.0-age,1.7)*0.65;size=0.018+seed.w*0.045;shape=vec2(0.6,2.5);
          #if VARIANT == 1
            float ray=floor(seed.x*8.0)/8.0*PI*2.0;p=vec3(cos(ray)*dt*speed*0.8,-1.35+dt*(3.0+seed.y*3.5),sin(ray)*dt*speed*0.8);shape=vec2(0.3,6.0);vAlpha*=1.0-smoothstep(0.35,1.25,t);
            #if TOON == 1
              vec3 discharge=normalize(vec3(cos(a),.6+seed.y*1.8,sin(a)));
              p=discharge*(.15+(1.0-exp(-dt*4.0))*(.8+seed.z*2.4))*uSize;p.y-=1.2;vAlpha*=1.0-step(.16,seed.w);
              shape=vec2(3.2,.3);size*=uSize;vAlpha*=smoothstep(.06,.13,t);
            #endif
          #elif VARIANT == 2
            p.xz*=1.7;p.y=-1.35+(1.2+seed.y*2.2)*dt-2.5*dt*dt;p.y=max(-1.36,p.y);size*=0.8;shape=vec2(1.0);vAlpha*=0.4;
          #elif VARIANT == 3
            size*=0.85;shape=vec2(0.7,1.8);
          #endif
        #elif KIND == 4
          float h=uStopTime<0.0?fract(seed.y+t*.3):min(1.0,fract(seed.y+uStopTime*.3)+(t-uStopTime)*.55),spin=h*9.6-t*5.28+a;
          float radius=0.09+pow(h,1.45)*1.05+pow(h,4.0)*0.65;
          #if TOON == 1
            radius+=.22*(1.0-smoothstep(.08,.55,h));
          #endif
          p=vec3(cos(spin)*radius,h*3.6-1.4,sin(spin)*radius);
          p.x+=sin(h*2.6+t*0.5)*h*0.35;
          size=0.025+seed.w*0.04;shape=vec2(4.0,0.45);vAlpha=sin(h*PI)*0.5;
          #if VARIANT == 0
            shape=vec2(7.0,0.23);size*=0.8;vAlpha*=0.65;
          #elif VARIANT == 1
            radius+=seed.z*0.4;p.xz=vec2(cos(spin),sin(spin))*radius;size=0.012+seed.w*0.035;shape=vec2(1.0,0.8);vAlpha*=0.75;
          #elif VARIANT == 2
            spin=a-t*2.4;float drift=pow(h,3.0)*(0.3+seed.z*0.8);p=vec3(cos(spin)*(radius+drift),h*3.8-1.4,sin(spin)*(radius+drift));size=0.016+seed.w*0.04;shape=vec2(0.8,2.7);vAlpha=sin(h*PI)*(0.45+0.45*sin(t*13.0+seed.z*19.0));
          #else
            h=floor(seed.y*6.0)/6.0+0.08;spin=a-t*2.4;radius=0.15+pow(h,1.2)*1.8;p=vec3(cos(spin)*radius,h*3.5-1.4+sin(spin*3.0)*0.07,sin(spin)*radius);size=0.018+seed.w*0.03;shape=vec2(1.0);vAlpha=0.25+pow(max(0.0,sin(seed.z*20.0+t*3.0)),4.0)*0.6;
          #endif
        #endif
      #endif
      #if KIND == 4 || KIND == 5
        vec3 field=curlFlow(vec3(p.x,p.y+1.4,p.z)*1.1,t);
        p+=field*(KIND==4?0.12:0.16)*smoothstep(0.0,0.25,p.y+1.4);
      #endif
      #if CLOUD == 1
        size*=uSize;
      #endif
      #if KIND == 4
        p.xz*=uSize;p.y=(p.y+1.4)*uSize-1.4;
      #endif
      vLife=clamp(vLife,0.0,1.0);
      vec4 mv=modelViewMatrix*vec4(p,1.0);
      float scale=length(modelMatrix[1].xyz);
      #if KIND == 0 && VARIANT == 2
        float spin=t*(1.0+seed.z*3.0)+a;vec3 shard=position*vec3(2.0,.55,.65)*size;
        shard.xy=mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*shard.xy;
        mv=modelViewMatrix*vec4(p+shard,1.0);
      #elif TOON == 1 && KIND == 3 && VARIANT == 1 && CLOUD == 0
        vec3 direction=normalize(vec3(cos(a),.6+seed.y*1.8,sin(a)));
        vec2 along=normalize((modelViewMatrix*vec4(direction,0.0)).xy+vec2(.0001));
        mv.xy+=(along*position.x*shape.x+vec2(-along.y,along.x)*position.y*shape.y)*size*scale;
      #elif KIND == 4
        vec2 tangent=normalize((modelViewMatrix*vec4(-sin(spin),0.1,cos(spin),0.0)).xy);vec2 crossFlow=vec2(-tangent.y,tangent.x);
        mv.xy+=(tangent*position.x*shape.x+crossFlow*position.y*shape.y)*size*scale;
      #else
        mv.xy+=position.xy*size*shape*scale;
      #endif
      gl_Position=projectionMatrix*mv;
    }
  `,pe=`
    uniform vec3 uColor;uniform float uTime;
    varying vec2 vUv;varying float vAlpha;varying float vSeed;varying float vLife;varying float vLight;
    ${G}${q}${le}${ce}
    ${r===0?K:``}
    varying vec3 vKeyLight;
    void main(){
      vec2 q=vUv*2.0-1.0;float d=length(q);
      #if !(KIND == 0 && VARIANT == 2)
        if(d>1.0)discard;
      #endif
      float alpha=exp(-d*d*5.0)*(1.0-smoothstep(0.65,1.0,d));
      vec3 color=mix(uColor,vec3(1.0),pow(1.0-d,8.0)*0.35);
      #if CLOUD == 1
        vec2 original=q;
        float angle=vSeed*6.28+uTime*0.18;
        mat2 rotation=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));q=rotation*q;
        vec3 coarse=noiseGradient(q*2.8+vec2(vSeed*17.0,-uTime*0.18));
        #if TOON == 1
          vec3 fine=coarse;
        #else
          vec3 fine=noiseGradient(q*5.7+vec2(vSeed*31.0,-uTime*0.31));
        #endif
        float n=coarse.x*0.72+fine.x*0.28;
        vec2 gradient=mat2(cos(angle),sin(angle),-sin(angle),cos(angle))*(coarse.yz*2.8*0.72+fine.yz*5.7*0.28);
        float puff=1.0-smoothstep(0.43,1.0,d+(n-0.5)*0.43);
        float body=smoothstep(0.14,0.76,n+(1.0-d)*0.55);
        vec2 optics=smokeOptics(original,gradient,n,vKeyLight);
        float light=optics.x;
        color=uColor*light*1.15;
        alpha=puff*body*optics.y*1.35;
        #if KIND == 3
          float hot=vLight*(0.4+body*0.6);
          #if VARIANT == 0
            color=mix(uColor*(0.06+light*0.13),uColor*(1.8+hot*2.4)+vec3(pow(hot,3.0)*0.8),smoothstep(0.10,0.65,hot));
          #elif VARIANT == 1
            color=mix(uColor*0.35,uColor*1.7,hot);
          #elif VARIANT == 2
            color=uColor*(0.10+light*0.85);
          #else
            color=uColor*(0.18+light*0.95);
          #endif
        #else
          #if VARIANT == 2
            color=uColor*(0.40+light*0.65);
          #endif
        #endif
        #if TOON == 1
          color=styleColor(uColor,.20+light*.65+n*.18);
          alpha=(1.0-smoothstep(.68,.98,d+(n-.5)*.35))*smoothstep(.18,.42,n+(1.0-d)*.35)*.82;
          #if VARIANT == 0
            color=mix(styleColor(uColor*.28,light),styleHeat(uColor,hot*.65+n*.3),smoothstep(.10,.65,hot));
            #if KIND == 3
              color=mix(vec3(.04,.05,.065),vec3(.20,.22,.25),clamp(light,0.0,1.0));
            #endif
          #elif VARIANT == 1
            alpha=exp(-d*d*5.0)*(1.0-smoothstep(.7,1.0,d));color=uColor*(.6+body*.4);
          #endif
        #endif
      #elif KIND == 2
        #if VARIANT == 0
          float crossShape=min(max(abs(q.x)-0.20,abs(q.y)-0.66),max(abs(q.x)-0.66,abs(q.y)-0.20));
          alpha=1.0-smoothstep(-0.02,0.08,crossShape);color=uColor*1.2;
        #elif VARIANT == 1
          vec3 burn=flameErosion(vec2(vUv.x,vUv.y*1.3),uTime*1.8,vSeed*9.0);
          alpha=burn.x*pow(max(0.0,1.0-vUv.y),0.7)*smoothstep(0.0,0.2,vUv.y);color=flameColor(uColor,burn.y*0.7+(1.0-vUv.y)*0.3);
        #elif VARIANT == 2
          float a=atan(q.y,q.x);float spoke=pow(abs(cos(a*3.0)),28.0);
          alpha=(spoke*(1.0-smoothstep(0.4,0.85,d))+exp(-d*d*45.0))*0.85;
        #else
          alpha=band(max(abs(q.x),abs(q.y))-0.52,0.07);color=uColor*1.3;
        #endif
      #elif KIND == 0 && VARIANT == 3
        alpha=band(abs(q.x)+abs(q.y)-0.64,0.05)+exp(-d*d*35.0)*0.4;
      #elif KIND == 0 && VARIANT == 2
        alpha=0.8;color*=0.35+0.65*vUv.y;
      #elif (KIND == 3 && VARIANT == 3) || (KIND == 4 && VARIANT == 3)
        alpha=1.0-smoothstep(0.7,1.0,abs(q.x)+abs(q.y));
        color*=0.7+step(q.x,0.0)*0.5;
      #endif
      #if KIND == 0
        color=toonShade(uColor,.46+(1.0-d)*.4);
      #endif
      #if TOON == 1 && CLOUD == 0
        color=styleColor(uColor,.28+(1.0-d)*.5+vLight*.1);
        #if KIND == 3 && VARIANT == 1
          alpha=exp(-q.y*q.y*35.0)*(1.0-smoothstep(.6,1.0,abs(q.x)));color=uColor*1.3+vec3(pow(1.0-d,3.0)*1.4);
        #elif KIND == 4 && VARIANT == 1
          color=styleColor(uColor*.55,.3+vSeed*.5);
        #elif (KIND == 3 && VARIANT == 0) || (KIND == 4 && VARIANT == 2)
          color=styleHeat(uColor,.50+(1.0-d)*.35);
        #endif
      #endif
      gl_FragColor=vec4(color,alpha*vAlpha*uDetail);
      ${J}
    }
  `;function me(){let n={"3:4":0,"0:4":1,"2:4":2,"3:5":3,"1:4":4,"2:5":5,"2:6":6,"0:5":7,"3:6":8,"2:7":9,"3:7":10,"0:6":11,"2:8":12}[`${r}:${i}`];if(n===void 0)throw Error(`Unsupported effect variant: ${r}:${i}`);let a=[],o=Math.PI*2;function c(e,n=0,r=0,i=-1){let o=e.attributes.position.count;return e.setAttribute(`aPart`,new t.Float32BufferAttribute(new Float32Array(o).fill(n),1)),e.setAttribute(`aPhase`,new t.Float32BufferAttribute(new Float32Array(o).fill(r),1)),e.setAttribute(`aUnit`,new t.Float32BufferAttribute(new Float32Array(o).fill(i),1)),a.push(e),e}function l(e,n=32,r=8,i=0,a=0,o=-1){let s=[],l=[],u=[];for(let t=0;t<=n;t++)for(let i=0;i<=r;i++)s.push(...e(t/n,i/r)),l.push(t/n,i/r);for(let e=0;e<n;e++)for(let t=0;t<r;t++){let n=e*(r+1)+t,i=n+r+1;u.push(n,i,n+1,n+1,i,i+1)}let d=new t.BufferGeometry;return d.setAttribute(`position`,new t.Float32BufferAttribute(s,3)),d.setAttribute(`uv`,new t.Float32BufferAttribute(l,2)),d.setIndex(u),d.computeVertexNormals(),c(d,i,a,o)}function u(e,n=.035,r=24,i=5,a=0,s=0,c=-1){return l((r,i)=>{let a=new t.Vector3(...e(r)),s=new t.Vector3(...e(Math.min(1,r+.001))).sub(new t.Vector3(...e(Math.max(0,r-.001)))).normalize(),c=new t.Vector3().crossVectors(s,Math.abs(s.y)>.9?new t.Vector3(1,0,0):new t.Vector3(0,1,0)).normalize(),l=new t.Vector3().crossVectors(s,c),u=typeof n==`function`?n(r):n;return a.addScaledVector(c,Math.cos(i*o)*u).addScaledVector(l,Math.sin(i*o)*u),a.toArray()},r,i,a,s,c)}function d(e,n,r,i,a,o,s=0,l=0,u=-1){let d=new t.OctahedronGeometry(1);return d.scale(i,a,o),d.rotateZ(s),d.translate(e,n,r),c(d,l,s,u)}if(n===0){for(let e=0;e<10;e++)l((t,n)=>[t,n,e],e<3?28:16,e<3?16:10,0,e,e);for(let e=0;e<12;e++)l((t,n)=>[t,n,e],1,1,2,e,Math.floor(e*5/12))}else if(n===1){l((e,t)=>{let n=e*o,r=t*o,i=.65+.16*Math.cos(r);return[i*Math.cos(n),i*Math.sin(n),.13*Math.sin(r)]},56,8);for(let e=0;e<9;e++){let t=e*o/9,n=.8;d(Math.cos(t)*n,Math.sin(t)*n,.02,.12,.19+e%3*.035,.13,t-Math.PI/2)}}else if(n===2){for(let e=-2;e<=2;e++)u(t=>[t*2.6-1.3,.08,e*.65],.018,2,4),u(t=>[e*.65,.08,t*2.6-1.3],.018,2,4);for(let e=0;e<18;e++){let[t,n]=e<9?[(e%3-1)*.85,(Math.floor(e/3)-1)*.85]:[[.425,.425],[-.425,.425],[.425,-.425],[-.425,-.425],[0,.425],[0,-.425],[.425,0],[-.425,0],[.425,.85]][e-9];d(t,.45+e%3*.22,n,.09,.15,.09,e*.6,1,e),u(r=>[t+Math.cos(r*o)*.24,.42+e%3*.22,n+Math.sin(r*o)*.24],.018,4,4,1,e*.6,e)}}else if(n===3){for(let e=34;e>=0;e--){let n=e<3?96:e<11?40:e<23?48:20,r=[],i=[],a=[];for(let t=0;t<n;t++){let o=r.length/3;for(let[a,o]of[[0,0],[1,0],[0,1],[1,1]])r.push(t/n,(t+1)/n,e),i.push(a,o);a.push(o,o+1,o+2,o+2,o+1,o+3)}let o=new t.BufferGeometry;o.setAttribute(`position`,new t.Float32BufferAttribute(r,3)),o.setAttribute(`uv`,new t.Float32BufferAttribute(i,2)),o.setIndex(a),o.computeVertexNormals(),c(o,e<3?0:e<11?1:2,e)}for(let e=0;e<2;e++)l((e,t)=>[e-.5,t-.5,0],1,1,3,e);l((e,t)=>[e-.5,0,t-.5],1,1,4,0),l((e,t)=>[e-.5,0,t-.5],1,1,5,0)}else if(n===4){for(let[e,t]of[[.042,0],[.11,2]])l((t,n)=>{let r=n*o;return[t*4.8-2.4,Math.cos(r)*e,Math.sin(r)*e]},32,10,t);for(let e of[-1,1]){u(t=>[e*2.4,Math.cos(t*o)*.42,Math.sin(t*o)*.42],.012,48,4,1,e);for(let t=0;t<7;t++)l((n,r)=>{let i=t*o/7,a=.08+n*(e<0?.58:.85),s=Math.sin(n*Math.PI)*.12*Math.sin(r*Math.PI),c=Math.cos(r*Math.PI);return[e*2.4+Math.sin(n*Math.PI)*.22,Math.cos(i)*a-Math.sin(i)*s*c,Math.sin(i)*a+Math.cos(i)*s*c]},18,6,1,t+e*.1)}}else if(n===5)for(let e=0;e<6;e++){let t=e*o/(e<3?3:6);u(e=>{let n=t+e*2.7,r=.4+Math.sin(e*Math.PI)*.8;return[Math.cos(n)*r,.12+Math.sin(e*Math.PI)*1.65,Math.sin(n)*r]},e=>.045+.035*Math.sin(e*Math.PI),36,6,1,e*2.1,e)}else if(n===6){for(let e=0;e<8;e++){let t=e*o/(e<4?4:8);u(e=>{let n=.8+Math.sin(e*3.8)*.3,r=t+e*1.7;return[Math.cos(r)*n,e*1.65,Math.sin(r)*n]},e=>.065*(1-e*.6),30,6,1,e,e);for(let n=0;n<3;n++){let r=.35+n*.43,i=t+r,a=1.05;l((e,t)=>{let n=Math.sin(e*Math.PI)*.18*(t*2-1),o=e*.55;return[Math.cos(i)*(a+o)-Math.sin(i)*n,r+Math.sin(e*2.5)*.25+Math.abs(n)*.3,Math.sin(i)*(a+o)+Math.cos(i)*n]},10,4,2,e,e),d(Math.cos(i)*.94,r,Math.sin(i)*.94,.08,.2,.08,e,2,e)}}for(let e=0;e<7;e++){let t=e*o/7;l((e,n)=>{let r=.12+e*.55,i=Math.sin(e*Math.PI)*.18*(n*2-1);return[Math.cos(t)*r-Math.sin(t)*i,.65+e*.3+n*(1-n)*.15,Math.sin(t)*r+Math.cos(t)*i]},10,4,3,e)}}else if(n===7)for(let e=0;e<4;e++)l((e,t)=>{let n=(e-.5)*4.9,r=t*o,i=.72+Math.cos(r)*Math.sin(e*Math.PI)*.18;return[Math.sin(n)*i,Math.cos(n)*i-.2,Math.sin(r)*.16*Math.sin(e*Math.PI)]},40,6,e,e*.5);else if(n===8){l((e,t)=>[e,t,0],64,20,0,0),l((e,t)=>[e,.37+t*.26,0],64,4,1,0);for(let e=0;e<12;e++)l((t,n)=>[t,n,e],1,1,2,e)}else if(n===9){for(let e=0;e<6;e++)l((t,n)=>[t,n,e],24,10,1,e,e%3);for(let e=3;e<6;e++)l((t,n)=>[t,n,e],24,10,1,e,e),l((t,n)=>[t,n,e+6],24,10,1,e+6,e)}else if(n===10){for(let e=0;e<3;e++){let t=e*o/3;u(e=>{let n=e*o,r=Math.cos(n)*1.4,i=Math.sin(n)*.8;return[r*Math.cos(t),i,r*Math.sin(t)]},.022,64,4,0,e)}let e=[];for(let t=0;t<12;t++){let n=t*2.4,r=.75+t%3*.25,i=[Math.cos(n)*r,Math.sin(t*1.8)*.8,Math.sin(n)*r];e.push(i),d(...i,.07,.13,.07,n,1),t&&u(n=>e[t-1].map((e,t)=>e+(i[t]-e)*n),.012,2,3,1,t)}for(let e=0;e<20;e++){let t=e*2.4;u(n=>[Math.cos(t)*n*2.1,Math.sin(e*2)*n*1.7,Math.sin(t)*n*2.1],e=>.055*Math.sin(e*Math.PI),12,4,2,e*.5,e)}}else if(n===11)for(let e=0;e<7;e++)l((t,n)=>{let r=t*(3.2+e%3*.45)+e*2.39996,i=n*o,a=.025+.46*Math.sin(t*Math.PI*.85)**1.2,s=Math.sin(t*Math.PI)*(.026+e%3*.013);return[.98-t*(1.6+e%3*.35),Math.cos(r)*(a+Math.cos(i)*s),Math.sin(r)*(a+Math.cos(i)*s)+Math.sin(i)*s]},24,6,0,e);else if(n===12)for(let e=0;e<14;e++){let n=e*2.4,r=e?.55+e%2*.35:0,i=new t.SphereGeometry(.24+e%3*.07,16,10,0,o,0,Math.PI*.5);i.translate(Math.cos(n)*r,.04,Math.sin(n)*r),c(i,1,e*1.4,e)}function f(){let e={position:[],normal:[],uv:[],aPart:[],aPhase:[],aUnit:[]},n=[],r=0;for(let t of a){for(let n of Object.keys(e))e[n].push(...t.attributes[n].array);if(t.index)for(let e of t.index.array)n.push(e+r);else for(let e=0;e<t.attributes.position.count;e++)n.push(e+r);r+=t.attributes.position.count,t.dispose()}a.length=0;let i=new t.BufferGeometry;for(let[n,r]of Object.entries(e))i.setAttribute(n,new t.Float32BufferAttribute(r,n===`position`||n===`normal`?3:n===`uv`?2:1));return i.setIndex(n),i}let p=e.burst?`float life=clamp(uTime/${e.duration.toFixed(1)},0.0,1.0);float alive=smoothstep(0.0,.025,life)*(1.0-smoothstep(.70,1.0,life));`:`float life=0.0;float alive=1.0;`,m=`uniform float uRetire,uOpening,uStopTime,uQuantity;varying float vPart;attribute float aPart;attribute float aPhase;attribute float aUnit;uniform float uTime;uniform float uStretch;varying vec2 vUv;varying vec3 vN;varying vec3 vP;varying float vFade;varying float vPhase;varying float vSandMass;${G}
      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
      #if SPELL == 3
        varying vec2 vStroke;varying float vHalfLength;
        float lightningNoise(float h,float cells,float seed){float f=h*cells,i=floor(f);return mix(hash(vec2(i,seed)),hash(vec2(i+1.0,seed)),fract(f))*2.0-1.0;}
        vec3 thunderMain(float h){float f=floor(uTime*18.0);vec2 bend=vec2(lightningNoise(h,7.0,f),lightningNoise(h,6.0,f+17.0))*.42+vec2(lightningNoise(h,83.0,f+31.0),lightningNoise(h,79.0,f+49.0))*.045;return vec3(bend.x*sin(h*PI),4.05-h*5.4,bend.y*sin(h*PI));}
        vec3 thunderGround(float h,float id){float a=id*2.39996,f=floor(uTime*(13.0+mod(id,3.0)))+id*17.0,j=lightningNoise(h,27.0,f)*sin(h*PI),reach=2.15+hash(vec2(id,7.0))*1.2;return vec3(cos(a)*h*reach,-1.30+sin(h*PI)*(.16+hash(vec2(id,11.0))*.8),sin(a)*h*reach)+vec3(-sin(a),.3,cos(a))*j*.14;}
        vec3 thunderPoint(float h,float id){
          if(id<.5)return thunderMain(h);
          float a=id*2.39996,f=floor(uTime*16.0)+id*17.0,j=lightningNoise(h,31.0,f)*sin(h*PI);
          if(id<2.5)return thunderMain(h)+vec3(cos(a),.12,sin(a))*sin(h*PI)*(.22+.25*sin(h*8.0+id))+vec3(j*.10,0,-j*.08);
          if(id<10.5){float root=(18.0+(id-3.0)*7.0)/96.0,reach=1.2+hash(vec2(id,2.0))*1.5;return thunderMain(root)+vec3(cos(a)*h*reach,-h*(.7+reach*.4),sin(a)*h*reach)+vec3(-sin(a),.3,cos(a))*j*.18;}
          if(id<22.5)return thunderGround(h,id);
          return thunderGround(.5,id-12.0)+vec3(cos(a+.8)*h*.8,sin(h*PI)*.25,sin(a+.8)*h*.8)+vec3(-sin(a),.4,cos(a))*j*.11;
        }
        float lightningPulse(float t,float begin,float end){return smoothstep(begin,begin+.025,t)*(1.0-smoothstep(end-.065,end,t));}
      #endif
      void main(){vUv=uv;vPhase=aPhase;vPart=aPart;vSandMass=1.0;vec3 p=position;vec3 n=normal;${p}vFade=alive;
        // Early clipping also covers branches that replace vFade or return early.
        if(aUnit>=uQuantity){vFade=0.0;vP=vec3(0);vN=vec3(0,1,0);gl_Position=vec4(2,2,2,1);return;}
        #if SPELL == 0
          if(aPart>1.5){
            float seed=fract(aPhase*.618034),age=max(0.0,life-seed*.10),grow=smoothstep(.0,.20,age);
            float lane=mod(aPhase,4.0)-1.5,h=.25+floor(aPhase/4.0)*.22;
            if(abs(uQuantity-5.0)>.1)lane=uQuantity<1.5?0.0:(aUnit/(uQuantity-1.0)*2.0-1.0)*1.5;
            float turn=h*(1.5+age*1.0)+age*.12;
            p=vec3(lane*(.18+h*.64)*grow,-1.25+sin(turn)*1.35*grow+h*.3*grow,(1.0-cos(turn))*.95*grow+age*.65);
            p.y+=smoothstep(.55,.98,age)*.48;p.y=-1.3+(p.y+1.3)*uSize;p.xz*=uSize;
            vec4 mv=modelViewMatrix*vec4(p,1.0);float width=(.15+grow*.66)*(1.0-smoothstep(.62,.99,age)*.55);
            mv.xy+=(uv-.5)*width*uSize*vec2(1.15,1.25)*length(modelMatrix[1].xyz);
            vFade=smoothstep(.0,.07,age)*(1.0-smoothstep(.82,1.0,age));vP=p;vN=normalize(mat3(viewMatrix)*vec3(-.45,.8,.55));gl_Position=projectionMatrix*mv;return;
          }
          float seed=fract(aPhase*.618034),lane=aPhase<3.0?aPhase-1.0:(aPhase-3.5)*1.5;
          if(abs(uQuantity-5.0)>.1)lane=uQuantity<1.5?0.0:aUnit/(uQuantity-1.0)*2.0-1.0;
          float age=max(0.0,life-seed*.10),grow=smoothstep(.0,.20,age),h=uv.x;
          float curl=h*(1.5+age*1.0)+age*.12,bulk=(aPhase<3.0?1.0:.66)*grow;
          float height=bulk*(1.30+seed*.25),width=pow(max(0.0,sin(h*PI)),.65)*(.36+seed*.12)*bulk;
          width*=1.0-smoothstep(.55,.96,age)*.7;
          float around=uv.y*PI*2.0,wrinkle=1.0+sin(h*13.0-age*8.0+around*3.0+aPhase)*.12;
          vec3 center=vec3(lane*(.38+h*.78)*grow,-1.26+sin(curl)*height+h*.3*grow,(1.0-cos(curl))*height*.70+age*.65);
          p=center+vec3(cos(around)*width*wrinkle,-sin(around)*sin(curl)*width*.55,sin(around)*cos(curl)*width*.55);
          p.y+=smoothstep(.60,.95,age)*h*.45;vFade=smoothstep(.0,.04,age)*(1.0-smoothstep(.90,1.0,age));
        #elif SPELL == 1
          p.xy=rot(uTime*4.0)*p.xy;n.xy=rot(uTime*4.0)*n.xy;p.yz=rot(.15*sin(uTime*2.0))*p.yz;
        #elif SPELL == 2
          if(aPart>.5){
            if(abs(uQuantity-9.0)>.1){
              vec2 from=vec2(mod(aUnit,3.0)-1.0,floor(aUnit/3.0)-1.0)*.85;
              if(aUnit>8.5){float e=aUnit-9.0;from=e<.5?vec2(.425,.425):e<1.5?vec2(-.425,.425):e<2.5?vec2(.425,-.425):e<3.5?vec2(-.425,-.425):e<4.5?vec2(0,.425):e<5.5?vec2(0,-.425):e<6.5?vec2(.425,0):e<7.5?vec2(-.425,0):vec2(.425,.85);}
              float columns=ceil(sqrt(uQuantity)),rows=ceil(uQuantity/columns),row=floor(aUnit/columns),inRow=min(columns,uQuantity-row*columns);
              vec2 to=vec2(inRow<1.5?0.0:(mod(aUnit,columns)/(inRow-1.0)*2.0-1.0)*.85,rows<1.5?0.0:(row/(rows-1.0)*2.0-1.0)*.85);p.xz+=to-from;
            }
            p.y+=.18*sin(uTime*1.4+aPhase);float turn=uTime*.18;float angle=(floor(turn)+smoothstep(.25,.75,fract(turn)))*PI*.5;p.xz=rot(angle)*p.xz;if(abs(uQuantity-9.0)>.1)n.xz=rot(angle)*n.xz;
          }
        #elif SPELL == 3
          float h=mix(position.x,position.y,uv.x),id=aPhase,head=clamp((uTime-.08)/.16,0.0,1.0),primary=1.0-smoothstep(.64,.86,uTime);
          if(aPart>3.5){
            float sky=1.0-step(4.5,aPart),growth=smoothstep(0.0,.17,uTime);
            p=position*(sky>0.5?6.2:7.0)*(sky>0.5?.35+growth*.65:.6+smoothstep(.22,.55,uTime)*.4);p.y=sky>0.5?4.05+p.z*.42:-1.32;
            p.y=-1.35+(p.y+1.35)*uSize;p.xz*=uSize;
            vFade=sky>0.5?smoothstep(0.0,.06,uTime)*(1.0-smoothstep(.46,.88,uTime)):lightningPulse(uTime,.22,.85);
            vP=p;vN=vec3(0,1,0);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1);return;
          }
          if(aPart>2.5){
            vFade=id<.5?lightningPulse(uTime,.22,.72)+lightningPulse(uTime,1.02,1.22)*.3+lightningPulse(uTime,1.65,1.83)*.18:lightningPulse(uTime,.015,.65);
            p=vec3(0,-1.35+(id<.5?.13:5.4)*uSize,0);vec4 mv=modelViewMatrix*vec4(p,1);
            mv.xy+=position.xy*(id<.5?4.4:4.8)*uSize*length(modelMatrix[1].xyz);vP=p;vN=vec3(0,0,1);gl_Position=projectionMatrix*mv;return;
          }
          float root=(18.0+(id-3.0)*7.0)/96.0,reveal=step(aPart<.5?h:root,head)*step(.081,uTime);
          vFade=primary*reveal*(id<.5?1.0:id<2.5?.7:.48+.3*hash(vec2(id,floor(uTime*17.0))));
          if(aPart>1.5){float delay=hash(vec2(id,3.0));float growth=clamp((uTime-.17-delay*.025)*8.0,0.0,1.0);
            vFade=lightningPulse(uTime,.23+delay*.035,.72+delay*.15);
            vFade+=lightningPulse(uTime,.96+delay*.18,1.16+delay*.18)*.67+lightningPulse(uTime,1.58+delay*.2,1.78+delay*.2)*.45;
            vFade*=step(h,growth)*(1.0-smoothstep(.7,1.0,h));
          }
          vec3 p0=thunderPoint(position.x,id),p1=thunderPoint(position.y,id);p0.y=-1.35+(p0.y+1.35)*uSize;p1.y=-1.35+(p1.y+1.35)*uSize;p0.xz*=uSize;p1.xz*=uSize;
          vec4 m0=modelViewMatrix*vec4(p0,1),m1=modelViewMatrix*vec4(p1,1);vec2 delta=m1.xy-m0.xy;float len=length(delta);vec2 along=len<.0001?vec2(1,0):delta/len;
          float mid=(position.x+position.y)*.5,width=id<.5?.40:id<2.5?.16:id<10.5?.12:id<22.5?.19:.065;width*=aPart<.5?.5+.5*sin(mid*PI):1.0-mid*.82;width*=uSize*length(modelMatrix[1].xyz);
          vec4 mv=mix(m0,m1,uv.x);mv.xy+=(along*(uv.x*2.0-1.0)+vec2(-along.y,along.x)*(uv.y*2.0-1.0))*width;
          vHalfLength=len/max(width,.00001)*.5;vStroke=vec2((uv.x*2.0-1.0)*(vHalfLength+1.0),uv.y*2.0-1.0);vP=mix(p0,p1,uv.x);vN=vec3(0,0,1);gl_Position=projectionMatrix*mv;return;
        #elif SPELL == 4
          if(aPart<.5||aPart>1.5){p.yz*=.92+.08*sin(uTime*3.0+position.x*4.0);p.yz*=uSize;}else{p.yz=rot(uTime*.35)*p.yz*uSize;p.x=sign(p.x)*2.4+(p.x-sign(p.x)*2.4)*uSize/max(uStretch,.001);}vFade*=smoothstep(0.0,.25,uTime);
        #elif SPELL == 5
          float cycle=fract(uTime*.52+aPhase*.15915),tight=smoothstep(.05,.15,cycle)*(1.0-smoothstep(.38,.83,cycle));
          float release=smoothstep(.0,.66,uRetire),h=uv.x,a=aPhase/2.1*2.094395;
          if(abs(uQuantity-3.0)>.1)a=aUnit*PI*2.0/uQuantity;
          float hook=smoothstep(.70,1.0,h),b=a+h*1.1+hook*(2.7-release*2.1);
          float r=(.28+sin(h*PI)*1.04)*(1.0-tight*.63)+release*h*.85;
          float width=(.062+.045*sin(h*PI))*(1.0-smoothstep(.86,1.0,h)*.7),side=uv.y*PI*2.0;
          p=vec3(cos(b)*(r+cos(side)*width),.06+sin(h*PI)*1.55+hook*.25+sin(side)*width*.35,sin(b)*(r+cos(side)*width));
          p.y*=smoothstep(.0,.85,uOpening);p.y-=release*release*h*.45;
          vFade*=1.0-smoothstep(.62,.98,uRetire);
        #elif SPELL == 6
          float delay=fract(aPhase*.37)*.18;float retract=smoothstep(delay,.95,uRetire);float h=max(0.0,position.y);float root=aPhase*PI*.5;
          if(aUnit>=0.0&&abs(uQuantity-4.0)>.1){float original=aUnit*PI*2.0/(aUnit<3.5?4.0:8.0);root=aUnit*PI*2.0/uQuantity;p.xz=rot(original-root)*p.xz;n.xz=rot(original-root)*n.xz;}
          vec2 leafRadial=normalize(p.xz+vec2(.0001)),base=vec2(cos(root),sin(root))*.8;
          float bend=retract*(1.3+h*1.3),arc=h*max(.12,1.0-retract*.65);p.xz=base+(p.xz-base)*(1.0-retract*.55);
          p.xz+=vec2(cos(root),sin(root))*(1.0-cos(bend))*arc*.45;p.y=max(.025,arc*sin(bend+.001)/(bend+.001));
          if(aPart>1.5){float fold=smoothstep(.0,.7,retract);float attach=.35+floor(max(0.0,h-.35)/.43)*.43;float blade=uv.x*.55;vec2 radial=leafRadial;p.xz-=radial*blade*fold;p.y+=blade*sin(fold*PI*.8)*.35;}
          p.y*=smoothstep(.0,.85,uOpening);vFade*=1.0-smoothstep(.78,1.0,uRetire);
        #elif SPELL == 7
          p.yz=rot(uTime*2.7-aPhase)*p.yz;n.yz=rot(uTime*2.7-aPhase)*n.yz;if(aPart>.5){p.x-=aPart*.45;p.y+=sin(uTime*3.0-aPart)*.12;vFade*=.23*(1.0-aPart*.18);}
        #elif SPELL == 8
          float across=uv.x*2.0-1.0,a=across*1.6;
          float age=max(0.0,life-abs(across)*.12),grow=smoothstep(.0,.15,age),crash=smoothstep(.27,.58,age);
          float height=(.5+pow(max(0.0,1.0-across*across),.6)*.8)*grow;
          height*=1.0+sin(across*12.0-age*7.0)*.14+sin(across*23.0+age*4.0)*.07;
          float theta=position.y*PI*2.0,radial=.85+life*2.2;
          float roll=crash*1.35,yy=(1.0-cos(theta))*height*.5,rr=sin(theta)*(.25+height*.22);
          float y=yy*cos(roll)-rr*sin(roll),r=radial+yy*sin(roll)+rr*cos(roll);
          float breaking=smoothstep(.27+.04*sin(across*9.0),.61+.035*sin(across*13.0),age);
          float crown=pow(max(0.0,sin(position.y*PI)),2.0);y-=breaking*height*.95*crown;r+=breaking*crown*.35;vSandMass=max(0.0,y)/max(.01,height);
          p=vec3(sin(a)*r,-1.3+max(.025,y),cos(a)*r-.5);if(aPart>.5)p.y+=.016;
          n=normalize(vec3(sin(a)*sin(theta+roll),-cos(theta+roll),cos(a)*sin(theta+roll)));
          vFade*=1.0-smoothstep(.42,.67,age);
          if(aPart>1.5){
            float side=(aPhase/11.0)*2.0-1.0,born=.27+abs(side)*.12+sin(aPhase*2.4)*.025,local=max(0.0,life-born),on=smoothstep(.0,.055,local);
            float angle=side*1.6,rr=.85+life*2.2+local*.75;
            p=vec3(sin(angle)*rr,-1.3+max(.035,.82+local*.6-local*local*8.0),cos(angle)*rr-.5);
            p.y=-1.3+(p.y+1.3)*uSize;p.xz*=uSize;
            vec4 mv=modelViewMatrix*vec4(p,1.0);float width=(.42+local*.90)*on;
            mv.xy+=(uv-.5)*width*uSize*length(modelMatrix[1].xyz);vP=p;vN=normalize(mat3(viewMatrix)*vec3(-.45,.8,.55));vFade=on*(1.0-smoothstep(.32,.60,local));gl_Position=projectionMatrix*mv;return;
          }
        #elif SPELL == 9
          float bank=aUnit,origin=uStopTime<0.0?uTime:uStopTime;
          float cycle=fract(origin*.24+bank*.31);if(uRetire>0.0)cycle=min(.999,cycle+uRetire*.9);
          float packet=aUnit<2.5?step(2.5,aPhase):step(5.5,aPhase),side=pow(sin(uv.x*PI),.65);
          float local=clamp((cycle-.10-uv.x*.25)*2.4,0.0,1.0);
          float slide=smoothstep(.02,.88,local),build=smoothstep(.0,.16,cycle);
          float angle=bank*PI*2.0/uQuantity+.32+(uv.x-.5)*1.55;
          if(uQuantity>3.5)angle=bank*PI*2.0/uQuantity+.32+(uv.x-.5)*1.55*3.0/uQuantity;
          float crest=.82-slide*.52,radial=.12+uv.y*1.25;
          float profile=max(0.0,min(uv.y/max(.08,crest),(1.0-uv.y)/(1.0-crest)));
          float scar=exp(-pow((uv.y-crest)*6.0,2.0))*sin(slide*PI);
          float height=profile*side*(.17+build*.25)*(1.0-scar*.85)*(1.0-slide*.55);
          height+=sin(uv.x*19.0+bank)*.025*profile;
          if(packet>.5){radial=.18+(1.0-slide)*.66+(uv.y-.5)*.28;
            height=sin(uv.y*PI)*side*.20*sin(slide*PI);vFade*=sin(slide*PI);}
          p=vec3(cos(angle)*radial,.025+height*smoothstep(.0,.75,uOpening),sin(angle)*radial);
          float sink=smoothstep(.04+uv.y*.30,.86,uRetire);p.xz*=.72*(1.0-sink*(1.0-uv.y)*.85);vSandMass=height*(1.0-sink);p.y=.025+vSandMass;
          n=normalize(vec3(cos(angle)*(uv.y<crest?-1.3:1.0),1.0,sin(angle)*(uv.y<crest?-1.3:1.0)));
          vFade*=1.0-smoothstep(.74,.99,uRetire);
        #elif SPELL == 10
          if(aPart<1.5){float gather=1.0-smoothstep(0.0,.36,life)*.82;p*=gather;p.xz=rot(uTime*(1.0+life*3.0))*p.xz;vFade*=1.0-smoothstep(.35,.50,life);}else{float start=.31+fract(aPhase*.37)*.065;float age=max(0.0,life-start);float release=smoothstep(.0,.08,age);float a=aPhase*4.8;vec3 direction=normalize(vec3(cos(a),sin(aPhase*4.0)*.8,sin(a)));
          if(abs(uQuantity-10.0)>.1){float y=uQuantity<1.5?0.0:((aUnit+.5)/uQuantity*2.0-1.0)*.8;float azimuth=aUnit*2.399963;float radial=sqrt(1.0-y*y);direction=vec3(cos(azimuth)*radial,y,sin(azimuth)*radial);}
          vec3 side=normalize(cross(direction,vec3(0,1,0))),up=cross(direction,side);if(abs(uQuantity-10.0)>.1)n=side*cos(uv.y*PI*2.0)+up*sin(uv.y*PI*2.0);
          float head=exp(-pow((uv.x-.86)*13.0,2.0));float radius=(head*.052+uv.x*.006)*(1.0-smoothstep(.12,.30,age));p=direction*(age*8.0+uv.x*(1.30-age*2.8))+(side*cos(uv.y*PI*2.0)+up*sin(uv.y*PI*2.0))*radius;vFade*=release*(1.0-smoothstep(.15,.34,age));}
        #elif SPELL == 11
          float turn=-uTime*2.4+aPhase*.1;p.yz=rot(turn)*p.yz;n.yz=rot(turn)*n.yz;p.yz*=1.0+.08*sin(uv.x*12.0-uTime*5.0+aPhase);
        #elif SPELL == 12
          if(abs(uQuantity-7.0)>.1){float r=aUnit<.5?0.0:.55+mod(aUnit,2.0)*.35;float angle=(aUnit-1.0)*PI*2.0/max(1.0,uQuantity-1.0);p.xz+=(vec2(cos(angle),sin(angle))-vec2(cos(aUnit*2.4),sin(aUnit*2.4)))*r;}
          float pop=uRetire>0.0?clamp(uRetire*1.55-fract(aPhase*.23)*.3,0.0,1.0):fract(uTime*.24+aPhase*.17);p.y*=.8+sin(pop*PI)*.5;p.y*=smoothstep(.0,.6,uOpening);vFade*=1.0-smoothstep(.91,1.0,pop);
        #endif
        #if SPELL != 4
          #if KIND == 3
            p.y=-1.3+(p.y+1.3)*uSize;p.xz*=uSize;
          #else
            p*=uSize;
          #endif
        #endif
        vP=p;vN=normalize(normalMatrix*n);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
      }`,h=`uniform float uRetire;varying float vPart;uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying vec3 vN;varying vec3 vP;varying float vFade;varying float vPhase;varying float vSandMass;${G}${q}${le}${K}
      #if SPELL == 3
        varying vec2 vStroke;varying float vHalfLength;
      #endif
      void main(){
        #if SPELL == 3
          vec3 cyan=pow(uColor,vec3(.55))*vec3(.65,1.4,1.0);
          if(vPart>3.5){
            vec2 q=vUv*2.0-1.0;float r=length(q),a=atan(q.y,q.x),t=uTime,n=noise2(vec2(cos(a),sin(a))*5.0+t*.8);
            float energy=0.0;
            if(vPart<4.5){
              float warped=r+(n-.5)*.10+(noise2(vec2(cos(a),sin(a))*17.0-t*2.0)-.5)*.025;
              float flicker=.25+.75*smoothstep(.24,.72,noise2(vec2(cos(a),sin(a))*4.0+floor(t*16.0)));
              float rim=(exp(-pow((warped-.68)*80.0,2.0))+exp(-pow((warped-.59)*110.0,2.0))*.65)*flicker;
              float swirl=pow(max(0.0,sin(a*3.0+log(max(.08,r))*13.0-t*11.0)),30.0)*(1.0-smoothstep(.12,.7,r));
              energy=rim*.8+swirl*.4+exp(-pow((warped-.63)*8.0,2.0))*(.08+n*.19)+exp(-r*r*12.0)*.16;
            }else{
              float front=.2+min(t,.75)*.75;
              float ripple=exp(-pow((r-front-(n-.5)*.04)*70.0,2.0));
              energy=exp(-r*r*9.0)*.25+ripple*.16+exp(-pow((r-front)*12.0,2.0))*.08;
            }
            gl_FragColor=vec4(cyan+vec3(pow(energy,3.0)),energy*vFade*(1.0-smoothstep(.82,1.0,r)));${J}gl_FragColor.rgb*=min(1.0,gl_FragColor.a);gl_FragColor.a=min(1.0,gl_FragColor.a)*.6;return;
          }
          if(vPart>2.5){vec2 q=vUv*2.0-1.0;float r=length(q),hot=exp(-r*r*145.0),inner=exp(-r*r*35.0),halo=exp(-r*r*4.5),streak=exp(-q.y*q.y*1400.0-abs(q.x)*4.0);
            gl_FragColor=vec4(mix(uColor,cyan,inner)+vec3(hot*2.0),(hot+inner*.6+halo*.22+streak*.42)*vFade*(1.0-smoothstep(.8,1.0,r)));${J}gl_FragColor.rgb*=min(1.0,gl_FragColor.a);gl_FragColor.a=min(1.0,gl_FragColor.a)*.6;return;}
          float edge=length(vec2(max(0.0,abs(vStroke.x)-vHalfLength),vStroke.y)),core=exp(-edge*edge*180.0),sheath=exp(-edge*edge*40.0),halo=exp(-edge*edge*6.0);
          gl_FragColor=vec4(mix(uColor,cyan,sheath)+vec3(core*1.5),(core+sheath*.65+halo*.18)*(1.0-smoothstep(.8,1.0,edge))*vFade);${J}gl_FragColor.rgb*=min(1.0,gl_FragColor.a);gl_FragColor.a=min(1.0,gl_FragColor.a)*.6;return;
        #endif
        #if SPELL == 0
          if(vPart>1.5){
            float age=max(0.0,uTime/3.0-fract(vPhase*.618034)*.10);vec2 q=vUv*2.0-1.0;
            float spin=age*3.0+vPhase;q=mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*q;
            vec3 n=noiseGradient(q*2.5+vec2(vPhase*7.0,-age*2.0));float d=length(q)+(n.x-.5)*.30;
            vec2 lit=smokeOptics(q,n.yz*2.5,n.x,vN);float burn=smoothstep(.45,.96,age);
            float alpha=(1.0-smoothstep(.76,.98,d))*smoothstep(.05+burn*.65,.20+burn*.65,n.x+(1.0-d)*.5)*vFade;
            float heat=.12+n.x*.39+(1.0-d)*.30+lit.x*.16;
            vec3 c=mix(uColor*.23,uColor*1.08,toonStep(.4,heat));c=mix(c,vec3(1,.91,.53),toonStep(.67,heat));
            if(alpha<.005)discard;gl_FragColor=vec4(c,alpha);${J}return;
          }
        #endif
        #if SPELL == 8
          if(vPart>1.5){vec2 q=vUv*2.0-1.0;vec3 nn=noiseGradient(q*2.7+vec2(vPhase*6.0,-uTime*.8));float d=length(q)+(nn.x-.5)*.32;
            float alpha=(1.0-smoothstep(.62,.98,d))*smoothstep(.05,.23,nn.x+(1.0-d)*.25)*vFade;
            vec2 optic=smokeOptics(q,nn.yz*2.7,nn.x,vN);vec3 c=mix(uColor*.7,vec3(.83,.96,1),toonStep(.42,optic.x*.5+nn.x*.3+.2));
            if(alpha<.004)discard;gl_FragColor=vec4(c,alpha);${J}return;}
        #endif
        vec3 shadingNormal=normalize(vN);
        #if SPELL == 0 || SPELL == 5 || SPELL == 6 || SPELL == 11
          shadingNormal=normalize(cross(dFdx(vP),dFdy(vP)));
        #endif
        float shade=.25+.65*abs(dot(shadingNormal,normalize(vec3(-.4,.8,.5))));float alpha=vFade;float ink=0.0;
        #if SPELL == 0
          float age=max(0.0,uTime/3.0-fract(vPhase*.618034)*.10);
          float n=noise2(vec2(vUv.x*6.0-age*4.0,vUv.y*3.0+vPhase*1.7));
          float curl=noise2(vec2(vUv.x*12.0-age*6.0,vUv.y*5.0+vPhase));
          float burn=smoothstep(.43,.93,age)*(1.0-vUv.x*.4);
          float tear=n*.65+curl*.20+sin(vUv.x*PI)*.25-burn*1.35;
          alpha*=smoothstep(.01,.09,tear)*(1.0-smoothstep(.64,.86,age));
          shade=.13+n*.27+shade*.20+pow(max(0.0,sin(vUv.y*PI*2.0+vUv.x*4.0-age*3.0)),3.0)*.35;
        #elif SPELL == 3
          shade=.52+.35*pow(abs(cos(vUv.y*6.283)),3.0);
        #elif SPELL == 4
          float axial=pow(max(0.0,cos(vP.x*7.0-uTime*8.0)),10.0);shade=vPart<.5?.93:.6+axial*.3;
          alpha*=vPart>1.5?.16+.12*axial:vPart>.5?sin(vUv.x*3.14159)*(.55+.3*axial):.94;
        #elif SPELL == 5 || SPELL == 7
          #if SPELL == 5
            alpha*=1.0-smoothstep(.87,1.0,uRetire);
            float curse=fract(vUv.x*8.0-uTime*.9+vPhase*.17);
            float etch=1.0-smoothstep(.04,.13,abs(curse-.5));
            float stain=noise2(vec2(vUv.x*5.0-uTime*1.1,vUv.y*2.0+vPhase));
            shade=mix(.14,.47,smoothstep(.51,.67,stain));shade=max(shade,etch*.77*pow(abs(sin(vUv.y*PI*2.0)),7.0));
            alpha*=smoothstep(uRetire*.8-.12,uRetire*.8+.08,stain+vUv.x*.18);
            alpha*=smoothstep(.0,.06,vUv.x);
          #endif
          #if SPELL == 7
            shade*=.64;
          #endif
          #if SPELL == 7
            shade+=.22*pow(max(0.0,sin(vUv.x*14.0-uTime*3.0)),8.0);
          #endif
        #elif SPELL == 8
          float foam=noise2(vec2(vUv.x*23.0,vUv.y*5.0-uTime*1.8));float age=max(.0,uTime/3.2-abs(vUv.x*2.0-1.0)*.17);
          float crest=pow(vUv.y,5.0),breakup=smoothstep(.29,.62,age);
          alpha*=smoothstep(.0,.08,sin(vUv.x*PI))*smoothstep(.015,.10,vSandMass);
          shade=.16+.42*max(0.0,dot(shadingNormal,normalize(vec3(-.4,.8,.5))))+foam*.17;
          if(vPart>1.5){shade=.18+shade*.65;float top=sin(vUv.y*PI*2.0);shade=max(shade,smoothstep(.52,.8,top)*.93);alpha*=smoothstep(.0,.12,sin(vUv.x*PI));}
          else if(vPart>.5){shade=.94;alpha*=smoothstep(.35,.64,foam)*.88;}
          else{float torn=foam+(1.0-vUv.y)*.20;alpha*=smoothstep(breakup*.52-.08,breakup*.52+.08,torn);}
        #elif SPELL == 9
          float grain=noise2(vec2(vUv.x*34.0,vUv.y*13.0+uTime*4.0));float slide=pow(.5+.5*sin(vUv.y*39.0+uTime*13.0+sin(vUv.x*28.0)*2.0),16.0);
          shade=.18+max(.0,dot(shadingNormal,normalize(vec3(-.65,.65,.35))))*.28+noise2(vec2(vUv.x*10.0,vUv.y*14.0+uTime*4.0))*.20;alpha*=smoothstep(.015,.065,vSandMass);alpha*=smoothstep(.0,.12,sin(vUv.x*PI))*smoothstep(.0,.10,sin(vUv.y*PI));alpha*=1.0-smoothstep(.61+vUv.y*.15,.80+vUv.y*.15,uRetire);
        #elif SPELL == 10
          shade=vPart>1.5?mix(.44,.98,smoothstep(.72,.84,vUv.x)):.75;alpha*=vPart>1.5?pow(vUv.x,1.4)*.95:1.0;
        #elif SPELL == 11
          float flow=noise2(vec2(vUv.x*8.0+uTime*1.6,vPhase*3.4+vUv.y*2.0));alpha*=smoothstep(.0,.06,vUv.x)*(1.0-smoothstep(.8,1.0,vUv.x))*smoothstep(.05,.20,flow)*.85;shade=.19+shade*.30+pow(max(0.0,sin(vUv.y*PI*2.0)),4.0)*.27+pow(max(0.0,sin(vUv.x*12.0+uTime*6.0+vPhase)),8.0)*.16;
        #endif
        #if SPELL == 12
          float pop=uRetire>0.0?clamp(uRetire*1.55-fract(vPhase*.23)*.3,0.0,1.0):fract(uTime*.24+vPhase*.17);float hole=smoothstep(.62,.81,pop);float edge=1.0-hole-vUv.y+sin(vUv.x*31.4+vPhase)*hole*.045;alpha*=smoothstep(-.015,.03,edge);float rim=1.0-smoothstep(.0,.07,abs(edge));float membrane=pow(1.0-abs(dot(shadingNormal,vec3(0,0,1))),2.0);shade=.10+shade*.30+max(rim,membrane)*.55;alpha*=.22+max(rim,membrane)*.65;
        #elif SPELL == 6
          if(vPart>1.5)alpha*=1.0-smoothstep(.48-uRetire*.42,.52-uRetire*.42,abs(vUv.y-.5));
        #endif
        #if SPELL != 0 && SPELL != 3 && SPELL != 4 && SPELL != 8 && SPELL != 9 && SPELL != 10 && SPELL != 11 && SPELL != 12
          float edge=abs(dot(normalize(vN),vec3(0,0,1)));ink=1.0-smoothstep(.04,.13+fwidth(edge),edge);
        #endif
        vec3 c=mix(toonShade(uColor,shade),uColor*.09,ink*.8);
        #if SPELL == 0
          c=mix(uColor*.25,uColor*1.08,toonStep(.36,shade));c=mix(c,vec3(1.0,.92,.58),toonStep(.65,shade));
        #elif SPELL == 8
          if(vPart>.5&&vPart<1.5)c=vec3(.83,.96,1.0);
          if(vPart>1.5)c=mix(c,vec3(.83,.96,1.0),smoothstep(.55,.85,sin(vUv.y*PI*2.0)));
        #endif
        if(alpha<.003)discard;gl_FragColor=vec4(c,alpha);${J}
      }`,g=X(f(),Y(h,m,{uRetire:V.uLifeEnd,uOpening:V.uLifeStart},!1,{SPELL:n}),2);if(g.name=`school-body`,g.material.depthWrite=n!==0&&n!==3&&n!==4&&n!==10&&n!==11&&n!==12,n===12&&(g.material.side=t.FrontSide),n===3&&de(g.material),[0,3,5,6,8,9,10,12].includes(n)&&(g.material.userData.ownLifecycle=!0),r===2){let e=Y(`uniform vec3 uColor;uniform float uTime;
        #if SPELL == 9
          uniform float uLifeStart,uLifeEnd;
        #endif
        varying vec2 vUv;${G}${K}
        float line(vec2 p,vec2 a,vec2 b,float w){vec2 v=b-a;return 1.0-smoothstep(w,w+.006,length(p-a-v*clamp(dot(p-a,v)/dot(v,v),0.0,1.0)));}
        void main(){vec2 p=(vUv-.5)*3.5;float r=length(p),a=atan(p.y,p.x),m=0.0;float inner=0.0;
          #if SPELL == 2
            float box=max(abs(p.x),abs(p.y));m=band(box-1.3,.018)+band(box-1.43,.012);vec2 cell=abs(fract((p+.325)/.65)-.5);m+=max(band(cell.x-.45,.015),band(cell.y-.45,.015))*step(box,1.3)*.35;
          #elif SPELL == 5
            for(int i=0;i<3;i++){float t=float(i)*2.094;vec2 q=mat2(cos(t),-sin(t),sin(t),cos(t))*p;m+=line(q,vec2(.18,-.08),vec2(1.2,.28),.055)+line(q,vec2(1.2,.28),vec2(.93,.58),.055)+line(q,vec2(.93,.58),vec2(.76,.3),.055);}m+=band(r-.6,.024)*(.5+.5*cos(a*9.0));m*=1.2+.5*sin(uTime*2.5-a*3.0);inner=(1.0-smoothstep(0.0,1.4,r))*.08;
          #elif SPELL == 6
            float leaf=.9+.27*cos(a*6.0);m=band(r-leaf,.025)+band(r-1.42,.014);m+=band(sin(a*3.0)*r,.018)*step(r,1.15);inner=step(r,leaf)*.07;
          #elif SPELL == 9
            for(int i=0;i<3;i++){float t=float(i)*2.094;vec2 b=vec2(cos(t),sin(t))*1.68,c=vec2(cos(t+2.094),sin(t+2.094))*1.68;m+=line(p,b,c,.026)+line(p,b*.74,c*.74,.012);}m+=band(r-.38,.018);inner=exp(-r*r*2.0)*.15;
          #elif SPELL == 12
            float lobes=1.04+.21*cos(a*3.0);m=band(r-lobes,.032)+band(r-lobes*.76,.015);float ripple=fract(r*2.5-uTime*.45);m+=band(ripple-.5,.035)*step(r,lobes)*.25;inner=step(r,lobes)*.14;
          #endif
          float sweep=.45+.55*pow(.5+.5*sin(a*2.0-uTime*1.5+r*3.0),3.0);float alpha=clamp(m*sweep+inner,0.0,.92);
          #if SPELL == 9
            alpha*=smoothstep(.0,.75,uLifeStart)*(1.0-smoothstep(.76,1.0,uLifeEnd));
          #endif
          if(alpha<.003)discard;gl_FragColor=vec4(toonShade(uColor,.35+sweep*.5),alpha);${J}}`,ue,{},!1,{SPELL:n});n===9&&(e.userData.ownLifecycle=!0);let r=X(new t.PlaneGeometry(3.5,3.5),e,0);r.rotation.x=-Math.PI/2,r.position.y=.018,k(r)}if(r===0){for(let e=0;e<(n===7?3:4);e++)l((t,n)=>{let r=e*o/4+t*3,i=(1-t)*.3,a=Math.sin(t*Math.PI)*.065*(n*2-1);return[-t*2.8,Math.cos(r)*i+a,Math.sin(r)*i+a*.3]},24,2,0,e);let e=Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying float vPhase;${K}
        void main(){float broken=smoothstep(.1,.3,.5+.5*sin(vUv.x*29.0+uTime*5.0+vPhase));float a=pow(1.0-vUv.x,1.6)*sin(vUv.y*3.14159)*broken*uDetail;gl_FragColor=vec4(toonShade(uColor,.62),a*.75);${J}}`,`attribute float aPhase;uniform float uTime;varying vec2 vUv;varying float vPhase;
        void main(){vUv=uv;vPhase=aPhase;vec3 p=position;p.x-=.38*uSize;float a=uTime*1.4+aPhase;p.yz=mat2(cos(a),-sin(a),sin(a),cos(a))*p.yz;p.yz+=sin(uv.x*12.0-uTime*4.0+aPhase)*uv.x*.06;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,{},!1);X(f(),e,1).name=`school-trail`}let _=Y(`uniform vec3 uColor;varying vec2 vUv;varying float vFade;varying float vLight;${K}
      void main(){vec2 q=vUv*2.0-1.0;float a=1.0-smoothstep(.45,1.0,length(q));
        #if SPELL == 1 || SPELL == 2 || SPELL == 10
          a=1.0-smoothstep(.5,.9,abs(q.x)+abs(q.y));
        #elif SPELL == 3
          a=exp(-q.y*q.y*35.0)*(1.0-smoothstep(.4,1.0,abs(q.x)));
        #elif SPELL == 7 || SPELL == 11
          a=(1.0-smoothstep(.1,.7,abs(q.y)))*(1.0-smoothstep(.65,1.0,abs(q.x)));
        #endif
        vec3 color=toonShade(uColor,vLight);
        #if SPELL == 3
          color=uColor*1.3+vec3(exp(-dot(q,q)*14.0)*1.8);
        #endif
        if(a*vFade<.003)discard;gl_FragColor=vec4(color,a*vFade*uDetail);${J}}`,`attribute vec4 seed;uniform float uTime,uStopTime,uQuantity;
#if SPELL == 12 || SPELL == 9
uniform float uLifeEnd,uLifeStart;
#endif
uniform float uStretch;varying vec2 vUv;varying float vFade;varying float vLight;${G}
      void main(){vUv=uv;${p}float f=fract(seed.x+uTime*(.25+seed.w*.3)),a=seed.y*6.283;vec3 p=vec3(0);float scale=.035+seed.w*.055;vFade=sin(f*PI)*alive*.7;vLight=.45+seed.w*.4;
        #if SPELL == 0
          float t=max(0.0,uTime-seed.x*.6);p=vec3((seed.y-.5)*(1.0+t),-1.25+t*(1.4+seed.z)-t*t*.2,(seed.z-.5)*(.4+t*.5));scale*=.6;vFade*=1.0-smoothstep(.55,1.0,life);
        #elif SPELL == 1 || SPELL == 7 || SPELL == 11
          p=vec3(-.38*uSize-f*2.8,cos(a)*(f*.4+.1),sin(a)*(f*.4+.1));scale*=1.0-f*.5;
          #if SPELL == 11
            p.yz*=uSize;scale*=.23*uSize;
          #endif
        #elif SPELL == 2
          p=vec3((floor(seed.y*5.0)-2.0)*.65,f*1.2,(floor(seed.z*5.0)-2.0)*.65);scale*=.6;
        #elif SPELL == 3
          float t=max(0.0,uTime-.23-seed.x*.1),r=(1.0-exp(-t*4.0))*(.8+seed.z*2.8);p=vec3(cos(a)*r,-1.3+sin(min(t,1.0)*PI)*seed.z*1.35,sin(a)*r);vFade*=smoothstep(.0,.04,t)*(1.0-smoothstep(.35,.95,t))*(1.0-step(.13,seed.w));scale*=uSize*1.4;
        #elif SPELL == 4
          float end=seed.x<.5?-1.0:1.0;p=vec3(end*2.4+end*f*.2/max(uStretch,.001),cos(a)*(.3+f*.7)*uSize,sin(a)*(.3+f*.7)*uSize);vFade*=smoothstep(0.0,.25,uTime);
        #elif SPELL == 5
          p=vec3(cos(a+uTime*.3)*(.3+f),f*1.3,sin(a+uTime*.3)*(.3+f))*uSize;scale*=.42*uSize;vLight=.35;
        #elif SPELL == 6
          p=vec3(cos(a)*(.3+seed.z),f*1.8,sin(a)*(.3+seed.z));scale*=.7;
        #elif SPELL == 8
          float across=seed.y*2.0-1.0,delay=abs(across)*.17+sin(across*7.0)*.025;
          float born=(.34+delay)*3.2+seed.x*.26,t=max(0.0,uTime-born),r=.7+born/3.2*2.1+.4+t*1.2;
          p=vec3(sin(across*1.6)*r,max(-1.27,-.55+t*(.35+seed.z*.7)-t*t*2.4),cos(across*1.6)*r-.5);
          vLight=.8+seed.w*.18;vFade=smoothstep(.0,.06,t)*(1.0-smoothstep(.40,1.0,t))*.88;
          scale=seed.x<.18?.08+seed.w*.08:.035+seed.w*.045;scale*=1.0+step(p.y,-1.26)*.55;
        #elif SPELL == 9
          float bank=floor(seed.y*uQuantity),angle=bank*PI*2.0/uQuantity+.32+(seed.z-.5)*1.55;
          if(uQuantity>3.5)angle=bank*PI*2.0/uQuantity+.32+(seed.z-.5)*1.55*3.0/uQuantity;
          float cycle=fract((uStopTime<0.0?uTime:uStopTime)*.24+bank*.31);if(uStopTime>=0.0)cycle=min(.999,cycle+uLifeEnd*.90);
          float local=clamp((cycle-.10-seed.z*.25)*2.4,0.0,1.0),fall=smoothstep(.02,.88,local),crest=.82-.52*fall;
          float v=crest*(1.0-f),r=.10+v*1.23,bankHeight=pow(sin(seed.z*PI),.65)*(.17+smoothstep(.0,.16,cycle)*.25);
          p=vec3(cos(angle)*r*.72,.035+bankHeight*(1.0-f)*(1.0-fall*.85),sin(angle)*r*.72);
          scale=.025+seed.w*.025;vLight=.45+seed.w*.35;vFade*=smoothstep(.27,.4,cycle)*(1.0-smoothstep(.82,.99,cycle))*smoothstep(.0,.7,uLifeStart)*(1.0-smoothstep(.7,1.0,uLifeEnd));
        #elif SPELL == 10
          float outAge=max(.0,life-.36),r=life<.36?(1.0-life/.36)*1.6:outAge*(2.8+seed.w*2.1);
          float sy=seed.z*2.0-1.0,radial=sqrt(max(.0,1.0-sy*sy));a+=outAge*(.6+seed.w);
          p=vec3(cos(a)*radial*r,sy*r,sin(a)*radial*r);vLight=.72+seed.w*.25;vFade*=1.0-smoothstep(.64+seed.x*.13,.83+seed.x*.15,life);
        #elif SPELL == 12
          float bubble=floor(seed.y*uQuantity),ba=bubble*2.4,br=bubble<.5?0.0:.55+mod(bubble,2.0)*.35;
          if(abs(uQuantity-7.0)>.1)ba=(bubble-1.0)*PI*2.0/max(1.0,uQuantity-1.0);
          float flight=uStopTime<0.0?fract(uTime*.24+bubble*.238-.65):max(0.0,uLifeEnd*1.55-fract(bubble*1.4*.23)*.3-.62);
          float splash=flight*4.0,angle=seed.x*PI*2.0;p=vec3(cos(ba)*br+cos(angle)*splash*.3,max(.04,.16+splash*.5-splash*splash*.7),sin(ba)*br+sin(angle)*splash*.3);
          scale*=.6;vLight=.6+seed.w*.3;vFade=smoothstep(.0,.025,flight)*(1.0-smoothstep(.15,.28,flight))*smoothstep(.0,.3,uLifeStart)*(1.0-smoothstep(.85,1.0,uLifeEnd));
        #endif
        #if SPELL == 0 || SPELL == 3 || SPELL == 8 || SPELL == 10
          p.y=-1.3+(p.y+1.3)*uSize;p.xz*=uSize;
        #elif SPELL == 9
          p*=uSize;
        #endif
        vec4 mv=modelViewMatrix*vec4(p,1.0);vec2 card=position.xy*scale;
        #if SPELL == 3
          vec2 along=(modelViewMatrix*vec4(cos(a),.5,sin(a),0)).xy;along=length(along)<.0001?vec2(1,0):normalize(along);card=along*card.x*4.0+vec2(-along.y,along.x)*card.y*.8;
        #endif
        #if SPELL == 7 || SPELL == 11
          card.x*=2.5;
        #endif
        mv.xy+=card;gl_Position=projectionMatrix*mv;
      }`,{},!1,{SPELL:n});if(Z(new t.PlaneGeometry(1,1),s,1,_,3).name=`school-particles`,(n===12||n===9)&&(_.userData.ownLifecycle=!0),n===12){let e=Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying float vFade;${G}${K}
        void main(){vec2 q=vUv*2.0-1.0;float cloud=(1.0-smoothstep(.35,1.0,length(q)))*smoothstep(.2,.7,noise2(q*2.0+uTime*.3));gl_FragColor=vec4(toonShade(uColor,.28),cloud*vFade*.65*uDetail);${J}}`,`attribute vec4 seed;uniform float uTime,uStopTime,uLifeStart,uLifeEnd;varying vec2 vUv;varying float vFade;
        void main(){vUv=uv;float f=uStopTime<0.0?fract(seed.x+uTime*.16):min(1.0,fract(seed.x+uStopTime*.16)+uLifeEnd*.65),a=seed.y*6.283+uTime*.25;vec3 p=vec3(cos(a)*(.3+seed.z),.12+f*.35,sin(a)*(.3+seed.z));vec4 mv=modelViewMatrix*vec4(p,1.0);mv.xy+=position.xy*vec2(.65,.28);vFade=sin(f*3.14159)*smoothstep(.0,.5,uLifeStart)*(1.0-smoothstep(.65,1.0,uLifeEnd));gl_Position=projectionMatrix*mv;}`,{},!1);Z(new t.PlaneGeometry(1,1),32,.0625,e,4).name=`school-mist`,e.userData.ownLifecycle=!0}}if(!(p({THREE:t,spec:e,cap:s,uniforms:A,animated:w,mesh:X,instanced:Z,shader:Y,output:J,variation:T})||f({THREE:t,spec:e,cap:s,uniforms:A,animated:w,mesh:X,instanced:Z,shader:Y,noise:G,output:J})||D({THREE:t,spec:e,cap:s,uniforms:A,materials:S,animated:w,mesh:X,instanced:Z,shader:Y,output:J})||j({THREE:t,spec:e,cap:s,uniforms:A,geometries:x,materials:S,animated:w,mesh:X,instanced:Z,shader:Y,output:J})||te({THREE:t,spec:e,cap:s,uniforms:A,geometries:x,animated:w,mesh:X,instanced:Z,shader:Y,output:J})||re({THREE:t,spec:e,cap:s,uniforms:A,lifeUniforms:V,materials:S,mesh:X,instanced:Z,shader:Y,output:J})||ie({THREE:t,spec:e,cap:s,mesh:X,instanced:Z,shader:Y,output:J})||ae({THREE:t,kind:r,variant:i,cap:s,uniforms:A,lifeUniforms:V,materials:S,mesh:X,instanced:Z,shader:Y,output:J})||z({THREE:t,kind:r,variant:i,instanced:Z,shader:Y,output:J})||ne({THREE:t,spec:e,kind:r,variant:i,cap:s,group:c,uniforms:A,lifeUniforms:V,geometries:x,materials:S,allocations:C,animated:w,mesh:X,instanced:Z,corePart:k,shader:Y,noise:G,output:J}))){if(i>=4)me();else{r===5?Z(new t.PlaneGeometry(1,1),s,1,Y(pe,fe,{},!1,{CLOUD:1}),0):(Z(r===0&&i===2?new t.OctahedronGeometry(.7):new t.PlaneGeometry(1,1),s,r===3?.86:1,Y(pe,fe,{},!0,{CLOUD:0}),3),r===3&&Z(new t.PlaneGeometry(1,1),Math.min(i===0?116:128,Math.ceil(s*.14)),.14,Y(pe,fe,{},!1,{CLOUD:1}),0));function e(e,n,r){let i=Y(`
      uniform vec3 uColor;uniform float uTime;uniform float uRole;
      varying vec2 vUv;${G}
      void main(){
        vec2 p=vUv*2.0-1.0;float r=length(p),a=atan(p.y,p.x);
        float rays=pow(abs(sin(a*(uRole<0.5?6.0:9.0)+uTime*2.0)),20.0);
        float halo=exp(-r*r*7.5)*0.5;
        float core=exp(-r*r*75.0);
        float crown=band(r-(0.38+sin(uTime*9.0)*0.025),0.012)*(0.4+0.6*pow(abs(sin(a*8.0-uTime*3.0)),4.0));
        float alpha=(halo+core*0.8+rays*exp(-r*5.0)*0.7+crown*0.4)*(1.0-smoothstep(0.8,1.0,r));
        #if KIND == 1
          #if VARIANT == 0
            float aperture=band(r-0.34,0.022)*(0.45+0.55*pow(abs(cos(a*3.0-uTime*1.4)),8.0));
            float splash=pow(max(0.0,cos(a*7.0+sin(a*11.0+uTime*6.0))),14.0)*exp(-r*4.2);
            alpha=core+halo*0.65+(uRole<0.5?aperture:splash)*0.7;
          #elif VARIANT == 1
            float cycle=fract(uTime*1.2-uRole*0.38);
            alpha=core*0.6+halo*0.35+band(r-cycle*0.85,0.026)*(1.0-cycle)*0.85;
            alpha+=pow(max(0.0,cos(a*4.0-uTime)),18.0)*exp(-r*5.0)*0.35;
          #elif VARIANT == 2
            float phase=uTime,release=smoothstep(1.52,1.60,phase),impact=smoothstep(1.61,1.65,phase);
            if(uRole<0.5){
              float intake=fract(r*2.5+phase*1.1);
              float iris=pow(max(0.0,cos(a*5.0-r*9.0+phase*2.5)),12.0);
              alpha=(core*1.2+halo*0.65+iris*exp(-r*3.5)*0.65+band(intake-0.5,0.055)*(1.0-r)*0.25)*(0.1+min(phase/1.52,1.0));
            }else{
              float turbulence=noise2(p*7.0+vec2(phase*2.0,-phase*3.0));
              float corona=exp(-pow((r-0.28-(turbulence-0.5)*0.14)*12.0,2.0));
              float shock=fract(max(0.0,phase-1.62)*1.7);
              alpha=(core*1.5+halo*0.5+corona*0.5+band(r-shock*0.88,0.026)*sin(shock*PI)*0.65)*impact;
            }
          #else
            float jitter=noise2(vec2(cos(a),sin(a))*7.0+floor(uTime*18.0));
            float forks=pow(max(0.0,cos(a*(uRole<0.5?5.0:11.0)+jitter*4.0)),24.0);
            core=exp(-r*r*100.0);
            halo=exp(-r*r*5.5);
            float streak=exp(-p.y*p.y*1100.0)*exp(-abs(p.x)*5.0);
            alpha=core+halo*.42+forks*exp(-r*9.0)*.55+streak*.18;
          #endif
          alpha*=1.0-smoothstep(0.85,1.0,r);
        #endif
        vec3 color=uColor*(1.1+core)+vec3(core*0.45);
        #if KIND == 1 && VARIANT == 3
          color=uColor*(.9+core)+vec3(core*1.7);
        #endif
        gl_FragColor=vec4(color,alpha*(0.88+sin(uTime*17.0)*0.12)*uDetail);${J}
      }`,`varying vec2 vUv;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(0.0,0.0,0.0,1.0);mv.xy+=position.xy*length(modelMatrix[1].xyz);gl_Position=projectionMatrix*mv;}`,{uRole:{value:r}}),a=X(new t.PlaneGeometry(n,n),i,4);return a.position.x=e,a}if(r===0){if(i===0){let e=[],n=[],r=[];for(let t=0;t<=48;t++)for(let r=0;r<=20;r++){let i=t/48,a=r/20*Math.PI*2,o=Math.sin(i*Math.PI)**.6*(.12+.5*i);e.push(-2.65+i*4.05,Math.cos(a)*o,Math.sin(a)*o),n.push(i,r/20)}for(let e=0;e<48;e++)for(let t=0;t<20;t++){let n=e*21+t;r.push(n,n+1,n+20+1,n+1,n+20+2,n+20+1)}let i=new t.BufferGeometry;i.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),i.setAttribute(`uv`,new t.Float32BufferAttribute(n,2)),i.setIndex(r);let a=Y(`uniform float uTime;uniform vec3 uColor;varying vec2 vUv;varying vec3 vN;varying vec3 vView;${G}${K}
        void main(){float h=vUv.x,a=vUv.y*PI*2.0,t=uTime;
          vec2 flowUV=vec2(h*8.0+t*2.7,cos(a)*1.6+sin(a)*2.1);
          float roll=noise2(flowUV),curl=noise2(flowUV*1.71+vec2(t*.9,3.7));
          // 只在前緣和尾端做大塊侵蝕，中央保持連續；不靠碎片堆出主體。
          float tear=roll*.68+curl*.32;
          float front=smoothstep(.78,1.0,h),back=1.0-smoothstep(.04,.40,h);
          if(tear<.16+front*.29+back*.34+sin(a*3.0+h*9.0+t*4.0)*back*.10)discard;
          vec3 n=normalize(vN),eye=normalize(vView);float roundness=abs(dot(n,eye));
          float turn=.5+.5*dot(n,normalize(vec3(-.3,.75,.6)));
          float heat=.10+roundness*.20+turn*.26+roll*.34+sin(h*10.0+a*2.0+t*6.0)*.10;
          // Keep the existing shape and three Toon bands; concentrate heat at the head.
          float headHeat=smoothstep(.40,.86,h);
          heat+=mix(-.04,.04,headHeat);
          vec3 c=mix(uColor*.38,uColor*mix(.90,1.12,headHeat),toonStep(.40,heat));
          c=mix(c,mix(uColor,vec3(1.0,.88,.46),.6)*1.2,toonStep(.64+.12*(1.0-headHeat),heat));
          gl_FragColor=vec4(c,1.0);${J}}`,`${G}
        uniform float uTime;varying vec2 vUv;varying vec3 vN;varying vec3 vView;
        vec3 flamePoint(float h,float a){
          float t=uTime,body=smoothstep(.28,.68,h),scale=mix(1.0,uSize,body);
          float wave=sin(h*12.0+a*3.0+t*6.5),eddy=sin(h*8.0-a*2.0+t*4.1);
          float capAngle=clamp((h-.8)/.2,0.0,1.0)*PI*.5;
          float capFade=h>=1.0?0.0:cos(capAngle);
          float r=h>.8?pow(sin(.8*PI),.6)*.52*capFade:pow(max(.00001,sin(h*PI)),.6)*(.12+.5*h);
          r*=1.0+(wave*.28+eddy*.20)*mix(1.0,capFade,smoothstep(.78,.9,h));
          float spin=a+h*2.7+sin(h*6.0+t*3.2)*.30;
          float x=h>.8?.59+.52*sin(capAngle):-2.65+h*4.05;
          x+=(sin(a*3.0+t*5.5)*.07+eddy*.06)*smoothstep(.60,.82,h)*capFade*capFade;
          x+=sin(t*4.1)*.035*smoothstep(.78,1.0,h);
          x+=sin(a*3.0+h*8.0+t*5.0)*.35*(1.0-smoothstep(.05,.48,h));
          // 軸向接合比截面縮放更晚開始，避免最大尺寸把尾部折回自身。
          x+=(x-.65)*(uSize-1.0)*smoothstep(.55,.90,h);
          vec2 bend=vec2(sin(h*5.0+t*3.0),cos(h*7.0+t*2.7))*(.04+(.9-h)*.10);
          vec2 crossSection=vec2(cos(spin),sin(spin))*r+bend;
          return vec3(x,crossSection*scale);
        }
        void main(){vUv=uv;float h=clamp(uv.x,.001,1.0),a=uv.y*PI*2.0;vec3 p=flamePoint(h,a);
          float nh=min(h,.998);
          vec3 dh=flamePoint(min(nh+.001,1.0),a)-flamePoint(max(nh-.001,0.0),a);
          vec3 da=flamePoint(nh,a+.003)-flamePoint(nh,a-.003);
          vN=normalMatrix*normalize(cross(da,dh));vec4 mv=modelViewMatrix*vec4(p,1.0);vView=-mv.xyz;gl_Position=projectionMatrix*mv;}`,{},!1);a.side=t.DoubleSide,a.transparent=!1,a.depthWrite=!0;let o=X(i,a,2);o.name=`projectile-core`}else if(i===1){let e=[],n=[],r=[];for(let t=0;t<=12;t++)for(let r=0;r<=8;r++){let i=t/12,a=r/8*Math.PI*2,o=.16*Math.sin(i*Math.PI)**.8*(1+.32*Math.sin(t*2.7+r*1.9));e.push((i*2-1)*.85,Math.cos(a)*o,Math.sin(a)*o),n.push(i,r/8)}for(let e=0;e<12;e++)for(let t=0;t<8;t++){let n=e*9+t;r.push(n,n+1,n+8+1,n+1,n+8+2,n+8+1)}let i=new t.BufferGeometry;i.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),i.setAttribute(`uv`,new t.Float32BufferAttribute(n,2)),i.setIndex(r);let a=X(i,Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;
        void main(){float charge=.5+.5*sin(vUv.x*17.0+uTime*12.0),streak=pow(.5+.5*cos(vUv.y*18.8496+sin(vUv.x*17.0-uTime*9.0)*1.7),5.0);
          gl_FragColor=vec4(uColor*vec3(.25,.85,1.7)+vec3(streak*1.8),(.04+streak*.36)*(.6+charge*.4));${J}}`,`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`),2);a.name=`projectile-core`,a.position.x=.85,k(a);function o(e){let n=[],r=[],i=[],a=[];for(let t=0;t<(e?6:5);t++)for(let o=0;o<(e?2:1);o++){let e=o?10:32,s=n.length/3;for(let a=0;a<=e;a++)for(let s=0;s<2;s++)n.push(a/e,t,s*2-1),r.push(a/e,s),i.push(o);for(let t=0;t<e;t++){let e=s+t*2;a.push(e,e+1,e+2,e+1,e+3,e+2)}}let o=new t.BufferGeometry;return o.setAttribute(`position`,new t.Float32BufferAttribute(n,3)),o.setAttribute(`uv`,new t.Float32BufferAttribute(r,2)),o.setAttribute(`aBranch`,new t.Float32BufferAttribute(i,1)),o.setIndex(a),o}let s=`uniform vec3 uColor;varying vec2 vUv;varying float vFade;
        void main(){float d=abs(vUv.y*2.0-1.0),core=1.0-smoothstep(.12,.28,d),edge=exp(-d*d*12.0),halo=exp(-d*d*3.5);
          float a=max(core,edge*.65+halo*.38)*(1.0-smoothstep(.75,1.0,d))*vFade;
          vec3 blue=pow(uColor,vec3(2.2))*vec3(.12,.65,2.2);gl_FragColor=vec4(mix(blue,vec3(.75,.95,1.0)*1.5,core),a*uDetail);${J}}`;function c(e){let n=Y(s,`${G}uniform float uTime;attribute float aBranch;varying vec2 vUv;varying float vFade;
          vec3 mainPoint(float h,float id){float a=id*1.256637+${e?`h*1.8`:`h*.5`},tick=floor(uTime*12.0+id*.7),cell=h*22.0;
            float j=mix(hash(vec2(floor(cell),tick+id)),hash(vec2(floor(cell)+1.0,tick+id)),fract(cell))-.5;
            float coarse=h*6.0,bend=mix(hash(vec2(floor(coarse)+id*11.0,tick)),hash(vec2(floor(coarse)+1.0+id*11.0,tick)),fract(coarse))-.5;
            float r=sin(h*PI)*(${e?`.42`:`.34+id*.095`}+bend*.75+j*.14);
            ${e?`return vec3(.79-h*1.52,cos(a)*r,sin(a)*r);`:`float attach=mix(uSize,1.0,smoothstep(0.0,.65,h));return vec3(.85+.65*uSize-h*(3.0+sin(id*3.1)*.35)-.65*(uSize-1.0)*smoothstep(0.0,1.0,h),cos(a)*r*attach,sin(a)*r*attach);`}
          }
          vec3 pointAt(float h,float id){if(aBranch<.5)return mainPoint(h,id);float root=.36+mod(id,3.0)*.12,a=id*1.256637+root*1.8;return mainPoint(root,id)+vec3(-.65*h,cos(a)*h*.55,sin(a)*h*.55)+vec3(0,sin(h*19.0+floor(uTime*14.0)+id)*.08,sin(h*23.0+id)*.065)*sin(h*PI);}
          void main(){vUv=uv;float h=position.x,id=position.y;vec4 mv=modelViewMatrix*vec4(pointAt(h,id),1);
            vec4 p0=modelViewMatrix*vec4(pointAt(max(0.0,h-.002),id),1),p1=modelViewMatrix*vec4(pointAt(min(1.0,h+.002),id),1);vec2 delta=p1.xy-p0.xy;
            vec2 side=length(delta)<.00001?vec2(0,1):normalize(vec2(-delta.y,delta.x));float width=${e?`id<2.0?.30:.16`:`id<.5?.48:.23`};
            width*=mix(1.0,.12,h)*(.8+.2*sin(h*39.0+id));if(aBranch>.5)width*=.38*(1.0-h*.8);
            mv.xy+=side*position.z*width*${e?`length(modelMatrix[1].xyz)`:`mix(uSize,1.0,smoothstep(0.0,.65,h))*length(modelMatrix[1].xyz)`};
            float pulse=.65+.35*pow(max(0.0,cos(h*24.0-uTime*13.0+id)),8.0);
            vFade=${e?`(id<2.0?.85:.5)*(.6+.4*hash(vec2(id,floor(uTime*15.0+id))))`:`(id<.5?1.0:.55)*pulse`}*(1.0-smoothstep(.65,1.0,h));if(aBranch>.5)vFade*=.3+.7*step(.4,hash(vec2(id,floor(uTime*12.0+id))));
            gl_Position=projectionMatrix*mv;}`);return n.side=t.DoubleSide,X(o(e),n,3)}c(!1).name=`projectile-trails`;let l=c(!0);l.name=`projectile-envelope`,l.position.x=.85,k(l);let u=Y(`uniform vec3 uColor;varying vec2 vUv;void main(){vec2 q=vUv*2.0-1.0;float a=exp(-q.y*q.y*5.0)*pow(max(0.0,1.0-q.x*q.x),1.8)*.32;gl_FragColor=vec4(uColor*vec3(.06,.25,1.8),a*uDetail);${J}}`,`varying vec2 vUv;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position.x,0,0,1);vec2 axis=(modelViewMatrix*vec4(1,0,0,0)).xy;vec2 side=length(axis)<.00001?vec2(0,1):normalize(vec2(-axis.y,axis.x));mv.xy+=side*position.y*length(modelMatrix[1].xyz);gl_Position=projectionMatrix*mv;}`);u.side=t.DoubleSide;let d=X(new t.PlaneGeometry(2.2,1.6),u,1);d.name=`plasma-core-halo`,d.position.x=.85,k(d)}else if(i<3){function e(e,n,r=6,i=8){let a=[],o=[],s=[];for(let t=0;t<=i;t++){let s=t/i,c=Math.sin(s*Math.PI)**.9*(.65+.35*s);for(let t=0;t<=r;t++){let i=t/r*Math.PI*2,l=1+.13*Math.sin(i*3+.8);a.push((s*2-1)*e,Math.cos(i)*n*c*l,Math.sin(i)*n*c),o.push(s,t/r)}}for(let e=0;e<i;e++)for(let t=0;t<r;t++){let n=e*(r+1)+t;s.push(n,n+1,n+r+1,n+1,n+r+2,n+r+1)}let c=new t.BufferGeometry;return c.setAttribute(`position`,new t.Float32BufferAttribute(a,3)),c.setAttribute(`uv`,new t.Float32BufferAttribute(o,2)),c.setIndex(s),c.computeVertexNormals(),c}function n(e,n=28,r=5){let i=[],a=[],o=[],s=[];for(let t of e){let e=i.length/3;for(let e=0;e<=n;e++)for(let s=0;s<=r;s++)i.push(e/n,Math.cos(s/r*Math.PI*2),Math.sin(s/r*Math.PI*2)),a.push(e/n,s/r),o.push(...t);for(let t=0;t<n;t++)for(let n=0;n<r;n++){let i=e+t*(r+1)+n;s.push(i,i+1,i+r+1,i+1,i+r+2,i+r+1)}}let c=new t.BufferGeometry;return c.setAttribute(`position`,new t.Float32BufferAttribute(i,3)),c.setAttribute(`uv`,new t.Float32BufferAttribute(a,2)),c.setAttribute(`aStream`,new t.Float32BufferAttribute(o,4)),c.setIndex(s),c}let r=Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying vec3 vN;varying vec3 vV;varying vec3 vP;${G}${K}
        void main(){float rim=pow(1.0-abs(dot(normalize(vN),normalize(vV))),2.0);vec3 c;float alpha=0.97;
          #if VARIANT == 1
            float charge=pow(max(0.0,sin(vP.x*13.0+uTime*9.0)),12.0);
            float stripe=pow(abs(cos(vUv.y*18.85+vP.x*2.0)),20.0);
            c=toonShade(uColor,.24+rim*.40+stripe*.31+charge*.21);
          #else
            float lit=max(0.0,dot(normalize(vN),normalize(vec3(-0.35,0.8,0.5))));
            float edge=pow(abs(cos(vUv.y*18.85)),24.0);
            float sweep=pow(max(0.0,sin(vP.x*3.0-uTime*2.4)),24.0);
            float fracture=1.0-smoothstep(0.02,0.065,abs(sin(vP.x*16.0+vP.y*26.0+vP.z*19.0)));
            c=toonShade(uColor,.18+lit*.53+rim*.17+sweep*.24);
          #endif
          gl_FragColor=vec4(c,alpha);${J}}`,`uniform float uTime;varying vec2 vUv;varying vec3 vN;varying vec3 vV;varying vec3 vP;
        void main(){vUv=uv;vec3 p=position;vP=p;
          #if VARIANT == 1
            p.yz*=0.88+0.12*sin(uTime*9.0-p.x*5.0);
          #endif
          vec4 mv=modelViewMatrix*vec4(p,1.0);vN=normalMatrix*normal;vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`,{},!1);r.side=t.FrontSide,r.depthWrite=!0,r.transparent=!1;let a=e(.85,.22,6,2);if(i===2){a.dispose();let n=[],r=[],i=[];for(let[t,a,o,s,c,l,u]of[[.85,.23,.08,0,0,0,.2],[.65,.15,-.3,.23,.08,-.27,.8],[.49,.13,-.46,-.17,.17,.35,2],[.58,.14,-.36,-.03,-.24,.16,4.1],[.3,.1,-.62,.2,-.16,-.5,1.6]]){let d=e(t,a,6,2),f=d.toNonIndexed();d.dispose(),f.rotateX(u),f.rotateZ(l),f.translate(o,s,c),f.computeVertexNormals(),n.push(...f.attributes.position.array),r.push(...f.attributes.normal.array),i.push(...f.attributes.uv.array),f.dispose()}a=new t.BufferGeometry,a.setAttribute(`position`,new t.Float32BufferAttribute(n,3)),a.setAttribute(`normal`,new t.Float32BufferAttribute(r,3)),a.setAttribute(`uv`,new t.Float32BufferAttribute(i,2))}let o=X(a,r,2);o.position.x=.85,o.name=`projectile-core`,k(o),i===2&&w.push(()=>{o.rotation.x=Math.sin(d*.7)*.12});let s=Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying float vPhase;varying float vFace;${G}${K}
        void main(){float h=vUv.x,t=uTime,alpha;vec3 c;
          #if VARIANT == 1
            float packet=pow(max(0.0,sin(h*26.0+t*14.0+vPhase)),10.0);
            alpha=(.18+.75*toonStep(.35,packet))*sin(h*PI);c=toonShade(uColor,.50+packet*.35);
          #else
            float frost=noise2(vec2(h*19.0+t*1.8,vUv.y*7.0+vPhase));
            alpha=pow(1.0-h,1.5)*smoothstep(0.0,.14,h)*(.12+.18*toonStep(.5,frost));c=toonShade(uColor,.53);
          #endif
          gl_FragColor=vec4(c,alpha*uDetail);${J}}`,`${G}uniform float uTime;attribute vec4 aStream;varying vec2 vUv;varying float vPhase;varying float vFace;
        void main(){float h=position.x,t=uTime,phase=aStream.w;vUv=uv;vPhase=phase;
          float a=aStream.x;float radius=aStream.z;float width;vec3 p;
          #if VARIANT == 1
            float tick=floor(t*18.0);a+=h*.65;
            float j=sin(floor(h*13.0)*17.0+tick+phase)*.055*sin(h*PI);
            radius=radius*sin(h*PI)+j;width=.009+sin(h*PI)*.012;
            p=vec3(.85+.65*uSize-h*aStream.y,cos(a)*radius,sin(a)*radius);
          #else
            radius*=sin(h*PI);a+=h*.7+sin(t*.6+phase)*.12;width=.009+sin(h*PI)*.025;
            p=vec3(.85-.3*uSize-h*aStream.y,cos(a)*radius,sin(a)*radius);
          #endif
          float attach=mix(uSize,1.0,smoothstep(0.0,.65,h));p.yz*=attach;
          // 尾端位置固定，只有近彈體的接合範圍隨核心尺寸改變。
          #if VARIANT == 1
            p.x-=.65*(uSize-1.0)*smoothstep(0.0,1.0,h);
          #else
            p.x+=.3*(uSize-1.0)*smoothstep(0.0,1.0,h);
          #endif
          vec3 normal=vec3(0.0,position.y,position.z);p+=normal*width*attach;
          vec4 mv=modelViewMatrix*vec4(p,1.0);vFace=abs(dot(normalize(normalMatrix*normal),normalize(-mv.xyz)));gl_Position=projectionMatrix*mv;}`,{},!1),c=X(n(i===1?[[.1,3,.26,.3],[1.5,2.65,.38,1.7],[2.8,3.4,.21,3.2],[4.2,2.8,.34,4.6],[5.4,3.15,.25,5.8]]:[[.5,2.6,.34,.3],[2.7,2,.4,1.7],[4.8,2.35,.28,3.2]],24,5),s,3);if(c.name=`projectile-trails`,i===1){let e=Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying float vPhase;${G}${K}
          void main(){float cut=noise2(vec2(floor(vUv.x*9.0),floor(uTime*16.0)+vPhase));float flash=.35+.65*step(.36,cut);float a=sin(vUv.x*PI)*flash;gl_FragColor=vec4(toonShade(uColor,.74),a*uDetail);${J}}`,`${G}uniform float uTime;attribute vec4 aStream;varying vec2 vUv;varying float vPhase;
          void main(){vUv=uv;vPhase=aStream.w;float h=position.x;float tick=floor(uTime*16.0);float a=aStream.x;
            float jitter=sin(floor(h*10.0)*18.0+tick+aStream.w)*.08;float r=sin(h*PI)*(aStream.z+jitter);
            vec3 p=vec3(.72-h*aStream.y,cos(a)*r,sin(a)*r);p.yz+=position.yz*.012;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,{},!1),t=X(n([[.4,1.5,.38,.1],[1.8,1.2,.46,1.2],[3.2,1.6,.39,2.7],[4.7,1.35,.42,4.1],[.7,.8,.52,5.3],[3.6,.9,.54,6.9]],20,3),e,4);t.position.x=.85,t.name=`projectile-envelope`,k(t)}}else{let e=[],n=[],r=[];for(let i=0;i<6;i++){let a=new t.OctahedronGeometry(.13);for(let t=0;t<a.attributes.position.count;t++)e.push(...a.attributes.position.array.slice(t*3,t*3+3)),n.push(...a.attributes.normal.array.slice(t*3,t*3+3)),r.push(i);a.dispose()}let i=new t.BufferGeometry;i.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),i.setAttribute(`normal`,new t.Float32BufferAttribute(n,3)),i.setAttribute(`aOrbit`,new t.Float32BufferAttribute(r,1)),i.setAttribute(`aUnit`,new t.Float32BufferAttribute(r,1));let a=X(i,Y(`uniform vec3 uColor;varying vec3 vN;varying float vQuantityFade;${K}void main(){if(vQuantityFade<.5)discard;float l=abs(dot(normalize(vN),normalize(vec3(-0.5,0.8,0.4))));gl_FragColor=vec4(toonShade(uColor,.2+l*.75),1.0);${J}}`,`uniform float uTime,uQuantity,uSpread;attribute float aOrbit;varying vec3 vN;varying float vQuantityFade;
        void main(){vQuantityFade=step(aOrbit,uQuantity-.5);float a=aOrbit*(uQuantity==3.0?2.094395:6.283185307/uQuantity)-uTime*3.0;vec3 p=position*vec3(1.4,0.6,0.6);p+=vec3(sin(a*2.0)*0.09,cos(a)*0.26*uSpread,sin(a)*0.26*uSpread);vN=normalMatrix*normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,{},!1),3);a.name=`arcane-missile-cores`,a.position.x=.85,k(a);let o=[],s=[],c=[];for(let e=0;e<6;e++){let t=o.length/3;for(let t=0;t<=64;t++)for(let n=0;n<2;n++)o.push(t/64,e,n*2-1),s.push(t/64,n);for(let e=0;e<64;e++){let n=t+e*2;c.push(n,n+1,n+2,n+1,n+3,n+2)}}let l=new t.BufferGeometry;l.setAttribute(`position`,new t.Float32BufferAttribute(o,3)),l.setAttribute(`uv`,new t.Float32BufferAttribute(s,2)),l.setAttribute(`aUnit`,new t.Float32BufferAttribute(o.filter((e,t)=>t%3==1),1)),l.setIndex(c);let u=Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying float vQuantityFade;${K}void main(){if(vQuantityFade<.5)discard;float edge=abs(vUv.y*2.0-1.0);float a=(1.0-toonStep(.78,edge))*pow(1.0-vUv.x,1.2);float rune=pow(max(0.0,cos(vUv.x*44.0+uTime*5.0)),10.0);float packet=0.32+0.55*rune+0.13*sin(vUv.x*32.0+uTime*6.0);gl_FragColor=vec4(toonShade(uColor,.45+packet*.4),a*(.5+.5*toonStep(.55,packet))*uDetail);${J}}`,`uniform float uTime,uQuantity,uSpread;varying vec2 vUv;varying float vQuantityFade;
        void main(){vUv=uv;vQuantityFade=step(position.y,uQuantity-.5);float h=position.x,a=position.y*(uQuantity==3.0?2.094395:6.283185307/uQuantity)-uTime*3.0+h*12.0;float r=(0.26*mix(uSize,1.0,smoothstep(0.0,0.35,h))+h*0.16)*uSpread;vec3 p=vec3(0.85-h*3.5,cos(a)*r,sin(a)*r);vec4 mv=modelViewMatrix*vec4(p,1.0);mv.y+=position.z*(0.02+(1.0-h)*0.045)*length(modelMatrix[1].xyz);gl_Position=projectionMatrix*mv;}`,{},!1);X(l,u,2).name=`arcane-missile-trails`}}if(r===1){e(-2.4,i===2?2.1:i===3?1.8:1,0),e(2.4,i===2?2.6:i===3?2.5:1.4,1);let n=`varying vec2 vUv;varying float vArcFade;uniform vec3 uColor;
      void main(){float edge=abs(vUv.y*2.0-1.0),core=exp(-edge*edge*130.0),sheath=exp(-edge*edge*26.0),halo=exp(-edge*edge*5.0);
        float alpha=(core+sheath*.5+halo*.23)*(1.0-smoothstep(.75,1.0,edge))*vArcFade;
        gl_FragColor=vec4(uColor*(.9+sheath*.65)+vec3(core*1.8),alpha);${J}}`;function r(e,n,r=0){let i=[],a=[],o=[],s=[],c=[];for(let t=e-1;t>=0;t--)for(let e=r;e>=0;e--){let r=i.length/3,l=e?24:n;for(let n=0;n<=l;n++)for(let r=0;r<2;r++)i.push(n/l,t,r*2-1),a.push(n/l,r),o.push(t),s.push(e);for(let e=0;e<l;e++){let t=r+e*2;c.push(t,t+1,t+2,t+1,t+3,t+2)}}let l=new t.BufferGeometry;return l.setAttribute(`position`,new t.Float32BufferAttribute(i,3)),l.setAttribute(`uv`,new t.Float32BufferAttribute(a,2)),l.setAttribute(`aUnit`,new t.Float32BufferAttribute(o,1)),l.setAttribute(`aRole`,new t.Float32BufferAttribute(s,1)),l.setIndex(c),l}if(i<2){let e=Y(`varying vec2 vUv;varying vec3 vN;varying vec3 vV;uniform float uTime,uQuantity;uniform vec3 uColor;${G}
        void main(){float v=vUv.y,t=uTime;float alpha=0.6;vec3 c=uColor*1.2;
        #if VARIANT == 0
          float filament=pow(max(0.0,cos(vUv.x*PI*8.0-v*31.0+t*8.0)),20.0);
          float facing=abs(dot(normalize(vN),normalize(vV)));alpha=0.48+filament*0.35;c+=vec3(0.35)+uColor*filament*0.6+vec3(pow(facing,6.0)*0.3);
        #elif VARIANT == 1
          float packet=pow(max(0.0,cos(uQuantity==4.0?v*PI*8.0-t*8.0:v*6.283185307*uQuantity-t*8.0*(uQuantity/4.0))),12.0);float fins=pow(abs(cos(vUv.x*PI*4.0)),6.0);alpha=0.035+packet*(0.55+fins*0.45);c+=vec3(packet*0.8);
        #endif
        gl_FragColor=vec4(c,alpha);${J}}`,`varying vec2 vUv;varying vec3 vN;varying vec3 vV;uniform float uTime,uQuantity;
        void main(){vUv=uv;vec3 p=position;
        #if VARIANT == 1
          float packet=pow(max(0.0,cos(uQuantity==4.0?uv.y*25.13274-uTime*8.0:uv.y*6.283185307*uQuantity-uTime*8.0*(uQuantity/4.0))),6.0);p.xz*=0.35+packet*0.9;
        #endif
        p.xz*=uSize;vec4 mv=modelViewMatrix*vec4(p,1.0);vN=normalMatrix*normal;vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`),n=i===1?.12:.045,r=X(new t.CylinderGeometry(n,n,4.8,12,48,!0),e,2);if(r.rotation.z=-Math.PI/2,i===1&&(r.name=`pulse-body`),i===0){let e=Y(`varying vec2 vUv;uniform vec3 uColor;uniform float uTime;${G}
          void main(){float filament=pow(max(0.0,cos(vUv.x*PI*6.0-vUv.y*24.0+uTime*3.0)),24.0);gl_FragColor=vec4(uColor,0.08+filament*0.28);${J}}`),n=X(new t.CylinderGeometry(.13,.13,4.8,24,64,!0),e,1);n.rotation.z=-Math.PI/2,k(n,`xz`)}else{let e=Y(`varying float vFade;uniform vec3 uColor;void main(){gl_FragColor=vec4(uColor*1.7,vFade*uDetail);${J}}`,`attribute vec4 seed;uniform float uTime;uniform float uStretch;varying float vFade;
          void main(){float life=fract(seed.x+uTime*0.38);vec3 p=vec3(position.z,position.y,position.x);float x;
            x=-2.4+life*4.8;p.yz*=uSize*(0.7+sin(life*3.14159)*0.6);vFade=sin(life*3.14159)*0.85;
          p.x/=uStretch;p.x+=x;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`);Z(new t.TorusGeometry(.26,.012,5,32),12,.025,e,3)}}else if(i===3){let e=Y(n,`varying vec2 vUv;varying float vArcFade;attribute float aRole;uniform float uTime,uQuantity,uStretch;${G}
        float jag(float h,float cells,float seed){float x=h*cells,k=floor(x);return mix(hash(vec2(k,seed)),hash(vec2(k+1.0,seed)),fract(x))*2.0-1.0;}
        vec3 current(float h,float id){float f=floor(uTime*18.0)+id*31.0,env=sin(h*PI);
          vec2 bend=vec2(jag(h,8.0,f),jag(h,7.0,f+23.0))*(id<.5?.40:.48);
          bend+=vec2(jag(h,72.0,f+71.0),jag(h,68.0,f+121.0))*.075;
          return vec3(h*4.8-2.4,bend*env*uSize);}
        vec3 point(float h,float id,float role){if(role<.5)return current(h,id);
          float root=.16+(role-1.0)*.26+hash(vec2(id,role))*.08,angle=id*2.4+role*2.1;
          vec3 p=current(root,id);float f=floor(uTime*15.0)+id*17.0+role*9.0;
          p+=vec3(h*(.45+hash(vec2(id,role+9.0))*.45)/uStretch,cos(angle)*h*.62,sin(angle)*h*.62)*uSize;
          p.yz+=vec2(jag(h,14.0,f),jag(h,17.0,f+7.0))*sin(h*PI)*.10*uSize;return p;}
        void main(){vUv=uv;float h=position.x,id=position.y,role=aRole;
          float gate=step(id,uQuantity-.5),spark=.3+.7*step(.32,hash(vec2(floor(uTime*13.0),id*7.0+role*11.0)));
          vArcFade=gate*(role<.5?(id<.5?1.0:.48):spark*.55)*(role<.5?1.0:1.0-smoothstep(.65,1.0,h));
          float width=(role<.5?(id<.5?.34:.080):.065*(1.0-h*.82))*uSize;
          vec4 mv=modelViewMatrix*vec4(point(h,id,role),1.0);
          vec4 ahead=modelViewMatrix*vec4(point(min(1.0,h+.035),id,role),1.0),behind=modelViewMatrix*vec4(point(max(0.0,h-.035),id,role),1.0);
          vec2 tangent=ahead.xy-behind.xy;float len=length(tangent);vec2 normal=len>.00001?vec2(-tangent.y,tangent.x)/len:vec2(0.0,1.0);
          mv.xy+=normal*position.z*width*length(modelMatrix[1].xyz);gl_Position=projectionMatrix*mv;}`,{},!1);X(r(12,96,3),e,3).name=`arc-ray-branches`}if(i===2){let e=[],n=[],r=[];for(let t=0;t<5;t++){let i=e.length/3;for(let r=0;r<=64;r++)for(let i=0;i<2;i++)e.push(r/64,i*2-1,t),n.push(r/64,i);for(let e=0;e<64;e++){let t=i+e*2;r.push(t,t+1,t+2,t+1,t+3,t+2)}}let i=new t.BufferGeometry;i.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),i.setAttribute(`uv`,new t.Float32BufferAttribute(n,2)),i.setIndex(r),X(i,Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying float vBlade;${G}
        void main(){float phase=uTime,h=vUv.x,edge=abs(vUv.y*2.0-1.0);float release=smoothstep(1.52,1.60,phase);
          float head=clamp((phase-1.52)*10.0,0.0,1.08);float gate=1.0-smoothstep(head-0.035,head,h);
          float fiber=0.6+0.4*noise2(vec2(h*24.0-uTime*25.0,edge*5.0+vBlade));float core=exp(-edge*edge*24.0);
          float a=(1.0-smoothstep(0.55,1.0,edge))*fiber*release*gate;
          if(vBlade<0.5)a=max(a,exp(-edge*edge*90.0)*0.09);
          gl_FragColor=vec4(uColor*(1.5+core*0.5)+vec3(core*0.65),a*(vBlade<0.5?0.95:0.5));${J}}`,`uniform float uTime;varying vec2 vUv;varying float vBlade;
        void main(){vUv=uv;float h=position.x,id=position.z;vBlade=id;float phase=uTime;float release=smoothstep(1.52,1.60,phase);
          float a=id*1.256637+uTime*0.25;float profile=pow(max(0.0,sin(h*3.14159)),0.55);float diamonds=pow(abs(sin(h*12.56637-phase*3.0)),3.0);
          float width=(id<0.5?0.035:0.05+profile*(0.12+diamonds*0.14))*uSize;
          if(id>0.5)width*=release;float bend=sin(h*15.0-id+uTime*9.0)*0.035*profile*release*uSize;
          vec3 p=vec3(h*4.8-2.4,cos(a)*(position.y*width+bend),sin(a)*(position.y*width+bend));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`),3);let a=Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying float vFade;void main(){float edge=abs(vUv.y*2.0-1.0);float core=exp(-edge*edge*16.0);gl_FragColor=vec4(uColor*1.8+vec3(core*0.35),core*vFade*uDetail);${J}}`,`attribute vec4 seed;uniform float uTime;uniform float uStretch;varying vec2 vUv;varying float vFade;
        void main(){vUv=uv;float phase=uTime,h=uv.x;float charge=min(phase/1.52,1.0);float a=seed.x*6.28318-h*2.6-uTime*2.1;
          float r=(1.0-h)*(0.35+charge*0.65);vec3 p=vec3(-2.4-(1.0-h)*(0.3+seed.y*0.55)/uStretch,cos(a)*r*uSize,sin(a)*r*uSize);
          p.yz+=vec2(cos(a),sin(a))*position.y*0.028*uSize;
          vFade=sin(h*3.14159)*(0.15+charge*0.8)*(1.0-smoothstep(1.55,1.75,phase)*0.40);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`);Z(new t.PlaneGeometry(1,1,32,1),7,.016,a,3)}for(let e of[-1,1]){if(i===3){let t=Y(n,`varying vec2 vUv;varying float vArcFade;uniform float uTime,uEnd,uStretch;${G}
          vec3 point(float h,float id){float frame=floor(uTime*15.0+id*.3),angle=id*2.39996+uEnd*.7;
            float reach=(uEnd<0.0?.62:1.05)*(.55+hash(vec2(id,uEnd))* .6)*uSize;
            float cell=h*18.0,k=floor(cell),j=mix(hash(vec2(k,frame+id*13.0)),hash(vec2(k+1.0,frame+id*13.0)),fract(cell))-.5;
            float r=h*reach;return vec3(uEnd*2.4+(sin(id*4.7)*r*.38+j*.10*uSize*sin(h*PI))/uStretch,cos(angle)*r+j*.16*uSize*sin(h*PI),sin(angle)*r+j*.13*uSize*sin(h*PI));}
          void main(){vUv=uv;float h=position.x,id=position.y;
            float pulse=.2+.8*step(.38,hash(vec2(floor(uTime*12.0+id*.3),id+uEnd*12.0)));
            vArcFade=pulse*(1.0-smoothstep(.55,1.0,h));
            vec4 mv=modelViewMatrix*vec4(point(h,id),1.0),a=modelViewMatrix*vec4(point(min(1.0,h+.04),id),1.0),b=modelViewMatrix*vec4(point(max(0.0,h-.04),id),1.0);
            vec2 d=a.xy-b.xy;float len=length(d);vec2 n=len>.00001?vec2(-d.y,d.x)/len:vec2(0.0,1.0);
            mv.xy+=n*position.z*(.115*(1.0-h*.85))*uSize*length(modelMatrix[1].xyz);gl_Position=projectionMatrix*mv;}`,{uEnd:{value:e}},!1);X(r(9,24),t,2).name=e<0?`arc-source-corona`:`arc-impact-corona`;continue}let a=Y(`uniform vec3 uColor;uniform float uTime;uniform float uEnd;varying vec2 vUv;${G}
        void main(){vec2 p=vUv*2.0-1.0;float r=length(p),a=atan(p.y,p.x);float alpha;
        #if VARIANT == 0
          alpha=band(r-0.58,0.018)+band(r-0.76,0.008)*step(0.65,sin(a*8.0-uTime));
        #elif VARIANT == 1
          float wave=fract(uTime*1.2);alpha=band(r-wave*0.92,0.024)*(1.0-wave)+band(r-0.3,0.018);
        #elif VARIANT == 2
          float phase=uTime,charge=min(phase/1.52,1.0),release=smoothstep(1.61,1.65,phase);
          if(uEnd<0.0){float iris=pow(max(0.0,cos(a*5.0-r*6.0-uTime*2.5)),10.0);alpha=(band(r-0.48,0.016)+iris*band(r-0.64,0.09))*charge+exp(-r*r*18.0)*(0.1+charge*0.6);}
          else{float pulse=fract(max(0.0,phase-1.62)*1.7);alpha=(band(r-0.48,0.02)*0.65+band(r-pulse*0.94,0.035)*(1.0-pulse)+pow(max(0.0,cos(a*9.0+uTime*5.0)),12.0)*exp(-r*4.0))*release;}
        #else
          float n=noise2(vec2(a*12.0,floor(uTime*16.0)));alpha=band(r-0.55-n*0.18,0.018)+pow(max(0.0,sin(a*11.0+uTime*5.0)),32.0)*exp(-r*2.0)*0.5;
        #endif
        gl_FragColor=vec4(uColor*1.4,alpha*0.8*uDetail);${J}}`,ue,{uEnd:{value:e}}),o=X(new t.PlaneGeometry(e<0?1:1.3,e<0?1:1.3),a,2);o.rotation.y=Math.PI/2,o.position.x=e*2.4}}if(r===2){let e=Y(`
      uniform vec3 uColor;uniform float uTime;varying vec2 vUv;${G}
      float segment(vec2 p,vec2 a,vec2 b){vec2 d=b-a;return length(p-a-d*clamp(dot(p-a,d)/dot(d,d),0.0,1.0));}
      float ink(float d,float w){return band(d,w)+exp(-abs(d)*120.0)*0.12;}
      float polygon(vec2 p,float sides,float radius,float rotation){float a=atan(p.y,p.x)+rotation;float sector=2.0*PI/sides;return cos(floor(0.5+a/sector)*sector-a)*length(p)-radius;}
      void main(){
        vec2 p=(vUv-0.5)*2.0;float r=length(p),a=atan(p.y,p.x),t=uTime;
        if(r>0.99)discard;
        float inkSum=ink(r-0.94,0.003)+ink(r-0.9,0.0018)+ink(r-0.74,0.003);
        float spin=a-t*0.09;
        float cells=(spin+PI)/6.28318*36.0;
        vec2 q=vec2((fract(cells)-0.5)*1.8,(r-0.821)*16.0);
        float id=floor(cells);
        float rune=segment(q,vec2(-0.22,-0.42),vec2(-0.22,0.42));
        rune=min(rune,segment(q,vec2(-0.22,0.31),vec2(0.27,0.10+mod(id,3.0)*0.10)));
        rune=min(rune,segment(q,vec2(-0.22,-0.15),vec2(0.28,-0.35)));
        if(mod(id,2.0)<1.0)rune=min(rune,segment(q,vec2(0.25,-0.35),vec2(0.25,0.34)));
        inkSum+=ink(rune,0.035)*step(0.77,r)*(1.0-step(0.875,r));
        float outerTicks=pow(abs(sin(a*48.0+t*0.12)),32.0)*band(r-0.968,0.012);
        inkSum+=outerTicks*0.7;
        #if VARIANT == 0
          // 花瓣與四向治療十字。
          float petals=0.35+0.16*cos(a*8.0+t*0.12);
          inkSum+=ink(r-petals,0.004)+ink(r-0.6,0.002);
          inkSum+=ink(r-0.17,0.004);
          inkSum+=ink(segment(p,vec2(-0.12,0),vec2(0.12,0)),0.022);
          inkSum+=ink(segment(p,vec2(0,-0.12),vec2(0,0.12)),0.022);
          float ang=floor((a+PI/4.0)/(PI/2.0))*PI/2.0;
          vec2 c=vec2(cos(ang),sin(ang))*0.65;
          vec2 d=p-c;
          inkSum+=ink(segment(d,vec2(-0.035,0),vec2(0.035,0)),0.009)+ink(segment(d,vec2(0,-0.035),vec2(0,0.035)),0.009);
        #elif VARIANT == 1
          // 五向炎輪：長短分明的火刃，避免交疊三角形造成雜亂。
          float sector=2.0*PI/5.0;float angle=mod(a-t*0.055+sector*0.5,sector)-sector*0.5;
          vec2 f=vec2(cos(angle),sin(angle))*r;
          float curve=0.12*sin((f.x-0.18)*7.0);
          float blade=ink(f.y-curve,0.008)*smoothstep(0.14,0.24,f.x)*(1.0-smoothstep(0.54,0.65,f.x));
          float echo=ink(f.y+0.055-curve*0.6,0.003)*smoothstep(0.23,0.32,f.x)*(1.0-smoothstep(0.48,0.60,f.x));
          inkSum+=blade+echo;
          inkSum+=ink(r-0.115,0.005)+ink(polygon(p,5.0,0.075,t*0.055),0.007);
          inkSum+=ink(r-0.67,0.003)*step(0.05,cos(a*5.0-t*0.275));
          inkSum+=ink(polygon(p,5.0,0.60,t*0.055),0.0015)*0.6;
        #elif VARIANT == 2
          // 六角冰晶主幹、分枝與雙層六角結界。
          inkSum+=ink(polygon(p,6.0,0.64,0.0),0.004)+ink(polygon(p,6.0,0.53,PI/6.0),0.002);
          float sector=PI/3.0;float local=mod(a+sector*0.5,sector)-sector*0.5;
          vec2 f=vec2(cos(local),sin(local))*r;
          inkSum+=ink(segment(f,vec2(0.08,0),vec2(0.63,0)),0.005);
          inkSum+=ink(segment(f,vec2(0.30,0),vec2(0.42,0.13)),0.004)+ink(segment(f,vec2(0.30,0),vec2(0.42,-0.13)),0.004);
          inkSum+=ink(segment(f,vec2(0.46,0),vec2(0.55,0.09)),0.003)+ink(segment(f,vec2(0.46,0),vec2(0.55,-0.09)),0.003);
          inkSum+=ink(polygon(p,6.0,0.10,0.0),0.008);
        #else
          // 交錯方印、八角邊界與斷續防禦刻度。
          inkSum+=ink(polygon(p,4.0,0.40,t*0.08),0.004)+ink(polygon(p,4.0,0.40,PI/4.0+t*0.08),0.004);
          inkSum+=ink(polygon(p,8.0,0.65,0.0),0.004)+ink(polygon(p,4.0,0.13,-t*0.15),0.01);
          inkSum+=band(r-0.69,0.012)*step(0.1,sin(a*16.0-t*0.3));
        #endif
        float pulse=0.85+sin(t*1.2)*0.15;float accent=0.0;
        #if VARIANT == 0
          float growth=fract(t*0.26);accent=exp(-pow((r-growth)*22.0,2.0))*sin(growth*PI);pulse=0.68+0.24*pow(0.5+0.5*sin(t*1.5),2.0);
        #elif VARIANT == 1
          float sectorHeat=0.5+0.5*sin(a*5.0-t*2.0);accent=sectorHeat*noise2(p*9.0-t*0.7);pulse=0.72+accent*0.3;
        #elif VARIANT == 2
          float freeze=fract(t*0.14);accent=exp(-pow((r-freeze)*30.0,2.0))*sin(freeze*PI);pulse=0.82;
        #else
          accent=pow(max(0.0,cos(a*4.0-t*1.2-r*5.0)),16.0);pulse=0.76;
        #endif
        float alpha=min(inkSum*(0.72+accent*0.65),1.0)*pulse;
        gl_FragColor=vec4(uColor*1.4+vec3(0.04),alpha*uDetail);${J}
      }`),n=X(new t.PlaneGeometry(4.5,4.5),e,1);n.rotation.x=-Math.PI/2,n.position.y=.025,k(n);let r=Y(`
      uniform vec3 uColor;uniform float uTime;varying vec2 vUv;${G}
      void main(){vec2 p=vUv*2.0-1.0;float r=length(p),t=uTime;float a=0.0;vec3 c=uColor;
        #if VARIANT == 0
          float wave=fract(t*0.26);a=exp(-r*r*5.0)*0.035+exp(-pow((r-wave)*18.0,2.0))*sin(wave*PI)*0.12;
        #elif VARIANT == 1
          float n=noise2(p*7.0+vec2(t*0.3,-t*0.4));float vein=pow(1.0-abs(sin(p.x*19.0+p.y*11.0+n*7.0)),7.0);a=(0.025+vein*0.15)*(1.0-smoothstep(0.2,0.87,r));c=uColor*(0.6+n*0.8);
        #elif VARIANT == 2
          float crystal=pow(abs(cos(atan(p.y,p.x)*3.0)),18.0);a=(crystal*0.06+noise2(p*18.0)*0.025)*(1.0-smoothstep(0.4,0.9,r));
        #else
          a=band(r-0.78,0.014)*(0.08+0.07*sin(t*2.0))+exp(-r*r*5.0)*0.025;
        #endif
        gl_FragColor=vec4(c,a*uDetail);${J}}
    `),a=X(new t.PlaneGeometry(4.8,4.8),r,0);if(a.rotation.x=-Math.PI/2,a.position.y=.015,i===3){let e=Y(`
        uniform vec3 uColor;uniform float uTime;varying vec2 vUv;${G}
        void main(){
          vec2 grid=vec2(vUv.x*24.0,vUv.y*12.0);grid.x+=mod(floor(grid.y),2.0)*0.5;vec2 cell=abs(fract(grid)-0.5);
          float tile=band(max(cell.x*0.866+cell.y*0.5,cell.y)-0.44,0.018);
          float latitude=sin(vUv.y*PI*0.5);float scan=exp(-pow((vUv.y-fract(uTime*0.17))*20.0,2.0));
          float alpha=(tile*(0.11+scan*0.22)+scan*0.04)*latitude;
          gl_FragColor=vec4(uColor*(1.0+scan*0.6),alpha*uDetail);${J}}
      `);k(X(new t.SphereGeometry(1.85,40,20,0,Math.PI*2,0,Math.PI/2),e,2))}}if(r===3){if(i===0){let e=Y(`varying vec2 vUv;varying float vSeed;uniform vec3 uColor;uniform float uTime;${G}${ce}
        void main(){vec2 p=vUv*2.0-1.0;float t=uTime;float angle=vSeed*6.28+t*0.45;p=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p;
          float n=fbm(p*3.2+vec2(vSeed*17.0,-t*1.0));float fine=noise2(p*9.0+n*3.0);float d=length(p)+(n-0.5)*0.28;
          float body=smoothstep(0.18,0.70,n+(1.0-d)*0.35);float heat=max(0.0,1.0-t*0.7);
          vec2 fireUv=vec2(vUv.x+sin(vUv.y*8.0-t*4.0)*0.055,vUv.y*vUv.y);
          vec3 burn=flameErosion(fireUv,t*1.3,vSeed*7.0);
          vec3 ember=flameColor(uColor,clamp(n*0.65+burn.y*0.5,0.0,1.0))*mix(0.7,1.1,fine);
          vec3 color=mix(vec3(0.045,0.035,0.028),ember,smoothstep(0.0,0.6,heat));
          float alpha=(1.0-smoothstep(0.45,1.0,d))*body*smoothstep(0.0,0.08,t)*(1.0-smoothstep(0.8,2.0,t));
          alpha*=mix(1.0,0.35+burn.x*0.65,heat);
          #if TOON == 1
            color=mix(styleColor(uColor*.23,.2+n*.65),styleHeat(uColor,.12+n*.33+(1.0-d)*.38+burn.y*.18-p.y*.08),smoothstep(.0,.6,heat));
            alpha=(1.0-smoothstep(.72,.94,d))*smoothstep(.24,.42,n+(1.0-d)*.35)*smoothstep(.0,.08,t)*(1.0-smoothstep(.8,2.0,t));
          #endif
          gl_FragColor=vec4(color,alpha*(TOON==1?.68:.85));${J}}`,`attribute vec4 seed;uniform float uTime;varying vec2 vUv;varying float vSeed;
        void main(){vUv=uv;vSeed=seed.w;float t=uTime,rise=1.0-exp(-t*6.0),a=seed.x*6.28318;
          vec3 p=vec3(cos(a)*rise*(0.15+seed.y*0.65),rise*(0.4+seed.y*1.5)+t*0.2,sin(a)*rise*(0.15+seed.y*0.65))*uSize;p.y-=1.35;
          vec4 mv=modelViewMatrix*vec4(p,1.0);mv.xy+=position.xy*(0.3+rise*1.5)*(0.8+seed.z*0.4)*uSize*length(modelMatrix[1].xyz);gl_Position=projectionMatrix*mv;}`,{},!1);Z(new t.PlaneGeometry(1,1),12,.025,e,1)}if(i===1){if(o){let e=[],n=[],r=[],i=[],a=[];for(let t=71;t>=0;t--){let o=Math.floor(t%36/12),s=t%12+(t>=36?12:0),c=o===0?64:16,l=e.length/3;for(let u=0;u<c;u++){let d=l+u*4;for(let[a,l]of[[0,0],[1,0],[0,1],[1,1]])e.push(u/c,(u+1)/c,t),n.push(a,l),r.push(s),i.push(o);a.push(d,d+1,d+2,d+2,d+1,d+3)}}let o=new t.BufferGeometry;o.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),o.setAttribute(`uv`,new t.Float32BufferAttribute(n,2)),o.setAttribute(`aUnit`,new t.Float32BufferAttribute(r,1)),o.setAttribute(`aRole`,new t.Float32BufferAttribute(i,1)),o.setIndex(a);let s=Y(`uniform vec3 uColor;varying vec2 vStroke;varying float vHalfLength;varying float vFade;
          void main(){float edge=length(vec2(max(0.0,abs(vStroke.x)-vHalfLength),vStroke.y)),core=exp(-edge*edge*180.0),sheath=exp(-edge*edge*40.0),halo=exp(-edge*edge*6.0);
            vec3 cyan=pow(uColor,vec3(.55))*vec3(.65,1.4,1.0),c=mix(uColor,cyan,sheath)+vec3(core*1.5);
            float alpha=(core+sheath*.65+halo*.18)*(1.0-smoothstep(.8,1.0,edge))*vFade;
            gl_FragColor=vec4(c,alpha);${J}gl_FragColor.rgb*=min(1.0,gl_FragColor.a);gl_FragColor.a=min(1.0,gl_FragColor.a)*.6;}`,`uniform float uTime,uQuantity;attribute float aUnit,aRole;varying vec2 vStroke;varying float vHalfLength;varying float vFade;${G}
          vec3 direction(float id){float a=id*2.39996;return normalize(vec3(cos(a),.12+pow(hash(vec2(id,3.0)),2.0)*1.5,sin(a)));}
          vec3 pointOnArc(float id,float h){vec3 dir=direction(id);vec3 side=normalize(cross(dir,vec3(0,1,0)));vec3 up=cross(side,dir);
            float cell=h*8.0,i=floor(cell),f=fract(cell),frame=floor(uTime*18.0);
            float j=mix(hash(vec2(id*3.0+frame,i)),hash(vec2(id*3.0+frame,i+1.0)),f)-.5;
            float k=mix(hash(vec2(id*7.0+frame,i+13.0)),hash(vec2(id*7.0+frame,i+14.0)),f)-.5;
            float fine=h*64.0,fi=floor(fine);float micro=(mix(hash(vec2(id+frame,fi)),hash(vec2(id+frame,fi+1.0)),fract(fine))-.5)*.04;
            return dir*h*(2.4+hash(vec2(id,9.0))*1.25)+(side*(j*.65+micro)+up*k*.40)*sin(h*PI*.9)+vec3(0,sin(h*PI)*(.25+hash(vec2(id,12.0))*.55),0);}
          float pulse(float t,float start,float end){return smoothstep(start,start+.035,t)*(1.0-smoothstep(end-.06,end,t));}
          vec3 branchPoint(float id,float branch,float role,float h,float growth){
            if(role<.5)return pointOnArc(id,h*growth);
            float fork=role<1.5?.3125:.625,offset=role<1.5?1.0:-1.0;vec3 dir=direction(id),side=normalize(cross(dir,vec3(0,1,0))),split=normalize(dir*.5+side*offset*.85+vec3(0,.28,0));
            float child=clamp((growth-fork)/(1.0-fork),0.0,1.0),lengthBranch=.5+hash(vec2(branch,7.0))*.85,cell=h*13.0,i=floor(cell),frame=floor(uTime*15.0)+branch;
            float jag=mix(hash(vec2(frame,i)),hash(vec2(frame,i+1.0)),fract(cell))-.5;
            return pointOnArc(id,fork*growth)+split*h*lengthBranch*child+side*jag*.22*sin(h*PI)*child;
          }
          void main(){float branch=position.z,id=aUnit,h=(position.x+position.y)*.5,t=uTime;
            float delay=.035+hash(vec2(id,5.0))*.085;float growth=clamp((t-delay)*6.5,0.0,1.0);
            vec3 p0=branchPoint(id,branch,aRole,position.x,growth),p1=branchPoint(id,branch,aRole,position.y,growth);float width=.17+hash(vec2(id,2.0))*.08;
            if(aRole>.5)width*=.48*(1.0-h*.75);
            float main=pulse(t,delay,.58+hash(vec2(id,4.0))*.22);
            float echo=pulse(t,.78+hash(vec2(id,8.0))*.27,.93+hash(vec2(id,8.0))*.27)*.8;
            echo+=pulse(t,1.28+hash(vec2(id,6.0))*.34,1.41+hash(vec2(id,6.0))*.34)*.6;
            echo+=pulse(t,1.85+hash(vec2(id,11.0))*.12,1.97+hash(vec2(id,11.0))*.12)*step(.72,hash(vec2(id,12.0)))*.4;
            float flicker=aRole<.5?1.0:.45+.45*hash(vec2(branch,floor(t*(14.0+aRole*3.0))));
            vFade=max(main,echo)*growth*step(aUnit,uQuantity-.5)*flicker*min(1.0,sqrt(12.0/uQuantity));width*=1.0-smoothstep(.88,1.0,h)*.78;
            p0*=uSize;p0.y-=1.20;p1*=uSize;p1.y-=1.20;vec4 m0=modelViewMatrix*vec4(p0,1),m1=modelViewMatrix*vec4(p1,1);vec2 delta=m1.xy-m0.xy;float len=length(delta);vec2 along=len<.0001?vec2(1,0):delta/len;
            width*=uSize*length(modelMatrix[1].xyz);vec4 mv=mix(m0,m1,uv.x);mv.xy+=(along*(uv.x*2.0-1.0)+vec2(-along.y,along.x)*(uv.y*2.0-1.0))*width;
            vHalfLength=len/max(width,.00001)*.5;vStroke=vec2((uv.x*2.0-1.0)*(vHalfLength+1.0),uv.y*2.0-1.0);
            gl_Position=projectionMatrix*mv;}`,{},!1);de(s),X(o,s,2).name=`energy-burst-arcs`;let c=Y(`uniform vec3 uColor;varying vec2 vUv;varying float vFade;
          void main(){vec2 q=vUv*2.0-1.0;float core=exp(-q.y*q.y*90.0),halo=exp(-q.y*q.y*8.0),tip=1.0-smoothstep(.2,1.0,abs(q.x));
            gl_FragColor=vec4(uColor*1.3+vec3(core*1.8),(core+halo*.25)*tip*vFade*uDetail);${J}}`,`attribute vec4 seed;uniform float uTime;varying vec2 vUv;varying float vFade;${G}
          void main(){vUv=uv;float t=uTime,a=seed.x*PI*2.0,dt=max(0.0,t-.09-seed.w*.09);vec3 dir=normalize(vec3(cos(a),.4+seed.y*1.8,sin(a)));
            vec3 p=dir*(.35+(1.0-exp(-dt*3.0))*(1.2+seed.z*1.8));p*=uSize;p.y-=1.2;
            vec4 mv=modelViewMatrix*vec4(p,1);vec2 along=normalize((modelViewMatrix*vec4(dir,0)).xy+vec2(.0001));vec2 side=vec2(-along.y,along.x);
            float jag=(hash(vec2(seed.w*71.0,floor(uv.x*4.0+.01)))-.5)*sin(uv.x*PI);
            mv.xy+=(along*position.x*(.22+seed.z*.45)+side*(jag*.05+position.y*.16))*uSize*length(modelMatrix[1].xyz);
            vFade=smoothstep(.0,.07,dt)*(1.0-smoothstep(.28+seed.z*.15,.65+seed.z*.3,dt));gl_Position=projectionMatrix*mv;}`,{},!1);Z(new t.PlaneGeometry(1,1,4,1),36,.06,c,3)}else{let e=[],n=[],r=[];for(let t=0;t<18;t++){let i=e.length/3;for(let r=0;r<=24;r++)for(let i=0;i<2;i++)e.push(r/24,i*2-1,t),n.push(r/24,i);for(let e=0;e<24;e++){let t=i+e*2;r.push(t,t+1,t+2,t+1,t+3,t+2)}}let i=new t.BufferGeometry;i.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),i.setAttribute(`uv`,new t.Float32BufferAttribute(n,2)),i.setIndex(r),X(i,Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying float vFade;varying float vRay;${G}
        void main(){float edge=abs(vUv.y*2.0-1.0);float core=exp(-edge*edge*28.0);float n=noise2(vec2(vUv.x*21.0,vRay*3.1));
          float erosion=smoothstep(0.08,0.30,n-uTime*0.22+0.25);float front=exp(-pow((vUv.x-fract(uTime*1.6+vRay*0.13))*16.0,2.0));
          float broken=(0.25+0.75*erosion)*(0.6+front*0.7);float alpha=(1.0-smoothstep(0.6,1.0,edge))*vFade*broken;vec3 c=uColor*(1.3+core)+vec3(core*.85);
          #if TOON == 1
            c=styleColor(uColor,.28+core*.55+front*.12);alpha=(1.0-smoothstep(.78,1.0,edge))*vFade*(.35+.65*erosion);
          #endif
          gl_FragColor=vec4(c,alpha);${J}}`,`uniform float uTime;varying vec2 vUv;varying float vFade;varying float vRay;${G}
        void main(){vUv=uv;float id=position.z;vRay=id;float h=position.x,t=uTime,dt=max(0.0,t-0.04-hash(vec2(id,5.0))*0.055);float a=id*2.39996;
          float growth=1.0-exp(-dt*11.0);float lengthRay=(1.5+hash(vec2(id,7.0))*1.8)*growth;
          float outward=0.3+hash(vec2(id,4.0))*0.9;
          vec3 dir=normalize(vec3(cos(a)*outward,0.65+hash(vec2(id,3.0)),sin(a)*outward));
          float bend=sin(h*PI)*sin(floor(h*8.0)*1.7+id)*0.11;
          vec3 p=dir*(h*lengthRay+max(0.0,t-0.3)*0.55);p.xz+=vec2(-sin(a),cos(a))*bend;
          float width=pow(max(0.0,sin(h*PI)),1.2)*(0.09+hash(vec2(id,1.0))*0.13)*growth;
          p.xz+=vec2(-sin(a),cos(a))*position.y*width;p*=uSize;p.y-=1.20;
          vFade=smoothstep(0.04,0.12,t)*(1.0-smoothstep(0.22+hash(vec2(id,9.0))*0.2,0.85,t));
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`),2);let a=Y(`uniform vec3 uColor;varying float vFade;varying vec2 vUv;void main(){vec2 q=vUv*2.0-1.0;float w=0.045+(1.0-vUv.y)*0.25;float d=abs(q.x+q.y*0.32);float rim=(1.0-smoothstep(0.015,0.07,abs(d-w)))+(1.0-smoothstep(w*0.5,w,d))*0.18;rim*=sin(vUv.y*3.14159);vec3 c=uColor*1.8+vec3(.2);
          #if TOON == 1
            c=styleColor(uColor,.38+vUv.y*.42);rim=smoothstep(.12,.25,rim);
          #endif
          gl_FragColor=vec4(c,rim*vFade*uDetail);${J}}`,`attribute vec4 seed;uniform float uTime;varying float vFade;varying vec3 vN;varying vec2 vUv;
        void main(){vUv=uv;float t=max(0.0,uTime-0.09),a=seed.x*6.28318,flight=1.0-exp(-t*3.5);vec3 p=position*vec3(1.0,1.6,1.0)*(0.6+seed.z);
          float b=t*(2.0+seed.z*4.0)+a;mat2 rot=mat2(cos(b),-sin(b),sin(b),cos(b));p.xy=rot*p.xy;vec3 n=normal;n.xy=rot*n.xy;vN=normalMatrix*n;
          p+=vec3(cos(a)*flight*(0.4+seed.z*1.6),flight*(0.6+seed.y*2.2)-t*t*0.35,sin(a)*flight*(0.4+seed.z*1.6));p*=uSize;p.y-=1.25;vFade=smoothstep(0.04,0.16,uTime)*(1.0-smoothstep(0.55,1.65,uTime));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,{},!1);Z(new t.PlaneGeometry(.32,.32),36,.06,a,3)}let e=Y(`uniform float uTime;uniform vec3 uColor;varying vec2 vUv;${G}
        void main(){vec2 p=vUv*2.0-1.0;float r=length(p),a=atan(p.y,p.x),t=uTime;float hot=exp(-r*r*160.0),inner=exp(-r*r*40.0),halo=exp(-r*r*5.0);float spokes=pow(abs(cos(a*3.0)),35.0)*exp(-r*6.0)+exp(-p.y*p.y*1500.0-abs(p.x)*4.0);float fade=smoothstep(0.0,0.035,t)*(1.0-smoothstep(.18,.52,t));vec3 c=mix(uColor,pow(uColor,vec3(.55))*vec3(.65,1.4,1.0),inner)+vec3(hot*2.0);
          gl_FragColor=vec4(c,(hot+inner*.6+halo*.22+spokes*.32)*fade);${J}
          #if TOON == 1
            gl_FragColor.rgb*=min(1.0,gl_FragColor.a);gl_FragColor.a=min(1.0,gl_FragColor.a)*.6;
          #endif
        }`,`uniform float uTime;varying vec2 vUv;
        void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(0,-1.20+uSize*0.12,0,1);mv.xy+=position.xy*uSize*(1.1+min(uTime,.25)*3.6)*length(modelMatrix[1].xyz);gl_Position=projectionMatrix*mv;}`);o&&de(e),X(new t.PlaneGeometry(2,2),e,4)}if(i===2){let e=[],n=[],r=[];for(let t=0;t<7;t++){let i=e.length/3;for(let[r,i]of[[0,0],[1,0],[0,1],[1,1]])e.push(r-.5,i-.5,t),n.push(r,i);r.push(i,i+1,i+2,i+2,i+1,i+3)}let i=new t.BufferGeometry;i.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),i.setAttribute(`uv`,new t.Float32BufferAttribute(n,2)),i.setIndex(r);let a=X(i,Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying float vFade,vSeed;varying vec3 vKeyLight;${G}${q}${le}
        void main(){vec2 q=vUv*2.0-1.0;float turn=uTime*(.9+fract(vSeed*.37)) +vSeed*2.4;q=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*q;
          vec3 n=noiseGradient(q*2.6+vec2(vSeed*17.0,-uTime*.65));float d=length(q)+(n.x-.5)*.30;vec2 optics=smokeOptics(q,n.yz*2.6,n.x,vKeyLight);
          float a=(1.0-smoothstep(.68,.96,d))*smoothstep(.13,.40,n.x)*vFade;
          vec3 c=uColor*(.12+optics.x*.4);
          #if TOON == 1
            c=styleColor(uColor*.52,.16+optics.x*.55+n.x*.18);
          #endif
          gl_FragColor=vec4(c,a*.86);${J}
        }`,`uniform float uTime;varying vec2 vUv;varying float vFade,vSeed;varying vec3 vKeyLight;
        void main(){vUv=uv;float id=position.z;vSeed=id;float seed=fract(id*.618034),t=max(.0,uTime-seed*.14);
          float a=id*2.39996-t*.25,grow=1.0-exp(-t*6.0),roll=t*(1.5+seed*.4);
          float r=.16+grow*(1.05+seed*.45)+t*.28;
          vec3 p=vec3(cos(a)*r,-1.35+(sin(min(roll,3.14159))*.58+.08)*grow,sin(a)*r);p.y=-1.35+(p.y+1.35)*uSize;p.xz*=uSize;
          vec4 mv=modelViewMatrix*vec4(p,1.0);mv.xy+=position.xy*vec2(1.15+seed*.5,.85+seed*.3)*grow*(1.0+t*.25)*uSize*length(modelMatrix[1].xyz);
          vFade=smoothstep(.0,.08,t)*(1.0-smoothstep(.80+seed*.25,1.65+seed*.2,t));vKeyLight=normalize(mat3(viewMatrix)*vec3(-.45,.8,.55));gl_Position=projectionMatrix*mv;
        }`,{},!1),1);a.material.userData.ownLifecycle=!0;let o=Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying float vFade;varying float vSeed;${G}
        void main(){vec2 q=vUv*2.0-1.0;float n=fbm(vec2(q.x*3.0+vSeed*15.0,q.y*4.0-uTime));float width=(0.3+vUv.y*0.5)*(0.55+n*0.6);float a=(1.0-smoothstep(width*0.5,width,abs(q.x)))*sin(vUv.y*PI)*smoothstep(0.22,0.62,n);vec3 c=uColor*(.13+n*.34);
          #if TOON == 1
            c=styleColor(uColor*.7,.20+n*.70);a=(1.0-smoothstep(width*.75,width,abs(q.x)))*sin(vUv.y*PI)*smoothstep(.22,.42,n);
          #endif
          gl_FragColor=vec4(c,a*vFade*.42);${J}}`,`attribute vec4 seed;uniform float uTime;varying vec2 vUv;varying float vFade;varying float vSeed;
        void main(){vUv=uv;vSeed=seed.w;float t=uTime,dt=max(0.0,t-seed.w*0.10),a=seed.x*6.28318;float rise=1.0-exp(-dt*8.0),h=uv.y;
          float r=h*rise*(0.35+seed.z*1.0)+dt*0.2;vec3 p=vec3(cos(a)*r,h*rise*(.7+seed.y*1.0)-h*dt*dt*0.75,sin(a)*r);
          p*=uSize;p.y-=1.34;vec4 mv=modelViewMatrix*vec4(p,1.0);mv.x+=position.x*(0.16+h*0.75)*rise*uSize*length(modelMatrix[1].xyz);
          vFade=smoothstep(0.01,0.10,dt)*(1.0-smoothstep(0.25+seed.y*0.15,1.2,dt));gl_Position=projectionMatrix*mv;}`,{},!1,{CLOUD:1});Z(new t.PlaneGeometry(1,1,1,12),18,.045,o,2);let s=Y(`uniform vec3 uColor;varying float vFade;varying vec3 vN;void main(){float l=0.3+max(0.0,dot(normalize(vN),normalize(vec3(-0.5,0.8,0.3))));vec3 c=uColor*l*.25;
          #if TOON == 1
            c=styleColor(uColor*.35,l*.65);
          #endif
          gl_FragColor=vec4(c,vFade*uDetail);${J}}`,`attribute vec4 seed;uniform float uTime;varying float vFade;varying vec3 vN;
        void main(){float t=uTime,a=seed.x*6.28318;vec3 p=position*vec3(1.3,0.4,0.8)*(0.4+seed.w);float spin=a+t*7.0;mat2 rot=mat2(cos(spin),-sin(spin),sin(spin),cos(spin));p.xy=rot*p.xy;vec3 n=normal;n.xy=rot*n.xy;vN=normalMatrix*n;
          p+=vec3(cos(a)*t*(0.8+seed.z),max(0.02,(1.8+seed.y*1.8)*t-3.0*t*t),sin(a)*t*(0.8+seed.z));p*=uSize;p.y-=1.35;vFade=smoothstep(0.0,0.05,t)*(1.0-smoothstep(0.55,1.5,t));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,{},!1);Z(new t.TetrahedronGeometry(.075),28,.055,s,3)}if(i===3){let e=[],n=[],r=[],i=[];for(let t=0;t<18;t++){let a=t<9?t/9:(t-9+.5)/9,o=a*Math.PI*2,s=t===0?0:.25+t%3*.12,c=1.3+t%4*.35,l=[Math.cos(o)*s,0,Math.sin(o)*s],u=[[0,-.12,0],[.19,.4,0],[0,.4,.19],[-.19,.4,0],[0,.4,-.19],[Math.cos(o)*.35,c,Math.sin(o)*.35]];for(let o of[[0,2,1],[0,3,2],[0,4,3],[0,1,4],[5,1,2],[5,2,3],[5,3,4],[5,4,1]])for(let s of o)e.push(...u[s]),n.push(...l),r.push(a),i.push(t)}let a=new t.BufferGeometry;a.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),a.setAttribute(`aCenter`,new t.Float32BufferAttribute(n,3)),a.setAttribute(`aSeed`,new t.Float32BufferAttribute(r,1)),a.setAttribute(`aUnit`,new t.Float32BufferAttribute(i,1)),a.computeVertexNormals();let o=Y(`uniform vec3 uColor;uniform float uTime;varying vec3 vN;varying vec3 vCrystal;varying float vFade;${G}
        void main(){float light=0.3+max(dot(normalize(vN),normalize(vec3(-0.6,0.8,0.3))),0.0);
          float n=noise2(vCrystal.xy*8.0+vCrystal.z*5.0);float crack=1.0-smoothstep(0.03,0.12,abs(sin(vCrystal.y*17.0+vCrystal.x*23.0+n*4.0)));
          #if TOON == 1
            crack=1.0-smoothstep(.04,.13,abs(sin(vCrystal.y*7.0+vCrystal.x*9.0+n)));
          #endif
          float fracture=smoothstep(0.10,0.35,uTime)*crack;float dissolve=smoothstep(0.0,0.14,n-(uTime-0.8)*0.65);
          vec3 c=uColor*(0.3+light*0.6+fracture*0.8)+vec3(pow(light,6.0)*0.3);
#if TOON == 1
            c=styleColor(uColor,.14+light*.55+fracture*.22);
          #endif
          gl_FragColor=vec4(c,vFade*dissolve);${J}}`,`attribute vec3 aCenter;attribute float aSeed,aUnit;uniform float uTime,uQuantity;varying vec3 vN;varying vec3 vCrystal;varying float vFade;
        void main(){vCrystal=position;float t=uTime,growth=smoothstep(0.0,0.16,t),flight=max(0.0,t-0.24);vec3 p=position*growth*uSize;float a=aSeed*6.28318;float spin=flight*(aSeed-0.5)*2.0;mat2 rot=mat2(cos(spin),-sin(spin),sin(spin),cos(spin));p.xy=rot*p.xy;vec3 n=normal;n.xy=rot*n.xy;vN=normalMatrix*n;
          p+=aCenter+vec3(cos(a)*flight*1.5,-1.35+flight*(1.3+aSeed)-flight*flight*2.0,sin(a)*flight*1.5);vFade=(1.0-smoothstep(0.8,1.7,t))*step(aUnit,uQuantity-.5);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,{},!1);X(a,o,2).name=`ice-shatter-crystals`}if(i===3){let e=Y(`uniform vec3 uColor;varying float vFade;varying vec3 vN;void main(){float light=0.35+max(dot(normalize(vN),normalize(vec3(-0.6,0.8,0.4))),0.0);vec3 c=uColor*(.7+light);
        #if TOON == 1
          c=styleColor(uColor,light*.7);
        #endif
        gl_FragColor=vec4(c,vFade*uDetail);${J}}`,`
        attribute vec4 seed;uniform float uTime;varying float vFade;varying vec3 vN;
        void main(){float t=uTime,a=seed.x*6.28318;float dt=max(0.0,t-seed.w*0.1);float speed=0.5+seed.z*1.4;vec3 c=vec3(cos(a)*dt*speed,max(-1.32,-1.32+(2.0+seed.y*3.8)*dt-2.4*dt*dt),sin(a)*dt*speed);vec3 p=position;p.y*=2.2;float spin=a+t*2.0;mat2 rot=mat2(cos(spin),-sin(spin),sin(spin),cos(spin));p.xy=rot*p.xy;p*=0.6+seed.z;vN=normalMatrix*normal;vFade=pow(max(0.0,1.0-t/2.8),1.3);gl_Position=projectionMatrix*modelViewMatrix*vec4(c+p,1.0);}
      `,{},!1);Z(new t.OctahedronGeometry(.12),Math.ceil(s*.08),.08,e,2)}let e=[],n=[],r=[];for(let t=0;t<10;t++){let i=e.length/3;for(let r=0;r<=16;r++)for(let i=0;i<2;i++)e.push(i*2-1,r/16,t/10*2*Math.PI),n.push(i,r/16);for(let e=0;e<16;e++){let t=i+e*2;r.push(t,t+1,t+2,t+1,t+3,t+2)}}let a=new t.BufferGeometry;a.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),a.setAttribute(`uv`,new t.Float32BufferAttribute(n,2)),a.setIndex(r);let c=Y(`
      uniform vec3 uColor;uniform float uTime;varying vec2 vUv;${G}
      void main(){float t=uTime;float side=1.0-smoothstep(0.1,1.0,abs(vUv.x*2.0-1.0));float n=fbm(vec2(vUv.x*4.0,vUv.y*8.0-t*4.0));float mask=smoothstep(0.2,0.75,n+side*0.3);float life=smoothstep(0.0,0.1,t)*(1.0-smoothstep(0.15,0.75,t));vec3 c=uColor*1.5;
      #if TOON == 1
        c=styleHeat(uColor,.25+n*.6);mask=smoothstep(.32,.46,n+side*.3);
      #endif
      gl_FragColor=vec4(c,side*mask*life*(1.0-vUv.y)*0.6);${J}}
    `,`
      uniform float uTime;varying vec2 vUv;
      void main(){vUv=uv;float t=uTime,h=position.y,a=position.z;float growth=1.0-exp(-t*7.0);float height=2.0+sin(a*7.1)*0.7;float rad=h*growth*(0.55+sin(a*4.0)*0.18);
        vec3 p=vec3(cos(a)*rad,-1.35+h*height*growth,sin(a)*rad);float width=(1.0-h)*0.35*growth;
        p.xz+=vec2(-sin(a),cos(a))*position.x*width;p.y-=max(0.0,t-0.5)*h*0.6;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}
    `,{},i!==2);i===0?k(X(a,c,2),`xyz`,-1.35):a.dispose();let l=Y(`
      uniform vec3 uColor;uniform float uTime;varying vec2 vUv;${G}
      void main(){vec2 p=vUv*2.0-1.0;float r=length(p),t=uTime;float radius=(1.0-exp(-t*3.5))*0.82;float wave=exp(-pow((r-radius)*45.0,2.0));float dust=exp(-pow((r-radius+0.07)*14.0,2.0))*fbm(p*8.0)*0.45;float fade=pow(max(0.0,1.0-t/2.4),2.0);float alpha=(wave*0.7+dust)*fade;
        #if VARIANT == 0
          alpha*=0.22;
        #elif VARIANT == 1
          alpha=(wave*.22+dust*.28+exp(-r*r*12.0)*.18)*smoothstep(.0,.08,t)*(1.0-smoothstep(.32,.8,t));
        #elif VARIANT == 2
          float corrugation=noise2(p*14.0);float compress=pow(max(0.0,cos((r-radius)*110.0+corrugation*2.0)),12.0);
          float wake=exp(-pow((r-radius+0.055)*20.0,2.0));alpha=(wave*0.24+compress*wake*0.20)*fade*(1.0-smoothstep(0.4,1.1,t));
        #else
          float a=atan(p.y,p.x);alpha=(wave*0.35+band(r-radius*0.55,0.004)*step(0.1,cos(a*12.0)))*fade;
        #endif
        vec3 c=uColor*(.7+wave);
        #if TOON == 1
          c=styleColor(uColor,.35+wave*.5);
          #if VARIANT == 1
            c=pow(uColor,vec3(.55))*vec3(.65,1.4,1.0)+vec3(wave*.2);
          #endif
        #endif
        gl_FragColor=vec4(c,alpha);${J}}
    `),u=X(new t.PlaneGeometry(7,7),l,2);u.rotation.x=-Math.PI/2,u.position.y=-1.36,i===1&&(l.blending=t.AdditiveBlending,k(u,`xz`))}if(r===4){let e=[],n=[],r=[],a=o&&(i===2||i===3),s=o?i===0?16:i===3?18:22:i===0?30:i===3?28:44,c=o&&i===1;for(let t=0;t<(c?s*2:s);t++){let l=a&&i===3?18:c&&t>=s?20:c?1:o?20:36,u=a&&i===3?5:c&&t>=s?6:c?1:o?6:2,d=e.length/3;for(let r=0;r<=l;r++)for(let i=0;i<=u;i++)e.push(r/l,i/u*2-1,t),n.push(r/l,i/u);for(let e=0;e<l;e++)for(let t=0;t<u;t++){let n=u+1,i=d+e*n+t;r.push(i,i+1,i+n,i+1,i+n+1,i+n)}}let l=new t.BufferGeometry;l.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),l.setAttribute(`uv`,new t.Float32BufferAttribute(n,2)),l.setIndex(r);let u=`uniform float uTime,uRetire,uOpening,uStoppedAt;varying float vVolume;varying vec2 vUv;varying float vLight;varying float vSeed;varying float vFade;varying float vHeight;${G}${q}
      void main(){vUv=uv;vVolume=0.0;float s=position.x,id=position.z;
        #if TOON == 1 && (VARIANT == 1 || VARIANT == 2)
          vVolume=id<22.0?1.0:0.0;id=mod(id,22.0);
        #endif
        vSeed=id;float t=uStoppedAt<0.0?uTime:uStoppedAt+1.4*(uRetire-.35*uRetire*uRetire);
        float r1=hash(vec2(id,1.0)),r2=hash(vec2(id,3.0)),r3=hash(vec2(id,7.0));float phase=r1;
        #if TOON == 1 && (VARIANT == 1 || VARIANT == 2)
        if(vVolume>.5){ float born=fract(hash(vec2(id,23.7))+(uStoppedAt<0.0?uTime:uStoppedAt)*(.14+r2*.035));
          float h=born,spin=id*2.399963-uTime*(2.0+r2*.3)+h*3.0;
          float radius=.30+pow(h,1.3)*1.45+.22*(1.0-smoothstep(.05,.55,h));
          vec3 p=vec3(cos(spin)*radius,h*3.5,sin(spin)*radius);
          float release=smoothstep(r2*.16,.95,uRetire);
          #if VARIANT == 1
            p.y-=release*release*(1.7+h*2.4);p.xz*=1.0+release*.22;
          #else
            p.y+=release*(.8+h*.6);p.xz+=vec2(-sin(spin),cos(spin))*release*.6;
          #endif
          // 沙團先沿外側切線捲入，略早於主柱就位，避免懸浮外圈與中柱脫節。
          float gather=(1.0-smoothstep(.02,.78,uOpening))*(1.0-smoothstep(0.0,.6,uRetire));
          p.xz+=vec2(-sin(spin),cos(spin))*gather*(1.2+h*1.5);p.xz*=1.0+gather*.38;p.y+=gather*h*.35;
          p*=uSize;p.y-=1.4;
          float width=(.65+h*.75)*( .88+r3*.24)*(1.0+gather*.15);
          vec4 mv=modelViewMatrix*vec4(p,1.0);vec2 tangent=normalize((modelViewMatrix*vec4(-sin(spin),.48,cos(spin),0.0)).xy+vec2(.0001));
          mv.xy+=mat2(tangent.x,tangent.y,-tangent.y,tangent.x)*(uv-.5)*width*uSize*vec2(1.55,VARIANT==2?.40:.56)*length(modelMatrix[1].xyz);
          vLight=spin;vHeight=h;vFade=smoothstep(0.0,.12,uOpening)*smoothstep(.0,.09,h)*(1.0-smoothstep(.88,1.0,h))*(1.0-smoothstep(.72,1.0,uRetire));
          #if VARIANT == 1
            vFade*=smoothstep(-1.5,-1.12,p.y);
          #endif
          gl_Position=projectionMatrix*mv;return; }
        #endif
        #if VARIANT == 1 || VARIANT == 2
          float exitAge=smoothstep(.02+r2*.34,.92,uRetire);s=mix(s,.24+r3*.45,exitAge*(VARIANT==1?.24:.12));
        #endif
        float life=fract(r1+t*(0.065+r2*0.055));
        float h=0.025+life*0.77+s*(0.12+r3*0.23);
        #if TOON == 1
          // Adjacent sheets share a large eddy; unequal lengths keep their ends from lining up.
          float family=id,lane=0.0;
          phase=fract(id*.6180339);
          #if VARIANT != 0
            phase=hash(vec2(id,23.7));
          #endif
          life=fract(phase+(uStoppedAt<0.0?t:uStoppedAt)*(.072+hash(vec2(family,8.0))*.025));if(uStoppedAt>=0.0)life=min(1.0,life+uRetire*.27);
          h=.025+life*.68+s*(.18+r3*.13);
          #if VARIANT != 0
            life=fract(phase+(uStoppedAt<0.0?t:uStoppedAt)*(.10+r2*.025));
            h=.02+life*.52+s*(.27+r3*.21);
            if(mod(id,5.0)<.5)h=.025+s*.40;
          #endif
        #endif
        float lean=sin(h*3.0+t*0.45)*h*0.22;
        #if TOON == 1 && VARIANT == 3
          s=mix(s,.2+r2*.5,smoothstep(.02+r3*.12,.85,uRetire)*.80);
        #endif
        float pitch=1.2+r2*3.1;
        float a=r3*PI*2.0+s*pitch-t*(2.0+r2*0.65)+sin(s*5.0+t*0.7+id)*0.18;
        #if TOON == 1
          // Keep azimuth separate from lifetime phase: adding both golden angles collapses every start onto the same side.
          a=family*2.39996323+s*(3.5+r2*1.2)-t*(2.05+phase*.2)+lane*.16;
          a+=sin(h*5.0-t*.65)*.28+sin(s*PI)*sin(s*4.0-t*.8+phase*6.28)*.22;
          #if VARIANT == 1 || VARIANT == 2
            a-=exitAge*(.2+r3*1.3);
          #endif
        #endif
        float taper=pow(max(0.0,sin(s*PI)),0.55+r2*0.8);
        float width=(0.045+h*(0.10+r1*0.17))*taper;
        if(mod(id,6.0)<0.5)width*=1.8;
        #if TOON == 1
          width*=1.8+(.5+.5*sin(id*2.3))*.25;
          #if VARIANT != 0
            width+=.08*taper*(1.0-h*.6);
          #endif
        #endif
        #if VARIANT == 0
          width*=0.75;
        #elif VARIANT == 1
          width*=1.2;
        #elif VARIANT == 3
          width*=0.65;a+=sin(s*9.0+id)*0.12;
        #endif
        float tear=(sin(s*47.0+t*3.0+id)*0.022+sin(s*97.0-t*4.0)*0.008)*taper;
        float curl=sin(s*PI)*sin(s*6.0+t*0.8+id)*0.15;
        float y=h*3.55+curl+position.y*(width+tear*abs(position.y));
        float radius=(0.08+pow(h,1.35)*1.2+pow(h,4.0)*0.65)*(0.72+r3*0.40);
        radius+=sin(s*9.0-t*0.9+id)*0.07*h+position.y*width*0.4;
        #if TOON == 1
          radius+=.22*(1.0-smoothstep(.08,.55,h));
          #if VARIANT != 0
            radius-=pow(h,4.0)*.25;
            radius+=sin(h*5.0-t*.9+id*.6)*.10*sin(s*PI);
          #endif
          // Roll each cross-section into an open crescent, instead of a flat strip.
          float roll=sin(h*4.5-t*.9+phase*2.0)*.65+sin(s*PI)*.5;
          #if VARIANT == 1 || VARIANT == 2
            roll+=exitAge*(1.8+r3)*sin(s*PI);
          #endif
          float across=position.y*1.9+roll;
          float center=cos(roll),edge=cos(across);
          radius+=(edge-center)*width*.95+sin(h*7.0-t*.8)*.08*sin(s*PI);
          #if VARIANT == 1 || VARIANT == 2
            float roundExit=smoothstep(.04,.55,uRetire);
            radius=mix(radius,radius-(edge-center)*width*.95+cos(position.y*PI+roll)*width*.7,roundExit);
          #endif
          y=h*3.55+curl+(sin(across)-sin(roll))*width*1.3;
          #if VARIANT == 1 || VARIANT == 2
            y=mix(y,h*3.55+curl+sin(position.y*PI+roll)*width*.7,roundExit);
          #endif
          y+=sin(h*4.0-t*.9+phase*2.0)*.10*sin(s*PI);
          #if VARIANT == 3
            radius+=(cos(position.y*PI)-1.0)*width*.42;
            y=h*3.55+curl+sin(position.y*PI)*width*.42;
          #endif
          a+=lane*.035*(1.0-smoothstep(.4,1.0,h));
        #endif
        vec3 p=vec3(cos(a)*radius+lean,y,sin(a)*radius);
        p.z+=sin(h*4.0+t*0.31)*h*0.10;
        vec3 eddy=curlFlow(p*1.1,t);
        p+=eddy*(0.07+h*0.12);
        vLight=clamp(0.5+0.5*sin(a-0.8)+eddy.y*0.12,0.0,1.0);
        #if TOON == 1
          vec3 surfaceNormal=vec3(cos(a)*cos(across),-sin(across),sin(a)*cos(across));
          vLight=clamp(.45+dot(surfaceNormal,vec3(-.38,.58,.72))*.52+eddy.y*.08,0.0,1.0);
        #endif
        float peel=smoothstep(phase*.09,.85,uRetire);vec2 tangent=vec2(-sin(a),cos(a));
        #if VARIANT == 1 || VARIANT == 2
          p.xz+=tangent*exitAge*(.12+r2*.32);
        #else
          p.xz+=tangent*peel*(.8+h*1.15);p.xz*=1.0+peel*.38;p.y+=peel*h*.35;
        #endif
        #if VARIANT == 1
          float collapse=exitAge;
          float sag=smoothstep(.0,.7,collapse)*(.35+.65*pow(s,1.5));
          p.y-=collapse*collapse*(2.4+r3*2.4)+sag*width;
          p.xz*=1.0+collapse*.12;p.y-=position.y*width*collapse*.5;
        #elif VARIANT == 2
          p.y+=exitAge*(.85+phase*.9);p.xz*=1.0+exitAge*.12;
        #endif
        vHeight=h;float gather=(1.0-smoothstep(.04,1.0,uOpening))*(1.0-smoothstep(0.0,.6,uRetire));
        // 重用收尾的切向鬆散形態，從外圍捲回；旋轉時間繼續向前，不倒播。
        p.xz+=tangent*gather*(.8+h*1.15);p.xz*=1.0+gather*.38;p.y+=gather*h*.35;
        p*=uSize;p.y-=1.4;
        vFade=smoothstep(0.0,.12,uOpening)*smoothstep(0.0,0.10,life)*(1.0-smoothstep(0.85,1.0,life));vFade*=1.0-smoothstep(.48+phase*.18,.88+phase*.1,uRetire);
        #if VARIANT == 1
          vFade*=smoothstep(-1.4,-1.1,p.y);
        #endif
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,d=`uniform vec3 uColor;uniform float uTime,uRetire,uOpening;uniform float uGlow;varying float vVolume;varying vec2 vUv;varying float vLight;varying float vSeed;varying float vFade;varying float vHeight;${G}${q}${le}${ce}
      void main(){
        #if TOON == 1 && (VARIANT == 1 || VARIANT == 2)
        if(vVolume>.5){ vec2 q=vUv*2.0-1.0;float spin=-uTime*.8+vSeed*.7;q=mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*q;
          vec3 n=noiseGradient(q*2.4+vec2(vSeed*9.0,-uTime*.45));float d=length(q)+(n.x-.5)*.35;
          vec3 key=vec3(-.45,.8,.55);vec2 optics=smokeOptics(q,n.yz*2.4,n.x,key);
          float a=(1.0-smoothstep(.73,.98,d))*smoothstep(.02,.18,n.x+(1.0-d)*.3)*vFade;
          vec3 c=styleColor(uColor*.8,.20+optics.x*.44+n.x*.10);
          #if VARIANT == 2
            float burn=smoothstep(.08,.95,uRetire),heat=.16+optics.x*.15+n.x*.20+pow(max(0.0,1.0-abs(q.y)),1.4)*.43;
            a*=smoothstep(.10+burn*.50,.23+burn*.48,n.x+(1.0-d)*.35);
            c=styleHeat(uColor,heat);c=mix(c,uColor*vec3(.26,.075,.03),burn*.65);
          #endif
          a*=VARIANT==2?.46:.42;if(a<.004)discard;gl_FragColor=vec4(c,a);${J}return; }
        #endif
        float s=vUv.x,w=vUv.y;
        vec2 skew=vec2(s+w*0.28,w+s*0.16);
        float warp=noise2(skew*vec2(8.0,3.0)+vec2(-uTime*0.55,vSeed*2.3));
        #if TOON == 1
          float family=vSeed;
          float n=noise2(vec2(s*7.0-uTime*.95,w*2.1+family*3.7+warp*.6));
        #else
          float n=fbm(vec2(s*25.0-uTime*(1.2+fract(vSeed*0.13)),w*5.0+vSeed*3.7+warp*1.5));
        #endif
        float fiber=noise2(vec2(s*10.0-uTime*2.0,w*31.0+vSeed));
        float rim=abs(w*2.0-1.0);
        float silhouette=1.0-smoothstep(0.56+n*0.3,0.72+n*0.28,rim);
        float split=smoothstep(0.20,0.46,n+sin(w*29.0+s*7.0)*0.09);
        #if TOON == 1
          split=smoothstep(.18,.36,n);
          #if VARIANT == 1
            split=smoothstep(.28,.47,n);
          #endif
        #endif
        float tip=smoothstep(0.0,0.04,s)*(1.0-smoothstep(0.80,1.0,s));
        float departure=smoothstep(uRetire*.85-.15,uRetire*.85+.08,n*.55+(1.0-s)*.45);float alpha=silhouette*split*tip*vFade*departure;
        #if VARIANT == 2
          float delay=fract(vSeed*.381966)*.24+vHeight*.16;
          float exitBurn=smoothstep(.04+delay,.80+delay*.25,uRetire);
          float flameFront=n*.60+sin(s*PI)*.4-exitBurn*.82;alpha*=smoothstep(-.03,.10,flameFront);
          alpha*=1.0-smoothstep(.60,.95,uRetire+fract(vSeed*.23)*.15);
        #elif VARIANT == 1
          float grain=noise2(vec2(s*21.0,w*34.0-uTime*2.0+vSeed));
          alpha*=mix(1.0,smoothstep(.18,.40,grain),smoothstep(.10,.55,uRetire));
          alpha*=smoothstep(uRetire*.55-.08,uRetire*.55+.12,n);
        #endif
        float crest=exp(-pow((w-0.68-(n-0.5)*0.32)*18.0,2.0));
        float streak=pow(max(0.0,sin(w*48.0+n*6.0+s*3.0)),16.0);
        vec3 c;float lum=0.25+vLight*0.75;
        #if VARIANT == 0
          c=uColor*(0.12+lum*0.6+crest*0.8);alpha*=0.6;
        #elif VARIANT == 1
          c=uColor*(0.09+lum*0.4+fiber*0.13);alpha*=0.85;
        #elif VARIANT == 2
          #if TOON == 1
            float fireNoise=noise2(vec2(w*4.0+vSeed,s*11.0-uTime*2.4));
            vec3 burn=vec3(smoothstep(.20,.40,fireNoise),fireNoise,styleStep(.68,fireNoise)*.5);
          #else
            vec3 burn=flameErosion(vec2(w,s*2.0),uTime*1.3,vSeed*0.37);
          #endif
          alpha*=burn.x;
          c=flameColor(uColor,burn.y*0.90+lum*0.08)*(0.40+lum*0.6);
          if(!gl_FrontFacing)c*=0.38;
          c+=uColor*burn.z*0.55;
          crest=max(crest*0.45,burn.z*0.7);
        #else
          float gaps=step(0.12,fract(s*7.0+vSeed*0.3));
          #if TOON == 0
            alpha*=gaps;
          #endif
          c=uColor*(0.1+lum*0.7+crest*1.2);
        #endif
        #if TOON == 1
          c=styleColor(uColor,.15+vLight*.6+n*.18+crest*.16);
          #if VARIANT == 1
            c=styleColor(uColor*.82,.20+vLight*.37+n*.12+crest*.08);
          #elif VARIANT == 2
            float warmth=.19+vLight*.32+n*.33+crest*.11;
            c=styleHeat(uColor,warmth);if(!gl_FrontFacing)c*=.70;
          #elif VARIANT == 3
            float packet=pow(max(0.0,sin(s*12.0-uTime*4.5+vSeed*1.3)),6.0);
            c=styleColor(uColor,.20+vLight*.36+packet*.33+crest*.12);
          #endif
        #endif
        if(uGlow>0.5){
          alpha*=crest*(0.25+lum*0.75)+streak*0.10;
          if(!gl_FrontFacing)alpha*=0.3;
          #if VARIANT == 1
            alpha*=0.12;
          #elif VARIANT == 0
            alpha*=0.35;
          #endif
          c=uColor*1.7+vec3(0.3,0.19,0.07)*crest;alpha*=uDetail*0.8;
        }
        #if TOON == 1
          if(uGlow>.5){c=styleColor(uColor,.82);alpha*=.28;}
          // In-material contour ink: screen-space width, no outline mesh or full-screen pass.
          float contour=.65+n*.28-rim;
          contour=min(contour,min(s*5.0,(1.0-s)*2.0));
          float pixel=max(fwidth(contour),.002);
          float ink=1.0-smoothstep(pixel*.5,pixel*1.9,contour);
          float edgeCoverage=smoothstep(-pixel,pixel,contour);
          alpha*=edgeCoverage;
          vec3 inkColor=mix(vec3(.012,.016,.022),uColor*.055,.65);
          c=mix(c,inkColor,ink*(VARIANT==0?.55:.25)*(1.0-uRetire*.7));
          #if VARIANT == 2
            c=mix(c,uColor*vec3(.22,.045,.012),smoothstep(.35,.9,uRetire)*.82);
          #endif
        #endif
        #if TOON == 1 && (VARIANT == 1 || VARIANT == 2)
          alpha*=VARIANT==2?.90:.62;
        #endif
        #if TOON == 1 && VARIANT == 3
          // 亮紋沿捲曲表面的縱向傳遞，避免插值光量跨三角形形成大片亮折面。
          float track=.49+.15*sin(s*5.0-uTime*.6+vSeed*1.3);
          float stripe=1.0-smoothstep(.035,.15,abs(w-track));
          float chargePhase=fract(s*2.4-uTime*.8+vSeed*.23);
          float pulse=smoothstep(.05,.24,chargePhase)*(1.0-smoothstep(.68,.94,chargePhase));
          float light=.29+vLight*.13+stripe*(.24+pulse*.33);
          c=styleColor(uColor,light);
          float cut=smoothstep(.08,.8,uRetire);float islands=smoothstep(.15+cut*.40,.27+cut*.42,noise2(vec2(s*9.0-uTime*.6,vSeed*2.7)));
          alpha=silhouette*split*tip*vFade*departure*(.84+stripe*.10)*islands;
        #endif
        gl_FragColor=vec4(c,alpha);${J}}`,f=X(l,Y(d,a?u.replaceAll(`VARIANT`,`FLOW_VARIANT`).replace(`width*=0.75;`,i===2?`width*=1.10;`:`width*=1.23;`).replace(`vHeight=h;float gather=`,`p.xz*=1.20;p.y*=1.08;vHeight=h;float gather=`):u,{uGlow:{value:0},uRetire:V.uLifeEnd,uOpening:V.uLifeStart,uStoppedAt:V.uStopTime},!1,a?{FLOW_VARIANT:0}:{}),2);f.name=`vortex-column`,f.material.userData.ownLifecycle=!0,o||X(l.clone(),Y(d,u,{uGlow:{value:1},uRetire:V.uLifeEnd,uOpening:V.uLifeStart,uStoppedAt:V.uStopTime}),3);let p=Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;varying float vSeed;varying float vFade;varying float vInner;varying vec3 vKeyLight;${G}${q}${le}
      void main(){vec2 q=vUv*2.0-1.0;vec2 original=q;float spin=vSeed*6.28-uTime*(0.4+vSeed*0.3);
        q=mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*q;
        vec3 broad=noiseGradient(q*2.8+vec2(vSeed*27.0,-uTime*0.25));
        #if TOON == 1
          vec3 fine=broad;
        #else
          vec3 fine=noiseGradient(q*6.1+vec2(vSeed*11.0,-uTime*0.5));
        #endif
        float n=broad.x*0.72+fine.x*0.28;
        vec2 gradient=mat2(cos(spin),sin(spin),-sin(spin),cos(spin))*(broad.yz*2.8*0.72+fine.yz*6.1*0.28);
        float d=length(q)+(n-0.5)*0.45;
        vec2 optics=smokeOptics(original,gradient,n,vKeyLight);
        float a=(1.0-smoothstep(0.30,1.0,d))*smoothstep(0.15,0.65,n)*optics.y*vFade*1.35;
        vec3 c=uColor*(0.05+optics.x*0.6);
        #if VARIANT == 2
          float illumination=vInner*(0.3+max(0.0,-original.y)*0.7);
          c=vec3(0.028,0.025,0.023)*(0.4+optics.x)+uColor*illumination*(0.2+optics.y*0.45);
        #elif VARIANT == 3
          c+=uColor*vInner*0.13;a*=0.45;
        #endif
        #if TOON == 1
          c=styleColor(uColor*.48,.16+optics.x*.60+n*.2);
          #if VARIANT == 2
            c=mix(styleColor(vec3(.12,.09,.065),optics.x),styleHeat(uColor,.35+vInner*.4)*.48,vInner*.7);
          #elif VARIANT == 3
            c=styleColor(uColor*.55,.18+optics.x*.6+vInner*.2);
          #endif
          a=(1.0-smoothstep(.62,.94,d))*smoothstep(.20,.40,n)*vFade*.80;
          #if VARIANT != 0
            a=(1.0-smoothstep(.70,.98,d))*smoothstep(.05,.22,n+(1.0-d)*.25)*vFade*.73;
          #endif
          #if VARIANT == 3
            a*=.45;
          #endif
        #endif
        gl_FragColor=vec4(c,a*uDetail);${J}}`,`attribute vec4 seed;uniform float uTime,uStopTime;varying vec2 vUv;varying float vSeed;varying float vFade;varying float vInner;varying vec3 vKeyLight;${G}${q}
      void main(){vUv=uv;vSeed=seed.w;vKeyLight=normalize(mat3(viewMatrix)*vec3(-0.45,0.8,0.55));
        float rate=.15+seed.w*.08;float life=uStopTime<0.0?fract(seed.y+uTime*rate):min(1.0,fract(seed.y+uStopTime*rate)+(uTime-uStopTime)*.55),a=seed.x*6.28318-uTime*1.2-life*3.0;
        float roll=life*6.28318+seed.z*3.14159;
        float r=(2.2-life*1.7)*(0.7+seed.z*0.5)+cos(roll)*(0.16+seed.w*0.18);
        #if TOON == 1
          r*=1.25;
        #endif
        float lift=(0.22+sin(roll)*0.20)*sin(life*3.14159)+life*life*(0.7+seed.z*0.9);
        vec3 p=vec3(cos(a)*r,lift,sin(a)*r);p+=curlFlow(p*1.1,uTime)*0.17*sin(life*3.14159);p.y-=1.36;
        vInner=exp(-r*r*0.7)*(1.0-life*0.4);
        vec4 mv=modelViewMatrix*vec4(p,1.0);float size=(0.60+sin(life*3.14159)*0.65)*(0.8+seed.w*0.4);
        mv.xy+=position.xy*size*vec2(1.25,1.05)*length(modelMatrix[1].xyz);vFade=sin(life*3.14159)*0.85;
        #if VARIANT == 0
          vFade*=0.55;
        #endif
        gl_Position=projectionMatrix*mv;}`,{},!1,{CLOUD:1});Z(new t.PlaneGeometry(1,1),96,.16,p,1);let m=Y(`uniform vec3 uColor;varying vec2 vUv;varying float vFade;${G}
      void main(){vec2 q=vUv*2.0-1.0;float a=1.0-smoothstep(0.65,0.95,abs(q.y)+q.x*q.x);vec3 c=uColor*(0.20+vUv.y*0.30);
        #if VARIANT == 0
          c=mix(vec3(0.08,0.12,0.04),uColor*0.45,vUv.y);a*=step(abs(q.y),0.7*(1.0-q.x*q.x));
        #elif VARIANT == 1
          a=step(abs(q.x)+abs(q.y)*0.7,0.9);c=uColor*(0.12+step(q.y,0.0)*0.18);
        #elif VARIANT == 2
          c=mix(uColor*0.04,uColor*2.5+vec3(0.35),pow(vUv.y,6.0));
        #else
          a=band(abs(q.x)+abs(q.y)-0.65,0.09);c=uColor*1.8;
        #endif
        #if TOON == 1
          c=styleColor(uColor*.65,.2+vUv.y*.65);
          #if VARIANT == 0
            c=styleColor(mix(vec3(.2,.3,.08),uColor,.4),.22+vUv.y*.6);
          #elif VARIANT == 2
            c=styleHeat(uColor,.16+vUv.y*.75);
          #elif VARIANT == 3
            c=styleColor(uColor,.8);
          #endif
        #endif
        gl_FragColor=vec4(c,a*vFade*uDetail);${J}}`,`attribute vec4 seed;uniform float uTime,uStopTime;varying vec2 vUv;varying float vFade;
      void main(){vUv=uv;float life=uStopTime<0.0?fract(seed.y+uTime*.16):min(1.0,fract(seed.y+uStopTime*.16)+(uTime-uStopTime)*.6),a=seed.x*6.28318-uTime*2.4,r=0.25+life*1.9;

        #if TOON == 1
          r+=.22*(1.0-smoothstep(.08,.55,life));
        #endif
        vec3 p=vec3(cos(a)*r,-1.25+life*3.1,sin(a)*r);vec4 mv=modelViewMatrix*vec4(p,1.0);
        float spin=a+uTime;mat2 rot=mat2(cos(spin),-sin(spin),sin(spin),cos(spin));vec2 card=position.xy;
        #if VARIANT == 0
          card*=vec2(1.0,0.45);
        #elif VARIANT == 1
          card*=0.5;
        #elif VARIANT == 2
          card*=vec2(0.4,1.4);
        #endif
        mv.xy+=rot*card*(VARIANT==3?(.14+seed.w*.15):(.08+seed.w*.13))*length(modelMatrix[1].xyz);vFade=sin(life*3.14159);gl_Position=projectionMatrix*mv;}`,{},!1);Z(new t.PlaneGeometry(1,1),40,.055,m,4);let h=Y(`uniform vec3 uColor;uniform float uTime;varying vec2 vUv;${G}
      void main(){vec2 p=vUv*2.0-1.0;float r=length(p),a=atan(p.y,p.x);float turn=a-uTime*1.7+r*4.0;vec2 polar=vec2(cos(turn),sin(turn));
        float broad=noise2(polar*(2.0+r*3.0)+vec2(r*4.0,uTime*0.2));
        float detail=noise2(vec2(cos(a-uTime*2.4+r*7.0),sin(a-uTime*2.4+r*7.0))*(5.0+r*7.0));
        float mask=exp(-pow((r-0.42)*4.0,2.0))*smoothstep(0.18,0.50,broad*detail);vec3 c=uColor*.06;
        #if TOON == 1
          c=styleColor(uColor*.12,.18+broad*.65);
        #endif
        gl_FragColor=vec4(c,mask*.30);${J}}`,ue,{},!1),g=X(new t.PlaneGeometry(o?7.25:5.8,o?7.25:5.8),h,0);g.rotation.x=-Math.PI/2,g.position.y=-1.38}}}let Q=null,he=null,$=null,ge=r===0&&i===0?c.children.slice():[];function _e(){if(r!==0)return;if(i===0){let e=[],n=[],r=[],i=[];function a(t,a,o){let s=r.length;for(let i=0;i<=a;i++)for(let s=0;s<=o;s++)e.push(0,0,0),n.push(i/a,s/o),r.push(t);for(let e=0;e<a;e++)for(let t=0;t<o;t++){let n=s+e*(o+1)+t;i.push(n,n+1,n+o+1,n+1,n+o+2,n+o+1)}}a(0,6,12);for(let e=1;e<=9;e++)a(e,4,4);for(let e=10;e<=15;e++)a(e,32,4);let o=new t.BufferGeometry;o.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),o.setAttribute(`uv`,new t.Float32BufferAttribute(n,2)),o.setAttribute(`aPart`,new t.Float32BufferAttribute(r,1)),o.setIndex(i);let s={uImpactUp:{value:new t.Vector3(0,1,0)},uImpactSurface:{value:0},uImpactPlaneNormal:{value:new t.Vector3(1,0,0)}};Q=X(o,Y(`uniform vec3 uColor;uniform float uImpactProgress,uImpactSurface;varying vec2 vUv;varying float vPart,vSurface;
        void main(){float t=uImpactProgress*2.0;if(uImpactSurface>.5&&vSurface<-.012)discard;
          float heat,alpha;
          if(vPart<.5){heat=.96;alpha=1.0-smoothstep(.075,.15,t);}
          else if(vPart<9.5){heat=(1.0-vUv.x)*.8+.14+sin(vUv.y*6.283185)*.06;alpha=(1.0-smoothstep(.085,.20,t))*smoothstep(0.0,.015,t);}
          else{heat=.35+.55*sin(vUv.x*3.141593);alpha=smoothstep(.045,.09,t)*(1.0-smoothstep(.42,.72,t));}
          vec3 c=mix(uColor*.55,mix(uColor,vec3(1.0,.68,.16),.8),smoothstep(.05,.55,heat));
          c=mix(c,vec3(1.0,.96,.76),smoothstep(.50,.95,heat));
          if(vPart>9.5){float rim=pow(abs(sin(vUv.y*6.283185)),6.0);c=mix(uColor*vec3(1.0,.48,.12),vec3(1.0,.68,.18),rim*.65);if(vPart>12.5){alpha*=.16;c=uColor;}}
          if(alpha<.005)discard;gl_FragColor=vec4(c,alpha);${J}}
      `,`attribute float aPart;uniform float uImpactProgress,uLifeOrigin;uniform vec3 uImpactPlaneNormal;
        varying vec2 vUv;varying float vPart,vSurface;
        void main(){float t=uImpactProgress*2.0,h=uv.x,a=uv.y*6.283185;vec3 p;
          float grow=1.0-exp(-t*34.0),recoil=.05+max(t-.015,0.0)*1.2;
          if(aPart<.5){float theta=h*3.141593;float radius=(.10+.25*grow)*(1.0-smoothstep(.07,.17,t));
            p=vec3(recoil,0,0)+vec3(cos(theta)*.7,sin(theta)*cos(a),sin(theta)*sin(a))*radius;
          }else if(aPart<9.5){
            float seed=fract(sin(aPart*17.13+2.8)*4375.3),angle=aPart*2.399963+seed*.4;
            vec3 ray=normalize(vec3(.18+seed*.45,cos(angle),sin(angle))),side=normalize(cross(ray,vec3(1,0,0))),up=cross(ray,side);
            float reach=(.85+seed*.8)*grow,retire=1.0-smoothstep(.085,.20,t);
            float width=sin(pow(h,.7)*3.141593)*(.10+seed*.035)*retire;
            p=vec3(recoil,0,0)+ray*(h*reach)+side*sin(h*3.141593)*.035*sin(aPart+t*14.0);
            p+=(side*cos(a)+up*sin(a))*width;
          }else{
            float id=mod(aPart-10.0,3.0),open=1.0-exp(-max(t-.045,0.0)*24.0);
            float span=(id<.5?1.8:id<1.5?1.25:1.05)*(1.0-smoothstep(.25,.70,t));
            float angle=(id<.5?-.85:id<1.5?2.65:2.72)+t*.26+h*span;
            float radius=(.32+.75*open+max(t-.1,0.0)*.13)*(id<.5?1.0:id<1.5?.94:1.05);
            float thickness=(.022+.028*sin(h*3.141593))*(1.0-smoothstep(.45,.72,t))*(aPart>12.5?2.2:1.0);
            p=vec3(recoil+.035*sin(angle*2.0+id),cos(angle)*radius,sin(angle)*radius);
            p+=vec3(sin(a),cos(a)*cos(angle),cos(a)*sin(angle))*thickness;
          }
          vUv=uv;vPart=aPart;vSurface=dot(p,uImpactPlaneNormal);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p*uSize*(.35+.65*uLifeOrigin),1.0);
        }`,s,!1),5),Q.name=`lifecycle-impact`,Q.visible=!1,Q.material.forceSinglePass=!0;let c=[],l=[],u=[],d=[];for(let e=0;e<17;e++){let t=u.length;for(let[t,n]of[[0,0],[1,0],[0,1],[1,1]])c.push(t-.5,n-.5,0),l.push(t,n),u.push(e);d.push(t,t+1,t+2,t+1,t+3,t+2)}let f=new t.BufferGeometry;f.setAttribute(`position`,new t.Float32BufferAttribute(c,3)),f.setAttribute(`uv`,new t.Float32BufferAttribute(l,2)),f.setAttribute(`aPart`,new t.Float32BufferAttribute(u,1)),f.setIndex(d),$=X(f,Y(`uniform vec3 uColor;uniform float uImpactProgress,uDensity,uImpactSurface;varying vec2 vUv;varying float vPart,vSurface;
        ${G}
        float segmentDistance(vec2 p,vec2 a,vec2 b){vec2 v=b-a;return length(p-a-v*clamp(dot(p-a,v)/max(dot(v,v),.00001),0.0,1.0));}
        void main(){float t=uImpactProgress*2.0,seed=fract(sin(vPart*17.13+2.8)*4375.3);vec2 q=vUv*2.0-1.0;float alpha;vec3 c;
          if(vPart>15.5){
            if(uImpactSurface<.5)discard;
            float r=length(q),mainLine=10.0,twig=10.0;
            for(int i=0;i<7;i++){
              float id=float(i),rnd=fract(sin(id*17.13+4.1)*4375.3),angle=id*.897598+(rnd-.5)*.38;
              vec2 d=vec2(cos(angle),sin(angle)),side=vec2(-d.y,d.x);
              vec2 a=d*.045,b=d*(.22+rnd*.08)+side*(rnd-.5)*.12,c=d*(.43+rnd*.09)-side*(rnd-.5)*.14,end=d*(.61+rnd*.21)+side*(rnd-.5)*.20;
              mainLine=min(mainLine,min(segmentDistance(q,a,b),min(segmentDistance(q,b,c),segmentDistance(q,c,end))));
              vec2 fork=c+side*(.16+rnd*.09)+d*.09;
              twig=min(twig,min(segmentDistance(q,b,b-side*.18+d*.15),segmentDistance(q,c,fork)));
              twig=min(twig,segmentDistance(q,fork,fork+d*.12-side*.07));
            }
            float width=mix(.019,.006,smoothstep(.05,.8,r));
            float line=1.0-smoothstep(width*.45,width,mainLine);
            line=max(line,(1.0-smoothstep(.003,.008,twig))*.7);
            float glow=exp(-min(mainLine,twig)*45.0)*.28;
            float mask=(1.0-smoothstep(.70,.88,r))*smoothstep(.015,.06,r);
            float cooling=smoothstep(1.1,2.0,t),retire=1.0-smoothstep(1.35+r*.22,2.0,t);
            float reveal=smoothstep(r*.09,r*.09+.035,t);
            alpha=(line+glow)*mask*reveal*retire;
            float heat=line*(1.0-cooling)*(.65+.35*(1.0-r));
            c=mix(uColor*vec3(.40,.10,.03),vec3(1.0,.56,.10),heat);
            c=mix(c,vec3(1.0,.86,.40),pow(heat,4.0));
          }else if(vPart<4.0){float f=noise2(q*3.0+vec2(vPart*3.1,-t*.35));float r=length(q)+(f-.5)*.28;
            alpha=(1.0-smoothstep(.4,.95,r))*smoothstep(.14,.30,t)*(1.0-smoothstep(.5,1.2,t))*.12;
            c=mix(vec3(.09,.06,.04),vec3(.24,.17,.11),f);
          }else{float enabled=1.0-step(floor(3.0+clamp(uDensity,0.0,1.0)*9.0),vPart-4.0);
            alpha=(1.0-smoothstep(.15,1.0,abs(q.x)))*sin(vUv.y*3.141593)*smoothstep(.015,.045,t)*(1.0-smoothstep(.20+seed*.25,.40+seed*.40,t))*enabled;
            c=mix(uColor*.65,vec3(1.0,.90,.55),vUv.y);
          }
          if(vPart<15.5)alpha*=mix(1.0,smoothstep(-.02,.06,vSurface),uImpactSurface);
          if(alpha<.005)discard;gl_FragColor=vec4(c,alpha);${J}}`,`attribute float aPart;uniform float uImpactProgress,uLifeOrigin;uniform vec3 uImpactUp,uImpactPlaneNormal;varying vec2 vUv;varying float vPart,vSurface;
        void main(){float t=uImpactProgress*2.0,seed=fract(sin(aPart*17.13+2.8)*4375.3),angle=aPart*2.399963;vec3 ray=normalize(vec3(.35+seed*.5,cos(angle),sin(angle)));
          vPart=aPart;vUv=uv;float scale=uSize*(.35+.65*uLifeOrigin);
          if(aPart>15.5){vec3 n=normalize(uImpactPlaneNormal),helper=abs(n.y)<.9?vec3(0,1,0):vec3(0,0,1);
            vec3 right=normalize(cross(helper,n)),up=cross(n,right);vec3 pos=(right*position.x+up*position.y)*1.8+n*.012;
            vSurface=0.0;gl_Position=projectionMatrix*modelViewMatrix*vec4(pos*scale,1.0);
          }else{vec3 center;vec2 offset;
            if(aPart<4.0){center=vec3(.18,0,0)+ray*(.25+t*.25)+uImpactUp*max(t-.35,0.0)*.18;offset=position.xy*(.45+seed*.15+t*.20);}
            else{float age=max(0.0,t-.015);center=vec3(.08,0,0)+ray*(.12+age*(4.0+seed*2.5)/(1.0+age*2.0))-uImpactUp*age*age*.45;offset=position.xy*vec2(.018+seed*.014,.12+seed*.10);}
            vSurface=dot(center,uImpactPlaneNormal);vec4 mv=modelViewMatrix*vec4(center*scale,1.0);
            vec3 motion=(modelViewMatrix*vec4(ray,0.0)).xyz;vec2 along=length(motion.xy)>.001?normalize(motion.xy):vec2(0,1),across=vec2(along.y,-along.x);
            mv.xy+=(aPart<4.0?offset:across*offset.x+along*offset.y)*scale*length(modelMatrix[1].xyz);gl_Position=projectionMatrix*mv;
          }}`,s,!1),6),$.name=`lifecycle-impact-wisps`,$.visible=!1,$.material.forceSinglePass=!0,he=X(new t.PlaneGeometry(3.2,3.2),Y(`uniform vec3 uColor;uniform float uImpactProgress;varying vec2 vUv;
        void main(){vec2 q=vUv*2.0-1.0;float t=uImpactProgress*2.0,r=dot(q,q);
          float flash=exp(-r*32.0)*(1.0-smoothstep(.055,.11,t));
          float halo=exp(-r*5.8)*(1.0-smoothstep(.06,.20,t))*.28;
          vec3 c=mix(uColor,vec3(1.0,.94,.73),flash);gl_FragColor=vec4(c,flash*.95+halo);${J}}`,`uniform float uImpactProgress,uLifeOrigin;varying vec2 vUv;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(0,0,0,1);
          mv.xy+=position.xy*uSize*(.35+.65*uLifeOrigin)*(.5+(1.0-exp(-uImpactProgress*68.0))*.5)*length(modelMatrix[1].xyz);gl_Position=projectionMatrix*mv;}`),7),he.name=`lifecycle-contact-glow`,he.visible=!1,he.material.forceSinglePass=!0;return}if(i===1){let e=[],n=[],r=[],i=[];for(let t=0;t<30;t++){let a=t<12?6:t<24?3:1,o=e.length/3;for(let i=0;i<=a;i++)for(let o=0;o<2;o++)e.push(i/a,o*2-1,0),n.push(i/a,o),r.push(t);for(let e=0;e<a;e++){let t=o+e*2;i.push(t,t+1,t+2,t+1,t+3,t+2)}}let a=new t.BufferGeometry;a.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),a.setAttribute(`uv`,new t.Float32BufferAttribute(n,2)),a.setAttribute(`aPart`,new t.Float32BufferAttribute(r,1)),a.setIndex(i),Q=X(a,Y(`uniform vec3 uColor;varying vec2 vUv;varying float vFade;void main(){float d=abs(vUv.y*2.0-1.0),core=1.0-smoothstep(.12,.27,d),edge=exp(-d*d*13.0),halo=exp(-d*d*4.0);
        vec3 blue=pow(uColor,vec3(2.2))*vec3(.12,.65,2.2),c=mix(blue,vec3(.8,.96,1.0)*1.5,core);
        float alpha=max(core,edge*.65+halo*.3)*(1.0-smoothstep(.75,1.0,d))*vFade;
        gl_FragColor=vec4(c,alpha);${J}}`,`attribute float aPart;uniform float uLifeEnd,uLifeOrigin;varying vec2 vUv;varying float vFade;${G}
        vec3 bolt(float h,float id,float age){float a=id*2.399963,l=.8+hash(vec2(id,3.0))*.8;
          float cell=h*6.0,tick=floor(age*24.0+id*.31),j=mix(hash(vec2(floor(cell)+id*13.0,tick)),hash(vec2(floor(cell)+1.0+id*13.0,tick)),fract(cell))-.5;
          float r=h*l;vec2 radial=vec2(cos(a),sin(a)),side=vec2(-sin(a),cos(a));
          return vec3(.025+h*(.12+hash(vec2(id,5.0))*.35),radial*r+side*j*.48*sin(h*PI));}
        vec3 pointAt(float h,float part,float age){float id=mod(part,12.0),growth=smoothstep(0.0,.08,age);
          if(part<12.0)return bolt(h*growth,id,age);
          if(part<24.0){float root=.42+mod(id,3.0)*.09,a=id*2.399963+.65;return bolt(root*growth,id,age)+vec3(h*.12,cos(a)*h*.58,sin(a)*h*.58)*growth;}
          float a=(part-24.0)*2.399963+.4,r=.15+age*3.5+h*.3;return vec3(.08+age*.4,cos(a)*r,sin(a)*r);}
        void main(){vUv=uv;float age=uLifeEnd*.8,id=mod(aPart,12.0),scale=uSize*(.35+.65*uLifeOrigin),h=position.x;
          vec4 mv=modelViewMatrix*vec4(pointAt(h,aPart,age)*scale,1.0);
          vec4 a=modelViewMatrix*vec4(pointAt(max(0.0,h-.004),aPart,age)*scale,1.0),b=modelViewMatrix*vec4(pointAt(min(1.0,h+.004),aPart,age)*scale,1.0);
          vec2 delta=b.xy-a.xy,side=length(delta)<.00001?vec2(0,1):normalize(vec2(-delta.y,delta.x));
          float width=(id<3.0?.22:.105)*(1.0-h*.8);if(aPart>=12.0)width*=.48;if(aPart>=24.0)width=.045*sin(h*PI)+.008;
          mv.xy+=side*position.y*width*scale*length(modelMatrix[1].xyz);
          float end=.42+hash(vec2(id,7.0))*.34;
          vFade=smoothstep(0.0,.016,age)*(1.0-smoothstep(.35,end,age));
          if(aPart>=12.0)vFade*=.35+.65*step(.35,hash(vec2(id,floor(age*25.0+id))));
          if(aPart>=24.0)vFade*=1.0-smoothstep(.12,.36,age);
          gl_Position=projectionMatrix*mv;}`,{},!0),5),Q.name=`lifecycle-impact`,Q.visible=!1,Q.material.side=t.DoubleSide,Q.material.depthWrite=!1,he=X(new t.PlaneGeometry(2.4,2.4),Y(`uniform vec3 uColor;uniform float uLifeEnd;varying vec2 vUv;void main(){vec2 q=vUv*2.0-1.0;float age=uLifeEnd*.8,r=length(q),a=atan(q.y,q.x);
        float core=exp(-r*r*100.0),sheath=exp(-r*r*24.0),halo=exp(-r*r*5.0),spikes=pow(abs(cos(a*3.0+sin(a*5.0)*.4)),28.0)*exp(-r*7.0);
        float fade=smoothstep(0.0,.012,age)*(1.0-smoothstep(.06,.22,age));
        vec3 blue=pow(uColor,vec3(2.2))*vec3(.1,.65,2.2);gl_FragColor=vec4(mix(blue,vec3(.8,.97,1.0)*1.7,clamp(core+sheath,0.0,1.0)),(core+sheath*.6+halo*.3+spikes*.4)*fade);${J}}`,`uniform float uLifeEnd,uLifeOrigin;varying vec2 vUv;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(0,0,0,1);mv.xy+=position.xy*uSize*(.35+.65*uLifeOrigin)*(.65+smoothstep(0.0,.1,uLifeEnd)*.35)*length(modelMatrix[1].xyz);gl_Position=projectionMatrix*mv;}`),4),he.name=`lifecycle-contact-glow`,he.visible=!1;return}let e=[],n=[],a=[],o=[],s=[];function c(t,r,i,c,l){let u=e.length/3;for(let o=0;o<=t;o++)for(let u=0;u<=r;u++){let d=l(u/r,o/t);e.push(...d),n.push(...c),a.push(i),s.push(u/r,o/t)}for(let e=0;e<t;e++)for(let t=0;t<r;t++){let n=u+e*(r+1)+t,i=n+r+1;o.push(n,i,n+1,i,i+1,n+1)}}function l(e,n,r,i){let a=new t.Vector3(.25+Math.sin(n*2.4)*.45,Math.cos(n*2.39996),Math.sin(n*2.39996)).normalize(),o=new t.Quaternion().setFromUnitVectors(y,a);function s(n){return new t.Vector3(...n).sub(new t.Vector3(...e)).applyQuaternion(o).add(new t.Vector3(...e)).toArray()}c(1,4,n,e,(t,n)=>{let a=t*Math.PI*2;return s([e[0]+(n?r:0),e[1]+(n?0:Math.cos(a)*i),e[2]+(n?0:Math.sin(a)*i)])}),c(1,4,n,e,(t,n)=>{let r=t*Math.PI*2;return s([e[0]-(n?i:0),e[1]+(n?0:Math.cos(r)*i),e[2]+(n?0:Math.sin(r)*i)])})}if(i===1)for(let e=0;e<12;e++){let t=e*2.39996,n=.6+e%4*.18;c(7,3,e,[0,0,0],(r,i)=>{let a=Math.round(i*7),o=Math.sin(a*17+e*3)*.14,s=t+o,c=i*n,l=(e%3==0?.052:.026)*(1-i*.7),u=r*Math.PI*2;return[.04+i*(.25+e%5*.27)+Math.cos(u)*l,Math.cos(s)*c+Math.sin(u)*l,Math.sin(s)*c+Math.sin(i*9+e)*.06]})}else if(i===2)for(let e=0;e<13;e++){let t=e*2.39996,n=.15+e*7%13/13*.45;l([.08+e*5%13/13*.7,Math.cos(t)*n,Math.sin(t)*n],e,.28+e%4*.12,.09+e%3*.018)}else if(i===3)for(let e=0;e<7;e++){let n=e*2.39996,r=.3+e%3*.13,i=[e%3*.33,Math.cos(n)*r,Math.sin(n)*r],a=new t.Quaternion().setFromEuler(new t.Euler(e*.63,e*.77,e*.4)),o=[[[-.15,-.2],[-.15,.2]],[[-.15,.12],[.13,-.02]],[[-.15,-.08],[.1,-.2]]];e%2==0&&o.push([[.1,-.2],[.1,.12]]);for(let[n,r]of o)c(1,1,e,i,(e,o)=>{let s=n[0]+(r[0]-n[0])*e+(o-.5)*.025,c=n[1]+(r[1]-n[1])*e;return new t.Vector3(0,s,c).applyQuaternion(a).add(new t.Vector3(...i)).toArray()});l(i,e,.11,.055)}else if(i===4)for(let e=0;e<7;e++)c(3,8,e,[.08+e%3*.22,Math.cos(e*.897)*.5,Math.sin(e*.897)*.5],(t,n)=>{let r=e*.897+t*.63,i=.48+n*.18;return[.08+e%3*.22+Math.sin(n*3.14159)*.13+Math.sin(r*2+e)*.12,Math.cos(r)*i,Math.sin(r)*i]});else if(i===5)for(let e=0;e<3;e++)c(4,24,e,[0,0,0],(t,n)=>{let r=(t-.5)*1.8+e*.25,i=.55+e*.16+n*.16*Math.sin(t*Math.PI);return[(e-1)*.24+t*.65+n*.09,Math.cos(r)*i-.6,Math.sin(r)*i]});else for(let e=0;e<8;e++)c(4,12,e,[0,0,0],(t,n)=>[t,n,e]);let u=new t.BufferGeometry;u.setAttribute(`position`,new t.Float32BufferAttribute(e,3)),u.setAttribute(`uv`,new t.Float32BufferAttribute(s,2)),u.setAttribute(`aCenter`,new t.Float32BufferAttribute(n,3)),u.setAttribute(`aPart`,new t.Float32BufferAttribute(a,1)),u.setIndex(o),u.computeVertexNormals(),Q=X(u,Y(`uniform vec3 uColor;uniform float uLifeEnd;varying vec3 vP;varying vec3 vImpactNormal;varying vec2 vFlow;varying float vPart;${G}${q}${le}${K}
      void main(){float t=uLifeEnd;float fade=smoothstep(.0,.07,t)*(1.0-smoothstep(.52,1.0,t));
        vec3 n=normalize(cross(dFdx(vP),dFdy(vP)));

        float light=.35+abs(dot(n,normalize(vec3(.7,1,.5))))*.45;float mask=1.0;
        #if VARIANT == 1
          float charge=.5+.5*sin(vPart*4.7+floor(t*16.0)*2.1);mask=mix(.2,1.0,smoothstep(.15,.45,charge));mask*=1.0-smoothstep(.35+mod(vPart,3.0)*.13,.6+mod(vPart,3.0)*.13,t);light=mod(vPart,3.0)<.5?.82:.57;
        #elif VARIANT == 3
          mask=1.0-smoothstep(.5,.9,t+vPart*.025);light=.65;
        #elif VARIANT == 5
          mask=1.0-smoothstep(.22,.85,t+vPart*.09);light=.2+light*.55;
        #elif VARIANT == 6
          float flow=noise2(vec2(vFlow.x*8.0-t*5.0,vPart*2.3));mask=smoothstep(t*.6-.15,t*.6+.10,flow)*sin(vFlow.x*PI);fade*=1.0-smoothstep(.45,.96,t+vPart*.018);light=.35+.35*abs(dot(n,normalize(vec3(.4,.8,.5))))+.16*pow(vFlow.x,.6);
        #endif
        if(mask*fade<.006)discard;
        vec3 c=toonShade(uColor,light);
        gl_FragColor=vec4(c,mask*fade);${J}
      }`,`attribute vec3 aCenter;attribute float aPart;uniform float uLifeEnd,uLifeOrigin;varying vec3 vP;varying vec3 vImpactNormal;varying vec2 vFlow;varying float vPart;
      void main(){vFlow=uv;vImpactNormal=normal;float t=uLifeEnd;float open=1.0-exp(-t*7.0);vec3 p=position;vPart=aPart;
        #if VARIANT == 1
          p*=.12+open*1.35;p.x+=sin(floor(t*22.0)+aPart*3.0)*.035;
        #elif VARIANT == 2 || VARIANT == 4
          p-=aCenter;float spin=t*(1.5+mod(aPart,3.0));p.yz=mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*p.yz;
          p.xz=mat2(cos(spin*.7),-sin(spin*.7),sin(spin*.7),cos(spin*.7))*p.xz;p+=aCenter*(.25+open*2.0);p.x+=t*(.2+mod(aPart,4.0)*.25);p.y-=t*t*.7;
        #elif VARIANT == 3
          p-=aCenter;p*=.25+sin(t*3.14159)*.8;p+=aCenter*(.2+open*2.0);p.x+=t*.5;
        #elif VARIANT == 5
          float spin=t*1.4;p.yz=mat2(cos(spin),-sin(spin),sin(spin),cos(spin))*p.yz;p*=.35+open*1.1;p.x+=t*1.3;p.z+=(t-.35)*(1.1+aPart*.3);
        #else
          float age=max(0.0,t-aPart*.025),h=uv.x,spin=aPart*2.399963-age*(4.0+mod(aPart,3.0))+h*2.7;
          float pulse=sin(h*3.14159265),head=age*(3.4+mod(aPart,3.0)*.35);
          float radius=(.05+age*.95)*(.5+pulse*.5)*( .7+mod(aPart,3.0)*.17);
          float width=(.015+pulse*.07)*(1.0-smoothstep(.45,.95,age)),tube=uv.y*6.2831853;
          p=vec3(.04+head+h*(.35+age*.7)+cos(tube)*width,cos(spin)*(radius+sin(tube)*width),sin(spin)*(radius+sin(tube)*width));
        #endif
        p*=uSize*(.35+.65*uLifeOrigin);vP=p;
gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
      }`,{},!1),5),Q.name=`lifecycle-impact`,Q.visible=!1,he=X(new t.PlaneGeometry(1.8,1.8),Y(`uniform vec3 uColor;uniform float uLifeEnd;varying vec2 vUv;
      void main(){vec2 q=vUv*2.0-1.0;float t=uLifeEnd;float a=exp(-dot(q,q)*5.5)*(1.0-smoothstep(.0,.28,t))*smoothstep(.0,.025,t)*.24;
        gl_FragColor=vec4(uColor,a);${J}}`,`uniform float uLifeEnd;varying vec2 vUv;
      void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(0,0,0,1);mv.xy+=position.xy*uSize*(.5+uLifeEnd*2.0);gl_Position=projectionMatrix*mv;}`),4),he.name=`lifecycle-contact-glow`,he.visible=!1}W(),_e();function ve(n={}){if(m)return;if(u={...u,...n},e.quantity){let n=e.quantity;u.quantity=Number.isFinite(u.quantity)?t.MathUtils.clamp(Math.round(u.quantity),n.min,n.max):n.default}else delete u.quantity;if(A.uQuantity.value=u.quantity??a,e.panelCount){let n=e.panelCount;u.panelCount=Number.isFinite(u.panelCount)?t.MathUtils.clamp(Math.round(u.panelCount),n.min,n.max):n.default}else delete u.panelCount;if(A.uPanelCount.value=u.panelCount??0,e.spread){let n=e.spread;u.spread=Number.isFinite(u.spread)?t.MathUtils.clamp(u.spread,n.min,n.max):n.default}else delete u.spread;if(A.uSpread.value=u.spread??1,e.crackBloomSpread){let n=e.crackBloomSpread;u.crackBloomSpread=Number.isFinite(u.crackBloomSpread)?t.MathUtils.clamp(u.crackBloomSpread,n.min,n.max):n.default}else delete u.crackBloomSpread;if(A.uCrackBloomSpread.value=u.crackBloomSpread??1,e.crackBloom){let n=e.crackBloom;u.crackBloom=Number.isFinite(u.crackBloom)?t.MathUtils.clamp(u.crackBloom,n.min,n.max):n.default}else delete u.crackBloom;if(A.uCrackBloom.value=u.crackBloom??1,e.textureDensity){let n=e.textureDensity;u.textureDensity=Number.isFinite(u.textureDensity)?t.MathUtils.clamp(u.textureDensity,n.min,n.max):n.default}else delete u.textureDensity;A.uTextureDensity.value=u.textureDensity??1,e.id===`golden-chain-rain`?u.spriteChains=typeof u.spriteChains!=`boolean`||u.spriteChains:delete u.spriteChains,A.uSpriteChains.value=+!!u.spriteChains,u.size=e.sizeRange?t.MathUtils.clamp(Number.isFinite(u.size)?u.size:e.sizeRange.default,e.sizeRange.min,e.sizeRange.max):t.MathUtils.clamp(Number(u.size)||1,.25,2),u.density=t.MathUtils.clamp(Number(u.density)||.125,.125,1),/^#[0-9a-f]{6}$/i.test(u.color)||(u.color=e.color),A.uColor.value.set(u.color);let c=Math.max(1,Math.round(s*u.density)),l=r===3&&i===2?7:r===3&&(i===4||i===6)?12:r===4&&o&&i===1?22:0,d=c-l;_=l;for(let t=C.length-1;t>=0;t--){let n=C[t];if(e.id===`golden-chain-rain`&&n.geometry.userData.goldenChainImpactChips){n.geometry.instanceCount=3*u.quantity*Math.round(24*u.density),_+=n.geometry.instanceCount;continue}let r=t===0?d:Math.min(n.maximum,Math.round(c*n.weight)),i=e.id===`golden-chain-rain`&&n.geometry.userData.goldenChainCrackChips?r*8:r;n.geometry.instanceCount=i,d-=r,_+=i}u.speed=t.MathUtils.clamp(Number(u.speed)||1,.25,2),u.detail=e.detailRange?t.MathUtils.clamp(Number.isFinite(u.detail)?u.detail:e.detailRange.default,e.detailRange.min,e.detailRange.max):t.MathUtils.clamp(Number(u.detail)||.25,.25,2),A.uSize.value=u.size,A.uDetail.value=u.detail,A.uDensity.value=u.density;for(let e of E){e.object.scale.copy(e.scale);for(let t of e.axes)e.object.scale[t]*=u.size;e.object.position.copy(e.position),e.pivot&&(e.object.position.y+=e.pivot*(1-u.size))}if(g&&ye(),e.id===`golden-chain-rain`||e.id===`arcane-arrow-rain`)for(let e of w)e();be()}function ye(){b.subVectors(g.end,g.start);let e=b.length();c.position.copy(g.start).add(g.end).multiplyScalar(.5),e>0&&c.quaternion.setFromUnitVectors(y,b.normalize()),c.scale.set(e/4.8,1,1),A.uStretch.value=Math.max(.001,e/4.8),c.visible=e>0}function be(){F=e.burst?d+1e-9>=e.duration?`finished`:d+1e-9>=e.duration-P.end?`ending`:d+1e-9>=P.start?`active`:`starting`:L>=0?I+1e-9>=(B?P.hitEnd??P.end:P.end)?`finished`:`ending`:d+1e-9>=P.start?`active`:`starting`;let t=L>=0?R:Math.min(1,d/P.start);V.uEmitterTime.value=L>=0?L:d,V.uLifeStart.value=t,V.uLifeEnd.value=e.burst?Math.max(0,Math.min(1,(d-(e.duration-P.end))/P.end)):L>=0?Math.min(1,I/P.end):0,V.uLifeStage.value=F===`active`?1:F===`starting`?0:2,V.uImpactAge.value=I,V.uImpactProgress.value=Math.min(1,I/(P.hitEnd??P.end)),V.uLifeOrigin.value=R,V.uStopTime.value=L,V.uImpact.value=+!!B;for(let e of ee)e.transparent=F!==`active`,e.depthWrite=F===`active`;for(let e of O)e.geometry.setDrawRange(F===`active`?0:e.steady,F===`active`?e.steady:e.transition);if(c.visible=F!==`finished`&&(!g||g.start.distanceToSquared(g.end)>0),Q&&(Q.visible=B&&F===`ending`,he.visible=B&&F===`ending`&&(i===0?V.uImpactProgress.value<.2/2:I/P.end<.28)),r===0&&i===0){for(let e of ge)e.visible=F!==`finished`&&(L<0||I<P.end);Q.visible=B&&F===`ending`&&V.uImpactProgress.value<.72/2,$.visible=B&&F===`ending`}}function xe(){m||F===`ending`||F===`finished`||e.burst||(R=Math.min(1,d/P.start),L=d,I=0,be())}let Se=new t.Vector3,Ce=new t.Vector3,we=new t.Matrix4,Te=new t.Matrix3;function Ee(e){let t=u.size;if(i===0)e.set(.65+(.46+Math.sin(d*4.1)*.035)*t,Math.sin(5+d*3)*.03*t,Math.cos(7+d*2.7)*.03*t);else if(i===1)e.set(.85+.85*t,0,0);else if(i===2)e.set(.85+.93*t,0,0);else if(i===3){let n=u.quantity??3,r=u.spread??1,i=Math.min(1,d/P.start),a=1-i*i*(3-2*i),o=-1/0;for(let i=0;i<n;i++){let s=i*(n===3?2.094395:Math.PI*2/n)-d*3,c=.85+Math.sin(s*2)*.09*t,l=Math.cos(s)*.26*t*r,u=Math.sin(s)*.26*t*r;for(let n=0;n<6;n++){let r=Math.floor(n/2),i=n%2?-1:1,s=c+(r===0?i*.182*t:0),d=l+(r===1?i*.078*t:0),f=u+(r===2?i*.078*t:0);d*=1+a*.8,f*=1+a*.8,s+=Math.sin(d*7)*a*.4,s>o&&(o=s,e.set(s,d,f))}}return e}else if(i===4){e.set(.81*t,0,0);for(let n=0;n<9;n++){let r=n*Math.PI*2/9-d*4,i=.99+n%3*.035,a=Math.cos(r)*i*t;a>e.x&&e.set(a,Math.sin(r)*i*t,.02*t)}let n=-.15*Math.sin(d*2),r=e.y;e.y=r*Math.cos(n),e.z+=r*Math.sin(n)}else i===5?e.set(.9*t,-.2*t*Math.cos(d*2.7),.2*t*Math.sin(d*2.7)):i===6?e.set(1.11*t,0,0):e.set(t,0,0);if(d<P.start){let t=d/P.start,n=t*t*(3-2*t),r=1-n;if(i===0)e.y*=.22+.78*n,e.z*=.22+.78*n,e.x=(e.x*.38-.16)*(1-n)+e.x*n,e.y+=Math.sin(e.x*4.5+t*7)*r*.15;else if(i===1)e.x*=1.3-.3*n,e.y*=.08+.92*n,e.z*=.08+.92*n;else if(i===2||i===4){let t=Math.ceil((Math.atan2(e.z,e.y)+Math.PI)*3)*.028;e.y*=1+r*(.8+t),e.z*=1+r*(.8+t),e.x-=r*(.2+t)}else i===3?(e.y*=1+r*.8,e.z*=1+r*.8,e.x+=Math.sin(e.y*7)*r*.4):i===5&&(e.z+=Math.sin(e.x*4)*r*.75,e.x-=r*.5)}return e}function De(e,t){if(!(r!==0||m||F===`ending`||F===`finished`)&&(!e||Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.z))){if(Ee(Q.position),e&&(Se.copy(e),c.parent&&(c.parent.updateWorldMatrix(!0,!1),c.parent.worldToLocal(Se)),b.copy(Q.position).multiply(c.scale).applyQuaternion(c.quaternion),c.position.copy(Se).sub(b)),he.position.copy(Q.position),c.updateWorldMatrix(!0,!1),we.copy(c.matrixWorld).invert(),t?Ce.copy(t):Ce.copy(y).transformDirection(c.matrixWorld).negate(),(!Number.isFinite(Ce.lengthSq())||Ce.lengthSq()<1e-10)&&Ce.copy(y).transformDirection(c.matrixWorld).negate(),Ce.transformDirection(we),Q.quaternion.setFromUnitVectors(y,i===0?b.set(-1,0,0):Ce),i===0){let e=t&&Number.isFinite(t.x)&&Number.isFinite(t.y)&&Number.isFinite(t.z)&&t.x*t.x+t.y*t.y+t.z*t.z>1e-10;$.position.copy(Q.position),$.quaternion.copy(Q.quaternion),Q.material.uniforms.uImpactSurface.value=+!!e,Q.updateWorldMatrix(!0,!1),we.copy(Q.matrixWorld).invert(),Q.material.uniforms.uImpactUp.value.set(0,1,0).transformDirection(we),e&&(Te.setFromMatrix4(Q.matrixWorld).transpose(),Q.material.uniforms.uImpactPlaneNormal.value.copy(t).applyMatrix3(Te).normalize())}B=!0,xe()}}function Oe(t){if(m||!Number.isFinite(t)||t<0||F===`finished`)return;let n=t*u.speed;d=e.id===`billowing-airburst`?Math.min(e.duration,d+n):d+n,A.uTime.value=d,L>=0&&(I+=n),r===0&&h&&L<0&&c.position.addScaledVector(v,t*h);for(let e of w)e();be()}function ke(e={}){if(!m){if(T){if(e.variationSeed!==void 0&&(!Number.isInteger(e.variationSeed)||e.variationSeed<0||e.variationSeed>4294967295))throw RangeError(`variationSeed must be an unsigned 32-bit integer`);T.seed=e.variationSeed??T.seed+2654435769>>>0,T.reset()}d=0,I=0,L=-1,B=!1,R=1,F=`starting`,A.uTime.value=0,Q&&(Q.position.set(0,0,0),he.position.set(0,0,0)),be(),Oe(0)}}function Ae(e,n){if(m||!T)return;let r=[];c.traverse(e=>{r.push([e,e.visible]),e.visible=!0});let i=A.uTime.value,a=e.getRenderTarget(),o=e.getActiveCubeFace(),s=e.getActiveMipmapLevel(),l=e.autoClear,u=e.xr.enabled,d=new t.WebGLRenderTarget(1,1);try{A.uTime.value=.08,c.updateWorldMatrix(!0,!0),e.xr.enabled=!1,e.compile(c,n),e.setRenderTarget(d),e.autoClear=!0,e.render(c,n)}finally{A.uTime.value=i;for(let[e,t]of r)e.visible=t;e.setRenderTarget(a,o,s),e.autoClear=l,e.xr.enabled=u,d.dispose()}}function je(){if(!m){m=!0,F=`finished`,c.visible=!1,c.removeFromParent();for(let e of x)e.dispose();for(let e of S)e.dispose();x.clear(),S.clear(),c.clear()}}ve(u),Oe(0);let Me={group:c,update:Oe,setOptions:ve,reset:ke,dispose:je,stop:xe,hit:De,...T?{prewarm:Ae}:{},get variationSeed(){return T?.seed},get settings(){return{...u}},get particleCount(){return _},get elapsed(){return d},get phase(){return F},get finished(){return F===`finished`},get lifecycle(){return{...P}},setDirection(e,t=4){r===0&&!m&&F!==`ending`&&F!==`finished`&&e&&Number.isFinite(e.lengthSq())&&e.lengthSq()!==0&&(v.copy(e).normalize(),h=Math.max(0,Number(t)||0),c.quaternion.setFromUnitVectors(y,v))},setEndpoints(e,t){r!==1||m||F===`ending`||F===`finished`||(g={start:e.clone(),end:t.clone()},ye())}};return e.id===`fireball`?l(t,Me):Me}function V(e,t,n={}){let r=new e.Group,i=new e.Group,a=new e.Group;r.name=t.id,i.name=`relic-vfx-root`,a.name=`sacred-relic-body`,r.add(i),i.add(a);let o=new Set,s=new Set,c=0,l=-1,u=!1,d,f=(e,t,n)=>Math.min(n,Math.max(t,e)),p=(e,t,n)=>{let r=f((n-e)/(t-e),0,1);return r*r*(3-2*r)},m={uTime:{value:0},uEmitTime:{value:0},uImpactAge:{value:-1},uPulseAge:{value:-1},uRadius:{value:0},uMaxRadius:{value:9},uCancel:{value:1},uBodyFade:{value:0},uSize:{value:1},uDetail:{value:1},uLightGain:{value:5},uSmokeThickness:{value:5},uColor:{value:new e.Color}},h=`uniform float uTime,uEmitTime,uImpactAge,uPulseAge,uRadius,uMaxRadius,uCancel,uBodyFade,uSize,uDetail,uLightGain,uSmokeThickness;uniform vec3 uColor;`,g=`
#include <colorspace_fragment>
`,_=`gl_FragColor.rgb*=gl_FragColor.a*uLightGain;gl_FragColor.a=0.;`+g,v=`float relicWater(vec2 p,float t){float r=length(p);vec2 q=p*3.7; q+=vec2(sin(q.y*.8-t*2.4),sin(q.x*.7+t*1.8))*.5;float w=sin(q.x+sin(q.y*.7-t*2.))+sin(q.y+sin(q.x*.8+t*1.4));float veins=1.-smoothstep(.06,.30+fwidth(w),abs(w));float ripple=.5+.5*sin(r*18.-t*14.+sin(q.x+q.y)*1.7);return clamp(veins*.78+pow(ripple,5.)*.35,0.,1.);}`,y=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;function b(t,n,r,a,c=i){let l=new e.ShaderMaterial({uniforms:{...m},vertexShader:h+r,fragmentShader:h+a,transparent:!0,depthWrite:!1,side:e.DoubleSide,forceSinglePass:!0,toneMapped:!1});[`relic-sigil`,`relic-impact`,`relic-healing-wave`,`relic-healing-echo`,`relic-magic-smoke-ring`].includes(t)&&(l.blending=e.CustomBlending,l.blendSrc=e.OneFactor,l.blendDst=e.OneFactor,l.blendSrcAlpha=e.ZeroFactor,l.blendDstAlpha=e.OneFactor),o.add(n),s.add(l);let u=new e.Mesh(n,l);return u.name=t,u.frustumCulled=!1,c.add(u),u}function x(t,n,r,i=.02){let a=b(t,new e.PlaneGeometry(n,n),y,r);return a.rotation.x=-Math.PI/2,a.position.y=i,a}let S=new e.MeshBasicMaterial({color:14857306,transparent:!0,vertexColors:!0}),C=new e.MeshBasicMaterial({color:16775142,transparent:!0,vertexColors:!0});s.add(S),s.add(C);let w={value:0};for(let e of[S,C])e.onBeforeCompile=e=>{e.uniforms.uRelicBurialDepth=w,e.vertexShader=`varying float vRelicHeight;
`+e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
vRelicHeight=position.y;`),e.fragmentShader=`varying float vRelicHeight;uniform float uRelicBurialDepth;
`+e.fragmentShader.replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
if(vRelicHeight<uRelicBurialDepth)discard;`)},e.customProgramCacheKey=()=>`sacred-relic-local-ground-cut-v1`;let T=[new e.Vector3(0,0,0),new e.Vector3(0,3,1.1316),new e.Vector3(-.98,3,-.5658),new e.Vector3(.98,3,-.5658)],E=new e.Vector3(0,2.25,0),D=new e.Vector3(-.6,1,1).normalize(),O=[],ee=[],k=[],A=[];for(let t of[[0,1,2],[0,2,3],[0,3,1],[1,3,2]]){let[n,r,i]=t.map(e=>T[e]),a=new e.Vector3().crossVectors(r.clone().sub(n),i.clone().sub(n)).normalize();a.dot(n.clone().add(r).add(i).multiplyScalar(1/3).sub(E))<0&&([r,i]=[i,r],a.negate());let o=n.distanceTo(r),s=r.distanceTo(i),c=i.distanceTo(n),l=o+s+c,u=n.clone().multiplyScalar(s).addScaledVector(r,c).addScaledVector(i,o).multiplyScalar(1/l),d=1-.055/(new e.Vector3().crossVectors(r.clone().sub(n),i.clone().sub(n)).length()/l),f=.65+.35*Math.max(0,a.dot(D));for(let e of[n,r,i]){O.push(...e.toArray()),k.push(f,f,f);let t=e.clone().sub(u).multiplyScalar(d).add(u).addScaledVector(a,.002);ee.push(...t.toArray()),A.push(f,f,f)}}for(let[t,n,r,i]of[[`relic-triangle-border`,O,k,S],[`relic-triangle-face`,ee,A,C]]){let s=new e.BufferGeometry;s.setAttribute(`position`,new e.Float32BufferAttribute(n,3)),s.setAttribute(`color`,new e.Float32BufferAttribute(r,3)),s.computeVertexNormals(),o.add(s);let c=new e.Mesh(s,i);c.name=t,a.add(c)}let j=b(`relic-descent-trail`,new e.PlaneGeometry(1.25,6),y,`varying vec2 vUv;void main(){float x=vUv.x*2.-1.;float streak=exp(-x*x*32.)+.24*exp(-pow((abs(x)-.36)*22.,2.));float a=streak*pow(1.-vUv.y,2.)*smoothstep(1.,1.08,uTime)*(1.-smoothstep(1.35,1.48,uTime))*uCancel;gl_FragColor=vec4(mix(uColor,vec3(1.),.55),a*.65);${g}}`,a);j.position.set(0,5.25,-.09);let M=x(`relic-sigil`,4.9,`
    varying vec2 vUv;
    const float PI=3.141592654,TAU=6.283185307;
    vec2 turn(vec2 p,float a){float c=cos(a),s=sin(a);return vec2(c*p.x-s*p.y,s*p.x+c*p.y);}
    float segment(vec2 p,vec2 a,vec2 b){vec2 v=b-a;return length(p-a-v*clamp(dot(p-a,v)/max(dot(v,v),.000001),0.,1.));}
    float trace(vec2 p,vec2 a,vec2 b,float progress){return segment(p,a,mix(a,b,clamp(progress,0.,1.)));}
    float ink(float d,float w,float pixel){return 1.-smoothstep(w,w+pixel,d);}
    float stroke(float d,float w,float pixel){return ink(d,w,pixel)+.09*exp(-d*d/.00005);}
    vec2 polar(float a,float r){return vec2(cos(a),sin(a))*r;}
    float glyph(vec2 q,float id){
      float k=mod(id,8.);
      float d=segment(q,vec2(-.15,-.72),vec2(-.15,.72));
      if(k<1.){d=min(d,segment(q,vec2(-.15,.65),vec2(.60,.26)));d=min(d,segment(q,vec2(.60,.26),vec2(-.15,-.05)));d=min(d,segment(q,vec2(-.52,-.25),vec2(.4,-.25)));}
      else if(k<2.){d=min(d,segment(q,vec2(-.6,.35),vec2(.55,.35)));d=min(d,segment(q,vec2(.55,.35),vec2(.2,-.55)));d=min(d,segment(q,vec2(-.6,-.4),vec2(.2,-.55)));}
      else if(k<3.){d=min(d,segment(q,vec2(-.65,.5),vec2(.5,-.45)));d=min(d,segment(q,vec2(-.65,-.45),vec2(.5,.5)));}
      else if(k<4.){d=min(d,abs(length(q-vec2(.13,.25))-.43));d=min(d,segment(q,vec2(-.55,-.6),vec2(.50,-.6)));}
      else if(k<5.){d=min(d,segment(q,vec2(-.6,.6),vec2(.5,.6)));d=min(d,segment(q,vec2(.5,.6),vec2(.5,-.1)));d=min(d,segment(q,vec2(-.15,-.1),vec2(.5,-.1)));}
      else if(k<6.){d=min(d,segment(q,vec2(-.62,.15),vec2(.52,-.3)));d=min(d,segment(q,vec2(.52,-.3),vec2(.52,.65)));d=min(d,length(q-vec2(-.52,-.6))-.08);}
      else if(k<7.){d=min(d,segment(q,vec2(-.62,.25),vec2(.10,.7)));d=min(d,segment(q,vec2(.10,.7),vec2(.62,.25)));d=min(d,segment(q,vec2(-.55,-.35),vec2(.5,-.35)));}
      else{d=min(d,abs(length(q-vec2(0.,-.15))-.48));d=min(d,segment(q,vec2(-.5,.65),vec2(.5,.65)));}
      return max(0.,d);
    }
    float emblem(vec2 q,float id){
      float r=length(q),a=atan(q.y,q.x),d=10.;
      if(id<.5){ // sun: open center and twelve detached rays
        d=abs(r-.38);float t=mod(a+PI/12.,TAU/12.)-PI/12.;vec2 v=vec2(cos(t),sin(t))*r;
        d=min(d,segment(v,vec2(.53,0.),vec2(.87,0.)));
      }else if(id<1.5){ // eight-point light star
        float t=mod(a+PI/8.,TAU/8.)-PI/8.;vec2 v=polar(abs(t),r);
        d=segment(v,vec2(.96,0.),polar(PI/8.,.34));
        d=min(d,abs(r-.18));
      }else if(id<2.5){ // luminous drop, with an open inner highlight
        d=min(segment(q,vec2(0.,.95),vec2(-.46,-.08)),segment(q,vec2(0.,.95),vec2(.46,-.08)));
        if(q.y<-.08)d=min(d,abs(length(q-vec2(0.,-.08))-.46));
        d=min(d,segment(q,vec2(-.14,-.05),vec2(-.14,-.31)));
      }else{ // sprout: stem and two pointed leaves
        d=segment(q,vec2(0.,-.85),vec2(0.,.38));
        d=min(d,segment(q,vec2(0.,-.02),vec2(-.65,.18)));
        d=min(d,segment(q,vec2(-.65,.18),vec2(-.72,.68)));
        d=min(d,segment(q,vec2(-.72,.68),vec2(-.16,.5)));
        d=min(d,segment(q,vec2(-.16,.5),vec2(0.,-.02)));
        d=min(d,segment(q,vec2(0.,.22),vec2(.66,.38)));
        d=min(d,segment(q,vec2(.66,.38),vec2(.72,.86)));
        d=min(d,segment(q,vec2(.72,.86),vec2(.16,.7)));
        d=min(d,segment(q,vec2(.16,.7),vec2(0.,.22)));
      }
      return d;
    }
    void main(){
      vec2 p=vUv*2.-1.;float r=length(p),a=atan(p.y,p.x);
      float pixel=max(length(fwidth(p))*.65,.00035),time=uTime;
      float fine=(1.-smoothstep(.006,.025,pixel))*min(uDetail,1.);
      float extra=clamp(uDetail-1.,0.,1.);
      float form=smoothstep(0.,.3,time),sweep=smoothstep(-.025,.025,form*TAU-mod(a+PI*.5+TAU,TAU))*step(.0001,form);
      float frameD=min(abs(r-.94),abs(r-.905));
      float frame=stroke(frameD,.0022,pixel)*sweep;
      float tickAngle=mod(a+PI/72.,TAU/72.)-PI/72.;vec2 tick=polar(tickAngle,r);
      frame=max(frame,ink(segment(tick,vec2(.915,0.),vec2(.929,0.)),.0012,pixel)*fine*sweep*.60);
      // Coordinates rotate opposite the pattern: outer clockwise +4 deg/s,
      // inner counterclockwise -6, web clockwise +2, badges counterclockwise -3.
      vec2 op=turn(p,time*PI/45.);float oa=mod(atan(op.y,op.x)+TAU,TAU),slot=floor(oa/(TAU/48.)+.5);
      float localAngle=mod(oa+PI/48.,TAU/48.)-PI/48.;vec2 oq=vec2(sin(localAngle)*r,cos(localAngle)*r-.846);
      float outerD;
      if(mod(slot,4.)<.5){outerD=min(abs(length(oq)-.026),emblem(oq/.019,mod(floor(slot/4.),4.))*.019);}
      else{outerD=glyph(oq/vec2(.023,.035),slot+floor(slot/4.))*.023;}
      float outerReveal=smoothstep(.15+slot/48.*.42,.30+slot/48.*.45,time);
      float outer=stroke(outerD,.00125,pixel)*outerReveal*fine;
      outer=max(outer,ink(min(abs(r-.793),abs(r-.891)),.0014,pixel)*smoothstep(.15,.65,time)*.55);
      vec2 ip=turn(p,-time*PI/30.);float ia=mod(atan(ip.y,ip.x)+TAU,TAU),islot=floor(ia/(TAU/32.)+.5);
      float ilocal=mod(ia+PI/32.,TAU/32.)-PI/32.;vec2 iq=vec2(sin(ilocal)*r,cos(ilocal)*r-.508);
      float innerReveal=smoothstep(.20+islot/32.*.35,.35+islot/32.*.40,time);
      float inner=stroke(glyph(iq/vec2(.021,.028),islot*3.+2.)*.021,.0012,pixel)*fine*innerReveal;
      inner=max(inner,ink(min(abs(r-.464),abs(r-.552)),.0015,pixel)*smoothstep(.15,.70,time)*.65);
      vec2 bp=turn(p,-time*PI/60.);float ba=atan(bp.y,bp.x),bid=mod(floor((ba+PI*.25)/(PI*.5))+4.,4.);
      vec2 bq=turn(bp,-bid*PI*.5)-vec2(.637,0.);float br=length(bq);
      float badgeReveal=smoothstep(.55+bid*.055,.82+bid*.06,time);
      float badgeD=min(abs(br-.106),abs(br-.088));
      float badge=stroke(badgeD,.0022,pixel);
      badge=max(badge,stroke(emblem(vec2(-bq.y,bq.x)/.071,bid)*.071,.0017,pixel));
      badge*=badgeReveal;
      float clearance=smoothstep(.108,.118,br); // only removes other sigil lines, never the ground
      vec2 gp=turn(p,time*PI/90.);float webD=10.;
      for(int i=0;i<12;i++){
        float fi=float(i),theta=fi*TAU/12.;vec2 v=polar(theta,.774);
        float grow=clamp((time-(.15+fi*.018))/.36,0.,1.);
        webD=min(webD,trace(gp,v,polar(theta+TAU/12.,.774),grow));
        webD=min(webD,trace(gp,v,polar(theta+TAU*4./12.,.774),grow));
        webD=min(webD,trace(gp,v,polar(theta+TAU*5./12.,.774),grow));
      }
      float web=stroke(webD,.00095,pixel)*smoothstep(.15,.22,time)*smoothstep(.39,.41,r)*fine*(1.-smoothstep(.451,.464,r)*(1.-smoothstep(.552,.565,r)));
      // Central diamonds and concentric sun remain anchored to the contact point.
      float coreD=min(abs(r-.397),min(abs(r-.34),abs(r-.178)));
      float diamond=abs(abs(p.x)+abs(p.y)-.31)*.7071;
      vec2 cp=turn(p,PI*.25);diamond=min(diamond,abs(abs(cp.x)+abs(cp.y)-.31)*.7071);
      coreD=min(coreD,diamond);
      coreD=min(coreD,emblem(p/.115,0.)*.115);
      float core=stroke(coreD,.0018,pixel)*sweep;
      float pulse=1.+.25*smoothstep(0.,.08,uPulseAge)*(1.-smoothstep(.08,.35,uPulseAge));
      float fade=(1.-smoothstep(11.35,12.2,time))*uCancel;
      float sustain=mix(1.,.44,smoothstep(1.4,2.9,time));
      float major=max(frame*.34,max(core*.32*pulse,badge*.40*pulse));
      float minor=max(outer*.30,inner*.27)*pulse;
      float alpha=max(major,max(minor,web*(.115+extra*.04))*clearance)*fade*sustain;
      vec3 color=mix(uColor,vec3(1.,.985,.92),clamp(max(core,badge)*.55,0.,.55));
      gl_FragColor=vec4(color,alpha);${_}
    }`),N=x(`relic-impact`,10,`${v}varying vec2 vUv;void main(){float age=max(0.,uImpactAge);vec2 p=(vUv*2.-1.)*5.;float r=length(p),a=atan(p.y,p.x);float front=.1+4.4*(1.-pow(1.-clamp(age/.65,0.,1.),3.));float ring=exp(-pow((r-front)/.11,2.))*(1.-smoothstep(.3,.65,age));float water=relicWater(p,age);ring*=mix(1.,.12+.88*water,clamp(uDetail,0.,1.));float wake=exp(-pow((r-front+.22)/.24,2.))*(1.-smoothstep(.25,.65,age))*water*.24;for(int j=1;j<5;j++){float k=float(j);float behind=front*(1.-k*.11);float pressure=exp(-pow((r-behind)/(.055+k*.016),2.));wake+=pressure*(.23-k*.027)*(.22+.78*relicWater(p,age-k*.018))*(1.-smoothstep(.22,.65,age))*smoothstep(.015,.07,age);}float peak=smoothstep(0.,.045,age)*(1.-smoothstep(.08,.2,age));float flash=exp(-r*r*3.5)*peak;float rays=pow(max(0.,cos(a*9.+.7)),18.)*exp(-r*1.7)*peak;float valid=step(0.,uImpactAge);gl_FragColor=vec4(mix(uColor,vec3(1.),clamp(flash+rays,0.,1.)),(ring*.8+wake+flash+rays)*valid*uCancel);${_}}`,.045),P=b(`relic-healing-wave`,new e.PlaneGeometry(1,1,160,16),`varying vec2 vUv;varying float vClip;void main(){vUv=uv;float age=max(0.,uPulseAge),p=clamp(age/1.6,0.,1.),a=uv.x*6.283185;float width=mix(1.2,.6,p);float r=uRadius-(1.-uv.y)*width;vClip=smoothstep(0.,.15,r);float ripple=(sin(a*11.-age*6.)+sin(a*19.+age*4.))*.018;float crest=pow(max(0.,sin(uv.y*3.141593)),1.7)*.36*(1.-p*.6);vec3 q=vec3(cos(a)*(max(0.,r)+ripple),.055+crest,sin(a)*(max(0.,r)+ripple));gl_Position=projectionMatrix*modelViewMatrix*vec4(q,1.);}`,`${v}varying vec2 vUv;varying float vClip;void main(){float t=max(0.,uPulseAge),p=t/1.6,x=vUv.x*6.283185,y=vUv.y;float fade=smoothstep(0.,.075,t)*(1.-smoothstep(1.05,1.6,t))*step(0.,uPulseAge);float edge=exp(-pow((y-.76)/.11,2.));float body=pow(max(0.,sin(y*3.141593)),.8);float feather=smoothstep(0.,.32,y)*(1.-smoothstep(.64,1.,y));float flow=pow(.5+.5*sin(y*32.-t*10.+sin(x*13.-t*3.)*.55),6.)*.13*uDetail;float breakup=.88+.12*sin(x*23.-t*5.);vec2 wp=vec2(cos(x),sin(x))*(uRadius-(1.-y)*mix(1.2,.6,p));float water=relicWater(wp,t);float liquid=mix(1.,.10+.90*water,clamp(uDetail,0.,1.));float alpha=(body*(.29+flow)*liquid+edge*.62*(.28+.72*water))*pow(feather,1.6)*fade*vClip*breakup*uCancel;vec3 color=mix(uColor,vec3(1.,.99,.91),edge*.9);gl_FragColor=vec4(color,alpha);${_}}`),F=b(`relic-healing-echo`,new e.PlaneGeometry(1,1,128,4),`varying vec2 vUv;void main(){vUv=uv;float a=uv.x*6.283185;float r=max(0.,uRadius*.81-(1.-uv.y)*.38);gl_Position=projectionMatrix*modelViewMatrix*vec4(cos(a)*r,.035,sin(a)*r,1.);}`,`${v}varying vec2 vUv;void main(){float theta=vUv.x*6.283185;float water=relicWater(vec2(cos(theta),sin(theta))*(uRadius*.81-(1.-vUv.y)*.38),uPulseAge);float a=pow(max(0.,sin(vUv.y*3.14159)),3.)*smoothstep(0.,.24,vUv.y)*(1.-smoothstep(.72,1.,vUv.y))*smoothstep(.1,.3,uPulseAge)*(1.-smoothstep(.8,1.55,uPulseAge))*.23;gl_FragColor=vec4(uColor,a*uCancel*mix(1.,.18+.82*water,clamp(uDetail,0.,1.)));${_}}`),I=t.seed>>>0,te=()=>(I=1664525*I+1013904223>>>0,I/4294967296);function ne(t,n=t){let r=new e.PlaneGeometry(1,1),i=new e.InstancedBufferGeometry;i.setIndex(r.index.clone());for(let e of Object.keys(r.attributes))i.setAttribute(e,r.attributes[e].clone());r.dispose();let a=new Float32Array(t*4),o=I;for(let e=0;e<a.length;e++)a[e]=te(),e===n*4-1&&(o=I);return I=o,i.setAttribute(`aSeed`,new e.InstancedBufferAttribute(a,4)),i}let L=[],R=[];function z(e,t,n,r,i,a){let o=n-e,s=r-t,c=Math.hypot(o,s),l=-s/c*i,u=o/c*i,d=[[e+l,.025,t+u],[e-l,.025,t-u],[n-l*.55,.025,r-u*.55],[n+l*.55,.025,r+u*.55]];for(let e of[0,1,2,0,2,3])L.push(...d[e]),R.push(e===0||e===3?0:1,a+(e>=2?.15:0))}for(let e=0;e<13;e++){let t=e*Math.PI*2/13+te()*.12,n=.1,r=Math.cos(t)*n,i=Math.sin(t)*n;for(let e=0;e<6;e++){let a=n+.2+te()*.3,o=t+(te()-.5)*.3,s=Math.cos(o)*a,c=Math.sin(o)*a;if(z(r,i,s,c,.035*(1-e/8),e/7),e===2||e===4){let t=o+(te()>.5?.6:-.6),n=a+.35;z(s,c,Math.cos(t)*n,Math.sin(t)*n,.018,e/7+.08)}r=s,i=c,n=a}}let re=new e.BufferGeometry;re.setAttribute(`position`,new e.Float32BufferAttribute(L,3)),re.setAttribute(`uv`,new e.Float32BufferAttribute(R,2));let ie=b(`relic-ground-cracks`,re,y,`varying vec2 vUv;void main(){float t=uImpactAge,edge=abs(vUv.x-.5)*2.;float reveal=smoothstep(vUv.y*.17,vUv.y*.17+.035,t);float fade=1.-smoothstep(.65,1.5,t);float center=1.-smoothstep(.55,1.,edge);vec3 col=mix(vec3(.32,.25,.17),vec3(.035,.025,.018),center);gl_FragColor=vec4(col,reveal*fade*uCancel*.86);${g}}`),ae=b(`relic-impact-debris`,ne(240,48),`attribute vec4 aSeed;varying vec2 vUv;varying float vFade,vShade;void main(){vUv=uv*2.-1.;float age=max(0.,uImpactAge),delay=aSeed.w*.045,t=max(0.,age-delay),a=aSeed.x*6.283185;float lifetime=.65+aSeed.y*.75;float speed=2.+aSeed.z*3.3,vy=2.3+aSeed.y*2.3;vec3 p=vec3(cos(a)*(.15+speed*t),.06+vy*t-4.9*t*t,sin(a)*(.15+speed*t));vFade=step(delay,age)*step(0.,uImpactAge)*(1.-smoothstep(lifetime*.65,lifetime,t))*smoothstep(-.12,.04,p.y);p.y=max(.025,p.y);vShade=.4+aSeed.z*.5;vec4 mv=modelViewMatrix*vec4(p,1.);float rot=aSeed.z*6.283+t*(3.+aSeed.y*5.);vec2 q=mat2(cos(rot),-sin(rot),sin(rot),cos(rot))*position.xy;mv.xy+=q*vec2(.11+aSeed.w*.18,.07+aSeed.z*.14)*uSize;gl_Position=projectionMatrix*mv;}`,`varying vec2 vUv;varying float vFade,vShade;void main(){float d=max(abs(vUv.x)*.80+abs(vUv.y)*.39,max(abs(vUv.y)*.86,abs(vUv.x+vUv.y*.38)*.77));float mask=1.-smoothstep(.65,.70,d);float top=step(vUv.x*.38-.12,vUv.y);float side=step(-.12,vUv.x+vUv.y*.25);float grain=.94+.06*sin(vUv.x*37.+vUv.y*51.);vec3 c=mix(vec3(.08,.065,.05),vec3(.48,.41,.31),.18+top*.44+side*.12+vShade*.13)*grain;gl_FragColor=vec4(c,mask*vFade*uCancel);${g}}`),B=b(`relic-impact-dust`,ne(32),`attribute vec4 aSeed;varying vec2 vUv;varying float vAge,vSeed,vFade;void main(){vUv=uv*2.-1.;float age=max(0.,uImpactAge),delay=.035+aSeed.z*.09,t=max(0.,age-delay),a=aSeed.x*6.283185;float radius=.35+(1.-exp(-t*3.2))*(2.4+aSeed.y*1.2);vec3 p=vec3(cos(a)*radius,.15+sin(min(t/1.5,1.)*3.14159)*(.25+aSeed.w*.32),sin(a)*radius);vAge=t;vSeed=aSeed.y*31.;vFade=smoothstep(delay,delay+.08,age)*(1.-smoothstep(.5,1.5,age))*step(0.,uImpactAge);float grow=.3+(1.-exp(-t*5.))*(.85+aSeed.w*.55);vec4 mv=modelViewMatrix*vec4(p,1.);mv.xy+=position.xy*vec2(grow,grow*.6)*uSize;gl_Position=projectionMatrix*mv;}`,`varying vec2 vUv;varying float vAge,vSeed,vFade;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}void main(){vec2 p=vUv;float turn=vAge*.7;vec2 q=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*p;float n=noise(q*3.+vec2(vSeed,-vAge*.9))*.65+noise(q*7.+vSeed+vAge*.5)*.35;float shape=1.-smoothstep(.32,.98,length(p)+(.5-n)*.35);float erosion=smoothstep(.15+vAge*.15,.6,n);float alpha=shape*erosion*vFade*uCancel*.43;vec3 col=mix(vec3(.17,.15,.12),vec3(.46,.40,.32),n*.65+(p.y+.5)*.15);gl_FragColor=vec4(col,alpha);${g}}`),V=b(`relic-magic-smoke-ring`,ne(48),`attribute vec4 aSeed;varying vec2 vUv,vRingPos;varying float vSeed,vRoll;void main(){vUv=uv*2.-1.;float t=max(0.,uPulseAge),p=clamp(t/1.6,0.,1.);float a=aSeed.x*6.283185;float r=uRadius*.85;float radialRoll=sin(t*7.+aSeed.z*6.283)*.16*sin(p*3.14159);vec3 center=vec3(cos(a)*(r+radialRoll),sin(a*5.+t*5.)*.13+sin(t*6.+aSeed.y*6.283)*.12,sin(a)*(r+radialRoll));float width=min(r*.58,1.8+aSeed.z*.65)*(1.-p*.25);float height=(.45+aSeed.w*.55)*smoothstep(0.,.16,t)*(1.-p*.28);vec3 right=normalize(vec3(modelViewMatrix[0][0],modelViewMatrix[1][0],modelViewMatrix[2][0]));vec3 up=normalize(vec3(modelViewMatrix[0][1],modelViewMatrix[1][1],modelViewMatrix[2][1]));height*=sqrt(pow(uSmokeThickness*up.y,2.)+max(0.,1.-up.y*up.y));vec3 q=center+right*position.x*width+up*position.y*height;vRingPos=q.xz;vSeed=aSeed.y*27.;vRoll=aSeed.z*6.283+t*(1.2+aSeed.w);gl_Position=projectionMatrix*modelViewMatrix*vec4(q,1.);}`,`varying vec2 vUv,vRingPos;varying float vSeed,vRoll;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1)),f.x),f.y);}void main(){float t=max(0.,uPulseAge);vec2 p=vUv;float angle=vRoll+length(p)*1.2;vec2 q=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p;float n=noise(q*2.7+vec2(vSeed,-t*1.4))*.6+noise(q*6.3+vec2(-t*.8,vSeed))*.28+noise(q*11.+vSeed)*.12;float envelope=pow(1.-smoothstep(.12,1.08,length(p)+(.5-n)*.22),1.5);float cloud=smoothstep(.22,.66,n);float curl=exp(-pow((n-.52)/.07,2.))*(.55+.45*uDetail);float radius=length(vRingPos),inner=max(.72,uRadius*.85-.88);float hole=smoothstep(inner,inner+.32,radius)*(1.-smoothstep(uMaxRadius-.3,uMaxRadius,radius));float fade=smoothstep(.04,.18,t)*(1.-smoothstep(.95,1.6,t))*step(0.,uPulseAge);float alpha=envelope*(cloud*.10+curl*.065)*hole*fade*uCancel;vec3 color=mix(uColor,vec3(1.,.98,.9),clamp(curl*.45+cloud*.25,0.,.65));gl_FragColor=vec4(color,alpha);gl_FragColor.rgb*=uLightGain;
#include <colorspace_fragment>
gl_FragColor.rgb*=gl_FragColor.a;gl_FragColor.a=0.;}`);V.position.y=1.5,V.geometry.instanceCount=48;let oe=V.geometry.getAttribute(`aSeed`);for(let e=0;e<48;e++)oe.setX(e,(e+.5+(oe.getX(e)-.5)*.4)/48);let H=b(`relic-motes`,ne(96),`attribute vec4 aSeed;varying vec2 vUv;varying float vFade;void main(){vUv=uv*2.-1.;float a=aSeed.x*6.283185;vec3 p;float fade=0.;if(uEmitTime<1.35){float t=clamp(uTime/1.35,0.,1.);float r=(1.-t)*(.6+aSeed.y*1.6);p=vec3(cos(a)*r,.08+aSeed.z*.45*(1.-t),sin(a)*r);fade=sin(t*3.14159)*.55;}else{float birth=floor(uEmitTime*.6+aSeed.y)/.6-aSeed.y/.6;float age=max(0.,uTime-birth),life=1.35;float r=.2+aSeed.z*1.6;p=vec3(cos(a)*r,.15+age*(.45+aSeed.w),sin(a)*r);fade=sin(clamp(age/life,0.,1.)*3.14159)*.36;if(uPulseAge>=0.){float pt=uPulseAge,pr=uRadius*(.8+aSeed.z*.15);p=vec3(cos(a)*pr,.08+pt*(.3+aSeed.w*.6),sin(a)*pr);fade=smoothstep(0.,.12,pt)*(1.-smoothstep(.5,1.5,pt))*.65;}}vFade=fade*(1.-smoothstep(11.5,12.7,uTime));vec4 mv=modelViewMatrix*vec4(p,1.);mv.xy+=position.xy*vec2(.028+aSeed.w*.032,.06+aSeed.z*.06)*uSize;gl_Position=projectionMatrix*mv;}`,`varying vec2 vUv;varying float vFade;void main(){float d=abs(vUv.x)+abs(vUv.y);float a=(1.-smoothstep(.15,1.,d))*vFade*uCancel;gl_FragColor=vec4(mix(uColor,vec3(1.),.6),a);${g}}`),U=null,se={value:new e.Matrix4};function W(e){if(e){e.wrapper.removeFromParent();for(let t of e.materials)t.material.dispose();for(let t of e.skeletons)t.dispose();e.model.traverse(e=>{e.isInstancedMesh&&e.dispose()})}}function G(t,n={}){if(u)throw Error(`Cannot replace a disposed effect.`);if(t===null)return W(U),U=null,q(),null;if(!t?.isObject3D)throw TypeError(`setObject expects a loaded Three.js Object3D, such as gltf.scene.`);let o=n.height??3,s=n.rotation??[0,0,0];if(!Number.isFinite(o)||o<=0||!Array.isArray(s)||s.length!==3||!s.every(Number.isFinite))throw TypeError(`height must be positive; rotation must contain three radians.`);let c=0,l=[];if(t.traverse(e=>{if(l.push(e),e===r||e===a)throw TypeError(`Cannot mount the effect inside itself.`);if(e.isSprite||e.isPoints||e.isLine||e.isBatchedMesh)throw TypeError(`Use a mesh/group model; sprites, points, lines and batched meshes are not supported.`);if(e.isMesh){c++;for(let t of[e.material].flat())if(!t||!(t.isMeshBasicMaterial||t.isMeshStandardMaterial||t.isMeshLambertMaterial||t.isMeshPhongMaterial||t.isMeshToonMaterial||t.isMeshMatcapMaterial)||t.onBeforeCompile.toString().slice(t.onBeforeCompile.toString().indexOf(`{`)+1,t.onBeforeCompile.toString().lastIndexOf(`}`)).trim()!==``)throw TypeError(`Use standard Three.js mesh materials without custom shader hooks.`)}}),!c)throw TypeError(`Model must contain at least one mesh.`);let d={wrapper:new e.Group,model:t.clone(!0),materials:[],skeletons:new Set};try{let t=[];d.model.traverse(e=>t.push(e));let n=new Map(l.map((e,n)=>[e,t[n]]));for(let e=0;e<l.length;e++)if(l[e].isSkinnedMesh){let r=l[e],i=t[e];if(r.skeleton.bones.some(e=>!n.has(e)))throw TypeError(`Pass the full model including all skeleton bones.`);i.skeleton=r.skeleton.clone(),d.skeletons.add(i.skeleton),i.skeleton.bones=r.skeleton.bones.map(e=>n.get(e)),i.bindMatrix.copy(r.bindMatrix),i.bindMatrixInverse.copy(r.bindMatrixInverse)}let r=new Map;d.model.traverse(e=>{if(!e.isMesh)return;e.castShadow=!1;let t=e=>{if(r.has(e))return r.get(e);let t=e.clone();return r.set(e,t),d.materials.push({material:t,opacity:e.opacity,depthWrite:e.depthWrite}),t.transparent=!0,t.onBeforeCompile=e=>{e.uniforms.uRelicWorldToRoot=se,e.vertexShader=`varying float vRelicGroundY;uniform mat4 uRelicWorldToRoot;
`+e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
              vec4 relicLocal=vec4(transformed,1.);
              #ifdef USE_INSTANCING
                relicLocal=instanceMatrix*relicLocal;
              #endif
              vRelicGroundY=(uRelicWorldToRoot*modelMatrix*relicLocal).y;`),e.fragmentShader=`varying float vRelicGroundY;
`+e.fragmentShader.replace(`#include <clipping_planes_fragment>`,`#include <clipping_planes_fragment>
if(vRelicGroundY<0.)discard;`)},t.customProgramCacheKey=()=>`sacred-relic-custom-model-ground-v1`,t};e.material=Array.isArray(e.material)?e.material.map(t):t(e.material),e.onBeforeRender=()=>{i.updateWorldMatrix(!0,!1),se.value.copy(i.matrixWorld).invert()}}),d.model.position.set(0,0,0),d.model.updateMatrix(),d.wrapper.name=`sacred-relic-custom-model`,d.wrapper.add(d.model),d.wrapper.rotation.set(...s),d.wrapper.updateMatrixWorld(!0);let a=new e.Box3().setFromObject(d.wrapper,!0),c=a.getSize(new e.Vector3);if(a.isEmpty()||!Number.isFinite(c.y)||c.y<1e-6)throw TypeError(`Model must have finite non-zero height.`);let u=o/c.y;d.wrapper.scale.setScalar(u),d.wrapper.position.set(-(a.min.x+a.max.x)*.5*u,-a.min.y*u,-(a.min.z+a.max.z)*.5*u)}catch(e){throw W(d),e}return W(U),U=d,a.add(d.wrapper),q(),d.model}function K(){return u||c>=13-1e-9||l>=0&&c-l>=.45-1e-9?`finished`:l>=0||c>=11.35-1e-9?`ending`:c<1.35-1e-9?`starting`:`active`}function q(){let e=l<0?c:Math.min(c,l),t=l<0?1:1-p(0,.45,c-l),n=e>=1.35-1e-9?Math.max(0,c-1.35):null,o=-1,s=null;for(let t=0;t<5;t++){let n=3.35+t*2,r=c-n;e>=n-1e-9&&r>=-1e-9&&r<1.6-1e-9&&(o=t,s=Math.max(0,r))}let u=s===null?0:.12+(9*d.spread-.12)*(1-(1-s/1.6)**2);m.uTime.value=c,m.uEmitTime.value=e,m.uImpactAge.value=n??-1,m.uPulseAge.value=s??-1,m.uRadius.value=u,m.uMaxRadius.value=9*d.spread,m.uCancel.value=t,i.scale.setScalar(d.size),r.visible=K()!==`finished`;let h=f((e-1)/.35,0,1),g=f((e-1.35)/.08,0,1);a.position.y=7.5*(1-h*h)-.6*(1-(1-g)**3),w.value=Math.max(0,-a.position.y),a.visible=e>=1-1e-9&&c<12.2&&t>0;let _=p(1,1.04,e)*(1-p(11.35,12.2,c))*t;m.uBodyFade.value=_,S.opacity=_,C.opacity=_,S.depthWrite=_>.98,C.depthWrite=_>.98;for(let e of a.children)(e.name===`relic-triangle-border`||e.name===`relic-triangle-face`)&&(e.visible=!U);if(U)for(let e of U.materials)e.material.opacity=e.opacity*_,e.material.depthWrite=e.depthWrite&&_>.98;M.visible=c<12.2,j.visible=e>=1&&c<1.48&&l<0,N.visible=n!==null&&n<.65,P.visible=F.visible=V.visible=o>=0,ie.visible=B.visible=ae.visible=n!==null&&n<1.5,ae.geometry.instanceCount=Math.round(240*d.density),B.geometry.instanceCount=Math.round(32*d.density),H.geometry.instanceCount=Math.round(96*d.density),H.visible=c<12.7,r.userData.sacredRelicState={time:c,impactAge:n,pulseIndex:o,pulseAge:s,waveRadius:u,smokeRadius:u*.85,smokeHeight:1.5,smokeThickness:5,cancelFade:t}}function ce(e={}){if(u)return;let n=d??{color:t.color,size:1,speed:1,detail:1,density:.5,spread:1};d={...n};for(let t of Object.keys(n))Object.hasOwn(e,t)&&(d[t]=e[t]);for(let e of[`size`,`speed`,`detail`,`density`,`spread`]){let t=e===`density`?.125:e===`spread`?.5:.25,r=e===`density`?1:e===`spread`?1.5:2;d[e]=f(Number.isFinite(d[e])?d[e]:n[e],t,r)}/^#[0-9a-f]{6}$/i.test(d.color)||(d.color=n.color),m.uColor.value.set(d.color),m.uSize.value=d.size,m.uDetail.value=d.detail,S.color.set(d.color).multiplyScalar(.82),q()}return ce(n),{group:r,update(e){u||K()===`finished`||!Number.isFinite(e)||e<0||(c+=e*d.speed,q())},setOptions:ce,setObject:G,hit(){this.stop()},stop(){u||l>=0||K()===`finished`||(l=c,q())},reset(){u||(c=0,l=-1,q())},dispose(){if(!u){W(U),U=null,u=!0,r.visible=!1,r.removeFromParent();for(let e of o)e.dispose();for(let e of s)e.dispose();o.clear(),s.clear(),r.clear()}},get settings(){return{...d}},get elapsed(){return c},get phase(){return K()},get finished(){return K()===`finished`},get particleCount(){return V.geometry.instanceCount+ae.geometry.instanceCount+B.geometry.instanceCount+H.geometry.instanceCount},get lifecycle(){return{start:1.35,end:1.65}}}}function oe(e){return 1.7*e}function H(e,t,n={}){let r=new e.Group;r.name=t.id;let i={start:t.lifecycle?.start??1.2,end:t.lifecycle?.end??1.4},a,o=0,s=-1,c=!1,l=!1,u=0,d=0,f=!1,p=Math.random()*4294967296>>>0,m=(e,n=0)=>{let r=(p^t.seed^Math.imul(e+1,2654435761)^Math.imul(n+1,2246822507))>>>0;return r=Math.imul(r^r>>>16,2146121005),r=Math.imul(r^r>>>15,2221713035),((r^r>>>16)>>>0)/4294967296},h=new e.Vector3(1,0,0),g=new e.Vector3(1,0,0),_=new e.Matrix4,v=new e.Matrix4,y=new e.Vector3,b=new Set,x=new Set,S={uTime:{value:0},uCharge:{value:0},uEnd:{value:-1},uImpact:{value:0},uFlight:{value:0},uSize:{value:1},uDetail:{value:1},uColor:{value:new e.Color(t.color)}},C=`uniform float uTime,uCharge,uEnd,uImpact,uFlight,uSize,uDetail;uniform vec3 uColor;
    float hash(float n){return fract(sin(n*127.1+311.7)*43758.5453);}
    float fade(){return uEnd<0.0?1.0:1.0-smoothstep(0.0,uImpact>.5?.10:1.0,uEnd);}
    float charged(){return smoothstep(0.0,.2,uCharge);}
    // Fivefold instantaneous discharge energy, draining within 90ms; no range change.
    float contactPunch(float age){return 1.0+4.0*(1.0-smoothstep(.012,.09,max(0.0,age)));}
    const float PI=3.14159265359;`,w=`
#include <tonemapping_fragment>
#include <colorspace_fragment>
`;function T(t,n,r={},i=!0){let a=new e.ShaderMaterial({uniforms:{...S,...r},vertexShader:C+t,fragmentShader:C+n,transparent:!0,depthWrite:!1,depthTest:!0,side:e.DoubleSide,forceSinglePass:!0,blending:i?e.AdditiveBlending:e.NormalBlending,toneMapped:!1});return x.add(a),a}function E(t,n,i,a=2){b.add(n);let o=new e.Mesh(n,i);return o.name=t,o.renderOrder=a,o.frustumCulled=!1,r.add(o),o}function D(){let t=[],n=[],r=[],i=[[-1.7,0],[-1.48,.045],[.4,.055],[1.18,.09],[1.7,0]];i.forEach(([e,n])=>{for(let r=0;r<4;r++){let i=r*Math.PI/2+Math.PI/4;t.push(e,Math.cos(i)*n,Math.sin(i)*n)}}),r.push(...Array(t.length/3).fill(0));for(let e=0;e<i.length-1;e++)for(let t=0;t<4;t++){let r=e*4+t,i=e*4+(t+1)%4;n.push(r,i,r+4,i,i+4,r+4)}for(let e=0;e<4;e++){let i=e*Math.PI/2+Math.PI/4,a=Math.cos(i),o=Math.sin(i),s=t.length/3,c=[[.18,.49],[.6,.46],[1.6,.055],[.89,.21],[.46,.24]];for(let e of[-1,1])for(let[n,i]of c){let s=(.035+.055*Math.min(1,i/.3))*e;t.push(n,a*i-o*s,o*i+a*s),r.push(1)}for(let e=1;e<4;e++)n.push(s,s+e+1,s+e,s+5,s+5+e,s+6+e);for(let e=0;e<5;e++){let t=(e+1)%5;n.push(s+e,s+t,s+e+5,s+t,s+t+5,s+e+5)}}for(let e=0;e<4;e++){let i=e*Math.PI/2,a=Math.cos(i),o=Math.sin(i),s=t.length/3;t.push(-1.62,a*.06,o*.06,-1.48,a*.18,o*.18,-.92,a*.06,o*.06,-1.45,a*.06-o*.035,o*.06+a*.035),r.push(1,1,1,1),n.push(s,s+1,s+3,s+1,s+2,s+3,s+2,s,s+3,s,s+2,s+1)}let a=new e.BufferGeometry;a.setAttribute(`position`,new e.Float32BufferAttribute(t,3)),a.setAttribute(`aBlade`,new e.Float32BufferAttribute(r,1)),a.setIndex(n);let o=a.toNonIndexed();return a.dispose(),o.computeVertexNormals(),o}let O=`varying float vBlade;varying vec3 vN,vV,vP;
    void main(){float rim=pow(1.0-abs(dot(normalize(vN),normalize(vV))),1.4);
    float reveal=smoothstep(-.2,.15,uCharge*3.8-(vP.x+1.7));float stripe=pow(.5+.5*sin(vP.x*24.0-uTime*15.0),14.0);
    float a=reveal*charged()*fade();
    // Contact erodes the arrow from tip to tail instead of fading a solid card.
    if(uImpact>.5){float age=max(0.0,uEnd)*${i.end.toFixed(4)};float cell=hash(floor(vP.x*23.0)+floor(atan(vP.z,vP.y)*5.0)*37.0);
      a*=1.0-smoothstep(.03,.10,age+(vP.x+1.7)*.010+cell*.015);}
    if(a<.003)discard;
    float head=smoothstep(.35,.62,vP.x),center=exp(-length(vP.yz)*26.0);
    float tip=smoothstep(1.08,1.7,vP.x),ridge=pow(rim,2.0);
    float tension=smoothstep(.86,1.0,uCharge)*.14;
    vec3 gold=uColor*(.48+.30*abs(normalize(vN).y));
    float hot=clamp((1.0-vBlade)*.90+center*.45+tip*.65+ridge*.22+stripe*.04+tension*tip,0.0,.95);
    vec3 col=mix(gold,vec3(1.0,.99,.88),hot);
    gl_FragColor=vec4(col,a*.94);${w}}`;E(`projectile-core`,D(),T(`attribute float aBlade;varying float vBlade;varying vec3 vN,vV,vP;
    void main(){vec3 p=position*uSize;p.yz*=mix(.06,1.0,smoothstep(.05,.78,uCharge));
    vBlade=aBlade;vP=position;vec4 mv=modelViewMatrix*vec4(p,1);vN=normalize(normalMatrix*normal);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}`,O,{},!1));let ee=new e.BufferGeometry,k=[],A=[],j=[];for(let e=0;e<3;e++){let t=e*Math.PI/3,n=Math.cos(t),r=Math.sin(t),i=k.length/3;k.push(-2,-n*.95,-r*.95,1.9,-n*.95,-r*.95,1.9,n*.95,r*.95,-2,n*.95,r*.95),A.push(0,0,1,0,1,1,0,1),j.push(i,i+1,i+2,i,i+2,i+3)}ee.setAttribute(`position`,new e.Float32BufferAttribute(k,3)),ee.setAttribute(`uv`,new e.Float32BufferAttribute(A,2)),ee.setIndex(j),E(`electric-arrow-halo`,ee,T(`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position*uSize,1);}`,`varying vec2 vUv;void main(){float x=vUv.x,y=abs(vUv.y*2.0-1.0);float head=exp(-pow((x-.76)*7.0,2.0));float w=.08+head*.25;
    float core=exp(-pow(y/w,2.0)*3.0),halo=exp(-pow(y/(w+.25),2.0)*4.0);float taper=pow(max(0.0,sin(x*PI)),.6);
    float pulse=.94+.06*sin(uTime*13.0+x*8.0);float a=(core*.20+halo*.11)*taper*charged()*fade()*pulse*min(uDetail,1.5);
    if(a<.002)discard;gl_FragColor=vec4(uColor,a);${w}}`),3);function M(t,n,r,i=0){let a=[],o=[],s=0;for(let e=0;e<t*2*(n+1)+i;e++){let i=e>=t*2*(n+1)?64:r;a.push({offset:s,segments:i,points:new Float32Array((i+1)*3)});for(let e=0;e<i;e++){let t=s+e*2;o.push(t,t+1,t+2,t+1,t+3,t+2)}s+=(i+1)*2}let c=new e.BufferGeometry;for(let[t,n]of[[`position`,3],[`aTangent`,3],[`aWidth`,1],[`aEvent`,4],[`uv`,2]])c.setAttribute(t,new e.BufferAttribute(new Float32Array(s*n),n).setUsage(e.DynamicDrawUsage));c.setIndex(o);let l=new Float64Array(t*2);return l.fill(NaN),{geometry:c,paths:a,channels:t,forks:n,cache:l,mode:-1,seed:-1,dirty:!1}}function N(e,t){return T(`attribute vec3 aTangent;attribute float aWidth;attribute vec4 aEvent;
    uniform float uClock,uCutoff,uAttack;varying float vF,vAcross,vEnergy,vRing,vAge;
    void main(){vF=uv.x;vAcross=uv.y;vRing=step(1.5,aEvent.w);vec3 p=position;
      float age=uClock-aEvent.x,life=max(.001,aEvent.y);vAge=age;
      float growth=smoothstep(0.0,uAttack,age);
      float live=smoothstep(0.0,.005,age)*pow(max(0.0,1.0-max(0.0,age)/life),.48);
      float ember=.10*exp(-max(0.0,age-life)*70.0)*step(life,age)*step(age,life+.04);
      vEnergy=(live+ember)*aEvent.z*smoothstep(vF-.07,vF+.015,growth);
      if(uCutoff>=0.0&&aEvent.x>uCutoff)vEnergy=0.0;
      if(vRing>.5){float t=max(0.0,age);p*=1.0-exp(-t*11.0);vEnergy=smoothstep(0.0,.025,age)*(1.0-smoothstep(.22,1.15,age))*aEvent.z;}
      vec4 mv=modelViewMatrix*vec4(p*uSize,1);vec2 tangent=(modelViewMatrix*vec4(aTangent,0)).xy;
      vec2 n=normalize(vec2(-tangent.y,tangent.x)+vec2(.00001,0));mv.xy+=n*uv.y*aWidth*uSize;
      gl_Position=projectionMatrix*mv;}`,`uniform float uClock;varying float vF,vAcross,vEnergy,vRing,vAge;
      void main(){float core=exp(-abs(vAcross)*mix(7.0,20.0,vRing)),halo=pow(max(0.0,1.0-abs(vAcross)),3.0);
      float energy=vEnergy*${t===`impact`?`mix(contactPunch(uClock),1.0,vRing)`:t===`trail`?`smoothstep(.55,1.0,uCharge)*fade()*uFlight`:`charged()*fade()`};
      float band=1.0;
      if(vRing>.5){float sector=floor(vF*23.0),edge=fract(vF*23.0);
        float breakTime=.19+hash(sector+7.0)*.48;
        band=(.46+.20*sin(vF*PI*18.0-uTime*5.0))*(1.0-smoothstep(breakTime,breakTime+.20,vAge));
        band*=mix(1.0,smoothstep(.02,.12,edge)*(1.0-smoothstep(.82,.98,edge)),smoothstep(.12,.42,vAge));}
    float a=(core*.95+halo*.32)*energy*band*min(1.35,.65+uDetail*.35);
      if(a<.002)discard;vec3 color=mix(uColor,vec3(1.0,.99,.87),core*(vRing>.5?.20:.82));
      gl_FragColor=vec4(color,a);${w}}`,{uClock:e,uAttack:{value:t===`impact`?.012:.024},uCutoff:t===`impact`?{value:-1}:I})}let P={value:0},F={value:0},I={value:-1},te=M(4,3,32),ne=M(3,0,16),L=M(8,3,32,2);E(`electric-arrow-arcs`,te.geometry,N(P,`arrow`),4);let R=new Float64Array(3),z=new Float64Array(3);function re(t,n,r,i,a,o=0){let s=t.points,c=t.segments;for(let e=0;e<3;e++)s[e]=n[e],s[c*3+e]=r[e];for(let e=c;e>1;e/=2){let t=e/2,n=a*(e/c)**.72;for(let r=t;r<c;r+=e)for(let e=0;e<3;e++)s[r*3+e]=(s[(r-t)*3+e]+s[(r+t)*3+e])*.5+(m(i,r*3+e)-.5)*2*n*(e===0?.55:1)}for(let t=0;t<=c;t++){let n=t*3;if(o){let e=Math.hypot(s[n],s[n+1],s[n+2]);if(e>o)for(let t=0;t<3;t++)s[n+t]*=o/e}else{s[n]=e.MathUtils.clamp(s[n],-4.2,1.72);let t=Math.hypot(s[n+1],s[n+2]);t>1.35&&(s[n+1]*=1.35/t,s[n+2]*=1.35/t)}}}function ie(e,t,n,r,i,a,o=0){let s=e.paths[t],c=s.points,l=s.segments,u=e.geometry.attributes;for(let e=0;e<=l;e++){let t=Math.max(0,e-1)*3,d=Math.min(l,e+1)*3,f=c[d]-c[t],p=c[d+1]-c[t+1],m=c[d+2]-c[t+2],h=1/(Math.hypot(f,p,m)||1);for(let t=0;t<2;t++){let d=s.offset+e*2+t;u.position.setXYZ(d,c[e*3],c[e*3+1],c[e*3+2]),u.aTangent.setXYZ(d,f*h,p*h,m*h),u.aWidth.setX(d,a*(o===2?1:1-e/l*.82)),u.uv.setXY(d,e/l,t?1:-1),u.aEvent.setXYZW(d,n,r,i,o)}}e.dirty=!0}function ae(t,n,r,a,o,s){let c=t===L,l=t===ne,u=c?1e4:l?2e4:0,d=u+n*701+r*47,f=r>0&&r%2==1&&m(d,99)<.5?r-1:r,p=u+n*701+f*47,h=(n*2+a)*(t.forks+1),g=.09+m(d,1)*.05,_=c?m(432,2)*Math.PI*2+[0,.85,2.7,4.15][n%4]+(m(p,2)-.5)*.68:m(p,2)*Math.PI*2,v=Math.min(1,Math.max(0,o)/i.start),y=1.05+m(d,5)*.4,b=.235,x=.4;if(c){let e=n>=4,t=e?(m(p,3)-.5)*.18:.15+m(p,3)*.68,r=Math.sqrt(1-t*t),i=e?1.6+m(p,4)*1.25:2.45+m(p,4)*.8;R.fill(0),z[0]=t*i,z[1]=Math.cos(_)*r*i,z[2]=Math.sin(_)*r*i,x=e?.28:.52,b=e?.11:.25,y*=e?Math.max(0,1-Math.max(0,o-.22)/.55)*.42:o<.45?1.12:0}else if(l)R[0]=-1.2,R[1]=Math.cos(_)*.06,R[2]=Math.sin(_)*.06,z[0]=-2-m(p,4)*2.1,z[1]=Math.cos(_+.6)*.36,z[2]=Math.sin(_+.6)*.36,x=.16,b=.095,y*=.58;else{let t=1-.72*e.MathUtils.smoothstep(v,.875,1),r=(.38+m(p,3)*.65)*t;R[0]=v<.3?-1.7:-1.6+m(p,6)*.9,R[1]=Math.cos(_)*(v<.3?.88:r),R[2]=Math.sin(_)*(v<.3?.88:r),z[0]=v<.3?-.55+v*3:.9+m(p,7)*.72,z[1]=Math.cos(_+m(p,8)*2)*.1,z[2]=Math.sin(_+m(p,8)*2)*.1,x=(.36+m(p,10)*.38)*t,y*=v<.25?n<2?.65:0:v<.5?n<3?.85:0:1,s===1&&(R[0]-=.85,R[1]*=1.25,R[2]*=1.25,x=.34+m(p,10)*.2)}(r<0||o<0)&&(y=0);let S=t.paths[h];re(S,R,z,p,x,c?3.25:0),ie(t,h,o,g,y,b);for(let e=1;e<=t.forks;e++){let n=p+e*151,r=5+Math.floor(m(n,12)*19),i=r*3;for(let e=0;e<3;e++)R[e]=S.points[i+e];let a=m(n,13)*Math.PI*2,l=(c?.6:.3)+m(n,14)*(c?.8:.66);z[0]=R[0]+(c?(m(n,15)-.25)*l:s===1?-.3-l*.6:.16+m(n,15)*.45),z[1]=R[1]+Math.cos(a)*l,z[2]=R[2]+Math.sin(a)*l,!c&&v>.86&&s===0&&(z[1]*=.65,z[2]*=.65),re(t.paths[h+e],R,z,n,.14+l*.16,c?3.25:0);let u=m(d,30+e)<.18?0:y*(.38+m(n,31)*.3);ie(t,h+e,o+r/S.segments*(c?.012:.024),g*.65,u,b*.5,1)}}function B(e,t,n=0){let r=e===L?.15:e===ne?.16:.145;(e.seed!==p||e.mode!==n)&&(e.cache.fill(NaN),e.seed=p,e.mode=n);for(let i=0;i<e.channels;i++){let a=e===L?i<4?i*.002:.035+(i-4)*.022:i*r/e.channels,o=Math.floor((t-a+1e-9)/r);for(let t=0;t<2;t++){let s=o-t,c=i*2+t;if(e.cache[c]===s)continue;e.cache[c]=s;let l=s*r+a+(e===L&&s===0&&i<4?0:m(i+s*47,e===L?700:300)*.012);ae(e,i,s,t,l,n)}}if(e.dirty){for(let t of Object.values(e.geometry.attributes))t.needsUpdate=!0;e.dirty=!1}}let V=E(`electric-arrow-sigil`,new e.PlaneGeometry(2.6,2.6),T(`varying vec2 vUv;void main(){vUv=uv*2.0-1.0;gl_Position=projectionMatrix*modelViewMatrix*vec4(position*uSize,1);}`,`varying vec2 vUv;float line(float d,float w){return 1.0-smoothstep(w,w+max(fwidth(d),.001),abs(d));}
    void main(){float r=length(vUv),a=atan(vUv.y,vUv.x)+uTime*.23;float rings=line(r-.89,.004)+line(r-.82,.002)+line(r-.57,.003);
    float sector=fract(a/(2.0*PI)*20.0),x=(sector-.5)*2.0,y=(r-.7)/.08;
    float rune=max(line(x,.085)*step(abs(y),.8),line(y-x*.65,.10)*step(abs(x),.65))*step(abs(y),1.0);
    float ticks=line(sin(a*32.0),.12)*step(.91,r)*step(r,.95);
    float t=max(0.0,uTime-${i.start.toFixed(4)});float alive=charged()*(1.0-smoothstep(0.0,.42,t))*fade();
    float spokes=line(sin(a*6.0),.03)*step(.3,r)*step(r,.52);float bloom=exp(-pow((r-.87)*25.0,2.0))*.21+exp(-r*r*5.0)*.10;
    float focus=mix(1.0,.43,smoothstep(.25,.9,uCharge));
    float alpha=(rings*.9+rune*.8+ticks*.7+spokes*.4+bloom)*alive*focus; if(r>1.0||alpha<.003)discard;gl_FragColor=vec4(uColor,alpha*min(uDetail,1.4));${w}}`),1);V.rotation.y=Math.PI/2,E(`projectile-trails`,ne.geometry,N(P,`trail`),3);for(let e=0;e<2;e++){let t=L.paths.length-2+e,n=L.paths[t],r=3.25-e*.45;for(let t=0;t<=n.segments;t++){let i=t/n.segments*Math.PI*2,a=t*3;n.points[a]=e?Math.sin(i)*r*.58:0,n.points[a+1]=Math.cos(i)*r,n.points[a+2]=Math.sin(i)*r*(e?.82:1)}ie(L,t,.08+e*.1,1.1,.44,.13,2)}let H=E(`lifecycle-impact`,L.geometry,N(F,`impact`),4),U=E(`lifecycle-contact-glow`,new e.PlaneGeometry(2,2),T(`varying vec2 vUv;void main(){vUv=uv*2.0-1.0;vec4 center=modelViewMatrix*vec4(0,0,0,1);center.xy+=position.xy*uSize*(.65+(1.0-exp(-max(uEnd,0.0)*14.0))*1.9);gl_Position=projectionMatrix*center;}`,`varying vec2 vUv;void main(){float t=uEnd*${i.end.toFixed(4)},r=length(vUv),a=atan(vUv.y,vUv.x);
    float hot=exp(-r*r*55.0)*exp(-t*27.0);
    float horizontal=exp(-abs(vUv.y)*90.0)*exp(-abs(vUv.x)*5.0);
    float vertical=exp(-abs(vUv.x)*120.0)*exp(-abs(vUv.y)*9.0);
    float rays=(horizontal+vertical*.45)*exp(-t*24.0);
    float cloud=exp(-r*r*12.0)*exp(-t*7.0);
    // The brief contact peak yields to the lightning web and two shock rings.
    float alpha=((hot*1.15+rays*.85)*contactPunch(t)+cloud*.24)*(1.0-smoothstep(.72,1.0,r));
    if(alpha<.003)discard;gl_FragColor=vec4(mix(uColor,vec3(1.0,.99,.86),clamp(hot*1.3+rays,0.0,.95)),alpha);${w}}`),5),se=new e.PlaneGeometry(1,1),W=new e.InstancedBufferGeometry;W.setIndex(se.index.clone());for(let e of Object.keys(se.attributes))W.setAttribute(e,se.attributes[e].clone());se.dispose();let G=new Float32Array(t.maxParticles*4),K=t.seed,q=()=>(K=K*1664525+1013904223>>>0,K/4294967296);for(let e=0;e<G.length;e++)G[e]=q();W.setAttribute(`aSeed`,new e.InstancedBufferAttribute(G,4));let ce=E(`electric-arrow-particles`,W,T(`attribute vec4 aSeed;uniform vec3 uContact;varying vec2 vUv;varying float vFade;
    void main(){vUv=uv*2.0-1.0;float a=aSeed.x*PI*2.0,z=aSeed.y*2.0-1.0;vec3 dir=vec3(z,sqrt(1.0-z*z)*cos(a),sqrt(1.0-z*z)*sin(a));vec3 p;
    if(uImpact>.5){float age=max(0.0,uEnd)*${i.end.toFixed(4)};float t=max(0.0,age-aSeed.w*.14);p=uContact+dir*(.1+(1.0-exp(-t*3.0))*(2.2+aSeed.z*.8))*uSize;p.y-=t*t*.16*uSize;vFade=smoothstep(0.0,.04,t)*(1.0-smoothstep(.30+aSeed.z*.3,1.35,t));}
    else{float f=fract(aSeed.z+uTime*.5);p=vec3(-2.2+f*3.6,dir.y,dir.z)*(1.0-f*.65)*uSize;vFade=sin(f*PI)*charged()*fade()*.6;}
    vec4 mv=modelViewMatrix*vec4(p,1);mv.xy+=position.xy*(.017+aSeed.w*.027)*uSize;gl_Position=projectionMatrix*mv;}`,`varying vec2 vUv;varying float vFade;void main(){float d=abs(vUv.x)+abs(vUv.y);float a=(1.0-smoothstep(.4,1.0,d))*vFade;if(a<.003)discard;gl_FragColor=vec4(mix(uColor,vec3(1),.35),a);${w}}`,{uContact:{value:new e.Vector3}}),4);function le(){return l||s>=0&&o-s>=i.end-1e-9?`finished`:s>=0?`ending`:o>=i.start-1e-9?`active`:`starting`}function J(){S.uTime.value=o,S.uCharge.value=Math.min(1,(s<0?o:s)/i.start),S.uEnd.value=s<0?-1:(o-s)/i.end,S.uImpact.value=+!!c,S.uFlight.value=+(u>0),P.value=o,F.value=Math.max(0,o-s),I.value=s;let e=s<0?o:s;B(te,e,+(u>0)),B(ne,e),c&&B(L,Math.min(.7,o-s)),r.visible=le()!==`finished`,H.visible=c&&le()===`ending`,U.visible=H.visible&&S.uEnd.value<.65,V.visible=o<i.start+.42&&le()!==`finished`,f?(r.updateWorldMatrix(!0,!1),v.copy(r.matrixWorld).invert(),V.matrix.multiplyMatrices(v,_),V.matrix.decompose(V.position,V.quaternion,V.scale)):(V.position.set(-1.7*a.size,0,0),V.rotation.set(0,Math.PI/2,0),V.scale.set(1,1,1))}function ue(n={}){if(l)return;let r=a??{color:t.color,size:1,speed:1,detail:1,density:t.defaultDensity??.5};a={...r,...n},delete a.quantity,delete a.spread,delete a.panelCount;for(let t of[`size`,`speed`,`detail`,`density`]){let n=t===`density`?.125:.25,i=t===`density`?1:2;a[t]=e.MathUtils.clamp(Number.isFinite(a[t])?a[t]:r[t],n,i)}/^#[0-9a-f]{6}$/i.test(a.color)||(a.color=t.color),S.uColor.value.set(a.color),S.uSize.value=a.size,S.uDetail.value=a.detail,d=Math.round(t.maxParticles*a.density),W.instanceCount=d,J()}function Y(){f||=(r.updateWorldMatrix(!0,!0),_.copy(V.matrixWorld),!0)}function X(e){l||le()===`finished`||!Number.isFinite(e)||e<0||(s<0&&(u>0||o+e*a.speed>=i.start)&&Y(),o+=e*a.speed,s<0&&u>0&&r.position.addScaledVector(h,e*u),J())}function de(){l||s>=0||(Y(),s=o,J())}function Z(e,t){if(!(l||s>=0||e&&![e.x,e.y,e.z].every(Number.isFinite))){if(Y(),H.position.set(oe(a.size),0,0),e){y.copy(e),r.parent&&(r.parent.updateWorldMatrix(!0,!1),r.parent.worldToLocal(y));let t=H.position.clone().multiply(r.scale).applyQuaternion(r.quaternion);r.position.copy(y).sub(t)}U.position.copy(H.position),ce.material.uniforms.uContact.value.copy(H.position),r.updateWorldMatrix(!0,!1),v.copy(r.matrixWorld).invert(),y.copy(t??g.clone().transformDirection(r.matrixWorld).negate()),(!Number.isFinite(y.lengthSq())||y.lengthSq()<1e-10)&&y.copy(g).transformDirection(r.matrixWorld).negate(),y.transformDirection(v),H.quaternion.setFromUnitVectors(g,y),c=!0,de()}}function fe(e={}){if(!l){if(e.variationSeed!==void 0&&(!Number.isInteger(e.variationSeed)||e.variationSeed<0||e.variationSeed>4294967295))throw RangeError(`variationSeed must be an unsigned 32-bit integer`);p=e.variationSeed??p+2654435769>>>0,o=0,s=-1,c=!1,f=!1,H.position.set(0,0,0),U.position.set(0,0,0),H.quaternion.identity(),J()}}function pe(){if(!l){l=!0,r.visible=!1,r.removeFromParent();for(let e of b)e.dispose();for(let e of x)e.dispose();b.clear(),x.clear(),r.clear()}}return ue(n),{group:r,update:X,setOptions:ue,hit:Z,stop:de,reset:fe,dispose:pe,setEndpoints(){},setDirection(e,t=4){l||s>=0||!e||!Number.isFinite(e.lengthSq())||e.lengthSq()===0||(h.copy(e).normalize(),u=Number.isFinite(t)?Math.max(0,t):0,r.quaternion.setFromUnitVectors(g,h))},get variationSeed(){return p},get settings(){return{...a}},get elapsed(){return o},get phase(){return le()},get finished(){return le()===`finished`},get particleCount(){return d},get lifecycle(){return{...i}}}}function U(e,t,n={}){let r=t.id===`spatial-smear`,i=new e.Group;i.name=t.id;let a=.18,o=new Float32Array(384),s=new Float32Array(256),c=new Float32Array(128),l=[],u=Array.from({length:64},()=>new e.Vector3),d=Array.from({length:64},()=>new e.Vector3),f=new Float64Array(64);for(let e=0;e<64;e++)if(s.set([e/63,0,e/63,1],e*4),e<63){let t=e*2;l.push(t,t+1,t+2,t+1,t+3,t+2)}let p=new e.Matrix4,m=new e.Vector3,h=new e.Vector3,g=new e.Vector3,_=new e.Vector3(0,1,0),v=new e.Vector3,y=new e.Vector3,b=null,x=0,S=0,C=-1,w=!1,T,E={uColor:{value:new e.Color},uDetail:{value:1},uDensity:{value:.5}},D=`attribute float aAge;varying vec2 vUv;varying float vAge;void main(){vUv=uv;vAge=aAge;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,O=`uniform vec3 uColor;uniform float uDetail,uDensity;varying vec2 vUv;varying float vAge;
    void main(){float age=clamp(vAge,0.0,1.0),y=vUv.y;float fade=pow(1.0-age,1.35);float alpha;vec3 color=uColor;
    #if SMEAR_LAYER == 0
      float lines=0.0;for(int i=0;i<8;i++){float f=float(i);float center=.12+f*.105;float aa=max(fwidth(y),.002);lines+=(1.0-smoothstep(.005,.005+aa,abs(y-center)))*step(f+.5,uDensity*8.0);}
      // Make the fresh leading face readable across the blade, not just at its tip.
      // Retain the actual weapon endpoints and the existing width control.
      float head=1.0-smoothstep(0.0,.28,age);
      float body=mix(.12+.35*y,.42+.12*y,head);
      alpha=(body+lines*.13*uDetail)*smoothstep(0.0,.08,y)*fade;
    #elif SMEAR_LAYER == 1
      alpha=exp(-pow((1.0-y)*7.5,2.0))*.48*uDetail*fade;
    #else
      float aa=max(fwidth(y),.002);alpha=(1.0-smoothstep(.01,.022+aa,1.0-y))*.95*fade;color=mix(uColor,vec3(.86,1.,1.),.8);
    #endif
    if(alpha<.002)discard;gl_FragColor=vec4(color,alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    }`,ee=D.replace(`void main(){`,`varying vec4 vScreen;void main(){`).replace(`gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);`,`vScreen=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_Position=vScreen;`),k=O.replace(`*.48*uDetail*fade`,`*.16*uDetail*fade`).replace(`if(alpha<.002)discard;`,`
    #if SMEAR_LAYER == 1
      float lines=0.0;for(int i=0;i<8;i++){float f=float(i),center=.12+f*.105,aa=max(fwidth(y),.002);lines+=(1.0-smoothstep(.004,.004+aa,abs(y-center)))*step(f+.5,uDensity*8.0);}
      alpha+=lines*.055*uDetail*fade;
    #endif
    if(alpha<.002)discard;`),A=[],j=[];for(let n=0;n<3;n++){let a=new e.BufferGeometry;a.setAttribute(`position`,new e.BufferAttribute(o,3).setUsage(e.DynamicDrawUsage)),a.setAttribute(`uv`,new e.BufferAttribute(s,2)),a.setAttribute(`aAge`,new e.BufferAttribute(c,1).setUsage(e.DynamicDrawUsage)),a.setIndex(l),a.setDrawRange(0,0),A.push(a);let u;r&&n===0?(u=new e.MeshPhysicalMaterial({transmission:1,roughness:0,metalness:0,side:e.DoubleSide,transparent:!0,depthTest:!0,depthWrite:!1}),u.forceSinglePass=!0,u.uniforms=E,u.vertexShader=ee,u.fragmentShader=`uniform float uDetail;varying vec2 vUv;varying float vAge;varying vec4 vScreen;
    uniform sampler2D transmissionSamplerMap;uniform vec2 transmissionSamplerSize;
    void main(){
      // Zero-thickness sheets must not sample the transmission capture while writing it.
      #ifdef FLIP_SIDED
        // uDetail is clamped to a positive value. Keep the original no-write
        // discard at runtime, but retain an output for ANGLE's validation.
        if(uDetail>=0.0)discard;
        gl_FragColor=vec4(0.0);
      #else
      float age=clamp(vAge,0.0,1.0),y=vUv.y;
      float coverage=pow(1.0-age,1.35)*smoothstep(0.0,.08,y)*(1.0-smoothstep(.96,1.0,y));
      if(coverage<.002||vScreen.w<=0.0)discard;
      vec2 screen=vScreen.xy/vScreen.w*.5+.5;
      // Screen derivatives follow the real ribbon, including arbitrary weapon rotations.
      vec2 dx=dFdx(vUv),dy=dFdy(vUv),pixel=vec2(dFdx(screen.x),dFdy(screen.y));
      float det=dx.x*dy.y-dx.y*dy.x;
      if(abs(det)<1e-10)discard;
      vec2 across=vec2(-dy.x,dx.x)/det*pixel,flow=vec2(dy.y,-dx.y)/det*pixel;
      flow=flow/max(length(flow),1e-6)*min(length(across)*.28,.09);
      float band=sin(y*66.0+sin(age*13.0)*1.25-age*19.0);
      float fine=sin(y*157.0+age*33.0)*.12;
      vec2 delta=(flow*(.35+.65*band+fine)+across*(band*.065+fine*.04))*uDetail*coverage;
      vec2 inset=.5/max(transmissionSamplerSize,vec2(1.0));
      float edge=max(0.0,min(min(screen.x-inset.x,1.0-inset.x-screen.x),min(screen.y-inset.y,1.0-inset.y-screen.y)));
      delta*=smoothstep(0.0,max(.04,length(delta)*1.35),edge);
      gl_FragColor=vec4(texture2D(transmissionSamplerMap,clamp(screen+delta,inset,1.0-inset)).rgb,coverage);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      #endif
    }`,u.onBeforeCompile=e=>{Object.assign(e.uniforms,E),e.vertexShader=u.vertexShader,e.fragmentShader=u.fragmentShader,u.userData.transmissionUniforms=e.uniforms},u.customProgramCacheKey=()=>u.vertexShader+`
`+u.fragmentShader):u=new e.ShaderMaterial({vertexShader:D,fragmentShader:r?k:O,uniforms:E,defines:{SMEAR_LAYER:n},side:e.DoubleSide,transparent:!0,depthTest:!0,depthWrite:!1,blending:n===0?e.NormalBlending:e.AdditiveBlending}),j.push(u);let d=new e.Mesh(a,u);d.name=t.id+`-`+[`blade`,`halo`,`edge`][n],d.frustumCulled=!1,d.renderOrder=n+1,i.add(d)}function M(n={}){if(!w){T={color:t.color,size:1,speed:1,detail:1,density:.5,...T,...n},delete T.quantity,delete T.spread,delete T.panelCount;for(let t of[`size`,`speed`,`detail`,`density`])T[t]=e.MathUtils.clamp(Number(T[t])||(t===`density`?.125:.25),t===`density`?.125:.25,t===`density`||t===`size`?1:2);/^#[0-9a-f]{6}$/i.test(T.color)||(T.color=t.color),E.uColor.value.set(T.color),E.uDetail.value=T.detail,E.uDensity.value=T.density,N()}}function N(){i.updateWorldMatrix(!0,!1),p.copy(i.matrixWorld).invert();for(let e=0;e<x;e++)y.copy(d[e]),v.copy(d[e]).lerp(u[e],T.size),v.applyMatrix4(p),y.applyMatrix4(p),v.toArray(o,e*6),y.toArray(o,e*6+3),c[e*2]=c[e*2+1]=Math.min(1,(S-f[e])/a);for(let e of A)e.attributes.position.needsUpdate=!0,e.attributes.aAge.needsUpdate=!0,e.setDrawRange(0,Math.max(0,x-1)*6)}function P(){for(let e=1;e<x;e++)u[e-1].copy(u[e]),d[e-1].copy(d[e]),f[e-1]=f[e];x--}function F(e){if(!(w||!Number.isFinite(e)||e<0||z.finished)){for(S+=e*T.speed;x&&S-f[0]>a;)P();if(b&&C<0){b.updateWorldMatrix(!0,!1),m.copy(g).applyMatrix4(b.matrixWorld),h.copy(_).applyMatrix4(b.matrixWorld);let t=m.distanceTo(h);Number.isFinite(t)&&t>1e-6?((e>.25||x&&Math.max(m.distanceTo(u[x-1]),h.distanceTo(d[x-1]))>t*3)&&(x=0),(!x||Math.max(m.distanceToSquared(u[x-1]),h.distanceToSquared(d[x-1]))>t*t*1e-10)&&(x===64&&P(),u[x].copy(m),d[x].copy(h),f[x]=S,x++)):x=0}N(),i.visible=!z.finished}}function I(){w||(x=0,S=0,C=-1,i.visible=!0,N())}function te(){!w&&C<0&&(C=S)}function ne(e,{base:t=[0,0,0],tip:n=[0,1,0]}={}){if(w)return z;if(!e?.isObject3D)throw TypeError(`attachWeapon requires a THREE.Object3D`);let r=(e,t)=>{if(e?.isVector3)t.copy(e);else if(Array.isArray(e)&&e.length===3)t.fromArray(e);else throw TypeError(`Blade points must be Vector3 or [x,y,z]`);if(![t.x,t.y,t.z].every(Number.isFinite))throw TypeError(`Blade points must be finite`)};if(r(t,v),r(n,y),v.distanceToSquared(y)<1e-12)throw RangeError(`Blade base and tip must differ`);return g.copy(v),_.copy(y),b=e,I(),z}function L(){b=null,te()}function R(){if(!w){w=!0,b=null,x=0,i.visible=!1,i.removeFromParent();for(let e of A)e.dispose();for(let e of j)e.dispose();i.clear()}}let z={group:i,update:F,setOptions:M,reset:I,stop:te,dispose:R,attachWeapon:ne,detachWeapon:L,hit(){},setDirection(){},setEndpoints(){},get settings(){return{...T}},get elapsed(){return S},get particleCount(){return 0},get lifecycle(){return{start:.001,end:a}},get phase(){return z.finished?`finished`:C>=0?`ending`:S<.001?`starting`:`active`},get finished(){return w||C>=0&&S-C>=.179999999}};return M(n),z}let se=Object.freeze({"sacred-relic-descent":V,"electric-magic-arrow-strike":H,"weapon-smear":U,"spatial-smear":U});function W(e,n={}){let r=se[e.id];return r?r(t,e,n):B(e,n)}return e.createEffect=W,e})({},e).createEffect,n={id:`shockwave`,lifecycle:{start:.27999999999999997,end:1.26},name:`揚塵震波`,english:`Dust-Raising Shockwave`,category:`burst`,color:`#f0cf9d`,description:`一圈塵土向外衝，捲起大片灰塵，小石頭再落回地面。`,tags:`衝擊 地面 爆炸 範圍 卡通 賽璐璐 衝擊波 Shockwave`,maxParticles:512,kind:3,variant:2,duration:2.8,burst:!0,seed:137805,renderStyle:`toon`},r={speed:1,detail:1,color:`#f0cf9d`,size:1,density:.5};function i(e={}){return t(n,{...r,...e})}export{i as default,r as defaultOptions};