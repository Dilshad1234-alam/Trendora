"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, Activity, DollarSign, Bot, TrendingUp, Briefcase } from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import { OverviewAreaChart, OverviewBarChart } from "@/components/admin/AdminCharts";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-zinc-200/50 rounded-2xl"></div>
        ))}
        <div className="md:col-span-2 lg:col-span-4 h-96 bg-zinc-200/50 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Overview</h1>
          <p className="text-zinc-500 mt-1">Here's what's happening across Trendora today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={data?.totalUsers?.toLocaleString() || 0} 
          icon={Users} 
          trend="up" 
          trendValue="+12%"
          subtitle={`${data?.activeUsers} active this month`}
        />
        <StatCard 
          title="Monthly Revenue (MRR)" 
          value={`$${(data?.mrr || 0).toLocaleString()}`} 
          icon={DollarSign} 
          trend="up" 
          trendValue="+8%"
          subtitle={`ARR: $${(data?.arr || 0).toLocaleString()}`}
        />
        <StatCard 
          title="AI Requests Today" 
          value={data?.aiRequestsToday?.toLocaleString() || 0} 
          icon={Bot} 
          trend="up" 
          trendValue="+24%"
          subtitle={`Total: ${data?.totalAiRequests?.toLocaleString() || 0}`}
        />
        <StatCard 
          title="Paid Subscriptions" 
          value={data?.paidUsers?.toLocaleString() || 0} 
          icon={Briefcase} 
          trend="up" 
          trendValue="18% conv. rate"
          subtitle={`${data?.freeTrialUsers} currently in trial`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-zinc-900">User Growth</h3>
            <p className="text-sm text-zinc-500">New user signups over the last 7 days</p>
          </div>
          <OverviewAreaChart data={data?.charts?.userGrowth || []} />
        </div>
        
        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-zinc-900">Revenue</h3>
            <p className="text-sm text-zinc-500">Revenue collected over the last 7 days</p>
          </div>
          <OverviewBarChart 
            data={data?.charts?.revenueGrowth || []} 
            bars={[{ key: "value", name: "Revenue", color: "#7c3aed" }]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-zinc-900 mb-4">Workspace Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-zinc-700">Creator</span>
                <span className="text-zinc-500">{data?.creatorUsers} users</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((data?.creatorUsers || 0) / (data?.totalUsers || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-zinc-700">Business</span>
                <span className="text-zinc-500">{data?.businessUsers} users</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: `${((data?.businessUsers || 0) / (data?.totalUsers || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-zinc-700">Agency</span>
                <span className="text-zinc-500">{data?.agencyUsers} users</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${((data?.agencyUsers || 0) / (data?.totalUsers || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-zinc-900 mb-4">Activity Feed</h3>
          <div className="space-y-6">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-zinc-900">New Agency Purchased</p>
                <p className="text-xs text-zinc-500">Alex joined as Agency • 2 mins ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-zinc-900">AI Usage Spike detected</p>
                <p className="text-xs text-zinc-500">High API traffic from Creators • 15 mins ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-zinc-900">New Creator Registered</p>
                <p className="text-xs text-zinc-500">Sarah started trial • 1 hour ago</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Trial Expired</p>
                <p className="text-xs text-zinc-500">John&apos;s 7-day trial ended • 3 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
