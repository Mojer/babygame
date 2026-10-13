import {
  autoDetectRenderer,
  Container,
  Graphics,
  Particle,
  ParticleContainer,
  type Renderer,
  RenderTexture,
  Sprite,
  Texture,
  TextureStyle,
} from 'pixi.js';
import {
  BRUTE,
  CAUSE_BLAST,
  CAUSE_BURN,
  CAUSE_PLAGUE,
  CAUSE_SHATTER,
  CORE,
  FROZEN,
  MUTANT,
  PULLED,
  SKILLS,
  TIERS,
  type TierName,
  VOLATILE,
  ZOMBIE_KINDS,
} from '../sim/content';
import { FX_BOLT_HIT, FX_SPLASH, FX_BURST, FX_COLLAPSE, FX_FREEZE, FX_PLAGUE, FX_SCORCH, FX_SHARD } from '../sim/logs';
import type { GameEvent, World } from '../sim/world';
import { type Atlas, buildAtlas } from './atlas';
import { ChunkLayer } from './chunks';
import { abgr, WHITE } from './color';
import { bgr, FxSystem } from './fx';
import { LensFilter } from './lens';
import { paintMap } from './mapPainter';
import { paintMapOblique } from './mapPainterOblique';
import { paintMapJapan } from './mapPainterJapan';
import type { CharacterId } from '../sim/characters';
import type { HordeSprites, PlayerDir } from './sprites';

/** 短邊大約看到幾個世界像素（實際值會依整數縮放微調） */
const TARGET_VIEW = 400;

interface GfxRing {
  x: number;
  y: number;
  r0: number;
  r1: number;
  t: number;
  dur: number;
  color: number;
  width: number;
  fill: number;
}

const C = {
  ice: bgr(0x9fe0ff),
  iceWhite: bgr(0xe8f8ff),
  orange: bgr(0xffa040),
  hot: bgr(0xfff0b0),
  green: bgr(0xb8f040),
  purple: bgr(0xb070ff),
  cyan: bgr(0x60e0ff),
  blood: bgr(0x8a1c1c),
  gib: bgr(0x7a2020),
  ichor: bgr(0x7aa030),
  ember: bgr(0xff7a30),
  white: bgr(0xffffff),
};

/** 血跡半透明疊加：越殺越深，但不會一下子把地面整片蓋死 */
const BLOOD = abgr(0xffffff, 0.55);
/** y 排序鍵裡代表主角的索引（殭屍索引 < 8192） */
const PLAYER_KEY = 16383;
const PROP_BASE = 8192;
const BOSS_HIT = abgr(0xff9a9a);

/** 主角面向 → 用哪組圖：上下為主（|sin| 明顯大於 |cos|）用上／下圖，否則側面圖 */
function playerDir(facing: number): PlayerDir {
  const c = Math.cos(facing);
  const s = Math.sin(facing);
  if (Math.abs(s) > Math.abs(c) * 1.2) return s > 0 ? 'down' : 'up';
  return 'side';
}
/** 掃蕩艦離地高度（世界像素） */
const SHIP_ALT = 34;
/** 3/4 角色的槍口離地高度（世界像素） */
const GUN_Y = 11;
/** 天降巨砲頂端發射口離地高度（device sprite） */
const DEVICE_MUZZLE = 84;

export class GameRenderer {
  renderer!: Renderer;
  atlas!: Atlas;
  zoom = 3;
  viewW = 600;
  viewH = 400;
  rendererName = '';
  tier: TierName = 'high';
  camX = 0;
  camY = 0;

  private worldRT!: RenderTexture;
  private postRT!: RenderTexture;
  private readonly stage = new Container();
  private readonly display = new Sprite();
  private readonly flash = new Sprite(Texture.WHITE);
  private readonly worldRoot = new Container();
  private readonly camera = new Container();
  /** 主角層：在黑洞透鏡之後才疊上去，主角永遠不會被扭曲／看起來被吸進去 */
  private readonly overlayRoot = new Container();
  private readonly overlayCam = new Container();
  private readonly playerRing = new Graphics();
  private chunks!: ChunkLayer;
  private readonly holeLayer = new Container();
  private readonly holeSprites: Sprite[] = [];
  private readonly holeGlows: Sprite[] = [];
  /** 3/4 斜俯視風格素材；沒有時用程式畫的 90° 俯視佔位圖 */
  sprites: HordeSprites | null = null;
  private allSprites: HordeSprites | null = null;
  private topdown = false;
  private shadowPC!: ParticleContainer;
  private readonly shadowParts: Particle[] = [];
  private sortKeys = new Float64Array(4096);
  private sortY = new Float32Array(4096);
  private fxBoom: FxSystem | null = null;
  private lastPlayer = { x: 0, y: 0, facing: 0 };
  private readonly shipSprite = new Sprite();
  private readonly deviceSprite = new Sprite();
  private charId: CharacterId = 'akane';
  /** 角色命中爆光（用角色圖集，加法混合） */
  private fxHit: FxSystem | null = null;
  /** 3/4 風格的場景物件：和角色一起 y 排序（sortY = 地面足跡中心） */
  private readonly props: { tex: Texture; x: number; y: number; sortY: number; flip: number }[] = [];
  private gemsPC!: ParticleContainer;
  private zombiesPC!: ParticleContainer;
  private boltsPC!: ParticleContainer;
  private readonly gemParts: Particle[] = [];
  private readonly zParts: Particle[] = [];
  private readonly boltParts: Particle[] = [];
  private playerSprite!: Sprite;
  private fxNormal!: FxSystem;
  private fxAdd!: FxSystem;
  private readonly gfx = new Graphics();
  private readonly gfxAdd = new Graphics();
  private readonly rings: GfxRing[] = [];
  private readonly postHolder = new Container();
  private readonly postSprite = new Sprite();
  private lens!: LensFilter;
  private shake = 0;
  private flashColor = 0xffffff;
  private flashA = 0;
  private time = 0;
  private atlasTexture!: Texture;

