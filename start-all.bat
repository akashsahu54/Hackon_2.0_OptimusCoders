@echo off
echo Starting DocuSmart Application...
echo.

REM Start backend in new window
start "DocuSmart Backend" cmd /k "cd docusmart-backend && uvicorn app.main:app --reload"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "DocuSmart Frontend" cmd /k "cd docusmart-frontend && npm run dev"

echo.
echo ============================================================
echo DocuSmart is starting...
echo ============================================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Close this window to keep services running.
echo ============================================================
