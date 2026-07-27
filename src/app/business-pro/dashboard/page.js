"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Lightbulb,
  LoaderCircle,
  LogOut,
  MapPin,
  MessageSquareText,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  PenTool,
  Activity,
  Users,
  Clock,
  Calendar,
  Crown,
  ShieldAlert,
  Settings,
  Layers
} from "lucide-react";

import { getCurrentUser, logoutUser } from "@/services/auth.api";
import { getBusinessProfile } from "@/services/business-profile.api";
import { getSavedContents } from "@/services/saved.api";

import {
  getBusinessProDailyPlan,
  regenerateBusinessProDailyPlan,
  toggleBusinessProPlanStep,
  updateBusinessProPlanStatus,
} from "@/services/business-pro.api";

const proTools = [
  {
    title: "Bulk Generator",
    description: "Generate up to 30 posts at once.",
    icon: Layers,
    href: "/business-pro/bulk-generate",
    isNew: true,
  },
  {
    title: "Competitor Analysis",
    description: "Analyze local competitors via AI.",
    icon: ShieldAlert,
    href: "/business-pro/competitor-analysis",
    isNew: true,
  },
  {
    title: "Brand Voice",
    description: "Train AI on your exact tone.",
    icon: Settings,
    href: "/business-pro/brand-voice",
    isNew: true,
  },
  {
    title: "Post Generator",
    description: "Create high-quality promotional posts.",
    icon: FileText,
    href: "/business-pro/post-generator",
  },
  {
    title: "Caption Writer",
    description: "Write engaging captions for social media.",
    icon: PenTool,
    href: "/business-pro/caption-generator",
  },
  {
    title: "Local SEO Optimizer",
    description: "Optimize your Google Business Profile.",
    icon: Search,
    href: "/business-pro/local-seo-generator",
  },
  {
    title: "Review Replier",
    description: "Respond to customer reviews professionally.",
    icon: Star,
    href: "/business-pro/review-reply-generator",
  },
  {
    title: "WhatsApp Responder",
    description: "Draft quick customer replies.",
    icon: MessageSquareText,
    href: "/business-pro/whatsapp-reply-generator",
  }
];

const mockPipeline = [
  { day: "Today", type: "Instagram Reel Script", status: "Ready", color: "text-emerald-700", bg: "bg-emerald-100" },
  { day: "Tomorrow", type: "Google My Business Update", status: "Drafting", color: "text-amber-700", bg: "bg-amber-100" },
  { day: "Wednesday", type: "Promotional Email", status: "Scheduled", color: "text-blue-700", bg: "bg-blue-100" },
  { day: "Friday", type: "Weekend Offer Post", status: "Planning", color: "text-violet-700", bg: "bg-violet-100" },
];

