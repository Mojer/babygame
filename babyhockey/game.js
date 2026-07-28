"use strict";

/* =========================================================
 * 桌上冰球大亂鬥 Air Hockey Mayhem
 * 同一台平板／手機、上下對分的雙人桌上冰球。
 * ‧ 兩人各用一根手指直接拖曳自己半場的擋板（絕對定位）
 * ‧ 中央持續丟出冰球，每隔一段時間來一次爆量波
 * ‧ 限時 90 秒，把冰球打進對面球門得分，分高者勝
 *
 * 物理座標 = CSS 像素座標（canvas 填滿安全區內框），
 * 因此手指位置不需要任何換算，1:1 對應擋板位置。
 * ========================================================= */

// ---------- 規則常數 ----------
const MATCH_TIME = 90;        // 秒，一局長度
const MAX_PUCKS = 30;         // 場上冰球上限
const SPAWN_FIRST = 1.0;      // 開局第一顆的延遲
const SPAWN_START = 2.6;      // 起始生成間隔（秒）
const SPAWN_END = 1.1;        // 終盤生成間隔（秒）
const BURST_EVERY = 18;       // 每 N 秒一次爆量波
const BURST_COUNT = 6;        // 爆量波一次丟幾顆
const GOAL_RATIO = 0.44;      // 球門寬 = 場地寬 * 此比例

// ---------- 物理常數 ----------
const FIXED_DT = 1 / 120;     // 固定時間步（ProMotion 120Hz 也一致）
const MAX_STEPS = 5;          // 單帧最多步數（掉帧時不追爆）
const PUCK_REST = 0.94;       // 冰球互撞彈性
const WALL_REST = 0.90;       // 撞牆彈性
const PAD_REST = 0.92;        // 擋板打擊彈性
const PAD_KICK_MIN = 210;     // 擋板打擊的最低出球速度（避免黏在板上）
const DAMPING = 0.14;         // 冰面阻力（每秒衰減比例，氣墊桌摩擦極小）
const MAX_SPEED = 1900;       // 速度上限（防穿牆）
const PAD_MAX_SPEED = 3000;   // 擋板追手指的最大速度（手指瞬移不會把球推穿牆）
const DRIFT_SPEED = 90;       // 低於此速度時，氣流會輕輕推動冰球（避免整桌變靜物）
const SPAWN_SPEED = [240, 420];

// ---------- 角色（冰球圖案） ----------
const SKINS = [
  { id: "orange",  base: "#ff5a1f", img: "assets/ch_01_s.png" },
  { id: "pinky",   base: "#d6199a", img: "assets/ch_02_s.png" },
  { id: "smiley",  base: "#3d9bff", img: "assets/ch_03_s.png" },
  { id: "pudding", base: "#ffc93d", img: "assets/ch_04_s.png" },
  { id: "froggy",  base: "#4caf50", img: "assets/ch_05_s.png" },
  { id: "shadow",  base: "#3a3a3a", img: "assets/ch_06_s.png" },
];
for (const s of SKINS) {
  s.image = new Image();
  s.image.onload = () => { s.sprite = null; };  // 載入後重建 sprite
  s.image.src = s.img;
}

const P_COLOR = ["#2f6fc4", "#e04a68"];         // P1 藍（下）、P2 紅（上）
const P_COLOR_SOFT = ["#9dc2f2", "#f7aebc"];
const P_NAME = ["玩家 1", "玩家 2"];

// ---------- 音效（WebAudio 合成，無外部資源） ----------
const SFX = (() => {
  let ac = null;
  function ctx() {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    return ac;
  }
  function tone(freq, dur, type = "sine", vol = 0.2, slide = 0) {
    try {
      const a = ctx(), t = a.currentTime;
      const o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(a.destination);
      o.start(t); o.stop(t + dur);
    } catch (e) { /* 音效失敗不影響遊戲 */ }
  }
  let lastHit = 0, lastPad = 0;
  return {
    unlock: () => ctx(),
    count: () => tone(440, .15, "square", .18),
    go: () => tone(880, .4, "square", .2),
    spawn: () => tone(760, .09, "sine", .10, -260),
    goal() {
      [660, 880, 1180].forEach((f, i) => setTimeout(() => tone(f, .22, "triangle", .24), i * 90));
    },
    hit() {                                     // 球對球（節流）
      const now = performance.now();
      if (now - lastHit > 55) { lastHit = now; tone(220 + Math.random() * 140, .045, "triangle", .06); }
    },
    pad() {                                     // 擋板打擊（節流）
      const now = performance.now();
      if (now - lastPad > 45) { lastPad = now; tone(150 + Math.random() * 60, .07, "square", .13, 90); }
    },
    whistle() {
      tone(1050, .5, "triangle", .22, -280);
      setTimeout(() => tone(880, .6, "triangle", .2, -300), 160);
    },
    win() {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, .3, "triangle", .25), i * 130));
    },
  };
})();

// ---------- 背景音樂 ----------
const BGM = (() => {
  const audio = new Audio("Chili Gola Game Pop Mix_1.mp3");
  audio.loop = true;
  audio.preload = "auto";
  const VOL = 0.4;
  let fadeTimer = null;
  return {
    start() {
      clearInterval(fadeTimer);
      audio.volume = VOL;
      audio.currentTime = 0;
      audio.play().catch(() => { /* 自動播放被擋不影響遊戲 */ });
    },
    fadeOut() {
      clearInterval(fadeTimer);
      fadeTimer = setInterval(() => {
        if (audio.volume > 0.05) audio.volume = Math.max(0, audio.volume - 0.05);
        else { clearInterval(fadeTimer); audio.pause(); }
      }, 80);
    },
  };
})();

