// ============================================
// Zustand ストア（クライアントサイド状態管理）
// ============================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Campaign,
  Company,
  Article,
  ApiSettings,
  PhaseProgress,
  ResearchResult,
  StrategyData,
  VisibilityScore,
  MonitorResult,
} from "./types";

interface AppState {
  // Settings
  settings: ApiSettings;
  setSettings: (settings: Partial<ApiSettings>) => void;

  // Companies
  companies: Company[];
  addCompany: (company: Company) => void;
  updateCompany: (id: string, data: Partial<Company>) => void;

  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, data: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;

  // Articles
  articles: Article[];
  addArticle: (article: Article) => void;
  updateArticle: (id: string, data: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  getArticlesByCampaign: (campaignId: string) => Article[];

  // Research cache
  researchCache: Record<string, ResearchResult>;
  setResearchCache: (campaignId: string, data: ResearchResult) => void;

  // Strategy cache
  strategyCache: Record<string, StrategyData>;
  setStrategyCache: (campaignId: string, data: StrategyData) => void;

  // Monitor results
  monitorResults: MonitorResult[];
  addMonitorResults: (results: MonitorResult[]) => void;
  getMonitorResultsByCampaign: (campaignId: string) => MonitorResult[];

  // Visibility scores
  visibilityScores: VisibilityScore[];
  setVisibilityScores: (scores: VisibilityScore[]) => void;
  getVisibilityScoresByCampaign: (campaignId: string) => VisibilityScore[];

  // Phase tracking
  currentPhase: PhaseProgress;
  setPhase: (phase: PhaseProgress) => void;
  resetPhase: () => void;

  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Toast
  toasts: { id: string; message: string; type: "success" | "error" | "info" }[];
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

const defaultPhase: PhaseProgress = {
  phase: "idle",
  progress: 0,
  message: "",
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Settings
      settings: {
        gemini_api_key: "",
        serper_api_key: "",
        perplexity_api_key: "",
        openai_api_key: "",
        wordpress_url: "",
        wordpress_username: "",
        wordpress_app_password: "",
      },
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Companies
      companies: [],
      addCompany: (company) =>
        set((state) => ({ companies: [...state.companies, company] })),
      updateCompany: (id, data) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c
          ),
        })),

      // Campaigns
      campaigns: [],
      addCampaign: (campaign) =>
        set((state) => ({ campaigns: [...state.campaigns, campaign] })),
      updateCampaign: (id, data) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c
          ),
        })),
      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
        })),

      // Articles
      articles: [],
      addArticle: (article) =>
        set((state) => ({ articles: [...state.articles, article] })),
      updateArticle: (id, data) =>
        set((state) => ({
          articles: state.articles.map((a) =>
            a.id === id ? { ...a, ...data, updated_at: new Date().toISOString() } : a
          ),
        })),
      deleteArticle: (id) =>
        set((state) => ({
          articles: state.articles.filter((a) => a.id !== id),
        })),
      getArticlesByCampaign: (campaignId) =>
        get().articles.filter((a) => a.campaign_id === campaignId),

      // Research cache
      researchCache: {},
      setResearchCache: (campaignId, data) =>
        set((state) => ({
          researchCache: { ...state.researchCache, [campaignId]: data },
        })),

      // Strategy cache
      strategyCache: {},
      setStrategyCache: (campaignId, data) =>
        set((state) => ({
          strategyCache: { ...state.strategyCache, [campaignId]: data },
        })),

      // Monitor
      monitorResults: [],
      addMonitorResults: (results) =>
        set((state) => ({
          monitorResults: [...state.monitorResults, ...results],
        })),
      getMonitorResultsByCampaign: (campaignId) =>
        get().monitorResults.filter((r) => r.campaign_id === campaignId),

      // Visibility
      visibilityScores: [],
      setVisibilityScores: (scores) =>
        set((state) => ({
          visibilityScores: [
            ...state.visibilityScores.filter(
              (s) => !scores.find((ns) => ns.campaign_id === s.campaign_id && ns.platform === s.platform)
            ),
            ...scores,
          ],
        })),
      getVisibilityScoresByCampaign: (campaignId) =>
        get().visibilityScores.filter((s) => s.campaign_id === campaignId),

      // Phase
      currentPhase: defaultPhase,
      setPhase: (phase) => set({ currentPhase: phase }),
      resetPhase: () => set({ currentPhase: defaultPhase }),

      // UI
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Toasts
      toasts: [],
      addToast: (message, type = "info") => {
        const id = Math.random().toString(36).slice(2);
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }));
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }, 4000);
      },
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "llmo-tool-storage",
      partialize: (state) => ({
        settings: state.settings,
        companies: state.companies,
        campaigns: state.campaigns,
        articles: state.articles,
        researchCache: state.researchCache,
        strategyCache: state.strategyCache,
        monitorResults: state.monitorResults.slice(-500),
        visibilityScores: state.visibilityScores,
      }),
    }
  )
);
