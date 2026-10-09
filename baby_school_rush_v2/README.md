# 上學衝衝衝 V2

獨立於 V1 的高速橫向跑酷 Vertical Slice。Phaser 4.2.1、spine-phaser-v4 4.3.11、TypeScript、Vite。

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

網址加上 `?debug` 會顯示「爆衝 FX」測試按鈕並啟用 X 鍵手動觸發 RUSH；再加 `&at=0.74` 可從關卡 74% 處開跑（平交道事件前）；加 `&art=setup` 會用角色母版取代灰盒角色、顯示實際遊戲內大小與碰撞框，`&h=130` 可調整角色高度（預設 100，單位為 540 高的邏輯座標）。

## 這版驗證什麼

- 兩鍵操作是否能同時支撐跳躍、二段跳、滑行、急降與下穿平台。
- Perfect Dodge、Combo、RUSH 是否形成「冒險貼近障礙」的高手玩法。
- 一般跑、快速跑、RUSH、喘息與事件段落是否能形成速度節奏。
- 上、中、下實體路線是否比固定 Lane Switching 更適合本題材。
- Character／Camera／World／Screen／Audio FX 分層是否能長期擴充。

目前全部角色、障礙與場景皆為程式繪製的灰盒美術。正式資產流程見 `PRODUCTION_PIPELINE.md`。

## Runtime 規格

- Phaser 固定為 `4.2.1`。
- Spine Runtime 固定為 `@esotericsoftware/spine-phaser-v4@4.3.11`。
- 遊戲固定使用 WebGL；正式 Spine mesh、tint black、混合模式與 slot objects 不以 Canvas fallback 驗收。
- Spine Editor 匯出版本必須與 Runtime 的 `4.3` major／minor 一致。
- 正式整合與發佈前須確認團隊持有符合 Spine Runtime License 的 Spine 授權。
