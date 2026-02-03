# 📊 データベーススキーマ更新 - 競合分析テーブル

## 概要

競合分析結果をデータベースに保存し、履歴として追跡できるように新しいテーブル `competitor_analysis` を追加しました。

## 📝 変更内容

### 新規テーブル: `competitor_analysis`

競合分析の結果を保存するテーブルです。

```sql
CREATE TABLE IF NOT EXISTS competitor_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    own_url TEXT NOT NULL,
    own_heading_count INTEGER,
    own_text_length INTEGER,
    own_image_count INTEGER,
    own_internal_link_count INTEGER,
    competitor_avg_headings REAL,
    competitor_avg_text_length REAL,
    competitor_avg_images REAL,
    competitor_avg_internal_links REAL,
    heading_diff REAL,
    text_length_diff REAL,
    image_diff REAL,
    internal_link_diff REAL,
    rank_at_analysis INTEGER,
    previous_rank INTEGER,
    checked_at TEXT NOT NULL,
    FOREIGN KEY (keyword) REFERENCES keywords(keyword)
);

CREATE INDEX IF NOT EXISTS idx_competitor_analysis_keyword_checked_at 
ON competitor_analysis(keyword, checked_at DESC);
```

### カラム説明

| カラム | 型 | 説明 |
|--------|---|------|
| `id` | INTEGER | 主キー（自動採番） |
| `keyword` | TEXT | キーワード |
| `own_url` | TEXT | 自社URL |
| `own_heading_count` | INTEGER | 自社の見出し数 |
| `own_text_length` | INTEGER | 自社の文字数 |
| `own_image_count` | INTEGER | 自社の画像数 |
| `own_internal_link_count` | INTEGER | 自社の内部リンク数 |
| `competitor_avg_headings` | REAL | 競合の平均見出し数 |
| `competitor_avg_text_length` | REAL | 競合の平均文字数 |
| `competitor_avg_images` | REAL | 競合の平均画像数 |
| `competitor_avg_internal_links` | REAL | 競合の平均内部リンク数 |
| `heading_diff` | REAL | 見出し数の差分 |
| `text_length_diff` | REAL | 文字数の差分 |
| `image_diff` | REAL | 画像数の差分 |
| `internal_link_diff` | REAL | 内部リンク数の差分 |
| `rank_at_analysis` | INTEGER | 分析時の順位 |
| `previous_rank` | INTEGER | 前回順位 |
| `checked_at` | TEXT | 分析日時（ISO 8601形式） |

## 🔄 マイグレーション

### 自動マイグレーション

`RankingStorage`クラスの`__init__`メソッドで自動的にテーブルが作成されます。

既存のデータベースに対しても、次回の順位チェック実行時に自動的にテーブルが追加されます。

```python
from storage import RankingStorage

# 既存のデータベースを開く（テーブルが自動作成される）
storage = RankingStorage('rankings.db')
```

### 手動確認

```bash
# データベースを確認
sqlite3 rankings.db

# テーブルが作成されているか確認
.tables

# スキーマを確認
.schema competitor_analysis

# データを確認
SELECT * FROM competitor_analysis LIMIT 5;
```

## 💾 保存されるデータ

### 1. 競合分析実行時

順位が下落したキーワードについて、競合分析が実行されると自動的に保存されます。

```python
storage.save_competitor_analysis(
    keyword="中古車 買取 相場",
    own_url="https://example.com/car",
    own_data={
        'heading_count': 12,
        'text_length': 2500,
        'image_count': 8,
        'internal_link_count': 15
    },
    competitor_avg={
        'headings': 18.3,
        'text_length': 4200,
        'images': 12.7,
        'internal_links': 22.3
    },
    differences={
        'heading_diff': -6.3,
        'text_length_diff': -1700,
        'image_diff': -4.7,
        'internal_link_diff': -7.3
    },
    rank_at_analysis=7,
    previous_rank=3
)
```

### 2. データの取得

```python
# 最新の競合分析結果を取得
latest = storage.get_latest_competitor_analysis("中古車 買取 相場")

# 履歴を取得（最新10件）
history = storage.get_competitor_analysis_history("中古車 買取 相場", limit=10)
```

## 📊 活用例

### 1. 改善効果の確認

過去の分析結果と比較して、改善が効果的だったか確認できます。

```python
# 履歴を取得
history = storage.get_competitor_analysis_history("中古車 買取 相場", limit=5)

# 時系列で差分を確認
for i, analysis in enumerate(history):
    print(f"{i+1}. {analysis['checked_at'][:10]}")
    print(f"   順位: {analysis['rank_at_analysis']}位")
    print(f"   見出し差分: {analysis['differences']['heading_diff']}")
    print(f"   文字数差分: {analysis['differences']['text_length_diff']}")
```

### 2. トレンド分析

複数のキーワードの分析結果から、全体的な傾向を把握できます。

```sql
-- 全キーワードの平均差分
SELECT 
    AVG(heading_diff) as avg_heading_diff,
    AVG(text_length_diff) as avg_text_diff,
    AVG(image_diff) as avg_image_diff
FROM competitor_analysis
WHERE checked_at > date('now', '-7 days');
```

### 3. 改善優先度の判定

差分が大きいキーワードを抽出して優先的に改善します。

```sql
-- 文字数不足が顕著なキーワード
SELECT keyword, text_length_diff, rank_at_analysis
FROM competitor_analysis
WHERE text_length_diff < -1000
ORDER BY text_length_diff ASC
LIMIT 10;
```

## 🔧 メンテナンス

### 古いデータの削除

```sql
-- 90日以上前のデータを削除
DELETE FROM competitor_analysis
WHERE checked_at < date('now', '-90 days');
```

### データサイズの確認

```sql
-- 保存されているレコード数
SELECT COUNT(*) FROM competitor_analysis;

-- キーワードごとのレコード数
SELECT keyword, COUNT(*) as count
FROM competitor_analysis
GROUP BY keyword
ORDER BY count DESC
LIMIT 10;
```

## 📚 関連API

### `storage.py` に追加されたメソッド

| メソッド | 説明 |
|---------|------|
| `save_competitor_analysis()` | 競合分析結果を保存 |
| `get_latest_competitor_analysis()` | 最新の競合分析結果を取得 |
| `get_competitor_analysis_history()` | 競合分析の履歴を取得 |

詳細は `storage.py` のコードを参照してください。

## ⚠️ 注意事項

1. **自動作成**: 次回の順位チェック実行時に自動的にテーブルが作成されます
2. **既存データへの影響**: 既存のテーブル（`keywords`, `rankings`, `competitors`）には影響しません
3. **バックアップ**: 重要なデータがある場合は、念のためバックアップを取ることを推奨します

```bash
# バックアップ作成
cp rankings.db rankings.db.backup
```

## 🎉 メリット

1. **改善効果の可視化**: 過去のデータと比較して改善効果を確認
2. **トレンド分析**: 複数キーワードの傾向を分析
3. **優先度判定**: 差分が大きいキーワードを優先的に改善
4. **レポート生成**: 定期的な分析レポートの作成が可能
5. **データドリブン**: 数値に基づいた改善判断

---

**更新日**: 2026-02-03
**バージョン**: v2.2
