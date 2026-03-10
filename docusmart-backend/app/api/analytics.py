"""Analytics & Search API routes (MongoDB)."""

from fastapi import APIRouter, Depends, Query
from pymongo.database import Database
from datetime import datetime, timedelta
from typing import Optional, List

from app.database import get_db
from app.schemas.workflow import AnalyticsOverview
from app.schemas.document import DocumentSummary
from app.core.dependencies import get_current_user

router = APIRouter(tags=["Analytics & Search"])


def _doc_to_summary(doc: dict) -> DocumentSummary:
    return DocumentSummary(
        id=doc["_id"],
        original_filename=doc["original_filename"],
        mime_type=doc.get("mime_type"),
        file_size_bytes=doc.get("file_size_bytes"),
        status=doc.get("status", "uploaded"),
        document_type=doc.get("document_type"),
        classification_confidence=doc.get("classification_confidence"),
        tags=doc.get("tags", []),
        folder_path=doc.get("folder_path"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )


@router.get("/analytics/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Dashboard stats: total docs, by type, spend, weekly count, avg confidence."""
    user_id = current_user["_id"]

    # Total documents
    total_documents = db.documents.count_documents({"user_id": user_id})

    # Documents by type (aggregation)
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {"_id": "$document_type", "count": {"$sum": 1}}},
    ]
    type_rows = list(db.documents.aggregate(pipeline))
    documents_by_type = {(row["_id"] or "unclassified"): row["count"] for row in type_rows}

    # Total spend and avg confidence from completed docs
    completed_docs = list(db.documents.find({"user_id": user_id, "status": "completed"}))
    total_spend = 0.0
    confidence_sum = 0.0
    confidence_count = 0
    for doc in completed_docs:
        fields = doc.get("extracted_fields") or {}
        total_spend += float(fields.get("total_amount", 0) or 0)
        ec = doc.get("extraction_confidence")
        if ec is not None:
            confidence_sum += ec
            confidence_count += 1

    avg_confidence = confidence_sum / confidence_count if confidence_count > 0 else 0.0

    # Documents this week
    week_ago = datetime.utcnow() - timedelta(weeks=1)
    docs_this_week = db.documents.count_documents({"user_id": user_id, "created_at": {"$gte": week_ago}})

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
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Full-text search across documents and extracted metadata."""
    query_filter = {
        "user_id": current_user["_id"],
        "ocr_text": {"$regex": q, "$options": "i"},
    }

    if type:
        query_filter["document_type"] = type

    if date_from:
        try:
            query_filter.setdefault("created_at", {})["$gte"] = datetime.strptime(date_from, "%Y-%m-%d")
        except ValueError:
            pass

    if date_to:
        try:
            query_filter.setdefault("created_at", {})["$lte"] = datetime.strptime(date_to, "%Y-%m-%d")
        except ValueError:
            pass

    results = list(
        db.documents.find(query_filter)
        .sort("created_at", -1)
        .limit(50)
    )

    # Post-filter by amount if needed
    if min_amount is not None:
        results = [
            r for r in results
            if (r.get("extracted_fields") or {}).get("total_amount", 0) and
               float((r.get("extracted_fields") or {}).get("total_amount", 0)) >= min_amount
        ]

    return [_doc_to_summary(d) for d in results]
