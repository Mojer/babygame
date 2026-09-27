import Phaser from 'phaser';
import { AudioEngine, type Beat, type Section } from './audio/music';
import { MotionLayer } from './fx/motion';
import { ASSETS, paintPlaceholder } from './game/assets';
import { BOSS, WEAPONS, type PickupKind, type WeaponKind } from './game/content';
import {
  BASE_HEIGHT, BASE_WIDTH, BOMB_KILLS_PER_CHARGE, FIXED_STEP, GameModel, ORBIT_RADIUS, PLAYER_RADIUS, SHIELD_MAX,
  type GameEvent
} from './game/model';
import './style.css';

const SHIELD_SEGMENTS = 20;
const COMBO_MILESTONES = [10, 25, 50, 75, 100, 150, 200];
const PICKUP_ORDER: PickupKind[] = ['spread', 'chain', 'laser', 'nova', 'repair', 'bomb'];
const WEAPON_COLOR: Record<WeaponKind, string> = {
  blaster: '#ffb347', spread: '#ffb347', chain: '#9ae6ff', laser: '#ff4fd0', nova: '#ffd35a'
};

// 正式美術放在 src/assets/，檔名對應 ASSETS 清單；沒有檔案的項目使用佔位圖。
const ART_FILES = import.meta.glob<string>('./assets/*.{png,jpg,webp}', { eager: true, query: '?url', import: 'default' });

const root = document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML = `
  <main class="shell" data-mode="menu">
    <div id="game" aria-label="寶寶地球保衛戰遊戲畫面"></div>
    <div class="vignette" aria-hidden="true"></div>
    <div class="hazard" aria-hidden="true"><i></i><i></i></div>
    <header class="hud">
      <div class="score-block">
        <small>SCORE</small><b id="score">000000</b>
        <div class="wave"><small>WAVE</small><b id="wave">1-1</b></div>
      </div>
      <div class="shield-block">
        <small><i class="shield-icon"></i>EARTH SHIELD</small>
        <div class="shield-bar" id="shield">${'<i></i>'.repeat(SHIELD_SEGMENTS)}</div>
      </div>
      <div class="hud-buttons">
        <button class="icon-button" id="mute" aria-label="切換音樂"><span class="speaker"></span></button>
        <button class="icon-button pause" id="pause" aria-label="暫停遊戲"><span></span><span></span></button>
      </div>
    </header>
    <div class="combo" id="combo"><b id="combo-value">0</b><span>COMBO</span></div>
    <div class="boss-bar" id="boss-bar" hidden>
      <div class="boss-meta"><span>觸手眼魔</span><span id="boss-state">擊破觸手眼球</span></div>
      <div class="boss-track"><i id="boss-fill"></i></div>
    </div>
    <div class="announce" id="announce"><b></b><span></span></div>
    <div class="banner" id="banner"><i class="stripe a"></i><i class="stripe b"></i><div class="banner-text"><b></b><span></span></div></div>
    <div class="weapon" id="weapon">
      <small>WEAPON</small>
      <b id="weapon-name">BLASTER</b>
      <span id="weapon-label">光束砲</span>
      <i class="weapon-timer"><i id="weapon-timer"></i></i>
    </div>
    <button class="bomb" id="bomb" aria-label="施放炸彈">
      <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="22" cy="28" r="13"/><path d="M31 18l5-5M36 13l3 1M36 13l-1-3"/></svg>
      <b>BOMB</b><em id="bomb-count">2</em>
      <i class="bomb-meter"><i id="bomb-meter"></i></i>
    </button>
    <div class="overlay" id="overlay">
      <section class="panel" id="panel"></section>
    </div>
  </main>`;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const shell = document.querySelector<HTMLElement>('.shell')!;
const overlay = $<HTMLDivElement>('overlay');
const panel = $<HTMLElement>('panel');
const announceNode = $<HTMLDivElement>('announce');
const bannerNode = $<HTMLDivElement>('banner');
const shieldCells = Array.from($<HTMLDivElement>('shield').children) as HTMLElement[];

type Mode = 'menu' | 'play' | 'pause' | 'result';
let mode: Mode = 'menu';
let model = new GameModel();
let scene: PlayScene | null = null;
const audio = new AudioEngine();

// ─── HUD ───────────────────────────────────────────────────

function announce(title: string, subtitle = '', tone = '') {
  announceNode.dataset.tone = tone;
  announceNode.querySelector('b')!.textContent = title;
  announceNode.querySelector('span')!.textContent = subtitle;
  announceNode.classList.remove('show');
  void announceNode.offsetWidth;
  announceNode.classList.add('show');
}

