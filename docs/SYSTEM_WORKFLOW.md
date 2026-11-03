# JANASEVA AI — 10-Stage Core System Workflow

```text
Citizen Message
      ↓
1. Language Identification
      ↓
2. Multilingual Text Processing
      ↓
3. Grievance Classification
      ↓
4. Department Prediction
      ↓
5. Priority Assessment
      ↓
6. Ticket Generation
      ↓
7. Database Storage
      ↓
8. Citizen Tracking
      ↓
9. Administrator Status Updates
```

---

## Stage-by-Stage Responsibilities

### Stage 1: Citizen Message Ingestion
- **Responsibility:** Captures raw unstructured grievance input submitted by a citizen in their natural regional language (**English**, **Telugu**, or **Hindi**).
- **Validation:** Pydantic (`GrievanceCreateRequest`) validates character length (`10` to `2000` characters), strips control characters, and ensures optional citizen PII (`name`, `contact_info`) is handled with privacy-by-design defaults.

### Stage 2: Language Identification (`ai_engine.detect_language`)
- **Responsibility:** Automatically detects the script and language code (`en`, `te`, or `hi`) of the incoming citizen text, including Unicode block inspection (Devanagari `\u0900–\u097F` for Hindi, Telugu `\u0C00–\u0C7F` for Telugu, Latin for English) and statistical/neural language identification in Phase 2.

### Stage 3: Multilingual Text Processing (`ai_engine.preprocess_and_translate`)
- **Responsibility:** Cleans noise, normalizes Unicode characters, handles code-mixed regional terms, and generates an optional English reference translation (`translated_message`) while strictly preserving the citizen's `original_message` verbatim for legal/civic accountability.

### Stage 4: Grievance Classification (`ai_engine.classify_grievance`)
- **Responsibility:** Evaluates the processed text against the 7 civic grievance categories:
  1. `Water Supply`
  2. `Roads and Potholes`
  3. `Garbage Collection`
  4. `Electricity`
  5. `Streetlights`
  6. `Drainage`
  7. `Public Safety`
- **Output:** Produces both the `predicted_category` and a calibrated `confidence_score` $\in [0.0, 1.0]$. If confidence falls below a configurable threshold in Phase 2, the ticket is flagged for manual triage.

### Stage 5: Department Prediction (`ai_engine.resolve_department`)
- **Responsibility:** Looks up the `predicted_category` in the externalized configuration file (`backend/app/core/department_mapping.json`) to assign the responsible municipal authority (e.g., `Water Supply` $\rightarrow$ `Water Supply Department`, `Roads and Potholes` $\rightarrow$ `Municipal Engineering`).

### Stage 6: Priority Assessment (`ai_engine.assess_priority`)
- **Responsibility:** Determines ticket urgency (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) by combining category baseline urgency (e.g., `Public Safety` and live `Electricity` hazards) with severity indicators in the citizen's message (such as multi-day water outages, open manholes, or hospital/school proximity).

### Stage 7: Ticket Generation (`grievance_service.generate_ticket_id`)
- **Responsibility:** Generates a unique, human-readable tracking identifier scoped to the Hyderabad pilot (`JANA-HYD-2026-XXXXXX`) and an anonymous `citizen_id` (`CIT-2026-XXXXXX`), initializing the ticket lifecycle state to `SUBMITTED` / `ROUTED`.

### Stage 8: Database Storage (`SQLite Persistence`)
- **Responsibility:** Atomically commits the `Citizen` record, `Grievance` record, and initial `GrievanceHistory` audit entry into SQLite (`janaseva.db`) within a single database transaction with foreign key enforcement (`PRAGMA foreign_keys = ON`).

### Stage 9: Citizen Tracking (`GET /api/grievances/{ticket_id}`)
- **Responsibility:** Enables citizens to query their `ticket_id` at any time to view real-time status (`SUBMITTED`, `ROUTED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), the assigned department, priority level, and full chronological history without requiring user login credentials.

### Stage 10: Administrator Status Updates (`PATCH /api/grievances/{ticket_id}/status`)
- **Responsibility:** Allows municipal officials in the assigned department to update ticket progress, add field inspection remarks, and transition the ticket state while automatically recording an immutable audit entry in `grievance_history`.
