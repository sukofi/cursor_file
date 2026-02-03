# 📉 順位下落時の自動競合差分分析機能 - 変更履歴

## 🎯 実装内容

順位が下落したキーワードについて、自動的に競合サイトとの差分を分析し、改善提案を提示する機能を実装しました。

## 📝 変更ファイル

### 1. 設定ファイル

#### `config/settings.yaml`
```yaml
# 新規追加
enable_competitor_analysis: true  # 下落時に競合分析を自動実行
max_competitor_analysis_keywords: 5  # 競合分析を実行する下落キーワードの最大数
use_selenium: true  # JavaScript対応のためSeleniumを使用
```

### 2. コアロジック

#### `rank_checker.py`
- `CompetitorAnalyzer`のインポートを追加
- `__init__`メソッドに`competitor_analyzer`パラメータを追加
- `check_rankings`メソッドに以下のパラメータを追加：
  - `enable_competitor_analysis`
  - `max_competitor_analysis_keywords`
- 新メソッド追加: `_analyze_competitors_for_dropped_keywords`
  - 下落幅が大きい順にソート
  - 上位N件のキーワードについて競合分析を実行
  - 自社URLと競合URLを比較
  - 分析結果を下落キーワードデータに追加

### 3. 通知機能

#### `notifier.py`
- `_format_dropped_keyword`メソッドを更新
  - 競合分析結果があれば表示するように変更
- 新メソッド追加: `_format_competitor_analysis`
  - 見出し数、文字数、画像数、内部リンク数の比較表を生成
  - 改善提案を自動生成
  - Discord通知用にフォーマット

### 4. メインエントリーポイント

#### `main.py`
- `CompetitorAnalyzer`のインポートを追加
- 競合分析機能の初期化コードを追加
- `RankChecker`インスタンス作成時に`competitor_analyzer`を渡す
- `check_rankings`呼び出し時に以下のパラメータを追加：
  - `enable_competitor_analysis`
  - `max_competitor_analysis_keywords`

### 5. Discord Bot

#### `discord_bot.py`
- `setup_clients`メソッドに競合分析機能の初期化を追加
- `rank_check`コマンドで競合分析を有効化
  - `RankChecker`に`competitor_analyzer`を渡す
  - `check_rankings`に競合分析パラメータを渡す

### 6. ドキュメント

#### `README.md`
- 特徴セクションに「自動競合差分比較」を追加
- 動作フローに「自動競合差分分析」ステップを追加
- 設定方法に競合分析の設定を追加
- 順位下落時の自動分析についてのセクションを追加

#### `COMPETITOR_ANALYSIS_GUIDE.md` (新規作成)
- 競合差分分析機能の詳細ガイド
- 設定方法、使い方、分析項目の説明
- トラブルシューティング
- ベストプラクティス

## 🔄 動作フロー

```
順位チェック実行
    ↓
下落キーワード検出
    ↓
[enable_competitor_analysis = true の場合]
    ↓
下落幅でソート（大きい順）
    ↓
上位N件を選択（デフォルト: 5件）
    ↓
各キーワードについて:
  1. 自社URLを分析（見出し、文字数、画像、リンク）
  2. 上位3競合URLを分析
  3. 平均値を計算
  4. 差分を計算
  5. 改善提案を生成
    ↓
Discord通知（差分レポート含む）
```

## 📊 分析内容

| 項目 | 内容 |
|-----|------|
| **見出し数** | H1-H6タグの総数を比較 |
| **文字数** | 本文の総文字数を比較 |
| **画像数** | imgタグの総数を比較 |
| **内部リンク数** | 同一ドメイン内リンク数を比較 |

## 💡 改善提案のロジック

```python
if heading_diff < -2:
    "見出しを約X個追加"
    
if text_diff < -500:
    "約X文字のコンテンツを追加"
    
if image_diff < -2:
    "画像を約X枚追加"
    
if link_diff < -3:
    "内部リンクを約X個追加"
```

## 🎯 使用例

### コマンドライン

```bash
# 全キーワードをチェック（競合分析は自動実行）
python main.py

# ジャンル指定
python main.py --genre "買取"
```

### Discord Bot

```
!rank          # 全キーワードをチェック
!rank 10       # 最初の10件のみチェック
```

## 📱 Discord通知の例

```
**キーワード**: `中古車 買取 相場`
**順位変動**: 3位 → 7位 (▼4)
**自社URL**: https://example.com/car

**📊 競合との差分分析**:
```
項目          自社  競合平均  差分
----------------------------------------
見出し数        12      18.3     -6
文字数       2,500   4,200  -1,700
画像数           8      12.7     -5
内部リンク      15      22.3     -7
```

**💡 改善提案**:
  • 見出しを約6個追加
  • 約1,700文字のコンテンツを追加
  • 画像を約5枚追加
  • 内部リンクを約7個追加
```

## ⚙️ 設定オプション

| パラメータ | デフォルト | 説明 |
|----------|----------|------|
| `enable_competitor_analysis` | `false` | 競合分析を有効化 |
| `max_competitor_analysis_keywords` | `5` | 分析する最大キーワード数 |
| `use_selenium` | `true` | Seleniumを使用してJS対応 |

## 🔧 依存関係

既存の依存パッケージで動作します：

- `selenium` - ブラウザ自動化
- `beautifulsoup4` - HTML解析
- `requests` - HTTP通信

## 🎉 メリット

1. **自動化**: 下落キーワードを自動的に分析
2. **優先順位付け**: 下落幅が大きいキーワードから分析
3. **具体的な提案**: 「見出しを6個追加」など具体的
4. **Discord統合**: 通知に含まれるので見逃さない
5. **既存機能との統合**: AI分析と併用可能

## 📝 注意事項

- 順位が下落したキーワードのみ分析
- 下落幅が大きいキーワードを優先
- 分析には時間がかかる（1キーワード約30秒〜1分）
- Selenium推奨（JavaScriptレンダリングに対応）

## 🚀 今後の拡張案

- [ ] 分析結果をデータベースに保存
- [ ] 過去の分析結果との比較
- [ ] HTML/PDFレポート生成
- [ ] より詳細な分析項目（動画、外部リンクなど）
- [ ] 分析結果のグラフ化

---

**実装日**: 2026-02-03
**バージョン**: v2.2