/** Motion graphic 橫幅：斜條紋掃入 + 文字擦入，用於武器、連鎖與連擊里程碑。 */
function banner(title: string, subtitle: string, color: string) {
  bannerNode.style.setProperty('--tone', color);
  bannerNode.querySelector('b')!.textContent = title;
  bannerNode.querySelector('span')!.textContent = subtitle;
  bannerNode.classList.remove('show');
  void bannerNode.offsetWidth;
  bannerNode.classList.add('show');
}

const hudCache: Record<string, string | number> = {};
function setText(id: string, value: string) {
  if (hudCache[id] === value) return;
  hudCache[id] = value;
  $(id).textContent = value;
}

function updateHud() {
  setText('score', String(model.score).padStart(6, '0'));
  setText('wave', model.waveLabel);
  const lit = Math.ceil((model.shield / SHIELD_MAX) * SHIELD_SEGMENTS);
  if (hudCache.shield !== lit) {
    hudCache.shield = lit;
    shieldCells.forEach((cell, i) => cell.classList.toggle('on', i < lit));
    shell.dataset.danger = String(model.shield <= 30);
  }
  setText('bomb-count', String(model.bombs));
  $('bomb-meter').style.transform = `scaleX(${model.bombs >= 3 ? 1 : model.bombMeter / BOMB_KILLS_PER_CHARGE})`;
  $('bomb').classList.toggle('empty', model.bombs === 0);
  $('combo').classList.toggle('show', model.combo >= 5);
  setText('combo-value', String(model.combo));

  const weapon = WEAPONS[model.weapon];
  if (hudCache.weapon !== model.weapon) {
    hudCache.weapon = model.weapon;
    setText('weapon-name', weapon.name);
    setText('weapon-label', weapon.label);
    $('weapon').style.setProperty('--tone', WEAPON_COLOR[model.weapon]);
    $('weapon').dataset.special = String(model.weapon !== 'blaster');
  }
  $('weapon-timer').style.transform = `scaleX(${weapon.duration ? Math.min(1, model.weaponTime / weapon.duration) : 1})`;

  const boss = model.boss;
  $('boss-bar').hidden = !boss;
  if (boss) {
    const exposed = boss.phase !== 'pods';
    const alive = boss.pods.filter(p => p.alive).length;
    setText('boss-state', exposed ? `弱點暴露 ${Math.max(0, Math.ceil(boss.exposedTimer))}s` : `觸手眼球 ${alive}/${BOSS.podCount}`);
    $('boss-fill').style.transform = `scaleX(${boss.hp / BOSS.coreHp})`;
    $('boss-bar').dataset.exposed = String(exposed);
  }
  shell.dataset.phase = model.phase;
}

function updateMuteButton() { $('mute').classList.toggle('muted', audio.muted); }

function showPanel(kind: 'menu' | 'pause' | 'result') {
  if (kind === 'menu') {
    panel.innerHTML = `
      <span class="index">BABY EARTH DEFENSE · 0.2</span>
      <h1>寶寶<br><em>地球保衛戰</em></h1>
      <p>外星怪物來襲！按住畫面任何地方，戰機就會繞著地球轉向手指的方向並自動射擊。撿起武器膠囊，打出連環爆破！</p>
      <ul class="how">
        <li><b>轉向</b>按住／滑動</li>
        <li><b>射擊</b>自動</li>
        <li><b>炸彈</b>清全畫面</li>
      </ul>
      <ul class="arsenal">
        <li style="--tone:#ffb347"><b>散射彈</b>三向射擊</li>
        <li style="--tone:#9ae6ff"><b>雷電鏈</b>電弧跳躍</li>
        <li style="--tone:#ff4fd0"><b>貫穿雷射</b>一線穿透</li>
        <li style="--tone:#ffd35a"><b>連鎖爆破</b>爆炸連爆</li>
      </ul>
      <button class="primary" id="start">開始保衛</button>
      <small class="keys">← → 轉向 · 空白 炸彈 · P 暫停 · M 靜音</small>`;
    $('start').onclick = startGame;
  } else if (kind === 'pause') {
    panel.innerHTML = `
      <span class="index">PAUSED</span>
      <h1>暫停中</h1>
      <button class="primary" id="resume">繼續</button>
      <button class="secondary" id="restart">重新開始</button>`;
    $('resume').onclick = resume;
    $('restart').onclick = startGame;
  } else {
    const won = model.state === 'won';
    panel.innerHTML = `
      <span class="index">${won ? 'MISSION COMPLETE' : 'EARTH SHIELD DOWN'}</span>
      <h1>${won ? '地球<em>得救了！</em>' : '護盾<em>破了…</em>'}</h1>
      <div class="result-grid">
        <div><b>${model.score}</b><span>SCORE</span></div>
        <div><b>${model.kills}</b><span>擊破</span></div>
        <div><b>${model.maxCombo}</b><span>最高連擊</span></div>
      </div>
      <button class="primary" id="restart">${won ? '再玩一次' : '再試一次'}</button>`;
    $('restart').onclick = startGame;
  }
  overlay.hidden = false;
}

