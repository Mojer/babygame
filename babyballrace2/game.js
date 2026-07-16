"use strict";

/* =========================================================
 * Ball vs Ball 滾珠大作戰 2（單螢幕全覽版）
 * 直式手機網頁雙人滾珠競速：5 顆球從起點落入地圖，
 * 整張地圖單螢幕全覽，地圖資料驅動（maps/*.js）。
 * ========================================================= */

// ---------- 常數 ----------
const BALL_R = 18;            // 球半徑（全覽版地圖較小，球也縮小）
const GRAVITY = 1750;         // px/s^2
const WALL_REST = 0.42;       // 牆壁彈性
const BALL_REST = 0.82;       // 球對球彈性
const PEG_REST = 0.55;        // 彈釘彈性
const MAX_SPEED = 2400;
const SUBSTEPS = 5;
const BOOST_CHARGES = 3;
const BOOST_POWER = 780;
const RACE_TIMEOUT = 120;     // 秒，保險用

// ---------- 球的造型 ----------
// 每個造型提供 base 色與 draw(ctx, r, rot)（以球心為原點繪製）
const SKINS = [
  // 六位角色：小朋友手繪角色圖（assets/，已去背之 256px 版本）
  { id: "orange",  name: "橘橘", tag: "ORANGE",  base: "#ff5a1f", img: "assets/ch_01_s.png" },
  { id: "pinky",   name: "桃桃", tag: "PINKY",   base: "#d6199a", img: "assets/ch_02_s.png" },
  { id: "smiley",  name: "笑笑", tag: "SMILEY",  base: "#3d9bff", img: "assets/ch_03_s.png" },
  { id: "pudding", name: "布丁", tag: "PUDDING", base: "#ffc93d", img: "assets/ch_04_s.png" },
  { id: "froggy",  name: "蛙蛙", tag: "FROGGY",  base: "#4caf50", img: "assets/ch_05_s.png" },
  { id: "shadow",  name: "小黑", tag: "SHADOW",  base: "#3a3a3a", img: "assets/ch_06_s.png" },
];
// 預載角色圖，載入完成後刷新選角畫面的預覽
for (const s of SKINS) {
  s.image = new Image();
  s.image.onload = () => refreshBallArt();
  s.image.src = s.img;
}
function refreshBallArt() {
  document.querySelectorAll("#ball-list .ball-card").forEach((card, i) =>
    renderBallToCanvas(card.querySelector("canvas"), SKINS[i], 0));
  [0, 1].forEach((p) => {
    if (state.picks[p] != null) {
      const slot = document.getElementById(p === 0 ? "picked-p1" : "picked-p2");
      renderBallToCanvas(slot.querySelector("canvas"), SKINS[state.picks[p]], p + 1);
    }
  });
}

// 通用：畫一顆完整的球（含輪廓、光澤、玩家標記）
function drawBall(ctx, skin, r, rot, owner) {
  // 白色圓底（角色圖背景已去透明，白底補回紙張感）
  const base = ctx.createRadialGradient(-r * .35, -r * .35, r * .1, 0, 0, r);
  base.addColorStop(0, "#ffffff"); base.addColorStop(.75, "#fdfdfa"); base.addColorStop(1, "#e6e6ea");
  ctx.fillStyle = base;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  // 角色圖：裁成圓形、隨滾動旋轉
  if (skin.image && skin.image.complete && skin.image.naturalWidth) {
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, r - 1, 0, 7); ctx.clip();
    ctx.rotate(rot);
    const s = r * 2 * 0.98;
    ctx.drawImage(skin.image, -s / 2, -s / 2, s, s);
    ctx.restore();
  }
  // 光澤（不隨滾動旋轉）
  const hl = ctx.createRadialGradient(-r * .4, -r * .45, 0, -r * .4, -r * .45, r * .75);
  hl.addColorStop(0, "rgba(255,255,255,.55)"); hl.addColorStop(.4, "rgba(255,255,255,.12)"); hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * .09);
  ctx.strokeStyle = owner === 1 ? "#2f7fe0" : owner === 2 ? "#ff4d6e" : "rgba(0,0,0,.35)";
  ctx.beginPath(); ctx.arc(0, 0, r - ctx.lineWidth / 2, 0, 7); ctx.stroke();
}

