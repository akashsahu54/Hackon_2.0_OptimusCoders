"""
AuditLog, DocumentShare, ExtractionTemplate — MongoDB document schema reference.

Collection: audit_logs
{
    _id: str(uuid4),
    user_id: str | None,
    document_id: str | None,
    action: str,
    old_value: dict | None,
    new_value: dict | None,
    ip_address: str | None,
    created_at: datetime,
}

Collection: document_shares
{
    _id: str(uuid4),
    document_id: str,
    shared_by: str,
    shared_with_email: str,
    permission_level: "view" | "edit",
    expires_at: datetime | None,
    token: str,
    created_at: datetime,
}

Collection: extraction_templates
{
    _id: str(uuid4),
    document_type: str,
    prompt_template: str,
    field_schema: dict | None,
    version: str,
    is_active: str,
    created_at: datetime,
}
"""
