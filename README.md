# JANASEVA AI — Multilingual Citizen Grievance Redressal Platform

> **Every Voice Matters. Every Grievance Counts.**  
> **Hackathon:** Neural Storm 2026 | **Track:** Human Impact (`HI-02 — Multilingual Citizen Grievance Platform`)  
> **Pilot Location:** Hyderabad, India | **UI & Voice Languages:** English, Telugu (`తెలుగు`), Hindi (`हिन्दी`) + 20+ Indian Speech Languages

---

## 1. Overview

**JANASEVA AI** is a voice-first, multilingual citizen grievance registration and municipal command platform built to make civic reporting accessible for both rural and urban citizens. Citizens can speak their complaints in their own language, listen to their transcribed complaint using **Read Aloud (Text-to-Speech)**, manually select the municipal department they want to complain to, provide their citizen & location details, review all details on the confirmation screen, and receive an instant trackable **Ticket ID**.

---

## 2. Key Features

### A. Multilingual UI Switcher (`English` | `తెలుగు` | `हिन्दी`)
- Available in the top navigation bar across all Public, Citizen, and Admin pages.
- Instantly translates page headings, form labels, placeholders, department names, status badges, and buttons into **English**, **Telugu**, or **Hindi**.
- Persists your language preference in `localStorage`.

### B. Voice-to-Grievance Speech Recognition (Dual-Engine Architecture)
- **Primary Engine:** **Sarvam AI — Saaras v4** (`POST /api/speech/transcribe`) supporting 22 scheduled Indian languages + Auto-Detect (`unknown`) and 5 output modes (`transcribe`, `translate`, `verbatim`, `transliterate`, `codemix`).
- **Secondary Fallback Engine:** **Browser Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`) that runs in parallel and automatically takes over if the API key is missing, credits are exhausted, or the network is offline—ensuring **spoken complaints are never lost**.
- **Voice-First Dashboard Modal:** Citizens can tap the large circular microphone button directly on the Citizen Dashboard (`Speak Your Complaint`) or inside the Register Complaint page.

### C. Read Aloud (Text-to-Speech Playback)
- Integrated **Read Aloud** (`🔊 Read Aloud` / `⏹ Stop Reading`) button next to the Complaint Description box, inside the Voice Recording Modal, on the Review screen, and on Complaint Details / Tracking pages.
- Reads the complaint aloud in Telugu (`te-IN`), Hindi (`hi-IN`), or English (`en-IN`) so citizens—including elderly or low-literacy users—can verify their complaint by listening before submitting.

### D. Direct Manual Department Selection & 3-Step Registration Workflow
- **No blocking AI analysis step:** Once the citizen speaks or types their complaint into the **Complaint Description** box and listens to it with **Read Aloud**, they **manually select the Municipal Department** they want to complain to from the 7 civic categories:
  1. **Water Supply** $\rightarrow$ *Water Supply Department* (`DEPT-WATER`)
  2. **Roads and Potholes** $\rightarrow$ *Municipal Engineering* (`DEPT-ROADS`)
  3. **Garbage Collection** $\rightarrow$ *Sanitation Department* (`DEPT-SANITATION`)
  4. **Electricity** $\rightarrow$ *Electricity Department* (`DEPT-ELECTRICITY`)
  5. **Streetlights** $\rightarrow$ *Electrical Maintenance* (`DEPT-STREETLIGHTS`)
  6. **Drainage** $\rightarrow$ *Drainage Department* (`DEPT-DRAINAGE`)
  7. **Public Safety** $\rightarrow$ *Relevant Civic Authority* (`DEPT-SAFETY`)
- **Citizen & Rural/Urban Location Form:**
  - **Section A — Citizen Information:** Full Name (`*`), Mobile Number, Email Address, Designation / Occupation, Citizen Reference ID.
  - **Section B — Location Information:** Village / Town / City (`*`), Area / Colony / Street (`*`), Nearby Landmark (`*`), plus optional House/Plot Number, Mandal/Zone, District, State, and PIN Code.
  - **Section C — Complaint Details:** Complaint Description (`*`), Department Selection (`*`), Priority Level, Problem Duration, Incident Date, Affected People, and optional Photo/PDF attachment.
- **Direct Proceed to Review:** Clicking **"Proceed to Review →"** takes the citizen directly to **Step 2 (Review & Confirm)** where they verify all details and click **"Confirm & Register Grievance Ticket"** to generate an official Ticket ID (e.g., `JANA-HYD-2026-XXXX`).

### E. Live Ticket Tracking & Municipal Admin Command Center
- **Track Complaint (`/track` or `/citizen/track`):** Look up any Ticket ID to inspect real-time status (`SUBMITTED` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`), assigned department, priority, and timestamped officer audit remarks.
- **Admin Dashboard (`/admin/dashboard`):** Real-time analytics charts, department routing queues, SLA monitoring, and status/priority management across all 7 municipal departments.

