"use client";

export function generateStaticParams() {
  return [{ id: "__dynamic__" }];
}

import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function DistributePage() {
  const params = useParams();
  const id = params?.id as string;
  const campaigns = useStore((s) => s.campaigns);
  const articles = useStore((s) => s.articles);

  const campaign = campaigns.find((c) => c.id === id);
  const campaignArticles = articles.filter((a) => a.campaign_id === id && a.status === "published");

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
        <h1 className="text-2xl font-noto font-light text-cb-text mt-3">Distribution</h1>
        <p className="text-xs text-cb-sub mt-1 font-noto">記事の配信と外部チャネルへの投稿管理</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-cb-border">
        {["WordPress", "Reddit", "Quora", "Medium", "LinkedIn"].map((channel) => (
          <div key={channel} className="bg-cb-black p-6 border border-cb-border">
            <h3 className="text-sm text-cb-text font-noto border-b border-cb-border pb-3 mb-4">{channel}</h3>
            <p className="text-xs text-cb-sub font-noto h-12">
              {channel}への自動配信設定とドラフト管理
            </p>
            <Button variant="secondary" size="sm" className="mt-4 w-full">
              連携設定
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
