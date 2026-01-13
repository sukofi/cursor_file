#!/bin/bash

# 監視間隔（秒）
INTERVAL=30

echo "=== 自動同期（Pull & Push）を開始します ==="
echo "監視間隔: ${INTERVAL}秒"
echo "停止するには Ctrl+C を押してください"

while true; do
    # ==========================================
    # 1. GitHub上の更新を確認して同期 (Pull)
    # ==========================================
    
    # リモートの情報を更新
    git fetch origin > /dev/null 2>&1
    
    # リモート追跡ブランチが存在するか確認
    if git rev-parse @{u} > /dev/null 2>&1; then
        # リモート(origin)がローカル(HEAD)より進んでいるか確認
        BEHIND_COUNT=$(git rev-list HEAD..@{u} --count)
        
        if [ "$BEHIND_COUNT" -gt 0 ]; then
            echo "----------------------------------------"
            echo "GitHub上の更新を検知しました（${BEHIND_COUNT}件のコミット）。"
            echo "同期（Pull）を開始します..."
            
            if git pull; then
                echo "✅ 同期完了！ローカルを更新しました。"
            else
                echo "⚠️ 同期に失敗しました。コンフリクトが発生している可能性があります。"
            fi
        fi
    fi

    # ==========================================
    # 2. ローカルの変更を確認して送信 (Push)
    # ==========================================
    
    # 変更があるか確認（未追跡ファイルも含める）
    if [[ -n $(git status -s) ]]; then
        echo "----------------------------------------"
        echo "ローカルの変更を検知しました。プッシュ処理を開始します..."
        
        # 現在時刻を取得
        TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
        
        # すべての変更をステージング
        git add .
        
        # コミット
        if git commit -m "Auto update: $TIMESTAMP"; then
            # プッシュ前に再度Pullして最新状態を確認（コンフリクト回避）
            git pull --rebase > /dev/null 2>&1
            
            # プッシュ
            echo "GitHubへプッシュ中..."
            if git push; then
                echo "✅ [$TIMESTAMP] プッシュ成功！"
            else
                echo "❌ [$TIMESTAMP] プッシュに失敗しました。"
            fi
        else
            echo "コミットに失敗しました。"
        fi
    fi
    
    # 次のチェックまで待機
    sleep $INTERVAL
done