function renderBallToCanvas(canvas, skin, owner) {
  const ctx = canvas.getContext("2d");
  const s = canvas.width;
  ctx.clearRect(0, 0, s, s);
  ctx.save();
  ctx.translate(s / 2, s / 2);
  drawBall(ctx, skin, s / 2 - 3, -0.5, owner);
  ctx.restore();
}

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
  let lastHit = 0;
  return {
    unlock: () => ctx(),
    pick: () => tone(660, .12, "triangle", .25),
    count: () => tone(440, .15, "square", .18),
    go: () => tone(880, .4, "square", .2),
    boost: () => tone(300, .25, "sawtooth", .22, 500),
    bumper: () => tone(180, .18, "square", .22, 120),
    hit() { // 碰撞聲節流
      const now = performance.now();
      if (now - lastHit > 70) { lastHit = now; tone(200 + Math.random() * 120, .05, "triangle", .07); }
    },
    win() {
      [523, 659, 784, 1047].forEach((f, i) =>
        setTimeout(() => tone(f, .3, "triangle", .25), i * 130));
    },
  };
})();

// ---------- 背景音樂 ----------
// 「開始比賽」按下後播放（該點擊即為瀏覽器自動播放所需的使用者手勢）
const BGM = (() => {
  const audio = new Audio("Chili Gola Game Pop Mix_1.mp3");
  audio.loop = true;
  audio.preload = "auto";
  const VOL = 0.45;
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
    get playing() { return !audio.paused; },
  };
})();

// ---------- 賽道（資料驅動） ----------
// 地圖資料放在 maps/*.js（window.MAPS 註冊表），引擎只負責讀資料。
// 選球畫面可切換地圖；網址帶 ?map=名稱 可指定初始地圖，預設 overview。
function getMapData() {
  const maps = window.MAPS || {};
  return maps[state.mapId] || maps.overview;
}

function buildTrack() {
  const d = getMapData();
  return {
    W: d.width,
    H: d.height,
    segs: d.walls.map((w, i) => {
      const s = { x1: w[0], y1: w[1], x2: w[2], y2: w[3], r: w[4] ?? 7 };
      s.pts = wobblify(s.x1, s.y1, s.x2, s.y2, i); // 手繪抖動線（僅視覺）
      return s;
    }),
    pegs: (d.pegs || []).map((p) => ({ x: p[0], y: p[1], r: p[2] ?? 11 })),
    bumpers: (d.bumpers || []).map((b) => ({ x: b[0], y: b[1], r: b[2] ?? 24, flash: 0 })),
    spinners: (d.spinners || []).map((s) => ({ x: s[0], y: s[1], len: s[2], speed: s[3], angle: Math.random() * 3 })),
    spawnY: d.spawnY,
    spawnX: d.spawnX || null,
    finishY: d.finishY,
    gravity: d.gravity ?? GRAVITY,
    bg: d.background || null,
  };
}

// 手繪風抖動折線：把直線切段並加上固定的垂直抖動（決定性，不隨幀閃爍）
function wobblify(x1, y1, x2, y2, seed) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const n = Math.max(2, Math.round(len / 55));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const j = (i === 0 || i === n) ? 0 : Math.sin(i * 12.9898 + seed * 78.233) * 3.4;
    pts.push([x1 + dx * t + nx * j, y1 + dy * t + ny * j]);
  }
  return pts;
}

// 手繪草稿背景圖（地圖資料的 background 欄位）
let mapBgImg = null;
function loadMapBackground(t) {
  mapBgImg = null;
  if (!t.bg) return;
  const img = new Image();
  img.onload = () => { mapBgImg = img; };
  img.src = t.bg;
}

// ---------- 遊戲狀態 ----------
const state = {
  phase: "select",       // select | countdown | race | finish
  picks: [null, null],   // P1 / P2 選的 skin index
  picking: 0,            // 目前選球的玩家 (0=P1, 1=P2)
  balls: [],
  track: null,
  time: 0,
  finished: [],          // 依完成順序的 ball
  winnerBall: null,      // 第一顆衝線的球（= 排名第一）
  raceEnding: false,     // 是否已觸發賽末流程（防止重複觸發）
  winner: 0,             // 0=未定或平手（中立球奪冠）, 1/2=玩家
  boosts: [BOOST_CHARGES, BOOST_CHARGES],
  particles: [],
  mapId: "overview",     // 目前選擇的地圖（選球畫面可切換）
};
// 網址 ?map=名稱 指定初始地圖
{
  const urlMap = new URLSearchParams(location.search).get("map");
  if (urlMap && window.MAPS && window.MAPS[urlMap]) state.mapId = urlMap;
}

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const selectScreen = $("select-screen"), raceScreen = $("race-screen"), resultScreen = $("result-screen");
const canvas = $("game"), ctx = canvas.getContext("2d");

