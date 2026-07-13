"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  FileText,
  Flame,
  Hash,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const quickTools = [
  {
    title: "Hook Generator",
    description: "Create strong hooks for reels and shorts.",
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
    description: "Create captions, CTAs and hashtags.",
    icon: Hash,
    href: "/creator/caption-generator",
  },
  {
    title: "Saved Content",
    description: "Open your saved hooks, scripts and ideas.",
    icon: Bookmark,
    href: "/creator/saved",
  },
];

const trends = [
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
    stage: "Peak",
  },
];

export default function CreatorDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f7f7fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
              Creator Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold text-zinc-900 sm:text-4xl">
              Welcome to Trendora
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
              Discover trends, generate content and follow your personalized
              creator growth plan.
            </p>
          </div>

          <Link
            href="/creator/trends"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white transition hover:bg-violet-800"
          >
            Explore trends
            <ArrowRight size={18} />
          </Link>
        </header>

        <section className="mb-8 rounded-3xl bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Sparkles size={24} />
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">
                Today&apos;s Growth Action
              </p>

              <h2 className="mt-2 max-w-2xl text-2xl font-bold sm:text-3xl">
                Create a 30-second reel using a fast-growing trend.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100">
                Start with a curiosity hook, explain one useful point and end
                with a clear CTA.
              </p>
            </div>

            <Link
              href="/creator/script-generator"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              Generate script
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <TrendingUp size={21} />
            </div>

            <p className="text-sm text-zinc-500">Recommended trends</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">12</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileText size={21} />
            </div>

            <p className="text-sm text-zinc-500">Generated scripts</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">0</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Bookmark size={21} />
            </div>

            <p className="text-sm text-zinc-500">Saved content</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">0</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <BarChart3 size={21} />
            </div>

            <p className="text-sm text-zinc-500">Weekly progress</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">0%</p>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">
                Quick AI tools
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Create content faster with personalized AI tools.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {quickTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-700 group-hover:text-white">
                    <Icon size={22} />
                  </div>

                  <h3 className="font-bold text-zinc-900">{tool.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {tool.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-violet-700">
                    Open tool
                    <ArrowRight size={16} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  Recommended trends
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Trends matched to your creator profile.
                </p>
              </div>

              <Link
                href="/creator/trends"
                className="text-sm font-semibold text-violet-700"
              >
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {trends.map((trend) => (
                <div
                  key={trend.title}
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                        {trend.category}
                      </span>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {trend.stage}
                      </span>
                    </div>

                    <h3 className="font-bold text-zinc-900">{trend.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Match score</p>
                      <p className="text-xl font-bold text-violet-700">
                        {trend.score}%
                      </p>
                    </div>

                    <Link
                      href="/creator/trends"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm"
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Lightbulb size={22} />
            </div>

            <h2 className="text-xl font-bold text-zinc-900">
              This week&apos;s plan
            </h2>

            <div className="mt-5 space-y-4">
              {[
                "Monday: Educational reel",
                "Tuesday: Relatable short post",
                "Wednesday: Trend-based video",
                "Thursday: Helpful carousel",
                "Friday: Audience question",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}