# 💾 データベース保存機能 - 変更履歴

## 🎯 実装内容

競合分析結果をデータベースに保存し、履歴として追跡できる機能を実装しました。

## 📝 変更ファイル

### 1. データベーススキーマ

#### `storage.py`
- **新規テーブル追加**: `competitor_analysis`
  - 競合分析結果を保存
  - キーワードごとに履歴を保持
  - 見出し数、文字数、画像数、内部リンク数の詳細を保存
  
- **新規インデックス追加**: `idx_competitor_analysis_keyword_checked_at`
  - キーワードと日時での検索を高速化

- **新規メソッド追加**:
  - `save_competitor_analysis()` - 競合分析結果を保存
  - `get_latest_competitor_analysis()` - 最新の分析結果を取得
  - `get_competitor_analysis_history()` - 分析履歴を取得（最大N件）

### 2. 順位チェックロジック

#### `rank_checker.py`
- `_analyze_competitors_for_dropped_keywords()` メソッドを更新
  - 競合分析実行後、結果をデータベースに自動保存
  - エラーハンドリングを追加（保存失敗時も処理続行）

### 3. 通知機能

#### `notifier.py`
- `_format_competitor_analysis()` メソッドを更新
  - タイトルを「(今回)」に変更（将来的に過去との比較を追加予定）

## 📊 データベーススキーマ

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
```

## 🔄 動作フロー

```
順位下落検出
    ↓
競合分析実行（上位N件）
    ↓
各キーワードについて:
  1. 自社サイトを分析
  2. 上位3競合サイトを分析
  3. 差分を計算
  4. 分析結果をメモリに保存
  5. 👉 データベースに保存（NEW！）
    ↓
Discord通知
```

## 💾 保存されるデータ

### 自社データ
- 見出し数
- 文字数
- 画像数
- 内部リンク数

### 競合平均
- 平均見出し数
- 平均文字数
- 平均画像数
- 平均内部リンク数

### 差分
- 見出し数の差分
- 文字数の差分
- 画像数の差分
- 内部リンク数の差分

### メタデータ
- 分析時の順位
- 前回順位
- 分析日時

## 📈 活用方法

### 1. 最新の分析結果を取得

```python
from storage import RankingStorage

storage = RankingStorage('rankings.db')
result = storage.get_latest_competitor_analysis("中古車 買取 相場")

print(f"見出し差分: {result['differences']['heading_diff']}")
print(f"文字数差分: {result['differences']['text_length_diff']}")
```

### 2. 履歴を取得

```python
# 最新10件の分析履歴を取得
history = storage.get_competitor_analysis_history("中古車 買取 相場", limit=10)

for analysis in history:
    print(f"{analysis['checked_at']}: 順位{analysis['rank_at_analysis']}位")
```

### 3. 改善効果を確認

```python
history = storage.get_competitor_analysis_history("中古車 買取 相場", limit=2)

if len(history) >= 2:
    latest = history[0]
    previous = history[1]
    
    # 見出し数の改善度
    heading_improvement = latest['own']['heading_count'] - previous['own']['heading_count']
    print(f"見出し数: {heading_improvement:+d}個")
    
    # 順位の変化
    rank_change = latest['rank_at_analysis'] - previous['rank_at_analysis']
    print(f"順位: {rank_change:+d}")
```

### 4. SQL直接クエリ

```sql
-- 文字数不足が顕著なキーワードTop10
SELECT 
    keyword, 
    own_text_length,
    competitor_avg_text_length,
    text_length_diff,
    rank_at_analysis
FROM competitor_analysis
WHERE text_length_diff < -1000
ORDER BY text_length_diff ASC
LIMIT 10;

-- 改善トレンド（過去30日）
SELECT 
    DATE(checked_at) as date,
    AVG(heading_diff) as avg_heading_diff,
    AVG(text_length_diff) as avg_text_diff
FROM competitor_analysis
WHERE checked_at > date('now', '-30 days')
GROUP BY DATE(checked_at)
ORDER BY date DESC;
```

## 🎉 メリット

### 1. 改善効果の可視化
- 過去のデータと比較して改善効果を確認
- 施策の効果を数値で評価

### 2. トレンド分析
- 複数キーワードの傾向を分析
- 時系列での変化を追跡

### 3. データドリブンな意思決定
- 数値に基づいた改善判断
- 優先度の高いキーワードを特定

### 4. レポート作成
- 定期的な分析レポートの作成
- SQLでカスタムレポートを生成

### 5. 履歴管理
- 過去の分析結果を保持
- いつでも過去のデータを参照可能

## 🔧 マイグレーション

### 自動マイグレーション

テーブルは自動的に作成されます。既存のデータベースに対しても安全に適用できます。

```bash
# 次回の順位チェック実行時に自動作成
python main.py
```

または

```
!rank  # Discord Bot
```

### バックアップ（推奨）

```bash
# 念のためバックアップを作成
cp rankings.db rankings.db.backup
```

## 📊 データサイズ

### 推定サイズ

- 1レコードあたり: 約200-300バイト
- 100キーワード × 10回分析 = 約200-300KB
- 年間（週1回 × 52週 × 100KW） = 約10-15MB

### メンテナンス

古いデータを定期的に削除することを推奨：

```sql
-- 90日以上前のデータを削除
DELETE FROM competitor_analysis
WHERE checked_at < date('now', '-90 days');

-- VACUUM でデータベースを最適化
VACUUM;
```

## 🚀 今後の拡張案

### Phase 2（検討中）

- [ ] Discord通知に過去との比較を追加
  - 「前回より見出し+3個改善」など
- [ ] ダッシュボード機能
  - Web UIで履歴を可視化
- [ ] グラフ生成
  - 時系列グラフを自動生成
- [ ] アラート機能
  - 差分が一定以上の場合に警告

### Phase 3（検討中）

- [ ] 機械学習による予測
  - 改善施策の効果を予測
- [ ] A/Bテスト支援
  - 複数の改善案の効果を比較

## 📚 関連ドキュメント

- [DATABASE_SCHEMA_UPDATE.md](DATABASE_SCHEMA_UPDATE.md) - スキーマ詳細
- [COMPETITOR_ANALYSIS_GUIDE.md](COMPETITOR_ANALYSIS_GUIDE.md) - 競合分析ガイド
- [README.md](README.md) - 全体ドキュメント

## ⚠️ 注意事項

1. **自動保存**: 競合分析実行時に自動的に保存されます
2. **エラー処理**: 保存失敗時もメイン処理は続行します
3. **外部キー制約**: `keywords`テーブルに存在するキーワードのみ保存可能
4. **データ整合性**: 分析に失敗した場合は保存されません

## 🔍 トラブルシューティング

### データが保存されない

```bash
# ログを確認
python main.py 2>&1 | grep "競合分析結果"

# データベースを確認
sqlite3 rankings.db "SELECT COUNT(*) FROM competitor_analysis;"
```

### データベースロックエラー

```python
# 接続を適切にクローズ
conn.close()
```

---

**実装日**: 2026-02-03
**バージョン**: v2.2
**変更内容**: 競合分析結果のデータベース保存機能を追加
