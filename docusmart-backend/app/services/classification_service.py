"""Document Classification Service — determine document type from OCR text."""

import json
from typing import Dict, Any
from app.config import settings


# ─── Keyword-based classifier (fast fallback) ───

CLASSIFIER_KEYWORDS = {
    "invoice": ["invoice", "bill to", "amount due", "payment terms", "inv #", "invoice number", "net 30"],
    "receipt": ["receipt", "thank you", "change due", "subtotal", "cashier", "transaction", "paid"],
    "contract": ["agreement", "hereinafter", "whereas", "party", "executed", "jurisdiction", "clause"],
    "id_document": ["date of birth", "expiry date", "license no", "passport", "nationality", "id number"],
    "bank_statement": ["account number", "routing", "balance", "transaction history", "statement period"],
    "tax_form": ["w-2", "1099", "wages", "withholding", "employer identification", "tax year", "ssn"],
    "medical_form": ["patient", "diagnosis", "prescription", "physician", "medical record", "dob"],
    "purchase_order": ["purchase order", "po number", "delivery date", "quantity ordered", "buyer"],
    "utility_bill": ["meter reading", "utility", "kwh", "service period", "account holder", "electric"],
}


CLASSIFY_PROMPT = """Based on the document text below, classify it into exactly ONE category:
[invoice, receipt, contract, id_document, bank_statement, tax_form, medical_form, purchase_order, utility_bill, other]

Respond with ONLY JSON: {{"type": "<category>", "confidence": 0.0-1.0, "reason": "brief explanation"}}

Document:
{ocr_text}
"""


def classify_document(ocr_text: str) -> Dict[str, Any]:
    """
    Classify a document based on its OCR text.
    Uses LLM for best accuracy, falls back to keyword matching.
    """
    if not ocr_text or len(ocr_text.strip()) < 10:
        return {"type": "other", "confidence": 0.0, "reason": "Insufficient text"}

    try:
        if settings.AI_PROVIDER in ("anthropic", "openai"):
            return _classify_with_llm(ocr_text)
        else:
            return _classify_with_keywords(ocr_text)
    except Exception as e:
        print(f"LLM classification failed, using keyword fallback: {e}")
        return _classify_with_keywords(ocr_text)


def _classify_with_llm(ocr_text: str) -> Dict[str, Any]:
    """Classify using LLM (Claude or GPT)."""
    prompt = CLASSIFY_PROMPT.format(ocr_text=ocr_text[:2000])

    if settings.AI_PROVIDER == "anthropic":
        import anthropic
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=256,
            messages=[{"role": "user", "content": prompt}],
        )
        response_text = message.content[0].text
    else:
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=256,
        )
        response_text = response.choices[0].message.content

    # Parse response
    response_text = response_text.strip()
    if response_text.startswith("```"):
        response_text = response_text.split("\n", 1)[1] if "\n" in response_text else response_text[3:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]

    try:
        result = json.loads(response_text.strip())
        return {
            "type": result.get("type", "other"),
            "confidence": float(result.get("confidence", 0.8)),
            "reason": result.get("reason", ""),
        }
    except json.JSONDecodeError:
        return _classify_with_keywords(ocr_text)


def _classify_with_keywords(ocr_text: str) -> Dict[str, Any]:
    """Classify using keyword frequency scoring."""
    text_lower = ocr_text.lower()
    scores = {}

    for doc_type, keywords in CLASSIFIER_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[doc_type] = score

    if not scores:
        return {"type": "other", "confidence": 0.3, "reason": "No matching keywords found"}

    best_type = max(scores, key=scores.get)
    max_possible = len(CLASSIFIER_KEYWORDS[best_type])
    confidence = min(scores[best_type] / max_possible, 1.0)

    return {
        "type": best_type,
        "confidence": round(confidence, 2),
        "reason": f"Matched {scores[best_type]} keywords for {best_type}",
    }
