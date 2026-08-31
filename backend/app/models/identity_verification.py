"""
Doable! Backend — Identity Verification Model

KTP/Passport verification for trust & safety.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class IdentityVerification(Base, TimestampMixin):
    """Identity document verification record."""

    __tablename__ = "identity_verifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # Document
    document_type: Mapped[str] = mapped_column(String(30), nullable=False)  # 'ktp', 'passport'
    document_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    document_image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    selfie_image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Review
    status: Mapped[str] = mapped_column(
        String(30), default="pending"
    )  # pending, approved, rejected
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )

    # Relationships
    user = relationship(
        "User", back_populates="identity_verification", foreign_keys=[user_id]
    )

    def __repr__(self) -> str:
        return f"<IdentityVerification user_id={self.user_id} ({self.status})>"
