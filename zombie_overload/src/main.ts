import './style.css';
import { Sfx } from './audio/sfx';
import { GameRenderer } from './render/renderer';
import { loadHordeSprites } from './render/sprites';
import { FIXED_STEP, RUN_SECONDS, TIERS, type TierName } from './sim/content';
import { botInput } from './sim/bot';
import { CHARACTER_IDS, CHARACTERS, type CharacterId } from './sim/characters';
import { FX_BURST, FX_PLAGUE } from './sim/logs';
import { UPGRADES } from './sim/upgrades';
import { type UltKind, World } from './sim/world';
import { STAGE_IDS, STAGES, stageId, type StageId } from './sim/stages';
import { Hud } from './ui/hud';
import { InputController } from './ui/input';
import { PerfMonitor } from './ui/perf';

const $ = (sel: string) => document.querySelector(sel) as HTMLElement;

// ───────── 網址參數（壓測／實機測試用） ─────────
const q = new URLSearchParams(location.search);
const flag = (k: string) => q.has(k) && q.get(k) !== '0';
const fxParam = q.get('fx');
const params = {
  seed: q.has('seed') ? Number(q.get('seed')) : (Math.random() * 1e9) | 0,
  n: q.has('n') ? Math.max(50, Number(q.get('n'))) : undefined,
  stress: flag('stress'),
  god: flag('god'),
  bot: flag('bot'),
  auto: flag('auto'),
  fx: fxParam === 'low' || fxParam === 'mid' || fxParam === 'high' ? (fxParam as TierName) : null,
  t: Number(q.get('t') ?? 0) || 0,
  perf: q.has('perf') && q.get('perf') !== '0',
  skills: q.get('skills') !== '0',
  char: (CHARACTER_IDS as string[]).includes(q.get('char') ?? '') ? (q.get('char') as CharacterId) : null,
  ult: (q.get('ult') === 'pylon' ? 'pylon' : q.get('ult') === 'ship' ? 'ship' : null) as 'ship' | 'pylon' | null,
  /** oblique = 3/4 斜俯視正式風格（預設）；topdown = 原本程式畫的 90° 佔位圖 */
  style: q.get('style') === 'topdown' ? 'topdown' : 'oblique',
  mute: flag('mute'),
  stage: stageId(q.get('stage')),
};

/** 記住上次選的角色（只是方便，讀寫失敗就算了） */
function loadPref(k: string): string | null {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function savePref(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* 私密模式等情況 */
  }
}

const coarse = matchMedia('(pointer: coarse)').matches;
document.body.classList.add('on-title');
document.body.classList.toggle('touch', coarse);
let tier: TierName = params.fx ?? (coarse ? 'mid' : 'high');
let chosenStage: StageId = params.stage ?? stageId(loadPref('zo.stage')) ?? 'city';

type State = 'title' | 'stages' | 'select' | 'playing' | 'paused' | 'levelup' | 'over';
let state: State = 'title';

