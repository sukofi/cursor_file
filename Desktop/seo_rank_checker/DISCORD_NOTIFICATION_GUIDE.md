# 📱 Discord通知機能ガイド

## 📋 概要

このツールは、2種類のDiscord通知機能を提供しています：

1. **Webhook通知**（自動通知）- 順位チェック結果を自動送信
2. **Bot通知**（対話型）- チャットコマンドで操作

## 🔔 1. Webhook通知（自動通知）

### 📊 通知される内容

#### ✅ 下落なしの場合
```
## 📊 順位チェック結果

**実行日時**: 2026-02-03 14:30:00

✅ 下落したキーワードはありませんでした
```

#### ⚠️ 下落があった場合

**ヘッダー:**
```
## 📊 順位チェック結果

**実行日時**: 2026-02-03 14:30:00
```

**AI分析結果:**
```
### 🤖 AI分析結果

**📝 サマリー**
今回は5件のキーワードで順位下落が検出されました...

**📈 トレンド分析**
「買取」系キーワードで全体的に順位が下落...

**💡 改善提案**
1. コンテンツの充実化
2. 内部リンクの強化
...

**⚡ 優先対応キーワード**
1. `中古車 買取 相場`
2. `バイク 買取 おすすめ`
...
```

**順位下落キーワード:**
```
### ⚠️ 順位下落キーワード (5件)

**キーワード**: `中古車 買取 相場`
**順位変動**: 3位 → 7位 (▼4)
**自社URL**: https://example.com/car-souba
**上位競合**:
  1位: https://competitor1.com/...
  2位: https://competitor2.com/...

**📊 競合との差分分析** (今回):
```
項目          自社  競合平均  差分
----------------------------------------
見出し数        12      18.3     -6
文字数       2,500   4,200  -1,700
画像数           8      12.7     -5
内部リンク      15      22.3     -7
```

**💡 改善提案**:
  • 見出しを約6個追加
  • 約1,700文字のコンテンツを追加
  • 画像を約5枚追加
  • 内部リンクを約7個追加
```

**圏外落ちキーワード:**
```
### 🚫 圏外落ちキーワード (2件)

**キーワード**: `中古車 売却 税金`
**順位変動**: 8位 → 圏外
**前回URL**: https://example.com/car-tax
```

### ⚙️ 設定方法

#### 1. Webhook URLの取得

1. Discordサーバーで右クリック → 「サーバー設定」
2. 「連携サービス」→「ウェブフック」
3. 「新しいウェブフック」をクリック
4. 名前を設定（例：「SEO順位チェッカー」）
5. チャンネルを選択
6. 「ウェブフックURLをコピー」

#### 2. 環境変数に設定

`.env`ファイルに追加：

```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/123456789/abcdefg...
```

#### 3. 実行

```bash
python main.py
```

結果がDiscordに自動送信されます。

### 📏 メッセージ分割

Discord の制限（2000文字）を考慮して、長いメッセージは自動的に複数に分割されます。

- 最大メッセージ長：1900文字（余裕を持たせるため）
- 分割単位：キーワードごと
- 自動分割：AI分析、下落キーワード、圏外落ちで個別に分割

### 🎨 カスタマイズ

`notifier.py`を編集してフォーマットをカスタマイズできます：

```python
class DiscordNotifier:
    MAX_MESSAGE_LENGTH = 1900  # メッセージ長の制限を変更
    
    def _format_dropped_keyword(self, kw_data: Dict[str, Any]) -> str:
        # フォーマットをカスタマイズ
        ...
```

---

## 🤖 2. Discord Bot（対話型通知）

### 🎯 Bot の機能

#### コマンド一覧

| コマンド | 説明 | 例 |
|---------|------|-----|
| `!rank` | 全キーワードの順位チェック | `!rank` |
| `!rank N` | 最初のN件のみチェック | `!rank 10` |
| `!status` | 現在の設定を確認 | `!status` |
| `!usage` | ヘルプを表示 | `!usage` |
| `!analyze <KW> <URL>` | 競合分析を実行 | `!analyze "中古車買取" https://example.com/car` |

#### 自然言語対話

メンション付きで話しかけると、AIと自由に会話できます：

```
@SEO Reporter こんにちは！
@SEO Reporter 今日の順位をチェックして
@SEO Reporter 「中古車 買取」のキーワードについて教えて
```

### 📊 Bot通知の特徴

#### 1. Embed形式での表示

見やすいカード形式で結果を表示：

```
┌─────────────────────────────┐
│ 📊 順位チェック結果           │
│ 実行日時: 2026-02-03 14:30   │
├─────────────────────────────┤
│ 📉 順位下落: 5件              │
│ 🚫 圏外落ち: 2件              │
└─────────────────────────────┘
```

#### 2. リアルタイム進捗

実行中の状態をリアルタイムで表示：

```
Bot: 📊 順位チェックを開始します...
Bot: 📥 スプレッドシートからキーワードを取得中...
Bot: ✅ 152件のキーワードを取得しました
Bot: 🔍 順位チェックを実行中... (これには数分かかる場合があります)
```

#### 3. AI分析統合

結果にAI分析を自動的に含めます：

```
┌─────────────────────────────┐
│ 🤖 AI分析結果                 │
├─────────────────────────────┤
│ 📝 今回の順位変動について...  │
│                              │
│ 💡 改善提案:                  │
│ 1. コンテンツの充実化          │
│ 2. 内部リンクの強化            │
└─────────────────────────────┘
```

#### 4. 競合分析結果

