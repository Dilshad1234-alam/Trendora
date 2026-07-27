"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Calendar as CalendarIcon, LoaderCircle, Filter, 
  ChevronLeft, ChevronRight, LayoutGrid, LayoutList, CheckSquare, Clock, X, AlertCircle, Building2
} from "lucide-react";
import { 
  getAgencyCalendar, 
  scheduleAgencyContent, 
  updateAgencyCalendarContent,
  getAgencyClients
} from "@/services/agency-tools.api";

export default function AgencyCalendarPage() {
  const [data, setData] = useState({ scheduled: [], unscheduled: [] });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  
  // Views
  const [viewMode, setViewMode] = useState("month"); // 'month' or 'week'
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Filters
  const [filters, setFilters] = useState({
    clientId: "",
    clientType: "",
    platform: "",
    status: ""
  });
  
  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [calendarRes, clientsRes] = await Promise.all([
        getAgencyCalendar(filters),
        getAgencyClients({ limit: 100 })
      ]);
      
      setData(calendarRes.data || { scheduled: [], unscheduled: [] });
      setClients(clientsRes.data?.clients || (Array.isArray(clientsRes.data) ? clientsRes.data : []));
    } catch (err) {
      setError(err.message || "Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleDragStart = (e, contentId, source) => {
    e.dataTransfer.setData("contentId", contentId);
    e.dataTransfer.setData("source", source); // 'queue' or 'calendar'
  };

  const handleDrop = async (e, dateString) => {
    e.preventDefault();
    const contentId = e.dataTransfer.getData("contentId");
    const source = e.dataTransfer.getData("source");

    if (!contentId || !dateString) return;

    try {
      setProcessing(true);
      if (source === "queue") {
        await scheduleAgencyContent(contentId, dateString);
      } else {
        await updateAgencyCalendarContent(contentId, { scheduledFor: dateString });
      }
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedContent) return;
    try {
      setProcessing(true);
      await updateAgencyCalendarContent(selectedContent._id, { contentStatus: status });
      await fetchData();
      setShowDetailModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleUnschedule = async () => {
    if (!selectedContent) return;
    try {
      setProcessing(true);
      // Sending null removes the date
      await updateAgencyCalendarContent(selectedContent._id, { scheduledFor: null });
      await fetchData();
      setShowDetailModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Calendar Logic (Monthly)
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Navigate Calendar
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  // Date Formatting for matching
  const formatDateForCompare = (y, m, d) => {
    const date = new Date(y, m, d);
    date.setHours(0,0,0,0);
    return date.getTime();
  };

  const getPlatformColor = (platform) => {
    switch(platform) {
      case "instagram": return "bg-pink-100 text-pink-700 border-pink-200";
      case "linkedin": return "bg-blue-100 text-blue-700 border-blue-200";
      case "twitter": return "bg-sky-100 text-sky-700 border-sky-200";
      case "tiktok": return "bg-zinc-800 text-white border-zinc-900";
      case "facebook": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default: return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const isOverdue = (dateString, status) => {
    if (status === "published" || !dateString) return false;
    const date = new Date(dateString);
    date.setHours(0,0,0,0);
    return date.getTime() < new Date().setHours(0,0,0,0);
  };

  const isUpcoming = (dateString, status) => {
    if (status === "published" || !dateString) return false;
    const date = new Date(dateString);
    date.setHours(0,0,0,0);
    return date.getTime() >= new Date().setHours(0,0,0,0);
  };

  if (loading && data.scheduled.length === 0 && data.unscheduled.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-900">
        <div className="flex items-center gap-3 text-violet-700">
          <LoaderCircle size={24} className="animate-spin" />
          <span className="font-medium">Loading calendar...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-12">
      <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-8">
        
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/agency/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800 mb-3">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-lg shadow-violet-200">
                <CalendarIcon size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-950">
                  Content Calendar
                </h1>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                  Schedule, drag, and drop AI content across your clients.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl bg-white p-1 border border-zinc-200 shadow-sm">
              <button 
                onClick={() => setViewMode("month")} 
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${viewMode === "month" ? "bg-violet-100 text-violet-700" : "text-zinc-600 hover:bg-zinc-50"}`}
              >
                <LayoutGrid size={16} /> Month
              </button>
              <button 
                disabled
                title="Weekly view coming soon"
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-zinc-400 opacity-50 cursor-not-allowed`}
              >
                <LayoutList size={16} /> Week
              </button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
          <select 
            value={filters.clientId}
            onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
            className="rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-3 pr-8 text-sm font-semibold text-zinc-700 outline-none focus:border-violet-500 focus:bg-white appearance-none cursor-pointer hover:bg-zinc-100"
          >
            <option value="">All Clients</option>
            {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select 
            value={filters.clientType}
            onChange={(e) => setFilters({ ...filters, clientType: e.target.value })}
            className="rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-3 pr-8 text-sm font-semibold text-zinc-700 outline-none focus:border-violet-500 focus:bg-white appearance-none cursor-pointer hover:bg-zinc-100"
          >
            <option value="">All Types (Creator/Business)</option>
            <option value="creator">Creator</option>
            <option value="business">Business</option>
          </select>
          
          <select 
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
            className="rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-3 pr-8 text-sm font-semibold text-zinc-700 outline-none focus:border-violet-500 focus:bg-white appearance-none cursor-pointer hover:bg-zinc-100"
          >
            <option value="">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
          </select>

          <select 
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-3 pr-8 text-sm font-semibold text-zinc-700 outline-none focus:border-violet-500 focus:bg-white appearance-none cursor-pointer hover:bg-zinc-100"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Main Calendar Area */}
          <div className="flex-1 w-full bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900">{monthNames[month]} {year}</h2>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition"><ChevronLeft size={20} /></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-semibold rounded-xl border border-zinc-200 hover:bg-zinc-50 transition">Today</button>
                <button onClick={nextMonth} className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition"><ChevronRight size={20} /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-zinc-100 bg-zinc-50/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-4 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
              {blanks.map((_, i) => (
                <div key={`blank-${i}`} className="min-h-[140px] border-b border-r border-zinc-100 bg-zinc-50/30 p-2"></div>
              ))}
              {days.map(day => {
                const cellTime = formatDateForCompare(year, month, day);
                const isToday = cellTime === new Date().setHours(0,0,0,0);
                
                // Get content for this day
                const dayContent = data.scheduled.filter(c => {
                  if (!c.scheduledFor) return false;
                  const d = new Date(c.scheduledFor);
                  d.setHours(0,0,0,0);
                  return d.getTime() === cellTime;
                });

                return (
                  <div 
                    key={day} 
                    className={`min-h-[140px] border-b border-r border-zinc-100 p-2 flex flex-col gap-1 transition ${isToday ? 'bg-violet-50/30' : 'hover:bg-zinc-50/50'}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, new Date(year, month, day).toISOString())}
                  >
                    <div className="flex justify-end mb-1">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isToday ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-600'}`}>
                        {day}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-[120px]">
                      {dayContent.map(content => (
                        <div 
                          key={content._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, content._id, "calendar")}
                          onClick={() => { setSelectedContent(content); setShowDetailModal(true); }}
                          className={`group cursor-pointer rounded-lg border p-2 shadow-sm transition hover:scale-[1.02] active:cursor-grabbing ${getPlatformColor(content.platform)}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[9px] font-black uppercase tracking-wider line-clamp-1 flex-1 truncate">{content.platform || "General"}</span>
                            {isOverdue(content.scheduledFor, content.contentStatus) && <AlertCircle size={10} className="text-red-600 shrink-0 ml-1" />}
                          </div>
                          <p className="text-[10px] font-bold leading-tight line-clamp-2">{content.title}</p>
                          <div className="mt-1 text-[9px] font-semibold opacity-70 flex items-center justify-between">
                            <span className="truncate">{content.clientId?.name}</span>
                            {content.contentStatus === 'published' && <CheckSquare size={10} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unscheduled Queue Panel */}
          <div className="w-full lg:w-[320px] shrink-0 bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] sticky top-6">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center justify-between">
                Drafts Queue
                <span className="bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full text-xs">{data.unscheduled.length}</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-1">Drag items to calendar to schedule</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-3 bg-zinc-50/50">
              {data.unscheduled.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 opacity-60">
                   <LayoutGrid size={32} className="mb-2" />
                   <p className="text-sm font-semibold">Queue is empty</p>
                </div>
              ) : (
                data.unscheduled.map(content => (
                  <div 
                    key={content._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, content._id, "queue")}
                    onClick={() => { setSelectedContent(content); setShowDetailModal(true); }}
                    className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-violet-300 hover:shadow-md active:cursor-grabbing"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${getPlatformColor(content.platform)}`}>
                        {content.platform || content.type}
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-900 text-xs line-clamp-2 leading-snug mb-2">{content.title}</h4>
                    {content.clientId && (
                       <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-500">
                         <Building2 size={10} className="text-violet-500" /> <span className="truncate">{content.clientId.name || content.clientId.businessName}</span>
                       </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Content Details Modal */}
      {showDetailModal && selectedContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 bg-zinc-50/50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                 <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getPlatformColor(selectedContent.platform)}`}>
                   {selectedContent.platform || "General"}
                 </span>
                 <span className="inline-flex rounded-full bg-zinc-200 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-zinc-600 border border-zinc-300">
                   {selectedContent.contentStatus.replace("-", " ")}
                 </span>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">{selectedContent.title}</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Scheduled Date</p>
                  <p className={`font-semibold text-sm ${isOverdue(selectedContent.scheduledFor, selectedContent.contentStatus) ? "text-red-600" : "text-zinc-800"}`}>
                    {selectedContent.scheduledFor ? new Date(selectedContent.scheduledFor).toLocaleDateString() : "Not scheduled"}
                    {isOverdue(selectedContent.scheduledFor, selectedContent.contentStatus) && " (Overdue)"}
                    {isUpcoming(selectedContent.scheduledFor, selectedContent.contentStatus) && " (Upcoming)"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Client</p>
                  <p className="font-semibold text-sm text-zinc-800 flex items-center gap-1.5">
                    <Building2 size={14} className="text-violet-500" /> {selectedContent.clientId?.name || "None"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Content Preview</p>
                <div className="text-sm text-zinc-700 font-mono whitespace-pre-wrap bg-zinc-50 p-4 rounded-xl border border-zinc-100 min-h-24">
                  {selectedContent.content || <span className="italic text-zinc-400">No content provided.</span>}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 rounded-b-3xl flex items-center justify-between gap-3">
              <div>
                {selectedContent.scheduledFor && (
                  <button 
                    onClick={handleUnschedule}
                    disabled={processing}
                    className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition"
                  >
                    Unschedule (Move to Queue)
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {selectedContent.contentStatus !== "published" && selectedContent.scheduledFor && (
                  <button 
                    onClick={() => handleUpdateStatus("published")}
                    disabled={processing}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 font-semibold text-white transition hover:bg-violet-800"
                  >
                    <CheckSquare size={16} /> Mark Published
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
