#!/usr/bin/env python3
"""
順位チェッカー v1 - Quick Start Script

このスクリプトは初回セットアップと動作確認用です。
実際の運用では main.py を直接実行してください。
"""

import os
import sys
from pathlib import Path


def check_setup():
    """セットアップ状況をチェック"""
    print("="*60)
    print("順位チェッカー v1 - セットアップチェック")
    print("="*60)
    
    script_dir = Path(__file__).parent
    issues = []
    
    # .envファイルの確認
    env_path = script_dir / ".env"
    if not env_path.exists():
        issues.append("❌ .envファイルが見つかりません")
        print("\n⚠️  .env.exampleをコピーして.envを作成してください:")
        print(f"   cp .env.example .env")
    else:
        print("✅ .envファイルが存在します")
        
        # 環境変数の確認
        from dotenv import load_dotenv
        load_dotenv(env_path)
        
        if not os.getenv('DATAFORSEO_LOGIN'):
            issues.append("❌ DATAFORSEO_LOGINが設定されていません")
        else:
            print("✅ DATAFORSEO_LOGINが設定されています")
        
        if not os.getenv('DATAFORSEO_PASSWORD'):
            issues.append("❌ DATAFORSEO_PASSWORDが設定されていません")
        else:
            print("✅ DATAFORSEO_PASSWORDが設定されています")
        
        if not os.getenv('DISCORD_WEBHOOK_URL'):
            issues.append("❌ DISCORD_WEBHOOK_URLが設定されていません")
        else:
            print("✅ DISCORD_WEBHOOK_URLが設定されています")
    
    # 設定ファイルの確認
    config_path = script_dir / "config" / "settings.yaml"
    if not config_path.exists():
        issues.append("❌ config/settings.yamlが見つかりません")
    else:
        print("✅ config/settings.yamlが存在します")
        
        import yaml
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
        
        if config.get('target_domain') == 'example.com':
            issues.append("⚠️  target_domainがデフォルト値(example.com)のままです")
            print("⚠️  config/settings.yamlのtarget_domainを自社ドメインに変更してください")
        else:
            print(f"✅ target_domainが設定されています: {config.get('target_domain')}")
    
    # キーワードファイルの確認
    keywords_example = script_dir / "keywords.example.txt"
    if keywords_example.exists():
        print("✅ keywords.example.txtが存在します")
    
    print("\n" + "="*60)
    
    if issues:
        print("セットアップが完了していません:")
        for issue in issues:
            print(f"  {issue}")
        print("\nREADME.mdを参照してセットアップを完了してください。")
        return False
    else:
        print("✅ セットアップが完了しています！")
        print("\n次のコマンドで実行できます:")
        print(f"  python main.py --keywords keywords.example.txt")
        return True


if __name__ == '__main__':
    try:
        setup_ok = check_setup()
        sys.exit(0 if setup_ok else 1)
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
