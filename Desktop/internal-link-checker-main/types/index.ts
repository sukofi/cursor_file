// 記事データの型定義
export interface Article {
  id: string;
  keyword: string;
  url: string;
  genre?: string;  // ジャンル
}

// プロジェクト（保存されたスプレッドシート設定）
export interface Project {
  id: string;
  name: string;
  description?: string;
  sheetSettings: SheetSettings;
  selectors: SelectorConfig[];
  createdAt: number;
  updatedAt: number;
}

// 内部リンク情報
export interface InternalLink {
  sourceUrl: string;  // リンク元
  targetUrl: string;  // リンク先
  anchorText?: string; // アンカーテキスト
}

// マトリクスセルのデータ
export interface MatrixCell {
  hasLink: boolean;
  linkCount: number;
}

// マトリクスデータ全体
export interface MatrixData {
  articles: Article[];
  links: Map<string, Set<string>>; // sourceUrl -> Set of targetUrls
}

// スプレッドシート設定
export interface SheetSettings {
  spreadsheetId: string;
  sheetName: string;
  keywordColumn: string;  // 例: "A", "B", etc.
  urlColumn: string;
  genreColumn?: string;   // ジャンル列（オプション）
}

// CSSセレクタ設定
export interface SelectorConfig {
  id: string;
  name: string;
  selector: string;
  enabled: boolean;
}

// アプリ全体の設定
export interface AppSettings {
  sheetSettings: SheetSettings;
  selectors: SelectorConfig[];
}

// スプレッドシートの列情報
export interface ColumnInfo {
  letter: string;
  name: string;
  sampleValue?: string;
}

// クローリング状態
export interface CrawlStatus {
  isLoading: boolean;
  progress: number;
  total: number;
  currentUrl?: string;
  error?: string;
}

// API レスポンス型
export interface SheetDataResponse {
  success: boolean;
  data?: Article[];
  columns?: ColumnInfo[];
  error?: string;
}

export interface CrawlResponse {
  success: boolean;
  links?: InternalLink[];
  error?: string;
}
