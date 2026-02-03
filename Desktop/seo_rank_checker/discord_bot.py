"""
Discord Bot - SEO順位チェッカー
チャットコマンドから順位チェックを実行できるボット
"""
import os
import sys
import discord
from discord.ext import commands
from dotenv import load_dotenv
import asyncio
from datetime import datetime
import yaml

# 標準出力のバッファリングを無効化
sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', buffering=1)
sys.stderr = os.fdopen(sys.stderr.fileno(), 'w', buffering=1)

from dataforseo_client import DataForSEOClient
from storage import RankingStorage
from rank_checker import RankChecker
from competitor_analyzer import CompetitorAnalyzer
from comparison_report import ComparisonReportGenerator

# AI分析機能（オプション）
try:
    from ai_analyzer import GeminiAnalyzer
except ImportError:
    GeminiAnalyzer = None


class SEORankBot(commands.Bot):
    """SEO順位チェックボット"""
    
    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(command_prefix='!', intents=intents)
        
        # 設定読み込み
        load_dotenv()
        self.load_config()
        
        # クライアント初期化
        self.setup_clients()
        
        # 会話履歴（ユーザーIDごとに管理）
        self.conversation_history = {}
        
    def load_config(self):
        """設定ファイルを読み込む"""
        with open('config/settings.yaml', 'r', encoding='utf-8') as f:
            self.config = yaml.safe_load(f)
        
        # 環境変数
        self.dataforseo_login = os.getenv('DATAFORSEO_LOGIN')
        self.dataforseo_password = os.getenv('DATAFORSEO_PASSWORD')
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        
    def setup_clients(self):
        """各種クライアントをセットアップ"""
        # DataForSEO
        self.dataforseo_client = DataForSEOClient(
            login=self.dataforseo_login,
            password=self.dataforseo_password
        )
        
        # Storage
        self.storage = RankingStorage(self.config.get('db_path', 'rankings.db'))
        
        # AI Analyzer
        self.ai_analyzer = None
        if self.config.get('enable_ai_analysis') and self.gemini_api_key and GeminiAnalyzer:
            try:
                self.ai_analyzer = GeminiAnalyzer(
                    api_key=self.gemini_api_key,
                    model_name=self.config.get('gemini_model', 'gemini-1.5-flash')
                )
                print("[INFO] AI分析機能が有効化されました")
            except Exception as e:
                print(f"[WARN] AI分析機能の初期化に失敗: {e}")
        
        # Competitor Analyzer
        self.competitor_analyzer = None
        if self.config.get('enable_competitor_analysis'):
            try:
                self.competitor_analyzer = CompetitorAnalyzer(
                    use_selenium=self.config.get('use_selenium', True)
                )
                print("[INFO] 競合分析機能が有効化されました")
            except Exception as e:
                print(f"[WARN] 競合分析機能の初期化に失敗: {e}")
    
    async def on_ready(self):
        """ボット起動時"""
        print(f'[INFO] {self.user} としてログインしました')
        print(f'[INFO] 自然言語対話モード: 有効')
        print(f'[INFO] コマンド: !rank, !status, !usage, !analyze')
        print('='*60)
    
    async def on_message(self, message):
        """メッセージ受信時の処理"""
        # ボット自身のメッセージは無視
        if message.author == self.user:
            return
        
        # コマンドの場合は通常処理
        if message.content.startswith(self.command_prefix):
            await self.process_commands(message)
            return
        
        # DMまたはメンションされた場合のみ応答
        if isinstance(message.channel, discord.DMChannel) or self.user in message.mentions:
            await self.handle_natural_language(message)
    
    async def handle_natural_language(self, message):
        """自然言語メッセージの処理（改善版）"""
        user_id = str(message.author.id)
        user_message = message.content.replace(f'<@{self.user.id}>', '').strip()
        
        print(f"[NL] Message from {message.author}: {user_message}")
        
        # 会話履歴を取得または作成
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        
        history = self.conversation_history[user_id]
        
        # AI分析が有効な場合のみ自然言語処理
        if not self.ai_analyzer:
            await message.reply("申し訳ありません。AI機能が有効化されていません。コマンド（!help）をご利用ください。")
            return
        
        try:
            # タイピングインジケーターを表示
            async with message.channel.typing():
                # 明確なコマンド意図があるかチェック
                intent_keywords = {
                    'rank_check': ['順位', 'チェック', 'ランク', '確認'],
                    'analyze': ['競合', '分析', 'analyze'],
                    'status': ['設定', 'ステータス', 'status'],
                }
                
                detected_intent = None
                for intent, keywords in intent_keywords.items():
                    if any(kw in user_message for kw in keywords):
                        detected_intent = intent
                        break
                
                # コマンド実行が必要な場合
                if detected_intent:
                    print(f"[NL] Detected command intent: {detected_intent}")
                    intent_data = await asyncio.to_thread(
                        self.ai_analyzer.understand_user_intent,
                        user_message,
                        history
                    )
                    await self.execute_intent(message, intent_data, user_message)
                else:
                    # 自由な会話モード（データベース情報を活用）
                    print(f"[NL] Free conversation mode")
                    
                    # データベース情報を取得
                    all_keywords = self.storage.get_all_keywords()
                    all_genres = self.storage.get_all_genres()
                    
                    # デバッグログ
                    print(f"[DEBUG Free] データベース情報:")
                    print(f"[DEBUG Free]   キーワード数: {len(all_keywords)}")
                    print(f"[DEBUG Free]   ジャンル数: {len(all_genres)}")
                    print(f"[DEBUG Free]   ジャンル一覧: {all_genres}")
                    
                    # コンテキスト情報を構築
                    context = {
                        'target_domain': self.config.get('target_domain'),
                        'keywords_count': len(all_keywords),
                        'genres': all_genres,
                        'all_keywords': all_keywords  # 全キーワード情報を渡す
                    }
                    
                    # Geminiと自由に会話
                    response = await asyncio.to_thread(
                        self.ai_analyzer.chat_with_tools,
                        user_message,
                        context,
                        history
                    )
                    
                    # 応答を送信（2000文字制限）
                    if len(response) > 2000:
                        # 長い場合は分割
                        chunks = [response[i:i+1900] for i in range(0, len(response), 1900)]
                        for i, chunk in enumerate(chunks[:3]):  # 最大3チャンク
                            if i == 0:
                                await message.reply(chunk)
                            else:
                                await message.channel.send(chunk)
                    else:
                        await message.reply(response)
                    
                    # AI応答を履歴に追加
                    history.append({'role': 'assistant', 'content': response})
                
                # ユーザーメッセージを履歴に追加
                history.append({'role': 'user', 'content': user_message})
                
                # 履歴は最大10件まで保持
                if len(history) > 10:
                    history.pop(0)
        
        except Exception as e:
            print(f"[ERROR] Natural language processing failed: {e}")
            import traceback
            traceback.print_exc()
            await message.reply("申し訳ありません。エラーが発生しました。")
    
    async def execute_intent(self, message, intent_data, original_message):
        """意図に基づいてアクションを実行"""
        intent = intent_data['intent']
        params = intent_data.get('parameters', {})
        
        if intent == 'rank_check':
            # 順位チェックを実行
            await message.reply("📊 わかりました！順位チェックを開始します...")
            # rank_checkコマンドの処理を呼び出し
            ctx = await self.get_context(message)
            limit = params.get('limit')
            await rank_check(ctx, limit)
        
        elif intent == 'analyze':
            keyword = params.get('keyword')
            url = params.get('url')
            
            if keyword and url:
                await message.reply(f"🔍 「{keyword}」の競合分析を開始します！")
                ctx = await self.get_context(message)
                await analyze_competitors(ctx, keyword, url)
            else:
                # パラメータが不足している場合は質問
                missing = []
                if not keyword:
                    missing.append('キーワード')
                if not url:
                    missing.append('URL')
                
                await message.reply(
                    f"競合分析を実行します。{' と '.join(missing)} を教えてください。\n"
                    f"例: 「中古車買取」というキーワードで https://example.com を分析して"
                )
        
        elif intent == 'status':
            # ステータス表示
            ctx = await self.get_context(message)
            await status(ctx)
        
        elif intent == 'help':
            # ヘルプ表示
            ctx = await self.get_context(message)
            await usage_command(ctx)
        
        elif intent == 'greeting':
            # 挨拶
            response = intent_data.get('response_suggestion', 'こんにちは！')
            await message.reply(
                f"{response}\n\n"
                "私はSEO順位チェックをお手伝いするAIです。\n"
                "「順位をチェックして」や「設定を見せて」など、自然な日本語で話しかけてください！"
            )
        
        elif intent == 'question':
            # SEOに関する質問に回答
            async with message.channel.typing():
                # データベース情報を取得
                all_keywords = self.storage.get_all_keywords()
                all_genres = self.storage.get_all_genres()
                
                # デバッグログ
                print(f"[DEBUG] データベース情報:")
                print(f"[DEBUG]   キーワード数: {len(all_keywords)}")
                print(f"[DEBUG]   ジャンル数: {len(all_genres)}")
                print(f"[DEBUG]   ジャンル一覧: {all_genres}")
                
                context = {
                    'target_domain': self.config.get('target_domain'),
                    'keywords_count': len(all_keywords),
                    'genres': all_genres,
                    'all_keywords': all_keywords  # 全キーワード情報を渡す
                }
                
                user_id = str(message.author.id)
                history = self.conversation_history.get(user_id, [])
                
                response = await asyncio.to_thread(
                    self.ai_analyzer.chat,
                    original_message,
                    context,
                    history
                )
                
                await message.reply(response)
                
                # AI応答を履歴に追加
                history.append({'role': 'assistant', 'content': response})
        
        else:
            # 不明な意図
            suggestion = intent_data.get('response_suggestion', '')
            await message.reply(
                f"{suggestion}\n\n"
                "以下のようなことができます:\n"
                "• 「順位をチェックして」→ 順位チェック実行\n"
                "• 「○○というキーワードを分析」→ 競合分析\n"
                "• 「設定を見せて」→ 現在の設定表示\n"
                "• SEOに関する質問にも答えます！"
            )


