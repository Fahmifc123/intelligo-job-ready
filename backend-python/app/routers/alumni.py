from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session as DBSession
from app.core.database import get_db
from app.models.alumni import AlumniProfile, AlumniSkill, AlumniEducation, AlumniCertification, AlumniWorkExperience
from app.models.auth import Session as UserSession
from app.schemas.alumni import (
    AlumniProfileCreate, AlumniProfileUpdate, AlumniProfileResponse,
    SkillCreate, SkillResponse, EducationCreate, EducationResponse,
    CertificationCreate, CertificationResponse, WorkExperienceCreate, WorkExperienceResponse
)

router = APIRouter(prefix="/v1/user/alumni", tags=["Alumni Profile"])


def get_current_user_id(request, credentials, db: DBSession):
    """Helper to get current user ID from session"""
    token = request.cookies.get("sid")
    if not token and credentials:
        token = credentials.credentials.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail={"success": False, "message": "Unauthorized"})
    
    db_session = db.query(UserSession).filter(
        UserSession.token == token,
        UserSession.expires_at > datetime.now(timezone.utc)
    ).first()
    
    if not db_session:
        raise HTTPException(status_code=401, detail={"success": False, "message": "Session expired"})
    
    return db_session.user_id


# Profile routes
@router.get("/profile", response_model=dict)
async def get_profile(
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Get current user's alumni profile"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    return {
        "success": True,
        "data": AlumniProfileResponse.model_validate(profile)
    }


@router.post("/profile", response_model=dict)
async def create_profile(
    profile_data: AlumniProfileCreate,
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Create alumni profile for current user"""
    user_id = get_current_user_id(request, credentials, db)
    
    # Check if profile already exists
    existing = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail={"success": False, "message": "Profile already exists"})
    
    new_profile = AlumniProfile(
        user_id=user_id,
        **profile_data.model_dump(exclude_unset=True)
    )
    
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    
    return {
        "success": True,
        "data": AlumniProfileResponse.model_validate(new_profile),
        "message": "Profile created successfully"
    }


@router.put("/profile", response_model=dict)
async def update_profile(
    profile_data: AlumniProfileUpdate,
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Update current user's alumni profile"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    # Update fields
    for field, value in profile_data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    
    return {
        "success": True,
        "data": AlumniProfileResponse.model_validate(profile),
        "message": "Profile updated successfully"
    }


@router.put("/photo", response_model=dict)
async def update_photo(
    photo: UploadFile = File(...),
    request=None,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Update profile photo"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    # TODO: Save file and update photo_url
    # For now, just store filename
    profile.photo_url = photo.filename
    db.commit()
    
    return {
        "success": True,
        "data": AlumniProfileResponse.model_validate(profile),
        "message": "Photo updated successfully"
    }


# Skills routes
@router.get("/skills", response_model=dict)
async def get_skills(
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Get current user's skills"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    return {
        "success": True,
        "data": [SkillResponse.model_validate(s) for s in profile.skills]
    }


@router.post("/skills", response_model=dict)
async def add_skill(
    skill_data: SkillCreate,
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Add skill to profile"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    new_skill = AlumniSkill(
        alumni_profile_id=profile.id,
        **skill_data.model_dump()
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    
    return {
        "success": True,
        "data": SkillResponse.model_validate(new_skill),
        "message": "Skill added successfully"
    }


@router.delete("/skills/{skill_id}", response_model=dict)
async def delete_skill(
    skill_id: str,
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Delete skill from profile"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    skill = db.query(AlumniSkill).filter(
        AlumniSkill.id == skill_id,
        AlumniSkill.alumni_profile_id == profile.id
    ).first()
    
    if not skill:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Skill not found"})
    
    db.delete(skill)
    db.commit()
    
    return {"success": True, "message": "Skill deleted successfully"}


# Education routes
@router.get("/education", response_model=dict)
async def get_education(
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Get current user's education"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    return {
        "success": True,
        "data": [EducationResponse.model_validate(e) for e in profile.education_list]
    }


@router.post("/education", response_model=dict)
async def add_education(
    edu_data: EducationCreate,
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Add education to profile"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    new_edu = AlumniEducation(
        alumni_profile_id=profile.id,
        **edu_data.model_dump()
    )
    db.add(new_edu)
    db.commit()
    db.refresh(new_edu)
    
    return {
        "success": True,
        "data": EducationResponse.model_validate(new_edu),
        "message": "Education added successfully"
    }


@router.delete("/education/{edu_id}", response_model=dict)
async def delete_education(
    edu_id: str,
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Delete education from profile"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    edu = db.query(AlumniEducation).filter(
        AlumniEducation.id == edu_id,
        AlumniEducation.alumni_profile_id == profile.id
    ).first()
    
    if not edu:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Education not found"})
    
    db.delete(edu)
    db.commit()
    
    return {"success": True, "message": "Education deleted successfully"}


# Certifications routes
@router.get("/certifications", response_model=dict)
async def get_certifications(
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Get current user's certifications"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    return {
        "success": True,
        "data": [CertificationResponse.model_validate(c) for c in profile.certifications_list]
    }


@router.post("/certifications", response_model=dict)
async def add_certification(
    cert_data: CertificationCreate,
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Add certification to profile"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    new_cert = AlumniCertification(
        alumni_profile_id=profile.id,
        **cert_data.model_dump()
    )
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    
    return {
        "success": True,
        "data": CertificationResponse.model_validate(new_cert),
        "message": "Certification added successfully"
    }


@router.delete("/certifications/{cert_id}", response_model=dict)
async def delete_certification(
    cert_id: str,
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Delete certification from profile"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    cert = db.query(AlumniCertification).filter(
        AlumniCertification.id == cert_id,
        AlumniCertification.alumni_profile_id == profile.id
    ).first()
    
    if not cert:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Certification not found"})
    
    db.delete(cert)
    db.commit()
    
    return {"success": True, "message": "Certification deleted successfully"}


# Work Experience routes
@router.get("/work-experience", response_model=dict)
async def get_work_experience(
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Get current user's work experience"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    return {
        "success": True,
        "data": [WorkExperienceResponse.model_validate(w) for w in profile.work_experiences]
    }


@router.post("/work-experience", response_model=dict)
async def add_work_experience(
    work_data: WorkExperienceCreate,
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Add work experience to profile"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    new_work = AlumniWorkExperience(
        alumni_profile_id=profile.id,
        **work_data.model_dump()
    )
    db.add(new_work)
    db.commit()
    db.refresh(new_work)
    
    return {
        "success": True,
        "data": WorkExperienceResponse.model_validate(new_work),
        "message": "Work experience added successfully"
    }


@router.delete("/work-experience/{work_id}", response_model=dict)
async def delete_work_experience(
    work_id: str,
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Delete work experience from profile"""
    user_id = get_current_user_id(request, credentials, db)
    
    profile = db.query(AlumniProfile).filter(AlumniProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Profile not found"})
    
    work = db.query(AlumniWorkExperience).filter(
        AlumniWorkExperience.id == work_id,
        AlumniWorkExperience.alumni_profile_id == profile.id
    ).first()
    
    if not work:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Work experience not found"})
    
    db.delete(work)
    db.commit()
    
    return {"success": True, "message": "Work experience deleted successfully"}
