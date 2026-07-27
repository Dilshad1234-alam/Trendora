"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleDashed, Clock, FileText, Filter, MoreVertical, Plus, Settings2, Sparkles, Building2 } from "lucide-react";

export default function AgencyPipelinePage() {
  const [stages, setStages] = useState([
    {
      id: "ideation",
      title: "Ideation",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      items: [
        { id: 1, title: "10 Summer Post Ideas", client: "Acme Corp", type: "Social Post", date: "Today" },
        { id: 2, title: "Q3 Ad Copy Options", client: "TechFlow", type: "Ad Copy", date: "Yesterday" }
      ]
    },
    {
      id: "drafted",
      title: "Drafted",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      items: [
        { id: 3, title: "Product Launch Video Script", client: "Acme Corp", type: "Video Script", date: "2 days ago" }
      ]
    },
    {
      id: "review",
      title: "Client Review",
      color: "bg-violet-100 text-violet-700 border-violet-200",
      items: [
        { id: 4, title: "Weekly Newsletter Outline", client: "TechFlow", type: "Email", date: "Today" },
        { id: 5, title: "SEO Blog Post - AI Trends", client: "Acme Corp", type: "Blog", date: "3 days ago" }
      ]
    },
    {
      id: "approved",
      title: "Approved",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      items: [
        { id: 6, title: "May Content Calendar", client: "TechFlow", type: "Bulk Post", date: "Just now" }
      ]
    }
  ]);

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/agency/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-2">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-lg shadow-violet-200">
                <Sparkles size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-950">
                  Content Approval Pipeline
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  Drag and drop AI-generated content through your agency workflow.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 shadow-sm">
              <Filter size={16} /> Filter by Client
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800">
              <Plus size={16} /> New Draft
            </button>
          </div>
        </header>

        {/* Kanban Board */}
        <div className="flex items-start gap-6 overflow-x-auto pb-8 snap-x">
          {stages.map((stage) => (
            <div key={stage.id} className="min-w-[320px] w-[320px] shrink-0 snap-start">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${stage.color}`}>
                    {stage.title}
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600">
                    {stage.items.length}
                  </span>
                </div>
                <button className="text-zinc-400 hover:text-zinc-600">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-3 min-h-[500px] rounded-3xl bg-zinc-100/50 p-3 border border-zinc-200/50">
                {stage.items.map((item) => (
                  <div key={item.id} className="group cursor-grab rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-violet-300 hover:shadow-md active:cursor-grabbing">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <span className="inline-flex rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                        {item.type}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 transition">
                        <Settings2 size={14} />
                      </button>
                    </div>
                    
                    <h4 className="font-bold text-zinc-900 line-clamp-2 leading-tight">
                      {item.title}
                    </h4>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                        <Building2 size={12} className="text-violet-500" /> {item.client}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                        <Clock size={10} /> {item.date}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 py-3 text-sm font-semibold text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-700 transition">
                  <Plus size={16} /> Add Card
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
