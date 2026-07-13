"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Building2,
  FileText,
  Lightbulb,
  MapPin,
  MessageSquareText,
  Search,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

const quickTools = [
  {
    title: "Post Generator",
    description: "Create social media posts for your local business.",
    icon: FileText,
    href: "/business/post-generator",
  },
  {
    title: "Local SEO",
    description: "Find local keywords for better Google visibility.",
    icon: Search,
    href: "/business/local-seo",
  },
  {
    title: "Review Reply",
    description: "Generate professional replies for customer reviews.",
    icon: MessageSquareText,
    href: "/business/review-reply",
  },
  {
    title: "Saved Content",
    description: "View your saved posts, keywords and replies.",
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
              Grow your <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">local business</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Create posts, improve local SEO, reply to reviews and follow your
              weekly growth plan.
            </p>
          </div>

          <Link
            href="/business/post-generator"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-3 font-semibold text-white transition hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 active:scale-[0.98] shadow-[0_0_15px_rgba(139,92,246,0.35)] hover:shadow-[0_0_20px_rgba(139,92,246,0.55)] transition-all duration-300"
          >
            Create a post
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </header>

        {/* Growth Action Card */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/60 via-indigo-950/40 to-cyan-950/20 border border-white/10 p-6 text-white backdrop-blur-2xl shadow-xl shadow-violet-950/20 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/20 border border-violet-500/30">
                <Sparkles size={24} className="text-violet-300" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                Today&apos;s Growth Action
              </p>

              <h2 className="mt-2 max-w-2xl text-2xl font-bold sm:text-3xl text-white">
                Publish a customer-focused post with a strong local CTA.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">
                Mention your city, explain one clear benefit and ask customers
                to call, message or visit your business.
              </p>
            </div>

            <Link
              href="/business/post-generator"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-5 py-3 font-semibold text-white transition hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              Generate post
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-[#120f2e]/55 p-5 shadow-sm hover:border-white/10 transition-colors">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <TrendingUp size={21} />
            </div>

            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Growth suggestions</p>
            <p className="mt-1.5 text-2xl font-bold text-white">8</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#120f2e]/55 p-5 shadow-sm hover:border-white/10 transition-colors">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText size={21} />
            </div>

            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Generated posts</p>
            <p className="mt-1.5 text-2xl font-bold text-white">0</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#120f2e]/55 p-5 shadow-sm hover:border-white/10 transition-colors">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Star size={21} />
            </div>

            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Review replies</p>
            <p className="mt-1.5 text-2xl font-bold text-white">0</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#120f2e]/55 p-5 shadow-sm hover:border-white/10 transition-colors">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BarChart3 size={21} />
            </div>

            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Visibility score</p>
            <p className="mt-1.5 text-2xl font-bold text-white">42%</p>
          </div>
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
}
