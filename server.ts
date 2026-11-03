import express from 'express';
import { createServer as createViteServer } from 'vite';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';

const execFileAsync = promisify(execFile);
const ROOT_DIR = process.cwd();
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const DB_INIT_SCRIPT = path.join(BACKEND_DIR, 'app', 'database', 'init_db.py');

/**
 * Execute a Python snippet with optional JSON stdin payload against `backend/janaseva.db`
 */
async function runPythonWithPayload(pythonSnippet: string, payload: any = {}): Promise<any> {
  const payloadJson = JSON.stringify(payload);
  const { stdout } = await execFileAsync(
    'python3',
    ['-c', pythonSnippet, payloadJson],
    { cwd: BACKEND_DIR }
  );
  return JSON.parse(stdout.trim());
}

async function ensureDatabaseAndDemoSeed() {
  try {
    await execFileAsync('python3', [DB_INIT_SCRIPT], { cwd: ROOT_DIR });

    const seedSnippet = `
import json, sqlite3
from app.core.config import settings

conn = sqlite3.connect(str(settings.SQLITE_DB_PATH))
conn.execute("PRAGMA foreign_keys = ON;")
cur = conn.cursor()

cur.execute("SELECT COUNT(*) FROM grievances;")
count = cur.fetchone()[0]

if count == 0:
    citizens = [
        ("CIT-2026-DEMO01", "Arjun Reddy", "citizen@janaseva.demo | +91 98480 22334", "te", "2026-10-12T08:30:00Z"),
        ("CIT-2026-DEMO02", "Priya Sharma", "priya.sharma@hyderabad.in | +91 97011 44556", "hi", "2026-10-15T10:15:00Z"),
        ("CIT-2026-DEMO03", "Mohammed Irfan", "m.irfan@charminar.org | +91 99490 77889", "en", "2026-10-18T14:20:00Z"),
        ("CIT-2026-DEMO04", "Lakshmi Narayana", "lakshmi.n@kukatpally.in | +91 94401 11223", "te", "2026-10-20T09:00:00Z"),
        ("CIT-2026-DEMO05", "Ananya Rao", "ananya.rao@gachibowli.org | +91 98850 66778", "en", "2026-10-24T11:45:00Z")
    ]
    cur.executemany(
        "INSERT OR IGNORE INTO citizens (citizen_id, name, contact_info, preferred_language, created_at) VALUES (?, ?, ?, ?, ?);",
        citizens
    )

    grievances = [
        (
            "JANA-HYD-2026-1042",
            "CIT-2026-DEMO01",
            "మా కాలనీలో గత మూడు రోజులుగా మంచినీటి సరఫరా లేదు. కుకట్‌పల్లి ఫేజ్ 3 వాటర్ పైప్‌లైన్ లీకేజీ వల్ల తీవ్ర ఇబ్బంది పడుతున్నాము. | Location: Kukatpally Housing Board Phase 3, Near Community Hall",
            "te",
            "No drinking water supply in Kukatpally Phase 3 for the past 3 days due to main pipeline leakage near Community Hall.",
            "Water Supply",
            "Water Supply Department",
            "HIGH",
            1.0,
            "IN_PROGRESS",
            "2026-10-28T07:30:00Z",
            "2026-10-29T11:15:00Z"
        ),
        (
            "JANA-HYD-2026-1039",
            "CIT-2026-DEMO01",
            "Deep potholes along Madhapur Hitec City Main Road near Metro Pillar 1728 causing severe traffic congestion and two-wheeler accidents during evening rain. | Location: Madhapur Main Road, Pillar 1728",
            "en",
            None,
            "Roads and Potholes",
            "Municipal Engineering",
            "HIGH",
            1.0,
            "RESOLVED",
            "2026-10-21T09:20:00Z",
            "2026-10-25T16:40:00Z"
        ),
        (
            "JANA-HYD-2026-1048",
            "CIT-2026-DEMO01",
            "चारमीनार लाड बाज़ार के पास पिछले चार दिनों से स्ट्रीट लाइटें काम नहीं कर रही हैं, रात में बुजुर्गों और महिलाओं को चलने में परेशानी हो रही है। | Location: Laad Bazaar Main Street, Near Charminar",
            "hi",
            "Streetlights near Charminar Laad Bazaar have not been working for the past four days.",
            "Streetlights",
            "Electrical Maintenance",
            "MEDIUM",
            1.0,
            "ROUTED",
            "2026-11-01T18:10:00Z",
            "2026-11-01T19:00:00Z"
        ),
        (
            "JANA-HYD-2026-1051",
            "CIT-2026-DEMO02",
            "बंजारा हिल्स रोड नंबर 12 के सामुदायिक कूड़ेदान से तीन दिनों से कचरा नहीं उठाया गया है, जिससे दुर्गंध और मच्छर बढ़ रहे हैं। | Location: Banjara Hills Road No. 12, Opposite City Park",
            "hi",
            "Garbage has not been collected from the community bin on Banjara Hills Road No. 12 for three days.",
            "Garbage Collection",
            "Sanitation Department",
            "MEDIUM",
            1.0,
            "SUBMITTED",
            "2026-11-02T08:15:00Z",
            "2026-11-02T08:15:00Z"
        ),
        (
            "JANA-HYD-2026-1055",
            "CIT-2026-DEMO03",
            "Stormwater drain overflow and open manhole chamber near Secunderabad Clock Tower main junction posing an immediate hazard to pedestrians and school buses. | Location: Secunderabad Clock Tower Junction",
            "en",
            None,
            "Drainage",
            "Drainage Department",
            "CRITICAL",
            1.0,
            "IN_PROGRESS",
            "2026-11-02T10:05:00Z",
            "2026-11-02T13:30:00Z"
        ),
        (
            "JANA-HYD-2026-1058",
            "CIT-2026-DEMO04",
            "అమీర్‌పేట్ మెట్రో స్టేషన్ దగ్గర ట్రాన్స్‌ఫార్మర్ నుండి స్పార్క్స్ వస్తున్నాయి, తరచుగా కరెంట్ పోతోంది. వెంటనే సరిచేయగలరు. | Location: Ameerpet Cross Roads, Beside Metro Gate B",
            "te",
            "Sparks coming from distribution transformer near Ameerpet Metro Station with frequent power outages.",
            "Electricity",
            "Electricity Department",
            "CRITICAL",
            1.0,
            "RESOLVED",
            "2026-10-26T14:00:00Z",
            "2026-10-27T09:10:00Z"
        ),
        (
            "JANA-HYD-2026-1062",
            "CIT-2026-DEMO05",
            "Large fallen tree branch blocking half of the pedestrian walkway and leaning precariously on overhead cables at Jubilee Hills Checkpost. | Location: Jubilee Hills Checkpost, Road No. 36",
            "en",
            None,
            "Public Safety",
            "Relevant Civic Authority",
            "HIGH",
            1.0,
            "ROUTED",
            "2026-11-02T16:45:00Z",
            "2026-11-02T17:15:00Z"
        )
    ]
    cur.executemany(
        """
        INSERT OR IGNORE INTO grievances (
            ticket_id, citizen_id, original_message, detected_language, translated_message,
            predicted_category, assigned_department, priority, confidence_score, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        grievances
    )

    history_rows = [
        ("JANA-HYD-2026-1042", None, "SUBMITTED", "Complaint registered by citizen via JANASEVA AI portal.", "2026-10-28T07:30:00Z"),
        ("JANA-HYD-2026-1042", "SUBMITTED", "ROUTED", "Assigned to Water Supply Department based on Phase 1 category mapping.", "2026-10-28T08:00:00Z"),
        ("JANA-HYD-2026-1042", "ROUTED", "IN_PROGRESS", "Kukatpally Ward 114 maintenance crew dispatched to repair main valve leakage.", "2026-10-29T11:15:00Z"),

        ("JANA-HYD-2026-1039", None, "SUBMITTED", "Complaint registered by citizen.", "2026-10-21T09:20:00Z"),
        ("JANA-HYD-2026-1039", "SUBMITTED", "ROUTED", "Assigned to Municipal Engineering (Roads and Potholes).", "2026-10-21T10:05:00Z"),
        ("JANA-HYD-2026-1039", "ROUTED", "IN_PROGRESS", "Hot-mix asphalt patching initiated near Metro Pillar 1728.", "2026-10-23T14:00:00Z"),
        ("JANA-HYD-2026-1039", "IN_PROGRESS", "RESOLVED", "Pothole resurfacing completed and inspected by Ward Executive Engineer.", "2026-10-25T16:40:00Z"),

        ("JANA-HYD-2026-1048", None, "SUBMITTED", "Complaint registered in Hindi.", "2026-11-01T18:10:00Z"),
        ("JANA-HYD-2026-1048", "SUBMITTED", "ROUTED", "Assigned to Electrical Maintenance for Old City Zone.", "2026-11-01T19:00:00Z"),

        ("JANA-HYD-2026-1051", None, "SUBMITTED", "Complaint registered in Hindi for Banjara Hills Ward.", "2026-11-02T08:15:00Z"),

        ("JANA-HYD-2026-1055", None, "SUBMITTED", "Critical drainage hazard reported.", "2026-11-02T10:05:00Z"),
        ("JANA-HYD-2026-1055", "SUBMITTED", "ROUTED", "Assigned to Drainage Department emergency response.", "2026-11-02T10:20:00Z"),
        ("JANA-HYD-2026-1055", "ROUTED", "IN_PROGRESS", "Safety barricades placed; jetting machine deployed to clear blockage.", "2026-11-02T13:30:00Z"),

        ("JANA-HYD-2026-1058", None, "SUBMITTED", "Electrical transformer spark hazard reported in Telugu.", "2026-10-26T14:00:00Z"),
        ("JANA-HYD-2026-1058", "SUBMITTED", "ROUTED", "Assigned to Electricity Department.", "2026-10-26T14:15:00Z"),
        ("JANA-HYD-2026-1058", "ROUTED", "IN_PROGRESS", "Feeder line isolated and faulty fuse unit replaced.", "2026-10-26T18:30:00Z"),
        ("JANA-HYD-2026-1058", "IN_PROGRESS", "RESOLVED", "Transformer stabilized and normal power supply restored.", "2026-10-27T09:10:00Z"),

        ("JANA-HYD-2026-1062", None, "SUBMITTED", "Public safety obstruction reported at Jubilee Hills Checkpost.", "2026-11-02T16:45:00Z"),
        ("JANA-HYD-2026-1062", "SUBMITTED", "ROUTED", "Assigned to Relevant Civic Authority disaster response team.", "2026-11-02T17:15:00Z")
    ]
    cur.executemany(
        "INSERT INTO grievance_history (ticket_id, previous_status, new_status, remarks, timestamp) VALUES (?, ?, ?, ?, ?);",
        history_rows
    )
    conn.commit()

conn.close()
print(json.dumps({"seeded": True}))
`;
    await runPythonWithPayload(seedSnippet);
  } catch (err) {
    console.error('Database initialization / seed error:', err);
  }
}

