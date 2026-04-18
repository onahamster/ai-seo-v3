"use client";

import { classNames } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({
  label,
  error,
  hint,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs text-cb-sub tracking-wider uppercase mb-2 font-noto">
          {label}
        </label>
      )}
      <input
        className={classNames(
          "w-full bg-cb-surface border border-cb-border px-4 py-3 text-sm text-cb-text",
          "placeholder:text-cb-sub/50 font-noto font-light",
          "focus:border-cb-cyan focus:ring-0 transition-colors duration-200",
          error && "border-red-400",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-cb-sub">{hint}</p>}
    </div>
  );
}
