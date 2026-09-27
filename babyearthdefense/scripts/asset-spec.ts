// 由 src/game/assets.ts 產生 ASSET_SPEC.md：pnpm spec
import { writeFileSync } from 'node:fs';
import { ASSETS } from '../src/game/assets.ts';

const groups = [...new Set(ASSETS.map(a => a.group))];
const rows = (group: string) => ASSETS.filter(a => a.group === group).map(a => {
  const sheet = a.frames > 1 ? `${a.width * a.frames}×${a.height}（${a.frames} 幀 × ${a.width}×${a.height}）` : `${a.width}×${a.height}`;
  const anim = a.frames > 1 ? (a.fps ? `${a.fps} fps・${a.loop ? '循環' : '單次'}` : '造型變體（非動畫）') : '—';
  return `| \`${a.file}\` | ${a.name} | ${sheet} | ${anim} | ${a.blend === 'add' ? '疊加發光' : '一般'} | ${a.notes} |`;
}).join('\n');

const md = `# 寶寶地球保衛戰：美術資產規格

> 此檔由 \`src/game/assets.ts\` 自動產生（\`pnpm spec\`），修改規格請改該檔再重新產生。

## 通用規則

- **基準畫面 1080×1920（直式 9:16）**，所有尺寸都是在這個畫面上的 **1:1 實際像素**，不需再另出 @2x。
- **交檔位置**：\`babyearthdefense/src/assets/\`，**檔名必須與下表完全一致**。放入後重新整理即自動取代佔位圖；缺哪張就用哪張的佔位圖，可分批交。
- **格式**：除 \`bg_space.jpg\` 外皆為 **透明背景 PNG（RGBA）**，sRGB。
- **Sprite sheet**：多幀資產請把各幀 **由左到右排成一橫排**，每幀尺寸相同、無間距、無外框；總寬 = 單幀寬 × 幀數。
- **置中**：角色主體置中於每一幀，各幀之間位置不可飄移（否則播放時會抖動）。
- **方向**：會旋轉的物件（戰機、子彈、Boss 觸手眼球）一律 **朝右（0°）** 繪製；敵人本體正面繪製、不旋轉。
- **碰撞半徑**：下表寫明的碰撞半徑是遊戲判定用，主體輪廓請貼近該圓；外圈可多留光暈，但別超出幀邊界。
- **「疊加發光」資產**以 ADD 混合繪製：黑色＝透明、越亮越發光。適合子彈、爆炸、光暈；可以直接用黑底或透明底。
- **受擊閃白、染色、縮放、旋轉、淡入淡出**由程式處理，不需另畫。
- **風格**：未來科技、霓虹光。背景要暗，敵人與子彈要亮、輪廓清楚，縮在手機上仍能一眼辨識。
- **預覽方式**：\`pnpm dev\` 後開 \`http://127.0.0.1:5188/\`；網址加 \`?boss\` 可直接進 Boss 戰。

${groups.map(g => `## ${g}

| 檔名 | 名稱 | 尺寸（px） | 動畫 | 混合 | 說明 |
|---|---|---|---|---|---|
${rows(g)}`).join('\n\n')}

## 程式繪製的 Motion Graphic（不需出圖，可提供配色建議）

這些元素全部以向量即時繪製、跟著音樂節拍（140 BPM）脈動，換美術時不受影響。若想改顏色或風格，告訴我色碼即可。

| 元素 | 目前設計 | 目前配色 |
|---|---|---|
| 極座標網格 | 地球外圍同心圓 + 24 條放射線，緩慢旋轉，每拍變亮 | 一般 #39c6ff／Boss #ff4fd8 |
| 雷達掃描 | 每小節繞一圈的扇形光束 | 同上 |
| 超空間流光 | 由內往外飛的光線，速度隨連擊數與 Boss 戰加快 | #bff0ff／Boss #ff7ae6 |
| 節拍波紋 | 每拍從軌道往外擴散的圓環，重拍多一圈白環 | 同網格 |
| 軌道刻度 | 軌道外 48 格刻度，長刻度隨拍子伸長 | 同網格 |
| 雷電鏈 | 閃爍的鋸齒閃電（三層：外暈、電光、白芯），節點爆亮 | #3a9bff／#9ae6ff／白 |
| 貫穿雷射 | 三層光束 + 往外流動的箭形記號 + 砲口光環 | #ff3bd0／#7fe8ff／白 |
| 連鎖爆破 | 擴散圓環 + 外圍刻痕，顏色隨連鎖層數由金轉紫 | #ffd35a → #ff6b4a → #e04dff → #6fd8ff |
| 擊破環 | 敵人爆炸時的擴散細環 | 依敵人顏色 |
| Boss 觸手 | 本體連到眼球的霓虹曲線，會擺動，亮線隨拍閃爍 | #2a1640／#6b2f9a／#ff5ce0 |
| 橫幅標題 | 武器取得、CHAIN ×N、COMBO 里程碑：斜條紋掃入 + 文字擦入（HTML/CSS） | 依武器色 |
| 危險條紋 | Boss 警報時上下滾動的紅黑斜紋 | #ff3b5c |
| HUD | 分數、護盾條、Boss 血條、武器面板、炸彈鈕（HTML/CSS），隨拍發光 | #39c6ff |

若要把 HUD 換成美術框，請另出 UI 圖（護盾框、炸彈按鈕、武器面板、Logo），再討論整合。

## 音樂與音效

**目前的音樂與音效全部由程式即時合成**（WebAudio），會依戰況自動切換段落，畫面的節拍特效也由音樂時鐘驅動。若之後要換成作曲家的正式配樂，請遵守：

- **140 BPM、4/4 拍**，每段為 **8 小節的整數倍**，頭尾可無縫循環（畫面脈動依 140 BPM 計算）。
- 需要以下段落，切換發生在小節線上：

| 檔名 | 段落 | 情緒 |
|---|---|---|
| \`bgm_menu.mp3\` | 標題畫面 | 輕柔、期待，無鼓或只有輕鼓 |
| \`bgm_wave.mp3\` | 一般波次 | 刺激、四拍踩鼓、貝斯推進 |
| \`bgm_break.mp3\` | 波次之間（約 2 秒，可只用 1 小節） | 鼓減弱、蓄力 |
| \`bgm_warning.mp3\` | Boss 警報（2 小節） | 警報聲 + 上升音效 |
| \`bgm_boss.mp3\` | Boss 戰 | 更重的鼓組、失真貝斯、小調 |
| \`bgm_exposed.mp3\` | Boss 弱點暴露 | Boss 段 + 主旋律，最高潮 |
| \`bgm_win.mp3\` / \`bgm_lose.mp3\` | 結算（不循環） | 勝利和弦／下行收尾 |

- 音效（可選，沒有就沿用合成音）：\`sfx_explode_small\`、\`sfx_explode_big\`、\`sfx_chain\`、\`sfx_nova\`、\`sfx_laser_loop\`（可循環）、\`sfx_earth_hit\`、\`sfx_stun\`、\`sfx_bomb\`、\`sfx_pickup\`，mp3 或 ogg，單檔 < 1 秒（雷射循環除外）。
- 目前擊破音會依連擊數沿 **A 小調五聲音階**往上爬，連鎖消滅聽起來像一段旋律；如果換成音效檔，建議保留這個設計（提供 A 調音高的音效即可，程式負責變調）。
`;

writeFileSync(new URL('../ASSET_SPEC.md', import.meta.url), md);
console.log(`ASSET_SPEC.md: ${ASSETS.length} assets`);
