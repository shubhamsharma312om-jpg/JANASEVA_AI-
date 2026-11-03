import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { GrievanceHistoryRecord, GrievanceStatus } from '../../types/janaseva';
import { formatDateTime, formatStatusLabel } from '../../utils/formatters';

interface StatusTimelineProps {
  currentStatus: GrievanceStatus | string;
  history?: GrievanceHistoryRecord[];
}

const STEPS = [
  { key: 'SUBMITTED', label: 'Submitted', desc: 'Complaint registered with Ticket ID' },
  { key: 'ROUTED', label: 'Assigned', desc: 'Mapped & routed to Civic Department' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Field team resolving grievance' },
  { key: 'RESOLVED', label: 'Resolved', desc: 'Issue verified & closed' },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  history = [],
}) => {
  const upper = (currentStatus || 'SUBMITTED').toUpperCase();
  const isRejected = upper === 'REJECTED';

  const getActiveStepIndex = (): number => {
    if (upper === 'SUBMITTED') return 0;
    if (upper === 'ROUTED' || upper === 'ASSIGNED') return 1;
    if (upper === 'IN_PROGRESS') return 2;
    if (upper === 'RESOLVED' || upper === 'CLOSED') return 3;
    return 0;
  };

  const activeIdx = getActiveStepIndex();

  return (
    <div className="space-y-6">
      {/* Visual 4-Stage Progress Bar */}
      {isRejected ? (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-red-900">
              Grievance Marked as Rejected
            </div>
            <p className="text-xs text-red-700 mt-0.5">
              Please review the administrator remarks in the status history below for details.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {STEPS.map((step, index) => {
            const isCompleted = index <= activeIdx;
            const isCurrent = index === activeIdx;
            return (
              <div
                key={step.key}
                className={`p-4 rounded-lg border transition-colors ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/50'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 bg-slate-50/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-slate-500">
                    0{index + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        isCurrent ? 'text-blue-600' : 'text-emerald-600'
                      }`}
                    />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {step.label}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{step.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Chronological Audit Log */}
      {history.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">
            Status History &amp; Official Remarks
          </h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg bg-white">
            {history.map((item) => (
              <div
                key={item.history_id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">
                    {item.previous_status
                      ? `${formatStatusLabel(item.previous_status)} → ${formatStatusLabel(
                          item.new_status
                        )}`
                      : `Initial Status: ${formatStatusLabel(item.new_status)}`}
                  </div>
                  <p className="text-slate-600 mt-0.5">{item.remarks}</p>
                </div>
                <div className="font-mono text-slate-500 shrink-0 tabular-nums">
                  {formatDateTime(item.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
