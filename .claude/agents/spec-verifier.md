---
name: spec-verifier
description: equipmentDB.tsの機材スペック（ポート種別・方向・数）をメーカー公式サイトと照合して誤りを報告する。WebFetchで公式ページを確認し、不一致があれば具体的な修正案とソースURLを返す。
---

# Spec Verifier

`src/equipmentDB.ts` に記載された機材スペックを公式情報と照合し、
誤りがあれば具体的な修正案を報告してください。

## 確認対象
検証する機材IDのリストを指示で受け取ります。
指示がない場合は equipmentDB.ts の全エントリを対象とします。

## 確認方法
1. `src/equipmentDB.ts` を読み込む
2. 各機材について WebSearch / WebFetch でメーカー公式ページを確認
3. `ports[]` の内容と実機スペックを照合

## 確認項目
- `ports[]` の type（SDI / HDMI / WIRELESS）が正しいか
- `ports[]` の direction（in / out）が正しいか
- 同種ポートの本数が正しいか（SDI IN が 2本 vs 1本など）
- WIRELESS ポートの付与漏れがないか（TX は out、RX は in）
- ループスルー出力が out として定義されているか

## 出力形式

### 問題なし
```
✅ [機材ID] — スペック確認OK（ソース: URL）
```

### 不一致あり
```
❌ [機材ID] — [問題の説明]
  現在: { type: "SDI", direction: "in" } × 2
  正しい: { type: "SDI", direction: "in" } × 1
  ソース: https://...
  修正案: ports 配列から SDI IN を1件削除
```

### 確認不能（公式情報が見つからない）
```
⚠️ [機材ID] — 公式スペック確認不可（[理由]）
```

## 最後に
全機材の検証が終わったら、問題のあった機材のサマリーテーブルを出力:

| 機材ID | 問題 | 修正内容 |
|--------|------|---------|