// ---------- 狀態 ----------
const state = {
  phase: "start",         // start | countdown | play | finish
  pucks: [],
  pads: [],               // [P1(下), P2(上)]
  particles: [],
  goalFlash: [0, 0],      // 球門得分閃光（index = 被進球的球門：0 = 下方 P1 門）
  score: [0, 0],
  time: 0,                // 已進行秒數
  spawnTimer: SPAWN_FIRST,
  burstIndex: 1,
  skinTurn: 0,
};

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const startScreen = $("start-screen"), gameScreen = $("game-screen"), resultScreen = $("result-screen");
const canvas = $("game"), ctx = canvas.getContext("2d");
const fieldWrap = $("field-wrap");

// ---------- 場地佈局 ----------
// F: 冰面矩形（含牆）。上下各留一條 band 畫球門網與計分板。
let dpr = 1, cssW = 0, cssH = 0;
let F = { x0: 0, y0: 0, x1: 0, y1: 0, w: 0, h: 0, cx: 0, cy: 0 };
let PUCK_R = 18, PAD_R = 34, GOAL_HALF = 90, BAND = 44, CENTER_R = 80;
let wobbleCache = null;

function layout() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cssW = fieldWrap.clientWidth;
  cssH = fieldWrap.clientHeight;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);

  BAND = Math.round(Math.min(56, Math.max(30, cssH * 0.052)));
  const pad = 6;
  F.x0 = pad; F.x1 = cssW - pad;
  F.y0 = BAND; F.y1 = cssH - BAND;
  F.w = F.x1 - F.x0; F.h = F.y1 - F.y0;
  F.cx = (F.x0 + F.x1) / 2; F.cy = (F.y0 + F.y1) / 2;

  // 尺寸依場地大小決定：平板大、手機自動縮小，但保證手指抓得到。
  // 同時用場地高度夾一次，這樣手機轉成橫向時擋板才不會塞不進自己的半場
  PUCK_R = Math.round(Math.min(26, Math.max(12, Math.min(F.w * 0.042, F.h * 0.05))));
  PAD_R = Math.round(PUCK_R * 1.85);
  // 球門寬同樣夾一次，避免橫向時球門寬到整條底線都是洞
  GOAL_HALF = Math.round(Math.min(F.w * GOAL_RATIO / 2, F.h * 0.25));
  CENTER_R = Math.min(F.w * 0.24, F.h * 0.13);   // 中圈半徑（開球區、氣流範圍）

  wobbleCache = null;
  buildPosts();
  buildSprites();
  for (const p of state.pads) clampPad(p, true);
}
window.addEventListener("resize", layout);
window.addEventListener("orientationchange", () => setTimeout(layout, 200));

// 球門開口的 x 範圍
const inGoalX = (x) => Math.abs(x - F.cx) < GOAL_HALF;
// 門柱（四根，讓擦邊球有真實反彈）；在 layout 時算好，避免每帧配置物件
const POST_R = 5;
let POSTS = [];
function buildPosts() {
  POSTS = [
    { x: F.cx - GOAL_HALF, y: F.y0 }, { x: F.cx + GOAL_HALF, y: F.y0 },
    { x: F.cx - GOAL_HALF, y: F.y1 }, { x: F.cx + GOAL_HALF, y: F.y1 },
  ];
}

// ---------- Sprite 預繪（避免每帧做漸層／陰影，手機才跑得動） ----------
function buildSprites() {
  for (const s of SKINS) s.sprite = null;
  padSprites = [null, null];
}
let padSprites = [null, null];

function puckSprite(skin) {
  if (skin.sprite && skin.spriteR === PUCK_R && skin.spriteDpr === dpr) return skin.sprite;
  const r = PUCK_R, size = Math.ceil(r * 2 + 4);
  const cv = document.createElement("canvas");
  cv.width = cv.height = Math.round(size * dpr);
  const c = cv.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.translate(size / 2, size / 2);
  // 白底（角色圖去背，補回紙張感）
  const base = c.createRadialGradient(-r * .35, -r * .35, r * .1, 0, 0, r);
  base.addColorStop(0, "#ffffff"); base.addColorStop(.75, "#fdfdfa"); base.addColorStop(1, "#e3e7ee");
  c.fillStyle = base;
  c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  if (skin.image.complete && skin.image.naturalWidth) {
    c.save();
    c.beginPath(); c.arc(0, 0, r - 1, 0, 7); c.clip();
    const s2 = r * 2 * 0.98;
    c.drawImage(skin.image, -s2 / 2, -s2 / 2, s2, s2);
    c.restore();
  }
  // 光澤 + 墨線輪廓
  const hl = c.createRadialGradient(-r * .4, -r * .45, 0, -r * .4, -r * .45, r * .8);
  hl.addColorStop(0, "rgba(255,255,255,.55)"); hl.addColorStop(.45, "rgba(255,255,255,.1)"); hl.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = hl;
  c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  c.lineWidth = Math.max(1.6, r * .1);
  c.strokeStyle = "rgba(60,55,45,.5)";
  c.beginPath(); c.arc(0, 0, r - c.lineWidth / 2, 0, 7); c.stroke();

  skin.sprite = cv; skin.spriteR = PUCK_R; skin.spriteDpr = dpr;
  skin.spriteSize = size;
  return cv;
}

