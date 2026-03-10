# DocuSmart AI — Smart Document Management System

> **OCR + AI Extraction + Automated Workflows**
> Hackathon MVP — 8-hour build plan

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** & **pip**
- **Node.js 18+** & **npm**
- **PostgreSQL 16** (or Docker)
- **Tesseract OCR** ([install guide](https://github.com/UB-Mannheim/tesseract/wiki))

### 1. Start Database (Docker)
```bash
cd docusmart-backend
docker compose up db -d
```

### 2. Start Backend
```bash
cd docusmart-backend
cp .env.example .env
# Edit .env with your API keys (ANTHROPIC_API_KEY or OPENAI_API_KEY)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Open **http://localhost:8000/docs** for Swagger UI.

### 3. Start Frontend
```bash
cd docusmart-frontend
npm install
npm run dev
```
Open **http://localhost:5173** for the app.

---

## 📁 Project Structure

```
HACKON2.0/
├── docusmart-backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── api/                # Route handlers (auth, documents, workflows, reports, analytics)
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Business logic (OCR, AI extraction, classification, workflows)
│   │   ├── core/               # Auth (JWT), dependencies, exceptions
│   │   ├── utils/              # Image preprocessing, PDF conversion, validators
│   │   └── main.py             # FastAPI app entry point
│   ├── alembic/                # Database migrations
│   ├── docker-compose.yml      # PostgreSQL + Backend containers
│   └── requirements.txt
│
└── docusmart-frontend/         # React + Vite frontend
    ├── src/
    │   ├── pages/              # Login, Dashboard, Documents, DocumentDetail, Workflows, Reports, Settings
    │   ├── components/         # Sidebar, DocumentCard, UploadDropzone, ExtractedFieldsPanel, SearchBar
    │   ├── hooks/              # useAuth, useDocuments, useWorkflows (React Query)
    │   ├── api/                # Axios client + API modules
    │   └── utils/              # Constants, formatters
    └── package.json
```

---

## 🔧 Tech Stack

| Layer        | Technology                    |
|-------------|-------------------------------|
| Frontend    | React 18 + Vite + Tailwind CSS |
| State       | React Query + Zustand          |
| Charts      | Recharts                       |
| Backend     | FastAPI (Python)               |
| OCR         | pytesseract / Google Vision    |
| AI          | Anthropic Claude / OpenAI GPT  |
| Database    | PostgreSQL + SQLAlchemy        |
| Auth        | JWT (python-jose + passlib)    |

---

## 🔌 API Endpoints

| Method | Endpoint                     | Description                |
|--------|------------------------------|----------------------------|
| POST   | `/auth/register`             | Create user account        |
| POST   | `/auth/login`                | Login & get tokens         |
| POST   | `/documents/upload`          | Upload & process document  |
| GET    | `/documents`                 | List documents (filtered)  |
| GET    | `/documents/{id}`            | Document detail + fields   |
| GET    | `/analytics/overview`        | Dashboard statistics       |
| GET    | `/search?q=`                 | Full-text search           |
| POST   | `/workflows`                 | Create automation workflow |
| POST   | `/reports/expense`           | Generate expense report    |

Full docs at **http://localhost:8000/docs**

---

## 🏗 Built for HACKON 2.0
