import{r as e}from"./three.module-Dvf4-md2.js";var t=(function(e,t){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var n=Object.create,r=Object.defineProperty,i=Object.getOwnPropertyDescriptor,a=Object.getOwnPropertyNames,o=Object.getPrototypeOf,s=Object.prototype.hasOwnProperty,c=(e,t,n,o)=>{if(t&&typeof t==`object`||typeof t==`function`)for(var c=a(t),l=0,u=c.length,d;l<u;l++)d=c[l],!s.call(e,d)&&d!==n&&r(e,d,{get:(e=>t[e]).bind(null,d),enumerable:!(o=i(t,d))||o.enumerable});return e};t=((e,t,i)=>(i=e==null?{}:n(o(e)),c(r(i,`default`,{value:e,enumerable:!0}),e)))(t,1);let l=.14,u=.54,d=3.4,f=20261121,p=e=>Math.abs(e)<=1e7,m=e=>e?.isVector3===!0&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.z),h=e=>t.MathUtils.clamp(e,0,1);function g(e,t){if(!m(e))throw TypeError(t+` must be a finite THREE.Vector3`);return e}function _(e,t){if(g(e,t),![e.x,e.y,e.z].every(p))throw RangeError(t+` is outside the supported local scene range`);return e}function v(e,t,n,r=Number.isFinite){let i=e??t;if(!Number.isFinite(i)||!r(i))throw RangeError(`Invalid `+n);return i}function y(e,t){if(e!=null&&typeof e!=`function`)throw TypeError(t+` must be a function`);return e??null}let b=e=>e>0,x=e=>e>=0;function S(e,t){return{flightSpeed:v(e.speed,t.flightSpeed,`speed`,b),maxRange:v(e.maxRange,t.maxRange,`maxRange`,e=>b(e)&&p(e)),castDuration:v(e.castDuration,t.castDuration,`castDuration`,x),impactDuration:v(e.impactDuration,t.impactDuration,`impactDuration`,b),arcHeight:v(e.arcHeight,t.arcHeight,`arcHeight`,p),groundY:v(e.groundY,t.groundY,`groundY`,p),onImpact:e.onImpact===void 0?t.onImpact:y(e.onImpact,`onImpact`),onComplete:e.onComplete===void 0?t.onComplete:y(e.onComplete,`onComplete`)}}let C={noiseTex:null,refCount:0,getNoiseTexture(){if(this.noiseTex)return this.noiseTex;let e=new Uint8Array(65536),n=(e,t,n)=>{let r=(e%n+n)%n,i=(t%n+n)%n,a=Math.sin(r*127.1+i*311.7+n*17.3)*43758.5453123;return a-Math.floor(a)},r=(e,t,r)=>{let i=e*r,a=t*r,o=Math.floor(i),s=Math.floor(a),c=i-o,l=a-s,u=c*c*(3-2*c),d=l*l*(3-2*l),f=n(o,s,r),p=n(o+1,s,r),m=n(o,s+1,r),h=n(o+1,s+1,r);return f+(p-f)*u+(m+(h-m)*u-(f+(p-f)*u))*d},i=(e,t,n,i)=>{let a=0,o=.55,s=n,c=0;for(let n=0;n<i;n++)a+=o*r(e,t,s),c+=o,s*=2,o*=.48;return a/c};for(let t=0;t<128;t++){let n=t/128;for(let a=0;a<128;a++){let o=a/128,s=i(o,n,4,3),c=i(o+.37,n+.19,8,3),l=1-Math.abs(i(o+.61,n+.73,6,3)*2-1),u=r(o,n,16),d=(t*128+a)*4;e[d+0]=Math.round(Math.max(0,Math.min(1,s))*255),e[d+1]=Math.round(Math.max(0,Math.min(1,c))*255),e[d+2]=Math.round(Math.max(0,Math.min(1,l))*255),e[d+3]=Math.round(Math.max(0,Math.min(1,u))*255)}}let a=new t.DataTexture(e,128,128,t.RGBAFormat);return a.wrapS=t.RepeatWrapping,a.wrapT=t.RepeatWrapping,a.magFilter=t.LinearFilter,a.minFilter=t.LinearFilter,a.generateMipmaps=!1,a.needsUpdate=!0,this.noiseTex=a,a},release(){this.refCount=Math.max(0,this.refCount-1),this.refCount===0&&this.noiseTex&&(this.noiseTex.dispose(),this.noiseTex=null)}};var w=class{constructor(e={}){if(this.quality=e.quality??`high`,![`high`,`medium`,`low`].includes(this.quality))throw RangeError(`Invalid quality`);this._qScale=this.quality===`low`?.55:this.quality===`medium`?.78:1,this.duration=v(e.duration,d,`duration`,e=>b(e)&&e<=86400),this._seed=v(e.seed,f,`seed`,Number.isSafeInteger),this._launchDefaults=S(e,{flightSpeed:10.5,maxRange:8.6,castDuration:.42,impactDuration:1.55,arcHeight:0,groundY:0,onImpact:null,onComplete:null}),Object.assign(this,this._launchDefaults),this.startPos=e.startPos===void 0?new t.Vector3(0,1.45,4.3):_(e.startPos,`startPos`).clone(),this.direction=e.direction===void 0?new t.Vector3(0,0,-1):g(e.direction,`direction`).clone(),this._normalizeDirection(this.direction),this.impactPos=e.impactPos===void 0?this.startPos.clone().addScaledVector(this.direction,this.maxRange):g(e.impactPos,`impactPos`).clone(),this._flightTotal=this._flightDuration(this.startPos,this.impactPos,this.flightSpeed),this.group=new t.Group,this.group.name=`HyperdimensionalSoulFireballVFX`,this.state=`idle`,this._stateTime=0,this._generation=0,this.time=0,this.progress=0,this.layerMap=Object.create(null),this._userLayerEnabled=Object.create(null),this._geometries=[],this._materials=[],this._v1=new t.Vector3,this._v2=new t.Vector3,this._v3=new t.Vector3,this._v4=new t.Vector3,this._v5=new t.Vector3,this._right=new t.Vector3,this._binorm=new t.Vector3,this._tang=new t.Vector3,this._toCam=new t.Vector3,this._side=new t.Vector3,this._prevSide=new t.Vector3,this._orbPos=new t.Vector3,this._lastCamPos=new t.Vector3(0,3,9.6),this._arcStart=new t.Vector3,this._arcEnd=new t.Vector3,this._q1=new t.Quaternion,this._m1=new t.Matrix4,this._up=new t.Vector3(0,1,0),this._fwd=new t.Vector3(1,0,0),this._ptsPool=Array.from({length:36},()=>new t.Vector3),this._noiseTex=C.getNoiseTexture(),C.refCount++;try{this._buildAllLayers(),this.setProgress(0)}catch(e){throw this.dispose(),e}}_rand(e){let t=Math.sin(e*127.1+this._seed*.0013)*43758.5453123;return t-Math.floor(t)}_smoothstep(e,t,n){let r=Math.max(0,Math.min(1,(n-e)/(t-e)));return r*r*(3-2*r)}_registerGeo(e){return this._geometries.push(e),e}_registerMat(e){return e.uniforms&&!e.uniforms.uNoiseTex&&(e.uniforms.uNoiseTex={value:this._noiseTex}),this._materials.push(e),e}_registerLayer(e,t,n,r=!0){return n.name=e,r&&this.group.add(n),this.layerMap[e]={id:e,label:t,obj:n},this._userLayerEnabled[e]=!0,n}_applyPhaseVisibility(e,t){let n=this.layerMap[e];n&&(n.obj.visible=this._userLayerEnabled[e]&&t)}_noiseGLSL(){return`
      uniform sampler2D uNoiseTex;
      float vnoise(vec3 p) {
        vec2 uv = p.xy * 0.14 + vec2(p.z * 0.23, -p.z * 0.17);
        return texture2D(uNoiseTex, uv).g;
      }
      float fbm(vec3 p) {
        vec2 uv1 = p.xy * 0.12 + vec2(p.z * 0.19, -p.z * 0.13);
        vec2 uv2 = p.yz * 0.17 + vec2(-p.x * 0.15, p.x * 0.11);
        vec4 t1 = texture2D(uNoiseTex, uv1);
        vec4 t2 = texture2D(uNoiseTex, uv2);
        return t1.r * 0.58 + t2.g * 0.30 + t1.a * 0.12;
      }
    `}_buildSafeBasis(e,t,n){Math.abs(e.y)>.98?t.set(1,0,0).crossVectors(e,this._fwd).normalize():t.crossVectors(e,this._up).normalize(),n.crossVectors(t,e).normalize()}_setQuatFromForward(e,t){return this._fwd.dot(e)<-.9995?t.setFromAxisAngle(this._up,Math.PI):t.setFromUnitVectors(this._fwd,e),t}_evalFlightPos(e,t){return t.lerpVectors(this.startPos,this.impactPos,e),this.arcHeight!==0&&(t.y+=Math.sin(e*Math.PI)*this.arcHeight),t}_evalFlightTangent(e,t){if(this.arcHeight===0)return t.copy(this.impactPos).sub(this.startPos),t.lengthSq()<1e-6?t.copy(this.direction):t.normalize(),t;let n=.004,r=Math.max(0,e-n),i=Math.min(1,e+n);return this._evalFlightPos(r,this._v3),this._evalFlightPos(i,this._v4),t.copy(this._v4).sub(this._v3).normalize(),t}_createFlameFinsGeometry(e,n){let r=new Float32Array(1575),i=new Float32Array(1575),a=new Float32Array(1050),o=new Float32Array(525),s=[];for(let t=0;t<7;t++){let c=t*75,l=t/7*Math.PI*2+t%2*.28,u=n*(.78+t%3*.16),d=e*(.52+t%2*.28),f=(t%2==0?1:-1)*(.65+t%3*.22),p=.26-t%3*.1,m=t*1.73+.5;for(let t=0;t<=14;t++){let n=t/14,h=p-n*u,g=Math.sin(n*Math.PI*.85)*d,_=e*(.46-n*.16)+g,v=l+n*f,y=(.36+.18*Math.sin(n*Math.PI))*(1-n)**.65;for(let e=0;e<=4;e++){let l=e/4,u=(l-.5)*2,d=v+u*y,f=_*(1-.14*u*u),p=Math.cos(d)*f,g=Math.sin(d)*f,b=c+t*5+e;if(r[b*3+0]=h,r[b*3+1]=p,r[b*3+2]=g,i[b*3+0]=.2,i[b*3+1]=Math.cos(d),i[b*3+2]=Math.sin(d),a[b*2+0]=n,a[b*2+1]=l,o[b]=m,t<14&&e<4){let e=b,t=b+1,n=b+5,r=n+1;s.push(e,n,t,t,n,r)}}}}let c=new t.BufferGeometry,l=new t.BufferAttribute(r,3);return l.setUsage(t.DynamicDrawUsage),c.setAttribute(`position`,l),c.setAttribute(`normal`,new t.BufferAttribute(i,3)),c.setAttribute(`uv`,new t.BufferAttribute(a,2)),c.setAttribute(`aFinSeed`,new t.BufferAttribute(o,1)),c.setIndex(s),c.computeVertexNormals(),this._registerGeo(c)}_createOpenFlameSleeveGeometry(e,n,r,i,a){let o=new Float32Array((i+1)*(a+1)*3),s=new Float32Array((i+1)*(a+1)*2),c=[];for(let t=0;t<=i;t++){let l=t/i,u=.18-l*r,d=e*(1-l)+n*l+Math.sin(l*Math.PI)*.16;for(let e=0;e<=a;e++){let n=e/a,r=n*Math.PI*2,f=t*(a+1)+e;if(o[f*3+0]=u,o[f*3+1]=Math.cos(r)*d,o[f*3+2]=Math.sin(r)*d,s[f*2+0]=l,s[f*2+1]=n,t<i&&e<a){let e=f,t=f+1,n=f+(a+1),r=n+1;c.push(e,n,t,t,n,r)}}}let l=new t.BufferGeometry;return l.setAttribute(`position`,new t.BufferAttribute(o,3)),l.setAttribute(`uv`,new t.BufferAttribute(s,2)),l.setIndex(c),l.computeVertexNormals(),this._registerGeo(l)}_createTeardropGeometry(e,n,r,i){let a=new t.SphereGeometry(e,r,i),o=a.attributes.position;for(let t=0;t<o.count;t++){let r=o.getX(t),i=o.getY(t),a=o.getZ(t),s=r/e;if(s<0){let e=-s;r=-e*n;let t=(1-e*.94)**.86;i*=t,a*=t}else{r=s**.86*e*1.28;let t=1-.18*s*s;i*=t,a*=t}o.setXYZ(t,r,i,a)}return a.computeVertexNormals(),this._registerGeo(a)}_createMultiRibbonGeometry(e,n){let r=(n+1)*2,i=e*r,a=new Float32Array(i*3),o=new Float32Array(i*2),s=new Float32Array(i),c=[];for(let t=0;t<e;t++){let e=t*r,i=t*1.37+.25;for(let t=0;t<=n;t++){let r=t/n,a=e+t*2;if(o[a*2+0]=r,o[a*2+1]=0,o[(a+1)*2+0]=r,o[(a+1)*2+1]=1,s[a]=i,s[a+1]=i,t<n){let e=a,t=a+1,n=a+2,r=a+3;c.push(e,n,t,t,n,r)}}}let l=new t.BufferGeometry;return l.setAttribute(`position`,new t.BufferAttribute(a,3)),l.setAttribute(`uv`,new t.BufferAttribute(o,2)),l.setAttribute(`aRibbonSeed`,new t.BufferAttribute(s,1)),l.setIndex(c),this._registerGeo(l)}_createStreakGeometry(){let e=new t.BufferGeometry,n=new Float32Array([.55,0,0,.12,.022,0,-.65,0,0,.12,-.022,0,.55,0,0,.12,0,.022,-.65,0,0,.12,0,-.022]),r=[0,1,2,0,2,3,4,5,6,4,6,7],i=new Float32Array([1,.5,.65,1,0,.5,.65,0,1,.5,.65,1,0,.5,.65,0]);return e.setAttribute(`position`,new t.BufferAttribute(n,3)),e.setAttribute(`uv`,new t.BufferAttribute(i,2)),e.setIndex(r),this._registerGeo(e)}_buildAllLayers(){let e=this._noiseGLSL();this._projPivot=new t.Group,this.group.add(this._projPivot);let n=this._createTeardropGeometry(.34,1.58,24,16),r=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uIntensity:{value:1}},vertexShader:`
        uniform float uTime;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        varying vec3 vLocalPos;
        varying float vWave;
        ${e}
        void main() {
          float ang = atan(position.z, position.y);
          float tailFactor = (1.0 - smoothstep(-1.45, 0.36, position.x));
          vec3 dir = normalize(position + vec3(0.0001));

          // Smooth organic asymmetric flame sculpting (breaks egg symmetry without chunky clay lumps!)
          float n1 = fbm(dir * 2.5 + vec3(-uTime * 5.8, uTime * 1.4, -uTime * 1.1));
          float ridge = sin(ang * 3.0 + position.x * 2.8 - uTime * 7.6) * 0.52
                      + sin(ang * 5.0 - position.x * 3.6 - uTime * 9.2) * 0.28;
          vWave = clamp(0.5 + ridge * 0.42 + (n1 - 0.5) * 0.85, 0.0, 1.0);

          float amp = 0.065 + tailFactor * 0.22;
          vec3 p = position + normal * ((n1 - 0.46) * 1.15 + ridge * 0.34) * amp;
          // Graceful S-curve flame whip along the body
          p.y += sin(position.x * 2.6 - uTime * 8.4) * (0.04 + 0.16 * tailFactor);
          p.z += cos(position.x * 2.3 - uTime * 7.2) * (0.03 + 0.12 * tailFactor);

          vLocalPos = p;
          vec4 wp = modelMatrix * vec4(p, 1.0);
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uIntensity;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        varying vec3 vLocalPos;
        varying float vWave;
        ${e}
        void main() {
          // Domain-warped flowing flame heat (zero hard discard confetti, smooth creamy-white to orange-red!)
          float n1 = fbm(vLocalPos * 2.8 + vec3(-uTime * 8.2, 0.5, -0.3));
          float n2 = fbm(vLocalPos * 5.2 + vec3(-uTime * 11.0, n1 * 1.2, 1.4));
          float ndv = clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0);
          float headFactor = smoothstep(-1.35, 0.30, vLocalPos.x);

          // Softly taper only the very back 22% into flame tips
          float tailAlpha = smoothstep(-1.55, -0.85, vLocalPos.x + (n1 - 0.48) * 0.55);
          if (tailAlpha < 0.02) discard;

          float heat = clamp(headFactor * 0.64 + ndv * 0.34 + vWave * 0.20 + (n2 - 0.46) * 0.28, 0.0, 1.0);

          vec3 colMagenta = vec3(0.76, 0.05, 0.34);
          vec3 colCrimson = vec3(1.06, 0.10, 0.24);
          vec3 colOrange  = vec3(1.28, 0.44, 0.06);
          vec3 colGold    = vec3(1.18, 0.80, 0.18);
          vec3 colCream   = vec3(1.24, 1.14, 0.84);

          float texHeat = clamp(heat - (1.0 - n2) * 0.22, 0.0, 1.0);
          vec3 col = mix(colMagenta, colCrimson, smoothstep(0.08, 0.28, texHeat));
          col = mix(col, colOrange, smoothstep(0.28, 0.52, texHeat));
          col = mix(col, colGold, smoothstep(0.52, 0.78, texHeat));
          col = mix(col, colCream, smoothstep(0.82, 0.98, texHeat));

          gl_FragColor = vec4(col * uIntensity, tailAlpha);
        }
      `,transparent:!0,depthWrite:!0,side:t.FrontSide}));this._l01Core=new t.Mesh(n,r),this._l01Core.renderOrder=5,this._projPivot.add(this._l01Core),this._registerLayer(`L01_IncandescentCore`,`01 流體不規則熾熱火核`,this._l01Core,!1);let i=this._createFlameFinsGeometry(.42,2.35),a=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uAlpha:{value:1}},vertexShader:`
        attribute float aFinSeed;
        uniform float uTime;
        varying vec2 vUv;
        varying float vSeed;
        ${e}
        void main() {
          vUv = uv;
          vSeed = aFinSeed;
          float u = uv.x;
          vec3 p = position;
          // Graceful high-speed flutter rippling from root (u=0) to tip (u=1)
          float flutter = sin(u * 6.5 - uTime * 11.5 + aFinSeed) * 0.14 * u;
          float sway = cos(u * 4.2 - uTime * 8.2 + aFinSeed * 1.4) * 0.12 * u;
          p.y += flutter + sin(u * 3.0 - uTime * 7.5) * 0.14 * u * u;
          p.z += sway;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uAlpha;
        varying vec2 vUv;
        varying float vSeed;
        ${e}
        void main() {
          // vUv.x: 0 (front) -> 1 (tip); vUv.y: 0..1 across fin width
          float across = abs(vUv.y - 0.5) * 2.0;
          float n = fbm(vec3(vUv.x * 4.6 - uTime * 7.8, vUv.y * 2.2, vSeed));

          // Smooth painterly flame silhouette with monotonic axial taper (ZERO floating islands!)
          float widthProfile = (1.0 - pow(vUv.x, 1.35)) * (0.78 + 0.42 * n);
          float edgeAlpha = (1.0 - smoothstep(widthProfile - 0.22, widthProfile + 0.18, across));
          float rootFade = smoothstep(0.0, 0.44, vUv.x);
          float tipFade = (1.0 - smoothstep(0.24, 1.0, vUv.x));
          float alpha = edgeAlpha * rootFade * tipFade * 0.84 * uAlpha;
          if (alpha < 0.02) discard;

          vec3 colDeepMag = vec3(0.46, 0.02, 0.34);
          vec3 colCrimson = vec3(1.04, 0.08, 0.30);
          vec3 colOrange  = vec3(1.26, 0.44, 0.06);
          vec3 colGold    = vec3(1.44, 0.98, 0.26);

          float heat = clamp((1.0 - vUv.x * 1.15) * (1.0 - across * 0.42) + (n - 0.45) * 0.35, 0.0, 1.0);
          vec3 col = mix(colDeepMag, colCrimson, smoothstep(0.10, 0.32, heat));
          col = mix(col, colOrange, smoothstep(0.32, 0.58, heat));
          col = mix(col, colGold, smoothstep(0.60, 0.84, heat));

          gl_FragColor = vec4(col, alpha);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide}));this._l02Mantle=new t.Mesh(i,a),this._l02Mantle.renderOrder=6,this._projPivot.add(this._l02Mantle),this._registerLayer(`L02_FlameMantleShell`,`02 流體雕塑火舌鰭片`,this._l02Mantle,!1);let o=this._createOpenFlameSleeveGeometry(.46,.1,3.05,20,16),s=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uAlpha:{value:1}},vertexShader:`
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        ${e}
        void main() {
          vUv = uv;
          float u = uv.x;
          float n = fbm(vec3(u * 3.8 - uTime * 6.0, uv.y * 4.0, 2.1));
          vec3 p = position + normal * (n - 0.45) * (0.06 + u * 0.42);
          // Matching S-curve whip flowing into L06 void smoke ribbons
          p.y += sin(u * 4.5 - uTime * 7.8) * 0.24 * u;
          p.z += cos(u * 3.8 - uTime * 6.8) * 0.18 * u;
          vec4 wp = modelMatrix * vec4(p, 1.0);
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uAlpha;
        varying vec2 vUv;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        ${e}
        void main() {
          float u = vUv.x;
          float ang = vUv.y * 6.28318;
          // Seamless cylindrical noise via cos/sin(ang)
          float n1 = fbm(vec3(u * 5.2 - uTime * 6.8, cos(ang) * 1.6, sin(ang) * 1.6));
          float n2 = vnoise(vec3(u * 12.0 - uTime * 10.5, cos(ang) * 3.2, sin(ang) * 3.2));
          float wisp = n1 * 0.72 + n2 * 0.28;

          float ndv = clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0);
          float rim = pow(1.0 - ndv, 0.85);

          // Smooth anti-aliased onset behind nose (never muddies bright head!) + smooth axial dissipation
          float frontFade = smoothstep(0.20, 0.48, u + (wisp - 0.5) * 0.14);
          float rearFade = (1.0 - smoothstep(0.35, 1.0, u));
          float erode = smoothstep(0.32 + u * 0.26, 0.52 + u * 0.22, wisp);
          float alpha = frontFade * rearFade * erode * (0.55 + 0.45 * rim) * 0.90 * uAlpha;
          if (alpha < 0.02) discard;

          vec3 colVoid = vec3(0.06, 0.01, 0.11);
          vec3 colPlum = vec3(0.28, 0.02, 0.28);
          vec3 colMag  = vec3(0.96, 0.08, 0.40);

          vec3 col = mix(colVoid, colPlum, smoothstep(0.28, 0.62, wisp));
          float vein = smoothstep(0.50, 0.78, wisp) * (1.0 - smoothstep(0.20, 0.85, u));
          col = mix(col, colMag, clamp(vein * 1.25 + rim * 0.35 * (1.0 - u), 0.0, 1.0));
          gl_FragColor = vec4(col, alpha);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide}));this._l03Sheath=new t.Mesh(o,s),this._l03Sheath.renderOrder=7,this._projPivot.add(this._l03Sheath),this._registerLayer(`L03_DarkVoidFlameSheath`,`03 暗紫虛空流體焰袍`,this._l03Sheath,!1);let c=this._registerGeo(new t.PlaneGeometry(3.6,3.6)),l=this._registerMat(new t.ShaderMaterial({uniforms:{uColorInner:{value:new t.Color(16751413)},uColorOuter:{value:new t.Color(14030924)},uOpacity:{value:.48}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 mvCenter = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          vec3 scale = vec3(
            length(vec3(modelMatrix[0][0], modelMatrix[0][1], modelMatrix[0][2])),
            length(vec3(modelMatrix[1][0], modelMatrix[1][1], modelMatrix[1][2])),
            1.0
          );
          mvCenter.xy += position.xy * scale.xy;
          gl_Position = projectionMatrix * mvCenter;
        }
      `,fragmentShader:`
        uniform vec3 uColorInner;
        uniform vec3 uColorOuter;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float d = length(vUv - 0.5) * 2.0;
          float glow = exp(-d * d * 4.0) * (1.0 - smoothstep(0.12, 1.0, d));
          vec3 col = mix(uColorOuter, uColorInner, exp(-d * d * 5.8));
          gl_FragColor = vec4(col, glow * uOpacity);
        }
      `,transparent:!0,depthWrite:!1,blending:t.AdditiveBlending}));this._l04Halo=new t.Mesh(c,l),this._l04Halo.renderOrder=14,this._registerLayer(`L04_Level2OuterGlowHalo`,`04 第2級柔光外散暈層`,this._l04Halo),this._l05Group=new t.Group;let u=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uOpacity:{value:1}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        ${e}
        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;
          float ang = atan(p.y, p.x);

          // Domain-warped arcane vortex mist + organic torn energy arcs (no mechanical zebra rings!)
          float swirlAng = ang + (1.0 - r) * 3.2 - uTime * 2.6;
          vec2 swirlP = vec2(cos(swirlAng), sin(swirlAng)) * r;
          float n = fbm(vec3(swirlP * 3.4, uTime * 0.9));

          float outerRing = exp(-pow((r - 0.78 + (n - 0.5) * 0.12) * 14.0, 2.0));
          float innerRing = exp(-pow((r - 0.46 + (n - 0.5) * 0.09) * 18.0, 2.0));
          float arcBreak = smoothstep(0.28, 0.72, n + 0.25 * sin(ang * 3.0 - uTime * 3.2));
          float vortexMist = (1.0 - smoothstep(0.15, 0.92, r)) * smoothstep(0.32, 0.78, n) * 0.58;
          float runeSparks = smoothstep(0.76, 0.94, n) * outerRing * 1.4;

          float alpha = clamp((outerRing * arcBreak * 0.95 + innerRing * 0.75 + vortexMist + runeSparks), 0.0, 1.0) * uOpacity;
          if (alpha < 0.03) discard;

          vec3 colVoid    = vec3(0.22, 0.04, 0.38);
          vec3 colMagenta = vec3(0.98, 0.14, 0.52);
          vec3 colGold    = vec3(1.25, 0.88, 0.34);

          vec3 col = mix(colVoid, colMagenta, clamp(outerRing + innerRing * 0.8, 0.0, 1.0));
          col = mix(col, colGold, clamp(innerRing * 0.55 + runeSparks * 0.8, 0.0, 1.0));
          gl_FragColor = vec4(col, alpha);
        }
      `,transparent:!0,depthWrite:!1,blending:t.AdditiveBlending,side:t.DoubleSide})),d=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uOpacity:{value:1}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;
          float ang = atan(p.y, p.x);
          // Crisp 6-pointed hyperdimensional arcane star + fine inscribed geometric circles
          float hex1 = abs(cos(ang * 3.0) * r - 0.36);
          float hex2 = abs(sin(ang * 3.0) * r - 0.36);
          float starLine = (exp(-hex1 * 28.0) + exp(-hex2 * 28.0)) * (1.0 - smoothstep(0.72, 0.86, r));
          float fineRing = exp(-abs(r - 0.76) * 42.0) + exp(-abs(r - 0.54) * 38.0) * 0.7;
          float ticks = smoothstep(0.82, 0.98, abs(sin(ang * 12.0 + uTime * 2.0))) * exp(-abs(r - 0.65) * 26.0);
          float alpha = clamp(starLine * 0.85 + fineRing * 0.75 + ticks * 0.9, 0.0, 1.0) * uOpacity;
          if (alpha < 0.03) discard;
          vec3 colViolet = vec3(0.72, 0.22, 1.0);
          vec3 colGold   = vec3(1.38, 1.02, 0.36);
          vec3 col = mix(colViolet, colGold, clamp(starLine * 0.7 + ticks, 0.0, 1.0));
          gl_FragColor = vec4(col, alpha);
        }
      `,transparent:!0,depthWrite:!1,blending:t.AdditiveBlending,side:t.DoubleSide})),f=this._registerGeo(new t.PlaneGeometry(2.85,2.85)),p=this._registerGeo(new t.PlaneGeometry(2.05,2.05)),m=this._registerGeo(new t.PlaneGeometry(2.55,2.55));this._riftRingA=new t.Mesh(f,u),this._riftRingB=new t.Mesh(p,u),this._riftRingC=new t.Mesh(m,d),this._riftRingB.position.z=.22,this._riftRingB.rotation.x=.24,this._riftRingC.position.z=-.14,this._riftRingC.rotation.y=.18,this._l05Group.add(this._riftRingA,this._riftRingB,this._riftRingC),this._l05Group.renderOrder=10,this._registerLayer(`L05_DimensionalRiftRings`,`05 超維空間裂隙法陣`,this._l05Group);let h=this._createMultiRibbonGeometry(6,30),g=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uOpacity:{value:1}},vertexShader:`
        attribute float aRibbonSeed;
        varying vec2 vUv;
        varying float vSeed;
        void main() {
          vUv = uv;
          vSeed = aRibbonSeed;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        varying float vSeed;
        ${e}
        void main() {
          float across = abs(vUv.y - 0.5) * 2.0;
          float n1 = fbm(vec3(vUv.x * 7.2 - uTime * 4.5, vUv.y * 3.2, vSeed));
          float n2 = vnoise(vec3(vUv.x * 16.0 - uTime * 8.0, vUv.y * 6.5, vSeed + 4.1));
          float tear = n1 * 0.72 + n2 * 0.28;

          float widthMask = (1.0 - smoothstep(0.20, 0.98, across + (tear - 0.45) * 0.92));
          float tailFade = (1.0 - smoothstep(0.16, 1.0, vUv.x)) * smoothstep(0.0, 0.05, vUv.x);
          float erode = smoothstep(0.24, 0.54, (1.0 - vUv.x * 0.75) + (tear - 0.46) * 0.82);
          float alpha = widthMask * tailFade * erode * 0.96 * uOpacity;
          if (alpha < 0.04) discard;

          vec3 colVoid    = vec3(0.06, 0.01, 0.10);
          vec3 colPurple  = vec3(0.24, 0.02, 0.25);
          vec3 colCrimson = vec3(0.84, 0.05, 0.32);
          vec3 colHot     = vec3(1.10, 0.44, 0.10);

          float heat = clamp((1.0 - vUv.x * 1.45) * (1.0 - across * 0.55) + (tear - 0.48) * 0.45, 0.0, 1.0);
          vec3 col = mix(colVoid, colPurple, smoothstep(0.08, 0.34, heat));
          col = mix(col, colCrimson, smoothstep(0.34, 0.62, heat));
          col = mix(col, colHot, smoothstep(0.68, 0.90, heat));
          // Shimmering molten soul-fire vein inside the dark void smoke ribbon
          float sparkVein = smoothstep(0.74, 0.92, n2) * (1.0 - smoothstep(0.08, 0.75, vUv.x)) * (1.0 - across);
          col += vec3(1.15, 0.55, 0.16) * sparkVein * 0.65;
          gl_FragColor = vec4(col, alpha);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide}));this._l06VoidRibbons=new t.Mesh(h,g),this._l06VoidRibbons.frustumCulled=!1,this._l06VoidRibbons.renderOrder=4,this._voidRibbonConfigs=[{phase:.3,radius:.12,width:.66,lengthU:.96,lift:.88,sAmp:.42},{phase:1.5,radius:.24,width:.38,lengthU:.88,lift:.58,sAmp:.34},{phase:2.8,radius:.2,width:.3,lengthU:.82,lift:.72,sAmp:.38},{phase:4.1,radius:.32,width:.24,lengthU:.74,lift:.32,sAmp:.28},{phase:5.2,radius:.16,width:.46,lengthU:.92,lift:1.05,sAmp:.46},{phase:6,radius:.28,width:.22,lengthU:.66,lift:.18,sAmp:.22}],this._voidRibbonSegs=30,this._registerLayer(`L06_VoidSmokeRibbons`,`06 虛空暗紫煙焰絲帶`,this._l06VoidRibbons);let _=this._registerGeo(new t.SphereGeometry(.24,18,14)),v=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:`
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        varying vec3 vLocalPos;
        void main() {
          vLocalPos = position;
          #ifdef USE_INSTANCING
            vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
            vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
          #else
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vNormalW = normalize(mat3(modelMatrix) * normal);
          #endif
          vViewDir = normalize(cameraPosition - wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec3 vNormalW;
        varying vec3 vViewDir;
        varying vec3 vLocalPos;
        ${e}
        void main() {
          float ndv = clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0);
          // Organic swirling fiery soul-ember core (matches reference orbs, zero stripes!)
          float n1 = fbm(vLocalPos * 7.5 + vec3(uTime * 3.2, -uTime * 2.4, 0.0));
          float n2 = fbm(vLocalPos * 12.0 + vec3(-uTime * 4.5, n1 * 1.4, uTime * 2.1));
          float swirlRim = smoothstep(0.58, 0.88, n2) * (1.0 - ndv) * 0.42;
          float heat = clamp(ndv * 0.80 + (n1 - 0.44) * 0.40 + swirlRim, 0.0, 1.0);

          vec3 colVoid = vec3(0.18, 0.02, 0.22);
          vec3 colMag  = vec3(0.92, 0.08, 0.34);
          vec3 colOrg  = vec3(1.14, 0.52, 0.10);
          vec3 colCore = vec3(1.40, 1.26, 0.74);

          vec3 col = mix(colVoid, colMag, smoothstep(0.10, 0.34, heat));
          col = mix(col, colOrg, smoothstep(0.34, 0.64, heat));
          col = mix(col, colCore, smoothstep(0.68, 0.88, heat));
          gl_FragColor = vec4(col, 1.0);
        }
      `,transparent:!1,depthWrite:!0,side:t.FrontSide}));this._l07Orbs=new t.InstancedMesh(_,v,3),this._l07Orbs.frustumCulled=!1,this._l07Orbs.renderOrder=8,this._soulOrbConfigs=[{baseAngle:.45,flightRadius:.72,impactRadius:1.98,scale:.96,impactScale:1.12,tilt:.85},{baseAngle:2.65,flightRadius:.88,impactRadius:2.22,scale:.78,impactScale:.98,tilt:-.76},{baseAngle:4.7,flightRadius:.64,impactRadius:1.56,scale:.64,impactScale:.78,tilt:.52}],this._registerLayer(`L07_OrbitingSoulOrbs`,`07 環繞靈魂火珠`,this._l07Orbs);let y=this._createMultiRibbonGeometry(3,28),b=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uOpacity:{value:1}},vertexShader:`
        attribute float aRibbonSeed;
        varying vec2 vUv;
        varying float vSeed;
        void main() {
          vUv = uv;
          vSeed = aRibbonSeed;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        varying float vSeed;
        ${e}
        void main() {
          float across = abs(vUv.y - 0.5) * 2.0;
          float n = fbm(vec3(vUv.x * 5.5 - uTime * 4.0, vUv.y * 2.4, vSeed + 2.0));
          float mask = (1.0 - smoothstep(0.14, 1.0, across + (n - 0.48) * 0.50));
          float fade = (1.0 - smoothstep(0.20, 0.96, vUv.x)) * smoothstep(0.0, 0.04, vUv.x);
          float alpha = mask * fade * 0.84 * uOpacity;
          if (alpha < 0.02) discard;
          vec3 colDark = vec3(0.20, 0.03, 0.24);
          vec3 colMag  = vec3(0.86, 0.10, 0.36);
          vec3 colHot  = vec3(1.12, 0.54, 0.16);
          vec3 col = mix(colDark, colMag, smoothstep(0.10, 0.62, 1.0 - vUv.x));
          col = mix(col, colHot, smoothstep(0.76, 0.98, 1.0 - vUv.x) * (1.0 - across));
          gl_FragColor = vec4(col, alpha);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide}));this._l08OrbTrails=new t.Mesh(y,b),this._l08OrbTrails.frustumCulled=!1,this._l08OrbTrails.renderOrder=6,this._orbTrailSegs=28,this._registerLayer(`L08_SoulOrbTrails`,`08 靈魂火珠流光拖尾`,this._l08OrbTrails);let x=Math.max(12,Math.round(28*this._qScale)),S=this._createTeardropGeometry(.062,.42,8,6),C=this._registerMat(new t.ShaderMaterial({uniforms:{uOpacity:{value:1}},vertexShader:`
        attribute float aHeat;
        varying float vHeat;
        varying vec3 vLocalPos;
        void main() {
          vHeat = aHeat;
          vLocalPos = position;
          #ifdef USE_INSTANCING
            vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          #else
            vec4 wp = modelMatrix * vec4(position, 1.0);
          #endif
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,fragmentShader:`
        uniform float uOpacity;
        varying float vHeat;
        varying vec3 vLocalPos;
        void main() {
          float tip = smoothstep(-0.40, 0.08, vLocalPos.x);
          vec3 colDark = vec3(0.82, 0.07, 0.28);
          vec3 colRed  = vec3(0.98, 0.10, 0.30);
          vec3 colGold = vec3(1.22, 0.80, 0.20);
          vec3 col = mix(colDark, colRed, smoothstep(0.05, 0.52, tip * vHeat));
          col = mix(col, colGold, smoothstep(0.56, 0.90, tip * vHeat));
          gl_FragColor = vec4(col, clamp(vHeat * 1.15, 0.0, 1.0) * uOpacity);
        }
      `,transparent:!0,depthWrite:!1,side:t.FrontSide}));this._lickHeatAttr=new t.InstancedBufferAttribute(new Float32Array(x),1),S.setAttribute(`aHeat`,this._lickHeatAttr),this._l09Licks=new t.InstancedMesh(S,C,x),this._l09Licks.frustumCulled=!1,this._l09Licks.renderOrder=8,this._lickSeeds=Array.from({length:x},(e,t)=>({offset:this._rand(t*7+1),angle:this._rand(t*7+2)*Math.PI*2,rad:.3+this._rand(t*7+3)*.44,scale:.68+this._rand(t*7+5)*.85})),this._registerLayer(`L09_SoulLickFlames`,`09 剝離火舌碎片`,this._l09Licks);let w=this._registerGeo(new t.PlaneGeometry(2.8,2.8)),T=this._registerMat(new t.ShaderMaterial({uniforms:{uAge:{value:0},uOpacity:{value:1}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec4 mvCenter = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          vec3 scale = vec3(
            length(vec3(modelMatrix[0][0], modelMatrix[0][1], modelMatrix[0][2])),
            length(vec3(modelMatrix[1][0], modelMatrix[1][1], modelMatrix[1][2])),
            1.0
          );
          mvCenter.xy += position.xy * scale.xy;
          gl_Position = projectionMatrix * mvCenter;
        }
      `,fragmentShader:`
        uniform float uAge;
        uniform float uOpacity;
        varying vec2 vUv;
        ${e}
        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;

          // Organic jagged 4-branch asymmetric fissure crack matching reference right-side core!
          float n1 = fbm(vec3(p * 3.8, uAge * 1.8));
          vec2 q = p + (n1 - 0.5) * 0.24;
          float a = atan(q.y, q.x);
          // 4 irregular angled crack arms (not evenly spaced snowflake!)
          // Soft organic molten fire-crevice arms + warm inner core glow (no sharp X sticker!)
          float c1 = exp(-pow(abs(sin((a - 0.42) * 0.5)) * 5.2, 1.4)) * (1.0 - smoothstep(0.12, 0.88, r));
          float c2 = exp(-pow(abs(sin((a - 2.35) * 0.5)) * 5.0, 1.4)) * (1.0 - smoothstep(0.12, 0.80, r));
          float c3 = exp(-pow(abs(sin((a + 1.28) * 0.5)) * 5.8, 1.4)) * (1.0 - smoothstep(0.12, 0.72, r));
          float cracks = clamp((c1 + c2 + c3) * mix(0.85, 0.58, uAge), 0.0, 1.0);
          float core = exp(-r * r * mix(8.5, 16.0, uAge));
          float warmAura = exp(-r * r * 3.8) * 0.45;
          float val = clamp(cracks * 0.76 + core * 0.88 + warmAura, 0.0, 1.0);
          if (val < 0.04) discard;

          vec3 colOrange = vec3(1.22, 0.48, 0.06);
          vec3 colGold   = vec3(1.38, 1.04, 0.30);
          vec3 colWhite  = vec3(1.52, 1.48, 1.24);

          vec3 col = mix(colOrange, colGold, smoothstep(0.14, 0.52, val));
          col = mix(col, colWhite, smoothstep(0.56, 0.86, val));

          gl_FragColor = vec4(col, val * uOpacity);
        }
      `,transparent:!0,depthWrite:!1,depthTest:!1,blending:t.AdditiveBlending}));this._l10Starburst=new t.Mesh(w,T),this._l10Starburst.renderOrder=15,this._registerLayer(`L10_ImpactStarburstCore`,`10 命中不對稱星裂核心`,this._l10Starburst);let E=Math.max(14,Math.round(22*this._qScale)),D=this._registerGeo(new t.SphereGeometry(.58,16,10)),O=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uImpactPos:{value:this.impactPos.clone()}},vertexShader:`
        varying vec3 vToCoreLocal;
        varying vec3 vNormalLocal;
        uniform vec3 uImpactPos;
        attribute vec4 aCloudData; // x: seed, y: localAge, z: heatBias, w: unused
        uniform float uTime;
        varying vec3 vViewNormal;
        varying vec3 vViewPosition;
        varying vec3 vLocalPos;
        varying vec4 vData;
        ${e}
        void main() {
          vData = aCloudData;
          vec3 dir = normalize(position);
          float n = fbm(dir * 2.5 + vec3(aCloudData.x * 10.0, -uTime * 1.9, aCloudData.x * 5.0));
          vec3 p = position + normal * (n - 0.45) * 0.16;
          vLocalPos = p;
          vec4 local = vec4(p, 1.0);
          vec3 localNormal = normal;
          #ifdef USE_INSTANCING
            local = instanceMatrix * local;
            mat3 m = mat3(instanceMatrix);
            // Instance transforms combine rotation and non-uniform scale, without shear.
            vec3 scaleSquared = vec3(dot(m[0], m[0]), dot(m[1], m[1]), dot(m[2], m[2]));
            localNormal = m * (normal / max(scaleSquared, vec3(1e-8)));
          #endif
          vec4 viewPosition = modelViewMatrix * local;
          vViewPosition = -viewPosition.xyz;
          vToCoreLocal = uImpactPos - local.xyz;
          vNormalLocal = localNormal;
          vViewNormal = normalMatrix * localNormal;
          gl_Position = projectionMatrix * viewPosition;
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec3 vToCoreLocal;
        varying vec3 vNormalLocal;
        varying vec3 vViewNormal;
        varying vec3 vViewPosition;
        varying vec3 vLocalPos;
        varying vec4 vData;
        ${e}
        void main() {
          float age = vData.y;
          if (age <= 0.001 || age >= 0.999) discard;

          float n = fbm(vLocalPos * 3.2 + vec3(vData.x * 13.0, -uTime * 2.2, 0.0));
          float dissolve = smoothstep(0.62, 0.98, age);
          float cut = n - dissolve * 1.12 + 0.34;
          if (cut < 0.0) discard;

          // Vibrant Blizzard-style Shadowflame fire cloud shading:
          // Front-facing billowing lobes are lush vivid crimson/scarlet-red,
          // crevices near impactPos blaze orange-gold & incandescent yellow,
          // and only the narrow outer rim drops to deep plum/void violet!
          float dist = length(vToCoreLocal);
          vec3 dirToCore = vToCoreLocal / max(0.001, dist);
          vec3 N = normalize(vViewNormal);
          vec3 V = isOrthographic ? vec3(0.0, 0.0, 1.0) : normalize(vViewPosition);

          float ndv = clamp(dot(N, V), 0.0, 1.0);
          float nearCore = (1.0 - smoothstep(0.35, 2.20, dist));
          float inward = clamp(dot(normalize(vNormalLocal), dirToCore) * 0.5 + 0.5, 0.0, 1.0);
          // Blazing incandescent fire burst at 56% (zero dark rock!), lush scarlet lobes + fiery crevices at 64%!
          float earlyBoost = (1.0 - smoothstep(0.0, 0.24, age)) * 0.25;
          float coolDown = smoothstep(0.48, 0.98, age) * 0.32;

          float heat = clamp(
            ndv * 0.44 + nearCore * 0.62 + inward * 0.38 + (n - 0.44) * 0.24 + vData.z * 0.14 + earlyBoost - coolDown,
            0.0, 1.0
          );

          vec3 colVoid    = vec3(0.18, 0.015, 0.20);
          vec3 colRuby    = vec3(0.96, 0.06, 0.20);
          vec3 colScarlet = vec3(1.26, 0.15, 0.12);
          vec3 colOrange  = vec3(1.42, 0.58, 0.07);
          vec3 colYellow  = vec3(1.36, 1.22, 0.64);

          vec3 col = mix(colVoid, colRuby, smoothstep(0.06, 0.18, heat));
          col = mix(col, colScarlet, smoothstep(0.16, 0.42, heat));
          col = mix(col, colOrange, smoothstep(0.54, 0.74, heat));
          col = mix(col, colYellow, smoothstep(0.76, 0.90, heat));

          // Suppress rim darkening during incandescent peak (56%), crisp plum toon rim during billowing (64%)
          float rimMask = smoothstep(0.04, 0.24, ndv);
          float rimDark = mix(0.28, 0.42, smoothstep(0.08, 0.32, age));
          col = mix(colVoid, col, (1.0 - rimDark) + rimDark * rimMask);

          gl_FragColor = vec4(col, 1.0);
        }
      `,transparent:!1,depthWrite:!0,side:t.FrontSide}));this._cloudDataAttr=new t.InstancedBufferAttribute(new Float32Array(E*4),4),D.setAttribute(`aCloudData`,this._cloudDataAttr),this._l11FireCloud=new t.InstancedMesh(D,O,E),this._l11FireCloud.frustumCulled=!1,this._l11FireCloud.renderOrder=9,this._cloudSeeds=Array.from({length:E},(e,n)=>{let r=Math.acos(1-2*(n+.5)/E),i=Math.PI*(1+Math.sqrt(5))*n;return{dir:new t.Vector3(Math.sin(r)*Math.cos(i),Math.cos(r)*.78+.14,Math.sin(r)*Math.sin(i)).normalize(),dist:.44+this._rand(n*11+1)*.88,baseScale:.64+this._rand(n*11+2)*.68,delay:this._rand(n*11+3)*.032,heatBias:(n<7?.26:-.06)+(this._rand(n*11+4)-.5)*.18,seed:this._rand(n*11+5)}}),this._registerLayer(`L11_BillowingFireCloud`,`11 翻捲體積烈焰雲團`,this._l11FireCloud);let k=Math.max(16,Math.round(36*this._qScale)),A=this._createStreakGeometry(),j=this._registerMat(new t.ShaderMaterial({uniforms:{uOpacity:{value:1}},vertexShader:`
        attribute float aAlpha;
        varying float vAlpha;
        varying vec2 vUv;
        void main() {
          vAlpha = aAlpha;
          vUv = uv;
          #ifdef USE_INSTANCING
            vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          #else
            vec4 wp = modelMatrix * vec4(position, 1.0);
          #endif
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,fragmentShader:`
        uniform float uOpacity;
        varying float vAlpha;
        varying vec2 vUv;
        void main() {
          if (vAlpha < 0.01) discard;
          vec3 colTail = vec3(0.88, 0.06, 0.22);
          vec3 colMid  = vec3(1.08, 0.34, 0.06);
          vec3 colHead = vec3(1.22, 0.88, 0.28);
          vec3 col = mix(colTail, colMid, smoothstep(0.15, 0.62, vUv.x));
          col = mix(col, colHead, smoothstep(0.65, 0.96, vUv.x));
          gl_FragColor = vec4(col, vAlpha * uOpacity);
        }
      `,transparent:!0,depthWrite:!1,blending:t.AdditiveBlending,side:t.DoubleSide}));this._streakAlphaAttr=new t.InstancedBufferAttribute(new Float32Array(k),1),A.setAttribute(`aAlpha`,this._streakAlphaAttr),this._l12Streaks=new t.InstancedMesh(A,j,k),this._l12Streaks.frustumCulled=!1,this._l12Streaks.renderOrder=11,this._streakSeeds=Array.from({length:k},(e,n)=>{let r=Math.acos(1-2*this._rand(n*13+1)),i=this._rand(n*13+2)*Math.PI*2,a=new t.Vector3(Math.sin(r)*Math.cos(i),Math.cos(r)*.85+.15,Math.sin(r)*Math.sin(i)).normalize(),o=n<5;return{dir:a,speed:o?2.6+this._rand(n*13+3)*1.4:1.2+this._rand(n*13+3)*1.6,length:o?1.15+this._rand(n*13+4)*.55:.32+this._rand(n*13+4)*.48,width:o?.85:.45+this._rand(n*13+5)*.35,life:o?.26+this._rand(n*13+6)*.1:.16+this._rand(n*13+6)*.16}}),this._registerLayer(`L12_RadialEmberStreaks`,`12 徑向高速火星射線`,this._l12Streaks);let M=Math.max(14,Math.round(32*this._qScale)),N=this._registerGeo(new t.PlaneGeometry(1.75,1.75)),P=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:`
        attribute vec4 aSmokeData; // x: seed, y: age, z: scale, w: rot
        varying vec2 vUv;
        varying vec4 vData;
        void main() {
          vUv = uv;
          vData = aSmokeData;
          float c = cos(aSmokeData.w);
          float s = sin(aSmokeData.w);
          vec2 rotPos = vec2(position.x * c - position.y * s, position.x * s + position.y * c) * aSmokeData.z;
          #ifdef USE_INSTANCING
            vec4 centerMV = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          #else
            vec4 centerMV = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          #endif
          centerMV.xy += rotPos;
          gl_Position = projectionMatrix * centerMV;
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vUv;
        varying vec4 vData;
        ${e}
        void main() {
          float age = vData.y;
          if (age <= 0.001 || age >= 0.999) discard;
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;

          // Pure Cartesian domain-warped FBM (eliminates all polar spoke artifacts!)
          float sd = vData.x * 9.7;
          vec2 warp = vec2(
            fbm(vec3(p * 2.1 + vec2(sd, -uTime * 0.45), sd * 0.3)),
            fbm(vec3(p * 2.1 + vec2(sd + 5.2, uTime * 0.35), sd * 0.7))
          ) - 0.5;
          float wisp = fbm(vec3((p + warp * 0.75) * 2.6 + vec2(0.0, -uTime * 0.55), sd));

          float radialMask = (1.0 - smoothstep(0.14, 0.96, r + (wisp - 0.45) * 0.72));
          float dissolve = smoothstep(0.30, 1.0, age);
          float erode = smoothstep(0.18 + dissolve * 0.68, 0.58 + dissolve * 0.40, wisp + (1.0 - r) * 0.32);
          float alpha = radialMask * erode * (1.0 - smoothstep(0.60, 1.0, age)) * 0.76;
          if (alpha < 0.02) discard;

          vec3 colVoid = vec3(0.07, 0.015, 0.10);
          vec3 colPlum = vec3(0.22, 0.03, 0.24);
          vec3 colRim  = vec3(0.60, 0.06, 0.30);
          vec3 col = mix(colVoid, colPlum, smoothstep(0.25, 0.72, wisp));
          col = mix(col, colRim, smoothstep(0.65, 0.95, (1.0 - r) * (1.0 - age) * 1.25));
          gl_FragColor = vec4(col, alpha);
        }
      `,transparent:!0,depthWrite:!1}));this._smokeDataAttr=new t.InstancedBufferAttribute(new Float32Array(M*4),4),N.setAttribute(`aSmokeData`,this._smokeDataAttr),this._l13Smoke=new t.InstancedMesh(N,P,M),this._l13Smoke.frustumCulled=!1,this._l13Smoke.renderOrder=3,this._smokeSeeds=Array.from({length:M},(e,n)=>{let r=n/M*Math.PI*2+this._rand(n*5+1)*.5,i=(this._rand(n*5+2)-.35)*1.15;return{dir:new t.Vector3(Math.cos(r),i,Math.sin(r)).normalize(),dist:.95+this._rand(n*5+3)*1.25,scale:.85+this._rand(n*5+4)*.95,rot:this._rand(n*5+6)*Math.PI*2,seed:this._rand(n*5+5)}}),this._registerLayer(`L13_DarkShadowSmokePuffs`,`13 暗紫撕裂煙暈`,this._l13Smoke);let F=this._registerGeo(new t.RingGeometry(.84,1.16,52,1)),I=this._registerMat(new t.ShaderMaterial({uniforms:{uAge:{value:0},uTime:{value:0}},vertexShader:`
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uAge;
        uniform float uTime;
        varying vec3 vPos;
        void main() {
          if (uAge <= 0.001 || uAge >= 0.999) discard;
          float angle = atan(vPos.y, vPos.x);
          float r = length(vPos.xy);
          float nW = sin(angle * 7.0 + uTime * 4.0) * 0.05;
          float radial = smoothstep(0.80, 0.98, r + nW) * (1.0 - smoothstep(0.98, 1.18, r + nW));
          float arcWave = sin(angle * 3.0 + 0.6);
          float arcMask = smoothstep(-0.2 + uAge * 0.90, 0.22 + uAge * 0.90, arcWave);
          float alpha = radial * arcMask * (1.0 - smoothstep(0.28, 1.0, uAge)) * 0.68;
          if (alpha < 0.02) discard;
          vec3 colViolet  = vec3(0.60, 0.12, 0.92);
          vec3 colCrimson = vec3(1.00, 0.14, 0.40);
          vec3 colHot     = vec3(1.16, 0.84, 0.42);
          vec3 col = mix(colViolet, colCrimson, smoothstep(0.86, 1.04, r));
          col = mix(col, colHot, smoothstep(0.65, 0.95, radial) * (1.0 - uAge * 0.6));
          gl_FragColor = vec4(col, alpha);
        }
      `,transparent:!0,depthWrite:!1,blending:t.AdditiveBlending,side:t.DoubleSide}));this._l14Shockwave=new t.Mesh(F,I),this._l14Shockwave.renderOrder=10,this._registerLayer(`L14_HyperdimShockwaveRing`,`14 超維空間衝擊波環`,this._l14Shockwave);let L=Math.max(28,Math.round(72*this._qScale)),R=this._registerGeo(new t.PlaneGeometry(.14,.14)),z=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:`
        attribute vec3 aEmberData; // x: alpha, y: hueMix, z: size
        varying vec2 vUv;
        varying vec3 vData;
        void main() {
          vUv = uv;
          vData = aEmberData;
          #ifdef USE_INSTANCING
            vec4 centerMV = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          #else
            vec4 centerMV = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          #endif
          centerMV.xy += position.xy * aEmberData.z;
          gl_Position = projectionMatrix * centerMV;
        }
      `,fragmentShader:`
        varying vec2 vUv;
        varying vec3 vData;
        void main() {
          if (vData.x < 0.02) discard;
          float d = length(vUv - 0.5) * 2.0;
          if (d > 1.0) discard;
          float core = exp(-d * d * 10.0);
          float halo = exp(-d * d * 3.2) * 0.55;
          vec3 colGold   = vec3(1.25, 0.88, 0.30);
          vec3 colOrange = vec3(1.10, 0.36, 0.10);
          vec3 colMag    = vec3(0.98, 0.16, 0.52);
          vec3 baseCol = mix(colGold, colOrange, smoothstep(0.15, 0.55, vData.y));
          baseCol = mix(baseCol, colMag, smoothstep(0.55, 0.95, vData.y));
          vec3 col = mix(baseCol, vec3(1.35, 1.25, 0.95), core * 0.75);
          gl_FragColor = vec4(col, (core + halo) * vData.x);
        }
      `,transparent:!0,depthWrite:!1,blending:t.AdditiveBlending}));this._emberDataAttr=new t.InstancedBufferAttribute(new Float32Array(L*3),3),R.setAttribute(`aEmberData`,this._emberDataAttr),this._l15Embers=new t.InstancedMesh(R,z,L),this._l15Embers.frustumCulled=!1,this._l15Embers.renderOrder=13,this._emberSeeds=Array.from({length:L},(e,t)=>({isWake:t<30,u:this._rand(t*9+1),angle:this._rand(t*9+2)*Math.PI*2,rad:.25+this._rand(t*9+3)*1.95,rise:.45+this._rand(t*9+4)*1.75,hue:this._rand(t*9+5),scale:.45+this._rand(t*9+6)*.85})),this._registerLayer(`L15_FloatingSoulEmbers`,`15 飄浮微光靈魂餘燼`,this._l15Embers);let B=this._registerGeo(new t.CircleGeometry(2.45,40));B.rotateX(-Math.PI/2);let V=this._registerMat(new t.ShaderMaterial({uniforms:{uAge:{value:0},uTime:{value:0}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uAge;
        uniform float uTime;
        varying vec2 vUv;
        ${e}
        void main() {
          if (uAge <= 0.001 || uAge >= 0.999) discard;
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;
          float angle = atan(p.y, p.x);

          // Organic ragged charred earth + sharp branching magma fissures
          float n1 = fbm(vec3(p * 3.6, 2.3));
          float n2 = fbm(vec3(p * 7.4 + vec2(n1 * 1.2), 4.7));
          float craterEdge = (1.0 - smoothstep(0.22, 0.94, r + (n1 - 0.45) * 0.48));

          // Ridge noise cracks radiating from center
          float ridge = 1.0 - abs(n2 * 2.0 - 1.0);
          float cracks = pow(clamp(ridge, 0.0, 1.0), 5.0) * (1.0 - smoothstep(0.04, 0.84, r));
          float radialFissure = pow(abs(sin(angle * 3.5 + (n1 - 0.5) * 3.8)), 10.0) * (1.0 - smoothstep(0.08, 0.76, r)) * smoothstep(0.0, 0.14, r) * 0.75;
          float totalCracks = clamp(cracks * 1.45 + radialFissure, 0.0, 1.0);

          // Restrained charred ground crater + subtle cooling magma veins (supports blast without stealing focus!)
          float coreHeat = (1.0 - smoothstep(0.0, 0.28, uAge)) * (1.0 - smoothstep(0.05, 0.45, r));
          float emberGlow = (1.0 - smoothstep(0.0, 0.78, uAge));
          vec3 colChar   = vec3(0.045, 0.012, 0.075);
          vec3 colCrim   = vec3(0.68, 0.06, 0.20);
          vec3 colOrange = vec3(1.05, 0.42, 0.08);

          vec3 col = colChar;
          col = mix(col, colCrim, clamp(totalCracks * (0.35 + 0.65 * emberGlow), 0.0, 1.0));
          col = mix(col, colOrange, clamp(totalCracks * coreHeat * 1.1, 0.0, 1.0));

          float fade = smoothstep(0.0, 0.05, uAge) * (1.0 - smoothstep(0.48, 1.0, uAge));
          float alpha = clamp(craterEdge * 0.68 + totalCracks * 0.42, 0.0, 0.82) * fade;
          gl_FragColor = vec4(col, alpha);
        }
      `,transparent:!0,depthWrite:!1}));this._l16Scorch=new t.Mesh(B,V),this._l16Scorch.position.set(this.impactPos.x,this.groundY+.015,this.impactPos.z),this._l16Scorch.renderOrder=2,this._registerLayer(`L16_GroundScorchSigil`,`16 地面超維灼燒印記`,this._l16Scorch);let H=Math.max(10,Math.round(18*this._qScale)),U=this._registerGeo(new t.PlaneGeometry(.46,.46)),W=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:`
        attribute vec4 aGlyphData; // x: alpha, y: glyphType, z: hueMix, w: spin
        varying vec2 vUv;
        varying vec4 vData;
        void main() {
          vUv = uv;
          vData = aGlyphData;
          #ifdef USE_INSTANCING
            vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          #else
            vec4 wp = modelMatrix * vec4(position, 1.0);
          #endif
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,fragmentShader:`
        uniform float uTime;
        varying vec2 vUv;
        varying vec4 vData;
        void main() {
          if (vData.x < 0.02) discard;
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;
          // Crisp geometric SDF hyperdimensional arcane sigil (diamond + inscribed ring + cross rune)
          float dDiamond = abs(p.x) + abs(p.y);
          float outerD = exp(-abs(dDiamond - 0.78) * 24.0);
          float innerR = exp(-abs(r - 0.42) * 26.0);
          float crossBar = (exp(-abs(p.x) * 32.0) + exp(-abs(p.y) * 32.0)) * (1.0 - smoothstep(0.15, 0.68, r));
          float centerDot = exp(-r * r * 28.0);
          float pattern = clamp(outerD + innerR * 0.8 + crossBar * 0.55 + centerDot * 0.9, 0.0, 1.0);
          if (pattern < 0.05) discard;

          vec3 colGold   = vec3(1.38, 1.02, 0.34);
          vec3 colMag    = vec3(1.15, 0.18, 0.62);
          vec3 colViolet = vec3(0.68, 0.30, 1.15);
          vec3 col = mix(colGold, colMag, smoothstep(0.15, 0.65, vData.z));
          col = mix(col, colViolet, smoothstep(0.65, 1.0, vData.z));
          col = mix(col, vec3(1.45, 1.38, 1.15), centerDot * 0.7);
          gl_FragColor = vec4(col, pattern * vData.x);
        }
      `,transparent:!0,depthWrite:!1,blending:t.AdditiveBlending,side:t.DoubleSide}));this._glyphDataAttr=new t.InstancedBufferAttribute(new Float32Array(H*4),4),U.setAttribute(`aGlyphData`,this._glyphDataAttr),this._l17Glyphs=new t.InstancedMesh(U,W,H),this._l17Glyphs.frustumCulled=!1,this._l17Glyphs.renderOrder=13,this._glyphSeeds=Array.from({length:H},(e,t)=>({isFlight:t<8,u:.12+this._rand(t*17+1)*.82,angle:t/H*Math.PI*2+this._rand(t*17+2)*.5,rad:.85+this._rand(t*17+3)*1.45,scale:.65+this._rand(t*17+4)*.75,hue:this._rand(t*17+5),rise:.35+this._rand(t*17+6)*1.1})),this._registerLayer(`L17_HyperdimArcaneGlyphs`,`17 超維符文浮空陣列`,this._l17Glyphs);let G=this._createMultiRibbonGeometry(5,14),K=this._registerMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uOpacity:{value:1}},vertexShader:`
        attribute float aRibbonSeed;
        varying vec2 vUv;
        varying float vSeed;
        void main() {
          vUv = uv;
          vSeed = aRibbonSeed;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;
        varying float vSeed;
        void main() {
          float across = abs(vUv.y - 0.5) * 2.0;
          float core = exp(-across * across * 14.0);
          float glow = exp(-across * across * 3.0) * 0.65;
          float ends = smoothstep(0.0, 0.10, vUv.x) * (1.0 - smoothstep(0.88, 1.0, vUv.x));
          float flicker = 0.68 + 0.32 * sin(uTime * 38.0 + vSeed * 9.0 + vUv.x * 12.0);
          float alpha = (core + glow) * ends * flicker * uOpacity;
          if (alpha < 0.03) discard;
          vec3 colViolet = vec3(0.76, 0.18, 1.10);
          vec3 colMag    = vec3(1.15, 0.22, 0.68);
          vec3 colCore   = vec3(1.50, 1.44, 1.25);
          vec3 col = mix(colViolet, colMag, 0.5 + 0.5 * sin(vUv.x * 8.0 - uTime * 12.0));
          col = mix(col, colCore, core * 0.88);
          gl_FragColor = vec4(col, alpha);
        }
      `,transparent:!0,depthWrite:!1,blending:t.AdditiveBlending,side:t.DoubleSide}));this._l18Lightning=new t.Mesh(G,K),this._l18Lightning.frustumCulled=!1,this._l18Lightning.renderOrder=14,this._arcSegs=14,this._arcCount=5,this._registerLayer(`L18_DimensionalLightningArcs`,`18 超維空間裂隙電弧`,this._l18Lightning)}_evalOrbPos(e,t,n){let r=this._soulOrbConfigs[e],i=l,a=u;if(t<a){let a=this._smoothstep(0,i,t),o=Math.max(0,(t-i)/.4);this._evalFlightPos(o,this._v1),this._evalFlightTangent(o,this._v2),this._buildSafeBasis(this._v2,this._right,this._binorm);let s=r.baseAngle+t*14.5,c=r.flightRadius*(.4+.6*a),l=-.35-e*.52;n.copy(this._v1).addScaledVector(this._v2,l).addScaledVector(this._right,Math.cos(s)*c).addScaledVector(this._binorm,Math.sin(s)*c)}else{let i=(t-a)/.45999999999999996,o=r.baseAngle+a*14.5+i**.82*(9.2-e*.8),s=this._smoothstep(0,.15,i),c=r.flightRadius+(r.impactRadius-r.flightRadius)*s+i*.48,l=Math.sin(o+e*1.35)*r.tilt;n.set(this.impactPos.x+Math.cos(o)*c,Math.max(this.groundY+.45,this.impactPos.y+l+i*.18),this.impactPos.z+Math.sin(o)*c*.82)}return n}_writeRibbonSlice(e,t,n,r,i,a=1.05,o=!1){let s=t*((n+1)*2);for(let t=0;t<=n;t++){let c=this._ptsPool[t],l=this._ptsPool[t>0?t-1:0],u=this._ptsPool[t<n?t+1:n];this._tang.copy(u).sub(l),this._tang.lengthSq()<1e-6&&this._tang.set(1,0,0),this._tang.normalize(),this._toCam.copy(i).sub(c).normalize(),o?(this._side.crossVectors(this._tang,this._up),this._side.lengthSq()<1e-4?this._side.set(1,0,0):this._side.normalize(),this._side.multiplyScalar(.76).addScaledVector(this._up,.65).normalize()):(this._side.crossVectors(this._tang,this._toCam),this._side.lengthSq()<.06?t>0?this._side.copy(this._prevSide):(this._side.crossVectors(this._tang,this._up),this._side.lengthSq()<1e-4?this._side.set(0,1,0):this._side.normalize()):this._side.normalize(),t>0&&(this._side.dot(this._prevSide)<0&&this._side.negate(),this._side.lerp(this._prevSide,.42).normalize())),this._prevSide.copy(this._side);let d=t/n,f=d>.82?1-(d-.82)/.18:1,p=r*Math.sin(Math.min(1,d*4.2)*Math.PI*.5)*(1-d)**a*f*f,m=s+t*2;e.setXYZ(m,c.x+this._side.x*p,c.y+this._side.y*p,c.z+this._side.z*p),e.setXYZ(m+1,c.x-this._side.x*p,c.y-this._side.y*p,c.z-this._side.z*p)}}setLayerVisible(e,t){!this._disposed&&Object.hasOwn(this._userLayerEnabled,e)&&typeof t==`boolean`&&this._userLayerEnabled[e]!==t&&(this._userLayerEnabled[e]=t,this.setProgress(this.progress))}getStageLabel(e){return e<.14?`階段：超維召喚與蓄力`:e<.54?`階段：靈魂火球高速飛行`:e<.61?`階段：命中瞬發星爆`:e<.8?`階段：烈焰雲團翻捲`:`階段：虛空餘燼消散`}setProgress(e,t){!this._disposed&&Number.isFinite(e)&&(this.progress=h(e),this.time=this.progress*this.duration,m(t)&&this._lastCamPos.copy(t),this._sample(!1))}setCameraPosition(e){this._disposed||!m(e)||this._lastCamPos.distanceToSquared(e)<1e-10||(this._lastCamPos.copy(e),this._sample(!0))}_sample(e){let t=this._lastCamPos,n=l,r=u,i=this._smoothstep(0,n,this.progress),a=Math.max(0,Math.min(1,(this.progress-n)/.4)),o=Math.max(0,(this.progress-r)/.45999999999999996),s=this.progress<.552;if(!e){this._evalFlightPos(a,this._v1),this._evalFlightTangent(a,this._v2),this._projPivot.position.copy(this._v1),this._setQuatFromForward(this._v2,this._q1),this._projPivot.quaternion.copy(this._q1);let e=s?(.2+.8*i)*(this.progress>r?Math.max(0,1-(this.progress-r)/.012):1):1e-4,t=.52+.48*this._smoothstep(.1,.2,this.progress);this._projPivot.scale.set(e*t,e,e),this._projPivot.visible=s,this._applyPhaseVisibility(`L01_IncandescentCore`,s),this._applyPhaseVisibility(`L02_FlameMantleShell`,s),this._applyPhaseVisibility(`L03_DarkVoidFlameSheath`,s),s&&(this._l01Core.material.uniforms.uTime.value=this.time,this._l01Core.material.uniforms.uIntensity.value=.9+.16*i,this._l02Mantle.material.uniforms.uTime.value=this.time,this._l02Mantle.material.uniforms.uAlpha.value=i,this._l03Sheath.material.uniforms.uTime.value=this.time,this._l03Sheath.material.uniforms.uAlpha.value=i);let n=this.progress<.88;if(this._applyPhaseVisibility(`L04_Level2OuterGlowHalo`,n),n){if(this.progress<r){this._l04Halo.position.copy(this._v1);let e=.65+.52*i;this._l04Halo.scale.set(e,e,1),this._l04Halo.material.uniforms.uOpacity.value=.44*i}else{this._l04Halo.position.copy(this.impactPos);let e=Math.exp(-o*2.4),t=1.45+o*1.15;this._l04Halo.scale.set(t,t,1),this._l04Halo.material.uniforms.uOpacity.value=.5*e}}let c=this._smoothstep(0,.04,this.progress)*(1-this._smoothstep(.18,.34,this.progress));if(this._applyPhaseVisibility(`L05_DimensionalRiftRings`,c>.01),c>.01){this._l05Group.position.copy(this.startPos),this._evalFlightTangent(.02,this._v2),this._m1.lookAt(this._v5.copy(this.startPos).add(this._v2),this.startPos,this._up),this._l05Group.quaternion.setFromRotationMatrix(this._m1);let e=.48+.95*this._smoothstep(0,.14,this.progress);this._l05Group.scale.setScalar(e),this._riftRingA.rotation.z=this.time*1.6,this._riftRingB.rotation.z=-this.time*2.4,this._riftRingC.rotation.z=this.time*.95,this._riftRingA.material.uniforms.uTime.value=this.time,this._riftRingA.material.uniforms.uOpacity.value=c*.92,this._riftRingC.material.uniforms.uTime.value=this.time,this._riftRingC.material.uniforms.uOpacity.value=c*.85}}let c=this._smoothstep(.14,.22,this.progress)*(1-this._smoothstep(.54,.62,this.progress)),d=Math.min(1,a),f=c>.01&&d>.02;if(this._applyPhaseVisibility(`L06_VoidSmokeRibbons`,f),f){this._l06VoidRibbons.material.uniforms.uTime.value=this.time,this._l06VoidRibbons.material.uniforms.uOpacity.value=c;let e=this._l06VoidRibbons.geometry.attributes.position,n=this._voidRibbonSegs,r=Math.min(1,d/.22);this._evalFlightTangent(a,this._v2),this._buildSafeBasis(this._v2,this._right,this._binorm);for(let i=0;i<this._voidRibbonConfigs.length;i++){let a=this._voidRibbonConfigs[i],o=Math.min(d,a.lengthU);for(let e=0;e<=n;e++){let t=e/n,i=d-t*o,s=this._ptsPool[e];this._evalFlightPos(i,s);let c=t*5.4+a.phase-this.time*4.2,l=a.radius*(.2+t*1.45)*r,u=Math.sin(t*4.4-this.time*3)*a.sAmp*t*r;s.addScaledVector(this._right,Math.cos(c)*l+u*.45),s.addScaledVector(this._binorm,Math.sin(c)*l+u*.65),s.y+=t*t*a.lift*.55*r}this._writeRibbonSlice(e,i,n,a.width*r,t,.95)}e.needsUpdate=!0}let p=this._smoothstep(.04,.15,this.progress)*(1-this._smoothstep(.78,.95,this.progress)),m=p>.01;if(this._applyPhaseVisibility(`L07_OrbitingSoulOrbs`,m),this._applyPhaseVisibility(`L08_SoulOrbTrails`,m),m&&(!e||this.progress<r)){this._l07Orbs.material.uniforms.uTime.value=this.time,this._l08OrbTrails.material.uniforms.uTime.value=this.time,this._l08OrbTrails.material.uniforms.uOpacity.value=p*.9;let n=this._l08OrbTrails.geometry.attributes.position,i=this._orbTrailSegs,a=this.progress>=r,o=Math.max(0,this.progress-r),s=a?Math.min(o,.26):Math.min(this.progress-.01,.14),c=a?Math.min(1,o/.045):1,l=(a?.5:.2)*c;for(let o=0;o<3;o++){let c=this._soulOrbConfigs[o];if(!e){this._evalOrbPos(o,this.progress,this._orbPos);let e=(a?c.impactScale:c.scale)*p;this._q1.setFromAxisAngle(this._up,this.time*3.2+o),this._m1.compose(this._orbPos,this._q1,this._v5.set(e,e,e)),this._l07Orbs.setMatrixAt(o,this._m1)}let u=a?r:.01;for(let e=0;e<=i;e++){let t=e/i,n=Math.max(u,this.progress-t*Math.max(.003,s));this._evalOrbPos(o,n,this._ptsPool[e])}this._writeRibbonSlice(n,o,i,l*c.scale,t,1.18,a)}e||(this._l07Orbs.instanceMatrix.needsUpdate=!0),n.needsUpdate=!0}if(!e){let e=this.progress>.1&&this.progress<.6;if(this._applyPhaseVisibility(`L09_SoulLickFlames`,e),e){let e=this.progress>r?Math.max(0,1-(this.progress-r)/.06):1;for(let t=0;t<this._lickSeeds.length;t++){let n=this._lickSeeds[t],r=(this.progress*4+n.offset)%1,i=Math.max(0,Math.min(1,a-r*.24));this._evalFlightPos(i,this._v1),this._evalFlightTangent(i,this._v2);let o=n.angle+r*2.2,s=n.rad*(.35+r*1.15);this._v1.y+=Math.sin(o)*s+r*.22,this._v1.z+=Math.cos(o)*s,this._setQuatFromForward(this._v2,this._q1);let c=n.scale*(1-r)*e;this._m1.compose(this._v1,this._q1,this._v5.set(c*1.45,c*.85,c*.85)),this._l09Licks.setMatrixAt(t,this._m1),this._lickHeatAttr.setX(t,(1-r)*e)}this._l09Licks.instanceMatrix.needsUpdate=!0,this._lickHeatAttr.needsUpdate=!0}let t=this.progress>=r&&o<.36;if(this._applyPhaseVisibility(`L10_ImpactStarburstCore`,t),t){let e=o/.36;this._l10Starburst.position.copy(this.impactPos);let t=.82-.34*this._smoothstep(.06,.72,e);this._l10Starburst.scale.set(t,t,1),this._l10Starburst.material.uniforms.uAge.value=e,this._l10Starburst.material.uniforms.uOpacity.value=(1-this._smoothstep(.58,1,e))*.94}let n=this.progress>=r&&o<.6;if(this._applyPhaseVisibility(`L11_BillowingFireCloud`,n),n){this._l11FireCloud.material.uniforms.uTime.value=this.time;let e=0;for(let t=0;t<this._cloudSeeds.length;t++){let n=this._cloudSeeds[t],r=Math.max(0,Math.min(1,(o-n.delay)/.56));if(r<=.001||r>=.999)continue;let i=1-(1-r)**3;this._v1.copy(this.impactPos).addScaledVector(n.dir,n.dist*(.28+.95*i)),this._v1.y=Math.max(this.groundY+.58,this._v1.y+r*.45);let a=1-this._smoothstep(.72,1,r),s=n.baseScale*(.5+.9*i)*a;if(s<.01)continue;let c=s*(.86+n.seed*.34),l=s*(1.08-n.seed*.24),u=s*(.9+n.seed*3.7%1*.28);this._q1.setFromAxisAngle(n.dir,r*1.2),this._m1.compose(this._v1,this._q1,this._v5.set(c,l,u)),this._l11FireCloud.setMatrixAt(e,this._m1),this._cloudDataAttr.setXYZW(e,n.seed,r,n.heatBias,0),e++}this._l11FireCloud.count=e,this._l11FireCloud.visible=this._l11FireCloud.visible&&e>0,e>0&&(this._l11FireCloud.instanceMatrix.needsUpdate=!0,this._cloudDataAttr.needsUpdate=!0)}let i=this.progress>=r&&o<.4;if(this._applyPhaseVisibility(`L12_RadialEmberStreaks`,i),i){let e=0;for(let t=0;t<this._streakSeeds.length;t++){let n=this._streakSeeds[t],r=o/n.life;if(r<=.001||r>=1)continue;let i=.45+n.speed*(1-(1-r)**2.3);this._v1.copy(this.impactPos).addScaledVector(n.dir,i),this._v1.y=Math.max(this.groundY+.22,this._v1.y-r*r*.35),this._setQuatFromForward(n.dir,this._q1);let a=n.length*(1.12-r*.55),s=n.width*(1-r*.55);this._m1.compose(this._v1,this._q1,this._v5.set(a,s,s)),this._l12Streaks.setMatrixAt(e,this._m1),this._streakAlphaAttr.setX(e,1-this._smoothstep(.32,1,r)),e++}this._l12Streaks.count=e,this._l12Streaks.visible=this._l12Streaks.visible&&e>0,e>0&&(this._l12Streaks.instanceMatrix.needsUpdate=!0,this._streakAlphaAttr.needsUpdate=!0)}}let g=this.progress>=r&&o>.07&&o<.98;if(this._applyPhaseVisibility(`L13_DarkShadowSmokePuffs`,g),g){this._l13Smoke.material.uniforms.uTime.value=this.time,this._toCam.copy(t).sub(this.impactPos).normalize();let e=h((o-.07)/.89);for(let t=0;t<this._smokeSeeds.length;t++){let n=this._smokeSeeds[t];if(e<=.001||e>=.999){this._m1.makeScale(0,0,0),this._l13Smoke.setMatrixAt(t,this._m1),this._smokeDataAttr.setXYZW(t,n.seed,0,0,0);continue}let r=1-(1-e)**2.4;this._v1.copy(this.impactPos).addScaledVector(n.dir,n.dist*(.62+.96*r)),this._v1.y=Math.max(this.groundY+.45,this._v1.y+e*.85);let i=(this._v1.x-this.impactPos.x)*this._toCam.x+(this._v1.y-this.impactPos.y)*this._toCam.y+(this._v1.z-this.impactPos.z)*this._toCam.z;i>-.45&&this._v1.addScaledVector(this._toCam,-(i+.65));let a=n.scale*(.65+.95*r);this._m1.makeTranslation(this._v1.x,this._v1.y,this._v1.z),this._l13Smoke.setMatrixAt(t,this._m1),this._smokeDataAttr.setXYZW(t,n.seed,e,a,n.rot+e*.8)}this._l13Smoke.instanceMatrix.needsUpdate=!0,this._smokeDataAttr.needsUpdate=!0}if(!e){let e=Math.max(0,Math.min(1,o/.2)),t=this.progress>=r&&e<.995;this._applyPhaseVisibility(`L14_HyperdimShockwaveRing`,t),t&&(this._l14Shockwave.material.uniforms.uAge.value=e,this._l14Shockwave.material.uniforms.uTime.value=this.time,this._l14Shockwave.position.set(this.impactPos.x,this.impactPos.y-.25,this.impactPos.z),this._l14Shockwave.rotation.set(-Math.PI*.44,.18,e*4.2),this._l14Shockwave.scale.setScalar(.6+e*2.55));let s=this.progress>.12&&this.progress<.99;if(this._applyPhaseVisibility(`L15_FloatingSoulEmbers`,s),s){this._l15Embers.material.uniforms.uTime.value=this.time;let e=0;for(let t=0;t<this._emberSeeds.length;t++){let n=this._emberSeeds[t],i=0;if(n.isWake){if(this.progress<.82){let e=Math.min(a,n.u),t=a-e+o*.85;if(t>=0&&t<.72){this._evalFlightPos(e,this._v1);let r=n.angle+this.time*1.4;this._v1.x+=Math.cos(r)*n.rad*.24,this._v1.y+=Math.sin(r)*n.rad*.24+t*n.rise*.55,this._v1.z+=Math.sin(r*1.3)*n.rad*.24,i=Math.sin((1-t/.72)*Math.PI)*.82}}}else if(this.progress>=r){let e=o,r=n.angle+e*4,a=n.rad*(.32+.88*Math.sqrt(e));this._v1.set(this.impactPos.x+Math.cos(r)*a,Math.max(this.groundY+.2,this.impactPos.y+(n.rise-.55)*e*1.2),this.impactPos.z+Math.sin(r)*a);let s=.62+.38*Math.sin(this.time*14+t*2.1);i=this._smoothstep(0,.08,e)*(1-this._smoothstep(.55,1,e))*s*.92}i<.02||(this._m1.makeTranslation(this._v1.x,this._v1.y,this._v1.z),this._l15Embers.setMatrixAt(e,this._m1),this._emberDataAttr.setXYZ(e,i,n.hue,n.scale*(.7+.3*i)),e++)}this._l15Embers.count=e,this._l15Embers.visible=this._l15Embers.visible&&e>0,e>0&&(this._l15Embers.instanceMatrix.needsUpdate=!0,this._emberDataAttr.needsUpdate=!0)}let c=this.progress>=r&&o<.99;this._applyPhaseVisibility(`L16_GroundScorchSigil`,c),c&&(this._l16Scorch.material.uniforms.uAge.value=o,this._l16Scorch.material.uniforms.uTime.value=this.time);let l=this.progress>.02&&this.progress<.94;if(this._applyPhaseVisibility(`L17_HyperdimArcaneGlyphs`,l),l){this._l17Glyphs.material.uniforms.uTime.value=this.time;let e=0;for(let t=0;t<this._glyphSeeds.length;t++){let s=this._glyphSeeds[t],c=0,l=s.scale;if(s.isFlight){if(this.progress<.62){let e=Math.min(a,s.u),t=this.progress<n?1-i:Math.max(0,(a-e)*1.6+o*2.5);if(this.progress<n){let e=s.angle+this.time*2.8,t=s.rad*(1.15-.55*i);this._v1.set(this.startPos.x-.15+Math.cos(e)*.18,this.startPos.y+Math.sin(e)*t,this.startPos.z+Math.cos(e)*t),c=this._smoothstep(.02,.08,this.progress)*.78}else if(t<.65&&a>=s.u*.85){this._evalFlightPos(e,this._v1);let n=s.angle+this.time*2.4;this._v1.y+=Math.sin(n)*(.55+t*.65),this._v1.z+=Math.cos(n)*(.55+t*.65),c=Math.sin((1-t/.65)*Math.PI)*.76}}}else if(this.progress>=r&&o<.86){let e=o/.86,t=s.angle+e*2.6,n=1.25+s.rad*(.45+.85*Math.sqrt(e));this._v1.set(this.impactPos.x+Math.cos(t)*n,Math.max(this.groundY+.35,this.impactPos.y+(s.rise-.25)*(.3+e*1.1)),this.impactPos.z+Math.sin(t)*n*.82),c=this._smoothstep(0,.1,e)*(1-this._smoothstep(.55,1,e))*.82}c<.02||(this._q1.setFromAxisAngle(this._up,this.time*1.8+t*.9),this._m1.compose(this._v1,this._q1,this._v5.set(l,l,l)),this._l17Glyphs.setMatrixAt(e,this._m1),this._glyphDataAttr.setXYZW(e,c,t%3,s.hue,this.time),e++)}this._l17Glyphs.count=e,this._l17Glyphs.visible=this._l17Glyphs.visible&&e>0,e>0&&(this._l17Glyphs.instanceMatrix.needsUpdate=!0,this._glyphDataAttr.needsUpdate=!0)}}let _=this.progress>.03&&this.progress<.76;if(this._applyPhaseVisibility(`L18_DimensionalLightningArcs`,_),_){let e=this.progress<r?this._smoothstep(.03,.1,this.progress)*.88:(1-this._smoothstep(.18,.48,o))*.92;this._l18Lightning.material.uniforms.uTime.value=this.time,this._l18Lightning.material.uniforms.uOpacity.value=Math.max(0,e);let n=this._l18Lightning.geometry.attributes.position,i=this._arcSegs,s=Math.floor(this.time*18);for(let e=0;e<this._arcCount;e++){if(this.progress<r){if(this._evalFlightPos(a,this._arcStart),e<3)this._evalOrbPos(e,this.progress,this._arcEnd);else{let t=Math.max(0,a-(.14+(e-3)*.12));this._evalFlightPos(t,this._arcEnd);let n=e*2.4+this.time*6;this._arcEnd.y+=Math.sin(n)*.58,this._arcEnd.z+=Math.cos(n)*.58}}else if(this._arcStart.copy(this.impactPos),e<3)this._evalOrbPos(e,this.progress,this._arcEnd);else{let t=e*2.1+o*4.5,n=1.45+o*1.8;this._arcEnd.set(this.impactPos.x+Math.cos(t)*n,Math.max(this.groundY+.25,this.impactPos.y+Math.sin(t*1.4)*1.1),this.impactPos.z+Math.sin(t)*n*.75)}for(let t=0;t<=i;t++){let n=t/i,r=this._ptsPool[t];r.lerpVectors(this._arcStart,this._arcEnd,n);let a=Math.sin(n*Math.PI),o=(this._rand(s*31+e*97+t*13+1)-.5)*.36*a,c=(this._rand(s*31+e*97+t*13+2)-.5)*.36*a,l=(this._rand(s*31+e*97+t*13+3)-.5)*.36*a;r.x+=o,r.y+=c,r.z+=l}this._writeRibbonSlice(n,e,i,.055,t,.15,!1)}n.needsUpdate=!0}}update(e,t){!Number.isFinite(e)||e<=0||this.setProgress((this.progress+e%this.duration/this.duration)%1,t)}_normalizeDirection(e){let t=Math.max(Math.abs(e.x),Math.abs(e.y),Math.abs(e.z));if(t===0)throw RangeError(`direction must be nonzero`);return e.set(e.x/t,e.y/t,e.z/t).normalize()}_flightDuration(e,t,n){_(t,`impactPos`);let r=Math.hypot(t.x-e.x,t.y-e.y,t.z-e.z);return v(Math.max(.12,r/n),void 0,`flight duration`,b)}_syncImpactPosition(){this._l11FireCloud.material.uniforms.uImpactPos.value.copy(this.impactPos),this._l16Scorch.position.set(this.impactPos.x,this.groundY+.015,this.impactPos.z)}_begin(e,t,n,r,i){this.startPos.copy(e),this.impactPos.copy(t),this.direction.copy(n),Object.assign(this,r),this._flightTotal=i,this._syncImpactPosition(),this._generation++,this.state=this.castDuration>0?`cast`:`flying`,this._stateTime=0,this.group.visible=!0,this.setProgress(this.state===`cast`?0:l)}reset(e=this.startPos,t=this.impactPos){if(this._disposed)return;_(e,`startPos`);let n=this._flightDuration(e,t,this._launchDefaults.flightSpeed),r=this._v1.copy(t).sub(e);r.lengthSq()===0&&r.copy(this.direction),this._begin(e,t,this._normalizeDirection(r),this._launchDefaults,n),this.setProgress(0)}launch(e,t,n={}){if(this._disposed)return this;_(e,`origin`);let r=this._normalizeDirection(this._v1.copy(g(t,`direction`))),i=S(n,this._launchDefaults),a=this._v2.copy(e).addScaledVector(r,i.maxRange),o=this._flightDuration(e,a,i.flightSpeed);return this._begin(e,a,r,i,o),this}getProjectilePosition(e=new t.Vector3){return e.copy(this._projPivot.position)}triggerImpact(e){this._disposed||this.state!==`cast`&&this.state!==`flying`||(e!==void 0&&_(e,`hitPoint`),this.impactPos.copy(e??this._projPivot.position),this._syncImpactPosition(),this.state=`impact`,this._stateTime=0,this.setProgress(u),this.onImpact&&this.onImpact(this.impactPos.clone()))}cancel(){this._disposed||(this._generation++,this.state=`done`,this.group.visible=!1)}step(e,t){if(this._disposed||!Number.isFinite(e)||e<=0)return this.state;let n=this._generation;for(;this.state!==`idle`&&this.state!==`done`&&this._generation===n;){let n=this.state===`cast`,r=this.state===`flying`,i=n?this.castDuration:r?this._flightTotal:this.impactDuration,a=Math.max(0,i-this._stateTime);if(e<a){this._stateTime+=e;let a=this._stateTime/i;this.setProgress(n?a*l:r?l+a*.4:u+a*.45999999999999996,t);break}if(e-=a,n)this.state=`flying`,this._stateTime=0,this.setProgress(l,t);else if(r)m(t)&&this._lastCamPos.copy(t),this.triggerImpact(this.impactPos);else{this.setProgress(1,t),this.state=`done`,this.group.visible=!1,this.onComplete&&this.onComplete();break}if(e===0)break}return this.state}dispose(){this._disposed||(this.cancel(),this._disposed=!0,this.group.traverse(e=>{e.isInstancedMesh&&e.dispose()}),this._geometries.forEach(e=>e.dispose()),this._materials.forEach(e=>e.dispose()),C.release(),this.group.removeFromParent(),this.group.clear(),this._geometries.length=0,this._materials.length=0,this.layerMap=Object.create(null),this._userLayerEnabled=Object.create(null))}},T=class{constructor(e,n={}){if(!e?.isObject3D)throw TypeError(`scene must be a THREE.Object3D`);this.scene=e,this.size=v(n.size,3,`pool size`,e=>Number.isInteger(e)&&e>=1&&e<=64),this._pool=[],this._cameraWorld=new t.Vector3,this._cameraLocal=new t.Vector3;try{for(let e=0;e<this.size;e++){let t=new w({...n,seed:(n.seed??f)+e*7919});t.group.visible=!1,this._pool.push({fx:t,mode:null}),this.scene.add(t.group)}}catch(e){throw this.dispose(),e}}prewarm(e,t){let n=this._pool.find(e=>e.mode===null);if(!n)return!1;let{fx:r}=n,i=r.progress,a=r.group.visible,o=r._lastCamPos.clone(),s=r.group.worldToLocal(t.getWorldPosition(this._cameraLocal));try{r.group.visible=!0;for(let n of[.08,.36,.55,.67])r.setProgress(n,s),e.compile(this.scene,t)}finally{r.setProgress(i,o),r.group.visible=a}return!0}spawn(e,t,n=0){let r=this._pool.find(e=>e.mode===null);return r?(v(n,0,`startProgress`,e=>e>=0&&e<1),r.fx.reset(e,t),r.fx.setProgress(n),r.mode=`timeline`,r.fx):null}fireForward(e,t,n={}){let r=this._pool.find(e=>e.mode===null);return r?(r.fx.launch(e,t,n),r.mode=`launch`,r.fx):null}update(e,t,n=!1){if(!Number.isFinite(e)||e<=0)return;let r=m(t);r&&this._cameraWorld.copy(t);for(let t of this._pool){let{fx:i,mode:a}=t;if(!a)continue;let o=r?i.group.worldToLocal(this._cameraLocal.copy(this._cameraWorld)):void 0;a===`launch`?i.step(e,o)===`done`&&(t.mode=null):!i.group.visible||e>=(1-i.progress)*i.duration&&!n?(i.setProgress(1,o),i.group.visible=!1,t.mode=null):i.update(e,o)}}dispose(){for(let e of this._pool)e.fx.dispose();this._pool.length=0}};let E=Object.freeze({duration:d,seed:f,instances:211}),D=e=>Number.isFinite(e)?t.MathUtils.clamp(e,.25,2):1;function O(e={}){return{size:D(e.size),speed:D(e.speed)}}function k(e,n={}){let{duration:r}=E,i=Object.freeze({start:.476,end:.68,...e.lifecycle}),a=new t.Group;a.name=e.id;let o=new t.Vector3(0,3,9.6),s=new t.Vector3,c=new t.Vector3,l=Object.freeze(O(n)),u,d=0,f=!1;a.scale.setScalar(l.size);function p(){return u||(u=new w({duration:r,seed:e.seed}),a.add(u.group)),u}function h(e){!f&&Number.isFinite(e)&&(d=t.MathUtils.clamp(e,0,r),a.visible=d<r,a.visible&&p().setProgress(d/r,o))}function g(e){!f&&m(e)&&(a.worldToLocal(s.copy(e)),m(s)&&(o.distanceToSquared(s)<1e-10||(o.copy(s),u&&a.visible&&u.setCameraPosition(o))))}return{group:a,lifecycle:i,duration:r,particleCount:E.instances,get settings(){return l},get elapsed(){return d},get finished(){return f||d>=r},get phase(){return this.finished?`finished`:d<i.start?`starting`:d>=r-i.end?`ending`:`active`},seek:h,setCameraPosition:g,render(e,t,n){g(n.getWorldPosition(c)),e.render(t,n)},setLayerVisible(e,t){f||typeof e!=`string`||typeof t!=`boolean`||p().setLayerVisible(e,t)},update(e){!this.finished&&Number.isFinite(e)&&e>0&&h(d+Math.min(e,r/l.speed)*l.speed)},reset(){h(0)},setOptions(e={}){f||(l=Object.freeze(O({...l,...e})),a.scale.setScalar(l.size))},dispose(){f||(f=!0,a.visible=!1,a.removeFromParent(),u?.dispose(),u=null)}}}return e.FLAME_MAGIC_BOLT=E,e.HyperdimensionalSoulFireballPool=T,e.HyperdimensionalSoulFireballVFX=w,e.createFlameMagicBoltEffect=k,e.normalizeFlameMagicBoltOptions=O,e})({},e);t.FLAME_MAGIC_BOLT;var n=t.HyperdimensionalSoulFireballPool,r=t.HyperdimensionalSoulFireballVFX,i=t.createFlameMagicBoltEffect;t.normalizeFlameMagicBoltOptions;var a={size:1,speed:1};function o(e={}){return i({id:`flame-magic-bolt`,seed:20261121,lifecycle:{start:.476,end:.68}},{...a,...e})}export{n as HyperdimensionalSoulFireballPool,r as HyperdimensionalSoulFireballVFX,o as default,a as defaultOptions};