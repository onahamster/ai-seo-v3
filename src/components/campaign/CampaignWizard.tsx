"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import { runResearch, runStrategy } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import type { Campaign, Company, PhaseProgress } from "@/lib/types";

export default function CampaignWizard() {
  const router = useRouter();
  const settings = useStore((s) => s.settings);
  const addCompany = useStore((s) => s.addCompany);
  const addCampaign = useStore((s) => s.addCampaign);
  const updateCampaign = useStore((s) => s.updateCampaign);
  const setResearchCache = useStore((s) => s.setResearchCache);
  const setStrategyCache = useStore((s) => s.setStrategyCache);
  const setPhase = useStore((s) => s.setPhase);
  const resetPhase = useStore((s) => s.resetPhase);
  const addToast = useStore((s) => s.addToast);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [phaseInfo, setPhaseInfo] = useState<PhaseProgress>({
    phase: "idle",
    progress: 0,
    message: "",
  });

  // Form data
  const [companyName, setCompanyName] = useState("");
  const [businessDesc, setBusinessDesc] = useState("");
  const [website, setWebsite] = useState("");
  const [keywords, setKeywords] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [goal, setGoal] = useState("");

  const canProceed = () => {
    if (step === 0) return companyName.trim() && businessDesc.trim();
    if (step === 1) return keywords.trim();
    return true;
  };

  const handleStart = async () => {
    setLoading(true);

    try {
      // Create company
      const companyId = generateId();
      const company: Company = {
        id: companyId,
        user_id: "local",
        name: companyName,
        website,
        description: businessDesc,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      addCompany(company);

      // Create campaign
      const campaignId = generateId();
      const campaign: Campaign = {
        id: campaignId,
        company_id: companyId,
        company_name: companyName,
        name: campaignName || `${companyName} LLMO対策`,
        goal: goal || `${companyName}をAI検索で推奨企業として表示`,
        status: "draft",
        platform_targets: ["chatgpt", "perplexity", "google_aio", "google_gemini"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      addCampaign(campaign);

      const kwList = keywords
        .split(/[,\n、]/)
        .map((k) => k.trim())
        .filter(Boolean);

      // Phase 1: Research
      const p1: PhaseProgress = {
        phase: "researching",
        progress: 20,
        message: "企業リサーチ実行中...",
        detail: "SERP分析・競合分析・AI可視性チェック",
      };
      setPhaseInfo(p1);
      setPhase(p1);

      const researchData = await runResearch(
        settings,
        companyName,
        businessDesc,
        website,
        kwList
      );
      setResearchCache(campaignId, researchData);

      // Phase 2: Strategy
      const p2: PhaseProgress = {
        phase: "strategizing",
        progress: 60,
        message: "戦略策定中...",
        detail: "プラットフォーム別KW戦略・コンテンツカレンダー生成",
      };
      setPhaseInfo(p2);
      setPhase(p2);

      const strategyData = await runStrategy(settings, researchData, companyName);
      setStrategyCache(campaignId, strategyData);

      updateCampaign(campaignId, {
        status: "active",
        strategy_data: strategyData,
        keyword_count: kwList.length,
      });

      // Complete
      const p3: PhaseProgress = {
        phase: "complete",
        progress: 100,
        message: "完了",
      };
      setPhaseInfo(p3);
      setPhase(p3);

      addToast("キャンペーンの作成が完了しました", "success");

      setTimeout(() => {
        resetPhase();
        router.push(`/campaigns/${campaignId}/`);
      }, 1000);
    } catch (err: any) {
      const errPhase: PhaseProgress = {
        phase: "error",
        progress: 0,
        message: err.message || "エラーが発生しました",
      };
      setPhaseInfo(errPhase);
      setPhase(errPhase);
      addToast(err.message || "エラーが発生しました", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-12">
        {["企業情報", "キーワード", "実行"].map((label, i) => (
          <div key={i} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 border text-xs font-chakra ${
                i <= step
                  ? "border-cb-cyan text-cb-cyan"
                  : "border-cb-border text-cb-sub"
              }`}
            >
              {i + 1}
            </div>
            <div className="flex-1 h-px bg-cb-border mx-2">
              <div
                className="h-full bg-cb-cyan transition-all duration-500"
                style={{ width: i < step ? "100%" : "0%" }}
              />
            </div>
            <span
              className={`text-[11px] font-noto ${
                i <= step ? "text-cb-text" : "text-cb-sub"
              }`}
            >
              {label}
            </span>
            {i < 2 && <div className="flex-1" />}
          </div>
        ))}
      </div>

      {/* Step 0: Company info */}
      {step === 0 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-section-title font-noto font-light text-cb-text leading-tight">
              企業情報を
              <br />
              <span className="text-gradient-cyan">入力</span>
            </h2>
            <p className="text-sm text-cb-sub mt-4 font-noto">
              AI検索で推薦させたい企業の情報を入力してください。
              AIが自動で事業分析・競合調査を実行します。
            </p>
          </div>

          <Input
            label="企業名"
            placeholder="例：株式会社テックソリューション"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          <div>
            <label className="block text-xs text-cb-sub tracking-wider uppercase mb-2 font-noto">
              事業内容・やっていること
            </label>
            <textarea
              className="w-full bg-cb-surface border border-cb-border px-4 py-3 text-sm text-cb-text placeholder:text-cb-sub/50 font-noto font-light focus:border-cb-cyan transition-colors duration-200 min-h-[120px] resize-y"
              placeholder="例：自動広告運用事業をやっています。Google/Meta/TikTok広告のAI自動最適化プラットフォームを提供し、中小企業のデジタル広告運用を完全自動化しています。"
              value={businessDesc}
              onChange={(e) => setBusinessDesc(e.target.value)}
            />
          </div>

          <Input
            label="ウェブサイトURL（任意）"
            placeholder="https://example.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <div className="pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setStep(1)}
              disabled={!canProceed()}
              className="w-full"
            >
              次へ — キーワード設定
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: Keywords */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-section-title font-noto font-light text-cb-text leading-tight">
              対策
              <span className="text-gradient-cyan">キーワード</span>
            </h2>
            <p className="text-sm text-cb-sub mt-4 font-noto">
              AI検索で上位表示させたいキーワードを入力してください。
              カンマまたは改行で区切ります。AIが追加のキーワード提案も行います。
            </p>
          </div>

          <div>
            <label className="block text-xs text-cb-sub tracking-wider uppercase mb-2 font-noto">
              ターゲットキーワード
            </label>
            <textarea
              className="w-full bg-cb-surface border border-cb-border px-4 py-3 text-sm text-cb-text placeholder:text-cb-sub/50 font-noto font-light focus:border-cb-cyan transition-colors duration-200 min-h-[160px] resize-y"
              placeholder={`例：\n自動広告運用 おすすめ\n広告運用代行 比較\nAI広告最適化 企業\n運用型広告 自動化 ツール`}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            <p className="text-[10px] text-cb-sub mt-2 font-noto">
              ※ AIが自動でロングテールKWや関連KWも生成します
            </p>
          </div>

          <Input
            label="キャンペーン名（任意）"
            placeholder={`${companyName} LLMO対策`}
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
          />

          <Input
            label="ゴール（任意）"
            placeholder="AI検索で「おすすめ企業」として弊社名を表示させる"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">
              戻る
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setStep(2)}
              disabled={!canProceed()}
              className="flex-[2]"
            >
              次へ — 確認と実行
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Confirm & Execute */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-section-title font-noto font-light text-cb-text leading-tight">
              <span className="text-gradient-cyan">AI分析</span>を
              <br />
              開始
            </h2>
            <p className="text-sm text-cb-sub mt-4 font-noto">
              以下の内容でリサーチと戦略策定を自動実行します。
            </p>
          </div>

          {/* Summary */}
          <div className="border border-cb-border divide-y divide-cb-border">
            <div className="px-6 py-4 flex justify-between">
              <span className="text-xs text-cb-sub font-noto">企業名</span>
              <span className="text-sm text-cb-text font-noto">{companyName}</span>
            </div>
            <div className="px-6 py-4 flex justify-between">
              <span className="text-xs text-cb-sub font-noto">キーワード数</span>
              <span className="text-sm text-cb-text font-chakra">
                {
                  keywords
                    .split(/[,\n、]/)
                    .map((k) => k.trim())
                    .filter(Boolean).length
                }
              </span>
            </div>
            <div className="px-6 py-4 flex justify-between">
              <span className="text-xs text-cb-sub font-noto">対象プラットフォーム</span>
              <span className="text-sm text-cb-text font-noto">
                ChatGPT / Perplexity / AI Overview / Gemini
              </span>
            </div>
          </div>

          {/* Phase progress */}
          {loading && (
            <div className="border border-cb-cyan/20 bg-cb-cyan/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Spinner size={16} />
                <span className="text-sm text-cb-cyan font-noto">
                  {phaseInfo.message}
                </span>
              </div>
              {phaseInfo.detail && (
                <p className="text-xs text-cb-sub font-noto mb-3">
                  {phaseInfo.detail}
                </p>
              )}
              <div className="w-full h-1 bg-cb-surface overflow-hidden">
                <div
                  className="h-full bg-cb-cyan transition-all duration-700"
                  style={{ width: `${phaseInfo.progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setStep(1)}
              disabled={loading}
              className="flex-1"
            >
              戻る
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleStart}
              loading={loading}
              disabled={loading}
              className="flex-[2]"
            >
              {loading ? "分析中..." : "リサーチ & 戦略策定を開始"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
