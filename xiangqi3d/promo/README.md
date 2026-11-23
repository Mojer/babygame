# Q 版象棋王國 形象影片（30 秒）

參考《戰車世界》2024 年度預告的風格：暗色電影調色、火星與霧、機械翻牌標題、車庫打光陣列、粗體大字卡＋英文小標、科技樹光柱、結尾徽章。120 BPM、60 拍 = 30 秒，1920×1080 60fps。3D 畫面直接用遊戲的 `Board`／`Terrain`／`PieceView`（pieces.glb），配樂是 `audio.py` 用 numpy 合成的原創曲（太鼓、braam、低音弦樂頑固音型、D 小調五聲音階主旋律、古箏感撥弦、銅鑼）。

| 拍 | 鏡頭 | 內容 |
|---|---|---|
| 0–8 | 開場 | 霧中低角度：紅帥背影望向對岸，再轉到帥的正面；字卡「千年棋局」「烽煙再起」 |
| 8–14 | 翻牌 | 機械翻牌逐字翻出「楚河漢界」，第 12 拍 braam 出現「一盤棋　一個王國」 |
| 14–24 | 全員集結 | 暗場光柱，紅方七兵種每拍點亮一位（由外向內，最後是帥）；第 20 拍字卡「七大兵種／全員集結」 |
| 24–34 | 戰鬥 | 俥沿 a 路衝鋒吃卒（第 29 拍衝擊＋慢動作），炮隔山打馬（第 33 拍）；第 30 拍字卡「一步吃子／一場戰鬥」 |
| 34–42 | 電腦對戰 | 三根光柱升起：兵＝簡單、傌＝普通、帥＝困難；第 38 拍字卡 |
| 42–50 | 教學 | 白天俯視棋盤，傌的可走格亮起並連跳吃兩個卒；圖鑑小卡「走『日』字」；第 46 拍字卡 |
| 50–54 | 將軍 | 俥逼近黑將，第 51.5 拍靜音，第 52 拍黑白衝擊格「將軍！」 |
| 54–60 | 片尾 | 銅鑼，標題 Logo、「立即開戰」、副標，淡出 |

## 重做步驟

```bash
python3 audio.py          # → out/soundtrack.wav
```

1. 啟動 `.claude/launch.json` 的 `xiangqi3d`（Vite，5240）和 `xiangqipromo-sink`（5241）
2. 預覽：`http://localhost:5240/promo/?beat=29`（播放鍵會同步音樂）
3. 靜幀檢查：`sh shoot.sh snaps 2,21,29.3` → `out/snaps/`，`sh sheet.sh` 拼成 `out/sheet.jpg`
4. 輸出畫格：`sh shoot.sh render` → `out/frames/0000–1799.png`（headless Chrome，約 10 分鐘）；中途卡住就跑 `python3 resume.py`，會從缺的那格續畫、卡住自動重開 Chrome（它用 5242 的 sink：`node server.mjs 5242`）。畫格約 5 GB，先確認磁碟空間
5. `sh build.sh` → `out/xiangqi-kingdom-brand-film-1080p60.mp4`

改時間點就改 `score.json` 的 events，`main.ts` 和 `audio.py` 都讀同一份。
