# JANASEVA AI — REST API Architecture & Endpoint Specifications

All backend API routes are prefixed with `/api` and validated using Pydantic v2 schemas.

---

## 1. `GET /api/health` (Implemented & Active in Phase 1)

- **HTTP Method:** `GET`
- **Purpose:** Verifies that the FastAPI server is running, the SQLite database (`janaseva.db`) is connected, and the 7 demonstration departments are seeded.
- **Access Requirements:** Public (No authentication required; used by frontend health check and deployment monitors).
- **Expected Request:** No request body or query parameters required.
- **Expected Response (`200 OK`):**
```json
{
  "status": "healthy",
  "project": "JANASEVA AI",
  "tagline": "Every Voice Matters. Every Grievance Counts.",
  "phase": "Phase 1 — Project Foundation and Architecture",
  "pilot_location": "Hyderabad",
  "supported_languages": ["en", "te", "hi"],
  "database_status": "connected",
  "seeded_departments_count": 7,
  "timestamp": "2026-11-03T08:45:00Z"
}
```

---

## 2. `GET /api/departments/` (Implemented & Active in Phase 1)

- **HTTP Method:** `GET`
- **Purpose:** Returns the list of civic departments from SQLite along with the configurable category-to-department mapping (`department_mapping.json`) for the Hyderabad pilot.
- **Access Requirements:** Public (Allows citizens and administrators to inspect supported categories and routing rules).
- **Expected Request:** No request body required.
- **Expected Response (`200 OK`):**
```json
{
  "pilot_location": "Hyderabad",
  "disclaimer": "Demonstration department mappings for Neural Storm 2026 (Track HI-02). Not verified official government routing rules.",
  "departments": [
    {
      "department_id": "DEPT-WATER-01",
      "department_name": "Water Supply Department",
      "supported_categories": ["Water Supply"],
      "is_active": true
    }
  ],
  "category_mappings": [
    {
      "category": "Water Supply",
      "department_id": "DEPT-WATER-01",
      "department_name": "Water Supply Department",
      "default_sla_hours": 24,
      "description": "Piped water supply disruptions, contamination, low pressure, and main pipeline leakages."
    }
  ]
}
```

---

## 3. `POST /api/grievances/` (Contract Defined in Phase 1; NLP Pipeline in Phase 2)

- **HTTP Method:** `POST`
- **Purpose:** Accepts a citizen's grievance message in English (`en`), Telugu (`te`), or Hindi (`hi`), runs the modular NLP pipeline (Language Detection $\rightarrow$ Normalization/Translation $\rightarrow$ Category Classification $\rightarrow$ Department Prediction $\rightarrow$ Priority Assessment), creates a ticket in SQLite, and returns the generated `ticket_id`.
- **Access Requirements:** Public (Privacy-by-Design anonymous or opt-in citizen submission with rate-limiting planned for production).
- **Expected Request Body (`application/json`):**
```json
{
  "original_message": "మా కాలనీలో గత మూడు రోజులుగా మంచినీటి సరఫరా లేదు, వెంటనే పరిష్కరించగలరు.",
  "preferred_language": "te",
  "citizen_name": null,
  "citizen_contact": null
}
```
- **Expected Response (`201 Created` in Phase 2 / `501 Not Implemented` in Phase 1):**
```json
{
  "ticket_id": "JANA-HYD-2026-8F4A2C",
  "citizen_id": "CIT-2026-3B9D1E",
  "original_message": "మా కాలనీలో గత మూడు రోజులుగా మంచినీటి సరఫరా లేదు, వెంటనే పరిష్కరించగలరు.",
  "detected_language": "te",
  "translated_message": "There has been no drinking water supply in our colony for the past three days, please resolve immediately.",
  "predicted_category": "Water Supply",
  "assigned_department": "Water Supply Department",
  "priority": "HIGH",
  "confidence_score": 0.94,
  "status": "ROUTED",
  "created_at": "2026-11-03T08:50:00Z",
  "updated_at": "2026-11-03T08:50:00Z",
  "history": [
    {
      "history_id": 1,
      "ticket_id": "JANA-HYD-2026-8F4A2C",
      "previous_status": null,
      "new_status": "ROUTED",
      "remarks": "Ticket automatically classified and routed to Water Supply Department.",
      "timestamp": "2026-11-03T08:50:00Z"
    }
  ]
}
```

---

## 4. `GET /api/grievances/{ticket_id}`

- **HTTP Method:** `GET`
- **Purpose:** Allows a citizen to track the live status, assigned department, priority, and chronological status history of their grievance using their `ticket_id`.
- **Access Requirements:** Public capability keyed by unguessable `ticket_id` token (`JANA-HYD-2026-XXXXXX`).
- **Expected Request:** Path parameter `ticket_id` (string).
- **Expected Response (`200 OK` or `404 Not Found`):** Returns `GrievanceResponse` JSON object including the ordered `history` array.

---

## 5. `GET /api/grievances/`

- **HTTP Method:** `GET`
- **Purpose:** Lists grievance tickets with optional filtering by `department`, `status`, and `priority` for civic department officers.
- **Access Requirements:** Department Administrator / Official role (open for demonstration in local dev, RBAC token planned for Phase 3).
- **Expected Query Parameters:**
  - `department` (optional string, e.g. `Water Supply Department`)
  - `status` (optional enum: `SUBMITTED`, `ROUTED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REJECTED`)
  - `priority` (optional enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- **Expected Response (`200 OK`):** Array of `GrievanceResponse` objects.

---

## 6. `PATCH /api/grievances/{ticket_id}/status`

- **HTTP Method:** `PATCH`
- **Purpose:** Allows an authorized municipal officer to transition a grievance ticket's status (e.g., `ROUTED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`) and append an official audit remark to `grievance_history`.
- **Access Requirements:** Authorized Municipal Administrator / Department Officer.
- **Expected Request Body (`application/json`):**
```json
{
  "new_status": "IN_PROGRESS",
  "remarks": "Ward 64 pipeline maintenance crew dispatched to inspect main valve."
}
```
- **Expected Response (`200 OK` in Phase 2/3 / `501 Not Implemented` in Phase 1):** Updated `GrievanceResponse` with the newly appended history entry.
