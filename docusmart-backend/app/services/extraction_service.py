"""AI Extraction Service — extract structured fields from OCR text using LLM."""

import json
from typing import Dict, Any, Optional
from app.config import settings


EXTRACTION_PROMPT = """You are a document data extraction AI. Extract structured data from the document text below.

Return ONLY valid JSON matching this schema (use null for missing fields):
{{
  "document_type": "invoice|receipt|contract|id_document|bank_statement|tax_form|medical_form|purchase_order|utility_bill|other",
  "vendor_name": "string or null",
  "customer_name": "string or null",
  "invoice_number": "string or null",
  "invoice_date": "YYYY-MM-DD or null",
  "due_date": "YYYY-MM-DD or null",
  "total_amount": number or null,
  "subtotal": number or null,
  "tax_amount": number or null,
  "currency": "USD|EUR|GBP|etc or null",
  "payment_terms": "string or null",
  "line_items": [
    {{"description": "string", "quantity": number, "unit_price": number, "total": number}}
  ],
  "names": ["list of person names found"],
  "dates": ["list of dates found in YYYY-MM-DD format"],
  "amounts": ["list of monetary amounts found"],
  "addresses": ["list of addresses found"],
  "confidence_score": 0.0 to 1.0
}}

{type_hint}

Document text:
{ocr_text}
"""


def extract_fields(ocr_text: str, document_type: Optional[str] = None) -> Dict[str, Any]:
    """
    Extract structured fields from OCR text using the configured AI provider.
    Falls back to regex-based extraction if AI fails.
    """
    if not ocr_text or len(ocr_text.strip()) < 10:
        return {"fields": {}, "confidence": 0.0}

    type_hint = f"The document has been classified as: {document_type}" if document_type else ""
    prompt = EXTRACTION_PROMPT.format(ocr_text=ocr_text[:4000], type_hint=type_hint)

    try:
        if settings.AI_PROVIDER == "anthropic":
            result = _extract_with_anthropic(prompt)
        elif settings.AI_PROVIDER == "openai":
            result = _extract_with_openai(prompt)
        else:
            result = _extract_with_regex(ocr_text)

        confidence = result.get("confidence_score", 0.8)
        return {"fields": result, "confidence": float(confidence)}

    except Exception as e:
        print(f"AI extraction failed, falling back to regex: {e}")
        result = _extract_with_regex(ocr_text)
        return {"fields": result, "confidence": 0.5}


def _extract_with_anthropic(prompt: str) -> dict:
    """Extract using Anthropic Claude API."""
    import anthropic

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    response_text = message.content[0].text
    return _parse_json_response(response_text)


def _extract_with_openai(prompt: str) -> dict:
    """Extract using OpenAI GPT API."""
    from openai import OpenAI

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a document data extraction assistant. Always respond with valid JSON only."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        max_tokens=2048,
    )
    response_text = response.choices[0].message.content
    return _parse_json_response(response_text)


def _extract_with_regex(ocr_text: str) -> dict:
    """Fallback: basic regex-based extraction."""
    import re

    DATE_PATTERN = r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\w+ \d{1,2},? \d{4})\b'
    AMOUNT_PATTERN = r'\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?'
    EMAIL_PATTERN = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    INVOICE_PATTERN = r'(?:Invoice|INV|Bill)\s*#?\s*([A-Z0-9-]{4,20})'

    dates = re.findall(DATE_PATTERN, ocr_text)
    amounts = re.findall(AMOUNT_PATTERN, ocr_text)
    emails = re.findall(EMAIL_PATTERN, ocr_text)
    invoice_nums = re.findall(INVOICE_PATTERN, ocr_text, re.IGNORECASE)

    return {
        "dates": dates[:10],
        "amounts": amounts[:10],
        "emails": emails[:5],
        "invoice_number": invoice_nums[0] if invoice_nums else None,
        "confidence_score": 0.5,
    }


def _parse_json_response(text: str) -> dict:
    """Parse JSON from LLM response, handling markdown code blocks."""
    text = text.strip()
    # Remove markdown code fences
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON object in text
        start = text.find("{")
        end = text.rfind("}") + 1
        if start != -1 and end > start:
            return json.loads(text[start:end])
        return {"raw_response": text, "confidence_score": 0.3}