export default function BusinessProDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [savedContents, setSavedContents] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [dailyPlanLoading, setDailyPlanLoading] = useState(true);
  
  const [updatingStepId, setUpdatingStepId] = useState("");
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [regeneratingPlan, setRegeneratingPlan] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const [message, setMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setDailyPlanLoading(true);
      setMessage("");

      const authResponse = await getCurrentUser();
      const currentUser = authResponse?.user || authResponse?.data?.user;

      if (!currentUser) {
        router.replace("/login");
        return;
      }
      if (currentUser.role !== "business") {
        router.replace("/");
        return;
      }
      if (currentUser.plan !== "business-pro") {
        router.replace("/business/dashboard");
        return;
      }

      setUser(currentUser);

      const [profileResult, savedResult, dailyPlanResult] = await Promise.allSettled([
        getBusinessProfile(),
        getSavedContents({ type: "all", search: "" }),
        getBusinessProDailyPlan(),
      ]);

      if (profileResult.status === "fulfilled") setBusinessProfile(profileResult.value?.data || null);
      if (savedResult.status === "fulfilled") setSavedContents(savedResult.value?.data || []);
      
      if (dailyPlanResult.status === "fulfilled") {
        setDailyPlan(dailyPlanResult.value?.data || null);
      } else {
        setMessage(dailyPlanResult.reason?.message || "Today's business plan could not be loaded.");
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setDailyPlanLoading(false);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const allStepsCompleted = dailyPlan?.actionSteps?.length > 0 && dailyPlan.actionSteps.every((step) => step.completed);

  const handleToggleStep = async (stepId) => {
    if (!stepId) return;
    try {
      setUpdatingStepId(stepId);
      const response = await toggleBusinessProPlanStep(stepId);
      setDailyPlan(response?.data || null);
    } catch (error) {
      setMessage(error?.message || "Unable to update this action.");
    } finally {
      setUpdatingStepId("");
    }
  };

  const handlePlanStatus = async () => {
    if (!dailyPlan) return;
    try {
      setUpdatingPlan(true);
      const response = await updateBusinessProPlanStatus(!dailyPlan.completed);
      setDailyPlan(response?.data || null);
    } catch (error) {
      setMessage(error?.message || "Unable to update the plan.");
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleRegeneratePlan = async () => {
    const confirmed = window.confirm("Generate a different business plan for today? Your current progress will be reset.");
    if (!confirmed) return;
    try {
      setRegeneratingPlan(true);
      const response = await regenerateBusinessProDailyPlan();
      setDailyPlan(response?.data || null);
    } catch (error) {
      setMessage(error?.message || "Unable to regenerate today's plan.");
    } finally {
      setRegeneratingPlan(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutUser();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-zinc-900">
        <div className="flex flex-col items-center gap-4 text-violet-700">
          <LoaderCircle size={32} className="animate-spin" />
          <span className="font-medium tracking-wide text-zinc-600">Initializing Command Center...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[800px] max-w-full -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-100 text-violet-700">
                <Crown size={16} className="fill-current" />
              </span>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
                Pro Command Center
              </p>
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-zinc-950 sm:text-5xl">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {businessProfile?.businessName || user?.fullname || "Business"}
              </span>
            </h1>
            <p className="mt-2 text-lg text-zinc-600 font-medium">
              Your AI marketing engine is running at full capacity.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/business-pro/post-generator"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-800"
            >
              <Sparkles size={18} />
              New Campaign
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        {message && (
          <div className="mb-8 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")} className="font-bold">×</button>
          </div>
        )}

        {/* Growth Analytics (Mocked for Premium Feel) */}
        <section className="mb-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm relative overflow-hidden group">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Activity size={24} />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  <TrendingUp size={12} /> +14.2%
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Audience Reach</p>
              <p className="text-3xl font-black text-zinc-950 mt-1">24,592</p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm relative overflow-hidden group">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Users size={24} />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  <TrendingUp size={12} /> +8.1%
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Engagement Rate</p>
              <p className="text-3xl font-black text-zinc-950 mt-1">4.8%</p>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm relative overflow-hidden group">
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full">
                  This Month
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">AI Hours Saved</p>
              <p className="text-3xl font-black text-zinc-950 mt-1">112h</p>
            </div>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] mb-10">
          {/* Main Daily Plan Section */}
          <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-600 p-8 text-white shadow-2xl shadow-violet-200/50">
            {dailyPlanLoading ? (
              <div className="flex min-h-56 items-center justify-center">
                <LoaderCircle size={28} className="animate-spin text-violet-200" />
              </div>
            ) : dailyPlan ? (
              <div className="relative z-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/20 text-white">
                        <Target size={20} />
                      </span>
                      <h2 className="text-2xl font-black text-white">Daily Pro Strategy</h2>
                    </div>
                    <h3 className="mt-2 max-w-2xl text-xl font-bold text-violet-100">{dailyPlan.topic}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-violet-200">{dailyPlan.businessGoal}</p>
                  </div>
                  
                  <div className="flex flex-col gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={handleRegeneratePlan}
                      disabled={regeneratingPlan || dailyPlan.completed}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                    >
                      <RefreshCw size={16} className={regeneratingPlan ? "animate-spin" : ""} />
                      {regeneratingPlan ? "Regenerating..." : "Regenerate AI Plan"}
                    </button>
                    <button
                      type="button"
                      onClick={handlePlanStatus}
                      disabled={updatingPlan || (!dailyPlan.completed && !allStepsCompleted)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-lg transition hover:bg-violet-50 disabled:opacity-50"
                    >
                      <CheckCircle2 size={18} />
                      {updatingPlan ? "Updating..." : dailyPlan.completed ? "Mission Accomplished" : allStepsCompleted ? "Mark Complete" : "Complete Steps First"}
                    </button>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-violet-200">Action Plan</h4>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-violet-200">{dailyPlan.completedSteps || 0} / {dailyPlan.totalSteps || 0}</span>
                      <span className="font-bold text-white">{dailyPlan.stepsProgress || 0}%</span>
                    </div>
                  </div>
                  
                  <div className="h-1.5 w-full rounded-full bg-white/20 mb-6 overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500" 
                      style={{ width: `${dailyPlan.stepsProgress || 0}%` }} 
                    />
                  </div>

                  <div className="space-y-3">
                    {dailyPlan.actionSteps?.map((step, index) => (
                      <button
                        key={step.id || `${step.text}-${index}`}
                        type="button"
                        onClick={() => handleToggleStep(step.id)}
                        disabled={updatingStepId === step.id || !step.id || dailyPlan.completed}
                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                          step.completed 
                            ? "border-white/40 bg-white/20" 
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                          step.completed 
                            ? "border-white bg-white text-violet-700" 
                            : "border-white/40 text-violet-200"
                        }`}>
                          {updatingStepId === step.id ? <LoaderCircle size={16} className="animate-spin" /> : step.completed ? <Check size={16} className="stroke-[3]" /> : (index + 1)}
                        </span>
                        <span className={`text-sm font-medium ${step.completed ? "text-violet-200 line-through" : "text-white"}`}>
                          {step.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <Lightbulb size={40} className="text-white mb-4 opacity-50" />
                <p className="text-white">Unable to generate today's strategy.</p>
                <button onClick={loadDashboard} className="mt-4 rounded-xl bg-white px-6 py-3 font-semibold text-violet-700">Retry Connection</button>
              </div>
            )}
          </section>

          {/* Weekly Content Pipeline */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-violet-100 text-violet-700">
                <Calendar size={20} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-zinc-950">Content Pipeline</h2>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Upcoming AI Tasks</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {mockPipeline.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                  <div className={`flex flex-col items-center justify-center h-12 w-14 rounded-lg bg-white border border-zinc-200 shrink-0`}>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">{item.day.slice(0,3)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{item.type}</p>
                    <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.bg} ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 rounded-xl border border-dashed border-zinc-300 py-4 text-sm font-bold text-zinc-500 hover:text-zinc-700 hover:border-zinc-400 transition">
              + Schedule New Campaign
            </button>
          </section>
        </div>

        {/* Pro Tools Grid */}
        <section className="mb-10">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black text-zinc-950">Pro AI Arsenal</h2>
              <p className="mt-1 text-sm text-zinc-600">Unlimited access to advanced marketing tools.</p>
            </div>
          </div>
          
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {proTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link 
                  key={tool.title} 
                  href={tool.href} 
                  className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-200/50"
                >
                  {tool.isNew && (
                    <span className="absolute top-4 right-4 bg-violet-100 text-violet-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full">
                      New
                    </span>
                  )}
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 text-zinc-500 border border-zinc-100 transition-colors group-hover:bg-violet-100 group-hover:text-violet-700 group-hover:border-violet-200">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