`!analyze`コマンドで詳細な競合分析：

```
┌─────────────────────────────┐
│ 📊 競合分析: 中古車買取        │
├─────────────────────────────┤
│ 🏠 自社サイト                 │
│ 見出し: 12個                  │
│ 文字数: 2,500文字             │
│ 画像: 8枚                     │
│ 内部リンク: 15個               │
│                              │
│ 🎯 競合平均（上位3位）         │
│ 見出し: 18.3個                │
│ 文字数: 4,200文字             │
│ 画像: 12.7枚                  │
│ 内部リンク: 22.3個             │
│                              │
│ 💡 改善提案                   │
│ • 見出しを6個追加              │
│ • 約1,700文字追加             │
│ • 画像を5枚追加                │
│ • 内部リンクを7個追加           │
└─────────────────────────────┘
```

### ⚙️ Bot設定方法

#### 1. Bot Tokenの取得

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. 「New Application」をクリック
3. 「Bot」セクションで「Add Bot」をクリック
4. Tokenをコピー

#### 2. 権限の設定

「OAuth2 → URL Generator」で以下を選択：
- **Scopes**: `bot`, `applications.commands`
- **Bot Permissions**: 
  - `Send Messages`
  - `Read Message History`
  - `Embed Links`
  - `Attach Files`

#### 3. Intentsの有効化

「Bot」セクションで：
- ☑️ `MESSAGE CONTENT INTENT` を有効化

#### 4. 環境変数に設定

`.env`ファイルに追加：

```bash
DISCORD_BOT_TOKEN=your_bot_token_here
```

#### 5. Bot起動

```bash
python discord_bot.py
```

起動ログ：
```
[INFO] Logged in as SEO Reporter#1234
[INFO] 自然言語対話モード: 有効
[INFO] コマンド: !rank, !status, !usage, !analyze
============================================================
```

---

## 🔄 通知の流れ

### パターン1: コマンドライン実行（Webhook）

```
python main.py
    ↓
順位チェック実行
    ↓
下落検出
    ↓
競合分析（自動）
    ↓
AI分析（自動）
    ↓
Webhook経由でDiscordに送信
    ↓
指定チャンネルに通知
```

### パターン2: Discord Bot

```
ユーザー: !rank
    ↓
Bot応答: 📊 順位チェックを開始します...
    ↓
順位チェック実行
    ↓
Bot応答: ✅ 152件のキーワードを取得しました
    ↓
下落検出
    ↓
競合分析（自動）
    ↓
AI分析（自動）
    ↓
Bot応答: Embed形式で結果を表示
```

---

## 📊 通知のカスタマイズ

### 1. 通知する条件を変更

`notifier.py`を編集：

```python
def send_rank_drop_report(self, ...):
    # 下落なしの場合も通知するか
    if not dropped_keywords and not out_of_ranking_keywords:
        # ここをコメントアウトすると下落なし時は通知しない
        # message = self._create_no_change_message(checked_at)
        # return self._send_message(message)
        return True  # 何も送信しない
```

### 2. 通知フォーマットを変更

```python
def _format_dropped_keyword(self, kw_data: Dict[str, Any]) -> str:
    # 絵文字を追加
    keyword = kw_data['keyword']
    prev_rank = kw_data['previous_rank']
    curr_rank = kw_data['current_rank']
    
    # カスタムフォーマット
    lines = [
        f"🔻 **{keyword}**",
        f"   {prev_rank}位 ➜ {curr_rank}位",
        # ...
    ]
```

### 3. メンション通知を追加

重要な下落時にメンションを追加：

```python
# 大きな下落の場合
if curr_rank - prev_rank >= 5:
    lines.insert(0, "@everyone ⚠️ 大きな順位下落が検出されました！")
```

---

## 🎯 ベストプラクティス

### 1. 通知チャンネルの分離

- **#seo-alerts**: 順位下落の通知
- **#seo-reports**: 定期レポート
- **#seo-bot**: Bot操作用

複数のWebhookを使い分ける：

```bash
# .env
DISCORD_WEBHOOK_ALERT=https://discord.com/api/webhooks/123/alert
DISCORD_WEBHOOK_REPORT=https://discord.com/api/webhooks/123/report
```

### 2. 通知タイミング

```bash
# cron設定例（毎週月曜9時）
0 9 * * 1 cd /path/to/seo_rank_checker && python main.py
```

### 3. エラー通知

エラー時も通知するように設定：

```python
try:
    checker.check_rankings(...)
except Exception as e:
    # エラー通知
    requests.post(webhook_url, json={
        "content": f"❌ エラーが発生しました: {e}"
    })
```

---

## 🔧 トラブルシューティング

### Webhook通知が届かない

```bash
# テスト送信
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content": "テスト通知"}'
```

### Bot が応答しない

1. Bot Tokenが正しいか確認
2. Intentsが有効化されているか確認
3. ログを確認：
   ```bash
   python discord_bot.py 2>&1 | tee bot.log
   ```

### 文字化けする

`notifier.py`のエンコーディング確認：

```python
# UTF-8で保存されているか確認
# -*- coding: utf-8 -*-
```

---

## 📚 関連ドキュメント

- [README.md](README.md) - 全体ドキュメント
- [COMPETITOR_ANALYSIS_GUIDE.md](COMPETITOR_ANALYSIS_GUIDE.md) - 競合分析ガイド
- [CHAT_GUIDE.md](CHAT_GUIDE.md) - Bot対話ガイド

---

**更新日**: 2026-02-03
**バージョン**: v2.2
