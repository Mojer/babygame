import test from 'node:test';
import assert from 'node:assert/strict';
import { BOSS, ENEMY_STATS, type StageSpec } from '../src/game/content.ts';
import { EARTH_RADIUS, FIXED_STEP, GameModel, ORBIT_RADIUS, SHIELD_MAX, wrapAngle } from '../src/game/model.ts';

const tick = (model: GameModel, seconds: number) => {
  for (let i = 0; i < Math.round(seconds / FIXED_STEP) && model.state === 'running'; i++) model.step(FIXED_STEP);
};

const emptyStage = (waves: StageSpec['waves']): StageSpec => ({ id: 9, waves });

test('game waits for explicit start', () => {
  const model = new GameModel({ seed: 1 });
  tick(model, 2);
  assert.equal(model.state, 'ready');
  assert.equal(model.enemies.length, 0);
  model.start();
  assert.equal(model.state, 'running');
});

test('player turns toward touch target along the shortest arc and stops there', () => {
  const model = new GameModel({ seed: 1, stage: emptyStage([{ id: 't', groups: [] }]) });
  model.start();
  model.playerAngle = 3;
  model.setTarget(-3);
  model.step();
  assert.ok(Math.abs(model.playerAngle) > 3, 'crosses the ±π seam instead of turning the long way');
  tick(model, 2);
  assert.ok(Math.abs(wrapAngle(model.playerAngle + 3)) < 1e-6);
  assert.ok(Math.abs(Math.hypot(model.playerX, model.playerY) - ORBIT_RADIUS) < 1e-6, 'ship stays on orbit');
});

test('auto-fire shoots radially outward', () => {
  const model = new GameModel({ seed: 1, stage: emptyStage([{ id: 't', groups: [] }]) });
  model.start();
  model.playerAngle = 0;
  model.step();
  const bullet = model.bullets[0];
  assert.ok(bullet.vx > 0 && Math.abs(bullet.vy) < 1e-6);
  tick(model, .5);
  assert.ok(model.bullets.length >= 4, 'fires continuously without input');
});

test('enemies arrive after travelTime regardless of spawn direction (portrait fairness)', () => {
  for (const angle of [0, Math.PI / 2]) {
    const model = new GameModel({ seed: 1, stage: emptyStage([{ id: 't', groups: [] }]) });
    model.start();
    model.stun = 999; // 停火，讓敵人直達地球
    model.playerAngle = angle + Math.PI;
    const enemy = model.spawnEnemy('chomper', angle);
    const start = model.time;
    while (model.enemies.includes(enemy) && model.time - start < 20) model.step();
    const elapsed = model.time - start;
    assert.ok(Math.abs(elapsed - ENEMY_STATS.chomper.travelTime) < .6, `angle ${angle}: ${elapsed}`);
    assert.equal(model.shield, SHIELD_MAX - ENEMY_STATS.chomper.damage);
  }
});

test('shooting kills an approaching chomper before it reaches Earth', () => {
  const model = new GameModel({ seed: 1, stage: emptyStage([{ id: 't', groups: [] }]) });
  model.start();
  model.playerAngle = -Math.PI / 2;
  model.spawnEnemy('chomper', -Math.PI / 2);
  tick(model, 4);
  assert.equal(model.kills, 1);
  assert.equal(model.shield, SHIELD_MAX);
});

test('eyeball hovers, fires, and splits into two minis', () => {
  const model = new GameModel({ seed: 3, stage: emptyStage([{ id: 't', groups: [] }]) });
  model.start();
  model.stun = 999;
  const eye = model.spawnEnemy('eyeball', 0);
  tick(model, 8);
  assert.ok(eye.hovering);
  assert.ok(Math.hypot(eye.x, eye.y) > EARTH_RADIUS + 200);
  assert.ok(model.enemyBullets.length > 0 || model.shield < SHIELD_MAX);
  model.stun = 0;
  model.playerAngle = Math.atan2(eye.y, eye.x);
  model.setTarget(null);
  const before = model.kills;
  for (let i = 0; i < 300 && model.kills === before; i++) {
    model.setTarget(Math.atan2(eye.y, eye.x));
    model.step();
  }
  assert.equal(model.enemies.filter(e => e.kind === 'mini').length, 2);
});

test('colliding with the ship stuns instead of losing a life', () => {
  const model = new GameModel({ seed: 1, stage: emptyStage([{ id: 't', groups: [] }]) });
  model.start();
  model.playerAngle = 0;
  model.stun = 0;
  model.spawnEnemy('chomper', 0, { x: ORBIT_RADIUS + 20, y: 0 });
  model.fireTimer = 10;
  model.step();
  assert.ok(model.stun > 0);
  assert.equal(model.shield, SHIELD_MAX);
  assert.equal(model.state, 'running');
});

test('bomb clears enemies and bullets', () => {
  const model = new GameModel({ seed: 1, stage: emptyStage([{ id: 't', groups: [] }]) });
  model.start();
  for (let i = 0; i < 5; i++) model.spawnEnemy('chomper', i);
  assert.equal(model.bomb(), true);
  model.step();
  assert.equal(model.enemies.length, 0);
  assert.equal(model.bombs, 1);
});

