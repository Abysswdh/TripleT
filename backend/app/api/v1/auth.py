"""
Doable! Backend — Auth API Endpoints

Handles user profile creation/sync after Supabase Auth signup.
Note: Actual authentication (login/signup) is handled by Supabase Auth on the frontend.
These endpoints handle the backend side: profile sync and token verification.
"""
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUserId, DbSession
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/sync-profile", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def sync_user_profile(
    user_data: UserCreate,
    user_id: CurrentUserId,
    db: DbSession,
):
    """
    Sync user profile after Supabase Auth signup.

    Called by the frontend after a successful signup to create the
    corresponding user profile in our database.
    """
    # Verify the authenticated user matches the profile being created
    if user_data.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create profile for another user",
        )

    # Check if user already exists
    existing = await db.execute(select(User).where(User.id == user_id))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User profile already exists",
        )

    # Create user profile
    user = User(**user_data.model_dump())
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return user


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: CurrentUserId,
    db: DbSession,
):
    """Get the currently authenticated user's profile."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please complete onboarding.",
        )

    return user
