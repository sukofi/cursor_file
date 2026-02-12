import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Article, SheetSettings, SelectorConfig, CrawlStatus, InternalLink, Project } from '@/types';

interface AppState {
  // プロジェクト管理
  projects: Project[];
  currentProjectId: string | null;
  isLoadingProjects: boolean;

  // 設定（現在のプロジェクトまたは一時的な設定）
  sheetSettings: SheetSettings;
  selectors: SelectorConfig[];

  // データ
  articles: Article[];
  links: InternalLink[];

  // クローリング状態
  crawlStatus: CrawlStatus;

  // プロジェクト管理アクション（API連携）
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string | null) => void;

  // 設定アクション
  setSheetSettings: (settings: Partial<SheetSettings>) => void;
  addSelector: (selector: SelectorConfig) => void;
  updateSelector: (id: string, updates: Partial<SelectorConfig>) => void;
  removeSelector: (id: string) => void;
  toggleSelector: (id: string) => void;

  // データアクション
  setArticles: (articles: Article[]) => void;
  setLinks: (links: InternalLink[]) => void;
  clearData: () => void;

  // クローリング状態アクション
  setCrawlStatus: (status: Partial<CrawlStatus>) => void;
  resetCrawlStatus: () => void;
}

const defaultSheetSettings: SheetSettings = {
  spreadsheetId: '',
  sheetName: 'Sheet1',
  keywordColumn: 'A',
  urlColumn: 'B',
  genreColumn: '',
};

const defaultSelectors: SelectorConfig[] = [
  {
    id: 'default-all-links',
    name: 'すべてのリンク',
    selector: 'a',
    enabled: true,
  },
  {
    id: 'default-content-links',
    name: 'メインコンテンツ（主要なタグ）',
    selector: 'main a, article a, .entry-content a, .content a',
    enabled: false,
  },
  {
    id: 'default-lkc-internal',
    name: 'リンクカード（内部）',
    selector: '.lkc-internal-wrap a.lkc-link',
    enabled: false,
  },
  {
    id: 'default-blogcard-shortcode',
    name: 'ブログカード（ショートコード）',
    selector: '[blogcard url=""]',
    enabled: false,
  },
  {
    id: 'default-blogcard-css',
    name: 'ブログカード（CSS）',
    selector: '.blogcard a, a.blogcard',
    enabled: false,
  },
];

const defaultCrawlStatus: CrawlStatus = {
  isLoading: false,
  progress: 0,
  total: 0,
  currentUrl: undefined,
  error: undefined,
};

