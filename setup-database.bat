@echo off
echo ============================================================
echo PostgreSQL Database Setup for DocuSmart
echo ============================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed!
    echo.
    echo Please choose an option:
    echo.
    echo Option 1: Install Docker Desktop (Recommended)
    echo   Download from: https://www.docker.com/products/docker-desktop/
    echo   After installation, restart your computer and run this script again.
    echo.
    echo Option 2: Use Cloud PostgreSQL (No installation needed)
    echo   - Neon: https://neon.tech/ (Free tier: 0.5 GB)
    echo   - Supabase: https://supabase.com/ (Free tier: 500 MB)
    echo   - ElephantSQL: https://www.elephantsql.com/ (Free tier: 20 MB)
    echo.
    echo Option 3: Install PostgreSQL directly
    echo   Download from: https://www.postgresql.org/download/windows/
    echo.
    echo See POSTGRES_SETUP.md for detailed instructions.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is installed
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo.
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

echo ============================================================
echo Starting PostgreSQL Database...
echo ============================================================
cd docusmart-backend

REM Start only the database service
docker-compose up -d db

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start database
    echo.
    echo Troubleshooting:
    echo 1. Make sure port 5432 is not already in use
    echo 2. Check Docker Desktop is running properly
    echo 3. Try: docker-compose down, then run this script again
    echo.
    cd ..
    pause
    exit /b 1
)

echo.
echo [OK] PostgreSQL is starting...
echo.
echo Waiting for database to be ready...
timeout /t 5 /nobreak >nul

REM Test database connection
echo Testing database connection...
docker exec docusmart-backend-db-1 pg_isready -U docusmart >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Database might still be starting up...
    echo Waiting a bit more...
    timeout /t 5 /nobreak >nul
)

echo.
echo ============================================================
echo Database Setup Complete!
echo ============================================================
echo.
echo Database Details:
echo   Host:     localhost
echo   Port:     5432
echo   Database: docusmart
echo   Username: docusmart
echo   Password: docusmart
echo.
echo Connection String:
echo   postgresql://docusmart:docusmart@localhost:5432/docusmart
echo.
echo Useful Commands:
echo   View logs:    docker-compose logs db
echo   Stop:         docker-compose down
echo   Restart:      docker-compose restart db
echo   Access shell: docker exec -it docusmart-backend-db-1 psql -U docusmart -d docusmart
echo.
echo Next Steps:
echo   1. Run database migrations: alembic upgrade head
echo   2. Install backend dependencies: pip install -r requirements.txt
echo   3. Start backend: uvicorn app.main:app --reload
echo.

cd ..
pause
