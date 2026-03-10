"""MongoDB connection using pymongo."""

from pymongo import MongoClient
from app.config import settings

client: MongoClient = MongoClient(settings.MONGODB_URL)
db = client[settings.MONGODB_DB_NAME]


def get_db():
    """Return the MongoDB database instance (used as a FastAPI dependency)."""
    return db
