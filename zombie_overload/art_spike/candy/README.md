# 03 糖果夢境 / Candy Dreamland

2048×2048、3/4 斜俯視的雲上糖果戰場。沿用十分鐘生存與最終 Boss 波，具獨立碰撞／路線、雲朵地面、糖霜道路、彩虹門、彩虹糖、糖果屋、棒棒糖樹、杯子蛋糕、拐杖糖與餅乾橋。

怪物為棒棒糖怪、鮮豔藍粉棉花糖怪、橙色軟糖熊、大眼餅乾怪，以及身上有拐杖糖和彩色巧克力碎粒的巧克力熔岩 Boss。各 8 格動作，沿用程式局部關節變形烘焙；不是 AI 影片。原圖由內建 `image_gen` 生成（`art_source: host_image`），提示詞為同目錄的 `*-prompt.txt`，圖片雜湊／尺寸與動作來源見 `provenance.json`。

## v2：地面與動作修正

地面改用 `cloud-ground-source-v2.png` 的整張連續雲朵原圖（內建 `image_gen`，提示詞 `cloud-ground-prompt-v2.txt`），由 `bake_ground.py` 在同一張底圖上疊加柔邊糖霜聯集遮罩。道路交叉、中央廣場與糖果屋底座使用相同材質，不再鋪鏡射小地磚、方形餅乾底座或另一種邊框地磚。`ground-v2.png` 為實際完整地表，遊戲讀取其 2048×2048 JPEG `public/sprites/candy-ground-v2.jpg`；地圖預覽也用同一張地表。碰撞與路線不變。

肢體影格加大關節位移；`src/render/candyMotion.ts` 依遊戲模擬時間持續播放，讓怪物被擠住時仍有動作，各有踏步、漂浮、彈跳、擠壓與重踏節奏。每隻怪錯開相位，受擊維持當前動作並染色；凍結仍使用固定冰凍姿勢，暫停遊戲不前進動畫。`tests/candy-motion.test.ts` 驗證完整八格、動作幅度、個體錯拍與暫停穩定性。

`motion-review.html` 使用正式圖集、Pixi 粒子容器與同一套動作函式；`motion-runtime-v2.gif` 為瀏覽器截圖序列，不是 AI 影片。`motion-proof-v2/timing.json` 留存擷取時間，`animation/runtime-motion-v2.json` 為程式參數紀錄。`gameplay-v2.jpg` 為修正後戰鬥截圖。

## 素材與重建

- `enemies-source-v2.png`：正式怪物母圖；`enemy-bands.json` 為透明間隔內的切分位置，無切到角色。初版 `enemies-source.png` 留作來源紀錄。
- `environment-source.png`：地磚母圖；中心紋理經不重複端點的鏡射拼接，處理成可重複 128px 地磚，`terrain/terrain-bundle.json` 為 pass、零 warnings；這些舊地磚僅保留為來源紀錄，v2 地表不再鋪用。
- `props-source.png`：獨立生成的正式場景物件。以 `prop-source-boxes.json` 的實測範圍重新留白，產出 `props-layout.png`；`props-final/prop-pack.json` 為 pass、8 個接受、零 warnings。先前 `props/` 初稿已由此取代。
- `cover-source.png` → `public/covers/candy-cover-v1.jpg`：專用選關封面。
- `map-layout.json`：正式 `src/sim/mapCandy.ts` 的 seed 42 快照。
- `pack_candy.py`：將五怪的母圖縮至 28／32／36／30／66px，產出動作／受擊／冰凍／倒地與物件圖集，所有關卡共用一張 1024×2048 GPU 紋理。
- `animation/review.png`、`animation/motion-preview.gif`：實際影格預覽；`animation/qa.json` 驗證五組各 8 格不同、固定畫布及透明邊界，pass。

先建全部舊關素材時，依序執行 `python art_spike/japan/pack_japan.py`、`python art_spike/candy/pack_candy.py`，避免日本關卡打包覆蓋糖果關卡。只更新糖果可直接執行後者。需要 Python 3.10+、Pillow、numpy。最後 `python tools/collect_artwork.py` 同步 `artwork/`，並 `npm run build` 更新首頁使用的 `dist/`。

## 驗證

v2 建置與 30 項測試通過。正式建置進入戰鬥及五怪動作頁經瀏覽器檢查，沒有 console errors。

- `map_bundle.py validate`：pass、零 warnings；`map_nav.py check`：六處地標可達、零不可達口袋、零薄縫。
- `scene-snapshot.json`：與預覽相同的 `map-runtime.mjs` 逐 tick 行走六條路線，全部 `ok: true`。
- `preview/preview.html`：可遊玩地圖預覽。已組裝，未呼叫該工具的 headless `--verify`；路線由同一 runtime 的 Node 驗證，正式遊戲另經瀏覽器進入戰鬥檢查。
- `tests/stages.test.ts`：三組 seed 全場可達、出生區、封閉邊界、彩虹中央通行／柱腳阻擋，以及巧克力 Boss 最終波勝利結算。
- 桌面、390×844 直向與 844×390 橫向選關檢查；沒有測量實體手機效能。

初稿診斷（已由正式物件來源取代）：`props/prop-pack.json` 的 `edge_touch` 提示原文 `props touch a cell edge (possible clipping): ['candyhouse', 'rainbowarch', 'lollipoptree', 'cupcaketower']`。正式物件已重生並重新留白，`props-final` 無此問題。

環境診斷 `doctor.json`：`deps.scipy` WARN：`not installed; needed for faster labelling and keying (forge_core falls back to numpy)`；使用 numpy fallback 完成。無影片生成設定，因此沿用既有程式動畫；不影響遊玩。
