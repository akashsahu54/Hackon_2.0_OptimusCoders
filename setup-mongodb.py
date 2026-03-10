#!/usr/bin/env python3
"""
MongoDB Setup Script for DocuSmart
Converts PostgreSQL setup to MongoDB
"""

import os
import sys
from pathlib import Path

def main():
    print("=" * 60)
    print("DocuSmart MongoDB Setup")
    print("=" * 60)
    print()
    
    print("⚠️  WARNING: This will convert your project from PostgreSQL to MongoDB")
    print("This requires significant code changes.")
    print()
    
    choice = input("Do you want to continue? (yes/no): ").strip().lower()
    if choice != "yes":
        print("Setup cancelled.")
        return
    
    print()
    print("Choose MongoDB option:")
    print("1. MongoDB Atlas (Cloud - Free)")
    print("2. MongoDB Local (Install required)")
    
    option = input("Enter choice (1 or 2): ").strip()
    
    if option == "1":
        print()
        print("=" * 60)
        print("MongoDB Atlas Setup")
        print("=" * 60)
        print()
        print("Steps:")
        print("1. Go to: https://www.mongodb.com/cloud/atlas/register")
        print("2. Sign up and create a FREE cluster (M0)")
        print("3. Create database user: docusmart / docusmart123")
        print("4. Whitelist IP: 0.0.0.0/0 (Allow from anywhere)")
        print("5. Get connection string")
        print()
        
        connection_string = input("Enter MongoDB Atlas connection string: ").strip()
        
        if not connection_string.startswith("mongodb+srv://"):
            print("❌ Invalid connection string. Should start with mongodb+srv://")
            return
            
    else:
        print()
        print("Using local MongoDB")
        connection_string = "mongodb://localhost:27017/docusmart"
        print(f"Connection string: {connection_string}")
    
    # Update .env file
    env_path = Path("docusmart-backend/.env")
    
    if env_path.exists():
        with open(env_path, 'r') as f:
            content = f.read()
        
        # Replace DATABASE_URL
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            if line.startswith('DATABASE_URL='):
                new_lines.append(f'DATABASE_URL={connection_string}')
            else:
                new_lines.append(line)
        
        with open(env_path, 'w') as f:
            f.write('\n'.join(new_lines))
        
        print(f"✓ Updated {env_path}")
    else:
        print(f"❌ .env file not found at {env_path}")
        return
    
    print()
    print("=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print()
    print("1. Update requirements.txt:")
    print("   Remove: psycopg2-binary, sqlalchemy, alembic")
    print("   Add: motor, beanie, pymongo")
    print()
    print("2. Update database.py to use Motor/Beanie")
    print("3. Update all models to use Beanie Document")
    print("4. Update API routes to use async MongoDB queries")
    print()
    print("See MONGODB_SETUP.md for detailed code changes.")
    print()
    print("⚠️  RECOMMENDATION: For hackathon, stick with PostgreSQL!")
    print("   Use Neon.tech for easy cloud PostgreSQL setup.")
    print()

if __name__ == "__main__":
    main()
