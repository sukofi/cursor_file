"""
Gemini AIを使用した順位変動分析モジュール
"""
import os
from typing import List, Dict, Any, Optional
import json
import warnings

# 非推奨警告を抑制
warnings.filterwarnings('ignore', category=FutureWarning)

try:
    import google.generativeai as genai
except ImportError:
    genai = None

# スプレッドシート機能は削除されました
SpreadsheetReader = None


class GeminiAnalyzer:
    """Gemini AIを使用した順位変動分析"""
    
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        """
        Args:
            api_key: Gemini API Key
            model_name: 使用するモデル名
        """
        if genai is None:
            raise ImportError(
                "google-generativeai がインストールされていません。\n"
                "以下のコマンドでインストールしてください:\n"
                "pip install google-generativeai"
            )
        
        self.api_key = api_key
        self.model_name = model_name
        
        # Gemini APIの設定
        genai.configure(api_key=api_key)
        
        # Geminiモデルを初期化（基本モデル、ウェブ検索なし）
        # データベースに保存された情報のみを使用
        self.model = genai.GenerativeModel(model_name)
        print(f"[INFO] Gemini モデル初期化: {model_name}")
        print(f"[INFO] データベースベースの分析モード（ウェブ検索なし）")
        
        # スプレッドシート機能は削除されました
        self.spreadsheet_reader = None
    
    def analyze_rank_drops(
        self,
        dropped_keywords: List[Dict[str, Any]],
        out_of_ranking_keywords: List[Dict[str, Any]],
        historical_data: Optional[Dict[str, List[Dict[str, Any]]]] = None
    ) -> Dict[str, Any]:
        """
        順位下落の総合分析を実行
        
        Args:
            dropped_keywords: 下落したキーワード情報のリスト
            out_of_ranking_keywords: 圏外落ちしたキーワード情報のリスト
            historical_data: 過去の順位履歴データ（オプション）
            
        Returns:
            分析結果の辞書
            {
                'summary': str,  # 全体サマリー
                'trends': str,   # トレンド分析
                'recommendations': str,  # 改善提案
                'priority_keywords': List[str]  # 優先対応すべきキーワード
            }
        """
        if not dropped_keywords and not out_of_ranking_keywords:
            return {
                'summary': '順位下落は検出されませんでした。',
                'trends': 'トレンド分析: 該当データなし',
                'recommendations': '現状維持で問題ありません。',
                'priority_keywords': []
            }
        
        # プロンプトを構築
        prompt = self._build_analysis_prompt(
            dropped_keywords,
            out_of_ranking_keywords,
            historical_data
        )
        
        try:
            # Gemini APIで分析
            print("[INFO] Gemini AI による分析を実行中...")
            response = self.model.generate_content(prompt)
            
            # レスポンスをパース
            analysis_result = self._parse_ai_response(response.text)
            
            print("[INFO] AI分析が完了しました")
            return analysis_result
            
        except Exception as e:
            print(f"[ERROR] AI分析に失敗しました: {e}")
            return {
                'summary': 'AI分析の実行に失敗しました。',
                'trends': 'エラーのため分析できませんでした。',
                'recommendations': '手動で確認してください。',
                'priority_keywords': []
            }
    
    def _build_analysis_prompt(
        self,
        dropped_keywords: List[Dict[str, Any]],
        out_of_ranking_keywords: List[Dict[str, Any]],
        historical_data: Optional[Dict[str, List[Dict[str, Any]]]] = None
    ) -> str:
        """AI分析用のプロンプトを構築"""
        
        prompt_parts = [
            "あなたはSEOの専門家です。以下の順位変動データを分析し、トレンドと改善提案を提供してください。",
            "",
            "## 順位下落データ",
            ""
        ]
        
        # 下落キーワード
        if dropped_keywords:
            prompt_parts.append(f"### 順位下落キーワード（{len(dropped_keywords)}件）")
            for i, kw in enumerate(dropped_keywords[:20], 1):  # 最大20件まで
                keyword = kw['keyword']
                prev = kw['previous_rank']
                curr = kw['current_rank']
                drop = curr - prev
                prompt_parts.append(f"{i}. 「{keyword}」: {prev}位 → {curr}位 (▼{drop})")
                
                # 競合情報
                competitors = kw.get('competitors_above', [])
                if competitors:
                    prompt_parts.append(f"   上位競合: {', '.join([c['url'] for c in competitors[:2]])}")
            
            prompt_parts.append("")
        
        # 圏外落ち
        if out_of_ranking_keywords:
            prompt_parts.append(f"### 圏外落ちキーワード（{len(out_of_ranking_keywords)}件）")
            for i, kw in enumerate(out_of_ranking_keywords[:20], 1):
                keyword = kw['keyword']
                prev = kw['previous_rank']
                prompt_parts.append(f"{i}. 「{keyword}」: {prev}位 → 圏外")
            
            prompt_parts.append("")
        
        # 履歴データがあれば追加
        if historical_data:
            prompt_parts.append("## 過去の順位履歴")
            prompt_parts.append("（省略: 詳細データあり）")
            prompt_parts.append("")
        
        # 分析依頼
        prompt_parts.extend([
            "## 分析依頼",
            "",
            "以下の形式で分析結果を提供してください：",
            "",
            "### 1. 全体サマリー",
            "- 今回の順位変動の全体的な傾向（2-3文で簡潔に）",
            "",
            "### 2. トレンド分析",
            "- キーワードのパターンや共通点",
            "- 業界やジャンルごとの傾向",
            "- 季節性やアルゴリズム変動の可能性",
            "",
            "### 3. 改善提案",
            "- 優先的に対応すべき施策（3-5個）",
            "- 具体的なアクションプラン",
            "",
            "### 4. 優先キーワード",
            "- 最も緊急に対応すべきキーワード（5個まで）",
            "",
            "回答は日本語で、実務的かつ具体的にお願いします。"
        ])
        
        return "\n".join(prompt_parts)
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """AI応答をパースして構造化"""
        
        # セクション分割
        sections = {
            'summary': '',
            'trends': '',
            'recommendations': '',
            'priority_keywords': []
        }
        
        lines = response_text.split('\n')
        current_section = None
        current_content = []
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # セクションの判定
            if '全体サマリー' in line or 'サマリー' in line:
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = 'summary'
                current_content = []
            elif 'トレンド分析' in line or 'トレンド' in line:
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = 'trends'
                current_content = []
            elif '改善提案' in line or '提案' in line:
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = 'recommendations'
                current_content = []
            elif '優先キーワード' in line or '優先' in line:
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = 'priority_keywords'
                current_content = []
            else:
                # 内容を追加
                if current_section and line.strip():
                    current_content.append(line)
        
        # 最後のセクションを追加
        if current_section and current_content:
            if current_section == 'priority_keywords':
                # キーワードリストを抽出
                keywords = []
                for line in current_content:
                    # 「キーワード名」や - キーワード名 の形式を抽出
                    clean_line = line.strip('- •*「」')
                    if clean_line and len(clean_line) < 100:
                        keywords.append(clean_line)
                sections[current_section] = keywords[:5]
            else:
                sections[current_section] = '\n'.join(current_content).strip()
        
        # セクションが空の場合はデフォルト値
        if not sections['summary']:
            sections['summary'] = '分析データを確認してください。'
        if not sections['trends']:
            sections['trends'] = 'トレンド情報が不十分です。'
        if not sections['recommendations']:
            sections['recommendations'] = '継続的なモニタリングを推奨します。'
        
        return sections
    
    def analyze_single_keyword(
        self,
        keyword: str,
        current_rank: Optional[int],
        previous_rank: int,
        competitors_above: List[Dict[str, Any]]
    ) -> str:
        """
        個別キーワードの詳細分析
        
        Args:
            keyword: キーワード
            current_rank: 現在順位
            previous_rank: 前回順位
            competitors_above: 上位競合情報
            
        Returns:
            分析結果テキスト
        """
        prompt = f"""
SEOキーワード「{keyword}」の順位が {previous_rank}位 から {current_rank or '圏外'}位 に変動しました。

上位競合:
{self._format_competitors(competitors_above)}

この順位変動の考えられる原因と、具体的な改善アクションを2-3文で提案してください。
"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"[ERROR] キーワード分析に失敗: {e}")
            return "分析に失敗しました。"
    
    def _format_competitors(self, competitors: List[Dict[str, Any]]) -> str:
        """競合情報をフォーマット"""
        if not competitors:
            return "情報なし"
        
        lines = []
        for comp in competitors:
            rank = comp.get('rank', '?')
            url = comp.get('url', 'N/A')
            lines.append(f"- {rank}位: {url}")
        
        return "\n".join(lines)
    
    def understand_user_intent(
        self,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        ユーザーのメッセージから意図を理解
        
        Args:
            user_message: ユーザーのメッセージ
            conversation_history: 会話履歴（オプション）
            
        Returns:
            {
                'intent': str,  # 'rank_check', 'analyze', 'status', 'question', 'greeting', 'unknown'
                'confidence': float,  # 信頼度 0.0-1.0
                'parameters': dict,  # 抽出されたパラメータ
                'response_suggestion': str  # 応答の提案
            }
        """
        # 会話履歴を含めたプロンプトを構築
        prompt_parts = [
            "あなたはSEO順位チェックボットのアシスタントです。",
            "ユーザーのメッセージから意図を理解し、JSON形式で応答してください。",
            "",
            "利用可能な機能:",
            "1. rank_check: 順位チェックを実行",
            "2. analyze: 競合分析を実行（キーワードとURLが必要）",
            "3. status: 現在の設定を確認",
            "4. question: SEOに関する質問への回答",
            "5. greeting: 挨拶やチャット",
            "",
            "ユーザーメッセージ:",
            f"\"{user_message}\"",
            "",
            "以下のJSON形式で応答してください:",
            "{",
            "  \"intent\": \"<intent_type>\",",
            "  \"confidence\": <0.0-1.0>,",
            "  \"parameters\": {",
            "    \"keyword\": \"<キーワード（あれば）>\",",
            "    \"url\": \"<URL（あれば）>\",",
            "    \"limit\": <件数（あれば）>",
            "  },",
            "  \"response_suggestion\": \"<自然な日本語応答>\"",
            "}",
            "",
            "例:",
            "「順位をチェックして」 → intent: rank_check",
            "「中古車買取というキーワードの競合を調べて」 → intent: analyze, parameters.keyword: 中古車買取",
            "「設定を見せて」 → intent: status",
            "「SEOって何？」 → intent: question"
        ]
        
        # 会話履歴があれば追加
        if conversation_history:
            prompt_parts.insert(7, "\n会話履歴:")
            for msg in conversation_history[-3:]:  # 直近3件のみ
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                prompt_parts.insert(8, f"{role}: {content}")
            prompt_parts.insert(8, "")
        
        prompt = "\n".join(prompt_parts)
        
        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            
            # JSONを抽出（マークダウンコードブロックの場合も対応）
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                response_text = response_text[json_start:json_end].strip()
            
            # JSONをパース
            intent_data = json.loads(response_text)
            
            # デフォルト値を設定
            intent_data.setdefault('intent', 'unknown')
            intent_data.setdefault('confidence', 0.5)
            intent_data.setdefault('parameters', {})
            intent_data.setdefault('response_suggestion', 'どのようなお手伝いができますか？')
            
            return intent_data
            
        except Exception as e:
            print(f"[ERROR] Intent understanding failed: {e}")
            # フォールバック：簡単なキーワードマッチング
            return self._fallback_intent_detection(user_message)
    
    def _fallback_intent_detection(self, user_message: str) -> Dict[str, Any]:
        """フォールバックの意図検出（キーワードベース）"""
        message_lower = user_message.lower()
        
        # 順位チェック
        if any(word in message_lower for word in ['順位', 'チェック', 'ランク', '確認', '調べて']):
            if any(word in message_lower for word in ['競合', '分析', 'analyze']):
                return {
                    'intent': 'analyze',
                    'confidence': 0.7,
                    'parameters': {},
                    'response_suggestion': '競合分析を実行します。キーワードとURLを教えてください。'
                }
            return {
                'intent': 'rank_check',
                'confidence': 0.8,
                'parameters': {},
                'response_suggestion': '順位チェックを開始します！'
            }
        
        # 設定確認
        if any(word in message_lower for word in ['設定', 'ステータス', 'status', '状態']):
            return {
                'intent': 'status',
                'confidence': 0.9,
                'parameters': {},
                'response_suggestion': '現在の設定を表示します。'
            }
        
        # 挨拶
        if any(word in message_lower for word in ['こんにちは', 'hello', 'hi', 'おはよう', 'こんばんは']):
            return {
                'intent': 'greeting',
                'confidence': 0.9,
                'parameters': {},
                'response_suggestion': 'こんにちは！SEO順位チェックのお手伝いをします。'
            }
        
        # ヘルプ
        if any(word in message_lower for word in ['ヘルプ', 'help', '使い方', '機能', 'できる']):
            return {
                'intent': 'help',
                'confidence': 0.9,
                'parameters': {},
                'response_suggestion': '使い方を説明します。'
            }
        
        # 不明
        return {
            'intent': 'unknown',
            'confidence': 0.3,
            'parameters': {},
            'response_suggestion': '申し訳ありませんが、理解できませんでした。「順位チェック」「競合分析」「設定確認」などができます。'
        }
    
    def chat(
        self,
        user_message: str,
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        自然な会話形式でユーザーと対話
        
        Args:
            user_message: ユーザーのメッセージ
            context: コンテキスト情報（ボットの状態など）
            conversation_history: 会話履歴
            
        Returns:
            AIの応答テキスト
        """
        prompt_parts = [
            "あなたはSEO順位チェックボットのAIアシスタントです。",
            "ユーザーと自然な日本語で会話してください。",
            "",
            "ボットの機能:",
            "- データベースに保存された順位情報の分析",
            "- 競合サイトの分析",
            "- 順位変動のトレンド分析",
            "- SEO改善提案（知識ベース）",
            "",
            "【重要な注意事項】",
            "- ウェブ検索は使用しません",
            "- データベースに保存された情報のみを使用します",
            "- ユーザーが「ジャンル」と聞いた場合は、データベースに登録されているキーワードのジャンル分類のことです",
            "- 対象ドメインのビジネスジャンルを推測しないでください",
            "",
        ]
        
        # コンテキスト情報を追加
        if context:
            # デバッグログ
            print(f"[DEBUG AI] Context keys: {context.keys()}")
            if 'genres' in context:
                print(f"[DEBUG AI] Genres in context: {context['genres']}")
            
            prompt_parts.append("【データベース情報】")
            if context.get('target_domain'):
                prompt_parts.append(f"- 対象ドメイン: {context['target_domain']}")
            if context.get('keywords_count'):
                prompt_parts.append(f"- 登録キーワード数: {context['keywords_count']}件")
            
            # ジャンル情報を追加
            if context.get('genres'):
                genres_list = context['genres']
                print(f"[DEBUG AI] Adding {len(genres_list)} genres to prompt")
                prompt_parts.append("")
                prompt_parts.append("=" * 50)
                prompt_parts.append("【重要: データベースに登録されているジャンル情報】")
                prompt_parts.append(f"登録ジャンル数: {len(genres_list)}種類")
                prompt_parts.append("")
                prompt_parts.append("ジャンル一覧:")
                for i, genre in enumerate(genres_list, 1):
                    prompt_parts.append(f"  {i}. {genre}")
                prompt_parts.append("")
                prompt_parts.append("※ユーザーが「ジャンル」について質問した場合は、")
                prompt_parts.append("  上記のジャンル一覧を必ず参照して回答してください")
                prompt_parts.append("=" * 50)
            
            # キーワード情報を追加（ユーザーがキーワードについて質問している場合）
            if context.get('all_keywords'):
                keywords_data = context['all_keywords']
                
                # ジャンル別にキーワードを整理
                genre_keywords = {}
                for kw in keywords_data:
                    genre = kw.get('genre') or '未分類'
                    if genre not in genre_keywords:
                        genre_keywords[genre] = []
                    genre_keywords[genre].append(kw['keyword'])
                
                # 特定のジャンルについて聞かれている場合は、そのジャンルのキーワードを詳細に表示
                user_message_lower = user_message.lower()
                specific_genre_found = False
                for genre in context.get('genres', []):
                    if genre in user_message or genre.lower() in user_message_lower:
                        if genre in genre_keywords:
                            prompt_parts.append("")
                            prompt_parts.append("=" * 50)
                            prompt_parts.append(f"【{genre}ジャンルのキーワード一覧（全{len(genre_keywords[genre])}件）】")
                            prompt_parts.append("※これらのキーワードは確実にデータベースに存在します")
                            prompt_parts.append("")
                            for i, kw in enumerate(genre_keywords[genre], 1):
                                prompt_parts.append(f"{i}. {kw}")
                            prompt_parts.append("=" * 50)
                            prompt_parts.append("")
                            prompt_parts.append(f"【重要】ユーザーが「{genre}」のキーワードについて質問しています。")
                            prompt_parts.append("上記のキーワード一覧を必ず参照して、具体的なキーワード名を回答してください。")
                            specific_genre_found = True
                            break
                
                if not specific_genre_found:
                    # 特定ジャンルが指定されていない場合は、サマリーを表示
                    prompt_parts.append("\n【ジャンル別キーワード数】")
                    for genre in sorted(genre_keywords.keys()):
                        count = len(genre_keywords[genre])
                        prompt_parts.append(f"- {genre}: {count}件")
            
            prompt_parts.append("")
        
        # 会話履歴を追加
        if conversation_history:
            prompt_parts.append("会話履歴:")
            for msg in conversation_history[-5:]:  # 直近5件
                role = "ユーザー" if msg.get('role') == 'user' else "AI"
                prompt_parts.append(f"{role}: {msg.get('content', '')}")
            prompt_parts.append("")
        
        # ジャンル関連の質問の場合は明示的に指示
        if 'ジャンル' in user_message or 'genre' in user_message.lower():
            prompt_parts.append("")
            prompt_parts.append("【この質問への回答方法】")
            prompt_parts.append("ユーザーはデータベースに登録されているジャンルについて質問しています。")
            prompt_parts.append("上記の「データベースに登録されているジャンル情報」セクションを必ず参照して、")
            prompt_parts.append("具体的なジャンル名とその数を回答してください。")
            prompt_parts.append("")
        
        prompt_parts.extend([
            f"ユーザー: {user_message}",
            "",
            "AI: "
        ])
        
        prompt = "\n".join(prompt_parts)
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"[ERROR] Chat failed: {e}")
            return "申し訳ありません。エラーが発生しました。もう一度お試しください。"
    def chat_with_tools(
        self,
        user_message: str,
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """
        データベース情報を基にした会話
        データベースに保存された順位情報のみを使用
        
        Args:
            user_message: ユーザーのメッセージ
            context: コンテキスト情報
            conversation_history: 会話履歴
            
        Returns:
            AIの応答テキスト
        """
        # システムプロンプト
        system_parts = [
            "あなたはSEO順位チェックボットのAIアシスタントです。",
            "ユーザーと自然な日本語で会話し、データベースに保存された情報を基に質問に答えてください。",
            "",
            "【あなたの能力】",
            "✓ データベースに保存された順位情報の分析",
            "✓ SEOに関する専門知識（2026年2月時点の知識）",
            "✓ データの集計・統計計算・トレンド分析",
            "",
            "【あなたができないこと】",
            "✗ リアルタイムのウェブ検索",
            "✗ 外部サイトへのアクセス",
            "✗ データベースに保存されていない情報の取得",
            "",
            "【重要な注意事項】",
            "- ユーザーが「ジャンル」と聞いた場合は、データベースに登録されているキーワードのジャンル分類のことです",
            "- 対象ドメインのビジネスジャンルを推測しないでください",
            "- 提供されたデータベース情報のみを使用してください",
            "",
            "【データソース】",
            "- データベースに保存されたキーワード・ジャンル情報",
            "- 過去の順位履歴データ",
            "- 競合分析結果",
            "",
        ]
        
        # コンテキスト情報を追加
        if context:
            system_parts.append("【データベース情報】")
            if context.get('target_domain'):
                system_parts.append(f"- 対象ドメイン: {context['target_domain']}")
            if context.get('keywords_count'):
                system_parts.append(f"- 登録キーワード数: {context['keywords_count']}件")
            
            # ジャンル情報を追加
            if context.get('genres'):
                genres_list = context['genres']
                system_parts.append("")
                system_parts.append("=" * 50)
                system_parts.append("【重要: データベースに登録されているジャンル情報】")
                system_parts.append(f"登録ジャンル数: {len(genres_list)}種類")
                system_parts.append("")
                system_parts.append("ジャンル一覧:")
                for i, genre in enumerate(genres_list, 1):
                    system_parts.append(f"  {i}. {genre}")
                system_parts.append("")
                system_parts.append("※ユーザーが「ジャンル」について質問した場合は、")
                system_parts.append("  上記のジャンル一覧を必ず参照して回答してください")
                system_parts.append("=" * 50)
            
            # キーワード情報を追加
            if context.get('all_keywords'):
                keywords_data = context['all_keywords']
                
                # ジャンル別にキーワードを整理
                genre_keywords = {}
                for kw in keywords_data:
                    genre = kw.get('genre') or '未分類'
                    if genre not in genre_keywords:
                        genre_keywords[genre] = []
                    genre_keywords[genre].append(kw['keyword'])
                
                # 特定のジャンルについて聞かれている場合は、そのジャンルのキーワードを詳細に表示
                user_message_lower = user_message.lower()
                specific_genre_found = False
                for genre in context.get('genres', []):
                    if genre in user_message or genre.lower() in user_message_lower:
                        if genre in genre_keywords:
                            system_parts.append("")
                            system_parts.append("=" * 50)
                            system_parts.append(f"【{genre}ジャンルのキーワード一覧（全{len(genre_keywords[genre])}件）】")
                            system_parts.append("※これらのキーワードは確実にデータベースに存在します")
                            system_parts.append("")
                            for i, kw in enumerate(genre_keywords[genre], 1):
                                system_parts.append(f"{i}. {kw}")
                            system_parts.append("=" * 50)
                            system_parts.append("")
                            system_parts.append(f"【重要】ユーザーが「{genre}」のキーワードについて質問しています。")
                            system_parts.append("上記のキーワード一覧を必ず参照して、具体的なキーワード名を回答してください。")
                            specific_genre_found = True
                            break
                
                if not specific_genre_found:
                    # 特定ジャンルが指定されていない場合は、サマリーを表示
                    system_parts.append("\n【ジャンル別キーワード数】")
                    for genre in sorted(genre_keywords.keys()):
                        count = len(genre_keywords[genre])
                        system_parts.append(f"- {genre}: {count}件")
            
            system_parts.append("")
        
        # 会話履歴を追加
        if conversation_history:
            system_parts.append("【会話履歴】")
            for msg in conversation_history[-5:]:  # 直近5件
                role = "ユーザー" if msg.get('role') == 'user' else "AI"
                system_parts.append(f"{role}: {msg.get('content', '')}")
            system_parts.append("")
        
        # ジャンル関連の質問の場合は明示的に指示
        if 'ジャンル' in user_message or 'genre' in user_message.lower():
            system_parts.append("")
            system_parts.append("【この質問への回答方法】")
            system_parts.append("ユーザーはデータベースに登録されているジャンルについて質問しています。")
            system_parts.append("上記の「データベースに登録されているジャンル情報」セクションを必ず参照して、")
            system_parts.append("具体的なジャンル名とその数を回答してください。")
            system_parts.append("")
        
        system_parts.extend([
            "【重要な指示】",
            "1. データベースに保存された情報のみを使用してください",
            "   - キーワード、ジャンル、順位履歴、競合情報はすべてデータベースから取得",
            "   - 上記に提供されたジャンル情報は確実にデータベースに存在します",
            "   - ウェブ検索や外部情報の取得は行わない",
            "",
            "2. SEOに関する質問には、あなたの知識ベースで答えてください",
            "   - 順位データの傾向分析",
            "   - SEOベストプラクティス（2026年2月時点の知識）",
            "   - コンテンツ最適化のアドバイス",
            "",
            "3. データベースにない情報を聞かれた場合:",
            "   「申し訳ありませんが、その情報はデータベースにありません。",
            "   データベースに保存されているキーワードの順位情報や、SEOの一般的な知識についてお答えできます。」",
            "   と説明してください",
            "",
            "4. 自然で親しみやすい日本語で会話してください",
            "",
            f"ユーザー: {user_message}",
            "",
            "AI: "
        ])
        
        prompt = "\n".join(system_parts)
        
        try:
            # データベース情報を基に応答生成
            response = self.model.generate_content(prompt)
            
            # 応答テキストを取得
            response_text = response.text.strip()
            
            return response_text
            
        except Exception as e:
            print(f"[ERROR] Chat with tools failed: {e}")
            import traceback
            traceback.print_exc()
            
            # フォールバック: 基本的な応答
            return (
                "申し訳ありません。エラーが発生しました。\n\n"
                "以下のようなことができます：\n"
                "• 「順位をチェックして」→ 順位チェック実行\n"
                "• 「○○について教えて」→ 情報検索\n"
                "• SEOに関する質問にも答えます！"
            )
