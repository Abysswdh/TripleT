"""
Doable! Backend — Supabase Auth Service

Verifies JWT tokens issued by Supabase Auth.
"""
import uuid
from typing import Optional

from jose import JWTError, jwt
from fastapi import HTTPException, status

from app.config import get_settings


class AuthService:
    """Service for Supabase JWT verification."""

    def __init__(self):
        self.settings = get_settings()

    def verify_token(self, token: str) -> dict:
        """
        Verify a Supabase JWT and return the decoded payload.

        Args:
            token: The JWT access token from Supabase Auth.

        Returns:
            Decoded JWT payload containing user info.

        Raises:
            HTTPException: If token is invalid or expired.
        """
        try:
            payload = jwt.decode(
                token,
                self.settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return payload
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid authentication token: {str(e)}",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def get_user_id(self, token: str) -> uuid.UUID:
        """Extract the user ID (sub) from a verified JWT."""
        payload = self.verify_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing user ID",
            )
        return uuid.UUID(user_id)

    def get_user_email(self, token: str) -> Optional[str]:
        """Extract the user email from a verified JWT."""
        payload = self.verify_token(token)
        return payload.get("email")


# Singleton
auth_service = AuthService()
