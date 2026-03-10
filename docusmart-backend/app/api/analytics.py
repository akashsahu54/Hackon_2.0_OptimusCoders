"""Analytics & Search API routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional, List

from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas.workflow import AnalyticsOverview
from app.schemas.document import DocumentSummary
from app.core.dependencies import get_current_user

router = APIRouter(tags=["Analytics & Search"])


@router.get("/analytics/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dashboard stats: total docs, by type, spend, weekly count, avg confidence."""
    base_query = db.query(Document).filter(Document.user_id == current_user.id)

    # Total documents
    total_documents = base_query.count()

    # Documents by type
    type_rows = (
        db.query(Document.document_type, func.count(Document.id))
        .filter(Document.user_id == current_user.id)
        .group_by(Document.document_type)
        .all()
    )
    documents_by_type = {t or "unclassified": c for t, c in type_rows}

    # Total spend from extracted fields
    completed_docs = base_query.filter(Document.status == "completed").all()
    total_spend = 0.0
    confidence_sum = 0.0
    confidence_count = 0
    for doc in completed_docs:
        fields = doc.extracted_fields or {}
        total_spend += float(fields.get("total_amount", 0) or 0)
        if doc.extraction_confidence is not None:
            confidence_sum += doc.extraction_confidence
            confidence_count += 1

    avg_confidence = confidence_sum / confidence_count if confidence_count > 0 else 0.0

    # Documents this week
    week_ago = datetime.utcnow() - timedelta(weeks=1)
    docs_this_week = base_query.filter(Document.created_at >= week_ago).count()

    return AnalyticsOverview(
        total_documents=total_documents,
        documents_by_type=documents_by_type,
        total_spend=round(total_spend, 2),
        documents_this_week=docs_this_week,
        avg_extraction_confidence=round(avg_confidence, 3),
    )


@router.get("/search", response_model=List[DocumentSummary])
def search_documents(
    q: str = Query(..., min_length=1),
    type: Optional[str] = None,
    min_amount: Optional[float] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Full-text search across documents and extracted metadata."""
    query = db.query(Document).filter(
        Document.user_id == current_user.id,
        Document.ocr_text.ilike(f"%{q}%"),
    )

    if type:
        query = query.filter(Document.document_type == type)

    if date_from:
        try:
            query = query.filter(Document.created_at >= datetime.strptime(date_from, "%Y-%m-%d"))
        except ValueError:
            pass

    if date_to:
        try:
            query = query.filter(Document.created_at <= datetime.strptime(date_to, "%Y-%m-%d"))
        except ValueError:
            pass

    results = query.order_by(Document.created_at.desc()).limit(50).all()

    # Post-filter by amount if needed
    if min_amount is not None:
        results = [
            r for r in results
            if (r.extracted_fields or {}).get("total_amount", 0) and
               float((r.extracted_fields or {}).get("total_amount", 0)) >= min_amount
        ]

    return [DocumentSummary.model_validate(d) for d in results]
