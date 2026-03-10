"""Pydantic schemas for Document API requests and responses."""

from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from uuid import UUID
from datetime import datetime


# ─── Request Schemas ───

class DocumentUpdate(BaseModel):
    tags: Optional[List[str]] = None
    folder_path: Optional[str] = None
    corrections: Optional[Dict[str, Any]] = None


class ExtractRequest(BaseModel):
    text: str
    document_type: Optional[str] = None


class ClassifyRequest(BaseModel):
    text: str


class FieldCorrection(BaseModel):
    corrections: Dict[str, Any]


# ─── Response Schemas ───

class DocumentSummary(BaseModel):
    id: UUID
    original_filename: str
    status: str
    document_type: Optional[str] = None
    classification_confidence: Optional[float] = None
    extraction_confidence: Optional[float] = None
    tags: Optional[List[str]] = []
    created_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DocumentDetail(BaseModel):
    id: UUID
    user_id: UUID
    original_filename: str
    file_path: str
    file_size_bytes: Optional[int] = None
    mime_type: Optional[str] = None
    page_count: int = 1
    status: str
    document_type: Optional[str] = None
    classification_confidence: Optional[float] = None
    ocr_text: Optional[str] = None
    ocr_confidence: Optional[float] = None
    extracted_fields: Optional[Dict[str, Any]] = None
    extraction_confidence: Optional[float] = None
    tags: Optional[List[str]] = []
    folder_path: Optional[str] = None
    is_duplicate: bool = False
    duplicate_of_id: Optional[UUID] = None
    processing_time_ms: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: List[DocumentSummary]
    total: int
    page: int
    limit: int


class DocumentStatusResponse(BaseModel):
    status: str
    progress_percent: Optional[int] = None
    current_step: Optional[str] = None
    error: Optional[str] = None


class ExtractionResponse(BaseModel):
    document_type: Optional[str] = None
    fields: Dict[str, Any]
    confidence: float


class ClassificationResponse(BaseModel):
    type: str
    confidence: float
    reason: Optional[str] = None
