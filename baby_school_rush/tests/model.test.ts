import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Run} from '../src/model.ts';
function tick(r:Run,seconds:number){for(let i=0;i<Math.round(seconds*120);i++)r.step(1/120);}
test('no input loses three lives; each obstacle hits once',()=>{const r=new Run();tick(r,10);assert.equal(r.health,2);tick(r,10);assert.equal(r.state,'lost');assert.equal(r.hits,3);});
test('practice reaches school without losing hearts',()=>{const r=new Run(true);tick(r,66);assert.equal(r.state,'won');assert.equal(r.health,3);assert.equal(r.elapsed,65);});
test('entire authored route can be completed perfectly',()=>{const r=new Run();for(let i=0;i<65*120+1;i++){const next=r.obstacles.find(o=>o.at>=r.elapsed-.2);r.duck=!!next&&next.kind==='branch'&&next.at-r.elapsed<.5;if(next&&next.kind!=='branch'&&next.at-r.elapsed<=.38&&next.at-r.elapsed>.35&&r.y===0)r.jump();r.step(1/120);}assert.equal(r.state,'won');assert.equal(r.hits,0);assert.equal(r.rating,3);});
test('jump is finite and cannot be repeated while airborne',()=>{const r=new Run();r.jump();tick(r,.4);assert.ok(r.y>94&&r.y<97);r.jump();tick(r,.5);assert.equal(r.y,0);});
test('held duck clears high obstacles but not low obstacles',()=>{const r=new Run();r.obstacles=[{at:1,kind:'branch',hit:false},{at:3,kind:'cone',hit:false}];r.duck=true;tick(r,2);assert.equal(r.hits,0);tick(r,2);assert.equal(r.hits,1);});
test('puddles and rolling balls are low obstacles that require a jump',()=>{const r=new Run();r.obstacles=[{at:1,kind:'puddle',hit:false},{at:3,kind:'ball',hit:false}];tick(r,4);assert.equal(r.hits,2);});
test('new run resets all mutable state',()=>{const r=new Run(true);tick(r,66);const fresh=new Run();assert.equal(fresh.collected,0);assert.equal(fresh.elapsed,0);assert.ok(fresh.obstacles.every(o=>!o.hit));assert.ok(fresh.stars.every(s=>!s.collected));});
test('successful rhythm obstacles build a combo and a hit resets it',()=>{const r=new Run(true);r.obstacles=[{at:1,kind:'branch',hit:false,cleared:false},{at:3,kind:'branch',hit:false,cleared:false},{at:5,kind:'cone',hit:false,cleared:false}];r.duck=true;tick(r,4);assert.equal(r.combo,2);assert.equal(r.bestCombo,2);tick(r,2);assert.equal(r.combo,0);assert.equal(r.bestCombo,2);});
