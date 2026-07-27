"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Building2, LoaderCircle, Store, UserCircle, 
  Settings, PenTool, LayoutDashboard, FileText, CalendarDays, 
  BarChart3, FolderOpen, MoreVertical, Edit2, Trash2, 
  Sparkles, CheckCircle2, MessageSquare, Megaphone,
  Video, Hash, AlignLeft, Users, Clock, Flame, 
  MapPin, MessageCircle, Link2, Mail
} from "lucide-react";
import { getAgencyClient, getAgencyClientStats, archiveAgencyClient } from "@/services/agency-tools.api";

// Tool Configuration
const CREATOR_TOOLS = [
  { id: "hook-generator", name: "Hook Generator", icon: Flame, color: "text-orange-500", bg: "bg-orange-100" },
  { id: "script-generator", name: "Script Generator", icon: AlignLeft, color: "text-blue-500", bg: "bg-blue-100" },
  { id: "caption-generator", name: "Caption Generator", icon: MessageSquare, color: "text-violet-500", bg: "bg-violet-100" },
  { id: "hashtag-generator", name: "Hashtag Generator", icon: Hash, color: "text-pink-500", bg: "bg-pink-100" },
  { id: "reel-idea-generator", name: "Reel Idea Generator", icon: Video, color: "text-red-500", bg: "bg-red-100" },
  { id: "thumbnail-title-generator", name: "Thumbnail Title Generator", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-100" },
  { id: "video-description", name: "Video Description", icon: AlignLeft, color: "text-indigo-500", bg: "bg-indigo-100" },
  { id: "creator-planner", name: "Creator Planner", icon: CalendarDays, color: "text-cyan-500", bg: "bg-cyan-100" }
];

const BUSINESS_TOOLS = [
  { id: "business-post", name: "Business Post", icon: LayoutDashboard, color: "text-blue-500", bg: "bg-blue-100" },
  { id: "business-caption", name: "Business Caption", icon: MessageSquare, color: "text-violet-500", bg: "bg-violet-100" },
  { id: "business-hashtag", name: "Business Hashtag", icon: Hash, color: "text-pink-500", bg: "bg-pink-100" },
  { id: "ad-copy", name: "Ad Copy", icon: Megaphone, color: "text-orange-500", bg: "bg-orange-100" },
  { id: "product-description", name: "Product Description", icon: FileText, color: "text-emerald-500", bg: "bg-emerald-100" },
  { id: "local-seo", name: "Local SEO", icon: MapPin, color: "text-red-500", bg: "bg-red-100" },
  { id: "review-reply", name: "Review Reply", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100" },
  { id: "whatsapp-reply", name: "WhatsApp Reply", icon: MessageCircle, color: "text-green-600", bg: "bg-green-100" },
  { id: "business-planner", name: "Business Planner", icon: CalendarDays, color: "text-cyan-500", bg: "bg-cyan-100" }
];

const TABS = [
  { id: "overview", name: "Overview", icon: LayoutDashboard },
  { id: "ai-tools", name: "AI Tools", icon: Sparkles },
  { id: "content", name: "Content", icon: PenTool },
  { id: "pipeline", name: "Pipeline", icon: FileText },
  { id: "calendar", name: "Calendar", icon: CalendarDays },
  { id: "files", name: "Files", icon: FolderOpen },
  { id: "reports", name: "Reports", icon: BarChart3 },
  { id: "settings", name: "Settings", icon: Settings }
];

export default function AgencyClientWorkspace({ params }) {
  const unwrappedParams = use(params);
  const clientId = unwrappedParams.clientId;
  const router = useRouter();

  const [client, setClient] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const [archiving, setArchiving] = useState(false);

  const fetchWorkspaceData = useCallback(async () => {
    try {
      setLoading(true);
      const [clientRes, statsRes] = await Promise.all([
        getAgencyClient(clientId),
        getAgencyClientStats(clientId)
      ]);
      setClient(clientRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message || "Failed to load workspace");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchWorkspaceData();
  }, [fetchWorkspaceData]);

  const handleArchive = async () => {
    if (!confirm("Are you sure you want to archive this client?")) return;
    try {
      setArchiving(true);
      await archiveAgencyClient(clientId);
      router.push("/agency/clients");
    } catch (err) {
      alert("Failed to archive client");
      setArchiving(false);
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white text-zinc-900">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle size={24} className="animate-spin" />
          <span className="font-medium">Loading Workspace...</span>
        </div>
      </main>
    );
  }

  if (error || !client) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Trash2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Workspace Not Found</h2>
          <p className="text-sm text-zinc-600 mb-6">{error || "The client you are looking for does not exist or you don't have access."}</p>
          <Link href="/agency/clients" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700">
            <ArrowLeft size={18} /> Back to Clients
          </Link>
        </div>
      </main>
    );
  }

  const isCreator = client.clientType === "creator";
  const ClientIcon = isCreator ? UserCircle : Store;
  const tools = isCreator ? CREATOR_TOOLS : BUSINESS_TOOLS;
  const displayName = client.company || client.businessName || client.creatorName || client.name;

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-12">
      {/* Dynamic Background */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[1000px] max-w-full -translate-x-1/2 rounded-full bg-violet-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Workspace Header */}
        <header className="mb-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 shadow-inner">
              {client.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={client.logoUrl} alt={client.name} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <ClientIcon size={32} />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">{client.name}</h1>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-zinc-600">
                  {isCreator ? "Creator" : "Business"}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${getStatusColor(client.status)}`}>
                  {client.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-zinc-500">
                {displayName !== client.name && (
                  <span className="flex items-center gap-1.5"><Store size={14}/> {displayName}</span>
                )}
                {client.email && (
                  <span className="flex items-center gap-1.5"><Mail size={14}/> {client.email}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/agency/clients?edit=${client._id}`} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50">
              <Edit2 size={16} /> Edit
            </Link>
            <button onClick={handleArchive} disabled={archiving} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50">
              {archiving ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />} Archive
            </button>
          </div>
        </header>

        {/* Workspace Navigation Tabs */}
        <div className="mb-8 flex overflow-x-auto hide-scrollbar border-b border-zinc-200">
          <div className="flex gap-2 pb-[-1px]">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-t-xl border-b-2 px-4 py-3 text-sm font-semibold transition ${
                    isActive ? "border-violet-700 bg-violet-50 text-violet-700" : "border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                  }`}
                >
                  <Icon size={16} /> {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && stats && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column: Stats & Recent */}
            <div className="space-y-6 lg:col-span-2">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Content</p>
                  <p className="mt-2 text-3xl font-black text-violet-700">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Generated This Month</p>
                  <p className="mt-2 text-3xl font-black text-emerald-600">{stats.thisMonth}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Drafts</p>
                  <p className="mt-2 text-3xl font-black text-zinc-800">{stats.draft}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Pending Approval</p>
                  <p className="mt-2 text-3xl font-black text-amber-600">{stats.pending}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Approved</p>
                  <p className="mt-2 text-3xl font-black text-blue-600">{stats.approved}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Published</p>
                  <p className="mt-2 text-3xl font-black text-green-600">{stats.published}</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2"><Clock size={20} className="text-violet-600"/> Recent Activity</h2>
                  <button onClick={() => setActiveTab("content")} className="text-sm font-semibold text-violet-600 hover:text-violet-700">View All</button>
                </div>
                {stats.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity._id} className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition hover:border-violet-100 hover:bg-violet-50/50">
                        <div>
                          <p className="font-semibold text-zinc-900">{activity.title}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                            <span className="uppercase tracking-wider font-bold text-violet-600">{activity.type.replace(/-/g, " ")}</span>
                            <span>•</span>
                            <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 capitalize">
                          {activity.pipelineStage}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-zinc-500">
                    No recent activity found. Generate some content!
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Brand Memory & Team */}
            <div className="space-y-6">
              
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-6"><Sparkles size={20} className="text-violet-600"/> AI Brand Memory</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Brand Voice</p>
                    <p className="text-sm font-medium text-zinc-900">{client.brandVoice || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Target Audience</p>
                    <p className="text-sm font-medium text-zinc-900">{client.targetAudience || "Not specified"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Tone</p>
                      <p className="text-sm font-medium text-zinc-900">{client.tone || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Language</p>
                      <p className="text-sm font-medium text-zinc-900">{client.preferredLanguage || "English"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">{isCreator ? "Niche" : "Industry"}</p>
                    <p className="text-sm font-medium text-zinc-900">{isCreator ? client.niche : client.industry || "Not specified"}</p>
                  </div>

                  {(client.requiredPhrases?.length > 0 || client.bannedWords?.length > 0) && (
                    <div className="border-t border-zinc-100 pt-4 mt-4">
                      {client.requiredPhrases?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Required Phrases</p>
                          <div className="flex flex-wrap gap-1.5">
                            {client.requiredPhrases.map((phrase, i) => (
                              <span key={i} className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">{phrase}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {client.bannedWords?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 mb-1">Banned Words</p>
                          <div className="flex flex-wrap gap-1.5">
                            {client.bannedWords.map((word, i) => (
                              <span key={i} className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-700">{word}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {client.customRules && (
                    <div className="rounded-xl bg-violet-50 p-4 border border-violet-100 mt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700 mb-1">Custom Rules</p>
                      <p className="text-xs text-violet-900 leading-relaxed">{client.customRules}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-6"><Users size={20} className="text-violet-600"/> Assigned Team</h2>
                <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center text-zinc-500">
                  <p className="text-sm">Team assignment feature coming soon.</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: AI TOOLS */}
        {activeTab === "ai-tools" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-zinc-900">AI Generators for {isCreator ? "Creators" : "Business"}</h2>
              <p className="text-sm text-zinc-500 mt-1">Tools are automatically pre-configured with {client.name}&apos;s Brand Memory.</p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link 
                    key={tool.id} 
                    href={`/agency/tools/${tool.id}?clientId=${client._id}`}
                    className="group flex flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tool.bg} ${tool.color} transition-transform group-hover:scale-110`}>
                        <Icon size={24} />
                      </div>
                      <Link2 size={16} className="text-zinc-300 transition group-hover:text-violet-500" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900">{tool.name}</h3>
                    <p className="mt-2 text-sm text-zinc-500">Generate high-quality content matching {client.name}&apos;s voice.</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* PLACEHOLDER TABS */}
        {["content", "pipeline", "calendar", "files", "reports", "settings"].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white py-32 px-4 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100 text-violet-600">
              <Sparkles size={32} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 capitalize">{activeTab}</h2>
            <p className="mt-2 max-w-md text-zinc-500">
              The {activeTab} module for the client workspace is currently under development. Stay tuned for updates!
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
