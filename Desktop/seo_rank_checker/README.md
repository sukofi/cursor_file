# 順位チェッカー v2

週1回500KWのGoogle日本（desktop）のTop10順位をDataForSEOで取得し、自社ドメインの順位を抽出、前回より下落したKWだけを抽出して、Discordへまとめて通知するツールです。

## 🚀 特徴

- **🌐 Web管理画面（NEW）**: ブラウザからキーワード・ジャンル・URLを簡単に管理
- **DataForSEO API統合**: Google Organic検索結果のTop10を取得
- **順位下落検出**: 前回と比較して順位が下がったキーワードを自動検出
- **競合分析**: 自社より上位の競合URL（最大3件）を抽出
- **🔍 詳細競合分析（NEW）**: 上位記事の見出し・文字数・画像数・内部リンク数を抽出して比較
- **📉 自動競合差分比較（NEW）**: 順位下落時に競合との差分を自動分析・提示
- **🤖 AI分析機能（NEW）**: Gemini AIによるトレンド分析と改善提案
- **💬 Discord Bot対応（NEW）**: チャットコマンドから順位チェックを実行
- **Discord通知**: 下落キーワードと圏外落ち、AI分析結果、競合差分をまとめて通知
- **SQLite履歴管理**: 順位履歴を保存して時系列で比較
- **バッチ処理**: 500KWを100件ずつに分割して効率的に処理
- **CSV インポート**: CSVファイルからキーワードを一括インポート
- **JS対応**: JavaScriptでレンダリングされるページも正確に解析

## 📋 必要要件

- Python 3.11以上
- macOS（24/365稼働想定）
- DataForSEOアカウント（LOGIN/PASSWORD）
- Discord Webhook URL
- **Discord Bot Token**（ボット機能を使用する場合 - オプション）
- Gemini API Key（AI分析機能を使用する場合 - オプション）
- **Google Chrome** or **Chromium**（競合分析機能を使用する場合 - オプション）

## 📦 インストール

### 1. リポジトリのクローン

```bash
cd seo_rank_checker
```

### 2. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

### 3. ChromeDriverのインストール（競合分析機能用）

競合分析機能を使用する場合、ChromeDriverが必要です：

**macOSの場合:**

```bash
# Homebrewを使用
brew install chromedriver

# またはChromeの自動ダウンロード機能を使用（推奨）
# Seleniumが自動的にChromeDriverをダウンロードします
```

**注意**: macOSの場合、初回実行時にセキュリティ警告が出る場合があります。「システム環境設定」→「セキュリティとプライバシー」から許可してください。

## ⚙️ 設定

### 1. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下を設定：

```bash
# DataForSEO API認証情報
DATAFORSEO_LOGIN=your_login_here
DATAFORSEO_PASSWORD=your_password_here

# Discord Webhook URL
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url_here

# Discord Bot Token (ボット機能用 - オプション)
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# Gemini API Key (AI分析機能用 - オプション)
GEMINI_API_KEY=your_gemini_api_key_here
```

**Gemini API Keyの取得方法:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. 「Get API Key」をクリックして新しいAPIキーを作成
3. 取得したAPIキーを`.env`ファイルに設定

**Discord Bot Tokenの取得方法:**
1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 「New Application」をクリックしてアプリケーションを作成
3. 「Bot」セクションで「Add Bot」をクリック
4. Tokenをコピーして`.env`ファイルに設定
5. 「Privileged Gateway Intents」で「MESSAGE CONTENT INTENT」を有効化
6. 「OAuth2 → URL Generator」で`bot`と`applications.commands`を選択
7. Bot Permissionsで「Send Messages」「Read Message History」を選択
8. 生成されたURLでボットをサーバーに招待

### 2. 設定ファイルの編集

`config/settings.yaml` を編集：

```yaml
# DataForSEO API settings
location_code: 2392  # 日本（東京）のロケーションコード
language_code: "ja"
device: "desktop"
depth: 10

# Domain settings
target_domain: "yourcompany.co.jp"  # 自社ドメインに変更

# Analysis settings
max_competitors_above: 3

# API polling settings
batch_size: 100
poll_interval_sec: 20
poll_timeout_sec: 900

# Database settings
db_path: "rankings.db"
```

### 3. キーワードのインポート

CSVファイルからキーワードをデータベースにインポートします：

```bash
python3 import_csv.py <csv_file_path>
```

**CSVファイルの形式:**
- 必須カラム: `KW` または `キーワード`（キーワード）
- オプションカラム: `ジャンル` または `genre`（ジャンル/カテゴリ）

