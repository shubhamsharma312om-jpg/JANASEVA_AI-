import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../../context/AppContext';

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#DC2626',
  HIGH: '#EA580C',
  MEDIUM: '#1D4ED8',
  LOW: '#64748B',
};

export const AdminAnalyticsPage: React.FC = () => {
  const { grievances, departments } = useApp();

  const total = grievances.length;
  const resolvedTickets = grievances.filter(
    (g) => g.status === 'RESOLVED' || g.status === 'CLOSED'
  );
  const resolutionRate =
    total > 0 ? Math.round((resolvedTickets.length / total) * 100) : 0;

  // Calculate real average resolution time (in hours) from actual created_at & updated_at timestamps of resolved tickets
  let avgResolutionHours = 0;
  if (resolvedTickets.length > 0) {
    const sumHours = resolvedTickets.reduce((acc, item) => {
      const start = new Date(item.created_at).getTime();
      const end = new Date(item.updated_at).getTime();
      const diffHours = Math.max(1, (end - start) / (1000 * 3600));
      return acc + diffHours;
    }, 0);
    avgResolutionHours = Math.round(sumHours / resolvedTickets.length);
  }

  // 1. Total complaints by month (Historical Demo + Live Current Month)
  const monthlyData = [
    { month: 'Jun', Total: 18, Pending: 3, Resolved: 15 },
    { month: 'Jul', Total: 24, Pending: 3, Resolved: 21 },
    { month: 'Aug', Total: 31, Pending: 3, Resolved: 28 },
    { month: 'Sep', Total: 27, Pending: 2, Resolved: 25 },
    { month: 'Oct', Total: 35, Pending: 5, Resolved: 30 },
    {
      month: 'Nov (Live)',
      Total: total,
      Pending: total - resolvedTickets.length,
      Resolved: resolvedTickets.length,
    },
  ];

  // 2. Complaints by Category (Live Data)
  const categoryMap: Record<string, number> = {};
  grievances.forEach((g) => {
    categoryMap[g.predicted_category] =
      (categoryMap[g.predicted_category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([category, count]) => ({
    category,
    Count: count,
  }));

  // 3. Complaints by Department (Live Data)
  const deptData = departments.map((d) => ({
    department: d.department_name.replace(' Department', ''),
    Count: grievances.filter(
      (g) => g.assigned_department === d.department_name
    ).length,
  }));

  // 4. Priority Distribution (Live Data)
  const priorityMap: Record<string, number> = {};
  grievances.forEach((g) => {
    priorityMap[g.priority] = (priorityMap[g.priority] || 0) + 1;
  });
  const priorityData = Object.entries(priorityMap).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-8">
      <section className="jana-card p-6">
        <h1 className="text-2xl font-bold text-[#102A56]">
          Civic Grievance Analytics &amp; SLA Performance
        </h1>
        <p className="text-xs text-[#63718A] mt-1">
          Live metrics computed from SQLite/application records, supplemented
          with clearly labeled historical demonstration trends.
        </p>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="rounded-xl border border-sky-200/80 bg-[#FFFCF7] p-4">
            <div className="text-xs text-[#63718A]">Live Total Complaints</div>
            <div className="text-2xl font-bold text-[#102A56] font-mono tabular-nums mt-1">
              {total}
            </div>
          </div>

          <div className="rounded-xl border border-sky-200/80 bg-[#FFFCF7] p-4">
            <div className="text-xs text-[#63718A]">Resolution Rate (Live)</div>
            <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
              {resolutionRate}%
            </div>
          </div>

          <div className="rounded-xl border border-sky-200/80 bg-[#FFFCF7] p-4">
            <div className="text-xs text-[#63718A]">
              Avg. Resolution Time (Timestamp Verified)
            </div>
            <div className="text-2xl font-bold text-[#1D4ED8] font-mono tabular-nums mt-1">
              {resolvedTickets.length > 0 ? `${avgResolutionHours}h` : 'N/A'}
            </div>
          </div>

          <div className="rounded-xl border border-sky-200/80 bg-[#FFFCF7] p-4">
            <div className="text-xs text-[#63718A]">
              Active Pending / In-Progress
            </div>
            <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
              {total - resolvedTickets.length}
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Complaints & Pending Trends by Month */}
        <section className="jana-card p-6">
          <h2 className="text-sm font-bold text-[#102A56]">
            Total &amp; Pending Complaint Trends by Month (Demo Historical +
            Live)
          </h2>
          <p className="text-xs text-[#63718A] mt-0.5 mb-4">
            Tracks monthly intake volume against pending backlog.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="Total"
                  stroke="#102A56"
                  fill="#102A56"
                  fillOpacity={0.12}
                />
                <Area
                  type="monotone"
                  dataKey="Pending"
                  stroke="#EA580C"
                  fill="#EA580C"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Complaints by Category */}
        <section className="jana-card p-6">
          <h2 className="text-sm font-bold text-[#102A56]">
            Complaints by Category (Live Application Data)
          </h2>
          <p className="text-xs text-[#63718A] mt-0.5 mb-4">
            Breakdown of registered grievances across the 7 civic categories.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Count" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Complaints by Department */}
        <section className="jana-card p-6">
          <h2 className="text-sm font-bold text-[#102A56]">
            Complaints by Department (Live Application Data)
          </h2>
          <p className="text-xs text-[#63718A] mt-0.5 mb-4">
            Ticket distribution across Hyderabad demonstration departments.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical">
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
                <Bar dataKey="Count" fill="#16A34A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Priority Distribution */}
        <section className="jana-card p-6">
          <h2 className="text-sm font-bold text-[#102A56]">
            Priority Distribution (Live Application Data)
          </h2>
          <p className="text-xs text-[#63718A] mt-0.5 mb-4">
            Proportion of CRITICAL, HIGH, MEDIUM, and LOW urgency complaints.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {priorityData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PRIORITY_COLORS[entry.name] || '#1D4ED8'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};
