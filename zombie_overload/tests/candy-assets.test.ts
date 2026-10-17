import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import { buildMap } from '../src/sim/map';

test('糖果素材：所有地圖物件與五怪動作都可在共用圖集找到，影格不越界', () => {
  const base = new URL('../public/sprites/', import.meta.url);
  const sheet = JSON.parse(readFileSync(new URL('horde_stages.json', base), 'utf8'));
  const png = readFileSync(new URL(sheet.image, base));
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  const check = (name: string) => {
    const f = sheet.frames[name];
    assert.ok(f, `缺少 ${name}`);
    assert.ok(f.w > 0 && f.h > 0 && f.x >= 0 && f.y >= 0 && f.x+f.w <= width && f.y+f.h <= height, `${name} 超出圖集`);
    return `${f.x},${f.y}`;
  };
  for (const p of buildMap(42, 'candy').props) check('prop_'+p.kind);
  for (let k=0;k<5;k++) {
    assert.equal(new Set(Array.from({length:8}, (_, f)=>check(`c${k}_${f}`))).size, 8, '八格不能共用同一貼圖座標');
    for (const state of ['white','ice','corpse']) check(`c${k}_${state}`);
    assert.ok(existsSync(new URL(`candy_${k}.png`,base)));
  }
  const map = JSON.parse(readFileSync(new URL('map_candy.json',base),'utf8'));
  assert.ok(existsSync(new URL(map.image,base)));
  for (const tile of ['cloud','frosting','biscuit','cloudBorder']) assert.ok(map.frames['tile_'+tile]);
  assert.ok(existsSync(new URL('candy-ground-v2.jpg',base)));
  assert.ok(existsSync(new URL('../covers/candy-cover-v1.jpg',base)));
});
