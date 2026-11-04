import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const execFileAsync = promisify(execFile);
const ROOT_DIR = process.cwd();
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const DB_INIT_SCRIPT = path.join(BACKEND_DIR, 'app', 'database', 'init_db.py');

const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 18000);
const GEMINI_MAX_RETRIES = Number(process.env.GEMINI_MAX_RETRIES || 1);

// In-flight deduplication map for identical concurrent analysis requests
const inFlightAnalysisRequests = new Map<string, Promise<any>>();

function isRealGeminiKeyConfigured(): boolean {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  return Boolean(
    key &&
      key !== 'MY_GEMINI_API_KEY' &&
      key !== 'YOUR_GEMINI_API_KEY' &&
      key !== 'placeholder'
  );
}

interface GeminiAttemptResult {
  candidate: Record<string, any> | null;
  provenance: {
    gemini_attempted: boolean;
    gemini_succeeded: boolean;
    latency_ms: number;
    model: string;
    error_code: string | number | null;
    error_message: string | null;
  };
}

function isPermanentConfigError(err: any): boolean {
  const status = err?.status || err?.code;
  const msg = String(err?.message || '').toUpperCase();
  if (status === 400 || status === 401 || status === 403 || status === 404) {
    return true;
  }
  if (
    msg.includes('API_KEY_INVALID') ||
    msg.includes('PERMISSION_DENIED') ||
    msg.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT')
  ) {
    return true;
  }
  return false;
}