# ボットインスタンス
bot = SEORankBot()


@bot.command(name='rank', help='順位チェックを実行します')
async def rank_check(ctx, limit: int = None):
    """
    順位チェックコマンド
    
    使い方:
        !rank          - 全キーワードをチェック
        !rank 10       - 最初の10件のみチェック
    """
    print(f"\n[BOT] Rank check command received from {ctx.author}")
    print(f"[BOT] Limit: {limit}")
    
    await ctx.send("📊 順位チェックを開始します...")
    
    try:
        # データベースからキーワードを取得
        print(f"[BOT] Fetching keywords from database")
        await ctx.send(f"📥 データベースからキーワードを取得中...")
        
        all_keywords_data = bot.storage.get_all_keywords()
        keywords = [kw['keyword'] for kw in all_keywords_data]
        
        if limit:
            keywords = keywords[:limit]
            print(f"[BOT] Limited to {limit} keywords")
            await ctx.send(f"✅ {len(keywords)}件のキーワードを取得しました（制限: {limit}件）")
        else:
            await ctx.send(f"✅ {len(keywords)}件のキーワードを取得しました")
        
        if not keywords:
            await ctx.send("❌ キーワードが見つかりませんでした。`python3 import_csv.py <csv_file>`でキーワードをインポートしてください。")
            return
        
        # 順位チェック実行
        print(f"[BOT] Starting rank check for {len(keywords)} keywords")
        await ctx.send(f"🔍 順位チェックを実行中... (これには数分かかる場合があります)")
        
        checker = RankChecker(
            client=bot.dataforseo_client,
            storage=bot.storage,
            target_domain=bot.config['target_domain'],
            max_competitors_above=bot.config.get('max_competitors_above', 3),
            ai_analyzer=bot.ai_analyzer,
            competitor_analyzer=bot.competitor_analyzer
        )
        
        print("[BOT] Calling checker.check_rankings()...")
        dropped, out_of_ranking, ai_analysis = await asyncio.to_thread(
            checker.check_rankings,
            keywords=keywords,
            language_code=bot.config['language_code'],
            location_code=bot.config['location_code'],
            device=bot.config['device'],
            depth=bot.config['depth'],
            batch_size=bot.config.get('batch_size', 100),
            poll_interval=bot.config.get('poll_interval_sec', 20),
            poll_timeout=bot.config.get('poll_timeout_sec', 900),
            enable_ai_analysis=bot.config.get('enable_ai_analysis', True),
            enable_competitor_analysis=bot.config.get('enable_competitor_analysis', False),
            max_competitor_analysis_keywords=bot.config.get('max_competitor_analysis_keywords', 5)
        )
        
        print(f"[BOT] Check completed. Dropped: {len(dropped)}, Out: {len(out_of_ranking)}")
        
        # 結果を送信
        checked_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        await send_results(ctx, dropped, out_of_ranking, ai_analysis, checked_at)
        
    except Exception as e:
        error_msg = f"❌ エラーが発生しました: {str(e)}"
        await ctx.send(error_msg)
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()


