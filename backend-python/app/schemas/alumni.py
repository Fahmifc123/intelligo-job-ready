from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


# Skill schemas
class SkillBase(BaseModel):
    skill_name: str
    proficiency_level: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Education schemas
class EducationBase(BaseModel):
    school_name: str
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_current: bool = False
    description: Optional[str] = None


class EducationCreate(EducationBase):
    pass


class EducationResponse(EducationBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Certification schemas
class CertificationBase(BaseModel):
    certification_name: str
    issuing_organization: str
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    credential_url: Optional[str] = None
    credential_id: Optional[str] = None


class CertificationCreate(CertificationBase):
    pass


class CertificationResponse(CertificationBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Work Experience schemas
class WorkExperienceBase(BaseModel):
    company_name: str
    position: str
    start_date: datetime
    end_date: Optional[datetime] = None
    is_current: bool = False
    description: Optional[str] = None


class WorkExperienceCreate(WorkExperienceBase):
    pass


class WorkExperienceResponse(WorkExperienceBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Alumni Profile schemas
class AlumniProfileBase(BaseModel):
    full_name: str
    photo_url: Optional[str] = None
    bootcamp_name: str
    bootcamp_batch: Optional[str] = None
    graduation_year: int
    is_public: bool = False
    portfolio_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    twitter_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    current_location: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    work_experience: Optional[str] = None
    education: Optional[str] = None
    certifications: Optional[str] = None
    testimonial: Optional[str] = None
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    salary: Optional[float] = None
    employment_status: Optional[str] = None
    years_of_experience: Optional[int] = None


class AlumniProfileCreate(AlumniProfileBase):
    pass


class AlumniProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    photo_url: Optional[str] = None
    bootcamp_name: Optional[str] = None
    bootcamp_batch: Optional[str] = None
    graduation_year: Optional[int] = None
    is_public: Optional[bool] = None
    portfolio_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    twitter_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    current_location: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    work_experience: Optional[str] = None
    education: Optional[str] = None
    certifications: Optional[str] = None
    testimonial: Optional[str] = None
    current_company: Optional[str] = None
    current_role: Optional[str] = None
    salary: Optional[float] = None
    employment_status: Optional[str] = None
    years_of_experience: Optional[int] = None


class AlumniProfileResponse(AlumniProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    skills: List[SkillResponse] = []
    education_list: List[EducationResponse] = []
    certifications_list: List[CertificationResponse] = []
    work_experiences: List[WorkExperienceResponse] = []
    
    class Config:
        from_attributes = True