例：
```csv
ジャンル,KW
時計,ロレックス デイトナ
金・貴金属,プラチナ
ブランド,エルメス 時計 買取
```

#### オプション: キーワードファイルを使いたい場合

チェックしたいキーワードを1行1キーワードで記載したファイルを作成：

```
キーワード1
キーワード2
キーワード3
...
```

実行時に `--keywords` オプションで指定：

```bash
python main.py --keywords keywords.txt
```

## 🎯 使い方

### 初回セットアップ: キーワードをデータベースにインポート

**重要**: 初回または新しいキーワードを追加した際は、キーワード情報をデータベースにインポートする必要があります。

#### 方法1: Web管理画面を使用（推奨）

```bash
python3 web_admin.py
```

ブラウザで http://localhost:5000 にアクセスして、Web管理画面から簡単にキーワードを管理できます。
- キーワード一覧・編集画面で直接編集
- CSVファイルから一括インポート
- ジャンル・キーワード・公開URLを簡単に管理

#### 方法2: コマンドラインからインポート

```bash
python3 import_csv.py <csv_file_path>
```

このコマンドで、CSVファイルからキーワード、ジャンルなどの情報を自動的にデータベースに保存します。

**実行例:**
```
[INFO] CSVファイルを読み込み中: keywords.csv
[INFO] データベース: rankings.db
[INFO] ヘッダー行: 2 行目
[INFO] 検出されたカラム: ジャンル, KW
[INFO] ジャンルカラム: ジャンル
[INFO] キーワードカラム: KW
[INFO] CSVファイルから 694 行を読み込みました
[INFO] 有効なキーワード: 693 件
[INFO] 693 件のキーワードをデータベースに保存中...
[SUCCESS] ✅ 693 件のキーワードをデータベースに保存しました
  - キーワード: KW
  - ジャンル: ジャンル
  - URL: URL
  - 優先度: 優先度
  - メモ: メモ
[INFO] 152 件のキーワードをデータベースに保存中...
[SUCCESS] ✅ 152 件のキーワードをデータベースに同期しました

[INFO] ジャンル別集計:
  - 買取: 45 件
  - 査定: 32 件
  - 相場: 28 件
  ...
```

**オプション:**
- `--keyword-column`: キーワードカラム名を明示的に指定
- `--genre-column`: ジャンルカラム名を明示的に指定
- `--url-column`: URLカラム名を明示的に指定
- `--priority-column`: 優先度カラム名を明示的に指定
- `--notes-column`: メモカラム名を明示的に指定

**例:**
```bash
python sync_keywords.py --keyword-column "キーワード" --genre-column "カテゴリ"
```

---

### 方法1: Discord Bot（推奨）

Discord Botを起動すれば、チャットから簡単に順位チェックを実行できます。

#### Botの起動

```bash
python discord_bot.py
```

#### チャットコマンド

Discordサーバーで以下のコマンドを使用：

```
!rank          # 全キーワードの順位チェック
!rank 10       # 最初の10件のみチェック
!status        # 現在の設定を確認
!usage         # ヘルプを表示
!analyze "キーワード" "自社URL"  # 競合分析を実行
```

#### 使用例

```
!rank 5                                              # 最初の5件のみテスト実行
!rank                                                # 全キーワードをチェック
!analyze "中古車買取" https://daikichi-kaitori.jp/car  # 競合分析
```

結果はリアルタイムでチャットに表示されます。

---

### 方法2: コマンドライン実行

### 基本的な実行（データベースから自動取得）

```bash
python main.py
```

データベースから全てのキーワードを取得して順位チェックを実行します。

### ジャンルを指定して実行

```bash
python main.py --genre "買取"
```

特定のジャンルのキーワードのみをチェックできます。

### キーワードファイルを使用する場合

```bash
python main.py --keywords keywords.txt
```

### オプション

```bash
python main.py --config config/settings.yaml --env .env --genre "買取"
```

**引数:**
- `--keywords`: キーワードファイルのパス（オプション。指定しない場合はデータベースから取得）
- `--genre`: 特定のジャンルのキーワードのみをチェック（オプション）
- `--config`: 設定ファイルのパス（デフォルト: `config/settings.yaml`）
- `--env`: .envファイルのパス（デフォルト: `.env`）

### サンプル実行（動作確認）

```bash
# データベースから全キーワードを取得
python main.py

# 特定のジャンルのみチェック
python main.py --genre "買取"

# キーワードファイルを使用
python main.py --keywords keywords.example.txt
```

## 📊 動作フロー

