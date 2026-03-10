"""Basic tests for the DocuSmart backend."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    """Test the root health check endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "running"
    assert data["app"] == "DocuSmart AI"


def test_health():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_docs_available():
    """Test that Swagger docs are accessible."""
    response = client.get("/docs")
    assert response.status_code == 200


class TestAuth:
    """Test authentication endpoints."""

    def test_register_missing_fields(self):
        response = client.post("/auth/register", json={})
        assert response.status_code == 422

    def test_login_invalid_credentials(self):
        response = client.post("/auth/login", json={
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401


class TestDocuments:
    """Test document endpoints."""

    def test_list_documents_unauthorized(self):
        response = client.get("/documents")
        assert response.status_code in (401, 403)

    def test_upload_unauthorized(self):
        response = client.post("/documents/upload")
        assert response.status_code in (401, 403, 422)


class TestExtraction:
    """Test extraction utilities."""

    def test_validate_date(self):
        from app.utils.validators import validate_date
        assert validate_date("2024-03-15") == "2024-03-15"
        assert validate_date("03/15/2024") == "2024-03-15"
        assert validate_date("invalid") is None

    def test_validate_amount(self):
        from app.utils.validators import validate_amount
        assert validate_amount("$1,234.56") == 1234.56
        assert validate_amount("4500.00") == 4500.00
        assert validate_amount("invalid") is None

    def test_validate_email(self):
        from app.utils.validators import validate_email
        assert validate_email("test@example.com") is True
        assert validate_email("notanemail") is False
