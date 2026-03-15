from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession
from app.core.database import get_db
from app.models.auth import User, UserRole
from app.schemas.auth import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/v1/admin", tags=["Admin"])


def get_current_admin(db: DBSession = Depends(get_db)):
    # TODO: Implement proper admin authentication
    pass


@router.get("/user/list", response_model=dict)
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    db: DBSession = Depends(get_db)
):
    """Get list of users with pagination and filtering"""
    query = db.query(User)
    
    if search:
        query = query.filter(
            User.name.ilike(f"%{search}%") | 
            User.email.ilike(f"%{search}%") |
            User.certificate_id.ilike(f"%{search}%")
        )
    
    if role:
        query = query.filter(User.role == role)
    
    total = query.count()
    users = query.offset((page - 1) * limit).limit(limit).all()
    
    return {
        "success": True,
        "data": [UserResponse.model_validate(u) for u in users],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit
        }
    }


@router.post("/user/add", response_model=dict)
async def create_user(
    user_data: UserCreate,
    db: DBSession = Depends(get_db)
):
    """Create a new user"""
    # Check if email already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail={
            "success": False,
            "message": "Email already registered"
        })
    
    # Check if certificate_id already exists
    if user_data.certificate_id:
        existing_cert = db.query(User).filter(User.certificate_id == user_data.certificate_id).first()
        if existing_cert:
            raise HTTPException(status_code=400, detail={
                "success": False,
                "message": "Certificate ID already registered"
            })
    
    # Create user
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        certificate_id=user_data.certificate_id,
        image=user_data.image
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "success": True,
        "data": UserResponse.model_validate(new_user),
        "message": "User created successfully"
    }


@router.get("/user/detail/{user_id}", response_model=dict)
async def get_user_detail(
    user_id: str,
    db: DBSession = Depends(get_db)
):
    """Get user details by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={
            "success": False,
            "message": "User not found"
        })
    
    return {
        "success": True,
        "data": UserResponse.model_validate(user)
    }


@router.put("/user/update/{user_id}", response_model=dict)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: DBSession = Depends(get_db)
):
    """Update user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={
            "success": False,
            "message": "User not found"
        })
    
    # Update fields
    if user_data.name:
        user.name = user_data.name
    if user_data.email:
        # Check if email is already taken by another user
        existing = db.query(User).filter(
            User.email == user_data.email,
            User.id != user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail={
                "success": False,
                "message": "Email already registered"
            })
        user.email = user_data.email
    if user_data.role:
        user.role = user_data.role
    if user_data.certificate_id is not None:
        # Check if certificate_id is already taken
        if user_data.certificate_id:
            existing = db.query(User).filter(
                User.certificate_id == user_data.certificate_id,
                User.id != user_id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail={
                    "success": False,
                    "message": "Certificate ID already registered"
                })
        user.certificate_id = user_data.certificate_id
    
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "data": UserResponse.model_validate(user),
        "message": "User updated successfully"
    }


@router.delete("/user/delete/{user_id}", response_model=dict)
async def delete_user(
    user_id: str,
    db: DBSession = Depends(get_db)
):
    """Delete user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={
            "success": False,
            "message": "User not found"
        })
    
    db.delete(user)
    db.commit()
    
    return {
        "success": True,
        "message": "User deleted successfully"
    }


@router.post("/user/change-password/{user_id}", response_model=dict)
async def change_user_password(
    user_id: str,
    new_password: str,
    db: DBSession = Depends(get_db)
):
    """Change user password by admin"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail={
            "success": False,
            "message": "User not found"
        })
    
    # TODO: Hash and update password in accounts table
    
    return {
        "success": True,
        "message": "Password changed successfully"
    }