async function tryGeminiGrievanceAnalysis(
  transcript: string,
  preferredLanguage?: string,
  conversationContext?: Record<string, any> | null
): Promise<GeminiAttemptResult> {
  const modelName = (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim();
  if (!isRealGeminiKeyConfigured()) {
    return {
      candidate: null,
      provenance: {
        gemini_attempted: false,
        gemini_succeeded: false,
        latency_ms: 0,
        model: modelName,
        error_code: 'MISSING_API_KEY',
        error_message: 'GEMINI_API_KEY is not configured in server environment.',
      },
    };
  }

  const startTime = Date.now();
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const contextSection =
    conversationContext && conversationContext.original_transcript
      ? `\nPrevious Citizen Grievance Statement:\n"""\n${conversationContext.original_transcript}\n"""\nPreviously Extracted Details: ${JSON.stringify(
          {
            department_category: conversationContext.department_category || null,
            location: conversationContext.location || conversationContext.extracted_location || null,
          }
        )}\nCitizen Clarification Reply:\n"""\n${transcript}\n"""`
      : `Citizen Message:\n"""\n${transcript}\n"""`;

  const userPrompt = `${contextSection}\n${
    preferredLanguage
      ? `Preferred output language hint: ${preferredLanguage}`
      : 'Preserve the exact language of the citizen (Telugu, Hindi, or English) for clarification_question and enhanced_complaint.'
  }`;

  const systemInstruction =
    'You are JANASEVA AI, a multilingual civic grievance understanding assistant for Indian citizens (urban and rural).\n' +
    'Your primary responsibility is to understand genuine civic complaints and help citizens prepare accurate grievance registrations.\n' +
    'You must:\n' +
    '1. Understand the citizen\'s actual meaning across English, Telugu, Hindi, Hinglish, and Telugu-English code-mixed inputs.\n' +
    '2. Detect intent_type as one of: "CIVIC_GRIEVANCE", "GREETING", "GENERAL_QUESTION", "UNRELATED_QUERY", "AMBIGUOUS_REQUEST", "EMERGENCY_OR_IMMEDIATE_DANGER".\n' +
    '   - Only "CIVIC_GRIEVANCE" and "EMERGENCY_OR_IMMEDIATE_DANGER" have is_valid_grievance = true.\n' +
    '   - For "GREETING", "GENERAL_QUESTION", "UNRELATED_QUERY", or "AMBIGUOUS_REQUEST", set is_valid_grievance = false, department_category = null, enhanced_complaint = "", and write a polite, helpful response or clarification question in the citizen\'s language in clarification_question.\n' +
    '3. For genuine civic grievances, classify department_category strictly into one of these 7 exact categories:\n' +
    '   - "Water Supply"\n' +
    '   - "Roads and Potholes"\n' +
    '   - "Garbage Collection"\n' +
    '   - "Electricity"\n' +
    '   - "Streetlights"\n' +
    '   - "Drainage"\n' +
    '   - "Public Safety"\n' +
    '4. Extract ONLY explicitly stated information. Never invent a citizen name, mobile number, email, street, village, city, landmark, incident date, or duration. Return null for any unstated field.\n' +
    '5. Do NOT treat generic phrases like "our street", "our area", "main road", "the main road", or "nearby place" as actual street, area, or landmark names (leave them null).\n' +
    '6. Identify multiple separate civic issues in secondary_categories when more than one civic problem is reported.\n' +
    '7. Assess priority responsibly as "low", "normal", "high", or "critical" based on public health impact, safety risk, duration, and affected population. For "EMERGENCY_OR_IMMEDIATE_DANGER" (e.g., live electric wire on road, open manhole), set priority = "critical" and include a clear safety_advisory.\n' +
    '8. Generate a concise, grammatical, formal enhanced_complaint in the citizen\'s language without adding unsupported facts or promising government resolution.';

  let lastError: any = null;
  const maxAttempts = Math.max(1, 1 + GEMINI_MAX_RETRIES);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const geminiPromise = ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              intent_type: { type: Type.STRING },
              is_valid_grievance: { type: Type.BOOLEAN },
              detected_language: { type: Type.STRING },
              citizen_name: { type: Type.STRING, nullable: true },
              contact_number: { type: Type.STRING, nullable: true },
              email: { type: Type.STRING, nullable: true },
              designation: { type: Type.STRING, nullable: true },
              problem_summary: { type: Type.STRING },
              problem_description: { type: Type.STRING },
              location: {
                type: Type.OBJECT,
                properties: {
                  village: { type: Type.STRING, nullable: true },
                  town: { type: Type.STRING, nullable: true },
                  city: { type: Type.STRING, nullable: true },
                  district: { type: Type.STRING, nullable: true },
                  mandal: { type: Type.STRING, nullable: true },
                  ward: { type: Type.STRING, nullable: true },
                  area: { type: Type.STRING, nullable: true },
                  street: { type: Type.STRING, nullable: true },
                  house_number: { type: Type.STRING, nullable: true },
                  landmark: { type: Type.STRING, nullable: true },
                  pincode: { type: Type.STRING, nullable: true },
                  additional_location_details: {
                    type: Type.STRING,
                    nullable: true,
                  },
                },
              },
              problem_duration: { type: Type.STRING, nullable: true },
              incident_date: { type: Type.STRING, nullable: true },
              affected_people: { type: Type.STRING, nullable: true },
              department_category: { type: Type.STRING, nullable: true },
              classification_explanation: { type: Type.STRING, nullable: true },
              confidence_score: { type: Type.NUMBER, nullable: true },
              secondary_categories: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                nullable: true,
              },
              priority: { type: Type.STRING },
              priority_reason: { type: Type.STRING },
              safety_advisory: { type: Type.STRING, nullable: true },
              needs_clarification: { type: Type.BOOLEAN },
              clarification_question: { type: Type.STRING, nullable: true },
              enhanced_complaint: { type: Type.STRING },
            },
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          const timeoutErr: any = new Error(
            `Gemini API request timed out after ${GEMINI_TIMEOUT_MS}ms`
          );
          timeoutErr.code = 'GEMINI_TIMEOUT';
          reject(timeoutErr);
        }, GEMINI_TIMEOUT_MS);
      });

      const response = await Promise.race([geminiPromise, timeoutPromise]);
      const text = (response.text ?? '').trim();
      if (!text) {
        throw new Error('Empty response text from Gemini model');
      }
      const parsed = JSON.parse(text);
      return {
        candidate: parsed,
        provenance: {
          gemini_attempted: true,
          gemini_succeeded: true,
          latency_ms: Date.now() - startTime,
          model: modelName,
          error_code: null,
          error_message: null,
        },
      };
    } catch (err: any) {
      lastError = err;
      const errCode = err?.status || err?.code || 'GEMINI_ERROR';
      const errMsg = String(err?.message || 'Gemini analysis error').slice(0, 220);
      console.warn(
        `[JANASEVA AI] Gemini attempt ${attempt}/${maxAttempts} failed (${errCode}): ${errMsg}`
      );
      if (isPermanentConfigError(err) || attempt >= maxAttempts) {
        break;
      }
      // Exponential backoff before retry
      await new Promise((r) => setTimeout(r, 1200 * attempt));
    }
  }

  return {
    candidate: null,
    provenance: {
      gemini_attempted: true,
      gemini_succeeded: false,
      latency_ms: Date.now() - startTime,
      model: modelName,
      error_code: lastError?.status || lastError?.code || 'GEMINI_FAILED',
      error_message: String(lastError?.message || 'Gemini request failed').slice(
        0,
        200
      ),
    },
  };
}

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

  // 5. POST /api/grievances/ — Register a citizen-confirmed grievance in SQLite
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

