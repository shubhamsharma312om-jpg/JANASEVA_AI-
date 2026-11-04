"""
Application configuration and configurable grievance category-to-department mapping loader.
Designed so routing mappings, language settings, Sarvam AI Saaras v4 configuration,
and the Intelligent Grievance Understanding Engine can be updated via environment variables.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MAPPING_FILE_PATH = Path(__file__).resolve().parent / "department_mapping.json"

# Officially documented Sarvam AI Saaras v4 language codes (22 Indian languages + English + unknown auto-detect)
SARVAM_SUPPORTED_LANGUAGE_CODES: List[str] = [
    "unknown",  # Automatic language detection mode
    "en-IN",    # English (Indian & Global)
    "te-IN",    # Telugu
    "hi-IN",    # Hindi
    "bn-IN",    # Bengali
    "gu-IN",    # Gujarati
    "kn-IN",    # Kannada
    "ml-IN",    # Malayalam
    "mr-IN",    # Marathi
    "od-IN",    # Odia
    "pa-IN",    # Punjabi
    "ta-IN",    # Tamil
    "as-IN",    # Assamese
    "ur-IN",    # Urdu
    "ne-IN",    # Nepali
    "kok-IN",   # Konkani
    "ks-IN",    # Kashmiri
    "sd-IN",    # Sindhi
    "sa-IN",    # Sanskrit
    "sat-IN",   # Santali
    "mni-IN",   # Manipuri
    "brx-IN",   # Bodo
    "mai-IN",   # Maithili
    "doi-IN",   # Dogri
]


class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "JANASEVA AI")
    TAGLINE: str = "Every Voice Matters. Every Grievance Counts."
    HACKATHON: str = "Neural Storm 2026"
    TRACK: str = "Human Impact (HI-02)"
    VERSION: str = os.getenv("PROJECT_VERSION", "0.2.0-ai-engine")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PILOT_LOCATION: str = os.getenv("PILOT_LOCATION", "Hyderabad")

    # SQLite Database URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "sqlite:///./janaseva.db"
    )
    SQLITE_DB_PATH: Path = BASE_DIR / "janaseva.db"

    # Initial target languages: English (en), Telugu (te), Hindi (hi)
    SUPPORTED_LANGUAGES: List[str] = os.getenv(
        "SUPPORTED_LANGUAGES", "en,te,hi"
    ).split(",")

    # Sarvam AI Saaras v4 Speech-to-Text Configuration (Backend-Only Secret)
    SARVAM_API_KEY: str = os.getenv("SARVAM_API_KEY", "").strip()
    SARVAM_STT_MODEL: str = os.getenv("SARVAM_STT_MODEL", "saaras:v4").strip()
    SARVAM_STT_ENDPOINT: str = os.getenv(
        "SARVAM_STT_ENDPOINT", "https://api.sarvam.ai/speech-to-text"
    ).strip()
    SARVAM_MAX_AUDIO_BYTES: int = int(
        os.getenv("SARVAM_MAX_AUDIO_BYTES", str(10 * 1024 * 1024))
    )
    SARVAM_TIMEOUT_SECONDS: int = int(
        os.getenv("SARVAM_TIMEOUT_SECONDS", "25")
    )
    SARVAM_LANGUAGE_CODES: List[str] = SARVAM_SUPPORTED_LANGUAGE_CODES

    # Intelligent Grievance Understanding Engine Configuration (Backend-Only Secrets)
    AI_MODEL_PROVIDER: str = os.getenv("AI_MODEL_PROVIDER", "gemini").strip().lower()
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash").strip()
    GEMINI_TIMEOUT_SECONDS: int = int(os.getenv("GEMINI_TIMEOUT_SECONDS", "18"))
    GEMINI_MAX_RETRIES: int = int(os.getenv("GEMINI_MAX_RETRIES", "1"))

    # Configurable Confidence Thresholds (Calibrated Engineering Thresholds)
    CONFIDENCE_HIGH_THRESHOLD: float = float(
        os.getenv("CONFIDENCE_HIGH_THRESHOLD", "0.80")
    )
    CONFIDENCE_MEDIUM_THRESHOLD: float = float(
        os.getenv("CONFIDENCE_MEDIUM_THRESHOLD", "0.60")
    )

    # Supported Grievance Intent Classification Values
    SUPPORTED_INTENT_TYPES: List[str] = [
        "CIVIC_GRIEVANCE",
        "GREETING",
        "GENERAL_QUESTION",
        "UNRELATED_QUERY",
        "AMBIGUOUS_REQUEST",
        "EMERGENCY_OR_IMMEDIATE_DANGER",
    ]

    CORS_ORIGINS: List[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"
    ).split(",")

    @classmethod
    def is_sarvam_configured(cls) -> bool:
        """Return True if a real SARVAM_API_KEY is present in the backend environment."""
        key = os.getenv("SARVAM_API_KEY", cls.SARVAM_API_KEY).strip()
        return bool(
            key
            and key not in (
                "YOUR_SARVAM_API_KEY",
                "MY_SARVAM_API_KEY",
                "placeholder",
            )
        )

    @classmethod
    def is_gemini_configured(cls) -> bool:
        """Return True if a real GEMINI_API_KEY is present in the backend environment."""
        key = os.getenv("GEMINI_API_KEY", cls.GEMINI_API_KEY).strip()
        return bool(
            key
            and key not in (
                "MY_GEMINI_API_KEY",
                "YOUR_GEMINI_API_KEY",
                "placeholder",
            )
        )

    @staticmethod
    def load_department_mappings() -> Dict[str, Any]:
        """Load configurable category-to-department mappings from JSON file."""
        with open(MAPPING_FILE_PATH, "r", encoding="utf-8") as f:
            return json.load(f)

    @classmethod
    def get_category_to_department_map(cls) -> Dict[str, str]:
        """Return a dictionary mapping Category Name -> Department Name."""
        data = cls.load_department_mappings()
        return {
            item["category"]: item["department_name"]
            for item in data.get("mappings", [])
        }

    @classmethod
    def get_all_department_records(cls) -> List[Dict[str, Any]]:
        """Return all 7 configured department mapping records from department_mapping.json."""
        data = cls.load_department_mappings()
        return list(data.get("mappings", []))

    @classmethod
    def get_department_record_by_category(cls, category: str) -> Optional[Dict[str, Any]]:
        """Return the full mapping dictionary for a given category name."""
        for item in cls.get_all_department_records():
            if item["category"].lower() == (category or "").strip().lower():
                return item
        return None


settings = Settings()
