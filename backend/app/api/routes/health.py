"""
Working Health Check Endpoint: GET /api/health
Verifies FastAPI responsiveness, SQLite database connectivity, and seeded departments count.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.models.department import Department
from app.schemas.health import HealthResponse

router = APIRouter(tags=["System Health"])


@router.get("/health", response_model=HealthResponse, summary="Verify Backend & SQLite Health")
def check_health(db: Session = Depends(get_db)) -> HealthResponse:
    """
    Returns operational health of the JANASEVA AI backend, SQLite database connection,
    pilot location, supported regional languages, and seeded demonstration departments.
    """
    try:
        dept_count = db.query(Department).count()
        db_status = "connected"
    except Exception:
        dept_count = 0
        db_status = "error"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        project=settings.PROJECT_NAME,
        tagline=settings.TAGLINE,
        phase="Phase 1 — Project Foundation and Architecture",
        pilot_location=settings.PILOT_LOCATION,
        supported_languages=settings.SUPPORTED_LANGUAGES,
        database_status=db_status,
        seeded_departments_count=dept_count,
        timestamp=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
