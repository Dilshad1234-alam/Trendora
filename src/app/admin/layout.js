"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Activity,
  Briefcase
} from "lucide-react";
import { getCurrentUser, logoutUser } from "@/services/auth.api";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user || user.role !== "admin") {
          router.push("/auth/login");
        } else {
          setUser(user);
        }
      } catch (error) {
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    fetchAuth();
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push("/auth/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Manage Users", href: "/admin/users", icon: Users },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-zinc-900">
        <Activity className="animate-spin text-violet-700" size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-violet-500/30">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-zinc-200 bg-white flex flex-col">
        <div className="p-6">
          <Link href="/admin/dashboard" className="flex items-center gap-3 text-zinc-900 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 shadow-sm border border-violet-200">
              <ShieldAlert size={20} className="text-violet-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Trendora</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-700">Admin Console</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          <div className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
            Management
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-violet-700" : "text-zinc-500 group-hover:text-zinc-700"} />
                  {item.label}
                </div>
                {isActive && <ChevronRight size={14} className="text-violet-700" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-zinc-50 border border-zinc-200 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700 border border-violet-200">
              {user?.fullname?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-semibold text-zinc-900">{user?.fullname}</p>
              <p className="truncate text-xs text-zinc-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-50">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
