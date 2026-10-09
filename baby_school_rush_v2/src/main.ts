import Phaser from 'phaser';
import { SpinePlugin, type SpineGameObject } from '@esotericsoftware/spine-phaser-v4';
import { BASELINE, CROSSING, LEVEL_LENGTH, platforms, type PlatformSpec } from './game/content';
import { DEADLINE, FIXED_STEP, GameModel, PLAYER_SCREEN_X, RUSH_SECONDS, type GameEvent } from './game/model';
import { SPINE_CHARACTER, SpineCharacterController, type CharacterTransient } from './animation/character-state';
import { ArtSizeTest } from './debug/art-size-test';
import './style.css';

const params = new URLSearchParams(location.search);
/** Dev-only tools such as the manual RUSH trigger; open the page with ?debug to enable them. */
const DEBUG = params.has('debug');
/** Debug only: start the run at this fraction of the level, e.g. ?debug&at=0.74 for the railway crossing. */
const DEBUG_START = DEBUG ? Math.min(.99, Math.max(0, Number(params.get('at')) || 0)) : 0;
/** Debug only: ?debug&art=setup swaps in the character master art at real size; &h= sets its height. */
const ART_TEST = DEBUG && params.get('art') === 'setup' ? new ArtSizeTest(Number(params.get('h')) || 100) : null;

const root = document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML = `
  <main class="shell" data-mode="menu" data-rush="false">
    <div id="game" aria-label="上學衝衝衝 V2 遊戲畫面"></div>
    <header class="hud">
      <div class="brand"><i class="brand-mark"></i><div><strong>上學衝衝衝 V2</strong><span>Phaser 4.2.1 · Spine 4.3.11</span></div></div>
      <div class="route">
        <div class="route-meta"><span id="section">晨光巷口</span><span id="distance">0%</span></div>
        <div class="progress"><i id="progress"></i></div>
        <div class="rush"><span id="rush-label">RUSH 00</span><div class="rush-meter"><i id="rush"></i></div></div>
      </div>
      <div class="stats">
        <div class="stat" id="time-box"><small>BEFORE BELL</small><b id="time">${Math.floor(DEADLINE / 60)}:${String(DEADLINE % 60).padStart(2, '0')}</b></div>
        <div class="stat"><small>COMBO</small><b id="combo">00</b></div>
        <div class="stat"><small>SCORE</small><b id="score">000000</b></div>
      </div>
    </header>
    <button class="utility" id="pause" aria-label="暫停遊戲">Ⅱ</button>
    <button class="boost-test" id="boost-test" aria-label="試放爆衝特效" ${DEBUG ? '' : 'hidden'}><b>爆衝 FX</b><span>X</span></button>
    <div class="event-copy" id="event"><b></b><span></span></div>
    <div class="controls">
      <button class="control" id="slide" aria-label="滑行或急降"><b>↓</b><span>SLIDE / DROP</span></button>
      <div class="micro-guide">JUMP · DOUBLE JUMP · SLIDE · FAST FALL<br>貼近障礙閃避，累積 RUSH</div>
      <button class="control jump" id="jump" aria-label="跳躍或二段跳"><b>↑</b><span>JUMP / AIR</span></button>
    </div>
    <div class="overlay" id="overlay">
      <section class="panel">
        <span class="index">V2 / PLAYABLE FRAMEWORK / 01</span>
        <h1>追上<em>鐘聲</em></h1>
        <p>兩鍵高速橫向跑酷。讀懂三層路線，用最後一刻閃避維持連擊；RUSH 滿格後自動爆發，撞開前方障礙。</p>
        <div class="feature-line"><span>兩鍵八種行為</span><span>Perfect Dodge</span><span>三層實體路線</span><span>自動 RUSH</span></div>
        <button class="primary" id="start">開始 V2 測試</button>
      </section>
    </div>
    <div class="rotate"><b>把手機橫過來</b><span>高速路線需要更寬的反應視野</span></div>
  </main>`;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const shell = document.querySelector<HTMLElement>('.shell')!;
const overlay = $<HTMLDivElement>('overlay');
const eventCopy = $<HTMLDivElement>('event');
const jumpButton = $<HTMLButtonElement>('jump');
const slideButton = $<HTMLButtonElement>('slide');
let model = new GameModel();
let mode: 'menu' | 'countdown' | 'play' | 'pause' | 'result' = 'menu';
let countdown = 0;
let lastCountdown = 3;
let slidePointer: number | null = null;
let soundContext: AudioContext | null = null;

