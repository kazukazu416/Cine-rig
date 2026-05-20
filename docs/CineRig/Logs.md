## 2026-05-20 (18)

### ランディングページ作成

**対応ファイル:** src/LandingPage.tsx（新規）, src/main.tsx, vite.config.ts

CineRig のランディングページ（/）を実装。

**構成:**
- `/` → LandingPage（LP）
- `/app` → App本体（従来通り）
- `main.tsx` で `window.location.pathname` によるシンプルルーティング
- `vite.config.ts` に `historyApiFallback: true` 追加

**LP構成:**
1. ヒーローセクション（配線図SVGイラスト背景）
2. 課題セクション（Before）
3. 解決セクション（After）
4. 機能紹介カード 3枚（配線図生成・バッテリー計算・案件管理）
5. CTAセクション + フッター

**デザイン:** Design.md準拠（#005BA6 / #FAFAFA / Apple風フォント）

---

## 2026-05-20 (17)

### 存在しない機材の削除・DB整合性確認

**対応ファイル:** src/equipmentDB.ts, src/types.ts

WebSearchで全機材の実在確認を実施。1件の架空機材を削除。

**削除した機材:**
| 機材ID | 名前 | 理由 |
|--------|------|------|
| `fsi_dm240w` | FSI DM240W | 実在しない型番。正しくは FSI DM240（ただしHDMI入力なし、DisplayPort/DVIのみの旧モデル）。"W"サフィックスは架空 |

**確認して問題なかった機材:**
- Decimator MD-LX: 実在（HDMI/SDI双方向コンバーター）
- Sony LMD-A240: 実在（24" LCD制作モニター）
- Sony LMD-A170 / LMD-A220: 実在
- SmallHD 702 Bright: 実在
- その他全カメラ・ワイヤレス・コンバーター・マルチビューワー: 実在確認

---

## 2026-05-20 (16)

### 日本サイト調査 続き・Shogun Ultra 消費電力修正

**対応ファイル:** src/equipmentDB.ts

raid-japan.com / system5.jp / atomos-japan.com 等を調査。

**修正内容:**
| 機材 | 旧値 | 新値 | 根拠 |
|------|------|------|------|
| Atomos Shogun Ultra | 35W推測 | **25W** | atomos-japan.com バッテリー駆動時間から逆算（5200mAh→1.5h / 7800mAh→2.2h @4Kp60） |

**引き続き消費電力（W）非公開の機材（推測値維持）:**
- SmallHD Cine 7/5/Ultra 7/5/10 — SmallHD は消費電力ワット数を非公開（電流定格のみ）
- Decimator DMON-16S — 公式マニュアルPDFはSSL証明書エラー、他ソースにも記載なし

---

## 2026-05-20 (15)

### 日本レンタル機材サイト調査による spec 修正

**対応ファイル:** src/equipmentDB.ts

日本レンタル機材屋・国内販売サイト・公式スペックPDFを複数参照し、残9件中5件の誤りを修正。

**修正内容:**
| 機材 | フィールド | 旧値 | 新値 | 根拠 |
|------|-----------|------|------|------|
| SmallHD Cine 7 | brightness | 2000nit | **1800nit** | 公式・Newsshooter・Markertek 全ソースが1800nit |
| SmallHD Cine 5 | brightness | null | **2000nit** | smallhd.com公式・Newsshooterレビュー確認 |
| SmallHD Ultra 5 | brightness | null | **3000nit** | smallhd.com公式・dittools.eu・Sweetwater確認 |
| BM Cinema Camera 6K | powerConsumption | 20W推測 | **30W** | filmtools.com スペック欄 "Power Consumption: 30W" / BMD付属アダプター30W電源と整合 |
| Atomos Ninja Ultra | notes | "30W要求・推測値" | 公式10-22W、USB-C PD 45W以上 | atomos.com/tech-specs/ninja-ultra/ 公式確認 |

**引き続き消費電力公式非公開（推測値維持）:**
SmallHD Cine 7/5（消費電力）、Ultra 7/5/10、Atomos Shogun Ultra、Decimator DMON-16S

---

## 2026-05-20 (14)

### 二次ソース調査による powerConsumption 追加修正

**対応ファイル:** src/equipmentDB.ts

YouTube・フォーラム・レンタルハウス等の二次ソースで不明13件を調査し、4件を修正。

**修正内容:**
| 機材 | 旧値 | 新値 | 根拠 |
|------|------|------|------|
| Teradek Bolt 500 XT RX | 7W推測 | 9W | cine2481.com 公称9W（TX 7.3Wより高い、受信デコード処理のため） |
| Sony α7 IV | 9W推測 | 6W | Sony公式ヘルプガイド 動画撮影時 5.6-5.7W |
| Blackmagic BMPCC 6K Pro | 14W推測 | 16W | BMDフォーラム実測：スタンバイ16W・録画時最大26W |
| SmallHD Indie 5 | 12W（ソース不明） | 12W（変更なし） | avgear.shopにて12W確認済みとしてnotes更新 |

**引き続き公式非公開の機材（null維持）:**
SmallHD Cine7/5/Ultra7/5/10、Atomos Shogun Ultra、Decimator DMON-16S、BM Cinema Camera 6K

---

## 2026-05-20 (13)

### spec-verifier による powerConsumption 多ソース検証・修正

**対応ファイル:** src/equipmentDB.ts

各機材を複数リソースで再検証（公式サイト・B&H・Filmtools・ManualsLib・Newsshooter等）し、8件の誤りを修正。

**修正内容:**
| 機材 | 旧値 | 新値 | 根拠 |
|------|------|------|------|
| SmallHD 702 Touch | 11W推測 | 17W | Filmtools/Newsshooter – Indie 7と同等の17.3W最大 |
| Atomos Ninja V | 7W | 10W | 公式典型10W・最大19W（7Wは低すぎ） |
| Atomos Ninja V+ | 7W | 10W | 同上 |
| Atomos Shogun Connect | 15W推測 | 33W | Hot Rod Cameras仕様書 33W最大 |
| Teradek Bolt 6 LT TX（750/1500） | 13W推測 | 9W | ManualsLib公式マニュアルp.126 TX=9W公称 |
| Accsoon CineView SE TX | 5W推測 | 4.5W | accsoon.com公式製品ページ典型4.5W |
| Accsoon CineView SE RX | 3W推測 | 3.5W | accsoon.com公式製品ページ典型3.5W |

**SmallHD Cine 7（18W）の注記修正:**
- 18Wの出典が「Cine 7 500 TX版（Bolt 500内蔵）の最大値」であることを明記
- 標準Cine 7の公式消費電力は非公開のため推測値として扱う

**確認不可のまま維持（公式非公開）:**
SmallHD Cine5/Ultra系, Atomos Shogun Ultra, Teradek Bolt 500 XT, Sony a7 IV, BM BMPCC 6K Pro, BM Cinema Camera 6K, Decimator DMON-16S

---

## 2026-05-20 (12)

### equipmentDB.ts 消費電力 全43件調査・入力完了

**対応ファイル:** src/equipmentDB.ts

**調査方法:** WebSearch（公式サイト・仕様書・Newsshooter等レビュー）

