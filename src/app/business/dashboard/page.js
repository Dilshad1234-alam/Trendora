"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Bookmark, Building2, Check, CheckCircle2, Clock3, FileText, Lightbulb, LoaderCircle, LogOut,
  MapPin,
  MessageSquareText,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { getCurrentUser, logoutUser } from "@/services/auth.api";
import { getSavedContents } from "@/services/saved.api";
import { getBusinessProfile } from "@/services/business-profile.api";
import { getBusinessDailyPlan, regenerateBusinessDailyPlan, toggleBusinessPlanStep, updateBusinessPlanStatus } from "@/services/business-daily-plan.api";


const quickTools = [
  {
    title: "Post Generator",
    description:
      "Create promotional and educational social media posts.",
    icon: FileText,
    href: "/business/post-generator",
  },
  {
    title: "Caption Generator",
    description:
      "Create business captions, offers and calls to action.",
    icon: FileText,
    href: "/business/caption-generator",
  },
  {
    title: "Hashtag Generator",
    description:
      "Generate local, niche and service-related hashtags.",
    icon: Search,
    href: "/business/hashtag-generator",
  },
  {
    title: "Ad Copy",
    description:
      "Create ad headlines, primary text and CTAs.",
    icon: TrendingUp,
    href: "/business/ad-copy-generator",
  },
  {
    title: "Local SEO",
    description:
      "Generate local keywords and Google Business content.",
    icon: MapPin,
    href: "/business/local-seo-generator",
  },
  {
    title: "Review Reply",
    description:
      "Generate professional replies for customer reviews.",
    icon: Star,
    href: "/business/review-reply-generator",
  },
  {
    title: "WhatsApp Reply",
    description:
      "Create short and professional customer replies.",
    icon: MessageSquareText,
    href: "/business/whatsapp-reply-generator",
  },
  {
    title: "Saved Content",
    description:
      "Open your saved posts, ads, SEO content and replies.",
    icon: Bookmark,
    href: "/business/saved",
  },
];

const weeklyPlan = [
  "Monday: Share a helpful business tip",
  "Tuesday: Post a customer success story",
  "Wednesday: Publish a short service reel",
  "Thursday: Update Google Business Profile",
  "Friday: Share an offer or promotion",
];

const localKeywords = [
  "Digital marketing agency in Patna",
  "Best social media marketing Patna",
  "Website development company in Patna",
  "Local SEO services in Patna",
];

