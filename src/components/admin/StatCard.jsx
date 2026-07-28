"use client";

import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, trend, trendValue, subtitle }) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-zinc-100 transition-all hover:shadow-md hover:border-zinc-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            {Icon && <Icon size={20} />}
          </div>
          <h3 className="text-sm font-medium text-zinc-500">{title}</h3>
        </div>
        <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <p className="text-3xl font-bold tracking-tight text-zinc-900">{value}</p>
        
        {trendValue && (
          <span
            className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? "bg-emerald-50 text-emerald-600"
                : isNegative
                ? "bg-red-50 text-red-600"
                : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {isPositive && <ArrowUpRight size={14} className="mr-0.5" />}
            {isNegative && <ArrowDownRight size={14} className="mr-0.5" />}
            {trendValue}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>}
      
      {/* Decorative gradient blob */}
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 opacity-50 blur-2xl pointer-events-none" />
    </div>
  );
}
