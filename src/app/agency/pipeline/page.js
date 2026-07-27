"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Clock, Filter, Sparkles, Building2, 
  LoaderCircle, User, X, Search, FileText
} from "lucide-react";
import { getAgencyPipeline, updateAgencyPipelineStage, getAgencyClients } from "@/services/agency-tools.api";

export default function AgencyPipelinePage() {
  const [stages, setStages] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [filters, setFilters] = useState({
    clientId: "",
    search: ""
  });
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [pipelineRes, clientsRes] = await Promise.all([
        getAgencyPipeline(filters),
        getAgencyClients({ limit: 100 })
      ]);
      
      setStages(pipelineRes.data || []);
      setClients(clientsRes.data?.clients || (Array.isArray(clientsRes.data) ? clientsRes.data : []));
    } catch (err) {
      setError(err.message || "Failed to load pipeline data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.clientId]); // Refetch when client filter changes

  // Handle Search on Submit/Enter
  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleDragStart = (e, itemId, sourceStageId) => {
    e.dataTransfer.setData("itemId", itemId);
    e.dataTransfer.setData("sourceStageId", sourceStageId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("itemId");
    const sourceStageId = e.dataTransfer.getData("sourceStageId");

    if (!itemId || !sourceStageId || sourceStageId === targetStageId) return;

    // Snapshot for rollback
    const previousStages = JSON.parse(JSON.stringify(stages));

    // Optimistic Update
    const newStages = [...stages];
    const sourceStageIndex = newStages.findIndex(s => s.id === sourceStageId);
    const targetStageIndex = newStages.findIndex(s => s.id === targetStageId);
    
    if (sourceStageIndex === -1 || targetStageIndex === -1) return;

    const itemIndex = newStages[sourceStageIndex].items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;
    
    const item = newStages[sourceStageIndex].items[itemIndex];
    item.status = targetStageId; // Update item status locally
    
    // Move item
    newStages[sourceStageIndex].items.splice(itemIndex, 1);
    newStages[targetStageIndex].items.push(item);
    
    setStages(newStages);

    // API Call
    try {
      await updateAgencyPipelineStage(itemId, targetStageId, "Moved via pipeline drag-and-drop");
    } catch (err) {
      // Rollback
      setStages(previousStages);
      alert("Failed to update pipeline stage: " + err.message);
    }
  };

  const ContentModal = ({ item, onClose }) => {
    if (!item) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-100 p-6 bg-zinc-50/50">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  item.clientType === "creator" ? "bg-fuchsia-100 text-fuchsia-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {item.clientType}
                </span>
                <span className="inline-flex rounded-md bg-zinc-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-700">
                  {item.type}
                </span>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 line-clamp-1">{item.title}</h2>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="mb-6 flex items-center gap-4 text-sm font-medium text-zinc-500 border-b border-zinc-100 pb-6">
              <span className="flex items-center gap-1.5"><Building2 size={16} /> {item.clientName}</span>
              <span className="flex items-center gap-1.5"><Clock size={16} /> {new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="prose prose-sm max-w-none text-zinc-700 font-mono whitespace-pre-wrap bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
              {item.content || "No content generated yet."}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && stages.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans text-zinc-900">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle size={24} className="animate-spin" />
          <span className="font-medium">Loading AI Content Pipeline...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/agency/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-3">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-lg shadow-violet-200">
                <Sparkles size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-950">
                  AI Content Pipeline
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  Drag and drop real AI-generated content through your approval stages.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Search content..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-64 rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-violet-600">
                <Search size={16} />
              </button>
            </form>

            {/* Client Filter */}
            <div className="relative flex items-center">
              <Filter size={16} className="absolute left-3 text-zinc-400" />
              <select 
                value={filters.clientId}
                onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
                className="rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-8 text-sm font-semibold text-zinc-700 outline-none focus:border-violet-500 appearance-none shadow-sm cursor-pointer hover:bg-zinc-50 transition"
              >
                <option value="">All Clients</option>
                {clients.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Kanban Board */}
        <div className="flex items-start gap-5 overflow-x-auto pb-8 snap-x custom-scrollbar">
          {stages.map((stage) => (
            <div 
              key={stage.id} 
              className="min-w-[320px] w-[320px] shrink-0 snap-start flex flex-col h-[calc(100vh-220px)]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between sticky top-0 bg-zinc-50 z-10 py-1">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${stage.color}`}>
                    {stage.title}
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 shadow-inner">
                    {stage.items.length}
                  </span>
                </div>
              </div>

              {/* Column Body */}
              <div className="flex flex-col gap-3 flex-1 rounded-3xl bg-zinc-100/50 p-3 border border-zinc-200/60 overflow-y-auto custom-scrollbar">
                
                {stage.items.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl mx-1 mt-1">
                    <FileText size={24} className="mb-2 opacity-50" />
                    <span className="text-xs font-semibold">No content in this stage</span>
                  </div>
                )}

                {stage.items.map((item) => (
                  <div 
                    key={item.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id, stage.id)}
                    onClick={() => setSelectedItem(item)}
                    className="group cursor-grab rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-violet-300 hover:shadow-md active:cursor-grabbing hover:-translate-y-0.5"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                        item.clientType === "creator" ? "bg-fuchsia-100 text-fuchsia-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {item.clientType}
                      </span>
                      <span className="inline-flex rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        {item.type}
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-zinc-900 line-clamp-2 leading-snug mb-3">
                      {item.title}
                    </h4>
                    
                    <div className="flex flex-col gap-2 border-t border-zinc-100 pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 line-clamp-1 flex-1">
                          <Building2 size={12} className="text-violet-500 shrink-0" /> 
                          <span className="truncate">{item.clientName}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.assignedTo && (
                          <span className="flex items-center gap-1"><User size={10} /> Assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <ContentModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </main>
  );
}
