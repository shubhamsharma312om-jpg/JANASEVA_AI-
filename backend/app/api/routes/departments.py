"""
Departments & Configurable Category Mappings Endpoint: GET /api/departments/
Returns the seeded departments in SQLite and the configurable category mapping rules.
"""

import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.models.department import Department
from app.schemas.department import (
    DepartmentListResponse,
    DepartmentResponse,
    CategoryMappingItem,
)

router = APIRouter(prefix="/departments", tags=["Departments & Category Mapping"])


@router.get(
    "/",
    response_model=DepartmentListResponse,
    summary="List Civic Departments & Configurable Category Mappings",
)
def list_departments(db: Session = Depends(get_db)) -> DepartmentListResponse:
    """
    Retrieve all configured civic departments and the demonstration category-to-department
    mappings for the Hyderabad pilot.
    """
    mapping_config = settings.load_department_mappings()
    db_departments = db.query(Department).order_by(Department.department_id).all()

    dept_list = [
        DepartmentResponse(
            department_id=d.department_id,
            department_name=d.department_name,
            supported_categories=json.loads(d.supported_categories),
            is_active=bool(d.is_active),
        )
        for d in db_departments
    ]

    category_mappings = [
        CategoryMappingItem(**item) for item in mapping_config.get("mappings", [])
    ]

    return DepartmentListResponse(
        pilot_location=settings.PILOT_LOCATION,
        disclaimer=mapping_config["metadata"]["disclaimer"],
        departments=dept_list,
        category_mappings=category_mappings,
    )
