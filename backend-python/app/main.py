from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.database import engine, Base
from app.core.config import get_settings
from app.routers import auth, admin, alumni, cv_analysis, leaderboard

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: Cleanup (if needed)


app = FastAPI(
    title="Job Ready API",
    description="API for Job Ready Portal",
    version="1.0.0",
    lifespan=lifespan
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


@app.get("/")
async def root():
    return {"message": "Job Ready API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
