# 自然言語対話機能ガイド

## 📋 概要

Discord BotがコマンドだけでなAngefang、自然な日本語での対話に対応しました！

## ✨ 主な機能

### 1. 自然言語での操作

従来のコマンド形式（`!rank`、`!analyze`など）に加えて、以下のような自然な日本語で操作できます：

**順位チェック:**
- 「順位をチェックして」
- 「今日のランキングを見せて」
- 「検索順位を確認したい」

**競合分析:**
- 「中古車買取というキーワードを分析して」
- 「競合サイトを調べて」

**設定確認:**
- 「設定を見せて」
- 「今の状態は？」

**ヘルプ:**
- 「使い方を教えて」
- 「何ができるの？」

**挨拶:**
- 「こんにちは」
- 「おはよう」

### 2. 会話履歴の記憶

ユーザーごとに会話履歴を保持し、文脈を理解した応答が可能です（最大10メッセージ）。

### 3. AI による質問応答

SEOに関する質問に対して、Gemini AIが回答します：
- 「SEOって何？」
- 「順位が下がった原因は？」
- 「内部リンクの重要性について教えて」

## 🎯 使い方

### Botへの話しかけ方

1. **DMで直接メッセージ**
   - Botに直接メッセージを送信

2. **サーバーでメンション**
   - `@SEO Reporter こんにちは！`
   - `@SEO Reporter 順位をチェックして`

3. **従来のコマンド**
   - `!rank` - 順位チェック
   - `!analyze "キーワード" "URL"` - 競合分析
   - `!status` - 設定表示
   - `!usage` - ヘルプ表示

## 🔧 技術詳細

### アーキテクチャ

```
ユーザーメッセージ
    ↓
discord_bot.py (on_message)
    ↓
ai_analyzer.py (understand_user_intent)
    ↓
[Gemini API] または [フォールバックキーワードマッチ]
    ↓
意図の判定 (intent, parameters)
    ↓
discord_bot.py (execute_intent)
    ↓
該当機能の実行
```

### 意図の種類

| 意図 | 説明 | 実行されるアクション |
|------|------|---------------------|
| `rank_check` | 順位チェック | `!rank`コマンド相当 |
| `analyze` | 競合分析 | `!analyze`コマンド相当 |
| `status` | 設定確認 | `!status`コマンド相当 |
| `help` | ヘルプ | `!usage`コマンド相当 |
| `greeting` | 挨拶 | 挨拶メッセージを返信 |
| `question` | 質問 | AI が回答 |
| `unknown` | 不明 | ヘルプ情報を表示 |

### フォールバック機能

Gemini API が利用できない場合、キーワードベースのシンプルなマッチングで意図を判定します：

```python
# 順位チェック
if any(word in message for word in ['順位', 'チェック', 'ランク', '確認']):
    return {'intent': 'rank_check', 'confidence': 0.8, ...}
```

## 📝 実装ファイル

### ai_analyzer.py
- `understand_user_intent()` - ユーザーの意図を理解
- `chat()` - 自然な会話形式の対話
- `_fallback_intent_detection()` - フォールバック意図検出

### discord_bot.py
- `on_message()` - メッセージ受信ハンドラー
- `handle_natural_language()` - 自然言語処理
- `execute_intent()` - 意図に基づくアクション実行
- `conversation_history` - 会話履歴管理

## 🚀 セットアップ

### 1. 必要な環境変数

`.env`ファイルに以下を設定：

```bash
DISCORD_BOT_TOKEN=your_discord_bot_token
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Botの起動

```bash
python discord_bot.py
```

### 3. 動作確認

Botにメンションまたは DMで話しかける：

```
@SEO Reporter こんにちは！
```

## ⚙️ 設定

### config/settings.yaml

```yaml
# AI Analysis settings
enable_ai_analysis: true  # AI分析を有効化
gemini_model: "gemini-pro"  # 使用するGeminiモデル
```

## 🐛 トラブルシューティング

### Gemini API エラー

**症状:** AI機能が動作しない

**対処法:**
1. `.env`に`GEMINI_API_KEY`が正しく設定されているか確認
2. Gemini API の利用可能リージョンを確認
3. フォールバック機能は動作するため、基本的な意図理解は可能

### Bot が反応しない

**症状:** メッセージを送っても反応がない

**対処法:**
1. DMで送信するか、Botをメンション
2. コマンド（`!help`）で動作確認
3. ログを確認：`tail -f bot.log`

## 📊 使用例

### 例1: 順位チェック

```
ユーザー: @SEO Reporter 順位をチェックして
Bot: 📊 わかりました！順位チェックを開始します...
     ✅ 688件のキーワードを取得しました
     🔍 順位チェックを実行中...
```

### 例2: 競合分析

```
ユーザー: @SEO Reporter 中古車買取で分析したい
Bot: 競合分析を実行します。URL を教えてください。
     例: 「中古車買取」というキーワードで https://example.com を分析して

ユーザー: https://daikichi-kaitori.jp/car で分析して
Bot: 🔍 「中古車買取」の競合分析を開始します！
```

### 例3: SEO質問

```
ユーザー: @SEO Reporter SEOで大事なことは？
Bot: SEOで重要なポイントは以下の通りです：

     1. **コンテンツの質**: ユーザーにとって価値のある情報を提供
     2. **キーワード最適化**: 検索意図に合ったキーワード選定
     3. **内部リンク構造**: サイト内の情報を適切につなぐ
     4. **ページ速度**: 高速な読み込み時間
     5. **モバイル対応**: スマホでも快適に閲覧可能
     
     これらを継続的に改善していくことが大切です！
```

## 🔄 今後の拡張予定

- [ ] 複数ターンにわたる対話（パラメータ収集）
- [ ] 音声入力対応
- [ ] 定期レポートの自動生成
- [ ] より高度な意図理解（感情分析、文脈理解）
- [ ] ユーザー設定の個別カスタマイズ

## 📚 参考資料

- [Discord.py ドキュメント](https://discordpy.readthedocs.io/)
- [Gemini API ドキュメント](https://ai.google.dev/docs)
- [プロジェクトREADME](./README.md)
