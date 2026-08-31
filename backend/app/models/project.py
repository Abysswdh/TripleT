"""
Doable! Backend — Project Model

Represents a gig/project posted by a customer for freelancers to work on.
"""
import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class ProjectStatus(str, enum.Enum):
    """Project lifecycle status."""
    DRAFT = "draft"
    OPEN = "open"
    HIRING = "hiring"
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
    difficulty: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    experience_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Budget
    budget_type: Mapped[str] = mapped_column(
        String(20), default=BudgetType.FIXED, nullable=False
    )
    budget_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    budget_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    budget_display: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Timeline
    timeline_days: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(
        String(30), default=ProjectStatus.DRAFT, nullable=False
    )

    # Dummy project flag
    is_dummy: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Marketplace stats
    proposals_count: Mapped[int] = mapped_column(Integer, default=0)

    # Content
    objectives: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), nullable=True)
    benchmark_score: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    benchmark_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Escrow
    escrow_secured: Mapped[bool] = mapped_column(Boolean, default=False)

    # Dates
    posted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

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
    milestones = relationship("Milestone", back_populates="project", lazy="selectin")
    tasks = relationship("ProjectTask", back_populates="project", lazy="selectin")
    proposals = relationship("Proposal", back_populates="project", lazy="selectin")
    contracts = relationship("Contract", back_populates="project", lazy="selectin")
    files = relationship("ProjectFile", back_populates="project", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Project '{self.title}' ({self.status})>"
