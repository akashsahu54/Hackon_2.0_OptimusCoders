"""Document and ProcessingJob SQLAlchemy models."""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Float, Integer,
    BigInteger, Text, ForeignKey, ARRAY
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    original_filename = Column(String(500), nullable=False)
    file_path = Column(Text, nullable=False)
    file_size_bytes = Column(BigInteger, nullable=True)
    mime_type = Column(String(100), nullable=True)
    page_count = Column(Integer, default=1)

    # Processing status
    status = Column(String(50), default="uploaded")
    #   uploaded | ocr_processing | extracting | completed | failed | review_needed

    # Classification
    document_type = Column(String(100), nullable=True)
    #   invoice | receipt | contract | id_document | bank_statement | tax_form | ...
    classification_confidence = Column(Float, nullable=True)

    # OCR
    ocr_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, nullable=True)

    # Extraction
    extracted_fields = Column(JSONB, nullable=True)
    extraction_confidence = Column(Float, nullable=True)

    # Organization
    tags = Column(ARRAY(String), default=[])
    folder_path = Column(String(500), nullable=True)

    # Duplicate detection
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)

    # Timing
    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="documents")
    processing_jobs = relationship("ProcessingJob", back_populates="document")
    workflow_runs = relationship("WorkflowRun", back_populates="document")


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    job_type = Column(String(50), nullable=False)  # ocr, extraction, classification
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    worker_id = Column(String(100), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error = Column(Text, nullable=True)

    # Relationships
    document = relationship("Document", back_populates="processing_jobs")
