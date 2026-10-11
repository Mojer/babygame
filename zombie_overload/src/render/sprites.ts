import { ImageSource, Rectangle, Texture } from 'pixi.js';
import { CHARACTER_IDS, type CharacterId } from '../sim/characters';
import type { MapSheet } from './mapPainterOblique';

/**
 * 3/4 斜俯視的正式風格素材（AI 生成 → art_spike/pack_sprites.py 打包成圖集）。
 * 角色一律朝右繪製，左右靠 scaleX = -1 翻轉；錨點在腳底。
 */
export type PlayerDir = 'side' | 'down' | 'up';
const DIRS: PlayerDir[] = ['side', 'down', 'up'];

export interface HordeSprites {
  /** [種類][0-3 走路, 4 受擊白, 5 冰凍] */
  zombie: Texture[][];
  /** 每種殭屍的腳底錨點（0-1，相對貼圖高度） */
  anchorY: number[];
  corpse: Texture[];
  /** 每個角色、每個方向：[0-3 跑步, 4 受擊白]；side 朝右（左邊靠翻轉） */
  player: Record<CharacterId, Record<PlayerDir, Texture[]>>;
  playerAnchorY: Record<CharacterId, Record<PlayerDir, number>>;
  /** 外觀提案（有打包才有），例：akane_heavy */
  skins: Record<string, { frames: Record<PlayerDir, Texture[]>; anchorY: Record<PlayerDir, number> }>;
  /** 每個角色的基本攻擊投射物與命中爆光（加法混合） */
  attack: Record<CharacterId, { bolt: Texture; hit: Texture }>;
  /** 場景物件（和角色同一張圖集，才能一起 y 排序）；錨點在底部中央 */
  props: Record<string, Texture>;
  /** 地磚與建築立面（Canvas 繪製用） */
  map: MapSheet;
  boom: Texture[];
  /** 爆炸貼圖邊長（世界像素），換算縮放用 */
  boomSize: number;
}

interface FrameDef {
  x: number;
  y: number;
  w: number;
  h: number;
  ay?: number;
}

interface SheetDef {
  image: string;
  frames: Record<string, FrameDef>;
}

async function loadSheet(base: string, name: string) {
  const def = (await (await fetch(`${base}${name}.json`)).json()) as SheetDef;
  // 直接解碼成 ImageBitmap（不經 Assets 的 worker 管線，分頁在背景時也能載入）。
  // WebGL 對 ImageBitmap 不套用上傳時預乘，所以解碼時就預乘並明確告訴 Pixi。
  const blob = await (await fetch(`${base}${def.image}`)).blob();
  const bitmap = await createImageBitmap(blob, { premultiplyAlpha: 'premultiply' });
  const tex = new Texture({ source: new ImageSource({ resource: bitmap, alphaMode: 'premultiplied-alpha', scaleMode: 'nearest' }) });
  const get = (k: string) => {
    const f = def.frames[k];
    if (!f) throw new Error(`sprite frame missing: ${name}/${k}`);
    return new Texture({ source: tex.source, frame: new Rectangle(f.x, f.y, f.w, f.h) });
  };
  return { def, get };
}

export async function loadHordeSprites(base = './sprites/'): Promise<HordeSprites> {
  const horde = await loadSheet(base, 'horde');
  const boom = await loadSheet(base, 'explosion');
  const mapDef = (await (await fetch(`${base}map.json`)).json()) as SheetDef;
  const mapImage = await createImageBitmap(await (await fetch(`${base}${mapDef.image}`)).blob());
  const props: Record<string, Texture> = {};
  for (const k of Object.keys(horde.def.frames)) if (k.startsWith('prop_')) props[k.slice(5)] = horde.get(k);
  const kinds = [0, 1, 2, 3, 4];
  const boomFrames = Object.keys(boom.def.frames).filter(k => k.startsWith('ex_')).sort((a, b) => Number(a.slice(3)) - Number(b.slice(3)));
  return {
    zombie: kinds.map(k => [0, 1, 2, 3].map(f => horde.get(`z${k}_${f}`)).concat([horde.get(`z${k}_white`), horde.get(`z${k}_ice`)])),
    anchorY: kinds.map(k => horde.def.frames[`z${k}_0`].ay ?? 0.95),
    corpse: kinds.map(k => horde.get(`z${k}_corpse`)),
    player: Object.fromEntries(
      CHARACTER_IDS.map(c => [c, Object.fromEntries(DIRS.map(d => {
        const pre = d === 'side' ? `p_${c}` : `p_${c}_${d}`;
        return [d, [0, 1, 2, 3].map(f => horde.get(`${pre}_${f}`)).concat([horde.get(`${pre}_white`)])];
      }))]),
    ) as Record<CharacterId, Record<PlayerDir, Texture[]>>,
    playerAnchorY: Object.fromEntries(
      CHARACTER_IDS.map(c => [c, Object.fromEntries(DIRS.map(d => [d, horde.def.frames[d === 'side' ? `p_${c}_0` : `p_${c}_${d}_0`].ay ?? 0.95]))]),
    ) as Record<CharacterId, Record<PlayerDir, number>>,
    skins: Object.fromEntries(
      ['akane_heavy']
        .filter(k => horde.def.frames[`p_${k}_0`])
        .map(k => [k, {
          frames: Object.fromEntries(DIRS.map(d => {
            const pre = d === 'side' ? `p_${k}` : `p_${k}_${d}`;
            return [d, [0, 1, 2, 3].map(f => horde.get(`${pre}_${f}`)).concat([horde.get(`${pre}_white`)])];
          })) as Record<PlayerDir, Texture[]>,
          anchorY: Object.fromEntries(DIRS.map(d => [d, horde.def.frames[d === 'side' ? `p_${k}_0` : `p_${k}_${d}_0`].ay ?? 0.95])) as Record<PlayerDir, number>,
        }]),
    ),
    attack: Object.fromEntries(CHARACTER_IDS.map(c => [c, { bolt: horde.get(`atk_${c}`), hit: horde.get(`hit_${c}`) }])) as Record<CharacterId, { bolt: Texture; hit: Texture }>,
    props,
    map: { image: mapImage, frames: mapDef.frames },
    boom: boomFrames.map(k => boom.get(k)),
    boomSize: boom.def.frames[boomFrames[0]].w,
  };
}
