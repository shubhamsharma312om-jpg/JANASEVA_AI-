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

export type ProvisionalPriority = 'low' | 'normal' | 'high' | 'critical';

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

export type GrievanceIntentType =
  | 'CIVIC_GRIEVANCE'
  | 'GREETING'
  | 'GENERAL_QUESTION'
  | 'UNRELATED_QUERY'
  | 'AMBIGUOUS_REQUEST'
  | 'EMERGENCY_OR_IMMEDIATE_DANGER';

export interface ExtractedLocation {
  village: string | null;
  town?: string | null;
  city: string | null;
  district: string | null;
  mandal?: string | null;
  ward?: string | null;
  area: string | null;
  street: string | null;
  house_number: string | null;
  landmark: string | null;
  pincode?: string | null;
  additional_location_details: string | null;
}

export interface IdentifiedCivicIssue {
  issue_number: number;
  category: GrievanceCategory | string;
  department_name: string;
  department_id: string;
  problem_summary: string;
  priority: ProvisionalPriority;
  confidence_score: number;
  extracted_location?: string | null;
}

export interface GrievanceAIAnalysisResult {
  original_transcript: string;
  detected_language: string;
  intent_type?: GrievanceIntentType | string;
  is_valid_grievance?: boolean;
  citizen_name: string | null;
  contact_number: string | null;
  email: string | null;
  citizen_reference_id?: string | null;
  designation: string | null;
  problem_summary: string;
  problem_description: string;
  location: ExtractedLocation;
  problem_duration: string | null;
  incident_date: string | null;
  affected_people: string | null;
  department_category: GrievanceCategory | string | null;
  department_name: string | null;
  department_id: string | null;
  classification_explanation?: string;
  priority: ProvisionalPriority;
  priority_reason: string;
  safety_advisory?: string | null;
  missing_information: string[];
  missing_mandatory_fields?: string[];
  needs_clarification: boolean;
  clarification_question: string | null;
  enhanced_complaint: string;
  confidence_score?: number;
  confidence_band?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  secondary_categories?: string[];
  identified_issues?: IdentifiedCivicIssue[];
  processing_source?: 'gemini' | 'hybrid' | 'python_fallback' | 'failed' | string;
  ai_provider_used?: string;
  llm_api_configured?: boolean;
  missing_env_vars?: string[];
  provenance_details?: Record<string, any>;
}

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
