import { BORDER, CELL, GRID_H, GRID_W, MAP_H, MAP_W } from './content';
import type { MapLayout, Prop, PropKind } from './map';
import { Rng } from './rng';

/** 月下神社：三條參道、祭典街與櫻花庭園。座標描述地面足跡，冠頂不擋路。 */
export function buildJapanMap(seed: number): MapLayout {
  const rng = new Rng(seed ^ 0x796f6b61);
  const props: Prop[] = [];
  const blocked = new Uint8Array(GRID_W * GRID_H);
  const spawn = { x: 1024, y: 1184 };
  const roadsH: [number, number][] = [[944, 1040], [1456, 1552]];
  const roadsV: [number, number][] = [[448, 528], [960, 1088], [1520, 1600]];
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
  // 連續封閉的邊界；內側是竹林與町屋，不沿用都市的汽車與花台。
  rect(0, 0, MAP_W, BORDER);
  rect(0, MAP_H - BORDER, MAP_W, BORDER);
  rect(0, 0, BORDER, MAP_H);
  rect(MAP_W - BORDER, 0, BORDER, MAP_H);
  for (let x = 176; x < MAP_W - BORDER; x += 144) {
    add('yatai', x, BORDER - 10, 64, 28, false);
    add('bamboo', x, MAP_H - BORDER + 28, 32, 24, false);
  }
  for (let y = 208; y < MAP_H - BORDER; y += 128) {
    add('bamboo', BORDER - 8, y, 28, 24, false);
    add('bamboo', MAP_W - BORDER + 8, y, 28, 24, false);
  }
  // 主神社與左右庭園的副殿。
  add('shrine', 1024, 824, 128, 48);
  add('shrine', 496, 432, 128, 48);
  add('shrine', 1552, 432, 128, 48);
  const gate = (x: number, y: number) => {
    add('torii', x, y, 120, 16, false);
    // 鳥居只有柱腳碰撞，中央通道可通行。
    // 素材縮至 120px 後，柱腳位於中心左右約 34px（含 2px 透明邊）。
    rect(x - 42, y - 8, 18, 16);
    rect(x + 24, y - 8, 20, 16);
  };
  gate(1024, 1096);
  gate(1024, 1392);
  gate(496, 624);
  gate(1552, 624);
  for (const x of [928, 1120]) {
    add('komainu', x, 912, 24, 20);
    for (let y = 1104; y <= 1744; y += 160) add('stoneLantern', x, y, 12, 12);
  }
  // 燈籠祭典街：攤位在參道外側，保持道路連通。
  for (const y of [896, 1088, 1408, 1600]) {
    for (let x = 272; x < MAP_W - 240; x += 192) {
      if (roadsV.some(([a, b]) => x > a - 72 && x < b + 72)) continue;
      add('yatai', x, y, 64, 28);
      add('stoneLantern', x + 48, y + 32, 12, 12);
    }
  }
  const onPath = (x: number, y: number) => roadsV.some(([a, b]) => x > a - 64 && x < b + 64)
    || roadsH.some(([a, b]) => y > a - 64 && y < b + 64);
  for (let gy = 240; gy < MAP_H - 176; gy += 176) {
    for (let gx = 240; gx < MAP_W - 176; gx += 176) {
      const x = gx + rng.int(3) * 16;
      const y = gy + rng.int(3) * 16;
      if (onPath(x, y) || Math.hypot(x - spawn.x, y - spawn.y) < 180) continue;
      if (props.some(p => p.blocks && Math.abs(x - (p.x + p.w / 2)) < p.w / 2 + 56 && Math.abs(y - (p.y + p.h / 2)) < p.h / 2 + 56)) continue;
      add(rng.next() < 0.75 ? 'sakura' : 'bamboo', x, y, 24, 16);
    }
  }
  add('bridge', 736, 1248, 80, 20, false);
  add('bridge', 1328, 1248, 80, 20, false);
  return { stage: 'japan', props, roadsH, roadsV, blocked, spawn, fountain: { x: 1024, y: 824, r: 0, ry: 0 } };
}
