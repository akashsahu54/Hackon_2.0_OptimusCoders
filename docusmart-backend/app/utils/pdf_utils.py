"""PDF utility functions — convert PDF pages to images for OCR."""

from typing import List
from PIL import Image


def pdf_to_images(pdf_path: str, dpi: int = 300) -> List[Image.Image]:
    """
    Convert a PDF file to a list of PIL Image objects (one per page).
    Uses pdf2image (which uses poppler under the hood).
    """
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(pdf_path, dpi=dpi)
        return images
    except ImportError:
        raise RuntimeError(
            "pdf2image is required for PDF processing. "
            "Install it with: pip install pdf2image  "
            "Also install poppler: https://github.com/oschwartz10612/poppler-windows/releases"
        )
    except Exception as e:
        raise RuntimeError(f"Failed to convert PDF to images: {e}")


def get_pdf_page_count(pdf_path: str) -> int:
    """Get the number of pages in a PDF."""
    try:
        from pdf2image import pdfinfo_from_path
        info = pdfinfo_from_path(pdf_path)
        return info.get("Pages", 1)
    except Exception:
        return 1