// ---------- 選球畫面 ----------
function setupSelect() {
  const list = $("ball-list");
  list.innerHTML = "";
  SKINS.forEach((skin, i) => {
    const card = document.createElement("div");
    card.className = "ball-card";
    const cv = document.createElement("canvas");
    cv.width = cv.height = 76;
    renderBallToCanvas(cv, skin, 0);
    const name = document.createElement("div");
    name.className = "name"; name.textContent = skin.name;
    const tag = document.createElement("div");
    tag.className = "tag"; tag.textContent = skin.tag;
    card.append(cv, name, tag);
    card.addEventListener("click", () => pickBall(i, card));
    list.appendChild(card);
  });
  setupMapPicker();
  updatePickUI();
}

// 地圖選擇器：以地圖資料即時繪製縮圖卡片
function renderMapThumb(d, canvas) {
  const c = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const fit = Math.min(W / d.width, H / d.height);
  const ox = (W - d.width * fit) / 2, oy = (H - d.height * fit) / 2;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W, H);
  c.setTransform(fit, 0, 0, fit, ox, oy);
  const bg = c.createLinearGradient(0, 0, 0, d.height);
  bg.addColorStop(0, "#e7f7ff"); bg.addColorStop(1, "#c9e9ff");
  c.fillStyle = bg;
  c.fillRect(0, 0, d.width, d.height);
  // 終點格紋帶
  const sq = 44;
  for (let i = 0; i * sq < d.width; i++) {
    c.fillStyle = i % 2 ? "#fffdf7" : "#4a443a";
    c.fillRect(i * sq, d.finishY - sq / 2, sq, sq);
  }
  // 牆
  c.lineCap = "round";
  c.strokeStyle = "#f5993d"; c.lineWidth = 28;
  for (const w of d.walls) {
    c.beginPath(); c.moveTo(w[0], w[1]); c.lineTo(w[2], w[3]); c.stroke();
  }
  // 彈釘
  c.fillStyle = "#5bbf7e";
  for (const p of d.pegs || []) { c.beginPath(); c.arc(p[0], p[1], 22, 0, 7); c.fill(); }
  // 彈力器
  c.fillStyle = "#ff7d9c";
  for (const bp of d.bumpers || []) { c.beginPath(); c.arc(bp[0], bp[1], 36, 0, 7); c.fill(); }
  // 風車（固定斜角示意）
  c.strokeStyle = "#a97ff2"; c.lineWidth = 26;
  for (const s of d.spinners || []) {
    const hx = s[2] * .42, hy = s[2] * .2;
    c.beginPath(); c.moveTo(s[0] - hx, s[1] - hy); c.lineTo(s[0] + hx, s[1] + hy); c.stroke();
  }
}

function setupMapPicker() {
  const list = $("map-list");
  list.innerHTML = "";
  for (const [id, m] of Object.entries(window.MAPS || {})) {
    const card = document.createElement("button");
    card.className = "map-card" + (id === state.mapId ? " active" : "");
    const cv = document.createElement("canvas");
    cv.width = 176; cv.height = 248;
    renderMapThumb(m, cv);
    const nm = document.createElement("span");
    nm.className = "map-name";
    nm.textContent = m.name;
    card.append(cv, nm);
    card.addEventListener("click", () => {
      state.mapId = id;
      SFX.unlock(); SFX.pick();
      list.querySelectorAll(".map-card").forEach((x) => x.classList.remove("active"));
      card.classList.add("active");
    });
    list.appendChild(card);
  }
}

function pickBall(i, card) {
  if (state.picks.includes(i)) return;
  const p = state.picking;
  if (p > 1) return;
  SFX.unlock(); SFX.pick();
  state.picks[p] = i;
  card.classList.add(p === 0 ? "taken-p1" : "taken-p2", "disabled");
  const slot = $(p === 0 ? "picked-p1" : "picked-p2");
  slot.classList.add("filled");
  renderBallToCanvas(slot.querySelector("canvas"), SKINS[i], p + 1);
  state.picking++;
  updatePickUI();
}

function updatePickUI() {
  const prompt = $("pick-prompt");
  if (state.picking === 0) {
    prompt.textContent = "玩家 1，請選擇你的角色！";
    prompt.className = "pick-prompt p1";
  } else if (state.picking === 1) {
    prompt.textContent = "玩家 2，請選擇你的角色！";
    prompt.className = "pick-prompt p2";
  } else {
    prompt.textContent = "準備完成，開始比賽！";
    prompt.className = "pick-prompt done";
  }
  $("start-btn").disabled = state.picking < 2;
}

