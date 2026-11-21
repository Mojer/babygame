import{r as e}from"./three.module-Dvf4-md2.js";var t=(function(e){Object.defineProperty(e,Symbol.toStringTag,{value:`Module`});function t(e,t={}){let n=(e,t,n,r)=>Number.isFinite(e)?Math.min(r,Math.max(n,e)):t;return{color:/^#[0-9a-f]{6}$/i.test(t.color)?t.color:e.color,size:e.indicatorShape===`rectangle`?1:n(t.size,3,.25,20),...e.indicatorShape===`rectangle`?{length:n(t.length,6,.25,20),width:n(t.width,3,.25,20),fillMode:t.fillMode===`center-out`?`center-out`:`forward`}:{},detail:n(t.detail,1,.25,2),angleDeg:e.indicatorShape===`sector`?n(t.angleDeg,90,5,360):360,warningDuration:n(t.warningDuration,2,.1,30),progressMode:t.progressMode===`manual`?`manual`:`auto`,speed:1,density:.5}}function n(e,n,r={}){let i=new e.Group;i.name=n.id;let a=t(n,r),o=0,s=0,c=0,l=null,u=!1,d=!1,f={uRectangleSize:{value:new e.Vector2(6,3)},uCenterOut:{value:0},uTime:{value:0},uProgress:{value:0},uHalfAngle:{value:Math.PI},uDetail:{value:1},uOpacity:{value:1},uFlash:{value:0},uColor:{value:new e.Color},uEdgeColor:{value:new e.Color}},p=new e.PlaneGeometry(2.04,2.04);p.rotateX(-Math.PI/2);let m=new e.ShaderMaterial({uniforms:f,defines:n.indicatorShape===`rectangle`?{RECTANGLE_INDICATOR:1}:{},transparent:!0,depthTest:!0,depthWrite:!1,side:e.DoubleSide,forceSinglePass:!0,blending:e.NormalBlending,toneMapped:!1,vertexShader:`varying vec2 vPoint;
      void main(){vPoint=position.xz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`
      uniform float uTime,uProgress,uHalfAngle,uDetail,uOpacity,uFlash;
      uniform vec3 uColor,uEdgeColor;
      uniform vec2 uRectangleSize;
      uniform float uCenterOut;
      varying vec2 vPoint;
      const float PI=3.14159265359;
      float rayDistance(vec2 p,vec2 direction){return length(p-direction*clamp(dot(p,direction),0.0,1.0));}
      void main(){
        vec2 p=vPoint;
        #ifdef RECTANGLE_INDICATOR
        // Use one shared stroke unit for both axes. Small footprints retain
        // a readable interior; stretching either axis never stretches a border.
        float strokeUnit=min(3.0,min(uRectangleSize.x,uRectangleSize.y));
        p *= uRectangleSize / (2.0*strokeUnit);
        vec2 halfSize=uRectangleSize / (2.0*strokeUnit);
        float aa=max(length(fwidth(p))*.65,.00015);
        float boundary=min(halfSize.x-abs(p.x),halfSize.y-abs(p.y));
        float fillDistance=uCenterOut>.5 ? uProgress*halfSize.y-abs(p.y)
          : uProgress*halfSize.x*2.0-(p.x+halfSize.x);
        float filled=smoothstep(-aa,aa,fillDistance)*step(.000001,uProgress);
        if(uProgress>=.99999)filled=1.0;
        float front=(1.0-smoothstep(.006,.020+aa,abs(fillDistance)))*step(.000001,uProgress)*(1.0-step(.99999,uProgress));
        float wave=pow(.5+.5*sin((uCenterOut>.5?abs(p.y):p.x)*28.0-uTime*2.6),8.0);
        #else
        float radius=length(p);
        // Derivatives are evaluated for the whole quad before any discard.
        float aa=max(length(fwidth(p))*.65,.00015);
        float angle=atan(p.y,abs(p.x)+abs(p.y)<.000001?.000001:p.x);
        float boundary=1.0-radius;
        if(uHalfAngle<PI-.00001){
          vec2 ray=vec2(cos(uHalfAngle),sin(uHalfAngle));
          float side=min(rayDistance(p,ray),rayDistance(p,vec2(ray.x,-ray.y)));
          boundary=min(boundary,abs(angle)<=uHalfAngle?side:-side);
        }
        float filled=(1.0-smoothstep(uProgress-aa,uProgress+aa,radius))*step(.000001,uProgress);
        float front=(1.0-smoothstep(.006,.020+aa,abs(radius-uProgress)))*step(.000001,uProgress)*(1.0-step(.99999,uProgress));
        // Sparse moving bands live inside the shape. They never displace a border.
        float wave=pow(.5+.5*sin(radius*28.0-angle*2.0-uTime*2.6),8.0);
        #endif
        float coverage=smoothstep(-aa,aa,boundary);
        float edge=1.0-smoothstep(.007,.014+aa,boundary);
        float halo=1.0-smoothstep(.014,.075,boundary);
        float flow=wave*(.35+.65*filled)*(.018*uDetail);
        float alpha=(.115+.19*filled+.12*halo+flow+.20*front+.54*edge)*coverage*uOpacity;
        vec3 color=uColor*(.65+.20*filled);
        color=mix(color,uEdgeColor,clamp(.30*halo+.75*edge+.44*front,0.0,1.0));
        color=mix(color,vec3(.055,.018,.023),.22*(1.0-edge)*halo);
        color=mix(color,mix(uEdgeColor,vec3(1.0),.35),uFlash*edge);
        alpha=min(1.0,alpha+uFlash*edge*.18*coverage*uOpacity);
        if(alpha<.001)discard;
        gl_FragColor=vec4(color,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`}),h=new e.Mesh(p,m);h.name=n.id+`-surface`,h.position.y=.01,i.add(h);function g(){n.indicatorShape===`rectangle`?(h.scale.set(a.length/2,1,a.width/2),f.uRectangleSize.value.set(a.length,a.width),f.uCenterOut.value=+(a.fillMode===`center-out`)):h.scale.set(a.size,1,a.size),f.uHalfAngle.value=a.angleDeg*Math.PI/360,f.uDetail.value=a.detail,f.uColor.value.set(a.color);let e={};f.uColor.value.getHSL(e),f.uEdgeColor.value.setHSL((e.h+.045)%1,e.s*.86,Math.min(.68,Math.max(.52,e.l)))}function _(){f.uTime.value=o%(Math.PI*2/2.6),f.uProgress.value=s,f.uFlash.value=l===`complete`&&c<.06?1-.35*c/.06:0,f.uOpacity.value=d?0:l===`cancel`?Math.max(0,1-c/.12):l===`complete`?Math.max(0,1-Math.max(0,c-.06)/.09):1,i.visible=!u&&!d}function v(e){l=e,c=0,_()}function y(e){if(u||d||!Number.isFinite(e)||e<0)return;let t=e;if(!l){if(a.progressMode===`auto`){let e=Math.min(t,Math.max(0,a.warningDuration-o));o+=e,t-=e,s=Math.min(1,o/a.warningDuration),o>=a.warningDuration-1e-10&&(o=a.warningDuration,s=1,v(`complete`))}else o=Math.min(2**53-1,o+t),t=0}if(l){let e=l===`complete`?.15:.12,n=Math.min(t,Math.max(0,e-c));o+=n,c+=n,c>=e-1e-10&&(c=e,d=!0)}_()}function b(e){u||d||l||a.progressMode!==`manual`||!Number.isFinite(e)||(s=Math.min(1,Math.max(0,e)),s===1&&v(`complete`),_())}function x(){u||(o=0,s=0,c=0,l=null,d=!1,_())}function S(){u||d||l||v(`cancel`)}function C(e={}){if(u)return;let r=a;a=t(n,{...a,...e}),g(),(a.warningDuration!==r.warningDuration||a.progressMode!==r.progressMode)&&x()}function w(){u||(u=!0,d=!0,i.visible=!1,i.removeFromParent(),p.dispose(),m.dispose(),i.clear())}return g(),_(),{group:i,update:y,setProgress:b,setOptions:C,reset:x,stop:S,dispose:w,hit(){},setDirection(){},setEndpoints(){},get settings(){return{...a}},get progress(){return s},get elapsed(){return o},get duration(){return a.warningDuration+.15},get lifecycle(){return{start:0,end:.15}},get particleCount(){return 0},get phase(){return d?`finished`:l?`ending`:`active`},get finished(){return d}}}return e.createSpellIndicatorEffect=n,e.normalizeSpellIndicatorOptions=t,e})({}),n=t.createSpellIndicatorEffect;t.normalizeSpellIndicatorOptions;var r={id:`spell-indicator-circle`,name:`紅色圓形預警`,english:`Red Circle Spell Indicator`,category:`area`,kind:2,variant:16,schools:[`arcane`],indicatorShape:`circle`,color:`#ff303e`,seed:829650,duration:2.15,burst:!0,maxParticles:0,defaultDensity:.5,lifecycle:{start:0,end:.15},previewTime:1,thumbnailTime:1,sizeRange:{min:.25,max:20,default:3},description:`紅色圓圈標出危險區，顏色慢慢填滿提醒攻擊將到，倒數結束後消失。`,tags:`紅色 圓形 預警 危險 攻擊 範圍 倒數 指示器 技能 奧術 red circle spell indicator telegraph warning aoe countdown danger arcane`},i={color:`#ff303e`,size:3,detail:1,angleDeg:360,warningDuration:2,progressMode:`auto`,speed:1,density:.5};function a(t={}){return n(e,r,{...i,...t})}export{a as default,i as defaultOptions};