/** The world is authored in a 540-unit-tall space whose bottom edge is the bottom of the screen. */
const WORLD_HEIGHT = 540;
/** Short screens (phones held sideways) get up to this much extra zoom so the runner stays readable. */
const MAX_PHONE_ZOOM = 1.2;
/** CSS height at and above which no extra zoom is applied. */
const FULL_VIEW_CSS_HEIGHT = 520;
/** Distance from the top of the view to the runner's feet before the camera rises: 100 for the runner plus room for the HUD. */
const HEADROOM = 170;
/** How far above the authored world the camera may rise for high double jumps; the sky is painted to cover it. */
const SKY_OVERSCAN = 160;

function tone(frequency: number, duration = .09, volume = .035) {
  try {
    soundContext ??= new AudioContext();
    void soundContext.resume();
    const oscillator = soundContext.createOscillator();
    const gain = soundContext.createGain();
    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, soundContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, soundContext.currentTime + duration);
    oscillator.connect(gain).connect(soundContext.destination);
    oscillator.start(); oscillator.stop(soundContext.currentTime + duration);
  } catch { /* Audio feedback is optional. */ }
}

function announce(title: string, subtitle: string) {
  const titleNode = eventCopy.querySelector('b')!;
  const subtitleNode = eventCopy.querySelector('span')!;
  titleNode.textContent = title;
  subtitleNode.textContent = subtitle;
  eventCopy.classList.remove('show');
  requestAnimationFrame(() => eventCopy.classList.add('show'));
}

function clearInput() {
  slidePointer = null;
  model.setSlide(false);
  slideButton.classList.remove('active');
}

function showMenu() {
  mode = 'menu'; shell.dataset.mode = mode; shell.dataset.rush = 'false';
  overlay.hidden = false;
  overlay.innerHTML = `<section class="panel"><span class="index">V2 / PLAYABLE FRAMEWORK / 01</span><h1>追上<em>鐘聲</em></h1><p>兩鍵高速橫向跑酷。讀懂三層路線，用最後一刻閃避維持連擊；RUSH 滿格後自動爆發，撞開前方障礙。</p><div class="feature-line"><span>兩鍵八種行為</span><span>Perfect Dodge</span><span>三層實體路線</span><span>自動 RUSH</span></div><button class="primary" id="start">開始 V2 測試</button></section>`;
  $<HTMLButtonElement>('start').onclick = startRun;
}

function startRun() {
  model = new GameModel();
  model.distance = DEBUG_START * LEVEL_LENGTH;
  model.start();
  mode = 'countdown'; shell.dataset.mode = mode;
  countdown = 3; lastCountdown = 3;
  overlay.hidden = true;
  announce('3', 'READY');
  tone(440);
}

function showResult() {
  mode = 'result'; shell.dataset.mode = mode; shell.dataset.rush = 'false'; clearInput();
  const won = model.state === 'won';
  overlay.hidden = false;
  overlay.innerHTML = `<section class="panel"><span class="index">RUN REPORT / ${won ? 'ARRIVED' : 'LATE'}</span><h1>${won ? '鐘響<em>之前</em>' : '再快<em>一點</em>'}</h1><p>${won ? `還剩 ${Math.ceil(model.timeLeft)} 秒抵達。` : '時間歸零；碰撞會扣除 3.5 秒，貼近障礙閃避才能更快進入 RUSH。'}</p><div class="result-grid"><div><b>${model.perfects}</b><span>PERFECT</span></div><div><b>${model.bestCombo}</b><span>BEST COMBO</span></div><div><b>${model.score}</b><span>SCORE</span></div></div><button class="primary" id="restart">再跑一次</button></section>`;
  $<HTMLButtonElement>('restart').onclick = startRun;
}

function pause() {
  if (mode !== 'play' && mode !== 'countdown') return;
  mode = 'pause'; shell.dataset.mode = mode; clearInput();
  overlay.hidden = false;
  overlay.innerHTML = `<section class="panel"><span class="index">PAUSED / ROUTE HELD</span><h1>先停<em>一下</em></h1><p>遊戲時間、角色物理與障礙全部暫停。</p><button class="primary" id="resume">三秒後繼續</button></section>`;
  $<HTMLButtonElement>('resume').onclick = resume;
}

function resume() {
  if (mode !== 'pause') return;
  overlay.hidden = true; mode = 'countdown'; shell.dataset.mode = mode;
  countdown = 3; lastCountdown = 3; announce('3', 'BACK ON ROUTE');
}

