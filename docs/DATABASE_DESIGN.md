# JANASEVA AI — Database Architecture & Schema Design (SQLite)

## 1. Privacy-by-Design Principles

- **Zero Mandatory PII:** Citizens can lodge a grievance in English, Telugu, or Hindi without providing their name, phone number, Aadhaar number, or residential address.
- **Anonymous Tracking:** Every submission generates a unique `ticket_id` (e.g., `JANA-HYD-2026-8F4A2C`) and an internal `citizen_id` (`CIT-2026-8F4A2C`). Citizens use their `ticket_id` to track resolution status.
- **Voluntary Contact:** `name` and `contact_info` are nullable fields stored only when a citizen explicitly opts in for follow-up notifications.

---

## 2. Entity Specifications

### A. `citizens` Table
Stores anonymous or opt-in citizen metadata and regional language preferences.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `citizen_id` | `TEXT` | `PRIMARY KEY` | Unique system-generated identifier (`CIT-YYYY-XXXXXX`). |
| `name` | `TEXT` | `NULL` | Optional citizen name. |
| `contact_info` | `TEXT` | `NULL` | Optional phone or email for status updates. |
| `preferred_language` | `TEXT` | `NOT NULL DEFAULT 'en'`, `CHECK IN ('en','te','hi')` | Citizen's preferred interface/notification language. |
| `created_at` | `TEXT` | `NOT NULL` | ISO-8601 UTC timestamp of record creation. |

---

### B. `grievances` Table
Stores the citizen's raw multilingual complaint, NLP classification metadata, department routing, priority, confidence score, and current lifecycle status.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `ticket_id` | `TEXT` | `PRIMARY KEY` | Public tracking ID (`JANA-HYD-2026-XXXXXX`). |
| `citizen_id` | `TEXT` | `NOT NULL`, `FOREIGN KEY -> citizens(citizen_id)` | Reference to the submitting citizen record. |
| `original_message` | `TEXT` | `NOT NULL` | Raw grievance text in English, Telugu, or Hindi. |
| `detected_language` | `TEXT` | `NOT NULL`, `CHECK IN ('en','te','hi','pending')` | Language detected by Stage 2 of the NLP pipeline. |
| `translated_message` | `TEXT` | `NULL` | Optional English/canonical translation for municipal officers. |
| `predicted_category` | `TEXT` | `NOT NULL` | Predicted civic category (e.g., `Water Supply`, `Drainage`). |
| `assigned_department` | `TEXT` | `NOT NULL`, `FOREIGN KEY -> departments(department_name)` | Routed municipal department. |
| `priority` | `TEXT` | `NOT NULL DEFAULT 'MEDIUM'`, `CHECK IN ('LOW','MEDIUM','HIGH','CRITICAL','PENDING')` | Urgency level assessed by Stage 6. |
| `confidence_score` | `REAL` | `NOT NULL DEFAULT 0.0`, `CHECK (0.0 <= score <= 1.0)` | Classifier probability score (`0.0` to `1.0`). |
| `status` | `TEXT` | `NOT NULL DEFAULT 'SUBMITTED'`, `CHECK IN ('SUBMITTED','ROUTED','IN_PROGRESS','RESOLVED','CLOSED','REJECTED')` | Current resolution lifecycle state. |
| `created_at` | `TEXT` | `NOT NULL` | ISO-8601 UTC timestamp when ticket was created. |
| `updated_at` | `TEXT` | `NOT NULL` | ISO-8601 UTC timestamp of most recent status update. |

---

### C. `grievance_history` Table
Immutable audit trail capturing every status change and administrator remark.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `history_id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Sequential audit entry ID. |
| `ticket_id` | `TEXT` | `NOT NULL`, `FOREIGN KEY -> grievances(ticket_id) ON DELETE CASCADE` | Associated grievance ticket ID. |
| `previous_status` | `TEXT` | `NULL` | Status prior to transition (`NULL` on initial submission). |
| `new_status` | `TEXT` | `NOT NULL` | Updated lifecycle status. |
| `remarks` | `TEXT` | `NOT NULL` | Publicly visible audit note or resolution explanation. |
| `timestamp` | `TEXT` | `NOT NULL` | ISO-8601 UTC timestamp of the transition. |

---

### D. `departments` Table
Stores the configured civic departments and their supported categories.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `department_id` | `TEXT` | `PRIMARY KEY` | Department code (e.g., `DEPT-WATER-01`). |
| `department_name` | `TEXT` | `NOT NULL UNIQUE` | Official demonstration department name. |
| `supported_categories` | `TEXT` | `NOT NULL` | JSON-serialized array of supported grievance categories. |
| `is_active` | `INTEGER` | `NOT NULL DEFAULT 1` | Boolean flag (`1` = active, `0` = inactive). |
| `created_at` | `TEXT` | `NOT NULL` | ISO-8601 UTC timestamp. |

---

## 3. Entity Relationships & Integrity Constraints

1. **`citizens` (1) $\longrightarrow$ (`0..N`) `grievances`:**
   - One citizen can submit multiple grievances over time.
   - `ON DELETE RESTRICT` prevents accidental deletion of a citizen record if active grievances reference it.
2. **`departments` (1) $\longrightarrow$ (`0..N`) `grievances`:**
   - Each grievance is routed to one primary `assigned_department` (`ON UPDATE CASCADE`).
3. **`grievances` (1) $\longrightarrow$ (`1..N`) `grievance_history`:**
   - Every grievance has one or more chronological history records (`ON DELETE CASCADE`).
