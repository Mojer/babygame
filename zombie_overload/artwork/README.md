# Zombie Overload 圖片素材與生成提示詞

集中整理 124 張圖片、62 份提示詞，包含都市關卡、百鬼夜行、角色、敵人、場景、特效與封面版本。

| 目錄 | 內容 |
|---|---|
| [originals/city](originals/city/) | 都市／共用素材原圖，依封面、角色、敵人、場景、特效分類，保留生成版本與重排圖 |
| [originals/japan](originals/japan/) | 百鬼夜行妖怪、場景，以及封面 v1／巨獸朝左的 v2 原圖 |
| [prompts/city/runs](prompts/city/runs/) | 每次實際生成所用的完整 prompt，與原圖一一對應 |
| [prompts/city/library](prompts/city/library/) | 原本的提示詞庫與造型變體 |
| [prompts/japan](prompts/japan/) | 妖怪、場景、封面生成與巨獸反轉的 prompt |
| [processed/japan](processed/japan/) | 去背場景物件、地磚與妖怪動作影格／規格／檢查 |
| [runtime](runtime/) | 遊戲用 JPG 封面、PNG 圖集、人物頭像、特效與圖集 JSON |
| [previews/japan](previews/japan/) | 地圖預覽與選關畫面的版本紀錄 |

目前使用的百鬼夜行封面是 [japan-cover-v2.jpg](runtime/covers/japan-cover-v2.jpg)，右上巨獸朝向中央。

遊戲讀取 `public/` 和 `src/assets/` 的素材；本目錄為整理後的資料庫。正式素材更新後，可執行 `python3 tools/collect_artwork.py` 同步整理。

[manifest.json](manifest.json) 記錄每個檔案的專案內來源、SHA-256 與原圖對應的 prompt。

圖片處理腳本與導航驗證資料在 [art_spike](../art_spike/)；其他中間影格與人物參考保留於 [proc](../art_spike/proc/) 和 [ref](../art_spike/ref/)。

## 原圖與 prompt 對照

