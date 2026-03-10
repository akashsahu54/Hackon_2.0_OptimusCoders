"""Pydantic schemas for User API requests and responses."""

from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime


# ─── Request Schemas ───

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class TokenRefresh(BaseModel):
    refresh_token: str


# ─── Response Schemas ───

class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    role: str
    organization_id: Optional[UUID] = None
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse


class UserWithToken(BaseModel):
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
