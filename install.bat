@echo off
echo ============================================================
echo DocuSmart Installation Script for Windows
echo ============================================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.10+
    pause
    exit /b 1
)
echo [OK] Python found

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js
    pause
    exit /b 1
)
echo [OK] Node.js found

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker not found
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    echo After installing Docker, run this script again.
    pause
    exit /b 1
)
echo [OK] Docker found

echo.
echo ============================================================
echo Step 1: Configure Environment
echo ============================================================
python setup.py
if errorlevel 1 (
    echo [ERROR] Setup failed
    pause
    exit /b 1
)

echo.
echo ============================================================
echo Step 2: Start PostgreSQL Database
echo ============================================================
cd docusmart-backend
docker-compose up -d db
if errorlevel 1 (
    echo [ERROR] Failed to start database
    cd ..
    pause
    exit /b 1
)
echo [OK] Database started
cd ..

echo.
echo Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo.
echo ============================================================
echo Step 3: Install Backend Dependencies
echo ============================================================
cd docusmart-backend
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
cd ..

echo.
echo ============================================================
echo Step 4: Run Database Migrations
echo ============================================================
cd docusmart-backend
alembic upgrade head
if errorlevel 1 (
    echo [WARNING] Migration failed - this is OK if database is already set up
)
cd ..

echo.
echo ============================================================
echo Step 5: Install Frontend Dependencies
echo ============================================================
cd docusmart-frontend
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
cd ..

echo.
echo ============================================================
echo Installation Complete!
echo ============================================================
echo.
echo To start the application:
echo   1. Backend:  cd docusmart-backend ^&^& uvicorn app.main:app --reload
echo   2. Frontend: cd docusmart-frontend ^&^& npm run dev
echo.
echo Access at:
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo.
pause
