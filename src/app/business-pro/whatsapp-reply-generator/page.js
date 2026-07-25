"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, MessageSquareText, Clipboard, Check } from "lucide-react";
import { generateBusinessProWhatsappReply } from "@/services/business-pro.api";

export default function BusinessProWhatsappReplyGenerator() {
  const [formData, setFormData] = useState({
    messageText: "",
    intent: "inquiry",
    tone: "professional",
    customerName: "",
    offer: ""
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
      const res = await generateBusinessProWhatsappReply(formData);
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
        <h1 className="mb-2 text-3xl font-black text-zinc-900">Pro WhatsApp Responder</h1>
        <p className="mb-8 text-zinc-500">Draft quick, professional, and converting WhatsApp replies.</p>

        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-bold text-zinc-700">Customer Message *</label>
            <textarea required rows={3} placeholder="Paste the customer's WhatsApp message here..." className="w-full resize-none rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.messageText} onChange={(e) => setFormData({...formData, messageText: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Reply Intent</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.intent} onChange={(e) => setFormData({...formData, intent: e.target.value})}>
                {["inquiry", "booking", "complaint", "feedback", "pricing", "general"].map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Tone</label>
              <select className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.tone} onChange={(e) => setFormData({...formData, tone: e.target.value})}>
                {["professional", "friendly", "helpful", "persuasive", "apologetic"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Customer Name (Optional)</label>
              <input type="text" placeholder="e.g. Sarah" className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-zinc-700">Include Offer (Optional)</label>
              <input type="text" placeholder="e.g. Free shipping today" className="w-full rounded-xl border p-3 outline-none focus:border-violet-500" value={formData.offer} onChange={(e) => setFormData({...formData, offer: e.target.value})} />
            </div>
          </div>

          <button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 p-4 font-bold text-white hover:bg-violet-800 disabled:opacity-50">
            {loading ? <LoaderCircle className="animate-spin" /> : <MessageSquareText />} Generate WhatsApp Reply
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
