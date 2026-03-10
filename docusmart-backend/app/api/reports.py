"""Reports API routes — expense reports and document summaries (MongoDB)."""

from fastapi import APIRouter, Depends, HTTPException
from pymongo.database import Database
from datetime import datetime

from app.database import get_db
from app.schemas.workflow import ReportRequest, SummaryReportRequest, ReportResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/expense", response_model=ReportResponse)
def generate_expense_report(
    data: ReportRequest,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Generate an expense report for a date range."""
    try:
        start_date = datetime.strptime(data.start_date, "%Y-%m-%d")
        end_date = datetime.strptime(data.end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    query_filter = {
        "user_id": current_user["_id"],
        "document_type": {"$in": ["invoice", "receipt"]},
        "created_at": {"$gte": start_date, "$lte": end_date},
        "status": "completed",
    }

    if data.categories:
        query_filter["document_type"] = {"$in": data.categories}

    documents = list(db.documents.find(query_filter))

    total_spend = 0.0
    items = []
    for doc in documents:
        fields = doc.get("extracted_fields") or {}
        amount = fields.get("total_amount", 0) or 0
        total_spend += float(amount)
        items.append({
            "filename": doc["original_filename"],
            "type": doc.get("document_type"),
            "vendor": fields.get("vendor_name", "Unknown"),
            "amount": amount,
            "date": fields.get("invoice_date") or fields.get("date"),
        })

    summary = {
        "period": f"{data.start_date} to {data.end_date}",
        "total_documents": len(documents),
        "total_spend": total_spend,
        "items": items,
    }

    return ReportResponse(summary=summary)


@router.post("/summary", response_model=ReportResponse)
def generate_summary_report(
    data: SummaryReportRequest,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Generate a periodic summary report."""
    from datetime import timedelta

    if data.period == "weekly":
        since = datetime.utcnow() - timedelta(weeks=1)
    elif data.period == "monthly":
        since = datetime.utcnow() - timedelta(days=30)
    else:
        raise HTTPException(status_code=400, detail="Period must be 'weekly' or 'monthly'")

    documents = list(db.documents.find({
        "user_id": current_user["_id"],
        "created_at": {"$gte": since},
    }))

    type_counts = {}
    total_spend = 0.0
    for doc in documents:
        doc_type = doc.get("document_type") or "unclassified"
        type_counts[doc_type] = type_counts.get(doc_type, 0) + 1
        fields = doc.get("extracted_fields") or {}
        total_spend += float(fields.get("total_amount", 0) or 0)

    summary = {
        "period": data.period,
        "total_documents": len(documents),
        "documents_by_type": type_counts,
        "total_spend": total_spend,
        "pending_review": sum(1 for d in documents if d.get("status") == "review_needed"),
    }

    return ReportResponse(summary=summary)
