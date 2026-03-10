"""MongoDB connection using pymongo — lazy initialization."""

from pymongo import MongoClient
from app.config import settings

_client: MongoClient = None
_db = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,   # 5s timeout instead of hanging
            connectTimeoutMS=5000,
        )
    return _client


def get_db():
    """Return the MongoDB database instance (used as a FastAPI dependency)."""
    global _db
    if _db is None:
        _db = get_client()[settings.MONGODB_DB_NAME]
    return _db
