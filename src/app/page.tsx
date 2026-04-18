"use client";

import { useStore } from "@/lib/store";
import Link from "next/link";
import Button from "@/components/ui/Button";
import StatsGrid from "@/components/dashboard/StatsGrid";
import PlatformScores from "@/components/dashboard/PlatformScores";
import VisibilityChart from "@/components/dashboard/VisibilityChart";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function DashboardPage() {
  const campaigns = useStore((s) => s.campaigns);
  const articles = useStore((s) => s.articles);
  const monitorResults = useStore((s) => s.monitorResults);
  const visibilityScores = useStore((s) => s.visibilityScores);
  const settings = useStore((s) => s.settings);

  const hasApiKey = !!settings.gemini_api_key;
  const isEmpty = campaigns.length === 0;

  const stats = [
    {
      label: "Active Campaigns",
      value: campaigns.filter((c) => c.status === "active").length,
      sub: `全${campaigns.length}件`,
    },
    {
      label: "Generated Articles",
      value: articles.length,
      sub: `公開済 ${articles.filter((a) => a.status === "published").length}`,
    },
    {
      label: "Monitor Checks",
      value: monitorResults.length,
      sub: "累計チェック数",
    },
    {
      label: "Avg Visibility",
      value:
        visibilityScores.length > 0
          ? Math.round(
              visibilityScores.reduce((s, v) => s + v.score, 0) /
                visibilityScores.length
            )
          : "—",
      accent: true,
      sub: "全プラットフォーム平均",
    },
  ];

  // Empty state
  if (isEmpty) {
    return (
      <div className="max-w-3xl mx-auto py-20">
        <div className="text-center">
          <h1 className="text-5xl lg:text-7xl font-noto font-light text-cb-text leading-none">
            <span className="font-chakra text-cb-cyan">LLMO</span>
            <br />
            自動対策ツール
          </h1>
          <p className="text-sm text-cb-sub mt-8 max-w-md mx-auto font-noto leading-relaxed">
            AI検索（ChatGPT / Perplexity / Gemini / AI Overview）で
            御社を「おすすめ企業」として表示させるための
            リサーチ・戦略・記事生成・配信・モニタリングを完全自動化
          </p>

          <div className="mt-12 flex flex-col items-center gap-4">
            {!hasApiKey ? (
              <>
                <Link href="/settings/">
                  <Button variant="primary" size="lg">
                    APIキーを設定して開始
                  </Button>
                </Link>
                <p className="text-[10px] text-cb-sub font-noto">
                  まずGemini APIキーの設定が必要です
                </p>
              </>
            ) : (
              <>
                <Link href="/campaigns/new/">
                  <Button variant="primary" size="lg">
                    最初のキャンペーンを作成
                  </Button>
                </Link>
                <p className="text-[10px] text-cb-sub font-noto">
                  企業名とキーワードを入力するだけで自動分析を開始します
                </p>
              </>
            )}
          </div>

          {/* Feature grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-px bg-cb-border border border-cb-border">
            {[
              {
                num: "01",
                title: "自動リサーチ",
                desc: "企業分析・SERP分析・AI可視性チェックを自動実行",
              },
              {
                num: "02",
                title: "戦略策定",
                desc: "4プラットフォーム別のKW戦略・コンテンツカレンダーを自動生成",
              },
              {
                num: "03",
                title: "記事生成",
                desc: "CITABLEフレームワーク準拠のAI最適化記事を量産",
              },
            ].map((f) => (
              <div key={f.num} className="bg-cb-black p-8 text-left">
                <span className="text-cb-cyan font-chakra text-xs tracking-widest">
                  {f.num}
                </span>
                <h3 className="text-base font-noto font-normal text-cb-text mt-3">
                  {f.title}
                </h3>
                <p className="text-xs text-cb-sub mt-2 font-noto leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard with data
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-noto font-light text-cb-text">
            Dashboard
          </h1>
          <p className="text-xs text-cb-sub mt-1 font-noto">AI検索可視性の全体像</p>
        </div>
        <Link href="/campaigns/new/">
          <Button variant="secondary" size="sm">
            新規キャンペーン
          </Button>
        </Link>
      </div>

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisibilityChart scores={visibilityScores} />
        <RecentActivity monitorResults={monitorResults} articles={articles} />
      </div>

      {visibilityScores.length > 0 && (
        <div>
          <h2 className="text-xs text-cb-sub tracking-wider uppercase font-noto mb-4">
            Platform Breakdown
          </h2>
          <PlatformScores scores={visibilityScores} />
        </div>
      )}
    </div>
  );
}