// API呼び出し用ヘルパー
const projectsApi = {
  async fetchAll(): Promise<Project[]> {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    const data = await res.json();
    return data.projects.map((p: Record<string, unknown>) => ({
      ...p,
      sheetSettings: p.sheetSettings as SheetSettings,
      selectors: p.selectors as SelectorConfig[],
      createdAt: new Date(p.createdAt as string).getTime(),
      updatedAt: new Date(p.updatedAt as string).getTime(),
    }));
  },

  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (!res.ok) throw new Error('Failed to create project');
    const data = await res.json();
    return {
      ...data.project,
      createdAt: new Date(data.project.createdAt).getTime(),
      updatedAt: new Date(data.project.updatedAt).getTime(),
    };
  },

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update project');
    const data = await res.json();
    return {
      ...data.project,
      createdAt: new Date(data.project.createdAt).getTime(),
      updatedAt: new Date(data.project.updatedAt).getTime(),
    };
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete project');
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初期値
      projects: [],
      currentProjectId: null,
      isLoadingProjects: false,
      sheetSettings: defaultSheetSettings,
      selectors: defaultSelectors,
      articles: [],
      links: [],
      crawlStatus: defaultCrawlStatus,

      // プロジェクト管理アクション
      fetchProjects: async () => {
        set({ isLoadingProjects: true });
        try {
          const projects = await projectsApi.fetchAll();
          set({ projects, isLoadingProjects: false });
        } catch (error) {
          console.error('Failed to fetch projects:', error);
          set({ isLoadingProjects: false });
        }
      },

      addProject: async (projectData) => {
        const newProject = await projectsApi.create(projectData);
        set((state) => ({
          projects: [...state.projects, newProject],
        }));
        return newProject.id;
      },

      updateProject: async (id, updates) => {
        const updatedProject = await projectsApi.update(id, updates);
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? updatedProject : p
          ),
        }));
      },

      deleteProject: async (id) => {
        await projectsApi.delete(id);
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
        }));
      },

      selectProject: (id) => {
        const state = get();
        if (id === null) {
          set({
            currentProjectId: null,
            sheetSettings: defaultSheetSettings,
            selectors: defaultSelectors,
            articles: [],
            links: [],
          });
          return;
        }
        const project = state.projects.find((p) => p.id === id);
        if (project) {
          set({
            currentProjectId: id,
            sheetSettings: project.sheetSettings,
            selectors: project.selectors,
            articles: [],
            links: [],
          });
        }
      },

      // 設定アクション
      setSheetSettings: (settings) =>
        set((state) => {
          const newSettings = { ...state.sheetSettings, ...settings };
          // 現在のプロジェクトがあれば、DBも更新
          if (state.currentProjectId) {
            projectsApi.update(state.currentProjectId, { sheetSettings: newSettings }).catch(console.error);
            const updatedProjects = state.projects.map((p) =>
              p.id === state.currentProjectId
                ? { ...p, sheetSettings: newSettings, updatedAt: Date.now() }
                : p
            );
            return { sheetSettings: newSettings, projects: updatedProjects };
          }
          return { sheetSettings: newSettings };
        }),

      addSelector: (selector) =>
        set((state) => {
          const newSelectors = [...state.selectors, selector];
          if (state.currentProjectId) {
            projectsApi.update(state.currentProjectId, { selectors: newSelectors }).catch(console.error);
            const updatedProjects = state.projects.map((p) =>
              p.id === state.currentProjectId
                ? { ...p, selectors: newSelectors, updatedAt: Date.now() }
                : p
            );
            return { selectors: newSelectors, projects: updatedProjects };
          }
          return { selectors: newSelectors };
        }),

      updateSelector: (id, updates) =>
        set((state) => {
          const newSelectors = state.selectors.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          );
          if (state.currentProjectId) {
            projectsApi.update(state.currentProjectId, { selectors: newSelectors }).catch(console.error);
            const updatedProjects = state.projects.map((p) =>
              p.id === state.currentProjectId
                ? { ...p, selectors: newSelectors, updatedAt: Date.now() }
                : p
            );
            return { selectors: newSelectors, projects: updatedProjects };
          }
          return { selectors: newSelectors };
        }),

      removeSelector: (id) =>
        set((state) => {
          const newSelectors = state.selectors.filter((s) => s.id !== id);
          if (state.currentProjectId) {
            projectsApi.update(state.currentProjectId, { selectors: newSelectors }).catch(console.error);
            const updatedProjects = state.projects.map((p) =>
              p.id === state.currentProjectId
                ? { ...p, selectors: newSelectors, updatedAt: Date.now() }
                : p
            );
            return { selectors: newSelectors, projects: updatedProjects };
          }
          return { selectors: newSelectors };
        }),

      toggleSelector: (id) =>
        set((state) => {
          const newSelectors = state.selectors.map((s) =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
          );
          if (state.currentProjectId) {
            projectsApi.update(state.currentProjectId, { selectors: newSelectors }).catch(console.error);
            const updatedProjects = state.projects.map((p) =>
              p.id === state.currentProjectId
                ? { ...p, selectors: newSelectors, updatedAt: Date.now() }
                : p
            );
            return { selectors: newSelectors, projects: updatedProjects };
          }
          return { selectors: newSelectors };
        }),

      // データアクション
      setArticles: (articles) => set({ articles }),
      setLinks: (links) => set({ links }),
      clearData: () => set({ articles: [], links: [] }),

      // クローリング状態アクション
      setCrawlStatus: (status) =>
        set((state) => ({
          crawlStatus: { ...state.crawlStatus, ...status },
        })),

      resetCrawlStatus: () => set({ crawlStatus: defaultCrawlStatus }),
    }),
    {
      name: 'internal-link-checker-storage',
      partialize: (state) => ({
        currentProjectId: state.currentProjectId,
        sheetSettings: state.sheetSettings,
        selectors: state.selectors,
      }),
    }
  )
);

// URLを正規化して比較しやすくする
const normalizeUrl = (url: string): string => {
  if (!url) return '';
  try {
    const urlToParse = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(urlToParse);
    const host = parsed.host.replace(/^www\./, '');
    return (host + parsed.pathname).replace(/\/$/, '').toLowerCase();
  } catch {
    return url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  }
};

// リンクマトリクスを計算するユーティリティ
export function calculateLinkMatrix(articles: Article[], links: InternalLink[]) {
  // 事前に正規化されたURLを持つ記事マップと正規化済みURLリスト
  const normalizedArticles = articles.map(a => ({
    ...a,
    normalizedUrl: normalizeUrl(a.url)
  }));

  const articleUrlMap = new Map<string, Article>();
  normalizedArticles.forEach((article) => {
    articleUrlMap.set(article.normalizedUrl, article);
  });

  const incomingLinksMap = new Map<string, { sourceUrl: string; anchorText: string; sourceArticle?: Article }[]>();
  const linkMap = new Map<string, Set<string>>();

  links.forEach((link) => {
    const sourceNorm = normalizeUrl(link.sourceUrl);
    const targetNorm = normalizeUrl(link.targetUrl);

    if (articleUrlMap.has(sourceNorm) && articleUrlMap.has(targetNorm)) {
      if (!linkMap.has(sourceNorm)) {
        linkMap.set(sourceNorm, new Set());
      }
      linkMap.get(sourceNorm)!.add(targetNorm);

      if (!incomingLinksMap.has(targetNorm)) {
        incomingLinksMap.set(targetNorm, []);
      }
      incomingLinksMap.get(targetNorm)!.push({
        sourceUrl: link.sourceUrl,
        anchorText: link.anchorText,
        sourceArticle: articleUrlMap.get(sourceNorm)
      });
    }
  });

  return {
    normalizedArticles,
    hasLink: (sourceNorm: string, targetNorm: string): boolean => {
      return linkMap.get(sourceNorm)?.has(targetNorm) ?? false;
    },
    getOutgoingLinkCount: (urlNorm: string): number => {
      return linkMap.get(urlNorm)?.size ?? 0;
    },
    getIncomingLinkCount: (urlNorm: string): number => {
      return incomingLinksMap.get(urlNorm)?.length ?? 0;
    },
    getIncomingLinks: (urlNorm: string) => {
      return incomingLinksMap.get(urlNorm) || [];
    }
  };
}
