"""Pydantic schemas for Citizen (Entity A) with privacy-first optional PII."""

from typing import Literal, Optional
from pydantic import BaseModel, Field


class CitizenCreate(BaseModel):
    name: Optional[str] = Field(
        None,
        max_length=120,
        description="Optional citizen name. Not required for submitting a grievance.",
    )
    contact_info: Optional[str] = Field(
        None,
        max_length=120,
        description="Optional phone or email for notifications. Stored only if voluntarily provided.",
    )
    preferred_language: Literal["en", "te", "hi"] = Field(
        default="en",
        description="Preferred language code: 'en' (English), 'te' (Telugu), or 'hi' (Hindi).",
    )


class CitizenResponse(CitizenCreate):
    citizen_id: str = Field(..., example="CIT-2026-8F4A2C")
    created_at: str

    class Config:
        from_attributes = True