  async init(parent: HTMLElement, world: World, loadSprites?: () => Promise<HordeSprites>, topdown = false) {
    this.topdown = topdown;
    TextureStyle.defaultOptions.scaleMode = 'nearest';
    this.renderer = await autoDetectRenderer({
      preference: 'webgl',
      background: 0x0b0c0e,
      antialias: false,
      resolution: 1,
      autoDensity: false,
      powerPreference: 'high-performance',
      width: 16,
      height: 16,
    });
    this.rendererName = this.renderer.name;
    parent.appendChild(this.renderer.canvas);

    this.atlas = buildAtlas();
    if (loadSprites) {
      try {
        this.allSprites = await loadSprites();
        this.sprites = topdown && world.stage.id === 'city' ? null : { ...this.allSprites, ...this.allSprites.stageArt[world.stage.id] };
      } catch (e) {
        console.warn('3/4 風格素材載入失敗，改用佔位圖', e);
      }
    }
    this.atlasTexture = this.atlas.t.dot;
    const atlasTex = this.atlasTexture;

    this.chunks = new ChunkLayer(atlasTex);
    this.paintStage(world);
    if (this.sprites) this.buildProps(world, this.sprites);

    // 粒子數量每幀變動且 slot 會重排，所有屬性都設為 dynamic（static 屬性只在 update() 時上傳）
    const allDynamic = { position: true, rotation: true, uvs: true, color: true, vertex: true };
    this.gemsPC = new ParticleContainer({ texture: atlasTex, dynamicProperties: allDynamic });
    this.zombiesPC = new ParticleContainer({ texture: this.sprites ? this.sprites.zombie[0][0] : atlasTex, dynamicProperties: allDynamic });
    this.shadowPC = new ParticleContainer({ texture: atlasTex, dynamicProperties: allDynamic });
    if (this.sprites) {
      // 逐格爆炸用一般混合：火焰不透明、煙是半透明深灰（加法混合會讓煙發光）
      this.fxBoom = new FxSystem(this.sprites.boom[0], 160, false);
      this.fxHit = new FxSystem(this.sprites.zombie[0][0], 240, true);
    }
    this.boltsPC = new ParticleContainer({ texture: this.sprites ? this.sprites.zombie[0][0] : atlasTex, dynamicProperties: allDynamic });
    this.boltsPC.blendMode = 'add';
    this.playerSprite = new Sprite(this.atlas.player[0]);
    this.playerSprite.anchor.set(0.5);
    if (this.sprites) this.playerSprite.anchor.set(0.5, 0.95);
    for (let i = 0; i < 4; i++) {
      const glow = new Sprite(this.atlas.glow[64]);
      glow.anchor.set(0.5);
      glow.blendMode = 'add';
      glow.tint = 0x8a3cff;
      glow.visible = false;
      const hole = new Sprite(this.atlas.t.hole);
      hole.anchor.set(0.5);
      hole.visible = false;
      this.holeGlows.push(glow);
      this.holeSprites.push(hole);
      this.holeLayer.addChild(glow);
    }
    for (const h of this.holeSprites) this.holeLayer.addChild(h);
    this.fxNormal = new FxSystem(atlasTex, TIERS.high.particles / 2, false);
    this.fxAdd = new FxSystem(atlasTex, TIERS.high.particles, true);
    this.gfxAdd.blendMode = 'add';

    this.camera.addChild(
      this.chunks.container,
      this.gfx,
      this.gemsPC,
      this.holeLayer,
      this.shadowPC,
      this.zombiesPC,
      this.fxNormal.container,
      this.boltsPC,
      ...(this.fxBoom ? [this.fxBoom.container] : []),
      ...(this.fxHit ? [this.fxHit.container] : []),
      this.fxAdd.container,
      this.gfxAdd,
      this.deviceSprite,
      this.shipSprite,
    );
    this.shipSprite.anchor.set(0.5);
    this.shipSprite.visible = false;
    this.shipSprite.texture = this.sprites?.props.ship ?? this.atlas.glow[64];
    this.deviceSprite.anchor.set(0.5, 0.92);
    this.deviceSprite.visible = false;
    this.deviceSprite.texture = this.sprites?.props.device ?? this.atlas.glow[64];
    this.worldRoot.addChild(this.camera);
    this.playerRing.blendMode = 'add';
    this.overlayCam.addChild(this.playerRing, this.playerSprite);
    this.overlayRoot.addChild(this.overlayCam);

    this.lens = new LensFilter();
    this.postSprite.filters = [this.lens];
    this.postHolder.addChild(this.postSprite);

    this.flash.blendMode = 'add';
    this.flash.alpha = 0;
    this.stage.addChild(this.display, this.flash);
    this.resize();
  }

  setCharacter(id: CharacterId) {
    this.charId = id;
  }

  /** 開局前換關卡：重烘靜態地面，所有關卡共用同一張粒子圖集。 */
  setStage(world: World) {
    this.sprites = this.allSprites && !(this.topdown && world.stage.id === 'city')
      ? { ...this.allSprites, ...this.allSprites.stageArt[world.stage.id] } : null;
    this.paintStage(world);
    this.props.length = 0;
    if (this.sprites) this.buildProps(world, this.sprites);
    this.zombiesPC.texture = this.sprites?.zombie[0][0] ?? this.atlasTexture;
    this.boltsPC.texture = this.sprites?.zombie[0][0] ?? this.atlasTexture;
    this.shipSprite.texture = this.sprites?.props.ship ?? this.atlas.glow[64];
    this.deviceSprite.texture = this.sprites?.props.device ?? this.atlas.glow[64];
  }

  private paintStage(world: World) {
    const map = this.sprites
      ? world.stage.id === 'japan' ? paintMapJapan(world.map, this.sprites.map) : paintMapOblique(world.map, this.sprites.map)
      : paintMap(world.map);
    this.chunks.paintStatic(this.renderer, map);
  }

  /** 外觀提案（null = 該角色預設外觀）；只在素材存在時生效 */
  skin: string | null = null;
  setSkin(skin: string | null) {
    this.skin = skin && this.sprites?.skins[skin] ? skin : null;
  }

  /** 角色主色（拖尾、槍口火光） */
  private get charColor() {
    return this.charId === 'yu' ? C.cyan : bgr(0xff6ec7);
  }

