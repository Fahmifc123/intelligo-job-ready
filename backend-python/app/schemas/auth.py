from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.USER
    image: Optional[str] = None
    certificate_id: Optional[str] = None


class UserCreate(UserBase):
    password: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    certificate_id: Optional[str] = None


class UserResponse(UserBase):
    id: str
    email_verified: bool
    created_at: datetime
    updated_at: datetime
    banned: bool = False
    
    class Config:
        from_attributes = True


# Auth schemas
class LoginRequest(BaseModel):
    certificate_id: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: UserResponse
    token: str


class ErrorResponse(BaseModel):
    success: bool = False
    message: str


# Session schemas
class SessionResponse(BaseModel):
    user: Optional[UserResponse] = None


# Change password
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
