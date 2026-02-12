'use client';

import React, { useMemo, useState, memo } from 'react';
import { MatrixHeader } from './MatrixHeader';
import { MatrixCell } from './MatrixCell';
import { calculateLinkMatrix } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, ExternalLink } from 'lucide-react';
import type { Article, InternalLink } from '@/types';

interface MatrixProps {
  articles: Article[];
  links: InternalLink[];
}

// メモ化された行コンポーネント
const MatrixRow = memo(({
  rowArticle,
  filteredArticles,
  linkMatrix,
  onLinkCountClick
}: {
  rowArticle: any, // normalizedArticle
  filteredArticles: any[],
  linkMatrix: any,
  onLinkCountClick: (article: any) => void
}) => {
  const incomingCount = useMemo(() => linkMatrix.getIncomingLinkCount(rowArticle.normalizedUrl), [linkMatrix, rowArticle.normalizedUrl]);

  // 被リンク数に応じたスタイルを一度に計算
  const styles = useMemo(() => {
    if (incomingCount === 0) return {
      rowBg: 'bg-red-50',
      badge: 'bg-red-500 text-white',
      solidBg: 'bg-red-100'
    };
    if (incomingCount <= 2) return {
      rowBg: 'bg-yellow-50',
      badge: 'bg-yellow-500 text-white',
      solidBg: 'bg-yellow-100'
    };
    if (incomingCount <= 5) return {
      rowBg: 'bg-blue-50',
      badge: 'bg-blue-500 text-white',
      solidBg: 'bg-blue-100'
    };
    return {
      rowBg: 'bg-green-50',
      badge: 'bg-green-500 text-white',
      solidBg: 'bg-green-100'
    };
  }, [incomingCount]);

  return (
    <tr key={rowArticle.id} className={`hover:bg-muted/40 ${styles.rowBg}`}>
      <td className={`sticky left-0 z-10 border-b border-r p-2 min-w-[200px] max-w-[300px] ${styles.solidBg}`}>
        <div className="truncate" title={rowArticle.url}>
          <a
            href={rowArticle.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-xs hover:text-blue-600 hover:underline inline-flex items-center gap-1 group"
          >
            {rowArticle.keyword}
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </td>

      <td className={`sticky left-[200px] z-10 border-b border-r p-2 text-center ${styles.solidBg}`}>
        <button
          onClick={() => onLinkCountClick(rowArticle)}
          disabled={incomingCount === 0}
          className={`inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-full text-[10px] font-bold transition-all active:scale-90 ${styles.badge} ${incomingCount > 0 ? 'cursor-pointer hover:shadow-md hover:ring-2 hover:ring-offset-1 hover:ring-blue-400' : 'cursor-default opacity-50'}`}
        >
          {incomingCount}
        </button>
      </td>

      {filteredArticles.map((colArticle) => {
        const hasLink = linkMatrix.hasLink(
          colArticle.normalizedUrl,
          rowArticle.normalizedUrl
        );
        const isSelf = rowArticle.id === colArticle.id;

        return (
          <MatrixCell
            key={`${rowArticle.id}-${colArticle.id}`}
            hasLink={hasLink}
            isSelf={isSelf}
          />
        );
      })}
    </tr>
  );
});

// メモ化されたテーブル本体コンポーネント
const MatrixTable = memo(({
  filteredArticles,
  linkMatrix,
  onLinkCountClick
}: {
  filteredArticles: any[],
  linkMatrix: any,
  onLinkCountClick: (article: any) => void
}) => {
  return (
    <table className="border-collapse min-w-full table-fixed">
      <thead>
        <MatrixHeader articles={filteredArticles} />
      </thead>
      <tbody>
        {filteredArticles.map((rowArticle) => (
          <MatrixRow
            key={rowArticle.id}
            rowArticle={rowArticle}
            filteredArticles={filteredArticles}
            linkMatrix={linkMatrix}
            onLinkCountClick={onLinkCountClick}
          />
        ))}
      </tbody>
    </table>
  );
});

MatrixTable.displayName = 'MatrixTable';

export function Matrix({ articles, links }: MatrixProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [linkCountFilter, setLinkCountFilter] = useState<string>('all');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [selectedArticleForLinks, setSelectedArticleForLinks] = useState<any | null>(null);

  // リンクマトリクスを計算 (事前に正規化された記事データが含まれる)
  const linkMatrix = useMemo(
    () => calculateLinkMatrix(articles, links),
    [articles, links]
  );

  // ジャンル一覧を取得
  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    for (const article of articles) {
      if (article.genre) {
        genreSet.add(article.genre);
      }
    }
    return Array.from(genreSet).sort();
  }, [articles]);

  // フィルタリングされた記事
  const filteredArticles = useMemo(() => {
    let result = linkMatrix.normalizedArticles;

    if (genreFilter !== 'all') {
      result = result.filter((article) => article.genre === genreFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (article) =>
          article.keyword.toLowerCase().includes(query) ||
          article.url.toLowerCase().includes(query) ||
          (article.genre && article.genre.toLowerCase().includes(query))
      );
    }

    if (linkCountFilter !== 'all') {
      result = result.filter((article) => {
        const incomingCount = linkMatrix.getIncomingLinkCount(article.normalizedUrl);
        switch (linkCountFilter) {
          case '0':
            return incomingCount === 0;
          case '1-3':
            return incomingCount >= 1 && incomingCount <= 3;
          case '4-10':
            return incomingCount >= 4 && incomingCount <= 10;
          case '10+':
            return incomingCount > 10;
          default:
            return true;
        }
      });
    }

    return result;
  }, [linkMatrix, searchQuery, linkCountFilter, genreFilter]);

  // 選択された記事の被リンク詳細
  const incomingLinks = useMemo(() => {
    if (!selectedArticleForLinks) return [];
    return linkMatrix.getIncomingLinks(selectedArticleForLinks.normalizedUrl);
  }, [selectedArticleForLinks, linkMatrix]);

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        データがありません。設定画面でスプレッドシートを接続してください。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* フィルターバー */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="タイトル、URLで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {genres.length > 0 && (
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ジャンル" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのジャンル</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={linkCountFilter} onValueChange={setLinkCountFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="被リンク数" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="0">0件（孤立）</SelectItem>
            <SelectItem value="1-3">1〜3件</SelectItem>
            <SelectItem value="4-10">4〜10件</SelectItem>
            <SelectItem value="10+">10件以上</SelectItem>
          </SelectContent>
        </Select>

        <Badge variant="secondary">
          {filteredArticles.length}件の記事を表示中
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <span className="text-muted-foreground">被リンク数:</span>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-6 h-5 rounded-full bg-red-500 text-white font-bold">0</span>
          <span>孤立</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-6 h-5 rounded-full bg-yellow-500 text-white font-bold">1-2</span>
          <span>少</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-6 h-5 rounded-full bg-blue-500 text-white font-bold">3-5</span>
          <span>中</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-6 h-5 rounded-full bg-green-500 text-white font-bold">6+</span>
          <span>多</span>
        </div>
      </div>

      <div className="overflow-auto border rounded-lg max-h-[calc(100vh-280px)]">
        <MatrixTable
          filteredArticles={filteredArticles}
          linkMatrix={linkMatrix}
          onLinkCountClick={setSelectedArticleForLinks}
        />
      </div>

      {/* 詳細ダイアログ */}
      <Dialog open={!!selectedArticleForLinks} onOpenChange={(open) => !open && setSelectedArticleForLinks(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-muted-foreground font-normal">被リンク詳細:</span>
              <span className="text-primary truncate max-w-[400px]">{selectedArticleForLinks?.keyword}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              以下の記事からリンクされています（計 {incomingLinks.length} 本）：
            </p>

            <div className="max-h-[60vh] overflow-auto pr-2 custom-scrollbar">
              {incomingLinks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <p className="text-muted-foreground">被リンクは見つかりませんでした</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {incomingLinks.map((link, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-blue-500 text-xs">•</span>
                      <a
                        href={link.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-foreground hover:text-blue-600 hover:underline flex items-center gap-1.5 group"
                      >
                        {link.sourceArticle?.keyword || link.sourceUrl}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))
                  }
                </ul>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
