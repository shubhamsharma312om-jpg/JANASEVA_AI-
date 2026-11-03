"""
Phase 1 Automated Verification Tests for JANASEVA AI Backend & SQLite Schema.
Can be run with `pytest` or directly with `python3 -m unittest backend/tests/test_health.py`.
"""

import json
import sqlite3
import unittest
from pathlib import Path
import sys

# Ensure backend directory is on sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.database.init_db import initialize_sqlite_database
from app.core.config import settings


class TestPhase1Foundation(unittest.TestCase):
    """Verifies SQLite database schema, foreign keys, and configurable department mappings."""

    def setUp(self) -> None:
        self.test_db_path = BACKEND_DIR / "janaseva.db"
        self.init_summary = initialize_sqlite_database(self.test_db_path)

    def test_database_tables_created(self) -> None:
        expected_tables = ["citizens", "departments", "grievance_history", "grievances"]
        self.assertEqual(sorted(self.init_summary["tables"]), expected_tables)

    def test_seven_demonstration_departments_seeded(self) -> None:
        self.assertEqual(self.init_summary["seeded_departments"], 7)

    def test_configurable_category_mappings(self) -> None:
        category_map = settings.get_category_to_department_map()
        self.assertEqual(len(category_map), 7)
        self.assertEqual(category_map["Water Supply"], "Water Supply Department")
        self.assertEqual(category_map["Roads and Potholes"], "Municipal Engineering")
        self.assertEqual(category_map["Garbage Collection"], "Sanitation Department")
        self.assertEqual(category_map["Electricity"], "Electricity Department")
        self.assertEqual(category_map["Streetlights"], "Electrical Maintenance")
        self.assertEqual(category_map["Drainage"], "Drainage Department")
        self.assertEqual(category_map["Public Safety"], "Relevant Civic Authority")

    def test_privacy_by_design_optional_citizen_fields(self) -> None:
        """Verify a citizen record can be inserted without name or contact_info."""
        conn = sqlite3.connect(str(self.test_db_path))
        try:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO citizens (citizen_id, name, contact_info, preferred_language) VALUES (?, ?, ?, ?)",
                ("CIT-TEST-001", None, None, "te"),
            )
            conn.commit()
            cursor.execute(
                "SELECT citizen_id, name, contact_info, preferred_language FROM citizens WHERE citizen_id = ?",
                ("CIT-TEST-001",),
            )
            row = cursor.fetchone()
            self.assertIsNotNone(row)
            self.assertIsNone(row[1])
            self.assertIsNone(row[2])
            self.assertEqual(row[3], "te")
            # Clean up test citizen
            cursor.execute("DELETE FROM citizens WHERE citizen_id = ?", ("CIT-TEST-001",))
            conn.commit()
        finally:
            conn.close()


if __name__ == "__main__":
    unittest.main()
