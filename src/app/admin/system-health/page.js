"use client";

import { useEffect, useState } from "react";
import { Activity, Database, Cpu, HardDrive, Server, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export default function AdminSystemHealthPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/admin/system-health");
        const json = await res.json();
        if (json.success) setHealth(json.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
    // Poll every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
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

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const isHealthy = health?.status === "operational";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">System Health</h1>
          <p className="text-zinc-500 mt-1">Real-time monitoring of infrastructure and services.</p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium shadow-sm ${
          isHealthy ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {isHealthy ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {isHealthy ? "All Systems Operational" : "Degraded Performance"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* DB Status */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Database size={20} />
              </div>
              <h3 className="font-bold text-zinc-900">Database</h3>
            </div>
            <div className={`h-2.5 w-2.5 rounded-full ${health?.database === "healthy" ? "bg-emerald-500" : "bg-red-500"}`} />
          </div>
          <p className="text-3xl font-bold tracking-tight text-zinc-900 capitalize">{health?.database}</p>
          <p className="mt-1 text-sm text-zinc-500">MongoDB Connection</p>
        </div>

        {/* Memory */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
                <HardDrive size={20} />
              </div>
              <h3 className="font-bold text-zinc-900">Memory</h3>
            </div>
            <span className="text-sm font-semibold text-zinc-500">{health?.memory?.percent}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden mb-3">
            <div 
              className={`h-full rounded-full ${health?.memory?.percent > 90 ? 'bg-red-500' : 'bg-violet-500'}`} 
              style={{ width: `${health?.memory?.percent}%` }}
            />
          </div>
          <p className="text-sm text-zinc-500">
            {formatBytes(health?.memory?.used)} / {formatBytes(health?.memory?.total)}
          </p>
        </div>

        {/* CPU */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Cpu size={20} />
              </div>
              <h3 className="font-bold text-zinc-900">CPU Load</h3>
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-zinc-900">{health?.cpu?.load}</p>
          <p className="mt-1 text-sm text-zinc-500">{health?.cpu?.cores} Cores • 1 min avg</p>
        </div>

        {/* Uptime */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Server size={20} />
              </div>
              <h3 className="font-bold text-zinc-900">Uptime</h3>
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight text-zinc-900">{formatUptime(health?.uptime)}</p>
          <p className="mt-1 text-sm text-zinc-500">Server runtime</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="font-bold text-zinc-900">System Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-zinc-500 mb-1">Environment</p>
              <p className="font-semibold text-zinc-900 capitalize">{health?.environment}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 mb-1">Version</p>
              <p className="font-semibold text-zinc-900">v{health?.version}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 mb-1">Node.js</p>
              <p className="font-semibold text-zinc-900">v20.x</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500 mb-1">Region</p>
              <p className="font-semibold text-zinc-900">us-east-1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
