# Q 版象棋王國 七大兵種影片（58.5 秒）

七大兵種逐一 zoom in，紅黑棋子各佔一半鏡頭（每個兵種 4 拍紅、4 拍黑＝各 2 秒，先後輪替），疊上動態圖像：斜色塊、巨大描邊字、準星鎖定、能力條、走法格、速度線、zoom blur、斜切轉場。120 BPM、117 拍 = 58.5 秒，1920×1080 60fps。3D 直接用遊戲的 `Board`（浮空島＋舊地圖）和 `PieceView`。背景音樂是 `assets-src/Epic Fight.wav`（同為 120 BPM，整首使用），`audio.py` 再疊上 numpy 合成的切鏡／落地／撞擊音效（音色沿用 `../promo/audio.py`）。

| 拍 | 秒 | 鏡頭 | 內容 |
|---|---|---|---|
| 0–6 | 0–3 | 開場 | 帥、將兩顆棋盤從左右逼近，第 6 拍（曲子爆點）相撞 |
| 6–12 | 3–6 | 揭幕 | 高空俯衝浮空島到河界；字卡「楚河漢界」「紅黑兩軍　七大兵種」 |
| 12–60 | 6–30 | 六大兵種 | 兵卒、炮砲、傌馬、俥車、相象、仕士，每種 8 拍：猛推鏡→第 1.25 拍落地→名字砸下、能力條、走法格、慢環繞，第 4 拍斜切換到對方 |
| 60–68 | 30–34 | 帥將 | 曲子第二段進場；帥先登場，第 62 拍裂縫劈開將入場 |
| 68–84 | 34–42 | 交鋒 | 紅炮打黑馬、黑炮打紅馬、紅俥吃卒、黑車吃兵（左右鏡像），每次 4 拍、第 2 拍命中，上方比分 |
| 84–92 | 42–46 | 全軍 | 環繞浮空島，字卡「紅黑對決」 |
| 92–104 | 46–52 | 對峙 | 紅黑兩軍斜分割，第 96 拍 VS，「你站哪一邊？」 |
| 104–117 | 52–58.5 | 片尾 | 銅鑼，帥將棋子落在 Logo 上方，「立即開戰」，隨曲尾淡出 |

## 重做步驟

1. 啟動 `.claude/launch.json` 的 `xiangqi3d`（Vite，5240）和 `xiangqipromo2-sink`（5243）
2. `python3 audio.py` → `out/soundtrack.wav`（`score.json` 的 `music` 指定曲檔與起點偏移）
3. 預覽：`http://localhost:5240/promo2/?beat=14`
4. 靜幀：`sh shoot.sh snaps 13.5,63.6,96.3` → `out/snaps/`，`sh sheet.sh` → `out/sheet.jpg`
5. `sh render_chunks.sh` → `out/xiangqi-kingdom-seven-classes-1080p60.mp4`（每 900 格畫完先轉成片段再刪 PNG，磁碟只需約 3 GB；`resume.py START END` 負責畫一段並在 Chrome 卡住時自動重開）

只改配樂不用重畫：`ffmpeg -i out/xiangqi-kingdom-seven-classes-1080p60.mp4 -i out/soundtrack.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest new.mp4`

時間點改 `score.json`，`main.ts` 和 `audio.py` 讀同一份。
