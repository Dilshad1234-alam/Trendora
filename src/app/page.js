import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Building2,
  Check,
  FileText,
  Flame,
  Hash,
  ImageIcon,
  Lightbulb,
  MessageSquareText,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";

const creatorTools = [
  {
    title: "Hook Generator",
    description: "Create attention-grabbing hooks for reels and short videos.",
    icon: Flame,
  },
  {
    title: "Script Generator",
    description: "Generate ready-to-record scripts based on your niche.",
    icon: FileText,
  },
  {
    title: "Caption Generator",
    description: "Write engaging captions with strong calls to action.",
    icon: MessageSquareText,
  },
  {
    title: "Hashtag Generator",
    description: "Find broad, niche and relevant hashtags for your content.",
    icon: Hash,
  },
  {
    title: "Thumbnail Titles",
    description: "Generate short and clickable thumbnail title ideas.",
    icon: ImageIcon,
  },
  {
    title: "Video Description",
    description: "Create SEO-friendly descriptions, keywords and hashtags.",
    icon: Search,
  },
];

const businessTools = [
  {
    title: "Business Post Generator",
    description: "Create promotional and educational social media posts.",
    icon: FileText,
  },
  {
    title: "Business Caption Generator",
    description: "Generate captions designed for local business growth.",
    icon: MessageSquareText,
  },
  {
    title: "Local SEO",
    description: "Discover location-based keywords for better visibility.",
    icon: Search,
  },
  {
    title: "Review Reply",
    description: "Create professional responses to customer reviews.",
    icon: Star,
  },
  {
    title: "Growth Plan",
    description: "Get personalized daily and weekly marketing actions.",
    icon: TrendingUp,
  },
  {
    title: "Saved Library",
    description: "Save, search and reuse your best AI-generated content.",
    icon: Bookmark,
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Register securely and choose whether you are a creator or business.",
  },
  {
    number: "02",
    title: "Complete your profile",
    description:
      "Tell Trendora about your niche, platform, audience or business.",
  },
  {
    number: "03",
    title: "Generate with AI",
    description:
      "Create hooks, scripts, captions, posts and marketing content.",
  },
  {
    number: "04",
    title: "Save and grow",
    description:
      "Save your best content and follow personalized daily action plans.",
  },
];

const benefits = [
  "Personalized results based on your profile",
  "Creator and business workspaces",
  "Daily AI-powered content plans",
  "Copy and save generated content",
  "Mobile-friendly responsive design",
  "Fast and simple content workflow",
];