async def send_results(ctx, dropped, out_of_ranking, ai_analysis, checked_at):
    """結果をDiscordに送信"""
    
    # サマリー
    embed = discord.Embed(
        title="📊 順位チェック結果",
        description=f"**実行日時**: {checked_at}",
        color=discord.Color.blue()
    )
    
    embed.add_field(
        name="📉 順位下落",
        value=f"{len(dropped)}件",
        inline=True
    )
    embed.add_field(
        name="🚫 圏外落ち",
        value=f"{len(out_of_ranking)}件",
        inline=True
    )
    
    await ctx.send(embed=embed)
    
    # AI分析結果
    if ai_analysis:
        ai_embed = discord.Embed(
            title="🤖 AI分析結果",
            color=discord.Color.green()
        )
        
        if ai_analysis.get('summary'):
            ai_embed.add_field(
                name="📝 サマリー",
                value=ai_analysis['summary'][:1024],
                inline=False
            )
        
        if ai_analysis.get('trends'):
            ai_embed.add_field(
                name="📈 トレンド分析",
                value=ai_analysis['trends'][:1024],
                inline=False
            )
        
        if ai_analysis.get('recommendations'):
            ai_embed.add_field(
                name="💡 改善提案",
                value=ai_analysis['recommendations'][:1024],
                inline=False
            )
        
        priority = ai_analysis.get('priority_keywords', [])
        if priority:
            priority_text = "\n".join([f"{i}. `{kw}`" for i, kw in enumerate(priority[:5], 1)])
            ai_embed.add_field(
                name="⚡ 優先対応キーワード",
                value=priority_text,
                inline=False
            )
        
        await ctx.send(embed=ai_embed)
    
    # 下落キーワード詳細
    if dropped:
        await ctx.send(f"\n### ⚠️ 順位下落キーワード ({len(dropped)}件)")
        
        # 最初の5件のみ表示
        for i, kw in enumerate(dropped[:5], 1):
            kw_embed = discord.Embed(
                title=f"{i}. {kw['keyword']}",
                color=discord.Color.orange()
            )
            kw_embed.add_field(
                name="順位変動",
                value=f"{kw['previous_rank']}位 → {kw['current_rank']}位 (▼{kw['current_rank'] - kw['previous_rank']})",
                inline=False
            )
            kw_embed.add_field(
                name="自社URL",
                value=kw.get('own_url', 'N/A')[:1024],
                inline=False
            )
            
            competitors = kw.get('competitors_above', [])
            if competitors:
                comp_text = "\n".join([f"{c['rank']}位: {c['url'][:80]}" for c in competitors[:2]])
                kw_embed.add_field(
                    name="上位競合",
                    value=comp_text,
                    inline=False
                )
            
            await ctx.send(embed=kw_embed)
        
        if len(dropped) > 5:
            await ctx.send(f"... 他 {len(dropped) - 5}件")
    
    # 圏外落ち詳細
    if out_of_ranking:
        await ctx.send(f"\n### 🚫 圏外落ちキーワード ({len(out_of_ranking)}件)")
        
        # 最初の5件のみ表示
        out_text = "\n".join([
            f"{i}. `{kw['keyword']}` ({kw['previous_rank']}位 → 圏外)"
            for i, kw in enumerate(out_of_ranking[:5], 1)
        ])
        await ctx.send(out_text)
        
        if len(out_of_ranking) > 5:
            await ctx.send(f"... 他 {len(out_of_ranking) - 5}件")
    
    if not dropped and not out_of_ranking:
        await ctx.send("✅ **下落したキーワードはありませんでした**")


