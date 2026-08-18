"""
Doable! Backend — API Dependencies

Shared dependencies for API route handlers (auth, DB session, etc.).
"""
import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.auth import auth_service

# Bearer token scheme
security = HTTPBearer()


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> uuid.UUID:
    """
    Dependency: Extract and verify the current user's ID from the Bearer token.

    Usage:
        @router.get("/me")
        async def get_me(user_id: uuid.UUID = Depends(get_current_user_id)):
            ...
    """
    return auth_service.get_user_id(credentials.credentials)


async def get_current_user_email(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> str:
    """Dependency: Extract the current user's email from the Bearer token."""
    email = auth_service.get_user_email(credentials.credentials)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not extract email from token",
        )
    return email


# Type aliases for cleaner route signatures
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUserId = Annotated[uuid.UUID, Depends(get_current_user_id)]
