/**
 * JANASEVA AI — Frontend API Service Configuration (Phase 1)
 * Centralizes HTTP communication between the React frontend and FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Fetch system and SQLite health status from GET /api/health
 */
export async function fetchSystemHealth() {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Health check failed with HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch configured demonstration departments and category mappings from GET /api/departments/
 */
export async function fetchDepartments() {
  const response = await fetch(`${API_BASE_URL}/departments/`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Department fetch failed with HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Track a citizen grievance by ticket ID (GET /api/grievances/{ticket_id})
 */
export async function fetchGrievanceByTicketId(ticketId) {
  const response = await fetch(
    `${API_BASE_URL}/grievances/${encodeURIComponent(ticketId)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
    }
  );

  if (!response.ok) {
    throw new Error(`Ticket lookup returned HTTP ${response.status}`);
  }

  return response.json();
}
