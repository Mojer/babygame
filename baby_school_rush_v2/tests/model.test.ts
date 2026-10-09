import test from 'node:test';
import assert from 'node:assert/strict';
import { DEADLINE, FIXED_STEP, GameModel, PLAYER_SCREEN_X, RUSH_SECONDS, type RuntimeObstacle } from '../src/game/model.ts';
import { BASELINE, CROSSING, LEVEL_LENGTH, LOWER_ROUTE, platforms, type ObstacleKind, type Route } from '../src/game/content.ts';

const firstLower = platforms.find(platform => platform.route === 'lower')!;
const firstRooftop = platforms.find(platform => platform.route === 'upper' && !platform.deck)!;

const tick = (model: GameModel, seconds: number) => {
  for (let i = 0; i < Math.round(seconds / FIXED_STEP) && model.state === 'running'; i++) model.step(FIXED_STEP);
};

const obstacle = (x: number, y: number, height = 30, route: Route = 'middle', kind: ObstacleKind = 'barrier'): RuntimeObstacle => ({
  id: `test-${x}`,
  x,
  y,
  width: 40,
  height,
  kind,
  route,
  hit: false,
  cleared: false,
  reached: false,
  onRoute: false,
  lateDodge: false,
  destroyed: false
});

/** Seconds until the standing runner's front edge reaches the obstacle. */
const leadTime = (model: GameModel, target: RuntimeObstacle) =>
  (target.x - target.width / 2 - (model.distance + PLAYER_SCREEN_X + 19)) / model.speed;

const runUntilLead = (model: GameModel, target: RuntimeObstacle, lead: number) => {
  while (model.state === 'running' && leadTime(model, target) > lead) model.step(FIXED_STEP);
};

const isolatedRun = (...course: RuntimeObstacle[]) => {
  const model = new GameModel();
  model.start();
  model.obstacles = course;
  model.pickups = [];
  return model;
};

const placeOn = (model: GameModel, worldX: number, y: number, route: Route) => {
  model.distance = worldX - PLAYER_SCREEN_X;
  model.y = y;
  model.grounded = true;
  model.route = route;
};

test('run starts explicitly and countdown resource is stable before start', () => {
  const model = new GameModel();
  tick(model, 2);
  assert.equal(model.state, 'ready');
  assert.equal(model.timeLeft, DEADLINE);
  model.start();
  tick(model, 1);
  assert.ok(model.timeLeft < DEADLINE);
});

test('jump supports one air jump but not a third jump', () => {
  const model = new GameModel();
  model.start();
  model.jump();
  assert.equal(model.jumps, 1);
  model.jump();
  assert.equal(model.jumps, 2);
  const velocity = model.vy;
  model.jump();
  assert.equal(model.jumps, 2);
  assert.equal(model.vy, velocity);
});

test('air slide becomes fast fall', () => {
  const model = new GameModel();
  model.start();
  model.jump();
  model.setSlide(true);
  assert.ok(model.vy >= 620);
  assert.equal(model.pose, 'fall');
});

test('slide press and release emit animation boundary events', () => {
  const model = new GameModel();
  model.start();
  model.setSlide(true);
  model.setSlide(false);
  assert.deepEqual(model.consumeEvents().map(event => event.type), ['slide-start', 'slide-end']);
});

test('a last-moment jump awards perfect, combo and rush', () => {
  const target = obstacle(PLAYER_SCREEN_X + 300, BASELINE);
  const model = isolatedRun(target);
  runUntilLead(model, target, .18);
  model.jump();
  tick(model, 1);
  assert.equal(model.hits, 0);
  assert.equal(model.perfects, 1);
  assert.equal(model.combo, 1);
  assert.equal(model.rush, 25);
});

test('an early jump clears the obstacle without a perfect', () => {
  const target = obstacle(PLAYER_SCREEN_X + 300, BASELINE);
  const model = isolatedRun(target);
  runUntilLead(model, target, .4);
  model.jump();
  tick(model, 1);
  assert.equal(model.hits, 0);
  assert.equal(model.perfects, 0);
  assert.equal(model.combo, 1);
  assert.equal(model.rush, 7);
});

