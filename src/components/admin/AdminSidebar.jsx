"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Activity,
  Briefcase,
  PieChart,
  DollarSign,
  Bell,
  FileText,
  Menu,
  X,
  Bot,
  Zap,
} from "lucide-react";

export default function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();

  const navSections = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Analytics", href: "/admin/analytics", icon: PieChart },
        { label: "Revenue", href: "/admin/revenue", icon: DollarSign },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Users", href: "/admin/users", icon: Users },
        { label: "Subscriptions", href: "/admin/subscriptions", icon: Briefcase },
        { label: "AI Analytics", href: "/admin/ai-analytics", icon: Bot },
        { label: "Content", href: "/admin/content", icon: FileText },
        { label: "Reports", href: "/admin/reports", icon: TrendingUp },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Notifications", href: "/admin/notifications", icon: Bell },
        { label: "Audit Logs", href: "/admin/audit-logs", icon: Activity },
        { label: "Admins", href: "/admin/admins", icon: ShieldAlert },
        { label: "System Health", href: "/admin/system-health", icon: Zap },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200 bg-white/70 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-zinc-100">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 text-zinc-900 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <ShieldAlert size={16} />
            </div>
            <div className="font-bold tracking-tight text-lg">Trendora Admin</div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-zinc-500 hover:text-zinc-900"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <h4 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-violet-50 text-violet-700"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={
                            isActive
                              ? "text-violet-700"
                              : "text-zinc-400 group-hover:text-zinc-600"
                          }
                        />
                        {item.label}
                      </div>
                      {isActive && <ChevronRight size={14} className="text-violet-700" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
