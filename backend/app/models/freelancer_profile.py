"""
Doable! Backend — Freelancer Profile Model
"""
import uuid
from typing import Optional

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class FreelancerProfile(Base, TimestampMixin):
    """Extended profile data for freelancer users."""

    __tablename__ = "freelancer_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # Professional info
    headline: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    hourly_rate: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    experience_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    availability: Mapped[Optional[str]] = mapped_column(String(30), default="available")
    badge_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Skills
    skills: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), default=[])
    verified_skills: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), default=[])

    # Stats
    completed_projects: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[Optional[float]] = mapped_column(Numeric(3, 2), default=0.00)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)
    response_time: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    total_earnings: Mapped[int] = mapped_column(Integer, default=0)

    # External links
    organization: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    github_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    portfolio_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Display
    starting_price: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    cover_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    about_me: Mapped[Optional[list[str]]] = mapped_column(ARRAY(String), default=[])

    # Relationships
    user = relationship("User", back_populates="freelancer_profile")

    def __repr__(self) -> str:
        return f"<FreelancerProfile user_id={self.user_id}>"
