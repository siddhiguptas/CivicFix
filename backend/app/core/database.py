"""
Database configuration and connection management
"""

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Global database client
client: AsyncIOMotorClient = None
database = None


async def connect_to_mongo():
    """Create database connection"""
    global client, database
    
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        
        # Extract database name from URI or use default
        if settings.DATABASE_NAME:
            database = client[settings.DATABASE_NAME]
        else:
            # Extract database name from URI
            from urllib.parse import urlparse
            parsed_uri = urlparse(settings.MONGODB_URL)
            db_name = parsed_uri.path.lstrip('/') or 'civic_connect'
            database = client[db_name]
        
        # Test the connection
        await client.admin.command('ping')
        logger.info("✅ Successfully connected to MongoDB!")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close database connection"""
    global client
    if client:
        client.close()
        logger.info("🔌 MongoDB connection closed")


async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Users collection indexes
        await database.users.create_index([("email", 1)], unique=True)
        await database.users.create_index([("phone", 1)], unique=True, sparse=True)
        
        # Grievances collection indexes
        await database.grievances.create_index([("citizen_id", 1)])
        await database.grievances.create_index([("status", 1)])
        await database.grievances.create_index([("category", 1)])
        await database.grievances.create_index([("priority", 1)])
        await database.grievances.create_index([("created_at", 1)])
        await database.grievances.create_index([("location.coordinates", "2dsphere")])
        
        # Notifications collection indexes
        await database.notifications.create_index([("user_id", 1)])
        await database.notifications.create_index([("created_at", 1)])
        
        # Departments collection indexes
        await database.departments.create_index([("name", 1)], unique=True)
        
        logger.info("📊 Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"❌ Error creating indexes: {e}")


def get_database():
    """Get database instance"""
    return database


def get_collection(collection_name: str):
    """Get collection instance"""
    return database[collection_name]
