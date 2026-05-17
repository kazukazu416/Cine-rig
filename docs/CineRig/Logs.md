## 2026-05-17

- equipmentDB.ts の全モニター機種に OUT ポートを追加
  - SmallHD Cine 7: SDI OUT（3G-SDI ループスルー）
  - Atomos Shogun 7: SDI OUT（12G-SDI クリーンフィード）+ HDMI OUT
  - Atomos Sumo 19: SDI OUT（ループスルー）+ HDMI OUT
  - FSI DM240W: SDI OUT（SDI ループスルー）
  - SmallHD 702 Bright: HDMI OUT（クリーンフィード）
- EquipmentNode.tsx は既に IN/OUT 両方の表示・ハンドルに対応済みのため変更不要
- 自動配線ロジック（generateSetup.ts）への影響なし（IN ポートのみ参照）
