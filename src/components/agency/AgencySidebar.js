"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare, Sparkles, Calendar,
  BarChart3, FileText, Settings, UsersRound, DollarSign, FolderOpen,
  Briefcase, Palette, LogOut, ChevronLeft, ChevronRight, Layers
} from "lucide-react";
import { useState } from "react";

const SIDEBAR_LINKS = [
  { group: "Overview", items: [
    { name: "Dashboard", href: "/agency/dashboard", icon: LayoutDashboard },
  ]},
  { group: "Workspace", items: [
    { name: "Clients", href: "/agency/clients", icon: Briefcase },
    { name: "Projects", href: "/agency/projects", icon: FolderKanban },
    { name: "Tasks", href: "/agency/tasks", icon: CheckSquare },
    { name: "Pipeline", href: "/agency/pipeline", icon: Layers },
    { name: "Calendar", href: "/agency/calendar", icon: Calendar },
  ]},
  { group: "Management", items: [
    { name: "Team", href: "/agency/team", icon: UsersRound },
    { name: "Finance", href: "/agency/finance", icon: DollarSign },
    { name: "Files", href: "/agency/files", icon: FolderOpen },
  ]},
  { group: "Tools & Reports", items: [
    { name: "AI Tools", href: "/agency/tools", icon: Sparkles },
    { name: "Reports", href: "/agency/reports", icon: BarChart3 },
    { name: "Bulk Generate", href: "/agency/bulk-generate", icon: FileText },
  ]},
  { group: "Agency", items: [
    { name: "White Label", href: "/agency/branding", icon: Palette },
    { name: "Settings", href: "/agency/settings", icon: Settings },
  ]}
];

export default function AgencySidebar({ user }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-200 bg-white transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-4">
        {!collapsed && (
          <Link href="/agency/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-700 text-white">
              <Users size={18} />
            </div>
            <span className="font-black text-zinc-900">Agency</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 transition ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        {SIDEBAR_LINKS.map((group, idx) => (
          <div key={idx} className="mb-6 px-3">
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                {group.group}
              </p>
            )}
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-violet-50 text-violet-700"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    } ${collapsed ? "justify-center" : "gap-3"}`}
                    title={collapsed ? item.name : ""}
                  >
                    <Icon
                      size={20}
                      className={isActive ? "text-violet-700" : "text-zinc-400 group-hover:text-zinc-600"}
                    />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="border-t border-zinc-100 p-4">
        <Link
          href="/agency/settings"
          className={`flex items-center rounded-xl p-2 transition hover:bg-zinc-50 ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
            {user?.name?.charAt(0) || "A"}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-zinc-900">{user?.name || "Agency Admin"}</p>
              <p className="truncate text-xs font-medium text-zinc-500 capitalize">{user?.plan || "Agency"} Plan</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