  get canvas() {
    return this.renderer.canvas;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    const cw = Math.max(1, Math.round(cssW * dpr));
    const ch = Math.max(1, Math.round(cssH * dpr));
    this.zoom = Math.max(1, Math.round(Math.min(cw, ch) / TARGET_VIEW));
    this.viewW = Math.ceil(cw / this.zoom);
    this.viewH = Math.ceil(ch / this.zoom);
    this.renderer.resize(cw, ch, 1);
    const canvas = this.renderer.canvas;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    this.worldRT?.destroy(true);
    this.postRT?.destroy(true);
    this.worldRT = RenderTexture.create({ width: this.viewW, height: this.viewH, scaleMode: 'nearest' });
    this.postRT = RenderTexture.create({ width: this.viewW, height: this.viewH, scaleMode: 'nearest' });
    this.display.texture = this.worldRT;
    this.display.scale.set(this.zoom);
    this.flash.width = cw;
    this.flash.height = ch;
  }

  setTier(t: TierName) {
    this.tier = t;
    this.fxAdd.setBudget(TIERS[t].particles);
    this.fxNormal.setBudget(TIERS[t].particles / 2);
  }

  get particleCount() {
    return this.fxAdd.count + this.fxNormal.count;
  }

  addShake(v: number) {
    this.shake = Math.min(1, this.shake + v);
  }

  doFlash(color: number, a: number) {
    if (a >= this.flashA) this.flashColor = color;
    this.flashA = Math.min(0.85, Math.max(this.flashA, a));
  }

  // ───────────────────────── 事件 → 特效 ─────────────────────────

  consume(w: World) {
    const tier = TIERS[this.tier];
    const a = this.atlas;
    const fa = this.fxAdd;
    const fn = this.fxNormal;
    const rnd = Math.random;

    // 死亡：貼花有預算，粒子另有預算；超過預算的只算傷害不播特效
    const d = w.deaths;
    let decals = 0;
    let fxDeaths = 0;
    for (let i = 0; i < d.count; i++) {
      const x = d.x[i];
      const y = d.y[i];
      const kind = d.kind[i];
      const cause = d.cause[i];
      if (decals < tier.splatsPerFrame) {
        decals++;
        const rot = rnd() * Math.PI * 2;
        if (cause === CAUSE_SHATTER) this.chunks.addDecal(a.water[(rnd() * 2) | 0], x, y, rot, 0.8, WHITE);
        else if (cause === CAUSE_BURN) this.chunks.addDecal(a.scorch[0], x, y, rot, 0.6, WHITE);
        else if (kind === CORE || cause === CAUSE_PLAGUE) this.chunks.addDecal(a.ichor[(rnd() * 2) | 0], x, y, rot, 0.8, BLOOD);
        else this.chunks.addDecal(a.blood[(rnd() * 4) | 0], x, y, rot, (kind === BRUTE ? 1.1 : 0.75) * (0.8 + rnd() * 0.4), BLOOD);
        if (cause !== CAUSE_SHATTER && cause !== CAUSE_BURN && rnd() < 0.22) {
          if (this.sprites) this.chunks.addDecal(this.sprites.corpse[kind], x, y + 2, 0, rnd() < 0.5 ? 1 : -1, abgr(0xffffff, 0.8));
          else this.chunks.addDecal(a.corpse[kind], x, y, d.facing[i] + (rnd() - 0.5), 1, abgr(0xffffff, 0.75));
        }
      }
      if (fxDeaths >= tier.deathFxPerFrame) continue;
      fxDeaths++;
      if (cause === CAUSE_SHATTER) {
        for (let k = 0; k < 4; k++) {
          const ang = rnd() * Math.PI * 2;
          const sp = 40 + rnd() * 70;
          fa.spawn(a.shard[k % 3], x, y, Math.cos(ang) * sp, Math.sin(ang) * sp, 0.35 + rnd() * 0.25, C.iceWhite, 1, 1, 1, 4, ang, 8);
        }
      } else if (cause === CAUSE_BURN) {
        for (let k = 0; k < 3; k++) {
          const ang = rnd() * Math.PI * 2;
          fa.spawn(a.t.spark, x, y, Math.cos(ang) * 30, Math.sin(ang) * 30 - 10, 0.4 + rnd() * 0.3, C.ember, 1, 1, 0.5, 2);
        }
      } else {
        const n = cause === CAUSE_BLAST ? 4 : 2;
        const col = kind === CORE ? C.ichor : C.gib;
        for (let k = 0; k < n; k++) {
          const ang = rnd() * Math.PI * 2;
          const sp = 30 + rnd() * 70;
          fn.spawn(a.gib[k % 3], x, y, Math.cos(ang) * sp, Math.sin(ang) * sp, 0.3 + rnd() * 0.3, col, 1, 1, 1, 6, ang, 10);
        }
      }
    }
    d.clear();

    const f = w.fx;
    let rings = 0;
    for (let i = 0; i < f.count; i++) {
      const x = f.x[i];
      const y = f.y[i];
      const r = f.a[i];
      switch (f.kind[i]) {
        case FX_SHARD:
          if (rings++ < 140) fa.spawn(this.ringSeq(r), x, y, 0, 0, 0.22, C.ice, 0.9);
          break;
        case FX_BURST:
          if (this.boom(x, y, r, C.white, 0.45)) break;
          if (rings++ < 140) {
            fa.spawn(this.ringSeq(r), x, y, 0, 0, 0.28, C.orange, 1);
            fa.spawn(a.glow[32], x, y, 0, 0, 0.16, C.hot, 0.5, (r / 16) * 0.6, (r / 16) * 0.8);
          }
          break;
        case FX_PLAGUE:
          this.boom(x, y, r, bgr(0xb8ff60), 0.55);
          fa.spawn(this.ringSeq(r), x, y, 0, 0, 0.35, C.green, 1);
          fa.spawn(a.glow[64], x, y, 0, 0, 0.25, C.green, 0.35, r / 60, r / 44);
          for (let k = 0; k < 6; k++) {
            const ang = rnd() * Math.PI * 2;
            fn.spawn(a.gib[k % 3], x, y, Math.cos(ang) * 90, Math.sin(ang) * 90, 0.4, C.ichor, 1, 1, 1, 5);
          }
          this.chunks.addDecal(a.ichor[0], x, y, rnd() * 6, r / 22, abgr(0xffffff, 0.7));
          break;
        case FX_COLLAPSE:
          this.boom(x, y, r * 1.1, bgr(0xd8b0ff), 0.7);
          this.rings.push({ x, y, r0: 8, r1: r * 1.15, t: 0, dur: 0.45, color: 0xd9b0ff, width: 3, fill: 0x6a2cff });
          fa.spawn(a.glow[64], x, y, 0, 0, 0.4, C.white, 1, r / 40, r / 22);
          for (let k = 0; k < 40; k++) {
            const ang = rnd() * Math.PI * 2;
            const sp = 80 + rnd() * 200;
            fa.spawn(a.t.spark, x, y, Math.cos(ang) * sp, Math.sin(ang) * sp, 0.5 + rnd() * 0.3, k % 2 ? C.purple : C.white, 1, 1, 0.5, 3);
          }
          this.chunks.addDecal(a.scorch[1], x, y, rnd() * 6, r / 14, abgr(0xffffff, 0.8));
          this.addShake(0.5);
          this.doFlash(0x9a6aff, 0.25);
          break;
        case FX_SCORCH:
          this.chunks.addDecal(a.scorch[(rnd() * 2) | 0], x, y, rnd() * 6, r / 11, abgr(0xffffff, 0.5));
          for (let k = 0; k < 3; k++) {
            const ang = rnd() * Math.PI * 2;
            const sp = 40 + rnd() * 120;
            fa.spawn(a.t.spark, x + Math.cos(ang) * r * 0.6, y + Math.sin(ang) * r * 0.6, Math.cos(ang) * sp, Math.sin(ang) * sp, 0.4, C.hot, 1, 1, 0.5, 3);
          }
          break;
        case FX_SPLASH:
          if (this.sprites && this.fxHit) this.fxHit.spawn(this.sprites.attack.akane.hit, x, y - 4, 0, 0, 0.3, C.white, 1, (r / 15) * 0.6, r / 15, 0, Math.random() * 6);
          this.boom(x, y, r * 0.55, bgr(0xffb0e0), 0.4);
          break;
        case FX_BOLT_HIT:
          if (this.sprites && this.fxHit) this.fxHit.spawn(this.sprites.attack[this.charId].hit, x, y - GUN_Y, 0, 0, 0.16, C.white, 1, 0.5, 1.1, 0, Math.random() * 6);
          else fa.spawn(a.t.spark, x, y, 0, 0, 0.14, C.cyan, 1, 2, 0.6);
          break;
        case FX_FREEZE:
          if (rnd() < 0.5) fa.spawn(a.t.spark, x + (rnd() - 0.5) * 8, y + (rnd() - 0.5) * 8, 0, -12, 0.5, C.iceWhite, 1, 1, 0.5);
          break;
      }
    }
    f.clear();
  }

