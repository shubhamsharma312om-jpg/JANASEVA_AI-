import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  formatDateShort,
  formatStatusLabel,
  getPriorityColorClass,
  getStatusColorClass,
} from '../../utils/formatters';
import { getVisualAssetForDepartmentOrCategory } from '../../utils/departmentAssets';

const STATUS_COLORS: Record<string, string> = {
  Submitted: '#64748B',
  Assigned: '#D97706',
  'In Progress': '#1D4ED8',
  Resolved: '#16A34A',
  Rejected: '#DC2626',
};

export const AdminDashboardPage: React.FC = () => {
  const { grievances, departments } = useApp();
  const {
    t,
    translateCategory,
    translateDepartment,
    translateStatus,
    translatePriority,
  } = useLanguage();
  const navigate = useNavigate();

  const totalCount = grievances.length;
  const pendingCount = grievances.filter(
    (g) =>
      g.status === 'SUBMITTED' ||
      g.status === 'ROUTED' ||
      g.status === 'ASSIGNED'
  ).length;
  const inProgressCount = grievances.filter(
    (g) => g.status === 'IN_PROGRESS'
  ).length;
  const resolvedCount = grievances.filter(
    (g) => g.status === 'RESOLVED' || g.status === 'CLOSED'
  ).length;

  const nowMs = new Date('2026-11-03T09:00:00Z').getTime();
  const overdueCount = grievances.filter((g) => {
    if (
      g.status === 'RESOLVED' ||
      g.status === 'CLOSED' ||
      g.status === 'REJECTED'
    ) {
      return false;
    }
    const createdMs = new Date(g.created_at).getTime();
    return nowMs - createdMs > 48 * 3600 * 1000;
  }).length;

  const categoryCountsMap: Record<string, number> = {};
  grievances.forEach((g) => {
    categoryCountsMap[g.predicted_category] =
      (categoryCountsMap[g.predicted_category] || 0) + 1;
  });
  const overviewChartData = Object.entries(categoryCountsMap).map(
    ([name, count]) => ({
      name,
      Complaints: count,
    })
  );

  const deptChartData = departments.map((d) => {
    const count = grievances.filter(
      (g) => g.assigned_department === d.department_name
    ).length;
    return {
      department: d.department_name.replace(' Department', ''),
      Assigned: count,
    };
  });

  const monthlyTrendsData = [
    { month: 'Jun 2026', Submitted: 18, Resolved: 15 },
    { month: 'Jul 2026', Submitted: 24, Resolved: 21 },
    { month: 'Aug 2026', Submitted: 31, Resolved: 28 },
    { month: 'Sep 2026', Submitted: 27, Resolved: 25 },
    { month: 'Oct 2026', Submitted: 35, Resolved: 30 },
    {
      month: 'Nov 2026 (Live)',
      Submitted: totalCount,
      Resolved: resolvedCount,
    },
  ];

  const statusCounts: Record<string, number> = {};
  grievances.forEach((g) => {
    const label = formatStatusLabel(g.status);
    statusCounts[label] = (statusCounts[label] || 0) + 1;
  });
  const statusPieData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const recentActivity = grievances
    .flatMap((g) =>
      (g.history || []).map((h) => ({
        ...h,
        department: g.assigned_department,
      }))
    )
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header & Quick Actions */}
      <section className="jana-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102A56]">
            {t('admin.dashboard.title')}
          </h1>
          <p className="text-xs text-[#63718A] mt-1">
            {t('admin.dashboard.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/complaints')}
            className="jana-btn-primary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
          >
            {t('admin.manageAllComplaints')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/departments')}
            className="jana-btn-secondary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
          >
            {t('admin.departmentRouting')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/analytics')}
            className="jana-btn-accent px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
          >
            {t('admin.detailedAnalytics')}
          </button>
        </div>
      </section>

      {/* 5 Summary Statistics Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="jana-card jana-card-interactive p-5">
          <div className="text-xs text-[#63718A]">
            {t('dashboard.stats.total')}
          </div>
          <div className="text-2xl font-bold text-[#102A56] font-mono tabular-nums mt-1">
            {totalCount}
          </div>
        </div>
        <div className="jana-card jana-card-interactive p-5">
          <div className="text-xs text-[#63718A]">
            {t('dashboard.stats.pending')}
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
            {pendingCount}
          </div>
        </div>
        <div className="jana-card jana-card-interactive p-5">
          <div className="text-xs text-[#63718A]">
            {t('dashboard.stats.inProgress')}
          </div>
          <div className="text-2xl font-bold text-[#1D4ED8] font-mono tabular-nums mt-1">
            {inProgressCount}
          </div>
        </div>
        <div className="jana-card jana-card-interactive p-5">
          <div className="text-xs text-[#63718A]">
            {t('dashboard.stats.resolved')}
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {resolvedCount}
          </div>
        </div>
        <div className="jana-card jana-card-interactive p-5">
          <div className="text-xs text-[#63718A]">
            {t('admin.stats.overdue')}
          </div>
          <div className="text-2xl font-bold text-red-700 font-mono tabular-nums mt-1">
            {overdueCount}
          </div>
        </div>
      </section>

      {/* 4 Visual Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="jana-card p-6">
          <h2 className="text-sm font-bold text-[#102A56] mb-4">
            {t('admin.chart1.title')}
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="Complaints"
                  fill="#1D4ED8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="jana-card p-6">
          <h2 className="text-sm font-bold text-[#102A56] mb-4">
            {t('admin.chart2.title')}
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="department"
                  width={130}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="Assigned" fill="#102A56" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="jana-card p-6">
          <h2 className="text-sm font-bold text-[#102A56] mb-4">
            {t('admin.chart3.title')}
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="Submitted"
                  stroke="#EA580C"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Resolved"
                  stroke="#16A34A"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="jana-card p-6">
          <h2 className="text-sm font-bold text-[#102A56] mb-4">
            {t('admin.chart4.title')}
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusPieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] || '#1D4ED8'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Recent Complaints & Top Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 jana-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-sky-200/70">
            <h2 className="text-base font-bold text-[#102A56]">
              {t('dashboard.recentComplaints')}
            </h2>
            <Link
              to="/admin/complaints"
              className="text-xs font-semibold text-[#1D4ED8] hover:underline"
            >
              {t('dashboard.viewAll')} →
            </Link>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-200/70 text-xs text-[#63718A]">
                  <th className="py-2.5 pr-3">{t('table.ticketId')}</th>
                  <th className="py-2.5 px-3">{t('table.categoryAndDept')}</th>
                  <th className="py-2.5 px-3">{t('table.priority')}</th>
                  <th className="py-2.5 px-3">{t('table.status')}</th>
                  <th className="py-2.5 pl-3 text-right">
                    {t('table.action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 text-xs">
                {grievances.slice(0, 5).map((g) => {
                  const asset = getVisualAssetForDepartmentOrCategory(
                    g.predicted_category || g.assigned_department
                  );
                  return (
                    <tr
                      key={g.ticket_id}
                      className="hover:bg-sky-50/50 transition-colors"
                    >
                      <td className="py-3 pr-3 font-mono font-semibold text-[#102A56] whitespace-nowrap">
                        {g.ticket_id}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-14 aspect-video rounded-md overflow-hidden border border-sky-200/80 shrink-0 bg-slate-900">
                            <img
                              src={asset.thumbnailImage}
                              alt={g.assigned_department}
                              className="w-full h-full object-cover object-center"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-[#102A56]">
                              {translateCategory(g.predicted_category)}
                            </div>
                            <div className="text-[11px] text-[#1D4ED8] font-medium">
                              {translateDepartment(g.assigned_department)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={`py-3 px-3 whitespace-nowrap ${getPriorityColorClass(
                          g.priority
                        )}`}
                      >
                        {translatePriority(g.priority)}
                      </td>
                      <td
                        className={`py-3 px-3 whitespace-nowrap ${getStatusColorClass(
                          g.status
                        )}`}
                      >
                        {translateStatus(g.status)}
                      </td>
                      <td className="py-3 pl-3 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/complaints/${g.ticket_id}`}
                          className="font-semibold text-[#1D4ED8] hover:underline"
                        >
                          {t('common.manage')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="lg:col-span-4 jana-card p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#102A56]">
              {t('admin.recentActivity')}
            </h2>
          </div>

          <div className="divide-y divide-sky-100">
            {recentActivity.map((act) => {
              const asset = getVisualAssetForDepartmentOrCategory(
                act.department
              );
              return (
                <div
                  key={`${act.ticket_id}-${act.history_id}`}
                  className="py-2.5 first:pt-0 last:pb-0 text-xs flex items-start gap-3"
                >
                  <div className="w-12 aspect-video rounded overflow-hidden border border-sky-200/80 shrink-0 bg-slate-900 mt-0.5">
                    <img
                      src={asset.thumbnailImage}
                      alt={act.department}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/admin/complaints/${act.ticket_id}`}
                        className="font-mono font-semibold text-[#1D4ED8] hover:underline"
                      >
                        {act.ticket_id}
                      </Link>
                      <span className="font-mono text-[#63718A]">
                        {formatDateShort(act.timestamp)}
                      </span>
                    </div>
                    <div className="text-[#102A56] font-medium mt-0.5 truncate">
                      {translateStatus(act.new_status)} ·{' '}
                      {translateDepartment(act.department)}
                    </div>
                    <p className="text-[#63718A] truncate mt-0.5">
                      {act.remarks}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
