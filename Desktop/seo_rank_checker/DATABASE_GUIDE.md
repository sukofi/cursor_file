# データベース連携ガイド

## 概要

SEO Rank Checkerは、キーワード・ジャンル・順位情報をSQLiteデータベースに保存することで、スプレッドシートから直接読み込むよりも高速かつ正確にデータを扱えます。

## メリット

### 1. 高速アクセス
- スプレッドシートAPIの呼び出しが不要
- データベースから直接読み込むため、数百件のキーワードでも瞬時に取得

### 2. 精度の向上
- データベースに保存されたデータは変更されないため、常に一貫性を保証
- スプレッドシートの編集中でも影響を受けない

### 3. ジャンル別管理
- ジャンルごとにキーワードをグループ化
- 特定のジャンルのみを選択してチェック可能

### 4. 履歴管理
- 順位履歴をデータベースに保存
- 時系列で順位変動を追跡

## データベース構造

### 1. keywords テーブル

キーワードとジャンル情報を保存します。

| カラム | 型 | 説明 |
|--------|-----|------|
| keyword | TEXT | キーワード（主キー） |
| genre | TEXT | ジャンル/カテゴリ |
| url | TEXT | 関連URL |
| priority | TEXT | 優先度 |
| notes | TEXT | メモ |
| created_at | TEXT | 作成日時 |
| updated_at | TEXT | 更新日時 |

### 2. rankings テーブル

最新の順位情報を保存します。

| カラム | 型 | 説明 |
|--------|-----|------|
| keyword | TEXT | キーワード（主キー、外部キー） |
| last_rank | INTEGER | 最新の順位 |
| last_checked_at | TEXT | 最終チェック日時 |
| last_url | TEXT | 最新のランキングURL |

### 3. competitors テーブル

競合情報を保存します。

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER | ID（自動採番） |
| keyword | TEXT | キーワード（外部キー） |
| url | TEXT | 競合URL |
| rank | INTEGER | 順位 |
| checked_at | TEXT | チェック日時 |

## 使い方

### 1. スプレッドシートからデータベースへ同期

初回または新しいキーワードを追加した際は、スプレッドシートからデータベースに同期します。

```bash
python sync_keywords.py
```

#### 自動カラム検出

`sync_keywords.py` は、スプレッドシートのカラム名を自動的に検出します：

| カラム種類 | 検出するカラム名（部分一致） |
|-----------|----------------------------|
| キーワード | `キーワード`, `keyword`, `kw` |
| ジャンル | `ジャンル`, `カテゴリ`, `genre`, `category` |
| URL | `url`, `リンク`, `link` |
| 優先度 | `優先度`, `priority`, `重要度` |
| メモ | `メモ`, `note`, `備考` |

#### 手動でカラムを指定

自動検出がうまくいかない場合は、手動でカラム名を指定できます：

```bash
python sync_keywords.py \
  --keyword-column "キーワード" \
  --genre-column "カテゴリ" \
  --url-column "URL" \
  --priority-column "優先度" \
  --notes-column "メモ"
```

### 2. データベースからキーワードを取得して順位チェック

同期後は、データベースから直接キーワードを取得できます。

#### 全キーワードをチェック

```bash
python main.py
```

#### ジャンルを指定してチェック

```bash
python main.py --genre "買取"
```

特定のジャンルのキーワードのみをチェックします。

### 3. データベースの確認

データベースの内容を確認するには、SQLiteクライアントを使用します。

```bash
sqlite3 rankings.db
```

#### よく使うSQLコマンド

**全キーワードを表示:**
```sql
SELECT * FROM keywords;
```

**ジャンル別の集計:**
```sql
SELECT genre, COUNT(*) as count 
FROM keywords 
GROUP BY genre 
ORDER BY count DESC;
```

**最新の順位情報を表示:**
```sql
SELECT k.keyword, k.genre, r.last_rank, r.last_checked_at
FROM keywords k
LEFT JOIN rankings r ON k.keyword = r.keyword
ORDER BY k.genre, k.keyword;
```

