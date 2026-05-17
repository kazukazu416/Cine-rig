# パイプライン概要

```
Input → generateSetup() → Connection Graph → Cable Generator → React Flow UI
```

---

# データモデル

```ts
interface Scene {
  cameras: CameraInstance[];
  wirelessSets: WirelessSetInstance[];
  monitors: MonitorInstance[];
  recorders: RecorderInstance[];
}

interface CameraInstance {
  id: string;
  model: string;
  label?: string;
}

interface WirelessSetInstance {
  id: string;
  model: string;
  sourceId: string;         // 入力元（カメラID または モニターID）
  destinationIds: string[]; // 接続先モニターのID配列
}

interface MonitorInstance {
  id: string;
  model: string;
  role: "onboard" | "focus" | "frontline" | "director" | "client" | "other";
  customLabel?: string;
}
```

---

# 自動配線ロジック

**ステップ1: オンボードモニター**
- カメラに直結（SDI優先、なければHDMI）

**ステップ2: ワイヤレスセットの解決**
- source の OUT → wireless TX
- wireless RX → destinations の先頭モニター
- 残りの destinations → ループスルー or 分配器

**ステップ3: 有線接続の残りモニター**
- 役割優先順位順に接続

**ステップ4: ループスルー判定**
- ≤4台 → ループスルー
- ≥5台 → 分配器追加

**ステップ5: レコーダー**
- カメラのSDI OUT2優先
- なければループスルー

---

# UI構成（新）

- **左サイドバー**: 機材ライブラリ（カテゴリ別、検索）
- **中央**: キャンバス（配線図）
- **右サイドバー**: シーン構成パネル
  - カメラセクション
  - ワイヤレスセクション（複数セット、接続先選択）
  - モニターセクション（役割・機種設定）
  - レコーダーセクション
- **上部**: タブ切替・ツールバー
- **右下**: ミニマップ
