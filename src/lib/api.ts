// ============================================
// API クライアント（Gemini / Serper / Monitor直接呼び出し）
// ============================================

import type {
  ApiSettings,
  ResearchResult,
  StrategyData,
  GeneratedArticle,
  MonitorResult,
} from "./types";
import { generateId, parseJsonSafe } from "./utils";

// ============================================
// Gemini API 呼び出し
// ============================================
async function callGemini(
  apiKey: string,
  model: string,
  prompt: string,
  config?: { temperature?: number; maxOutputTokens?: number; responseMimeType?: string }
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: config?.temperature ?? 0.7,
      maxOutputTokens: config?.maxOutputTokens ?? 8192,
    },
  };

  if (config?.responseMimeType) {
    body.generationConfig.responseMimeType = config.responseMimeType;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

// ============================================
// Serper.dev SERP取得
// ============================================
async function fetchSERP(
  apiKey: string,
  query: string,
  gl: string = "jp",
  hl: string = "ja"
): Promise<any> {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, gl, hl, num: 20 }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Serper API error (${res.status}): ${err}`);
  }

  return res.json();
}

// ============================================
// Phase 1: 企業リサーチ
// ============================================
export async function runResearch(
  settings: ApiSettings,
  companyName: string,
  businessDescription: string,
  website: string,
  targetKeywords: string[]
): Promise<ResearchResult> {
  // 1) 企業分析
  const companyPrompt = `
あなたはLLMO（AI検索最適化）の専門アナリストです。

以下の企業を徹底分析し、AI検索で推薦されるための基礎情報を整理してください。

## 企業情報
- 企業名: ${companyName}
- 事業概要: ${businessDescription}
- Website: ${website || "不明"}

## 分析項目
1. **コア事業領域**: この企業の主力事業を3-5個
2. **独自の強み (UVP)**: 競合と差別化できるポイント
3. **ターゲット顧客**: 誰がこのサービスを使うか（ペルソナ3つ）
4. **競合企業**: 同領域の主要競合5-10社（可能な限り具体名）
5. **業界トレンド**: この業界で今AIが語りやすいトピック
6. **エンティティ情報**: AIが認識しやすい企業の属性
7. **Wikidata/Wikipedia登録可能性**: この企業の注目度

以下のJSON形式で出力してください:
\`\`\`json
{
  "core_business": ["事業1", "事業2"],
  "uvp": "独自価値提案の文章",
  "target_personas": [
    {"name": "ペルソナ名", "description": "説明", "search_behavior": "AIにどう質問するか"}
  ],
  "competitors": [
    {"name": "競合名", "strengths": "強み", "weaknesses": "弱み"}
  ],
  "industry_trends": ["トレンド1", "トレンド2"],
  "entity_info": {
    "type": "Organization",
    "founding_year": "",
    "location": "",
    "known_for": []
  },
  "wikipedia_potential": "high/medium/low",
  "initial_brand_keywords": ["ブランドKW1", "ブランドKW2"]
}
\`\`\``;

  const companyText = await callGemini(
    settings.gemini_api_key,
    "gemini-2.5-flash-preview-04-17",
    companyPrompt,
    { temperature: 0.3, maxOutputTokens: 4096 }
  );

  const companyData = parseJsonSafe(companyText, {
    core_business: [],
    uvp: "",
    target_personas: [],
    competitors: [],
    industry_trends: [],
    entity_info: { type: "Organization", founding_year: "", location: "", known_for: [] },
    wikipedia_potential: "low",
    initial_brand_keywords: [],
  });

  // 2) SERP分析（最大5KWを並列実行）
  const kwSlice = targetKeywords.slice(0, 5);
  let serpResults: any[] = [];

  if (settings.serper_api_key) {
    const serpPromises = kwSlice.map(async (kw) => {
      try {
        const serp = await fetchSERP(settings.serper_api_key, kw);
        return {
          keyword: kw,
          serp,
          aiOverview: {
            hasAIOverview: !!serp.aiOverview,
            aiOverviewText: serp.aiOverview?.text || null,
            aiOverviewSources: serp.aiOverview?.sources || [],
            organicResults: (serp.organic || []).slice(0, 10),
            relatedSearches: serp.relatedSearches || [],
          },
        };
      } catch {
        return { keyword: kw, serp: null, aiOverview: { hasAIOverview: false, aiOverviewText: null, aiOverviewSources: [], organicResults: [], relatedSearches: [] } };
      }
    });
    serpResults = await Promise.all(serpPromises);
  }

  // 3) 競合のAI可視性シミュレーション
  const visibilityPrompt = `
以下のキーワードについて、AI検索で質問された場合にどの企業が言及されやすいかを分析してください。

キーワード: ${targetKeywords.join(", ")}
対象企業: ${companyName}
競合: ${companyData.competitors.map((c: any) => c.name).join(", ")}

各キーワードについて、AI検索で推奨される可能性が高い順に企業をランク付けし、その理由を述べてください。

JSON形式で出力:
\`\`\`json
{
  "keyword_visibility": [
    {
      "keyword": "KW",
      "ranking": [
        {"company": "企業名", "rank": 1, "reason": "理由", "estimated_mention_rate": 80}
      ],
      "our_position": 5,
      "gap_analysis": "何が足りないか"
    }
  ]
}
\`\`\``;

  const visibilityText = await callGemini(
    settings.gemini_api_key,
    "gemini-2.5-flash-preview-04-17",
    visibilityPrompt,
    { temperature: 0.3 }
  );

  const visibility = parseJsonSafe(visibilityText, { keyword_visibility: [] });

  return {
    company: companyData,
    serpAnalysis: serpResults,
    visibility,
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// Phase 2: 戦略策定
// ============================================
export async function runStrategy(
  settings: ApiSettings,
  researchData: ResearchResult,
  companyName: string
): Promise<StrategyData> {
  const strategyPrompt = `
あなたはLLMO/GEO/AEOの世界的専門家です。

## 背景データ
### 企業情報
${JSON.stringify(researchData.company, null, 2)}

### AI可視性分析
${JSON.stringify(researchData.visibility, null, 2)}

## 重要な事実
- ChatGPTはWikipedia(47.9%)とBing結果(87%一致)を重視
- PerplexityはReddit(46.7%)を最も引用、30日超コンテンツは引用40%減
- Google AI OverviewはTOP10外から62%を引用、extractability?が最重要
- Google GeminiはMedium(28%)とYouTube(29%)を重視
- 商用クエリの86%の引用はブランドが制御可能
- FAQ付きコンテンツは平均4.9回AI引用される
- 見出し階層構造のコンテンツはChatGPTで3倍引用されやすい

## 目標
「${companyName}」が全主要AIプラットフォームで推奨企業として表示されること。

以下のJSONを正確に出力してください:
\`\`\`json
{
  "platform_strategies": {
    "chatgpt": {
      "priority_keywords": ["KW1", "KW2", "KW3"],
      "content_tactics": ["戦術1", "戦術2"],
      "key_channels": ["チャネル1"]
    },
    "perplexity": {
      "priority_keywords": [],
      "content_tactics": [],
      "key_channels": []
    },
    "google_aio": {
      "priority_keywords": [],
      "content_tactics": [],
      "key_channels": []
    },
    "google_gemini": {
      "priority_keywords": [],
      "content_tactics": [],
      "key_channels": []
    }
  },
  "keyword_clusters": [
    {
      "cluster_name": "クラスター名",
      "pillar_keyword": "主要KW",
      "supporting_keywords": ["サポートKW1", "サポートKW2"],
      "longtail_keywords": ["ロングテールKW1"],
      "content_type": "comparison",
      "target_platforms": ["chatgpt", "perplexity"],
      "priority": 1
    }
  ],
  "content_calendar": [
    {
      "week": 1,
      "articles": [
        {
          "title_draft": "仮タイトル",
          "target_keyword": "KW",
          "content_type": "comparison",
          "target_platform": ["chatgpt", "perplexity"],
          "citable_elements": {
            "needs_comparison_table": true,
            "needs_faq": true,
            "needs_statistics": true,
            "needs_expert_quotes": false
          },
          "distribution": ["blog", "reddit_draft"]
        }
      ]
    }
  ],
  "entity_optimization": {
    "schema_types_needed": ["Organization", "Article", "FAQPage"],
    "wikipedia_action": "アクション",
    "google_business_profile": "最適化方針",
    "llms_txt_structure": "構造説明"
  },
  "distribution_matrix": {
    "blog": {"frequency": "weekly", "strategy": "メイン配信先", "priority": "highest"},
    "reddit": {"frequency": "2x/week", "strategy": "自然な言及"},
    "linkedin": {"frequency": "weekly", "strategy": "ビジネス向け"},
    "medium": {"frequency": "2x/month", "strategy": "Gemini対策"}
  },
  "freshness_schedule": {
    "pillar_content_refresh": "14 days",
    "supporting_content_refresh": "30 days",
    "monitoring_frequency": "weekly"
  }
}
\`\`\``;

  const result = await callGemini(
    settings.gemini_api_key,
    "gemini-2.5-flash-preview-04-17",
    strategyPrompt,
    { temperature: 0.4, maxOutputTokens: 8192 }
  );

  return parseJsonSafe<StrategyData>(result, {
    platform_strategies: {
      chatgpt: { priority_keywords: [], content_tactics: [], key_channels: [] },
      perplexity: { priority_keywords: [], content_tactics: [], key_channels: [] },
      google_aio: { priority_keywords: [], content_tactics: [], key_channels: [] },
      google_gemini: { priority_keywords: [], content_tactics: [], key_channels: [] },
    },
    keyword_clusters: [],
    content_calendar: [],
    entity_optimization: {
      schema_types_needed: [],
      wikipedia_action: "",
      google_business_profile: "",
      llms_txt_structure: "",
    },
    distribution_matrix: {},
    freshness_schedule: {
      pillar_content_refresh: "14 days",
      supporting_content_refresh: "30 days",
      monitoring_frequency: "weekly",
    },
  });
}

// ============================================
// Phase 3: 記事生成
// ============================================
export async function generateArticle(
  settings: ApiSettings,
  contentBrief: any,
  companyName: string,
  companyData: any
): Promise<GeneratedArticle> {
  const today = new Date().toISOString().split("T")[0];
  const targetPlatforms = contentBrief.target_platform?.join(", ") || "all";

  const prompt = `
あなたはLLMO/GEO最適化コンテンツの専門ライターです。
AIに引用されるためのCITABLEフレームワークに完全準拠した記事を生成します。

## CITABLEフレームワーク（厳守）

### C - Clear entity & structure
- 冒頭2-3文で「${companyName}」を明示し、核心的な回答を述べる
- 曖昧な導入文は絶対に書かない

### I - Intent architecture
- メイン質問 + 3-5個の「次に聞かれるであろう」質問にも回答する

### T - Third-party validation
- 業界データ、公的統計、第三者評価を引用する

### A - Answer grounding
- すべての事実に出典URLまたは出典名を明示する

### B - Block-structured for RAG
- 200-400語のセクションに分割
- H2/H3見出し（質問形式を優先）
- 比較テーブルを必ず1つ以上含める
- FAQ形式セクションを記事末尾に含める

### L - Latest & consistent
- 「Updated: ${today}」を冒頭に含める

### E - Entity graph & schema
- 企業名を明確なエンティティとして記述

## プラットフォーム最適化: ${targetPlatforms}

## 記事ブリーフ
- タイトル案: ${contentBrief.title_draft}
- ターゲットKW: ${contentBrief.target_keyword}
- コンテンツタイプ: ${contentBrief.content_type}
- 比較テーブル必須: ${contentBrief.citable_elements?.needs_comparison_table}
- FAQ必須: ${contentBrief.citable_elements?.needs_faq}

## 企業情報
- 企業名: ${companyName}
- UVP: ${companyData?.uvp || ""}
- 事業領域: ${(companyData?.core_business || []).join(", ")}

以下のJSON形式で出力（JSONのみ、前後に余計なテキスト不要）:
{
  "title": "SEOタイトル（32文字以内 日本語）",
  "meta_description": "メタディスクリプション（120文字以内 日本語）",
  "slug": "url-friendly-slug",
  "bluf_statement": "冒頭のBLUF文（2-3文）",
  "content_markdown": "完全な記事本文をMarkdownで",
  "word_count": 3000,
  "entity_mentions": 8,
  "faq_count": 5,
  "comparison_tables": 1,
  "citations_count": 10,
  "citable_score": 85,
  "schema": {
    "article": {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "タイトル",
      "datePublished": "${today}",
      "dateModified": "${today}",
      "author": {"@type": "Organization", "name": "${companyName}"}
    },
    "faq": null
  },
  "distribution_drafts": {
    "reddit": "Reddit投稿用ドラフト（宣伝感ゼロ）",
    "quora": "Quora回答ドラフト",
    "linkedin": "LinkedIn記事ドラフト",
    "medium": "Medium記事ドラフト"
  }
}`;

  const result = await callGemini(
    settings.gemini_api_key,
    "gemini-2.5-flash-preview-04-17",
    prompt,
    { temperature: 0.7, maxOutputTokens: 8192 }
  );

  const article = parseJsonSafe<GeneratedArticle>(result, {
    title: contentBrief.title_draft || "Untitled",
    meta_description: "",
    slug: "",
    bluf_statement: "",
    content_markdown: "",
    word_count: 0,
    entity_mentions: 0,
    faq_count: 0,
    comparison_tables: 0,
    citations_count: 0,
    citable_score: 0,
    schema: { article: null, faq: null },
    distribution_drafts: { reddit: "", quora: "", linkedin: "", medium: "" },
  });

  // Calculate quality score
  article.quality_score = calculateQualityScore(article);

  return article;
}

function calculateQualityScore(article: GeneratedArticle): number {
  let score = 0;
  if (article.bluf_statement && article.bluf_statement.length > 30) score += 15;
  if (article.entity_mentions >= 3 && article.entity_mentions <= 15) score += 15;
  if (article.faq_count >= 3) score += 15;
  if (article.comparison_tables >= 1) score += 15;
  if (article.citations_count >= 5) score += 10;
  if (article.word_count >= 2000) score += 10;

  const md = article.content_markdown || "";
  if ((md.match(/^## /gm) || []).length >= 5) score += 5;
  if ((md.match(/^### /gm) || []).length >= 3) score += 5;
  if (md.includes("|") && md.includes("---")) score += 5;
  if (md.includes("Updated:") || md.includes("更新日:")) score += 5;

  return Math.min(score, 100);
}

// ============================================
// Phase 6: モニタリング
// ============================================
export async function runMonitoring(
  settings: ApiSettings,
  campaignId: string,
  companyName: string,
  keywords: string[],
  competitors: string[]
): Promise<MonitorResult[]> {
  const results: MonitorResult[] = [];

  for (const kw of keywords.slice(0, 10)) {
    const queries = [
      `${kw} おすすめ企業は？`,
      `${kw} 比較 ランキング`,
    ];

    for (const query of queries) {
      // Gemini check
      try {
        const geminiResponse = await callGemini(
          settings.gemini_api_key,
          "gemini-2.0-flash",
          query,
          { temperature: 0.3, maxOutputTokens: 2048 }
        );

        const analysis = await analyzeResponse(
          settings,
          geminiResponse,
          companyName,
          competitors
        );

        results.push({
          id: generateId(),
          campaign_id: campaignId,
          query_text: query,
          platform: "gemini",
          brand_mentioned: analysis.brand_mentioned,
          mention_position: analysis.mention_position,
          mention_context: analysis.mention_context,
          sentiment: analysis.sentiment,
          competitors_mentioned: analysis.competitors_mentioned,
          response_full_text: geminiResponse,
          checked_at: new Date().toISOString(),
        });
      } catch (e) {
        // Skip if error
      }

      // Perplexity check
      if (settings.perplexity_api_key) {
        try {
          const pRes = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${settings.perplexity_api_key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "sonar",
              messages: [{ role: "user", content: query }],
            }),
          });

          if (pRes.ok) {
            const pData = await pRes.json();
            const pText = pData.choices?.[0]?.message?.content || "";
            const pCitations = pData.citations || [];

            const analysis = await analyzeResponse(
              settings,
              pText,
              companyName,
              competitors
            );

            results.push({
              id: generateId(),
              campaign_id: campaignId,
              query_text: query,
              platform: "perplexity",
              brand_mentioned: analysis.brand_mentioned,
              mention_position: analysis.mention_position,
              mention_context: analysis.mention_context,
              sentiment: analysis.sentiment,
              competitors_mentioned: analysis.competitors_mentioned,
              cited_urls: pCitations,
              response_full_text: pText,
              checked_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          // Skip
        }
      }

      // ChatGPT check
      if (settings.openai_api_key) {
        try {
          const oRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${settings.openai_api_key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [{ role: "user", content: query }],
            }),
          });

          if (oRes.ok) {
            const oData = await oRes.json();
            const oText = oData.choices?.[0]?.message?.content || "";

            const analysis = await analyzeResponse(
              settings,
              oText,
              companyName,
              competitors
            );

            results.push({
              id: generateId(),
              campaign_id: campaignId,
              query_text: query,
              platform: "chatgpt",
              brand_mentioned: analysis.brand_mentioned,
              mention_position: analysis.mention_position,
              mention_context: analysis.mention_context,
              sentiment: analysis.sentiment,
              competitors_mentioned: analysis.competitors_mentioned,
              response_full_text: oText,
              checked_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          // Skip
        }
      }

      // AI Overview via Serper
      if (settings.serper_api_key) {
        try {
          const serpData = await fetchSERP(settings.serper_api_key, query);
          if (serpData.aiOverview?.text) {
            const analysis = await analyzeResponse(
              settings,
              serpData.aiOverview.text,
              companyName,
              competitors
            );

            results.push({
              id: generateId(),
              campaign_id: campaignId,
              query_text: query,
              platform: "google_aio",
              brand_mentioned: analysis.brand_mentioned,
              mention_position: analysis.mention_position,
              mention_context: analysis.mention_context,
              sentiment: analysis.sentiment,
              competitors_mentioned: analysis.competitors_mentioned,
              cited_urls: serpData.aiOverview.sources?.map((s: any) => s.link) || [],
              response_full_text: serpData.aiOverview.text,
              checked_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          // Skip
        }
      }
    }
  }

  return results;
}

async function analyzeResponse(
  settings: ApiSettings,
  responseText: string,
  companyName: string,
  competitors: string[]
): Promise<{
  brand_mentioned: boolean;
  mention_position: number;
  mention_context: string;
  sentiment: "positive" | "neutral" | "negative";
  competitors_mentioned: { name: string; position: number; sentiment: string }[];
}> {
  // Quick text-based check first
  const lowerText = responseText.toLowerCase();
  const lowerCompany = companyName.toLowerCase();
  const mentioned = lowerText.includes(lowerCompany);

  if (!mentioned && competitors.length === 0) {
    return {
      brand_mentioned: false,
      mention_position: 0,
      mention_context: "",
      sentiment: "neutral",
      competitors_mentioned: [],
    };
  }

  const prompt = `
以下のAI応答を分析してください。

テキスト:
"""
${responseText.slice(0, 3000)}
"""

対象企業: ${companyName}
競合: ${competitors.join(", ")}

以下のJSONのみ出力:
{
  "brand_mentioned": true,
  "mention_position": 1,
  "mention_context": "言及された文脈",
  "sentiment": "positive",
  "competitors_mentioned": [
    {"name": "競合名", "position": 2, "sentiment": "neutral"}
  ]
}`;

  try {
    const result = await callGemini(
      settings.gemini_api_key,
      "gemini-2.0-flash",
      prompt,
      { temperature: 0.1, maxOutputTokens: 1024 }
    );

    return parseJsonSafe(result, {
      brand_mentioned: mentioned,
      mention_position: mentioned ? 1 : 0,
      mention_context: "",
      sentiment: "neutral" as const,
      competitors_mentioned: [],
    });
  } catch {
    return {
      brand_mentioned: mentioned,
      mention_position: mentioned ? 1 : 0,
      mention_context: "",
      sentiment: "neutral",
      competitors_mentioned: [],
    };
  }
}

// ============================================
// WordPress 公開
// ============================================
export async function publishToWordPress(
  article: any,
  wpConfig: { url: string; username: string; app_password: string }
): Promise<{ published_url: string; post_id: number }> {
  const auth = btoa(`${wpConfig.username}:${wpConfig.app_password}`);

  const schemaScript = article.article_schema
    ? `<script type="application/ld+json">${JSON.stringify(article.article_schema)}</script>`
    : "";

  const response = await fetch(`${wpConfig.url}/wp-json/wp/v2/posts`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: article.title,
      content: schemaScript + (article.content_html || article.content_markdown || ""),
      slug: article.slug,
      status: "draft",
      excerpt: article.meta_description,
    }),
  });

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status}`);
  }

  const result = await response.json();
  return {
    published_url: result.link,
    post_id: result.id,
  };
}
