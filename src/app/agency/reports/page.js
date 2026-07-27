"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, FileText, Download, Send, Building2, BarChart, CheckCircle2, Crown, Sparkles } from "lucide-react";

export default function AgencyReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  
  const handleGenerate = (e) => {
    e.preventDefault();
    setGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setGenerating(false);
      setReportReady(true);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
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
                Auto-generate beautiful, white-labeled performance reports for your clients.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm p-6 h-fit">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Report Settings</h2>
            
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Select Client</label>
                <select className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white">
                  <option>Acme Corp</option>
                  <option>TechFlow Solutions</option>
                  <option>Global Real Estate</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Date Range</label>
                <select className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white">
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                  <option>Last Quarter</option>
                </select>
              </div>
              
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">Include Sections</label>
                <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-zinc-300 text-violet-600 accent-violet-600" /> Content Summary
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-zinc-300 text-violet-600 accent-violet-600" /> AI Hours Saved (ROI)
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                  <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-zinc-300 text-violet-600 accent-violet-600" /> Generated Asset Links
                </label>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-100">
                <button type="submit" disabled={generating} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-4 font-semibold text-white hover:bg-violet-800 transition disabled:opacity-50 shadow-lg shadow-violet-200">
                  {generating ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />} 
                  {generating ? 'Compiling Report...' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="border-b border-zinc-100 bg-zinc-50/50 p-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-700 flex items-center gap-2">
                <Crown size={16} className="text-violet-500" /> White-Label Preview
              </h2>
              {reportReady && (
                <div className="flex gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-violet-700 hover:border-violet-200 transition" title="Download PDF">
                    <Download size={16} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-violet-700 hover:border-violet-200 transition" title="Email to Client">
                    <Send size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-8 flex-1 bg-zinc-100/30 flex items-center justify-center">
              {!reportReady && !generating ? (
                <div className="text-center max-w-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 text-violet-300">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-400">No Report Generated</h3>
                  <p className="mt-2 text-sm text-zinc-400">Select settings on the left to generate a preview of the client report.</p>
                </div>
              ) : generating ? (
                <div className="text-center">
                  <LoaderCircle size={40} className="animate-spin text-violet-500 mx-auto mb-4" />
                  <p className="font-semibold text-zinc-600">Gathering client data...</p>
                </div>
              ) : (
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-zinc-200 p-8 transform scale-95 origin-top transition-all">
                  {/* Mock Report Design */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="h-8 w-24 bg-violet-700 rounded mb-2"></div>
                      <p className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Marketing Report</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900">Acme Corp</p>
                      <p className="text-xs text-zinc-500">May 2026</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-black text-zinc-900 border-b pb-2 mb-4">Executive Summary</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      This month, our automated pipelines successfully delivered 42 assets precisely tuned to Acme Corp's brand voice, focusing on Gen Z engagement.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-center">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Assets</p>
                      <p className="text-2xl font-black text-violet-700">42</p>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-center">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Hours Saved</p>
                      <p className="text-2xl font-black text-emerald-600">38h</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Asset Breakdown</h4>
                    {[
                      { name: 'Social Posts', val: '24' },
                      { name: 'Ad Copies', val: '12' },
                      { name: 'Video Scripts', val: '6' }
                    ].map(item => (
                      <div key={item.name} className="flex justify-between items-center text-xs p-2 bg-zinc-50 rounded">
                        <span className="text-zinc-600">{item.name}</span>
                        <span className="font-bold text-zinc-900">{item.val}</span>
                      </div>
                    ))}
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