// ---------- 開始比賽 ----------
function startRace() {
  BGM.start();
  state.track = buildTrack();
  loadMapBackground(state.track);
  state.balls = [];
  state.finished = [];
  state.winnerBall = null;
  state.winner = 0;
  state.raceEnding = false;
  state.time = 0;
  state.boosts = [BOOST_CHARGES, BOOST_CHARGES];
  state.particles = [];

  // 5 顆球全部進場：玩家球 + 中立球（spawnX 可限制進場區間，例如右上入口）
  const spawnX1 = state.track.spawnX ? state.track.spawnX[0] : 120;
  const spawnX2 = state.track.spawnX ? state.track.spawnX[1] : state.track.W - 120;
  const order = [...SKINS.keys()].sort(() => Math.random() - .5);
  order.forEach((skinIdx, i) => {
    const owner = skinIdx === state.picks[0] ? 1 : skinIdx === state.picks[1] ? 2 : 0;
    state.balls.push({
      skin: SKINS[skinIdx],
      owner,
      x: spawnX1 + i * (spawnX2 - spawnX1) / (SKINS.length - 1) + (Math.random() * 24 - 12),
      y: state.track.spawnY + (Math.random() * 30 - 15),
      vx: 0, vy: 0,
      rot: 0,
      finished: false,
      stuckTime: 0,
      maxY: -1e9,
      lastProgressT: 0,
      trail: [],
    });
  });

  // HUD 球圖示
  for (const p of [1, 2]) {
    renderBallToCanvas($(`hud-p${p}`).querySelector("canvas"), SKINS[state.picks[p - 1]], p);
    $(`hud-p${p}-rank`).textContent = "-";
    updateBoostBtn(p);
  }

  selectScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  raceScreen.classList.remove("hidden");
  resizeCanvas();

  // 倒數
  state.phase = "countdown";
  let n = 3;
  const cd = $("countdown");
  const tick = () => {
    cd.classList.remove("hidden");
    cd.textContent = n > 0 ? n : "GO!";
    cd.style.animation = "none"; void cd.offsetWidth; cd.style.animation = "";
    if (n > 0) { SFX.count(); n--; setTimeout(tick, 900); }
    else {
      SFX.go();
      state.phase = "race";
      setTimeout(() => cd.classList.add("hidden"), 900);
    }
  };
  tick();
}

// ---------- 物理 ----------
function stepPhysics(dt) {
  const t = state.track;
  state.time += dt;
  const h = dt / SUBSTEPS;

  // 更新風車角度
  for (const sp of t.spinners) sp.angle += sp.speed * dt;

  for (let s = 0; s < SUBSTEPS; s++) {
    for (const b of state.balls) {
      b.vy += t.gravity * h;
      const sp2 = b.vx * b.vx + b.vy * b.vy;
      if (sp2 > MAX_SPEED * MAX_SPEED) {
        const k = MAX_SPEED / Math.sqrt(sp2);
        b.vx *= k; b.vy *= k;
      }
      b.x += b.vx * h;
      b.y += b.vy * h;
      b.rot += (b.vx / BALL_R) * h; // 滾動視覺

      collideEnvironment(b, t);
    }
    collideBalls();
  }

  // 卡住偵測：長時間近乎靜止就往中間輕推
  for (const b of state.balls) {
    if (b.finished) continue;
    if (b.vx * b.vx + b.vy * b.vy < 30 * 30) {
      b.stuckTime += dt;
      if (b.stuckTime > 1.0) {
        b.vx += (t.W / 2 - b.x) * 0.5 + (Math.random() * 2 - 1) * 220;
        b.vy -= 240;
        b.stuckTime = 0;
      }
    } else b.stuckTime = 0;

    // 進度救援：太久沒有創新的最深位置（被口袋或風車困住）就強力彈起脫困
    if (b.y > b.maxY) {
      b.maxY = b.y;
      b.lastProgressT = state.time;
    } else if (state.time - b.lastProgressT > 5) {
      b.vy -= 520;
      b.vx += (Math.random() * 2 - 1) * 420;
      b.lastProgressT = state.time;
    }

    // 逃逸保險：球被擠出地圖外時送回起點重新進場
    if (b.x < -BALL_R || b.x > t.W + BALL_R || b.y > t.H + 120) {
      b.x = t.spawnX ? (t.spawnX[0] + t.spawnX[1]) / 2 : t.W / 2;
      b.y = t.spawnY;
      b.vx = 0; b.vy = 0;
      continue;
    }

    // 抵達終點（需在地圖範圍內，牆外墜落不算）
    if (!b.finished && b.y > t.finishY && b.x > 0 && b.x < t.W) {
      b.finished = true;
      state.finished.push(b);
      onBallFinished(b);
    }
  }
}