1. **キーワードインポート**: CSVファイルからキーワード・ジャンル情報をデータベースにインポート（初回のみ）
2. **キーワード取得**: データベースから自動取得（ジャンル指定も可能）
3. **バッチ分割**: 100件ずつに分割してDataForSEO APIに投入
4. **タスク完了待機**: ポーリングでタスク完了を確認
5. **結果取得**: 各タスクの検索結果を取得
6. **自社順位抽出**: Top10から自社ドメインの順位とURLを抽出
7. **競合分析**: 自社より上位の競合URL（最大3件）を取得
8. **下落判定**: 前回順位と比較して下落を検出
   - **順位下落**: 前回1-10位 → 今回1-10位で順位が下がった
   - **圏外落ち**: 前回1-10位 → 今回圏外（11位以下 or なし）
9. **📉 自動競合差分分析**: 下落したキーワード（下落幅が大きい順に最大5件）について、自社と競合の差分を自動分析
   - **見出し数**の比較
   - **文字数**の比較
   - **画像数**の比較
   - **内部リンク数**の比較
   - 改善提案を自動生成
10. **🤖 AI分析**: Gemini AIで順位変動のトレンドと改善提案を生成
11. **履歴保存**: 今回の結果をSQLiteに保存
12. **Discord通知**: 下落キーワード、圏外落ち、競合差分、AI分析結果をまとめて通知

## 📁 プロジェクト構成

```
seo_rank_checker/
├── config/
│   └── settings.yaml          # 設定ファイル
├── templates/                  # 🌐 Web管理画面テンプレート（NEW）
│   ├── base.html              # 共通レイアウト
│   ├── index.html             # キーワード一覧・編集
│   └── import.html            # CSV一括インポート
├── .env                        # 環境変数（要作成）
├── requirements.txt            # 依存パッケージ
├── README.md                   # このファイル
├── web_admin.py                # 🌐 Web管理画面（NEW）
├── import_csv.py               # CSVインポートツール
├── dataforseo_client.py        # DataForSEO APIクライアント
├── domain_match.py             # ドメイン判定ロジック
├── storage.py                  # SQLite順位履歴管理
├── notifier.py                 # Discord通知
├── rank_checker.py             # 順位チェックオーケストレーター
├── ai_analyzer.py              # 🤖 Gemini AI分析モジュール
├── discord_bot.py              # 💬 Discord Bot（NEW）
├── competitor_analyzer.py      # 🔍 競合分析モジュール（NEW）
├── comparison_report.py        # 📊 比較レポート生成（NEW）
├── import_csv.py               # 🆕 CSV→DB インポート
├── main.py                     # CLIエントリーポイント
├── keywords.example.txt        # サンプルキーワードファイル
└── rankings.db                 # SQLiteデータベース（自動生成）
```

## 💬 Discord Bot機能

### 特徴

- **チャットから実行**: `!rank`コマンドで順位チェックを開始
- **リアルタイム結果**: チャットに直接結果を表示
- **部分実行対応**: `!rank 10`で最初の10件のみチェック
- **AI分析統合**: 自動でGemini AIによる分析も実行
- **見やすい表示**: Embedを使った美しい結果表示

### コマンド一覧

| コマンド | 説明 | 例 |
|---------|------|-----|
| `!rank` | 全キーワードをチェック | `!rank` |
| `!rank N` | 最初のN件のみチェック | `!rank 10` |
| `!status` | 現在の設定を表示 | `!status` |
| `!usage` | ヘルプを表示 | `!usage` |
| `!analyze <KW> <URL>` | 競合分析を実行 | `!analyze "中古車買取" https://example.com/car` |

### 実行イメージ

```
あなた: !rank 5

Bot: 📊 順位チェックを開始します...
Bot: 📥 データベースからキーワードを取得中...
Bot: ✅ 5件のキーワードを取得しました（制限: 5件）
Bot: 🔍 順位チェックを実行中... (これには数分かかる場合があります)

[数分後]

Bot: [結果のEmbed表示]
     📊 順位チェック結果
     実行日時: 2026-02-01 14:30:00
     📉 順位下落: 2件
     🚫 圏外落ち: 0件

Bot: [AI分析のEmbed表示]
     🤖 AI分析結果
     📝 サマリー: ...
     📈 トレンド分析: ...
     💡 改善提案: ...

Bot: [下落キーワードの詳細表示]
     ...
```

## 🤖 AI分析機能

Gemini AIを使用した高度な分析機能を提供します：

### 分析内容

1. **全体サマリー**: 今回の順位変動の全体的な傾向
2. **トレンド分析**: キーワードパターン、業界傾向、季節性の検出
3. **改善提案**: 優先的に対応すべき具体的な施策
4. **優先キーワード**: 最も緊急に対応すべきキーワードの抽出

