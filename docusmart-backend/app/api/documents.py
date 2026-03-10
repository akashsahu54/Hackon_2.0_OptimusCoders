"""Document API routes — upload, list, detail, update, delete, reprocess."""

import os
import uuid
import time
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.document import Document
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


def process_document_pipeline(document_id: str, db_url: str):
    """Background task: run OCR → classification → extraction pipeline."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session as DBSession

    engine = create_engine(db_url)
    with DBSession(engine) as db:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return

        start_time = time.time()

        try:
            # Step 1: OCR
            doc.status = "ocr_processing"
            db.commit()

            ocr_result = run_ocr_pipeline(doc.file_path, doc.mime_type)
            doc.ocr_text = ocr_result["text"]
            doc.ocr_confidence = ocr_result["confidence"]
            db.commit()

            # Step 2: Classification
            doc.status = "classifying"
            db.commit()

            classification = classify_document(doc.ocr_text)
            doc.document_type = classification["type"]
            doc.classification_confidence = classification["confidence"]
            db.commit()

            # Step 3: AI Extraction
            doc.status = "extracting"
            db.commit()

            extraction = extract_fields(doc.ocr_text, doc.document_type)
            doc.extracted_fields = extraction["fields"]
            doc.extraction_confidence = extraction["confidence"]

            # Done
            doc.status = "completed"
            doc.processed_at = datetime.utcnow()
            doc.processing_time_ms = int((time.time() - start_time) * 1000)
            db.commit()

        except Exception as e:
            doc.status = "failed"
            doc.processing_time_ms = int((time.time() - start_time) * 1000)
            db.commit()
            print(f"Pipeline error for {document_id}: {e}")


@router.post("/upload", response_model=DocumentSummary, status_code=201)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
    upload_dir = os.path.join(settings.UPLOAD_DIR, str(current_user.id))
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename)[1]
    saved_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, saved_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Create document record
    doc = Document(
        user_id=current_user.id,
        original_filename=file.filename,
        file_path=file_path,
        file_size_bytes=len(contents),
        mime_type=file.content_type,
        status="uploaded",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Queue background processing
    background_tasks.add_task(process_document_pipeline, str(doc.id), settings.DATABASE_URL)

    return DocumentSummary.model_validate(doc)


@router.get("", response_model=DocumentListResponse)
def list_documents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all documents for the current user with filtering."""
    query = db.query(Document).filter(Document.user_id == current_user.id)

    if type:
        query = query.filter(Document.document_type == type)
    if status:
        query = query.filter(Document.status == status)
    if search:
        query = query.filter(Document.ocr_text.ilike(f"%{search}%"))

    total = query.count()
    documents = query.order_by(Document.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return DocumentListResponse(
        documents=[DocumentSummary.model_validate(d) for d in documents],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{document_id}", response_model=DocumentDetail)
def get_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full document detail including extracted fields."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentDetail.model_validate(doc)


@router.put("/{document_id}", response_model=DocumentDetail)
def update_document(
    document_id: uuid.UUID,
    data: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update document metadata (tags, folder, corrections)."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if data.tags is not None:
        doc.tags = data.tags
    if data.folder_path is not None:
        doc.folder_path = data.folder_path
    if data.corrections:
        existing = doc.extracted_fields or {}
        existing.update(data.corrections)
        doc.extracted_fields = existing

    doc.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(doc)

    return DocumentDetail.model_validate(doc)


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a document (soft delete)."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    db.delete(doc)
    db.commit()


@router.get("/{document_id}/status", response_model=DocumentStatusResponse)
def get_document_status(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Poll processing status of a document."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()
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
        status=doc.status,
        progress_percent=progress_map.get(doc.status, 0),
        current_step=doc.status,
    )


@router.post("/{document_id}/reprocess", response_model=DocumentStatusResponse)
def reprocess_document(
    document_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Re-run OCR and extraction pipeline on existing document."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = "uploaded"
    doc.ocr_text = None
    doc.extracted_fields = None
    db.commit()

    background_tasks.add_task(process_document_pipeline, str(doc.id), settings.DATABASE_URL)

    return DocumentStatusResponse(status="uploaded", progress_percent=10, current_step="queued")


@router.get("/{document_id}/fields")
def get_extracted_fields(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get extracted fields as flat JSON."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc.extracted_fields or {}


@router.put("/{document_id}/fields")
def correct_fields(
    document_id: uuid.UUID,
    data: FieldCorrection,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually correct extracted fields (audit-safe)."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    existing = doc.extracted_fields or {}
    existing.update(data.corrections)
    doc.extracted_fields = existing
    doc.updated_at = datetime.utcnow()
    db.commit()

    return doc.extracted_fields


@router.post("/extract", response_model=ExtractionResponse)
def extract_from_text(
    data: ExtractRequest,
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
):
    """Classify document type from raw text."""
    result = classify_document(data.text)
    return ClassificationResponse(**result)
