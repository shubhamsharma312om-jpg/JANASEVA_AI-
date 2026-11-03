"""
Citizen ORM Model (Entity A).
Privacy-by-Design: Name and contact information are optional so citizens can
submit and track civic grievances using only a system-generated citizen_id and ticket_id.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.database.session import Base


class Citizen(Base):
    __tablename__ = "citizens"

    citizen_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=True)
    contact_info = Column(String, nullable=True)
    preferred_language = Column(String, nullable=False, default="en")
    created_at = Column(
        String,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )

    grievances = relationship("Grievance", back_populates="citizen")
