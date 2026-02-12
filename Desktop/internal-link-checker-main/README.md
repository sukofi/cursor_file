# 内部リンクマトリクス

記事間の内部リンクをマトリクス形式で可視化するWebアプリケーションです。

## 機能

- **スプレッドシート連携**: Google スプレッドシートからKWとURLを取得
- **HTMLクローリング**: 各URLのHTMLを解析し、内部リンクを抽出
- **CSSセレクタ設定**: 内部リンクとしてカウントする要素を柔軟に設定可能
- **マトリクス表示**: 記事間のリンク関係を一覧表示
- **フィルタリング**: 検索機能、孤立記事フィルタ
- **CSVエクスポート**: データをCSV形式でダウンロード

## セットアップ

### 1. Google Cloud Platform設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Google Sheets APIを有効化
3. サービスアカウントを作成し、JSONキーをダウンロード

### 2. 環境変数設定

`.env.local`ファイルを作成し、サービスアカウントのJSONキーを設定:

```bash
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```

### 3. スプレッドシートの共有設定

サービスアカウントのメールアドレス（`xxx@xxx.iam.gserviceaccount.com`）に、対象のスプレッドシートを「閲覧者」として共有してください。

### 4. 起動

```bash
npm install
npm run dev
```

## Vercelへのデプロイ

1. GitHubにリポジトリをプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. Environment Variablesに`GOOGLE_SERVICE_ACCOUNT_KEY`を設定
4. デプロイ

## 使い方

### 設定画面

1. スプレッドシートのURLまたはIDを入力して「接続」
2. シート名を選択
3. キーワード列とURL列を選択
4. 必要に応じてCSSセレクタを追加・編集

### CSSセレクタの例

- `.blogcard a` - ブログカード内のリンク
- `a.internal-link` - 特定クラスを持つリンク
- `div.related-posts a` - 関連記事セクション内のリンク
- `article a[href^="/"]` - 記事内の相対リンク

### マトリクス画面

1. 「更新」ボタンでデータを取得・クロール
2. 緑のチェックマークがリンクの存在を示す
3. 行：被リンク記事（リンクを受ける側）
4. 列：発リンク記事（リンクを張る側）

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (状態管理)
- Google Sheets API v4
- Cheerio (HTMLパース)

## ライセンス

MIT
