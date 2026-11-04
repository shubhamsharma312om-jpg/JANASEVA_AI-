import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, FilePlus2, Mic, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  formatDateShort,
  getPriorityColorClass,
  getStatusColorClass,
  parseMessageAndLocation,
} from '../../utils/formatters';
import {
  DEPARTMENT_VISUAL_ASSETS,
  getVisualAssetForDepartmentOrCategory,
} from '../../utils/departmentAssets';
import { VoiceComplaintModal } from '../../components/citizen/VoiceComplaintModal';
import { LanguageCode } from '../../types/janaseva';

export const CitizenDashboardPage: React.FC = () => {
  const { user, grievances } = useApp();
  const {
    t,
    translateCategory,
    translateDepartment,
    translateStatus,
    translatePriority,
  } = useLanguage();
  const navigate = useNavigate();

  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

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

  const handleContinueFromVoiceModal = (payload: {
    transcript: string;
    detectedLanguage: LanguageCode;
  }) => {
    setVoiceModalOpen(false);
    navigate('/citizen/register', {
      state: {
        voiceTranscript: payload.transcript,
        detectedLanguage: payload.detectedLanguage,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="jana-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#102A56]">
            {t('dashboard.welcome')}, {user?.name || 'Arjun Reddy'}
          </h1>
          <p className="text-xs text-[#63718A] mt-1">
            {t('dashboard.citizenId')}:{' '}
            <span className="font-mono">{citizenId}</span> ·{' '}
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/citizen/register')}
            className="jana-btn-accent px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
          >
            {t('nav.registerNewComplaint')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/citizen/track')}
            className="jana-btn-secondary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
          >
            {t('dashboard.trackByTicket')}
          </button>
        </div>
      </section>

      {/* FEATURE 2: VOICE-FIRST CITIZEN DASHBOARD HERO ACTION */}
      <section className="jana-card p-6 sm:p-8 border-2 border-[#123B78]/40 bg-gradient-to-br from-[#FFFCF7] via-sky-50/60 to-[#87CEFA]/25">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Large Circular Microphone Button */}
            <button
              type="button"
              onClick={() => setVoiceModalOpen(true)}
              aria-label={t('dashboard.voiceFirst.title')}
              className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#87CEFA] hover:bg-[#48A9E8] border-4 border-[#123B78] flex items-center justify-center text-[#102A56] shadow-[0_0_28px_rgba(135,206,250,0.85)] hover:shadow-[0_0_38px_rgba(72,169,232,0.95)] transition-all duration-300 hover:scale-105 cursor-pointer shrink-0"
            >
              <span className="absolute inset-0 rounded-full border-2 border-[#87CEFA] animate-ping opacity-35 pointer-events-none" />
              <Mic className="w-11 h-11 sm:w-12 sm:h-12 text-[#102A56] transition-transform duration-300 group-hover:scale-110" />
            </button>

            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#123B78]">
                <Mic className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span>{t('dashboard.voiceFirst.badge')}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#102A56]">
                {t('dashboard.voiceFirst.title')}
              </h2>

              <p className="text-sm text-[#102A56]/85 leading-relaxed font-medium">
                {t('dashboard.voiceFirst.subtitle')}
              </p>

              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => setVoiceModalOpen(true)}
                  className="jana-btn-primary px-4 py-2 text-xs font-semibold rounded-xl inline-flex items-center gap-2 cursor-pointer"
                >
                  <Mic className="w-4 h-4 text-[#87CEFA]" />
                  <span>{t('dashboard.voiceFirst.tapToSpeak')}</span>
                </button>

                <Link
                  to="/citizen/register"
                  className="text-xs font-semibold text-[#1D4ED8] hover:underline"
                >
                  {t('dashboard.voiceFirst.orTypeForm')}
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-end text-right text-xs text-[#63718A] space-y-1 shrink-0 border-l border-sky-200/80 pl-6">
            <span className="font-semibold text-[#102A56]">
              Sarvam AI Saaras v4 + Gemini 3.8 Flash
            </span>
            <span>English · తెలుగు · हिन्दी</span>
            <span className="text-[11px]">
              Auto-Extract &amp; Department Classification
            </span>
          </div>
        </div>
      </section>

      {/* Dashboard Statistics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      </section>

      {/* Quick Action Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="jana-card jana-card-interactive p-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-base font-bold text-[#102A56]">
              <FilePlus2 className="w-5 h-5 text-[#EA580C]" />
              <h2>{t('dashboard.quickRegister.title')}</h2>
            </div>
            <p className="text-xs text-[#63718A] leading-relaxed">
              {t('dashboard.quickRegister.desc')}
            </p>
            <Link
              to="/citizen/register"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline pt-1"
            >
              <span>{t('dashboard.quickRegister.link')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="jana-card jana-card-interactive p-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-base font-bold text-[#102A56]">
              <Search className="w-5 h-5 text-[#1D4ED8]" />
              <h2>{t('dashboard.quickTrack.title')}</h2>
            </div>
            <p className="text-xs text-[#63718A] leading-relaxed">
              {t('dashboard.quickTrack.desc')}
            </p>
            <Link
              to="/citizen/track"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline pt-1"
            >
              <span>{t('dashboard.quickTrack.link')}</span>
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
              {t('dashboard.quickDept.title')}
            </h2>
            <p className="text-xs text-[#63718A] mt-0.5">
              {t('dashboard.quickDept.desc')}
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
                  {translateCategory(dept.category)}
                </div>
                <div className="text-[11px] text-[#1D4ED8] font-medium truncate">
                  {translateDepartment(dept.departmentName)}
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
              {t('dashboard.recentComplaints')}
            </h2>
            <p className="text-xs text-[#63718A] mt-0.5">
              {t('dashboard.recentComplaintsDesc')}
            </p>
          </div>
          <Link
            to="/citizen/complaints"
            className="text-xs font-semibold text-[#1D4ED8] hover:underline"
          >
            {t('dashboard.viewAll')} ({myComplaints.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sky-200/70 text-xs text-[#63718A]">
                <th className="py-3 pr-4">{t('table.ticketId')}</th>
                <th className="py-3 px-4">{t('table.categoryAndDept')}</th>
                <th className="py-3 px-4">{t('table.date')}</th>
                <th className="py-3 px-4">{t('table.priority')}</th>
                <th className="py-3 px-4">{t('table.status')}</th>
                <th className="py-3 pl-4 text-right">{t('table.action')}</th>
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
                            {translateCategory(item.predicted_category)}
                          </div>
                          <div className="text-[11px] text-[#1D4ED8] font-medium whitespace-nowrap">
                            {translateDepartment(item.assigned_department)}
                          </div>
                          {/* Original complaint text preserved without UI-language overwrite */}
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
                      {translatePriority(item.priority)}
                    </td>
                    <td
                      className={`py-3.5 px-4 whitespace-nowrap ${getStatusColorClass(
                        item.status
                      )}`}
                    >
                      {translateStatus(item.status)}
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      <Link
                        to={`/citizen/complaints/${item.ticket_id}`}
                        className="font-semibold text-[#1D4ED8] hover:underline"
                      >
                        {t('common.viewDetails')}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {myComplaints.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#63718A]">
                    {t('dashboard.emptyComplaints')}
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
          {t('dashboard.recentActivity')}
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
                  {translateStatus(act.new_status)}
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

      {/* Voice Recording Modal */}
      <VoiceComplaintModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onContinueToAnalysis={handleContinueFromVoiceModal}
      />
    </div>
  );
};
