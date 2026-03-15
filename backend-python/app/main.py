from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.database import engine, Base
from app.core.config import get_settings
from app.routers import auth, admin, alumni, cv_analysis, leaderboard

# Import all models so SQLAlchemy can create tables
from app.models.auth import User, Session, Account, Verification
from app.models.alumni import AlumniProfile, AlumniSkill, AlumniEducation, AlumniCertification, AlumniWorkExperience
from app.models.cv_analysis import CVAnalysis, CVAnalysisAspect
from app.models.leaderboard import LeaderboardCategory, LeaderboardEntry

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: Cleanup (if needed)


app = FastAPI(
    title="Job Ready API",
    description="""
## Job Ready Portal API

API untuk platform Job Ready Portal - Alumni Career Platform.

### Features
- **Authentication**: Login dengan Certificate ID atau Email/Password
- **Admin User Management**: CRUD user management untuk admin
- **Alumni Profile**: Profile management dengan skills, education, certifications, work experience
- **CV Analysis**: Upload dan analisis CV dengan AI
- **Leaderboard**: Sistem leaderboard berdasarkan kategori

### Authentication
Gunakan session cookie (`sid`) atau Bearer token untuk endpoint yang memerlukan autentikasi.

### Endpoints
- `/docs` - Swagger UI Documentation
- `/redoc` - ReDoc Documentation
- `/openapi.json` - OpenAPI Schema
""",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(alumni.router, prefix="/api")
app.include_router(cv_analysis.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API info"""
    return {
        "message": "Job Ready API", 
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}
