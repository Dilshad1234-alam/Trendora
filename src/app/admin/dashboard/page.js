"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Briefcase, 
  Crown, 
  FileText,
  Activity,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentSignups, setRecentSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        
        if (res.ok && data.success) {
          setStats(data.stats);
          setRecentSignups(data.recentSignups);
        } else {
          setError(data.error || "Failed to load stats");
        }
      } catch (err) {
        setError("Network error occurred.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center">
        <Activity className="animate-spin text-violet-700" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          <ShieldAlert className="mb-2" size={24} />
          <h2 className="text-lg font-bold">Error Loading Dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-200" },
    { label: "Pro Users", value: stats?.proUsers || 0, icon: Crown, color: "text-violet-700", bg: "bg-violet-100", border: "border-violet-200" },
    { label: "Agency Users", value: stats?.agencyUsers || 0, icon: Briefcase, color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200" },
    { label: "AI Generations", value: stats?.totalContentGenerated || 0, icon: FileText, color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200" },
  ];

  return (
    <div className="p-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Platform Overview</h1>
        <p className="mt-1 text-zinc-600">Welcome to the Trendora Admin Console.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 transition-all hover:shadow-md hover:border-zinc-300">
              <div className="relative z-10">
                <div className={`mb-4 inline-flex rounded-xl p-3 ${card.bg} ${card.color} ${card.border} border`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-3xl font-bold text-zinc-950">{card.value}</h3>
                <p className="mt-1 text-sm font-semibold text-zinc-500">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Recent Signups */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">Recent Signups</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-600">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="rounded-l-xl px-4 py-3 font-bold border-y border-l border-zinc-200">User</th>
                  <th className="px-4 py-3 font-bold border-y border-zinc-200">Role</th>
                  <th className="px-4 py-3 font-bold border-y border-zinc-200">Plan</th>
                  <th className="rounded-r-xl px-4 py-3 font-bold border-y border-r border-zinc-200">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentSignups.map((user) => (
                  <tr key={user._id} className="transition-colors hover:bg-zinc-50">
                    <td className="px-4 py-4">
                      <div className="font-bold text-zinc-900">{user.fullname}</div>
                      <div className="text-xs text-zinc-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-xs font-bold text-zinc-700">
                        {user.role || "None"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        user.plan === "agency" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                        user.plan.includes("pro") ? "bg-violet-100 text-violet-700 border border-violet-200" :
                        "bg-zinc-100 text-zinc-700 border border-zinc-200"
                      }`}>
                        {user.plan || "free"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-zinc-900">User Distribution</h2>
            <div className="space-y-5">
              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-semibold text-zinc-600">Creators</span>
                  <span className="font-bold text-zinc-900">{stats?.totalCreators || 0}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100">
                  <div 
                    className="h-2 rounded-full bg-blue-500" 
                    style={{ width: `${Math.min(100, ((stats?.totalCreators || 0) / (stats?.totalUsers || 1)) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-semibold text-zinc-600">Businesses</span>
                  <span className="font-bold text-zinc-900">{stats?.totalBusinesses || 0}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100">
                  <div 
                    className="h-2 rounded-full bg-violet-600" 
                    style={{ width: `${Math.min(100, ((stats?.totalBusinesses || 0) / (stats?.totalUsers || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
