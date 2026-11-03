"""
Pydantic schemas for Grievances (Entity B) and Grievance History (Entity C).
Defines the contracts for POST /api/grievances/, GET /api/grievances/{ticket_id},
GET /api/grievances/, and PATCH /api/grievances/{ticket_id}/status.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field

GrievanceStatus = Literal[
    "SUBMITTED", "ROUTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"
]
PriorityLevel = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL", "PENDING"]


class GrievanceCreateRequest(BaseModel):
    original_message: str = Field(
        ...,
        min_length=5,
        max_length=2000,
        description="Citizen grievance text in English, Telugu, or Hindi.",
    )
    category: Optional[str] = Field(
        default="Public Safety",
        description="Optional manually selected grievance category (pre-AI phase).",
    )
    language: Optional[Literal["en", "te", "hi"]] = Field(
        default="en",
        description="Selected language code: 'en', 'te', or 'hi'.",
    )
    priority: Optional[PriorityLevel] = Field(
        default="MEDIUM",
        description="Optional priority level.",
    )
    citizen_id: Optional[str] = Field(
        default=None,
        description="Optional citizen ID if logged in.",
    )
    citizen_name: Optional[str] = Field(
        default=None,
        max_length=120,
        description="Optional citizen name (Privacy-by-Design: not mandatory).",
    )
    citizen_contact: Optional[str] = Field(
        default=None,
        max_length=120,
        description="Optional citizen contact details.",
    )


class GrievanceStatusUpdateRequest(BaseModel):
    new_status: Optional[GrievanceStatus] = Field(
        default=None,
        description="Target lifecycle status for the grievance ticket.",
    )
    priority: Optional[PriorityLevel] = Field(
        default=None,
        description="Updated priority level.",
    )
    assigned_department: Optional[str] = Field(
        default=None,
        description="Updated assigned department name.",
    )
    remarks: str = Field(
        default="Updated by Municipal Administrator.",
        min_length=3,
        max_length=500,
        description="Official remarks explaining the status transition.",
    )


class GrievanceHistoryItem(BaseModel):
    history_id: int
    ticket_id: str
    previous_status: Optional[str] = None
    new_status: str
    remarks: str
    timestamp: str

    class Config:
        from_attributes = True


class GrievanceResponse(BaseModel):
    ticket_id: str
    citizen_id: str
    original_message: str
    detected_language: str
    translated_message: Optional[str] = None
    predicted_category: str
    assigned_department: str
    priority: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    status: str
    created_at: str
    updated_at: str
    citizen_name: Optional[str] = None
    citizen_contact: Optional[str] = None
    history: List[GrievanceHistoryItem] = Field(default_factory=list)

    class Config:
        from_attributes = True
