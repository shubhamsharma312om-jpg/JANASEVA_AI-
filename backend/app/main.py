"""
JANASEVA AI — FastAPI Application Entry Point
Every Voice Matters. Every Grievance Counts.
Hackathon: Neural Storm 2026 | Track: Human Impact (HI-02)
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.init_db import initialize_sqlite_database
from app.api.routes import health, departments, grievances, speech


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize SQLite schema and seed demonstration departments on startup."""
    initialize_sqlite_database(settings.SQLITE_DB_PATH)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        f"{settings.TAGLINE} — Multilingual Citizen Grievance Platform "
        f"({settings.HACKATHON}, {settings.TRACK})."
    ),
    version=settings.VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(departments.router, prefix="/api")
app.include_router(grievances.router, prefix="/api")
app.include_router(speech.router, prefix="/api")


@app.get("/", tags=["Root"])
def read_root():
    return {
        "project": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "phase": "Phase 1 Foundation + Multilingual Voice Engine (Sarvam Saaras v4)",
        "docs_url": "/docs",
        "health_endpoint": "/api/health",
    }