  onEvent(e: GameEvent) {
    const a = this.atlas;
    switch (e.type) {
      case 'nova':
        this.rings.push({ x: e.x, y: e.y, r0: 6, r1: e.r, t: 0, dur: 0.3, color: 0xc8f0ff, width: 3, fill: 0x60b8ff });
        this.addShake(0.15);
        break;
      case 'holeEnd':
        if (e.n > 60) this.addShake(Math.min(0.6, e.n / 400));
        break;
      case 'beamStart':
        this.addShake(0.2);
        break;
      case 'ult':
        this.addShake(0.3);
        this.doFlash(0x80e0ff, 0.35);
        break;
      case 'ultImpact':
        this.addShake(0.75);
        this.doFlash(0xc8f4ff, 0.45);
        this.boom(e.x, e.y, 46, C.white, 0.7);
        break;
      case 'ultPulse':
        // 每輪散射：頂端發射口的砲口焰
        this.addShake(0.22);
        this.fxAdd.spawn(a.glow[64], e.x, e.y - DEVICE_MUZZLE, 0, 0, 0.12, C.white, 0.95, 1.2, 1.8);
        for (let i = 0; i < 10; i++) {
          const ang = (i / 10) * Math.PI * 2 + Math.random() * 0.3;
          this.fxAdd.spawn(a.glow[16], e.x, e.y - DEVICE_MUZZLE, Math.cos(ang) * 160, Math.sin(ang) * 90, 0.16, C.orange, 0.9, 1, 0.3);
        }
        break;
      case 'dash':
        for (let i = 0; i < 6; i++) this.fxAdd.spawn(a.glow[16], e.x, e.y, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, 0.25, C.cyan, 0.5, 1, 0.3);
        break;
      case 'hurt':
        this.doFlash(0xff2020, 0.12);
        break;
      case 'bolt':
        // 槍口火光（世界座標由主角位置與面向推算）
        if (this.sprites) {
          const p = this.lastPlayer;
          const d = playerDir(p.facing);
          const sx = d === 'side' ? (Math.cos(p.facing) < 0 ? -15 : 15) : 3;
          const sy = d === 'down' ? -GUN_Y + 6 : d === 'up' ? -GUN_Y - 8 : -GUN_Y - 1;
          this.fxAdd.spawn(a.glow[16], p.x + sx, p.y + sy, 0, 0, 0.08, this.charColor, 0.9, 0.8, 0.3);
          this.fxAdd.spawn(a.t.spark, p.x + sx, p.y + sy, 0, 0, 0.06, C.white, 1, 1.5, 1);
        }
        break;
      case 'chainEnd':
        if (e.count > 150) this.addShake(0.3);
        break;
      case 'mutant':
        this.addShake(0.25);
        break;
      case 'mutantDown':
        this.addShake(0.7);
        this.doFlash(0xffe0a0, 0.35);
        this.boom(e.x, e.y, 60, C.white, 0.8);
        break;
      case 'finalWave':
        this.addShake(0.6);
        this.doFlash(0xff3030, 0.4);
        break;
      case 'finish':
        // 全場清空：大閃光＋重震
        this.addShake(1);
        this.doFlash(0xffffff, 0.8);
        break;
    }
  }

