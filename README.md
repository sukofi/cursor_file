# Task ROG - チーム集中度管理アプリケーション

## 概要
Task ROGは、チームの集中度と作業効率を管理するElectronアプリケーションです。リアルタイムでの集中度トラッキング、チームメンバーの作業状況確認、目標設定と進捗管理機能を提供します。

## 機能
- 📊 リアルタイム集中度トラッキング
- 👥 チームメンバーの作業状況確認
- 🎯 目標設定と進捗管理
- ⏰ ポモドーロタイマー機能
- 📧 招待機能（無料メール送信サービス対応）

## 無料メール送信サービス設定

### SendGrid（推奨）- 月100通まで無料
1. [SendGrid](https://sendgrid.com/)にアカウント作成
2. APIキーを取得
3. 環境変数を設定：

```bash
SENDGRID_API_KEY=your_api_key_here
MAIL_FROM=noreply@yourdomain.com
APP_URL=https://yourdomain.com
```

### Mailgun - 月5,000通まで無料（3ヶ月間）
1. [Mailgun](https://www.mailgun.com/)にアカウント作成
2. APIキーとドメインを取得
3. 環境変数を設定：

```bash
MAILGUN_API_KEY=your_api_key_here
MAILGUN_DOMAIN=your_domain.com
MAIL_FROM=noreply@yourdomain.com
```

### Resend - 月3,000通まで無料
1. [Resend](https://resend.com/)にアカウント作成
2. APIキーを取得
3. 環境変数を設定：

```bash
RESEND_API_KEY=your_api_key_here
MAIL_FROM=noreply@yourdomain.com
```

### Brevo（旧Sendinblue）- 月300通まで無料
1. [Brevo](https://www.brevo.com/)にアカウント作成
2. APIキーを取得
3. 環境変数を設定：

```bash
BREVO_API_KEY=your_api_key_here
MAIL_FROM=noreply@yourdomain.com
```

## インストールと実行

```bash
# 依存関係をインストール
npm install

# 開発モードで実行
npm run electron:dev

# 本番ビルド
npm run electron:build
```

## 招待機能の使用方法

1. **メール招待**
   - 管理者が「メンバーを追加」ボタンをクリック
   - 「メール招待」タブを選択
   - メールアドレスを入力して招待メールを送信

2. **招待リンク**
   - 「招待リンク」タブを選択
   - 自動生成されたリンクをコピーして共有

3. **招待管理**
   - 「招待管理」タブで送信した招待の状況を確認
   - 不要な招待を削除

## 開発環境での動作
開発環境では、メール送信がシミュレートされます。実際のメールは送信されませんが、コンソールに送信内容が表示されます。

## ライセンス
MIT License
