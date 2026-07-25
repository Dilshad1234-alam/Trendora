"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LoaderCircle,
  LogOut,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Check,
  Lightbulb,
  Building2,
  Users,
  FileText,
  BarChart,
  Crown
} from "lucide-react";

import { logoutUser } from "@/services/auth.api";
import {
  getAgencyDashboard,
  getAgencyDailyPlan,
  toggleAgencyPlanStep,
  updateAgencyPlanStatus,
  regenerateAgencyDailyPlan,
} from "@/services/agency.api";

export default function AgencyDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentSavedContents, setRecentSavedContents] = useState([]);

  const [dailyPlan, setDailyPlan] = useState(null);
  const [dailyPlanLoading, setDailyPlanLoading] = useState(true);
  const [regeneratingPlan, setRegeneratingPlan] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [updatingStepId, setUpdatingStepId] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setDailyPlanLoading(true);
      setMessage("");

      const [dashboardRes, planRes] = await Promise.allSettled([
        getAgencyDashboard(),
        getAgencyDailyPlan()
      ]);

      if (dashboardRes.status === "fulfilled" && dashboardRes.value?.data) {
        setUser(dashboardRes.value.data.user);
        setStats(dashboardRes.value.data.stats);
        setRecentSavedContents(dashboardRes.value.data.recentSavedContents);
      } else {
        throw new Error(dashboardRes.reason?.message || "Failed to load dashboard data.");
      }

      if (planRes.status === "fulfilled" && planRes.value?.data) {
        setDailyPlan(planRes.value.data);
      } else {
        setMessage(planRes.reason?.message || "Today's agency plan could not be loaded.");
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      if (error.message.includes("Unauthorized") || error.message.includes("token")) {
        router.replace("/login");
      } else {
        setMessage(error.message || "An error occurred.");
      }
    } finally {
      setLoading(false);
      setDailyPlanLoading(false);
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
      const response = await toggleAgencyPlanStep(stepId);
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
      const response = await updateAgencyPlanStatus(!dailyPlan.completed);
      setDailyPlan(response?.data || null);
    } catch (error) {
      setMessage(error?.message || "Unable to update the plan.");
    } finally {
      setUpdatingPlan(false);
    }
  };

  const handleRegeneratePlan = async () => {
    const confirmed = window.confirm("Generate a different agency plan for today? Your current progress will be reset.");
    if (!confirmed) return;
    try {
      setRegeneratingPlan(true);
      const response = await regenerateAgencyDailyPlan();
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
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex items-center gap-3 text-emerald-500">
          <LoaderCircle size={24} className="animate-spin" />
          <span className="font-medium">Loading agency workspace...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 font-sans text-zinc-100">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[1000px] max-w-full -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Crown size={18} className="text-emerald-400" />
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
                Agency Workspace
              </p>
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                {user?.name || "Agency"}
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Manage your clients, team, and AI content generation in one powerful hub.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              Add Client <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {loggingOut ? <LoaderCircle size={18} className="animate-spin" /> : <LogOut size={18} />}
              Logout
            </button>
          </div>
        </header>

        {message && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")} className="font-bold">×</button>
          </div>
        )}

        {/* Top KPI Metrics for Agency */}
        <div className="mb-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Clients", value: stats?.activeClients || 0, icon: Building2 },
            { label: "Team Members", value: stats?.teamMembers || 0, icon: Users },
            { label: "Total Assets", value: stats?.totalSavedContents || 0, icon: FileText },
            { label: "AI Generations (Mo)", value: stats?.aiGenerationsThisMonth || 0, icon: BarChart },
          ].map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-400">{metric.label}</p>
                  <Icon size={18} className="text-emerald-400" />
                </div>
                <p className="mt-4 text-3xl font-black text-white">{metric.value}</p>
              </div>
            );
          })}
        </div>

        <section className="mb-8 overflow-hidden rounded-3xl border border-emerald-900/30 bg-gradient-to-r from-emerald-900/40 via-teal-900/40 to-cyan-900/40 p-6 text-white shadow-2xl sm:p-8 relative backdrop-blur-md">
          <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none"></div>
          {dailyPlanLoading ? (
            <div className="flex min-h-56 items-center justify-center relative z-10">
              <LoaderCircle size={28} className="animate-spin text-emerald-400" />
            </div>
          ) : dailyPlan ? (
            <div className="relative z-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                    <Sparkles size={24} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                      Agency Growth Plan
                    </p>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                      AGENCY UNLIMITED
                    </span>
                  </div>
                  <h2 className="mt-2 max-w-3xl text-2xl font-bold text-white sm:text-3xl">{dailyPlan.topic}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-emerald-100/70">{dailyPlan.agencyGoal}</p>
                </div>
                
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center shrink-0">
                  <button
                    type="button"
                    onClick={handleRegeneratePlan}
                    disabled={regeneratingPlan || dailyPlan.completed}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-900/50 disabled:opacity-50"
                  >
                    <RefreshCw size={17} className={regeneratingPlan ? "animate-spin" : ""} />
                    {regeneratingPlan ? "Regenerating..." : "Regenerate Plan"}
                  </button>
                  <button
                    type="button"
                    onClick={handlePlanStatus}
                    disabled={updatingPlan || (!dailyPlan.completed && !allStepsCompleted)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 size={17} />
                    {updatingPlan ? "Updating..." : dailyPlan.completed ? "Completed" : allStepsCompleted ? "Mark complete" : "Complete all steps"}
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-zinc-950/40 p-6 border border-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200/70">Strategic Actions</p>
                    <p className="mt-1 text-sm text-emerald-100/50">{dailyPlan.completedSteps || 0} of {dailyPlan.totalSteps || 0} completed</p>
                  </div>
                  <p className="text-xl font-bold text-emerald-400">{dailyPlan.stepsProgress || 0}%</p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-900">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${dailyPlan.stepsProgress || 0}%` }} />
                </div>
                <div className="mt-6 space-y-3">
                  {dailyPlan.actionSteps?.map((step, index) => (
                    <button
                      key={step.id || `${step.text}-${index}`}
                      type="button"
                      onClick={() => handleToggleStep(step.id)}
                      disabled={updatingStepId === step.id || !step.id || dailyPlan.completed}
                      className={`flex w-full items-start gap-3 rounded-xl border px-5 py-4 text-left transition ${
                        step.completed ? "border-emerald-500/30 bg-emerald-950/30" : "border-white/5 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                        step.completed ? "border-emerald-500 bg-emerald-500 text-zinc-950" : "border-zinc-600 text-zinc-400"
                      }`}>
                        {step.completed ? <Check size={14} /> : (index + 1)}
                      </span>
                      <span className={`text-sm leading-6 ${step.completed ? "text-emerald-200/60 line-through" : "text-zinc-200"}`}>
                        {step.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center text-center relative z-10">
              <Lightbulb size={30} className="text-emerald-500/50 mb-3" />
              <p className="text-emerald-100/70">Today&apos;s agency plan could not be loaded.</p>
              <button onClick={loadDashboard} className="mt-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-5 py-2.5 text-sm font-semibold text-emerald-300">Try again</button>
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Recent Client Content</h2>
                <p className="mt-1 text-sm text-zinc-400">Latest AI content generated for clients.</p>
              </div>
              <Link href="/agency/saved" className="text-sm font-semibold text-emerald-400 hover:text-emerald-300">View all</Link>
            </div>
            <div className="space-y-3">
              {recentSavedContents.length > 0 ? (
                recentSavedContents.map((item) => (
                  <div key={item._id || item.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-emerald-500/50 hover:bg-zinc-900">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-medium text-zinc-200">{item.title}</p>
                      <span className="shrink-0 rounded-full bg-emerald-950 border border-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-400">
                        {item.type.replaceAll("-", " ")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
                  <p className="text-sm text-zinc-500">No content generated yet.</p>
                </div>
              )}
            </div>
          </section>
          
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Agency Tools</h2>
              <p className="mt-1 text-sm text-zinc-400">Quick access to your agency workflows.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "Manage Clients", desc: "View and add new client profiles", href: "/agency/clients" },
                { title: "Team Settings", desc: "Manage team member access", href: "/agency/team" },
                { title: "Bulk Generator", desc: "Generate content in batches", href: "/agency/bulk-generate" },
                { title: "White Label", desc: "Customize branding and domains", href: "/agency/branding" },
              ].map((tool) => (
                <Link key={tool.title} href={tool.href} className="group rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-emerald-500/50 hover:bg-zinc-900">
                  <h3 className="font-semibold text-zinc-200 group-hover:text-emerald-400">{tool.title}</h3>
                  <p className="mt-2 text-xs text-zinc-500">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
