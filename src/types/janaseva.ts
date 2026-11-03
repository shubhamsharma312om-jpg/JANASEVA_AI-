export type LanguageCode = 'en' | 'te' | 'hi';

export type GrievanceCategory =
  | 'Water Supply'
  | 'Roads and Potholes'
  | 'Garbage Collection'
  | 'Electricity'
  | 'Streetlights'
  | 'Drainage'
  | 'Public Safety';

export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Note: In SQLite schema.sql, Assigned is stored as 'ROUTED'.
 * In the UI, we display 'Assigned' for 'ROUTED'/'ASSIGNED'.
 */
export type GrievanceStatus =
  | 'SUBMITTED'
  | 'ROUTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CLOSED';

export interface GrievanceHistoryRecord {
  history_id: number;
  ticket_id: string;
  previous_status: string | null;
  new_status: string;
  remarks: string;
  timestamp: string;
}

export interface GrievanceRecord {
  ticket_id: string;
  citizen_id: string;
  original_message: string;
  detected_language: LanguageCode | string;
  translated_message?: string | null;
  predicted_category: GrievanceCategory | string;
  assigned_department: string;
  priority: PriorityLevel;
  confidence_score: number;
  status: GrievanceStatus;
  created_at: string;
  updated_at: string;
  location?: string;
  locality?: string;
  landmark?: string;
  citizen_name?: string | null;
  citizen_contact?: string | null;
  history: GrievanceHistoryRecord[];
}

export interface DepartmentRecord {
  department_id: string;
  department_name: string;
  supported_categories: string[];
  is_active: boolean;
  default_sla_hours: number;
  description: string;
  assigned_complaints_count?: number;
}

export interface CitizenUserRecord {
  citizen_id: string;
  name: string;
  email: string;
  mobile: string;
  preferred_language: LanguageCode;
  address: string;
  created_at: string;
  total_complaints: number;
  account_status: 'Active' | 'Suspended';
}

export interface AuthUser {
  id: string;
  role: 'citizen' | 'admin';
  name: string;
  email: string;
  mobile: string;
  preferred_language: LanguageCode;
  address: string;
  isDemoAuth: boolean;
}
