import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CHAIN, CORE, DEAD, FINAL, FROZEN, KIND_RADIUS, MUTANT, T_EXPLOSION, WALKER } from '../src/sim/content';
import { Grid } from '../src/sim/grid';
import { Rng } from '../src/sim/rng';
import { World } from '../src/sim/world';
import { Zombies } from '../src/sim/zombies';

const idle = { mx: 0, my: 0, dash: false, ult: false };

test('zombie pool：swap-remove 後 active 清單與 pos 對照一致', () => {
  const z = new Zombies(500);
  const rng = new Rng(3);
  const alive = new Set<number>();
  for (let i = 0; i < 5000; i++) {
    if (alive.size > 0 && rng.next() < 0.45) {
      const arr = [...alive];
      const s = arr[rng.int(arr.length)];
      z.remove(s);
      alive.delete(s);
    } else {
      const s = z.spawn(WALKER, rng.next() * 100, rng.next() * 100, 0);
      if (s >= 0) alive.add(s);
    }
  }
  assert.equal(z.count, alive.size);
  for (let k = 0; k < z.count; k++) {
    const s = z.active[k];
    assert.ok(alive.has(s));
    assert.equal(z.pos[s], k);
  }
});

test('grid.query 與暴力搜尋結果相同', () => {
  const z = new Zombies(3000);
  const rng = new Rng(7);
  for (let i = 0; i < 3000; i++) z.spawn(rng.int(4), 200 + rng.next() * 600, 200 + rng.next() * 600, 0);
  const g = new Grid(3000);
  g.build(z);
  const out = new Int32Array(3000);
  for (let q = 0; q < 200; q++) {
    const x = 150 + rng.next() * 700;
    const y = 150 + rng.next() * 700;
    const r = rng.next() * 80;
    const n = g.query(z, x, y, r, out);
    const got = new Set(Array.from(out.subarray(0, n)));
    const want = new Set<number>();
    for (let k = 0; k < z.count; k++) {
      const s = z.active[k];
      const rr = r + KIND_RADIUS[z.kind[s]];
      if ((z.x[s] - x) ** 2 + (z.y[s] - y) ** 2 <= rr * rr) want.add(s);
    }
    assert.deepEqual(got, want);
  }
});

