"use client";

import { classNames } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs text-cb-sub tracking-wider uppercase mb-2 font-noto">
          {label}
        </label>
      )}
      <select
        className={classNames(
          "w-full bg-cb-surface border border-cb-border px-4 py-3 text-sm text-cb-text",
          "font-noto font-light appearance-none cursor-pointer",
          "focus:border-cb-cyan transition-colors duration-200",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
