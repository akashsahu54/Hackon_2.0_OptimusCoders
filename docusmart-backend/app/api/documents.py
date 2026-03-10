"""Document API routes — upload, list, detail, update, delete, reprocess (MongoDB)."""

import os
import uuid
import time
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, BackgroundTasks
from pymongo.database import Database
from pymongo import MongoClient

from app.database import get_db
from app.config import settings
from app.schemas.document import (
    DocumentSummary, DocumentDetail, DocumentListResponse,
    DocumentStatusResponse, DocumentUpdate, ExtractRequest,
    ExtractionResponse, ClassifyRequest, ClassificationResponse,
    FieldCorrection,
)
from app.core.dependencies import get_current_user
from app.services.ocr_service import run_ocr_pipeline
from app.services.extraction_service import extract_fields
from app.services.classification_service import classify_document

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_MIME_TYPES = {
    "application/pdf", "image/png", "image/jpeg", "image/tiff",
    "image/jpg", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def _doc_to_summary(doc: dict) -> DocumentSummary:
    """Convert MongoDB document dict to DocumentSummary schema."""
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


def _doc_to_detail(doc: dict) -> DocumentDetail:
    """Convert MongoDB document dict to DocumentDetail schema."""
    return DocumentDetail(
        id=doc["_id"],
        original_filename=doc["original_filename"],
        file_path=doc.get("file_path"),
        mime_type=doc.get("mime_type"),
        file_size_bytes=doc.get("file_size_bytes"),
        page_count=doc.get("page_count", 1),
        status=doc.get("status", "uploaded"),
        document_type=doc.get("document_type"),
        classification_confidence=doc.get("classification_confidence"),
        ocr_text=doc.get("ocr_text"),
        ocr_confidence=doc.get("ocr_confidence"),
        extracted_fields=doc.get("extracted_fields"),
        extraction_confidence=doc.get("extraction_confidence"),
        tags=doc.get("tags", []),
        folder_path=doc.get("folder_path"),
        is_duplicate=doc.get("is_duplicate", False),
        duplicate_of_id=doc.get("duplicate_of_id"),
        processing_time_ms=doc.get("processing_time_ms"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
        processed_at=doc.get("processed_at"),
    )


def process_document_pipeline(document_id: str, mongodb_url: str, db_name: str):
    """Background task: run OCR → classification → extraction pipeline."""
    client = MongoClient(mongodb_url)
    db = client[db_name]

    doc = db.documents.find_one({"_id": document_id})
    if not doc:
        return

    start_time = time.time()

    try:
        # Step 1: OCR
        db.documents.update_one({"_id": document_id}, {"$set": {"status": "ocr_processing"}})

        ocr_result = run_ocr_pipeline(doc["file_path"], doc.get("mime_type"))
        db.documents.update_one({"_id": document_id}, {"$set": {
            "ocr_text": ocr_result["text"],
            "ocr_confidence": ocr_result["confidence"],
        }})

        # Step 2: Classification
        db.documents.update_one({"_id": document_id}, {"$set": {"status": "classifying"}})

        classification = classify_document(ocr_result["text"])
        db.documents.update_one({"_id": document_id}, {"$set": {
            "document_type": classification["type"],
            "classification_confidence": classification["confidence"],
        }})

        # Step 3: AI Extraction
        db.documents.update_one({"_id": document_id}, {"$set": {"status": "extracting"}})

        extraction = extract_fields(ocr_result["text"], classification["type"])
        db.documents.update_one({"_id": document_id}, {"$set": {
            "extracted_fields": extraction["fields"],
            "extraction_confidence": extraction["confidence"],
            "status": "completed",
            "processed_at": datetime.utcnow(),
            "processing_time_ms": int((time.time() - start_time) * 1000),
        }})

    except Exception as e:
        db.documents.update_one({"_id": document_id}, {"$set": {
            "status": "failed",
            "processing_time_ms": int((time.time() - start_time) * 1000),
        }})
        print(f"Pipeline error for {document_id}: {e}")
    finally:
        client.close()


@router.post("/upload", response_model=DocumentSummary, status_code=201)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Upload a document and trigger async processing pipeline."""
    # Validate file type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    # Validate file size
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large (max {settings.MAX_FILE_SIZE_MB}MB)")

    # Save file to disk
    user_id = current_user["_id"]
    upload_dir = os.path.join(settings.UPLOAD_DIR, user_id)
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    saved_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, saved_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Create document record
    doc_id = str(uuid.uuid4())
    now = datetime.utcnow()
    doc = {
        "_id": doc_id,
        "user_id": user_id,
        "original_filename": file.filename,
        "file_path": file_path,
        "file_size_bytes": len(contents),
        "mime_type": file.content_type,
        "page_count": 1,
        "status": "uploaded",
        "tags": [],
        "is_duplicate": False,
        "created_at": now,
        "updated_at": now,
    }
    db.documents.insert_one(doc)

    # Queue background processing
    background_tasks.add_task(process_document_pipeline, doc_id, settings.MONGODB_URL, settings.MONGODB_DB_NAME)

    return _doc_to_summary(doc)


@router.get("", response_model=DocumentListResponse)
def list_documents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List all documents for the current user with filtering."""
    query_filter = {"user_id": current_user["_id"]}

    if type:
        query_filter["document_type"] = type
    if status:
        query_filter["status"] = status
    if search:
        query_filter["ocr_text"] = {"$regex": search, "$options": "i"}

    total = db.documents.count_documents(query_filter)
    skip = (page - 1) * limit
    documents = list(
        db.documents.find(query_filter)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    return DocumentListResponse(
        documents=[_doc_to_summary(d) for d in documents],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{document_id}", response_model=DocumentDetail)
def get_document(
    document_id: str,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get full document detail including extracted fields."""
    doc = db.documents.find_one({"_id": document_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return _doc_to_detail(doc)


@router.put("/{document_id}", response_model=DocumentDetail)
def update_document(
    document_id: str,
    data: DocumentUpdate,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update document metadata (tags, folder, corrections)."""
    doc = db.documents.find_one({"_id": document_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    update_fields = {"updated_at": datetime.utcnow()}

    if data.tags is not None:
        update_fields["tags"] = data.tags
    if data.folder_path is not None:
        update_fields["folder_path"] = data.folder_path
    if data.corrections:
        existing = doc.get("extracted_fields") or {}
        existing.update(data.corrections)
        update_fields["extracted_fields"] = existing

    db.documents.update_one({"_id": document_id}, {"$set": update_fields})

    updated_doc = db.documents.find_one({"_id": document_id})
    return _doc_to_detail(updated_doc)


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: str,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Delete a document."""
    result = db.documents.delete_one({"_id": document_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")


@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
def get_document_status(
    document_id: str,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Poll processing status of a document."""
    doc = db.documents.find_one({"_id": document_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    progress_map = {
        "uploaded": 10,
        "ocr_processing": 30,
        "classifying": 50,
        "extracting": 70,
        "completed": 100,
        "failed": 0,
    }

    return DocumentStatusResponse(
        status=doc.get("status", "uploaded"),
        progress_percent=progress_map.get(doc.get("status"), 0),
        current_step=doc.get("status", "uploaded"),
    )


@router.post("/{document_id}/reprocess", response_model=DocumentStatusResponse)
def reprocess_document(
    document_id: str,
    background_tasks: BackgroundTasks,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Re-run OCR and extraction pipeline on existing document."""
    doc = db.documents.find_one({"_id": document_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    db.documents.update_one({"_id": document_id}, {"$set": {
        "status": "uploaded",
        "ocr_text": None,
        "extracted_fields": None,
    }})

    background_tasks.add_task(process_document_pipeline, document_id, settings.MONGODB_URL, settings.MONGODB_DB_NAME)

    return DocumentStatusResponse(status="uploaded", progress_percent=10, current_step="queued")


@router.get("/{document_id}/fields")
def get_extracted_fields(
    document_id: str,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get extracted fields as flat JSON."""
    doc = db.documents.find_one({"_id": document_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc.get("extracted_fields") or {}


@router.put("/{document_id}/fields")
def correct_fields(
    document_id: str,
    data: FieldCorrection,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Manually correct extracted fields (audit-safe)."""
    doc = db.documents.find_one({"_id": document_id, "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    existing = doc.get("extracted_fields") or {}
    existing.update(data.corrections)
    db.documents.update_one({"_id": document_id}, {"$set": {
        "extracted_fields": existing,
        "updated_at": datetime.utcnow(),
    }})
    return existing


@router.post("/extract", response_model=ExtractionResponse)
def extract_from_text(
    data: ExtractRequest,
    current_user: dict = Depends(get_current_user),
):
    """Extract structured data from raw text (no file upload)."""
    result = extract_fields(data.text, data.document_type)
    return ExtractionResponse(
        document_type=data.document_type,
        fields=result["fields"],
        confidence=result["confidence"],
    )


@router.post("/classify", response_model=ClassificationResponse)
def classify_text(
    data: ClassifyRequest,
    current_user: dict = Depends(get_current_user),
):
    """Classify document type from raw text."""
    result = classify_document(data.text)
    return ClassificationResponse(**result)
