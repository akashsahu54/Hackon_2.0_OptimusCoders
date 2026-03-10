"""AuditLog and DocumentShare SQLAlchemy models."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    action = Column(String(100), nullable=False)
    #   document_uploaded | ocr_completed | extraction_completed | field_corrected | ...
    old_value = Column(JSONB, nullable=True)
    new_value = Column(JSONB, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class DocumentShare(Base):
    __tablename__ = "document_shares"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    shared_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    shared_with_email = Column(String(255), nullable=False)
    permission_level = Column(String(50), default="view")  # view, edit
    expires_at = Column(DateTime(timezone=True), nullable=True)
    token = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class ExtractionTemplate(Base):
    __tablename__ = "extraction_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_type = Column(String(100), nullable=False)
    prompt_template = Column(Text, nullable=False)
    field_schema = Column(JSONB, nullable=True)
    version = Column(String(20), default="1.0")
    is_active = Column(String(5), default="true")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