@bot.command(name='status', help='現在の設定とステータスを表示')
async def status(ctx):
    """ステータス表示"""
    embed = discord.Embed(
        title="⚙️ 設定情報",
        color=discord.Color.blue()
    )
    
    embed.add_field(name="対象ドメイン", value=bot.config['target_domain'], inline=False)
    embed.add_field(name="ロケーション", value=f"{bot.config['location_code']} ({bot.config['language_code']})", inline=True)
    embed.add_field(name="デバイス", value=bot.config['device'], inline=True)
    embed.add_field(name="AI分析", value="有効" if bot.ai_analyzer else "無効", inline=True)
    
    if bot.ai_analyzer:
        embed.add_field(name="AIモデル", value=bot.config.get('gemini_model', 'N/A'), inline=True)
    
    await ctx.send(embed=embed)


@bot.command(name='usage', help='使い方を表示')
async def usage_command(ctx):
    """使い方表示"""
    help_text = """
**📖 SEO順位チェッカー Bot コマンド**

`!rank` - 全キーワードの順位チェックを実行
`!rank 10` - 最初の10件のみチェック
`!status` - 現在の設定を表示
`!usage` - この使い方を表示
`!analyze <キーワード> <自社URL>` - 競合分析を実行

**使用例:**
```
!rank          # 全キーワードをチェック
!rank 5        # 最初の5件のみチェック
!status        # 設定確認
!usage         # 使い方表示
!analyze "中古車買取" https://daikichi-kaitori.jp/car  # 競合分析
```
"""
    await ctx.send(help_text)


