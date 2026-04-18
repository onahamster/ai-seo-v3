"use client";

import { useStore } from "@/lib/store";
import Link from "next/link";
import Button from "@/components/ui/Button";
import CampaignCard from "@/components/campaign/CampaignCard";

export default function CampaignsPage() {
  const campaigns = useStore((s) => s.campaigns);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-noto font-light text-cb-text">Campaigns</h1>
          <p className="text-xs text-cb-sub mt-1 font-noto">
            LLMO対策キャンペーン管理
          </p>
        </div>
        <Link href="/campaigns/new/">
          <Button variant="primary" size="sm">
            新規作成
          </Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="border border-cb-border py-20 text-center">
          <p className="text-sm text-cb-sub font-noto">
            キャンペーンがありません
          </p>
          <Link href="/campaigns/new/" className="inline-block mt-4">
            <Button variant="secondary" size="sm">
              最初のキャンペーンを作成
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