function collideEnvironment(b, t) {
  // 線段牆（膠囊）
  for (const s of t.segs) {
    resolveCapsule(b, s.x1, s.y1, s.x2, s.y2, s.r, WALL_REST, 0, 0);
  }
  // 彈釘
  for (const p of t.pegs) {
    resolveCircle(b, p.x, p.y, p.r, PEG_REST, false);
  }
  // 彈力器：強力反彈
  for (const bp of t.bumpers) {
    if (resolveCircle(b, bp.x, bp.y, bp.r, 1, true)) {
      bp.flash = 1;
      SFX.bumper();
      spawnBurst(b.x, b.y, "#ffd94d", 8);
    }
  }
  // 風車（旋轉膠囊，帶表面速度）
  for (const sp of t.spinners) {
    const c = Math.cos(sp.angle), sn = Math.sin(sp.angle);
    const hx = c * sp.len / 2, hy = sn * sp.len / 2;
    resolveCapsule(b, sp.x - hx, sp.y - hy, sp.x + hx, sp.y + hy, 9, 0.6, sp, sp.speed);
  }
}

// 球對膠囊（線段+半徑）碰撞；spinner 傳入時加上桿面速度
function resolveCapsule(b, x1, y1, x2, y2, capR, rest, spinner, omega) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let u = ((b.x - x1) * dx + (b.y - y1) * dy) / len2;
  u = Math.max(0, Math.min(1, u));
  const px = x1 + u * dx, py = y1 + u * dy;
  let nx = b.x - px, ny = b.y - py;
  const dist2 = nx * nx + ny * ny;
  const minD = BALL_R + capR;
  if (dist2 >= minD * minD) return false;
  const dist = Math.sqrt(dist2) || 0.001;
  nx /= dist; ny /= dist;
  // 推出
  b.x = px + nx * minD;
  b.y = py + ny * minD;
  // 桿面速度（風車）
  let sx = 0, sy = 0;
  if (spinner) {
    const rx = px - spinner.x, ry = py - spinner.y;
    sx = -omega * ry; sy = omega * rx;
  }
  const rvx = b.vx - sx, rvy = b.vy - sy;
  const vn = rvx * nx + rvy * ny;
  if (vn < 0) {
    const j = -(1 + rest) * vn;
    b.vx += j * nx; b.vy += j * ny;
    if (spinner) { b.vx += sx * 0.55; b.vy += sy * 0.55; }
    if (vn < -160) SFX.hit();
  }
  return true;
}

// 球對固定圓（彈釘 / 彈力器）
function resolveCircle(b, cx, cy, cr, rest, isBumper) {
  let nx = b.x - cx, ny = b.y - cy;
  const dist2 = nx * nx + ny * ny;
  const minD = BALL_R + cr;
  if (dist2 >= minD * minD) return false;
  const dist = Math.sqrt(dist2) || 0.001;
  nx /= dist; ny /= dist;
  b.x = cx + nx * minD;
  b.y = cy + ny * minD;
  const vn = b.vx * nx + b.vy * ny;
  if (vn < 0) {
    const j = -(1 + rest) * vn;
    b.vx += j * nx; b.vy += j * ny;
    if (!isBumper && vn < -160) SFX.hit();
  }
  if (isBumper) {
    // 保證最低彈出速度
    const vn2 = b.vx * nx + b.vy * ny;
    if (vn2 < 850) { b.vx += (850 - vn2) * nx; b.vy += (850 - vn2) * ny; }
  }
  return true;
}

// 球對球碰撞（等質量）
function collideBalls() {
  const bs = state.balls;
  for (let i = 0; i < bs.length; i++) {
    for (let j = i + 1; j < bs.length; j++) {
      const a = bs[i], c = bs[j];
      // 完賽球對未完賽球幽靈化：終點盆地的球堆不能堵住還在比賽的球
      if (a.finished !== c.finished) continue;
      let nx = c.x - a.x, ny = c.y - a.y;
      const dist2 = nx * nx + ny * ny;
      const minD = BALL_R * 2;
      if (dist2 >= minD * minD || dist2 === 0) continue;
      const dist = Math.sqrt(dist2);
      nx /= dist; ny /= dist;
      const overlap = (minD - dist) / 2;
      a.x -= nx * overlap; a.y -= ny * overlap;
      c.x += nx * overlap; c.y += ny * overlap;
      const rvn = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
      if (rvn < 0) {
        const j2 = -(1 + BALL_REST) * rvn / 2;
        a.vx -= j2 * nx; a.vy -= j2 * ny;
        c.vx += j2 * nx; c.vy += j2 * ny;
        if (rvn < -200) SFX.hit();
      }
    }
  }
}

