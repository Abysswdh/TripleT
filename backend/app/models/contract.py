"""
Doable! Backend — Contract Model

Active agreements between client and freelancer.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class Contract(Base, TimestampMixin):
    """An active contract between a client and freelancer."""

    __tablename__ = "contracts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False
    )
    proposal_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("proposals.id"), unique=True, nullable=True
    )
    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    freelancer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    # Financial
    total_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    amount_display: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Status & progress
    status: Mapped[str] = mapped_column(String(30), default="active")
    progress: Mapped[int] = mapped_column(Integer, default=0)

    # Dates
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    project = relationship("Project", back_populates="contracts")
    proposal = relationship("Proposal")
    client = relationship("User", foreign_keys=[client_id])
    freelancer = relationship("User", foreign_keys=[freelancer_id])
    contract_milestones = relationship("ContractMilestone", back_populates="contract", lazy="selectin")
    escrow_transactions = relationship("EscrowTransaction", back_populates="contract", lazy="selectin")
    reviews = relationship("Review", back_populates="contract", lazy="selectin")
    conversations = relationship("Conversation", back_populates="contract", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Contract project={self.project_id} ({self.status})>"
