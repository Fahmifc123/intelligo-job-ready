from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./jobready.db"
    
    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_days: int = 7
    
    # Server
    host: str = "0.0.0.0"
    port: int = 5050
    
    # CV Analysis
    cv_analysis_api_url: str = "http://localhost:8000/analyze-cv"
    
    # Environment
    environment: str = "development"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
