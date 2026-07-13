"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Copy,
  LoaderCircle,
  Search,
  Trash2,
} from "lucide-react";

import {
  deleteSavedContent,
  getSavedContents,
} from "@/services/saved.api";

const filters = [
  { label: "All", value: "all" },
  { label: "Hooks", value: "hook" },
  { label: "Scripts", value: "script" },
  { label: "Captions", value: "caption" },
  { label: "Hashtags", value: "hashtag" },
  { label: "Thumbnail Titles", value: "thumbnail-title" },
  { label: "Weekly Plans", value: "weekly-plan" },
];

export default function SavedContentPage() {
  const [items, setItems] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [message, setMessage] = useState("");

  const loadSavedContents = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getSavedContents({
        type: selectedType,
        search,
      });

      setItems(data.data || []);
    } catch (error) {
      setMessage(error.message || "Unable to load saved content.");
    } finally {
      setLoading(false);
    }
  }, [selectedType, search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadSavedContents();
    }, 350);

    return () => clearTimeout(timeout);
  }, [loadSavedContents]);

  const handleCopy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopiedId(item.id);

      setTimeout(() => {
        setCopiedId("");
      }, 1500);
    } catch {
      setMessage("Unable to copy content.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this saved content?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setMessage("");

      await deleteSavedContent(id);

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== id)
      );
    } catch (error) {
      setMessage(error.message || "Unable to delete content.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="min-h-screen bg-[#030014] text-white p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] left-[35%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Background Dots Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <Link
          href="/creator/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Bookmark size={22} className="animate-pulse" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Saved Library
          </p>

          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Your Saved <span className="bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">Content</span>
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Search, copy and reuse your generated hooks, scripts and captions.
          </p>
        </div>

        {/* Filter and Search Section */}
        <section className="mb-6 rounded-2xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setSelectedType(filter.value)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                    selectedType === filter.value
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                      : "bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search saved content..."
                className="w-full rounded-xl border border-white/10 bg-[#120f2e]/55 py-3 pl-11 pr-4 text-white outline-none placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
              />
            </div>
          </div>
        </section>

        {message && (
          <div className="mb-6 rounded-xl border p-4 text-sm flex items-start gap-3 backdrop-blur-md transition-all duration-300 border-red-500/25 bg-red-500/10 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <div className="p-1 rounded-md shrink-0 bg-red-500/20">
              <span className="text-red-400 font-bold block leading-none w-4 h-4 text-center">!</span>
            </div>
            <div>{message}</div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">
            <div className="flex items-center gap-3 text-violet-400">
              <LoaderCircle className="animate-spin" size={24} />
              <span className="font-medium text-zinc-300">Loading saved content...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.01] px-6 text-center">
            <Bookmark size={34} className="mb-4 text-zinc-600 animate-pulse" />

            <h2 className="text-lg font-bold text-zinc-300">
              No saved content found
            </h2>

            <p className="mt-2 max-w-md text-xs leading-relaxed text-zinc-500">
              Generate a hook, script or caption and press Save to add it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-white/10 bg-[#0a0520]/40 backdrop-blur-2xl p-6 shadow-sm hover:border-violet-500/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-[10px] font-semibold uppercase text-violet-400 tracking-wider">
                        {item.type}
                      </span>

                      <h2 className="mt-3 text-lg font-bold text-white leading-tight">
                        {item.title}
                      </h2>

                      <p className="mt-1 text-[11px] text-zinc-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(item)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-colors cursor-pointer"
                        aria-label="Copy saved content"
                      >
                        <Copy size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                        aria-label="Delete saved content"
                      >
                        {deletingId === item.id ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-[#120f2e]/35 border border-white/5 p-4 text-sm leading-relaxed text-zinc-300">
                    {item.content}
                  </div>
                </div>

                {copiedId === item.id && (
                  <p className="mt-3 text-xs font-semibold text-emerald-400">
                    Copied to clipboard.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}