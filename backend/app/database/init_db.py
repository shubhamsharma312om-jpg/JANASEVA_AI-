"""
Database initialization and seed script for JANASEVA AI (Phase 1).
Creates the SQLite database tables from schema.sql and seeds the 7 configurable
demonstration departments from department_mapping.json.
Can be run standalone (`python3 backend/app/database/init_db.py`) or called at FastAPI startup.
"""

import json
import sqlite3
from pathlib import Path
from typing import Dict, Any

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent.parent
SCHEMA_PATH = CURRENT_DIR / "schema.sql"
MAPPING_PATH = CURRENT_DIR.parent / "core" / "department_mapping.json"
DEFAULT_DB_PATH = BACKEND_DIR / "janaseva.db"


def initialize_sqlite_database(db_path: Path = DEFAULT_DB_PATH) -> Dict[str, Any]:
    """
    Create SQLite tables and seed initial demonstration departments.
    Returns summary metadata of initialized tables and seeded departments.
    """
    with open(SCHEMA_PATH, "r", encoding="utf-8") as schema_file:
        schema_sql = schema_file.read()

    with open(MAPPING_PATH, "r", encoding="utf-8") as mapping_file:
        mapping_data = json.load(mapping_file)

    conn = sqlite3.connect(str(db_path))
    try:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.executescript(schema_sql)

        # Group categories by department from the configurable JSON file
        dept_records: Dict[str, Dict[str, Any]] = {}
        for item in mapping_data.get("mappings", []):
            dept_id = item["department_id"]
            dept_name = item["department_name"]
            category = item["category"]
            if dept_id not in dept_records:
                dept_records[dept_id] = {
                    "department_id": dept_id,
                    "department_name": dept_name,
                    "supported_categories": [],
                }
            dept_records[dept_id]["supported_categories"].append(category)

        cursor = conn.cursor()
        for dept in dept_records.values():
            cursor.execute(
                """
                INSERT INTO departments (department_id, department_name, supported_categories)
                VALUES (?, ?, ?)
                ON CONFLICT(department_id) DO UPDATE SET
                    department_name = excluded.department_name,
                    supported_categories = excluded.supported_categories
                """,
                (
                    dept["department_id"],
                    dept["department_name"],
                    json.dumps(dept["supported_categories"]),
                ),
            )

        conn.commit()

        # Verify table list and department count
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
        )
        tables = [row[0] for row in cursor.fetchall()]

        cursor.execute("SELECT COUNT(*) FROM departments;")
        dept_count = cursor.fetchone()[0]

        return {
            "status": "initialized",
            "database_path": str(db_path),
            "tables": tables,
            "seeded_departments": dept_count,
        }
    finally:
        conn.close()


if __name__ == "__main__":
    result = initialize_sqlite_database()
    print(json.dumps(result, indent=2))
