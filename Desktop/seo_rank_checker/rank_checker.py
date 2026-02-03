"""
順位チェックのメインロジック
DataForSEOから取得した結果を解析し、自社順位を抽出、前回と比較して下落判定を行う
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime

from dataforseo_client import DataForSEOClient
from domain_match import is_own_domain
from storage import RankingStorage

try:
    from ai_analyzer import GeminiAnalyzer
except ImportError:
    GeminiAnalyzer = None

try:
    from competitor_analyzer import CompetitorAnalyzer
except ImportError:
    CompetitorAnalyzer = None


class RankChecker:
    """順位チェックのオーケストレーター"""
    
    def __init__(
        self,
        client: DataForSEOClient,
        storage: RankingStorage,
        target_domain: str,
        max_competitors_above: int = 3,
        ai_analyzer: Optional[Any] = None,
        competitor_analyzer: Optional[Any] = None
    ):
        """
        Args:
            client: DataForSEOクライアント
            storage: 順位履歴ストレージ
            target_domain: 自社ドメイン
            max_competitors_above: 自社より上位の競合URL数
            ai_analyzer: AI分析クライアント（オプション）
            competitor_analyzer: 競合分析クライアント（オプション）
        """
        self.client = client
        self.storage = storage
        self.target_domain = target_domain
        self.max_competitors_above = max_competitors_above
        self.ai_analyzer = ai_analyzer
        self.competitor_analyzer = competitor_analyzer
    
    def check_rankings(
        self,
        keywords: List[str],
        language_code: str,
        location_code: int,
        device: str,
        depth: int,
        batch_size: int,
        poll_interval: int,
        poll_timeout: int,
        enable_ai_analysis: bool = True,
        enable_competitor_analysis: bool = False,
        max_competitor_analysis_keywords: int = 5
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Optional[Dict[str, Any]]]:
        """
        キーワードリストの順位をチェックし、下落したものを抽出
        
        Args:
            keywords: キーワードリスト
            language_code: 言語コード
            location_code: ロケーションコード
            device: デバイス
            depth: 取得深度
            batch_size: バッチサイズ
            poll_interval: ポーリング間隔
            poll_timeout: ポーリングタイムアウト
            enable_ai_analysis: AI分析を有効化するか
            enable_competitor_analysis: 競合分析を有効化するか
            max_competitor_analysis_keywords: 競合分析を実行する最大キーワード数
            
        Returns:
            (下落キーワードリスト, 圏外落ちキーワードリスト, AI分析結果)
        """
        print(f"[INFO] Starting rank check for {len(keywords)} keywords")
        
        # キーワードをバッチに分割
        batches = self._split_into_batches(keywords, batch_size)
        print(f"[INFO] Split into {len(batches)} batches")
        
        all_task_ids = []
        
        # 各バッチをPOST
        for i, batch in enumerate(batches, 1):
            print(f"[INFO] Posting batch {i}/{len(batches)} ({len(batch)} keywords)...")
            task_ids = self.client.task_post(
                keywords=batch,
                language_code=language_code,
                location_code=location_code,
                device=device,
                depth=depth
            )
            all_task_ids.extend(task_ids)
            print(f"[INFO] Batch {i} posted: {len(task_ids)} tasks")
        
        print(f"[INFO] Total {len(all_task_ids)} tasks posted")
        
        # タスクの完了を待つ
        completed_task_ids = self.client.wait_for_tasks(
            task_ids=all_task_ids,
            poll_interval=poll_interval,
            timeout=poll_timeout
        )
        
        print(f"[INFO] {len(completed_task_ids)} tasks completed")
        
        # 結果を取得して解析
        results = []
        for task_id in completed_task_ids:
            result = self.client.task_get(task_id)
            if result:
                results.append(result)
        
        print(f"[INFO] Retrieved {len(results)} results")
        
        # 順位データを解析
        rank_data_list = self._parse_results(results)
        
        # 前回と比較して下落判定
        dropped, out_of_ranking = self._detect_rank_drops(rank_data_list)
        
        # 今回の結果を保存
        checked_at = datetime.now().isoformat()
        for rank_data in rank_data_list:
            self.storage.save_rank(
                keyword=rank_data['keyword'],
                rank=rank_data['own_rank'],
                url=rank_data['own_url'],
                checked_at=checked_at
            )
            
            # 競合情報も保存（全ての競合を保存）
            if rank_data.get('all_competitors'):
                self.storage.save_competitors(
                    keyword=rank_data['keyword'],
                    competitors=rank_data['all_competitors'],
                    checked_at=checked_at
                )
        
        print(f"[INFO] Rank check complete. Dropped: {len(dropped)}, Out of ranking: {len(out_of_ranking)}")
        
        # 競合分析を実行（下落キーワードのみ）
        if enable_competitor_analysis and self.competitor_analyzer and dropped:
            print(f"[INFO] 下落キーワードの競合分析を実行中（最大{max_competitor_analysis_keywords}件）...")
            dropped = self._analyze_competitors_for_dropped_keywords(
                dropped_keywords=dropped,
                max_keywords=max_competitor_analysis_keywords
            )
        
        # AI分析を実行
        ai_analysis = None
        if enable_ai_analysis and self.ai_analyzer and (dropped or out_of_ranking):
            print("[INFO] AI分析を実行中...")
            try:
                ai_analysis = self.ai_analyzer.analyze_rank_drops(
                    dropped_keywords=dropped,
                    out_of_ranking_keywords=out_of_ranking,
                    historical_data=None  # 将来的に履歴データを渡すことも可能
                )
            except Exception as e:
                print(f"[WARN] AI分析に失敗しましたが、処理を続行します: {e}")
        
        return dropped, out_of_ranking, ai_analysis
    
    def _split_into_batches(self, keywords: List[str], batch_size: int) -> List[List[str]]:
        """キーワードリストをバッチに分割"""
        batches = []
        for i in range(0, len(keywords), batch_size):
            batches.append(keywords[i:i + batch_size])
        return batches
    
    def _parse_results(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        DataForSEOの結果を解析して自社順位と競合を抽出
        
        Returns:
            順位データのリスト
            [
                {
                    'keyword': str,
                    'own_rank': int or None,
                    'own_url': str or None,
                    'competitors_above': [{'rank': int, 'url': str}, ...]
                },
                ...
            ]
        """
        rank_data_list = []
        
        for result in results:
            try:
                tasks = result.get('tasks', [])
                for task in tasks:
                    task_result = task.get('result', [])
                    if not task_result:
                        continue
                    
                    for item in task_result:
                        keyword = item.get('keyword')
                        if not keyword:
                            continue
                        
                        rank_data = self._extract_own_rank_and_competitors(item)
                        rank_data['keyword'] = keyword
                        rank_data_list.append(rank_data)
                        
            except Exception as e:
                print(f"[ERROR] Failed to parse result: {e}")
                continue
        
        return rank_data_list
    
    def _extract_own_rank_and_competitors(
        self,
        serp_item: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        SERP結果から自社順位と競合を抽出
        
        Returns:
            {
                'own_rank': int or None,
                'own_url': str or None,
                'competitors_above': [{'rank': int, 'url': str}, ...],  # 上位競合（max_competitors_above件）
                'all_competitors': [{'rank': int, 'url': str}, ...]  # 全ての競合（保存用）
            }
        """
        items = serp_item.get('items', [])
        
        own_rank = None
        own_url = None
        all_competitors = []
        
        for item in items:
            # rank_absolute または rank_group を使用
            rank = item.get('rank_absolute') or item.get('rank_group')
            if not rank:
                continue
            
            # URLを取得（type='organic'の場合）
            item_type = item.get('type')
            if item_type != 'organic':
                continue
            
            url = item.get('url')
            if not url:
                continue
            
            # 自社ドメインかチェック
            if is_own_domain(url, self.target_domain):
                if own_rank is None or rank < own_rank:
                    own_rank = rank
                    own_url = url
            else:
                # 競合URL（全て保存）
                all_competitors.append({
                    'rank': rank,
                    'url': url
                })
        
        # 全ての競合を順位順にソート
        all_competitors.sort(key=lambda x: x['rank'])
        
        # 自社より上位の競合のみフィルタリング（表示用）
        competitors_above = []
        if own_rank is not None:
            competitors_above = [
                c for c in all_competitors
                if c['rank'] < own_rank
            ]
            # 最大数に制限（表示用）
            competitors_above = competitors_above[:self.max_competitors_above]
        
        return {
            'own_rank': own_rank,
            'own_url': own_url,
            'competitors_above': competitors_above,
            'all_competitors': all_competitors  # 全ての競合（保存用）
        }
    
    def _detect_rank_drops(
        self,
        rank_data_list: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        前回順位と比較して下落を検出
        
        Returns:
            (下落キーワードリスト, 圏外落ちキーワードリスト)
        """
        dropped = []
        out_of_ranking = []
        
        for rank_data in rank_data_list:
            keyword = rank_data['keyword']
            current_rank = rank_data['own_rank']
            
            # 前回順位を取得
            previous = self.storage.get_previous_rank(keyword)
            
            if not previous:
                # 初回チェックの場合はスキップ
                continue
            
            previous_rank = previous['last_rank']
            
            # 下落判定
            if previous_rank is not None and 1 <= previous_rank <= 10:
                if current_rank is None:
                    # 圏外落ち
                    out_of_ranking.append({
                        'keyword': keyword,
                        'previous_rank': previous_rank,
                        'last_url': previous['last_url']
                    })
                elif 1 <= current_rank <= 10 and current_rank > previous_rank:
                    # 順位下落
                    dropped.append({
                        'keyword': keyword,
                        'previous_rank': previous_rank,
                        'current_rank': current_rank,
                        'own_url': rank_data['own_url'],
                        'competitors_above': rank_data['competitors_above']
                    })
        
        return dropped, out_of_ranking
    
    def _analyze_competitors_for_dropped_keywords(
        self,
        dropped_keywords: List[Dict[str, Any]],
        max_keywords: int = 5
    ) -> List[Dict[str, Any]]:
        """
        下落キーワードの競合分析を実行
        
        Args:
            dropped_keywords: 下落キーワードのリスト
            max_keywords: 分析する最大キーワード数
            
        Returns:
            競合分析結果を追加した下落キーワードリスト
        """
        import time
        
        # 下落幅が大きい順にソート
        sorted_keywords = sorted(
            dropped_keywords,
            key=lambda x: x['current_rank'] - x['previous_rank'],
            reverse=True
        )
        
        # 上位N件のみ分析
        keywords_to_analyze = sorted_keywords[:max_keywords]
        
        for i, kw_data in enumerate(keywords_to_analyze, 1):
            keyword = kw_data['keyword']
            own_url = kw_data.get('own_url')
            
            if not own_url:
                print(f"[WARN] {keyword}: 自社URLが見つからないためスキップ")
                continue
            
            print(f"[INFO] ({i}/{len(keywords_to_analyze)}) 競合分析中: {keyword}")
            
            try:
                # 競合URLを取得（上位3件）
                competitor_urls = [
                    comp['url'] for comp in kw_data.get('competitors_above', [])[:3]
                ]
                
                if not competitor_urls:
                    print(f"[WARN] {keyword}: 競合URLが見つかりません")
                    continue
                
                # 競合分析を実行
                comparison_data = self.competitor_analyzer.compare_articles(
                    own_url=own_url,
                    competitor_urls=competitor_urls
                )
                
                # 分析結果を追加
                kw_data['competitor_analysis'] = comparison_data
                
                # データベースに保存
                if comparison_data and comparison_data.get('summary'):
                    try:
                        self.storage.save_competitor_analysis(
                            keyword=keyword,
                            own_url=own_url,
                            own_data=comparison_data.get('own', {}),
                            competitor_avg=comparison_data.get('summary', {}).get('competitor_avg', {}),
                            differences=comparison_data.get('summary', {}),
                            rank_at_analysis=kw_data.get('current_rank', 0),
                            previous_rank=kw_data.get('previous_rank', 0)
                        )
                    except Exception as e:
                        print(f"[WARN] 競合分析結果の保存に失敗: {keyword} - {e}")
                
                # レート制限対策
                if i < len(keywords_to_analyze):
                    time.sleep(2)
                    
            except Exception as e:
                print(f"[ERROR] {keyword}の競合分析に失敗: {e}")
                continue
        
        return dropped_keywords