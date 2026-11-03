-- ============================================================================
-- JANASEVA AI — Phase 1 Initial SQLite Database Schema
-- Track: HI-02 Multilingual Citizen Grievance Chatbot (Hyderabad Pilot)
-- Design Principle: Privacy-by-Design (minimal PII, optional citizen name/contact)
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- A. CITIZENS TABLE
-- Stores minimal citizen metadata. Name and contact information are strictly
-- optional so citizens can report civic issues without mandatory PII disclosure.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS citizens (
    citizen_id TEXT PRIMARY KEY,
    name TEXT NULL,
    contact_info TEXT NULL,
    preferred_language TEXT NOT NULL DEFAULT 'en'
        CHECK (preferred_language IN ('en', 'te', 'hi')),
    created_at TEXT NOT NULL DEFAULT ( strftime('%Y-%m-%dT%H:%M:%SZ', 'now') )
);

-- ----------------------------------------------------------------------------
-- D. DEPARTMENTS TABLE
-- Stores municipal/civic departments and their supported grievance categories
-- (stored as JSON array string for configurability in SQLite).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    department_id TEXT PRIMARY KEY,
    department_name TEXT NOT NULL UNIQUE,
    supported_categories TEXT NOT NULL, -- JSON array of category strings
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT ( strftime('%Y-%m-%dT%H:%M:%SZ', 'now') )
);

-- ----------------------------------------------------------------------------
-- B. GRIEVANCES TABLE
-- Core entity storing citizen complaints, multilingual NLP metadata, predicted
-- category, assigned department, priority level, confidence score, and lifecycle.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grievances (
    ticket_id TEXT PRIMARY KEY,
    citizen_id TEXT NOT NULL,
    original_message TEXT NOT NULL,
    detected_language TEXT NOT NULL
        CHECK (detected_language IN ('en', 'te', 'hi', 'pending')),
    translated_message TEXT NULL,
    predicted_category TEXT NOT NULL,
    assigned_department TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'MEDIUM'
        CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'PENDING')),
    confidence_score REAL NOT NULL DEFAULT 0.0
        CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    status TEXT NOT NULL DEFAULT 'SUBMITTED'
        CHECK (status IN ('SUBMITTED', 'ROUTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED')),
    created_at TEXT NOT NULL DEFAULT ( strftime('%Y-%m-%dT%H:%M:%SZ', 'now') ),
    updated_at TEXT NOT NULL DEFAULT ( strftime('%Y-%m-%dT%H:%M:%SZ', 'now') ),
    FOREIGN KEY (citizen_id) REFERENCES citizens (citizen_id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_department) REFERENCES departments (department_name) ON UPDATE CASCADE
);

-- ----------------------------------------------------------------------------
-- C. GRIEVANCE HISTORY TABLE
-- Immutable audit log tracking every status transition and official remarks
-- for transparent citizen tracking.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grievance_history (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    previous_status TEXT NULL,
    new_status TEXT NOT NULL
        CHECK (new_status IN ('SUBMITTED', 'ROUTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED')),
    remarks TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT ( strftime('%Y-%m-%dT%H:%M:%SZ', 'now') ),
    FOREIGN KEY (ticket_id) REFERENCES grievances (ticket_id) ON DELETE CASCADE
);

-- Indexes for fast citizen ticket lookup, status filtering, and department queues
CREATE INDEX IF NOT EXISTS idx_grievances_citizen_id ON grievances(citizen_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
CREATE INDEX IF NOT EXISTS idx_grievances_department ON grievances(assigned_department);
CREATE INDEX IF NOT EXISTS idx_history_ticket_id ON grievance_history(ticket_id);
