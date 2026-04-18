"use client";

import Link from "next/link";
import { formatDate, getScoreColor } from "@/lib/utils";
import type { Campaign } from "@/lib/types";

interface Props {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: Props) {
  const statusColors = {
    draft: "text-cb-sub",
    active: "text-green-400",
    paused: "text-yellow-400",
    completed: "text-cb-cyan",
  };

  const statusLabels = {
    draft: "下書き",
    active: "実行中",
    paused: "一時停止",
    completed: "完了",
  };

  return (
    <Link
      href={`/campaigns/${campaign.id}/`}
      className="block border border-cb-border hover:border-cb-cyan/30 transition-colors duration-300 group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-noto font-normal text-cb-text group-hover:text-cb-cyan transition-colors">
              {campaign.name}
            </h3>
            {campaign.company_name && (
              <p className="text-xs text-cb-sub mt-1 font-noto">
                {campaign.company_name}
              </p>
            )}
          </div>
          <span
            className={`text-[10px] font-chakra tracking-wider uppercase ${
              statusColors[campaign.status]
            }`}
          >
            {statusLabels[campaign.status]}
          </span>
        </div>

        {campaign.goal && (
          <p className="text-xs text-cb-sub mt-3 line-clamp-2 font-noto">
            {campaign.goal}
          </p>
        )}

        <div className="mt-5 pt-4 border-t border-cb-border flex items-center justify-between">
          <div className="flex gap-6">
            <div>
              <div className="text-[10px] text-cb-sub font-noto">KW数</div>
              <div className="text-sm font-chakra text-cb-text">
                {campaign.keyword_count || 0}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-cb-sub font-noto">記事数</div>
              <div className="text-sm font-chakra text-cb-text">
                {campaign.article_count || 0}
              </div>
            </div>
            {campaign.avg_visibility_score !== undefined && (
              <div>
                <div className="text-[10px] text-cb-sub font-noto">可視性</div>
                <div
                  className={`text-sm font-chakra ${getScoreColor(
                    campaign.avg_visibility_score
                  )}`}
                >
                  {campaign.avg_visibility_score}
                </div>
              </div>
            )}
          </div>
          <div className="text-[10px] text-cb-sub font-noto">
            {formatDate(campaign.created_at)}
          </div>
        </div>
      </div>
    </Link>
  );
}