  private buildProps(world: World, sp: HordeSprites) {
    const P = sp.props;
    const cars = [P.car_red, P.car_blue, P.car_police, P.car_taxi];
    for (const p of world.map.props) {
      const cx = p.x + p.w / 2;
      const bottom = p.y + p.h;
      const flip = (p.x * 7 + p.y * 13) % 2 === 0 ? 1 : -1;
      let tex: Texture | undefined;
      let f = 1;
      switch (p.kind) {
        case 'car':
          tex = p.vertical ? P.car_front : cars[p.variant % cars.length];
          f = p.vertical ? 1 : flip;
          break;
        case 'wreck':
          tex = p.vertical ? P.wreck_front : P.wreck_side;
          f = p.vertical ? 1 : flip;
          break;
        case 'planter':
        case 'bench':
        case 'bin':
        case 'barrier':
        case 'lamp':
        case 'hydrant':
        case 'cones':
        case 'crates':
        case 'cart':
        case 'shrine':
        case 'torii':
        case 'sakura':
        case 'stoneLantern':
        case 'yatai':
        case 'bamboo':
        case 'komainu':
        case 'bridge':
          tex = P[p.kind];
          f = p.kind === 'cart' || p.kind === 'cones' ? flip : 1;
          break;
      }
      if (tex) this.props.push({ tex, x: cx, y: bottom, sortY: p.y + p.h / 2, flip: f });
    }
    const ft = world.map.fountain;
    if (world.stage.id === 'city') this.props.push({ tex: P.fountain, x: ft.x, y: ft.y + ft.ry + 6, sortY: ft.y, flip: 1 });
  }

  /** 逐格爆炸（只有 3/4 風格素材時才有），回傳是否有生成 */
  private boom(x: number, y: number, r: number, tint: number, life: number) {
    const s = this.sprites;
    if (!s || !this.fxBoom) return false;
    const scale = (r * 2.4) / s.boomSize;
    return this.fxBoom.spawn(s.boom, x, y - r * 0.25, 0, 0, life, tint, 1, scale, scale * 1.05);
  }

  private ringSeq(r: number): Texture[] {
    const radii = this.atlas.ringRadius;
    let end = radii.length;
    for (let i = 0; i < radii.length; i++) {
      if (radii[i] >= r) {
        end = i + 1;
        break;
      }
    }
    return this.ringCache[end] ?? (this.ringCache[end] = this.atlas.ring.slice(0, end));
  }
  private readonly ringCache: Texture[][] = [];

  // ───────────────────────── 繪製 ─────────────────────────

  render(w: World, alpha: number, dt: number) {
    this.time += dt;
    const p = w.player;
    const px = p.px + (p.x - p.px) * alpha;
    const py = p.py + (p.y - p.py) * alpha;
    this.shake = Math.max(0, this.shake - dt * 2.2);
    const sh = this.shake * this.shake * 7;
    const camX = Math.round(px - this.viewW / 2 + (Math.random() - 0.5) * sh * 2);
    const camY = Math.round(py - this.viewH / 2 + (Math.random() - 0.5) * sh * 2);
    this.camX = camX;
    this.camY = camY;
    this.camera.position.set(-camX, -camY);
    this.overlayCam.position.set(-camX, -camY);
    this.chunks.cull(camX, camY, camX + this.viewW, camY + this.viewH);

    this.lastPlayer.x = px;
    this.lastPlayer.y = py;
    this.lastPlayer.facing = p.facing;
    this.drawZombies(w, alpha, px, py);
    this.drawGems(w);
    this.drawBolts(w);
    this.drawPlayer(w, px, py);
    this.drawHoles(w, dt);
    this.drawGfx(w, dt, px, py);
    if (w.stage.id === 'japan' && dt > 0 && Math.random() < dt * 18) {
      this.fxNormal.spawn(this.atlas.t.dot, camX + Math.random() * this.viewW, camY - 8,
        -6 - Math.random() * 8, 12 + Math.random() * 9, 5, bgr(0xffadc8), 0.65, 1.5, 0.7, 0, 0, 1);
    }
    this.fxNormal.update(dt);
    this.fxAdd.update(dt);
    this.fxBoom?.update(dt);
    this.fxHit?.update(dt);
    this.chunks.flush(this.renderer);

    this.renderer.render({ container: this.worldRoot, target: this.worldRT, clear: true, clearColor: 0x0b0c0e });

    // 黑洞透鏡：只在有黑洞時多做一次低解析度後處理
    let lensOn = false;
    if (TIERS[this.tier].lens) {
      for (let i = 0; i < 4; i++) {
        const h = w.holes[i];
        if (h.active) {
          const k = Math.min(1, h.t / 0.4) * Math.min(1, (h.dur - h.t) / 0.25 + 0.2);
          this.lens.setHole(i, h.x - camX, h.y - camY, h.r * 0.85, 0.9 * k);
          this.lens.setProtect(px - camX, py - camY - 12, this.sprites ? 22 : 0);
          lensOn = true;
        } else this.lens.setHole(i, 0, 0, 0, 0);
      }
    }
    if (lensOn) {
      this.postSprite.texture = this.worldRT;
      this.renderer.render({ container: this.postHolder, target: this.postRT, clear: true });
      this.display.texture = this.postRT;
    } else this.display.texture = this.worldRT;
    this.renderer.render({ container: this.overlayRoot, target: this.display.texture as RenderTexture, clear: false });

    this.flashA = Math.max(0, this.flashA - dt * 2.5);
    this.flash.alpha = this.flashA;
    this.flash.tint = this.flashColor;
    this.flash.visible = this.flashA > 0.01;
    this.renderer.render(this.stage);
  }

  private drawZombies(w: World, alpha: number, px: number, py: number) {
    if (this.sprites) return this.drawZombiesOblique(w, alpha, this.sprites, px, py);
    const z = w.zombies;
    const n = z.count;
    const act = z.active;
    const parts = this.zParts;
    while (parts.length < n) parts.push(new Particle({ texture: this.atlasTexture, anchorX: 0.5, anchorY: 0.5 }));
    const ch = this.zombiesPC.particleChildren;
    const zt = this.atlas.zombie;
    const pulse = 0.55 + 0.45 * Math.sin(this.time * 18);
    const volatile = abgr(0xff7ae0, 1);
    const volatile2 = abgr(0xffc8f0, 1);
    const holes = w.holes;
    for (let k = 0; k < n; k++) {
      const s = act[k];
      const pt = parts[k];
      pt.x = z.px[s] + (z.x[s] - z.px[s]) * alpha;
      pt.y = z.py[s] + (z.y[s] - z.py[s]) * alpha;
      pt.rotation = z.facing[s];
      const kd = z.kind[s];
      const st = z.status[s];
      pt.texture = z.flash[s] > 0 ? zt[kd][4] : st & FROZEN ? zt[kd][5] : zt[kd][(z.anim[s] | 0) & 3];
      pt.color = st & VOLATILE ? (pulse > 0.5 ? volatile : volatile2) : WHITE;
      const scale = this.pullScale(holes, z.hole[s], st, pt.x, pt.y);
      pt.scaleX = scale;
      pt.scaleY = scale;
      ch[k] = pt;
    }
    ch.length = n;
  }

