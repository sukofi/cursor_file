"""
環境変数とAPIキーの確認スクリプト
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

# .envファイルを読み込み
load_dotenv()

print("=" * 60)
print("🔍 環境変数の確認")
print("=" * 60)

# APIキーの確認
gemini_key = os.getenv('GEMINI_API_KEY')

if gemini_key:
    masked_key = f"{gemini_key[:8]}...{gemini_key[-4:]}" if len(gemini_key) > 12 else "***"
    print(f"✅ GEMINI_API_KEY: {masked_key}")
    print(f"   長さ: {len(gemini_key)} 文字")
else:
    print("❌ GEMINI_API_KEY が見つかりません")

# .envファイルの存在確認
if os.path.exists('.env'):
    print("✅ .env ファイルが存在します")
    with open('.env', 'r') as f:
        lines = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        print(f"   設定項目数: {len(lines)} 件")
else:
    print("❌ .env ファイルが見つかりません")

print("\n" + "=" * 60)
print("🧪 Gemini API接続テスト")
print("=" * 60)

if gemini_key:
    try:
        genai.configure(api_key=gemini_key)
        
        # モデル名のテスト
        test_models = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash']
        
        for model_name in test_models:
            try:
                print(f"\n📝 {model_name} をテスト中...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content("こんにちは")
                print(f"✅ {model_name} が動作しました！")
                print(f"   応答: {response.text[:50]}...")
                break  # 成功したらループを抜ける
            except Exception as e:
                error_msg = str(e)
                if "API_KEY_INVALID" in error_msg:
                    print(f"❌ {model_name}: APIキーが無効です")
                    print(f"   エラー: {error_msg[:100]}")
                elif "not found" in error_msg or "not supported" in error_msg:
                    print(f"⚠️  {model_name}: このモデルは利用できません")
                else:
                    print(f"❌ {model_name}: {error_msg[:100]}")
        
    except Exception as e:
        print(f"❌ Gemini API接続エラー: {e}")
else:
    print("⚠️  APIキーが設定されていないため、テストをスキップします")

print("\n" + "=" * 60)
