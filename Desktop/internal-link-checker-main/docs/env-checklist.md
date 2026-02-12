# 設定値・環境変数の確認事項

ローカル（`.env`）と本番（Vercel の Environment Variables）で確認すべき項目をまとめています。

---

## 1. 環境変数一覧と必須/推奨

| 変数名 | 必須 | 用途 | 確認ポイント |
|--------|------|------|--------------|
| **認証（NextAuth）** |
| `AUTH_SECRET` または `NEXTAUTH_SECRET` | 本番必須 | セッション署名 | 本番で未設定だと起動時にエラー。`openssl rand -base64 32` で生成 |
| `AUTH_URL` | 任意 | 本番の絶対URL | 「Server configuration」エラーが出る場合に本番URLを設定 |
| **Google OAuth** |
| `GOOGLE_CLIENT_ID` | 必須 | ログイン・Sheets API | `.apps.googleusercontent.com` で終わる形式 |
| `GOOGLE_CLIENT_SECRET` | 必須 | 同上 | 漏洩しないよう本番では Vercel のみに設定 |
| **データベース** |
| `DATABASE_URL` | 本番必須 | Prisma（トランザクション） | Supabase の **Connection string**（Transaction モード、`?pgbouncer=true`） |
| `DIRECT_URL` | 本番必須 | マイグレーション・一部クエリ | Supabase の **Direct connection**（`5432`） |
| **Stripe** |
| `STRIPE_SECRET_KEY` | 必須 | 決済API | 開発: `sk_test_...` / 本番: `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | 必須 | フロントの Stripe.js | 開発: `pk_test_...` / 本番: `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | 必須 | Webhook 署名検証 | 開発: `whsec_...`（CLI）/ 本番: Dashboard のエンドポイントごとのシークレット |
| `STRIPE_PRO_PRICE_ID` | 必須 | Pro プラン料金ID | 開発: `price_xxx`（テスト）/ 本番: 本番用 Price ID |
| **公開URL（OGP・sitemap・リダイレクト）** |
| `NEXT_PUBLIC_SITE_URL` | 推奨 | OGP・sitemap・robots | 未設定時は `https://example.com` にフォールバック |
| `NEXT_PUBLIC_APP_URL` | 推奨 | Stripe 戻り先・ポータル | 未設定時は `http://localhost:3000`。本番では必ず本番URLを設定 |

---

## 2. 環境別の確認事項

### ローカル（`.env`）

- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` が開発用 OAuth クライアントのもの
- [ ] Google の「承認済みリダイレクト URI」に **`http://localhost:3000/api/auth/callback/google`** が登録されている
- [ ] `DATABASE_URL` / `DIRECT_URL` が開発用 DB（または本番と同じでも可）
- [ ] Stripe はテストモード（`sk_test_` / `pk_test_`）でよい
- [ ] `AUTH_SECRET` は何かしら設定（ローカルでは未設定でも動く場合ありだが推奨）
- [ ] `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL` はローカルでは未設定でよい（フォールバックで `localhost:3000`）

### 本番（Vercel）

- [ ] **AUTH_SECRET** または **NEXTAUTH_SECRET** が設定されている（本番では必須）
- [ ] **DATABASE_URL** / **DIRECT_URL** が本番用 Supabase の値（Vercel の Environment Variables にのみ設定）
- [ ] **AUTH_URL** は「Server configuration」エラーが出た場合に、デプロイ先の URL（例: `https://xxx.vercel.app`）を設定
- [ ] **NEXT_PUBLIC_SITE_URL** と **NEXT_PUBLIC_APP_URL** を本番 URL に統一（OGP・Stripe 戻り先のため）
- [ ] Google OAuth の「承認済みリダイレクト URI」に **`https://あなたのドメイン/api/auth/callback/google`** を追加
- [ ] Stripe 本番用の **STRIPE_WEBHOOK_SECRET** は「Webhook エンドポイント追加」で発行された `whsec_...` を使用（CLI のシークレットとは別）
- [ ] Stripe の Webhook エンドポイント URL を **`https://あなたのドメイン/api/stripe/webhook`** で登録し、必要なイベント（例: `checkout.session.completed` など）を選択

---

## 3. よくある不具合と確認箇所

| 症状 | 確認する設定 |
|------|----------------|
| ログイン後に 401 やリダイレクトループ | `AUTH_SECRET` / `AUTH_URL`、proxy（旧 middleware）の matcher、ブラウザ/Vercel のキャッシュ |
| 「Server configuration」 | `AUTH_URL` を本番の絶対 URL に設定、`trustHost: true` は `auth.ts` で既に有効 |
| Google ログインでリダイレクトエラー | 承認済みリダイレクト URI に **正確に** `https://ドメイン/api/auth/callback/google` が入っているか |
| Stripe 決済後に変な URL に戻る | `NEXT_PUBLIC_APP_URL` が本番 URL になっているか（Vercel では Production 用に設定） |
| Webhook が届かない / 署名エラー | `STRIPE_WEBHOOK_SECRET` が Dashboard の「Signing secret」と一致しているか、エンドポイント URL が `/api/stripe/webhook` か |
| OGP や sitemap の URL がおかしい | `NEXT_PUBLIC_SITE_URL` を本番 URL に設定 |
| DB 接続エラー・マイグレーション失敗 | `DATABASE_URL`（Transaction）、`DIRECT_URL`（Direct）の両方、Supabase の「Connection string」と「Direct connection」をコピーし直す |

---

## 4. 秘密情報の扱い

- **`.env` は Git にコミットしない**（`.gitignore` に含まれていること）
- **NEXT_PUBLIC_*** はビルド結果に含まれるため、秘密キーは入れない
- 本番の `GOOGLE_CLIENT_SECRET` / `STRIPE_SECRET_KEY` / `AUTH_SECRET` 等は Vercel の Environment Variables のみに設定し、ローカルでは開発用の別値を利用することを推奨

---

## 5. クイックチェックコマンド（ローカル）

```bash
# AUTH_SECRET の生成（本番用にコピーして Vercel に貼る）
openssl rand -base64 32
```

必要な環境変数が揃っているか確認するには、`npm run build` が成功し、`npm run dev` でログイン・Stripe テストができる状態になっているかで判断できます。
