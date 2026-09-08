'use strict';
const $ = id => document.getElementById(id);
// Grade bands are practice sets, not a claim of alignment to any school curriculum.
const vocabulary = [
 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z cat dog sun red blue egg bus cup pig hat pen',
 'apple banana orange grape lemon tiger lion monkey rabbit horse bird fish milk water bread cake chair table book pencil school happy sad green yellow black white',
 'family mother father sister brother teacher student kitchen bedroom garden window door breakfast dinner chicken hungry thirsty sleepy sunny rainy cloudy windy jacket shoes purple morning evening',
 'elephant giraffe butterfly dolphin mountain river forest island beach hospital library station restaurant supermarket bicycle airplane umbrella sandwich vegetable beautiful dangerous excited worried tomorrow yesterday',
 'adventure discover explore journey planet astronaut science experiment electricity energy recycle environment weather temperature season earthquake exercise healthy delicious favorite different important remember practice question answer',
 'responsibility imagination communication technology information transportation pollution protection conservation community volunteer opportunity confidence curious creative independent patient generous explain compare describe improve understand celebrate achieve'
].map(s => s.split(' '));
const descriptions = ['英文字母與簡單單字 · A、cat、sun','生活單字與動物 · apple、tiger','家庭、天氣與感受 · family、cloudy','場所與較長單字 · library、butterfly','自然科學與抽象詞 · energy、adventure','進階多音節單字 · responsibility'];
let grade = 0, mode = 'menu', bombs = [], effects = [], target = '', score = 0, hp = 100, elapsed = 0, cooldown = 0, wave = 1, nextSpawn = 0, nextPrompt = 0, roarUntil = 0, announcementUntil = 0, hits = 0, misses = 0, mistakes = 0, last = 0, serial = 0;
const candyColors = [['#ffe28a','#fff1bc','#bd8938'],['#a5eacb','#d7ffe7','#489879'],['#ffbda9','#ffe0ce','#ba7061'],['#a9ddff','#d9f1ff','#518cba'],['#dbc4f4','#efdeff','#9776b7']];
const monsterSprites=['assets/monster-girl.png','assets/monster-boy.png'].map(src=>{const img=new Image();img.src=src;return img;});
let scenePalette;
let fragments = [];
function refreshPalette(){const css=getComputedStyle(document.documentElement);scenePalette=['--sky-top','--sky-mid','--sky-bottom','--monster'].map(key=>css.getPropertyValue(key).trim());}
refreshPalette();matchMedia('(prefers-color-scheme: dark)').addEventListener('change',refreshPalette);
let width = 400, height = 800, audio, voices = [], speechToken = 0, speaking = false;
const bgm = new Audio('assets/word-defense-bgm.mp3');
bgm.loop = true;
bgm.preload = 'auto';
bgm.volume = .12;
const canvas = $('scene'), ctx = canvas.getContext('2d'), reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize(){const r=$('game').getBoundingClientRect();width=r.width;height=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);for(const b of bombs)b.x=Math.min(b.x,width-b.w-8);}
window.addEventListener('resize',()=>{resize();if(window.innerWidth>window.innerHeight&&window.innerHeight<600)pause();});resize();
function getVoices(){voices=window.speechSynthesis ? speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang)) : [];}
if(window.speechSynthesis){getVoices();speechSynthesis.addEventListener('voiceschanged',getVoices);}
else {$('audioNote').textContent='此瀏覽器不支援英文語音，請使用 Safari 或 Chrome。';$('start').disabled=true;}
function sound(type){if(!audio)return;try {const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);let t=audio.currentTime;o.type=type==='roar'?'sawtooth':'sine';o.frequency.setValueAtTime(type==='roar'?75:type==='hit'?680:120,t);o.frequency.exponentialRampToValueAtTime(type==='roar'?28:type==='hit'?1100:35,t+.3);g.gain.setValueAtTime(type==='roar'?.09:.045,t);g.gain.exponentialRampToValueAtTime(.001,t+(type==='roar'?.8:.3));o.start();o.stop(t+.85);}catch(e){/* Audio effects are optional; speech remains available. */}}
function setBgmDucked(ducked){bgm.volume=ducked?.018:.12;}
function cancelSpeech(){speechToken++;speaking=false;setBgmDucked(false);if(window.speechSynthesis)speechSynthesis.cancel();}
// Use letter-name spellings so speech engines do not expand initials or read A as an article.
const letterNames = {
 A:'ay', B:'bee', C:'see', D:'dee', E:'ee', F:'eff', G:'jee',
 H:'aitch', I:'eye', J:'jay', K:'kay', L:'ell', M:'em', N:'en',
 O:'oh', P:'pee', Q:'cue', R:'ar', S:'ess', T:'tee', U:'you',
 V:'vee', W:'double you', X:'ex', Y:'why', Z:'zee'
};
function pronunciationText(word){return /^[A-Z]$/.test(word) ? letterNames[word] : word;}
function speak(){if(mode!=='playing'||!target)return;cancelSpeech();const token=speechToken;const u=new SpeechSynthesisUtterance(pronunciationText(target));u.lang='en-US';u.rate=.7+grade*.045;const v=voices.find(v=>v.lang==='en-US')||voices[0];if(v)u.voice=v;speaking=true;setBgmDucked(true);u.onend=()=>{if(token===speechToken){speaking=false;setBgmDucked(false);}};u.onerror=e=>{if(token!==speechToken)return;speaking=false;setBgmDucked(false);if(e.error!=='canceled'&&e.error!=='interrupted'){pause();$('result').textContent='英文語音無法播放。請確認裝置已安裝英文語音，並開啟音量，再按繼續。';}};speechSynthesis.speak(u);nextPrompt=elapsed+Math.max(2.7,target.length*.12+1.7);}
function announce(text,seconds=1.6){$('announcement').textContent=text;announcementUntil=elapsed+seconds;}
function selectGrade(n){grade=n;[...$('grades').children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));$('gradeInfo').textContent=descriptions[n];$('gradeLabel').textContent=`小${'一二三四五六'[n]} · 聽力防衛`;}
for(let i=0;i<6;i++){const b=document.createElement('button');b.textContent='小'+'一二三四五六'[i];b.onclick=()=>selectGrade(i);$('grades').append(b);}selectGrade(0);
function clearBombs(){for(const b of bombs)b.el.remove();bombs=[];}
function start(){cancelSpeech();clearBombs();effects=[];fragments=[];score=0;hp=100;elapsed=0;cooldown=0;wave=1;nextSpawn=1.2;nextPrompt=0;target='';hits=0;misses=0;mistakes=0;mode='playing';$('overlay').hidden=true;$('dialog').hidden=true;$('pause').disabled=false;$('listen').disabled=false;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();}catch(e){}bgm.currentTime=0;setBgmDucked(false);bgm.play().catch(()=>{});roar();updateHUD();last=performance.now();const ready=new SpeechSynthesisUtterance('Ready');ready.lang='en-US';setBgmDucked(true);ready.onend=()=>setBgmDucked(false);speechSynthesis.speak(ready);
 // Browsers that support orientation locking require fullscreen from a user gesture.
 if(window.innerWidth<700&&document.documentElement.requestFullscreen){document.documentElement.requestFullscreen().then(()=>{if(screen.orientation&&screen.orientation.lock)return screen.orientation.lock('portrait');}).catch(()=>{});}
}
function roar(){roarUntil=elapsed+1.1;sound('roar');announce(wave===1?'怪獸來了，準備聆聽！':'怪獸狂暴！密集轟炸',2);}
function fitBombToWord(el,word){
 let fontSize=word.length>12?14:word.length>8?16:20;
 const maxWidth=width-16;
 el.style.fontSize=fontSize+'px';
 el.style.width='max-content';
 $('bombs').append(el);
 while(el.scrollWidth+6>maxWidth&&fontSize>11){
  fontSize--;
  el.style.fontSize=fontSize+'px';
 }
 const fittedWidth=Math.min(maxWidth,Math.max(72,Math.ceil(el.scrollWidth+6)));
 el.style.width=fittedWidth+'px';
 return fittedWidth;
}
function spawn(){
 const pool=vocabulary[grade],words=[];
 while(words.length<3){const word=pool[Math.floor(Math.random()*pool.length)];if(!words.includes(word))words.push(word);}
 const burst=wave>1,count=burst?Math.min(12,5+wave):3;
 for(let i=0;i<count;i++){
  const word=words[i%3],lane=i%3,el=document.createElement('button');
  el.className='bomb';
  const candy=candyColors[Math.floor(Math.random()*candyColors.length)];
  ['--bomb-fill','--bomb-rim','--bomb-shadow'].forEach((key,j)=>el.style.setProperty(key,candy[j]));
  el.textContent=word;
  el.setAttribute('aria-label','炸彈 '+word);
  const w=fitBombToWord(el,word);
  const x=Math.min(width-w-8,Math.max(8,(width/3)*lane+(width/3-w)/2+(burst?(Math.random()-.5)*14:0)));
  const b={id:++serial,word,x,y:145-Math.floor(i/3)*58,w,el,speed:(height-340)/(14-grade*.75)*Math.min(1.9,1+(wave-1)*.1)};
  el.onclick=()=>hit(b);
  bombs.push(b);
 }
 pickTarget();
}
function pickTarget(){const visible=bombs.filter(b=>b.y>=130);if(!visible.length){target='';return;}const choices=[...new Set(visible.map(b=>b.word))];const other=choices.filter(w=>w!==target);target=(other.length?other:choices)[Math.floor(Math.random()*(other.length||choices.length))];speak();}
function remove(b){b.el.remove();bombs=bombs.filter(x=>x!==b);}
function particle(x,y,color,label=''){effects.push({x,y,color,label,life:.65});}
// Short fire burst followed by longer, rising smoke. Bound particles for mobile devices.
function explode(x,y,label){
 effects.push({kind:'blast',x,y,life:.45,duration:.45});
 for(let i=0;i<(reduced?4:10);i++){
  const duration=1.6+Math.random()*1.1;
  effects.push({kind:'smoke',x:x+(Math.random()-.5)*25,y:y+Math.random()*10,life:duration,duration,radius:10+Math.random()*12,vx:(Math.random()-.5)*25,vy:18+Math.random()*23});
 }
 particle(x,y,'#ffbc86',label);
 if(effects.length>250)effects.splice(0,effects.length-250);
 sound('miss');
}
function drawExplosion(e){
 const age=e.duration-e.life,progress=age/e.duration;
 ctx.save();
 if(e.kind==='smoke'){
  const x=e.x+e.vx*age*(reduced?.2:1),y=e.y-e.vy*age*(reduced?.2:1),r=e.radius*(1+progress*1.7);
  ctx.globalAlpha=Math.min(1,age*8)*(1-progress)*.65;
  const cloud=ctx.createRadialGradient(x,y,0,x,y,r);
  cloud.addColorStop(0,'#9a9894');cloud.addColorStop(.55,'#64686d');cloud.addColorStop(1,'#444b5500');
  ctx.fillStyle=cloud;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
 }else{
  const r=12+progress*(reduced?16:52);
  ctx.globalAlpha=(1-progress)*.9;
  const fire=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,r);
  fire.addColorStop(0,'#fff1bc');fire.addColorStop(.35,'#ffd078');fire.addColorStop(.7,'#f47b43');fire.addColorStop(1,'#e25d3500');
  ctx.fillStyle=fire;ctx.beginPath();ctx.arc(e.x,e.y,r,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}
// Five visual projectiles each deal one city damage point on impact.
function scatter(b){
 const x=b.x+b.w/2,y=b.y+24;
 explode(x,y,'');
 for(let i=0;i<5;i++)fragments.push({x,y,toX:Math.max(10,Math.min(width-10,x+(i-2)*42)),toY:height-182,age:0,duration:.55+i*.065});
}
function updateFragments(dt){
 const impacts=[];
 for(const f of fragments){f.age+=dt;if(f.age>=f.duration)impacts.push(f);}
 fragments=fragments.filter(f=>f.age<f.duration);
 for(const f of impacts){
  explode(f.toX,f.toY,'−1%');
  if(mode==='playing'){hp=Math.max(0,hp-1);if(hp===0)end();}
 }
}
function drawFragments(){
 ctx.save();ctx.lineCap='round';
 for(const f of fragments){
  const p=Math.min(1,f.age/f.duration),tail=Math.max(0,p-.13);
  const px=f.x+(f.toX-f.x)*p,py=f.y+(f.toY-f.y)*p*p;
  ctx.strokeStyle='#ef865c';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(f.x+(f.toX-f.x)*tail,f.y+(f.toY-f.y)*tail*tail);ctx.lineTo(px,py);ctx.stroke();
  ctx.fillStyle='#fff1a6';ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}
function hit(b){if(mode!=='playing'||!bombs.includes(b))return;if(b.word!==target){mistakes++;scatter(b);remove(b);$('hint').textContent='點錯了！散射彈將造成 5% 城市損傷。';}else{score+=100;hits++;particle(b.x+b.w/2,b.y+20,'#9be6ce','+100');remove(b);sound('hit');$('hint').textContent='答對了！繼續聽下一個單字。';if(!bombs.some(x=>x.word===target))pickTarget();}updateHUD();}
function chain(){if(mode!=='playing'||cooldown>0||!target)return;const matches=bombs.filter(b=>b.word===target);if(!matches.length)return;let prev={x:width*.75,y:height-85};for(const b of matches){const point={x:b.x+b.w/2,y:b.y+24};effects.push({line:[prev,point],life:.6,color:'#aefbe0'});prev=point;score+=100;hits++;particle(point.x,point.y,'#aefbe0','+100');remove(b);}cooldown=18;sound('hit');announce(`閃電連鎖 × ${matches.length}`);pickTarget();updateHUD();}
function best(){try{return Number(localStorage.getItem('word-defense-best-'+grade))||0;}catch(e){return 0;}}
function end(){mode='over';cancelSpeech();bgm.pause();const record=Math.max(best(),score);try{localStorage.setItem('word-defense-best-'+grade,record);}catch(e){}$('dialog').hidden=false;$('resultLabel').textContent='MISSION COMPLETE';$('dialogTitle').textContent='城市需要你再挑戰';$('result').textContent=`防衛積分 ${score}　｜　最高 ${record}\n守護 ${Math.floor(elapsed)} 秒 · 第 ${wave} 波\n答對 ${hits} 顆 · 漏接 ${misses} 顆 · 點錯 ${mistakes} 次`;$('resume').hidden=true;$('pause').disabled=true;updateHUD();}
function pause(){if(mode!=='playing')return;mode='paused';cancelSpeech();bgm.pause();$('dialog').hidden=false;$('resultLabel').textContent='MISSION PAUSED';$('dialogTitle').textContent='休息一下';$('result').textContent='城市已暫停，準備好就繼續守護。';$('resume').hidden=false;updateHUD();}
function resume(){mode='playing';$('dialog').hidden=true;last=performance.now();bgm.play().catch(()=>{});speak();}
function updateHUD(){$('score').textContent=String(score).padStart(4,'0');$('wave').textContent='WAVE '+String(wave).padStart(2,'0');$('health').style.width=hp+'%';$('health').style.background=hp<30?'#ef8f7e':'#87d9ba';$('hp').textContent=hp+'%';$('skill').disabled=mode!=='playing'||cooldown>0||!target;$('listen').disabled=mode!=='playing'||!target;$('cooldown').textContent=cooldown>0?`冷卻 ${Math.ceil(cooldown)} 秒`:'準備就緒';}
$('start').onclick=start;$('restart').onclick=start;$('pause').onclick=pause;$('resume').onclick=resume;$('listen').onclick=speak;$('skill').onclick=chain;$('choose').onclick=()=>{mode='menu';cancelSpeech();bgm.pause();clearBombs();effects=[];fragments=[];$('dialog').hidden=true;$('overlay').hidden=false;$('announcement').textContent='';$('pause').disabled=true;updateHUD();};document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});document.addEventListener('keydown',e=>{if(e.key==='Escape')pause();if(e.code==='Space'&&mode==='playing'){e.preventDefault();speak();}});
function draw(t){ctx.clearRect(0,0,width,height);const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,scenePalette[0]);sky.addColorStop(.7,scenePalette[1]);sky.addColorStop(1,scenePalette[2]);ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
 ctx.fillStyle='#fff0ae';ctx.beginPath();ctx.arc(width*.79,height*.24,32,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff7';for(let i=0;i<35;i++){ctx.fillRect((i*79.7)%width,(i*47.3)%(height*.6),i%3===0?2:1,1);}
 // Reference characters alternate each wave and remain behind the city and word bombs.
 const monster=monsterSprites[(wave-1)%monsterSprites.length];
 if(monster.complete&&monster.naturalWidth){
  // Use game time so breathing, entrance and roar freeze together when paused.
  const active=mode!=='menu';
  const phase=active?elapsed:0;
  const roarProgress=Math.max(0,Math.min(1,(phase-(roarUntil-1.1))/1.1));
  const roarPulse=active&&phase<roarUntil?Math.sin(roarProgress*Math.PI):0;
  const waveAge=phase-(wave-1)*15;
  const entrance=active&&!reduced?Math.pow(1-Math.min(1,Math.max(0,waveAge)/.85),3):0;
  const breath=active&&!reduced?Math.sin(phase*2.1):0;
  const sway=active&&!reduced?Math.sin(phase*1.15)*.018:0;
  const characterHeight=Math.min(height*.66,width*1.5);
  const characterWidth=characterHeight*monster.naturalWidth/monster.naturalHeight;
  ctx.save();ctx.globalAlpha=(.82+roarPulse*.15)*(1-entrance*.6);
  const shake=!reduced?Math.sin(phase*45)*4*roarPulse:0;
  ctx.translate(width/2+shake,height-168+entrance*65);
  ctx.rotate(sway+(!reduced?Math.sin(phase*19)*.025*roarPulse:0));
  ctx.scale(1-breath*.008+(!reduced?roarPulse*.06:0),1+breath*.016+(!reduced?roarPulse*.035:0));
  ctx.drawImage(monster,-characterWidth/2,-characterHeight,characterWidth,characterHeight);
  ctx.restore();
 }
 const ground=height-168;for(let layer=0;layer<2;layer++){for(let i=0;i<13;i++){const bw=width/11;const x=i*bw-15;const bh=(35+(i*31)%72)*(layer?1:.75);const damaged=layer&&hp<100-(i%5)*20;ctx.fillStyle=layer?(damaged?'#747f83':['#f29e83','#77cdb7','#f4ce77','#86bbde','#baa7db'][i%5]):'#4e99aa';ctx.fillRect(x,ground-bh+(damaged?bh*.3:0),bw-5,damaged?bh*.7:bh);if(layer){for(let row=0;row<4;row++)for(let col=0;col<2;col++){ctx.fillStyle=damaged?'#505b65':(i+row+col)%3?'#fff4c6':'#41748b';ctx.fillRect(x+7+col*12,ground-12-row*15,4,6);}}}}
 ctx.fillStyle='#142b3a';ctx.fillRect(0,ground,width,7);for(const e of effects){if(e.kind){drawExplosion(e);continue;}ctx.globalAlpha=Math.max(0,e.life/.65);ctx.strokeStyle=e.color;ctx.fillStyle=e.color;if(e.line){ctx.lineWidth=3;ctx.shadowColor=e.color;ctx.shadowBlur=15;ctx.beginPath();ctx.moveTo(e.line[0].x,e.line[0].y);ctx.lineTo((e.line[0].x+e.line[1].x)/2+15,(e.line[0].y+e.line[1].y)/2);ctx.lineTo(e.line[1].x,e.line[1].y);ctx.stroke();ctx.shadowBlur=0;}else{ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,(.7-e.life)*55,0,Math.PI*2);ctx.stroke();ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.fillText(e.label,e.x,e.y-(.65-e.life)*40);}}ctx.globalAlpha=1;drawFragments();
}
function frame(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;if(mode==='playing'){elapsed+=dt;cooldown=Math.max(0,cooldown-dt);const newWave=1+Math.floor(elapsed/15);if(newWave>wave){wave=newWave;roar();nextSpawn=elapsed+1.2;}if(elapsed>=nextSpawn&&bombs.length<18){spawn();nextSpawn=elapsed+Math.max(8,14-wave*.6);}if(target&&!speaking&&elapsed>=nextPrompt)pickTarget();if(!target&&bombs.some(b=>b.y>=130))pickTarget();for(const b of [...bombs]){b.y+=b.speed*dt;b.el.style.transform=`translate(${b.x}px,${b.y}px)`;b.el.style.visibility=b.y<125?'hidden':'visible';if(b.y>=height-213){remove(b);hp=Math.max(0,hp-5);misses++;explode(b.x+b.w/2,height-182,'−5%');if(hp===0){end();break;}}}if(target&&!bombs.some(b=>b.word===target))pickTarget();if(elapsed>announcementUntil)$('announcement').textContent='';updateHUD();}if(mode==='playing'||mode==='over'){updateFragments(dt);updateHUD();effects.forEach(e=>e.life-=dt);effects=effects.filter(e=>e.life>0);}draw(t);requestAnimationFrame(frame);}requestAnimationFrame(frame);
