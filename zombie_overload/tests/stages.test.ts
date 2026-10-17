import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BORDER, CELL, GRID_H, GRID_W, MAP_H, MAP_W, PLAYER, FINAL, MUTANT, T_EXPLOSION } from '../src/sim/content';
import { FLOW_INF } from '../src/sim/flowfield';
import { cellOf } from '../src/sim/grid';
import { buildMap } from '../src/sim/map';
import { stageId, STAGES } from '../src/sim/stages';
import { World } from '../src/sim/world';

const idle = { mx: 0, my: 0, dash: false, ult: false };

test('關卡：預設都市，可指定日式關卡，未知網址值不視為有效關卡', () => {
  assert.equal(new World({ noSpawn: true }).stage.id, 'city');
  const w = new World({ stage: 'japan', noSpawn: true });
  assert.equal(w.stage.name, '百鬼夜行');
  assert.equal(w.map.stage, 'japan');
  assert.equal(w.stage.enemies.length, STAGES.city.enemies.length);
  assert.equal(stageId('japan'), 'japan');
  assert.equal(stageId('missing'), null);
  assert.equal(stageId(null), null);
  assert.notDeepEqual(w.map.blocked, buildMap(1, 'city').blocked);
  assert.deepEqual(buildMap(42, 'japan'), buildMap(42, 'japan'));
});

for (const seed of [1, 42, 77]) {
  test(`百鬼夜行：seed ${seed} 的出生點淨空、邊界封閉、所有開放格子可達`, () => {
    const w = new World({ stage: 'japan', seed, noSpawn: true, noSkills: true });
    const b = w.map.blocked;
    const p = w.player;
    for (let y = -48; y <= 48; y += CELL) {
      for (let x = -48; x <= 48; x += CELL) assert.equal(b[cellOf(p.x + x, p.y + y)], 0, '出生區必須淨空');
    }
    let open = 0;
    for (let gy = 0; gy < GRID_H; gy++) {
      for (let gx = 0; gx < GRID_W; gx++) {
        const c = gy * GRID_W + gx;
        if (gx * CELL < BORDER || gy * CELL < BORDER || gx * CELL >= MAP_W - BORDER || gy * CELL >= MAP_H - BORDER) assert.equal(b[c], 1);
        if (b[c]) continue;
        open++;
        assert.ok(w.flow.dist[c] < FLOW_INF, `開放格子 (${gx}, ${gy}) 必須可達`);
      }
    }
    assert.ok(open > GRID_W * GRID_H * .65, '保留足夠的生存戰鬥空間');
    const kinds = new Set(w.map.props.map(x => x.kind));
    for (const kind of ['torii', 'shrine', 'sakura', 'bamboo', 'stoneLantern', 'yatai']) assert.ok(kinds.has(kind));
    assert.ok(!kinds.has('car') && !kinds.has('fountain'));
  });
}

test('百鬼夜行：玩家能穿過鳥居中央，柱腳會阻擋角色', () => {
  const w = new World({ stage: 'japan', noSpawn: true, noSkills: true });
  for (let i = 0; i < 150; i++) w.step({ ...idle, my: -1 });
  assert.ok(w.player.y < 1096 - 32, '能從出生點穿過第一座鳥居');
  const gate = w.map.props.find(p => p.kind === 'torii')!;
  assert.equal(w.map.blocked[cellOf(gate.x + 26, gate.y + 8)], 1);
  assert.equal(w.map.blocked[cellOf(gate.x + gate.w / 2, gate.y + 8)], 0);
  const before = w.player.y = gate.y + gate.h + PLAYER.radius + 24;
  w.player.x = gate.x + 26;
  for (let i = 0; i < 60; i++) w.step({ ...idle, my: -1 });
  assert.ok(w.player.y < before, '玩家應走到柱腳前');
  assert.ok(w.player.y >= gate.y + gate.h + PLAYER.radius, '不應穿過鳥居柱腳');
});

test('百鬼夜行：最終巨獸波可完成並進入勝利結算', () => {
  const w = new World({ stage: 'japan', seed: 42, startTime: 599.5, noSpawn: true, noSkills: true, god: true, autoLevel: true });
  for (let i = 0; i < 60; i++) w.step(idle);
  assert.equal(w.finale, 'final');
  assert.ok(w.finalLeft >= FINAL.mutants * .8);
  const z = w.zombies;
  for (let k = z.count - 1; k >= 0; k--) {
    const s = z.active[k];
    if (z.kind[s] === MUTANT) w.damage(s, 1e9, T_EXPLOSION, 0, -1);
  }
  for (let i = 0; i < Math.ceil(FINAL.finishDelay * 60) + 10; i++) w.step(idle);
  assert.equal(w.over, 'win');
  assert.equal(w.stage.boss, '荒魂巨獸');
});

for (const seed of [1, 42, 77]) {
  test(`糖果夢境：seed ${seed} 的出生區、全場可達、獨立場景與彩虹通道`, () => {
    const w = new World({ stage: 'candy', seed, noSpawn: true, noSkills: true });
    assert.equal(w.stage.number, '03');
    assert.equal(stageId('candy'), 'candy');
    assert.equal(w.map.stage, 'candy');
    assert.deepEqual(buildMap(seed, 'candy'), buildMap(seed, 'candy'));
    assert.notDeepEqual(w.map.blocked, buildMap(seed, 'japan').blocked);
    for (let y = -48; y <= 48; y += CELL) for (let x = -48; x <= 48; x += CELL) assert.equal(w.map.blocked[cellOf(w.player.x+x,w.player.y+y)], 0);
    for (let gy = 0; gy < GRID_H; gy++) for (let gx = 0; gx < GRID_W; gx++) {
      const c = gy * GRID_W + gx;
      if (gx*CELL < BORDER || gy*CELL < BORDER || gx*CELL >= MAP_W-BORDER || gy*CELL >= MAP_H-BORDER) assert.equal(w.map.blocked[c],1);
      if (!w.map.blocked[c]) assert.ok(w.flow.dist[c] < FLOW_INF, `開放格子 (${gx},${gy}) 必須可達`);
    }
    for (const kind of ['candyHouse','rainbowArch','lollipopTree','rainbowCandy','cupcakeTower','candyCane','chocolateFountain','biscuitBridge']) assert.ok(w.map.props.some(p=>p.kind===kind));
    const gate=w.map.props.find(p=>p.kind==='rainbowArch')!;
    assert.equal(w.map.blocked[cellOf(gate.x+gate.w/2,gate.y+12)],0);
    assert.equal(w.map.blocked[cellOf(gate.x+12,gate.y+12)],1);
    for(let i=0;i<150;i++) w.step({...idle,my:-1});
    assert.ok(w.player.y<1088-32,'可穿過主彩虹門');
  });
}

test('糖果夢境：巧克力熔岩最終波可完成並勝利',()=>{
  const w=new World({stage:'candy',seed:42,startTime:599.5,noSpawn:true,noSkills:true,god:true,autoLevel:true});
  for(let i=0;i<60;i++) w.step(idle);
  assert.equal(w.finale,'final');
  assert.ok(w.finalLeft>=FINAL.mutants*.8);
  for(let k=w.zombies.count-1;k>=0;k--){const s=w.zombies.active[k];if(w.zombies.kind[s]===MUTANT)w.damage(s,1e9,T_EXPLOSION,0,-1);}
  for(let i=0;i<Math.ceil(FINAL.finishDelay*60)+10;i++)w.step(idle);
  assert.equal(w.over,'win');
  assert.equal(w.stage.boss,'巧克力熔岩怪');
});
