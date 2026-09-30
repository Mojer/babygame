# 寶貝遊樂場 茜の篇：KIRAKIRA 版（30 秒）

和 `../promo` 同一套拍點系統（128 BPM、64 拍 = 30 秒、兩小節一個鏡頭），舊版完全保留。這一版改了三件事：

1. **小茜換成新角色**：直接載入遊戲的 `public/models/char_akane.glb`（照角色設定圖做的：長直髮、齊瀏海、粉紅 polo、灰色吊帶裙、粉紅書包）。畫面上的強調色改成她衣服的粉紅 `#F2789F`。
2. **普普風圖形**（`kira.ts`）：每個場景兩個角落有漸層網點；關鍵拍點會跳出漫畫爆炸貼紙（例如 KIRA!、咻！、耶！、開！、好香！、啵！、吱！、噗嚕！、YAY!、KIRA☆），貼紙裡填網點；好朋友卡片改成漫畫格，有集中線、網點底和星芒爆炸框；另外每拍都有四角亮晶晶的星星在閃。
3. **KIRAKIRA MV 的彩虹通道，做成可愛版**：開場和片尾是一條往前飛的彩虹圖形通道，每拍穿過一道門（星星、六角、愛心、方形、圓、三角），也有光速線。通道改用粉嫩的早晨配色，門框是紫色描邊 + 彩虹色 + 白色高光。片尾加了跟著節拍左右擺動的七色雷射，而且每拍穿過兩道門，最後一個和弦時慢慢減速。

轉場有三種：彩虹門框（7.5、39.5、55.5 拍）、網點（23.5、47.5 拍），其他沿用星星和愛心。貼紙和轉場的位置、文字都在 `score.json` 的 `pow` 和 `wipe` 事件裡。

配樂沿用 30 秒版的編曲，另外加了貼紙出現時的「啵＋叮」，以及通道裡每穿過一道門的鐵琴閃音。

## 重做步驟

```bash
python3 audio.py                       # → out/soundtrack.wav
```

1. 啟動 `.claude/launch.json` 的 `playhousepromo`（Vite，5212）和 `playhousepromo2-sink`（5214）
2. 預覽：`http://localhost:5212/promo_v2/`（`?beat=12.5` 直接跳到某一拍；在 console 執行 `snap([…])` 會存靜態畫面到 `out/snaps/`）
3. 輸出畫格：`http://localhost:5212/promo_v2/?render` → `out/frames/0000–1799.png`
4. `sh build.sh` → `out/baby-playhouse-akane-kirakira-noblush-1080p.mp4`（上一版有腮紅的是 `baby-playhouse-akane-kirakira-1080p_bk.mp4`）
