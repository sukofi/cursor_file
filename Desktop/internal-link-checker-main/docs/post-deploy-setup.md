# デプロイ後の設定（詳細手順）

Vercel にデプロイしたあと、本番でログイン・決済・DB が正しく動くようにするための設定を、それぞれ詳しく説明します。

---

## 1. Google OAuth（ログイン）の設定

### なぜ必要か

本サービスは「Google でログイン」を使っています。ログインが終わると、Google が **リダイレクト URI** にユーザーを戻します。  
この「戻り先 URL」を Google 側に登録しておかないと、「リダイレクト URI が無効です」というエラーになり、本番でログインできません。

### 手順

1. **本番の URL を確認する**
   - Vercel のダッシュボードでプロジェクトを開く
   - デプロイ後の URL をコピー（例: `https://internal-link-checker-xxx.vercel.app`）

2. **Google Cloud Console を開く**
   - ブラウザで [Google Cloud Console](https://console.cloud.google.com/) にログイン
   - このプロジェクトで使っている **プロジェクト** を選択（左上のプロジェクト名）

3. **認証情報の画面へ**
   - 左メニュー **「API とサービス」** → **「認証情報」**
   - 一覧から **「OAuth 2.0 クライアント ID」** をクリック（種類が「ウェブアプリケーション」のもの）

4. **リダイレクト URI を追加**
   - **「承認済みのリダイレクト URI」** の **「URI を追加」** をクリック
   - 次の URL を **そのまま** 入力（`あなたの本番URL` の部分だけ自分の Vercel URL に置き換える）:
     ```
     https://あなたの本番URL/api/auth/callback/google
     ```
   - 例: `https://internal-link-checker-abc123.vercel.app/api/auth/callback/google`
   - **「保存」** をクリック

5. **反映時間**
   - 保存後、数分以内に反映されます。すぐログインできない場合は少し待ってから再試行してください。

### カスタムドメインを使う場合

- 本番で `https://yourdomain.com` のような独自ドメインを使う場合は、上記と同じ形式で **もう 1 つ** リダイレクト URI を追加します。
  - 例: `https://yourdomain.com/api/auth/callback/google`
- ローカル用の `http://localhost:3000/api/auth/callback/google` はそのまま残して問題ありません。

### うまくいかないとき

- **「リダイレクト URI が無効です」**  
  → 入力した URL に余分なスペースやスラッシュがないか確認。`/api/auth/callback/google` まで含まれているか確認。
- **「アクセスブロック」**  
  → OAuth 同意画面で「テスト」のままなら、ログインできる Google アカウントを「テストユーザー」に追加する必要があります（本番公開時は「公開」に変更）。

---

## 2. Stripe（決済・Webhook）の設定

### なぜ必要か

- **Checkout** … ユーザーが「アップグレード」を押したときに Stripe の決済ページへ飛ばすため、Stripe が「この URL にリダイレクトしてよい」と分かるようにします（アプリ側の環境変数で設定済みなら、主に Stripe ダッシュボード側の設定です）。
- **Webhook** … 決済が完了したとき・解約したときなどに、Stripe が **あなたのサーバー** に通知を送ります。この「通知先 URL」と「署名の秘密」を設定しないと、本番で Pro プランにアップグレードしても DB のプランが更新されません。

ここでは **Webhook の設定** を詳しく説明します。

### 手順（Webhook エンドポイントの追加）

1. **Stripe ダッシュボードを開く**
   - [Stripe Dashboard](https://dashboard.stripe.com/) にログイン
   - 本番用のキーを使う場合は、左上の **「テストモード」** をオフにして **本番モード** にする（テストのままならテスト用 Webhook でよい）

2. **Webhook の一覧へ**
   - **「開発者」** → **「Webhook」**（または **Developers** → **Webhooks**）
   - **「エンドポイントを追加」**（**Add endpoint**）をクリック

3. **エンドポイント URL を入力**
   - **「エンドポイント URL」** に、次の形式で入力（`あなたの本番URL` を自分の Vercel URL に置き換える）:
     ```
     https://あなたの本番URL/api/stripe/webhook
     ```
   - 例: `https://internal-link-checker-abc123.vercel.app/api/stripe/webhook`

4. **イベントを選択**
   - **「イベントを選択」** または **「Select events」** をクリック
   - 少なくとも次の 4 つにチェックを入れる:
     - `checkout.session.completed` … 決済完了時に Pro にする
     - `customer.subscription.updated` … サブスク更新・キャンセル時
     - `customer.subscription.deleted` … サブスク解約時
     - `invoice.payment_failed` … 支払い失敗時（任意だが推奨）
   - **「エンドポイントを追加」** で保存

5. **Signing secret をコピー**
   - 作成した Webhook をクリックして開く
   - **「署名シークレット」**（**Signing secret**）の **「表示」** をクリック
   - 表示された `whsec_...` で始まる文字列を **すべて** コピー

6. **Vercel の環境変数に設定**
   - Vercel のプロジェクト → **Settings** → **Environment Variables**
   - 既に `STRIPE_WEBHOOK_SECRET` がある場合は **編集**、なければ **Add New**
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: さきほどコピーした `whsec_...` を貼り付け
   - **Environment**: Production（と Preview が必要ならそれも）にチェック
   - **Save** する

7. **再デプロイ**
   - 環境変数を変えただけでは動かないことがあるため、**Deployments** から **Redeploy**（最新のデプロイの ⋮ → Redeploy）を実行するか、空コミットでプッシュして再デプロイする

### テスト用と本番用の違い

- **テストモード** の Webhook → Signing secret は **テスト用**（`whsec_...` でも本番用とは別の値）
- **本番モード** の Webhook → Signing secret は **本番用**
- Vercel の `STRIPE_SECRET_KEY` が `sk_live_...` なら、`STRIPE_WEBHOOK_SECRET` も **本番用 Webhook の** Signing secret にすること

### うまくいかないとき

- **アップグレード後もプランが Pro にならない**  
  → Stripe の Webhook 一覧で、該当エンドポイントの「最近の配信」を開き、失敗していないか確認。失敗している場合は「応答コード」やエラーメッセージを確認し、Vercel の Function ログも見る。
- **署名エラー（Invalid signature）**  
  → `STRIPE_WEBHOOK_SECRET` が、この Webhook の Signing secret と **完全に一致** しているか確認（前後にスペースが入っていないか）。

---

## 3. 環境変数（NEXT_PUBLIC_SITE_URL）

### なぜ必要か

- **OGP**（SNS でシェアしたときのタイトル・説明・画像）や **sitemap.xml**・**robots.txt** で、「このサイトの本番 URL」を参照するために使っています。
- 未設定だと `https://example.com` のままになり、シェア時のリンクや検索エンジン向けの URL が誤ります。
- また、Stripe の Checkout（決済後の戻り先）とポータル（設定画面に戻る）では **`NEXT_PUBLIC_APP_URL`** を参照しています。本番では **`NEXT_PUBLIC_APP_URL`** にも同じ本番 URL を設定してください（未設定だと `http://localhost:3000` になり、決済後にローカルへ飛んでしまいます）。

### 手順

1. **Vercel で本番 URL を確認**
   - プロジェクトの **Deployments** で、本番の URL をコピー（例: `https://internal-link-checker-xxx.vercel.app`）
   - カスタムドメインを使う場合は、そのドメイン（例: `https://yourdomain.com`）を使う

2. **環境変数を設定・更新**
   - プロジェクト → **Settings** → **Environment Variables**
   - 次の 2 つを、どちらも **同じ本番 URL** で設定する:
     - **Name**: `NEXT_PUBLIC_SITE_URL`  
       **Value**: 本番 URL（例: `https://xxx.vercel.app`）
     - **Name**: `NEXT_PUBLIC_APP_URL`  
       **Value**: 上と同じ本番 URL（Stripe の決済後の戻り先で使用）
   - いずれも末尾の `/` は不要。**Environment**: 少なくとも **Production** にチェック → **Save**

3. **再デプロイ**
   - `NEXT_PUBLIC_*` はビルド時に埋め込まれるため、値を変えたら **Redeploy** が必要です。  
     **Deployments** から最新を **Redeploy** するか、コミットをプッシュして再デプロイしてください。

### 補足

- ローカルでは `.env.local` に `NEXT_PUBLIC_SITE_URL=http://localhost:3000` と `NEXT_PUBLIC_APP_URL=http://localhost:3000` を入れておくと、OGP・sitemap・Stripe の戻り先が正しく動きます。

---

## 4. データベース（マイグレーション）

### なぜ必要か

Prisma の **マイグレーション** を本番 DB に適用していないと、テーブル（User, Account, Project など）が存在せず、ログインやプロジェクト保存でエラーになります。  
Vercel のビルドでは `prisma generate` しか実行していないため、**本番 DB に対して一度だけ** `prisma migrate deploy` を実行する必要があります。

### 手順

1. **本番の接続情報を用意**
   - Supabase のダッシュボード → **Project Settings** → **Database**
   - **Connection string** の **URI** をコピー（`postgresql://postgres.[ref]:[password]@...`）
   - **Transaction** 用（プール）と **Session** 用（直接）の 2 種類がある場合は、`.env.example` の `DATABASE_URL`（プール）と `DIRECT_URL`（直接）に対応するものを用意

2. **ローカルで一時的に本番の .env を用意**
   - 本番の `DATABASE_URL` と `DIRECT_URL` だけを書いたファイル（例: `.env.production.local`）を用意するか、一時的に `.env` に上書きして使う
   - **注意**: このファイルは Git にコミットしないでください（`.gitignore` に含まれていることを確認）

3. **マイグレーションを実行**
   - ターミナルでプロジェクトのルートに移動し、次を実行:
     ```bash
     npx prisma migrate deploy
     ```
   - 本番の `DATABASE_URL` が現在の環境変数（または `.env`）で読める状態にしておく

4. **成功の確認**
   - 成功すると「X migrations applied」のように表示されます。
   - Supabase の **Table Editor** で、`User` や `Project` などのテーブルができているか確認できます。

### ほかのやり方（Vercel のビルドで実行する場合）

- Vercel の **Build Command** を次のように変更すると、**毎回のデプロイ時** に本番 DB に対してマイグレーションが実行されます:
  ```bash
  npx prisma migrate deploy && npm run build
  ```
- この場合、ビルド時に `DATABASE_URL` と `DIRECT_URL` が Vercel の環境変数で設定されている必要があります。
- マイグレーションは「未適用のものだけ」適用されるので、既に適用済みならすぐ終わります。

### うまくいかないとき

- **「P1001: Can't reach database server」**  
  → Supabase の「Restrict connections」などで、Vercel やあなたの IP が許可されていない可能性があります。Supabase の設定で「Allow connections from any IP」などを確認するか、接続文字列を確認。
- **「Migration ... failed」**  
  → 既に手動でテーブルを変えていると競合することがあります。必要なら Prisma のドキュメント「Resolving migration history conflicts」を参照。

---

## チェックリスト（デプロイ後）

| 項目 | やること | 確認方法 |
|------|----------|----------|
| Google OAuth | 本番 URL のリダイレクト URI を追加 | 本番で「Google でログイン」が成功するか |
| Stripe Webhook | 本番 URL の Webhook を追加し、Signing secret を Vercel に設定 | アップグレード後にプランが Pro になるか |
| NEXT_PUBLIC_SITE_URL | 本番 URL を Vercel の環境変数に設定し、再デプロイ | シェア時の OGP や sitemap の URL が本番になっているか |
| DB マイグレーション | 本番 DB で `npx prisma migrate deploy` を実行 | ログイン・プロジェクト作成がエラーにならないか |

すべて完了していれば、本番でログイン・スプレッドシート連携・Pro アップグレードまで一通り利用できる状態になります。
