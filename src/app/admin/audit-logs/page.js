"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import { format } from "date-fns";
import { Shield, Activity, UserCog, Settings, CreditCard, UserX } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/audit-logs?page=${page}&limit=${pagination.limit}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionInfo = (action) => {
    switch (action) {
      case "login": return { icon: Activity, color: "text-blue-600 bg-blue-50 border-blue-100", label: "Login" };
      case "plan_update": return { icon: CreditCard, color: "text-violet-600 bg-violet-50 border-violet-100", label: "Plan Update" };
      case "user_suspended": return { icon: UserX, color: "text-red-600 bg-red-50 border-red-100", label: "User Suspended" };
      case "settings_changed": return { icon: Settings, color: "text-amber-600 bg-amber-50 border-amber-100", label: "Settings Changed" };
      default: return { icon: Shield, color: "text-zinc-600 bg-zinc-50 border-zinc-200", label: action.replace("_", " ") };
    }
  };

  const columns = [
    {
      key: "action",
      label: "Action",
      render: (row) => {
        const info = getActionInfo(row.action);
        const Icon = info.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${info.color}`}>
              <Icon size={16} />
            </div>
            <span className="font-medium text-zinc-900 capitalize">{info.label}</span>
          </div>
        );
      },
    },
    {
      key: "adminId",
      label: "Performed By",
      render: (row) => (
        <span className="text-zinc-600 font-medium">
          {row.adminId?.fullname || "System"}
        </span>
      ),
    },
    {
      key: "details",
      label: "Details",
      render: (row) => (
        <span className="text-zinc-500 text-sm truncate max-w-xs block" title={row.details}>
          {row.details}
        </span>
      ),
    },
    {
      key: "targetUserId",
      label: "Target User",
      render: (row) => (
        <span className="text-zinc-500 text-sm">
          {row.targetUserId?.email || "-"}
        </span>
      ),
    },
    {
      key: "ipAddress",
      label: "IP Address",
      render: (row) => <span className="text-zinc-400 font-mono text-xs">{row.ipAddress || "-"}</span>,
    },
    {
      key: "createdAt",
      label: "Timestamp",
      render: (row) => <span className="text-zinc-500 text-sm whitespace-nowrap">{format(new Date(row.createdAt), "MMM d, yyyy HH:mm:ss")}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Audit Logs</h1>
          <p className="text-zinc-500 mt-1">Track admin actions and system events.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={logs} 
        loading={loading} 
        pagination={pagination}
        onPageChange={(page) => fetchLogs(page)}
        searchPlaceholder="Search logs..."
      />
    </div>
  );
}
