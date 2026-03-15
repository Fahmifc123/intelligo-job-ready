import httpx
import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session as DBSession
from app.core.database import get_db
from app.core.config import get_settings
from app.models.cv_analysis import CVAnalysis, CVAnalysisAspect
from app.models.auth import Session as UserSession
from app.schemas.cv_analysis import CVAnalysisResponse, CVUploadResponse

router = APIRouter(prefix="/v1/user/cv-analysis", tags=["CV Analysis"])
settings = get_settings()


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


@router.post("/upload", response_model=CVUploadResponse)
async def upload_cv(
    request,
    credentials=None,
    role: str = Form(...),
    cv_file: UploadFile = File(...),
    db: DBSession = Depends(get_db)
):
    """Upload CV for analysis"""
    user_id = get_current_user_id(request, credentials, db)
    
    # Read file content
    file_content = await cv_file.read()
    
    try:
        # Send to CV analysis API
        async with httpx.AsyncClient() as client:
            files = {"file": (cv_file.filename, file_content, cv_file.content_type)}
            data = {"role": role}
            
            response = await client.post(
                settings.cv_analysis_api_url,
                files=files,
                data=data,
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail={"success": False, "message": "CV analysis service error"}
                )
            
            analysis_result = response.json()
    except httpx.RequestError:
        raise HTTPException(
            status_code=500,
            detail={"success": False, "message": "Failed to connect to CV analysis service"}
        )
    
    # Create CV analysis record
    new_analysis = CVAnalysis(
        user_id=user_id,
        role=role,
        overall_score=analysis_result.get("overall_score", 0),
        skor_kecocokan_role=analysis_result.get("skor_kecocokan_role", 0),
        suggestions=analysis_result.get("suggestions", {}),
        kekuatan_utama=analysis_result.get("kekuatan_utama", []),
        gaps=analysis_result.get("gaps", []),
        prioritas_perbaikan=analysis_result.get("prioritas_perbaikan", [])
    )
    
    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    
    # Create aspect records
    aspects_data = analysis_result.get("aspects", [])
    for aspect in aspects_data:
        new_aspect = CVAnalysisAspect(
            cv_analysis_id=new_analysis.id,
            aspect_name=aspect.get("aspect_name", ""),
            score=aspect.get("score", 0)
        )
        db.add(new_aspect)
    
    db.commit()
    db.refresh(new_analysis)
    
    return CVUploadResponse(
        success=True,
        message="CV analyzed successfully",
        data=CVAnalysisResponse.model_validate(new_analysis)
    )


@router.get("/results", response_model=dict)
async def get_results(
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Get current user's CV analysis results"""
    user_id = get_current_user_id(request, credentials, db)
    
    analyses = db.query(CVAnalysis).filter(CVAnalysis.user_id == user_id).all()
    
    return {
        "success": True,
        "data": [CVAnalysisResponse.model_validate(a) for a in analyses]
    }


@router.get("/results/{analysis_id}", response_model=dict)
async def get_result_detail(
    analysis_id: str,
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Get specific CV analysis result"""
    user_id = get_current_user_id(request, credentials, db)
    
    analysis = db.query(CVAnalysis).filter(
        CVAnalysis.id == analysis_id,
        CVAnalysis.user_id == user_id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Analysis not found"})
    
    return {
        "success": True,
        "data": CVAnalysisResponse.model_validate(analysis)
    }


@router.delete("/results/{analysis_id}", response_model=dict)
async def delete_result(
    analysis_id: str,
    request,
    credentials=None,
    db: DBSession = Depends(get_db)
):
    """Delete CV analysis result"""
    user_id = get_current_user_id(request, credentials, db)
    
    analysis = db.query(CVAnalysis).filter(
        CVAnalysis.id == analysis_id,
        CVAnalysis.user_id == user_id
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Analysis not found"})
    
    db.delete(analysis)
    db.commit()
    
    return {"success": True, "message": "Analysis deleted successfully"}
