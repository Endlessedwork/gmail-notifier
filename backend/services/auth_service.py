from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from backend.models import User
from backend.core.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)


class AuthService:
    """Service layer for user authentication"""

    @staticmethod
    def register(
        db: Session,
        username: str,
        email: str,
        password: str,
    ) -> User:
        """Register a new user"""
        user = User(
            username=username,
            email=email,
            hashed_password=hash_password(password),
        )

        try:
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already exists",
            )

    @staticmethod
    def authenticate(
        db: Session,
        username: str,
        password: str,
    ) -> Optional[User]:
        """Authenticate user by username/email and password"""
        user = (
            db.query(User)
            .filter((User.username == username) | (User.email == username))
            .first()
        )

        if user is None or not verify_password(password, user.hashed_password):
            return None

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is disabled",
            )

        return user

    @staticmethod
    def create_tokens(db: Session, user: User) -> dict:
        """Create access and refresh tokens for user"""
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})

        # Save refresh token to database
        user.refresh_token = refresh_token
        db.commit()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> dict:
        """Create new access token from refresh token"""
        payload = decode_refresh_token(refresh_token)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        user = db.query(User).filter(User.id == int(user_id)).first()

        if not user or user.refresh_token != refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or revoked refresh token",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is disabled",
            )

        # Create new access token
        access_token = create_access_token(data={"sub": str(user.id)})

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_count(db: Session) -> int:
        """Get total number of users"""
        return db.query(User).count()

    @staticmethod
    def find_or_create_google_user(
        db: Session,
        google_id: str,
        email: str,
        username: str,
    ) -> User:
        """Find existing user by google_id or create new one"""
        # Try to find by google_id first
        user = db.query(User).filter(User.google_id == google_id).first()
        if user:
            return user

        # Try to find by email (in case user already registered with password)
        user = db.query(User).filter(User.email == email).first()
        if user:
            # Link Google account to existing user
            user.google_id = google_id
            db.commit()
            db.refresh(user)
            return user

        # Create new user (set dummy hashed_password for OAuth users)
        # Use a fixed dummy password for OAuth-only users (they won't use it anyway)
        user = User(
            username=username,
            email=email,
            google_id=google_id,
            hashed_password=hash_password("oauth_user_no_password"),
        )

        try:
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        except IntegrityError:
            db.rollback()
            # Username might conflict, try with email prefix + random suffix
            import random

            username = f"{email.split('@')[0]}_{random.randint(1000, 9999)}"
            user.username = username
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
