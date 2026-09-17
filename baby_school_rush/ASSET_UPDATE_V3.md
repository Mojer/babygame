# V3：橫向、角色尺度與世界分層

## 實作
- 直向顯示旋轉提示並暫停；回到橫向需按繼續，避免在旋轉期間消耗進度。
- 地面、住宅前景、障礙、學校全部使用 screenX = worldX - elapsed × 220。
- 遠景使用獨立圖層與 0.18 倍相機距離，前景不再使用 0.45 倍。
- 學校固定在世界終點，65 秒時校門中心與角色位置相同。兩側有住宅圍牆延伸，共用同一條連續道路。
- 新住宅前景不用左右鏡像；末端按校門起點裁切，校舍兩側延續場景。
- 跑步固定原圖比例 .132；滑行固定 .063；跳躍 .235；到校 .205。依頭部／身體比例校準，而非把每張姿勢壓到指定高度。
- 滑行高度約 50 世界像素，碰撞框 48；低枝下緣 52，站立碰撞框 60。
- Canvas 按視窗與裝置像素比繪製（DPR 上限 2），高解析度插畫縮小時使用線性取樣，移除強制 pixelated CSS 放大。原圖本身不是嚴格低解析度原生像素格，不能宣稱已轉成原生像素動畫。
- 開發環境提供 ?inspect=run / slide / school 靜態視覺檢查，正式建置會移除該檢查入口。

## 新素材與來源
內建 image_gen 生成；原始候選與舊素材保留。
- public/assets/slide-key.png：單腳前伸、另一腳彎曲的滑行姿勢。
- public/assets/front-key.png：可獨立合成的住宅／早餐店／矮牆前景。
- public/assets/school-key.png：可獨立合成的學校／開放校門／矮牆。
生成的透明背景未可靠實現，因此採純洋紅底來源，在遊戲載入時做 chroma-key 合成成透明紋理，原圖不覆寫。

### 滑行提示詞
Generate ONE transparent-background full-body game sprite of the exact girl in the reference, facing RIGHT in strict side view, in a LOW CROUCH SLIDE pose: her RIGHT/front leg stretched STRAIGHT FORWARD horizontally, shoe pointing right; the other leg bent and tucked under her hips. Hips near ground, torso leaning low forward, one hand behind for balance, head upright enough to see forward. Long dark hair streams behind, pink polo white collar, gray pleated suspender skirt, pink backpack, black socks, beige unbranded sneakers. Preserve the same head size relative to torso and limbs as reference. This is a low baseball-style sliding dodge, not a sitting portrait, not kneeling on both knees. Entire silhouette visible, generous clear margin, no ground, no shadow, no motion streaks, no text. Genuine transparent alpha background. Detailed clean pixel-art illustration with fine consistent pixel clusters, no artificial chunky mosaic blocks. Single pose only.

後續背景修正：Keep the girl and pose exactly unchanged. Replace the entire black/glowing backdrop with a perfectly flat SOLID PURE MAGENTA RGB(255,0,255), including every gap outside her silhouette. No shadows, no glow, no gradients, no checkerboard. This is a chroma-key sprite source for a game. Preserve the dark hair and all character details. Use sharp edges and no magenta reflection.

### 前景提示詞
Generate a 3:1 wide 2D side-scroller foreground architecture strip, detailed clean pixel-art matching the reference Taiwanese neighborhood. ONE continuous strip: cream low-rise house, red-brick garden wall with shrubs, breakfast shop with red striped awning, more low garden wall. Orthographic straight-on elevation, no perspective vanishing point. All structure bases sit on one horizontal baseline at 90% image height. Roofs varied, no objects clipped at top. BOTH left and right ends terminate in the SAME low red-brick wall height and color, enabling repeat joins. Absolutely NO sidewalk, NO road, NO ground plane, NO sky, NO distant buildings, NO text, NO characters. Exterior silhouette and all space above rooftops or below the baseline must be perfectly flat PURE MAGENTA #ff00ff for chroma-key compositing. Buildings, trees and walls form a connected silhouette above baseline. No shadows on magenta, no glow. Keep the reference's warm cream, terracotta, gray stone, green foliage palette. This is a foreground sprite strip only, not a complete scenery image.

### 學校提示詞
Generate an isolated Taiwanese elementary school FRONT-ELEVATION architecture sprite for the same detailed pixel art game as reference. Cream school with clock tower, blue windows, open gate centered, low red brick boundary walls extending to BOTH left and right image edges. All wall and gate-column bases at exactly same horizontal baseline. No sidewalk or road, no foreground ground, no perspective courtyard extending downward. Width about 2 times height. Entire school contained with padding above roof, left and right ends terminate in matching low red-brick wall and gray-stone base like reference. All space outside structure, above roofs, through OPEN gate, and below baseline perfectly flat PURE MAGENTA #ff00ff chroma-key backdrop. No sky, no distant scenery, no characters, no text, no shadow on backdrop, no glow. Warm morning lighting, fine pixel-art detail. The school must connect to the supplied street's low brick walls; standalone foreground only.

## 待細修
- 新滑行目前是一張姿勢，完整滑行過渡／落地動畫仍需補。
- 跑步循環仍有生成素材本身的動作差異，固定比例已消除依包圍盒重新縮放造成的跳動。
- 道路繼續使用既有素材的一致地面切片；局部磁磚的重複仍可見。
- 真機高 DPR 與多指觸控仍需手機試玩。

