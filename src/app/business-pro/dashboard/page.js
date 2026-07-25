"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Lightbulb,
  LoaderCircle,
  Lock,
  LogOut,
  MapPin,
  MessageSquareText,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  Building2,
  Hash,
  PenTool,
  Image as ImageIcon
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

const quickTools = [
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
    title: "Hashtag Generator",
    description: "Find the best local and trending hashtags.",
    icon: Hash,
    href: "/business-pro/hashtag-generator",
  },
  {
    title: "Local SEO Optimizer",
    description: "Optimize your Google Business Profile.",
    icon: Search,
    href: "/business-pro/local-seo-generator",
  },
  {
    title: "Ad Copy Generator",
    description: "Generate converting ad copies for platforms.",
    icon: TrendingUp,
    href: "/business-pro/ad-copy-generator",
  },
  {
    title: "Review Replier",
    description: "Respond to customer reviews professionally.",
    icon: Star,
    href: "/business-pro/review-reply-generator",
  },
  {
    title: "WhatsApp Responder",
    description: "Draft quick and helpful customer replies.",
    icon: MessageSquareText,
    href: "/business-pro/whatsapp-reply-generator",
  }
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

  const stats = useMemo(() => {
    const countType = (type) => savedContents.filter((item) => item.type === type).length;
    return {
      posts: countType("business-post"),
      adCopies: countType("ad-copy"),
      localSeo: countType("local-seo"),
      reviewReplies: countType("review-reply"),
      whatsappReplies: countType("whatsapp-reply"),
      totalSaved: savedContents.length,
    };
  }, [savedContents]);

  const recentSavedContents = useMemo(() => savedContents.slice(0, 5), [savedContents]);

  const allStepsCompleted = dailyPlan?.actionSteps?.length > 0 && dailyPlan.actionSteps.every((step) => step.completed);

  const localKeywords = useMemo(() => {
    const businessType = businessProfile?.businessType || "business";
    const city = businessProfile?.city || "your city";
    const service = businessProfile?.services?.[0] || businessType;
    return [
      `${service} in ${city}`,
      `Best ${businessType} in ${city}`,
      `Local ${service} near me`,
      `${businessType} services ${city}`,
    ];
  }, [businessProfile]);

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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white text-zinc-900">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle size={24} className="animate-spin" />
          <span className="font-medium">Loading business pro dashboard...</span>
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
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Business Pro Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-4xl">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-violet-700 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                {businessProfile?.businessName || user?.fullname || "Business"}
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
              {businessProfile?.businessType || "Business"} {" • "} {businessProfile?.city || "City"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/business-pro/post-generator"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800"
            >
              Create a post <ArrowRight size={18} />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        {message && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")} className="font-bold">×</button>
          </div>
        )}

        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-600 to-violet-600 p-6 text-white shadow-2xl shadow-violet-200/50 sm:p-8">
          {dailyPlanLoading ? (
            <div className="flex min-h-56 items-center justify-center">
              <LoaderCircle size={28} className="animate-spin text-violet-200" />
            </div>
          ) : dailyPlan ? (
            <div>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    <Sparkles size={24} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-100">
                      Today&apos;s Pro Business Plan
                    </p>
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      PRO UNLIMITED
                    </span>
                  </div>
                  <h2 className="mt-2 max-w-3xl text-2xl font-bold text-white sm:text-3xl">{dailyPlan.topic}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-violet-50">{dailyPlan.businessGoal}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center shrink-0">
                  <button
                    type="button"
                    onClick={handleRegeneratePlan}
                    disabled={regeneratingPlan || dailyPlan.completed}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
                  >
                    <RefreshCw size={17} className={regeneratingPlan ? "animate-spin" : ""} />
                    {regeneratingPlan ? "Regenerating..." : "Regenerate (Pro)"}
                  </button>
                  <button
                    type="button"
                    onClick={handlePlanStatus}
                    disabled={updatingPlan || (!dailyPlan.completed && !allStepsCompleted)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 disabled:opacity-50"
                  >
                    <CheckCircle2 size={17} />
                    {updatingPlan ? "Updating..." : dailyPlan.completed ? "Completed" : allStepsCompleted ? "Mark complete" : "Complete all steps"}
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-100">Today&apos;s Actions</p>
                    <p className="mt-1 text-sm text-violet-50">{dailyPlan.completedSteps || 0} of {dailyPlan.totalSteps || 0} completed</p>
                  </div>
                  <p className="text-lg font-bold text-white">{dailyPlan.stepsProgress || 0}%</p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${dailyPlan.stepsProgress || 0}%` }} />
                </div>
                <div className="mt-5 space-y-3">
                  {dailyPlan.actionSteps?.map((step, index) => (
                    <button
                      key={step.id || `${step.text}-${index}`}
                      type="button"
                      onClick={() => handleToggleStep(step.id)}
                      disabled={updatingStepId === step.id || !step.id || dailyPlan.completed}
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        step.completed ? "border-emerald-300/30 bg-emerald-400/20" : "border-white/15 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                        step.completed ? "border-emerald-300 bg-emerald-400 text-white" : "border-white/30 text-white/70"
                      }`}>
                        {step.completed ? <Check size={15} /> : (index + 1)}
                      </span>
                      <span className={`text-sm leading-6 ${step.completed ? "text-emerald-100 line-through" : "text-white/90"}`}>
                        {step.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <Lightbulb size={30} className="text-violet-200" />
              <p className="mt-3 text-violet-100">Today&apos;s plan could not be loaded.</p>
              <button onClick={loadDashboard} className="mt-4 rounded-xl bg-white px-5 py-3 font-semibold text-violet-700">Try again</button>
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="mb-5">
            <h2 className="text-2xl font-black tracking-tight text-zinc-950">Pro Business Tools</h2>
            <p className="mt-1 text-sm text-zinc-600">Unlimited AI tools to grow your business.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.title} href={tool.href} className="group rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 transition group-hover:bg-violet-700 group-hover:text-white group-hover:shadow-violet-200">
                    <Icon size={23} />
                  </div>
                  <h3 className="font-bold text-zinc-900 group-hover:text-violet-700">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Recent saved business content</h2>
              <p className="mt-1 text-sm text-zinc-500">Your latest saved pro content.</p>
            </div>
            <Link href="/business-pro/saved" className="text-sm font-semibold text-violet-700 hover:text-violet-800">View all</Link>
          </div>
          <div className="mt-5 space-y-3">
            {recentSavedContents.length > 0 ? (
              recentSavedContents.map((item) => (
                <div key={item._id || item.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 hover:bg-white hover:shadow-sm">
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold text-zinc-900">{item.title}</p>
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                      {item.type.replaceAll("-", " ")}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">No saved pro content yet.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