function padSprite(p) {
  const cached = padSprites[p];
  if (cached && cached.r === PAD_R && cached.dpr === dpr) return cached.cv;
  const r = PAD_R, size = Math.ceil(r * 2 + 8);
  const cv = document.createElement("canvas");
  cv.width = cv.height = Math.round(size * dpr);
  const c = cv.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.translate(size / 2, size / 2);
  const col = P_COLOR[p], soft = P_COLOR_SOFT[p];
  // 手繪盤面：微橢圓 + 沒接滿的墨線
  const g = c.createRadialGradient(-r * .3, -r * .35, r * .1, 0, 0, r);
  g.addColorStop(0, "#fffdf7"); g.addColorStop(.55, soft); g.addColorStop(1, col);
  c.fillStyle = g;
  c.beginPath(); c.ellipse(0, 0, r, r * .97, .1, 0, 7); c.fill();
  c.lineWidth = 4;
  c.strokeStyle = "#3f3a30";
  c.beginPath(); c.ellipse(0, 0, r - 2, r * .97 - 2, .1, .3, 6.3); c.stroke();
  // 中央握把
  c.fillStyle = "#fffdf7";
  c.beginPath(); c.ellipse(0, 0, r * .42, r * .4, -.2, 0, 7); c.fill();
  c.lineWidth = 3; c.strokeStyle = col;
  c.beginPath(); c.ellipse(0, 0, r * .42, r * .4, -.2, .5, 6.1); c.stroke();
  c.fillStyle = col;
  c.font = `${Math.round(r * .58)}px "ChenYuluoyan", sans-serif`;
  c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(`P${p + 1}`, 0, r * .04);

  padSprites[p] = { cv, r: PAD_R, dpr, size };
  return cv;
}

// ---------- 建立物件 ----------
function makePad(p) {
  const y = p === 0 ? F.y1 - F.h * 0.18 : F.y0 + F.h * 0.18;
  return { p, x: F.cx, y, tx: F.cx, ty: y, vx: 0, vy: 0, pointerId: null };
}

// 擋板限制在自己半場（不得越過中線、不得出牆）
function clampPad(pad, snap) {
  const minX = F.x0 + PAD_R, maxX = F.x1 - PAD_R;
  const minY = pad.p === 0 ? F.cy + PAD_R * 0.15 : F.y0 + PAD_R;
  const maxY = pad.p === 0 ? F.y1 - PAD_R : F.cy - PAD_R * 0.15;
  pad.tx = Math.min(maxX, Math.max(minX, pad.tx));
  pad.ty = Math.min(maxY, Math.max(minY, pad.ty));
  if (snap) {
    pad.x = Math.min(maxX, Math.max(minX, pad.x));
    pad.y = Math.min(maxY, Math.max(minY, pad.y));
  }
}

function spawnPuck(fromBurst) {
  if (state.pucks.length >= MAX_PUCKS) return;
  const skin = SKINS[state.skinTurn++ % SKINS.length];
  // 在中圈內挑一個「最空」的位置，避免新球直接疊在別的球或擋板上冒出來
  const ring = CENTER_R * 0.85;
  let bx = F.cx, by = F.cy, bestGap = -Infinity, ba = 0;
  for (let k = 0; k < 12; k++) {
    const a = Math.random() * Math.PI * 2;
    const d = (0.15 + Math.random() * 0.85) * ring;
    const x = F.cx + Math.cos(a) * d, y = F.cy + Math.sin(a) * d;
    let gap = Infinity;
    for (const o of state.pucks) gap = Math.min(gap, Math.hypot(x - o.x, y - o.y) - PUCK_R * 2);
    for (const pad of state.pads) gap = Math.min(gap, Math.hypot(x - pad.x, y - pad.y) - (PUCK_R + PAD_R));
    if (gap > bestGap) { bestGap = gap; bx = x; by = y; ba = a; }
    if (gap > PUCK_R * 0.5) break;      // 夠空就不用再試
  }
  const sp = SPAWN_SPEED[0] + Math.random() * (SPAWN_SPEED[1] - SPAWN_SPEED[0]);
  state.pucks.push({
    skin, x: bx, y: by,
    // 往外飛離中圈，且垂直分量較大（比較容易往兩邊球門跑）
    vx: Math.cos(ba) * sp * 0.75, vy: Math.sin(ba) * sp,
    rot: Math.random() * 6.28, spin: (Math.random() - .5) * 3,
    born: 0,
  });
  puff(bx, by, "rgba(150,200,235,.9)", fromBurst ? 5 : 8);
  SFX.spawn();
}

function puff(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, sp = 60 + Math.random() * 210;
    state.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      r: 2 + Math.random() * 4, life: 1, color,
    });
  }
}

