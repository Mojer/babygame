import { BORDER, CELL, GRID_H, GRID_W, MAP_H, MAP_W } from './content';
import { Rng } from './rng';
import type { StageId } from './stages';
import { buildJapanMap } from './mapJapan';

export type PropKind = 'building' | 'car' | 'wreck' | 'planter' | 'fountain' | 'bench' | 'bin' | 'barrier' | 'lamp' | 'hydrant' | 'cones' | 'crates' | 'cart'
  | 'shrine' | 'torii' | 'sakura' | 'stoneLantern' | 'yatai' | 'bamboo' | 'komainu' | 'bridge';

export interface Prop {
  kind: PropKind;
  x: number;
  y: number;
  w: number;
  h: number;
  /** 車頭方向／外觀變化 */
  variant: number;
  vertical: boolean;
  blocks: boolean;
}

export interface MapLayout {
  stage: StageId;
  props: Prop[];
  roadsH: [number, number][];
  roadsV: [number, number][];
  /** 1 = 障礙物格子 */
  blocked: Uint8Array;
  spawn: { x: number; y: number };
  /** 噴水池：r 是水平半徑；3/4 視角下地面足跡是扁橢圓，垂直半徑 ry */
  fountain: { x: number; y: number; r: number; ry: number };
}

/** 都市廣場：外圍建築、十字道路與停放車輛、中央噴水池、花台 */
export function buildMap(seed: number, stage: StageId = 'city'): MapLayout {
  if (stage === 'japan') return buildJapanMap(seed);
  const rng = new Rng(seed ^ 0x5eed);
  const props: Prop[] = [];
  const roadsH: [number, number][] = [[592, 688], [1360, 1456]];
  const roadsV: [number, number][] = [[592, 688], [1360, 1456]];
  const cx = MAP_W / 2;
  const cy = MAP_H / 2;
  const fountain = { x: cx, y: cy, r: 56, ry: 28 };

  // 外圍建築（切成數棟，屋頂各不相同）
  const addBuildingRow = (horizontal: boolean, fixed: number) => {
    let p = 0;
    while (p < MAP_W) {
      const len = Math.min(MAP_W - p, 192 + rng.int(4) * 64);
      if (horizontal) props.push({ kind: 'building', x: p, y: fixed, w: len, h: BORDER, variant: rng.int(4), vertical: false, blocks: true });
      else props.push({ kind: 'building', x: fixed, y: p, w: BORDER, h: len, variant: rng.int(4), vertical: true, blocks: true });
      p += len;
    }
  };
  addBuildingRow(true, 0);
  addBuildingRow(true, MAP_H - BORDER);
  addBuildingRow(false, 0);
  addBuildingRow(false, MAP_W - BORDER);

  const overlaps = (x: number, y: number, w: number, h: number, pad: number) =>
    props.some(p => p.blocks && x < p.x + p.w + pad && x + w > p.x - pad && y < p.y + p.h + pad && y + h > p.y - pad);
  const nearFountain = (x: number, y: number, w: number, h: number, pad: number) => {
    const nx = Math.max(x, Math.min(fountain.x, x + w));
    const ny = Math.max(y, Math.min(fountain.y, y + h));
    return Math.hypot(nx - fountain.x, ny - fountain.y) < fountain.r + pad;
  };

  // 沿道路兩側停車（路邊停車格，對齊 16px）
  for (const [a, b] of roadsH) {
    for (const lane of [a, b - 16]) {
      for (let x = BORDER + 32; x < MAP_W - BORDER - 48; x += 48) {
        if (roadsV.some(([va, vb]) => x + 32 > va - 32 && x < vb + 32)) continue;
        if (rng.next() < 0.45) continue;
        const wreck = rng.next() < 0.15;
        props.push({ kind: wreck ? 'wreck' : 'car', x, y: lane, w: 32, h: 16, variant: rng.int(6), vertical: false, blocks: true });
      }
    }
  }
  for (const [a, b] of roadsV) {
    for (const lane of [a, b - 16]) {
      for (let y = BORDER + 32; y < MAP_H - BORDER - 48; y += 48) {
        if (roadsH.some(([ha, hb]) => y + 32 > ha - 32 && y < hb + 32)) continue;
        if (rng.next() < 0.45) continue;
        const wreck = rng.next() < 0.15;
        props.push({ kind: wreck ? 'wreck' : 'car', x: lane, y, w: 16, h: 32, variant: rng.int(6), vertical: true, blocks: true });
      }
    }
  }
  // 路中央幾台橫停的事故車，製造瓶頸
  for (let i = 0; i < 6; i++) {
    const horizontal = rng.next() < 0.5;
    const road = (horizontal ? roadsH : roadsV)[rng.int(2)];
    const along = BORDER + 96 + rng.int(((MAP_W - BORDER * 2 - 192) / 16) | 0) * 16;
    const across = road[0] + 32 + rng.int(3) * 16;
    const x = horizontal ? along : across - 8;
    const y = horizontal ? across - 8 : along;
    const w = horizontal ? 32 : 16;
    const h = horizontal ? 16 : 32;
    const snapX = Math.round(x / 16) * 16;
    const snapY = Math.round(y / 16) * 16;
    if (!overlaps(snapX, snapY, w, h, 24)) props.push({ kind: 'wreck', x: snapX, y: snapY, w, h, variant: rng.int(6), vertical: !horizontal, blocks: true });
  }

  props.push({ kind: 'fountain', x: fountain.x - 64, y: fountain.y - 64, w: 128, h: 128, variant: 0, vertical: false, blocks: false });

  // 廣場花台：方格狀排列，隨機缺漏
  for (let gy = BORDER + 96; gy < MAP_H - BORDER - 64; gy += 128) {
    for (let gx = BORDER + 96; gx < MAP_W - BORDER - 64; gx += 128) {
      if (rng.next() < 0.5) continue;
      const x = gx + rng.int(3) * 16;
      const y = gy + rng.int(3) * 16;
      if (overlaps(x, y, 32, 32, 40) || nearFountain(x, y, 32, 32, 90) || onRoad(x, y, 32, 32, roadsH, roadsV, 16)) continue;
      if (Math.abs(x + 16 - cx) < 80 && Math.abs(y + 16 - (cy + 160)) < 80) continue; // 出生點淨空
      props.push({ kind: 'planter', x, y, w: 32, h: 32, variant: rng.int(3), vertical: false, blocks: true });
    }
  }
  // 不擋路的小物件
  for (let i = 0; i < 90; i++) {
    const x = BORDER + 24 + rng.int(MAP_W - BORDER * 2 - 48);
    const y = BORDER + 24 + rng.int(MAP_H - BORDER * 2 - 48);
    const r = rng.next();
    const kind: PropKind = r < 0.5 ? 'bench' : r < 0.8 ? 'bin' : 'barrier';
    const vertical = rng.next() < 0.5;
    const w = kind === 'bench' ? (vertical ? 8 : 20) : kind === 'bin' ? 8 : vertical ? 6 : 24;
    const h = kind === 'bench' ? (vertical ? 20 : 8) : kind === 'bin' ? 8 : vertical ? 24 : 6;
    if (overlaps(x, y, w, h, 8) || nearFountain(x, y, w, h, 12)) continue;
    props.push({ kind, x, y, w, h, variant: rng.int(3), vertical, blocks: false });
  }

  // 純裝飾（不擋路，放在最後才不會改變前面物件的亂數序列）：人行道路燈、消防栓、事故車旁的三角錐
  for (let x = BORDER + 80; x < MAP_W - BORDER - 40; x += 192) {
    props.push({ kind: 'lamp', x, y: BORDER + 14, w: 6, h: 6, variant: 0, vertical: false, blocks: false });
    props.push({ kind: 'lamp', x, y: MAP_H - BORDER - 22, w: 6, h: 6, variant: 0, vertical: false, blocks: false });
  }
  for (let i = 0; i < 24; i++) {
    const x = BORDER + 24 + rng.int(MAP_W - BORDER * 2 - 48);
    const y = BORDER + 24 + rng.int(MAP_H - BORDER * 2 - 48);
    if (overlaps(x, y, 12, 12, 10) || nearFountain(x, y, 12, 12, 16)) continue;
    const r = rng.next();
    const kind: PropKind = r < 0.35 ? 'hydrant' : r < 0.6 ? 'cart' : r < 0.8 ? 'crates' : 'cones';
    props.push({ kind, x, y, w: 12, h: 12, variant: rng.int(2), vertical: false, blocks: false });
  }
  for (const p of props.slice()) {
    if (p.kind === 'wreck' && rng.next() < 0.5) props.push({ kind: 'cones', x: p.x + p.w + 4, y: p.y + p.h - 6, w: 10, h: 6, variant: 0, vertical: false, blocks: false });
  }

  const blocked = new Uint8Array(GRID_W * GRID_H);
  for (const p of props) {
    if (!p.blocks) continue;
    const x0 = Math.floor(p.x / CELL);
    const y0 = Math.floor(p.y / CELL);
    const x1 = Math.ceil((p.x + p.w) / CELL) - 1;
    const y1 = Math.ceil((p.y + p.h) / CELL) - 1;
    for (let gy = Math.max(0, y0); gy <= Math.min(GRID_H - 1, y1); gy++) {
      for (let gx = Math.max(0, x0); gx <= Math.min(GRID_W - 1, x1); gx++) blocked[gy * GRID_W + gx] = 1;
    }
  }
  // 噴水池水盆（橢圓足跡）
  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      const dx = ((gx + 0.5) * CELL - fountain.x) / fountain.r;
      const dy = ((gy + 0.5) * CELL - fountain.y) / fountain.ry;
      if (dx * dx + dy * dy < 1) blocked[gy * GRID_W + gx] = 1;
    }
  }

  return { stage: 'city', props, roadsH, roadsV, blocked, spawn: { x: cx, y: cy + 160 }, fountain };
}

function onRoad(x: number, y: number, w: number, h: number, roadsH: [number, number][], roadsV: [number, number][], pad: number) {
  return roadsH.some(([a, b]) => y + h > a - pad && y < b + pad) || roadsV.some(([a, b]) => x + w > a - pad && x < b + pad);
}
