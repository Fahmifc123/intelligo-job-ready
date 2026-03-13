import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base


class AlumniProfile(Base):
    __tablename__ = "alumni_profiles"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    full_name = Column(String(100), nullable=False)
    photo_url = Column(Text, nullable=True)
    bootcamp_name = Column(String(100), nullable=False)
    bootcamp_batch = Column(String(50), nullable=True)
    graduation_year = Column(Integer, nullable=False)
    is_public = Column(Boolean, nullable=False, default=False)
    portfolio_url = Column(Text, nullable=True)
    linkedin_url = Column(Text, nullable=True)
    github_url = Column(Text, nullable=True)
    twitter_url = Column(Text, nullable=True)
    email = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    current_location = Column(String(100), nullable=True)
    headline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    work_experience = Column(Text, nullable=True)
    education = Column(Text, nullable=True)
    certifications = Column(Text, nullable=True)
    testimonial = Column(Text, nullable=True)
    current_company = Column(String(100), nullable=True)
    current_role = Column(String(100), nullable=True)
    salary = Column(Numeric(12, 2), nullable=True)
    employment_status = Column(String(50), nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="alumni_profile")
    skills = relationship("AlumniSkill", back_populates="profile", cascade="all, delete-orphan")
    education_list = relationship("AlumniEducation", back_populates="profile", cascade="all, delete-orphan")
    certifications_list = relationship("AlumniCertification", back_populates="profile", cascade="all, delete-orphan")
    work_experiences = relationship("AlumniWorkExperience", back_populates="profile", cascade="all, delete-orphan")


class AlumniSkill(Base):
    __tablename__ = "alumni_skills"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alumni_profile_id = Column(String(36), ForeignKey("alumni_profiles.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    proficiency_level = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    profile = relationship("AlumniProfile", back_populates="skills")


class AlumniEducation(Base):
    __tablename__ = "alumni_education"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alumni_profile_id = Column(String(36), ForeignKey("alumni_profiles.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    school_name = Column(String(100), nullable=False)
    degree = Column(String(100), nullable=True)
    field_of_study = Column(String(100), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_current = Column(Boolean, nullable=False, default=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    profile = relationship("AlumniProfile", back_populates="education_list")


class AlumniCertification(Base):
    __tablename__ = "alumni_certifications"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alumni_profile_id = Column(String(36), ForeignKey("alumni_profiles.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    certification_name = Column(String(100), nullable=False)
    issuing_organization = Column(String(100), nullable=False)
    issue_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    credential_url = Column(Text, nullable=True)
    credential_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    profile = relationship("AlumniProfile", back_populates="certifications_list")


class AlumniWorkExperience(Base):
    __tablename__ = "alumni_work_experience"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alumni_profile_id = Column(String(36), ForeignKey("alumni_profiles.id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    company_name = Column(String(100), nullable=False)
    position = Column(String(100), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    is_current = Column(Boolean, nullable=False, default=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    profile = relationship("AlumniProfile", back_populates="work_experiences")
