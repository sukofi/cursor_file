'use client';

import React, { memo } from 'react';
import type { Article } from '@/types';

interface MatrixHeaderProps {
  articles: Article[];
}

export const MatrixHeader = memo(({ articles }: MatrixHeaderProps) => {
  return (
    <tr>
      {/* 左上のコーナーセル */}
      <th className="sticky left-0 top-0 z-40 bg-white border-b border-r p-2 min-w-[200px]">
        <div className="text-xs text-muted-foreground">
          被リンク記事 ＼ 発リンク記事
        </div>
      </th>
      {/* 被リンク数（内部リンク数） */}
      <th className="sticky left-[200px] top-0 z-40 bg-gray-100 border-b border-r p-1 min-w-[50px]">
        <div className="text-xs text-muted-foreground h-32 flex items-end justify-center">
          <span style={{ writingMode: 'vertical-rl' }}>
            被リンク数
          </span>
        </div>
      </th>
      {/* 各記事のヘッダー */}
      {articles.map((article) => (
        <th
          key={article.id}
          className="sticky top-0 z-20 bg-white border-b border-r p-1 min-w-[40px]"
        >
          <div
            className="h-32 flex items-end justify-center overflow-hidden"
            title={`${article.keyword}\n${article.url}`}
          >
            <span
              className="text-xs line-clamp-6 text-center"
              style={{ writingMode: 'vertical-rl' }}
            >
              {article.keyword}
            </span>
          </div>
        </th>
      ))}
    </tr>
  );
});

MatrixHeader.displayName = 'MatrixHeader';
