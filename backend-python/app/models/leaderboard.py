import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class LeaderboardCategory(Base):
    __tablename__ = "leaderboard_categories"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    entries = relationship("LeaderboardEntry", back_populates="category", cascade="all, delete-orphan")


class LeaderboardEntry(Base):
    __tablename__ = "leaderboard_entries"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    category_id = Column(String(36), ForeignKey("leaderboard_categories.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    cv_analysis_id = Column(String(36), ForeignKey("cv_analysis.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    total_score = Column(Integer, nullable=False)
    cv_score = Column(Integer, nullable=False)
    project_score = Column(Integer, nullable=True)
    attendance_score = Column(Integer, nullable=True)
    certification_score = Column(Integer, nullable=True)
    rank = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="leaderboard_entries")
    category = relationship("LeaderboardCategory", back_populates="entries")
    cv_analysis = relationship("CVAnalysis", back_populates="leaderboard_entries")
