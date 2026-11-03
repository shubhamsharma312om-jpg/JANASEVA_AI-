import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PriorityLevel } from '../../types/janaseva';
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

export const AdminComplaintDetailsPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const {
    findGrievanceByTicketId,
    departments,
    updateComplaintByAdmin,
  } = useApp();

  const grievance = ticketId ? findGrievanceByTicketId(ticketId) : undefined;

  const [selectedDepartment, setSelectedDepartment] = useState(
    grievance?.assigned_department || 'Water Supply Department'
  );
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel>(
    (grievance?.priority as PriorityLevel) || 'MEDIUM'
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    grievance?.status || 'SUBMITTED'
  );
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (grievance) {
      setSelectedDepartment(grievance.assigned_department);
      setSelectedPriority(grievance.priority as PriorityLevel);
      setSelectedStatus(grievance.status);
    }
  }, [grievance]);

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
          to="/admin/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Complaints</span>
        </Link>
      </div>
    );
  }

  const parsed = parseMessageAndLocation(grievance.original_message);
  const activeVisualAsset = getVisualAssetForDepartmentOrCategory(
    selectedDepartment || grievance.predicted_category
  );

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const officialRemark =
      remarks.trim() ||
      `Status updated to ${formatStatusLabel(
        selectedStatus
      )} (${selectedPriority} priority) by Municipal Administrator.`;

    try {
      const res = await updateComplaintByAdmin(grievance.ticket_id, {
        new_status: selectedStatus,
        priority: selectedPriority,
        assigned_department: selectedDepartment,
        remarks: officialRemark,
      });
      setRemarks('');
      setFeedback(
        res.fromBackend
          ? 'Updated in SQLite (janaseva.db) and logged in grievance_history.'
          : 'Updated in persistent Demo Mode storage and logged in grievance_history.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#63718A] hover:text-[#102A56]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Complaints</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Complete Complaint & Citizen Details + Timeline */}
        <section className="lg:col-span-8 jana-card p-6 sm:p-8 space-y-6">
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

          {/* Assigned Department Banner & Field Infrastructure Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-xl bg-[#FFFCF7] border border-sky-200/80">
            <div className="md:col-span-5 aspect-video rounded-lg overflow-hidden border border-sky-200/70 bg-slate-900">
              <img
                src={activeVisualAsset.bannerImage}
                alt={selectedDepartment}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="md:col-span-7 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1D4ED8]">
                <Building2 className="w-4 h-4" />
                <span>Assigned Municipal Department</span>
              </div>
              <div className="text-lg font-bold text-[#102A56]">
                {selectedDepartment}
              </div>
              <p className="text-xs text-[#63718A]">
                Category:{' '}
                <strong className="text-[#102A56]">
                  {grievance.predicted_category}
                </strong>{' '}
                · {activeVisualAsset.motto}
              </p>
              {activeVisualAsset.galleryImages.length > 1 && (
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-[#63718A] mb-1.5">
                    Department Infrastructure &amp; Field Operations Gallery:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {activeVisualAsset.galleryImages.slice(1, 4).map((img) => (
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

          {/* Citizen & Complaint Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div>
              <div className="text-[#63718A]">Citizen Name &amp; ID</div>
              <div className="text-sm font-semibold text-[#102A56] mt-0.5">
                {grievance.citizen_name || 'Anonymous Citizen'}
              </div>
              <div className="font-mono text-[#63718A]">
                {grievance.citizen_id}
              </div>
            </div>

            <div>
              <div className="text-[#63718A]">
                Citizen Contact (If Provided)
              </div>
              <div className="text-sm font-semibold text-[#102A56] mt-0.5">
                {grievance.citizen_contact ||
                  'Not disclosed (Privacy-by-Design)'}
              </div>
            </div>

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
              <div className="text-[#63718A]">Language &amp; Location</div>
              <div className="text-sm font-semibold text-[#102A56] mt-0.5">
                {formatLanguageName(grievance.detected_language)} ·{' '}
                {parsed.location}
              </div>
            </div>

            <div>
              <div className="text-[#63718A]">Created At</div>
              <div className="text-sm font-semibold font-mono text-[#102A56] mt-0.5">
                {formatDateTime(grievance.created_at)}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFCF7] border border-sky-200/80 space-y-2">
            <div className="text-xs font-semibold text-[#63718A]">
              Citizen Original Message
            </div>
            <p className="text-sm text-[#102A56] leading-relaxed">
              {parsed.description}
            </p>
            {grievance.translated_message && (
              <p className="text-xs text-[#63718A] pt-2 border-t border-sky-200/60">
                <strong className="font-medium text-[#102A56]">
                  Reference Summary:
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

        {/* Right Column: Administrator Action & Triage Console */}
        <aside className="lg:col-span-4 jana-card p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-[#102A56]">
              Update Grievance Status
            </h2>
            <p className="text-xs text-[#63718A] mt-1">
              Changes are recorded in `grievance_history` and immediately
              visible to the citizen on `/track` and `/citizen/complaints`.
            </p>
          </div>

          {feedback && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{feedback}</span>
            </div>
          )}

          <form onSubmit={handleAdminUpdate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#102A56] mb-1.5">
                Complaint Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
              >
                <option value="SUBMITTED">Submitted</option>
                <option value="ROUTED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#102A56] mb-1.5">
                Assigned Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
              >
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_name}>
                    {d.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#102A56] mb-1.5">
                Complaint Priority
              </label>
              <select
                value={selectedPriority}
                onChange={(e) =>
                  setSelectedPriority(e.target.value as PriorityLevel)
                }
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#102A56] mb-1.5">
                Official Remarks / Action Note *
              </label>
              <textarea
                rows={4}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter field inspection details, action taken, or resolution note..."
                className="w-full px-3.5 py-2 text-sm bg-[#FFFCF7] border border-sky-300/80 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="jana-btn-accent w-full py-2.5 px-4 text-sm font-semibold rounded-xl cursor-pointer"
            >
              {saving ? 'Saving Update...' : 'Save & Log Status Change'}
            </button>
          </form>

          <p className="text-[11px] text-[#63718A] border-t border-sky-200/70 pt-3">
            Disclaimer: Updates modify the JANASEVA AI demonstration database
            (`janaseva.db`) and do not dispatch dispatches to external
            government servers.
          </p>
        </aside>
      </div>
    </div>
  );
};
