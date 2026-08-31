"""
Doable! Backend — Escrow Transaction Model

Tracks fund holds, releases, and refunds for contracts.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class EscrowTransaction(Base):
    """An escrow transaction (hold/release/refund) for a contract."""

    __tablename__ = "escrow_transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    contract_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contracts.id"), nullable=False
    )
    contract_milestone_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contract_milestones.id"), nullable=True
    )

    # Transaction
    type: Mapped[str] = mapped_column(String(30), nullable=False)  # hold, release, refund
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="pending")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    contract = relationship("Contract", back_populates="escrow_transactions")
    contract_milestone = relationship("ContractMilestone")

    def __repr__(self) -> str:
        return f"<EscrowTransaction {self.type} {self.amount} ({self.status})>"
