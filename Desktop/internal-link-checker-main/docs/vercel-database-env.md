# Vercel にデータベース環境変数を追加する手順

DATABASE_URL と DIRECT_URL がないとログイン後に「Server configuration」エラーになります。Supabase から取得して Vercel に追加してください。

---

## 1. Supabase で接続文字列をコピー

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. 使っている **プロジェクト** を選択
3. 左メニュー **「Project Settings」**（歯車アイコン）→ **「Database」**
4. **「Connection string」** のところまでスクロール

### DATABASE_URL（トランザクション用・プール）

- **「URI」** タブを選択
- **「Use connection pooling」** をオンにする（推奨）
- **Mode**: **Transaction** のまま
- 表示された URL をコピー（`postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` のような形式）
- **`[YOUR-PASSWORD]`** の部分を、実際のデータベースのパスワードに置き換える  
  - パスワードは「Database」設定の上の方にある **Database password**（作成時に設定したもの。忘れた場合は「Reset database password」で再設定）

### DIRECT_URL（マイグレーション・直接接続用）

- 同じ **「Connection string」** の **「URI」** で
- **「Use connection pooling」** を **オフ** にする
- 表示された URL をコピー（`postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres` のような形式、ポートが **5432**）
- 同じく **`[YOUR-PASSWORD]`** を実際のパスワードに置き換える

---

## 2. Vercel に環境変数を追加

1. Vercel のプロジェクト → **Settings** → **Environment Variables**
2. **「Add New」** を 2 回使って、次の 2 つを追加する

| Name          | Value                    | Environment   |
|---------------|--------------------------|---------------|
| `DATABASE_URL` | 手順1でコピーした **プール用の URL**（パスワード置き換え済み） | Production（必要なら Preview も） |
| `DIRECT_URL`   | 手順1でコピーした **直接接続の URL**（パスワード置き換え済み） | Production（必要なら Preview も） |

3. **Save** する

---

## 3. 本番 DB にテーブルを作る（初回だけ）

初めてこの DB を使う場合は、マイグレーションでテーブルを作成する必要があります。

1. ローカルの `.env` または `.env.local` に、**本番用の** `DATABASE_URL` と `DIRECT_URL` を一時的に書く（Vercel に追加したのと同じ値）
2. ターミナルで実行:
   ```bash
   npx prisma migrate deploy
   ```
3. 「X migrations applied」のように出れば成功。Supabase の **Table Editor** で `User` や `Project` などのテーブルができているか確認できます。
4. 本番のパスワードをローカルに残したくない場合は、実行後に `.env` / `.env.local` から削除して問題ありません。

---

## 4. 再デプロイ

1. Vercel の **Deployments** を開く
2. 最新のデプロイの **⋮** → **Redeploy**
3. 完了後、もう一度「Googleでログイン」を試す

---

これでログイン後のユーザー保存が動き、「Server configuration」エラーが解消されるはずです。
