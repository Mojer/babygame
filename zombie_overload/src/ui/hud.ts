import { CHAIN, RUN_SECONDS } from '../sim/content';
import type { Upgrade } from '../sim/upgrades';
import type { World } from '../sim/world';

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;

/** HTML HUD：遊戲世界與 UI 分開縮放，UI 永遠以 CSS 像素排版。只在數值改變時寫 DOM。 */
export class Hud {
  private readonly hpFill = $('#hp i');
  private readonly hpText = $('#hp span');
  private readonly lv = $('#lv');
  private readonly xpFill = $('#xp i');
  private readonly timer = $('#timer');
  private readonly kills = $('#kills');
  private readonly chain = $('#chain');
  private readonly chainNum = $('#chain span');
  private readonly banner = $('#banner');
  private readonly ult = $('#ult');
  private readonly dash = $('#dash');
  private readonly levelup = $('#levelup');
  private readonly cards = $('#levelup .cards');
  private readonly toastEl = $('#toast');
  private last = { hp: -1, maxHp: -1, lv: -1, xp: -1, sec: -1, kills: -1, combo: -1, ult: -1, dash: -1, final: -1 };
  private chainHold = 0;
  private bannerT = 0;
  private toastT = 0;
  private choosing: Upgrade[] = [];

  update(w: World, dt: number) {
    const p = w.player;
    const L = this.last;
    const hp = Math.ceil(Math.max(0, p.hp));
    if (hp !== L.hp || p.maxHp !== L.maxHp) {
      L.hp = hp;
      L.maxHp = p.maxHp;
      this.hpFill.style.transform = `scaleX(${hp / p.maxHp})`;
      this.hpText.textContent = `${hp} / ${p.maxHp}`;
      this.hpFill.parentElement!.classList.toggle('low', hp / p.maxHp < 0.3);
    }
    if (p.level !== L.lv) {
      L.lv = p.level;
      this.lv.textContent = `Lv ${p.level}`;
    }
    const xp = Math.floor((p.xp / p.xpNext) * 200);
    if (xp !== L.xp) {
      L.xp = xp;
      this.xpFill.style.transform = `scaleX(${xp / 200})`;
    }
    const sec = Math.floor(w.time);
    if (w.finale !== 'run') {
      // 最終波：計時改成剩餘巨大變異體數
      const left = w.finale === 'final' ? w.finalLeft : 0;
      if (left !== L.final) {
        L.final = left;
        this.timer.innerHTML = w.finale === 'final' ? `<b class="final-tag">FINAL</b> 巨大變異體 ×${left}` : '<b class="final-tag">CLEAR</b>';
        this.timer.classList.add('final');
      }
    } else if (sec !== L.sec) {
      L.sec = sec;
      const left = Math.max(0, RUN_SECONDS - sec);
      this.timer.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
      this.timer.title = `剩餘 ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    }
    if (w.stats.kills !== L.kills) {
      L.kills = w.stats.kills;
      this.kills.textContent = `☠ ${w.stats.kills.toLocaleString()}`;
    }
    const combo = w.stats.combo;
    if (combo >= 5) {
      this.chainHold = 1.1;
      if (combo !== L.combo) {
        L.combo = combo;
        this.chainNum.textContent = String(combo);
        this.chain.className = `on ${combo >= 500 ? 'mega' : combo >= 100 ? 'big' : ''}`;
        this.chain.style.setProperty('--s', String(1 + Math.min(0.9, Math.log10(combo) * 0.25)));
        this.chain.classList.remove('pop');
        void this.chain.offsetWidth;
        this.chain.classList.add('pop');
      }
    } else if (this.chainHold > 0 && (this.chainHold -= dt) <= 0) {
      this.chain.className = '';
      L.combo = -1;
    }
    const ult = Math.floor(p.ult * 100);
    if (ult !== L.ult) {
      L.ult = ult;
      this.ult.style.setProperty('--p', `${ult}%`);
      this.ult.classList.toggle('ready', ult >= 100);
    }
    const dash = p.dashCd > 0 ? 1 : 0;
    if (dash !== L.dash) {
      L.dash = dash;
      this.dash.classList.toggle('cooldown', dash === 1);
    }
    if (this.bannerT > 0 && (this.bannerT -= dt) <= 0) this.banner.className = '';
    if (this.toastT > 0 && (this.toastT -= dt) <= 0) this.toastEl.className = '';
  }

  showBanner(text: string, cls = '', time = 2) {
    this.banner.textContent = text;
    this.banner.className = `on ${cls}`;
    this.bannerT = time;
  }

  toast(text: string, time = 2.5) {
    this.toastEl.textContent = text;
    this.toastEl.className = 'on';
    this.toastT = time;
  }

  chainBanner(count: number) {
    if (count < CHAIN.bannerMin) return;
    const cls = count >= 500 ? 'mega' : count >= 100 ? 'big' : '';
    this.showBanner(`CHAIN ×${count}！`, `chain ${cls}`, count >= 100 ? 2.2 : 1.4);
  }

  get levelOpen() {
    return this.choosing.length > 0;
  }

  openLevelUp(w: World, onPick: (id: string) => void) {
    this.choosing = w.rollChoices();
    this.cards.innerHTML = '';
    this.choosing.forEach((u, i) => {
      const lvl = w.upgradeLevels[u.id] ?? 0;
      const b = document.createElement('button');
      b.className = 'card';
      b.innerHTML = `<span class="key">${i + 1}</span><span class="icon">${u.icon}</span><b>${u.name}</b><small>${Number.isFinite(u.max) ? `Lv ${lvl} → ${lvl + 1} / ${u.max}` : ''}</small><p>${u.desc}</p>`;
      b.addEventListener('click', () => this.pick(i, onPick));
      this.cards.appendChild(b);
    });
    this.levelup.classList.remove('hidden');
  }

  pick(i: number, onPick: (id: string) => void) {
    const u = this.choosing[i];
    if (!u) return;
    this.choosing = [];
    this.levelup.classList.add('hidden');
    onPick(u.id);
  }
}
