"use client";

import { getScoreColor } from "@/lib/utils";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
}

export default function CitableScoreBadge({ score, size = "md" }: Props) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
  };

  return (
    <div
      className={`${sizes[size]} border-2 flex items-center justify-center font-chakra ${
        score >= 80
          ? "border-green-400"
          : score >= 60
          ? "border-cb-cyan"
          : score >= 40
          ? "border-yellow-400"
          : "border-red-400"
      } ${getScoreColor(score)}`}
    >
      {score}
    </div>
  );
}
