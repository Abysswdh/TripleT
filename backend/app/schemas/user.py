"""
Doable! Backend — User Pydantic Schemas (Unified Dual-Role Architecture)
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

# --- Sub-Profile Schemas ---

class FreelancerProfileData(BaseModel):
    """Freelancer-specific details."""
    id: Optional[uuid.UUID] = None
    headline: Optional[str] = None
    hourly_rate: Optional[int] = None
    experience_level: Optional[str] = None
    availability: Optional[str] = None
    badge_level: Optional[str] = None
    category: Optional[str] = None
    skills: Optional[list[str]] = None
    verified_skills: Optional[list[str]] = None
    completed_projects: int = 0
    rating: float = 0.0
    reviews_count: int = 0
    total_earnings: int = 0
    organization: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None

    model_config = {"from_attributes": True}


class ClientProfileData(BaseModel):
    """Client / Company details."""
    id: Optional[uuid.UUID] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None
    client_type: Optional[str] = None
    industry: Optional[str] = None
    billing_address: Optional[str] = None
    tax_id: Optional[str] = None
    is_verified: bool = False

    model_config = {"from_attributes": True}


# --- Base ---

class UserBase(BaseModel):
    """Shared user fields across both Freelancer and Client modes."""
    email: EmailStr
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    bio: Optional[str] = None
    role: str = "customer"
    phone: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None


# --- Create ---

class UserCreate(UserBase):
    """Fields needed when creating a user profile (after Supabase Auth signup)."""
    id: uuid.UUID  # From Supabase Auth


# --- Update ---

class UserUpdate(BaseModel):
    """Fields that can be updated for the account."""
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    timezone: Optional[str] = None


# --- Response ---

class UserResponse(UserBase):
    """Unified user response containing core identity plus both sub-profiles."""
    id: uuid.UUID
    is_active: bool = True
    is_verified: bool = False
    onboarding_completed: bool = False
    created_at: datetime
    updated_at: datetime

    # Dual-Role Sub-profiles
    freelancer_profile: Optional[FreelancerProfileData] = None
    client_profile: Optional[ClientProfileData] = None

    model_config = {"from_attributes": True}


class UserProfile(BaseModel):
    """Minimal public user profile."""
    id: uuid.UUID
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    role: str
    is_verified: bool = False
    freelancer_profile: Optional[FreelancerProfileData] = None
    client_profile: Optional[ClientProfileData] = None

    model_config = {"from_attributes": True}
