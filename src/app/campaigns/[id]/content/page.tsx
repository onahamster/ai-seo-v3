"use client";

import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import Link from "next/link";
import ContentGenerator from "@/components/content/ContentGenerator";

export default function ContentPage() {
  const params = useParams();
  const id = params?.id as string;
  const campaigns = useStore((s) => s.campaigns);
  const researchCache = useStore((s) => s.researchCache);
  const articles = useStore((s) => s.articles);

  const campaign = campaigns.find((c) => c.id === id);
  const campaignArticles = articles.filter((a) => a.campaign_id === id);
  const research = researchCache[id];

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
        <h1 className="text-2xl font-noto font-light text-cb-text mt-3">Content Generation</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-cb-border p-6 shadow-sm">
            <h2 className="text-xs text-cb-sub tracking-wider uppercase font-noto mb-4">記事を新規生成</h2>
            <ContentGenerator 
              campaignId={id} 
              companyName={campaign.company_name || ""} 
              companyData={research?.company} 
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs text-cb-sub tracking-wider uppercase font-noto">生成済み記事一覧</h2>
          {campaignArticles.length === 0 ? (
            <div className="border border-cb-border py-12 text-center">
              <p className="text-sm text-cb-sub font-noto">まだ記事がありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaignArticles.map((article) => (
                <div key={article.id} className="border border-cb-border p-6 hover:border-cb-cyan/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm text-cb-text font-noto">{article.title}</h3>
                    <span className="text-[10px] text-cb-cyan font-chakra border border-cb-cyan/30 px-2 py-0.5">
                      SCORE: {article.citable_score}
                    </span>
                  </div>
                  <p className="text-xs text-cb-sub mt-2 line-clamp-2 font-noto">{article.meta_description}</p>
                  <div className="mt-4 flex gap-4 text-[10px] text-cb-sub font-noto">
                    <span>{article.word_count} tokens</span>
                    <span>{article.entity_mentions} entities</span>
                    <span>Status: {article.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
