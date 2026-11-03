import {
  DepartmentRecord,
  GrievanceCategory,
  GrievanceRecord,
  LanguageCode,
  PriorityLevel,
} from '../../types/janaseva';
import { INITIAL_DEPARTMENTS, localStore } from '../storage/localStore';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const CATEGORY_TO_DEPARTMENT: Record<GrievanceCategory, string> = {
  'Water Supply': 'Water Supply Department',
  'Roads and Potholes': 'Municipal Engineering',
  'Garbage Collection': 'Sanitation Department',
  Electricity: 'Electricity Department',
  Streetlights: 'Electrical Maintenance',
  Drainage: 'Drainage Department',
  'Public Safety': 'Relevant Civic Authority',
};

export const apiService = {
  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async fetchDepartments(): Promise<{
    departments: DepartmentRecord[];
    fromBackend: boolean;
  }> {
    try {
      const res = await fetch(`${API_BASE}/departments/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const mappings = data.category_mappings || [];
      const merged: DepartmentRecord[] = (data.departments || []).map((d: any) => {
        const match = mappings.find((m: any) => m.department_id === d.department_id);
        return {
          department_id: d.department_id,
          department_name: d.department_name,
          supported_categories: d.supported_categories || [],
          is_active: Boolean(d.is_active),
          default_sla_hours: match?.default_sla_hours || 24,
          description:
            match?.description ||
            'Configured Hyderabad municipal demonstration department.',
          assigned_complaints_count: d.assigned_complaints_count ?? 0,
        };
      });
      if (merged.length > 0) {
        localStore.setDepartments(merged);
        return { departments: merged, fromBackend: true };
      }
    } catch {
      // Fallback to localStore
    }
    return { departments: localStore.getDepartments(), fromBackend: false };
  },

  async fetchGrievances(): Promise<{
    grievances: GrievanceRecord[];
    fromBackend: boolean;
  }> {
    try {
      const res = await fetch(`${API_BASE}/grievances/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStore.setGrievances(data);
        return { grievances: data, fromBackend: true };
      }
    } catch {
      // Fallback to localStore
    }
    return { grievances: localStore.getGrievances(), fromBackend: false };
  },

  async createGrievance(payload: {
    original_message: string;
    category: GrievanceCategory;
    language: LanguageCode;
    priority?: PriorityLevel;
    citizen_id: string;
    citizen_name?: string;
    citizen_contact?: string;
  }): Promise<{ grievance: GrievanceRecord; fromBackend: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/grievances/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created: GrievanceRecord = await res.json();
        const current = localStore.getGrievances();
        localStore.setGrievances([created, ...current]);
        return { grievance: created, fromBackend: true };
      }
    } catch {
      // Fallback to persistent local demo storage if backend endpoint returns 501 or offline
    }

    const now = new Date().toISOString();
    const randomToken = Math.floor(1000 + Math.random() * 9000);
    const ticket_id = `JANA-HYD-2026-${randomToken}`;
    const assigned_department =
      CATEGORY_TO_DEPARTMENT[payload.category] || 'Relevant Civic Authority';

    const fallbackRecord: GrievanceRecord = {
      ticket_id,
      citizen_id: payload.citizen_id,
      original_message: payload.original_message,
      detected_language: payload.language,
      translated_message: null,
      predicted_category: payload.category,
      assigned_department,
      priority: payload.priority || 'MEDIUM',
      confidence_score: 1.0,
      status: 'SUBMITTED',
      created_at: now,
      updated_at: now,
      citizen_name: payload.citizen_name || null,
      citizen_contact: payload.citizen_contact || null,
      history: [
        {
          history_id: Date.now(),
          ticket_id,
          previous_status: null,
          new_status: 'SUBMITTED',
          remarks: `Complaint registered (Demo Persistence) and routed to ${assigned_department}.`,
          timestamp: now,
        },
      ],
    };

    const existing = localStore.getGrievances();
    localStore.setGrievances([fallbackRecord, ...existing]);
    return { grievance: fallbackRecord, fromBackend: false };
  },

  async updateGrievanceStatus(
    ticketId: string,
    payload: {
      new_status: string;
      priority: PriorityLevel;
      assigned_department: string;
      remarks: string;
    }
  ): Promise<{ grievance: GrievanceRecord; fromBackend: boolean }> {
    try {
      const res = await fetch(
        `${API_BASE}/grievances/${encodeURIComponent(ticketId)}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        const updated: GrievanceRecord = await res.json();
        const list = localStore
          .getGrievances()
          .map((g) => (g.ticket_id === ticketId ? updated : g));
        localStore.setGrievances(list);
        return { grievance: updated, fromBackend: true };
      }
    } catch {
      // Fallback to local persistence
    }

    const now = new Date().toISOString();
    const list = localStore.getGrievances();
    let updatedItem: GrievanceRecord | null = null;
    const nextList = list.map((g) => {
      if (g.ticket_id !== ticketId) return g;
      const newHist = {
        history_id: Date.now(),
        ticket_id: ticketId,
        previous_status: g.status,
        new_status: payload.new_status,
        remarks: payload.remarks,
        timestamp: now,
      };
      updatedItem = {
        ...g,
        status: payload.new_status as any,
        priority: payload.priority,
        assigned_department: payload.assigned_department,
        updated_at: now,
        history: [...(g.history || []), newHist],
      };
      return updatedItem;
    });
    localStore.setGrievances(nextList);
    if (!updatedItem) {
      throw new Error(`Ticket ${ticketId} not found`);
    }
    return { grievance: updatedItem, fromBackend: false };
  },

  async updateDepartmentStatus(
    departmentId: string,
    isActive: boolean
  ): Promise<void> {
    try {
      await fetch(`${API_BASE}/departments/${encodeURIComponent(departmentId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      });
    } catch {
      // ignore offline error; localStore is updated by caller
    }
  },
};