// ---------- 加速 ----------
function useBoost(player) {
  if (state.phase !== "race" || state.boosts[player - 1] <= 0) return;
  const b = state.balls.find((x) => x.owner === player);
  if (!b || b.finished) return;
  state.boosts[player - 1]--;
  // 沿目前移動方向加速（太慢則往下）
  const sp = Math.hypot(b.vx, b.vy);
  if (sp > 60) {
    b.vx += (b.vx / sp) * BOOST_POWER;
    b.vy += (b.vy / sp) * BOOST_POWER;
  } else {
    b.vy += BOOST_POWER;
  }
  SFX.boost();
  spawnBurst(b.x, b.y, b.owner === 1 ? "#2f7fe0" : "#ff4d6e", 14);
  updateBoostBtn(player);
}

function updateBoostBtn(player) {
  const btn = $(`boost-p${player}`);
  const n = state.boosts[player - 1];
  btn.querySelector(".charges").textContent = "●".repeat(n) + "○".repeat(BOOST_CHARGES - n);
  btn.classList.toggle("empty", n === 0);
}

// ---------- 粒子 ----------
function spawnBurst(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, sp = 120 + Math.random() * 320;
    state.particles.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 1, color, r: 2.5 + Math.random() * 3.5,
    });
  }
}

function stepParticles(dt) {
  for (const p of state.particles) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vy += 500 * dt;
    p.life -= dt * 2.2;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
}

// ---------- 完賽處理 ----------
function onBallFinished(b) {
  const rank = state.finished.length;
  if (b.owner) $(`hud-p${b.owner}-rank`).textContent = `#${rank}`;
  // 第一顆衝線的球就是冠軍：玩家球則該玩家獲勝，中立球則平手
  if (!state.winnerBall) {
    state.winnerBall = b;
    state.winner = b.owner;
    SFX.win();
  }
  // 等全部球都抵達終點，比賽才真正結束
  if (state.finished.length === state.balls.length) endRace();
}

// 比賽結束流程：配樂淡出、稍作停留後顯示結算畫面
function endRace() {
  if (state.raceEnding) return;
  state.raceEnding = true;
  BGM.fadeOut();
  setTimeout(showResult, 900);
}

function showResult() {
  state.phase = "finish";
  BGM.fadeOut();
  const title = $("result-title");
  if (state.winner) {
    title.textContent = `玩家 ${state.winner} 獲勝！`;
    title.className = `result-title ${state.winner === 1 ? "p1-text" : "p2-text"}`;
  } else {
    title.textContent = `平手！中立球「${state.winnerBall.skin.name}」奪冠`;
    title.className = "result-title";
  }
  renderBallToCanvas($("result-ball"), state.winnerBall.skin, state.winner);

  // 名次表：已完賽依順序，未完賽依進度排
  const rest = state.balls.filter((b) => !b.finished).sort((a, c) => c.y - a.y);
  const ordered = [...state.finished, ...rest];
  const ol = $("result-ranking");
  ol.innerHTML = "";
  ordered.forEach((b, i) => {
    const li = document.createElement("li");
    const isWinner = b === state.winnerBall;
    if (isWinner) li.classList.add("winner-row");
    const rk = document.createElement("span");
    rk.className = "rk"; rk.textContent = `${i + 1}.`;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 30;
    renderBallToCanvas(cv, b.skin, b.owner);
    const nm = document.createElement("span");
    nm.textContent = b.skin.name + (isWinner ? " 🏆" : "");
    const who = document.createElement("span");
    who.className = "who" + (b.owner === 1 ? " p1-text" : b.owner === 2 ? " p2-text" : "");
    who.textContent = b.owner ? `玩家 ${b.owner}` : "中立";
    li.append(rk, cv, nm, who);
    ol.appendChild(li);
  });
  resultScreen.classList.remove("hidden");
}

// ---------- 繪製 ----------
let dpr = 1, cssW = 0, cssH = 0;
function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cssW = raceScreen.clientWidth;
  cssH = raceScreen.clientHeight;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
}
window.addEventListener("resize", resizeCanvas);

