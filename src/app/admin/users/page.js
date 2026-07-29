"use client";

import { useEffect, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import UserDrawer from "@/components/admin/UserDrawer";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?page=${page}&limit=${pagination.limit}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
        setPagination(json.pagination);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRowClick = async (row) => {
    try {
      const res = await fetch(`/api/admin/users/${row._id}`);
      const json = await res.json();
      if (json.success) {
        setSelectedUser(json.data.user);
        setIsDrawerOpen(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      key: "fullname",
      label: "User",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700 uppercase">
            {row.fullname?.charAt(0) || "U"}
          </div>
          <div>
            <p className="font-semibold text-zinc-900">{row.fullname}</p>
            <p className="text-xs text-zinc-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "workspace",
      label: "Workspace",
      sortable: true,
      render: (row) => (
        <span className="capitalize px-2.5 py-1 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">
          {row.workspace || "None"}
        </span>
      ),
    },
    {
      key: "plan",
      label: "Plan",
      sortable: true,
      render: (row) => (
        <span className={`capitalize px-2.5 py-1 rounded-full text-xs font-semibold ${
          row.plan === "free" ? "bg-zinc-100 text-zinc-700" :
          row.plan === "agency" ? "bg-amber-100 text-amber-700" :
          "bg-violet-100 text-violet-700"
        }`}>
          {row.plan || "Free"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        if (row.suspended) {
          return <span className="text-red-600 bg-red-50 px-2 py-1 rounded font-medium text-xs">Suspended</span>;
        }
        if (row.trialExpired) {
          return <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded font-medium text-xs">Trial Expired</span>;
        }
        return <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-medium text-xs">Active</span>;
      },
    },
    {
      key: "createdAt",
      label: "Joined",
      sortable: true,
      render: (row) => (
        <span className="text-zinc-500">
          {row.createdAt ? format(new Date(row.createdAt), "MMM d, yyyy") : "N/A"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Manage Users</h1>
          <p className="text-zinc-500 mt-1">View and manage all registered users.</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={users} 
        loading={loading} 
        onRowClick={handleRowClick}
        pagination={pagination}
        onPageChange={(page) => fetchUsers(page)}
      />

      <UserDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        user={selectedUser} 
      />
    </div>
  );
}
