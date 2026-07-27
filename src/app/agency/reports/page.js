"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, FileText, Download, Send, Building2, Crown, Sparkles, CheckSquare, Clock, BarChart } from "lucide-react";
import { getAgencyReportPreview, getAgencyClients } from "@/services/agency-tools.api";

export default function AgencyReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");
  const [loadingClients, setLoadingClients] = useState(true);
  
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [dateRange, setDateRange] = useState("last-30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function loadClients() {
      try {
        setLoadingClients(true);
        const res = await getAgencyClients({ limit: 100 });
        if (res.data) {
          const clientsList = res.data.clients || (Array.isArray(res.data) ? res.data : []);
          setClients(clientsList);
          if (clientsList.length > 0) setClientId(clientsList[0]._id);
        }
      } catch (err) {
        console.error("Failed to load clients:", err);
      } finally {
        setLoadingClients(false);
      }
    }
    loadClients();
  }, []);

  useEffect(() => {
    // Auto-calculate dates based on preset
    if (dateRange !== "custom") {
      const end = new Date();
      let start = new Date();
      if (dateRange === "last-30") {
        start.setDate(end.getDate() - 30);
      } else if (dateRange === "this-month") {
        start = new Date(end.getFullYear(), end.getMonth(), 1);
      } else if (dateRange === "last-quarter") {
        start.setMonth(end.getMonth() - 3);
      }
      
      // eslint-disable-next-line
      setStartDate(start.toISOString().split("T")[0]);
      // eslint-disable-next-line
      setEndDate(end.toISOString().split("T")[0]);
    }
  }, [dateRange]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!clientId) {
      setError("Please select a client.");
      return;
    }
    
    setGenerating(true);
    setError("");
    setReportData(null);
    
    try {
      const res = await getAgencyReportPreview({ clientId, startDate, endDate });
      setReportData(res.data);
    } catch (err) {
      setError(err.message || "Failed to generate report preview.");
    } finally {
      setGenerating(false);
    }
  };

  const getPlatformColor = (platform) => {
    switch(platform?.toLowerCase()) {
      case "creator": return "bg-pink-100 text-pink-700 border-pink-200";
      case "business": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-12">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link href="/agency/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-lg shadow-violet-200">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-950">
                Client Reports
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                Generate dynamic, data-driven performance reports connected to your content pipeline.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 flex justify-between items-center rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={() => setError("")} className="font-bold hover:opacity-70">×</button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[380px_1fr] items-start">
          
          {/* Settings Sidebar */}
          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm p-6 sticky top-6">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Report Settings</h2>
            
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Select Client</label>
                {loadingClients ? (
                  <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 flex items-center gap-2">
                    <LoaderCircle size={16} className="animate-spin" /> Loading clients...
                  </div>
                ) : (
                  <select 
                    value={clientId} 
                    onChange={(e) => setClientId(e.target.value)} 
                    className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled>-- Select a Client --</option>
                    {clients.map(c => (
                      <option key={c._id} value={c._id}>{c.name || c.businessName || c.creatorName}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Date Range</label>
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)} 
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white appearance-none cursor-pointer mb-3"
                >
                  <option value="last-30">Last 30 Days</option>
                  <option value="this-month">This Month</option>
                  <option value="last-quarter">Last Quarter</option>
                  <option value="custom">Custom Range</option>
                </select>

                {dateRange === "custom" && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Start</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full rounded-lg border border-zinc-200 p-2 text-xs outline-none focus:border-violet-500" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">End</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full rounded-lg border border-zinc-200 p-2 text-xs outline-none focus:border-violet-500" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">Include Sections</label>
                <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-zinc-300 text-violet-600 accent-violet-600" /> Content Delivery Summary
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-zinc-300 text-violet-600 accent-violet-600" /> AI Hours Saved (ROI)
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-zinc-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-zinc-300 text-violet-600 accent-violet-600" /> Pipeline Status Breakdown
                </label>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100">
                <button 
                  type="submit" 
                  disabled={generating || !clientId} 
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-4 font-semibold text-white hover:bg-violet-800 transition disabled:opacity-50 shadow-lg shadow-violet-200"
                >
                  {generating ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />} 
                  {generating ? 'Compiling Report...' : 'Generate Report Preview'}
                </button>
              </div>
            </form>
          </div>

          {/* Report Canvas */}
          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <div className="border-b border-zinc-100 bg-zinc-50/50 p-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                <Crown size={16} className="text-violet-500" /> Agency White-Label Preview
              </h2>
              {reportData && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const query = new URLSearchParams({ clientId, startDate, endDate }).toString();
                      window.open(`/api/agency/reports/pdf?${query}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-violet-700 hover:border-violet-200 transition"
                  >
                    <Download size={14} /> Export PDF
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-violet-700 hover:border-violet-200 transition">
                    <Send size={14} /> Send
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-8 flex-1 bg-zinc-100/40 flex justify-center">
              {!reportData && !generating ? (
                <div className="text-center max-w-sm my-auto">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-300">
                    <BarChart size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-400">No Report Generated</h3>
                  <p className="mt-2 text-sm text-zinc-400">Select a client and date range on the left to pull live analytics.</p>
                </div>
              ) : generating ? (
                <div className="text-center my-auto">
                  <LoaderCircle size={40} className="animate-spin text-violet-500 mx-auto mb-4" />
                  <p className="font-semibold text-zinc-600">Gathering client data from MongoDB...</p>
                </div>
              ) : (
                <div className="w-full max-w-[800px] bg-white rounded-xl shadow-xl border border-zinc-200 p-10 print:shadow-none print:border-none print:p-0">
                  
                  {/* Report Header */}
                  <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-zinc-100">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 bg-violet-700 rounded-lg flex items-center justify-center text-white">
                           <Building2 size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Monthly Insights</h1>
                      </div>
                      <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider ml-13">
                        {new Date(startDate).toLocaleDateString()} — {new Date(endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-zinc-900 mb-1">{reportData.client}</p>
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getPlatformColor(reportData.clientType)}`}>
                        {reportData.clientType || "Business"} Client
                      </span>
                    </div>
                  </div>
                  
                  {/* Exec Summary */}
                  <div className="mb-10">
                    <h3 className="text-lg font-black text-zinc-900 mb-3">Executive Summary</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                      During this period, our automated content pipeline successfully generated <span className="font-bold text-violet-700">{reportData.totalAssets} unique assets</span> precisely tuned to your brand voice. By utilizing advanced AI capabilities, our agency saved an estimated <span className="font-bold text-emerald-600">{reportData.hoursSaved} hours</span> of manual production time, accelerating your marketing delivery.
                    </p>
                  </div>
                  
                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm text-center">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Total Assets</p>
                      <p className="text-3xl font-black text-zinc-900">{reportData.totalAssets}</p>
                    </div>
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 shadow-sm text-center">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex justify-center items-center gap-1">
                        <Clock size={12} /> Time Saved
                      </p>
                      <p className="text-3xl font-black text-emerald-700">{reportData.hoursSaved}<span className="text-lg">h</span></p>
                    </div>
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 shadow-sm text-center">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">Published</p>
                      <p className="text-3xl font-black text-blue-700">{reportData.contentByStatus?.published || 0}</p>
                    </div>
                    <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 shadow-sm text-center">
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">In Review</p>
                      <p className="text-3xl font-black text-amber-700">
                        {(reportData.contentByStatus?.["internal-review"] || 0) + (reportData.contentByStatus?.["client-review"] || 0)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Two Column Layout for Breakdown */}
                  <div className="grid md:grid-cols-2 gap-8 mb-6">
                    
                    {/* Content Types Breakdown */}
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">Asset Breakdown</h4>
                      <div className="space-y-2">
                        {reportData.breakdown && reportData.breakdown.length > 0 ? reportData.breakdown.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm p-3 bg-white rounded-xl border border-zinc-100 shadow-sm">
                            <span className="text-zinc-600 font-medium capitalize">{item.name}</span>
                            <span className="font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">{item.val}</span>
                          </div>
                        )) : (
                          <div className="text-center text-zinc-400 text-sm py-8 bg-zinc-50 rounded-xl border border-zinc-100">No content generated.</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Pipeline Breakdown */}
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">Pipeline Status</h4>
                      <div className="space-y-2">
                        {Object.entries(reportData.contentByStatus || {})
                          .filter(([_, val]) => val > 0)
                          .sort((a, b) => b[1] - a[1])
                          .map(([status, count], i) => (
                          <div key={i} className="flex justify-between items-center text-sm p-3 bg-white rounded-xl border border-zinc-100 shadow-sm">
                            <span className="text-zinc-600 font-medium capitalize flex items-center gap-2">
                              {status === 'published' && <CheckSquare size={14} className="text-emerald-500" />}
                              {status.replace("-", " ")}
                            </span>
                            <span className="font-bold text-zinc-900">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                  </div>

                  {/* Team Contribution Footer */}
                  <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
                    <p className="text-xs text-zinc-400">
                      Generated securely via <span className="font-semibold text-violet-600">Trendora Agency OS</span>
                    </p>
                  </div>
                  
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