**確認済みで入力した機材（公式ソース）:**
- Sony a7S III: 8W（実測7.3-7.6W, flaviutamas.com）
- ARRI ALEXA Mini LF: 70W（69-89W MVF-2接続時, ARRI公式）
- ARRI ALEXA LF: 130W（120-160W, ARRI公式）
- ARRI AMIRA: 65W（52-84W MVF-1接続時, ARRI Technical Data）
- RED V-Raptor: 65W（8K 24fps平均, RED公式Operation Guide）
- RED V-Raptor XL: 65W（同上）
- RED KOMODO-X: 28W（6K 24fps, RED公式Operation Guide）
- Canon EOS C300 Mark II: 20W（Canon公式仕様書 14.4V時）
- Teradek Bolt 6 XT TX: 20W / RX: 18W（Teradek公式）
- Teradek Bolt 6 LT RX: 11W（Teradek公式）
- Hollyland Pyro H TX: 7W / RX: 4W（Hollyland公式/Newsshooter）
- SmallHD Cine 7: 18W（SmallHD仕様 18.2W max）
- SmallHD Indie 7: 17W（SmallHD公式 17.3W）
- SmallHD Indie 5: 12W（SmallHD製品ページ）
- SmallHD 702 Bright: 11W（SmallHD公式）
- Atomos Shogun 7: 33W（Atomos公式スペックシート）
- Atomos Sumo 19: 75W（Atomosマニュアル）
- Decimator DMON-4S: 6W（Decimator公式ブローシャー）
- FSI DM240W: 29W @ 100nit / 最大48W（FSI公式）

**推測値で入力した機材（notes に「推測値」明記）:**
- Sony a7 IV: 9W / Canon EOS R5 C: 18W / BM BMPCC 6K Pro: 14W / BM Cinema Camera 6K: 20W
- SmallHD Cine 5: 14W / Ultra 7: 22W / Ultra 5: 15W / Ultra 10: 30W / 702 Touch: 11W
- Atomos Shogun Ultra: 35W / Ninja Ultra: 10W / Shogun Connect: 15W
- Teradek Bolt 6 LT TX: 13W / Bolt 500 XT TX: 8W / Bolt 500 XT RX: 7W
- Accsoon CineView SE TX: 5W / RX: 3W
- Decimator DMON-16S: 20W

**結果:** 全43件の null を解消。0件の null が残留。ビルド正常。

---

## 2026-05-20 (11)

### バッテリー計算UI実装

**対応ファイル:** src/BatterySection.tsx（新規）/ src/ScenePanel.tsx / src/InfoPanel.tsx / src/App.tsx

