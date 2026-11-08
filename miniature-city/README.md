# 小日子城市 · Miniature Living City

以 Three.js + Vite 製作的程序生成桌上城市，無外部 3D 模型與貼圖。

## 執行

```bash
npm install
npm run dev
```

開啟終端顯示的本機網址。正式版本：`npm run build`；預覽產物：`npm run preview`。
建議 Node.js 22.12 以上。

寶貝遊戲首頁透過 `./miniature-city/dist/` 開啟城市。資源採相對路徑，支援 GitHub Pages 子目錄；修改原始碼後請執行 `npm run build`，並一併提交 `dist/` 建置產物。

## 操作

- 拖曳旋轉、滾輪或雙指縮放；點選建築開啟資訊。
- 白天、黃昏與夜晚切換；列車、噴泉、交通、燈光可個別控制。
- 直升機自動盤旋、進場、降落、停留 8 秒再起飛；停機坪位於森之住宅屋頂，一輪約 66 秒。
- 生活步調調整列車、交通、噴泉與直升機動畫速度；暫停時光停止城市動畫。
- 環城漫遊自動旋轉鏡頭；回到全景重設鏡頭。
- 複製場景設定輸出 JSON，含相機座標及動畫狀態。
- 手機右上方按鈕展開控制面板。

## 結構

- `src/world/CityGenerator.js`：固定種子城市、道路、街道家具與配置。
- `src/objects/BuildingFactory.js`：五種建築外觀與實例化窗戶。
- `src/objects/TreeFactory.js`：80 棵實例化低多邊形樹木。
- `src/objects/Fountain.js`：粒子拋物線噴泉。
- `src/transport/`：封閉曲線高架軌道、三節列車、街道交通與直升機飛行循環。
- `src/objects/Helipad.js`：屋頂停機坪、H 字標記與導引燈。
- `src/main.js`：場景、SSAO、光線、互動與動畫迴圈。

共 16 棟建築、80 棵樹、14 輛汽車、一座噴泉與一列三節列車。行動裝置停用 SSAO，像素倍率上限 1.75。需支援 WebGL 2。字型使用 Google Fonts；離線時回退至系統字型。此版本為視覺模擬，汽車沿固定環線行駛，未包含路口號誌或行人 AI。
