"""File Storage Service — upload/download abstraction for local filesystem and S3."""

import os
import uuid
from typing import Optional
from app.config import settings


def save_file(content: bytes, filename: str, user_id: str) -> str:
    """
    Save file content to storage and return the file path/key.
    Currently uses local filesystem. Swap to S3/MinIO for production.
    """
    upload_dir = os.path.join(settings.UPLOAD_DIR, user_id)
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(filename)[1]
    safe_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, safe_name)

    with open(file_path, "wb") as f:
        f.write(content)

    return file_path


def get_file(file_path: str) -> Optional[bytes]:
    """Read file content from storage."""
    if not os.path.exists(file_path):
        return None
    with open(file_path, "rb") as f:
        return f.read()


def delete_file(file_path: str) -> bool:
    """Delete a file from storage."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except OSError:
        return False


def get_file_url(file_path: str) -> str:
    """
    Get a URL for downloading the file.
    In production, this would generate a presigned S3 URL.
    """
    return f"/files/{os.path.basename(file_path)}"
