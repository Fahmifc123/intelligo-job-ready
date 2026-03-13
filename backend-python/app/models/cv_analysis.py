import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class CVAnalysis(Base):
    __tablename__ = "cv_analysis"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    role = Column(String(100), nullable=False)
    overall_score = Column(Integer, nullable=False)
    skor_kecocokan_role = Column(Integer, nullable=False)
    suggestions = Column(JSON, nullable=False)
    kekuatan_utama = Column(JSON, nullable=False)
    gaps = Column(JSON, nullable=False)
    prioritas_perbaikan = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="cv_analyses")
    aspects = relationship("CVAnalysisAspect", back_populates="cv_analysis", cascade="all, delete-orphan")
    leaderboard_entries = relationship("LeaderboardEntry", back_populates="cv_analysis", cascade="all, delete-orphan")


class CVAnalysisAspect(Base):
    __tablename__ = "cv_analysis_aspects"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cv_analysis_id = Column(String(36), ForeignKey("cv_analysis.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    aspect_name = Column(String(100), nullable=False)
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    cv_analysis = relationship("CVAnalysis", back_populates="aspects")
