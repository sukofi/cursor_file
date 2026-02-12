# 500 エラーの原因を特定する手順

## 1. Vercel の Logs で 500 のリクエストを確認する

1. **Vercel** → プロジェクト → **Logs**
2. **Timeline** を「Last 30 minutes」などにする
3. **Status が 500** の行を探してクリック
4. 右側の詳細で次を確認:
   - **Path**: どの URL で 500 になったか（例: `/api/auth/callback/google`, `/api/sheets`）
   - **Error** / **Message**: 表示されていれば、その文言が原因

## 2. よくある原因

| Path | 想定される原因 |
|------|----------------|
| `/api/auth/callback/google` | DB 接続失敗、テーブルなし、AUTH_SECRET 未設定 |
| `/api/sheets` | セッション切れ、Google トークンエラー |
| `/api/crawl` | 認証エラー、タイムアウト |
| `/api/stripe/...` | STRIPE_SECRET_KEY 未設定、Webhook 署名エラー |

## 3. Functions のログを見る

- **Logs** で 500 の行をクリックしたとき、詳細に **Stack trace** や **Error** が出ていることがあります
- **Deployments** → 該当デプロイ → **Functions** から、該当する関数のログを開いてもエラー内容を確認できます

---

**500 の Path と、表示されている Error/Message の文言をメモして共有してもらえれば、原因を絞り込めます。**
