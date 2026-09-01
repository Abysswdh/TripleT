"""
Doable! Backend — User Model

Synced from Supabase Auth. The `id` field matches the Supabase Auth user ID.
"""
import uuid
from typing import Optional

from sqlalchemy import Boolean, String, Text
from sqlalchemy.dialects.postgresql import UUID
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
    banner_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Role: "freelancer" or "customer"
    role: Mapped[str] = mapped_column(String(50), default="customer", nullable=False)

    # Contact & locale
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    timezone: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    projects = relationship(
        "Project", back_populates="owner", foreign_keys="[Project.owner_id]", lazy="selectin"
    )
    freelancer_profile = relationship(
        "FreelancerProfile", back_populates="user", uselist=False, lazy="selectin"
    )
    client_profile = relationship(
        "ClientProfile", back_populates="user", uselist=False, lazy="selectin"
    )
    identity_verification = relationship(
        "IdentityVerification", back_populates="user", uselist=False, lazy="selectin"
    )
    proposals = relationship("Proposal", back_populates="freelancer", lazy="selectin")
    portfolio_projects = relationship("PortfolioProject", back_populates="user", lazy="selectin")
    notifications = relationship("Notification", back_populates="user", lazy="selectin")

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
