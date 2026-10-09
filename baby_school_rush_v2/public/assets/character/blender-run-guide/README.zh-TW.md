# Blender 跑步動作姿勢導引 V1

這套素材由 Blender 5.2.2 LTS 產生，目的是提供 Image 2.5 明確、穩定且左右
相位正確的人體跑步姿勢。Blender 負責動作，Image 2.5 只負責依姿勢重繪女學生。

## 檔案

- `schoolgirl_run_pose_guide_v1.blend`：可編輯的 Blender 動畫原檔
- `run_pose_preview.gif`：循環動作預覽
- `run_pose_overview.jpg`：八個姿勢總覽
- `run_01_contact_l.png` 至 `run_08_up_r.png`：1024 × 1024 透明 PNG
- `pose-manifest.json`：影格、姿勢與用途的結構化資料

## 動作時間軸

```text
Frame 00  Contact L
Frame 02  Down L
Frame 04  Passing L
Frame 06  Up L
Frame 08  Contact R
Frame 10  Down R
Frame 12  Passing R
Frame 14  Up R
Frame 16  回到 Contact L
```

## 動作設計限制

- 嚴格右側視圖
- 正交相機
- Root X 固定
- 地面線固定
- 左右腳相位互換
- 手臂與腿反向擺動
- Contact／Down 支撐腳接地
- Passing 時擺動腳通過骨盆下方
- Up 時骨盆最高，擺動膝向前

## 給 Image 2.5 的使用方式

一次只處理一張姿勢，不要把八張一起要求模型重繪。每次提供：

1. 女學生 Setup Pose，作為身份、制服和畫風參考。
2. 一張 Blender Pose Guide，作為姿勢與人體比例參考。
3. 前一張已確認的角色影格，作為連續性參考；第一張可省略。

建議提示詞：

```text
保持女學生參考圖的臉、髮型、制服、書包、鞋子、身體比例、色彩與畫風。
嚴格套用 Blender 姿勢圖的頭部、肩膀、手肘、骨盆、膝蓋、腳踝與腳底位置。
保持右側視圖，角色面向右方，完整身體，不裁切，透明背景。
不要自行改變左右手腳，不要加入動態模糊、速度線、文字或場景。
```

## 重繪後的檢查

- 八張圖的頭部大小一致。
- 骨盆位於同一條垂直軸。
- Contact 和 Down 的腳底沒有上下浮動。
- 左右腳、左右手沒有被模型畫反。
- 制服、裙褶、書包與鞋子沒有逐格變形。
- 每張圖片畫布、角色比例與透明邊緣一致。

所有姿勢通過檢查後，才可依序組成遊戲 Sprite Sheet。