test('a last-moment slide under a beam is a perfect', () => {
  const beam = obstacle(PLAYER_SCREEN_X + 300, BASELINE - 68, 30, 'middle', 'beam');
  const model = isolatedRun(beam);
  runUntilLead(model, beam, .1);
  model.setSlide(true);
  tick(model, .6);
  assert.equal(model.hits, 0);
  assert.equal(model.perfects, 1);
});

test('obstacles on another route award nothing, even after a late input', () => {
  const far = obstacle(PLAYER_SCREEN_X + 300, 200, 30, 'upper');
  const model = isolatedRun(far);
  runUntilLead(model, far, .1);
  model.setSlide(true);
  tick(model, .6);
  assert.equal(far.cleared, true);
  assert.equal(model.perfects, 0);
  assert.equal(model.combo, 0);
  assert.equal(model.rush, 0);
});

test('collision removes time and breaks combo without ending the run', () => {
  const model = new GameModel();
  model.start();
  model.combo = 4;
  model.obstacles = [obstacle(PLAYER_SCREEN_X + 90, 430, 70)];
  tick(model, .4);
  assert.equal(model.hits, 1);
  assert.equal(model.combo, 0);
  assert.ok(model.timeLeft < DEADLINE - 3.5);
  assert.equal(model.state, 'running');
});

test('four perfect dodges trigger the independent rush state', () => {
  const course = [300, 700, 1_100, 1_500].map(dx => obstacle(PLAYER_SCREEN_X + dx, BASELINE));
  const model = isolatedRun(...course);
  for (const target of course) {
    runUntilLead(model, target, .15);
    model.jump();
  }
  tick(model, .9);
  assert.equal(model.perfects, 4);
  assert.equal(model.rushCount, 1);
  assert.ok(model.rushTimer > 0 && model.rushTimer <= RUSH_SECONDS);
  assert.equal(model.pose, 'rush');
});

test('rush destroys a colliding obstacle instead of applying a time penalty', () => {
  const model = new GameModel();
  model.start();
  model.rushTimer = RUSH_SECONDS;
  model.obstacles = [obstacle(PLAYER_SCREEN_X + 90, 430, 70)];
  tick(model, .4);
  assert.equal(model.hits, 0);
  assert.equal(model.obstacles[0].destroyed, true);
});

test('preview trigger starts rush once and emits the presentation event', () => {
  const model = new GameModel();
  model.start();
  assert.equal(model.triggerRush(), true);
  assert.equal(model.triggerRush(), false);
  assert.equal(model.rushCount, 1);
  assert.equal(model.consumeEvents()[0]?.type, 'rush-start');
});

test('an obstacle crossed during hit invincibility cannot award a free combo', () => {
  const model = new GameModel();
  model.start();
  model.invincible = 1;
  model.obstacles = [obstacle(PLAYER_SCREEN_X + 90, 430, 70)];
  tick(model, .5);
  assert.equal(model.combo, 0);
  assert.equal(model.perfects, 0);
});

test('ignoring the route eventually loses to the school bell', () => {
  const model = new GameModel();
  model.start();
  tick(model, DEADLINE + 1);
  assert.equal(model.state, 'lost');
  assert.equal(model.timeLeft, 0);
});

test('route phases change pace and reaching the authored distance wins', () => {
  const model = new GameModel();
  model.start();
  const initialSpeed = model.speed;
  model.distance = LEVEL_LENGTH * .42;
  model.step(FIXED_STEP);
  assert.ok(model.speed > initialSpeed);
  model.distance = LEVEL_LENGTH - 1;
  model.step(FIXED_STEP);
  assert.equal(model.state, 'won');
  assert.equal(model.progress, 1);
});

test('sliding down from the street lands on the lower route', () => {
  const model = isolatedRun();
  placeOn(model, firstLower.x + 150, BASELINE, 'middle');
  model.setSlide(true);
  model.setSlide(false);
  tick(model, .6);
  assert.equal(model.hits, 0);
  assert.equal(model.grounded, true);
  assert.equal(model.y, LOWER_ROUTE);
  assert.equal(model.route, 'lower');
});