// ---------- 物理 ----------
// 一個 step 的順序：
//   1. 擋板追手指 → 2. 冰球積分 → 3. 碰撞衝量（球球、球板）
//   → 4. 位置鬆弛迭代（只推位置，不加能量）→ 5. 門柱與牆／進球收束
// 第 4 步是關鍵：冰球被擋板壓在牆角時，單次解算會讓兩顆球幾乎完全重疊，
// 迭代幾次才會沿牆面擠開。第 5 步放最後，保證帧結束時冰球一定在場內。
const RELAX_ITER = 8;

// 把冰球推到擋板外緣。徑向推出去若會穿牆（擋板正把球壓在牆上），
// 就沿著牆面找解：列出「x 貼牆」「y 貼牆」共四組圓交點，取離原位最近的可行解。
// 這讓被壓在牆邊或牆角的球一次就滑出來，不必靠多次迭代慢慢擠。
function pushOutOfPad(b, pad) {
  const min = PUCK_R + PAD_R;
  const dx = b.x - pad.x, dy = b.y - pad.y;
  const d = Math.hypot(dx, dy);
  if (d >= min) return false;
  let nx, ny;
  if (d < 0.001) { nx = 0; ny = pad.p === 0 ? -1 : 1; }
  else { nx = dx / d; ny = dy / d; }
  const loX = F.x0 + PUCK_R, hiX = F.x1 - PUCK_R;
  const loY = F.y0 + PUCK_R, hiY = F.y1 - PUCK_R;
  // 球門開口不算牆（球本來就該從那裡出去）
  const okY = (y, x) => inGoalX(x) || (y >= loY - 0.5 && y <= hiY + 0.5);
  const px = pad.x + nx * min, py = pad.y + ny * min;
  if (px >= loX - 0.5 && px <= hiX + 0.5 && okY(py, px)) { b.x = px; b.y = py; return true; }

  let bx = px, by = py, bestCost = Infinity;
  const consider = (cx, cy) => {
    if (cx < loX - 0.5 || cx > hiX + 0.5 || !okY(cy, cx)) return;
    const cost = (cx - b.x) * (cx - b.x) + (cy - b.y) * (cy - b.y);
    if (cost < bestCost) { bestCost = cost; bx = cx; by = cy; }
  };
  for (const wx of [loX, hiX]) {                 // x 貼牆，解 y
    const rem = min * min - (wx - pad.x) * (wx - pad.x);
    if (rem < 0) continue;
    const r = Math.sqrt(rem);
    consider(wx, pad.y + r); consider(wx, pad.y - r);
  }
  for (const wy of [loY, hiY]) {                 // y 貼牆，解 x
    const rem = min * min - (wy - pad.y) * (wy - pad.y);
    if (rem < 0) continue;
    const r = Math.sqrt(rem);
    consider(pad.x + r, wy); consider(pad.x - r, wy);
  }
  b.x = bx; b.y = by;   // 全無可行解（極罕見）時退回徑向解，牆面收束交給第 5 步
  return true;
}

