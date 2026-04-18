// ============================================
// 型定義（全体）
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  created_at: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
  name_en?: string;
  website?: string;
  description?: string;
  business_category?: string;
  strengths?: string[];
  uvp?: string;
  competitors?: Competitor[];
  target_audience?: TargetPersona[];
  social_links?: string[];
  wikipedia_url?: string;
  schema_org_data?: string;
  llms_txt_content?: string;
  created_at: string;
  updated_at: string;
}

export interface Competitor {
  name: string;
  strengths: string;
  weaknesses: string;
}

export interface TargetPersona {
  name: string;
  description: string;
  search_behavior: string;
}

export interface Campaign {
  id: string;
  company_id: string;
  company_name?: string;
  name: string;
  goal?: string;
  status: "draft" | "active" | "paused" | "completed";
  strategy_data?: StrategyData;
  platform_targets?: string[];
  keyword_count?: number;
  article_count?: number;
  avg_visibility_score?: number;
  created_at: string;
  updated_at: string;
}

export interface StrategyData {
  platform_strategies: {
    chatgpt: PlatformStrategy;
    perplexity: PlatformStrategy;
    google_aio: PlatformStrategy;
    google_gemini: PlatformStrategy;
  };
  keyword_clusters: KeywordCluster[];
  content_calendar: ContentCalendarWeek[];
  entity_optimization: EntityOptimization;
  distribution_matrix: Record<string, DistributionChannel>;
  freshness_schedule: FreshnessSchedule;
}

export interface PlatformStrategy {
  priority_keywords: string[];
  content_tactics: string[];
  key_channels: string[];
}

export interface KeywordCluster {
  cluster_name: string;
  pillar_keyword: string;
  supporting_keywords: string[];
  longtail_keywords: string[];
  content_type: string;
  target_platforms: string[];
  priority: number;
}

export interface ContentCalendarWeek {
  week: number;
  articles: ContentBrief[];
}

export interface ContentBrief {
  title_draft: string;
  target_keyword: string;
  content_type: string;
  target_platform: string[];
  citable_elements: {
    needs_comparison_table: boolean;
    needs_faq: boolean;
    needs_statistics: boolean;
    needs_expert_quotes: boolean;
  };
  distribution: string[];
}

export interface EntityOptimization {
  schema_types_needed: string[];
  wikipedia_action: string;
  google_business_profile: string;
  llms_txt_structure: string;
}

export interface DistributionChannel {
  frequency: string;
  strategy: string;
  priority?: string;
}

export interface FreshnessSchedule {
  pillar_content_refresh: string;
  supporting_content_refresh: string;
  monitoring_frequency: string;
}

export interface Keyword {
  id: string;
  campaign_id: string;
  keyword: string;
  keyword_type: "main" | "support" | "longtail";
  search_volume?: number;
  difficulty?: number;
  intent?: "informational" | "commercial" | "transactional";
  target_platform?: string;
  cluster_name?: string;
  priority: number;
  created_at: string;
}

export interface Article {
  id: string;
  campaign_id: string;
  keyword_id?: string;
  title: string;
  meta_description?: string;
  slug?: string;
  content_markdown?: string;
  content_html?: string;
  bluf_statement?: string;
  entity_mentions: number;
  faq_count: number;
  comparison_tables: number;
  citations_count: number;
  word_count: number;
  article_schema?: string;
  faq_schema?: string;
  status: "draft" | "review" | "published" | "distributed";
  published_url?: string;
  published_at?: string;
  publish_platform?: string;
  reddit_draft?: string;
  quora_draft?: string;
  linkedin_draft?: string;
  medium_draft?: string;
  press_release_draft?: string;
  quality_score: number;
  citable_score: number;
  last_refreshed?: string;
  created_at: string;
  updated_at: string;
}

export interface MonitorResult {
  id: string;
  campaign_id: string;
  keyword_id?: string;
  query_text: string;
  platform: "chatgpt" | "perplexity" | "gemini" | "google_aio";
  brand_mentioned: boolean;
  mention_position: number;
  mention_context?: string;
  sentiment: "positive" | "neutral" | "negative";
  competitors_mentioned?: { name: string; position: number; sentiment: string }[];
  cited_urls?: string[];
  response_full_text?: string;
  checked_at: string;
}

export interface VisibilityScore {
  id: string;
  campaign_id: string;
  platform: string;
  score: number;
  mention_rate: number;
  share_of_voice?: number;
  avg_position: number;
  positive_ratio: number;
  period_start?: string;
  period_end?: string;
  created_at: string;
}

export interface ResearchResult {
  company: {
    core_business: string[];
    uvp: string;
    target_personas: TargetPersona[];
    competitors: Competitor[];
    industry_trends: string[];
    entity_info: {
      type: string;
      founding_year: string;
      location: string;
      known_for: string[];
    };
    wikipedia_potential: string;
    initial_brand_keywords: string[];
  };
  serpAnalysis: SerpResult[];
  visibility: {
    keyword_visibility: KeywordVisibility[];
  };
  timestamp: string;
}

export interface SerpResult {
  keyword: string;
  serp: any;
  aiOverview: {
    hasAIOverview: boolean;
    aiOverviewText: string | null;
    aiOverviewSources: any[];
    organicResults: any[];
    relatedSearches: any[];
  };
}

export interface KeywordVisibility {
  keyword: string;
  ranking: {
    company: string;
    rank: number;
    reason: string;
    estimated_mention_rate: number;
  }[];
  our_position: number;
  gap_analysis: string;
}

export interface GeneratedArticle {
  title: string;
  meta_description: string;
  slug: string;
  bluf_statement: string;
  content_markdown: string;
  word_count: number;
  entity_mentions: number;
  faq_count: number;
  comparison_tables: number;
  citations_count: number;
  citable_score: number;
  quality_score?: number;
  schema: {
    article: any;
    faq: any;
  };
  distribution_drafts: {
    reddit: string;
    quora: string;
    linkedin: string;
    medium: string;
  };
}

export interface ApiSettings {
  gemini_api_key: string;
  serper_api_key: string;
  perplexity_api_key: string;
  openai_api_key: string;
  wordpress_url: string;
  wordpress_username: string;
  wordpress_app_password: string;
}

export type ProcessingPhase =
  | "idle"
  | "researching"
  | "analyzing"
  | "strategizing"
  | "generating"
  | "publishing"
  | "monitoring"
  | "complete"
  | "error";

export interface PhaseProgress {
  phase: ProcessingPhase;
  progress: number;
  message: string;
  detail?: string;
}
