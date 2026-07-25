"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Search, Clipboard, Check } from "lucide-react";
import { generateBusinessProLocalSeo } from "@/services/business-pro.api";

export default function BusinessProLocalSeoGenerator() {
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    city: "",
    state: "",
    country: "",
    services: "",
    audience: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setResult(null);
      const res = await generateBusinessProLocalSeo(formData);
      setResult(res.data.seoContent);
    } catch (err) {
      setError(err.message || "Failed to generate Local SEO.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-violet-50/30 p-4 font-sans sm:p-8">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-xl sm:p-10">
        <Link href="/business-pro/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="mb-2 text-3xl font-black text-zinc-900">Pro Local SEO Optimizer</h1>
        <p className="mb-8 text-zinc-500">Generate local keywords and SEO checklist for your business.</p>

        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Business Name (Optional)</label>
              <input type="text" placeholder="Your Business Name" className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Business Type (Optional)</label>
              <input type="text" placeholder="e.g. Plumbing Services" className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.businessType} onChange={(e) => setFormData({...formData, businessType: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">City *</label>
              <input required type="text" placeholder="e.g. New York" className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">State / Province</label>
              <input type="text" placeholder="e.g. NY" className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Country</label>
              <input type="text" placeholder="e.g. USA" className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Target Audience (Optional)</label>
              <input type="text" placeholder="e.g. Homeowners" className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.audience} onChange={(e) => setFormData({...formData, audience: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-zinc-700">Services *</label>
            <input required type="text" placeholder="e.g. Pipe repair, Drain cleaning" className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.services} onChange={(e) => setFormData({...formData, services: e.target.value})} />
          </div>

          <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 p-4 font-bold text-white hover:bg-violet-800 disabled:opacity-50">
            {loading ? <LoaderCircle className="animate-spin" /> : <Search />} Generate Local SEO
          </button>
        </form>

        {result && (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-zinc-50 p-6">
              <h3 className="mb-4 font-bold text-zinc-800">Keywords & Meta</h3>
              <p className="text-sm font-bold text-zinc-600">Primary Keyword:</p>
              <p className="mb-3 text-sm text-violet-700 font-medium">{result.primaryKeyword}</p>
              <p className="text-sm font-bold text-zinc-600">SEO Title:</p>
              <p className="mb-3 text-sm text-zinc-800">{result.seoTitle}</p>
              <p className="text-sm font-bold text-zinc-600">Meta Description:</p>
              <p className="mb-3 text-sm text-zinc-800">{result.metaDescription}</p>
              
              <p className="mt-4 text-sm font-bold text-zinc-600">Google Business Categories:</p>
              <ul className="list-disc pl-5 text-sm text-zinc-700">
                <li><span className="font-semibold text-violet-700">Primary:</span> {result.googleBusinessCategories.primary}</li>
                {result.googleBusinessCategories.secondary.map((cat, i) => <li key={i}>{cat}</li>)}
              </ul>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-6">
              <h3 className="mb-4 font-bold text-zinc-800">Related Local Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.relatedKeywords.map((kw, i) => (
                  <span key={i} className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{kw}</span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-6 md:col-span-2">
              <h3 className="mb-4 font-bold text-zinc-800">Local SEO Checklist</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.localSeoChecklist.map((item, i) => (
                  <div key={i} className="rounded-xl border bg-white p-3">
                    <span className="mb-1 inline-block rounded bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">{item.priority}</span>
                    <p className="text-sm font-medium text-zinc-800">{item.task}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-6 md:col-span-2">
              <h3 className="mb-4 font-bold text-zinc-800">Customer FAQs</h3>
              <div className="space-y-4">
                {result.faqs.map((faq, i) => (
                  <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                    <p className="font-semibold text-zinc-800">Q: {faq.question}</p>
                    <p className="mt-1 text-sm text-zinc-600">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
