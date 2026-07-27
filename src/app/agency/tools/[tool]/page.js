"use client";

import { useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Sparkles, LoaderCircle, CheckCircle2, 
  AlertCircle, Copy, FileText 
} from "lucide-react";

const TOOL_CONFIG = {
  "hook": { name: "Hook Generator", fields: ["topic"] },
  "script": { name: "Script Generator", fields: ["topic"] },
  "caption": { name: "Caption Generator", fields: ["topic", "platform"] },
  "creator-caption": { name: "Creator Caption", fields: ["topic", "platform"] },
  "hashtag": { name: "Hashtag Generator", fields: ["topic"] },
  "creator-hashtag": { name: "Creator Hashtag", fields: ["topic"] },
  "reel-idea": { name: "Reel Idea Generator", fields: ["topic"] },
  "thumbnail-title": { name: "Thumbnail Title", fields: ["topic"] },
  "video-description": { name: "Video Description", fields: ["topic"] },
  "business-post": { name: "Business Post", fields: ["topic", "platform"] },
  "business-caption": { name: "Business Caption", fields: ["topic", "platform"] },
  "business-hashtag": { name: "Business Hashtag", fields: ["topic"] },
  "ad-copy": { name: "Ad Copy Generator", fields: ["topic", "platform", "objective", "cta"] },
  "product-description": { name: "Product Description", fields: ["productName"] },
  "local-seo": { name: "Local SEO Update", fields: ["topic"] },
  "review-reply": { name: "Review Reply", fields: ["reviewText", "rating"] },
  "whatsapp-reply": { name: "WhatsApp Reply", fields: ["message"] },
};

export default function AgencyToolPage({ params }) {
  const unwrappedParams = use(params);
  const toolId = unwrappedParams.tool;
  
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");
  const router = useRouter();

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const config = TOOL_CONFIG[toolId] || { name: "AI Generator", fields: ["topic"] };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) {
      setError("Client ID is missing. Please open this tool from the client workspace.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch("/api/agency/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          contentType: toolId,
          formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Generation failed.");
      }

      setResult(data.data.output);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 pb-12 font-sans text-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            href={clientId ? `/agency/clients/${clientId}` : "/agency/clients"} 
            className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-violet-600 transition"
          >
            <ArrowLeft size={16} /> Back to Workspace
          </Link>
        </div>

        <div className="mb-8">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-inner">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-black text-zinc-900">{config.name}</h1>
          <p className="mt-2 text-zinc-500">
            Powered by Trendora AI and automatically tailored to your client&apos;s Brand Memory.
          </p>
        </div>

        {error && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Input Form */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {config.fields.includes("topic") && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">Content Topic</label>
                  <textarea
                    name="topic"
                    required
                    rows={4}
                    placeholder="E.g., 5 ways to save money on taxes this year..."
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    onChange={handleChange}
                  />
                </div>
              )}

              {config.fields.includes("productName") && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">Product Name</label>
                  <input
                    type="text"
                    name="productName"
                    required
                    placeholder="E.g., Premium Leather Wallet"
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    onChange={handleChange}
                  />
                </div>
              )}

              {config.fields.includes("platform") && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">Platform</label>
                  <select
                    name="platform"
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    onChange={handleChange}
                  >
                    <option value="">Select Platform...</option>
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Twitter">Twitter</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>
              )}

              {config.fields.includes("objective") && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">Campaign Objective</label>
                  <select
                    name="objective"
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    onChange={handleChange}
                  >
                    <option value="">Select Objective...</option>
                    <option value="Generate Leads">Generate Leads</option>
                    <option value="Increase Sales">Increase Sales</option>
                    <option value="Brand Awareness">Brand Awareness</option>
                  </select>
                </div>
              )}

              {config.fields.includes("cta") && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">Call to Action</label>
                  <input
                    type="text"
                    name="cta"
                    placeholder="E.g., Learn More, Buy Now, Subscribe"
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    onChange={handleChange}
                  />
                </div>
              )}

              {config.fields.includes("reviewText") && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">Customer Review</label>
                  <textarea
                    name="reviewText"
                    required
                    rows={3}
                    placeholder="Paste the customer's review here..."
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    onChange={handleChange}
                  />
                </div>
              )}

              {config.fields.includes("rating") && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">Rating (1-5)</label>
                  <input
                    type="number"
                    name="rating"
                    min="1"
                    max="5"
                    defaultValue="5"
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    onChange={handleChange}
                  />
                </div>
              )}

              {config.fields.includes("message") && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-zinc-700">Customer Message</label>
                  <textarea
                    name="message"
                    required
                    rows={3}
                    placeholder="Paste the WhatsApp message here..."
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-sm outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                    onChange={handleChange}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 font-bold text-white transition hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-600/20 disabled:pointer-events-none disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={20} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Content
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Output Display */}
          <div className="flex flex-col rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 p-6">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <FileText size={18} className="text-violet-600"/> Result
              </h3>
              {result && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-200 hover:text-zinc-900"
                >
                  {copied ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            
            <div className="flex-1 p-6">
              {result ? (
                <div className="prose prose-sm prose-zinc max-w-none whitespace-pre-wrap rounded-2xl bg-zinc-50 p-6 text-zinc-700">
                  {result}
                </div>
              ) : (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-zinc-400">
                  <Sparkles size={40} className="mb-4 opacity-20" />
                  <p className="text-sm">Your generated content will appear here.</p>
                  <p className="mt-1 text-xs text-zinc-500">It is automatically saved to your client&apos;s workspace as a Draft.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
