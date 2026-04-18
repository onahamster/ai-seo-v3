"use client";

import { classNames, getScoreBg } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: string;
  size?: "sm" | "md";
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color,
  size = "md",
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const barColor = color || getScoreBg(value);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-xs text-cb-sub font-noto">{label}</span>
          )}
          {showValue && (
            <span className="text-xs text-cb-text font-chakra">{Math.round(value)}</span>
          )}
        </div>
      )}
      <div
        className={classNames(
          "w-full bg-cb-surface overflow-hidden",
          size === "sm" ? "h-1" : "h-2"
        )}
      >
        <div
          className={classNames("h-full transition-all duration-1000 ease-out", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
