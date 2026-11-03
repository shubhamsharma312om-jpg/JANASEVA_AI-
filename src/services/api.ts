/**
 * JANASEVA AI — Frontend API Service Configuration
 * Exports both Phase 1 health/department helpers and the full-application apiService.
 */

export { apiService, CATEGORY_TO_DEPARTMENT } from './api/index';

export interface HealthResponse {
  status: string;
  project: string;
  tagline: string;
  phase: string;
  pilot_location: string;
  supported_languages: string[];
  database_status: string;
  sqlite_tables?: string[];
  seeded_departments_count: number;
  timestamp: string;
}

export interface CategoryMappingItem {
  category: string;
  department_id: string;
  department_name: string;
  default_sla_hours: number;
  description: string;
}

export interface DepartmentItem {
  department_id: string;
  department_name: string;
  supported_categories: string[];
  is_active: boolean;
}

export interface DepartmentListResponse {
  pilot_location: string;
  disclaimer: string;
  departments: DepartmentItem[];
  category_mappings: CategoryMappingItem[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function getSystemHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to verify backend health`);
  }
  return res.json();
}

export async function getDepartments(): Promise<DepartmentListResponse> {
  const res = await fetch(`${API_BASE}/departments/`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to fetch departments`);
  }
  return res.json();
}
