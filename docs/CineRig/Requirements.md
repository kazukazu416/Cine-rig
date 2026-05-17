
# MVP

## 入力
- カメラ: FX6（固定）
- モニター: 1〜3台
- ワイヤレス: true固定

## 出力（期待するJSON）
{
  "equipments": [...],
  "connections": [...]
}

## 成功条件
FX6 + モニター2 + wireless=true で上記JSONが返ること

---

# データモデル

## Equipment
- id: string
- name: string
- type: "camera" | "monitor" | "wireless_tx" | "wireless_rx" | "recorder"
- ports: Port[]

## Port
- id: string
- type: "HDMI" | "SDI" | ...
- direction: "in" | "out"

## Connection
- from: { equipmentId, portId }
- to: { equipmentId, portId }
- cableType: string

---

# Vision
a
# Decisions
b

---

# 接続ロジック仕様

## モニター役割（優先順位順、カメラに近い順）

1. オンボード（カメラ本体上）
2. フォーカス
3. 前線モニター
4. 監督
5. クライアント
6. その他（自由記載）

## 接続ルール

- オンボードは必ず有線（SDI or HDMI、カメラに直結）
- その他のモニターはユーザーがワイヤレスを使うか選択可能
- ループスルー上限：4台（5台以上は分配器に切替）
- ワイヤレスはマルチホップ可（フォーカス→さらに別ワイヤレス→クライアント）

## ワイヤレス

- 複数セット追加可能
- 各セットの接続先モニターは手動選択

## レコーダー

- 接続方法はClaudeに自動提案させる
- カメラのSDI OUT2優先、なければループスルー
