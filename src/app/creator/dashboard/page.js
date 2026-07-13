"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlignLeft,
  ArrowRight,
  BarChart3,
  Bookmark,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  Hash,
  ImageIcon,
  Lightbulb,
  LoaderCircle,
  LogOut,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";

import {
  getCurrentUser,
  logoutUser,
} from "@/services/auth.api";

import { getSavedContents } from "@/services/saved.api";

import {
  getDailyPlan,
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
    description:
      "Generate SEO-friendly video descriptions, keywords and CTAs.",
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

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const userResponse = await getCurrentUser();
      const currentUser = userResponse.user;

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

      setUser(currentUser);

      try {
        const savedResponse = await getSavedContents({
          type: "all",
          search: "",
        });

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
    const hooks = savedContents.filter(
      (item) => item.type === "hook"
    ).length;

    const scripts = savedContents.filter(
      (item) => item.type === "script"
    ).length;

    const captions = savedContents.filter(
      (item) => item.type === "caption"
    ).length;

    const hashtags = savedContents.filter(
      (item) => item.type === "hashtag"
    ).length;

    const thumbnailTitles = savedContents.filter(
      (item) => item.type === "thumbnail-title"
    ).length;

    const videoDescriptions = savedContents.filter(
      (item) => item.type === "video-description"
    ).length;

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
      {
        title: "Generate a hook",
        completed: stats.hooks > 0,
      },
      {
        title: "Create a script",
        completed: stats.scripts > 0,
      },
      {
        title: "Write a caption",
        completed: stats.captions > 0,
      },
      {
        title: "Generate hashtags",
        completed: stats.hashtags > 0,
      },
      {
        title: "Create thumbnail titles",
        completed: stats.thumbnailTitles > 0,
      },
      {
        title: "Write video description",
        completed: stats.videoDescriptions > 0,
      },
      {
        title: "Complete today’s plan",
        completed: Boolean(dailyPlan?.completed),
      },
    ],
    [stats, dailyPlan]
  );

  const completedTasks = workflowTasks.filter(
    (task) => task.completed
  ).length;

  const progressPercentage = Math.round(
    (completedTasks / workflowTasks.length) * 100
  );

  const handlePlanStatus = async () => {
    if (!dailyPlan) return;

    try {
      setUpdatingPlan(true);
      setMessage("");

      const response = await updateDailyPlanStatus(
        !dailyPlan.completed
      );

      setDailyPlan(response.data);
    } catch (error) {
      setMessage(
        error.message || "Unable to update daily plan."
      );
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030014] text-white flex items-center justify-center relative overflow-hidden font-sans">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
        
        {/* Background Dots Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3 text-violet-400">
          <LoaderCircle size={25} className="animate-spin" />
          <span className="font-medium text-zinc-300">
            Loading creator dashboard...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030014] text-white p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[35%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Background Dots Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
              Creator Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Welcome, <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">{user?.fullname || "Creator"}</span>
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400">
              Create personalized hooks, scripts, captions, hashtags,
              thumbnail titles, video descriptions and follow your daily
              content plan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#120f2e]/55 px-4 py-3 text-sm text-zinc-300 shadow-sm">
              <UserRound size={18} className="text-violet-400" />
              <span className="capitalize font-medium">
                {user?.plan || "free"} plan
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <LogOut size={18} />
              )}
              Logout
            </button>
          </div>
        </header>

        {message && (
          <div className="mb-6 rounded-xl border p-4 text-sm flex items-start gap-3 backdrop-blur-md transition-all duration-300 border-red-500/25 bg-red-500/10 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <div className="p-1 rounded-md shrink-0 bg-red-500/20">
              <span className="text-red-400 font-bold block leading-none w-4 h-4 text-center">!</span>
            </div>
            <div>{message}</div>
          </div>
        )}

        {/* Content Plan Section */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/60 via-indigo-950/40 to-cyan-950/20 border border-white/10 p-6 text-white backdrop-blur-2xl shadow-xl shadow-violet-950/20 sm:p-8">
          {dailyPlanLoading ? (
            <div className="flex min-h-52 items-center justify-center">
              <div className="flex items-center gap-3 text-violet-400">
                <LoaderCircle size={23} className="animate-spin" />
                <span className="font-medium text-zinc-300">
                  Preparing today&apos;s personalized plan...
                </span>
              </div>
            </div>
          ) : dailyPlan ? (
            <div>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 border border-violet-500/30">
                    <Sparkles size={24} className="text-violet-300" />
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                    Today&apos;s Content Plan
                  </p>

                  <h2 className="mt-2 max-w-3xl text-2xl font-bold sm:text-3xl text-white">
                    {dailyPlan.topic}
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-semibold capitalize text-zinc-300">
                      {dailyPlan.format}
                    </span>

                    {dailyPlan.postingTime && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-semibold text-zinc-300">
                        <Clock3 size={13} className="text-cyan-400" />
                        Post: {dailyPlan.postingTime}
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        dailyPlan.completed
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      {dailyPlan.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlanStatus}
                  disabled={updatingPlan}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    dailyPlan.completed
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 hover:bg-emerald-500/30"
                      : "bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
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
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Mark complete
                    </>
                  )}
                </button>
              </div>

              <div className="mt-7 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                    Hook idea
                  </p>

                  <p className="mt-2 leading-relaxed text-zinc-300">
                    {dailyPlan.hookIdea}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                    Call to action
                  </p>

                  <p className="mt-2 leading-relaxed text-zinc-300">
                    {dailyPlan.cta}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/[0.03] border border-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                  Today&apos;s action steps
                </p>

                <div className="mt-4 space-y-3">
                  {dailyPlan.actionSteps?.map((step, index) => (
                    <div
                      key={`${step}-${index}`}
                      className="flex items-start gap-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-xs font-bold text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]">
                        {index + 1}
                      </span>

                      <p className="text-sm leading-relaxed text-zinc-300">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/creator/script-generator?topic=${encodeURIComponent(
                    dailyPlan.topic
                  )}&hook=${encodeURIComponent(
                    dailyPlan.hookIdea
                  )}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-3 font-semibold text-white transition hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  Create today&apos;s script
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href={`/creator/hashtag-generator?topic=${encodeURIComponent(
                    dailyPlan.topic
                  )}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  Generate hashtags
                  <Hash size={18} className="text-violet-400" />
                </Link>

                <Link
                  href={`/creator/thumbnail-title-generator?topic=${encodeURIComponent(
                    dailyPlan.topic
                  )}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  Thumbnail titles
                  <ImageIcon size={18} className="text-violet-400" />
                </Link>

                <Link
                  href={`/creator/video-description-generator?title=${encodeURIComponent(
                    dailyPlan.topic
                  )}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  Video description
                  <AlignLeft size={18} className="text-violet-400" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center text-center">
              <Lightbulb
                size={32}
                className="mb-4 text-violet-400"
              />

              <h2 className="text-xl font-bold text-white">
                Today&apos;s plan could not be loaded
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
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
          <StatCard
            title="Saved hooks"
            value={stats.hooks}
            icon={Flame}
            iconClassName="bg-violet-500/10 text-violet-400 border border-violet-500/20"
          />

          <StatCard
            title="Saved scripts"
            value={stats.scripts}
            icon={FileText}
            iconClassName="bg-blue-500/10 text-blue-400 border border-blue-500/20"
          />

          <StatCard
            title="Saved captions"
            value={stats.captions}
            icon={FileText}
            iconClassName="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          />

          <StatCard
            title="Saved hashtags"
            value={stats.hashtags}
            icon={Hash}
            iconClassName="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          />

          <StatCard
            title="Thumbnail titles"
            value={stats.thumbnailTitles}
            icon={ImageIcon}
            iconClassName="bg-pink-500/10 text-pink-400 border border-pink-500/20"
          />

          <StatCard
            title="Video descriptions"
            value={stats.videoDescriptions}
            icon={AlignLeft}
            iconClassName="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
          />

          <StatCard
            title="Total saved"
            value={stats.totalSaved}
            icon={Bookmark}
            iconClassName="bg-amber-500/10 text-amber-400 border border-amber-500/20"
          />
        </section>

        {/* Progress Section */}
        <section className="mb-8 rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">
                Today&apos;s Progress
              </p>

              <h2 className="mt-2 text-xl font-bold text-white">
                {progressPercentage === 100
                  ? "Daily workflow completed"
                  : "Continue your daily workflow"}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {completedTasks} of {workflowTasks.length} tasks completed.
              </p>
            </div>

            <div className="min-w-44 text-right sm:text-right">
              <p className="text-3xl font-extrabold text-violet-400">
                {progressPercentage}%
              </p>

              <p className="text-xs text-zinc-500">
                Daily progress
              </p>
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercentage === 100
                  ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  : "bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
              }`}
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </section>

        {/* Quick AI Tools */}
        <section className="mb-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white font-sans">
              Quick AI tools
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
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
                  className="group rounded-2xl border border-white/10 bg-[#120f2e]/45 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/5 hover:shadow-lg hover:shadow-violet-950/20"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 transition-all duration-300 group-hover:bg-gradient-to-tr group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                    <Icon size={20} />
                  </div>

                  <h3 className="font-bold text-white group-hover:text-violet-300 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-400 min-h-[3rem]">
                    {tool.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">
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
          <div className="rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Content ideas
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Example topics you can use in the AI generators.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="space-y-4">
              {recommendedIdeas.map((idea) => (
                <div
                  key={idea.title}
                  className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-[#120f2e]/35 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-white/5 transition-all"
                >
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-300">
                        {idea.category}
                      </span>

                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                        {idea.stage}
                      </span>
                    </div>

                    <h3 className="font-bold text-white">
                      {idea.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        Idea score
                      </p>

                      <p className="text-xl font-extrabold text-violet-400">
                        {idea.score}%
                      </p>
                    </div>

                    <Link
                      href={`/creator/hook-generator?topic=${encodeURIComponent(
                        idea.title
                      )}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-violet-400 shadow-sm transition hover:bg-violet-600 hover:text-white"
                      aria-label={`Generate hooks for ${idea.title}`}
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl p-6 shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lightbulb size={20} />
            </div>

            <h2 className="text-xl font-bold text-white">
              Daily workflow
            </h2>

            <div className="mt-5 space-y-4">
              {workflowTasks.map((task, index) => (
                <div
                  key={task.title}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#120f2e]/35 px-4 py-3"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold border transition-colors ${
                      task.completed
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-white/5 text-zinc-400 border-white/5"
                    }`}
                  >
                    {task.completed ? "✓" : index + 1}
                  </span>

                  <p
                    className={`text-sm ${
                      task.completed
                        ? "font-medium text-emerald-400"
                        : "text-zinc-300"
                    }`}
                  >
                    {task.title}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-violet-500/25 bg-violet-500/10 p-4 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
              <div className="flex items-start gap-3">
                <BarChart3
                  size={19}
                  className="mt-0.5 shrink-0 text-violet-400"
                />

                <p className="text-sm leading-relaxed text-violet-300">
                  Complete your hook, script, caption, hashtag, thumbnail
                  title and video-description workflow, then mark today&apos;s
                  AI plan as completed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#120f2e]/55 p-5 shadow-sm hover:border-white/10 transition-colors">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${iconClassName}`}
      >
        <Icon size={21} />
      </div>

      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {title}
      </p>

      <p className="mt-1.5 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}