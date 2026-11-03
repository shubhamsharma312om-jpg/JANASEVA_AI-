"""Pydantic schemas for Departments (Entity D) and configurable category mappings."""

from typing import List
from pydantic import BaseModel, Field


class DepartmentResponse(BaseModel):
    department_id: str = Field(..., example="DEPT-WATER-01")
    department_name: str = Field(..., example="Water Supply Department")
    supported_categories: List[str] = Field(..., example=["Water Supply"])
    is_active: bool = Field(default=True)


class CategoryMappingItem(BaseModel):
    category: str = Field(..., example="Water Supply")
    department_id: str = Field(..., example="DEPT-WATER-01")
    department_name: str = Field(..., example="Water Supply Department")
    default_sla_hours: int = Field(..., example=24)
    description: str


class DepartmentListResponse(BaseModel):
    pilot_location: str = Field(..., example="Hyderabad")
    disclaimer: str
    departments: List[DepartmentResponse]
    category_mappings: List[CategoryMappingItem]
