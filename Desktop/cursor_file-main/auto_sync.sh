#!/bin/bash

# 設定
INTERVAL=60 # チェックの間隔（秒）
REMOTE="origin"

echo "自動同期を開始します: $(pwd)"
echo "監視間隔: ${INTERVAL}秒"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # 現在のブランチ名を取得
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    
    # 1. ローカルの変更をチェックしてコミット
    if [[ -n $(git status -s) ]]; then
        echo "[$TIMESTAMP] ローカルの変更を検知しました（Branch: $BRANCH）。コミットします..."
        git add .
        git commit -m "Auto-update: $TIMESTAMP"
    fi

    # 2. リモートからの変更を取り込み (Pull)
    # ローカルはコミット済みなので rebase しやすい
    # --autostash で、カレントディレクトリ外の変更（unstaged）を一時退避してpullする
    # コンフリクトを避けるため、rebaseではなくmerge戦略をとる場合もありますが、
    # ここではrebaseを使用し、失敗したらログに出すようにします。
    
    echo "[$TIMESTAMP] Pulling from $REMOTE $BRANCH..."
    PULL_OUTPUT=$(git pull $REMOTE $BRANCH --rebase --autostash 2>&1)
    PULL_EXIT_CODE=$?
    
    if [[ $PULL_EXIT_CODE -ne 0 ]]; then
        echo "[$TIMESTAMP] エラー: プルに失敗しました。"
        echo "$PULL_OUTPUT"
        # コンフリクト時は何もしない（ユーザーの介入を待つ）
    elif [[ "$PULL_OUTPUT" != *"Already up to date."* ]]; then
        echo "[$TIMESTAMP] リモートから変更を同期しました:"
        echo "$PULL_OUTPUT"
    fi

    # 3. プッシュ
    PUSH_OUTPUT=$(git push $REMOTE $BRANCH 2>&1)
    if [[ $? -ne 0 ]]; then
        echo "[$TIMESTAMP] プッシュに失敗しました。"
        echo "$PUSH_OUTPUT"
    elif [[ "$PUSH_OUTPUT" != *"Everything up-to-date"* ]]; then
        echo "[$TIMESTAMP] GitHubへプッシュしました。"
    fi

    sleep $INTERVAL
done
