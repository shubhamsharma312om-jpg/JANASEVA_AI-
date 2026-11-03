import { GrievanceStatus, LanguageCode, PriorityLevel } from '../types/janaseva';

export function formatStatusLabel(status: GrievanceStatus | string): string {
  const upper = (status || '').toUpperCase();
  if (upper === 'SUBMITTED') return 'Submitted';
  if (upper === 'ROUTED' || upper === 'ASSIGNED') return 'Assigned';
  if (upper === 'IN_PROGRESS') return 'In Progress';
  if (upper === 'RESOLVED' || upper === 'CLOSED') return 'Resolved';
  if (upper === 'REJECTED') return 'Rejected';
  return status;
}

export function getStatusColorClass(status: GrievanceStatus | string): string {
  const upper = (status || '').toUpperCase();
  if (upper === 'RESOLVED' || upper === 'CLOSED') return 'text-emerald-700 font-semibold';
  if (upper === 'IN_PROGRESS') return 'text-blue-700 font-semibold';
  if (upper === 'ROUTED' || upper === 'ASSIGNED') return 'text-amber-700 font-semibold';
  if (upper === 'REJECTED') return 'text-red-700 font-semibold';
  return 'text-slate-700 font-semibold';
}

export function getPriorityColorClass(priority: PriorityLevel | string): string {
  const upper = (priority || '').toUpperCase();
  if (upper === 'CRITICAL') return 'text-red-700 font-semibold';
  if (upper === 'HIGH') return 'text-orange-700 font-semibold';
  if (upper === 'MEDIUM') return 'text-blue-700 font-medium';
  return 'text-slate-600 font-medium';
}

export function formatLanguageName(code: LanguageCode | string): string {
  if (code === 'te') return 'Telugu (తెలుగు)';
  if (code === 'hi') return 'Hindi (हिन्दी)';
  return 'English';
}

export function formatDateShort(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function parseMessageAndLocation(rawMessage: string): {
  description: string;
  location: string;
} {
  if (!rawMessage) return { description: '', location: 'Hyderabad, Telangana' };
  const parts = rawMessage.split(' | Location: ');
  return {
    description: parts[0].trim(),
    location: parts[1] ? parts[1].trim() : 'Hyderabad Municipal Area',
  };
}
