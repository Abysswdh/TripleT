"""
Doable! Backend — Notification Model

In-app notifications for users.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, Boolean, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Notification(Base):
    """An in-app notification for a user."""

    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Notification content
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Reference (polymorphic link)
    reference_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)

    # Status
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="notifications")

    def __repr__(self) -> str:
        return f"<Notification '{self.title}' ({self.type})>"


class UserNotificationSettings(Base):
    """User's notification preferences."""

    __tablename__ = "user_notification_settings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # Email preferences
    email_proposals: Mapped[bool] = mapped_column(Boolean, default=True)
    email_milestones: Mapped[bool] = mapped_column(Boolean, default=True)
    email_messages: Mapped[bool] = mapped_column(Boolean, default=True)
    email_marketing: Mapped[bool] = mapped_column(Boolean, default=False)

    # In-app preferences
    in_app_milestones: Mapped[bool] = mapped_column(Boolean, default=True)
    in_app_chat: Mapped[bool] = mapped_column(Boolean, default=True)
    sound_effects: Mapped[bool] = mapped_column(Boolean, default=True)

    # Locale
    language: Mapped[str] = mapped_column(String(10), default="id")
    currency: Mapped[str] = mapped_column(String(10), default="IDR")

    # Timestamp
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship("User")

    def __repr__(self) -> str:
        return f"<UserNotificationSettings user_id={self.user_id}>"
