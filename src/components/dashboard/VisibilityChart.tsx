"use client";

import { getPlatformColor, getPlatformName } from "@/lib/utils";
import type { VisibilityScore } from "@/lib/types";

interface Props {
  scores: VisibilityScore[];
}

export default function VisibilityChart({ scores }: Props) {
  const platforms = ["chatgpt", "perplexity", "gemini", "google_aio"];
  const maxScore = 100;

  return (
    <div className="border border-cb-border">
      <div className="px-6 py-4 border-b border-cb-border flex items-center justify-between">
        <span className="text-xs text-cb-sub tracking-wider uppercase font-noto">
          AI Visibility Overview
        </span>
        <span className="text-[10px] text-cb-sub font-chakra">
          {scores.length > 0 ? "LIVE" : "NO DATA"}
        </span>
      </div>

      <div className="p-6">
        {/* Bar chart */}
        <div className="space-y-4">
          {platforms.map((platform) => {
            const score = scores.find((s) => s.platform === platform);
            const value = score?.score ?? 0;
            const color = getPlatformColor(platform);

            return (
              <div key={platform}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ backgroundColor: color }} />
                    <span className="text-xs text-cb-sub font-noto">
                      {getPlatformName(platform)}
                    </span>
                  </div>
                  <span className="text-sm font-chakra text-cb-text">{value}</span>
                </div>
                <div className="w-full h-2 bg-cb-surface overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${(value / maxScore) * 100}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-cb-border grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-cb-sub font-noto">総合スコア</div>
            <div className="text-xl font-chakra text-cb-text mt-1">
              {scores.length > 0
                ? Math.round(scores.reduce((s, v) => s + v.score, 0) / scores.length)
                : 0}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-cb-sub font-noto">平均言及率</div>
            <div className="text-xl font-chakra text-cb-text mt-1">
              {scores.length > 0
                ? Math.round(
                    scores.reduce((s, v) => s + (v.mention_rate || 0), 0) / scores.length
                  )
                : 0}
              <span className="text-sm text-cb-sub">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
