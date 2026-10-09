# 女學生 Spine 角色元件包 V1

本資料夾包含 27 張已個別裁切、帶透明背景的 RGBA PNG，可作為 Spine
角色附件使用。所有元件均依照已確認的女學生 Setup Pose 美術方向製作。

## 資料夾內容

- `png/`：27 張獨立透明元件
- `components-manifest.json`：檔名、尺寸及來源格資訊
- `components-preview.png`：全部元件的預覽圖
- `source-sheets/`：生圖時使用的純綠背景原始元件板
- `schoolgirl-spine-components-v1.zip`：方便傳送及備份的完整元件包

## 元件分類

### 頭部與頭髮

- `head_base`：完整頭殼、耳朵與頸部連接處，不包含頭髮及表情
- `face`：眼睛、眉毛、鼻線與嘴巴
- `hair_back`：後髮主體
- `hair_front`：前瀏海
- `ponytail_01`：馬尾根部與髮圈
- `ponytail_02`：馬尾尾端

### 軀幹、制服與配件

- `torso`：制服上衣與衣領
- `bow`：胸前蝴蝶結
- `backpack`：書包本體
- `backpack_strap_front`：前側肩帶
- `backpack_strap_rear`：後側肩帶
- `shorts`：安全褲及骨盆區域
- `skirt_front`：前側裙片
- `skirt_back`：後側裙片
- `neck`：頸部與衣領底層

### 手臂

- `arm_front_upper`：前側上臂，包含制服袖子
- `arm_front_lower`：前側前臂
- `hand_front`：前側手掌
- `arm_rear_upper`：後側上臂
- `arm_rear_lower`：後側前臂
- `hand_rear`：後側手掌

### 腿部

- `leg_front_thigh`：前側大腿
- `leg_front_calf`：前側小腿與長襪
- `shoe_front`：前側鞋子
- `leg_rear_thigh`：後側大腿
- `leg_rear_calf`：後側小腿與長襪
- `shoe_rear`：後側鞋子

## 建議繪製順序

由畫面最後方到最前方：

```text
hair_back
ponytail_02
ponytail_01
backpack
backpack_strap_rear
arm_rear_upper
arm_rear_lower
hand_rear
leg_rear_thigh
leg_rear_calf
shoe_rear
skirt_back
torso
shorts
leg_front_thigh
leg_front_calf
shoe_front
skirt_front
arm_front_upper
arm_front_lower
hand_front
neck
head_base
face
hair_front
bow
backpack_strap_front
```

## Spine 匯入與組裝

1. 在 Spine 建立新 Skeleton。
2. 依照 `components-manifest.json` 的名稱建立對應 Slot。
3. 將 `png/` 內的圖片放入 Spine 專案 Images 資料夾。
4. 以 `../setup/schoolgirl-setup-pose-v1.png` 當作組合位置參考。
5. 先放置軀幹、骨盆與頭部，再安裝後側四肢及前側四肢。
6. 後側手腳及 `skirt_back` 放在軀幹後方。
7. 前側手腳及 `skirt_front` 放在軀幹前方。
8. 最後安裝頭髮、書包、肩帶與蝴蝶結。

## 關節旋轉中心

- 上臂：旋轉中心放在袖子內的肩膀重疊區。
- 前臂：旋轉中心放在手肘圓形重疊區。
- 手掌：旋轉中心放在手腕內側。
- 大腿：旋轉中心放在安全褲內的髖關節位置。
- 小腿：旋轉中心放在膝蓋重疊區。
- 鞋子：旋轉中心放在襪子與鞋口交界的腳踝位置。
- 頭部：旋轉中心放在耳朵稍後方、頸部上端。
- 馬尾：旋轉中心放在髮圈中央。

## Mesh 使用建議

第一版只對下列附件建立 Mesh：

- `hair_back`
- `hair_front`
- `ponytail_01`
- `ponytail_02`
- `skirt_front`
- `skirt_back`
- `backpack_strap_front`
- `backpack_strap_rear`

手臂、腿與鞋子先使用一般 Region Attachment，避免初期出現不必要的網格變形。

## 製作跑步動畫前必須檢查

- Setup Pose 的身體比例是否與母版一致。
- 肩膀、手肘、手腕、髖部、膝蓋及腳踝彎曲時是否出現裂縫。
- 前後四肢的繪製順序是否正確。
- 裙子是否能遮住安全褲與大腿接縫。
- 頭髮與馬尾是否能獨立旋轉。
- 書包肩帶是否會穿過胸口或手臂。
- 兩隻腳的 IK Target 是否能穩定踩在同一條地面線上。

## 品質說明

這是一套可供組裝及測試的 **V1 製作草稿**。生圖元件之間可能存在少量像素或
線條差異，因此在輸出正式 Atlas 前，仍需於 Setup Pose 中檢查接縫，必要時補畫
關節重疊區。Setup Pose 尚未通過接縫檢查之前，不應開始製作正式動畫。

## 產生方式

製作時以 Setup Pose PNG 作為唯一角色參考，透過內建圖片生成工具分四組產生：

- 6 個頭部與頭髮元件
- 9 個軀幹、制服及配件元件
- 6 個帶關節重疊區的手臂元件
- 6 個帶關節重疊區的腿部與鞋子元件

原始元件板使用統一的 `#00FF00` 純綠背景，之後再進行去背、邊緣去綠、格線碎片
清理、自動裁切及 RGBA PNG 輸出。
