"use client";

import { ChevronDown, ChevronUp, MoreHorizontal, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function DataTable({ 
  columns, 
  data, 
  loading, 
  onRowClick,
  pagination = { page: 1, limit: 10, total: 0 },
  onPageChange,
  searchPlaceholder = "Search..."
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState("");

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-zinc-100 overflow-hidden">
      
      {/* Header Actions */}
      <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            className="bg-white border border-zinc-200 text-zinc-900 text-sm rounded-xl focus:ring-violet-500 focus:border-violet-500 block w-full pl-10 p-2.5 shadow-sm"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-zinc-500">
          <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-100">
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-4 font-semibold tracking-wider ${col.sortable ? "cursor-pointer select-none hover:bg-zinc-100/50 transition-colors" : ""}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && (
                      <div className="flex flex-col text-zinc-300">
                        <ChevronUp size={12} className={sortConfig.key === col.key && sortConfig.direction === 'asc' ? 'text-violet-600' : ''} />
                        <ChevronDown size={12} className={`-mt-1 ${sortConfig.key === col.key && sortConfig.direction === 'desc' ? 'text-violet-600' : ''}`} />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton Loading
              Array(5).fill(0).map((_, idx) => (
                <tr key={idx} className="border-b border-zinc-100">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <div className="h-4 bg-zinc-200 rounded animate-pulse w-3/4"></div>
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <div className="h-4 bg-zinc-200 rounded animate-pulse w-8 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : data?.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr 
                  key={row.id || row._id || rowIdx} 
                  className="bg-white border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-zinc-600">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button className="text-zinc-400 hover:text-violet-600 transition-colors p-2 rounded-lg hover:bg-violet-50 opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                      <Search className="h-6 w-6 text-zinc-400" />
                    </div>
                    <p className="text-base font-medium text-zinc-900">No results found</p>
                    <p className="text-sm text-zinc-500 mt-1">Try adjusting your filters or search query.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <span className="text-sm text-zinc-500">
            Showing <span className="font-semibold text-zinc-900">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-zinc-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-zinc-900">{pagination.total}</span> entries
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
