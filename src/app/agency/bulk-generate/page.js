"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, LoaderCircle, CheckCircle2, ListPlus } from "lucide-react";
import { generateBulkContent } from "@/services/agency-tools.api";

export default function AgencyBulkGeneratePage() {
  const [topicsInput, setTopicsInput] = useState("");
  const [contentType, setContentType] = useState("business-post");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topicsInput.trim()) {
      setError("Please enter at least one topic.");
      return;
    }

    const topicsList = topicsInput.split("\n").map(t => t.trim()).filter(Boolean);
    if (topicsList.length === 0) {
      setError("Please enter valid topics.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setResults([]);
      
      const res = await generateBulkContent({
        topics: topicsList,
        contentType
      });
      
      setResults(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to generate bulk content");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[800px] max-w-full -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link href="/agency/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <ListPlus size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-950">
                Bulk Generator
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                Generate AI content for multiple topics at once.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm p-6 h-fit">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Content Type</label>
                <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white">
                  <option value="business-post">Social Media Post</option>
                  <option value="ad-copy">Ad Copy</option>
                  <option value="script">Video Script</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Topics (One per line)</label>
                <textarea 
                  value={topicsInput} 
                  onChange={(e) => setTopicsInput(e.target.value)} 
                  rows={8}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none font-mono text-sm" 
                  placeholder={"Summer sale promotion\nNew product launch\nCustomer testimonial highlight"} 
                />
              </div>

              <button type="submit" disabled={generating} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-4 font-semibold text-white hover:bg-violet-800 transition disabled:opacity-50 shadow-lg shadow-violet-200">
                {generating ? <LoaderCircle size={18} className="animate-spin" /> : <FileText size={18} />} Generate Batch
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 min-h-[500px]">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">Results</h2>
            
            {generating ? (
              <div className="flex flex-col items-center justify-center h-64 text-violet-700">
                <LoaderCircle size={32} className="animate-spin mb-4" />
                <p className="font-semibold">Generating content in batch...</p>
                <p className="text-sm text-zinc-500 mt-2">This might take a moment.</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {results.map((result, idx) => (
                  <div key={idx} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={14} />
                      </span>
                      <h3 className="font-bold text-zinc-900">{result.title}</h3>
                    </div>
                    <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700 font-mono whitespace-pre-wrap border border-zinc-100">
                      {result.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                <FileText size={48} className="mb-4 opacity-50" />
                <p>Generated content will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
