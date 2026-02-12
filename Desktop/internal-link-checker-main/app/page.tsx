'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Matrix } from '@/components/matrix/Matrix';
import { Dashboard } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserMenu } from '@/components/auth/UserMenu';
import { Settings, RefreshCw, Download, ChevronLeft, Crown } from 'lucide-react';

interface SheetMeta {
  totalRows: number;
  returnedRows: number;
  isLimited: boolean;
  plan: string;
  maxRows: number | null;
}

export default function HomePage() {
  const {
    projects,
    currentProjectId,
    selectProject,
    sheetSettings,
    selectors,
    articles,
    links,
    setArticles,
    setLinks,
    crawlStatus,
    setCrawlStatus,
    resetCrawlStatus,
  } = useAppStore();

  // すべてのHooksは条件分岐の前に呼び出す
  const [error, setError] = useState<string | null>(null);
  const [planLimitInfo, setPlanLimitInfo] = useState<SheetMeta | null>(null);

  // 現在のプロジェクト
  const currentProject = projects.find((p) => p.id === currentProjectId);

  // プロジェクトが選択されていない場合はダッシュボードを表示
  if (!currentProjectId) {
    return <Dashboard />;
  }

  // スプレッドシートからデータを取得してクロール開始
  const handleRefresh = async () => {
    if (!sheetSettings.spreadsheetId) {
      setError('スプレッドシートIDが設定されていません。設定画面で設定してください。');
      return;
    }

    setError(null);
    setCrawlStatus({ isLoading: true, progress: 0, total: 0 });

    try {
      // 1. スプレッドシートから記事データを取得
      const genreParam = sheetSettings.genreColumn ? `&genreColumn=${sheetSettings.genreColumn}` : '';
      const articlesRes = await fetch(
        `/api/sheets?action=articles&spreadsheetId=${encodeURIComponent(
          sheetSettings.spreadsheetId
        )}&sheetName=${encodeURIComponent(
          sheetSettings.sheetName
        )}&keywordColumn=${sheetSettings.keywordColumn}&urlColumn=${sheetSettings.urlColumn}${genreParam}`
      );

      const articlesData = await articlesRes.json();

      if (!articlesData.success) {
        throw new Error(articlesData.error);
      }

      // プラン制限情報を保存
      if (articlesData.meta) {
        setPlanLimitInfo(articlesData.meta);
      }

      setArticles(articlesData.data);
      setCrawlStatus({ total: articlesData.data.length });

      if (articlesData.data.length === 0) {
        setError('記事データが見つかりませんでした。');
        resetCrawlStatus();
        return;
      }

      // 2. 全URLをクロール
      const urls = articlesData.data.map((a: { url: string }) => a.url);
      const enabledSelectors = selectors.filter((s) => s.enabled);

      // バッチでクロール（20件ずつ）
      const batchSize = 20;
      const allLinks: typeof links = [];

      for (let i = 0; i < urls.length; i += batchSize) {
        const batchUrls = urls.slice(i, i + batchSize).filter((url: string) => {
          try {
            new URL(url);
            return true;
          } catch {
            console.warn(`[Crawl] Skipping invalid URL: ${url}`);
            return false;
          }
        });

        if (batchUrls.length === 0) {
          setCrawlStatus({ progress: Math.min(i + batchSize, urls.length) });
          continue;
        }

        setCrawlStatus({
          progress: i,
          currentUrl: `${i + 1}〜${Math.min(i + batchSize, urls.length)}件目をクロール中...`,
        });

        try {
          const crawlRes = await fetch('/api/crawl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              urls: batchUrls,
              selectors: enabledSelectors,
            }),
          });

          if (!crawlRes.ok) {
            const errorData = await crawlRes.json().catch(() => ({}));
            throw new Error(errorData.error || `Crawl failed with status ${crawlRes.status}`);
          }

          const crawlData = await crawlRes.json();

          if (crawlData.success && crawlData.links) {
            allLinks.push(...crawlData.links);
          }
        } catch (crawlError) {
          console.error(`[Crawl] Batch ${i} failed:`, crawlError);
          // 1つのバッチが失敗しても続行する
        }
      }

      setLinks(allLinks);
      setCrawlStatus({ progress: urls.length, isLoading: false });

      // 完了後にリセット
      setTimeout(() => {
        resetCrawlStatus();
      }, 2000);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
      resetCrawlStatus();
    }
  };

  // CSVエクスポート
  const handleExport = () => {
    if (articles.length === 0) return;

    const headers = ['キーワード', 'URL', '発リンク数', '被リンク数'];

    // リンクデータを計算
    const normalizeUrl = (url: string) => {
      try {
        const parsed = new URL(url);
        return parsed.origin + parsed.pathname.replace(/\/$/, '').toLowerCase();
      } catch {
        return url.toLowerCase().replace(/\/$/, '');
      }
    };

    const linkMap = new Map<string, Set<string>>();
    links.forEach((link) => {
      const sourceNorm = normalizeUrl(link.sourceUrl);
      const targetNorm = normalizeUrl(link.targetUrl);
      if (!linkMap.has(sourceNorm)) linkMap.set(sourceNorm, new Set());
      linkMap.get(sourceNorm)!.add(targetNorm);
    });

    const rows = articles.map((article) => {
      const urlNorm = normalizeUrl(article.url);
      const outgoing = linkMap.get(urlNorm)?.size || 0;
      let incoming = 0;
      linkMap.forEach((targets) => {
        if (targets.has(urlNorm)) incoming++;
      });

      return [article.keyword, article.url, outgoing.toString(), incoming.toString()];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `internal-links-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isConfigured = !!sheetSettings.spreadsheetId;

  // ダッシュボードに戻る
  const handleBackToDashboard = () => {
    selectProject(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              戻る
            </Button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-primary leading-tight">
                {currentProject?.name || '内部リンクマトリクス'}
              </h1>
              {currentProject?.description && (
                <span className="text-xs text-muted-foreground">{currentProject.description}</span>
              )}
            </div>
            {crawlStatus.isLoading && (
              <Badge variant="secondary" className="animate-pulse">
                {crawlStatus.currentUrl || `${crawlStatus.progress}/${crawlStatus.total}`}
              </Badge>
            )}
            {!crawlStatus.isLoading && links.length > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                検出リンク: {links.length}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={articles.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={!isConfigured || crawlStatus.isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${crawlStatus.isLoading ? 'animate-spin' : ''}`}
              />
              更新
            </Button>
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <div className="border-l pl-3 ml-1">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* プラン制限の通知 */}
        {planLimitInfo?.isLimited && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">
                  無料プランでは{planLimitInfo.maxRows}行まで取得可能です
                </p>
                <p className="text-sm text-amber-700">
                  全{planLimitInfo.totalRows}行中、{planLimitInfo.returnedRows}行を表示しています。
                  Proプランにアップグレードすると、すべての行を取得できます。
                </p>
              </div>
            </div>
            <Link href="/pricing">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                アップグレード
              </Button>
            </Link>
          </div>
        )}

        {!isConfigured ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-4">
              スプレッドシートが設定されていません。
            </p>
            <Link href="/settings">
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                設定画面へ
              </Button>
            </Link>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-4">
              「更新」ボタンを押してデータを取得してください。
            </p>
            <Button onClick={handleRefresh} disabled={crawlStatus.isLoading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${crawlStatus.isLoading ? 'animate-spin' : ''}`}
              />
              データを取得
            </Button>
          </div>
        ) : (
          <Matrix articles={articles} links={links} />
        )}
      </main>
    </div>
  );
}
