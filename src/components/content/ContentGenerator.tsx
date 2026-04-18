"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { generateArticle } from "@/lib/api";
import { generateId } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import CitableScoreBadge from "@/components/content/CitableScoreBadge";
import type { Article, ContentBrief, GeneratedArticle } from "@/lib/types";

interface Props {
  campaignId: string;
  companyName: string;
  companyData: any;
  brief?: ContentBrief;
  onComplete?: (article: Article) => void;
}

export default function ContentGenerator({
  campaignId,
  companyName,
  companyData,
  brief,
  onComplete,
}: Props) {
  const settings = useStore((s) => s.settings);
  const addArticle = useStore((s) => s.addArticle);
  const addToast = useStore((s) => s.addToast);

  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedArticle | null>(null);

  const [customTitle, setCustomTitle] = useState(brief?.title_draft || "");
  const [customKw, setCustomKw] = useState(brief?.target_keyword || "");
  const [customType, setCustomType] = useState(brief?.content_type || "comparison");

  const handleGenerate = async () => {
    if (!settings.gemini_api_key) {
      addToast("Gemini APIキーが必要です", "error");
      return;
    }

    setLoading(true);
    try {
      const theBrief = brief || {
        title_draft: customTitle,
        target_keyword: customKw,
        content_type: customType,
        target_platform: ["chatgpt", "perplexity", "google_aio", "google_gemini"],
        citable_elements: {
          needs_comparison_table: true,
          needs_faq: true,
          needs_statistics: true,
          needs_expert_quotes: false,
        },
        distribution: ["blog"],
      };

      const result = await generateArticle(
        settings,
        theBrief,
        companyName,
        companyData
      );

      setGenerated(result);

      // Save to store
      const article: Article = {
        id: generateId(),
        campaign_id: campaignId,
        title: result.title,
        meta_description: result.meta_description,
        slug: result.slug,
        content_markdown: result.content_markdown,
        bluf_statement: result.bluf_statement,
        entity_mentions: result.entity_mentions,
        faq_count: result.faq_count,
        comparison_tables: result.comparison_tables,
        citations_count: result.citations_count,
        word_count: result.word_count,
        article_schema: JSON.stringify(result.schema?.article),
        faq_schema: JSON.stringify(result.schema?.faq),
        status: "draft",
        reddit_draft: result.distribution_drafts?.reddit,
        quora_draft: result.distribution_drafts?.quora,
        linkedin_draft: result.distribution_drafts?.linkedin,
        medium_draft: result.distribution_drafts?.medium,
        quality_score: result.quality_score || 0,
        citable_score: result.citable_score,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addArticle(article);
      addToast("記事を生成しました", "success");

      if (onComplete) onComplete(article);
    } catch (err: any) {
      addToast(err.message || "記事生成に失敗しました", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!brief && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs text-cb-sub tracking-wider uppercase mb-2 font-noto">
              記事タイトル案
            </label>
            <input
              className="w-full bg-cb-surface border border-cb-border px-4 py-3 text-sm text-cb-text placeholder:text-cb-sub/50 font-noto font-light focus:border-cb-cyan transition-colors"
              placeholder="例：自動広告運用おすすめ企業10選【2026年最新比較】"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-cb-sub tracking-wider uppercase mb-2 font-noto">
              ターゲットキーワード
            </label>
            <input
              className="w-full bg-cb-surface border border-cb-border px-4 py-3 text-sm text-cb-text placeholder:text-cb-sub/50 font-noto font-light focus:border-cb-cyan transition-colors"
              placeholder="例：自動広告運用 おすすめ"
              value={customKw}
              onChange={(e) => setCustomKw(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-cb-sub tracking-wider uppercase mb-2 font-noto">
              コンテンツタイプ
            </label>
            <select
              className="w-full bg-cb-surface border border-cb-border px-4 py-3 text-sm text-cb-text font-noto font-light appearance-none focus:border-cb-cyan transition-colors"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
            >
              <option value="comparison">比較記事</option>
              <option value="guide">ガイド</option>
              <option value="faq">FAQ</option>
              <option value="case_study">事例紹介</option>
              <option value="report">レポート</option>
            </select>
          </div>
        </div>
      )}

      <Button
        variant="primary"
        onClick={handleGenerate}
        loading={loading}
        disabled={loading}
        className="w-full"
      >
        {loading ? "CITABLE記事を生成中..." : "CITABLE準拠記事を生成"}
      </Button>

      {loading && (
        <div className="mt-6 flex items-center gap-3 text-sm text-cb-sub font-noto">
          <Spinner size={16} />
          <span>
            AI がCITABLEフレームワークに準拠した記事を生成しています...
          </span>
        </div>
      )}

      {generated && (
        <div className="mt-8 border border-cb-border">
          <div className="px-6 py-4 border-b border-cb-border flex items-center justify-between">
            <span className="text-xs text-cb-sub tracking-wider uppercase font-noto">
              Generated Article
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-cb-sub font-noto">CITABLE Score</span>
              <CitableScoreBadge score={generated.citable_score} size="sm" />
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-noto text-cb-text">{generated.title}</h3>
            <p className="text-xs text-cb-sub mt-2 font-noto">
              {generated.meta_description}
            </p>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-px bg-cb-border">
              {[
                { label: "文字数", value: generated.word_count },
                { label: "企業言及", value: generated.entity_mentions },
                { label: "FAQ数", value: generated.faq_count },
                { label: "比較表", value: generated.comparison_tables },
                { label: "出典数", value: generated.citations_count },
              ].map((stat) => (
                <div key={stat.label} className="bg-cb-black p-3 text-center">
                  <div className="text-[10px] text-cb-sub font-noto">{stat.label}</div>
                  <div className="text-sm font-chakra text-cb-text mt-1">{stat.value}</div>
                </div>
              ))}
            </div>

            {generated.content_markdown && (
              <details className="mt-4">
                <summary className="text-xs text-cb-cyan cursor-pointer font-noto hover:underline">
                  記事本文を表示 (Markdown)
                </summary>
                <pre className="mt-3 p-4 bg-cb-surface border border-cb-border text-xs text-cb-sub overflow-auto max-h-96 font-noto whitespace-pre-wrap">
                  {generated.content_markdown}
                </pre>
              </details>
            )}

            {generated.distribution_drafts && (
              <details className="mt-3">
                <summary className="text-xs text-cb-cyan cursor-pointer font-noto hover:underline">
                  配信ドラフトを表示
                </summary>
                <div className="mt-3 space-y-3">
                  {Object.entries(generated.distribution_drafts).map(([platform, draft]) =>
                    draft ? (
                      <div key={platform} className="border border-cb-border p-4">
                        <div className="text-[10px] text-cb-sub tracking-wider uppercase font-chakra mb-2">
                          {platform}
                        </div>
                        <p className="text-xs text-cb-sub font-noto whitespace-pre-wrap">
                          {draft}
                        </p>
                      </div>
                    ) : null
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