$<HTMLButtonElement>('start').onclick = startRun;
$<HTMLButtonElement>('pause').onclick = () => mode === 'pause' ? resume() : pause();
$<HTMLButtonElement>('boost-test').onclick = () => { if (DEBUG && mode === 'play') model.triggerRush(); };
jumpButton.addEventListener('pointerdown', event => { event.preventDefault(); if (mode === 'play') model.jump(); });
slideButton.addEventListener('pointerdown', event => {
  event.preventDefault();
  if (mode !== 'play') return;
  slidePointer = event.pointerId;
  slideButton.setPointerCapture(event.pointerId);
  slideButton.classList.add('active');
  model.setSlide(true);
});
for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  slideButton.addEventListener(eventName, event => {
    if (slidePointer === (event as PointerEvent).pointerId) {
      slidePointer = null; slideButton.classList.remove('active'); model.setSlide(false);
    }
  });
}
window.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', ' '].includes(event.key)) event.preventDefault();
  if (event.key === 'Escape' && mode === 'pause') { resume(); return; }
  if (event.repeat || mode !== 'play') return;
  if (event.key === 'ArrowUp' || event.key === ' ') model.jump();
  if (event.key === 'ArrowDown') { slideButton.classList.add('active'); model.setSlide(true); }
  if (DEBUG && event.key.toLowerCase() === 'x') model.triggerRush();
  if (event.key === 'Escape') pause();
});
window.addEventListener('keyup', event => {
  if (event.key === 'ArrowDown') { slideButton.classList.remove('active'); model.setSlide(false); }
});
window.addEventListener('blur', pause);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: number; size: number };
type Streak = { x: number; y: number; length: number; speed: number; life: number; alpha: number };

class RushScene extends Phaser.Scene {
  backdrop!: Phaser.GameObjects.Graphics;
  world!: Phaser.GameObjects.Graphics;
  actor!: Phaser.GameObjects.Graphics;
  fx!: Phaser.GameObjects.Graphics;
  particles: Particle[] = [];
  streaks: Streak[] = [];
  accumulator = 0;
  freeze = 0;
  rushFxAge = 99;
  rushRelease = 0;
  bellClock = 0;
  bellHigh = false;
  rumbleClock = 0;
  logicalWidth = 960;
  baseZoom = 1;
  viewHeight = WORLD_HEIGHT;
  cameraY = WORLD_HEIGHT / 2;
  spineGirl: SpineGameObject | null = null;
  spineController: SpineCharacterController | null = null;

  preload() {
    ART_TEST?.preload(this);
    if (!SPINE_CHARACTER.enabled) return;
    this.load.spineSkeleton(SPINE_CHARACTER.skeletonKey, SPINE_CHARACTER.skeletonUrl, { format: 'binary' });
    this.load.spineAtlas(SPINE_CHARACTER.atlasKey, SPINE_CHARACTER.atlasUrl);
  }

  create() {
    this.backdrop = this.add.graphics().setDepth(-10);
    this.world = this.add.graphics().setDepth(0);
    this.actor = this.add.graphics().setDepth(2);
    this.fx = this.add.graphics().setDepth(4);
    if (SPINE_CHARACTER.enabled) {
      this.spineGirl = this.add.spine(PLAYER_SCREEN_X, BASELINE, SPINE_CHARACTER.skeletonKey, SPINE_CHARACTER.atlasKey, { renderer: 'phaser' }).setDepth(2);
      this.spineController = new SpineCharacterController(this.spineGirl);
      this.actor.setVisible(false);
    }
    this.scale.on('resize', () => this.layout());
    this.layout();
    if (ART_TEST) { ART_TEST.create(this, this.baseZoom); this.actor.setVisible(false); }
  }

  layout() {
    const cssHeight = this.scale.height / renderScale();
    const phoneZoom = Phaser.Math.Clamp(FULL_VIEW_CSS_HEIGHT / cssHeight, 1, MAX_PHONE_ZOOM);
    this.viewHeight = WORLD_HEIGHT / phoneZoom;
    this.baseZoom = this.scale.height / this.viewHeight;
    this.logicalWidth = this.scale.width / this.baseZoom;
    this.cameraY = this.cameraTarget();
    this.cameras.main.setZoom(this.baseZoom);
    this.followCamera(1);
  }

  /** Rest with the ground at the bottom of the view; rise only when the runner's head would leave the top. */
  cameraTarget() {
    const resting = WORLD_HEIGHT - this.viewHeight / 2;
    return Math.max(this.viewHeight / 2 - SKY_OVERSCAN, Math.min(resting, model.y - HEADROOM + this.viewHeight / 2));
  }

  followCamera(blend: number) {
    this.cameraY += (this.cameraTarget() - this.cameraY) * blend;
    this.cameras.main.centerOn(this.logicalWidth / 2, this.cameraY);
  }

  emit(x: number, y: number, color: number, amount: number, force = 1) {
    for (let i = 0; i < amount; i++) {
      this.particles.push({ x, y, vx: (-80 - Math.random() * 220) * force, vy: (-40 - Math.random() * 150) * force, life: .35 + Math.random() * .3, max: .65, color, size: 2 + Math.random() * 5 });
    }
  }

