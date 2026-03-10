"""Workflow and WorkflowRun SQLAlchemy models."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    trigger_type = Column(String(100), nullable=False)
    #   document_uploaded | field_value | schedule | manual
    trigger_condition = Column(JSONB, nullable=True)
    #   e.g. {"document_type": "invoice", "field": "due_date", "days_before": 7}
    action_type = Column(String(100), nullable=False)
    #   send_email | generate_report | create_tag | webhook | slack
    action_config = Column(JSONB, nullable=True)
    #   e.g. {"to": "manager@co.com", "template": "invoice_due_alert"}
    is_active = Column(Boolean, default=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    run_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="workflows")
    runs = relationship("WorkflowRun", back_populates="workflow")


class WorkflowRun(Base):
    __tablename__ = "workflow_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    executed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    result_data = Column(JSONB, nullable=True)

    # Relationships
    workflow = relationship("Workflow", back_populates="runs")
    document = relationship("Document", back_populates="workflow_runs")
