"use client";

export function generateStaticParams() {
  return [{ id: "__dynamic__" }];
}

import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function StrategyPage() {
  const params = useParams();
  const id = params?.id as string;

  const campaigns = useStore((s) => s.campaigns);
  const strategyCache = useStore((s) => s.strategyCache);

  const campaign = campaigns.find((c) => c.id === id);
  const strategy = strategyCache[id];

  if (!campaign) return null;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/campaigns/${id}/`}
          className="text-xs text-cb-sub hover:text-cb-cyan transition-colors font-noto"
        >
          ← {campaign.name}
        </Link>
        <h1 className="text-2xl font-noto font-light text-cb-text mt-3">
          Strategy
        </h1>
      </div>

      {!strategy ? (
        <div className="border border-cb-border py-12 text-center">
          <p className="text-sm text-cb-sub font-noto">戦略データがありません</p>
        </div>
      ) : (
        <>
          {/* Content Calendar */}
          {strategy.content_calendar?.length > 0 && (
            <div className="border border-cb-border">
              <div className="px-6 py-4 border-b border-cb-border">
                <span className="text-xs text-cb-sub tracking-wider uppercase font-noto">
                  Content Calendar
                </span>
              </div>
              <div className="divide-y divide-cb-border">
                {strategy.content_calendar.map((week: any) => (
                  <div key={week.week} className="p-6">
                    <div className="text-xs text-cb-cyan font-chakra tracking-wider mb-4">
                      WEEK {week.week}
                    </div>
                    <div className="space-y-3">
                      {week.articles?.map((article: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-4 py-3 border border-cb-border"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-cb-text font-noto">
                              {article.title_draft}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-cb-sub font-noto">
                                {article.target_keyword}
                              </span>
                              <span className="text-[10px] text-cb-cyan/60 font-noto">
                                {article.content_type}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {article.target_platform?.map((p: string) => (
                              <div
                                key={p}
                                className="w-1.5 h-1.5 bg-cb-sub/30"
                                title={p}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
