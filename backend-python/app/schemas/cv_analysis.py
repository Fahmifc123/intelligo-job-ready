from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class CVAnalysisAspectBase(BaseModel):
    aspect_name: str
    score: int


class CVAnalysisAspectCreate(CVAnalysisAspectBase):
    pass


class CVAnalysisAspectResponse(CVAnalysisAspectBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class CVAnalysisBase(BaseModel):
    role: str
    overall_score: int
    skor_kecocokan_role: int
    suggestions: Dict[str, Any]
    kekuatan_utama: List[str]
    gaps: List[str]
    prioritas_perbaikan: List[str]


class CVAnalysisCreate(CVAnalysisBase):
    aspects: List[CVAnalysisAspectCreate]


class CVAnalysisResponse(CVAnalysisBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    aspects: List[CVAnalysisAspectResponse] = []
    
    class Config:
        from_attributes = True


class CVUploadResponse(BaseModel):
    success: bool
    message: str
    data: Optional[CVAnalysisResponse] = None
