"""Workflow Execution Service — execute workflow actions based on triggers."""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.workflow import Workflow
from app.models.document import Document


def execute_workflow(workflow: Workflow, document_id: str, db: Session) -> Dict[str, Any]:
    """
    Execute a workflow action for a given document.
    Returns result data dict.
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise ValueError(f"Document {document_id} not found")

    action_type = workflow.action_type
    action_config = workflow.action_config or {}

    if action_type == "send_email":
        return _action_send_email(document, action_config)
    elif action_type == "create_tag":
        return _action_create_tag(document, action_config, db)
    elif action_type == "generate_report":
        return _action_generate_report(document, action_config)
    elif action_type == "webhook":
        return _action_webhook(document, action_config)
    elif action_type == "slack":
        return _action_slack(document, action_config)
    else:
        return {"status": "skipped", "reason": f"Unknown action type: {action_type}"}


def check_workflow_triggers(document: Document, db: Session):
    """Check all active workflows and trigger matching ones after document processing."""
    workflows = db.query(Workflow).filter(
        Workflow.user_id == document.user_id,
        Workflow.is_active == True,
    ).all()

    for wf in workflows:
        if _should_trigger(wf, document):
            try:
                execute_workflow(wf, str(document.id), db)
                wf.run_count += 1
            except Exception as e:
                print(f"Workflow {wf.id} failed: {e}")

    db.commit()


def _should_trigger(workflow: Workflow, document: Document) -> bool:
    """Check if a workflow should be triggered for this document."""
    condition = workflow.trigger_condition or {}

    if workflow.trigger_type == "document_uploaded":
        # Check if document type matches
        required_type = condition.get("document_type")
        if required_type and document.document_type != required_type:
            return False
        return True

    elif workflow.trigger_type == "field_value":
        # Check a specific field condition
        field = condition.get("field")
        if not field or not document.extracted_fields:
            return False
        return field in document.extracted_fields

    return False


# ─── Action Implementations ───

def _action_send_email(document: Document, config: dict) -> Dict[str, Any]:
    """Send an email notification about a document."""
    to_email = config.get("to", "")
    template = config.get("template", "default")
    subject = f"DocuSmart Alert: {document.document_type} - {document.original_filename}"

    # In production, integrate SendGrid or SMTP here
    print(f"[EMAIL] To: {to_email} | Subject: {subject} | Template: {template}")

    return {
        "action": "send_email",
        "to": to_email,
        "subject": subject,
        "status": "sent",
    }


def _action_create_tag(document: Document, config: dict, db: Session) -> Dict[str, Any]:
    """Auto-tag a document based on its content."""
    tags_to_add = config.get("tags", [])

    # Auto-generate tags from extracted fields
    fields = document.extracted_fields or {}
    if fields.get("vendor_name"):
        tags_to_add.append(f"vendor-{fields['vendor_name'].lower().replace(' ', '-')}")
    if fields.get("total_amount") and float(fields["total_amount"]) > 500:
        tags_to_add.append("over-$500")
    if document.document_type:
        tags_to_add.append(document.document_type)

    existing_tags = document.tags or []
    document.tags = list(set(existing_tags + tags_to_add))
    db.commit()

    return {
        "action": "create_tag",
        "tags_added": tags_to_add,
        "status": "completed",
    }


def _action_generate_report(document: Document, config: dict) -> Dict[str, Any]:
    """Generate a report for the document."""
    return {
        "action": "generate_report",
        "document_id": str(document.id),
        "status": "report_queued",
    }


def _action_webhook(document: Document, config: dict) -> Dict[str, Any]:
    """Send document data to a webhook URL."""
    url = config.get("url", "")
    # In production, use httpx to POST extracted fields to the webhook
    print(f"[WEBHOOK] POST to {url} with document {document.id}")

    return {
        "action": "webhook",
        "url": url,
        "status": "sent",
    }


def _action_slack(document: Document, config: dict) -> Dict[str, Any]:
    """Send a Slack notification."""
    channel = config.get("channel", "#general")
    message = f"New {document.document_type}: {document.original_filename}"
    print(f"[SLACK] #{channel}: {message}")

    return {
        "action": "slack",
        "channel": channel,
        "message": message,
        "status": "sent",
    }
