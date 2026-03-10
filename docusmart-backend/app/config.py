"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ─── App ───
    APP_NAME: str = "DocuSmart AI"
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # ─── Database ───
    DATABASE_URL: str = "postgresql://docusmart:docusmart@localhost:5432/docusmart"

    # ─── JWT ───
    SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ─── OCR ───
    OCR_ENGINE: str = "tesseract"  # "tesseract" or "google_vision"
    TESSERACT_CMD: str = "tesseract"
    GOOGLE_VISION_CREDENTIALS: str = ""

    # ─── AI ───
    AI_PROVIDER: str = "anthropic"  # "anthropic" or "openai"
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # ─── Storage ───
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_MB: int = 50

    # ─── Email ───
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@docusmart.ai"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
