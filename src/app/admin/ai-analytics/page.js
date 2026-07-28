"use client";

import { useEffect, useState } from "react";
import { Bot, Zap, Clock, AlertTriangle } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { OverviewAreaChart } from "@/components/admin/AdminCharts";

export default function AdminAIAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIStats = async () => {
      try {
        const res = await fetch("/api/admin/ai-analytics");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAIStats();
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

  const chartData = [
    { name: "Mon", value: Math.floor(Math.random() * 500) },
    { name: "Tue", value: Math.floor(Math.random() * 500) },
    { name: "Wed", value: Math.floor(Math.random() * 500) },
    { name: "Thu", value: Math.floor(Math.random() * 500) },
    { name: "Fri", value: Math.floor(Math.random() * 500) },
    { name: "Sat", value: Math.floor(Math.random() * 500) },
    { name: "Sun", value: Math.floor(Math.random() * 500) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">AI Analytics</h1>
          <p className="text-zinc-500 mt-1">Monitor artificial intelligence usage and performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Generations" 
          value={(data?.totalRequests || 0).toLocaleString()} 
          icon={Bot} 
          trend="up" 
          trendValue="+18%"
          subtitle={`${data?.todayRequests} today`}
        />
        <StatCard 
          title="Avg. Response Time" 
          value={data?.averageResponseTime || "0s"} 
          icon={Clock} 
          trend="down" 
          trendValue="-2%"
          subtitle="Optimized"
        />
        <StatCard 
          title="Avg. Tokens / Req" 
          value={(data?.averageTokens || 0).toLocaleString()} 
          icon={Zap} 
        />
        <StatCard 
          title="Failed Requests" 
          value={(data?.failedRequests || 0).toLocaleString()} 
          icon={AlertTriangle} 
          trend="up" 
          trendValue={`${data?.rateLimitErrors || 0} rate limits`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-zinc-900">API Calls Volume</h3>
          </div>
          <OverviewAreaChart 
            data={chartData} 
            color="#3b82f6" 
          />
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-zinc-900 mb-4">Model Usage</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-zinc-700">Google Gemini</span>
                <span className="font-bold text-zinc-900">{data?.providers?.gemini?.toLocaleString() || 0} reqs</span>
              </div>
              <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-zinc-700">OpenAI</span>
                <span className="font-bold text-zinc-900">{data?.providers?.openai?.toLocaleString() || 0} reqs</span>
              </div>
              <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-zinc-700">Anthropic Claude</span>
                <span className="font-bold text-zinc-900">0 reqs</span>
              </div>
              <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
