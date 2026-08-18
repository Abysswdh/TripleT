"""
Doable! Backend — Project Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.project import ProjectStatus, BudgetType


# --- Base ---

class ProjectBase(BaseModel):
    """Shared project fields."""
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    category: Optional[str] = None
    required_skills: Optional[list[str]] = None
    experience_level: Optional[str] = None
    budget_type: str = BudgetType.FIXED
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None


# --- Create ---

class ProjectCreate(ProjectBase):
    """Fields needed to create a new project."""
    pass


# --- Update ---

class ProjectUpdate(BaseModel):
    """Fields that can be updated."""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    category: Optional[str] = None
    required_skills: Optional[list[str]] = None
    experience_level: Optional[str] = None
    budget_type: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    status: Optional[str] = None


# --- Response ---

class ProjectResponse(ProjectBase):
    """Full project response."""
    id: uuid.UUID
    status: str = ProjectStatus.DRAFT
    owner_id: uuid.UUID
    freelancer_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    """Paginated project list."""
    items: list[ProjectResponse]
    total: int
    page: int
    per_page: int
