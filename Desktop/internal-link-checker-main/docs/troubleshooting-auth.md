# 「There is a problem with the server configuration」の対処

ログイン時にこのメッセージが出る場合、NextAuth のサーバー側設定が不足しています。

---

## まず: 本当のエラーを Vercel で確認する

1. Vercel → プロジェクト → **Logs**
2. **「Googleでログイン」を押した直後**の時刻を覚えておく
3. ログ一覧で **Status が 500** の行、または **Path が `/api/auth/...`** の行を探してクリック
4. 右側の詳細で **Error** や **Message** を確認する

ここに「AUTH_SECRET が…」「Connection refused」「relation "users" does not exist」など、**具体的な原因**が出ます。その文言をメモしてから下の項目を確認してください。

---

## 環境変数・設定の確認

---

## 1. AUTH_SECRET または NEXTAUTH_SECRET が設定されているか（最も多い原因）

本番では **AUTH_SECRET**（または **NEXTAUTH_SECRET**）が必須です。未設定だとこのエラーになります。  
このアプリでは、どちらか一方が設定されていれば動作します（AUTH_SECRET を優先、なければ NEXTAUTH_SECRET を使用）。

**やること:**

1. Vercel のプロジェクト → **Settings** → **Environment Variables**
2. **AUTH_SECRET** があるか確認
3. **ない場合**
   - ローカルで次のどちらかを実行してランダムな文字列を生成:
     ```bash
     openssl rand -base64 32
     ```
     または
     ```bash
     npx auth secret
     ```
   - Vercel で **Add New** → Name: `AUTH_SECRET`、Value: 生成した文字列
   - **Production** にチェック → Save
4. **ある場合** … 値が空でないか、前後にスペースが入っていないか確認
5. 環境変数を変更したら **Redeploy** する（Deployments → 最新の ⋮ → Redeploy）

---

## 2. AUTH_URL を本番 URL に設定する

Vercel でも「サーバー設定エラー」が続くときは、**AUTH_URL** を明示すると解消することがあります。

**やること:**

1. Vercel → **Settings** → **Environment Variables**
2. **Add New**（または既存を編集）
   - **Name**: `AUTH_URL`
   - **Value**: 本番の URL（末尾スラッシュなし）  
     例: `https://internal-link-checker-livid.vercel.app`
   - **Environment**: Production にチェック → Save
3. **Redeploy** する

---

## 3. データベース（DATABASE_URL）が正しいか

NextAuth は Prisma アダプターでユーザー・セッションを DB に保存します。**DATABASE_URL** が未設定・誤り・接続不可だと、コールバック時にエラーになることがあります。

**やること:**

- Vercel の **DATABASE_URL** と **DIRECT_URL** が、Supabase の接続文字列と一致しているか確認
- 本番 DB で **マイグレーション済みか** 確認（`npx prisma migrate deploy` を実行済みか）
- Supabase の「Database」で、接続が許可されているか確認

---

## 4. Google OAuth（GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET）

**GOOGLE_CLIENT_ID** と **GOOGLE_CLIENT_SECRET** が本番用の値で設定されているか確認してください。  
開発用のクライアントのままだったり、値が空だと認証で失敗することがあります。

---

## 5. ルート (/) が 401 のまま・ログインに飛ばない（キャッシュの可能性）

Vercel の **Logs** で `GET /` が **401** になっており、詳細に **Cache: 401 Unauthorized** と出ている場合、**過去の 401 レスポンスが CDN にキャッシュされている**可能性があります。

**やること:**

1. **Redeploy** する  
   Vercel → **Deployments** → 最新デプロイの **⋮** → **Redeploy**。  
   「Redeploy with existing Build Cache」のチェックを**外して**再デプロイすると、キャッシュの影響を減らせます。
2. **ブラウザ側**  
   シークレットウィンドウで開くか、該当サイトの Cookie・キャッシュを削除してから `https://あなたのドメイン/` にアクセスし直す。
3. **コード側**  
   `proxy.ts` で 401 を 302 リダイレクトに変換し、そのレスポンスに `Cache-Control: no-store` などを付けています。上記の Redeploy で最新コードが乗れば、新規のリクエストでは 401 は返さず 302 になるため、以後 401 がキャッシュされにくくなります。

---

## 確認チェックリスト

| 環境変数 | 本番で設定済み？ | 備考 |
|----------|------------------|------|
| AUTH_SECRET | ✅ 必須 | 空でない・再デプロイ済み |
| AUTH_URL | 推奨 | 上記エラーが続くときに入れる |
| DATABASE_URL | ✅ 必須 | Supabase の接続文字列 |
| DIRECT_URL | ✅ 必須 | Supabase の直接接続 |
| GOOGLE_CLIENT_ID | ✅ 必須 | 本番用 OAuth クライアント |
| GOOGLE_CLIENT_SECRET | ✅ 必須 | 同上 |

すべて設定したら **Redeploy** し、もう一度ログインを試してください。  
Vercel の **Deployments** → 該当デプロイ → **Functions** のログで、具体的なエラー内容も確認できます。
