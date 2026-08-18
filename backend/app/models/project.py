"""
Doable! Backend — Project Model

Represents a gig/project posted by a customer for freelancers to work on.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, Integer, Numeric, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

import enum


class ProjectStatus(str, enum.Enum):
    """Project lifecycle status."""
    DRAFT = "draft"
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class BudgetType(str, enum.Enum):
    """Budget structure type."""
    FIXED = "fixed"
    HOURLY = "hourly"


class Project(Base, TimestampMixin):
    """A project/gig posted by a customer."""

    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # Project info
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Skills required
    required_skills: Mapped[Optional[list[str]]] = mapped_column(
        ARRAY(String), nullable=True
    )
    experience_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Budget
    budget_type: Mapped[str] = mapped_column(
        String(20), default=BudgetType.FIXED, nullable=False
    )
    budget_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    budget_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        String(20), default=ProjectStatus.DRAFT, nullable=False
    )

    # Owner (customer)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Assigned freelancer (nullable until assigned)
    freelancer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Relationships
    owner = relationship("User", back_populates="projects", foreign_keys=[owner_id])
    freelancer = relationship("User", foreign_keys=[freelancer_id])

    def __repr__(self) -> str:
        return f"<Project '{self.title}' ({self.status})>"
