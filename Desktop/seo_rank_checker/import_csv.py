"""
CSVファイルからキーワード情報をデータベースに上書き保存するスクリプト
"""
import csv
import sys
from pathlib import Path
from storage import RankingStorage
from datetime import datetime


def import_csv_to_database(csv_path: str, db_path: str = "rankings.db"):
    """
    CSVファイルからキーワード情報をデータベースに上書き保存
    
    Args:
        csv_path: CSVファイルのパス
        db_path: データベースファイルのパス
    """
    # CSVファイルの存在確認
    csv_file = Path(csv_path)
    if not csv_file.exists():
        print(f"[ERROR] CSVファイルが見つかりません: {csv_path}")
        sys.exit(1)
    
    print(f"[INFO] CSVファイルを読み込み中: {csv_path}")
    
    # ストレージを初期化
    storage = RankingStorage(db_path)
    print(f"[INFO] データベース: {db_path}")
    
    # CSVファイルを読み込む
    keywords_data = []
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            # 1行目を読み込む（空行の可能性があるため）
            lines = f.readlines()
            
            # 空行をスキップしてヘッダーを見つける
            header_line_idx = 0
            for i, line in enumerate(lines):
                stripped = line.strip()
                if stripped and ',' in stripped:
                    # ジャンルとKWを含む行を探す
                    if 'ジャンル' in stripped or 'KW' in stripped or 'キーワード' in stripped:
                        header_line_idx = i
                        break
            
            print(f"[INFO] ヘッダー行: {header_line_idx + 1} 行目")
            
            # ヘッダー行以降をCSVとして読み込む
            from io import StringIO
            csv_content = ''.join(lines[header_line_idx:])
            reader = csv.DictReader(StringIO(csv_content))
            
            # ヘッダー行を確認
            if not reader.fieldnames:
                print("[ERROR] CSVファイルにヘッダー行がありません")
                sys.exit(1)
            
            print(f"[INFO] 検出されたカラム: {', '.join(reader.fieldnames)}")
            
            # カラム名を特定（柔軟にマッチング）
            genre_col = None
            keyword_col = None
            url_col = None
            
            for col in reader.fieldnames:
                col_stripped = col.strip()
                if 'ジャンル' in col_stripped or 'genre' in col_stripped.lower():
                    genre_col = col
                    print(f"[INFO] ジャンルカラム: {col}")
                if 'KW' in col_stripped or 'キーワード' in col_stripped or 'keyword' in col_stripped.lower():
                    keyword_col = col
                    print(f"[INFO] キーワードカラム: {col}")
                if 'URL' in col_stripped or 'url' in col_stripped.lower() or 'リンク' in col_stripped:
                    url_col = col
                    print(f"[INFO] URLカラム: {col}")
            
            # ヘッダーが空欄の場合、列インデックスで判定
            if not url_col and len(reader.fieldnames) >= 3:
                # 3列目をURL列とみなす
                url_col = reader.fieldnames[2]
                print(f"[INFO] URLカラム（3列目）: {url_col}")
            
            if not keyword_col:
                print("[ERROR] キーワードカラム（KW）が見つかりませんでした")
                print(f"[ERROR] 利用可能なカラム: {', '.join(reader.fieldnames)}")
                sys.exit(1)
            
            # データを読み込む
            row_count = 0
            for row in reader:
                row_count += 1
                
                # キーワードを取得
                keyword = row.get(keyword_col, '').strip() if keyword_col else ''
                
                # 空のキーワードはスキップ
                if not keyword:
                    continue
                
                # ジャンルを取得
                genre = row.get(genre_col, '').strip() if genre_col else None
                if genre == '':
                    genre = None
                
                # URLを取得
                url = row.get(url_col, '').strip() if url_col is not None else None
                if url == '' or url == '404' or url == '画像・リンク' or url == 'アイキャッチ' or url == '相場' or url == '価格':
                    url = None
                
                keywords_data.append({
                    'keyword': keyword,
                    'genre': genre,
                    'url': url,
                    'priority': None,
                    'notes': None
                })
            
            print(f"[INFO] CSVファイルから {row_count} 行を読み込みました")
            print(f"[INFO] 有効なキーワード: {len(keywords_data)} 件")
    
    except Exception as e:
        print(f"[ERROR] CSVファイルの読み込みに失敗しました: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    if not keywords_data:
        print("[WARN] 保存するキーワードがありません")
        return
    
    # データベースに保存
    print(f"[INFO] {len(keywords_data)} 件のキーワードをデータベースに保存中...")
    
    try:
        storage.save_keywords_batch(keywords_data)
        print(f"[SUCCESS] ✅ {len(keywords_data)} 件のキーワードをデータベースに保存しました")
    except Exception as e:
        print(f"[ERROR] データベースへの保存に失敗しました: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # ジャンル別の集計を表示
    genres = {}
    for kw_data in keywords_data:
        genre = kw_data.get('genre') or '（未分類）'
        genres[genre] = genres.get(genre, 0) + 1
    
    print(f"\n[INFO] ジャンル別集計:")
    for genre, count in sorted(genres.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {genre}: {count} 件")
    
    # データベースの統計情報を表示
    all_keywords = storage.get_all_keywords()
    all_genres = storage.get_all_genres()
    
    print(f"\n[INFO] データベースの統計:")
    print(f"  - 総キーワード数: {len(all_keywords)} 件")
    print(f"  - ジャンル数: {len(all_genres)} 種類")


def main():
    """メイン処理"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='CSVファイルからキーワード情報をデータベースに上書き保存'
    )
    parser.add_argument(
        'csv_file',
        type=str,
        help='CSVファイルのパス'
    )
    parser.add_argument(
        '--db',
        type=str,
        default='rankings.db',
        help='データベースファイルのパス（デフォルト: rankings.db）'
    )
    
    args = parser.parse_args()
    
    # インポート実行
    import_csv_to_database(args.csv_file, args.db)


if __name__ == '__main__':
    main()
