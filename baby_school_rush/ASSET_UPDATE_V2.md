# 滿版介面與第一關素材更新（2026-09-16）

## 本次已接入
- UI 統一置於 `.game-frame`，Canvas 使用 Phaser RESIZE 填滿 `100dvh`，頁面不再捲動。
- 生命與星星在左上、進度在上方、音效／全螢幕／暫停在右上，跳蹲在左右下角。
- 瀏海與底部手勢區使用 safe-area；直向保留至少 640 世界像素寬度，不裁切前方障礙。
- 21–23 秒淡入新公園，35–37 秒回到商街，53–65 秒學校從右側進入；最後校門對齊角色位置。
- 既有透明圖集接入花盆、三角錐、低樹枝；遊戲執行時定義 frame，不更動原始圖。
- 角色影格透明邊緣在載入時校準；新增既有圖集中的跳躍、蹲下與到校姿勢。
- 街景使用交替鏡像拼接，減少邊緣斷裂。此方案仍可能看出對稱，正式版可改用專用無縫圖層。

## 新增圖片
內建 image_gen 生成，參考 `public/assets/street.png`。
- `public/assets/park.png`：公園路段，1672 × 941，不透明背景。
- `public/assets/school.png`：學校入口，1672 × 941，不透明背景。實際生成校門在中央，因此程式按中央定位終點。

### 學校生成提示詞
Create one wide 16:9 game background plate for a Taiwanese elementary-school arrival in a cute detailed pixel-art side-scrolling game. Use the reference image for identical morning palette, pixel density, sidewalk geometry and straight-on elevation. Replace houses with a welcoming cream elementary school, blue windows, central clock tower, terracotta roof, trees, low brick campus wall and an OPEN school entrance centered at 28 percent of image width. NO text or characters. Important layout: sidewalk back edge at 72 percent image height, straight horizontal sidewalk walking lane between 72 and 83 percent height, curb at 83 percent, gray road below. No objects on sidewalk. School architecture entirely above sidewalk, upper quarter open light blue sky. Matching reference lighting. No interface, no labels, no stars, no people, no vehicles. Clean full bleed environment image, no vignette, no borders.

### 公園生成提示詞
Create a wide 16:9 background environment plate for the small-park segment of a Taiwanese school commute pixel-art game. Match the supplied reference's detailed pixel-art style, morning sunshine, camera, palette, and exact horizontal ground geometry. A calm pocket park with green trees, distant cream low-rise homes, shrubs, a green bench safely BEHIND the walking lane, red brick low wall, warm sky. Upper quarter open pale blue sky. Sidewalk back edge at 72 percent image height, flat unobstructed sidewalk between 72 and 83 percent, curb at83 percent, gray road below. Strict side-scrolling straight-on view. All props behind sidewalk. No people, no text, no game UI, no obstacles, no collectibles, no foreground objects. Relaxed readable environment. Full bleed, no borders. Left and right edges should visually join into a continuous park, same ground height.

## 驗證
- 11 個自動測試：6 個遊戲邏輯與 5 個螢幕尺寸。
- 瀏覽器實測 390 × 844、844 × 390：Canvas 和遊戲容器與視窗一致，頁面沒有水平／垂直捲動；按鈕在範圍內。
- 直向完整練習通關、橫向重玩；未觀察到 console error。
- 真實 iOS／Android 的瀏海、瀏覽器工具列和多指同時觸控仍需實機確認。
- 滿版指瀏覽器可用視窗全滿；支援 Fullscreen API 的瀏覽器另顯示全螢幕按鈕。不支援的瀏覽器保留滿視窗介面。

## 下一批素材
1. 真正左右腿交替的八格跑步循環。
2. 完整跳躍／落地與蹲跑動畫（目前使用單張姿勢）。
3. 可獨立捲動的天空、遠景、建築、地面圖層。
4. 到校進門演出，以及雨天商店街與秋日路線。

