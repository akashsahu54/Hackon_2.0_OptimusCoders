"""
User & Organization — MongoDB document helpers.

Collection: users
{
    _id: ObjectId / str(uuid4),
    email: str,
    password_hash: str,
    full_name: str | None,
    role: "user" | "admin" | "viewer",
    organization_id: str | None,
    created_at: datetime,
    last_login_at: datetime | None,
    is_active: bool,
}

Collection: organizations
{
    _id: str(uuid4),
    name: str,
    plan: "free" | "pro" | "enterprise",
    api_key: str | None,
    max_documents: str,
    settings: dict,
    created_at: datetime,
}
"""
