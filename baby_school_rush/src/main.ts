import Phaser from 'phaser';
import { Run, GROUND, PLAYER_X, SPEED, DURATION, activeSequence } from './model';
import { worldLayout } from './layout';
import { FOREGROUND_BASE, FRONT_WIDTH, SCHOOL_WIDTH, SCHOOL_START, screenX, obstacleWorldX, cameraDistance, foregroundVariant, landscapeAllowed } from './world';
import './style.css';

const root = document.querySelector<HTMLDivElement>('#app')!;
root.innerHTML = `
<main class="game-frame" data-mode="menu" aria-label="上學衝衝衝遊戲">
  <div id="game" aria-label="上學跑酷遊戲畫面"></div>
  <header class="hud">
    <div><div class="identity">上學<span>衝衝衝～</span></div>
      <div class="stats"><div class="pill hearts" id="hearts">♥ ♥ ♥</div><div class="pill star-count" id="stars">★ 0</div><div class="pill combo-count" id="combo">連擊 0</div></div>
    </div>
    <div class="progress"><div class="progress-label"><span id="section">家門口</span><span id="distance">到校 0%</span></div><div class="track"><div class="fill" id="fill"></div></div></div>
    <div class="utilities">
      <button class="icon" id="sound" aria-label="關閉音效" aria-pressed="false">♫</button>
      <button class="icon" id="fullscreen" aria-label="切換全螢幕" hidden>⛶</button>
      <button class="icon" id="pause" aria-label="暫停遊戲">Ⅱ</button>
    </div>
  </header>
  <div class="hint" id="hint" hidden></div>
  <div class="controls">
    <button class="control" id="duck" aria-label="按住蹲下"><b>↓</b><span>蹲下</span><small>按住 ↓</small></button>
    <div class="trip-note"><strong id="trip-title">01 · 早安，小巷！</strong><span id="best">晴天 · 07:25 · 65 秒</span></div>
    <button class="control jump" id="jump" aria-label="跳躍"><b>↑</b><span>跳躍</span><small>↑ / 空白鍵</small></button>
  </div>
  <div class="overlay" id="overlay">
    <section class="panel" aria-label="開始遊戲">
      <div class="route-tag">每天的上學路，都是小冒險</div>
      <h1>上學<span>衝衝衝～</span></h1>
      <div class="route-stamp">第 01 關 · 早安，小巷！</div>
      <p>背好粉色書包，穿過小公園。<br>收集一路的星星，我們學校見！</p>
      <div class="instructions"><span><b>↑</b>點一下跳躍</span><span><b>↓</b>按住蹲下</span></div>
      <button class="primary" id="start" disabled>正在準備上學路…</button>
      <button class="secondary" id="practice" disabled>先練習一下 · 不扣愛心</button>
      <p class="micro">橫向遊玩 · 一起出發上學</p>
    </section>
  </div>
<div class="rotate-screen" role="status"><div class="phone">↻</div><h2>把手機橫過來吧！</h2><p>上學冒險需要寬一點的視野。<br>轉成橫向後，就可以繼續遊玩。</p></div></main>`;
const el = (id: string) => document.getElementById(id)!;
const frame = document.querySelector<HTMLElement>('.game-frame')!;
type Mode = 'menu' | 'countdown' | 'play' | 'pause' | 'result';
let run = new Run(), mode: Mode = 'menu', count = 3, accumulator = 0;
let muted = false, audio: AudioContext | undefined;
const duckKeys = new Set<string>();
const portrait = matchMedia('(orientation: portrait)');
const isPortrait = () => !landscapeAllowed(frame.clientWidth, frame.clientHeight);
function setMode(value: Mode) { mode = value; frame.dataset.mode = value; }
function tone(freq: number) {
  if (muted) return;
  try {
    audio ??= new AudioContext(); void audio.resume();
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.frequency.value = freq;
    gain.gain.setValueAtTime(.05, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .15);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(); oscillator.stop(audio.currentTime + .16);
  } catch { /* Audio is optional; gameplay stays available. */ }
}
function best() {
  try {
    const n = Number(localStorage.getItem('school-rush-best-v1'));
    el('best').textContent = n > 0 ? `最佳紀錄 ${'★'.repeat(Math.min(n, 3))}` : '晴天 · 07:25 · 65 秒';
  } catch { /* Storage can be unavailable in private browsing. */ }
}
best();
function clearInput() {
  duckKeys.clear(); run.duck = false; run.buffer = 0;
  el('duck').classList.remove('pressed');
}
function countdown() {
  if (isPortrait()) return;
  setMode('countdown'); count = 3; accumulator = 0; clearInput();
  el('overlay').hidden = false;
  el('overlay').innerHTML = '<div class="count" aria-label="倒數三秒">3</div>';
}
function start(practice = false) { if (isPortrait()) return; run = new Run(practice); countdown(); tone(520); }
function pause() {
  if (mode !== 'play' && mode !== 'countdown') return;
  setMode('pause'); clearInput(); el('overlay').hidden = false;
  el('overlay').innerHTML = `<section class="panel" aria-label="遊戲已暫停"><div class="route-tag">休息一下</div><h2>等你一起出發</h2><p>上學路會在這裡等你。</p><button class="primary" id="resume">繼續冒險</button><button class="secondary" id="restart">重新開始</button></section>`;
  el('resume').onclick = countdown;
  el('restart').onclick = () => start(run.practice);
}
function finish() {
  setMode('result'); clearInput();
  const won = run.state === 'won';
  if (won && !run.practice) {
    try { localStorage.setItem('school-rush-best-v1', String(Math.max(run.rating, Number(localStorage.getItem('school-rush-best-v1')) || 0))); } catch { /* Best score is optional. */ }
    best();
  }
  el('overlay').hidden = false;
  el('overlay').innerHTML = `<section class="panel" aria-label="遊戲結算"><div class="route-tag">${won ? '今天的上學任務完成！' : '再試一次，你可以的！'}</div><h2>${won ? '到校啦！' : '拍拍書包，再出發'}</h2><h2 class="rating">${won ? '★'.repeat(run.rating) + '☆'.repeat(3 - run.rating) : '♡'}</h2><p>收集 ${run.collected} / ${run.stars.length} 顆星星 · 最佳連擊 ${run.bestCombo}<br>碰撞 ${run.hits} 次${run.practice ? ' · 練習模式不儲存成績' : ''}</p><button class="primary" id="again">${run.practice ? '挑戰正式路線' : '再跑一次'}</button><button class="secondary" id="retry-practice">輕鬆練習 · 不扣愛心</button></section>`;
  el('again').onclick = () => start(false);
  el('retry-practice').onclick = () => start(true);
  tone(won ? 880 : 220);
}
function jump() { if (mode === 'play') { run.jump(); tone(580); } }
el('pause').onclick = () => mode === 'pause' ? countdown() : pause();
el('sound').onclick = () => {
  muted = !muted; el('sound').textContent = muted ? '♪' : '♫';
  el('sound').setAttribute('aria-pressed', String(muted));
  el('sound').setAttribute('aria-label', muted ? '開啟音效' : '關閉音效');
};
if (document.fullscreenEnabled) {
  el('fullscreen').hidden = false;
  el('fullscreen').onclick = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await frame.requestFullscreen(); }
    catch { /* Full viewport layout still works if the browser declines native fullscreen. */ }
  };
}
window.addEventListener('keydown', event => {
  if (['ArrowUp', 'ArrowDown', ' '].includes(event.key)) {
    if ((event.target as HTMLElement)?.tagName === 'BUTTON' && event.key === ' ' && mode !== 'play') return;
    event.preventDefault();
  }
  if (event.repeat) return;
  if (event.key === 'ArrowUp' || event.key === ' ') jump();
  if (event.key === 'ArrowDown' && mode === 'play') duckKeys.add('keyboard');
  if (event.key === 'Escape') mode === 'pause' ? countdown() : pause();
});
window.addEventListener('keyup', event => { if (event.key === 'ArrowDown') duckKeys.delete('keyboard'); });
el('jump').addEventListener('pointerdown', event => { event.preventDefault(); jump(); });
el('duck').addEventListener('pointerdown', event => {
  event.preventDefault();
  if (mode === 'play') { duckKeys.add(String(event.pointerId)); el('duck').setPointerCapture(event.pointerId); }
});
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  el('duck').addEventListener(name, event => {
    duckKeys.delete(String((event as PointerEvent).pointerId));
    if (name === 'pointercancel') pause();
  });
}
portrait.addEventListener('change', () => { clearInput(); if (isPortrait()) pause(); });
window.addEventListener('blur', pause);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

