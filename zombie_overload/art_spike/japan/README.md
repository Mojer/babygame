# 百鬼夜行素材與驗證

## 專用選關封面

「02 百鬼夜行」使用獨立插畫封面 `public/covers/japan-cover-v2.jpg`：茜與宇在月下神社迎戰河童、天狗、赤鬼、唐傘妖與荒魂巨獸，搭配鳥居、櫻花、燈籠與鬼火。由內建 `image_gen` 生成，以原本都市封面作為畫風／主角參考、妖怪母圖作為敵人外觀參考。原始 PNG 為 `cover-source.png`；目前 v2 為 `cover-source-v2.png`，將右上荒魂巨獸左右反轉，使牠朝向中央。生成提示詞為 `cover-prompt.txt`、修改提示詞為 `cover-flip-prompt.txt`，來源與檔案雜湊為 `cover-provenance.json` 和 `cover-provenance-v2.json`。執行期使用 1536×1024 JPEG；橫向矮螢幕的裁切焦點向下移至 65%，保留主角與妖怪表情。

`japan-preview.png` 保留作為地圖預覽，選關卡片已改用專用封面；`pack_japan.py` 重建地圖素材時不會覆寫這張封面。

美術來源為 Codex 內建 `image_gen`（`art_source: host_image`），共兩次生成：五種妖怪的靜態母圖，以及四種地磚＋八種日式場景物件。沒有呼叫付費 API；工具未提供模型版本或成本，故不推測。完整提示詞存於 `enemies-prompt.txt`、`environment-prompt.txt`；原圖、SHA-256 與尺寸規劃存於 `provenance.json`。

世界 2048×2048，世界單位為美術像素；相機沿用 3/4 斜俯視與整數倍放大。河童／天狗／赤鬼／唐傘妖／荒魂巨獸的身高分別為 26／30／36／30／64px。角色沿用原本跑步素材；妖怪以原生成母圖製作每種 8 格獨立姿勢，動作由程式局部關節變形烘焙（不是 AI 影片）：河童擺臂踏步、天狗振翅、赤鬼擺棍踏步、唐傘妖擺舌跳躍、巨獸擺尾重踏。`animate_yokai.py` 為可重建的動作程式，`animation/motion.json` 記錄關節規格，`animation/review.png` 為影格對照。`animation/qa.json` 驗證五組各 8 格皆不同、畫布一致且透明邊界完整。凍結與黑洞牽引停用跳躍及伸縮，碰撞和排序仍使用腳底世界座標。

地圖與碰撞以 `src/sim/mapJapan.ts` 為正式來源；`map-layout.json` 與 `map-bundle.json` 是 seed 42 的驗證快照。樹冠與鳥居横樑不阻擋移動；碰撞使用樹幹、建築地基與鳥居柱腳。柱腳位置依縮至 120px 的鳥居素材實測，兩柱中心位於門中心左右約 34px。

生成物件經 `generate2dmap/extract_prop_pack.py` 去洋紅底、邊緣去色與切格，正式採用 `props-clean/`。地磚經 `extract_terrain_tiles.py` 面積縮小至 128px 並檢查無縫接合，`terrain/terrain-bundle.json` 為 pass、零 warnings。

`pack_japan.py` 將所有日式敵人、受擊／凍結／倒地變體、場景物件與既有城市角色合併成 `public/sprites/horde_stages.png/.json`，保持同一張 GPU 來源與 y 排序。地磚為 `map_japan.png/.json`，選關圖為 `japan-preview.png`，敵人圖示為 `yokai_0.png` 至 `yokai_4.png`。

使用 Python 3.12 與 Pillow／numpy 打包：

```sh
# 先匯出正式地圖的 seed 42 快照（Node 22）
node --import tsx --input-type=module <<'JS'
import {buildMap} from './src/sim/map.ts';
import {writeFileSync} from 'node:fs';
const map=buildMap(42,'japan');
writeFileSync('art_spike/japan/map-layout.json',JSON.stringify({...map,blocked:Array.from(map.blocked)}));
JS
python art_spike/japan/pack_japan.py
```

驗證：`bundle-report-final.json` 為 pass、零 warnings；`nav-final/nav-report.json` 的六處地標全部可達，零封閉口袋、零窄縫；相同 `map-runtime.mjs` 的逐 tick 行走檢查存於 `scene-snapshot.json`，六條路線均 `ok: true`。地圖預覽為 `preview/preview.html`；預覽頁已組裝，但沒有執行該工具的 headless Chromium `--verify`，路線由 Node 執行同一個 runtime 驗證，正式遊戲另經 Codex 瀏覽器實際操作檢查。

遊戲回歸測試 `tests/stages.test.ts` 驗證三組 seed 的出生區、全場可達性、封閉邊界、鳥居通行／碰撞及最終巨獸波結算。桌面與 844×390 橫向 UI 經瀏覽器檢查；尚未測量真實手機熱降頻效能。

正式素材檢查留下的一項提示（格式／長寬比提示，不是裁切或透明邊錯誤）：

> tall or wide props in a square grid (aspect > 1.6): ['stonelantern 150x311']; generate them one by one or in custom cells, or extract with --auto-boxes

檔案：`props-clean/prop-pack.json`；檢查 `strategy_aspect`，value `['stonelantern 150x311']`，threshold `1.6`。石燈籠原圖長寬比 2.073 > 1.6，本來就是細長造型，已確認完整保留且縮成世界寬 20px。

先前診斷與處理紀錄（已由正式版本取代）：

- `doctor.json`：`python.version` FAIL，Python 3.9.6 < 3.10；改用內建 Python 3.12。`doctor-python312.json` 的 WARN：`deps.scipy`，`not installed; needed for faster labelling and keying (forge_core falls back to numpy)`。實際處理使用 numpy fallback 完成。
- `props/prop-pack.json`：`props dropped more than 1% of their cell's visible pixels (see dropped_components and dropped_area): {'sakura': 0.0146}`；後續以 `--min-component-area 1` 保留櫻花細節。
- 同一初稿的 `tall or wide props in a square grid (aspect > 1.6): ['stonelantern 150x311']; generate them one by one or in custom cells, or extract with --auto-boxes`，原因同正式提示。
- 同一初稿的 `magenta edge fringe above 2% of edge pixels: {'torii': 0.0372, 'sakura': 0.2913, 'stonelantern': 0.0273, 'yatai': 0.0523, 'bamboo': 0.0818, 'komainu': 0.0211, 'bridge': 0.104}; raise --despill-radius`；後續以 `--despill-radius 3` 消除。
- `bundle-report.json` 初稿：`$.nav.cell: nav.cell 16 differs from max(1, round(actorRadius/2)) = 3, which map_nav uses`；正式匯出改為 3，碰撞仍完全採用遊戲的 16px 網格。
