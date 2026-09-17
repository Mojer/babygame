export const DURATION = 65, SPEED = 220, PLAYER_X = 178, GROUND = 292;
export type ObstacleKind = 'cone'|'pot'|'branch'|'puddle'|'ball';
export type Obstacle = {at:number; kind:ObstacleKind; hit:boolean; cleared?:boolean; group?:string};
export type Star = {at:number; height:number; collected:boolean};
export const schedule: [number,ObstacleKind,string?][] = [
 [9,'puddle'],[13,'branch'],
 [18,'pot','jump-duck-1'],[19.15,'branch','jump-duck-1'],
 [25,'branch','duck-jump-1'],[26.15,'ball','duck-jump-1'],
 [32,'cone','double-jump'],[33.15,'puddle','double-jump'],
 [40,'ball','jump-duck-2'],[41.15,'branch','jump-duck-2'],
 [47,'branch','duck-jump-2'],[48.15,'cone','duck-jump-2'],
 [55,'puddle','final-beat'],[56.15,'branch','final-beat'],[60,'ball']
];
export const sequences = [
 {from:16.2,to:19.6,label:'跳 → 蹲',steps:'↑　↓'},
 {from:23.2,to:26.6,label:'蹲 → 跳',steps:'↓　↑'},
 {from:30.2,to:33.6,label:'連續跳躍',steps:'↑　↑'},
 {from:38.2,to:41.6,label:'跳 → 蹲',steps:'↑　↓'},
 {from:45.2,to:48.6,label:'蹲 → 跳',steps:'↓　↑'},
 {from:53.2,to:56.6,label:'最後節奏',steps:'↑　↓'}
];
export const activeSequence = (elapsed:number) => sequences.find(sequence => elapsed >= sequence.from && elapsed <= sequence.to);
export class Run {
 elapsed=0; y=0; vy=0; health=3; hits=0; collected=0; invincible=0; buffer=0; duck=false; combo=0; bestCombo=0; state:'running'|'won'|'lost'='running';
 obstacles:Obstacle[]=schedule.map(([at,kind,group])=>({at,kind,group,hit:false,cleared:false}));
 stars:Star[]=[3,4,5,7,17,21,33,37,44,51,52,62,63,64].map(at=>({at,height:22,collected:false}));
 constructor(public practice=false){for(const o of this.obstacles) this.stars.push({at:o.at,height:o.kind==='branch'?14:84,collected:false});}
 jump(){this.buffer=.12;}
 step(dt:number){
  if(this.state!=='running')return;
  this.invincible=Math.max(0,this.invincible-dt);
  if(this.buffer>0&&this.y===0){this.vy=480;this.buffer=0;}
  this.buffer=Math.max(0,this.buffer-dt);
  this.y=Math.max(0,this.y+this.vy*dt-600*dt*dt);this.vy-=1200*dt;
  if(this.y===0)this.vy=0;
  this.elapsed=Math.min(DURATION,this.elapsed+dt);
  const height=this.duck&&this.y===0?48:60;
  for(const o of this.obstacles){
   const dx=(o.at-this.elapsed)*SPEED;
   const bottom=o.kind==='branch'?52:0, top=o.kind==='branch'?96:o.kind==='puddle'?24:o.kind==='ball'?34:32;
   if(!o.hit&&Math.abs(dx)<29&&this.y<top&&this.y+height>bottom&&this.elapsed<61&&this.invincible===0){o.hit=true;this.hits++;this.combo=0;this.invincible=1.5;if(!this.practice)this.health--;}
   if(!o.cleared&&dx < -34){o.cleared=true;if(!o.hit){this.combo++;this.bestCombo=Math.max(this.bestCombo,this.combo);}}
  }
  for(const s of this.stars)if(!s.collected&&Math.abs((s.at-this.elapsed)*SPEED)<24&&this.y<s.height+10&&this.y+height>s.height-10){s.collected=true;this.collected++;}
  if(this.health<=0)this.state='lost';else if(this.elapsed>=DURATION)this.state='won';
 }
 get rating(){return this.state==='won'?1+Number(this.collected/this.stars.length>=.7)+Number(this.hits===0):0;}
}