export default function HomePage() {
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

          <div className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex">
            <Link
              href="#features"
              className="transition hover:text-violet-700"
            >
              Features
            </Link>

            <Link
              href="#creators"
              className="transition hover:text-violet-700"
            >
              Creators
            </Link>

            <Link
              href="#business"
              className="transition hover:text-violet-700"
            >
              Business
            </Link>

            <Link
              href="#how-it-works"
              className="transition hover:text-violet-700"
            >
              How it works
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-800"
            >
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
        <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
            <WandSparkles size={17} />
            AI-powered growth workspace
          </div>

          <h1 className="mx-auto mt-7 max-w-5xl text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
            Create better content.
            <span className="block bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Grow faster with AI.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-zinc-600 sm:text-lg">
            Trendora helps creators and local businesses generate personalized
            hooks, scripts, captions, posts, hashtags, thumbnail titles and
            daily growth plans—all from one intelligent workspace.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-semibold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800 sm:w-auto"
            >
              Start creating for free
              <ArrowRight size={18} />
            </Link>

            <Link
              href="#features"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3.5 font-semibold text-zinc-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 sm:w-auto"
            >
              Explore features
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              No credit card required
            </span>

            <span className="flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              Personalized AI results
            </span>

            <span className="flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              Creator and business tools
            </span>
          </div>

          {/* Dashboard preview */}
          <div className="mx-auto mt-16 max-w-6xl rounded-[2rem] border border-zinc-200 bg-white p-3 shadow-2xl shadow-violet-200/50 sm:p-5">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-[#f7f7fb]">
              <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>

                <div className="rounded-lg bg-zinc-100 px-5 py-2 text-xs text-zinc-500">
                  trendora.app/dashboard
                </div>

                <div className="w-14" />
              </div>

              <div className="grid gap-5 p-5 text-left md:grid-cols-[220px_1fr] sm:p-7">
                <aside className="hidden rounded-2xl bg-zinc-950 p-5 text-white md:block">
                  <div className="flex items-center gap-2 font-bold">
                    <Sparkles size={18} />
                    Trendora
                  </div>

                  <div className="mt-8 space-y-3 text-sm">
                    {[
                      "Dashboard",
                      "AI Generators",
                      "Daily Plan",
                      "Saved Content",
                      "Analytics",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-xl px-3 py-2.5 ${
                          index === 0
                            ? "bg-violet-700 text-white"
                            : "text-zinc-400"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </aside>

                <div>
                  <div className="rounded-2xl bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-600 p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-widest text-violet-200">
                      Today&apos;s AI plan
                    </p>

                    <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                      Create one useful short video for your audience
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100">
                      Start with a strong hook, share one clear idea and finish
                      with a direct call to action.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        label: "Saved Hooks",
                        value: "18",
                        icon: Flame,
                      },
                      {
                        label: "Scripts",
                        value: "12",
                        icon: FileText,
                      },
                      {
                        label: "Captions",
                        value: "24",
                        icon: MessageSquareText,
                      },
                      {
                        label: "Growth Score",
                        value: "82%",
                        icon: BarChart3,
                      },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-zinc-200 bg-white p-4"
                        >
                          <Icon size={19} className="text-violet-700" />

                          <p className="mt-4 text-xs text-zinc-500">
                            {item.label}
                          </p>

                          <p className="mt-1 text-xl font-bold text-zinc-900">
                            {item.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main features */}
      <section
        id="features"
        className="border-y border-zinc-200 bg-zinc-50 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Everything in one place
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              From idea to published content
            </h2>

            <p className="mt-5 text-base leading-7 text-zinc-600">
              Trendora personalizes every result using your niche, platform,
              tone, audience and growth goals.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Personalized AI",
                description:
                  "Results are generated using your creator or business profile.",
                icon: Sparkles,
              },
              {
                title: "Daily Growth Plans",
                description:
                  "Receive practical content and marketing actions every day.",
                icon: TrendingUp,
              },
              {
                title: "Complete Content Workflow",
                description:
                  "Generate hooks, scripts, captions, hashtags and descriptions.",
                icon: Zap,
              },
              {
                title: "Saved Content Library",
                description:
                  "Save, search, copy and reuse your best generated content.",
                icon: Bookmark,
              },
              {
                title: "Creator Workspace",
                description:
                  "Tools designed for reels, short videos and personal brands.",
                icon: Users,
              },
              {
                title: "Business Workspace",
                description:
                  "Create posts, improve local SEO and reply to reviews.",
                icon: Building2,
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-zinc-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-zinc-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Creator section */}
      <section id="creators" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
                <Users size={17} />
                Built for creators
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                Create consistently without staring at a blank screen
              </h2>

              <p className="mt-5 text-base leading-8 text-zinc-600">
                Trendora learns about your niche, audience, tone and platform
                to create content that fits your personal brand.
              </p>

              <Link
                href="/register"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white transition hover:bg-violet-800"
              >
                Start as a creator
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {creatorTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <article
                    key={tool.title}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                      <Icon size={20} />
                    </div>

                    <h3 className="mt-4 font-bold text-zinc-900">
                      {tool.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {tool.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Business section */}
      <section id="business" className="bg-zinc-950 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {businessTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <article
                    key={tool.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                      <Icon size={20} />
                    </div>

                    <h3 className="mt-4 font-bold text-white">
                      {tool.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {tool.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-300">
                <Building2 size={17} />
                Built for local businesses
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                Turn your business information into marketing content
              </h2>

              <p className="mt-5 text-base leading-8 text-zinc-400">
                Create posts, captions, local keywords and customer replies
                using your services, city and target audience.
              </p>

              <Link
                href="/register"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-zinc-950 transition hover:bg-violet-100"
              >
                Start as a business
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Simple workflow
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Start creating in four steps
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="relative rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <span className="text-5xl font-black text-violet-100">
                  {step.number}
                </span>

                <h3 className="mt-4 text-lg font-bold text-zinc-900">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-violet-50 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-700">
              Why Trendora
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Spend less time planning and more time growing
            </h2>

            <p className="mt-5 text-base leading-8 text-zinc-600">
              Trendora combines content creation, organization and daily
              guidance in one easy-to-use AI workspace.
            </p>
          </div>

          <div className="rounded-3xl border border-violet-200 bg-white p-6 shadow-xl shadow-violet-100 sm:p-8">
            <div className="space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={15} />
                  </span>

                  <p className="text-sm font-medium leading-6 text-zinc-700 sm:text-base">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-600 px-6 py-14 text-center text-white shadow-2xl shadow-violet-200 sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles size={27} />
          </div>

          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-black sm:text-5xl">
            Your next great content idea starts here
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-violet-100">
            Join Trendora and turn your ideas, business goals and audience
            insights into ready-to-use content.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              Create free account
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white transition hover:bg-white/15"
            >
              Login to Trendora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/ChatGPT image jul 15, 2026, 12_11_21 PM.png"
                alt="Trendora Logo"
                width={240}
                height={70}
                priority
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-400">
              AI-powered content and growth workspace for creators and local
              businesses.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Product</h3>

            <div className="mt-4 space-y-3 text-sm text-zinc-400">
              <Link href="#features" className="block hover:text-white">
                Features
              </Link>
              <Link href="#creators" className="block hover:text-white">
                Creator tools
              </Link>
              <Link href="#business" className="block hover:text-white">
                Business tools
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Account</h3>

            <div className="mt-4 space-y-3 text-sm text-zinc-400">
              <Link href="/register" className="block hover:text-white">
                Create account
              </Link>
              <Link href="/login" className="block hover:text-white">
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Trendora. All rights reserved.
        </div>
      </footer>
    </main>
  );
}