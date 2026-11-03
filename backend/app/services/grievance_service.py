"""
Grievance Service Layer (Phase 1 Foundation).
Separates HTTP routing from database persistence and NLP pipeline invocation.
"""

import uuid
from datetime import datetime, timezone
from app.ai_engine.pipeline import Phase1ModularNLPPipeline


class GrievanceService:
    """Orchestrates ticket generation, NLP pipeline routing, and database persistence."""

    def __init__(self) -> None:
        self.nlp_pipeline = Phase1ModularNLPPipeline()

    @staticmethod
    def generate_ticket_id() -> str:
        """Generate a human-readable, collision-resistant Hyderabad pilot ticket ID."""
        year = datetime.now(timezone.utc).year
        short_token = uuid.uuid4().hex[:6].upper()
        return f"JANA-HYD-{year}-{short_token}"

    @staticmethod
    def generate_citizen_id() -> str:
        """Generate a privacy-preserving citizen identifier."""
        year = datetime.now(timezone.utc).year
        short_token = uuid.uuid4().hex[:6].upper()
        return f"CIT-{year}-{short_token}"


grievance_service = GrievanceService()
