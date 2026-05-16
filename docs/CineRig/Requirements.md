

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

# データモデル

## Equipment
- id: string
- name: string
- type: "camera" | "monitor" | "wireless_tx" | "wireless_rx"
- ports: Port[]

## Port
- id: string
- type: "HDMI" | "SDI" | ...
- direction: "in" | "out"

## Connection
- from: { equipmentId, portId }
- to: { equipmentId, portId }
- cableType: string

# Vision
a
# Decisions
b