export default function BusinessDashboardPage() {

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
      setMessage("");

      const authResponse =
        await getCurrentUser();

      const currentUser =
        authResponse.user ||
        authResponse.data?.user;

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      if (!currentUser.role) {
        router.replace(
          "/onboarding/select-role"
        );
        return;
      }

      if (currentUser.role !== "business") {
        if (currentUser.role === "creator") {
          router.replace(
            "/creator/dashboard"
          );
          return;
        }

        if (currentUser.role === "admin") {
          router.replace(
            "/admin/dashboard"
          );
          return;
        }

        router.replace("/");
        return;
      }

      if (!currentUser.onboardingCompleted) {
        router.replace(
          "/onboarding/business"
        );
        return;
      }

      if (
        !currentUser.planSelected ||
        !currentUser.plan
      ) {
        router.replace(
          "/onboarding/select-plan"
        );
        return;
      }

      setUser(currentUser);

      const [
        profileResult,
        savedResult,
        dailyPlanResult,
      ] = await Promise.allSettled([
        getBusinessProfile(),

        getSavedContents({
          type: "all",
          search: "",
        }),

        getBusinessDailyPlan(),
      ]);

      if (
        profileResult.status === "fulfilled"
      ) {
        setBusinessProfile(
          profileResult.value.data || null
        );
      } else {
        console.error(
          "Business profile fetch error:",
          profileResult.reason
        );

        setBusinessProfile(null);
      }

      if (
        savedResult.status === "fulfilled"
      ) {
        setSavedContents(
          savedResult.value.data || []
        );
      } else {
        console.error(
          "Business saved content error:",
          savedResult.reason
        );

        setSavedContents([]);
      }

      if (
        dailyPlanResult.status === "fulfilled"
      ) {
        setDailyPlan(
          dailyPlanResult.value.data || null
        );
      } else {
        console.error(
          "Business daily-plan error:",
          dailyPlanResult.reason
        );

        setDailyPlan(null);
      }
    } catch (error) {
      console.error(
        "Business dashboard loading error:",
        error
      );

      router.replace("/login");
    } finally {
      setDailyPlanLoading(false);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);


  const stats = useMemo(() => {
    const countType = (type) =>
      savedContents.filter(
        (item) => item.type === type
      ).length;

    return {
      posts: countType("business-post"),
      captions: countType(
        "business-caption"
      ),
      hashtags: countType(
        "business-hashtag"
      ),
      thumbnails: countType(
        "business-thumbnail-title"
      ),
      videoDescriptions: countType(
        "business-video-description"
      ),
      adCopies: countType("ad-copy"),
      productDescriptions: countType(
        "product-description"
      ),
      localSeo: countType("local-seo"),
      reviewReplies: countType(
        "review-reply"
      ),
      whatsappReplies: countType(
        "whatsapp-reply"
      ),
      totalSaved: savedContents.length,
    };
  }, [savedContents]);

  const recentSavedContents = useMemo(
    () => savedContents.slice(0, 5),
    [savedContents]
  );

  const allStepsCompleted = dailyPlan?.actionSteps?.length > 0 &&
    dailyPlan.actionSteps.every(
      (step) => step.completed );

  const handleToggleStep = async (
    stepId
  ) => {
    if (!stepId) return;

    try {
      setUpdatingStepId(stepId);
      setMessage("");

      const response =
        await toggleBusinessPlanStep(
          stepId
        );

      setDailyPlan(response.data);
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to update business step."
      );
    } finally {
      setUpdatingStepId("");
    }
  };

  const handlePlanStatus = async () => {
    if (!dailyPlan) return;

    try {
      setUpdatingPlan(true);
      setMessage("");

      const response =
        await updateBusinessPlanStatus(
          !dailyPlan.completed
        );

      setDailyPlan(response.data);
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to update business plan."
      );
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleRegeneratePlan = async () => {
    const confirmed = window.confirm(
      "Generate a new business plan for today?"
    );

    if (!confirmed) return;

    try {
      setRegeneratingPlan(true);
      setMessage("");

      const response =
        await regenerateBusinessDailyPlan();

      setDailyPlan(response.data);
    } catch (error) {
      setMessage(
        error.message ||
          "Unable to regenerate business plan."
      );
    } finally {
      setRegeneratingPlan(false);
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
      setMessage(
        error.message || "Logout failed."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030014] text-white">
        <div className="flex items-center gap-3 text-violet-300">
          <LoaderCircle
            size={24}
            className="animate-spin"
          />

          <span>
            Loading business dashboard...
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
              Business Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                {businessProfile?.businessName ||
                  user?.fullname ||
                  "Business"}
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
              {businessProfile?.businessType ||
                "Business"}
              {" • "}
              {businessProfile?.city || "City"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs capitalize text-zinc-300">
                {user?.plan || "free"} plan
              </span>

              <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                Goal:{" "}
                {businessProfile?.goal ||
                  "Grow business"}
              </span>

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                {businessProfile?.onlinePresence ||
                  "No online platform"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/business/post-generator"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-3 font-semibold text-white"
            >
              Create a post
              <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-semibold text-red-300 disabled:opacity-50"
            >
              {loggingOut ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <LogOut size={18} />
              )}

              Logout
            </button>
          </div>
        </header>

        {message && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {message}
          </div>
        )}

        {/* Growth Action Card */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/60 via-indigo-950/40 to-cyan-950/20 p-6 sm:p-8">
  {dailyPlanLoading ? (
    <div className="flex min-h-56 items-center justify-center">
      <LoaderCircle
        size={24}
        className="animate-spin text-violet-300"
      />
    </div>
  ) : dailyPlan ? (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/20">
            <Sparkles
              size={24}
              className="text-violet-300"
            />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Today&apos;s Business Plan
          </p>

          <h2 className="mt-2 max-w-3xl text-2xl font-bold text-white sm:text-3xl">
            {dailyPlan.topic}
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
            {dailyPlan.businessGoal}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
              {dailyPlan.contentType}
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
              {dailyPlan.platform}
            </span>

            {dailyPlan.postingTime && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                <Clock3 size={13} />
                {dailyPlan.postingTime}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRegeneratePlan}
            disabled={regeneratingPlan}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300 disabled:opacity-50"
          >
            {regeneratingPlan ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={17} />
            )}

            {regeneratingPlan
              ? "Regenerating..."
              : "Regenerate"}
          </button>

          <button
            type="button"
            onClick={handlePlanStatus}
            disabled={
              updatingPlan ||
              (!dailyPlan.completed &&
                !allStepsCompleted)
            }
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updatingPlan ? (
              <>
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
                Updating...
              </>
            ) : dailyPlan.completed ? (
              <>
                <CheckCircle2 size={17} />
                Completed
              </>
            ) : allStepsCompleted ? (
              <>
                <CheckCircle2 size={17} />
                Mark complete
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                Complete all steps first
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BusinessInfoCard
          icon={Target}
          label="Target customer"
          value={dailyPlan.targetCustomer}
        />

        <BusinessInfoCard
          icon={TrendingUp}
          label="Offer idea"
          value={
            dailyPlan.offerIdea ||
            "No offer required"
          }
        />

        <BusinessInfoCard
          icon={Timer}
          label="Estimated time"
          value={dailyPlan.estimatedTime}
        />

        <BusinessInfoCard
          icon={BarChart3}
          label="Difficulty"
          value={dailyPlan.difficulty}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
            CTA
          </p>

          <p className="mt-2 text-sm leading-7 text-zinc-300">
            {dailyPlan.cta}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            AI Tip
          </p>

          <p className="mt-2 text-sm leading-7 text-amber-100/80">
            {dailyPlan.aiTip}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-400">
              Today&apos;s Actions
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              {dailyPlan.completedSteps || 0} of{" "}
              {dailyPlan.totalSteps || 0} completed
            </p>
          </div>

          <p className="text-lg font-bold text-violet-300">
            {dailyPlan.stepsProgress || 0}%
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 transition-all"
            style={{
              width: `${
                dailyPlan.stepsProgress || 0
              }%`,
            }}
          />
        </div>

        <div className="mt-5 space-y-3">
          {dailyPlan.actionSteps?.map(
            (step, index) => (
              <button
                key={
                  step.id ||
                  `${step.text}-${index}`
                }
                type="button"
                onClick={() =>
                  handleToggleStep(step.id)
                }
                disabled={
                  updatingStepId === step.id ||
                  !step.id
                }
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left ${
                  step.completed
                    ? "border-emerald-500/20 bg-emerald-500/10"
                    : "border-white/5 bg-[#120f2e]/35"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                    step.completed
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-white/15 text-zinc-500"
                  }`}
                >
                  {updatingStepId ===
                  step.id ? (
                    <LoaderCircle
                      size={14}
                      className="animate-spin"
                    />
                  ) : step.completed ? (
                    <Check size={15} />
                  ) : (
                    index + 1
                  )}
                </span>

                <span
                  className={`text-sm leading-6 ${
                    step.completed
                      ? "text-emerald-300 line-through"
                      : "text-zinc-300"
                  }`}
                >
                  {step.text}
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex min-h-52 flex-col items-center justify-center text-center">
      <Lightbulb
        size={30}
        className="text-violet-400"
      />

      <p className="mt-3 text-zinc-300">
        Today&apos;s business plan could not be loaded.
      </p>

      <button
        type="button"
        onClick={loadDashboard}
        className="mt-4 rounded-xl bg-white px-5 py-3 font-semibold text-violet-700"
      >
        Try again
      </button>
    </div>
  )}
</section>

        {/* Stats Grid */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
  <StatCard
    title="Business posts"
    value={stats.posts}
    icon={FileText}
  />

  <StatCard
    title="Ad copies"
    value={stats.adCopies}
    icon={TrendingUp}
  />

  <StatCard
    title="Local SEO"
    value={stats.localSeo}
    icon={Search}
  />

  <StatCard
    title="Review replies"
    value={stats.reviewReplies}
    icon={Star}
  />

  <StatCard
    title="WhatsApp replies"
    value={stats.whatsappReplies}
    icon={MessageSquareText}
  />

  <StatCard
    title="Total saved"
    value={stats.totalSaved}
    icon={Bookmark}
  />
</section>

        {/* Quick Tools */}
        <section className="mb-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white font-sans">
              Quick business tools
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Use AI tools to grow your online visibility faster.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="group rounded-2xl border border-white/10 bg-[#120f2e]/45 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/5 hover:shadow-lg hover:shadow-violet-950/20"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 transition-all duration-300 group-hover:bg-gradient-to-tr group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                    <Icon size={22} />
                  </div>

                  <h3 className="font-bold text-white group-hover:text-violet-300 transition-colors">{tool.title}</h3>

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

        <section className="mb-8 rounded-3xl border border-white/10 bg-[#0a0520]/40 p-6">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-xl font-bold text-white">
        Recent saved business content
      </h2>

      <p className="mt-1 text-sm text-zinc-400">
        Your latest saved posts, ads, SEO content and replies.
      </p>
    </div>

    <Link
      href="/business/saved"
      className="text-sm font-semibold text-violet-400"
    >
      View all
    </Link>
  </div>

  <div className="mt-5 space-y-3">
    {recentSavedContents.length > 0 ? (
      recentSavedContents.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-white/5 bg-[#120f2e]/35 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-white">
              {item.title}
            </p>

            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs capitalize text-violet-300">
              {item.type.replaceAll(
                "-",
                " "
              )}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {item.content?.slice(0, 150)}
            {item.content?.length > 150
              ? "..."
              : ""}
          </p>
        </div>
      ))
    ) : (
      <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
        No saved business content yet.
      </p>
    )}
  </div>
</section>

        {/* Local Keywords & Weekly Plan */}
        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Recommended local keywords
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Use these keywords in Google Business Profile and posts.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 border border-violet-500/20">
                <MapPin size={22} />
              </div>
            </div>

            <div className="space-y-4">
              {localKeywords.map((keyword, index) => (
                <div
                  key={keyword}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#120f2e]/35 p-4 hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/10 border border-violet-500/20 text-sm font-bold text-violet-400">
                      {index + 1}
                    </span>

                    <p className="text-sm font-medium text-zinc-300">
                      {keyword}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>

            <Link
              href="/business/local-seo"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              View more keywords
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl p-6 shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lightbulb size={22} />
            </div>

            <h2 className="text-xl font-bold text-white">
              This week&apos;s growth plan
            </h2>

            <div className="mt-5 space-y-4">
              {weeklyPlan.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/5 bg-[#120f2e]/35 px-4 py-3 text-sm text-zinc-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Update Profile Setup Prompt */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                <Building2 size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  Complete your business growth setup
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                  Add business photos, working hours, contact details and Google
                  Business information to get better recommendations.
                </p>
              </div>
            </div>

            <Link
              href="/business/settings"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 font-semibold text-violet-300 hover:bg-violet-500/20 hover:text-white transition-all duration-300"
            >
              Update profile
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );


  function BusinessInfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <Icon
        size={19}
        className="text-violet-400"
      />

      <p className="mt-3 text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold capitalize text-white">
        {value || "Not available"}
      </p>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#120f2e]/55 p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
        <Icon size={20} />
      </div>

      <p className="text-xs uppercase tracking-wider text-zinc-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}


}