test('grid.nearest 找到的就是最近的那隻', () => {
  const z = new Zombies(800);
  const rng = new Rng(11);
  for (let i = 0; i < 800; i++) z.spawn(WALKER, 300 + rng.next() * 400, 300 + rng.next() * 400, 0);
  const g = new Grid(800);
  g.build(z);
  for (let q = 0; q < 100; q++) {
    const x = 300 + rng.next() * 400;
    const y = 300 + rng.next() * 400;
    const got = g.nearest(z, x, y, 500);
    let best = -1;
    let bestD = Infinity;
    for (let k = 0; k < z.count; k++) {
      const s = z.active[k];
      const d = (z.x[s] - x) ** 2 + (z.y[s] - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    assert.equal((z.x[got] - x) ** 2 + (z.y[got] - y) ** 2, (z.x[best] - x) ** 2 + (z.y[best] - y) ** 2);
  }
});

/** 在玩家旁邊放一團殭屍，回傳 slot 清單 */
function packCluster(w: World, kind: number, n: number, cx: number, cy: number, spacing: number) {
  const slots: number[] = [];
  const side = Math.ceil(Math.sqrt(n));
  for (let i = 0; i < n; i++) {
    const x = cx + ((i % side) - side / 2) * spacing;
    const y = cy + (Math.floor(i / side) - side / 2) * spacing;
    slots.push(w.zombies.spawn(kind, x, y, 0));
  }
  return slots;
}

function stepUntilQuiet(w: World, maxTicks: number) {
  let ticks = 0;
  do {
    w.step(idle);
    ticks++;
  } while (w.chain.count > 0 && ticks < maxTicks);
  return ticks;
}

test('冰凍屍群：一次爆炸 → 碎裂骨牌傳遍整團，且會結束', () => {
  const w = new World({ seed: 5, noSpawn: true, noSkills: true, god: true, autoLevel: true });
  const p = w.player;
  const slots = packCluster(w, WALKER, 225, p.x + 140, p.y, 9);
  for (const s of slots) {
    w.zombies.status[s] |= FROZEN;
    w.zombies.frozenT[s] = 99;
  }
  w.step(idle); // 建立網格
  w.damage(slots[0], 1, T_EXPLOSION, 0, -1);
  const ticks = stepUntilQuiet(w, 600);
  assert.ok(ticks < 600, '連鎖應在有限時間內結束');
  const survivors = slots.filter(s => !(w.zombies.status[s] & DEAD) && w.zombies.pos[s] >= 0).length;
  assert.equal(survivors, 0, '整團凍結殭屍都應碎裂');
  assert.ok(w.stats.maxChain >= 200, `CHAIN 應該很長，實際 ${w.stats.maxChain}`);
  // 延遲傳播：不是同一幀全部結算
  assert.ok(ticks > 10, `應該分散在多個 tick，實際 ${ticks}`);
});

test('感染核心密集群：毒爆／殉爆連鎖受深度上限保護，不會無限循環', () => {
  const w = new World({ seed: 9, noSpawn: true, noSkills: true, god: true, autoLevel: true });
  const p = w.player;
  const slots = packCluster(w, CORE, 400, p.x, p.y - 200, 8);
  w.step(idle);
  w.damage(slots[200], 999, T_EXPLOSION, 0, -1);
  const ticks = stepUntilQuiet(w, 3000);
  assert.ok(ticks < 3000, '連鎖應在有限時間內結束');
  assert.equal(w.chain.count, 0);
  assert.ok(w.stats.kills <= 400);
  assert.ok(w.stats.kills > 100, `毒爆應該連鎖擴散，實際擊殺 ${w.stats.kills}`);
  assert.ok(CHAIN.maxDepth >= 10);
});

test('流場：殭屍會繞過障礙物追到玩家', () => {
  const w = new World({ seed: 1, noSpawn: true, noSkills: true, god: true });
  const p = w.player;
  // 噴水池在玩家正北方，把殭屍放在池子另一側
  const f = w.map.fountain;
  const s = w.zombies.spawn(WALKER, f.x, f.y - f.r - 30, 0);
  const startD = Math.hypot(w.zombies.x[s] - p.x, w.zombies.y[s] - p.y);
  for (let t = 0; t < 60 * 30; t++) w.step(idle);
  const d = Math.hypot(w.zombies.x[s] - p.x, w.zombies.y[s] - p.y);
  assert.ok(d < 20, `30 秒內應繞過噴水池抵達玩家（起點 ${startD.toFixed(0)}px，終點 ${d.toFixed(0)}px）`);
});

test('同 seed 結果可重現', () => {
  const run = () => {
    const w = new World({ seed: 77, god: true, autoLevel: true, startTime: 120 });
    for (let t = 0; t < 600; t++) w.step({ mx: Math.cos(t / 40), my: Math.sin(t / 40), dash: t % 200 === 0, ult: false });
    return [w.stats.kills, w.zombies.count, w.player.x.toFixed(3), w.player.level];
  };
  assert.deepEqual(run(), run());
});

test('天降巨砲：全方位散射清空畫面內的殭屍（變異殭屍除外可殘血）', () => {
  const w = new World({ seed: 5, cap: 3000, noSpawn: true, noSkills: true, god: true, autoLevel: true, ult: 'pylon' });
  w.setView(640, 360);
  const p = w.player;
  const rng = new Rng(2);
  for (let i = 0; i < 2000; i++) w.zombies.spawn(WALKER, p.x + (rng.next() - 0.5) * 600, p.y + (rng.next() - 0.5) * 320, 0);
  w.step(idle);
  const inView = () => {
    let n = 0;
    const z = w.zombies;
    for (let k = 0; k < z.count; k++) {
      const s = z.active[k];
      if (Math.abs(z.x[s] - p.x) < 300 && Math.abs(z.y[s] - p.y) < 160 && !(z.status[s] & DEAD)) n++;
    }
    return n;
  };
  const before = inView();
  assert.ok(before > 100, `畫面內應有殭屍 (${before})`);
  p.ult = 1;
  w.step({ ...idle, ult: true });
  for (let t = 0; t < 60 * 3; t++) w.step(idle);
  assert.ok(w.shells.length > 0, '應有散射砲彈');
  const after = inView();
  assert.ok(after < before * 0.05, `散射後畫面內殘存 ${after}/${before}`);
});

test('最終波：時間到生出一圈巨大變異體，全部擊倒後 FINISH，再過幾秒才結算勝利', () => {
  const w = new World({ seed: 3, noSpawn: true, noSkills: true, god: true, autoLevel: true, startTime: 599.5 });
  const types: string[] = [];
  const run = (n: number) => {
    for (let i = 0; i < n; i++) {
      w.step(idle);
      for (const e of w.events) types.push(e.type);
      w.events.length = 0;
    }
  };
  run(60);
  assert.equal(w.finale, 'final');
  assert.ok(types.includes('finalWave'));
  assert.ok(w.finalLeft >= FINAL.mutants * 0.8, `最終波數量 ${w.finalLeft}`);
  assert.equal(w.over, '', '最終波還沒打完不能結束');
  // 把所有變異體打倒
  const z = w.zombies;
  for (let k = z.count - 1; k >= 0; k--) {
    const s = z.active[k];
    if (z.kind[s] === MUTANT) (w as unknown as { damage: (s: number, d: number, t: number, depth: number, c: number) => void }).damage(s, 1e9, T_EXPLOSION, 0, -1);
  }
  run(5);
  assert.equal(w.finale, 'finish');
  assert.ok(types.includes('finish'));
  assert.ok(w.stats.mutantKills >= w.finalTotal);
  assert.equal(w.over, '');
  run(Math.ceil(FINAL.finishDelay * 60) + 5);
  assert.equal(w.over, 'win');
});
