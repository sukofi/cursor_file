#!/bin/bash

# 監視間隔（秒）
INTERVAL=30

echo "=== 自動同期（Pull & Push）を開始します ==="
echo "監視間隔: ${INTERVAL}秒"
echo "停止するには Ctrl+C を押してください"

while true; do
    # 1. まずGitHubから最新を取得 (Pull)
    # コンフリクトを避けるため、作業ディレクトリがクリーンな場合のみプルを試みるのが安全だが、
    # ここでは簡易的に毎回プルを試み、失敗したらログを出す設定にする。
    # --rebase オプションをつけることで、ローカルのコミットがある場合でも履歴をきれいに保つ
    
    echo "--- 同期チェック: $(date "+%H:%M:%S") ---"
    
    # リモートの更新を確認してプル
    git pull --rebase origin main > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        : # プル成功（または更新なし）- ログ過多を防ぐため成功時は静かにする
    else
        echo "⚠️  プルに失敗しました。競合が発生しているか、ネットワークエラーの可能性があります。"
    fi

    # 2. ローカルの変更があるか確認してPush
    if [[ -n $(git status -s) ]]; then
        echo "📝 変更を検知しました。プッシュ処理を開始します..."
        
        # 現在時刻を取得
        TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
        
        # すべての変更をステージング
        git add .
        
        # コミット
        if git commit -m "Auto update: $TIMESTAMP"; then
            # プッシュ
            echo "GitHubへプッシュ中..."
            if git push origin main; then
                echo "✅ [$TIMESTAMP] プッシュ成功！"
            else
                echo "❌ [$TIMESTAMP] プッシュに失敗しました。"
            fi
        else
            echo "コミットに失敗しました（変更がない可能性があります）"
        fi
    fi
    
    # 次のチェックまで待機
    sleep $INTERVAL
done
