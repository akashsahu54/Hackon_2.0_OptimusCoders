"""Custom exception handlers for the FastAPI application."""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse


class DocumentNotFoundError(Exception):
    def __init__(self, document_id: str):
        self.document_id = document_id


class OCRProcessingError(Exception):
    def __init__(self, message: str):
        self.message = message


class ExtractionError(Exception):
    def __init__(self, message: str):
        self.message = message


class WorkflowExecutionError(Exception):
    def __init__(self, workflow_id: str, message: str):
        self.workflow_id = workflow_id
        self.message = message


# ─── Exception Handlers (register in main.py) ───

async def document_not_found_handler(request: Request, exc: DocumentNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"detail": f"Document {exc.document_id} not found"},
    )


async def ocr_processing_error_handler(request: Request, exc: OCRProcessingError):
    return JSONResponse(
        status_code=500,
        content={"detail": f"OCR processing failed: {exc.message}"},
    )


async def extraction_error_handler(request: Request, exc: ExtractionError):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Data extraction failed: {exc.message}"},
    )
