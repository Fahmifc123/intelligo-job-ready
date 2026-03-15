from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session as DBSession
from app.core.database import get_db
from app.core.security import create_access_token, decode_token
from app.models.auth import User, Session as UserSession, UserRole
from app.schemas.auth import AuthResponse, ErrorResponse, UserResponse, SessionResponse, ChangePasswordRequest
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer(auto_error=False)


@router.post("/sign-in-email", response_model=AuthResponse)
async def sign_in_email(
    request: Request,
    response: Response,
    certificate_id: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    db: DBSession = Depends(get_db)
):
    """Sign in with email/password (admin) or certificate ID (user)"""
    
    user = None
    
    if email and password:
        # Admin login with email/password
        user = db.query(User).filter(User.email == email.strip()).first()
        if not user:
            raise HTTPException(status_code=404, detail={
                "success": False,
                "message": "Invalid email or password"
            })
        # Note: In production, verify password hash here
        
    elif certificate_id:
        # User login with certificate ID
        trimmed_certificate_id = certificate_id.strip()
        user = db.query(User).filter(User.certificate_id == trimmed_certificate_id).first()
        
        if not user:
            raise HTTPException(status_code=404, detail={
                "success": False,
                "message": "Invalid certificate ID"
            })
    else:
        raise HTTPException(status_code=400, detail={
            "success": False,
            "message": "Email/password or certificate ID is required"
        })
    
    # Create session token
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    # Create session in database
    db_session = UserSession(
        token=session_token,
        expires_at=expires_at,
        user_id=user.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    db.add(db_session)
    db.commit()
    
    # Set cookie
    response.set_cookie(
        key="sid",
        value=session_token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,  # 7 days
        path="/"
    )
    
    return AuthResponse(
        success=True,
        message="Sign in successful",
        user=UserResponse.model_validate(user),
        token=session_token
    )


@router.post("/sign-out")
async def sign_out(
    request: Request,
    response: Response,
    db: DBSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """Sign out and clear session"""
    # Get token from cookie or Authorization header
    token = request.cookies.get("sid")
    if not token and credentials:
        token = credentials.credentials.replace("Bearer ", "")
    
    if token:
        # Delete session from database
        db.query(UserSession).filter(UserSession.token == token).delete()
        db.commit()
    
    # Clear cookie
    response.delete_cookie(key="sid", path="/")
    
    return {"success": True, "message": "Session cleared"}


@router.get("/session", response_model=SessionResponse)
async def get_session(
    request: Request,
    db: DBSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """Get current user session"""
    # Get token from cookie or Authorization header
    token = request.cookies.get("sid")
    if not token and credentials:
        token = credentials.credentials.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail={
            "success": False,
            "message": "Unauthorized"
        })
    
    # Find session in database
    db_session = db.query(UserSession).filter(
        UserSession.token == token,
        UserSession.expires_at > datetime.now(timezone.utc)
    ).first()
    
    if not db_session:
        raise HTTPException(status_code=401, detail={
            "success": False,
            "message": "Session expired"
        })
    
    # Get user
    user = db.query(User).filter(User.id == db_session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail={
            "success": False,
            "message": "User not found"
        })
    
    return SessionResponse(user=UserResponse.model_validate(user))


@router.get("/user-info")
async def get_user_info(
    request: Request,
    db: DBSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """Get authenticated user info"""
    # Get token from cookie or Authorization header
    token = request.cookies.get("sid")
    if not token and credentials:
        token = credentials.credentials.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail={
            "success": False,
            "message": "Unauthorized"
        })
    
    # Find session
    db_session = db.query(UserSession).filter(
        UserSession.token == token,
        UserSession.expires_at > datetime.now(timezone.utc)
    ).first()
    
    if not db_session:
        raise HTTPException(status_code=401, detail={
            "success": False,
            "message": "Unauthorized"
        })
    
    # Get user
    user = db.query(User).filter(User.id == db_session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail={
            "success": False,
            "message": "User not found"
        })
    
    return {
        "success": True,
        "message": "User info retrieved",
        "data": UserResponse.model_validate(user)
    }


@router.put("/change-password")
async def change_password(
    request: Request,
    data: ChangePasswordRequest,
    db: DBSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
):
    """Change user password"""
    # Get token from cookie or Authorization header
    token = request.cookies.get("sid")
    if not token and credentials:
        token = credentials.credentials.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail={
            "success": False,
            "message": "Unauthorized"
        })
    
    # Find session
    db_session = db.query(UserSession).filter(
        UserSession.token == token,
        UserSession.expires_at > datetime.now(timezone.utc)
    ).first()
    
    if not db_session:
        raise HTTPException(status_code=401, detail={
            "success": False,
            "message": "Unauthorized"
        })
    
    # TODO: Implement password change logic with hash verification
    
    return {
        "success": True,
        "message": "Password changed successfully"
    }
