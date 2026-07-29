"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, FileText, LoaderCircle, CheckCircle2, 
  ListPlus, AlertCircle, RefreshCw, Copy, ExternalLink 
} from "lucide-react";
import { getAgencyClients, generateBulkContent } from "@/services/agency-tools.api";

const CREATOR_OPTIONS = [
  { value: "hook", label: "Hook Generator" },
  { value: "script", label: "Video Script" },
  { value: "creator-caption", label: "Social Caption" },
  { value: "creator-hashtag", label: "Hashtags" },
  { value: "reel-idea", label: "Reel Ideas" },
  { value: "thumbnail-title", label: "Thumbnail Title" },
  { value: "video-description", label: "Video Description" }
];

const BUSINESS_OPTIONS = [
  { value: "business-post", label: "Social Media Post" },
  { value: "business-caption", label: "Business Caption" },
  { value: "business-hashtag", label: "Business Hashtags" },
  { value: "ad-copy", label: "Ad Copy" },
  { value: "product-description", label: "Product Description" },
  { value: "local-seo", label: "Local SEO Update" },
  { value: "review-reply", label: "Review Reply" },
  { value: "whatsapp-reply", label: "WhatsApp Reply" }
];

export default function AgencyBulkGeneratePage() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [topicsInput, setTopicsInput] = useState("");
  const [contentType, setContentType] = useState("");
  
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await getAgencyClients({ limit: 100 });
        setClients(res.data?.clients || (Array.isArray(res.data) ? res.data : []));
      } catch (err) {
        console.error("Failed to load clients", err);
      }
    };
    fetchClients();
  }, []);

  // Update content type options when client changes
  useEffect(() => {
    // eslint-disable-next-line
    if (selectedClient) {
      if (selectedClient.clientType === "creator") {
        setContentType(CREATOR_OPTIONS[0].value);
      } else {
        setContentType(BUSINESS_OPTIONS[0].value);
      }
    } else {
      setContentType("");
    }
  }, [selectedClient]);

  const handleGenerate = async (e, specificTopics = null) => {
    if (e) e.preventDefault();
    if (!selectedClient) {
      setError("Please select a client first.");
      return;
    }

    const topicsList = specificTopics || topicsInput.split("\n").map(t => t.trim()).filter(Boolean);
    if (topicsList.length === 0) {
      setError("Please enter valid topics.");
      return;
    }

    if (topicsList.length > 10) {
      setError("Maximum 10 topics allowed per batch.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      
      // If full submission, clear results. If retry, we append or replace.
      if (!specificTopics) {
        setResults([]);
      }
      
      const res = await generateBulkContent({
        clientId: selectedClient._id,
        topics: topicsList,
        contentType
      });
      
      if (res.results) {
        if (specificTopics) {
          // Replace retried items in the results array
          setResults(prev => {
            const newResults = [...prev];
            res.results.forEach(newRes => {
              const idx = newResults.findIndex(r => r.topic === newRes.topic && !r.success);
              if (idx !== -1) newResults[idx] = newRes;
              else newResults.push(newRes);
            });
            return newResults;
          });
        } else {
          setResults(res.results);
        }
      } else {
        throw new Error(res.error || "Failed to parse generation results.");
      }
    } catch (err) {
      setError(err.message || "Failed to generate bulk content");
    } finally {
      setGenerating(false);
    }
  };

  const handleRetryFailed = () => {
    const failedTopics = results.filter(r => !r.success).map(r => r.topic);
    if (failedTopics.length > 0) {
      handleGenerate(null, failedTopics);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeOptions = selectedClient?.clientType === "creator" ? CREATOR_OPTIONS : BUSINESS_OPTIONS;

  const successfulCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900 pb-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[800px] max-w-full -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
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
                Bulk AI Generator
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                Generate up to 10 pieces of highly-tailored client content simultaneously.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          {/* Controls Panel */}
          <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm p-6 h-fit">
            <form onSubmit={handleGenerate} className="space-y-6">
              
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Target Client</label>
                <select 
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white font-medium"
                  onChange={(e) => {
                    const client = clients.find(c => c._id === e.target.value);
                    setSelectedClient(client || null);
                  }}
                  value={selectedClient?._id || ""}
                >
                  <option value="">-- Select a Client --</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.clientType})</option>
                  ))}
                </select>
                {selectedClient && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Active Profile:</span>
                    <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-violet-700">
                      {selectedClient.clientType}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Content Type</label>
                <select 
                  value={contentType} 
                  onChange={(e) => setContentType(e.target.value)} 
                  disabled={!selectedClient}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 bg-white disabled:opacity-50 disabled:bg-zinc-50 font-medium"
                >
                  {activeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <span>Topics</span>
                  <span className="text-zinc-400 font-normal">Max 10 / One per line</span>
                </label>
                <textarea 
                  value={topicsInput} 
                  onChange={(e) => setTopicsInput(e.target.value)} 
                  disabled={!selectedClient}
                  rows={8}
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none font-mono text-sm disabled:opacity-50 disabled:bg-zinc-50 leading-relaxed" 
                  placeholder={"Summer sale promotion\nNew product launch\nCustomer testimonial highlight"} 
                />
              </div>

              <button 
                type="submit" 
                disabled={generating || !selectedClient || !topicsInput.trim()} 
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-4 font-bold text-white hover:bg-violet-800 transition hover:shadow-lg hover:shadow-violet-200 disabled:opacity-50 disabled:pointer-events-none"
              >
                {generating ? (
                  <><LoaderCircle size={18} className="animate-spin" /> Processing Batch...</>
                ) : (
                  <><FileText size={18} /> Generate Batch</>
                )}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Batch Results</h2>
              
              {results.length > 0 && (
                <div className="flex items-center gap-4 text-sm font-semibold">
                  <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={16}/> {successfulCount}</span>
                  {failedCount > 0 && (
                    <span className="text-red-600 flex items-center gap-1"><AlertCircle size={16}/> {failedCount}</span>
                  )}
                  {failedCount > 0 && !generating && (
                    <button 
                      onClick={handleRetryFailed}
                      className="flex items-center gap-1.5 rounded-lg bg-white border border-zinc-200 px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 shadow-sm transition"
                    >
                      <RefreshCw size={14} /> Retry Failed
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {generating && results.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-violet-700">
                <LoaderCircle size={40} className="animate-spin mb-4" />
                <p className="font-semibold text-lg">AI is generating content...</p>
                <p className="text-sm text-zinc-500 mt-2">This may take up to 20 seconds to prevent rate limits.</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {results.map((result, idx) => (
                  <div key={idx} className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${result.success ? 'border-zinc-200' : 'border-red-200 bg-red-50/30'}`}>
                    
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${result.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {result.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        </span>
                        <h3 className="font-bold text-zinc-900 leading-tight pt-0.5">{result.topic}</h3>
                      </div>
                      
                      {result.success && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => copyToClipboard(result.output, idx)}
                            className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-200 hover:text-zinc-900"
                          >
                            {copiedId === idx ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                            {copiedId === idx ? "Copied" : "Copy"}
                          </button>
                          {selectedClient && (
                            <Link 
                              href={`/agency/clients/${selectedClient._id}`}
                              className="flex items-center gap-1.5 rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-200 hover:text-violet-800"
                              title="Open Client Pipeline"
                            >
                              <ExternalLink size={14} /> Pipeline
                            </Link>
                          )}
                        </div>
                      )}
                    </div>

                    {result.success ? (
                      <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700 font-mono whitespace-pre-wrap border border-zinc-100">
                        {result.output}
                      </div>
                    ) : (
                      <div className="ml-9 rounded-lg bg-white/50 px-3 py-2 text-sm text-red-600 border border-red-100">
                        {result.error || "Generation failed."}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-zinc-400">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 mb-4">
                  <ListPlus size={32} className="opacity-50" />
                </div>
                <p className="font-medium text-zinc-500">Ready to bulk generate</p>
                <p className="text-sm mt-1">Select a client and enter topics to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}