**BatterySection.tsx（新規）:**
- `BatteryBreakdownItem`, `BatterySelection` 型を定義
- `DEFAULT_BATTERY`: IDX DUO-C198P × 1
- `calcRuntime(batteryId, count, totalWatts)`: 稼働時間計算（Wh × 本数 × 0.8 ÷ W）
- `BatterySection` コンポーネント:
  - 折りたたみ式（デフォルト閉、max-height 200ms ease-out アニメーション）
  - 合計消費電力・内訳表示
  - バッテリー機種セレクト（batteryDB.ts の BATTERY_GROUPS 準拠）
  - 本数入力（1〜10本）
  - 稼働時間色分け: <2h=赤(#E24B4A) / 2〜4h=黄(#EF9F27) / ≥4h=緑(#639922)

**ScenePanel.tsx:**
- `batterySelections`, `onBatteryChange` props を追加
- CameraCard: `batteryBreakdown`（カメラ本体+オンボードモニター+TX）+バッテリー props を追加
- MonitorCard: `batteryBreakdown`（モニター単体）+バッテリー props を追加
- 各カードの render 時に breakdown を動的に計算して BatterySection を追加

**InfoPanel.tsx:**
- "🔋 バッテリー" タブを追加（4つ目のタブ）
- `BatteryTab` コンポーネント:
  - カメラグループ行（カメラ本体+オンボード+TX の合計W）
  - モニター行（onboard 以外のモニター単体W）
  - 各行: 機材名 / 消費電力 / バッテリー機種×本数 / 稼働時間（色分け）
  - 合計必要本数サマリー（機種ごと）

**App.tsx:**
- `batterySelections: Record<string, BatterySelection>` state を追加
- `handleBatteryChange` コールバックを追加
- ScenePanel, InfoPanel に props を渡す

---

## 2026-05-20 (10)

### バッテリーDB新規作成 + 全機材 powerConsumption 入力

**対応ファイル:** src/batteryDB.ts（新規）/ src/equipmentDB.ts

**batteryDB.ts:**
- `BatteryType` / `Battery` 型定義
- IDX V-mount 6種登録:
  - DUO-CP シリーズ: DUO-C98 (96Wh), DUO-C150 (143Wh), DUO-C198P (193Wh・airSafe=false)
  - ImicroPD シリーズ: IMICRO-50P (47Wh), IMICRO-98P (97Wh), IMICRO-150P (145Wh)
- `BATTERY_IDS` / `BATTERY_GROUPS` エクスポート

**equipmentDB.ts — powerConsumption 更新:**
- 公式スペックから確認できた値を入力 (Source URL を notes に記載):
  - Sony: FX6=20W, FX3=12W, FX9=29W, BURANO=31W, VENICE 2=55W, VENICE=47W
  - ARRI: ALEXA 35=130W, ALEXA Mini=68W
  - RED: KOMODO 6K=12W
  - Canon: C70=8W, C300 MkIII=22W, C500 MkII=22W
  - Blackmagic: URSA Mini Pro 12K=24W, BMPCC 6K G2=12W
  - Atomos: Ninja V=7W, Ninja V+=7W
  - BM Mini Converters (HDMI→SDI 6G / SDI→HDMI 6G / SDI Distribution): 各4W
  - BM Teranex Mini (HDMI→SDI 12G / SDI→HDMI 12G): 各12W
  - Decimator MD-HX=5W, MD-LX=3W
  - BM MultiView 4 HD=9W, MultiView 4=12W, MultiView 16=45W
  - BM Video Assist 7" 12G=14W
- 公式確認が取れなかった機材は `null` のまま、notes に「powerConsumption 要確認」を追記:
  - Sony α7S III, α7 IV / ARRI ALEXA Mini LF, AMIRA, ALEXA LF
  - RED V-Raptor, V-Raptor XL, KOMODO-X / Canon C300 MkII, EOS R5 C
  - BM BMPCC 6K Pro, Cinema Camera 6K
  - 全ワイヤレス (Teradek/Hollyland/Accsoon)
  - 全 SmallHD モニター / Atomos Shogun 7, Shogun Ultra, Sumo 19, Ninja Ultra, Shogun Connect
  - FSI DM240W / Decimator DMON-4S, DMON-16S

---

## 2026-05-19 (9)

### 案件管理UIをmacOS Finder風に全面改善

**対応ファイル:** ProjectPanel.tsx（全面書き直し）/ App.tsx

**ProjectPanel.tsx:**
- `ProjectLibrary` — Finderライクなグリッドモーダル
  - カード形式（`minmax(190px, 1fr)` グリッド）
  - 各カード: SceneThumbnail（機材構成のミニビジュアル）・案件名・担当者・日付・メモ・サマリーテキスト・削除ボタン
  - ホバーで青いボーダーハイライト (#005BA6)
  - 上部に検索ボックス・「＋ 新規作成」ボタン
  - 案件0件時は空状態UIを表示
- `NewProjectModal` — 新規作成モーダル
  - 未保存変更ありの場合は「破棄して続ける」確認ステップを挿入
  - 案件名・担当者・メモ入力フォーム
- `SceneThumbnail` — 機材構成を色付きボックスで可視化（カメラ緑/ワイヤレス橙/コンバーター水色/MV緑/モニター灰）

**App.tsx:**
- ヘッダー改善:
  - 案件名をインライン編集可能（クリックでテキスト入力に切り替え）
  - 📁（案件一覧）/ 💾（保存）/ ＋（新規作成）アイコンボタン
  - 保存ステータス表示（● 未保存 / 保存中... / ✓ 保存済み）
- `doSave` 関数を共通化
- 自動保存: 未保存から30秒後に自動保存
- `showProjectPanel` → `showLibrary` / `showNewProject` に分離
- `handleNewProject` が name/author/notes を引数に受け取るよう変更

---

## 2026-05-19 (8)

### ライブラリ → キャンバスへのドラッグ&ドロップ追加

**対応ファイル:** main.tsx / EquipmentLibrary.tsx / App.tsx

**main.tsx:**
- `<ReactFlowProvider>` で App をラップ（`useReactFlow()` を App 内で使えるようにするため）

**EquipmentLibrary.tsx:**
- `SECTION_META` に `category` フィールドを追加
- `LibraryItem` を draggable に変更
  - `onDragStart`: `dataTransfer` に `{ category, modelId }` をセット
  - ドラッグゴースト（半透明カード）を `setDragImage` で設定
  - ドラッグ中は cursor: grabbing
- `LibraryItem` 呼び出しに `category` を渡すよう修正

**App.tsx:**
- `useReactFlow()` で `screenToFlowPosition` を取得
- `handleDrop`: category に応じてシーンへ追加 + drop 座標を positionsRef に保存
  - camera / wireless / converter / multiviewer: 即座にシーンへ追加
  - monitor: 役割選択モーダルを表示してから追加
- `handleDragOver` / `handleDragLeave`: ドロップ可能エリアのハイライト（青破線ボーダー）
- `confirmDropMonitor`: モニター役割を確定して追加
- ドロップ時のモーダル（`<Modal>`）を追加

---

## 2026-05-19 (7)

### InfoPanel チェックタブにコンバーター・マルチビューワーの未接続エラーを追加

- `InfoPanel.tsx`: `validate()` 関数にコンバーター・マルチビューワーのチェックを追加
  - 入力接続なし（`sourceId` なし かつ 入力エッジなし）の場合にエラーとして表示
  - モニターの未接続チェックと同じロジックで実装

---

## 2026-05-19 (6)

### カメラリストをUIに反映 + メーカーグループ表示

- `equipmentDB.ts`: `CAMERA_GROUPS`（メーカー別グループ）・`CAMERA_IDS`（フラット）をエクスポート
- `ScenePanel.tsx`: ローカル `CAMERA_IDS` 削除 → `CAMERA_GROUPS` インポートに変更
  - カメラカードのモデルセレクター → `<optgroup>` でメーカー別表示
  - 「カメラを追加」モーダルも同様
- `EquipmentLibrary.tsx`: カメラセクションをメーカーグループ（Sony / ARRI / RED / Canon / Blackmagic）で表示
  - 検索時もグループ単位でフィルタリング

対応カメラ数: 27機種（既存12 + 新規15）

---

## 2026-05-19 (5)

### コンバーター・マルチビューワーのUI実装 + types.ts拡張

**対応ファイル:** types.ts / equipmentDB.ts / generateSetup.ts / setupToFlow.ts / EquipmentNode.tsx / EquipmentLibrary.tsx / ScenePanel.tsx / App.tsx

**types.ts:**
- `ConverterInstance` / `MultiviewerInstance` インターフェース追加
- `Scene` に `converters?` / `multiviewers?` フィールド追加（後方互換のため optional）

**equipmentDB.ts:**
- `CONVERTER_MODELS` / `MULTIVIEWER_MODELS` エクスポート追加

**generateSetup.ts:**
- converter / multiviewer を Equipment に変換してセットアップへ組み込み

**setupToFlow.ts:**
- `converter` (x=1860) / `multiviewer` (x=2060) カラム追加
- auto-edge生成ロジックをリファクタ → `buildAutoEdge()` 共通関数に統一
- モニターの接続元解決でConverterを認識するよう修正

**EquipmentNode.tsx:**
- Multiviewerのノードカラーを rose → green (#22c55e) に変更（ユーザー指示）

**EquipmentLibrary.tsx:**
- 「コンバーター」「マルチビューワー」セクションをライブラリに追加

**ScenePanel.tsx:**
- `DeviceCard` 共通コンポーネント追加（Converter/Multiviewerが共用）
- `ConverterCard` / `MultiviewerCard` コンポーネント追加
  - 接続元セクション（カメラ/RX/モニター/コンバーターを接続元に選択可）
  - 接続先セクション（モニター/TX への出力設定）
- `MonitorCard` の接続元選択に「コンバーター」optgroup を追加
- ScenePanel に CONVERTERS / MULTIVIEWERS セクション追加（+追加ボタン・モーダル）

**App.tsx:**
- `INITIAL_SCENE` に `converters: []` / `multiviewers: []` 追加
- `resolveEntityId` でconverter/multiviewerのノードIDを解決
- MiniMap ノードカラーに converter (水色) / multiviewer (緑) 追加

---

## 2026-05-19 (4)

### シネマカメラ 15機種を equipmentDB に追加

**調査方法:** 各公式サイト・仕様書を WebSearch/WebFetch で確認

**型システム拡張:**
- `equipmentDB.ts`: `CameraModelId` に 15 機種の ID を追加

**追加機材一覧:**

| ID | 機材名 | SDI出力 | HDMI出力 |
|---|---|---|---|
| alexa_35 | ARRI ALEXA 35 | 12G×2 | - |
| alexa_mini | ARRI ALEXA Mini | 3G×1 + 6G×1 | - |
| amira | ARRI AMIRA | 3G×1 + 6G×1 | - |
| alexa_lf | ARRI ALEXA LF | 6G×4 | - |
| venice1 | Sony VENICE | 12G×2 + 3G×2 | HDMI×1 |
| v_raptor_xl | RED V-Raptor XL | 12G×3 + 3G×1 | - |
| komodo_6k | RED KOMODO 6K | 12G×1 | - |
| komodo_x | RED KOMODO-X 6K | 12G×1 | - |
| c300_mkii | Canon EOS C300 Mark II | 3G×2 | HDMI×1 |
| c500_mkii | Canon EOS C500 Mark II | 12G×2 | HDMI×1 |
| eos_r5c | Canon EOS R5 C | - | HDMI×1 |
| bmpcc_6k_g2 | Blackmagic BMPCC 6K G2 | - | HDMI×1 |
| bmpcc_6k_pro | Blackmagic BMPCC 6K Pro | - | HDMI×1 |
| bm_cinema_6k | Blackmagic Cinema Camera 6K | - | HDMI×1 |

---

## 2026-05-19 (3)

### コンバーター・マルチビューワー 12機種を equipmentDB に追加

**調査方法:** 各公式サイトを WebFetch で確認（Blackmagic Design 公式、Decimator 公式 / B&H / coremicro）

**型システム拡張:**
- `types.ts`: `Equipment.type` に `"converter" | "multiviewer"` を追加
- `equipmentDB.ts`: `EquipmentSpec.category` に同じ値を追加
- `equipmentDB.ts`: `ConverterModelId` / `MultiviewerModelId` 型エイリアスを追加し `EquipmentModelId` に統合
- `EquipmentNode.tsx`: Converter (水色 #0ea5e9) / Multiviewer (ローズ #f43f5e) のノードカラー・ラベルを追加

**追加機材一覧:**

| ID | 機材名 | 入力 | 出力 |
|---|---|---|---|
| bm_mini_conv_hdmi_sdi_6g | BM Mini Conv HDMI to SDI 6G | HDMI×1 | 6G-SDI×2 |
| bm_mini_conv_sdi_hdmi_6g | BM Mini Conv SDI to HDMI 6G | 6G-SDI×1 | HDMI×1 |
| bm_mini_conv_sdi_dist | BM Mini Conv SDI Distribution | 3G-SDI×1 | 3G-SDI×8 |
| bm_teranex_hdmi_sdi_12g | BM Teranex Mini HDMI to SDI 12G | HDMI2.0×1 | 12G-SDI×2 |
| bm_teranex_sdi_hdmi_12g | BM Teranex Mini SDI to HDMI 12G | 12G-SDI×1 | HDMI2.0×1 |
| bm_multiview_4hd | BM MultiView 4 HD | 3G-SDI×4 | 3G-SDI×1 + HDMI×1 |
| bm_multiview_4 | BM MultiView 4 | 6G-SDI×4 | 6G-SDI×5(4ループ+1) + HDMI×1 |
| bm_multiview_16 | BM MultiView 16 | 6G-SDI×16 | 6G-SDI×4 + HDMI×1 |
| decimator_md_hx | Decimator MD-HX | HDMI×1 + 3G-SDI×1 | HDMI×1 + 3G-SDI×4 |
| decimator_md_lx | Decimator MD-LX | HDMI×1 + 3G-SDI×1 | HDMI×1 + 3G-SDI×1 |
| decimator_dmon_4s | Decimator DMON-4S | 3G-SDI×4 | HDMI×4 + 3G-SDI×1 |
| decimator_dmon_16s | Decimator DMON-16S | 3G-SDI×16 | 3G-SDI×1 + HDMI×1 |

**要確認:**
- MD-HX の SDI 出力: 「2×ループスルー + 2×変換」の計4本として記録（notes に明記）
- MultiView 4 (non-HD) の loop-through 4本: 公式仕様通り ports[] に 5×SDI out（4ループ+1プログラム）として記録

**ビルド:** エラー 0、警告 0

---

## 2026-05-19 (2)

### モニターカード「接続先」UI追加

**概要:** OUTポートを持つモニターのカードに「接続先」セクションを追加。モニターのループスルー出力を別のモニターまたはワイヤレス TX に接続できるようになった。

**`setupToFlow.ts`:**
- Camera→TX エッジ生成を「Source→TX」に拡張
  - `ws.sourceId` がカメラIDの場合は既存挙動を維持
  - `ws.sourceId` がモニターIDの場合もエッジを自動生成（ループスルー→TX接続対応）
  - エッジID: `auto_cam_tx_*` → `auto_src_tx_*`（ロックエッジはsig照合のため影響なし）

**`ScenePanel.tsx`:**
- `MonitorCard` に新プロップ追加: `allWirelessSets`, `onConnectOut`, `onDisconnectDest`
- `MonitorCard` 内に「接続先」セクションを追加:
  - OUTポートなし機種では非表示
  - 既存接続先を一覧表示（モニター/TX）＋×切断ボタン
  - 追加フォーム: 出力ポート選択（複数時）→接続先選択（モニター/TX optgroup）→入力ポート選択（複数時）→「接続する」ボタン
  - 使用済みポート・接続済み接続先は選択肢から除外
- `WirelessCard` の送信元表示を更新:
  - `ws.sourceId` がモニターIDの場合、読み取り専用テキスト＋×ボタンで表示
  - カメラIDの場合は従来のカメラセレクタを表示

**ビルド:** エラー 0、警告 0

---

## 2026-05-19

### MonitorCard TS ビルドエラー修正

`ScenePanel.tsx` の `scene.monitors.map()` で `MonitorCard` に必須プロップ（`allRxUnits`, `allMonitors`, `onConnect`, `usedHandles`）が渡されていなかった TS2739 エラーを修正。

- `allRxUnits`: `scene.wirelessSets.flatMap(ws => ws.rxUnits)` で収集
- `allMonitors`: `scene.monitors` をそのまま渡す
- `onConnect`: `mon.id` に対して `sourceId / sourcePortIdx / cableType / targetPortIdx` を更新するハンドラを追加
- `usedHandles`: 既存の `usedHandles` をそのまま渡す

**ビルド:** エラー 0、警告 0

---

## 2026-05-18 (16)

### モニタータブ・チェックタブの整合性修正

**問題:** モニタータブで「未接続（赤）」のモニターがあってもチェックタブが「✅ 接続チェックOK」と表示される。

**根本原因:**
- モニタータブ: `isConnected = !!mon.sourceId`（scene データのみ）
- チェックタブ（validate）: `!mon.sourceId && !hasEdge`（scene + edges 両方）

手動キャンバス接続の場合、`mon.sourceId` は未設定だがエッジが存在するため、
チェックタブは OK、モニタータブは赤という不整合が発生していた。

**修正:** `src/InfoPanel.tsx` モニタータブ
- `isConnected = !!mon.sourceId || !!connEdge` に変更（validate と同一ロジック）
- `connEdge = edges.find(e => e.targetHandle?.startsWith(monPrefix) && e.data?.cableType !== "WIRELESS")`
- ケーブルタイプ表示: `mon.cableType` → エッジの `data.cableType` フォールバック

**ビルド:** エラー 0、警告 0

## 2026-05-18 (15)

### 接続チェックバグ修正：TX「チェックOK」誤表示

**根本原因**

`InfoPanel.tsx` validate 関数の `if (ws.sourceId) continue;`（line 75）が、ワイヤレス追加時に常にカメラが設定されるため、常に TX チェックをスキップしていた。加えて `setupToFlow.ts` にカメラ→TX のエッジが存在しなかったため、エッジベースのチェックも常にfalseだった。

**修正内容**

1. **`src/setupToFlow.ts`**: カメラ→TX ケーブルエッジを自動生成するセクションを追加
   - `ws.sourceId` があるワイヤレスセットに対して、カメラ出力→TX 入力のエッジを生成
   - SDI を優先、次に HDMI でポートマッチング（既使用ポートを避ける）
   - `type: "custom"`, `data: { cableType }` で既存エッジと同形式

2. **`src/InfoPanel.tsx`**: validate 関数を全面書き直し（新仕様）
   - **カメラ**: 少なくとも1つのOUTポートがエッジ接続 → なければ警告
   - **モニター**: non-WIRELESS INエッジ または scene.sourceId → なければエラー
   - **TX**: non-WIRELESS INエッジ（`ws.sourceId` 短絡を削除）→ なければ警告
   - **RX**: WIRELESSエッジでRF IN確認 + 出力エッジ/scene確認 → それぞれ警告
   - `console.log("[CineRig validate]", ...)` でデバッグ出力追加
   - `txInputTypes` ヒューリスティックを削除（カメラ→TX エッジが実在するため不要）

**ビルド:** エラー 0、警告 0

## 2026-05-18 (14)

### エラー検知拡張 + モニターカード接続状況リアルタイム表示

**【1. エラー検知拡張】**

`InfoPanel.tsx` の `validate(scene, edges)` に以下のチェックを追加：

- **カメラ出力ポート（⚠️ 警告）**: 各カメラの出力ポートをエッジ・scene monitors・TX接続（`ws.sourceId`+ポートtype一致）で確認。いずれも未使用なら「Sony FX6: SDI OUT が未接続」
  - カメラ→TX はエッジが存在しないため、`txInputTypes` ヒューリスティックで誤報を抑制
- **モニター未接続（❌ エラー）**: 既存ロジックを維持（scene + edges）
- **ワイヤレスTX入力未接続（⚠️ 警告）**: `ws.sourceId` 空かつ TX 入力ハンドルへのエッジなし → 「Wireless TX: 入力未接続」
- **ワイヤレスRX出力未接続（⚠️ 警告）**: scene + RX出力ポートのエッジで判定 → 「Wireless RX: 出力未接続」
- `outputPortOptions` / `inputPortOptions` を InfoPanel に追加インポート

**【2. モニターカード接続状況リアルタイム表示】**

`ScenePanel.tsx` の変更：

- `ConnectionInfo` に `cableType?` フィールドを追加
- `resolveHandleSource(handle, scene)` ヘルパー追加: sourceHandle → { name, portLabel } をシーンの各機材と照合して解決
- `getMonitorConnectionInfo(mon, scene, edges)` に `edges` 追加:
  - `mon.sourceId` が空でも、エッジの `targetHandle` がモニターに一致すれば接続情報を解決（手動 canvas 接続対応）
- MonitorCard 表示フォーマット変更:
  - 接続済み: `← Sony FX6 / SDI OUT → SDI IN 1`
  - 未接続: `未接続 ⚠`
- `cableType` を `mon.cableType` ではなく `connectionInfo.cableType` から表示（エッジ経由接続対応）

**ビルド:** エラー 0、警告 0

---

## 2026-05-18 (13)

### 下部パネル表示拡大

- パネル高さ: 108px → 180px
- タブボタン: padding 5px/10px → 8px/14px、fontSize 10 → 12
- コンテンツ padding: 16px → 20px、gap 12 → 14
- ケーブル項目: padding 4px/10px → 8px/14px、fontSize 12 → 13、ケーブル線 height 3 → 4
- モニター項目: padding 5px/10px → 8px/14px、minWidth 110 → 130、fontSize 11/9/9 → 13/11/11、gap 2 → 4
- チェック項目: padding 3px/8px → 6px/12px、fontSize 10 → 13、gap 4 → 6、borderRadius 4 → 6
- チェックOK メッセージ: fontSize 12 → 14

**ビルド:** エラー 0、警告 0

---

## 2026-05-18 (12)

### エラーチェックのリアルタイム化（edges + scene + nodes 全対応）

**問題:** `validate(scene)` は scene の `mon.sourceId` のみを見ていたため、手動 canvas 接続（scene 非更新）ではエラーが消えなかった。

**変更内容:**

- `validate(scene, edges)` に signature 変更 — edges も参照して接続判定
  - モニター: `mon.sourceId` が空でも `targetHandle` が `${mon.id}_${mon.model}_p*` に一致するエッジがあればエラーなし
  - RX: `sourceId` 未設定でも `sourceHandle` が `${rx.id}_${rx.model}_p*` に一致するエッジがあれば警告なし
- `useMemo(() => validate(scene, edges), [scene, edges, nodes])` で最適化
  - scene 変化（機材追加・削除・設定変更）→ 即時再チェック
  - edges 変化（接続・切断）→ 即時再チェック
  - nodes 変化（ノード追加・削除）→ 即時再チェック
- `cableEntries` も `useMemo([edges])` でメモ化
- `nodes?: Node[]` prop を追加、App.tsx から `nodes={rfNodes}` を渡すように変更

**完了条件の確認:**
- モニター追加 → 即「未接続」エラー表示 ✓
- 接続 → 即エラー消去（scene 経由・手動 canvas 両対応）✓
- 切断 → 即エラー復活 ✓

**ビルド:** エラー 0、警告 0

---

## 2026-05-18 (11)

### 手動接続のポート2重接続防止

**変更内容:**
- `App.tsx` に `isValidConnection` コールバックを追加
- キャンバス上でエッジを手動ドラッグする際、`rfEdges` から `usedHandles` を構築し、sourceHandle / targetHandle がすでに使用済みのポートへのドロップを拒否
- React Flow が自動でドラッグ中のハイライトを制御するため、使用済みポートは接続不可として視覚的にもブロックされる
- `IsValidConnection` 型を `@xyflow/react` からインポートして型安全に実装

**ビルド:** エラー 0、警告 0

---

## 2026-05-18 (10)

### isMonitorAvailable バグ修正 + firstFreeIn 型マッチング改善

**問題:** `isMonitorAvailable` が「すべての入力ポートが未使用」の場合のみ true を返していたため、複数入力ポートを持つモニター（SmallHD Cine7 など）で SDI IN 1 が使用済みの場合、HDMI IN が空いていても選択不可になっていた。

**修正内容:**

1. **`isMonitorAvailable` ロジック修正** (`ScenePanel.tsx`)
   - 旧: `!hasIncomingEdge || alreadyOnThisPort`（全ポート空きのときのみ true）
   - 新: `alreadyOnThisPort || monHandles.some(h => !usedHandles.has(h))`（1 ポートでも空いていれば true）

2. **`firstFreeIn` 型マッチング改善** (CameraCard / WirelessCard)
   - モニター接続時に選択される入力ポートを「ケーブルタイプが一致する空きポート優先、なければ任意の空きポート」に変更
   - SDI OUT → SDI IN、HDMI OUT → HDMI IN が自動選択されるように

3. **デバッグ用 console.log を全削除** (`isMonitorAvailable` 内 + `ScenePanel` 本体)

**ビルド:** エラー 0、警告 0

---

## 2026-05-18 (9)

### モニターカード接続状態表示 + エッジ参照型ポート2重接続防止

**変更内容:**

**1. MonitorCard 接続状態表示（読み取り専用）**
- `getMonitorConnectionInfo(mon, scene)` ヘルパー関数を追加
- 表示内容: 接続元機材名 + 出力ポート → 入力ポート + ケーブルタイプ
- 未接続時は赤字で「未接続」を表示
- scene ステートから毎レンダリング再計算されるためリアルタイム更新

**2. エッジ参照型ポート2重接続防止（全機材対象）**
- `App.tsx`: `edges={rfEdges}` を ScenePanel に渡すように変更
- `ScenePanel`: `edges` props を受け取り、全エッジ（auto + locked + WIRELESS）から `usedHandles: Set<string>` を構築
- ハンドルID形式: `${uid}_${modelId}_p${portIdx}` （instantiate() と完全一致）
- ヘルパー関数: `camHandle()`, `rxHandle()`, `monHandle()` でハンドルID生成
- `isMonitorAvailable(mon, sourceHandle, usedHandles, edges)` 関数:
  - モニターのどの入力ポートもすでに使用中でなければ選択可
  - 現在このソースポートから接続済みなら選択可（変更・確認用）
- **CameraCard**: 出力ポートごとに `usedHandles` を参照し使用済みモニター入力を除外
- **WirelessCard**: RX出力ポートと接続先モニター入力を `usedHandles` で動的フィルタリング
- **モニター入力ポートセレクター**: 未使用 or 現在選択中のポートのみ表示
- **RX出力ポートセレクター**: RX に複数出力がある場合も使用済みを除外

**ビルド:** エラー 0、警告 0

---

## 2026-05-18 (8)

### UI改善: 接続方向反転・ポート2重接続防止・ノードクリックハイライト

**変更内容:**

1. **接続方向を反転（カメラ視点に変更）**
   - `CameraCard` に「接続先」セクションを追加: 各出力ポートに対してどのモニターへ繋ぐかを選択
   - `MonitorCard` から「接続元」セクションを削除（シンプルな情報表示カードに）
   - `handleSetCameraOutput(camId, portIdx, portType, monId, monPortIdx)` ハンドラ追加

2. **ポートの2重接続防止**
   - `CameraCard` の接続先セレクター: すでに別のポートに接続済みのモニターは選択肢から除外
   - `WirelessCard` の RX→モニター セレクター: すでに他ソースに接続済みのモニターは除外
   - フィルタ条件: `!m.sourceId || (m.sourceId === sourceId && m.sourcePortIdx === portIdx)`

3. **リアルタイム接続チェック**
   - `InfoPanel.validate()` は既にpropsから毎レンダリング再計算済みのため変更不要（確認）

4. **ノードクリック→右パネルカードハイライト＋自動スクロール**
   - `App.tsx`: `resolveEntityId(nodeId, scene)` 関数追加（ノードID→エンティティID変換）
   - `App.tsx`: `selectedNodeEntityId` ステート追加
   - `App.tsx`: `handleNodeClick` を更新（ReactFlow Node 型を受け取りentityIdを算出）
   - `ScenePanel.tsx`: `highlightedEntityId?: string | null` プロップ追加
   - `Card` コンポーネント: `entityId`/`highlighted` プロップ追加、ハイライト時は青ボーダー (#005BA6) + 青グロー
   - `scrollBodyRef` + `useEffect` でハイライト変化時に `scrollIntoView({ behavior: "smooth" })`

**ビルド:** エラー 0、警告 0

---

## 2026-05-18 (7)

### Claude Code Automations 設定 + spec-verifier による全機材スペック検証・修正

**設定ファイル新規作成:**
- `.claude/skills/add-equipment/SKILL.md` — 機材スペック調査→DB追加の繰り返しワークフローをスキル化
- `.claude/agents/spec-verifier.md` — equipmentDB.ts のスペックを公式サイトと照合するサブエージェント定義
- `.claude/settings.json` — TypeScript エラー自動検知 Hook（Edit/Write 後に `tsc --noEmit` を自動実行）

**spec-verifier による検証結果（全50機種）:**

重大エラー（ports[] に影響）:
- `v_raptor`: SDI out × 3 → × 2 に修正（3本は V-Raptor XL のみ、標準モデルは 2本）
  - ソース: RED docs.red.com V-Raptor Operation Guide
- `smallhd_indie7`: HDMI out が未定義 → ports に HDMI out を追加
  - ソース: SmallHD Indie 7 Quick Start Guide（port K として明示）

軽微修正（richSpec のみ、ports[] への影響なし）:
- `fx9`: richSpec の SDI outputs を 3G×2 → 12G×1 + 3G×1 に分割修正
- `atomos_sumo19`: richSpec の SDI inputs を 3G×4 → 12G×1 + 3G×3 に分割修正
- `hollyland_pyroh_tx`: HDMI standard null → "1.4" に修正

要追加調査:
- `fsi_dm240w`: DM240W の独立スペックページが見つからず（DM242 等と混在の可能性）

**ビルド:** エラー 0、警告 0

---

## 2026-05-18 (6)

### ポート個別管理・番号付き表示・使用済み除外

**equipmentDB.ts:**
- `inputPortOptions()` / `outputPortOptions()` の戻り値に `type: string` フィールドを追加
  - ケーブル種別の自動導出に使用

**ScenePanel.tsx（全面書き直し）:**
- `MonitorCard` の接続元セクションを全面改修:
  - 接続元エンティティ選択後に「出力ポート」ドロップダウンを追加
  - 他のモニターが既に使用中のポートは選択肢から除外（`usedSourcePortKeys` による追跡）
  - 出力ポートが1つの場合はドロップダウン非表示（テキストラベルのみ）
  - ターゲット入力ポート（このモニターのどの入力を使うか）を複数ある場合のみ表示
  - ケーブル種別は出力ポート種別から自動導出 → `CableBadge` で表示（手動選択廃止）
  - 接続元エンティティ変更時に `sourcePortIdx` / `targetPortIdx` を自動初期割当
  - 利用可能な出力ポートが0の場合は赤色のエラーメッセージ表示
- `CableBadge` コンポーネント新規追加（SDI/HDMI をカラーバッジ表示）
- `WirelessCard` のRXユニットセクションを改修:
  - 接続先モニターの「入力ポート」ドロップダウンを追加（複数入力ある機材のみ）
  - 手動ケーブル種別セレクタを廃止 → `CableBadge` 表示に変更
  - 接続設定時に `rxPortIdx`（RX出力）/ `monPortIdx`（モニター入力）を自動設定
- `onSetRxMonitor` シグネチャ更新: `(rxId, monId, cableType, rxPortIdx?, monPortIdx?)`
- `removeCamera` / `removeMonitor` / `handleRemoveRxUnit` / `removeWirelessSet`:
  - `sourcePortIdx` / `targetPortIdx` も合わせてクリアするよう修正

**App.tsx:**
- `INITIAL_SCENE` を更新: mon1/mon2 に `sourcePortIdx` / `targetPortIdx` を明示的に設定
  - mon1 (SmallHD Cine 7 ← FX6): sourcePortIdx=0(SDI OUT), targetPortIdx=0(SDI IN 1)
  - mon2 (Shogun 7 ← wireless_rx): sourcePortIdx=1(SDI OUT), targetPortIdx=0(SDI IN)

**ビルド:** エラー 0、警告 0

---

## 2026-05-18 (5)

### 接続設定UI + 自動エッジ生成 + バリデーションパネル

**方針変更**: 「全手動ドラッグ」→「パネルで接続先選択 → 自動線生成、手動変更も可能」

**types.ts:**
- `MonitorInstance` に `sourceId?: string`（カメラ/RX/モニターID）と `cableType?: string` を追加
- `WirelessSetInstance.destinationIds` を `optional` に変更（deprecated）

**setupToFlow.ts:**
- `MonitorInstance.sourceId` から自動エッジ生成ロジックを追加
- カメラ→モニター、RX→モニター、モニター→モニターの3パターン対応
- ケーブル種類に応じたハンドル選択（WIRELESS は除外）

**ScenePanel.tsx（全面書き直し）:**
- `MonitorCard`: 接続元ドロップダウン（カメラ/ワイヤレスRX/モニターをoptgroup分け）+ ケーブル種類セレクタを追加
- `MonitorCard`: 接続状態ドット（緑=接続済み、赤=未接続）を追加
- `WirelessCard`: destinationId チェックボックスUI → RXごとの接続先モニター+ケーブル種類UIに変更
- `ScenePanel`: `handleSetRxMonitor`（RX→Monitor 接続更新）、`handleRemoveRxUnit`（RX削除時モニターsourceId自動クリア）、`removeWirelessSet`（セット削除時の全RX接続クリア）を追加
- カメラ・モニター削除時に依存するsourceIdを自動クリアするよう修正

**InfoPanel.tsx（全面書き直し）:**
- 「チェック」タブを追加（エラー/警告/OK状態）
- エラー（赤）: sourceId未設定モニター（未接続）
- 警告（黄）: 接続先モニター未設定のRXユニット
- 問題なし: ✅ 接続チェックOK
- モニタータブ: 接続状態（緑/赤）とケーブル種類を表示

**App.tsx:**
- `INITIAL_SCENE` を更新: mon1→cam1(SDI)、mon2→ws1_rx(SDI)の接続を初期設定

**ビルド:** エラー 0、警告 0

---

## 2026-05-18 (4)

### WIRELESSエッジ根本修正 — React Flow ハンドルID不一致の解消

**根本原因:** React Flow v12 は `sourceHandle` 未指定時に内部で `null` を使い、`id="null"` のハンドルを探す → 存在しないため "Couldn't create edge for source handle id: 'null'" エラーが大量発生し、エッジが描画されなかった。

**types.ts:**
- `Port.type` ユニオン型に `"WIRELESS"` を追加（`"HDMI" | "SDI" | "WIRELESS"`）

**equipmentDB.ts:**
- 全 8 TX モデルの `ports[]` に `{ type: "WIRELESS", direction: "out" }` を末尾に追加
- 全 8 RX モデルの `ports[]` に `{ type: "WIRELESS", direction: "in" }` を先頭に追加
  - 対象: wireless_tx/rx, teradek_bolt6_{lt750,lt1500,xt1500,xt3000}_{tx/rx}, teradek_bolt500xt_{tx/rx}, hollyland_pyroh_{tx/rx}, accsoon_cineview_se_{tx/rx}

**setupToFlow.ts:**
- ワイヤレスエッジ生成時に `eqById` から TX の WIRELESS OUT ポート・RX の WIRELESS IN ポートを動的に検索
- `sourceHandle` / `targetHandle` に実在するハンドル ID を明示的に設定
- デバッグ用 `console.log` を全削除

**EquipmentNode.tsx:**
- `PORT_COLOR` に `WIRELESS: "#9B59B6"` を追加
- `PORT_LABEL` テーブルを追加（`WIRELESS → "RF"`）
- ポートラベル表示で `PORT_LABEL[type]` を優先使用（例: "RF IN" / "RF OUT"）

**CustomEdge.tsx / App.tsx:**
- デバッグ用 `console.log` を全削除

**ビルド:** エラー 0、警告 0

---

## 2026-05-18 (3)

### WIRELESSエッジ正式ケーブル化 + インタラクションアニメーション

**types.ts:**
- `CABLE_COLORS.WIRELESS` を `"#94a3b8"` → `"#9B59B6"`（紫系）に変更

**setupToFlow.ts:**
- ワイヤレスエッジを `type: "custom"` の実線に変更（SDI/HDMI と同じ扱い）
- `CABLE_COLORS.WIRELESS` を import して stroke 色に使用
- `selectable: false`、`deletable: false` で手動操作不可
- wsColor/wsLabel 等のワイヤレス専用フィールドを削除（シンプル化）

**CustomEdge.tsx（全面書き直し）:**
- `isWireless` 向け専用分岐を廃止、ケーブル種別に関わらず同一レンダリングパスで処理
- ラベルは `cableType` をそのまま表示（"WIRELESS" / "SDI" / "HDMI" 等）
- ホバー検知: `<BaseEdge>` を `<g>` で囲み `onMouseEnter/Leave` を追加
- ホバー時: `strokeWidth 2.5 → 3`、`filter: brightness(1.18)` (0.15s ease-out)
- 選択時: `strokeWidth 4`、`filter: drop-shadow(0 0 4px color80)` グロー効果
- ラベルバッジ選択時: `box-shadow: 0 0 0 2px color55`（ハイライト）
- WIRELESS は `interactionWidth: 0` 維持（クリック不可）

**App.tsx:**
- `LEGEND` に `{ label: "WIRELESS", color: CABLE_COLORS["WIRELESS"] }` を追加
- `TopBarBtn` にクリック時 `scale(0.97)` エフェクト追加（0.1s ease-out）

**EquipmentNode.tsx:**
- `Props` に `selected?: boolean`、`dragging?: boolean` を追加
- `hovered` state を追加（onMouseEnter/Leave）
- ホバー時: `box-shadow: 0 4px 14px rgba(0,0,0,0.10)`（0.15s ease-out）
- 選択時: border `#005BA6`、`box-shadow: ring + shadow`、`transform: scale(1.02)`
- ドラッグ時: 強い影（浮いてる感）、`cursor: grabbing`
- CSS transition: `box-shadow / border-color / transform` 全て 0.15s ease-out

**ScenePanel.tsx:**
- `Card` コンポーネントに hover state 追加
- ホバー時: 背景 `#F0F0F2`、ボーダー微強調（0.15s ease-out）

- `npm run build` エラーなし（206 modules）

---

## 2026-05-18 (2)

### ワイヤレスエッジ未表示バグ修正

**setupToFlow.ts:**
- `type: "custom"` + `animated: true` の組み合わせで CSS の `stroke-dasharray` アニメーションが競合し、エッジが描画されないバグを修正
- ワイヤレスエッジを React Flow 組み込みエッジ（`type` 省略 = bezier）に変更
- `animated: false`、`selectable: false`、`deletable: false` を設定
- スタイル: `stroke: "#888888"`, `strokeWidth: 2`, `strokeDasharray: "8 4"` (要件どおり)
- ラベル: `"📡 RF"` または `"📡 RF 1"` を `label` prop で中央表示
- `eqById.has()` チェックを削除しエッジを常に生成（ノード不在時も React Flow が無害に処理）

- `npm run build` エラーなし（206 modules）

---

## 2026-05-18

### 自動レイアウト改善・下部情報パネル・ワイヤレスエッジ改善

**setupToFlow.ts（レイアウト全面見直し）:**
- `SCENE_COL_X` を廃止し信号の流れ順の `COL_X` に置き換え
- 列構成: camera(60) → onboard_mon(300) → wireless_tx(560) → wireless_rx(820) → main_mon(1080) → client_mon(1340) → recorder(1600)
- `addNode()` を `colKey` パラメーター方式に変更（機材タイプではなく列キーで配置決定）
- モニターをロール別に処理: onboard → Col2、focus/director/frontline/other → Col5、client → Col6
- オンボードモニターがカメラの真横（Col2）に配置されるようになった
- ワイヤレスエッジの `style.stroke` を `#94a3b8`（グレー）・ `strokeWidth: 3.5` に変更
- `wsLabel` を `"RF"` から `"WIRELESS"` / `"WIRELESS · N"` に変更

**CustomEdge.tsx（ワイヤレス線スタイル改善）:**
- `isWireless` 時の line color を `wsColor`（カラー系）から `#94a3b8`（グレー固定）に変更
- `strokeWidth: 2.5 → 3.5`、`strokeDasharray: "8 4" → "10 5"` でケーブルらしい太さに
- ラベルバッジに `≋` アイコン追加（電波イメージ）+ `boxShadow` 追加
- ラベル背景は引き続き `wsColor`（セット識別のため色維持）

**InfoPanel.tsx（新規作成）:**
- キャンバス下部固定パネル（高さ 108px）
- タブ切替: 「ケーブル」（使用本数を種類別表示）・「モニター」（機種名＋役割一覧）
- ケーブルタブ: WIRELESS 除外、種類ごとに カラーバー + 名称 + 本数表示
- モニタータブ: equipmentDB の表示名 + SCENE_ROLE_LABELS でロールラベル表示
- ケーブルなし時は説明メッセージを表示

**App.tsx:**
- `InfoPanel` をインポート
- キャンバス列を `flexDirection: column` のラッパーに変更し ReactFlow wrapper に `overflow: hidden` 追加
- キャンバス下部に `<InfoPanel edges={rfEdges} scene={scene} />` を追加

- `npm run build` エラーなし（206 modules）

---

## 2026-05-17 (12)

### TX/RX 視覚的グルーピング強化

**setupToFlow.ts:**
- RF エッジを `animated: true` に変更（流れるアニメーションで TX→RX 方向を表現）
- `strokeWidth: 2 → 2.5` に拡大
- `wsLabel` を data に追加（複数セット時: "RF 1"/"RF 2"、単一時: "RF"）

**CustomEdge.tsx:**
- RF エッジの opacity 制限を撤廃（フル不透明に）
- RF ラベルをベタ塗り（`background: wsColor`、白文字）に変更 — ケーブルラベルと同スタイルに統一
- ラベルテキストを `wsLabel` 変数から取得（セット番号付き対応）

**EquipmentNode.tsx:**
- ワイヤレス TX/RX ノードに `wsColor` ボーダー（1.5px solid）を追加
- 同じセットの TX と RX ノードが同色のボーダーで囲まれ、ペアが一目で分かるように

- `npm run build` エラーなし

---

## 2026-05-17 (11)

### TX/RX カラーグルーピング + リセット時ケーブル保持

**setupToFlow.ts:**
- `WS_PALETTE` 追加（amber/sky/violet/green/red/pink の6色）
- ワイヤレスセットごとに固有色を割り当て（インデックスでパレット循環）
- TX・RX ノードに `wsColor` を data として渡す
- RF エッジも同色に（`style.stroke = wsColor`、`data.wsColor` 追加）
- 複数ワイヤレスセット時は subtitle に "TX · N" / "RX · N" を表示

**EquipmentNode.tsx:**
- `data.wsColor` を受け取り、ノードのアクセントバー・タイプラベル色に適用
- `wsColor ?? TYPE_COLOR[type]` でフォールバック維持

**CustomEdge.tsx:**
- `data.wsColor` を読み取り RF エッジ線色・ラベル色に適用
- ハードコードの `#94a3b8` をすべて `wsColor` 変数に置き換え

**App.tsx:**
- `handleResetLayout` を修正: locked エッジを保持するよう useEffect と同じマージロジックを適用
- ポジションリセット後も手動で引いたケーブルが消えなくなった

- `npm run build` エラーなし

---

## 2026-05-17 (10)

### Phase 4改修完了

**ScenePanel.tsx:**
- `Modal` コンポーネントをインポート
- カメラ追加：機種選択モーダル（確定後に追加）
- モニター追加：機種・役割・割当カメラをモーダルで選択して追加
- ワイヤレス追加：TX機種・RX複数台・送信元カメラをモーダルで選択して追加（RX追加ボタンでモーダル内複数台設定可能）

**App.tsx:**
- `ProjectPanel` / `saveProject` インポート追加
- `projectMeta` 状態（id/name/author/notes/date）と `showProjectPanel` 状態を追加
- トップバー：案件名ボタン（クリックで ProjectPanel 表示）・「保存」ボタン追加
- `isManual` バッジ（手動配線中）を削除（自動配線廃止に伴い不要）
- `handleLoadProject` / `handleNewProject` / `handleSaveProject` ハンドラーを追加
- `<ProjectPanel>` を条件付きレンダリング

- `npm run build` エラーなし（205 modules）

---

## 2026-05-17 (9)

### 大規模リファクタリング: rxUnits / 自動ケーブル生成廃止 / ProjectPanel

**types.ts:**
- `WirelessRxUnit { id, model }` インターフェース追加
- `WirelessSetInstance.rxModel` を削除し `rxUnits: WirelessRxUnit[]` （複数RX対応）に変更
- `Project { id, name, author, date, notes?, scene }` インターフェース追加

**equipmentDB.ts:**
- `teradek_bolt500xt_tx` の SDI OUT ポートを削除（実機にループアウトなし）
- `spec` を "Bolt 500 XT / 3G-SDI+HDMI in · 500ft (no loop-out)" に修正
- `richSpec.outputs` から SDI loopThrough エントリを削除

**generateSetup.ts（完全書き換え）:**
- 自動ケーブル生成ロジックを全廃、機材ノード配置のみに変更
- `connections: []` を返すシンプルな実装

**setupToFlow.ts（完全書き換え）:**
- `sceneToFlow` を rxUnits ベースに対応
- 列ごとの自動Y位置割り当て方式に変更（V_SPACING=200）
- TX→RX RF エッジは rxUnit ごとに生成
- `setupToFlow` エイリアスは型互換のために維持

**Modal.tsx（新規作成）:**
- 汎用モーダルコンポーネント（タイトル・確定/キャンセルボタン・オーバーレイクリックで閉じる）

**ProjectPanel.tsx（新規作成）:**
- localStorage ベースのプロジェクト保存・読み込み・削除
- 案件名・担当者・メモ・保存日時を管理
- 読み込みモーダルは Modal コンポーネントを使用

**ScenePanel.tsx / App.tsx / demo.ts:**
- `rxModel` → `rxUnits` への全移行
- WirelessCard に RX 追加・削除UI追加
- `addWireless` で初期RXユニット1件を自動生成

- `npm run build` エラーなし

---

## 2026-05-17 (8)

### Phase 4: 配線ロジック+UX改善完了

**Phase 4A: 自動配線の挙動改善:**
- `WarningModal` 廃止 — Scene変更は即座に自動更新（確認ダイアログなし）
- エッジロックシステム導入: 手動接続・再接続・ケーブル種類変更で `data.locked: true` が付与される
- ロックされたエッジは Scene更新時も保持（`useEffect` でロックシグネチャ照合）
- `EdgePanel` にロック🔒/解除🔓ボタンを追加
- `CustomEdge` のラベルにロックアイコンを表示
- 優先順位はすでに `generateFromScene` で実装済み（onboard→focus→frontline→director→client）

**Phase 4B: ワイヤレス改善:**
- TX→RX 間に RF 可視化エッジを追加（`sceneToFlow` で生成、selectable: false）
- 点線（`strokeDasharray: "8 4"`）+ "RF" ラベルで電波伝送を表現
- RX 複数台選択は `WirelessSetInstance.destinationIds: string[]` + ScenePanel チェックボックスで既実装

**Phase 4C: 操作性改善:**
- ケーブルのヒットエリア: `interactionWidth` 20 → 30 に拡大
- ポートハンドル: 9×9px → 12×12px に拡大

- `npm run build` エラーなし

---

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
