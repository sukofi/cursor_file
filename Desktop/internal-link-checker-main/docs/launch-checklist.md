# SaaS 公開前チェックリスト

公開に向けて対応したい項目を優先度別にまとめています。

---

## 必須（公開前にやりたいこと）

### 1. 法的ページの追加
- **利用規約**（`/terms` など）  
  - 利用条件、禁止事項、免責、解約、準拠法など。
- **プライバシーポリシー**（`/privacy` など）  
  - 取得するデータ（Google認証のメール・名前、Stripeの決済情報、プロジェクト・シート設定など）、利用目的、第三者提供、Cookie、問い合わせ先。
- フッターやサインアップ画面から上記ページへのリンクを設置。

### 2. `/api/crawl` に認証をかける
- 現状、このAPIは認証チェックがなく、誰でも叩ける状態です。
- 悪用（大量クロールや他サイトへの負荷）やコスト増を防ぐため、**認証必須**にしてください。
- 例: `auth()` でセッションを取得し、未認証なら `401` を返す（`/api/sheets` や `/api/projects` と同様）。

### 3. 未ログインでも「料金」を見られるようにする
- middleware の matcher の関係で、`/pricing` も認証が必要になっています。
- LP や検索流入から「料金を見る」で来た人がログインを求められると離脱しやすいため、**`/pricing` を認証不要**にすることを推奨します。
- `auth.config.ts` の `authorized` で `nextUrl.pathname === "/pricing"` のときは `true` を返す、または matcher で `pricing` を除外するなど。

### 4. 本番環境の環境変数
- `.env.example` を参考に、本番用の値を設定。
- **AUTH_SECRET**: 本番専用の強い秘密鍵（例: `openssl rand -base64 32`）。
- **Stripe**: 本番の `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRO_PRICE_ID`。
- **Google OAuth**: 本番ドメインの「承認済みリダイレクトURI」を追加。
- **DATABASE_URL / DIRECT_URL**: 本番DB（Supabase など）の接続文字列。
- 本番では `GOOGLE_SERVICE_ACCOUNT_KEY` は使わず、OAuth のアクセストークンで Sheets を読んでいる想定で問題なければ、サービスアカウントは開発用のみでOK。

### 5. Stripe 本番設定
- 本番用の Product / Price を作成し、`STRIPE_PRO_PRICE_ID` を本番の Price ID に。
- Stripe Dashboard で Webhook を本番URL（例: `https://yourdomain.com/api/stripe/webhook`）に登録し、`STRIPE_WEBHOOK_SECRET` を本番用に更新。
- 必要なら「キャンセル時の処理」や「支払い失敗時のリトライ」を Webhook で実装済みか確認。

---

## 推奨（あると安心）

### 6. ランディングページ（LP）とアプリの役割分担
- 現状: トップ（`/`）がログイン後はダッシュボードになっており、未ログインは `/login` に飛ばされる。
- 公開後: 未ログインは「製品紹介LP」、ログイン後は「アプリ」を見せたい場合の例:
  - **案A**: `/` をLPにして、ログイン後のメインを `/app` や `/dashboard` に移す。middleware で `/` と `/pricing` と `/terms` などは認証不要に。
  - **案B**: `/` は現状のままにして、LP を別ドメインや `/lp` で用意する。
- LP 用プロンプトは `docs/manas-lp-prompt.md` を参照。

### 7. エラーページ
- **404**: `app/not-found.tsx` を追加し、存在しないパス用のメッセージと「トップへ」「ログイン」リンクを出す。
- **エラー**: `app/error.tsx` を追加し、予期しないエラー時に「問題が発生しました」＋リトライやトップ戻りを案内。

### 8. SEO・OGP
- `app/layout.tsx` の `metadata` を充実（`title` / `description` は済み）。
- OGP: `openGraph`（`og:title`, `og:description`, `og:image`, `og:url`）を追加。LP を `/` にする場合は LP 用の `og:image` を用意するとよい。
- 必要なら `robots.txt`（`public/robots.txt`）や `sitemap.xml` を追加。

### 9. 利用開始の案内
- 初回ログイン後やプロジェクト0件のときに、「スプレッドシートを設定→更新で取得」の流れを短く説明するオンボーディング（モーダルやバナー）があると離脱が減りやすいです。

### 10. お問い合わせ・ヘルプ
- 利用規約・プライバシーポリシーに「お問い合わせ先」を記載。
- 問い合わせフォームや support@ などの窓口を用意すると信頼感が増します。

---

## あるとよい（余裕があれば）

### 11. API のレート制限
- `/api/crawl` は並列数・間隔の制限はあるが、認証を入れたうえで「ユーザーあたり1日○回まで」などのレート制限があると安心（Vercel / Upstash 等のキーバリューでカウントなど）。

### 12. 監視・ログ
- Vercel Analytics や Sentry などでエラー・パフォーマンスを監視。
- Stripe Webhook の失敗時や DB エラーをログに残し、本番で問題が起きたときに追いかけやすくする。

### 13. メンテナンス表示
- メンテ時に「一時的に利用できません」を出すページや middleware でのリダイレクトがあると便利。

### 14. 利用可能ブラウザ・環境の明示
- ヘルプやフッターに「推奨環境」を1行だけ書いておくと問い合わせを減らせます（例: 最新の Chrome / Safari / Edge）。

---

## 確認用メモ

| 項目 | 状態 |
|------|------|
| 利用規約 | 未作成 |
| プライバシーポリシー | 未作成 |
| /api/crawl 認証 | ✅ 実装済み |
| /pricing 未ログイン閲覧 | ✅ 対応済み（auth.config.ts） |
| 404 / error ページ | ✅ 作成済み（not-found.tsx, error.tsx） |
| OGP・metadata・robots・sitemap | ✅ 対応済み |
| 本番 env / Stripe / OAuth | 要設定 |
| LP とアプリのルート設計 | 要検討 |
| ESLint | ✅ エラー解消済み |
| ビルド | ✅ 成功 |

---

上記の「必須」を満たしたうえで、LP とルート設計（6）を決めると、公開の準備としてかなり整います。
