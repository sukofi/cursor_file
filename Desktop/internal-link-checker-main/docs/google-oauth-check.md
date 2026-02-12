# Google OAuth 設定の確認チェックリスト

「サーバー設定エラー」や 401 の原因が Google 側の設定でないか、次を確認してください。

---

## 1. 承認済みリダイレクト URI（必須）

**Google Cloud Console** → **APIs & Services** → **認証情報** → 使っている **OAuth 2.0 クライアント ID**（種類: ウェブアプリケーション）を開く。

**「承認済みのリダイレクト URI」** に、**本番の URL を 1 文字違いなく** 追加する:

```
https://あなたの本番ドメイン/api/auth/callback/google
```

例（Vercel のデフォルト URL の場合）:
- `https://internal-link-checker-c3g8.vercel.app/api/auth/callback/google`

**よくあるミス:**
- `http` になっている（本番は必ず `https`）
- 末尾に `/` がついている（不要）
- ドメインが違う（例: `internal-link-checker-livid` と `internal-link-checker-c3g8` を間違える）
- `/api/auth/callback/google` が抜けている

---

## 2. クライアント ID とシークレット

- **GOOGLE_CLIENT_ID** と **GOOGLE_CLIENT_SECRET** は、**同じ** OAuth クライアントのペアであること。
- **本番（Vercel）** の環境変数に、**本番用** の値が入っていること（開発用の別クライアントのままにしていないか）。
- 値の前後にスペースや改行が入っていないこと。

---

## 3. OAuth 同意画面（テストモードの場合）

**APIs & Services** → **OAuth 同意画面** で **「テスト」** のとき:

- ログインに使う **Google アカウント** を **「テストユーザー」** に追加する。
- 追加していないと「アクセスブロック」などでログインできない。

本番で不特定多数に使う場合は、のちに **「公開」** と申請が必要です。

---

## 4. 必要な API の有効化

**APIs & Services** → **ライブラリ** で、次が **有効** になっているか確認:

- **Google Sheets API**（スプレッドシート連携で使用）
- **Google+ API** や **People API** は、NextAuth の Google プロバイダーによっては不要な場合があります。

---

## 5. 本番ドメインとリダイレクト URI の対応

Vercel の **本番の URL**（例: `https://internal-link-checker-c3g8.vercel.app`）と、  
Google に登録した **リダイレクト URI** のドメインが **完全に一致** しているか確認する。

- カスタムドメインを使う場合は、そのドメインの  
  `https://カスタムドメイン/api/auth/callback/google`  
  も「承認済みのリダイレクト URI」に追加する。

---

## まとめ

- コード側の Google プロバイダー設定（clientId, clientSecret, scope など）は、一般的な NextAuth の使い方として問題ない形になっています。
- 問題が出る場合は、上記の **1. リダイレクト URI** と **2. クライアント ID/シークレット** を特に確認するとよいです。