  handle(events: GameEvent[]) {
    for (const event of events) {
      if (event.type === 'jump' || event.type === 'double-jump') { this.emit(PLAYER_SCREEN_X - 12, model.y, 0xf6f0dc, 5); tone(event.type === 'jump' ? 620 : 780); }
      if (event.type === 'ramp') { this.emit(PLAYER_SCREEN_X - 12, model.y, 0xdded8c, 12, 1.4); tone(700, .12, .04); }
      if (event.type === 'land') { this.emit(PLAYER_SCREEN_X, model.y, 0xc7d6bf, 7); tone(220, .05, .02); }
      if (event.type === 'land' || event.type === 'slide-start' || event.type === 'slide-end' || event.type === 'hit') this.spineController?.playTransient(event.type as CharacterTransient);
      if (event.type === 'pickup') tone(980, .05, .02);
      if (event.type === 'perfect') { announce('PERFECT', 'RUSH +25'); this.freeze = .055; this.cameras.main.shake(65, .0025); tone(1_280, .08, .045); }
      if (event.type === 'hit') { announce('TIME −3.5', 'COMBO BREAK'); this.cameras.main.shake(180, .012); this.emit(PLAYER_SCREEN_X + 8, model.y - 35, 0xff7d8f, 18, 1.5); tone(120, .18, .06); }
      if (event.type === 'rush-start') {
        announce('爆衝！', 'SCHOOL RUSH · FULL VELOCITY');
        shell.dataset.rush = 'true';
        this.rushFxAge = 0;
        this.rushRelease = 0;
        this.cameras.main.flash(75, 236, 255, 180);
        this.cameras.main.shake(190, .008);
        this.cameras.main.zoomTo(this.baseZoom * 1.045, 135, 'Sine.easeOut');
        this.emit(PLAYER_SCREEN_X + 8, model.y - 38, 0xdded8c, 30, 2.2);
        tone(110, .22, .065); window.setTimeout(() => tone(1_640, .22, .05), 65);
      }
      if (event.type === 'rush-end') {
        shell.dataset.rush = 'false'; announce('收勢', 'BREATHE · READ THE NEXT LINE');
        this.rushRelease = .28;
        this.cameras.main.zoomTo(this.baseZoom, 260, 'Sine.easeInOut');
      }
      if (event.type === 'smash') {
        const x = event.x - model.distance;
        this.emit(x, event.y, 0xffd370, 26, 2.4);
        this.emit(x, event.y, 0xf5f0dc, 16, 1.8);
        this.cameras.main.shake(75, .0045);
        tone(150, .07, .04);
      }
      if (event.type === 'section') announce(event.label, 'ROUTE PHASE');
      if (event.type === 'crossing-warning') { announce('平交道！', '柵欄要放下了 · 走天橋 ↑ 或地下道 ↓'); this.cameras.main.flash(90, 255, 90, 100); }
      if (event.type === 'train-in') { this.cameras.main.shake(260, .008); this.emit(CROSSING.trackX - model.distance, BASELINE - 20, 0xd9dfd6, 22, 1.6); }
      if (event.type === 'blocked') { announce('等電車通過', '下次走天橋 ↑ 或地下道 ↓'); tone(160, .2, .05); }
      if (event.type === 'crossing-clear') { announce('安全通過！', 'BONUS +2000 · RUSH +20'); this.freeze = .045; tone(1_480, .12, .05); }
      if (event.type === 'finish') this.spineController?.playTransient('victory');
    }
  }

  drawBackdrop(time: number) {
    const g = this.backdrop, width = this.logicalWidth;
    g.clear();
    g.fillStyle(model.rushTimer > 0 ? 0x183730 : 0x8bc8c1); g.fillRect(0, -SKY_OVERSCAN, width, WORLD_HEIGHT + SKY_OVERSCAN);
    g.fillStyle(0xf5d899, .72); g.fillCircle(width * .78, 116, 54);
    const farShift = (model.distance * .08) % 240;
    g.fillStyle(0x71978c, .55);
    for (let i = -1; i < Math.ceil(width / 240) + 2; i++) {
      const x = i * 240 - farShift;
      const height = 90 + ((i * 47 % 70) + 70) % 70;
      g.fillRect(x, 294 - height, 170, height);
      g.fillStyle(0xa6c2ad, .42); g.fillRect(x + 22, 232 - height / 2, 18, 24); g.fillStyle(0x71978c, .55);
    }
    const midShift = (model.distance * .24) % 310;
    g.fillStyle(0x446c62, .72);
    for (let i = -1; i < Math.ceil(width / 310) + 2; i++) {
      const x = i * 310 - midShift;
      g.fillRect(x, 270, 230, 160);
      g.fillStyle(0x9bb7a2, .42);
      for (let w = 0; w < 4; w++) g.fillRect(x + 25 + w * 46, 300, 20, 34);
      g.fillStyle(0x446c62, .72);
    }
    g.fillStyle(0x274a43); g.fillRect(0, 410, width, 130);
    g.fillStyle(0x30574e); g.fillRect(0, 430, width, 110);
    if (model.rushTimer > 0 || model.section.id === 'fast' || model.section.id === 'event' || model.section.id === 'final') {
      const intensity = model.rushTimer > 0 ? 32 : 12;
      g.lineStyle(model.rushTimer > 0 ? 2 : 1, 0xf4f0c8, model.rushTimer > 0 ? .42 : .2);
      for (let i = 0; i < intensity; i++) {
        const y = 80 + ((i * 73 + time * .5) % 370);
        const x = ((i * 191 - time * (model.rushTimer > 0 ? 1.8 : .8)) % (width + 240)) - 120;
        g.lineBetween(x, y, x + 80 + (i % 4) * 35, y);
      }
    }
  }