---

## 3. Step-by-Step Instructions: How to Use the App

### Step 1: Switch Interface Language (Optional)
1. Use the **UI Language** dropdown in the top header to choose **English**, **తెలుగు (Telugu)**, or **हिन्दी (Hindi)**.

### Step 2: Sign In with One-Click Demo Accounts (or Browse Publicly)
1. Click **Login** in the top navigation bar (or click **Try Citizen or Admin Demo Login** on the Home page).
2. Use the **One-Click Demo Login** cards:
   - **Citizen Demo Account (`Arjun Reddy`):** Opens the **Citizen Dashboard** (`/citizen/dashboard`).
   - **Admin Demo Account (`Priya Sharma — GHMC Commissionerate`):** Opens the **Municipal Command Dashboard** (`/admin/dashboard`).

### Step 3: Register a Complaint Using Voice & Read Aloud
1. Go to **Citizen Dashboard** $\rightarrow$ click **Register a New Complaint** (or tap the large microphone button on the dashboard).
2. **Speak Your Complaint:**
   - Select your spoken language (`English`, `తెలుగు`, `हिन्दी`, or `Auto-Detect`) and click the **Microphone button**.
   - Speak your civic issue clearly and click **Stop Recording**.
   - Review the recognized text and click **Confirm Transcription** (or **Continue to Complaint Form →** if using the dashboard modal). Your spoken words are placed directly into the **Complaint Description** text box.
   - *(Tip: You can also click one of the **Try a Multilingual Demo Complaint** buttons at the top of the page—`తెలుగు (Water Supply)`, `हिन्दी (Streetlights)`, or `English (Roads & Potholes)`—to pre-fill a complete sample complaint.)*
3. **Listen with Read Aloud:**
   - Click the **Read Aloud** button right above the Complaint Description box to hear your complaint read back to you.
4. **Manually Select the Municipal Department:**
   - Under **Select Municipal Department for Your Complaint**, click the department card or dropdown for your issue (`Water Supply`, `Roads and Potholes`, `Garbage Collection`, `Electricity`, `Streetlights`, `Drainage`, or `Public Safety`) and choose the **Priority Level** (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
5. **Complete Citizen & Location Details:**
   - Fill in **Section A (Citizen Information)**: Full Name (`*`) and optional contact details.
   - Fill in **Section B (Location Information)**: Village/Town/City (`*`), Area/Colony/Street (`*`), and Nearby Landmark (`*`), plus any optional address details.
6. **Proceed Directly to Review:**
   - Click **"Proceed to Review →"** at the bottom of the form.
7. **Review & Confirm Submission:**
   - On **Step 2 (Review & Confirm)**, verify your selected Department, Complaint Description (you can use **Read Aloud** or edit any field), Citizen Information, and Location Information.
   - Click **"Confirm & Register Grievance Ticket"**.
8. **Get Your Official Ticket ID:**
   - On **Step 3 (Ticket Confirmation)**, copy your generated **Official Grievance Ticket ID** (e.g., `JANA-HYD-2026-1049`) or click **Track Live Status** / **View My Complaints**.

### Step 4: Track Your Grievance Status
1. Navigate to **Track Complaint** (`/track` or `/citizen/track`).
2. Enter your **Ticket ID** (or click one of the active demo tickets listed on the page) and click **Track Status**.
3. View the assigned department, current status badge, full complaint description (with **Read Aloud**), and the chronological audit trail.

### Step 5: Manage Grievances as a Municipal Admin
1. Switch to the Admin view (via **Login $\rightarrow$ Admin Demo Account** or `/admin/dashboard`).
2. Inspect live charts across all 7 categories and departments.
3. Go to **All Complaints** (`/admin/complaints`) to filter tickets by status, category, department, or priority.
4. Click **Manage** on any complaint to update its status (`ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`), adjust priority, and record official field engineer remarks.

---

## 4. Local Setup & Running the Application

### Unified Full-Stack Development Server (Port 3000)
```bash
# 1. Install Node.js dependencies
npm install

# 2. Copy environment configuration (optional: add SARVAM_API_KEY in .env)
cp .env.example .env

# 3. Start the full-stack Express + Vite server on port 3000
npm run dev
```

### Optional: Python FastAPI Backend & SQLite Database Verification
```bash
# Initialize SQLite database and seed the 7 municipal departments
python3 backend/app/database/init_db.py

# Run backend unit tests
python3 -m unittest discover -s backend/tests -p "test_*.py" -v
```
