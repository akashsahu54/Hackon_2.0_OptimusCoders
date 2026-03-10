"""OCR Service — extract text from documents using Tesseract or Google Vision."""

import os
from typing import Dict, Any
from app.config import settings


def run_ocr_pipeline(file_path: str, mime_type: str) -> Dict[str, Any]:
    """
    Run the full OCR pipeline on a document file.

    1. Convert PDF to images if needed
    2. Pre-process images (grayscale, denoise, deskew)
    3. Run OCR engine
    4. Return extracted text + confidence score
    """
    if settings.OCR_ENGINE == "google_vision":
        return _ocr_google_vision(file_path)
    else:
        return _ocr_tesseract(file_path, mime_type)


def _ocr_tesseract(file_path: str, mime_type: str) -> Dict[str, Any]:
    """OCR using pytesseract (local, free)."""
    try:
        import pytesseract
        from PIL import Image
        from app.utils.preprocessing import preprocess_image
        from app.utils.pdf_utils import pdf_to_images

        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

        # Convert PDF to images
        if mime_type == "application/pdf":
            images = pdf_to_images(file_path)
        else:
            images = [Image.open(file_path)]

        all_text = []
        total_confidence = 0.0

        for img in images:
            # Pre-process
            processed = preprocess_image(img)

            # Run OCR with detailed output
            data = pytesseract.image_to_data(processed, output_type=pytesseract.Output.DICT)

            # Extract text
            page_text = pytesseract.image_to_string(processed)
            all_text.append(page_text)

            # Calculate confidence
            confidences = [int(c) for c in data["conf"] if int(c) > 0]
            if confidences:
                total_confidence += sum(confidences) / len(confidences)

        avg_confidence = total_confidence / len(images) if images else 0
        full_text = "\n\n--- PAGE BREAK ---\n\n".join(all_text)

        return {
            "text": full_text.strip(),
            "confidence": round(avg_confidence / 100.0, 3),  # Normalize to 0-1
            "page_count": len(images),
            "engine": "tesseract",
        }

    except Exception as e:
        return {
            "text": f"OCR Error: {str(e)}",
            "confidence": 0.0,
            "page_count": 0,
            "engine": "tesseract",
        }


def _ocr_google_vision(file_path: str) -> Dict[str, Any]:
    """OCR using Google Cloud Vision API."""
    try:
        from google.cloud import vision
        import io

        client = vision.ImageAnnotatorClient()

        with open(file_path, "rb") as f:
            content = f.read()

        image = vision.Image(content=content)
        response = client.document_text_detection(image=image)

        if response.error.message:
            raise Exception(response.error.message)

        full_text = response.full_text_annotation.text if response.full_text_annotation else ""

        # Calculate average confidence from pages
        confidence = 0.0
        if response.full_text_annotation and response.full_text_annotation.pages:
            page_confidences = [
                page.confidence for page in response.full_text_annotation.pages
                if page.confidence
            ]
            confidence = sum(page_confidences) / len(page_confidences) if page_confidences else 0.0

        return {
            "text": full_text.strip(),
            "confidence": round(confidence, 3),
            "page_count": len(response.full_text_annotation.pages) if response.full_text_annotation else 1,
            "engine": "google_vision",
        }

    except Exception as e:
        return {
            "text": f"Google Vision Error: {str(e)}",
            "confidence": 0.0,
            "page_count": 0,
            "engine": "google_vision",
        }
