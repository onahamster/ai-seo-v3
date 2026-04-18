"use client";

import { timeAgo, getPlatformName } from "@/lib/utils";
import type { MonitorResult, Article } from "@/lib/types";

interface Props {
  monitorResults: MonitorResult[];
  articles: Article[];
}

export default function RecentActivity({ monitorResults, articles }: Props) {
  const activities = [
    ...monitorResults.slice(-5).map((r) => ({
      type: "monitor" as const,
      text: `${getPlatformName(r.platform)}で「${r.query_text}」を${
        r.brand_mentioned ? "言及確認" : "未言及"
      }`,
      time: r.checked_at,
      positive: r.brand_mentioned && r.sentiment === "positive",
    })),
    ...articles.slice(-5).map((a) => ({
      type: "article" as const,
      text: `「${a.title}」を${a.status === "published" ? "公開" : "作成"}`,
      time: a.created_at,
      positive: true,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 8);

  if (activities.length === 0) {
    return (
      <div className="border border-cb-border">
        <div className="px-6 py-4 border-b border-cb-border">
          <span className="text-xs text-cb-sub tracking-wider uppercase font-noto" id="recent-activity-title">
            Recent Activity
          </span>
        </div>
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-cb-sub font-noto">
            アクティビティはまだありません
          </p>
          <p className="text-xs text-cb-sub/50 mt-2 font-noto">
            キャンペーンを作成して開始しましょう
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-cb-border">
      <div className="px-6 py-4 border-b border-cb-border">
        <span className="text-xs text-cb-sub tracking-wider uppercase font-noto" id="recent-activity-title">
          Recent Activity
        </span>
      </div>
      <div className="divide-y divide-cb-border">
        {activities.map((act, i) => (
          <div key={i} className="px-6 py-3 flex items-start gap-3">
            <div
              className={`w-1.5 h-1.5 mt-1.5 flex-shrink-0 ${
                act.positive ? "bg-green-400" : "bg-cb-sub/30"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-cb-text font-noto truncate">{act.text}</p>
              <p className="text-[10px] text-cb-sub mt-0.5 font-noto">
                {timeAgo(act.time)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