@bot.command(name='analyze', help='キーワードに対する競合分析を実行')
async def analyze_competitors(ctx, keyword: str = None, own_url: str = None):
    """
    競合分析コマンド
    
    使い方:
        !analyze "キーワード" "自社URL"
        
    例:
        !analyze "中古車買取" https://daikichi-kaitori.jp/car
    """
    if not keyword or not own_url:
        await ctx.send("❌ 使い方: `!analyze \"キーワード\" \"自社URL\"`\n例: `!analyze \"中古車買取\" https://daikichi-kaitori.jp/car`")
        return
    
    print(f"\n[BOT] Analyze command received from {ctx.author}")
    print(f"[BOT] Keyword: {keyword}, Own URL: {own_url}")
    
    await ctx.send(f"🔍 **キーワード「{keyword}」の競合分析を開始します...**")
    
    try:
        # 上位3位の競合URLを取得
        await ctx.send("📊 上位競合を検索中...")
        
        checker = RankChecker(
            client=bot.dataforseo_client,
            storage=bot.storage,
            target_domain=bot.config['target_domain'],
            max_competitors_above=3,
            ai_analyzer=bot.ai_analyzer
        )
        
        # 順位チェックを実行して競合URLを取得
        print(f"[BOT] Checking rankings for keyword: {keyword}")
        await ctx.send("⏳ DataForSEO APIで検索結果を取得中... (1-2分かかります)")
        
        dropped, out_of_ranking, _ = await asyncio.to_thread(
            checker.check_rankings,
            keywords=[keyword],
            language_code=bot.config['language_code'],
            location_code=bot.config['location_code'],
            device=bot.config['device'],
            depth=10,  # 上位10件を取得
            batch_size=1,
            poll_interval=20,
            poll_timeout=300,
            enable_ai_analysis=False  # AI分析は不要
        )
        
        # 競合URLを取得
        print(f"[BOT] Getting competitor URLs from storage")
        competitor_urls = []
        
        # ストレージから最新の競合情報を取得
        conn = bot.storage.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT url, rank FROM competitors 
            WHERE keyword = ? 
            ORDER BY checked_at DESC, rank ASC 
            LIMIT 3
        ''', (keyword,))
        
        for row in cursor.fetchall():
            competitor_urls.append({
                'url': row[0],
                'rank': row[1]
            })
        
        conn.close()
        
        if not competitor_urls:
            await ctx.send(f"❌ キーワード「{keyword}」の競合情報が見つかりませんでした")
            return
        
        await ctx.send(f"✅ {len(competitor_urls)}件の競合URLを取得しました")
        
        # 競合分析を実行
        print(f"[BOT] Analyzing competitors...")
        await ctx.send("📝 競合サイトの内容を分析中... (数分かかる場合があります)")
        
        analyzer = CompetitorAnalyzer()
        
        # 自社サイトを分析
        await ctx.send("🏠 自社サイトを分析中...")
        own_data = await asyncio.to_thread(analyzer.analyze_page, own_url)
        
        # 競合サイトを分析
        competitors_data = []
        for i, comp in enumerate(competitor_urls, 1):
            await ctx.send(f"🔍 競合サイト {i}/{len(competitor_urls)} を分析中...")
            comp_data = await asyncio.to_thread(analyzer.analyze_page, comp['url'])
            comp_data['rank'] = comp['rank']
            comp_data['url'] = comp['url']
            competitors_data.append(comp_data)
        
        # レポート生成
        await ctx.send("📊 比較レポートを生成中...")
        print(f"[BOT] Generating comparison report...")
        
        report_generator = ComparisonReportGenerator()
        report_html = report_generator.generate_report(
            keyword=keyword,
            own_url=own_url,
            own_data=own_data,
            competitors_data=competitors_data
        )
        
        # HTMLファイルとして保存
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as f:
            f.write(report_html)
            temp_path = f.name
        
        print(f"[BOT] Report saved to: {temp_path}")
        
        # Discordに結果を送信
        result_embed = discord.Embed(
            title=f"📊 競合分析結果: {keyword}",
            description=f"**自社URL**: {own_url}",
            color=discord.Color.green()
        )
        
        # 自社データ
        result_embed.add_field(
            name="🏠 自社サイト",
            value=f"見出し: {own_data['heading_count']}個\n文字数: {own_data['word_count']}文字\n画像: {own_data['image_count']}枚\n内部リンク: {own_data['internal_links']}個",
            inline=False
        )
        
        # 競合平均データ
        avg_headings = sum(c['heading_count'] for c in competitors_data) / len(competitors_data)
        avg_words = sum(c['word_count'] for c in competitors_data) / len(competitors_data)
        avg_images = sum(c['image_count'] for c in competitors_data) / len(competitors_data)
        avg_internal = sum(c['internal_links'] for c in competitors_data) / len(competitors_data)
        
        result_embed.add_field(
            name="🎯 競合平均（上位3位）",
            value=f"見出し: {avg_headings:.1f}個\n文字数: {avg_words:.0f}文字\n画像: {avg_images:.1f}枚\n内部リンク: {avg_internal:.1f}個",
            inline=False
        )
        
        # 改善提案
        suggestions = []
        if own_data['heading_count'] < avg_headings:
            suggestions.append(f"📝 見出しを{avg_headings - own_data['heading_count']:.0f}個追加")
        if own_data['word_count'] < avg_words:
            suggestions.append(f"✍️ 約{avg_words - own_data['word_count']:.0f}文字追加")
        if own_data['image_count'] < avg_images:
            suggestions.append(f"🖼️ 画像を{avg_images - own_data['image_count']:.0f}枚追加")
        if own_data['internal_links'] < avg_internal:
            suggestions.append(f"🔗 内部リンクを{avg_internal - own_data['internal_links']:.0f}個追加")
        
        if suggestions:
            result_embed.add_field(
                name="💡 改善提案",
                value="\n".join(suggestions),
                inline=False
            )
        else:
            result_embed.add_field(
                name="💡 改善提案",
                value="✅ 競合と同等以上のコンテンツです！",
                inline=False
            )
        
        await ctx.send(embed=result_embed)
        
        # HTMLレポートを送信
        await ctx.send("📄 詳細レポート（HTML）を送信します...")
        await ctx.send(file=discord.File(temp_path, filename=f"競合分析_{keyword.replace(' ', '_')}.html"))
        
        # 一時ファイルを削除
        import os
        os.unlink(temp_path)
        
        print(f"[BOT] Analysis complete!")
        await ctx.send("✅ **競合分析が完了しました！**")
        
    except Exception as e:
        error_msg = f"❌ エラーが発生しました: {str(e)}"
        await ctx.send(error_msg)
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()



def main():
    """メイン処理"""
    token = os.getenv('DISCORD_BOT_TOKEN')
    
    if not token:
        print("[ERROR] DISCORD_BOT_TOKEN が設定されていません")
        print("[ERROR] .env ファイルに DISCORD_BOT_TOKEN を追加してください")
        return
    
    print("="*60)
    print("🤖 SEO順位チェッカー Discord Bot 起動中...")
    print("="*60)
    
    bot.run(token)


if __name__ == '__main__':
    main()
