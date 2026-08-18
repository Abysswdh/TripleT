"""
Doable! Backend — User Model

Synced from Supabase Auth. The `id` field matches the Supabase Auth user ID.
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, Boolean, Integer, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """User profile — extends Supabase Auth user with app-specific data."""

    __tablename__ = "users"

    # Primary key matches Supabase Auth user UUID
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
    )

    # Profile info
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Role: "freelancer" or "customer"
    role: Mapped[str] = mapped_column(String(50), default="customer", nullable=False)

    # Freelancer-specific
    skills: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), nullable=True)
    hourly_rate: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    experience_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Gamification
    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    streak_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    projects = relationship("Project", back_populates="owner", lazy="selectin")

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
