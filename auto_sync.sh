#!/bin/bash

# 設定
INTERVAL=60 # チェックの間隔（秒）
BRANCH="main"
REMOTE="origin"

echo "自動同期を開始します: $(pwd)"
echo "監視間隔: ${INTERVAL}秒"

while true; do
    # リモートからの変更を取り込み（競合を避けるため rebase）
    git pull $REMOTE $BRANCH --rebase > /dev/null 2>&1

    # 変更があるか確認
    if [[ -n $(git status -s) ]]; then
        echo "変更を検知しました: $(date '+%Y-%m-%d %H:%M:%S')"
        
        # 変更をステージング
        git add .
        
        # コミット
        git commit -m "Auto-update: $(date '+%Y-%m-%d %H:%M:%S')"
        
        # プッシュ
        if git push $REMOTE $BRANCH; then
            echo "正常にプッシュされました。"
        else
            echo "プッシュに失敗しました。次回のサイクルで再試行します。"
        fi
    fi

    sleep $INTERVAL
done
