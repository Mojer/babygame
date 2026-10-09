# Baby School Rush 小學生女孩模型 v1

已透過目前連線的 Blender DCC-MCP 建立並儲存。這是可供動畫 blocking 的第一版風格化模型；外觀以提供的角色圖為基礎，仍有美術細修空間。

- 主檔：`BSR_Schoolgirl_Apose_v1.blend`
- 場景：`BSR_Schoolgirl_Model_v1`
- 骨架：`BSR_Rig`，18 根骨骼，FK 操作，自然 A-pose。
- 角色：72 個 mesh，基礎面數 12,510；髮片有非破壞式細分與厚度。
- 約 3.77 Blender units 高；Z 向上，正面朝 -Y。`CAM_Side` 中角色面向右方。
- 參考圖已封裝於 blend；`BSR_References` 集合預設隱藏，可在 Outliner 開啟。`REF_Plane_Front/Back/Side` 使用原圖不同 UV 區域呈現各視圖。
- 前／後／側視與三分之四預覽為同資料夾的 PNG。
- 鞋子未加入品牌 logo。材質為簡單實色材質，使用棚燈產生柔和陰影。

## 物件

完整逐項清單在 `model_report.json` 的 `objects`。

主要部件包括 `BSR_Head`、`BSR_Neck`、`BSR_Body_Shirt`、`BSR_Pelvis`、`BSR_Skirt`、`BSR_Waistband`、`BSR_Hair_Cap`、`BSR_Hair_Long`、7 片瀏海與左右側髮、`BSR_Backpack`、`BSR_BackpackPocket`、拉鍊與提把。

左右成對部件：`BSR_Arm`、`BSR_Hand`、`BSR_Thumb`、`BSR_Leg`、`BSR_Sleeve`、`BSR_Cuff`、`BSR_Sock`、`BSR_Shoe`、`BSR_Sole`、鞋帶、領片、吊帶、書包肩帶、扣環，以及眼睛／耳朵／臉頰等簡化五官。左右後綴為 `.L` 與 `.R`。

場景另有 4 個相機、3 個燈光、6 個參考物件與 1 個骨架。原本的預設場景保留於同檔案內。

## 骨骼

`root → pelvis → spine → chest → neck → head`

從 chest 分出 `upper_arm.L → forearm.L → hand.L` 與 `.R` 對應鏈。

從 pelvis 分出 `thigh.L → shin.L → foot.L` 與 `.R` 對應鏈。

## 驗證與使用範圍

所有角色 mesh 均有指向 `BSR_Rig` 的 Armature modifier。有效權重總和非 1 或未綁定的頂點數為 0。左手肘與左膝已做 30 度可逆變形測試，確認網格跟隨，測試後恢復 A-pose。沒有建立任何動畫 Action。

可以開始站姿、跑步關鍵姿勢的 blocking。正式大幅跑跳前，建議先加裙襬骨骼與權重、長髮跟隨骨骼，以及腳掌 IK。裙襬目前跟隨 pelvis，長髮跟隨 head，書包跟隨 chest，尚未做大動作的穿插修正。肢體與服裝是分離網格，未做到全身連續的正式角色拓樸。

下一步美術細修：日系眼型／臉型、髮頂與長髮接縫、領口厚度、手指、袖口銜接與鞋面。不要把本版當成已完成正式遊戲動畫驗收的最終角色。