  drawWorld(time: number) {
    const g = this.world, offset = model.distance;
    g.clear();
    for (const platform of platforms) {
      const x = platform.x - offset;
      if (platform.deck || x > this.logicalWidth + 100 || x + platform.width < -100) continue;
      const color = platform.route === 'upper' ? 0x263d39 : platform.route === 'lower' ? 0x162f2d : 0x203b36;
      g.fillStyle(color); g.fillRect(x, platform.y, platform.width, platform.route === 'lower' ? 14 : 110);
      g.fillStyle(platform.route === 'upper' ? 0xdded8c : 0x7ba093); g.fillRect(x, platform.y, platform.width, 4);
      if (platform.route === 'lower') { g.fillStyle(0x7ba093); g.fillTriangle(x + platform.width - 90, platform.y, x + platform.width, platform.y, x + platform.width, BASELINE); }
    }
    this.drawCrossing(offset, time);
    for (const platform of platforms) if (platform.deck) this.drawDeck(platform, platform.x - offset);
    for (const obstacle of model.obstacles) {
      const x = obstacle.x - offset;
      if (x < -150 || x > this.logicalWidth + 150 || obstacle.cleared && !obstacle.destroyed) continue;
      const alpha = obstacle.hit ? .25 : obstacle.destroyed ? Math.max(0, (x + 100) / 200) * .25 : 1;
      g.fillStyle(obstacle.kind === 'beam' ? 0xe6839c : obstacle.kind === 'bike' ? 0xf2bd62 : 0xe86f72, alpha);
      if (obstacle.kind === 'beam') {
        g.fillRect(x - obstacle.width / 2, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
        g.fillStyle(0x102522, alpha); for (let stripe = 0; stripe < obstacle.width; stripe += 24) g.fillRect(x - obstacle.width / 2 + stripe, obstacle.y - obstacle.height, 10, obstacle.height);
      } else if (obstacle.kind === 'bike') {
        g.lineStyle(5, 0xf2bd62, alpha); g.strokeCircle(x - 17, obstacle.y - 14, 14); g.strokeCircle(x + 18, obstacle.y - 14, 14); g.lineBetween(x - 17, obstacle.y - 14, x, obstacle.y - 42); g.lineBetween(x, obstacle.y - 42, x + 18, obstacle.y - 14);
      } else {
        g.fillTriangle(x - obstacle.width / 2, obstacle.y, x + obstacle.width / 2, obstacle.y, x, obstacle.y - obstacle.height);
        g.fillStyle(0x102522, alpha); g.fillRect(x - 4, obstacle.y - obstacle.height * .66, 8, obstacle.height * .36);
      }
    }
    for (const pickup of model.pickups) {
      if (pickup.collected) continue;
      const x = pickup.x - offset;
      if (x < -30 || x > this.logicalWidth + 30) continue;
      g.fillStyle(0xdded8c, .18); g.fillCircle(x, pickup.y, 15);
      g.lineStyle(2, 0xdded8c); g.strokeCircle(x, pickup.y, 7); g.lineBetween(x - 4, pickup.y, x + 4, pickup.y); g.lineBetween(x, pickup.y - 4, x, pickup.y + 4);
    }
    const schoolX = LEVEL_LENGTH - offset;
    if (schoolX < this.logicalWidth + 500) {
      g.fillStyle(0xf6f0dc); g.fillRect(schoolX, 210, 460, 220);
      g.fillStyle(0xe6839c); g.fillTriangle(schoolX - 25, 225, schoolX + 230, 115, schoolX + 485, 225);
      g.fillStyle(0x23463f); g.fillRect(schoolX + 186, 318, 88, 112);
    }
  }

  drawDeck(platform: PlatformSpec, x: number) {
    if (x > this.logicalWidth + 100 || x + platform.width < -100) return;
    const g = this.world;
    g.fillStyle(0x203b36);
    g.fillRect(x + 20, platform.y + 12, 26, BASELINE - platform.y - 12);
    g.fillRect(x + platform.width - 46, platform.y + 12, 26, BASELINE - platform.y - 12);
    g.fillStyle(0x263d39); g.fillRect(x, platform.y, platform.width, 12);
    g.fillStyle(0xdded8c); g.fillRect(x, platform.y, platform.width, 4);
    g.lineStyle(2, 0x7ba093, .7); g.lineBetween(x, platform.y - 24, x + platform.width, platform.y - 24);
    for (let post = 0; post <= platform.width; post += 65) g.lineBetween(x + post, platform.y - 24, x + post, platform.y);
  }

  /** Tracks, the passing train and both crossing gates. */
  drawCrossing(offset: number, time: number) {
    const g = this.world, trackX = CROSSING.trackX - offset, width = CROSSING.trackWidth;
    if (trackX > this.logicalWidth + 300 || trackX + width < -300) return;
    g.fillStyle(0x3a4440); g.fillRect(trackX, BASELINE, width, 12);
    g.fillStyle(0xb7c2b9);
    for (const rail of [40, width - 40]) g.fillRect(trackX + rail - 7, BASELINE - 4, 14, 6);
    const progress = model.trainProgress;
    if (progress !== null) {
      const top = CROSSING.bridgeY + 14, height = BASELINE + 6 - top;
      const alpha = Math.min(1, progress * 14, (1 - progress) * 14);
      g.fillStyle(0xd9dfd6, alpha); g.fillRect(trackX - 6, top, width + 12, height);
      g.fillStyle(0xe6839c, alpha); g.fillRect(trackX - 6, top + 50, width + 12, 9);
      g.fillStyle(0x102522, .6 * alpha);
      const sweep = (time * 1.7) % 70;
      for (let x = sweep - 70; x < width; x += 70) {
        const left = Math.max(0, x), right = Math.min(width, x + 28);
        if (right > left) g.fillRect(trackX + left, top + 12, right - left, 26);
      }
      g.fillStyle(0x102522, .35 * alpha); g.fillRect(trackX - 6, top + height - 14, width + 12, 8);
    }
    this.drawGate(CROSSING.gateX - offset, -1);
    this.drawGate(CROSSING.trackX + width + 40 - offset, 1);
  }

  /** Post, alternating warning lights and a striped arm that swings from upright down to the road. */
  drawGate(x: number, direction: -1 | 1) {
    const g = this.world;
    const ringing = model.crossingTime >= 0 && model.crossingTime < CROSSING.armUp;
    const blink = Math.floor(model.crossingTime * 3) % 2;
    g.fillStyle(0xf6f0dc); g.fillRect(x - 3, 348, 6, BASELINE - 348);
    g.lineStyle(4, 0xf2bd62); g.lineBetween(x - 12, 342, x + 12, 360); g.lineBetween(x - 12, 360, x + 12, 342);
    g.fillStyle(0x102522); g.fillRect(x - 16, 368, 32, 14);
    g.fillStyle(ringing && blink === 0 ? 0xff4d5e : 0x52302f); g.fillCircle(x - 8, 375, 5);
    g.fillStyle(ringing && blink === 1 ? 0xff4d5e : 0x52302f); g.fillCircle(x + 8, 375, 5);
    const angle = -Math.PI / 2 + direction * (Math.PI / 2) * model.armLowered;
    const pivotY = 396, length = 120, segments = 6;
    for (let i = 0; i < segments; i++) {
      const a = length * i / segments, b = length * (i + 1) / segments;
      g.lineStyle(6, i % 2 ? 0x102522 : 0xf2bd62);
      g.lineBetween(x + Math.cos(angle) * a, pivotY + Math.sin(angle) * a, x + Math.cos(angle) * b, pivotY + Math.sin(angle) * b);
    }
  }

  crossingAudio(dt: number) {
    if (mode !== 'play' || model.crossingTime < 0 || model.crossingTime > CROSSING.armUp) return;
    this.bellClock -= dt;
    if (this.bellClock <= 0) { this.bellClock = .32; this.bellHigh = !this.bellHigh; tone(this.bellHigh ? 1_046 : 880, .12, .03); }
    if (model.trainProgress === null) return;
    this.rumbleClock -= dt;
    if (this.rumbleClock <= 0) { this.rumbleClock = .4; tone(62, .38, .05); this.cameras.main.shake(380, .0018); }
  }

  drawGirl(graphics: Phaser.GameObjects.Graphics, x: number, y: number, alpha: number, tint = 0xe6839c) {
    const pose = model.pose;
    const phase = model.distance * (pose === 'fast-run' || pose === 'rush' ? .075 : .055);
    const stride = pose === 'slide' || pose === 'idle' ? 0 : Math.sin(phase) * (pose === 'rush' ? 28 : pose === 'fast-run' ? 23 : 18);
    const bob = model.grounded && pose !== 'slide' ? Math.abs(Math.sin(phase * 2)) * 4 : 0;
    const lean = pose === 'rush' ? 13 : pose === 'fast-run' ? 8 : 3;
    const baseY = y - bob;
    graphics.lineStyle(7, 0xf6e6c8, alpha);
    if (pose === 'slide') {
      graphics.lineBetween(x - 5, baseY - 23, x + 33, baseY - 6);
      graphics.lineBetween(x - 1, baseY - 19, x - 30, baseY - 4);
    } else {
      graphics.lineBetween(x, baseY - 34, x + stride, baseY - 2);
      graphics.lineBetween(x, baseY - 34, x - stride * .85, baseY - 2);
      graphics.lineStyle(6, 0xf6e6c8, alpha);
      graphics.lineBetween(x + lean, baseY - 57, x - stride * .62, baseY - 38);
      graphics.lineBetween(x + lean, baseY - 57, x + stride * .62, baseY - 38);
    }
    graphics.fillStyle(tint, alpha);
    if (pose === 'slide') graphics.fillRoundedRect(x - 20, baseY - 44, 56, 28, 8);
    else graphics.fillRoundedRect(x - 13 + lean, baseY - 70, 29, 39, 9);
    graphics.fillStyle(0xc65d7a, alpha); graphics.fillRoundedRect(x - 24 + lean, baseY - 67, 18, 30, 6);
    graphics.fillStyle(0x142a28, alpha);
    graphics.fillCircle(x + lean + 7, baseY - (pose === 'slide' ? 56 : 83), 18);
    graphics.fillTriangle(x - 7 + lean, baseY - 83, x - 30 + lean, baseY - 56, x + 5 + lean, baseY - 65);
    graphics.fillStyle(0xf5d7bc, alpha); graphics.fillCircle(x + lean + 12, baseY - (pose === 'slide' ? 53 : 81), 10);
  }

  drawActor(time: number) {
    if (ART_TEST) { ART_TEST.update(model, PLAYER_SCREEN_X, model.invincible <= 0 || Math.floor(time / 70) % 2 === 0 ? 1 : .22); return; }
    if (this.spineController && this.spineGirl) {
      this.spineController.setPose(model.pose, model.speed);
      const alpha = model.invincible <= 0 || Math.floor(time / 70) % 2 === 0 ? 1 : .22;
      this.spineController.setTransform(PLAYER_SCREEN_X, model.y, alpha);
      return;
    }
    this.actor.clear();
    if (model.rushTimer > 0) {
      const pulse = .8 + Math.sin(time * .03) * .2;
      for (let i = 7; i >= 1; i--) this.drawGirl(this.actor, PLAYER_SCREEN_X - i * (15 + i * 1.7), model.y + Math.sin(time * .018 - i) * 2, (.025 + (8 - i) * .018) * pulse, i % 2 ? 0x84d1c4 : 0xdded8c);
    }
    if (model.invincible <= 0 || Math.floor(time / 70) % 2 === 0) this.drawGirl(this.actor, PLAYER_SCREEN_X, model.y, 1);
  }

  drawFx(dt: number) {
    const g = this.fx; g.clear();
    if (model.rushTimer > 0) {
      this.rushFxAge += dt;
      const burst = Math.max(0, 1 - this.rushFxAge / .22);
      const amount = burst > 0 ? 7 : 3;
      for (let i = 0; i < amount; i++) this.streaks.push({
        x: this.logicalWidth + Math.random() * 180,
        y: 70 + Math.random() * 390,
        length: 90 + Math.random() * 260 + burst * 180,
        speed: 950 + Math.random() * 1050,
        life: .28 + Math.random() * .18,
        alpha: .18 + Math.random() * .42
      });
      if (Math.random() < .72) this.particles.push({ x: PLAYER_SCREEN_X + 24, y: model.y - Math.random() * 62, vx: -420 - Math.random() * 460, vy: -25 + Math.random() * 50, life: .24 + Math.random() * .22, max: .46, color: Math.random() < .55 ? 0xdded8c : 0x84d1c4, size: 2 + Math.random() * 4 });
      g.fillStyle(0x061b19, .18); g.fillRect(0, -SKY_OVERSCAN, this.logicalWidth, WORLD_HEIGHT + SKY_OVERSCAN);
      g.fillStyle(0xdded8c, .05 + burst * .12); g.fillTriangle(PLAYER_SCREEN_X - 15, model.y - 52, 0, model.y - 135, 0, model.y + 45);
      g.lineStyle(2 + burst * 4, 0xf7ffd7, .24 + burst * .48);
      for (let ray = 0; ray < 8; ray++) {
        const angle = (ray / 8) * Math.PI * 2;
        const inner = 38 + (1 - burst) * 34;
        const outer = inner + 95 * burst;
        g.lineBetween(PLAYER_SCREEN_X + Math.cos(angle) * inner, model.y - 42 + Math.sin(angle) * inner, PLAYER_SCREEN_X + Math.cos(angle) * outer, model.y - 42 + Math.sin(angle) * outer);
      }
    } else this.rushFxAge = 99;
    for (const streak of this.streaks) {
      streak.life -= dt; streak.x -= streak.speed * dt;
      if (streak.life <= 0) continue;
      g.lineStyle(1 + streak.alpha * 4, 0xf5ffd5, Math.min(streak.alpha, streak.life * 2.5));
      g.lineBetween(streak.x, streak.y, streak.x + streak.length, streak.y - streak.length * .025);
    }
    this.streaks = this.streaks.filter(streak => streak.life > 0);
    for (const particle of this.particles) {
      particle.life -= dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vy += 360 * dt;
      if (particle.life <= 0) continue;
      g.fillStyle(particle.color, Math.min(1, particle.life / particle.max)); g.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
    this.particles = this.particles.filter(particle => particle.life > 0);
    if (this.rushRelease > 0) this.rushRelease = Math.max(0, this.rushRelease - dt);
  }

  syncHud() {
    const seconds = Math.max(0, Math.ceil(model.timeLeft));
    $('time').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    $('time-box').classList.toggle('danger', seconds <= 12);
    $('combo').textContent = String(model.combo).padStart(2, '0');
    $('score').textContent = String(model.score).padStart(6, '0');
    $('section').textContent = model.section.label;
    $('distance').textContent = `${Math.floor(model.progress * 100)}%`;
    $<HTMLElement>('progress').style.width = `${model.progress * 100}%`;
    $<HTMLElement>('rush').style.width = `${model.rushTimer > 0 ? model.rushTimer / RUSH_SECONDS * 100 : model.rush}%`;
    $('rush-label').textContent = model.rushTimer > 0 ? `RUSH ${model.rushTimer.toFixed(1)}` : `RUSH ${String(Math.floor(model.rush)).padStart(2, '0')}`;
    shell.dataset.rush = String(model.rushTimer > 0);
  }

  update(time: number, delta: number) {
    const dt = Math.min(delta / 1000, .05);
    if (mode === 'countdown') {
      countdown -= dt;
      const next = Math.max(1, Math.ceil(countdown));
      if (next !== lastCountdown) { lastCountdown = next; announce(String(next), 'READY'); tone(440 + (3 - next) * 80); }
      if (countdown <= 0) { mode = 'play'; shell.dataset.mode = mode; announce('GO', 'READ THE ROUTE'); tone(860, .11, .05); }
    }
    if (mode === 'play') {
      if (this.freeze > 0) this.freeze = Math.max(0, this.freeze - dt);
      else {
        this.accumulator += dt;
        while (this.accumulator >= FIXED_STEP && model.state === 'running') {
          model.step(FIXED_STEP);
          this.handle(model.consumeEvents());
          this.accumulator -= FIXED_STEP;
        }
      }
      if (model.state !== 'running') showResult();
    }
    this.crossingAudio(dt);
    this.followCamera(1 - Math.exp(-dt * 10));
    this.drawBackdrop(time);
    this.drawWorld(time);
    this.drawActor(time);
    this.drawFx(dt);
    this.syncHud();
  }
}

function renderScale() { return Math.min(window.devicePixelRatio || 1, 2); }

const game = new Phaser.Game({
  type: Phaser.WEBGL,
  parent: 'game',
  backgroundColor: '#102522',
  scene: RushScene,
  audio: { noAudio: true },
  // Sized manually below so the backing store follows devicePixelRatio; RESIZE mode would reset it to CSS pixels.
  scale: { mode: Phaser.Scale.NONE, width: window.innerWidth * renderScale(), height: window.innerHeight * renderScale() },
  plugins: {
    scene: [{ key: 'spine.SpinePlugin', plugin: SpinePlugin, mapping: 'spine' }]
  }
});

const resize = new ResizeObserver(() => {
  game.scale.resize(Math.round(shell.clientWidth * renderScale()), Math.round(shell.clientHeight * renderScale()));
});
resize.observe(shell);
showMenu();
