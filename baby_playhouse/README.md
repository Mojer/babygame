# Baby Playhouse（寶貝遊樂場）

45° 俯視的 3D 娃娃屋沙盒。Web 端預計使用 Three.js + Vite + TypeScript。

## 目錄

```
art/
  scripts/     Blender 建模與匯出腳本（可重複執行）
    pb_lib.py        共用工具：色票貼圖、基本形狀、匯出
    build_cafe.py    建立咖啡廳場景與熊貓、兔兔、貓咪
    build_bathroom.py 建立浴室場景
    build_living.py  建立迎賓客廳
    build_lawn.py    建立室外草坪（遊戲起點）
    build_ballpit.py 建立球池房間
    build_farm.py    建立開心農場（從咖啡廳西門進入）
    build_capybara.py 建立卡比巴拉園長
    build_akane.py   建立小茜（依角色設定圖）
    build_yu.py      建立小宇（依角色設定圖）
    export_all.py    存 .blend，並匯出目前場景的 room_*.glb（有角色時也匯出 char_*.glb）
  blender/     .blend 原始檔
  textures/    palette.png（全遊戲共用色票）
  export/      Blender 直接匯出的 GLB（未壓縮）
public/models/ 壓縮後、給遊戲載入的 GLB
```

## 房間地圖

```
[開心農場]──[咖啡廳]──[浴室]
                │
           [迎賓客廳]──[球池房間]
                │
           [室外草坪]  ← 起點
```

新房間用 `pb_lib.room_shell()` 建外殼，用 `doors={'N': x, 'S': x, 'W': y, 'E': y}` 在指定位置開門。
開在北牆和西牆（全高牆）的門會自動加門框，並露出門後房間的顏色。

## 重建流程

1. 在 Blender 的 Scripting 分頁執行 `art/scripts/build_cafe.py` 或 `build_bathroom.py`
2. 執行 `art/scripts/export_all.py`（每個房間各做一次）
3. 壓縮（需要 Node 18 以上；關閉合併和清理，否則 `INT_` / `SNAP_` 等節點會被合併或刪掉）：
   ```bash
   for f in art/export/*.glb; do npx -y -p @gltf-transform/cli@4 gltf-transform optimize "$f" "public/models/$(basename $f)" --compress draco --texture-compress webp --join false --flatten false --instance false --simplify false --prune false; done
   ```

## 網頁版

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # 輸出到 dist/，選單連結 ./baby_playhouse/dist/
```

需要 Node 18 以上。`src/` 結構：

| 檔案 | 用途 |
|---|---|
| `game.ts` | 渲染器、鏡頭（45° 跟隨、滾輪/雙指縮放）、點擊判定、互動行為 |
| `scene/room.ts` | 載入房間 GLB，依照命名規則建立互動物件、定位點、門和走路網格 |
| `systems/navgrid.ts` | 從上方往下射線烘焙可走網格，A* 尋路加路徑平滑 |
| `entities/character.ts` | 角色的程式動畫：走路搖擺、呼吸、眨眼、跳上椅子、開心跳 |
| `systems/critters.ts` | 小鳥（飛進來、在草地上走、被點或有人走近就飛走）和小雞 |
| `systems/playground.ts` | 會動的遊具：超大球滾動與碰撞、鞦韆擺盪、蹦床彈跳 |
| `systems/fx.ts` | 星星、愛心、音符、蒸氣粒子，以及點擊漣漪和果凍彈跳 |
| `core/audio.ts` | 用 WebAudio 合成所有音效 |
| `core/music.ts` | 背景音樂 `public/audio/play-house-garden.mp3`（128 kbps；192 kbps 母帶放在 `art/audio/`，不進 git）：第一次點擊後淡入、循環播放，右上角 🎵 可開關（會記住） |
| `config.ts` | 角色（含對話台詞）、房間、起始房間、開場白 |
| `ui/bubbles.ts` | 角色頭上的對話框（HTML，跟著角色移動） |

新增互動物件時，只要在 Blender 取 `INT_` 開頭的名字，並加上 `action`，程式會自動抓到它。
名稱以同樣前綴開頭的零件會自動歸成一組；前綴對不上的，加到 `room.ts` 的 `ALIASES`。
目前支援的 `action`：
- 咖啡廳：`sit`、`brew`、`toggle_lights`、`glow`、`ding`、`eat`、`flicker`
- 浴室：`bath`、`shower`、`wash`、`squeak`、`sparkle`、`bubbles`、`swing`、`toot`
- 客廳：`tv`、`books`、`lamp`、`cuckoo`（其他沿用 `sit`、`eat`、`brew`）
- 草坪：`slide`、`drive`、`rock`、`flowers`、`shake`、`bounce`
- 開心農場：`harvest`（`*_veg_N` 的蔬果依序跳起來）、`bird`、`chick`（小動物，用 `FX_lawn_a/b`、`FX_pen_a/b` 標出活動範圍）
- 球池房間：`ballpit`（泡進球池）、`roll`（超大球，可滾動）、`trampoline`（定位點 `pose: jump`）、`swingseat`（鞦韆，搭配 `FX_swing_axis`）
- 其他值會套用預設的彈跳加星星效果

有 `SNAP_` 定位點的物件都可以坐；定位點的 `pose` 設成 `bath` 時，角色會泡進去。
定位點加上 `align: 1` 時，角色會朝定位點的方向坐（小汽車、搖搖馬），否則面向鏡頭。
溜滑梯使用 `FX_slide_ladder`（梯子下方）和 `FX_slide_0..2`（滑道路徑）。
INT 物件加上 `dynamic: 1` 時不會被烘進走路網格（會移動的東西，例如超大球），改由 `systems/playground.ts` 處理碰撞。
`SPAWN_cast_0..n` 是遊戲開始時角色的站位，依照 `config.ts` 的 `CHARACTERS` 順序排列。
`FX_` 開頭的 Empty 是特效發射點（`fx` 屬性），例如蓮蓬頭和水龍頭的出水位置。
新增房間的步驟：在 `config.ts` 的 `ROOMS` 登記，門的 `to` 填房間名稱，`spawn` 填對方房間的門名稱。

## 美術規格（Q 版）

- 1 Blender 單位 = 1 m，Z 軸朝上（匯出時自動轉成 Y 軸朝上）
- 房間 6×6 m。北牆、西牆為全高牆（1.5 m），南牆、東牆為矮牆（0.25 m）。鏡頭從東南方以 45° 俯視
- 角色 2 頭身，身高約 0.7 m，正面朝 -Y（在 glTF 中為 +Z），原點在腳底
- 家具以角色為基準：椅座 0.30 m、吧台 0.45 m、浴缸邊緣 0.42 m、門寬 1.0–1.2 m
- 材質只用 `M_Palette`（和發光用的 `M_PaletteGlow`）。每個物件的 UV 全部落在一個色塊中心；新增顏色請加到 `pb_lib.PALETTE`

## 命名規則（遊戲讀取 `object.userData`）

| 前綴 | 用途 | Custom Properties |
|---|---|---|
| `INT_` | 可點擊的互動物件 | `action`, `sfx` |
| `SNAP_` | 坐、站、泡澡的定位點（Empty） | `pose`, `owner` |
| `NAV_` | 可行走的地面（遊戲中隱藏） | — |
| `DOOR_` | 房間出入口（Empty） | `to`（房間）, `spawn`（對方的門） |
| `FX_` | 特效發射點（Empty） | `fx` |
| `SPAWN_` | 角色出生點（Empty） | — |
| `COL_` | 阻擋範圍（遊戲中隱藏） | — |
| `CHAR_` | 角色根節點 | `character` |
