"""User SQLAlchemy model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default="user")  # admin, user, viewer
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    documents = relationship("Document", back_populates="owner")
    workflows = relationship("Workflow", back_populates="owner")


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    plan = Column(String(50), default="free")  # free, pro, enterprise
    api_key = Column(String(255), unique=True, nullable=True)
    max_documents = Column(String(50), default="1000")
    settings = Column(String, default="{}")  # JSON string
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    members = relationship("User", backref="organization")
