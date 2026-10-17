import assert from 'node:assert/strict';
import { test } from 'node:test';
import { candyPose, CANDY_GAITS, type CandyPose } from '../src/render/candyMotion';

const blank = (): CandyPose => ({frame:0,lift:0,lean:0,scaleX:1,scaleY:1});
for (let kind=0;kind<5;kind++) {
  test(`糖果怪 ${kind}：原地也播放完整八格、動作幅度可見、遊戲時鐘停止時姿勢不變`,()=>{
    const frames=new Set<number>();const samples:CandyPose[]=[];
    for(let i=0;i<80;i++) samples.push({...candyPose(kind,i/(10*CANDY_GAITS[kind].fps),0,blank())});
    samples.forEach(p=>frames.add(p.frame));
    assert.equal(frames.size,8);
    assert.ok(Math.max(...samples.map(p=>p.lift))-Math.min(...samples.map(p=>p.lift))>=1.5,'跳躍/重踏幅度不能退回微小起伏');
    assert.ok(Math.max(...samples.map(p=>p.lean))-Math.min(...samples.map(p=>p.lean))>=.075,'擺動應可辨識');
    for(const p of samples) assert.ok(p.scaleX>0 && p.scaleY>0);
    assert.deepEqual(candyPose(kind,10,13,blank()),candyPose(kind,10,13,blank()),'暫停時同一模擬時間不得改姿勢');
    assert.notDeepEqual(candyPose(kind,10,13,blank()),candyPose(kind,10.22,13,blank()));
  });
}
test('糖果怪動作：個體錯開節拍，軟糖熊有明顯擠壓而 Boss 動作較沉重',()=>{
  assert.notDeepEqual(candyPose(0,2,0,blank()),candyPose(0,2,1,blank()));
  const jelly=candyPose(2,0,0,blank());
  assert.ok(jelly.scaleX>=1.12 && jelly.scaleY<=.88);
  assert.ok(CANDY_GAITS[4].fps<CANDY_GAITS[0].fps);
});