  private pullScale(holes: World['holes'], hi: number, st: number, x: number, y: number) {
    if (!(st & PULLED)) return 1;
    const h = holes[hi];
    if (!h) return 1;
    return 0.45 + 0.55 * Math.min(1, Math.hypot(x - h.x, y - h.y) / 40);
  }

  /**
   * 3/4 斜俯視：角色正面朝鏡頭，不能旋轉 → 依 y 排序（越下面越前面）＋ 左右翻轉。
   * 排序把 (量化 y, 索引) 打包成一個 double 用原生 sort，3,000 隻約 0.15ms。
   */
  private drawZombiesOblique(w: World, alpha: number, sp: HordeSprites, px: number, py: number) {
    const z = w.zombies;
    const n = z.count;
    const act = z.active;
    if (this.sortKeys.length < n + 1 + this.props.length) {
      this.sortKeys = new Float64Array((n + 1 + this.props.length) * 2);
      this.sortY = new Float32Array(this.sortKeys.length);
    }
    const keys = this.sortKeys;
    const ys = this.sortY;
    for (let k = 0; k < n; k++) {
      const s = act[k];
      const y = z.py[s] + (z.y[s] - z.py[s]) * alpha;
      ys[k] = y;
      keys[k] = Math.floor(y * 4) * 16384 + k;
    }
    // 主角也參與排序：站在主角前面（y 較大）的殭屍會擋住主角
    keys[n] = Math.floor(py * 4) * 16384 + PLAYER_KEY;
    // 畫面內的場景物件（車、花台、噴水池…）也一起排序
    let total = n + 1;
    const vx0 = this.camX - 80;
    const vx1 = this.camX + this.viewW + 80;
    const vy0 = this.camY - 40;
    const vy1 = this.camY + this.viewH + 100;
    for (let i = 0; i < this.props.length; i++) {
      const pr = this.props[i];
      if (pr.x < vx0 || pr.x > vx1 || pr.y < vy0 || pr.y > vy1) continue;
      if (total >= keys.length) break;
      keys[total++] = Math.floor(pr.sortY * 4) * 16384 + PROP_BASE + i;
    }
    const sorted = keys.subarray(0, total).sort();
    const parts = this.zParts;
    while (parts.length < total) parts.push(new Particle({ texture: sp.zombie[0][0], anchorX: 0.5, anchorY: 0.95 }));
    const shadows = this.shadowParts;
    while (shadows.length < n + 1) shadows.push(new Particle({ texture: this.atlas.t.shadow, anchorX: 0.5, anchorY: 0.5 }));
    const ch = this.zombiesPC.particleChildren;
    const sch = this.shadowPC.particleChildren;
    const zt = sp.zombie;
    const pulse = 0.55 + 0.45 * Math.sin(this.time * 18);
    const volatile = abgr(0xff7ae0, 1);
    const volatile2 = abgr(0xffc8f0, 1);
    const holes = w.holes;
    const pl = w.player;
    let si = 0;
    for (let i = 0; i < total; i++) {
      const k = sorted[i] % 16384;
      const pt = parts[i];
      if (k >= PROP_BASE && k !== PLAYER_KEY) {
        const pr = this.props[k - PROP_BASE];
        pt.texture = pr.tex;
        pt.x = pr.x;
        pt.y = pr.y;
        pt.rotation = 0;
        pt.anchorY = 1;
        pt.scaleX = pr.flip;
        pt.scaleY = 1;
        pt.color = WHITE;
        ch[i] = pt;
        continue;
      }
      if (k === PLAYER_KEY) {
        const hurt = pl.hurtT > 0 && ((this.time * 30) | 0) % 2 === 0;
        const dir = playerDir(pl.facing);
        const skin = this.skin ? sp.skins[this.skin] : null;
        const frames = skin ? skin.frames[dir] : sp.player[this.charId][dir];
        pt.texture = hurt ? frames[4] : frames[pl.moving ? ((this.time * 10) | 0) & 3 : 0];
        pt.x = px;
        pt.y = py;
        pt.rotation = 0;
        pt.anchorY = skin ? skin.anchorY[dir] : sp.playerAnchorY[this.charId][dir];
        pt.scaleX = dir === 'side' && Math.cos(pl.facing) < 0 ? -1 : 1;
        pt.scaleY = 1;
        pt.color = WHITE;
        ch[i] = pt;
        continue;
      }
      const s = act[k];
      const x = z.px[s] + (z.x[s] - z.px[s]) * alpha;
      const y = ys[k];
      const kd = z.kind[s];
      const st = z.status[s];
      pt.x = x;
      pt.y = y;
      if (w.stage.id === 'japan' && !(st & (FROZEN | PULLED))) pt.y -= Math.abs(Math.sin(z.anim[s] * Math.PI / 2)) * 1.2;
      pt.rotation = 0;
      pt.anchorY = sp.anchorY[kd];
      // 巨大變異體被打時只染淡紅（全白閃爍在機槍連射下會一直白掉）
      const boss = kd === MUTANT;
      const hit = z.flash[s] > 0;
      pt.texture = hit && !boss ? zt[kd][4] : st & FROZEN ? zt[kd][5] : zt[kd][(z.anim[s] | 0) & 3];
      pt.color = boss && hit ? BOSS_HIT : st & VOLATILE ? (pulse > 0.5 ? volatile : volatile2) : WHITE;
      const scale = this.pullScale(holes, z.hole[s], st, x, y);
      pt.scaleX = Math.cos(z.facing[s]) < 0 ? -scale : scale;
      pt.scaleY = scale;
      if (st & PULLED) pt.rotation = Math.sin(this.time * 20 + s) * 0.5;
      ch[i] = pt;
      const sh = shadows[si++];
      sh.x = x;
      sh.y = y;
      sh.scaleX = sh.scaleY = (kd === MUTANT ? 2.8 : kd === BRUTE ? 1.5 : 1) * scale;
      sch[si - 1] = sh;
    }
    ch.length = total;
    // 主角影子（主角本身畫在透鏡之後的覆蓋層）
    const ps = shadows[n];
    ps.x = px;
    ps.y = py;
    ps.scaleX = ps.scaleY = 1.1;
    sch[n] = ps;
    sch.length = n + 1;
  }