### 設定方法

`config/settings.yaml` でAI分析を制御できます：

```yaml
# AI Analysis settings
enable_ai_analysis: true  # AI分析を有効化（Gemini API使用）
gemini_model: "gemini-1.5-flash"  # 使用するGeminiモデル

# Competitor Analysis settings (順位下落時の自動分析)
enable_competitor_analysis: true  # 下落時に競合分析を自動実行
max_competitor_analysis_keywords: 5  # 競合分析を実行する下落キーワードの最大数（上位N件）
use_selenium: true  # JavaScript対応のためSeleniumを使用
```

**使用可能なモデル:**
- `gemini-1.5-flash`: 高速・コスト効率が良い（推奨）
- `gemini-1.5-pro`: より高精度な分析

### AI分析を無効化する場合

```yaml
enable_ai_analysis: false
```

または `.env` から `GEMINI_API_KEY` を削除してください。

## 📉 順位下落時の自動競合差分分析（NEW）

順位が下落したキーワードについて、自動的に競合サイトとの差分を分析し、改善提案を生成します。

### 分析内容

下落幅が大きい順に最大5件のキーワードについて、以下を自動分析：

1. **見出し数**の比較（自社 vs 競合平均）
2. **文字数**の比較（自社 vs 競合平均）
3. **画像数**の比較（自社 vs 競合平均）
4. **内部リンク数**の比較（自社 vs 競合平均）
5. **改善提案**を自動生成（不足している項目を具体的に提示）

### 設定方法

`config/settings.yaml` で競合分析を制御できます：

```yaml
# Competitor Analysis settings
enable_competitor_analysis: true  # 順位下落時に自動分析を実行
max_competitor_analysis_keywords: 5  # 分析する下落キーワードの最大数
use_selenium: true  # JavaScript対応（推奨）
```

### Discord通知での表示例

```
**キーワード**: `中古車 買取 相場`
**順位変動**: 3位 → 7位 (▼4)
**自社URL**: https://example.com/car-kaitori

**上位競合**:
  1位: https://competitor1.com/...
  2位: https://competitor2.com/...

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

### 無効化する場合

```yaml
enable_competitor_analysis: false
```

### 注意事項

- ChromeまたはChromiumがインストールされている必要があります
- JavaScriptでレンダリングされるページも正確に解析します
- 大規模なページの場合、分析に数分かかる場合があります
- 下落幅が大きいキーワードから優先的に分析します

## 🔍 手動の競合分析機能（Discord Bot）

特定のキーワードに対して、上位3位の競合記事を詳細に分析し、自社記事と比較できます。

### 分析項目

1. **見出し数** (H1-H6タグの総数)
2. **文字数** (本文の総文字数)
3. **画像数** (img タグの総数)
4. **内部リンク数** (同一ドメイン内へのリンク数)

### 実行方法

```
!analyze "キーワード" "自社URL"
```

**例:**
```
!analyze "中古車買取" https://daikichi-kaitori.jp/car
```

### 分析フロー

1. DataForSEO APIで上位10件の検索結果を取得
2. 上位3位の競合URLを抽出
3. 各URLのページ内容を解析（JSレンダリング対応）
4. 自社サイトと競合の平均値を比較
5. 改善提案を自動生成
6. HTMLレポートを生成して送信

### 出力例

```
📊 競合分析結果: 中古車買取

🏠 自社サイト
見出し: 12個
文字数: 2,500文字
画像: 8枚
内部リンク: 15個

🎯 競合平均（上位3位）
見出し: 18.3個
文字数: 4,200文字
画像: 12.7枚
内部リンク: 22.3個

