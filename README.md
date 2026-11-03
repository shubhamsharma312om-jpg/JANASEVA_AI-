# JANASEVA AI

> **Every Voice Matters. Every Grievance Counts.**  
> **Hackathon:** Neural Storm 2026 | **Track:** Human Impact (`HI-02 — Multilingual Citizen Grievance Chatbot`)  
> **Pilot Location:** Hyderabad, India | **Target Languages:** English, Telugu (`తెలుగు`), Hindi (`हिन्दी`)

---

## Project Overview (Phase 1: Project Foundation & Architecture)

**JANASEVA AI** is a multilingual citizen grievance redressal platform designed to bridge the communication gap between citizens and municipal authorities. Citizens can report civic issues in regional Indian languages (**English**, **Telugu**, and **Hindi**), which are processed to identify the relevant civic department, assess priority, generate a trackable ticket, and provide transparent resolution tracking.

This repository currently implements **Phase 1 — Project Foundation and Architecture**:
- Clean, modular separation between `frontend/` (React + Vite) and `backend/` (Python + FastAPI + Pydantic + SQLite).
- Privacy-first SQLite database schema (`citizens`, `grievances`, `grievance_history`, `departments`) initialized and seeded with 7 configurable Hyderabad pilot department mappings.
- Modular AI/NLP engine interface (`backend/app/ai_engine/`) ready for Phase 2 multilingual model integration (with zero fake/hardcoded AI responses in Phase 1).
- Working `/api/health` and `/api/departments/` endpoints, plus full REST API contracts for grievance ingestion and tracking.

---

## Repository Structure

```text
JANASEVA-AI/
├── frontend/                  # Standalone React + Vite Frontend (JS, HTML5, CSS3)
├── backend/                   # Python FastAPI + Pydantic + SQLite Backend
│   ├── app/
│   │   ├── api/routes/        # health.py, departments.py, grievances.py
│   │   ├── core/              # config.py & configurable department_mapping.json
│   │   ├── database/          # schema.sql, session.py, init_db.py
│   │   ├── models/            # SQLAlchemy ORM models (Citizen, Department, Grievance)
│   │   ├── schemas/           # Pydantic v2 request/response validation schemas
│   │   ├── services/          # Business service layer (ticket ID & routing)
│   │   ├── ai_engine/         # Modular NLP pipeline interface for Phase 2
│   │   └── main.py            # FastAPI application entry point
│   ├── tests/                 # Automated Phase 1 verification unit tests
│   └── requirements.txt       # Python dependencies
├── docs/                      # Detailed Database, API & Workflow documentation
├── PROJECT_ARCHITECTURE.md    # Architectural decisions & system blueprint
└── README.md                  # Setup and verification instructions
```

---

## Local Setup & Execution Instructions

### 1. Backend Setup (Python + FastAPI + SQLite)

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Copy environment variables example
cp .env.example .env

# 5. Initialize the SQLite database (janaseva.db) and seed the 7 departments
python3 app/database/init_db.py

# 6. Run automated Phase 1 unit tests
python3 -m unittest discover -s tests -p "test_*.py" -v

# 7. Start the FastAPI development server on port 8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Once running:
- **Health Check Endpoint:** `http://127.0.0.1:8000/api/health`
- **Departments & Mappings Endpoint:** `http://127.0.0.1:8000/api/departments/`
- **Interactive Swagger API Docs:** `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup (React + Vite)

```bash
# 1. Open a new terminal and navigate to the frontend directory
cd frontend

# 2. Copy environment configuration
cp .env.example .env

# 3. Install frontend dependencies
npm install

# 4. Start the Vite development server
npm run dev
```

---

## Phase 1 Verification Commands

```bash
# Verify SQLite database creation & run automated backend tests:
python3 backend/app/database/init_db.py
python3 -m unittest discover -s backend/tests -p "test_*.py" -v

# Verify /api/health endpoint response:
curl -s http://localhost:3000/api/health
```