  private drawGems(w: World) {
    const g = w.gems;
    const parts = this.gemParts;
    while (parts.length < g.count) parts.push(new Particle({ texture: this.atlas.t.gem, anchorX: 0.5, anchorY: 0.5 }));
    const ch = this.gemsPC.particleChildren;
    const small = this.atlas.t.gem;
    const big = this.atlas.t.gemBig;
    for (let i = 0; i < g.count; i++) {
      const pt = parts[i];
      pt.x = g.x[i];
      pt.y = g.y[i];
      pt.texture = g.value[i] > 4 ? big : small;
      ch[i] = pt;
    }
    ch.length = g.count;
  }

  private drawBolts(w: World) {
    const b = w.bolts;
    const parts = this.boltParts;
    const boltTex = this.sprites ? this.sprites.attack[this.charId].bolt : this.atlas.t.bolt;
    while (parts.length < b.count) parts.push(new Particle({ texture: boltTex, anchorX: 0.5, anchorY: 0.5 }));
    const ch = this.boltsPC.particleChildren;
    // 3/4 風格：子彈從槍口高度飛出（往上偏 GUN_Y），放大並拖一道光
    const oy = this.sprites ? -GUN_Y : 0;
    const sc = 1;
    for (let i = 0; i < b.count; i++) {
      const pt = parts[i];
      pt.texture = boltTex;
      pt.x = b.x[i];
      pt.y = b.y[i] + oy;
      pt.rotation = Math.atan2(b.vy[i], b.vx[i]);
      pt.scaleX = pt.scaleY = sc;
      ch[i] = pt;
      if (this.sprites) this.fxAdd.spawn(this.atlas.glow[16], pt.x, pt.y, 0, 0, 0.12, this.charColor, 0.35, 0.5, 0.2);
    }
    ch.length = b.count;
  }

  private drawPlayer(w: World, px: number, py: number) {
    const p = w.player;
    const sp = this.playerSprite;
    sp.position.set(px, py);
    const hurt = p.hurtT > 0 && ((this.time * 30) | 0) % 2 === 0;
    if (this.sprites) {
      // 3/4 風格：主角畫在殭屍排序裡（drawZombiesOblique），覆蓋層只留腳下光圈
      sp.visible = false;
      if (p.dashT > 0) this.fxAdd.spawn(this.atlas.glow[16], px, py - 8, 0, 0, 0.2, C.cyan, 0.6, 1.2, 0.6);
      return;
    }
    sp.rotation = p.facing;
    const walk = p.moving ? [0, 1, 0, 2][((this.time * 10) | 0) & 3] : 0;
    sp.texture = hurt ? this.atlas.player[3] : this.atlas.player[walk];
    if (p.dashT > 0) this.fxNormal.spawn(this.atlas.player[0], px, py, 0, 0, 0.18, C.cyan, 0.6, 1, 1, 0, p.facing);
  }

  private drawHoles(w: World, dt: number) {
    const a = this.atlas;
    for (let i = 0; i < 4; i++) {
      const h = w.holes[i];
      const sp = this.holeSprites[i];
      const glow = this.holeGlows[i];
      sp.visible = glow.visible = h.active;
      if (!h.active) continue;
      const grow = Math.min(1, h.t / 0.3);
      // 核心保持小而深，吸力範圍交給透鏡扭曲與吸入光點表現
      const size = Math.sqrt(h.r / 118) * 0.9 * grow * (1 + 0.08 * Math.sin(this.time * 14));
      sp.position.set(h.x, h.y);
      sp.scale.set(size);
      sp.rotation = -this.time * 3;
      glow.position.set(h.x, h.y);
      glow.scale.set((h.r / 32) * grow);
      glow.alpha = 0.35 + 0.1 * Math.sin(this.time * 9);
      // 吸入的光點
      const count = Math.ceil(dt * 120);
      for (let k = 0; k < count; k++) {
        const ang = Math.random() * Math.PI * 2;
        const rr = h.r * (0.6 + Math.random() * 0.4);
        const x = h.x + Math.cos(ang) * rr;
        const y = h.y + Math.sin(ang) * rr;
        const inx = -Math.cos(ang);
        const iny = -Math.sin(ang);
        const sp2 = rr / 0.45;
        this.fxAdd.spawn(a.t.dot, x, y, (inx - iny * 0.8) * sp2, (iny + inx * 0.8) * sp2, 0.45, k % 2 ? C.purple : C.white, 0.9, 1, 0.5);
      }
    }
  }

