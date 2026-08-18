"""
Doable! Backend — User Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# --- Base ---

class UserBase(BaseModel):
    """Shared user fields."""
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    role: str = "customer"


# --- Create ---

class UserCreate(UserBase):
    """Fields needed when creating a user profile (after Supabase Auth signup)."""
    id: uuid.UUID  # From Supabase Auth


# --- Update ---

class UserUpdate(BaseModel):
    """Fields that can be updated."""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = None
    skills: Optional[list[str]] = None
    hourly_rate: Optional[int] = None
    experience_level: Optional[str] = None


# --- Response ---

class UserResponse(UserBase):
    """User response with all public fields."""
    id: uuid.UUID
    skills: Optional[list[str]] = None
    hourly_rate: Optional[int] = None
    experience_level: Optional[str] = None
    xp: int = 0
    streak_days: int = 0
    level: int = 1
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfile(BaseModel):
    """Minimal user profile for public listings."""
    id: uuid.UUID
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    skills: Optional[list[str]] = None
    level: int = 1
    is_verified: bool = False

    model_config = {"from_attributes": True}
