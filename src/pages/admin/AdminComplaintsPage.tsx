import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  formatDateShort,
  formatStatusLabel,
  getPriorityColorClass,
  getStatusColorClass,
} from '../../utils/formatters';
import { getVisualAssetForDepartmentOrCategory } from '../../utils/departmentAssets';

const PAGE_SIZE = 5;

export const AdminComplaintsPage: React.FC = () => {
  const { grievances, departments } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = grievances.filter((g) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = g.ticket_id.toLowerCase().includes(q);
      const matchMsg = g.original_message.toLowerCase().includes(q);
      const matchCit = (g.citizen_name || g.citizen_id)
        .toLowerCase()
        .includes(q);
      if (!matchId && !matchMsg && !matchCit) return false;
    }
    if (categoryFilter !== 'ALL' && g.predicted_category !== categoryFilter) {
      return false;
    }
    if (
      departmentFilter !== 'ALL' &&
      g.assigned_department !== departmentFilter
    ) {
      return false;
    }
    if (statusFilter !== 'ALL') {
      const label = formatStatusLabel(g.status).toUpperCase();
      if (label !== statusFilter) return false;
    }
    if (priorityFilter !== 'ALL' && g.priority !== priorityFilter) {
      return false;
    }
    if (dateFilter && !g.created_at.startsWith(dateFilter)) {
      return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setDepartmentFilter('ALL');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setDateFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="jana-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-sky-200/70">
          <div>
            <h1 className="text-xl font-bold text-[#102A56]">
              All Citizen Complaints
            </h1>
            <p className="text-xs text-[#63718A] mt-0.5">
              Filter, triage, and manage all civic grievances across Hyderabad (
              {filtered.length} matching records).
            </p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="jana-btn-secondary px-3.5 py-1.5 text-xs font-semibold rounded-xl cursor-pointer self-start sm:self-auto"
          >
            Reset Filters
          </button>
        </div>

        {/* Comprehensive 6-Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-5">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Ticket, Citizen..."
            className="px-3 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
          />

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
          >
            <option value="ALL">All Categories</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Roads and Potholes">Roads and Potholes</option>
            <option value="Garbage Collection">Garbage Collection</option>
            <option value="Electricity">Electricity</option>
            <option value="Streetlights">Streetlights</option>
            <option value="Drainage">Drainage</option>
            <option value="Public Safety">Public Safety</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_name}>
                {d.department_name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by Date"
            className="px-3 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sky-200/70 text-xs text-[#63718A]">
                <th className="py-3 pr-4">Ticket ID</th>
                <th className="py-3 px-4">Citizen</th>
                <th className="py-3 px-4">Department &amp; Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {paginated.map((item) => {
                const asset = getVisualAssetForDepartmentOrCategory(
                  item.predicted_category || item.assigned_department
                );
                return (
                  <tr
                    key={item.ticket_id}
                    className="hover:bg-sky-50/50 transition-colors"
                  >
                    <td className="py-3.5 pr-4 font-mono font-semibold text-[#102A56] whitespace-nowrap">
                      <Link
                        to={`/admin/complaints/${item.ticket_id}`}
                        className="hover:text-[#1D4ED8] hover:underline"
                      >
                        {item.ticket_id}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-[#102A56]">
                        {item.citizen_name || 'Anonymous Citizen'}
                      </div>
                      <div className="font-mono text-[#63718A]">
                        {item.citizen_id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-16 aspect-video rounded-md overflow-hidden border border-sky-200/80 shrink-0 bg-slate-900">
                          <img
                            src={asset.thumbnailImage}
                            alt={item.assigned_department}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-[#102A56]">
                            {item.predicted_category}
                          </div>
                          <div className="text-[11px] text-[#1D4ED8] font-medium">
                            {item.assigned_department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className={`py-3.5 px-4 whitespace-nowrap ${getPriorityColorClass(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#63718A] tabular-nums whitespace-nowrap">
                      {formatDateShort(item.created_at)}
                    </td>
                    <td
                      className={`py-3.5 px-4 whitespace-nowrap ${getStatusColorClass(
                        item.status
                      )}`}
                    >
                      {formatStatusLabel(item.status)}
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/complaints/${item.ticket_id}`}
                        className="jana-btn-primary px-3 py-1.5 text-xs font-semibold rounded-lg inline-block"
                      >
                        Manage Ticket
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#63718A]">
                    No complaints match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="mt-6 pt-4 border-t border-sky-200/70 flex items-center justify-between text-xs text-[#63718A]">
          <div>
            Showing page{' '}
            <span className="font-mono font-semibold text-[#102A56]">
              {currentPage}
            </span>{' '}
            of{' '}
            <span className="font-mono font-semibold text-[#102A56]">
              {totalPages}
            </span>{' '}
            ({filtered.length} total complaints)
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="jana-btn-secondary px-3 py-1.5 rounded-lg disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="jana-btn-secondary px-3 py-1.5 rounded-lg disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
