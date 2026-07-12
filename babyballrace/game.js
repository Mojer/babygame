"use strict";

/* =========================================================
 * Ball vs Ball 滾珠大作戰
 * 直式手機網頁雙人滾珠競速：5 顆球從起點落入賽道，
 * 球與球、球與環境互相碰撞，玩家的球先抵達終點者獲勝。
 * ========================================================= */

// ---------- 常數 ----------
const TRACK_W = 720;          // 賽道邏輯寬度
const BALL_R = 21;            // 球半徑
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
  {
    id: "blaze", name: "烈焰", tag: "BLAZE", base: "#ff5233",
    draw(ctx, r, rot) {
      const g = ctx.createRadialGradient(-r * .35, -r * .35, r * .1, 0, 0, r);
      g.addColorStop(0, "#ffd166"); g.addColorStop(.55, "#ff7a3d"); g.addColorStop(1, "#d92b1e");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
      ctx.save(); ctx.rotate(rot);
      ctx.strokeStyle = "rgba(255,230,120,.85)"; ctx.lineWidth = r * .16; ctx.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, r * .55, i * 2.1, i * 2.1 + 1.1);
        ctx.stroke();
      }
      ctx.fillStyle = "#ffe9a8";
      ctx.beginPath(); ctx.arc(r * .3, 0, r * .14, 0, 7); ctx.fill();
      ctx.restore();
    }
  },
  {
    id: "ocean", name: "深海", tag: "OCEAN", base: "#2e8bff",
    draw(ctx, r, rot) {
      const g = ctx.createRadialGradient(-r * .35, -r * .35, r * .1, 0, 0, r);
      g.addColorStop(0, "#9fd8ff"); g.addColorStop(.55, "#3d9bff"); g.addColorStop(1, "#1b4fd8");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
      ctx.save(); ctx.rotate(rot);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.clip();
      ctx.strokeStyle = "rgba(230,250,255,.8)"; ctx.lineWidth = r * .13; ctx.lineCap = "round";
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-r, i * r * .5);
        ctx.quadraticCurveTo(-r * .4, i * r * .5 - r * .3, 0, i * r * .5);
        ctx.quadraticCurveTo(r * .4, i * r * .5 + r * .3, r, i * r * .5);
        ctx.stroke();
      }
      ctx.restore();
    }
  },
  {
    id: "volt", name: "雷霆", tag: "VOLT", base: "#ffd23d",
    draw(ctx, r, rot) {
      const g = ctx.createRadialGradient(-r * .35, -r * .35, r * .1, 0, 0, r);
      g.addColorStop(0, "#fff8c9"); g.addColorStop(.55, "#ffd23d"); g.addColorStop(1, "#e09a00");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
      ctx.save(); ctx.rotate(rot);
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "rgba(160,100,0,.55)"; ctx.lineWidth = r * .07;
      ctx.beginPath();
      ctx.moveTo(r * .15, -r * .62); ctx.lineTo(-r * .3, r * .1); ctx.lineTo(-r * .02, r * .1);
      ctx.lineTo(-r * .15, r * .62); ctx.lineTo(r * .3, -r * .12); ctx.lineTo(r * .02, -r * .12);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
  },
  {
    id: "ghost", name: "幻影", tag: "GHOST", base: "#a86bff",
    draw(ctx, r, rot) {
      const g = ctx.createRadialGradient(-r * .35, -r * .35, r * .1, 0, 0, r);
      g.addColorStop(0, "#e3ccff"); g.addColorStop(.55, "#a86bff"); g.addColorStop(1, "#5b2bb8");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
      ctx.save(); ctx.rotate(rot);
      ctx.fillStyle = "#2a1650";
      ctx.beginPath(); ctx.ellipse(-r * .26, -r * .08, r * .11, r * .2, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(r * .26, -r * .08, r * .11, r * .2, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = "#2a1650"; ctx.lineWidth = r * .09; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(0, r * .28, r * .22, .3, Math.PI - .3); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.45)";
      ctx.beginPath(); ctx.arc(-r * .5, r * .45, r * .1, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(r * .55, -r * .5, r * .08, 0, 7); ctx.fill();
      ctx.restore();
    }
  },
  {
    id: "metal", name: "鋼鐵", tag: "METAL", base: "#b9c4d6",
    draw(ctx, r, rot) {
      const g = ctx.createRadialGradient(-r * .35, -r * .35, r * .1, 0, 0, r);
      g.addColorStop(0, "#ffffff"); g.addColorStop(.5, "#b9c4d6"); g.addColorStop(1, "#5c6a82");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
      ctx.save(); ctx.rotate(rot);
      ctx.strokeStyle = "rgba(70,84,106,.7)"; ctx.lineWidth = r * .08;
      ctx.beginPath(); ctx.arc(0, 0, r * .62, 0, 7); ctx.stroke();
      ctx.fillStyle = "#46546a";
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        ctx.beginPath(); ctx.arc(Math.cos(a) * r * .62, Math.sin(a) * r * .62, r * .09, 0, 7); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(0, 0, r * .16, 0, 7); ctx.fill();
      ctx.restore();
    }
  },
];

// 通用：畫一顆完整的球（含輪廓、光澤、玩家標記）
function drawBall(ctx, skin, r, rot, owner) {
  skin.draw(ctx, r, rot);
  // 光澤（不隨滾動旋轉）
  const hl = ctx.createRadialGradient(-r * .4, -r * .45, 0, -r * .4, -r * .45, r * .75);
  hl.addColorStop(0, "rgba(255,255,255,.55)"); hl.addColorStop(.4, "rgba(255,255,255,.12)"); hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * .09);
  ctx.strokeStyle = owner === 1 ? "#4da3ff" : owner === 2 ? "#ff5c78" : "rgba(0,0,0,.35)";
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

// ---------- 賽道 ----------
// segments: 線段牆 {x1,y1,x2,y2,r}；pegs: 彈釘；bumpers: 彈力器；spinners: 旋轉風車
function buildTrack() {
  const segs = [], pegs = [], bumpers = [], spinners = [];
  const seg = (x1, y1, x2, y2, r = 7) => segs.push({ x1, y1, x2, y2, r });
  const peg = (x, y, r = 13) => pegs.push({ x, y, r });
  const bumper = (x, y, r = 27) => bumpers.push({ x, y, r, flash: 0 });
  const spinner = (x, y, len, speed) => spinners.push({ x, y, len, speed, angle: Math.random() * 3 });

  const H = 7400;
  // 左右外牆
  seg(28, 0, 28, H); seg(TRACK_W - 28, 0, TRACK_W - 28, H);

  // 起點漏斗
  seg(28, 190, 300, 400); seg(TRACK_W - 28, 190, 420, 400);

  // 第一段：之字形斜坡
  seg(28, 560, 510, 730);
  seg(TRACK_W - 28, 900, 210, 1075);
  seg(28, 1240, 510, 1410);

  // 第二段：彈釘陣（梅花排列）
  for (let row = 0; row < 5; row++) {
    const y = 1600 + row * 130;
    const off = row % 2 ? 62 : 0;
    for (let x = 120 + off; x <= TRACK_W - 120; x += 124) peg(x, y);
  }

  // 第三段：漏斗 + 風車
  seg(28, 2360, 305, 2560); seg(TRACK_W - 28, 2360, 415, 2560);
  spinner(360, 2760, 250, 2.2);

  // 第四段：彈力器斜坡
  seg(TRACK_W - 28, 2960, 240, 3120);
  bumper(150, 3300); bumper(430, 3360); bumper(610, 3260);
  seg(28, 3520, 480, 3680);
  bumper(590, 3830);

  // 第五段：S 型窄道
  seg(28, 3950, 460, 4110);
  seg(TRACK_W - 28, 4270, 250, 4430);
  seg(28, 4590, 460, 4750);

  // 第六段：雙風車
  spinner(240, 4980, 230, -2.6);
  spinner(480, 5220, 230, 2.6);

  // 第七段：彈釘 + 彈力器混合
  for (let row = 0; row < 3; row++) {
    const y = 5450 + row * 140;
    const off = row % 2 ? 62 : 0;
    for (let x = 130 + off; x <= TRACK_W - 130; x += 130) peg(x, y);
  }
  bumper(180, 5980); bumper(540, 5980);

  // 第八段：最後之字 + 終點漏斗
  seg(TRACK_W - 28, 6120, 230, 6280);
  seg(28, 6420, 300, 6620); seg(TRACK_W - 28, 6420, 420, 6620);

  // 終點盆地
  const finishY = 6900;
  seg(28, H - 60, TRACK_W - 28, H - 60); // 底板

  return { segs, pegs, bumpers, spinners, H, finishY, spawnY: 90 };
}

// ---------- 遊戲狀態 ----------
const state = {
  phase: "select",       // select | countdown | race | finish
  picks: [null, null],   // P1 / P2 選的 skin index
  picking: 0,            // 目前選球的玩家 (0=P1, 1=P2)
  balls: [],
  track: null,
  camY: 0,
  time: 0,
  finished: [],          // 依完成順序的 ball
  winnerBall: null,      // 第一顆衝線的球（= 排名第一）
  winner: 0,             // 0=未定或平手（中立球奪冠）, 1/2=玩家
  boosts: [BOOST_CHARGES, BOOST_CHARGES],
  particles: [],
};

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const selectScreen = $("select-screen"), raceScreen = $("race-screen"), resultScreen = $("result-screen");
const canvas = $("game"), ctx = canvas.getContext("2d");
const progressCanvas = $("progress-canvas"), pctx = progressCanvas.getContext("2d");

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
  updatePickUI();
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
    prompt.textContent = "玩家 1，請選擇你的球！";
    prompt.className = "pick-prompt p1";
  } else if (state.picking === 1) {
    prompt.textContent = "玩家 2，請選擇你的球！";
    prompt.className = "pick-prompt p2";
  } else {
    prompt.textContent = "準備完成，開始比賽！";
    prompt.className = "pick-prompt done";
  }
  $("start-btn").disabled = state.picking < 2;
}

