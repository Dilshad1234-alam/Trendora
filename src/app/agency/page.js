import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Briefcase,
  Users,
  Settings,
  Calendar,
  BarChart3,
  Layers,
  Sparkles,
} from "lucide-react";

const agencyTools = [
  {
    title: "Unlimited Clients",
    description: "Manage unlimited creator and business clients from one dashboard.",
    icon: Users,
  },
  {
    title: "Client Pipeline",
    description: "Organize clients efficiently with a visual pipeline and status tracking.",
    icon: Layers,
  },
  {
    title: "Team Members",
    description: "Invite your team members to collaborate and assign tasks.",
    icon: Users,
  },
  {
    title: "White Label Reports",
    description: "Generate beautiful, branded PDF reports for your clients in one click.",
    icon: BarChart3,
  },
  {
    title: "Content Calendar",
    description: "Plan and schedule content for all clients in a centralized calendar.",
    icon: Calendar,
  },
  {
    title: "Bulk AI Generator",
    description: "Generate 10+ posts or scripts in seconds for multiple clients.",
    icon: Settings,
  },
];

export default function AgencyLandingPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 scroll-smooth">
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

          <div className="hidden items-center gap-6 text-sm font-medium text-zinc-600 lg:flex">
            <Link href="/" className="transition hover:text-violet-700">Home</Link>
            <Link href="/creator" className="transition hover:text-violet-700">Creator</Link>
            <Link href="/business" className="transition hover:text-violet-700">Business</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              Login
            </Link>

            <Link
              href="/register?workspace=agency"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-800"
            >
              Start Free
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white">
        <div className="absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-300/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm">
            <Briefcase size={17} />
            Agency Workspace
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-black tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
            Manage 100+ clients
            <span className="block bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              from a single dashboard
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
            Stop juggling separate tools. Organise clients, collaborate with team members, generate bulk content, and download branded reports in seconds.
          </p>

          <div className="mt-9 flex justify-center">
            <Link
              href="/register?workspace=agency"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-8 py-4 font-semibold text-white shadow-xl shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800 sm:w-auto"
            >
              Start Free Trial
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="bg-zinc-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Everything an agency needs
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agencyTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <article
                  key={tool.title}
                  className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:shadow-violet-100"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-zinc-950">
                    {tool.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                    {tool.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8 bg-white">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-600 px-6 py-14 text-center text-white shadow-2xl shadow-violet-200 sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles size={27} />
          </div>

          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-black sm:text-4xl">
            Ready to scale your agency?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-violet-100">
            Sign up for free and experience the ultimate AI-powered workspace for agencies.
          </p>
          <div className="mt-10">
            <Link
              href="/register?workspace=agency"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-violet-700 transition hover:bg-violet-50"
            >
              Create Free Account
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/Trendora_Landing_Logo.png"
                alt="Trendora Logo"
                width={240}
                height={70}
                priority
                className="h-14 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-4 mx-auto max-w-sm text-sm leading-7 text-zinc-400">
              AI-powered content and growth workspace for creators, businesses and agencies.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Trendora. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
