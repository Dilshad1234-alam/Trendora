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
    <main className="min-h-screen bg-[#f7f7fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
              Business Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold text-zinc-900 sm:text-4xl">
              Grow your local business
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
              Create posts, improve local SEO, reply to reviews and follow your
              weekly growth plan.
            </p>
          </div>

          <Link
            href="/business/post-generator"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white transition hover:bg-violet-800"
          >
            Create a post
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
                Publish a customer-focused post with a strong local CTA.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100">
                Mention your city, explain one clear benefit and ask customers
                to call, message or visit your business.
              </p>
            </div>

            <Link
              href="/business/post-generator"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              Generate post
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
              <TrendingUp size={21} />
            </div>

            <p className="text-sm text-zinc-500">Growth suggestions</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">8</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileText size={21} />
            </div>

            <p className="text-sm text-zinc-500">Generated posts</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">0</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Star size={21} />
            </div>

            <p className="text-sm text-zinc-500">Review replies</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">0</p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <BarChart3 size={21} />
            </div>

            <p className="text-sm text-zinc-500">Visibility score</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900">42%</p>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-zinc-900">
              Quick business tools
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
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

        <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  Recommended local keywords
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Use these keywords in Google Business Profile and posts.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <MapPin size={22} />
              </div>
            </div>

            <div className="space-y-4">
              {localKeywords.map((keyword, index) => (
                <div
                  key={keyword}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                      {index + 1}
                    </span>

                    <p className="text-sm font-medium text-zinc-700">
                      {keyword}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="text-sm font-semibold text-violet-700"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>

            <Link
              href="/business/local-seo"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700"
            >
              View more keywords
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Lightbulb size={22} />
            </div>

            <h2 className="text-xl font-bold text-zinc-900">
              This week&apos;s growth plan
            </h2>

            <div className="mt-5 space-y-4">
              {weeklyPlan.map((item) => (
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

        <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white">
                <Building2 size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  Complete your business growth setup
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                  Add business photos, working hours, contact details and Google
                  Business information to get better recommendations.
                </p>
              </div>
            </div>

            <Link
              href="/business/settings"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-5 py-3 font-semibold text-violet-700 transition hover:bg-violet-100"
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
