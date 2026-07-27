"use client";

import { useEffect, useState } from "react";
import { 
  Search,
  MoreVertical,
  ShieldAlert,
  Edit2,
  Trash2,
  Activity,
  AlertTriangle,
  X
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  
  // Modals
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const fetchUsers = async (searchQuery = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUsers(data.users);
      } else {
        setError(data.error || "Failed to load users");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editUser._id,
          role: editUser.role,
          plan: editUser.plan
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUsers(users.map(u => u._id === editUser._id ? data.user : u));
        setEditUser(null);
      } else {
        alert(data.error || "Failed to update user");
      }
    } catch (err) {
      alert("Error updating user");
    }
  };

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/admin/users?userId=${deleteUser._id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUsers(users.filter(u => u._id !== deleteUser._id));
        setDeleteUser(null);
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      alert("Error deleting user");
    }
  };

  return (
    <div className="p-8 font-sans">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Manage Users</h1>
          <p className="mt-1 text-zinc-600">View, edit, or delete platform users.</p>
        </div>
        
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-sm"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-medium">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Plan</th>
                <th className="px-6 py-4 font-bold">Joined</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="h-32 text-center">
                    <Activity className="mx-auto animate-spin text-violet-700" size={24} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="h-32 text-center font-medium text-zinc-500">
                    No users found matching "{search}"
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="transition-colors hover:bg-zinc-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-900">{user.fullname}</div>
                      <div className="text-xs text-zinc-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-xs font-bold text-zinc-700">
                        {user.role || "None"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        user.plan === "agency" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                        user.plan?.includes("pro") ? "bg-violet-100 text-violet-700 border border-violet-200" :
                        "bg-zinc-100 text-zinc-700 border border-zinc-200"
                      }`}>
                        {user.plan || "free"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditUser(user)}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteUser(user)}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Edit User</h2>
              <button onClick={() => setEditUser(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-700">Role</label>
                <select 
                  value={editUser.role || ""} 
                  onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="creator">Creator</option>
                  <option value="business">Business</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-700">Plan</label>
                <select 
                  value={editUser.plan || "free"} 
                  onChange={(e) => setEditUser({...editUser, plan: e.target.value})}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="free">Free</option>
                  <option value="creator-pro">Creator Pro</option>
                  <option value="business-pro">Business Pro</option>
                  <option value="agency">Agency</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditUser(null)}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 font-bold text-zinc-700 hover:bg-zinc-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 rounded-xl bg-violet-700 px-4 py-3 font-bold text-white hover:bg-violet-800 shadow-md shadow-violet-200 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-red-200 bg-white p-6 shadow-2xl text-center">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-red-50 p-4 border border-red-100 text-red-600">
                <AlertTriangle size={32} />
              </div>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Delete User?</h2>
            <p className="text-sm text-zinc-500 mb-6 px-2">
              Are you sure you want to permanently delete <strong className="text-zinc-900">{deleteUser.email}</strong>? All their saved content will be lost. This cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteUser(null)}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 font-bold text-zinc-700 hover:bg-zinc-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-bold text-white hover:bg-red-700 shadow-md shadow-red-200 transition"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
