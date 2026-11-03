import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusTimeline } from '../../components/common/StatusTimeline';
import {
  formatDateTime,
  formatLanguageName,
  formatStatusLabel,
  getPriorityColorClass,
  getStatusColorClass,
  parseMessageAndLocation,
} from '../../utils/formatters';
import { getVisualAssetForDepartmentOrCategory } from '../../utils/departmentAssets';

export const CitizenComplaintDetailsPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { findGrievanceByTicketId } = useApp();

  const grievance = ticketId ? findGrievanceByTicketId(ticketId) : undefined;

  if (!grievance) {
    return (
      <div className="jana-card p-8 space-y-4">
        <h1 className="text-xl font-bold text-[#102A56]">
          Complaint Ticket Not Found
        </h1>
        <p className="text-xs text-[#63718A]">
          No grievance record found matching Ticket ID &ldquo;{ticketId}&rdquo;.
        </p>
        <Link
          to="/citizen/complaints"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#1D4ED8] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Complaints</span>
        </Link>
      </div>
    );
  }

  const parsed = parseMessageAndLocation(grievance.original_message);
  const visualAsset = getVisualAssetForDepartmentOrCategory(
    grievance.predicted_category || grievance.assigned_department
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/citizen/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#63718A] hover:text-[#102A56]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Complaints</span>
        </Link>
      </div>

      <section className="jana-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-sky-200/70">
          <div>
            <div className="text-xs text-[#63718A]">Ticket ID</div>
            <h1 className="text-2xl font-bold font-mono text-[#102A56] mt-0.5">
              {grievance.ticket_id}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div>
              <span className="text-[#63718A]">Status: </span>
              <span className={getStatusColorClass(grievance.status)}>
                {formatStatusLabel(grievance.status)}
              </span>
            </div>
            <span className="text-slate-300">·</span>
            <div>
              <span className="text-[#63718A]">Priority: </span>
              <span className={getPriorityColorClass(grievance.priority)}>
                {grievance.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Department Banner & Infrastructure Visual Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-xl bg-[#FFFCF7] border border-sky-200/80">
          <div className="md:col-span-5 aspect-video rounded-lg overflow-hidden border border-sky-200/70 bg-slate-900">
            <img
              src={visualAsset.bannerImage}
              alt={grievance.assigned_department}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1D4ED8]">
              <Building2 className="w-4 h-4" />
              <span>Assigned Municipal Wing</span>
            </div>
            <div className="text-lg font-bold text-[#102A56]">
              {grievance.assigned_department}
            </div>
            <p className="text-xs text-[#63718A]">
              Category:{' '}
              <strong className="text-[#102A56]">
                {grievance.predicted_category}
              </strong>{' '}
              · {visualAsset.motto}
            </p>
            {visualAsset.galleryImages.length > 1 && (
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-[#63718A] mb-1.5">
                  Department Field Operations &amp; Infrastructure Reference:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {visualAsset.galleryImages.slice(1, 4).map((img) => (
                    <div
                      key={img.src}
                      className="aspect-video rounded-md overflow-hidden border border-sky-200/70 bg-slate-900"
                    >
                      <img
                        src={img.src}
                        alt={img.caption}
                        title={img.caption}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
          <div>
            <div className="text-[#63718A]">Category</div>
            <div className="text-sm font-semibold text-[#102A56] mt-0.5">
              {grievance.predicted_category}
            </div>
          </div>
          <div>
            <div className="text-[#63718A]">Assigned Department</div>
            <div className="text-sm font-semibold text-[#1D4ED8] mt-0.5">
              {grievance.assigned_department}
            </div>
          </div>
          <div>
            <div className="text-[#63718A]">Submission Date</div>
            <div className="text-sm font-semibold text-[#102A56] font-mono tabular-nums mt-0.5">
              {formatDateTime(grievance.created_at)}
            </div>
          </div>
          <div>
            <div className="text-[#63718A]">Language &amp; Location</div>
            <div className="text-sm font-semibold text-[#102A56] mt-0.5">
              {formatLanguageName(grievance.detected_language)} ·{' '}
              {parsed.location}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFCF7] border border-sky-200/80 space-y-2">
          <div className="text-xs font-semibold text-[#63718A]">
            Full Complaint Description
          </div>
          <p className="text-sm text-[#102A56] leading-relaxed">
            {parsed.description}
          </p>
          {grievance.translated_message && (
            <p className="text-xs text-[#63718A] pt-2 border-t border-sky-200/60">
              <strong className="font-medium text-[#102A56]">
                Reference Translation:
              </strong>{' '}
              {grievance.translated_message}
            </p>
          )}
        </div>

        <StatusTimeline
          currentStatus={grievance.status}
          history={grievance.history || []}
        />
      </section>
    </div>
  );
};
