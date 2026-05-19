---
name: add-equipment
description: 映像機材のスペックを調査してsrc/equipmentDB.tsに追加する。機材名を引数に取る。カメラ・モニター・ワイヤレス・レコーダーに対応。
---

# 機材スペック追加ワークフロー

## 使い方
```
/add-equipment <機材名>
例: /add-equipment "SmallHD Cine 13"
例: /add-equipment "Teradek Bolt 6 Max TX"
```

## 手順

### 1. スペック調査
- WebSearch + WebFetch でメーカー公式サイトから以下を確認:
  - SDI / HDMI / WIRELESS の入出力ポート数と方向
  - SDI 規格（3G / 6G / 12G）
  - ループスルー・クリーンフィードの有無
  - サイズ・輝度・HDR対応（モニターの場合）

### 2. EquipmentTemplate の作成
`src/equipmentDB.ts` の既存エントリを参考に以下の形式で追加:

```ts
model_id: {
  name: "表示名",
  type: "camera" | "monitor" | "wireless_tx" | "wireless_rx" | "recorder",
  spec: "一行要約",
  richSpec: { /* EquipmentSpec */ },
  ports: [
    { type: "SDI" | "HDMI" | "WIRELESS", direction: "in" | "out" },
    // 同種ポートが複数ある場合は別エントリで列挙
  ],
},
```

### 3. 型定義への追記
- カメラ → `CameraModelId` ユニオン型
- モニター → `MonitorModelId` ユニオン型 + `MONITOR_MODELS` 配列
- ワイヤレス → `WirelessModelId` ユニオン型
- レコーダー → `RecorderModelId` ユニオン型

### 4. ビルド確認
```bash
npm run build
```
エラーがないことを確認する。

### 5. Logs.md への記録
`docs/CineRig/Logs.md` に日付・追加機材名・ポート構成を追記する。

## 注意事項
- ポート数は公式スペックシートを必ず参照すること（記憶で書かない）
- WIRELESS ポートは TX の out / RX の in に必ず付与する
- ループスルー出力は `direction: "out"` として別エントリに追加
