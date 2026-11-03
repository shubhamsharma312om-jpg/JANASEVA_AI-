"""Pydantic schemas for the /api/health endpoint."""

from typing import List
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    project: str = Field(..., example="JANASEVA AI")
    tagline: str = Field(..., example="Every Voice Matters. Every Grievance Counts.")
    phase: str = Field(..., example="Phase 1 — Project Foundation and Architecture")
    pilot_location: str = Field(..., example="Hyderabad")
    supported_languages: List[str] = Field(..., example=["en", "te", "hi"])
    database_status: str = Field(..., example="connected")
    seeded_departments_count: int = Field(..., example=7)
    timestamp: str = Field(..., example="2026-11-03T08:00:00Z")
