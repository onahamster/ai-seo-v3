"use client";

import { getPlatformColor, getPlatformName, getScoreColor } from "@/lib/utils";
import type { VisibilityScore } from "@/lib/types";

interface Props {
  scores: VisibilityScore[];
}

const platforms = ["chatgpt", "perplexity", "gemini", "google_aio"];

export default function PlatformScores({ scores }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-cb-border">
      {platforms.map((platform) => {
        const score = scores.find((s) => s.platform === platform);
        const value = score?.score ?? 0;
        const mentionRate = score?.mention_rate ?? 0;

        return (
          <div key={platform} className="bg-cb-black p-6">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-2 h-2"
                style={{ backgroundColor: getPlatformColor(platform) }}
              />
              <span className="text-xs text-cb-sub font-noto">
                {getPlatformName(platform)}
              </span>
            </div>

            <div className={`text-3xl font-chakra font-light ${getScoreColor(value)}`}>
              {value}
            </div>
            <div className="text-[10px] text-cb-sub mt-1 font-noto">
              可視性スコア
            </div>

            {/* Score bar */}
            <div className="mt-4 w-full h-1 bg-cb-surface overflow-hidden">
              <div
                className="h-full transition-all duration-1000"
                style={{
                  width: `${value}%`,
                  backgroundColor: getPlatformColor(platform),
                }}
              />
            </div>

            <div className="mt-3 flex justify-between text-[10px]">
              <span className="text-cb-sub">言及率</span>
              <span className="text-cb-text font-chakra">{mentionRate}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
