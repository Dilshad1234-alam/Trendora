"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, ShieldAlert, Sparkles, AlertCircle, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function CompetitorAnalysisPage() {
  const [competitorName, setCompetitorName] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!competitorName.trim()) {
      setError("Please enter a competitor name.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setResult(null);

      const res = await fetch("/api/business-pro/competitor-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitorName, focusArea }),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.data.content);
      } else {
        setError(data.error || "Failed to generate analysis.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[800px] max-w-full -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10">
          <Link href="/business-pro/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-6 transition">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <ShieldAlert size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full border border-violet-200">
                   PRO FEATURE
                </span>
              </div>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-950">
                Competitor Analysis
              </h1>
              <p className="mt-1 text-sm text-zinc-600">
                Identify their weaknesses and generate strategies to beat them.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-sm text-red-700">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm h-fit">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Competitor Name or URL</label>
                <input
                  type="text"
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                  placeholder="e.g. McDonald's or local store"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-zinc-700">Focus Area (Optional)</label>
                <input
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="e.g. Pricing, Social Media, Quality"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-4 font-bold text-white transition hover:bg-violet-800 disabled:opacity-50 shadow-lg shadow-violet-200"
              >
                {generating ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {generating ? "Analyzing Competitor..." : "Run AI Analysis"}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 min-h-[400px]">
            {generating ? (
              <div className="flex flex-col items-center justify-center h-full text-violet-700 gap-4">
                <LoaderCircle size={40} className="animate-spin" />
                <p className="font-semibold text-zinc-900">Scanning market data...</p>
                <p className="text-sm text-zinc-500">Formulating counter-strategies.</p>
              </div>
            ) : result ? (
              <div className="prose prose-zinc max-w-none prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-strong:text-violet-700">
                <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-4">
                  <ShieldAlert className="text-red-600" />
                  <h2 className="text-xl font-bold text-zinc-900 !m-0">AI Strategic Report</h2>
                </div>
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4">
                <FileText size={48} className="opacity-50" />
                <p>Your analysis report will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
