"""
Doable! Backend — Milestone Model

Escrow milestone phases within a project listing.
"""
import uuid
from typing import Optional

from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

from datetime import datetime
from sqlalchemy import DateTime, func


class Milestone(Base):
    """A milestone/phase within a project."""

    __tablename__ = "milestones"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Milestone info
    phase: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    percentage: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    amount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    amount_display: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    deliverables: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), default=[])
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    project = relationship("Project", back_populates="milestones")
    tasks = relationship("ProjectTask", back_populates="milestone", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Milestone '{self.title}' (project={self.project_id})>"
