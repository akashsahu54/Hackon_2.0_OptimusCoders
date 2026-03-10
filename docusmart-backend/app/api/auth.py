"""Authentication API routes — register, login, refresh, profile (MongoDB)."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from datetime import datetime

from app.database import get_db
from app.schemas.user import UserRegister, UserLogin, TokenRefresh, UserResponse, UserWithToken, TokenResponse
from app.core.auth import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _user_doc_to_response(user: dict) -> UserResponse:
    """Convert MongoDB user document to a UserResponse schema."""
    return UserResponse(
        id=user["_id"],
        email=user["email"],
        full_name=user.get("full_name"),
        role=user.get("role", "user"),
        is_active=user.get("is_active", True),
        created_at=user.get("created_at"),
        last_login_at=user.get("last_login_at"),
    )


@router.post("/register", response_model=UserWithToken, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Database = Depends(get_db)):
    """Create a new user account."""
    existing = db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "full_name": data.full_name,
        "role": "user",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "last_login_at": None,
    }
    db.users.insert_one(user_doc)

    access_token = create_access_token(data={"sub": user_id})

    return UserWithToken(
        user=_user_doc_to_response(user_doc),
        access_token=access_token,
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Database = Depends(get_db)):
    """Authenticate user and return tokens."""
    user = db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    # Update last login
    db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login_at": datetime.utcnow()}})

    access_token = create_access_token(data={"sub": str(user["_id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})

    user["last_login_at"] = datetime.utcnow()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_user_doc_to_response(user),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(data: TokenRefresh, db: Database = Depends(get_db)):
    """Refresh an expired access token."""
    payload = decode_token(data.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload.get("sub")
    user = db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_access_token = create_access_token(data={"sub": str(user["_id"])})

    return TokenResponse(
        access_token=new_access_token,
        user=_user_doc_to_response(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return _user_doc_to_response(current_user)
