import { BORDER, CELL, GRID_H, GRID_W, MAP_H, MAP_W } from './content';
import type { MapLayout, Prop, PropKind } from './map';
import { Rng } from './rng';

/** 雲上糖果王國：開放廣場、彩虹門、糖果屋與軟糖花園。碰撞只取物件地面足跡。 */
export function buildCandyMap(seed: number): MapLayout {
  const rng = new Rng(seed ^ 0x63616e64);
  const props: Prop[] = [];
  const blocked = new Uint8Array(GRID_W * GRID_H);
  const spawn = { x: 1024, y: 1184 };
  const roadsH: [number, number][] = [[560, 656], [960, 1056], [1456, 1552]];
  const roadsV: [number, number][] = [[448, 544], [960, 1088], [1504, 1600]];
  const rect = (x: number, y: number, w: number, h: number) => {
    for (let gy = Math.max(0, Math.floor(y / CELL)); gy < Math.min(GRID_H, Math.ceil((y + h) / CELL)); gy++) {
      for (let gx = Math.max(0, Math.floor(x / CELL)); gx < Math.min(GRID_W, Math.ceil((x + w) / CELL)); gx++) blocked[gy * GRID_W + gx] = 1;
    }
  };
  const add = (kind: PropKind, cx: number, cy: number, w: number, h: number, blocks = true) => {
    const p: Prop = { kind, x: cx - w / 2, y: cy - h / 2, w, h, variant: rng.int(3), vertical: false, blocks };
    props.push(p);
    if (blocks) rect(p.x, p.y, w, h);
  };
  rect(0, 0, MAP_W, BORDER);
  rect(0, MAP_H - BORDER, MAP_W, BORDER);
  rect(0, 0, BORDER, MAP_H);
  rect(MAP_W - BORDER, 0, BORDER, MAP_H);
  for (const [x, y] of [[496, 384], [1024, 352], [1552, 384], [304, 1296], [1744, 1296], [720, 1712], [1328, 1712]]) add('candyHouse', x, y, 112, 48);
  const rainbow = (x: number, y: number) => {
    add('rainbowArch', x, y, 152, 24, false);
    // Cloud feet sit at the ends of the arch. Its central opening is walkable.
    rect(x - 76, y - 12, 32, 24);
    rect(x + 44, y - 12, 32, 24);
  };
  rainbow(1024, 1088);
  rainbow(496, 720);
  rainbow(1552, 720);
  add('chocolateFountain', 1024, 800, 56, 24);
  for (const x of [896, 1152]) {
    add('cupcakeTower', x, 896, 32, 24);
    for (const y of [1104, 1328, 1584]) add('candyCane', x, y, 16, 16);
  }
  add('biscuitBridge', 736, 1248, 88, 20, false);
  add('biscuitBridge', 1328, 1248, 88, 20, false);
  const onPath = (x: number, y: number) => roadsV.some(([a, b]) => x > a - 64 && x < b + 64)
    || roadsH.some(([a, b]) => y > a - 64 && y < b + 64);
  for (let gy = 240; gy < MAP_H - 160; gy += 176) {
    for (let gx = 240; gx < MAP_W - 160; gx += 176) {
      const x = gx + rng.int(3) * 16, y = gy + rng.int(3) * 16;
      if (onPath(x, y) || Math.hypot(x - spawn.x, y - spawn.y) < 208) continue;
      if (props.some(p => Math.abs(x - (p.x + p.w / 2)) < p.w / 2 + 64 && Math.abs(y - (p.y + p.h / 2)) < p.h / 2 + 64)) continue;
      add(rng.next() < .55 ? 'lollipopTree' : 'rainbowCandy', x, y, 24, 16);
    }
  }
  for (let x = 176; x < MAP_W - BORDER; x += 144) {
    add('cupcakeTower', x, 112, 32, 24, false);
    add('rainbowCandy', x, MAP_H - 96, 40, 20, false);
  }
  for (let y = 240; y < MAP_H - BORDER; y += 160) {
    add('lollipopTree', 104, y, 24, 16, false);
    add('candyCane', MAP_W - 104, y, 20, 16, false);
  }
  return { stage: 'candy', props, roadsH, roadsV, blocked, spawn, fountain: { x: 1024, y: 800, r: 0, ry: 0 } };
}
