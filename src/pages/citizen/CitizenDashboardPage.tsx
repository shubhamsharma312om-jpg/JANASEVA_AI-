import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, FilePlus2, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatDateShort,
  formatStatusLabel,
  getPriorityColorClass,
  getStatusColorClass,
  parseMessageAndLocation,
} from '../../utils/formatters';
import {
  DEPARTMENT_VISUAL_ASSETS,
  getVisualAssetForDepartmentOrCategory,
} from '../../utils/departmentAssets';

export const CitizenDashboardPage: React.FC = () => {
  const { user, grievances } = useApp();
  const navigate = useNavigate();

  const citizenId = user?.id || 'CIT-2026-DEMO01';
  const myComplaints = grievances.filter((g) => g.citizen_id === citizenId);

  const totalCount = myComplaints.length;
  const pendingCount = myComplaints.filter(
    (g) =>
      g.status === 'SUBMITTED' ||
      g.status === 'ROUTED' ||
      g.status === 'ASSIGNED'
  ).length;
  const inProgressCount = myComplaints.filter(
    (g) => g.status === 'IN_PROGRESS'
  ).length;
  const resolvedCount = myComplaints.filter(
    (g) => g.status === 'RESOLVED' || g.status === 'CLOSED'
  ).length;

  const recentActivity = myComplaints
    .flatMap((g) =>
      (g.history || []).map((h) => ({
        ...h,
        category: g.predicted_category,
      }))
    )
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, 5);

  const departmentVisuals = Object.values(DEPARTMENT_VISUAL_ASSETS);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="jana-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102A56]">
            Welcome back, {user?.name || 'Arjun Reddy'}
          </h1>
          <p className="text-xs text-[#63718A] mt-1">
            Citizen ID: <span className="font-mono">{citizenId}</span> · Track
            and manage your civic grievances across Hyderabad.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/citizen/register')}
            className="jana-btn-accent px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Register New Complaint
          </button>
          <button
            type="button"
            onClick={() => navigate('/citizen/track')}
            className="jana-btn-secondary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Track by Ticket ID
          </button>
        </div>
      </section>

      {/* Dashboard Statistics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="jana-card jana-card-interactive p-5">
          <div className="text-xs text-[#63718A]">Total Complaints</div>
          <div className="text-2xl font-bold text-[#102A56] font-mono tabular-nums mt-1">
            {totalCount}
          </div>
        </div>
        <div className="jana-card jana-card-interactive p-5">
          <div className="text-xs text-[#63718A]">
            Pending (Submitted / Assigned)
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
            {pendingCount}
          </div>
        </div>
        <div className="jana-card jana-card-interactive p-5">
          <div className="text-xs text-[#63718A]">In Progress</div>
          <div className="text-2xl font-bold text-[#1D4ED8] font-mono tabular-nums mt-1">
            {inProgressCount}
          </div>
        </div>
        <div className="jana-card jana-card-interactive p-5">
          <div className="text-xs text-[#63718A]">Resolved</div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {resolvedCount}
          </div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="jana-card jana-card-interactive p-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-base font-bold text-[#102A56]">
              <FilePlus2 className="w-5 h-5 text-[#EA580C]" />
              <h2>Register New Complaint</h2>
            </div>
            <p className="text-xs text-[#63718A] leading-relaxed">
              Submit a grievance in English, Telugu, or Hindi across any of the
              7 Hyderabad municipal categories.
            </p>
            <Link
              to="/citizen/register"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline pt-1"
            >
              <span>Start Multi-Step Registration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="jana-card jana-card-interactive p-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-base font-bold text-[#102A56]">
              <Search className="w-5 h-5 text-[#1D4ED8]" />
              <h2>Track Complaint Status</h2>
            </div>
            <p className="text-xs text-[#63718A] leading-relaxed">
              Look up any JANASEVA AI Ticket ID to inspect department assignment
              and field engineer remarks.
            </p>
            <Link
              to="/citizen/track"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline pt-1"
            >
              <span>Open Ticket Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick-Report by Department Visual Strip */}
      <section className="jana-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#102A56]">
              Quick Report by Civic Department
            </h2>
            <p className="text-xs text-[#63718A] mt-0.5">
              Select a department below to launch complaint registration pre-configured for that category.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentVisuals.map((dept) => (
            <button
              key={dept.departmentId}
              type="button"
              onClick={() =>
                navigate(
                  `/citizen/register?category=${encodeURIComponent(
                    dept.category
                  )}`
                )
              }
              className="group text-left rounded-xl overflow-hidden border border-sky-200/80 bg-[#FFFCF7] hover:border-[#48A9E8] transition-all cursor-pointer shadow-xs"
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={dept.bannerImage}
                  alt={dept.departmentName}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-3">
                <div className="text-xs font-bold text-[#102A56] truncate">
                  {dept.category}
                </div>
                <div className="text-[11px] text-[#1D4ED8] font-medium truncate">
                  {dept.departmentName}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Complaints Table */}
      <section className="jana-card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-sky-200/70">
          <div>
            <h2 className="text-base font-bold text-[#102A56]">
              Recent Complaints
            </h2>
            <p className="text-xs text-[#63718A] mt-0.5">
              Your latest registered grievances and current resolution state.
            </p>
          </div>
          <Link
            to="/citizen/complaints"
            className="text-xs font-semibold text-[#1D4ED8] hover:underline"
          >
            View All ({myComplaints.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sky-200/70 text-xs text-[#63718A]">
                <th className="py-3 pr-4">Ticket ID</th>
                <th className="py-3 px-4">Category &amp; Department</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {myComplaints.slice(0, 5).map((item) => {
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
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 aspect-video rounded-md overflow-hidden border border-sky-200/80 shrink-0 bg-slate-900">
                          <img
                            src={asset.thumbnailImage}
                            alt={item.assigned_department}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[#102A56] whitespace-nowrap">
                            {item.predicted_category}
                          </div>
                          <div className="text-[11px] text-[#1D4ED8] font-medium whitespace-nowrap">
                            {item.assigned_department}
                          </div>
                          <div className="text-[#63718A] truncate max-w-[200px]">
                            {parsed.description}
                          </div>
                        </div>
                      </div>
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
                        className="font-semibold text-[#1D4ED8] hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {myComplaints.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#63718A]">
                    You have not registered any complaints yet. Click
                    &ldquo;Register New Complaint&rdquo; to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="jana-card p-6">
        <h2 className="text-base font-bold text-[#102A56] mb-4">
          Recent Status Activity
        </h2>
        <div className="divide-y divide-sky-100">
          {recentActivity.map((act) => (
            <div
              key={`${act.ticket_id}-${act.history_id}`}
              className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <span className="font-mono font-semibold text-[#102A56]">
                  {act.ticket_id}
                </span>
                <span className="mx-2 text-slate-400">·</span>
                <span className="font-medium text-[#1D4ED8]">
                  {formatStatusLabel(act.new_status)}
                </span>
                <p className="text-[#63718A] mt-0.5">{act.remarks}</p>
              </div>
              <div className="font-mono text-[#63718A] tabular-nums shrink-0">
                {formatDateShort(act.timestamp)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
