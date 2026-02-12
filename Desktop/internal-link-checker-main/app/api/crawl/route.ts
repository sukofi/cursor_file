import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { extractLinks, fetchHtml } from '@/lib/crawler';
import type { SelectorConfig, InternalLink } from '@/types';

export const maxDuration = 60; // Vercel Proでは最大60秒

// 単一URLのクロール
async function crawlSingleUrl(
  url: string,
  selectors: SelectorConfig[]
): Promise<{ url: string; links: InternalLink[]; error?: string }> {
  try {
    const html = await fetchHtml(url);
    const links = extractLinks(html, url, selectors);
    console.log(`[Crawl] ${url} - Found ${links.length} links`);
    if (links.length > 0) {
      console.log(`[Crawl] Sample links:`, links.slice(0, 3).map(l => l.targetUrl));
    }
    return { url, links };
  } catch (error) {
    console.error(`[Crawl] Error for ${url}:`, error);
    return {
      url,
      links: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { urls, selectors } = body as {
      urls: string[];
      selectors: SelectorConfig[];
    };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'urls array is required' },
        { status: 400 }
      );
    }

    if (!selectors || !Array.isArray(selectors)) {
      return NextResponse.json(
        { success: false, error: 'selectors array is required' },
        { status: 400 }
      );
    }

    // 並列数を制限（5つずつ）
    const concurrency = 5;
    const allLinks: InternalLink[] = [];
    const errors: Array<{ url: string; error: string }> = [];

    // URLsをチャンクに分割
    for (let i = 0; i < urls.length; i += concurrency) {
      const chunk = urls.slice(i, i + concurrency);
      
      const results = await Promise.all(
        chunk.map((url) => crawlSingleUrl(url, selectors))
      );

      for (const result of results) {
        if (result.error) {
          errors.push({ url: result.url, error: result.error });
        }
        allLinks.push(...result.links);
      }

      // レート制限
      if (i + concurrency < urls.length) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    return NextResponse.json({
      success: true,
      links: allLinks,
      errors: errors.length > 0 ? errors : undefined,
      crawledCount: urls.length - errors.length,
      totalCount: urls.length,
    });
  } catch (error) {
    console.error('Crawl API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GETは単一URLのテスト用
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const selectorsParam = searchParams.get('selectors');

  if (!url) {
    return NextResponse.json(
      { success: false, error: 'url is required' },
      { status: 400 }
    );
  }

  let selectors: SelectorConfig[] = [];
  if (selectorsParam) {
    try {
      selectors = JSON.parse(selectorsParam);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid selectors JSON' },
        { status: 400 }
      );
    }
  }

  try {
    const html = await fetchHtml(url);
    const links = extractLinks(html, url, selectors);

    return NextResponse.json({
      success: true,
      url,
      links,
      linkCount: links.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
