#!/usr/bin/env python3
"""
Web管理画面 - キーワード・ジャンル・URL管理
"""
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from werkzeug.utils import secure_filename
import os
import csv
import io
from storage import RankingStorage
from pathlib import Path

app = Flask(__name__)
app.secret_key = 'seo-rank-checker-secret-key-change-in-production'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# データベースパス
DB_PATH = os.path.join(os.path.dirname(__file__), 'rankings.db')
storage = RankingStorage(DB_PATH)


@app.route('/')
def index():
    """キーワード一覧・編集画面"""
    try:
        keywords = storage.get_all_keywords()
        genres = storage.get_all_genres()
        
        return render_template(
            'index.html',
            keywords=keywords,
            genres=genres,
            total_count=len(keywords)
        )
    except Exception as e:
        flash(f'エラーが発生しました: {str(e)}', 'danger')
        return render_template('index.html', keywords=[], genres=[], total_count=0)


@app.route('/save', methods=['POST'])
def save_keywords():
    """キーワード情報を一括保存"""
    try:
        # フォームデータから全キーワード情報を取得
        keywords_data = []
        
        # POSTされたデータからキーワード情報を抽出
        form_data = request.form.to_dict(flat=False)
        
        # キーワードのインデックスを取得
        keyword_indices = set()
        for key in form_data.keys():
            if key.startswith('keyword_'):
                idx = key.split('_')[1]
                keyword_indices.add(idx)
        
        # 各キーワードのデータを収集
        for idx in keyword_indices:
            keyword = form_data.get(f'keyword_{idx}', [''])[0].strip()
            if not keyword:
                continue
            
            genre = form_data.get(f'genre_{idx}', [''])[0].strip()
            url = form_data.get(f'url_{idx}', [''])[0].strip()
            priority = form_data.get(f'priority_{idx}', [''])[0].strip()
            notes = form_data.get(f'notes_{idx}', [''])[0].strip()
            
            keywords_data.append({
                'keyword': keyword,
                'genre': genre if genre else None,
                'url': url if url else None,
                'priority': priority if priority else None,
                'notes': notes if notes else None
            })
        
        # バッチ保存
        if keywords_data:
            storage.save_keywords_batch(keywords_data)
            flash(f'{len(keywords_data)}件のキーワードを保存しました', 'success')
        else:
            flash('保存するデータがありませんでした', 'warning')
        
        return redirect(url_for('index'))
    
    except Exception as e:
        flash(f'保存中にエラーが発生しました: {str(e)}', 'danger')
        return redirect(url_for('index'))


@app.route('/import', methods=['GET', 'POST'])
def import_csv():
    """CSV一括インポート画面"""
    if request.method == 'GET':
        return render_template('import.html')
    
    try:
        # ファイルの確認
        if 'csv_file' not in request.files:
            flash('ファイルが選択されていません', 'danger')
            return redirect(url_for('import_csv'))
        
        file = request.files['csv_file']
        
        if file.filename == '':
            flash('ファイルが選択されていません', 'danger')
            return redirect(url_for('import_csv'))
        
        if not file.filename.endswith('.csv'):
            flash('CSVファイルを選択してください', 'danger')
            return redirect(url_for('import_csv'))
        
        # CSVファイルを読み込み
        stream = io.StringIO(file.stream.read().decode('utf-8-sig'), newline=None)
        csv_reader = csv.reader(stream)
        
        # 全行を読み込み
        rows = list(csv_reader)
        
        if len(rows) < 2:
            flash('CSVファイルにデータがありません', 'danger')
            return redirect(url_for('import_csv'))
        
        # 1行目が空の場合は2行目をヘッダーとする
        header_row_idx = 0
        if not any(rows[0]):  # 1行目が全て空
            header_row_idx = 1
        
        headers = rows[header_row_idx]
        data_start_idx = header_row_idx + 1
        
        # フォームから列のマッピングを取得
        genre_col = request.form.get('genre_column', '').strip()
        keyword_col = request.form.get('keyword_column', '').strip()
        url_col = request.form.get('url_column', '').strip()
        
        # デフォルト値を設定
        if not genre_col:
            genre_col = 'ジャンル'
        if not keyword_col:
            keyword_col = 'KW'
        if not url_col:
            url_col = 'URL'
        
        # 列インデックスを取得
        try:
            genre_idx = headers.index(genre_col)
            keyword_idx = headers.index(keyword_col)
            url_idx = headers.index(url_col) if url_col in headers else None
        except ValueError as e:
            flash(f'指定された列が見つかりません: {str(e)}', 'danger')
            return redirect(url_for('import_csv'))
        
        # データを読み込み
        keywords_data = []
        for row in rows[data_start_idx:]:
            if len(row) <= max(genre_idx, keyword_idx):
                continue
            
            keyword = row[keyword_idx].strip() if keyword_idx < len(row) else ''
            if not keyword:
                continue
            
            genre = row[genre_idx].strip() if genre_idx < len(row) else ''
            url = row[url_idx].strip() if url_idx is not None and url_idx < len(row) else ''
            
            keywords_data.append({
                'keyword': keyword,
                'genre': genre if genre else None,
                'url': url if url else None,
                'priority': None,
                'notes': None
            })
        
        # バッチ保存
        if keywords_data:
            storage.save_keywords_batch(keywords_data)
            flash(f'{len(keywords_data)}件のキーワードをインポートしました', 'success')
        else:
            flash('インポートするデータがありませんでした', 'warning')
        
        return redirect(url_for('index'))
    
    except Exception as e:
        flash(f'インポート中にエラーが発生しました: {str(e)}', 'danger')
        return redirect(url_for('import_csv'))


@app.route('/api/keywords', methods=['GET'])
def api_get_keywords():
    """キーワード一覧をJSON形式で取得（API）"""
    try:
        genre = request.args.get('genre')
        
        if genre:
            keywords = storage.get_keywords_by_genre(genre)
        else:
            keywords = storage.get_all_keywords()
        
        return jsonify({
            'success': True,
            'count': len(keywords),
            'keywords': keywords
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/delete/<keyword>', methods=['POST'])
def delete_keyword(keyword):
    """キーワードを削除"""
    try:
        # キーワード削除機能（必要に応じて実装）
        flash(f'キーワード「{keyword}」の削除機能は未実装です', 'info')
        return redirect(url_for('index'))
    except Exception as e:
        flash(f'削除中にエラーが発生しました: {str(e)}', 'danger')
        return redirect(url_for('index'))


if __name__ == '__main__':
    print("=" * 60)
    print("SEO順位チェッカー - Web管理画面")
    print("=" * 60)
    print(f"データベース: {DB_PATH}")
    print(f"アクセスURL: http://localhost:8080")
    print(f"管理画面を起動しています...")
    print("=" * 60)
    print()
    
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=True
    )
