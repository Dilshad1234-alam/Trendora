"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, LoaderCircle, Plus, Mail, Building, FileText, CheckCircle2 } from "lucide-react";
import { getAgencyClients, addAgencyClient } from "@/services/agency-tools.api";

export default function AgencyClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    notes: "",
    brandVoice: "Professional",
    targetAudience: "General",
    customRules: "",
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await getAgencyClients();
      setClients(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      setError("");
      await addAgencyClient(formData);
      await fetchClients();
      setShowAddModal(false);
      setFormData({ name: "", email: "", company: "", notes: "", brandVoice: "Professional", targetAudience: "General", customRules: "" });
    } catch (err) {
      setError(err.message || "Failed to add client");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white text-zinc-900">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle size={24} className="animate-spin" />
          <span className="font-medium">Loading clients...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[800px] max-w-full -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/agency/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-2">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-zinc-950">
              Manage Clients
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              View and manage all your agency clients in one place.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800"
          >
            <Plus size={18} /> Add New Client
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 p-10 text-center">
              <Building2 size={40} className="mx-auto mb-4 text-violet-200" />
              <h3 className="text-lg font-bold text-zinc-900">No clients yet</h3>
              <p className="mt-1 text-sm text-zinc-500">Add your first client to get started.</p>
            </div>
          ) : (
            clients.map((client) => (
              <div key={client._id} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Building2 size={24} />
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    {client.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900">{client.name}</h3>
                <div className="mt-4 space-y-2 text-sm text-zinc-600">
                  {client.company && (
                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-zinc-400" /> {client.company}
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-zinc-400" /> {client.email}
                    </div>
                  )}
                  {client.notes && (
                    <div className="flex items-start gap-2 mt-2 border-t border-zinc-100 pt-2">
                      <FileText size={16} className="text-zinc-400 mt-1 shrink-0" />
                      <p className="line-clamp-2 text-xs text-zinc-500">{client.notes}</p>
                    </div>
                  )}
                </div>
                
                {client.brandVoice && (
                  <div className="mt-4 rounded-xl bg-violet-50/50 p-3 border border-violet-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700 mb-1">Brand Voice</p>
                    <p className="text-xs text-zinc-700">{client.brandVoice} • {client.targetAudience}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-zinc-900 mb-1">Add New Client</h2>
            <p className="text-sm text-zinc-500 mb-6">Enter the client details below.</p>
            
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Client Name</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Company</label>
                  <input name="company" value={formData.company} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="Acme Inc." />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="contact@acme.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Brand Voice</label>
                  <input name="brandVoice" value={formData.brandVoice} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. Playful, Professional" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Target Audience</label>
                  <input name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. Gen Z, Tech Founders" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Custom Rules (Optional)</label>
                <input name="customRules" value={formData.customRules} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm" placeholder="e.g. Never use emojis, always mention our guarantee" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Notes (Optional)</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="Any specific requirements..."></textarea>
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-700 hover:bg-zinc-200 transition">Cancel</button>
                <button type="submit" disabled={adding} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 py-3 font-semibold text-white hover:bg-violet-800 transition disabled:opacity-50">
                  {adding ? <LoaderCircle size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