/** Trim only transparent frame padding at load time; source images remain untouched. */
function addFrame(scene: Phaser.Scene, key: string, name: string, x: number, y: number, width: number, height: number) {
  const texture = scene.textures.get(key);
  const source = texture.getSourceImage() as HTMLImageElement;
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.drawImage(source, x, y, width, height, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  let left = width, top = height, right = 0, bottom = 0;
  for (let py = 0; py < height; py++) for (let px = 0; px < width; px++) {
    if (pixels[(py * width + px) * 4 + 3] > 100) {
      left = Math.min(left, px); right = Math.max(right, px);
      top = Math.min(top, py); bottom = Math.max(bottom, py);
    }
  }
  if (left > right) { texture.add(name, 0, x, y, width, height); return; }
  texture.add(name, 0, x + left, y + top, right - left + 1, bottom - top + 1);
}

/** Chroma-key source art is composited into runtime textures, keeping source files intact. */
function keyedTexture(scene: Phaser.Scene, sourceKey: string, targetKey: string) {
  const source = scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
  const texture = scene.textures.createCanvas(targetKey, source.width, source.height)!;
  const ctx = texture.getContext(); ctx.drawImage(source, 0, 0);
  const data = ctx.getImageData(0, 0, source.width, source.height);
  for (let i = 0; i < data.data.length; i += 4) {
    const r = data.data[i], g = data.data[i + 1], b = data.data[i + 2];
    if (r > 130 && b > 120 && g < Math.min(r, b) * .55) data.data[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0); texture.refresh();
  addFrame(scene, targetKey, 'trim', 0, 0, source.width, source.height);
}

/** Remove the neutral checkerboard from generated sprite sheets without touching bright whites or dark outlines. */
function checkerKeyedTexture(scene: Phaser.Scene, sourceKey: string, targetKey: string) {
  const source = scene.textures.get(sourceKey).getSourceImage() as HTMLImageElement;
  const texture = scene.textures.createCanvas(targetKey, source.width, source.height)!;
  const ctx = texture.getContext(); ctx.drawImage(source, 0, 0);
  const data = ctx.getImageData(0, 0, source.width, source.height);
  for (let i = 0; i < data.data.length; i += 4) {
    const r = data.data[i], g = data.data[i + 1], b = data.data[i + 2];
    const spread = Math.max(r, g, b) - Math.min(r, g, b), light = (r + g + b) / 3;
    if (spread < 13 && light > 105 && light < 225) data.data[i + 3] = 0;
  }
  ctx.putImageData(data, 0, 0); texture.refresh();
}

class SchoolScene extends Phaser.Scene {
  fronts: Phaser.GameObjects.Image[] = [];
  far: Phaser.GameObjects.Image[] = [];
  tails: Phaser.GameObjects.Image[] = [];
  distantSchool!: Phaser.GameObjects.Image;
  grounds: Phaser.GameObjects.Image[] = [];
  school!: Phaser.GameObjects.Image;
  girl!: Phaser.GameObjects.Image;
  obstacles: Phaser.GameObjects.Image[] = [];
  stars!: Phaser.GameObjects.Graphics;
  extensions!: Phaser.GameObjects.Graphics;
  frontKeys = ['front', 'front-residential', 'front-shops'];
  view = worldLayout(640, 360);
  failed = false;
  inspectMode = '';

  preload() {
    for (const key of ['street', 'park', 'fuji-far-v1', 'run', 'poses', 'props', 'obstacles-v2', 'slide-key', 'front-key', 'front-residential-v2', 'front-shops-v2', 'school-key']) this.load.image(key, `assets/${key}.png`);
    this.load.on('loaderror', () => { this.failed = true; });
  }

  create() {
    if (this.failed) {
      el('overlay').innerHTML = '<section class="panel"><h2>圖片還沒準備好</h2><p>請重新整理，再試一次。</p></section>';
      return;
    }
    for (let i = 0; i < 8; i++) addFrame(this, 'run', `r${i}`, (i % 4) * 362, Math.floor(i / 4) * 543, 362, 543);
    addFrame(this, 'poses', 'jump', 382, 402, 178, 276);
    addFrame(this, 'poses', 'arrive', 744, 720, 238, 338);
    addFrame(this, 'props', 'pot', 960, 315, 148, 123);
    addFrame(this, 'props', 'cone', 972, 477, 122, 115);
    addFrame(this, 'props', 'branch', 480, 686, 150, 153);
    keyedTexture(this, 'slide-key', 'slide');
    keyedTexture(this, 'front-key', 'front');
    keyedTexture(this, 'front-residential-v2', 'front-residential');
    keyedTexture(this, 'front-shops-v2', 'front-shops');
    keyedTexture(this, 'school-key', 'school-front');
    checkerKeyedTexture(this, 'obstacles-v2', 'obstacles');
    const obstacleFrames: [string, number, number][] = [
      ['pot', 0, 0], ['cone', 512, 0], ['puddle', 1024, 0],
      ['box', 0, 512], ['ball', 512, 512], ['branch', 1024, 512]
    ];
    for (const [name, x, y] of obstacleFrames) addFrame(this, 'obstacles', name, x, y, 512, 512);
    this.textures.get('fuji-far-v1').add('far', 0, 0, 0, 1672, 944);
    this.textures.get('street').add('ground', 0, 0, 684, 1672, 257);
    this.extensions = this.add.graphics().setDepth(-20);
    for (let i = 0; i < 8; i++) {
      this.far.push(this.add.image(0, 246, 'fuji-far-v1', 'far').setOrigin(0, 1).setDisplaySize(900, 310).setDepth(-15));
      const key = this.frontKeys[i % this.frontKeys.length];
      const fg = this.add.image(0, FOREGROUND_BASE, key, 'trim').setOrigin(0, 1).setDepth(-5);
      fg.setScale(FRONT_WIDTH / fg.frame.width); this.fronts.push(fg);
      this.grounds.push(this.add.image(0, FOREGROUND_BASE, 'street', 'ground').setOrigin(0).setDisplaySize(640, 98.37).setDepth(-3));
    }
    this.school = this.add.image(0, FOREGROUND_BASE, 'school-front', 'trim').setOrigin(0, 1).setDepth(-4);
    this.school.setScale(SCHOOL_WIDTH / this.school.frame.width);
    for (let i = 0; i < 5; i++) {
      const key = this.frontKeys[(i + 1) % this.frontKeys.length];
      const tail = this.add.image(0, FOREGROUND_BASE, key, 'trim').setOrigin(0, 1).setDepth(-5);
      tail.setScale(FRONT_WIDTH / tail.frame.width); this.tails.push(tail);
    }
    this.distantSchool = this.add.image(0, 200, 'school-front', 'trim').setOrigin(.5, 1).setScale(.13).setDepth(-14);
    this.obstacles = run.obstacles.map(o => this.add.image(0, GROUND, 'obstacles', o.kind).setOrigin(.5, 1));
    this.stars = this.add.graphics();
    this.girl = this.add.image(PLAYER_X, GROUND, 'run', 'r0').setOrigin(.5, 1).setDepth(2);
    this.layout();
    this.scale.on('resize', () => { clearInput(); this.layout(); });
    el('start').removeAttribute('disabled'); el('start').textContent = '出發上學！';
    el('start').onclick = () => start();
    el('practice').removeAttribute('disabled'); el('practice').onclick = () => start(true);
    // Read-only visual inspection routes exist only in the local development build.
    if ((import.meta as ImportMeta & { env: { DEV: boolean } }).env.DEV) {
      const inspect = new URLSearchParams(location.search).get('inspect');
      if (inspect && ['run', 'slide', 'school', 'rhythm'].includes(inspect)) {
        this.inspectMode = inspect;
        setMode('pause'); el('overlay').hidden = true;
        run.duck = inspect === 'slide';
        run.elapsed = inspect === 'school' ? 65 : inspect === 'rhythm' ? 17.5 : 11.5;
      }
    }
  }

  layout() {
    this.view = worldLayout(this.scale.width, this.scale.height);
    const { zoom, worldWidth, worldHeight, top } = this.view;
    this.cameras.main.setZoom(zoom).centerOn(worldWidth / 2, top + worldHeight / 2);
  }

  drawEnvironment() {
    const { worldWidth, worldHeight, top } = this.view;
    const distance = cameraDistance(run.elapsed), g = this.extensions;
    g.clear(); g.fillStyle(0x86c4ef); g.fillRect(0, top - 5, worldWidth, worldHeight + 10);
    g.fillStyle(0x777983); g.fillRect(0, FOREGROUND_BASE, worldWidth, Math.max(100, top + worldHeight - FOREGROUND_BASE));
    const farDistance = distance * .18;
    const farFirst = Math.floor(farDistance / 900);
    const first = Math.floor(distance / FRONT_WIDTH);
    const groundFirst = Math.floor(distance / 640);
    for (let i = 0; i < this.fronts.length; i++) {
      const farIndex = farFirst + i;
      this.far[i].setX(farIndex * 900 - farDistance).setFlipX(farIndex % 2 !== 0);
      const worldIndex = first + i;
      const worldX = worldIndex * FRONT_WIDTH;
      const available = Math.min(FRONT_WIDTH, SCHOOL_START - worldX);
      const fg = this.fronts[i];
      const frontKey = this.frontKeys[foregroundVariant(worldIndex, this.frontKeys.length)];
      if (fg.texture.key !== frontKey) fg.setTexture(frontKey, 'trim').setScale(FRONT_WIDTH / fg.frame.width);
      fg.setX(screenX(worldX, run.elapsed)).setVisible(available > 0);
      fg.setCrop(0, 0, Math.max(0, available / fg.scaleX), fg.frame.height);
      // Road and every obstacle share exactly the same camera transform.
      const groundIndex = groundFirst + i;
      this.grounds[i].setX(screenX(groundIndex * 640, run.elapsed)).setFlipX(groundIndex % 2 !== 0);
    }
    this.tails.forEach((tile, i) => tile.setX(screenX(SCHOOL_START + SCHOOL_WIDTH + i * FRONT_WIDTH, run.elapsed)));
    this.distantSchool.setVisible(run.elapsed >= 53 && run.elapsed < 63)
      .setX(PLAYER_X + (DURATION - run.elapsed) * SPEED * .18);
    const sx = screenX(SCHOOL_START, run.elapsed);
    this.school.setX(sx).setVisible(sx < worldWidth && sx + SCHOOL_WIDTH > 0);
    // Campus paving behind the open doorway, attached to the same world location.
    g.fillStyle(0xd5c6a7); g.fillRect(sx + SCHOOL_WIDTH * .42, FOREGROUND_BASE - 38, SCHOOL_WIDTH * .16, 39);
  }

  update(_time: number, delta: number) {
    if (this.failed || !this.girl) return;
    if (isPortrait() && (mode === 'play' || mode === 'countdown')) pause();
    const dt = Math.min(delta / 1000, .05);
    if (mode === 'countdown') {
      count -= dt; const text = String(Math.max(1, Math.ceil(count)));
      const counter = el('overlay').firstElementChild!;
      if (counter.textContent !== text) counter.textContent = text;
      if (count <= 0) { setMode('play'); el('overlay').hidden = true; }
    }
    if (mode === 'play') {
      run.duck = duckKeys.size > 0; accumulator += dt;
      while (accumulator >= 1 / 120 && run.state === 'running') {
        const old = run.collected, hits = run.hits;
        run.step(1 / 120);
        if (run.collected > old) tone(1000);
        if (run.hits > hits) tone(150);
        accumulator -= 1 / 120;
      }
      if (run.state !== 'running') finish();
    }
    this.drawEnvironment();
    const crouch = run.duck && run.y === 0;
    let key = 'run', pose = `r${Math.floor(run.elapsed * 12) % 8}`, scale = .132;
    // Fixed source calibration uses head/body scale, never per-pose bounding height.
    if (crouch) { key = 'slide'; pose = 'trim'; scale = .063; }
    else if (run.y > 0) { key = 'poses'; pose = 'jump'; scale = .235; }
    else if (run.state === 'won') { key = 'poses'; pose = 'arrive'; scale = .205; }
    this.girl.setTexture(key, pose).setScale(scale).setPosition(PLAYER_X, GROUND - run.y);
    this.girl.setAlpha(run.invincible > 0 && Math.floor(run.elapsed * 12) % 2 === 0 ? .35 : 1);
    run.obstacles.forEach((obstacle, i) => {
      const sprite = this.obstacles[i], x = screenX(obstacleWorldX(obstacle.at), run.elapsed);
      const isBranch = obstacle.kind === 'branch';
      sprite.setPosition(x, isBranch ? GROUND - 44 : GROUND);
      const size = obstacle.kind === 'puddle' ? [58, 22] : obstacle.kind === 'ball' ? [34, 34] : obstacle.kind === 'box' ? [39, 37] : isBranch ? [82, 60] : obstacle.kind === 'pot' ? [42, 35] : [35, 38];
      sprite.setDisplaySize(size[0], size[1]).setRotation(obstacle.kind === 'ball' ? run.elapsed * 7 : 0);
      sprite.setVisible(x > -60 && x < this.view.worldWidth + 60).setAlpha(obstacle.hit ? .45 : 1);
    });
    this.stars.clear(); this.stars.fillStyle(0xffd36f); this.stars.lineStyle(1, 0x946f36);
    for (const star of run.stars) {
      const x = PLAYER_X + (star.at - run.elapsed) * SPEED;
      if (star.collected || x < -20 || x > this.view.worldWidth + 20) continue;
      const points = [];
      for (let k = 0; k < 10; k++) {
        const angle = k * Math.PI / 5 - Math.PI / 2, radius = k % 2 ? 4 : 9;
        points.push(new Phaser.Geom.Point(x + Math.cos(angle) * radius, GROUND - star.height + Math.sin(angle) * radius));
      }
      this.stars.fillPoints(points, true); this.stars.strokePoints(points, true);
    }
    const sequence = activeSequence(run.elapsed);
    const upcoming = run.obstacles.find(o => o.at > run.elapsed && o.at - run.elapsed < 2.8);
    const message = mode === 'play' || this.inspectMode === 'rhythm' ? (run.elapsed > 61 ? '到學校了，再往前一點！' : sequence ? `${sequence.label}　${sequence.steps}` : upcoming ? (upcoming.kind === 'branch' ? '低樹枝來了！↓ 按住蹲下' : upcoming.kind === 'puddle' ? '積水！↑ 跳過去' : upcoming.kind === 'ball' ? '滾球！↑ 跳起來' : upcoming.kind === 'box' ? '紙箱！↑ 跳過去' : '↑ 跳起來！') : '') : '';
    el('hint').textContent = message; el('hint').hidden = !message;
    el('hearts').textContent = run.practice ? '練習 ♥' : '♥ '.repeat(run.health) + '♡ '.repeat(3 - run.health);
    el('stars').textContent = '★ ' + run.collected;
    el('combo').textContent = `連擊 ${run.combo}`;
    el('combo').classList.toggle('hot', run.combo >= 3);
    el('distance').textContent = `到校 ${Math.floor(run.elapsed / DURATION * 100)}%`;
    el('fill').style.width = run.elapsed / DURATION * 100 + '%';
    el('section').textContent = run.elapsed < 8 ? '家門口' : run.elapsed < 22 ? '住宅巷弄' : run.elapsed < 36 ? '小公園' : run.elapsed < 53 ? '早餐店' : '學校就在前面';
    el('duck').classList.toggle('pressed', run.duck);
  }
}
const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', pixelArt: false, antialias: true, roundPixels: true,
  backgroundColor: '#86c4ef', scene: SchoolScene,
  scale: { mode: Phaser.Scale.NONE, width: 640, height: 360 }, audio: { noAudio: true },
});
// Render to device pixels instead of enlarging a 640px raster onto a retina display.
const resize = new ResizeObserver(() => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  game.scale.resize(Math.round(frame.clientWidth * dpr), Math.round(frame.clientHeight * dpr));
});
resize.observe(frame);
