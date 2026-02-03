"""
利用可能なGeminiモデルをリストアップ
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

gemini_key = os.getenv('GEMINI_API_KEY')

if not gemini_key:
    print("❌ GEMINI_API_KEY が設定されていません")
    exit(1)

genai.configure(api_key=gemini_key)

print("=" * 60)
print("📋 利用可能な Gemini モデル")
print("=" * 60)

try:
    models = genai.list_models()
    
    generate_models = []
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            generate_models.append(model)
            print(f"\n✅ {model.name}")
            print(f"   表示名: {model.display_name}")
            print(f"   説明: {model.description[:80]}..." if len(model.description) > 80 else f"   説明: {model.description}")
    
    if not generate_models:
        print("\n⚠️  generateContent をサポートするモデルが見つかりませんでした")
    else:
        print(f"\n合計: {len(generate_models)} 個のモデルが利用可能")
        
        # 推奨モデルを表示
        print("\n" + "=" * 60)
        print("💡 推奨設定")
        print("=" * 60)
        
        if generate_models:
            recommended = generate_models[0].name
            # models/ プレフィックスを削除
            if recommended.startswith('models/'):
                recommended = recommended[7:]
            
            print(f"\nconfig/settings.yaml に以下を設定してください:")
            print(f"  gemini_model: \"{recommended}\"")
            
            print(f"\nまたは ai_analyzer.py のデフォルト値を変更:")
            print(f"  def __init__(self, api_key: str, model_name: str = \"{recommended}\"):")

except Exception as e:
    print(f"\n❌ エラー: {e}")
    print("\nAPI キーが正しいか確認してください。")
    print("また、Gemini API が有効化されているか確認してください:")
    print("https://makersuite.google.com/app/apikey")

print("\n" + "=" * 60)