💡 改善提案
📝 見出しを6個追加
✍️ 約1,700文字追加
🖼️ 画像を5枚追加
🔗 内部リンクを7個追加
```

### HTMLレポート

視覚的なグラフを含む詳細レポートがHTMLファイルとして生成され、Discordに送信されます。ブラウザで開いて確認できます。

### 注意事項

- ChromeまたはChromiumがインストールされている必要があります
- JavaScriptでレンダリングされるページも正確に解析します
- 大規模なページの場合、分析に数分かかる場合があります
- DataForSEO APIのクレジットを1クエリ消費します

## 🔧 トラブルシューティング

### DataForSEO APIエラー

- LOGIN/PASSWORDが正しいか確認
- DataForSEOのクレジットが残っているか確認
- location_codeが正しいか確認（日本: 2392）

### Discord通知が送信されない

- DISCORD_WEBHOOK_URLが正しいか確認
- Webhookが有効か確認

### 順位が取得できない

- target_domainが正しく設定されているか確認
- サブドメインも含めて判定するので、メインドメインのみ指定

### タイムアウトエラー

- `poll_timeout_sec`を増やす（デフォルト: 900秒 = 15分）
- `poll_interval_sec`を調整（デフォルト: 20秒）

## 📅 週次実行の設定（オプション）

macOSのcronまたはlaunchdで週1回実行するように設定できます。

### cronの例（毎週月曜9:00）

```bash
crontab -e
```

```cron
0 9 * * 1 cd /path/to/seo_rank_checker && /usr/local/bin/python3 main.py --keywords keywords.txt >> /path/to/logs/rank_checker.log 2>&1
```

## 📝 注意事項

- **初回実行**: 前回データがないため、下落判定は行われません（履歴保存のみ）
- **圏外判定**: Top10にいない場合は圏外として扱います
- **ドメイン判定**: `example.com`を指定すると、`www.example.com`や`blog.example.com`も自社として判定されます
- **DataForSEO制限**: 1リクエスト最大100タスクまで（自動分割されます）
- **Discord制限**: メッセージが長い場合は自動的に複数メッセージに分割されます

## 🔒 セキュリティ

- `.env` ファイルは絶対にGitにコミットしないでください
- `.gitignore` に `.env` を追加することを推奨します

## 📄 ライセンス

このプロジェクトは社内ツールとして作成されました。

## 🤝 サポート

問題が発生した場合は、ログを確認してください。主要な処理は標準出力にログが出力されます。

---

**作成日**: 2026-02-01  
**バージョン**: v2.2  
**新機能**: 🤖 Gemini AI分析、CSV インポート、🔍 詳細競合分析

## 🌐 Web管理画面（NEW）

キーワード・ジャンル・公開URLを**ブラウザから簡単に管理**できるWeb管理画面を搭載しました。

### 機能

- **📋 キーワード一覧・編集**: 全キーワードを表形式で表示・編集
- **🔍 検索・フィルター**: キーワード検索、ジャンルフィルター、URL登録状況でフィルタリング
- **📤 CSV一括インポート**: CSVファイルをアップロードして一括登録
- **🎨 モダンなUI**: Bootstrap 5を使用した見やすいデザイン
- **⚡ リアルタイム保存**: 編集内容を即座にデータベースに保存

### 起動方法

```bash
python3 web_admin.py
```

ブラウザで http://localhost:5000 にアクセス

### 使い方

#### 1. キーワード一覧・編集

- 全キーワードを表形式で表示
- 各行で以下を編集可能：
  - **ジャンル**: テキスト入力（既存ジャンルから選択可能）
  - **公開URL**: 内部リンク提案時に使用するページURL
  - **優先度**: 高・中・低から選択
  - **メモ**: 自由記入欄
- 編集後、「保存」ボタンで一括保存

#### 2. CSV一括インポート

1. 「CSVインポート」タブをクリック
2. CSVファイルを選択
3. 列のマッピングを確認（デフォルト: ジャンル、KW、URL）
4. 「インポート実行」ボタンをクリック

**対応CSV形式:**
```csv
ジャンル,KW,URL
時計,ロレックス デイトナ,https://example.com/rolex-daytona
金・貴金属,プラチナ,https://example.com/platinum
```

### スクリーンショット

Web管理画面では以下の情報を一目で確認できます：
- 📊 総キーワード数
- 🏷️ ジャンル数
- 🔗 URL登録済み件数

---

## 🆕 データベース連携機能

CSVファイルからキーワード・ジャンル情報をデータベースにインポートし、高速かつ正確なデータアクセスを実現します。

### メリット

- **⚡ 高速**: データベースから瞬時にキーワードを取得
- **🎯 正確**: データベースに保存されたデータは常に一貫性を保証
- **📁 ジャンル管理**: ジャンルごとにキーワードをグループ化、特定のジャンルのみを選択可能
- **📊 履歴管理**: 順位履歴をデータベースに保存、時系列で変動を追跡
- **🌐 Web管理**: ブラウザから簡単にキーワード・URL管理が可能

### 使い方

#### 方法1: Web管理画面から（推奨）

```bash
python3 web_admin.py
```

#### 方法2: コマンドラインから

```bash
python3 import_csv.py <csv_file_path>
```

CSVファイルのカラムを自動検出して、キーワード・ジャンルなどをデータベースに保存します。

#### 3. データベースから順位チェック

```bash
# 全キーワードをチェック
python main.py

# 特定のジャンルのみチェック
python main.py --genre "買取"
```

詳細は [DATABASE_GUIDE.md](DATABASE_GUIDE.md) を参照してください。