async function boot() {
  const worldOptions = {
    seed: params.seed,
    tier,
    cap: params.n,
    god: params.god,
    stress: params.stress,
    autoLevel: params.auto || params.bot,
    startTime: params.t,
    noSkills: !params.skills,
  };
  let world = new World({ ...worldOptions, stage: chosenStage });
  const gr = new GameRenderer();
  await gr.init($('#game'), world, () => loadHordeSprites(), params.style === 'topdown');
  gr.setTier(tier);
  world.setView(gr.viewW, gr.viewH);

  // 除錯用：在 console 可以 __zo.world / __zo.gr 檢查狀態，__zo.frame(t) 手動推進一幀
  const debug: Record<string, unknown> = { world, gr };
  (window as unknown as { __zo: unknown }).__zo = debug;
  const hud = new Hud();
  const sfx = new Sfx();
  sfx.setMuted(params.mute);
  const perf = new PerfMonitor($('#perf'), params.perf, params.fx !== null, t => {
    tier = t;
    world.setTier(t);
    gr.setTier(t);
    hud.toast(`效能自動調整：畫質降為「${TIERS[t].label}」，同屏上限 ${world.cap}`);
  });

  const pick = (i: number) => {
    if (hud.levelOpen) hud.pick(i, onPick);
  };
  const onPick = (id: string) => {
    world.applyUpgrade(id);
    sfx.play('level');
    if (world.pendingLevels > 0) hud.openLevelUp(world, onPick);
    else state = 'playing';
  };
  const togglePause = () => {
    if (state === 'playing') setPaused(true);
    else if (state === 'paused') setPaused(false);
  };
  // 背景音樂：開始遊戲才播、暫停時停、跟著靜音
  const bgm = new Audio('./audio/bgm_undead_rising.mp3');
  bgm.loop = true;
  bgm.volume = 0.42;
  bgm.preload = 'auto';
  bgm.muted = params.mute;
  const playBgm = () => void bgm.play().catch(() => {});
  const setPaused = (p: boolean) => {
    state = p ? 'paused' : 'playing';
    $('#pause').classList.toggle('hidden', !p);
    if (p) bgm.pause();
    else playBgm();
  };
  const toggleMute = () => {
    sfx.setMuted(!sfx.muted);
    bgm.muted = sfx.muted;
    $('#muteBtn').textContent = sfx.muted ? '🔇' : '🔊';
    $('#musicState').textContent = sfx.muted ? 'OFF' : 'ON';
  };

  const input = new InputController($('#zone'), $('#joy'), $('#knob'), $('#dash'), $('#ult'), {
    Escape: togglePause,
    KeyP: togglePause,
    Backquote: () => perf.toggle(),
    KeyM: toggleMute,
    Digit1: () => pick(0),
    Digit2: () => pick(1),
    Digit3: () => pick(2),
  });

  $('#pauseBtn').addEventListener('click', togglePause);
  $('#muteBtn').addEventListener('click', toggleMute);
  $('#resumeBtn').addEventListener('click', () => setPaused(false));
  // 重新開始：再來一局回關卡頁並記住選擇，主選單回封面。
  const restart = (toSelect: boolean) => {
    try {
      sessionStorage.setItem('zo.skipCover', toSelect ? '1' : '');
    } catch {
      // 無痕模式等情況存不了就回封面
    }
    location.reload();
  };
  $('#restartBtn').addEventListener('click', () => restart(true));
  $('#againBtn').addEventListener('click', () => restart(true));
  $('#menuBtn').addEventListener('click', () => restart(false));
  // ───────── 選角 ─────────
  let chosen: CharacterId = params.char ?? (loadPref('zo.char') as CharacterId | null) ?? 'akane';
  if (!CHARACTER_IDS.includes(chosen)) chosen = 'akane';
  const color: Record<CharacterId, string> = { akane: '#ff6ec7', yu: '#4fc3ff' };
  const latin: Record<CharacterId, string> = { akane: 'AKANE', yu: 'YU' };
  // 火力 = 每秒傷害（含茜的爆炸範圍傷害）
  const dps = (id: CharacterId) => {
    const a = CHARACTERS[id].attack;
    return (a.damage + (a.splash?.damage ?? 0)) / a.cooldown;
  };
  const stats: { label: string; get: (id: CharacterId) => number; unit?: string }[] = [
    { label: '血量', get: id => CHARACTERS[id].hp },
    { label: '速度', get: id => CHARACTERS[id].speed },
    { label: '射程', get: id => CHARACTERS[id].attack.range },
    { label: '火力', get: id => Math.round(dps(id)), unit: '/s' },
  ];
  // 分段能力條：最強的角色 = 9 格（留 1 格空，看起來還有成長空間）
  const bar = (label: string, v: number, max: number, unit = '') => {
    const n = Math.max(1, Math.round((v / max) * 9));
    const segs = Array.from({ length: 10 }, (_, i) => `<i${i < n ? ' class="on"' : ''}></i>`).join('');
    return `<div class="stat"><span>${label}</span><span class="segs">${segs}</span><b>${v}${unit}</b></div>`;
  };
  const select = $('#charSelect');
  select.innerHTML = CHARACTER_IDS.map(id => {
    const c = CHARACTERS[id];
    const rows = stats.map(st => bar(st.label, st.get(id), Math.max(...CHARACTER_IDS.map(st.get)), st.unit)).join('');
    return `<button class="char-card" role="radio" data-id="${id}" style="--c:${color[id]}">
      <span class="check" aria-hidden="true"></span>
      <span class="show"><span class="platform"></span><img class="portrait" src="./sprites/portrait_${id}.png" alt="${c.name}" /><img class="mini" src="./sprites/mini_${id}.png" alt="" /></span>
      <span class="info"><span class="name">${c.name}<em>${latin[id]}</em></span><span class="role">${c.title} · ${c.attack.label}</span>
      ${rows}<span class="desc">${c.desc}</span></span></button>`;
  }).join('');
  const choose = (id: CharacterId) => {
    chosen = id;
    select.querySelectorAll<HTMLElement>('.char-card').forEach(el => el.setAttribute('aria-checked', String(el.dataset.id === id)));
    world.setCharacter(id);
    gr.setCharacter(id);
    ($('#hudPortrait') as HTMLImageElement).src = `./sprites/portrait_${id}.png`;
    savePref('zo.char', id);
  };
  select.querySelectorAll<HTMLElement>('.char-card').forEach(el => el.addEventListener('click', () => choose(el.dataset.id as CharacterId)));
  // 終極武器：星艦砲擊／天降巨砲
  let ultKind: UltKind = params.ult ?? ((loadPref('zo.ult') as UltKind | null) ?? 'ship');
  const ultSelect = $('#ultSelect');
  const chooseUlt = (k: UltKind) => {
    ultKind = k;
    world.setUltKind(k);
    $('#ultLabel').textContent = k === 'ship' ? '星艦' : '巨砲';
    ultSelect.querySelectorAll<HTMLElement>('.ult-card').forEach(b => b.setAttribute('aria-checked', String(b.dataset.ult === k)));
    savePref('zo.ult', k);
  };
  ultSelect.querySelectorAll<HTMLElement>('.ult-card').forEach(b => b.addEventListener('click', () => chooseUlt(b.dataset.ult as UltKind)));
  chooseUlt(ultKind);
  choose(chosen);

  // 封面 → 關卡 → 角色＋武器 → 遊戲；換關卡重建模擬，畫面只重烘地面。
  const stageCards = $('#stageCards');
  stageCards.innerHTML = STAGE_IDS.map(id => {
    const st = STAGES[id];
    return `<button class="stage-card stage-${id}" role="radio" data-stage="${id}" style="--c:${st.color}">
      <span class="stage-art">${id === 'candy' ? '<img src="./covers/candy-cover-v1.jpg" alt="彩虹雲海、糖果屋與巧克力熔岩巨獸" />' : id === 'japan' ? '<img src="./covers/japan-cover-v2.jpg" alt="月下鳥居與神社，茜與宇迎戰百鬼和荒魂巨獸" />' : ''}<span class="stage-number">${st.number}</span><span class="stage-mark">${id === 'city' ? 'DEAD CITY' : st.name}</span></span>
      <span class="check" aria-hidden="true"></span>
      <span class="stage-info"><span class="stage-kicker">STAGE ${st.number} · 10 MIN SURVIVAL</span><span class="stage-name">${st.name}<em>${st.latin}</em></span><span class="stage-subtitle">${st.subtitle}</span><span class="stage-description">${st.description}</span>
      <span class="stage-tags">${st.landmarks.map(x => `<span>${x}</span>`).join('')}</span>
      <span class="stage-enemies"><small>敵人</small>${st.enemies.map((name, k) => `<span>${id !== 'city' ? `<img src="./sprites/${id === 'japan' ? 'yokai' : 'candy'}_${k}.png" alt="" />` : ''}${name}</span>`).join('')}</span></span></button>`;
  }).join('');
  const chooseStage = (id: StageId) => {
    chosenStage = id;
    stageCards.querySelectorAll<HTMLElement>('.stage-card').forEach(el => {
      const selected = el.dataset.stage === id;
      el.setAttribute('aria-checked', String(selected));
      el.tabIndex = selected ? 0 : -1;
      if (selected && state === 'stages') {
        if (stageCards.contains(document.activeElement)) el.focus({ preventScroll: true });
        el.scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    });
    savePref('zo.stage', id);
    $('#selectedStage').textContent = `STAGE ${STAGES[id].number} / ${STAGES[id].name}`;
    $('#selectedStage').style.setProperty('--c', STAGES[id].color);
  };
  stageCards.querySelectorAll<HTMLElement>('.stage-card').forEach(el => el.addEventListener('click', () => chooseStage(el.dataset.stage as StageId)));
  chooseStage(chosenStage);
  const openStages = () => {
    if (state !== 'title' && state !== 'select') return;
    sfx.unlock();
    state = 'stages';
    $('#start').classList.add('hidden');
    $('#select').classList.add('hidden');
    $('#stageSelect').classList.remove('hidden');
    input.consumeEdges();
  };
  const openSelect = () => {
    if (state !== 'stages') return;
    if (world.stage.id !== chosenStage) {
      world = new World({ ...worldOptions, stage: chosenStage, character: chosen, ult: ultKind });
      debug.world = world;
      gr.setStage(world);
      world.setView(gr.viewW, gr.viewH);
    }
    state = 'select';
    $('#stageSelect').classList.add('hidden');
    $('#select').classList.remove('hidden');
    input.consumeEdges();
  };
  const backToCover = () => {
    if (state !== 'stages') return;
    state = 'title';
    $('#stageSelect').classList.add('hidden');
    $('#start').classList.remove('hidden');
  };
  const start = () => {
    if (state !== 'select' && state !== 'title') return;
    sfx.unlock();
    $('#start').classList.add('hidden');
    $('#select').classList.add('hidden');
    $('#stageSelect').classList.add('hidden');
    document.body.classList.remove('on-title');
    state = 'playing';
    input.consumeEdges();
    $('#hudStage').textContent = world.stage.name;
    $('#finishSub').textContent = world.stage.id === 'candy' ? 'ALL CHOCOLATE TITANS DOWN' : world.stage.id === 'japan' ? 'ALL KAIJU DOWN' : 'ALL MUTANTS DOWN';
    hud.toast(`STAGE ${world.stage.number} · ${world.stage.name}`, 3);
    playBgm();
  };
  // 封面選單：↑↓ 移動、Enter 確認（滑鼠移上去也會同步高亮）
  const menuItems = [...document.querySelectorAll<HTMLButtonElement>('#coverMenu .menu-item')];
  let menuIdx = 0;
  const setMenu = (i: number) => {
    menuIdx = (i + menuItems.length) % menuItems.length;
    menuItems.forEach((b, k) => b.classList.toggle('on', k === menuIdx));
  };
  menuItems.forEach((b, k) => b.addEventListener('pointerenter', () => setMenu(k)));
  setMenu(0);
  $('#musicState').textContent = sfx.muted ? 'OFF' : 'ON';
  $('#musicBtn').addEventListener('click', toggleMute);
  let howtoOpen = false;
  const showHowto = (on: boolean) => {
    howtoOpen = on;
    $('#howto').classList.toggle('hidden', !on);
  };
  $('#howtoBtn').addEventListener('click', () => showHowto(true));
  $('#howtoClose').addEventListener('click', () => showHowto(false));
  window.addEventListener('keydown', e => {
    if (howtoOpen) {
      if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space') showHowto(false);
      e.preventDefault();
      return;
    }
    if (state === 'title') {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') setMenu(menuIdx - 1);
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') setMenu(menuIdx + 1);
      else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        menuItems[menuIdx].click();
      }
    } else if (state === 'stages') {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') chooseStage(STAGE_IDS[(STAGE_IDS.indexOf(chosenStage) + STAGE_IDS.length - 1) % STAGE_IDS.length]);
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') chooseStage(STAGE_IDS[(STAGE_IDS.indexOf(chosenStage) + 1) % STAGE_IDS.length]);
      else if (/^Digit[1-3]$/.test(e.code)) chooseStage(STAGE_IDS[Number(e.code.slice(-1)) - 1]);
      else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (document.activeElement === $('#stageBackBtn')) backToCover();
        else openSelect();
      } else if (e.code === 'Escape') backToCover();
    } else if (state === 'over') {
      if (e.code === 'Enter') restart(true);
      else if (e.code === 'Escape') restart(false);
    } else if (state === 'select') {
      if (e.code === 'ArrowLeft' || e.code === 'Digit1') choose(CHARACTER_IDS[0]);
      else if (e.code === 'ArrowRight' || e.code === 'Digit2') choose(CHARACTER_IDS[1]);
      else if (e.code === 'ArrowUp' || e.code === 'Digit3') chooseUlt('ship');
      else if (e.code === 'ArrowDown' || e.code === 'Digit4') chooseUlt('pylon');
      else if (e.code === 'Enter') {
        // 擋掉按鈕的原生 Enter 點擊，避免焦點停在「返回」時同時觸發兩個動作
        e.preventDefault();
        if (document.activeElement === $('#backBtn')) openStages();
        else start();
      }
      else if (e.code === 'Escape') openStages();
    }
  });
  $('#startBtn').addEventListener('click', openStages);
  $('#stageBackBtn').addEventListener('click', backToCover);
  $('#stageNextBtn').addEventListener('click', openSelect);
  $('#goBtn').addEventListener('click', start);
  $('#backBtn').addEventListener('click', openStages);
  window.addEventListener('pointerdown', () => sfx.unlock());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'playing') setPaused(true);
  });
  window.addEventListener('contextmenu', e => e.preventDefault());
  const onResize = () => {
    gr.resize();
    world.setView(gr.viewW, gr.viewH);
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', () => setTimeout(onResize, 200));
  let skipCover = false;
  try {
    skipCover = sessionStorage.getItem('zo.skipCover') === '1';
    sessionStorage.removeItem('zo.skipCover');
  } catch {
    // 讀不到就照常顯示封面
  }
  if (params.bot) start();
  else if (skipCover) openStages();
  if (!params.skills) hud.toast('壓測模式（skills=0）：自動攻擊與技能已關閉', 6);

  // 結算：分數＝擊殺＋連鎖＋變異體＋等級＋存活／通關獎勵，換算評等
  const RANKS: [string, number][] = [
    ['S', 380000],
    ['A', 270000],
    ['B', 160000],
    ['C', 70000],
    ['D', 0],
  ];
  const fmtTime = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  const countUp = (el: HTMLElement, to: number, fmt: (n: number) => string, delay: number, dur = 0.9) => {
    el.textContent = fmt(0);
    const t0 = performance.now() + delay * 1000;
    const tick = (now: number) => {
      const k = Math.max(0, Math.min(1, (now - t0) / (dur * 1000)));
      el.textContent = fmt(Math.round(to * (1 - (1 - k) ** 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const showEnd = () => {
    state = 'over';
    const win = world.over === 'win';
    const st = world.stats;
    const c = CHARACTERS[chosen];
    const survived = win ? Math.min(world.time, RUN_SECONDS) : world.time;
    const score = Math.round(
      st.kills * 10 + st.maxChain * 50 + st.mutantKills * 1000 + world.player.level * 200 + survived * 20 + (win ? 50000 : 0),
    );
    const rank = RANKS.find(([, min]) => score >= min)![0];
    const end = $('#end');
    end.classList.toggle('lose', !win);
    end.style.setProperty('--c', color[chosen]);
    $('#endTag').textContent = win ? 'MISSION COMPLETE' : 'GAME OVER';
    $('#endTitle').textContent = win ? `撐過${world.stage.horde}！` : '倒下了';
    $('#endSub').textContent = win ? 'FINISH' : 'DEFEATED';
    ($('#endPortrait') as HTMLImageElement).src = `./sprites/portrait_${chosen}.png`;
    ($('#endMini') as HTMLImageElement).src = `./sprites/mini_${chosen}.png`;
    $('#endWho').innerHTML = `<span class="name">${c.name}<em>${latin[chosen]}</em></span><span class="role">${c.title} · ${ultKind === 'ship' ? '星艦砲擊' : '天降巨砲'}</span><span class="role">STAGE ${world.stage.number} · ${world.stage.name}</span>`;
    const rankEl = $('#endRank');
    rankEl.textContent = rank;
    rankEl.dataset.rank = rank;
    const rows: [string, string, number, (n: number) => string][] = [
      ['存活時間', 'TIME', Math.floor(survived), fmtTime],
      ['擊殺數', 'KILLS', st.kills, n => n.toLocaleString()],
      [world.stage.boss, world.stage.id === 'candy' ? 'CHOCOLATE' : world.stage.id === 'japan' ? 'KAIJU' : 'MUTANTS', st.mutantKills, n => `×${n}`],
      ['最大連鎖', 'MAX CHAIN', st.maxChain, n => `×${n.toLocaleString()}`],
      ['等級', 'LEVEL', world.player.level, n => `Lv ${n}`],
      ['終極武器', 'ULTIMATE', st.ults, n => `×${n}`],
    ];
    if (win && st.clearTime > 0) rows.splice(1, 0, ['最終波用時', 'FINAL WAVE', Math.round(st.clearTime - RUN_SECONDS), n => `${n}s`]);
    const dl = $('#endStats');
    dl.innerHTML = rows.map(([k, en]) => `<div class="row"><dt>${k}<small>${en}</small></dt><dd></dd></div>`).join('');
    dl.querySelectorAll<HTMLElement>('dd').forEach((dd, i) => countUp(dd, rows[i][2], rows[i][3], 0.25 + i * 0.08, 0.7));
    countUp($('#endScore'), score, n => n.toLocaleString(), 0.2, 1.4);
    const ups = UPGRADES.filter(u => (world.upgradeLevels[u.id] ?? 0) > 0);
    $('#endUps').innerHTML = ups.length
      ? ups.map(u => `<span class="chip">${u.icon} ${u.name} <b>Lv${world.upgradeLevels[u.id]}</b></span>`).join('')
      : '<span class="chip">—</span>';
    $('#finish').classList.remove('on');
    end.classList.remove('hidden');
    void end.offsetWidth;
    end.classList.add('entering');
  };

  let lastCombo = 0;
  const handleEvents = () => {
    for (const e of world.events) {
      gr.onEvent(e);
      switch (e.type) {
        case 'bolt':
          sfx.play('shot');
          break;
        case 'nova':
          sfx.play('freeze');
          break;
        case 'holeStart':
          sfx.play('hole');
          break;
        case 'holeEnd':
          sfx.play('bigboom');
          if (e.n >= 40) hud.toast(`黑洞吸入 ${e.n} 隻`, 1.2);
          break;
        case 'beamStart':
          sfx.play('beam');
          break;
        case 'ult':
          sfx.play('ult');
          break;
        case 'ultImpact':
          sfx.play('bigboom');
          break;
        case 'ultPulse':
          sfx.play('boom');
          break;
        case 'dash':
          sfx.play('dash');
          break;
        case 'hurt':
          sfx.play('hurt');
          break;
        case 'levelup':
          if (params.auto || params.bot) sfx.play('level');
          break;
        case 'surge':
          hud.showBanner(`⚠ ${world.stage.horde}來襲！`, 'warn', 2.2);
          sfx.play('alarm');
          break;
        case 'mutant':
          hud.showBanner(`⚠ ${world.stage.boss}出現！`, 'warn', 2.4);
          sfx.play('alarm');
          break;
        case 'mutantDown':
          if (world.finale === 'run') hud.showBanner(`${world.stage.boss} 擊倒！`, 'chain big', 1.8);
          sfx.play('bigboom');
          break;
        case 'finalWave':
          hud.showBanner(`⚠ 最終波！${world.stage.bossPlural} ×${e.count}`, 'warn', 3);
          sfx.play('alarm');
          break;
        case 'finish':
          $('#finish').classList.add('on');
          sfx.play('bigboom');
          sfx.play('chain');
          break;
        case 'chainEnd':
          hud.chainBanner(e.count);
          if (e.count >= 50) sfx.play('chain');
          break;
        case 'gameover':
          break;
      }
    }
    world.events.length = 0;
    // 連鎖擊殺音：音高隨 CHAIN 遞升
    const combo = world.stats.combo;
    if (combo > lastCombo) sfx.play('pop', combo);
    lastCombo = combo;
    for (let i = 0; i < world.fx.count; i++) {
      const k = world.fx.kind[i];
      if (k === FX_BURST || k === FX_PLAGUE) {
        sfx.play('boom');
        break;
      }
    }
  };

  let last = performance.now();
  let acc = 0;
  const frame = (now: number) => {
    // 先排下一幀：單幀例外只會掉一幀，不會讓整個迴圈停掉
    requestAnimationFrame(frame);
    // rAF 時間戳可能早於上一次 performance.now()，負值會讓衰減變成增長
    const frameMs = Math.max(0, Math.min(100, now - last));
    last = now;
    const dt = frameMs / 1000;
    let simMs = 0;
    let steps = 0;
    const portrait = coarse && window.innerHeight > window.innerWidth;

    if (state === 'playing' && !portrait) {
      if (world.hitStop > 0) world.hitStop -= dt;
      else {
        acc += dt;
        const t0 = performance.now();
        while (acc >= FIXED_STEP && steps < 4) {
          if (params.bot) botInput(world, input);
          else input.sample();
          world.step(input);
          input.consumeEdges();
          acc -= FIXED_STEP;
          steps++;
          if (world.pendingLevels > 0 || world.over) {
            acc = 0;
            break;
          }
        }
        if (steps >= 4) acc = 0; // 跟不上就丟掉積壓，避免螺旋式卡頓
        simMs = performance.now() - t0;
      }
      handleEvents();
      if (world.over) showEnd();
      else if (world.pendingLevels > 0 && !hud.levelOpen) {
        state = 'levelup';
        hud.openLevelUp(world, onPick);
      }
    }

    const playing = state === 'playing' && !portrait;
    if (state === 'title' || state === 'stages' || state === 'select') return;
    const t1 = performance.now();
    gr.consume(world);
    gr.render(world, playing ? acc / FIXED_STEP : 1, playing ? dt : 0);
    const renderMs = performance.now() - t1;
    hud.update(world, dt);
    perf.sample({ frameMs, simMs, renderMs, steps }, world, { tier, particles: gr.particleCount, view: `${gr.viewW}×${gr.viewH} ×${gr.zoom}`, renderer: gr.rendererName }, playing);
  };
  debug.frame = frame;
  requestAnimationFrame(frame);
}

boot().catch(e => {
  console.error('啟動失敗', e);
  document.body.insertAdjacentHTML('beforeend', `<pre style="position:fixed;inset:auto 0 0 0;z-index:99;color:#f88;background:#000;padding:8px;white-space:pre-wrap">啟動失敗：${String(e)}</pre>`);
});
