# V2 製作方法

## 0. 鎖定技術版本

- Phaser `4.2.1`
- `@esotericsoftware/spine-phaser-v4` `4.3.11`
- Spine Editor／export data `4.3.x`
- WebGL renderer

Runtime 4.3.11 使用 Phaser 4.2.1 的 Mesh2D backend。Spine Editor 與 Runtime 必須同步 major／minor；正式整合與散布前確認 Spine Runtime License。

## 1. 原則

AI 負責角色造型探索與零件底稿，不負責直接猜完整連續動畫。正式動畫先建立正確動作，再套角色外觀。

## 2. 角色動畫流程

```text
Character Model Sheet
→ Parts Sheet（補齊遮蔽區域）
→ Blender / Mocap 側視動作參考
→ Spine 2D Rig
→ Run / Fast Run / Rush / Jump / Fall / Slide
→ Hair / Backpack / Skirt Secondary Motion
→ Phaser Runtime 或輸出 Sprite Sheet
```

### 最小拆件

- Head、Face、Hair Front、Hair Back
- Torso、Skirt Front、Skirt Back
- Upper Arm／Forearm／Hand × 2
- Thigh／Shin／Foot × 2
- Backpack、Straps

所有被衣服或頭髮遮住的旋轉接點都必須補畫，Pivot 統一記錄在角色規格表。

### 動作驗收

- 普通 Run：Contact／Down／Passing／Up 左右各一輪。
- Fast Run：前傾 8–12°、步幅與手臂幅度增加。
- Rush：壓低重心、獨立輪廓，不使用普通 Run 單純倍速。
- 固定 Root X；腳底接觸期間不可滑動。
- 頭髮、裙擺、背包在主動作定稿後才加入延遲與回彈。

## 3. Gameplay 製作順序

1. 灰盒物理與兩鍵輸入。
2. Perfect／Combo／RUSH 數值測試。
3. 60–90 秒 Vertical Slice 與三層路線。
4. Character Parts 與第一套 Run Rig。
5. Character、Camera、World、Screen、Audio FX Recipe。
6. 正式關卡、事件、障礙與行動裝置實機測試。

## 4. FX Recipe

Gameplay 只發送語意事件：`jump`、`land`、`perfect`、`hit`、`rush:start`、`rush:end`。

```text
FXDirector
├── CharacterFX  afterimage / stretch / glow
├── CameraFX     kick / shake / follow lag / pull back
├── WorldFX      dust / debris / speed lines
├── ScreenFX     flash / grading / vignette
└── AudioFX      transient / loop layer / recovery
```

所有效果都有強度等級；一般跳躍不能和 RUSH 使用相同視覺預算。
