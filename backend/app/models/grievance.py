"""
Grievance (Entity B) and GrievanceHistory (Entity C) ORM Models.
Stores citizen complaints, multilingual metadata, department assignment, priority,
and immutable status transition audit logs.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base


class Grievance(Base):
    __tablename__ = "grievances"

    ticket_id = Column(String, primary_key=True, index=True)
    citizen_id = Column(String, ForeignKey("citizens.citizen_id"), nullable=False, index=True)
    original_message = Column(String, nullable=False)
    detected_language = Column(String, nullable=False)
    translated_message = Column(String, nullable=True)
    predicted_category = Column(String, nullable=False)
    assigned_department = Column(
        String, ForeignKey("departments.department_name"), nullable=False, index=True
    )
    priority = Column(String, nullable=False, default="MEDIUM")
    confidence_score = Column(Float, nullable=False, default=0.0)
    status = Column(String, nullable=False, default="SUBMITTED", index=True)
    created_at = Column(
        String,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
    updated_at = Column(
        String,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )

    citizen = relationship("Citizen", back_populates="grievances")
    history = relationship(
        "GrievanceHistory",
        back_populates="grievance",
        cascade="all, delete-orphan",
        order_by="GrievanceHistory.timestamp.asc()",
    )


class GrievanceHistory(Base):
    __tablename__ = "grievance_history"

    history_id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_id = Column(
        String, ForeignKey("grievances.ticket_id", ondelete="CASCADE"), nullable=False, index=True
    )
    previous_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    remarks = Column(String, nullable=False)
    timestamp = Column(
        String,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )

    grievance = relationship("Grievance", back_populates="history")
