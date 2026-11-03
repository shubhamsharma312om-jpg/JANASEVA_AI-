"""
Department ORM Model (Entity D).
Stores demonstration municipal/civic departments and their supported categories.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer
from app.database.session import Base


class Department(Base):
    __tablename__ = "departments"

    department_id = Column(String, primary_key=True, index=True)
    department_name = Column(String, nullable=False, unique=True)
    supported_categories = Column(String, nullable=False)  # JSON-encoded list of categories
    is_active = Column(Integer, nullable=False, default=1)
    created_at = Column(
        String,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    )