lang = (payload.get("language") or "en").strip().lower()
if lang.startswith("te"):
    lang = "te"
elif lang.startswith("hi"):
    lang = "hi"
elif lang not in ("en", "te", "hi"):
    lang = "en"

citizen_id = payload.get("citizen_id") or f"CIT-2026-{uuid.uuid4().hex[:6].upper()}"
citizen_name = payload.get("citizen_name")
citizen_contact = payload.get("citizen_contact")

ticket_id = payload.get("ticket_id") or f"JANA-HYD-2026-{uuid.uuid4().hex[:4].upper()}"
raw_priority = str(payload.get("priority") or "MEDIUM").strip().upper()
prio_map = {
    "LOW": "LOW",
    "NORMAL": "MEDIUM",
    "MEDIUM": "MEDIUM",
    "HIGH": "HIGH",
    "CRITICAL": "CRITICAL",
}
priority = prio_map.get(raw_priority, "MEDIUM")

original_message = payload.get("original_message", "").strip()
translated_message = payload.get("translated_message")
confidence_score = float(payload.get("confidence_score") or 1.0)
confidence_score = max(0.0, min(1.0, confidence_score))

conn = sqlite3.connect(str(settings.SQLITE_DB_PATH))
conn.execute("PRAGMA foreign_keys = ON;")
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Prevent duplicate grievance submissions from the same citizen with identical message
cur.execute(
    """
    SELECT * FROM grievances
    WHERE citizen_id = ? AND original_message = ? AND status = 'SUBMITTED'
    ORDER BY created_at DESC LIMIT 1;
    """,
    (citizen_id, original_message)
)
existing_dup = cur.fetchone()
if existing_dup:
    dup_dict = dict(existing_dup)
    cur.execute("SELECT * FROM grievance_history WHERE ticket_id = ? ORDER BY history_id ASC;", (dup_dict["ticket_id"],))
    dup_dict["history"] = [dict(h) for h in cur.fetchall()]
    dup_dict["citizen_name"] = citizen_name
    dup_dict["citizen_contact"] = citizen_contact
    conn.close()
    print(json.dumps(dup_dict))
    sys.exit(0)

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
        translated_message,
        category,
        assigned_dept,
        priority,
        confidence_score,
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
        f"Complaint confirmed by citizen and routed to {assigned_dept} ({category}).",
        now
    )
)

