"""
順位チェッカーのメインエントリーポイント
"""
import argparse
import os
import sys
from pathlib import Path
from datetime import datetime

import yaml
from dotenv import load_dotenv

from dataforseo_client import DataForSEOClient
from storage import RankingStorage
from notifier import DiscordNotifier
from rank_checker import RankChecker

# AI分析機能（オプション）
try:
    from ai_analyzer import GeminiAnalyzer
except ImportError:
    GeminiAnalyzer = None

# 競合分析機能（オプション）
try:
    from competitor_analyzer import CompetitorAnalyzer
except ImportError:
    CompetitorAnalyzer = None


def load_config(config_path: str) -> dict:
    """
    設定ファイルを読み込む
    
    Args:
        config_path: 設定ファイルのパス
        
    Returns:
        設定辞書
    """
    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    return config


def load_keywords(keywords_path: str) -> list[str]:
    """
    キーワードファイルを読み込む
    
    Args:
        keywords_path: キーワードファイルのパス
        
    Returns:
        キーワードのリスト
    """
    with open(keywords_path, 'r', encoding='utf-8') as f:
        keywords = [line.strip() for line in f if line.strip()]
    return keywords


def main():
    """メイン処理"""
    parser = argparse.ArgumentParser(
        description='順位チェッカー v1 - Google Organic順位をDataForSEOで取得し、下落をDiscordに通知'
    )
    parser.add_argument(
        '--keywords',
        type=str,
        required=False,
        help='キーワードファイルのパス（1行1キーワード）。指定しない場合はデータベースから自動取得'
    )
    parser.add_argument(
        '--genre',
        type=str,
        default=None,
        help='特定のジャンルのキーワードのみをチェック'
    )
    parser.add_argument(
        '--config',
        type=str,
        default='config/settings.yaml',
        help='設定ファイルのパス（デフォルト: config/settings.yaml）'
    )
    parser.add_argument(
        '--env',
        type=str,
        default='.env',
        help='.envファイルのパス（デフォルト: .env）'
    )
    
    args = parser.parse_args()
    
    # スクリプトのディレクトリを基準にパスを解決
    script_dir = Path(__file__).parent
    
    # .envファイルを読み込む
    env_path = script_dir / args.env
    if env_path.exists():
        load_dotenv(env_path)
        print(f"[INFO] Loaded environment variables from {env_path}")
    else:
        print(f"[WARN] .env file not found at {env_path}")
    
    # 環境変数の取得
    dataforseo_login = os.getenv('DATAFORSEO_LOGIN')
    dataforseo_password = os.getenv('DATAFORSEO_PASSWORD')
    discord_webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
    gemini_api_key = os.getenv('GEMINI_API_KEY')  # オプション
    
    if not dataforseo_login or not dataforseo_password:
        print("[ERROR] DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD must be set in environment variables")
        sys.exit(1)
    
    if not discord_webhook_url:
        print("[ERROR] DISCORD_WEBHOOK_URL must be set in environment variables")
        sys.exit(1)
    
    # 設定ファイルの読み込み
    config_path = script_dir / args.config
    if not config_path.exists():
        print(f"[ERROR] Config file not found: {config_path}")
        sys.exit(1)
    
    config = load_config(str(config_path))
    print(f"[INFO] Loaded config from {config_path}")
    
    # データベース初期化（キーワード取得前に必要）
    db_path = script_dir / config.get('db_path', 'rankings.db')
    storage = RankingStorage(str(db_path))
    
    # キーワードの取得
    keywords = []
    
    if args.keywords:
        # キーワードファイルから読み込み
        keywords_path = Path(args.keywords)
        if not keywords_path.exists():
            print(f"[ERROR] Keywords file not found: {keywords_path}")
            sys.exit(1)
        
        keywords = load_keywords(str(keywords_path))
        print(f"[INFO] Loaded {len(keywords)} keywords from {keywords_path}")
    else:
        # データベースから取得
        print(f"[INFO] データベースからキーワードを取得中...")
        
        if args.genre:
            # ジャンル指定がある場合
            print(f"[INFO] ジャンル: {args.genre}")
            keywords_data = storage.get_keywords_by_genre(args.genre)
        else:
            # 全てのキーワードを取得
            keywords_data = storage.get_all_keywords()
        
        keywords = [kw['keyword'] for kw in keywords_data]
        
        if not keywords:
            print("[ERROR] データベースにキーワードが登録されていません")
            print("[INFO] 次のコマンドでCSVファイルからインポートしてください:")
            print("[INFO]   python3 import_csv.py <csv_file_path>")
            sys.exit(1)
        
        print(f"[INFO] データベースから {len(keywords)} 件のキーワードを取得しました")
        
        # ジャンル別の集計を表示
        if not args.genre:
            genres = {}
            for kw_data in keywords_data:
                genre = kw_data.get('genre') or '（未分類）'
                genres[genre] = genres.get(genre, 0) + 1
            
            print(f"[INFO] ジャンル別集計:")
            for genre, count in sorted(genres.items(), key=lambda x: x[1], reverse=True)[:5]:
                print(f"[INFO]   - {genre}: {count} 件")
    
    if not keywords:
        print("[ERROR] No keywords found")
        sys.exit(1)
    
    # クライアントと通知の初期化
    client = DataForSEOClient(
        login=dataforseo_login,
        password=dataforseo_password
    )
    
    notifier = DiscordNotifier(discord_webhook_url)
    
    # AI分析機能の初期化（オプション）
    ai_analyzer = None
    enable_ai_analysis = config.get('enable_ai_analysis', True)
    
    if enable_ai_analysis and gemini_api_key and GeminiAnalyzer:
        try:
            model_name = config.get('gemini_model', 'gemini-1.5-flash')
            ai_analyzer = GeminiAnalyzer(
                api_key=gemini_api_key,
                model_name=model_name
            )
            print(f"[INFO] AI分析機能が有効化されました（モデル: {model_name}）")
        except Exception as e:
            print(f"[WARN] AI分析機能の初期化に失敗しました: {e}")
            print("[WARN] AI分析なしで続行します")
    elif enable_ai_analysis and not gemini_api_key:
        print("[WARN] GEMINI_API_KEYが設定されていないため、AI分析は無効です")
    elif enable_ai_analysis and not GeminiAnalyzer:
        print("[WARN] google-generativeai がインストールされていないため、AI分析は無効です")
        print("[WARN] pip install google-generativeai でインストールしてください")
    
    # 競合分析機能の初期化（オプション）
    competitor_analyzer = None
    enable_competitor_analysis = config.get('enable_competitor_analysis', False)
    
    if enable_competitor_analysis and CompetitorAnalyzer:
        try:
            use_selenium = config.get('use_selenium', True)
            competitor_analyzer = CompetitorAnalyzer(use_selenium=use_selenium)
            print(f"[INFO] 競合分析機能が有効化されました（Selenium: {use_selenium}）")
        except Exception as e:
            print(f"[WARN] 競合分析機能の初期化に失敗しました: {e}")
            print("[WARN] 競合分析なしで続行します")
    elif enable_competitor_analysis and not CompetitorAnalyzer:
        print("[WARN] competitor_analyzer モジュールがインストールされていないため、競合分析は無効です")
        print("[WARN] pip install selenium beautifulsoup4 でインストールしてください")
    
    # 順位チェッカーの初期化
    checker = RankChecker(
        client=client,
        storage=storage,
        target_domain=config['target_domain'],
        max_competitors_above=config.get('max_competitors_above', 3),
        ai_analyzer=ai_analyzer,
        competitor_analyzer=competitor_analyzer
    )
    
    # 順位チェック実行
    print("\n" + "="*60)
    print("Starting rank check...")
    print("="*60 + "\n")
    
    try:
        dropped, out_of_ranking, ai_analysis = checker.check_rankings(
            keywords=keywords,
            language_code=config['language_code'],
            location_code=config['location_code'],
            device=config['device'],
            depth=config['depth'],
            batch_size=config.get('batch_size', 100),
            poll_interval=config.get('poll_interval_sec', 20),
            poll_timeout=config.get('poll_timeout_sec', 900),
            enable_ai_analysis=enable_ai_analysis,
            enable_competitor_analysis=enable_competitor_analysis,
            max_competitor_analysis_keywords=config.get('max_competitor_analysis_keywords', 5)
        )
        
        # Discord通知
        print("\n" + "="*60)
        print("Sending Discord notification...")
        print("="*60 + "\n")
        
        checked_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        notifier.send_rank_drop_report(
            dropped_keywords=dropped,
            out_of_ranking_keywords=out_of_ranking,
            checked_at=checked_at,
            ai_analysis=ai_analysis
        )
        
        print("\n" + "="*60)
        print("Rank check completed successfully!")
        print(f"Dropped: {len(dropped)}, Out of ranking: {len(out_of_ranking)}")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n[ERROR] Rank check failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
