# 第一關重製素材 v1

檔案檢查：角色 1448 × 1086，具有 alpha 通道；背景 1672 × 941，無 alpha。障礙圖 1536 × 1024，修正後仍無 alpha，棋盤格是圖片內容，不能當成已去背素材使用，需再處理。角色左右腿交換與影格尺度也需進一步校正。

生成方式：內建 image_gen。原始圖片保留於 stuff 原分類資料夾。

這批是重製來源素材，尚未驗收為可直接載入的遊戲資產。角色需切格、統一腳底基準及檢查循環；街景尚未拆視差層、驗證無縫接合；障礙需檢查透明背景、切圖與縮放。

## girl-run-sheet-v1.png

參考：characters/d89f758f-945a-40db-9667-e9975c6ad64c.png

Use case: stylized-concept. Generate a production-oriented 2D side-scroller running sprite sheet based on the reference girl's exact character design: long dark brown-black hair, straight bangs, pink white-collar polo, gray pleated suspender skirt, pink backpack, black socks, beige sneakers WITHOUT logos. Cute detailed crisp pixel art, limited palette, no smooth painted gradients. Exactly EIGHT full-body frames in a strict 4 columns by 2 rows equal-cell layout, transparent background, no text, no borders, no ground shadows. Every frame faces RIGHT in true side view. Consistent character size and identical local foot baseline, each frame centered with generous transparent gutters so hair and limbs never cross cells. Eight successive run-cycle phases, alternating left/right leading legs with clear contact, recoil, passing, flight poses. Keep face, clothing, backpack and proportions identical in every frame. All figures fully contained. This is a usable sprite source sheet, not an illustrated presentation board.

## residential-background-v1.png

參考：ui/f88c7b77-89b1-45eb-9969-e528e50520d2.png

Use case: stylized-concept. Create a clean wide 16:9 background plate for a cute pixel-art side-scrolling school commute game, using the reference ONLY for Taiwanese neighborhood architecture, warm morning palette and detailed pixel style. Orthographic straight-on side elevation, no perspective road receding into distance. Cream low-rise homes, red brick garden walls, roll-up shutter, blue door, tiled eaves, quiet breakfast-shop facade with NO text, green shrubs, distant pale rooftops and blue morning sky. Crisp consistent pixel clusters. Keep the bottom 25 percent a simple unobstructed horizontal sidewalk band with a single straight level walking surface; nothing protrudes into the walking lane. Buildings form a continuous street across the width. NO characters, no interface, no buttons, no hearts, no progress bar, no collectibles, no obstacles, no vehicles, no school endpoint, no foreground foliage, no text or watermark. Background environment plate only, visually calm enough for a pink-clothed player to stand out.

## obstacle-sheet-v1.png

參考：backgrounds/cf4f2e5c-f875-43fb-804b-637586d8837c.png

Use case: stylized-concept. Rebuild the reference's obstacle art into a clean 2D side-scroller asset sheet. Cute detailed crisp pixel art, restrained warm palette matching the reference. Transparent background, exactly SIX isolated assets arranged in 3 columns by 2 rows equal cells with generous empty gutters. Top row: small round stone flowerpot with compact green plant and pink flowers; orange white-striped traffic cone; shallow blue puddle viewed from low side angle. Bottom row: small taped cardboard box without writing; black-and-white football; horizontal low tree branch with a small cluster of green leaves attached to a short trunk segment at far right. All assets individually separated, full silhouettes visible, no overlap, no clipping. Side-view game perspective, consistent pixel density. No labels, no banners, no typography, no character, no decorative board, no floor, no drop shadow beyond asset, no watermark. Clear compact collision-readable silhouettes.
 
## 障礙圖背景修正提示

Edit this exact six-object sheet: remove ALL black background and colored background glow, replacing every background pixel with genuine transparent alpha. Keep the six pixel-art objects, their positions, shapes, colors, and sizes unchanged. Hard clean sprite silhouettes. No shadows, no ambient glow, no opaque backdrop, no checkerboard painted into image. Output transparent PNG.
