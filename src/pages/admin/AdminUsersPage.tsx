import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateShort, formatLanguageName } from '../../utils/formatters';

export const AdminUsersPage: React.FC = () => {
  const { citizens, grievances, toggleCitizenStatus } = useApp();

  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredCitizens = citizens.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchMobile = c.mobile.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchMobile) return false;
    }
    if (langFilter !== 'ALL' && c.preferred_language !== langFilter) {
      return false;
    }
    if (statusFilter !== 'ALL' && c.account_status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <section className="jana-card p-6">
        <div className="pb-5 border-b border-sky-200/70">
          <h1 className="text-xl font-bold text-[#102A56]">
            Citizen User Management
          </h1>
          <p className="text-xs text-[#63718A] mt-0.5">
            Registered citizen profiles and complaint counts (
            {filteredCitizens.length} records).
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or mobile..."
            className="px-3.5 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
          />

          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="px-3.5 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
          >
            <option value="ALL">All Preferred Languages</option>
            <option value="en">English (en)</option>
            <option value="te">Telugu (te)</option>
            <option value="hi">Hindi (hi)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
          >
            <option value="ALL">All Account Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sky-200/70 text-xs text-[#63718A]">
                <th className="py-3 pr-4">Citizen ID &amp; Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Preferred Language</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4 text-right">Total Complaints</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 text-xs">
              {filteredCitizens.map((cit) => {
                const liveCount = grievances.filter(
                  (g) => g.citizen_id === cit.citizen_id
                ).length;

                return (
                  <tr
                    key={cit.citizen_id}
                    className="hover:bg-sky-50/50 transition-colors"
                  >
                    <td className="py-3.5 pr-4 whitespace-nowrap">
                      <div className="font-bold text-[#102A56]">{cit.name}</div>
                      <div className="font-mono text-[#63718A]">
                        {cit.citizen_id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#102A56] whitespace-nowrap">
                      {cit.email}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#102A56] whitespace-nowrap">
                      {cit.mobile}
                    </td>
                    <td className="py-3.5 px-4 text-[#63718A] whitespace-nowrap">
                      {formatLanguageName(cit.preferred_language)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#63718A] tabular-nums whitespace-nowrap">
                      {formatDateShort(cit.created_at)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-right tabular-nums text-[#1D4ED8] whitespace-nowrap">
                      {liveCount || cit.total_complaints}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={
                          cit.account_status === 'Active'
                            ? 'text-emerald-700 font-semibold'
                            : 'text-red-700 font-semibold'
                        }
                      >
                        {cit.account_status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleCitizenStatus(cit.citizen_id)}
                        className="jana-btn-secondary px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        {cit.account_status === 'Active'
                          ? 'Suspend'
                          : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
