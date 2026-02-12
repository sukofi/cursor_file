import type { Article, ColumnInfo } from '@/types';

// ビルド時に googleapis が認証情報なしで初期化されないよう動的インポート
async function getSheetsClient(accessToken: string) {
  const { google } = await import('googleapis');
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.sheets({ version: 'v4', auth: oauth2Client });
}

// スプレッドシートの列情報を取得（ヘッダー行のデータ）
export async function getColumnInfo(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string
): Promise<ColumnInfo[]> {
  const sheets = await getSheetsClient(accessToken);

  // 最初の2行を取得（ヘッダー + サンプル）
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:2`,
  });

  const rows = response.data.values || [];
  const headers = rows[0] || [];
  const sampleRow = rows[1] || [];

  const columns: ColumnInfo[] = [];

  for (let i = 0; i < Math.max(headers.length, 26); i++) {
    const letter = String.fromCharCode(65 + i); // A, B, C, ...
    if (i >= 26) break; // A-Z のみ対応

    columns.push({
      letter,
      name: headers[i]?.toString() || `列 ${letter}`,
      sampleValue: sampleRow[i]?.toString(),
    });
  }

  return columns;
}

// シート名一覧を取得
export async function getSheetNames(accessToken: string, spreadsheetId: string): Promise<string[]> {
  const sheets = await getSheetsClient(accessToken);

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  return response.data.sheets?.map((sheet) => sheet.properties?.title || '') || [];
}

// 列文字をインデックスに変換 (A=0, B=1, ...)
function columnLetterToIndex(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 65;
}

// スプレッドシートから記事データを取得
export async function getArticles(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  keywordColumn: string,
  urlColumn: string,
  genreColumn?: string
): Promise<Article[]> {
  const sheets = await getSheetsClient(accessToken);

  // 必要な列を取得するため、全データを取得
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}`,
  });

  const rows = response.data.values || [];

  if (rows.length <= 1) {
    return []; // ヘッダーのみまたは空
  }

  const keywordIndex = columnLetterToIndex(keywordColumn);
  const urlIndex = columnLetterToIndex(urlColumn);
  const genreIndex = genreColumn ? columnLetterToIndex(genreColumn) : -1;

  const articles: Article[] = [];

  // ヘッダー行をスキップ
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const keyword = row[keywordIndex]?.toString()?.trim();
    let url = row[urlIndex]?.toString()?.trim() || '';

    // プロトコルがない場合は https:// を補完
    if (url && !url.startsWith('http') && !url.startsWith('//')) {
      url = `https://${url}`;
    }

    const genre = genreIndex >= 0 ? row[genreIndex]?.toString()?.trim() : undefined;

    if (keyword && url) {
      articles.push({
        id: `article-${i}`,
        keyword,
        url,
        genre,
      });
    }
  }

  return articles;
}

// スプレッドシートIDをURLから抽出
export function extractSpreadsheetId(input: string): string {
  // 直接IDが入力された場合
  if (!input.includes('/')) {
    return input.trim();
  }

  // URLからIDを抽出
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : input.trim();
}
