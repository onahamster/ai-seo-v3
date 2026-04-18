"use client";

import { classNames } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-noto font-normal transition-all duration-200 border select-none whitespace-nowrap";

  const variants = {
    primary:
      "bg-cb-cyan text-black border-cb-cyan hover:bg-transparent hover:text-cb-cyan active:opacity-80",
    secondary:
      "bg-transparent text-cb-text border-cb-border hover:border-cb-cyan hover:text-cb-cyan active:opacity-80",
    ghost:
      "bg-transparent text-cb-sub border-transparent hover:text-cb-text hover:border-cb-border active:opacity-80",
    danger:
      "bg-transparent text-red-400 border-red-400/30 hover:bg-red-400/10 hover:border-red-400 active:opacity-80",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs tracking-wide",
    md: "px-5 py-2.5 text-sm tracking-wide",
    lg: "px-8 py-3.5 text-base tracking-wide",
  };

  return (
    <button
      className={classNames(
        base,
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-40 pointer-events-none",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