function render() {
  const t = state.track;
  if (!t) return;
  if (!cssW) { resizeCanvas(); if (!cssW) return; }

  // 單螢幕全覽：整張地圖等比縮放置中，不捲動
  // 上方預留 HUD、下方預留加速按鈕的空間，避免 UI 蓋住地圖
  const padTop = 58, padBot = 96;
  const availH = Math.max(100, cssH - padTop - padBot);
  const fit = Math.min(cssW / t.W, availH / t.H);
  const ox = (cssW - t.W * fit) / 2;
  const oy = padTop + (availH - t.H * fit) / 2;

  // 信箱區（地圖外）底色
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#efe5d0";
  ctx.fillRect(0, 0, cssW, cssH);

  ctx.setTransform(dpr * fit, 0, 0, dpr * fit, dpr * ox, dpr * oy);
  const camY = 0, camBot = t.H;

  // 地圖背景
  const bg = ctx.createLinearGradient(0, 0, 0, t.H);
  bg.addColorStop(0, "#fdf9ee"); bg.addColorStop(1, "#f5edd8");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, t.W, t.H);
  // 作業簿橫線
  ctx.strokeStyle = "rgba(110,145,200,.13)";
  ctx.lineWidth = 2.5;
  for (let ly = 90; ly < t.H; ly += 90) {
    ctx.beginPath(); ctx.moveTo(10, ly); ctx.lineTo(t.W - 10, ly); ctx.stroke();
  }

  // 手繪草稿背景圖（若地圖有指定）
  if (mapBgImg) {
    ctx.globalAlpha = 0.9;
    ctx.drawImage(mapBgImg, 0, 0, t.W, t.H);
    ctx.globalAlpha = 1;
  }

  // 背景裝飾點
  ctx.fillStyle = "rgba(120,105,75,.10)";
  for (let gy = 0; gy < t.H + 260; gy += 260) {
    for (let gx = 90; gx < t.W; gx += 180) {
      const jitter = ((gx * 7 + gy * 13) % 97) - 48;
      ctx.beginPath(); ctx.arc(gx + jitter, gy + (jitter % 30), 4, 0, 7); ctx.fill();
    }
  }

  // 終點區
  {
    ctx.fillStyle = "rgba(255,190,70,.18)";
    ctx.fillRect(24, t.finishY, t.W - 48, t.H - t.finishY);
    // 格紋終點線
    const sq = 24;
    for (let i = 0; (24 + i * sq) < t.W - 24; i++) {
      ctx.fillStyle = i % 2 ? "#fffdf7" : "#4a443a";
      ctx.fillRect(24 + i * sq, t.finishY - sq, Math.min(sq, t.W - 24 - (24 + i * sq)), sq);
      ctx.fillStyle = i % 2 ? "#4a443a" : "#fffdf7";
      ctx.fillRect(24 + i * sq, t.finishY, Math.min(sq, t.W - 24 - (24 + i * sq)), sq);
    }
    // FINISH 字直接疊在格紋帶上（深色描邊確保各地圖都清晰）
    ctx.font = '34px "ChenYuluoyan", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#4a443a";
    ctx.strokeText("FINISH", t.W / 2, t.finishY);
    ctx.fillStyle = "#ffd94d";
    ctx.fillText("FINISH", t.W / 2, t.finishY);
    ctx.textBaseline = "alphabetic";
  }

  // 牆（手繪抖動筆觸）
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const strokePts = (pts) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  };
  for (const s of t.segs) {
    if (Math.min(s.y1, s.y2) > camBot + 40 || Math.max(s.y1, s.y2) < camY - 40) continue;
    ctx.lineWidth = s.r * 2 + 6;
    ctx.strokeStyle = "#d8862f";
    strokePts(s.pts);
    ctx.lineWidth = s.r * 2;
    ctx.strokeStyle = "#ffab4e";
    strokePts(s.pts);
  }

  // 彈釘（手畫小圈圈：微橢圓 + 沒接滿的墨線）
  for (const p of t.pegs) {
    if (p.y > camBot + 30 || p.y < camY - 30) continue;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.x * 7 + p.y * 3) % 6.28);
    ctx.fillStyle = "#8fdcab";
    ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .88, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = "#3f6b4d";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * .88, 0, .35, 6.4); ctx.stroke();
    ctx.restore();
  }

  // 彈力器
  for (const bp of t.bumpers) {
    if (bp.y > camBot + 50 || bp.y < camY - 50) continue;
    bp.flash = Math.max(0, bp.flash - 0.05);
    ctx.fillStyle = bp.flash > 0 ? "#ffe07a" : "#ff9db4";
    ctx.beginPath(); ctx.ellipse(bp.x, bp.y, bp.r, bp.r * .93, .3, 0, 7); ctx.fill();
    ctx.strokeStyle = "#c04a66";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(bp.x, bp.y, bp.r, bp.r * .93, .3, .4, 6.5); ctx.stroke();
    ctx.fillStyle = "#8d2c44";
    ctx.font = `${Math.round(bp.r * 1.3)}px "ChenYuluoyan", sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("!", bp.x, bp.y + 2);
    ctx.textBaseline = "alphabetic";
  }

  // 風車
  for (const sp of t.spinners) {
    if (sp.y > camBot + 200 || sp.y < camY - 200) continue;
    const c = Math.cos(sp.angle), sn = Math.sin(sp.angle);
    const hx = c * sp.len / 2, hy = sn * sp.len / 2;
    ctx.lineWidth = 22;
    ctx.strokeStyle = "#7c4fd0";
    ctx.beginPath(); ctx.moveTo(sp.x - hx, sp.y - hy); ctx.lineTo(sp.x + hx, sp.y + hy); ctx.stroke();
    ctx.lineWidth = 16;
    ctx.strokeStyle = "#a97ff2";
    ctx.beginPath(); ctx.moveTo(sp.x - hx, sp.y - hy); ctx.lineTo(sp.x + hx, sp.y + hy); ctx.stroke();
    ctx.fillStyle = "#5b2bb8";
    ctx.beginPath(); ctx.arc(sp.x, sp.y, 13, 0, 7); ctx.fill();
    ctx.fillStyle = "#e8dcff";
    ctx.beginPath(); ctx.arc(sp.x, sp.y, 6, 0, 7); ctx.fill();
  }

  // 粒子
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 球尾跡
  for (const b of state.balls) {
    if (!b.owner) continue;
    const col = b.owner === 1 ? "47,127,224" : "255,77,110";
    for (let i = 0; i < b.trail.length; i++) {
      const tr = b.trail[i];
      ctx.globalAlpha = (i / b.trail.length) * 0.35;
      ctx.fillStyle = `rgba(${col},1)`;
      ctx.beginPath(); ctx.arc(tr.x, tr.y, BALL_R * (0.3 + 0.5 * i / b.trail.length), 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 球
  for (const b of state.balls) {
    ctx.save();
    ctx.translate(b.x, b.y);
    // 陰影
    ctx.fillStyle = "rgba(70,100,150,.28)";
    ctx.beginPath(); ctx.arc(3, 5, BALL_R, 0, 7); ctx.fill();
    drawBall(ctx, b.skin, BALL_R, b.rot, b.owner);
    ctx.restore();
    // 玩家標籤
    if (b.owner) {
      ctx.fillStyle = b.owner === 1 ? "#2f7fe0" : "#ff4d6e";
      ctx.font = '26px "ChenYuluoyan", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(`P${b.owner}`, b.x, b.y - BALL_R - 9);
    }
  }

}

// ---------- 主迴圈 ----------
let lastT = 0;
function loop(now) {
  const dt = Math.min((now - lastT) / 1000, 1 / 30);
  lastT = now;

  if (state.phase === "race") {
    stepPhysics(dt);
    stepParticles(dt);
    // 尾跡
    for (const b of state.balls) {
      if (!b.owner) continue;
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 10) b.trail.shift();
    }
    // 保險：超時強制結束（例如仍有球卡住怎麼救都出不來），
    // 若還沒有人衝線就以進度最前的球視同冠軍
    if (state.time > RACE_TIMEOUT && !state.raceEnding) {
      if (!state.winnerBall) {
        const lead = [...state.balls].sort((a, c) => c.y - a.y)[0];
        state.winnerBall = lead;
        state.winner = lead.owner;
      }
      endRace();
    }
  }
  if (state.phase === "race" || state.phase === "countdown" || state.phase === "finish") {
    render();
  }
  requestAnimationFrame(loop);
}

// ---------- 事件 ----------
$("start-btn").addEventListener("click", startRace);
$("rematch-btn").addEventListener("click", () => {
  // 回到選球畫面重選
  state.phase = "select";
  state.picks = [null, null];
  state.picking = 0;
  for (const id of ["picked-p1", "picked-p2"]) {
    const slot = $(id);
    slot.classList.remove("filled");
    const cv = slot.querySelector("canvas");
    cv.getContext("2d").clearRect(0, 0, cv.width, cv.height);
  }
  resultScreen.classList.add("hidden");
  raceScreen.classList.add("hidden");
  selectScreen.classList.remove("hidden");
  setupSelect();
});

for (const p of [1, 2]) {
  const btn = $(`boost-p${p}`);
  btn.addEventListener("pointerdown", (e) => { e.preventDefault(); useBoost(p); });
}
// 桌機測試：A = P1 加速、L = P2 加速
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key === "a" || e.key === "A") useBoost(1);
  if (e.key === "l" || e.key === "L") useBoost(2);
});

// ---------- 啟動 ----------
if (document.fonts && document.fonts.load) document.fonts.load('20px "ChenYuluoyan"');
setupSelect();
resizeCanvas();
requestAnimationFrame((t) => { lastT = t; requestAnimationFrame(loop); });