async function startServer() {
  await ensureDatabaseAndDemoSeed();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));

  // 1. GET /api/health
  app.get('/api/health', async (_req, res) => {
    try {
      const pyScript = `
import json, sqlite3
from datetime import datetime, timezone
from app.core.config import settings

conn = sqlite3.connect(str(settings.SQLITE_DB_PATH))
cur = conn.cursor()
cur.execute("SELECT COUNT(*) FROM departments;")
dept_count = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM grievances;")
grievance_count = cur.fetchone()[0]
cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;")
tables = [r[0] for r in cur.fetchall()]
conn.close()

print(json.dumps({
    "status": "healthy",
    "project": settings.PROJECT_NAME,
    "tagline": settings.TAGLINE,
    "phase": "Phase 1 Foundation + Complete Web Application",
    "pilot_location": settings.PILOT_LOCATION,
    "supported_languages": settings.SUPPORTED_LANGUAGES,
    "database_status": "connected",
    "sqlite_tables": tables,
    "seeded_departments_count": dept_count,
    "total_grievances_count": grievance_count,
    "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
}))
`;
      const data = await runPythonWithPayload(pyScript);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({
        status: 'degraded',
        database_status: 'error',
        detail: error?.message || 'SQLite health check failed',
      });
    }
  });

  // 2. GET /api/departments/
  app.get(['/api/departments', '/api/departments/'], async (_req, res) => {
    try {
      const pyScript = `
import json, sqlite3
from app.core.config import settings

mapping_config = settings.load_department_mappings()
conn = sqlite3.connect(str(settings.SQLITE_DB_PATH))
cur = conn.cursor()
cur.execute("""
    SELECT d.department_id, d.department_name, d.supported_categories, d.is_active, d.created_at,
           COUNT(g.ticket_id) as complaint_count
    FROM departments d
    LEFT JOIN grievances g ON g.assigned_department = d.department_name
    GROUP BY d.department_id
    ORDER BY d.department_id;
""")
rows = cur.fetchall()
conn.close()

departments = [
    {
        "department_id": r[0],
        "department_name": r[1],
        "supported_categories": json.loads(r[2]),
        "is_active": bool(r[3]),
        "created_at": r[4],
        "assigned_complaints_count": r[5]
    }
    for r in rows
]

print(json.dumps({
    "pilot_location": settings.PILOT_LOCATION,
    "disclaimer": mapping_config["metadata"]["disclaimer"],
    "departments": departments,
    "category_mappings": mapping_config.get("mappings", [])
}))
`;
      const data = await runPythonWithPayload(pyScript);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ detail: error?.message || 'Failed to load departments' });
    }
  });

  // 3. GET /api/grievances/ — Returns all grievances with citizen info and history from SQLite
  app.get(['/api/grievances', '/api/grievances/'], async (_req, res) => {
    try {
      const pyScript = `
import json, sqlite3
from app.core.config import settings

conn = sqlite3.connect(str(settings.SQLITE_DB_PATH))
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute("""
    SELECT g.*, c.name as citizen_name, c.contact_info as citizen_contact, c.preferred_language
    FROM grievances g
    LEFT JOIN citizens c ON g.citizen_id = c.citizen_id
    ORDER BY g.created_at DESC;
""")
grievances = [dict(r) for r in cur.fetchall()]

for g in grievances:
    cur.execute(
        "SELECT history_id, ticket_id, previous_status, new_status, remarks, timestamp FROM grievance_history WHERE ticket_id = ? ORDER BY history_id ASC;",
        (g["ticket_id"],)
    )
    g["history"] = [dict(h) for h in cur.fetchall()]

conn.close()
print(json.dumps(grievances))
`;
      const data = await runPythonWithPayload(pyScript);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ detail: error?.message });
    }
  });

  // 4. GET /api/grievances/:ticket_id — Fetch single grievance with history from SQLite
  app.get('/api/grievances/:ticket_id', async (req, res) => {
    try {
      const pyScript = `
import json, sqlite3, sys
from app.core.config import settings

payload = json.loads(sys.argv[1])
ticket_id = payload["ticket_id"].strip().upper()

conn = sqlite3.connect(str(settings.SQLITE_DB_PATH))
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute("""
    SELECT g.*, c.name as citizen_name, c.contact_info as citizen_contact, c.preferred_language
    FROM grievances g
    LEFT JOIN citizens c ON g.citizen_id = c.citizen_id
    WHERE UPPER(g.ticket_id) = ?;
""", (ticket_id,))
row = cur.fetchone()
if not row:
    conn.close()
    print(json.dumps({"not_found": True}))
else:
    g = dict(row)
    cur.execute(
        "SELECT history_id, ticket_id, previous_status, new_status, remarks, timestamp FROM grievance_history WHERE ticket_id = ? ORDER BY history_id ASC;",
        (g["ticket_id"],)
    )
    g["history"] = [dict(h) for h in cur.fetchall()]
    conn.close()
    print(json.dumps(g))
`;
      const data = await runPythonWithPayload(pyScript, { ticket_id: req.params.ticket_id });
      if (data.not_found) {
        res.status(404).json({ detail: `Ticket '${req.params.ticket_id}' not found.` });
        return;
      }
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ detail: error?.message });
    }
  });

  // 5. POST /api/grievances/ — Register a new grievance in SQLite using Phase 1 manual category mapping (no AI)
  app.post(['/api/grievances', '/api/grievances/'], async (req, res) => {
    try {
      const pyScript = `
import json, sqlite3, sys, uuid
from datetime import datetime, timezone
from app.core.config import settings

payload = json.loads(sys.argv[1])
now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

category = payload.get("category") or "Public Safety"
cat_map = settings.get_category_to_department_map()
assigned_dept = cat_map.get(category, "Relevant Civic Authority")

lang = payload.get("language") or "en"
if lang not in ("en", "te", "hi"):
    lang = "en"

citizen_id = payload.get("citizen_id") or f"CIT-2026-{uuid.uuid4().hex[:6].upper()}"
citizen_name = payload.get("citizen_name")
citizen_contact = payload.get("citizen_contact")

ticket_id = payload.get("ticket_id") or f"JANA-HYD-2026-{uuid.uuid4().hex[:4].upper()}"
priority = payload.get("priority") or "MEDIUM"
if priority not in ("LOW", "MEDIUM", "HIGH", "CRITICAL"):
    priority = "MEDIUM"

original_message = payload.get("original_message", "").strip()

conn = sqlite3.connect(str(settings.SQLITE_DB_PATH))
conn.execute("PRAGMA foreign_keys = ON;")
cur = conn.cursor()

cur.execute(
    """
    INSERT INTO citizens (citizen_id, name, contact_info, preferred_language, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(citizen_id) DO UPDATE SET
        name = COALESCE(excluded.name, citizens.name),
        contact_info = COALESCE(excluded.contact_info, citizens.contact_info);
    """,
    (citizen_id, citizen_name, citizen_contact, lang, now)
)

cur.execute(
    """
    INSERT INTO grievances (
        ticket_id, citizen_id, original_message, detected_language, translated_message,
        predicted_category, assigned_department, priority, confidence_score, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """,
    (
        ticket_id,
        citizen_id,
        original_message,
        lang,
        None,
        category,
        assigned_dept,
        priority,
        1.0,
        "SUBMITTED",
        now,
        now
    )
)

cur.execute(
    """
    INSERT INTO grievance_history (ticket_id, previous_status, new_status, remarks, timestamp)
    VALUES (?, ?, ?, ?, ?);
    """,
    (
        ticket_id,
        None,
        "SUBMITTED",
        f"Complaint registered and mapped to {assigned_dept} ({category}).",
        now
    )
)

conn.commit()
conn.row_factory = sqlite3.Row
cur.execute("SELECT * FROM grievances WHERE ticket_id = ?;", (ticket_id,))
created = dict(cur.fetchone())
cur.execute("SELECT * FROM grievance_history WHERE ticket_id = ? ORDER BY history_id ASC;", (ticket_id,))
created["history"] = [dict(h) for h in cur.fetchall()]
created["citizen_name"] = citizen_name
created["citizen_contact"] = citizen_contact
conn.close()

print(json.dumps(created))
`;
      const created = await runPythonWithPayload(pyScript, req.body || {});
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ detail: error?.message || 'Failed to create grievance in SQLite' });
    }
  });

  // 6. PATCH /api/grievances/:ticket_id/status — Admin status, priority, and department update in SQLite
  app.patch('/api/grievances/:ticket_id/status', async (req, res) => {
    try {
      const pyScript = `
import json, sqlite3, sys
from datetime import datetime, timezone
from app.core.config import settings

payload = json.loads(sys.argv[1])
ticket_id = payload["ticket_id"]
new_status = payload.get("new_status")
new_priority = payload.get("priority")
new_department = payload.get("assigned_department")
remarks = payload.get("remarks") or "Updated by Municipal Administrator."
now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

# Map UI "ASSIGNED" to SQLite schema's "ROUTED" constraint
db_status_map = {
    "SUBMITTED": "SUBMITTED",
    "ASSIGNED": "ROUTED",
    "ROUTED": "ROUTED",
    "IN_PROGRESS": "IN_PROGRESS",
    "RESOLVED": "RESOLVED",
    "REJECTED": "REJECTED",
    "CLOSED": "CLOSED"
}

conn = sqlite3.connect(str(settings.SQLITE_DB_PATH))
conn.execute("PRAGMA foreign_keys = ON;")
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("SELECT * FROM grievances WHERE ticket_id = ?;", (ticket_id,))
row = cur.fetchone()
if not row:
    conn.close()
    print(json.dumps({"not_found": True}))
else:
    existing = dict(row)
    prev_status = existing["status"]
    target_status = db_status_map.get(new_status, prev_status) if new_status else prev_status
    target_priority = new_priority if new_priority in ("LOW", "MEDIUM", "HIGH", "CRITICAL") else existing["priority"]
    target_dept = new_department if new_department else existing["assigned_department"]

    cur.execute(
        """
        UPDATE grievances
        SET status = ?, priority = ?, assigned_department = ?, updated_at = ?
        WHERE ticket_id = ?;
        """,
        (target_status, target_priority, target_dept, now, ticket_id)
    )

    cur.execute(
        """
        INSERT INTO grievance_history (ticket_id, previous_status, new_status, remarks, timestamp)
        VALUES (?, ?, ?, ?, ?);
        """,
        (ticket_id, prev_status, target_status, remarks, now)
    )

    conn.commit()
    cur.execute("""
        SELECT g.*, c.name as citizen_name, c.contact_info as citizen_contact, c.preferred_language
        FROM grievances g
        LEFT JOIN citizens c ON g.citizen_id = c.citizen_id
        WHERE g.ticket_id = ?;
    """, (ticket_id,))
    updated = dict(cur.fetchone())
    cur.execute("SELECT * FROM grievance_history WHERE ticket_id = ? ORDER BY history_id ASC;", (ticket_id,))
    updated["history"] = [dict(h) for h in cur.fetchall()]
    conn.close()
    print(json.dumps(updated))
`;
      const updated = await runPythonWithPayload(pyScript, {
        ticket_id: req.params.ticket_id,
        ...req.body,
      });
      if (updated.not_found) {
        res.status(404).json({ detail: `Ticket '${req.params.ticket_id}' not found.` });
        return;
      }
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(500).json({ detail: error?.message || 'Failed to update grievance in SQLite' });
    }
  });

  // 7. GET /api/citizens/ — List registered citizens with complaint counts from SQLite
  app.get(['/api/citizens', '/api/citizens/'], async (_req, res) => {
    try {
      const pyScript = `
import json, sqlite3
from app.core.config import settings

conn = sqlite3.connect(str(settings.SQLITE_DB_PATH))
conn.row_factory = sqlite3.Row
cur = conn.cursor()
cur.execute("""
    SELECT c.citizen_id, c.name, c.contact_info, c.preferred_language, c.created_at,
           COUNT(g.ticket_id) as total_complaints
    FROM citizens c
    LEFT JOIN grievances g ON c.citizen_id = g.citizen_id
    GROUP BY c.citizen_id
    ORDER BY c.created_at DESC;
""")
rows = [dict(r) for r in cur.fetchall()]
conn.close()
print(json.dumps(rows))
`;
      const data = await runPythonWithPayload(pyScript);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ detail: error?.message });
    }
  });

  // 8. PATCH /api/departments/:department_id — Toggle active status or update supported categories in SQLite
  app.patch('/api/departments/:department_id', async (req, res) => {
    try {
      const pyScript = `
import json, sqlite3, sys
from app.core.config import settings

payload = json.loads(sys.argv[1])
dept_id = payload["department_id"]
is_active = 1 if payload.get("is_active", True) else 0

conn = sqlite3.connect(str(settings.SQLITE_DB_PATH))
cur = conn.cursor()
cur.execute("UPDATE departments SET is_active = ? WHERE department_id = ?;", (is_active, dept_id))
conn.commit()
conn.close()
print(json.dumps({"department_id": dept_id, "is_active": bool(is_active)}))
`;
      const data = await runPythonWithPayload(pyScript, {
        department_id: req.params.department_id,
        ...req.body,
      });
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ detail: error?.message });
    }
  });

  // 9. GET /api/foundation/verify — Runs Python unit tests
  app.get('/api/foundation/verify', async (_req, res) => {
    try {
      const { stdout, stderr } = await execFileAsync(
        'python3',
        ['-m', 'unittest', 'discover', '-s', 'backend/tests', '-p', 'test_*.py', '-v'],
        { cwd: ROOT_DIR }
      );
      res.status(200).json({
        passed: true,
        output: (stdout + '\n' + stderr).trim(),
      });
    } catch (error: any) {
      res.status(500).json({
        passed: false,
        output: error?.stderr || error?.message || 'Test execution failed',
      });
    }
  });

  // 10. GET /api/speech/status — Returns Sarvam Saaras v4 configuration status and supported language codes
  app.get(['/api/speech/status', '/api/speech/status/'], async (_req, res) => {
    try {
      const pyScript = `
import json
from app.core.config import settings, SARVAM_SUPPORTED_LANGUAGE_CODES

print(json.dumps({
    "primary_engine": "sarvam",
    "primary_model": settings.SARVAM_STT_MODEL,
    "sarvam_configured": settings.is_sarvam_configured(),
    "fallback_engine": "browser",
    "max_audio_bytes": settings.SARVAM_MAX_AUDIO_BYTES,
    "supported_language_codes": list(SARVAM_SUPPORTED_LANGUAGE_CODES)
}))
`;
      const data = await runPythonWithPayload(pyScript);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({
        primary_engine: 'sarvam',
        sarvam_configured: false,
        fallback_engine: 'browser',
        detail: error?.message || 'Failed to inspect speech configuration',
      });
    }
  });

  // 11. POST /api/speech/transcribe — Transcribe citizen speech via Sarvam Saaras v4
  app.post(
    ['/api/speech/transcribe', '/api/speech/transcribe/'],
    express.json({ limit: '15mb' }),
    async (req, res) => {
      let tempAudioPath: string | null = null;
      try {
        const body = req.body || {};
        const audioBase64 = typeof body.audio_base64 === 'string' ? body.audio_base64.trim() : '';
        const filename = typeof body.filename === 'string' && body.filename.trim() ? body.filename.trim() : 'recording.webm';
        const contentType = typeof body.content_type === 'string' ? body.content_type.trim() : 'audio/webm';
        const languageCode = typeof body.language_code === 'string' && body.language_code.trim() ? body.language_code.trim() : 'unknown';
        const mode = typeof body.mode === 'string' && body.mode.trim() ? body.mode.trim() : 'transcribe';

        // Strip data URI prefix if present (e.g., "data:audio/webm;base64,...")
        const cleanBase64 = audioBase64.includes(',')
          ? audioBase64.split(',')[1]
          : audioBase64;

        const audioBuffer = cleanBase64 ? Buffer.from(cleanBase64, 'base64') : Buffer.alloc(0);

        tempAudioPath = path.join(
          os.tmpdir(),
          `janaseva_voice_${Date.now()}_${Math.random().toString(36).slice(2)}.bin`
        );
        fs.writeFileSync(tempAudioPath, audioBuffer);

        const pyScript = `
import json, sys
from pathlib import Path
from app.services.speech_service import speech_service

payload = json.loads(sys.argv[1])
audio_path = Path(payload["temp_audio_path"])
audio_bytes = audio_path.read_bytes() if audio_path.exists() else b""

result = speech_service.transcribe_audio(
    audio_bytes=audio_bytes,
    filename=payload.get("filename") or "recording.webm",
    content_type=payload.get("content_type"),
    language_code=payload.get("language_code") or "unknown",
    mode=payload.get("mode") or "transcribe",
)
print(json.dumps(result))
`;
        const data = await runPythonWithPayload(pyScript, {
          temp_audio_path: tempAudioPath,
          filename,
          content_type: contentType,
          language_code: languageCode,
          mode,
        });
        res.status(200).json(data);
      } catch (error: any) {
        res.status(200).json({
          success: false,
          engine: 'sarvam',
          model: 'saaras:v4',
          transcript: '',
          detected_language: req.body?.language_code || 'unknown',
          mode: req.body?.mode || 'transcribe',
          error_type: 'service_unavailable',
          error_message:
            'Primary speech recognition service encountered an unexpected error. Switching to browser speech recognition.',
          fallback_recommended: true,
        });
      } finally {
        if (tempAudioPath && fs.existsSync(tempAudioPath)) {
          try {
            fs.unlinkSync(tempAudioPath);
          } catch {
            // Ignore cleanup errors
          }
        }
      }
    }
  );

  // Mount Vite middleware in development or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JANASEVA AI Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
