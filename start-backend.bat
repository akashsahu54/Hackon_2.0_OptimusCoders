@echo off
echo Starting DocuSmart Backend...
cd docusmart-backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
