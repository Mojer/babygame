import { Container, Particle, ParticleContainer, type Renderer, RenderTexture, Sprite, Texture, type TextureSource } from 'pixi.js';
import { MAP_H, MAP_W } from '../sim/content';

const CHUNK = 256;
const CW = MAP_W / CHUNK;
const CH = MAP_H / CHUNK;
const BAKE_POOL = 1024;

/**
 * 地面層：整張地圖切成 256² 的 RenderTexture。
 * 屍體、血跡、焦痕直接「烘」進地面貼圖 → 清場後滿地血海，之後每幀成本為零。
 * 64 塊 × 256KB = 16MB 顯示記憶體。
 */
export class ChunkLayer {
  readonly container = new Container();
  private readonly rts: RenderTexture[] = [];
  private readonly sprites: Sprite[] = [];
  /** ParticleContainer 只能用單一貼圖來源，每個來源一個烘焙容器 */
  private readonly bakes = new Map<TextureSource, { pc: ParticleContainer; pool: Particle[] }>();
  /** 每塊待烘焙的貼花（chunk 內座標） */
  private readonly pending: { tex: Texture; x: number; y: number; rot: number; scale: number; color: number }[][] = [];
  private readonly dirty: number[] = [];

  constructor(atlasSource: Texture) {
    for (let cy = 0; cy < CH; cy++) {
      for (let cx = 0; cx < CW; cx++) {
        const rt = RenderTexture.create({ width: CHUNK, height: CHUNK, scaleMode: 'nearest' });
        const sp = new Sprite(rt);
        sp.position.set(cx * CHUNK, cy * CHUNK);
        this.rts.push(rt);
        this.sprites.push(sp);
        this.container.addChild(sp);
        this.pending.push([]);
      }
    }
    this.bakeFor(atlasSource);
  }

  private bakeFor(tex: Texture) {
    let b = this.bakes.get(tex.source);
    if (!b) {
      const pc = new ParticleContainer({
        texture: tex,
        dynamicProperties: { position: true, rotation: true, uvs: true, color: true, vertex: true },
      });
      const pool: Particle[] = [];
      for (let i = 0; i < BAKE_POOL; i++) pool.push(new Particle({ texture: tex, anchorX: 0.5, anchorY: 0.5 }));
      b = { pc, pool };
      this.bakes.set(tex.source, b);
    }
    return b;
  }

  /** 載入時把整張地圖畫進各 chunk */
  paintStatic(renderer: Renderer, mapCanvas: HTMLCanvasElement) {
    const tex = Texture.from(mapCanvas);
    tex.source.scaleMode = 'nearest';
    const sp = new Sprite(tex);
    const holder = new Container();
    holder.addChild(sp);
    for (let i = 0; i < this.rts.length; i++) {
      const cx = i % CW;
      const cy = (i / CW) | 0;
      sp.position.set(-cx * CHUNK, -cy * CHUNK);
      renderer.render({ container: holder, target: this.rts[i], clear: true });
    }
    holder.destroy({ children: true });
    tex.destroy(true);
  }

  /** 加一個貼花（世界座標），跨 chunk 邊界的會同時烘進相鄰塊 */
  addDecal(tex: Texture, x: number, y: number, rot: number, scale: number, color: number) {
    const half = Math.max(tex.frame.width, tex.frame.height) * scale * 0.75;
    const x0 = Math.max(0, Math.floor((x - half) / CHUNK));
    const x1 = Math.min(CW - 1, Math.floor((x + half) / CHUNK));
    const y0 = Math.max(0, Math.floor((y - half) / CHUNK));
    const y1 = Math.min(CH - 1, Math.floor((y + half) / CHUNK));
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const i = cy * CW + cx;
        const list = this.pending[i];
        if (list.length === 0) this.dirty.push(i);
        if (list.length < BAKE_POOL) list.push({ tex, x: x - cx * CHUNK, y: y - cy * CHUNK, rot, scale, color });
      }
    }
  }

  flush(renderer: Renderer) {
    for (const i of this.dirty) {
      const list = this.pending[i];
      // 依貼圖來源分批，按加入順序烘焙（同來源連續的一段一批）
      let start = 0;
      while (start < list.length) {
        const src = list[start].tex.source;
        let end = start;
        while (end < list.length && list[end].tex.source === src) end++;
        const { pc, pool } = this.bakeFor(list[start].tex);
        const children = pc.particleChildren;
        for (let k = start; k < end; k++) {
          const d = list[k];
          const p = pool[k - start];
          p.texture = d.tex;
          p.x = d.x;
          p.y = d.y;
          p.rotation = d.rot;
          p.scaleX = p.scaleY = d.scale;
          p.color = d.color;
          children[k - start] = p;
        }
        children.length = end - start;
        pc.update();
        renderer.render({ container: pc, target: this.rts[i], clear: false });
        start = end;
      }
      list.length = 0;
    }
    this.dirty.length = 0;
  }

  /** 只顯示鏡頭範圍內的 chunk */
  cull(x0: number, y0: number, x1: number, y1: number) {
    for (let i = 0; i < this.sprites.length; i++) {
      const sx = (i % CW) * CHUNK;
      const sy = ((i / CW) | 0) * CHUNK;
      this.sprites[i].visible = sx < x1 && sx + CHUNK > x0 && sy < y1 && sy + CHUNK > y0;
    }
  }
}

