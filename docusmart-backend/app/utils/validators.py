"""Field validation helpers for extracted document data."""

import re
from datetime import datetime
from typing import Optional


def validate_date(date_str: str) -> Optional[str]:
    """Validate and normalize a date string to YYYY-MM-DD format."""
    formats = [
        "%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y",
        "%m-%d-%Y", "%d-%m-%Y",
        "%B %d, %Y", "%b %d, %Y",
        "%B %d %Y", "%b %d %Y",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str.strip(), fmt)
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def validate_amount(amount_str: str) -> Optional[float]:
    """Parse a monetary amount string into a float."""
    try:
        cleaned = re.sub(r"[^\d.,]", "", str(amount_str))
        # Handle comma as thousands separator
        if "," in cleaned and "." in cleaned:
            cleaned = cleaned.replace(",", "")
        elif "," in cleaned:
            # Could be decimal comma or thousands
            parts = cleaned.split(",")
            if len(parts[-1]) == 2:
                cleaned = cleaned.replace(",", ".")
            else:
                cleaned = cleaned.replace(",", "")
        return round(float(cleaned), 2)
    except (ValueError, TypeError):
        return None


def validate_email(email: str) -> bool:
    """Basic email format validation."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email.strip()))


def validate_invoice_number(inv_num: str) -> bool:
    """Check if string looks like a valid invoice number."""
    return bool(re.match(r'^[A-Z0-9-]{3,30}$', inv_num.strip(), re.IGNORECASE))