| 原圖 | 生成 prompt |
|---|---|
| [originals/city/characters/akane_cannon-1/generated.png](originals/city/characters/akane_cannon-1/generated.png) | [akane_cannon-1.txt](prompts/city/runs/akane_cannon-1.txt) |
| [originals/city/characters/akane_dirs-1/generated.png](originals/city/characters/akane_dirs-1/generated.png) | [akane_dirs-1.txt](prompts/city/runs/akane_dirs-1.txt) |
| [originals/city/characters/akane_heavy_dirs-1/generated.png](originals/city/characters/akane_heavy_dirs-1/generated.png) | [akane_heavy_dirs-1.txt](prompts/city/runs/akane_heavy_dirs-1.txt) |
| [originals/city/characters/akane_heavy_side-1/generated.png](originals/city/characters/akane_heavy_side-1/generated.png) | [akane_heavy_side-1.txt](prompts/city/runs/akane_heavy_side-1.txt) |
| [originals/city/characters/akane_heavy_side-1/relayout.png](originals/city/characters/akane_heavy_side-1/relayout.png) | [akane_heavy_side-1.txt](prompts/city/runs/akane_heavy_side-1.txt) |
| [originals/city/characters/akane_level_dirs-1/generated.png](originals/city/characters/akane_level_dirs-1/generated.png) | [akane_level_dirs-1.txt](prompts/city/runs/akane_level_dirs-1.txt) |
| [originals/city/characters/akane_level_dirs-1/relayout.png](originals/city/characters/akane_level_dirs-1/relayout.png) | [akane_level_dirs-1.txt](prompts/city/runs/akane_level_dirs-1.txt) |
| [originals/city/characters/akane_level_side-1/generated.png](originals/city/characters/akane_level_side-1/generated.png) | [akane_level_side-1.txt](prompts/city/runs/akane_level_side-1.txt) |
| [originals/city/characters/akane_level_side-1/relayout.png](originals/city/characters/akane_level_side-1/relayout.png) | [akane_level_side-1.txt](prompts/city/runs/akane_level_side-1.txt) |
| [originals/city/characters/akane_run-1/generated.png](originals/city/characters/akane_run-1/generated.png) | [akane_run-1.txt](prompts/city/runs/akane_run-1.txt) |
| [originals/city/characters/akane_sling_dirs-1/generated.png](originals/city/characters/akane_sling_dirs-1/generated.png) | [akane_sling_dirs-1.txt](prompts/city/runs/akane_sling_dirs-1.txt) |
| [originals/city/characters/akane_sling_dirs-1/relayout.png](originals/city/characters/akane_sling_dirs-1/relayout.png) | [akane_sling_dirs-1.txt](prompts/city/runs/akane_sling_dirs-1.txt) |
| [originals/city/characters/akane_sling_side-1/generated.png](originals/city/characters/akane_sling_side-1/generated.png) | [akane_sling_side-1.txt](prompts/city/runs/akane_sling_side-1.txt) |
| [originals/city/characters/akane_sling_side-1/relayout.png](originals/city/characters/akane_sling_side-1/relayout.png) | [akane_sling_side-1.txt](prompts/city/runs/akane_sling_side-1.txt) |
| [originals/city/characters/akane_slingup_dirs-1/generated.png](originals/city/characters/akane_slingup_dirs-1/generated.png) | [akane_slingup_dirs-1.txt](prompts/city/runs/akane_slingup_dirs-1.txt) |
| [originals/city/characters/akane_slingup_dirs-1/relayout.png](originals/city/characters/akane_slingup_dirs-1/relayout.png) | [akane_slingup_dirs-1.txt](prompts/city/runs/akane_slingup_dirs-1.txt) |
| [originals/city/characters/akane_slingup_side-1/generated.png](originals/city/characters/akane_slingup_side-1/generated.png) | [akane_slingup_side-1.txt](prompts/city/runs/akane_slingup_side-1.txt) |
| [originals/city/characters/akane_slingup_side-1/relayout.png](originals/city/characters/akane_slingup_side-1/relayout.png) | [akane_slingup_side-1.txt](prompts/city/runs/akane_slingup_side-1.txt) |
| [originals/city/effects/attacks-1/generated.png](originals/city/effects/attacks-1/generated.png) | [attacks-1.txt](prompts/city/runs/attacks-1.txt) |
| [originals/city/effects/attacks2-1/generated.png](originals/city/effects/attacks2-1/generated.png) | [attacks2-1.txt](prompts/city/runs/attacks2-1.txt) |
| [originals/city/effects/device-1/generated.png](originals/city/effects/device-1/generated.png) | [device-1.txt](prompts/city/runs/device-1.txt) |
| [originals/city/effects/explosion-1/generated.png](originals/city/effects/explosion-1/generated.png) | [explosion-1.txt](prompts/city/runs/explosion-1.txt) |
| [originals/city/environment/facades-1/generated.png](originals/city/environment/facades-1/generated.png) | [facades-1.txt](prompts/city/runs/facades-1.txt) |
| [originals/city/environment/fountain-1/generated.png](originals/city/environment/fountain-1/generated.png) | [fountain-1.txt](prompts/city/runs/fountain-1.txt) |
| [originals/city/covers/keyart-1/generated.png](originals/city/covers/keyart-1/generated.png) | [keyart-1.txt](prompts/city/runs/keyart-1.txt) |
| [originals/city/enemies/mutant-1/generated.png](originals/city/enemies/mutant-1/generated.png) | [mutant-1.txt](prompts/city/runs/mutant-1.txt) |
| [originals/city/characters/player-1/generated.png](originals/city/characters/player-1/generated.png) | [player-1.txt](prompts/city/runs/player-1.txt) |
| [originals/city/characters/portraits-1/generated.png](originals/city/characters/portraits-1/generated.png) | [portraits-1.txt](prompts/city/runs/portraits-1.txt) |
| [originals/city/characters/portraits2-1/generated.png](originals/city/characters/portraits2-1/generated.png) | [portraits2-1.txt](prompts/city/runs/portraits2-1.txt) |
| [originals/city/characters/portraits2-1/relayout.png](originals/city/characters/portraits2-1/relayout.png) | [portraits2-1.txt](prompts/city/runs/portraits2-1.txt) |
| [originals/city/environment/props-1/generated.png](originals/city/environment/props-1/generated.png) | [props-1.txt](prompts/city/runs/props-1.txt) |
| [originals/city/effects/ship-1/generated.png](originals/city/effects/ship-1/generated.png) | [ship-1.txt](prompts/city/runs/ship-1.txt) |
| [originals/city/environment/terrain-1/generated.png](originals/city/environment/terrain-1/generated.png) | [terrain-1.txt](prompts/city/runs/terrain-1.txt) |
| [originals/city/environment/terrain-1/quads/asphalt.png](originals/city/environment/terrain-1/quads/asphalt.png) | [terrain-1.txt](prompts/city/runs/terrain-1.txt) |
| [originals/city/environment/terrain-1/quads/plaza.png](originals/city/environment/terrain-1/quads/plaza.png) | [terrain-1.txt](prompts/city/runs/terrain-1.txt) |
| [originals/city/environment/terrain-1/quads/roof.png](originals/city/environment/terrain-1/quads/roof.png) | [terrain-1.txt](prompts/city/runs/terrain-1.txt) |
| [originals/city/environment/terrain-1/quads/sidewalk.png](originals/city/environment/terrain-1/quads/sidewalk.png) | [terrain-1.txt](prompts/city/runs/terrain-1.txt) |
| [originals/city/characters/yu_dirs-1/generated.png](originals/city/characters/yu_dirs-1/generated.png) | [yu_dirs-1.txt](prompts/city/runs/yu_dirs-1.txt) |
| [originals/city/characters/yu_mg-1/generated.png](originals/city/characters/yu_mg-1/generated.png) | [yu_mg-1.txt](prompts/city/runs/yu_mg-1.txt) |
| [originals/city/characters/yu_run-1/generated.png](originals/city/characters/yu_run-1/generated.png) | [yu_run-1.txt](prompts/city/runs/yu_run-1.txt) |
| [originals/city/enemies/zombies-1/generated.png](originals/city/enemies/zombies-1/generated.png) | [zombies-1.txt](prompts/city/runs/zombies-1.txt) |
| [originals/japan/enemies.png](originals/japan/enemies.png) | [enemies.txt](prompts/japan/enemies.txt) |
| [originals/japan/environment.png](originals/japan/environment.png) | [environment.txt](prompts/japan/environment.txt) |
| [originals/japan/cover-v1.png](originals/japan/cover-v1.png) | [cover.txt](prompts/japan/cover.txt) |
| [originals/japan/cover-v2.png](originals/japan/cover-v2.png) | [cover-flip.txt](prompts/japan/cover-flip.txt) |
