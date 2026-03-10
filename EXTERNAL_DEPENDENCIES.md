# DocuSmart External Dependencies & APIs

## 🔴 Required (Must Have to Run)

### 1. **AI Provider API** (Pick ONE)

#### Option A: Anthropic Claude API (Recommended)
- **What it does**: Extracts structured data from documents using AI
- **Cost**: Pay-as-you-go (starts at $3 per million input tokens)
- **Free tier**: $5 credit for new accounts
- **How to get**:
  1. Go to https://console.anthropic.com/
  2. Sign up with email
  3. Go to "API Keys" section
  4. Click "Create Key"
  5. Copy the key (starts with `sk-ant-`)
- **Model used**: `claude-sonnet-4-20250514`
- **Why recommended**: Better at JSON extraction, more reliable

#### Option B: OpenAI GPT API (Alternative)
- **What it does**: Same as Claude - AI extraction
- **Cost**: Pay-as-you-go (starts at $0.15 per million input tokens)
- **Free tier**: $5 credit for new accounts (expires after 3 months)
- **How to get**:
  1. Go to https://platform.openai.com/
  2. Sign up with email
  3. Go to "API Keys"
  4. Click "Create new secret key"
  5. Copy the key (starts with `sk-`)
- **Model used**: `gpt-4o` or `gpt-4o-mini`

**For Hackathon**: Use Anthropic - it's better for document extraction.

---

### 2. **PostgreSQL Database**
- **What it does**: Stores all application data (users, documents, workflows)
- **Cost**: FREE (running locally via Docker)
- **How to get**: 
  - Install Docker Desktop (see installation section)
  - Run: `docker-compose up -d db`
- **No API key needed** - runs on your machine

---

### 3. **Tesseract OCR**
- **What it does**: Extracts text from scanned images/PDFs
- **Cost**: FREE (open source)
- **How to get**:
  1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
  2. Download Windows installer (e.g., `tesseract-ocr-w64-setup-5.3.3.20231005.exe`)
  3. Install to: `C:\Program Files\Tesseract-OCR`
  4. Add path to .env file
- **No API key needed** - runs locally

---

## 🟡 Optional (Nice to Have)

### 4. **SendGrid Email API** (Optional)
- **What it does**: Sends email notifications for workflow alerts
- **Cost**: FREE tier (100 emails/day)
- **How to get**:
  1. Go to https://sendgrid.com/
  2. Sign up for free account
  3. Go to Settings → API Keys
  4. Create API key with "Mail Send" permissions
  5. Copy the key (starts with `SG.`)
- **If not configured**: Workflow alerts will just print to console (still works)

---

### 5. **Google Cloud Vision API** (Optional Alternative to Tesseract)
- **What it does**: Better OCR quality than Tesseract
- **Cost**: FREE tier (1,000 requests/month), then $1.50 per 1,000 images
- **How to get**:
  1. Go to https://console.cloud.google.com/
  2. Create new project
  3. Enable "Cloud Vision API"
  4. Create service account
  5. Download JSON credentials file
  6. Set path in .env: `GOOGLE_VISION_CREDENTIALS=path/to/credentials.json`
- **For Hackathon**: Skip this - use Tesseract instead (free and simpler)

---

## 📦 Software to Install

### Required Software

1. **Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop/
   - Why: Runs PostgreSQL database
   - Cost: FREE

2. **Python 3.10+**
   - Download: https://www.python.org/downloads/
   - Why: Backend is built with Python/FastAPI
   - Cost: FREE
   - ✅ You already have: Python 3.10.6

3. **Node.js 18+**
   - Download: https://nodejs.org/
   - Why: Frontend is built with React/Vite
   - Cost: FREE
   - ✅ You already have: Node v22.19.0

4. **Tesseract OCR**
   - Download: https://github.com/UB-Mannheim/tesseract/wiki
   - Why: Text extraction from images
   - Cost: FREE

---

## 💰 Cost Breakdown for Hackathon

| Service | Cost | Notes |
|---------|------|-------|
| **Anthropic Claude API** | ~$0-5 | $5 free credit, enough for 100-500 documents |
| **PostgreSQL** | FREE | Running locally via Docker |
| **Tesseract OCR** | FREE | Open source, runs locally |
| **SendGrid** | FREE | Optional, 100 emails/day free |
| **Docker Desktop** | FREE | For personal use |
| **Python** | FREE | Open source |
| **Node.js** | FREE | Open source |

**Total for Hackathon: $0** (using free tiers)

---

## 🎯 Minimum Setup (Fastest Way to Start)

You only need **3 things** to get running:

1. ✅ **Docker Desktop** - for database
2. ✅ **Tesseract OCR** - for text extraction  
3. ✅ **Anthropic API Key** - for AI extraction

Everything else is optional or already installed.

---

## 🔑 API Keys Summary

Create a file called `.env` in `docusmart-backend/` with:

```env
# Required
DATABASE_URL=postgresql://docusmart:docusmart@localhost:5432/docusmart
SECRET_KEY=<generate-random-string>
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-<your-key-here>
OCR_ENGINE=tesseract
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe

# Optional
SENDGRID_API_KEY=<leave-empty-if-not-using>
```

---

## 📝 Quick Links

- **Anthropic Console**: https://console.anthropic.com/
- **OpenAI Platform**: https://platform.openai.com/
- **Docker Desktop**: https://www.docker.com/products/docker-desktop/
- **Tesseract OCR**: https://github.com/UB-Mannheim/tesseract/wiki
- **SendGrid**: https://sendgrid.com/

---

## ⚠️ Important Notes

1. **API Keys are Secret**: Never commit them to GitHub
2. **Free Tiers**: Anthropic gives $5 credit, enough for hackathon
3. **Local First**: Database and OCR run locally (no cloud costs)
4. **No Credit Card**: You can start without any payment info using free tiers

---

## 🚀 Next Steps

1. Run `python setup.py` to configure your .env file
2. Get your Anthropic API key from console.anthropic.com
3. Install Docker Desktop and Tesseract OCR
4. Run `install.bat` to set everything up
