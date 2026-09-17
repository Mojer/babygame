import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cameraDistance, screenX, obstacleWorldX, SCHOOL_START, SCHOOL_WIDTH, foregroundVariant, landscapeAllowed } from '../src/world.ts';
import { PLAYER_X, DURATION } from '../src/model.ts';

test('obstacle stays fixed relative to its ground location across camera movement', () => {
  const obstacle = obstacleWorldX(12), tile = obstacle - 37;
  for (const time of [0, 4.5, 11.2, 12, 28]) assert.ok(Math.abs(screenX(obstacle, time) - screenX(tile, time) - 37) < 1e-9);
});
test('school gate is reached at the authored endpoint, independent of viewport', () => {
  assert.ok(Math.abs(screenX(SCHOOL_START + SCHOOL_WIDTH / 2, DURATION) - PLAYER_X) < 1e-9);
  assert.equal(screenX(5000, 10) - screenX(5000, 11), cameraDistance(1));
});
test('portrait is blocked and landscape is playable', () => {
  assert.equal(landscapeAllowed(390, 844), false);
  assert.equal(landscapeAllowed(844, 390), true);
  assert.equal(landscapeAllowed(1280, 720), true);
});
test('foreground art is stable for a world tile when recycled screen slots change', () => {
  const tile = 5;
  assert.equal(foregroundVariant(tile), 2);
  assert.equal(foregroundVariant(tile), foregroundVariant(2 + 3));
  assert.notEqual(foregroundVariant(tile), foregroundVariant(tile + 1));
});
