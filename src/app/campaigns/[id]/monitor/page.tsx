"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { runMonitoring } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

export default function MonitorPage() {
  const params = useParams();
  const id = params?.id as string;
  const campaigns = useStore((s) => s.campaigns);
  const settings = useStore((s) => s.settings);
  const monitorResults = useStore((s) => s.getMonitorResultsByCampaign(id));
  const researchCache = useStore((s) => s.researchCache);
  const research = researchCache[id];
  const addMonitorResults = useStore((s) => s.addMonitorResults);
  const addToast = useStore((s) => s.addToast);

  const campaign = campaigns.find((c) => c.id === id);
  const [loading, setLoading] = useState(false);

  if (!campaign) return null;

  const handleMonitor = async () => {
    setLoading(true);
    try {
      const keywords = research?.visibility.keyword_visibility.map(kv => kv.keyword) || [];
      const competitors = research?.company.competitors.map((c: any) => c.name) || [];
      
      const results = await runMonitoring(
        settings,
        id,
        campaign.company_name || "",
        keywords,
        competitors
      );
      
      addMonitorResults(results);
      addToast("モニタリングを完了しました", "success");
    } catch (err: any) {
      addToast(err.message || "エラーが発生しました", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/campaigns/${id}/`}
            className="text-xs text-cb-sub hover:text-cb-cyan transition-colors font-noto"
          >
            ← {campaign.name}
          </Link>
          <h1 className="text-2xl font-noto font-light text-cb-text mt-3">Monitoring</h1>
        </div>
        <Button variant="primary" size="sm" onClick={handleMonitor} loading={loading}>
          チェック実行
        </Button>
      </div>

      {monitorResults.length === 0 ? (
        <div className="border border-cb-border py-20 text-center">
          <p className="text-sm text-cb-sub font-noto">モニタリングデータがありません</p>
          <p className="text-[10px] text-cb-sub mt-2 font-noto">「チェック実行」ボタンでAI検索の言及状況を確認します</p>
        </div>
      ) : (
        <div className="space-y-4">
          {monitorResults.map((result) => (
            <div key={result.id} className="border border-cb-border p-6">
              <div className="flex justify-between">
                <div className="text-xs text-cb-cyan font-chakra tracking-widest uppercase mb-2">
                  {result.platform}
                </div>
                <span className="text-[10px] text-cb-sub font-noto">
                  {new Date(result.checked_at).toLocaleString()}
                </span>
              </div>
              <h3 className="text-sm text-cb-text font-noto mb-2">Q: {result.query_text}</h3>
              <div className="flex items-center gap-4 mt-4">
                <div className={`px-3 py-1 text-[10px] font-noto border ${
                  result.brand_mentioned ? "border-green-400 text-green-400" : "border-cb-sub/30 text-cb-sub"
                }`}>
                  {result.brand_mentioned ? "言及あり" : "言及なし"}
                </div>
                {result.brand_mentioned && (
                  <div className="text-xs text-cb-sub font-noto">
                    Position: {result.mention_position}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
