## 2026-05-17 (3)

- Requirements.md 更新：接続ロジック仕様（モニター役割優先順位・ループスルー上限・ワイヤレスマルチホップ・レコーダー自動提案）を追加
- Architecture.md 更新：データモデル（Scene/CameraInstance/WirelessSetInstance/MonitorInstance）、自動配線ロジック5ステップ、UI構成（新）を追記

---

## 2026-05-17 (2)

### equipmentDB.ts 大幅拡充 – 実機スペックベース

**追加した機種一覧（新規 47 エントリ）:**

**カメラ (9機種追加、既存3機種にrichSpec追加)**
- Sony BURANO, VENICE 2, α7S III, α7 IV
- ARRI ALEXA Mini LF
- RED V-Raptor
- Canon EOS C70, EOS C300 Mark III
- Blackmagic URSA Mini Pro 12K

**ワイヤレス (14機種追加)**
- Teradek Bolt 6 LT 750 TX/RX, LT 1500 TX/RX
- Teradek Bolt 6 XT 1500 TX/RX, XT 3000 TX/RX
- Teradek Bolt 500 XT TX/RX
- Hollyland Pyro H TX/RX
- Accsoon CineView SE TX/RX

**モニター (18機種追加、既存5機種を更新)**
- SmallHD: Cine 5, Ultra 7, Ultra 5, Ultra 10, Indie 7, Indie 5, 702 Touch
- Atomos: Shogun Ultra, Ninja V, Ninja V+, Ninja Ultra
- Sony: PVM-A170, PVM-A250, LMD-A170, LMD-A220, LMD-A240, BVM-HX310

**レコーダー (2機種追加 – 新型 "recorder" タイプ)**
- Atomos Shogun Connect
- Blackmagic Video Assist 7" 12G

**構造変更:**
- `EquipmentSpec` / `SpecPort` インターフェース追加（richSpec フィールド）
- `Equipment.type` に `"recorder"` 追加
- `MonitorModelId` / `CameraModel` 型を拡張
- `EquipmentNode.tsx` に recorder 用カラー (#bf5af2) / ラベル追加
- `ControlPanel.tsx` カメラ一覧を12機種に拡張、DB名で表示

---

## 2026-05-17

- equipmentDB.ts の全モニター機種に OUT ポートを追加
  - SmallHD Cine 7: SDI OUT（3G-SDI ループスルー）
  - Atomos Shogun 7: SDI OUT（12G-SDI クリーンフィード）+ HDMI OUT
  - Atomos Sumo 19: SDI OUT（ループスルー）+ HDMI OUT
  - FSI DM240W: SDI OUT（SDI ループスルー）
  - SmallHD 702 Bright: HDMI OUT（クリーンフィード）
- EquipmentNode.tsx は既に IN/OUT 両方の表示・ハンドルに対応済みのため変更不要
- 自動配線ロジック（generateSetup.ts）への影響なし（IN ポートのみ参照）