**順位が下落したキーワードを表示:**
```sql
SELECT keyword, last_rank, last_checked_at
FROM rankings
WHERE last_rank > 5
ORDER BY last_rank DESC;
```

## 同期のタイミング

### 定期的な同期

キーワードリストが変更された場合は、再度同期してください：

```bash
python sync_keywords.py
```

既存のキーワードは更新され、新しいキーワードは追加されます。

### 自動同期（オプション）

cronで定期的に同期することもできます（例: 毎日午前3時）：

```bash
crontab -e
```

```cron
0 3 * * * cd /path/to/seo_rank_checker && /usr/local/bin/python3 sync_keywords.py >> /path/to/logs/sync.log 2>&1
```

## トラブルシューティング

### エラー: キーワードカラムが見つかりませんでした

**原因:** スプレッドシートのカラム名が自動検出できませんでした。

**解決策:** `--keyword-column` オプションで明示的に指定してください。

```bash
python sync_keywords.py --keyword-column "キーワード"
```

### エラー: データベースにキーワードが登録されていません

**原因:** データベースが空です。

**解決策:** `sync_keywords.py` を実行してスプレッドシートから同期してください。

```bash
python sync_keywords.py
```

### エラー: スプレッドシート機能が利用できません

**原因:** OAuth認証が設定されていません。

**解決策:** OAuth認証をセットアップしてください。

```bash
python oauth_setup.py
```

詳細は [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) を参照してください。

## 高度な使い方

### Python APIでの直接操作

`storage.py` のAPIを使って、プログラムから直接データベースを操作できます。

```python
from storage import RankingStorage

# ストレージを初期化
storage = RankingStorage("rankings.db")

# 全キーワードを取得
keywords = storage.get_all_keywords()
for kw in keywords:
    print(f"{kw['keyword']} - {kw['genre']}")

# ジャンル別にキーワードを取得
kaitori_keywords = storage.get_keywords_by_genre("買取")
print(f"買取ジャンル: {len(kaitori_keywords)} 件")

# 全ジャンルを取得
genres = storage.get_all_genres()
print(f"ジャンル一覧: {genres}")

# キーワード情報と順位情報を結合して取得
keywords_with_rankings = storage.get_keywords_with_rankings()
for kw in keywords_with_rankings:
    print(f"{kw['keyword']} ({kw['genre']}): {kw['last_rank']}位")
```

### 新しいキーワードを追加

プログラムから直接キーワードを追加できます。

```python
from storage import RankingStorage

storage = RankingStorage("rankings.db")

# 単一のキーワードを追加
storage.save_keyword(
    keyword="新しいキーワード",
    genre="買取",
    url="https://example.com/new",
    priority="高",
    notes="新規追加"
)

# 複数のキーワードをバッチで追加
keywords_data = [
    {
        "keyword": "キーワード1",
        "genre": "買取",
        "url": "https://example.com/1",
        "priority": "高",
        "notes": "メモ1"
    },
    {
        "keyword": "キーワード2",
        "genre": "査定",
        "url": "https://example.com/2",
        "priority": "中",
        "notes": "メモ2"
    }
]

storage.save_keywords_batch(keywords_data)
```

### キーワードを削除

```python
from storage import RankingStorage

storage = RankingStorage("rankings.db")

# キーワードを削除（関連する順位情報も削除されます）
storage.delete_keyword("削除するキーワード")
```

## まとめ

データベース連携により、以下のメリットが得られます：

✅ **高速**: スプレッドシートAPIの呼び出しが不要  
✅ **正確**: 常に一貫性のあるデータを保証  
✅ **柔軟**: ジャンル別にキーワードを管理  
✅ **履歴**: 順位変動を時系列で追跡  

キーワードリストが変更された場合は、`sync_keywords.py` を実行して再同期してください。