// ---------- 開始比賽 ----------
function startRace() {
  state.track = buildTrack();
  state.balls = [];
  state.finished = [];
  state.winnerBall = null;
  state.winner = 0;
  state.time = 0;
  state.camY = 0;
  state.boosts = [BOOST_CHARGES, BOOST_CHARGES];
  state.particles = [];

  // 5 顆球全部進場：玩家球 + 中立球
  const order = [...SKINS.keys()].sort(() => Math.random() - .5);
  order.forEach((skinIdx, i) => {
    const owner = skinIdx === state.picks[0] ? 1 : skinIdx === state.picks[1] ? 2 : 0;
    state.balls.push({
      skin: SKINS[skinIdx],
      owner,
      x: 120 + i * (TRACK_W - 240) / 4 + (Math.random() * 24 - 12),
      y: state.track.spawnY + (Math.random() * 30 - 15),
      vx: 0, vy: 0,
      rot: 0,
      finished: false,
      stuckTime: 0,
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
  const h = dt / SUBSTEPS;

  // 更新風車角度
  for (const sp of t.spinners) sp.angle += sp.speed * dt;

  for (let s = 0; s < SUBSTEPS; s++) {
    for (const b of state.balls) {
      b.vy += GRAVITY * h;
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
      if (b.stuckTime > 1.4) {
        b.vx += (TRACK_W / 2 - b.x) * 0.9 + (Math.random() * 120 - 60);
        b.vy -= 180;
        b.stuckTime = 0;
      }
    } else b.stuckTime = 0;

    // 抵達終點
    if (!b.finished && b.y > t.finishY) {
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
  spawnBurst(b.x, b.y, b.owner === 1 ? "#4da3ff" : "#ff5c78", 14);
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
    setTimeout(showResult, 1500);
  }
}

function showResult() {
  state.phase = "finish";
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
let dpr = 1, cssW = 0, cssH = 0, viewScale = 1;
function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  cssW = raceScreen.clientWidth;
  cssH = raceScreen.clientHeight;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  viewScale = cssW / TRACK_W;
  // 進度條配合視窗高度
  progressCanvas.height = Math.round(Math.min(340, cssH * 0.42));
}
window.addEventListener("resize", resizeCanvas);

function render() {
  const t = state.track;
  if (!t) return;
  if (!cssW) { resizeCanvas(); if (!cssW) return; }
  const viewH = cssH / viewScale; // 邏輯視野高度

  // 攝影機：跟隨領先的「玩家球」
  const playerBalls = state.balls.filter((b) => b.owner && !b.finished);
  const target = playerBalls.length
    ? Math.max(...playerBalls.map((b) => b.y))
    : Math.max(...state.balls.map((b) => b.y));
  let camTarget = target - viewH * 0.42;
  camTarget = Math.max(0, Math.min(t.H - viewH, camTarget));
  state.camY += (camTarget - state.camY) * 0.09;

  ctx.setTransform(dpr * viewScale, 0, 0, dpr * viewScale, 0, -state.camY * dpr * viewScale);

  const camY = state.camY, camBot = camY + viewH;

  // 背景
  const bg = ctx.createLinearGradient(0, camY, 0, camBot);
  bg.addColorStop(0, "#151b3d"); bg.addColorStop(1, "#0d1130");
  ctx.fillStyle = bg;
  ctx.fillRect(0, camY, TRACK_W, viewH);

  // 背景裝飾點
  ctx.fillStyle = "rgba(255,255,255,.05)";
  for (let gy = Math.floor(camY / 260) * 260; gy < camBot + 260; gy += 260) {
    for (let gx = 90; gx < TRACK_W; gx += 180) {
      const jitter = ((gx * 7 + gy * 13) % 97) - 48;
      ctx.beginPath(); ctx.arc(gx + jitter, gy + (jitter % 30), 3, 0, 7); ctx.fill();
    }
  }

  // 終點區
  if (t.finishY > camY - 100 && t.finishY < camBot + 100) {
    ctx.fillStyle = "rgba(255,217,77,.10)";
    ctx.fillRect(28, t.finishY, TRACK_W - 56, t.H - 60 - t.finishY);
    // 格紋終點線
    const sq = 24;
    for (let i = 0; (28 + i * sq) < TRACK_W - 28; i++) {
      ctx.fillStyle = i % 2 ? "#fff" : "#20264e";
      ctx.fillRect(28 + i * sq, t.finishY - sq, Math.min(sq, TRACK_W - 28 - (28 + i * sq)), sq);
      ctx.fillStyle = i % 2 ? "#20264e" : "#fff";
      ctx.fillRect(28 + i * sq, t.finishY, Math.min(sq, TRACK_W - 28 - (28 + i * sq)), sq);
    }
    ctx.fillStyle = "#ffd94d";
    ctx.font = "900 46px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FINISH", TRACK_W / 2, t.finishY + 110);
  }

  // 牆
  ctx.lineCap = "round";
  for (const s of t.segs) {
    if (Math.min(s.y1, s.y2) > camBot + 40 || Math.max(s.y1, s.y2) < camY - 40) continue;
    ctx.lineWidth = s.r * 2 + 6;
    ctx.strokeStyle = "#2b3468";
    ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
    ctx.lineWidth = s.r * 2;
    ctx.strokeStyle = "#4a5aa8";
    ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
  }

  // 彈釘
  for (const p of t.pegs) {
    if (p.y > camBot + 30 || p.y < camY - 30) continue;
    ctx.fillStyle = "#39437e";
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 2.5, 0, 7); ctx.fill();
    ctx.fillStyle = "#8f9cd8";
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    ctx.fillStyle = "#c9d2f5";
    ctx.beginPath(); ctx.arc(p.x - p.r * .3, p.y - p.r * .3, p.r * .35, 0, 7); ctx.fill();
  }

  // 彈力器
  for (const bp of t.bumpers) {
    if (bp.y > camBot + 50 || bp.y < camY - 50) continue;
    bp.flash = Math.max(0, bp.flash - 0.05);
    ctx.fillStyle = "#7a2440";
    ctx.beginPath(); ctx.arc(bp.x, bp.y, bp.r + 4, 0, 7); ctx.fill();
    ctx.fillStyle = bp.flash > 0 ? "#ffe07a" : "#ff5c78";
    ctx.beginPath(); ctx.arc(bp.x, bp.y, bp.r, 0, 7); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.font = `900 ${bp.r}px sans-serif`;
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
    ctx.strokeStyle = "#b8842e";
    ctx.beginPath(); ctx.moveTo(sp.x - hx, sp.y - hy); ctx.lineTo(sp.x + hx, sp.y + hy); ctx.stroke();
    ctx.lineWidth = 16;
    ctx.strokeStyle = "#ffbf47";
    ctx.beginPath(); ctx.moveTo(sp.x - hx, sp.y - hy); ctx.lineTo(sp.x + hx, sp.y + hy); ctx.stroke();
    ctx.fillStyle = "#7a5518";
    ctx.beginPath(); ctx.arc(sp.x, sp.y, 13, 0, 7); ctx.fill();
    ctx.fillStyle = "#ffe4a8";
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
    const col = b.owner === 1 ? "77,163,255" : "255,92,120";
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
    ctx.fillStyle = "rgba(0,0,0,.3)";
    ctx.beginPath(); ctx.arc(3, 5, BALL_R, 0, 7); ctx.fill();
    drawBall(ctx, b.skin, BALL_R, b.rot, b.owner);
    ctx.restore();
    // 玩家標籤
    if (b.owner) {
      ctx.fillStyle = b.owner === 1 ? "#4da3ff" : "#ff5c78";
      ctx.font = "900 17px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`P${b.owner}`, b.x, b.y - BALL_R - 9);
    }
  }

  drawProgressBar();
}

function drawProgressBar() {
  const t = state.track;
  const w = progressCanvas.width, h = progressCanvas.height;
  pctx.setTransform(1, 0, 0, 1, 0, 0);
  pctx.clearRect(0, 0, w, h);
  pctx.fillStyle = "rgba(20,26,58,.7)";
  pctx.beginPath();
  pctx.roundRect ? pctx.roundRect(w / 2 - 4, 6, 8, h - 12, 4) : pctx.rect(w / 2 - 4, 6, 8, h - 12);
  pctx.fill();
  // 終點旗
  pctx.font = "12px sans-serif"; pctx.textAlign = "center";
  pctx.fillText("🏁", w / 2, h - 2);
  for (const b of state.balls) {
    const prog = Math.min(1, b.y / t.finishY);
    const y = 10 + prog * (h - 26);
    const r = b.owner ? 7 : 5;
    pctx.fillStyle = b.skin.base;
    pctx.beginPath(); pctx.arc(w / 2, y, r, 0, 7); pctx.fill();
    if (b.owner) {
      pctx.lineWidth = 2;
      pctx.strokeStyle = b.owner === 1 ? "#4da3ff" : "#ff5c78";
      pctx.stroke();
    }
  }
}

// ---------- 主迴圈 ----------
let lastT = 0;
function loop(now) {
  const dt = Math.min((now - lastT) / 1000, 1 / 30);
  lastT = now;

  if (state.phase === "race") {
    state.time += dt;
    stepPhysics(dt);
    stepParticles(dt);
    // 尾跡
    for (const b of state.balls) {
      if (!b.owner) continue;
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 10) b.trail.shift();
    }
    // 保險：超時以進度判定（進度最前的球視同冠軍，維持「第一名=獲勝者」）
    if (state.time > RACE_TIMEOUT && !state.winnerBall) {
      const lead = [...state.balls].sort((a, c) => c.y - a.y)[0];
      state.winnerBall = lead;
      state.winner = lead.owner;
      showResult();
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
setupSelect();
resizeCanvas();
requestAnimationFrame((t) => { lastT = t; requestAnimationFrame(loop); });
