# Vercel へのデプロイ手順

内部リンクマトリクスを Vercel にデプロイする手順です。

---

## クイックデプロイ（要約）

1. リポジトリを GitHub にプッシュする
2. [vercel.com](https://vercel.com) で **Import Project** し、対象リポジトリを選択
3. **Environment Variables** に `.env.example` を参考に本番用の値を設定する（後述）
4. **Deploy** をクリック
5. デプロイ後に表示される URL を、Google OAuth の「承認済みリダイレクト URI」と Stripe の Webhook URL に追加する

ビルドでは自動で `prisma generate` が実行されます。初回は事前に `npx prisma migrate deploy` でDBをマイグレーションしてください。

---

## 1. 前提

- コードを **GitHub**（または GitLab / Bitbucket）にプッシュしていること
- **Supabase** で PostgreSQL のデータベースを作成済みであること
- **Google Cloud Console** で OAuth クライアントを作成済みであること
- **Stripe** でアカウント・商品を作成済みであること

---

## 2. Vercel でプロジェクトを作成

1. [Vercel](https://vercel.com) にログインする
2. **Add New…** → **Project** を選択
3. 対象の **Git リポジトリ** をインポートする
4. **Framework Preset**: Next.js が自動検出されていればそのまま
5. **Root Directory**: そのまま（ルートで `package.json` がある場合）
6. **Build Command**: `npm run build`（デフォルトのまま）
7. **Output Directory**: 未指定でよい（Next.js のデフォルト）
8. いったん **Deploy** は押さず、**Environment Variables** を先に設定する（次のステップ）

---

## 3. 環境変数の設定

Vercel のプロジェクト **Settings** → **Environment Variables** で、以下を追加します。  
本番用には **Production** にチェックを入れて保存してください。

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `NEXT_PUBLIC_SITE_URL` | 本番のURL（OGP・sitemap用） | `https://your-app.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth クライアントID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth シークレット | （シークレット文字列） |
| `AUTH_SECRET` | NextAuth 用シークレット | `openssl rand -base64 32` で生成 |
| `DATABASE_URL` | Supabase の接続URL（トランザクション用） | `postgresql://...?pgbouncer=true` |
| `DIRECT_URL` | Supabase の直接接続URL（マイグレーション用） | `postgresql://...:5432/...` |
| `STRIPE_SECRET_KEY` | Stripe 本番のシークレットキー | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe 本番の公開キー | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook の署名シークレット | `whsec_...` |
| `STRIPE_PRO_PRICE_ID` | Proプランの Price ID（本番） | `price_...` |

- **AUTH_SECRET** の生成例（ターミナル）:
  ```bash
  openssl rand -base64 32
  ```
- デプロイ後に発行される URL が決まってから、`NEXT_PUBLIC_SITE_URL` をその URL に更新しても構いません。

---

## 4. 本番側の外部サービス設定

### Google Cloud Console

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. 使用している OAuth 2.0 クライアントを開く
3. **承認済みのリダイレクト URI** に以下を追加:
   - `https://あなたのドメイン.vercel.app/api/auth/callback/google`
4. 本番ドメイン（カスタムドメイン）を使う場合は、そのドメインの同じパスも追加

### Stripe

1. [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers** → **Webhooks**
2. **Add endpoint**
3. **Endpoint URL**: `https://あなたのドメイン.vercel.app/api/stripe/webhook`
4. イベント: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` など必要なものを選択
5. 作成後に表示される **Signing secret** をコピーし、Vercel の `STRIPE_WEBHOOK_SECRET` に設定

### データベース（マイグレーション）

初回デプロイ前に、ローカルまたは CI でマイグレーションを実行しておきます。

```bash
# .env に本番の DATABASE_URL / DIRECT_URL を設定したうえで
npx prisma migrate deploy
```

Vercel の **Build Command** に `prisma migrate deploy` を含め、ビルド時にマイグレーションを実行する方法もあります。その場合は Build Command を次のように変更します。

```bash
npx prisma migrate deploy && npm run build
```

（`package.json` の `build` は `prisma generate && next build` のままにし、Vercel の Build Command で上記を指定する形でも構いません。）

---

## 5. デプロイの実行

1. 環境変数を保存したら、**Deploy** を実行する
2. ビルドが成功すると、`https://プロジェクト名.vercel.app` でアクセスできる
3. デプロイ後、`NEXT_PUBLIC_SITE_URL` を実際の URL に合わせて更新し、必要なら再デプロイする

---

## 6. カスタムドメイン（任意）

1. Vercel のプロジェクト → **Settings** → **Domains**
2. 使いたいドメインを追加し、DNS の案内に従って設定する
3. 設定後、Google OAuth のリダイレクト URI と Stripe の Webhook URL、および `NEXT_PUBLIC_SITE_URL` をカスタムドメインに合わせて更新する

---

## 7. 注意事項

- **Crawl API** は最大 60 秒程度かかることがあります。Vercel の **Hobby** プランではサーバー関数の制限時間が短いため、大量クロール時は **Pro** プランでの利用を推奨します。
- **AUTH_SECRET** は本番用に必ず別の値にし、Git にコミットしないでください。
- 本番では **STRIPE_WEBHOOK_SECRET** に、本番用 Webhook の Signing secret を設定してください（テスト用の `whsec_...` とは別です）。

以上で、Vercel へのデプロイと本番運用の準備ができます。
