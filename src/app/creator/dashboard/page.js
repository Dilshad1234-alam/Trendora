"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  ArrowRight,
  BarChart3,
  Bookmark,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  Flame,
  Gauge,
  Hash,
  ImageIcon,
  Lightbulb,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

import {
  getCurrentUser,
  logoutUser,
} from "@/services/auth.api";

import { getSavedContents } from "@/services/saved.api";

import {
  getDailyPlan,
  regenerateDailyPlan,
  toggleDailyPlanStep,
  updateDailyPlan,
  updateDailyPlanStatus,
} from "@/services/daily-plan.api";

const quickTools = [
  {
    title: "Hook Generator",
    description: "Create strong hooks for reels and short videos.",
    icon: Flame,
    href: "/creator/hook-generator",
  },
  {
    title: "Script Generator",
    description: "Generate ready-to-record short video scripts.",
    icon: FileText,
    href: "/creator/script-generator",
  },
  {
    title: "Caption Generator",
    description: "Create engaging captions and calls to action.",
    icon: FileText,
    href: "/creator/caption-generator",
  },
  {
    title: "Hashtag Generator",
    description: "Generate broad, niche and low-competition hashtags.",
    icon: Hash,
    href: "/creator/hashtag-generator",
  },
  {
    title: "Thumbnail Titles",
    description: "Generate short and clickable thumbnail titles.",
    icon: ImageIcon,
    href: "/creator/thumbnail-title-generator",
  },
  {
    title: "Video Description",
    description: "Generate SEO-friendly video descriptions, keywords and CTAs.",
    icon: AlignLeft,
    href: "/creator/video-description-generator",
  },
  {
    title: "Saved Content",
    description:
      "Open your saved hooks, scripts, captions, hashtags, titles and descriptions.",
    icon: Bookmark,
    href: "/creator/saved",
  },
];

const recommendedIdeas = [
  {
    title: "AI Resume Builder",
    category: "Technology",
    score: 91,
    stage: "Growing",
  },
  {
    title: "30-Day Skill Challenge",
    category: "Education",
    score: 87,
    stage: "New",
  },
  {
    title: "Day in My Life",
    category: "Lifestyle",
    score: 82,
    stage: "Popular",
  },
];

