# DocuSmart Setup Guide for Windows

## Prerequisites Installation

### 1. Install Docker Desktop (Required)
- Download from: https://www.docker.com/products/docker-desktop/
- Install and restart your computer
- After restart, verify: `docker --version`

### 2. Install Tesseract OCR (Required)
- Download from: https://github.com/UB-Mannheim/tesseract/wiki
- Download the latest installer (e.g., `tesseract-ocr-w64-setup-5.3.3.20231005.exe`)
- Install to default location: `C:\Program Files\Tesseract-OCR`
- Verify: `"C:\Program Files\Tesseract-OCR\tesseract.exe" --version`

### 3. Get AI API Key (Required - Pick One)

**Option A: Anthropic Claude (Recommended)**
- Go to: https://console.anthropic.com/
- Sign up and create an API key
- Copy the key (starts with `sk-ant-`)

**Option B: OpenAI GPT**
- Go to: https://platform.openai.com/api-keys
- Sign up and create an API key
- Copy the key (starts with `sk-`)

## Quick Setup Steps

### Step 1: Create .env file
Run: `python setup.py` (this will be created next)

### Step 2: Start PostgreSQL Database
```bash
cd docusmart-backend
docker-compose up -d db
```

### Step 3: Install Backend Dependencies
```bash
cd docusmart-backend
pip install -r requirements.txt
```

### Step 4: Run Database Migrations
```bash
cd docusmart-backend
alembic upgrade head
```

### Step 5: Start Backend Server
```bash
cd docusmart-backend
uvicorn app.main:app --reload
```

### Step 6: Install Frontend Dependencies
```bash
cd docusmart-frontend
npm install
```

### Step 7: Start Frontend
```bash
cd docusmart-frontend
npm run dev
```

## Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Troubleshooting

### Docker not found
- Make sure Docker Desktop is installed and running
- Restart your terminal after installation

### Tesseract not found
- Verify installation path in .env file
- Make sure path has double backslashes: `C:\\Program Files\\Tesseract-OCR\\tesseract.exe`

### Database connection error
- Make sure Docker container is running: `docker ps`
- Check if port 5432 is available
