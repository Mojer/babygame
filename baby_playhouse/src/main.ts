import './style.css';
import { CHARACTERS } from './config';
import { unlockAudio } from './core/audio';
import { Game } from './game';

const app = document.querySelector<HTMLDivElement>('#app')!;

const hud = document.createElement('div');
hud.className = 'hud';
hud.innerHTML = `
  <a class="back" href="../../index.html" aria-label="回選單">🏠</a>
  <div class="cast" role="toolbar" aria-label="選角色">
    ${CHARACTERS.map((c) => `<button data-key="${c.key}" aria-label="${c.label}" aria-pressed="false">${c.icon}</button>`).join('')}
  </div>
  <div class="toast" role="status"></div>
`;
document.body.appendChild(hud);

const loading = document.createElement('div');
loading.className = 'loading';
loading.textContent = '遊樂場開門中… 0%';
document.body.appendChild(loading);

const toastEl = hud.querySelector<HTMLDivElement>('.toast')!;
let toastTimer = 0;

const game = new Game(app, {
  onSelect(key) {
    hud.querySelectorAll<HTMLButtonElement>('.cast button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.key === key));
    });
  },
  onPortraits(urls) {
    hud.querySelectorAll<HTMLButtonElement>('.cast button').forEach((b) => {
      const url = urls[b.dataset.key!];
      if (url) b.innerHTML = `<img src="${url}" alt="" draggable="false" />`;
    });
  },
  toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('show'), 2200);
  },
});

if (import.meta.env.DEV) (window as unknown as { game: Game }).game = game;

hud.querySelectorAll<HTMLButtonElement>('.cast button').forEach((b) => {
  b.addEventListener('click', () => {
    unlockAudio();
    game.selectKey(b.dataset.key!);
  });
});

game
  .load((k) => (loading.textContent = `遊樂場開門中… ${Math.round(k * 100)}%`))
  .then(() => {
    loading.classList.add('done');
    setTimeout(() => loading.remove(), 500);
  })
  .catch((err) => {
    console.error(err);
    loading.textContent = '載入失敗，請重新整理 🙏';
  });
