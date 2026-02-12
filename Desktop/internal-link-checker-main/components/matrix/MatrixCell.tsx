'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface MatrixCellProps {
  hasLink: boolean;
  isSelf: boolean;
}

// パフォーマンス向上のため、SVGアイコンを除去し、シンプルな背景色とドットのみで表現
export const MatrixCell = memo(({ hasLink, isSelf }: MatrixCellProps) => {
  return (
    <td
      className={cn(
        'border-b border-r p-0 text-center w-8 h-8 md:w-10 md:h-10 transition-colors',
        isSelf && 'bg-muted/30',
        !isSelf && hasLink && 'bg-green-100'
      )}
    >
      {!isSelf && hasLink && (
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-600 shadow-sm" />
        </div>
      )}
    </td>
  );
});

MatrixCell.displayName = 'MatrixCell';
