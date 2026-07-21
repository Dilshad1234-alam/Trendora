"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Building2,
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
} from "lucide-react";

import {
  getCurrentUser,
  logoutUser,
} from "@/services/auth.api";

import { getSavedContents } from "@/services/saved.api";

import { getBusinessProfile } from "@/services/business-profile.api";

import {
  getBusinessDailyPlan,
  regenerateBusinessDailyPlan,
  toggleBusinessPlanStep,
  updateBusinessPlanStatus,
} from "@/services/business-daily-plan.api";

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
      "Generate local keywords and SEO recommendations.",
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

export default function BusinessDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);

  const [
    businessProfile,
    setBusinessProfile,
  ] = useState(null);

  const [dailyPlan, setDailyPlan] =
    useState(null);

  const [savedContents, setSavedContents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    dailyPlanLoading,
    setDailyPlanLoading,
  ] = useState(true);

  const [
    updatingStepId,
    setUpdatingStepId,
  ] = useState("");

  const [
    updatingPlan,
    setUpdatingPlan,
  ] = useState(false);

  const [
    regeneratingPlan,
    setRegeneratingPlan,
  ] = useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const loadDashboard =
    useCallback(async () => {
      try {
        setLoading(true);
        setDailyPlanLoading(true);
        setMessage("");

        const authResponse =
          await getCurrentUser();

        const currentUser =
          authResponse?.user ||
          authResponse?.data?.user;

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

        if (
          currentUser.role === "creator"
        ) {
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

        if (
          currentUser.role !== "business"
        ) {
          router.replace("/");
          return;
        }

        if (
          !currentUser.onboardingCompleted
        ) {
          router.replace(
            "/onboarding/business"
          );
          return;
        }

        if (
          currentUser.trialExpired &&
          !currentUser.planSelected
        ) {
          router.replace(
            "/onboarding/select-plan"
          );
          return;
        }

        if (
          currentUser.planSelected &&
          currentUser.plan ===
            "business-pro"
        ) {
          router.replace(
            "/business-pro/dashboard"
          );
          return;
        }

        if (
          currentUser.planSelected &&
          currentUser.plan === "agency"
        ) {
          router.replace(
            "/agency/dashboard"
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
          profileResult.status ===
          "fulfilled"
        ) {
          setBusinessProfile(
            profileResult.value?.data ||
              null
          );
        } else {
          console.error(
            "Business profile error:",
            profileResult.reason
          );

          setBusinessProfile(null);
        }

        if (
          savedResult.status ===
          "fulfilled"
        ) {
          setSavedContents(
            savedResult.value?.data || []
          );
        } else {
          console.error(
            "Saved content error:",
            savedResult.reason
          );

          setSavedContents([]);
        }

        if (
          dailyPlanResult.status ===
          "fulfilled"
        ) {
          setDailyPlan(
            dailyPlanResult.value?.data ||
              null
          );
        } else {
          console.error(
            "Daily plan error:",
            dailyPlanResult.reason
          );

          setDailyPlan(null);

          setMessage(
            dailyPlanResult.reason
              ?.message ||
              "Today's business plan could not be loaded."
          );
        }
      } catch (error) {
        console.error(
          "Dashboard loading error:",
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

      adCopies: countType("ad-copy"),

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

  const recentSavedContents =
    useMemo(
      () => savedContents.slice(0, 5),
      [savedContents]
    );

  const isFreePlan =
    !user?.planSelected ||
    user?.plan === "free";

  const freeRegenerationUsed =
    isFreePlan &&
    (dailyPlan?.regenerationCount ||
      0) >= 1;

  const allStepsCompleted =
    dailyPlan?.actionSteps?.length > 0 &&
    dailyPlan.actionSteps.every(
      (step) => step.completed
    );

  const localKeywords = useMemo(() => {
    const businessType =
      businessProfile?.businessType ||
      "business";

    const city =
      businessProfile?.city || "your city";

    const service =
      businessProfile?.services?.[0] ||
      businessType;

    return [
      `${service} in ${city}`,
      `Best ${businessType} in ${city}`,
      `Local ${service} near me`,
      `${businessType} services ${city}`,
    ];
  }, [businessProfile]);

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

      setDailyPlan(
        response?.data || null
      );
    } catch (error) {
      setMessage(
        error?.message ||
          "Unable to update this action."
      );
    } finally {
      setUpdatingStepId("");
    }
  };

  const handlePlanStatus =
    async () => {
      if (!dailyPlan) return;

      try {
        setUpdatingPlan(true);
        setMessage("");

        const response =
          await updateBusinessPlanStatus(
            !dailyPlan.completed
          );

        setDailyPlan(
          response?.data || null
        );
      } catch (error) {
        setMessage(
          error?.message ||
            "Unable to update the plan."
        );
      } finally {
        setUpdatingPlan(false);
      }
    };

  const handleRegeneratePlan =
    async () => {
      if (freeRegenerationUsed) {
        setMessage(
          "You have already used today's free regeneration. Upgrade to Business Pro for more regenerations."
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Generate a different business plan for today? Your current progress will be reset."
        );

      if (!confirmed) return;

      try {
        setRegeneratingPlan(true);
        setMessage("");

        const response =
          await regenerateBusinessDailyPlan();

        setDailyPlan(
          response?.data || null
        );
      } catch (error) {
        setMessage(
          error?.message ||
            "Unable to regenerate today's plan."
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
        error?.message ||
          "Logout failed."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white text-zinc-900">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle
            size={24}
            className="animate-spin"
          />

          <span className="font-medium">
            Loading business
            dashboard...
          </span>
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
              Business Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-4xl">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {businessProfile?.businessName ||
                  user?.fullname ||
                  "Business"}
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
              {businessProfile?.businessType ||
                "Business"}
              {" • "}
              {businessProfile?.city ||
                "City"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
                {user?.plan || "free"} plan
              </span>

              <span className="rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                Goal:{" "}
                {businessProfile?.goal ||
                  "Grow business"}
              </span>

              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {businessProfile?.onlinePresence ||
                  "No online platform"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/business/post-generator"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800"
            >
              Create a post
              <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{message}</span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-600 p-6 text-white shadow-2xl shadow-violet-200/50 sm:p-8">
          {dailyPlanLoading ? (
            <div className="flex min-h-56 items-center justify-center">
              <LoaderCircle
                size={28}
                className="animate-spin text-violet-200"
              />
            </div>
          ) : dailyPlan ? (
            <div>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    <Sparkles
                      size={24}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
                      Today&apos;s Business
                      Plan
                    </p>

                    {isFreePlan && (
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Free Plan
                      </span>
                    )}
                  </div>

                  <h2 className="mt-2 max-w-3xl text-2xl font-bold text-white sm:text-3xl">
                    {dailyPlan.topic}
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm leading-7 text-violet-100">
                    {dailyPlan.businessGoal}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                      {dailyPlan.contentType}
                    </span>

                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                      {dailyPlan.platform}
                    </span>

                    {dailyPlan.postingTime && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs">
                        <Clock3
                          size={13}
                        />

                        {
                          dailyPlan.postingTime
                        }
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={
                        handleRegeneratePlan
                      }
                      disabled={
                        regeneratingPlan ||
                        freeRegenerationUsed ||
                        dailyPlan.completed
                      }
                      title={
                        freeRegenerationUsed
                          ? "Free Plan allows one regeneration per day."
                          : "Generate a different plan"
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {regeneratingPlan ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <RefreshCw
                          size={17}
                        />
                      )}

                      {regeneratingPlan
                        ? "Regenerating..."
                        : freeRegenerationUsed
                          ? "Daily limit used"
                          : "Regenerate"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        handlePlanStatus
                      }
                      disabled={
                        updatingPlan ||
                        (!dailyPlan.completed &&
                          !allStepsCompleted)
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                          <CheckCircle2
                            size={17}
                          />
                          Completed
                        </>
                      ) : allStepsCompleted ? (
                        <>
                          <CheckCircle2
                            size={17}
                          />
                          Mark complete
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            size={17}
                          />
                          Complete all
                          steps
                        </>
                      )}
                    </button>
                  </div>

                  {isFreePlan && (
                    <p className="text-xs text-violet-200">
                      Free Plan: one
                      regeneration per day
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <BusinessInfoCard
                  icon={Target}
                  label="Target customer"
                  value={
                    dailyPlan.targetCustomer
                  }
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
                  value={
                    dailyPlan.estimatedTime
                  }
                />

                <BusinessInfoCard
                  icon={BarChart3}
                  label="Difficulty"
                  value={
                    dailyPlan.difficulty
                  }
                />
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                    Call to action
                  </p>

                  <p className="mt-2 text-sm leading-7 text-violet-100">
                    {dailyPlan.cta}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-400/15 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">
                    AI Tip
                  </p>

                  <p className="mt-2 text-sm leading-7 text-amber-50">
                    {dailyPlan.aiTip ||
                      "Focus on one clear customer benefit."}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                      Today&apos;s Actions
                    </p>

                    <p className="mt-1 text-sm text-violet-100">
                      {dailyPlan.completedSteps ||
                        0}{" "}
                      of{" "}
                      {dailyPlan.totalSteps ||
                        0}{" "}
                      completed
                    </p>
                  </div>

                  <p className="text-lg font-bold text-white">
                    {dailyPlan.stepsProgress ||
                      0}
                    %
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-300"
                    style={{
                      width: `${
                        dailyPlan.stepsProgress ||
                        0
                      }%`,
                    }}
                  />
                </div>

                <div className="mt-5 space-y-3">
                  {dailyPlan.actionSteps
                    ?.slice(0, 5)
                    .map(
                      (
                        step,
                        index
                      ) => (
                        <button
                          key={
                            step.id ||
                            `${step.text}-${index}`
                          }
                          type="button"
                          onClick={() =>
                            handleToggleStep(
                              step.id
                            )
                          }
                          disabled={
                            updatingStepId ===
                              step.id ||
                            !step.id ||
                            dailyPlan.completed
                          }
                          className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed ${
                            step.completed
                              ? "border-emerald-300/30 bg-emerald-400/15"
                              : "border-white/15 bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                              step.completed
                                ? "border-emerald-300 bg-emerald-400 text-white"
                                : "border-white/30 text-white/70"
                            }`}
                          >
                            {updatingStepId ===
                            step.id ? (
                              <LoaderCircle
                                size={
                                  14
                                }
                                className="animate-spin"
                              />
                            ) : step.completed ? (
                              <Check
                                size={
                                  15
                                }
                              />
                            ) : (
                              index +
                              1
                            )}
                          </span>

                          <span
                            className={`text-sm leading-6 ${
                              step.completed
                                ? "text-emerald-200 line-through"
                                : "text-white/90"
                            }`}
                          >
                            {step.text}
                          </span>
                        </button>
                      )
                    )}
                </div>

                {dailyPlan.completed && (
                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-100">
                    <CheckCircle2
                      size={18}
                    />

                    Today&apos;s business
                    plan is completed.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <Lightbulb
                size={30}
                className="text-violet-200"
              />

              <p className="mt-3 text-violet-100">
                Today&apos;s business
                plan could not be loaded.
              </p>

              <button
                type="button"
                onClick={loadDashboard}
                className="mt-4 rounded-xl bg-white px-5 py-3 font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                Try again
              </button>
            </div>
          )}
        </section>

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
            value={
              stats.whatsappReplies
            }
            icon={MessageSquareText}
          />

          <StatCard
            title="Total saved"
            value={stats.totalSaved}
            icon={Bookmark}
          />
        </section>

        <section className="mb-8">
          <div className="mb-5">
            <h2 className="text-2xl font-black tracking-tight text-zinc-950">
              Quick business tools
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Use AI tools to grow your
              online visibility faster.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="group rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 transition group-hover:bg-violet-700 group-hover:text-white group-hover:shadow-lg group-hover:shadow-violet-200">
                    <Icon size={23} />
                  </div>

                  <h3 className="font-bold text-zinc-900 transition group-hover:text-violet-700">
                    {tool.title}
                  </h3>

                  <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-zinc-600">
                    {tool.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-violet-700">
                    Open tool

                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                Recent saved business
                content
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Your latest saved posts,
                ads, SEO content and
                replies.
              </p>
            </div>

            <Link
              href="/business/saved"
              className="text-sm font-semibold text-violet-700 hover:text-violet-800"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {recentSavedContents.length >
            0 ? (
              recentSavedContents.map(
                (item) => (
                  <div
                    key={
                      item.id ||
                      item._id
                    }
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-zinc-900">
                        {item.title ||
                          "Saved content"}
                      </p>

                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium capitalize text-violet-700">
                        {String(
                          item.type ||
                            "content"
                        ).replaceAll(
                          "-",
                          " "
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {String(
                        item.content ||
                          ""
                      ).slice(0, 150)}

                      {String(
                        item.content ||
                          ""
                      ).length > 150
                        ? "..."
                        : ""}
                    </p>
                  </div>
                )
              )
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
                No saved business
                content yet.
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  Recommended local
                  keywords
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Use these keywords in
                  your website, posts and
                  Google Business Profile.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <MapPin size={22} />
              </div>
            </div>

            <div className="space-y-4">
              {localKeywords.map(
                (keyword, index) => (
                  <KeywordCard
                    key={keyword}
                    keyword={keyword}
                    index={index}
                  />
                )
              )}
            </div>

            <Link
              href="/business/local-seo-generator"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800"
            >
              Open Local SEO
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-violet-100 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                <Lock size={21} />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-900">
                  Weekly Growth Plan
                </h2>

                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700">
                  Business Pro
                </span>
              </div>

              <p className="mt-3 text-sm leading-7 text-zinc-500">
                Unlock a complete weekly
                marketing strategy,
                priority tasks, unlimited
                regenerations and advanced
                business recommendations.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  "7-day growth strategy",
                  "Priority sales tasks",
                  "Unlimited regenerations",
                  "Advanced AI recommendations",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500"
                  >
                    <Lock size={15} />
                    {feature}
                  </div>
                ))}
              </div>

              <Link
                href="/onboarding/select-plan"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
              >
                View Business Pro
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-zinc-200 bg-violet-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-lg shadow-violet-200">
                <Building2 size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  Complete your business
                  growth setup
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
                  Add business photos,
                  working hours, contact
                  details and Google
                  Business information to
                  receive better AI
                  recommendations.
                </p>
              </div>
            </div>

            <Link
              href="/business/settings"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 font-semibold text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
            >
              Update profile
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function BusinessInfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-white/15 p-4">
      <Icon
        size={19}
        className="text-violet-200"
      />

      <p className="mt-3 text-xs uppercase tracking-wider text-violet-200">
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
        <Icon size={20} />
      </div>

      <p className="text-xs uppercase tracking-wider text-zinc-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-zinc-900">
        {value || 0}
      </p>
    </div>
  );
}

function KeywordCard({
  keyword,
  index,
}) {
  const [copied, setCopied] =
    useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        keyword
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white hover:shadow-sm">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
          {index + 1}
        </span>

        <p className="truncate text-sm font-medium text-zinc-700">
          {keyword}
        </p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 text-sm font-semibold text-violet-700 transition hover:text-violet-800"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}