"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, LoaderCircle, Plus, Mail, Briefcase, FileText, CheckCircle2, UserCircle, ChevronRight, ChevronLeft, Store, Search, Filter, MoreVertical, Edit2, Trash2, RotateCcw } from "lucide-react";
import { getAgencyClients, addAgencyClient, updateAgencyClient, archiveAgencyClient, restoreAgencyClient } from "@/services/agency-tools.api";

export default function AgencyClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active,paused,lead"); // hide archived by default
  
  // Modal & Wizard State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [editingId, setEditingId] = useState(null);

  // Delete Confirm State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const initialForm = {
    clientType: "business",
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
    
    creatorName: "",
    niche: "",
    platforms: "",
    contentGoals: "",
    audienceSize: "",
    
    businessName: "",
    industry: "",
    products: "",
    services: "",
    website: "",
    city: "",
    country: "",
    
    preferredLanguage: "English",
    tone: "Professional",
    targetAudience: "General Audience",
    brandVoice: "Professional and Authoritative",
    requiredPhrases: "",
    bannedWords: "",
    customRules: "",
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAgencyClients({ search, clientType: typeFilter, status: statusFilter, limit: 100 });
      setClients(res?.data?.clients || res?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClients();
  }, [fetchClients]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setStep(1);
    setFormData(initialForm);
    setError("");
  };

  const openEditModal = (client) => {
    setIsEditing(true);
    setEditingId(client._id);
    setFormData({
      clientType: client.clientType || "business",
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      notes: client.notes || "",
      
      creatorName: client.creatorName || "",
      niche: client.niche || "",
      platforms: client.platforms ? client.platforms.join(", ") : "",
      contentGoals: client.contentGoals || "",
      audienceSize: client.audienceSize || "",
      
      businessName: client.businessName || "",
      industry: client.industry || "",
      products: client.products ? client.products.join(", ") : "",
      services: client.services ? client.services.join(", ") : "",
      website: client.website || "",
      city: client.city || "",
      country: client.country || "",
      
      preferredLanguage: client.preferredLanguage || "English",
      tone: client.tone || "Professional",
      targetAudience: client.targetAudience || "General Audience",
      brandVoice: client.brandVoice || "Professional and Authoritative",
      requiredPhrases: client.requiredPhrases ? client.requiredPhrases.join(", ") : "",
      bannedWords: client.bannedWords ? client.bannedWords.join(", ") : "",
      customRules: client.customRules || "",
    });
    setStep(2); // Skip type selection when editing usually, or allow it
    setShowModal(true);
  };

  const nextStep = () => {
    setError("");
    if (step === 2 && !formData.name.trim()) {
      setError("Internal Name is required.");
      return;
    }
    setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = () => {
    setError("");
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name.trim()) {
        setError("Internal Name is required.");
        return;
      }

      setSaving(true);
      setError("");

      const payload = {
        ...formData,
        platforms: formData.platforms ? formData.platforms.split(",").map(i => i.trim()).filter(Boolean) : [],
        products: formData.products ? formData.products.split(",").map(i => i.trim()).filter(Boolean) : [],
        services: formData.services ? formData.services.split(",").map(i => i.trim()).filter(Boolean) : [],
        requiredPhrases: formData.requiredPhrases ? formData.requiredPhrases.split(",").map(i => i.trim()).filter(Boolean) : [],
        bannedWords: formData.bannedWords ? formData.bannedWords.split(",").map(i => i.trim()).filter(Boolean) : [],
      };

      if (isEditing) {
        await updateAgencyClient(editingId, payload);
      } else {
        await addAgencyClient(payload);
      }
      
      await fetchClients();
      resetModal();
    } catch (err) {
      setError(err.message || "Failed to save client");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!clientToDelete) return;
    try {
      setDeleting(true);
      await archiveAgencyClient(clientToDelete._id);
      await fetchClients();
      setShowDeleteModal(false);
      setClientToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to archive client");
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      setLoading(true);
      await restoreAgencyClient(id);
      await fetchClients();
    } catch (err) {
      setError(err.message || "Failed to restore client");
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-700";
      case "paused": return "bg-amber-100 text-amber-700";
      case "archived": return "bg-zinc-100 text-zinc-500";
      default: return "bg-blue-100 text-blue-700";
    }
  };

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
            onClick={() => { resetModal(); setShowModal(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800"
          >
            <Plus size={18} /> Add New Client
          </button>
        </header>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="relative flex items-center">
              <Filter className="absolute left-3 text-zinc-400" size={16} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-white py-2 pl-9 pr-8 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">All Types</option>
                <option value="creator">Creator</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div className="relative flex items-center">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-white py-2 px-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="active,paused,lead">Active & Paused</option>
                <option value="active">Active Only</option>
                <option value="archived">Archived</option>
                <option value="">All Statuses</option>
              </select>
            </div>
          </div>
        </div>

        {error && !showModal && !showDeleteModal && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && clients.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-violet-700">
            <LoaderCircle size={32} className="animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 p-10 text-center">
                <Building2 size={40} className="mx-auto mb-4 text-violet-200" />
                <h3 className="text-lg font-bold text-zinc-900">No clients found</h3>
                <p className="mt-1 text-sm text-zinc-500">Try adjusting your search or filters.</p>
              </div>
            ) : (
              clients.map((client) => {
                const isCreator = client.clientType === "creator";
                const ClientIcon = isCreator ? UserCircle : Store;
                const isArchived = client.status === "archived";

                return (
                  <div key={client._id} className={`flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-md ${isArchived ? "opacity-75 grayscale-[0.5]" : ""}`}>
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                        <ClientIcon size={24} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                            {isCreator ? "Creator" : "Business"}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(client.status)}`}>
                            {client.status}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => openEditModal(client)} className="text-zinc-400 hover:text-violet-600 p-1 bg-zinc-50 rounded hover:bg-violet-50 transition" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          {isArchived ? (
                            <button onClick={() => handleRestore(client._id)} className="text-zinc-400 hover:text-green-600 p-1 bg-zinc-50 rounded hover:bg-green-50 transition" title="Restore">
                              <RotateCcw size={14} />
                            </button>
                          ) : (
                            <button onClick={() => { setClientToDelete(client); setShowDeleteModal(true); }} className="text-zinc-400 hover:text-red-600 p-1 bg-zinc-50 rounded hover:bg-red-50 transition" title="Archive">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Link href={`/agency/clients/${client._id}`} className="mt-2 block hover:underline">
                      <h3 className="text-xl font-bold text-zinc-900 line-clamp-1">{client.name}</h3>
                    </Link>
                    
                    <div className="mt-4 space-y-2 text-sm text-zinc-600 flex-1">
                      {(client.company || client.businessName || client.creatorName) && (
                        <div className="flex items-center gap-2">
                          <Briefcase size={16} className="text-zinc-400 shrink-0" /> 
                          <span className="line-clamp-1">{client.company || client.businessName || client.creatorName}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-zinc-400 shrink-0" /> 
                          <span className="line-clamp-1">{client.email}</span>
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
                        <p className="text-xs text-zinc-700 line-clamp-1">{client.brandVoice} • {client.targetAudience}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 3-Step Add/Edit Client Wizard Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="flex w-full max-w-2xl flex-col rounded-3xl border border-zinc-200 bg-white shadow-2xl max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">{isEditing ? "Edit Client" : "Add New Client"}</h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Step {step} of 3: {step === 1 ? "Client Type" : step === 2 ? "Basic Details" : "AI Brand Memory"}
                </p>
              </div>
              <button onClick={resetModal} className="text-zinc-400 hover:text-zinc-700 p-2 rounded-full hover:bg-zinc-200 transition">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            {/* Error in modal */}
            {error && (
              <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2 shrink-0">
                <FileText size={16} /> {error}
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {/* STEP 1: Type Selection */}
              {step === 1 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setFormData({ ...formData, clientType: "creator" })}
                    disabled={isEditing}
                    className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all ${
                      formData.clientType === "creator" ? "border-violet-600 bg-violet-50 text-violet-700" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-600"
                    } ${isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <UserCircle size={48} className="mb-4" />
                    <span className="font-bold text-lg">Creator</span>
                    <span className="text-xs text-center mt-2 opacity-80">For influencers, public figures, and content creators.</span>
                  </button>

                  <button 
                    onClick={() => setFormData({ ...formData, clientType: "business" })}
                    disabled={isEditing}
                    className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all ${
                      formData.clientType === "business" ? "border-violet-600 bg-violet-50 text-violet-700" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-600"
                    } ${isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Store size={48} className="mb-4" />
                    <span className="font-bold text-lg">Business</span>
                    <span className="text-xs text-center mt-2 opacity-80">For brands, agencies, and local businesses.</span>
                  </button>
                  {isEditing && <p className="col-span-2 text-center text-xs text-amber-600 mt-2">Client type cannot be changed after creation.</p>}
                </div>
              )}

              {/* STEP 2: Basic Info */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Internal Client Name *</label>
                      <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. Acme Corp (For internal dashboard)" />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Contact Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="contact@client.com" />
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Phone</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="+1 234 567 8900" />
                    </div>
                  </div>

                  <hr className="border-zinc-100" />
                  <h3 className="text-sm font-bold text-zinc-800">Public Profile</h3>

                  {formData.clientType === "creator" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Creator Name</label>
                        <input name="creatorName" value={formData.creatorName} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. John Doe" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Niche</label>
                        <input name="niche" value={formData.niche} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. Fitness, Tech Review" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Platforms (Comma separated)</label>
                        <input name="platforms" value={formData.platforms} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="Instagram, YouTube" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Audience Size</label>
                        <input name="audienceSize" value={formData.audienceSize} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. 50k, 1M+" />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Content Goals</label>
                        <input name="contentGoals" value={formData.contentGoals} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. Brand Awareness, Lead Gen" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Business Name</label>
                        <input name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. Acme Innovations" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Industry</label>
                        <input name="industry" value={formData.industry} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. SaaS, E-commerce" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Products (Comma separated)</label>
                        <input name="products" value={formData.products} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="Apparel, Shoes" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Services (Comma separated)</label>
                        <input name="services" value={formData.services} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="Consulting, Design" />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Website URL</label>
                        <input type="url" name="website" value={formData.website} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="https://acme.com" />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Internal Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={2} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none" placeholder="Any specific requirements..."></textarea>
                  </div>
                </div>
              )}

              {/* STEP 3: AI Brand Memory */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="rounded-xl bg-violet-50 p-4 border border-violet-100 flex items-start gap-3">
                    <Store className="text-violet-600 mt-0.5 shrink-0" size={18} />
                    <p className="text-sm text-violet-800">
                      <strong>AI Brand Memory</strong> allows Trendora AI to generate highly personalized content specifically tailored for this client&apos;s unique brand rules.
                    </p>
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
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Tone</label>
                      <input name="tone" value={formData.tone} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="e.g. Encouraging, Witty" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Language</label>
                      <input name="preferredLanguage" value={formData.preferredLanguage} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" placeholder="English" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Required Phrases (Comma separated)</label>
                      <input name="requiredPhrases" value={formData.requiredPhrases} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm" placeholder="e.g. Book now, Link in bio" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Banned Words (Comma separated)</label>
                      <input name="bannedWords" value={formData.bannedWords} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm" placeholder="e.g. Cheap, Fake" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Custom Generation Rules</label>
                    <textarea name="customRules" value={formData.customRules} onChange={handleInputChange} rows={3} className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm resize-none" placeholder="e.g. Never use emojis, always mention our guarantee"></textarea>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-between shrink-0">
              <button 
                onClick={step > 1 ? prevStep : resetModal}
                disabled={saving} 
                className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-zinc-500 hover:text-zinc-900 transition disabled:opacity-50"
              >
                {step > 1 ? <><ChevronLeft size={18} /> Back</> : "Cancel"}
              </button>
              
              {step < 3 ? (
                <button 
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-2.5 font-semibold text-white shadow hover:bg-violet-800 transition"
                >
                  Continue <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={handleSaveClient}
                  disabled={saving} 
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-2.5 font-semibold text-white shadow hover:bg-violet-800 transition disabled:opacity-50"
                >
                  {saving ? <LoaderCircle size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} {isEditing ? "Update Client" : "Save Client"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Archive Client?</h2>
            <p className="text-sm text-zinc-500 mt-2">
              Are you sure you want to archive <strong>{clientToDelete.name}</strong>? You can restore them later from the archives.
            </p>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => { setShowDeleteModal(false); setClientToDelete(null); }}
                disabled={deleting}
                className="flex-1 rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-700 hover:bg-zinc-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleArchive}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? <LoaderCircle size={18} className="animate-spin" /> : "Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
