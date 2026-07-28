"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Activity, CreditCard } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { OverviewBarChart } from "@/components/admin/AdminCharts";

export default function AdminRevenuePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch("/api/admin/revenue");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-zinc-200/50 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  const revenueData = [
    { name: "Week 1", value: Math.floor(Math.random() * 5000) },
    { name: "Week 2", value: Math.floor(Math.random() * 5000) },
    { name: "Week 3", value: Math.floor(Math.random() * 5000) },
    { name: "Week 4", value: Math.floor(Math.random() * 5000) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Revenue Dashboard</h1>
          <p className="text-zinc-500 mt-1">Financial performance and metrics.</p>
        </div>
        <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors shadow-sm">
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Today's Revenue" 
          value={`$${(data?.today || 0).toLocaleString()}`} 
          icon={DollarSign} 
          trend="up" 
          trendValue="+5%"
        />
        <StatCard 
          title="Monthly Recurring (MRR)" 
          value={`$${(data?.mrr || 0).toLocaleString()}`} 
          icon={TrendingUp} 
          trend="up" 
          trendValue="+12%"
        />
        <StatCard 
          title="Annual Recurring (ARR)" 
          value={`$${(data?.arr || 0).toLocaleString()}`} 
          icon={Activity} 
          trend="up" 
          trendValue="+12%"
        />
        <StatCard 
          title="Avg Revenue Per User (ARPU)" 
          value={`$${(data?.arpu || 0).toLocaleString()}`} 
          icon={CreditCard} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-zinc-900">Revenue Growth (Current Month)</h3>
          </div>
          <OverviewBarChart 
            data={revenueData} 
            bars={[{ key: "value", name: "Revenue", color: "#10b981" }]}
          />
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-zinc-900 mb-4">Revenue Breakdown</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-zinc-700">Agency Plans</span>
                <span className="font-bold text-zinc-900">${(data?.breakdown?.agency || 0).toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-zinc-700">Business Pro</span>
                <span className="font-bold text-zinc-900">${(data?.breakdown?.business || 0).toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-zinc-700">Creator Pro</span>
                <span className="font-bold text-zinc-900">${(data?.breakdown?.creator || 0).toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
