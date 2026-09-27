// 美術資產清單：同時是載入表、佔位圖產生器與規格文件（ASSET_SPEC.md）的單一來源。
// 正式美術放進 src/assets/<file> 即自動取代佔位圖；找不到檔案時使用下方程式繪製的佔位圖。

export interface AssetSpec {
  key: string;
  file: string;
  /** 單幀尺寸（px），以 1080×1920 基準畫面 1:1 繪製。 */
  width: number;
  height: number;
  /** 幀數；>1 時為橫向排列的 sprite sheet（總寬 = width × frames）。 */
  frames: number;
  fps?: number;
  loop?: boolean;
  /** 渲染混合模式；add 代表疊加發光，黑色背景會變透明感。 */
  blend?: 'normal' | 'add';
  group: string;
  name: string;
  notes: string;
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number, frames: number) => void;
}

const TAU = Math.PI * 2;

function glow(ctx: CanvasRenderingContext2D, color: string, blur: number) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string | CanvasGradient) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

function label(ctx: CanvasRenderingContext2D, text: string, w: number, h: number) {
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff55';
  ctx.font = `600 ${Math.max(9, Math.round(w / 12))}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(text, w / 2, h - 6);
  ctx.restore();
}

export const ASSETS: AssetSpec[] = [
  // ─── 場景 ─────────────────────────────────────────────
  {
    key: 'bg_space', file: 'bg_space.jpg', width: 1440, height: 2560, frames: 1,
    group: '場景', name: '太空背景',
    notes: '不透明 JPG。畫面中心對齊地球；手機比例不同時會裁切邊緣，重要元素放在中央 1080×1920 內。整體偏暗、低飽和，避免與敵人搶辨識度；中央不要放亮星雲。',
    paint(ctx, w, h) {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * .7);
      g.addColorStop(0, '#0b1a36'); g.addColorStop(.6, '#060b1d'); g.addColorStop(1, '#02040c');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const n = ctx.createRadialGradient(w * .78, h * .22, 0, w * .78, h * .22, w * .5);
      n.addColorStop(0, '#3a2a8a55'); n.addColorStop(1, '#0000');
      ctx.fillStyle = n; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#1d3b6a33'; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    }
  },
  {
    key: 'bg_stars', file: 'bg_stars.png', width: 1024, height: 1024, frames: 1, blend: 'add',
    group: '場景', name: '星空視差層',
    notes: '透明 PNG，必須四邊無縫循環（會平鋪並緩慢捲動做視差）。只放小星點，亮度適中。',
    paint(ctx, w, h) {
      let s = 7;
      const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 220; i++) {
        const size = r() < .9 ? 1 + r() * 1.5 : 2.5 + r() * 2;
        disc(ctx, r() * w, r() * h, size, `rgba(${180 + r() * 75},${200 + r() * 55},255,${.3 + r() * .7})`);
      }
    }
  },
  {
    key: 'asteroid', file: 'asteroid.png', width: 160, height: 160, frames: 4,
    group: '場景', name: '裝飾隕石（4 種造型）',
    notes: '透明 PNG，4 幀是 4 種不同造型（非動畫），程式會隨機挑選並緩慢旋轉漂移。純裝飾、無碰撞，顏色要暗，不能像敵人。',
    paint(ctx, w, h, f) {
      ctx.translate(w / 2, h / 2);
      ctx.beginPath();
      const pts = 9 + f;
      for (let i = 0; i < pts; i++) {
        const a = (i / pts) * TAU;
        const rr = w * (.32 + .1 * Math.sin(i * 2.7 + f * 1.3));
        i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fillStyle = '#1b1e2b'; ctx.fill();
      ctx.strokeStyle = '#2f5b8c88'; ctx.lineWidth = 3; ctx.stroke();
    }
  },
  {
    key: 'earth', file: 'earth.png', width: 320, height: 320, frames: 1,
    group: '地球', name: '地球本體',
    notes: '透明 PNG。星球直徑 280px（碰撞半徑 140），置中，四周留 20px。只畫地表與海洋，雲層與大氣光暈分開繪製。',
    paint(ctx, w, h) {
      const g = ctx.createRadialGradient(w * .4, h * .38, 10, w / 2, h / 2, 140);
      g.addColorStop(0, '#5fb6ff'); g.addColorStop(.7, '#1f5fb8'); g.addColorStop(1, '#0b2a66');
      disc(ctx, w / 2, h / 2, 140, g);
      ctx.fillStyle = '#3f9a5a';
      for (const [x, y, rx, ry] of [[-40, -30, 50, 34], [45, 20, 38, 52], [-20, 60, 30, 18]]) {
        ctx.beginPath(); ctx.ellipse(w / 2 + x, h / 2 + y, rx, ry, .4, 0, TAU); ctx.fill();
      }
    }
  },
  {
    key: 'earth_clouds', file: 'earth_clouds.png', width: 320, height: 320, frames: 1,
    group: '地球', name: '地球雲層',
    notes: '透明 PNG，疊在地球上方並緩慢自轉（程式旋轉，約 60 秒一圈）。雲只能在直徑 280px 的圓內，必須可 360° 旋轉而不穿幫（不要畫明暗面）。',
    paint(ctx, w, h) {
      ctx.save();
      ctx.beginPath(); ctx.arc(w / 2, h / 2, 138, 0, TAU); ctx.clip();
      ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 10; ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath(); ctx.arc(w / 2, h / 2, 40 + i * 16, i * 1.1, i * 1.1 + .9); ctx.stroke();
      }
      ctx.restore();
    }
  },
  {
    key: 'earth_atmo', file: 'earth_atmo.png', width: 420, height: 420, frames: 1, blend: 'add',
    group: '地球', name: '地球大氣光暈／護盾',
    notes: '透明 PNG，疊加發光（黑底即透明）。環繞地球的藍色光暈，受擊時程式會閃亮並放大。內圈半徑約 140px 對齊地球邊緣。',
    paint(ctx, w, h) {
      const g = ctx.createRadialGradient(w / 2, h / 2, 128, w / 2, h / 2, 205);
      g.addColorStop(0, '#6fd8ff00'); g.addColorStop(.15, '#6fd8ffcc'); g.addColorStop(1, '#1a6cff00');
      disc(ctx, w / 2, h / 2, 205, g);
    }
  },
  {
    key: 'orbit_ring', file: 'orbit_ring.png', width: 560, height: 560, frames: 1, blend: 'add',
    group: '地球', name: '公轉軌道環',
    notes: '透明 PNG，疊加發光。戰機軌道半徑 230px（直徑 460），圓環線條應落在此處；可含科技刻度與節點（如示意圖）。程式會緩慢旋轉，需可 360° 旋轉。',
    paint(ctx, w, h) {
      glow(ctx, '#39c6ff', 14);
      ctx.strokeStyle = '#39c6ffbb'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, 230, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#39c6ff55'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, 214, .3, 2.6); ctx.stroke();
      ctx.beginPath(); ctx.arc(w / 2, h / 2, 214, 3.4, 5.8); ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = i * TAU / 4 + TAU / 8;
        ctx.strokeStyle = '#9ae6ff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(w / 2 + Math.cos(a) * 230, h / 2 + Math.sin(a) * 230, 10, 0, TAU); ctx.stroke();
      }
    }
  },

  // ─── 玩家 ─────────────────────────────────────────────
  {
    key: 'player_ship', file: 'player_ship.png', width: 112, height: 112, frames: 2, fps: 16, loop: true,
    group: '玩家', name: '戰機',
    notes: '透明 PNG，2 幀引擎火焰閃爍循環。**機頭朝右（0°）**，程式會旋轉讓機頭永遠朝向外太空。碰撞半徑 34px，機身主體約 80px。',
    paint(ctx, w, h, f) {
      ctx.translate(w / 2, h / 2);
      glow(ctx, '#ffb347', 16);
      ctx.fillStyle = f ? '#ffd27a' : '#ff8a3d';
      ctx.beginPath(); ctx.moveTo(-26, -8); ctx.lineTo(-44 - f * 8, 0); ctx.lineTo(-26, 8); ctx.fill();
      glow(ctx, '#7fd8ff', 12);
      ctx.fillStyle = '#dff4ff';
      ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(-24, -30); ctx.lineTo(-14, 0); ctx.lineTo(-24, 30); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2d8cff';
      ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(-4, -7); ctx.lineTo(-4, 7); ctx.fill();
    }
  },
  {
    key: 'player_bullet', file: 'player_bullet.png', width: 56, height: 20, frames: 1, blend: 'add',
    group: '玩家', name: '戰機子彈',
    notes: '透明 PNG，疊加發光。**朝右**的能量彈，程式依飛行方向旋轉。',
    paint(ctx, w, h) {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#ff6a0000'); g.addColorStop(.7, '#ffb347'); g.addColorStop(1, '#fff3c4');
      glow(ctx, '#ff9a3d', 8);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w / 2 - 4, h / 2 - 5, 0, 0, TAU); ctx.fill();
    }
  },

  // ─── 敵人 ─────────────────────────────────────────────
  {
    key: 'chomper', file: 'chomper.png', width: 120, height: 120, frames: 4, fps: 8, loop: true,
    group: '敵人', name: '紅色大嘴怪（衝鋒型）',
    notes: '透明 PNG，4 幀咬合循環（閉→半開→全開→半開）。**正面、不旋轉**。碰撞半徑 44px（身體直徑約 88px），外圈留光暈空間。受擊閃白由程式處理。',
    paint(ctx, w, h, f) {
      const open = [0, .5, 1, .5][f];
      glow(ctx, '#ff2b4a', 18);
      const g = ctx.createRadialGradient(w * .42, h * .38, 6, w / 2, h / 2, 44);
      g.addColorStop(0, '#ff7a8a'); g.addColorStop(1, '#b3001e');
      disc(ctx, w / 2, h / 2, 44, g);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1a0006';
      ctx.beginPath(); ctx.ellipse(w / 2, h / 2 + 8, 26, 6 + open * 16, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(w / 2 + i * 9 - 4, h / 2 + 2 - open * 14); ctx.lineTo(w / 2 + i * 9 + 4, h / 2 + 2 - open * 14); ctx.lineTo(w / 2 + i * 9, h / 2 + 10 - open * 10); ctx.fill();
      }
    }
  },
  {
    key: 'eyeball', file: 'eyeball.png', width: 120, height: 120, frames: 4, fps: 6, loop: true,
    group: '敵人', name: '多眼怪（射擊型）',
    notes: '透明 PNG，4 幀（眼睛轉動／眨眼循環）。正面、不旋轉。碰撞半徑 46px。會停在離地球約 400px 處繞圈並發射子彈；被擊破會分裂成 2 隻小多眼怪。',
    paint(ctx, w, h, f) {
      glow(ctx, '#bfe3ff', 14);
      disc(ctx, w / 2, h / 2, 46, '#f4f7fb');
      ctx.shadowBlur = 0;
      const look = [[0, 0], [4, 0], [0, 3], [-4, 0]][f];
      for (const [x, y, r] of [[-18, -16, 11], [16, -18, 10], [0, 8, 13], [-22, 16, 8], [22, 14, 9]]) {
        disc(ctx, w / 2 + x, h / 2 + y, r, '#1b1d2a');
        disc(ctx, w / 2 + x + look[0] * r / 12, h / 2 + y + look[1] * r / 12 - 2, r * .35, '#fff');
      }
    }
  },
  {
    key: 'eyeball_mini', file: 'eyeball_mini.png', width: 64, height: 64, frames: 2, fps: 6, loop: true,
    group: '敵人', name: '小多眼怪（分裂體）',
    notes: '透明 PNG，2 幀循環。與多眼怪同造型的縮小版，碰撞半徑 24px。',
    paint(ctx, w, h, f) {
      glow(ctx, '#bfe3ff', 10);
      disc(ctx, w / 2, h / 2, 24, '#eef3fa');
      ctx.shadowBlur = 0;
      for (const [x, y, r] of [[-8, -6, 6], [8, -5, 5], [0, 8, 6]]) {
        disc(ctx, w / 2 + x, h / 2 + y, r, '#1b1d2a');
        disc(ctx, w / 2 + x + (f ? 2 : -1), h / 2 + y - 1, r * .35, '#fff');
      }
    }
  },
  {
    key: 'enemy_bullet', file: 'enemy_bullet.png', width: 40, height: 40, frames: 2, fps: 10, loop: true, blend: 'add',
    group: '敵人', name: '敵方子彈',
    notes: '透明 PNG，疊加發光，2 幀脈動。圓形（不旋轉），碰撞半徑約 14px。顏色要與玩家子彈明顯不同（建議洋紅／紫）。玩家可擊落。',
    paint(ctx, w, h, f) {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 18);
      g.addColorStop(0, '#ffffff'); g.addColorStop(.35, f ? '#ff5cf0' : '#d04bff'); g.addColorStop(1, '#8a2be200');
      disc(ctx, w / 2, h / 2, 18, g);
    }
  },

  // ─── Boss ─────────────────────────────────────────────
  {
    key: 'boss_body', file: 'boss_body.png', width: 440, height: 440, frames: 8, fps: 10, loop: true,
    group: 'Boss', name: 'Boss 本體（閉嘴／護盾狀態）',
    notes: '透明 PNG，8 幀蠕動循環。**不含觸手末端的眼球**（眼球是獨立可擊破物件）；可保留觸手根部短短一截。本體碰撞半徑 150px。嘴巴緊閉、看起來堅硬（此階段子彈會被彈開）。',
    paint(ctx, w, h, f) {
      const pulse = Math.sin(f / 8 * TAU) * 6;
      glow(ctx, '#c24dff', 30);
      const g = ctx.createRadialGradient(w * .42, h * .4, 20, w / 2, h / 2, 150 + pulse);
      g.addColorStop(0, '#5b3a86'); g.addColorStop(1, '#1d0f33');
      disc(ctx, w / 2, h / 2, 150 + pulse, g);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ff4fd8'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(w / 2 - 90, h / 2 + 30); ctx.quadraticCurveTo(w / 2, h / 2 + 60 + pulse, w / 2 + 90, h / 2 + 30); ctx.stroke();
      ctx.fillStyle = '#f5e6d0';
      for (let i = -4; i <= 4; i++) {
        const x = w / 2 + i * 20, y = h / 2 + 34 + (1 - Math.abs(i) / 5) * 22 + pulse / 2;
        ctx.beginPath(); ctx.moveTo(x - 7, y - 4); ctx.lineTo(x + 7, y - 4); ctx.lineTo(x, y + 14); ctx.fill();
      }
      disc(ctx, w / 2 - 60, h / 2 - 50, 16, '#ff3b6b');
      disc(ctx, w / 2 + 50, h / 2 - 64, 12, '#ff3b6b');
      label(ctx, 'BOSS', w, h);
    }
  },
  {
    key: 'boss_open', file: 'boss_open.png', width: 440, height: 440, frames: 4, fps: 8, loop: true,
    group: 'Boss', name: 'Boss 本體（張嘴／弱點暴露）',
    notes: '透明 PNG，4 幀循環。所有觸手眼球被打掉後切換到此狀態約 9 秒：嘴巴大張、露出發光核心（玩家瞄準的弱點）。構圖、位置與 boss_body 對齊，切換時不跳動。',
    paint(ctx, w, h, f) {
      const pulse = Math.sin(f / 4 * TAU) * 8;
      glow(ctx, '#ff3b6b', 34);
      const g = ctx.createRadialGradient(w * .42, h * .4, 20, w / 2, h / 2, 150);
      g.addColorStop(0, '#5b3a86'); g.addColorStop(1, '#1d0f33');
      disc(ctx, w / 2, h / 2, 150, g);
      ctx.shadowBlur = 0;
      disc(ctx, w / 2, h / 2 + 20, 96, '#3a0512');
      const core = ctx.createRadialGradient(w / 2, h / 2 + 20, 0, w / 2, h / 2 + 20, 50 + pulse);
      core.addColorStop(0, '#ffffff'); core.addColorStop(.3, '#ff3b6b'); core.addColorStop(1, '#ff3b6b00');
      disc(ctx, w / 2, h / 2 + 20, 50 + pulse, core);
      ctx.fillStyle = '#f5e6d0';
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * TAU, x = w / 2 + Math.cos(a) * 92, y = h / 2 + 20 + Math.sin(a) * 92;
        ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
        ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.lineTo(0, 26); ctx.fill(); ctx.restore();
      }
      label(ctx, 'CORE', w, h);
    }
  },
  {
    key: 'boss_pod', file: 'boss_pod.png', width: 104, height: 104, frames: 2, fps: 6, loop: true,
    group: 'Boss', name: 'Boss 觸手眼球（弱點砲台）',
    notes: '透明 PNG，2 幀（紅眼光芒脈動）。**爪子／開口朝右（0°）＝遠離 Boss 本體的方向**，程式會旋轉。碰撞半徑 36px。8 顆繞著本體轉，會發射子彈；全部擊破後 Boss 張嘴。',
    paint(ctx, w, h, f) {
      ctx.translate(w / 2, h / 2);
      glow(ctx, '#ff2b4a', 18);
      disc(ctx, 0, 0, 34, '#2a1f33');
      ctx.strokeStyle = '#ff4fd8'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.stroke();
      disc(ctx, 4, 0, 16 + f * 3, '#ff2b4a');
      disc(ctx, 4, 0, 6, '#fff');
      ctx.fillStyle = '#e7d7c9';
      for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(24, s * 22); ctx.quadraticCurveTo(46, s * 18, 44, s * 4); ctx.lineTo(30, s * 14); ctx.fill();
      }
    }
  },

  // ─── 道具 ─────────────────────────────────────────────
  {
    key: 'pickups', file: 'pickups.png', width: 88, height: 88, frames: 6,
    group: '道具', name: '道具膠囊（6 種）',
    notes: '透明 PNG，6 幀為 6 種道具（非動畫），順序固定：① 散射彈 ② 雷電鏈 ③ 貫穿雷射 ④ 連鎖爆破 ⑤ 護盾修復 ⑥ 炸彈 +1。程式會加上浮動、閃爍與節拍縮放。建議配色：散射橘、雷電冰藍、雷射洋紅、爆破金、修復綠、炸彈藍白。一眼可分辨是重點。',
    paint(ctx, w, h, f) {
      const color = ['#ffb347', '#9ae6ff', '#ff4fd0', '#ffd35a', '#4dffb5', '#6fb8ff'][f];
      ctx.translate(w / 2, h / 2);
      glow(ctx, color, 16);
      ctx.strokeStyle = color; ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = i * TAU / 6; i ? ctx.lineTo(Math.cos(a) * 32, Math.sin(a) * 32) : ctx.moveTo(32, 0); }
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = color; ctx.font = '900 28px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(['W', 'ϟ', '|', '✺', '+', 'B'][f], 0, 2);
    }
  },

  // ─── 特效 ─────────────────────────────────────────────
  {
    key: 'fx_explosion', file: 'fx_explosion.png', width: 200, height: 200, frames: 8, fps: 24, loop: false, blend: 'add',
    group: '特效', name: '爆炸',
    notes: '透明 PNG，疊加發光（建議黑底繪製再去背，或直接黑底）。8 幀單次播放。敵人被擊破時使用，程式會依敵人大小縮放、並依類型染色。',
    paint(ctx, w, h, f, n) {
      const t = f / (n - 1);
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, 30 + t * 64);
      g.addColorStop(0, `rgba(255,255,255,${1 - t})`); g.addColorStop(.4, `rgba(255,170,60,${.9 - t * .8})`); g.addColorStop(1, 'rgba(255,60,40,0)');
      disc(ctx, w / 2, h / 2, 30 + t * 64, g);
      ctx.strokeStyle = `rgba(255,220,160,${.8 - t * .8})`; ctx.lineWidth = 6 - t * 5;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, 20 + t * 76, 0, TAU); ctx.stroke();
    }
  },
  {
    key: 'fx_hit', file: 'fx_hit.png', width: 64, height: 64, frames: 4, fps: 30, loop: false, blend: 'add',
    group: '特效', name: '命中火花',
    notes: '透明 PNG，疊加發光，4 幀單次播放。子彈打中但未擊破、或被 Boss 彈開時使用。',
    paint(ctx, w, h, f) {
      ctx.translate(w / 2, h / 2);
      ctx.strokeStyle = `rgba(255,240,200,${1 - f * .22})`; ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const a = i * TAU / 6 + f * .2, r0 = 4 + f * 5, r1 = 12 + f * 7;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke();
      }
    }
  },
  {
    key: 'fx_spark', file: 'fx_spark.png', width: 24, height: 24, frames: 1, blend: 'add',
    group: '特效', name: '粒子光點',
    notes: '透明 PNG，疊加發光。白色柔邊圓點，粒子系統會染色並大量使用（爆炸碎屑、引擎尾焰）。',
    paint(ctx, w, h) {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, '#ffffff'); g.addColorStop(.4, '#ffffffaa'); g.addColorStop(1, '#ffffff00');
      disc(ctx, w / 2, h / 2, w / 2, g);
    }
  },
  {
    key: 'fx_shockwave', file: 'fx_shockwave.png', width: 512, height: 512, frames: 1, blend: 'add',
    group: '特效', name: '炸彈衝擊波',
    notes: '透明 PNG，疊加發光。單張圓環，施放炸彈時程式會從地球放大到全螢幕並淡出。',
    paint(ctx, w, h) {
      const g = ctx.createRadialGradient(w / 2, h / 2, w * .36, w / 2, h / 2, w / 2);
      g.addColorStop(0, '#6fd8ff00'); g.addColorStop(.6, '#bff0ffee'); g.addColorStop(1, '#6fd8ff00');
      disc(ctx, w / 2, h / 2, w / 2, g);
    }
  }
];

export function paintPlaceholder(spec: AssetSpec) {
  const canvas = document.createElement('canvas');
  canvas.width = spec.width * spec.frames;
  canvas.height = spec.height;
  const ctx = canvas.getContext('2d')!;
  for (let frame = 0; frame < spec.frames; frame++) {
    ctx.save();
    ctx.translate(frame * spec.width, 0);
    ctx.beginPath(); ctx.rect(0, 0, spec.width, spec.height); ctx.clip();
    spec.paint(ctx, spec.width, spec.height, frame, spec.frames);
    ctx.restore();
  }
  return canvas;
}
