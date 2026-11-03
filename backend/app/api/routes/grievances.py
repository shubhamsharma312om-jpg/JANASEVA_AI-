"""
Grievance API Routes:
- POST   /api/grievances/                   (Submit citizen grievance using Phase 1 department mapping; no AI model yet)
- GET    /api/grievances/{ticket_id}        (Track grievance resolution status by ticket ID)
- GET    /api/grievances/                   (List & filter grievances for administrators)
- PATCH  /api/grievances/{ticket_id}/status (Update grievance status, priority, department & append history log)
"""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.models.citizen import Citizen
from app.models.grievance import Grievance, GrievanceHistory
from app.schemas.grievance import (
    GrievanceCreateRequest,
    GrievanceResponse,
    GrievanceStatusUpdateRequest,
)
from app.services.grievance_service import grievance_service

router = APIRouter(prefix="/grievances", tags=["Citizen Grievances"])


@router.post(
    "/",
    response_model=GrievanceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a Citizen Grievance (Manual Category Mapping — Pre-AI Phase)",
)
def create_grievance(
    payload: GrievanceCreateRequest,
    db: Session = Depends(get_db),
):
    """
    Registers a citizen grievance in SQLite using the Phase 1 configurable
    category-to-department mapping without invoking any AI model.
    """
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    category = payload.category or "Public Safety"
    cat_map = settings.get_category_to_department_map()
    assigned_dept = cat_map.get(category, "Relevant Civic Authority")

    citizen_id = payload.citizen_id or grievance_service.generate_citizen_id()
    citizen = db.query(Citizen).filter(Citizen.citizen_id == citizen_id).first()
    if not citizen:
        citizen = Citizen(
            citizen_id=citizen_id,
            name=payload.citizen_name,
            contact_info=payload.citizen_contact,
            preferred_language=payload.language or "en",
            created_at=now,
        )
        db.add(citizen)
    else:
        if payload.citizen_name:
            citizen.name = payload.citizen_name
        if payload.citizen_contact:
            citizen.contact_info = payload.citizen_contact

    ticket_id = grievance_service.generate_ticket_id()
    grievance = Grievance(
        ticket_id=ticket_id,
        citizen_id=citizen_id,
        original_message=payload.original_message.strip(),
        detected_language=payload.language or "en",
        translated_message=None,
        predicted_category=category,
        assigned_department=assigned_dept,
        priority=payload.priority or "MEDIUM",
        confidence_score=1.0,
        status="SUBMITTED",
        created_at=now,
        updated_at=now,
    )
    db.add(grievance)

    history = GrievanceHistory(
        ticket_id=ticket_id,
        previous_status=None,
        new_status="SUBMITTED",
        remarks=f"Complaint registered and mapped to {assigned_dept} ({category}).",
        timestamp=now,
    )
    db.add(history)
    db.commit()
    db.refresh(grievance)
    return grievance


@router.get(
    "/{ticket_id}",
    response_model=GrievanceResponse,
    summary="Track Grievance Status & History by Ticket ID",
)
def get_grievance_by_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.ticket_id == ticket_id).first()
    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grievance ticket '{ticket_id}' not found.",
        )
    return grievance


@router.get(
    "/",
    response_model=List[GrievanceResponse],
    summary="List Grievances (Administrator Queue)",
)
def list_grievances(
    department: Optional[str] = Query(None, description="Filter by assigned department"),
    ticket_status: Optional[str] = Query(None, alias="status", description="Filter by ticket status"),
    priority: Optional[str] = Query(None, description="Filter by priority level"),
    db: Session = Depends(get_db),
):
    query = db.query(Grievance)
    if department:
        query = query.filter(Grievance.assigned_department == department)
    if ticket_status:
        query = query.filter(Grievance.status == ticket_status)
    if priority:
        query = query.filter(Grievance.priority == priority)
    return query.order_by(Grievance.created_at.desc()).all()


@router.patch(
    "/{ticket_id}/status",
    response_model=GrievanceResponse,
    summary="Update Grievance Status, Priority, or Department & Record Audit History",
)
def update_grievance_status(
    ticket_id: str,
    payload: GrievanceStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    grievance = db.query(Grievance).filter(Grievance.ticket_id == ticket_id).first()
    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Grievance ticket '{ticket_id}' not found.",
        )

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    prev_status = grievance.status
    db_status_map = {
        "SUBMITTED": "SUBMITTED",
        "ASSIGNED": "ROUTED",
        "ROUTED": "ROUTED",
        "IN_PROGRESS": "IN_PROGRESS",
        "RESOLVED": "RESOLVED",
        "REJECTED": "REJECTED",
        "CLOSED": "CLOSED",
    }

    if payload.new_status:
        grievance.status = db_status_map.get(payload.new_status, prev_status)
    if payload.priority:
        grievance.priority = payload.priority
    if payload.assigned_department:
        grievance.assigned_department = payload.assigned_department
    grievance.updated_at = now

    history = GrievanceHistory(
        ticket_id=ticket_id,
        previous_status=prev_status,
        new_status=grievance.status,
        remarks=payload.remarks,
        timestamp=now,
    )
    db.add(history)
    db.commit()
    db.refresh(grievance)
    return grievance