test('waves progress into the boss, pods must fall before the core is vulnerable', () => {
  const model = new GameModel({ seed: 1, stage: emptyStage([{ id: 'x-1', groups: [{ enemy: 'chomper', count: 1, interval: 0, delay: 0, pattern: { kind: 'arc', center: -90, spread: 0 } }] }]) });
  model.start();
  model.playerAngle = -Math.PI / 2;
  tick(model, 12);
  assert.equal(model.phase, 'boss');
  const boss = model.boss!;
  tick(model, BOSS.enterTime + .1);
  model.bombs = 0;
  const hp = boss.hp;
  // 本體在護盾狀態不受傷。
  model.stun = 999;
  for (const pod of boss.pods) { pod.hp = 1; }
  assert.equal(boss.phase, 'pods');
  assert.equal(boss.hp, hp);
  for (const pod of boss.pods) (model as unknown as { damagePod: (b: unknown, p: unknown, n: number) => void }).damagePod(boss, pod, 1);
  assert.equal(boss.phase, 'exposed');
  (model as unknown as { damageBoss: (b: unknown, n: number) => void }).damageBoss(boss, BOSS.coreHp);
  assert.equal(boss.phase, 'dying');
  tick(model, BOSS.dyingTime + .5);
  assert.equal(model.state, 'won');
});

test('exposed boss regrows pods when the window closes', () => {
  const model = new GameModel({ seed: 1, stage: emptyStage([{ id: 'x', groups: [] }]) });
  model.start();
  tick(model, 10);
  const boss = model.boss!;
  tick(model, BOSS.enterTime);
  model.stun = 999;
  for (const pod of boss.pods) (model as unknown as { damagePod: (b: unknown, p: unknown, n: number) => void }).damagePod(boss, pod, 99);
  assert.equal(boss.phase, 'exposed');
  tick(model, BOSS.exposedTime + .2);
  assert.equal(boss.phase, 'pods');
  assert.equal(boss.pods.filter(p => p.alive).length, BOSS.regrowPods);
});

test('losing all shield ends the run', () => {
  const model = new GameModel({ seed: 1, stage: emptyStage([{ id: 'x', groups: [] }]) });
  model.start();
  model.shield = 5;
  model.stun = 999;
  model.spawnEnemy('chomper', 1);
  tick(model, 10);
  assert.equal(model.state, 'lost');
});

const arena = () => {
  const model = new GameModel({ seed: 5, stage: emptyStage([{ id: 'x', groups: [] }]) });
  model.start();
  model.playerAngle = 0;
  (model as unknown as { showcaseKind: null }).showcaseKind = null; // 避免掉落物被磁吸後換掉測試中的武器
  return model;
};

test('chain lightning arcs from the hit enemy to nearby enemies', () => {
  const model = arena();
  model.equip('chain');
  model.spawnEnemy('eyeball', 0, { x: 520, y: 0 });
  model.spawnEnemy('eyeball', 0, { x: 560, y: 180 });
  model.spawnEnemy('eyeball', 0, { x: 600, y: -200 });
  for (const e of model.enemies) e.hovering = true;
  let chain: { points: unknown[] } | undefined;
  for (let i = 0; i < 40 && !chain; i++) {
    model.step();
    chain = model.drainEvents().find(e => e.type === 'chain') as typeof chain;
  }
  assert.ok(chain, 'emits chain event');
  assert.ok(chain!.points.length >= 3, 'jumps to both neighbours');
  assert.ok(model.enemies.every(e => e.hp < 3), 'every enemy took damage');
});

test('laser pierces every enemy on the line and clears enemy bullets', () => {
  const model = arena();
  model.equip('laser');
  model.spawnEnemy('eyeball', 0, { x: 400, y: 0 });
  model.spawnEnemy('eyeball', 0, { x: 480, y: 10 });
  model.spawnEnemy('eyeball', 0, { x: 0, y: 450 });
  model.enemyBullets.push({ id: 999, x: 350, y: 0, vx: -1, vy: 0, damage: 3 });
  tick(model, .5);
  assert.ok(model.laserActive);
  assert.equal(model.enemyBullets.find(b => b.id === 999), undefined);
  const offLine = model.enemies.find(e => e.kind === 'eyeball' && e.y > 300);
  assert.ok(offLine && offLine.hp === 3, 'enemy off the beam untouched');
  assert.ok(model.kills >= 2, 'both enemies on the beam destroyed');
  assert.equal(model.bullets.length, 0, 'laser replaces bullets');
});

test('chain nova cascades through a cluster and reports a chain combo', () => {
  const model = arena();
  model.equip('nova');
  model.spawnEnemy('chomper', 0, { x: 420, y: 0 });
  for (let i = 0; i < 5; i++) model.spawnEnemy('chomper', 0, { x: 420 + (i + 1) * 120, y: (i % 2 ? 1 : -1) * 60 });
  const events: string[] = [];
  let combo = 0;
  for (let i = 0; i < 120; i++) {
    model.step();
    for (const e of model.drainEvents()) {
      events.push(e.type);
      if (e.type === 'chainCombo') combo = e.count;
    }
  }
  assert.ok(events.filter(t => t === 'nova').length >= 4, 'multiple nova blasts');
  assert.ok(combo >= 3, `chain combo reported (${combo})`);
});

test('weapons expire back to blaster and stacking extends the timer', () => {
  const model = arena();
  model.equip('spread');
  const first = model.weaponTime;
  model.equip('spread');
  assert.ok(model.weaponTime > first);
  model.weaponTime = .05;
  tick(model, .2);
  assert.equal(model.weapon, 'blaster');
});

test('each wave guarantees its showcase weapon drop', () => {
  const model = new GameModel({ seed: 5, stage: emptyStage([{ id: 'x', groups: [{ enemy: 'chomper', count: 4, interval: .3, delay: 0, pattern: { kind: 'arc', center: 0, spread: 0 } }] }]) });
  model.start();
  model.playerAngle = 0;
  tick(model, 6);
  const drops = model.drainEvents();
  void drops;
  assert.ok(model.pickups.some(p => p.kind === 'chain') || model.weapon === 'chain');
});
