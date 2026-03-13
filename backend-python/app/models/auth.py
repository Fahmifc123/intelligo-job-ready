import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"


class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(50), nullable=False, unique=True)
    email_verified = Column(Boolean, nullable=False, default=False)
    name = Column(String(50), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    image = Column(Text, nullable=True)
    certificate_id = Column(String(50), nullable=True, unique=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    banned = Column(Boolean, nullable=False, default=False)
    ban_reason = Column(Text, nullable=True)
    ban_expires = Column(DateTime, nullable=True)
    
    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    alumni_profile = relationship("AlumniProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    cv_analyses = relationship("CVAnalysis", back_populates="user", cascade="all, delete-orphan")
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="user", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    expires_at = Column(DateTime, nullable=False)
    token = Column(Text, nullable=False, unique=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    ip_address = Column(Text, nullable=True)
    user_agent = Column(Text, nullable=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    impersonated_by = Column(String(36), nullable=True)
    
    user = relationship("User", back_populates="sessions")


class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(Text, nullable=False)
    provider_id = Column(Text, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    id_token = Column(Text, nullable=True)
    access_token_expires_at = Column(DateTime, nullable=True)
    refresh_token_expires_at = Column(DateTime, nullable=True)
    scope = Column(Text, nullable=True)
    password = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
    
    user = relationship("User", back_populates="accounts")


class Verification(Base):
    __tablename__ = "verification"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    identifier = Column(String(255), nullable=False)
    value = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
