import{r as e}from"./three.module-DxJRsRpu.js";var t=(function(e,t){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});var n=Object.create,r=Object.defineProperty,i=Object.getOwnPropertyDescriptor,a=Object.getOwnPropertyNames,o=Object.getPrototypeOf,s=Object.prototype.hasOwnProperty,c=(e,t,n,o)=>{if(t&&typeof t==`object`||typeof t==`function`)for(var c=a(t),l=0,u=c.length,d;l<u;l++)d=c[l],!s.call(e,d)&&d!==n&&r(e,d,{get:(e=>t[e]).bind(null,d),enumerable:!(o=i(t,d))||o.enumerable});return e};t=((e,t,i)=>(i=e==null?{}:n(o(e)),c(r(i,`default`,{value:e,enumerable:!0}),e)))(t,1);function l(e,t,n,r){return typeof e==`number`&&Number.isFinite(e)?Math.min(n,Math.max(t,e)):r}var u=class e{static THEMES={azure:{name:`蒼藍劍氣`,core:15138815,mid:38399,deep:13260,ink:527386,spark:16755251,light:3718648},crimson:{name:`緋紅獄炎`,core:16773337,mid:16722517,deep:9371677,ink:1705484,spark:16768341,light:16007006},void:{name:`紫電幽冥`,core:16377599,mid:11032055,deep:4988309,ink:1116191,spark:3718648,light:12616956},solar:{name:`聖光金焰`,core:16777215,mid:16498468,deep:11817737,ink:1839621,spark:16773544,light:16638023}};static GLSL_NOISE=`
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float fbm(vec2 p) {
      float f = 0.0;
      f += 0.55 * snoise(p);
      f += 0.30 * snoise(p * 2.13 + vec2(13.7, 7.1));
      f += 0.15 * snoise(p * 4.31 + vec2(3.2, 19.4));
      return f;
    }
  `;constructor(n,r={}){this.scene=n,this.options=Object.assign({theme:`azure`,scale:1,intensity:1.25,duration:1.55,travelDistance:17.5,startZ:0,yLayerOffset:0,enableLights:!0,showInkLines:!0,showDebris:!0,showTrench:!0},r),this.root=new t.Group,this.root.scale.setScalar(this.options.scale),this.scene.add(this.root),this.bladeGroup=new t.Group,this.root.add(this.bladeGroup),this._mat4=new t.Matrix4,this._pos=new t.Vector3,this._scale=new t.Vector3,this._quat=new t.Quaternion,this._euler=new t.Euler,this.active=!1,this.progress=0,this.elapsedTime=0,this._disposables={geometries:[],materials:[]};let i=e.THEMES[this.options.theme]||e.THEMES.azure;this._colors={core:new t.Color(i.core),mid:new t.Color(i.mid),deep:new t.Color(i.deep),ink:new t.Color(i.ink),spark:new t.Color(i.spark),light:new t.Color(i.light)},this._buildLighting(),this._buildCrescentLayers(),this._buildGroundTrenchAndSeam(),this._buildHeadContactVFX(),this._buildLaunchOrigin(),this._buildParticlePools();for(let e of[this.rocksMesh,this.sparksMesh,this.needlesMesh,this.inkLinesMesh,this.starsMesh,this.smokeMesh])e.frustumCulled=!1;this.setProgress(.48)}_trackGeo(e){return this._disposables.geometries.push(e),e}_trackMat(e){return this._disposables.materials.push(e),e}_seededRandom(e){let t=e%2147483647;return t<=0&&(t+=2147483646),()=>(t=t*16807%2147483647,(t-1)/2147483646)}_buildLighting(){this.options.enableLights?(this.bladeLight=new t.PointLight(this._colors.light,4.5,22,1.5),this.bladeLight.position.set(0,2.2,2),this.bladeGroup.add(this.bladeLight),this.originLight=new t.PointLight(this._colors.light,3,14,1.8),this.originLight.position.set(0,1.1,this.options.startZ),this.root.add(this.originLight)):(this.bladeLight=null,this.originLight=null)}_createCrescentGeometry(e,n,r=1,i=1,a=.28){let o=[],s=[],c=[],l=[-1,1],u=(e+1)*(n+1);for(let d=0;d<l.length;d++){let f=l[d];for(let c=0;c<=e;c++){let l=c/e,u=t.MathUtils.lerp(-.12,1.88,l),d=(Math.sin(u)-Math.sin(-.12))*5.25*i,p=Math.cos(u-.16)*3.25*i,m=.42+.58*Math.sin(l**.78*Math.PI*.92+.16),h=8.4*r*m;for(let e=0;e<=n;e++){let t=e/n,r=p-t*h,c=Math.sin(t*Math.PI*.7)*(.28-l*.55)*i,u=Math.max(-.08,d+c),m=Math.sin(l*Math.PI*.95+.05),g=f*t**.75*a*(.35+.65*m);o.push(g,u,r),s.push(l,t)}}let p=d*u;for(let t=0;t<e;t++)for(let e=0;e<n;e++){let r=p+t*(n+1)+e,i=r+1,a=r+(n+1),o=a+1;f>0?c.push(r,i,o,r,o,a):c.push(r,o,i,r,a,o)}}let d=new t.BufferGeometry;return d.setAttribute(`position`,new t.Float32BufferAttribute(o,3)),d.setAttribute(`uv`,new t.Float32BufferAttribute(s,2)),d.setIndex(c),d.computeVertexNormals(),this._trackGeo(d)}_buildCrescentLayers(){let n=this._createCrescentGeometry(44,24,1,1,.24);this.bladeMaterial=this._trackMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uFade:{value:1},uIntensity:{value:this.options.intensity},uColorCore:{value:this._colors.core},uColorMid:{value:this._colors.mid},uColorDeep:{value:this._colors.deep}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uFade;
        uniform float uIntensity;
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        uniform vec3 uColorDeep;
        varying vec2 vUv;
        ${e.GLSL_NOISE}

        void main() {
          float u = vUv.x; // 0 = ground tip, 1 = upper swept tip
          float v = vUv.y; // 0 = leading edge, 1 = trailing wake

          // High-speed horizontally stretched wind streaks flowing backward
          float streak1 = snoise(vec2(u * 14.0, v * 2.6 - uTime * 8.5));
          float streak2 = snoise(vec2(u * 28.0 + 4.1, v * 4.5 - uTime * 13.0));
          float wisps = fbm(vec2(u * 7.0, v * 2.2 - uTime * 6.0));

          // Leading edge thickness tapers smoothly toward upper tip
          float edgeThickness = mix(0.11, 0.045, pow(u, 1.2));
          float edgeDist = v + streak1 * 0.014;
          float hotCore = smoothstep(edgeThickness, 0.0, edgeDist);
          float crispRim = smoothstep(edgeThickness * 0.48, 0.0, edgeDist);

          // Ground friction boost near u = 0
          float groundHotspot = smoothstep(0.22, 0.0, u) * smoothstep(0.45, 0.0, v);

          // Trailing energy body with stylized wind-ripped dissolve
          float tailFade = smoothstep(1.0, 0.08, v + wisps * 0.34);
          float streakBands = smoothstep(-0.25, 0.72, streak1 * 0.65 + streak2 * 0.35);
          float bodyEnergy = tailFade * (0.38 + 0.75 * streakBands);

          // Feather fade at extreme top tip (u -> 1) and soft plasma melt at ground contact (u -> 0)
          float topFeather = smoothstep(1.0, 0.78, u + v * 0.16);
          float bottomEdge = smoothstep(0.0, 0.055, u + streak1 * 0.012);

          // Color composition: Deep Blue -> Electric Cyan -> Blinding White Core
          vec3 col = mix(uColorDeep, uColorMid, clamp(bodyEnergy * 1.15 + hotCore * 0.6, 0.0, 1.0));
          col = mix(col, uColorCore * 1.65, clamp(hotCore * 0.92 + crispRim * 0.65 + groundHotspot * 0.75, 0.0, 1.0));

          // Extra glowing streak highlights inside wake
          float fineHighlight = smoothstep(0.55, 0.88, streak2) * smoothstep(0.85, 0.05, v) * 0.55;
          col += uColorCore * fineHighlight;

          float alpha = clamp((hotCore * 1.15 + bodyEnergy * 0.78 + groundHotspot * 0.65) * topFeather * bottomEdge, 0.0, 1.0);
          alpha *= uFade;
          if (alpha < 0.015) discard;

          gl_FragColor = vec4(col * uIntensity, alpha);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide,blending:t.AdditiveBlending})),this.bladeMesh=new t.Mesh(n,this.bladeMaterial),this.bladeGroup.add(this.bladeMesh);let r=this._createCrescentGeometry(32,16,1.12,1.045,.58);this.auraMaterial=this._trackMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uFade:{value:1},uIntensity:{value:this.options.intensity},uColorCore:{value:this._colors.core},uColorMid:{value:this._colors.mid}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uFade;
        uniform float uIntensity;
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        varying vec2 vUv;
        ${e.GLSL_NOISE}

        void main() {
          float u = vUv.x;
          float v = vUv.y;
          float n = snoise(vec2(u * 6.0, v * 2.0 - uTime * 5.0));
          float edgeGlow = exp(-v * 4.2) * (0.65 + 0.35 * smoothstep(0.85, 0.0, u));
          float softBody = smoothstep(0.95, 0.0, v + n * 0.25) * 0.22;
          float tipMask = smoothstep(1.0, 0.72, u);
          float bottomMask = smoothstep(0.0, 0.07, u + n * 0.015);
          vec3 col = mix(uColorMid, uColorCore, exp(-v * 9.0) * 0.7);
          float alpha = (edgeGlow * 0.42 + softBody) * tipMask * bottomMask * uFade;
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(col * uIntensity, alpha);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide,blending:t.AdditiveBlending})),this.auraMesh=new t.Mesh(r,this.auraMaterial),this.bladeGroup.add(this.auraMesh);let i=this._createCrescentGeometry(36,16,.88,.96,.32);this.inkVeilMaterial=this._trackMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uFade:{value:1},uColorInk:{value:this._colors.ink}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uFade;
        uniform vec3 uColorInk;
        varying vec2 vUv;
        ${e.GLSL_NOISE}

        void main() {
          float u = vUv.x;
          float v = vUv.y;

          // Only appears behind the blinding leading edge
          float bandMask = smoothstep(0.11, 0.22, v) * smoothstep(0.86, 0.32, v);
          float arcMask = smoothstep(0.05, 0.20, u) * smoothstep(0.90, 0.65, u);

          // Sharp anime ink flame / tear silhouettes via cel-stepped FBM
          float n1 = snoise(vec2(u * 10.0, v * 3.8 - uTime * 7.2));
          float n2 = snoise(vec2(u * 21.0 + 3.0, v * 6.5 - uTime * 10.5));
          float shape = n1 * 0.65 + n2 * 0.35;

          float inkBlob = smoothstep(0.32, 0.42, shape) * bandMask * arcMask;
          float alpha = inkBlob * 0.68 * uFade;
          if (alpha < 0.02) discard;

          gl_FragColor = vec4(uColorInk, alpha);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide,blending:t.NormalBlending})),this.inkVeilMesh=new t.Mesh(i,this.inkVeilMaterial),this.inkVeilMesh.renderOrder=-1,this.bladeGroup.add(this.inkVeilMesh);let a=this._trackGeo(new t.PlaneGeometry(1,1,28,6)),o=a.attributes.position;for(let e=0;e<o.count;e++){let t=o.getX(e)+.5,n=o.getY(e),r=-.35-t*10.5,i=6-t**1.35*1.45+Math.sin(t*4.2)*.28+n*(1.25-t*.7),a=Math.sin(t*3.5)*.35+n*.22;o.setXYZ(e,a,i,r)}a.computeVertexNormals(),this.ribbonMaterial=this._trackMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uFade:{value:1},uIntensity:{value:this.options.intensity},uColorCore:{value:this._colors.core},uColorMid:{value:this._colors.mid}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uFade;
        uniform float uIntensity;
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        varying vec2 vUv;
        ${e.GLSL_NOISE}

        void main() {
          float t = vUv.x;
          float w = abs(vUv.y - 0.5) * 2.0;
          float n = snoise(vec2(t * 5.0 - uTime * 7.5, vUv.y * 4.5));
          float ribbon = smoothstep(1.0, 0.0, w + n * 0.38);
          float lengthMask = smoothstep(0.0, 0.12, t) * smoothstep(1.0, 0.15, t);
          vec3 col = mix(uColorMid, uColorCore, smoothstep(0.65, 0.0, w) * 0.55);
          float alpha = ribbon * lengthMask * 0.52 * uFade;
          if (alpha < 0.015) discard;
          gl_FragColor = vec4(col * uIntensity, alpha);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide,blending:t.AdditiveBlending})),this.ribbonMesh=new t.Mesh(a,this.ribbonMaterial),this.bladeGroup.add(this.ribbonMesh)}_buildGroundTrenchAndSeam(){let n=this.options.travelDistance+10.5,r=this._trackGeo(new t.PlaneGeometry(5.5,n,1,1));r.rotateX(-Math.PI/2),r.translate(0,0,this.options.startZ+this.options.travelDistance*.55),this.trenchMaterial=this._trackMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uStartZ:{value:this.options.startZ},uBladeTipZ:{value:0},uFade:{value:1},uColorCore:{value:this._colors.core},uColorMid:{value:this._colors.mid},uColorSpark:{value:this._colors.spark}},vertexShader:`
        varying vec3 vLocal;
        void main() {
          vLocal = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uStartZ;
        uniform float uBladeTipZ;
        uniform float uFade;
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        uniform vec3 uColorSpark;
        varying vec3 vLocal;
        ${e.GLSL_NOISE}

        void main() {
          float z = vLocal.z;
          float x = abs(vLocal.x);

          // Strictly clip trench so ground cracks never extend ahead of the sword wave cutting edge
          if (z > uBladeTipZ || z < uStartZ - 0.5) discard;

          float distBehind = max(0.0, uBladeTipZ - z);
          float startCap = smoothstep(uStartZ - 0.5, uStartZ + 0.7, z);
          float frontCap = smoothstep(uBladeTipZ, uBladeTipZ - 0.55, z);

          // Rugged torn ground width tapering sharply into the blade's cutting point
          float edgeNoise = snoise(vec2(z * 0.75, 1.7)) * 0.34 + snoise(vec2(z * 2.1, 4.2)) * 0.14;
          float width = (1.15 + edgeNoise) * (0.14 + 0.86 * frontCap);
          float trenchMask = smoothstep(width, width * 0.12, x) * startCap * smoothstep(uBladeTipZ, uBladeTipZ - 0.18, z);
          if (trenchMask < 0.02) discard;

          // Charred earth texture & angular rock cracks
          float crackPattern = abs(snoise(vec2(vLocal.x * 2.4, z * 1.45)));
          float cracks = smoothstep(0.14, 0.02, crackPattern);

          // Recency glow decays behind moving blade; keep center fissure subtle & ultra-thin
          float recency = exp(-distBehind * 0.12);
          float thinFissure = smoothstep(0.055, 0.0, x) * recency * frontCap;

          vec3 scorched = vec3(0.04, 0.045, 0.06);
          vec3 emberGlow = mix(uColorMid, uColorSpark, 0.35) * cracks * recency * 1.35;
          vec3 fissureGlow = mix(uColorMid, uColorCore, 0.65) * thinFissure * 0.95;

          vec3 col = scorched + emberGlow + fissureGlow;
          float alpha = clamp(trenchMask * 0.88 + thinFissure * 0.3, 0.0, 1.0) * uFade;
          gl_FragColor = vec4(col, alpha);
        }
      `,transparent:!0,depthWrite:!1})),this.trenchMesh=new t.Mesh(r,this.trenchMaterial),this.trenchMesh.position.set(0,.02+this.options.yLayerOffset,0),this.root.add(this.trenchMesh);let i=this._trackGeo(new t.PlaneGeometry(.62,13.5,1,1));i.rotateX(-Math.PI/2),i.translate(0,.055+this.options.yLayerOffset,-3.7),this.seamMaterial=this._trackMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uFade:{value:1},uMaxTrailLen:{value:13.5},uIntensity:{value:this.options.intensity},uColorCore:{value:this._colors.core},uColorMid:{value:this._colors.mid}},vertexShader:`
        varying vec2 vUv;
        varying float vLocalZ;
        void main() {
          vUv = uv;
          vLocalZ = position.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uFade;
        uniform float uMaxTrailLen;
        uniform float uIntensity;
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        varying vec2 vUv;
        varying float vLocalZ;
        ${e.GLSL_NOISE}

        void main() {
          // Exact distance behind the blade's ground cutting tip (+3.05 in bladeGroup space)
          float distBehind = 3.05 - vLocalZ;
          if (distBehind < 0.0 || distBehind > uMaxTrailLen) discard;

          // tailToHead: 1.0 at blade contact tip -> 0.0 at sharp needle tail
          float tailToHead = clamp(1.0 - distBehind / uMaxTrailLen, 0.0, 1.0);
          float headToTail = 1.0 - tailToHead;

          // Concave needle profile: 1/3 thickness at front, tapering to an ultra-fine pointed tail
          float frontPinch = smoothstep(0.0, 0.035, headToTail);
          float needleProfile = pow(tailToHead, 1.85);
          float currentHalfWidth = max(0.012, needleProfile * (0.45 + 0.55 * frontPinch));

          float x = abs(vUv.x - 0.5) * 2.0;
          float flicker = snoise(vec2(distBehind * 2.2 - uTime * 16.0, 2.0)) * 0.08 * needleProfile;
          float nx = max(0.0, x - abs(flicker) * 0.2) / currentHalfWidth;

          // Razor-sharp white core + tight electric cyan halo
          float coreLine = smoothstep(0.40, 0.0, nx);
          float tightHalo = exp(-nx * 3.6) * 0.45;
          float tailTipFade = smoothstep(0.0, 0.07, tailToHead);

          // Compact bright hotspot tucked right beneath the blade's bottom edge
          float tipFlare = exp(-length(vec2(x * 2.8, headToTail * 15.0)) * 2.5) * 0.9 * frontPinch;

          vec3 col = mix(uColorMid, uColorCore * 1.55, clamp(coreLine * 0.92 + tipFlare * 0.5, 0.0, 1.0));
          float alpha = clamp((coreLine + tightHalo) * tailTipFade + tipFlare, 0.0, 1.0) * uFade;
          if (alpha < 0.015) discard;

          gl_FragColor = vec4(col * uIntensity, alpha);
        }
      `,transparent:!0,depthWrite:!1,blending:t.AdditiveBlending})),this.seamMesh=new t.Mesh(i,this.seamMaterial),this.bladeGroup.add(this.seamMesh)}_buildHeadContactVFX(){let n=this._trackGeo(new t.PlaneGeometry(3.8,4.8,1,1));n.rotateX(-Math.PI/2),n.translate(0,.075+this.options.yLayerOffset,2.25),this.headPlowMat=this._trackMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uFade:{value:1},uIntensity:{value:this.options.intensity},uColorCore:{value:this._colors.core},uColorMid:{value:this._colors.mid},uColorSpark:{value:this._colors.spark}},vertexShader:`
        varying vec3 vLocal;
        void main() {
          vLocal = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uFade;
        uniform float uIntensity;
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        uniform vec3 uColorSpark;
        varying vec3 vLocal;
        ${e.GLSL_NOISE}

        void main() {
          // Local coordinates relative to the blade's front ground-cutting nose (z ≈ 3.16)
          float dz = 3.18 - vLocal.z;
          float ax = abs(vLocal.x);

          // High-speed rushing energy turbulence sweeping backward from nose
          float n1 = snoise(vec2(vLocal.x * 2.8, dz * 2.2 - uTime * 15.0));
          float n2 = snoise(vec2(vLocal.x * 6.2 + 3.1, dz * 4.0 - uTime * 22.0));

          // Forward incandescent plasma cushion right around the cutting junction
          float noseDist = length(vec2(ax * 1.45, (dz - 0.12) * 0.92));
          float nosePool = exp(-noseDist * (2.65 - n1 * 0.42));
          float noseHot = exp(-noseDist * 5.2);

          // Supersonic V-shaped bow-wave wings sweeping backward along both flanks
          float wingActive = smoothstep(-0.32, 0.18, dz) * smoothstep(3.15, 0.45, dz);
          float wingCurve = 0.14 + pow(max(0.0, dz + 0.12), 0.74) * 0.64;
          float wingDist = abs(ax - wingCurve + n1 * 0.11);
          float bowWing = exp(-wingDist * 5.6) * wingActive * (0.65 + 0.45 * smoothstep(-0.3, 0.7, n2));

          // Electric crackle accents hugging the contact edge
          float crackle = smoothstep(0.58, 0.90, n2) * exp(-noseDist * 2.0) * 0.45;

          float alpha = clamp(nosePool * 0.85 + bowWing * 0.72 + crackle, 0.0, 1.0);
          // Smooth elliptical fade at plane boundaries
          float bounds = smoothstep(1.88, 1.15, ax) * smoothstep(-1.15, -0.35, dz) * smoothstep(3.25, 1.8, dz);
          alpha *= bounds * uFade;
          if (alpha < 0.015) discard;

          vec3 col = mix(uColorMid, uColorCore * 1.6, clamp(noseHot * 0.95 + bowWing * 0.45 + nosePool * 0.35, 0.0, 1.0));
          col += uColorSpark * crackle * 0.55;
          gl_FragColor = vec4(col * uIntensity, alpha);
        }
      `,transparent:!0,depthWrite:!1,blending:t.AdditiveBlending})),this.headPlowMesh=new t.Mesh(n,this.headPlowMat),this.headPlowMesh.renderOrder=4,this.bladeGroup.add(this.headPlowMesh);let r=[],i=[],a=[],o=[-1,1];for(let e=0;e<o.length;e++){let t=o[e];for(let e=0;e<=14;e++){let n=e/14;for(let e=0;e<=16;e++){let a=e/16,o=3.38-a*3.15-n*.55,s=.04+n*(.26+Math.sin(a**.7*Math.PI*.82)*1.48),c=.05+a**.82*.88+n**1.15*(.34+a*.52);r.push(t*c,s,o),i.push(n,a)}}let n=e*255;for(let e=0;e<14;e++)for(let r=0;r<16;r++){let i=n+e*17+r,o=i+1,s=i+17,c=s+1;t>0?a.push(i,o,c,i,c,s):a.push(i,c,o,i,s,c)}}let s=new t.BufferGeometry;s.setAttribute(`position`,new t.Float32BufferAttribute(r,3)),s.setAttribute(`uv`,new t.Float32BufferAttribute(i,2)),s.setIndex(a),s.computeVertexNormals(),this._trackGeo(s),this.headSplashMat=this._trackMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uFade:{value:1},uIntensity:{value:this.options.intensity},uColorCore:{value:this._colors.core},uColorMid:{value:this._colors.mid}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uFade;
        uniform float uIntensity;
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        varying vec2 vUv;
        ${e.GLSL_NOISE}

        void main() {
          float u = vUv.x;
          float v = vUv.y;

          // Rushing anime energy spray streaks tearing upward & backward
          float s1 = snoise(vec2(u * 8.5, v * 3.5 - uTime * 16.0));
          float s2 = snoise(vec2(u * 18.0 + 2.4, v * 6.5 - uTime * 23.0));
          float wisps = s1 * 0.65 + s2 * 0.35;

          float frontIn = smoothstep(0.0, 0.09, v);
          float backOut = smoothstep(1.0, 0.14, v + wisps * 0.34);
          float topOut = smoothstep(1.0, 0.12, u + wisps * 0.36);
          float baseHot = smoothstep(0.38, 0.0, u) * smoothstep(0.55, 0.0, v);

          float bands = smoothstep(-0.22, 0.68, wisps);
          float alpha = (baseHot * 0.92 + frontIn * backOut * topOut * (0.36 + 0.72 * bands)) * frontIn * topOut;
          alpha = clamp(alpha, 0.0, 1.0) * 0.85 * uFade;
          if (alpha < 0.015) discard;

          vec3 col = mix(uColorMid, uColorCore * 1.55, clamp(baseHot * 0.85 + smoothstep(0.45, 0.88, s2) * 0.45, 0.0, 1.0));
          gl_FragColor = vec4(col * uIntensity, alpha);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide,blending:t.AdditiveBlending})),this.headSplashMesh=new t.Mesh(s,this.headSplashMat),this.headSplashMesh.renderOrder=4,this.bladeGroup.add(this.headSplashMesh);let c=this._trackGeo(new t.PlaneGeometry(3.2,2.3));this.headFlareMat=this._trackMat(new t.ShaderMaterial({uniforms:{uTime:{value:0},uFade:{value:1},uIntensity:{value:this.options.intensity},uColorCore:{value:this._colors.core},uColorMid:{value:this._colors.mid},uColorSpark:{value:this._colors.spark}},vertexShader:`
        varying vec2 vUv;
        varying float vWorldY;
        void main() {
          vUv = uv;
          vec4 center = modelViewMatrix[3];
          vec2 offset = position.xy * vec2(length(modelViewMatrix[0].xyz), length(modelViewMatrix[1].xyz));
          vWorldY = modelMatrix[3].y + dot(offset, viewMatrix[1].xy);
          center.xy += offset;
          gl_Position = projectionMatrix * center;
        }
      `,fragmentShader:`
        uniform float uTime;
        uniform float uFade;
        uniform float uIntensity;
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        uniform vec3 uColorSpark;
        varying vec2 vUv;
        varying float vWorldY;
        ${e.GLSL_NOISE}

        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          if (r > 1.0) discard;

          float ang = atan(p.y, p.x);
          float boil = snoise(vec2(ang * 3.0, r * 4.2 - uTime * 12.0));
          float rayFlicker = 0.5 + 0.5 * snoise(vec2(ang * 7.5 + uTime * 4.0, 1.7));

          // Boiling plasma core directly masking the blade-to-ground corner
          float core = exp(-r * (4.5 - boil * 0.65));
          // Crisp horizontal anamorphic energy flare skimming above the floor
          float hStreak = exp(-abs(p.y) * 12.5) * exp(-abs(p.x) * 1.95) * (0.78 + 0.22 * rayFlicker);
          // Subtle diagonal anime impact star rays
          float diagRays = (exp(-abs(p.x - p.y) * 14.0) + exp(-abs(p.x + p.y) * 14.0)) * exp(-r * 2.9);
          float outerHalo = exp(-r * 2.15) * 0.44;

          // Soft world-Y ground feather avoids any flat billboard-floor intersection line
          float groundSoft = smoothstep(-0.01, 0.24, vWorldY);
          float edgeFade = smoothstep(1.0, 0.34, r);

          float alpha = clamp((core * 1.15 + hStreak * 0.85 + diagRays * 0.32 + outerHalo) * edgeFade * groundSoft, 0.0, 1.0) * uFade;
          if (alpha < 0.015) discard;

          vec3 col = mix(uColorMid, uColorCore * 1.65, clamp(core * 0.92 + hStreak * 0.62, 0.0, 1.0));
          col += uColorSpark * smoothstep(0.62, 1.0, rayFlicker) * exp(-r * 3.6) * 0.32;
          gl_FragColor = vec4(col * uIntensity, alpha);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide,blending:t.AdditiveBlending})),this.headFlareMesh=new t.Mesh(c,this.headFlareMat),this.headFlareMesh.frustumCulled=!1,this.headFlareMesh.position.set(0,.28,3.16),this.headFlareMesh.renderOrder=5,this.bladeGroup.add(this.headFlareMesh)}_buildLaunchOrigin(){let e=this._trackGeo(new t.PlaneGeometry(3.6,1.4));e.rotateX(-Math.PI/2),this.originBurstMat=this._trackMat(new t.ShaderMaterial({uniforms:{uAlpha:{value:1},uIntensity:{value:this.options.intensity},uColorCore:{value:this._colors.core},uColorMid:{value:this._colors.mid}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform float uAlpha;
        uniform float uIntensity;
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        varying vec2 vUv;
        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float d = length(vec2(p.x * 1.0, p.y * 1.8));
          float core = exp(-d * 4.5);
          float glow = exp(-d * 1.9) * 0.6;
          vec3 col = mix(uColorMid, uColorCore * 1.5, core);
          float a = clamp(core + glow, 0.0, 1.0) * uAlpha;
          if (a < 0.015) discard;
          gl_FragColor = vec4(col * uIntensity, a);
        }
      `,transparent:!0,depthWrite:!1,blending:t.AdditiveBlending})),this.originBurstMesh=new t.Mesh(e,this.originBurstMat),this.originBurstMesh.position.set(0,.07+this.options.yLayerOffset,this.options.startZ+.8),this.originBurstMesh.rotation.y=Math.PI*.5,this.root.add(this.originBurstMesh)}_buildParticlePools(){let e=this._seededRandom(202607);this.maxRocks=58;let n=this._trackGeo(new t.IcosahedronGeometry(.18,0)),r=n.attributes.position;for(let e=0;e<r.count;e++){let t=r.getX(e),n=r.getY(e),i=r.getZ(e),a=.78+e*37%10*.045;r.setXYZ(e,t*a*1.15,n*a*.82,i*a*1.05)}n.computeVertexNormals(),this.rockMat=this._trackMat(new t.MeshStandardMaterial({color:3882826,roughness:.88,metalness:.12,flatShading:!0})),this.rocksMesh=new t.InstancedMesh(n,this.rockMat,this.maxRocks),this.rocksMesh.instanceMatrix.setUsage(t.DynamicDrawUsage),this.root.add(this.rocksMesh),this.rocksData=[];for(let n=0;n<this.maxRocks;n++){let r=n%2==0?1:-1,i=e()*.64,a=1-.42*t.MathUtils.smoothstep(i,.34,.64);this.rocksData.push({spawnP:i,side:r,x0:r*(.28+e()*.62),y0:.1+e()*.16,zOffset:(e()-.5)*.75,vx:r*(1.2+e()*2.8)*a,vy:(2.9+e()*4.4)*a,vz:-(1+e()*3.2)*a,rot0:new t.Vector3(e()*6,e()*6,e()*6),rotVel:new t.Vector3((e()-.5)*14,(e()-.5)*14,(e()-.5)*14),scale:(.45+e()*1.25)*(.72+.28*a),life:.52+e()*.38})}this.maxSparks=72;let i=this._trackGeo(new t.PlaneGeometry(.075,.95));i.rotateX(Math.PI/2),this.sparkMat=this._trackMat(new t.ShaderMaterial({uniforms:{uColorSpark:{value:this._colors.spark},uIntensity:{value:this.options.intensity}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform vec3 uColorSpark;
        uniform float uIntensity;
        varying vec2 vUv;
        void main() {
          float w = abs(vUv.x - 0.5) * 2.0;
          float l = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.3, vUv.y);
          float core = smoothstep(1.0, 0.0, w) * l;
          if (core < 0.05) discard;
          vec3 col = mix(uColorSpark, vec3(1.0, 0.98, 0.88), core * 0.7);
          gl_FragColor = vec4(col * 1.6 * uIntensity, core);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide,blending:t.AdditiveBlending})),this.sparksMesh=new t.InstancedMesh(i,this.sparkMat,this.maxSparks),this.sparksMesh.instanceMatrix.setUsage(t.DynamicDrawUsage),this.root.add(this.sparksMesh),this.sparksData=[];for(let t=0;t<this.maxSparks;t++)this.sparksData.push({spawnP:e()*.7,x0:(e()-.5)*.75,y0:.1+e()*.45,vx:(e()-.5)*3.8,vy:1.5+e()*4,vz:-(6.5+e()*9),scale:.55+e()*1.15,life:.18+e()*.28});this.maxNeedles=46;let a=this._trackGeo(new t.PlaneGeometry(.06,3.6));a.rotateX(Math.PI/2),this.needleMat=this._trackMat(new t.ShaderMaterial({uniforms:{uColorCore:{value:this._colors.core},uColorMid:{value:this._colors.mid},uIntensity:{value:this.options.intensity}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        uniform float uIntensity;
        varying vec2 vUv;
        void main() {
          float w = smoothstep(0.5, 0.0, abs(vUv.x - 0.5));
          float l = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.2, vUv.y);
          float a = w * l;
          if (a < 0.03) discard;
          vec3 col = mix(uColorMid, uColorCore * 1.5, w * 0.75);
          gl_FragColor = vec4(col * uIntensity, a * 0.9);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide,blending:t.AdditiveBlending})),this.needlesMesh=new t.InstancedMesh(a,this.needleMat,this.maxNeedles),this.needlesMesh.instanceMatrix.setUsage(t.DynamicDrawUsage),this.root.add(this.needlesMesh),this.needlesData=[];for(let t=0;t<this.maxNeedles;t++)this.needlesData.push({phase:e(),x:(e()-.5)*2.2,y:.35+e()*5.2,zLag:-(.8+e()*8.5),speed:4+e()*7,lenScale:.55+e()*1.45,roll:e()*Math.PI});this.maxInkLines=22;let o=this._trackGeo(new t.PlaneGeometry(.22,5.2));o.rotateX(Math.PI/2),this.inkLineMat=this._trackMat(new t.ShaderMaterial({uniforms:{uColorInk:{value:this._colors.ink},uColorAccent:{value:this._colors.mid}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        }
      `,fragmentShader:`
        uniform vec3 uColorInk;
        uniform vec3 uColorAccent;
        varying vec2 vUv;
        void main() {
          // A tapered ink stroke with a muted rim that reads on dark stages.
          float taper = mix(0.30, 1.0, smoothstep(0.0, 0.74, vUv.y));
          float crossStroke = (vUv.x * 2.0 - 1.0) / taper;
          float x = abs(crossStroke);
          float edgeSoftness = clamp(fwidth(crossStroke) * 0.55, 0.08, 0.32);
          float coverage = (1.0 - smoothstep(0.84 - edgeSoftness, 0.84 + edgeSoftness, x))
            * smoothstep(0.0, 0.18, vUv.y) * (1.0 - smoothstep(0.82, 1.0, vUv.y));
          float rim = smoothstep(0.24, 0.64 + edgeSoftness * 0.5, x);
          float a = coverage * mix(0.91, 0.70, rim);
          if (a < 0.05) discard;
          vec3 color = mix(uColorInk, mix(vec3(0.42, 0.47, 0.55), uColorAccent, 0.24), rim);
          gl_FragColor = vec4(color, a);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide})),this.inkLinesMesh=new t.InstancedMesh(o,this.inkLineMat,this.maxInkLines),this.inkLinesMesh.renderOrder=-2,this.inkLinesMesh.instanceMatrix.setUsage(t.DynamicDrawUsage),this.root.add(this.inkLinesMesh),this.inkLinesData=[];for(let t=0;t<this.maxInkLines;t++)this.inkLinesData.push({phase:e(),x:(e()-.5)*2.6,y:1.8+e()*4.4,zLag:-(2+e()*10),speed:3+e()*5,lenScale:.65+e()*1.35,pitch:-.06+(e()-.5)*.14});this.maxStars=38;let s=this._trackGeo(new t.PlaneGeometry(.68,.68));this.starMat=this._trackMat(new t.ShaderMaterial({uniforms:{uColorCore:{value:this._colors.core},uColorMid:{value:this._colors.mid},uIntensity:{value:this.options.intensity}},vertexShader:`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          mat4 mv = modelViewMatrix * instanceMatrix;
          vec4 center = mv[3];
          center.xy += position.xy * vec2(length(mv[0].xyz), length(mv[1].xyz));
          gl_Position = projectionMatrix * center;
        }
      `,fragmentShader:`
        uniform vec3 uColorCore;
        uniform vec3 uColorMid;
        uniform float uIntensity;
        varying vec2 vUv;
        void main() {
          vec2 p = abs(vUv - 0.5) * 2.0;
          float rays = 0.055 / (p.x * p.y + 0.022) * smoothstep(1.0, 0.05, max(p.x, p.y));
          float core = smoothstep(0.32, 0.0, length(p));
          float alpha = clamp(rays * 0.38 + core, 0.0, 1.0);
          if (alpha < 0.04) discard;
          vec3 col = mix(uColorMid, uColorCore * 1.6, clamp(core + rays * 0.35, 0.0, 1.0));
          gl_FragColor = vec4(col * uIntensity, alpha);
        }
      `,transparent:!0,depthWrite:!1,side:t.DoubleSide,blending:t.AdditiveBlending})),this.starsMesh=new t.InstancedMesh(s,this.starMat,this.maxStars),this.starsMesh.instanceMatrix.setUsage(t.DynamicDrawUsage),this.root.add(this.starsMesh),this.starsData=[];for(let t=0;t<this.maxStars;t++)this.starsData.push({x:(e()-.5)*3.4,y:.4+e()*5.6,zLag:-(.3+e()*11.5),twinkleFreq:6+e()*10,twinklePhase:e()*Math.PI*2,scale:.35+e()*1.05});this.maxSmoke=18;let c=this._trackGeo(new t.IcosahedronGeometry(.75,1));this.smokeMat=this._trackMat(new t.MeshBasicMaterial({color:6583435,transparent:!0,opacity:.18,depthWrite:!1})),this.smokeMesh=new t.InstancedMesh(c,this.smokeMat,this.maxSmoke),this.smokeMesh.instanceMatrix.setUsage(t.DynamicDrawUsage),this.root.add(this.smokeMesh),this.smokeData=[];for(let t=0;t<this.maxSmoke;t++){let n=t/this.maxSmoke*Math.PI*1.4-Math.PI*.2;this.smokeData.push({x0:(e()-.5)*1.4,y0:.5+Math.sin(n)*1.6+e()*.6,z0:this.options.startZ-.6-e()*1.8,vx:(e()-.5)*1.8,vy:.5+e()*1.6,vz:-(1.2+e()*2.2),baseScale:.55+e()*1})}}trigger(e=null,t=0){e&&this.root.position.copy(e),this.root.rotation.y=t,this.active=!0,this.progress=0,this.setProgress(0)}setTheme(t){let n=e.THEMES[t];n&&(this.options.theme=t,this._colors.core.setHex(n.core),this._colors.mid.setHex(n.mid),this._colors.deep.setHex(n.deep),this._colors.ink.setHex(n.ink),this._colors.spark.setHex(n.spark),this._colors.light.setHex(n.light),this.bladeLight&&this.bladeLight.color.copy(this._colors.light),this.originLight&&this.originLight.color.copy(this._colors.light))}setScale(e){this.options.scale=e,this.root.scale.setScalar(e)}setIntensity(e){this.options.intensity=e,this.bladeMaterial.uniforms.uIntensity.value=e,this.auraMaterial.uniforms.uIntensity.value=e,this.ribbonMaterial.uniforms.uIntensity.value=e,this.seamMaterial.uniforms.uIntensity.value=e,this.headPlowMat.uniforms.uIntensity.value=e,this.headSplashMat.uniforms.uIntensity.value=e,this.headFlareMat.uniforms.uIntensity.value=e,this.originBurstMat.uniforms.uIntensity.value=e,this.sparkMat.uniforms.uIntensity.value=e,this.needleMat.uniforms.uIntensity.value=e,this.starMat.uniforms.uIntensity.value=e}setLayerVisibility({inkLines:e,debris:t,trench:n}={}){typeof e==`boolean`&&(this.options.showInkLines=e,this.inkLinesMesh.visible=e,this.inkVeilMesh.visible=e),typeof t==`boolean`&&(this.options.showDebris=t,this.rocksMesh.visible=t,this.sparksMesh.visible=t),typeof n==`boolean`&&(this.options.showTrench=n,this.trenchMesh.visible=n)}setProgress(e,n=null){this.progress=t.MathUtils.clamp(e,0,1);let r=this.progress*this.options.duration,i=1-(1-Math.min(this.progress/.86,1))**1.52,a=this.options.startZ+i*this.options.travelDistance,o=t.MathUtils.smoothstep(this.progress,0,.05),s=o*(1-t.MathUtils.smoothstep(this.progress,.64,.85)),c=.72+.28*t.MathUtils.smoothstep(this.progress,0,.15),l=.85+.15*c;this.bladeGroup.position.set(0,0,a),this.bladeGroup.scale.set(1,c,l),this.bladeLight&&(this.bladeLight.intensity=4.6*s*this.options.intensity),this.originLight&&(this.originLight.intensity=3.4*(1-t.MathUtils.smoothstep(this.progress,.05,.46)));let u=r*1.15;this.bladeMaterial.uniforms.uTime.value=u,this.bladeMaterial.uniforms.uFade.value=s,this.auraMaterial.uniforms.uTime.value=u,this.auraMaterial.uniforms.uFade.value=s,this.inkVeilMaterial.uniforms.uTime.value=u,this.inkVeilMaterial.uniforms.uFade.value=s,this.ribbonMaterial.uniforms.uTime.value=u,this.ribbonMaterial.uniforms.uFade.value=s,this.seamMaterial.uniforms.uTime.value=u,this.seamMaterial.uniforms.uFade.value=s,this.headPlowMat.uniforms.uTime.value=u,this.headPlowMat.uniforms.uFade.value=s,this.headSplashMat.uniforms.uTime.value=u,this.headSplashMat.uniforms.uFade.value=s,this.headFlareMat.uniforms.uTime.value=u,this.headFlareMat.uniforms.uFade.value=s;let d=.92+.14*Math.sin(r*36);this.headFlareMesh.scale.set(d,d,1);let f=a+3.05*l,p=Math.max(.45,Math.min(13.5,(f-(this.options.startZ-.15))/l));this.seamMaterial.uniforms.uMaxTrailLen.value=p;let m=o*(1-t.MathUtils.smoothstep(this.progress,.72,.97));this.trenchMaterial.uniforms.uTime.value=u,this.trenchMaterial.uniforms.uBladeTipZ.value=f,this.trenchMaterial.uniforms.uFade.value=m;let h=Math.min(this.progress*2.2,1);this.originBurstMat.uniforms.uAlpha.value=o*(1-t.MathUtils.smoothstep(this.progress,.08,.5)),this.originBurstMesh.scale.setScalar(.8+h*.7),this._updateDeterministicParticles(r,a,f,s,n)}_updateDeterministicParticles(e,n,r,i,a){let o=this.options.duration;if(this.rocksMesh.visible){let n=o*.97;for(let r=0;r<this.maxRocks;r++){let i=this.rocksData[r],a=i.spawnP*o,s=Math.min(i.life,Math.max(.18,n-a)),c=e-a;if(c>0&&c<s){let e=1-(1-Math.min(i.spawnP/.86,1))**1.52,n=this.options.startZ+e*this.options.travelDistance+2.45+i.zOffset,r=.09,a=Math.sqrt(i.vy*i.vy+44*Math.max(0,i.y0-r)),o=(i.vy+a)/22,l,u,d,f;if(c<=o)l=i.x0+i.vx*c,u=i.y0+i.vy*c-11*c*c,d=n+i.vz*c,f=c;else{let e=c-o,t=a*.36,s=2*t/22,p=.54;if(e<=s)l=i.x0+i.vx*(o+e*p),u=r+t*e-11*e*e,d=n+i.vz*(o+e*p),f=o+e*.52;else{let a=e-s,c=t*.34,m=2*c/22,h=.24;if(a<=m)l=i.x0+i.vx*(o+s*p+a*h),u=r+c*a-11*a*a,d=n+i.vz*(o+s*p+a*h),f=o+s*.52+a*.22;else{let e=a-m,t=(1-Math.exp(-e*6))*.05,c=o+s*p+m*h+t;l=i.x0+i.vx*c,u=r,d=n+i.vz*c,f=o+s*.52+m*.22+t*.5}}}let p=c/s,m=t.MathUtils.smoothstep(p,.62,1),h=(1-m)*(1-m*.45),g=i.scale*h*t.MathUtils.smoothstep(p,0,.06);u=Math.max(-.08,u-m*.14*i.scale),g>.005?(this._pos.set(l,u,d),this._euler.set(i.rot0.x+i.rotVel.x*f,i.rot0.y+i.rotVel.y*f,i.rot0.z+i.rotVel.z*f),this._quat.setFromEuler(this._euler),this._scale.setScalar(g),this._mat4.compose(this._pos,this._quat,this._scale)):this._mat4.makeScale(0,0,0)}else this._mat4.makeScale(0,0,0);this.rocksMesh.setMatrixAt(r,this._mat4)}this.rocksMesh.instanceMatrix.needsUpdate=!0}if(this.sparksMesh.visible){let t=o*.94;for(let n=0;n<this.maxSparks;n++){let r=this.sparksData[n],i=r.spawnP*o,a=Math.min(r.life,Math.max(.1,t-i)),s=e-i;if(s>0&&s<a){let e=1-(1-Math.min(r.spawnP/.86,1))**1.52,t=this.options.startZ+e*this.options.travelDistance+2.85,n=r.x0+r.vx*s,i=Math.max(.06,r.y0+r.vy*s-5.5*s*s),o=t+r.vz*s,c=1-s/a;this._pos.set(n,i,o),this._euler.set(.18,r.vx*.08,0),this._quat.setFromEuler(this._euler),this._scale.set(r.scale*c,1,r.scale*(.45+c*.95)),this._mat4.compose(this._pos,this._quat,this._scale)}else this._mat4.makeScale(0,0,0);this.sparksMesh.setMatrixAt(n,this._mat4)}this.sparksMesh.instanceMatrix.needsUpdate=!0}for(let t=0;t<this.maxNeedles;t++){let r=this.needlesData[t];if(i>.02){let t=(r.phase+e*r.speed*.25)%1,a=n+1.5+r.zLag-t*3.8,o=Math.sin(t*Math.PI)*i;this._pos.set(r.x,r.y,a),this._euler.set(0,0,r.roll),this._quat.setFromEuler(this._euler),this._scale.set(o*1.1,1,r.lenScale*(.6+o*.6)),this._mat4.compose(this._pos,this._quat,this._scale)}else this._mat4.makeScale(0,0,0);this.needlesMesh.setMatrixAt(t,this._mat4)}if(this.needlesMesh.instanceMatrix.needsUpdate=!0,this.inkLinesMesh.visible){for(let t=0;t<this.maxInkLines;t++){let r=this.inkLinesData[t];if(i>.02){let t=(r.phase+e*r.speed*.2)%1,a=n+r.zLag-t*4.5,o=Math.sin(t*Math.PI)*i;this._pos.set(r.x,r.y,a),this._euler.set(r.pitch,0,0),this._quat.setFromEuler(this._euler),this._scale.set(o,1,r.lenScale*(.7+o*.5)),this._mat4.compose(this._pos,this._quat,this._scale)}else this._mat4.makeScale(0,0,0);this.inkLinesMesh.setMatrixAt(t,this._mat4)}this.inkLinesMesh.instanceMatrix.needsUpdate=!0}this._quat.identity();for(let t=0;t<this.maxStars;t++){let r=this.starsData[t];if(i>.02){let t=.25+.75*(.5+.5*Math.sin(e*r.twinkleFreq+r.twinklePhase))**2,a=r.scale*t*i;this._pos.set(r.x,r.y,n+1.2+r.zLag),this._scale.setScalar(a),this._mat4.compose(this._pos,this._quat,this._scale)}else this._mat4.makeScale(0,0,0);this.starsMesh.setMatrixAt(t,this._mat4)}this.starsMesh.instanceMatrix.needsUpdate=!0;let s=t.MathUtils.smoothstep(this.progress,0,.12)*(1-t.MathUtils.smoothstep(this.progress,.42,.86));this.smokeMat.opacity=.2*s;for(let t=0;t<this.maxSmoke;t++){let n=this.smokeData[t];if(s>.01){let t=e,r=n.x0+n.vx*t,i=n.y0+n.vy*t,a=n.z0+n.vz*t,o=n.baseScale*(.45+t*1.15);this._pos.set(r,i,a),this._quat.identity(),this._scale.setScalar(o),this._mat4.compose(this._pos,this._quat,this._scale)}else this._mat4.makeScale(0,0,0);this.smokeMesh.setMatrixAt(t,this._mat4)}this.smokeMesh.instanceMatrix.needsUpdate=!0}update(e,t=null){return this.active?(this.progress+=e/this.options.duration,this.progress>=1&&(this.progress=1,this.active=!1),this.setProgress(this.progress,t),this.active):!1}dispose(){this.root.removeFromParent();for(let e of[this.rocksMesh,this.sparksMesh,this.needlesMesh,this.inkLinesMesh,this.starsMesh,this.smokeMesh])e.dispose();for(let e of this._disposables.geometries)e.dispose();for(let e of this._disposables.materials)e.dispose();this._disposables.geometries.length=0,this._disposables.materials.length=0}},d=class{constructor(e,n={}){this.scene=e,this.maxCount=5,this.count=Math.round(l(n.count,1,this.maxCount,5)),this.spreadAngleDeg=l(n.spreadAngleDeg,10,120,60),this.origin=new t.Vector3(0,0,-7.5),this.baseYaw=0,this.options=Object.assign({theme:`azure`,scale:1,intensity:1.25,duration:1.55,travelDistance:17.5},n),this.waves=[];for(let t=0;t<this.maxCount;t++){let n=new u(e,Object.assign({},this.options,{startZ:0,yLayerOffset:t*.0025,enableLights:t===0}));t>0&&(n.originBurstMesh.visible=!1,n.smokeMesh.visible=!1),n.root.visible=t<this.count,this.waves.push(n)}this._applyFanTransforms()}get active(){return this.waves[0].active}get progress(){return this.waves[0].progress}_getFanAngleOffsets(e){if(e<=1)return[0];let n=t.MathUtils.degToRad(this.spreadAngleDeg),r=n/(e-1),i=[];for(let t=0;t<e;t++)i.push(-n*.5+t*r);return i.sort((e,t)=>Math.abs(e)-Math.abs(t)),i}_applyFanTransforms(){let e=this._getFanAngleOffsets(this.count);for(let t=0;t<this.maxCount;t++){let n=this.waves[t],r=t<this.count;n.root.visible=r,r&&(n.root.position.copy(this.origin),n.root.rotation.y=this.baseYaw+e[t])}}setCount(e,t=null){let n=this.active;this.count=Math.round(l(e,1,this.maxCount,this.count));for(let e=0;e<this.maxCount;e++)this.waves[e].active=n&&e<this.count;this._applyFanTransforms(),this.setProgress(this.progress,t)}setSpreadAngle(e,t=null){this.spreadAngleDeg=l(e,10,120,this.spreadAngleDeg),this._applyFanTransforms(),this.setProgress(this.progress,t)}trigger(e=null,t=0){e&&this.origin.copy(e),this.baseYaw=t,this._applyFanTransforms();let n=this._getFanAngleOffsets(this.count);for(let e=0;e<this.count;e++)this.waves[e].trigger(this.origin,this.baseYaw+n[e])}setTheme(e){this.options.theme=e;for(let t=0;t<this.maxCount;t++)this.waves[t].setTheme(e)}setScale(e){this.options.scale=e;for(let t=0;t<this.maxCount;t++)this.waves[t].setScale(e)}setIntensity(e){this.options.intensity=e;for(let t=0;t<this.maxCount;t++)this.waves[t].setIntensity(e)}setLayerVisibility(e){for(let t=0;t<this.maxCount;t++)this.waves[t].setLayerVisibility(e)}setProgress(e,t=null){for(let n=0;n<this.count;n++)this.waves[n].setProgress(e,t);for(let e=this.count;e<this.maxCount;e++)this.waves[e].progress=this.waves[0].progress}update(e,t=null){let n=!1;for(let r=0;r<this.count;r++)this.waves[r].update(e,t)&&(n=!0);return n}dispose(){for(let e=0;e<this.maxCount;e++)this.waves[e].dispose()}};let f=Object.freeze({duration:1.55,defaultQuantity:5,defaultSpread:1});function p(e={}){return{quantity:Math.round(l(e.quantity,1,5,f.defaultQuantity)),spread:l(e.spread,.25,2,f.defaultSpread),theme:Object.hasOwn(u.THEMES,e.theme)?e.theme:`azure`,size:l(e.size,.25,2,1),speed:l(e.speed,.25,2,1),detail:l(e.detail,.25,2,1)}}function m(e,n={}){let r=new t.Group;r.name=e.id;let i=f.duration,a={...e.lifecycle},o=p(n),s=new d(r,{count:o.quantity,spreadAngleDeg:60*o.spread,theme:o.theme,scale:o.size,intensity:1.25*o.detail,duration:i});s.origin.set(0,0,0),s.trigger();let c=0,l=!1;function u(e){c=e,r.visible=c>0&&c<i,r.visible&&s.setProgress(c/i)}return u(0),{group:r,duration:i,lifecycle:a,get settings(){return o},get elapsed(){return c},get finished(){return l||c>=i},get phase(){return this.finished?`finished`:c<a.start?`starting`:c>=i-a.end?`ending`:`active`},update(e){l||c>=i||!Number.isFinite(e)||e<=0||u(Math.min(i,c+e*o.speed))},reset(){l||u(0)},setOptions(e={}){if(l)return;let t=o;o=p({...t,...e}),o.theme!==t.theme&&s.setTheme(o.theme),o.size!==t.size&&s.setScale(o.size),o.detail!==t.detail&&s.setIntensity(1.25*o.detail),o.spread!==t.spread&&s.setSpreadAngle(60*o.spread),o.quantity!==t.quantity&&s.setCount(o.quantity)},dispose(){l||(l=!0,r.visible=!1,r.removeFromParent(),s.dispose())}}}return e.ENERGY_SWORD_WAVE=f,e.EnergySwordWaveFanVFX=d,e.EnergySwordWaveVFX=u,e.createEnergySwordWaveEffect=m,e.normalizeEnergySwordWaveOptions=p,e})({},e);t.ENERGY_SWORD_WAVE;var n=t.EnergySwordWaveFanVFX,r=t.EnergySwordWaveVFX,i=t.createEnergySwordWaveEffect;t.normalizeEnergySwordWaveOptions;var a={quantity:5,spread:1,theme:`azure`,size:1,speed:1,detail:1};function o(e={}){return i({id:`energy-sword-wave`,lifecycle:{start:.078,end:.31}},{...a,...e})}export{n as EnergySwordWaveFanVFX,r as EnergySwordWaveVFX,o as default,a as defaultOptions};