function stepPhysics(dt) {
  const pucks = state.pucks;

  // 1) 擋板：以最大速度追向手指目標點（不直接瞬移，才不會把球推穿牆）
  for (const pad of state.pads) {
    clampPad(pad, false);
    const dx = pad.tx - pad.x, dy = pad.ty - pad.y;
    const dist = Math.hypot(dx, dy);
    const step = PAD_MAX_SPEED * dt;
    let nx, ny;
    if (dist <= step || dist < 0.001) { nx = pad.tx; ny = pad.ty; }
    else { nx = pad.x + dx / dist * step; ny = pad.y + dy / dist * step; }
    pad.vx = (nx - pad.x) / dt;
    pad.vy = (ny - pad.y) / dt;
    pad.x = nx; pad.y = ny;
  }

  // 2) 積分（冰面阻力 + 氣流微擾 + 速度上限）
  for (const b of pucks) {
    b.born += dt;
    const damp = 1 - DAMPING * dt;
    b.vx *= damp; b.vy *= damp;
    const sp = Math.hypot(b.vx, b.vy);
    if (sp < DRIFT_SPEED) {
      // 氣墊桌的氣流：慢下來又離中央太遠的球會被吹回場中（否則球會沿牆堆積，
      // 兩邊都打不到）；已經在中圈附近的就只給隨機抖動，避免全部擠成一坨
      const a = Math.random() * 6.28;
      const tcx = F.cx - b.x, tcy = F.cy - b.y;
      const td = Math.hypot(tcx, tcy) || 1;
      const pull = td > CENTER_R * 1.6 ? 0.5 : 0;
      b.vx += (tcx / td * pull + Math.cos(a) * 0.8) * 340 * dt;
      b.vy += (tcy / td * pull + Math.sin(a) * 0.8) * 340 * dt;
    }
    if (sp > MAX_SPEED) { b.vx = b.vx / sp * MAX_SPEED; b.vy = b.vy / sp * MAX_SPEED; }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.rot += b.spin * dt;
  }

  // 3a) 冰球互撞（等質量彈性碰撞）
  for (let i = 0; i < pucks.length; i++) {
    const a = pucks[i];
    for (let j = i + 1; j < pucks.length; j++) {
      const b = pucks[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d2 = dx * dx + dy * dy;
      const min = PUCK_R * 2;
      if (d2 >= min * min || d2 < 0.0001) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d, ny = dy / d;
      const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (vn < 0) {
        const jimp = -(1 + PUCK_REST) * vn / 2;
        a.vx -= jimp * nx; a.vy -= jimp * ny;
        b.vx += jimp * nx; b.vy += jimp * ny;
        if (Math.abs(vn) > 120) SFX.hit();
      }
    }
  }

  // 3b) 擋板打擊（視為無限質量的 kinematic 圓）
  for (const b of pucks) {
    for (const pad of state.pads) {
      const dx = b.x - pad.x, dy = b.y - pad.y;
      let d = Math.hypot(dx, dy);
      const min = PUCK_R + PAD_R;
      if (d >= min) continue;
      if (d < 0.001) d = 0.001;
      const nx = dx / d, ny = dy / d;
      // 相對速度的法向分量：把球「打」出去，並吃到擋板的揮擊速度
      const vn = (b.vx - pad.vx) * nx + (b.vy - pad.vy) * ny;
      if (vn < 0) {
        b.vx -= (1 + PAD_REST) * vn * nx;
        b.vy -= (1 + PAD_REST) * vn * ny;
      }
      // 保底出球速度：避免冰球黏在擋板上被推著走
      const outN = b.vx * nx + b.vy * ny;
      if (outN < PAD_KICK_MIN) {
        b.vx += (PAD_KICK_MIN - outN) * nx;
        b.vy += (PAD_KICK_MIN - outN) * ny;
      }
      b.spin += (pad.vx * ny - pad.vy * nx) * 0.004;
      SFX.pad();
    }
  }

  // 4) 位置鬆弛：擋板推開 → 牆面夾住 → 球球分離，重複數次直到不再重疊。
  //    分離刻意排在最後：牆面夾位置是硬投影，若排在分離之後，
  //    被擠到牆角的兩顆球會被投影到同一個角點而完全重合。
  for (let k = 0; k < RELAX_ITER; k++) {
    let moved = false;
    for (const b of pucks) {
      for (const pad of state.pads) {
        if (pushOutOfPad(b, pad)) moved = true;
      }
      // 牆面只夾位置（反彈與進球判定留給第 5 步）
      if (b.x - PUCK_R < F.x0) { b.x = F.x0 + PUCK_R; moved = true; }
      else if (b.x + PUCK_R > F.x1) { b.x = F.x1 - PUCK_R; moved = true; }
      if (!inGoalX(b.x)) {
        if (b.y - PUCK_R < F.y0) { b.y = F.y0 + PUCK_R; moved = true; }
        else if (b.y + PUCK_R > F.y1) { b.y = F.y1 - PUCK_R; moved = true; }
      }
    }
    for (let i = 0; i < pucks.length; i++) {
      const a = pucks[i];
      for (let j = i + 1; j < pucks.length; j++) {
        const b = pucks[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        const min = PUCK_R * 2;
        if (d2 >= min * min) continue;
        const d = Math.sqrt(d2);
        let nx, ny;
        // 幾乎重合時用斜向推開（非軸向，才不會整段位移都被牆面夾回去）
        if (d < 0.001) { nx = 0.6; ny = 0.8; }
        else { nx = dx / d; ny = dy / d; }
        const push = (min - d) / 2;
        a.x -= nx * push; a.y -= ny * push;
        b.x += nx * push; b.y += ny * push;
        moved = true;
      }
    }
    if (!moved) break;
  }

  // 5) 收束：門柱 → 牆／球門判定（放在最後，保證帧結束時所有冰球都在場內）
  for (let i = pucks.length - 1; i >= 0; i--) {
    const b = pucks[i];

    // 門柱（擦邊球的真實反彈）
    for (const po of POSTS) {
      const dx = b.x - po.x, dy = b.y - po.y;
      const d = Math.hypot(dx, dy), min = PUCK_R + POST_R;
      if (d < min && d > 0.001) {
        const nx = dx / d, ny = dy / d;
        b.x = po.x + nx * min; b.y = po.y + ny * min;
        const vn = b.vx * nx + b.vy * ny;
        if (vn < 0) { b.vx -= (1 + WALL_REST) * vn * nx; b.vy -= (1 + WALL_REST) * vn * ny; }
        SFX.hit();
      }
    }

    // 左右牆
    if (b.x - PUCK_R < F.x0) { b.x = F.x0 + PUCK_R; b.vx = Math.abs(b.vx) * WALL_REST; SFX.hit(); }
    else if (b.x + PUCK_R > F.x1) { b.x = F.x1 - PUCK_R; b.vx = -Math.abs(b.vx) * WALL_REST; SFX.hit(); }

    // 上下牆／球門：圓心越過門線才算進球
    if (b.y < F.y0) {
      if (inGoalX(b.x)) { scoreGoal(0, i, b); continue; }   // 上方是 P2 的球門 → P1 得分
      b.y = F.y0 + PUCK_R; b.vy = Math.abs(b.vy) * WALL_REST; SFX.hit();
    } else if (b.y > F.y1) {
      if (inGoalX(b.x)) { scoreGoal(1, i, b); continue; }   // 下方是 P1 的球門 → P2 得分
      b.y = F.y1 - PUCK_R; b.vy = -Math.abs(b.vy) * WALL_REST; SFX.hit();
    } else if (!inGoalX(b.x)) {
      // 沒進球門的話，球身也不能穿進牆裡
      if (b.y - PUCK_R < F.y0) { b.y = F.y0 + PUCK_R; b.vy = Math.abs(b.vy) * WALL_REST; }
      else if (b.y + PUCK_R > F.y1) { b.y = F.y1 - PUCK_R; b.vy = -Math.abs(b.vy) * WALL_REST; }
    }

    // 速度上限（下一帧才會位移，因此不會穿牆；此處先夾好讓數值不失控）
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > MAX_SPEED) { b.vx = b.vx / sp * MAX_SPEED; b.vy = b.vy / sp * MAX_SPEED; }
    if (Math.abs(b.spin) > 12) b.spin = Math.sign(b.spin) * 12;
  }
}

function scoreGoal(scorer, index, puck) {
  state.pucks.splice(index, 1);
  state.score[scorer]++;
  state.goalFlash[scorer === 0 ? 1 : 0] = 1;      // 被進球的那一側閃光
  puff(puck.x, Math.max(F.y0, Math.min(F.y1, puck.y)), P_COLOR[scorer], 18);
  SFX.goal();
}

function stepParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= 0.94; p.vy *= 0.94;
    p.life -= dt * 1.7;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
  for (let i = 0; i < 2; i++) state.goalFlash[i] = Math.max(0, state.goalFlash[i] - dt * 1.6);
}

