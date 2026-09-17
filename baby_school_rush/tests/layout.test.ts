import { test } from 'node:test';
import assert from 'node:assert/strict';
import { worldLayout } from '../src/layout.ts';
import { GROUND, PLAYER_X, SPEED } from '../src/model.ts';

for (const [width, height] of [[390, 844], [844, 390], [320, 568], [1024, 1366], [1280, 720]]) {
  test(`full viewport ${width}x${height} keeps the lane and reaction distance`, () => {
    const layout = worldLayout(width, height);
    assert.ok(layout.worldWidth >= 640);
    assert.ok(Math.abs(layout.worldWidth * layout.zoom - width) < .001);
    assert.ok(Math.abs(layout.worldHeight * layout.zoom - height) < .001);
    assert.ok(Math.abs((GROUND - layout.top) * layout.zoom - height * .7) < .001);
    // The next obstacle enters at least two seconds before reaching the player.
    assert.ok((layout.worldWidth - PLAYER_X) / SPEED >= 2.1);
    assert.ok((GROUND - 96 - layout.top) * layout.zoom > 70);
  });
}
