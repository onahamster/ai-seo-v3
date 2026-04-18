"use client";

interface Stat {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

interface Props {
  stats: Stat[];
}

export default function StatsGrid({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-cb-border border border-cb-border">
      {stats.map((stat, i) => (
        <div key={i} className="bg-cb-black px-6 py-5">
          <div className="text-[10px] text-cb-sub tracking-wider uppercase font-noto mb-3">
            {stat.label}
          </div>
          <div
            className={`text-2xl font-chakra font-light ${
              stat.accent ? "text-cb-cyan" : "text-cb-text"
            }`}
          >
            {stat.value}
          </div>
          {stat.sub && (
            <div className="text-[10px] text-cb-sub mt-1 font-noto">{stat.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
