import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Building2, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { GrievanceRecord } from '../../types/janaseva';
import { StatusTimeline } from '../../components/common/StatusTimeline';
import { ReadAloudButton } from '../../components/common/ReadAloudButton';
import {
  formatDateTime,
  formatLanguageName,
  getPriorityColorClass,
  getStatusColorClass,
  parseMessageAndLocation,
} from '../../utils/formatters';
import { getVisualAssetForDepartmentOrCategory } from '../../utils/departmentAssets';

export const TrackComplaintPage: React.FC = () => {
  const { grievances, findGrievanceByTicketId } = useApp();
  const {
    t,
    translateCategory,
    translateDepartment,
    translateStatus,
    translatePriority,
  } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTicket = searchParams.get('ticket') || 'JANA-HYD-2026-1042';

  const [ticketInput, setTicketInput] = useState(initialTicket);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<GrievanceRecord | null>(null);
  const [notFoundError, setNotFoundError] = useState<string | null>(null);

  const performLookup = (ticketId: string) => {
    const clean = ticketId.trim().toUpperCase();
    if (!clean) {
      setResult(null);
      setNotFoundError('Please enter a valid JANASEVA Ticket ID.');
      return;
    }
    setSearching(true);
    setNotFoundError(null);

    setTimeout(() => {
      const found = findGrievanceByTicketId(clean);
      if (found) {
        setResult(found);
        setNotFoundError(null);
      } else {
        setResult(null);
        setNotFoundError(
          `No grievance record found matching Ticket ID "${clean}". Please verify the ID or select one of the active demo tickets below.`
        );
      }
      setSearching(false);
    }, 150);
  };

  useEffect(() => {
    if (initialTicket) {
      performLookup(initialTicket);
    }
  }, [grievances]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ ticket: ticketInput.trim().toUpperCase() });
    performLookup(ticketInput);
  };

  const sampleTickets = grievances.slice(0, 4).map((g) => g.ticket_id);
  const parsed = result
    ? parseMessageAndLocation(result.original_message)
    : { description: '', location: '' };
  const visualAsset = result
    ? getVisualAssetForDepartmentOrCategory(
        result.predicted_category || result.assigned_department
      )
    : null;

  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
      {/* Search Box Card */}
      <section className="jana-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-[#102A56]">
          {t('track.title')}
        </h1>
        <p className="text-xs text-[#63718A] mt-1 mb-6">
          {t('track.subtitle')}
        </p>

        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            placeholder={t('track.placeholder')}
            aria-label="Ticket ID"
            className="flex-1 px-4 py-2.5 text-sm font-mono bg-[#FFFCF7] border border-sky-300/80 rounded-xl focus:outline-none focus:border-[#1D4ED8]"
          />
          <button
            type="submit"
            disabled={searching}
            className="jana-btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            <span>
              {searching ? t('common.searching') : t('track.button')}
            </span>
          </button>
        </form>

        {/* Quick Sample Ticket Selectors */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#63718A]">
          <span>{t('track.activeDemoTickets')}</span>
          {sampleTickets.map((tid) => (
            <button
              key={tid}
              type="button"
              onClick={() => {
                setTicketInput(tid);
                setSearchParams({ ticket: tid });
                performLookup(tid);
              }}
              className="font-mono text-[#1D4ED8] hover:underline cursor-pointer"
            >
              {tid}
            </button>
          ))}
        </div>
      </section>

      {/* Error State for Invalid Ticket ID */}
      {notFoundError && (
        <section className="jana-card border-red-200 p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-semibold text-red-900">
              {t('track.notFoundTitle')}
            </h2>
            <p className="text-xs text-red-700 mt-1">{notFoundError}</p>
          </div>
        </section>
      )}

      {/* Result Details Card & Progress Timeline */}
      {result && !searching && (
        <section className="jana-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-sky-200/70">
            <div>
              <div className="text-xs text-[#63718A]">
                {t('table.ticketId')}
              </div>
              <h2 className="text-xl font-bold font-mono text-[#102A56] mt-0.5">
                {result.ticket_id}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="text-[#63718A]">
                  {t('track.currentStatus')}:{' '}
                </span>
                <span className={getStatusColorClass(result.status)}>
                  {translateStatus(result.status)}
                </span>
              </div>
              <span className="text-slate-300">·</span>
              <div>
                <span className="text-[#63718A]">{t('track.priority')}: </span>
                <span className={getPriorityColorClass(result.priority)}>
                  {translatePriority(result.priority)}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Department Banner Card */}
          {visualAsset && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-[#FFFCF7] border border-sky-200/80">
              <div className="md:col-span-5 aspect-video rounded-lg overflow-hidden border border-sky-200/70 bg-slate-900">
                <img
                  src={visualAsset.bannerImage}
                  alt={result.assigned_department}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="md:col-span-7 space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#1D4ED8] font-semibold">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>{t('track.assignedDepartment')}</span>
                </div>
                <div className="text-base font-bold text-[#102A56]">
                  {translateDepartment(result.assigned_department)}
                </div>
                <p className="text-xs text-[#63718A]">
                  <strong className="text-[#102A56]">
                    {translateCategory(result.predicted_category)}
                  </strong>{' '}
                  · {visualAsset.motto}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            <div>
              <div className="text-[#63718A]">
                {t('review.identifiedCategory')}
              </div>
              <div className="text-sm font-semibold text-[#102A56] mt-0.5">
                {translateCategory(result.predicted_category)}
              </div>
            </div>
            <div>
              <div className="text-[#63718A]">
                {t('track.assignedDepartment')}
              </div>
              <div className="text-sm font-semibold text-[#1D4ED8] mt-0.5">
                {translateDepartment(result.assigned_department)}
              </div>
            </div>
            <div>
              <div className="text-[#63718A]">
                {t('track.submissionDate')}
              </div>
              <div className="text-sm font-semibold text-[#102A56] font-mono tabular-nums mt-0.5">
                {formatDateTime(result.created_at)}
              </div>
            </div>
            <div>
              <div className="text-[#63718A]">
                {t('track.languageAndLocation')}
              </div>
              <div className="text-sm font-semibold text-[#102A56] mt-0.5 truncate">
                {formatLanguageName(result.detected_language)} ·{' '}
                {parsed.location}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFCF7] border border-sky-200/80 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-semibold text-[#63718A]">
                {t('track.description')}
              </div>
              <ReadAloudButton
                text={parsed.description}
                language={result.detected_language}
              />
            </div>
            {/* Original complaint content preserved as submitted */}
            <p className="text-sm text-[#102A56] leading-relaxed">
              {parsed.description}
            </p>
            {result.translated_message && (
              <div className="pt-2 border-t border-sky-200/60 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-xs font-medium text-[#102A56]">
                    {t('track.referenceSummary')}:
                  </strong>
                  <ReadAloudButton
                    text={result.translated_message}
                    language={result.detected_language}
                  />
                </div>
                <p className="text-xs text-[#63718A]">
                  {result.translated_message}
                </p>
              </div>
            )}
          </div>

          {/* Visual Timeline & History */}
          <StatusTimeline
            currentStatus={result.status}
            history={result.history || []}
          />
        </section>
      )}
    </div>
  );
};
