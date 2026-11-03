import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  formatDateShort,
  formatStatusLabel,
  getPriorityColorClass,
  getStatusColorClass,
  parseMessageAndLocation,
} from '../../utils/formatters';
import { getVisualAssetForDepartmentOrCategory } from '../../utils/departmentAssets';

export const MyComplaintsPage: React.FC = () => {
  const { user, grievances } = useApp();
  const citizenId = user?.id || 'CIT-2026-DEMO01';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');

  const myComplaints = grievances
    .filter((g) => g.citizen_id === citizenId)
    .filter((g) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = g.ticket_id.toLowerCase().includes(q);
        const matchesDesc = g.original_message.toLowerCase().includes(q);
        if (!matchesId && !matchesDesc) return false;
      }
      if (statusFilter !== 'ALL') {
        const label = formatStatusLabel(g.status).toUpperCase();
        if (label !== statusFilter) return false;
      }
      if (
        categoryFilter !== 'ALL' &&
        g.predicted_category !== categoryFilter
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'DESC') {
        return a.created_at < b.created_at ? 1 : -1;
      }
      return a.created_at > b.created_at ? 1 : -1;
    });

  return (
    <div className="space-y-6">
      <section className="jana-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-sky-200/70">
          <div>
            <h1 className="text-xl font-bold text-[#102A56]">My Complaints</h1>
            <p className="text-xs text-[#63718A] mt-0.5">
              All civic grievances registered under your citizen profile (
              {myComplaints.length} records).
            </p>
          </div>
          <Link
            to="/citizen/register"
            className="jana-btn-accent px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0"
          >
            + Register New Complaint
          </Link>
        </div>

        {/* Filters & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-5">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Ticket ID or keyword..."
            aria-label="Search by Ticket ID"
            className="px-3.5 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="px-3.5 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by Category"
            className="px-3.5 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
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
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'DESC' | 'ASC')}
            aria-label="Sort by Date"
            className="px-3.5 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
          >
            <option value="DESC">Sort by Date: Newest First</option>
            <option value="ASC">Sort by Date: Oldest First</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sky-200/70 text-xs text-[#63718A]">
                <th className="py-3 pr-4">Ticket ID</th>
                <th className="py-3 px-4">Department &amp; Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {myComplaints.map((item) => {
                const parsed = parseMessageAndLocation(item.original_message);
                const asset = getVisualAssetForDepartmentOrCategory(
                  item.predicted_category || item.assigned_department
                );
                return (
                  <tr
                    key={item.ticket_id}
                    className="hover:bg-sky-50/50 transition-colors"
                  >
                    <td className="py-3.5 pr-4 font-mono font-semibold text-[#102A56] whitespace-nowrap">
                      {item.ticket_id}
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
                    <td className="py-3.5 px-4 text-[#63718A] max-w-[240px] truncate">
                      {parsed.description}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#63718A] tabular-nums whitespace-nowrap">
                      {formatDateShort(item.created_at)}
                    </td>
                    <td
                      className={`py-3.5 px-4 whitespace-nowrap ${getPriorityColorClass(
                        item.priority
                      )}`}
                    >
                      {item.priority}
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
                        to={`/citizen/complaints/${item.ticket_id}`}
                        className="jana-btn-primary px-3 py-1.5 text-xs font-semibold rounded-lg inline-block"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {myComplaints.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#63718A]">
                    No complaints match your current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
