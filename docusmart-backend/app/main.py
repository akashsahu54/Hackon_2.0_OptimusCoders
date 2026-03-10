"""DocuSmart AI — FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.core.exceptions import (
    DocumentNotFoundError, OCRProcessingError, ExtractionError,
    document_not_found_handler, ocr_processing_error_handler, extraction_error_handler,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Smart Document Management System — OCR + AI + Automated Workflows",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Exception Handlers ───
app.add_exception_handler(DocumentNotFoundError, document_not_found_handler)
app.add_exception_handler(OCRProcessingError, ocr_processing_error_handler)
app.add_exception_handler(ExtractionError, extraction_error_handler)

# ─── Routers ───
from app.api.auth import router as auth_router
from app.api.documents import router as documents_router
from app.api.workflows import router as workflows_router
from app.api.reports import router as reports_router
from app.api.analytics import router as analytics_router

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(workflows_router)
app.include_router(reports_router)
app.include_router(analytics_router)


# ─── Health Check ───
@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