function setMode(next: Mode) {
  mode = next;
  shell.dataset.mode = next;
}

function startGame() {
  audio.unlock();
  audio.resume();
  model = new GameModel();
  Object.keys(hudCache).forEach(key => delete hudCache[key]);
  overlay.hidden = true;
  setMode('play');
  scene?.scene.restart();
  model.start();
  const params = new URLSearchParams(location.search);
  if (params.has('boss')) model.skipToBoss();
  const weapon = params.get('weapon') as WeaponKind | null;
  if (weapon && weapon in WEAPONS && weapon !== 'blaster') { model.equip(weapon); model.weaponTime = 999; }
  if (import.meta.env.DEV) (window as unknown as { earth: GameModel }).earth = model;
  audio.start();
}

function pause() {
  if (mode !== 'play') return;
  setMode('pause');
  audio.suspend();
  showPanel('pause');
}

function resume() {
  if (mode !== 'pause') return;
  overlay.hidden = true;
  setMode('play');
  audio.resume();
}

function toggleMute() {
  audio.unlock();
  audio.setMuted(!audio.muted);
  updateMuteButton();
}

$('pause').onclick = pause;
$('mute').onclick = toggleMute;
updateMuteButton();
const bombButton = $<HTMLButtonElement>('bomb');
bombButton.addEventListener('pointerdown', event => {
  event.preventDefault();
  event.stopPropagation();
  if (mode === 'play') model.bomb();
});
// 選單畫面第一次互動就開始播放選單音樂（瀏覽器需要使用者手勢）。
window.addEventListener('pointerdown', () => audio.unlock(), { once: true });
window.addEventListener('keydown', event => {
  audio.unlock();
  if (event.repeat) return;
  if (event.code === 'Space') { event.preventDefault(); if (mode === 'play') model.bomb(); }
  if (event.code === 'KeyP' || event.code === 'Escape') mode === 'play' ? pause() : resume();
  if (event.code === 'KeyM') toggleMute();
  if (event.code === 'Enter' && (mode === 'menu' || mode === 'result')) startGame();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

function musicSection(): Section {
  if (mode === 'menu') return 'menu';
  if (mode === 'result') return model.state === 'won' ? 'win' : 'lose';
  switch (model.phase) {
    case 'wave': return 'wave';
    case 'break': return 'break';
    case 'warning': return 'warning';
    case 'boss': return model.boss && model.boss.phase !== 'pods' ? 'exposed' : 'boss';
  }
}

// ─── Scene ─────────────────────────────────────────────────

const KILL_STYLE: Record<string, { tint: number; scale: number }> = {
  chomper: { tint: 0xff4a5a, scale: .9 },
  eyeball: { tint: 0xcfe6ff, scale: 1.1 },
  mini: { tint: 0xcfe6ff, scale: .55 },
  pod: { tint: 0xff4fd8, scale: 1 },
  bullet: { tint: 0xd04bff, scale: .35 }
};

const BULLET_TINT: Record<WeaponKind, number> = {
  blaster: 0xffffff, spread: 0xffe08a, chain: 0x9ae6ff, laser: 0xffffff, nova: 0xffd35a
};

const PICKUP_TEXT: Record<PickupKind, [string, string, string]> = {
  spread: ['SPREAD SHOT', '散射彈', '#ffb347'],
  chain: ['CHAIN LIGHTNING', '雷電鏈', '#9ae6ff'],
  laser: ['PIERCING LASER', '貫穿雷射', '#ff4fd0'],
  nova: ['CHAIN NOVA', '連鎖爆破', '#ffd35a'],
  repair: ['SHIELD +15', '護盾修復', '#4dffb5'],
  bomb: ['BOMB +1', '炸彈補充', '#6fb8ff']
};

const easeOutBack = (t: number) => { const c = 1.7; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };

class PlayScene extends Phaser.Scene {
  private accumulator = 0;
  private hitStop = 0;
  private bg!: Phaser.GameObjects.Image;
  private stars!: Phaser.GameObjects.TileSprite;
  private asteroids: { sprite: Phaser.GameObjects.Sprite; vx: number; vy: number; spin: number }[] = [];
  private earthAtmo!: Phaser.GameObjects.Image;
  private earth!: Phaser.GameObjects.Image;
  private clouds!: Phaser.GameObjects.Image;
  private ring!: Phaser.GameObjects.Image;
  private aim!: Phaser.GameObjects.Graphics;
  private tentacles!: Phaser.GameObjects.Graphics;
  private ship!: Phaser.GameObjects.Sprite;
  private bossBody!: Phaser.GameObjects.Sprite;
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;
  private trail!: Phaser.GameObjects.Particles.ParticleEmitter;
  private motion!: MotionLayer;
  private atmoPulse = 0;
  private pools = {
    bullets: new Map<number, Phaser.GameObjects.Image>(),
    enemyBullets: new Map<number, Phaser.GameObjects.Sprite>(),
    enemies: new Map<number, Phaser.GameObjects.Sprite>(),
    pickups: new Map<number, Phaser.GameObjects.Image>(),
    pods: new Map<number, Phaser.GameObjects.Sprite>()
  };
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;

  constructor() { super('play'); }

  preload() {
    for (const spec of ASSETS) {
      const url = ART_FILES[`./assets/${spec.file}`];
      if (!url) continue;
      if (spec.frames > 1) this.load.spritesheet(spec.key, url, { frameWidth: spec.width, frameHeight: spec.height });
      else this.load.image(spec.key, url);
    }
  }

  create() {
    scene = this;
    this.ensureTextures();
    this.accumulator = 0;
    this.hitStop = 0;
    this.asteroids = [];
    Object.values(this.pools).forEach(pool => pool.clear());

    this.bg = this.add.image(0, 0, 'bg_space').setDepth(-100);
    this.stars = this.add.tileSprite(0, 0, BASE_WIDTH, BASE_HEIGHT, 'bg_stars').setBlendMode(Phaser.BlendModes.ADD).setAlpha(.8).setDepth(-90);
    for (let i = 0; i < 6; i++) {
      const sprite = this.add.sprite(0, 0, 'asteroid', i % 4).setAlpha(.7).setScale(.6 + Math.random() * .7).setDepth(-80);
      const a = Math.random() * Math.PI * 2;
      sprite.setPosition(Math.cos(a) * 700, Math.sin(a) * 900);
      this.asteroids.push({ sprite, vx: (Math.random() - .5) * 18, vy: (Math.random() - .5) * 18, spin: (Math.random() - .5) * .3 });
    }
    this.motion = new MotionLayer(this, -70, 14);

    this.ring = this.add.image(0, 0, 'orbit_ring').setBlendMode(Phaser.BlendModes.ADD).setAlpha(.9).setDepth(-5);
    this.earthAtmo = this.add.image(0, 0, 'earth_atmo').setBlendMode(Phaser.BlendModes.ADD).setDepth(-4);
    this.earth = this.add.image(0, 0, 'earth').setDepth(-3);
    this.clouds = this.add.image(0, 0, 'earth_clouds').setAlpha(.85).setDepth(-2);
    this.aim = this.add.graphics().setDepth(-1);

    this.tentacles = this.add.graphics().setDepth(4);
    this.bossBody = this.add.sprite(0, 0, 'boss_body').setVisible(false).setDepth(5);

    this.trail = this.add.particles(0, 0, 'fx_spark', {
      speed: { min: 20, max: 60 }, lifespan: 320, scale: { start: .9, end: 0 }, alpha: { start: .8, end: 0 },
      tint: 0xffa040, blendMode: Phaser.BlendModes.ADD, frequency: 30, emitting: false
    }).setDepth(11);
    this.ship = this.add.sprite(0, 0, 'player_ship').play('player_ship_anim').setDepth(12);
    this.sparks = this.add.particles(0, 0, 'fx_spark', {
      speed: { min: 90, max: 420 }, lifespan: { min: 300, max: 700 }, scale: { start: 1.3, end: 0 },
      alpha: { start: 1, end: 0 }, blendMode: Phaser.BlendModes.ADD, emitting: false
    }).setDepth(20);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey('A');
    this.keyD = this.input.keyboard!.addKey('D');
    const aimAt = (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || mode !== 'play') return;
      if (Math.hypot(pointer.worldX, pointer.worldY) < 40) return;
      model.setTarget(Math.atan2(pointer.worldY, pointer.worldX));
    };
    this.input.on('pointerdown', aimAt);
    this.input.on('pointermove', aimAt);
    this.input.on('pointerup', () => { if (!this.input.activePointer.isDown) model.setTarget(null); });

    this.scale.on('resize', this.layout, this);
    this.events.once('shutdown', () => { this.scale.off('resize', this.layout, this); audio.laser(false); });
    this.layout();
  }

  /** 缺少正式美術的資產改用程式繪製的佔位圖，並建立動畫。 */
  private ensureTextures() {
    for (const spec of ASSETS) {
      if (!this.textures.exists(spec.key)) {
        const texture = this.textures.addCanvas(spec.key, paintPlaceholder(spec))!;
        for (let i = 0; i < spec.frames; i++) texture.add(i, 0, i * spec.width, 0, spec.width, spec.height);
      }
      if (spec.frames > 1 && spec.fps && !this.anims.exists(`${spec.key}_anim`)) {
        this.anims.create({
          key: `${spec.key}_anim`,
          frames: this.anims.generateFrameNumbers(spec.key, { start: 0, end: spec.frames - 1 }),
          frameRate: spec.fps,
          repeat: spec.loop ? -1 : 0
        });
      }
    }
  }

  private layout() {
    const { width, height } = this.scale.gameSize;
    this.cameras.main.centerOn(0, 0);
    model.setViewport(width, height);
    this.bg.setScale(Math.max(width / this.bg.width, height / this.bg.height));
    this.stars.setSize(width, height);
  }

  update(_time: number, deltaMs: number) {
    const dt = Math.min(deltaMs / 1000, .1);
    audio.setSection(musicSection());
    for (const beat of audio.pollBeats()) this.onBeat(beat);
    this.animateScenery(dt);

    if (mode === 'play') {
      const keyTurn = (this.cursors.right.isDown || this.keyD.isDown ? 1 : 0) - (this.cursors.left.isDown || this.keyA.isDown ? 1 : 0);
      model.setTurn(keyTurn);
      if (this.hitStop > 0) this.hitStop -= dt;
      else {
        this.accumulator += dt;
        while (this.accumulator >= FIXED_STEP) {
          model.step(FIXED_STEP);
          this.accumulator -= FIXED_STEP;
        }
      }
      for (const event of model.drainEvents()) this.handleEvent(event);
      audio.laser(model.laserActive && model.state === 'running');
      this.sync();
      updateHud();
    }

    const boss = model.boss;
    this.motion.setPalette(boss || model.phase === 'warning' ? 'boss' : mode === 'play' ? 'battle' : 'calm');
    this.motion.setIntensity(mode !== 'play' ? .1 : boss ? .85 : model.phase === 'warning' ? 1 : .25 + Math.min(model.combo, 40) / 60);
    this.motion.setLaser(mode === 'play' && model.laserActive && model.state === 'running' ? model.playerAngle : null);
    const muzzle = ORBIT_RADIUS + PLAYER_RADIUS;
    this.motion.update(dt, this.scale.gameSize.width / 2, this.scale.gameSize.height / 2,
      { x: Math.cos(model.playerAngle) * muzzle, y: Math.sin(model.playerAngle) * muzzle });
    shell.style.setProperty('--beat', this.motion.energy.toFixed(3));
  }

  private onBeat(beat: Beat) {
    this.motion.onBeat(beat.downbeat);
    this.atmoPulse = Math.max(this.atmoPulse, beat.downbeat ? .07 : .04);
  }

  private animateScenery(dt: number) {
    const e = this.motion?.energy ?? 0;
    this.stars.tilePositionX += dt * 6;
    this.stars.tilePositionY -= dt * 10;
    this.clouds.rotation += dt * .1;
    this.ring.rotation -= dt * .05;
    this.ring.setScale(1 + e * .025);
    this.earth.setScale(1 + e * .012);
    this.clouds.setScale(1 + e * .012);
    this.atmoPulse = Math.max(0, this.atmoPulse - dt * .5);
    this.earthAtmo.setScale(1 + this.atmoPulse + e * .02);
    const hw = this.scale.gameSize.width / 2 + 120, hh = this.scale.gameSize.height / 2 + 120;
    for (const rock of this.asteroids) {
      const s = rock.sprite;
      s.x += rock.vx * dt; s.y += rock.vy * dt; s.rotation += rock.spin * dt;
      if (s.x < -hw) s.x = hw; else if (s.x > hw) s.x = -hw;
      if (s.y < -hh) s.y = hh; else if (s.y > hh) s.y = -hh;
      if (Math.hypot(s.x, s.y) < ORBIT_RADIUS + 120) { s.x *= 1.01; s.y *= 1.01; }
    }
  }

  // ─── Sync model → sprites ────────────────────────────────

  private syncPool<T extends { id: number }, S extends Phaser.GameObjects.Image | Phaser.GameObjects.Sprite>(
    pool: Map<number, S>, items: readonly T[], create: (item: T) => S, update: (sprite: S, item: T) => void
  ) {
    const seen = new Set<number>();
    for (const item of items) {
      seen.add(item.id);
      let sprite = pool.get(item.id);
      if (!sprite) { sprite = create(item); pool.set(item.id, sprite); }
      update(sprite, item);
    }
    for (const [id, sprite] of pool) if (!seen.has(id)) { sprite.destroy(); pool.delete(id); }
  }

  private flash(sprite: Phaser.GameObjects.Sprite, on: boolean) {
    if (on) sprite.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    else sprite.clearTint();
  }

  private sync() {
    const t = this.time.now / 1000;
    const beat = 1 + this.motion.energy * .07;
    this.ship.setPosition(model.playerX, model.playerY).setRotation(model.playerAngle).setScale(1 + this.motion.energy * .05);
    this.ship.setAlpha(model.stun > 0 ? (Math.floor(t * 20) % 2 ? .35 : 1) : 1);
    if (model.stun > 0) this.ship.setTint(0x9aa4ff); else this.ship.clearTint();
    this.trail.emitting = model.stun === 0;
    this.trail.setParticleTint(Phaser.Display.Color.HexStringToColor(WEAPON_COLOR[model.weapon]).color);
    this.trail.setPosition(model.playerX - Math.cos(model.playerAngle) * 36, model.playerY - Math.sin(model.playerAngle) * 36);

    this.aim.clear();
    if (model.targetAngle !== null) {
      const a = model.targetAngle;
      this.aim.lineStyle(4, 0x39c6ff, .5);
      this.aim.beginPath();
      this.aim.arc(0, 0, ORBIT_RADIUS, a - .12, a + .12);
      this.aim.strokePath();
    }

    this.syncPool(this.pools.bullets, model.bullets,
      b => this.add.image(0, 0, 'player_bullet').setBlendMode(Phaser.BlendModes.ADD).setTint(BULLET_TINT[b.kind]).setDepth(10)
        .setScale(b.kind === 'nova' ? 1.25 : b.kind === 'chain' ? 1.1 : 1),
      (s, b) => s.setPosition(b.x, b.y).setRotation(b.angle));

    this.syncPool(this.pools.enemyBullets, model.enemyBullets,
      () => this.add.sprite(0, 0, 'enemy_bullet').play('enemy_bullet_anim').setBlendMode(Phaser.BlendModes.ADD).setDepth(9),
      (s, b) => s.setPosition(b.x, b.y).setScale(beat));

    this.syncPool(this.pools.enemies, model.enemies,
      e => {
        const key = e.kind === 'mini' ? 'eyeball_mini' : e.kind;
        return this.add.sprite(e.x, e.y, key).play({ key: `${key}_anim`, startFrame: e.id % 2 }).setDepth(8);
      },
      (s, e) => {
        s.setPosition(e.x, e.y).setScale(Math.max(0, easeOutBack(Math.min(1, e.age / .28))) * beat);
        this.flash(s, e.flash > 0);
      });

    this.syncPool(this.pools.pickups, model.pickups,
      p => this.add.image(p.x, p.y, 'pickups', PICKUP_ORDER.indexOf(p.kind)).setDepth(13),
      (s, p) => s.setPosition(p.x, p.y).setScale((1 + Math.sin(p.age * 8) * .08) * beat).setAlpha(.75 + Math.sin(p.age * 12) * .25));

    this.syncBoss(t, beat);
  }

  private syncBoss(t: number, beat: number) {
    const boss = model.boss;
    this.tentacles.clear();
    if (!boss) {
      this.bossBody.setVisible(false);
      for (const [id, s] of this.pools.pods) { s.destroy(); this.pools.pods.delete(id); }
      return;
    }
    const body = this.bossBody.setVisible(true).setPosition(boss.x, boss.y).setScale(1 + (beat - 1) * .5);
    const anim = boss.phase === 'pods' ? 'boss_body_anim' : 'boss_open_anim';
    if (body.anims.currentAnim?.key !== anim) body.play(anim);
    this.flash(body, boss.flash > 0);
    if (boss.phase === 'dying') {
      body.setPosition(boss.x + (Math.random() - .5) * 16, boss.y + (Math.random() - .5) * 16);
      body.setAlpha(Math.max(0, boss.dyingTimer / BOSS.dyingTime));
    } else body.setAlpha(1);

    // 觸手：本體 → 眼球的霓虹曲線；眼球被擊破後縮成短殘肢。
    for (const pod of boss.pods) {
      const reach = pod.alive ? 1 : (BOSS.bodyRadius + 40) / (Math.hypot(pod.x - boss.x, pod.y - boss.y) || 1);
      const ex = boss.x + (pod.x - boss.x) * reach;
      const ey = boss.y + (pod.y - boss.y) * reach;
      const nx = -(pod.y - boss.y), ny = pod.x - boss.x;
      const len = Math.hypot(nx, ny) || 1;
      const bend = Math.sin(t * 2.2 + pod.index * 1.3) * 50 * reach;
      const cx = (boss.x + ex) / 2 + nx / len * bend;
      const cy = (boss.y + ey) / 2 + ny / len * bend;
      const curve = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(boss.x, boss.y), new Phaser.Math.Vector2(cx, cy), new Phaser.Math.Vector2(ex, ey));
      const points = curve.getPoints(14);
      for (const [width, color, alpha] of [[22, 0x2a1640, 1], [10, 0x6b2f9a, 1], [3, 0xff5ce0, .6 + this.motion.energy * .4]] as const) {
        this.tentacles.lineStyle(width, color, alpha * body.alpha);
        this.tentacles.strokePoints(points, false);
      }
    }

    const alivePods = boss.pods.filter(p => p.alive);
    this.syncPool(this.pools.pods, alivePods,
      pod => {
        const sprite = this.add.sprite(pod.x, pod.y, 'boss_pod').play({ key: 'boss_pod_anim', startFrame: pod.index % 2 }).setDepth(6);
        sprite.setData('born', this.time.now);
        return sprite;
      },
      (s, pod) => {
        const grow = Math.max(0, easeOutBack(Math.min(1, (this.time.now - s.getData('born')) / 400)));
        s.setPosition(pod.x, pod.y).setRotation(pod.angle).setAlpha(body.alpha).setScale(grow * beat);
        this.flash(s, pod.flash > 0);
      });
  }

  // ─── Events → FX ─────────────────────────────────────────

  private playFx(key: string, x: number, y: number, scale = 1, tint = 0xffffff) {
    const sprite = this.add.sprite(x, y, key).setScale(scale).setBlendMode(Phaser.BlendModes.ADD).setTint(tint).setDepth(15);
    sprite.play(`${key}_anim`);
    sprite.once('animationcomplete', () => sprite.destroy());
  }

  private popup(x: number, y: number, text: string, color = '#ffe9a8', size = 30) {
    const label = this.add.text(x, y, text, {
      fontFamily: '"Avenir Next", "PingFang TC", sans-serif', fontSize: `${size}px`, fontStyle: '900', color,
      stroke: '#050816', strokeThickness: 6
    }).setOrigin(.5).setDepth(30).setScale(1.4);
    this.tweens.add({ targets: label, scale: 1, duration: 120, ease: 'Back.Out' });
    this.tweens.add({ targets: label, y: y - 60, alpha: 0, duration: 800, delay: 120, ease: 'Cubic.Out', onComplete: () => label.destroy() });
  }

  /** 相機衝擊：微縮放 + 震動。 */
  private punch(zoom: number, shake = 0) {
    const cam = this.cameras.main;
    this.tweens.killTweensOf(cam);
    cam.setZoom(zoom);
    this.tweens.add({ targets: cam, zoom: 1, duration: 260, ease: 'Cubic.Out' });
    if (shake) cam.shake(200, shake);
  }

  private handleEvent(event: GameEvent) {
    switch (event.type) {
      case 'hit':
        this.playFx('fx_hit', event.x, event.y);
        audio.hit();
        break;
      case 'deflect':
        this.playFx('fx_hit', event.x, event.y, .8, 0x9a8cff);
        audio.deflect();
        break;
      case 'kill': {
        const style = KILL_STYLE[event.kind];
        this.playFx('fx_explosion', event.x, event.y, style.scale, style.tint);
        this.sparks.setParticleTint(style.tint);
        this.sparks.explode(event.kind === 'bullet' ? 4 : 14, event.x, event.y);
        if (event.kind !== 'bullet') {
          this.motion.killRing(event.x, event.y, 60 * style.scale, style.tint);
          if (event.score > 0) this.popup(event.x, event.y, `+${event.score}`);
          audio.kill(model.combo, event.kind === 'pod');
        }
        if (event.kind === 'pod') { this.hitStop = .05; this.punch(1.02); }
        if (COMBO_MILESTONES.includes(model.combo) && event.kind !== 'bullet') {
          banner(`COMBO ${model.combo}`, model.combo >= 50 ? '無人能擋！' : '連擊！', '#ffd27a');
        }
        break;
      }
      case 'chain':
        this.motion.bolt(event.points);
        event.points.slice(1).forEach((p, i) => {
          audio.chainLink(i);
          this.sparks.setParticleTint(0x9ae6ff);
          this.sparks.explode(5, p.x, p.y);
        });
        break;
      case 'nova':
        this.motion.nova(event.x, event.y, event.radius, event.depth);
        audio.nova(event.depth);
        if (event.depth >= 2) this.cameras.main.shake(90, .003 + event.depth * .001);
        break;
      case 'chainCombo':
        banner(`CHAIN ×${event.count}`, event.count >= 8 ? '超級連鎖！' : '連環消滅！', model.weapon === 'nova' ? '#ffd35a' : '#9ae6ff');
        this.hitStop = Math.min(.12, .03 + event.count * .008);
        this.punch(1.04, .006);
        audio.chainCombo(event.count);
        break;
      case 'earthHit':
        this.cameras.main.shake(160, .006);
        this.atmoPulse = .18;
        this.playFx('fx_explosion', event.x, event.y, .7, 0x6fd8ff);
        audio.earthHit();
        shell.classList.remove('hurt'); void shell.offsetWidth; shell.classList.add('hurt');
        break;
      case 'stun':
        this.sparks.setParticleTint(0x9aa4ff);
        this.sparks.explode(18, event.x, event.y);
        this.popup(event.x, event.y - 40, '暈！', '#b9c2ff');
        audio.stun();
        break;
      case 'pickup': {
        const [title, label, color] = PICKUP_TEXT[event.kind];
        banner(title, label, color);
        this.motion.killRing(event.x, event.y, 70, Phaser.Display.Color.HexStringToColor(color).color);
        audio.pickup();
        break;
      }
      case 'weaponEnd':
        this.popup(model.playerX, model.playerY - 50, '武器結束', '#9fb4c8', 24);
        break;
      case 'bomb': {
        const { width, height } = this.scale.gameSize;
        const wave = this.add.image(0, 0, 'fx_shockwave').setBlendMode(Phaser.BlendModes.ADD).setScale(.4).setDepth(25);
        this.tweens.add({ targets: wave, scale: Math.hypot(width, height) / 256, alpha: 0, duration: 650, ease: 'Cubic.Out', onComplete: () => wave.destroy() });
        this.cameras.main.flash(220, 180, 230, 255);
        this.hitStop = .08;
        this.punch(1.06, .012);
        audio.bomb();
        break;
      }
      case 'bombCharged':
        banner('BOMB READY', '炸彈 +1', '#6fb8ff');
        break;
      case 'wave':
        announce(`WAVE ${event.id}`, '保護地球！');
        break;
      case 'waveClear':
        announce('CLEAR', `WAVE ${event.id} 完成`, 'cyan');
        break;
      case 'bossWarning':
        announce('WARNING', '巨大外星生物接近中', 'red');
        break;
      case 'bossExposed':
        announce('弱點出現！', '瞄準張開的大嘴', 'red');
        this.punch(1.05, .008);
        break;
      case 'bossShielded':
        announce('觸手再生', '再次擊破眼球', 'cyan');
        break;
      case 'bossDown':
        this.hitStop = .25;
        for (let i = 0; i < 10; i++) {
          this.time.delayedCall(i * 180, () => {
            const x = event.x + (Math.random() - .5) * 300, y = event.y + (Math.random() - .5) * 300;
            this.playFx('fx_explosion', x, y, 1.6, i % 2 ? 0xff4fd8 : 0xffb347);
            this.motion.nova(x, y, 220, i % 8);
            this.sparks.setParticleTint(0xff9ae8);
            this.sparks.explode(20, x, y);
            this.cameras.main.shake(140, .008);
            audio.bossBoom();
          });
        }
        break;
      case 'won':
      case 'lost':
        audio.laser(false);
        this.time.delayedCall(event.type === 'won' ? 600 : 900, () => { setMode('result'); showPanel('result'); });
        break;
      case 'fire':
        break;
    }
  }
}

const game = new Phaser.Game({
  type: Phaser.WEBGL,
  parent: 'game',
  backgroundColor: '#02040c',
  scale: {
    mode: Phaser.Scale.EXPAND,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: BASE_WIDTH,
    height: BASE_HEIGHT
  },
  input: { activePointers: 2 },
  scene: PlayScene
});
if (import.meta.env.DEV) Object.assign(window, { game, audio });

setMode('menu');
showPanel('menu');
