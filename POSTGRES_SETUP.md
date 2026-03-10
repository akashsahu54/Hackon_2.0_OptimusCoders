# PostgreSQL Database Setup Guide

## Option 1: Using Docker (Recommended - Easiest)

### Step 1: Install Docker Desktop
1. Download Docker Desktop for Windows from: https://www.docker.com/products/docker-desktop/
2. Run the installer
3. Restart your computer when prompted
4. Open Docker Desktop and wait for it to start

### Step 2: Verify Docker Installation
Open a new terminal and run:
```bash
docker --version
```

### Step 3: Start PostgreSQL with Docker Compose
```bash
cd docusmart-backend
docker-compose up -d db
```

This will:
- Download PostgreSQL image (first time only)
- Create a database named `docusmart`
- Username: `docusmart`
- Password: `docusmart`
- Port: `5432`

### Step 4: Verify Database is Running
```bash
docker ps
```

You should see a container named `docusmart-backend-db-1` running.

### Step 5: Test Connection
```bash
docker exec -it docusmart-backend-db-1 psql -U docusmart -d docusmart
```

Type `\q` to exit.

---

## Option 2: Install PostgreSQL Directly (Without Docker)

### Step 1: Download PostgreSQL
1. Go to: https://www.postgresql.org/download/windows/
2. Download the installer (version 15 or 16)
3. Run the installer

### Step 2: Installation Settings
- Port: `5432` (default)
- Password: Choose a password (remember it!)
- Locale: Default

### Step 3: Create Database
Open pgAdmin (installed with PostgreSQL) or use command line:

```bash
# Open psql
psql -U postgres

# Create user
CREATE USER docusmart WITH PASSWORD 'docusmart';

# Create database
CREATE DATABASE docusmart OWNER docusmart;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE docusmart TO docusmart;

# Exit
\q
```

### Step 4: Update .env File
If you used a different password, update your `.env` file:
```env
DATABASE_URL=postgresql://docusmart:YOUR_PASSWORD@localhost:5432/docusmart
```

---

## Option 3: Use Free Cloud PostgreSQL (No Installation)

### Neon (Recommended for Quick Start)
1. Go to: https://neon.tech/
2. Sign up (free tier: 0.5 GB storage)
3. Create a new project
4. Copy the connection string
5. Update `.env` file with the connection string

### Supabase (Alternative)
1. Go to: https://supabase.com/
2. Sign up (free tier: 500 MB storage)
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string (URI format)
6. Update `.env` file

### ElephantSQL (Alternative)
1. Go to: https://www.elephantsql.com/
2. Sign up (free tier: 20 MB storage)
3. Create a new instance
4. Copy the connection URL
5. Update `.env` file

---

## Verify Database Setup

After setting up PostgreSQL (any option), verify it works:

### 1. Check if database is accessible
```bash
cd docusmart-backend
python -c "from app.database import engine; print('✓ Database connected!')"
```

### 2. Run migrations
```bash
cd docusmart-backend
alembic upgrade head
```

You should see:
```
INFO  [alembic.runtime.migration] Running upgrade -> xxxxx, initial
✓ Database tables created!
```

---

## Troubleshooting

### Error: "Connection refused"
- **Docker**: Make sure Docker Desktop is running
- **Local**: Make sure PostgreSQL service is running
- **Cloud**: Check your internet connection

### Error: "Password authentication failed"
- Check username/password in `.env` file
- Make sure `DATABASE_URL` format is correct

### Error: "Port 5432 already in use"
- Another PostgreSQL instance is running
- Stop it or use a different port

### Docker: "Cannot connect to Docker daemon"
- Make sure Docker Desktop is running
- Restart Docker Desktop

---

## Quick Commands Reference

### Docker Commands
```bash
# Start database
docker-compose up -d db

# Stop database
docker-compose down

# View logs
docker-compose logs db

# Access database shell
docker exec -it docusmart-backend-db-1 psql -U docusmart -d docusmart

# Restart database
docker-compose restart db
```

### PostgreSQL Commands (inside psql)
```sql
-- List databases
\l

-- Connect to database
\c docusmart

-- List tables
\dt

-- View table structure
\d documents

-- Exit
\q
```

---

## Recommended Setup for Hackathon

**Best Option**: Docker (Option 1)
- ✅ Easiest to set up
- ✅ No configuration needed
- ✅ Works exactly as expected
- ✅ Easy to reset/restart

**Quick Alternative**: Neon Cloud (Option 3)
- ✅ No installation needed
- ✅ Works immediately
- ✅ Free tier sufficient for hackathon
- ⚠️ Requires internet connection

---

## Next Steps After Database Setup

1. ✅ Database is running
2. Run migrations: `cd docusmart-backend && alembic upgrade head`
3. Install backend dependencies: `pip install -r requirements.txt`
4. Start backend: `uvicorn app.main:app --reload`
