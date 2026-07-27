"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, CheckSquare, LoaderCircle, Plus, 
  Search, Filter, Calendar, Clock, LayoutGrid, List as ListIcon, X, User, Building2, AlertCircle
} from "lucide-react";
import { 
  getAgencyTasks, 
  createAgencyTask, 
  updateAgencyTask,
  deleteAgencyTask,
  getAgencyClients,
  getAgencyTeam
} from "@/services/agency-tools.api";

export default function AgencyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // View state
  const [viewMode, setViewMode] = useState("board"); // 'board' or 'list'
  
  // Filters
  const [filters, setFilters] = useState({
    clientId: "",
    assignedTo: "",
    status: "",
    priority: "",
    search: ""
  });
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientId: "",
    assignedTo: "",
    priority: "medium",
    dueDate: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [tasksRes, clientsRes, teamRes] = await Promise.all([
        getAgencyTasks(filters),
        getAgencyClients({ limit: 100 }),
        getAgencyTeam()
      ]);
      
      setTasks(tasksRes.data || []);
      setClients(clientsRes.data?.clients || (Array.isArray(clientsRes.data) ? clientsRes.data : []));
      setTeam(teamRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.clientId, filters.assignedTo, filters.status, filters.priority]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      await createAgencyTask(formData);
      await fetchData();
      setShowAddModal(false);
      setFormData({ title: "", description: "", clientId: "", assignedTo: "", priority: "medium", dueDate: "" });
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      setProcessing(true);
      
      // Optimistic Update
      const oldTasks = [...tasks];
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      
      await updateAgencyTask(taskId, { status: newStatus });
      await fetchData();
    } catch (err) {
      alert(err.message);
      fetchData(); // rollback
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      setProcessing(true);
      await deleteAgencyTask(taskId);
      await fetchData();
      setShowDetailModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      handleUpdateStatus(taskId, newStatus);
    }
  };

  // Group tasks for Kanban
  const stages = [
    { id: "todo", title: "To Do", color: "bg-zinc-100 border-zinc-200 text-zinc-800" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-50 border-blue-200 text-blue-800" },
    { id: "review", title: "Review", color: "bg-amber-50 border-amber-200 text-amber-800" },
    { id: "completed", title: "Completed", color: "bg-emerald-50 border-emerald-200 text-emerald-800" }
  ];

  const getPriorityColor = (p) => {
    switch(p) {
      case "urgent": return "bg-red-100 text-red-700";
      case "high": return "bg-orange-100 text-orange-700";
      case "medium": return "bg-blue-100 text-blue-700";
      default: return "bg-zinc-100 text-zinc-700";
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === "completed" || !dueDate) return false;
    return new Date(dueDate) < new Date(new Date().setHours(0,0,0,0));
  };

  if (loading && tasks.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans text-zinc-900">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle size={24} className="animate-spin" />
          <span className="font-medium">Loading tasks...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-12">
      <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/agency/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-3">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-lg shadow-violet-200">
                <CheckSquare size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-950">
                  Task Management
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  Track deliverables, assign workflows, and meet deadlines.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl bg-white p-1 border border-zinc-200 shadow-sm">
              <button 
                onClick={() => setViewMode("board")} 
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${viewMode === "board" ? "bg-violet-100 text-violet-700" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                <LayoutGrid size={16} /> Board
              </button>
              <button 
                onClick={() => setViewMode("list")} 
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${viewMode === "list" ? "bg-violet-100 text-violet-700" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                <ListIcon size={16} /> List
              </button>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800"
            >
              <Plus size={18} /> New Task
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
          <form onSubmit={handleSearch} className="relative grow max-w-sm">
            <input 
              type="text" 
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-500 focus:bg-white"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-violet-600">
              <Search size={16} />
            </button>
          </form>

          <select 
            value={filters.clientId}
            onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
            className="rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-3 pr-8 text-sm font-semibold text-zinc-700 outline-none focus:border-violet-500 focus:bg-white appearance-none cursor-pointer hover:bg-zinc-100 transition"
          >
            <option value="">All Clients</option>
            {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select 
            value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
            className="rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-3 pr-8 text-sm font-semibold text-zinc-700 outline-none focus:border-violet-500 focus:bg-white appearance-none cursor-pointer hover:bg-zinc-100 transition"
          >
            <option value="">All Assignees</option>
            {team.map(t => <option key={t._id} value={t._id}>{t.memberName}</option>)}
          </select>
          
          <select 
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-3 pr-8 text-sm font-semibold text-zinc-700 outline-none focus:border-violet-500 focus:bg-white appearance-none cursor-pointer hover:bg-zinc-100 transition"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Board View */}
        {viewMode === "board" && (
          <div className="flex items-start gap-5 overflow-x-auto pb-4 snap-x custom-scrollbar">
            {stages.map((stage) => {
              const stageTasks = tasks.filter(t => t.status === stage.id);
              return (
                <div 
                  key={stage.id} 
                  className="min-w-[320px] w-[320px] shrink-0 snap-start flex flex-col h-[calc(100vh-280px)]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className={`mb-3 flex items-center justify-between rounded-xl border px-4 py-3 ${stage.color}`}>
                    <h3 className="font-bold text-sm uppercase tracking-wider">{stage.title}</h3>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/50 text-xs font-bold shadow-sm">
                      {stageTasks.length}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar p-1">
                    {stageTasks.map(task => (
                      <div 
                        key={task._id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id)}
                        onClick={() => { setSelectedTask(task); setShowDetailModal(true); }}
                        className={`group cursor-pointer rounded-2xl border bg-white p-4 shadow-sm transition-all hover:border-violet-300 hover:shadow-md active:cursor-grabbing hover:-translate-y-0.5 ${isOverdue(task.dueDate, task.status) ? 'border-red-300 border-l-4' : 'border-zinc-200'}`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {isOverdue(task.dueDate, task.status) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase">
                              <AlertCircle size={10} /> Overdue
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-zinc-900 line-clamp-2 leading-snug mb-2">{task.title}</h4>
                        
                        <div className="flex flex-col gap-2 mt-4">
                          {task.clientId && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                              <Building2 size={12} className="text-violet-500" /> <span className="truncate">{task.clientId.name || task.clientId.businessName}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs font-medium border-t border-zinc-100 pt-3">
                            <div className="flex items-center gap-1.5 text-zinc-500">
                              <Clock size={12} className={isOverdue(task.dueDate, task.status) ? "text-red-500" : ""} /> 
                              <span className={isOverdue(task.dueDate, task.status) ? "text-red-600" : ""}>
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
                              </span>
                            </div>
                            {task.assignedTo && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700" title={task.assignedTo.memberName}>
                                {task.assignedTo.memberName.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-6 py-4">Task Name</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {tasks.length === 0 && (
                    <tr><td colSpan="6" className="py-8 text-center text-zinc-500">No tasks found.</td></tr>
                  )}
                  {tasks.map(task => (
                    <tr key={task._id} onClick={() => { setSelectedTask(task); setShowDetailModal(true); }} className="hover:bg-zinc-50 cursor-pointer transition">
                      <td className="px-6 py-4 font-bold text-zinc-900">
                        <div className="flex items-center gap-2">
                          {isOverdue(task.dueDate, task.status) && <AlertCircle size={14} className="text-red-500" />}
                          <span className="line-clamp-1">{task.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{task.clientId?.name || task.clientId?.businessName || "-"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-600 border border-zinc-200">
                          {task.status.replace("-", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-medium ${isOverdue(task.dueDate, task.status) ? "text-red-600" : ""}`}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 font-medium">{task.assignedTo?.memberName || "Unassigned"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Create New Task</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Title <span className="text-red-500">*</span></label>
                <input required name="title" value={formData.title} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white" placeholder="e.g. Write Instagram captions for June" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white resize-none" placeholder="Task details..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Client</label>
                  <select name="clientId" value={formData.clientId} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white appearance-none">
                    <option value="">No Client</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Assign To</label>
                  <select name="assignedTo" value={formData.assignedTo} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white appearance-none">
                    <option value="">Unassigned</option>
                    {team.map(t => <option key={t._id} value={t._id}>{t.memberName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white appearance-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Due Date</label>
                  <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:bg-white" />
                </div>
              </div>
              
              <div className="mt-6 flex gap-3 pt-4 border-t border-zinc-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 rounded-xl bg-zinc-100 py-3 font-semibold text-zinc-700 hover:bg-zinc-200 transition">Cancel</button>
                <button type="submit" disabled={processing} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 py-3 font-semibold text-white hover:bg-violet-800 transition disabled:opacity-50">
                  {processing ? <LoaderCircle size={18} className="animate-spin" /> : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                 <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(selectedTask.priority)}`}>
                   {selectedTask.priority}
                 </span>
                 <span className="inline-flex rounded-full bg-zinc-200 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-zinc-600">
                   {selectedTask.status.replace("-", " ")}
                 </span>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">{selectedTask.title}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Due Date</p>
                  <p className={`font-semibold text-sm ${isOverdue(selectedTask.dueDate, selectedTask.status) ? "text-red-600" : "text-zinc-800"}`}>
                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "None"}
                    {isOverdue(selectedTask.dueDate, selectedTask.status) && " (Overdue)"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Assignee</p>
                  <p className="font-semibold text-sm text-zinc-800 flex items-center gap-1.5">
                    <User size={14} className="text-violet-500" /> {selectedTask.assignedTo?.memberName || "Unassigned"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Client</p>
                  <p className="font-semibold text-sm text-zinc-800 flex items-center gap-1.5">
                    <Building2 size={14} className="text-violet-500" /> {selectedTask.clientId?.name || "None"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Description</p>
                <div className="text-sm text-zinc-700 whitespace-pre-wrap bg-zinc-50 p-4 rounded-xl border border-zinc-100 min-h-24">
                  {selectedTask.description || <span className="italic text-zinc-400">No description provided.</span>}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 rounded-b-3xl flex items-center justify-between">
              <button 
                onClick={() => handleDelete(selectedTask._id)}
                disabled={processing}
                className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
              >
                Delete Task
              </button>

              <div className="flex gap-2">
                {selectedTask.status !== "completed" && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedTask._id, "completed")}
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <CheckSquare size={16} /> Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
