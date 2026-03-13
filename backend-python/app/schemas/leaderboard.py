from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.auth import UserResponse


class LeaderboardCategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True


class LeaderboardCategoryCreate(LeaderboardCategoryBase):
    pass


class LeaderboardCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class LeaderboardCategoryResponse(LeaderboardCategoryBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class LeaderboardEntryBase(BaseModel):
    total_score: int
    cv_score: int
    project_score: Optional[int] = None
    attendance_score: Optional[int] = None
    certification_score: Optional[int] = None
    rank: int


class LeaderboardEntryCreate(LeaderboardEntryBase):
    user_id: str
    category_id: str
    cv_analysis_id: str


class LeaderboardEntryResponse(LeaderboardEntryBase):
    id: str
    user_id: str
    category_id: str
    cv_analysis_id: str
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


class LeaderboardWithEntriesResponse(BaseModel):
    category: LeaderboardCategoryResponse
    entries: List[LeaderboardEntryResponse]


class UserPositionResponse(BaseModel):
    rank: int
    total_score: int
    category_id: str
    category_name: str