  private drawGfx(w: World, dt: number, px: number, py: number) {
    const g = this.gfx;
    const ga = this.gfxAdd;
    g.clear();
    ga.clear();
    // 玩家位置環（屍潮中找得到自己）
    // 巨大變異體血條
    const z = w.zombies;
    for (let k = 0; k < z.count; k++) {
      const s = z.active[k];
      if (z.kind[s] !== MUTANT) continue;
      const max = ZOMBIE_KINDS[MUTANT].hp * w.hpMul;
      const f = Math.max(0, Math.min(1, z.hp[s] / max));
      const bx = Math.round(z.x[s] - 18);
      const by = Math.round(z.y[s] - (this.sprites ? 62 : 22));
      g.rect(bx - 1, by - 1, 38, 5).fill({ color: 0x000000, alpha: 0.7 });
      g.rect(bx, by, 36 * f, 3).fill({ color: f > 0.35 ? 0xe5484d : 0xff2d55 });
    }
    // 3/4 視角：腳下橢圓光圈；90° 俯視：圓圈
    if (this.sprites) this.playerRing.clear().ellipse(px, py, 12, 5).stroke({ width: 1, color: 0x60e0ff, alpha: 0.9 });
    else this.playerRing.clear().circle(px, py, 10).stroke({ width: 1, color: 0x60e0ff, alpha: 0.55 });
    // 大招：衝擊波環
    for (const r of w.rings) {
      if (!r.active) continue;
      ga.circle(r.x, r.y, r.r).stroke({ width: 4, color: 0xffffff, alpha: 0.9 });
      ga.circle(r.x, r.y, Math.max(0, r.r - 7)).stroke({ width: 3, color: 0x40c8ff, alpha: 0.55 });
    }
    // 大招本體：戰艦（飛入→懸停發射→飛走）或天降巨砲（墜落→插地→脈衝）
    const u = w.ult;
    this.shipSprite.visible = u.active && u.kind === 'ship';
    this.deviceSprite.visible = u.active && u.kind === 'pylon';
    if (u.active && u.kind === 'ship') {
      g.ellipse(u.hx, u.hy + 6, 58, 14).fill({ color: 0x000000, alpha: 0.32 });
      this.shipSprite.position.set(Math.round(u.hx), Math.round(u.hy - SHIP_ALT));
      this.shipSprite.scale.x = u.dir;
      // 往斜下飛時機頭略朝下、斜上飛時略朝上
      this.shipSprite.rotation = u.dir * u.dy * 0.28;
      const k = u.t / SKILLS.ult.ship.duration;
      const near = 1 - Math.min(1, Math.abs(k - 0.5) / 0.09);
      if (near > 0) {
        ga.rect(u.hx - 10, u.hy - SHIP_ALT + 12, 20, SHIP_ALT - 12).fill({ color: 0xbff4ff, alpha: 0.85 * near });
        ga.ellipse(u.hx, u.hy, 44, 18).fill({ color: 0x9ff0ff, alpha: 0.4 * near });
      }
      this.fxAdd.spawn(this.atlas.glow[16], u.hx - u.dir * 62, u.hy - SHIP_ALT + 4 - u.dy * 14, -u.dir * 200, -u.dy * 80, 0.25, C.cyan, 0.8, 1.6, 0.4);
    } else if (u.active && u.kind === 'pylon') {
      const P = 0.45;
      const fallK = u.phase === 0 ? Math.min(1, u.t / P) : 1;
      const alt = (1 - fallK * fallK) * 260;
      const fade = u.phase === 2 ? 1 - Math.min(1, u.t / 0.4) : 1;
      g.ellipse(u.x, u.y + 2, 18 + 22 * fallK, 6 + 8 * fallK).fill({ color: 0x000000, alpha: 0.35 * fade });
      this.deviceSprite.position.set(Math.round(u.x), Math.round(u.y - alt));
      this.deviceSprite.alpha = fade;
      if (u.phase === 0) this.fxAdd.spawn(this.atlas.glow[32], u.x + (Math.random() - 0.5) * 8, u.y - alt - 90, 0, -40, 0.25, C.orange, 0.8, 1, 0.4);
      if (u.phase === 1) ga.circle(u.x, u.y - DEVICE_MUZZLE, 12 + Math.sin(this.time * 40) * 3).fill({ color: 0xffe08a, alpha: 0.7 });
    }
    // 天降巨砲散射砲彈：從發射口拋出、迅速落到地面高度後貼地飛行；拖曳曳光
    for (const sh of w.shells) {
      if (!sh.active) continue;
      const h = DEVICE_MUZZLE * Math.exp(-sh.d / 55);
      const len = Math.hypot(sh.vx, sh.vy);
      const tx = (sh.vx / len) * 30;
      const ty = (sh.vy / len) * 30;
      const ht = DEVICE_MUZZLE * Math.exp(-Math.max(0, sh.d - 30) / 55);
      const x = sh.x;
      const y = sh.y - h;
      const fade = Math.min(1, (sh.max - sh.d) / 80);
      ga.moveTo(x - tx, sh.y - ty - ht).lineTo(x, y).stroke({ width: 7, color: 0xff8a1a, alpha: 0.7 * fade });
      ga.moveTo(x - tx * 0.6, sh.y - ty * 0.6 - ht).lineTo(x, y).stroke({ width: 3, color: 0xffd25a, alpha: 1 * fade });
      ga.circle(x, y, 4).fill({ color: 0xfff6d8, alpha: fade });
    }
    // 軌道光束
    for (const b of w.beams) {
      if (!b.active) continue;
      if (b.phase === 0) {
        const blink = ((this.time * 16) | 0) % 2 === 0;
        g.moveTo(b.x0, b.y0)
          .lineTo(b.x0 + b.dx * b.len, b.y0 + b.dy * b.len)
          .stroke({ width: 1, color: 0xff5040, alpha: blink ? 0.8 : 0.35 });
        g.circle(b.x0, b.y0, b.r).stroke({ width: 1, color: 0xff5040, alpha: 0.8 });
      } else {
        ga.moveTo(b.x0, b.y0).lineTo(b.hx, b.hy).stroke({ width: b.r * 1.4, color: 0xff8a30, alpha: 0.12 });
        ga.circle(b.hx, b.hy, b.r * 1.15).fill({ color: 0xffb050, alpha: 0.35 });
        ga.circle(b.hx, b.hy, b.r * 0.7).fill({ color: 0xfff2c0, alpha: 0.85 });
        ga.circle(b.hx, b.hy, b.r * 0.35).fill({ color: 0xffffff, alpha: 1 });
        this.fxAdd.spawn(this.atlas.glow[64], b.hx, b.hy, 0, 0, 0.08, C.orange, 0.6, (b.r / 32) * 1.8, (b.r / 32) * 2);
      }
    }
    // 擴散環
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.t += dt;
      const u = r.t / r.dur;
      if (u >= 1) {
        this.rings.splice(i, 1);
        continue;
      }
      const e = 1 - (1 - u) * (1 - u);
      const rad = r.r0 + (r.r1 - r.r0) * e;
      ga.circle(r.x, r.y, rad).fill({ color: r.fill, alpha: 0.18 * (1 - u) });
      ga.circle(r.x, r.y, rad).stroke({ width: r.width, color: r.color, alpha: 1 - u });
    }
  }
}
