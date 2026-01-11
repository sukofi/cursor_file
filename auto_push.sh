#!/bin/bash

# 監視間隔（秒）
INTERVAL=30

echo "=== 自動プッシュを開始します ==="
echo "監視間隔: ${INTERVAL}秒"
echo "停止するには Ctrl+C を押してください"

while true; do
    # 変更があるか確認（未追跡ファイルも含める）
    if [[ -n $(git status -s) ]]; then
        echo "----------------------------------------"
        echo "変更を検知しました。プッシュ処理を開始します..."
        
        # 現在時刻を取得
        TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
        
        # すべての変更をステージング
        git add .
        
        # コミット
        if git commit -m "Auto update: $TIMESTAMP"; then
            # プッシュ
            echo "GitHubへプッシュ中..."
            if git push; then
                echo "[$TIMESTAMP] プッシュ成功！"
            else
                echo "[$TIMESTAMP] プッシュに失敗しました。"
            fi
        else
            echo "コミットに失敗しました（変更がない可能性があります）"
        fi
    fi
    
    # 次のチェックまで待機
    sleep $INTERVAL
done
