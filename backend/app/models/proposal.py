"""
Doable! Backend — Proposal Model

Freelancer bids/proposals on projects.
"""
import uuid
from typing import Optional

from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Proposal(Base, TimestampMixin):
    """A freelancer's bid/proposal on a project."""

    __tablename__ = "proposals"
    __table_args__ = (
        UniqueConstraint("project_id", "freelancer_id", name="uq_proposal_project_freelancer"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    freelancer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Bid details
    bid_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    bid_display: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    delivery_days: Mapped[int] = mapped_column(Integer, nullable=False)
    cover_letter: Mapped[str] = mapped_column(Text, nullable=False)
    skills: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), default=[])

    # Status
    status: Mapped[str] = mapped_column(String(30), default="pending")

    # Relationships
    project = relationship("Project", back_populates="proposals")
    freelancer = relationship("User", back_populates="proposals")

    def __repr__(self) -> str:
        return (
            f"<Proposal project={self.project_id} "
            f"freelancer={self.freelancer_id} ({self.status})>"
        )
