"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Star, Clipboard, Check } from "lucide-react";
import { generateBusinessProReviewReply } from "@/services/business-pro.api";

export default function BusinessProReviewReplyGenerator() {
  const [formData, setFormData] = useState({
    reviewText: "",
    rating: 5,
    customerName: "",
    tone: "professional",
    businessName: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setResult(null);
      const res = await generateBusinessProReviewReply(formData);
      setResult(res.data.reply);
    } catch (err) {
      setError(err.message || "Failed to generate reply.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-violet-50/30 p-4 font-sans sm:p-8">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl sm:p-10">
        <Link href="/business-pro/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="mb-2 text-3xl font-black text-zinc-900">Pro Review Replier</h1>
        <p className="mb-8 text-zinc-500">Draft professional replies to customer reviews in seconds.</p>

        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-bold text-zinc-700">Customer Review *</label>
            <textarea required rows={4} placeholder="Paste the customer review here..." className="w-full resize-none rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.reviewText} onChange={(e) => setFormData({...formData, reviewText: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Rating</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.rating} onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}>
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Tone</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.tone} onChange={(e) => setFormData({...formData, tone: e.target.value})}>
                {["professional", "friendly", "apologetic", "appreciative", "concise"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Customer Name (Optional)</label>
              <input type="text" placeholder="e.g. John Doe" className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Business Name (Optional)</label>
              <input type="text" placeholder="e.g. Trendora Cafe" className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
            </div>
          </div>

          <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 p-4 font-bold text-white hover:bg-violet-800 disabled:opacity-50">
            {loading ? <LoaderCircle className="animate-spin" /> : <Star />} Generate Reply
          </button>
        </form>

        {result && (
          <div className="mt-8 rounded-2xl bg-zinc-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-zinc-800">Generated Reply</h3>
              <button onClick={handleCopy} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-violet-700 shadow-sm">
                {copied ? <Check size={16} /> : <Clipboard size={16} />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{result}</p>
          </div>
        )}
      </div>
    </main>
  );
}
