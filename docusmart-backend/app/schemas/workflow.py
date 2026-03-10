"""Pydantic schemas for Workflow API requests and responses."""

from pydantic import BaseModel
from typing import Optional, Any, Dict, List
from uuid import UUID
from datetime import datetime


# ─── Request Schemas ───

class WorkflowCreate(BaseModel):
    name: str
    trigger_type: str  # document_uploaded, field_value, schedule, manual
    trigger_condition: Optional[Dict[str, Any]] = None
    action_type: str   # send_email, generate_report, create_tag, webhook, slack
    action_config: Optional[Dict[str, Any]] = None


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    trigger_type: Optional[str] = None
    trigger_condition: Optional[Dict[str, Any]] = None
    action_type: Optional[str] = None
    action_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class WorkflowTrigger(BaseModel):
    document_id: UUID


class ReportRequest(BaseModel):
    start_date: str  # YYYY-MM-DD
    end_date: str
    user_id: Optional[UUID] = None
    categories: Optional[List[str]] = None


class SummaryReportRequest(BaseModel):
    period: str = "weekly"  # weekly | monthly


# ─── Response Schemas ───

class WorkflowResponse(BaseModel):
    id: UUID
    name: str
    trigger_type: str
    trigger_condition: Optional[Dict[str, Any]] = None
    action_type: str
    action_config: Optional[Dict[str, Any]] = None
    is_active: bool
    run_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class WorkflowRunResponse(BaseModel):
    id: UUID
    workflow_id: UUID
    document_id: Optional[UUID] = None
    status: str
    executed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    result_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class AnalyticsOverview(BaseModel):
    total_documents: int
    documents_by_type: Dict[str, int]
    total_spend: float
    documents_this_week: int
    avg_extraction_confidence: float


class ReportResponse(BaseModel):
    report_url: Optional[str] = None
    summary: Dict[str, Any]
