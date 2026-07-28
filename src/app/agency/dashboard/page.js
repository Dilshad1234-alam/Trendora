"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, LoaderCircle, LogOut, Sparkles, RefreshCw, CheckCircle2,
  Check, Lightbulb, Building2, Users, BarChart as BarChartIcon, Crown,
  Clock, CheckSquare, AlertCircle, FileText, Bell, Settings, Link as LinkIcon, Lock
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#6d28d9', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe', '#4c1d95'];

import { logoutUser } from "@/services/auth.api";
import {
  getAgencyDashboard, getAgencyDailyPlan, toggleAgencyPlanStep,
  updateAgencyPlanStatus, regenerateAgencyDailyPlan,
} from "@/services/agency.api";

import {
  getAgencyNotifications, markNotificationRead, markAllNotificationsRead
} from "@/services/agency-tools.api";

export default function AgencyDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [aiUsageStats, setAiUsageStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [generationTrend, setGenerationTrend] = useState([]);
  const [industryData, setIndustryData] = useState([]);

  const [dailyPlan, setDailyPlan] = useState(null);
  const [dailyPlanLoading, setDailyPlanLoading] = useState(true);
  const [regeneratingPlan, setRegeneratingPlan] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [updatingStepId, setUpdatingStepId] = useState("");

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setDailyPlanLoading(true);
      setMessage("");

      const [dashboardRes, planRes, notifRes] = await Promise.allSettled([
        getAgencyDashboard(),
        getAgencyDailyPlan(),
        getAgencyNotifications()
      ]);

      if (dashboardRes.status === "fulfilled" && dashboardRes.value?.data) {
        setUser(dashboardRes.value.data.user);
        setStats(dashboardRes.value.data.stats);
        setAiUsageStats(dashboardRes.value.data.aiUsageStats);
        setRecentActivity(dashboardRes.value.data.recentActivity);
        setGenerationTrend(dashboardRes.value.data.generationTrendByWeek);
        setIndustryData(dashboardRes.value.data.clientIndustryDistribution);
      } else {
        throw dashboardRes.reason || new Error("Failed to load dashboard data.");
      }

      if (notifRes.status === "fulfilled" && notifRes.value?.data) {
        setNotifications(notifRes.value.data);
        setUnreadCount(notifRes.value.unreadCount);
      }

      if (planRes.status === "fulfilled" && planRes.value?.data) {
        setDailyPlan(planRes.value.data);
      } else {
        console.error("Plan Error:", planRes.reason?.message);
      }
    } catch (error) {
      if (error.code === "TRIAL_EXPIRED") {
        router.replace("/onboarding/select-plan?recommended=agency");
      } else if (error.message?.includes("Unauthorized") || error.message?.includes("token") || error.status === 401) {
        router.replace("/login");
      } else {
        console.error("Dashboard error:", error);
        setMessage(error.message || "An error occurred.");
      }
    } finally {
      setLoading(false);
      setDailyPlanLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line
    loadDashboard();
  }, [loadDashboard]);

  // Click outside to close notifications
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id, e) => {
    if (e) e.preventDefault();
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 via-white to-white text-zinc-900">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle size={24} className="animate-spin" />
          <span className="font-medium">Loading agency dashboard...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900 pb-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[800px] max-w-full -translate-x-1/2 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Agency Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-zinc-950 sm:text-4xl">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {user?.name || "Agency"}
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
              Manage your clients, team, and AI content generation in one powerful hub.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium capitalize text-zinc-700">
                {user?.plan || "agency"} plan
              </span>
              <span className="rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                Agency Unlimited
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 hover:text-violet-700"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
                    <h3 className="font-bold text-zinc-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar flex flex-col">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-zinc-500">No new notifications.</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif._id} className={`flex gap-3 p-4 border-b border-zinc-100 transition ${notif.read ? 'bg-white opacity-70' : 'bg-violet-50/30'}`}>
                          <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notif.read ? 'bg-zinc-100 text-zinc-500' : 'bg-violet-100 text-violet-700'}`}>
                            {notif.type.includes('task') ? <CheckSquare size={14} /> : notif.type.includes('content') ? <FileText size={14} /> : <Bell size={14} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-zinc-900 mb-0.5">{notif.title}</p>
                            <p className="text-[11px] text-zinc-600 leading-snug mb-2">{notif.message}</p>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-zinc-400 font-medium">{new Date(notif.createdAt).toLocaleDateString()}</span>
                              {!notif.read && (
                                <button onClick={(e) => handleMarkRead(notif._id, e)} className="text-[10px] font-bold text-violet-600 hover:text-violet-800">
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/agency/clients"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800"
            >
              Add Client <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")} className="font-bold">×</button>
          </div>
        )}

        {/* Top KPI Metrics for Agency */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between">
             <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Building2 size={20} />
                </div>
                <p className="text-xs uppercase tracking-wider text-zinc-500">Active Clients</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{stats?.activeClients || 0}</p>
             </div>
             <div className="mt-3 flex gap-2 text-[10px] font-semibold text-zinc-500">
                <span className="bg-zinc-100 px-2 py-0.5 rounded">{stats?.creatorClients || 0} Creator</span>
                <span className="bg-zinc-100 px-2 py-0.5 rounded">{stats?.businessClients || 0} Business</span>
             </div>
          </div>
          
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between">
             <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <Users size={20} />
                </div>
                <p className="text-xs uppercase tracking-wider text-zinc-500">Team Members</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{(stats?.activeTeamMembers || 0) + (stats?.invitedTeamMembers || 0)}</p>
             </div>
             <div className="mt-3 flex gap-2 text-[10px] font-semibold text-zinc-500">
                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">{stats?.activeTeamMembers || 0} Active</span>
                <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded">{stats?.invitedTeamMembers || 0} Invited</span>
             </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between">
             <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <BarChartIcon size={20} />
                </div>
                <p className="text-xs uppercase tracking-wider text-zinc-500">AI Generations</p>
                <p className="mt-1 text-2xl font-bold text-zinc-900">{stats?.totalGeneratedContent || 0}</p>
             </div>
             <div className="mt-3 flex gap-2 text-[10px] font-semibold text-zinc-500">
                <span className="bg-zinc-100 px-2 py-0.5 rounded">{stats?.aiGenerationsThisMonth || 0} This Month</span>
             </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between">
             <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-200 text-emerald-800">
                  <Clock size={20} />
                </div>
                <p className="text-xs uppercase tracking-wider text-emerald-700">AI Hours Saved</p>
                <p className="mt-1 text-2xl font-black text-emerald-900">{stats?.estimatedAiHoursSaved || 0}h</p>
             </div>
             <div className="mt-3 flex gap-2 text-[10px] font-semibold text-emerald-600">
                <span className="bg-emerald-100 px-2 py-0.5 rounded">All-Time ROI</span>
             </div>
          </div>
        </div>

        {/* Action Highlights */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <Link href="/agency/tasks?dueDate=today" className="group rounded-2xl border border-blue-200 bg-blue-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-blue-700">Tasks Due Today</p>
              <CheckSquare size={18} className="text-blue-500" />
            </div>
            <p className="text-3xl font-black text-blue-900">{stats?.tasksDueToday || 0}</p>
          </Link>
          
          <Link href="/agency/tasks?status=overdue" className="group rounded-2xl border border-red-200 bg-red-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-red-700">Overdue Tasks</p>
              <AlertCircle size={18} className="text-red-500" />
            </div>
            <p className="text-3xl font-black text-red-900">{stats?.overdueTasks || 0}</p>
          </Link>

          <Link href="/agency/pipeline?status=review" className="group rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-amber-700">Pending Approvals</p>
              <CheckCircle2 size={18} className="text-amber-500" />
            </div>
            <p className="text-3xl font-black text-amber-900">{stats?.pendingApprovals || 0}</p>
          </Link>

          <Link href="/agency/calendar" className="group rounded-2xl border border-indigo-200 bg-indigo-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-indigo-700">Scheduled Content</p>
              <Sparkles size={18} className="text-indigo-500" />
            </div>
            <p className="text-3xl font-black text-indigo-900">{stats?.scheduledContent || 0}</p>
          </Link>
        </div>

        {/* Premium Analytics */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="col-span-2 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Content Generation Trend</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generationTrend}>
                  <defs>
                    <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="generated" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorGenerated)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Client Industries</h2>
            <div className="h-64 w-full flex items-center justify-center">
              {industryData && industryData.length > 0 && industryData[0].name !== "No Clients" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={industryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-zinc-400">No client industries available yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Usage Limits Widget (Admin/Owner Only) */}
        {aiUsageStats && (
          <section className="mb-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <BarChartIcon size={20} className="text-violet-600" />
                  Monthly AI Usage
                </h2>
                <p className="mt-1 text-sm text-zinc-500">Internal metrics for Owners and Admins.</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                System Healthy
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Total API Calls</p>
                <p className="text-2xl font-black text-zinc-900">{aiUsageStats.generations || 0}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Successful</p>
                <p className="text-2xl font-black text-emerald-700">{aiUsageStats.successfulGenerations || 0}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-1">Failed/Blocked</p>
                <p className="text-2xl font-black text-red-600">{aiUsageStats.failedGenerations || 0}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">Total Tokens Est.</p>
                <p className="text-2xl font-black text-blue-600">
                  {((aiUsageStats.inputTokens || 0) + (aiUsageStats.outputTokens || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Daily Content Plan */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-600 p-6 text-white shadow-2xl shadow-violet-200/50 sm:p-8">
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
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
                      Agency Growth Plan
                    </p>
                  </div>
                  <h2 className="mt-2 max-w-3xl text-2xl font-bold text-white sm:text-3xl">{dailyPlan.topic}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-violet-100">{dailyPlan.agencyGoal}</p>
                </div>
                
                <div className="flex flex-col items-start gap-2 sm:items-end shrink-0">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={handleRegeneratePlan}
                      disabled={regeneratingPlan || dailyPlan.completed}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {regeneratingPlan ? <LoaderCircle size={17} className="animate-spin" /> : <RefreshCw size={17} />}
                      {regeneratingPlan ? "Regenerating..." : "Regenerate"}
                    </button>
                    <button
                      type="button"
                      onClick={handlePlanStatus}
                      disabled={updatingPlan || (!dailyPlan.completed && !allStepsCompleted)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingPlan ? <LoaderCircle size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
                      {updatingPlan ? "Updating..." : dailyPlan.completed ? "Completed" : allStepsCompleted ? "Mark complete" : "Complete all steps"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white/10 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-200">Today&apos;s Actions</p>
                    <p className="mt-1 text-sm text-violet-100">{dailyPlan.completedSteps || 0} of {dailyPlan.totalSteps || 0} completed</p>
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
                      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed ${
                        step.completed ? "border-emerald-300/30 bg-emerald-400/15" : "border-white/15 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                        step.completed ? "border-emerald-300 bg-emerald-400 text-white" : "border-white/30 text-white/70"
                      }`}>
                        {updatingStepId === step.id ? <LoaderCircle size={14} className="animate-spin" /> : step.completed ? <Check size={15} /> : (index + 1)}
                      </span>
                      <span className={`text-sm leading-6 ${step.completed ? "text-emerald-200 line-through" : "text-white/90"}`}>
                        {step.text}
                      </span>
                    </button>
                  ))}
                </div>
                {dailyPlan.completed && (
                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-400/15 px-4 py-3 text-sm font-semibold text-emerald-100">
                    <CheckCircle2 size={18} />
                    Today&apos;s agency plan is completed.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <Lightbulb size={30} className="text-violet-200" />
              <p className="mt-3 text-violet-100">Today&apos;s agency plan could not be loaded.</p>
              <button type="button" onClick={loadDashboard} className="mt-4 rounded-xl bg-white px-5 py-3 font-semibold text-violet-700 transition hover:bg-violet-50">
                Try again
              </button>
            </div>
          )}
        </section>

        <section className="mb-8">
          <div className="mb-5">
            <h2 className="text-2xl font-black tracking-tight text-zinc-950">Agency Tools</h2>
            <p className="mt-1 text-sm text-zinc-600">Quick access to your agency workflows.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Manage Clients", desc: "Workspaces & Brand Voices", href: "/agency/clients", icon: Building2 },
              { title: "Task Management", desc: "Track client deliverables", href: "/agency/tasks", icon: CheckSquare },
              { title: "Content Pipeline", desc: "Kanban approval board", href: "/agency/pipeline", icon: Sparkles },
              { title: "Client Reports", desc: "Generate white-label reports", href: "/agency/reports", icon: FileText },
              { title: "Bulk Generator", desc: "Generate content in batches", href: "/agency/bulk-generate", icon: FileText },
              { title: "Team Settings", desc: "Manage team member access", href: "/agency/team", icon: Users },
              { title: "White Label", desc: "Customize branding and domains", href: "/agency/branding", icon: Crown },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.title} href={tool.href} className="group rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 transition group-hover:bg-violet-700 group-hover:text-white group-hover:shadow-lg group-hover:shadow-violet-200">
                    <Icon size={23} />
                  </div>
                  <h3 className="font-bold text-zinc-900 transition group-hover:text-violet-700">{tool.title}</h3>
                  <p className="mt-2 min-h-[3rem] text-sm leading-relaxed text-zinc-600">{tool.desc}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-violet-700">
                    Open tool
                    <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="mb-8">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Recent Agency Activity</h2>
              <p className="mt-1 text-sm text-zinc-500">Global activity log across your team and clients.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div key={item._id} className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white hover:shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                    {item.action.includes('task') ? <CheckSquare size={18} /> : item.action.includes('team') ? <Users size={18} /> : item.action.includes('client') ? <Building2 size={18} /> : <FileText size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{item.actorName} <span className="font-medium text-zinc-500">{item.description}</span></p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 font-semibold">
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                      <span className="rounded-full bg-zinc-200 px-2 py-0.5 capitalize">{item.action.replaceAll("-", " ")}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm font-semibold text-zinc-500 bg-zinc-50/50">
                No recent activity recorded yet.
              </p>
            )}
          </div>
          </div>
        </section>

        <section className="mb-8">
          {/* Agency Pro Promo Card */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="absolute right-0 top-0 h-full w-1/3 rounded-l-full bg-violet-100 blur-3xl opacity-50" />
            
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
                  <Lock size={21} />
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-zinc-900">
                    Agency Growth Plan
                  </h2>
                  <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700">
                    Agency Pro
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500 max-w-md">
                  Unlock a complete agency marketing strategy, priority tasks, unlimited regenerations and advanced team features.
                </p>
              </div>
              
              <div className="flex-1 shrink-0 w-full lg:max-w-md">
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Unlimited team members",
                    "White-label reports",
                    "Client branded portals",
                    "Advanced AI recommendations",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-zinc-600"
                    >
                      <Lock size={14} className="text-zinc-400 shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="shrink-0">
                <Link
                  href="/onboarding/select-plan"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-800"
                >
                  View Agency Pro
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
