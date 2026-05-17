## 2026-05-17 (7)

### Phase 3: デザイン仕上げ完了

**カラーシステム全面適用:**
- ベース背景 #FAFAFA / カード・パネル #FFFFFF / アクセント #005BA6
- テキスト #1d1d1f / #6e6e73 / #86868b / ボーダー rgba(0,0,0,0.08)

**ノードのコンパクト化 (`EquipmentNode.tsx`):**
- NODE_W=190, HEADER_H=44, PORT_ROW_H=23（従来より小型・高密度）
- 角丸 6px / 影なし（ボーダーのみ `rgba(0,0,0,0.10)`）
- カテゴリ色はヘッダー上部 3px バーのみ（camera: #30d158 / monitor: #8e8e93 / tx+rx: #ff9f0a / recorder: #bf5af2）

**サイドバー仕上げ:**
- `EquipmentLibrary.tsx`: セクションヘッダーにカテゴリ色ドット・検索フォーカスリング #005BA6
- `ScenePanel.tsx`: カード上部 3px アクセントバー（ノードと同スタイル統一）・AddBtn/XBtn/ResetBtn ホバートランジション 200ms

**インタラクション統一:**
- ホバー: 背景色変化（#F5F5F7 / #F0F0F2）
- トランジション: 200ms ease-out 全ボタン

**トップバー追加 (`App.tsx`):**
- 高さ 36px / "CineRig" タイトル・シーン件数・⟳リセットボタン
- 手動配線中バッジ（オレンジ系） #FFF7ED / #c2410c

**グローバルスタイル (`src/index.css`):**
- フォントスムージング / スクロールバー細型 / ノード選択リング #005BA6 / RF コントロール白テーマ

- `npm run build` エラーなし

---

## 2026-05-17 (6)

### Phase 2: UI再設計完了

**3カラムレイアウト構築:**
- 左: `EquipmentLibrary.tsx`（新規）— カテゴリ別機材ブラウザ + 検索ボックス（カメラ12機種・モニター22機種・ワイヤレス16機種・レコーダー2機種）
- 中央: React Flow キャンバス（ライトテーマ #FAFAFA）
- 右: `ScenePanel.tsx`（新規）— Scene構成パネル

**ScenePanel 機能:**
- カメラセクション: 追加・削除・機種選択
- モニターセクション: 追加・削除・機種/役割/カメラ割当
- ワイヤレスセクション: TX/RX機種選択・送信元カメラ選択・接続先モニターチェックボックス
- レコーダーセクション: プレースホルダー

**generateFromScene() 接続:**
- `App.tsx` を Scene状態ベースに完全書き換え
- `setupToFlow.ts` に `sceneToFlow(setup, scene)` 追加
- Scene変更 → リアルタイム配線図更新

**Design.md準拠デザイン更新:**
- `EquipmentNode.tsx`: ライトテーマ（#FFFFFF ノード背景・#1d1d1f テキスト）
- `EdgePanel.tsx`: ライトテーマ（#FFFFFF 背景）
- アクセント #005BA6 / 角丸 7-8px / フラット影
- キャンバス背景 #FAFAFA / MiniMap・Controls も白テーマ

**既存機能維持確認:**
- 手動配線モード（ドラッグ接続・再接続）
- ノード自由配置（位置 localStorage 保存）
- エッジ種類変更・削除（EdgePanel）
- 手動編集警告モーダル（WarningModal）
- Toast通知

- `npm run build` エラーなし / `npm run demo` 正常動作

---

## 2026-05-17 (5)

### Phase 1: データモデル+ロジック完了

- `src/types.ts` に Scene 構造を追加（既存型は維持）
  - `SceneMonitorRole`, `CameraInstance`, `WirelessSetInstance`, `MonitorInstance`, `RecorderInstance`, `Scene`
- `src/generateSetup.ts` を新ロジックに書き換え
  - `SignalPath` クラス（ループスルーチェーン追跡、最大4ホップ）
  - `generateFromScene(scene: Scene): Setup` をメインエクスポートとして追加
  - 5ステップ自動配線ロジック実装（オンボード→ワイヤレス→有線→レコーダー）
  - `generateSetup(CameraInput[])` は App.tsx 互換のアダプターとして維持
- `src/demo.ts` を Scene ベースに更新
  - FX6 + 4モニター（オンボード/フォーカス/ディレクター/クライアント）+ ワイヤレス1セット
  - 期待どおりの配線：SDI→オンボード→ループスルー→TX / RX→monitor3→ループ→monitor4 / HDMI→フォーカス
- `npm run demo` 正常動作・`npm run build` エラーなし

---

## 2026-05-17 (4)

- Design.md 更新：カラーシステム確定
  - アクセント: #005BA6（マリンブルー）/ ホバー #0070C9 / 押下 #004A88 / 薄背景 #E6F0FA
  - ベース背景: #FAFAFA（ページ）/ #FFFFFF（カード）/ #F5F5F7（セカンダリ）
  - ボーダー: rgba(0,0,0,0.08) 標準 / 0.15 強調
  - テキスト: #1d1d1f / #6e6e73 / #86868b
  - 紫系の記述を全て削除（「紫系・青系で要検討」→「#005BA6の1色のみ」に変更）

---

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