// ---------- 繪製 ----------
// 手繪抖動折線（決定性，不隨帧閃爍）
function wobbleLine(x1, y1, x2, y2, seed, amp = 2.6) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const n = Math.max(2, Math.round(len / 52));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const j = (i === 0 || i === n) ? 0 : Math.sin(i * 12.9898 + seed * 78.233) * amp;
    pts.push([x1 + dx * t + nx * j, y1 + dy * t + ny * j]);
  }
  return pts;
}

function buildWobble() {
  const gl = F.cx - GOAL_HALF, gr = F.cx + GOAL_HALF;
  wobbleCache = {
    // 上牆左右兩段（中間是球門開口）
    top: [wobbleLine(F.x0, F.y0, gl, F.y0, 1), wobbleLine(gr, F.y0, F.x1, F.y0, 2)],
    bot: [wobbleLine(F.x0, F.y1, gl, F.y1, 3), wobbleLine(gr, F.y1, F.x1, F.y1, 4)],
    left: wobbleLine(F.x0, F.y0, F.x0, F.y1, 5),
    right: wobbleLine(F.x1, F.y0, F.x1, F.y1, 6),
    mid: wobbleLine(F.x0, F.cy, F.x1, F.cy, 7, 2),
  };
}

function strokePts(pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

function render() {
  if (!cssW) { layout(); if (!cssW) return; }
  if (!wobbleCache) buildWobble();
  const wb = wobbleCache;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 紙張底 + 作業簿橫線
  ctx.fillStyle = "#fbf6ea";
  ctx.fillRect(0, 0, cssW, cssH);

  // 冰面（淺藍紙）
  ctx.fillStyle = "#eef7fc";
  ctx.fillRect(F.x0, F.y0, F.w, F.h);
  ctx.strokeStyle = "rgba(110,145,200,.13)";
  ctx.lineWidth = 2;
  for (let ly = F.y0 + 34; ly < F.y1; ly += 34) {
    ctx.beginPath(); ctx.moveTo(F.x0 + 6, ly); ctx.lineTo(F.x1 - 6, ly); ctx.stroke();
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 中線（手畫虛線）+ 中圈
  ctx.setLineDash([16, 12]);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = "rgba(120,150,190,.55)";
  strokePts(wb.mid);
  ctx.setLineDash([]);
  const cr = CENTER_R;
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = "rgba(120,150,190,.5)";
  ctx.beginPath(); ctx.ellipse(F.cx, F.cy, cr, cr * 0.94, .08, .35, 6.15); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(F.cx, F.cy, cr * .3, cr * .28, -.2, 0, 7); ctx.stroke();

  // 球門網（畫在 band 區，並在得分時閃光）
  for (const side of [0, 1]) {   // 0 = 下方（P1 球門）, 1 = 上方（P2 球門）
    const y = side === 0 ? F.y1 : F.y0;
    const dir = side === 0 ? 1 : -1;
    const col = P_COLOR[side];
    const flash = state.goalFlash[side];
    ctx.save();
    // 網袋底
    ctx.fillStyle = flash > 0 ? `rgba(255,225,120,${0.25 + flash * 0.5})` : "rgba(255,253,247,.85)";
    ctx.beginPath();
    ctx.moveTo(F.cx - GOAL_HALF, y);
    ctx.lineTo(F.cx - GOAL_HALF * .82, y + dir * (BAND - 8));
    ctx.lineTo(F.cx + GOAL_HALF * .82, y + dir * (BAND - 8));
    ctx.lineTo(F.cx + GOAL_HALF, y);
    ctx.closePath();
    ctx.fill();
    // 網格
    ctx.strokeStyle = col;
    ctx.globalAlpha = .5;
    ctx.lineWidth = 2;
    for (let k = -3; k <= 3; k++) {
      const x = F.cx + (GOAL_HALF / 3.4) * k;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(F.cx + (GOAL_HALF * .82 / 3.4) * k, y + dir * (BAND - 8)); ctx.stroke();
    }
    for (let k = 1; k <= 2; k++) {
      const t = k / 3;
      const hw = GOAL_HALF * (1 - 0.18 * t);
      ctx.beginPath(); ctx.moveTo(F.cx - hw, y + dir * (BAND - 8) * t); ctx.lineTo(F.cx + hw, y + dir * (BAND - 8) * t); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // 網袋外框（手繪墨線）
    ctx.strokeStyle = col;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(F.cx - GOAL_HALF, y);
    ctx.lineTo(F.cx - GOAL_HALF * .82, y + dir * (BAND - 8));
    ctx.lineTo(F.cx + GOAL_HALF * .82, y + dir * (BAND - 8));
    ctx.lineTo(F.cx + GOAL_HALF, y);
    ctx.stroke();
    // 門柱
    ctx.fillStyle = col;
    for (const sx of [-1, 1]) {
      ctx.beginPath(); ctx.arc(F.cx + sx * GOAL_HALF, y, POST_R + 1.5, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  // 場地牆（雙層手繪筆觸）
  const drawWall = (pts) => {
    ctx.lineWidth = 10; ctx.strokeStyle = "#d8862f"; strokePts(pts);
    ctx.lineWidth = 5.5; ctx.strokeStyle = "#ffab4e"; strokePts(pts);
  };
  drawWall(wb.top[0]); drawWall(wb.top[1]);
  drawWall(wb.bot[0]); drawWall(wb.bot[1]);
  drawWall(wb.left); drawWall(wb.right);

  // 粒子
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 擋板
  for (const pad of state.pads) {
    const spr = padSprite(pad.p);
    const size = padSprites[pad.p].size;
    ctx.fillStyle = "rgba(70,100,150,.18)";
    ctx.beginPath(); ctx.ellipse(pad.x + 3, pad.y + 5, PAD_R, PAD_R * .95, 0, 0, 7); ctx.fill();
    ctx.drawImage(spr, pad.x - size / 2, pad.y - size / 2, size, size);
  }

  // 冰球
  for (const b of state.pucks) {
    const spr = puckSprite(b.skin);
    const size = b.skin.spriteSize;
    ctx.fillStyle = "rgba(70,100,150,.22)";
    ctx.beginPath(); ctx.arc(b.x + 2.5, b.y + 4, PUCK_R, 0, 7); ctx.fill();
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rot);
    ctx.drawImage(spr, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  drawScoreboard();
}

// 計分板：各自畫在自己那條 band，P2 的旋轉 180° 讓對面看得正
function drawScoreboard() {
  const secs = Math.ceil(Math.max(0, MATCH_TIME - state.time));

  for (const p of [0, 1]) {
    const band = p === 0 ? F.y1 + BAND / 2 : F.y0 - BAND / 2;
    ctx.save();
    ctx.translate(cssW / 2, band);
    if (p === 1) ctx.rotate(Math.PI);
    const half = cssW / 2;
    const chipX = -half + Math.max(46, GOAL_HALF * .28);
    // 分數（貼紙感卡片）
    const fs = Math.round(Math.min(34, BAND * 0.78));
    ctx.font = `${fs}px "ChenYuluoyan", sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const label = `P${p + 1}`;
    const txt = String(state.score[p]);
    const wBox = Math.max(74, ctx.measureText(txt).width + 58);
    ctx.save();
    ctx.rotate(p === 0 ? -0.02 : -0.02);
    ctx.fillStyle = "#fffdf7";
    ctx.strokeStyle = P_COLOR[p];
    ctx.lineWidth = 2.5;
    roundRect(chipX - wBox / 2, -BAND * .38, wBox, BAND * .76, 8);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = P_COLOR[p];
    ctx.font = `${Math.round(fs * .62)}px "ChenYuluoyan", sans-serif`;
    ctx.fillText(label, chipX - wBox / 2 + 22, 1);
    ctx.font = `${fs}px "ChenYuluoyan", sans-serif`;
    ctx.fillText(txt, chipX + 12, 1);
    ctx.restore();

    // 時間（自己那側看得正）
    const tf = Math.round(Math.min(28, BAND * 0.62));
    ctx.font = `${tf}px "ChenYuluoyan", sans-serif`;
    ctx.fillStyle = secs <= 10 ? "#e04a68" : "#8f836c";
    ctx.fillText(`${secs}″`, half - Math.max(34, GOAL_HALF * .2), 1);
    ctx.restore();
  }
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------- 觸控（多點：靠 pointerId 綁定玩家） ----------
function ownerFromY(y) { return y < F.cy ? 1 : 0; }   // 上半 = P2, 下半 = P1

canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  if (state.phase !== "play" && state.phase !== "countdown") return;
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  const p = ownerFromY(y);
  const pad = state.pads[p];
  if (pad.pointerId !== null) return;              // 該玩家已有手指在控制，其餘忽略（手掌誤觸）
  pad.pointerId = e.pointerId;
  pad.tx = x; pad.ty = y;
  clampPad(pad, false);
});

function onMove(e) {
  const r = canvas.getBoundingClientRect();
  for (const pad of state.pads) {
    if (pad.pointerId === e.pointerId) {
      pad.tx = e.clientX - r.left;
      pad.ty = e.clientY - r.top;
      clampPad(pad, false);
      e.preventDefault();
    }
  }
}
function onUp(e) {
  for (const pad of state.pads) if (pad.pointerId === e.pointerId) pad.pointerId = null;
}
window.addEventListener("pointermove", onMove, { passive: false });
window.addEventListener("pointerup", onUp);
window.addEventListener("pointercancel", onUp);

// 桌機測試用鍵盤：P1 = 方向鍵、P2 = WASD
const keys = new Set();
window.addEventListener("keydown", (e) => { keys.add(e.key.toLowerCase()); });
window.addEventListener("keyup", (e) => { keys.delete(e.key.toLowerCase()); });
function stepKeyboard(dt) {
  const SP = 700 * dt;
  const move = (pad, up, down, lf, rt) => {
    let dx = 0, dy = 0;
    if (keys.has(up)) dy -= 1;
    if (keys.has(down)) dy += 1;
    if (keys.has(lf)) dx -= 1;
    if (keys.has(rt)) dx += 1;
    if (!dx && !dy) return;
    pad.tx += dx * SP; pad.ty += dy * SP;
    clampPad(pad, false);
  };
  move(state.pads[0], "arrowup", "arrowdown", "arrowleft", "arrowright");
  move(state.pads[1], "w", "s", "a", "d");
}

// ---------- 流程 ----------
function startMatch() {
  SFX.unlock();
  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  layout();
  state.pucks = [];
  state.particles = [];
  state.pads = [makePad(0), makePad(1)];
  state.score = [0, 0];
  state.goalFlash = [0, 0];
  state.time = 0;
  state.spawnTimer = SPAWN_FIRST;
  state.burstIndex = 1;
  state.phase = "countdown";

  BGM.start();
  const cd = $("countdown");
  const seq = ["3", "2", "1", "開始！"];
  seq.forEach((s, i) => setTimeout(() => {
    cd.textContent = s;
    cd.classList.remove("hidden");
    cd.style.animation = "none";
    void cd.offsetWidth;
    cd.style.animation = "";
    i < 3 ? SFX.count() : SFX.go();
  }, i * 700));
  setTimeout(() => {
    cd.classList.add("hidden");
    if (state.phase === "countdown") state.phase = "play";
  }, seq.length * 700);
}

function endMatch() {
  state.phase = "finish";
  BGM.fadeOut();
  SFX.whistle();
  const [a, b] = state.score;
  const title = $("result-title");
  title.className = "result-title";
  if (a === b) {
    title.textContent = "平手！";
  } else {
    const w = a > b ? 0 : 1;
    title.textContent = `${P_NAME[w]} 獲勝！`;
    title.classList.add(w === 0 ? "p1-text" : "p2-text");
    setTimeout(() => SFX.win(), 500);
  }
  resultScreen.querySelector(".s1").textContent = a;
  resultScreen.querySelector(".s2").textContent = b;
  const diff = Math.abs(a - b);
  $("result-note").textContent = a === b
    ? `雙方各進 ${a} 球，勢均力敵！`
    : diff === 1 ? "只差一球，超接近的！" : `贏了 ${diff} 球，帥氣！`;
  setTimeout(() => resultScreen.classList.remove("hidden"), 700);
}

// 生成節奏：間隔隨時間縮短，另外每 BURST_EVERY 秒來一次爆量波
function stepSpawner(dt) {
  const t = state.time / MATCH_TIME;
  const interval = SPAWN_START + (SPAWN_END - SPAWN_START) * t;
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnPuck(false);
    state.spawnTimer = interval;
  }
  // 場上快清空時趕快補球，別讓畫面空掉
  if (state.pucks.length <= 3) state.spawnTimer = Math.min(state.spawnTimer, 0.3);
  if (state.time >= BURST_EVERY * state.burstIndex) {
    state.burstIndex++;
    for (let i = 0; i < BURST_COUNT; i++) setTimeout(() => {
      if (state.phase === "play") spawnPuck(true);
    }, i * 90);
  }
}

// ---------- 主迴圈（固定時間步 + 累積器） ----------
let lastT = 0, acc = 0;
function loop(now) {
  let frame = (now - lastT) / 1000;
  lastT = now;
  if (!(frame >= 0) || frame > 0.5) frame = 0.016;   // 切到背景再回來時不要爆衝

  if (state.phase === "play") {
    state.time += frame;
    stepKeyboard(frame);
    stepSpawner(frame);
    acc += frame;
    let steps = 0;
    while (acc >= FIXED_DT && steps < MAX_STEPS) { stepPhysics(FIXED_DT); acc -= FIXED_DT; steps++; }
    if (steps === MAX_STEPS) acc = 0;
    stepParticles(frame);
    if (state.time >= MATCH_TIME) endMatch();
  } else if (state.phase === "countdown") {
    stepKeyboard(frame);
    acc = 0;
    // 倒數時擋板可以先就位，冰球還沒進場
    for (const pad of state.pads) {
      pad.x += (pad.tx - pad.x) * Math.min(1, 12 * frame);
      pad.y += (pad.ty - pad.y) * Math.min(1, 12 * frame);
      pad.vx = pad.vy = 0;
    }
  } else if (state.phase === "finish") {
    stepParticles(frame);
  }

  if (state.phase !== "start") render();
  requestAnimationFrame(loop);
}

// ---------- 事件 ----------
$("start-btn").addEventListener("click", startMatch);
$("rematch-btn").addEventListener("click", startMatch);

// ---------- 啟動 ----------
if (document.fonts && document.fonts.load) document.fonts.load('20px "ChenYuluoyan"');
layout();
requestAnimationFrame((t) => { lastT = t; requestAnimationFrame(loop); });
