# JANASEVA AI — System Architecture & Technical Blueprint (Phase 1)

**Tagline:** *Every Voice Matters. Every Grievance Counts.*  
**Hackathon:** Neural Storm 2026  
**Track:** Human Impact (`HI-02 — Multilingual Citizen Grievance Chatbot`)  
**Pilot Location:** Hyderabad, Telangana, India  
**Initial Target Languages:** English (`en`), Telugu (`te`), Hindi (`hi`)

---

## 1. Architectural Philosophy & Design Decisions

1. **Strict Separation of Concerns:**
   - **Presentation Layer (`frontend/`):** React + Vite SPA responsible solely for citizen interaction, ticket status lookup, and municipal administrator views.
   - **API & Orchestration Layer (`backend/app/api/`, `backend/app/services/`):** Python FastAPI routes with Pydantic request/response schemas and service-layer orchestration.
   - **Modular AI/NLP Engine (`backend/app/ai_engine/`):** Decoupled behind an abstract `BaseNLPPipeline` contract (`base.py`) so that Phase 2 multilingual language identification, translation, classification, and priority models can be swapped or upgraded without modifying HTTP controllers or database schemas.
   - **Data Persistence Layer (`backend/app/database/`, `backend/app/models/`):** SQLite database (`janaseva.db`) with foreign-key enforcement (`PRAGMA foreign_keys = ON`) and SQLAlchemy ORM models, ready for seamless migration to PostgreSQL in production.

2. **Configurable Civic Department Routing (`backend/app/core/department_mapping.json`):**
   - Grievance categories and department mappings are externalized into a JSON configuration file rather than hardcoded in Python logic.
   - Municipal administrators can add new categories, adjust SLA targets, or remap departments for different cities without changing source code.

3. **Privacy-by-Design Citizen Data Model:**
   - Citizens often hesitate to report civic hazards if forced to disclose personal identity documents or phone numbers.
   - Both `name` and `contact_info` in the `citizens` table are strictly `NULL`-allowed (optional). Every citizen receives an anonymous `citizen_id` and a human-readable `ticket_id` (`JANA-HYD-2026-XXXXXX`) for full lifecycle tracking without mandatory PII collection.

4. **Zero Fake AI in Phase 1:**
   - In accordance with Phase 1 engineering rules, no hardcoded chatbot replies, regex-spoofed classifications, or paid external LLM APIs are used. The AI engine defines strict interfaces (`BaseNLPPipeline`) and raises an explicit `HTTP 501 Not Implemented` (`Phase1NotImplementedError`) on inference routes until Phase 2 multilingual models are trained and integrated.

---

## 2. Project Directory Structure

```text
JANASEVA-AI/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── HealthCheckCard.jsx       # Live /api/health verification widget
│   │   ├── pages/
│   │   │   └── LandingPage.jsx           # Phase 1 placeholder landing page
│   │   ├── services/
│   │   │   └── api.js                    # Centralized HTTP client for FastAPI
│   │   ├── styles/
│   │   │   └── main.css                  # Phase 1 baseline stylesheet
│   │   ├── App.jsx                       # Root React component
│   │   └── main.jsx                      # React DOM entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── health.py             # GET /api/health (Working Phase 1 endpoint)
│   │   │       ├── departments.py        # GET /api/departments/ (Configurable mapping)
│   │   │       └── grievances.py         # Grievance CRUD & status route contracts
│   │   ├── core/
│   │   │   ├── config.py                 # Environment settings & mapping loader
│   │   │   └── department_mapping.json   # Configurable 7-category Hyderabad mapping
│   │   ├── database/
│   │   │   ├── schema.sql                # Raw SQLite DDL with constraints & indexes
│   │   │   ├── session.py                # SQLAlchemy engine & get_db dependency
│   │   │   └── init_db.py                # Standalone & startup DB initializer/seeder
│   │   ├── models/
│   │   │   ├── citizen.py                # Entity A: Citizen ORM model
│   │   │   ├── department.py             # Entity D: Department ORM model
│   │   │   └── grievance.py              # Entities B & C: Grievance & GrievanceHistory
│   │   ├── schemas/
│   │   │   ├── citizen.py                # Pydantic schemas for Citizen
│   │   │   ├── department.py             # Pydantic schemas for Department
│   │   │   ├── grievance.py              # Pydantic schemas for Grievance & History
│   │   │   └── health.py                 # Pydantic schema for Health check
│   │   ├── services/
│   │   │   └── grievance_service.py      # Ticket ID generator & NLP pipeline bridge
│   │   ├── ai_engine/
│   │   │   ├── base.py                   # Abstract BaseNLPPipeline & NLPAnalysisResult
│   │   │   └── pipeline.py               # Phase 1 modular NLP coordinator
│   │   └── main.py                       # FastAPI application entry point
│   │
│   ├── tests/
│   │   └── test_health.py                # Automated unit tests for DB & mappings
│   ├── .env.example
│   └── requirements.txt
│
├── docs/
│   ├── DATABASE_DESIGN.md                # Full ER schema, constraints & privacy rules
│   ├── API_SPECIFICATION.md              # Detailed REST API endpoint contracts
│   └── SYSTEM_WORKFLOW.md                # 10-stage grievance lifecycle documentation
│
├── .gitignore
├── README.md                             # Setup, installation & verification guide
└── PROJECT_ARCHITECTURE.md               # This architectural blueprint document
```

---

## 3. Configurable Grievance Categories & Department Mapping

Defined in `backend/app/core/department_mapping.json` and seeded into the SQLite `departments` table on startup:

| Category | Assigned Department | Department ID | Default SLA (Demo) |
| :--- | :--- | :--- | :--- |
| **Water Supply** | Water Supply Department | `DEPT-WATER-01` | 24 hours |
| **Roads and Potholes** | Municipal Engineering | *`DEPT-MUNI-02`* | 72 hours |
| **Garbage Collection** | Sanitation Department | `DEPT-SANI-03` | 24 hours |
| **Electricity** | Electricity Department | `DEPT-ELEC-04` | 12 hours |
| **Streetlights** | Electrical Maintenance | `DEPT-ELMT-05` | 48 hours |
| **Drainage** | Drainage Department | `DEPT-DRNG-06` | 24 hours |
| **Public Safety** | Relevant Civic Authority | `DEPT-SAFE-07` | 6 hours |

*Note: These mappings are configured as demonstration routing rules for the Hyderabad pilot and can be updated in `department_mapping.json` without code changes.*
