# MongoDB Setup Guide (PostgreSQL Alternative)

## 🚀 Option 1: MongoDB Atlas (Cloud - Sabse Aasan)

### Kya hai?
Free cloud MongoDB database - kuch install nahi karna

### Steps:

1. **Sign Up**:
   - https://www.mongodb.com/cloud/atlas/register pe jao
   - Email se sign up karo (ya Google/GitHub)

2. **Cluster Banao**:
   - "Build a Database" click karo
   - **M0 (Free)** select karo
   - Provider: AWS
   - Region: Mumbai (ap-south-1) - sabse fast
   - Cluster Name: `docusmart`
   - "Create" click karo

3. **Security Setup**:
   - **Username**: `docusmart`
   - **Password**: `docusmart123` (ya koi strong password)
   - "Create User" click karo
   
   - **IP Whitelist**: 
     - "Add IP Address" click karo
     - "Allow Access from Anywhere" select karo (0.0.0.0/0)
     - "Confirm" click karo

4. **Connection String Copy Karo**:
   - "Connect" button click karo
   - "Connect your application" select karo
   - Driver: Python, Version: 3.12 or later
   - Connection string copy karo:
   ```
   mongodb+srv://docusmart:<password>@docusmart.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - `<password>` ko apne actual password se replace karo

5. **Database Name Set Karo**:
   Connection string mein database name add karo:
   ```
   mongodb+srv://docusmart:docusmart123@docusmart.xxxxx.mongodb.net/docusmart?retryWrites=true&w=majority
   ```

**Free Tier**:
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Hackathon ke liye perfect

---

## 🖥️ Option 2: MongoDB Local Install

### Steps:

1. **Download**:
   - https://www.mongodb.com/try/download/community pe jao
   - Version: 7.0 (latest)
   - Platform: Windows
   - Package: MSI
   - Download karo

2. **Install**:
   - Installer run karo
   - "Complete" installation select karo
   - "Install MongoDB as a Service" check karo
   - "Install MongoDB Compass" check karo (GUI tool)
   - Install complete hone do

3. **Verify**:
   ```bash
   mongod --version
   mongo --version
   ```

4. **Connection String**:
   ```
   mongodb://localhost:27017/docusmart
   ```

**Pros**:
- ✅ Offline kaam karta hai
- ✅ Fast performance
- ✅ Unlimited storage

**Cons**:
- ❌ ~500 MB install size
- ❌ Configuration chahiye

---

## 🔧 Code Changes Required

Aapka project abhi PostgreSQL use kar raha hai. MongoDB use karne ke liye changes chahiye:

### 1. Dependencies Update

**File**: `docusmart-backend/requirements.txt`

Remove:
```
psycopg2-binary
sqlalchemy
alembic
```

Add:
```
motor==3.3.2
beanie==1.24.0
pymongo==4.6.1
```

### 2. Database Connection Update

**File**: `docusmart-backend/app/database.py`

Replace with:
```python
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
from app.models import Document, User, Workflow, AuditLog

# MongoDB client
client = None
db = None

async def connect_db():
    """Connect to MongoDB"""
    global client, db
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    db = client.get_default_database()
    
    # Initialize Beanie with document models
    await init_beanie(
        database=db,
        document_models=[Document, User, Workflow, AuditLog]
    )
    print("✓ Connected to MongoDB")

async def disconnect_db():
    """Disconnect from MongoDB"""
    global client
    if client:
        client.close()
        print("✓ Disconnected from MongoDB")

async def get_database():
    """Get database instance"""
    return db
```

### 3. Models Update

**File**: `docusmart-backend/app/models/document.py`

Replace SQLAlchemy with Beanie:
```python
from beanie import Document as BeanieDocument
from pydantic import Field
from datetime import datetime
from typing import Optional, Dict, List
from enum import Enum

class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Document(BeanieDocument):
    filename: str
    file_path: str
    file_size: int
    mime_type: str
    status: DocumentStatus = DocumentStatus.PENDING
    
    # OCR results
    extracted_text: Optional[str] = None
    
    # Classification
    document_type: Optional[str] = None
    confidence_score: Optional[float] = None
    
    # Extracted fields
    extracted_fields: Optional[Dict] = None
    
    # Metadata
    uploaded_by: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None
    
    # Workflow
    workflow_id: Optional[str] = None
    
    class Settings:
        name = "documents"  # Collection name
        indexes = [
            "uploaded_by",
            "status",
            "document_type",
            "uploaded_at",
        ]
```

### 4. Main App Update

**File**: `docusmart-backend/app/main.py`

Add startup/shutdown events:
```python
from fastapi import FastAPI
from app.database import connect_db, disconnect_db

app = FastAPI(title="DocuSmart AI")

@app.on_event("startup")
async def startup_event():
    await connect_db()

@app.on_event("shutdown")
async def shutdown_event():
    await disconnect_db()

# ... rest of your code
```

### 5. Environment Variable

**File**: `docusmart-backend/.env`

Update:
```env
# MongoDB Connection
DATABASE_URL=mongodb+srv://docusmart:docusmart123@docusmart.xxxxx.mongodb.net/docusmart?retryWrites=true&w=majority

# Or for local:
# DATABASE_URL=mongodb://localhost:27017/docusmart
```

---

## 🤔 PostgreSQL vs MongoDB - Kaunsa Better?

### PostgreSQL (Current)
**Pros**:
- ✅ Structured data
- ✅ ACID transactions
- ✅ Complex queries
- ✅ Relationships between tables
- ✅ Better for financial/audit data

**Cons**:
- ❌ Schema changes difficult
- ❌ Less flexible

### MongoDB
**Pros**:
- ✅ Flexible schema
- ✅ Easy to change structure
- ✅ Good for JSON data
- ✅ Fast for document storage
- ✅ Cloud setup easier (Atlas)

**Cons**:
- ❌ No built-in relationships
- ❌ Complex queries harder

---

## 💡 Recommendation

### Aapke Project ke liye:

**PostgreSQL hi use karo** kyunki:
1. ✅ Aapka code already PostgreSQL ke liye ready hai
2. ✅ Document management mein relationships important hain
3. ✅ Audit logs ke liye ACID transactions chahiye
4. ✅ Workflow tracking structured data hai

**MongoDB tabhi use karo agar**:
- Aapko schema frequently change karna hai
- Aapko sirf document storage chahiye (no complex queries)
- Aapko Atlas ka free tier use karna hai (setup easy hai)

---

## 🚀 Quick MongoDB Atlas Setup (Agar Use Karna Hai)

Agar aap MongoDB use karna chahte ho, main ek automated script bana deta hoon:

```bash
python setup-mongodb.py
```

Ye script:
1. MongoDB Atlas connection string maangega
2. Dependencies install karega
3. Code update karega
4. Database test karega

---

## ⚠️ Important Note

**Recommendation**: Hackathon ke liye **PostgreSQL hi use karo** kyunki:
- Aapka code already ready hai
- Migration mein time waste hoga
- PostgreSQL bhi cloud options hai (Neon, Supabase)
- PostgreSQL aapke use case ke liye better hai

Agar phir bhi MongoDB chahiye, to main pura migration script bana sakta hoon! 🚀
