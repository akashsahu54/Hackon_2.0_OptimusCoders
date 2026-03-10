"""
Document & ProcessingJob — MongoDB document schema reference.

Collection: documents
{
    _id: str(uuid4),
    user_id: str,
    original_filename: str,
    file_path: str,
    file_size_bytes: int | None,
    mime_type: str | None,
    page_count: int,
    status: str,
    document_type: str | None,
    classification_confidence: float | None,
    ocr_text: str | None,
    ocr_confidence: float | None,
    extracted_fields: dict | None,
    extraction_confidence: float | None,
    tags: list[str],
    folder_path: str | None,
    is_duplicate: bool,
    duplicate_of_id: str | None,
    processing_time_ms: int | None,
    created_at: datetime,
    updated_at: datetime,
    processed_at: datetime | None,
}

Collection: processing_jobs
{
    _id: str(uuid4),
    document_id: str,
    job_type: str,
    status: str,
    worker_id: str | None,
    started_at: datetime | None,
    completed_at: datetime | None,
    error: str | None,
}
"""