test('the lower route passes under street obstacles', () => {
  const bike = obstacle(firstLower.x + 450, BASELINE, 56, 'middle', 'bike');
  const model = isolatedRun(bike);
  placeOn(model, firstLower.x + 150, LOWER_ROUTE, 'lower');
  tick(model, 1.2);
  assert.equal(bike.cleared, true);
  assert.equal(model.hits, 0);
  assert.equal(model.combo, 0);
});

test('a lower route ramps the runner back up to the street when it ends', () => {
  const model = isolatedRun();
  placeOn(model, firstLower.x + firstLower.width - 50, LOWER_ROUTE, 'lower');
  tick(model, 1.2);
  assert.equal(model.hits, 0);
  assert.equal(model.grounded, true);
  assert.equal(model.y, BASELINE);
  assert.equal(model.route, 'middle');
});

test('running off an upper platform falls back to the street', () => {
  const model = isolatedRun();
  placeOn(model, firstRooftop.x + firstRooftop.width - 50, firstRooftop.y, 'upper');
  tick(model, 1);
  assert.equal(model.hits, 0);
  assert.equal(model.grounded, true);
  assert.equal(model.y, BASELINE);
  assert.equal(model.route, 'middle');
});

test('a fast fall from a low jump lands on the street instead of falling through it', () => {
  const model = isolatedRun();
  model.jump();
  tick(model, .08);
  model.setSlide(true);
  tick(model, 1);
  assert.equal(model.hits, 0);
  assert.equal(model.y, BASELINE);
});

/** Starts a clear run at the moment the crossing bell rings. */
const atCrossingWarning = () => {
  const model = isolatedRun();
  placeOn(model, CROSSING.trackX - CROSSING.warnDistance, BASELINE, 'middle');
  return model;
};

const runPastTracks = (model: GameModel, seconds = 10) => {
  const types: string[] = [];
  for (let i = 0; i < seconds / FIXED_STEP && model.distance + PLAYER_SCREEN_X < CROSSING.trackX + CROSSING.trackWidth + 400; i++) {
    model.step(FIXED_STEP);
    types.push(...model.consumeEvents().map(event => event.type));
  }
  return types;
};

test('a clear street run lasts about ninety seconds', () => {
  const model = isolatedRun();
  tick(model, DEADLINE);
  assert.equal(model.state, 'won');
  assert.ok(model.realTime > 86 && model.realTime < 96, `run took ${model.realTime.toFixed(1)}s`);
});

test('the crossing gate holds a street runner until the train has passed', () => {
  const model = atCrossingWarning();
  model.combo = 3;
  const types = runPastTracks(model);
  assert.ok(types.includes('crossing-warning') && types.includes('blocked') && types.includes('train-out'));
  assert.ok(types.indexOf('blocked') < types.indexOf('train-out'));
  assert.equal(model.crossingOutcome, 'blocked');
  assert.equal(model.combo, 0);
  assert.equal(model.hits, 0);
  assert.ok(model.distance + PLAYER_SCREEN_X > CROSSING.trackX + CROSSING.trackWidth);
});

test('sliding while held at the gate cannot squeeze through it', () => {
  const model = atCrossingWarning();
  while (!model.blocked) model.step(FIXED_STEP);
  const heldAt = model.distance;
  model.slideHeld = true;
  tick(model, .5);
  assert.ok(model.distance <= heldAt);
  assert.equal(model.blocked, true);
});

test('the underpass crosses under the train for a bonus', () => {
  const model = atCrossingWarning();
  while (model.distance + PLAYER_SCREEN_X < CROSSING.trackX - 600) model.step(FIXED_STEP);
  model.setSlide(true);
  model.setSlide(false);
  const types = runPastTracks(model);
  assert.ok(types.includes('crossing-clear'));
  assert.ok(!types.includes('blocked'));
  assert.equal(model.crossingOutcome, 'cleared');
  assert.equal(model.rush, 20);
});

test('the footbridge crosses over the train for a bonus', () => {
  const model = atCrossingWarning();
  while (model.distance + PLAYER_SCREEN_X < CROSSING.trackX - 680) model.step(FIXED_STEP);
  model.jump();
  tick(model, .35);
  model.jump();
  const types = runPastTracks(model);
  assert.ok(types.includes('crossing-clear'));
  assert.ok(!types.includes('blocked'));
  assert.equal(model.crossingOutcome, 'cleared');
});
