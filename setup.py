#!/usr/bin/env python3
"""
DocuSmart Environment Setup Script
Helps configure .env file interactively
"""

import secrets
import os
from pathlib import Path

def generate_secret_key():
    """Generate a secure random secret key"""
    return secrets.token_hex(32)

def main():
    print("=" * 60)
    print("DocuSmart Environment Setup")
    print("=" * 60)
    print()
    
    # Generate secret key
    secret_key = generate_secret_key()
    print(f"✓ Generated SECRET_KEY: {secret_key[:20]}...")
    print()
    
    # Get AI provider choice
    print("Choose AI Provider:")
    print("1. Anthropic Claude (Recommended)")
    print("2. OpenAI GPT")
    ai_choice = input("Enter choice (1 or 2): ").strip()
    
    if ai_choice == "1":
        ai_provider = "anthropic"
        print("\n📝 Get your Anthropic API key from: https://console.anthropic.com/")
        anthropic_key = input("Enter your Anthropic API key (sk-ant-...): ").strip()
        openai_key = ""
    else:
        ai_provider = "openai"
        print("\n📝 Get your OpenAI API key from: https://platform.openai.com/api-keys")
        openai_key = input("Enter your OpenAI API key (sk-...): ").strip()
        anthropic_key = ""
    
    print()
    
    # Tesseract path
    default_tesseract = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    print(f"Tesseract OCR path (press Enter for default: {default_tesseract})")
    tesseract_path = input("Path: ").strip() or default_tesseract
    
    # Create .env content
    env_content = f"""# ─── Database ───
DATABASE_URL=postgresql://docusmart:docusmart@localhost:5432/docusmart

# ─── JWT Auth ───
SECRET_KEY={secret_key}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# ─── OCR ───
OCR_ENGINE=tesseract
TESSERACT_CMD={tesseract_path}

# ─── AI Extraction ───
AI_PROVIDER={ai_provider}
ANTHROPIC_API_KEY={anthropic_key}
OPENAI_API_KEY={openai_key}

# ─── File Storage ───
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=50

# ─── Email (Optional) ───
SENDGRID_API_KEY=
FROM_EMAIL=noreply@docusmart.ai

# ─── App ───
APP_NAME=DocuSmart AI
DEBUG=true
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
"""
    
    # Write .env file
    env_path = Path("docusmart-backend/.env")
    env_path.write_text(env_content, encoding="utf-8")
    
    print()
    print("=" * 60)
    print("✅ Setup Complete!")
    print("=" * 60)
    print(f"✓ Created: {env_path}")
    print()
    print("Next Steps:")
    print("1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop/")
    print("2. Install Tesseract OCR from: https://github.com/UB-Mannheim/tesseract/wiki")
    print("3. Run: cd docusmart-backend && docker-compose up -d db")
    print("4. Run: cd docusmart-backend && pip install -r requirements.txt")
    print("5. Run: cd docusmart-backend && alembic upgrade head")
    print("6. Run: cd docusmart-backend && uvicorn app.main:app --reload")
    print()
    print("See SETUP_GUIDE.md for detailed instructions")
    print()

if __name__ == "__main__":
    main()