export default function CreatorDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [savedContents, setSavedContents] = useState([]);
  const [dailyPlan, setDailyPlan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [dailyPlanLoading, setDailyPlanLoading] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");

  const [updatingStepId, setUpdatingStepId] = useState("");
  const [regeneratingPlan, setRegeneratingPlan] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [editForm, setEditForm] = useState({
    topic: "",
    format: "",
    hookIdea: "",
    cta: "",
    postingTime: "",
    aiTip: "",
    estimatedTime: "",
    difficulty: "easy",
    contentGoal: "",
  });

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const userResponse = await getCurrentUser();
      const currentUser = userResponse.user || userResponse.data?.user;

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      if (!currentUser.role) {
        router.replace("/onboarding/select-role");
        return;
      }

      if (currentUser.role !== "creator") {
        if (currentUser.role === "business") {
          router.replace("/business/dashboard");
          return;
        }
        if (currentUser.role === "admin") {
          router.replace("/admin/dashboard");
          return;
        }
        router.replace("/");
        return;
      }

      if (!currentUser.onboardingCompleted) {
        router.replace("/onboarding/creator");
        return;
      }

      if (!currentUser.planSelected || !currentUser.plan) {
        router.replace("/onboarding/select-plan");
        return;
      }

      setUser(currentUser);

      try {
        const savedResponse = await getSavedContents({ type: "all", search: "" });
        setSavedContents(savedResponse.data || []);
      } catch (savedError) {
        console.error("Saved content fetch error:", savedError);
        setSavedContents([]);
      }

      try {
        setDailyPlanLoading(true);
        const dailyPlanResponse = await getDailyPlan();
        setDailyPlan(dailyPlanResponse.data || null);
      } catch (dailyPlanError) {
        console.error("Daily plan fetch error:", dailyPlanError);
        setDailyPlan(null);
      } finally {
        setDailyPlanLoading(false);
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const hooks = savedContents.filter((item) => item.type === "hook").length;
    const scripts = savedContents.filter((item) => item.type === "script").length;
    const captions = savedContents.filter((item) => item.type === "caption").length;
    const hashtags = savedContents.filter((item) => item.type === "hashtag").length;
    const thumbnailTitles = savedContents.filter((item) => item.type === "thumbnail-title").length;
    const videoDescriptions = savedContents.filter((item) => item.type === "video-description").length;

    return {
      hooks,
      scripts,
      captions,
      hashtags,
      thumbnailTitles,
      videoDescriptions,
      totalSaved: savedContents.length,
    };
  }, [savedContents]);

  const workflowTasks = useMemo(
    () => [
      { title: "Generate a hook", completed: stats.hooks > 0 },
      { title: "Create a script", completed: stats.scripts > 0 },
      { title: "Write a caption", completed: stats.captions > 0 },
      { title: "Generate hashtags", completed: stats.hashtags > 0 },
      { title: "Create thumbnail titles", completed: stats.thumbnailTitles > 0 },
      { title: "Write video description", completed: stats.videoDescriptions > 0 },
      { title: "Complete today's plan", completed: Boolean(dailyPlan?.completed) },
    ],
    [stats, dailyPlan]
  );

  const completedTasks = workflowTasks.filter((task) => task.completed).length;
  const progressPercentage = Math.round((completedTasks / workflowTasks.length) * 100);

  const allPlanStepsCompleted =
    dailyPlan?.actionSteps?.length > 0 &&
    dailyPlan.actionSteps.every((step) => step.completed);

  const handlePlanStatus = async () => {
    if (!dailyPlan) return;
    try {
      setUpdatingPlan(true);
      setMessage("");
      const response = await updateDailyPlanStatus(!dailyPlan.completed);
      setDailyPlan(response.data);
    } catch (error) {
      setMessage(error.message || "Unable to update daily plan.");
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setMessage("");
      await logoutUser();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setMessage(error.message || "Logout failed.");
    } finally {
      setLoggingOut(false);
    }
  };

  const handleToggleStep = async (stepId) => {
    if (!stepId) return;
    try {
      setUpdatingStepId(stepId);
      setMessage("");
      const response = await toggleDailyPlanStep(stepId);
      setDailyPlan(response.data);
    } catch (error) {
      setMessage(error.message || "Unable to update action step.");
    } finally {
      setUpdatingStepId("");
    }
  };

  const handleRegeneratePlan = async () => {
    const confirmed = window.confirm("Generate a new plan for today?");
    if (!confirmed) return;
    try {
      setRegeneratingPlan(true);
      setMessage("");
      const response = await regenerateDailyPlan();
      setDailyPlan(response.data);
    } catch (error) {
      setMessage(error.message || "Unable to regenerate daily plan.");
    } finally {
      setRegeneratingPlan(false);
    }
  };

  const openEditPlan = () => {
    setEditForm({
      topic: dailyPlan?.topic || "",
      format: dailyPlan?.format || "",
      hookIdea: dailyPlan?.hookIdea || "",
      cta: dailyPlan?.cta || "",
      postingTime: dailyPlan?.postingTime || "",
      aiTip: dailyPlan?.aiTip || "",
      estimatedTime: dailyPlan?.estimatedTime || "",
      difficulty: dailyPlan?.difficulty || "easy",
      contentGoal: dailyPlan?.contentGoal || "",
    });
    setEditingPlan(true);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSavePlanEdit = async (event) => {
    event.preventDefault();
    try {
      setSavingEdit(true);
      setMessage("");
      const response = await updateDailyPlan(editForm);
      setDailyPlan(response.data);
      setEditingPlan(false);
    } catch (error) {
      setMessage(error.message || "Unable to update daily plan.");
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle size={25} className="animate-spin" />
          <span className="font-medium text-zinc-600">Loading creator dashboard...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/Trendora_Landing_Logo.png"
              alt="Trendora Logo"
              width={270}
              height={104}
              priority
              className="h-14 w-auto object-contain sm:h-16"
            />
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-700 shadow-sm">
              <UserRound size={17} className="text-violet-700" />
              <span className="capitalize font-medium">
                {user?.plan || "free"} plan
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <LogOut size={17} />
              )}
              Logout
            </button>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
            Creator Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
            Welcome,{" "}
            <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {user?.fullname || "Creator"}
            </span>
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-500">
            Create personalized hooks, scripts, captions, hashtags, thumbnail
            titles, video descriptions and follow your daily content plan.
          </p>
        </div>

        {/* Error message */}
        {message && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm flex items-start gap-3 text-red-700">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
              <span className="font-bold text-xs leading-none">!</span>
            </span>
            <div>{message}</div>
          </div>
        )}

        {/* Daily Content Plan */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-600 p-6 text-white shadow-xl shadow-violet-200/50 sm:p-8">
          {dailyPlanLoading ? (
            <div className="flex min-h-52 items-center justify-center">
              <div className="flex items-center gap-3 text-violet-200">
                <LoaderCircle size={23} className="animate-spin" />
                <span className="font-medium">Preparing today&apos;s personalized plan...</span>
              </div>
            </div>
          ) : dailyPlan ? (
            <div>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    <Sparkles size={24} className="text-white" />
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
                    Today&apos;s Content Plan
                  </p>

                  <h2 className="mt-2 max-w-3xl text-2xl font-bold sm:text-3xl">
                    {dailyPlan.topic}
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold capitalize">
                      {dailyPlan.format}
                    </span>

                    {dailyPlan.postingTime && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                        <Clock3 size={13} className="text-violet-200" />
                        Post: {dailyPlan.postingTime}
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        dailyPlan.completed
                          ? "bg-emerald-500/20 text-emerald-200"
                          : "bg-amber-500/20 text-amber-200"
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      {dailyPlan.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openEditPlan}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    <Edit3 size={17} />
                    Edit plan
                  </button>

                  <button
                    type="button"
                    onClick={handleRegeneratePlan}
                    disabled={regeneratingPlan}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                  >
                    {regeneratingPlan ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <RefreshCw size={17} />
                    )}
                    {regeneratingPlan ? "Regenerating..." : "Regenerate"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePlanStatus}
                  disabled={updatingPlan || (!dailyPlan.completed && !allPlanStepsCompleted)}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    dailyPlan.completed
                      ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/30"
                      : "bg-white text-violet-700 hover:bg-violet-50"
                  }`}
                >
                  {updatingPlan ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Updating...
                    </>
                  ) : dailyPlan.completed ? (
                    <>
                      <CheckCircle2 size={18} />
                      Completed
                    </>
                  ) : !allPlanStepsCompleted ? (
                    <>
                      <CheckCircle2 size={18} />
                      Complete all steps first
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Mark complete
                    </>
                  )}
                </button>
              </div>

              <div className="mt-7 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                    Hook idea
                  </p>
                  <p className="mt-2 leading-relaxed text-white/90">
                    {dailyPlan.hookIdea}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                    Call to action
                  </p>
                  <p className="mt-2 leading-relaxed text-white/90">
                    {dailyPlan.cta}
                  </p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <InfoCard icon={Target} label="Content goal" value={dailyPlan.contentGoal} />
                  <InfoCard icon={Timer} label="Estimated time" value={dailyPlan.estimatedTime} />
                  <InfoCard icon={Gauge} label="Difficulty" value={dailyPlan.difficulty} />
                  <InfoCard
                    icon={Sparkles}
                    label="Plan source"
                    value={dailyPlan.source === "fallback" ? "Fallback plan" : "AI generated"}
                  />
                </div>

                {dailyPlan.aiTip && (
                  <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-500/20 p-5">
                    <div className="flex items-start gap-3">
                      <Lightbulb size={20} className="mt-0.5 shrink-0 text-amber-300" />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                          Today&apos;s AI Tip
                        </p>
                        <p className="mt-2 text-sm leading-7 text-amber-100/90">
                          {dailyPlan.aiTip}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Steps */}
              <div className="mt-4 rounded-2xl bg-white/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                      Today&apos;s action steps
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      {dailyPlan.completedSteps || 0} of {dailyPlan.totalSteps || 0} completed
                    </p>
                  </div>
                  <p className="text-lg font-bold text-white">
                    {dailyPlan.stepsProgress || 0}%
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${dailyPlan.stepsProgress || 0}%` }}
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {dailyPlan.actionSteps?.map((step, index) => (
                    <button
                      key={step.id || `${step.text}-${index}`}
                      type="button"
                      onClick={() => handleToggleStep(step.id)}
                      disabled={updatingStepId === step.id || !step.id}
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        step.completed
                          ? "border-emerald-400/30 bg-emerald-500/20"
                          : "border-white/15 bg-white/5 hover:bg-white/15"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                          step.completed
                            ? "border-emerald-400 bg-emerald-500 text-white"
                            : "border-white/30 text-white/60"
                        }`}
                      >
                        {updatingStepId === step.id ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : step.completed ? (
                          <Check size={15} />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span
                        className={`text-sm leading-6 ${
                          step.completed ? "text-emerald-200 line-through" : "text-white/90"
                        }`}
                      >
                        {step.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick action links */}
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/creator/script-generator?topic=${encodeURIComponent(dailyPlan.topic)}&hook=${encodeURIComponent(dailyPlan.hookIdea)}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-violet-700 transition hover:bg-violet-50"
                >
                  Create today&apos;s script
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href={`/creator/caption-generator?topic=${encodeURIComponent(dailyPlan.topic)}&hook=${encodeURIComponent(dailyPlan.hookIdea)}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
                >
                  Generate caption
                  <FileText size={18} />
                </Link>

                <Link
                  href={`/creator/hashtag-generator?topic=${encodeURIComponent(dailyPlan.topic)}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
                >
                  Generate hashtags
                  <Hash size={18} />
                </Link>

                <Link
                  href={`/creator/thumbnail-title-generator?topic=${encodeURIComponent(dailyPlan.topic)}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
                >
                  Thumbnail titles
                  <ImageIcon size={18} />
                </Link>

                <Link
                  href={`/creator/video-description-generator?title=${encodeURIComponent(dailyPlan.topic)}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20"
                >
                  Video description
                  <AlignLeft size={18} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center text-center">
              <Lightbulb size={32} className="mb-4 text-violet-200" />
              <h2 className="text-xl font-bold text-white">
                Today&apos;s plan could not be loaded
              </h2>
              <p className="mt-2 text-sm text-violet-200">
                Refresh the page or try again later.
              </p>
              <button
                type="button"
                onClick={loadDashboard}
                className="mt-5 rounded-xl bg-white px-5 py-3 font-semibold text-violet-700 hover:bg-violet-50 transition"
              >
                Try again
              </button>
            </div>
          )}
        </section>

        {/* Stats Grid */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <StatCard title="Saved hooks" value={stats.hooks} icon={Flame} colorClass="bg-violet-100 text-violet-700" />
          <StatCard title="Saved scripts" value={stats.scripts} icon={FileText} colorClass="bg-blue-100 text-blue-700" />
          <StatCard title="Saved captions" value={stats.captions} icon={FileText} colorClass="bg-emerald-100 text-emerald-700" />
          <StatCard title="Saved hashtags" value={stats.hashtags} icon={Hash} colorClass="bg-cyan-100 text-cyan-700" />
          <StatCard title="Thumbnail titles" value={stats.thumbnailTitles} icon={ImageIcon} colorClass="bg-pink-100 text-pink-700" />
          <StatCard title="Video descriptions" value={stats.videoDescriptions} icon={AlignLeft} colorClass="bg-indigo-100 text-indigo-700" />
          <StatCard title="Total saved" value={stats.totalSaved} icon={Bookmark} colorClass="bg-amber-100 text-amber-700" />
        </section>

        {/* Progress Section */}
        <section className="mb-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-violet-700">
                Today&apos;s Progress
              </p>
              <h2 className="mt-2 text-xl font-bold text-zinc-950">
                {progressPercentage === 100
                  ? "Daily workflow completed"
                  : "Continue your daily workflow"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {completedTasks} of {workflowTasks.length} tasks completed.
              </p>
            </div>

            <div className="min-w-44 text-right">
              <p className="text-3xl font-extrabold text-violet-700">
                {progressPercentage}%
              </p>
              <p className="text-xs text-zinc-400">Daily progress</p>
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercentage === 100
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </section>

        {/* Quick AI Tools */}
        <section className="mb-8">
          <div className="mb-5">
            <h2 className="text-2xl font-black tracking-tight text-zinc-950">
              Quick AI tools
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Generate content using your saved creator preferences.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="group rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition-all duration-200 group-hover:bg-violet-700 group-hover:text-white">
                    <Icon size={20} />
                  </div>

                  <h3 className="font-bold text-zinc-900 group-hover:text-violet-700 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-500 min-h-[3rem]">
                    {tool.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-violet-700 transition-colors">
                    Open tool
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Content Ideas & Daily Workflow Grid */}
        <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Content Ideas */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-950">Content ideas</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Example topics you can use in the AI generators.
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="space-y-4">
              {recommendedIdeas.map((idea) => (
                <div
                  key={idea.title}
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between hover:border-violet-200 hover:bg-violet-50 transition-all"
                >
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                        {idea.category}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {idea.stage}
                      </span>
                    </div>
                    <h3 className="font-bold text-zinc-900">{idea.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        Idea score
                      </p>
                      <p className="text-xl font-extrabold text-violet-700">
                        {idea.score}%
                      </p>
                    </div>

                    <Link
                      href={`/creator/hook-generator?topic=${encodeURIComponent(idea.title)}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-violet-700 shadow-sm transition hover:bg-violet-700 hover:text-white hover:border-violet-700"
                      aria-label={`Generate hooks for ${idea.title}`}
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Workflow */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Lightbulb size={20} />
            </div>

            <h2 className="text-xl font-bold text-zinc-950">Daily workflow</h2>

            <div className="mt-5 space-y-4">
              {workflowTasks.map((task, index) => (
                <div
                  key={task.title}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                    task.completed
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-zinc-100 bg-zinc-50"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border ${
                      task.completed
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-white text-zinc-400 border-zinc-200"
                    }`}
                  >
                    {task.completed ? "✓" : index + 1}
                  </span>
                  <p
                    className={`text-sm ${
                      task.completed
                        ? "font-medium text-emerald-700"
                        : "text-zinc-600"
                    }`}
                  >
                    {task.title}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50 p-4">
              <div className="flex items-start gap-3">
                <BarChart3 size={19} className="mt-0.5 shrink-0 text-violet-700" />
                <p className="text-sm leading-relaxed text-violet-700">
                  Complete your hook, script, caption, hashtag, thumbnail
                  title and video-description workflow, then mark today&apos;s
                  AI plan as completed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-950">
                  Edit today&apos;s plan
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Update your plan details manually.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlan(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePlanEdit} className="mt-6 grid gap-5 sm:grid-cols-2">
              {[
                ["topic", "Topic"],
                ["format", "Format"],
                ["hookIdea", "Hook idea"],
                ["cta", "Call to action"],
                ["postingTime", "Posting time"],
                ["aiTip", "AI tip"],
                ["estimatedTime", "Estimated time"],
                ["contentGoal", "Content goal"],
              ].map(([name, label]) => (
                <div
                  key={name}
                  className={["topic", "hookIdea", "cta"].includes(name) ? "sm:col-span-2" : ""}
                >
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {label}
                  </label>
                  <input
                    name={name}
                    value={editForm[name]}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                </div>
              ))}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={editForm.difficulty}
                  onChange={handleEditChange}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={savingEdit}
                className="sm:col-span-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-4 font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-800 disabled:opacity-50"
              >
                {savingEdit ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Save changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Icon size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-violet-200">{label}</p>
          <p className="mt-1 text-sm font-semibold capitalize text-white">
            {value || "Not available"}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}>
        <Icon size={21} />
      </div>
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</p>
      <p className="mt-1.5 text-2xl font-black text-zinc-950">{value}</p>
    </div>
  );
}