conn.commit()
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

  // 12. GET /api/ai/status — Returns Intelligent Grievance Understanding Engine configuration status
  app.get(['/api/ai/status', '/api/ai/status/'], async (_req, res) => {
    try {
      const pyScript = `
import json
from app.core.config import settings

gemini_configured = settings.is_gemini_configured()
sarvam_configured = settings.is_sarvam_configured()
missing_vars = []
if not gemini_configured:
    missing_vars.append("GEMINI_API_KEY")
if not sarvam_configured:
    missing_vars.append("SARVAM_API_KEY")

print(json.dumps({
    "engine": "JANASEVA AI Intelligent Grievance Understanding Engine",
    "configured_provider": settings.AI_MODEL_PROVIDER,
    "gemini_model": settings.GEMINI_MODEL,
    "gemini_api_configured": gemini_configured,
    "sarvam_stt_model": settings.SARVAM_STT_MODEL,
    "sarvam_api_configured": sarvam_configured,
    "hybrid_python_validator_active": True,
    "missing_environment_variables": missing_vars,
    "supported_categories": [m["category"] for m in settings.get_all_department_records()]
}))
`;
      const data = await runPythonWithPayload(pyScript);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({
        detail: error?.message || 'Failed to inspect AI engine status',
      });
    }
  });

  // 13. POST /api/ai/analyze-grievance — Runs the Gemini-First + Python-Validated Grievance Understanding Pipeline
  app.post(
    ['/api/ai/analyze-grievance', '/api/ai/analyze-grievance/'],
    async (req, res) => {
      try {
        const body = req.body || {};
        const rawText =
          typeof body.transcript === 'string' && body.transcript.trim()
            ? body.transcript.trim()
            : typeof body.complaint_text === 'string'
              ? body.complaint_text.trim()
              : '';
        const transcript = rawText;
        const preferredLanguage =
          typeof body.preferred_language === 'string' &&
          body.preferred_language.trim()
            ? body.preferred_language.trim()
            : undefined;
        const conversationContext =
          body.conversation_context &&
          typeof body.conversation_context === 'object'
            ? body.conversation_context
            : null;

        if (!transcript || transcript.length < 2) {
          res.status(400).json({
            detail: 'Please provide a complaint description to analyze.',
          });
          return;
        }

        const dedupeKey = JSON.stringify({
          transcript,
          preferredLanguage: preferredLanguage || null,
          prevTranscript: conversationContext?.original_transcript || null,
        });

        let taskPromise = inFlightAnalysisRequests.get(dedupeKey);
        if (!taskPromise) {
          taskPromise = (async () => {
            // Stage A: Invoke Gemini (`gemini-3.8-flash`) with timeout & retry if GEMINI_API_KEY is configured
            const geminiAttempt = await tryGeminiGrievanceAnalysis(
              transcript,
              preferredLanguage,
              conversationContext
            );

            // Stage B: Execute Python Validation, Department Verification, Anti-Hallucination & Fallback Pipeline
            const pyScript = `
import json, sys
from app.ai_engine.pipeline import grievance_ai_pipeline

payload = json.loads(sys.argv[1])
result = grievance_ai_pipeline.analyze_grievance(
    transcript=payload.get("transcript", ""),
    preferred_language=payload.get("preferred_language"),
    llm_candidate=payload.get("llm_candidate"),
    llm_provenance=payload.get("llm_provenance"),
    conversation_context=payload.get("conversation_context"),
)
print(json.dumps(result))
`;
            return await runPythonWithPayload(pyScript, {
              transcript,
              preferred_language: preferredLanguage || null,
              llm_candidate: geminiAttempt.candidate,
              llm_provenance: geminiAttempt.provenance,
              conversation_context: conversationContext,
            });
          })();
          inFlightAnalysisRequests.set(dedupeKey, taskPromise);
        }

        try {
          const analyzed = await taskPromise;
          res.status(200).json(analyzed);
        } finally {
          inFlightAnalysisRequests.delete(dedupeKey);
        }
      } catch (error: any) {
        res.status(500).json({
          detail:
            error?.message ||
            'Failed to analyze grievance transcript. Please review and try again.',
        });
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
