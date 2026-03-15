from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession
from app.core.database import get_db
from app.models.leaderboard import LeaderboardCategory, LeaderboardEntry
from app.models.auth import Session as UserSession
from app.schemas.leaderboard import (
    LeaderboardCategoryCreate, LeaderboardCategoryUpdate, LeaderboardCategoryResponse,
    LeaderboardEntryCreate, LeaderboardEntryResponse, UserPositionResponse
)

router = APIRouter(prefix="/v1/user/leaderboard", tags=["Leaderboard"])


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


# Category routes (Admin only)
@router.get("/categories", response_model=dict)
async def get_categories(
    active_only: bool = Query(True),
    db: DBSession = Depends(get_db)
):
    """Get all leaderboard categories"""
    query = db.query(LeaderboardCategory)
    
    if active_only:
        query = query.filter(LeaderboardCategory.is_active == True)
    
    categories = query.all()
    
    return {
        "success": True,
        "data": [LeaderboardCategoryResponse.model_validate(c) for c in categories]
    }


@router.post("/categories", response_model=dict)
async def create_category(
    category_data: LeaderboardCategoryCreate,
    db: DBSession = Depends(get_db)
):
    """Create new leaderboard category (Admin)"""
    new_category = LeaderboardCategory(**category_data.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    return {
        "success": True,
        "data": LeaderboardCategoryResponse.model_validate(new_category),
        "message": "Category created successfully"
    }


@router.put("/categories/{category_id}", response_model=dict)
async def update_category(
    category_id: str,
    category_data: LeaderboardCategoryUpdate,
    db: DBSession = Depends(get_db)
):
    """Update leaderboard category (Admin)"""
    category = db.query(LeaderboardCategory).filter(LeaderboardCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Category not found"})
    
    for field, value in category_data.model_dump(exclude_unset=True).items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    
    return {
        "success": True,
        "data": LeaderboardCategoryResponse.model_validate(category),
        "message": "Category updated successfully"
    }


@router.delete("/categories/{category_id}", response_model=dict)
async def delete_category(
    category_id: str,
    db: DBSession = Depends(get_db)
):
    """Delete leaderboard category (Admin)"""
    category = db.query(LeaderboardCategory).filter(LeaderboardCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Category not found"})
    
    db.delete(category)
    db.commit()
    
    return {"success": True, "message": "Category deleted successfully"}


# Entries routes
@router.get("/entries", response_model=dict)
async def get_entries(
    category_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: DBSession = Depends(get_db)
):
    """Get leaderboard entries with pagination"""
    query = db.query(LeaderboardEntry)
    
    if category_id:
        query = query.filter(LeaderboardEntry.category_id == category_id)
    
    total = query.count()
    entries = query.order_by(LeaderboardEntry.rank).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "success": True,
        "data": [LeaderboardEntryResponse.model_validate(e) for e in entries],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }


@router.get("/entries/{category_id}", response_model=dict)
async def get_entries_by_category(
    category_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: DBSession = Depends(get_db)
):
    """Get leaderboard entries by category"""
    category = db.query(LeaderboardCategory).filter(LeaderboardCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Category not found"})
    
    query = db.query(LeaderboardEntry).filter(LeaderboardEntry.category_id == category_id)
    total = query.count()
    entries = query.order_by(LeaderboardEntry.rank).offset((page - 1) * limit).limit(limit).all()
    
    return {
        "success": True,
        "data": {
            "category": LeaderboardCategoryResponse.model_validate(category),
            "entries": [LeaderboardEntryResponse.model_validate(e) for e in entries]
        },
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }


@router.post("/entries", response_model=dict)
async def create_entry(
    entry_data: LeaderboardEntryCreate,
    db: DBSession = Depends(get_db)
):
    """Create leaderboard entry (Admin)"""
    # Check if entry already exists for this user in this category
    existing = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.user_id == entry_data.user_id,
        LeaderboardEntry.category_id == entry_data.category_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail={"success": False, "message": "Entry already exists for this user"})
    
    new_entry = LeaderboardEntry(**entry_data.model_dump())
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    return {
        "success": True,
        "data": LeaderboardEntryResponse.model_validate(new_entry),
        "message": "Entry created successfully"
    }


@router.delete("/entries/{entry_id}", response_model=dict)
async def delete_entry(
    entry_id: str,
    db: DBSession = Depends(get_db)
):
    """Delete leaderboard entry (Admin)"""
    entry = db.query(LeaderboardEntry).filter(LeaderboardEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail={"success": False, "message": "Entry not found"})
    
    db.delete(entry)
    db.commit()
    
    return {"success": True, "message": "Entry deleted successfully"}


# User position
@router.get("/position", response_model=dict)
async def get_user_position(
    request,
    credentials=None,
    category_id: Optional[str] = Query(None),
    db: DBSession = Depends(get_db)
):
    """Get current user's position in leaderboard"""
    user_id = get_current_user_id(request, credentials, db)
    
    query = db.query(LeaderboardEntry).filter(LeaderboardEntry.user_id == user_id)
    
    if category_id:
        query = query.filter(LeaderboardEntry.category_id == category_id)
        entry = query.first()
        if not entry:
            raise HTTPException(status_code=404, detail={"success": False, "message": "No entry found"})
        
        return {
            "success": True,
            "data": UserPositionResponse(
                rank=entry.rank,
                total_score=entry.total_score,
                category_id=entry.category_id,
                category_name=entry.category.name
            )
        }
    else:
        entries = query.all()
        return {
            "success": True,
            "data": [
                UserPositionResponse(
                    rank=e.rank,
                    total_score=e.total_score,
                    category_id=e.category_id,
                    category_name=e.category.name
                ) for e in entries
            ]
        }
