import * as cheerio from 'cheerio';
import type { InternalLink, SelectorConfig } from '@/types';

// URLを正規化
function normalizeUrl(url: string, baseUrl: string): string | null {
  try {
    // 相対URLを絶対URLに変換
    const absolute = new URL(url, baseUrl);

    // 同じドメインかチェック (wwwの有無を無視)
    const base = new URL(baseUrl);
    const getDomain = (host: string) => host.replace(/^www\./, '');

    if (getDomain(absolute.hostname) !== getDomain(base.hostname)) {
      return null; // 外部リンクは無視
    }

    return absolute.href;
  } catch {
    return null;
  }
}

// ショートコードパターンからURLを抽出
// 例: [blogcard url="https://example.com/page"]
function extractShortcodeUrls(
  html: string,
  sourceUrl: string,
  pattern: string
): { url: string; anchorText: string }[] {
  const results: { url: string; anchorText: string }[] = [];

  // パターンからショートコード名を抽出（例: "blogcard" from "[blogcard url="]）
  // 正規表現パターンを動的に構築
  // [shortcode url="..."] または [shortcode url='...'] の形式に対応
  const shortcodeMatch = pattern.match(/\[(\w+)/);
  if (!shortcodeMatch) return results;

  const shortcodeName = shortcodeMatch[1];
  const regex = new RegExp(
    `\\[${shortcodeName}[^\\]]*url=["']([^"']+)["'][^\\]]*\\]`,
    'gi'
  );

  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    const normalizedUrl = normalizeUrl(url, sourceUrl);
    if (normalizedUrl) {
      results.push({
        url: normalizedUrl,
        anchorText: `[${shortcodeName}]`,
      });
    }
  }

  return results;
}

// セレクタがショートコードパターンかどうかを判定
function isShortcodePattern(selector: string): boolean {
  return selector.trim().startsWith('[') && selector.includes('url=');
}

// HTMLからリンクを抽出
export function extractLinks(
  html: string,
  sourceUrl: string,
  selectors: SelectorConfig[]
): InternalLink[] {
  const $ = cheerio.load(html);
  const links: InternalLink[] = [];
  const seenUrls = new Set<string>();

  // 有効なセレクタのみ使用
  const enabledSelectors = selectors.filter((s) => s.enabled);

  // ヘルパー関数: URLを追加（重複チェック付き）
  const addLink = (targetUrl: string, anchorText: string) => {
    if (!seenUrls.has(targetUrl)) {
      seenUrls.add(targetUrl);
      links.push({
        sourceUrl,
        targetUrl,
        anchorText,
      });
    }
  };

  if (enabledSelectors.length === 0) {
    // セレクタが設定されていない場合は全ての<a>タグを対象
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const normalizedUrl = normalizeUrl(href, sourceUrl);
        if (normalizedUrl) {
          addLink(normalizedUrl, $(element).text().trim());
        }
      }
    });
  } else {
    // 各セレクタでリンクを抽出
    for (const config of enabledSelectors) {
      try {
        // ショートコードパターンの場合
        if (isShortcodePattern(config.selector)) {
          const shortcodeLinks = extractShortcodeUrls(html, sourceUrl, config.selector);
          for (const link of shortcodeLinks) {
            addLink(link.url, link.anchorText);
          }
          continue;
        }

        // CSSセレクタの場合
        $(config.selector).each((_, element) => {
          // セレクタがaタグを直接指す場合
          if (element.type === 'tag' && element.name === 'a') {
            const href = $(element).attr('href');
            if (href) {
              const normalizedUrl = normalizeUrl(href, sourceUrl);
              if (normalizedUrl) {
                addLink(normalizedUrl, $(element).text().trim());
              }
            }
          } else {
            // セレクタがaタグの親要素を指す場合、内部のaタグを探す
            $(element).find('a[href]').each((_, linkElement) => {
              const href = $(linkElement).attr('href');
              if (href) {
                const normalizedUrl = normalizeUrl(href, sourceUrl);
                if (normalizedUrl) {
                  addLink(normalizedUrl, $(linkElement).text().trim());
                }
              }
            });
          }
        });
      } catch (e) {
        console.error(`Invalid selector: ${config.selector}`, e);
      }
    }
  }

  return links;
}

// 単一URLのHTMLを取得
export async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; InternalLinkChecker/1.0)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

// 複数URLを並列でクロール（レート制限付き）
export async function crawlUrls(
  urls: string[],
  selectors: SelectorConfig[],
  concurrency: number = 5,
  onProgress?: (completed: number, total: number, currentUrl: string) => void
): Promise<{ links: InternalLink[]; errors: Array<{ url: string; error: string }> }> {
  const allLinks: InternalLink[] = [];
  const errors: Array<{ url: string; error: string }> = [];

  // 並列数を制限してクロール
  const chunks: string[][] = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    chunks.push(urls.slice(i, i + concurrency));
  }

  let completed = 0;

  for (const chunk of chunks) {
    const results = await Promise.allSettled(
      chunk.map(async (url) => {
        try {
          const html = await fetchHtml(url);
          const links = extractLinks(html, url, selectors);
          return { url, links };
        } catch (error) {
          throw { url, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    for (const result of results) {
      completed++;

      if (result.status === 'fulfilled') {
        allLinks.push(...result.value.links);
        onProgress?.(completed, urls.length, result.value.url);
      } else {
        const err = result.reason as { url: string; error: string };
        errors.push(err);
        onProgress?.(completed, urls.length, err.url);
      }
    }

    // レート制限: チャンク間に少し待機
    if (chunks.indexOf(chunk) < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return { links: allLinks, errors };
}
