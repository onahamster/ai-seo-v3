"use client";

import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import Link from "next/link";
import Button from "@/components/ui/Button";
import StatsGrid from "@/components/dashboard/StatsGrid";
import PlatformScores from "@/components/dashboard/PlatformScores";

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const campaigns = useStore((s) => s.campaigns);
  const articles = useStore((s) => s.articles);
  const visibilityScores = useStore((s) => s.visibilityScores);
  const researchCache = useStore((s) => s.researchCache);
  const strategyCache = useStore((s) => s.strategyCache);

  const campaign = campaigns.find((c) => c.id === id);
  const campaignArticles = articles.filter((a) => a.campaign_id === id);
  const campaignScores = visibilityScores.filter((s) => s.campaign_id === id);
  const research = researchCache[id];
  const strategy = strategyCache[id];

  if (!campaign) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-cb-sub font-noto">キャンペーンが見つかりません</p>
        <Link href="/campaigns/" className="inline-block mt-4">
          <Button variant="secondary" size="sm">
            一覧へ戻る
          </Button>
        </Link>
      </div>
    );
  }

  const stats = [
    { label: "キーワード数", value: campaign.keyword_count || 0 },
    { label: "生成記事数", value: campaignArticles.length },
    {
      label: "公開済み",
      value: campaignArticles.filter((a) => a.status === "published").length,
    },
    {
      label: "平均CITABLEスコア",
      value:
        campaignArticles.length > 0
          ? Math.round(
              campaignArticles.reduce((s, a) => s + a.citable_score, 0) /
                campaignArticles.length
            )
          : "—",
      accent: true,
    },
  ];

  const navLinks = [
    { href: `/campaigns/${id}/strategy/`, label: "Strategy", labelJp: "戦略" },
    { href: `/campaigns/${id}/content/`, label: "Content", labelJp: "記事生成" },
    { href: `/campaigns/${id}/distribute/`, label: "Distribute", labelJp: "配信" },
    { href: `/campaigns/${id}/monitor/`, label: "Monitor", labelJp: "モニタリング" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/campaigns/"
          className="text-xs text-cb-sub hover:text-cb-cyan transition-colors font-noto"
        >
          ← Campaigns
        </Link>
        <h1 className="text-2xl font-noto font-light text-cb-text mt-3">
          {campaign.name}
        </h1>
        {campaign.goal && (
          <p className="text-sm text-cb-sub mt-2 font-noto">{campaign.goal}</p>
        )}
      </div>

      {/* Nav */}
      <div className="flex gap-0 border-b border-cb-border overflow-x-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-5 py-3 text-xs text-cb-sub hover:text-cb-text border-b-2 border-transparent hover:border-cb-cyan transition-all font-noto whitespace-nowrap"
          >
            <span className="font-chakra text-[10px] tracking-wider uppercase opacity-50 block">
              {link.label}
            </span>
            <span className="mt-0.5 block">{link.labelJp}</span>
          </Link>
        ))}
      </div>

      <StatsGrid stats={stats} />

      {campaignScores.length > 0 && <PlatformScores scores={campaignScores} />}

      {/* Research summary */}
      {research && (
        <div className="border border-cb-border">
          <div className="px-6 py-4 border-b border-cb-border">
            <span className="text-xs text-cb-sub tracking-wider uppercase font-noto">
              Research Summary
            </span>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xs text-cb-sub font-noto mb-2">独自の強み (UVP)</h3>
              <p className="text-sm text-cb-text font-noto">{research.company.uvp}</p>
            </div>

            {research.company.competitors?.length > 0 && (
              <div>
                <h3 className="text-xs text-cb-sub font-noto mb-2">検出された競合</h3>
                <div className="flex flex-wrap gap-2">
                  {research.company.competitors.map((c: any, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 border border-cb-border text-xs text-cb-sub font-noto"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {research.company.industry_trends?.length > 0 && (
              <div>
                <h3 className="text-xs text-cb-sub font-noto mb-2">業界トレンド</h3>
                <div className="flex flex-wrap gap-2">
                  {research.company.industry_trends.map((t: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-cb-surface text-xs text-cb-cyan font-noto"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strategy summary */}
      {strategy && (
        <div className="border border-cb-border">
          <div className="px-6 py-4 border-b border-cb-border">
            <span className="text-xs text-cb-sub tracking-wider uppercase font-noto">
              Strategy Overview
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(strategy.platform_strategies || {}).map(
                ([platform, data]: [string, any]) => (
                  <div key={platform} className="border border-cb-border p-4">
                    <div className="text-[10px] text-cb-sub tracking-wider uppercase font-chakra mb-3">
                      {platform}
                    </div>
                    <div className="text-sm font-chakra text-cb-text">
                      {data.priority_keywords?.length || 0}
                    </div>
                    <div className="text-[10px] text-cb-sub font-noto">
                      優先キーワード
                    </div>
                    {data.priority_keywords?.slice(0, 3).map((kw: string, i: number) => (
                      <div key={i} className="text-[10px] text-cb-sub mt-1 truncate font-noto">
                        · {kw}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {strategy.keyword_clusters?.length > 0 && (
              <div className="mt-6 pt-4 border-t border-cb-border">
                <h3 className="text-xs text-cb-sub font-noto mb-3">
                  キーワードクラスター ({strategy.keyword_clusters.length})
                </h3>
                <div className="space-y-2">
                  {strategy.keyword_clusters.map((cluster: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3 border border-cb-border"
                    >
                      <div>
                        <span className="text-sm text-cb-text font-noto">
                          {cluster.cluster_name}
                        </span>
                        <span className="text-xs text-cb-sub ml-3 font-noto">
                          {cluster.pillar_keyword}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-cb-sub font-noto">
                          {cluster.content_type}
                        </span>
                        <span className="text-[10px] text-cb-cyan font-chakra">
                          P{cluster.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
